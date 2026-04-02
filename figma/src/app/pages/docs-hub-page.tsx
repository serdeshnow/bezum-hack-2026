import { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  FolderOpen,
  Folder,
  ChevronRight,
  ChevronDown,
  Filter,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Users,
  User,
  Shield,
  Lock,
  MoreVertical,
  Star,
  Edit,
  Trash2,
  Link as LinkIcon,
  Calendar,
  Target,
  CheckSquare,
  Rocket,
  Settings2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router";
import { Skeleton } from "../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";

type DocsState = "loading" | "empty" | "error" | "populated";
type DocStatus = "draft" | "in-review" | "approved" | "obsolete";
type AccessScope = "customer" | "manager" | "dev" | "internal";

interface Document {
  id: string;
  title: string;
  description: string;
  status: DocStatus;
  accessScope: AccessScope;
  author: { name: string; initials: string };
  lastUpdated: string;
  linkedTo?: {
    epochs?: number;
    tasks?: number;
    meetings?: number;
    releases?: number;
  };
  awaitingApproval: boolean;
  folderId: string;
}

interface Folder {
  id: string;
  name: string;
  icon: typeof Folder;
  children?: Folder[];
  docCount: number;
}

const mockFolders: Folder[] = [
  {
    id: "root",
    name: "All Documents",
    icon: FolderOpen,
    docCount: 12,
    children: [
      {
        id: "architecture",
        name: "Architecture",
        icon: Folder,
        docCount: 4,
      },
      {
        id: "api",
        name: "API Reference",
        icon: Folder,
        docCount: 3,
      },
      {
        id: "operations",
        name: "Operations",
        icon: Folder,
        docCount: 2,
        children: [
          {
            id: "deployment",
            name: "Deployment",
            icon: Folder,
            docCount: 1,
          },
          {
            id: "monitoring",
            name: "Monitoring",
            icon: Folder,
            docCount: 1,
          },
        ],
      },
      {
        id: "planning",
        name: "Planning",
        icon: Folder,
        docCount: 3,
      },
    ],
  },
];

const mockDocuments: Document[] = [
  {
    id: "1",
    title: "System Architecture Overview",
    description: "High-level system architecture and design patterns",
    status: "approved",
    accessScope: "manager",
    author: { name: "Sarah Chen", initials: "SC" },
    lastUpdated: "2 hours ago",
    linkedTo: { epochs: 2, tasks: 5 },
    awaitingApproval: false,
    folderId: "architecture",
  },
  {
    id: "2",
    title: "API Authentication Guide",
    description: "OAuth2 and JWT implementation guidelines",
    status: "in-review",
    accessScope: "dev",
    author: { name: "Alex Johnson", initials: "AJ" },
    lastUpdated: "1 day ago",
    linkedTo: { tasks: 3, meetings: 1 },
    awaitingApproval: true,
    folderId: "api",
  },
  {
    id: "3",
    title: "Deployment Procedures",
    description: "Step-by-step production deployment guide",
    status: "approved",
    accessScope: "internal",
    author: { name: "Michael Brown", initials: "MB" },
    lastUpdated: "3 days ago",
    linkedTo: { epochs: 1, releases: 2 },
    awaitingApproval: false,
    folderId: "deployment",
  },
  {
    id: "4",
    title: "Customer Onboarding Guide",
    description: "Getting started guide for new customers",
    status: "approved",
    accessScope: "customer",
    author: { name: "Emily Davis", initials: "ED" },
    lastUpdated: "5 days ago",
    linkedTo: { meetings: 2 },
    awaitingApproval: false,
    folderId: "planning",
  },
  {
    id: "5",
    title: "Database Migration Plan",
    description: "PostgreSQL migration strategy and rollback",
    status: "draft",
    accessScope: "dev",
    author: { name: "David Wilson", initials: "DW" },
    lastUpdated: "1 week ago",
    linkedTo: { epochs: 1, tasks: 8 },
    awaitingApproval: false,
    folderId: "architecture",
  },
  {
    id: "6",
    title: "Performance Monitoring Setup",
    description: "DataDog and New Relic configuration",
    status: "approved",
    accessScope: "internal",
    author: { name: "Lisa Wong", initials: "LW" },
    lastUpdated: "2 weeks ago",
    linkedTo: { tasks: 2 },
    awaitingApproval: false,
    folderId: "monitoring",
  },
  {
    id: "7",
    title: "Sprint Planning Template",
    description: "Standard template for sprint planning sessions",
    status: "approved",
    accessScope: "manager",
    author: { name: "Tom Harris", initials: "TH" },
    lastUpdated: "3 weeks ago",
    linkedTo: { epochs: 4, meetings: 8 },
    awaitingApproval: false,
    folderId: "planning",
  },
  {
    id: "8",
    title: "Legacy API Documentation",
    description: "Deprecated v1 API reference",
    status: "obsolete",
    accessScope: "dev",
    author: { name: "John Smith", initials: "JS" },
    lastUpdated: "2 months ago",
    linkedTo: {},
    awaitingApproval: false,
    folderId: "api",
  },
];

export function DocsHubPage() {
  const navigate = useNavigate();
  const [docsState, setDocsState] = useState<DocsState>("populated");
  const [selectedFolder, setSelectedFolder] = useState<string>("root");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["root", "operations"])
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterScope, setFilterScope] = useState<string>("all");
  const [filterOwner, setFilterOwner] = useState<string>("all");
  const [showAwaitingApproval, setShowAwaitingApproval] = useState(false);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolder === folder.id;
    const Icon = folder.icon;

    return (
      <div key={folder.id}>
        <div
          className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent ${
            isSelected ? "bg-accent font-medium" : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => {
            setSelectedFolder(folder.id);
            if (folder.children) {
              toggleFolder(folder.id);
            }
          }}
        >
          {folder.children && (
            <button
              className="shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
          )}
          {!folder.children && <div className="w-4" />}
          <Icon className="size-4 text-primary" />
          <span className="flex-1">{folder.name}</span>
          <span className="text-xs text-muted-foreground">
            {folder.docCount}
          </span>
        </div>
        {isExpanded &&
          folder.children?.map((child) => renderFolder(child, level + 1))}
      </div>
    );
  };

  const getStatusConfig = (status: DocStatus) => {
    const configs = {
      draft: {
        icon: Edit,
        label: "Draft",
        variant: "secondary" as const,
        color: "text-gray-600 dark:text-gray-400",
      },
      "in-review": {
        icon: Clock,
        label: "In Review",
        variant: "secondary" as const,
        color: "text-blue-600 dark:text-blue-400",
      },
      approved: {
        icon: CheckCircle,
        label: "Approved",
        variant: "default" as const,
        color: "text-green-600 dark:text-green-400",
      },
      obsolete: {
        icon: XCircle,
        label: "Obsolete",
        variant: "destructive" as const,
        color: "text-red-600 dark:text-red-400",
      },
    };
    return configs[status];
  };

  const getAccessScopeConfig = (scope: AccessScope) => {
    const configs = {
      customer: {
        icon: Users,
        label: "Customer",
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-100 dark:bg-green-950",
      },
      manager: {
        icon: Shield,
        label: "Manager",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-950",
      },
      dev: {
        icon: User,
        label: "Developer",
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-100 dark:bg-purple-950",
      },
      internal: {
        icon: Lock,
        label: "Internal Only",
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-100 dark:bg-orange-950",
      },
    };
    return configs[scope];
  };

  // Filter documents
  const filteredDocuments = mockDocuments.filter((doc) => {
    if (filterStatus !== "all" && doc.status !== filterStatus) return false;
    if (filterScope !== "all" && doc.accessScope !== filterScope) return false;
    if (filterOwner !== "all" && doc.author.name !== filterOwner) return false;
    if (showAwaitingApproval && !doc.awaitingApproval) return false;
    // Filter by selected folder (simplified - in real app would check hierarchy)
    if (selectedFolder !== "root" && doc.folderId !== selectedFolder)
      return false;
    return true;
  });

  // Loading State
  if (docsState === "loading") {
    return (
      <div className="flex h-full">
        <div className="w-64 border-r border-border bg-card p-4">
          <Skeleton className="mb-4 h-8 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="border-b border-border bg-card p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-36" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (docsState === "error") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-6">
          <h1 className="text-2xl font-bold">Documentation Hub</h1>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="size-4" />
            <AlertTitle>Failed to load documents</AlertTitle>
            <AlertDescription>
              There was an error loading the documentation. Please try
              refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Empty State
  if (docsState === "empty") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Documentation Hub</h1>
              <p className="text-sm text-muted-foreground">
                Create and manage project documentation
              </p>
            </div>
            <Button>
              <Plus className="mr-2 size-4" />
              Create First Document
            </Button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-muted">
                <FileText className="size-10 text-muted-foreground" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold">No documents yet</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Create your first document to start building your knowledge base
            </p>
            <Button>
              <Plus className="mr-2 size-4" />
              Create First Document
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Populated State
  return (
    <div className="flex h-full">
      {/* Left Sidebar - Document Tree */}
      <div className="w-64 shrink-0 border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold">Folders</h2>
        </div>
        <ScrollArea className="h-[calc(100%-57px)]">
          <div className="p-2">{mockFolders.map((folder) => renderFolder(folder))}</div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Documentation Hub</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredDocuments.length} document
                  {filteredDocuments.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* State Switcher for Demo */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings2 className="mr-2 size-4" />
                      State: {docsState}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>View State (Demo)</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDocsState("populated")}>
                      Populated
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDocsState("loading")}>
                      Loading
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDocsState("empty")}>
                      Empty
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDocsState("error")}>
                      Error
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={() => navigate("/docs/new")}>
                  <Plus className="mr-2 size-4" />
                  New Document
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="obsolete">Obsolete</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterScope} onValueChange={setFilterScope}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Access Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scopes</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="dev">Developer</SelectItem>
                  <SelectItem value="internal">Internal Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterOwner} onValueChange={setFilterOwner}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  <SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
                  <SelectItem value="Alex Johnson">Alex Johnson</SelectItem>
                  <SelectItem value="Michael Brown">Michael Brown</SelectItem>
                  <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showAwaitingApproval ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAwaitingApproval(!showAwaitingApproval)}
              >
                <Clock className="mr-2 size-4" />
                Awaiting Approval
              </Button>

              {(filterStatus !== "all" ||
                filterScope !== "all" ||
                filterOwner !== "all" ||
                showAwaitingApproval) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterStatus("all");
                    setFilterScope("all");
                    setFilterOwner("all");
                    setShowAwaitingApproval(false);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Document List */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="mb-4 size-12 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold">No documents found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or create a new document
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => {
                  const statusConfig = getStatusConfig(doc.status);
                  const scopeConfig = getAccessScopeConfig(doc.accessScope);
                  const StatusIcon = statusConfig.icon;
                  const ScopeIcon = scopeConfig.icon;

                  return (
                    <Card
                      key={doc.id}
                      className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                      onClick={() => navigate(`/docs/${doc.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="size-6 text-primary" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold">{doc.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {doc.description}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 size-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Star className="mr-2 size-4" />
                                    Add to Favorites
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 size-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Status Badge */}
                              <Badge variant={statusConfig.variant}>
                                <StatusIcon className="mr-1 size-3" />
                                {statusConfig.label}
                              </Badge>

                              {/* Access Scope Chip */}
                              <div
                                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${scopeConfig.bg}`}
                              >
                                <ScopeIcon className={`size-3 ${scopeConfig.color}`} />
                                <span className={scopeConfig.color}>
                                  {scopeConfig.label}
                                </span>
                              </div>

                              {/* Awaiting Approval */}
                              {doc.awaitingApproval && (
                                <Badge variant="secondary">
                                  <Clock className="mr-1 size-3" />
                                  Awaiting Approval
                                </Badge>
                              )}

                              <Separator orientation="vertical" className="h-4" />

                              {/* Author */}
                              <div className="flex items-center gap-1.5">
                                <Avatar className="size-5">
                                  <AvatarFallback className="text-[10px]">
                                    {doc.author.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  {doc.author.name}
                                </span>
                              </div>

                              <Separator orientation="vertical" className="h-4" />

                              {/* Last Updated */}
                              <span className="text-xs text-muted-foreground">
                                {doc.lastUpdated}
                              </span>
                            </div>

                            {/* Linked Entities */}
                            {doc.linkedTo &&
                              Object.keys(doc.linkedTo).length > 0 && (
                                <div className="flex items-center gap-2">
                                  <LinkIcon className="size-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    Linked to:
                                  </span>
                                  {doc.linkedTo.epochs && (
                                    <Badge variant="outline" className="text-xs">
                                      <Target className="mr-1 size-3" />
                                      {doc.linkedTo.epochs} Epoch
                                      {doc.linkedTo.epochs > 1 ? "s" : ""}
                                    </Badge>
                                  )}
                                  {doc.linkedTo.tasks && (
                                    <Badge variant="outline" className="text-xs">
                                      <CheckSquare className="mr-1 size-3" />
                                      {doc.linkedTo.tasks} Task
                                      {doc.linkedTo.tasks > 1 ? "s" : ""}
                                    </Badge>
                                  )}
                                  {doc.linkedTo.meetings && (
                                    <Badge variant="outline" className="text-xs">
                                      <Calendar className="mr-1 size-3" />
                                      {doc.linkedTo.meetings} Meeting
                                      {doc.linkedTo.meetings > 1 ? "s" : ""}
                                    </Badge>
                                  )}
                                  {doc.linkedTo.releases && (
                                    <Badge variant="outline" className="text-xs">
                                      <Rocket className="mr-1 size-3" />
                                      {doc.linkedTo.releases} Release
                                      {doc.linkedTo.releases > 1 ? "s" : ""}
                                    </Badge>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}