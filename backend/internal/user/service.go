package user

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/serdeshnow/bezum-hack-2026/backend/internal/config"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
	jwtmanager "github.com/serdeshnow/bezum-hack-2026/backend/internal/jwt"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrForbidden          = errors.New("forbidden")
)

type User struct {
	ID           int        `json:"id"`
	Email        string     `json:"email"`
	FirstName    string     `json:"firstName"`
	LastName     string     `json:"lastName"`
	DisplayName  *string    `json:"displayName,omitempty"`
	AvatarURL    *string    `json:"avatarUrl,omitempty"`
	Role         string     `json:"role"`
	IsActive     bool       `json:"isActive"`
	PasswordHash *string    `json:"passwordHash,omitempty"`
	LastLoginAt  *time.Time `json:"lastLoginAt,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
}

type Preferences struct {
	ID                          int       `json:"id"`
	UserID                      int       `json:"userId"`
	Theme                       string    `json:"theme"`
	CompactMode                 bool      `json:"compactMode"`
	EmailNotifications          bool      `json:"emailNotifications"`
	TaskAssignmentsEnabled      bool      `json:"taskAssignmentsEnabled"`
	MeetingRemindersEnabled     bool      `json:"meetingRemindersEnabled"`
	ReleaseNotificationsEnabled bool      `json:"releaseNotificationsEnabled"`
	MentionNotificationsEnabled bool      `json:"mentionNotificationsEnabled"`
	CreatedAt                   time.Time `json:"createdAt"`
	UpdatedAt                   time.Time `json:"updatedAt"`
}

type Session struct {
	ID        string    `json:"id"`
	UserID    int       `json:"userId"`
	Role      string    `json:"role"`
	ExpiresAt time.Time `json:"expiresAt"`
}

type CreateUserInput struct {
	Email        string
	FirstName    string
	LastName     string
	DisplayName  *string
	AvatarURL    *string
	Role         string
	IsActive     bool
	PasswordHash *string
	LastLoginAt  *time.Time
}

type UpdateUserInput struct {
	Email        *string
	FirstName    *string
	LastName     *string
	DisplayName  *string
	AvatarURL    *string
	Role         *string
	IsActive     *bool
	PasswordHash *string
	LastLoginAt  *time.Time
}

type UserFilter struct {
	Role     string
	IsActive *bool
	Query    string
}

type PreferencesUpsertInput struct {
	UserID                      int
	Theme                       string
	CompactMode                 bool
	EmailNotifications          bool
	TaskAssignmentsEnabled      bool
	MeetingRemindersEnabled     bool
	ReleaseNotificationsEnabled bool
	MentionNotificationsEnabled bool
}

type LoginResult struct {
	AccessToken string    `json:"accessToken"`
	SessionID   string    `json:"sessionId"`
	ExpiresAt   time.Time `json:"expiresAt"`
	User        *User     `json:"user"`
}

type Service struct {
	repo       *Repository
	sessions   SessionRepository
	jwtManager *jwtmanager.Manager
	jwtConfig  config.JWTConfig
	logger     *logger.Logger
}

func NewService(
	repo *Repository,
	sessions SessionRepository,
	jwtManager *jwtmanager.Manager,
	jwtConfig config.JWTConfig,
	log *logger.Logger,
) *Service {
	return &Service{
		repo:       repo,
		sessions:   sessions,
		jwtManager: jwtManager,
		jwtConfig:  jwtConfig,
		logger:     log,
	}
}

func (s *Service) Create(ctx context.Context, input CreateUserInput) (*User, error) {
	if err := validateEmail(input.Email); err != nil {
		return nil, err
	}
	if err := validateRole(input.Role); err != nil {
		return nil, err
	}
	if strings.TrimSpace(input.FirstName) == "" || strings.TrimSpace(input.LastName) == "" {
		return nil, errors.New("first_name and last_name are required")
	}

	if input.DisplayName == nil {
		displayName := strings.TrimSpace(input.FirstName + " " + input.LastName)
		input.DisplayName = &displayName
	}

	user, err := s.repo.Create(ctx, input)
	if err != nil {
		return nil, err
	}

	_, err = s.repo.UpsertPreferences(ctx, PreferencesUpsertInput{
		UserID:                      user.ID,
		Theme:                       "system",
		CompactMode:                 false,
		EmailNotifications:          true,
		TaskAssignmentsEnabled:      true,
		MeetingRemindersEnabled:     true,
		ReleaseNotificationsEnabled: true,
		MentionNotificationsEnabled: true,
	})
	if err != nil {
		s.logger.Error().Err(err).Int("user_id", user.ID).Msg("failed to create default preferences")
		return nil, err
	}

	return user, nil
}

func (s *Service) List(ctx context.Context, filter UserFilter) ([]User, error) {
	if filter.Role != "" {
		if err := validateRole(filter.Role); err != nil {
			return nil, err
		}
	}

	return s.repo.List(ctx, filter)
}

func (s *Service) GetByID(ctx context.Context, id int) (*User, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) Update(ctx context.Context, id int, input UpdateUserInput) (*User, error) {
	if input.Email != nil {
		if err := validateEmail(*input.Email); err != nil {
			return nil, err
		}
	}
	if input.Role != nil {
		if err := validateRole(*input.Role); err != nil {
			return nil, err
		}
	}

	return s.repo.Update(ctx, id, input)
}

func (s *Service) Delete(ctx context.Context, id int) error {
	return s.repo.Delete(ctx, id)
}

func (s *Service) GetPreferences(ctx context.Context, userID int) (*Preferences, error) {
	if _, err := s.repo.GetByID(ctx, userID); err != nil {
		return nil, err
	}

	return s.repo.GetPreferences(ctx, userID)
}

func (s *Service) ReplacePreferences(ctx context.Context, input PreferencesUpsertInput) (*Preferences, error) {
	if _, err := s.repo.GetByID(ctx, input.UserID); err != nil {
		return nil, err
	}
	if err := validateTheme(input.Theme); err != nil {
		return nil, err
	}

	return s.repo.UpsertPreferences(ctx, input)
}

func (s *Service) PatchPreferences(ctx context.Context, userID int, patch UpdatePreferencesInput) (*Preferences, error) {
	current, err := s.GetPreferences(ctx, userID)
	if err != nil {
		return nil, err
	}
	if patch.Theme != nil {
		if err := validateTheme(*patch.Theme); err != nil {
			return nil, err
		}
		current.Theme = *patch.Theme
	}
	if patch.CompactMode != nil {
		current.CompactMode = *patch.CompactMode
	}
	if patch.EmailNotifications != nil {
		current.EmailNotifications = *patch.EmailNotifications
	}
	if patch.TaskAssignmentsEnabled != nil {
		current.TaskAssignmentsEnabled = *patch.TaskAssignmentsEnabled
	}
	if patch.MeetingRemindersEnabled != nil {
		current.MeetingRemindersEnabled = *patch.MeetingRemindersEnabled
	}
	if patch.ReleaseNotificationsEnabled != nil {
		current.ReleaseNotificationsEnabled = *patch.ReleaseNotificationsEnabled
	}
	if patch.MentionNotificationsEnabled != nil {
		current.MentionNotificationsEnabled = *patch.MentionNotificationsEnabled
	}

	return s.repo.UpsertPreferences(ctx, PreferencesUpsertInput{
		UserID:                      userID,
		Theme:                       current.Theme,
		CompactMode:                 current.CompactMode,
		EmailNotifications:          current.EmailNotifications,
		TaskAssignmentsEnabled:      current.TaskAssignmentsEnabled,
		MeetingRemindersEnabled:     current.MeetingRemindersEnabled,
		ReleaseNotificationsEnabled: current.ReleaseNotificationsEnabled,
		MentionNotificationsEnabled: current.MentionNotificationsEnabled,
	})
}

func (s *Service) Login(ctx context.Context, email, password string) (*LoginResult, error) {
	if err := validateEmail(email); err != nil {
		return nil, err
	}
	if strings.TrimSpace(password) == "" {
		return nil, errors.New("password is required")
	}

	authUser, err := s.repo.GetByEmail(ctx, strings.TrimSpace(email))
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}
	if !authUser.IsActive {
		return nil, ErrForbidden
	}
	if authUser.PasswordHash == nil || strings.TrimSpace(*authUser.PasswordHash) == "" {
		return nil, ErrInvalidCredentials
	}
	if err := bcrypt.CompareHashAndPassword([]byte(*authUser.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	now := time.Now()
	authUser.LastLoginAt = &now
	if _, err := s.repo.Update(ctx, authUser.ID, UpdateUserInput{
		LastLoginAt: &now,
	}); err != nil {
		s.logger.Error().Err(err).Int("user_id", authUser.ID).Msg("failed to update last login")
	}

	sessionID := uuid.NewString()
	accessToken, expiresAt, err := s.jwtManager.IssueToken(authUser.ID, authUser.Role, sessionID)
	if err != nil {
		return nil, err
	}

	if err := s.sessions.Save(ctx, Session{
		ID:        sessionID,
		UserID:    authUser.ID,
		Role:      authUser.Role,
		ExpiresAt: expiresAt,
	}, s.jwtConfig.SessionExpiration); err != nil {
		return nil, err
	}

	return &LoginResult{
		AccessToken: accessToken,
		SessionID:   sessionID,
		ExpiresAt:   expiresAt,
		User:        authUser,
	}, nil
}

func (s *Service) Logout(ctx context.Context, sessionID string) error {
	if strings.TrimSpace(sessionID) == "" {
		return errors.New("session id is required")
	}

	err := s.sessions.Delete(ctx, sessionID)
	if err != nil && !errors.Is(err, ErrSessionNotFound) {
		return err
	}

	return nil
}

type UpdatePreferencesInput struct {
	Theme                       *string
	CompactMode                 *bool
	EmailNotifications          *bool
	TaskAssignmentsEnabled      *bool
	MeetingRemindersEnabled     *bool
	ReleaseNotificationsEnabled *bool
	MentionNotificationsEnabled *bool
}

func validateEmail(email string) error {
	if _, err := mail.ParseAddress(strings.TrimSpace(email)); err != nil {
		return fmt.Errorf("invalid email: %w", err)
	}

	return nil
}

func validateRole(role string) error {
	switch role {
	case "customer", "developer", "manager", "admin":
		return nil
	default:
		return fmt.Errorf("invalid role: %s", role)
	}
}

func validateTheme(theme string) error {
	switch theme {
	case "light", "dark", "system":
		return nil
	default:
		return fmt.Errorf("invalid theme: %s", theme)
	}
}
