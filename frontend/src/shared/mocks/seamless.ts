import {
  ApprovalDecision,
  DocumentAccessScope,
  DocumentStatus,
  GoalStatus,
  MeetingSourceContextType,
  MeetingStatus,
  MeetingType,
  ProjectStatus,
  PullRequestStatus,
  ReleaseStatus,
  TaskPriority,
  TaskStatus,
  ThemePreference,
  VoteStatus,
  WorkspaceRole
} from '@/shared/api'

export type AppState = 'loading' | 'empty' | 'error' | 'populated'

export type UserSummary = {
  id: string
  name: string
  initials: string
  email: string
  role: WorkspaceRole
  avatarUrl?: string | null
}

export type ProjectListItem = {
  id: string
  key: string
  name: string
  description: string
  status: ProjectStatus
  progress: number
  teamSize: number
  tasksOpen: number
  dueDate: string | null
  epoch: string | null
}

export type ProjectOverview = {
  id: string
  name: string
  status: ProjectStatus
  visibilityMode: 'internal' | 'customer'
  stats: {
    status: 'on-track' | 'at-risk' | 'delayed'
    completion: number
    activeEpoch: { id: string; name: string } | null
    upcomingMeetings: number
    latestRelease: { id: string; version: string; date: string } | null
  }
  entities: {
    docs: number
    tasks: number
    meetings: number
    pullRequests: number
    releases: number
  }
}

export type GoalItem = {
  id: string
  title: string
  description: string
  status: GoalStatus
  progress: number
  owner: UserSummary
}

export type EpochWorkspace = {
  id: string
  projectId: string
  name: string
  status: ProjectStatus
  startDate: string
  endDate: string
  goals: GoalItem[]
  taskStats: {
    total: number
    completed: number
    inProgress: number
    blocked: number
    backlog: number
  }
  documents: Array<{ id: string; title: string; type: string; lastUpdated: string; author: string }>
  meetings: Array<{ id: string; title: string; date: string; time: string; attendees: number; type: MeetingType }>
  releaseReadiness: {
    version: string
    targetDate: string
    status: 'on-track' | 'at-risk'
    checklist: Array<{ id: string; item: string; completed: boolean }>
  }
}

export type TaskCard = {
  id: string
  key: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: UserSummary | null
  dueDate: string | null
  tags: string[]
}

export type TaskCommentView = {
  id: string
  user: UserSummary
  content: string
  timestamp: string
}

export type LinkedQuote = {
  text: string
  section: string
}

export type TaskDetails = TaskCard & {
  reporter: UserSummary | null
  createdDate: string | null
  epoch: { id: string; title: string } | null
  linkedDocs: Array<{ id: string; title: string; preview: string; quotes: LinkedQuote[]; lastUpdated: string }>
  linkedMeetings: Array<{ id: string; title: string; date: string; summary: string; hasRecording: boolean; attendees: number; keyPoints: string[] }>
  linkedPRs: Array<{ id: string; number: number; title: string; status: PullRequestStatus; branch: string; author: string; url: string | null }>
  linkedRelease: { id: string; version: string; status: ReleaseStatus; targetDate: string | null } | null
  comments: TaskCommentView[]
}

export type DocumentListItem = {
  id: string
  title: string
  description: string
  status: DocumentStatus
  accessScope: DocumentAccessScope
  author: UserSummary
  lastUpdated: string
  linkedTo: { epochs?: number; tasks?: number; meetings?: number; releases?: number }
  awaitingApproval: boolean
  folderId: string | null
}

export type DocumentFolder = {
  id: string
  name: string
  docCount: number
  children?: DocumentFolder[]
}

export type LinkedEntity = {
  id: string
  type: 'epoch' | 'task' | 'meeting' | 'release' | 'project'
  title: string
  status?: string
}

export type DocumentComment = {
  id: string
  author: UserSummary
  content: string
  timestamp: string
  resolved?: boolean
}

export type DocumentEditorData = {
  id: string
  title: string
  version: string
  status: DocumentStatus
  awaitingApproval: boolean
  owners: UserSummary[]
  approvers: Array<UserSummary & { approved: boolean }>
  content: string
  linkedEntities: LinkedEntity[]
  comments: DocumentComment[]
}

export type DocumentHistoryVersion = {
  id: string
  version: string
  timestamp: string
  author: UserSummary
  changeSource: 'manual' | 'meeting' | 'task' | 'imported'
  sourceDetail?: string
  changes: {
    additions: number
    deletions: number
    modifications: number
  }
  status: 'draft' | 'pending-approval' | 'approved' | 'rejected'
  approvals: Array<{
    approver: UserSummary
    status: ApprovalDecision
    decision?: ApprovalDecision
    rationale?: string
    timestamp?: string
  }>
}

export type MeetingSchedulerData = {
  sourceContext: {
    type: MeetingSourceContextType
    id?: string
    title?: string
    linkedEntities?: { docs?: number; tasks?: number; epochs?: number }
  }
  participants: Array<Omit<UserSummary, 'role'> & { role: string }>
  timeSlots: Array<{
    id: string
    date: string
    time: string
    votes: Record<string, VoteStatus>
  }>
  availabilityStrip: Array<{
    day: string
    date: string
    slots: string[]
  }>
}

