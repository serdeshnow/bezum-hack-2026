package planning

import "time"

type Epoch struct {
	ID            int        `json:"id"`
	ProjectID     int        `json:"projectId"`
	Name          string     `json:"name"`
	Phase         string     `json:"phase"`
	Status        string     `json:"status"`
	StartDate     *time.Time `json:"startDate,omitempty"`
	EndDate       *time.Time `json:"endDate,omitempty"`
	DaysRemaining *int       `json:"daysRemaining,omitempty"`
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}

type Goal struct {
	ID              int       `json:"id"`
	EpochID         int       `json:"epochId"`
	Title           string    `json:"title"`
	Description     *string   `json:"description,omitempty"`
	Status          string    `json:"status"`
	ProgressPercent int       `json:"progressPercent"`
	OwnerUserID     *int      `json:"ownerUserId,omitempty"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

type EpochFilter struct {
	ProjectID *int
	Status    string
}

type CreateEpochInput struct {
	ProjectID int
	Name      string
	Phase     string
	Status    string
	StartDate *time.Time
	EndDate   *time.Time
}

type UpdateEpochInput struct {
	Name      *string
	Phase     *string
	Status    *string
	StartDate *time.Time
	EndDate   *time.Time
}

type GoalFilter struct {
	EpochID     *int
	Status      string
	OwnerUserID *int
}

type CreateGoalInput struct {
	EpochID         int
	Title           string
	Description     *string
	Status          string
	ProgressPercent int
	OwnerUserID     *int
}

type UpdateGoalInput struct {
	Title           *string
	Description     *string
	Status          *string
	ProgressPercent *int
	OwnerUserID     *int
}
