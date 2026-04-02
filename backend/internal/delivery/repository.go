package delivery

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
	ErrReleaseNotFound     = errors.New("release not found")
	ErrPullRequestNotFound = errors.New("pull request not found")
	ErrDeliveryConflict    = errors.New("delivery conflict")
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository { return &Repository{pool: pool} }

func (r *Repository) CreateRelease(ctx context.Context, input CreateReleaseInput) (*Release, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO releases (
			project_id, version, title, status, target_date, deployed_at, commits_count, author_user_id,
			features_count, fixes_count, breaking_count, progress_percent
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
		RETURNING id, project_id, version, title, status, target_date, deployed_at, commits_count, author_user_id,
			features_count, fixes_count, breaking_count, progress_percent, created_at, updated_at
	`, input.ProjectID, input.Version, input.Title, input.Status, input.TargetDate, input.DeployedAt, input.CommitsCount, input.AuthorUserID,
		input.FeaturesCount, input.FixesCount, input.BreakingCount, input.ProgressPercent)
	return scanRelease(row)
}

func (r *Repository) ListReleases(ctx context.Context, filter ReleaseFilter) ([]Release, error) {
	query := `SELECT id, project_id, version, title, status, target_date, deployed_at, commits_count, author_user_id, features_count, fixes_count, breaking_count, progress_percent, created_at, updated_at FROM releases`
	conditions := make([]string, 0, 3)
	args := make([]any, 0, 3)
	index := 1
	add := func(expr string, value any) {
		conditions = append(conditions, fmt.Sprintf(expr, index))
		args = append(args, value)
		index++
	}
	if filter.ProjectID != nil {
		add("project_id = $%d", *filter.ProjectID)
	}
	if filter.Status != "" {
		add("status = $%d", filter.Status)
	}
	if filter.AuthorUserID != nil {
		add("author_user_id = $%d", *filter.AuthorUserID)
	}
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += " ORDER BY id ASC"
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Release, 0)
	for rows.Next() {
		item, err := scanRelease(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetReleaseByID(ctx context.Context, id int) (*Release, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, project_id, version, title, status, target_date, deployed_at, commits_count, author_user_id, features_count, fixes_count, breaking_count, progress_percent, created_at, updated_at FROM releases WHERE id = $1`, id)
	item, err := scanRelease(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrReleaseNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateRelease(ctx context.Context, id int, input UpdateReleaseInput) (*Release, error) {
	sets := make([]string, 0, 11)
	args := make([]any, 0, 12)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.Version != nil {
		add("version", *input.Version)
	}
	if input.Title != nil {
		add("title", *input.Title)
	}
	if input.Status != nil {
		add("status", *input.Status)
	}
	if input.TargetDate != nil {
		add("target_date", *input.TargetDate)
	}
	if input.DeployedAt != nil {
		add("deployed_at", *input.DeployedAt)
	}
	if input.CommitsCount != nil {
		add("commits_count", *input.CommitsCount)
	}
	if input.AuthorUserID != nil {
		add("author_user_id", *input.AuthorUserID)
	}
	if input.FeaturesCount != nil {
		add("features_count", *input.FeaturesCount)
	}
	if input.FixesCount != nil {
		add("fixes_count", *input.FixesCount)
	}
	if input.BreakingCount != nil {
		add("breaking_count", *input.BreakingCount)
	}
	if input.ProgressPercent != nil {
		add("progress_percent", *input.ProgressPercent)
	}
	if len(sets) == 0 {
		return r.GetReleaseByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	query := fmt.Sprintf(`UPDATE releases SET %s WHERE id = $%d RETURNING id, project_id, version, title, status, target_date, deployed_at, commits_count, author_user_id, features_count, fixes_count, breaking_count, progress_percent, created_at, updated_at`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanRelease(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrReleaseNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteRelease(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM releases WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrReleaseNotFound
	}
	return nil
}

func (r *Repository) CreatePullRequest(ctx context.Context, input CreatePullRequestInput) (*PullRequest, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO pull_requests (
			project_id, release_id, number, title, branch, status, author_user_id, commits_count, additions, deletions, external_url, merged_at
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
		RETURNING id, project_id, release_id, number, title, branch, status, author_user_id, commits_count, additions, deletions, external_url, merged_at, created_at, updated_at
	`, input.ProjectID, input.ReleaseID, input.Number, input.Title, input.Branch, input.Status, input.AuthorUserID, input.CommitsCount, input.Additions, input.Deletions, input.ExternalURL, input.MergedAt)
	item, err := scanPullRequest(row)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrDeliveryConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) ListPullRequests(ctx context.Context, filter PullRequestFilter) ([]PullRequest, error) {
	query := `SELECT id, project_id, release_id, number, title, branch, status, author_user_id, commits_count, additions, deletions, external_url, merged_at, created_at, updated_at FROM pull_requests`
	conditions := make([]string, 0, 4)
	args := make([]any, 0, 4)
	index := 1
	add := func(expr string, value any) {
		conditions = append(conditions, fmt.Sprintf(expr, index))
		args = append(args, value)
		index++
	}
	if filter.ProjectID != nil {
		add("project_id = $%d", *filter.ProjectID)
	}
	if filter.ReleaseID != nil {
		add("release_id = $%d", *filter.ReleaseID)
	}
	if filter.Status != "" {
		add("status = $%d", filter.Status)
	}
	if filter.AuthorUserID != nil {
		add("author_user_id = $%d", *filter.AuthorUserID)
	}
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += " ORDER BY id ASC"
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]PullRequest, 0)
	for rows.Next() {
		item, err := scanPullRequest(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetPullRequestByID(ctx context.Context, id int) (*PullRequest, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, project_id, release_id, number, title, branch, status, author_user_id, commits_count, additions, deletions, external_url, merged_at, created_at, updated_at FROM pull_requests WHERE id = $1`, id)
	item, err := scanPullRequest(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPullRequestNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) GetPullRequestByProjectAndNumber(ctx context.Context, projectID int, number int) (*PullRequest, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, project_id, release_id, number, title, branch, status, author_user_id, commits_count, additions, deletions, external_url, merged_at, created_at, updated_at FROM pull_requests WHERE project_id = $1 AND number = $2`, projectID, number)
	item, err := scanPullRequest(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPullRequestNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdatePullRequest(ctx context.Context, id int, input UpdatePullRequestInput) (*PullRequest, error) {
	sets := make([]string, 0, 10)
	args := make([]any, 0, 11)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.ReleaseID != nil {
		add("release_id", *input.ReleaseID)
	}
	if input.Number != nil {
		add("number", *input.Number)
	}
	if input.Title != nil {
		add("title", *input.Title)
	}
	if input.Branch != nil {
		add("branch", *input.Branch)
	}
	if input.Status != nil {
		add("status", *input.Status)
	}
	if input.AuthorUserID != nil {
		add("author_user_id", *input.AuthorUserID)
	}
	if input.CommitsCount != nil {
		add("commits_count", *input.CommitsCount)
	}
	if input.Additions != nil {
		add("additions", *input.Additions)
	}
	if input.Deletions != nil {
		add("deletions", *input.Deletions)
	}
	if input.ExternalURL != nil {
		add("external_url", *input.ExternalURL)
	}
	if input.MergedAt != nil {
		add("merged_at", *input.MergedAt)
	}
	if len(sets) == 0 {
		return r.GetPullRequestByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	query := fmt.Sprintf(`UPDATE pull_requests SET %s WHERE id = $%d RETURNING id, project_id, release_id, number, title, branch, status, author_user_id, commits_count, additions, deletions, external_url, merged_at, created_at, updated_at`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanPullRequest(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPullRequestNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrDeliveryConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeletePullRequest(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM pull_requests WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrPullRequestNotFound
	}
	return nil
}

func (r *Repository) UpsertGitHubPullRequest(ctx context.Context, input GitHubPullRequest) (*GitHubPullRequest, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO github_pull_requests (
			pull_request_id, task_id, github_node_id, repository_full_name, head_branch, base_branch, payload_json, last_event, synchronized_at
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		ON CONFLICT (pull_request_id) DO UPDATE SET
			task_id = EXCLUDED.task_id,
			github_node_id = EXCLUDED.github_node_id,
			repository_full_name = EXCLUDED.repository_full_name,
			head_branch = EXCLUDED.head_branch,
			base_branch = EXCLUDED.base_branch,
			payload_json = EXCLUDED.payload_json,
			last_event = EXCLUDED.last_event,
			synchronized_at = EXCLUDED.synchronized_at,
			updated_at = now()
		RETURNING id, pull_request_id, task_id, github_node_id, repository_full_name, head_branch, base_branch, payload_json, last_event, synchronized_at, created_at, updated_at
	`, input.PullRequestID, input.TaskID, input.GitHubNodeID, input.RepositoryFullName, input.HeadBranch, input.BaseBranch, input.PayloadJSON, input.LastEvent, input.SynchronizedAt)
	return scanGitHubPullRequest(row)
}

func scanRelease(row pgx.Row) (*Release, error) {
	var item Release
	err := row.Scan(&item.ID, &item.ProjectID, &item.Version, &item.Title, &item.Status, &item.TargetDate, &item.DeployedAt, &item.CommitsCount, &item.AuthorUserID, &item.FeaturesCount, &item.FixesCount, &item.BreakingCount, &item.ProgressPercent, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanPullRequest(row pgx.Row) (*PullRequest, error) {
	var item PullRequest
	err := row.Scan(&item.ID, &item.ProjectID, &item.ReleaseID, &item.Number, &item.Title, &item.Branch, &item.Status, &item.AuthorUserID, &item.CommitsCount, &item.Additions, &item.Deletions, &item.ExternalURL, &item.MergedAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanGitHubPullRequest(row pgx.Row) (*GitHubPullRequest, error) {
	var item GitHubPullRequest
	err := row.Scan(&item.ID, &item.PullRequestID, &item.TaskID, &item.GitHubNodeID, &item.RepositoryFullName, &item.HeadBranch, &item.BaseBranch, &item.PayloadJSON, &item.LastEvent, &item.SynchronizedAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
