package meeting

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/nextcloud"
)

type Service struct {
	repo      *Repository
	nextcloud *nextcloud.Client
	scheduler CompletionScheduler
	logger    *logger.Logger
}

func NewService(repo *Repository, nextcloudClient *nextcloud.Client, scheduler CompletionScheduler, log *logger.Logger) *Service {
	return &Service{repo: repo, nextcloud: nextcloudClient, scheduler: scheduler, logger: log}
}

func (s *Service) CreateMeeting(ctx context.Context, input CreateMeetingInput) (*Meeting, error) {
	if input.ProjectID <= 0 || strings.TrimSpace(input.Title) == "" {
		return nil, fmt.Errorf("projectId and title are required")
	}
	if err := validateMeetingType(input.Type); err != nil {
		return nil, err
	}
	if err := validateMeetingStatus(input.Status); err != nil {
		return nil, err
	}
	if err := validateSourceContextType(input.SourceContextType); err != nil {
		return nil, err
	}
	if err := requireSourceContextID(input.SourceContextType, input.SourceContextID); err != nil {
		return nil, err
	}
	if err := validateMeetingWindow(input.StartsAt, input.EndsAt); err != nil {
		return nil, err
	}
	if input.RecordingDurationSec != nil && *input.RecordingDurationSec < 0 {
		return nil, fmt.Errorf("recordingDurationSec must be non-negative")
	}
	if input.RecordingURL == nil && input.Status != "completed" {
		room := s.nextcloud.BuildMeetingRoom(input.Title)
		input.RecordingURL = &room.URL
		s.logger.Info().Str("room_name", room.Name).Str("room_url", room.URL).Msg("generated nextcloud meeting room")
	}
	return s.repo.CreateMeeting(ctx, input)
}

func (s *Service) ListMeetings(ctx context.Context, filter MeetingFilter) ([]Meeting, error) {
	if filter.SourceContextType != "" {
		if err := validateSourceContextType(filter.SourceContextType); err != nil {
			return nil, err
		}
	}
	if filter.Status != "" {
		if err := validateMeetingStatus(filter.Status); err != nil {
			return nil, err
		}
	}
	if filter.Type != "" {
		if err := validateMeetingType(filter.Type); err != nil {
			return nil, err
		}
	}
	return s.repo.ListMeetings(ctx, filter)
}

func (s *Service) GetMeetingByID(ctx context.Context, id int) (*Meeting, error) {
	return s.repo.GetMeetingByID(ctx, id)
}

func (s *Service) UpdateMeeting(ctx context.Context, id int, input UpdateMeetingInput) (*Meeting, error) {
	current, err := s.repo.GetMeetingByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if input.Title != nil && strings.TrimSpace(*input.Title) == "" {
		return nil, fmt.Errorf("title is required")
	}
	if input.Type != nil {
		if err := validateMeetingType(*input.Type); err != nil {
			return nil, err
		}
	}
	if input.Status != nil {
		if err := validateMeetingStatus(*input.Status); err != nil {
			return nil, err
		}
	}
	if input.SourceContextType != nil {
		if err := validateSourceContextType(*input.SourceContextType); err != nil {
			return nil, err
		}
		if err := requireSourceContextID(*input.SourceContextType, input.SourceContextID); err != nil {
			return nil, err
		}
	}
	if err := validateMeetingWindow(input.StartsAt, input.EndsAt); err != nil {
		return nil, err
	}
	if input.RecordingDurationSec != nil && *input.RecordingDurationSec < 0 {
		return nil, fmt.Errorf("recordingDurationSec must be non-negative")
	}
	item, err := s.repo.UpdateMeeting(ctx, id, input)
	if err != nil {
		return nil, err
	}

	if s.scheduler != nil && current.Status != "completed" && item.Status == "completed" && item.EndsAt != nil {
		if err := s.scheduler.ScheduleRecordingFetch(item); err != nil {
			s.logger.Error().Err(err).Int("meeting_id", item.ID).Msg("failed to schedule meeting recording fetch")
		}
	}

	return item, nil
}

func (s *Service) DeleteMeeting(ctx context.Context, id int) error {
	return s.repo.DeleteMeeting(ctx, id)
}

func (s *Service) CreateParticipant(ctx context.Context, input CreateParticipantInput) (*Participant, error) {
	if input.MeetingID <= 0 || input.UserID <= 0 || strings.TrimSpace(input.RoleLabel) == "" {
		return nil, fmt.Errorf("meetingId, userId and roleLabel are required")
	}
	if _, err := s.repo.GetMeetingByID(ctx, input.MeetingID); err != nil {
		return nil, err
	}
	return s.repo.CreateParticipant(ctx, input)
}

