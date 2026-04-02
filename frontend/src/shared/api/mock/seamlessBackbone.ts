import {
  DocumentApprovalSchema,
  DocumentApproverSchema,
  DocumentCommentSchema,
  DocumentFolderSchema,
  DocumentLinkSchema,
  DocumentOwnerSchema,
  DocumentVersionSchema,
  DocumentSchema,
  EpochSchema,
  GoalSchema,
  MeetingActionItemSchema,
  MeetingAvailabilitySlotSchema,
  MeetingAvailabilityVoteSchema,
  MeetingDecisionSchema,
  MeetingLinkedDocumentSchema,
  MeetingParticipantSchema,
  MeetingSchema,
  MeetingTranscriptEntrySchema,
  NotificationSchema,
  ProjectMemberSchema,
  ProjectSchema,
  PullRequestSchema,
  ReleaseSchema,
  TaskCommentSchema,
  TaskSchema,
  TaskTagSchema,
  UserSchema,
  type Document,
  type DocumentApproval,
  type DocumentApprover,
  type DocumentComment,
  type DocumentFolder,
  type DocumentLink,
  type DocumentOwner,
  type DocumentVersion,
  type Epoch,
  type Goal,
  type MeetingActionItem,
  type MeetingAvailabilitySlot,
  type MeetingAvailabilityVote,
  type MeetingDecision,
  type MeetingLinkedDocument,
  type MeetingParticipant,
  type Meeting,
  type MeetingTranscriptEntry,
  type Notification,
  type Project,
  type ProjectMember,
  type PullRequest,
  type Release,
  type TaskComment,
  type Task,
  type TaskTag,
  type User,
  type VoteStatus
} from '@/shared/api/contracts/seamlessBackbone.ts'
import { z } from 'zod'

function collection<T>(schema: z.ZodType<T>, items: T[]) {
  return z.array(schema).parse(items)
}

