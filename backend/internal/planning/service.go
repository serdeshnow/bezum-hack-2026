package planning

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

func (s *Service) CreateEpoch(ctx context.Context, input CreateEpochInput) (*Epoch, error) {
	if input.ProjectID <= 0 || strings.TrimSpace(input.Name) == "" {
		return nil, fmt.Errorf("projectId and name are required")
	}
	if input.Phase == "" {
		input.Phase = "delivery"
	}
	if err := validateEpochStatus(input.Status); err != nil {
		return nil, err
	}
	return s.repo.CreateEpoch(ctx, input)
}

func (s *Service) ListEpochs(ctx context.Context, filter EpochFilter) ([]Epoch, error) {
	if filter.Status != "" {
		if err := validateEpochStatus(filter.Status); err != nil {
			return nil, err
		}
	}
	return s.repo.ListEpochs(ctx, filter)
}

func (s *Service) GetEpochByID(ctx context.Context, id int) (*Epoch, error) {
	return s.repo.GetEpochByID(ctx, id)
}
func (s *Service) DeleteEpoch(ctx context.Context, id int) error { return s.repo.DeleteEpoch(ctx, id) }

func (s *Service) UpdateEpoch(ctx context.Context, id int, input UpdateEpochInput) (*Epoch, error) {
	if input.Status != nil {
		if err := validateEpochStatus(*input.Status); err != nil {
			return nil, err
		}
	}
	return s.repo.UpdateEpoch(ctx, id, input)
}

func (s *Service) CreateGoal(ctx context.Context, input CreateGoalInput) (*Goal, error) {
	if input.EpochID <= 0 || strings.TrimSpace(input.Title) == "" {
		return nil, fmt.Errorf("epochId and title are required")
	}
	if err := validateGoalStatus(input.Status); err != nil {
		return nil, err
	}
	if input.ProgressPercent < 0 || input.ProgressPercent > 100 {
		return nil, fmt.Errorf("progressPercent must be between 0 and 100")
	}
	return s.repo.CreateGoal(ctx, input)
}

func (s *Service) ListGoals(ctx context.Context, filter GoalFilter) ([]Goal, error) {
	if filter.Status != "" {
		if err := validateGoalStatus(filter.Status); err != nil {
			return nil, err
		}
	}
	return s.repo.ListGoals(ctx, filter)
}

func (s *Service) GetGoalByID(ctx context.Context, id int) (*Goal, error) {
	return s.repo.GetGoalByID(ctx, id)
}
func (s *Service) DeleteGoal(ctx context.Context, id int) error { return s.repo.DeleteGoal(ctx, id) }

func (s *Service) UpdateGoal(ctx context.Context, id int, input UpdateGoalInput) (*Goal, error) {
	if input.Status != nil {
		if err := validateGoalStatus(*input.Status); err != nil {
			return nil, err
		}
	}
	if input.ProgressPercent != nil && (*input.ProgressPercent < 0 || *input.ProgressPercent > 100) {
		return nil, fmt.Errorf("progressPercent must be between 0 and 100")
	}
	return s.repo.UpdateGoal(ctx, id, input)
}

func validateEpochStatus(value string) error {
	switch value {
	case "draft", "active", "at-risk", "archived", "completed":
		return nil
	default:
		return fmt.Errorf("invalid epoch status: %s", value)
	}
}

func validateGoalStatus(value string) error {
	switch value {
	case "not-started", "in-progress", "completed", "blocked":
		return nil
	default:
		return fmt.Errorf("invalid goal status: %s", value)
	}
}
