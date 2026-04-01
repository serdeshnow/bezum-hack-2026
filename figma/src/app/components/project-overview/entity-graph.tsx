import { FileText, CheckSquare, Calendar, GitPullRequest, Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

interface EntityCount {
  docs: number;
  tasks: number;
  meetings: number;
  pullRequests: number;
  releases: number;
}

interface EntityGraphProps {
  state: "loading" | "populated";
  entities?: EntityCount;
}

export function EntityGraph({ state, entities }: EntityGraphProps) {
  if (state === "loading") {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!entities) return null;

  const total =
    entities.docs +
    entities.tasks +
    entities.meetings +
    entities.pullRequests +
    entities.releases;

  const entityConfig = [
    {
      label: "Docs",
      count: entities.docs,
      icon: FileText,
      color: "bg-blue-500",
      textColor: "text-blue-600 dark:text-blue-400",
      percentage: total > 0 ? (entities.docs / total) * 100 : 0,
    },
    {
      label: "Tasks",
      count: entities.tasks,
      icon: CheckSquare,
      color: "bg-green-500",
      textColor: "text-green-600 dark:text-green-400",
      percentage: total > 0 ? (entities.tasks / total) * 100 : 0,
    },
    {
      label: "Meetings",
      count: entities.meetings,
      icon: Calendar,
      color: "bg-purple-500",
      textColor: "text-purple-600 dark:text-purple-400",
      percentage: total > 0 ? (entities.meetings / total) * 100 : 0,
    },
    {
      label: "Pull Requests",
      count: entities.pullRequests,
      icon: GitPullRequest,
      color: "bg-orange-500",
      textColor: "text-orange-600 dark:text-orange-400",
      percentage: total > 0 ? (entities.pullRequests / total) * 100 : 0,
    },
    {
      label: "Releases",
      count: entities.releases,
      icon: Rocket,
      color: "bg-pink-500",
      textColor: "text-pink-600 dark:text-pink-400",
      percentage: total > 0 ? (entities.releases / total) * 100 : 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Entities</CardTitle>
        <CardDescription>
          Overview of all connected project entities and their relationships
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Entity Graph Visualization - uses custom layout with Card styling */}
        <div className="space-y-6">
          {/* Central Node */}
          <div className="flex items-center justify-center">
            <div className="flex size-24 items-center justify-center rounded-full border-4 border-primary bg-primary/10">
              <div className="text-center">
                <div className="text-2xl font-bold">{total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </div>

          {/* Distribution Bar - uses Progress-like custom visualization */}
          <div className="flex h-8 w-full gap-0.5 overflow-hidden rounded-lg">
            {entityConfig.map((entity) => {
              if (entity.count === 0) return null;
              return (
                <div
                  key={entity.label}
                  className={`${entity.color} flex items-center justify-center transition-all hover:opacity-80`}
                  style={{ width: `${entity.percentage}%` }}
                  title={`${entity.label}: ${entity.count}`}
                >
                  {entity.percentage > 8 && (
                    <span className="text-xs font-medium text-white">
                      {entity.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Entity List - uses Badge and icon components */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {entityConfig.map((entity) => {
              const Icon = entity.icon;
              return (
                <div
                  key={entity.label}
                  className="flex flex-col items-center space-y-2 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
                >
                  <Icon className={`size-6 ${entity.textColor}`} />
                  <div className="text-center">
                    <div className="text-xl font-bold">{entity.count}</div>
                    <div className="text-xs text-muted-foreground">
                      {entity.label}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {entity.percentage.toFixed(1)}%
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
