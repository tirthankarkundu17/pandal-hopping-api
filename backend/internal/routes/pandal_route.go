package routes

import (
	"tirthankarkundu17/pandal-hopping-api/internal/handlers"
	"tirthankarkundu17/pandal-hopping-api/internal/middleware"

	"github.com/gin-gonic/gin"
)

// PandalRoute defines endpoints for the app
func PandalRoute(router *gin.RouterGroup, handler *handlers.PandalHandler) {
	pandalRoutes := router.Group("/pandals", middleware.AuthMiddleware())
	{
		pandalRoutes.POST("/", handler.CreatePandal())
		pandalRoutes.GET("/", handler.GetAllPandals())
		pandalRoutes.GET("/pending", handler.GetPendingPandals())
		pandalRoutes.GET("/districts", handler.GetDistricts())
		pandalRoutes.PUT("/:id/approve", handler.ApprovePandal())
	}
}
