import { useState } from "react";
import { TooltipProvider } from "../ui/tooltip";
import { SummaryCards } from "./summary-cards";
import { EntityGraph } from "./entity-graph";
import { ActivityFeed } from "./activity-feed";
import { VisibilityStrip } from "./visibility-strip";
import { QuickActionsPanel } from "./quick-actions-panel";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";

type DashboardState = "loading" | "empty" | "error" | "populated";

interface ProjectOverviewDashboardProps {
  state?: DashboardState;
  projectData?: {
    stats: {
      status: "on-track" | "at-risk" | "delayed";
      completion: number;
      activeEpoch: {
        name: string;
        phase: string;
        daysLeft: number;
      } | null;
      openBlockers: number;
      upcomingMeetings: number;
      latestRelease: {
        version: string;
        date: string;
        trend: "up" | "down";
      } | null;
    };
    entities: {
      docs: number;
      tasks: number;
      meetings: number;
      pullRequests: number;
      releases: number;
    };
    activities: Array<{
      id: string;
      type: "doc" | "task" | "meeting" | "pr" | "release";
      action: string;
      title: string;
      user: {
        name: string;
        initials: string;
      };
      timestamp: string;
      metadata?: {
        status?: string;
        priority?: string;
      };
    }>;
  };
  onCreateDoc?: () => void;
  onCreateTask?: () => void;
  onScheduleMeeting?: () => void;
  onCreatePR?: () => void;
  onCreateRelease?: () => void;
  onExportData?: () => void;
  onImportData?: () => void;
}

export function ProjectOverviewDashboard({
  state = "populated",
  projectData,
  onCreateDoc,
  onCreateTask,
  onScheduleMeeting,
  onCreatePR,
  onCreateRelease,
  onExportData,
  onImportData,
}: ProjectOverviewDashboardProps) {
  const [isCustomerVisible, setIsCustomerVisible] = useState(false);

  // Error State - uses Alert component
  if (state === "error") {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Failed to load project overview</AlertTitle>
          <AlertDescription>
            There was an error loading the project data. Please try refreshing
            the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty State - uses Alert component
  if (state === "empty") {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>No project data available</AlertTitle>
          <AlertDescription>
            This project doesn't have any data yet. Start by creating your first
            task or document.
          </AlertDescription>
        </Alert>
        <TooltipProvider>
          <QuickActionsPanel
            onCreateDoc={onCreateDoc}
            onCreateTask={onCreateTask}
            onScheduleMeeting={onScheduleMeeting}
            onCreatePR={onCreatePR}
            onCreateRelease={onCreateRelease}
            onExportData={onExportData}
            onImportData={onImportData}
          />
        </TooltipProvider>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto space-y-6 p-6">
        {/* Visibility Strip - uses Alert-based component */}
        <VisibilityStrip
          isCustomerVisible={isCustomerVisible}
          onToggleVisibility={setIsCustomerVisible}
          hiddenEntitiesCount={isCustomerVisible ? 0 : 24}
        />

        {/* Summary Cards - uses Card components */}
        <SummaryCards
          state={state === "loading" ? "loading" : "populated"}
          stats={projectData?.stats}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Entity Graph - uses Card component with custom visualization */}
          <div className="lg:col-span-2">
            <EntityGraph
              state={state === "loading" ? "loading" : "populated"}
              entities={projectData?.entities}
            />
          </div>

          {/* Activity Feed - uses Card with ScrollArea component */}
          <div className="lg:col-span-1">
            <ActivityFeed
              state={
                state === "loading"
                  ? "loading"
                  : projectData?.activities && projectData.activities.length > 0
                  ? "populated"
                  : "empty"
              }
              activities={projectData?.activities}
            />
          </div>
        </div>

        {/* Quick Actions Panel - uses Card with Button components */}
        <QuickActionsPanel
          onCreateDoc={onCreateDoc}
          onCreateTask={onCreateTask}
          onScheduleMeeting={onScheduleMeeting}
          onCreatePR={onCreatePR}
          onCreateRelease={onCreateRelease}
          onExportData={onExportData}
          onImportData={onImportData}
        />
      </div>
    </TooltipProvider>
  );
}
