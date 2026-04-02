package delivery

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

func (s *Service) CreateRelease(ctx context.Context, input CreateReleaseInput) (*Release, error) {
	if input.ProjectID <= 0 || input.AuthorUserID <= 0 || strings.TrimSpace(input.Version) == "" || strings.TrimSpace(input.Title) == "" {
		return nil, fmt.Errorf("projectId, version, title and authorUserId are required")
	}
	if err := validateReleaseStatus(input.Status); err != nil {
		return nil, err
	}
	if err := validateCounters(input.CommitsCount, input.FeaturesCount, input.FixesCount, input.BreakingCount); err != nil {
		return nil, err
	}
	if err := validateProgress(input.ProgressPercent); err != nil {
		return nil, err
	}
	return s.repo.CreateRelease(ctx, input)
}

func (s *Service) ListReleases(ctx context.Context, filter ReleaseFilter) ([]Release, error) {
	if filter.Status != "" {
		if err := validateReleaseStatus(filter.Status); err != nil {
			return nil, err
		}
	}
	return s.repo.ListReleases(ctx, filter)
}

func (s *Service) GetReleaseByID(ctx context.Context, id int) (*Release, error) {
	return s.repo.GetReleaseByID(ctx, id)
}

func (s *Service) UpdateRelease(ctx context.Context, id int, input UpdateReleaseInput) (*Release, error) {
	if input.Version != nil && strings.TrimSpace(*input.Version) == "" {
		return nil, fmt.Errorf("version is required")
	}
	if input.Title != nil && strings.TrimSpace(*input.Title) == "" {
		return nil, fmt.Errorf("title is required")
	}
	if input.Status != nil {
		if err := validateReleaseStatus(*input.Status); err != nil {
			return nil, err
		}
	}
	if input.CommitsCount != nil && *input.CommitsCount < 0 {
		return nil, fmt.Errorf("commitsCount must be non-negative")
	}
	if input.FeaturesCount != nil && *input.FeaturesCount < 0 {
		return nil, fmt.Errorf("featuresCount must be non-negative")
	}
	if input.FixesCount != nil && *input.FixesCount < 0 {
		return nil, fmt.Errorf("fixesCount must be non-negative")
	}
	if input.BreakingCount != nil && *input.BreakingCount < 0 {
		return nil, fmt.Errorf("breakingCount must be non-negative")
	}
	if input.ProgressPercent != nil {
		if err := validateProgress(*input.ProgressPercent); err != nil {
			return nil, err
		}
	}
	return s.repo.UpdateRelease(ctx, id, input)
}

func (s *Service) DeleteRelease(ctx context.Context, id int) error {
	return s.repo.DeleteRelease(ctx, id)
}

func (s *Service) CreatePullRequest(ctx context.Context, input CreatePullRequestInput) (*PullRequest, error) {
	if input.ProjectID <= 0 || input.AuthorUserID <= 0 || input.Number <= 0 || strings.TrimSpace(input.Title) == "" || strings.TrimSpace(input.Branch) == "" {
		return nil, fmt.Errorf("projectId, number, title, branch and authorUserId are required")
	}
	if err := validatePullRequestStatus(input.Status); err != nil {
		return nil, err
	}
	if input.CommitsCount < 0 || input.Additions < 0 || input.Deletions < 0 {
		return nil, fmt.Errorf("pull request counters must be non-negative")
	}
	return s.repo.CreatePullRequest(ctx, input)
}

func (s *Service) ListPullRequests(ctx context.Context, filter PullRequestFilter) ([]PullRequest, error) {
	if filter.Status != "" {
		if err := validatePullRequestStatus(filter.Status); err != nil {
			return nil, err
		}
	}
	return s.repo.ListPullRequests(ctx, filter)
}

func (s *Service) GetPullRequestByID(ctx context.Context, id int) (*PullRequest, error) {
	return s.repo.GetPullRequestByID(ctx, id)
}

func (s *Service) UpdatePullRequest(ctx context.Context, id int, input UpdatePullRequestInput) (*PullRequest, error) {
	if input.Number != nil && *input.Number <= 0 {
		return nil, fmt.Errorf("number must be positive")
	}
	if input.Title != nil && strings.TrimSpace(*input.Title) == "" {
		return nil, fmt.Errorf("title is required")
	}
	if input.Branch != nil && strings.TrimSpace(*input.Branch) == "" {
		return nil, fmt.Errorf("branch is required")
	}
	if input.Status != nil {
		if err := validatePullRequestStatus(*input.Status); err != nil {
			return nil, err
		}
	}
	if input.CommitsCount != nil && *input.CommitsCount < 0 {
		return nil, fmt.Errorf("commitsCount must be non-negative")
	}
	if input.Additions != nil && *input.Additions < 0 {
		return nil, fmt.Errorf("additions must be non-negative")
	}
	if input.Deletions != nil && *input.Deletions < 0 {
		return nil, fmt.Errorf("deletions must be non-negative")
	}
	return s.repo.UpdatePullRequest(ctx, id, input)
}

func (s *Service) DeletePullRequest(ctx context.Context, id int) error {
	return s.repo.DeletePullRequest(ctx, id)
}

func validateReleaseStatus(value string) error {
	switch value {
	case "planned", "in-progress", "deployed", "failed", "rolled-back":
		return nil
	default:
		return fmt.Errorf("invalid release status: %s", value)
	}
}

func validatePullRequestStatus(value string) error {
	switch value {
	case "open", "reviewing", "merged", "closed":
		return nil
	default:
		return fmt.Errorf("invalid pull request status: %s", value)
	}
}

func validateCounters(commits, features, fixes, breaking int) error {
	if commits < 0 || features < 0 || fixes < 0 || breaking < 0 {
		return fmt.Errorf("release counters must be non-negative")
	}
	return nil
}

func validateProgress(value int) error {
	if value < 0 || value > 100 {
		return fmt.Errorf("progressPercent must be between 0 and 100")
	}
	return nil
}
