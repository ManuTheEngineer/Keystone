"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import {
  subscribeToProject,
  subscribeToBudgetItems,
  addBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  updateProject,
  type ProjectData,
  type BudgetItemData,
} from "@/lib/services/project-service";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CostRangeBar } from "@/components/ui/CostRangeBar";
import { BudgetDonutChart } from "@/components/charts";
import {
  Plus,
  Download,
  ChevronDown,
  ChevronUp,
  SquareStack,
  Layers,
  LayoutGrid,
  Droplets,
  Zap,
  Wind,
  Paintbrush,
  Home,
  Shield,
  Receipt,
  Hammer,
  Package,
  DollarSign,
  Pencil,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/hooks/use-translation";
import { EmptyState } from "@/components/ui/EmptyState";
import { AIInsight } from "@/components/ui/AIInsight";
import { LearnTooltip } from "@/components/ui/LearnTooltip";
import { generateBudgetInsights } from "@/lib/insights";
import {
  getMarketData,
  getCostBenchmarks,
  formatCurrency,
  formatCurrencyCompact,
  getClosestLocation,
  getCostComparisonText,
  adjustCostForLocation,
} from "@keystone/market-data";
import type { Market, PropertyType, CostBenchmark, LocationData } from "@keystone/market-data";

// ---------------------------------------------------------------------------
// Category icon mapping
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "site prep": SquareStack,
  "site work": SquareStack,
  "foundation": Layers,
  "framing": LayoutGrid,
  "plumbing": Droplets,
  "rough-in": Droplets,
  "electrical": Zap,
  "hvac": Wind,
  "insulation": Package,
  "insulation/drywall": Package,
  "interior finishes": Paintbrush,
  "interior": Paintbrush,
  "exterior": Home,
  "envelope": Shield,
  "roofing": Home,
  "permits": Receipt,
  "permits/fees": Receipt,
  "contingency": Shield,
};

function getCategoryIcon(category: string): React.ElementType {
  const lower = category.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return Hammer;
}

