package delivery

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
)

type Handler struct {
	service *Service
	logger  *logger.Logger
}

type errorResponse struct {
	Code    string `json:"code" example:"bad_request"`
	Message string `json:"message" example:"validation failed"`
}

type deleteResponse struct {
	Deleted bool `json:"deleted" example:"true"`
}

func NewHandler(service *Service, log *logger.Logger) *Handler {
	return &Handler{service: service, logger: log}
}

type releaseRequest struct {
	ProjectID       *int    `json:"projectId"`
	Version         *string `json:"version"`
	Title           *string `json:"title"`
	Status          *string `json:"status"`
	TargetDate      *string `json:"targetDate"`
	DeployedAt      *string `json:"deployedAt"`
	CommitsCount    *int    `json:"commitsCount"`
	AuthorUserID    *int    `json:"authorUserId"`
	FeaturesCount   *int    `json:"featuresCount"`
	FixesCount      *int    `json:"fixesCount"`
	BreakingCount   *int    `json:"breakingCount"`
	ProgressPercent *int    `json:"progressPercent"`
}

type pullRequestRequest struct {
	ProjectID    *int    `json:"projectId"`
	ReleaseID    *int    `json:"releaseId"`
	Number       *int    `json:"number"`
	Title        *string `json:"title"`
	Branch       *string `json:"branch"`
	Status       *string `json:"status"`
	AuthorUserID *int    `json:"authorUserId"`
	CommitsCount *int    `json:"commitsCount"`
	Additions    *int    `json:"additions"`
	Deletions    *int    `json:"deletions"`
	ExternalURL  *string `json:"externalUrl"`
	MergedAt     *string `json:"mergedAt"`
}

