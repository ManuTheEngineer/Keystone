"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTopbar } from "../layout";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  subscribeToUserProjects,
  updateProjectPriority,
  updateProject,
  deleteProject,
  type ProjectData,
} from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { MarketBadge } from "@/components/ui/MarketBadge";
import { getMarketData, formatCurrencyCompact, USD_CONFIG } from "@keystone/market-data";
import type { Market } from "@keystone/market-data";
import {
  ArrowRight,
  Search,
  Filter,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  FolderOpen,
  TrendingUp,
  ArrowUpDown,
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
/*  Priority indicator                                                */
/* ------------------------------------------------------------------ */

function PriorityIndicator({ priority }: { priority: number | undefined }) {
  if (!priority) return null;
  const labels: Record<number, string> = { 1: "High", 2: "Med", 3: "Low" };
  const colors: Record<number, string> = {
    1: "bg-danger text-white",
    2: "bg-warning text-white",
    3: "bg-blue-500 text-white",
  };
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${colors[priority] ?? "bg-muted text-white"}`}>
      P{priority} {labels[priority] ?? ""}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Kebab menu                                                        */
/* ------------------------------------------------------------------ */

interface KebabMenuProps {
  project: ProjectData;
  onSetPriority: (priority: number | null) => void;
  onPause: () => void;
  onResume: () => void;
  onDelete: () => void;
}

function KebabMenu({ project, onSetPriority, onPause, onResume, onDelete }: KebabMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-1 rounded text-muted hover:text-earth hover:bg-warm transition-colors"
        aria-label="Project actions"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-[180px] bg-surface border border-border rounded-lg shadow-lg z-50 py-1">
            {/* Priority options */}
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-muted font-medium">
              Set priority
            </div>
            {[1, 2, 3].map((level) => {
              const labels: Record<number, string> = { 1: "High", 2: "Medium", 3: "Low" };
              const isActive = project.priority === level;
              return (
                <button
                  key={level}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetPriority(isActive ? null : level);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-warm/50 transition-colors flex items-center gap-2 ${isActive ? "text-earth font-medium" : "text-muted"}`}
                >
                  <span className={`w-2 h-2 rounded-full ${level === 1 ? "bg-danger" : level === 2 ? "bg-warning" : "bg-blue-500"}`} />
                  {labels[level]}
                  {isActive && <span className="ml-auto text-[10px] text-clay">(active)</span>}
                </button>
              );
            })}

            <div className="h-px bg-border my-1" />

            {/* Status actions */}
            {project.status === "ACTIVE" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPause();
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-[12px] text-muted hover:bg-warm/50 transition-colors flex items-center gap-2"
              >
                <Pause size={12} />
                Pause project
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onResume();
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-[12px] text-muted hover:bg-warm/50 transition-colors flex items-center gap-2"
              >
                <Play size={12} />
                Resume project
              </button>
            )}

            <div className="h-px bg-border my-1" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-[12px] text-danger hover:bg-danger/5 transition-colors flex items-center gap-2"
            >
              <Trash2 size={12} />
              Delete project
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter types                                                      */
/* ------------------------------------------------------------------ */

type StatusFilter = "all" | "ACTIVE" | "PAUSED" | "COMPLETED";
type MarketFilter = "all" | "USA" | "WA";
type SortOption = "priority" | "recent" | "progress";

/* ------------------------------------------------------------------ */
/*  Vault client                                                      */
/* ------------------------------------------------------------------ */

