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

export interface PageRequest {
  page: number;
  pageSize: number;
}

export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserSummaryDto {
  id: UUID;
  name: string;
  initials: string;
  email?: string;
  role?: WorkspaceRole;
  avatarUrl?: string | null;
}

export interface ProjectListItemDto {
  id: UUID;
  key: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  teamSize: number;
  tasksOpen: number;
  dueDate: ISODate | null;
  epoch: string | null;
}

export interface ProjectOverviewDto {
  id: UUID;
  name: string;
  status: ProjectStatus;
  visibilityMode: VisibilityMode;
  stats: {
    status: "on-track" | "at-risk" | "delayed";
    completion: number;
    activeEpoch: {
      id?: UUID;
      name: string;
    } | null;
    upcomingMeetings: number;
    latestRelease: {
      id?: UUID;
      version: string;
      date: string;
    } | null;
  };
  entities: {
    docs: number;
    tasks: number;
    meetings: number;
    pullRequests: number;
    releases: number;
  };
}

export interface EpochDto {
  id: UUID;
  projectId: UUID;
  name: string;
  status: ProjectStatus;
  startDate: ISODate;
  endDate: ISODate;
  goals: GoalDto[];
}

export interface GoalDto {
  id: UUID;
  title: string;
  description: string;
  status: GoalStatus;
  progress: number;
  owner: UserSummaryDto;
}

export interface TaskBoardColumnDto {
  id: TaskStatus;
  title: string;
  color?: string;
}

export interface TaskListItemDto {
  id: UUID;
  key?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: UserSummaryDto | null;
  dueDate: ISODate | null;
  tags: string[];
}

export interface TaskDetailsDto extends TaskListItemDto {
  reporter: UserSummaryDto | null;
  createdDate: ISODate | null;
  epoch: { id: UUID; title: string } | null;
  linkedDocs: Array<{
    id: UUID;
    title: string;
    preview: string;
    quotes: Array<{ text: string; section: string }>;
    lastUpdated: string;
  }>;
  linkedMeetings: Array<{
    id: UUID;
    title: string;
    date: string;
    summary: string;
    hasRecording: boolean;
    attendees: number;
    keyPoints: string[];
  }>;
  linkedPRs: Array<{
    id: UUID;
    number: number;
    title: string;
    status: PullRequestStatus;
    branch: string;
    author: string;
    url: string | null;
  }>;
  linkedRelease: {
    id: UUID;
    version: string;
    status: ReleaseStatus;
    targetDate: ISODate | null;
  } | null;
  comments: TaskCommentDto[];
}

export interface TaskCommentDto {
  id: UUID;
  user: UserSummaryDto;
  content: string;
  timestamp: string;
}

export interface DocumentFolderDto {
  id: UUID;
  name: string;
  docCount: number;
  children?: DocumentFolderDto[];
}

export interface DocumentListItemDto {
  id: UUID;
  title: string;
  description: string;
  status: DocumentStatus;
  accessScope: DocumentAccessScope;
  author: UserSummaryDto;
  lastUpdated: string;
  linkedTo?: {
    epochs?: number;
    tasks?: number;
    meetings?: number;
    releases?: number;
  };
  awaitingApproval: boolean;
  folderId: UUID | null;
}

export interface DocumentEditorDto {
  id: UUID;
  title: string;
  version: string;
  status: DocumentStatus;
  owners: UserSummaryDto[];
  approvers: Array<UserSummaryDto & { approved: boolean }>;
  content: string;
  linkedEntities: LinkedEntityDto[];
  comments: DocumentCommentDto[];
}

export interface LinkedEntityDto {
  id: UUID;
  type: DocumentLinkEntityType;
  title: string;
  status?: string;
}

export interface DocumentCommentDto {
  id: UUID;
  author: UserSummaryDto;
  content: string;
  timestamp: string;
  resolved?: boolean;
}

export interface DocumentHistoryVersionDto {
  id: UUID;
  version: string;
  timestamp: string;
  author: UserSummaryDto;
  changes: {
    additions: number;
    deletions: number;
    modifications: number;
  };
  status: "draft" | "pending-approval" | "approved" | "rejected";
  approvals: Array<{
    approver: UserSummaryDto;
    status: ApprovalDecision;
    decision?: ApprovalDecision;
    rationale?: string;
    timestamp?: string;
  }>;
}

