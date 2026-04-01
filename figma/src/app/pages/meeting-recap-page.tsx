import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  Video,
  Play,
  Download,
  MessageSquare,
  CheckSquare,
  Sparkles,
  Settings2,
  AlertCircle,
  ThumbsUp,
  Link as LinkIcon,
  Plus,
  FileCheck,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { Skeleton } from "../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

type RecapState = "loading" | "empty" | "error" | "populated";

const mockMeeting = {
  id: "m1",
  title: "OAuth2 Architecture Review",
  date: "Mar 28, 2026",
  time: "2:00 PM - 3:00 PM",
  attendees: [
    { name: "Sarah Chen", initials: "SC", role: "Tech Lead" },
    { name: "Alex Johnson", initials: "AJ", role: "Developer" },
    { name: "Michael Brown", initials: "MB", role: "Product Manager" },
  ],
  recording: {
    duration: "58:42",
    url: "#",
  },
  transcript: [
    { speaker: "Sarah Chen", time: "0:00", text: "Let's start by reviewing the OAuth2 implementation approach." },
    { speaker: "Alex Johnson", time: "1:23", text: "I've prepared a diagram showing the authentication flow. Should we use PKCE for all clients?" },
    { speaker: "Michael Brown", time: "2:45", text: "Yes, PKCE is essential for security. We need this documented clearly." },
    { speaker: "Sarah Chen", time: "4:12", text: "Agreed. Let's also discuss token refresh strategies." },
  ],
  aiSummary: {
    overview: "The team discussed OAuth2 implementation strategy, focusing on PKCE flow, token management, and security best practices. Key decisions were made regarding session duration and API rate limiting.",
    keyPoints: [
      "Use PKCE flow for all OAuth clients including mobile and web",
      "Session duration set to 24 hours with silent refresh",
      "Implement rate limiting on all OAuth endpoints",
      "Document security best practices in API guide",
    ],
  },
  decisions: [
    {
      id: "d1",
      decision: "Adopt PKCE flow for OAuth2",
      rationale: "Enhanced security for public clients and SPAs",
      owner: "Sarah Chen",
    },
    {
      id: "d2",
      decision: "24-hour session duration",
      rationale: "Balance between security and user experience",
      owner: "Michael Brown",
    },
  ],
  actionItems: [
    {
      id: "a1",
      task: "Implement PKCE flow in authentication service",
      assignee: { name: "Alex Johnson", initials: "AJ" },
      dueDate: "Apr 5, 2026",
      priority: "high",
      alreadyTask: false,
    },
    {
      id: "a2",
      task: "Update API security documentation",
      assignee: { name: "Sarah Chen", initials: "SC" },
      dueDate: "Apr 3, 2026",
      priority: "medium",
      alreadyTask: false,
    },
    {
      id: "a3",
      task: "Configure rate limiting for OAuth endpoints",
      assignee: { name: "Alex Johnson", initials: "AJ" },
      dueDate: "Apr 8, 2026",
      priority: "high",
      alreadyTask: false,
    },
  ],
  linkedDocuments: [
    {
      id: "d1",
      title: "OAuth2 Implementation Guide",
      updateSuggestion: "Add PKCE flow section and update security best practices",
    },
    {
      id: "d2",
      title: "API Security Specification",
      updateSuggestion: "Add rate limiting requirements for OAuth endpoints",
    },
  ],
};

