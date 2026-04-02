/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum PullRequestStatus {
  Open = "open",
  Reviewing = "reviewing",
  Merged = "merged",
  Closed = "closed",
}

export enum ReleaseStatus {
  Planned = "planned",
  InProgress = "in-progress",
  Deployed = "deployed",
  Failed = "failed",
  RolledBack = "rolled-back",
}

export enum VoteStatus {
  Available = "available",
  Maybe = "maybe",
  Unavailable = "unavailable",
  NoResponse = "no-response",
}

export enum MeetingSourceContextType {
  Task = "task",
  Doc = "doc",
  Epoch = "epoch",
  Project = "project",
  None = "none",
}

export enum MeetingType {
  Standup = "standup",
  Planning = "planning",
  Review = "review",
  Retrospective = "retrospective",
  Workshop = "workshop",
  AdHoc = "ad-hoc",
}

export enum MeetingStatus {
  Draft = "draft",
  Scheduled = "scheduled",
  Completed = "completed",
  Cancelled = "cancelled",
}

export enum ApprovalDecision {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  RequestedChanges = "requested-changes",
}

export enum ChangeSource {
  Manual = "manual",
  Meeting = "meeting",
  Task = "task",
  Imported = "imported",
}

export enum DocumentLinkEntityType {
  Epoch = "epoch",
  Task = "task",
  Meeting = "meeting",
  Release = "release",
  Project = "project",
}

export enum DocumentAccessScope {
  Customer = "customer",
  Manager = "manager",
  Dev = "dev",
  Internal = "internal",
}

export enum DocumentStatus {
  Draft = "draft",
  InReview = "in-review",
  Approved = "approved",
  Obsolete = "obsolete",
  Rejected = "rejected",
}

export enum TaskPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
}

export enum TaskStatus {
  Backlog = "backlog",
  Todo = "todo",
  InProgress = "in-progress",
  Review = "review",
  Done = "done",
  Cancelled = "cancelled",
}

export enum GoalStatus {
  NotStarted = "not-started",
  InProgress = "in-progress",
  Completed = "completed",
  Blocked = "blocked",
}

export enum VisibilityMode {
  Internal = "internal",
  Customer = "customer",
}

export enum ProjectStatus {
  Draft = "draft",
  Active = "active",
  AtRisk = "at-risk",
  Archived = "archived",
  Completed = "completed",
}

export enum ThemePreference {
  Light = "light",
  Dark = "dark",
  System = "system",
}

export enum WorkspaceRole {
  Customer = "customer",
  Developer = "developer",
  Manager = "manager",
  Admin = "admin",
}

/** @format uuid */
export type UUID = string;

/** @format date */
export type ISODate = string;

/** @format date-time */
export type ISODateTime = string;

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ListMeta {
  /** @min 1 */
  page: number;
  /** @min 1 */
  pageSize: number;
  /** @min 0 */
  total: number;
}

export interface DeleteResponse {
  deleted: true;
}

export interface AuditFields {
  id: any;
  createdAt: any;
  updatedAt: any;
}

export type User = {
  /** @format email */
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role: any;
  isActive: boolean;
  passwordHash?: string | null;
  lastLoginAt?: null;
};

export interface CreateUserRequest {
  /** @format email */
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role: any;
  /** @default true */
  isActive?: boolean;
  passwordHash?: string | null;
}

export interface UpdateUserRequest {
  /** @format email */
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  role?: any;
  isActive?: boolean;
  passwordHash?: string | null;
  lastLoginAt?: null;
}

export type UserPreferences = {
  userId: any;
  theme: any;
  emailNotifications: boolean;
  taskAssignmentsEnabled: boolean;
  meetingRemindersEnabled: boolean;
  releaseNotificationsEnabled: boolean;
  mentionNotificationsEnabled: boolean;
};

export interface CreateUserPreferencesRequest {
  userId: any;
  theme: any;
  /** @default true */
  emailNotifications?: boolean;
  /** @default true */
  taskAssignmentsEnabled?: boolean;
  /** @default true */
  meetingRemindersEnabled?: boolean;
  /** @default true */
  releaseNotificationsEnabled?: boolean;
  /** @default true */
  mentionNotificationsEnabled?: boolean;
}

export interface UpdateUserPreferencesRequest {
  theme?: any;
  emailNotifications?: boolean;
  taskAssignmentsEnabled?: boolean;
  meetingRemindersEnabled?: boolean;
  releaseNotificationsEnabled?: boolean;
  mentionNotificationsEnabled?: boolean;
}

