package meetingpipeline

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"path"
	"time"

	"github.com/google/uuid"
	"github.com/rabbitmq/amqp091-go"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/nextcloud"
	rabbitmqinfra "github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/rabbitmq"
	s3infra "github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/s3"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/meeting"
)

type Service struct {
	rabbitmq  *rabbitmqinfra.Client
	repo      *meeting.Repository
	nextcloud *nextcloud.Client
	storage   *s3infra.Client
	logger    *logger.Logger
}

func NewService(rabbitmqClient *rabbitmqinfra.Client, repo *meeting.Repository, nextcloudClient *nextcloud.Client, storage *s3infra.Client, log *logger.Logger) *Service {
	return &Service{
		rabbitmq:  rabbitmqClient,
		repo:      repo,
		nextcloud: nextcloudClient,
		storage:   storage,
		logger:    log,
	}
}

func (s *Service) ScheduleRecordingFetch(meetingItem *meeting.Meeting) error {
	if meetingItem.EndsAt == nil {
		return nil
	}
	job := MeetingRecordingFetchJob{
		MeetingID:          meetingItem.ID,
		ProjectID:          meetingItem.ProjectID,
		RecordingSourceURL: meetingItem.RecordingURL,
		MeetingStartedAt:   meetingItem.StartsAt,
		MeetingEndedAt:     meetingItem.EndsAt,
		RunAfter:           meetingItem.EndsAt.Add(time.Hour),
		Attempt:            0,
		TraceID:            uuid.NewString(),
	}
	payload, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("marshal recording fetch job: %w", err)
	}
	record, err := s.repo.CreatePipelineJob(context.Background(), meetingItem.ID, "recording_fetch", "queued", 0, job.RunAfter, payload)
	if err != nil {
		return fmt.Errorf("create meeting pipeline job: %w", err)
	}
	job.PipelineJobID = record.ID
	recordingsQueue, _, _ := s.rabbitmq.QueueNames()
	return s.rabbitmq.PublishJSON(context.Background(), recordingsQueue, job, nil)
}

func (s *Service) StartConsumers(ctx context.Context) error {
	recordingsQueue, _, mlResultsQueue := s.rabbitmq.QueueNames()

	recordings, err := s.rabbitmq.Consume(recordingsQueue, "meeting-recording-worker")
	if err != nil {
		return err
	}
	mlResults, err := s.rabbitmq.Consume(mlResultsQueue, "meeting-ml-results")
	if err != nil {
		return err
	}

	go s.consumeRecordingFetch(ctx, recordings)
	go s.consumeMLResults(ctx, mlResults)
	return nil
}

func (s *Service) consumeRecordingFetch(ctx context.Context, deliveries <-chan amqp091.Delivery) {
	for {
		select {
		case <-ctx.Done():
			return
		case deliveryMsg, ok := <-deliveries:
			if !ok {
				return
			}
			s.handleRecordingDelivery(ctx, deliveryMsg)
		}
	}
}

func (s *Service) handleRecordingDelivery(ctx context.Context, deliveryMsg amqp091.Delivery) {
	var job MeetingRecordingFetchJob
	if err := json.Unmarshal(deliveryMsg.Body, &job); err != nil {
		s.logger.Error().Err(err).Msg("failed to decode meeting recording fetch job")
		_ = deliveryMsg.Ack(false)
		return
	}

	if time.Now().Before(job.RunAfter) {
		delay := time.Until(job.RunAfter)
		go func() {
			time.Sleep(delay)
			recordingsQueue, _, _ := s.rabbitmq.QueueNames()
			if err := s.rabbitmq.PublishJSON(context.Background(), recordingsQueue, job, nil); err != nil {
				s.logger.Error().Err(err).Int("meeting_id", job.MeetingID).Msg("failed to republish delayed meeting recording fetch job")
			}
		}()
		_ = deliveryMsg.Ack(false)
		return
	}

	meetingItem, err := s.repo.GetMeetingByID(ctx, job.MeetingID)
	if err != nil {
		s.logger.Error().Err(err).Int("meeting_id", job.MeetingID).Msg("failed to load meeting for recording fetch")
		_ = deliveryMsg.Ack(false)
		return
	}

	recording, err := s.nextcloud.FetchRecording(ctx, fmt.Sprintf("%d", meetingItem.ID))
	if err != nil {
		if errors.Is(err, nextcloud.ErrRecordingNotReady) && job.Attempt < 24 {
			job.Attempt++
			job.RunAfter = time.Now().Add(s.rabbitmq.RetryDelay())
			recordingsQueue, _, _ := s.rabbitmq.QueueNames()
			if publishErr := s.rabbitmq.PublishJSON(context.Background(), recordingsQueue, job, nil); publishErr != nil {
				s.logger.Error().Err(publishErr).Int("meeting_id", job.MeetingID).Msg("failed to republish meeting recording fetch job")
			}
			_ = deliveryMsg.Ack(false)
			return
		}
		s.logger.Error().Err(err).Int("meeting_id", job.MeetingID).Msg("meeting recording fetch failed")
		_ = deliveryMsg.Ack(false)
		return
	}
	defer recording.Reader.Close()

	content, err := io.ReadAll(recording.Reader)
	if err != nil {
		s.logger.Error().Err(err).Int("meeting_id", job.MeetingID).Msg("failed to read recording content")
		_ = deliveryMsg.Ack(false)
		return
	}

	objectKey := path.Join("meetings", fmt.Sprintf("%d", meetingItem.ID), "recordings", uuid.NewString()+"-"+recording.Filename)
	storedKey, err := s.storage.PutBytesObject(ctx, objectKey, content, recording.ContentType)
	if err != nil {
		s.logger.Error().Err(err).Int("meeting_id", job.MeetingID).Msg("failed to upload recording")
		_ = deliveryMsg.Ack(false)
		return
	}
	url, _ := s.storage.PresignedGetURL(ctx, storedKey, 24*time.Hour)
	_, _ = s.repo.UpdateMeeting(ctx, meetingItem.ID, meeting.UpdateMeetingInput{RecordingURL: &url, RecordingDurationSec: recording.DurationSec})
	contentType := recording.ContentType
	_, _ = s.repo.CreateArtifact(ctx, meetingItem.ID, "recording", storedKey, &contentType, mustJSON(map[string]any{"traceId": job.TraceID}))

	mlMessage := MeetingMLResultMessage{
		MeetingID:          meetingItem.ID,
		RecordingObjectKey: storedKey,
		Metadata: map[string]any{
			"projectId": meetingItem.ProjectID,
			"traceId":   job.TraceID,
		},
	}
	_, mlIntakeQueue, _ := s.rabbitmq.QueueNames()
	if err := s.rabbitmq.PublishJSON(ctx, mlIntakeQueue, mlMessage, nil); err != nil {
		s.logger.Error().Err(err).Int("meeting_id", meetingItem.ID).Msg("failed to publish ML intake message")
	}
	_ = deliveryMsg.Ack(false)
}

