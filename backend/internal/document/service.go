package document

import (
	"context"
	"errors"
	"fmt"
	"path"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
	s3infra "github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/s3"
)

type Service struct {
	repo    *Repository
	storage *s3infra.Client
	logger  *logger.Logger
}

func NewService(repo *Repository, storage *s3infra.Client, log *logger.Logger) *Service {
	return &Service{repo: repo, storage: storage, logger: log}
}

func (s *Service) CreateFolder(ctx context.Context, in CreateFolderInput) (*Folder, error) {
	if in.ProjectID <= 0 || strings.TrimSpace(in.Name) == "" {
		return nil, fmt.Errorf("projectId and name are required")
	}
	return s.repo.CreateFolder(ctx, in)
}

func (s *Service) ListFolders(ctx context.Context, filter FolderFilter) ([]Folder, error) {
	return s.repo.ListFolders(ctx, filter)
}

func (s *Service) GetFolderByID(ctx context.Context, id int) (*Folder, error) {
	return s.repo.GetFolderByID(ctx, id)
}
func (s *Service) DeleteFolder(ctx context.Context, id int) error {
	return s.repo.DeleteFolder(ctx, id)
}

func (s *Service) UpdateFolder(ctx context.Context, id int, in UpdateFolderInput) (*Folder, error) {
	if in.Name != nil && strings.TrimSpace(*in.Name) == "" {
		return nil, fmt.Errorf("name is required")
	}
	return s.repo.UpdateFolder(ctx, id, in)
}

func (s *Service) CreateDocument(ctx context.Context, in CreateDocumentInput) (*Document, error) {
	if in.ProjectID <= 0 || strings.TrimSpace(in.Title) == "" || in.AuthorUserID <= 0 {
		return nil, fmt.Errorf("projectId, title and authorUserId are required")
	}
	if err := validateDocumentStatus(in.Status); err != nil {
		return nil, err
	}
	if err := validateAccessScope(in.AccessScope); err != nil {
		return nil, err
	}
	return s.repo.CreateDocument(ctx, in)
}

func (s *Service) ListDocuments(ctx context.Context, filter DocumentFilter) ([]Document, error) {
	if filter.Status != "" {
		if err := validateDocumentStatus(filter.Status); err != nil {
			return nil, err
		}
	}
	if filter.AccessScope != "" {
		if err := validateAccessScope(filter.AccessScope); err != nil {
			return nil, err
		}
	}
	return s.repo.ListDocuments(ctx, filter)
}

func (s *Service) GetDocumentByID(ctx context.Context, id int) (*Document, error) {
	return s.repo.GetDocumentByID(ctx, id)
}
func (s *Service) DeleteDocument(ctx context.Context, id int) error {
	return s.repo.DeleteDocument(ctx, id)
}

func (s *Service) UpdateDocument(ctx context.Context, id int, in UpdateDocumentInput) (*Document, error) {
	if in.Title != nil && strings.TrimSpace(*in.Title) == "" {
		return nil, fmt.Errorf("title is required")
	}
	if in.Status != nil {
		if err := validateDocumentStatus(*in.Status); err != nil {
			return nil, err
		}
	}
	if in.AccessScope != nil {
		if err := validateAccessScope(*in.AccessScope); err != nil {
			return nil, err
		}
	}
	return s.repo.UpdateDocument(ctx, id, in)
}

func (s *Service) CreateOwner(ctx context.Context, in CreateOwnerInput) (*Owner, error) {
	if in.DocumentID <= 0 || in.UserID <= 0 {
		return nil, fmt.Errorf("documentId and userId are required")
	}
	return s.repo.CreateOwner(ctx, in)
}

