import { Search, Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { RoleBadge } from "./role-badge";
import { UnifiedInbox } from "./unified-inbox";
import { QuickActions } from "./quick-actions";
import { Breadcrumbs } from "./breadcrumbs";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface HeaderProps {
  role: "Customer" | "Developer" | "Manager";
  breadcrumbs?: Array<{ label: string; href?: string }>;
  breadcrumbsState?: "loading" | "populated";
  notificationsState?: "loading" | "empty" | "error" | "populated";
  notifications?: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
    type: "task" | "meeting" | "release" | "mention";
  }>;
  unreadCount?: number;
  onSearchClick?: () => void;
  onNotificationClick?: (notificationId: string) => void;
  onMarkAllRead?: () => void;
  onBreadcrumbNavigate?: (href: string) => void;
  onCreateTask?: () => void;
  onCreateDoc?: () => void;
  onScheduleMeeting?: () => void;
}

export function Header({
  role,
  breadcrumbs = [],
  breadcrumbsState = "populated",
  notificationsState = "populated",
  notifications = [],
  unreadCount = 0,
  onSearchClick,
  onNotificationClick,
  onMarkAllRead,
  onBreadcrumbNavigate,
  onCreateTask,
  onCreateDoc,
  onScheduleMeeting,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      {/* Breadcrumbs */}
      <div className="flex-1">
        <Breadcrumbs
          state={breadcrumbsState}
          segments={breadcrumbs}
          onNavigate={onBreadcrumbNavigate}
        />
      </div>

      {/* Actions */}
      <TooltipProvider>
        <div className="flex items-center gap-2">
          {/* Search / Command Palette Trigger */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onSearchClick}>
                <Search className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Search (⌘K)</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          {/* Quick Actions */}
          <QuickActions
            onCreateTask={onCreateTask}
            onCreateDoc={onCreateDoc}
            onScheduleMeeting={onScheduleMeeting}
          />

          {/* Unified Inbox */}
          <UnifiedInbox
            state={notificationsState}
            notifications={notifications}
            unreadCount={unreadCount}
            onNotificationClick={onNotificationClick}
            onMarkAllRead={onMarkAllRead}
          />

          <Separator orientation="vertical" className="h-6" />

          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Toggle theme</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          {/* Role Badge */}
          <RoleBadge role={role} />
        </div>
      </TooltipProvider>
    </header>
  );
}