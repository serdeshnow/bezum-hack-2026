package task

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
	ErrTaskNotFound        = errors.New("task not found")
	ErrTaskTagNotFound     = errors.New("task tag not found")
	ErrTaskCommentNotFound = errors.New("task comment not found")
	ErrTaskConflict        = errors.New("task conflict")
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository { return &Repository{pool: pool} }

func (r *Repository) Create(ctx context.Context, input CreateInput) (*Task, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO tasks (
			project_id, epoch_id, key, title, description, status, priority, assignee_user_id,
			reporter_user_id, due_date, created_date, release_id
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
		RETURNING id, project_id, epoch_id, key, title, description, status, priority, assignee_user_id, reporter_user_id, due_date, created_date, release_id, created_at, updated_at
	`,
		input.ProjectID, input.EpochID, input.Key, input.Title, input.Description, input.Status, input.Priority,
		input.AssigneeUserID, input.ReporterUserID, input.DueDate, input.CreatedDate, input.ReleaseID,
	)
	item, err := scanTask(row)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrTaskConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) List(ctx context.Context, filter Filter) ([]Task, error) {
	query := `SELECT id, project_id, epoch_id, key, title, description, status, priority, assignee_user_id, reporter_user_id, due_date, created_date, release_id, created_at, updated_at FROM tasks`
	conditions := make([]string, 0, 7)
	args := make([]any, 0, 7)
	index := 1
	add := func(expr string, value any) {
		conditions = append(conditions, fmt.Sprintf(expr, index))
		args = append(args, value)
		index++
	}
	if filter.ProjectID != nil {
		add("project_id = $%d", *filter.ProjectID)
	}
	if filter.EpochID != nil {
		add("epoch_id = $%d", *filter.EpochID)
	}
	if filter.AssigneeUserID != nil {
		add("assignee_user_id = $%d", *filter.AssigneeUserID)
	}
	if filter.Status != "" {
		add("status = $%d", filter.Status)
	}
	if filter.Priority != "" {
		add("priority = $%d", filter.Priority)
	}
	if filter.ReleaseID != nil {
		add("release_id = $%d", *filter.ReleaseID)
	}
	if filter.Query != "" {
		conditions = append(conditions, fmt.Sprintf("(key ILIKE $%d OR title ILIKE $%d OR description ILIKE $%d)", index, index, index))
		args = append(args, "%"+filter.Query+"%")
		index++
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
	out := make([]Task, 0)
	for rows.Next() {
		item, err := scanTask(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetByID(ctx context.Context, id int) (*Task, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, project_id, epoch_id, key, title, description, status, priority, assignee_user_id, reporter_user_id, due_date, created_date, release_id, created_at, updated_at FROM tasks WHERE id = $1`, id)
	item, err := scanTask(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTaskNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) GetByProjectAndKey(ctx context.Context, projectID int, key string) (*Task, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, project_id, epoch_id, key, title, description, status, priority, assignee_user_id, reporter_user_id, due_date, created_date, release_id, created_at, updated_at FROM tasks WHERE project_id = $1 AND key = $2`, projectID, key)
	item, err := scanTask(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTaskNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateStatus(ctx context.Context, id int, status string) (*Task, error) {
	row := r.pool.QueryRow(ctx, `UPDATE tasks SET status = $1, updated_at = $2 WHERE id = $3 RETURNING id, project_id, epoch_id, key, title, description, status, priority, assignee_user_id, reporter_user_id, due_date, created_date, release_id, created_at, updated_at`, status, time.Now(), id)
	item, err := scanTask(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTaskNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrTaskConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) Update(ctx context.Context, id int, input UpdateInput) (*Task, error) {
	sets := make([]string, 0, 12)
	args := make([]any, 0, 13)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.EpochID != nil {
		add("epoch_id", *input.EpochID)
	}
	if input.Key != nil {
		add("key", *input.Key)
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
	if input.Priority != nil {
		add("priority", *input.Priority)
	}
	if input.AssigneeUserID != nil {
		add("assignee_user_id", *input.AssigneeUserID)
	}
	if input.ReporterUserID != nil {
		add("reporter_user_id", *input.ReporterUserID)
	}
	if input.DueDate != nil {
		add("due_date", *input.DueDate)
	}
	if input.CreatedDate != nil {
		add("created_date", *input.CreatedDate)
	}
	if input.ReleaseID != nil {
		add("release_id", *input.ReleaseID)
	}
	if len(sets) == 0 {
		return r.GetByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	query := fmt.Sprintf(`UPDATE tasks SET %s WHERE id = $%d RETURNING id, project_id, epoch_id, key, title, description, status, priority, assignee_user_id, reporter_user_id, due_date, created_date, release_id, created_at, updated_at`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanTask(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTaskNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrTaskConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) Delete(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM tasks WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrTaskNotFound
	}
	return nil
}

func (r *Repository) CreateTag(ctx context.Context, input CreateTagInput) (*Tag, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO task_tags (task_id, value) VALUES ($1,$2) RETURNING id, task_id, value, created_at, updated_at`, input.TaskID, input.Value)
	return scanTag(row)
}

