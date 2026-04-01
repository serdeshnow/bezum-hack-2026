import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Rocket,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Skeleton } from "../ui/skeleton";

interface ProjectStats {
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
}

interface SummaryCardsProps {
  state: "loading" | "populated";
  stats?: ProjectStats;
}

export function SummaryCards({ state, stats }: SummaryCardsProps) {
  if (state === "loading") {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-1 h-7 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statusConfig = {
    "on-track": {
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-950",
      label: "On Track",
    },
    "at-risk": {
      icon: AlertCircle,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-950",
      label: "At Risk",
    },
    delayed: {
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-950",
      label: "Delayed",
    },
  };

  const status = statusConfig[stats.status];
  const StatusIcon = status.icon;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {/* Project Status Card - uses Card component */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Project Status</CardTitle>
          <div className={`rounded-lg p-2 ${status.bgColor}`}>
            <StatusIcon className={`size-4 ${status.color}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{status.label}</div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Completion</span>
              <span>{stats.completion}%</span>
            </div>
            <Progress value={stats.completion} className="h-1" />
          </div>
        </CardContent>
      </Card>

      {/* Active Epoch Card - uses Card, Badge components */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Epoch</CardTitle>
          <Clock className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {stats.activeEpoch ? (
            <>
              <div className="truncate text-2xl font-bold">
                {stats.activeEpoch.name}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {stats.activeEpoch.phase}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {stats.activeEpoch.daysLeft} days left
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">No Active Epoch</div>
              <p className="text-xs text-muted-foreground">Start planning</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Open Blockers Card - uses Card component */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Blockers</CardTitle>
          <AlertCircle className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.openBlockers}</div>
          <p className="text-xs text-muted-foreground">
            {stats.openBlockers === 0
              ? "All clear"
              : stats.openBlockers === 1
              ? "Needs attention"
              : "Need attention"}
          </p>
        </CardContent>
      </Card>

      {/* Upcoming Meetings Card - uses Card component */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Upcoming Meetings
          </CardTitle>
          <Calendar className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingMeetings}</div>
          <p className="text-xs text-muted-foreground">
            {stats.upcomingMeetings === 0
              ? "None scheduled"
              : "This week"}
          </p>
        </CardContent>
      </Card>

      {/* Latest Release Card - uses Card, Badge components */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Release</CardTitle>
          <Rocket className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {stats.latestRelease ? (
            <>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {stats.latestRelease.version}
                </div>
                {stats.latestRelease.trend === "up" ? (
                  <TrendingUp className="size-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="size-4 text-red-600 dark:text-red-400" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.latestRelease.date}
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">No Releases</div>
              <p className="text-xs text-muted-foreground">
                Deploy your first release
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
