import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Clock,
  User,
  CheckCircle,
  XCircle,
  RotateCcw,
  FileText,
  Calendar,
  CheckSquare,
  Target,
  Download,
  MessageSquare,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  GitCompare,
  Eye,
  History,
  Settings2,
  Shield,
  FileEdit,
  Import,
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
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Skeleton } from "../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";

type HistoryState = "loading" | "empty" | "error" | "populated";
type ChangeSource = "manual" | "meeting" | "task" | "imported";
type ApprovalStatus = "pending" | "approved" | "rejected";

interface Version {
  id: string;
  version: string;
  timestamp: string;
  author: { name: string; initials: string };
  changeSource: ChangeSource;
  sourceDetail?: string;
  changes: {
    additions: number;
    deletions: number;
    modifications: number;
  };
  status: "draft" | "pending-approval" | "approved" | "rejected";
  approvals: Array<{
    approver: { name: string; initials: string };
    status: ApprovalStatus;
    decision?: string;
    rationale?: string;
    timestamp?: string;
  }>;
}

interface DecisionLogEntry {
  id: string;
  version: string;
  approver: { name: string; initials: string };
  decision: "approved" | "rejected" | "requested-changes";
  rationale: string;
  timestamp: string;
}

const mockVersions: Version[] = [
  {
    id: "v7",
    version: "2.1",
    timestamp: "2 hours ago",
    author: { name: "Sarah Chen", initials: "SC" },
    changeSource: "manual",
    changes: { additions: 15, deletions: 3, modifications: 8 },
    status: "pending-approval",
    approvals: [
      {
        approver: { name: "Michael Brown", initials: "MB" },
        status: "approved",
        decision: "approved",
        rationale: "Technical architecture looks solid. Good level of detail.",
        timestamp: "1 hour ago",
      },
      {
        approver: { name: "Emily Davis", initials: "ED" },
        status: "pending",
      },
    ],
  },
  {
    id: "v6",
    version: "2.0",
    timestamp: "1 day ago",
    author: { name: "Alex Johnson", initials: "AJ" },
    changeSource: "meeting",
    sourceDetail: "Architecture Review Meeting",
    changes: { additions: 22, deletions: 0, modifications: 5 },
    status: "approved",
    approvals: [
      {
        approver: { name: "Michael Brown", initials: "MB" },
        status: "approved",
        decision: "approved",
        rationale: "Meeting notes accurately captured. Ready to proceed.",
        timestamp: "1 day ago",
      },
      {
        approver: { name: "Emily Davis", initials: "ED" },
        status: "approved",
        decision: "approved",
        rationale: "Approved with minor suggestions for formatting.",
        timestamp: "1 day ago",
      },
    ],
  },
  {
    id: "v5",
    version: "1.9",
    timestamp: "3 days ago",
    author: { name: "Sarah Chen", initials: "SC" },
    changeSource: "task",
    sourceDetail: "Implement Authentication (#T-123)",
    changes: { additions: 8, deletions: 2, modifications: 3 },
    status: "approved",
    approvals: [
      {
        approver: { name: "Michael Brown", initials: "MB" },
        status: "approved",
      },
      {
        approver: { name: "Emily Davis", initials: "ED" },
        status: "approved",
      },
    ],
  },
  {
    id: "v4",
    version: "1.8",
    timestamp: "5 days ago",
    author: { name: "David Wilson", initials: "DW" },
    changeSource: "imported",
    sourceDetail: "External API Documentation",
    changes: { additions: 45, deletions: 12, modifications: 18 },
    status: "approved",
    approvals: [
      {
        approver: { name: "Michael Brown", initials: "MB" },
        status: "approved",
      },
      {
        approver: { name: "Emily Davis", initials: "ED" },
        status: "approved",
      },
    ],
  },
  {
    id: "v3",
    version: "1.7",
    timestamp: "1 week ago",
    author: { name: "Sarah Chen", initials: "SC" },
    changeSource: "manual",
    changes: { additions: 12, deletions: 5, modifications: 7 },
    status: "rejected",
    approvals: [
      {
        approver: { name: "Michael Brown", initials: "MB" },
        status: "rejected",
        decision: "rejected",
        rationale:
          "Technical details need more clarification. Please add more context about the security implementation.",
        timestamp: "1 week ago",
      },
    ],
  },
];

