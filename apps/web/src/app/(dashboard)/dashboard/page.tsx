"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useTopbar, useDashboard } from "../layout";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  subscribeToUserProjects,
  subscribeToDailyLogs,
  subscribeToBudgetItems,
  subscribeToTasks,
  subscribeToPhotos,
  type ProjectData,
  type DailyLogData,
  type BudgetItemData,
  type TaskData,
  type PhotoData,
} from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MarketBadge } from "@/components/ui/MarketBadge";
import { getMarketData, formatCurrencyCompact } from "@keystone/market-data";
import type { Market } from "@keystone/market-data";
import {
  FileText,
  Camera,
  BookOpen,
  PlusCircle,
  ClipboardList,
  CheckCircle,
  DollarSign,
  ImageIcon,
  Clock,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "daily-log" | "budget-update" | "task-completed" | "photo-uploaded";
  text: string;
  projectName: string;
  projectId: string;
  timestamp: string;
}

export default function DashboardPage() {
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Subscribe to projects
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserProjects(user.uid, (data) => {
      setProjects(data);
    });
    return unsubscribe;
  }, [user]);

  // Subscribe to recent activity across all projects
  useEffect(() => {
    if (projects.length === 0) {
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

    for (const proj of projects) {
      if (!proj.id) continue;
      const pid = proj.id;
      const pName = proj.name;

      // Daily logs
      unsubs.push(
        subscribeToDailyLogs(pid, (logs) => {
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
        subscribeToTasks(pid, (tasks) => {
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
        subscribeToPhotos(pid, (photos) => {
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
  }, [projects]);

  useEffect(() => {
    setTopbar("Dashboard", `${projects.length} project${projects.length !== 1 ? "s" : ""}`, "success");
  }, [setTopbar, projects.length]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (projects.length === 0) return null;
    const totalBudget = projects.reduce((sum, p) => sum + (p.totalBudget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.totalSpent || 0), 0);
    const avgProgress = Math.round(
      projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length
    );
    return { totalBudget, totalSpent, avgProgress };
  }, [projects]);

  // Most recent project for quick actions
  const mostRecentProject = projects.length > 0
    ? projects.reduce((latest, p) => {
        const la = latest.updatedAt ? new Date(latest.updatedAt).getTime() : 0;
        const pa = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
        return pa > la ? p : latest;
      })
    : null;

  const activityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "daily-log":
        return <ClipboardList size={13} className="text-info shrink-0" />;
      case "budget-update":
        return <DollarSign size={13} className="text-warning shrink-0" />;
      case "task-completed":
        return <CheckCircle size={13} className="text-success shrink-0" />;
      case "photo-uploaded":
        return <ImageIcon size={13} className="text-clay shrink-0" />;
    }
  };

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
    return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <>
      {/* Aggregate stats */}
      {stats && projects.length > 0 && (
        <>
          <SectionLabel>Portfolio summary</SectionLabel>
          <div className="grid grid-cols-3 gap-2 mb-5">
            <StatCard
              value={String(projects.length)}
              label="Projects"
            />
            <StatCard
              value={`$${Math.round(stats.totalBudget / 1000)}k`}
              label="Total budget"
            />
            <StatCard
              value={`${stats.avgProgress}%`}
              label="Avg progress"
            />
          </div>
        </>
      )}

      <SectionLabel>Your projects</SectionLabel>
      {projects.length === 0 ? (
        <div className="bg-surface border border-border rounded-[var(--radius)] p-8 text-center mb-5">
          <p className="text-[14px] text-earth font-medium mb-1">No projects yet</p>
          <p className="text-[12px] text-muted mb-4">Create your first project to get started.</p>
          <Link
            href="/new-project"
            className="inline-flex px-5 py-2 text-[13px] font-medium rounded-[var(--radius)] bg-earth text-warm hover:bg-earth-light transition-colors"
          >
            New project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          {projects.map((p) => {
            const marketData = getMarketData(p.market as Market);
            return (
              <Link
                key={p.id}
                href={`/project/${p.id}/overview`}
                className="bg-surface border border-border rounded-[var(--radius)] p-4 cursor-pointer hover:shadow-[var(--shadow-md)] transition-shadow block"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[14px] font-semibold text-earth">{p.name}</h4>
                    <MarketBadge market={p.market as Market} />
                  </div>
                  <Badge variant={p.currentPhase >= 5 ? "warning" : "info"}>
                    {p.phaseName}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted mb-3">{p.details}</p>
                <div className="mb-1.5">
                  <div className="flex justify-between text-[9px] text-muted mb-1">
                    <span>Overall progress</span>
                    <span className="font-data">{p.progress}%</span>
                  </div>
                  <ProgressBar
                    value={p.progress}
                    color={p.currentPhase >= 5 ? "var(--color-success)" : "var(--color-info)"}
                  />
                </div>
                <div className="flex gap-3 mt-3 text-[9px] text-muted">
                  <span>Budget: {formatCurrencyCompact(p.totalBudget, marketData.currency)}</span>
                  <span>Spent: {formatCurrencyCompact(p.totalSpent, marketData.currency)}</span>
                  <span>Wk {p.currentWeek}/{p.totalWeeks}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <SectionLabel>Quick actions</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <Link href="/new-project" className="bg-surface border border-border rounded-[var(--radius)] p-3 text-left hover:border-earth hover:shadow-[var(--shadow-sm)] transition-all group block">
          <PlusCircle size={16} className="text-muted group-hover:text-earth transition-colors mb-1" />
          <div className="text-[12px] font-medium text-earth group-hover:text-earth transition-colors">New project</div>
          <div className="text-[9px] text-muted mt-0.5">Start a new build</div>
        </Link>
        <Link href="/learn" className="bg-surface border border-border rounded-[var(--radius)] p-3 text-left hover:border-earth hover:shadow-[var(--shadow-sm)] transition-all group block">
          <BookOpen size={16} className="text-muted group-hover:text-earth transition-colors mb-1" />
          <div className="text-[12px] font-medium text-earth group-hover:text-earth transition-colors">Learn</div>
          <div className="text-[9px] text-muted mt-0.5">Construction knowledge</div>
        </Link>
        {mostRecentProject && mostRecentProject.id && (
          <>
            <Link
              href={`/project/${mostRecentProject.id}/daily-log`}
              className="bg-surface border border-border rounded-[var(--radius)] p-3 text-left hover:border-earth hover:shadow-[var(--shadow-sm)] transition-all group block"
            >
              <ClipboardList size={16} className="text-muted group-hover:text-earth transition-colors mb-1" />
              <div className="text-[12px] font-medium text-earth group-hover:text-earth transition-colors">Add daily log</div>
              <div className="text-[9px] text-muted mt-0.5">{mostRecentProject.name}</div>
            </Link>
            <Link
              href={`/project/${mostRecentProject.id}/photos`}
              className="bg-surface border border-border rounded-[var(--radius)] p-3 text-left hover:border-earth hover:shadow-[var(--shadow-sm)] transition-all group block"
            >
              <Camera size={16} className="text-muted group-hover:text-earth transition-colors mb-1" />
              <div className="text-[12px] font-medium text-earth group-hover:text-earth transition-colors">Upload photo</div>
              <div className="text-[9px] text-muted mt-0.5">{mostRecentProject.name}</div>
            </Link>
          </>
        )}
      </div>

      {/* Real activity feed */}
      <SectionLabel>Recent activity</SectionLabel>
      {projects.length === 0 ? (
        <Card>
          <p className="text-[12px] text-muted text-center py-4">
            Create a project to start tracking activity.
          </p>
        </Card>
      ) : activities.length === 0 ? (
        <Card>
          <div className="text-center py-4">
            <Clock size={20} className="text-muted mx-auto mb-2" />
            <p className="text-[12px] text-muted">
              No recent activity yet. Add daily logs, complete tasks, or upload photos to see updates here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-1.5">
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
              className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-surface border border-border hover:border-earth hover:shadow-[var(--shadow-sm)] transition-all block"
            >
              {activityIcon(activity.type)}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-earth leading-snug">{activity.text}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-muted">{activity.projectName}</span>
                  {activity.timestamp && (
                    <span className="text-[9px] font-data text-muted">
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
