"use client";

import { useState, useEffect } from "react";
import { Card } from "./Card";
import { SectionLabel } from "./SectionLabel";
import {
  advanceProjectPhase,
  subscribeToMilestoneProgress,
  toggleMilestoneProgress,
  type ProjectData,
  type TaskData,
} from "@/lib/services/project-service";
import {
  getPhaseDefinition,
  PHASE_ORDER,
  PHASE_NAMES,
} from "@keystone/market-data";
import type { Market } from "@keystone/market-data";
import { ChevronRight, Check, AlertTriangle, ShieldCheck } from "lucide-react";

interface PhaseAdvancementProps {
  project: ProjectData;
  userId: string;
  tasks: TaskData[];
  onAdvance: () => void;
}

export function PhaseAdvancement({ project, userId, tasks, onAdvance }: PhaseAdvancementProps) {
  const market = project.market as Market;
  const currentPhaseIndex = project.currentPhase;
  const currentPhaseKey = PHASE_ORDER[currentPhaseIndex];
  const phaseDef = getPhaseDefinition(market, currentPhaseKey);

  const [firebaseProgress, setFirebaseProgress] = useState<boolean[]>([]);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    if (!project.id) return;
    const unsub = subscribeToMilestoneProgress(
      userId, project.id, currentPhaseKey,
      (progress) => setFirebaseProgress(progress)
    );
    return unsub;
  }, [userId, project.id, currentPhaseKey]);

  if (!phaseDef) return null;

  const isLastPhase = currentPhaseIndex >= PHASE_ORDER.length - 1;
  const nextPhaseKey = !isLastPhase ? PHASE_ORDER[currentPhaseIndex + 1] : null;
  const nextPhaseName = nextPhaseKey ? PHASE_NAMES[nextPhaseKey] : null;

  const milestones = phaseDef.milestones;
  const phaseTasks = tasks.filter((t) => t.phase === currentPhaseIndex || t.phase == null);

  // Derive milestone completion from task status (primary) + Firebase (fallback)
  const nonPendingTasks = phaseTasks.filter((t) => t.status !== "pending-review");
  const milestoneCompleted = milestones.map((_, i) => {
    // First check task-based completion (source of truth)
    const hasIdx = nonPendingTasks.some((t) => t.milestoneIndex != null);
    let milestoneTasks: TaskData[];
    if (hasIdx) {
      milestoneTasks = nonPendingTasks.filter((t) => t.milestoneIndex === i);
    } else {
      const sorted = [...nonPendingTasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const perMs = Math.max(1, Math.ceil(sorted.length / milestones.length));
      milestoneTasks = sorted.slice(i * perMs, (i + 1) * perMs);
    }
    const tasksDone = milestoneTasks.length > 0 && milestoneTasks.every((t) => t.done || t.status === "cancelled");
    // Use task status OR Firebase progress (whichever says complete)
    return tasksDone || firebaseProgress[i] === true;
  });

  const checkedCount = milestoneCompleted.filter(Boolean).length;
  const allMilestonesChecked = milestones.length > 0 && checkedCount >= milestones.length;
  const incompleteTasks = phaseTasks.filter((t) => !t.done && t.status !== "cancelled");
  const allTasksDone = incompleteTasks.length === 0;
  const canAdvance = allMilestonesChecked && allTasksDone;

  // Auto-sync Firebase
  useEffect(() => {
    if (!project.id) return;
    milestoneCompleted.forEach((completed, i) => {
      if (completed && !firebaseProgress[i]) {
        toggleMilestoneProgress(userId, project.id!, currentPhaseKey, i, true, milestones.length).catch(() => {});
      }
    });
  }, [milestoneCompleted.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdvance() {
    if (!nextPhaseKey || advancing || !canAdvance) return;
    setAdvancing(true);
    try {
      const newPhase = currentPhaseIndex + 1;
      const phaseName = `Phase ${newPhase}: ${PHASE_NAMES[nextPhaseKey]}`;
      await advanceProjectPhase(userId, project.id!, newPhase, phaseName);
      onAdvance();
    } finally {
      setAdvancing(false);
    }
  }

  // Don't render if last phase and everything complete
  if (isLastPhase && allMilestonesChecked && allTasksDone) {
    return (
      <div className="mt-4 mb-5">
        <Card padding="sm" className="border-l-[3px] border-l-success bg-success/3">
          <div className="flex items-center gap-2 text-[12px] text-success font-medium py-1">
            <Check size={16} />
            All phases complete
          </div>
        </Card>
      </div>
    );
  }

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-4 mb-5">
      {canAdvance ? (
        <button
          onClick={handleAdvance}
          disabled={advancing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[13px] font-medium rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
        >
          {advancing ? (
            "Advancing..."
          ) : (
            <>
              <ShieldCheck size={16} />
              Advance to {nextPhaseName}
              <ChevronRight size={14} />
            </>
          )}
        </button>
      ) : (
        <div className="rounded-xl border border-border/40 overflow-hidden">
          {/* Gate header — clickable to expand */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-warm/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-clay/50" />
              <span className="text-[12px] font-medium text-earth">Advance to {nextPhaseName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-data text-muted">
                {checkedCount}/{milestones.length}
              </span>
              <div className="w-12 h-1 bg-sand/30 rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full transition-all" style={{ width: `${milestones.length > 0 ? (checkedCount / milestones.length) * 100 : 0}%` }} />
              </div>
              <ChevronRight size={12} className={`text-muted/40 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </div>
          </button>

          {/* Expanded — milestone checklist */}
          {expanded && (
            <div className="border-t border-border/20 px-4 py-2">
              {milestones.map((ms, i) => {
                const done = milestoneCompleted[i];
                return (
                  <div key={i} className="flex items-center gap-2 py-1.5">
                    <div className={`w-3 h-3 rounded-[3px] border-[1.5px] shrink-0 flex items-center justify-center ${
                      done ? "bg-success/20 border-success/40" : "border-sand"
                    }`}>
                      {done && <Check size={8} className="text-success" />}
                    </div>
                    <span className={`text-[11px] flex-1 ${done ? "text-muted line-through" : "text-earth"}`}>{ms.name}</span>
                  </div>
                );
              })}
              {incompleteTasks.length > 0 && (
                <p className="text-[10px] text-muted/50 pt-1 mt-1 border-t border-border/10">
                  {incompleteTasks.length} task{incompleteTasks.length !== 1 ? "s" : ""} remaining
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
