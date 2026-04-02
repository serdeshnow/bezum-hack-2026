package middleware

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	authctx "github.com/serdeshnow/bezum-hack-2026/backend/internal/auth"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/user"
)

func (m *Middleware) AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := strings.TrimSpace(c.GetHeader("Authorization"))
		if header == "" {
			m.abortUnauthorized(c, errors.New("missing authorization header"), "missing_authorization")
			return
		}

		parts := strings.SplitN(header, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || strings.TrimSpace(parts[1]) == "" {
			m.abortUnauthorized(c, errors.New("invalid authorization header"), "invalid_authorization")
			return
		}

		claims, err := m.jwtManager.ParseToken(strings.TrimSpace(parts[1]))
		if err != nil {
			m.abortUnauthorized(c, err, "invalid_token")
			return
		}

		if claims.SessionID == "" {
			m.abortUnauthorized(c, errors.New("missing session id in token"), "missing_session")
			return
		}

		session, err := m.sessions.Get(c.Request.Context(), claims.SessionID)
		if err != nil {
			if errors.Is(err, user.ErrSessionNotFound) {
				m.abortUnauthorized(c, err, "session_not_found")
				return
			}

			m.logger.Error().Err(err).Msg("failed to read session")
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"code":    "internal_error",
				"message": "failed to validate session",
			})
			return
		}

		if session.UserID != claims.UserID || session.Role != claims.Role {
			m.abortUnauthorized(c, errors.New("token and session mismatch"), "session_mismatch")
			return
		}

		authUser, err := m.userReader.GetByID(c.Request.Context(), claims.UserID)
		if err != nil {
			if errors.Is(err, user.ErrUserNotFound) {
				m.abortUnauthorized(c, err, "user_not_found")
				return
			}

			m.logger.Error().Err(err).Msg("failed to load auth user")
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"code":    "internal_error",
				"message": "failed to load authenticated user",
			})
			return
		}

		if !authUser.IsActive {
			m.abortUnauthorized(c, errors.New("user is inactive"), "inactive_user")
			return
		}

		if authUser.Role != claims.Role {
			m.abortUnauthorized(c, errors.New("role mismatch"), "role_mismatch")
			return
		}

		authctx.Set(c, authctx.Context{
			UserID:    claims.UserID,
			Role:      claims.Role,
			SessionID: claims.SessionID,
		})
		c.Next()
	}
}

func (m *Middleware) abortUnauthorized(c *gin.Context, err error, code string) {
	m.logger.Warn().Err(err).Str("code", code).Msg("authorization rejected")
	c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
		"code":    code,
		"message": "authorization failed",
	})
}
