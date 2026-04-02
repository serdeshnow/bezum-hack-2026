package meeting

import "time"

type CompletionScheduler interface {
	ScheduleRecordingFetch(meeting *Meeting) error
}

type Meeting struct {
	ID                   int        `json:"id"`
	ProjectID            int        `json:"projectId"`
	EpochID              *int       `json:"epochId,omitempty"`
	SourceContextType    string     `json:"sourceContextType"`
	SourceContextID      *int       `json:"sourceContextId,omitempty"`
	Title                string     `json:"title"`
	Description          *string    `json:"description,omitempty"`
	Type                 string     `json:"type"`
	Status               string     `json:"status"`
	StartsAt             *time.Time `json:"startsAt,omitempty"`
	EndsAt               *time.Time `json:"endsAt,omitempty"`
	RecordingURL         *string    `json:"recordingUrl,omitempty"`
	RecordingDurationSec *int       `json:"recordingDurationSec,omitempty"`
	AISummaryApproved    bool       `json:"aiSummaryApproved"`
	CreatedAt            time.Time  `json:"createdAt"`
	UpdatedAt            time.Time  `json:"updatedAt"`
}

type Participant struct {
	ID        int       `json:"id"`
	MeetingID int       `json:"meetingId"`
	UserID    int       `json:"userId"`
	RoleLabel string    `json:"roleLabel"`
	Attended  bool      `json:"attended"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type AvailabilitySlot struct {
	ID            int       `json:"id"`
	MeetingID     int       `json:"meetingId"`
	StartsAt      time.Time `json:"startsAt"`
	EndsAt        time.Time `json:"endsAt"`
	Score         int       `json:"score"`
	IsRecommended bool      `json:"isRecommended"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type AvailabilityVote struct {
	ID                int       `json:"id"`
	SlotID            int       `json:"slotId"`
	ParticipantUserID int       `json:"participantUserId"`
	Status            string    `json:"status"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}

type TranscriptEntry struct {
	ID            int       `json:"id"`
	MeetingID     int       `json:"meetingId"`
	SpeakerUserID *int      `json:"speakerUserId,omitempty"`
	SpeakerName   *string   `json:"speakerName,omitempty"`
	StartsAtSec   int       `json:"startsAtSec"`
	Text          string    `json:"text"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type Decision struct {
	ID          int       `json:"id"`
	MeetingID   int       `json:"meetingId"`
	Decision    string    `json:"decision"`
	Rationale   *string   `json:"rationale,omitempty"`
	OwnerUserID *int      `json:"ownerUserId,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type ActionItem struct {
	ID             int        `json:"id"`
	MeetingID      int        `json:"meetingId"`
	TaskID         *int       `json:"taskId,omitempty"`
	TaskText       string     `json:"taskText"`
	AssigneeUserID *int       `json:"assigneeUserId,omitempty"`
	DueDate        *time.Time `json:"dueDate,omitempty"`
	Priority       string     `json:"priority"`
	AlreadyTask    bool       `json:"alreadyTask"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

type LinkedDocument struct {
	ID               int       `json:"id"`
	MeetingID        int       `json:"meetingId"`
	DocumentID       int       `json:"documentId"`
	UpdateSuggestion *string   `json:"updateSuggestion,omitempty"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

type PipelineJob struct {
	ID          int        `json:"id"`
	MeetingID   int        `json:"meetingId"`
	JobType     string     `json:"jobType"`
	Status      string     `json:"status"`
	Attempt     int        `json:"attempt"`
	RunAfter    time.Time  `json:"runAfter"`
	LastError   *string    `json:"lastError,omitempty"`
	PayloadJSON []byte     `json:"payloadJson,omitempty"`
	FinishedAt  *time.Time `json:"finishedAt,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

type Artifact struct {
	ID           int       `json:"id"`
	MeetingID    int       `json:"meetingId"`
	ArtifactType string    `json:"artifactType"`
	ObjectKey    string    `json:"objectKey"`
	ContentType  *string   `json:"contentType,omitempty"`
	MetadataJSON []byte    `json:"metadataJson,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Summary struct {
	ID           int       `json:"id"`
	MeetingID    int       `json:"meetingId"`
	ObjectKey    string    `json:"objectKey"`
	SummaryText  *string   `json:"summaryText,omitempty"`
	MetadataJSON []byte    `json:"metadataJson,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type MeetingFilter struct {
	ProjectID         *int
	EpochID           *int
	SourceContextType string
	Status            string
	Type              string
}

type ParticipantFilter struct {
	MeetingID int
	Attended  *bool
}

type AvailabilityVoteFilter struct {
	SlotID int
	Status string
}

type TranscriptEntryFilter struct {
	MeetingID     int
	SpeakerUserID *int
}

type CreateMeetingInput struct {
	ProjectID            int
	EpochID              *int
	SourceContextType    string
	SourceContextID      *int
	Title                string
	Description          *string
	Type                 string
	Status               string
	StartsAt             *time.Time
	EndsAt               *time.Time
	RecordingURL         *string
	RecordingDurationSec *int
	AISummaryApproved    bool
}

type UpdateMeetingInput struct {
	EpochID              *int
	SourceContextType    *string
	SourceContextID      *int
	Title                *string
	Description          *string
	Type                 *string
	Status               *string
	StartsAt             *time.Time
	EndsAt               *time.Time
	RecordingURL         *string
	RecordingDurationSec *int
	AISummaryApproved    *bool
}

type CreateParticipantInput struct {
	MeetingID int
	UserID    int
	RoleLabel string
	Attended  bool
}

type UpdateParticipantInput struct {
	UserID    *int
	RoleLabel *string
	Attended  *bool
}

type CreateAvailabilitySlotInput struct {
	MeetingID     int
	StartsAt      time.Time
	EndsAt        time.Time
	Score         int
	IsRecommended bool
}

type UpdateAvailabilitySlotInput struct {
	StartsAt      *time.Time
	EndsAt        *time.Time
	Score         *int
	IsRecommended *bool
}

type CreateAvailabilityVoteInput struct {
	SlotID            int
	ParticipantUserID int
	Status            string
}

type UpdateAvailabilityVoteInput struct {
	ParticipantUserID *int
	Status            *string
}

type CreateTranscriptEntryInput struct {
	MeetingID     int
	SpeakerUserID *int
	SpeakerName   *string
	StartsAtSec   int
	Text          string
}

type UpdateTranscriptEntryInput struct {
	SpeakerUserID *int
	SpeakerName   *string
	StartsAtSec   *int
	Text          *string
}

type CreateDecisionInput struct {
	MeetingID   int
	Decision    string
	Rationale   *string
	OwnerUserID *int
}

type UpdateDecisionInput struct {
	Decision    *string
	Rationale   *string
	OwnerUserID *int
}

type CreateActionItemInput struct {
	MeetingID      int
	TaskID         *int
	TaskText       string
	AssigneeUserID *int
	DueDate        *time.Time
	Priority       string
	AlreadyTask    bool
}

type UpdateActionItemInput struct {
	TaskID         *int
	TaskText       *string
	AssigneeUserID *int
	DueDate        *time.Time
	Priority       *string
	AlreadyTask    *bool
}

type CreateLinkedDocumentInput struct {
	MeetingID        int
	DocumentID       int
	UpdateSuggestion *string
}

type UpdateLinkedDocumentInput struct {
	DocumentID       *int
	UpdateSuggestion *string
}
