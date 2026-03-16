"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTopbar, useDashboard } from "../layout";
import { useAuth } from "@/components/auth/AuthProvider";
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
  type ProjectData,
  type TaskData,
  type PunchListItemData,
} from "@/lib/services/project-service";
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
  Sun,
  Sunset,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ListChecks,
  DollarSign,
  Calendar,
  ClipboardCheck,
} from "lucide-react";

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
/*  Priority selector                                                 */
/* ------------------------------------------------------------------ */

function PrioritySelector({
  priority,
  onChange,
}: {
  priority: number | undefined;
  onChange: (p: number | null) => void;
}) {
  const levels = [1, 2, 3] as const;
  const labels: Record<number, string> = { 1: "High", 2: "Medium", 3: "Low" };
  const colors: Record<number, string> = {
    1: "bg-danger text-white",
    2: "bg-warning text-white",
    3: "bg-blue-500 text-white",
  };
  const inactiveColors: Record<number, string> = {
    1: "bg-danger/10 text-danger hover:bg-danger/20",
    2: "bg-warning/10 text-warning hover:bg-warning/20",
    3: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  };

  return (
    <div className="flex items-center gap-1">
      {levels.map((level) => (
        <button
          key={level}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange(priority === level ? null : level);
          }}
          className={`
            text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-colors
            ${priority === level ? colors[level] : inactiveColors[level]}
          `}
          title={`Priority: ${labels[level]}`}
        >
          {level}
        </button>
      ))}
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
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
    case "blue": return "bg-blue-500";
  }
}

function activityDotColor(type: ActivityItem["type"]): string {
  switch (type) {
    case "task-completed": return "bg-emerald-500";
    case "daily-log": return "bg-blue-500";
    case "photo-uploaded": return "bg-amber-500";
  }
}

/* ------------------------------------------------------------------ */
/*  Key metric for a project                                          */
/* ------------------------------------------------------------------ */

function getKeyMetric(project: ProjectData): { label: string; value: string; variant: "danger" | "warning" | "info" | "success" } {
  // Budget overrun
  if (project.totalBudget > 0 && project.totalSpent > project.totalBudget * 0.95) {
    const overPct = Math.round(((project.totalSpent - project.totalBudget) / project.totalBudget) * 100);
    if (overPct > 0) {
      return { label: "Over budget", value: `+${overPct}%`, variant: "danger" };
    }
    return { label: "Budget at limit", value: "95%+ spent", variant: "danger" };
  }

  // Behind schedule
  if (project.totalWeeks > 0 && project.currentWeek > 0) {
    const expectedProgress = (project.currentWeek / project.totalWeeks) * 100;
    const behind = expectedProgress - project.progress;
    if (behind > 15) {
      const weeksBehind = Math.round((behind / 100) * project.totalWeeks);
      return { label: "Behind schedule", value: `${weeksBehind}w behind`, variant: "warning" };
    }
  }

  // Open items
  if (project.openItems > 5) {
    return { label: "Open items", value: String(project.openItems), variant: "warning" };
  }

  // Default: progress
  return { label: "Progress", value: `${project.progress}%`, variant: "success" };
}

/* ------------------------------------------------------------------ */
/*  Next action suggestion                                            */
/* ------------------------------------------------------------------ */

function getNextAction(project: ProjectData): string {
  if (project.currentPhase === 0) return "Define your project scope and requirements";
  if (project.currentPhase === 1) return "Secure financing and set your budget";
  if (project.currentPhase === 2) return "Complete land acquisition and title verification";
  if (project.currentPhase === 3) return "Finalize architectural plans and specifications";
  if (project.currentPhase === 4) return "Submit permit applications and get approvals";
  if (project.currentPhase === 5) return "Hire contractors and assemble your build team";
  if (project.currentPhase === 6) {
    if (project.progress < 30) return "Foundation and framing in progress";
    if (project.progress < 50) return "Schedule rough-in inspections";
    if (project.progress < 70) return "Complete mechanical systems and insulation";
    if (project.progress < 90) return "Interior and exterior finishes underway";
    return "Prepare for final inspection and walkthrough";
  }
  if (project.currentPhase === 7) return "Complete final inspections and punch list";
  if (project.currentPhase === 8) return "Manage property operations and maintenance";
  return "Review project status";
}

