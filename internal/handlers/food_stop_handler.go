package handlers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"tirthankarkundu17/pandal-hopping-api/internal/models"
	"tirthankarkundu17/pandal-hopping-api/internal/services"
)

// FoodStopHandler handles HTTP requests for food stops
type FoodStopHandler struct {
	service services.FoodStopService
}

// NewFoodStopHandler creates a new handler instance
func NewFoodStopHandler(service services.FoodStopService) *FoodStopHandler {
	return &FoodStopHandler{service: service}
}

// GetFoodStops returns food stops, optionally filtered by proximity
// GET /food/?lat=&lng=&radius=
func (h *FoodStopHandler) GetFoodStops() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		lngStr := c.Query("lng")
		latStr := c.Query("lat")
		radiusStr := c.Query("radius")

		var hasCoords bool
		var lng, lat, radius float64

		if lngStr != "" && latStr != "" {
			var err1, err2 error
			lng, err1 = strconv.ParseFloat(lngStr, 64)
			lat, err2 = strconv.ParseFloat(latStr, 64)
			if err1 != nil || err2 != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid lng or lat coordinates"})
				return
			}
			hasCoords = true
			if radiusStr != "" {
				if r, err := strconv.ParseFloat(radiusStr, 64); err == nil {
					radius = r
				}
			}
		} else if lngStr != "" || latStr != "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Both lng and lat are required for proximity search"})
			return
		}

		stops, err := h.service.GetFoodStops(ctx, lng, lat, radius, hasCoords)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": stops})
	}
}

// GetFoodStopByID returns a single food stop by ID
// GET /food/:id
func (h *FoodStopHandler) GetFoodStopByID() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		objID, err := primitive.ObjectIDFromHex(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid food stop ID"})
			return
		}

		stop, err := h.service.GetFoodStopByID(ctx, objID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Food stop not found"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": stop})
	}
}

// CreateFoodStop inserts a new food stop (admin only)
// POST /food/
func (h *FoodStopHandler) CreateFoodStop() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		var stop models.FoodStop
		if err := c.ShouldBindJSON(&stop); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		result, err := h.service.CreateFoodStop(ctx, stop)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "Food stop created", "data": result})
	}
}
