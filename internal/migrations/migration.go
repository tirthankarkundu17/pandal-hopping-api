package migrations

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// RunMigrations executes all necessary index creations
func RunMigrations(collection *mongo.Collection) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	log.Println("Running migrations...")

	indexModels := []mongo.IndexModel{
		{
			Keys: bson.M{
				"location": "2dsphere",
			},
			Options: options.Index().SetName("location_2dsphere_index"),
		},
		{
			Keys: bson.M{
				"area": 1,
			},
			Options: options.Index().SetName("area_index"),
		},
	}

	indexNames, err := collection.Indexes().CreateMany(ctx, indexModels)
	if err != nil {
		log.Fatalf("Failed to create indexes: %v", err)
	}

	log.Printf("Migration successful: Created indexes %v\n", indexNames)
}
