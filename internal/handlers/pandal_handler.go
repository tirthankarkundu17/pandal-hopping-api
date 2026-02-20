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

// PandalHandler handles all HTTP requests for pandals
type PandalHandler struct {
	service services.PandalService
}

// NewPandalHandler instances the handler
func NewPandalHandler(service services.PandalService) *PandalHandler {
	return &PandalHandler{
		service: service,
	}
}

// CreatePandal is the Gin handler to insert a new pandal
func (h *PandalHandler) CreatePandal() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		var pandal models.Pandal

		if err := c.ShouldBindJSON(&pandal); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		result, err := h.service.CreatePandal(ctx, pandal)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while inserting data: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Pandal inserted", "data": result})
	}
}

// GetAllPandals handles geospatial mapping search of pandals
func (h *PandalHandler) GetAllPandals() gin.HandlerFunc {
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
				r, err := strconv.ParseFloat(radiusStr, 64)
				if err == nil {
					radius = r
				}
			}
		} else if lngStr != "" || latStr != "" {
			// If only one is provided, flag it as a bad request
			c.JSON(http.StatusBadRequest, gin.H{"error": "Both lng and lat query parameters are required for a geospatial search"})
			return
		}

		pandals, err := h.service.GetPandals(ctx, lng, lat, radius, hasCoords)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"data": pandals})
	}
}

// GetPendingPandals handles geospatial mapping search of pandals awaiting approval
func (h *PandalHandler) GetPendingPandals() gin.HandlerFunc {
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
				r, err := strconv.ParseFloat(radiusStr, 64)
				if err == nil {
					radius = r
				}
			}
		} else if lngStr != "" || latStr != "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Both lng and lat query parameters are required for a geospatial search"})
			return
		}

		pandals, err := h.service.GetPendingPandals(ctx, lng, lat, radius, hasCoords)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"data": pandals})
	}
}

// ApprovePandal handles the consensus increment
func (h *PandalHandler) ApprovePandal() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		idParam := c.Param("id")
		objID, err := primitive.ObjectIDFromHex(idParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Pandal ID format"})
			return
		}

		var reqBody struct {
			ApproverID string `json:"approverID" binding:"required"`
		}

		if err := c.ShouldBindJSON(&reqBody); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "approverID is required in the request body"})
			return
		}

		pandal, err := h.service.ApprovePandal(ctx, objID, reqBody.ApproverID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error approving pandal: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Pandal approval registered",
			"data":    pandal,
		})
	}
}