func (s *Service) ListParticipants(ctx context.Context, filter ParticipantFilter) ([]Participant, error) {
	if _, err := s.repo.GetMeetingByID(ctx, filter.MeetingID); err != nil {
		return nil, err
	}
	return s.repo.ListParticipants(ctx, filter)
}

func (s *Service) GetParticipantByID(ctx context.Context, id int) (*Participant, error) {
	return s.repo.GetParticipantByID(ctx, id)
}

func (s *Service) UpdateParticipant(ctx context.Context, id int, input UpdateParticipantInput) (*Participant, error) {
	if input.UserID != nil && *input.UserID <= 0 {
		return nil, fmt.Errorf("userId must be positive")
	}
	if input.RoleLabel != nil && strings.TrimSpace(*input.RoleLabel) == "" {
		return nil, fmt.Errorf("roleLabel is required")
	}
	return s.repo.UpdateParticipant(ctx, id, input)
}

func (s *Service) DeleteParticipant(ctx context.Context, id int) error {
	return s.repo.DeleteParticipant(ctx, id)
}

func (s *Service) CreateAvailabilitySlot(ctx context.Context, input CreateAvailabilitySlotInput) (*AvailabilitySlot, error) {
	if input.MeetingID <= 0 {
		return nil, fmt.Errorf("meetingId is required")
	}
	if err := validateSlotWindow(&input.StartsAt, &input.EndsAt); err != nil {
		return nil, err
	}
	if input.Score < 0 {
		return nil, fmt.Errorf("score must be non-negative")
	}
	if _, err := s.repo.GetMeetingByID(ctx, input.MeetingID); err != nil {
		return nil, err
	}
	return s.repo.CreateAvailabilitySlot(ctx, input)
}

func (s *Service) ListAvailabilitySlots(ctx context.Context, meetingID int) ([]AvailabilitySlot, error) {
	if _, err := s.repo.GetMeetingByID(ctx, meetingID); err != nil {
		return nil, err
	}
	return s.repo.ListAvailabilitySlots(ctx, meetingID)
}

func (s *Service) GetAvailabilitySlotByID(ctx context.Context, id int) (*AvailabilitySlot, error) {
	return s.repo.GetAvailabilitySlotByID(ctx, id)
}

func (s *Service) UpdateAvailabilitySlot(ctx context.Context, id int, input UpdateAvailabilitySlotInput) (*AvailabilitySlot, error) {
	if err := validateSlotWindow(input.StartsAt, input.EndsAt); err != nil {
		return nil, err
	}
	if input.Score != nil && *input.Score < 0 {
		return nil, fmt.Errorf("score must be non-negative")
	}
	return s.repo.UpdateAvailabilitySlot(ctx, id, input)
}

func (s *Service) DeleteAvailabilitySlot(ctx context.Context, id int) error {
	return s.repo.DeleteAvailabilitySlot(ctx, id)
}

func (s *Service) CreateAvailabilityVote(ctx context.Context, input CreateAvailabilityVoteInput) (*AvailabilityVote, error) {
	if input.SlotID <= 0 || input.ParticipantUserID <= 0 {
		return nil, fmt.Errorf("slotId, participantUserId and status are required")
	}
	if err := validateVoteStatus(input.Status); err != nil {
		return nil, err
	}
	if _, err := s.repo.GetAvailabilitySlotByID(ctx, input.SlotID); err != nil {
		return nil, err
	}
	return s.repo.CreateAvailabilityVote(ctx, input)
}

func (s *Service) ListAvailabilityVotes(ctx context.Context, filter AvailabilityVoteFilter) ([]AvailabilityVote, error) {
	if filter.Status != "" {
		if err := validateVoteStatus(filter.Status); err != nil {
			return nil, err
		}
	}
	if _, err := s.repo.GetAvailabilitySlotByID(ctx, filter.SlotID); err != nil {
		return nil, err
	}
	return s.repo.ListAvailabilityVotes(ctx, filter)
}

func (s *Service) GetAvailabilityVoteByID(ctx context.Context, id int) (*AvailabilityVote, error) {
	return s.repo.GetAvailabilityVoteByID(ctx, id)
}

