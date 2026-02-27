package services

import (
	"context"
	"errors"
	"os"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"tirthankarkundu17/pandal-hopping-api/internal/models"
	"tirthankarkundu17/pandal-hopping-api/internal/repository"
)

// PandalService defines the business logic interface
type PandalService interface {
	CreatePandal(ctx context.Context, pandal models.Pandal) (*mongo.InsertOneResult, error)
	GetPandals(ctx context.Context, lng, lat, radius float64, hasCoords bool, tag, search string) ([]models.Pandal, error)
	GetPendingPandals(ctx context.Context, lng, lat, radius float64, hasCoords bool, excludeUserID string) ([]models.Pandal, error)
	GetDistricts(ctx context.Context) ([]models.District, error)
	ApprovePandal(ctx context.Context, id primitive.ObjectID, approverID string) (*models.Pandal, error)
}

// pandalService implements PandalService interface
type pandalService struct {
	repo repository.PandalRepository
}

// NewPandalService creates a new service instance
func NewPandalService(repo repository.PandalRepository) PandalService {
	return &pandalService{
		repo: repo,
	}
}

// CreatePandal performs business logic before insertion
func (s *pandalService) CreatePandal(ctx context.Context, pandal models.Pandal) (*mongo.InsertOneResult, error) {
	// Ensure proper default values for creation
	if pandal.Images == nil {
		pandal.Images = []string{}
	}
	if pandal.CreatedAt.IsZero() {
		pandal.CreatedAt = time.Now()
	}

	pandal.Status = models.StatusPending
	pandal.ApprovalCount = 0
	pandal.ApprovedBy = []string{}
	pandal.ID = primitive.NewObjectID()

	return s.repo.Create(ctx, pandal)
}

func (s *pandalService) buildGeospatialFilter(status models.PandalStatus, lng, lat, radius float64, hasCoords bool, tag, search string) bson.M {
	filter := bson.M{"status": status}

	if hasCoords {
		if radius <= 0 {
			radius = 5000.0
		}
		filter["location"] = bson.M{
			"$nearSphere": bson.M{
				"$geometry": bson.M{
					"type":        "Point",
					"coordinates": []float64{lng, lat},
				},
				"$maxDistance": radius, // in meters
			},
		}
	}

	// Tag filter — matches any pandal whose Tags array contains the given tag
	if tag != "" {
		filter["tags"] = bson.M{"$in": []string{tag}}
	}

	// Text search — case-insensitive regex across name, area, and district
	if search != "" {
		filter["$or"] = []bson.M{
			{"name": bson.M{"$regex": search, "$options": "i"}},
			{"area": bson.M{"$regex": search, "$options": "i"}},
			{"district": bson.M{"$regex": search, "$options": "i"}},
		}
	}

	return filter
}

// GetPandals returns only approved pandals, with optional tag and text search filters
func (s *pandalService) GetPandals(ctx context.Context, lng, lat, radius float64, hasCoords bool, tag, search string) ([]models.Pandal, error) {
	filter := s.buildGeospatialFilter(models.StatusApproved, lng, lat, radius, hasCoords, tag, search)
	return s.repo.FindAll(ctx, filter)
}

// GetPendingPandals returns pandals waiting for approval
func (s *pandalService) GetPendingPandals(ctx context.Context, lng, lat, radius float64, hasCoords bool, excludeUserID string) ([]models.Pandal, error) {
	filter := s.buildGeospatialFilter(models.StatusPending, lng, lat, radius, hasCoords, "", "")

	if excludeUserID != "" {
		filter["createdBy"] = bson.M{"$ne": excludeUserID}
	}

	// Also exclude pandals the user has already approved
	if excludeUserID != "" {
		filter["approvedBy"] = bson.M{"$ne": excludeUserID}
	}

	return s.repo.FindAll(ctx, filter)
}

// GetDistricts aggregates approved pandals grouped by district
func (s *pandalService) GetDistricts(ctx context.Context) ([]models.District, error) {
	return s.repo.AggregateDistricts(ctx)
}

// ApprovePandal increments the approval count and updates status to approved if consensus is met
func (s *pandalService) ApprovePandal(ctx context.Context, id primitive.ObjectID, approverID string) (*models.Pandal, error) {
	pandal, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// If already approved, skip
	if pandal.Status == models.StatusApproved {
		return pandal, nil
	}

	// Validate this user hasn't already approved the pandal
	for _, user := range pandal.ApprovedBy {
		if user == approverID {
			return nil, errors.New("user has already approved this pandal")
		}
	}

	newCount := pandal.ApprovalCount + 1
	status := pandal.Status
	approvedBy := append(pandal.ApprovedBy, approverID)

	// Set required threshold for approval from environment variables, defaulting to 3
	reqApprovalsStr := os.Getenv("REQUIRED_APPROVALS")
	reqApprovals := 3
	if reqApprovalsStr != "" {
		if val, err := strconv.Atoi(reqApprovalsStr); err == nil {
			reqApprovals = val
		}
	}

	if newCount >= reqApprovals {
		status = models.StatusApproved
	}

	update := bson.M{
		"$set": bson.M{
			"approvalCount": newCount,
			"status":        status,
			"approvedBy":    approvedBy,
		},
	}

	_, err = s.repo.Update(ctx, id, update)
	if err != nil {
		return nil, err
	}

	pandal.ApprovalCount = newCount
	pandal.Status = status
	pandal.ApprovedBy = approvedBy

	return pandal, nil
}
