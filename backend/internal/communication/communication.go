package communication

import "time"

type Notification struct {
	ID          int        `json:"id"`
	UserID      int        `json:"userId"`
	ActorUserID *int       `json:"actorUserId,omitempty"`
	Type        string     `json:"type"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	EntityType  *string    `json:"entityType,omitempty"`
	EntityID    *int       `json:"entityId,omitempty"`
	Channel     *string    `json:"channel,omitempty"`
	ReadAt      *time.Time `json:"readAt,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

type ActivityFeed struct {
	ID           int       `json:"id"`
	ProjectID    int       `json:"projectId"`
	ActorUserID  *int      `json:"actorUserId,omitempty"`
	Type         string    `json:"type"`
	Action       string    `json:"action"`
	Title        string    `json:"title"`
	MetadataJSON []byte    `json:"metadataJson,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type NotificationFilter struct {
	UserID      *int
	ActorUserID *int
	EntityType  string
	UnreadOnly  *bool
}

type ActivityFeedFilter struct {
	ProjectID   *int
	ActorUserID *int
	Type        string
	Action      string
}

type CreateNotificationInput struct {
	UserID      int
	ActorUserID *int
	Type        string
	Title       string
	Description string
	EntityType  *string
	EntityID    *int
	Channel     *string
	ReadAt      *time.Time
}

type UpdateNotificationInput struct {
	ActorUserID *int
	Type        *string
	Title       *string
	Description *string
	EntityType  *string
	EntityID    *int
	Channel     *string
	ReadAt      *time.Time
}

type CreateActivityFeedInput struct {
	ProjectID    int
	ActorUserID  *int
	Type         string
	Action       string
	Title        string
	MetadataJSON []byte
}

type UpdateActivityFeedInput struct {
	ActorUserID  *int
	Type         *string
	Action       *string
	Title        *string
	MetadataJSON []byte
}
