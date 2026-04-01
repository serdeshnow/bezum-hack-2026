import { useEffect, useState } from "react";
import {
  Search,
  FileText,
  CheckSquare,
  Calendar,
  Rocket,
  FolderKanban,
  Clock,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (path: string) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
}: CommandPaletteProps) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = (callback: () => void) => {
    callback();
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search projects, docs, tasks..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => handleSelect(() => onNavigate?.("/projects"))}
          >
            <FolderKanban className="mr-2 size-4" />
            <span>Projects</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => onNavigate?.("/epochs"))}
          >
            <Clock className="mr-2 size-4" />
            <span>Epochs</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onNavigate?.("/docs"))}>
            <FileText className="mr-2 size-4" />
            <span>Documentation</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => onNavigate?.("/tasks"))}
          >
            <CheckSquare className="mr-2 size-4" />
            <span>Tasks</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => onNavigate?.("/meetings"))}
          >
            <Calendar className="mr-2 size-4" />
            <span>Meetings</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => onNavigate?.("/releases"))}
          >
            <Rocket className="mr-2 size-4" />
            <span>Releases</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() =>
              handleSelect(() => console.log("Create task action"))
            }
          >
            <CheckSquare className="mr-2 size-4" />
            <span>Create Task</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect(() => console.log("Create document action"))
            }
          >
            <FileText className="mr-2 size-4" />
            <span>Create Document</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect(() => console.log("Schedule meeting action"))
            }
          >
            <Calendar className="mr-2 size-4" />
            <span>Schedule Meeting</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
