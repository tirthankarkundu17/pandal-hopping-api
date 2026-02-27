package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Route represents a curated pandal-hopping itinerary
type Route struct {
	ID          primitive.ObjectID   `json:"id,omitempty"          bson:"_id,omitempty"`
	Title       string               `json:"title"                 bson:"title"         binding:"required"`
	Description string               `json:"description"           bson:"description"`
	Duration    string               `json:"duration"              bson:"duration"`
	Stops       []primitive.ObjectID `json:"stops"                 bson:"stops"`
	StopCount   int                  `json:"stopCount"             bson:"stopCount"`
	CreatedAt   time.Time            `json:"createdAt"             bson:"createdAt"`
}

// RouteWithStops is the enriched response that embeds full Pandal objects for each stop
type RouteWithStops struct {
	ID          primitive.ObjectID `json:"id,omitempty"`
	Title       string             `json:"title"`
	Description string             `json:"description"`
	Duration    string             `json:"duration"`
	StopCount   int                `json:"stopCount"`
	Stops       []Pandal           `json:"stops"`
	CreatedAt   time.Time          `json:"createdAt"`
}
