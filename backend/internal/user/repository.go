package user

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
	ErrUserNotFound      = errors.New("user not found")
	ErrDuplicateEmail    = errors.New("user with this email already exists")
	ErrPreferencesAbsent = errors.New("user preferences not found")
)

type Reader interface {
	GetByID(ctx context.Context, id int) (*User, error)
}

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) Create(ctx context.Context, input CreateUserInput) (*User, error) {
	query := `
		INSERT INTO users (
			email, first_name, last_name, display_name, avatar_url, role, is_active, password_hash, last_login_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, email, first_name, last_name, display_name, avatar_url, role, is_active, password_hash, last_login_at, created_at, updated_at
	`

	row := r.pool.QueryRow(
		ctx,
		query,
		input.Email,
		input.FirstName,
		input.LastName,
		input.DisplayName,
		input.AvatarURL,
		input.Role,
		input.IsActive,
		input.PasswordHash,
		input.LastLoginAt,
	)

	user, err := scanUser(row)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrDuplicateEmail
		}
		return nil, fmt.Errorf("create user: %w", err)
	}

	return user, nil
}

func (r *Repository) List(ctx context.Context, filter UserFilter) ([]User, error) {
	args := make([]any, 0, 3)
	conditions := make([]string, 0, 3)
	index := 1

	if filter.Role != "" {
		conditions = append(conditions, fmt.Sprintf("role = $%d", index))
		args = append(args, filter.Role)
		index++
	}
	if filter.IsActive != nil {
		conditions = append(conditions, fmt.Sprintf("is_active = $%d", index))
		args = append(args, *filter.IsActive)
		index++
	}
	if filter.Query != "" {
		conditions = append(conditions, fmt.Sprintf("(email ILIKE $%d OR first_name ILIKE $%d OR last_name ILIKE $%d OR COALESCE(display_name, '') ILIKE $%d)", index, index, index, index))
		args = append(args, "%"+filter.Query+"%")
		index++
	}

	baseQuery := `
		SELECT id, email, first_name, last_name, display_name, avatar_url, role, is_active, password_hash, last_login_at, created_at, updated_at
		FROM users
	`
	if len(conditions) > 0 {
		baseQuery += " WHERE " + strings.Join(conditions, " AND ")
	}
	baseQuery += " ORDER BY id ASC"

	rows, err := r.pool.Query(ctx, baseQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("list users: %w", err)
	}
	defer rows.Close()

	users := make([]User, 0)
	for rows.Next() {
		item, err := scanUser(rows)
		if err != nil {
			return nil, fmt.Errorf("scan user row: %w", err)
		}
		users = append(users, *item)
	}

	if rows.Err() != nil {
		return nil, fmt.Errorf("iterate user rows: %w", rows.Err())
	}

	return users, nil
}

func (r *Repository) GetByID(ctx context.Context, id int) (*User, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT id, email, first_name, last_name, display_name, avatar_url, role, is_active, password_hash, last_login_at, created_at, updated_at
		FROM users
		WHERE id = $1
	`, id)

	user, err := scanUser(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("get user by id: %w", err)
	}

	return user, nil
}

func (r *Repository) GetByEmail(ctx context.Context, email string) (*User, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT id, email, first_name, last_name, display_name, avatar_url, role, is_active, password_hash, last_login_at, created_at, updated_at
		FROM users
		WHERE email = $1
	`, email)

	user, err := scanUser(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("get user by email: %w", err)
	}

	return user, nil
}

