package middleware

import (
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/config"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
	jwtmanager "github.com/serdeshnow/bezum-hack-2026/backend/internal/jwt"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/user"
)

type Middleware struct {
	logger     *logger.Logger
	appConfig  config.AppConfig
	jwtManager *jwtmanager.Manager
	sessions   user.SessionRepository
	userReader user.Reader
}

func New(
	logger *logger.Logger,
	appConfig config.AppConfig,
	jwtManager *jwtmanager.Manager,
	sessions user.SessionRepository,
	userReader user.Reader,
) *Middleware {
	return &Middleware{
		logger:     logger,
		appConfig:  appConfig,
		jwtManager: jwtManager,
		sessions:   sessions,
		userReader: userReader,
	}
}
