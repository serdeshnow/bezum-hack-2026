package user

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	authctx "github.com/serdeshnow/bezum-hack-2026/backend/internal/auth"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
)

type Handler struct {
	service *Service
	logger  *logger.Logger
}

type loginErrorResponse struct {
	Code    string `json:"code" example:"invalid_credentials"`
	Message string `json:"message" example:"invalid credentials"`
}

type authSuccessResponse struct {
	Success bool `json:"success" example:"true"`
}

type deleteResponse struct {
	Deleted bool `json:"deleted" example:"true"`
}

func NewHandler(service *Service, log *logger.Logger) *Handler {
	return &Handler{
		service: service,
		logger:  log,
	}
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type createUserRequest struct {
	Email        string  `json:"email" binding:"required,email"`
	FirstName    string  `json:"firstName" binding:"required"`
	LastName     string  `json:"lastName" binding:"required"`
	DisplayName  *string `json:"displayName"`
	AvatarURL    *string `json:"avatarUrl"`
	Role         string  `json:"role" binding:"required"`
	IsActive     *bool   `json:"isActive"`
	Password     *string `json:"password"`
	PasswordHash *string `json:"passwordHash"`
}

type updateUserRequest struct {
	Email        *string `json:"email"`
	FirstName    *string `json:"firstName"`
	LastName     *string `json:"lastName"`
	DisplayName  *string `json:"displayName"`
	AvatarURL    *string `json:"avatarUrl"`
	Role         *string `json:"role"`
	IsActive     *bool   `json:"isActive"`
	Password     *string `json:"password"`
	PasswordHash *string `json:"passwordHash"`
}

type replacePreferencesRequest struct {
	Theme                       string `json:"theme" binding:"required"`
	CompactMode                 *bool  `json:"compactMode"`
	EmailNotifications          *bool  `json:"emailNotifications"`
	TaskAssignmentsEnabled      *bool  `json:"taskAssignmentsEnabled"`
	MeetingRemindersEnabled     *bool  `json:"meetingRemindersEnabled"`
	ReleaseNotificationsEnabled *bool  `json:"releaseNotificationsEnabled"`
	MentionNotificationsEnabled *bool  `json:"mentionNotificationsEnabled"`
}

type patchPreferencesRequest struct {
	Theme                       *string `json:"theme"`
	CompactMode                 *bool   `json:"compactMode"`
	EmailNotifications          *bool   `json:"emailNotifications"`
	TaskAssignmentsEnabled      *bool   `json:"taskAssignmentsEnabled"`
	MeetingRemindersEnabled     *bool   `json:"meetingRemindersEnabled"`
	ReleaseNotificationsEnabled *bool   `json:"releaseNotificationsEnabled"`
	MentionNotificationsEnabled *bool   `json:"mentionNotificationsEnabled"`
}

// Login godoc
// @Summary Login user
// @Tags Identity
// @Accept json
// @Produce json
// @Param payload body loginRequest true "Login payload"
// @Success 200 {object} LoginResult
// @Failure 400 {object} loginErrorResponse
// @Failure 401 {object} loginErrorResponse
// @Failure 403 {object} loginErrorResponse
// @Router /auth/login [post]
func (h *Handler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}

	result, err := h.service.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		switch {
		case errors.Is(err, ErrInvalidCredentials):
			h.logger.Warn().Err(err).Str("email", req.Email).Msg("login rejected")
			c.JSON(http.StatusUnauthorized, gin.H{"code": "invalid_credentials", "message": "invalid credentials"})
		case errors.Is(err, ErrForbidden):
			h.logger.Warn().Err(err).Str("email", req.Email).Msg("inactive user login rejected")
			c.JSON(http.StatusForbidden, gin.H{"code": "inactive_user", "message": "user is inactive"})
		default:
			h.internalError(c, err, "failed to login")
		}
		return
	}

	c.JSON(http.StatusOK, result)
}

// Logout godoc
// @Summary Logout user
// @Tags Identity
// @Security bearerAuth
// @Produce json
// @Success 200 {object} authSuccessResponse
// @Failure 401 {object} loginErrorResponse
// @Failure 500 {object} loginErrorResponse
// @Router /auth/logout [post]
func (h *Handler) Logout(c *gin.Context) {
	auth, ok := authctx.Get(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"code": "missing_auth_context", "message": "authorization required"})
		return
	}

	if err := h.service.Logout(c.Request.Context(), auth.SessionID); err != nil {
		h.internalError(c, err, "failed to logout")
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// Me godoc
// @Summary Current authenticated user
// @Tags Identity
// @Security bearerAuth
// @Produce json
// @Success 200 {object} User
// @Failure 401 {object} loginErrorResponse
// @Failure 404 {object} loginErrorResponse
// @Failure 500 {object} loginErrorResponse
// @Router /auth/me [get]
func (h *Handler) Me(c *gin.Context) {
	auth, ok := authctx.Get(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"code": "missing_auth_context", "message": "authorization required"})
		return
	}

	user, err := h.service.GetByID(c.Request.Context(), auth.UserID)
	if err != nil {
		h.handleUserError(c, err, "failed to load current user")
		return
	}

	c.JSON(http.StatusOK, user)
}

