package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/meeting"
)

func InitMeetingRoutes(protected *gin.RouterGroup, handler *meeting.Handler) {
	meetings := protected.Group("/meetings")
	{
		meetings.GET("", handler.ListMeetings)
		meetings.POST("", handler.CreateMeeting)
		meetings.GET("/:meetingId", handler.GetMeeting)
		meetings.PATCH("/:meetingId", handler.UpdateMeeting)
		meetings.DELETE("/:meetingId", handler.DeleteMeeting)
		meetings.GET("/:meetingId/participants", handler.ListParticipants)
		meetings.POST("/:meetingId/participants", handler.CreateParticipant)
		meetings.GET("/:meetingId/availability-slots", handler.ListAvailabilitySlots)
		meetings.POST("/:meetingId/availability-slots", handler.CreateAvailabilitySlot)
		meetings.GET("/:meetingId/transcript-entries", handler.ListTranscriptEntries)
		meetings.POST("/:meetingId/transcript-entries", handler.CreateTranscriptEntry)
		meetings.GET("/:meetingId/decisions", handler.ListDecisions)
		meetings.POST("/:meetingId/decisions", handler.CreateDecision)
		meetings.GET("/:meetingId/action-items", handler.ListActionItems)
		meetings.POST("/:meetingId/action-items", handler.CreateActionItem)
		meetings.GET("/:meetingId/linked-documents", handler.ListLinkedDocuments)
		meetings.POST("/:meetingId/linked-documents", handler.CreateLinkedDocument)
	}

	participants := protected.Group("/meeting-participants")
	{
		participants.GET("/:meetingParticipantId", handler.GetParticipant)
		participants.PATCH("/:meetingParticipantId", handler.UpdateParticipant)
		participants.DELETE("/:meetingParticipantId", handler.DeleteParticipant)
	}

	slots := protected.Group("/meeting-availability-slots")
	{
		slots.GET("/:slotId", handler.GetAvailabilitySlot)
		slots.PATCH("/:slotId", handler.UpdateAvailabilitySlot)
		slots.DELETE("/:slotId", handler.DeleteAvailabilitySlot)
		slots.GET("/:slotId/votes", handler.ListAvailabilityVotes)
		slots.POST("/:slotId/votes", handler.CreateAvailabilityVote)
	}

	votes := protected.Group("/meeting-availability-votes")
	{
		votes.GET("/:voteId", handler.GetAvailabilityVote)
		votes.PATCH("/:voteId", handler.UpdateAvailabilityVote)
		votes.DELETE("/:voteId", handler.DeleteAvailabilityVote)
	}

	entries := protected.Group("/meeting-transcript-entries")
	{
		entries.GET("/:entryId", handler.GetTranscriptEntry)
		entries.PATCH("/:entryId", handler.UpdateTranscriptEntry)
		entries.DELETE("/:entryId", handler.DeleteTranscriptEntry)
	}

	decisions := protected.Group("/meeting-decisions")
	{
		decisions.GET("/:decisionId", handler.GetDecision)
		decisions.PATCH("/:decisionId", handler.UpdateDecision)
		decisions.DELETE("/:decisionId", handler.DeleteDecision)
	}

	actionItems := protected.Group("/meeting-action-items")
	{
		actionItems.GET("/:actionItemId", handler.GetActionItem)
		actionItems.PATCH("/:actionItemId", handler.UpdateActionItem)
		actionItems.DELETE("/:actionItemId", handler.DeleteActionItem)
	}

	linkedDocuments := protected.Group("/meeting-linked-documents")
	{
		linkedDocuments.GET("/:meetingLinkedDocumentId", handler.GetLinkedDocument)
		linkedDocuments.PATCH("/:meetingLinkedDocumentId", handler.UpdateLinkedDocument)
		linkedDocuments.DELETE("/:meetingLinkedDocumentId", handler.DeleteLinkedDocument)
	}
}
