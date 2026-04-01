import {
  FileText,
  CheckSquare,
  Calendar,
  GitPullRequest,
  Rocket,
  Plus,
  Upload,
  Download,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

interface QuickActionsPanelProps {
  onCreateDoc?: () => void;
  onCreateTask?: () => void;
  onScheduleMeeting?: () => void;
  onCreatePR?: () => void;
  onCreateRelease?: () => void;
  onExportData?: () => void;
  onImportData?: () => void;
}

export function QuickActionsPanel({
  onCreateDoc,
  onCreateTask,
  onScheduleMeeting,
  onCreatePR,
  onCreateRelease,
  onExportData,
  onImportData,
}: QuickActionsPanelProps) {
  const primaryActions = [
    {
      label: "Create Doc",
      icon: FileText,
      onClick: onCreateDoc,
      description: "New documentation",
      variant: "default" as const,
    },
    {
      label: "Create Task",
      icon: CheckSquare,
      onClick: onCreateTask,
      description: "Add new task",
      variant: "default" as const,
    },
    {
      label: "Schedule Meeting",
      icon: Calendar,
      onClick: onScheduleMeeting,
      description: "Plan a meeting",
      variant: "default" as const,
    },
    {
      label: "Create PR",
      icon: GitPullRequest,
      onClick: onCreatePR,
      description: "New pull request",
      variant: "outline" as const,
    },
    {
      label: "New Release",
      icon: Rocket,
      onClick: onCreateRelease,
      description: "Deploy release",
      variant: "outline" as const,
    },
  ];

  const utilityActions = [
    {
      label: "Export",
      icon: Download,
      onClick: onExportData,
      description: "Export project data",
    },
    {
      label: "Import",
      icon: Upload,
      onClick: onImportData,
      description: "Import data",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common actions for managing your project entities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Actions Grid - uses Button components */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {primaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.label} title={action.description}>
                <Button
                  variant={action.variant}
                  className="h-auto w-full flex-col gap-2 py-4"
                  onClick={action.onClick}
                >
                  <Icon className="size-5" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Utility Actions - uses Button components */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="text-sm text-muted-foreground">Data Management</div>
          <div className="flex gap-2">
            {utilityActions.map((action) => {
              const Icon = action.icon;
              return (
                <div key={action.label} title={action.description}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={action.onClick}
                  >
                    <Icon className="size-4" />
                    {action.label}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}