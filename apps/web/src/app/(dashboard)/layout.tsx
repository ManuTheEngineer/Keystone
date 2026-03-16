"use client";

import { useState, useEffect, useCallback, useMemo, createContext, useContext, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { WifiOff } from "lucide-react";
import { usePWA } from "@/lib/hooks/use-pwa";
import { signOut } from "@/lib/services/auth-service";
import { subscribeToUserProjects, subscribeToPunchListItems, subscribeToTasks, subscribeToDailyLogs, type ProjectData, type PunchListItemData, type TaskData, type DailyLogData } from "@/lib/services/project-service";
import { LocaleContext } from "@/lib/hooks/use-locale";
import { getLocaleForMarket } from "@/lib/i18n";
import { AIMentor } from "@/components/ui/AIMentor";
import { generateProjectNotifications, generateDetailedNotifications, sortNotifications, type AppNotification } from "@/lib/notifications";

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
  const [punchListCount, setPunchListCount] = useState(0);
  const [openTaskCount, setOpenTaskCount] = useState(0);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());
  const [detailedData, setDetailedData] = useState<Record<string, { punchList: PunchListItemData[]; tasks: TaskData[]; dailyLogs: DailyLogData[] }>>({});
  const router = useRouter();
  const pathname = usePathname();
  const { isOnline } = usePWA();
  const { user, profile } = useAuth();

  // Subscribe to projects from Firebase
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserProjects(user.uid, setProjects);
    return unsub;
  }, [user]);

  const activeSection = getActiveSectionFromPath(pathname);

  // Extract project ID from path
  const projectMatch = pathname.match(/\/project\/([^/]+)/);
  const currentProjectId = projectMatch?.[1] ?? null;
  const currentProject = projects.find((p) => p.id === currentProjectId);

  // Subscribe to punch list items and tasks for badge counts
  useEffect(() => {
    if (!user || !currentProjectId) {
      setPunchListCount(0);
      setOpenTaskCount(0);
      return;
    }
    const unsub1 = subscribeToPunchListItems(user.uid, currentProjectId, (items) => {
      setPunchListCount(items.filter((i) => i.status === "open").length);
    });
    const unsub2 = subscribeToTasks(user.uid, currentProjectId, (tasks) => {
      setOpenTaskCount(tasks.filter((t) => !t.done).length);
    });
    return () => { unsub1(); unsub2(); };
  }, [user, currentProjectId]);

  // Get top 3 priority projects for detailed notification subscriptions
  const priorityProjects = useMemo(() => {
    const active = projects.filter((p) => p.status === "ACTIVE");
    const sorted = [...active].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const pa = a.priority ?? 999;
      const pb = b.priority ?? 999;
      if (pa !== pb) return pa - pb;
      const ua = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const ub = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return ub - ua;
    });
    return sorted.slice(0, 3);
  }, [projects]);

  // Subscribe to detailed data for top 3 priority projects
  useEffect(() => {
    if (!user || priorityProjects.length === 0) {
      setDetailedData({});
      return;
    }

    const unsubs: (() => void)[] = [];
    const collected: Record<string, { punchList: PunchListItemData[]; tasks: TaskData[]; dailyLogs: DailyLogData[] }> = {};

    for (const project of priorityProjects) {
      const pid = project.id;
      if (!pid) continue;

      collected[pid] = { punchList: [], tasks: [], dailyLogs: [] };

      unsubs.push(
        subscribeToPunchListItems(user.uid, pid, (items) => {
          collected[pid] = { ...collected[pid], punchList: items };
          setDetailedData({ ...collected });
        })
      );
      unsubs.push(
        subscribeToTasks(user.uid, pid, (tasks) => {
          collected[pid] = { ...collected[pid], tasks };
          setDetailedData({ ...collected });
        })
      );
      unsubs.push(
        subscribeToDailyLogs(user.uid, pid, (logs) => {
          collected[pid] = { ...collected[pid], dailyLogs: logs };
          setDetailedData({ ...collected });
        })
      );
    }

    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [user, priorityProjects]);

  // Generate notifications
  const notifications = useMemo(() => {
    const projectNotifs = generateProjectNotifications(projects);

    const detailedNotifs: AppNotification[] = [];
    for (const project of priorityProjects) {
      const pid = project.id;
      if (!pid || !detailedData[pid]) continue;
      const data = detailedData[pid];
      detailedNotifs.push(
        ...generateDetailedNotifications(project, data.punchList, data.tasks, data.dailyLogs)
      );
    }

    const all = [...projectNotifs, ...detailedNotifs];
    // Filter out dismissed
    const filtered = all.filter((n) => !dismissedNotifications.has(n.id));
    return sortNotifications(filtered);
  }, [projects, priorityProjects, detailedData, dismissedNotifications]);

  function handleDismissNotification(id: string) {
    setDismissedNotifications((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  function handleDismissAllNotifications() {
    setDismissedNotifications((prev) => {
      const next = new Set(prev);
      for (const n of notifications) {
        next.add(n.id);
      }
      return next;
    });
  }

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
            badges={{ "punch-list": punchListCount, "overview": openTaskCount > 5 ? openTaskCount : 0 }}
          />
          <div className="lg:ml-[240px] flex flex-col min-h-screen">
            <Topbar
              title={topbarState.title}
              badge={topbarState.badge || undefined}
              badgeVariant={topbarState.badgeVariant}
              onMenuToggle={() => setSidebarOpen(true)}
              notifications={notifications}
              onDismissNotification={handleDismissNotification}
              onDismissAllNotifications={handleDismissAllNotifications}
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
            <AIMentor
              page={activeSection}
              project={currentProject ?? undefined}
            />
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
  if (pathname.includes("/project/") && pathname.includes("/vault")) return "vault";
  if (pathname === "/vault" || pathname.startsWith("/vault")) return "portfolio";
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
  if (section === "portfolio") return "/vault";
  if (section === "new-project") return "/new-project";
  if (section === "learn") return "/learn";
  if (section === "settings") return "/settings";
  return "/dashboard";
}
