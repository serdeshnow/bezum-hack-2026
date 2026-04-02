package project

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
	ErrProjectNotFound = errors.New("project not found")
	ErrMemberNotFound  = errors.New("project member not found")
	ErrProjectConflict = errors.New("project conflict")
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) Create(ctx context.Context, input CreateProjectInput) (*Project, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO projects (
			key, name, description, status, visibility_mode, owner_user_id, active_epoch_id,
			due_date, started_at, completed_at, progress_percent
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
		RETURNING id, key, name, description, status, visibility_mode, owner_user_id, active_epoch_id,
			due_date, started_at, completed_at, progress_percent, created_at, updated_at
	`,
		input.Key, input.Name, input.Description, input.Status, input.VisibilityMode,
		input.OwnerUserID, input.ActiveEpochID, input.DueDate, input.StartedAt, input.CompletedAt,
		input.ProgressPercent,
	)

	item, err := scanProject(row)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrProjectConflict
		}
		return nil, fmt.Errorf("create project: %w", err)
	}
	return item, nil
}

func (r *Repository) List(ctx context.Context, filter ProjectFilter) ([]Project, error) {
	conditions := make([]string, 0, 4)
	args := make([]any, 0, 4)
	index := 1

	if filter.Status != "" {
		conditions = append(conditions, fmt.Sprintf("status = $%d", index))
		args = append(args, filter.Status)
		index++
	}
	if filter.VisibilityMode != "" {
		conditions = append(conditions, fmt.Sprintf("visibility_mode = $%d", index))
		args = append(args, filter.VisibilityMode)
		index++
	}
	if filter.OwnerUserID != nil {
		conditions = append(conditions, fmt.Sprintf("owner_user_id = $%d", index))
		args = append(args, *filter.OwnerUserID)
		index++
	}
	if filter.Query != "" {
		conditions = append(conditions, fmt.Sprintf("(key ILIKE $%d OR name ILIKE $%d OR COALESCE(description,'') ILIKE $%d)", index, index, index))
		args = append(args, "%"+filter.Query+"%")
		index++
	}

	query := `
		SELECT id, key, name, description, status, visibility_mode, owner_user_id, active_epoch_id,
			due_date, started_at, completed_at, progress_percent, created_at, updated_at
		FROM projects
	`
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += " ORDER BY id ASC"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list projects: %w", err)
	}
	defer rows.Close()

	items := make([]Project, 0)
	for rows.Next() {
		item, err := scanProject(rows)
		if err != nil {
			return nil, fmt.Errorf("scan project: %w", err)
		}
		items = append(items, *item)
	}
	return items, rows.Err()
}

func (r *Repository) GetByID(ctx context.Context, id int) (*Project, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT id, key, name, description, status, visibility_mode, owner_user_id, active_epoch_id,
			due_date, started_at, completed_at, progress_percent, created_at, updated_at
		FROM projects WHERE id = $1
	`, id)

	item, err := scanProject(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrProjectNotFound
		}
		return nil, fmt.Errorf("get project: %w", err)
	}
	return item, nil
}

func (r *Repository) Update(ctx context.Context, id int, input UpdateProjectInput) (*Project, error) {
	sets := make([]string, 0, 11)
	args := make([]any, 0, 12)
	index := 1

	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}

	if input.Key != nil {
		add("key", *input.Key)
	}
	if input.Name != nil {
		add("name", *input.Name)
	}
	if input.Description != nil {
		add("description", *input.Description)
	}
	if input.Status != nil {
		add("status", *input.Status)
	}
	if input.VisibilityMode != nil {
		add("visibility_mode", *input.VisibilityMode)
	}
	if input.OwnerUserID != nil {
		add("owner_user_id", *input.OwnerUserID)
	}
	if input.ActiveEpochID != nil {
		add("active_epoch_id", *input.ActiveEpochID)
	}
	if input.DueDate != nil {
		add("due_date", *input.DueDate)
	}
	if input.StartedAt != nil {
		add("started_at", *input.StartedAt)
	}
	if input.CompletedAt != nil {
		add("completed_at", *input.CompletedAt)
	}
	if input.ProgressPercent != nil {
		add("progress_percent", *input.ProgressPercent)
	}
	if len(sets) == 0 {
		return r.GetByID(ctx, id)
	}

	add("updated_at", time.Now())
	args = append(args, id)

	query := fmt.Sprintf(`
		UPDATE projects SET %s WHERE id = $%d
		RETURNING id, key, name, description, status, visibility_mode, owner_user_id, active_epoch_id,
			due_date, started_at, completed_at, progress_percent, created_at, updated_at
	`, strings.Join(sets, ", "), index)

	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanProject(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrProjectNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrProjectConflict
		}
		return nil, fmt.Errorf("update project: %w", err)
	}
	return item, nil
}