// List godoc
// @Summary List users
// @Tags Identity
// @Security bearerAuth
// @Produce json
// @Success 200 {array} User
// @Failure 400 {object} loginErrorResponse
// @Failure 500 {object} loginErrorResponse
// @Router /users [get]
func (h *Handler) List(c *gin.Context) {
	filter := UserFilter{
		Role:  c.Query("role"),
		Query: c.Query("query"),
	}
	if value := c.Query("isActive"); value != "" {
		parsed, err := strconv.ParseBool(value)
		if err != nil {
			h.badRequest(c, err)
			return
		}
		filter.IsActive = &parsed
	}

	users, err := h.service.List(c.Request.Context(), filter)
	if err != nil {
		h.handleUserError(c, err, "failed to list users")
		return
	}

	c.JSON(http.StatusOK, users)
}

// Create godoc
// @Summary Create user
// @Tags Identity
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param payload body createUserRequest true "User payload"
// @Success 201 {object} User
// @Failure 400 {object} loginErrorResponse
// @Failure 409 {object} loginErrorResponse
// @Failure 500 {object} loginErrorResponse
// @Router /users [post]
func (h *Handler) Create(c *gin.Context) {
	var req createUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	passwordHash := req.PasswordHash
	if req.Password != nil {
		hash, err := hashPassword(*req.Password)
		if err != nil {
			h.internalError(c, err, "failed to hash password")
			return
		}
		passwordHash = &hash
	}

	created, err := h.service.Create(c.Request.Context(), CreateUserInput{
		Email:        req.Email,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		DisplayName:  req.DisplayName,
		AvatarURL:    req.AvatarURL,
		Role:         req.Role,
		IsActive:     isActive,
		PasswordHash: passwordHash,
	})
	if err != nil {
		h.handleUserError(c, err, "failed to create user")
		return
	}

	c.JSON(http.StatusCreated, created)
}

// Get godoc
// @Summary Get user
// @Tags Identity
// @Security bearerAuth
// @Produce json
// @Param userId path int true "User ID"
// @Success 200 {object} User
// @Failure 400 {object} loginErrorResponse
// @Failure 404 {object} loginErrorResponse
// @Failure 500 {object} loginErrorResponse
// @Router /users/{userId} [get]
func (h *Handler) Get(c *gin.Context) {
	userID, ok := parseUserID(c)
	if !ok {
		return
	}

	user, err := h.service.GetByID(c.Request.Context(), userID)
	if err != nil {
		h.handleUserError(c, err, "failed to get user")
		return
	}

	c.JSON(http.StatusOK, user)
}

// Update godoc
// @Summary Update user
// @Tags Identity
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param userId path int true "User ID"
// @Param payload body updateUserRequest true "User payload"
// @Success 200 {object} User
// @Failure 400 {object} loginErrorResponse
// @Failure 404 {object} loginErrorResponse
// @Failure 409 {object} loginErrorResponse
// @Failure 500 {object} loginErrorResponse
// @Router /users/{userId} [patch]
func (h *Handler) Update(c *gin.Context) {
	userID, ok := parseUserID(c)
	if !ok {
		return
	}

	var req updateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}

	passwordHash := req.PasswordHash
	if req.Password != nil {
		hash, err := hashPassword(*req.Password)
		if err != nil {
			h.internalError(c, err, "failed to hash password")
			return
		}
		passwordHash = &hash
	}

	updated, err := h.service.Update(c.Request.Context(), userID, UpdateUserInput{
		Email:        req.Email,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		DisplayName:  req.DisplayName,
		AvatarURL:    req.AvatarURL,
		Role:         req.Role,
		IsActive:     req.IsActive,
		PasswordHash: passwordHash,
	})
	if err != nil {
		h.handleUserError(c, err, "failed to update user")
		return
	}

	c.JSON(http.StatusOK, updated)
}

