export type UUID = string;
export type ISODate = string;
export type ISODateTime = string;

export type AppState = "loading" | "empty" | "error" | "populated";

export type WorkspaceRole = "customer" | "developer" | "manager" | "admin";
export type ThemePreference = "light" | "dark" | "system";

export type ProjectStatus = "draft" | "active" | "at-risk" | "archived" | "completed";
export type VisibilityMode = "internal" | "customer";

export type EpochPhase = "planning" | "development" | "qa" | "release" | "closed";
export type GoalStatus = "not-started" | "in-progress" | "completed" | "blocked";

export type TaskStatus = "backlog" | "todo" | "in-progress" | "review" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export type DocumentStatus = "draft" | "in-review" | "approved" | "obsolete" | "rejected";
export type DocumentAccessScope = "customer" | "manager" | "dev" | "internal";
export type DocumentLinkEntityType = "epoch" | "task" | "meeting" | "release" | "project";
export type ChangeSource = "manual" | "meeting" | "task" | "imported";
export type ApprovalDecision = "pending" | "approved" | "rejected" | "requested-changes";

export type MeetingStatus = "draft" | "scheduled" | "completed" | "cancelled";
export type MeetingType = "standup" | "planning" | "review" | "retrospective" | "workshop" | "ad-hoc";
export type MeetingSourceContextType = "task" | "doc" | "epoch" | "project" | "none";
export type VoteStatus = "available" | "maybe" | "unavailable" | "no-response";

export type ReleaseStatus = "planned" | "in-progress" | "deployed" | "failed" | "rolled-back";
export type PullRequestStatus = "open" | "reviewing" | "merged" | "closed";

export type NotificationType = "task" | "meeting" | "release" | "mention" | "doc" | "pr" | "system";