const mockDecisionLog: DecisionLogEntry[] = [
  {
    id: "d1",
    version: "2.1",
    approver: { name: "Michael Brown", initials: "MB" },
    decision: "approved",
    rationale: "Technical architecture looks solid. Good level of detail.",
    timestamp: "1 hour ago",
  },
  {
    id: "d2",
    version: "2.0",
    approver: { name: "Emily Davis", initials: "ED" },
    decision: "approved",
    rationale: "Approved with minor suggestions for formatting.",
    timestamp: "1 day ago",
  },
  {
    id: "d3",
    version: "2.0",
    approver: { name: "Michael Brown", initials: "MB" },
    decision: "approved",
    rationale: "Meeting notes accurately captured. Ready to proceed.",
    timestamp: "1 day ago",
  },
  {
    id: "d4",
    version: "1.7",
    approver: { name: "Michael Brown", initials: "MB" },
    decision: "rejected",
    rationale:
      "Technical details need more clarification. Please add more context about the security implementation.",
    timestamp: "1 week ago",
  },
];

const mockDiffContent = {
  before: `# System Architecture Overview

This document outlines the high-level architecture of our platform.

## Overview

Our platform is built using a monolithic architecture.

## Technical Stack

### Frontend
- React 16
- CSS Modules

### Backend
- Node.js
- MySQL database`,
  after: `# System Architecture Overview

This document outlines the high-level architecture of our e-commerce platform.

## Overview

Our platform is built using a microservices architecture with the following core services:

- **Authentication Service**: Handles user authentication and authorization
- **Product Catalog**: Manages product information and inventory
- **Order Processing**: Processes customer orders and payments

## Technical Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling

### Backend
- Node.js with Express
- PostgreSQL database
- Redis for caching`,
};

