"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import { subscribeToProject, type ProjectData } from "@/lib/services/project-service";
import { Card } from "@/components/ui/Card";
import { PhaseEducationCard } from "@/components/ui/PhaseEducationCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import {
  getMarketData,
  getEducationForPhase,
  PHASE_ORDER,
} from "@keystone/market-data";
import type { Market, PhaseDefinition } from "@keystone/market-data";

const PHASE_COLORS = [
  "#059669", "#1B4965", "#7C3AED", "#BC6C25",
  "#9B2226", "#8B4513", "#3A3A3A", "#2D6A4F", "#6B4226",
];

export function ScheduleClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToProject(projectId, setProject);
    return unsub;
  }, [projectId]);

  useEffect(() => {
    if (project) {
      setTopbar("Schedule", `Week ${project.currentWeek} of ${project.totalWeeks}`, "info");
    }
  }, [project, setTopbar]);

  if (!project) return <p className="text-muted text-sm">Loading...</p>;

  const market = project.market as Market;
  const marketData = getMarketData(market);
  const phases = marketData.phases;

  // Build timeline from phase durations
  let cumulativeWeeks = 0;
  const schedule = phases.map((phase, i) => {
    const startWeek = cumulativeWeeks;
    const midDuration = Math.round((phase.typicalDurationWeeks.min + phase.typicalDurationWeeks.max) / 2);
    cumulativeWeeks += midDuration;
    return {
      ...phase,
      startWeek,
      endWeek: cumulativeWeeks,
      color: PHASE_COLORS[i % PHASE_COLORS.length],
    };
  });

  const totalWeeks = cumulativeWeeks;
  const currentWeekPct = totalWeeks > 0 ? (project.currentWeek / totalWeeks) * 100 : 0;

  return (
    <>
      {/* Construction method label */}
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="info">{market}</Badge>
        <span className="text-[11px] text-muted">{phases[0]?.constructionMethod ?? "Standard construction"}</span>
      </div>

      {/* Week labels */}
      <div className="flex justify-between text-[9px] text-muted mb-1.5 tracking-wide">
        {Array.from({ length: 5 }, (_, i) => {
          const week = Math.round((i / 4) * totalWeeks);
          return <span key={i}>W{week}</span>;
        })}
      </div>

      {/* Gantt chart */}
      <Card padding="sm" className="relative mb-4">
        {project.currentWeek > 0 && (
          <div
            className="absolute top-0 bottom-0 w-[1.5px] bg-danger/50 z-10"
            style={{ left: `calc(14px + ${currentWeekPct}% * 0.88)` }}
          />
        )}

        {schedule.map((item, i) => {
          const leftPct = totalWeeks > 0 ? (item.startWeek / totalWeeks) * 100 : 0;
          const widthPct = totalWeeks > 0 ? ((item.endWeek - item.startWeek) / totalWeeks) * 100 : 0;
          const isPast = item.endWeek < project.currentWeek;
          const isCurrent = item.startWeek <= project.currentWeek && item.endWeek >= project.currentWeek;

          return (
            <div
              key={i}
              className={`flex items-center gap-1.5 py-1 text-[11px] cursor-pointer hover:bg-surface-alt/50 transition-colors ${
                i < schedule.length - 1 ? "border-b border-border" : ""
              }`}
              onClick={() => setExpandedPhase(expandedPhase === item.phase ? null : item.phase)}
            >
              <span className="w-24 text-muted shrink-0 truncate">
                {item.name}
                {isCurrent && <span className="ml-1 text-[8px] text-emerald-600 font-medium">ACTIVE</span>}
              </span>
              <div className="flex-1 h-3 bg-surface-alt rounded relative overflow-hidden">
                <div
                  className="absolute h-full rounded"
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    background: item.color,
                    opacity: isPast ? 0.3 : 0.85,
                  }}
                />
              </div>
              <span className="text-[9px] text-muted font-data w-12 text-right shrink-0">
                {item.typicalDurationWeeks.min}-{item.typicalDurationWeeks.max}w
              </span>
            </div>
          );
        })}
      </Card>

      {project.currentWeek > 0 && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted mb-4">
          <div className="w-3 h-[1.5px] bg-danger" />
          Current week ({project.currentWeek})
        </div>
      )}

      {/* Phase detail when clicked */}
      {expandedPhase && (() => {
        const education = getEducationForPhase(market, expandedPhase as any);
        const phaseDef = phases.find((p) => p.phase === expandedPhase);

        return (
          <div className="mb-4 space-y-3">
            {phaseDef && (
              <Card padding="sm">
                <SectionLabel>Milestones for {phaseDef.name}</SectionLabel>
                {phaseDef.milestones.map((m, i) => (
                  <div key={i} className={`flex items-center gap-2 py-1.5 text-[11px] ${i < phaseDef.milestones.length - 1 ? "border-b border-border" : ""}`}>
                    <span className="w-6 text-muted font-data text-[10px] shrink-0">{m.order + 1}</span>
                    <span className="flex-1 text-muted">{m.name}</span>
                    {m.requiresInspection && <Badge variant="warning">Inspection</Badge>}
                    {m.requiresPayment && m.paymentPct && (
                      <span className="text-[9px] font-data text-info">{m.paymentPct}% draw</span>
                    )}
                  </div>
                ))}
              </Card>
            )}
            {education && <PhaseEducationCard module={education} />}
          </div>
        );
      })()}

      <div className="p-4 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-800 leading-relaxed">
        <p className="font-semibold mb-1">Understanding your construction timeline</p>
        <p>
          This Gantt chart shows each construction phase as a horizontal bar based on typical durations
          for {market === "USA" ? "US wood-frame" : "Togolese reinforced concrete"} construction. Click any phase
          to see its milestones and educational content. The red vertical line marks the current week.
          Faded bars represent completed phases. Duration ranges shown on the right indicate typical
          min-max weeks for each phase.
        </p>
      </div>
    </>
  );
}
