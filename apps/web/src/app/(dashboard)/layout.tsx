"use client";

import { useState, createContext, useContext, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { WifiOff } from "lucide-react";
import { usePWA } from "@/lib/hooks/use-pwa";

interface DashboardContextValue {
  setTopbar: (title: string, badge?: string, badgeVariant?: "success" | "warning" | "info" | "danger") => void;
}

const DashboardContext = createContext<DashboardContextValue>({
  setTopbar: () => {},
});

export function useTopbar() {
  return useContext(DashboardContext);
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topbarState, setTopbarState] = useState<{ title: string; badge: string; badgeVariant: "success" | "warning" | "info" | "danger" }>({ title: "Dashboard", badge: "", badgeVariant: "info" });
  const router = useRouter();
  const pathname = usePathname();
  const { isOnline } = usePWA();

  const activeSection = getActiveSectionFromPath(pathname);

  function handleNavigate(section: string) {
    setSidebarOpen(false);
    const route = sectionToRoute(section);
    router.push(route);
  }

  function setTopbar(title: string, badge?: string, badgeVariant?: "success" | "warning" | "info" | "danger") {
    setTopbarState({ title, badge: badge ?? "", badgeVariant: badgeVariant ?? "info" });
  }

  // Determine project name from path
  const isProjectRoute = pathname.includes("/project/");
  const projectName = isProjectRoute ? "Robinson residence" : undefined;

  return (
    <DashboardContext.Provider value={{ setTopbar }}>
      <div className="min-h-screen bg-background">
        <Sidebar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          projectName={projectName}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="lg:ml-[260px] flex flex-col min-h-screen">
          <Topbar
            title={topbarState.title}
            badge={topbarState.badge || undefined}
            badgeVariant={topbarState.badgeVariant}
            onMenuToggle={() => setSidebarOpen(true)}
          />
          {!isOnline && (
            <div className="mx-5 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-warning-bg text-warning text-[11px]">
              <WifiOff size={14} />
              You are offline. Changes will sync when connection is restored.
            </div>
          )}
          <main className="flex-1 p-5 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}

function getActiveSectionFromPath(pathname: string): string {
  if (pathname === "/") return "dashboard";
  if (pathname.includes("/new-project")) return "new-project";
  if (pathname.includes("/learn")) return "learn";
  if (pathname.includes("/overview")) return "overview";
  if (pathname.includes("/budget")) return "budget";
  if (pathname.includes("/schedule")) return "schedule";
  if (pathname.includes("/team")) return "team";
  if (pathname.includes("/documents")) return "documents";
  if (pathname.includes("/photos")) return "photos";
  if (pathname.includes("/daily-log")) return "daily-log";
  if (pathname.includes("/ai-assistant")) return "ai-assistant";
  if (pathname.includes("/tasks")) return "tasks";
  return "dashboard";
}

function sectionToRoute(section: string): string {
  const projectId = "robinson";
  const projectRoutes: Record<string, string> = {
    overview: `/project/${projectId}/overview`,
    tasks: `/project/${projectId}/overview`,
    budget: `/project/${projectId}/budget`,
    schedule: `/project/${projectId}/schedule`,
    team: `/project/${projectId}/team`,
    documents: `/project/${projectId}/documents`,
    photos: `/project/${projectId}/photos`,
    "daily-log": `/project/${projectId}/daily-log`,
    "ai-assistant": `/project/${projectId}/ai-assistant`,
  };
  if (projectRoutes[section]) return projectRoutes[section];
  if (section === "new-project") return "/new-project";
  if (section === "learn") return "/learn";
  return "/";
}
