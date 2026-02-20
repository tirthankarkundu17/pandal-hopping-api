package routes

import (
	"tirthankarkundu17/pandal-hopping-api/internal/handlers"

	"github.com/gin-gonic/gin"
)

// PandalRoute defines endpoints for the app
func PandalRoute(router *gin.Engine, handler *handlers.PandalHandler) {
	router.POST("/pandal", handler.CreatePandal())
	router.GET("/pandals", handler.GetAllPandals())
}
