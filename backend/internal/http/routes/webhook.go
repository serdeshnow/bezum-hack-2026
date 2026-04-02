package routes

import (
	"github.com/gin-gonic/gin"
	githubintegration "github.com/serdeshnow/bezum-hack-2026/backend/internal/integrations/github"
)

func InitWebhookRoutes(public *gin.RouterGroup, githubHandler *githubintegration.Handler) {
	if githubHandler == nil {
		return
	}

	webhooks := public.Group("/webhooks")
	{
		webhooks.POST("/github", githubHandler.HandleWebhook)
	}
}
