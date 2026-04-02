package project

import "time"

type Project struct {
	ID              int        `json:"id"`
	Key             string     `json:"key"`
	Name            string     `json:"name"`
	Description     *string    `json:"description,omitempty"`
	Status          string     `json:"status"`
	VisibilityMode  string     `json:"visibilityMode"`
	OwnerUserID     *int       `json:"ownerUserId,omitempty"`
	ActiveEpochID   *int       `json:"activeEpochId,omitempty"`
	DueDate         *time.Time `json:"dueDate,omitempty"`
	StartedAt       *time.Time `json:"startedAt,omitempty"`
	CompletedAt     *time.Time `json:"completedAt,omitempty"`
	ProgressPercent int        `json:"progressPercent"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

type Member struct {
	ID        int       `json:"id"`
	ProjectID int       `json:"projectId"`
	UserID    int       `json:"userId"`
	Role      string    `json:"role"`
	JoinedAt  time.Time `json:"joinedAt"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type ProjectFilter struct {
	Status         string
	VisibilityMode string
	OwnerUserID    *int
	Query          string
}

type CreateProjectInput struct {
	Key             string
	Name            string
	Description     *string
	Status          string
	VisibilityMode  string
	OwnerUserID     *int
	ActiveEpochID   *int
	DueDate         *time.Time
	StartedAt       *time.Time
	CompletedAt     *time.Time
	ProgressPercent int
}

type UpdateProjectInput struct {
	Key             *string
	Name            *string
	Description     *string
	Status          *string
	VisibilityMode  *string
	OwnerUserID     *int
	ActiveEpochID   *int
	DueDate         *time.Time
	StartedAt       *time.Time
	CompletedAt     *time.Time
	ProgressPercent *int
}

type MemberFilter struct {
	ProjectID int
	UserID    *int
}

type CreateMemberInput struct {
	ProjectID int
	UserID    int
	Role      string
}

type UpdateMemberInput struct {
	ProjectID *int
	UserID    *int
	Role      *string
}
