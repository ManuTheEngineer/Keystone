"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import { getProject, ROBINSON_SCHEDULE } from "@/lib/data/mock-projects";
import { Card } from "@/components/ui/Card";

const TOTAL_WEEKS = 38;

export default function SchedulePage() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const project = getProject(params.id as string);

  useEffect(() => {
    if (project) {
      setTopbar("Schedule", `Week ${project.currentWeek} of ${project.totalWeeks}`, "info");
    }
  }, [project, setTopbar]);

  if (!project) return <p className="text-muted text-sm">Project not found.</p>;

  const currentWeekPct = (project.currentWeek / TOTAL_WEEKS) * 100;

  return (
    <>
      {/* Week markers */}
      <div className="flex justify-between text-[9px] text-muted mb-1.5 tracking-wide">
        {["W1", "", "W9", "", "W17", "", "W25", "", "W33", "W37"].map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>

      {/* Gantt chart */}
      <Card padding="sm" className="relative mb-4">
        {/* Current week indicator line */}
        <div
          className="absolute top-0 bottom-0 w-[1.5px] bg-danger/50 z-10"
          style={{ left: `calc(14px + ${currentWeekPct}% * 0.88)` }}
        />

        {ROBINSON_SCHEDULE.map((item, i) => {
          const leftPct = (item.startWeek / TOTAL_WEEKS) * 100;
          const widthPct = ((item.endWeek - item.startWeek) / TOTAL_WEEKS) * 100;
          const isPast = item.endWeek < project.currentWeek;

          return (
            <div
              key={i}
              className={`flex items-center gap-1.5 py-1 text-[11px] ${
                i < ROBINSON_SCHEDULE.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="w-24 text-muted shrink-0 truncate">{item.name}</span>
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
            </div>
          );
        })}
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-1.5 text-[10px] text-muted">
        <div className="w-3 h-[1.5px] bg-danger" />
        Current week ({project.currentWeek})
      </div>

      {/* Educational callout */}
      <div className="mt-5 p-4 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-800 leading-relaxed">
        <p className="font-semibold mb-1">Understanding your construction timeline</p>
        <p>
          This Gantt chart shows each construction phase as a horizontal bar. Overlapping bars mean
          multiple trades are working simultaneously. The red vertical line marks the current week.
          Faded bars represent completed phases. If a bar extends past the red line, that phase is
          still in progress.
        </p>
      </div>
    </>
  );
}
