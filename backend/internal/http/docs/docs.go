package docs

import "github.com/swaggo/swag"

// @title Seamless Service API
// @version 0.2.0
// @description API for the Seamless collaboration backend.
// @BasePath /api
// @schemes http https
// @securityDefinitions.apikey bearerAuth
// @in header
// @name Authorization

type ErrorResponse struct {
	Code    string `json:"code" example:"bad_request"`
	Message string `json:"message" example:"validation failed"`
}

type DeleteResponse struct {
	Deleted bool `json:"deleted" example:"true"`
}

type SuccessResponse struct {
	Success bool `json:"success" example:"true"`
}

type AcceptedResponse struct {
	Accepted bool `json:"accepted" example:"true"`
	Ignored  bool `json:"ignored,omitempty" example:"false"`
}

const docTemplate = `{
  "swagger": "2.0",
  "info": {
    "title": "Seamless Service API",
    "description": "API for the Seamless collaboration backend.",
    "version": "0.2.0"
  },
  "basePath": "/api",
  "paths": {}
}`

var SwaggerInfo = &swag.Spec{
	Version:          "0.2.0",
	Host:             "localhost:8080",
	BasePath:         "/api",
	Schemes:          []string{"http", "https"},
	Title:            "Seamless Service API",
	Description:      "API for the Seamless collaboration backend.",
	InfoInstanceName: "swagger",
	SwaggerTemplate:  docTemplate,
}

func init() {
	swag.Register(SwaggerInfo.InstanceName(), SwaggerInfo)
}
