import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Calendar,
  Plus,
  Video,
  Users,
  Clock,
  CheckSquare,
  FileText,
  Target,
  Check,
  X,
  ThumbsUp,
  Settings2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Send,
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
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Skeleton } from "../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Separator } from "../components/ui/separator";

type SchedulerState = "loading" | "empty" | "error" | "populated";
type SourceContext = "task" | "doc" | "epoch" | "none";
type VoteStatus = "available" | "maybe" | "unavailable" | "no-response";

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  votes: {
    [participantId: string]: VoteStatus;
  };
}

interface Participant {
  id: string;
  name: string;
  initials: string;
  role: string;
}

const mockSourceContext = {
  type: "task" as SourceContext,
  id: "T-123",
  title: "Implement OAuth2 Authentication",
  linkedEntities: {
    docs: 2,
    tasks: 1,
    epochs: 1,
  },
};

const mockParticipants: Participant[] = [
  { id: "p1", name: "Sarah Chen", initials: "SC", role: "Tech Lead" },
  { id: "p2", name: "Alex Johnson", initials: "AJ", role: "Developer" },
  { id: "p3", name: "Michael Brown", initials: "MB", role: "Product Manager" },
  { id: "p4", name: "Emily Davis", initials: "ED", role: "Designer" },
];

const mockTimeSlots: TimeSlot[] = [
  {
    id: "s1",
    date: "Apr 3, 2026",
    time: "10:00 AM",
    votes: {
      p1: "available",
      p2: "available",
      p3: "available",
      p4: "maybe",
    },
  },
  {
    id: "s2",
    date: "Apr 3, 2026",
    time: "2:00 PM",
    votes: {
      p1: "available",
      p2: "unavailable",
      p3: "available",
      p4: "available",
    },
  },
  {
    id: "s3",
    date: "Apr 4, 2026",
    time: "11:00 AM",
    votes: {
      p1: "maybe",
      p2: "available",
      p3: "no-response",
      p4: "available",
    },
  },
  {
    id: "s4",
    date: "Apr 4, 2026",
    time: "3:00 PM",
    votes: {
      p1: "available",
      p2: "available",
      p3: "maybe",
      p4: "unavailable",
    },
  },
];

const mockAvailabilityStrip = [
  { day: "Mon", date: "Apr 1", slots: ["9AM", "2PM", "4PM"] },
  { day: "Tue", date: "Apr 2", slots: ["10AM", "3PM"] },
  { day: "Wed", date: "Apr 3", slots: ["10AM", "2PM", "4PM"] },
  { day: "Thu", date: "Apr 4", slots: ["11AM", "3PM"] },
  { day: "Fri", date: "Apr 5", slots: ["9AM", "1PM", "3PM"] },
];

