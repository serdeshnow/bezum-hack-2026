package task

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

type taskRequest struct {
	ProjectID      *int    `json:"projectId"`
	EpochID        *int    `json:"epochId"`
	Key            *string `json:"key"`
	Title          *string `json:"title"`
	Description    *string `json:"description"`
	Status         *string `json:"status"`
	Priority       *string `json:"priority"`
	AssigneeUserID *int    `json:"assigneeUserId"`
	ReporterUserID *int    `json:"reporterUserId"`
	DueDate        *string `json:"dueDate"`
	CreatedDate    *string `json:"createdDate"`
	ReleaseID      *int    `json:"releaseId"`
}

type tagRequest struct {
	Value *string `json:"value"`
}

type commentRequest struct {
	AuthorUserID *int    `json:"authorUserId"`
	Content      *string `json:"content"`
}

// List godoc
// @Summary List tasks
// @Tags Tasks
// @Security bearerAuth
// @Produce json
// @Success 200 {array} Task
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /tasks [get]
func (h *Handler) List(c *gin.Context) {
	filter := Filter{Status: c.Query("status"), Priority: c.Query("priority"), Query: c.Query("query")}
	parseOptionalIntQuery(c, "projectId", &filter.ProjectID, h.badRequest)
	if c.IsAborted() {
		return
	}
	parseOptionalIntQuery(c, "epochId", &filter.EpochID, h.badRequest)
	if c.IsAborted() {
		return
	}
	parseOptionalIntQuery(c, "assigneeUserId", &filter.AssigneeUserID, h.badRequest)
	if c.IsAborted() {
		return
	}
	parseOptionalIntQuery(c, "releaseId", &filter.ReleaseID, h.badRequest)
	if c.IsAborted() {
		return
	}
	items, err := h.service.List(c.Request.Context(), filter)
	if err != nil {
		h.handleError(c, err, "failed to list tasks")
		return
	}
	c.JSON(http.StatusOK, items)
}

