package routes

import (
	"tirthankarkundu17/pandal-hopping-api/internal/handlers"
	"tirthankarkundu17/pandal-hopping-api/internal/middleware"

	"github.com/gin-gonic/gin"
)

// RouteRoute defines endpoints for curated pandal routes
func RouteRoute(router *gin.RouterGroup, handler *handlers.RouteHandler) {
	r := router.Group("/routes", middleware.AuthMiddleware())
	{
		r.GET("/", handler.GetRoutes())
		r.GET("/:id", handler.GetRouteByID())
		r.POST("/", handler.CreateRoute())
	}
}
