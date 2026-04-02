package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (m *Middleware) CORSMiddleware() gin.HandlerFunc {
	corsConfig := cors.Config{
		AllowOrigins: m.appConfig.AllowedOrigins,
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Length", "Content-Type", "Authorization",
			"Session", "User-Agent", "Accept-Language", "X-Timezone"},
		AllowCredentials: true,
	}

	return cors.New(corsConfig)
}
