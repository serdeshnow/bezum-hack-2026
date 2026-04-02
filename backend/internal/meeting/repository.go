package meeting

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrMeetingNotFound               = errors.New("meeting not found")
	ErrMeetingParticipantNotFound    = errors.New("meeting participant not found")
	ErrAvailabilitySlotNotFound      = errors.New("meeting availability slot not found")
	ErrAvailabilityVoteNotFound      = errors.New("meeting availability vote not found")
	ErrTranscriptEntryNotFound       = errors.New("meeting transcript entry not found")
	ErrMeetingDecisionNotFound       = errors.New("meeting decision not found")
	ErrMeetingActionItemNotFound     = errors.New("meeting action item not found")
	ErrMeetingLinkedDocumentNotFound = errors.New("meeting linked document not found")
	ErrMeetingConflict               = errors.New("meeting conflict")
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository { return &Repository{pool: pool} }

func (r *Repository) CreateMeeting(ctx context.Context, input CreateMeetingInput) (*Meeting, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO meetings (
			project_id, epoch_id, source_context_type, source_context_id, title, description, type, status,
			starts_at, ends_at, recording_url, recording_duration_sec, ai_summary_approved
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
		RETURNING id, project_id, epoch_id, source_context_type, source_context_id, title, description, type, status,
			starts_at, ends_at, recording_url, recording_duration_sec, ai_summary_approved, created_at, updated_at
	`, input.ProjectID, input.EpochID, input.SourceContextType, input.SourceContextID, input.Title, input.Description, input.Type, input.Status,
		input.StartsAt, input.EndsAt, input.RecordingURL, input.RecordingDurationSec, input.AISummaryApproved)
	return scanMeeting(row)
}

func (r *Repository) ListMeetings(ctx context.Context, filter MeetingFilter) ([]Meeting, error) {
	query := `SELECT id, project_id, epoch_id, source_context_type, source_context_id, title, description, type, status, starts_at, ends_at, recording_url, recording_duration_sec, ai_summary_approved, created_at, updated_at FROM meetings`
	conditions := make([]string, 0, 5)
	args := make([]any, 0, 5)
	index := 1
	add := func(expr string, value any) {
		conditions = append(conditions, fmt.Sprintf(expr, index))
		args = append(args, value)
		index++
	}
	if filter.ProjectID != nil {
		add("project_id = $%d", *filter.ProjectID)
	}
	if filter.EpochID != nil {
		add("epoch_id = $%d", *filter.EpochID)
	}
	if filter.SourceContextType != "" {
		add("source_context_type = $%d", filter.SourceContextType)
	}
	if filter.Status != "" {
		add("status = $%d", filter.Status)
	}
	if filter.Type != "" {
		add("type = $%d", filter.Type)
	}
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += " ORDER BY starts_at ASC NULLS LAST, id ASC"
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]Meeting, 0)
	for rows.Next() {
		item, err := scanMeeting(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetMeetingByID(ctx context.Context, id int) (*Meeting, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, project_id, epoch_id, source_context_type, source_context_id, title, description, type, status, starts_at, ends_at, recording_url, recording_duration_sec, ai_summary_approved, created_at, updated_at FROM meetings WHERE id = $1`, id)
	item, err := scanMeeting(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMeetingNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateMeeting(ctx context.Context, id int, input UpdateMeetingInput) (*Meeting, error) {
	sets := make([]string, 0, 11)
	args := make([]any, 0, 12)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.EpochID != nil {
		add("epoch_id", *input.EpochID)
	}
	if input.SourceContextType != nil {
		add("source_context_type", *input.SourceContextType)
	}
	if input.SourceContextID != nil {
		add("source_context_id", *input.SourceContextID)
	}
	if input.Title != nil {
		add("title", *input.Title)
	}
	if input.Description != nil {
		add("description", *input.Description)
	}
	if input.Type != nil {
		add("type", *input.Type)
	}
	if input.Status != nil {
		add("status", *input.Status)
	}
	if input.StartsAt != nil {
		add("starts_at", *input.StartsAt)
	}
	if input.EndsAt != nil {
		add("ends_at", *input.EndsAt)
	}
	if input.RecordingURL != nil {
		add("recording_url", *input.RecordingURL)
	}
	if input.RecordingDurationSec != nil {
		add("recording_duration_sec", *input.RecordingDurationSec)
	}
	if input.AISummaryApproved != nil {
		add("ai_summary_approved", *input.AISummaryApproved)
	}
	if len(sets) == 0 {
		return r.GetMeetingByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	query := fmt.Sprintf(`UPDATE meetings SET %s WHERE id = $%d RETURNING id, project_id, epoch_id, source_context_type, source_context_id, title, description, type, status, starts_at, ends_at, recording_url, recording_duration_sec, ai_summary_approved, created_at, updated_at`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanMeeting(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMeetingNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteMeeting(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM meetings WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrMeetingNotFound
	}
	return nil
}

func (r *Repository) CreateParticipant(ctx context.Context, input CreateParticipantInput) (*Participant, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO meeting_participants (meeting_id, user_id, role_label, attended) VALUES ($1,$2,$3,$4) RETURNING id, meeting_id, user_id, role_label, attended, created_at, updated_at`,
		input.MeetingID, input.UserID, input.RoleLabel, input.Attended)
	item, err := scanParticipant(row)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrMeetingConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) ListParticipants(ctx context.Context, filter ParticipantFilter) ([]Participant, error) {
	query := `SELECT id, meeting_id, user_id, role_label, attended, created_at, updated_at FROM meeting_participants WHERE meeting_id = $1`
	args := []any{filter.MeetingID}
	if filter.Attended != nil {
		query += ` AND attended = $2`
		args = append(args, *filter.Attended)
	}
	query += ` ORDER BY id ASC`
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Participant, 0)
	for rows.Next() {
		item, err := scanParticipant(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetParticipantByID(ctx context.Context, id int) (*Participant, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, meeting_id, user_id, role_label, attended, created_at, updated_at FROM meeting_participants WHERE id = $1`, id)
	item, err := scanParticipant(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMeetingParticipantNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateParticipant(ctx context.Context, id int, input UpdateParticipantInput) (*Participant, error) {
	sets := make([]string, 0, 4)
	args := make([]any, 0, 5)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.UserID != nil {
		add("user_id", *input.UserID)
	}
	if input.RoleLabel != nil {
		add("role_label", *input.RoleLabel)
	}
	if input.Attended != nil {
		add("attended", *input.Attended)
	}
	if len(sets) == 0 {
		return r.GetParticipantByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	query := fmt.Sprintf(`UPDATE meeting_participants SET %s WHERE id = $%d RETURNING id, meeting_id, user_id, role_label, attended, created_at, updated_at`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanParticipant(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMeetingParticipantNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrMeetingConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteParticipant(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM meeting_participants WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrMeetingParticipantNotFound
	}
	return nil
}

func (r *Repository) CreateAvailabilitySlot(ctx context.Context, input CreateAvailabilitySlotInput) (*AvailabilitySlot, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO meeting_availability_slots (meeting_id, starts_at, ends_at, score, is_recommended) VALUES ($1,$2,$3,$4,$5) RETURNING id, meeting_id, starts_at, ends_at, score, is_recommended, created_at, updated_at`,
		input.MeetingID, input.StartsAt, input.EndsAt, input.Score, input.IsRecommended)
	return scanAvailabilitySlot(row)
}

func (r *Repository) ListAvailabilitySlots(ctx context.Context, meetingID int) ([]AvailabilitySlot, error) {
	rows, err := r.pool.Query(ctx, `SELECT id, meeting_id, starts_at, ends_at, score, is_recommended, created_at, updated_at FROM meeting_availability_slots WHERE meeting_id = $1 ORDER BY starts_at ASC, id ASC`, meetingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]AvailabilitySlot, 0)
	for rows.Next() {
		item, err := scanAvailabilitySlot(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetAvailabilitySlotByID(ctx context.Context, id int) (*AvailabilitySlot, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, meeting_id, starts_at, ends_at, score, is_recommended, created_at, updated_at FROM meeting_availability_slots WHERE id = $1`, id)
	item, err := scanAvailabilitySlot(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrAvailabilitySlotNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateAvailabilitySlot(ctx context.Context, id int, input UpdateAvailabilitySlotInput) (*AvailabilitySlot, error) {
	sets := make([]string, 0, 5)
	args := make([]any, 0, 6)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.StartsAt != nil {
		add("starts_at", *input.StartsAt)
	}
	if input.EndsAt != nil {
		add("ends_at", *input.EndsAt)
	}
	if input.Score != nil {
		add("score", *input.Score)
	}
	if input.IsRecommended != nil {
		add("is_recommended", *input.IsRecommended)
	}
	if len(sets) == 0 {
		return r.GetAvailabilitySlotByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	query := fmt.Sprintf(`UPDATE meeting_availability_slots SET %s WHERE id = $%d RETURNING id, meeting_id, starts_at, ends_at, score, is_recommended, created_at, updated_at`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanAvailabilitySlot(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrAvailabilitySlotNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteAvailabilitySlot(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM meeting_availability_slots WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrAvailabilitySlotNotFound
	}
	return nil
}

func (r *Repository) CreateAvailabilityVote(ctx context.Context, input CreateAvailabilityVoteInput) (*AvailabilityVote, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO meeting_availability_votes (slot_id, participant_user_id, status) VALUES ($1,$2,$3) RETURNING id, slot_id, participant_user_id, status, created_at, updated_at`,
		input.SlotID, input.ParticipantUserID, input.Status)
	item, err := scanAvailabilityVote(row)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrMeetingConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) ListAvailabilityVotes(ctx context.Context, filter AvailabilityVoteFilter) ([]AvailabilityVote, error) {
	query := `SELECT id, slot_id, participant_user_id, status, created_at, updated_at FROM meeting_availability_votes WHERE slot_id = $1`
	args := []any{filter.SlotID}
	if filter.Status != "" {
		query += ` AND status = $2`
		args = append(args, filter.Status)
	}
	query += ` ORDER BY id ASC`
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]AvailabilityVote, 0)
	for rows.Next() {
		item, err := scanAvailabilityVote(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetAvailabilityVoteByID(ctx context.Context, id int) (*AvailabilityVote, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, slot_id, participant_user_id, status, created_at, updated_at FROM meeting_availability_votes WHERE id = $1`, id)
	item, err := scanAvailabilityVote(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrAvailabilityVoteNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateAvailabilityVote(ctx context.Context, id int, input UpdateAvailabilityVoteInput) (*AvailabilityVote, error) {
	sets := make([]string, 0, 3)
	args := make([]any, 0, 4)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.ParticipantUserID != nil {
		add("participant_user_id", *input.ParticipantUserID)
	}
	if input.Status != nil {
		add("status", *input.Status)
	}
	if len(sets) == 0 {
		return r.GetAvailabilityVoteByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	query := fmt.Sprintf(`UPDATE meeting_availability_votes SET %s WHERE id = $%d RETURNING id, slot_id, participant_user_id, status, created_at, updated_at`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanAvailabilityVote(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrAvailabilityVoteNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrMeetingConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteAvailabilityVote(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM meeting_availability_votes WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrAvailabilityVoteNotFound
	}
	return nil
}

func (r *Repository) CreateTranscriptEntry(ctx context.Context, input CreateTranscriptEntryInput) (*TranscriptEntry, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO meeting_transcript_entries (meeting_id, speaker_user_id, speaker_name, starts_at_sec, text) VALUES ($1,$2,$3,$4,$5) RETURNING id, meeting_id, speaker_user_id, speaker_name, starts_at_sec, text, created_at, updated_at`,
		input.MeetingID, input.SpeakerUserID, input.SpeakerName, input.StartsAtSec, input.Text)
	return scanTranscriptEntry(row)
}

func (r *Repository) ListTranscriptEntries(ctx context.Context, filter TranscriptEntryFilter) ([]TranscriptEntry, error) {
	query := `SELECT id, meeting_id, speaker_user_id, speaker_name, starts_at_sec, text, created_at, updated_at FROM meeting_transcript_entries WHERE meeting_id = $1`
	args := []any{filter.MeetingID}
	if filter.SpeakerUserID != nil {
		query += ` AND speaker_user_id = $2`
		args = append(args, *filter.SpeakerUserID)
	}
	query += ` ORDER BY starts_at_sec ASC, id ASC`
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]TranscriptEntry, 0)
	for rows.Next() {
		item, err := scanTranscriptEntry(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetTranscriptEntryByID(ctx context.Context, id int) (*TranscriptEntry, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, meeting_id, speaker_user_id, speaker_name, starts_at_sec, text, created_at, updated_at FROM meeting_transcript_entries WHERE id = $1`, id)
	item, err := scanTranscriptEntry(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTranscriptEntryNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateTranscriptEntry(ctx context.Context, id int, input UpdateTranscriptEntryInput) (*TranscriptEntry, error) {
	sets := make([]string, 0, 5)
	args := make([]any, 0, 6)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.SpeakerUserID != nil {
		add("speaker_user_id", *input.SpeakerUserID)
	}
	if input.SpeakerName != nil {
		add("speaker_name", *input.SpeakerName)
	}
	if input.StartsAtSec != nil {
		add("starts_at_sec", *input.StartsAtSec)
	}
	if input.Text != nil {
		add("text", *input.Text)
	}
	if len(sets) == 0 {
		return r.GetTranscriptEntryByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	query := fmt.Sprintf(`UPDATE meeting_transcript_entries SET %s WHERE id = $%d RETURNING id, meeting_id, speaker_user_id, speaker_name, starts_at_sec, text, created_at, updated_at`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanTranscriptEntry(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTranscriptEntryNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteTranscriptEntry(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM meeting_transcript_entries WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrTranscriptEntryNotFound
	}
	return nil
}

func (r *Repository) CreateDecision(ctx context.Context, input CreateDecisionInput) (*Decision, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO meeting_decisions (meeting_id, decision, rationale, owner_user_id) VALUES ($1,$2,$3,$4) RETURNING id, meeting_id, decision, rationale, owner_user_id, created_at, updated_at`,
		input.MeetingID, input.Decision, input.Rationale, input.OwnerUserID)
	return scanDecision(row)
}

func (r *Repository) ListDecisions(ctx context.Context, meetingID int) ([]Decision, error) {
	rows, err := r.pool.Query(ctx, `SELECT id, meeting_id, decision, rationale, owner_user_id, created_at, updated_at FROM meeting_decisions WHERE meeting_id = $1 ORDER BY id ASC`, meetingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Decision, 0)
	for rows.Next() {
		item, err := scanDecision(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetDecisionByID(ctx context.Context, id int) (*Decision, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, meeting_id, decision, rationale, owner_user_id, created_at, updated_at FROM meeting_decisions WHERE id = $1`, id)
	item, err := scanDecision(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMeetingDecisionNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateDecision(ctx context.Context, id int, input UpdateDecisionInput) (*Decision, error) {
	sets := make([]string, 0, 4)
	args := make([]any, 0, 5)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.Decision != nil {
		add("decision", *input.Decision)
	}
	if input.Rationale != nil {
		add("rationale", *input.Rationale)
	}
	if input.OwnerUserID != nil {
		add("owner_user_id", *input.OwnerUserID)
	}
	if len(sets) == 0 {
		return r.GetDecisionByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	query := fmt.Sprintf(`UPDATE meeting_decisions SET %s WHERE id = $%d RETURNING id, meeting_id, decision, rationale, owner_user_id, created_at, updated_at`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanDecision(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMeetingDecisionNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteDecision(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM meeting_decisions WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrMeetingDecisionNotFound
	}
	return nil
}

func (r *Repository) CreateActionItem(ctx context.Context, input CreateActionItemInput) (*ActionItem, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO meeting_action_items (meeting_id, task_id, task_text, assignee_user_id, due_date, priority, already_task) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, meeting_id, task_id, task_text, assignee_user_id, due_date, priority, already_task, created_at, updated_at`,
		input.MeetingID, input.TaskID, input.TaskText, input.AssigneeUserID, input.DueDate, input.Priority, input.AlreadyTask)
	return scanActionItem(row)
}

func (r *Repository) ListActionItems(ctx context.Context, meetingID int) ([]ActionItem, error) {
	rows, err := r.pool.Query(ctx, `SELECT id, meeting_id, task_id, task_text, assignee_user_id, due_date, priority, already_task, created_at, updated_at FROM meeting_action_items WHERE meeting_id = $1 ORDER BY id ASC`, meetingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]ActionItem, 0)
	for rows.Next() {
		item, err := scanActionItem(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetActionItemByID(ctx context.Context, id int) (*ActionItem, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, meeting_id, task_id, task_text, assignee_user_id, due_date, priority, already_task, created_at, updated_at FROM meeting_action_items WHERE id = $1`, id)
	item, err := scanActionItem(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMeetingActionItemNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateActionItem(ctx context.Context, id int, input UpdateActionItemInput) (*ActionItem, error) {
	sets := make([]string, 0, 7)
	args := make([]any, 0, 8)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.TaskID != nil {
		add("task_id", *input.TaskID)
	}
	if input.TaskText != nil {
		add("task_text", *input.TaskText)
	}
	if input.AssigneeUserID != nil {
		add("assignee_user_id", *input.AssigneeUserID)
	}
	if input.DueDate != nil {
		add("due_date", *input.DueDate)
	}
	if input.Priority != nil {
		add("priority", *input.Priority)
	}
	if input.AlreadyTask != nil {
		add("already_task", *input.AlreadyTask)
	}
	if len(sets) == 0 {
		return r.GetActionItemByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	query := fmt.Sprintf(`UPDATE meeting_action_items SET %s WHERE id = $%d RETURNING id, meeting_id, task_id, task_text, assignee_user_id, due_date, priority, already_task, created_at, updated_at`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanActionItem(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMeetingActionItemNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteActionItem(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM meeting_action_items WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrMeetingActionItemNotFound
	}
	return nil
}

func (r *Repository) CreateLinkedDocument(ctx context.Context, input CreateLinkedDocumentInput) (*LinkedDocument, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO meeting_linked_documents (meeting_id, document_id, update_suggestion) VALUES ($1,$2,$3) RETURNING id, meeting_id, document_id, update_suggestion, created_at, updated_at`,
		input.MeetingID, input.DocumentID, input.UpdateSuggestion)
	item, err := scanLinkedDocument(row)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrMeetingConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) ListLinkedDocuments(ctx context.Context, meetingID int) ([]LinkedDocument, error) {
	rows, err := r.pool.Query(ctx, `SELECT id, meeting_id, document_id, update_suggestion, created_at, updated_at FROM meeting_linked_documents WHERE meeting_id = $1 ORDER BY id ASC`, meetingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]LinkedDocument, 0)
	for rows.Next() {
		item, err := scanLinkedDocument(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetLinkedDocumentByID(ctx context.Context, id int) (*LinkedDocument, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, meeting_id, document_id, update_suggestion, created_at, updated_at FROM meeting_linked_documents WHERE id = $1`, id)
	item, err := scanLinkedDocument(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMeetingLinkedDocumentNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateLinkedDocument(ctx context.Context, id int, input UpdateLinkedDocumentInput) (*LinkedDocument, error) {
	sets := make([]string, 0, 3)
	args := make([]any, 0, 4)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.DocumentID != nil {
		add("document_id", *input.DocumentID)
	}
	if input.UpdateSuggestion != nil {
		add("update_suggestion", *input.UpdateSuggestion)
	}
	if len(sets) == 0 {
		return r.GetLinkedDocumentByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	query := fmt.Sprintf(`UPDATE meeting_linked_documents SET %s WHERE id = $%d RETURNING id, meeting_id, document_id, update_suggestion, created_at, updated_at`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanLinkedDocument(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMeetingLinkedDocumentNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrMeetingConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteLinkedDocument(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM meeting_linked_documents WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrMeetingLinkedDocumentNotFound
	}
	return nil
}

func (r *Repository) CreatePipelineJob(ctx context.Context, meetingID int, jobType string, status string, attempt int, runAfter time.Time, payload []byte) (*PipelineJob, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO meeting_pipeline_jobs (meeting_id, job_type, status, attempt, run_after, payload_json) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, meeting_id, job_type, status, attempt, run_after, last_error, payload_json, finished_at, created_at, updated_at`,
		meetingID, jobType, status, attempt, runAfter, payload)
	return scanPipelineJob(row)
}

func (r *Repository) UpdatePipelineJobStatus(ctx context.Context, id int, status string, attempt int, lastError *string, finishedAt *time.Time, payload []byte) (*PipelineJob, error) {
	row := r.pool.QueryRow(ctx, `UPDATE meeting_pipeline_jobs SET status = $1, attempt = $2, last_error = $3, finished_at = $4, payload_json = $5, updated_at = $6 WHERE id = $7 RETURNING id, meeting_id, job_type, status, attempt, run_after, last_error, payload_json, finished_at, created_at, updated_at`,
		status, attempt, lastError, finishedAt, payload, time.Now(), id)
	return scanPipelineJob(row)
}

func (r *Repository) CreateArtifact(ctx context.Context, meetingID int, artifactType string, objectKey string, contentType *string, metadata []byte) (*Artifact, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO meeting_artifacts (meeting_id, artifact_type, object_key, content_type, metadata_json) VALUES ($1,$2,$3,$4,$5) RETURNING id, meeting_id, artifact_type, object_key, content_type, metadata_json, created_at, updated_at`,
		meetingID, artifactType, objectKey, contentType, metadata)
	return scanArtifact(row)
}

func (r *Repository) UpsertSummary(ctx context.Context, meetingID int, objectKey string, summaryText *string, metadata []byte) (*Summary, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO meeting_summaries (meeting_id, object_key, summary_text, metadata_json)
		VALUES ($1,$2,$3,$4)
		ON CONFLICT (meeting_id) DO UPDATE SET
			object_key = EXCLUDED.object_key,
			summary_text = EXCLUDED.summary_text,
			metadata_json = EXCLUDED.metadata_json,
			updated_at = now()
		RETURNING id, meeting_id, object_key, summary_text, metadata_json, created_at, updated_at
	`, meetingID, objectKey, summaryText, metadata)
	return scanSummary(row)
}

func scanMeeting(row pgx.Row) (*Meeting, error) {
	var item Meeting
	err := row.Scan(
		&item.ID, &item.ProjectID, &item.EpochID, &item.SourceContextType, &item.SourceContextID, &item.Title,
		&item.Description, &item.Type, &item.Status, &item.StartsAt, &item.EndsAt, &item.RecordingURL,
		&item.RecordingDurationSec, &item.AISummaryApproved, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanParticipant(row pgx.Row) (*Participant, error) {
	var item Participant
	err := row.Scan(&item.ID, &item.MeetingID, &item.UserID, &item.RoleLabel, &item.Attended, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanAvailabilitySlot(row pgx.Row) (*AvailabilitySlot, error) {
	var item AvailabilitySlot
	err := row.Scan(&item.ID, &item.MeetingID, &item.StartsAt, &item.EndsAt, &item.Score, &item.IsRecommended, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanAvailabilityVote(row pgx.Row) (*AvailabilityVote, error) {
	var item AvailabilityVote
	err := row.Scan(&item.ID, &item.SlotID, &item.ParticipantUserID, &item.Status, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanTranscriptEntry(row pgx.Row) (*TranscriptEntry, error) {
	var item TranscriptEntry
	err := row.Scan(&item.ID, &item.MeetingID, &item.SpeakerUserID, &item.SpeakerName, &item.StartsAtSec, &item.Text, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanDecision(row pgx.Row) (*Decision, error) {
	var item Decision
	err := row.Scan(&item.ID, &item.MeetingID, &item.Decision, &item.Rationale, &item.OwnerUserID, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanActionItem(row pgx.Row) (*ActionItem, error) {
	var item ActionItem
	err := row.Scan(&item.ID, &item.MeetingID, &item.TaskID, &item.TaskText, &item.AssigneeUserID, &item.DueDate, &item.Priority, &item.AlreadyTask, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanLinkedDocument(row pgx.Row) (*LinkedDocument, error) {
	var item LinkedDocument
	err := row.Scan(&item.ID, &item.MeetingID, &item.DocumentID, &item.UpdateSuggestion, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanPipelineJob(row pgx.Row) (*PipelineJob, error) {
	var item PipelineJob
	err := row.Scan(&item.ID, &item.MeetingID, &item.JobType, &item.Status, &item.Attempt, &item.RunAfter, &item.LastError, &item.PayloadJSON, &item.FinishedAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanArtifact(row pgx.Row) (*Artifact, error) {
	var item Artifact
	err := row.Scan(&item.ID, &item.MeetingID, &item.ArtifactType, &item.ObjectKey, &item.ContentType, &item.MetadataJSON, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanSummary(row pgx.Row) (*Summary, error) {
	var item Summary
	err := row.Scan(&item.ID, &item.MeetingID, &item.ObjectKey, &item.SummaryText, &item.MetadataJSON, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
