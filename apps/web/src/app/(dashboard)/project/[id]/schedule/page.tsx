"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import { subscribeToProject, type ProjectData } from "@/lib/services/project-service";
import { Card } from "@/components/ui/Card";

// Default schedule phases (will be customizable per project in a future update)
const DEFAULT_SCHEDULE = [
  { name: "Site prep", startWeek: 0, endWeek: 8, color: "#059669" },
  { name: "Foundation", startWeek: 3, endWeek: 14, color: "#1B4965" },
  { name: "Framing", startWeek: 8, endWeek: 20, color: "#7C3AED" },
  { name: "Envelope", startWeek: 14, endWeek: 26, color: "#9B2226" },
  { name: "Rough-in", startWeek: 20, endWeek: 30, color: "#BC6C25" },
  { name: "Insul./drywall", startWeek: 26, endWeek: 33, color: "#059669" },
  { name: "Int. finishes", startWeek: 30, endWeek: 37, color: "#8B4513" },
  { name: "Exterior", startWeek: 34, endWeek: 38, color: "#3A3A3A" },
];

const TOTAL_WEEKS = 38;

export default function SchedulePage() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);

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

  const currentWeekPct = project.totalWeeks > 0 ? (project.currentWeek / TOTAL_WEEKS) * 100 : 0;

  return (
    <>
      <div className="flex justify-between text-[9px] text-muted mb-1.5 tracking-wide">
        {["W1", "", "W9", "", "W17", "", "W25", "", "W33", "W37"].map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>

      <Card padding="sm" className="relative mb-4">
        {project.currentWeek > 0 && (
          <div
            className="absolute top-0 bottom-0 w-[1.5px] bg-danger/50 z-10"
            style={{ left: `calc(14px + ${currentWeekPct}% * 0.88)` }}
          />
        )}

        {DEFAULT_SCHEDULE.map((item, i) => {
          const leftPct = (item.startWeek / TOTAL_WEEKS) * 100;
          const widthPct = ((item.endWeek - item.startWeek) / TOTAL_WEEKS) * 100;
          const isPast = item.endWeek < project.currentWeek;

          return (
            <div
              key={i}
              className={`flex items-center gap-1.5 py-1 text-[11px] ${
                i < DEFAULT_SCHEDULE.length - 1 ? "border-b border-border" : ""
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

      {project.currentWeek > 0 && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted">
          <div className="w-3 h-[1.5px] bg-danger" />
          Current week ({project.currentWeek})
        </div>
      )}

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
