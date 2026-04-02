package github

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/serdeshnow/bezum-hack-2026/backend/internal/communication"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/config"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/delivery"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/task"
)

type Service struct {
	cfg               config.GitHubConfig
	deliveryRepo      *delivery.Repository
	taskRepo          *task.Repository
	communicationRepo *communication.Repository
	logger            *logger.Logger
	taskKeyPattern    *regexp.Regexp
}

func MustNewService(cfg config.GitHubConfig, deliveryRepo *delivery.Repository, taskRepo *task.Repository, communicationRepo *communication.Repository, log *logger.Logger) *Service {
	pattern, err := regexp.Compile(cfg.TaskKeyPattern)
	if err != nil {
		log.Error().Err(err).Msg("failed to compile github task key pattern")
		panic(err)
	}

	return &Service{
		cfg:               cfg,
		deliveryRepo:      deliveryRepo,
		taskRepo:          taskRepo,
		communicationRepo: communicationRepo,
		logger:            log,
		taskKeyPattern:    pattern,
	}
}

func (s *Service) VerifySignature(payload []byte, signature string) bool {
	const prefix = "sha256="
	if !strings.HasPrefix(signature, prefix) {
		return false
	}

	expectedMAC := hmac.New(sha256.New, []byte(s.cfg.WebhookSecret))
	expectedMAC.Write(payload)
	expected := expectedMAC.Sum(nil)

	provided, err := hex.DecodeString(strings.TrimPrefix(signature, prefix))
	if err != nil {
		return false
	}

	return hmac.Equal(expected, provided)
}

func (s *Service) HandlePullRequestEvent(ctx context.Context, event string, payload []byte) error {
	var hook PullRequestWebhook
	if err := json.Unmarshal(payload, &hook); err != nil {
		return fmt.Errorf("decode github webhook payload: %w", err)
	}

	if !strings.EqualFold(hook.Repository.FullName, s.cfg.RepositoryOwner+"/"+s.cfg.RepositoryName) {
		s.logger.Warn().Str("repository", hook.Repository.FullName).Msg("ignored github webhook from unknown repository")
		return nil
	}

	status := normalizePullRequestStatus(hook)
	taskKey, taskMatches := s.extractTaskKey(hook.PullRequest.Head.Ref, hook.PullRequest.Title)
	if taskMatches > 1 {
		s.logger.Warn().
			Str("branch", hook.PullRequest.Head.Ref).
			Str("title", hook.PullRequest.Title).
			Msg("multiple task keys found in github pull request payload, using first match")
	}

	projectID := s.cfg.ProjectID
	var linkedTask *task.Task
	if taskKey != "" {
		taskItem, err := s.taskRepo.GetByProjectAndKey(ctx, s.cfg.ProjectID, taskKey)
		if err == nil {
			linkedTask = taskItem
			projectID = taskItem.ProjectID
		}
	}

	pr, err := s.upsertPullRequest(ctx, hook, projectID, status)
	if err != nil {
		return err
	}

	var taskID *int
	if linkedTask != nil {
		taskID = &linkedTask.ID
	}

	rawPayload := json.RawMessage(payload)
	_, err = s.deliveryRepo.UpsertGitHubPullRequest(ctx, delivery.GitHubPullRequest{
		PullRequestID:      pr.ID,
		TaskID:             taskID,
		GitHubNodeID:       hook.PullRequest.NodeID,
		RepositoryFullName: hook.Repository.FullName,
		HeadBranch:         hook.PullRequest.Head.Ref,
		BaseBranch:         hook.PullRequest.Base.Ref,
		PayloadJSON:        rawPayload,
		LastEvent:          hook.Action,
		SynchronizedAt:     time.Now(),
	})
	if err != nil {
		return fmt.Errorf("upsert github pull request metadata: %w", err)
	}

	if err := s.writeActivity(ctx, projectID, pr, hook.Action, hook.PullRequest.Title); err != nil {
		s.logger.Error().Err(err).Int("pull_request_id", pr.ID).Msg("failed to write github activity feed")
	}

	if status == "merged" && linkedTask != nil {
		if _, err := s.taskRepo.UpdateStatus(ctx, linkedTask.ID, "review"); err != nil {
			s.logger.Error().Err(err).Int("task_id", linkedTask.ID).Msg("failed to update task status after github merge")
		}
		if err := s.notifyTaskStakeholders(ctx, linkedTask, pr); err != nil {
			s.logger.Error().Err(err).Int("task_id", linkedTask.ID).Msg("failed to notify task stakeholders about github merge")
		}
	}

	return nil
}