export type MeetingRecapData = {
  id: string
  title: string
  date: string
  time: string
  status: MeetingStatus
  attendees: Array<Omit<UserSummary, 'role'> & { role: string }>
  recording: { duration: string; url: string | null } | null
  transcript: Array<{ speaker: string; time: string; text: string }>
  aiSummary: { overview: string; keyPoints: string[] }
  decisions: Array<{ id: string; decision: string; owner?: string | null }>
  actionItems: Array<{ id: string; task: string; assignee: UserSummary; dueDate: string | null; priority: TaskPriority; alreadyTask?: boolean; taskId?: string | null }>
  linkedDocuments: Array<{ id: string; title: string; updateSuggestion: string; applied?: boolean; appliedVersion?: string | null; reviewRequested?: boolean }>
  approved: boolean
}

export type ReleaseDashboardData = {
  releases: Array<{
    id: string
    version: string
    title: string
    date: string
    status: ReleaseStatus
    commits: number
    author: UserSummary
    changes: { features: number; fixes: number; breaking: number }
    linkedTaskIds?: string[]
    linkedPullRequestIds?: string[]
  }>
  pullRequests: Array<{
    id: string
    title: string
    number: number
    status: PullRequestStatus
    author: UserSummary
    branch: string
    commits: number
    date: string
    linkedTaskIds?: string[]
    releaseId?: string | null
  }>
}

export type NotificationItem = {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
  type: 'task' | 'meeting' | 'release' | 'mention' | 'doc' | 'pr' | 'system'
  user: UserSummary
  entityId?: string | null
}

export type SettingsData = {
  profile: {
    userId: string
    firstName: string
    lastName: string
    email: string
    role: WorkspaceRole
    avatarUrl: string | null
  }
  appearance: {
    theme: ThemePreference
  }
  notifications: {
    emailNotifications: boolean
    taskAssignmentsEnabled: boolean
    meetingRemindersEnabled: boolean
    releaseNotificationsEnabled: boolean
    mentionNotificationsEnabled: boolean
  }
}

type Database = {
  users: UserSummary[]
  projects: ProjectListItem[]
  projectOverviews: Record<string, ProjectOverview>
  epochs: Record<string, EpochWorkspace>
  tasks: TaskCard[]
  taskDetails: Record<string, TaskDetails>
  folders: DocumentFolder[]
  documents: DocumentListItem[]
  documentEditors: Record<string, DocumentEditorData>
  documentHistory: Record<string, DocumentHistoryVersion[]>
  meetingScheduler: MeetingSchedulerData
  meetingRecaps: Record<string, MeetingRecapData>
  releaseDashboard: ReleaseDashboardData
  notifications: NotificationItem[]
  settings: Record<string, SettingsData>
}

const users: UserSummary[] = [
  { id: 'user-manager', name: 'Sarah Chen', initials: 'SC', email: 'sarah@seamless.dev', role: WorkspaceRole.Manager },
  { id: 'user-dev', name: 'Alex Johnson', initials: 'AJ', email: 'alex@seamless.dev', role: WorkspaceRole.Developer },
  { id: 'user-customer', name: 'Emily Davis', initials: 'ED', email: 'emily@client.dev', role: WorkspaceRole.Customer },
  { id: 'user-admin', name: 'Michael Brown', initials: 'MB', email: 'michael@seamless.dev', role: WorkspaceRole.Admin }
]

function findUser(id: string) {
  return users.find((user) => user.id === id) ?? users[0]
}

const projectId = 'project-seamless'
const epochId = 'epoch-q2'
const releaseId = 'release-v210'

