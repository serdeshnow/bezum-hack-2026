package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/user"
)

func InitUserRoutes(public, protected *gin.RouterGroup, handler *user.Handler) {
	auth := public.Group("/auth")
	{
		auth.POST("/login", handler.Login)
	}

	authProtected := protected.Group("/auth")
	{
		authProtected.POST("/logout", handler.Logout)
		authProtected.GET("/me", handler.Me)
	}

	users := protected.Group("/users")
	{
		users.GET("", handler.List)
		users.POST("", handler.Create)
		users.GET("/:userId", handler.Get)
		users.PATCH("/:userId", handler.Update)
		users.DELETE("/:userId", handler.Delete)
		users.GET("/:userId/preferences", handler.GetPreferences)
		users.PUT("/:userId/preferences", handler.ReplacePreferences)
		users.PATCH("/:userId/preferences", handler.PatchPreferences)
	}
}
