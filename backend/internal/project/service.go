package project

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

func (s *Service) Create(ctx context.Context, input CreateProjectInput) (*Project, error) {
	if strings.TrimSpace(input.Key) == "" || strings.TrimSpace(input.Name) == "" {
		return nil, fmt.Errorf("key and name are required")
	}
	if err := validateProjectStatus(input.Status); err != nil {
		return nil, err
	}
	if err := validateVisibility(input.VisibilityMode); err != nil {
		return nil, err
	}
	if input.OwnerUserID == nil {
		return nil, fmt.Errorf("ownerUserId is required")
	}
	if input.ProgressPercent < 0 || input.ProgressPercent > 100 {
		return nil, fmt.Errorf("progressPercent must be between 0 and 100")
	}
	return s.repo.Create(ctx, input)
}

func (s *Service) List(ctx context.Context, filter ProjectFilter) ([]Project, error) {
	if filter.Status != "" {
		if err := validateProjectStatus(filter.Status); err != nil {
			return nil, err
		}
	}
	if filter.VisibilityMode != "" {
		if err := validateVisibility(filter.VisibilityMode); err != nil {
			return nil, err
		}
	}
	return s.repo.List(ctx, filter)
}

func (s *Service) GetByID(ctx context.Context, id int) (*Project, error) {
	return s.repo.GetByID(ctx, id)
}
func (s *Service) Delete(ctx context.Context, id int) error { return s.repo.Delete(ctx, id) }

func (s *Service) Update(ctx context.Context, id int, input UpdateProjectInput) (*Project, error) {
	if input.Status != nil {
		if err := validateProjectStatus(*input.Status); err != nil {
			return nil, err
		}
	}
	if input.VisibilityMode != nil {
		if err := validateVisibility(*input.VisibilityMode); err != nil {
			return nil, err
		}
	}
	if input.ProgressPercent != nil && (*input.ProgressPercent < 0 || *input.ProgressPercent > 100) {
		return nil, fmt.Errorf("progressPercent must be between 0 and 100")
	}
	return s.repo.Update(ctx, id, input)
}

func (s *Service) CreateMember(ctx context.Context, input CreateMemberInput) (*Member, error) {
	if err := validateRole(input.Role); err != nil {
		return nil, err
	}
	if _, err := s.repo.GetByID(ctx, input.ProjectID); err != nil {
		return nil, err
	}
	return s.repo.CreateMember(ctx, input)
}

func (s *Service) ListMembers(ctx context.Context, filter MemberFilter) ([]Member, error) {
	if _, err := s.repo.GetByID(ctx, filter.ProjectID); err != nil {
		return nil, err
	}
	return s.repo.ListMembers(ctx, filter)
}

func (s *Service) GetMemberByID(ctx context.Context, id int) (*Member, error) {
	return s.repo.GetMemberByID(ctx, id)
}

func (s *Service) UpdateMember(ctx context.Context, id int, input UpdateMemberInput) (*Member, error) {
	if input.Role != nil {
		if err := validateRole(*input.Role); err != nil {
			return nil, err
		}
	}
	return s.repo.UpdateMember(ctx, id, input)
}

func (s *Service) DeleteMember(ctx context.Context, id int) error {
	return s.repo.DeleteMember(ctx, id)
}

func validateProjectStatus(value string) error {
	switch value {
	case "draft", "active", "at-risk", "archived", "completed":
		return nil
	default:
		return fmt.Errorf("invalid project status: %s", value)
	}
}

func validateVisibility(value string) error {
	switch value {
	case "internal", "customer":
		return nil
	default:
		return fmt.Errorf("invalid visibilityMode: %s", value)
	}
}

func validateRole(value string) error {
	switch value {
	case "customer", "developer", "manager", "admin":
		return nil
	default:
		return fmt.Errorf("invalid role: %s", value)
	}
}