const db: Database = {
  users,
  projects: [
    {
      id: projectId,
      key: 'SEA',
      name: 'Seamless Platform',
      description: 'Unified delivery workspace for documents, tasks, meetings, releases, and notifications.',
      status: ProjectStatus.Active,
      progress: 68,
      teamSize: 4,
      tasksOpen: 6,
      dueDate: '2026-04-30',
      epoch: 'Q2 2026 Delivery'
    }
  ],
  projectOverviews: {
    [projectId]: {
      id: projectId,
      name: 'Seamless Platform',
      status: ProjectStatus.Active,
      visibilityMode: 'internal',
      stats: {
        status: 'on-track',
        completion: 68,
        activeEpoch: { id: epochId, name: 'Q2 2026 Delivery' },
        upcomingMeetings: 2,
        latestRelease: { id: releaseId, version: 'v2.1.0', date: '2026-04-30' }
      },
      entities: { docs: 3, tasks: 7, meetings: 2, pullRequests: 3, releases: 1 }
    }
  },
  epochs: {
    [epochId]: {
      id: epochId,
      projectId,
      name: 'Q2 2026 Delivery',
      status: ProjectStatus.Active,
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      goals: [
        { id: 'goal-1', title: 'Ship docs-task sync', description: 'Inline widgets and quote flow', status: GoalStatus.InProgress, progress: 70, owner: findUser('user-manager') },
        { id: 'goal-2', title: 'Meeting automation', description: 'Scheduling and AI recap', status: GoalStatus.InProgress, progress: 55, owner: findUser('user-admin') }
      ],
      taskStats: { total: 7, completed: 2, inProgress: 3, blocked: 1, backlog: 1 },
      documents: [
        { id: 'doc-architecture', title: 'System Architecture Overview', type: 'architecture', lastUpdated: '2 hours ago', author: 'Sarah Chen' },
        { id: 'doc-meeting', title: 'Meeting Automation Brief', type: 'planning', lastUpdated: '1 day ago', author: 'Michael Brown' }
      ],
      meetings: [
        { id: 'meeting-review', title: 'Architecture Review', date: 'Apr 8, 2026', time: '10:30 AM', attendees: 4, type: MeetingType.Review },
        { id: 'meeting-planning', title: 'Sprint Planning', date: 'Apr 11, 2026', time: '2:00 PM', attendees: 4, type: MeetingType.Planning }
      ],
      releaseReadiness: {
        version: 'v2.1.0',
        targetDate: 'Apr 30, 2026',
        status: 'at-risk',
        checklist: [
          { id: 'ready-1', item: 'Docs widgets validated', completed: true },
          { id: 'ready-2', item: 'Meeting recap publish flow', completed: false },
          { id: 'ready-3', item: 'PR status sync surfaced in tasks', completed: true }
        ]
      }
    }
  },
  tasks: [
    {
      id: 'task-auth',
      key: 'SEA-101',
      title: 'Implement OAuth2 authentication',
      description: 'Connect sign-in flow and document the security setup.',
      status: TaskStatus.InProgress,
      priority: TaskPriority.High,
      assignee: findUser('user-dev'),
      dueDate: '2026-04-05',
      tags: ['backend', 'security']
    },
    {
      id: 'task-docs',
      key: 'SEA-102',
      title: 'Wire document widgets to task statuses',
      description: 'Expose linked task state inside docs and quote changes back into tasks.',
      status: TaskStatus.Review,
      priority: TaskPriority.Critical,
      assignee: findUser('user-manager'),
      dueDate: '2026-04-04',
      tags: ['docs', 'ux']
    },
    {
      id: 'task-meeting',
      key: 'SEA-103',
      title: 'Publish meeting recap to documents',
      description: 'Let a recap spawn document updates and tasks.',
      status: TaskStatus.Todo,
      priority: TaskPriority.Medium,
      assignee: findUser('user-admin'),
      dueDate: '2026-04-12',
      tags: ['meeting', 'automation']
    },
    {
      id: 'task-release',
      key: 'SEA-104',
      title: 'Sync pull request status with task state',
      description: 'Show PR progress inside task details and release dashboards.',
      status: TaskStatus.Backlog,
      priority: TaskPriority.High,
      assignee: findUser('user-dev'),
      dueDate: '2026-04-18',
      tags: ['release', 'github']
    }
  ],
  taskDetails: {},
  folders: [
    {
      id: 'folder-root',
      name: 'All Documents',
      docCount: 3,
      children: [
        { id: 'folder-arch', name: 'Architecture', docCount: 1 },
        { id: 'folder-planning', name: 'Planning', docCount: 2 }
      ]
    }
  ],
  documents: [],
  documentEditors: {},
  documentHistory: {},
  meetingScheduler: {
    sourceContext: {
      type: MeetingSourceContextType.Task,
      id: 'task-auth',
      title: 'Implement OAuth2 authentication',
      linkedEntities: { docs: 2, tasks: 1, epochs: 1 }
    },
    participants: [
      { ...findUser('user-manager'), role: 'Tech Lead' },
      { ...findUser('user-dev'), role: 'Developer' },
      { ...findUser('user-admin'), role: 'Manager' },
      { ...findUser('user-customer'), role: 'Customer' }
    ],
    timeSlots: [
      { id: 'slot-1', date: 'Apr 3, 2026', time: '10:00 AM', votes: { 'user-manager': VoteStatus.Available, 'user-dev': VoteStatus.Available, 'user-admin': VoteStatus.Available, 'user-customer': VoteStatus.Maybe } },
      { id: 'slot-2', date: 'Apr 3, 2026', time: '2:00 PM', votes: { 'user-manager': VoteStatus.Available, 'user-dev': VoteStatus.Unavailable, 'user-admin': VoteStatus.Available, 'user-customer': VoteStatus.Available } },
      { id: 'slot-3', date: 'Apr 4, 2026', time: '11:00 AM', votes: { 'user-manager': VoteStatus.Maybe, 'user-dev': VoteStatus.Available, 'user-admin': VoteStatus.NoResponse, 'user-customer': VoteStatus.Available } }
    ],
    availabilityStrip: [
      { day: 'Thu', date: 'Apr 3', slots: ['10AM', '2PM'] },
      { day: 'Fri', date: 'Apr 4', slots: ['11AM', '3PM'] }
    ]
  },
  meetingRecaps: {
    'meeting-review': {
      id: 'meeting-review',
      title: 'Architecture Review',
      date: 'Apr 8, 2026',
      time: '10:30 AM - 11:20 AM',
      status: MeetingStatus.Completed,
      attendees: [
        { ...findUser('user-manager'), role: 'Tech Lead' },
        { ...findUser('user-dev'), role: 'Developer' },
        { ...findUser('user-admin'), role: 'Manager' }
      ],
      recording: { duration: '50:25', url: '#' },
      transcript: [
        { speaker: 'Sarah Chen', time: '0:00', text: 'Need docs to reflect live task status without leaving the editor.' },
        { speaker: 'Alex Johnson', time: '1:20', text: 'We can render task status widgets and push highlighted notes back into task comments.' }
      ],
      aiSummary: {
        overview: 'The team aligned docs widgets, quote flow, and meeting recap publication into document history.',
        keyPoints: ['Task widgets stay inline in markdown preview', 'Meeting recap can propose document updates', 'PR status remains backend-driven but visible in task details']
      },
      decisions: [
        { id: 'decision-1', decision: 'Use markdown shortcodes for inline widgets', owner: 'Sarah Chen' }
      ],
      actionItems: [
        { id: 'action-1', task: 'Implement shortcode renderer', assignee: findUser('user-dev'), dueDate: '2026-04-05', priority: TaskPriority.High, alreadyTask: true, taskId: 'task-docs' },
        { id: 'action-2', task: 'Draft meeting summary import for docs', assignee: findUser('user-admin'), dueDate: '2026-04-10', priority: TaskPriority.Medium }
      ],
      linkedDocuments: [
        { id: 'doc-architecture', title: 'System Architecture Overview', updateSuggestion: 'Add inline task widget and meeting summary block', applied: false, appliedVersion: null, reviewRequested: false }
      ],
      approved: false
    }
  },
  releaseDashboard: {
    releases: [
      {
        id: releaseId,
        version: 'v2.1.0',
        title: 'Docs and meetings integration release',
        date: 'Apr 30, 2026',
        status: ReleaseStatus.InProgress,
        commits: 28,
        author: findUser('user-admin'),
        changes: { features: 6, fixes: 4, breaking: 0 },
        linkedTaskIds: ['task-docs', 'task-meeting', 'task-release'],
        linkedPullRequestIds: ['pr-1', 'pr-2']
      }
    ],
    pullRequests: [
      {
        id: 'pr-1',
        title: 'feat: docs-task quote sync',
        number: 456,
        status: PullRequestStatus.Open,
        author: findUser('user-dev'),
        branch: 'feature/docs-quote-sync',
        commits: 8,
        date: '1 hour ago',
        linkedTaskIds: ['task-docs', 'task-release'],
        releaseId
      },
      {
        id: 'pr-2',
        title: 'feat: meeting recap publication',
        number: 457,
        status: PullRequestStatus.Reviewing,
        author: findUser('user-manager'),
        branch: 'feature/meeting-recap-publish',
        commits: 5,
        date: '3 hours ago',
        linkedTaskIds: ['task-meeting', 'task-docs'],
        releaseId
      }
    ]
  },
  notifications: [
    { id: 'notification-1', title: 'Mentioned in document comment', description: 'System Architecture Overview', timestamp: '2 minutes ago', read: false, type: 'mention', user: findUser('user-manager'), entityId: 'doc-architecture' },
    { id: 'notification-2', title: 'Meeting slot updated', description: 'Architecture Review', timestamp: '30 minutes ago', read: false, type: 'meeting', user: findUser('user-admin'), entityId: 'meeting-review' },
    { id: 'notification-3', title: 'Pull request moved to review', description: '#457 meeting recap publication', timestamp: '2 hours ago', read: true, type: 'pr', user: findUser('user-dev'), entityId: 'pr-2' }
  ],
  settings: {
    'user-manager': {
      profile: { userId: 'user-manager', firstName: 'Sarah', lastName: 'Chen', email: 'sarah@seamless.dev', role: WorkspaceRole.Manager, avatarUrl: null },
      appearance: { theme: ThemePreference.System },
      notifications: {
        emailNotifications: true,
        taskAssignmentsEnabled: true,
        meetingRemindersEnabled: true,
        releaseNotificationsEnabled: true,
        mentionNotificationsEnabled: true
      }
    }
  }
}

