"use client";

import { useState, useEffect } from "react";
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
import { ChevronRight, Check, ArrowRight, Sparkles } from "lucide-react";

interface PhaseAdvancementProps {
  project: ProjectData;
  userId: string;
  tasks: TaskData[];
  onAdvance: () => void;
}

// Phase-specific next steps to show after advancement
const NEXT_STEPS: Record<string, string[]> = {
  FINANCE: ["Review your estimated budget", "Explore financing options", "Set savings targets if cash-funding"],
  LAND: ["Research target neighborhoods", "Verify zoning and buildability", "Get property surveys if needed"],
  DESIGN: ["Select an architect or designer", "Finalize floor plans and materials", "Get structural engineering review"],
  APPROVE: ["Submit plans to building department", "Address any plan review comments", "Obtain building permits"],
  ASSEMBLE: ["Interview and compare contractors", "Negotiate contracts and payment terms", "Set up insurance and site security"],
  BUILD: ["Break ground on foundation", "Track daily progress and crew", "Document everything with photos"],
  VERIFY: ["Complete punch list items", "Schedule final inspections", "Obtain certificate of occupancy"],
  OPERATE: ["Set up property insurance", "Organize warranty documents", "Move in, list for rent, or prepare for sale"],
};

// Plain-language descriptions of what each phase transition means
const TRANSITION_CONTEXT: Record<string, { why: string; what: string }> = {
  FINANCE: {
    why: "Before you look at money, you need to know exactly what you want to build and where.",
    what: "Next you will explore financing options, set a real budget, and understand what you can afford.",
  },
  LAND: {
    why: "Securing financing first means you know your budget when evaluating land.",
    what: "Next you will search for land, verify zoning, and confirm the site can support your build.",
  },
  DESIGN: {
    why: "You need land secured before an architect can design for the specific site conditions.",
    what: "Next you will work with an architect, finalize floor plans, and select materials.",
  },
  APPROVE: {
    why: "Complete designs are required before submitting for permits and approvals.",
    what: "Next you will submit plans to authorities and obtain building permits.",
  },
  ASSEMBLE: {
    why: "Permits in hand means you are legally cleared to start hiring and contracting.",
    what: "Next you will hire contractors, negotiate contracts, and set up the payment schedule.",
  },
  BUILD: {
    why: "Your team and contracts need to be locked in before breaking ground.",
    what: "Next is actual construction — foundation, framing, mechanical systems, and finishes.",
  },
  VERIFY: {
    why: "Construction must be substantially complete before final inspections.",
    what: "Next you will complete punch list items, pass final inspections, and get your certificate of occupancy.",
  },
  OPERATE: {
    why: "All inspections passed and the home is officially ready for use.",
    what: "Your project is complete. Move in, list for rent, or prepare for sale.",
  },
};