export function VaultClient() {
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("priority");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserProjects(user.uid, setProjects);
    return unsub;
  }, [user]);

  useEffect(() => {
    setTopbar("Portfolio", `${projects.length} project${projects.length !== 1 ? "s" : ""}`, "info");
  }, [setTopbar, projects.length]);

  // Aggregate portfolio stats
  const portfolioStats = useMemo(() => {
    const totalBudget = projects.reduce((sum, p) => sum + (p.totalBudget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.totalSpent || 0), 0);
    return { totalBudget, totalSpent };
  }, [projects]);

  // Filter and sort
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Market filter
    if (marketFilter === "USA") {
      result = result.filter((p) => p.market === "USA");
    } else if (marketFilter === "WA") {
      result = result.filter((p) => ["TOGO", "GHANA", "BENIN"].includes(p.market));
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.details?.toLowerCase().includes(q) ||
        p.market.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortOption === "priority") {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const pa = a.priority ?? 999;
        const pb = b.priority ?? 999;
        if (pa !== pb) return pa - pb;
        const ua = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const ub = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return ub - ua;
      }
      if (sortOption === "recent") {
        const ua = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const ub = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return ub - ua;
      }
      if (sortOption === "progress") {
        return (b.progress || 0) - (a.progress || 0);
      }
      return 0;
    });

    return result;
  }, [projects, statusFilter, marketFilter, sortOption, searchQuery]);

  const handleSetPriority = useCallback(async (projectId: string, priority: number | null) => {
    if (!user) return;
    try {
      await updateProjectPriority(user.uid, projectId, priority);
    } catch {
      // Silently fail
    }
  }, [user]);

  const handlePause = useCallback(async (projectId: string) => {
    if (!user) return;
    try {
      await updateProject(user.uid, projectId, { status: "PAUSED" });
    } catch {
      // Silently fail
    }
  }, [user]);

  const handleResume = useCallback(async (projectId: string) => {
    if (!user) return;
    try {
      await updateProject(user.uid, projectId, { status: "ACTIVE" });
    } catch {
      // Silently fail
    }
  }, [user]);

  const handleDelete = useCallback(async (projectId: string) => {
    if (!user) return;
    try {
      await deleteProject(user.uid, projectId);
    } catch {
      // Silently fail
    }
    setDeleteConfirm(null);
  }, [user]);

  const primaryCurrency = projects.length > 0
    ? getMarketData((projects[0]?.market as Market) ?? "USA").currency
    : USD_CONFIG;

  return (
    <div className="animate-fade-in">
      {/* Portfolio header */}
      <div className="mb-6">
        <h1
          className="text-[26px] text-earth mb-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Project Portfolio
        </h1>
        <div className="flex items-center gap-4 text-[12px] text-muted">
          <span>
            <span className="font-data text-earth">{projects.length}</span> total projects
          </span>
          <span>
            <span className="font-data text-earth">{formatCurrencyCompact(portfolioStats.totalBudget, primaryCurrency)}</span> total budget
          </span>
          <span>
            <span className="font-data text-earth">{formatCurrencyCompact(portfolioStats.totalSpent, primaryCurrency)}</span> total spent
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-[300px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border border-border bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-clay/40 transition-colors"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-0.5">
          {(["all", "ACTIVE", "PAUSED", "COMPLETED"] as StatusFilter[]).map((status) => {
            const labels: Record<StatusFilter, string> = { all: "All", ACTIVE: "Active", PAUSED: "Paused", COMPLETED: "Completed" };
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === status
                    ? "bg-earth text-warm font-medium"
                    : "text-muted hover:text-earth"
                }`}
              >
                {labels[status]}
              </button>
            );
          })}
        </div>

        {/* Market filter */}
        <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-0.5">
          {(["all", "USA", "WA"] as MarketFilter[]).map((market) => {
            const labels: Record<MarketFilter, string> = { all: "All", USA: "USA", WA: "West Africa" };
            return (
              <button
                key={market}
                onClick={() => setMarketFilter(market)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                  marketFilter === market
                    ? "bg-earth text-warm font-medium"
                    : "text-muted hover:text-earth"
                }`}
              >
                {labels[market]}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-0.5">
          <ArrowUpDown size={12} className="text-muted ml-2" />
          {(["priority", "recent", "progress"] as SortOption[]).map((sort) => {
            const labels: Record<SortOption, string> = { priority: "Priority", recent: "Recent", progress: "Progress" };
            return (
              <button
                key={sort}
                onClick={() => setSortOption(sort)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                  sortOption === sort
                    ? "bg-earth text-warm font-medium"
                    : "text-muted hover:text-earth"
                }`}
              >
                {labels[sort]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Project grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <FolderOpen size={48} className="text-muted/30 mb-4" />
          {projects.length === 0 ? (
            <>
              <h2
                className="text-[20px] text-earth mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Your portfolio is empty
              </h2>
              <p className="text-[13px] text-muted mb-6 max-w-sm leading-relaxed">
                Start with the Deal Analyzer to evaluate your first opportunity, or create a new project directly.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/deal-analyzer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium rounded-xl bg-earth text-warm hover:bg-earth-light transition-colors"
                >
                  <TrendingUp size={16} />
                  Deal Analyzer
                </Link>
                <Link
                  href="/new-project"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium rounded-xl border border-border text-earth hover:bg-warm transition-colors"
                >
                  New project
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2
                className="text-[18px] text-earth mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                No projects match your filters
              </h2>
              <p className="text-[13px] text-muted">
                Try adjusting your search or filter criteria.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-stagger">
          {filteredProjects.map((p) => {
            const marketData = getMarketData(p.market as Market);
            const isWestAfrica = ["TOGO", "GHANA", "BENIN"].includes(p.market);
            const topBorderColor = isWestAfrica
              ? "border-t-[var(--color-accent-wa)]"
              : "border-t-[var(--color-accent-usa)]";
            const isPaused = p.status === "PAUSED";
            const isCompleted = p.status === "COMPLETED";
            const lastActivity = p.updatedAt
              ? new Date(p.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "";

            return (
              <div
                key={p.id}
                className={`bg-surface rounded-xl shadow-[var(--shadow-sm)] p-5 border border-border border-t-[3px] ${topBorderColor} card-hover ${isPaused ? "opacity-70" : ""} ${isCompleted ? "opacity-80" : ""}`}
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
                  <KebabMenu
                    project={p}
                    onSetPriority={(priority) => {
                      if (p.id) handleSetPriority(p.id, priority);
                    }}
                    onPause={() => {
                      if (p.id) handlePause(p.id);
                    }}
                    onResume={() => {
                      if (p.id) handleResume(p.id);
                    }}
                    onDelete={() => {
                      setDeleteConfirm(p.id ?? null);
                    }}
                  />
                </div>

                {/* Phase + priority */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant={
                      isPaused ? "warning" :
                      isCompleted ? "success" :
                      p.currentPhase >= 5 ? "warning" : "info"
                    }
                    className="rounded-full"
                  >
                    {isPaused ? "Paused" : isCompleted ? "Completed" : p.phaseName}
                  </Badge>
                  <PriorityIndicator priority={p.priority} />
                  {p.isDemo && (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Sample
                    </span>
                  )}
                </div>

                {/* Progress + budget */}
                <div className="flex items-center gap-3 mb-3">
                  <ProgressRing progress={p.progress} size={40} />
                  <div className="flex flex-col gap-0.5 text-[11px] text-muted">
                    <span>
                      Budget:{" "}
                      <span className="font-data text-earth">
                        {formatCurrencyCompact(p.totalBudget, marketData.currency)}
                      </span>
                    </span>
                    <span>
                      Spent:{" "}
                      <span className="font-data text-earth">
                        {formatCurrencyCompact(p.totalSpent, marketData.currency)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Description */}
                {p.details && (
                  <p className="text-[11px] text-muted mb-3 truncate">{p.details}</p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  {lastActivity && (
                    <span className="text-[10px] text-muted/60">
                      Last active: {lastActivity}
                    </span>
                  )}
                  <Link
                    href={`/project/${p.id}/overview`}
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-clay hover:text-earth transition-colors ml-auto"
                  >
                    Open
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-earth/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-lg border border-border p-6 max-w-sm w-full">
            <h3
              className="text-[18px] text-earth mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Delete project?
            </h3>
            <p className="text-[13px] text-muted mb-6 leading-relaxed">
              This action cannot be undone. All project data, budget items, documents, photos, and logs will be permanently removed.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-[13px] font-medium rounded-lg border border-border text-earth hover:bg-warm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-[13px] font-medium rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