func (s *Service) ListOwners(ctx context.Context, documentID int) ([]Owner, error) {
	return s.repo.ListOwners(ctx, documentID)
}
func (s *Service) GetOwnerByID(ctx context.Context, id int) (*Owner, error) {
	return s.repo.GetOwnerByID(ctx, id)
}
func (s *Service) UpdateOwner(ctx context.Context, id int, in UpdateOwnerInput) (*Owner, error) {
	return s.repo.UpdateOwner(ctx, id, in)
}
func (s *Service) DeleteOwner(ctx context.Context, id int) error { return s.repo.DeleteOwner(ctx, id) }

func (s *Service) CreateApprover(ctx context.Context, in CreateApproverInput) (*Approver, error) {
	if in.DocumentID <= 0 || in.UserID <= 0 {
		return nil, fmt.Errorf("documentId and userId are required")
	}
	return s.repo.CreateApprover(ctx, in)
}

func (s *Service) ListApprovers(ctx context.Context, documentID int) ([]Approver, error) {
	return s.repo.ListApprovers(ctx, documentID)
}

func (s *Service) GetApproverByID(ctx context.Context, id int) (*Approver, error) {
	return s.repo.GetApproverByID(ctx, id)
}
func (s *Service) UpdateApprover(ctx context.Context, id int, in UpdateApproverInput) (*Approver, error) {
	return s.repo.UpdateApprover(ctx, id, in)
}
func (s *Service) DeleteApprover(ctx context.Context, id int) error {
	return s.repo.DeleteApprover(ctx, id)
}

func (s *Service) CreateVersion(ctx context.Context, in CreateVersionInput) (*Version, error) {
	if in.DocumentID <= 0 || strings.TrimSpace(in.VersionLabel) == "" || strings.TrimSpace(in.ContentMarkdown) == "" {
		return nil, fmt.Errorf("documentId, versionLabel and contentMarkdown are required")
	}
	if err := validateChangeSource(in.ChangeSource); err != nil {
		return nil, err
	}
	if err := validateVersionStatus(in.Status); err != nil {
		return nil, err
	}
	if in.Additions < 0 || in.Deletions < 0 || in.Modifications < 0 {
		return nil, fmt.Errorf("diff counters must be non-negative")
	}

	stats, err := s.buildCreateVersionDiffStats(ctx, in.DocumentID, in.ContentMarkdown)
	if err != nil {
		return nil, err
	}
	in.Additions = stats.Additions
	in.Deletions = stats.Deletions
	in.Modifications = stats.Modifications

	objectKey := path.Join("documents", fmt.Sprintf("%d", in.DocumentID), fmt.Sprintf("%s-%s.md", in.VersionLabel, uuid.NewString()))
	storedKey, err := s.storage.PutTextObject(ctx, objectKey, in.ContentMarkdown)
	if err != nil {
		s.logger.Error().Err(err).Int("document_id", in.DocumentID).Msg("failed to upload document version to storage")
		return nil, err
	}
	link, err := s.storage.PresignedGetURL(ctx, storedKey, 24*time.Hour)
	if err == nil {
		in.SourceDetail = &link
	} else {
		in.SourceDetail = &storedKey
	}

	version, err := s.repo.CreateVersion(ctx, in)
	if err != nil {
		return nil, err
	}
	_, err = s.repo.UpdateDocument(ctx, in.DocumentID, UpdateDocumentInput{CurrentVersionID: &version.ID})
	if err != nil {
		s.logger.Error().Err(err).Int("document_id", in.DocumentID).Int("version_id", version.ID).Msg("failed to set current document version")
	}
	return version, nil
}

func (s *Service) ListVersions(ctx context.Context, filter VersionFilter) ([]Version, error) {
	if filter.Status != "" {
		if err := validateVersionStatus(filter.Status); err != nil {
			return nil, err
		}
	}
	return s.repo.ListVersions(ctx, filter)
}

func (s *Service) GetVersionByID(ctx context.Context, id int) (*Version, error) {
	return s.repo.GetVersionByID(ctx, id)
}
func (s *Service) DeleteVersion(ctx context.Context, id int) error {
	return s.repo.DeleteVersion(ctx, id)
}