db.documents = [
  {
    id: 'doc-architecture',
    title: 'System Architecture Overview',
    description: 'High-level system architecture and delivery model.',
    status: DocumentStatus.InReview,
    accessScope: DocumentAccessScope.Manager,
    author: findUser('user-manager'),
    lastUpdated: '2 hours ago',
    linkedTo: { epochs: 1, tasks: 2, meetings: 1 },
    awaitingApproval: true,
    folderId: 'folder-arch'
  },
  {
    id: 'doc-meeting',
    title: 'Meeting Automation Brief',
    description: 'Scheduling, recording, transcript, and summary flow.',
    status: DocumentStatus.Draft,
    accessScope: DocumentAccessScope.Dev,
    author: findUser('user-admin'),
    lastUpdated: '1 day ago',
    linkedTo: { tasks: 1, meetings: 1 },
    awaitingApproval: false,
    folderId: 'folder-planning'
  }
]

db.documentEditors = {
  'doc-architecture': {
    id: 'doc-architecture',
    title: 'System Architecture Overview',
    version: '2.1',
    status: DocumentStatus.InReview,
    awaitingApproval: true,
    owners: [findUser('user-manager'), findUser('user-admin')],
    approvers: [{ ...findUser('user-admin'), approved: true }, { ...findUser('user-customer'), approved: false }],
    content: `# System Architecture Overview

Core delivery primitives:
- Project
- Epoch
- Task
- Document
- Meeting
- Release

[TASK_WIDGET:task-docs]

## Meeting loop

[MEETING_SUMMARY:meeting-review]

## Release visibility

[RELEASE_WIDGET:${releaseId}]

[PR_REFERENCE:pr-1]`,
    linkedEntities: [
      { id: epochId, type: 'epoch', title: 'Q2 2026 Delivery', status: 'active' },
      { id: 'task-docs', type: 'task', title: 'Wire document widgets to task statuses', status: 'review' },
      { id: 'meeting-review', type: 'meeting', title: 'Architecture Review', status: 'completed' },
      { id: releaseId, type: 'release', title: 'v2.1.0', status: 'in-progress' }
    ],
    comments: [
      { id: 'doc-comment-1', author: findUser('user-admin'), content: 'Please keep the inline task widget above the meeting section.', timestamp: '1 hour ago', resolved: false }
    ]
  },
  'doc-meeting': {
    id: 'doc-meeting',
    title: 'Meeting Automation Brief',
    version: '1.4',
    status: DocumentStatus.Draft,
    awaitingApproval: false,
    owners: [findUser('user-admin')],
    approvers: [{ ...findUser('user-manager'), approved: false }],
    content: `# Meeting Automation Brief

Goal: reduce manual work around scheduling and recap publication.

[TASK_WIDGET:task-meeting]`,
    linkedEntities: [
      { id: 'task-meeting', type: 'task', title: 'Publish meeting recap to documents', status: 'todo' },
      { id: 'meeting-review', type: 'meeting', title: 'Architecture Review', status: 'completed' }
    ],
    comments: []
  }
}

