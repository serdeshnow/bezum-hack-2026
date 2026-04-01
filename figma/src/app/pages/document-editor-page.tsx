import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Save,
  History,
  Eye,
  Settings,
  Bold,
  Italic,
  List,
  Link,
  CheckSquare,
  Calendar,
  Target,
  Rocket,
  GitPullRequest,
  MessageSquare,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Shield,
  Lock,
  MoreVertical,
  Send,
  ThumbsUp,
  ThumbsDown,
  Quote,
  FileText,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  AtSign,
  Settings2,
  CircleDot,
  PlayCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
import { Progress } from "../components/ui/progress";

type EditorState = "loading" | "empty" | "error" | "populated";
type DocStatus = "draft" | "in-review" | "approved" | "obsolete";

interface Comment {
  id: string;
  author: { name: string; initials: string };
  content: string;
  timestamp: string;
  resolved?: boolean;
}

interface LinkedEntity {
  id: string;
  type: "epoch" | "task" | "meeting" | "release";
  title: string;
  status?: string;
}

const mockDocument = {
  id: "1",
  title: "System Architecture Overview",
  version: "2.1",
  status: "in-review" as DocStatus,
  linkedEpoch: { id: "e1", title: "Q2 2026 Sprint" },
  linkedTasks: [
    { id: "t1", title: "Implement Authentication", status: "completed" },
    { id: "t2", title: "Database Migration", status: "in-progress" },
  ],
  linkedMeetings: [
    { id: "m1", title: "Architecture Review", status: "completed" },
  ],
  owners: [
    { name: "Sarah Chen", initials: "SC" },
    { name: "Alex Johnson", initials: "AJ" },
  ],
  approvers: [
    { name: "Michael Brown", initials: "MB", approved: true },
    { name: "Emily Davis", initials: "ED", approved: false },
  ],
  content: `# System Architecture Overview

This document outlines the high-level architecture of our e-commerce platform.

## Overview

Our platform is built using a microservices architecture with the following core services:

- **Authentication Service**: Handles user authentication and authorization
- **Product Catalog**: Manages product information and inventory
- **Order Processing**: Processes customer orders and payments
- **Notification Service**: Sends email and push notifications

[TASK_WIDGET:t1]

## Technical Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation

### Backend
- Node.js with Express
- PostgreSQL database
- Redis for caching

[MEETING_SUMMARY:m1]

## Database Schema

Our PostgreSQL database consists of the following main tables:

- users
- products
- orders
- order_items

[RELEASE_WIDGET:r1]

## API Integration

All services communicate via REST APIs with JWT authentication.

[PR_REFERENCE:pr123]

## Deployment

Services are containerized using Docker and deployed to Kubernetes clusters.`,
};

const mockComments: Comment[] = [
  {
    id: "c1",
    author: { name: "Michael Brown", initials: "MB" },
    content: "Should we add more details about the authentication flow?",
    timestamp: "2 hours ago",
    resolved: false,
  },
  {
    id: "c2",
    author: { name: "Emily Davis", initials: "ED" },
    content: "The database schema section looks good!",
    timestamp: "1 day ago",
    resolved: true,
  },
  {
    id: "c3",
    author: { name: "Sarah Chen", initials: "SC" },
    content: "We should link the deployment procedures document here.",
    timestamp: "2 days ago",
    resolved: false,
  },
];

const mockLinkedEntities: LinkedEntity[] = [
  { id: "e1", type: "epoch", title: "Q2 2026 Sprint", status: "active" },
  {
    id: "t1",
    type: "task",
    title: "Implement Authentication",
    status: "completed",
  },
  { id: "t2", type: "task", title: "Database Migration", status: "in-progress" },
  {
    id: "m1",
    type: "meeting",
    title: "Architecture Review",
    status: "completed",
  },
  { id: "r1", type: "release", title: "v2.1.0", status: "in-progress" },
];

