package document

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
)

type Handler struct {
	service *Service
	logger  *logger.Logger
}

type errorResponse struct {
	Code    string `json:"code" example:"bad_request"`
	Message string `json:"message" example:"validation failed"`
}

type deleteResponse struct {
	Deleted bool `json:"deleted" example:"true"`
}

func NewHandler(service *Service, log *logger.Logger) *Handler {
	return &Handler{service: service, logger: log}
}

type folderRequest struct {
	ProjectID      *int    `json:"projectId"`
	ParentFolderID *int    `json:"parentFolderId"`
	Name           *string `json:"name"`
	SortOrder      *int    `json:"sortOrder"`
}
type documentRequest struct {
	ProjectID        *int    `json:"projectId"`
	FolderID         *int    `json:"folderId"`
	Title            *string `json:"title"`
	Description      *string `json:"description"`
	Status           *string `json:"status"`
	AccessScope      *string `json:"accessScope"`
	AuthorUserID     *int    `json:"authorUserId"`
	CurrentVersionID *int    `json:"currentVersionId"`
	AwaitingApproval *bool   `json:"awaitingApproval"`
	IsStarred        *bool   `json:"isStarred"`
	ArchivedAt       *string `json:"archivedAt"`
}
type ownerRequest struct {
	UserID *int `json:"userId"`
}
type approverRequest struct {
	UserID     *int    `json:"userId"`
	Approved   *bool   `json:"approved"`
	DecisionAt *string `json:"decisionAt"`
}
type versionRequest struct {
	VersionLabel    *string `json:"versionLabel"`
	ContentMarkdown *string `json:"contentMarkdown"`
	ChangeSource    *string `json:"changeSource"`
	SourceDetail    *string `json:"sourceDetail"`
	AuthorUserID    *int    `json:"authorUserId"`
	Additions       *int    `json:"additions"`
	Deletions       *int    `json:"deletions"`
	Modifications   *int    `json:"modifications"`
	Status          *string `json:"status"`
}
type approvalRequest struct {
	ApproverUserID *int    `json:"approverUserId"`
	Status         *string `json:"status"`
	Decision       *string `json:"decision"`
	Rationale      *string `json:"rationale"`
	DecidedAt      *string `json:"decidedAt"`
}
type commentRequest struct {
	AuthorUserID *int    `json:"authorUserId"`
	Content      *string `json:"content"`
	Resolved     *bool   `json:"resolved"`
}
type linkRequest struct {
	EntityType *string `json:"entityType"`
	EntityID   *int    `json:"entityId"`
}