// NOTE: Status labels use i18n keys; the t() function is called inside the component.
// This helper returns raw keys — the component translates them before rendering.
function getStatusInfo(item: BudgetItemData): { labelKey: string; fallback: string; variant: "success" | "danger" | "info" | "warning" } {
  if (item.status === "over") return { labelKey: "status.overBudget", fallback: "Over budget", variant: "danger" };
  if (item.status === "on-track") return { labelKey: "status.onTrack", fallback: "On track", variant: "success" };
  if (item.status === "under") return { labelKey: "status.underBudget", fallback: "Under budget", variant: "info" };
  return { labelKey: "status.notStarted", fallback: "Not started", variant: "warning" };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function BudgetClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [items, setItems] = useState<BudgetItemData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [estimated, setEstimated] = useState("");
  const [actual, setActual] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingBenchmarks, setLoadingBenchmarks] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editEstimated, setEditEstimated] = useState("");
  const [editActual, setEditActual] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"category" | "estimated" | "actual" | "variance" | "progress">("category");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const addFormRef = useRef<HTMLDivElement>(null);

  function openAddForm() {
    setShowForm(true);
    setTimeout(() => addFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribeToProject(user.uid, projectId, setProject);
    const unsub2 = subscribeToBudgetItems(user.uid, projectId, setItems);
    return () => { unsub1(); unsub2(); };
  }, [user, projectId]);

  // Sync project totals when budget items change
  const syncRef = useRef(false);
  const projectRef = useRef(project);
  projectRef.current = project;
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!user || !projectRef.current || items.length === 0) return;
    // Avoid sync on initial load race
    if (!syncRef.current) {
      syncRef.current = true;
      return;
    }
    // Debounce to prevent rapid re-fires
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      const latestProject = projectRef.current;
      if (!latestProject) return;
      const newTotal = items.reduce((sum, item) => sum + Number(item.estimated || 0), 0);
      const newSpent = items.reduce((sum, item) => sum + Number(item.actual || 0), 0);
      // Only write if values actually differ from what's already on the project
      if (newTotal !== latestProject.totalBudget || newSpent !== latestProject.totalSpent) {
        updateProject(user.uid, projectId, { totalBudget: newTotal, totalSpent: newSpent }).catch(() => {
          showToast("Failed to sync budget totals", "error");
        });
      }
    }, 300);
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [items, user, projectId]); // intentionally exclude project to avoid loop

  useEffect(() => {
    if (project) {
      const marketData = getMarketData(project.market as Market);
      setTopbar(
        project.name,
        `${t("project.budget")} — ${formatCurrencyCompact(project.totalSpent, marketData.currency)} / ${formatCurrencyCompact(project.totalBudget, marketData.currency)}`,
        "success"
      );
    }
  }, [project, setTopbar]);

  if (!project) return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-sand border-t-clay animate-spin mb-3" />
      <p className="text-[12px] text-muted">Loading budget...</p>
    </div>
  );

  const market = project.market as Market;
  const marketData = getMarketData(market);
  const locationData: LocationData | null = project.city ? getClosestLocation(project.city, market) : null;
  const benchmarks = getCostBenchmarks(market, project.propertyType as PropertyType);
  const fmt = (amount: number) => formatCurrency(amount, marketData.currency);
  const fmtCompact = (amount: number) => formatCurrencyCompact(amount, marketData.currency);
  const adjustForLocation = (amount: number) =>
    locationData ? adjustCostForLocation(amount, locationData) : amount;

  const remaining = project.totalBudget - project.totalSpent;
  const hasSpending = project.totalSpent > 0;
  const varianceNum = project.totalBudget > 0 && hasSpending
    ? ((project.totalSpent - project.totalBudget) / project.totalBudget) * 100
    : 0;
  const variance = hasSpending ? `${varianceNum.toFixed(1)}%` : "N/A";
  const budgetUtilization = project.totalBudget > 0
    ? Math.round((project.totalSpent / project.totalBudget) * 100)
    : 0;
  const utilizationColor =
    budgetUtilization > 95 ? "var(--color-danger)" :
    budgetUtilization > 80 ? "var(--color-warning)" :
    "var(--color-success)";

  function findBenchmark(cat: string): CostBenchmark | undefined {
    return benchmarks.find(
      (b) => b.category.toLowerCase().includes(cat.toLowerCase()) ||
             cat.toLowerCase().includes(b.category.toLowerCase().split(" ")[0])
    );
  }

  async function handleSave() {
    if (!category.trim() || !estimated.trim() || !user) return;
    setSaving(true);
    try {
      await addBudgetItem(user.uid, {
        projectId,
        category: category.trim(),
        estimated: Number(estimated),
        actual: Number(actual) || 0,
        status: Number(actual) > Number(estimated) ? "over" : Number(actual) > 0 ? "on-track" : "not-started",
      });
      setCategory("");
      setEstimated("");
      setActual("");
      setShowForm(false);
      showToast("Budget item added", "success");
    } catch {
      showToast("Failed to add budget item", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleLoadBenchmarks() {
    if (!user) return;
    setLoadingBenchmarks(true);
    try {
      for (const bm of benchmarks.filter((b) => b.unit !== "lump")) {
        const exists = items.some(
          (item) => item.category.toLowerCase() === bm.category.toLowerCase()
        );
        if (!exists) {
          await addBudgetItem(user.uid, {
            projectId,
            category: bm.category,
            estimated: adjustForLocation(bm.midRange),
            actual: 0,
            status: "not-started",
          });
        }
      }
      showToast("Benchmarks loaded", "success");
    } catch {
      showToast("Failed to load benchmarks", "error");
    } finally {
      setLoadingBenchmarks(false);
    }
  }

  function startEditItem(item: BudgetItemData) {
    setEditingItemId(item.id!);
    setEditEstimated(String(item.estimated));
    setEditActual(String(item.actual));
  }

  async function handleEditSave(item: BudgetItemData) {
    if (!user) return;
    setEditSaving(true);
    try {
      const est = Number(editEstimated);
      const act = Number(editActual);
      const status = act > est ? "over" : act > 0 ? "on-track" : "not-started";
      await updateBudgetItem(user.uid, projectId, item.id!, {
        estimated: est,
        actual: act,
        status,
      });
      setEditingItemId(null);
      showToast("Budget item updated", "success");
    } catch {
      showToast("Failed to update budget item", "error");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!user) return;
    try {
      await deleteBudgetItem(user.uid, projectId, itemId);
      setDeleteConfirmId(null);
      setExpandedItem(null);
      showToast("Budget item deleted", "success");
    } catch {
      showToast("Failed to delete budget item", "error");
    }
  }


  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  }

  const sortedItems = [...items].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortBy) {
      case "category": return dir * a.category.localeCompare(b.category);
      case "estimated": return dir * (a.estimated - b.estimated);
      case "actual": return dir * (a.actual - b.actual);
      case "variance": return dir * ((a.actual - a.estimated) - (b.actual - b.estimated));
      case "progress": {
        const pa = a.estimated > 0 ? a.actual / a.estimated : 0;
        const pb = b.estimated > 0 ? b.actual / b.estimated : 0;
        return dir * (pa - pb);
      }
      default: return 0;
    }
  });

  // AI insights (computed once)
  const budgetInsights = items.length > 0 ? generateBudgetInsights(project, items, marketData.currency.symbol).sort((a, b) => b.priority - a.priority).slice(0, 3) : [];

  // Donut chart colors (reuse for table dots)
  const DONUT_COLORS = ["#2D6A4F", "#8B4513", "#1B4965", "#BC6C25", "#6B4226", "#9B2226", "#D4A574", "#3A3A3A", "#6A6A6A", "#2C1810", "#4A7C59", "#A0522D", "#264653", "#E9C46A", "#2A9D8F"];

  return (
    <>
      {/* ================================================================= */}
      {/*  TOP: Donut + KPIs side by side                                   */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-5 mb-4 items-center">
        {/* Donut — proper size, no legend */}
        {items.length > 0 ? (
          <BudgetDonutChart
            items={items.map((b) => ({ category: b.category, amount: b.estimated }))}
            total={project.totalBudget}
            currency={marketData.currency}
            hideLegend
            compact
          />
        ) : (
          <div className="w-[200px] h-[160px] rounded-lg bg-warm/20 flex items-center justify-center">
            <span className="text-[11px] text-muted">No data yet</span>
          </div>
        )}

        {/* KPIs stacked */}
        <div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3">
            {[
              { label: "Budget", value: fmtCompact(project.totalBudget) },
              { label: "Spent", value: fmtCompact(project.totalSpent) },
              { label: "Remaining", value: fmtCompact(remaining), warn: remaining < 0 },
              { label: "Utilization", value: `${budgetUtilization}%`, warn: budgetUtilization > 90 },
            ].map((kpi) => (
              <div key={kpi.label} className="flex items-baseline justify-between">
                <span className="text-[10px] text-muted">{kpi.label}</span>
                <span className={`text-[14px] font-data font-semibold ${kpi.warn ? "text-danger" : "text-earth"}`}>{kpi.value}</span>
              </div>
            ))}
          </div>

          {/* Utilization bar */}
          <div className="h-1.5 bg-sand/20 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all ${budgetUtilization > 90 ? "bg-danger" : budgetUtilization > 70 ? "bg-warning" : "bg-success"}`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            />
          </div>

          {/* AI insights */}
          {budgetInsights.length > 0 && (
            <div className="space-y-0.5">
              {budgetInsights.map((insight, i) => (
                <p key={i} className="text-[10px] text-muted leading-snug flex items-start gap-1.5">
                  <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${insight.type === "risk" ? "bg-warning" : "bg-info"}`} />
                  {insight.content}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Location context — single line */}
      {locationData && (
        <p className="text-[10px] text-muted mb-3">
          Costs adjusted for {locationData.city}{locationData.state ? `, ${locationData.state}` : ""} (index: {locationData.costIndex.toFixed(2)}x, {getCostComparisonText(locationData.costIndex)})
        </p>
      )}

      {/* ================================================================= */}
      {/*  EMPTY STATE                                                      */}
      {/* ================================================================= */}
      {items.length === 0 && !showForm && (
        <div className="text-center py-12 mb-20">
          <p className="text-[13px] text-earth font-medium mb-1">Build your budget</p>
          <p className="text-[11px] text-muted mb-4 max-w-sm mx-auto">
            Start with typical costs for {project.city || "your area"} and adjust from there.
          </p>
          <button onClick={handleLoadBenchmarks} disabled={loadingBenchmarks}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] bg-earth text-warm rounded-lg hover:bg-earth/90 transition-colors disabled:opacity-40">
            <Download size={14} />
            {loadingBenchmarks ? "Loading..." : "Load typical costs"}
          </button>
          <p className="mt-2">
            <button onClick={openAddForm} className="text-[10px] text-clay hover:underline">Or add manually</button>
          </p>
        </div>
      )}

      {/* ================================================================= */}
      {/*  ADD FORM                                                         */}
      {/* ================================================================= */}
      {showForm && (
        <div ref={addFormRef} className="mb-4 p-3 rounded-lg border border-border bg-surface">
          <div className="grid grid-cols-[1fr_120px_120px_auto] gap-2 items-end">
            <div>
              <label className="block text-[10px] text-muted mb-1">Category</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Foundation" className="w-full px-2.5 py-1.5 text-[12px] border border-border rounded bg-white text-earth placeholder:text-muted/40 focus:outline-none focus:border-clay/40" />
            </div>
            <div>
              <label className="block text-[10px] text-muted mb-1">Estimated ({marketData.currency.code})</label>
              <input type="number" value={estimated} onChange={(e) => setEstimated(e.target.value)}
                placeholder="0" className="w-full px-2.5 py-1.5 text-[12px] border border-border rounded bg-white text-earth font-data focus:outline-none focus:border-clay/40" />
            </div>
            <div>
              <label className="block text-[10px] text-muted mb-1">Actual ({marketData.currency.code})</label>
              <input type="number" value={actual} onChange={(e) => setActual(e.target.value)}
                placeholder="0" className="w-full px-2.5 py-1.5 text-[12px] border border-border rounded bg-white text-earth font-data focus:outline-none focus:border-clay/40" />
            </div>
            <div className="flex gap-1.5">
              <button onClick={handleSave} disabled={saving || !category.trim() || !estimated.trim()}
                className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded hover:bg-earth/90 disabled:opacity-40 transition-colors">
                {saving ? "..." : "Add"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-2 py-1.5 text-[11px] text-muted hover:text-earth transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/*  BUDGET TABLE                                                     */}
      {/* ================================================================= */}
      {items.length > 0 && (
        <div className="mb-20">
          {/* Controls */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-data text-muted/50">{items.length} categories</span>
              {benchmarks.length > 0 && (
                <button onClick={() => setShowBenchmarks(p => !p)} className="text-[9px] text-clay/60 hover:text-clay transition-colors">
                  {showBenchmarks ? "Hide ranges" : "Show ranges"}
                </button>
              )}
            </div>
            <button onClick={openAddForm} className="flex items-center gap-1 text-[10px] text-clay hover:text-earth transition-colors">
              <Plus size={10} /> Add
            </button>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border/40 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[minmax(0,1fr)_100px_100px_90px_120px_28px] gap-0 bg-warm/30 border-b border-border/30 text-[9px] text-muted uppercase tracking-wider">
              {[
                { key: "category" as const, label: "Category" },
                { key: "estimated" as const, label: "Estimated" },
                { key: "actual" as const, label: "Actual" },
                { key: "variance" as const, label: "Variance" },
                { key: "progress" as const, label: "Progress" },
              ].map((col) => (
                <button key={col.key} onClick={() => toggleSort(col.key)}
                  className={`px-3 py-2 text-left hover:text-earth transition-colors flex items-center gap-0.5 ${sortBy === col.key ? "text-earth font-semibold" : ""}`}>
                  {col.label}
                  {sortBy === col.key && <span className="text-[7px]">{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>}
                </button>
              ))}
              <div />
            </div>

            {/* Rows */}
            {sortedItems.map((item, idx) => {
              const isExpanded2 = expandedItem === item.id;
              const itemProgress = item.estimated > 0 ? Math.round((item.actual / item.estimated) * 100) : 0;
              const varianceAmt = item.actual - item.estimated;
              const isOver = item.actual > item.estimated;
              const colorDot = DONUT_COLORS[idx % DONUT_COLORS.length];

              return (
                <div key={item.id} className={`border-b border-border/15 last:border-b-0 ${isOver && item.actual > 0 ? "bg-danger/[0.02]" : ""}`}>
                  {/* Main row */}
                  <button
                    onClick={() => setExpandedItem(isExpanded2 ? null : item.id ?? null)}
                    className="w-full grid grid-cols-[minmax(0,1fr)_100px_100px_90px_120px_28px] gap-0 items-center hover:bg-warm/8 transition-colors"
                  >
                    {/* Category */}
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorDot }} />
                      <span className="text-[12px] text-earth truncate">{item.category}</span>
                    </div>
                    {/* Estimated */}
                    <span className="text-[11px] font-data text-earth px-3 text-right">{fmtCompact(item.estimated)}</span>
                    {/* Actual */}
                    <span className="text-[11px] font-data text-earth px-3 text-right">{fmtCompact(item.actual)}</span>
                    {/* Variance */}
                    <span className={`text-[11px] font-data px-3 text-right ${item.actual === 0 ? "text-muted/30" : isOver ? "text-danger" : "text-success"}`}>
                      {item.actual === 0 ? "--" : `${isOver ? "+" : ""}${fmtCompact(varianceAmt)}`}
                    </span>
                    {/* Progress */}
                    <div className="flex items-center gap-1.5 px-3">
                      <div className="flex-1 h-[3px] bg-sand/30 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isOver ? "bg-danger" : itemProgress > 80 ? "bg-warning" : "bg-success"}`}
                          style={{ width: `${Math.min(itemProgress, 100)}%` }} />
                      </div>
                      <span className="text-[9px] font-data text-muted/50 w-7 text-right">{itemProgress}%</span>
                    </div>
                    {/* Chevron */}
                    <div className="flex justify-center">
                      <ChevronDown size={12} className={`text-muted/30 transition-transform ${isExpanded2 ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded2 && (
                    <div className="px-3 pb-3 pt-1 bg-warm/5">
                      <div className="grid grid-cols-3 gap-4 text-[10px] mb-2">
                        <div>
                          <span className="text-muted block">Estimated</span>
                          <span className="font-data text-earth">{fmt(item.estimated)}</span>
                        </div>
                        <div>
                          <span className="text-muted block">Actual</span>
                          <span className="font-data text-earth">{fmt(item.actual)}</span>
                        </div>
                        <div>
                          <span className="text-muted block">Variance</span>
                          <span className={`font-data ${isOver ? "text-danger" : "text-success"}`}>
                            {isOver ? "+" : ""}{fmt(varianceAmt)}
                          </span>
                        </div>
                      </div>

                      {/* Benchmark range */}
                      {showBenchmarks && (() => {
                        const bm = findBenchmark(item.category);
                        if (!bm) return null;
                        return (
                          <div className="mb-2">
                            <CostRangeBar
                              low={adjustForLocation(bm.lowRange)}
                              mid={adjustForLocation(bm.midRange)}
                              high={adjustForLocation(bm.highRange)}
                              actual={item.estimated > 0 ? item.estimated : undefined}
                              currency={marketData.currency}
                            />
                          </div>
                        );
                      })()}

                      {/* Edit mode */}
                      {editingItemId === item.id ? (
                        <div className="flex items-end gap-2 mt-2">
                          <div className="flex-1">
                            <label className="block text-[9px] text-muted mb-0.5">Estimated</label>
                            <input type="number" value={editEstimated} onChange={(e) => setEditEstimated(e.target.value)}
                              className="w-full px-2 py-1 text-[11px] border border-border rounded bg-white font-data focus:outline-none focus:border-clay/40" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-[9px] text-muted mb-0.5">Actual</label>
                            <input type="number" value={editActual} onChange={(e) => setEditActual(e.target.value)}
                              className="w-full px-2 py-1 text-[11px] border border-border rounded bg-white font-data focus:outline-none focus:border-clay/40" />
                          </div>
                          <button onClick={() => handleEditSave(item)} disabled={editSaving}
                            className="px-2.5 py-1 text-[10px] bg-earth text-warm rounded hover:bg-earth/90 disabled:opacity-40">{editSaving ? "..." : "Save"}</button>
                          <button onClick={() => setEditingItemId(null)}
                            className="px-2 py-1 text-[10px] text-muted hover:text-earth">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={(e) => { e.stopPropagation(); startEditItem(item); }}
                            className="flex items-center gap-1 text-[10px] text-clay hover:text-earth transition-colors">
                            <Pencil size={10} /> Edit
                          </button>
                          {deleteConfirmId === item.id ? (
                            <span className="flex items-center gap-1.5 text-[10px]">
                              <span className="text-danger">Delete?</span>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id!); }}
                                className="text-danger hover:underline">Yes</button>
                              <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                                className="text-muted hover:text-earth">No</button>
                            </span>
                          ) : (
                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(item.id!); }}
                              className="flex items-center gap-1 text-[10px] text-danger/50 hover:text-danger transition-colors">
                              <Trash2 size={10} /> Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/*  STICKY FOOTER                                                    */}
      {/* ================================================================= */}
      <div className="fixed bottom-0 right-0 z-30 bg-earth/95 backdrop-blur-sm border-t border-earth-light/20 pr-16" style={{ left: "var(--sidebar-width, 0px)" }}>
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {[
              { label: "Budget", value: fmtCompact(project.totalBudget) },
              { label: "Spent", value: fmtCompact(project.totalSpent) },
              { label: "Left", value: fmtCompact(remaining), danger: remaining < 0 },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-[8px] text-warm/50 uppercase tracking-wider">{m.label}</p>
                <p className={`font-data text-sm font-medium ${m.danger ? "text-danger" : "text-warm"}`}>{m.value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[8px] text-warm/50 uppercase tracking-wider">Contingency</p>
            <p className="font-data text-sm text-warm font-medium">
              {(() => {
                const c = items.find(i => i.category.toLowerCase().includes("contingency"));
                return c ? fmtCompact(c.estimated - c.actual) : "--";
              })()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