export const seamlessMockDb = {
  users: collection(UserSchema, [
    {
      id: 'user-1',
      email: 'alex@seamless.dev',
      firstName: 'Alex',
      lastName: 'Johnson',
      avatarUrl: null,
      role: 'manager',
      isActive: true,
      passwordHash: null,
      lastLoginAt: '2026-04-02T08:45:00Z',
      createdAt: '2026-01-04T09:00:00Z',
      updatedAt: '2026-04-02T08:45:00Z'
    },
    {
      id: 'user-2',
      email: 'sarah@seamless.dev',
      firstName: 'Sarah',
      lastName: 'Chen',
      avatarUrl: null,
      role: 'developer',
      isActive: true,
      passwordHash: null,
      lastLoginAt: '2026-04-02T08:10:00Z',
      createdAt: '2026-01-05T09:00:00Z',
      updatedAt: '2026-04-02T08:10:00Z'
    },
    {
      id: 'user-3',
      email: 'michael@seamless.dev',
      firstName: 'Michael',
      lastName: 'Brown',
      avatarUrl: null,
      role: 'developer',
      isActive: true,
      passwordHash: null,
      lastLoginAt: '2026-04-02T07:55:00Z',
      createdAt: '2026-01-06T09:00:00Z',
      updatedAt: '2026-04-02T07:55:00Z'
    },
    {
      id: 'user-4',
      email: 'emily@seamless.dev',
      firstName: 'Emily',
      lastName: 'Davis',
      avatarUrl: null,
      role: 'manager',
      isActive: true,
      passwordHash: null,
      lastLoginAt: '2026-04-01T18:20:00Z',
      createdAt: '2026-01-07T09:00:00Z',
      updatedAt: '2026-04-01T18:20:00Z'
    },
    {
      id: 'user-5',
      email: 'lisa@client.dev',
      firstName: 'Lisa',
      lastName: 'Wong',
      avatarUrl: null,
      role: 'customer',
      isActive: true,
      passwordHash: null,
      lastLoginAt: '2026-04-01T16:30:00Z',
      createdAt: '2026-01-08T09:00:00Z',
      updatedAt: '2026-04-01T16:30:00Z'
    }
  ]),
  projects: collection(ProjectSchema, [
    {
      id: 'project-1',
      key: 'ATL',
      name: 'Atlas Commerce',
      description: 'Unified ecommerce rollout with docs, delivery, and meeting workflows in one product space.',
      status: 'active',
      visibilityMode: 'customer',
      ownerUserId: 'user-1',
      activeEpochId: 'epoch-1',
      dueDate: '2026-04-30',
      startedAt: '2026-02-01',
      completedAt: null,
      progressPercent: 68,
      createdAt: '2026-02-01T09:00:00Z',
      updatedAt: '2026-04-02T07:50:00Z'
    },
    {
      id: 'project-2',
      key: 'NOVA',
      name: 'Nova Client Portal',
      description: 'Client collaboration portal with shared planning, release tracking, and controlled document visibility.',
      status: 'at-risk',
      visibilityMode: 'internal',
      ownerUserId: 'user-4',
      activeEpochId: 'epoch-2',
      dueDate: '2026-05-15',
      startedAt: '2026-02-18',
      completedAt: null,
      progressPercent: 44,
      createdAt: '2026-02-18T10:00:00Z',
      updatedAt: '2026-04-01T17:30:00Z'
    },
    {
      id: 'project-3',
      key: 'HEL',
      name: 'Helios Ops',
      description: 'Migration program that already shipped and now serves as an archived reference workspace.',
      status: 'completed',
      visibilityMode: 'internal',
      ownerUserId: 'user-1',
      activeEpochId: null,
      dueDate: '2026-03-10',
      startedAt: '2025-10-01',
      completedAt: '2026-03-10',
      progressPercent: 100,
      createdAt: '2025-10-01T08:00:00Z',
      updatedAt: '2026-03-10T15:00:00Z'
    }
  ]),
  projectMembers: collection(ProjectMemberSchema, [
    { id: 'pm-1', projectId: 'project-1', userId: 'user-1', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-01T09:00:00Z' },
    { id: 'pm-2', projectId: 'project-1', userId: 'user-2', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-01T09:00:00Z' },
    { id: 'pm-3', projectId: 'project-1', userId: 'user-3', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-01T09:00:00Z' },
    { id: 'pm-4', projectId: 'project-1', userId: 'user-5', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-01T09:00:00Z' },
    { id: 'pm-5', projectId: 'project-2', userId: 'user-4', createdAt: '2026-02-18T10:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
    { id: 'pm-6', projectId: 'project-2', userId: 'user-2', createdAt: '2026-02-18T10:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
    { id: 'pm-7', projectId: 'project-2', userId: 'user-3', createdAt: '2026-02-18T10:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
    { id: 'pm-8', projectId: 'project-3', userId: 'user-1', createdAt: '2025-10-01T08:00:00Z', updatedAt: '2025-10-01T08:00:00Z' },
    { id: 'pm-9', projectId: 'project-3', userId: 'user-4', createdAt: '2025-10-01T08:00:00Z', updatedAt: '2025-10-01T08:00:00Z' }
  ]),
  epochs: collection(EpochSchema, [
    { id: 'epoch-1', projectId: 'project-1', name: 'Q2 2026 Sprint', status: 'active', startDate: '2026-04-01', endDate: '2026-04-30', createdAt: '2026-03-28T09:00:00Z', updatedAt: '2026-04-02T07:00:00Z' },
    { id: 'epoch-2', projectId: 'project-2', name: 'Portal Stabilization Sprint', status: 'at-risk', startDate: '2026-04-03', endDate: '2026-04-24', createdAt: '2026-03-30T09:00:00Z', updatedAt: '2026-04-01T17:00:00Z' },
    { id: 'epoch-3', projectId: 'project-3', name: 'Migration Release Sprint', status: 'completed', startDate: '2026-02-01', endDate: '2026-03-10', createdAt: '2026-01-20T09:00:00Z', updatedAt: '2026-03-10T15:00:00Z' }
  ]),
  goals: collection(GoalSchema, [
    { id: 'goal-1', epochId: 'epoch-1', title: 'Launch checkout MVP', description: 'Deliver checkout flow with payment orchestration and customer visibility.', status: 'in-progress', progressPercent: 76, ownerUserId: 'user-2', createdAt: '2026-03-28T09:00:00Z', updatedAt: '2026-04-02T07:20:00Z' },
    { id: 'goal-2', epochId: 'epoch-1', title: 'Approve delivery docs', description: 'Finalize architecture, release notes, and API guidance.', status: 'completed', progressPercent: 100, ownerUserId: 'user-1', createdAt: '2026-03-28T09:00:00Z', updatedAt: '2026-04-01T16:00:00Z' },
    { id: 'goal-3', epochId: 'epoch-1', title: 'Reduce checkout blockers', description: 'Resolve blockers affecting payment integration readiness.', status: 'blocked', progressPercent: 42, ownerUserId: 'user-3', createdAt: '2026-03-29T10:00:00Z', updatedAt: '2026-04-02T06:45:00Z' },
    { id: 'goal-4', epochId: 'epoch-2', title: 'Stabilize portal auth', description: 'Bring authentication and permissions to production readiness.', status: 'in-progress', progressPercent: 51, ownerUserId: 'user-2', createdAt: '2026-03-30T09:00:00Z', updatedAt: '2026-04-01T17:10:00Z' },
    { id: 'goal-5', epochId: 'epoch-2', title: 'Prepare customer rollout plan', description: 'Document go-live steps and migration communication.', status: 'not-started', progressPercent: 0, ownerUserId: 'user-4', createdAt: '2026-03-30T09:10:00Z', updatedAt: '2026-03-30T09:10:00Z' }
  ]),
  tasks: collection(TaskSchema, [
    { id: 'task-1', projectId: 'project-1', epochId: 'epoch-1', key: 'ATL-101', title: 'Implement payment session orchestration', description: 'Backend flow for checkout session creation.', status: 'in-progress', priority: 'high', assigneeUserId: 'user-2', reporterUserId: 'user-1', dueDate: '2026-04-08', createdDate: '2026-04-01', releaseId: 'release-1', createdAt: '2026-04-01T09:10:00Z', updatedAt: '2026-04-02T07:35:00Z' },
    { id: 'task-2', projectId: 'project-1', epochId: 'epoch-1', key: 'ATL-102', title: 'Connect tax calculation service', description: 'Integrate dynamic tax calculation into checkout.', status: 'review', priority: 'medium', assigneeUserId: 'user-3', reporterUserId: 'user-1', dueDate: '2026-04-09', createdDate: '2026-04-01', releaseId: 'release-1', createdAt: '2026-04-01T10:00:00Z', updatedAt: '2026-04-02T06:55:00Z' },
    { id: 'task-3', projectId: 'project-1', epochId: 'epoch-1', key: 'ATL-103', title: 'Finalize checkout API guide', description: 'Customer-facing API explanation for payment events.', status: 'done', priority: 'medium', assigneeUserId: 'user-1', reporterUserId: 'user-1', dueDate: '2026-04-05', createdDate: '2026-04-01', releaseId: null, createdAt: '2026-04-01T11:00:00Z', updatedAt: '2026-04-01T15:45:00Z' },
    { id: 'task-4', projectId: 'project-1', epochId: 'epoch-1', key: 'ATL-104', title: 'Resolve PSP webhook mismatch', description: 'Investigate failing webhook signature validation.', status: 'todo', priority: 'critical', assigneeUserId: 'user-3', reporterUserId: 'user-2', dueDate: '2026-04-06', createdDate: '2026-04-01', releaseId: 'release-1', createdAt: '2026-04-01T12:00:00Z', updatedAt: '2026-04-02T06:40:00Z' },
    { id: 'task-5', projectId: 'project-1', epochId: 'epoch-1', key: 'ATL-105', title: 'Prepare release communication draft', description: 'Draft internal and customer rollout communication.', status: 'backlog', priority: 'low', assigneeUserId: 'user-1', reporterUserId: 'user-1', dueDate: '2026-04-14', createdDate: '2026-04-01', releaseId: 'release-1', createdAt: '2026-04-01T13:10:00Z', updatedAt: '2026-04-01T13:10:00Z' },
    { id: 'task-6', projectId: 'project-2', epochId: 'epoch-2', key: 'NOVA-88', title: 'Refine permission matrix', description: 'Align role access with portal rollout.', status: 'in-progress', priority: 'high', assigneeUserId: 'user-2', reporterUserId: 'user-4', dueDate: '2026-04-12', createdDate: '2026-04-02', releaseId: 'release-2', createdAt: '2026-04-02T08:00:00Z', updatedAt: '2026-04-02T08:25:00Z' },
    { id: 'task-7', projectId: 'project-2', epochId: 'epoch-2', key: 'NOVA-89', title: 'Backfill customer onboarding docs', description: 'Prepare rollout documentation for pilot customers.', status: 'todo', priority: 'medium', assigneeUserId: 'user-4', reporterUserId: 'user-4', dueDate: '2026-04-15', createdDate: '2026-04-02', releaseId: null, createdAt: '2026-04-02T08:05:00Z', updatedAt: '2026-04-02T08:05:00Z' },
    { id: 'task-8', projectId: 'project-3', epochId: 'epoch-3', key: 'HEL-7', title: 'Close migration checklist', description: 'Archive final runbook after production verification.', status: 'done', priority: 'medium', assigneeUserId: 'user-1', reporterUserId: 'user-4', dueDate: '2026-03-08', createdDate: '2026-02-25', releaseId: 'release-3', createdAt: '2026-02-25T09:00:00Z', updatedAt: '2026-03-10T14:20:00Z' }
  ]),
  taskTags: collection(TaskTagSchema, [
    { id: 'tag-1', taskId: 'task-1', value: 'backend', createdAt: '2026-04-01T09:12:00Z', updatedAt: '2026-04-01T09:12:00Z' },
    { id: 'tag-2', taskId: 'task-1', value: 'payments', createdAt: '2026-04-01T09:12:00Z', updatedAt: '2026-04-01T09:12:00Z' },
    { id: 'tag-3', taskId: 'task-2', value: 'integration', createdAt: '2026-04-01T10:10:00Z', updatedAt: '2026-04-01T10:10:00Z' },
    { id: 'tag-4', taskId: 'task-3', value: 'documentation', createdAt: '2026-04-01T11:20:00Z', updatedAt: '2026-04-01T11:20:00Z' },
    { id: 'tag-5', taskId: 'task-4', value: 'incident', createdAt: '2026-04-01T12:05:00Z', updatedAt: '2026-04-01T12:05:00Z' },
    { id: 'tag-6', taskId: 'task-4', value: 'webhooks', createdAt: '2026-04-01T12:05:00Z', updatedAt: '2026-04-01T12:05:00Z' },
    { id: 'tag-7', taskId: 'task-5', value: 'communication', createdAt: '2026-04-01T13:12:00Z', updatedAt: '2026-04-01T13:12:00Z' },
    { id: 'tag-8', taskId: 'task-6', value: 'permissions', createdAt: '2026-04-02T08:01:00Z', updatedAt: '2026-04-02T08:01:00Z' },
    { id: 'tag-9', taskId: 'task-6', value: 'security', createdAt: '2026-04-02T08:01:00Z', updatedAt: '2026-04-02T08:01:00Z' },
    { id: 'tag-10', taskId: 'task-7', value: 'docs', createdAt: '2026-04-02T08:06:00Z', updatedAt: '2026-04-02T08:06:00Z' },
    { id: 'tag-11', taskId: 'task-8', value: 'migration', createdAt: '2026-02-25T09:05:00Z', updatedAt: '2026-02-25T09:05:00Z' }
  ]),
  taskComments: collection(TaskCommentSchema, [
    { id: 'comment-1', taskId: 'task-1', authorUserId: 'user-1', content: 'Keep the sequence diagram in sync with the payment session implementation so docs stay reviewable.', createdAt: '2026-04-02T05:50:00Z', updatedAt: '2026-04-02T05:50:00Z' },
    { id: 'comment-2', taskId: 'task-1', authorUserId: 'user-2', content: 'Webhook state handling is implemented locally, but I still need PSP confirmation on retry semantics.', createdAt: '2026-04-02T06:35:00Z', updatedAt: '2026-04-02T06:35:00Z' },
    { id: 'comment-3', taskId: 'task-2', authorUserId: 'user-3', content: 'Tax fallback is merged. Waiting for someone to quote the approved doc section into the task before closing.', createdAt: '2026-04-02T06:25:00Z', updatedAt: '2026-04-02T06:25:00Z' },
    { id: 'comment-4', taskId: 'task-4', authorUserId: 'user-2', content: 'Customer-safe release brief should not mention the webhook mismatch until mitigation is confirmed.', createdAt: '2026-04-02T06:42:00Z', updatedAt: '2026-04-02T06:42:00Z' },
    { id: 'comment-5', taskId: 'task-6', authorUserId: 'user-4', content: 'Please align the permission matrix with the approved portal access document before moving to review.', createdAt: '2026-04-02T08:18:00Z', updatedAt: '2026-04-02T08:18:00Z' }
  ]),
  documentFolders: collection(DocumentFolderSchema, [
    { id: 'folder-1', projectId: 'project-1', children: ['doc-1', 'doc-3'], name: 'Architecture', sortOrder: 0, createdAt: '2026-03-29T09:00:00Z', updatedAt: '2026-04-01T09:00:00Z' },
    { id: 'folder-2', projectId: 'project-1', children: ['doc-2'], name: 'Customer Docs', sortOrder: 1, createdAt: '2026-03-30T09:00:00Z', updatedAt: '2026-04-01T09:00:00Z' },
    { id: 'folder-3', projectId: 'project-2', children: ['doc-4'], name: 'Portal Planning', sortOrder: 0, createdAt: '2026-03-31T09:00:00Z', updatedAt: '2026-03-31T09:00:00Z' },
    { id: 'folder-4', projectId: 'project-3', children: ['doc-5'], name: 'Archive', sortOrder: 0, createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-10T12:00:00Z' }
  ]),
  documents: collection(DocumentSchema, [
    { id: 'doc-1', projectId: 'project-1', folderId: 'folder-1', title: 'Checkout Architecture Overview', description: 'Architecture and delivery alignment for checkout MVP.', status: 'approved', accessScope: 'internal', authorUserId: 'user-1', currentVersionId: 'version-2', awaitingApproval: false, isStarred: true, archivedAt: null, createdAt: '2026-03-30T09:00:00Z', updatedAt: '2026-04-01T15:30:00Z' },
    { id: 'doc-2', projectId: 'project-1', folderId: 'folder-2', title: 'Customer Release Brief', description: 'Customer-safe summary of the checkout rollout.', status: 'in-review', accessScope: 'customer', authorUserId: 'user-1', currentVersionId: 'version-4', awaitingApproval: true, isStarred: false, archivedAt: null, createdAt: '2026-04-01T10:00:00Z', updatedAt: '2026-04-02T07:05:00Z' },
    { id: 'doc-3', projectId: 'project-1', folderId: 'folder-1', title: 'PSP Integration Runbook', description: 'Operational runbook for payment service provider incidents.', status: 'draft', accessScope: 'dev', authorUserId: 'user-3', currentVersionId: 'version-5', awaitingApproval: false, isStarred: false, archivedAt: null, createdAt: '2026-04-01T11:10:00Z', updatedAt: '2026-04-02T06:50:00Z' },
    { id: 'doc-4', projectId: 'project-2', folderId: 'folder-3', title: 'Portal Access Matrix', description: 'Portal role visibility and permission mapping.', status: 'approved', accessScope: 'internal', authorUserId: 'user-4', currentVersionId: 'version-6', awaitingApproval: false, isStarred: true, archivedAt: null, createdAt: '2026-03-31T09:00:00Z', updatedAt: '2026-04-01T16:40:00Z' },
    { id: 'doc-5', projectId: 'project-3', folderId: 'folder-4', title: 'Migration Closure Notes', description: 'Archived notes and final decisions from Helios Ops.', status: 'approved', accessScope: 'internal', authorUserId: 'user-1', currentVersionId: 'version-7', awaitingApproval: false, isStarred: false, archivedAt: null, createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-10T12:00:00Z' }
  ]),
  documentOwners: collection(DocumentOwnerSchema, [
    { id: 'owner-1', documentId: 'doc-1', userId: 'user-1', createdAt: '2026-03-30T09:00:00Z', updatedAt: '2026-03-30T09:00:00Z' },
    { id: 'owner-2', documentId: 'doc-1', userId: 'user-2', createdAt: '2026-03-30T09:05:00Z', updatedAt: '2026-03-30T09:05:00Z' },
    { id: 'owner-3', documentId: 'doc-2', userId: 'user-1', createdAt: '2026-04-01T10:00:00Z', updatedAt: '2026-04-01T10:00:00Z' },
    { id: 'owner-4', documentId: 'doc-3', userId: 'user-3', createdAt: '2026-04-01T11:10:00Z', updatedAt: '2026-04-01T11:10:00Z' },
    { id: 'owner-5', documentId: 'doc-4', userId: 'user-4', createdAt: '2026-03-31T09:00:00Z', updatedAt: '2026-03-31T09:00:00Z' },
    { id: 'owner-6', documentId: 'doc-5', userId: 'user-1', createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z' }
  ]),
  documentApprovers: collection(DocumentApproverSchema, [
    { id: 'approver-1', documentId: 'doc-1', userId: 'user-4', approved: true, createdAt: '2026-03-30T09:10:00Z', updatedAt: '2026-04-01T15:30:00Z' },
    { id: 'approver-2', documentId: 'doc-2', userId: 'user-4', approved: true, createdAt: '2026-04-01T10:05:00Z', updatedAt: '2026-04-02T06:55:00Z' },
    { id: 'approver-3', documentId: 'doc-2', userId: 'user-5', approved: false, createdAt: '2026-04-01T10:05:00Z', updatedAt: '2026-04-02T06:55:00Z' },
    { id: 'approver-4', documentId: 'doc-3', userId: 'user-2', approved: false, createdAt: '2026-04-01T11:30:00Z', updatedAt: '2026-04-01T11:30:00Z' },
    { id: 'approver-5', documentId: 'doc-4', userId: 'user-2', approved: true, createdAt: '2026-03-31T09:05:00Z', updatedAt: '2026-04-01T16:40:00Z' }
  ]),
  documentVersions: collection(DocumentVersionSchema, [
    { id: 'version-1', documentId: 'doc-1', versionLabel: '1.0', contentMarkdown: '# Checkout Architecture Overview\n\nInitial architecture baseline for checkout MVP.\n\n## Overview\n\n- Authentication gateway\n- Payment orchestration worker\n- Webhook verification pipeline', changeSource: 'manual', sourceDetail: null, authorUserId: 'user-1', additions: 18, deletions: 0, modifications: 0, status: 'approved', createdAt: '2026-03-30T09:00:00Z', updatedAt: '2026-03-30T09:00:00Z' },
    { id: 'version-2', documentId: 'doc-1', versionLabel: '1.1', contentMarkdown: '# Checkout Architecture Overview\n\nThis document aligns checkout architecture, task flow, and release readiness.\n\n## Overview\n\n- Authentication gateway\n- Payment orchestration worker\n- Webhook verification pipeline\n\n[TASK_WIDGET:task-1]\n\n## Meeting context\n\n[MEETING_SUMMARY:meeting-1]\n\n## Delivery\n\n[RELEASE_WIDGET:release-1]\n\n[PR_REFERENCE:pr-1]', changeSource: 'meeting', sourceDetail: 'Checkout architecture sync', authorUserId: 'user-2', additions: 14, deletions: 2, modifications: 7, status: 'approved', createdAt: '2026-04-01T15:30:00Z', updatedAt: '2026-04-01T15:30:00Z' },
    { id: 'version-3', documentId: 'doc-2', versionLabel: '0.9', contentMarkdown: '# Customer Release Brief\n\nCustomer-safe summary of the April checkout rollout.\n\n## Scope\n\n- Payment session reliability\n- Tax fallback hardening\n- Release communications', changeSource: 'manual', sourceDetail: null, authorUserId: 'user-1', additions: 11, deletions: 0, modifications: 0, status: 'approved', createdAt: '2026-04-01T10:00:00Z', updatedAt: '2026-04-01T10:00:00Z' },
    { id: 'version-4', documentId: 'doc-2', versionLabel: '1.0', contentMarkdown: '# Customer Release Brief\n\nCustomer-safe summary of the checkout rollout.\n\n## Scope\n\n- Payment session reliability\n- Tax fallback hardening\n- Release communications\n\n## Sprint context\n\n[TASK_WIDGET:task-2]\n\n## Review checkpoint\n\n[MEETING_SUMMARY:meeting-3]\n\n## Delivery package\n\n[RELEASE_WIDGET:release-1]', changeSource: 'task', sourceDetail: 'ATL-102 review handoff', authorUserId: 'user-1', additions: 9, deletions: 1, modifications: 5, status: 'pending-approval', createdAt: '2026-04-02T07:05:00Z', updatedAt: '2026-04-02T07:05:00Z' },
    { id: 'version-5', documentId: 'doc-3', versionLabel: '0.5', contentMarkdown: '# PSP Integration Runbook\n\nDraft operational runbook for payment service provider incidents.\n\n## Active issue\n\n[TASK_WIDGET:task-4]\n\n## Response steps\n\n- Validate webhook signature inputs\n- Confirm PSP retry contract\n- Notify release owner if incident blocks launch', changeSource: 'manual', sourceDetail: null, authorUserId: 'user-3', additions: 15, deletions: 0, modifications: 1, status: 'draft', createdAt: '2026-04-02T06:50:00Z', updatedAt: '2026-04-02T06:50:00Z' },
    { id: 'version-6', documentId: 'doc-4', versionLabel: '2.1', contentMarkdown: '# Portal Access Matrix\n\nApproved permission model for rollout.\n\n## Roles\n\n- Customer\n- Manager\n- Developer\n- Internal support', changeSource: 'manual', sourceDetail: null, authorUserId: 'user-4', additions: 6, deletions: 1, modifications: 3, status: 'approved', createdAt: '2026-04-01T16:40:00Z', updatedAt: '2026-04-01T16:40:00Z' },
    { id: 'version-7', documentId: 'doc-5', versionLabel: '3.0', contentMarkdown: '# Migration Closure Notes\n\nFinal archived notes for Helios Ops.\n\n## Outcome\n\n- Migration shipped successfully\n- Runbook archived\n- Follow-up decisions captured', changeSource: 'imported', sourceDetail: 'Closure retrospective archive', authorUserId: 'user-1', additions: 4, deletions: 0, modifications: 0, status: 'approved', createdAt: '2026-03-10T12:00:00Z', updatedAt: '2026-03-10T12:00:00Z' }
  ]),
  documentApprovals: collection(DocumentApprovalSchema, [
    { id: 'doc-approval-1', documentVersionId: 'version-2', approverUserId: 'user-4', status: 'approved', decision: 'approved', rationale: 'Architecture and release trace are clear and internally complete.', decidedAt: '2026-04-01T15:32:00Z', createdAt: '2026-04-01T15:31:00Z', updatedAt: '2026-04-01T15:32:00Z' },
    { id: 'doc-approval-2', documentVersionId: 'version-4', approverUserId: 'user-4', status: 'approved', decision: 'approved', rationale: 'Manager view is ready. Waiting on customer-safe sign-off.', decidedAt: '2026-04-02T06:58:00Z', createdAt: '2026-04-02T06:56:00Z', updatedAt: '2026-04-02T06:58:00Z' },
    { id: 'doc-approval-3', documentVersionId: 'version-4', approverUserId: 'user-5', status: 'pending', decision: null, rationale: null, decidedAt: null, createdAt: '2026-04-02T06:56:00Z', updatedAt: '2026-04-02T06:56:00Z' }
  ]),
  documentComments: collection(DocumentCommentSchema, [
    { id: 'doc-comment-1', documentId: 'doc-1', authorUserId: 'user-4', content: 'Please keep the meeting summary widget in sync with the latest architecture sync notes.', resolved: true, createdAt: '2026-04-01T15:20:00Z', updatedAt: '2026-04-01T15:35:00Z' },
    { id: 'doc-comment-2', documentId: 'doc-2', authorUserId: 'user-5', content: 'Customer messaging looks good, but I still want to verify the release scope before approving.', resolved: false, createdAt: '2026-04-02T07:02:00Z', updatedAt: '2026-04-02T07:02:00Z' },
    { id: 'doc-comment-3', documentId: 'doc-2', authorUserId: 'user-1', content: 'Quoted the release summary into the task thread so delivery and docs stay aligned.', resolved: false, createdAt: '2026-04-02T07:04:00Z', updatedAt: '2026-04-02T07:04:00Z' },
    { id: 'doc-comment-4', documentId: 'doc-3', authorUserId: 'user-2', content: 'Add remediation steps for webhook signature mismatch before sending for approval.', resolved: false, createdAt: '2026-04-02T06:55:00Z', updatedAt: '2026-04-02T06:55:00Z' }
  ]),
  documentLinks: collection(DocumentLinkSchema, [
    { id: 'dl-1', documentId: 'doc-1', entityType: 'epoch', entityId: 'epoch-1', createdAt: '2026-03-30T09:10:00Z', updatedAt: '2026-03-30T09:10:00Z' },
    { id: 'dl-2', documentId: 'doc-1', entityType: 'task', entityId: 'task-1', createdAt: '2026-03-30T09:10:00Z', updatedAt: '2026-03-30T09:10:00Z' },
    { id: 'dl-3', documentId: 'doc-2', entityType: 'release', entityId: 'release-1', createdAt: '2026-04-01T10:00:00Z', updatedAt: '2026-04-01T10:00:00Z' },
    { id: 'dl-4', documentId: 'doc-2', entityType: 'epoch', entityId: 'epoch-1', createdAt: '2026-04-01T10:00:00Z', updatedAt: '2026-04-01T10:00:00Z' },
    { id: 'dl-5', documentId: 'doc-3', entityType: 'task', entityId: 'task-4', createdAt: '2026-04-01T11:20:00Z', updatedAt: '2026-04-01T11:20:00Z' },
    { id: 'dl-6', documentId: 'doc-4', entityType: 'epoch', entityId: 'epoch-2', createdAt: '2026-03-31T09:10:00Z', updatedAt: '2026-03-31T09:10:00Z' },
    { id: 'dl-7', documentId: 'doc-5', entityType: 'project', entityId: 'project-3', createdAt: '2026-03-01T09:10:00Z', updatedAt: '2026-03-01T09:10:00Z' }
  ]),
  meetings: collection(MeetingSchema, [
    { id: 'meeting-1', projectId: 'project-1', epochId: 'epoch-1', sourceContextType: 'task', sourceContextId: 'task-1', title: 'Checkout architecture sync', description: 'Align backend orchestration and rollout plan.', type: 'review', status: 'completed', startsAt: '2026-04-01T13:00:00Z', endsAt: '2026-04-01T13:45:00Z', recordingUrl: null, recordingDurationSec: 2700, aiSummaryApproved: true, createdAt: '2026-04-01T11:30:00Z', updatedAt: '2026-04-01T14:10:00Z' },
    { id: 'meeting-2', projectId: 'project-1', epochId: 'epoch-1', sourceContextType: 'epoch', sourceContextId: 'epoch-1', title: 'Sprint planning', description: 'Weekly epoch planning and blockers review.', type: 'planning', status: 'scheduled', startsAt: '2026-04-03T09:00:00Z', endsAt: '2026-04-03T10:00:00Z', recordingUrl: null, recordingDurationSec: null, aiSummaryApproved: false, createdAt: '2026-04-02T06:30:00Z', updatedAt: '2026-04-02T06:30:00Z' },
    { id: 'meeting-3', projectId: 'project-1', epochId: 'epoch-1', sourceContextType: 'doc', sourceContextId: 'doc-2', title: 'Customer release review', description: 'Review release narrative and customer-safe messaging.', type: 'review', status: 'scheduled', startsAt: '2026-04-04T15:00:00Z', endsAt: '2026-04-04T15:30:00Z', recordingUrl: null, recordingDurationSec: null, aiSummaryApproved: false, createdAt: '2026-04-02T07:00:00Z', updatedAt: '2026-04-02T07:00:00Z' },
    { id: 'meeting-4', projectId: 'project-2', epochId: 'epoch-2', sourceContextType: 'epoch', sourceContextId: 'epoch-2', title: 'Portal rollout workshop', description: 'Coordinate release blockers and customer rollout.', type: 'workshop', status: 'scheduled', startsAt: '2026-04-05T10:00:00Z', endsAt: '2026-04-05T11:30:00Z', recordingUrl: null, recordingDurationSec: null, aiSummaryApproved: false, createdAt: '2026-04-01T16:45:00Z', updatedAt: '2026-04-01T16:45:00Z' },
    { id: 'meeting-5', projectId: 'project-3', epochId: 'epoch-3', sourceContextType: 'project', sourceContextId: 'project-3', title: 'Migration closure retro', description: 'Close the migration program and archive follow-up decisions.', type: 'retrospective', status: 'completed', startsAt: '2026-03-09T14:00:00Z', endsAt: '2026-03-09T15:00:00Z', recordingUrl: null, recordingDurationSec: 3600, aiSummaryApproved: true, createdAt: '2026-03-05T12:00:00Z', updatedAt: '2026-03-09T16:00:00Z' }
  ]),
  meetingParticipants: collection(MeetingParticipantSchema, [
    { id: 'meeting-participant-1', meetingId: 'meeting-1', userId: 'user-1', roleLabel: 'Delivery lead', attended: true, createdAt: '2026-04-01T11:35:00Z', updatedAt: '2026-04-01T14:10:00Z' },
    { id: 'meeting-participant-2', meetingId: 'meeting-1', userId: 'user-2', roleLabel: 'Backend owner', attended: true, createdAt: '2026-04-01T11:35:00Z', updatedAt: '2026-04-01T14:10:00Z' },
    { id: 'meeting-participant-3', meetingId: 'meeting-1', userId: 'user-3', roleLabel: 'Integration owner', attended: true, createdAt: '2026-04-01T11:35:00Z', updatedAt: '2026-04-01T14:10:00Z' },
    { id: 'meeting-participant-4', meetingId: 'meeting-2', userId: 'user-1', roleLabel: 'Sprint lead', attended: false, createdAt: '2026-04-02T06:32:00Z', updatedAt: '2026-04-02T06:32:00Z' },
    { id: 'meeting-participant-5', meetingId: 'meeting-2', userId: 'user-2', roleLabel: 'Tech lead', attended: false, createdAt: '2026-04-02T06:32:00Z', updatedAt: '2026-04-02T06:32:00Z' },
    { id: 'meeting-participant-6', meetingId: 'meeting-2', userId: 'user-3', roleLabel: 'Backend owner', attended: false, createdAt: '2026-04-02T06:32:00Z', updatedAt: '2026-04-02T06:32:00Z' },
    { id: 'meeting-participant-7', meetingId: 'meeting-2', userId: 'user-5', roleLabel: 'Customer stakeholder', attended: false, createdAt: '2026-04-02T06:32:00Z', updatedAt: '2026-04-02T06:32:00Z' },
    { id: 'meeting-participant-8', meetingId: 'meeting-3', userId: 'user-1', roleLabel: 'Document owner', attended: false, createdAt: '2026-04-02T07:02:00Z', updatedAt: '2026-04-02T07:02:00Z' },
    { id: 'meeting-participant-9', meetingId: 'meeting-3', userId: 'user-4', roleLabel: 'Manager reviewer', attended: false, createdAt: '2026-04-02T07:02:00Z', updatedAt: '2026-04-02T07:02:00Z' },
    { id: 'meeting-participant-10', meetingId: 'meeting-3', userId: 'user-5', roleLabel: 'Customer approver', attended: false, createdAt: '2026-04-02T07:02:00Z', updatedAt: '2026-04-02T07:02:00Z' },
    { id: 'meeting-participant-11', meetingId: 'meeting-4', userId: 'user-2', roleLabel: 'Security owner', attended: false, createdAt: '2026-04-01T16:50:00Z', updatedAt: '2026-04-01T16:50:00Z' },
    { id: 'meeting-participant-12', meetingId: 'meeting-4', userId: 'user-3', roleLabel: 'Platform engineer', attended: false, createdAt: '2026-04-01T16:50:00Z', updatedAt: '2026-04-01T16:50:00Z' },
    { id: 'meeting-participant-13', meetingId: 'meeting-4', userId: 'user-4', roleLabel: 'Program manager', attended: false, createdAt: '2026-04-01T16:50:00Z', updatedAt: '2026-04-01T16:50:00Z' },
    { id: 'meeting-participant-14', meetingId: 'meeting-5', userId: 'user-1', roleLabel: 'Program owner', attended: true, createdAt: '2026-03-05T12:05:00Z', updatedAt: '2026-03-09T16:00:00Z' },
    { id: 'meeting-participant-15', meetingId: 'meeting-5', userId: 'user-4', roleLabel: 'Operations manager', attended: true, createdAt: '2026-03-05T12:05:00Z', updatedAt: '2026-03-09T16:00:00Z' }
  ]),
  meetingAvailabilitySlots: collection(MeetingAvailabilitySlotSchema, [
    { id: 'meeting-slot-1', meetingId: 'meeting-2', startsAt: '2026-04-03T09:00:00Z', endsAt: '2026-04-03T10:00:00Z', score: 10, createdAt: '2026-04-02T06:35:00Z', updatedAt: '2026-04-02T06:35:00Z' },
    { id: 'meeting-slot-2', meetingId: 'meeting-2', startsAt: '2026-04-03T13:00:00Z', endsAt: '2026-04-03T14:00:00Z', score: 7, createdAt: '2026-04-02T06:35:00Z', updatedAt: '2026-04-02T06:35:00Z' },
    { id: 'meeting-slot-3', meetingId: 'meeting-2', startsAt: '2026-04-04T10:00:00Z', endsAt: '2026-04-04T11:00:00Z', score: 8, createdAt: '2026-04-02T06:36:00Z', updatedAt: '2026-04-02T06:36:00Z' },
    { id: 'meeting-slot-4', meetingId: 'meeting-3', startsAt: '2026-04-04T15:00:00Z', endsAt: '2026-04-04T15:30:00Z', score: 7, createdAt: '2026-04-02T07:03:00Z', updatedAt: '2026-04-02T07:03:00Z' },
    { id: 'meeting-slot-5', meetingId: 'meeting-3', startsAt: '2026-04-04T16:00:00Z', endsAt: '2026-04-04T16:30:00Z', score: 4, createdAt: '2026-04-02T07:03:00Z', updatedAt: '2026-04-02T07:03:00Z' },
    { id: 'meeting-slot-6', meetingId: 'meeting-4', startsAt: '2026-04-05T10:00:00Z', endsAt: '2026-04-05T11:30:00Z', score: 7, createdAt: '2026-04-01T16:52:00Z', updatedAt: '2026-04-01T16:52:00Z' },
    { id: 'meeting-slot-7', meetingId: 'meeting-4', startsAt: '2026-04-05T13:00:00Z', endsAt: '2026-04-05T14:30:00Z', score: 5, createdAt: '2026-04-01T16:52:00Z', updatedAt: '2026-04-01T16:52:00Z' }
  ]),
  meetingAvailabilityVotes: collection(MeetingAvailabilityVoteSchema, [
    { id: 'meeting-vote-1', slotId: 'meeting-slot-1', participantUserId: 'user-1', status: 'available', createdAt: '2026-04-02T06:36:00Z', updatedAt: '2026-04-02T06:36:00Z' },
    { id: 'meeting-vote-2', slotId: 'meeting-slot-1', participantUserId: 'user-2', status: 'available', createdAt: '2026-04-02T06:36:00Z', updatedAt: '2026-04-02T06:36:00Z' },
    { id: 'meeting-vote-3', slotId: 'meeting-slot-1', participantUserId: 'user-3', status: 'available', createdAt: '2026-04-02T06:36:00Z', updatedAt: '2026-04-02T06:36:00Z' },
    { id: 'meeting-vote-4', slotId: 'meeting-slot-1', participantUserId: 'user-5', status: 'maybe', createdAt: '2026-04-02T06:36:00Z', updatedAt: '2026-04-02T06:36:00Z' },
    { id: 'meeting-vote-5', slotId: 'meeting-slot-2', participantUserId: 'user-1', status: 'available', createdAt: '2026-04-02T06:36:00Z', updatedAt: '2026-04-02T06:36:00Z' },
    { id: 'meeting-vote-6', slotId: 'meeting-slot-2', participantUserId: 'user-2', status: 'maybe', createdAt: '2026-04-02T06:36:00Z', updatedAt: '2026-04-02T06:36:00Z' },
    { id: 'meeting-vote-7', slotId: 'meeting-slot-2', participantUserId: 'user-3', status: 'available', createdAt: '2026-04-02T06:36:00Z', updatedAt: '2026-04-02T06:36:00Z' },
    { id: 'meeting-vote-8', slotId: 'meeting-slot-2', participantUserId: 'user-5', status: 'no-response', createdAt: '2026-04-02T06:36:00Z', updatedAt: '2026-04-02T06:36:00Z' },
    { id: 'meeting-vote-9', slotId: 'meeting-slot-3', participantUserId: 'user-1', status: 'available', createdAt: '2026-04-02T06:37:00Z', updatedAt: '2026-04-02T06:37:00Z' },
    { id: 'meeting-vote-10', slotId: 'meeting-slot-3', participantUserId: 'user-2', status: 'available', createdAt: '2026-04-02T06:37:00Z', updatedAt: '2026-04-02T06:37:00Z' },
    { id: 'meeting-vote-11', slotId: 'meeting-slot-3', participantUserId: 'user-3', status: 'maybe', createdAt: '2026-04-02T06:37:00Z', updatedAt: '2026-04-02T06:37:00Z' },
    { id: 'meeting-vote-12', slotId: 'meeting-slot-3', participantUserId: 'user-5', status: 'no-response', createdAt: '2026-04-02T06:37:00Z', updatedAt: '2026-04-02T06:37:00Z' },
    { id: 'meeting-vote-13', slotId: 'meeting-slot-4', participantUserId: 'user-1', status: 'available', createdAt: '2026-04-02T07:04:00Z', updatedAt: '2026-04-02T07:04:00Z' },
    { id: 'meeting-vote-14', slotId: 'meeting-slot-4', participantUserId: 'user-4', status: 'available', createdAt: '2026-04-02T07:04:00Z', updatedAt: '2026-04-02T07:04:00Z' },
    { id: 'meeting-vote-15', slotId: 'meeting-slot-4', participantUserId: 'user-5', status: 'maybe', createdAt: '2026-04-02T07:04:00Z', updatedAt: '2026-04-02T07:04:00Z' },
    { id: 'meeting-vote-16', slotId: 'meeting-slot-5', participantUserId: 'user-1', status: 'available', createdAt: '2026-04-02T07:04:00Z', updatedAt: '2026-04-02T07:04:00Z' },
    { id: 'meeting-vote-17', slotId: 'meeting-slot-5', participantUserId: 'user-4', status: 'no-response', createdAt: '2026-04-02T07:04:00Z', updatedAt: '2026-04-02T07:04:00Z' },
    { id: 'meeting-vote-18', slotId: 'meeting-slot-5', participantUserId: 'user-5', status: 'maybe', createdAt: '2026-04-02T07:04:00Z', updatedAt: '2026-04-02T07:04:00Z' },
    { id: 'meeting-vote-19', slotId: 'meeting-slot-6', participantUserId: 'user-2', status: 'available', createdAt: '2026-04-01T16:53:00Z', updatedAt: '2026-04-01T16:53:00Z' },
    { id: 'meeting-vote-20', slotId: 'meeting-slot-6', participantUserId: 'user-3', status: 'maybe', createdAt: '2026-04-01T16:53:00Z', updatedAt: '2026-04-01T16:53:00Z' },
    { id: 'meeting-vote-21', slotId: 'meeting-slot-6', participantUserId: 'user-4', status: 'available', createdAt: '2026-04-01T16:53:00Z', updatedAt: '2026-04-01T16:53:00Z' },
    { id: 'meeting-vote-22', slotId: 'meeting-slot-7', participantUserId: 'user-2', status: 'available', createdAt: '2026-04-01T16:53:00Z', updatedAt: '2026-04-01T16:53:00Z' },
    { id: 'meeting-vote-23', slotId: 'meeting-slot-7', participantUserId: 'user-3', status: 'unavailable', createdAt: '2026-04-01T16:53:00Z', updatedAt: '2026-04-01T16:53:00Z' },
    { id: 'meeting-vote-24', slotId: 'meeting-slot-7', participantUserId: 'user-4', status: 'maybe', createdAt: '2026-04-01T16:53:00Z', updatedAt: '2026-04-01T16:53:00Z' }
  ]),
  meetingTranscriptEntries: collection(MeetingTranscriptEntrySchema, [
    { id: 'meeting-transcript-1', meetingId: 'meeting-1', speakerUserId: 'user-1', speakerName: 'Alex Johnson', startsAtSec: 0, text: 'Let us align the checkout architecture and confirm what still blocks the release path.', createdAt: '2026-04-01T13:02:00Z', updatedAt: '2026-04-01T13:02:00Z' },
    { id: 'meeting-transcript-2', meetingId: 'meeting-1', speakerUserId: 'user-2', speakerName: 'Sarah Chen', startsAtSec: 75, text: 'The orchestration worker is ready, but the webhook retry contract still needs confirmation from the PSP team.', createdAt: '2026-04-01T13:03:15Z', updatedAt: '2026-04-01T13:03:15Z' },
    { id: 'meeting-transcript-3', meetingId: 'meeting-1', speakerUserId: 'user-3', speakerName: 'Michael Brown', startsAtSec: 180, text: 'We should capture the mitigation path in the runbook and keep the customer release brief narrowly scoped.', createdAt: '2026-04-01T13:05:00Z', updatedAt: '2026-04-01T13:05:00Z' },
    { id: 'meeting-transcript-4', meetingId: 'meeting-1', speakerUserId: 'user-1', speakerName: 'Alex Johnson', startsAtSec: 290, text: 'I will update the architecture doc with the meeting summary and link the task before review moves forward.', createdAt: '2026-04-01T13:06:50Z', updatedAt: '2026-04-01T13:06:50Z' },
    { id: 'meeting-transcript-5', meetingId: 'meeting-5', speakerUserId: 'user-1', speakerName: 'Alex Johnson', startsAtSec: 0, text: 'The migration is stable in production, so this retro is mainly about closure and archival decisions.', createdAt: '2026-03-09T14:02:00Z', updatedAt: '2026-03-09T14:02:00Z' },
    { id: 'meeting-transcript-6', meetingId: 'meeting-5', speakerUserId: 'user-4', speakerName: 'Emily Davis', startsAtSec: 130, text: 'We should preserve the final runbook and closure notes because future teams will reuse the same operational pattern.', createdAt: '2026-03-09T14:04:10Z', updatedAt: '2026-03-09T14:04:10Z' }
  ]),
  meetingDecisions: collection(MeetingDecisionSchema, [
    { id: 'meeting-decision-1', meetingId: 'meeting-1', decision: 'Keep the release brief customer-safe and isolate PSP incident detail in internal docs only.', userId: 'user-1', createdAt: '2026-04-01T13:36:00Z', updatedAt: '2026-04-01T13:36:00Z' },
    { id: 'meeting-decision-2', meetingId: 'meeting-1', decision: 'Attach architecture sync outcomes to the checkout task before sign-off.', userId: 'user-2', createdAt: '2026-04-01T13:38:00Z', updatedAt: '2026-04-01T13:38:00Z' },
    { id: 'meeting-decision-3', meetingId: 'meeting-5', decision: 'Archive the migration runbook together with closure notes for future reference.', userId: 'user-4', createdAt: '2026-03-09T14:42:00Z', updatedAt: '2026-03-09T14:42:00Z' }
  ]),
  meetingActionItems: collection(MeetingActionItemSchema, [
    { id: 'meeting-action-1', meetingId: 'meeting-1', taskId: 'task-1', taskText: 'Update checkout architecture with orchestration and retry notes', assigneeUserId: 'user-2', dueDate: '2026-04-02', priority: 'high', createdAt: '2026-04-01T13:40:00Z', updatedAt: '2026-04-01T13:40:00Z' },
    { id: 'meeting-action-2', meetingId: 'meeting-1', taskId: 'task-4', taskText: 'Add webhook mitigation steps to the PSP runbook', assigneeUserId: 'user-3', dueDate: '2026-04-03', priority: 'critical', createdAt: '2026-04-01T13:41:00Z', updatedAt: '2026-04-01T13:41:00Z' },
    { id: 'meeting-action-3', meetingId: 'meeting-3', taskId: null, taskText: 'Capture customer sign-off notes in the release brief after review', assigneeUserId: 'user-1', dueDate: '2026-04-04', priority: 'medium', createdAt: '2026-04-02T07:08:00Z', updatedAt: '2026-04-02T07:08:00Z' },
    { id: 'meeting-action-4', meetingId: 'meeting-5', taskId: 'task-8', taskText: 'Archive migration checklist and link closure notes', assigneeUserId: 'user-1', dueDate: '2026-03-10', priority: 'medium', createdAt: '2026-03-09T14:45:00Z', updatedAt: '2026-03-09T14:45:00Z' }
  ]),
  meetingLinkedDocuments: collection(MeetingLinkedDocumentSchema, [
    { id: 'meeting-doc-1', meetingId: 'meeting-1', documentId: 'doc-1', updateSuggestion: 'Record the approved orchestration flow and meeting rationale in the architecture overview.', createdAt: '2026-04-01T13:42:00Z', updatedAt: '2026-04-01T13:42:00Z' },
    { id: 'meeting-doc-2', meetingId: 'meeting-1', documentId: 'doc-3', updateSuggestion: 'Add the webhook mismatch mitigation sequence before the runbook goes to review.', createdAt: '2026-04-01T13:42:00Z', updatedAt: '2026-04-01T13:42:00Z' },
    { id: 'meeting-doc-3', meetingId: 'meeting-3', documentId: 'doc-2', updateSuggestion: 'Attach customer-safe sign-off language after the review call concludes.', createdAt: '2026-04-02T07:09:00Z', updatedAt: '2026-04-02T07:09:00Z' },
    { id: 'meeting-doc-4', meetingId: 'meeting-4', documentId: 'doc-4', updateSuggestion: 'Reflect final permission trade-offs and rollout guardrails in the access matrix.', createdAt: '2026-04-01T16:55:00Z', updatedAt: '2026-04-01T16:55:00Z' },
    { id: 'meeting-doc-5', meetingId: 'meeting-5', documentId: 'doc-5', updateSuggestion: 'Persist the closure retro summary into the archived migration notes.', createdAt: '2026-03-09T14:46:00Z', updatedAt: '2026-03-09T14:46:00Z' }
  ]),
  releases: collection(ReleaseSchema, [
    { id: 'release-1', projectId: 'project-1', version: 'v2.1.0', title: 'Checkout MVP release', status: 'in-progress', targetDate: '2026-04-30', deployedAt: null, commitsCount: 27, authorUserId: 'user-1', createdAt: '2026-03-31T10:00:00Z', updatedAt: '2026-04-02T07:10:00Z' },
    { id: 'release-2', projectId: 'project-2', version: 'v1.8.2', title: 'Portal stabilization release', status: 'planned', targetDate: '2026-04-24', deployedAt: null, commitsCount: 12, authorUserId: 'user-4', createdAt: '2026-03-31T13:00:00Z', updatedAt: '2026-04-01T17:20:00Z' },
    { id: 'release-3', projectId: 'project-3', version: 'v3.0.0', title: 'Migration final release', status: 'deployed', targetDate: '2026-03-10', deployedAt: '2026-03-10T10:30:00Z', commitsCount: 41, authorUserId: 'user-1', createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-03-10T10:30:00Z' }
  ]),
  pullRequests: collection(PullRequestSchema, [
    { id: 'pr-1', projectId: 'project-1', releaseId: 'release-1', number: 142, title: 'feat: orchestrate checkout payment sessions', branch: 'feature/atl-101-payment-session', status: 'reviewing', authorUserId: 'user-2', commitsCount: 9, externalUrl: null, mergedAt: null, createdAt: '2026-04-02T05:20:00Z', updatedAt: '2026-04-02T07:25:00Z' },
    { id: 'pr-2', projectId: 'project-1', releaseId: 'release-1', number: 141, title: 'fix: tax calculation fallback edge cases', branch: 'fix/atl-102-tax-fallback', status: 'merged', authorUserId: 'user-3', commitsCount: 4, externalUrl: null, mergedAt: '2026-04-02T06:20:00Z', createdAt: '2026-04-01T15:00:00Z', updatedAt: '2026-04-02T06:20:00Z' },
    { id: 'pr-3', projectId: 'project-2', releaseId: 'release-2', number: 98, title: 'feat: permission matrix enforcement', branch: 'feature/nova-88-permissions', status: 'open', authorUserId: 'user-2', commitsCount: 6, externalUrl: null, mergedAt: null, createdAt: '2026-04-02T08:15:00Z', updatedAt: '2026-04-02T08:15:00Z' },
    { id: 'pr-4', projectId: 'project-3', releaseId: 'release-3', number: 77, title: 'chore: archive migration runbook', branch: 'chore/helios-archive-runbook', status: 'merged', authorUserId: 'user-1', commitsCount: 3, externalUrl: null, mergedAt: '2026-03-10T09:45:00Z', createdAt: '2026-03-08T08:00:00Z', updatedAt: '2026-03-10T09:45:00Z' }
  ]),
  notifications: collection(NotificationSchema, [
    {
      id: 'notification-1',
      userId: 'user-1',
      actorUserId: 'user-4',
      title: 'Document approval waiting on customer sign-off',
      description: 'Customer Release Brief is still pending final approval after manager review.',
      entityType: 'document',
      entityId: 'doc-2',
      readAt: null,
      createdAt: '2026-04-02T07:06:00Z',
      updatedAt: '2026-04-02T07:06:00Z'
    },
    {
      id: 'notification-2',
      userId: 'user-1',
      actorUserId: 'user-5',
      title: 'Meeting vote request for customer release review',
      description: 'Select availability for the review linked to the customer release brief.',
      entityType: 'meeting',
      entityId: 'meeting-3',
      readAt: null,
      createdAt: '2026-04-02T07:07:00Z',
      updatedAt: '2026-04-02T07:07:00Z'
    },
    {
      id: 'notification-3',
      userId: 'user-1',
      actorUserId: 'user-3',
      title: 'PR merged into checkout release package',
      description: '#141 tax fallback fix was merged and is now part of release v2.1.0.',
      entityType: 'pull-request',
      entityId: 'pr-2',
      readAt: null,
      createdAt: '2026-04-02T06:21:00Z',
      updatedAt: '2026-04-02T06:21:00Z'
    },
    {
      id: 'notification-4',
      userId: 'user-1',
      actorUserId: 'user-2',
      title: 'Mention in checkout task discussion',
      description: 'Quoted delivery context into ATL-101 and requested doc sync before sign-off.',
      entityType: 'task',
      entityId: 'task-1',
      readAt: '2026-04-02T06:00:00Z',
      createdAt: '2026-04-02T05:58:00Z',
      updatedAt: '2026-04-02T06:00:00Z'
    },
    {
      id: 'notification-5',
      userId: 'user-1',
      actorUserId: 'user-1',
      title: 'Release status changed to in progress',
      description: 'Checkout MVP release is now actively moving toward deployment.',
      entityType: 'release',
      entityId: 'release-1',
      readAt: '2026-04-02T07:12:00Z',
      createdAt: '2026-04-02T07:10:00Z',
      updatedAt: '2026-04-02T07:12:00Z'
    },
    {
      id: 'notification-6',
      userId: 'user-1',
      actorUserId: 'user-2',
      title: 'Meeting summary approved for document history',
      description: 'Checkout architecture sync recap is now safe to attach to linked document versions.',
      entityType: 'meeting',
      entityId: 'meeting-1',
      readAt: '2026-04-02T07:35:00Z',
      createdAt: '2026-04-02T07:30:00Z',
      updatedAt: '2026-04-02T07:35:00Z'
    }
  ])
}

export type SeamlessMockDb = {
  users: User[]
  projects: Project[]
  projectMembers: ProjectMember[]
  epochs: Epoch[]
  goals: Goal[]
  tasks: Task[]
  taskTags: TaskTag[]
  taskComments: TaskComment[]
  documentFolders: DocumentFolder[]
  documents: Document[]
  documentOwners: DocumentOwner[]
  documentApprovers: DocumentApprover[]
  documentVersions: DocumentVersion[]
  documentApprovals: DocumentApproval[]
  documentComments: DocumentComment[]
  documentLinks: DocumentLink[]
  meetings: Meeting[]
  meetingParticipants: MeetingParticipant[]
  meetingAvailabilitySlots: MeetingAvailabilitySlot[]
  meetingAvailabilityVotes: MeetingAvailabilityVote[]
  meetingTranscriptEntries: MeetingTranscriptEntry[]
  meetingDecisions: MeetingDecision[]
  meetingActionItems: MeetingActionItem[]
  meetingLinkedDocuments: MeetingLinkedDocument[]
  releases: Release[]
  pullRequests: PullRequest[]
  notifications: Notification[]
}

function nowIsoDateTime() {
  return new Date().toISOString()
}

function computeMeetingSlotScore(slotId: string) {
  const voteWeight: Record<VoteStatus, number> = {
    available: 3,
    maybe: 1,
    unavailable: 0,
    'no-response': 0
  }

  return seamlessMockDb.meetingAvailabilityVotes
    .filter((entry) => entry.slotId === slotId)
    .reduce((sum, entry) => sum + voteWeight[entry.status as VoteStatus], 0)
}

export async function updateMockTaskStatus(taskId: string, status: Task['status']) {
  const task = seamlessMockDb.tasks.find((entry) => entry.id === taskId)

  if (!task) {
    return withMockLatency(null)
  }

  task.status = status
  task.updatedAt = nowIsoDateTime()

  return withMockLatency(task)
}

export async function createMockTaskComment(taskId: string, authorUserId: string, content: string) {
  const task = seamlessMockDb.tasks.find((entry) => entry.id === taskId)

  if (!task) {
    return withMockLatency(null)
  }

  const createdAt = nowIsoDateTime()
  const comment = TaskCommentSchema.parse({
    id: `comment-${seamlessMockDb.taskComments.length + 1}`,
    taskId,
    authorUserId,
    content,
    createdAt,
    updatedAt: createdAt
  })

  seamlessMockDb.taskComments.unshift(comment)
  task.updatedAt = createdAt

  return withMockLatency(comment)
}

export async function updateMockDocumentStatus(documentId: string, status: Document['status']) {
  const document = seamlessMockDb.documents.find((entry) => entry.id === documentId)
  const currentVersion = seamlessMockDb.documentVersions.find((entry) => entry.documentId === documentId && entry.id === document?.currentVersionId)

  if (!document) {
    return withMockLatency(null)
  }

  document.status = status
  document.awaitingApproval = status === 'in-review'
  document.updatedAt = nowIsoDateTime()

  if (currentVersion) {
    currentVersion.status = status === 'in-review' ? 'pending-approval' : status
    currentVersion.updatedAt = document.updatedAt
  }

  return withMockLatency(document)
}

export async function createMockDocumentComment(documentId: string, authorUserId: string, content: string) {
  const document = seamlessMockDb.documents.find((entry) => entry.id === documentId)

  if (!document) {
    return withMockLatency(null)
  }

  const createdAt = nowIsoDateTime()
  const comment = DocumentCommentSchema.parse({
    id: `doc-comment-${seamlessMockDb.documentComments.length + 1}`,
    documentId,
    authorUserId,
    content,
    resolved: false,
    createdAt,
    updatedAt: createdAt
  })

  seamlessMockDb.documentComments.unshift(comment)
  document.updatedAt = createdAt

  return withMockLatency(comment)
}

export async function updateMockMeetingVote(slotId: string, participantUserId: string, status: VoteStatus) {
  const slot = seamlessMockDb.meetingAvailabilitySlots.find((entry) => entry.id === slotId)

  if (!slot) {
    return withMockLatency(null)
  }

  const meeting = seamlessMockDb.meetings.find((entry) => entry.id === slot.meetingId)
  const existingVote = seamlessMockDb.meetingAvailabilityVotes.find(
    (entry) => entry.slotId === slotId && entry.participantUserId === participantUserId
  )
  const updatedAt = nowIsoDateTime()

  if (existingVote) {
    existingVote.status = status
    existingVote.updatedAt = updatedAt
  } else {
    seamlessMockDb.meetingAvailabilityVotes.unshift(
      MeetingAvailabilityVoteSchema.parse({
        id: `meeting-vote-${seamlessMockDb.meetingAvailabilityVotes.length + 1}`,
        slotId,
        participantUserId,
        status,
        createdAt: updatedAt,
        updatedAt
      })
    )
  }

  slot.score = computeMeetingSlotScore(slotId)
  slot.updatedAt = updatedAt

  if (meeting) {
    meeting.updatedAt = updatedAt
  }

  return withMockLatency(
    seamlessMockDb.meetingAvailabilityVotes.find((entry) => entry.slotId === slotId && entry.participantUserId === participantUserId) ?? null
  )
}

export async function updateMockMeetingSummaryApproval(meetingId: string, approved: boolean) {
  const meeting = seamlessMockDb.meetings.find((entry) => entry.id === meetingId)

  if (!meeting) {
    return withMockLatency(null)
  }

  meeting.aiSummaryApproved = approved
  meeting.updatedAt = nowIsoDateTime()

  return withMockLatency(meeting)
}

export async function updateMockReleaseStatus(releaseId: string, status: Release['status']) {
  const release = seamlessMockDb.releases.find((entry) => entry.id === releaseId)

  if (!release) {
    return withMockLatency(null)
  }

  release.status = status
  release.updatedAt = nowIsoDateTime()
  release.deployedAt = status === 'deployed' ? release.updatedAt : release.deployedAt

  return withMockLatency(release)
}

export async function updateMockPullRequestStatus(pullRequestId: string, status: PullRequest['status']) {
  const pullRequest = seamlessMockDb.pullRequests.find((entry) => entry.id === pullRequestId)

  if (!pullRequest) {
    return withMockLatency(null)
  }

  pullRequest.status = status
  pullRequest.updatedAt = nowIsoDateTime()
  pullRequest.mergedAt = status === 'merged' ? pullRequest.updatedAt : status === 'closed' || status === 'open' || status === 'reviewing' ? null : pullRequest.mergedAt

  if (pullRequest.releaseId) {
    const release = seamlessMockDb.releases.find((entry) => entry.id === pullRequest.releaseId)
    const releasePullRequests = seamlessMockDb.pullRequests.filter((entry) => entry.releaseId === pullRequest.releaseId)

    if (release) {
      const mergedCount = releasePullRequests.filter((entry) => entry.status === 'merged').length

      if (release.status !== 'deployed' && release.status !== 'failed' && release.status !== 'rolled-back') {
        release.status = mergedCount === releasePullRequests.length && releasePullRequests.length > 0 ? 'in-progress' : 'planned'
        release.updatedAt = pullRequest.updatedAt
      }
    }
  }

  return withMockLatency(pullRequest)
}

export async function updateMockNotificationReadState(notificationId: string, read: boolean) {
  const notification = seamlessMockDb.notifications.find((entry) => entry.id === notificationId)

  if (!notification) {
    return withMockLatency(null)
  }

  const updatedAt = nowIsoDateTime()
  notification.readAt = read ? updatedAt : null
  notification.updatedAt = updatedAt

  return withMockLatency(notification)
}

export async function markAllMockNotificationsRead(userId: string) {
  const updatedAt = nowIsoDateTime()
  const updatedNotifications = seamlessMockDb.notifications.filter((entry) => entry.userId === userId)

  for (const notification of updatedNotifications) {
    notification.readAt = updatedAt
    notification.updatedAt = updatedAt
  }

  return withMockLatency(updatedNotifications)
}

export async function withMockLatency<T>(data: T, delayMs = 180): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delayMs))
  return data
}
