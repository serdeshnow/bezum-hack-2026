package communication

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

func (s *Service) CreateNotification(ctx context.Context, input CreateNotificationInput) (*Notification, error) {
	if input.UserID <= 0 || strings.TrimSpace(input.Title) == "" || strings.TrimSpace(input.Description) == "" {
		return nil, fmt.Errorf("userId, title and description are required")
	}
	if input.EntityType != nil && strings.TrimSpace(*input.EntityType) == "" {
		return nil, fmt.Errorf("entityType is required")
	}
	if input.EntityID != nil && *input.EntityID <= 0 {
		return nil, fmt.Errorf("entityId must be positive")
	}
	return s.repo.CreateNotification(ctx, input)
}

func (s *Service) ListNotifications(ctx context.Context, filter NotificationFilter) ([]Notification, error) {
	return s.repo.ListNotifications(ctx, filter)
}

func (s *Service) GetNotificationByID(ctx context.Context, id int) (*Notification, error) {
	return s.repo.GetNotificationByID(ctx, id)
}

func (s *Service) UpdateNotification(ctx context.Context, id int, input UpdateNotificationInput) (*Notification, error) {
	if input.Type != nil && strings.TrimSpace(*input.Type) == "" {
		return nil, fmt.Errorf("type is required")
	}
	if input.Title != nil && strings.TrimSpace(*input.Title) == "" {
		return nil, fmt.Errorf("title is required")
	}
	if input.Description != nil && strings.TrimSpace(*input.Description) == "" {
		return nil, fmt.Errorf("description is required")
	}
	if input.EntityType != nil && strings.TrimSpace(*input.EntityType) == "" {
		return nil, fmt.Errorf("entityType is required")
	}
	if input.EntityID != nil && *input.EntityID <= 0 {
		return nil, fmt.Errorf("entityId must be positive")
	}
	return s.repo.UpdateNotification(ctx, id, input)
}

func (s *Service) DeleteNotification(ctx context.Context, id int) error {
	return s.repo.DeleteNotification(ctx, id)
}

func (s *Service) CreateActivityFeed(ctx context.Context, input CreateActivityFeedInput) (*ActivityFeed, error) {
	if input.ProjectID <= 0 || strings.TrimSpace(input.Type) == "" || strings.TrimSpace(input.Action) == "" || strings.TrimSpace(input.Title) == "" {
		return nil, fmt.Errorf("projectId, type, action and title are required")
	}
	return s.repo.CreateActivityFeed(ctx, input)
}

func (s *Service) ListActivityFeed(ctx context.Context, filter ActivityFeedFilter) ([]ActivityFeed, error) {
	return s.repo.ListActivityFeed(ctx, filter)
}

func (s *Service) GetActivityFeedByID(ctx context.Context, id int) (*ActivityFeed, error) {
	return s.repo.GetActivityFeedByID(ctx, id)
}

func (s *Service) UpdateActivityFeed(ctx context.Context, id int, input UpdateActivityFeedInput) (*ActivityFeed, error) {
	if input.Type != nil && strings.TrimSpace(*input.Type) == "" {
		return nil, fmt.Errorf("type is required")
	}
	if input.Action != nil && strings.TrimSpace(*input.Action) == "" {
		return nil, fmt.Errorf("action is required")
	}
	if input.Title != nil && strings.TrimSpace(*input.Title) == "" {
		return nil, fmt.Errorf("title is required")
	}
	return s.repo.UpdateActivityFeed(ctx, id, input)
}

func (s *Service) DeleteActivityFeed(ctx context.Context, id int) error {
	return s.repo.DeleteActivityFeed(ctx, id)
}
