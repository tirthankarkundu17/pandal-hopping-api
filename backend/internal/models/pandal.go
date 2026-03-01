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

// PandalStatus represents the approval state of a pandal
type PandalStatus string

const (
	StatusPending  PandalStatus = "pending"
	StatusApproved PandalStatus = "approved"
	StatusRejected PandalStatus = "rejected"
)

// Pandal structure
type Pandal struct {
	ID            primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name          string             `json:"name" bson:"name" binding:"required"`
	Description   string             `json:"description" bson:"description"`
	Area          string             `json:"area" bson:"area" binding:"required"`
	District      string             `json:"district" bson:"district" binding:"required"`
	State         string             `json:"state" bson:"state" binding:"required"`
	Country       string             `json:"country" bson:"country" binding:"required"`
	Theme         string             `json:"theme" bson:"theme"`
	Tags          []string           `json:"tags" bson:"tags"` // e.g. ["award-winning", "banedi-bari"]
	Location      Location           `json:"location" bson:"location"`
	Images        []string           `json:"images" bson:"images"`
	RatingAvg     float64            `json:"ratingAvg" bson:"ratingAvg"`
	RatingCount   int                `json:"ratingCount" bson:"ratingCount"`
	Status        PandalStatus       `json:"status" bson:"status"`
	ApprovalCount int                `json:"approvalCount" bson:"approvalCount"`
	ApprovedBy    []string           `json:"approvedBy" bson:"approvedBy"`
	CreatedBy     string             `json:"createdBy" bson:"createdBy"`
	CreatedAt     time.Time          `json:"createdAt" bson:"createdAt"`
}
