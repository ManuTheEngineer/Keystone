"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { WifiOff, LogOut } from "lucide-react";
import { usePWA } from "@/lib/hooks/use-pwa";
import { signOut } from "@/lib/services/auth-service";
import { getUserProjects, type ProjectData } from "@/lib/services/project-service";
import { LocaleContext } from "@/lib/hooks/use-locale";
import { getLocaleForMarket } from "@/lib/i18n";

interface DashboardContextValue {
  setTopbar: (title: string, badge?: string, badgeVariant?: "success" | "warning" | "info" | "danger") => void;
  projects: ProjectData[];
  currentProjectId: string | null;
}

const DashboardContext = createContext<DashboardContextValue>({
  setTopbar: () => {},
  projects: [],
  currentProjectId: null,
});

export function useDashboard() {
  return useContext(DashboardContext);
}

export function useTopbar() {
  const { setTopbar } = useContext(DashboardContext);
  return { setTopbar };
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topbarState, setTopbarState] = useState<{ title: string; badge: string; badgeVariant: "success" | "warning" | "info" | "danger" }>({ title: "Dashboard", badge: "", badgeVariant: "info" });
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const { isOnline } = usePWA();
  const { user, profile } = useAuth();

  // Load projects from Firebase
  useEffect(() => {
    if (!user) return;
    getUserProjects(user.uid).then(setProjects).catch(() => {
      // Firebase may not have data yet, that is fine
      setProjects([]);
    });
  }, [user]);

  const activeSection = getActiveSectionFromPath(pathname);

  // Extract project ID from path
  const projectMatch = pathname.match(/\/project\/([^/]+)/);
  const currentProjectId = projectMatch?.[1] ?? null;
  const currentProject = projects.find((p) => p.id === currentProjectId);

  function handleNavigate(section: string) {
    setSidebarOpen(false);
    const route = sectionToRoute(section, currentProjectId);
    router.push(route);
  }

  const setTopbar = useCallback((title: string, badge?: string, badgeVariant?: "success" | "warning" | "info" | "danger") => {
    setTopbarState({ title, badge: badge ?? "", badgeVariant: badgeVariant ?? "info" });
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const isProjectRoute = pathname.includes("/project/");
  const projectName = isProjectRoute ? (currentProject?.name ?? "Project") : undefined;
  const locale = currentProject ? getLocaleForMarket(currentProject.market ?? "") : "en";

  return (
    <AuthGuard>
      <DashboardContext.Provider value={{ setTopbar, projects, currentProjectId }}>
        <LocaleContext.Provider value={locale}>
        <div className="min-h-screen bg-background">
          <Sidebar
            activeSection={activeSection}
            onNavigate={handleNavigate}
            projectName={projectName}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            userName={profile?.name ?? user?.displayName ?? "User"}
            userPlan={profile?.plan ?? "FOUNDATION"}
            onSignOut={handleSignOut}
            locale={locale}
            projectMarket={currentProject?.market}
          />
          <div className="lg:ml-[240px] flex flex-col min-h-screen">
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
        </LocaleContext.Provider>
      </DashboardContext.Provider>
    </AuthGuard>
  );
}

function getActiveSectionFromPath(pathname: string): string {
  if (pathname === "/" || pathname === "/dashboard") return "dashboard";
  if (pathname.includes("/new-project")) return "new-project";
  if (pathname.includes("/learn")) return "learn";
  if (pathname.includes("/settings")) return "settings";
  if (pathname.includes("/overview")) return "overview";
  if (pathname.includes("/financials")) return "financials";
  if (pathname.includes("/budget")) return "budget";
  if (pathname.includes("/schedule")) return "schedule";
  if (pathname.includes("/team")) return "team";
  if (pathname.includes("/documents")) return "documents";
  if (pathname.includes("/vault")) return "vault";
  if (pathname.includes("/photos")) return "photos";
  if (pathname.includes("/daily-log")) return "daily-log";
  if (pathname.includes("/inspections")) return "inspections";
  if (pathname.includes("/punch-list")) return "punch-list";
  if (pathname.includes("/ai-assistant")) return "ai-assistant";
  if (pathname.includes("/monitor")) return "monitor";
  if (pathname.includes("/tasks")) return "tasks";
  return "dashboard";
}

function sectionToRoute(section: string, currentProjectId: string | null): string {
  const pid = currentProjectId ?? "new";
  const projectRoutes: Record<string, string> = {
    overview: `/project/${pid}/overview`,
    tasks: `/project/${pid}/overview`,
    budget: `/project/${pid}/budget`,
    financials: `/project/${pid}/financials`,
    schedule: `/project/${pid}/schedule`,
    team: `/project/${pid}/team`,
    documents: `/project/${pid}/documents`,
    vault: `/project/${pid}/vault`,
    photos: `/project/${pid}/photos`,
    "daily-log": `/project/${pid}/daily-log`,
    inspections: `/project/${pid}/inspections`,
    "punch-list": `/project/${pid}/punch-list`,
    "ai-assistant": `/project/${pid}/ai-assistant`,
    monitor: `/project/${pid}/monitor`,
  };
  if (projectRoutes[section]) return projectRoutes[section];
  if (section === "new-project") return "/new-project";
  if (section === "learn") return "/learn";
  if (section === "settings") return "/settings";
  return "/dashboard";
}
