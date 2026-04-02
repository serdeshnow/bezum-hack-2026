package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/document"
)

func InitDocumentRoutes(protected *gin.RouterGroup, handler *document.Handler) {
	folders := protected.Group("/document-folders")
	{
		folders.GET("", handler.ListFolders)
		folders.POST("", handler.CreateFolder)
		folders.GET("/:folderId", handler.GetFolder)
		folders.PATCH("/:folderId", handler.UpdateFolder)
		folders.DELETE("/:folderId", handler.DeleteFolder)
	}

	docs := protected.Group("/documents")
	{
		docs.GET("", handler.ListDocuments)
		docs.POST("", handler.CreateDocument)
		docs.GET("/:documentId", handler.GetDocument)
		docs.PATCH("/:documentId", handler.UpdateDocument)
		docs.DELETE("/:documentId", handler.DeleteDocument)
		docs.GET("/:documentId/owners", handler.ListOwners)
		docs.POST("/:documentId/owners", handler.CreateOwner)
		docs.GET("/:documentId/approvers", handler.ListApprovers)
		docs.POST("/:documentId/approvers", handler.CreateApprover)
		docs.GET("/:documentId/versions", handler.ListVersions)
		docs.POST("/:documentId/versions", handler.CreateVersion)
		docs.GET("/:documentId/comments", handler.ListComments)
		docs.POST("/:documentId/comments", handler.CreateComment)
		docs.GET("/:documentId/links", handler.ListLinks)
		docs.POST("/:documentId/links", handler.CreateLink)
	}

	owners := protected.Group("/document-owners")
	{
		owners.GET("/:documentOwnerId", handler.GetOwner)
		owners.PATCH("/:documentOwnerId", handler.UpdateOwner)
		owners.DELETE("/:documentOwnerId", handler.DeleteOwner)
	}

	approvers := protected.Group("/document-approvers")
	{
		approvers.GET("/:documentApproverId", handler.GetApprover)
		approvers.PATCH("/:documentApproverId", handler.UpdateApprover)
		approvers.DELETE("/:documentApproverId", handler.DeleteApprover)
	}

	versions := protected.Group("/document-versions")
	{
		versions.GET("/:versionId", handler.GetVersion)
		versions.PATCH("/:versionId", handler.UpdateVersion)
		versions.DELETE("/:versionId", handler.DeleteVersion)
		versions.GET("/:versionId/approvals", handler.ListApprovals)
		versions.POST("/:versionId/approvals", handler.CreateApproval)
	}

	approvals := protected.Group("/document-approvals")
	{
		approvals.GET("/:documentApprovalId", handler.GetApproval)
		approvals.PATCH("/:documentApprovalId", handler.UpdateApproval)
		approvals.DELETE("/:documentApprovalId", handler.DeleteApproval)
	}

	comments := protected.Group("/document-comments")
	{
		comments.GET("/:documentCommentId", handler.GetComment)
		comments.PATCH("/:documentCommentId", handler.UpdateComment)
		comments.DELETE("/:documentCommentId", handler.DeleteComment)
	}

	links := protected.Group("/document-links")
	{
		links.GET("/:documentLinkId", handler.GetLink)
		links.PATCH("/:documentLinkId", handler.UpdateLink)
		links.DELETE("/:documentLinkId", handler.DeleteLink)
	}
}
