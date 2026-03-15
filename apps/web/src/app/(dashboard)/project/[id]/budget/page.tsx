"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import { getProject, ROBINSON_BUDGET } from "@/lib/data/mock-projects";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";

export default function BudgetPage() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const project = getProject(params.id as string);

  useEffect(() => {
    if (project) {
      setTopbar("Budget", `${project.totalSpent} / ${project.totalBudget}`, "success");
    }
  }, [project, setTopbar]);

  if (!project) return <p className="text-muted text-sm">Project not found.</p>;

  return (
    <>
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <StatCard value={project.totalBudget} label="Total budget" />
        <StatCard value={project.totalSpent} label="Spent to date" />
        <StatCard value={project.remaining} label="Remaining" />
        <StatCard value={project.variance} label="Variance" valueClassName="text-success" />
      </div>

      {/* Line items table */}
      <SectionLabel>Budget line items</SectionLabel>
      <Card padding="sm">
        {/* Header row */}
        <div className="flex items-center py-1.5 pb-2 mb-1 border-b-2 border-border-dark text-[10px] text-muted font-medium">
          <span className="flex-1">Category</span>
          <span className="w-16 text-right">Est.</span>
          <span className="w-16 text-right">Actual</span>
          <span className="w-[70px] ml-2" />
        </div>

        {ROBINSON_BUDGET.map((item, i) => {
          const pct = item.estimated > 0 ? Math.min((item.actual / item.estimated) * 100, 120) : 0;
          const isOver = item.actual > item.estimated;
          const barColor = isOver
            ? "var(--color-warning)"
            : item.status === "not-started"
              ? "var(--color-border)"
              : "var(--color-success)";
          const textColor =
            item.status === "on-track"
              ? "text-success"
              : item.status === "over"
                ? "text-warning"
                : item.status === "under"
                  ? "text-info"
                  : "text-muted";

          return (
            <div
              key={i}
              className={`flex items-center py-1.5 text-[12px] ${
                i < ROBINSON_BUDGET.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="flex-1 text-muted">{item.category}</span>
              <span className="w-16 text-right font-data text-[11px] text-muted">
                ${item.estimated}K
              </span>
              <span className={`w-16 text-right font-data text-[11px] ${textColor}`}>
                ${item.actual}K
              </span>
              <div className="w-[70px] ml-2">
                <ProgressBar
                  value={Math.min(pct, 100)}
                  color={barColor}
                  height={5}
                />
              </div>
            </div>
          );
        })}
      </Card>

      {/* Educational callout */}
      <div className="mt-5 p-4 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-800 leading-relaxed">
        <p className="font-semibold mb-1">How to read your budget tracker</p>
        <p>
          Each line item shows the estimated cost versus actual spending. The progress bar fills
          green when spending is on track, and turns amber when actual costs exceed the estimate.
          A healthy project typically stays within 5% of estimates. Your 15% contingency
          buffer absorbs unexpected costs without impacting the total budget.
        </p>
      </div>
    </>
  );
}
