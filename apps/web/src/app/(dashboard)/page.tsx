"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTopbar } from "./layout";
import { PROJECTS } from "@/lib/data/mock-projects";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AlertBanner } from "@/components/ui/AlertBanner";

export default function DashboardPage() {
  const { setTopbar } = useTopbar();

  useEffect(() => {
    setTopbar("Dashboard", "2 projects", "success");
  }, [setTopbar]);

  return (
    <>
      <SectionLabel>Your projects</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {PROJECTS.map((p) => (
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
              <span>Budget: {p.totalBudget}</span>
              <span>Spent: {p.totalSpent}</span>
              <span>{p.duration}</span>
            </div>
          </Link>
        ))}
      </div>

      <SectionLabel>Recent activity</SectionLabel>
      <div className="space-y-1.5 mb-5">
        <AlertBanner variant="success">
          Framing inspection passed -- Robinson residence (2 hrs ago)
        </AlertBanner>
        <AlertBanner variant="warning">
          Interior finishes trending 8% over estimate -- review recommended
        </AlertBanner>
        <AlertBanner variant="info">
          Lome duplex: titre foncier verified at DCCFE. Proceed to offer.
        </AlertBanner>
      </div>
    </>
  );
}
