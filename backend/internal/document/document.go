package document

import "time"

type Folder struct {
	ID             int       `json:"id"`
	ProjectID      int       `json:"projectId"`
	ParentFolderID *int      `json:"parentFolderId,omitempty"`
	Name           string    `json:"name"`
	SortOrder      int       `json:"sortOrder"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type Document struct {
	ID               int        `json:"id"`
	ProjectID        int        `json:"projectId"`
	FolderID         *int       `json:"folderId,omitempty"`
	Title            string     `json:"title"`
	Description      *string    `json:"description,omitempty"`
	Status           string     `json:"status"`
	AccessScope      string     `json:"accessScope"`
	AuthorUserID     int        `json:"authorUserId"`
	CurrentVersionID *int       `json:"currentVersionId,omitempty"`
	AwaitingApproval bool       `json:"awaitingApproval"`
	IsStarred        bool       `json:"isStarred"`
	ArchivedAt       *time.Time `json:"archivedAt,omitempty"`
	CreatedAt        time.Time  `json:"createdAt"`
	UpdatedAt        time.Time  `json:"updatedAt"`
}

type Owner struct {
	ID         int       `json:"id"`
	DocumentID int       `json:"documentId"`
	UserID     int       `json:"userId"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type Approver struct {
	ID         int        `json:"id"`
	DocumentID int        `json:"documentId"`
	UserID     int        `json:"userId"`
	Approved   bool       `json:"approved"`
	DecisionAt *time.Time `json:"decisionAt,omitempty"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  time.Time  `json:"updatedAt"`
}

type Version struct {
	ID              int       `json:"id"`
	DocumentID      int       `json:"documentId"`
	VersionLabel    string    `json:"versionLabel"`
	ContentMarkdown string    `json:"contentMarkdown"`
	ChangeSource    string    `json:"changeSource"`
	SourceDetail    *string   `json:"sourceDetail,omitempty"`
	AuthorUserID    *int      `json:"authorUserId,omitempty"`
	Additions       int       `json:"additions"`
	Deletions       int       `json:"deletions"`
	Modifications   int       `json:"modifications"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

type Approval struct {
	ID                int        `json:"id"`
	DocumentVersionID int        `json:"documentVersionId"`
	ApproverUserID    int        `json:"approverUserId"`
	Status            string     `json:"status"`
	Decision          *string    `json:"decision,omitempty"`
	Rationale         *string    `json:"rationale,omitempty"`
	DecidedAt         *time.Time `json:"decidedAt,omitempty"`
	CreatedAt         time.Time  `json:"createdAt"`
	UpdatedAt         time.Time  `json:"updatedAt"`
}

type Comment struct {
	ID           int       `json:"id"`
	DocumentID   int       `json:"documentId"`
	AuthorUserID int       `json:"authorUserId"`
	Content      string    `json:"content"`
	Resolved     bool      `json:"resolved"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Link struct {
	ID         int       `json:"id"`
	DocumentID int       `json:"documentId"`
	EntityType string    `json:"entityType"`
	EntityID   int       `json:"entityId"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}
