package handlers

import (
	"net/http"

	"tirthankarkundu17/pandal-hopping-api/internal/validation"

	"github.com/gin-gonic/gin"
)

// LocationHandler handles HTTP requests for location/administrative data
type LocationHandler struct{}

// NewLocationHandler creates a new handler instance
func NewLocationHandler() *LocationHandler {
	return &LocationHandler{}
}

// GetAdministrativeData returns the static geographical hierarchical data
// GET /locations/administrative
// Supports optional query params: country, state
func (h *LocationHandler) GetAdministrativeData() gin.HandlerFunc {
	return func(c *gin.Context) {
		countryCode := c.Query("country")
		stateCode := c.Query("state")

		data := validation.GetAdministrativeData(countryCode, stateCode)
		c.JSON(http.StatusOK, gin.H{"data": data})
	}
}