db.documentHistory = {
  'doc-architecture': [
    {
      id: 'history-1',
      version: '2.1',
      timestamp: '2 hours ago',
      author: findUser('user-manager'),
      changeSource: 'manual',
      changes: { additions: 15, deletions: 3, modifications: 8 },
      status: 'pending-approval',
      approvals: [
        { approver: findUser('user-admin'), status: ApprovalDecision.Approved, decision: ApprovalDecision.Approved, rationale: 'Ready for implementation review.', timestamp: '1 hour ago' },
        { approver: findUser('user-customer'), status: ApprovalDecision.Pending }
      ]
    },
    {
      id: 'history-2',
      version: '2.0',
      timestamp: '1 day ago',
      author: findUser('user-admin'),
      changeSource: 'meeting',
      sourceDetail: 'Architecture Review',
      changes: { additions: 22, deletions: 0, modifications: 5 },
      status: 'approved',
      approvals: [{ approver: findUser('user-manager'), status: ApprovalDecision.Approved, decision: ApprovalDecision.Approved, timestamp: '1 day ago' }]
    }
  ]
}

db.taskDetails = {
  'task-auth': {
    ...db.tasks[0],
    reporter: findUser('user-manager'),
    createdDate: '2026-03-25',
    epoch: { id: epochId, title: 'Q2 2026 Delivery' },
    linkedDocs: [
      { id: 'doc-architecture', title: 'System Architecture Overview', preview: 'High-level system architecture and delivery model.', quotes: [{ text: 'Use markdown shortcodes for inline widgets', section: 'Meeting loop' }], lastUpdated: '2 hours ago' }
    ],
    linkedMeetings: [
      { id: 'meeting-review', title: 'Architecture Review', date: 'Apr 8, 2026', summary: 'Aligned docs-task quote flow and meeting publication.', hasRecording: true, attendees: 3, keyPoints: ['Inline widgets in docs', 'Publish recap into history'] }
    ],
    linkedPRs: [
      { id: 'pr-1', number: 456, title: 'feat: docs-task quote sync', status: PullRequestStatus.Open, branch: 'feature/docs-quote-sync', author: 'Alex Johnson', url: '#' }
    ],
    linkedRelease: { id: releaseId, version: 'v2.1.0', status: ReleaseStatus.InProgress, targetDate: '2026-04-30' },
    comments: [{ id: 'task-comment-1', user: findUser('user-manager'), content: 'Need the doc quote to post back into task discussion automatically.', timestamp: '3 hours ago' }]
  },
  'task-docs': {
    ...db.tasks[1],
    reporter: findUser('user-admin'),
    createdDate: '2026-03-28',
    epoch: { id: epochId, title: 'Q2 2026 Delivery' },
    linkedDocs: [
      { id: 'doc-architecture', title: 'System Architecture Overview', preview: 'High-level system architecture and delivery model.', quotes: [{ text: 'Task widgets stay inline in markdown preview', section: 'Core delivery primitives' }], lastUpdated: '2 hours ago' }
    ],
    linkedMeetings: [],
    linkedPRs: [{ id: 'pr-2', number: 457, title: 'feat: meeting recap publication', status: PullRequestStatus.Reviewing, branch: 'feature/meeting-recap-publish', author: 'Sarah Chen', url: '#' }],
    linkedRelease: { id: releaseId, version: 'v2.1.0', status: ReleaseStatus.InProgress, targetDate: '2026-04-30' },
    comments: [{ id: 'task-comment-2', user: findUser('user-dev'), content: 'Renderer prototype is ready for review.', timestamp: '1 hour ago' }]
  },
  'task-meeting': {
    ...db.tasks[2],
    reporter: findUser('user-manager'),
    createdDate: '2026-03-29',
    epoch: { id: epochId, title: 'Q2 2026 Delivery' },
    linkedDocs: [{ id: 'doc-meeting', title: 'Meeting Automation Brief', preview: 'Scheduling, recording, transcript, and summary flow.', quotes: [], lastUpdated: '1 day ago' }],
    linkedMeetings: [{ id: 'meeting-review', title: 'Architecture Review', date: 'Apr 8, 2026', summary: 'Recap must be publishable into docs.', hasRecording: true, attendees: 3, keyPoints: ['Action items can become tasks'] }],
    linkedPRs: [],
    linkedRelease: null,
    comments: []
  },
  'task-release': {
    ...db.tasks[3],
    reporter: findUser('user-admin'),
    createdDate: '2026-03-30',
    epoch: { id: epochId, title: 'Q2 2026 Delivery' },
    linkedDocs: [],
    linkedMeetings: [],
    linkedPRs: [{ id: 'pr-1', number: 456, title: 'feat: docs-task quote sync', status: PullRequestStatus.Open, branch: 'feature/docs-quote-sync', author: 'Alex Johnson', url: '#' }],
    linkedRelease: { id: releaseId, version: 'v2.1.0', status: ReleaseStatus.InProgress, targetDate: '2026-04-30' },
    comments: []
  }
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

export function getUsers() {
  return clone(db.users)
}

export function getUserById(userId: string) {
  return clone(findUser(userId))
}

export function listProjects() {
  return clone(db.projects)
}

export function getProjectOverview(projectIdValue: string) {
  return clone(db.projectOverviews[projectIdValue])
}

export function getEpochWorkspace(epochIdValue: string) {
  return clone(db.epochs[epochIdValue])
}

export function listEpochs() {
  return clone(Object.values(db.epochs))
}

export function listTasks() {
  return clone(db.tasks)
}

export function getTaskDetails(taskId: string) {
  return clone(db.taskDetails[taskId])
}

export function updateTaskStatus(taskId: string, status: TaskStatus) {
  db.tasks = db.tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
  db.taskDetails[taskId] = { ...db.taskDetails[taskId], status }
  return clone(db.taskDetails[taskId])
}

export function addTaskComment(taskId: string, content: string, userId: string) {
  const comment: TaskCommentView = {
    id: `task-comment-${Date.now()}`,
    user: findUser(userId),
    content,
    timestamp: 'just now'
  }
  db.taskDetails[taskId] = {
    ...db.taskDetails[taskId],
    comments: [comment, ...db.taskDetails[taskId].comments]
  }
  return clone(comment)
}

export function listDocumentFolders() {
  return clone(db.folders)
}

export function listDocuments() {
  return clone(db.documents)
}

export function getDocumentEditor(docId: string) {
  return clone(db.documentEditors[docId])
}

export function updateDocument(docId: string, content: string) {
  const editor = db.documentEditors[docId]
  db.documentEditors[docId] = { ...editor, content }
  return clone(db.documentEditors[docId])
}

export function addDocumentLink(docId: string, entity: LinkedEntity) {
  const editor = db.documentEditors[docId]
  const alreadyLinked = editor.linkedEntities.some((item) => item.type === entity.type && item.id === entity.id)

  if (alreadyLinked) {
    return clone(editor)
  }

  db.documentEditors[docId] = {
    ...editor,
    linkedEntities: [...editor.linkedEntities, entity]
  }

  return clone(db.documentEditors[docId])
}

export function addDocumentComment(docId: string, content: string, userId: string) {
  const comment: DocumentComment = {
    id: `doc-comment-${Date.now()}`,
    author: findUser(userId),
    content,
    timestamp: 'just now',
    resolved: false
  }
  db.documentEditors[docId] = {
    ...db.documentEditors[docId],
    comments: [comment, ...db.documentEditors[docId].comments]
  }
  return clone(comment)
}

export function getDocumentHistory(docId: string) {
  return clone(db.documentHistory[docId] ?? [])
}

export function requestDocumentReview(docId: string, userId: string) {
  const editor = db.documentEditors[docId]
  const history = db.documentHistory[docId] ?? []
  const latestVersion = history[0]

  db.documentEditors[docId] = {
    ...editor,
    status: DocumentStatus.InReview,
    awaitingApproval: true
  }

  if (latestVersion) {
    history[0] = {
      ...latestVersion,
      status: 'pending-approval',
      changeSource: 'manual',
      approvals: latestVersion.approvals.length
        ? latestVersion.approvals
        : editor.approvers.map((approver) => ({
            approver: findUser(approver.id),
            status: ApprovalDecision.Pending
          }))
    }
  } else {
    history.unshift({
      id: `history-${Date.now()}`,
      version: editor.version,
      timestamp: 'just now',
      author: findUser(userId),
      changeSource: 'manual',
      changes: { additions: 0, deletions: 0, modifications: 1 },
      status: 'pending-approval',
      approvals: editor.approvers.map((approver) => ({
        approver: findUser(approver.id),
        status: ApprovalDecision.Pending
      }))
    })
  }

  db.documentHistory[docId] = history
  return clone(db.documentEditors[docId])
}

export function reviewDocumentVersion(
  docId: string,
  versionId: string,
  decision: ApprovalDecision,
  rationale: string | undefined,
  userId: string
) {
  const versions = db.documentHistory[docId] ?? []
  const targetVersion = versions.find((version) => version.id === versionId)

  if (!targetVersion) {
    return clone(versions)
  }

  const reviewer = findUser(userId)

  targetVersion.approvals = targetVersion.approvals.some((approval) => approval.approver.id === reviewer.id)
    ? targetVersion.approvals.map((approval) =>
        approval.approver.id === reviewer.id
          ? {
              ...approval,
              status: decision,
              decision,
              rationale,
              timestamp: 'just now'
            }
          : approval
      )
    : [
        {
          approver: reviewer,
          status: decision,
          decision,
          rationale,
          timestamp: 'just now'
        },
        ...targetVersion.approvals
      ]

  const hasRejected = targetVersion.approvals.some(
    (approval) => approval.status === ApprovalDecision.Rejected || approval.status === ApprovalDecision.RequestedChanges
  )
  const allApproved = targetVersion.approvals.length > 0 && targetVersion.approvals.every((approval) => approval.status === ApprovalDecision.Approved)

  targetVersion.status = hasRejected ? 'rejected' : allApproved ? 'approved' : 'pending-approval'

  db.documentEditors[docId] = {
    ...db.documentEditors[docId],
    status: allApproved ? DocumentStatus.Approved : hasRejected ? DocumentStatus.Draft : DocumentStatus.InReview,
    awaitingApproval: !allApproved
  }

  return clone(versions)
}

export function getMeetingScheduler() {
  return clone(db.meetingScheduler)
}

export function listMeetingRecaps() {
  return clone(Object.values(db.meetingRecaps))
}

export function voteMeetingSlot(slotId: string, userId: string, status: VoteStatus) {
  db.meetingScheduler.timeSlots = db.meetingScheduler.timeSlots.map((slot) =>
    slot.id === slotId
      ? {
          ...slot,
          votes: {
            ...slot.votes,
            [userId]: status
          }
        }
      : slot
  )
  return clone(db.meetingScheduler)
}

export function getMeetingRecap(meetingId: string) {
  return clone(db.meetingRecaps[meetingId])
}

export function publishMeetingRecap(meetingId: string, approved: boolean) {
  db.meetingRecaps[meetingId] = {
    ...db.meetingRecaps[meetingId],
    approved
  }
  return clone(db.meetingRecaps[meetingId])
}

export function createTaskFromMeetingActionItem(meetingId: string, actionItemId: string): MeetingRecapData | undefined {
  const recap = db.meetingRecaps[meetingId]
  const actionItem = recap?.actionItems.find((item) => item.id === actionItemId)

  if (!recap || !actionItem) {
    return recap ? clone(recap) : undefined
  }

  if (actionItem.alreadyTask && actionItem.taskId) {
    return clone(recap)
  }

  const numericKey = 101 + db.tasks.length
  const taskId = `task-generated-${Date.now()}`
  const task: TaskCard = {
    id: taskId,
    key: `SEA-${numericKey}`,
    title: actionItem.task,
    description: `Created from action item in ${recap.title}.`,
    status: TaskStatus.Todo,
    priority: actionItem.priority,
    assignee: actionItem.assignee,
    dueDate: actionItem.dueDate,
    tags: ['meeting', 'action-item']
  }

  db.tasks = [task, ...db.tasks]
  db.taskDetails[taskId] = {
    ...task,
    reporter: findUser('user-manager'),
    createdDate: '2026-04-02',
    epoch: { id: epochId, title: 'Q2 2026 Delivery' },
    linkedDocs: recap.linkedDocuments.map((document) => ({
      id: document.id,
      title: document.title,
      preview: document.updateSuggestion,
      quotes: [],
      lastUpdated: 'just now'
    })),
    linkedMeetings: [
      {
        id: recap.id,
        title: recap.title,
        date: recap.date,
        summary: recap.aiSummary.overview,
        hasRecording: Boolean(recap.recording?.url),
        attendees: recap.attendees.length,
        keyPoints: recap.aiSummary.keyPoints
      }
    ],
    linkedPRs: [],
    linkedRelease: null,
    comments: [
      {
        id: `task-comment-${Date.now()}`,
        user: findUser('user-manager'),
        content: `Created from meeting action item: ${actionItem.task}`,
        timestamp: 'just now'
      }
    ]
  }

  db.meetingRecaps[meetingId] = {
    ...recap,
    actionItems: recap.actionItems.map((item) =>
      item.id === actionItemId
        ? {
            ...item,
            alreadyTask: true,
            taskId
          }
        : item
    )
  }

  recap.linkedDocuments.forEach((document) => {
    const editor = db.documentEditors[document.id]
    if (!editor) return
    const alreadyLinked = editor.linkedEntities.some((entity) => entity.type === 'task' && entity.id === taskId)
    if (!alreadyLinked) {
      editor.linkedEntities = [...editor.linkedEntities, { id: taskId, type: 'task', title: task.title, status: task.status }]
    }
  })

  return clone(db.meetingRecaps[meetingId])
}

export function applyMeetingSummaryToDocument(
  meetingId: string,
  docId: string,
  mode: 'draft' | 'review',
  userId: string
): MeetingRecapData | undefined {
  const recap = db.meetingRecaps[meetingId]
  const editor = db.documentEditors[docId]

  if (!recap || !editor) {
    return recap ? clone(recap) : undefined
  }

  const meetingBlock = [
    '',
    `## Meeting Summary: ${recap.title}`,
    '',
    recap.aiSummary.overview,
    '',
    ...recap.aiSummary.keyPoints.map((point) => `- ${point}`),
    '',
    ...recap.decisions.map((decision) => `- Decision: ${decision.decision}${decision.owner ? ` (${decision.owner})` : ''}`)
  ].join('\n')

  const versionSegments = editor.version.split('.')
  const nextVersion = editor.version.includes('.')
    ? `${versionSegments.slice(0, -1).join('.')}.${Number(versionSegments[versionSegments.length - 1] ?? '0') + 1}`
    : `${editor.version}.1`

  const linkedEntities = editor.linkedEntities.some((entity) => entity.type === 'meeting' && entity.id === meetingId)
    ? editor.linkedEntities
    : [...editor.linkedEntities, { id: meetingId, type: 'meeting' as const, title: recap.title, status: recap.status }]

  db.documentEditors[docId] = {
    ...editor,
    version: nextVersion,
    content: `${editor.content}${meetingBlock}`,
    linkedEntities,
    status: mode === 'review' ? DocumentStatus.InReview : DocumentStatus.Draft,
    awaitingApproval: mode === 'review'
  }

  const historyEntry: DocumentHistoryVersion = {
    id: `history-${Date.now()}`,
    version: nextVersion,
    timestamp: 'just now',
    author: findUser(userId),
    changeSource: 'meeting',
    sourceDetail: recap.title,
    changes: {
      additions: recap.aiSummary.keyPoints.length + recap.decisions.length + 2,
      deletions: 0,
      modifications: 1
    },
    status: mode === 'review' ? 'pending-approval' : 'draft',
    approvals:
      mode === 'review'
        ? editor.approvers.map((approver) => ({
            approver: findUser(approver.id),
            status: ApprovalDecision.Pending
          }))
        : []
  }

  db.documentHistory[docId] = [historyEntry, ...(db.documentHistory[docId] ?? [])]

  db.documents = db.documents.map((document) =>
    document.id === docId
      ? {
          ...document,
          lastUpdated: 'just now',
          status: mode === 'review' ? DocumentStatus.InReview : DocumentStatus.Draft,
          awaitingApproval: mode === 'review'
        }
      : document
  )

  db.meetingRecaps[meetingId] = {
    ...recap,
    linkedDocuments: recap.linkedDocuments.map((document) =>
      document.id === docId
        ? {
            ...document,
            applied: true,
            appliedVersion: nextVersion,
            reviewRequested: mode === 'review'
          }
        : document
    )
  }

  return clone(db.meetingRecaps[meetingId])
}

export function getReleaseDashboard() {
  return clone(db.releaseDashboard)
}

export function listNotifications() {
  return clone(db.notifications)
}

export function markNotificationRead(notificationId: string) {
  db.notifications = db.notifications.map((notification) =>
    notification.id === notificationId ? { ...notification, read: true } : notification
  )
  return clone(db.notifications)
}

export function markAllNotificationsRead() {
  db.notifications = db.notifications.map((notification) => ({ ...notification, read: true }))
  return clone(db.notifications)
}

export function getSettings(userId: string) {
  return clone(db.settings[userId] ?? db.settings['user-manager'])
}

export function updateThemePreference(userId: string, theme: ThemePreference) {
  const current = getSettings(userId)
  db.settings[userId] = {
    ...current,
    appearance: { theme }
  }
  return clone(db.settings[userId])
}

export function updateNotificationSettings(userId: string, patch: Partial<SettingsData['notifications']>) {
  const current = getSettings(userId)
  db.settings[userId] = {
    ...current,
    notifications: {
      ...current.notifications,
      ...patch
    }
  }
  return clone(db.settings[userId])
}

export function signInByEmail(email: string) {
  const user = db.users.find((item) => item.email.toLowerCase() === email.toLowerCase()) ?? db.users[0]
  return clone(user)
}
