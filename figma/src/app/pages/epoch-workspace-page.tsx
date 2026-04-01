import { useState } from "react";
import {
  Clock,
  Plus,
  Target,
  Calendar,
  TrendingUp,
  FileText,
  CheckSquare,
  Rocket,
  Users,
  AlertCircle,
  CheckCircle2,
  Circle,
  PlayCircle,
  Flag,
  ChevronRight,
  GitBranch,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Skeleton } from "../components/ui/skeleton";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

type EpochState = "loading" | "empty" | "error" | "populated";

const mockEpochData = {
  name: "Q2 2026 Sprint",
  phase: "Development",
  startDate: "Apr 1, 2026",
  endDate: "Apr 30, 2026",
  daysRemaining: 14,
  goals: [
    {
      id: "1",
      title: "Launch E-commerce Platform MVP",
      description: "Complete core features: cart, checkout, payment integration",
      status: "in-progress" as const,
      progress: 75,
      owner: { name: "Alex Johnson", initials: "AJ" },
    },
    {
      id: "2",
      title: "Achieve 95% Test Coverage",
      description: "Unit and integration tests for all critical paths",
      status: "in-progress" as const,
      progress: 88,
      owner: { name: "Sarah Chen", initials: "SC" },
    },
    {
      id: "3",
      title: "Complete API Documentation",
      description: "Full REST API reference with examples",
      status: "completed" as const,
      progress: 100,
      owner: { name: "Michael Brown", initials: "MB" },
    },
    {
      id: "4",
      title: "Performance Optimization",
      description: "Page load time under 2 seconds",
      status: "not-started" as const,
      progress: 0,
      owner: { name: "Emily Davis", initials: "ED" },
    },
  ],
  taskStats: {
    total: 89,
    completed: 61,
    inProgress: 21,
    blocked: 2,
    notStarted: 5,
  },
  documents: [
    {
      id: "1",
      title: "Sprint Planning Document",
      type: "planning",
      lastUpdated: "2 days ago",
      author: "Alex Johnson",
    },
    {
      id: "2",
      title: "Technical Architecture",
      type: "architecture",
      lastUpdated: "5 days ago",
      author: "Sarah Chen",
    },
    {
      id: "3",
      title: "API Specification v2.1",
      type: "spec",
      lastUpdated: "1 week ago",
      author: "Michael Brown",
    },
    {
      id: "4",
      title: "Release Notes Draft",
      type: "release",
      lastUpdated: "3 hours ago",
      author: "Emily Davis",
    },
  ],
  meetings: [
    {
      id: "1",
      title: "Daily Standup",
      date: "Apr 2, 2026",
      time: "9:00 AM",
      attendees: 8,
      type: "standup" as const,
    },
    {
      id: "2",
      title: "Sprint Review",
      date: "Apr 15, 2026",
      time: "2:00 PM",
      attendees: 12,
      type: "review" as const,
    },
    {
      id: "3",
      title: "Technical Design Session",
      date: "Apr 8, 2026",
      time: "10:30 AM",
      attendees: 5,
      type: "design" as const,
    },
    {
      id: "4",
      title: "Retrospective",
      date: "Apr 30, 2026",
      time: "3:00 PM",
      attendees: 8,
      type: "retrospective" as const,
    },
  ],
  releaseReadiness: {
    version: "v2.1.0",
    targetDate: "Apr 30, 2026",
    status: "at-risk" as const,
    checklist: [
      { id: "1", item: "All critical bugs fixed", completed: true },
      { id: "2", item: "Code review completed", completed: true },
      { id: "3", item: "QA testing passed", completed: false },
      { id: "4", item: "Documentation updated", completed: true },
      { id: "5", item: "Release notes prepared", completed: false },
      { id: "6", item: "Deployment scripts tested", completed: false },
    ],
  },
  timeline: [
    {
      id: "1",
      type: "milestone" as const,
      title: "Sprint Started",
      date: "Apr 1, 2026",
      description: "Q2 2026 Sprint kickoff",
    },
    {
      id: "2",
      type: "task" as const,
      title: "Payment Integration Completed",
      date: "Apr 5, 2026",
      description: "Stripe payment gateway integration",
    },
    {
      id: "3",
      type: "meeting" as const,
      title: "Design Review Meeting",
      date: "Apr 8, 2026",
      description: "UI/UX design review session",
    },
    {
      id: "4",
      type: "release" as const,
      title: "Beta Release v2.1.0-beta",
      date: "Apr 15, 2026",
      description: "Internal beta testing release",
    },
    {
      id: "5",
      type: "milestone" as const,
      title: "Production Release",
      date: "Apr 30, 2026",
      description: "Final production deployment",
      upcoming: true,
    },
  ],
};

