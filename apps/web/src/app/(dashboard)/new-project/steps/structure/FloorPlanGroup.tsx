"use client";

import { Check } from "lucide-react";
import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { MentorTip } from "../../components/MentorTip";
import type { FloorPlan } from "@/lib/config/property-details-config";

const sfhRoomOptions = [
  { id: "living", label: "Living room" },
  { id: "kitchen", label: "Kitchen" },
  { id: "dining", label: "Dining room" },
  { id: "master-bed", label: "Primary bedroom" },
  { id: "bedroom-2", label: "Bedroom 2" },
  { id: "bedroom-3", label: "Bedroom 3" },
  { id: "bedroom-4", label: "Bedroom 4" },
  { id: "full-bath", label: "Full bathroom" },
  { id: "half-bath", label: "Half bath" },
  { id: "office", label: "Office / Study" },
  { id: "laundry", label: "Laundry room" },
  { id: "pantry", label: "Pantry" },
  { id: "garage-access", label: "Garage access" },
  { id: "mudroom", label: "Mudroom / Entry" },
  { id: "bonus-room", label: "Bonus room" },
];

function initSFHFloorPlans(layout: string): FloorPlan[] {
  return [
    {
      floor: 1,
      label: "First floor",
      use: "residential",
      unitMix: "",
      unitCount: 0,
      rooms: ["living", "kitchen", "dining", "half-bath", "garage-access"],
    },
    {
      floor: 2,
      label: layout === "split-level" ? "Upper level" : "Second floor",
      use: "residential",
      unitMix: "",
      unitCount: 0,
      rooms: ["master-bed", "bedroom-2", "bedroom-3", "full-bath"],
    },
  ];
}

export function FloorPlanGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);

  // Only for SFH multi-story
  if (state.propertyType !== "SFH") return null;
  const isMultiStory = ["two-story", "split-level"].includes(state.structure.layout);
  if (!isMultiStory) return null;

  const currentPlans =
    state.structure.floorPlans.length > 0
      ? state.structure.floorPlans
      : initSFHFloorPlans(state.structure.layout);

  function handleToggle() {
    const newVal = !state.structure.useFloorPlans;
    updateStructure({
      useFloorPlans: newVal,
      floorPlans: newVal ? initSFHFloorPlans(state.structure.layout) : [],
    });
  }

  function toggleRoom(floorIndex: number, roomId: string) {
    const plans = [...currentPlans];
    const rooms = plans[floorIndex].rooms || [];
    const next = rooms.includes(roomId)
      ? rooms.filter(r => r !== roomId)
      : [...rooms, roomId];
    plans[floorIndex] = { ...plans[floorIndex], rooms: next };
    updateStructure({ floorPlans: plans });
  }

  return (
    <StepShell title="Floor Plan" subtitle="Assign rooms to each floor. This helps estimate plumbing runs, structural loads, and living flow." breadcrumb="Structure > Floor Plan">
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={handleToggle}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            state.structure.useFloorPlans ? "bg-emerald-500" : "bg-sand/60"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              state.structure.useFloorPlans ? "left-5" : "left-0.5"
            }`}
          />
        </button>
        <span className="text-[12px] font-semibold text-earth">
          Specify room layout per floor
        </span>
      </div>

      {state.structure.useFloorPlans && (
        <div className="space-y-3">
          {currentPlans.map((fp, idx) => (
            <div key={fp.floor} className="p-4 rounded-xl border border-border bg-surface">
              <p className="text-[13px] font-semibold text-earth mb-3">
                {fp.label}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {sfhRoomOptions.map(room => {
                  const isSelected = (fp.rooms || []).includes(room.id);
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => toggleRoom(idx, room.id)}
                      className={`px-3 py-2 rounded-lg border text-[11px] text-left transition-all ${
                        isSelected
                          ? "border-emerald-500 border-2 bg-emerald-50/30 text-emerald-800"
                          : "border-border/50 text-muted hover:bg-warm/20"
                      }`}
                    >
                      {room.label}
                      {isSelected && (
                        <Check size={10} className="inline ml-1 text-emerald-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <MentorTip>
        Placing wet rooms (kitchens, bathrooms, laundry) above each other simplifies plumbing and reduces cost. Keeping the primary bedroom on the upper floor is standard, but main-floor primaries are popular for accessibility.
      </MentorTip>
    </StepShell>
  );
}