export function MeetingSchedulerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [schedulerState, setSchedulerState] = useState<SchedulerState>("populated");
  const [selectedSlot, setSelectedSlot] = useState<string>("s1");

  const sourceType = searchParams.get("from") || "none";

  // Loading State
  if (schedulerState === "loading") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (schedulerState === "error") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-6">
          <h1 className="text-2xl font-bold">Schedule Meeting</h1>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="size-4" />
            <AlertTitle>Failed to load scheduler</AlertTitle>
            <AlertDescription>
              There was an error loading the meeting scheduler. Please try
              refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Empty State
  if (schedulerState === "empty") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Schedule Meeting</h1>
              <p className="text-sm text-muted-foreground">
                Create and schedule team meetings
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-muted">
                <Calendar className="size-10 text-muted-foreground" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold">No meetings scheduled</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Start by scheduling your first meeting
            </p>
            <Button>
              <Plus className="mr-2 size-4" />
              Schedule Meeting
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Populated State
  const getVoteColor = (status: VoteStatus) => {
    const colors = {
      available: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
      maybe: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
      unavailable: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
      "no-response": "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    };
    return colors[status];
  };

  const getVoteIcon = (status: VoteStatus) => {
    if (status === "available") return <Check className="size-3" />;
    if (status === "unavailable") return <X className="size-3" />;
    return null;
  };

  const calculateSlotScore = (slot: TimeSlot) => {
    let score = 0;
    Object.values(slot.votes).forEach((vote) => {
      if (vote === "available") score += 3;
      if (vote === "maybe") score += 1;
      if (vote === "unavailable") score -= 1;
    });
    return score;
  };

  const bestSlot = mockTimeSlots.reduce((best, slot) =>
    calculateSlotScore(slot) > calculateSlotScore(best) ? slot : best
  );

  const getSourceIcon = () => {
    if (mockSourceContext.type === "task") return CheckSquare;
    if (mockSourceContext.type === "doc") return FileText;
    if (mockSourceContext.type === "epoch") return Target;
    return Calendar;
  };

  const SourceIcon = getSourceIcon();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Schedule Meeting</h1>
              <p className="text-sm text-muted-foreground">
                Find the best time for your team
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* State Switcher for Demo */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings2 className="mr-2 size-4" />
                    State: {schedulerState}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>View State (Demo)</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSchedulerState("populated")}>
                    Populated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSchedulerState("loading")}>
                    Loading
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSchedulerState("empty")}>
                    Empty
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSchedulerState("error")}>
                    Error
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button>
                <Send className="mr-2 size-4" />
                Send Invites
              </Button>
            </div>
          </div>

          {/* Source Context */}
          {mockSourceContext.type !== "none" && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <SourceIcon className="size-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        Created from {mockSourceContext.type}:
                      </p>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-sm"
                        onClick={() =>
                          navigate(
                            `/${mockSourceContext.type}s/${mockSourceContext.id}`
                          )
                        }
                      >
                        {mockSourceContext.title}
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Auto-linked: {mockSourceContext.linkedEntities.docs} docs,{" "}
                      {mockSourceContext.linkedEntities.tasks} tasks,{" "}
                      {mockSourceContext.linkedEntities.epochs} epochs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Meeting Details */}
            <Card>
              <CardHeader>
                <CardTitle>Meeting Details</CardTitle>
                <CardDescription>
                  Basic information about the meeting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    defaultValue="OAuth2 Implementation Discussion"
                    placeholder="Enter meeting title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    defaultValue="Discuss OAuth2 implementation approach, security considerations, and timeline."
                    placeholder="Enter meeting description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <Input defaultValue="60 minutes" />
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Participants</CardTitle>
                    <CardDescription>
                      Auto-filled from task context
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 size-4" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {participant.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{participant.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {participant.role}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Required</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Availability Strip */}
            <Card>
              <CardHeader>
                <CardTitle>Calendar Availability</CardTitle>
                <CardDescription>
                  Quick view of available time slots this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {mockAvailabilityStrip.map((day) => (
                    <div
                      key={day.date}
                      className="flex min-w-[100px] shrink-0 flex-col rounded-lg border border-border p-3"
                    >
                      <p className="text-sm font-semibold">{day.day}</p>
                      <p className="text-xs text-muted-foreground">{day.date}</p>
                      <Separator className="my-2" />
                      <div className="space-y-1">
                        {day.slots.map((slot, idx) => (
                          <div
                            key={idx}
                            className="rounded bg-green-100 px-2 py-1 text-center text-xs text-green-700 dark:bg-green-950 dark:text-green-300"
                          >
                            {slot}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Slot Voting Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Time Slot Voting</CardTitle>
                <CardDescription>
                  Team availability for proposed time slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-3 text-left text-sm font-medium">
                          Time Slot
                        </th>
                        {mockParticipants.map((p) => (
                          <th key={p.id} className="p-3 text-center">
                            <Avatar className="mx-auto size-8">
                              <AvatarFallback className="text-xs">
                                {p.initials}
                              </AvatarFallback>
                            </Avatar>
                          </th>
                        ))}
                        <th className="p-3 text-center text-sm font-medium">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTimeSlots.map((slot) => {
                        const score = calculateSlotScore(slot);
                        const isBest = slot.id === bestSlot.id;

                        return (
                          <tr
                            key={slot.id}
                            className={`cursor-pointer border-b border-border transition-colors hover:bg-accent ${
                              selectedSlot === slot.id
                                ? "bg-primary/5"
                                : ""
                            } ${isBest ? "ring-2 ring-primary/50" : ""}`}
                            onClick={() => setSelectedSlot(slot.id)}
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {isBest && (
                                  <Sparkles className="size-4 text-primary" />
                                )}
                                <div>
                                  <p className="text-sm font-medium">
                                    {slot.date}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {slot.time}
                                  </p>
                                </div>
                              </div>
                            </td>
                            {mockParticipants.map((p) => (
                              <td key={p.id} className="p-3 text-center">
                                <div
                                  className={`mx-auto flex size-8 items-center justify-center rounded-full ${getVoteColor(
                                    slot.votes[p.id]
                                  )}`}
                                >
                                  {getVoteIcon(slot.votes[p.id])}
                                </div>
                              </td>
                            ))}
                            <td className="p-3 text-center">
                              <Badge
                                variant={isBest ? "default" : "secondary"}
                              >
                                {score > 0 ? `+${score}` : score}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="size-3 rounded-full bg-green-100 dark:bg-green-950" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="size-3 rounded-full bg-yellow-100 dark:bg-yellow-950" />
                    <span>Maybe</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="size-3 rounded-full bg-red-100 dark:bg-red-950" />
                    <span>Unavailable</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="size-3 rounded-full bg-gray-100 dark:bg-gray-800" />
                    <span>No response</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Slot Recommendation */}
            <Alert>
              <Sparkles className="size-4" />
              <AlertTitle>Recommended Time Slot</AlertTitle>
              <AlertDescription>
                Based on availability votes, {bestSlot.date} at {bestSlot.time}{" "}
                has the highest score ({calculateSlotScore(bestSlot)}). This time
                works best for the most participants.
              </AlertDescription>
            </Alert>
          </div>
        </ScrollArea>

        {/* Right Sidebar */}
        <div className="w-80 shrink-0 border-l border-border bg-muted/30 p-6">
          <ScrollArea className="h-full">
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold">Selected Slot</h3>
                {selectedSlot && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {
                              mockTimeSlots.find((s) => s.id === selectedSlot)
                                ?.date
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Time</p>
                          <p className="font-medium">
                            {
                              mockTimeSlots.find((s) => s.id === selectedSlot)
                                ?.time
                            }
                          </p>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Availability
                          </p>
                          <div className="mt-2 space-y-1">
                            {(() => {
                              const slot = mockTimeSlots.find(
                                (s) => s.id === selectedSlot
                              );
                              if (!slot) return null;

                              const available = Object.values(slot.votes).filter(
                                (v) => v === "available"
                              ).length;
                              const maybe = Object.values(slot.votes).filter(
                                (v) => v === "maybe"
                              ).length;

                              return (
                                <>
                                  <p className="text-sm">
                                    {available} / {mockParticipants.length}{" "}
                                    available
                                  </p>
                                  {maybe > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      {maybe} tentative
                                    </p>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 font-semibold">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 size-4" />
                    Add Time Slot
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 size-4" />
                    Request Votes
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Video className="mr-2 size-4" />
                    Add Video Link
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 font-semibold">Confirm Event</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Create calendar event for the selected time slot
                </p>
                <Button className="w-full" size="lg">
                  <Calendar className="mr-2 size-4" />
                  Create Event
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