export type Project = {
  key: string;
  name: string;
  description: string;
  status: any;
  visibilityMode: any;
  ownerUserId: any;
  activeEpochId?: null;
  dueDate?: null;
  startedAt?: null;
  completedAt?: null;
  /**
   * @min 0
   * @max 100
   */
  progressPercent: number;
};

export interface CreateProjectRequest {
  key: string;
  name: string;
  description: string;
  status: any;
  visibilityMode: any;
  ownerUserId: any;
  activeEpochId?: null;
  dueDate?: null;
  startedAt?: null;
  completedAt?: null;
  /**
   * @min 0
   * @max 100
   * @default 0
   */
  progressPercent?: number;
}

export interface UpdateProjectRequest {
  key?: string;
  name?: string;
  description?: string;
  status?: any;
  visibilityMode?: any;
  ownerUserId?: any;
  activeEpochId?: null;
  dueDate?: null;
  startedAt?: null;
  completedAt?: null;
  /**
   * @min 0
   * @max 100
   */
  progressPercent?: number;
}

export type ProjectMember = {
  projectId: any;
  userId: any;
};

export interface CreateProjectMemberRequest {
  userId: any;
}

export interface UpdateProjectMemberRequest {
  userId?: any;
  projectId?: any;
}

export type Epoch = {
  projectId: any;
  name: string;
  status: any;
  startDate: any;
  endDate: any;
};

export interface CreateEpochRequest {
  projectId: any;
  name: string;
  status: any;
  startDate: any;
  endDate: any;
}

export interface UpdateEpochRequest {
  name?: string;
  status?: any;
  startDate?: any;
  endDate?: any;
}

export type Goal = {
  epochId: any;
  title: string;
  description: string;
  status: any;
  /**
   * @min 0
   * @max 100
   */
  progressPercent: number;
  ownerUserId: any;
};

export interface CreateGoalRequest {
  epochId: any;
  title: string;
  description: string;
  status: any;
  /**
   * @min 0
   * @max 100
   * @default 0
   */
  progressPercent?: number;
  ownerUserId: any;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  status?: any;
  /**
   * @min 0
   * @max 100
   */
  progressPercent?: number;
  ownerUserId?: any;
}

export type Task = {
  projectId: any;
  epochId?: null;
  key: string;
  title: string;
  description: string;
  status: any;
  priority: any;
  assigneeUserId?: null;
  reporterUserId?: null;
  dueDate?: null;
  createdDate?: null;
  releaseId?: null;
};

export interface CreateTaskRequest {
  projectId: any;
  epochId?: null;
  key: string;
  title: string;
  description: string;
  status: any;
  priority: any;
  assigneeUserId?: null;
  reporterUserId?: null;
  dueDate?: null;
  createdDate?: null;
  releaseId?: null;
}

export interface UpdateTaskRequest {
  epochId?: null;
  key?: string;
  title?: string;
  description?: string;
  status?: any;
  priority?: any;
  assigneeUserId?: null;
  reporterUserId?: null;
  dueDate?: null;
  createdDate?: null;
  releaseId?: null;
}

export type TaskTag = {
  taskId: any;
  value: string;
};

export interface CreateTaskTagRequest {
  value: string;
}

export interface UpdateTaskTagRequest {
  value?: string;
}

export type TaskComment = {
  taskId: any;
  authorUserId: any;
  content: string;
};

export interface CreateTaskCommentRequest {
  authorUserId: any;
  content: string;
}

export interface UpdateTaskCommentRequest {
  content?: string;
}

export type DocumentFolder = {
  projectId: any;
  children: any[];
  name: string;
  sortOrder: number;
};

export interface CreateDocumentFolderRequest {
  projectId: any;
  /** @default [] */
  children?: any[];
  name: string;
  /** @default 0 */
  sortOrder?: number;
}

export interface UpdateDocumentFolderRequest {
  children?: any[];
  name?: string;
  sortOrder?: number;
}

export type Document = {
  projectId: any;
  folderId?: null;
  title: string;
  description: string;
  status: any;
  accessScope: any;
  authorUserId: any;
  currentVersionId?: null;
  awaitingApproval: boolean;
  isStarred: boolean;
  archivedAt?: null;
};

export interface CreateDocumentRequest {
  projectId: any;
  folderId?: null;
  title: string;
  description: string;
  status: any;
  accessScope: any;
  authorUserId: any;
  currentVersionId?: null;
  /** @default false */
  awaitingApproval?: boolean;
  /** @default false */
  isStarred?: boolean;
  archivedAt?: null;
}

export interface UpdateDocumentRequest {
  folderId?: null;
  title?: string;
  description?: string;
  status?: any;
  accessScope?: any;
  currentVersionId?: null;
  awaitingApproval?: boolean;
  isStarred?: boolean;
  archivedAt?: null;
}

