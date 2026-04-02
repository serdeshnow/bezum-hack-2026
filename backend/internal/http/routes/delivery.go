package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/delivery"
)

func InitDeliveryRoutes(protected *gin.RouterGroup, handler *delivery.Handler) {
	releases := protected.Group("/releases")
	{
		releases.GET("", handler.ListReleases)
		releases.POST("", handler.CreateRelease)
		releases.GET("/:releaseId", handler.GetRelease)
		releases.PATCH("/:releaseId", handler.UpdateRelease)
		releases.DELETE("/:releaseId", handler.DeleteRelease)
	}

	pullRequests := protected.Group("/pull-requests")
	{
		pullRequests.GET("", handler.ListPullRequests)
		pullRequests.POST("", handler.CreatePullRequest)
		pullRequests.GET("/:pullRequestId", handler.GetPullRequest)
		pullRequests.PATCH("/:pullRequestId", handler.UpdatePullRequest)
		pullRequests.DELETE("/:pullRequestId", handler.DeletePullRequest)
	}
}
