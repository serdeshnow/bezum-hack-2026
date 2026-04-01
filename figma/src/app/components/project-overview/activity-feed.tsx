import {
  FileText,
  CheckSquare,
  Calendar,
  GitPullRequest,
  Rocket,
  User,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription } from "../ui/alert";

type ActivityType = "doc" | "task" | "meeting" | "pr" | "release";

interface Activity {
  id: string;
  type: ActivityType;
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
}

interface ActivityFeedProps {
  state: "loading" | "empty" | "error" | "populated";
  activities?: Activity[];
}

export function ActivityFeed({ state, activities = [] }: ActivityFeedProps) {
  const activityConfig: Record<
    ActivityType,
    { icon: React.ElementType; color: string; bgColor: string }
  > = {
    doc: {
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-950",
    },
    task: {
      icon: CheckSquare,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-950",
    },
    meeting: {
      icon: Calendar,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-950",
    },
    pr: {
      icon: GitPullRequest,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-950",
    },
    release: {
      icon: Rocket,
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-100 dark:bg-pink-950",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest updates and changes across all project entities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state === "loading" && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {state === "error" && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load activity feed. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {state === "empty" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="mb-4 size-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">No activity yet</h3>
            <p className="text-sm text-muted-foreground">
              Activity will appear here as your team works on the project
            </p>
          </div>
        )}

        {state === "populated" && (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity) => {
                const config = activityConfig[activity.type];
                const Icon = config.icon;

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                  >
                    {/* Activity Icon - uses Badge-like styling */}
                    <div className={`rounded-lg p-2 ${config.bgColor}`}>
                      <Icon className={`size-4 ${config.color}`} />
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-tight">
                            {activity.action}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.title}
                          </p>
                        </div>
                        {activity.metadata?.status && (
                          <Badge variant="secondary" className="text-xs">
                            {activity.metadata.status}
                          </Badge>
                        )}
                      </div>

                      {/* User and Time - uses Avatar component */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="size-4">
                          <AvatarFallback className="text-[8px]">
                            {activity.user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span>{activity.user.name}</span>
                        <span>•</span>
                        <span>{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
