package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/communication"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/delivery"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/document"
	_ "github.com/serdeshnow/bezum-hack-2026/backend/internal/http/docs"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/http/middleware"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
	githubintegration "github.com/serdeshnow/bezum-hack-2026/backend/internal/integrations/github"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/meeting"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/planning"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/project"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/task"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/user"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type Dependencies struct {
	AppConfig            any
	Logger               *logger.Logger
	Middleware           *middleware.Middleware
	UserHandler          *user.Handler
	ProjectHandler       *project.Handler
	PlanningHandler      *planning.Handler
	TaskHandler          *task.Handler
	DocumentHandler      *document.Handler
	MeetingHandler       *meeting.Handler
	DeliveryHandler      *delivery.Handler
	CommunicationHandler *communication.Handler
	GitHubHandler        *githubintegration.Handler
}

func NewRouter(deps Dependencies) *gin.Engine {
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(deps.Middleware.CORSMiddleware())

	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api")
	public := api.Group("")
	protected := api.Group("")
	protected.Use(deps.Middleware.AuthRequired())

	InitWebhookRoutes(public, deps.GitHubHandler)
	InitUserRoutes(public, protected, deps.UserHandler)
	InitProjectRoutes(protected, deps.ProjectHandler)
	InitPlanningRoutes(protected, deps.PlanningHandler)
	InitTaskRoutes(protected, deps.TaskHandler)
	InitDocumentRoutes(protected, deps.DocumentHandler)
	InitMeetingRoutes(protected, deps.MeetingHandler)
	InitDeliveryRoutes(protected, deps.DeliveryHandler)
	InitCommunicationRoutes(protected, deps.CommunicationHandler)

	return r
}