export function DocumentEditorPage() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [editorState, setEditorState] = useState<EditorState>("populated");
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedText, setSelectedText] = useState("");

  // Loading State
  if (editorState === "loading") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-9 rounded-md" />
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="border-b border-border bg-muted/30 p-2">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex flex-1">
          <div className="flex-1 p-6">
            <div className="mx-auto max-w-4xl space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="w-80 border-l border-border p-4">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (editorState === "error") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/docs")}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-xl font-bold">Document Editor</h1>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="size-4" />
            <AlertTitle>Failed to load document</AlertTitle>
            <AlertDescription>
              There was an error loading the document. Please try refreshing the
              page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Empty State
  if (editorState === "empty") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/docs")}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Input
              placeholder="Document title..."
              className="flex-1 border-0 p-0 text-xl font-bold focus-visible:ring-0"
            />
            <Button>
              <Save className="mr-2 size-4" />
              Save
            </Button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-muted">
                <FileText className="size-10 text-muted-foreground" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold">Start writing</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Begin typing to create your document
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Populated State
  const getStatusConfig = (status: DocStatus) => {
    const configs = {
      draft: { color: "text-gray-600 dark:text-gray-400", variant: "secondary" as const },
      "in-review": { color: "text-blue-600 dark:text-blue-400", variant: "secondary" as const },
      approved: { color: "text-green-600 dark:text-green-400", variant: "default" as const },
      obsolete: { color: "text-red-600 dark:text-red-400", variant: "destructive" as const },
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(mockDocument.status);

  // Replace widget placeholders with actual components
  const renderContent = () => {
    const lines = mockDocument.content.split("\n");
    return lines.map((line, index) => {
      // Task Widget
      if (line.startsWith("[TASK_WIDGET:")) {
        const taskId = line.match(/\[TASK_WIDGET:(\w+)\]/)?.[1];
        const task = mockDocument.linkedTasks.find((t) => t.id === taskId);
        if (task) {
          return (
            <Card key={index} className="my-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <CheckSquare className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{task.title}</h4>
                      <Badge variant={task.status === "completed" ? "default" : "secondary"}>
                        {task.status === "completed" ? (
                          <CheckCircle className="mr-1 size-3" />
                        ) : (
                          <PlayCircle className="mr-1 size-3" />
                        )}
                        {task.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Task ID: {task.id}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/tasks/${task.id}`)}>
                    View Task
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        }
      }

      // Meeting Summary Widget
      if (line.startsWith("[MEETING_SUMMARY:")) {
        const meetingId = line.match(/\[MEETING_SUMMARY:(\w+)\]/)?.[1];
        const meeting = mockDocument.linkedMeetings.find((m) => m.id === meetingId);
        if (meeting) {
          return (
            <Card key={index} className="my-4 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Calendar className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{meeting.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Meeting Summary • {meeting.status}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/meetings/${meeting.id}`)}>
                    View Meeting
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        }
      }

      // Release Widget
      if (line.startsWith("[RELEASE_WIDGET:")) {
        return (
          <Card key={index} className="my-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <Rocket className="size-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">Release v2.1.0</h4>
                    <Badge variant="secondary">
                      <CircleDot className="mr-1 size-3" />
                      In Progress
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Readiness</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/releases")}>
                  View Release
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      }

      // PR Reference Widget
      if (line.startsWith("[PR_REFERENCE:")) {
        const prNumber = line.match(/\[PR_REFERENCE:(\w+)\]/)?.[1];
        return (
          <Card key={index} className="my-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <GitPullRequest className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">Pull Request #{prNumber}</h4>
                    <Badge variant="default">
                      <CheckCircle className="mr-1 size-3" />
                      Merged
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    feat: implement microservices architecture
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }

      // Regular text line
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="mb-4 mt-6 text-3xl font-bold">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="mb-3 mt-5 text-2xl font-bold">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="mb-2 mt-4 text-xl font-semibold">
            {line.substring(4)}
          </h3>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-6 list-disc">
            {line.substring(2)}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={index} className="h-4" />;
      }
      return (
        <p key={index} className="mb-2">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header - Metadata Bar */}
      <div className="border-b border-border bg-card p-4">
        <div className="space-y-3">
          {/* Top Row */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/docs")}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Input
              defaultValue={mockDocument.title}
              className="flex-1 border-0 p-0 text-xl font-bold focus-visible:ring-0"
            />
            <Badge variant={statusConfig.variant}>
              {mockDocument.status.replace("-", " ").toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">
              v{mockDocument.version}
            </span>
            <div className="flex items-center gap-2">
              {/* State Switcher for Demo */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings2 className="mr-2 size-4" />
                    State: {editorState}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>View State (Demo)</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setEditorState("populated")}>
                    Populated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditorState("loading")}>
                    Loading
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditorState("empty")}>
                    Empty
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditorState("error")}>
                    Error
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 size-4" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/docs/${docId}/history`)}
              >
                <History className="mr-2 size-4" />
                History
              </Button>
              <Button size="sm">
                <Save className="mr-2 size-4" />
                Save
              </Button>
            </div>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {/* Linked Epoch */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
              <Target className="size-4 text-primary" />
              <span className="text-muted-foreground">Epoch:</span>
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => navigate(`/epochs/${mockDocument.linkedEpoch.id}`)}
              >
                {mockDocument.linkedEpoch.title}
              </Button>
            </div>

            {/* Linked Tasks */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
              <CheckSquare className="size-4 text-primary" />
              <span className="text-muted-foreground">
                {mockDocument.linkedTasks.length} Task
                {mockDocument.linkedTasks.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Linked Meetings */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
              <Calendar className="size-4 text-primary" />
              <span className="text-muted-foreground">
                {mockDocument.linkedMeetings.length} Meeting
                {mockDocument.linkedMeetings.length !== 1 ? "s" : ""}
              </span>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Owners */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Owners:</span>
              <div className="flex -space-x-2">
                {mockDocument.owners.map((owner, i) => (
                  <Avatar key={i} className="size-6 border-2 border-background">
                    <AvatarFallback className="text-[10px]">
                      {owner.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Approvers */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Approvers:</span>
              <div className="flex items-center gap-1">
                {mockDocument.approvers.map((approver, i) => (
                  <div key={i} className="relative">
                    <Avatar className="size-6 border-2 border-background">
                      <AvatarFallback className="text-[10px]">
                        {approver.initials}
                      </AvatarFallback>
                    </Avatar>
                    {approver.approved ? (
                      <CheckCircle className="absolute -bottom-1 -right-1 size-3 rounded-full bg-background text-green-600" />
                    ) : (
                      <Clock className="absolute -bottom-1 -right-1 size-3 rounded-full bg-background text-orange-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border bg-muted/30 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <Bold className="size-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Italic className="size-4" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-6" />
            <Button variant="ghost" size="sm">
              <List className="size-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Link className="size-4" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-6" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Plus className="mr-2 size-4" />
                  Insert Widget
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <CheckSquare className="mr-2 size-4" />
                  Task Status
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 size-4" />
                  Meeting Summary
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Rocket className="mr-2 size-4" />
                  Release Widget
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <GitPullRequest className="mr-2 size-4" />
                  PR Reference
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Approval Actions */}
          {mockDocument.status === "in-review" && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Send className="mr-2 size-4" />
                Request Changes
              </Button>
              <Button variant="outline" size="sm" className="text-red-600">
                <ThumbsDown className="mr-2 size-4" />
                Reject
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <ThumbsUp className="mr-2 size-4" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl p-8">
            <div className="prose prose-slate max-w-none dark:prose-invert">
              {renderContent()}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        {showSidebar && (
          <div className="w-80 shrink-0 border-l border-border bg-muted/30">
            <Tabs defaultValue="comments" className="flex h-full flex-col">
              <div className="border-b border-border">
                <TabsList className="w-full justify-start rounded-none border-0 bg-transparent p-0">
                  <TabsTrigger
                    value="comments"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <MessageSquare className="mr-2 size-4" />
                    Comments
                  </TabsTrigger>
                  <TabsTrigger
                    value="links"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <Link className="mr-2 size-4" />
                    Links
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="comments" className="flex-1 overflow-hidden p-0">
                <div className="flex h-full flex-col">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {mockComments.map((comment) => (
                        <Card key={comment.id} className={comment.resolved ? "opacity-60" : ""}>
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <Avatar className="size-8">
                                <AvatarFallback className="text-xs">
                                  {comment.author.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold">
                                    {comment.author.name}
                                  </span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="size-6 p-0">
                                        <MoreVertical className="size-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Edit className="mr-2 size-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Quote className="mr-2 size-4" />
                                        Quote in Task
                                      </DropdownMenuItem>
                                      {!comment.resolved && (
                                        <DropdownMenuItem>
                                          <CheckCircle className="mr-2 size-4" />
                                          Resolve
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="mr-2 size-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <p className="mt-1 text-sm">{comment.content}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {comment.timestamp}
                                  </span>
                                  {comment.resolved && (
                                    <Badge variant="outline" className="text-xs">
                                      <CheckCircle className="mr-1 size-3" />
                                      Resolved
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Comment Input */}
                  <div className="border-t border-border p-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a comment..."
                        className="min-h-[60px] resize-none"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <Button variant="ghost" size="sm">
                        <AtSign className="mr-2 size-4" />
                        Mention
                      </Button>
                      <Button size="sm">
                        <Send className="mr-2 size-4" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="links" className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Linked Entities</h3>
                    {mockLinkedEntities.map((entity) => {
                      const iconMap = {
                        epoch: Target,
                        task: CheckSquare,
                        meeting: Calendar,
                        release: Rocket,
                      };
                      const colorMap = {
                        epoch: "text-purple-600 dark:text-purple-400",
                        task: "text-blue-600 dark:text-blue-400",
                        meeting: "text-green-600 dark:text-green-400",
                        release: "text-orange-600 dark:text-orange-400",
                      };
                      const Icon = iconMap[entity.type];

                      return (
                        <Card
                          key={entity.id}
                          className="cursor-pointer transition-colors hover:bg-accent"
                          onClick={() => {
                            const pathMap = {
                              epoch: "/epochs",
                              task: "/tasks",
                              meeting: "/meetings",
                              release: "/releases",
                            };
                            navigate(`${pathMap[entity.type]}/${entity.id}`);
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <Icon className={`size-4 ${colorMap[entity.type]}`} />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{entity.title}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {entity.type} • {entity.status}
                                </p>
                              </div>
                              <ChevronRight className="size-4 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    <Button variant="outline" className="w-full" size="sm">
                      <Plus className="mr-2 size-4" />
                      Link Entity
                    </Button>

                    <Separator className="my-4" />

                    <div>
                      <h3 className="mb-3 text-sm font-semibold">Quick Actions</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <Quote className="mr-2 size-4" />
                          Quote to Task
                        </Button>
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <Send className="mr-2 size-4" />
                          Share Document
                        </Button>
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <FileText className="mr-2 size-4" />
                          Export as PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}