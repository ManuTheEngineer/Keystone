"use client";

import { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { WifiOff, Clock } from "lucide-react";
import Link from "next/link";
import { checkAndRevertExpiredTrial } from "@/lib/services/trial-service";
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

function formatTrialExpiry(expiresAt: string): string {
  const expiry = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 0) return "expired";
  if (diffHours < 24) return `in ${diffHours} hours`;
  const diffDays = Math.ceil(diffHours / 24);
  return `in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  // Check and revert expired trials
  useEffect(() => {
    if (!user || !profile?.trialExpiresAt) return;
    checkAndRevertExpiredTrial(user.uid);
  }, [user, profile?.trialExpiresAt]);

  // Subscribe to projects from Firebase
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserProjects(user.uid, setProjects);
    return unsub;
  }, [user]);

  // Sync sidebar collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("keystone-sidebar-collapsed");
    setSidebarCollapsed(stored === "true");

    const handleStorage = () => {
      setSidebarCollapsed(localStorage.getItem("keystone-sidebar-collapsed") === "true");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Set CSS variable for sidebar width (used by fixed-position elements like budget sticky bar)
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      sidebarCollapsed ? "60px" : "240px"
    );
  }, [sidebarCollapsed]);

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
  const collectedRef = useRef<Record<string, { punchList: PunchListItemData[]; tasks: TaskData[]; dailyLogs: DailyLogData[] }>>({});
  useEffect(() => {
    if (!user || priorityProjects.length === 0) {
      collectedRef.current = {};
      setDetailedData({});
      return;
    }

    const unsubs: (() => void)[] = [];
    collectedRef.current = {};

    for (const project of priorityProjects) {
      const pid = project.id;
      if (!pid) continue;

      collectedRef.current[pid] = { punchList: [], tasks: [], dailyLogs: [] };

      unsubs.push(
        subscribeToPunchListItems(user.uid, pid, (items) => {
          collectedRef.current[pid] = { ...collectedRef.current[pid], punchList: items };
          setDetailedData({ ...collectedRef.current });
        })
      );
      unsubs.push(
        subscribeToTasks(user.uid, pid, (tasks) => {
          collectedRef.current[pid] = { ...collectedRef.current[pid], tasks };
          setDetailedData({ ...collectedRef.current });
        })
      );
      unsubs.push(
        subscribeToDailyLogs(user.uid, pid, (logs) => {
          collectedRef.current[pid] = { ...collectedRef.current[pid], dailyLogs: logs };
          setDetailedData({ ...collectedRef.current });
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
          <div className={`${sidebarCollapsed ? "lg:ml-[60px]" : "lg:ml-[240px]"} transition-all duration-300 flex flex-col min-h-screen min-w-0 bg-surface-dim lg:pl-2 lg:pr-2`}>
            <div className="flex flex-col flex-1 bg-background rounded-t-3xl mt-2 shadow-[var(--shadow-sm)] min-w-0 overflow-hidden">
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
                <div className="mx-5 mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warning-bg text-warning text-[11px]">
                  <WifiOff size={14} />
                  You are offline. Changes will sync when connection is restored.
                </div>
              )}
              {profile?.subscriptionStatus === "trialing" && profile?.trialExpiresAt && (
                <div className="mx-5 mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-info-bg border border-info/20 text-[12px]">
                  <Clock size={14} className="text-info shrink-0" />
                  <span className="text-earth">
                    <span className="font-medium">Trial active</span>
                    {" "}— your {profile.plan} access expires{" "}
                    <span className="font-data font-medium">
                      {formatTrialExpiry(profile.trialExpiresAt)}
                    </span>
                  </span>
                  <Link
                    href="/settings"
                    className="ml-auto text-[11px] font-medium text-clay hover:text-earth transition-colors shrink-0"
                  >
                    Upgrade now
                  </Link>
                </div>
              )}
              <main className="flex-1 p-5 overflow-y-auto min-w-0">
                {children}
              </main>
            </div>
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
