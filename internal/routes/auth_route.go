package routes

import (
	"tirthankarkundu17/pandal-hopping-api/internal/handlers"

	"github.com/gin-gonic/gin"
)

func AuthRoute(router *gin.RouterGroup, authHandler *handlers.AuthHandler) {
	authRoutes := router.Group("/auth")
	{
		authRoutes.POST("/register", authHandler.Register)
		authRoutes.POST("/login", authHandler.Login)
		authRoutes.POST("/refresh", authHandler.Refresh)
	}
}
