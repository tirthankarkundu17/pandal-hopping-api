package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Client

const (
	MAX_RETRIES = 5
)

// ConnectDB establishes the connection to MongoDB with retry logic
func ConnectDB() *mongo.Client {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("MONGO_URI environment variable not set")
	}

	clientOptions := options.Client().
		ApplyURI(mongoURI).
		SetServerSelectionTimeout(5 * time.Second).
		SetMinPoolSize(2).
		SetMaxPoolSize(20)

	var client *mongo.Client
	var err error

	// Retry loop for initial connection (handles Docker/k8s startup races)
	for i := 1; i <= MAX_RETRIES; i++ {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		client, err = mongo.Connect(ctx, clientOptions)
		if err == nil {
			err = client.Ping(ctx, nil)
		}
		cancel()

		if err == nil {
			break
		}
		log.Printf("MongoDB connection attempt %d/%d failed: %v. Retrying in 3s...", i, MAX_RETRIES, err)
		time.Sleep(3 * time.Second)
	}

	if err != nil {
		log.Fatalf("Could not connect to MongoDB after %d attempts: %v", MAX_RETRIES, err)
	}

	fmt.Println("Connected to MongoDB!")
	DB = client
	return client
}

// GetCollection gets database collection
func GetCollection(client *mongo.Client, collectionName string) *mongo.Collection {
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		log.Fatal("DB_NAME environment variable not set")
	}
	collection := client.Database(dbName).Collection(collectionName)
	return collection
}
