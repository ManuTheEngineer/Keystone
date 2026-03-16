export type PlanTier = "FOUNDATION" | "BUILDER" | "DEVELOPER" | "ENTERPRISE";
export type BillingInterval = "monthly" | "annual";

export interface PlanConfig {
  name: string;
  monthlyPrice: number; // cents
  annualPrice: number; // cents
  monthlyPriceId: string; // Stripe Price ID (set after creating in Stripe Dashboard)
  annualPriceId: string;
  features: string[];
  limits: {
    projects: number;
    aiPerDay: number;
    photos: number;
    docGen: boolean;
    export: boolean;
    advancedFinancials: boolean;
  };
}

export const PLAN_CONFIG: Record<Exclude<PlanTier, "FOUNDATION">, PlanConfig> = {
  BUILDER: {
    name: "Builder",
    monthlyPrice: 1900,
    annualPrice: 18200,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_BUILDER_MONTHLY ?? "",
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_BUILDER_ANNUAL ?? "",
    features: [
      "3 active projects",
      "50 AI queries per day",
      "500 photo uploads",
      "Document generation",
      "PDF/CSV export",
      "All market data",
    ],
    limits: { projects: 3, aiPerDay: 50, photos: 500, docGen: true, export: true, advancedFinancials: false },
  },
  DEVELOPER: {
    name: "Developer",
    monthlyPrice: 4900,
    annualPrice: 47000,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_DEVELOPER_MONTHLY ?? "",
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_DEVELOPER_ANNUAL ?? "",
    features: [
      "Unlimited projects",
      "Unlimited AI queries",
      "Unlimited photos",
      "Advanced financial modeling",
      "All document templates",
      "Priority support",
    ],
    limits: { projects: Infinity, aiPerDay: Infinity, photos: Infinity, docGen: true, export: true, advancedFinancials: true },
  },
  ENTERPRISE: {
    name: "Enterprise",
    monthlyPrice: 14900,
    annualPrice: 143000,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY ?? "",
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL ?? "",
    features: [
      "Everything in Developer",
      "Team collaboration",
      "SSO authentication",
      "Audit logging",
      "SLA guarantees",
      "Dedicated support",
    ],
    limits: { projects: Infinity, aiPerDay: Infinity, photos: Infinity, docGen: true, export: true, advancedFinancials: true },
  },
};

export const FOUNDATION_LIMITS = {
  projects: 1,
  aiPerDay: 10,
  photos: 50,
  docGen: false,
  export: false,
  advancedFinancials: false,
};

export function getPlanLimits(plan: PlanTier) {
  if (plan === "FOUNDATION") return FOUNDATION_LIMITS;
  return PLAN_CONFIG[plan].limits;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export function getAnnualSavings(plan: Exclude<PlanTier, "FOUNDATION">): number {
  const config = PLAN_CONFIG[plan];
  return (config.monthlyPrice * 12) - config.annualPrice;
}
