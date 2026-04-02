package meetingpipeline

import "time"

type MeetingRecordingFetchJob struct {
	MeetingID          int        `json:"meeting_id"`
	ProjectID          int        `json:"project_id"`
	RecordingSourceURL *string    `json:"recording_source_url,omitempty"`
	ExternalRoomID     *string    `json:"external_room_id,omitempty"`
	MeetingStartedAt   *time.Time `json:"meeting_started_at,omitempty"`
	MeetingEndedAt     *time.Time `json:"meeting_ended_at,omitempty"`
	RunAfter           time.Time  `json:"run_after"`
	Attempt            int        `json:"attempt"`
	TraceID            string     `json:"trace_id"`
	PipelineJobID      int        `json:"pipeline_job_id"`
}

type TranscriptSegment struct {
	SpeakerName string `json:"speaker_name"`
	Text        string `json:"text"`
	StartsAtSec int    `json:"starts_at_sec"`
}

type MeetingMLResultMessage struct {
	MeetingID           int                 `json:"meeting_id"`
	RecordingObjectKey  string              `json:"recording_object_key"`
	TranscriptObjectKey *string             `json:"transcript_object_key,omitempty"`
	SummaryObjectKey    *string             `json:"summary_object_key,omitempty"`
	TranscriptText      *string             `json:"transcript_text,omitempty"`
	SummaryText         *string             `json:"summary_text,omitempty"`
	SpeakerSegments     []TranscriptSegment `json:"speaker_segments,omitempty"`
	Decisions           []string            `json:"decisions,omitempty"`
	ActionItems         []ActionItemPayload `json:"action_items,omitempty"`
	Metadata            map[string]any      `json:"metadata,omitempty"`
}

type ActionItemPayload struct {
	TaskText       string `json:"task_text"`
	Priority       string `json:"priority"`
	AssigneeUserID *int   `json:"assignee_user_id,omitempty"`
}
