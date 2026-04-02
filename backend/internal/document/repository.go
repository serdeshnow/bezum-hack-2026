package document

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
	ErrFolderNotFound   = errors.New("document folder not found")
	ErrDocumentNotFound = errors.New("document not found")
	ErrOwnerNotFound    = errors.New("document owner not found")
	ErrApproverNotFound = errors.New("document approver not found")
	ErrVersionNotFound  = errors.New("document version not found")
	ErrApprovalNotFound = errors.New("document approval not found")
	ErrCommentNotFound  = errors.New("document comment not found")
	ErrLinkNotFound     = errors.New("document link not found")
	ErrDocumentConflict = errors.New("document conflict")
)

type FolderFilter struct{ ProjectID *int }
type DocumentFilter struct {
	ProjectID        *int
	FolderID         *int
	Status           string
	AccessScope      string
	AuthorUserID     *int
	AwaitingApproval *bool
	Archived         *bool
}
type VersionFilter struct {
	DocumentID   int
	Status       string
	AuthorUserID *int
}
type ApprovalFilter struct {
	VersionID      int
	ApproverUserID *int
	Status         string
}
type CommentFilter struct {
	DocumentID   int
	Resolved     *bool
	AuthorUserID *int
}
type LinkFilter struct {
	DocumentID int
	EntityType string
	EntityID   *int
}

type CreateFolderInput struct {
	ProjectID      int
	ParentFolderID *int
	Name           string
	SortOrder      int
}
type UpdateFolderInput struct {
	ParentFolderID *int
	Name           *string
	SortOrder      *int
}
type CreateDocumentInput struct {
	ProjectID        int
	FolderID         *int
	Title            string
	Description      *string
	Status           string
	AccessScope      string
	AuthorUserID     int
	CurrentVersionID *int
	AwaitingApproval bool
	IsStarred        bool
	ArchivedAt       *time.Time
}
type UpdateDocumentInput struct {
	FolderID         *int
	Title            *string
	Description      *string
	Status           *string
	AccessScope      *string
	CurrentVersionID *int
	AwaitingApproval *bool
	IsStarred        *bool
	ArchivedAt       *time.Time
}
type CreateOwnerInput struct{ DocumentID, UserID int }
type UpdateOwnerInput struct{ UserID *int }
type CreateApproverInput struct {
	DocumentID int
	UserID     int
	Approved   bool
	DecisionAt *time.Time
}
type UpdateApproverInput struct {
	UserID     *int
	Approved   *bool
	DecisionAt *time.Time
}
type CreateVersionInput struct {
	DocumentID      int
	VersionLabel    string
	ContentMarkdown string
	ChangeSource    string
	SourceDetail    *string
	AuthorUserID    *int
	Additions       int
	Deletions       int
	Modifications   int
	Status          string
}
type UpdateVersionInput struct {
	VersionLabel    *string
	ContentMarkdown *string
	ChangeSource    *string
	SourceDetail    *string
	Additions       *int
	Deletions       *int
	Modifications   *int
	Status          *string
}
type CreateApprovalInput struct {
	DocumentVersionID int
	ApproverUserID    int
	Status            string
	Decision          *string
	Rationale         *string
	DecidedAt         *time.Time
}
type UpdateApprovalInput struct {
	Status    *string
	Decision  *string
	Rationale *string
	DecidedAt *time.Time
}
type CreateCommentInput struct {
	DocumentID   int
	AuthorUserID int
	Content      string
	Resolved     bool
}
type UpdateCommentInput struct {
	Content  *string
	Resolved *bool
}
type CreateLinkInput struct {
	DocumentID int
	EntityType string
	EntityID   int
}
type UpdateLinkInput struct {
	EntityType *string
	EntityID   *int
}

type Repository struct{ pool *pgxpool.Pool }

func NewRepository(pool *pgxpool.Pool) *Repository { return &Repository{pool: pool} }