func (s *Service) UpdateAvailabilityVote(ctx context.Context, id int, input UpdateAvailabilityVoteInput) (*AvailabilityVote, error) {
	if input.ParticipantUserID != nil && *input.ParticipantUserID <= 0 {
		return nil, fmt.Errorf("participantUserId must be positive")
	}
	if input.Status != nil {
		if err := validateVoteStatus(*input.Status); err != nil {
			return nil, err
		}
	}
	return s.repo.UpdateAvailabilityVote(ctx, id, input)
}

func (s *Service) DeleteAvailabilityVote(ctx context.Context, id int) error {
	return s.repo.DeleteAvailabilityVote(ctx, id)
}

func (s *Service) CreateTranscriptEntry(ctx context.Context, input CreateTranscriptEntryInput) (*TranscriptEntry, error) {
	if input.MeetingID <= 0 || strings.TrimSpace(input.Text) == "" || input.StartsAtSec < 0 {
		return nil, fmt.Errorf("meetingId, startsAtSec and text are required")
	}
	if input.SpeakerName != nil && strings.TrimSpace(*input.SpeakerName) == "" {
		return nil, fmt.Errorf("speakerName is required")
	}
	if _, err := s.repo.GetMeetingByID(ctx, input.MeetingID); err != nil {
		return nil, err
	}
	return s.repo.CreateTranscriptEntry(ctx, input)
}

func (s *Service) ListTranscriptEntries(ctx context.Context, filter TranscriptEntryFilter) ([]TranscriptEntry, error) {
	if _, err := s.repo.GetMeetingByID(ctx, filter.MeetingID); err != nil {
		return nil, err
	}
	return s.repo.ListTranscriptEntries(ctx, filter)
}

func (s *Service) GetTranscriptEntryByID(ctx context.Context, id int) (*TranscriptEntry, error) {
	return s.repo.GetTranscriptEntryByID(ctx, id)
}

func (s *Service) UpdateTranscriptEntry(ctx context.Context, id int, input UpdateTranscriptEntryInput) (*TranscriptEntry, error) {
	if input.SpeakerName != nil && strings.TrimSpace(*input.SpeakerName) == "" {
		return nil, fmt.Errorf("speakerName is required")
	}
	if input.StartsAtSec != nil && *input.StartsAtSec < 0 {
		return nil, fmt.Errorf("startsAtSec must be non-negative")
	}
	if input.Text != nil && strings.TrimSpace(*input.Text) == "" {
		return nil, fmt.Errorf("text is required")
	}
	return s.repo.UpdateTranscriptEntry(ctx, id, input)
}

func (s *Service) DeleteTranscriptEntry(ctx context.Context, id int) error {
	return s.repo.DeleteTranscriptEntry(ctx, id)
}

func (s *Service) CreateDecision(ctx context.Context, input CreateDecisionInput) (*Decision, error) {
	if input.MeetingID <= 0 || strings.TrimSpace(input.Decision) == "" {
		return nil, fmt.Errorf("meetingId and decision are required")
	}
	if _, err := s.repo.GetMeetingByID(ctx, input.MeetingID); err != nil {
		return nil, err
	}
	return s.repo.CreateDecision(ctx, input)
}

func (s *Service) ListDecisions(ctx context.Context, meetingID int) ([]Decision, error) {
	if _, err := s.repo.GetMeetingByID(ctx, meetingID); err != nil {
		return nil, err
	}
	return s.repo.ListDecisions(ctx, meetingID)
}

func (s *Service) GetDecisionByID(ctx context.Context, id int) (*Decision, error) {
	return s.repo.GetDecisionByID(ctx, id)
}

func (s *Service) UpdateDecision(ctx context.Context, id int, input UpdateDecisionInput) (*Decision, error) {
	if input.Decision != nil && strings.TrimSpace(*input.Decision) == "" {
		return nil, fmt.Errorf("decision is required")
	}
	return s.repo.UpdateDecision(ctx, id, input)
}

func (s *Service) DeleteDecision(ctx context.Context, id int) error {
	return s.repo.DeleteDecision(ctx, id)
}

func (s *Service) CreateActionItem(ctx context.Context, input CreateActionItemInput) (*ActionItem, error) {
	if input.MeetingID <= 0 || strings.TrimSpace(input.TaskText) == "" {
		return nil, fmt.Errorf("meetingId, taskText and priority are required")
	}
	if err := validatePriority(input.Priority); err != nil {
		return nil, err
	}
	if input.AlreadyTask && input.TaskID == nil {
		return nil, fmt.Errorf("taskId is required when alreadyTask is true")
	}
	if _, err := s.repo.GetMeetingByID(ctx, input.MeetingID); err != nil {
		return nil, err
	}
	return s.repo.CreateActionItem(ctx, input)
}

