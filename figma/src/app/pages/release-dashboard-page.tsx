import { Rocket, GitPullRequest, Plus, GitBranch, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const mockReleases = [
  {
    id: "1",
    version: "v2.1.0",
    title: "Feature Release",
    date: "Apr 1, 2026",
    status: "deployed" as const,
    commits: 45,
    author: { name: "David Wilson", initials: "DW" },
    changes: {
      features: 8,
      fixes: 12,
      breaking: 0,
    },
  },
  {
    id: "2",
    version: "v2.0.5",
    title: "Hotfix: Security Patch",
    date: "Mar 28, 2026",
    status: "deployed" as const,
    commits: 3,
    author: { name: "Alex Johnson", initials: "AJ" },
    changes: {
      features: 0,
      fixes: 3,
      breaking: 0,
    },
  },
];

const mockPRs = [
  {
    id: "1",
    title: "feat: Add dark mode support",
    number: 234,
    status: "merged" as const,
    author: { name: "Michael Brown", initials: "MB" },
    branch: "feature/dark-mode",
    commits: 12,
    date: "1 hour ago",
  },
  {
    id: "2",
    title: "fix: Resolve authentication timeout issues",
    number: 233,
    status: "open" as const,
    author: { name: "Sarah Chen", initials: "SC" },
    branch: "fix/auth-timeout",
    commits: 5,
    date: "3 hours ago",
  },
  {
    id: "3",
    title: "refactor: Improve database query performance",
    number: 232,
    status: "reviewing" as const,
    author: { name: "Emily Davis", initials: "ED" },
    branch: "refactor/db-performance",
    commits: 8,
    date: "1 day ago",
  },
];

export function ReleaseDashboardPage() {
  const statusConfig = {
    deployed: { label: "Deployed", icon: CheckCircle, color: "text-green-600" },
    deploying: { label: "Deploying", icon: Clock, color: "text-yellow-600" },
    failed: { label: "Failed", icon: XCircle, color: "text-red-600" },
  };

  const prStatusConfig = {
    open: { label: "Open", variant: "default" as const },
    reviewing: { label: "Reviewing", variant: "secondary" as const },
    merged: { label: "Merged", variant: "default" as const },
    closed: { label: "Closed", variant: "outline" as const },
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Releases & Pull Requests</h1>
          <p className="text-sm text-muted-foreground">
            Track deployments and code changes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <GitPullRequest className="mr-2 size-4" />
            New PR
          </Button>
          <Button>
            <Rocket className="mr-2 size-4" />
            New Release
          </Button>
        </div>
      </div>

      <Tabs defaultValue="releases" className="w-full">
        <TabsList>
          <TabsTrigger value="releases">Releases</TabsTrigger>
          <TabsTrigger value="pull-requests">Pull Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="releases" className="space-y-4">
          {mockReleases.map((release) => {
            const status = statusConfig[release.status];
            const StatusIcon = status.icon;

            return (
              <Card key={release.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                        <Rocket className="size-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle>{release.version}</CardTitle>
                          <Badge
                            variant={
                              release.status === "deployed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            <StatusIcon className="mr-1 size-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">
                          {release.title}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">{release.date}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <Avatar className="size-5">
                          <AvatarFallback className="text-[8px]">
                            {release.author.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground">
                          {release.author.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <GitBranch className="size-4 text-muted-foreground" />
                      <span>{release.commits} commits</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="gap-1">
                        {release.changes.features} features
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        {release.changes.fixes} fixes
                      </Badge>
                      {release.changes.breaking > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          {release.changes.breaking} breaking
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
        <TabsContent value="pull-requests" className="space-y-4">
          {mockPRs.map((pr) => (
            <Card key={pr.id} className="cursor-pointer hover:border-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                      <GitPullRequest className="size-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>
                          #{pr.number} {pr.title}
                        </CardTitle>
                        <Badge variant={prStatusConfig[pr.status].variant}>
                          {prStatusConfig[pr.status].label}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        <code className="text-xs">{pr.branch}</code>
                      </CardDescription>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{pr.date}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-xs">
                        {pr.author.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span>{pr.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <GitBranch className="size-4" />
                    <span>{pr.commits} commits</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