func (r *Repository) CreateFolder(ctx context.Context, in CreateFolderInput) (*Folder, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO document_folders (project_id, parent_folder_id, name, sort_order) VALUES ($1,$2,$3,$4) RETURNING id, project_id, parent_folder_id, name, sort_order, created_at, updated_at`,
		in.ProjectID, in.ParentFolderID, in.Name, in.SortOrder)
	return scanFolder(row)
}

func (r *Repository) ListFolders(ctx context.Context, filter FolderFilter) ([]Folder, error) {
	query := `SELECT id, project_id, parent_folder_id, name, sort_order, created_at, updated_at FROM document_folders`
	args := make([]any, 0, 1)
	if filter.ProjectID != nil {
		query += ` WHERE project_id = $1`
		args = append(args, *filter.ProjectID)
	}
	query += ` ORDER BY sort_order ASC, id ASC`
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Folder, 0)
	for rows.Next() {
		item, err := scanFolder(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetFolderByID(ctx context.Context, id int) (*Folder, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, project_id, parent_folder_id, name, sort_order, created_at, updated_at FROM document_folders WHERE id = $1`, id)
	item, err := scanFolder(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrFolderNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateFolder(ctx context.Context, id int, in UpdateFolderInput) (*Folder, error) {
	sets, args, index := make([]string, 0, 4), make([]any, 0, 5), 1
	add := func(col string, val any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", col, index))
		args = append(args, val)
		index++
	}
	if in.ParentFolderID != nil {
		add("parent_folder_id", *in.ParentFolderID)
	}
	if in.Name != nil {
		add("name", *in.Name)
	}
	if in.SortOrder != nil {
		add("sort_order", *in.SortOrder)
	}
	if len(sets) == 0 {
		return r.GetFolderByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	row := r.pool.QueryRow(ctx, fmt.Sprintf(`UPDATE document_folders SET %s WHERE id = $%d RETURNING id, project_id, parent_folder_id, name, sort_order, created_at, updated_at`, strings.Join(sets, ", "), index), args...)
	item, err := scanFolder(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrFolderNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteFolder(ctx context.Context, id int) error {
	return deleteByID(ctx, r.pool, "document_folders", id, ErrFolderNotFound)
}

func (r *Repository) CreateDocument(ctx context.Context, in CreateDocumentInput) (*Document, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO documents (project_id, folder_id, title, description, status, access_scope, author_user_id, current_version_id, awaiting_approval, is_starred, archived_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id, project_id, folder_id, title, description, status, access_scope, author_user_id, current_version_id, awaiting_approval, is_starred, archived_at, created_at, updated_at`,
		in.ProjectID, in.FolderID, in.Title, in.Description, in.Status, in.AccessScope, in.AuthorUserID, in.CurrentVersionID, in.AwaitingApproval, in.IsStarred, in.ArchivedAt)
	item, err := scanDocument(row)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrDocumentConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) ListDocuments(ctx context.Context, filter DocumentFilter) ([]Document, error) {
	query := `SELECT id, project_id, folder_id, title, description, status, access_scope, author_user_id, current_version_id, awaiting_approval, is_starred, archived_at, created_at, updated_at FROM documents`
	conds, args, index := make([]string, 0, 7), make([]any, 0, 7), 1
	add := func(expr string, val any) {
		conds = append(conds, fmt.Sprintf(expr, index))
		args = append(args, val)
		index++
	}
	if filter.ProjectID != nil {
		add("project_id = $%d", *filter.ProjectID)
	}
	if filter.FolderID != nil {
		add("folder_id = $%d", *filter.FolderID)
	}
	if filter.Status != "" {
		add("status = $%d", filter.Status)
	}
	if filter.AccessScope != "" {
		add("access_scope = $%d", filter.AccessScope)
	}
	if filter.AuthorUserID != nil {
		add("author_user_id = $%d", *filter.AuthorUserID)
	}
	if filter.AwaitingApproval != nil {
		add("awaiting_approval = $%d", *filter.AwaitingApproval)
	}
	if filter.Archived != nil {
		if *filter.Archived {
			conds = append(conds, "archived_at IS NOT NULL")
		} else {
			conds = append(conds, "archived_at IS NULL")
		}
	}
	if len(conds) > 0 {
		query += " WHERE " + strings.Join(conds, " AND ")
	}
	query += " ORDER BY id ASC"
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Document, 0)
	for rows.Next() {
		item, err := scanDocument(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetDocumentByID(ctx context.Context, id int) (*Document, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, project_id, folder_id, title, description, status, access_scope, author_user_id, current_version_id, awaiting_approval, is_starred, archived_at, created_at, updated_at FROM documents WHERE id = $1`, id)
	item, err := scanDocument(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrDocumentNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateDocument(ctx context.Context, id int, in UpdateDocumentInput) (*Document, error) {
	sets, args, index := make([]string, 0, 9), make([]any, 0, 10), 1
	add := func(col string, val any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", col, index))
		args = append(args, val)
		index++
	}
	if in.FolderID != nil {
		add("folder_id", *in.FolderID)
	}
	if in.Title != nil {
		add("title", *in.Title)
	}
	if in.Description != nil {
		add("description", *in.Description)
	}
	if in.Status != nil {
		add("status", *in.Status)
	}
	if in.AccessScope != nil {
		add("access_scope", *in.AccessScope)
	}
	if in.CurrentVersionID != nil {
		add("current_version_id", *in.CurrentVersionID)
	}
	if in.AwaitingApproval != nil {
		add("awaiting_approval", *in.AwaitingApproval)
	}
	if in.IsStarred != nil {
		add("is_starred", *in.IsStarred)
	}
	if in.ArchivedAt != nil {
		add("archived_at", *in.ArchivedAt)
	}
	if len(sets) == 0 {
		return r.GetDocumentByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	row := r.pool.QueryRow(ctx, fmt.Sprintf(`UPDATE documents SET %s WHERE id = $%d RETURNING id, project_id, folder_id, title, description, status, access_scope, author_user_id, current_version_id, awaiting_approval, is_starred, archived_at, created_at, updated_at`, strings.Join(sets, ", "), index), args...)
	item, err := scanDocument(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrDocumentNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteDocument(ctx context.Context, id int) error {
	return deleteByID(ctx, r.pool, "documents", id, ErrDocumentNotFound)
}

func (r *Repository) CreateOwner(ctx context.Context, in CreateOwnerInput) (*Owner, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO document_owners (document_id, user_id) VALUES ($1,$2) RETURNING id, document_id, user_id, created_at, updated_at`, in.DocumentID, in.UserID)
	item, err := scanOwner(row)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrDocumentConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) ListOwners(ctx context.Context, documentID int) ([]Owner, error) {
	rows, err := r.pool.Query(ctx, `SELECT id, document_id, user_id, created_at, updated_at FROM document_owners WHERE document_id = $1 ORDER BY id ASC`, documentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Owner, 0)
	for rows.Next() {
		item, err := scanOwner(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetOwnerByID(ctx context.Context, id int) (*Owner, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, document_id, user_id, created_at, updated_at FROM document_owners WHERE id = $1`, id)
	item, err := scanOwner(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrOwnerNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateOwner(ctx context.Context, id int, in UpdateOwnerInput) (*Owner, error) {
	if in.UserID == nil {
		return r.GetOwnerByID(ctx, id)
	}
	row := r.pool.QueryRow(ctx, `UPDATE document_owners SET user_id = $1, updated_at = $2 WHERE id = $3 RETURNING id, document_id, user_id, created_at, updated_at`, *in.UserID, time.Now(), id)
	item, err := scanOwner(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrOwnerNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrDocumentConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteOwner(ctx context.Context, id int) error {
	return deleteByID(ctx, r.pool, "document_owners", id, ErrOwnerNotFound)
}

func (r *Repository) CreateApprover(ctx context.Context, in CreateApproverInput) (*Approver, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO document_approvers (document_id, user_id, approved, decision_at) VALUES ($1,$2,$3,$4) RETURNING id, document_id, user_id, approved, decision_at, created_at, updated_at`, in.DocumentID, in.UserID, in.Approved, in.DecisionAt)
	item, err := scanApprover(row)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrDocumentConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) ListApprovers(ctx context.Context, documentID int) ([]Approver, error) {
	rows, err := r.pool.Query(ctx, `SELECT id, document_id, user_id, approved, decision_at, created_at, updated_at FROM document_approvers WHERE document_id = $1 ORDER BY id ASC`, documentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Approver, 0)
	for rows.Next() {
		item, err := scanApprover(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetApproverByID(ctx context.Context, id int) (*Approver, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, document_id, user_id, approved, decision_at, created_at, updated_at FROM document_approvers WHERE id = $1`, id)
	item, err := scanApprover(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrApproverNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateApprover(ctx context.Context, id int, in UpdateApproverInput) (*Approver, error) {
	sets, args, index := make([]string, 0, 4), make([]any, 0, 5), 1
	add := func(col string, val any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", col, index))
		args = append(args, val)
		index++
	}
	if in.UserID != nil {
		add("user_id", *in.UserID)
	}
	if in.Approved != nil {
		add("approved", *in.Approved)
	}
	if in.DecisionAt != nil {
		add("decision_at", *in.DecisionAt)
	}
	if len(sets) == 0 {
		return r.GetApproverByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	row := r.pool.QueryRow(ctx, fmt.Sprintf(`UPDATE document_approvers SET %s WHERE id = $%d RETURNING id, document_id, user_id, approved, decision_at, created_at, updated_at`, strings.Join(sets, ", "), index), args...)
	item, err := scanApprover(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrApproverNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrDocumentConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteApprover(ctx context.Context, id int) error {
	return deleteByID(ctx, r.pool, "document_approvers", id, ErrApproverNotFound)
}

func (r *Repository) CreateVersion(ctx context.Context, in CreateVersionInput) (*Version, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO document_versions (document_id, version_label, content_markdown, change_source, source_detail, author_user_id, additions, deletions, modifications, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, document_id, version_label, content_markdown, change_source, source_detail, author_user_id, additions, deletions, modifications, status, created_at, updated_at`,
		in.DocumentID, in.VersionLabel, in.ContentMarkdown, in.ChangeSource, in.SourceDetail, in.AuthorUserID, in.Additions, in.Deletions, in.Modifications, in.Status)
	item, err := scanVersion(row)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrDocumentConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) ListVersions(ctx context.Context, filter VersionFilter) ([]Version, error) {
	query := `SELECT id, document_id, version_label, content_markdown, change_source, source_detail, author_user_id, additions, deletions, modifications, status, created_at, updated_at FROM document_versions WHERE document_id = $1`
	args := []any{filter.DocumentID}
	idx := 2
	if filter.Status != "" {
		query += fmt.Sprintf(" AND status = $%d", idx)
		args = append(args, filter.Status)
		idx++
	}
	if filter.AuthorUserID != nil {
		query += fmt.Sprintf(" AND author_user_id = $%d", idx)
		args = append(args, *filter.AuthorUserID)
	}
	query += ` ORDER BY id DESC`
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Version, 0)
	for rows.Next() {
		item, err := scanVersion(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetVersionByID(ctx context.Context, id int) (*Version, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, document_id, version_label, content_markdown, change_source, source_detail, author_user_id, additions, deletions, modifications, status, created_at, updated_at FROM document_versions WHERE id = $1`, id)
	item, err := scanVersion(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrVersionNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateVersion(ctx context.Context, id int, in UpdateVersionInput) (*Version, error) {
	sets, args, index := make([]string, 0, 8), make([]any, 0, 9), 1
	add := func(col string, val any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", col, index))
		args = append(args, val)
		index++
	}
	if in.VersionLabel != nil {
		add("version_label", *in.VersionLabel)
	}
	if in.ContentMarkdown != nil {
		add("content_markdown", *in.ContentMarkdown)
	}
	if in.ChangeSource != nil {
		add("change_source", *in.ChangeSource)
	}
	if in.SourceDetail != nil {
		add("source_detail", *in.SourceDetail)
	}
	if in.Additions != nil {
		add("additions", *in.Additions)
	}
	if in.Deletions != nil {
		add("deletions", *in.Deletions)
	}
	if in.Modifications != nil {
		add("modifications", *in.Modifications)
	}
	if in.Status != nil {
		add("status", *in.Status)
	}
	if len(sets) == 0 {
		return r.GetVersionByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	row := r.pool.QueryRow(ctx, fmt.Sprintf(`UPDATE document_versions SET %s WHERE id = $%d RETURNING id, document_id, version_label, content_markdown, change_source, source_detail, author_user_id, additions, deletions, modifications, status, created_at, updated_at`, strings.Join(sets, ", "), index), args...)
	item, err := scanVersion(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrVersionNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrDocumentConflict
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteVersion(ctx context.Context, id int) error {
	return deleteByID(ctx, r.pool, "document_versions", id, ErrVersionNotFound)
}

func (r *Repository) CreateApproval(ctx context.Context, in CreateApprovalInput) (*Approval, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	row := tx.QueryRow(ctx, `INSERT INTO document_approvals (document_version_id, approver_user_id, status, decision, rationale, decided_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, document_version_id, approver_user_id, status, decision, rationale, decided_at, created_at, updated_at`,
		in.DocumentVersionID, in.ApproverUserID, in.Status, in.Decision, in.Rationale, in.DecidedAt)
	item, err := scanApproval(row)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrDocumentConflict
		}
		return nil, err
	}

	if err := insertDecisionLog(ctx, tx, in.DocumentVersionID, in.ApproverUserID, stringValue(in.Decision, in.Status), in.Rationale, in.DecidedAt); err != nil {
		return nil, err
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return item, nil
}

func (r *Repository) ListApprovals(ctx context.Context, filter ApprovalFilter) ([]Approval, error) {
	query := `SELECT id, document_version_id, approver_user_id, status, decision, rationale, decided_at, created_at, updated_at FROM document_approvals WHERE document_version_id = $1`
	args := []any{filter.VersionID}
	idx := 2
	if filter.ApproverUserID != nil {
		query += fmt.Sprintf(" AND approver_user_id = $%d", idx)
		args = append(args, *filter.ApproverUserID)
		idx++
	}
	if filter.Status != "" {
		query += fmt.Sprintf(" AND status = $%d", idx)
		args = append(args, filter.Status)
	}
	query += ` ORDER BY id ASC`
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Approval, 0)
	for rows.Next() {
		item, err := scanApproval(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetApprovalByID(ctx context.Context, id int) (*Approval, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, document_version_id, approver_user_id, status, decision, rationale, decided_at, created_at, updated_at FROM document_approvals WHERE id = $1`, id)
	item, err := scanApproval(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrApprovalNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateApproval(ctx context.Context, id int, in UpdateApprovalInput) (*Approval, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	current, err := r.getApprovalByIDTx(ctx, tx, id)
	if err != nil {
		return nil, err
	}

	sets, args, index := make([]string, 0, 5), make([]any, 0, 6), 1
	add := func(col string, val any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", col, index))
		args = append(args, val)
		index++
	}
	if in.Status != nil {
		add("status", *in.Status)
		current.Status = *in.Status
	}
	if in.Decision != nil {
		add("decision", *in.Decision)
		current.Decision = in.Decision
	}
	if in.Rationale != nil {
		add("rationale", *in.Rationale)
		current.Rationale = in.Rationale
	}
	if in.DecidedAt != nil {
		add("decided_at", *in.DecidedAt)
		current.DecidedAt = in.DecidedAt
	}
	if len(sets) == 0 {
		return current, nil
	}
	add("updated_at", time.Now())
	args = append(args, id)
	row := tx.QueryRow(ctx, fmt.Sprintf(`UPDATE document_approvals SET %s WHERE id = $%d RETURNING id, document_version_id, approver_user_id, status, decision, rationale, decided_at, created_at, updated_at`, strings.Join(sets, ", "), index), args...)
	item, err := scanApproval(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrApprovalNotFound
		}
		return nil, err
	}
	if err := insertDecisionLog(ctx, tx, item.DocumentVersionID, item.ApproverUserID, stringValue(item.Decision, item.Status), item.Rationale, item.DecidedAt); err != nil {
		return nil, err
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteApproval(ctx context.Context, id int) error {
	return deleteByID(ctx, r.pool, "document_approvals", id, ErrApprovalNotFound)
}

func (r *Repository) CreateComment(ctx context.Context, in CreateCommentInput) (*Comment, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO document_comments (document_id, author_user_id, content, resolved) VALUES ($1,$2,$3,$4) RETURNING id, document_id, author_user_id, content, resolved, created_at, updated_at`, in.DocumentID, in.AuthorUserID, in.Content, in.Resolved)
	return scanComment(row)
}

func (r *Repository) ListComments(ctx context.Context, filter CommentFilter) ([]Comment, error) {
	query := `SELECT id, document_id, author_user_id, content, resolved, created_at, updated_at FROM document_comments WHERE document_id = $1`
	args := []any{filter.DocumentID}
	idx := 2
	if filter.Resolved != nil {
		query += fmt.Sprintf(" AND resolved = $%d", idx)
		args = append(args, *filter.Resolved)
		idx++
	}
	if filter.AuthorUserID != nil {
		query += fmt.Sprintf(" AND author_user_id = $%d", idx)
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
	row := r.pool.QueryRow(ctx, `SELECT id, document_id, author_user_id, content, resolved, created_at, updated_at FROM document_comments WHERE id = $1`, id)
	item, err := scanComment(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrCommentNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateComment(ctx context.Context, id int, in UpdateCommentInput) (*Comment, error) {
	sets, args, index := make([]string, 0, 3), make([]any, 0, 4), 1
	add := func(col string, val any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", col, index))
		args = append(args, val)
		index++
	}
	if in.Content != nil {
		add("content", *in.Content)
	}
	if in.Resolved != nil {
		add("resolved", *in.Resolved)
	}
	if len(sets) == 0 {
		return r.GetCommentByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	row := r.pool.QueryRow(ctx, fmt.Sprintf(`UPDATE document_comments SET %s WHERE id = $%d RETURNING id, document_id, author_user_id, content, resolved, created_at, updated_at`, strings.Join(sets, ", "), index), args...)
	item, err := scanComment(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrCommentNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteComment(ctx context.Context, id int) error {
	return deleteByID(ctx, r.pool, "document_comments", id, ErrCommentNotFound)
}

func (r *Repository) CreateLink(ctx context.Context, in CreateLinkInput) (*Link, error) {
	row := r.pool.QueryRow(ctx, `INSERT INTO document_links (document_id, entity_type, entity_id) VALUES ($1,$2,$3) RETURNING id, document_id, entity_type, entity_id, created_at, updated_at`, in.DocumentID, in.EntityType, in.EntityID)
	return scanLink(row)
}

func (r *Repository) ListLinks(ctx context.Context, filter LinkFilter) ([]Link, error) {
	query := `SELECT id, document_id, entity_type, entity_id, created_at, updated_at FROM document_links WHERE document_id = $1`
	args := []any{filter.DocumentID}
	idx := 2
	if filter.EntityType != "" {
		query += fmt.Sprintf(" AND entity_type = $%d", idx)
		args = append(args, filter.EntityType)
		idx++
	}
	if filter.EntityID != nil {
		query += fmt.Sprintf(" AND entity_id = $%d", idx)
		args = append(args, *filter.EntityID)
	}
	query += ` ORDER BY id ASC`
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Link, 0)
	for rows.Next() {
		item, err := scanLink(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *item)
	}
	return out, rows.Err()
}

func (r *Repository) GetLinkByID(ctx context.Context, id int) (*Link, error) {
	row := r.pool.QueryRow(ctx, `SELECT id, document_id, entity_type, entity_id, created_at, updated_at FROM document_links WHERE id = $1`, id)
	item, err := scanLink(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrLinkNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) UpdateLink(ctx context.Context, id int, in UpdateLinkInput) (*Link, error) {
	sets, args, index := make([]string, 0, 3), make([]any, 0, 4), 1
	add := func(col string, val any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", col, index))
		args = append(args, val)
		index++
	}
	if in.EntityType != nil {
		add("entity_type", *in.EntityType)
	}
	if in.EntityID != nil {
		add("entity_id", *in.EntityID)
	}
	if len(sets) == 0 {
		return r.GetLinkByID(ctx, id)
	}
	add("updated_at", time.Now())
	args = append(args, id)
	row := r.pool.QueryRow(ctx, fmt.Sprintf(`UPDATE document_links SET %s WHERE id = $%d RETURNING id, document_id, entity_type, entity_id, created_at, updated_at`, strings.Join(sets, ", "), index), args...)
	item, err := scanLink(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrLinkNotFound
		}
		return nil, err
	}
	return item, nil
}

func (r *Repository) DeleteLink(ctx context.Context, id int) error {
	return deleteByID(ctx, r.pool, "document_links", id, ErrLinkNotFound)
}

func (r *Repository) getApprovalByIDTx(ctx context.Context, tx pgx.Tx, id int) (*Approval, error) {
	row := tx.QueryRow(ctx, `SELECT id, document_version_id, approver_user_id, status, decision, rationale, decided_at, created_at, updated_at FROM document_approvals WHERE id = $1`, id)
	item, err := scanApproval(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrApprovalNotFound
		}
		return nil, err
	}
	return item, nil
}

func insertDecisionLog(ctx context.Context, tx pgx.Tx, versionID, approverUserID int, decision string, rationale *string, decidedAt *time.Time) error {
	_, err := tx.Exec(ctx, `INSERT INTO document_decision_logs (document_version_id, approver_user_id, decision, rationale, "timestamp") VALUES ($1,$2,$3,$4,$5)`, versionID, approverUserID, decision, rationale, timeValue(decidedAt))
	return err
}

func timeValue(v *time.Time) time.Time {
	if v != nil {
		return *v
	}
	return time.Now()
}

func stringValue(v *string, fallback string) string {
	if v != nil && *v != "" {
		return *v
	}
	return fallback
}

func deleteByID(ctx context.Context, pool *pgxpool.Pool, table string, id int, notFound error) error {
	tag, err := pool.Exec(ctx, fmt.Sprintf("DELETE FROM %s WHERE id = $1", table), id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return notFound
	}
	return nil
}

func scanFolder(row pgx.Row) (*Folder, error) {
	var item Folder
	err := row.Scan(&item.ID, &item.ProjectID, &item.ParentFolderID, &item.Name, &item.SortOrder, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanDocument(row pgx.Row) (*Document, error) {
	var item Document
	err := row.Scan(&item.ID, &item.ProjectID, &item.FolderID, &item.Title, &item.Description, &item.Status, &item.AccessScope, &item.AuthorUserID, &item.CurrentVersionID, &item.AwaitingApproval, &item.IsStarred, &item.ArchivedAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanOwner(row pgx.Row) (*Owner, error) {
	var item Owner
	err := row.Scan(&item.ID, &item.DocumentID, &item.UserID, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanApprover(row pgx.Row) (*Approver, error) {
	var item Approver
	err := row.Scan(&item.ID, &item.DocumentID, &item.UserID, &item.Approved, &item.DecisionAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanVersion(row pgx.Row) (*Version, error) {
	var item Version
	err := row.Scan(&item.ID, &item.DocumentID, &item.VersionLabel, &item.ContentMarkdown, &item.ChangeSource, &item.SourceDetail, &item.AuthorUserID, &item.Additions, &item.Deletions, &item.Modifications, &item.Status, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanApproval(row pgx.Row) (*Approval, error) {
	var item Approval
	err := row.Scan(&item.ID, &item.DocumentVersionID, &item.ApproverUserID, &item.Status, &item.Decision, &item.Rationale, &item.DecidedAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanComment(row pgx.Row) (*Comment, error) {
	var item Comment
	err := row.Scan(&item.ID, &item.DocumentID, &item.AuthorUserID, &item.Content, &item.Resolved, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func scanLink(row pgx.Row) (*Link, error) {
	var item Link
	err := row.Scan(&item.ID, &item.DocumentID, &item.EntityType, &item.EntityID, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