func (s *Service) consumeMLResults(ctx context.Context, deliveries <-chan amqp091.Delivery) {
	for {
		select {
		case <-ctx.Done():
			return
		case deliveryMsg, ok := <-deliveries:
			if !ok {
				return
			}
			s.handleMLResultsDelivery(ctx, deliveryMsg)
		}
	}
}

func (s *Service) handleMLResultsDelivery(ctx context.Context, deliveryMsg amqp091.Delivery) {
	var message MeetingMLResultMessage
	if err := json.Unmarshal(deliveryMsg.Body, &message); err != nil {
		s.logger.Error().Err(err).Msg("failed to decode meeting ML result message")
		_ = deliveryMsg.Ack(false)
		return
	}

	if message.TranscriptText != nil {
		objectKey := path.Join("meetings", fmt.Sprintf("%d", message.MeetingID), "transcripts", uuid.NewString()+".txt")
		storedKey, err := s.storage.PutBytesObject(ctx, objectKey, []byte(*message.TranscriptText), "text/plain; charset=utf-8")
		if err == nil {
			contentType := "text/plain; charset=utf-8"
			_, _ = s.repo.CreateArtifact(ctx, message.MeetingID, "transcript", storedKey, &contentType, mustJSON(message.Metadata))
		}
	}

	if message.SummaryText != nil {
		objectKey := path.Join("meetings", fmt.Sprintf("%d", message.MeetingID), "summaries", uuid.NewString()+".txt")
		storedKey, err := s.storage.PutBytesObject(ctx, objectKey, []byte(*message.SummaryText), "text/plain; charset=utf-8")
		if err == nil {
			_, _ = s.repo.UpsertSummary(ctx, message.MeetingID, storedKey, message.SummaryText, mustJSON(message.Metadata))
			approved := false
			_, _ = s.repo.UpdateMeeting(ctx, message.MeetingID, meeting.UpdateMeetingInput{AISummaryApproved: &approved})
		}
	}

	for _, segment := range message.SpeakerSegments {
		speakerName := segment.SpeakerName
		_, _ = s.repo.CreateTranscriptEntry(ctx, meeting.CreateTranscriptEntryInput{
			MeetingID:   message.MeetingID,
			SpeakerName: &speakerName,
			StartsAtSec: segment.StartsAtSec,
			Text:        segment.Text,
		})
	}

	for _, decisionText := range message.Decisions {
		_, _ = s.repo.CreateDecision(ctx, meeting.CreateDecisionInput{
			MeetingID: message.MeetingID,
			Decision:  decisionText,
		})
	}

	for _, actionItem := range message.ActionItems {
		_, _ = s.repo.CreateActionItem(ctx, meeting.CreateActionItemInput{
			MeetingID:      message.MeetingID,
			TaskText:       actionItem.TaskText,
			AssigneeUserID: actionItem.AssigneeUserID,
			Priority:       actionItem.Priority,
			AlreadyTask:    false,
		})
	}

	_ = deliveryMsg.Ack(false)
}

func mustJSON(value any) []byte {
	body, err := json.Marshal(value)
	if err != nil {
		return []byte(`{}`)
	}
	return body
}