export type DocumentOwner = {
  documentId: any;
  userId: any;
};

export interface CreateDocumentOwnerRequest {
  userId: any;
}

export interface UpdateDocumentOwnerRequest {
  userId?: any;
}

export type DocumentApprover = {
  documentId: any;
  userId: any;
  approved: boolean;
};

export interface CreateDocumentApproverRequest {
  userId: any;
  /** @default false */
  approved?: boolean;
}

export interface UpdateDocumentApproverRequest {
  userId?: any;
  approved?: boolean;
}

export type DocumentVersion = {
  documentId: any;
  versionLabel: string;
  contentMarkdown: string;
  changeSource: any;
  sourceDetail?: string | null;
  authorUserId: any;
  /** @min 0 */
  additions: number;
  /** @min 0 */
  deletions: number;
  /** @min 0 */
  modifications: number;
  status: "pending-approval";
};

export interface CreateDocumentVersionRequest {
  versionLabel: string;
  contentMarkdown: string;
  changeSource: any;
  sourceDetail?: string | null;
  authorUserId: any;
  /**
   * @min 0
   * @default 0
   */
  additions?: number;
  /**
   * @min 0
   * @default 0
   */
  deletions?: number;
  /**
   * @min 0
   * @default 0
   */
  modifications?: number;
  status: "pending-approval";
}

export interface UpdateDocumentVersionRequest {
  versionLabel?: string;
  contentMarkdown?: string;
  changeSource?: any;
  sourceDetail?: string | null;
  /** @min 0 */
  additions?: number;
  /** @min 0 */
  deletions?: number;
  /** @min 0 */
  modifications?: number;
  status?: "pending-approval";
}

export type DocumentApproval = {
  documentVersionId: any;
  approverUserId: any;
  status: any;
  decision?: null;
  rationale?: string | null;
  decidedAt?: null;
};

export interface CreateDocumentApprovalRequest {
  approverUserId: any;
  status: any;
  decision?: null;
  rationale?: string | null;
  decidedAt?: null;
}

export interface UpdateDocumentApprovalRequest {
  status?: any;
  decision?: null;
  rationale?: string | null;
  decidedAt?: null;
}

export type DocumentComment = {
  documentId: any;
  authorUserId: any;
  content: string;
  resolved: boolean;
};

export interface CreateDocumentCommentRequest {
  authorUserId: any;
  content: string;
  /** @default false */
  resolved?: boolean;
}

export interface UpdateDocumentCommentRequest {
  content?: string;
  resolved?: boolean;
}

export type DocumentLink = {
  documentId: any;
  entityType: any;
  entityId: any;
};

export interface CreateDocumentLinkRequest {
  entityType: any;
  entityId: any;
}

export interface UpdateDocumentLinkRequest {
  entityType?: any;
  entityId?: any;
}

export type Meeting = {
  projectId: any;
  epochId?: null;
  sourceContextType: any;
  sourceContextId?: null;
  title: string;
  description?: string | null;
  type: any;
  status: any;
  startsAt?: null;
  endsAt?: null;
  recordingUrl?: string | null;
  /** @min 0 */
  recordingDurationSec?: number | null;
  aiSummaryApproved: boolean;
};

export interface CreateMeetingRequest {
  projectId: any;
  epochId?: null;
  sourceContextType: any;
  sourceContextId?: null;
  title: string;
  description?: string | null;
  type: any;
  status: any;
  startsAt?: null;
  endsAt?: null;
  recordingUrl?: string | null;
  /** @min 0 */
  recordingDurationSec?: number | null;
  /** @default false */
  aiSummaryApproved?: boolean;
}

export interface UpdateMeetingRequest {
  epochId?: null;
  sourceContextType?: any;
  sourceContextId?: null;
  title?: string;
  description?: string | null;
  type?: any;
  status?: any;
  startsAt?: null;
  endsAt?: null;
  recordingUrl?: string | null;
  /** @min 0 */
  recordingDurationSec?: number | null;
  aiSummaryApproved?: boolean;
}

export type MeetingParticipant = {
  meetingId: any;
  userId: any;
  roleLabel: string;
  attended: boolean;
};

export interface CreateMeetingParticipantRequest {
  userId: any;
  roleLabel: string;
  /** @default false */
  attended?: boolean;
}

export interface UpdateMeetingParticipantRequest {
  userId?: any;
  roleLabel?: string;
  attended?: boolean;
}

export type MeetingAvailabilitySlot = {
  meetingId: any;
  startsAt: any;
  endsAt: any;
  /** @min 0 */
  score: number;
};

