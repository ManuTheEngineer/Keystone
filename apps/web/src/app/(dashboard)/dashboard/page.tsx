"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useTopbar, useDashboard } from "../layout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTranslation } from "@/lib/hooks/use-translation";
import { useToast } from "@/components/ui/Toast";
import {
  ref as dbRef,
  get as dbGet,
  set as dbSet,
} from "firebase/database";
import { db } from "@/lib/firebase";
import {
  subscribeToUserProjects,
  subscribeToDailyLogs,
  subscribeToTasks,
  subscribeToPhotos,
  subscribeToPunchListItems,
  seedDemoProject,
  updateProjectPriority,
  deleteProject,
  type ProjectData,
  type TaskData,
  type PunchListItemData,
} from "@/lib/services/project-service";
import { getUserAnalyses, type SavedAnalysis } from "@/lib/services/analysis-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MarketBadge } from "@/components/ui/MarketBadge";
import { OnboardingTour } from "@/components/ui/OnboardingTour";
import { getMarketData, formatCurrencyCompact, USD_CONFIG } from "@keystone/market-data";
import type { Market } from "@keystone/market-data";
import {
  Plus,
  BookOpen,
  TrendingUp,
  FolderOpen,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Circle,
  ListChecks,
  DollarSign,
  Calendar,
  ClipboardCheck,
  Download,
  Lightbulb,
  MoreVertical,
  Eye,
  Trash2,
  ChevronRight,
  Calculator,
  Lock,
} from "lucide-react";
import { getPlanLimits } from "@/lib/stripe-config";
import type { PlanTier } from "@/lib/stripe-config";

/* ------------------------------------------------------------------ */
/*  Circular progress ring                                            */
/* ------------------------------------------------------------------ */

function ProgressRing({ progress, size = 48 }: { progress: number; size?: number }) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="var(--color-surface-alt)"
        strokeWidth={3}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="var(--color-emerald-500)"
        strokeWidth={3}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-earth font-data text-[11px] font-medium"
        transform={`rotate(90, ${size / 2}, ${size / 2})`}
      >
        {progress}%
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Priority indicator                                                */
/* ------------------------------------------------------------------ */

function PriorityIndicator({ priority }: { priority: number | undefined }) {
  if (!priority) return null;
  const labels: Record<number, string> = { 1: "High", 2: "Med", 3: "Low" };
  const colors: Record<number, string> = {
    1: "bg-danger text-white",
    2: "bg-warning text-white",
    3: "bg-info text-white",
  };
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${colors[priority] ?? "bg-muted text-white"}`}>
      P{priority} {labels[priority] ?? ""}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Project kebab menu                                                */
/* ------------------------------------------------------------------ */

function ProjectKebabMenu({
  project,
  onSetPriority,
  onDelete,
}: {
  project: ProjectData;
  onSetPriority: (p: number | null) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [showPrioritySub, setShowPrioritySub] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteNameInput, setDeleteNameInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Calculate fixed position when menu opens — recalculate on scroll/resize
  useEffect(() => {
    if (!open || !buttonRef.current) return;
    function updatePos() {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 220;
      const menuHeight = 280;
      let top = rect.bottom + 4;
      let left = rect.right - menuWidth;
      // Keep menu within viewport
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 4;
      }
      if (top < 8) top = 8;
      if (left < 8) left = 8;
      if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
      setMenuPos({ top, left });
    }
    updatePos();
    // Recalculate if the scrollable parent scrolls or window resizes
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open]);

  const menuPortal = open && typeof document !== "undefined" ? createPortal(
    <div ref={menuRef}>
      <div
        className="fixed inset-0 z-[60]"
        onClick={() => { setOpen(false); setShowPrioritySub(false); setShowDeleteConfirm(false); setDeleteNameInput(""); }}
      />
      <div
        className="fixed w-[220px] bg-surface border border-border rounded-lg shadow-lg z-[61] py-1"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          {/* View project */}
          <a
            href={`/project/${project.id}/overview`}
            onClick={() => setOpen(false)}
            className="w-full text-left px-3 py-2 text-[12px] text-earth hover:bg-warm/50 transition-colors flex items-center gap-2"
          >
            <Eye size={13} />
            View project
          </a>

          <div className="h-px bg-border my-1" />

          {/* Set priority */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPrioritySub(!showPrioritySub);
              setShowDeleteConfirm(false);
            }}
            className="w-full text-left px-3 py-2 text-[12px] text-earth hover:bg-warm/50 transition-colors flex items-center justify-between"
          >
            <span>Set priority</span>
            <ChevronRight size={12} className="text-muted" />
          </button>
          {showPrioritySub && (
            <div className="px-2 pb-1">
              {[1, 2, 3].map((level) => {
                const priorityLabels: Record<number, string> = { 1: "High", 2: "Medium", 3: "Low" };
                const isActive = project.priority === level;
                return (
                  <button
                    key={level}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetPriority(isActive ? null : level);
                      setOpen(false);
                      setShowPrioritySub(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[12px] rounded hover:bg-warm/50 transition-colors flex items-center gap-2 ${isActive ? "text-earth font-medium" : "text-muted"}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${level === 1 ? "bg-danger" : level === 2 ? "bg-warning" : "bg-info"}`} />
                    {priorityLabels[level]}
                    {isActive && <span className="ml-auto text-[10px] text-clay">(active)</span>}
                  </button>
                );
              })}
              {project.priority && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetPriority(null);
                    setOpen(false);
                    setShowPrioritySub(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[12px] rounded hover:bg-warm/50 transition-colors text-muted"
                >
                  Clear priority
                </button>
              )}
            </div>
          )}

          <div className="h-px bg-border my-1" />

          {/* Delete project */}
          {!showDeleteConfirm ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
                setShowPrioritySub(false);
              }}
              className="w-full text-left px-3 py-2 text-[12px] text-danger hover:bg-danger/5 transition-colors flex items-center gap-2"
            >
              <Trash2 size={13} />
              Delete project
            </button>
          ) : (
            <div className="px-3 py-2">
              <p className="text-[11px] text-muted mb-1.5">
                Type <strong className="text-earth">{project.name}</strong> to confirm deletion.
              </p>
              <input
                type="text"
                value={deleteNameInput}
                onChange={(e) => setDeleteNameInput(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder={project.name}
                className="w-full px-2 py-1.5 text-[11px] border border-border rounded bg-surface text-earth placeholder:text-muted/40 focus:outline-none focus:border-danger mb-1.5"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (deleteNameInput === project.name) {
                    setDeleting(true);
                    onDelete();
                    setOpen(false);
                  }
                }}
                disabled={deleteNameInput !== project.name || deleting}
                className="w-full px-2 py-1.5 text-[11px] font-medium rounded bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-40"
              >
                {deleting ? "Deleting..." : "Confirm delete"}
              </button>
            </div>
          )}
        </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
          setShowPrioritySub(false);
          setShowDeleteConfirm(false);
          setDeleteNameInput("");
        }}
        className="p-1 rounded text-muted hover:text-earth hover:bg-warm transition-colors"
        aria-label="Project actions"
      >
        <MoreVertical size={16} />
      </button>
      {menuPortal}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Keystone house illustration for empty state                       */
