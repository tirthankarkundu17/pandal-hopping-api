package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"tirthankarkundu17/pandal-hopping-api/internal/models"
)

// RouteRepository defines database operations for routes
type RouteRepository interface {
	Create(ctx context.Context, route models.Route) (*mongo.InsertOneResult, error)
	FindAll(ctx context.Context) ([]models.Route, error)
	FindByID(ctx context.Context, id primitive.ObjectID) (*models.Route, error)
}

type routeRepository struct {
	collection       *mongo.Collection
	pandalCollection *mongo.Collection
}

// NewRouteRepository creates a new instance
func NewRouteRepository(collection *mongo.Collection, pandalCollection *mongo.Collection) RouteRepository {
	return &routeRepository{
		collection:       collection,
		pandalCollection: pandalCollection,
	}
}

func (r *routeRepository) Create(ctx context.Context, route models.Route) (*mongo.InsertOneResult, error) {
	return r.collection.InsertOne(ctx, route)
}

func (r *routeRepository) FindAll(ctx context.Context) ([]models.Route, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var routes []models.Route
	if err := cursor.All(ctx, &routes); err != nil {
		return nil, err
	}
	if routes == nil {
		routes = []models.Route{}
	}
	return routes, nil
}

func (r *routeRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Route, error) {
	var route models.Route
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&route)
	if err != nil {
		return nil, err
	}
	return &route, nil
}
