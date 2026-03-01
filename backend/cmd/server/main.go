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
	"tirthankarkundu17/pandal-hopping-api/internal/validation"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load administrative geographic data into memory
	err := validation.LoadAdministrativeData("internal/data/india-administrative.json")
	if err != nil {
		log.Fatalf("Fatal: could not initialize geographical validation data: %v", err)
	}

	// Load environment variables
	err = godotenv.Load()
	if err != nil {
		log.Printf("Error loading environment variables: %v", err)
	}

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

	// Setup MongoDB Collections
	pandalCollection := config.GetCollection(client, "durgapuja")
	userCollection := config.GetCollection(client, "users")
	routeCollection := config.GetCollection(client, "routes")
	foodStopCollection := config.GetCollection(client, "food_stops")

	// Run Database Migrations
	migrations.RunMigrations(pandalCollection, foodStopCollection)

	// Initialize the dependency graph (Repository -> Service -> Handler)
	pandalRepo := repository.NewPandalRepository(pandalCollection)
	pandalService := services.NewPandalService(pandalRepo)
	pandalHandler := handlers.NewPandalHandler(pandalService)

	userRepo := repository.NewUserRepository(userCollection)
	authService := services.NewAuthService(userRepo)
	authHandler := handlers.NewAuthHandler(authService)

	routeRepo := repository.NewRouteRepository(routeCollection, pandalCollection)
	routeService := services.NewRouteService(routeRepo)
	routeHandler := handlers.NewRouteHandler(routeService)

	foodStopRepo := repository.NewFoodStopRepository(foodStopCollection)
	foodStopService := services.NewFoodStopService(foodStopRepo)
	foodStopHandler := handlers.NewFoodStopHandler(foodStopService)

	locationHandler := handlers.NewLocationHandler()

	// Setup Gin router
	router := gin.Default()

	// CORS — allow the Expo web dev server (and any origin in development)
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}))

	// API Route Group
	apiGroup := router.Group("/api/v1")

	// Setup routes
	routes.PandalRoute(apiGroup, pandalHandler)
	routes.AuthRoute(apiGroup, authHandler)
	routes.RouteRoute(apiGroup, routeHandler)
	routes.FoodRoute(apiGroup, foodStopHandler)
	routes.LocationRoute(apiGroup, locationHandler)

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
