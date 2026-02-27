package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// FoodStop represents a restaurant or food stall near pandal routes
type FoodStop struct {
	ID       primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name     string             `json:"name"         bson:"name"          binding:"required"`
	Type     string             `json:"type"         bson:"type"` // "Restaurant", "Fine Dining", "Street Food"
	Image    string             `json:"image"        bson:"image"`
	Location Location           `json:"location"     bson:"location"      binding:"required"`
	Area     string             `json:"area"         bson:"area"`
	District string             `json:"district"     bson:"district"`
}

// District is a lightweight view derived from aggregating pandal areas
type District struct {
	ID          string `json:"id"          bson:"_id"`
	Name        string `json:"name"        bson:"-"`
	PandalCount int    `json:"pandalCount" bson:"pandalCount"`
}