/* ------------------------------------------------------------------ */
/*  Dashboard page                                                    */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { setTopbar } = useTopbar();
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [showTour, setShowTour] = useState(false);
  const [tourChecked, setTourChecked] = useState(false);
  const [projectTasks, setProjectTasks] = useState<Record<string, TaskData[]>>({});
  const [projectPunchList, setProjectPunchList] = useState<Record<string, PunchListItemData[]>>({});

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

  // Top 3 priority projects
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
          href: `/project/${pid}/overview`,
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
    return items.slice(0, 8);
  }, [priorityProjects, projectTasks, projectPunchList]);

  // Subscribe to recent activity across all projects
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

    // Only subscribe to activity for priority projects to keep it lightweight
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
              text: `Daily log: Day ${log.day} -- ${log.weather}`,
              projectName: pName,
              projectId: pid,
              timestamp: log.createdAt || log.date,
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
          for (const task of doneTasks.slice(-2)) {
            allActivities.set(`task-${pid}-${task.id}`, {
              id: `task-${pid}-${task.id}`,
              type: "task-completed",
              text: `Task completed: ${task.label}`,
              projectName: pName,
              projectId: pid,
              timestamp: "",
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
    const openItems = projects.reduce((sum, p) => sum + (p.openItems || 0), 0);
    return { activeCount: activeProjects.length, totalInvested, openItems };
  }, [projects]);

  const handlePriorityChange = useCallback(async (projectId: string, priority: number | null) => {
    if (!user) return;
    try {
      await updateProjectPriority(user.uid, projectId, priority);
    } catch {
      // Silently fail
    }
  }, [user]);

  const userName = profile?.name ?? user?.displayName ?? "there";
  const firstName = getFirstName(userName);
  const hasProjects = projects.length > 0;

  // Get primary currency from first project or default to USD
  const primaryCurrency = projects.length > 0
    ? getMarketData((projects[0]?.market as Market) ?? "USA").currency
    : USD_CONFIG;

  return (
    <>
      {/* Onboarding tour */}
      {showTour && tourChecked && (
        <OnboardingTour onComplete={handleTourComplete} />
      )}

      {/* Greeting + Quick Stats */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1
              className="text-[26px] text-earth leading-tight flex items-center gap-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {new Date().getHours() < 17 ? <Sun size={22} className="text-clay" /> : <Sunset size={22} className="text-clay" />}
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-[13px] text-muted mt-1">{getFormattedDate()}</p>
          </div>
        </div>

        {/* Mini stat cards */}
        {hasProjects && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gradient-to-br from-surface to-surface-alt/30 border border-border rounded-xl p-3 text-center">
              <div className="font-data text-xl font-semibold text-earth tabular-nums">
                {stats.activeCount}
              </div>
              <div className="text-[10px] text-muted uppercase tracking-[0.12em] mt-0.5 font-medium">
                Active projects
              </div>
            </div>
            <div className="bg-gradient-to-br from-surface to-surface-alt/30 border border-border rounded-xl p-3 text-center">
              <div className="font-data text-xl font-semibold text-earth tabular-nums">
                {formatCurrencyCompact(stats.totalInvested, primaryCurrency)}
              </div>
              <div className="text-[10px] text-muted uppercase tracking-[0.12em] mt-0.5 font-medium">
                Total invested
              </div>
            </div>
            <div className="bg-gradient-to-br from-surface to-surface-alt/30 border border-border rounded-xl p-3 text-center">
              <div className="font-data text-xl font-semibold text-earth tabular-nums">
                {stats.openItems}
              </div>
              <div className="text-[10px] text-muted uppercase tracking-[0.12em] mt-0.5 font-medium">
                Open items
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {!hasProjects ? (
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
          <KeystoneHouseIllustration />
          <h2
            className="text-[24px] text-earth mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Your first project starts here
          </h2>
          <p className="text-[14px] text-muted mb-6 leading-relaxed">
            Keystone guides you through every phase of building, from initial
            planning to moving in.
          </p>
          <Link
            href="/new-project"
            className="inline-flex items-center gap-2 py-4 px-8 text-[15px] font-medium rounded-xl bg-earth text-warm hover:bg-earth-light transition-colors"
          >
            Create your first project
          </Link>
          <p className="text-[13px] text-muted mt-4">
            Or{" "}
            <Link href="/learn" className="text-clay hover:underline">
              explore the Learn section first
            </Link>
          </p>
        </div>
      ) : (
        <>
          {/* Section 1: Priority Projects (max 3) */}
          <SectionLabel>Priority projects</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 animate-stagger">
            {priorityProjects.map((p) => {
              const marketData = getMarketData(p.market as Market);
              const isWestAfrica = ["TOGO", "GHANA", "BENIN"].includes(p.market);
              const topBorderColor = isWestAfrica
                ? "border-t-[var(--color-accent-wa)]"
                : "border-t-[var(--color-accent-usa)]";
              const keyMetric = getKeyMetric(p);
              const nextAction = getNextAction(p);

              return (
                <div
                  key={p.id}
                  className={`bg-surface rounded-xl shadow-[var(--shadow-sm)] p-5 border border-border border-t-[3px] ${topBorderColor} card-hover flex flex-col`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h3
                        className="text-[15px] text-earth truncate"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {p.name}
                      </h3>
                      <MarketBadge market={p.market as Market} />
                    </div>
                    <Badge
                      variant={p.currentPhase >= 5 ? "warning" : "info"}
                      className="rounded-full shrink-0 ml-2"
                    >
                      {p.phaseName}
                    </Badge>
                  </div>

                  {/* Priority selector */}
                  <div className="mb-3">
                    <PrioritySelector
                      priority={p.priority}
                      onChange={(priority) => {
                        if (p.id) handlePriorityChange(p.id, priority);
                      }}
                    />
                  </div>

                  {/* Progress ring + key metric */}
                  <div className="flex items-center gap-4 mb-3">
                    <ProgressRing progress={p.progress} size={48} />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        {keyMetric.variant === "danger" && <AlertTriangle size={12} className="text-danger" />}
                        {keyMetric.variant === "warning" && <Clock size={12} className="text-warning" />}
                        {keyMetric.variant === "success" && <CheckCircle2 size={12} className="text-success" />}
                        <span className="text-[11px] text-muted">{keyMetric.label}</span>
                      </div>
                      <span className={`font-data text-[16px] font-semibold ${
                        keyMetric.variant === "danger" ? "text-danger" :
                        keyMetric.variant === "warning" ? "text-warning" :
                        "text-earth"
                      }`}>
                        {keyMetric.value}
                      </span>
                      <div className="text-[11px] text-muted mt-1">
                        Budget: {formatCurrencyCompact(p.totalBudget, marketData.currency)}
                      </div>
                    </div>
                  </div>

                  {/* Next action */}
                  <div className="bg-warm/30 rounded-lg px-3 py-2 mb-3 flex-1">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-clay/60 font-medium mb-0.5">
                      Next action
                    </p>
                    <p className="text-[12px] text-earth leading-snug">
                      {nextAction}
                    </p>
                  </div>

                  {/* View project link */}
                  <Link
                    href={`/project/${p.id}/overview`}
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-clay hover:text-earth transition-colors self-end"
                  >
                    View project
                    <ArrowRight size={12} />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* View all projects link */}
          {projects.length > 3 && (
            <div className="flex justify-center mb-6">
              <Link
                href="/vault"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-clay hover:text-earth transition-colors"
              >
                View all {projects.length} projects
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Section 2: Action Items */}
          <SectionLabel>Action items</SectionLabel>
          {actionItems.length === 0 ? (
            <Card className="mb-6">
              <div className="flex items-center gap-3 py-2">
                <CheckCircle2 size={18} className="text-success" />
                <p className="text-[13px] text-muted">
                  No urgent action items. Your projects are on track.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-1 mb-6 animate-stagger">
              {actionItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-alt transition-colors"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${urgencyDotColor(item.urgency)}`}
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    {item.type === "budget" && <DollarSign size={13} className="text-muted shrink-0" />}
                    {item.type === "task" && <ListChecks size={13} className="text-muted shrink-0" />}
                    {item.type === "punch" && <AlertTriangle size={13} className="text-muted shrink-0" />}
                    {item.type === "inspection" && <ClipboardCheck size={13} className="text-muted shrink-0" />}
                    {item.type === "milestone" && <Calendar size={13} className="text-muted shrink-0" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-earth leading-snug truncate">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted shrink-0">
                    {item.projectName}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Section 3: Quick Actions */}
          <SectionLabel>Quick actions</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 animate-stagger">
            <Link
              href="/new-project"
              className="bg-surface border border-border rounded-xl p-4 text-left card-hover group block"
            >
              <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center mb-3">
                <Plus size={20} className="text-clay" />
              </div>
              <div className="text-[13px] font-semibold text-earth">New project</div>
              <div className="text-[11px] text-muted mt-0.5">Start a new build</div>
            </Link>

            <Link
              href="/deal-analyzer"
              className="bg-surface border border-border rounded-xl p-4 text-left card-hover group block"
            >
              <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center mb-3">
                <TrendingUp size={20} className="text-clay" />
              </div>
              <div className="text-[13px] font-semibold text-earth">Deal Analyzer</div>
              <div className="text-[11px] text-muted mt-0.5">Evaluate an opportunity</div>
            </Link>

            <Link
              href="/learn"
              className="bg-surface border border-border rounded-xl p-4 text-left card-hover group block"
            >
              <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center mb-3">
                <BookOpen size={20} className="text-clay" />
              </div>
              <div className="text-[13px] font-semibold text-earth">Learn</div>
              <div className="text-[11px] text-muted mt-0.5">Construction knowledge</div>
            </Link>

            <Link
              href="/vault"
              className="bg-surface border border-border rounded-xl p-4 text-left card-hover group block"
            >
              <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center mb-3">
                <FolderOpen size={20} className="text-clay" />
              </div>
              <div className="text-[13px] font-semibold text-earth">View Portfolio</div>
              <div className="text-[11px] text-muted mt-0.5">All your projects</div>
            </Link>
          </div>

          {/* Section 4: Activity Feed (compact) */}
          <SectionLabel>Recent activity</SectionLabel>
          {activities.length === 0 ? (
            <Card>
              <p className="text-[12px] text-muted text-center py-4">
                No recent activity across your projects.
              </p>
            </Card>
          ) : (
            <div className="space-y-0.5 animate-stagger">
              {activities.map((activity) => (
                <Link
                  key={activity.id}
                  href={
                    activity.type === "daily-log"
                      ? `/project/${activity.projectId}/daily-log`
                      : activity.type === "photo-uploaded"
                      ? `/project/${activity.projectId}/photos`
                      : `/project/${activity.projectId}/overview`
                  }
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-alt transition-colors"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${activityDotColor(activity.type)}`}
                  />
                  <p className="text-[12px] text-earth leading-snug truncate flex-1">
                    {activity.text}
                  </p>
                  <span className="text-[10px] text-muted shrink-0">
                    {activity.projectName}
                  </span>
                  {activity.timestamp && (
                    <span className="text-[10px] font-data text-muted/60 shrink-0">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
