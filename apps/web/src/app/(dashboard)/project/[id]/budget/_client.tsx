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
import { EmptyState } from "@/components/ui/EmptyState";
import { AIInsight } from "@/components/ui/AIInsight";
import { LearnTooltip } from "@/components/ui/LearnTooltip";
import { generateBudgetInsights } from "@/lib/insights";
import {
  getMarketData,
  getCostBenchmarks,
  formatCurrency,
  formatCurrencyCompact,
} from "@keystone/market-data";
import type { Market, PropertyType, CostBenchmark } from "@keystone/market-data";

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

function getStatusInfo(item: BudgetItemData): { label: string; variant: "success" | "danger" | "info" | "warning" } {
  if (item.status === "over") return { label: "Over budget", variant: "danger" };
  if (item.status === "on-track") return { label: "On track", variant: "success" };
  if (item.status === "under") return { label: "Under budget", variant: "info" };
  return { label: "Not started", variant: "warning" };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function BudgetClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
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

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribeToProject(user.uid, projectId, setProject);
    const unsub2 = subscribeToBudgetItems(user.uid, projectId, setItems);
    return () => { unsub1(); unsub2(); };
  }, [user, projectId]);

  // Sync project totals when budget items change
  const syncRef = useRef(false);
  useEffect(() => {
    if (!user || !project || items.length === 0) return;
    const newTotal = items.reduce((sum, item) => sum + item.estimated, 0);
    const newSpent = items.reduce((sum, item) => sum + item.actual, 0);
    if (newTotal !== project.totalBudget || newSpent !== project.totalSpent) {
      // Avoid sync on initial load race
      if (syncRef.current) {
        updateProject(user.uid, projectId, { totalBudget: newTotal, totalSpent: newSpent });
      }
    }
    syncRef.current = true;
  }, [items, user, projectId]); // intentionally exclude project to avoid loop

  useEffect(() => {
    if (project) {
      const marketData = getMarketData(project.market as Market);
      setTopbar(
        "Budget",
        `${formatCurrencyCompact(project.totalSpent, marketData.currency)} / ${formatCurrencyCompact(project.totalBudget, marketData.currency)}`,
        "success"
      );
    }
  }, [project, setTopbar]);

  if (!project) return <p className="text-muted text-sm">Loading...</p>;

  const market = project.market as Market;
  const marketData = getMarketData(market);
  const benchmarks = getCostBenchmarks(market, project.propertyType as PropertyType);
  const fmt = (amount: number) => formatCurrency(amount, marketData.currency);
  const fmtCompact = (amount: number) => formatCurrencyCompact(amount, marketData.currency);

  const remaining = project.totalBudget - project.totalSpent;
  const varianceNum = project.totalBudget > 0
    ? ((project.totalSpent - project.totalBudget) / project.totalBudget) * 100
    : 0;
  const variance = varianceNum.toFixed(1);
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
            estimated: bm.midRange,
            actual: 0,
            status: "not-started",
          });
        }
      }
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
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!user) return;
    await deleteBudgetItem(user.uid, projectId, itemId);
    setDeleteConfirmId(null);
    setExpandedItem(null);
  }

  return (
    <>
      <PageHeader
        title="Budget"
        projectName={project.name}
        projectId={projectId}
        action={{ label: "Add item", onClick: () => setShowForm(true), icon: <Plus size={14} /> }}
      />

      {/* ================================================================= */}
      {/* TOP SECTION: Visual summary                                       */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Budget donut chart */}
        <BudgetDonutChart
          items={items.map((b) => ({
            category: b.category,
            amount: b.estimated,
          }))}
          total={project.totalBudget}
          currency={marketData.currency}
        />

        {/* Stat cards */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <StatCard value={fmtCompact(project.totalBudget)} label="Total budget" />
            <StatCard value={fmtCompact(project.totalSpent)} label="Spent to date" />
            <StatCard value={fmtCompact(remaining)} label="Remaining" />
            <div>
              <StatCard
                value={`${variance}%`}
                label="Variance"
                valueClassName={varianceNum > 0 ? "text-danger" : varianceNum < -5 ? "text-info" : ""}
              />
              <div className="mt-1 px-1">
                <LearnTooltip
                  term="Variance"
                  explanation="The difference between what you planned to spend and what you actually spent. Negative variance means under budget. Positive means over budget."
                  whyItMatters="Tracking variance early lets you catch overspending before it becomes a crisis. A variance over 10% on any category is a warning sign."
                >
                  <span className="text-[9px] text-muted">What is this?</span>
                </LearnTooltip>
              </div>
            </div>
          </div>

          {/* Budget utilization bar */}
          <Card padding="md">
            <div className="flex justify-between text-[10px] text-muted mb-1.5">
              <span>Budget utilization</span>
              <span className="font-data">{budgetUtilization}%</span>
            </div>
            <ProgressBar value={budgetUtilization} color={utilizationColor} height={6} />
            <div className="flex justify-between text-[9px] mt-1.5">
              <span className="text-muted">
                {budgetUtilization <= 80 ? "Healthy" : budgetUtilization <= 95 ? "Watch" : "Critical"}
              </span>
              <span className="text-muted font-data">{fmtCompact(project.totalSpent)} / {fmtCompact(project.totalBudget)}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* ================================================================= */}
      {/* AI Budget Insights                                                */}
      {/* ================================================================= */}
      {items.length > 0 && (() => {
        const budgetInsights = generateBudgetInsights(project, items, marketData.currency.symbol);
        const topInsights = budgetInsights.sort((a, b) => b.priority - a.priority).slice(0, 3);
        if (topInsights.length === 0) return null;
        return (
          <div className="mb-4 space-y-2">
            <SectionLabel>AI Insights</SectionLabel>
            {topInsights.map((insight, i) => (
              <AIInsight key={i} type={insight.type} title={insight.title} content={insight.content} action={insight.action} />
            ))}
          </div>
        );
      })()}

      {/* ================================================================= */}
      {/* MIDDLE SECTION: Category cards                                    */}
      {/* ================================================================= */}

      {/* Market benchmarks prompt (when no items) */}
      {items.length === 0 && benchmarks.length > 0 && (
        <Card padding="md" className="mb-4 text-center">
          <p className="text-[12px] text-earth font-medium mb-1">Let us build your budget</p>
          <p className="text-[11px] text-muted mb-3 max-w-md mx-auto leading-relaxed">
            We will start with typical construction costs for {project.city || (market === "USA" ? "your area" : "your region")} and you can adjust from there. Every category shows what other builders in your area are paying.
          </p>
          <button
            onClick={handleLoadBenchmarks}
            disabled={loadingBenchmarks}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40 btn-hover"
          >
            <Download size={14} />
            {loadingBenchmarks ? "Loading..." : `Start with typical costs for ${project.city || (market === "USA" ? "US" : "Togo")}`}
          </button>
          <div className="mt-2">
            <button
              onClick={() => setShowForm(true)}
              className="text-[11px] text-info hover:underline cursor-pointer"
            >
              Or add items manually
            </button>
          </div>
        </Card>
      )}

      {/* Controls bar */}
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Budget Categories</SectionLabel>
        <div className="flex items-center gap-3">
          {items.length > 0 && benchmarks.length > 0 && (
            <button
              onClick={() => setShowBenchmarks((p) => !p)}
              className="text-[10px] text-info hover:underline cursor-pointer"
            >
              {showBenchmarks ? "Hide ranges" : "Show typical ranges"}
            </button>
          )}
          {items.length > 0 && (
            <button
              onClick={handleLoadBenchmarks}
              disabled={loadingBenchmarks}
              className="text-[10px] text-info hover:underline cursor-pointer disabled:opacity-40"
            >
              {loadingBenchmarks ? "Loading..." : "Load benchmarks"}
            </button>
          )}
          <button
            className="flex items-center gap-1 text-[11px] text-info hover:underline cursor-pointer"
            onClick={() => setShowForm(true)}
          >
            <Plus size={12} /> Add item
          </button>
        </div>
      </div>

      {/* Add item form */}
      {showForm && (
        <Card padding="md" className="mb-3">
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-earth mb-1.5">Category *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Foundation, Framing"
                className="px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-earth mb-1.5">Estimated ({marketData.currency.code})</label>
                <input
                  type="number"
                  value={estimated}
                  onChange={(e) => setEstimated(e.target.value)}
                  placeholder="0"
                  className="px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full font-data"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-earth mb-1.5">Actual ({marketData.currency.code})</label>
                <input
                  type="number"
                  value={actual}
                  onChange={(e) => setActual(e.target.value)}
                  placeholder="0"
                  className="px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full font-data"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !category.trim() || !estimated.trim()}
                className="btn-primary"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Category cards grid */}
      {items.length === 0 && !showForm ? (
        <div className="mb-24">
          <EmptyState
            icon={<DollarSign size={28} />}
            title="Let us build your budget"
            description={`We will start with typical construction costs for ${project.city || (market === "USA" ? "your area" : "your region")} and you can adjust from there. Every category shows what other builders in your area are paying.`}
            action={{ label: `Start with typical costs for ${project.city || (market === "USA" ? "US" : "Togo")}`, onClick: handleLoadBenchmarks }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-24 animate-stagger">
          {items.map((item) => {
            const benchmark = findBenchmark(item.category);
            const statusInfo = getStatusInfo(item);
            const IconComponent = getCategoryIcon(item.category);
            const isExpanded = expandedItem === item.id;
            const itemProgress = item.estimated > 0
              ? Math.min(Math.round((item.actual / item.estimated) * 100), 150)
              : 0;
            const progressColor =
              item.actual > item.estimated ? "var(--color-danger)" :
              item.actual > item.estimated * 0.8 ? "var(--color-warning)" :
              "var(--color-success)";

            return (
              <Card
                key={item.id}
                padding="sm"
                className="cursor-pointer hover:shadow-sm transition-shadow card-hover"
              >
                <div
                  onClick={() => setExpandedItem(isExpanded ? null : item.id ?? null)}
                >
                  {/* Header row */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-[var(--radius)] bg-warm flex items-center justify-center shrink-0">
                      <IconComponent size={16} className="text-clay" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-earth">{item.category}</span>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Estimated vs Actual */}
                  <div className="flex items-center justify-between text-[11px] font-data mb-1.5">
                    <span className="text-muted">Est: {fmt(item.estimated)}</span>
                    <span className="text-earth">Actual: {fmt(item.actual)}</span>
                  </div>

                  {/* Mini progress bar */}
                  <ProgressBar
                    value={Math.min(itemProgress, 100)}
                    color={progressColor}
                    height={3}
                  />
                  <div className="flex justify-between text-[9px] mt-1">
                    <span className="text-muted font-data">{Math.min(itemProgress, 100)}%</span>
                    {item.actual > 0 && (
                      <span className={item.actual > item.estimated ? "text-danger font-data" : "text-success font-data"}>
                        {item.actual > item.estimated ? "+" : ""}{fmt(item.actual - item.estimated)}
                      </span>
                    )}
                  </div>

                  {/* Benchmark range indicator */}
                  {benchmark && !isExpanded && (
                    <div className="mt-2 flex items-center gap-2 text-[9px] text-muted">
                      <span>Market range:</span>
                      <span className="font-data">{fmtCompact(benchmark.lowRange)} - {fmtCompact(benchmark.highRange)}</span>
                      {item.estimated > 0 && item.estimated >= benchmark.lowRange && item.estimated <= benchmark.highRange && (
                        <span className="text-success">Within range</span>
                      )}
                      {item.estimated > 0 && item.estimated > benchmark.highRange && (
                        <span className="text-danger">Above range</span>
                      )}
                      {item.estimated > 0 && item.estimated < benchmark.lowRange && (
                        <span className="text-info">Below range</span>
                      )}
                    </div>
                  )}

                  {/* Expand chevron */}
                  <div className="flex justify-center mt-1">
                    {isExpanded ? (
                      <ChevronUp size={14} className="text-muted" />
                    ) : (
                      <ChevronDown size={14} className="text-muted" />
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-border">
                    {/* Cost range bar */}
                    {showBenchmarks && benchmark && (
                      <div className="mb-3">
                        <CostRangeBar
                          low={benchmark.lowRange}
                          mid={benchmark.midRange}
                          high={benchmark.highRange}
                          actual={item.estimated > 0 ? item.estimated : undefined}
                          currency={marketData.currency}
                        />
                        <p className="text-[9px] text-muted mt-0.5">{benchmark.notes}</p>
                      </div>
                    )}

                    {/* Edit mode */}
                    {editingItemId === item.id ? (
                      <div className="space-y-2 mb-3">
                        <div>
                          <label className="block text-[10px] text-muted font-medium mb-0.5">Estimated ({marketData.currency.code})</label>
                          <input
                            type="number"
                            value={editEstimated}
                            onChange={(e) => setEditEstimated(e.target.value)}
                            className="px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full font-data"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted font-medium mb-0.5">Actual ({marketData.currency.code})</label>
                          <input
                            type="number"
                            value={editActual}
                            onChange={(e) => setEditActual(e.target.value)}
                            className="px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full font-data"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditSave(item)}
                            disabled={editSaving}
                            className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
                          >
                            {editSaving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="px-3 py-1.5 text-[11px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Detailed breakdown */}
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-muted">Estimated</span>
                            <span className="font-data text-earth">{fmt(item.estimated)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Actual spent</span>
                            <span className="font-data text-earth">{fmt(item.actual)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Variance</span>
                            <span className={`font-data ${item.actual > item.estimated ? "text-danger" : "text-success"}`}>
                              {item.actual > item.estimated ? "+" : ""}{fmt(item.actual - item.estimated)}
                            </span>
                          </div>
                          {benchmark && (
                            <>
                              <div className="border-t border-border pt-1.5 mt-1.5">
                                <div className="flex justify-between">
                                  <span className="text-muted">Market low</span>
                                  <span className="font-data text-muted">{fmt(benchmark.lowRange)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted">Market mid</span>
                                  <span className="font-data text-muted">{fmt(benchmark.midRange)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted">Market high</span>
                                  <span className="font-data text-muted">{fmt(benchmark.highRange)}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}

                    {/* Edit / Delete buttons */}
                    {editingItemId !== item.id && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEditItem(item); }}
                          className="flex items-center gap-1 px-3 py-1.5 text-[11px] border border-border rounded-[var(--radius)] text-earth hover:bg-surface-alt transition-colors"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-danger">Are you sure? This cannot be undone.</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id!); }}
                              className="px-2 py-1 text-[10px] bg-danger text-white rounded-[var(--radius)] hover:bg-danger/90 transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                              className="px-2 py-1 text-[10px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(item.id!); }}
                            className="flex items-center gap-1 px-3 py-1.5 text-[11px] border border-danger/30 rounded-[var(--radius)] text-danger hover:bg-danger/5 transition-colors"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ================================================================= */}
      {/* Education callout                                                 */}
      {/* ================================================================= */}
      <div className="mb-24 p-4 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-800 leading-relaxed">
        <p className="font-semibold mb-1">Understanding your budget</p>
        <p>
          Every financial calculation should be auditable. The estimated column shows your planned cost,
          the actual column shows what you have spent. Toggle &quot;Show typical ranges&quot; to see how your
          estimates compare to market benchmarks for {market === "USA" ? "US" : "Togolese"} residential construction.
          Each category card shows a progress bar comparing actual spend against estimates. Click a card
          to see detailed variance and market benchmark comparisons.
        </p>
      </div>

      {/* ================================================================= */}
      {/* FLOATING STICKY BAR                                               */}
      {/* ================================================================= */}
      <div className="fixed bottom-0 right-0 z-40 left-0 bg-earth/95 backdrop-blur-sm border-t border-earth-light glass budget-sticky-bar">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <div>
              <p className="text-[8px] sm:text-[9px] text-warm/60 uppercase tracking-wider">Budget</p>
              <p className="font-data text-xs sm:text-sm text-warm font-medium">{fmtCompact(project.totalBudget)}</p>
            </div>
            <div>
              <p className="text-[8px] sm:text-[9px] text-warm/60 uppercase tracking-wider">Spent</p>
              <p className="font-data text-xs sm:text-sm text-warm font-medium">{fmtCompact(project.totalSpent)}</p>
            </div>
            <div>
              <p className="text-[8px] sm:text-[9px] text-warm/60 uppercase tracking-wider">Left</p>
              <p className={`font-data text-xs sm:text-sm font-medium ${remaining >= 0 ? "text-warm" : "text-danger"}`}>
                {fmtCompact(remaining)}
              </p>
            </div>
          </div>
          <div>
            <LearnTooltip
              term="Contingency"
              explanation="A reserve fund for unexpected costs. Construction projects almost always encounter surprises. Industry standard is 10-15% of total budget. First-time builders should lean toward 15-20%."
              whyItMatters="Without contingency, a single surprise (bad soil, material price spike, design change) can stall your entire project. This fund keeps you building."
            >
              <p className="text-[8px] sm:text-[9px] text-warm/60 uppercase tracking-wider">Contingency left</p>
            </LearnTooltip>
            <p className="font-data text-xs sm:text-sm text-warm font-medium">
              {(() => {
                const contingencyItem = items.find(i => i.category.toLowerCase().includes("contingency"));
                if (!contingencyItem) return "--";
                return fmtCompact(contingencyItem.estimated - contingencyItem.actual);
              })()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