/* ------------------------------------------------------------------ */

function KeystoneHouseIllustration() {
  return (
    <svg
      width="120"
      height="100"
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto mb-5"
    >
      <path
        d="M60 10 L15 50 L105 50 Z"
        stroke="var(--color-clay)"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M54 28 L60 18 L66 28 L64 32 L56 32 Z"
        stroke="var(--color-earth)"
        strokeWidth="1.5"
        fill="var(--color-sand)"
        strokeLinejoin="round"
      />
      <rect
        x="25"
        y="50"
        width="70"
        height="40"
        stroke="var(--color-clay)"
        strokeWidth="2"
        fill="none"
        rx="1"
      />
      <rect
        x="50"
        y="65"
        width="20"
        height="25"
        stroke="var(--color-sand)"
        strokeWidth="1.5"
        fill="none"
        rx="1"
      />
      <circle cx="66" cy="78" r="1.5" fill="var(--color-clay)" />
      <rect x="32" y="58" width="12" height="12" stroke="var(--color-sand)" strokeWidth="1.5" fill="none" rx="1" />
      <rect x="76" y="58" width="12" height="12" stroke="var(--color-sand)" strokeWidth="1.5" fill="none" rx="1" />
      <line x1="10" y1="90" x2="110" y2="90" stroke="var(--color-sand)" strokeWidth="1" strokeDasharray="4 3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity types                                                    */
/* ------------------------------------------------------------------ */

interface ActivityItem {
  id: string;
  type: "daily-log" | "task-completed" | "photo-uploaded";
  text: string;
  projectName: string;
  projectId: string;
  timestamp: string;
  logDay?: number;
}

/* ------------------------------------------------------------------ */
/*  Action item types                                                 */
/* ------------------------------------------------------------------ */

interface ActionItem {
  id: string;
  projectId: string;
  projectName: string;
  description: string;
  urgency: "red" | "yellow" | "blue";
  href: string;
  type: "task" | "punch" | "budget" | "inspection" | "milestone";
}

/* ------------------------------------------------------------------ */
/*  Time helpers                                                      */
/* ------------------------------------------------------------------ */

function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t("dashboard.greeting.morning");
  if (hour < 17) return t("dashboard.greeting.afternoon");
  return t("dashboard.greeting.evening");
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatRelativeTime(timestamp: string): string {
  if (!timestamp) return "";
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] || fullName;
}

/* ------------------------------------------------------------------ */
/*  Urgency dot color                                                 */
/* ------------------------------------------------------------------ */

function urgencyDotColor(urgency: ActionItem["urgency"]): string {
  switch (urgency) {
    case "red": return "bg-danger";
    case "yellow": return "bg-warning";
    case "blue": return "bg-info";
  }
}

function activityDotColor(type: ActivityItem["type"]): string {
  switch (type) {
    case "task-completed": return "bg-emerald-500";
    case "daily-log": return "bg-info";
    case "photo-uploaded": return "bg-amber-500";
  }
}

/* ------------------------------------------------------------------ */
/*  Key metric for a project                                          */
/* ------------------------------------------------------------------ */

function getKeyMetric(project: ProjectData): { label: string; value: string; variant: "danger" | "warning" | "info" | "success" } {
  if (project.totalBudget > 0 && project.totalSpent > project.totalBudget * 0.95) {
    const overPct = Math.round(((project.totalSpent - project.totalBudget) / project.totalBudget) * 100);
    if (overPct > 0) {
      return { label: "Over budget", value: `+${overPct}%`, variant: "danger" };
    }
    return { label: "Budget at limit", value: "95%+ spent", variant: "danger" };
  }

  if (project.totalWeeks > 0 && project.currentWeek > 0) {
    const expectedProgress = (project.currentWeek / project.totalWeeks) * 100;
    const behind = expectedProgress - project.progress;
    if (behind > 15) {
      const weeksBehind = Math.round((behind / 100) * project.totalWeeks);
      return { label: "Behind schedule", value: `${weeksBehind}w behind`, variant: "warning" };
    }
  }

  if (project.openItems > 5) {
    return { label: "Open items", value: String(project.openItems), variant: "warning" };
  }

  return { label: "Progress", value: `${project.progress}%`, variant: "success" };
}

/* ------------------------------------------------------------------ */
/*  Next action suggestion                                            */
/* ------------------------------------------------------------------ */

function getNextAction(project: ProjectData): { text: string; href: string } {
  const id = project.id ?? "";
  if (project.currentPhase === 0) return { text: "Define your project scope and requirements", href: `/project/${id}/overview` };
  if (project.currentPhase === 1) return { text: "Secure financing and set your budget", href: `/project/${id}/budget` };
  if (project.currentPhase === 2) return { text: "Complete land acquisition and title verification", href: `/project/${id}/documents` };
  if (project.currentPhase === 3) return { text: "Finalize architectural plans and specifications", href: `/project/${id}/documents` };
  if (project.currentPhase === 4) return { text: "Submit permit applications and get approvals", href: `/project/${id}/documents` };
  if (project.currentPhase === 5) return { text: "Hire contractors and assemble your build team", href: `/project/${id}/team` };
  if (project.currentPhase === 6) {
    if (project.progress < 30) return { text: "Foundation and framing in progress", href: `/project/${id}/daily-log` };
    if (project.progress < 50) return { text: "Schedule rough-in inspections", href: `/project/${id}/inspections` };
    if (project.progress < 70) return { text: "Complete mechanical systems and insulation", href: `/project/${id}/daily-log` };
    if (project.progress < 90) return { text: "Interior and exterior finishes underway", href: `/project/${id}/daily-log` };
    return { text: "Prepare for final inspection and walkthrough", href: `/project/${id}/inspections` };
  }
  if (project.currentPhase === 7) return { text: "Complete final inspections and punch list", href: `/project/${id}/punch-list` };
  if (project.currentPhase === 8) return { text: "Manage property operations and maintenance", href: `/project/${id}/overview` };
  return { text: "Review project status", href: `/project/${id}/overview` };
}

/* ------------------------------------------------------------------ */
/*  AI Mentor tip based on project state                              */
/* ------------------------------------------------------------------ */

function getMentorTip(project: ProjectData | null): string {
  if (!project) return "Start by creating your first project. Keystone will guide you through every phase of the build.";
  const phase = project.currentPhase;
  if (phase === 0) return "Take your time in the Define phase. A clear scope prevents costly changes later. Write down your must-haves versus nice-to-haves before setting a budget.";
  if (phase === 1) return "Most first-time builders underestimate costs by 15-25%. Build a contingency of at least 15% into your budget from the start.";
  if (phase === 2) return "Never skip a title search or boundary survey. Land disputes are the number one cause of construction project delays in both the US and West Africa.";
  if (phase === 3) return "Review your plans with at least two contractors before finalizing. Their feedback on buildability can save you thousands in change orders.";
  if (phase === 4) return "Permit timelines vary widely. Submit early and follow up weekly. A delayed permit delays everything downstream.";
  if (phase === 5) return "Get at least three bids for every major trade. Check references and visit active job sites before signing contracts.";
  if (phase === 6) {
    if (project.progress < 50) return "Daily logs and progress photos are your best protection against disputes. Document everything, even when progress seems slow.";
    return "You are past the halfway mark. Now is the time to review your punch list strategy and plan for final inspections.";
  }
  if (phase === 7) return "Do not rush the verification phase. Every punch list item resolved now prevents a callback after move-in.";
  if (phase === 8) return "Track your actual costs against your original budget. This data becomes invaluable if you build again or advise others.";
  return "Keep your project data up to date. Accurate records make every decision easier.";
}

/* ------------------------------------------------------------------ */
/*  Market dot color for portfolio thumbnails                         */
/* ------------------------------------------------------------------ */

function marketDotColor(market: string): string {
  if (market === "USA") return "bg-[var(--color-accent-usa)]";
  return "bg-[var(--color-accent-wa)]";
}

/* ------------------------------------------------------------------ */
/*  Getting Started checklist                                         */
/* ------------------------------------------------------------------ */

function GettingStartedChecklist({ projects }: { projects: ProjectData[] }) {
  const realProjects = projects.filter((p: any) => !p.isDemo);
  const demoProject = projects.find((p: any) => p.isDemo);
  const firstProject = realProjects[0] ?? demoProject;

  // Hide once user has 2+ real projects
  if (realProjects.length >= 2) return null;

  const hasAnyProject = projects.length > 0;
  const hasRealProject = realProjects.length > 0;
  const hasPastDefine = projects.some((p) => (p.currentPhase ?? 0) > 0);
  const hasBudgetData = projects.some((p) => (p.totalBudget ?? 0) > 0 || (p.totalSpent ?? 0) > 0);

  const items = [
    { done: true, label: "Create your account", href: undefined as string | undefined },
    {
      done: hasAnyProject && !!demoProject,
      label: "Explore the demo project",
      href: demoProject ? `/project/${demoProject.id}/overview` : "/dashboard",
    },
    {
      done: hasRealProject,
      label: "Create your first project",
      href: "/new-project",
    },
    {
      done: hasPastDefine,
      label: "Complete Phase 0: Define",
      href: firstProject ? `/project/${firstProject.id}/overview` : "/dashboard",
    },
    {
      done: hasBudgetData,
      label: "Review your budget",
      href: firstProject ? `/project/${firstProject.id}/financials` : "/dashboard",
    },
  ];

  const allDone = items.every((i) => i.done);
  if (allDone) return null;

  return (
    <div className="mb-6">
      <SectionLabel>Getting Started</SectionLabel>
      <div className="mt-2 space-y-1">
        {items.map((item) => {
          const content = (
            <div
              className={`flex items-center gap-2.5 py-1.5 px-2 rounded-md text-[13px] transition-colors ${
                item.done
                  ? "text-muted"
                  : item.href
                    ? "text-earth hover:bg-warm/50 cursor-pointer"
                    : "text-earth"
              }`}
            >
              {item.done ? (
                <CheckCircle2 size={15} className="text-success shrink-0" />
              ) : (
                <Circle size={15} className="text-sand shrink-0" />
              )}
              <span className={item.done ? "line-through" : ""}>{item.label}</span>
              {!item.done && item.href && (
                <ArrowRight size={13} className="text-clay ml-auto shrink-0" />
              )}
            </div>
          );

          if (!item.done && item.href) {
            return (
              <Link key={item.label} href={item.href}>
                {content}
              </Link>
            );
          }
          return <div key={item.label}>{content}</div>;
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard page                                                    */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { setTopbar } = useTopbar();
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [showTour, setShowTour] = useState(false);
  const [tourChecked, setTourChecked] = useState(false);
  const [projectTasks, setProjectTasks] = useState<Record<string, TaskData[]>>({});
  const [projectPunchList, setProjectPunchList] = useState<Record<string, PunchListItemData[]>>({});
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);

  // Load saved analyses
  useEffect(() => {
    if (!user?.uid) return;
    getUserAnalyses(user.uid).then((a) => setSavedAnalyses(a.slice(0, 3))).catch(() => {});
  }, [user?.uid]);

  // Check if onboarding tour should be shown
  useEffect(() => {
    if (!user) return;
    const checkTour = async () => {
      try {
        const tourRef = dbRef(db, `users/${user.uid}/profile/tourCompleted`);
        const snap = await dbGet(tourRef);
        if (!snap.exists()) {
          setShowTour(true);
        }
      } catch {
        // If check fails, skip the tour
      }
      setTourChecked(true);
    };
    checkTour();
  }, [user]);

  const handleTourComplete = async () => {
    setShowTour(false);
    if (user) {
      try {
        await dbSet(dbRef(db, `users/${user.uid}/profile/tourCompleted`), true);
      } catch {
        // Silently fail
      }
    }
  };

  // Subscribe to projects and auto-seed demo for new users
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserProjects(user.uid, async (data: ProjectData[]) => {
      setProjects(data);
      if (data.length === 0) {
        const profileRef = dbRef(db, `users/${user.uid}/profile/demoSeeded`);
        const snap = await dbGet(profileRef);
        if (!snap.exists()) {
          try {
            await seedDemoProject(user.uid);
            await dbSet(profileRef, true);
          } catch {
            // If seeding fails, do not block the user
          }
        }
      }
    });
    return unsubscribe;
  }, [user]);

  // Sort projects by priority: pinned first, then priority (1,2,3), then last updated
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const pa = a.priority ?? 999;
      const pb = b.priority ?? 999;
      if (pa !== pb) return pa - pb;
      const ua = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const ub = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return ub - ua;
    });
  }, [projects]);

  // Top 3 priority projects (active only)
  const priorityProjects = useMemo(() => {
    return sortedProjects.filter((p) => p.status === "ACTIVE").slice(0, 3);
  }, [sortedProjects]);

  // Subscribe to tasks and punch list for priority projects (for action items)
  useEffect(() => {
    if (!user || priorityProjects.length === 0) {
      setProjectTasks({});
      setProjectPunchList({});
      return;
    }

    const unsubs: (() => void)[] = [];
    const tasksCollected: Record<string, TaskData[]> = {};
    const punchCollected: Record<string, PunchListItemData[]> = {};

    for (const proj of priorityProjects) {
      const pid = proj.id;
      if (!pid) continue;

      unsubs.push(
        subscribeToTasks(user.uid, pid, (tasks) => {
          tasksCollected[pid] = tasks;
          setProjectTasks({ ...tasksCollected });
        })
      );
      unsubs.push(
        subscribeToPunchListItems(user.uid, pid, (items) => {
          punchCollected[pid] = items;
          setProjectPunchList({ ...punchCollected });
        })
      );
    }

    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [user, priorityProjects]);

  // Build action items from priority projects
  const actionItems = useMemo(() => {
    const items: ActionItem[] = [];

    for (const project of priorityProjects) {
      const pid = project.id ?? "";
      const pName = project.name;

      // Budget alerts
      if (project.totalBudget > 0 && project.totalSpent > project.totalBudget * 0.90) {
        items.push({
          id: `budget-${pid}`,
          projectId: pid,
          projectName: pName,
          description: `Budget is ${Math.round((project.totalSpent / project.totalBudget) * 100)}% spent`,
          urgency: project.totalSpent > project.totalBudget * 0.95 ? "red" : "yellow",
          href: `/project/${pid}/budget`,
          type: "budget",
        });
      }

      // In-progress tasks
      const tasks = projectTasks[pid] ?? [];
      const inProgress = tasks.filter((t) => t.status === "in-progress" && !t.done);
      for (const task of inProgress.slice(0, 2)) {
        items.push({
          id: `task-${pid}-${task.id}`,
          projectId: pid,
          projectName: pName,
          description: task.label,
          urgency: "blue",
          href: `/project/${pid}/overview${task.id ? `?task=${task.id}` : ""}`,
          type: "task",
        });
      }

      // Open punch list items (critical first)
      const punchItems = projectPunchList[pid] ?? [];
      const openPunch = punchItems
        .filter((p) => p.status === "open" || p.status === "in-progress")
        .sort((a, b) => {
          const order = { critical: 0, major: 1, minor: 2 };
          return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
        });
      for (const punch of openPunch.slice(0, 2)) {
        items.push({
          id: `punch-${pid}-${punch.id}`,
          projectId: pid,
          projectName: pName,
          description: punch.description,
          urgency: punch.severity === "critical" ? "red" : punch.severity === "major" ? "yellow" : "blue",
          href: `/project/${pid}/punch-list`,
          type: "punch",
        });
      }
    }

    // Sort by urgency
    const urgencyOrder = { red: 0, yellow: 1, blue: 2 };
    items.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
    return items.slice(0, 6);
  }, [priorityProjects, projectTasks, projectPunchList]);

  // Subscribe to recent activity across projects
  useEffect(() => {
    if (!user || projects.length === 0) {
      setActivities([]);
      return;
    }

    const unsubs: (() => void)[] = [];
    const allActivities: Map<string, ActivityItem> = new Map();

    function updateActivities() {
      const sorted = Array.from(allActivities.values()).sort((a, b) => {
        const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tb - ta;
      });
      setActivities(sorted.slice(0, 5));
    }

    const projectsToTrack = sortedProjects.slice(0, 5);

    for (const proj of projectsToTrack) {
      if (!proj.id) continue;
      const pid = proj.id;
      const pName = proj.name;

      unsubs.push(
        subscribeToDailyLogs(user.uid, pid, (logs) => {
          for (const [key] of allActivities) {
            if (key.startsWith(`log-${pid}-`)) allActivities.delete(key);
          }
          for (const log of logs.slice(0, 2)) {
            allActivities.set(`log-${pid}-${log.id}`, {
              id: `log-${pid}-${log.id}`,
              type: "daily-log",
              text: `Daily log: Day ${log.day}`,
              projectName: pName,
              projectId: pid,
              timestamp: log.createdAt || log.date,
              logDay: log.day,
            });
          }
          updateActivities();
        })
      );

      unsubs.push(
        subscribeToTasks(user.uid, pid, (tasks) => {
          for (const [key] of allActivities) {
            if (key.startsWith(`task-${pid}-`)) allActivities.delete(key);
          }
          const doneTasks = tasks.filter((t) => t.done);
          const sortedDone = [...doneTasks].sort((a, b) => {
            const da = a.completedAt ? new Date(a.completedAt).getTime() : 0;
            const db = b.completedAt ? new Date(b.completedAt).getTime() : 0;
            return db - da;
          });
          for (const task of sortedDone.slice(0, 2)) {
            allActivities.set(`task-${pid}-${task.id}`, {
              id: `task-${pid}-${task.id}`,
              type: "task-completed",
              text: `Task completed: ${task.label}`,
              projectName: pName,
              projectId: pid,
              timestamp: task.completedAt || task.reviewedAt || "",
            });
          }
          updateActivities();
        })
      );

      unsubs.push(
        subscribeToPhotos(user.uid, pid, (photos) => {
          for (const [key] of allActivities) {
            if (key.startsWith(`photo-${pid}-`)) allActivities.delete(key);
          }
          const sorted = [...photos].sort((a, b) => {
            const da = a.date ? new Date(a.date).getTime() : 0;
            const dbb = b.date ? new Date(b.date).getTime() : 0;
            return dbb - da;
          });
          for (const photo of sorted.slice(0, 2)) {
            allActivities.set(`photo-${pid}-${photo.id}`, {
              id: `photo-${pid}-${photo.id}`,
              type: "photo-uploaded",
              text: `Photo uploaded${photo.phase ? `: ${photo.phase} phase` : ""}`,
              projectName: pName,
              projectId: pid,
              timestamp: photo.date || "",
            });
          }
          updateActivities();
        })
      );
    }

    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [user, projects, sortedProjects]);

  useEffect(() => {
    setTopbar(
      "Dashboard",
      `${projects.length} project${projects.length !== 1 ? "s" : ""}`,
      "success"
    );
  }, [setTopbar, projects.length]);

  // Aggregate stats
  const stats = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === "ACTIVE");
    const totalInvested = projects.reduce((sum, p) => sum + (p.totalSpent || 0), 0);
    const markets = new Set(projects.map((p) => p.market));
    const singleCurrency = markets.size <= 1;
    return { activeCount: activeProjects.length, totalInvested, singleCurrency };
  }, [projects]);

  const handlePriorityChange = useCallback(async (projectId: string, priority: number | null) => {
    if (!user) return;
    try {
      await updateProjectPriority(user.uid, projectId, priority);
    } catch {
      // Silently fail
    }
  }, [user]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    if (!user) return;
    try {
      await deleteProject(user.uid, projectId);
      showToast("Project deleted.", "success");
    } catch {
      showToast("Failed to delete project.", "error");
    }
  }, [user, showToast]);

  const userName = profile?.name ?? user?.displayName ?? "there";
  const firstName = getFirstName(userName);
  const hasProjects = projects.length > 0;

  // Plan limits for project count indicator
  const userPlan: PlanTier = (profile?.plan as PlanTier) ?? "FOUNDATION";
  const planLimits = getPlanLimits(userPlan);
  const realProjectCount = projects.filter((p: any) => !p.isDemo).length;
  const projectLimitReached = isFinite(planLimits.projects) && realProjectCount >= planLimits.projects;

  // Get primary currency from first project or default to USD
  const primaryCurrency = projects.length > 0
    ? getMarketData((projects[0]?.market as Market) ?? "USA").currency
    : USD_CONFIG;

  // Mentor tip based on highest priority project
  const mentorTip = useMemo(() => {
    return getMentorTip(priorityProjects[0] ?? null);
  }, [priorityProjects]);

  /* ================================================================ */
  /*  EMPTY STATE: no projects                                        */
  /* ================================================================ */

  if (!hasProjects) {
    const JOURNEY_PHASES = [
      { label: "Define", icon: Lightbulb },
      { label: "Finance", icon: DollarSign },
      { label: "Design", icon: ClipboardCheck },
      { label: "Build", icon: FolderOpen },
      { label: "Operate", icon: CheckCircle2 },
    ];

    return (
      <>
        {showTour && tourChecked && (
          <OnboardingTour onComplete={handleTourComplete} />
        )}

        <div className="animate-fade-in">
          {/* Hero greeting */}
          <div className="mb-8">
            <h1
              className="text-[28px] text-earth leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {getGreeting(t)}, {firstName}
            </h1>
            <p className="text-[13px] text-muted mt-1">{getFormattedDate()}</p>
          </div>

          {/* Journey progress teaser */}
          <div className="bg-surface border border-border rounded-2xl p-5 mb-6 shadow-[0_1px_3px_rgba(44,24,16,0.04)]">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-4">{t("dashboard.yourJourney")}</p>
            <div className="flex items-center justify-between gap-1">
              {JOURNEY_PHASES.map((phase, i) => {
                const Icon = phase.icon;
                return (
                  <div key={phase.label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        i === 0 ? "bg-clay/10 border-2 border-clay" : "bg-surface-alt border border-border"
                      }`}>
                        <Icon size={16} className={i === 0 ? "text-clay" : "text-muted/50"} />
                      </div>
                      <span className={`text-[10px] mt-1.5 font-medium ${
                        i === 0 ? "text-clay" : "text-muted/50"
                      }`}>{phase.label}</span>
                    </div>
                    {i < JOURNEY_PHASES.length - 1 && (
                      <div className="h-px flex-1 bg-border mx-1 mt-[-14px]" />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-muted mt-4 text-center">
              {t("dashboard.noProjects")}
            </p>
          </div>

          {/* Action cards — 2-column */}
          <SectionLabel>Get started</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 mb-6">
            {/* Learn */}
            <Link
              href="/learn"
              className="bg-surface border border-border rounded-2xl p-6 text-left card-hover group block shadow-[0_1px_3px_rgba(44,24,16,0.04)] relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <BookOpen size={22} className="text-emerald-600" />
                </div>
                <Badge variant="emerald">Recommended</Badge>
              </div>
              <div
                className="text-[17px] text-earth mb-1.5"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {t("dashboard.learnFundamentals")}
              </div>
              <p className="text-[12px] text-muted leading-relaxed mb-4">
                New to construction? Start here. Learn the basics of building, financing, and managing a project before you invest a dollar.
              </p>
              <div className="flex items-center gap-1.5 text-[12px] text-emerald-600 font-medium group-hover:gap-2.5 transition-all">
                {t("dashboard.getStarted")} <ArrowRight size={13} />
              </div>
            </Link>

            {/* Analyze a deal */}
            <Link
              href="/analyze"
              className="bg-surface border border-border rounded-2xl p-6 text-left card-hover group block shadow-[0_1px_3px_rgba(44,24,16,0.04)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-clay/10 flex items-center justify-center">
                  <TrendingUp size={22} className="text-clay" />
                </div>
              </div>
              <div
                className="text-[17px] text-earth mb-1.5"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Analyze a Deal
              </div>
              <p className="text-[12px] text-muted leading-relaxed mb-4">
                Run the numbers before you commit. Get a deal score, cost breakdown, risk analysis, and cross-market comparison.
              </p>
              <div className="flex items-center gap-1.5 text-[12px] text-clay font-medium group-hover:gap-2.5 transition-all">
                Open Deal Analyzer <ArrowRight size={13} />
              </div>
            </Link>

            {/* Start a project */}
            <Link
              href="/new-project"
              className="bg-surface border border-border rounded-2xl p-6 text-left card-hover group block shadow-[0_1px_3px_rgba(44,24,16,0.04)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-warm flex items-center justify-center">
                  <Plus size={22} className="text-clay" />
                </div>
              </div>
              <div
                className="text-[17px] text-earth mb-1.5"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {t("dashboard.startProject")}
              </div>
              <p className="text-[12px] text-muted leading-relaxed mb-4">
                Set up your first build with market-specific cost benchmarks, financial modeling, and a step-by-step project tracker.
              </p>
              <div className="flex items-center gap-1.5 text-[12px] text-clay font-medium group-hover:gap-2.5 transition-all">
                {t("project.newProject")} <ArrowRight size={13} />
              </div>
            </Link>
          </div>

          {/* Quick facts */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-[0_1px_3px_rgba(44,24,16,0.04)]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-warm flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb size={16} className="text-clay" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-earth mb-1">{t("dashboard.didYouKnow")}</p>
                <p className="text-[11px] text-muted leading-relaxed">
                  Keystone supports both U.S. and West African construction markets. Whether you are building with wood-frame in the States or reinforced concrete block in Togo, Ghana, or Benin, every tool adapts to your market, from cost benchmarks to inspection checklists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ================================================================ */
  /*  MAIN DASHBOARD: split left/right layout                         */
  /* ================================================================ */

  return (
    <>
      {showTour && tourChecked && (
        <OnboardingTour onComplete={handleTourComplete} />
      )}

      <div className="animate-fade-in flex flex-col lg:flex-row gap-0 min-h-0">

        {/* -------------------------------------------------------- */}
        {/*  LEFT SIDE (60%): Command Center                         */}
        {/* -------------------------------------------------------- */}
        <div className="flex-1 lg:w-[60%] lg:pr-6 lg:border-r lg:border-border/40">

          {/* Greeting bar */}
          <div className="mb-6">
            <h1
              className="text-[24px] text-earth leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {getGreeting(t)}, {firstName}
            </h1>
            <p className="text-[13px] text-muted mt-1">{getFormattedDate()}</p>
          </div>

          {/* Getting Started Checklist */}
          <GettingStartedChecklist projects={projects} />

          {/* Active Projects */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <SectionLabel>{t("dashboard.activeProjects")}</SectionLabel>
              <Badge variant="emerald" className="rounded-full ml-1">
                {stats.activeCount}
              </Badge>
            </div>

            <div className="space-y-3 animate-stagger">
              {priorityProjects.map((p) => {
                const marketData = getMarketData(p.market as Market);
                const keyMetric = getKeyMetric(p);
                const nextAction = getNextAction(p);

                return (
                  <Link
                    key={p.id}
                    href={`/project/${p.id}/overview`}
                    className="block bg-surface border border-border/60 rounded-2xl shadow-[0_1px_3px_rgba(44,24,16,0.04)] p-4 card-hover flex items-center gap-4"
                  >
                    {/* Left: progress ring */}
                    <div className="shrink-0">
                      <ProgressRing progress={p.progress} size={48} />
                    </div>

                    {/* Middle: project info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3
                          className="text-[16px] text-earth truncate"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {p.name}
                        </h3>
                        {p.isDemo && (
                          <Badge variant="info" className="rounded-full text-[9px]">[Demo]</Badge>
                        )}
                        <MarketBadge market={p.market as Market} />
                        <Badge
                          variant={p.currentPhase >= 5 ? "warning" : "info"}
                          className="rounded-full"
                        >
                          {p.phaseName}
                        </Badge>
                      </div>

                      {/* Key metric (only show when it's not default progress — the ring already shows that) */}
                      {keyMetric.label !== "Progress" && (
                        <div className="flex items-center gap-1.5 mb-1">
                          {keyMetric.variant === "danger" && <AlertTriangle size={12} className="text-danger shrink-0" />}
                          {keyMetric.variant === "warning" && <Clock size={12} className="text-warning shrink-0" />}
                          <span className={`font-data text-[13px] font-semibold ${
                            keyMetric.variant === "danger" ? "text-danger" :
                            keyMetric.variant === "warning" ? "text-warning" :
                            "text-earth"
                          }`}>
                            {keyMetric.value}
                          </span>
                          <span className="text-[11px] text-muted">{keyMetric.label}</span>
                        </div>
                      )}

                      {/* Budget bar */}
                      {p.totalBudget > 0 && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-20 h-1.5 bg-warm rounded-full overflow-hidden shrink-0">
                            <div
                              className={`h-full rounded-full ${
                                p.totalSpent / p.totalBudget > 0.90 ? "bg-danger"
                                : p.totalSpent / p.totalBudget > 0.70 ? "bg-warning"
                                : "bg-success"
                              }`}
                              style={{ width: `${Math.min(100, (p.totalSpent / p.totalBudget) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted font-data">
                            {formatCurrencyCompact(p.totalSpent, marketData.currency)}
                            {" / "}
                            {formatCurrencyCompact(p.totalBudget, marketData.currency)}
                          </span>
                        </div>
                      )}

                      {/* Next action */}
                      <span
                        className="text-[12px] text-clay hover:text-earth transition-colors leading-snug inline-flex items-center gap-1"
                      >
                        {nextAction.text}
                        <ArrowRight size={10} className="shrink-0" />
                      </span>
                    </div>

                    {/* Right: kebab menu + priority indicator */}
                    <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                      <PriorityIndicator priority={p.priority} />
                      <ProjectKebabMenu
                        project={p}
                        onSetPriority={(priority) => {
                          if (p.id) handlePriorityChange(p.id, priority);
                        }}
                        onDelete={() => {
                          if (p.id) handleDeleteProject(p.id);
                        }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>

            {projects.length > 3 && (
              <div className="mt-3">
                <Link
                  href="/vault"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-clay hover:text-earth transition-colors"
                >
                  View all {projects.length} projects
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Action Items */}
          <div className="mb-6">
            <SectionLabel>Needs Your Attention</SectionLabel>
            {actionItems.length === 0 ? (
              <Card className="mb-0">
                <div className="flex items-start gap-3 py-1">
                  <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] text-earth font-medium mb-1">
                      No urgent items right now.
                    </p>
                    <p className="text-[12px] text-muted leading-relaxed">
                      Consider updating your daily log, uploading progress photos, or reviewing your budget. Keeping records current makes every decision easier.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-1 animate-stagger">
                {actionItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-alt transition-colors"
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${urgencyDotColor(item.urgency)}`}
                    />
                    <div className="flex items-center gap-2 min-w-0 shrink-0">
                      {item.type === "budget" && <DollarSign size={13} className="text-muted shrink-0" />}
                      {item.type === "task" && <ListChecks size={13} className="text-muted shrink-0" />}
                      {item.type === "punch" && <AlertTriangle size={13} className="text-muted shrink-0" />}
                      {item.type === "inspection" && <ClipboardCheck size={13} className="text-muted shrink-0" />}
                      {item.type === "milestone" && <Calendar size={13} className="text-muted shrink-0" />}
                    </div>
                    <span className="text-[10px] text-clay font-medium shrink-0">
                      {item.projectName}
                    </span>
                    <p className="text-[12px] text-earth leading-snug truncate flex-1">
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* AI Mentor Tip */}
          <div className="mb-6">
            <Card padding="sm" className="bg-warm/20 border-sand/40">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-warm flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb size={16} className="text-clay" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-clay/60 font-semibold mb-1">
                    Mentor Tip
                  </p>
                  <p className="text-[13px] text-earth leading-relaxed">
                    {mentorTip}
                  </p>
                </div>
              </div>
            </Card>
          </div>

        </div>

        {/* -------------------------------------------------------- */}
        {/*  RIGHT SIDE (40%): Quick access panel                    */}
        {/* -------------------------------------------------------- */}
        <div className="lg:w-[40%] lg:pl-6 bg-surface-alt/30 lg:bg-transparent rounded-xl lg:rounded-none p-4 lg:p-0">

          {/* Portfolio Folder */}
          <div className="mb-6">
            <Link
              href="/vault"
              className="block bg-surface border border-border/60 rounded-2xl shadow-[0_1px_3px_rgba(44,24,16,0.04)] p-5 card-hover"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center">
                  <FolderOpen size={22} className="text-clay" />
                </div>
                <div>
                  <h2
                    className="text-[16px] text-earth"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    My Portfolio
                  </h2>
                  <p className="text-[12px] text-muted">
                    <span className="font-data font-semibold">{projects.length}</span>
                    {" "}project{projects.length !== 1 ? "s" : ""}
                    {isFinite(planLimits.projects) && (
                      <span className={`font-data text-[11px] ml-1 ${projectLimitReached ? "text-warning font-medium" : "text-muted/60"}`}>
                        ({realProjectCount}/{planLimits.projects})
                      </span>
                    )}
                    {stats.totalInvested > 0 && stats.singleCurrency && (
                      <>
                        {" / "}
                        <span className="font-data font-semibold">
                          {formatCurrencyCompact(stats.totalInvested, primaryCurrency)}
                        </span>
                        {" "}invested
                      </>
                    )}
                  </p>
                </div>
                <ArrowRight size={16} className="text-muted ml-auto" />
              </div>

              {/* Mini project thumbnails */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
                {sortedProjects.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 text-[11px] text-muted"
                    title={p.name}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${marketDotColor(p.market)}`} />
                    <span className="truncate max-w-[140px]">{p.name}</span>
                  </div>
                ))}
                {sortedProjects.length > 8 && (
                  <span className="text-[11px] text-muted">
                    +{sortedProjects.length - 8} more
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <SectionLabel>Quick Actions</SectionLabel>
            <div className="space-y-2 animate-stagger">
              <Link
                href={projectLimitReached ? "/settings" : "/new-project"}
                className="flex items-center gap-3 bg-surface border border-border/60 rounded-2xl px-4 py-3 card-hover"
              >
                <div className="w-9 h-9 rounded-full bg-warm flex items-center justify-center shrink-0">
                  {projectLimitReached ? <Lock size={18} className="text-muted" /> : <Plus size={18} className="text-clay" />}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-earth">New Project</div>
                  {projectLimitReached ? (
                    <div className="text-[11px] text-warning">Upgrade to add more projects</div>
                  ) : (
                    <div className="text-[11px] text-muted">Start a new build from scratch</div>
                  )}
                </div>
              </Link>

              <Link
                href="/analyze"
                className="flex items-center gap-3 bg-surface border border-border/60 rounded-2xl px-4 py-3 card-hover"
              >
                <div className="w-9 h-9 rounded-full bg-warm flex items-center justify-center shrink-0">
                  <TrendingUp size={18} className="text-clay" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-earth">Deal Analyzer</div>
                  <div className="text-[11px] text-muted">Evaluate costs, score, and risks before you build</div>
                </div>
              </Link>

              <Link
                href="/learn"
                className="flex items-center gap-3 bg-surface border border-border/60 rounded-2xl px-4 py-3 card-hover"
              >
                <div className="w-9 h-9 rounded-full bg-warm flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-clay" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-earth">Learn</div>
                  <div className="text-[11px] text-muted">Construction knowledge base</div>
                </div>
              </Link>

              <Link
                href="/vault?view=exports"
                className="flex items-center gap-3 bg-surface border border-border/60 rounded-2xl px-4 py-3 card-hover"
              >
                <div className="w-9 h-9 rounded-full bg-warm flex items-center justify-center shrink-0">
                  <Download size={18} className="text-clay" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-earth">Export Reports</div>
                  <div className="text-[11px] text-muted">Download project summaries</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Saved Analyses */}
          {savedAnalyses.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <SectionLabel>Recent Analyses</SectionLabel>
                <Link href="/analyze" className="text-[11px] text-clay hover:underline">View all</Link>
              </div>
              <div className="space-y-2">
                {savedAnalyses.map((analysis) => (
                  <Link
                    key={analysis.id}
                    href="/analyze"
                    className="flex items-center gap-3 bg-surface border border-border/60 rounded-2xl px-4 py-3 card-hover"
                  >
                    <div className="w-9 h-9 rounded-full bg-clay/10 flex items-center justify-center shrink-0">
                      <Calculator size={16} className="text-clay" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-earth truncate">{analysis.name}</div>
                      <div className="text-[11px] text-muted">
                        Score: <span className={`font-data font-semibold ${
                          (analysis.results?.dealScore ?? 0) >= 65 ? "text-success" : (analysis.results?.dealScore ?? 0) >= 50 ? "text-warning" : "text-danger"
                        }`}>{analysis.results?.dealScore ?? "N/A"}</span>
                        <span className="mx-1">-</span>
                        {analysis.input?.market} / {analysis.input?.city || "No location"}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-muted shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div>
            <SectionLabel>Recent Activity</SectionLabel>
            {activities.length === 0 ? (
              <p className="text-[12px] text-muted text-center py-4">
                No recent activity across your projects.
              </p>
            ) : (
              <div className="space-y-0.5 animate-stagger">
                {activities.map((activity) => (
                  <Link
                    key={activity.id}
                    href={
                      activity.type === "daily-log"
                        ? `/project/${activity.projectId}/daily-log${activity.logDay ? `?day=${activity.logDay}` : ""}`
                        : activity.type === "photo-uploaded"
                        ? `/project/${activity.projectId}/photos`
                        : `/project/${activity.projectId}/overview`
                    }
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface-alt/60 transition-colors"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${activityDotColor(activity.type)}`}
                    />
                    <p className="text-[12px] text-earth leading-snug truncate flex-1">
                      {activity.text}
                    </p>
                    {activity.timestamp && (
                      <span className="text-[10px] font-data text-muted/60 shrink-0">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