func (r *Repository) Update(ctx context.Context, id int, input UpdateUserInput) (*User, error) {
	sets := make([]string, 0, 8)
	args := make([]any, 0, 9)
	index := 1

	appendSet := func(column string, value any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", column, index))
		args = append(args, value)
		index++
	}

	if input.Email != nil {
		appendSet("email", *input.Email)
	}
	if input.FirstName != nil {
		appendSet("first_name", *input.FirstName)
	}
	if input.LastName != nil {
		appendSet("last_name", *input.LastName)
	}
	if input.DisplayName != nil {
		appendSet("display_name", *input.DisplayName)
	}
	if input.AvatarURL != nil {
		appendSet("avatar_url", *input.AvatarURL)
	}
	if input.Role != nil {
		appendSet("role", *input.Role)
	}
	if input.IsActive != nil {
		appendSet("is_active", *input.IsActive)
	}
	if input.PasswordHash != nil {
		appendSet("password_hash", *input.PasswordHash)
	}
	if input.LastLoginAt != nil {
		appendSet("last_login_at", *input.LastLoginAt)
	}

	if len(sets) == 0 {
		return r.GetByID(ctx, id)
	}

	sets = append(sets, fmt.Sprintf("updated_at = $%d", index))
	args = append(args, time.Now())
	index++
	args = append(args, id)

	query := fmt.Sprintf(`
		UPDATE users
		SET %s
		WHERE id = $%d
		RETURNING id, email, first_name, last_name, display_name, avatar_url, role, is_active, password_hash, last_login_at, created_at, updated_at
	`, strings.Join(sets, ", "), index)

	row := r.pool.QueryRow(ctx, query, args...)
	user, err := scanUser(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrDuplicateEmail
		}
		return nil, fmt.Errorf("update user: %w", err)
	}

	return user, nil
}

func (r *Repository) Delete(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM users WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete user: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrUserNotFound
	}

	return nil
}

func (r *Repository) UpsertPreferences(ctx context.Context, input PreferencesUpsertInput) (*Preferences, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO user_preferences (
			user_id, theme, compact_mode, email_notifications, task_assignments_enabled, meeting_reminders_enabled,
			release_notifications_enabled, mention_notifications_enabled
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (user_id) DO UPDATE SET
			theme = EXCLUDED.theme,
			compact_mode = EXCLUDED.compact_mode,
			email_notifications = EXCLUDED.email_notifications,
			task_assignments_enabled = EXCLUDED.task_assignments_enabled,
			meeting_reminders_enabled = EXCLUDED.meeting_reminders_enabled,
			release_notifications_enabled = EXCLUDED.release_notifications_enabled,
			mention_notifications_enabled = EXCLUDED.mention_notifications_enabled,
			updated_at = now()
		RETURNING id, user_id, theme, compact_mode, email_notifications, task_assignments_enabled, meeting_reminders_enabled, release_notifications_enabled, mention_notifications_enabled, created_at, updated_at
	`,
		input.UserID,
		input.Theme,
		input.CompactMode,
		input.EmailNotifications,
		input.TaskAssignmentsEnabled,
		input.MeetingRemindersEnabled,
		input.ReleaseNotificationsEnabled,
		input.MentionNotificationsEnabled,
	)

	prefs, err := scanPreferences(row)
	if err != nil {
		return nil, fmt.Errorf("upsert user preferences: %w", err)
	}

	return prefs, nil
}

func (r *Repository) GetPreferences(ctx context.Context, userID int) (*Preferences, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT id, user_id, theme, compact_mode, email_notifications, task_assignments_enabled, meeting_reminders_enabled, release_notifications_enabled, mention_notifications_enabled, created_at, updated_at
		FROM user_preferences
		WHERE user_id = $1
	`, userID)

	prefs, err := scanPreferences(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPreferencesAbsent
		}
		return nil, fmt.Errorf("get user preferences: %w", err)
	}

	return prefs, nil
}

func scanUser(row pgx.Row) (*User, error) {
	var user User
	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.FirstName,
		&user.LastName,
		&user.DisplayName,
		&user.AvatarURL,
		&user.Role,
		&user.IsActive,
		&user.PasswordHash,
		&user.LastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func scanPreferences(row pgx.Row) (*Preferences, error) {
	var prefs Preferences
	err := row.Scan(
		&prefs.ID,
		&prefs.UserID,
		&prefs.Theme,
		&prefs.CompactMode,
		&prefs.EmailNotifications,
		&prefs.TaskAssignmentsEnabled,
		&prefs.MeetingRemindersEnabled,
		&prefs.ReleaseNotificationsEnabled,
		&prefs.MentionNotificationsEnabled,
		&prefs.CreatedAt,
		&prefs.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &prefs, nil
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505"
	}

	return false
}
