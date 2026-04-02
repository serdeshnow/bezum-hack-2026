import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { ArrowLeft, AlertCircle, Settings2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { ProjectOverviewDashboard } from "../components/project-overview/project-overview-dashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

// Mock data per project ID
const mockProjectsDatabase = {
  "1": {
    name: "E-commerce Platform",
    stats: {
      status: "on-track" as const,
      completion: 68,
      activeEpoch: {
        name: "Q2 2026 Sprint",
        phase: "Development",
        daysLeft: 14,
      },
      openBlockers: 2,
      upcomingMeetings: 3,
      latestRelease: {
        version: "v2.1.0",
        date: "3 hours ago",
        trend: "up" as const,
      },
    },
    entities: {
      docs: 42,
      tasks: 89,
      meetings: 15,
      pullRequests: 23,
      releases: 8,
    },
    activities: [
      {
        id: "1",
        type: "task" as const,
        action: "Created task",
        title: "Implement user authentication flow",
        user: { name: "Alex Johnson", initials: "AJ" },
        timestamp: "5 minutes ago",
        metadata: { status: "In Progress" },
      },
      {
        id: "2",
        type: "doc" as const,
        action: "Updated documentation",
        title: "API Reference Guide v3",
        user: { name: "Sarah Chen", initials: "SC" },
        timestamp: "15 minutes ago",
        metadata: { status: "Published" },
      },
      {
        id: "3",
        type: "pr" as const,
        action: "Merged pull request",
        title: "Feature: Add dark mode support",
        user: { name: "Michael Brown", initials: "MB" },
        timestamp: "1 hour ago",
        metadata: { status: "Merged" },
      },
      {
        id: "4",
        type: "meeting" as const,
        action: "Scheduled meeting",
        title: "Sprint Planning Q2 2026",
        user: { name: "Emily Davis", initials: "ED" },
        timestamp: "2 hours ago",
        metadata: { status: "Upcoming" },
      },
      {
        id: "5",
        type: "release" as const,
        action: "Deployed release",
        title: "Version 2.1.0 to production",
        user: { name: "David Wilson", initials: "DW" },
        timestamp: "3 hours ago",
        metadata: { status: "Live" },
      },
    ],
  },
  "2": {
    name: "Mobile App Redesign",
    stats: {
      status: "at-risk" as const,
      completion: 45,
      activeEpoch: {
        name: "Q2 2026 Sprint",
        phase: "Design",
        daysLeft: 21,
      },
      openBlockers: 4,
      upcomingMeetings: 2,
      latestRelease: {
        version: "v1.8.2",
        date: "2 days ago",
        trend: "down" as const,
      },
    },
    entities: {
      docs: 28,
      tasks: 56,
      meetings: 12,
      pullRequests: 15,
      releases: 6,
    },
    activities: [
      {
        id: "1",
        type: "task" as const,
        action: "Created task",
        title: "Redesign navigation component",
        user: { name: "Lisa Wong", initials: "LW" },
        timestamp: "10 minutes ago",
        metadata: { status: "To Do" },
      },
      {
        id: "2",
        type: "meeting" as const,
        action: "Scheduled meeting",
        title: "Design Review Session",
        user: { name: "Tom Harris", initials: "TH" },
        timestamp: "30 minutes ago",
        metadata: { status: "Upcoming" },
      },
    ],
  },
  "3": {
    name: "Legacy System Migration",
    stats: {
      status: "on-track" as const,
      completion: 100,
      activeEpoch: null,
      openBlockers: 0,
      upcomingMeetings: 0,
      latestRelease: {
        version: "v3.0.0",
        date: "1 week ago",
        trend: "up" as const,
      },
    },
    entities: {
      docs: 65,
      tasks: 0,
      meetings: 8,
      pullRequests: 0,
      releases: 12,
    },
    activities: [
      {
        id: "1",
        type: "release" as const,
        action: "Deployed release",
        title: "Final migration v3.0.0",
        user: { name: "John Smith", initials: "JS" },
        timestamp: "1 week ago",
        metadata: { status: "Live" },
      },
    ],
  },
};

export function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dashboardState, setDashboardState] = useState<
    "loading" | "empty" | "error" | "populated"
  >("populated");

  // Get project data
  const projectData = id ? mockProjectsDatabase[id as keyof typeof mockProjectsDatabase] : undefined;

  // Project not found
  if (!projectData && dashboardState !== "loading") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Projects
            </Button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="size-4" />
            <AlertTitle>Project not found</AlertTitle>
            <AlertDescription>
              The project with ID "{id}" could not be found. Please check the URL or return to the projects list.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with Back Navigation */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Projects
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-lg font-semibold">
                {dashboardState === "loading" ? "Loading..." : projectData?.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Project Overview Dashboard
              </p>
            </div>
          </div>

          {/* State Switcher for Demo */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 size-4" />
                State: {dashboardState}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Dashboard State (Demo)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDashboardState("populated")}>
                Populated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDashboardState("loading")}>
                Loading
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDashboardState("empty")}>
                Empty
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDashboardState("error")}>
                Error
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto">
        <ProjectOverviewDashboard
          state={dashboardState}
          projectData={dashboardState === "populated" || dashboardState === "loading" ? projectData : undefined}
          onCreateDoc={() => {
            console.log("Navigate to create doc for project", id);
            // navigate(`/docs/new?project=${id}`);
          }}
          onCreateTask={() => {
            console.log("Navigate to create task for project", id);
            // navigate(`/tasks/new?project=${id}`);
          }}
          onScheduleMeeting={() => {
            console.log("Navigate to schedule meeting for project", id);
            // navigate(`/meetings/new?project=${id}`);
          }}
          onCreatePR={() => {
            console.log("Create PR for project", id);
          }}
          onCreateRelease={() => {
            console.log("Create release for project", id);
            // navigate(`/releases/new?project=${id}`);
          }}
          onExportData={() => {
            console.log("Export project data", id);
          }}
          onImportData={() => {
            console.log("Import project data", id);
          }}
        />
      </div>
    </div>
  );
}