package services

import (
	"context"
	"strconv"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"tirthankarkundu17/pandal-hopping-api/internal/models"
	"tirthankarkundu17/pandal-hopping-api/internal/repository"
)

// FoodStopService defines business logic for food stops
type FoodStopService interface {
	CreateFoodStop(ctx context.Context, stop models.FoodStop) (*models.FoodStop, error)
	GetFoodStops(ctx context.Context, lng, lat, radius float64, hasCoords bool) ([]models.FoodStop, error)
	GetFoodStopByID(ctx context.Context, id primitive.ObjectID) (*models.FoodStop, error)
}

type foodStopService struct {
	repo repository.FoodStopRepository
}

// NewFoodStopService creates a new service instance
func NewFoodStopService(repo repository.FoodStopRepository) FoodStopService {
	return &foodStopService{repo: repo}
}

func (s *foodStopService) CreateFoodStop(ctx context.Context, stop models.FoodStop) (*models.FoodStop, error) {
	stop.ID = primitive.NewObjectID()
	_, err := s.repo.Create(ctx, stop)
	if err != nil {
		return nil, err
	}
	return &stop, nil
}

func (s *foodStopService) GetFoodStops(ctx context.Context, lng, lat, radius float64, hasCoords bool) ([]models.FoodStop, error) {
	filter := bson.M{}
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
				"$maxDistance": radius,
			},
		}
	}
	return s.repo.FindAll(ctx, filter)
}

func (s *foodStopService) GetFoodStopByID(ctx context.Context, id primitive.ObjectID) (*models.FoodStop, error) {
	return s.repo.FindByID(ctx, id)
}

// parseFloat is a helper used by the handler
func parseFloat(s string) (float64, error) {
	return strconv.ParseFloat(s, 64)
}
