// apps/web/src/app/(dashboard)/new-project/store.ts
// ---------------------------------------------------------------------------
// Zustand store for the new-project wizard, extracted from page.tsx.
// No "use client" directive — Zustand stores work without it.
// Components that consume these hooks must be client components.
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { useMemo } from "react";
import { getMarketData } from "@keystone/market-data";
import type { Market as MarketType, CurrencyConfig, LocationData } from "@keystone/market-data";
import {
  INITIAL_STRUCTURE,
  INITIAL_INTERIOR,
  INITIAL_SITE,
  INITIAL_UNIT_CONFIG,
  getSmartDefaults,
} from "@/lib/config/property-details-config";
import type {
  StructureSelections,
  InteriorSelections,
  SiteSelections,
  UnitConfigSelections,
} from "@/lib/config/property-details-config";
import { calculateDetailedCosts } from "@/lib/config/detailed-cost-engine";
import type { DetailedCostBreakdown } from "@/lib/config/detailed-cost-engine";
import type {
  WizardState,
  BuildGoal,
  SizeCategory,
  LandOption,
  FinancingType,
} from "./types";
import type { PropertyType } from "@/lib/services/project-service";

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const INITIAL_STATE: WizardState = {
  goal: "",
  market: "",
  city: "",
  propertyType: "",
  sizeCategory: "standard",
  customSize: 0,
  bedrooms: 3,
  bathrooms: 2,
  stories: 1,
  features: [],
  landOption: "",
  landPrice: 0,
  financingType: "",
  downPaymentPct: 20,
  loanRate: 8,
  timelineMonths: 12,
  targetSalePrice: 0,
  monthlyRent: 0,
  projectName: "",
  fromAnalyzer: false,
  wizardMode: "",
  structure: { ...INITIAL_STRUCTURE },
  interior: { ...INITIAL_INTERIOR },
  site: { ...INITIAL_SITE },
  unitConfig: { ...INITIAL_UNIT_CONFIG },
  defaultsApplied: [],
};

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface WizardStore {
  // --- State -----------------------------------------------------------------
  state: WizardState;
  step: number;
  maxStepReached: number;
  completedSteps: Set<number>;
  locationData: LocationData | null;
  locationLoading: boolean;
  creating: boolean;
  projectCount: number;
  planError: string;
  validationError: string;
  editingSection: string | null;

  // --- Actions ---------------------------------------------------------------
  update: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  updateStructure: (partial: Partial<StructureSelections>) => void;
  updateInterior: (partial: Partial<InteriorSelections>) => void;
  updateSite: (partial: Partial<SiteSelections>) => void;
  updateUnitConfig: (partial: Partial<UnitConfigSelections>) => void;
  setStep: (step: number) => void;
  markCompleted: (step: number) => void;
  setLocationData: (data: LocationData | null) => void;
  setLocationLoading: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
  setProjectCount: (count: number) => void;
  setPlanError: (error: string) => void;
  setValidationError: (error: string) => void;
  setEditingSection: (section: string | null) => void;
  applySmartDefaults: () => void;
  reset: () => void;
  loadFromAnalyzer: (params: URLSearchParams) => void;
  loadDraft: () => void;
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

export const useWizardStore = create<WizardStore>((set, get) => ({
  // --- Initial values --------------------------------------------------------
  state: { ...INITIAL_STATE },
  step: 0,
  maxStepReached: 0,
  completedSteps: new Set<number>(),
  locationData: null,
  locationLoading: false,
  creating: false,
  projectCount: 0,
  planError: "",
  validationError: "",
  editingSection: null,

  // --- Actions ---------------------------------------------------------------

  update: (key, value) => {
    set((store) => {
      const next = { ...store.state, [key]: value };
      // Reset financing type when market changes (financing options differ by market)
      if (key === "market" && value !== store.state.market) {
        next.financingType = "";
      }
      return { state: next };
    });
  },

  updateStructure: (partial) => {
    set((store) => ({
      state: {
        ...store.state,
        structure: { ...store.state.structure, ...partial },
      },
    }));
  },

  updateInterior: (partial) => {
    set((store) => ({
      state: {
        ...store.state,
        interior: { ...store.state.interior, ...partial },
      },
    }));
  },

  updateSite: (partial) => {
    set((store) => ({
      state: {
        ...store.state,
        site: { ...store.state.site, ...partial },
      },
    }));
  },

  updateUnitConfig: (partial) => {
    set((store) => ({
      state: {
        ...store.state,
        unitConfig: { ...store.state.unitConfig, ...partial },
      },
    }));
  },

  setStep: (step) => {
    set((store) => ({
      step,
      maxStepReached: Math.max(store.maxStepReached, step),
      validationError: "",
    }));
  },

  markCompleted: (step) => {
    set((store) => {
      const next = new Set(store.completedSteps);
      next.add(step);
      return { completedSteps: next };
    });
  },

  setLocationData: (data) => set({ locationData: data }),
  setLocationLoading: (loading) => set({ locationLoading: loading }),
  setCreating: (creating) => set({ creating }),
  setProjectCount: (count) => set({ projectCount: count }),
  setPlanError: (error) => set({ planError: error }),
  setValidationError: (error) => set({ validationError: error }),
  setEditingSection: (section) => set({ editingSection: section }),

  applySmartDefaults: () => {
    const { state } = get();
    if (!state.propertyType || !state.market || !state.goal) return;

    const defaults = getSmartDefaults(
      state.propertyType as PropertyType,
      state.market as MarketType,
      state.goal,
    );

    const applied: string[] = [];

    // Track which structure fields were defaulted
    if (defaults.structure) {
      for (const key of Object.keys(defaults.structure)) {
        applied.push(`structure.${key}`);
      }
    }
    if (defaults.interior) {
      for (const key of Object.keys(defaults.interior)) {
        applied.push(`interior.${key}`);
      }
    }
    if (defaults.site) {
      for (const key of Object.keys(defaults.site)) {
        applied.push(`site.${key}`);
      }
    }
    if (defaults.unitConfig) {
      for (const key of Object.keys(defaults.unitConfig)) {
        applied.push(`unitConfig.${key}`);
      }
    }

    set({
      state: {
        ...state,
        structure: { ...INITIAL_STRUCTURE, ...defaults.structure },
        interior: { ...INITIAL_INTERIOR, ...defaults.interior },
        site: { ...INITIAL_SITE, ...defaults.site },
        unitConfig: { ...INITIAL_UNIT_CONFIG, ...defaults.unitConfig },
        defaultsApplied: applied,
      },
    });
  },

  reset: () => {
    set({
      state: { ...INITIAL_STATE },
      step: 0,
      maxStepReached: 0,
      completedSteps: new Set<number>(),
      locationData: null,
      locationLoading: false,
      creating: false,
      planError: "",
      validationError: "",
      editingSection: null,
    });
  },

  loadFromAnalyzer: (params) => {
    const baseStructure = { ...INITIAL_STRUCTURE };
    const baseInterior = { ...INITIAL_INTERIOR };
    const baseSite = { ...INITIAL_SITE };

    // Pre-fill detail steps from optional URL params
    if (params.get("foundation")) baseStructure.foundation = params.get("foundation")!;
    if (params.get("roof")) baseStructure.roof = params.get("roof")!;
    if (params.get("exterior")) baseStructure.exterior = params.get("exterior")!;
    if (params.get("hvac")) baseInterior.hvac = params.get("hvac")!;
    if (params.get("kitchen")) baseInterior.kitchenStyle = params.get("kitchen")!;
    if (params.get("flooring")) baseInterior.flooring = params.get("flooring")!;
    if (params.get("lotsize")) baseSite.lotSize = params.get("lotsize")!;
    if (params.get("lotshape")) baseSite.lotShape = params.get("lotshape")!;

    set({
      state: {
        ...INITIAL_STATE,
        fromAnalyzer: true,
        goal: (params.get("goal") || "") as BuildGoal,
        market: (params.get("market") || "") as MarketType | "",
        city: params.get("city") || "",
        propertyType: (params.get("type") || "") as PropertyType | "",
        sizeCategory: (params.get("size") || "standard") as SizeCategory,
        bedrooms: Number(params.get("beds")) || 3,
        bathrooms: Number(params.get("baths")) || 2,
        stories: Number(params.get("stories")) || 1,
        features: params.get("feat") ? params.get("feat")!.split(",").filter(Boolean) : [],
        financingType: (params.get("financing") || "") as FinancingType,
        landOption: (params.get("land") || "") as LandOption,
        landPrice: Number(params.get("landprice")) || 0,
        downPaymentPct: Number(params.get("dp")) || 20,
        loanRate: Number(params.get("rate")) || 8,
        timelineMonths: Number(params.get("months")) || 12,
        monthlyRent: Number(params.get("rent")) || 0,
        targetSalePrice: Number(params.get("sale")) || 0,
        structure: baseStructure,
        interior: baseInterior,
        site: baseSite,
        unitConfig: { ...INITIAL_UNIT_CONFIG },
        defaultsApplied: [],
      },
    });
  },

  loadDraft: () => {
    if (typeof window === "undefined") return;
    try {
      const draft = localStorage.getItem("keystone-new-project-draft");
      if (!draft) return;

      const parsed = JSON.parse(draft);
      if (parsed.state) {
        // Merge with INITIAL_STATE to handle drafts saved before new spec fields existed
        set({
          state: {
            ...INITIAL_STATE,
            ...parsed.state,
            structure: { ...INITIAL_STRUCTURE, ...(parsed.state.structure ?? {}) },
            interior: { ...INITIAL_INTERIOR, ...(parsed.state.interior ?? {}) },
            site: { ...INITIAL_SITE, ...(parsed.state.site ?? {}) },
            unitConfig: { ...INITIAL_UNIT_CONFIG, ...(parsed.state.unitConfig ?? {}) },
          },
        });
      }
      if (typeof parsed.step === "number") {
        set({
          step: parsed.step,
          maxStepReached: parsed.maxStep ?? parsed.step,
        });
      }
      if (Array.isArray(parsed.completedSteps)) {
        set({ completedSteps: new Set<number>(parsed.completedSteps) });
      }
    } catch {
      // Ignore corrupt drafts
    }
  },
}));

// ---------------------------------------------------------------------------
// Selector hooks
// ---------------------------------------------------------------------------

const DEFAULT_CURRENCY: CurrencyConfig = {
  code: "USD",
  symbol: "$",
  locale: "en-US",
  decimals: 2,
  groupSeparator: ",",
  position: "prefix" as const,
};

/** Returns the CurrencyConfig for the currently selected market. */
export function useCurrency(): CurrencyConfig {
  const market = useWizardStore((s) => s.state.market);
  return useMemo(() => {
    if (!market) return DEFAULT_CURRENCY;
    return getMarketData(market as MarketType).currency;
  }, [market]);
}

/** Returns "sqft" for USA, "sqm" for all other markets. */
export function useSizeUnit(): "sqft" | "sqm" {
  const market = useWizardStore((s) => s.state.market);
  return useMemo(() => (market === "USA" ? "sqft" : "sqm"), [market]);
}

/** Calculates the detailed cost breakdown based on current wizard state. */
export function useDetailedCosts(): DetailedCostBreakdown {
  const state = useWizardStore((s) => s.state);
  const locationData = useWizardStore((s) => s.locationData);

  return useMemo(
    () =>
      calculateDetailedCosts(
        state.propertyType as PropertyType,
        state.market as MarketType | "",
        state.structure,
        state.interior,
        state.site,
        state.unitConfig,
        locationData,
        state.landOption,
        state.landPrice,
        state.financingType,
        state.downPaymentPct,
        state.loanRate,
        state.timelineMonths,
      ),
    [
      state.propertyType,
      state.market,
      state.structure,
      state.interior,
      state.site,
      state.unitConfig,
      locationData,
      state.landOption,
      state.landPrice,
      state.financingType,
      state.downPaymentPct,
      state.loanRate,
      state.timelineMonths,
    ],
  );
}