export function MeetingRecapPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [recapState, setRecapState] = useState<RecapState>("populated");
  const [summaryApproved, setSummaryApproved] = useState(false);

  // Loading State
  if (recapState === "loading") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-9" />
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (recapState === "error") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/meetings")}>
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-2xl font-bold">Meeting Recap</h1>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="size-4" />
            <AlertTitle>Failed to load meeting</AlertTitle>
            <AlertDescription>
              There was an error loading the meeting recap.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Empty State
  if (recapState === "empty") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/meetings")}>
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-2xl font-bold">Meeting Not Found</h1>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <Calendar className="mx-auto mb-4 size-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">Meeting not found</h2>
            <p className="text-sm text-muted-foreground">
              This meeting doesn't exist or you don't have access
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Populated State
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/meetings")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{mockMeeting.title}</h1>
            <p className="text-sm text-muted-foreground">
              {mockMeeting.date} • {mockMeeting.time}
            </p>
          </div>
          <Badge variant="default">Completed</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 size-4" />
                State: {recapState}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRecapState("populated")}>
                Populated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRecapState("loading")}>
                Loading
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRecapState("empty")}>
                Empty
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRecapState("error")}>
                Error
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-6xl p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Recording & Transcript */}
            <div className="space-y-6 lg:col-span-2">
              {/* Video Recording */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="size-5 text-primary" />
                      <CardTitle>Recording</CardTitle>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {mockMeeting.recording.duration}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg bg-black/90 flex items-center justify-center">
                    <Button size="lg" variant="secondary">
                      <Play className="mr-2 size-5" />
                      Play Recording
                    </Button>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 size-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <LinkIcon className="mr-2 size-4" />
                      Share Link
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Attendees */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="size-5 text-primary" />
                    <CardTitle>Attendees ({mockMeeting.attendees.length})</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {mockMeeting.attendees.map((attendee) => (
                      <div
                        key={attendee.name}
                        className="flex items-center gap-2 rounded-lg border border-border p-2"
                      >
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {attendee.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{attendee.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {attendee.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Transcript */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="size-5 text-primary" />
                    <CardTitle>Transcript</CardTitle>
                  </div>
                  <CardDescription>
                    Auto-generated from recording
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {mockMeeting.transcript.map((entry, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {entry.time}
                            </span>
                            <span className="text-sm font-semibold">
                              {entry.speaker}:
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground pl-14">
                            {entry.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - AI Summary & Actions */}
            <div className="space-y-6">
              {/* AI Summary */}
              <Card className="border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    <CardTitle>AI Summary</CardTitle>
                  </div>
                  <CardDescription>
                    Auto-generated insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{mockMeeting.aiSummary.overview}</p>
                  <div>
                    <p className="mb-2 text-xs font-medium">Key Points:</p>
                    <ul className="space-y-1 pl-4">
                      {mockMeeting.aiSummary.keyPoints.map((point, idx) => (
                        <li key={idx} className="text-sm list-disc text-muted-foreground">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Decisions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-5 text-primary" />
                    <CardTitle>Decisions ({mockMeeting.decisions.length})</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockMeeting.decisions.map((decision) => (
                    <div
                      key={decision.id}
                      className="rounded-lg border border-border p-3 space-y-2"
                    >
                      <p className="text-sm font-semibold">{decision.decision}</p>
                      <p className="text-xs text-muted-foreground">
                        {decision.rationale}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>Owner:</span>
                        <span className="font-medium">{decision.owner}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="size-5 text-primary" />
                    <CardTitle>
                      Action Items ({mockMeeting.actionItems.length})
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Extracted from discussion
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockMeeting.actionItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-border p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{item.task}</p>
                        <Badge
                          variant={
                            item.priority === "high" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="size-5">
                          <AvatarFallback className="text-[10px]">
                            {item.assignee.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span>{item.assignee.name}</span>
                        <span>•</span>
                        <span>Due {item.dueDate}</span>
                      </div>
                      {!item.alreadyTask && (
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="mr-2 size-3" />
                          Create Task
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Document Update Suggestions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="size-5 text-primary" />
                    <CardTitle>Document Updates</CardTitle>
                  </div>
                  <CardDescription>
                    Suggested updates to linked documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockMeeting.linkedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-lg border border-border p-3 space-y-2"
                    >
                      <p className="text-sm font-semibold">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.updateSuggestion}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/docs/${doc.id}`)}
                      >
                        Update Document
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Approval Section */}
              <Card className={summaryApproved ? "border-green-500" : ""}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileCheck className="size-5 text-primary" />
                    <CardTitle>Attach Summary</CardTitle>
                  </div>
                  <CardDescription>
                    Approve to attach meeting summary to document versions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {summaryApproved ? (
                    <Alert>
                      <ThumbsUp className="size-4" />
                      <AlertTitle>Summary Approved</AlertTitle>
                      <AlertDescription>
                        Meeting summary has been attached to linked documents
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => setSummaryApproved(true)}
                    >
                      <ThumbsUp className="mr-2 size-4" />
                      Approve & Attach
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
