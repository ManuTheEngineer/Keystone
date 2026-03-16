"use client";

import { useState } from "react";
import { Card } from "./Card";
import { SectionLabel } from "./SectionLabel";
import {
  advanceProjectPhase,
  type ProjectData,
} from "@/lib/services/project-service";
import {
  getPhaseDefinition,
  PHASE_ORDER,
  PHASE_NAMES,
} from "@keystone/market-data";
import type { Market } from "@keystone/market-data";
import { ChevronRight, Check } from "lucide-react";

interface PhaseAdvancementProps {
  project: ProjectData;
  userId: string;
  onAdvance: () => void;
}

export function PhaseAdvancement({ project, userId, onAdvance }: PhaseAdvancementProps) {
  const market = project.market as Market;
  const currentPhaseIndex = project.currentPhase;
  const currentPhaseKey = PHASE_ORDER[currentPhaseIndex];
  const phaseDef = getPhaseDefinition(market, currentPhaseKey);

  const [checkedMilestones, setCheckedMilestones] = useState<Set<number>>(new Set());
  const [advancing, setAdvancing] = useState(false);

  if (!phaseDef) return null;

  const isLastPhase = currentPhaseIndex >= PHASE_ORDER.length - 1;
  const nextPhaseKey = !isLastPhase ? PHASE_ORDER[currentPhaseIndex + 1] : null;
  const nextPhaseName = nextPhaseKey ? PHASE_NAMES[nextPhaseKey] : null;

  const milestones = phaseDef.milestones;
  const allChecked = milestones.length > 0 && milestones.every((_, i) => checkedMilestones.has(i));

  function toggleMilestone(index: number) {
    setCheckedMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  async function handleAdvance() {
    if (!nextPhaseKey || advancing) return;
    setAdvancing(true);
    try {
      const newPhase = currentPhaseIndex + 1;
      const phaseName = `Phase ${newPhase}: ${PHASE_NAMES[nextPhaseKey]}`;
      await advanceProjectPhase(userId, project.id!, newPhase, phaseName);
      setCheckedMilestones(new Set());
      onAdvance();
    } finally {
      setAdvancing(false);
    }
  }

  return (
    <div className="mt-4 mb-5">
      <SectionLabel>Phase Progress</SectionLabel>
      <Card padding="md" className="border-l-[3px] border-l-emerald-500">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[13px] font-medium text-earth">
              Phase {currentPhaseIndex}: {PHASE_NAMES[currentPhaseKey]}
            </p>
            <p className="text-[11px] text-muted mt-0.5">
              Complete the milestones below to advance
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted uppercase tracking-wider">Completed</p>
            <p className="font-data text-[14px] text-earth font-medium">
              {checkedMilestones.size} / {milestones.length}
            </p>
          </div>
        </div>

        {/* Milestone checklist */}
        <div className="space-y-1">
          {milestones.map((milestone, i) => {
            const isChecked = checkedMilestones.has(i);
            return (
              <div
                key={i}
                className={`flex items-start gap-2.5 py-2 text-[12px] ${
                  i < milestones.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <button
                  onClick={() => toggleMilestone(i)}
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

        {/* Advance button */}
        {!isLastPhase && (
          <div className="mt-4 pt-3 border-t border-border">
            <button
              onClick={handleAdvance}
              disabled={!allChecked || advancing}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[12px] font-medium rounded-[var(--radius)] transition-colors ${
                allChecked
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
            {!allChecked && (
              <p className="text-[10px] text-muted text-center mt-1.5">
                Complete all milestones to unlock phase advancement
              </p>
            )}
          </div>
        )}

        {isLastPhase && (
          <div className="mt-4 pt-3 border-t border-border text-center">
            <div className="flex items-center justify-center gap-2 text-[12px] text-success font-medium">
              <Check size={16} />
              Final phase reached
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