// Create godoc
// @Summary Create task
// @Tags Tasks
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param payload body taskRequest true "Task payload"
// @Success 201 {object} Task
// @Failure 400 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /tasks [post]
func (h *Handler) Create(c *gin.Context) {
	var req taskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.ProjectID == nil || req.Key == nil || req.Title == nil || req.Description == nil || req.Status == nil || req.Priority == nil {
		h.badRequest(c, errors.New("projectId, key, title, description, status and priority are required"))
		return
	}
	dueDate, err := parseDate(req.DueDate)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	createdDate, err := parseDate(req.CreatedDate)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.Create(c.Request.Context(), CreateInput{
		ProjectID:      *req.ProjectID,
		EpochID:        req.EpochID,
		Key:            *req.Key,
		Title:          *req.Title,
		Description:    *req.Description,
		Status:         *req.Status,
		Priority:       *req.Priority,
		AssigneeUserID: req.AssigneeUserID,
		ReporterUserID: req.ReporterUserID,
		DueDate:        dueDate,
		CreatedDate:    createdDate,
		ReleaseID:      req.ReleaseID,
	})
	if err != nil {
		h.handleError(c, err, "failed to create task")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// Get godoc
// @Summary Get task
// @Tags Tasks
// @Security bearerAuth
// @Produce json
// @Param taskId path int true "Task ID"
// @Success 200 {object} Task
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /tasks/{taskId} [get]
func (h *Handler) Get(c *gin.Context) {
	id, ok := parseID(c, "taskId")
	if !ok {
		return
	}
	item, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get task")
		return
	}
	c.JSON(http.StatusOK, item)
}

// Update godoc
// @Summary Update task
// @Tags Tasks
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param taskId path int true "Task ID"
// @Param payload body taskRequest true "Task payload"
// @Success 200 {object} Task
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /tasks/{taskId} [patch]
func (h *Handler) Update(c *gin.Context) {
	id, ok := parseID(c, "taskId")
	if !ok {
		return
	}
	var req taskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	dueDate, err := parseDate(req.DueDate)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	createdDate, err := parseDate(req.CreatedDate)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.Update(c.Request.Context(), id, UpdateInput{
		EpochID:        req.EpochID,
		Key:            req.Key,
		Title:          req.Title,
		Description:    req.Description,
		Status:         req.Status,
		Priority:       req.Priority,
		AssigneeUserID: req.AssigneeUserID,
		ReporterUserID: req.ReporterUserID,
		DueDate:        dueDate,
		CreatedDate:    createdDate,
		ReleaseID:      req.ReleaseID,
	})
	if err != nil {
		h.handleError(c, err, "failed to update task")
		return
	}
	c.JSON(http.StatusOK, item)
}

// Delete godoc
// @Summary Delete task
// @Tags Tasks
// @Security bearerAuth
// @Produce json
// @Param taskId path int true "Task ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /tasks/{taskId} [delete]
func (h *Handler) Delete(c *gin.Context) {
	id, ok := parseID(c, "taskId")
	if !ok {
		return
	}
	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete task")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListTags godoc
// @Summary List task tags
// @Tags Tasks
// @Security bearerAuth
// @Produce json
// @Param taskId path int true "Task ID"
// @Success 200 {array} Tag
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /tasks/{taskId}/tags [get]
func (h *Handler) ListTags(c *gin.Context) {
	taskID, ok := parseID(c, "taskId")
	if !ok {
		return
	}
	items, err := h.service.ListTags(c.Request.Context(), taskID)
	if err != nil {
		h.handleError(c, err, "failed to list task tags")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateTag godoc
// @Summary Create task tag
// @Tags Tasks
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param taskId path int true "Task ID"
// @Param payload body tagRequest true "Task tag payload"
// @Success 201 {object} Tag
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /tasks/{taskId}/tags [post]
func (h *Handler) CreateTag(c *gin.Context) {
	taskID, ok := parseID(c, "taskId")
	if !ok {
		return
	}
	var req tagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.Value == nil {
		h.badRequest(c, errors.New("value is required"))
		return
	}
	item, err := h.service.CreateTag(c.Request.Context(), CreateTagInput{TaskID: taskID, Value: *req.Value})
	if err != nil {
		h.handleError(c, err, "failed to create task tag")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetTag godoc
// @Summary Get task tag
// @Tags Tasks
// @Security bearerAuth
// @Produce json
// @Param taskTagId path int true "Task tag ID"
// @Success 200 {object} Tag
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /task-tags/{taskTagId} [get]
func (h *Handler) GetTag(c *gin.Context) {
	id, ok := parseID(c, "taskTagId")
	if !ok {
		return
	}
	item, err := h.service.GetTagByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get task tag")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateTag godoc
// @Summary Update task tag
// @Tags Tasks
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param taskTagId path int true "Task tag ID"
// @Param payload body tagRequest true "Task tag payload"
// @Success 200 {object} Tag
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /task-tags/{taskTagId} [patch]
func (h *Handler) UpdateTag(c *gin.Context) {
	id, ok := parseID(c, "taskTagId")
	if !ok {
		return
	}
	var req tagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateTag(c.Request.Context(), id, UpdateTagInput(req))
	if err != nil {
		h.handleError(c, err, "failed to update task tag")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteTag godoc
// @Summary Delete task tag
// @Tags Tasks
// @Security bearerAuth
// @Produce json
// @Param taskTagId path int true "Task tag ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /task-tags/{taskTagId} [delete]
func (h *Handler) DeleteTag(c *gin.Context) {
	id, ok := parseID(c, "taskTagId")
	if !ok {
		return
	}
	if err := h.service.DeleteTag(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete task tag")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListComments godoc
// @Summary List task comments
// @Tags Tasks
// @Security bearerAuth
// @Produce json
// @Param taskId path int true "Task ID"
// @Success 200 {array} Comment
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /tasks/{taskId}/comments [get]
func (h *Handler) ListComments(c *gin.Context) {
	taskID, ok := parseID(c, "taskId")
	if !ok {
		return
	}
	filter := CommentFilter{TaskID: taskID}
	parseOptionalIntQuery(c, "authorUserId", &filter.AuthorUserID, h.badRequest)
	if c.IsAborted() {
		return
	}
	items, err := h.service.ListComments(c.Request.Context(), filter)
	if err != nil {
		h.handleError(c, err, "failed to list task comments")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateComment godoc
// @Summary Create task comment
// @Tags Tasks
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param taskId path int true "Task ID"
// @Param payload body commentRequest true "Task comment payload"
// @Success 201 {object} Comment
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /tasks/{taskId}/comments [post]
func (h *Handler) CreateComment(c *gin.Context) {
	taskID, ok := parseID(c, "taskId")
	if !ok {
		return
	}
	var req commentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.AuthorUserID == nil || req.Content == nil {
		h.badRequest(c, errors.New("authorUserId and content are required"))
		return
	}
	item, err := h.service.CreateComment(c.Request.Context(), CreateCommentInput{
		TaskID:       taskID,
		AuthorUserID: *req.AuthorUserID,
		Content:      *req.Content,
	})
	if err != nil {
		h.handleError(c, err, "failed to create task comment")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetComment godoc
// @Summary Get task comment
// @Tags Tasks
// @Security bearerAuth
// @Produce json
// @Param taskCommentId path int true "Task comment ID"
// @Success 200 {object} Comment
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /task-comments/{taskCommentId} [get]
func (h *Handler) GetComment(c *gin.Context) {
	id, ok := parseID(c, "taskCommentId")
	if !ok {
		return
	}
	item, err := h.service.GetCommentByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get task comment")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateComment godoc
// @Summary Update task comment
// @Tags Tasks
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param taskCommentId path int true "Task comment ID"
// @Param payload body commentRequest true "Task comment payload"
// @Success 200 {object} Comment
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /task-comments/{taskCommentId} [patch]
func (h *Handler) UpdateComment(c *gin.Context) {
	id, ok := parseID(c, "taskCommentId")
	if !ok {
		return
	}
	var req commentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateComment(c.Request.Context(), id, UpdateCommentInput{Content: req.Content})
	if err != nil {
		h.handleError(c, err, "failed to update task comment")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteComment godoc
// @Summary Delete task comment
// @Tags Tasks
// @Security bearerAuth
// @Produce json
// @Param taskCommentId path int true "Task comment ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /task-comments/{taskCommentId} [delete]
func (h *Handler) DeleteComment(c *gin.Context) {
	id, ok := parseID(c, "taskCommentId")
	if !ok {
		return
	}
	if err := h.service.DeleteComment(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete task comment")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (h *Handler) badRequest(c *gin.Context, err error) {
	h.logger.Warn().Err(err).Msg("invalid task request")
	c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"code": "bad_request", "message": err.Error()})
}

func (h *Handler) handleError(c *gin.Context, err error, msg string) {
	switch {
	case errors.Is(err, ErrTaskNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "task_not_found", "message": "task not found"})
	case errors.Is(err, ErrTaskTagNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "task_tag_not_found", "message": "task tag not found"})
	case errors.Is(err, ErrTaskCommentNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "task_comment_not_found", "message": "task comment not found"})
	case errors.Is(err, ErrTaskConflict):
		c.JSON(http.StatusConflict, gin.H{"code": "task_conflict", "message": "task conflict"})
	default:
		if contains(err.Error(), "invalid") || contains(err.Error(), "required") {
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

func contains(s, sub string) bool {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
