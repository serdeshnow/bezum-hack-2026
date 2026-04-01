import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock,
  Link as LinkIcon,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  Video,
  GitBranch,
  GitPullRequest,
  Rocket,
  Users,
  Quote,
  Play,
  Download,
  ExternalLink,
  AlertTriangle,
  Zap,
  AtSign,
  Bell,
  Send,
  Settings2,
  CircleDot,
  CheckSquare,
  Target,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Skeleton } from "../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";

type TaskState = "loading" | "empty" | "error" | "populated";
type TaskPriority = "low" | "medium" | "high" | "critical";
type TaskStatus = "backlog" | "todo" | "in-progress" | "review" | "done";

interface Comment {
  id: string;
  user: {
    name: string;
    initials: string;
  };
  content: string;
  timestamp: string;
  mentions?: string[];
}

interface Activity {
  id: string;
  user: {
    name: string;
    initials: string;
  };
  action: string;
  timestamp: string;
  type: "status" | "assignment" | "comment" | "link" | "automation";
}

interface LinkedDoc {
  id: string;
  title: string;
  preview: string;
  quotes: Array<{ text: string; section: string }>;
  lastUpdated: string;
}

interface LinkedMeeting {
  id: string;
  title: string;
  date: string;
  summary: string;
  hasRecording: boolean;
  attendees: number;
  keyPoints: string[];
}

interface LinkedPR {
  id: string;
  number: number;
  title: string;
  status: "open" | "merged" | "closed";
  branch: string;
  author: string;
  additions: number;
  deletions: number;
  url: string;
}

interface LinkedRelease {
  id: string;
  version: string;
  status: "planned" | "in-progress" | "released";
  targetDate: string;
  progress: number;
}

// Mock data
const mockTask = {
  id: "T-123",
  title: "Implement OAuth2 Authentication",
  description:
    "Add OAuth2 integration with Google and GitHub providers. Include proper session management and refresh token handling. Ensure security best practices are followed.",
  status: "in-progress" as TaskStatus,
  priority: "high" as TaskPriority,
  assignee: { name: "Alex Johnson", initials: "AJ" },
  reporter: { name: "Sarah Chen", initials: "SC" },
  dueDate: "Apr 5, 2026",
  createdDate: "Mar 25, 2026",
  tags: ["backend", "security", "oauth"],
  epoch: { id: "e1", title: "Q2 2026 Sprint" },
  watchers: 5,
  blockers: [
    {
      id: "b1",
      title: "API rate limits not configured",
      description: "Need to set up rate limiting for OAuth endpoints",
    },
  ],
  linkedDocs: [
    {
      id: "d1",
      title: "OAuth2 Implementation Guide",
      preview:
        "This document outlines the implementation strategy for OAuth2 authentication...",
      quotes: [
        {
          text: "Use PKCE flow for mobile and SPA applications",
          section: "Security Best Practices",
        },
        {
          text: "Token refresh should happen silently in the background",
          section: "Session Management",
        },
      ],
      lastUpdated: "2 days ago",
    },
    {
      id: "d2",
      title: "API Security Specification",
      preview: "Comprehensive security requirements for all API endpoints...",
      quotes: [
        {
          text: "All OAuth endpoints must implement rate limiting",
          section: "Rate Limiting",
        },
      ],
      lastUpdated: "1 week ago",
    },
  ] as LinkedDoc[],
  linkedMeetings: [
    {
      id: "m1",
      title: "Authentication Architecture Review",
      date: "Mar 28, 2026",
      summary:
        "Discussed OAuth2 implementation approach, security considerations, and timeline.",
      hasRecording: true,
      attendees: 6,
      keyPoints: [
        "Decided on using Auth0 as OAuth provider",
        "Session duration set to 24 hours",
        "Need to implement CSRF protection",
      ],
    },
    {
      id: "m2",
      title: "Sprint Planning Session",
      date: "Mar 25, 2026",
      summary: "Assigned authentication tasks and set priorities for the sprint.",
      hasRecording: false,
      attendees: 8,
      keyPoints: [
        "Authentication is highest priority",
        "Target completion by April 5",
      ],
    },
  ] as LinkedMeeting[],
  linkedPRs: [
    {
      id: "pr1",
      number: 456,
      title: "feat: Add OAuth2 provider setup",
      status: "open" as const,
      branch: "feature/oauth-setup",
      author: "Alex Johnson",
      additions: 342,
      deletions: 28,
      url: "#",
    },
    {
      id: "pr2",
      number: 445,
      title: "chore: Update authentication dependencies",
      status: "merged" as const,
      branch: "chore/update-auth-deps",
      author: "Sarah Chen",
      additions: 15,
      deletions: 12,
      url: "#",
    },
  ] as LinkedPR[],
  linkedRelease: {
    id: "r1",
    version: "v2.1.0",
    status: "in-progress" as const,
    targetDate: "Apr 30, 2026",
    progress: 65,
  } as LinkedRelease,
  automationHints: [
    {
      id: "h1",
      type: "suggestion",
      message:
        "Task has been in 'In Progress' for 5 days. Consider updating status.",
    },
    {
      id: "h2",
      type: "warning",
      message: "Due date is in 2 days. Task may need priority adjustment.",
    },
    {
      id: "h3",
      type: "info",
      message:
        "Linked PR #456 has merge conflicts. Review may be blocked until resolved.",
    },
  ],
  comments: [
    {
      id: "c1",
      user: { name: "Sarah Chen", initials: "SC" },
      content:
        "@Alex make sure to handle edge cases for expired tokens. We had issues with this in the previous implementation.",
      timestamp: "2 hours ago",
      mentions: ["Alex"],
    },
    {
      id: "c2",
      user: { name: "Alex Johnson", initials: "AJ" },
      content: "Good point! I'll add comprehensive error handling for token refresh.",
      timestamp: "1 hour ago",
    },
    {
      id: "c3",
      user: { name: "Michael Brown", initials: "MB" },
      content:
        "Don't forget to update the API documentation once this is merged.",
      timestamp: "30 minutes ago",
    },
  ] as Comment[],
  activity: [
    {
      id: "a1",
      user: { name: "Alex Johnson", initials: "AJ" },
      action: "changed status from To Do to In Progress",
      timestamp: "3 hours ago",
      type: "status" as const,
    },
    {
      id: "a2",
      user: { name: "System", initials: "S" },
      action: "automatically linked PR #456",
      timestamp: "4 hours ago",
      type: "automation" as const,
    },
    {
      id: "a3",
      user: { name: "Sarah Chen", initials: "SC" },
      action: "added blocker: API rate limits not configured",
      timestamp: "5 hours ago",
      type: "status" as const,
    },
    {
      id: "a4",
      user: { name: "Alex Johnson", initials: "AJ" },
      action: "was assigned to this task",
      timestamp: "1 day ago",
      type: "assignment" as const,
    },
    {
      id: "a5",
      user: { name: "Sarah Chen", initials: "SC" },
      action: "linked document: OAuth2 Implementation Guide",
      timestamp: "1 day ago",
      type: "link" as const,
    },
  ] as Activity[],
};

