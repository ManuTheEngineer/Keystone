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
import { Plus, Zap } from "lucide-react";
import { getCostBenchmark, generateBudgetEstimate, formatCostPerUnit, formatMultiplier } from "@/lib/data/costs";
import { getStateName } from "@/lib/data/geo";
import { updateProject } from "@/lib/services/project-service";

function fmt(amount: number, currency: string): string {
  if (currency === "XOF") return `CFA ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

export function BudgetClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [items, setItems] = useState<BudgetItemData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("");
  const [estimated, setEstimated] = useState("");
  const [actual, setActual] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const unsub1 = subscribeToProject(projectId, setProject);
    const unsub2 = subscribeToBudgetItems(projectId, setItems);
    return () => { unsub1(); unsub2(); };
  }, [projectId]);

  useEffect(() => {
    if (project) {
      setTopbar("Budget", `${fmt(project.totalSpent, project.currency)} / ${fmt(project.totalBudget, project.currency)}`, "success");
    }
  }, [project, setTopbar]);

  if (!project) return <p className="text-muted text-sm">Loading...</p>;

  const remaining = project.totalBudget - project.totalSpent;
  const variance = project.totalBudget > 0
    ? (((project.totalSpent - project.totalBudget) / project.totalBudget) * 100).toFixed(1)
    : "0";

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <StatCard value={fmt(project.totalBudget, project.currency)} label="Total budget" />
        <StatCard value={fmt(project.totalSpent, project.currency)} label="Spent to date" />
        <StatCard value={fmt(remaining, project.currency)} label="Remaining" />
        <StatCard value={`${variance}%`} label="Variance" valueClassName={Number(variance) <= 0 ? "text-success" : "text-warning"} />
      </div>

      {/* Regional cost benchmark */}
      {project.state && (() => {
        const benchmark = getCostBenchmark(project.market, project.state);
        if (!benchmark) return null;
        const regionLabel = getStateName(project.market, project.state);
        const estimate = generateBudgetEstimate(project.market, project.state, project.sizeRange);
        return (
          <div className="mb-5 p-4 rounded-[var(--radius)] border border-emerald-200 bg-emerald-50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold text-emerald-800 mb-1">
                  Regional cost benchmark: {regionLabel}
                  {project.city ? `, ${project.city}` : ""}
                </p>
                <p className="text-[13px] text-emerald-700 font-data font-semibold">
                  {formatCostPerUnit(benchmark)}
                </p>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  {formatMultiplier(benchmark.multiplier)}
                  {estimate ? ` — Est. total: ${fmt(estimate.totalEstimate, project.currency)} for ${project.sizeRange} build` : ""}
                </p>
                <p className="text-[10px] text-muted mt-1">
                  Source: {benchmark.source} ({benchmark.lastUpdated})
                </p>
              </div>
              {estimate && items.length === 0 && (
                <button
                  type="button"
                  disabled={generating}
                  onClick={async () => {
                    if (!estimate) return;
                    setGenerating(true);
                    try {
                      for (const item of estimate.items) {
                        await addBudgetItem({
                          projectId,
                          category: item.category,
                          estimated: item.estimated,
                          actual: 0,
                          status: "not-started",
                        });
                      }
                      await updateProject(projectId, {
                        totalBudget: estimate.totalEstimate,
                      });
                    } finally {
                      setGenerating(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium bg-emerald-600 text-white rounded-[var(--radius)] hover:bg-emerald-700 transition-colors disabled:opacity-40 shrink-0"
                >
                  <Zap size={12} />
                  {generating ? "Generating..." : "Generate budget"}
                </button>
              )}
            </div>
            <p className="text-[10px] text-emerald-700/70 mt-2 leading-relaxed">
              These are regional averages for standard-finish residential construction.
              Your actual costs will vary based on materials, contractor rates, and project complexity.
              Use this as a starting point and adjust line items as you get real bids.
            </p>
          </div>
        );
      })()}

      <div className="flex items-center justify-between mb-0">
        <SectionLabel>Budget line items</SectionLabel>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 text-[11px] text-info hover:underline cursor-pointer"
        >
          <Plus size={14} />
          Add item
        </button>
      </div>

      {showForm && (
        <Card padding="md" className="mb-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-muted font-medium mb-1 block">Category</label>
              <input
                type="text"
                placeholder="e.g. Framing, Plumbing"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted font-medium mb-1 block">Estimated cost</label>
              <input
                type="number"
                placeholder="0"
                value={estimated}
                onChange={(e) => setEstimated(e.target.value)}
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted font-medium mb-1 block">Actual cost</label>
              <input
                type="number"
                placeholder="0"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                if (!category.trim() || Number(estimated) <= 0) return;
                setSaving(true);
                try {
                  await addBudgetItem({
                    projectId,
                    category: category.trim(),
                    estimated: Number(estimated),
                    actual: Number(actual),
                    status:
                      Number(actual) > Number(estimated)
                        ? "over"
                        : Number(actual) > 0
                          ? "on-track"
                          : "not-started",
                  });
                  setCategory("");
                  setEstimated("");
                  setActual("");
                  setShowForm(false);
                } finally {
                  setSaving(false);
                }
              }}
              className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setCategory("");
                setEstimated("");
                setActual("");
              }}
              className="px-4 py-2 text-[12px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}
      {items.length === 0 ? (
        <Card padding="md" className="text-center">
          <p className="text-[12px] text-muted">No budget items yet. They will populate as you plan your project.</p>
        </Card>
      ) : (
        <Card padding="sm">
          <div className="flex items-center py-1.5 pb-2 mb-1 border-b-2 border-border-dark text-[10px] text-muted font-medium">
            <span className="flex-1">Category</span>
            <span className="w-16 text-right">Est.</span>
            <span className="w-16 text-right">Actual</span>
            <span className="w-[70px] ml-2" />
          </div>
          {items.map((item, i) => {
            const pct = item.estimated > 0 ? Math.min((item.actual / item.estimated) * 100, 120) : 0;
            const isOver = item.actual > item.estimated;
            const barColor = isOver ? "var(--color-warning)" : item.status === "not-started" ? "var(--color-border)" : "var(--color-success)";
            const textColor = item.status === "on-track" ? "text-success" : item.status === "over" ? "text-warning" : item.status === "under" ? "text-info" : "text-muted";

            const formatItem = (v: number) => {
              if (project.currency === "XOF") return `${(v / 1000).toFixed(0)}K`;
              return `$${(v / 1000).toFixed(1)}K`;
            };

            return (
              <div key={item.id ?? i} className={`flex items-center py-1.5 text-[12px] ${i < items.length - 1 ? "border-b border-border" : ""}`}>
                <span className="flex-1 text-muted">{item.category}</span>
                <span className="w-16 text-right font-data text-[11px] text-muted">{formatItem(item.estimated)}</span>
                <span className={`w-16 text-right font-data text-[11px] ${textColor}`}>{formatItem(item.actual)}</span>
                <div className="w-[70px] ml-2">
                  <ProgressBar value={Math.min(pct, 100)} color={barColor} height={5} />
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <div className="mt-5 p-4 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-800 leading-relaxed">
        <p className="font-semibold mb-1">How to read your budget tracker</p>
        <p>
          Each line item shows the estimated cost versus actual spending. The progress bar fills
          green when spending is on track, and turns amber when actual costs exceed the estimate.
          A healthy project typically stays within 5% of estimates. Your contingency
          buffer absorbs unexpected costs without impacting the total budget.
        </p>
      </div>
    </>
  );
}
