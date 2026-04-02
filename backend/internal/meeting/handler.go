package meeting

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

type meetingRequest struct {
	ProjectID            *int    `json:"projectId"`
	EpochID              *int    `json:"epochId"`
	SourceContextType    *string `json:"sourceContextType"`
	SourceContextID      *int    `json:"sourceContextId"`
	Title                *string `json:"title"`
	Description          *string `json:"description"`
	Type                 *string `json:"type"`
	Status               *string `json:"status"`
	StartsAt             *string `json:"startsAt"`
	EndsAt               *string `json:"endsAt"`
	RecordingURL         *string `json:"recordingUrl"`
	RecordingDurationSec *int    `json:"recordingDurationSec"`
	AISummaryApproved    *bool   `json:"aiSummaryApproved"`
}

type participantRequest struct {
	UserID    *int    `json:"userId"`
	RoleLabel *string `json:"roleLabel"`
	Attended  *bool   `json:"attended"`
}

type availabilitySlotRequest struct {
	StartsAt      *string `json:"startsAt"`
	EndsAt        *string `json:"endsAt"`
	Score         *int    `json:"score"`
	IsRecommended *bool   `json:"isRecommended"`
}

type availabilityVoteRequest struct {
	ParticipantUserID *int    `json:"participantUserId"`
	Status            *string `json:"status"`
}

type transcriptEntryRequest struct {
	SpeakerUserID *int    `json:"speakerUserId"`
	SpeakerName   *string `json:"speakerName"`
	StartsAtSec   *int    `json:"startsAtSec"`
	Text          *string `json:"text"`
}

type decisionRequest struct {
	Decision    *string `json:"decision"`
	Rationale   *string `json:"rationale"`
	OwnerUserID *int    `json:"ownerUserId"`
}

type actionItemRequest struct {
	TaskID         *int    `json:"taskId"`
	TaskText       *string `json:"taskText"`
	AssigneeUserID *int    `json:"assigneeUserId"`
	DueDate        *string `json:"dueDate"`
	Priority       *string `json:"priority"`
	AlreadyTask    *bool   `json:"alreadyTask"`
}

type linkedDocumentRequest struct {
	DocumentID       *int    `json:"documentId"`
	UpdateSuggestion *string `json:"updateSuggestion"`
}

