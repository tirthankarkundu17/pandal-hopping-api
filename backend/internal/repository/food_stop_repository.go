package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"tirthankarkundu17/pandal-hopping-api/internal/models"
)

// FoodStopRepository defines database operations for food stops
type FoodStopRepository interface {
	Create(ctx context.Context, stop models.FoodStop) (*mongo.InsertOneResult, error)
	FindAll(ctx context.Context, filter bson.M) ([]models.FoodStop, error)
	FindByID(ctx context.Context, id primitive.ObjectID) (*models.FoodStop, error)
}

type foodStopRepository struct {
	collection *mongo.Collection
}

// NewFoodStopRepository creates a new instance
func NewFoodStopRepository(collection *mongo.Collection) FoodStopRepository {
	return &foodStopRepository{collection: collection}
}

func (r *foodStopRepository) Create(ctx context.Context, stop models.FoodStop) (*mongo.InsertOneResult, error) {
	return r.collection.InsertOne(ctx, stop)
}

func (r *foodStopRepository) FindAll(ctx context.Context, filter bson.M) ([]models.FoodStop, error) {
	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var stops []models.FoodStop
	if err := cursor.All(ctx, &stops); err != nil {
		return nil, err
	}
	if stops == nil {
		stops = []models.FoodStop{}
	}
	return stops, nil
}

func (r *foodStopRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.FoodStop, error) {
	var stop models.FoodStop
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&stop)
	if err != nil {
		return nil, err
	}
	return &stop, nil
}
