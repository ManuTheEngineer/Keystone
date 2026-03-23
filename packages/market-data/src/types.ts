// === Core Enums (matching project-service.ts) ===

export type Market = "USA" | "TOGO" | "GHANA" | "BENIN" | "IVORY_COAST" | "SENEGAL";
export type ProjectPhase = "DEFINE" | "FINANCE" | "LAND" | "DESIGN" | "APPROVE" | "ASSEMBLE" | "BUILD" | "VERIFY" | "OPERATE";
export type PropertyType = "SFH" | "DUPLEX" | "TRIPLEX" | "FOURPLEX" | "APARTMENT";
export type BuildPurpose = "OCCUPY" | "RENT" | "SELL";
export type DocumentType = "CONTRACT" | "BID" | "PERMIT" | "PLAN" | "INVOICE" | "RECEIPT" | "REPORT" | "CHECKLIST" | "LEGAL" | "OTHER";

// === Currency ===

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  decimals: number;
  groupSeparator: string;
  position: "prefix" | "suffix";
}

// === Cost Benchmarks ===

export interface CostBenchmark {
  category: string;
  subcategory?: string;
  unit: "sqft" | "sqm" | "lump" | "linear_ft" | "linear_m";
  lowRange: number;
  midRange: number;
  highRange: number;
  notes: string;
  propertyTypes: PropertyType[];
  regions?: string[];
}

// === Phases and Milestones ===

export interface PhaseDefinition {
  phase: ProjectPhase;
  name: string;
  description: string;
  typicalDurationWeeks: { min: number; max: number };
  milestones: MilestoneDefinition[];
  requiredDocuments: string[];
  educationSummary: string;
  constructionMethod: string;
}

export interface MilestoneDefinition {
  name: string;
  description: string;
  requiresInspection: boolean;
  requiresPayment: boolean;
  paymentPct?: number;
  verificationRequired: boolean;
  order: number;
}

// === Trades ===

export interface TradeDefinition {
  id: string;
  name: string;
  localName?: string;
  description: string;
  phases: ProjectPhase[];
  typicalRateRange: { low: number; high: number; unit: string };
  licensingRequired: boolean;
  licensingNotes?: string;
  criticalSkills: string[];
}

// === Inspections ===

export interface InspectionRequirement {
  id: string;
  name: string;
  phase: ProjectPhase;
  milestone?: string;
  description: string;
  inspector: string;
  checklistItems: string[];
  requiredBeforeNext: boolean;
  formal: boolean;
}

// === Financing ===

export interface FinancingOption {
  id: string;
  name: string;
  description: string;
  type: string;
  requirements: string[];
  typicalTerms: string;
  pros: string[];
  cons: string[];
}

// === Regulations ===

export interface RegulationReference {
  name: string;
  description: string;
  phase: ProjectPhase;
  authority: string;
  url?: string;
  notes: string;
}

// === Education ===

export interface EducationModule {
  phase: ProjectPhase;
  title: string;
  summary: string;
  content: string;
  keyDecisions: string[];
  commonMistakes: string[];
  proTips: string[];
  disclaimer?: string;
}

// === Documents ===

export interface DocumentTemplate {
  id: string;
  name: string;
  type: DocumentType;
  phase: ProjectPhase;
  description: string;
  fields: string[];
  required: boolean;
}

// === Glossary ===

export interface GlossaryTerm {
  term: string;
  definition: string;
  phase?: ProjectPhase;
  marketSpecific: boolean;
  localTerms?: Record<string, string>;
}

// === Market Config (top-level) ===

export interface MarketConfig {
  market: Market;
  currency: CurrencyConfig;
  phases: PhaseDefinition[];
  costBenchmarks: CostBenchmark[];
  trades: TradeDefinition[];
  inspections: InspectionRequirement[];
  financing: FinancingOption[];
  regulations: RegulationReference[];
  education: Record<ProjectPhase, EducationModule>;
  documentTemplates: DocumentTemplate[];
  glossary: GlossaryTerm[];
}
