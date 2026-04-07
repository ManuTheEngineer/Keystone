"use client";

import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { MentorTip } from "../../components/MentorTip";
import type { FloorPlan } from "@/lib/config/property-details-config";

function getFloorLabel(i: number, total: number): string {
  if (i === 0) return "Basement";
  if (i === 1 && total > 1) return "Ground floor";
  if (i === total) return "Top floor";
  return `Floor ${i}`;
}

export function FloorPlansGroup() {
  const state = useWizardStore(s => s.state);
  const updateUnitConfig = useWizardStore(s => s.updateUnitConfig);

  // Only for multi-unit with multiple floors
  if (state.propertyType === "SFH") return null;

  const isDuplex = state.propertyType === "DUPLEX";
  const isTriplex = state.propertyType === "TRIPLEX";
  const isFourplex = state.propertyType === "FOURPLEX";
  const isApartment = state.propertyType === "APARTMENT";
  const isMultiSmall = isDuplex || isTriplex || isFourplex;

  const floorCount = isApartment
    ? (state.structure.floors || 2)
    : isDuplex && state.structure.buildingLayout === "stacked" ? 2
    : isTriplex ? (state.structure.buildingLayout === "stacked" ? 3 : 1)
    : isFourplex ? (state.structure.buildingLayout === "stacked" ? 4 : state.structure.buildingLayout === "2x2-grid" ? 2 : 1)
    : 1;

  if (floorCount <= 1) return null;

  const floorUseOptions = isApartment
    ? [
        { id: "residential", label: "Residential" },
        { id: "commercial", label: "Commercial / Retail" },
        { id: "parking", label: "Parking" },
        { id: "amenity", label: "Amenity space" },
      ]
    : [
        { id: "residential", label: "Residential units" },
        { id: "amenity", label: "Shared amenity" },
      ];

  const floorMixOptions = isMultiSmall
    ? [
        { id: "1x-studio", label: "1 Studio" },
        { id: "1x-1br", label: "1x 1BR" },
        { id: "1x-2br", label: "1x 2BR" },
        { id: "1x-3br", label: "1x 3BR" },
        { id: "2x-1br", label: "2x 1BR" },
        { id: "2x-2br", label: "2x 2BR" },
      ]
    : [
        { id: "all-studio", label: "All Studios" },
        { id: "all-1br", label: "All 1BR" },
        { id: "all-2br", label: "All 2BR" },
        { id: "all-3br", label: "All 3BR" },
        { id: "mix-1br-2br", label: "Mix 1BR + 2BR" },
        { id: "mix-studio-1br", label: "Mix Studio + 1BR" },
      ];

  function initFloorPlans(): FloorPlan[] {
    const plans: FloorPlan[] = [];
    const totalUnits = state.unitConfig.unitCount;

    for (let i = 1; i <= floorCount; i++) {
      const label = getFloorLabel(i, floorCount);
      if (isApartment) {
        plans.push({
          floor: i, label,
          use: i === 1 && state.structure.commercialGround === "yes" ? "commercial" : "residential",
          unitMix: "all-2br",
          unitCount: Math.max(1, Math.round(totalUnits / floorCount)),
          rooms: [],
        });
      } else if (isDuplex) {
        plans.push({
          floor: i, label: i === 1 ? "Lower unit" : "Upper unit",
          use: "residential", unitMix: "1x-2br", unitCount: 1, rooms: [],
        });
      } else if (isTriplex) {
        plans.push({
          floor: i, label: `Unit ${i} (${label})`,
          use: "residential", unitMix: "1x-2br", unitCount: 1, rooms: [],
        });
      } else if (isFourplex) {
        const unitsPerFloor = floorCount === 2 ? 2 : 1;
        plans.push({
          floor: i, label,
          use: "residential", unitMix: unitsPerFloor === 2 ? "2x-2br" : "1x-2br", unitCount: unitsPerFloor, rooms: [],
        });
      }
    }
    return plans;
  }

  const currentPlans =
    state.unitConfig.floorPlans.length > 0
      ? state.unitConfig.floorPlans
      : initFloorPlans();

  function handleToggle() {
    const newVal = !state.unitConfig.useFloorPlans;
    updateUnitConfig({
      useFloorPlans: newVal,
      floorPlans: newVal ? initFloorPlans() : [],
    });
  }

  function updateFloorPlan(floorIndex: number, field: string, value: any) {
    const plans = [...currentPlans];
    plans[floorIndex] = { ...plans[floorIndex], [field]: value };
    // Recalculate total unit count from residential floors
    const totalUnits = plans.filter(p => p.use === "residential").reduce((sum, p) => sum + p.unitCount, 0);
    updateUnitConfig({ floorPlans: plans, unitCount: totalUnits });
  }

  return (
    <StepShell title="Per-Floor Configuration" subtitle="Configure the use and unit mix for each floor individually." breadcrumb="Units > Per-Floor Config">
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={handleToggle}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            state.unitConfig.useFloorPlans ? "bg-emerald-500" : "bg-sand/60"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              state.unitConfig.useFloorPlans ? "left-5" : "left-0.5"
            }`}
          />
        </button>
        <span className="text-[12px] font-semibold text-earth">
          Configure each floor individually
        </span>
      </div>
      {!state.unitConfig.useFloorPlans && (
        <p className="text-[10px] text-muted ml-13">
          Specify the use and unit mix for each of the {floorCount} floors
        </p>
      )}

      {state.unitConfig.useFloorPlans && (
        <div className="space-y-3">
          {currentPlans.map((fp, idx) => (
            <div key={fp.floor} className="p-4 rounded-xl border border-border bg-surface">
              <p className="text-[13px] font-semibold text-earth mb-3">
                {fp.label || getFloorLabel(fp.floor, floorCount)}
              </p>

              {/* Floor use */}
              <p className="text-[10px] text-muted mb-1.5">Floor use</p>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {floorUseOptions.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateFloorPlan(idx, "use", opt.id)}
                    className={`px-3 py-2 rounded-lg border text-[11px] transition-all ${
                      fp.use === opt.id
                        ? "border-emerald-500 border-2 bg-emerald-50/30 text-emerald-800"
                        : "border-border/50 text-muted hover:bg-warm/20"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Unit mix for residential floors */}
              {fp.use === "residential" && (
                <>
                  <p className="text-[10px] text-muted mb-1.5">Unit mix on this floor</p>
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {floorMixOptions.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateFloorPlan(idx, "unitMix", opt.id)}
                        className={`px-2 py-2 rounded-lg border text-[10px] transition-all ${
                          fp.unitMix === opt.id
                            ? "border-emerald-500 border-2 bg-emerald-50/30 text-emerald-800"
                            : "border-border/50 text-muted hover:bg-warm/20"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-muted mb-1.5">Units on this floor</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateFloorPlan(idx, "unitCount", Math.max(1, fp.unitCount - 1))}
                      className="w-7 h-7 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[13px]"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-data text-[15px] font-semibold text-earth">
                      {fp.unitCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateFloorPlan(idx, "unitCount", Math.min(6, fp.unitCount + 1))}
                      className="w-7 h-7 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[13px]"
                    >
                      +
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <MentorTip>
        Per-floor configuration lets you optimize each level. Ground floors are ideal for commercial or accessible units, while upper floors can be all residential with better views and natural light.
      </MentorTip>
    </StepShell>
  );
}
