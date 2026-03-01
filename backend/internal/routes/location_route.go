package routes

import (
	"tirthankarkundu17/pandal-hopping-api/internal/handlers"

	"github.com/gin-gonic/gin"
)

// LocationRoute defines endpoints for administrative geographical data
func LocationRoute(router *gin.RouterGroup, handler *handlers.LocationHandler) {
	r := router.Group("/locations")
	{
		// Open endpoint (no AuthMiddleware required) for frontend forms to fetch
		r.GET("/administrative", handler.GetAdministrativeData())
	}
}
