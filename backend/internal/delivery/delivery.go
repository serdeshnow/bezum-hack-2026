package delivery

import "time"

type Release struct {
	ID              int        `json:"id"`
	ProjectID       int        `json:"projectId"`
	Version         string     `json:"version"`
	Title           string     `json:"title"`
	Status          string     `json:"status"`
	TargetDate      *time.Time `json:"targetDate,omitempty"`
	DeployedAt      *time.Time `json:"deployedAt,omitempty"`
	CommitsCount    int        `json:"commitsCount"`
	AuthorUserID    int        `json:"authorUserId"`
	FeaturesCount   int        `json:"featuresCount"`
	FixesCount      int        `json:"fixesCount"`
	BreakingCount   int        `json:"breakingCount"`
	ProgressPercent int        `json:"progressPercent"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

type PullRequest struct {
	ID           int        `json:"id"`
	ProjectID    int        `json:"projectId"`
	ReleaseID    *int       `json:"releaseId,omitempty"`
	Number       int        `json:"number"`
	Title        string     `json:"title"`
	Branch       string     `json:"branch"`
	Status       string     `json:"status"`
	AuthorUserID int        `json:"authorUserId"`
	CommitsCount int        `json:"commitsCount"`
	Additions    int        `json:"additions"`
	Deletions    int        `json:"deletions"`
	ExternalURL  *string    `json:"externalUrl,omitempty"`
	MergedAt     *time.Time `json:"mergedAt,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
}

type GitHubPullRequest struct {
	ID                 int       `json:"id"`
	PullRequestID      int       `json:"pullRequestId"`
	TaskID             *int      `json:"taskId,omitempty"`
	GitHubNodeID       string    `json:"githubNodeId"`
	RepositoryFullName string    `json:"repositoryFullName"`
	HeadBranch         string    `json:"headBranch"`
	BaseBranch         string    `json:"baseBranch"`
	PayloadJSON        []byte    `json:"payloadJson,omitempty"`
	LastEvent          string    `json:"lastEvent"`
	SynchronizedAt     time.Time `json:"synchronizedAt"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

type ReleaseFilter struct {
	ProjectID    *int
	Status       string
	AuthorUserID *int
}

type PullRequestFilter struct {
	ProjectID    *int
	ReleaseID    *int
	Status       string
	AuthorUserID *int
}

type CreateReleaseInput struct {
	ProjectID       int
	Version         string
	Title           string
	Status          string
	TargetDate      *time.Time
	DeployedAt      *time.Time
	CommitsCount    int
	AuthorUserID    int
	FeaturesCount   int
	FixesCount      int
	BreakingCount   int
	ProgressPercent int
}

type UpdateReleaseInput struct {
	Version         *string
	Title           *string
	Status          *string
	TargetDate      *time.Time
	DeployedAt      *time.Time
	CommitsCount    *int
	AuthorUserID    *int
	FeaturesCount   *int
	FixesCount      *int
	BreakingCount   *int
	ProgressPercent *int
}

type CreatePullRequestInput struct {
	ProjectID    int
	ReleaseID    *int
	Number       int
	Title        string
	Branch       string
	Status       string
	AuthorUserID int
	CommitsCount int
	Additions    int
	Deletions    int
	ExternalURL  *string
	MergedAt     *time.Time
}

type UpdatePullRequestInput struct {
	ReleaseID    *int
	Number       *int
	Title        *string
	Branch       *string
	Status       *string
	AuthorUserID *int
	CommitsCount *int
	Additions    *int
	Deletions    *int
	ExternalURL  *string
	MergedAt     *time.Time
}
