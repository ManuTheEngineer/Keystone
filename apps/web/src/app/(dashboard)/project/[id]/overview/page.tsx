"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTopbar } from "../../../layout";
import { getProject, ROBINSON_TASKS } from "@/lib/data/mock-projects";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatCard } from "@/components/ui/StatCard";
import { PhaseTracker } from "@/components/ui/PhaseTracker";
import { Badge } from "@/components/ui/Badge";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { Card } from "@/components/ui/Card";

export default function OverviewPage() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const project = getProject(params.id as string);

  useEffect(() => {
    if (project) {
      setTopbar(project.name, project.phaseName, project.currentPhase >= 5 ? "warning" : "info");
    }
  }, [project, setTopbar]);

  if (!project) {
    return <p className="text-muted text-sm">Project not found.</p>;
  }

  return (
    <>
      {/* Phase tracker */}
      <PhaseTracker currentPhase={project.currentPhase} completedPhases={project.completedPhases} />

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 mb-5">
        <StatCard value={`${project.progress}%`} label="Progress" />
        <StatCard value={project.totalSpent} label={`Spent of ${project.totalBudget}`} />
        <StatCard value={`Wk ${project.currentWeek}`} label={`Of est. ${project.totalWeeks}`} />
        <StatCard value={String(project.openItems)} label="Open items" />
      </div>

      {/* Current sub-phase */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[13px] font-semibold text-earth">
          Current sub-phase: {project.subPhase}
        </h4>
        <Link href={`/project/${project.id}/overview`} className="text-[10px] text-info hover:underline">
          All tasks
        </Link>
      </div>

      <Card padding="sm" className="mb-5">
        {ROBINSON_TASKS.active.slice(0, 4).map((task, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 py-1.5 text-[12px] ${
              i < ROBINSON_TASKS.active.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div
              className={`w-4 h-4 rounded border-[1.5px] shrink-0 flex items-center justify-center ${
                task.done ? "bg-success border-success" : "border-border-dark"
              }`}
            >
              {task.done && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className={`flex-1 ${task.done ? "line-through opacity-30" : "text-muted"}`}>
              {task.label}
            </span>
            <Badge variant={task.status === "in-progress" ? "warning" : task.status === "done" ? "success" : "info"}>
              {task.status === "in-progress" ? "In progress" : task.status === "done" ? "Done" : "Upcoming"}
            </Badge>
          </div>
        ))}
      </Card>

      {/* Two-column: Risks + Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <SectionLabel>Risk alerts</SectionLabel>
          <div className="space-y-1.5">
            <AlertBanner variant="warning">
              Interior finishes trending 8% over
            </AlertBanner>
            <AlertBanner variant="info">
              Rain forecast Thu-Fri
            </AlertBanner>
          </div>
        </div>
        <div>
          <SectionLabel>Next milestones</SectionLabel>
          <Card padding="sm">
            <MilestoneRow date="Mar 22" label="Mechanical rough-in inspection" />
            <MilestoneRow date="Mar 24" label="Draw request #5 to lender" />
            <MilestoneRow date="Mar 29" label="Insulation contractor starts" last />
          </Card>
        </div>
      </div>
    </>
  );
}

function MilestoneRow({ date, label, last }: { date: string; label: string; last?: boolean }) {
  return (
    <div className={`text-[11px] text-muted py-1.5 ${last ? "" : "border-b border-border"}`}>
      <span className="font-data text-[10px] text-muted/60 mr-1.5">{date}</span>
      {label}
    </div>
  );
}
