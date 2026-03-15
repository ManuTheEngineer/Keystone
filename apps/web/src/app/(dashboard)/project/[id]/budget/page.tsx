"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import {
  subscribeToProject,
  subscribeToBudgetItems,
  type ProjectData,
  type BudgetItemData,
} from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";

function fmt(amount: number, currency: string): string {
  if (currency === "XOF") return `CFA ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

export default function BudgetPage() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [items, setItems] = useState<BudgetItemData[]>([]);

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

      <SectionLabel>Budget line items</SectionLabel>
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
