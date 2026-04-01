import {
  FolderKanban,
  Clock,
  FileText,
  CheckSquare,
  Calendar,
  Rocket,
  Bell,
  Settings,
} from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

interface AppSidebarProps {
  activeItem?: string;
  onNavigate?: (href: string) => void;
  taskCount?: number;
  notificationCount?: number;
}

const navigationItems: NavigationItem[] = [
  {
    id: "projects",
    label: "Projects",
    icon: FolderKanban,
    href: "/projects",
  },
  {
    id: "epochs",
    label: "Epochs",
    icon: Clock,
    href: "/epochs",
  },
  {
    id: "docs",
    label: "Docs",
    icon: FileText,
    href: "/docs",
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
  },
  {
    id: "meetings",
    label: "Meetings",
    icon: Calendar,
    href: "/meetings",
  },
  {
    id: "releases",
    label: "Releases",
    icon: Rocket,
    href: "/releases",
  },
];

const secondaryItems: NavigationItem[] = [
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function AppSidebar({
  activeItem,
  onNavigate,
  taskCount = 0,
  notificationCount = 0,
}: AppSidebarProps) {
  const getBadgeCount = (itemId: string) => {
    if (itemId === "tasks" && taskCount > 0) return taskCount;
    if (itemId === "notifications" && notificationCount > 0)
      return notificationCount;
    return undefined;
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const badgeCount = getBadgeCount(item.id);
    const isActive = activeItem === item.id;

    return (
      <div key={item.id} title={item.label}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => onNavigate?.(item.href)}
        >
          <Icon className="size-5 shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
          {badgeCount !== undefined && badgeCount > 0 && (
            <Badge variant="default" className="ml-auto">
              {badgeCount > 99 ? "99+" : badgeCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary">
            <Rocket className="size-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sidebar-foreground">DevStudio</h2>
            <p className="text-xs text-muted-foreground">Platform</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          <nav className="space-y-1">
            {navigationItems.map(renderNavigationItem)}
          </nav>

          <Separator />

          <nav className="space-y-1">
            {secondaryItems.map(renderNavigationItem)}
          </nav>
        </div>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-muted-foreground">© 2026 DevStudio</p>
      </div>
    </aside>
  );
}