func (s *Service) UpdateVersion(ctx context.Context, id int, in UpdateVersionInput) (*Version, error) {
	if in.ChangeSource != nil {
		if err := validateChangeSource(*in.ChangeSource); err != nil {
			return nil, err
		}
	}
	if in.Status != nil {
		if err := validateVersionStatus(*in.Status); err != nil {
			return nil, err
		}
	}
	if (in.Additions != nil && *in.Additions < 0) || (in.Deletions != nil && *in.Deletions < 0) || (in.Modifications != nil && *in.Modifications < 0) {
		return nil, fmt.Errorf("diff counters must be non-negative")
	}
	if in.ContentMarkdown != nil {
		current, err := s.repo.GetVersionByID(ctx, id)
		if err != nil {
			return nil, err
		}

		stats := calculateDiffStats(current.ContentMarkdown, *in.ContentMarkdown)
		in.Additions = &stats.Additions
		in.Deletions = &stats.Deletions
		in.Modifications = &stats.Modifications

		objectKey := path.Join("documents", fmt.Sprintf("%d", current.DocumentID), fmt.Sprintf("%s-%s.md", current.VersionLabel, uuid.NewString()))
		storedKey, err := s.storage.PutTextObject(ctx, objectKey, *in.ContentMarkdown)
		if err != nil {
			return nil, err
		}
		link, err := s.storage.PresignedGetURL(ctx, storedKey, 24*time.Hour)
		if err == nil {
			in.SourceDetail = &link
		} else {
			in.SourceDetail = &storedKey
		}
	}
	return s.repo.UpdateVersion(ctx, id, in)
}

func (s *Service) buildCreateVersionDiffStats(ctx context.Context, documentID int, nextContent string) (DiffStats, error) {
	documentItem, err := s.repo.GetDocumentByID(ctx, documentID)
	if err != nil {
		return DiffStats{}, err
	}

	previousContent := ""
	if documentItem.CurrentVersionID != nil {
		currentVersion, err := s.repo.GetVersionByID(ctx, *documentItem.CurrentVersionID)
		if err != nil && !errors.Is(err, ErrVersionNotFound) {
			return DiffStats{}, err
		}
		if err == nil {
			previousContent = currentVersion.ContentMarkdown
		}
	} else {
		versions, err := s.repo.ListVersions(ctx, VersionFilter{DocumentID: documentID})
		if err != nil {
			return DiffStats{}, err
		}
		if len(versions) > 0 {
			previousContent = versions[0].ContentMarkdown
		}
	}

	return calculateDiffStats(previousContent, nextContent), nil
}

func (s *Service) CreateApproval(ctx context.Context, in CreateApprovalInput) (*Approval, error) {
	if in.DocumentVersionID <= 0 || in.ApproverUserID <= 0 {
		return nil, fmt.Errorf("documentVersionId and approverUserId are required")
	}
	if err := validateApprovalDecision(in.Status); err != nil {
		return nil, err
	}
	if in.Decision != nil {
		if err := validateApprovalDecision(*in.Decision); err != nil {
			return nil, err
		}
	}
	return s.repo.CreateApproval(ctx, in)
}

func (s *Service) ListApprovals(ctx context.Context, filter ApprovalFilter) ([]Approval, error) {
	if filter.Status != "" {
		if err := validateApprovalDecision(filter.Status); err != nil {
			return nil, err
		}
	}
	return s.repo.ListApprovals(ctx, filter)
}

func (s *Service) GetApprovalByID(ctx context.Context, id int) (*Approval, error) {
	return s.repo.GetApprovalByID(ctx, id)
}
func (s *Service) DeleteApproval(ctx context.Context, id int) error {
	return s.repo.DeleteApproval(ctx, id)
}

