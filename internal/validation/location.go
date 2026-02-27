package validation

import (
	"encoding/json"
	"fmt"
	"os"
)

type AdminDistrict struct {
	Code     string `json:"code"`
	Name     string `json:"name"`
	IsActive bool   `json:"is_active"`
	Image    string `json:"image,omitempty"`
}

type AdminState struct {
	Code      string          `json:"code"`
	Name      string          `json:"name"`
	Type      string          `json:"type"`
	IsoCode   string          `json:"iso_code"`
	IsActive  bool            `json:"is_active"`
	Districts []AdminDistrict `json:"districts"`
}

type AdminCountry struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

type AdministrativeData struct {
	Version     string       `json:"version"`
	LastUpdated string       `json:"last_updated"`
	Country     AdminCountry `json:"country"`
	States      []AdminState `json:"states"`
}

var adminData AdministrativeData

// LoadAdministrativeData loads the data from the given filepath
// This should be called once on app startup.
func LoadAdministrativeData(filepath string) error {
	fileBytes, err := os.ReadFile(filepath)
	if err != nil {
		return fmt.Errorf("could not read administrative data file: %w", err)
	}

	if err := json.Unmarshal(fileBytes, &adminData); err != nil {
		return fmt.Errorf("could not unmarshal administrative data: %w", err)
	}

	return nil
}

// GetAdministrativeData returns the loaded administrative data with optional filtering.
func GetAdministrativeData(countryCode, stateCode string) AdministrativeData {
	result := adminData

	// Filter by country code
	if countryCode != "" && result.Country.Code != countryCode {
		result.States = []AdminState{}
		return result
	}

	// Filter by state code
	if stateCode != "" {
		var filtered []AdminState
		for _, state := range result.States {
			if state.Code == stateCode {
				filtered = append(filtered, state)
			}
		}
		result.States = filtered
	}

	return result
}

// ValidateLocation checks if a given country, state, and district code exists
// in the loaded administrative data and returns an error if not found.
func ValidateLocation(countryCode, stateCode, districtCode string) error {
	if adminData.Country.Code != countryCode {
		return fmt.Errorf("unsupported country: %s", countryCode)
	}

	stateFound := false
	for _, state := range adminData.States {
		if !state.IsActive {
			continue
		}
		if state.Code == stateCode {
			stateFound = true
			districtFound := false
			for _, district := range state.Districts {
				if !district.IsActive {
					continue
				}
				if district.Code == districtCode {
					districtFound = true
					break
				}
			}
			if !districtFound {
				return fmt.Errorf("unsupported or inactive district: %s in state: %s", districtCode, stateCode)
			}
			break
		}
	}

	if !stateFound {
		return fmt.Errorf("unsupported or inactive state: %s", stateCode)
	}

	return nil
}

// GetDistrictName looks up the human-readable name for a given country, state, and district code
// Returns the original code if the name cannot be found
func GetDistrictName(countryCode, stateCode, districtCode string) string {
	// If an explicit country code is provided and it's invalid, bail early.
	if countryCode != "" && adminData.Country.Code != countryCode {
		return districtCode
	}

	for _, state := range adminData.States {
		// If a state filter is passed, skip other states.
		if stateCode != "" && state.Code != stateCode {
			continue
		}

		for _, district := range state.Districts {
			if district.Code == districtCode {
				return district.Name
			}
		}
	}

	return districtCode
}

// GetDistrictImage looks up the image for a given country, state, and district code
func GetDistrictImage(countryCode, stateCode, districtCode string) string {
	if countryCode != "" && adminData.Country.Code != countryCode {
		return ""
	}

	for _, state := range adminData.States {
		if stateCode != "" && state.Code != stateCode {
			continue
		}

		for _, district := range state.Districts {
			if district.Code == districtCode {
				return district.Image
			}
		}
	}

	return ""
}
