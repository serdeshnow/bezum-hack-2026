package github

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/config"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
)

func TestServiceVerifySignature(t *testing.T) {
	t.Parallel()

	service := &Service{
		cfg: config.GitHubConfig{
			WebhookSecret: "super-secret",
		},
	}

	payload := []byte(`{"hello":"world"}`)
	mac := hmac.New(sha256.New, []byte("super-secret"))
	_, _ = mac.Write(payload)
	signature := "sha256=" + hex.EncodeToString(mac.Sum(nil))

	if !service.VerifySignature(payload, signature) {
		t.Fatal("expected signature to be valid")
	}

	if service.VerifySignature(payload, "sha256=deadbeef") {
		t.Fatal("expected invalid signature to be rejected")
	}
}

func TestHandleWebhook(t *testing.T) {
	t.Parallel()
	gin.SetMode(gin.TestMode)

	newHandler := func() *Handler {
		return NewHandler(&Service{
			cfg: config.GitHubConfig{
				WebhookSecret:   "super-secret",
				RepositoryOwner: "owner",
				RepositoryName:  "repo",
			},
			logger: logger.New(logger.Config{}),
		}, logger.New(logger.Config{}))
	}

	signPayload := func(payload string) string {
		mac := hmac.New(sha256.New, []byte("super-secret"))
		_, _ = mac.Write([]byte(payload))
		return "sha256=" + hex.EncodeToString(mac.Sum(nil))
	}

	testCases := []struct {
		name       string
		event      string
		payload    string
		signature  string
		wantStatus int
		wantBody   string
	}{
		{
			name:       "invalid signature",
			event:      "pull_request",
			payload:    `{"repository":{"full_name":"owner/repo"}}`,
			signature:  "sha256=deadbeef",
			wantStatus: http.StatusUnauthorized,
			wantBody:   `"code":"invalid_signature"`,
		},
		{
			name:       "unsupported event is accepted and ignored",
			event:      "ping",
			payload:    `{"zen":"keep it logically awesome"}`,
			signature:  signPayload(`{"zen":"keep it logically awesome"}`),
			wantStatus: http.StatusAccepted,
			wantBody:   `"ignored":true`,
		},
		{
			name:  "pull request from other repository is accepted without sync",
			event: "pull_request",
			payload: `{
				"action":"opened",
				"number":12,
				"pull_request":{"node_id":"PR_node","number":12,"title":"ABC-12 demo","html_url":"https://github.com/owner/repo/pull/12","head":{"ref":"ABC-12-demo"},"base":{"ref":"main"},"user":{"login":"octocat"}},
				"repository":{"full_name":"other/repo","name":"repo"},
				"sender":{"login":"octocat"}
			}`,
			signature: signPayload(`{
				"action":"opened",
				"number":12,
				"pull_request":{"node_id":"PR_node","number":12,"title":"ABC-12 demo","html_url":"https://github.com/owner/repo/pull/12","head":{"ref":"ABC-12-demo"},"base":{"ref":"main"},"user":{"login":"octocat"}},
				"repository":{"full_name":"other/repo","name":"repo"},
				"sender":{"login":"octocat"}
			}`),
			wantStatus: http.StatusAccepted,
			wantBody:   `"accepted":true`,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			router := gin.New()
			router.POST("/api/webhooks/github", newHandler().HandleWebhook)

			req := httptest.NewRequest(http.MethodPost, "/api/webhooks/github", strings.NewReader(tc.payload))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("X-GitHub-Event", tc.event)
			req.Header.Set("X-Hub-Signature-256", tc.signature)

			rec := httptest.NewRecorder()
			router.ServeHTTP(rec, req)

			if rec.Code != tc.wantStatus {
				t.Fatalf("status code = %d, want %d, body=%s", rec.Code, tc.wantStatus, rec.Body.String())
			}
			if !strings.Contains(rec.Body.String(), tc.wantBody) {
				t.Fatalf("response body %q does not contain %q", rec.Body.String(), tc.wantBody)
			}
		})
	}
}