func (s *Service) upsertPullRequest(ctx context.Context, hook PullRequestWebhook, projectID int, status string) (*delivery.PullRequest, error) {
	current, err := s.deliveryRepo.GetPullRequestByProjectAndNumber(ctx, projectID, hook.Number)
	if err == nil {
		return s.deliveryRepo.UpdatePullRequest(ctx, current.ID, delivery.UpdatePullRequestInput{
			Title:        &hook.PullRequest.Title,
			Branch:       &hook.PullRequest.Head.Ref,
			Status:       &status,
			AuthorUserID: intPtr(s.cfg.ActorUserID),
			CommitsCount: intPtr(0),
			ExternalURL:  &hook.PullRequest.HTMLURL,
			MergedAt:     hook.PullRequest.MergedAt,
		})
	}
	if err != nil && err != delivery.ErrPullRequestNotFound {
		return nil, fmt.Errorf("load pull request by project and number: %w", err)
	}

	return s.deliveryRepo.CreatePullRequest(ctx, delivery.CreatePullRequestInput{
		ProjectID:    projectID,
		ReleaseID:    nil,
		Number:       hook.Number,
		Title:        hook.PullRequest.Title,
		Branch:       hook.PullRequest.Head.Ref,
		Status:       status,
		AuthorUserID: s.cfg.ActorUserID,
		CommitsCount: 0,
		Additions:    0,
		Deletions:    0,
		ExternalURL:  &hook.PullRequest.HTMLURL,
		MergedAt:     hook.PullRequest.MergedAt,
	})
}

func (s *Service) writeActivity(ctx context.Context, projectID int, pr *delivery.PullRequest, action string, title string) error {
	_, err := s.communicationRepo.CreateActivityFeed(ctx, communication.CreateActivityFeedInput{
		ProjectID:   projectID,
		ActorUserID: intPtr(s.cfg.ActorUserID),
		Type:        "github",
		Action:      "pull_request_" + action,
		Title:       fmt.Sprintf("GitHub PR #%d %s", pr.Number, title),
		MetadataJSON: mustMarshal(map[string]any{
			"pullRequestId": pr.ID,
			"number":        pr.Number,
			"branch":        pr.Branch,
			"status":        pr.Status,
		}),
	})
	return err
}

func (s *Service) notifyTaskStakeholders(ctx context.Context, taskItem *task.Task, pr *delivery.PullRequest) error {
	recipients := uniquePositiveInts(taskItem.AssigneeUserID, taskItem.ReporterUserID)
	for _, recipient := range recipients {
		entityType := "pull_request"
		_, err := s.communicationRepo.CreateNotification(ctx, communication.CreateNotificationInput{
			UserID:      recipient,
			ActorUserID: intPtr(s.cfg.ActorUserID),
			Type:        "github",
			Title:       fmt.Sprintf("PR #%d merged", pr.Number),
			Description: fmt.Sprintf("Pull request for task %s is merged and task moved to review", taskItem.Key),
			EntityType:  &entityType,
			EntityID:    &pr.ID,
			Channel:     stringPtr("in-app"),
			ReadAt:      nil,
		})
		if err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) extractTaskKey(branch, title string) (string, int) {
	branchMatches := s.taskKeyPattern.FindAllString(branch, -1)
	if len(branchMatches) > 0 {
		return branchMatches[0], len(branchMatches)
	}
	titleMatches := s.taskKeyPattern.FindAllString(title, -1)
	if len(titleMatches) > 0 {
		return titleMatches[0], len(titleMatches)
	}
	return "", 0
}

func normalizePullRequestStatus(hook PullRequestWebhook) string {
	switch hook.Action {
	case "closed":
		if hook.PullRequest.MergedAt != nil {
			return "merged"
		}
		return "closed"
	case "opened", "reopened":
		return "open"
	case "edited", "synchronize":
		return "reviewing"
	default:
		if hook.PullRequest.MergedAt != nil {
			return "merged"
		}
		return "open"
	}
}

func intPtr(value int) *int {
	return &value
}

func stringPtr(value string) *string {
	return &value
}

func uniquePositiveInts(values ...*int) []int {
	out := make([]int, 0, len(values))
	seen := make(map[int]struct{}, len(values))
	for _, value := range values {
		if value == nil || *value <= 0 {
			continue
		}
		if _, ok := seen[*value]; ok {
			continue
		}
		seen[*value] = struct{}{}
		out = append(out, *value)
	}
	return out
}

func mustMarshal(value any) []byte {
	body, err := json.Marshal(value)
	if err != nil {
		return []byte(`{}`)
	}
	return body
}
