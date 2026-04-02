package main

import "github.com/serdeshnow/bezum-hack-2026/backend/internal/app"

// @title Seamless Service API
// @version 0.2.0
// @description API for the Seamless collaboration backend.
// @BasePath /api
// @schemes http https
// @securityDefinitions.apikey bearerAuth
// @in header
// @name Authorization

func main() {
	app.MustRun()
}
