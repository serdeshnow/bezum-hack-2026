import { useState } from "react";
import { useNavigate } from "react-router";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Filter,
  Search,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

type TaskStatus = "backlog" | "todo" | "in-progress" | "review" | "done";
type TaskPriority = "low" | "medium" | "high" | "critical";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: {
    name: string;
    initials: string;
  } | null;
  dueDate: string | null;
  tags: string[];
  blockers: number;
}

interface Column {
  id: TaskStatus;
  title: string;
  icon: React.ElementType;
  color: string;
}

const columns: Column[] = [
  { id: "backlog", title: "Backlog", icon: Target, color: "text-gray-500" },
  { id: "todo", title: "To Do", icon: Clock, color: "text-blue-500" },
  {
    id: "in-progress",
    title: "In Progress",
    icon: AlertCircle,
    color: "text-yellow-500",
  },
  {
    id: "review",
    title: "Review",
    icon: CheckCircle2,
    color: "text-purple-500",
  },
  { id: "done", title: "Done", icon: CheckCircle2, color: "text-green-500" },
];

const priorityConfig: Record<
  TaskPriority,
  { label: string; color: string; variant: "default" | "secondary" | "destructive" }
> = {
  low: { label: "Low", color: "text-gray-500", variant: "secondary" },
  medium: { label: "Medium", color: "text-blue-500", variant: "default" },
  high: { label: "High", color: "text-orange-500", variant: "default" },
  critical: { label: "Critical", color: "text-red-500", variant: "destructive" },
};

// Mock data
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Implement user authentication",
    description: "Add OAuth2 integration with Google and GitHub",
    status: "in-progress",
    priority: "high",
    assignee: { name: "Alex Johnson", initials: "AJ" },
    dueDate: "Apr 5, 2026",
    tags: ["backend", "security"],
    blockers: 0,
  },
  {
    id: "2",
    title: "Design new dashboard UI",
    description: "Create wireframes and high-fidelity mockups",
    status: "todo",
    priority: "medium",
    assignee: { name: "Sarah Chen", initials: "SC" },
    dueDate: "Apr 8, 2026",
    tags: ["design", "ui/ux"],
    blockers: 0,
  },
  {
    id: "3",
    title: "Fix responsive layout bugs",
    description: "Mobile view broken on iOS Safari",
    status: "review",
    priority: "critical",
    assignee: { name: "Michael Brown", initials: "MB" },
    dueDate: "Apr 2, 2026",
    tags: ["frontend", "bug"],
    blockers: 1,
  },
  {
    id: "4",
    title: "Update API documentation",
    description: "Document new endpoints and deprecations",
    status: "backlog",
    priority: "low",
    assignee: null,
    dueDate: null,
    tags: ["docs"],
    blockers: 0,
  },
  {
    id: "5",
    title: "Optimize database queries",
    description: "Reduce load times for reports page",
    status: "done",
    priority: "high",
    assignee: { name: "David Wilson", initials: "DW" },
    dueDate: "Mar 30, 2026",
    tags: ["backend", "performance"],
    blockers: 0,
  },
];

function TaskCard({ task }: { task: Task }) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priority = priorityConfig[task.priority];

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className="group cursor-pointer transition-all hover:border-primary hover:shadow-md"
        onClick={() => navigate(`/tasks/${task.id}`)}
      >
        <CardHeader className="p-4">
          <div className="flex items-start gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab touch-none opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="size-4 text-muted-foreground" />
            </button>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium leading-tight">{task.title}</h4>
                {task.blockers > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {task.blockers} blocker
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {task.assignee ? (
                <>
                  <Avatar className="size-5">
                    <AvatarFallback className="text-[8px]">
                      {task.assignee.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground">
                    {task.assignee.name}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={priority.variant} className="text-xs">
                {priority.label}
              </Badge>
              {task.dueDate && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="size-3" />
                  <span>{task.dueDate}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
}: {
  column: Column;
  tasks: Task[];
}) {
  const Icon = column.icon;

  return (
    <div className="flex h-full min-w-[320px] flex-col rounded-lg border border-border bg-muted/30">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Icon className={`size-5 ${column.color}`} />
          <h3 className="font-semibold">{column.title}</h3>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
        <Button size="icon" variant="ghost" className="size-6">
          <Plus className="size-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
}

export function KanbanBoardPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    const overColumn = columns.find((c) => c.id === overId);

    if (activeTask && overColumn) {
      setTasks((tasks) =>
        tasks.map((t) =>
          t.id === activeId ? { ...t, status: overColumn.id } : t
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Task Board</h1>
              <p className="text-sm text-muted-foreground">
                Manage and track all project tasks
              </p>
            </div>
            <Button>
              <Plus className="mr-2 size-4" />
              New Task
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-background">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full gap-4 p-6">
            {columns.map((column) => {
              const columnTasks = filteredTasks.filter(
                (t) => t.status === column.id
              );
              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                />
              );
            })}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
