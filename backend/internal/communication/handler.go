package communication

import (
	"encoding/json"
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

type activityFeedResponse struct {
	ID           int                    `json:"id"`
	ProjectID    int                    `json:"projectId"`
	ActorUserID  *int                   `json:"actorUserId,omitempty"`
	Type         string                 `json:"type"`
	Action       string                 `json:"action"`
	Title        string                 `json:"title"`
	MetadataJSON map[string]interface{} `json:"metadataJson,omitempty"`
	CreatedAt    time.Time              `json:"createdAt"`
	UpdatedAt    time.Time              `json:"updatedAt"`
}

func NewHandler(service *Service, log *logger.Logger) *Handler {
	return &Handler{service: service, logger: log}
}

type notificationRequest struct {
	UserID      *int    `json:"userId"`
	ActorUserID *int    `json:"actorUserId"`
	Type        *string `json:"type"`
	Title       *string `json:"title"`
	Description *string `json:"description"`
	EntityType  *string `json:"entityType"`
	EntityID    *int    `json:"entityId"`
	Channel     *string `json:"channel"`
	ReadAt      *string `json:"readAt"`
}

type activityFeedRequest struct {
	ProjectID    *int                   `json:"projectId"`
	ActorUserID  *int                   `json:"actorUserId"`
	Type         *string                `json:"type"`
	Action       *string                `json:"action"`
	Title        *string                `json:"title"`
	MetadataJSON map[string]interface{} `json:"metadataJson"`
}

// ListNotifications godoc
// @Summary List notifications
// @Tags Communication
// @Security bearerAuth
// @Produce json
// @Success 200 {array} Notification
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /notifications [get]
func (h *Handler) ListNotifications(c *gin.Context) {
	filter := NotificationFilter{EntityType: c.Query("entityType")}
	parseOptionalIntQuery(c, "userId", &filter.UserID, h.badRequest)
	if c.IsAborted() {
		return
	}
	parseOptionalIntQuery(c, "actorUserId", &filter.ActorUserID, h.badRequest)
	if c.IsAborted() {
		return
	}
	parseOptionalBoolQuery(c, "unreadOnly", &filter.UnreadOnly, h.badRequest)
	if c.IsAborted() {
		return
	}
	items, err := h.service.ListNotifications(c.Request.Context(), filter)
	if err != nil {
		h.handleError(c, err, "failed to list notifications")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateNotification godoc
// @Summary Create notification
// @Tags Communication
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param payload body notificationRequest true "Notification payload"
// @Success 201 {object} Notification
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /notifications [post]
func (h *Handler) CreateNotification(c *gin.Context) {
	var req notificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.UserID == nil || req.Title == nil || req.Description == nil {
		h.badRequest(c, errors.New("userId, title and description are required"))
		return
	}
	readAt, err := parseDateTime(req.ReadAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.CreateNotification(c.Request.Context(), CreateNotificationInput{
		UserID:      *req.UserID,
		ActorUserID: req.ActorUserID,
		Type:        stringValue(req.Type),
		Title:       *req.Title,
		Description: *req.Description,
		EntityType:  req.EntityType,
		EntityID:    req.EntityID,
		Channel:     req.Channel,
		ReadAt:      readAt,
	})
	if err != nil {
		h.handleError(c, err, "failed to create notification")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetNotification godoc
// @Summary Get notification
// @Tags Communication
// @Security bearerAuth
// @Produce json
// @Param notificationId path int true "Notification ID"
// @Success 200 {object} Notification
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /notifications/{notificationId} [get]
func (h *Handler) GetNotification(c *gin.Context) {
	id, ok := parseID(c, "notificationId")
	if !ok {
		return
	}
	item, err := h.service.GetNotificationByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get notification")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateNotification godoc
// @Summary Update notification
// @Tags Communication
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param notificationId path int true "Notification ID"
// @Param payload body notificationRequest true "Notification payload"
// @Success 200 {object} Notification
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /notifications/{notificationId} [patch]
func (h *Handler) UpdateNotification(c *gin.Context) {
	id, ok := parseID(c, "notificationId")
	if !ok {
		return
	}
	var req notificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	readAt, err := parseDateTime(req.ReadAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateNotification(c.Request.Context(), id, UpdateNotificationInput{
		ActorUserID: req.ActorUserID,
		Type:        req.Type,
		Title:       req.Title,
		Description: req.Description,
		EntityType:  req.EntityType,
		EntityID:    req.EntityID,
		Channel:     req.Channel,
		ReadAt:      readAt,
	})
	if err != nil {
		h.handleError(c, err, "failed to update notification")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteNotification godoc
// @Summary Delete notification
// @Tags Communication
// @Security bearerAuth
// @Produce json
// @Param notificationId path int true "Notification ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /notifications/{notificationId} [delete]
func (h *Handler) DeleteNotification(c *gin.Context) {
	id, ok := parseID(c, "notificationId")
	if !ok {
		return
	}
	if err := h.service.DeleteNotification(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete notification")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListActivityFeed godoc
// @Summary List activity feed entries
// @Tags Communication
// @Security bearerAuth
// @Produce json
// @Success 200 {array} activityFeedResponse
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /activity-feed [get]
func (h *Handler) ListActivityFeed(c *gin.Context) {
	filter := ActivityFeedFilter{Type: c.Query("type"), Action: c.Query("action")}
	parseOptionalIntQuery(c, "projectId", &filter.ProjectID, h.badRequest)
	if c.IsAborted() {
		return
	}
	parseOptionalIntQuery(c, "actorUserId", &filter.ActorUserID, h.badRequest)
	if c.IsAborted() {
		return
	}
	items, err := h.service.ListActivityFeed(c.Request.Context(), filter)
	if err != nil {
		h.handleError(c, err, "failed to list activity feed")
		return
	}
	c.JSON(http.StatusOK, toActivityFeedResponses(items))
}

// CreateActivityFeed godoc
// @Summary Create activity feed entry
// @Tags Communication
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param payload body activityFeedRequest true "Activity feed payload"
// @Success 201 {object} activityFeedResponse
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /activity-feed [post]
func (h *Handler) CreateActivityFeed(c *gin.Context) {
	var req activityFeedRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.ProjectID == nil || req.Type == nil || req.Action == nil || req.Title == nil {
		h.badRequest(c, errors.New("projectId, type, action and title are required"))
		return
	}
	item, err := h.service.CreateActivityFeed(c.Request.Context(), CreateActivityFeedInput{
		ProjectID:    *req.ProjectID,
		ActorUserID:  req.ActorUserID,
		Type:         *req.Type,
		Action:       *req.Action,
		Title:        *req.Title,
		MetadataJSON: mustMarshalMetadata(req.MetadataJSON),
	})
	if err != nil {
		h.handleError(c, err, "failed to create activity feed entry")
		return
	}
	c.JSON(http.StatusCreated, toActivityFeedResponse(item))
}

// GetActivityFeed godoc
// @Summary Get activity feed entry
// @Tags Communication
// @Security bearerAuth
// @Produce json
// @Param activityFeedId path int true "Activity feed ID"
// @Success 200 {object} activityFeedResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /activity-feed/{activityFeedId} [get]
func (h *Handler) GetActivityFeed(c *gin.Context) {
	id, ok := parseID(c, "activityFeedId")
	if !ok {
		return
	}
	item, err := h.service.GetActivityFeedByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get activity feed entry")
		return
	}
	c.JSON(http.StatusOK, toActivityFeedResponse(item))
}

// UpdateActivityFeed godoc
// @Summary Update activity feed entry
// @Tags Communication
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param activityFeedId path int true "Activity feed ID"
// @Param payload body activityFeedRequest true "Activity feed payload"
// @Success 200 {object} activityFeedResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /activity-feed/{activityFeedId} [patch]
func (h *Handler) UpdateActivityFeed(c *gin.Context) {
	id, ok := parseID(c, "activityFeedId")
	if !ok {
		return
	}
	var req activityFeedRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateActivityFeed(c.Request.Context(), id, UpdateActivityFeedInput{
		ActorUserID:  req.ActorUserID,
		Type:         req.Type,
		Action:       req.Action,
		Title:        req.Title,
		MetadataJSON: mustMarshalMetadata(req.MetadataJSON),
	})
	if err != nil {
		h.handleError(c, err, "failed to update activity feed entry")
		return
	}
	c.JSON(http.StatusOK, toActivityFeedResponse(item))
}

// DeleteActivityFeed godoc
// @Summary Delete activity feed entry
// @Tags Communication
// @Security bearerAuth
// @Produce json
// @Param activityFeedId path int true "Activity feed ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /activity-feed/{activityFeedId} [delete]
func (h *Handler) DeleteActivityFeed(c *gin.Context) {
	id, ok := parseID(c, "activityFeedId")
	if !ok {
		return
	}
	if err := h.service.DeleteActivityFeed(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete activity feed entry")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (h *Handler) badRequest(c *gin.Context, err error) {
	h.logger.Warn().Err(err).Msg("invalid communication request")
	c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"code": "bad_request", "message": err.Error()})
}

func (h *Handler) handleError(c *gin.Context, err error, msg string) {
	switch {
	case errors.Is(err, ErrNotificationNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "notification_not_found", "message": "notification not found"})
	case errors.Is(err, ErrActivityFeedNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "activity_feed_not_found", "message": "activity feed entry not found"})
	default:
		if contains(err.Error(), "invalid") || contains(err.Error(), "required") || contains(err.Error(), "positive") {
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

func parseOptionalBoolQuery(c *gin.Context, key string, dest **bool, onErr func(*gin.Context, error)) {
	if value := c.Query(key); value != "" {
		parsed, err := strconv.ParseBool(value)
		if err != nil {
			onErr(c, err)
			return
		}
		*dest = &parsed
	}
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

func stringValue(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func mustMarshalMetadata(value map[string]interface{}) []byte {
	if value == nil {
		return []byte(`{}`)
	}
	payload, err := json.Marshal(value)
	if err != nil {
		return []byte(`{}`)
	}
	return payload
}

func toActivityFeedResponse(item *ActivityFeed) activityFeedResponse {
	if item == nil {
		return activityFeedResponse{}
	}
	var metadata map[string]interface{}
	if len(item.MetadataJSON) > 0 {
		_ = json.Unmarshal(item.MetadataJSON, &metadata)
	}
	return activityFeedResponse{
		ID:           item.ID,
		ProjectID:    item.ProjectID,
		ActorUserID:  item.ActorUserID,
		Type:         item.Type,
		Action:       item.Action,
		Title:        item.Title,
		MetadataJSON: metadata,
		CreatedAt:    item.CreatedAt,
		UpdatedAt:    item.UpdatedAt,
	}
}

func toActivityFeedResponses(items []ActivityFeed) []activityFeedResponse {
	out := make([]activityFeedResponse, 0, len(items))
	for i := range items {
		item := items[i]
		out = append(out, toActivityFeedResponse(&item))
	}
	return out
}

func contains(s, sub string) bool {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
