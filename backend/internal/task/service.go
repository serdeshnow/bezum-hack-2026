package task

import (
	"context"
	"fmt"
	"strings"

	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
)

type Service struct {
	repo   *Repository
	logger *logger.Logger
}

func NewService(repo *Repository, log *logger.Logger) *Service {
	return &Service{repo: repo, logger: log}
}

func (s *Service) Create(ctx context.Context, input CreateInput) (*Task, error) {
	if input.ProjectID <= 0 || strings.TrimSpace(input.Key) == "" || strings.TrimSpace(input.Title) == "" || strings.TrimSpace(input.Description) == "" {
		return nil, fmt.Errorf("projectId, key, title and description are required")
	}
	if err := validateStatus(input.Status); err != nil {
		return nil, err
	}
	if err := validatePriority(input.Priority); err != nil {
		return nil, err
	}
	return s.repo.Create(ctx, input)
}

func (s *Service) List(ctx context.Context, filter Filter) ([]Task, error) {
	if filter.Status != "" {
		if err := validateStatus(filter.Status); err != nil {
			return nil, err
		}
	}
	if filter.Priority != "" {
		if err := validatePriority(filter.Priority); err != nil {
			return nil, err
		}
	}
	return s.repo.List(ctx, filter)
}

func (s *Service) GetByID(ctx context.Context, id int) (*Task, error) { return s.repo.GetByID(ctx, id) }
func (s *Service) Delete(ctx context.Context, id int) error           { return s.repo.Delete(ctx, id) }

func (s *Service) Update(ctx context.Context, id int, input UpdateInput) (*Task, error) {
	if input.Status != nil {
		if err := validateStatus(*input.Status); err != nil {
			return nil, err
		}
	}
	if input.Priority != nil {
		if err := validatePriority(*input.Priority); err != nil {
			return nil, err
		}
	}
	return s.repo.Update(ctx, id, input)
}

func (s *Service) CreateTag(ctx context.Context, input CreateTagInput) (*Tag, error) {
	if strings.TrimSpace(input.Value) == "" {
		return nil, fmt.Errorf("value is required")
	}
	if _, err := s.repo.GetByID(ctx, input.TaskID); err != nil {
		return nil, err
	}
	return s.repo.CreateTag(ctx, input)
}

func (s *Service) ListTags(ctx context.Context, taskID int) ([]Tag, error) {
	if _, err := s.repo.GetByID(ctx, taskID); err != nil {
		return nil, err
	}
	return s.repo.ListTags(ctx, taskID)
}

func (s *Service) GetTagByID(ctx context.Context, id int) (*Tag, error) {
	return s.repo.GetTagByID(ctx, id)
}

func (s *Service) UpdateTag(ctx context.Context, id int, input UpdateTagInput) (*Tag, error) {
	if input.Value != nil && strings.TrimSpace(*input.Value) == "" {
		return nil, fmt.Errorf("value is required")
	}
	return s.repo.UpdateTag(ctx, id, input)
}

func (s *Service) DeleteTag(ctx context.Context, id int) error { return s.repo.DeleteTag(ctx, id) }

func (s *Service) CreateComment(ctx context.Context, input CreateCommentInput) (*Comment, error) {
	if strings.TrimSpace(input.Content) == "" || input.AuthorUserID <= 0 {
		return nil, fmt.Errorf("authorUserId and content are required")
	}
	if _, err := s.repo.GetByID(ctx, input.TaskID); err != nil {
		return nil, err
	}
	return s.repo.CreateComment(ctx, input)
}

func (s *Service) ListComments(ctx context.Context, filter CommentFilter) ([]Comment, error) {
	if _, err := s.repo.GetByID(ctx, filter.TaskID); err != nil {
		return nil, err
	}
	return s.repo.ListComments(ctx, filter)
}

func (s *Service) GetCommentByID(ctx context.Context, id int) (*Comment, error) {
	return s.repo.GetCommentByID(ctx, id)
}

func (s *Service) UpdateComment(ctx context.Context, id int, input UpdateCommentInput) (*Comment, error) {
	if input.Content != nil && strings.TrimSpace(*input.Content) == "" {
		return nil, fmt.Errorf("content is required")
	}
	return s.repo.UpdateComment(ctx, id, input)
}

func (s *Service) DeleteComment(ctx context.Context, id int) error {
	return s.repo.DeleteComment(ctx, id)
}

func validateStatus(value string) error {
	switch value {
	case "backlog", "todo", "in-progress", "review", "done", "cancelled":
		return nil
	default:
		return fmt.Errorf("invalid task status: %s", value)
	}
}

func validatePriority(value string) error {
	switch value {
	case "low", "medium", "high", "critical":
		return nil
	default:
		return fmt.Errorf("invalid task priority: %s", value)
	}
}
