package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"tirthankarkundu17/pandal-hopping-api/internal/config"
	"tirthankarkundu17/pandal-hopping-api/internal/handlers"
	"tirthankarkundu17/pandal-hopping-api/internal/migrations"
	"tirthankarkundu17/pandal-hopping-api/internal/repository"
	"tirthankarkundu17/pandal-hopping-api/internal/routes"
	"tirthankarkundu17/pandal-hopping-api/internal/services"

	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to the Database
	client := config.ConnectDB()

	// Ensure DB disconnection on exit
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := client.Disconnect(ctx); err != nil {
			log.Fatalf("Error disconnecting from MongoDB: %v", err)
		}
		log.Println("MongoDB disconnected.")
	}()

	// Setup MongoDB Collection
	pandalCollection := config.GetCollection(client, "durgapuja")

	// Run Database Migrations
	migrations.RunMigrations(pandalCollection)

	// Initialize the dependency graph (Repository -> Service -> Handler)
	pandalRepo := repository.NewPandalRepository(pandalCollection)
	pandalService := services.NewPandalService(pandalRepo)
	pandalHandler := handlers.NewPandalHandler(pandalService)

	// Setup Gin router
	router := gin.Default()

	// Setup routes
	routes.PandalRoute(router, pandalHandler)

	// Default response
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Welcome to the Pandal Hopping API",
		})
	})

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	// Setup HTTP server
	host := os.Getenv("HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:    host + ":" + port,
		Handler: router,
	}

	// Run the server in a goroutine so it doesn't block
	go func() {
		log.Printf("Server running on %s:%s", host, port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Error starting server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// 5 seconds timeout for shutting down
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}
