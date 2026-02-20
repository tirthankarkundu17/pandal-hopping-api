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
	GetPandals(ctx context.Context, lng, lat, radius float64, hasCoords bool) ([]models.Pandal, error)
	GetPendingPandals(ctx context.Context, lng, lat, radius float64, hasCoords bool) ([]models.Pandal, error)
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

	pandal.Status = "pending"
	pandal.ApprovalCount = 0
	pandal.ApprovedBy = []string{}
	pandal.ID = primitive.NewObjectID()

	return s.repo.Create(ctx, pandal)
}

func (s *pandalService) buildGeospatialFilter(status string, lng, lat, radius float64, hasCoords bool) bson.M {
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
	return filter
}

// GetPandals returns only approved pandals
func (s *pandalService) GetPandals(ctx context.Context, lng, lat, radius float64, hasCoords bool) ([]models.Pandal, error) {
	filter := s.buildGeospatialFilter("approved", lng, lat, radius, hasCoords)
	return s.repo.FindAll(ctx, filter)
}

// GetPendingPandals returns pandals waiting for approval
func (s *pandalService) GetPendingPandals(ctx context.Context, lng, lat, radius float64, hasCoords bool) ([]models.Pandal, error) {
	filter := s.buildGeospatialFilter("pending", lng, lat, radius, hasCoords)
	return s.repo.FindAll(ctx, filter)
}

// ApprovePandal increments the approval count and updates status to approved if consensus is met
func (s *pandalService) ApprovePandal(ctx context.Context, id primitive.ObjectID, approverID string) (*models.Pandal, error) {
	pandal, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// If already approved, skip
	if pandal.Status == "approved" {
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
		status = "approved"
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
