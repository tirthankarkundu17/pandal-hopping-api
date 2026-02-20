package migrations

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// RunMigrations executes all necessary migrations/index creations for the database
func RunMigrations(collection *mongo.Collection) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	log.Println("Running migrations...")

	// Create 2dsphere index on the location field
	indexModel := mongo.IndexModel{
		Keys: bson.M{
			"location": "2dsphere",
		},
		Options: options.Index().SetName("location_2dsphere_index"),
	}

	indexName, err := collection.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		log.Fatalf("Failed to create geospatial index: %v", err)
	}

	log.Printf("Migration successful: Created index %s\n", indexName)
}