func (s *Service) UpdateApproval(ctx context.Context, id int, in UpdateApprovalInput) (*Approval, error) {
	if in.Status != nil {
		if err := validateApprovalDecision(*in.Status); err != nil {
			return nil, err
		}
	}
	if in.Decision != nil {
		if err := validateApprovalDecision(*in.Decision); err != nil {
			return nil, err
		}
	}
	return s.repo.UpdateApproval(ctx, id, in)
}

func (s *Service) CreateComment(ctx context.Context, in CreateCommentInput) (*Comment, error) {
	if in.DocumentID <= 0 || in.AuthorUserID <= 0 || strings.TrimSpace(in.Content) == "" {
		return nil, fmt.Errorf("documentId, authorUserId and content are required")
	}
	return s.repo.CreateComment(ctx, in)
}

func (s *Service) ListComments(ctx context.Context, filter CommentFilter) ([]Comment, error) {
	return s.repo.ListComments(ctx, filter)
}

func (s *Service) GetCommentByID(ctx context.Context, id int) (*Comment, error) {
	return s.repo.GetCommentByID(ctx, id)
}
func (s *Service) DeleteComment(ctx context.Context, id int) error {
	return s.repo.DeleteComment(ctx, id)
}

func (s *Service) UpdateComment(ctx context.Context, id int, in UpdateCommentInput) (*Comment, error) {
	if in.Content != nil && strings.TrimSpace(*in.Content) == "" {
		return nil, fmt.Errorf("content is required")
	}
	return s.repo.UpdateComment(ctx, id, in)
}

func (s *Service) CreateLink(ctx context.Context, in CreateLinkInput) (*Link, error) {
	if in.DocumentID <= 0 || in.EntityID <= 0 {
		return nil, fmt.Errorf("documentId and entityId are required")
	}
	if err := validateLinkType(in.EntityType); err != nil {
		return nil, err
	}
	return s.repo.CreateLink(ctx, in)
}

func (s *Service) ListLinks(ctx context.Context, filter LinkFilter) ([]Link, error) {
	if filter.EntityType != "" {
		if err := validateLinkType(filter.EntityType); err != nil {
			return nil, err
		}
	}
	return s.repo.ListLinks(ctx, filter)
}

func (s *Service) GetLinkByID(ctx context.Context, id int) (*Link, error) {
	return s.repo.GetLinkByID(ctx, id)
}
func (s *Service) DeleteLink(ctx context.Context, id int) error { return s.repo.DeleteLink(ctx, id) }

func (s *Service) UpdateLink(ctx context.Context, id int, in UpdateLinkInput) (*Link, error) {
	if in.EntityType != nil {
		if err := validateLinkType(*in.EntityType); err != nil {
			return nil, err
		}
	}
	return s.repo.UpdateLink(ctx, id, in)
}

func validateDocumentStatus(v string) error {
	switch v {
	case "draft", "in-review", "approved", "obsolete", "rejected":
		return nil
	default:
		return fmt.Errorf("invalid document status: %s", v)
	}
}

func validateVersionStatus(v string) error {
	if v == "pending-approval" {
		return nil
	}
	return validateDocumentStatus(v)
}

func validateAccessScope(v string) error {
	switch v {
	case "customer", "manager", "dev", "internal":
		return nil
	default:
		return fmt.Errorf("invalid accessScope: %s", v)
	}
}

func validateChangeSource(v string) error {
	switch v {
	case "manual", "meeting", "task", "imported":
		return nil
	default:
		return fmt.Errorf("invalid changeSource: %s", v)
	}
}

func validateApprovalDecision(v string) error {
	switch v {
	case "pending", "approved", "rejected", "requested-changes":
		return nil
	default:
		return fmt.Errorf("invalid approval decision: %s", v)
	}
}

func validateLinkType(v string) error {
	switch v {
	case "epoch", "task", "meeting", "release", "project":
		return nil
	default:
		return fmt.Errorf("invalid entityType: %s", v)
	}
}
