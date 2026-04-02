package planning

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

type epochRequest struct {
	ProjectID *int    `json:"projectId"`
	Name      *string `json:"name"`
	Phase     *string `json:"phase"`
	Status    *string `json:"status"`
	StartDate *string `json:"startDate"`
	EndDate   *string `json:"endDate"`
}

type goalRequest struct {
	EpochID         *int    `json:"epochId"`
	Title           *string `json:"title"`
	Description     *string `json:"description"`
	Status          *string `json:"status"`
	ProgressPercent *int    `json:"progressPercent"`
	OwnerUserID     *int    `json:"ownerUserId"`
}

// ListEpochs godoc
// @Summary List epochs
// @Tags Planning
// @Security bearerAuth
// @Produce json
// @Success 200 {array} Epoch
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /epochs [get]
func (h *Handler) ListEpochs(c *gin.Context) {
	filter := EpochFilter{Status: c.Query("status")}
	if v := c.Query("projectId"); v != "" {
		id, err := strconv.Atoi(v)
		if err != nil {
			h.badRequest(c, err)
			return
		}
		filter.ProjectID = &id
	}
	items, err := h.service.ListEpochs(c.Request.Context(), filter)
	if err != nil {
		h.handleError(c, err, "failed to list epochs")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateEpoch godoc
// @Summary Create epoch
// @Tags Planning
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param payload body epochRequest true "Epoch payload"
// @Success 201 {object} Epoch
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /epochs [post]
func (h *Handler) CreateEpoch(c *gin.Context) {
	var req epochRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.ProjectID == nil || req.Name == nil || req.Status == nil {
		h.badRequest(c, errors.New("projectId, name and status are required"))
		return
	}
	startDate, err := parseDate(req.StartDate)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	endDate, err := parseDate(req.EndDate)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	phase := "delivery"
	if req.Phase != nil {
		phase = *req.Phase
	}
	item, err := h.service.CreateEpoch(c.Request.Context(), CreateEpochInput{
		ProjectID: *req.ProjectID,
		Name:      *req.Name,
		Phase:     phase,
		Status:    *req.Status,
		StartDate: startDate,
		EndDate:   endDate,
	})
	if err != nil {
		h.handleError(c, err, "failed to create epoch")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetEpoch godoc
// @Summary Get epoch
// @Tags Planning
// @Security bearerAuth
// @Produce json
// @Param epochId path int true "Epoch ID"
// @Success 200 {object} Epoch
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /epochs/{epochId} [get]
func (h *Handler) GetEpoch(c *gin.Context) {
	id, ok := parseID(c, "epochId")
	if !ok {
		return
	}
	item, err := h.service.GetEpochByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get epoch")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateEpoch godoc
// @Summary Update epoch
// @Tags Planning
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param epochId path int true "Epoch ID"
// @Param payload body epochRequest true "Epoch payload"
// @Success 200 {object} Epoch
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /epochs/{epochId} [patch]
func (h *Handler) UpdateEpoch(c *gin.Context) {
	id, ok := parseID(c, "epochId")
	if !ok {
		return
	}
	var req epochRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	startDate, err := parseDate(req.StartDate)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	endDate, err := parseDate(req.EndDate)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateEpoch(c.Request.Context(), id, UpdateEpochInput{
		Name:      req.Name,
		Phase:     req.Phase,
		Status:    req.Status,
		StartDate: startDate,
		EndDate:   endDate,
	})
	if err != nil {
		h.handleError(c, err, "failed to update epoch")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteEpoch godoc
// @Summary Delete epoch
// @Tags Planning
// @Security bearerAuth
// @Produce json
// @Param epochId path int true "Epoch ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /epochs/{epochId} [delete]
func (h *Handler) DeleteEpoch(c *gin.Context) {
	id, ok := parseID(c, "epochId")
	if !ok {
		return
	}
	if err := h.service.DeleteEpoch(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete epoch")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListGoals godoc
// @Summary List goals
// @Tags Planning
// @Security bearerAuth
// @Produce json
// @Success 200 {array} Goal
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /goals [get]
func (h *Handler) ListGoals(c *gin.Context) {
	filter := GoalFilter{Status: c.Query("status")}
	if v := c.Query("epochId"); v != "" {
		id, err := strconv.Atoi(v)
		if err != nil {
			h.badRequest(c, err)
			return
		}
		filter.EpochID = &id
	}
	if v := c.Query("ownerUserId"); v != "" {
		id, err := strconv.Atoi(v)
		if err != nil {
			h.badRequest(c, err)
			return
		}
		filter.OwnerUserID = &id
	}
	items, err := h.service.ListGoals(c.Request.Context(), filter)
	if err != nil {
		h.handleError(c, err, "failed to list goals")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateGoal godoc
// @Summary Create goal
// @Tags Planning
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param payload body goalRequest true "Goal payload"
// @Success 201 {object} Goal
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /goals [post]
func (h *Handler) CreateGoal(c *gin.Context) {
	var req goalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.EpochID == nil || req.Title == nil || req.Status == nil {
		h.badRequest(c, errors.New("epochId, title and status are required"))
		return
	}
	progress := 0
	if req.ProgressPercent != nil {
		progress = *req.ProgressPercent
	}
	item, err := h.service.CreateGoal(c.Request.Context(), CreateGoalInput{
		EpochID:         *req.EpochID,
		Title:           *req.Title,
		Description:     req.Description,
		Status:          *req.Status,
		ProgressPercent: progress,
		OwnerUserID:     req.OwnerUserID,
	})
	if err != nil {
		h.handleError(c, err, "failed to create goal")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetGoal godoc
// @Summary Get goal
// @Tags Planning
// @Security bearerAuth
// @Produce json
// @Param goalId path int true "Goal ID"
// @Success 200 {object} Goal
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /goals/{goalId} [get]
func (h *Handler) GetGoal(c *gin.Context) {
	id, ok := parseID(c, "goalId")
	if !ok {
		return
	}
	item, err := h.service.GetGoalByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get goal")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateGoal godoc
// @Summary Update goal
// @Tags Planning
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param goalId path int true "Goal ID"
// @Param payload body goalRequest true "Goal payload"
// @Success 200 {object} Goal
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /goals/{goalId} [patch]
func (h *Handler) UpdateGoal(c *gin.Context) {
	id, ok := parseID(c, "goalId")
	if !ok {
		return
	}
	var req goalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateGoal(c.Request.Context(), id, UpdateGoalInput{
		Title:           req.Title,
		Description:     req.Description,
		Status:          req.Status,
		ProgressPercent: req.ProgressPercent,
		OwnerUserID:     req.OwnerUserID,
	})
	if err != nil {
		h.handleError(c, err, "failed to update goal")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteGoal godoc
// @Summary Delete goal
// @Tags Planning
// @Security bearerAuth
// @Produce json
// @Param goalId path int true "Goal ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /goals/{goalId} [delete]
func (h *Handler) DeleteGoal(c *gin.Context) {
	id, ok := parseID(c, "goalId")
	if !ok {
		return
	}
	if err := h.service.DeleteGoal(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete goal")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (h *Handler) badRequest(c *gin.Context, err error) {
	h.logger.Warn().Err(err).Msg("invalid planning request")
	c.JSON(http.StatusBadRequest, gin.H{"code": "bad_request", "message": err.Error()})
}

func (h *Handler) handleError(c *gin.Context, err error, msg string) {
	switch {
	case errors.Is(err, ErrEpochNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "epoch_not_found", "message": "epoch not found"})
	case errors.Is(err, ErrGoalNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "goal_not_found", "message": "goal not found"})
	default:
		if contains(err.Error(), "invalid") || contains(err.Error(), "required") || contains(err.Error(), "between") {
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