// ListReleases godoc
// @Summary List releases
// @Tags Delivery
// @Security bearerAuth
// @Produce json
// @Success 200 {array} Release
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /releases [get]
func (h *Handler) ListReleases(c *gin.Context) {
	filter := ReleaseFilter{Status: c.Query("status")}
	parseOptionalIntQuery(c, "projectId", &filter.ProjectID, h.badRequest)
	if c.IsAborted() {
		return
	}
	parseOptionalIntQuery(c, "authorUserId", &filter.AuthorUserID, h.badRequest)
	if c.IsAborted() {
		return
	}
	items, err := h.service.ListReleases(c.Request.Context(), filter)
	if err != nil {
		h.handleError(c, err, "failed to list releases")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateRelease godoc
// @Summary Create release
// @Tags Delivery
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param payload body releaseRequest true "Release payload"
// @Success 201 {object} Release
// @Failure 400 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /releases [post]
func (h *Handler) CreateRelease(c *gin.Context) {
	var req releaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.ProjectID == nil || req.Version == nil || req.Title == nil || req.Status == nil || req.AuthorUserID == nil {
		h.badRequest(c, errors.New("projectId, version, title, status and authorUserId are required"))
		return
	}
	targetDate, err := parseDate(req.TargetDate)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	deployedAt, err := parseDateTime(req.DeployedAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.CreateRelease(c.Request.Context(), CreateReleaseInput{
		ProjectID:       *req.ProjectID,
		Version:         *req.Version,
		Title:           *req.Title,
		Status:          *req.Status,
		TargetDate:      targetDate,
		DeployedAt:      deployedAt,
		CommitsCount:    intValue(req.CommitsCount, 0),
		AuthorUserID:    *req.AuthorUserID,
		FeaturesCount:   intValue(req.FeaturesCount, 0),
		FixesCount:      intValue(req.FixesCount, 0),
		BreakingCount:   intValue(req.BreakingCount, 0),
		ProgressPercent: intValue(req.ProgressPercent, 0),
	})
	if err != nil {
		h.handleError(c, err, "failed to create release")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetRelease godoc
// @Summary Get release
// @Tags Delivery
// @Security bearerAuth
// @Produce json
// @Param releaseId path int true "Release ID"
// @Success 200 {object} Release
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /releases/{releaseId} [get]
func (h *Handler) GetRelease(c *gin.Context) {
	id, ok := parseID(c, "releaseId")
	if !ok {
		return
	}
	item, err := h.service.GetReleaseByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get release")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateRelease godoc
// @Summary Update release
// @Tags Delivery
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param releaseId path int true "Release ID"
// @Param payload body releaseRequest true "Release payload"
// @Success 200 {object} Release
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /releases/{releaseId} [patch]
func (h *Handler) UpdateRelease(c *gin.Context) {
	id, ok := parseID(c, "releaseId")
	if !ok {
		return
	}
	var req releaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	targetDate, err := parseDate(req.TargetDate)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	deployedAt, err := parseDateTime(req.DeployedAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateRelease(c.Request.Context(), id, UpdateReleaseInput{
		Version:         req.Version,
		Title:           req.Title,
		Status:          req.Status,
		TargetDate:      targetDate,
		DeployedAt:      deployedAt,
		CommitsCount:    req.CommitsCount,
		AuthorUserID:    req.AuthorUserID,
		FeaturesCount:   req.FeaturesCount,
		FixesCount:      req.FixesCount,
		BreakingCount:   req.BreakingCount,
		ProgressPercent: req.ProgressPercent,
	})
	if err != nil {
		h.handleError(c, err, "failed to update release")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteRelease godoc
// @Summary Delete release
// @Tags Delivery
// @Security bearerAuth
// @Produce json
// @Param releaseId path int true "Release ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /releases/{releaseId} [delete]
func (h *Handler) DeleteRelease(c *gin.Context) {
	id, ok := parseID(c, "releaseId")
	if !ok {
		return
	}
	if err := h.service.DeleteRelease(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete release")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListPullRequests godoc
// @Summary List pull requests
// @Tags Delivery
// @Security bearerAuth
// @Produce json
// @Success 200 {array} PullRequest
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /pull-requests [get]
func (h *Handler) ListPullRequests(c *gin.Context) {
	filter := PullRequestFilter{Status: c.Query("status")}
	parseOptionalIntQuery(c, "projectId", &filter.ProjectID, h.badRequest)
	if c.IsAborted() {
		return
	}
	parseOptionalIntQuery(c, "releaseId", &filter.ReleaseID, h.badRequest)
	if c.IsAborted() {
		return
	}
	parseOptionalIntQuery(c, "authorUserId", &filter.AuthorUserID, h.badRequest)
	if c.IsAborted() {
		return
	}
	items, err := h.service.ListPullRequests(c.Request.Context(), filter)
	if err != nil {
		h.handleError(c, err, "failed to list pull requests")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreatePullRequest godoc
// @Summary Create pull request
// @Tags Delivery
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param payload body pullRequestRequest true "Pull request payload"
// @Success 201 {object} PullRequest
// @Failure 400 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /pull-requests [post]
func (h *Handler) CreatePullRequest(c *gin.Context) {
	var req pullRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.ProjectID == nil || req.Number == nil || req.Title == nil || req.Branch == nil || req.Status == nil || req.AuthorUserID == nil {
		h.badRequest(c, errors.New("projectId, number, title, branch, status and authorUserId are required"))
		return
	}
	mergedAt, err := parseDateTime(req.MergedAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.CreatePullRequest(c.Request.Context(), CreatePullRequestInput{
		ProjectID:    *req.ProjectID,
		ReleaseID:    req.ReleaseID,
		Number:       *req.Number,
		Title:        *req.Title,
		Branch:       *req.Branch,
		Status:       *req.Status,
		AuthorUserID: *req.AuthorUserID,
		CommitsCount: intValue(req.CommitsCount, 0),
		Additions:    intValue(req.Additions, 0),
		Deletions:    intValue(req.Deletions, 0),
		ExternalURL:  req.ExternalURL,
		MergedAt:     mergedAt,
	})
	if err != nil {
		h.handleError(c, err, "failed to create pull request")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetPullRequest godoc
// @Summary Get pull request
// @Tags Delivery
// @Security bearerAuth
// @Produce json
// @Param pullRequestId path int true "Pull request ID"
// @Success 200 {object} PullRequest
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /pull-requests/{pullRequestId} [get]
func (h *Handler) GetPullRequest(c *gin.Context) {
	id, ok := parseID(c, "pullRequestId")
	if !ok {
		return
	}
	item, err := h.service.GetPullRequestByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get pull request")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdatePullRequest godoc
// @Summary Update pull request
// @Tags Delivery
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param pullRequestId path int true "Pull request ID"
// @Param payload body pullRequestRequest true "Pull request payload"
// @Success 200 {object} PullRequest
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /pull-requests/{pullRequestId} [patch]
func (h *Handler) UpdatePullRequest(c *gin.Context) {
	id, ok := parseID(c, "pullRequestId")
	if !ok {
		return
	}
	var req pullRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	mergedAt, err := parseDateTime(req.MergedAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdatePullRequest(c.Request.Context(), id, UpdatePullRequestInput{
		ReleaseID:    req.ReleaseID,
		Number:       req.Number,
		Title:        req.Title,
		Branch:       req.Branch,
		Status:       req.Status,
		AuthorUserID: req.AuthorUserID,
		CommitsCount: req.CommitsCount,
		Additions:    req.Additions,
		Deletions:    req.Deletions,
		ExternalURL:  req.ExternalURL,
		MergedAt:     mergedAt,
	})
	if err != nil {
		h.handleError(c, err, "failed to update pull request")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeletePullRequest godoc
// @Summary Delete pull request
// @Tags Delivery
// @Security bearerAuth
// @Produce json
// @Param pullRequestId path int true "Pull request ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /pull-requests/{pullRequestId} [delete]
func (h *Handler) DeletePullRequest(c *gin.Context) {
	id, ok := parseID(c, "pullRequestId")
	if !ok {
		return
	}
	if err := h.service.DeletePullRequest(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete pull request")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (h *Handler) badRequest(c *gin.Context, err error) {
	h.logger.Warn().Err(err).Msg("invalid delivery request")
	c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"code": "bad_request", "message": err.Error()})
}

func (h *Handler) handleError(c *gin.Context, err error, msg string) {
	switch {
	case errors.Is(err, ErrReleaseNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "release_not_found", "message": "release not found"})
	case errors.Is(err, ErrPullRequestNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "pull_request_not_found", "message": "pull request not found"})
	case errors.Is(err, ErrDeliveryConflict):
		c.JSON(http.StatusConflict, gin.H{"code": "delivery_conflict", "message": "delivery conflict"})
	default:
		if contains(err.Error(), "invalid") || contains(err.Error(), "required") || contains(err.Error(), "non-negative") || contains(err.Error(), "between") || contains(err.Error(), "positive") {
			c.JSON(http.StatusBadRequest, gin.H{"code": "bad_request", "message": err.Error()})
			return
		}
		h.logger.Error().Err(err).Msg(msg)
		c.JSON(http.StatusInternalServerError, gin.H{"code": "internal_error", "message": msg})
	}
}

func parseID(c *gin.Context, key string) (int, bool) {
	id, err := strconv.Atoi(c.Param(key))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "bad_id", "message": key + " must be an integer"})
		return 0, false
	}
	return id, true
}

func parseOptionalIntQuery(c *gin.Context, key string, dest **int, onErr func(*gin.Context, error)) {
	if value := c.Query(key); value != "" {
		id, err := strconv.Atoi(value)
		if err != nil {
			onErr(c, err)
			return
		}
		*dest = &id
	}
}

func parseDate(value *string) (*time.Time, error) {
	if value == nil || *value == "" {
		return nil, nil
	}
	t, err := time.Parse("2006-01-02", *value)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func parseDateTime(value *string) (*time.Time, error) {
	if value == nil || *value == "" {
		return nil, nil
	}
	t, err := time.Parse(time.RFC3339, *value)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func intValue(value *int, fallback int) int {
	if value == nil {
		return fallback
	}
	return *value
}

func contains(s, sub string) bool {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
