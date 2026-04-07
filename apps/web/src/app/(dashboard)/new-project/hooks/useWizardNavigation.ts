"use client";

import { useMemo, useCallback } from "react";
import { useWizardStore } from "../store";
import type { StepConfig, WizardState, WizardSection } from "../types";
import type { PropertyType } from "@/lib/services/project-service";

// ---------------------------------------------------------------------------
// Property type groups
// ---------------------------------------------------------------------------

const ALL_TYPES: PropertyType[] = ["SFH", "DUPLEX", "TRIPLEX", "FOURPLEX", "APARTMENT"];
const MULTI_UNIT: PropertyType[] = ["DUPLEX", "TRIPLEX", "FOURPLEX", "APARTMENT"];

// ---------------------------------------------------------------------------
// Step Registry
// ---------------------------------------------------------------------------
// Order matters -- this defines the wizard flow. Components are resolved
// separately in the page orchestrator; the registry only holds metadata.
// ---------------------------------------------------------------------------

export const STEP_REGISTRY: Omit<StepConfig, "component">[] = [
  // ── Basics ──────────────────────────────────────────────────────────────
  { id: "goal",       section: "basics", label: "Goal",          sectionLabel: "Basics", appliesTo: ALL_TYPES, autoAdvance: true },
  { id: "market",     section: "basics", label: "Market",        sectionLabel: "Basics", appliesTo: ALL_TYPES, autoAdvance: true },
  { id: "location",   section: "basics", label: "Location",      sectionLabel: "Basics", appliesTo: ALL_TYPES },
  { id: "type",       section: "basics", label: "Property Type", sectionLabel: "Basics", appliesTo: ALL_TYPES, autoAdvance: true },
  { id: "mode",       section: "basics", label: "Wizard Mode",   sectionLabel: "Basics", appliesTo: ALL_TYPES, autoAdvance: true },

  // ── Structure ───────────────────────────────────────────────────────────
  { id: "layout",           section: "structure", label: "Layout",            sectionLabel: "Structure", appliesTo: ["SFH"],                                     autoAdvance: true },
  { id: "duplex-layout",    section: "structure", label: "Duplex Layout",     sectionLabel: "Structure", appliesTo: ["DUPLEX"],                                   autoAdvance: true },
  { id: "building-layout",  section: "structure", label: "Building Layout",   sectionLabel: "Structure", appliesTo: ["TRIPLEX", "FOURPLEX", "APARTMENT"],          autoAdvance: true },
  { id: "floors",           section: "structure", label: "Floors",            sectionLabel: "Structure", appliesTo: ["APARTMENT"] },
  { id: "foundation",       section: "structure", label: "Foundation",        sectionLabel: "Structure", appliesTo: ALL_TYPES,                                    autoAdvance: true },
  { id: "basement-details", section: "structure", label: "Basement Details",  sectionLabel: "Structure", appliesTo: ALL_TYPES, condition: (s) => s.structure.foundation === "full-basement" || s.structure.foundation === "walkout-basement" },
  { id: "roof",             section: "structure", label: "Roof",              sectionLabel: "Structure", appliesTo: ALL_TYPES,                                    autoAdvance: true },
  { id: "rooftop",          section: "structure", label: "Rooftop Features",  sectionLabel: "Structure", appliesTo: ALL_TYPES, condition: (s) => s.structure.roof === "flat" },
  { id: "exterior",         section: "structure", label: "Exterior",          sectionLabel: "Structure", appliesTo: ALL_TYPES,                                    autoAdvance: true },
  { id: "ceiling-windows",  section: "structure", label: "Ceiling & Windows", sectionLabel: "Structure", appliesTo: ALL_TYPES },
  { id: "soundproofing",    section: "structure", label: "Soundproofing",     sectionLabel: "Structure", appliesTo: MULTI_UNIT,                                   autoAdvance: true },
  { id: "entrances",        section: "structure", label: "Entrances",         sectionLabel: "Structure", appliesTo: MULTI_UNIT,                                   autoAdvance: true },
  { id: "stairwell",        section: "structure", label: "Stairwell",         sectionLabel: "Structure", appliesTo: ["APARTMENT"],                                autoAdvance: true },
  { id: "elevator",         section: "structure", label: "Elevator",          sectionLabel: "Structure", appliesTo: ["APARTMENT"], condition: (s) => s.structure.floors >= 3, autoAdvance: true },
  { id: "ada",              section: "structure", label: "ADA Compliance",    sectionLabel: "Structure", appliesTo: ["APARTMENT"],                                autoAdvance: true },
  { id: "fire-system",      section: "structure", label: "Fire System",       sectionLabel: "Structure", appliesTo: ["APARTMENT"],                                autoAdvance: true },
  { id: "commercial-ground",section: "structure", label: "Commercial Ground", sectionLabel: "Structure", appliesTo: ["APARTMENT"],                                autoAdvance: true },
  { id: "adu",              section: "structure", label: "ADU",               sectionLabel: "Structure", appliesTo: ["SFH"],                                      autoAdvance: true },
  { id: "adu-details",      section: "structure", label: "ADU Details",       sectionLabel: "Structure", appliesTo: ["SFH"], condition: (s) => s.structure.adu !== "none" && s.structure.adu !== "" },
  { id: "floor-plan",       section: "structure", label: "Floor Plan",        sectionLabel: "Structure", appliesTo: ["SFH"], condition: (s) => s.structure.layout === "two-story" || s.structure.layout === "split-level" },

  // ── Interior ────────────────────────────────────────────────────────────
  { id: "kitchen",            section: "interior", label: "Kitchen",              sectionLabel: "Interior", appliesTo: ALL_TYPES,  autoAdvance: true },
  { id: "kitchen-finish",     section: "interior", label: "Kitchen Finish",       sectionLabel: "Interior", appliesTo: ALL_TYPES,  autoAdvance: true },
  { id: "bathroom",           section: "interior", label: "Bathroom",             sectionLabel: "Interior", appliesTo: ALL_TYPES },
  { id: "flooring",           section: "interior", label: "Flooring",             sectionLabel: "Interior", appliesTo: ALL_TYPES,  autoAdvance: true },
  { id: "mechanical",         section: "interior", label: "Mechanical",           sectionLabel: "Interior", appliesTo: ALL_TYPES },
  { id: "smart-home",         section: "interior", label: "Smart Home",           sectionLabel: "Interior", appliesTo: ALL_TYPES,  autoAdvance: true },
  { id: "finish-consistency", section: "interior", label: "Finish Consistency",   sectionLabel: "Interior", appliesTo: MULTI_UNIT, autoAdvance: true },
  { id: "laundry-config",     section: "interior", label: "Laundry Config",       sectionLabel: "Interior", appliesTo: MULTI_UNIT, autoAdvance: true },
  { id: "hvac-config",        section: "interior", label: "HVAC Config",          sectionLabel: "Interior", appliesTo: MULTI_UNIT, autoAdvance: true },

  // ── Site & Outdoor ──────────────────────────────────────────────────────
  { id: "lot",          section: "site", label: "Lot",          sectionLabel: "Site & Outdoor", appliesTo: ALL_TYPES },
  { id: "garage",       section: "site", label: "Garage",       sectionLabel: "Site & Outdoor", appliesTo: ALL_TYPES, autoAdvance: true },
  { id: "driveway",     section: "site", label: "Driveway",     sectionLabel: "Site & Outdoor", appliesTo: ALL_TYPES, autoAdvance: true },
  { id: "outdoor",      section: "site", label: "Outdoor",      sectionLabel: "Site & Outdoor", appliesTo: ALL_TYPES },
  { id: "landscaping",  section: "site", label: "Landscaping",  sectionLabel: "Site & Outdoor", appliesTo: ALL_TYPES, autoAdvance: true },
  { id: "fencing",      section: "site", label: "Fencing",      sectionLabel: "Site & Outdoor", appliesTo: ALL_TYPES, autoAdvance: true },
  { id: "security",     section: "site", label: "Security",     sectionLabel: "Site & Outdoor", appliesTo: ALL_TYPES, autoAdvance: true },

  // ── Unit Config ─────────────────────────────────────────────────────────
  { id: "unit-count",      section: "units", label: "Unit Count",       sectionLabel: "Unit Config", appliesTo: ["APARTMENT"] },
  { id: "unit-mix",        section: "units", label: "Unit Mix",         sectionLabel: "Unit Config", appliesTo: MULTI_UNIT,                                   autoAdvance: true },
  { id: "unit-similarity", section: "units", label: "Unit Similarity",  sectionLabel: "Unit Config", appliesTo: ["DUPLEX"],                                    autoAdvance: true },
  { id: "mix-ratio",       section: "units", label: "Mix Ratio",        sectionLabel: "Unit Config", appliesTo: MULTI_UNIT, condition: (s) => s.unitConfig.unitMix !== "all-1br" && s.unitConfig.unitMix !== "all-2br" && s.unitConfig.unitMix !== "all-studio" },
  { id: "owner-occupied",  section: "units", label: "Owner Occupied",   sectionLabel: "Unit Config", appliesTo: MULTI_UNIT,                                   autoAdvance: true },
  { id: "utilities",       section: "units", label: "Utilities",        sectionLabel: "Unit Config", appliesTo: MULTI_UNIT,                                   autoAdvance: true },
  { id: "storage",         section: "units", label: "Storage",          sectionLabel: "Unit Config", appliesTo: ["TRIPLEX", "FOURPLEX", "APARTMENT"],           autoAdvance: true },
  { id: "common-areas",    section: "units", label: "Common Areas",     sectionLabel: "Unit Config", appliesTo: ["APARTMENT"] },
  { id: "common-outdoor",  section: "units", label: "Common Outdoor",   sectionLabel: "Unit Config", appliesTo: ["TRIPLEX", "FOURPLEX", "APARTMENT"] },
  { id: "building-access", section: "units", label: "Building Access",  sectionLabel: "Unit Config", appliesTo: ["APARTMENT"],                                autoAdvance: true },
  { id: "trash",           section: "units", label: "Trash",            sectionLabel: "Unit Config", appliesTo: ["TRIPLEX", "FOURPLEX", "APARTMENT"],           autoAdvance: true },
  { id: "management",      section: "units", label: "Management",       sectionLabel: "Unit Config", appliesTo: ["TRIPLEX", "FOURPLEX", "APARTMENT"],           autoAdvance: true },
  { id: "floor-plans",     section: "units", label: "Floor Plans",      sectionLabel: "Unit Config", appliesTo: MULTI_UNIT },

  // ── Financials ──────────────────────────────────────────────────────────
  { id: "size",       section: "financials", label: "Size",       sectionLabel: "Financials", appliesTo: ALL_TYPES },
  { id: "land",       section: "financials", label: "Land",       sectionLabel: "Financials", appliesTo: ALL_TYPES },
  { id: "financing",  section: "financials", label: "Financing",  sectionLabel: "Financials", appliesTo: ALL_TYPES },
  { id: "financials", section: "financials", label: "Financials", sectionLabel: "Financials", appliesTo: ALL_TYPES },
  { id: "score",      section: "financials", label: "Score",      sectionLabel: "Financials", appliesTo: ALL_TYPES },
  { id: "name",       section: "financials", label: "Name",       sectionLabel: "Financials", appliesTo: ALL_TYPES },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DETAIL_SECTIONS: WizardSection[] = ["structure", "interior", "site", "units"];

function isDetailStep(step: Omit<StepConfig, "component">): boolean {
  return DETAIL_SECTIONS.includes(step.section);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWizardNavigation() {
  const state = useWizardStore((s) => s.state);
  const step = useWizardStore((s) => s.step);
  const setStep = useWizardStore((s) => s.setStep);
  const markCompleted = useWizardStore((s) => s.markCompleted);

  // ── Filter active steps based on current wizard state ──────────────────
  const activeSteps = useMemo(() => {
    const propertyType = state.propertyType as PropertyType | "";
    const market = state.market;
    const mode = state.wizardMode;

    return STEP_REGISTRY.filter((entry) => {
      // Before property type is selected, only show basics up through "mode"
      if (!propertyType) {
        return entry.section === "basics" && !isDetailStep(entry);
      }

      // Check property type applicability
      if (!entry.appliesTo.includes(propertyType)) {
        return false;
      }

      // Check market filter if specified
      if (entry.marketFilter && market && !entry.marketFilter.includes(market as any)) {
        return false;
      }

      // In simple mode, skip all detail sections (structure/interior/site/units)
      if (mode === "simple" && isDetailStep(entry)) {
        return false;
      }

      // Evaluate dynamic condition
      if (entry.condition && !entry.condition(state)) {
        return false;
      }

      return true;
    });
  }, [state]);

  const currentStep = activeSteps[step] ?? activeSteps[0];

  // ── Section progress (e.g. "Structure 3/8") ────────────────────────────
  const sectionProgress = useMemo(() => {
    if (!currentStep) return { current: 0, total: 0, label: "" };

    const sectionSteps = activeSteps.filter(
      (s) => s.sectionLabel === currentStep.sectionLabel,
    );
    const indexInSection = sectionSteps.findIndex((s) => s.id === currentStep.id);

    return {
      current: indexInSection + 1,
      total: sectionSteps.length,
      label: currentStep.sectionLabel,
    };
  }, [activeSteps, currentStep]);

  // ── Unique ordered section labels for top progress bar ─────────────────
  const sections = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const s of activeSteps) {
      if (!seen.has(s.sectionLabel)) {
        seen.add(s.sectionLabel);
        result.push(s.sectionLabel);
      }
    }
    return result;
  }, [activeSteps]);

  // ── Navigation methods ─────────────────────────────────────────────────

  const goNext = useCallback(() => {
    markCompleted(step);
    setStep(step + 1);
  }, [step, markCompleted, setStep]);

  const goBack = useCallback(() => {
    setStep(step - 1);
  }, [step, setStep]);

  const goToStep = useCallback(
    (targetId: string) => {
      const idx = activeSteps.findIndex((s) => s.id === targetId);
      if (idx !== -1) {
        setStep(idx);
      }
    },
    [activeSteps, setStep],
  );

  const goToSection = useCallback(
    (sectionLabel: string) => {
      const idx = activeSteps.findIndex((s) => s.sectionLabel === sectionLabel);
      if (idx !== -1) {
        setStep(idx);
      }
    },
    [activeSteps, setStep],
  );

  const skipRemaining = useCallback(() => {
    // Mark all detail-section steps as completed, then jump to financials
    const financialsIdx = activeSteps.findIndex(
      (s) => s.section === "financials",
    );
    if (financialsIdx !== -1) {
      // Mark everything from current step up to (but not including) financials
      for (let i = step; i < financialsIdx; i++) {
        markCompleted(i);
      }
      setStep(financialsIdx);
    }
  }, [activeSteps, step, markCompleted, setStep]);

  return {
    activeSteps,
    currentStep,
    step,
    stepCount: activeSteps.length,
    sections,
    sectionProgress,
    isFirstStep: step === 0,
    isLastStep: step === activeSteps.length - 1,
    goNext,
    goBack,
    goToStep,
    goToSection,
    skipRemaining,
  };
}
