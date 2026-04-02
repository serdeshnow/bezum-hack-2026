import { FileText, CheckSquare, Calendar, Plus } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface QuickActionsProps {
  onCreateTask?: () => void;
  onCreateDoc?: () => void;
  onScheduleMeeting?: () => void;
}

export function QuickActions({
  onCreateTask,
  onCreateDoc,
  onScheduleMeeting,
}: QuickActionsProps) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="default">
              <Plus className="size-5" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Quick Actions</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCreateTask}>
          <CheckSquare className="mr-2 size-4" />
          Create Task
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateDoc}>
          <FileText className="mr-2 size-4" />
          Create Document
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onScheduleMeeting}>
          <Calendar className="mr-2 size-4" />
          Schedule Meeting
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}