export interface MeetingSchedulerDto {
  sourceContext: {
    type: MeetingSourceContextType;
    id?: UUID;
    title?: string;
    linkedEntities?: {
      docs?: number;
      tasks?: number;
      epochs?: number;
    };
  };
  participants: Array<UserSummaryDto & { role: string }>;
  timeSlots: Array<{
    id: UUID;
    date: string;
    time: string;
    votes: Record<UUID, VoteStatus>;
  }>;
  availabilityStrip: Array<{
    day: string;
    date: string;
    slots: string[];
  }>;
}

export interface MeetingRecapDto {
  id: UUID;
  title: string;
  date: string;
  time: string;
  status: MeetingStatus;
  attendees: Array<UserSummaryDto & { role: string }>;
  recording: {
    duration: string;
    url: string | null;
  } | null;
  transcript: Array<{
    speaker: string;
    time: string;
    text: string;
  }>;
  aiSummary: {
    overview: string;
    keyPoints: string[];
  };
  decisions: Array<{
    id: UUID;
    decision: string;
    userId?: UUID | null;
  }>;
  actionItems: Array<{
    id: UUID;
    task: string;
    assignee: UserSummaryDto;
    dueDate: ISODate | null;
    priority: TaskPriority;
  }>;
}

export interface ReleaseDto {
  id: UUID;
  version: string;
  title: string;
  date: string;
  status: ReleaseStatus;
  commits: number;
  author: UserSummaryDto;
}

export interface PullRequestDto {
  id: UUID;
  title: string;
  number: number;
  status: PullRequestStatus;
  author: UserSummaryDto;
  branch: string;
  commits: number;
  date: string;
}

export interface NotificationDto {
  id: UUID;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  user?: UserSummaryDto;
  entityType?: string;
  entityId?: UUID | null;
}

export interface SettingsDto {
  profile: {
    userId: UUID;
    firstName: string;
    lastName: string;
    email: string;
    role: WorkspaceRole;
    avatarUrl: string | null;
  };
  appearance: {
    theme: ThemePreference;
  };
}

export interface GetProjectsRequest extends PageRequest {
  status?: ProjectStatus | "all";
  query?: string;
}

export type GetProjectsResponse = PageResponse<ProjectListItemDto>;

export interface GetProjectOverviewRequest {
  projectId: UUID;
}

export interface GetEpochRequest {
  epochId: UUID;
}

export interface GetTasksRequest extends PageRequest {
  projectId?: UUID;
  epochId?: UUID;
  assigneeId?: UUID;
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  query?: string;
}

export type GetTasksResponse = PageResponse<TaskListItemDto>;

export interface UpdateTaskRequest {
  id: UUID;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeUserId?: UUID | null;
  dueDate?: ISODate | null;
  tags?: string[];
}

export interface GetDocsRequest extends PageRequest {
  projectId: UUID;
  folderId?: UUID | "root";
  status?: DocumentStatus | "all";
  accessScope?: DocumentAccessScope | "all";
  ownerId?: UUID | "all";
  awaitingApproval?: boolean;
  query?: string;
}

export type GetDocsResponse = PageResponse<DocumentListItemDto>;

export interface UpdateDocumentRequest {
  id: UUID;
  title?: string;
  description?: string;
  status?: DocumentStatus;
  accessScope?: DocumentAccessScope;
  content?: string;
  ownerIds?: UUID[];
  approverIds?: UUID[];
  linkedEntities?: Array<{ entityType: DocumentLinkEntityType; entityId: UUID }>;
}

export interface AddDocumentCommentRequest {
  documentId: UUID;
  content: string;
}

export interface ReviewDocumentVersionRequest {
  versionId: UUID;
  decision: ApprovalDecision;
  rationale?: string;
}

export interface ScheduleMeetingRequest {
  projectId: UUID;
  title: string;
  description?: string;
  type: MeetingType;
  sourceContextType: MeetingSourceContextType;
  sourceContextId?: UUID | null;
  participantIds: UUID[];
  candidateSlots: Array<{
    startsAt: ISODateTime;
    endsAt: ISODateTime;
  }>;
}

export interface CastMeetingVoteRequest {
  slotId: UUID;
  participantId: UUID;
  status: VoteStatus;
}

export interface PublishMeetingRecapRequest {
  meetingId: UUID;
  approved: boolean;
  createTaskItems?: UUID[];
}

export interface CreateReleaseRequest {
  projectId: UUID;
  version: string;
  title: string;
  targetDate?: ISODate | null;
  pullRequestIds?: UUID[];
}

export interface CreateNotificationRequest {
  userId: UUID;
  actorUserId?: UUID | null;
  title: string;
  description: string;
  entityType?: string;
  entityId?: UUID | null;
}