export function DocumentHistoryPage() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [historyState, setHistoryState] = useState<HistoryState>("populated");
  const [selectedVersion, setSelectedVersion] = useState<string>("v7");
  const [compareVersion, setCompareVersion] = useState<string>("v6");
  const [showDiff, setShowDiff] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<string>("");

  // Loading State
  if (historyState === "loading") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-9 rounded-md" />
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className="flex flex-1">
          <div className="w-80 border-r border-border p-4">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="mb-4 h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (historyState === "error") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/docs/${docId}`)}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-xl font-bold">Version History</h1>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="size-4" />
            <AlertTitle>Failed to load version history</AlertTitle>
            <AlertDescription>
              There was an error loading the document history. Please try
              refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Empty State
  if (historyState === "empty") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/docs/${docId}`)}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-xl font-bold">Version History</h1>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-muted">
                <History className="size-10 text-muted-foreground" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold">No version history</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              This document doesn't have any version history yet
            </p>
            <Button onClick={() => navigate(`/docs/${docId}`)}>
              Back to Document
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Populated State
  const getChangeSourceConfig = (source: ChangeSource) => {
    const configs = {
      manual: {
        icon: FileEdit,
        label: "Manual Edit",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-950",
      },
      meeting: {
        icon: Calendar,
        label: "Meeting Notes",
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-100 dark:bg-purple-950",
      },
      task: {
        icon: CheckSquare,
        label: "Task Update",
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-100 dark:bg-green-950",
      },
      imported: {
        icon: Import,
        label: "Imported",
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-100 dark:bg-orange-950",
      },
    };
    return configs[source];
  };

  const getStatusBadge = (status: Version["status"]) => {
    const configs = {
      draft: { variant: "secondary" as const, label: "Draft" },
      "pending-approval": { variant: "secondary" as const, label: "Pending" },
      approved: { variant: "default" as const, label: "Approved" },
      rejected: { variant: "destructive" as const, label: "Rejected" },
    };
    return configs[status];
  };

  const selectedVersionData = mockVersions.find((v) => v.id === selectedVersion);
  const compareVersionData = mockVersions.find((v) => v.id === compareVersion);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/docs/${docId}`)}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Version History</h1>
              <p className="text-sm text-muted-foreground">
                System Architecture Overview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* State Switcher for Demo */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="mr-2 size-4" />
                  State: {historyState}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>View State (Demo)</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setHistoryState("populated")}>
                  Populated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setHistoryState("loading")}>
                  Loading
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setHistoryState("empty")}>
                  Empty
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setHistoryState("error")}>
                  Error
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              onClick={() => setShowDiff(!showDiff)}
            >
              <GitCompare className="mr-2 size-4" />
              {showDiff ? "Hide" : "Show"} Diff
            </Button>
            <Button onClick={() => navigate(`/docs/${docId}`)}>
              <Eye className="mr-2 size-4" />
              View Current
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Version Timeline Sidebar */}
        <div className="w-96 shrink-0 border-r border-border bg-muted/30">
          <div className="border-b border-border p-4">
            <h2 className="font-semibold">Version Timeline</h2>
            <p className="text-sm text-muted-foreground">
              {mockVersions.length} versions
            </p>
          </div>
          <ScrollArea className="h-[calc(100%-73px)]">
            <div className="relative p-4">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 h-full w-px bg-border" />

              <div className="space-y-4">
                {mockVersions.map((version, index) => {
                  const sourceConfig = getChangeSourceConfig(version.changeSource);
                  const statusConfig = getStatusBadge(version.status);
                  const SourceIcon = sourceConfig.icon;
                  const isSelected = selectedVersion === version.id;

                  return (
                    <div key={version.id} className="relative">
                      {/* Timeline Node */}
                      <div
                        className={`absolute left-4 flex size-8 items-center justify-center rounded-full border-4 border-background ${
                          isSelected
                            ? "bg-primary ring-4 ring-primary/20"
                            : "bg-muted"
                        }`}
                      >
                        <Clock
                          className={`size-4 ${
                            isSelected
                              ? "text-primary-foreground"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>

                      {/* Version Card */}
                      <Card
                        className={`ml-12 cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary shadow-md"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedVersion(version.id)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    v{version.version}
                                  </span>
                                  <Badge variant={statusConfig.variant}>
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {version.timestamp}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="size-8 p-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <History className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setVersionToRestore(version.id);
                                      setRestoreDialogOpen(true);
                                    }}
                                  >
                                    <RotateCcw className="mr-2 size-4" />
                                    Restore Version
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCompareVersion(version.id);
                                      setShowDiff(true);
                                    }}
                                  >
                                    <GitCompare className="mr-2 size-4" />
                                    Compare
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="mr-2 size-4" />
                                    Export
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Change Source */}
                            <div
                              className={`flex items-center gap-2 rounded-lg px-2 py-1 ${sourceConfig.bg}`}
                            >
                              <SourceIcon
                                className={`size-3 ${sourceConfig.color}`}
                              />
                              <span
                                className={`text-xs font-medium ${sourceConfig.color}`}
                              >
                                {sourceConfig.label}
                              </span>
                              {version.sourceDetail && (
                                <>
                                  <span className="text-xs text-muted-foreground">
                                    •
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {version.sourceDetail}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Changes Summary */}
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-green-600 dark:text-green-400">
                                +{version.changes.additions}
                              </span>
                              <span className="text-red-600 dark:text-red-400">
                                -{version.changes.deletions}
                              </span>
                              <span className="text-yellow-600 dark:text-yellow-400">
                                ~{version.changes.modifications}
                              </span>
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-2">
                              <Avatar className="size-6">
                                <AvatarFallback className="text-[10px]">
                                  {version.author.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {version.author.name}
                              </span>
                            </div>

                            {/* Approvals */}
                            {version.approvals.length > 0 && (
                              <div className="flex items-center gap-1">
                                {version.approvals.map((approval, i) => (
                                  <div key={i} className="relative">
                                    <Avatar className="size-6 border-2 border-background">
                                      <AvatarFallback className="text-[10px]">
                                        {approval.approver.initials}
                                      </AvatarFallback>
                                    </Avatar>
                                    {approval.status === "approved" && (
                                      <CheckCircle className="absolute -bottom-1 -right-1 size-3 rounded-full bg-background text-green-600" />
                                    )}
                                    {approval.status === "rejected" && (
                                      <XCircle className="absolute -bottom-1 -right-1 size-3 rounded-full bg-background text-red-600" />
                                    )}
                                    {approval.status === "pending" && (
                                      <Clock className="absolute -bottom-1 -right-1 size-3 rounded-full bg-background text-orange-600" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="space-y-6">
                {/* Version Details Header */}
                {selectedVersionData && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>
                            Version {selectedVersionData.version}
                          </CardTitle>
                          <CardDescription>
                            {selectedVersionData.timestamp} by{" "}
                            {selectedVersionData.author.name}
                          </CardDescription>
                        </div>
                        <Dialog
                          open={restoreDialogOpen}
                          onOpenChange={setRestoreDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              onClick={() =>
                                setVersionToRestore(selectedVersionData.id)
                              }
                            >
                              <RotateCcw className="mr-2 size-4" />
                              Restore Version
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Restore Version</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to restore version{" "}
                                {selectedVersionData.version}? This will create a
                                new version based on this historical state.
                              </DialogDescription>
                            </DialogHeader>
                            <Alert>
                              <AlertCircle className="size-4" />
                              <AlertTitle>Current work will be preserved</AlertTitle>
                              <AlertDescription>
                                Your current document will be saved as a new
                                version before restoring.
                              </AlertDescription>
                            </Alert>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setRestoreDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => {
                                  setRestoreDialogOpen(false);
                                  // Handle restore logic
                                }}
                              >
                                <RotateCcw className="mr-2 size-4" />
                                Restore
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                  </Card>
                )}

                {/* Approval Matrix */}
                {selectedVersionData && selectedVersionData.approvals.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Shield className="size-5 text-primary" />
                        <CardTitle>Approval Matrix</CardTitle>
                      </div>
                      <CardDescription>
                        Review and approval status for this version
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedVersionData.approvals.map((approval, index) => (
                          <div
                            key={index}
                            className="rounded-lg border border-border p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="size-10">
                                  <AvatarFallback>
                                    {approval.approver.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold">
                                    {approval.approver.name}
                                  </p>
                                  {approval.timestamp && (
                                    <p className="text-xs text-muted-foreground">
                                      {approval.timestamp}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div>
                                {approval.status === "approved" && (
                                  <Badge variant="default">
                                    <ThumbsUp className="mr-1 size-3" />
                                    Approved
                                  </Badge>
                                )}
                                {approval.status === "rejected" && (
                                  <Badge variant="destructive">
                                    <ThumbsDown className="mr-1 size-3" />
                                    Rejected
                                  </Badge>
                                )}
                                {approval.status === "pending" && (
                                  <Badge variant="secondary">
                                    <Clock className="mr-1 size-3" />
                                    Pending
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {approval.rationale && (
                              <div className="mt-3 rounded-lg bg-muted p-3">
                                <p className="text-sm text-muted-foreground">
                                  <MessageSquare className="mr-2 inline size-4" />
                                  {approval.rationale}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Diff Viewer */}
                {showDiff && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GitCompare className="size-5 text-primary" />
                          <CardTitle>Side-by-Side Comparison</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            v{compareVersionData?.version}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-sm text-muted-foreground">
                            v{selectedVersionData?.version}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Before */}
                        <div>
                          <div className="mb-2 flex items-center justify-between rounded-t-lg bg-red-100 px-3 py-2 dark:bg-red-950">
                            <span className="text-sm font-medium text-red-900 dark:text-red-100">
                              Before (v{compareVersionData?.version})
                            </span>
                          </div>
                          <div className="rounded-b-lg border border-border bg-muted/30 p-4">
                            <pre className="text-sm">
                              <code>{mockDiffContent.before}</code>
                            </pre>
                          </div>
                        </div>

                        {/* After */}
                        <div>
                          <div className="mb-2 flex items-center justify-between rounded-t-lg bg-green-100 px-3 py-2 dark:bg-green-950">
                            <span className="text-sm font-medium text-green-900 dark:text-green-100">
                              After (v{selectedVersionData?.version})
                            </span>
                          </div>
                          <div className="rounded-b-lg border border-border bg-muted/30 p-4">
                            <pre className="text-sm">
                              <code>{mockDiffContent.after}</code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Decision Log */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="size-5 text-primary" />
                      <CardTitle>Decision Log</CardTitle>
                    </div>
                    <CardDescription>
                      Historical record of approval decisions and rationale
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockDecisionLog.map((entry) => {
                        const decisionConfig = {
                          approved: {
                            icon: ThumbsUp,
                            color: "text-green-600 dark:text-green-400",
                            bg: "bg-green-100 dark:bg-green-950",
                            label: "Approved",
                          },
                          rejected: {
                            icon: ThumbsDown,
                            color: "text-red-600 dark:text-red-400",
                            bg: "bg-red-100 dark:bg-red-950",
                            label: "Rejected",
                          },
                          "requested-changes": {
                            icon: MessageSquare,
                            color: "text-orange-600 dark:text-orange-400",
                            bg: "bg-orange-100 dark:bg-orange-950",
                            label: "Requested Changes",
                          },
                        };
                        const config = decisionConfig[entry.decision];
                        const DecisionIcon = config.icon;

                        return (
                          <div
                            key={entry.id}
                            className="flex gap-3 rounded-lg border border-border p-3"
                          >
                            <div
                              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
                            >
                              <DecisionIcon
                                className={`size-5 ${config.color}`}
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {entry.approver.name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  v{entry.version}
                                </Badge>
                                <Badge
                                  variant={
                                    entry.decision === "approved"
                                      ? "default"
                                      : entry.decision === "rejected"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {config.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {entry.rationale}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {entry.timestamp}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
