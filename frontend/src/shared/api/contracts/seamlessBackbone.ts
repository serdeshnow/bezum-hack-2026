import { z } from 'zod'

export const UUIDSchema = z.string().min(1)
export const ISODateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
export const ISODateTimeSchema = z.string().min(1)

export const WorkspaceRoleSchema = z.enum(['customer', 'developer', 'manager', 'admin'])
export const ProjectStatusSchema = z.enum(['draft', 'active', 'at-risk', 'archived', 'completed'])
export const VisibilityModeSchema = z.enum(['internal', 'customer'])
export const GoalStatusSchema = z.enum(['not-started', 'in-progress', 'completed', 'blocked'])
export const TaskStatusSchema = z.enum(['backlog', 'todo', 'in-progress', 'review', 'done', 'cancelled'])
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical'])
export const DocumentStatusSchema = z.enum(['draft', 'in-review', 'approved', 'obsolete', 'rejected'])
export const DocumentAccessScopeSchema = z.enum(['customer', 'manager', 'dev', 'internal'])
export const DocumentLinkEntityTypeSchema = z.enum(['epoch', 'task', 'meeting', 'release', 'project'])
export const ChangeSourceSchema = z.enum(['manual', 'meeting', 'task', 'imported'])
export const ApprovalDecisionSchema = z.enum(['pending', 'approved', 'rejected', 'requested-changes'])
export const MeetingStatusSchema = z.enum(['draft', 'scheduled', 'completed', 'cancelled'])
export const MeetingTypeSchema = z.enum(['standup', 'planning', 'review', 'retrospective', 'workshop', 'ad-hoc'])
export const MeetingSourceContextTypeSchema = z.enum(['task', 'doc', 'epoch', 'project', 'none'])
export const VoteStatusSchema = z.enum(['available', 'maybe', 'unavailable', 'no-response'])
export const ReleaseStatusSchema = z.enum(['planned', 'in-progress', 'deployed', 'failed', 'rolled-back'])
export const PullRequestStatusSchema = z.enum(['open', 'reviewing', 'merged', 'closed'])

export const AuditFieldsSchema = z.object({
  id: UUIDSchema,
  createdAt: ISODateTimeSchema,
  updatedAt: ISODateTimeSchema
})

export const UserSchema = AuditFieldsSchema.extend({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.string().nullable(),
  role: WorkspaceRoleSchema,
  isActive: z.boolean(),
  passwordHash: z.string().nullable(),
  lastLoginAt: ISODateTimeSchema.nullable()
})

export const ProjectSchema = AuditFieldsSchema.extend({
  key: z.string(),
  name: z.string(),
  description: z.string(),
  status: ProjectStatusSchema,
  visibilityMode: VisibilityModeSchema,
  ownerUserId: UUIDSchema,
  activeEpochId: UUIDSchema.nullable(),
  dueDate: ISODateSchema.nullable(),
  startedAt: ISODateSchema.nullable(),
  completedAt: ISODateSchema.nullable(),
  progressPercent: z.number().int().min(0).max(100)
})

export const ProjectMemberSchema = AuditFieldsSchema.extend({
  projectId: UUIDSchema,
  userId: UUIDSchema
})

export const EpochSchema = AuditFieldsSchema.extend({
  projectId: UUIDSchema,
  name: z.string(),
  status: ProjectStatusSchema,
  startDate: ISODateSchema,
  endDate: ISODateSchema
})

export const GoalSchema = AuditFieldsSchema.extend({
  epochId: UUIDSchema,
  title: z.string(),
  description: z.string(),
  status: GoalStatusSchema,
  progressPercent: z.number().int().min(0).max(100),
  ownerUserId: UUIDSchema
})

