package communication

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
	ErrNotificationNotFound = errors.New("notification not found")
	ErrActivityFeedNotFound = errors.New("activity feed not found")
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository { return &Repository{pool: pool} }

func (r *Repository) CreateNotification(ctx context.Context, input CreateNotificationInput) (*Notification, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO notifications (user_id, actor_user_id, type, title, description, entity_type, entity_id, channel, read_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, user_id, actor_user_id, type, title, description, entity_type, entity_id, channel, read_at, created_at, updated_at`,
		input.UserID, input.ActorUserID, input.Type, input.Title, input.Description, input.EntityType, input.EntityID, input.Channel, input.ReadAt)
	return scanNotification(row)
}

func (r *Repository) ListNotifications(ctx context.Context, filter NotificationFilter) ([]Notification, error) {
	query := `SELECT id, user_id, actor_user_id, type, title, description, entity_type, entity_id, channel, read_at, created_at, updated_at FROM notifications`
	conditions := make([]string, 0, 4)
	args := make([]any, 0, 4)
	index := 1
	add := func(expr string, value any) {
		conditions = append(conditions, fmt.Sprintf(expr, index))
		args = append(args, value)
		index++
	}
	if filter.UserID != nil {
		add("user_id = $%d", *filter.UserID)
	}
	if filter.ActorUserID != nil {
		add("actor_user_id = $%d", *filter.ActorUserID)
	}
	if filter.EntityType != "" {
		add("entity_type = $%d", filter.EntityType)
	}
	if filter.UnreadOnly != nil && *filter.UnreadOnly {
		conditions = append(conditions, "read_at IS NULL")
	}
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += " ORDER BY created_at DESC, id DESC"
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Notification, 0)
	for rows.Next() {
		item, err := scanNotification(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetNotificationByID(ctx context.Context, id int) (*Notification, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, user_id, actor_user_id, type, title, description, entity_type, entity_id, channel, read_at, created_at, updated_at FROM notifications WHERE id = $1`, id)
	item, err := scanNotification(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotificationNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateNotification(ctx context.Context, id int, input UpdateNotificationInput) (*Notification, error) {
	sets := make([]string, 0, 8)
	args := make([]any, 0, 9)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.ActorUserID != nil {
		add("actor_user_id", *input.ActorUserID)
	}
	if input.Type != nil {
		add("type", *input.Type)
	}
	if input.Title != nil {
		add("title", *input.Title)
	}
	if input.Description != nil {
		add("description", *input.Description)
	}
	if input.EntityType != nil {
		add("entity_type", *input.EntityType)
	}
	if input.EntityID != nil {
		add("entity_id", *input.EntityID)
	}
	if input.Channel != nil {
		add("channel", *input.Channel)
	}
	if input.ReadAt != nil {
		add("read_at", *input.ReadAt)
	}
	if len(sets) == 0 {
		return r.GetNotificationByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	query := fmt.Sprintf(`UPDATE notifications SET %s WHERE id = $%d RETURNING id, user_id, actor_user_id, type, title, description, entity_type, entity_id, channel, read_at, created_at, updated_at`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanNotification(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotificationNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteNotification(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM notifications WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotificationNotFound
	}
	return nil
}

func (r *Repository) CreateActivityFeed(ctx context.Context, input CreateActivityFeedInput) (*ActivityFeed, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO activity_feed (project_id, actor_user_id, type, action, title, metadata_json) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, project_id, actor_user_id, type, action, title, metadata_json, created_at, updated_at`,
		input.ProjectID, input.ActorUserID, input.Type, input.Action, input.Title, input.MetadataJSON)
	return scanActivityFeed(row)
}

func (r *Repository) ListActivityFeed(ctx context.Context, filter ActivityFeedFilter) ([]ActivityFeed, error) {
	query := `SELECT id, project_id, actor_user_id, type, action, title, metadata_json, created_at, updated_at FROM activity_feed`
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
	if filter.ActorUserID != nil {
		add("actor_user_id = $%d", *filter.ActorUserID)
	}
	if filter.Type != "" {
		add("type = $%d", filter.Type)
	}
	if filter.Action != "" {
		add("action = $%d", filter.Action)
	}
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += " ORDER BY created_at DESC, id DESC"
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]ActivityFeed, 0)
	for rows.Next() {
		item, err := scanActivityFeed(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetActivityFeedByID(ctx context.Context, id int) (*ActivityFeed, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, project_id, actor_user_id, type, action, title, metadata_json, created_at, updated_at FROM activity_feed WHERE id = $1`, id)
	item, err := scanActivityFeed(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrActivityFeedNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateActivityFeed(ctx context.Context, id int, input UpdateActivityFeedInput) (*ActivityFeed, error) {
	sets := make([]string, 0, 6)
	args := make([]any, 0, 7)
	index := 1
	add := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}
	if input.ActorUserID != nil {
		add("actor_user_id", *input.ActorUserID)
	}
	if input.Type != nil {
		add("type", *input.Type)
	}
	if input.Action != nil {
		add("action", *input.Action)
	}
	if input.Title != nil {
		add("title", *input.Title)
	}
	if input.MetadataJSON != nil {
		add("metadata_json", input.MetadataJSON)
	}
	if len(sets) == 0 {
		return r.GetActivityFeedByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	query := fmt.Sprintf(`UPDATE activity_feed SET %s WHERE id = $%d RETURNING id, project_id, actor_user_id, type, action, title, metadata_json, created_at, updated_at`, strings.Join(sets, ", "), index)
	row := r.pool.QueryRow(ctx, query, args...)
	item, err := scanActivityFeed(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrActivityFeedNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteActivityFeed(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM activity_feed WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrActivityFeedNotFound
	}
	return nil
}

func scanNotification(row pgx.Row) (*Notification, error) {
	var item Notification
	err := row.Scan(&item.ID, &item.UserID, &item.ActorUserID, &item.Type, &item.Title, &item.Description, &item.EntityType, &item.EntityID, &item.Channel, &item.ReadAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanActivityFeed(row pgx.Row) (*ActivityFeed, error) {
	var item ActivityFeed
	err := row.Scan(&item.ID, &item.ProjectID, &item.ActorUserID, &item.Type, &item.Action, &item.Title, &item.MetadataJSON, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}
