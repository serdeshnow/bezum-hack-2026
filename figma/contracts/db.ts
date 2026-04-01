import type {
  ApprovalDecision,
  DocumentAccessScope,
  DocumentLinkEntityType,
  DocumentStatus,
  GoalStatus,
  ISODate,
  ISODateTime,
  MeetingSourceContextType,
  MeetingStatus,
  MeetingType,
  ProjectStatus,
  PullRequestStatus,
  ReleaseStatus,
  TaskPriority,
  TaskStatus,
  ThemePreference,
  UUID,
  VisibilityMode,
  VoteStatus,
  WorkspaceRole,
} from "./enums";

export interface AuditFields {
  id: UUID;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface UserRecord extends AuditFields {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: WorkspaceRole;
  isActive: boolean;
  passwordHash: string | null;
  lastLoginAt: ISODateTime | null;
}

export interface UserPreferenceRecord extends AuditFields {
  userId: UUID;
  theme: ThemePreference;
}

export interface ProjectRecord extends AuditFields {
  key: string;
  name: string;
  description: string;
  status: ProjectStatus;
  visibilityMode: VisibilityMode;
  ownerUserId: UUID;
  activeEpochId: UUID | null;
  dueDate: ISODate | null;
  startedAt: ISODate | null;
  completedAt: ISODate | null;
  progressPercent: number;
}

export interface ProjectMemberRecord extends AuditFields {
  projectId: UUID;
  userId: UUID;
}

export interface EpochRecord extends AuditFields {
  projectId: UUID;
  name: string;
  status: ProjectStatus;
  startDate: ISODate;
  endDate: ISODate;
}

export interface GoalRecord extends AuditFields {
  epochId: UUID;
  title: string;
  description: string;
  status: GoalStatus;
  progressPercent: number;
  ownerUserId: UUID;
}

export interface TaskRecord extends AuditFields {
  projectId: UUID;
  epochId: UUID | null;
  key: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeUserId: UUID | null;
  reporterUserId: UUID | null;
  dueDate: ISODate | null;
  createdDate: ISODate | null;
  releaseId: UUID | null;
}

export interface TaskTagRecord extends AuditFields {
  taskId: UUID;
  value: string;
}

export interface TaskCommentRecord extends AuditFields {
  taskId: UUID;
  authorUserId: UUID;
  content: string;
}

export interface DocumentFolderRecord extends AuditFields {
  projectId: UUID;
  children: UUID[];
  name: string;
  sortOrder: number;
}

export interface DocumentRecord extends AuditFields {
  projectId: UUID;
  folderId: UUID | null;
  title: string;
  description: string;
  status: DocumentStatus;
  accessScope: DocumentAccessScope;
  authorUserId: UUID;
  currentVersionId: UUID | null;
  awaitingApproval: boolean;
  isStarred: boolean;
  archivedAt: ISODateTime | null;
}

export interface DocumentOwnerRecord extends AuditFields {
  documentId: UUID;
  userId: UUID;
}

export interface DocumentApproverRecord extends AuditFields {
  documentId: UUID;
  userId: UUID;
  approved: boolean;
}

export interface DocumentVersionRecord extends AuditFields {
  documentId: UUID;
  versionLabel: string;
  contentMarkdown: string;
  authorUserId: UUID;
  additions: number;
  deletions: number;
  modifications: number;
  status: DocumentStatus | "pending-approval";
}

export interface DocumentApprovalRecord extends AuditFields {
  documentVersionId: UUID;
  approverUserId: UUID;
  status: ApprovalDecision;
  decision: ApprovalDecision | null;
  rationale: string | null;
  decidedAt: ISODateTime | null;
}

export interface DocumentCommentRecord extends AuditFields {
  documentId: UUID;
  authorUserId: UUID;
  content: string;
  resolved: boolean;
}

export interface DocumentLinkRecord extends AuditFields {
  documentId: UUID;
  entityType: DocumentLinkEntityType;
  entityId: UUID;
}

export interface MeetingRecord extends AuditFields {
  projectId: UUID;
  epochId: UUID | null;
  sourceContextType: MeetingSourceContextType;
  sourceContextId: UUID | null;
  title: string;
  description: string | null;
  type: MeetingType;
  status: MeetingStatus;
  startsAt: ISODateTime | null;
  endsAt: ISODateTime | null;
  recordingUrl: string | null;
  recordingDurationSec: number | null;
  aiSummaryApproved: boolean;
}

export interface MeetingParticipantRecord extends AuditFields {
  meetingId: UUID;
  userId: UUID;
  roleLabel: string;
  attended: boolean;
}

export interface MeetingAvailabilitySlotRecord extends AuditFields {
  meetingId: UUID;
  startsAt: ISODateTime;
  endsAt: ISODateTime;
  score: number;
}

export interface MeetingAvailabilityVoteRecord extends AuditFields {
  slotId: UUID;
  participantUserId: UUID;
  status: VoteStatus;
}

export interface MeetingTranscriptEntryRecord extends AuditFields {
  meetingId: UUID;
  speakerUserId: UUID | null;
  speakerName: string;
  startsAtSec: number;
  text: string;
}

export interface MeetingDecisionRecord extends AuditFields {
  meetingId: UUID;
  decision: string;
  userId: UUID | null;
}

export interface MeetingActionItemRecord extends AuditFields {
  meetingId: UUID;
  taskId: UUID | null;
  taskText: string;
  assigneeUserId: UUID | null;
  dueDate: ISODate | null;
  priority: TaskPriority;
}

export interface ReleaseRecord extends AuditFields {
  projectId: UUID;
  version: string;
  title: string;
  status: ReleaseStatus;
  targetDate: ISODate | null;
  deployedAt: ISODateTime | null;
  commitsCount: number;
  authorUserId: UUID;
}

export interface PullRequestRecord extends AuditFields {
  projectId: UUID;
  releaseId: UUID | null;
  number: number;
  title: string;
  branch: string;
  status: PullRequestStatus;
  authorUserId: UUID;
  commitsCount: number;
  externalUrl: string | null;
  mergedAt: ISODateTime | null;
}

export interface NotificationRecord extends AuditFields {
  userId: UUID;
  actorUserId: UUID | null;
  title: string;
  description: string;
  entityType: DocumentLinkEntityType | "pull-request" | "notification";
  entityId: UUID | null;
  readAt: ISODateTime | null;
}

export interface DatabaseSchema {
  users: UserRecord;
  userPreferences: UserPreferenceRecord;
  projects: ProjectRecord;
  projectMembers: ProjectMemberRecord;
  epochs: EpochRecord;
  goals: GoalRecord;
  tasks: TaskRecord;
  taskTags: TaskTagRecord;
  taskComments: TaskCommentRecord;
  documentFolders: DocumentFolderRecord;
  documents: DocumentRecord;
  documentOwners: DocumentOwnerRecord;
  documentApprovers: DocumentApproverRecord;
  documentVersions: DocumentVersionRecord;
  documentApprovals: DocumentApprovalRecord;
  documentComments: DocumentCommentRecord;
  documentLinks: DocumentLinkRecord;
  meetings: MeetingRecord;
  meetingParticipants: MeetingParticipantRecord;
  meetingAvailabilitySlots: MeetingAvailabilitySlotRecord;
  meetingAvailabilityVotes: MeetingAvailabilityVoteRecord;
  meetingTranscriptEntries: MeetingTranscriptEntryRecord;
  meetingDecisions: MeetingDecisionRecord;
  meetingActionItems: MeetingActionItemRecord;
  releases: ReleaseRecord;
  pullRequests: PullRequestRecord;
  notifications: NotificationRecord;
}
