"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useTopbar, useDashboard } from "../layout";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  subscribeToUserProjects,
  subscribeToDailyLogs,
  subscribeToTasks,
  subscribeToPhotos,
  type ProjectData,
  type DailyLogData,
  type TaskData,
  type PhotoData,
} from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { MarketBadge } from "@/components/ui/MarketBadge";
import { getMarketData, formatCurrencyCompact } from "@keystone/market-data";
import type { Market } from "@keystone/market-data";
import {
  Plus,
  BookOpen,
  ClipboardList,
  Camera,
  ArrowRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Circular progress ring                                            */
/* ------------------------------------------------------------------ */

function ProgressRing({ progress, size = 40 }: { progress: number; size?: number }) {
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
        className="fill-earth font-data text-[10px] font-medium"
        transform={`rotate(90, ${size / 2}, ${size / 2})`}
      >
        {progress}%
      </text>
    </svg>
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
      {/* Roof */}
      <path
        d="M60 10 L15 50 L105 50 Z"
        stroke="var(--color-clay)"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Keystone at the top */}
      <path
        d="M54 28 L60 18 L66 28 L64 32 L56 32 Z"
        stroke="var(--color-earth)"
        strokeWidth="1.5"
        fill="var(--color-sand)"
        strokeLinejoin="round"
      />
      {/* House body */}
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
      {/* Door */}
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
      {/* Door knob */}
      <circle cx="66" cy="78" r="1.5" fill="var(--color-clay)" />
      {/* Left window */}
      <rect
        x="32"
        y="58"
        width="12"
        height="12"
        stroke="var(--color-sand)"
        strokeWidth="1.5"
        fill="none"
        rx="1"
      />
      {/* Right window */}
      <rect
        x="76"
        y="58"
        width="12"
        height="12"
        stroke="var(--color-sand)"
        strokeWidth="1.5"
        fill="none"
        rx="1"
      />
      {/* Ground line */}
      <line
        x1="10"
        y1="90"
        x2="110"
        y2="90"
        stroke="var(--color-sand)"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
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
/*  Activity dot color                                                */
/* ------------------------------------------------------------------ */

function activityDotColor(type: ActivityItem["type"]): string {
  switch (type) {
    case "task-completed":
      return "bg-emerald-500";
    case "daily-log":
      return "bg-blue-500";
    case "photo-uploaded":
      return "bg-amber-500";
  }
}

/* ------------------------------------------------------------------ */
/*  Dashboard page                                                    */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { setTopbar } = useTopbar();
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Subscribe to projects
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserProjects(user.uid, (data: ProjectData[]) => {
      setProjects(data);
    });
    return unsubscribe;
  }, [user]);

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
      setActivities(sorted.slice(0, 8));
    }

    for (const proj of projects) {
      if (!proj.id) continue;
      const pid = proj.id;
      const pName = proj.name;

      // Daily logs
      unsubs.push(
        subscribeToDailyLogs(user.uid, pid, (logs) => {
          for (const [key] of allActivities) {
            if (key.startsWith(`log-${pid}-`)) allActivities.delete(key);
          }
          for (const log of logs.slice(0, 3)) {
            allActivities.set(`log-${pid}-${log.id}`, {
              id: `log-${pid}-${log.id}`,
              type: "daily-log",
              text: `Daily log added: Day ${log.day} - ${log.weather}`,
              projectName: pName,
              projectId: pid,
              timestamp: log.createdAt || log.date,
            });
          }
          updateActivities();
        })
      );

      // Tasks (completed ones)
      unsubs.push(
        subscribeToTasks(user.uid, pid, (tasks) => {
          for (const [key] of allActivities) {
            if (key.startsWith(`task-${pid}-`)) allActivities.delete(key);
          }
          const doneTasks = tasks.filter((t) => t.done);
          for (const task of doneTasks.slice(-3)) {
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

      // Photos
      unsubs.push(
        subscribeToPhotos(user.uid, pid, (photos) => {
          for (const [key] of allActivities) {
            if (key.startsWith(`photo-${pid}-`)) allActivities.delete(key);
          }
          const sorted = [...photos].sort((a, b) => {
            const da = a.date ? new Date(a.date).getTime() : 0;
            const db = b.date ? new Date(b.date).getTime() : 0;
            return db - da;
          });
          for (const photo of sorted.slice(0, 3)) {
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
  }, [user, projects]);

  useEffect(() => {
    setTopbar(
      "Dashboard",
      `${projects.length} project${projects.length !== 1 ? "s" : ""}`,
      "success"
    );
  }, [setTopbar, projects.length]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (projects.length === 0) return null;
    const totalBudget = projects.reduce((sum, p) => sum + (p.totalBudget || 0), 0);
    const avgProgress = Math.round(
      projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length
    );
    return { totalBudget, avgProgress };
  }, [projects]);

  // Most recent project for quick actions
  const mostRecentProject =
    projects.length > 0
      ? projects.reduce((latest, p) => {
          const la = latest.updatedAt ? new Date(latest.updatedAt).getTime() : 0;
          const pa = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
          return pa > la ? p : latest;
        })
      : null;

  const userName = profile?.name ?? user?.displayName ?? "there";
  const firstName = getFirstName(userName);
  const hasProjects = projects.length > 0;

  return (
    <>
      {/* ---- Greeting bar ---- */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            className="text-[24px] text-earth leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-[13px] text-muted mt-1">{getFormattedDate()}</p>
        </div>
        {hasProjects && (
          <div className="shrink-0 px-3 py-1.5 rounded-full bg-surface-alt text-[12px] font-medium text-earth">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ---- Portfolio summary ---- */}
      {stats && hasProjects && (
        <>
          <SectionLabel>Portfolio summary</SectionLabel>
          <div className="grid grid-cols-3 gap-2 mb-6">
            <StatCard value={String(projects.length)} label="Total projects" />
            <StatCard
              value={formatCurrencyCompact(stats.totalBudget, getMarketData("USA").currency)}
              label="Total invested"
            />
            <StatCard value={`${stats.avgProgress}%`} label="Average progress" />
          </div>
        </>
      )}

      {/* ---- Project cards or empty state ---- */}
      {!hasProjects ? (
        /* Empty state */
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
          <SectionLabel>Your projects</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {projects.map((p) => {
              const marketData = getMarketData(p.market as Market);
              const isWestAfrica = ["TOGO", "GHANA", "BENIN"].includes(p.market);
              const topBorderColor = isWestAfrica
                ? "border-t-[var(--color-accent-wa)]"
                : "border-t-[var(--color-accent-usa)]";

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-xl shadow-[var(--shadow-sm)] p-5 border border-border border-t-[3px] ${topBorderColor} card-hover`}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className="text-[16px] text-earth"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {p.name}
                      </h3>
                      <MarketBadge market={p.market as Market} />
                    </div>
                    <Badge
                      variant={p.currentPhase >= 5 ? "warning" : "info"}
                      className="rounded-full"
                    >
                      {p.phaseName}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-[12px] text-muted mb-4">{p.details}</p>

                  {/* Progress section */}
                  <div className="flex items-center gap-4 mb-4">
                    <ProgressRing progress={p.progress} size={40} />
                    <div className="flex flex-col gap-0.5 text-[11px] text-muted">
                      <span>
                        Budget:{" "}
                        <span className="font-data text-earth">
                          {formatCurrencyCompact(p.totalBudget, marketData.currency)}
                        </span>
                      </span>
                      <span>
                        Week:{" "}
                        <span className="font-data text-earth">
                          {p.currentWeek} of {p.totalWeeks}
                        </span>
                      </span>
                      <span>
                        Open items:{" "}
                        <span className="font-data text-earth">{p.openItems}</span>
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end">
                    <Link
                      href={`/project/${p.id}/overview`}
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-clay hover:text-earth transition-colors"
                    >
                      View project
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ---- Quick actions ---- */}
      <SectionLabel>Quick actions</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        <Link
          href="/new-project"
          className="bg-white border border-border rounded-xl p-4 text-left card-hover group block"
        >
          <div className="w-12 h-12 rounded-full bg-warm flex items-center justify-center mb-3">
            <Plus size={24} className="text-clay" />
          </div>
          <div className="text-[13px] font-semibold text-earth">New project</div>
          <div className="text-[11px] text-muted mt-0.5">Start a new build</div>
        </Link>

        <Link
          href="/learn"
          className="bg-white border border-border rounded-xl p-4 text-left card-hover group block"
        >
          <div className="w-12 h-12 rounded-full bg-warm flex items-center justify-center mb-3">
            <BookOpen size={24} className="text-clay" />
          </div>
          <div className="text-[13px] font-semibold text-earth">Learn</div>
          <div className="text-[11px] text-muted mt-0.5">
            Construction knowledge
          </div>
        </Link>

        {mostRecentProject && mostRecentProject.id && (
          <>
            <Link
              href={`/project/${mostRecentProject.id}/daily-log`}
              className="bg-white border border-border rounded-xl p-4 text-left card-hover group block"
            >
              <div className="w-12 h-12 rounded-full bg-warm flex items-center justify-center mb-3">
                <ClipboardList size={24} className="text-clay" />
              </div>
              <div className="text-[13px] font-semibold text-earth">
                Add daily log
              </div>
              <div className="text-[11px] text-muted mt-0.5">
                {mostRecentProject.name}
              </div>
            </Link>

            <Link
              href={`/project/${mostRecentProject.id}/photos`}
              className="bg-white border border-border rounded-xl p-4 text-left card-hover group block"
            >
              <div className="w-12 h-12 rounded-full bg-warm flex items-center justify-center mb-3">
                <Camera size={24} className="text-clay" />
              </div>
              <div className="text-[13px] font-semibold text-earth">
                Upload photo
              </div>
              <div className="text-[11px] text-muted mt-0.5">
                {mostRecentProject.name}
              </div>
            </Link>
          </>
        )}
      </div>

      {/* ---- Activity feed ---- */}
      <SectionLabel>Recent activity</SectionLabel>
      {!hasProjects ? (
        <Card>
          <p className="text-[12px] text-muted text-center py-4">
            No activity yet. Create a project to get started.
          </p>
        </Card>
      ) : activities.length === 0 ? (
        <Card>
          <p className="text-[12px] text-muted text-center py-4">
            No activity yet. Create a project to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-1">
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-alt transition-colors block"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${activityDotColor(activity.type)}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-earth leading-snug truncate">
                  {activity.text}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted">
                    {activity.projectName}
                  </span>
                  {activity.timestamp && (
                    <span className="text-[10px] font-data text-muted">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
