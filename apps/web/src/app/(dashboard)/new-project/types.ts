// apps/web/src/app/(dashboard)/new-project/types.ts
// ---------------------------------------------------------------------------
// All wizard-related type definitions, extracted from page.tsx for modularity.
// ---------------------------------------------------------------------------

import type { Market as MarketType, CurrencyConfig, LocationData } from "@keystone/market-data";
import type {
  StructureSelections,
  InteriorSelections,
  SiteSelections,
  UnitConfigSelections,
} from "@/lib/config/property-details-config";
import type { DetailedCostBreakdown } from "@/lib/config/detailed-cost-engine";
import type { PropertyType } from "@/lib/services/project-service";

// ---------------------------------------------------------------------------
// Re-exports for consumer convenience
// ---------------------------------------------------------------------------

export type {
  MarketType,
  CurrencyConfig,
  LocationData,
  StructureSelections,
  InteriorSelections,
  SiteSelections,
  UnitConfigSelections,
  DetailedCostBreakdown,
  PropertyType,
};

// ---------------------------------------------------------------------------
// Wizard-specific types
// ---------------------------------------------------------------------------

export type BuildGoal = "sell" | "rent" | "occupy" | "";
export type SizeCategory = "compact" | "standard" | "large" | "estate" | "custom";
export type LandOption = "known" | "estimate" | "";
export type FinancingType =
  | "construction_loan"
  | "cash"
  | "fha_203k"
  | "diaspora"
  | "tontine"
  | "phased_cash"
  | "family_pooling"
  | "";
export type WizardMode = "simple" | "advanced" | "";
export type WizardSection = "basics" | "structure" | "interior" | "site" | "units" | "financials";

// ---------------------------------------------------------------------------
// Wizard state
// ---------------------------------------------------------------------------

export interface WizardState {
  goal: BuildGoal;
  market: MarketType | "";
  city: string;
  propertyType: PropertyType | "";
  sizeCategory: SizeCategory;
  customSize: number;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  features: string[];
  landOption: LandOption;
  landPrice: number;
  financingType: FinancingType;
  downPaymentPct: number;
  loanRate: number;
  timelineMonths: number;
  targetSalePrice: number;
  monthlyRent: number;
  projectName: string;
  fromAnalyzer: boolean;
  wizardMode: WizardMode;
  structure: StructureSelections;
  interior: InteriorSelections;
  site: SiteSelections;
  unitConfig: UnitConfigSelections;
  /** Tracks which fields used smart defaults vs explicit user choice */
  defaultsApplied: string[];
}

// ---------------------------------------------------------------------------
// Step configuration (for the step registry)
// ---------------------------------------------------------------------------

export interface StepConfig {
  id: string;
  section: WizardSection;
  component: React.ComponentType;
  label: string;
  sectionLabel: string;
  appliesTo: PropertyType[];
  marketFilter?: MarketType[];
  condition?: (state: WizardState) => boolean;
  autoAdvance?: boolean;
  validate?: (state: WizardState) => boolean;
}

// ---------------------------------------------------------------------------
// Deal scoring
// ---------------------------------------------------------------------------

export interface ScoreFactor {
  label: string;
  points: number;
  maxPoints: number;
  positive: boolean;
  explanation: string;
}

export interface DealResult {
  score: number;
  factors: ScoreFactor[];
  risks: string[];
  verdict: string;
  verdictLevel: "strong" | "decent" | "risky";
}

// ---------------------------------------------------------------------------
// Cost delta display
// ---------------------------------------------------------------------------

export interface CostDeltaInfo {
  amount: number;
  label?: string;
}