// Delete godoc
// @Summary Delete user
// @Tags Identity
// @Security bearerAuth
// @Produce json
// @Param userId path int true "User ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} loginErrorResponse
// @Failure 404 {object} loginErrorResponse
// @Failure 500 {object} loginErrorResponse
// @Router /users/{userId} [delete]
func (h *Handler) Delete(c *gin.Context) {
	userID, ok := parseUserID(c)
	if !ok {
		return
	}

	if err := h.service.Delete(c.Request.Context(), userID); err != nil {
		h.handleUserError(c, err, "failed to delete user")
		return
	}

	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// GetPreferences godoc
// @Summary Get user preferences
// @Tags Identity
// @Security bearerAuth
// @Produce json
// @Param userId path int true "User ID"
// @Success 200 {object} Preferences
// @Failure 400 {object} loginErrorResponse
// @Failure 404 {object} loginErrorResponse
// @Failure 500 {object} loginErrorResponse
// @Router /users/{userId}/preferences [get]
func (h *Handler) GetPreferences(c *gin.Context) {
	userID, ok := parseUserID(c)
	if !ok {
		return
	}

	prefs, err := h.service.GetPreferences(c.Request.Context(), userID)
	if err != nil {
		h.handleUserError(c, err, "failed to get user preferences")
		return
	}

	c.JSON(http.StatusOK, prefs)
}

// ReplacePreferences godoc
// @Summary Replace user preferences
// @Tags Identity
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param userId path int true "User ID"
// @Param payload body replacePreferencesRequest true "Preferences payload"
// @Success 200 {object} Preferences
// @Failure 400 {object} loginErrorResponse
// @Failure 404 {object} loginErrorResponse
// @Failure 500 {object} loginErrorResponse
// @Router /users/{userId}/preferences [put]
func (h *Handler) ReplacePreferences(c *gin.Context) {
	userID, ok := parseUserID(c)
	if !ok {
		return
	}

	var req replacePreferencesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}

	prefs, err := h.service.ReplacePreferences(c.Request.Context(), PreferencesUpsertInput{
		UserID:                      userID,
		Theme:                       req.Theme,
		CompactMode:                 boolValue(req.CompactMode, false),
		EmailNotifications:          boolValue(req.EmailNotifications, true),
		TaskAssignmentsEnabled:      boolValue(req.TaskAssignmentsEnabled, true),
		MeetingRemindersEnabled:     boolValue(req.MeetingRemindersEnabled, true),
		ReleaseNotificationsEnabled: boolValue(req.ReleaseNotificationsEnabled, true),
		MentionNotificationsEnabled: boolValue(req.MentionNotificationsEnabled, true),
	})
	if err != nil {
		h.handleUserError(c, err, "failed to replace user preferences")
		return
	}

	c.JSON(http.StatusOK, prefs)
}

// PatchPreferences godoc
// @Summary Patch user preferences
// @Tags Identity
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param userId path int true "User ID"
// @Param payload body patchPreferencesRequest true "Preferences payload"
// @Success 200 {object} Preferences
// @Failure 400 {object} loginErrorResponse
// @Failure 404 {object} loginErrorResponse
// @Failure 500 {object} loginErrorResponse
// @Router /users/{userId}/preferences [patch]
func (h *Handler) PatchPreferences(c *gin.Context) {
	userID, ok := parseUserID(c)
	if !ok {
		return
	}

	var req patchPreferencesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}

	prefs, err := h.service.PatchPreferences(c.Request.Context(), userID, UpdatePreferencesInput(req))
	if err != nil {
		h.handleUserError(c, err, "failed to patch user preferences")
		return
	}

	c.JSON(http.StatusOK, prefs)
}

func (h *Handler) badRequest(c *gin.Context, err error) {
	h.logger.Warn().Err(err).Msg("invalid request payload")
	c.JSON(http.StatusBadRequest, gin.H{"code": "bad_request", "message": err.Error()})
}

func (h *Handler) internalError(c *gin.Context, err error, msg string) {
	h.logger.Error().Err(err).Msg(msg)
	c.JSON(http.StatusInternalServerError, gin.H{"code": "internal_error", "message": msg})
}

func (h *Handler) handleUserError(c *gin.Context, err error, msg string) {
	switch {
	case errors.Is(err, ErrUserNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "user_not_found", "message": "user not found"})
	case errors.Is(err, ErrPreferencesAbsent):
		c.JSON(http.StatusNotFound, gin.H{"code": "preferences_not_found", "message": "user preferences not found"})
	case errors.Is(err, ErrDuplicateEmail):
		c.JSON(http.StatusConflict, gin.H{"code": "duplicate_email", "message": "user with this email already exists"})
	case errors.Is(err, ErrForbidden):
		c.JSON(http.StatusForbidden, gin.H{"code": "forbidden", "message": "forbidden"})
	default:
		if stringsContainsValidation(err) {
			c.JSON(http.StatusBadRequest, gin.H{"code": "bad_request", "message": err.Error()})
			return
		}
		h.internalError(c, err, msg)
	}
}

func parseUserID(c *gin.Context) (int, bool) {
	value := c.Param("userId")
	userID, err := strconv.Atoi(value)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "bad_user_id", "message": "userId must be an integer"})
		return 0, false
	}

	return userID, true
}

func boolValue(value *bool, fallback bool) bool {
	if value == nil {
		return fallback
	}

	return *value
}

func stringsContainsValidation(err error) bool {
	message := err.Error()
	return containsAny(message, "invalid", "required", "must be")
}

func containsAny(message string, tokens ...string) bool {
	for _, token := range tokens {
		if token != "" && (len(message) >= len(token)) && (stringContains(message, token)) {
			return true
		}
	}
	return false
}

func stringContains(source, token string) bool {
	return len(token) == 0 || (len(source) >= len(token) && (func() bool {
		for i := 0; i <= len(source)-len(token); i++ {
			if source[i:i+len(token)] == token {
				return true
			}
		}
		return false
	})())
}