// ListMeetings godoc
// @Summary List meetings
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Success 200 {array} Meeting
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings [get]
func (h *Handler) ListMeetings(c *gin.Context) {
	filter := MeetingFilter{SourceContextType: c.Query("sourceContextType"), Status: c.Query("status"), Type: c.Query("type")}
	parseOptionalIntQuery(c, "projectId", &filter.ProjectID, h.badRequest)
	if c.IsAborted() {
		return
	}
	parseOptionalIntQuery(c, "epochId", &filter.EpochID, h.badRequest)
	if c.IsAborted() {
		return
	}
	items, err := h.service.ListMeetings(c.Request.Context(), filter)
	if err != nil {
		h.handleError(c, err, "failed to list meetings")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateMeeting godoc
// @Summary Create meeting
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param payload body meetingRequest true "Meeting payload"
// @Success 201 {object} Meeting
// @Failure 400 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings [post]
func (h *Handler) CreateMeeting(c *gin.Context) {
	var req meetingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.ProjectID == nil || req.SourceContextType == nil || req.Title == nil || req.Type == nil || req.Status == nil {
		h.badRequest(c, errors.New("projectId, sourceContextType, title, type and status are required"))
		return
	}
	startsAt, err := parseDateTime(req.StartsAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	endsAt, err := parseDateTime(req.EndsAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.CreateMeeting(c.Request.Context(), CreateMeetingInput{
		ProjectID:            *req.ProjectID,
		EpochID:              req.EpochID,
		SourceContextType:    *req.SourceContextType,
		SourceContextID:      req.SourceContextID,
		Title:                *req.Title,
		Description:          req.Description,
		Type:                 *req.Type,
		Status:               *req.Status,
		StartsAt:             startsAt,
		EndsAt:               endsAt,
		RecordingURL:         req.RecordingURL,
		RecordingDurationSec: req.RecordingDurationSec,
		AISummaryApproved:    boolValue(req.AISummaryApproved, false),
	})
	if err != nil {
		h.handleError(c, err, "failed to create meeting")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetMeeting godoc
// @Summary Get meeting
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param meetingId path int true "Meeting ID"
// @Success 200 {object} Meeting
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings/{meetingId} [get]
func (h *Handler) GetMeeting(c *gin.Context) {
	id, ok := parseID(c, "meetingId")
	if !ok {
		return
	}
	item, err := h.service.GetMeetingByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get meeting")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateMeeting godoc
// @Summary Update meeting
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param meetingId path int true "Meeting ID"
// @Param payload body meetingRequest true "Meeting payload"
// @Success 200 {object} Meeting
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings/{meetingId} [patch]
func (h *Handler) UpdateMeeting(c *gin.Context) {
	id, ok := parseID(c, "meetingId")
	if !ok {
		return
	}
	var req meetingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	startsAt, err := parseDateTime(req.StartsAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	endsAt, err := parseDateTime(req.EndsAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateMeeting(c.Request.Context(), id, UpdateMeetingInput{
		EpochID:              req.EpochID,
		SourceContextType:    req.SourceContextType,
		SourceContextID:      req.SourceContextID,
		Title:                req.Title,
		Description:          req.Description,
		Type:                 req.Type,
		Status:               req.Status,
		StartsAt:             startsAt,
		EndsAt:               endsAt,
		RecordingURL:         req.RecordingURL,
		RecordingDurationSec: req.RecordingDurationSec,
		AISummaryApproved:    req.AISummaryApproved,
	})
	if err != nil {
		h.handleError(c, err, "failed to update meeting")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteMeeting godoc
// @Summary Delete meeting
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param meetingId path int true "Meeting ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings/{meetingId} [delete]
func (h *Handler) DeleteMeeting(c *gin.Context) {
	id, ok := parseID(c, "meetingId")
	if !ok {
		return
	}
	if err := h.service.DeleteMeeting(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete meeting")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListParticipants godoc
// @Summary List meeting participants
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param meetingId path int true "Meeting ID"
// @Success 200 {array} Participant
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings/{meetingId}/participants [get]
func (h *Handler) ListParticipants(c *gin.Context) {
	meetingID, ok := parseID(c, "meetingId")
	if !ok {
		return
	}
	filter := ParticipantFilter{MeetingID: meetingID}
	parseOptionalBoolQuery(c, "attended", &filter.Attended, h.badRequest)
	if c.IsAborted() {
		return
	}
	items, err := h.service.ListParticipants(c.Request.Context(), filter)
	if err != nil {
		h.handleError(c, err, "failed to list meeting participants")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateParticipant godoc
// @Summary Create meeting participant
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param meetingId path int true "Meeting ID"
// @Param payload body participantRequest true "Participant payload"
// @Success 201 {object} Participant
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings/{meetingId}/participants [post]
func (h *Handler) CreateParticipant(c *gin.Context) {
	meetingID, ok := parseID(c, "meetingId")
	if !ok {
		return
	}
	var req participantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.UserID == nil || req.RoleLabel == nil {
		h.badRequest(c, errors.New("userId and roleLabel are required"))
		return
	}
	item, err := h.service.CreateParticipant(c.Request.Context(), CreateParticipantInput{
		MeetingID: meetingID, UserID: *req.UserID, RoleLabel: *req.RoleLabel, Attended: boolValue(req.Attended, false),
	})
	if err != nil {
		h.handleError(c, err, "failed to create meeting participant")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetParticipant godoc
// @Summary Get meeting participant
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param meetingParticipantId path int true "Meeting participant ID"
// @Success 200 {object} Participant
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-participants/{meetingParticipantId} [get]
func (h *Handler) GetParticipant(c *gin.Context) {
	id, ok := parseID(c, "meetingParticipantId")
	if !ok {
		return
	}
	item, err := h.service.GetParticipantByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get meeting participant")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateParticipant godoc
// @Summary Update meeting participant
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param meetingParticipantId path int true "Meeting participant ID"
// @Param payload body participantRequest true "Participant payload"
// @Success 200 {object} Participant
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-participants/{meetingParticipantId} [patch]
func (h *Handler) UpdateParticipant(c *gin.Context) {
	id, ok := parseID(c, "meetingParticipantId")
	if !ok {
		return
	}
	var req participantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateParticipant(c.Request.Context(), id, UpdateParticipantInput(req))
	if err != nil {
		h.handleError(c, err, "failed to update meeting participant")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteParticipant godoc
// @Summary Delete meeting participant
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param meetingParticipantId path int true "Meeting participant ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-participants/{meetingParticipantId} [delete]
func (h *Handler) DeleteParticipant(c *gin.Context) {
	id, ok := parseID(c, "meetingParticipantId")
	if !ok {
		return
	}
	if err := h.service.DeleteParticipant(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete meeting participant")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListAvailabilitySlots godoc
// @Summary List meeting availability slots
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param meetingId path int true "Meeting ID"
// @Success 200 {array} AvailabilitySlot
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings/{meetingId}/availability-slots [get]
func (h *Handler) ListAvailabilitySlots(c *gin.Context) {
	meetingID, ok := parseID(c, "meetingId")
	if !ok {
		return
	}
	items, err := h.service.ListAvailabilitySlots(c.Request.Context(), meetingID)
	if err != nil {
		h.handleError(c, err, "failed to list meeting availability slots")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateAvailabilitySlot godoc
// @Summary Create meeting availability slot
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param meetingId path int true "Meeting ID"
// @Param payload body availabilitySlotRequest true "Availability slot payload"
// @Success 201 {object} AvailabilitySlot
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings/{meetingId}/availability-slots [post]
func (h *Handler) CreateAvailabilitySlot(c *gin.Context) {
	meetingID, ok := parseID(c, "meetingId")
	if !ok {
		return
	}
	var req availabilitySlotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.StartsAt == nil || req.EndsAt == nil {
		h.badRequest(c, errors.New("startsAt and endsAt are required"))
		return
	}
	startsAt, err := parseDateTime(req.StartsAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	endsAt, err := parseDateTime(req.EndsAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.CreateAvailabilitySlot(c.Request.Context(), CreateAvailabilitySlotInput{
		MeetingID: meetingID, StartsAt: *startsAt, EndsAt: *endsAt, Score: intValue(req.Score, 0), IsRecommended: boolValue(req.IsRecommended, false),
	})
	if err != nil {
		h.handleError(c, err, "failed to create meeting availability slot")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetAvailabilitySlot godoc
// @Summary Get meeting availability slot
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param slotId path int true "Slot ID"
// @Success 200 {object} AvailabilitySlot
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-availability-slots/{slotId} [get]
func (h *Handler) GetAvailabilitySlot(c *gin.Context) {
	id, ok := parseID(c, "slotId")
	if !ok {
		return
	}
	item, err := h.service.GetAvailabilitySlotByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get meeting availability slot")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateAvailabilitySlot godoc
// @Summary Update meeting availability slot
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param slotId path int true "Slot ID"
// @Param payload body availabilitySlotRequest true "Availability slot payload"
// @Success 200 {object} AvailabilitySlot
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-availability-slots/{slotId} [patch]
func (h *Handler) UpdateAvailabilitySlot(c *gin.Context) {
	id, ok := parseID(c, "slotId")
	if !ok {
		return
	}
	var req availabilitySlotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	startsAt, err := parseDateTime(req.StartsAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	endsAt, err := parseDateTime(req.EndsAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateAvailabilitySlot(c.Request.Context(), id, UpdateAvailabilitySlotInput{
		StartsAt: startsAt, EndsAt: endsAt, Score: req.Score, IsRecommended: req.IsRecommended,
	})
	if err != nil {
		h.handleError(c, err, "failed to update meeting availability slot")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteAvailabilitySlot godoc
// @Summary Delete meeting availability slot
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param slotId path int true "Slot ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-availability-slots/{slotId} [delete]
func (h *Handler) DeleteAvailabilitySlot(c *gin.Context) {
	id, ok := parseID(c, "slotId")
	if !ok {
		return
	}
	if err := h.service.DeleteAvailabilitySlot(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete meeting availability slot")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListAvailabilityVotes godoc
// @Summary List meeting availability votes
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param slotId path int true "Slot ID"
// @Success 200 {array} AvailabilityVote
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-availability-slots/{slotId}/votes [get]
func (h *Handler) ListAvailabilityVotes(c *gin.Context) {
	slotID, ok := parseID(c, "slotId")
	if !ok {
		return
	}
	items, err := h.service.ListAvailabilityVotes(c.Request.Context(), AvailabilityVoteFilter{SlotID: slotID, Status: c.Query("status")})
	if err != nil {
		h.handleError(c, err, "failed to list meeting availability votes")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateAvailabilityVote godoc
// @Summary Create meeting availability vote
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param slotId path int true "Slot ID"
// @Param payload body availabilityVoteRequest true "Availability vote payload"
// @Success 201 {object} AvailabilityVote
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-availability-slots/{slotId}/votes [post]
func (h *Handler) CreateAvailabilityVote(c *gin.Context) {
	slotID, ok := parseID(c, "slotId")
	if !ok {
		return
	}
	var req availabilityVoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.ParticipantUserID == nil || req.Status == nil {
		h.badRequest(c, errors.New("participantUserId and status are required"))
		return
	}
	item, err := h.service.CreateAvailabilityVote(c.Request.Context(), CreateAvailabilityVoteInput{
		SlotID: slotID, ParticipantUserID: *req.ParticipantUserID, Status: *req.Status,
	})
	if err != nil {
		h.handleError(c, err, "failed to create meeting availability vote")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetAvailabilityVote godoc
// @Summary Get meeting availability vote
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param voteId path int true "Vote ID"
// @Success 200 {object} AvailabilityVote
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-availability-votes/{voteId} [get]
func (h *Handler) GetAvailabilityVote(c *gin.Context) {
	id, ok := parseID(c, "voteId")
	if !ok {
		return
	}
	item, err := h.service.GetAvailabilityVoteByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get meeting availability vote")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateAvailabilityVote godoc
// @Summary Update meeting availability vote
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param voteId path int true "Vote ID"
// @Param payload body availabilityVoteRequest true "Availability vote payload"
// @Success 200 {object} AvailabilityVote
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-availability-votes/{voteId} [patch]
func (h *Handler) UpdateAvailabilityVote(c *gin.Context) {
	id, ok := parseID(c, "voteId")
	if !ok {
		return
	}
	var req availabilityVoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateAvailabilityVote(c.Request.Context(), id, UpdateAvailabilityVoteInput(req))
	if err != nil {
		h.handleError(c, err, "failed to update meeting availability vote")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteAvailabilityVote godoc
// @Summary Delete meeting availability vote
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param voteId path int true "Vote ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-availability-votes/{voteId} [delete]
func (h *Handler) DeleteAvailabilityVote(c *gin.Context) {
	id, ok := parseID(c, "voteId")
	if !ok {
		return
	}
	if err := h.service.DeleteAvailabilityVote(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete meeting availability vote")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListTranscriptEntries godoc
// @Summary List meeting transcript entries
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param meetingId path int true "Meeting ID"
// @Success 200 {array} TranscriptEntry
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings/{meetingId}/transcript-entries [get]
func (h *Handler) ListTranscriptEntries(c *gin.Context) {
	meetingID, ok := parseID(c, "meetingId")
	if !ok {
		return
	}
	filter := TranscriptEntryFilter{MeetingID: meetingID}
	parseOptionalIntQuery(c, "speakerUserId", &filter.SpeakerUserID, h.badRequest)
	if c.IsAborted() {
		return
	}
	items, err := h.service.ListTranscriptEntries(c.Request.Context(), filter)
	if err != nil {
		h.handleError(c, err, "failed to list meeting transcript entries")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateTranscriptEntry godoc
// @Summary Create meeting transcript entry
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param meetingId path int true "Meeting ID"
// @Param payload body transcriptEntryRequest true "Transcript entry payload"
// @Success 201 {object} TranscriptEntry
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings/{meetingId}/transcript-entries [post]
func (h *Handler) CreateTranscriptEntry(c *gin.Context) {
	meetingID, ok := parseID(c, "meetingId")
	if !ok {
		return
	}
	var req transcriptEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.StartsAtSec == nil || req.Text == nil {
		h.badRequest(c, errors.New("startsAtSec and text are required"))
		return
	}
	item, err := h.service.CreateTranscriptEntry(c.Request.Context(), CreateTranscriptEntryInput{
		MeetingID: meetingID, SpeakerUserID: req.SpeakerUserID, SpeakerName: req.SpeakerName, StartsAtSec: *req.StartsAtSec, Text: *req.Text,
	})
	if err != nil {
		h.handleError(c, err, "failed to create meeting transcript entry")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetTranscriptEntry godoc
// @Summary Get meeting transcript entry
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param entryId path int true "Transcript entry ID"
// @Success 200 {object} TranscriptEntry
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-transcript-entries/{entryId} [get]
func (h *Handler) GetTranscriptEntry(c *gin.Context) {
	id, ok := parseID(c, "entryId")
	if !ok {
		return
	}
	item, err := h.service.GetTranscriptEntryByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get meeting transcript entry")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateTranscriptEntry godoc
// @Summary Update meeting transcript entry
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param entryId path int true "Transcript entry ID"
// @Param payload body transcriptEntryRequest true "Transcript entry payload"
// @Success 200 {object} TranscriptEntry
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-transcript-entries/{entryId} [patch]
func (h *Handler) UpdateTranscriptEntry(c *gin.Context) {
	id, ok := parseID(c, "entryId")
	if !ok {
		return
	}
	var req transcriptEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateTranscriptEntry(c.Request.Context(), id, UpdateTranscriptEntryInput(req))
	if err != nil {
		h.handleError(c, err, "failed to update meeting transcript entry")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteTranscriptEntry godoc
// @Summary Delete meeting transcript entry
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param entryId path int true "Transcript entry ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-transcript-entries/{entryId} [delete]
func (h *Handler) DeleteTranscriptEntry(c *gin.Context) {
	id, ok := parseID(c, "entryId")
	if !ok {
		return
	}
	if err := h.service.DeleteTranscriptEntry(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete meeting transcript entry")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListDecisions godoc
// @Summary List meeting decisions
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param meetingId path int true "Meeting ID"
// @Success 200 {array} Decision
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings/{meetingId}/decisions [get]
func (h *Handler) ListDecisions(c *gin.Context) {
	meetingID, ok := parseID(c, "meetingId")
	if !ok {
		return
	}
	items, err := h.service.ListDecisions(c.Request.Context(), meetingID)
	if err != nil {
		h.handleError(c, err, "failed to list meeting decisions")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateDecision godoc
// @Summary Create meeting decision
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param meetingId path int true "Meeting ID"
// @Param payload body decisionRequest true "Decision payload"
// @Success 201 {object} Decision
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings/{meetingId}/decisions [post]
func (h *Handler) CreateDecision(c *gin.Context) {
	meetingID, ok := parseID(c, "meetingId")
	if !ok {
		return
	}
	var req decisionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.Decision == nil {
		h.badRequest(c, errors.New("decision is required"))
		return
	}
	item, err := h.service.CreateDecision(c.Request.Context(), CreateDecisionInput{
		MeetingID: meetingID, Decision: *req.Decision, Rationale: req.Rationale, OwnerUserID: req.OwnerUserID,
	})
	if err != nil {
		h.handleError(c, err, "failed to create meeting decision")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetDecision godoc
// @Summary Get meeting decision
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param decisionId path int true "Decision ID"
// @Success 200 {object} Decision
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-decisions/{decisionId} [get]
func (h *Handler) GetDecision(c *gin.Context) {
	id, ok := parseID(c, "decisionId")
	if !ok {
		return
	}
	item, err := h.service.GetDecisionByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get meeting decision")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateDecision godoc
// @Summary Update meeting decision
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param decisionId path int true "Decision ID"
// @Param payload body decisionRequest true "Decision payload"
// @Success 200 {object} Decision
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-decisions/{decisionId} [patch]
func (h *Handler) UpdateDecision(c *gin.Context) {
	id, ok := parseID(c, "decisionId")
	if !ok {
		return
	}
	var req decisionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateDecision(c.Request.Context(), id, UpdateDecisionInput(req))
	if err != nil {
		h.handleError(c, err, "failed to update meeting decision")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteDecision godoc
// @Summary Delete meeting decision
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param decisionId path int true "Decision ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-decisions/{decisionId} [delete]
func (h *Handler) DeleteDecision(c *gin.Context) {
	id, ok := parseID(c, "decisionId")
	if !ok {
		return
	}
	if err := h.service.DeleteDecision(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete meeting decision")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListActionItems godoc
// @Summary List meeting action items
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param meetingId path int true "Meeting ID"
// @Success 200 {array} ActionItem
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings/{meetingId}/action-items [get]
func (h *Handler) ListActionItems(c *gin.Context) {
	meetingID, ok := parseID(c, "meetingId")
	if !ok {
		return
	}
	items, err := h.service.ListActionItems(c.Request.Context(), meetingID)
	if err != nil {
		h.handleError(c, err, "failed to list meeting action items")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateActionItem godoc
// @Summary Create meeting action item
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param meetingId path int true "Meeting ID"
// @Param payload body actionItemRequest true "Action item payload"
// @Success 201 {object} ActionItem
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings/{meetingId}/action-items [post]
func (h *Handler) CreateActionItem(c *gin.Context) {
	meetingID, ok := parseID(c, "meetingId")
	if !ok {
		return
	}
	var req actionItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.TaskText == nil || req.Priority == nil {
		h.badRequest(c, errors.New("taskText and priority are required"))
		return
	}
	dueDate, err := parseDate(req.DueDate)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.CreateActionItem(c.Request.Context(), CreateActionItemInput{
		MeetingID: meetingID, TaskID: req.TaskID, TaskText: *req.TaskText, AssigneeUserID: req.AssigneeUserID, DueDate: dueDate, Priority: *req.Priority, AlreadyTask: boolValue(req.AlreadyTask, false),
	})
	if err != nil {
		h.handleError(c, err, "failed to create meeting action item")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetActionItem godoc
// @Summary Get meeting action item
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param actionItemId path int true "Action item ID"
// @Success 200 {object} ActionItem
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-action-items/{actionItemId} [get]
func (h *Handler) GetActionItem(c *gin.Context) {
	id, ok := parseID(c, "actionItemId")
	if !ok {
		return
	}
	item, err := h.service.GetActionItemByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get meeting action item")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateActionItem godoc
// @Summary Update meeting action item
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param actionItemId path int true "Action item ID"
// @Param payload body actionItemRequest true "Action item payload"
// @Success 200 {object} ActionItem
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-action-items/{actionItemId} [patch]
func (h *Handler) UpdateActionItem(c *gin.Context) {
	id, ok := parseID(c, "actionItemId")
	if !ok {
		return
	}
	var req actionItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	dueDate, err := parseDate(req.DueDate)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateActionItem(c.Request.Context(), id, UpdateActionItemInput{
		TaskID: req.TaskID, TaskText: req.TaskText, AssigneeUserID: req.AssigneeUserID, DueDate: dueDate, Priority: req.Priority, AlreadyTask: req.AlreadyTask,
	})
	if err != nil {
		h.handleError(c, err, "failed to update meeting action item")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteActionItem godoc
// @Summary Delete meeting action item
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param actionItemId path int true "Action item ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-action-items/{actionItemId} [delete]
func (h *Handler) DeleteActionItem(c *gin.Context) {
	id, ok := parseID(c, "actionItemId")
	if !ok {
		return
	}
	if err := h.service.DeleteActionItem(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete meeting action item")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListLinkedDocuments godoc
// @Summary List meeting linked documents
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param meetingId path int true "Meeting ID"
// @Success 200 {array} LinkedDocument
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings/{meetingId}/linked-documents [get]
func (h *Handler) ListLinkedDocuments(c *gin.Context) {
	meetingID, ok := parseID(c, "meetingId")
	if !ok {
		return
	}
	items, err := h.service.ListLinkedDocuments(c.Request.Context(), meetingID)
	if err != nil {
		h.handleError(c, err, "failed to list meeting linked documents")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateLinkedDocument godoc
// @Summary Create meeting linked document
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param meetingId path int true "Meeting ID"
// @Param payload body linkedDocumentRequest true "Linked document payload"
// @Success 201 {object} LinkedDocument
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meetings/{meetingId}/linked-documents [post]
func (h *Handler) CreateLinkedDocument(c *gin.Context) {
	meetingID, ok := parseID(c, "meetingId")
	if !ok {
		return
	}
	var req linkedDocumentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.DocumentID == nil {
		h.badRequest(c, errors.New("documentId is required"))
		return
	}
	item, err := h.service.CreateLinkedDocument(c.Request.Context(), CreateLinkedDocumentInput{
		MeetingID: meetingID, DocumentID: *req.DocumentID, UpdateSuggestion: req.UpdateSuggestion,
	})
	if err != nil {
		h.handleError(c, err, "failed to create meeting linked document")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetLinkedDocument godoc
// @Summary Get meeting linked document
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param meetingLinkedDocumentId path int true "Linked document ID"
// @Success 200 {object} LinkedDocument
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-linked-documents/{meetingLinkedDocumentId} [get]
func (h *Handler) GetLinkedDocument(c *gin.Context) {
	id, ok := parseID(c, "meetingLinkedDocumentId")
	if !ok {
		return
	}
	item, err := h.service.GetLinkedDocumentByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get meeting linked document")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateLinkedDocument godoc
// @Summary Update meeting linked document
// @Tags Meetings
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param meetingLinkedDocumentId path int true "Linked document ID"
// @Param payload body linkedDocumentRequest true "Linked document payload"
// @Success 200 {object} LinkedDocument
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-linked-documents/{meetingLinkedDocumentId} [patch]
func (h *Handler) UpdateLinkedDocument(c *gin.Context) {
	id, ok := parseID(c, "meetingLinkedDocumentId")
	if !ok {
		return
	}
	var req linkedDocumentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateLinkedDocument(c.Request.Context(), id, UpdateLinkedDocumentInput(req))
	if err != nil {
		h.handleError(c, err, "failed to update meeting linked document")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteLinkedDocument godoc
// @Summary Delete meeting linked document
// @Tags Meetings
// @Security bearerAuth
// @Produce json
// @Param meetingLinkedDocumentId path int true "Linked document ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /meeting-linked-documents/{meetingLinkedDocumentId} [delete]
func (h *Handler) DeleteLinkedDocument(c *gin.Context) {
	id, ok := parseID(c, "meetingLinkedDocumentId")
	if !ok {
		return
	}
	if err := h.service.DeleteLinkedDocument(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete meeting linked document")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (h *Handler) badRequest(c *gin.Context, err error) {
	h.logger.Warn().Err(err).Msg("invalid meeting request")
	c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"code": "bad_request", "message": err.Error()})
}

func (h *Handler) handleError(c *gin.Context, err error, msg string) {
	switch {
	case errors.Is(err, ErrMeetingNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "meeting_not_found", "message": "meeting not found"})
	case errors.Is(err, ErrMeetingParticipantNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "meeting_participant_not_found", "message": "meeting participant not found"})
	case errors.Is(err, ErrAvailabilitySlotNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "meeting_availability_slot_not_found", "message": "meeting availability slot not found"})
	case errors.Is(err, ErrAvailabilityVoteNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "meeting_availability_vote_not_found", "message": "meeting availability vote not found"})
	case errors.Is(err, ErrTranscriptEntryNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "meeting_transcript_entry_not_found", "message": "meeting transcript entry not found"})
	case errors.Is(err, ErrMeetingDecisionNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "meeting_decision_not_found", "message": "meeting decision not found"})
	case errors.Is(err, ErrMeetingActionItemNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "meeting_action_item_not_found", "message": "meeting action item not found"})
	case errors.Is(err, ErrMeetingLinkedDocumentNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "meeting_linked_document_not_found", "message": "meeting linked document not found"})
	case errors.Is(err, ErrMeetingConflict):
		c.JSON(http.StatusConflict, gin.H{"code": "meeting_conflict", "message": "meeting conflict"})
	default:
		if contains(err.Error(), "invalid") || contains(err.Error(), "required") || contains(err.Error(), "positive") || contains(err.Error(), "after") || contains(err.Error(), "non-negative") {
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

func boolValue(value *bool, fallback bool) bool {
	if value == nil {
		return fallback
	}
	return *value
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
