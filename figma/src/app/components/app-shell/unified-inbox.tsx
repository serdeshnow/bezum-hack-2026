import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: "task" | "meeting" | "release" | "mention";
}

interface UnifiedInboxProps {
  state: "loading" | "empty" | "error" | "populated";
  notifications?: Notification[];
  unreadCount?: number;
  onNotificationClick?: (notificationId: string) => void;
  onMarkAllRead?: () => void;
}

export function UnifiedInbox({
  state,
  notifications = [],
  unreadCount = 0,
  onNotificationClick,
  onMarkAllRead,
}: UnifiedInboxProps) {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
              {unreadCount > 0 && state === "populated" && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Notifications</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notifications</h3>
          {state === "populated" && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllRead}
              className="h-auto p-1 text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        <Separator />
        
        {state === "loading" && (
          <div className="space-y-2 p-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {state === "error" && (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertDescription className="text-xs">
                Failed to load notifications
              </AlertDescription>
            </Alert>
          </div>
        )}

        {state === "empty" && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="mb-2 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No notifications yet
            </p>
          </div>
        )}

        {state === "populated" && (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => onNotificationClick?.(notification.id)}
                  className={`w-full rounded-md p-3 text-left transition-colors hover:bg-accent ${
                    !notification.read ? "bg-accent/50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.timestamp}
                      </p>
                    </div>
                    {!notification.read && (
                      <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}