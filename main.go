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

	"tirthankarkundu17/pandal-hopping-api/config"
	"tirthankarkundu17/pandal-hopping-api/controllers"
	"tirthankarkundu17/pandal-hopping-api/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to the Database
	client := config.ConnectDB()

	// Ensure DB disconnection on exit
	defer func() {
		// 5 seconds timeout for disconnecting from DB
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := client.Disconnect(ctx); err != nil {
			log.Fatalf("Error disconnecting from MongoDB: %v", err)
		}
		log.Println("MongoDB disconnected.")
	}()

	// Setup MongoDB Collection
	pandalCollection := config.GetCollection(client, "durgapuja")

	// Initialize the controllers
	pandalController := controllers.NewPandalController(pandalCollection)

	// Setup Gin router
	router := gin.Default()

	// Setup routes
	routes.PandalRoute(router, pandalController)

	// Default response
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Welcome to the Pandal Hopping API",
		})
	})

	// Setup HTTP server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:    "localhost:" + port,
		Handler: router,
	}

	// Run the server in a goroutine so it doesn't block
	go func() {
		log.Printf("Server running on port %s", port)
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