func (r *Repository) ListTags(ctx context.Context, taskID int) ([]Tag, error) {
	rows, err := r.pool.Query(ctx, `SELECT id, task_id, value, created_at, updated_at FROM task_tags WHERE task_id = $1 ORDER BY id ASC`, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Tag, 0)
	for rows.Next() {
		item, err := scanTag(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetTagByID(ctx context.Context, id int) (*Tag, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, task_id, value, created_at, updated_at FROM task_tags WHERE id = $1`, id)
	item, err := scanTag(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTaskTagNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateTag(ctx context.Context, id int, input UpdateTagInput) (*Tag, error) {
	if input.Value == nil {
		return r.GetTagByID(ctx, id)
	}
	row := r.pool.QueryRow(ctx, `UPDATE task_tags SET value = $1, updated_at = $2 WHERE id = $3 RETURNING id, task_id, value, created_at, updated_at`, *input.Value, time.Now(), id)
	item, err := scanTag(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTaskTagNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteTag(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM task_tags WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrTaskTagNotFound
	}
	return nil
}

func (r *Repository) CreateComment(ctx context.Context, input CreateCommentInput) (*Comment, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO task_comments (task_id, author_user_id, content) VALUES ($1,$2,$3) RETURNING id, task_id, author_user_id, content, created_at, updated_at`, input.TaskID, input.AuthorUserID, input.Content)
	return scanComment(row)
}

func (r *Repository) ListComments(ctx context.Context, filter CommentFilter) ([]Comment, error) {
	query := `SELECT id, task_id, author_user_id, content, created_at, updated_at FROM task_comments WHERE task_id = $1`
	args := []any{filter.TaskID}
	if filter.AuthorUserID != nil {
		query += ` AND author_user_id = $2`
		args = append(args, *filter.AuthorUserID)
	}
	query += ` ORDER BY id ASC`
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Comment, 0)
	for rows.Next() {
		item, err := scanComment(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetCommentByID(ctx context.Context, id int) (*Comment, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, task_id, author_user_id, content, created_at, updated_at FROM task_comments WHERE id = $1`, id)
	item, err := scanComment(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTaskCommentNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateComment(ctx context.Context, id int, input UpdateCommentInput) (*Comment, error) {
	if input.Content == nil {
		return r.GetCommentByID(ctx, id)
	}
	row := r.pool.QueryRow(ctx, `UPDATE task_comments SET content = $1, updated_at = $2 WHERE id = $3 RETURNING id, task_id, author_user_id, content, created_at, updated_at`, *input.Content, time.Now(), id)
	item, err := scanComment(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTaskCommentNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteComment(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM task_comments WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrTaskCommentNotFound
	}
	return nil
}

func scanTask(row pgx.Row) (*Task, error) {
	var item Task
	err := row.Scan(&item.ID, &item.ProjectID, &item.EpochID, &item.Key, &item.Title, &item.Description, &item.Status, &item.Priority, &item.AssigneeUserID, &item.ReporterUserID, &item.DueDate, &item.CreatedDate, &item.ReleaseID, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanTag(row pgx.Row) (*Tag, error) {
	var item Tag
	err := row.Scan(&item.ID, &item.TaskID, &item.Value, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanComment(row pgx.Row) (*Comment, error) {
	var item Comment
	err := row.Scan(&item.ID, &item.TaskID, &item.AuthorUserID, &item.Content, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
