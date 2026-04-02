import { Bell, CheckCheck, Filter } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const mockNotifications = [
  {
    id: "1",
    title: "New task assigned",
    description: "Update API documentation",
    timestamp: "2 minutes ago",
    read: false,
    type: "task" as const,
    user: { name: "Sarah Chen", initials: "SC" },
  },
  {
    id: "2",
    title: "Meeting scheduled",
    description: "Sprint planning for Q2",
    timestamp: "1 hour ago",
    read: false,
    type: "meeting" as const,
    user: { name: "Emily Davis", initials: "ED" },
  },
  {
    id: "3",
    title: "Pull request merged",
    description: "Feature: Add dark mode support",
    timestamp: "2 hours ago",
    read: true,
    type: "pr" as const,
    user: { name: "Michael Brown", initials: "MB" },
  },
  {
    id: "4",
    title: "Release deployed",
    description: "Version 2.1.0 deployed to production",
    timestamp: "3 hours ago",
    read: true,
    type: "release" as const,
    user: { name: "David Wilson", initials: "DW" },
  },
  {
    id: "5",
    title: "Mentioned in comment",
    description: "On task: Implement user authentication",
    timestamp: "5 hours ago",
    read: true,
    type: "mention" as const,
    user: { name: "Alex Johnson", initials: "AJ" },
  },
];

export function UnifiedInboxPage() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread notifications
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 size-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <CheckCheck className="mr-2 size-4" />
              Mark all read
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-background">
        <Tabs defaultValue="all" className="flex h-full flex-col">
          <div className="border-b border-border px-6">
            <TabsList>
              <TabsTrigger value="all">
                All ({mockNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="mentions">Mentions</TabsTrigger>
            </TabsList>
          </div>
          <ScrollArea className="flex-1">
            <TabsContent value="all" className="m-0 p-0">
              <div className="divide-y divide-border">
                {mockNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={`w-full p-6 text-left transition-colors hover:bg-accent ${
                      !notification.read ? "bg-accent/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="size-10">
                        <AvatarFallback>
                          {notification.user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium leading-tight">
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {notification.description}
                            </p>
                          </div>
                          {!notification.read && (
                            <Badge
                              variant="default"
                              className="h-2 w-2 rounded-full p-0"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{notification.user.name}</span>
                          <span>•</span>
                          <span>{notification.timestamp}</span>
                          <Badge variant="outline" className="capitalize">
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="unread" className="m-0 p-0">
              <div className="divide-y divide-border">
                {mockNotifications
                  .filter((n) => !n.read)
                  .map((notification) => (
                    <button
                      key={notification.id}
                      className="w-full bg-accent/50 p-6 text-left transition-colors hover:bg-accent"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="size-10">
                          <AvatarFallback>
                            {notification.user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium leading-tight">
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {notification.description}
                              </p>
                            </div>
                            <Badge
                              variant="default"
                              className="h-2 w-2 rounded-full p-0"
                            />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{notification.user.name}</span>
                            <span>•</span>
                            <span>{notification.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="mentions" className="m-0 p-0">
              <Card className="m-6">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="mb-4 size-12 text-muted-foreground" />
                    <h3 className="mb-2 font-semibold">No mentions</h3>
                    <p className="text-sm text-muted-foreground">
                      You'll see notifications when someone mentions you
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
