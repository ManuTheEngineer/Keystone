"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import {
  subscribeToProject,
  subscribeToBudgetItems,
  addBudgetItem,
  type ProjectData,
  type BudgetItemData,
} from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";
import { CostRangeBar } from "@/components/ui/CostRangeBar";
import { Plus, Download } from "lucide-react";
import {
  getMarketData,
  getCostBenchmarks,
  formatCurrency,
  formatCurrencyCompact,
} from "@keystone/market-data";
import type { Market, PropertyType, CostBenchmark } from "@keystone/market-data";

export function BudgetClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [items, setItems] = useState<BudgetItemData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(false);
  const [category, setCategory] = useState("");
  const [estimated, setEstimated] = useState("");
  const [actual, setActual] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingBenchmarks, setLoadingBenchmarks] = useState(false);

  useEffect(() => {
    const unsub1 = subscribeToProject(projectId, setProject);
    const unsub2 = subscribeToBudgetItems(projectId, setItems);
    return () => { unsub1(); unsub2(); };
  }, [projectId]);

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
  const variance = project.totalBudget > 0
    ? (((project.totalSpent - project.totalBudget) / project.totalBudget) * 100).toFixed(1)
    : "0";

  function findBenchmark(cat: string): CostBenchmark | undefined {
    return benchmarks.find(
      (b) => b.category.toLowerCase().includes(cat.toLowerCase()) ||
             cat.toLowerCase().includes(b.category.toLowerCase().split(" ")[0])
    );
  }

  async function handleSave() {
    if (!category.trim() || !estimated.trim()) return;
    setSaving(true);
    try {
      await addBudgetItem({
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
    setLoadingBenchmarks(true);
    try {
      for (const bm of benchmarks.filter((b) => b.unit !== "lump")) {
        const exists = items.some(
          (item) => item.category.toLowerCase() === bm.category.toLowerCase()
        );
        if (!exists) {
          await addBudgetItem({
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

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <StatCard value={fmtCompact(project.totalBudget)} label="Total budget" />
        <StatCard value={fmtCompact(project.totalSpent)} label="Spent to date" />
        <StatCard value={fmtCompact(remaining)} label="Remaining" />
        <StatCard value={`${variance}%`} label="Variance" />
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[9px] text-muted mb-1">
          <span>Budget utilization</span>
          <span className="font-data">{project.totalBudget > 0 ? Math.round((project.totalSpent / project.totalBudget) * 100) : 0}%</span>
        </div>
        <ProgressBar
          value={project.totalBudget > 0 ? Math.round((project.totalSpent / project.totalBudget) * 100) : 0}
          color={project.totalSpent > project.totalBudget * 0.9 ? "var(--color-danger)" : "var(--color-success)"}
        />
      </div>

      {/* Market benchmarks toggle */}
      {items.length === 0 && benchmarks.length > 0 && (
        <Card padding="md" className="mb-4 text-center">
          <p className="text-[12px] text-earth font-medium mb-1">Start with market benchmarks?</p>
          <p className="text-[11px] text-muted mb-3">
            Pre-fill your budget with typical {market === "USA" ? "per-sqft" : "per-sqm"} cost ranges for {market === "USA" ? "US" : "Togo"} residential construction.
          </p>
          <button
            onClick={handleLoadBenchmarks}
            disabled={loadingBenchmarks}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
          >
            <Download size={14} />
            {loadingBenchmarks ? "Loading..." : "Load market benchmarks"}
          </button>
        </Card>
      )}

      <div className="flex items-center justify-between mb-2">
        <SectionLabel>Budget line items</SectionLabel>
        <div className="flex items-center gap-2">
          {items.length > 0 && benchmarks.length > 0 && (
            <button
              onClick={() => setShowBenchmarks((p) => !p)}
              className="text-[10px] text-info hover:underline cursor-pointer"
            >
              {showBenchmarks ? "Hide ranges" : "Show typical ranges"}
            </button>
          )}
          <span
            className="flex items-center gap-1 text-[11px] text-info hover:underline cursor-pointer"
            onClick={() => setShowForm(true)}
          >
            <Plus size={12} /> Add item
          </span>
        </div>
      </div>

      {showForm && (
        <Card padding="md" className="mb-3">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-muted font-medium mb-1">Category *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Foundation, Framing"
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-muted font-medium mb-1">Estimated ({marketData.currency.code})</label>
                <input
                  type="number"
                  value={estimated}
                  onChange={(e) => setEstimated(e.target.value)}
                  placeholder="0"
                  className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full font-data"
                />
              </div>
              <div>
                <label className="block text-[11px] text-muted font-medium mb-1">Actual ({marketData.currency.code})</label>
                <input
                  type="number"
                  value={actual}
                  onChange={(e) => setActual(e.target.value)}
                  placeholder="0"
                  className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full font-data"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={saving || !category.trim() || !estimated.trim()}
                className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-[12px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {items.length === 0 && !showForm ? (
        <Card padding="md" className="text-center">
          <p className="text-[12px] text-muted">No budget items yet. Add line items or load market benchmarks to get started.</p>
        </Card>
      ) : (
        <Card padding="sm">
          {items.map((item, i) => {
            const benchmark = findBenchmark(item.category);
            const statusColor = item.status === "over" ? "text-danger" : item.status === "on-track" ? "text-success" : "text-muted";

            return (
              <div
                key={item.id}
                className={`py-2.5 ${i < items.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-earth">{item.category}</span>
                  <span className={`text-[10px] font-medium ${statusColor}`}>
                    {item.status === "over" ? "Over budget" : item.status === "on-track" ? "On track" : item.status === "under" ? "Under budget" : "Not started"}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-[11px] font-data">
                  <span className="text-muted">Est: {fmt(item.estimated)}</span>
                  <span className="text-earth">Actual: {fmt(item.actual)}</span>
                  {item.actual > 0 && (
                    <span className={item.actual > item.estimated ? "text-danger" : "text-success"}>
                      {item.actual > item.estimated ? "+" : ""}{fmt(item.actual - item.estimated)}
                    </span>
                  )}
                </div>
                {showBenchmarks && benchmark && (
                  <div className="mt-2">
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
              </div>
            );
          })}
        </Card>
      )}

      <div className="mt-4 p-4 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-800 leading-relaxed">
        <p className="font-semibold mb-1">Understanding your budget</p>
        <p>
          Every financial calculation should be auditable. The estimated column shows your planned cost,
          the actual column shows what you have spent. Toggle &quot;Show typical ranges&quot; to see how your
          estimates compare to market benchmarks for {market === "USA" ? "US" : "Togolese"} residential construction.
          The low-mid-high range bar shows where your estimate falls relative to typical costs{market === "USA" ? " per square foot" : " per square meter"}.
        </p>
      </div>
    </>
  );
}
