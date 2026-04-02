package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/planning"
)

func InitPlanningRoutes(protected *gin.RouterGroup, handler *planning.Handler) {
	epochs := protected.Group("/epochs")
	{
		epochs.GET("", handler.ListEpochs)
		epochs.POST("", handler.CreateEpoch)
		epochs.GET("/:epochId", handler.GetEpoch)
		epochs.PATCH("/:epochId", handler.UpdateEpoch)
		epochs.DELETE("/:epochId", handler.DeleteEpoch)
	}

	goals := protected.Group("/goals")
	{
		goals.GET("", handler.ListGoals)
		goals.POST("", handler.CreateGoal)
		goals.GET("/:goalId", handler.GetGoal)
		goals.PATCH("/:goalId", handler.UpdateGoal)
		goals.DELETE("/:goalId", handler.DeleteGoal)
	}
}
