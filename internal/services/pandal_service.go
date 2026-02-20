package services

import (
	"context"
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

	pandal.ID = primitive.NewObjectID()

	return s.repo.Create(ctx, pandal)
}

// GetPandals forms the filter constraint given search query params
func (s *pandalService) GetPandals(ctx context.Context, lng, lat, radius float64, hasCoords bool) ([]models.Pandal, error) {
	filter := bson.M{}

	// If coordinates are provided, perform geospatial search
	if hasCoords {
		// Default radius to 5000 meters (5km) if not provided
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

	return s.repo.FindAll(ctx, filter)
}
