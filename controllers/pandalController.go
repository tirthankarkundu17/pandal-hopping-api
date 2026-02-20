package controllers

import (
	"context"
	"net/http"
	"strconv"
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

// GetAllPandals handler for retrieving all pandals optionally filtered by proximity
func (pc *PandalController) GetAllPandals() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		var pandals []models.Pandal
		filter := bson.M{}

		lngStr := c.Query("lng")
		latStr := c.Query("lat")
		radiusStr := c.Query("radius")

		// If coordinates are provided, perform geospatial search
		if lngStr != "" && latStr != "" {
			lng, err1 := strconv.ParseFloat(lngStr, 64)
			lat, err2 := strconv.ParseFloat(latStr, 64)

			if err1 != nil || err2 != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid lng or lat coordinates"})
				return
			}

			// Default radius to 5000 meters (5km) if not provided
			radius := 5000.0
			if radiusStr != "" {
				r, err := strconv.ParseFloat(radiusStr, 64)
				if err == nil {
					radius = r
				}
			}

			filter["location"] = bson.M{
				"$nearSphere": bson.M{
					"$geometry": bson.M{
						"type":        "Point",
						"coordinates": []float64{lng, lat},
					},
					"$maxDistance": radius, // in meters
				},
			}
		} else if lngStr != "" || latStr != "" {
			// If only one is provided, flag it as a bad request
			c.JSON(http.StatusBadRequest, gin.H{"error": "Both lng and lat query parameters are required for a geospatial search"})
			return
		}

		cursor, err := pc.collection.Find(ctx, filter)
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