export function TaskDetailsPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [taskState, setTaskState] = useState<TaskState>("populated");

  const priorityConfig: Record<
    TaskPriority,
    { label: string; variant: "default" | "secondary" | "destructive"; icon: typeof AlertCircle }
  > = {
    low: { label: "Low", variant: "secondary", icon: CircleDot },
    medium: { label: "Medium", variant: "default", icon: AlertCircle },
    high: { label: "High", variant: "default", icon: AlertTriangle },
    critical: { label: "Critical", variant: "destructive", icon: AlertCircle },
  };

  const statusConfig: Record<
    TaskStatus,
    { label: string; icon: React.ElementType; color: string }
  > = {
    backlog: { label: "Backlog", icon: Clock, color: "text-gray-500" },
    todo: { label: "To Do", icon: Clock, color: "text-blue-500" },
    "in-progress": {
      label: "In Progress",
      icon: CircleDot,
      color: "text-yellow-500",
    },
    review: { label: "Review", icon: CheckCircle2, color: "text-purple-500" },
    done: { label: "Done", icon: CheckCircle2, color: "text-green-500" },
  };

  // Loading State
  if (taskState === "loading") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-9 rounded-md" />
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
        <div className="flex flex-1">
          <div className="flex-1 p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
          <div className="w-80 border-l border-border p-6">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (taskState === "error") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/tasks")}>
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-2xl font-bold">Task Details</h1>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="size-4" />
            <AlertTitle>Failed to load task</AlertTitle>
            <AlertDescription>
              There was an error loading the task details. Please try refreshing
              the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Empty State
  if (taskState === "empty") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/tasks")}>
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-2xl font-bold">Task Not Found</h1>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-muted">
                <CheckSquare className="size-10 text-muted-foreground" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold">Task not found</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              This task doesn't exist or you don't have permission to view it
            </p>
            <Button onClick={() => navigate("/tasks")}>Back to Tasks</Button>
          </div>
        </div>
      </div>
    );
  }

  // Populated State
  const task = mockTask;
  const status = statusConfig[task.status];
  const StatusIcon = status.icon;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/tasks")}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <StatusIcon className={`size-5 ${status.color}`} />
                <h1 className="text-2xl font-bold">{task.title}</h1>
              </div>
              <p className="text-sm text-muted-foreground">Task {task.id}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* State Switcher for Demo */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings2 className="mr-2 size-4" />
                    State: {taskState}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTaskState("populated")}>
                    Populated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTaskState("loading")}>
                    Loading
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTaskState("empty")}>
                    Empty
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTaskState("error")}>
                    Error
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline">
                <Edit className="mr-2 size-4" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <LinkIcon className="mr-2 size-4" />
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 size-4" />
                    Watch task ({task.watchers})
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 size-4" />
                    Delete task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Linked Epoch */}
          {task.epoch && (
            <div className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              <span className="text-sm text-muted-foreground">Part of:</span>
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => navigate(`/epochs/${task.epoch.id}`)}
              >
                {task.epoch.title}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Automation Hints */}
            {task.automationHints && task.automationHints.length > 0 && (
              <div className="space-y-2">
                {task.automationHints.map((hint) => (
                  <Alert
                    key={hint.id}
                    variant={
                      hint.type === "warning" ? "destructive" : "default"
                    }
                  >
                    <Zap className="size-4" />
                    <AlertTitle>Automation Insight</AlertTitle>
                    <AlertDescription>{hint.message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{task.description}</p>
              </CardContent>
            </Card>

            {/* Blockers */}
            {task.blockers.length > 0 && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="size-5" />
                    Blockers ({task.blockers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.blockers.map((blocker) => (
                    <div
                      key={blocker.id}
                      className="rounded-lg border border-border bg-card p-3"
                    >
                      <h4 className="font-medium">{blocker.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {blocker.description}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Linked Documents */}
            {task.linkedDocs.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="size-5 text-primary" />
                    <CardTitle>Linked Documents ({task.linkedDocs.length})</CardTitle>
                  </div>
                  <CardDescription>
                    Documentation and references for this task
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {task.linkedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-lg border border-border p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Button
                            variant="link"
                            className="h-auto p-0 font-semibold"
                            onClick={() => navigate(`/docs/${doc.id}`)}
                          >
                            {doc.title}
                            <ExternalLink className="ml-2 size-3" />
                          </Button>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {doc.preview}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Updated {doc.lastUpdated}
                          </p>
                        </div>
                      </div>
                      {/* Quote Snippets */}
                      {doc.quotes && doc.quotes.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {doc.quotes.map((quote, idx) => (
                            <div
                              key={idx}
                              className="border-l-2 border-primary bg-muted/50 p-3"
                            >
                              <div className="flex items-start gap-2">
                                <Quote className="size-4 shrink-0 text-primary" />
                                <div className="flex-1">
                                  <p className="text-sm italic">{quote.text}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    — {quote.section}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Linked Meetings */}
            {task.linkedMeetings.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-5 text-primary" />
                    <CardTitle>
                      Linked Meetings ({task.linkedMeetings.length})
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Meetings where this task was discussed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {task.linkedMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="rounded-lg border border-border p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="link"
                              className="h-auto p-0 font-semibold"
                              onClick={() => navigate(`/meetings/${meeting.id}`)}
                            >
                              {meeting.title}
                              <ExternalLink className="ml-2 size-3" />
                            </Button>
                            {meeting.hasRecording && (
                              <Badge variant="secondary">
                                <Video className="mr-1 size-3" />
                                Recording
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{meeting.date}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="size-3" />
                              {meeting.attendees} attendees
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {meeting.summary}
                          </p>
                        </div>
                      </div>
                      {/* Key Points */}
                      {meeting.keyPoints && meeting.keyPoints.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-medium">Key Points:</p>
                          <ul className="space-y-1 pl-4">
                            {meeting.keyPoints.map((point, idx) => (
                              <li key={idx} className="list-disc text-sm text-muted-foreground">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {meeting.hasRecording && (
                        <Button variant="outline" size="sm" className="mt-3">
                          <Play className="mr-2 size-4" />
                          Watch Recording
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Linked PRs & Branch Info */}
            {task.linkedPRs.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="size-5 text-primary" />
                    <CardTitle>Pull Requests ({task.linkedPRs.length})</CardTitle>
                  </div>
                  <CardDescription>
                    Code changes related to this task
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.linkedPRs.map((pr) => {
                    const statusConfig = {
                      open: {
                        color: "text-green-600 dark:text-green-400",
                        bg: "bg-green-100 dark:bg-green-950",
                        label: "Open",
                      },
                      merged: {
                        color: "text-purple-600 dark:text-purple-400",
                        bg: "bg-purple-100 dark:bg-purple-950",
                        label: "Merged",
                      },
                      closed: {
                        color: "text-red-600 dark:text-red-400",
                        bg: "bg-red-100 dark:bg-red-950",
                        label: "Closed",
                      },
                    };
                    const config = statusConfig[pr.status];

                    return (
                      <div
                        key={pr.id}
                        className="flex items-start gap-3 rounded-lg border border-border p-3"
                      >
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
                        >
                          <GitPullRequest className={`size-5 ${config.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              #{pr.number}
                            </span>
                            <Badge
                              variant={pr.status === "merged" ? "default" : "secondary"}
                            >
                              {config.label}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm">{pr.title}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <GitBranch className="size-3" />
                              {pr.branch}
                            </span>
                            <span>•</span>
                            <span>{pr.author}</span>
                            <span>•</span>
                            <span className="text-green-600 dark:text-green-400">
                              +{pr.additions}
                            </span>
                            <span className="text-red-600 dark:text-red-400">
                              -{pr.deletions}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={pr.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="size-4" />
                          </a>
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Linked Release */}
            {task.linkedRelease && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Rocket className="size-5 text-primary" />
                    <CardTitle>Release Information</CardTitle>
                  </div>
                  <CardDescription>
                    Target release for this task
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{task.linkedRelease.version}</p>
                        <p className="text-sm text-muted-foreground">
                          Target: {task.linkedRelease.targetDate}
                        </p>
                      </div>
                      <Badge
                        variant={
                          task.linkedRelease.status === "released"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {task.linkedRelease.status
                          .split("-")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </Badge>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {task.linkedRelease.progress}%
                        </span>
                      </div>
                      <Progress value={task.linkedRelease.progress} />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/releases")}
                    >
                      View Release Dashboard
                      <ChevronRight className="ml-2 size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity & Comments */}
            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="comments">
                  <MessageSquare className="mr-2 size-4" />
                  Comments ({task.comments.length})
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Clock className="mr-2 size-4" />
                  Activity ({task.activity.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="comments" className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <Textarea
                      placeholder="Add a comment... Use @ to mention someone"
                      className="mb-3 min-h-[100px]"
                    />
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm">
                        <AtSign className="mr-2 size-4" />
                        Mention
                      </Button>
                      <Button size="sm">
                        <Send className="mr-2 size-4" />
                        Post Comment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <div className="space-y-3">
                  {task.comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback>
                              {comment.user.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {comment.user.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {comment.timestamp}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                            {comment.mentions && comment.mentions.length > 0 && (
                              <div className="flex items-center gap-1">
                                <AtSign className="size-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  mentioned {comment.mentions.join(", ")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="activity" className="space-y-3">
                {task.activity.map((item) => {
                  const activityIcons = {
                    status: CircleDot,
                    assignment: User,
                    comment: MessageSquare,
                    link: LinkIcon,
                    automation: Zap,
                  };
                  const ActivityIcon = activityIcons[item.type];

                  return (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                              item.type === "automation"
                                ? "bg-purple-100 dark:bg-purple-950"
                                : "bg-muted"
                            }`}
                          >
                            {item.user.name === "System" ? (
                              <ActivityIcon
                                className={`size-4 ${
                                  item.type === "automation"
                                    ? "text-purple-600 dark:text-purple-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ) : (
                              <Avatar className="size-8">
                                <AvatarFallback className="text-xs">
                                  {item.user.initials}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{item.user.name}</span>{" "}
                              {item.action}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.timestamp}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* Sidebar */}
        <div className="w-80 shrink-0 border-l border-border bg-muted/30 p-6">
          <ScrollArea className="h-full">
            <div className="space-y-6">
              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select defaultValue={task.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select defaultValue={task.priority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Assignee */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <User className="size-4" />
                  Assignee
                </label>
                <div className="flex items-center gap-2 rounded-md border border-border p-2">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-xs">
                      {task.assignee.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.assignee.name}</span>
                </div>
              </div>

              {/* Reporter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Reporter</label>
                <div className="flex items-center gap-2 rounded-md border border-border p-2">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-xs">
                      {task.reporter.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.reporter.name}</span>
                </div>
              </div>

              <Separator />

              {/* Dates */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4" />
                    Created
                  </span>
                  <span>{task.createdDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4" />
                    Due Date
                  </span>
                  <span className="font-medium">{task.dueDate}</span>
                </div>
              </div>

              <Separator />

              {/* Tags */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="size-4" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Quick Links */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quick Links</label>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="mr-2 size-4" />
                    {task.linkedDocs.length} Documents
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Calendar className="mr-2 size-4" />
                    {task.linkedMeetings.length} Meetings
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <GitPullRequest className="mr-2 size-4" />
                    {task.linkedPRs.length} Pull Requests
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
