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

  // Derive milestone completion from task status
  const milestoneCompleted = milestones.map((_, i) => {
    if (firebaseProgress[i]) return true;
    const hasIdx = phaseTasks.some((t) => t.milestoneIndex != null);
    let milestoneTasks: TaskData[];
    if (hasIdx) {
      milestoneTasks = phaseTasks.filter((t) => t.milestoneIndex === i);
    } else {
      const sorted = [...phaseTasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const perMs = Math.max(1, Math.ceil(sorted.length / milestones.length));
      milestoneTasks = sorted.slice(i * perMs, (i + 1) * perMs);
    }
    return milestoneTasks.length > 0 && milestoneTasks.every((t) => t.done || t.status === "cancelled");
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
              All milestones complete — Advance to {nextPhaseName}
              <ChevronRight size={14} />
            </>
          )}
        </button>
      ) : (
        <Card padding="sm" className="border-l-[3px] border-l-warning/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-muted" />
              <span className="text-[12px] text-muted">Phase Gate</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              {!allMilestonesChecked && (
                <span className="flex items-center gap-1 text-warning">
                  <AlertTriangle size={10} />
                  {milestones.length - checkedCount} milestone{milestones.length - checkedCount !== 1 ? "s" : ""}
                </span>
              )}
              {!allTasksDone && (
                <span className="flex items-center gap-1 text-warning">
                  <AlertTriangle size={10} />
                  {incompleteTasks.length} task{incompleteTasks.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
