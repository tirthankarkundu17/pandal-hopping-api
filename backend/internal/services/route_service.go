package services

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"tirthankarkundu17/pandal-hopping-api/internal/models"
	"tirthankarkundu17/pandal-hopping-api/internal/repository"
)

// RouteService defines business logic for curated routes
type RouteService interface {
	CreateRoute(ctx context.Context, route models.Route) (*models.Route, error)
	GetRoutes(ctx context.Context) ([]models.Route, error)
	GetRouteByID(ctx context.Context, id primitive.ObjectID) (*models.Route, error)
}

type routeService struct {
	repo repository.RouteRepository
}

// NewRouteService creates a new service instance
func NewRouteService(repo repository.RouteRepository) RouteService {
	return &routeService{repo: repo}
}

func (s *routeService) CreateRoute(ctx context.Context, route models.Route) (*models.Route, error) {
	route.ID = primitive.NewObjectID()
	route.CreatedAt = time.Now()
	if route.Stops == nil {
		route.Stops = []primitive.ObjectID{}
	}
	route.StopCount = len(route.Stops)

	_, err := s.repo.Create(ctx, route)
	if err != nil {
		return nil, err
	}
	return &route, nil
}

func (s *routeService) GetRoutes(ctx context.Context) ([]models.Route, error) {
	return s.repo.FindAll(ctx)
}

func (s *routeService) GetRouteByID(ctx context.Context, id primitive.ObjectID) (*models.Route, error) {
	return s.repo.FindByID(ctx, id)
}
