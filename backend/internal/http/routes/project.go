package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/project"
)

func InitProjectRoutes(protected *gin.RouterGroup, handler *project.Handler) {
	projects := protected.Group("/projects")
	{
		projects.GET("", handler.List)
		projects.POST("", handler.Create)
		projects.GET("/:projectId", handler.Get)
		projects.PATCH("/:projectId", handler.Update)
		projects.DELETE("/:projectId", handler.Delete)
		projects.GET("/:projectId/members", handler.ListMembers)
		projects.POST("/:projectId/members", handler.CreateMember)
	}

	projectMembers := protected.Group("/project-members")
	{
		projectMembers.GET("/:projectMemberId", handler.GetMember)
		projectMembers.PATCH("/:projectMemberId", handler.UpdateMember)
		projectMembers.DELETE("/:projectMemberId", handler.DeleteMember)
	}
}
