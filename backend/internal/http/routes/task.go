package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/task"
)

func InitTaskRoutes(protected *gin.RouterGroup, handler *task.Handler) {
	tasks := protected.Group("/tasks")
	{
		tasks.GET("", handler.List)
		tasks.POST("", handler.Create)
		tasks.GET("/:taskId", handler.Get)
		tasks.PATCH("/:taskId", handler.Update)
		tasks.DELETE("/:taskId", handler.Delete)
		tasks.GET("/:taskId/tags", handler.ListTags)
		tasks.POST("/:taskId/tags", handler.CreateTag)
		tasks.GET("/:taskId/comments", handler.ListComments)
		tasks.POST("/:taskId/comments", handler.CreateComment)
	}

	taskTags := protected.Group("/task-tags")
	{
		taskTags.GET("/:taskTagId", handler.GetTag)
		taskTags.PATCH("/:taskTagId", handler.UpdateTag)
		taskTags.DELETE("/:taskTagId", handler.DeleteTag)
	}

	taskComments := protected.Group("/task-comments")
	{
		taskComments.GET("/:taskCommentId", handler.GetComment)
		taskComments.PATCH("/:taskCommentId", handler.UpdateComment)
		taskComments.DELETE("/:taskCommentId", handler.DeleteComment)
	}
}
