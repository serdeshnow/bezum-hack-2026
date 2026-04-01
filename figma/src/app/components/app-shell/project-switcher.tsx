import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Folder } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription } from "../ui/alert";

interface Project {
  id: string;
  name: string;
  status: "active" | "archived";
}

interface ProjectSwitcherProps {
  state: "loading" | "empty" | "error" | "populated";
  projects?: Project[];
  currentProjectId?: string;
  onProjectChange?: (projectId: string) => void;
  onCreateProject?: () => void;
}

export function ProjectSwitcher({
  state,
  projects = [],
  currentProjectId,
  onProjectChange,
  onCreateProject,
}: ProjectSwitcherProps) {
  const [open, setOpen] = useState(false);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  if (state === "loading") {
    return (
      <div className="px-3">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="px-3">
        <Alert variant="destructive">
          <AlertDescription className="text-xs">
            Failed to load projects
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="px-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onCreateProject}
        >
          <Plus className="size-4" />
          Create first project
        </Button>
      </div>
    );
  }

  return (
    <div className="px-3">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <Folder className="size-4 shrink-0" />
              <span className="truncate">{currentProject?.name || "Select project"}</span>
            </div>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px]">
          <DropdownMenuLabel>Projects</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onSelect={() => {
                onProjectChange?.(project.id);
                setOpen(false);
              }}
            >
              <Check
                className={`mr-2 size-4 ${
                  currentProjectId === project.id ? "opacity-100" : "opacity-0"
                }`}
              />
              <span className="flex-1 truncate">{project.name}</span>
              {project.status === "archived" && (
                <span className="text-xs text-muted-foreground">(archived)</span>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onCreateProject}>
            <Plus className="mr-2 size-4" />
            Create new project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
