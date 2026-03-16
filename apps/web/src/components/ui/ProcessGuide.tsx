"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import type { Market } from "@keystone/market-data";

interface ProcessGuideProps {
  market: Market;
  currentPhase: number;
}

interface PhaseStep {
  number: number;
  name: string;
  description: string;
}

const USA_PHASES: PhaseStep[] = [
  { number: 0, name: "Define", description: "Clarify your goals, property type, and location. Determine whether you are building to live in, rent out, or sell." },
  { number: 1, name: "Finance", description: "Secure funding through a construction loan, conventional mortgage, or cash reserves. Get pre-qualified with a lender." },
  { number: 2, name: "Land", description: "Find and purchase a buildable lot. Verify zoning, utilities, soil conditions, and any deed restrictions." },
  { number: 3, name: "Design", description: "Work with an architect or purchase plans. Finalize floor plan, elevations, materials, and engineering." },
  { number: 4, name: "Approve", description: "Submit plans to your local building department. Obtain your building permit and any required variances." },
  { number: 5, name: "Assemble", description: "Hire your general contractor and key trades. Negotiate contracts, insurance, and payment schedules." },
  { number: 6, name: "Build", description: "Physical construction begins. Foundation, framing, rough-ins, exterior envelope, interior finishes, and final details." },
  { number: 7, name: "Verify", description: "Final inspections, punch list corrections, and Certificate of Occupancy. Confirm everything meets code and contract." },
  { number: 8, name: "Operate", description: "Move in, set up rentals, or list for sale. Track warranties, schedule maintenance, and manage your property." },
];

const WA_PHASES: PhaseStep[] = [
  { number: 0, name: "Define", description: "Clarify your goals, property type, and location. Determine whether you are building to live in, rent out, or sell." },
  { number: 1, name: "Finance", description: "Plan your savings schedule and phase-based cash funding. Set milestones for when each phase will be funded." },
  { number: 2, name: "Land", description: "Secure land and obtain the titre foncier (land title). Verify boundaries, resolve any customary ownership claims." },
  { number: 3, name: "Design", description: "Engage an architect for plans adapted to local construction methods (poteau-poutre / concrete block). Finalize layout and materials." },
  { number: 4, name: "Approve", description: "Submit plans to the local mairie or municipal authority. Obtain your permis de construire (building permit)." },
  { number: 5, name: "Assemble", description: "Hire your chef de chantier (site foreman) and key macons (masons). Negotiate daily rates and material procurement." },
  { number: 6, name: "Build", description: "Physical construction begins. Foundation, column/beam structure, block infill, roofing, plastering, and finishing." },
  { number: 7, name: "Verify", description: "Final walkthrough, punch list corrections, and conformity check. Verify structural integrity and finish quality." },
  { number: 8, name: "Operate", description: "Move in, set up rentals, or prepare for sale. Track property condition and manage ongoing costs." },
];

const USA_DEPENDENCIES = [
  "You need financing approved before you can make a land offer with a construction loan.",
  "You need land ownership confirmed before an architect can design to the specific lot and zoning.",
  "You need approved architectural plans before applying for a building permit.",
  "You need a building permit before any construction can begin legally.",
  "You need your contractor team assembled before breaking ground.",
  "Foundation must cure before framing. Framing must be complete before rough-in plumbing, electrical, and HVAC.",
  "Rough-in inspections must pass before you close up walls with insulation and drywall.",
  "Final inspections must pass before you can obtain a Certificate of Occupancy and move in.",
];

const WA_DEPENDENCIES = [
  "You need savings or funding secured before purchasing land, since most transactions are cash-based.",
  "You need a verified titre foncier before designing, to confirm lot boundaries and ownership.",
  "You need plans approved by the mairie before construction can begin.",
  "Foundation and column/beam skeleton must be complete before block infill walls.",
  "Roof structure must be installed before plastering interior walls.",
  "Electrical and plumbing rough-in happens before plastering and tiling.",
  "The building is typically built in funded phases, pausing between phases when cash runs out.",
  "Final verification confirms structural quality before occupancy or rental.",
];

export function ProcessGuide({ market, currentPhase }: ProcessGuideProps) {
  const [showWhy, setShowWhy] = useState(false);

  const isWA = market === "TOGO" || market === "GHANA" || market === "BENIN";
  const phases = isWA ? WA_PHASES : USA_PHASES;
  const dependencies = isWA ? WA_DEPENDENCIES : USA_DEPENDENCIES;

  return (
    <div className="border border-border rounded-[var(--radius)] bg-surface overflow-hidden">
      <div className="px-4 py-3 bg-warm border-b border-border">
        <h4 className="text-[13px] font-semibold text-earth">
          How {isWA ? "Construction Works in West Africa" : "Home Building Works in the USA"}
        </h4>
        <p className="text-[11px] text-muted mt-0.5">
          Your project follows these 9 phases in order. Each phase depends on completing the one before it.
        </p>
      </div>

      <div className="px-4 py-3">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-border" />

          <div className="space-y-3">
            {phases.map((phase) => {
              const isCompleted = phase.number < currentPhase;
              const isCurrent = phase.number === currentPhase;
              const isUpcoming = phase.number > currentPhase;

              return (
                <div key={phase.number} className="flex items-start gap-3 relative">
                  {/* Circle indicator */}
                  <div
                    className={`w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                      isCompleted
                        ? "bg-success border-success"
                        : isCurrent
                        ? "bg-emerald-500 border-emerald-500"
                        : "bg-surface border-border"
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={14} className="text-white" />
                    ) : (
                      <span
                        className={`text-[11px] font-data font-semibold ${
                          isCurrent ? "text-white" : "text-muted"
                        }`}
                      >
                        {phase.number}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-1 ${isUpcoming ? "opacity-50" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[12px] font-semibold ${
                          isCurrent ? "text-emerald-700" : isCompleted ? "text-success" : "text-muted"
                        }`}
                      >
                        Phase {phase.number}: {phase.name}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 text-[9px] font-medium bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-wider">
                          Current
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-relaxed mt-0.5 ${isCurrent ? "text-earth" : "text-muted"}`}>
                      {phase.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why this order? */}
        <div className="mt-4 pt-3 border-t border-border">
          <button
            type="button"
            onClick={() => setShowWhy(!showWhy)}
            className="flex items-center gap-1.5 text-[11px] text-clay font-medium hover:text-earth transition-colors"
          >
            {showWhy ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Why this order?
          </button>
          {showWhy && (
            <div className="mt-2 space-y-1.5">
              {dependencies.map((dep, i) => (
                <div key={i} className="flex gap-2 text-[11px] text-muted leading-relaxed">
                  <span className="shrink-0 mt-[2px] text-clay font-data">{i + 1}.</span>
                  <span>{dep}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
