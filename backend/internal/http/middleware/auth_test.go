package middleware

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	authctx "github.com/serdeshnow/bezum-hack-2026/backend/internal/auth"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/config"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
	jwtmanager "github.com/serdeshnow/bezum-hack-2026/backend/internal/jwt"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/user"
)

type stubSessionRepository struct {
	session *user.Session
	err     error
}

func (s stubSessionRepository) Save(context.Context, user.Session, time.Duration) error { return nil }
func (s stubSessionRepository) Delete(context.Context, string) error                    { return nil }
func (s stubSessionRepository) Get(_ context.Context, _ string) (*user.Session, error) {
	if s.err != nil {
		return nil, s.err
	}
	if s.session == nil {
		return nil, user.ErrSessionNotFound
	}
	return s.session, nil
}

type stubUserReader struct {
	user *user.User
	err  error
}

func (s stubUserReader) GetByID(context.Context, int) (*user.User, error) {
	if s.err != nil {
		return nil, s.err
	}
	if s.user == nil {
		return nil, user.ErrUserNotFound
	}
	return s.user, nil
}

func TestAuthRequired(t *testing.T) {
	gin.SetMode(gin.TestMode)

	jwtMgr := jwtmanager.MustNew(config.JWTConfig{
		Secret: "test-secret",
		Expire: time.Hour,
	}, logger.New(logger.Config{Output: io.Discard}))

	validToken, _, err := jwtMgr.IssueToken(42, "developer", "session-1")
	if err != nil {
		t.Fatalf("issue token: %v", err)
	}

	testCases := []struct {
		name           string
		authorization  string
		sessionRepo    stubSessionRepository
		userReader     stubUserReader
		wantStatusCode int
		wantCode       string
		wantAuth       *authctx.Context
	}{
		{
			name:           "missing authorization header",
			wantStatusCode: http.StatusUnauthorized,
			wantCode:       "missing_authorization",
		},
		{
			name:          "valid token and session",
			authorization: "Bearer " + validToken,
			sessionRepo: stubSessionRepository{
				session: &user.Session{ID: "session-1", UserID: 42, Role: "developer", ExpiresAt: time.Now().Add(time.Hour)},
			},
			userReader: stubUserReader{
				user: &user.User{ID: 42, Role: "developer", IsActive: true},
			},
			wantStatusCode: http.StatusOK,
			wantAuth: &authctx.Context{
				UserID:    42,
				Role:      "developer",
				SessionID: "session-1",
			},
		},
		{
			name:          "inactive user rejected",
			authorization: "Bearer " + validToken,
			sessionRepo: stubSessionRepository{
				session: &user.Session{ID: "session-1", UserID: 42, Role: "developer", ExpiresAt: time.Now().Add(time.Hour)},
			},
			userReader: stubUserReader{
				user: &user.User{ID: 42, Role: "developer", IsActive: false},
			},
			wantStatusCode: http.StatusUnauthorized,
			wantCode:       "inactive_user",
		},
		{
			name:          "session mismatch rejected",
			authorization: "Bearer " + validToken,
			sessionRepo: stubSessionRepository{
				session: &user.Session{ID: "session-1", UserID: 42, Role: "manager", ExpiresAt: time.Now().Add(time.Hour)},
			},
			userReader: stubUserReader{
				user: &user.User{ID: 42, Role: "developer", IsActive: true},
			},
			wantStatusCode: http.StatusUnauthorized,
			wantCode:       "session_mismatch",
		},
		{
			name:          "session storage failure",
			authorization: "Bearer " + validToken,
			sessionRepo: stubSessionRepository{
				err: errors.New("redis is down"),
			},
			userReader:     stubUserReader{},
			wantStatusCode: http.StatusInternalServerError,
			wantCode:       "internal_error",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			m := New(
				logger.New(logger.Config{Output: io.Discard}),
				config.AppConfig{},
				jwtMgr,
				tc.sessionRepo,
				tc.userReader,
			)

			router := gin.New()
			router.GET("/protected", m.AuthRequired(), func(c *gin.Context) {
				auth, ok := authctx.Get(c)
				if !ok {
					c.JSON(http.StatusInternalServerError, gin.H{"code": "missing_auth_context"})
					return
				}
				c.JSON(http.StatusOK, auth)
			})

			req := httptest.NewRequest(http.MethodGet, "/protected", nil)
			if tc.authorization != "" {
				req.Header.Set("Authorization", tc.authorization)
			}

			rec := httptest.NewRecorder()
			router.ServeHTTP(rec, req)

			if rec.Code != tc.wantStatusCode {
				t.Fatalf("status code = %d, want %d, body=%s", rec.Code, tc.wantStatusCode, rec.Body.String())
			}

			if tc.wantAuth != nil {
				var got authctx.Context
				if err := json.NewDecoder(bytes.NewReader(rec.Body.Bytes())).Decode(&got); err != nil {
					t.Fatalf("decode auth response: %v", err)
				}
				if got != *tc.wantAuth {
					t.Fatalf("auth context = %+v, want %+v", got, *tc.wantAuth)
				}
				return
			}

			var payload map[string]any
			if err := json.NewDecoder(bytes.NewReader(rec.Body.Bytes())).Decode(&payload); err != nil {
				t.Fatalf("decode error response: %v", err)
			}

			if code, _ := payload["code"].(string); code != tc.wantCode {
				t.Fatalf("error code = %q, want %q", code, tc.wantCode)
			}
		})
	}
}
