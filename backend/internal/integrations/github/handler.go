package github

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
)

type Handler struct {
	service *Service
	logger  *logger.Logger
}

type acceptedResponse struct {
	Accepted bool `json:"accepted" example:"true"`
	Ignored  bool `json:"ignored,omitempty" example:"false"`
}

type errorResponse struct {
	Code    string `json:"code" example:"bad_request"`
	Message string `json:"message" example:"validation failed"`
}

func NewHandler(service *Service, log *logger.Logger) *Handler {
	return &Handler{service: service, logger: log}
}

// HandleWebhook godoc
// @Summary Handle GitHub webhook
// @Description Accepts GitHub webhook events and synchronizes pull requests into Seamless
// @Tags Integrations
// @Accept json
// @Produce json
// @Param X-GitHub-Event header string true "GitHub event type"
// @Param X-Hub-Signature-256 header string true "GitHub HMAC signature"
// @Success 202 {object} acceptedResponse
// @Failure 400 {object} errorResponse
// @Failure 401 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /webhooks/github [post]
func (h *Handler) HandleWebhook(c *gin.Context) {
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		h.logger.Error().Err(err).Msg("failed to read github webhook body")
		c.JSON(http.StatusBadRequest, gin.H{"code": "bad_request", "message": "failed to read request body"})
		return
	}

	signature := c.GetHeader("X-Hub-Signature-256")
	if !h.service.VerifySignature(payload, signature) {
		c.JSON(http.StatusUnauthorized, gin.H{"code": "invalid_signature", "message": "invalid github webhook signature"})
		return
	}

	event := c.GetHeader("X-GitHub-Event")
	if event != "pull_request" {
		c.JSON(http.StatusAccepted, gin.H{"accepted": true, "ignored": true})
		return
	}

	if err := h.service.HandlePullRequestEvent(c.Request.Context(), event, payload); err != nil {
		h.logger.Error().Err(err).Str("event", event).Msg("failed to process github webhook")
		c.JSON(http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to process github webhook"})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{"accepted": true})
}