func (s *Service) ListActionItems(ctx context.Context, meetingID int) ([]ActionItem, error) {
	if _, err := s.repo.GetMeetingByID(ctx, meetingID); err != nil {
		return nil, err
	}
	return s.repo.ListActionItems(ctx, meetingID)
}

func (s *Service) GetActionItemByID(ctx context.Context, id int) (*ActionItem, error) {
	return s.repo.GetActionItemByID(ctx, id)
}

func (s *Service) UpdateActionItem(ctx context.Context, id int, input UpdateActionItemInput) (*ActionItem, error) {
	if input.TaskText != nil && strings.TrimSpace(*input.TaskText) == "" {
		return nil, fmt.Errorf("taskText is required")
	}
	if input.Priority != nil {
		if err := validatePriority(*input.Priority); err != nil {
			return nil, err
		}
	}
	if input.AlreadyTask != nil && *input.AlreadyTask && input.TaskID == nil {
		return nil, fmt.Errorf("taskId is required when alreadyTask is true")
	}
	return s.repo.UpdateActionItem(ctx, id, input)
}

func (s *Service) DeleteActionItem(ctx context.Context, id int) error {
	return s.repo.DeleteActionItem(ctx, id)
}

func (s *Service) CreateLinkedDocument(ctx context.Context, input CreateLinkedDocumentInput) (*LinkedDocument, error) {
	if input.MeetingID <= 0 || input.DocumentID <= 0 {
		return nil, fmt.Errorf("meetingId and documentId are required")
	}
	if _, err := s.repo.GetMeetingByID(ctx, input.MeetingID); err != nil {
		return nil, err
	}
	return s.repo.CreateLinkedDocument(ctx, input)
}

func (s *Service) ListLinkedDocuments(ctx context.Context, meetingID int) ([]LinkedDocument, error) {
	if _, err := s.repo.GetMeetingByID(ctx, meetingID); err != nil {
		return nil, err
	}
	return s.repo.ListLinkedDocuments(ctx, meetingID)
}

func (s *Service) GetLinkedDocumentByID(ctx context.Context, id int) (*LinkedDocument, error) {
	return s.repo.GetLinkedDocumentByID(ctx, id)
}

func (s *Service) UpdateLinkedDocument(ctx context.Context, id int, input UpdateLinkedDocumentInput) (*LinkedDocument, error) {
	if input.DocumentID != nil && *input.DocumentID <= 0 {
		return nil, fmt.Errorf("documentId must be positive")
	}
	return s.repo.UpdateLinkedDocument(ctx, id, input)
}

func (s *Service) DeleteLinkedDocument(ctx context.Context, id int) error {
	return s.repo.DeleteLinkedDocument(ctx, id)
}

func validateMeetingType(value string) error {
	switch value {
	case "standup", "planning", "review", "retrospective", "workshop", "ad-hoc":
		return nil
	default:
		return fmt.Errorf("invalid meeting type: %s", value)
	}
}

func validateMeetingStatus(value string) error {
	switch value {
	case "draft", "scheduled", "completed", "cancelled":
		return nil
	default:
		return fmt.Errorf("invalid meeting status: %s", value)
	}
}

func validateSourceContextType(value string) error {
	switch value {
	case "task", "doc", "epoch", "project":
		return nil
	case "none":
		return nil
	default:
		return fmt.Errorf("invalid sourceContextType: %s", value)
	}
}

func requireSourceContextID(value string, id *int) error {
	switch value {
	case "task", "doc", "epoch", "project":
		if id == nil || *id <= 0 {
			return fmt.Errorf("sourceContextId is required for sourceContextType %s", value)
		}
	}
	return nil
}

func validateVoteStatus(value string) error {
	switch value {
	case "available", "maybe", "unavailable", "no-response":
		return nil
	default:
		return fmt.Errorf("invalid vote status: %s", value)
	}
}

func validatePriority(value string) error {
	switch value {
	case "low", "medium", "high", "critical":
		return nil
	default:
		return fmt.Errorf("invalid priority: %s", value)
	}
}

func validateMeetingWindow(startsAt, endsAt *time.Time) error {
	if startsAt != nil && endsAt != nil && endsAt.Before(*startsAt) {
		return fmt.Errorf("endsAt must be after startsAt")
	}
	return nil
}

func validateSlotWindow(startsAt, endsAt *time.Time) error {
	if startsAt == nil || endsAt == nil {
		return nil
	}
	if !endsAt.After(*startsAt) {
		return fmt.Errorf("endsAt must be after startsAt")
	}
	return nil
}
