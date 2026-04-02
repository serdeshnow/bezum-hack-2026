package project

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

type createProjectRequest struct {
	Key             string  `json:"key" binding:"required"`
	Name            string  `json:"name" binding:"required"`
	Description     *string `json:"description"`
	Status          string  `json:"status" binding:"required"`
	VisibilityMode  string  `json:"visibilityMode" binding:"required"`
	OwnerUserID     *int    `json:"ownerUserId" binding:"required"`
	ActiveEpochID   *int    `json:"activeEpochId"`
	DueDate         *string `json:"dueDate"`
	StartedAt       *string `json:"startedAt"`
	CompletedAt     *string `json:"completedAt"`
	ProgressPercent *int    `json:"progressPercent"`
}

type updateProjectRequest struct {
	Key             *string `json:"key"`
	Name            *string `json:"name"`
	Description     *string `json:"description"`
	Status          *string `json:"status"`
	VisibilityMode  *string `json:"visibilityMode"`
	OwnerUserID     *int    `json:"ownerUserId"`
	ActiveEpochID   *int    `json:"activeEpochId"`
	DueDate         *string `json:"dueDate"`
	StartedAt       *string `json:"startedAt"`
	CompletedAt     *string `json:"completedAt"`
	ProgressPercent *int    `json:"progressPercent"`
}

type createMemberRequest struct {
	UserID int    `json:"userId" binding:"required"`
	Role   string `json:"role"`
}

type updateMemberRequest struct {
	ProjectID *int    `json:"projectId"`
	UserID    *int    `json:"userId"`
	Role      *string `json:"role"`
}

// List godoc
// @Summary List projects
// @Tags Projects
// @Security bearerAuth
// @Produce json
// @Success 200 {array} Project
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /projects [get]
func (h *Handler) List(c *gin.Context) {
	filter := ProjectFilter{
		Status:         c.Query("status"),
		VisibilityMode: c.Query("visibilityMode"),
		Query:          c.Query("query"),
	}
	if v := c.Query("ownerUserId"); v != "" {
		id, err := strconv.Atoi(v)
		if err != nil {
			h.badRequest(c, err)
			return
		}
		filter.OwnerUserID = &id
	}
	items, err := h.service.List(c.Request.Context(), filter)
	if err != nil {
		h.handleError(c, err, "failed to list projects")
		return
	}
	c.JSON(http.StatusOK, items)
}

