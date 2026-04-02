package planning

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrEpochNotFound = errors.New("epoch not found")
	ErrGoalNotFound  = errors.New("goal not found")
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) CreateEpoch(ctx context.Context, input CreateEpochInput) (*Epoch, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO epochs (project_id, name, phase, status, start_date, end_date, days_remaining)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
		RETURNING id, project_id, name, phase, status, start_date, end_date, days_remaining, created_at, updated_at
	`, input.ProjectID, input.Name, input.Phase, input.Status, input.StartDate, input.EndDate, calculateDaysRemaining(input.EndDate))
	return scanEpoch(row)
}

func (r *Repository) ListEpochs(ctx context.Context, filter EpochFilter) ([]Epoch, error) {
	query := `SELECT id, project_id, name, phase, status, start_date, end_date, days_remaining, created_at, updated_at FROM epochs`
	conditions := make([]string, 0, 2)
	args := make([]any, 0, 2)
	index := 1
	if filter.ProjectID != nil {
		conditions = append(conditions, fmt.Sprintf("project_id = $%d", index))
		args = append(args, *filter.ProjectID)
		index++
	}
	if filter.Status != "" {
		conditions = append(conditions, fmt.Sprintf("status = $%d", index))
		args = append(args, filter.Status)
	}
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += " ORDER BY id ASC"
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list epochs: %w", err)
	}
	defer rows.Close()
	out := make([]Epoch, 0)
	for rows.Next() {
		item, err := scanEpoch(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetEpochByID(ctx context.Context, id int) (*Epoch, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, project_id, name, phase, status, start_date, end_date, days_remaining, created_at, updated_at FROM epochs WHERE id = $1`, id)
	item, err := scanEpoch(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrEpochNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateEpoch(ctx context.Context, id int, input UpdateEpochInput) (*Epoch, error) {
	sets := make([]string, 0, 6)
	args := make([]any, 0, 7)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.Name != nil {
		add("name", *input.Name)
	}
	if input.Phase != nil {
		add("phase", *input.Phase)
	}
	if input.Status != nil {
		add("status", *input.Status)
	}
	if input.StartDate != nil {
		add("start_date", *input.StartDate)
	}
	if input.EndDate != nil {
		add("end_date", *input.EndDate)
		add("days_remaining", calculateDaysRemaining(input.EndDate))
	}
	if len(sets) == 0 {
		return r.GetEpochByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	query := fmt.Sprintf(`UPDATE epochs SET %s WHERE id = $%d RETURNING id, project_id, name, phase, status, start_date, end_date, days_remaining, created_at, updated_at`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanEpoch(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrEpochNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteEpoch(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM epochs WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrEpochNotFound
	}
	return nil
}

func (r *Repository) CreateGoal(ctx context.Context, input CreateGoalInput) (*Goal, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO goals (epoch_id, title, description, status, progress_percent, owner_user_id)
		VALUES ($1,$2,$3,$4,$5,$6)
		RETURNING id, epoch_id, title, description, status, progress_percent, owner_user_id, created_at, updated_at
	`, input.EpochID, input.Title, input.Description, input.Status, input.ProgressPercent, input.OwnerUserID)
	return scanGoal(row)
}

func (r *Repository) ListGoals(ctx context.Context, filter GoalFilter) ([]Goal, error) {
	query := `SELECT id, epoch_id, title, description, status, progress_percent, owner_user_id, created_at, updated_at FROM goals`
	conditions := make([]string, 0, 3)
	args := make([]any, 0, 3)
	index := 1
	if filter.EpochID != nil {
		conditions = append(conditions, fmt.Sprintf("epoch_id = $%d", index))
		args = append(args, *filter.EpochID)
		index++
	}
	if filter.Status != "" {
		conditions = append(conditions, fmt.Sprintf("status = $%d", index))
		args = append(args, filter.Status)
		index++
	}
	if filter.OwnerUserID != nil {
		conditions = append(conditions, fmt.Sprintf("owner_user_id = $%d", index))
		args = append(args, *filter.OwnerUserID)
	}
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += " ORDER BY id ASC"
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list goals: %w", err)
	}
	defer rows.Close()
	out := make([]Goal, 0)
	for rows.Next() {
		item, err := scanGoal(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetGoalByID(ctx context.Context, id int) (*Goal, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, epoch_id, title, description, status, progress_percent, owner_user_id, created_at, updated_at FROM goals WHERE id = $1`, id)
	item, err := scanGoal(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrGoalNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateGoal(ctx context.Context, id int, input UpdateGoalInput) (*Goal, error) {
	sets := make([]string, 0, 6)
	args := make([]any, 0, 7)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.Title != nil {
		add("title", *input.Title)
	}
	if input.Description != nil {
		add("description", *input.Description)
	}
	if input.Status != nil {
		add("status", *input.Status)
	}
	if input.ProgressPercent != nil {
		add("progress_percent", *input.ProgressPercent)
	}
	if input.OwnerUserID != nil {
		add("owner_user_id", *input.OwnerUserID)
	}
	if len(sets) == 0 {
		return r.GetGoalByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	query := fmt.Sprintf(`UPDATE goals SET %s WHERE id = $%d RETURNING id, epoch_id, title, description, status, progress_percent, owner_user_id, created_at, updated_at`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanGoal(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrGoalNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteGoal(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM goals WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrGoalNotFound
	}
	return nil
}

func scanEpoch(row pgx.Row) (*Epoch, error) {
	var item Epoch
	err := row.Scan(&item.ID, &item.ProjectID, &item.Name, &item.Phase, &item.Status, &item.StartDate, &item.EndDate, &item.DaysRemaining, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanGoal(row pgx.Row) (*Goal, error) {
	var item Goal
	err := row.Scan(&item.ID, &item.EpochID, &item.Title, &item.Description, &item.Status, &item.ProgressPercent, &item.OwnerUserID, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func calculateDaysRemaining(endDate *time.Time) *int {
	if endDate == nil {
		return nil
	}
	days := int(time.Until(endDate.Truncate(24*time.Hour)).Hours() / 24)
	if days < 0 {
		days = 0
	}
	return &days
}
