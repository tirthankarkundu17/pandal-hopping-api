package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"tirthankarkundu17/pandal-hopping-api/internal/models"
)

// PandalRepository defines the interface for database operations
type PandalRepository interface {
	Create(ctx context.Context, pandal models.Pandal) (*mongo.InsertOneResult, error)
	FindAll(ctx context.Context, filter bson.M) ([]models.Pandal, error)
}

// pandalRepository implements the PandalRepository interface
type pandalRepository struct {
	collection *mongo.Collection
}

// NewPandalRepository creates a new instance of the repository
func NewPandalRepository(collection *mongo.Collection) PandalRepository {
	return &pandalRepository{
		collection: collection,
	}
}

// Create inserts a new pandal into the database
func (r *pandalRepository) Create(ctx context.Context, pandal models.Pandal) (*mongo.InsertOneResult, error) {
	result, err := r.collection.InsertOne(ctx, pandal)
	if err != nil {
		return nil, err
	}
	// We need to assert the type properly or return the interface{}
	// Since InsertOne returns *mongo.InsertOneResult, it works perfectly.
	return result, nil
}

// FindAll retrieves pandals based on a given filter
func (r *pandalRepository) FindAll(ctx context.Context, filter bson.M) ([]models.Pandal, error) {
	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var pandals []models.Pandal
	for cursor.Next(ctx) {
		var pandal models.Pandal
		if err := cursor.Decode(&pandal); err != nil {
			return nil, err
		}
		pandals = append(pandals, pandal)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	if pandals == nil {
		pandals = []models.Pandal{}
	}

	return pandals, nil
}
