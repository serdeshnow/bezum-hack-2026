import {
  FolderKanban,
  Plus,
  Search,
  Grid,
  List,
  Clock,
  FileText,
  CheckSquare,
  Calendar,
  Rocket,
  ArrowRight,
  TrendingUp,
  Users,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";

const mockProjects = [
  {
    id: "1",
    name: "E-commerce Platform",
    description: "Full-stack e-commerce solution with React and Node.js",
    status: "active" as const,
    progress: 68,
    teamSize: 8,
    tasksOpen: 24,
    dueDate: "Apr 30, 2026",
    epoch: "Q2 2026 Sprint",
    openBlockers: 2,
  },
  {
    id: "2",
    name: "Mobile App Redesign",
    description: "Complete UI/UX overhaul of the mobile application",
    status: "active" as const,
    progress: 45,
    teamSize: 5,
    tasksOpen: 18,
    dueDate: "May 15, 2026",
    epoch: "Q2 2026 Sprint",
    openBlockers: 0,
  },
  {
    id: "3",
    name: "Legacy System Migration",
    description: "Migrate from monolith to microservices architecture",
    status: "archived" as const,
    progress: 100,
    teamSize: 12,
    tasksOpen: 0,
    dueDate: "Mar 15, 2026",
    epoch: "Q1 2026 Sprint",
    openBlockers: 0,
  },
];

const quickAccessSections = [
  {
    id: "tasks",
    title: "Tasks",
    description: "Manage project tasks",
    icon: CheckSquare,
    href: "/tasks",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950",
    stats: { label: "Open", value: 42 },
  },
  {
    id: "docs",
    title: "Documentation",
    description: "Browse project docs",
    icon: FileText,
    href: "/docs",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-950",
    stats: { label: "Documents", value: 28 },
  },
  {
    id: "epochs",
    title: "Epochs",
    description: "Sprint planning",
    icon: Clock,
    href: "/epochs",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-950",
    stats: { label: "Active", value: 1 },
  },
  {
    id: "meetings",
    title: "Meetings",
    description: "Schedule & recap",
    icon: Calendar,
    href: "/meetings",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-950",
    stats: { label: "Upcoming", value: 3 },
  },
  {
    id: "releases",
    title: "Releases",
    description: "Track deployments",
    icon: Rocket,
    href: "/releases",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-950",
    stats: { label: "This Month", value: 8 },
  },
];

const recentActivity = [
  {
    id: "1",
    type: "task" as const,
    title: "Task completed",
    description: "Implement user authentication",
    user: "Alex Johnson",
    timestamp: "5 min ago",
  },
  {
    id: "2",
    type: "doc" as const,
    title: "Document updated",
    description: "API Reference Guide v3",
    user: "Sarah Chen",
    timestamp: "15 min ago",
  },
  {
    id: "3",
    type: "pr" as const,
    title: "PR merged",
    description: "Feature: Add dark mode support",
    user: "Michael Brown",
    timestamp: "1 hour ago",
  },
];

export function ProjectsListPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Projects Hub</h1>
              <p className="text-sm text-muted-foreground">
                Central navigation for all development activities
              </p>
            </div>
            <Button>
              <Plus className="mr-2 size-4" />
              New Project
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects, tasks, docs..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-background p-6">
        <div className="space-y-8">
          {/* Quick Access Grid */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Quick Access</h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {quickAccessSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Card
                    key={section.id}
                    className="group cursor-pointer transition-all hover:border-primary hover:shadow-md"
                    onClick={() => navigate(section.href)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex size-12 items-center justify-center rounded-lg ${section.bgColor}`}
                        >
                          <Icon className={`size-6 ${section.color}`} />
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <CardTitle className="mt-4">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">
                          {section.stats.value}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {section.stats.label}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Projects & Activity */}
          <Tabs defaultValue="projects" className="w-full">
            <TabsList>
              <TabsTrigger value="projects">Active Projects</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockProjects
                  .filter((p) => p.status === "active")
                  .map((project) => (
                    <Card
                      key={project.id}
                      className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                              <FolderKanban className="size-5 text-primary" />
                            </div>
                          </div>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <CardTitle className="mt-4">{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-medium">
                              {project.progress}%
                            </span>
                          </div>
                          <Progress value={project.progress} />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="size-4 text-muted-foreground" />
                            <span>{project.teamSize} members</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckSquare className="size-4 text-muted-foreground" />
                            <span>{project.tasksOpen} tasks</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="size-4 text-muted-foreground" />
                            <span className="truncate">{project.epoch}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-muted-foreground" />
                            <span className="truncate">{project.dueDate}</span>
                          </div>
                        </div>

                        {/* Blockers */}
                        {project.openBlockers > 0 && (
                          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-2">
                            <AlertCircle className="size-4 text-destructive" />
                            <span className="text-sm text-destructive">
                              {project.openBlockers} open blocker
                              {project.openBlockers > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates across all projects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {activity.type === "task" && (
                          <CheckSquare className="size-5 text-blue-600" />
                        )}
                        {activity.type === "doc" && (
                          <FileText className="size-5 text-purple-600" />
                        )}
                        {activity.type === "pr" && (
                          <Rocket className="size-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {activity.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{activity.user}</span>
                          <span>•</span>
                          <span>{activity.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Statistics Overview */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Overview</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Projects
                  </CardTitle>
                  <FolderKanban className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockProjects.filter((p) => p.status === "active").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="mr-1 inline size-3" />
                    +2 from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Open Tasks
                  </CardTitle>
                  <CheckSquare className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-xs text-muted-foreground">
                    Across all projects
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Team Members
                  </CardTitle>
                  <Users className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">25</div>
                  <p className="text-xs text-muted-foreground">
                    Active contributors
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Releases
                  </CardTitle>
                  <Rocket className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}