func (r *Repository) Delete(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM projects WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete project: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrProjectNotFound
	}
	return nil
}

func (r *Repository) CreateMember(ctx context.Context, input CreateMemberInput) (*Member, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO project_members (project_id, user_id, role)
		VALUES ($1,$2,$3)
		RETURNING id, project_id, user_id, role, joined_at, created_at, updated_at
	`, input.ProjectID, input.UserID, input.Role)

	item, err := scanMember(row)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrProjectConflict
		}
		return nil, fmt.Errorf("create project member: %w", err)
	}
	return item, nil
}

func (r *Repository) ListMembers(ctx context.Context, filter MemberFilter) ([]Member, error) {
	query := `
		SELECT id, project_id, user_id, role, joined_at, created_at, updated_at
		FROM project_members
		WHERE project_id = $1
	`
	args := []any{filter.ProjectID}
	if filter.UserID != nil {
		query += " AND user_id = $2"
		args = append(args, *filter.UserID)
	}
	query += " ORDER BY id ASC"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list project members: %w", err)
	}
	defer rows.Close()

	items := make([]Member, 0)
	for rows.Next() {
		item, err := scanMember(rows)
		if err != nil {
			return nil, fmt.Errorf("scan project member: %w", err)
		}
		items = append(items, *item)
	}
	return items, rows.Err()
}

func (r *Repository) GetMemberByID(ctx context.Context, id int) (*Member, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT id, project_id, user_id, role, joined_at, created_at, updated_at
		FROM project_members WHERE id = $1
	`, id)
	item, err := scanMember(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMemberNotFound
		}
		return nil, fmt.Errorf("get project member: %w", err)
	}
	return item, nil
}

func (r *Repository) UpdateMember(ctx context.Context, id int, input UpdateMemberInput) (*Member, error) {
	sets := make([]string, 0, 4)
	args := make([]any, 0, 5)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.ProjectID != nil {
		add("project_id", *input.ProjectID)
	}
	if input.UserID != nil {
		add("user_id", *input.UserID)
	}
	if input.Role != nil {
		add("role", *input.Role)
	}
	if len(sets) == 0 {
		return r.GetMemberByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)

	query := fmt.Sprintf(`
		UPDATE project_members SET %s WHERE id = $%d
		RETURNING id, project_id, user_id, role, joined_at, created_at, updated_at
	`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanMember(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMemberNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrProjectConflict
		}
		return nil, fmt.Errorf("update project member: %w", err)
	}
	return item, nil
}

func (r *Repository) DeleteMember(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM project_members WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete project member: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrMemberNotFound
	}
	return nil
}

func scanProject(row pgx.Row) (*Project, error) {
	var item Project
	err := row.Scan(
		&item.ID,
		&item.Key,
		&item.Name,
		&item.Description,
		&item.Status,
		&item.VisibilityMode,
		&item.OwnerUserID,
		&item.ActiveEpochID,
		&item.DueDate,
		&item.StartedAt,
		&item.CompletedAt,
		&item.ProgressPercent,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanMember(row pgx.Row) (*Member, error) {
	var item Member
	err := row.Scan(&item.ID, &item.ProjectID, &item.UserID, &item.Role, &item.JoinedAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