export const TaskSchema = AuditFieldsSchema.extend({
  projectId: UUIDSchema,
  epochId: UUIDSchema.nullable(),
  key: z.string(),
  title: z.string(),
  description: z.string(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  assigneeUserId: UUIDSchema.nullable(),
  reporterUserId: UUIDSchema.nullable(),
  dueDate: ISODateSchema.nullable(),
  createdDate: ISODateSchema.nullable(),
  releaseId: UUIDSchema.nullable()
})

export const TaskTagSchema = AuditFieldsSchema.extend({
  taskId: UUIDSchema,
  value: z.string()
})

export const TaskCommentSchema = AuditFieldsSchema.extend({
  taskId: UUIDSchema,
  authorUserId: UUIDSchema,
  content: z.string()
})

export const DocumentSchema = AuditFieldsSchema.extend({
  projectId: UUIDSchema,
  folderId: UUIDSchema.nullable(),
  title: z.string(),
  description: z.string(),
  status: DocumentStatusSchema,
  accessScope: DocumentAccessScopeSchema,
  authorUserId: UUIDSchema,
  currentVersionId: UUIDSchema.nullable(),
  awaitingApproval: z.boolean(),
  isStarred: z.boolean(),
  archivedAt: ISODateTimeSchema.nullable()
})

export const DocumentFolderSchema = AuditFieldsSchema.extend({
  projectId: UUIDSchema,
  children: z.array(UUIDSchema),
  name: z.string(),
  sortOrder: z.number().int()
})

export const DocumentOwnerSchema = AuditFieldsSchema.extend({
  documentId: UUIDSchema,
  userId: UUIDSchema
})

export const DocumentApproverSchema = AuditFieldsSchema.extend({
  documentId: UUIDSchema,
  userId: UUIDSchema,
  approved: z.boolean()
})

export const DocumentVersionStatusSchema = z.union([DocumentStatusSchema, z.literal('pending-approval')])

export const DocumentVersionSchema = AuditFieldsSchema.extend({
  documentId: UUIDSchema,
  versionLabel: z.string(),
  contentMarkdown: z.string(),
  changeSource: ChangeSourceSchema,
  sourceDetail: z.string().nullable(),
  authorUserId: UUIDSchema,
  additions: z.number().int().min(0),
  deletions: z.number().int().min(0),
  modifications: z.number().int().min(0),
  status: DocumentVersionStatusSchema
})

export const DocumentApprovalSchema = AuditFieldsSchema.extend({
  documentVersionId: UUIDSchema,
  approverUserId: UUIDSchema,
  status: ApprovalDecisionSchema,
  decision: ApprovalDecisionSchema.nullable(),
  rationale: z.string().nullable(),
  decidedAt: ISODateTimeSchema.nullable()
})

export const DocumentCommentSchema = AuditFieldsSchema.extend({
  documentId: UUIDSchema,
  authorUserId: UUIDSchema,
  content: z.string(),
  resolved: z.boolean()
})

export const DocumentLinkSchema = AuditFieldsSchema.extend({
  documentId: UUIDSchema,
  entityType: DocumentLinkEntityTypeSchema,
  entityId: UUIDSchema
})

export const MeetingSchema = AuditFieldsSchema.extend({
  projectId: UUIDSchema,
  epochId: UUIDSchema.nullable(),
  sourceContextType: MeetingSourceContextTypeSchema,
  sourceContextId: UUIDSchema.nullable(),
  title: z.string(),
  description: z.string().nullable(),
  type: MeetingTypeSchema,
  status: MeetingStatusSchema,
  startsAt: ISODateTimeSchema.nullable(),
  endsAt: ISODateTimeSchema.nullable(),
  recordingUrl: z.string().nullable(),
  recordingDurationSec: z.number().int().min(0).nullable(),
  aiSummaryApproved: z.boolean()
})

export const MeetingParticipantSchema = AuditFieldsSchema.extend({
  meetingId: UUIDSchema,
  userId: UUIDSchema,
  roleLabel: z.string(),
  attended: z.boolean()
})

export const MeetingAvailabilitySlotSchema = AuditFieldsSchema.extend({
  meetingId: UUIDSchema,
  startsAt: ISODateTimeSchema,
  endsAt: ISODateTimeSchema,
  score: z.number().int().min(0)
})

export const MeetingAvailabilityVoteSchema = AuditFieldsSchema.extend({
  slotId: UUIDSchema,
  participantUserId: UUIDSchema,
  status: VoteStatusSchema
})

export const MeetingTranscriptEntrySchema = AuditFieldsSchema.extend({
  meetingId: UUIDSchema,
  speakerUserId: UUIDSchema.nullable(),
  speakerName: z.string(),
  startsAtSec: z.number().int().min(0),
  text: z.string()
})

export const MeetingDecisionSchema = AuditFieldsSchema.extend({
  meetingId: UUIDSchema,
  decision: z.string(),
  userId: UUIDSchema.nullable()
})

export const MeetingActionItemSchema = AuditFieldsSchema.extend({
  meetingId: UUIDSchema,
  taskId: UUIDSchema.nullable(),
  taskText: z.string(),
  assigneeUserId: UUIDSchema.nullable(),
  dueDate: ISODateSchema.nullable(),
  priority: TaskPrioritySchema
})

export const MeetingLinkedDocumentSchema = AuditFieldsSchema.extend({
  meetingId: UUIDSchema,
  documentId: UUIDSchema,
  updateSuggestion: z.string()
})

export const ReleaseSchema = AuditFieldsSchema.extend({
  projectId: UUIDSchema,
  version: z.string(),
  title: z.string(),
  status: ReleaseStatusSchema,
  targetDate: ISODateSchema.nullable(),
  deployedAt: ISODateTimeSchema.nullable(),
  commitsCount: z.number().int().min(0),
  authorUserId: UUIDSchema
})

export const PullRequestSchema = AuditFieldsSchema.extend({
  projectId: UUIDSchema,
  releaseId: UUIDSchema.nullable(),
  number: z.number().int().min(1),
  title: z.string(),
  branch: z.string(),
  status: PullRequestStatusSchema,
  authorUserId: UUIDSchema,
  commitsCount: z.number().int().min(0),
  externalUrl: z.string().nullable(),
  mergedAt: ISODateTimeSchema.nullable()
})

export const NotificationSchema = AuditFieldsSchema.extend({
  userId: UUIDSchema,
  actorUserId: UUIDSchema.nullable(),
  title: z.string(),
  description: z.string(),
  entityType: z.string().nullable(),
  entityId: UUIDSchema.nullable(),
  readAt: ISODateTimeSchema.nullable()
})

export type User = z.infer<typeof UserSchema>
export type Project = z.infer<typeof ProjectSchema>
export type ProjectMember = z.infer<typeof ProjectMemberSchema>
export type Epoch = z.infer<typeof EpochSchema>
export type Goal = z.infer<typeof GoalSchema>
export type Task = z.infer<typeof TaskSchema>
export type TaskTag = z.infer<typeof TaskTagSchema>
export type TaskComment = z.infer<typeof TaskCommentSchema>
export type Document = z.infer<typeof DocumentSchema>
export type DocumentFolder = z.infer<typeof DocumentFolderSchema>
export type DocumentOwner = z.infer<typeof DocumentOwnerSchema>
export type DocumentApprover = z.infer<typeof DocumentApproverSchema>
export type DocumentVersion = z.infer<typeof DocumentVersionSchema>
export type DocumentApproval = z.infer<typeof DocumentApprovalSchema>
export type DocumentComment = z.infer<typeof DocumentCommentSchema>
export type DocumentLink = z.infer<typeof DocumentLinkSchema>
export type Meeting = z.infer<typeof MeetingSchema>
export type MeetingParticipant = z.infer<typeof MeetingParticipantSchema>
export type MeetingAvailabilitySlot = z.infer<typeof MeetingAvailabilitySlotSchema>
export type MeetingAvailabilityVote = z.infer<typeof MeetingAvailabilityVoteSchema>
export type MeetingTranscriptEntry = z.infer<typeof MeetingTranscriptEntrySchema>
export type MeetingDecision = z.infer<typeof MeetingDecisionSchema>
export type MeetingActionItem = z.infer<typeof MeetingActionItemSchema>
export type MeetingLinkedDocument = z.infer<typeof MeetingLinkedDocumentSchema>
export type VoteStatus = z.infer<typeof VoteStatusSchema>
export type Release = z.infer<typeof ReleaseSchema>
export type PullRequest = z.infer<typeof PullRequestSchema>
export type Notification = z.infer<typeof NotificationSchema>
