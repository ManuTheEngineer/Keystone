"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTopbar } from "../../../layout";
import {
  subscribeToProject,
  subscribeToTasks,
  updateTask,
  type ProjectData,
  type TaskData,
} from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatCard } from "@/components/ui/StatCard";
import { PhaseTracker } from "@/components/ui/PhaseTracker";
import { Badge } from "@/components/ui/Badge";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { Card } from "@/components/ui/Card";
import { MarketBadge } from "@/components/ui/MarketBadge";
import { PhaseEducationCard } from "@/components/ui/PhaseEducationCard";
import {
  getMarketData,
  getPhaseDefinition,
  getEducationForPhase,
  formatCurrencyCompact,
  PHASE_ORDER,
} from "@keystone/market-data";
import type { Market, ProjectPhase } from "@keystone/market-data";

export function OverviewClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);

  useEffect(() => {
    const unsub1 = subscribeToProject(projectId, setProject);
    const unsub2 = subscribeToTasks(projectId, setTasks);
    return () => { unsub1(); unsub2(); };
  }, [projectId]);

  useEffect(() => {
    if (project) {
      setTopbar(project.name, project.phaseName, project.currentPhase >= 5 ? "warning" : "info");
    }
  }, [project, setTopbar]);

  if (!project) {
    return <p className="text-muted text-sm">Loading project...</p>;
  }

  const market = project.market as Market;
  const marketData = getMarketData(market);
  const currentPhaseKey = PHASE_ORDER[project.currentPhase] ?? "DEFINE";
  const phaseDef = getPhaseDefinition(market, currentPhaseKey);
  const education = getEducationForPhase(market, currentPhaseKey);

  const activeTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);

  return (
    <>
      <PhaseTracker currentPhase={project.currentPhase} completedPhases={project.completedPhases} />

      {/* Phase education */}
      {education && (
        <div className="mt-3 mb-4">
          <PhaseEducationCard module={education} />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 mb-5">
        <StatCard value={`${project.progress}%`} label="Progress" />
        <StatCard
          value={formatCurrencyCompact(project.totalSpent, marketData.currency)}
          label={`Spent of ${formatCurrencyCompact(project.totalBudget, marketData.currency)}`}
        />
        <StatCard value={`Wk ${project.currentWeek}`} label={`Of est. ${project.totalWeeks}`} />
        <StatCard value={String(project.openItems)} label="Open items" />
      </div>

      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[13px] font-semibold text-earth">
          Current sub-phase: {project.subPhase}
        </h4>
      </div>

      {activeTasks.length > 0 && (
        <Card padding="sm" className="mb-5">
          {activeTasks.slice(0, 6).map((task, i) => (
            <div
              key={task.id}
              className={`flex items-center gap-2.5 py-1.5 text-[12px] ${
                i < Math.min(activeTasks.length, 6) - 1 ? "border-b border-border" : ""
              }`}
            >
              <div
                className="w-4 h-4 rounded border-[1.5px] border-border-dark shrink-0 cursor-pointer hover:border-emerald-500 transition-colors"
                onClick={() => updateTask(projectId, task.id!, { done: true, status: "done" })}
              />
              <span className="flex-1 text-muted">{task.label}</span>
              <Badge variant={task.status === "in-progress" ? "warning" : "info"}>
                {task.status === "in-progress" ? "In progress" : "Upcoming"}
              </Badge>
            </div>
          ))}
        </Card>
      )}

      {activeTasks.length === 0 && completedTasks.length === 0 && (
        <Card padding="md" className="mb-5 text-center">
          <p className="text-[12px] text-muted">No tasks yet. They will appear as your project progresses.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <div>
          <SectionLabel>Risk alerts</SectionLabel>
          <div className="space-y-1.5">
            {project.totalSpent > project.totalBudget * 0.9 && (
              <AlertBanner variant="danger">
                Budget {Math.round((project.totalSpent / project.totalBudget) * 100)}% spent with {100 - project.progress}% of work remaining
              </AlertBanner>
            )}
            {activeTasks.length > 5 && (
              <AlertBanner variant="warning">
                {activeTasks.length} open tasks -- consider prioritizing critical path items
              </AlertBanner>
            )}
            {activeTasks.length <= 5 && project.progress < 100 && (
              <AlertBanner variant="info">
                Project on track -- {activeTasks.length} active tasks remaining in current phase
              </AlertBanner>
            )}
          </div>
        </div>
        <div>
          <SectionLabel>Next milestones</SectionLabel>
          <Card padding="sm">
            <div className="space-y-0">
              {phaseDef ? (
                phaseDef.milestones
                  .filter((m) => !m.requiresInspection || m.order >= 0)
                  .slice(0, 3)
                  .map((m, i, arr) => (
                    <div key={i} className={`flex items-center gap-2 py-2 text-[11px] ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
                      <span className="w-6 text-muted font-data text-[10px] shrink-0">{m.order + 1}</span>
                      <span className="flex-1 text-muted">{m.name}</span>
                      {m.requiresInspection && (
                        <Badge variant="warning">Inspection</Badge>
                      )}
                      {m.requiresPayment && m.paymentPct && (
                        <span className="text-[9px] font-data text-muted">{m.paymentPct}%</span>
                      )}
                    </div>
                  ))
              ) : (
                [
                  { label: "Complete current sub-phase" },
                  { label: "Schedule phase inspection" },
                  { label: "Begin next sub-phase" },
                ].map((m, i) => (
                  <div key={i} className={`flex items-center gap-2 py-2 text-[11px] ${i < 2 ? "border-b border-border" : ""}`}>
                    <span className="w-12 text-muted font-data text-[10px] shrink-0">Next</span>
                    <span className="text-muted">{m.label}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <SectionLabel>Project details</SectionLabel>
          <Card padding="sm">
            <DetailRow label="Market" value={<MarketBadge market={market} />} />
            <DetailRow label="Purpose" value={project.purpose} />
            <DetailRow label="Type" value={project.propertyType} />
            {phaseDef && (
              <DetailRow label="Method" value={phaseDef.constructionMethod} />
            )}
            <DetailRow label="Details" value={project.details} last />
          </Card>
        </div>
        <div>
          <SectionLabel>Completed tasks</SectionLabel>
          <Card padding="sm">
            {completedTasks.length === 0 ? (
              <p className="text-[11px] text-muted py-2">None yet.</p>
            ) : (
              completedTasks.slice(0, 5).map((task, i) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 py-1.5 text-[11px] ${
                    i < Math.min(completedTasks.length, 5) - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded border-[1.5px] bg-success border-success shrink-0 flex items-center justify-center cursor-pointer"
                    onClick={() => updateTask(projectId, task.id!, { done: false, status: "upcoming" })}
                  >
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="flex-1 text-muted line-through opacity-40">{task.label}</span>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value, last }: { label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1.5 text-[11px] ${last ? "" : "border-b border-border"}`}>
      <span className="text-muted">{label}</span>
      <span className="text-earth font-medium">{typeof value === "string" ? value : value}</span>
    </div>
  );
}
