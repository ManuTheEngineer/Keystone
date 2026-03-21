"use client";

import { useState, useEffect, useCallback } from "react";
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
import { ChevronRight, Check, AlertTriangle } from "lucide-react";

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

  const [milestoneProgress, setMilestoneProgress] = useState<boolean[]>([]);
  const [advancing, setAdvancing] = useState(false);

  // Subscribe to milestone progress from Firebase (shared with Schedule page)
  useEffect(() => {
    if (!project.id) return;
    const unsub = subscribeToMilestoneProgress(
      userId, project.id, currentPhaseKey,
      (progress) => setMilestoneProgress(progress)
    );
    return unsub;
  }, [userId, project.id, currentPhaseKey]);

  if (!phaseDef) return null;

  const isLastPhase = currentPhaseIndex >= PHASE_ORDER.length - 1;
  const nextPhaseKey = !isLastPhase ? PHASE_ORDER[currentPhaseIndex + 1] : null;
  const nextPhaseName = nextPhaseKey ? PHASE_NAMES[nextPhaseKey] : null;

  const milestones = phaseDef.milestones;

  // Gate checks
  const checkedCount = milestoneProgress.filter(Boolean).length;
  const allMilestonesChecked = milestones.length > 0 && checkedCount >= milestones.length;

  const phaseTasks = tasks.filter((t) => t.phase === currentPhaseIndex || t.phase == null);
  const incompleteTasks = phaseTasks.filter((t) => !t.done && t.status !== "cancelled");
  const allTasksDone = incompleteTasks.length === 0;

  const canAdvance = allMilestonesChecked && allTasksDone;

  async function handleToggle(index: number) {
    if (!project.id) return;
    const newState = !(milestoneProgress[index] ?? false);
    await toggleMilestoneProgress(userId, project.id, currentPhaseKey, index, newState, milestones.length);
  }

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

  return (
    <div className="mt-5 mb-5">
      <SectionLabel>Phase Gate</SectionLabel>
      <Card padding="md" className="border-l-[3px] border-l-emerald-500">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[13px] font-medium text-earth">
              Phase {currentPhaseIndex}: {PHASE_NAMES[currentPhaseKey]}
            </p>
            <p className="text-[11px] text-muted mt-0.5">
              Complete all milestones and tasks to advance
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted uppercase tracking-wider">Milestones</p>
            <p className="font-data text-[14px] text-earth font-medium">
              {checkedCount} / {milestones.length}
            </p>
          </div>
        </div>

        {/* Milestone checklist (synced with Schedule page) */}
        <div className="space-y-1">
          {milestones.map((milestone, i) => {
            const isChecked = milestoneProgress[i] ?? false;
            return (
              <div
                key={i}
                className={`flex items-start gap-2.5 py-2 text-[12px] ${
                  i < milestones.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <button
                  onClick={() => handleToggle(i)}
                  className={`w-4 h-4 mt-0.5 rounded border-[1.5px] shrink-0 flex items-center justify-center transition-colors ${
                    isChecked
                      ? "bg-success border-success"
                      : "border-border-dark hover:border-emerald-500"
                  }`}
                >
                  {isChecked && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <span className={isChecked ? "text-muted line-through opacity-50" : "text-earth"}>
                    {milestone.name}
                  </span>
                  {milestone.description && (
                    <p className="text-[10px] text-muted mt-0.5 leading-relaxed">{milestone.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    {milestone.requiresInspection && (
                      <span className="text-[9px] text-warning font-medium">Inspection required</span>
                    )}
                    {milestone.requiresPayment && milestone.paymentPct && (
                      <span className="text-[9px] text-info font-medium font-data">
                        Payment: {milestone.paymentPct}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gate status */}
        {!canAdvance && (
          <div className="mt-3 pt-3 border-t border-border space-y-1.5">
            {!allMilestonesChecked && (
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <AlertTriangle size={12} className="text-warning shrink-0" />
                {milestones.length - checkedCount} milestone{milestones.length - checkedCount !== 1 ? "s" : ""} remaining
              </div>
            )}
            {!allTasksDone && (
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <AlertTriangle size={12} className="text-warning shrink-0" />
                {incompleteTasks.length} task{incompleteTasks.length !== 1 ? "s" : ""} still open
              </div>
            )}
          </div>
        )}

        {/* Advance button */}
        {!isLastPhase && (
          <div className="mt-4 pt-3 border-t border-border">
            <button
              onClick={handleAdvance}
              disabled={!canAdvance || advancing}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[12px] font-medium rounded-[var(--radius)] transition-colors ${
                canAdvance
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-surface border border-border text-muted cursor-not-allowed"
              }`}
            >
              {advancing ? (
                "Advancing..."
              ) : (
                <>
                  Advance to {nextPhaseName}
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        )}

        {isLastPhase && allMilestonesChecked && (
          <div className="mt-4 pt-3 border-t border-border text-center">
            <div className="flex items-center justify-center gap-2 text-[12px] text-success font-medium">
              <Check size={16} />
              Final phase — project complete
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
