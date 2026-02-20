package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Location model
type Location struct {
	Type        string    `json:"type" bson:"type" binding:"required"`
	Coordinates []float64 `json:"coordinates" bson:"coordinates" binding:"required"`
}

// Pandal structure
type Pandal struct {
	ID            primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name          string             `json:"name" bson:"name" binding:"required"`
	Description   string             `json:"description" bson:"description"`
	Area          string             `json:"area" bson:"area" binding:"required"`
	Theme         string             `json:"theme" bson:"theme"`
	Location      Location           `json:"location" bson:"location"`
	Images        []string           `json:"images" bson:"images"`
	RatingAvg     float64            `json:"ratingAvg" bson:"ratingAvg"`
	RatingCount   int                `json:"ratingCount" bson:"ratingCount"`
	Status        string             `json:"status" bson:"status"` // "pending", "approved", "rejected"
	ApprovalCount int                `json:"approvalCount" bson:"approvalCount"`
	ApprovedBy    []string           `json:"approvedBy" bson:"approvedBy"`
	CreatedAt     time.Time          `json:"createdAt" bson:"createdAt"`
}
