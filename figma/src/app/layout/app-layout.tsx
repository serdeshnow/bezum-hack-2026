import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { AppSidebar } from "../components/app-shell/sidebar";
import { Header } from "../components/app-shell/header";
import { ProjectSwitcher } from "../components/app-shell/project-switcher";
import { CommandPalette } from "../components/app-shell/command-palette";
import { Separator } from "../components/ui/separator";

type AppState = "loading" | "empty" | "error" | "populated";

// Mock data
const mockProjects = [
  { id: "1", name: "E-commerce Platform", status: "active" as const },
  { id: "2", name: "Mobile App Redesign", status: "active" as const },
  { id: "3", name: "Legacy System Migration", status: "archived" as const },
];

const mockNotifications = [
  {
    id: "1",
    title: "New task assigned",
    description: "Update API documentation",
    timestamp: "2 minutes ago",
    read: false,
    type: "task" as const,
  },
  {
    id: "2",
    title: "Meeting scheduled",
    description: "Sprint planning for Q2",
    timestamp: "1 hour ago",
    read: false,
    type: "meeting" as const,
  },
  {
    id: "3",
    title: "Release completed",
    description: "Version 2.1.0 deployed to production",
    timestamp: "3 hours ago",
    read: true,
    type: "release" as const,
  },
];

export function AppLayout() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState("1");
  const [userRole] = useState<"Customer" | "Developer" | "Manager">("Developer");
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active nav item from current path
  const getActiveNavItem = () => {
    const path = location.pathname;
    if (path.startsWith("/projects")) return "projects";
    if (path.startsWith("/epochs")) return "epochs";
    if (path.startsWith("/tasks")) return "tasks";
    if (path.startsWith("/docs")) return "docs";
    if (path.startsWith("/meetings")) return "meetings";
    if (path.startsWith("/releases")) return "releases";
    if (path.startsWith("/notifications")) return "notifications";
    if (path.startsWith("/settings")) return "settings";
    return "projects";
  };

  // Generate breadcrumbs from current path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);
    
    const breadcrumbs: Array<{ label: string; href?: string }> = [];
    
    if (segments.length === 0 || segments[0] === "projects") {
      breadcrumbs.push({ label: "Projects", href: "/projects" });
      if (segments.length > 1) {
        breadcrumbs.push({ label: "E-commerce Platform", href: `/projects/${segments[1]}` });
        if (segments.length > 2) {
          breadcrumbs.push({ label: "Overview" });
        }
      }
    } else if (segments[0] === "tasks") {
      breadcrumbs.push({ label: "Tasks", href: "/tasks" });
      if (segments.length > 1) {
        breadcrumbs.push({ label: `Task #${segments[1]}` });
      }
    } else if (segments[0] === "docs") {
      breadcrumbs.push({ label: "Docs", href: "/docs" });
      if (segments.length > 1) {
        breadcrumbs.push({ label: "Document", href: `/docs/${segments[1]}` });
        if (segments[2] === "history") {
          breadcrumbs.push({ label: "History" });
        }
      }
    } else if (segments[0] === "epochs") {
      breadcrumbs.push({ label: "Epochs", href: "/epochs" });
      if (segments.length > 1) {
        breadcrumbs.push({ label: "Q2 2026 Sprint" });
      }
    } else if (segments[0] === "meetings") {
      breadcrumbs.push({ label: "Meetings", href: "/meetings" });
      if (segments.length > 1) {
        breadcrumbs.push({ label: "Meeting Details" });
      }
    } else if (segments[0] === "releases") {
      breadcrumbs.push({ label: "Releases" });
    } else if (segments[0] === "notifications") {
      breadcrumbs.push({ label: "Notifications" });
    } else if (segments[0] === "settings") {
      breadcrumbs.push({ label: "Settings" });
    }
    
    return breadcrumbs;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <AppSidebar
        activeItem={getActiveNavItem()}
        onNavigate={(href) => {
          navigate(href);
        }}
        taskCount={12}
        notificationCount={2}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          role={userRole}
          breadcrumbs={getBreadcrumbs()}
          breadcrumbsState="populated"
          notificationsState="populated"
          notifications={mockNotifications}
          unreadCount={2}
          onSearchClick={() => setCommandPaletteOpen(true)}
          onNotificationClick={(id) => console.log("Notification clicked:", id)}
          onMarkAllRead={() => console.log("Mark all as read")}
          onBreadcrumbNavigate={(href) => navigate(href)}
          onCreateTask={() => navigate("/tasks")}
          onCreateDoc={() => navigate("/docs")}
          onScheduleMeeting={() => navigate("/meetings")}
        />

        {/* Project Switcher */}
        {!location.pathname.includes("/settings") && !location.pathname.includes("/notifications") && (
          <>
            <div className="border-b border-border bg-card p-4">
              <ProjectSwitcher
                state="populated"
                projects={mockProjects}
                currentProjectId={currentProjectId}
                onProjectChange={(id) => {
                  setCurrentProjectId(id);
                  navigate("/projects/" + id);
                }}
                onCreateProject={() => console.log("Create project")}
              />
            </div>
            <Separator />
          </>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onNavigate={(path) => {
          navigate(path);
        }}
      />
    </div>
  );
}
