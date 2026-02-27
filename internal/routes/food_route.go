package routes

import (
	"tirthankarkundu17/pandal-hopping-api/internal/handlers"
	"tirthankarkundu17/pandal-hopping-api/internal/middleware"

	"github.com/gin-gonic/gin"
)

// FoodRoute defines endpoints for food stops
func FoodRoute(router *gin.RouterGroup, handler *handlers.FoodStopHandler) {
	r := router.Group("/food", middleware.AuthMiddleware())
	{
		r.GET("/", handler.GetFoodStops())
		r.GET("/:id", handler.GetFoodStopByID())
		r.POST("/", handler.CreateFoodStop())
	}
}
