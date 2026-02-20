package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"tirthankarkundu17/pandal-hopping-api/models"
)

// PandalController defines handlers for Pandal entities
type PandalController struct {
	collection *mongo.Collection
}

// NewPandalController creates a new PandalController
func NewPandalController(collection *mongo.Collection) *PandalController {
	return &PandalController{
		collection: collection,
	}
}

// CreatePandal handler for inserting a new pandal
func (pc *PandalController) CreatePandal() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		var pandal models.Pandal

		// validate the request body
		if err := c.ShouldBindJSON(&pandal); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Ensure proper default values for creation
		if pandal.Images == nil {
			pandal.Images = []string{}
		}
		if pandal.CreatedAt.IsZero() {
			pandal.CreatedAt = time.Now()
		}

		newPandal := models.Pandal{
			ID:          primitive.NewObjectID(),
			Name:        pandal.Name,
			Description: pandal.Description,
			Area:        pandal.Area,
			Theme:       pandal.Theme,
			Location:    pandal.Location,
			Images:      pandal.Images,
			RatingAvg:   pandal.RatingAvg,
			RatingCount: pandal.RatingCount,
			CreatedAt:   pandal.CreatedAt,
		}

		result, err := pc.collection.InsertOne(ctx, newPandal)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while inserting data: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Pandal inserted", "data": result})
	}
}

// GetAllPandals handler for retrieving all pandals
func (pc *PandalController) GetAllPandals() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		var pandals []models.Pandal

		cursor, err := pc.collection.Find(ctx, bson.M{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer cursor.Close(ctx)

		for cursor.Next(ctx) {
			var pandal models.Pandal
			if err := cursor.Decode(&pandal); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			pandals = append(pandals, pandal)
		}

		if err := cursor.Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if pandals == nil {
			pandals = []models.Pandal{}
		}

		c.JSON(http.StatusOK, gin.H{"data": pandals})
	}
}