export function EpochWorkspacePage() {
  const [epochState, setEpochState] = useState<EpochState>("populated");

  // Loading State
  if (epochState === "loading") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-background p-6">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (epochState === "error") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-6">
          <h1 className="text-2xl font-bold">Epoch Workspace</h1>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="size-4" />
            <AlertTitle>Failed to load epoch data</AlertTitle>
            <AlertDescription>
              There was an error loading the epoch workspace. Please try
              refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Empty State
  if (epochState === "empty") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Epoch Workspace</h1>
              <p className="text-sm text-muted-foreground">
                Plan and manage development sprints and epochs
              </p>
            </div>
            <Button>
              <Plus className="mr-2 size-4" />
              Create First Epoch
            </Button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-muted">
                <Clock className="size-10 text-muted-foreground" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold">No epochs yet</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Create your first epoch to start planning and tracking sprints
            </p>
            <Button>
              <Plus className="mr-2 size-4" />
              Create First Epoch
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Populated State
  const completionPercentage = Math.round(
    (mockEpochData.taskStats.completed / mockEpochData.taskStats.total) * 100
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{mockEpochData.name}</h1>
              <Badge variant="default">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {mockEpochData.phase} • {mockEpochData.startDate} -{" "}
              {mockEpochData.endDate} • {mockEpochData.daysRemaining} days
              remaining
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* State Switcher for Demo */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  State: {epochState}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>View State (Demo)</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEpochState("populated")}>
                  Populated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEpochState("loading")}>
                  Loading
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEpochState("empty")}>
                  Empty
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEpochState("error")}>
                  Error
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button>
              <Plus className="mr-2 size-4" />
              New Epoch
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-background p-6">
        <div className="space-y-6">
          {/* Progress Overview Card */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Sprint Progress</CardTitle>
              <CardDescription>
                Overall completion status across all tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Completion</span>
                  <span className="text-2xl font-bold">
                    {completionPercentage}%
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-3" />
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">
                    {mockEpochData.taskStats.total}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {mockEpochData.taskStats.completed}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">In Progress</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {mockEpochData.taskStats.inProgress}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Blocked</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {mockEpochData.taskStats.blocked}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Not Started</p>
                  <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                    {mockEpochData.taskStats.notStarted}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Goals Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="size-5 text-primary" />
                    <CardTitle>Epoch Goals</CardTitle>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 size-4" />
                    Add Goal
                  </Button>
                </div>
                <CardDescription>
                  Key objectives for this sprint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {mockEpochData.goals.map((goal) => (
                      <div
                        key={goal.id}
                        className="space-y-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{goal.title}</h4>
                              {goal.status === "completed" && (
                                <CheckCircle2 className="size-4 text-green-600" />
                              )}
                              {goal.status === "in-progress" && (
                                <PlayCircle className="size-4 text-blue-600" />
                              )}
                              {goal.status === "not-started" && (
                                <Circle className="size-4 text-gray-400" />
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {goal.description}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-medium">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-1.5" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-xs">
                              {goal.owner.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {goal.owner.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Release Readiness Panel */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Rocket className="size-5 text-primary" />
                    <CardTitle>Release Readiness</CardTitle>
                  </div>
                  <Badge
                    variant={
                      mockEpochData.releaseReadiness.status === "ready"
                        ? "default"
                        : mockEpochData.releaseReadiness.status === "at-risk"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {mockEpochData.releaseReadiness.status === "at-risk" && (
                      <AlertTriangle className="mr-1 size-3" />
                    )}
                    {mockEpochData.releaseReadiness.status
                      .replace("-", " ")
                      .toUpperCase()}
                  </Badge>
                </div>
                <CardDescription>
                  {mockEpochData.releaseReadiness.version} •{" "}
                  {mockEpochData.releaseReadiness.targetDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Completion Progress */}
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>Checklist Completion</span>
                      <span className="font-medium">
                        {
                          mockEpochData.releaseReadiness.checklist.filter(
                            (item) => item.completed
                          ).length
                        }
                        /{mockEpochData.releaseReadiness.checklist.length}
                      </span>
                    </div>
                    <Progress
                      value={
                        (mockEpochData.releaseReadiness.checklist.filter(
                          (item) => item.completed
                        ).length /
                          mockEpochData.releaseReadiness.checklist.length) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  {/* Checklist Items */}
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                      {mockEpochData.releaseReadiness.checklist.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 rounded-lg border border-border p-3"
                        >
                          <div
                            className={`flex size-5 shrink-0 items-center justify-center rounded ${
                              item.completed
                                ? "bg-green-100 dark:bg-green-950"
                                : "bg-gray-100 dark:bg-gray-800"
                            }`}
                          >
                            {item.completed ? (
                              <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Circle className="size-3.5 text-gray-400" />
                            )}
                          </div>
                          <span
                            className={`text-sm ${
                              item.completed
                                ? "text-muted-foreground line-through"
                                : ""
                            }`}
                          >
                            {item.item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <Button className="w-full" variant="outline">
                    <Package className="mr-2 size-4" />
                    View Release Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Documents Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-5 text-primary" />
                    <CardTitle>Related Documents</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
                <CardDescription>
                  Documentation linked to this epoch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockEpochData.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                        <FileText className="size-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{doc.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{doc.author}</span>
                          <span>•</span>
                          <span>{doc.lastUpdated}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {doc.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Meetings Calendar */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-5 text-primary" />
                    <CardTitle>Meetings Calendar</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Plus className="mr-1 size-4" />
                    Schedule
                  </Button>
                </div>
                <CardDescription>
                  Upcoming meetings for this epoch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockEpochData.meetings.map((meeting) => {
                    const meetingTypeConfig = {
                      standup: {
                        color: "text-blue-600 dark:text-blue-400",
                        bg: "bg-blue-100 dark:bg-blue-950",
                      },
                      review: {
                        color: "text-purple-600 dark:text-purple-400",
                        bg: "bg-purple-100 dark:bg-purple-950",
                      },
                      design: {
                        color: "text-orange-600 dark:text-orange-400",
                        bg: "bg-orange-100 dark:bg-orange-950",
                      },
                      retrospective: {
                        color: "text-green-600 dark:text-green-400",
                        bg: "bg-green-100 dark:bg-green-950",
                      },
                    };
                    const config = meetingTypeConfig[meeting.type];

                    return (
                      <div
                        key={meeting.id}
                        className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                      >
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
                        >
                          <Calendar className={`size-5 ${config.color}`} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">{meeting.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{meeting.date}</span>
                            <span>•</span>
                            <span>{meeting.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="size-3" />
                          <span>{meeting.attendees}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GitBranch className="size-5 text-primary" />
                <CardTitle>Timeline</CardTitle>
              </div>
              <CardDescription>
                Key events and milestones in this epoch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6 pl-8">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 h-full w-px bg-border" />

                {mockEpochData.timeline.map((event, index) => {
                  const timelineTypeConfig = {
                    milestone: {
                      icon: Flag,
                      color: "text-purple-600 dark:text-purple-400",
                      bg: "bg-purple-100 dark:bg-purple-950",
                    },
                    task: {
                      icon: CheckSquare,
                      color: "text-green-600 dark:text-green-400",
                      bg: "bg-green-100 dark:bg-green-950",
                    },
                    meeting: {
                      icon: Calendar,
                      color: "text-blue-600 dark:text-blue-400",
                      bg: "bg-blue-100 dark:bg-blue-950",
                    },
                    release: {
                      icon: Rocket,
                      color: "text-orange-600 dark:text-orange-400",
                      bg: "bg-orange-100 dark:bg-orange-950",
                    },
                  };
                  const config = timelineTypeConfig[event.type];
                  const Icon = config.icon;

                  return (
                    <div key={event.id} className="relative">
                      {/* Timeline Node */}
                      <div
                        className={`absolute -left-8 flex size-8 items-center justify-center rounded-full border-4 border-background ${
                          event.upcoming
                            ? "bg-primary ring-4 ring-primary/20"
                            : config.bg
                        }`}
                      >
                        <Icon
                          className={`size-4 ${
                            event.upcoming ? "text-primary-foreground" : config.color
                          }`}
                        />
                      </div>

                      {/* Timeline Content */}
                      <div
                        className={`rounded-lg border ${
                          event.upcoming
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card"
                        } p-4`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{event.title}</h4>
                              {event.upcoming && (
                                <Badge variant="default" className="text-xs">
                                  Upcoming
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {event.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}