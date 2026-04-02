package app

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/communication"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/config"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/delivery"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/document"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/http/middleware"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/http/routes"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/nextcloud"
	postgresinfra "github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/postgres"
	rabbitmqinfra "github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/rabbitmq"
	redisinfra "github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/redis"
	s3infra "github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/s3"
	githubintegration "github.com/serdeshnow/bezum-hack-2026/backend/internal/integrations/github"
	jwtmanager "github.com/serdeshnow/bezum-hack-2026/backend/internal/jwt"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/meeting"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/meetingpipeline"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/planning"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/project"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/task"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/user"
)

type App struct {
	cfg       *config.Config
	logger    *logger.Logger
	server    *http.Server
	s3        *s3infra.Client
	nextcloud *nextcloud.Client
	rabbitmq  *rabbitmqinfra.Client
	pipeline  *meetingpipeline.Service
}

func MustRun() {
	MustNew().MustRun()
}

func MustNew() *App {
	cfg := config.MustLoad()

	switch cfg.App.Mode {
	case "release":
		gin.SetMode(gin.ReleaseMode)
	case "test":
		gin.SetMode(gin.TestMode)
	default:
		gin.SetMode(gin.DebugMode)
	}

	log := logger.MustNew(logger.Config{})
	log.Info().Str("mode", cfg.App.Mode).Msg("configuration loaded")

	postgres := postgresinfra.MustNew(cfg.PG, log.WithComponent("postgres"))
	log.Info().Msg("postgres client initialized")

	redisClient := redisinfra.MustNew(cfg.Redis, log.WithComponent("redis"))
	log.Info().Msg("redis client initialized")

	s3Client := s3infra.MustNew(cfg.S3, log.WithComponent("s3"))
	log.Info().Str("bucket", cfg.S3.Bucket).Msg("s3 client initialized")

	nextcloudClient := nextcloud.MustNew(cfg.Nextcloud, log.WithComponent("nextcloud"))
	log.Info().Str("base_url", cfg.Nextcloud.BaseURL).Msg("nextcloud client initialized")

	rabbitmqClient := rabbitmqinfra.MustNew(cfg.RabbitMQ, log.WithComponent("rabbitmq"))
	log.Info().Msg("rabbitmq client initialized")

	jwtMgr := jwtmanager.MustNew(cfg.JWT, log.WithComponent("jwt"))
	log.Info().Msg("jwt manager initialized")

	userRepo := user.NewRepository(postgres.Pool())
	sessionRepo := user.NewSessionRepository(redisClient)
	projectRepo := project.NewRepository(postgres.Pool())
	planningRepo := planning.NewRepository(postgres.Pool())
	taskRepo := task.NewRepository(postgres.Pool())
	documentRepo := document.NewRepository(postgres.Pool())
	meetingRepo := meeting.NewRepository(postgres.Pool())
	deliveryRepo := delivery.NewRepository(postgres.Pool())
	communicationRepo := communication.NewRepository(postgres.Pool())
	userService := user.NewService(
		userRepo,
		sessionRepo,
		jwtMgr,
		cfg.JWT,
		log.WithComponent("user-service"),
	)
	userHandler := user.NewHandler(userService, log.WithComponent("user-handler"))
	projectService := project.NewService(projectRepo, log.WithComponent("project-service"))
	projectHandler := project.NewHandler(projectService, log.WithComponent("project-handler"))
	planningService := planning.NewService(planningRepo, log.WithComponent("planning-service"))
	planningHandler := planning.NewHandler(planningService, log.WithComponent("planning-handler"))
	taskService := task.NewService(taskRepo, log.WithComponent("task-service"))
	taskHandler := task.NewHandler(taskService, log.WithComponent("task-handler"))
	documentService := document.NewService(documentRepo, s3Client, log.WithComponent("document-service"))
	documentHandler := document.NewHandler(documentService, log.WithComponent("document-handler"))
	meetingPipelineService := meetingpipeline.NewService(
		rabbitmqClient,
		meetingRepo,
		nextcloudClient,
		s3Client,
		log.WithComponent("meeting-pipeline"),
	)
	meetingService := meeting.NewService(meetingRepo, nextcloudClient, meetingPipelineService, log.WithComponent("meeting-service"))
	meetingHandler := meeting.NewHandler(meetingService, log.WithComponent("meeting-handler"))
	deliveryService := delivery.NewService(deliveryRepo, log.WithComponent("delivery-service"))
	deliveryHandler := delivery.NewHandler(deliveryService, log.WithComponent("delivery-handler"))
	communicationService := communication.NewService(communicationRepo, log.WithComponent("communication-service"))
	communicationHandler := communication.NewHandler(communicationService, log.WithComponent("communication-handler"))
	githubService := githubintegration.MustNewService(cfg.GitHub, deliveryRepo, taskRepo, communicationRepo, log.WithComponent("github-sync"))
	githubHandler := githubintegration.NewHandler(githubService, log.WithComponent("github-webhook"))

	authMiddleware := middleware.New(
		log.WithComponent("middleware"),
		cfg.App,
		jwtMgr,
		sessionRepo,
		userRepo,
	)

	router := routes.NewRouter(routes.Dependencies{
		AppConfig:            cfg.App,
		Logger:               log.WithComponent("router"),
		Middleware:           authMiddleware,
		UserHandler:          userHandler,
		ProjectHandler:       projectHandler,
		PlanningHandler:      planningHandler,
		TaskHandler:          taskHandler,
		DocumentHandler:      documentHandler,
		MeetingHandler:       meetingHandler,
		DeliveryHandler:      deliveryHandler,
		CommunicationHandler: communicationHandler,
		GitHubHandler:        githubHandler,
	})
	log.Info().Msg("router initialized")

	server := &http.Server{
		Addr:              cfg.App.Address(),
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
	}

	return &App{
		cfg:       cfg,
		logger:    log,
		server:    server,
		s3:        s3Client,
		nextcloud: nextcloudClient,
		rabbitmq:  rabbitmqClient,
		pipeline:  meetingPipelineService,
	}
}

func (a *App) MustRun() {
	runCtx, runCancel := context.WithCancel(context.Background())
	defer runCancel()

	if a.pipeline != nil {
		if err := a.pipeline.StartConsumers(runCtx); err != nil {
			a.logger.Error().Err(err).Msg("meeting pipeline consumers failed to start")
			panic(err)
		}
		a.logger.Info().Msg("meeting pipeline consumers started")
	}

	a.logger.Info().
		Str("addr", a.server.Addr).
		Msg("http server starting")

	errCh := make(chan error, 1)
	go func() {
		if err := a.server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
			return
		}
		errCh <- nil
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-stop:
		a.logger.Info().Str("signal", sig.String()).Msg("shutdown signal received")
	case err := <-errCh:
		if err != nil {
			a.logger.Error().Err(err).Msg("http server failed")
			panic(err)
		}
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := a.server.Shutdown(ctx); err != nil {
		a.logger.Error().Err(err).Msg("http server shutdown failed")
		panic(err)
	}
	runCancel()
	a.rabbitmq.Close()

	a.logger.Info().Msg("http server stopped")
}