// Create godoc
// @Summary Create project
// @Tags Projects
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param payload body createProjectRequest true "Project payload"
// @Success 201 {object} Project
// @Failure 400 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /projects [post]
func (h *Handler) Create(c *gin.Context) {
	var req createProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	dueDate, err := parseDatePtr(req.DueDate)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	startedAt, err := parseDatePtr(req.StartedAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	completedAt, err := parseDatePtr(req.CompletedAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	progress := 0
	if req.ProgressPercent != nil {
		progress = *req.ProgressPercent
	}
	item, err := h.service.Create(c.Request.Context(), CreateProjectInput{
		Key:             req.Key,
		Name:            req.Name,
		Description:     req.Description,
		Status:          req.Status,
		VisibilityMode:  req.VisibilityMode,
		OwnerUserID:     req.OwnerUserID,
		ActiveEpochID:   req.ActiveEpochID,
		DueDate:         dueDate,
		StartedAt:       startedAt,
		CompletedAt:     completedAt,
		ProgressPercent: progress,
	})
	if err != nil {
		h.handleError(c, err, "failed to create project")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// Get godoc
// @Summary Get project
// @Tags Projects
// @Security bearerAuth
// @Produce json
// @Param projectId path int true "Project ID"
// @Success 200 {object} Project
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /projects/{projectId} [get]
func (h *Handler) Get(c *gin.Context) {
	id, ok := parseIDParam(c, "projectId")
	if !ok {
		return
	}
	item, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get project")
		return
	}
	c.JSON(http.StatusOK, item)
}

// Update godoc
// @Summary Update project
// @Tags Projects
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param projectId path int true "Project ID"
// @Param payload body updateProjectRequest true "Project payload"
// @Success 200 {object} Project
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /projects/{projectId} [patch]
func (h *Handler) Update(c *gin.Context) {
	id, ok := parseIDParam(c, "projectId")
	if !ok {
		return
	}
	var req updateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	dueDate, err := parseDatePtr(req.DueDate)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	startedAt, err := parseDatePtr(req.StartedAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	completedAt, err := parseDatePtr(req.CompletedAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.Update(c.Request.Context(), id, UpdateProjectInput{
		Key:             req.Key,
		Name:            req.Name,
		Description:     req.Description,
		Status:          req.Status,
		VisibilityMode:  req.VisibilityMode,
		OwnerUserID:     req.OwnerUserID,
		ActiveEpochID:   req.ActiveEpochID,
		DueDate:         dueDate,
		StartedAt:       startedAt,
		CompletedAt:     completedAt,
		ProgressPercent: req.ProgressPercent,
	})
	if err != nil {
		h.handleError(c, err, "failed to update project")
		return
	}
	c.JSON(http.StatusOK, item)
}

// Delete godoc
// @Summary Delete project
// @Tags Projects
// @Security bearerAuth
// @Produce json
// @Param projectId path int true "Project ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /projects/{projectId} [delete]
func (h *Handler) Delete(c *gin.Context) {
	id, ok := parseIDParam(c, "projectId")
	if !ok {
		return
	}
	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete project")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListMembers godoc
// @Summary List project members
// @Tags Projects
// @Security bearerAuth
// @Produce json
// @Param projectId path int true "Project ID"
// @Success 200 {array} Member
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /projects/{projectId}/members [get]
func (h *Handler) ListMembers(c *gin.Context) {
	projectID, ok := parseIDParam(c, "projectId")
	if !ok {
		return
	}
	filter := MemberFilter{ProjectID: projectID}
	if v := c.Query("userId"); v != "" {
		id, err := strconv.Atoi(v)
		if err != nil {
			h.badRequest(c, err)
			return
		}
		filter.UserID = &id
	}
	items, err := h.service.ListMembers(c.Request.Context(), filter)
	if err != nil {
		h.handleError(c, err, "failed to list project members")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateMember godoc
// @Summary Create project member
// @Tags Projects
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param projectId path int true "Project ID"
// @Param payload body createMemberRequest true "Project member payload"
// @Success 201 {object} Member
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /projects/{projectId}/members [post]
func (h *Handler) CreateMember(c *gin.Context) {
	projectID, ok := parseIDParam(c, "projectId")
	if !ok {
		return
	}
	var req createMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	role := "developer"
	if req.Role != "" {
		role = req.Role
	}
	item, err := h.service.CreateMember(c.Request.Context(), CreateMemberInput{
		ProjectID: projectID,
		UserID:    req.UserID,
		Role:      role,
	})
	if err != nil {
		h.handleError(c, err, "failed to create project member")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetMember godoc
// @Summary Get project member
// @Tags Projects
// @Security bearerAuth
// @Produce json
// @Param projectMemberId path int true "Project member ID"
// @Success 200 {object} Member
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /project-members/{projectMemberId} [get]
func (h *Handler) GetMember(c *gin.Context) {
	id, ok := parseIDParam(c, "projectMemberId")
	if !ok {
		return
	}
	item, err := h.service.GetMemberByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get project member")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateMember godoc
// @Summary Update project member
// @Tags Projects
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param projectMemberId path int true "Project member ID"
// @Param payload body updateMemberRequest true "Project member payload"
// @Success 200 {object} Member
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /project-members/{projectMemberId} [patch]
func (h *Handler) UpdateMember(c *gin.Context) {
	id, ok := parseIDParam(c, "projectMemberId")
	if !ok {
		return
	}
	var req updateMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateMember(c.Request.Context(), id, UpdateMemberInput(req))
	if err != nil {
		h.handleError(c, err, "failed to update project member")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteMember godoc
// @Summary Delete project member
// @Tags Projects
// @Security bearerAuth
// @Produce json
// @Param projectMemberId path int true "Project member ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /project-members/{projectMemberId} [delete]
func (h *Handler) DeleteMember(c *gin.Context) {
	id, ok := parseIDParam(c, "projectMemberId")
	if !ok {
		return
	}
	if err := h.service.DeleteMember(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete project member")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (h *Handler) badRequest(c *gin.Context, err error) {
	h.logger.Warn().Err(err).Msg("invalid project request")
	c.JSON(http.StatusBadRequest, gin.H{"code": "bad_request", "message": err.Error()})
}

func (h *Handler) handleError(c *gin.Context, err error, msg string) {
	switch {
	case errors.Is(err, ErrProjectNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "project_not_found", "message": "project not found"})
	case errors.Is(err, ErrMemberNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "project_member_not_found", "message": "project member not found"})
	case errors.Is(err, ErrProjectConflict):
		c.JSON(http.StatusConflict, gin.H{"code": "project_conflict", "message": "project conflict"})
	default:
		if contains(err.Error(), "invalid") || contains(err.Error(), "required") || contains(err.Error(), "between") {
			c.JSON(http.StatusBadRequest, gin.H{"code": "bad_request", "message": err.Error()})
			return
		}
		h.logger.Error().Err(err).Msg(msg)
		c.JSON(http.StatusInternalServerError, gin.H{"code": "internal_error", "message": msg})
	}
}

func parseIDParam(c *gin.Context, key string) (int, bool) {
	id, err := strconv.Atoi(c.Param(key))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "bad_id", "message": key + " must be an integer"})
		return 0, false
	}
	return id, true
}

func parseDatePtr(value *string) (*time.Time, error) {
	if value == nil || *value == "" {
		return nil, nil
	}
	t, err := time.Parse("2006-01-02", *value)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func contains(s, sub string) bool {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