export function PhaseAdvancement({ project, userId, tasks, onAdvance }: PhaseAdvancementProps) {
  const market = project.market as Market;
  const currentPhaseIndex = project.currentPhase;
  const currentPhaseKey = PHASE_ORDER[currentPhaseIndex];
  const phaseDef = getPhaseDefinition(market, currentPhaseKey);

  const [firebaseProgress, setFirebaseProgress] = useState<boolean[]>([]);
  const [advancing, setAdvancing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPhase, setCelebrationPhase] = useState<string | null>(null);

  // Reset celebration when phase changes (user navigated or phase advanced)
  useEffect(() => {
    if (celebrationPhase && celebrationPhase !== currentPhaseKey) {
      // Phase changed — the celebration was for the previous phase, dismiss it
      setShowCelebration(false);
      setCelebrationPhase(null);
    }
  }, [currentPhaseKey, celebrationPhase]);

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
  const context = nextPhaseKey ? TRANSITION_CONTEXT[nextPhaseKey] : null;

  const milestones = phaseDef.milestones;
  const phaseTasks = tasks.filter((t) => t.phase === currentPhaseIndex || t.phase == null);

  // Derive milestone completion from task status (primary) + Firebase (fallback)
  const nonPendingTasks = phaseTasks.filter((t) => t.status !== "pending-review");
  const milestoneCompleted = milestones.map((_, i) => {
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
    return tasksDone || firebaseProgress[i] === true;
  });

  const checkedCount = milestoneCompleted.filter(Boolean).length;
  const allMilestonesChecked = milestones.length > 0 && checkedCount >= milestones.length;
  const incompleteTasks = phaseTasks.filter((t) => !t.done && t.status !== "cancelled");
  const allTasksDone = incompleteTasks.length === 0;
  const canAdvance = allMilestonesChecked && allTasksDone;
  const progressPct = milestones.length > 0 ? Math.round((checkedCount / milestones.length) * 100) : 0;

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
      setCelebrationPhase(currentPhaseKey); // remember which phase was completed
      setShowCelebration(true);
      onAdvance();
    } finally {
      setAdvancing(false);
    }
  }

  // Celebration modal after advancing — shows completed phase info
  if (showCelebration && celebrationPhase) {
    const completedPhaseName = (PHASE_NAMES as Record<string, string>)[celebrationPhase] ?? celebrationPhase;
    const currentPhaseName = (PHASE_NAMES as Record<string, string>)[currentPhaseKey] ?? currentPhaseKey;
    const steps = NEXT_STEPS[currentPhaseKey] ?? [];
    return (
      <div className="mt-5 p-5 rounded-xl bg-success/5 border border-success/20 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles size={18} className="text-success" />
          <span className="text-[15px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>
            {completedPhaseName} complete
          </span>
        </div>
        <p className="text-[12px] text-muted mb-4">
          You are now in <strong className="text-earth">{currentPhaseName}</strong>. Here is what to focus on:
        </p>
        {steps.length > 0 && (
          <div className="text-left mb-4 space-y-1.5">
            <p className="text-[9px] text-muted uppercase tracking-wider font-medium">What to do next</p>
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px]">
                <ArrowRight size={10} className="text-success shrink-0 mt-0.5" />
                <span className="text-earth">{step}</span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowCelebration(false)}
          className="px-4 py-2 text-[11px] font-medium rounded-lg bg-earth text-warm hover:bg-earth/90 transition-colors"
        >
          Get started
        </button>
      </div>
    );
  }

  // Last phase complete
  if (isLastPhase && allMilestonesChecked && allTasksDone) {
    return (
      <div className="mt-5 p-5 rounded-xl bg-success/5 border border-success/20 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles size={18} className="text-success" />
          <span className="text-[15px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>
            Project complete
          </span>
        </div>
        <p className="text-[12px] text-muted">
          Congratulations! All phases are done and your project is ready.
        </p>
      </div>
    );
  }

  // When all done: just show the advance button — no duplicate milestone list
  if (canAdvance) {
    return (
      <div className="mt-5">
        <button
          onClick={handleAdvance}
          disabled={advancing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[13px] font-medium rounded-xl bg-earth text-warm hover:bg-earth/90 transition-colors"
        >
          {advancing ? "Moving to next phase..." : (
            <>
              Move to {nextPhaseName}
              <ChevronRight size={14} />
            </>
          )}
        </button>
        {context && (
          <p className="text-[10px] text-muted/50 mt-2 leading-relaxed text-center">
            {context.what}
          </p>
        )}
      </div>
    );
  }

  // Not ready yet: show progress bar + incomplete milestones only
  const incompleteMilestones = milestones.map((ms, i) => ({ ms, i, done: milestoneCompleted[i] })).filter((m) => !m.done);

  return (
    <div className="mt-5">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-[3px] bg-sand/30 rounded-full overflow-hidden">
          <div className="h-full bg-success/70 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-[10px] font-data text-muted/50 shrink-0">{progressPct}%</span>
      </div>

      {/* Only show incomplete milestones */}
      {incompleteMilestones.length > 0 && (
        <div className="mb-2">
          <p className="text-[9px] text-muted/40 mb-1">{incompleteMilestones.length} milestone{incompleteMilestones.length !== 1 ? "s" : ""} remaining</p>
          {incompleteMilestones.map(({ ms, i }) => {
            const hasIdx = nonPendingTasks.some((t) => t.milestoneIndex != null);
            let hasTasks: boolean;
            if (hasIdx) {
              hasTasks = nonPendingTasks.some((t) => t.milestoneIndex === i);
            } else {
              const sorted = [...nonPendingTasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
              const perMs = Math.max(1, Math.ceil(sorted.length / milestones.length));
              hasTasks = sorted.slice(i * perMs, (i + 1) * perMs).length > 0;
            }
            const isManual = !hasTasks;

            return (
              <button
                key={i}
                onClick={() => {
                  if (!isManual || !project.id) return;
                  toggleMilestoneProgress(userId, project.id, currentPhaseKey, i, true, milestones.length).catch(() => {});
                  setFirebaseProgress((prev) => {
                    const next = [...prev];
                    while (next.length <= i) next.push(false);
                    next[i] = true;
                    return next;
                  });
                }}
                disabled={!isManual}
                className={`w-full flex items-center gap-2 py-1 px-1 rounded text-left text-[10px] ${isManual ? "hover:bg-warm/10 cursor-pointer text-earth" : "text-muted/50"}`}
              >
                <div className="w-2.5 h-2.5 rounded-sm border border-sand/60 shrink-0" />
                <span>{ms.name}</span>
                {!isManual && <span className="text-[8px] text-muted/25 ml-auto">from tasks</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Educational context */}
      {context && (
        <p className="text-[10px] text-muted/50 leading-relaxed">
          {context.why}
        </p>
      )}
    </div>
  );
}
