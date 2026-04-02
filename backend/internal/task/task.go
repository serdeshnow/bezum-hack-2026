package task

import "time"

type Task struct {
	ID             int        `json:"id"`
	ProjectID      int        `json:"projectId"`
	EpochID        *int       `json:"epochId,omitempty"`
	Key            string     `json:"key"`
	Title          string     `json:"title"`
	Description    string     `json:"description"`
	Status         string     `json:"status"`
	Priority       string     `json:"priority"`
	AssigneeUserID *int       `json:"assigneeUserId,omitempty"`
	ReporterUserID *int       `json:"reporterUserId,omitempty"`
	DueDate        *time.Time `json:"dueDate,omitempty"`
	CreatedDate    *time.Time `json:"createdDate,omitempty"`
	ReleaseID      *int       `json:"releaseId,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

type Tag struct {
	ID        int       `json:"id"`
	TaskID    int       `json:"taskId"`
	Value     string    `json:"value"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Comment struct {
	ID           int       `json:"id"`
	TaskID       int       `json:"taskId"`
	AuthorUserID int       `json:"authorUserId"`
	Content      string    `json:"content"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Filter struct {
	ProjectID      *int
	EpochID        *int
	AssigneeUserID *int
	Status         string
	Priority       string
	ReleaseID      *int
	Query          string
}

type CreateInput struct {
	ProjectID      int
	EpochID        *int
	Key            string
	Title          string
	Description    string
	Status         string
	Priority       string
	AssigneeUserID *int
	ReporterUserID *int
	DueDate        *time.Time
	CreatedDate    *time.Time
	ReleaseID      *int
}

type UpdateInput struct {
	EpochID        *int
	Key            *string
	Title          *string
	Description    *string
	Status         *string
	Priority       *string
	AssigneeUserID *int
	ReporterUserID *int
	DueDate        *time.Time
	CreatedDate    *time.Time
	ReleaseID      *int
}

type CreateTagInput struct {
	TaskID int
	Value  string
}

type UpdateTagInput struct {
	Value *string
}

type CommentFilter struct {
	TaskID       int
	AuthorUserID *int
}

type CreateCommentInput struct {
	TaskID       int
	AuthorUserID int
	Content      string
}

type UpdateCommentInput struct {
	Content *string
}
