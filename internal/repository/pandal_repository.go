package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"tirthankarkundu17/pandal-hopping-api/internal/models"
)

// PandalRepository defines the interface for database operations
type PandalRepository interface {
	Create(ctx context.Context, pandal models.Pandal) (*mongo.InsertOneResult, error)
	FindAll(ctx context.Context, filter bson.M) ([]models.Pandal, error)
	FindByID(ctx context.Context, id primitive.ObjectID) (*models.Pandal, error)
	Update(ctx context.Context, id primitive.ObjectID, update bson.M) (*mongo.UpdateResult, error)
	AggregateDistricts(ctx context.Context, country, state string) ([]models.District, error)
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

// FindByID retrieves a pandal by its ID
func (r *pandalRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Pandal, error) {
	var pandal models.Pandal
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&pandal)
	if err != nil {
		return nil, err
	}
	return &pandal, nil
}

// Update amends a pandal document by its ID
func (r *pandalRepository) Update(ctx context.Context, id primitive.ObjectID, update bson.M) (*mongo.UpdateResult, error) {
	return r.collection.UpdateOne(ctx, bson.M{"_id": id}, update)
}

// AggregateDistricts groups approved pandals by district and returns counts
func (r *pandalRepository) AggregateDistricts(ctx context.Context, country, state string) ([]models.District, error) {
	matchStage := bson.M{
		"status":   "approved",
		"district": bson.M{"$ne": ""},
	}
	if country != "" {
		matchStage["country"] = country
	}
	if state != "" {
		matchStage["state"] = state
	}

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: matchStage}},
		{{Key: "$group", Value: bson.M{
			"_id":         "$district",
			"pandalCount": bson.M{"$sum": 1},
		}}},
		{{Key: "$sort", Value: bson.M{"pandalCount": -1}}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var districts []models.District
	if err := cursor.All(ctx, &districts); err != nil {
		return nil, err
	}
	if districts == nil {
		districts = []models.District{}
	}
	return districts, nil
}