// ListFolders godoc
// @Summary List document folders
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Success 200 {array} Folder
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-folders [get]
func (h *Handler) ListFolders(c *gin.Context) {
	var filter FolderFilter
	parseIntQuery(c, "projectId", &filter.ProjectID, h.badRequest)
	if c.IsAborted() {
		return
	}
	items, err := h.service.ListFolders(c.Request.Context(), filter)
	if err != nil {
		h.handleError(c, err, "failed to list document folders")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateFolder godoc
// @Summary Create document folder
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param payload body folderRequest true "Folder payload"
// @Success 201 {object} Folder
// @Failure 400 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-folders [post]
func (h *Handler) CreateFolder(c *gin.Context) {
	var req folderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.ProjectID == nil || req.Name == nil {
		h.badRequest(c, errors.New("projectId and name are required"))
		return
	}
	item, err := h.service.CreateFolder(c.Request.Context(), CreateFolderInput{
		ProjectID: *req.ProjectID, ParentFolderID: req.ParentFolderID, Name: *req.Name, SortOrder: intValue(req.SortOrder, 0),
	})
	if err != nil {
		h.handleError(c, err, "failed to create document folder")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetFolder godoc
// @Summary Get document folder
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param folderId path int true "Folder ID"
// @Success 200 {object} Folder
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-folders/{folderId} [get]
func (h *Handler) GetFolder(c *gin.Context) {
	id, ok := parseID(c, "folderId")
	if !ok {
		return
	}
	item, err := h.service.GetFolderByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get document folder")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateFolder godoc
// @Summary Update document folder
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param folderId path int true "Folder ID"
// @Param payload body folderRequest true "Folder payload"
// @Success 200 {object} Folder
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-folders/{folderId} [patch]
func (h *Handler) UpdateFolder(c *gin.Context) {
	id, ok := parseID(c, "folderId")
	if !ok {
		return
	}
	var req folderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateFolder(c.Request.Context(), id, UpdateFolderInput{ParentFolderID: req.ParentFolderID, Name: req.Name, SortOrder: req.SortOrder})
	if err != nil {
		h.handleError(c, err, "failed to update document folder")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteFolder godoc
// @Summary Delete document folder
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param folderId path int true "Folder ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-folders/{folderId} [delete]
func (h *Handler) DeleteFolder(c *gin.Context) {
	id, ok := parseID(c, "folderId")
	if !ok {
		return
	}
	if err := h.service.DeleteFolder(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete document folder")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListDocuments godoc
// @Summary List documents
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Success 200 {array} Document
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /documents [get]
func (h *Handler) ListDocuments(c *gin.Context) {
	var filter DocumentFilter
	parseIntQuery(c, "projectId", &filter.ProjectID, h.badRequest)
	if c.IsAborted() {
		return
	}
	parseIntQuery(c, "folderId", &filter.FolderID, h.badRequest)
	if c.IsAborted() {
		return
	}
	parseIntQuery(c, "authorUserId", &filter.AuthorUserID, h.badRequest)
	if c.IsAborted() {
		return
	}
	parseBoolQuery(c, "awaitingApproval", &filter.AwaitingApproval, h.badRequest)
	if c.IsAborted() {
		return
	}
	parseBoolQuery(c, "archived", &filter.Archived, h.badRequest)
	if c.IsAborted() {
		return
	}
	filter.Status = c.Query("status")
	filter.AccessScope = c.Query("accessScope")
	items, err := h.service.ListDocuments(c.Request.Context(), filter)
	if err != nil {
		h.handleError(c, err, "failed to list documents")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateDocument godoc
// @Summary Create document
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param payload body documentRequest true "Document payload"
// @Success 201 {object} Document
// @Failure 400 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /documents [post]
func (h *Handler) CreateDocument(c *gin.Context) {
	var req documentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.ProjectID == nil || req.Title == nil || req.Status == nil || req.AccessScope == nil || req.AuthorUserID == nil {
		h.badRequest(c, errors.New("projectId, title, status, accessScope and authorUserId are required"))
		return
	}
	archivedAt, err := parseDateTime(req.ArchivedAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.CreateDocument(c.Request.Context(), CreateDocumentInput{
		ProjectID: *req.ProjectID, FolderID: req.FolderID, Title: *req.Title, Description: req.Description, Status: *req.Status, AccessScope: *req.AccessScope, AuthorUserID: *req.AuthorUserID, CurrentVersionID: req.CurrentVersionID, AwaitingApproval: boolValue(req.AwaitingApproval, false), IsStarred: boolValue(req.IsStarred, false), ArchivedAt: archivedAt,
	})
	if err != nil {
		h.handleError(c, err, "failed to create document")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetDocument godoc
// @Summary Get document
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentId path int true "Document ID"
// @Success 200 {object} Document
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /documents/{documentId} [get]
func (h *Handler) GetDocument(c *gin.Context) {
	id, ok := parseID(c, "documentId")
	if !ok {
		return
	}
	item, err := h.service.GetDocumentByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get document")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateDocument godoc
// @Summary Update document
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param documentId path int true "Document ID"
// @Param payload body documentRequest true "Document payload"
// @Success 200 {object} Document
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /documents/{documentId} [patch]
func (h *Handler) UpdateDocument(c *gin.Context) {
	id, ok := parseID(c, "documentId")
	if !ok {
		return
	}
	var req documentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	archivedAt, err := parseDateTime(req.ArchivedAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateDocument(c.Request.Context(), id, UpdateDocumentInput{FolderID: req.FolderID, Title: req.Title, Description: req.Description, Status: req.Status, AccessScope: req.AccessScope, CurrentVersionID: req.CurrentVersionID, AwaitingApproval: req.AwaitingApproval, IsStarred: req.IsStarred, ArchivedAt: archivedAt})
	if err != nil {
		h.handleError(c, err, "failed to update document")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteDocument godoc
// @Summary Delete document
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentId path int true "Document ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /documents/{documentId} [delete]
func (h *Handler) DeleteDocument(c *gin.Context) {
	id, ok := parseID(c, "documentId")
	if !ok {
		return
	}
	if err := h.service.DeleteDocument(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete document")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListOwners godoc
// @Summary List document owners
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentId path int true "Document ID"
// @Success 200 {array} Owner
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /documents/{documentId}/owners [get]
func (h *Handler) ListOwners(c *gin.Context) {
	did, ok := parseID(c, "documentId")
	if !ok {
		return
	}
	items, err := h.service.ListOwners(c.Request.Context(), did)
	if err != nil {
		h.handleError(c, err, "failed to list document owners")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateOwner godoc
// @Summary Create document owner
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param documentId path int true "Document ID"
// @Param payload body ownerRequest true "Owner payload"
// @Success 201 {object} Owner
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /documents/{documentId}/owners [post]
func (h *Handler) CreateOwner(c *gin.Context) {
	did, ok := parseID(c, "documentId")
	if !ok {
		return
	}
	var req ownerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.UserID == nil {
		h.badRequest(c, errors.New("userId is required"))
		return
	}
	item, err := h.service.CreateOwner(c.Request.Context(), CreateOwnerInput{DocumentID: did, UserID: *req.UserID})
	if err != nil {
		h.handleError(c, err, "failed to create document owner")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetOwner godoc
// @Summary Get document owner
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentOwnerId path int true "Document owner ID"
// @Success 200 {object} Owner
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-owners/{documentOwnerId} [get]
func (h *Handler) GetOwner(c *gin.Context) {
	id, ok := parseID(c, "documentOwnerId")
	if !ok {
		return
	}
	item, err := h.service.GetOwnerByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get document owner")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateOwner godoc
// @Summary Update document owner
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param documentOwnerId path int true "Document owner ID"
// @Param payload body ownerRequest true "Owner payload"
// @Success 200 {object} Owner
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-owners/{documentOwnerId} [patch]
func (h *Handler) UpdateOwner(c *gin.Context) {
	id, ok := parseID(c, "documentOwnerId")
	if !ok {
		return
	}
	var req ownerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateOwner(c.Request.Context(), id, UpdateOwnerInput(req))
	if err != nil {
		h.handleError(c, err, "failed to update document owner")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteOwner godoc
// @Summary Delete document owner
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentOwnerId path int true "Document owner ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-owners/{documentOwnerId} [delete]
func (h *Handler) DeleteOwner(c *gin.Context) {
	id, ok := parseID(c, "documentOwnerId")
	if !ok {
		return
	}
	if err := h.service.DeleteOwner(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete document owner")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListApprovers godoc
// @Summary List document approvers
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentId path int true "Document ID"
// @Success 200 {array} Approver
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /documents/{documentId}/approvers [get]
func (h *Handler) ListApprovers(c *gin.Context) {
	did, ok := parseID(c, "documentId")
	if !ok {
		return
	}
	items, err := h.service.ListApprovers(c.Request.Context(), did)
	if err != nil {
		h.handleError(c, err, "failed to list document approvers")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateApprover godoc
// @Summary Create document approver
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param documentId path int true "Document ID"
// @Param payload body approverRequest true "Approver payload"
// @Success 201 {object} Approver
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /documents/{documentId}/approvers [post]
func (h *Handler) CreateApprover(c *gin.Context) {
	did, ok := parseID(c, "documentId")
	if !ok {
		return
	}
	var req approverRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.UserID == nil {
		h.badRequest(c, errors.New("userId is required"))
		return
	}
	decisionAt, err := parseDateTime(req.DecisionAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.CreateApprover(c.Request.Context(), CreateApproverInput{DocumentID: did, UserID: *req.UserID, Approved: boolValue(req.Approved, false), DecisionAt: decisionAt})
	if err != nil {
		h.handleError(c, err, "failed to create document approver")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetApprover godoc
// @Summary Get document approver
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentApproverId path int true "Document approver ID"
// @Success 200 {object} Approver
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-approvers/{documentApproverId} [get]
func (h *Handler) GetApprover(c *gin.Context) {
	id, ok := parseID(c, "documentApproverId")
	if !ok {
		return
	}
	item, err := h.service.GetApproverByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get document approver")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateApprover godoc
// @Summary Update document approver
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param documentApproverId path int true "Document approver ID"
// @Param payload body approverRequest true "Approver payload"
// @Success 200 {object} Approver
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-approvers/{documentApproverId} [patch]
func (h *Handler) UpdateApprover(c *gin.Context) {
	id, ok := parseID(c, "documentApproverId")
	if !ok {
		return
	}
	var req approverRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	decisionAt, err := parseDateTime(req.DecisionAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateApprover(c.Request.Context(), id, UpdateApproverInput{UserID: req.UserID, Approved: req.Approved, DecisionAt: decisionAt})
	if err != nil {
		h.handleError(c, err, "failed to update document approver")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteApprover godoc
// @Summary Delete document approver
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentApproverId path int true "Document approver ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-approvers/{documentApproverId} [delete]
func (h *Handler) DeleteApprover(c *gin.Context) {
	id, ok := parseID(c, "documentApproverId")
	if !ok {
		return
	}
	if err := h.service.DeleteApprover(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete document approver")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListVersions godoc
// @Summary List document versions
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentId path int true "Document ID"
// @Success 200 {array} Version
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /documents/{documentId}/versions [get]
func (h *Handler) ListVersions(c *gin.Context) {
	did, ok := parseID(c, "documentId")
	if !ok {
		return
	}
	f := VersionFilter{DocumentID: did, Status: c.Query("status")}
	parseIntQuery(c, "authorUserId", &f.AuthorUserID, h.badRequest)
	if c.IsAborted() {
		return
	}
	items, err := h.service.ListVersions(c.Request.Context(), f)
	if err != nil {
		h.handleError(c, err, "failed to list document versions")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateVersion godoc
// @Summary Create document version
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param documentId path int true "Document ID"
// @Param payload body versionRequest true "Version payload"
// @Success 201 {object} Version
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /documents/{documentId}/versions [post]
func (h *Handler) CreateVersion(c *gin.Context) {
	did, ok := parseID(c, "documentId")
	if !ok {
		return
	}
	var req versionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.VersionLabel == nil || req.ContentMarkdown == nil || req.ChangeSource == nil || req.Status == nil {
		h.badRequest(c, errors.New("versionLabel, contentMarkdown, changeSource and status are required"))
		return
	}
	item, err := h.service.CreateVersion(c.Request.Context(), CreateVersionInput{DocumentID: did, VersionLabel: *req.VersionLabel, ContentMarkdown: *req.ContentMarkdown, ChangeSource: *req.ChangeSource, SourceDetail: req.SourceDetail, AuthorUserID: req.AuthorUserID, Additions: intValue(req.Additions, 0), Deletions: intValue(req.Deletions, 0), Modifications: intValue(req.Modifications, 0), Status: *req.Status})
	if err != nil {
		h.handleError(c, err, "failed to create document version")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetVersion godoc
// @Summary Get document version
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param versionId path int true "Version ID"
// @Success 200 {object} Version
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-versions/{versionId} [get]
func (h *Handler) GetVersion(c *gin.Context) {
	id, ok := parseID(c, "versionId")
	if !ok {
		return
	}
	item, err := h.service.GetVersionByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get document version")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateVersion godoc
// @Summary Update document version
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param versionId path int true "Version ID"
// @Param payload body versionRequest true "Version payload"
// @Success 200 {object} Version
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-versions/{versionId} [patch]
func (h *Handler) UpdateVersion(c *gin.Context) {
	id, ok := parseID(c, "versionId")
	if !ok {
		return
	}
	var req versionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateVersion(c.Request.Context(), id, UpdateVersionInput{VersionLabel: req.VersionLabel, ContentMarkdown: req.ContentMarkdown, ChangeSource: req.ChangeSource, SourceDetail: req.SourceDetail, Additions: req.Additions, Deletions: req.Deletions, Modifications: req.Modifications, Status: req.Status})
	if err != nil {
		h.handleError(c, err, "failed to update document version")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteVersion godoc
// @Summary Delete document version
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param versionId path int true "Version ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-versions/{versionId} [delete]
func (h *Handler) DeleteVersion(c *gin.Context) {
	id, ok := parseID(c, "versionId")
	if !ok {
		return
	}
	if err := h.service.DeleteVersion(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete document version")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListApprovals godoc
// @Summary List document approvals
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param versionId path int true "Version ID"
// @Success 200 {array} Approval
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-versions/{versionId}/approvals [get]
func (h *Handler) ListApprovals(c *gin.Context) {
	vid, ok := parseID(c, "versionId")
	if !ok {
		return
	}
	f := ApprovalFilter{VersionID: vid, Status: c.Query("status")}
	parseIntQuery(c, "approverUserId", &f.ApproverUserID, h.badRequest)
	if c.IsAborted() {
		return
	}
	items, err := h.service.ListApprovals(c.Request.Context(), f)
	if err != nil {
		h.handleError(c, err, "failed to list document approvals")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateApproval godoc
// @Summary Create document approval
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param versionId path int true "Version ID"
// @Param payload body approvalRequest true "Approval payload"
// @Success 201 {object} Approval
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-versions/{versionId}/approvals [post]
func (h *Handler) CreateApproval(c *gin.Context) {
	vid, ok := parseID(c, "versionId")
	if !ok {
		return
	}
	var req approvalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.ApproverUserID == nil || req.Status == nil {
		h.badRequest(c, errors.New("approverUserId and status are required"))
		return
	}
	decidedAt, err := parseDateTime(req.DecidedAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.CreateApproval(c.Request.Context(), CreateApprovalInput{DocumentVersionID: vid, ApproverUserID: *req.ApproverUserID, Status: *req.Status, Decision: req.Decision, Rationale: req.Rationale, DecidedAt: decidedAt})
	if err != nil {
		h.handleError(c, err, "failed to create document approval")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetApproval godoc
// @Summary Get document approval
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentApprovalId path int true "Document approval ID"
// @Success 200 {object} Approval
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-approvals/{documentApprovalId} [get]
func (h *Handler) GetApproval(c *gin.Context) {
	id, ok := parseID(c, "documentApprovalId")
	if !ok {
		return
	}
	item, err := h.service.GetApprovalByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get document approval")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateApproval godoc
// @Summary Update document approval
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param documentApprovalId path int true "Document approval ID"
// @Param payload body approvalRequest true "Approval payload"
// @Success 200 {object} Approval
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-approvals/{documentApprovalId} [patch]
func (h *Handler) UpdateApproval(c *gin.Context) {
	id, ok := parseID(c, "documentApprovalId")
	if !ok {
		return
	}
	var req approvalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	decidedAt, err := parseDateTime(req.DecidedAt)
	if err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateApproval(c.Request.Context(), id, UpdateApprovalInput{Status: req.Status, Decision: req.Decision, Rationale: req.Rationale, DecidedAt: decidedAt})
	if err != nil {
		h.handleError(c, err, "failed to update document approval")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteApproval godoc
// @Summary Delete document approval
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentApprovalId path int true "Document approval ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-approvals/{documentApprovalId} [delete]
func (h *Handler) DeleteApproval(c *gin.Context) {
	id, ok := parseID(c, "documentApprovalId")
	if !ok {
		return
	}
	if err := h.service.DeleteApproval(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete document approval")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListComments godoc
// @Summary List document comments
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentId path int true "Document ID"
// @Success 200 {array} Comment
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /documents/{documentId}/comments [get]
func (h *Handler) ListComments(c *gin.Context) {
	did, ok := parseID(c, "documentId")
	if !ok {
		return
	}
	f := CommentFilter{DocumentID: did}
	parseBoolQuery(c, "resolved", &f.Resolved, h.badRequest)
	if c.IsAborted() {
		return
	}
	parseIntQuery(c, "authorUserId", &f.AuthorUserID, h.badRequest)
	if c.IsAborted() {
		return
	}
	items, err := h.service.ListComments(c.Request.Context(), f)
	if err != nil {
		h.handleError(c, err, "failed to list document comments")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateComment godoc
// @Summary Create document comment
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param documentId path int true "Document ID"
// @Param payload body commentRequest true "Comment payload"
// @Success 201 {object} Comment
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /documents/{documentId}/comments [post]
func (h *Handler) CreateComment(c *gin.Context) {
	did, ok := parseID(c, "documentId")
	if !ok {
		return
	}
	var req commentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.AuthorUserID == nil || req.Content == nil {
		h.badRequest(c, errors.New("authorUserId and content are required"))
		return
	}
	item, err := h.service.CreateComment(c.Request.Context(), CreateCommentInput{DocumentID: did, AuthorUserID: *req.AuthorUserID, Content: *req.Content, Resolved: boolValue(req.Resolved, false)})
	if err != nil {
		h.handleError(c, err, "failed to create document comment")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetComment godoc
// @Summary Get document comment
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentCommentId path int true "Document comment ID"
// @Success 200 {object} Comment
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-comments/{documentCommentId} [get]
func (h *Handler) GetComment(c *gin.Context) {
	id, ok := parseID(c, "documentCommentId")
	if !ok {
		return
	}
	item, err := h.service.GetCommentByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get document comment")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateComment godoc
// @Summary Update document comment
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param documentCommentId path int true "Document comment ID"
// @Param payload body commentRequest true "Comment payload"
// @Success 200 {object} Comment
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-comments/{documentCommentId} [patch]
func (h *Handler) UpdateComment(c *gin.Context) {
	id, ok := parseID(c, "documentCommentId")
	if !ok {
		return
	}
	var req commentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateComment(c.Request.Context(), id, UpdateCommentInput{Content: req.Content, Resolved: req.Resolved})
	if err != nil {
		h.handleError(c, err, "failed to update document comment")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteComment godoc
// @Summary Delete document comment
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentCommentId path int true "Document comment ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-comments/{documentCommentId} [delete]
func (h *Handler) DeleteComment(c *gin.Context) {
	id, ok := parseID(c, "documentCommentId")
	if !ok {
		return
	}
	if err := h.service.DeleteComment(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete document comment")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListLinks godoc
// @Summary List document links
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentId path int true "Document ID"
// @Success 200 {array} Link
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /documents/{documentId}/links [get]
func (h *Handler) ListLinks(c *gin.Context) {
	did, ok := parseID(c, "documentId")
	if !ok {
		return
	}
	f := LinkFilter{DocumentID: did, EntityType: c.Query("entityType")}
	parseIntQuery(c, "entityId", &f.EntityID, h.badRequest)
	if c.IsAborted() {
		return
	}
	items, err := h.service.ListLinks(c.Request.Context(), f)
	if err != nil {
		h.handleError(c, err, "failed to list document links")
		return
	}
	c.JSON(http.StatusOK, items)
}

// CreateLink godoc
// @Summary Create document link
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param documentId path int true "Document ID"
// @Param payload body linkRequest true "Link payload"
// @Success 201 {object} Link
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /documents/{documentId}/links [post]
func (h *Handler) CreateLink(c *gin.Context) {
	did, ok := parseID(c, "documentId")
	if !ok {
		return
	}
	var req linkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	if req.EntityType == nil || req.EntityID == nil {
		h.badRequest(c, errors.New("entityType and entityId are required"))
		return
	}
	item, err := h.service.CreateLink(c.Request.Context(), CreateLinkInput{DocumentID: did, EntityType: *req.EntityType, EntityID: *req.EntityID})
	if err != nil {
		h.handleError(c, err, "failed to create document link")
		return
	}
	c.JSON(http.StatusCreated, item)
}

// GetLink godoc
// @Summary Get document link
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentLinkId path int true "Document link ID"
// @Success 200 {object} Link
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-links/{documentLinkId} [get]
func (h *Handler) GetLink(c *gin.Context) {
	id, ok := parseID(c, "documentLinkId")
	if !ok {
		return
	}
	item, err := h.service.GetLinkByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err, "failed to get document link")
		return
	}
	c.JSON(http.StatusOK, item)
}

// UpdateLink godoc
// @Summary Update document link
// @Tags Documents
// @Security bearerAuth
// @Accept json
// @Produce json
// @Param documentLinkId path int true "Document link ID"
// @Param payload body linkRequest true "Link payload"
// @Success 200 {object} Link
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 409 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-links/{documentLinkId} [patch]
func (h *Handler) UpdateLink(c *gin.Context) {
	id, ok := parseID(c, "documentLinkId")
	if !ok {
		return
	}
	var req linkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.badRequest(c, err)
		return
	}
	item, err := h.service.UpdateLink(c.Request.Context(), id, UpdateLinkInput(req))
	if err != nil {
		h.handleError(c, err, "failed to update document link")
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteLink godoc
// @Summary Delete document link
// @Tags Documents
// @Security bearerAuth
// @Produce json
// @Param documentLinkId path int true "Document link ID"
// @Success 200 {object} deleteResponse
// @Failure 400 {object} errorResponse
// @Failure 404 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /document-links/{documentLinkId} [delete]
func (h *Handler) DeleteLink(c *gin.Context) {
	id, ok := parseID(c, "documentLinkId")
	if !ok {
		return
	}
	if err := h.service.DeleteLink(c.Request.Context(), id); err != nil {
		h.handleError(c, err, "failed to delete document link")
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (h *Handler) badRequest(c *gin.Context, err error) {
	h.logger.Warn().Err(err).Msg("invalid document request")
	c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"code": "bad_request", "message": err.Error()})
}
func (h *Handler) handleError(c *gin.Context, err error, msg string) {
	switch {
	case errors.Is(err, ErrFolderNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "document_folder_not_found", "message": "document folder not found"})
	case errors.Is(err, ErrDocumentNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "document_not_found", "message": "document not found"})
	case errors.Is(err, ErrOwnerNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "document_owner_not_found", "message": "document owner not found"})
	case errors.Is(err, ErrApproverNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "document_approver_not_found", "message": "document approver not found"})
	case errors.Is(err, ErrVersionNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "document_version_not_found", "message": "document version not found"})
	case errors.Is(err, ErrApprovalNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "document_approval_not_found", "message": "document approval not found"})
	case errors.Is(err, ErrCommentNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "document_comment_not_found", "message": "document comment not found"})
	case errors.Is(err, ErrLinkNotFound):
		c.JSON(http.StatusNotFound, gin.H{"code": "document_link_not_found", "message": "document link not found"})
	case errors.Is(err, ErrDocumentConflict):
		c.JSON(http.StatusConflict, gin.H{"code": "document_conflict", "message": "document conflict"})
	default:
		if contains(err.Error(), "invalid") || contains(err.Error(), "required") || contains(err.Error(), "non-negative") {
			c.JSON(http.StatusBadRequest, gin.H{"code": "bad_request", "message": err.Error()})
			return
		}
		h.logger.Error().Err(err).Msg(msg)
		c.JSON(http.StatusInternalServerError, gin.H{"code": "internal_error", "message": msg})
	}
}

func parseID(c *gin.Context, key string) (int, bool) {
	id, err := strconv.Atoi(c.Param(key))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "bad_id", "message": key + " must be an integer"})
		return 0, false
	}
	return id, true
}

func parseIntQuery(c *gin.Context, key string, dest **int, onErr func(*gin.Context, error)) {
	if v := c.Query(key); v != "" {
		id, err := strconv.Atoi(v)
		if err != nil {
			onErr(c, err)
			return
		}
		*dest = &id
	}
}

func parseBoolQuery(c *gin.Context, key string, dest **bool, onErr func(*gin.Context, error)) {
	if v := c.Query(key); v != "" {
		b, err := strconv.ParseBool(v)
		if err != nil {
			onErr(c, err)
			return
		}
		*dest = &b
	}
}

func parseDateTime(value *string) (*time.Time, error) {
	if value == nil || *value == "" {
		return nil, nil
	}
	t, err := time.Parse(time.RFC3339, *value)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func intValue(v *int, fallback int) int {
	if v == nil {
		return fallback
	}
	return *v
}

func boolValue(v *bool, fallback bool) bool {
	if v == nil {
		return fallback
	}
	return *v
}

func contains(s, sub string) bool {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