export interface CreateMeetingAvailabilitySlotRequest {
  startsAt: any;
  endsAt: any;
  /**
   * @min 0
   * @default 0
   */
  score?: number;
}

export interface UpdateMeetingAvailabilitySlotRequest {
  startsAt?: any;
  endsAt?: any;
  /** @min 0 */
  score?: number;
}

export type MeetingAvailabilityVote = {
  slotId: any;
  participantUserId: any;
  status: any;
};

export interface CreateMeetingAvailabilityVoteRequest {
  participantUserId: any;
  status: any;
}

export interface UpdateMeetingAvailabilityVoteRequest {
  participantUserId?: any;
  status?: any;
}

export type MeetingTranscriptEntry = {
  meetingId: any;
  speakerUserId?: null;
  speakerName: string;
  /** @min 0 */
  startsAtSec: number;
  text: string;
};

export interface CreateMeetingTranscriptEntryRequest {
  speakerUserId?: null;
  speakerName: string;
  /** @min 0 */
  startsAtSec: number;
  text: string;
}

export interface UpdateMeetingTranscriptEntryRequest {
  speakerUserId?: null;
  speakerName?: string;
  /** @min 0 */
  startsAtSec?: number;
  text?: string;
}

export type MeetingDecision = {
  meetingId: any;
  decision: string;
  userId?: null;
};

export interface CreateMeetingDecisionRequest {
  decision: string;
  userId?: null;
}

export interface UpdateMeetingDecisionRequest {
  decision?: string;
  userId?: null;
}

export type MeetingActionItem = {
  meetingId: any;
  taskId?: null;
  taskText: string;
  assigneeUserId?: null;
  dueDate?: null;
  priority: any;
};

export interface CreateMeetingActionItemRequest {
  taskId?: null;
  taskText: string;
  assigneeUserId?: null;
  dueDate?: null;
  priority: any;
}

export interface UpdateMeetingActionItemRequest {
  taskId?: null;
  taskText?: string;
  assigneeUserId?: null;
  dueDate?: null;
  priority?: any;
}

export type MeetingLinkedDocument = {
  meetingId: any;
  documentId: any;
  updateSuggestion: string;
};

export interface CreateMeetingLinkedDocumentRequest {
  documentId: any;
  updateSuggestion: string;
}

export interface UpdateMeetingLinkedDocumentRequest {
  documentId?: any;
  updateSuggestion?: string;
}

export type Release = {
  projectId: any;
  version: string;
  title: string;
  status: any;
  targetDate?: null;
  deployedAt?: null;
  /** @min 0 */
  commitsCount: number;
  authorUserId: any;
};

export interface CreateReleaseRequest {
  projectId: any;
  version: string;
  title: string;
  status: any;
  targetDate?: null;
  deployedAt?: null;
  /**
   * @min 0
   * @default 0
   */
  commitsCount?: number;
  authorUserId: any;
}

export interface UpdateReleaseRequest {
  version?: string;
  title?: string;
  status?: any;
  targetDate?: null;
  deployedAt?: null;
  /** @min 0 */
  commitsCount?: number;
  authorUserId?: any;
}

export type PullRequest = {
  projectId: any;
  releaseId?: null;
  /** @min 1 */
  number: number;
  title: string;
  branch: string;
  status: any;
  authorUserId: any;
  /** @min 0 */
  commitsCount: number;
  externalUrl?: string | null;
  mergedAt?: null;
};

export interface CreatePullRequestRequest {
  projectId: any;
  releaseId?: null;
  /** @min 1 */
  number: number;
  title: string;
  branch: string;
  status: any;
  authorUserId: any;
  /**
   * @min 0
   * @default 0
   */
  commitsCount?: number;
  externalUrl?: string | null;
  mergedAt?: null;
}

export interface UpdatePullRequestRequest {
  releaseId?: null;
  /** @min 1 */
  number?: number;
  title?: string;
  branch?: string;
  status?: any;
  authorUserId?: any;
  /** @min 0 */
  commitsCount?: number;
  externalUrl?: string | null;
  mergedAt?: null;
}

export type Notification = {
  userId: any;
  actorUserId?: null;
  title: string;
  description: string;
  entityType?: string | null;
  entityId?: null;
  readAt?: null;
};

export interface CreateNotificationRequest {
  userId: any;
  actorUserId?: null;
  title: string;
  description: string;
  entityType?: string | null;
  entityId?: null;
  readAt?: null;
}

export interface UpdateNotificationRequest {
  actorUserId?: null;
  title?: string;
  description?: string;
  entityType?: string | null;
  entityId?: null;
  readAt?: null;
}
