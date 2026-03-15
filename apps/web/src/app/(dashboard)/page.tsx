"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTopbar, useDashboard } from "./layout";
import { useAuth } from "@/components/auth/AuthProvider";
import { subscribeToUserProjects, type ProjectData } from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AlertBanner } from "@/components/ui/AlertBanner";

function formatCurrency(amount: number, currency: string): string {
  if (currency === "XOF") {
    return `CFA ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export default function DashboardPage() {
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserProjects(user.uid, (data) => {
      setProjects(data);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    setTopbar("Dashboard", `${projects.length} project${projects.length !== 1 ? "s" : ""}`, "success");
  }, [setTopbar, projects.length]);

  return (
    <>
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
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/project/${p.id}/overview`}
              className="bg-surface border border-border rounded-[var(--radius)] p-4 cursor-pointer hover:shadow-[var(--shadow-md)] transition-shadow block"
            >
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-[14px] font-semibold text-earth">{p.name}</h4>
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
                <span>Budget: {formatCurrency(p.totalBudget, p.currency)}</span>
                <span>Spent: {formatCurrency(p.totalSpent, p.currency)}</span>
                <span>Wk {p.currentWeek}/{p.totalWeeks}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <SectionLabel>Quick actions</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Link href="/new-project" className="bg-surface border border-border rounded-[var(--radius)] p-3 text-left hover:border-emerald-400 hover:shadow-[var(--shadow-sm)] transition-all group block">
          <div className="text-[12px] font-medium text-earth group-hover:text-emerald-700 transition-colors">New project</div>
          <div className="text-[9px] text-muted mt-0.5">Start a new build</div>
        </Link>
        <Link href="/learn" className="bg-surface border border-border rounded-[var(--radius)] p-3 text-left hover:border-emerald-400 hover:shadow-[var(--shadow-sm)] transition-all group block">
          <div className="text-[12px] font-medium text-earth group-hover:text-emerald-700 transition-colors">Learn</div>
          <div className="text-[9px] text-muted mt-0.5">Construction knowledge</div>
        </Link>
      </div>
    </>
  );
}
