"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTopbar } from "../layout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import {
  subscribeToUserProjects,
  updateProjectPriority,
  updateProject,
  deleteProject,
  type ProjectData,
} from "@/lib/services/project-service";
import { Badge } from "@/components/ui/Badge";
import { MarketBadge } from "@/components/ui/MarketBadge";
import { getMarketData, formatCurrencyCompact, USD_CONFIG } from "@keystone/market-data";
import type { Market } from "@keystone/market-data";
import {
  ArrowRight,
  Search,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  FolderOpen,
  TrendingUp,
  ArrowUpDown,
  Eye,
  LayoutGrid,
  List,
  Download,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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
/*  Budget health bar                                                 */
/* ------------------------------------------------------------------ */

function BudgetHealthBar({ spent, budget }: { spent: number; budget: number }) {
  if (!budget || budget <= 0) return null;
  const ratio = spent / budget;
  const pct = Math.min(100, Math.round(ratio * 100));
  const color = ratio > 0.95 ? "bg-danger" : ratio > 0.80 ? "bg-warning" : "bg-success";
  return (
    <div className="w-full">
      <div className="w-full h-1.5 bg-warm rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Kebab menu                                                        */
/* ------------------------------------------------------------------ */

interface KebabMenuProps {
  project: ProjectData;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSetPriority: (priority: number | null) => void;
  onPause: () => void;
  onResume: () => void;
  onDelete: () => void;
  onView: () => void;
}

function KebabMenu({ project, isOpen, onToggle, onClose, onSetPriority, onPause, onResume, onDelete, onView }: KebabMenuProps) {
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        className="p-1 rounded text-muted hover:text-earth hover:bg-warm transition-colors"
        aria-label="Project actions"
      >
        <MoreVertical size={14} />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <div
            className="absolute right-0 top-full mt-1 w-[180px] bg-surface border border-border rounded-lg shadow-lg z-50 py-1"
          >
            {/* View project */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
                onClose();
              }}
              className="w-full text-left px-3 py-1.5 text-[12px] text-earth hover:bg-warm/50 transition-colors flex items-center gap-2"
            >
              <Eye size={12} />
              View project
            </button>

            <div className="h-px bg-border my-1" />

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
                    onClose();
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
                  onClose();
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
                  onClose();
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
                onClose();
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
type ViewMode = "grid" | "list";

/* ------------------------------------------------------------------ */
/*  Vault client                                                      */
/* ------------------------------------------------------------------ */

export function VaultClient() {
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("priority");
  const [sortAscending, setSortAscending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteProjectName, setDeleteProjectName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserProjects(user.uid, setProjects);
    return unsub;
  }, [user]);

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
      let cmp = 0;
      if (sortOption === "priority") {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const pa = a.priority ?? 999;
        const pb = b.priority ?? 999;
        if (pa !== pb) { cmp = pa - pb; }
        else {
          const ua = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const ub = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          cmp = ub - ua;
        }
      } else if (sortOption === "recent") {
        const ua = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const ub = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        cmp = ub - ua;
      } else if (sortOption === "progress") {
        cmp = (b.progress || 0) - (a.progress || 0);
      }
      return sortAscending ? -cmp : cmp;
    });

    return result;
  }, [projects, statusFilter, marketFilter, sortOption, sortAscending, searchQuery]);

  // Stats from filtered set
  const portfolioStats = useMemo(() => {
    const totalBudget = filteredProjects.reduce((sum, p) => sum + (p.totalBudget || 0), 0);
    const totalSpent = filteredProjects.reduce((sum, p) => sum + (p.totalSpent || 0), 0);
    const avgProgress = filteredProjects.length > 0
      ? Math.round(filteredProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / filteredProjects.length)
      : 0;
    // Check if all filtered projects share the same market currency
    const markets = new Set(filteredProjects.map((p) => p.market));
    const singleCurrency = markets.size <= 1;
    return { totalBudget, totalSpent, avgProgress, singleCurrency };
  }, [filteredProjects]);

  const isFiltered = statusFilter !== "all" || marketFilter !== "all" || searchQuery.trim() !== "";

  useEffect(() => {
    try {
      const count = filteredProjects.length;
      const suffix = isFiltered ? ` of ${projects.length}` : "";
      setTopbar("Vault", `${count}${suffix} project${count !== 1 ? "s" : ""}`, "info");
    } catch { /* layout may not be mounted on back-navigation */ }
  }, [setTopbar, filteredProjects.length, projects.length, isFiltered]);

  const handleSetPriority = useCallback(async (projectId: string, priority: number | null) => {
    if (!user) return;
    try {
      await updateProjectPriority(user.uid, projectId, priority);
      showToast(priority ? `Priority set to ${priority === 1 ? "High" : priority === 2 ? "Medium" : "Low"}` : "Priority cleared", "success");
    } catch {
      showToast("Failed to update priority", "error");
    }
  }, [user, showToast]);

  const handlePause = useCallback(async (projectId: string) => {
    if (!user) return;
    try {
      await updateProject(user.uid, projectId, { status: "PAUSED" });
      showToast("Project paused", "success");
    } catch {
      showToast("Failed to pause project", "error");
    }
  }, [user, showToast]);

  const handleResume = useCallback(async (projectId: string) => {
    if (!user) return;
    try {
      await updateProject(user.uid, projectId, { status: "ACTIVE" });
      showToast("Project resumed", "success");
    } catch {
      showToast("Failed to resume project", "error");
    }
  }, [user, showToast]);

  const handleDelete = useCallback(async (projectId: string) => {
    if (!user || deleting) return;
    setDeleting(true);
    try {
      await deleteProject(user.uid, projectId);
      showToast("Project deleted", "success");
    } catch {
      showToast("Failed to delete project", "error");
    }
    setDeleteConfirm(null);
    setDeleteProjectName("");
    setDeleting(false);
  }, [user, deleting, showToast]);

  // Derive currency from filtered projects (not first overall project)
  const primaryCurrency = filteredProjects.length > 0
    ? getMarketData((filteredProjects[0]?.market as Market) ?? "USA").currency
    : projects.length > 0
    ? getMarketData((projects[0]?.market as Market) ?? "USA").currency
    : USD_CONFIG;

  const handleSortClick = useCallback((sort: SortOption) => {
    if (sortOption === sort) {
      setSortAscending((prev) => !prev);
    } else {
      setSortOption(sort);
      setSortAscending(false);
    }
  }, [sortOption]);

  return (
    <div className="animate-fade-in">
      {/* Vault header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-[26px] text-earth mb-1"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Vault
            </h1>
            <div className="flex items-center gap-4 text-[12px] text-muted">
              <span>
                <span className="font-data text-earth">{filteredProjects.length}</span>
                {isFiltered && <span className="text-muted/60"> of {projects.length}</span>}
                {" "}project{filteredProjects.length !== 1 ? "s" : ""}
              </span>
              {portfolioStats.totalBudget > 0 && portfolioStats.singleCurrency && (
                <>
                  <span>
                    <span className="font-data text-earth">{formatCurrencyCompact(portfolioStats.totalBudget, primaryCurrency)}</span> budget
                  </span>
                  <span>
                    <span className="font-data text-earth">{formatCurrencyCompact(portfolioStats.totalSpent, primaryCurrency)}</span> spent
                  </span>
                </>
              )}
              {filteredProjects.length > 0 && (
                <span>
                  <span className="font-data text-earth">{portfolioStats.avgProgress}%</span> avg progress
                </span>
              )}
            </div>
          </div>
          {/* View mode toggle + Export */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface border border-border rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-earth text-warm" : "text-muted hover:text-earth"}`}
                aria-label="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-earth text-warm" : "text-muted hover:text-earth"}`}
                aria-label="List view"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Budget health bar for vault — only when all projects share a currency */}
        {portfolioStats.totalBudget > 0 && portfolioStats.singleCurrency && (
          <div className="mt-3">
            <BudgetHealthBar spent={portfolioStats.totalSpent} budget={portfolioStats.totalBudget} />
            <div className="flex items-center justify-between mt-1 text-[10px] text-muted">
              <span>{Math.round((portfolioStats.totalSpent / portfolioStats.totalBudget) * 100)}% of budget spent</span>
              <span className="font-data text-success">{formatCurrencyCompact(portfolioStats.totalBudget - portfolioStats.totalSpent, primaryCurrency)} remaining</span>
            </div>
          </div>
        )}
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
        <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-0.5">
          {(["all", "ACTIVE", "PAUSED", "COMPLETED"] as StatusFilter[]).map((status) => {
            const labels: Record<StatusFilter, string> = { all: "All", ACTIVE: "Active", PAUSED: "Paused", COMPLETED: "Done" };
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors ${
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
        <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-0.5">
          {(["all", "USA", "WA"] as MarketFilter[]).map((market) => {
            const labels: Record<MarketFilter, string> = { all: "All", USA: "USA", WA: "W. Africa" };
            return (
              <button
                key={market}
                onClick={() => setMarketFilter(market)}
                className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors ${
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

        {/* Sort with direction toggle */}
        <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-0.5">
          {(["priority", "recent", "progress"] as SortOption[]).map((sort) => {
            const labels: Record<SortOption, string> = { priority: "Priority", recent: "Recent", progress: "Progress" };
            const isActive = sortOption === sort;
            return (
              <button
                key={sort}
                onClick={() => handleSortClick(sort)}
                className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-0.5 ${
                  isActive
                    ? "bg-earth text-warm font-medium"
                    : "text-muted hover:text-earth"
                }`}
              >
                {labels[sort]}
                {isActive && (
                  sortAscending ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Project grid / list */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <FolderOpen size={48} className="text-muted/30 mb-4" />
          {projects.length === 0 ? (
            <>
              <h2
                className="text-[20px] text-earth mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Your vault is empty
              </h2>
              <p className="text-[13px] text-muted mb-6 max-w-sm leading-relaxed">
                Start with the Deal Analyzer to evaluate your first opportunity, or create a new project directly.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/new-project"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium rounded-xl bg-earth text-warm hover:bg-earth-light transition-colors"
                >
                  <TrendingUp size={16} />
                  Evaluate a Deal
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
              <p className="text-[13px] text-muted mb-4">
                {filteredProjects.length} of {projects.length} projects shown.
                Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setMarketFilter("all");
                  setSearchQuery("");
                }}
                className="text-[12px] text-clay hover:text-earth transition-colors font-medium"
              >
                Clear all filters
              </button>
            </>
          )}
        </div>
      ) : viewMode === "list" ? (
        /* ============================================================ */
        /*  LIST / TABLE VIEW                                           */
        /* ============================================================ */
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_100px_80px_80px_100px_40px] gap-2 px-4 py-2.5 border-b border-border bg-warm/30 text-[10px] uppercase tracking-[0.1em] text-muted font-medium">
            <span>Project</span>
            <span>Phase</span>
            <span>Budget</span>
            <span>Spent</span>
            <span>Progress</span>
            <span>Last Active</span>
            <span />
          </div>
          {filteredProjects.map((p) => {
            const marketData = getMarketData(p.market as Market);
            const isPaused = p.status === "PAUSED";
            const isCompleted = p.status === "COMPLETED";
            const budgetRatio = p.totalBudget > 0 ? p.totalSpent / p.totalBudget : 0;
            const budgetColor = budgetRatio > 0.95 ? "text-danger" : budgetRatio > 0.80 ? "text-warning" : "text-earth";

            return (
              <Link
                key={p.id}
                href={`/project/${p.id}/overview`}
                className={`grid grid-cols-[1fr_100px_100px_80px_80px_100px_40px] gap-2 px-4 py-3 border-b border-border/40 hover:bg-warm/20 transition-colors cursor-pointer items-center ${isPaused ? "opacity-70" : ""} ${isCompleted ? "opacity-80" : ""}`}
              >
                {/* Name + badges */}
                <div className="flex items-center gap-2 min-w-0">
                  <PriorityIndicator priority={p.priority} />
                  <span className="text-[13px] text-earth font-medium truncate" style={{ fontFamily: "var(--font-heading)" }}>
                    {p.name}
                  </span>
                  <MarketBadge market={p.market as Market} />
                  {p.isDemo && (
                    <Badge variant="info" className="rounded-full text-[9px]">[Demo]</Badge>
                  )}
                </div>

                {/* Phase */}
                <div>
                  <Badge
                    variant={isPaused ? "warning" : isCompleted ? "success" : p.currentPhase >= 5 ? "warning" : "info"}
                    className="rounded-full text-[9px]"
                  >
                    {isPaused ? "Paused" : isCompleted ? "Done" : p.phaseName}
                  </Badge>
                </div>

                {/* Budget */}
                <span className="text-[12px] font-data text-earth">
                  {formatCurrencyCompact(p.totalBudget, marketData.currency)}
                </span>

                {/* Spent */}
                <span className={`text-[12px] font-data ${budgetColor}`}>
                  {formatCurrencyCompact(p.totalSpent, marketData.currency)}
                </span>

                {/* Progress */}
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-1.5 bg-warm rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-[11px] font-data text-earth">{p.progress}%</span>
                </div>

                {/* Last active */}
                <span className="text-[11px] text-muted">
                  {p.updatedAt ? formatRelativeTime(p.updatedAt) : ""}
                </span>

                {/* Menu */}
                <div onClick={(e) => e.preventDefault()}>
                  <KebabMenu
                    project={p}
                    isOpen={openMenuId === p.id}
                    onToggle={() => setOpenMenuId(openMenuId === p.id ? null : p.id ?? null)}
                    onClose={() => setOpenMenuId(null)}
                    onSetPriority={(priority) => { if (p.id) handleSetPriority(p.id, priority); }}
                    onPause={() => { if (p.id) handlePause(p.id); }}
                    onResume={() => { if (p.id) handleResume(p.id); }}
                    onDelete={() => { setDeleteConfirm(p.id ?? null); }}
                    onView={() => router.push(`/project/${p.id}/overview`)}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* ============================================================ */
        /*  CARD GRID VIEW                                              */
        /* ============================================================ */
        <div className={`grid gap-3 animate-stagger ${
          filteredProjects.length === 1
            ? "grid-cols-1 max-w-md"
            : filteredProjects.length === 2
            ? "grid-cols-1 md:grid-cols-2 max-w-2xl"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}>
          {filteredProjects.map((p) => {
            const marketData = getMarketData(p.market as Market);
            const isWestAfrica = ["TOGO", "GHANA", "BENIN"].includes(p.market);
            const topBorderColor = isWestAfrica
              ? "border-t-[var(--color-accent-wa)]"
              : "border-t-[var(--color-accent-usa)]";
            const isPaused = p.status === "PAUSED";
            const isCompleted = p.status === "COMPLETED";

            return (
              <Link
                key={p.id}
                href={`/project/${p.id}/overview`}
                className={`block bg-surface rounded-2xl shadow-[var(--shadow-sm)] p-5 border border-border border-t-[3px] ${topBorderColor} cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${isPaused ? "opacity-70" : ""} ${isCompleted ? "opacity-80" : ""}`}
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
                  <div onClick={(e) => e.preventDefault()}>
                    <KebabMenu
                      project={p}
                      isOpen={openMenuId === p.id}
                      onToggle={() => setOpenMenuId(openMenuId === p.id ? null : p.id ?? null)}
                      onClose={() => setOpenMenuId(null)}
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
                      onView={() => router.push(`/project/${p.id}/overview`)}
                    />
                  </div>
                </div>

                {/* Phase + priority + demo badge */}
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
                    <Badge variant="info" className="rounded-full text-[9px]">[Demo]</Badge>
                  )}
                </div>

                {/* Progress + budget */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="shrink-0">
                    <ProgressRing progress={p.progress} size={40} />
                    <span className="block text-[8px] text-muted text-center mt-0.5">Progress</span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-[11px] text-muted flex-1 min-w-0">
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

                {/* Budget health bar */}
                <div className="mb-3">
                  <BudgetHealthBar spent={p.totalSpent} budget={p.totalBudget} />
                </div>

                {/* Description */}
                {p.details && (
                  <p className="text-[11px] text-muted mb-3 truncate">{p.details}</p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  {p.updatedAt && (
                    <span className="text-[10px] text-muted/60">
                      {formatRelativeTime(p.updatedAt)}
                    </span>
                  )}
                  <span
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-clay ml-auto"
                  >
                    Open
                    <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (() => {
        const deleteTarget = projects.find((p) => p.id === deleteConfirm);
        const targetName = deleteTarget?.name ?? "";
        return (
          <div className="fixed inset-0 bg-earth/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-xl shadow-lg border border-border p-6 max-w-sm w-full">
              <h3
                className="text-[18px] text-earth mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Delete project?
              </h3>
              <p className="text-[13px] text-muted mb-3 leading-relaxed">
                This will permanently delete <strong className="text-earth">{targetName}</strong> and all its data. This action cannot be undone. Type the project name to confirm.
              </p>
              <input
                type="text"
                value={deleteProjectName}
                onChange={(e) => setDeleteProjectName(e.target.value)}
                placeholder={targetName}
                className="px-3 py-2 text-[13px] border border-border rounded-lg bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-danger w-full mb-4"
              />
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => { setDeleteConfirm(null); setDeleteProjectName(""); }}
                  className="px-4 py-2 text-[13px] font-medium rounded-lg border border-border text-earth hover:bg-warm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting || deleteProjectName !== targetName}
                  className="px-4 py-2 text-[13px] font-medium rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleting ? "Deleting..." : "Delete permanently"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
