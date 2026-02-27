package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"tirthankarkundu17/pandal-hopping-api/internal/models"
	"tirthankarkundu17/pandal-hopping-api/internal/services"
)

// RouteHandler handles HTTP requests for curated routes
type RouteHandler struct {
	service services.RouteService
}

// NewRouteHandler creates a new handler instance
func NewRouteHandler(service services.RouteService) *RouteHandler {
	return &RouteHandler{service: service}
}

// GetRoutes returns all curated routes
// GET /routes/
func (h *RouteHandler) GetRoutes() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		routes, err := h.service.GetRoutes(ctx)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": routes})
	}
}

// GetRouteByID returns a single route by ID
// GET /routes/:id
func (h *RouteHandler) GetRouteByID() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		objID, err := primitive.ObjectIDFromHex(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid route ID"})
			return
		}

		route, err := h.service.GetRouteByID(ctx, objID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": route})
	}
}

// CreateRoute inserts a new curated route (admin only)
// POST /routes/
func (h *RouteHandler) CreateRoute() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		var route models.Route
		if err := c.ShouldBindJSON(&route); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		result, err := h.service.CreateRoute(ctx, route)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "Route created", "data": result})
	}
}
