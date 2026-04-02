package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/communication"
)

func InitCommunicationRoutes(protected *gin.RouterGroup, handler *communication.Handler) {
	notifications := protected.Group("/notifications")
	{
		notifications.GET("", handler.ListNotifications)
		notifications.POST("", handler.CreateNotification)
		notifications.GET("/:notificationId", handler.GetNotification)
		notifications.PATCH("/:notificationId", handler.UpdateNotification)
		notifications.DELETE("/:notificationId", handler.DeleteNotification)
	}

	activityFeed := protected.Group("/activity-feed")
	{
		activityFeed.GET("", handler.ListActivityFeed)
		activityFeed.POST("", handler.CreateActivityFeed)
		activityFeed.GET("/:activityFeedId", handler.GetActivityFeed)
		activityFeed.PATCH("/:activityFeedId", handler.UpdateActivityFeed)
		activityFeed.DELETE("/:activityFeedId", handler.DeleteActivityFeed)
	}
}
