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
func RunMigrations(pandalCollection *mongo.Collection, foodStopCollection *mongo.Collection) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	log.Println("Running migrations...")

	// Pandal collection indexes
	pandalIndexes := []mongo.IndexModel{
		{
			Keys:    bson.M{"location": "2dsphere"},
			Options: options.Index().SetName("location_2dsphere_index"),
		},
		{
			Keys:    bson.M{"area": 1},
			Options: options.Index().SetName("area_index"),
		},
		{
			Keys:    bson.M{"district": 1},
			Options: options.Index().SetName("district_index"),
		},
		{
			Keys:    bson.M{"tags": 1},
			Options: options.Index().SetName("tags_index"),
		},
	}

	pandalIndexNames, err := pandalCollection.Indexes().CreateMany(ctx, pandalIndexes)
	if err != nil {
		log.Fatalf("Failed to create pandal indexes: %v", err)
	}
	log.Printf("Pandal indexes created: %v", pandalIndexNames)

	// Food stop collection indexes
	foodIndexes := []mongo.IndexModel{
		{
			Keys:    bson.M{"location": "2dsphere"},
			Options: options.Index().SetName("food_location_2dsphere_index"),
		},
	}

	foodIndexNames, err := foodStopCollection.Indexes().CreateMany(ctx, foodIndexes)
	if err != nil {
		log.Fatalf("Failed to create food stop indexes: %v", err)
	}
	log.Printf("Food stop indexes created: %v", foodIndexNames)

	log.Println("Migration complete.")
}
