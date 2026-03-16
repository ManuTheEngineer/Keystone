"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTopbar } from "../layout";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Home,
  TrendingUp,
  Building2,
  AlertTriangle,
  PlusCircle,
  BookOpen,
  Save,
  MessageSquare,
  RotateCcw,
  MapPin,
  DollarSign,
  Ruler,
  Landmark,
  CreditCard,
  BarChart3,
  Shield,
  HelpCircle,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { LearnTooltip } from "@/components/ui/LearnTooltip";
import { Badge } from "@/components/ui/Badge";
import { BudgetDonutChart, RiskIndicator } from "@/components/charts";
import {
  getMarketData,
  getCostBenchmarks,
  formatCurrency,
  formatCurrencyCompact,
  PHASE_ORDER,
} from "@keystone/market-data";
import type { Market, PropertyType, CurrencyConfig } from "@keystone/market-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BuildGoal = "sell" | "rent" | "occupy" | "";
type SizeCategory = "compact" | "standard" | "large" | "estate" | "custom";
type LandOption = "known" | "estimate" | "";
type FinancingType = "construction_loan" | "cash" | "fha_203k" | "diaspora" | "tontine" | "phased_cash" | "";

interface DealState {
  goal: BuildGoal;
  market: Market | "";
  propertyType: PropertyType | "";
  sizeCategory: SizeCategory;
  customSize: number;
  landOption: LandOption;
  landPrice: number;
  financingType: FinancingType;
  downPaymentPct: number;
  loanRate: number;
  timelineMonths: number;
  targetSalePrice: number;
  monthlyRent: number;
}

interface ScoreFactor {
  label: string;
  points: number;
  maxPoints: number;
  positive: boolean;
  explanation: string;
}

interface DealVerdict {
  score: number;
  factors: ScoreFactor[];
  verdict: string;
  verdictLevel: "strong" | "decent" | "risky";
  risks: string[];
  nextSteps: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_STATE: DealState = {
  goal: "",
  market: "",
  propertyType: "",
  sizeCategory: "standard",
  customSize: 0,
  landOption: "",
  landPrice: 0,
  financingType: "",
  downPaymentPct: 20,
  loanRate: 8,
  timelineMonths: 12,
  targetSalePrice: 0,
  monthlyRent: 0,
};

const STEP_COUNT = 8;

const STEP_TITLES = [
  "Your goal",
  "Location",
  "Property type",
  "Size",
  "Land",
  "Financing",
  "The numbers",
  "The verdict",
];

const STEP_ICONS = [
  TrendingUp,
  MapPin,
  Home,
  Ruler,
  Landmark,
  CreditCard,
  BarChart3,
  Shield,
];

// Size presets per unit system
function getSizePresets(unit: "sqft" | "sqm") {
  if (unit === "sqft") {
    return {
      compact: { min: 800, max: 1200, typical: 1000, label: "Under 1,200 sqft" },
      standard: { min: 1200, max: 2000, typical: 1600, label: "1,200 to 2,000 sqft" },
      large: { min: 2000, max: 3200, typical: 2600, label: "2,000 to 3,200 sqft" },
      estate: { min: 3200, max: 5000, typical: 4000, label: "3,200+ sqft" },
    };
  }
  return {
    compact: { min: 75, max: 110, typical: 90, label: "Under 110 sqm" },
    standard: { min: 110, max: 185, typical: 150, label: "110 to 185 sqm" },
    large: { min: 185, max: 300, typical: 240, label: "185 to 300 sqm" },
    estate: { min: 300, max: 500, typical: 380, label: "300+ sqm" },
  };
}

// ---------------------------------------------------------------------------
// Market helpers
// ---------------------------------------------------------------------------

function getSizeUnit(market: Market | ""): "sqft" | "sqm" {
  return market === "USA" ? "sqft" : "sqm";
}

function getCurrencyForMarket(market: Market | ""): CurrencyConfig {
  if (!market) {
    return { code: "USD", symbol: "$", locale: "en-US", decimals: 2, groupSeparator: ",", position: "prefix" as const };
  }
  return getMarketData(market).currency;
}

function getMarketCostPerUnit(market: Market): number {
  const benchmarks = getCostBenchmarks(market);
  return benchmarks.reduce((sum, b) => sum + b.midRange, 0);
}

function getMarketCostRange(market: Market): { low: number; mid: number; high: number } {
  const benchmarks = getCostBenchmarks(market);
  return {
    low: benchmarks.reduce((sum, b) => sum + b.lowRange, 0),
    mid: benchmarks.reduce((sum, b) => sum + b.midRange, 0),
    high: benchmarks.reduce((sum, b) => sum + b.highRange, 0),
  };
}

function getBuildingSize(state: DealState): number {
  if (state.sizeCategory === "custom") return state.customSize;
  if (!state.market) return 0;
  const unit = getSizeUnit(state.market);
  const presets = getSizePresets(unit);
  return presets[state.sizeCategory as keyof typeof presets]?.typical ?? 0;
}

function getConstructionCost(state: DealState): number {
  if (!state.market) return 0;
  const size = getBuildingSize(state);
  if (size <= 0) return 0;
  const costPerUnit = getMarketCostPerUnit(state.market as Market);
  return Math.round(costPerUnit * size);
}

function getLandCostEstimate(state: DealState): number {
  if (state.landOption === "known") return state.landPrice;
  // Estimate land at 25% of construction cost
  return Math.round(getConstructionCost(state) * 0.25);
}

function getSoftCosts(constructionCost: number): number {
  return Math.round(constructionCost * 0.15);
}

function getFinancingCosts(state: DealState, landCost: number, constructionCost: number): number {
  if (state.financingType === "cash" || state.financingType === "phased_cash") return 0;
  const totalBasis = landCost + constructionCost;
  const loanPortion = totalBasis * (1 - state.downPaymentPct / 100);
  return Math.round(loanPortion * (state.loanRate / 100) * (state.timelineMonths / 12));
}

function getContingency(constructionCost: number): number {
  return Math.round(constructionCost * 0.15);
}

function getTotalProjectCost(state: DealState): {
  land: number;
  construction: number;
  soft: number;
  financing: number;
  contingency: number;
  total: number;
} {
  const construction = getConstructionCost(state);
  const land = getLandCostEstimate(state);
  const soft = getSoftCosts(construction);
  const financing = getFinancingCosts(state, land, construction);
  const contingency = getContingency(construction);
  const total = land + construction + soft + financing + contingency;
  return { land, construction, soft, financing, contingency, total };
}

// ---------------------------------------------------------------------------
// Market snapshot data
// ---------------------------------------------------------------------------

interface MarketSnapshot {
  costRange: string;
  landRange: string;
  timeline: string;
  financing: string;
  construction: string;
}

function getMarketSnapshot(market: Market, currency: CurrencyConfig): MarketSnapshot {
  const unit = getSizeUnit(market);
  const costs = getMarketCostRange(market);

  if (market === "USA") {
    return {
      costRange: `${formatCurrencyCompact(costs.low, currency)} to ${formatCurrencyCompact(costs.high, currency)} per ${unit}`,
      landRange: "$15,000 to $150,000+ depending on region",
      timeline: "8 to 14 months for a typical single-family home",
      financing: "Construction loans, FHA, VA, cash",
      construction: "Wood-frame construction with institutional lending",
    };
  }

  // West Africa markets
  return {
    costRange: `${formatCurrencyCompact(costs.low, currency)} to ${formatCurrencyCompact(costs.high, currency)} per ${unit}`,
    landRange: "2,000,000 to 25,000,000 FCFA depending on location in Lome",
    timeline: "12 to 24 months, often built in phases as funds are available",
    financing: "Cash savings, diaspora funding, tontine groups",
    construction: "Reinforced concrete block (poteau-poutre system)",
  };
}

// ---------------------------------------------------------------------------
// Rent / sale estimates
// ---------------------------------------------------------------------------

function getEstimatedSaleValue(state: DealState): number {
  const costs = getTotalProjectCost(state);
  // New construction typically sells at 20% above cost in healthy markets
  return Math.round(costs.total * 1.20);
}

function getEstimatedMonthlyRent(state: DealState): number {
  if (!state.market) return 0;
  const size = getBuildingSize(state);
  if (state.market === "USA") {
    // Rough estimate: $0.80-1.20 per sqft/month
    return Math.round(size * 1.0);
  }
  // West Africa: roughly 1500-3000 CFA per sqm per month for standard
  return Math.round(size * 2000);
}

// ---------------------------------------------------------------------------
// Scoring engine
// ---------------------------------------------------------------------------

function calculateVerdict(state: DealState): DealVerdict {
  const costs = getTotalProjectCost(state);
  const factors: ScoreFactor[] = [];
  const risks: string[] = [];

  // 1. Profit margin / cap rate (25 points)
  if (state.goal === "sell") {
    const salePrice = state.targetSalePrice > 0 ? state.targetSalePrice : getEstimatedSaleValue(state);
    const profit = salePrice - costs.total;
    const margin = costs.total > 0 ? (profit / costs.total) * 100 : 0;

    if (margin > 20) {
      factors.push({ label: "Profit margin above 20%", points: 25, maxPoints: 25, positive: true, explanation: `Your estimated profit margin is ${margin.toFixed(1)}%. This provides a healthy buffer against cost overruns and market shifts.` });
    } else if (margin > 15) {
      factors.push({ label: "Profit margin 15 to 20%", points: 18, maxPoints: 25, positive: true, explanation: `Your margin of ${margin.toFixed(1)}% is solid but leaves limited room for surprises. Aim for tighter cost control.` });
    } else if (margin > 10) {
      factors.push({ label: "Profit margin 10 to 15%", points: 8, maxPoints: 25, positive: false, explanation: `A ${margin.toFixed(1)}% margin is thin. A single cost overrun or market dip could eliminate your profit.` });
      risks.push("Thin profit margin leaves little room for cost overruns or market dips.");
    } else {
      factors.push({ label: "Profit margin below 10%", points: 0, maxPoints: 25, positive: false, explanation: `At ${margin.toFixed(1)}%, this deal barely breaks even. Most experienced developers require at least 15% to justify the risk.` });
      risks.push("Profit margin below 10% means even a small delay or cost increase creates a loss.");
    }
  } else if (state.goal === "rent") {
    const monthlyRent = state.monthlyRent > 0 ? state.monthlyRent : getEstimatedMonthlyRent(state);
    const annualRent = monthlyRent * 12;
    const capRate = costs.total > 0 ? (annualRent / costs.total) * 100 : 0;

    if (capRate > 8) {
      factors.push({ label: "Cap rate above 8%", points: 25, maxPoints: 25, positive: true, explanation: `A ${capRate.toFixed(1)}% cap rate is excellent. This property generates strong income relative to its cost.` });
    } else if (capRate > 5) {
      factors.push({ label: "Cap rate 5 to 8%", points: 15, maxPoints: 25, positive: true, explanation: `A ${capRate.toFixed(1)}% cap rate is reasonable for most markets. You will build equity steadily.` });
    } else {
      factors.push({ label: "Cap rate below 5%", points: 0, maxPoints: 25, positive: false, explanation: `At ${capRate.toFixed(1)}%, the rental income is low relative to your investment. This property may not cash flow positively.` });
      risks.push("Low cap rate means the property is overpriced relative to its rental income potential.");
    }
  } else {
    // Occupy: compare to buying existing
    const savings = costs.total * 0.2;
    if (savings > 0) {
      factors.push({ label: "Savings versus buying existing", points: 20, maxPoints: 25, positive: true, explanation: `Building your own home could save approximately ${formatCurrencyCompact(savings, getCurrencyForMarket(state.market))} compared to buying a comparable existing property.` });
    }
  }

  // 2. Construction cost efficiency (15 points)
  if (state.market) {
    const costRange = getMarketCostRange(state.market as Market);
    const size = getBuildingSize(state);
    const actualPerUnit = size > 0 ? getConstructionCost(state) / size : 0;

    if (actualPerUnit <= costRange.mid) {
      factors.push({ label: "Construction cost at or below market average", points: 15, maxPoints: 15, positive: true, explanation: "Your estimated construction cost is within the typical range for this market. This is a good sign." });
    } else if (actualPerUnit <= costRange.high) {
      factors.push({ label: "Construction cost above market average", points: 8, maxPoints: 15, positive: false, explanation: "Your construction costs are above the market midpoint. Consider value engineering or negotiating with contractors." });
    } else {
      factors.push({ label: "Construction cost well above market range", points: 0, maxPoints: 15, positive: false, explanation: "Your construction costs exceed typical market rates. Review your specifications and get competitive bids." });
      risks.push("Construction costs above market averages reduce your margin and increase project risk.");
    }
  }

  // 3. Land cost ratio (15 points)
  if (costs.land > 0 && costs.total > 0) {
    const landRatio = (costs.land / costs.total) * 100;
    if (landRatio <= 25) {
      factors.push({ label: "Land cost under 25% of total", points: 15, maxPoints: 15, positive: true, explanation: `Land is ${landRatio.toFixed(0)}% of your total project cost. This is a healthy ratio that leaves room for construction value.` });
    } else if (landRatio <= 35) {
      factors.push({ label: "Land cost 25 to 35% of total", points: 10, maxPoints: 15, positive: true, explanation: `Land at ${landRatio.toFixed(0)}% of total cost is within the typical range but on the higher side.` });
    } else {
      factors.push({ label: "Land cost above 35% of total", points: 0, maxPoints: 15, positive: false, explanation: `At ${landRatio.toFixed(0)}% of total cost, land is eating into your budget. This limits how much value you can add through construction.` });
      risks.push("Land cost exceeds 35% of total project cost, which limits value creation through construction.");
    }
  }

  // 4. Timeline (15 points)
  if (state.timelineMonths <= 12) {
    factors.push({ label: "Timeline under 12 months", points: 15, maxPoints: 15, positive: true, explanation: "A shorter timeline reduces carrying costs and market exposure. This is achievable for most single-family homes." });
  } else if (state.timelineMonths <= 18) {
    factors.push({ label: "Timeline 12 to 18 months", points: 10, maxPoints: 15, positive: true, explanation: "This timeline is reasonable but will add to your carrying costs. Stay on top of your schedule." });
  } else {
    factors.push({ label: "Timeline over 18 months", points: 0, maxPoints: 15, positive: false, explanation: "Extended timelines significantly increase carrying costs and expose you to market risk." });
    risks.push("A build timeline over 18 months increases carrying costs and market exposure.");
  }

  // 5. Financing structure (15 points)
  if (state.financingType === "cash" || state.financingType === "phased_cash") {
    factors.push({ label: "Cash financing eliminates interest costs", points: 15, maxPoints: 15, positive: true, explanation: "Paying cash removes interest expense, simplifies the process, and gives you full control." });
  } else if (state.downPaymentPct >= 20) {
    factors.push({ label: "Down payment of 20% or more", points: 12, maxPoints: 15, positive: true, explanation: "A 20%+ down payment gives you equity cushion and typically qualifies for better loan terms." });
  } else if (state.downPaymentPct >= 10) {
    factors.push({ label: "Down payment 10 to 20%", points: 8, maxPoints: 15, positive: false, explanation: "Lower down payments increase your loan amount and monthly interest costs." });
  } else {
    factors.push({ label: "Down payment under 10%", points: 3, maxPoints: 15, positive: false, explanation: "Minimal equity increases your risk. If costs overrun, you may owe more than the property is worth." });
    risks.push("Low down payment means you have minimal equity buffer if the project hits problems.");
  }

  // 6. Market demand (15 points, estimated)
  factors.push({ label: "Market demand (estimated)", points: 12, maxPoints: 15, positive: true, explanation: "Based on current market conditions. Actual demand depends on your specific location and timing." });

  // Additional risk factors
  if (state.goal === "sell" && state.timelineMonths > 12) {
    risks.push("Market conditions may change during your build. Lock in your target buyer profile early.");
  }
  if (state.financingType === "construction_loan") {
    risks.push("Interest rate increases during construction would raise your carrying costs.");
  }
  risks.push("Construction costs could exceed estimates by 10 to 20%. Your contingency budget is your safety net.");

  const score = factors.reduce((sum, f) => sum + f.points, 0);
  let verdict: string;
  let verdictLevel: "strong" | "decent" | "risky";

  if (score >= 70) {
    verdict = "Strong deal. The numbers support moving forward with planning.";
    verdictLevel = "strong";
  } else if (score >= 50) {
    verdict = "Decent deal with some risk factors. Review the areas that scored low and adjust your assumptions.";
    verdictLevel = "decent";
  } else {
    verdict = "This deal carries significant risk. Consider adjusting your assumptions or exploring different options.";
    verdictLevel = "risky";
  }

  const nextSteps = [
    state.goal === "sell" ? "Research comparable recent sales in your target area to validate your sale price assumption." : "",
    state.goal === "rent" ? "Survey rental listings in your target area to confirm your rent estimate." : "",
    "Get at least three contractor bids to validate your construction cost estimate.",
    "Consult a local real estate attorney about zoning and permit requirements.",
    state.market !== "USA" ? "Verify land title status and ownership history before any purchase." : "",
  ].filter(Boolean);

  return { score, factors, verdict, verdictLevel, risks, nextSteps };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepHeader({ step, heading, content }: { step: number; heading: string; content: string }) {
  return (
    <div className="mb-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-clay/60 mb-2">
        Step {step + 1} of {STEP_COUNT}
      </p>
      <h2 className="text-[22px] font-heading font-semibold text-earth leading-tight mb-3">
        {heading}
      </h2>
      <p className="text-[14px] text-muted leading-relaxed max-w-xl">
        {content}
      </p>
    </div>
  );
}

function MentorTip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-warm/50 border border-sand/40 rounded-xl p-4 mt-4">
      <BookOpen size={18} className="text-clay shrink-0 mt-0.5" />
      <p className="text-[12px] text-slate leading-relaxed">{children}</p>
    </div>
  );
}

function ExpandableDetail({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-border/40 pt-2 mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] text-clay font-medium hover:text-earth transition-colors"
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {label}
      </button>
      {open && (
        <div className="mt-2 text-[12px] text-muted leading-relaxed animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

function ValidationFeedback({ message, type }: { message: string; type: "info" | "warning" | "success" }) {
  const colors = {
    info: "bg-blue-50/50 border-blue-200/40 text-blue-800",
    warning: "bg-amber-50/50 border-amber-200/40 text-amber-800",
    success: "bg-emerald-50/50 border-emerald-200/40 text-emerald-800",
  };
  const icons = {
    info: <Info size={14} className="shrink-0 mt-0.5" />,
    warning: <AlertTriangle size={14} className="shrink-0 mt-0.5" />,
    success: <Check size={14} className="shrink-0 mt-0.5" />,
  };

  return (
    <div className={`flex gap-2.5 text-[12px] leading-relaxed rounded-lg border px-3 py-2.5 mt-3 ${colors[type]}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  );
}

function CostBreakdownBar({ label, amount, total, color, currency }: {
  label: string;
  amount: number;
  total: number;
  color: string;
  currency: CurrencyConfig;
}) {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-muted w-28 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-surface-alt rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.max(pct, 1)}%` }}
        />
      </div>
      <span className="text-[11px] font-data text-slate w-16 text-right">
        {formatCurrencyCompact(amount, currency)}
      </span>
      <span className="text-[10px] font-data text-muted w-10 text-right">{pct.toFixed(0)}%</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DealAnalyzerClient() {
  const { setTopbar } = useTopbar();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<DealState>(INITIAL_STATE);

  useEffect(() => {
    setTopbar("Deal Analyzer", "Evaluate a potential construction deal step by step", "info");
  }, [setTopbar]);

  const currency = getCurrencyForMarket(state.market);
  const unit = getSizeUnit(state.market);
  const costs = useMemo(() => getTotalProjectCost(state), [state]);
  const verdict = useMemo(() => calculateVerdict(state), [state]);

  function update<K extends keyof DealState>(key: K, value: DealState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0: return state.goal !== "";
      case 1: return state.market !== "";
      case 2: return state.propertyType !== "";
      case 3: return getBuildingSize(state) > 0;
      case 4: return state.landOption !== "";
      case 5: return state.financingType !== "";
      case 6: return true;
      case 7: return true;
      default: return true;
    }
  }

  function handleCreateProject() {
    router.push("/new-project");
  }

  function handleSaveAnalysis() {
    try {
      const analysis = {
        state,
        costs,
        verdict,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem("keystone_deal_analysis", JSON.stringify(analysis));
      alert("Analysis saved. You can return to it anytime from this page.");
    } catch {
      // localStorage may be unavailable
    }
  }

  function handleStartOver() {
    setState(INITIAL_STATE);
    setStep(0);
  }

  // -------------------------------------------------------------------------
  // Step 1: Goal
  // -------------------------------------------------------------------------
  function renderGoal() {
    const goals: Array<{
      id: BuildGoal;
      icon: React.ReactNode;
      title: string;
      subtitle: string;
      detail: string;
      metric: string;
    }> = [
      {
        id: "sell",
        icon: <TrendingUp size={24} />,
        title: "Build to sell (flip)",
        subtitle: "Buy land, build a house, sell it for profit",
        detail: "This strategy focuses on maximizing your sale price relative to your total cost. You buy or already own land, build a home designed to appeal to buyers, and sell it at completion. The goal is speed and efficiency. Every dollar of cost overrun comes directly out of your profit.",
        metric: "Typical profit margin: 15 to 25% of total project cost",
      },
      {
        id: "rent",
        icon: <Building2 size={24} />,
        title: "Build to rent (invest)",
        subtitle: "Build a rental property for ongoing income",
        detail: "This strategy prioritizes long-term wealth building. You build a property, find tenants, and collect rent. Returns are slower but compound over time as property values appreciate and tenants pay down your mortgage. The key metric is cash flow: how much income remains after all expenses.",
        metric: "Typical cap rate: 6 to 10% annually",
      },
      {
        id: "occupy",
        icon: <Home size={24} />,
        title: "Build to live (owner-builder)",
        subtitle: "Build your own home and save the contractor markup",
        detail: "When you build your own home, you eliminate the 15 to 25% markup that a general contractor would charge. Your focus is on getting the best value for your money, not on profit. This is the most common path for first-time builders who want a home tailored to their needs.",
        metric: "Typical savings versus buying existing: 15 to 25%",
      },
    ];

    return (
      <div className="animate-fade-in">
        <StepHeader
          step={0}
          heading="Let us start with the big picture"
          content="Before we look at any numbers, let us understand what you want to achieve. Your goal determines how we evaluate every decision that follows."
        />

        <div className="space-y-4">
          {goals.map((g) => (
            <button
              key={g.id}
              onClick={() => update("goal", g.id)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                state.goal === g.id
                  ? "border-emerald-500 bg-emerald-50/30 shadow-sm"
                  : "border-border bg-surface hover:border-sand hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 ${state.goal === g.id ? "text-emerald-600" : "text-muted"}`}>
                  {g.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-semibold text-earth">{g.title}</h3>
                    {state.goal === g.id && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-[12px] text-muted mt-1">{g.subtitle}</p>
                  <p className="text-[12px] text-slate leading-relaxed mt-2">{g.detail}</p>
                  <p className="text-[11px] font-data font-medium text-clay mt-2">{g.metric}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {state.goal && (
          <MentorTip>
            {state.goal === "sell" && "As a flip, your success depends on two things: controlling construction costs and accurately estimating what buyers will pay. We will help you evaluate both."}
            {state.goal === "rent" && "For rental properties, the most important number is cash flow. A property that looks profitable on paper can lose money every month if your rent does not cover all expenses. We will walk through the full picture."}
            {state.goal === "occupy" && "Building your own home is one of the best financial decisions you can make. You get exactly what you want while avoiding the general contractor markup. Let us make sure the numbers work for your budget."}
          </MentorTip>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Step 2: Market
  // -------------------------------------------------------------------------
  function renderMarket() {
    const markets: Array<{
      id: Market;
      title: string;
      description: string;
      facts: string[];
    }> = [
      {
        id: "USA",
        title: "United States",
        description: "Wood-frame construction with institutional lending options. Strong regulatory environment with building codes and inspections at every stage.",
        facts: [
          "Typical cost: $120 to $250 per square foot",
          "Construction loans widely available (75 to 80% financing)",
          "Licensed contractors required in most states",
          "Building permits and inspections enforced",
        ],
      },
      {
        id: "TOGO",
        title: "Togo",
        description: "Reinforced concrete (poteau-poutre) construction. Building is typically funded with cash savings or diaspora remittances. Growing urban demand in Lome and surrounding areas.",
        facts: [
          "Typical cost: 150,000 to 350,000 FCFA per square meter",
          "Cash or phased construction is the standard approach",
          "Skilled macons (masons) are essential for quality",
          "Titre foncier (land title) verification is critical before purchase",
        ],
      },
      {
        id: "GHANA",
        title: "Ghana",
        description: "Concrete block construction similar to other West African markets. Growing mortgage market but most residential construction is still self-funded.",
        facts: [
          "Typical cost: GH$800 to GH$2,500 per square meter",
          "Mortgage market is developing but limited",
          "Land registration through Lands Commission",
          "Strong demand in Accra, Kumasi, and Tema",
        ],
      },
      {
        id: "BENIN",
        title: "Benin",
        description: "Concrete block construction with methods and costs similar to Togo. The CFA franc zone provides currency stability for diaspora investors.",
        facts: [
          "Typical cost: 150,000 to 350,000 FCFA per square meter",
          "Same CFA franc currency zone as Togo",
          "Growing demand in Cotonou and Porto-Novo",
          "Land tenure verification essential before purchase",
        ],
      },
    ];

    return (
      <div className="animate-fade-in">
        <StepHeader
          step={1}
          heading="Location determines everything"
          content="Your market affects construction costs, financing options, regulations, and profit potential. Different markets have fundamentally different approaches to building."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {markets.map((m) => (
            <button
              key={m.id}
              onClick={() => update("market", m.id)}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                state.market === m.id
                  ? "border-emerald-500 bg-emerald-50/30 shadow-sm"
                  : "border-border bg-surface hover:border-sand hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[14px] font-semibold text-earth">{m.title}</h3>
                {state.market === m.id && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>
              <p className="text-[12px] text-muted leading-relaxed mb-3">{m.description}</p>
              <ul className="space-y-1.5">
                {m.facts.map((fact, i) => (
                  <li key={i} className="text-[11px] text-slate flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-clay mt-1.5 shrink-0" />
                    {fact}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Market snapshot */}
        {state.market && (
          <div className="mt-6 animate-fade-in">
            <SectionLabel>Market snapshot</SectionLabel>
            <Card>
              {(() => {
                const snapshot = getMarketSnapshot(state.market as Market, currency);
                const items = [
                  { label: "Construction cost range", value: snapshot.costRange },
                  { label: "Typical land cost", value: snapshot.landRange },
                  { label: "Project timeline", value: snapshot.timeline },
                  { label: "Financing options", value: snapshot.financing },
                  { label: "Construction method", value: snapshot.construction },
                ];
                return (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.label} className="flex justify-between gap-4">
                        <span className="text-[12px] text-muted shrink-0">{item.label}</span>
                        <span className="text-[12px] font-medium text-earth text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Card>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Step 3: Property type
  // -------------------------------------------------------------------------
  function renderPropertyType() {
    const types: Array<{
      id: PropertyType;
      title: string;
      description: string;
      complexity: number;
      beginner: boolean;
      revenueNote: string;
    }> = [
      {
        id: "SFH",
        title: "Single-family home",
        description: "A stand-alone house for one household. The simplest to build, finance, and manage. This is the most common starting point for first-time builders.",
        complexity: 1,
        beginner: true,
        revenueNote: state.goal === "rent" ? "One tenant, one lease, straightforward management" : "Broadest buyer or occupant appeal",
      },
      {
        id: "DUPLEX",
        title: "Duplex",
        description: "Two separate units in one building. You can live in one unit and rent the other, or rent both. Construction cost per unit is lower than building two separate homes.",
        complexity: 2,
        beginner: true,
        revenueNote: state.goal === "rent" ? "Two income streams from one property. Live in one, rent the other." : "Can be sold as an investment property at a premium",
      },
      {
        id: "TRIPLEX",
        title: "Triplex",
        description: "Three separate units. More income potential but also more complex construction, permitting, and management. Requires more experience to execute well.",
        complexity: 3,
        beginner: false,
        revenueNote: state.goal === "rent" ? "Three income streams. Vacancy in one unit is offset by the others." : "Investment-grade property with strong buyer interest",
      },
      {
        id: "FOURPLEX",
        title: "Fourplex",
        description: "Four separate units. The largest multi-unit property that still qualifies for residential (not commercial) financing in the US. Popular with investors.",
        complexity: 4,
        beginner: false,
        revenueNote: state.goal === "rent" ? "Four income streams. Still qualifies for residential lending in the US." : "Strong investment property with economies of scale",
      },
      {
        id: "APARTMENT",
        title: "Apartment building",
        description: "Five or more units. Requires commercial financing, professional management, and significant construction experience. Not recommended for first-time builders.",
        complexity: 5,
        beginner: false,
        revenueNote: state.goal === "rent" ? "Maximum income potential but requires professional management" : "Commercial-grade investment property",
      },
    ];

    return (
      <div className="animate-fade-in">
        <StepHeader
          step={2}
          heading="Property type shapes your costs and returns"
          content="More units means more income potential but also more complexity and cost. Start with what you can manage. You can always scale up on your next project."
        />

        <div className="space-y-3">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => update("propertyType", t.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                state.propertyType === t.id
                  ? "border-emerald-500 bg-emerald-50/30 shadow-sm"
                  : "border-border bg-surface hover:border-sand hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[13px] font-semibold text-earth">{t.title}</h3>
                    {t.beginner && <Badge variant="emerald">Good for beginners</Badge>}
                    {state.propertyType === t.id && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-[12px] text-muted leading-relaxed mt-1">{t.description}</p>
                  <p className="text-[11px] font-medium text-clay mt-2">{t.revenueNote}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Complexity</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-3 h-3 rounded-sm ${
                          level <= t.complexity ? "bg-clay" : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Step 4: Size
  // -------------------------------------------------------------------------
  function renderSize() {
    if (!state.market) return null;

    const presets = getSizePresets(unit);
    const costPerUnit = state.market ? getMarketCostPerUnit(state.market as Market) : 0;

    const sizeOptions: Array<{
      id: SizeCategory;
      title: string;
      range: string;
      description: string;
      estimatedCost: number;
    }> = [
      {
        id: "compact",
        title: "Compact",
        range: presets.compact.label,
        description: "Efficient layout. Lower total cost. Easier to rent in most markets. Ideal for starter homes or investment properties targeting young professionals.",
        estimatedCost: Math.round(presets.compact.typical * costPerUnit),
      },
      {
        id: "standard",
        title: "Standard",
        range: presets.standard.label,
        description: "The most popular size range. Broad market appeal for both buyers and renters. Sufficient for a family of four. This is the sweet spot for most projects.",
        estimatedCost: Math.round(presets.standard.typical * costPerUnit),
      },
      {
        id: "large",
        title: "Large",
        range: presets.large.label,
        description: "Premium segment. Larger living spaces, more bedrooms, and room for extras like a home office or media room. Higher cost but also higher value.",
        estimatedCost: Math.round(presets.large.typical * costPerUnit),
      },
      {
        id: "estate",
        title: "Estate",
        range: presets.estate.label,
        description: "Luxury market. Requires strong local demand to justify the cost. Higher construction complexity and longer timeline. Best for experienced builders.",
        estimatedCost: Math.round(presets.estate.typical * costPerUnit),
      },
    ];

    return (
      <div className="animate-fade-in">
        <StepHeader
          step={3}
          heading="Size drives your budget"
          content={`Every additional ${unit === "sqft" ? "square foot" : "square meter"} adds to your cost. Here is what is typical for your market and property type. The estimated costs below are calculated from current market benchmarks.`}
        />

        <div className="space-y-3">
          {sizeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => update("sizeCategory", opt.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                state.sizeCategory === opt.id && state.sizeCategory !== "custom"
                  ? "border-emerald-500 bg-emerald-50/30 shadow-sm"
                  : "border-border bg-surface hover:border-sand hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-semibold text-earth">{opt.title}</h3>
                    {opt.id === "standard" && <Badge variant="emerald">Most popular</Badge>}
                    {state.sizeCategory === opt.id && state.sizeCategory !== "custom" && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-data text-clay mt-1">{opt.range}</p>
                  <p className="text-[12px] text-muted leading-relaxed mt-1">{opt.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Est. construction</p>
                  <p className="text-[16px] font-data font-semibold text-earth">
                    {formatCurrencyCompact(opt.estimatedCost, currency)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Custom size option */}
        <div className="mt-4">
          <button
            onClick={() => update("sizeCategory", "custom")}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              state.sizeCategory === "custom"
                ? "border-emerald-500 bg-emerald-50/30 shadow-sm"
                : "border-border bg-surface hover:border-sand"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[13px] font-semibold text-earth">Custom size</h3>
              {state.sizeCategory === "custom" && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>
            <p className="text-[12px] text-muted">I know the exact size I want to build.</p>
          </button>

          {state.sizeCategory === "custom" && (
            <div className="mt-3 p-4 bg-surface-alt/30 rounded-xl animate-fade-in">
              <label className="block text-[12px] font-medium text-slate mb-1.5">
                Building size ({unit})
              </label>
              <input
                type="number"
                value={state.customSize || ""}
                onChange={(e) => update("customSize", parseFloat(e.target.value) || 0)}
                placeholder={unit === "sqft" ? "e.g. 1800" : "e.g. 165"}
                className="w-full py-2.5 px-3 text-[13px] border border-border rounded-lg bg-surface text-earth placeholder:text-muted/40 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-data"
              />
              {state.customSize > 0 && (
                <p className="text-[11px] text-muted mt-2">
                  Estimated construction cost: <span className="font-data font-semibold text-earth">{formatCurrencyCompact(state.customSize * costPerUnit, currency)}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <MentorTip>
          {unit === "sqft"
            ? "For reference, the median new single-family home in the US is about 2,200 square feet. However, smaller homes are easier to finance, faster to build, and more affordable to heat and cool."
            : "For reference, a comfortable family home in Lome is typically 120 to 180 square meters. Building smaller keeps costs manageable and makes phased construction easier if you are funding in stages."
          }
        </MentorTip>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Step 5: Land
  // -------------------------------------------------------------------------
  function renderLand() {
    const constructionCost = getConstructionCost(state);
    const estimatedLand = Math.round(constructionCost * 0.25);

    return (
      <div className="animate-fade-in">
        <StepHeader
          step={4}
          heading="Finding the right lot"
          content="Land cost is typically 20 to 35% of your total project cost. If you have not found land yet, we can estimate based on your market. You can always adjust this later."
        />

        <div className="space-y-4">
          {/* Option: Known price */}
          <button
            onClick={() => update("landOption", "known")}
            className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
              state.landOption === "known"
                ? "border-emerald-500 bg-emerald-50/30 shadow-sm"
                : "border-border bg-surface hover:border-sand hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-semibold text-earth">I have a specific lot in mind</h3>
              {state.landOption === "known" && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>
            <p className="text-[12px] text-muted mt-1">I know the price or can look it up.</p>
          </button>

          {state.landOption === "known" && (
            <div className="p-4 bg-surface-alt/30 rounded-xl animate-fade-in">
              <label className="block text-[12px] font-medium text-slate mb-1.5">
                <LearnTooltip
                  term="Land Cost"
                  explanation="The price to purchase the land. This is separate from construction costs and is typically your largest single expense at the start of a project."
                  whyItMatters="Overpaying for land is the most common mistake in real estate development. Land cost is fixed once you buy. Unlike construction costs, you cannot negotiate it down after purchase."
                >
                  Land purchase price
                </LearnTooltip>
              </label>
              <div className="relative">
                {currency.position === "prefix" && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-muted font-data">
                    {currency.symbol}
                  </span>
                )}
                <input
                  type="number"
                  value={state.landPrice || ""}
                  onChange={(e) => update("landPrice", parseFloat(e.target.value) || 0)}
                  placeholder="Enter the asking price"
                  className={`w-full py-2.5 text-[13px] border border-border rounded-lg bg-surface text-earth placeholder:text-muted/40 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-data ${
                    currency.position === "prefix" ? "pl-8 pr-3" : "pl-3 pr-16"
                  }`}
                />
                {currency.position === "suffix" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted font-data">
                    {currency.symbol}
                  </span>
                )}
              </div>

              {/* Validation feedback */}
              {state.landPrice > 0 && constructionCost > 0 && (() => {
                const ratio = state.landPrice / (state.landPrice + constructionCost);
                if (ratio > 0.4) {
                  return <ValidationFeedback type="warning" message={`That land price is ${(ratio * 100).toFixed(0)}% of your total land-plus-construction cost. This is above the typical 20 to 35% range. High land costs squeeze your construction budget and reduce profit potential.`} />;
                }
                if (ratio < 0.1) {
                  return <ValidationFeedback type="info" message={`That land price is only ${(ratio * 100).toFixed(0)}% of your total land-plus-construction cost. This is unusually low. Verify that there are no issues with the lot (zoning, access, title, flood zone) that explain the low price.`} />;
                }
                return <ValidationFeedback type="success" message={`That land price is ${(ratio * 100).toFixed(0)}% of your total land-plus-construction cost. This is within the healthy range of 20 to 35%.`} />;
              })()}
            </div>
          )}

          {/* Option: Estimate */}
          <button
            onClick={() => update("landOption", "estimate")}
            className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
              state.landOption === "estimate"
                ? "border-emerald-500 bg-emerald-50/30 shadow-sm"
                : "border-border bg-surface hover:border-sand hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-semibold text-earth">I am still looking</h3>
              {state.landOption === "estimate" && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>
            <p className="text-[12px] text-muted mt-1">Estimate my land cost based on market averages.</p>
          </button>

          {state.landOption === "estimate" && (
            <div className="p-4 bg-surface-alt/30 rounded-xl animate-fade-in">
              <p className="text-[12px] text-slate leading-relaxed">
                We will estimate your land cost at <span className="font-data font-semibold text-earth">{formatCurrency(estimatedLand, currency)}</span>, which is 25% of your estimated construction cost. This is a conservative starting point. You can refine this estimate once you start shopping for land.
              </p>
            </div>
          )}
        </div>

        {state.market && state.market !== "USA" && (
          <MentorTip>
            In {state.market === "TOGO" ? "Togo" : state.market === "GHANA" ? "Ghana" : "Benin"}, always verify the land title before purchasing. A titre foncier (formal land title) is the most secure form of ownership. Customary or informal land agreements carry significant risk of future disputes. Have a notaire and a geometre verify the boundaries and ownership chain.
          </MentorTip>
        )}

        {state.market === "USA" && (
          <MentorTip>
            Before making an offer on land, verify three things: (1) zoning allows your intended use, (2) the lot has access to utilities (water, sewer or septic approval, electricity, gas), and (3) there are no environmental or flood zone issues. A failed perc test for septic or a wetland designation can make a lot unbuildable.
          </MentorTip>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Step 6: Financing
  // -------------------------------------------------------------------------
  function renderFinancing() {
    const isUSA = state.market === "USA";

    interface FinancingChoice {
      id: FinancingType;
      title: string;
      description: string;
      details: string;
      rate: string;
      downPayment: string;
    }

    const usaOptions: FinancingChoice[] = [
      {
        id: "construction_loan",
        title: "Construction loan",
        description: "Borrow 75 to 80% of total cost. The most common financing method for new construction in the US.",
        details: "A construction loan funds your build in stages called draws. The lender sends an inspector at each milestone before releasing the next payment. You pay interest only on the amount drawn so far. When construction is complete, the loan converts to a permanent mortgage or you refinance.",
        rate: "Typically 7 to 9% during construction",
        downPayment: "20 to 25% of total project cost",
      },
      {
        id: "fha_203k",
        title: "FHA 203(k)",
        description: "Lower down payment (3.5%) but more paperwork. Best for renovation projects rather than ground-up construction.",
        details: "This government-backed loan lets you finance both the purchase and renovation of an existing property with as little as 3.5% down. However, it requires an FHA-approved consultant, has strict timelines, and is generally not available for ground-up new construction. Best for buying a fixer-upper.",
        rate: "Competitive rates, typically near standard mortgage rates",
        downPayment: "As low as 3.5%",
      },
      {
        id: "cash",
        title: "Cash (self-fund)",
        description: "No interest costs. Full control over timing and decisions. But requires significant liquid capital.",
        details: "Paying cash eliminates interest expense, lender requirements, and draw inspections. You maintain complete control over your timeline and spending. However, you need to have the full project budget available in liquid funds, plus a 15 to 20% contingency reserve. Tying up this much capital has an opportunity cost.",
        rate: "No interest. Save tens of thousands over the project.",
        downPayment: "100% of project cost plus contingency",
      },
    ];

    const waOptions: FinancingChoice[] = [
      {
        id: "phased_cash",
        title: "Phased cash construction",
        description: "Build as you save. Complete each construction phase before starting the next. The most common approach in West Africa.",
        details: "This is how most homes in West Africa are built. You save money, complete one phase (foundation, walls, roof, finishes), then save again for the next phase. A project might take 2 to 5 years to complete. The advantage is zero debt. The disadvantage is a long timeline and the risk that material prices increase between phases.",
        rate: "No interest. Build at your own pace.",
        downPayment: "Fund each phase individually",
      },
      {
        id: "diaspora",
        title: "Diaspora funding",
        description: "Send money from abroad for construction. Use milestone-based payments to control spending and verify progress.",
        details: "If you live abroad and are building in your home country, you fund the project through remittances. The critical challenge is oversight. Use a trusted local contact (family or hired project manager) and require photo verification at each milestone before releasing the next payment. Keystone is designed to help you manage this process remotely.",
        rate: "No interest, but factor in transfer fees (2 to 5%)",
        downPayment: "Fund in milestone-based installments",
      },
      {
        id: "tontine",
        title: "Tontine (group savings)",
        description: "Pool resources with trusted partners. A traditional West African savings mechanism adapted for construction.",
        details: "A tontine is a rotating savings group where members contribute a fixed amount regularly and take turns receiving the full pot. Some tontines are specifically organized for construction. The key risk is trust, since there is no legal enforcement mechanism if a member defaults. Choose your tontine members carefully and agree on clear rules upfront.",
        rate: "No interest. Community-based financing.",
        downPayment: "Varies by tontine structure",
      },
    ];

    const options = isUSA ? usaOptions : waOptions;

    return (
      <div className="animate-fade-in">
        <StepHeader
          step={5}
          heading="How will you pay for this?"
          content="The way you fund construction affects your total cost, monthly payments, and how much profit you keep. There is no single best option. The right choice depends on your cash reserves, risk tolerance, and timeline."
        />

        <div className="space-y-4">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                update("financingType", opt.id);
                if (opt.id === "cash" || opt.id === "phased_cash") {
                  update("downPaymentPct", 100);
                  update("loanRate", 0);
                } else if (opt.id === "fha_203k") {
                  update("downPaymentPct", 3.5);
                  update("loanRate", 7);
                } else if (opt.id === "construction_loan") {
                  update("downPaymentPct", 20);
                  update("loanRate", 8);
                } else {
                  update("downPaymentPct", 100);
                  update("loanRate", 0);
                }
              }}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                state.financingType === opt.id
                  ? "border-emerald-500 bg-emerald-50/30 shadow-sm"
                  : "border-border bg-surface hover:border-sand hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[13px] font-semibold text-earth">{opt.title}</h3>
                {state.financingType === opt.id && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>
              <p className="text-[12px] text-muted leading-relaxed">{opt.description}</p>

              {state.financingType === opt.id && (
                <div className="mt-3 pt-3 border-t border-border/40 animate-fade-in">
                  <p className="text-[12px] text-slate leading-relaxed">{opt.details}</p>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-surface-alt/50 rounded-lg p-2.5">
                      <p className="text-[10px] text-muted uppercase tracking-wider">Interest rate</p>
                      <p className="text-[12px] font-data font-medium text-earth mt-0.5">{opt.rate}</p>
                    </div>
                    <div className="bg-surface-alt/50 rounded-lg p-2.5">
                      <p className="text-[10px] text-muted uppercase tracking-wider">Down payment</p>
                      <p className="text-[12px] font-data font-medium text-earth mt-0.5">{opt.downPayment}</p>
                    </div>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Adjustable parameters for loan-based financing */}
        {state.financingType && state.financingType !== "cash" && state.financingType !== "phased_cash" && state.financingType !== "diaspora" && state.financingType !== "tontine" && (
          <div className="mt-6 animate-fade-in">
            <SectionLabel>Adjust financing terms</SectionLabel>
            <Card>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-slate mb-1.5">
                    <LearnTooltip
                      term="Down Payment"
                      explanation="The cash you put in upfront. The rest comes from the loan. A larger down payment means less borrowing, lower interest costs, and lower monthly payments."
                      whyItMatters="Your down payment is your equity cushion. If construction costs exceed estimates, this equity protects you from owing more than the property is worth."
                    >
                      Down payment (%)
                    </LearnTooltip>
                  </label>
                  <input
                    type="number"
                    value={state.downPaymentPct}
                    onChange={(e) => update("downPaymentPct", parseFloat(e.target.value) || 0)}
                    className="w-full py-2.5 px-3 text-[13px] border border-border rounded-lg bg-surface text-earth font-data focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate mb-1.5">
                    <LearnTooltip
                      term="Interest Rate"
                      explanation="The annual percentage the lender charges for borrowing. Construction loans typically carry higher rates than permanent mortgages because they are riskier for the lender."
                      whyItMatters={`At ${state.loanRate}% on a ${formatCurrencyCompact(costs.total * 0.8, currency)} loan, you pay roughly ${formatCurrencyCompact(costs.total * 0.8 * (state.loanRate / 100) / 12, currency)} per month in interest alone.`}
                    >
                      Interest rate (%)
                    </LearnTooltip>
                  </label>
                  <input
                    type="number"
                    value={state.loanRate}
                    onChange={(e) => update("loanRate", parseFloat(e.target.value) || 0)}
                    className="w-full py-2.5 px-3 text-[13px] border border-border rounded-lg bg-surface text-earth font-data focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate mb-1.5">
                    <LearnTooltip
                      term="Build Timeline"
                      explanation="The total number of months from project start to completion. Every month of construction adds to your interest costs, insurance premiums, and other carrying expenses."
                      whyItMatters="Every month of delay costs you money. A 12-month project at 8% interest costs roughly 8% of your loan balance. Extend that to 18 months and you pay 50% more in interest."
                    >
                      Timeline (months)
                    </LearnTooltip>
                  </label>
                  <input
                    type="number"
                    value={state.timelineMonths}
                    onChange={(e) => update("timelineMonths", parseFloat(e.target.value) || 0)}
                    className="w-full py-2.5 px-3 text-[13px] border border-border rounded-lg bg-surface text-earth font-data focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Financing cost preview */}
              {costs.financing > 0 && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted">Estimated down payment</span>
                    <span className="font-data font-medium text-earth">
                      {formatCurrency(costs.total * (state.downPaymentPct / 100), currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[12px] mt-1">
                    <span className="text-muted">Total interest cost during construction</span>
                    <span className="font-data font-medium text-earth">
                      {formatCurrency(costs.financing, currency)}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Step 7: The numbers
  // -------------------------------------------------------------------------
  function renderNumbers() {
    const size = getBuildingSize(state);
    const costPerUnit = state.market ? getMarketCostPerUnit(state.market as Market) : 0;

    // Revenue projections based on goal
    const estimatedSaleValue = getEstimatedSaleValue(state);
    const estimatedMonthlyRent = getEstimatedMonthlyRent(state);

    const salePrice = state.targetSalePrice > 0 ? state.targetSalePrice : estimatedSaleValue;
    const monthlyRent = state.monthlyRent > 0 ? state.monthlyRent : estimatedMonthlyRent;

    const grossProfit = salePrice - costs.total;
    const profitMargin = costs.total > 0 ? (grossProfit / costs.total) * 100 : 0;

    const annualRent = monthlyRent * 12;
    const capRate = costs.total > 0 ? (annualRent / costs.total) * 100 : 0;
    const equity = costs.total * (state.downPaymentPct / 100);
    const loanAmount = costs.total - equity;
    const annualDebtService = loanAmount * (state.loanRate / 100);
    const noi = annualRent * 0.7; // 30% expense ratio
    const annualCashFlow = noi - annualDebtService;
    const monthlyCashFlow = annualCashFlow / 12;
    const cashOnCash = equity > 0 ? (annualCashFlow / equity) * 100 : 0;

    const donutItems = [
      { category: "Land", amount: costs.land, color: "#8B4513" },
      { category: "Construction", amount: costs.construction, color: "#2C1810" },
      { category: "Soft costs (15%)", amount: costs.soft, color: "#D4A574" },
      { category: "Financing", amount: costs.financing, color: "#BC6C25" },
      { category: "Contingency (15%)", amount: costs.contingency, color: "#1B4965" },
    ].filter((item) => item.amount > 0);

    return (
      <div className="animate-fade-in">
        <StepHeader
          step={6}
          heading="Let us look at the numbers"
          content="Here is what your project looks like based on everything you have told us. Review each number. Every calculation is explained. If something does not look right, go back and adjust."
        />

        {/* Cost breakdown */}
        <SectionLabel>Cost breakdown</SectionLabel>
        <Card>
          <div className="space-y-3">
            <div className="flex justify-between text-[12px]">
              <span className="text-muted">Land cost</span>
              <span className="font-data font-medium text-earth">{formatCurrency(costs.land, currency)}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-muted">
                Construction cost
                <span className="text-[10px] text-muted/70 ml-1">
                  ({formatCurrencyCompact(costPerUnit, currency)}/{unit} x {size.toLocaleString()} {unit})
                </span>
              </span>
              <span className="font-data font-medium text-earth">{formatCurrency(costs.construction, currency)}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <LearnTooltip
                term="Soft Costs"
                explanation="Architecture, engineering, permits, insurance, legal fees, and other non-construction expenses. We estimate these at 15% of hard construction costs."
                whyItMatters="First-time builders consistently underestimate soft costs. Permit fees, impact fees, and professional services add up quickly."
              >
                <span className="text-muted">Soft costs (15%)</span>
              </LearnTooltip>
              <span className="font-data font-medium text-earth">{formatCurrency(costs.soft, currency)}</span>
            </div>
            {costs.financing > 0 && (
              <div className="flex justify-between text-[12px]">
                <LearnTooltip
                  term="Financing Costs"
                  explanation={`Interest paid on your construction loan during the ${state.timelineMonths}-month build period. Calculated as: loan amount x interest rate x time.`}
                  whyItMatters="These costs are often overlooked. Every month of delay adds more interest expense."
                >
                  <span className="text-muted">Financing costs</span>
                </LearnTooltip>
                <span className="font-data font-medium text-earth">{formatCurrency(costs.financing, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-[12px]">
              <LearnTooltip
                term="Contingency"
                explanation="A reserve fund for unexpected costs. Construction projects almost always encounter surprises: hidden soil conditions, material price increases, design changes, or weather delays. We recommend 15% of construction cost."
                whyItMatters="Projects without contingency reserves frequently stall when unexpected costs arise. This buffer is not optional; it is essential."
              >
                <span className="text-muted">Contingency (15%)</span>
              </LearnTooltip>
              <span className="font-data font-medium text-earth">{formatCurrency(costs.contingency, currency)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-[14px]">
              <span className="font-semibold text-earth">Total project cost</span>
              <span className="font-data font-bold text-earth">{formatCurrency(costs.total, currency)}</span>
            </div>
          </div>
        </Card>

        {/* Visual breakdown */}
        <div className="mt-4">
          <BudgetDonutChart items={donutItems} total={costs.total} currency={currency} />
        </div>

        {/* Revenue projection */}
        <div className="mt-6">
          <SectionLabel>
            {state.goal === "sell" ? "Sale projection" : state.goal === "rent" ? "Rental projection" : "Ownership analysis"}
          </SectionLabel>

          {state.goal === "sell" && (
            <Card>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-slate mb-1.5">
                    <LearnTooltip
                      term="Target Sale Price"
                      explanation="What you expect to sell the completed property for. Research comparable recent sales (comps) in the area. Be conservative. Overestimating your sale price is the fastest way to lose money."
                      whyItMatters="Your sale price determines whether this deal is profitable. A 10% overestimate on sale price can turn a profitable deal into a loss."
                    >
                      Target sale price
                    </LearnTooltip>
                  </label>
                  <div className="relative">
                    {currency.position === "prefix" && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-muted font-data">{currency.symbol}</span>
                    )}
                    <input
                      type="number"
                      value={state.targetSalePrice || ""}
                      onChange={(e) => update("targetSalePrice", parseFloat(e.target.value) || 0)}
                      placeholder={`Estimated: ${formatCurrency(estimatedSaleValue, currency)}`}
                      className={`w-full py-2.5 text-[13px] border border-border rounded-lg bg-surface text-earth placeholder:text-muted/40 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-data ${
                        currency.position === "prefix" ? "pl-8 pr-3" : "pl-3 pr-16"
                      }`}
                    />
                  </div>
                  {state.targetSalePrice === 0 && (
                    <p className="text-[11px] text-muted mt-1.5">
                      Leave blank to use our estimate of {formatCurrency(estimatedSaleValue, currency)} (total cost + 20% markup).
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <StatCard
                    value={formatCurrencyCompact(grossProfit, currency)}
                    label="Gross profit"
                    valueClassName={grossProfit >= 0 ? "text-success" : "text-danger"}
                  />
                  <StatCard
                    value={`${profitMargin.toFixed(1)}%`}
                    label="Profit margin"
                    valueClassName={profitMargin >= 15 ? "text-success" : profitMargin >= 10 ? "text-warning" : "text-danger"}
                  />
                  <StatCard
                    value={formatCurrencyCompact(salePrice, currency)}
                    label="Sale price"
                  />
                </div>

                <ExpandableDetail label="How did we calculate this?">
                  <div className="space-y-1.5">
                    <p>Gross profit = Sale price - Total project cost</p>
                    <p>{formatCurrency(salePrice, currency)} - {formatCurrency(costs.total, currency)} = {formatCurrency(grossProfit, currency)}</p>
                    <p className="mt-2">Profit margin = Gross profit / Total project cost</p>
                    <p>{formatCurrency(grossProfit, currency)} / {formatCurrency(costs.total, currency)} = {profitMargin.toFixed(1)}%</p>
                    <p className="mt-2">Most experienced developers target a minimum 15% profit margin to cover the risk of cost overruns and market fluctuations.</p>
                  </div>
                </ExpandableDetail>
              </div>
            </Card>
          )}

          {state.goal === "rent" && (
            <Card>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-slate mb-1.5">
                    <LearnTooltip
                      term="Monthly Rent"
                      explanation="The gross monthly rent you expect to collect. Research comparable rental listings in your target area. Be conservative and assume some vacancy."
                      whyItMatters="Overestimating rent is the most common mistake in rental analysis. Even a 10% overestimate can turn positive cash flow into a monthly loss."
                    >
                      Target monthly rent
                    </LearnTooltip>
                  </label>
                  <div className="relative">
                    {currency.position === "prefix" && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-muted font-data">{currency.symbol}</span>
                    )}
                    <input
                      type="number"
                      value={state.monthlyRent || ""}
                      onChange={(e) => update("monthlyRent", parseFloat(e.target.value) || 0)}
                      placeholder={`Estimated: ${formatCurrency(estimatedMonthlyRent, currency)}/mo`}
                      className={`w-full py-2.5 text-[13px] border border-border rounded-lg bg-surface text-earth placeholder:text-muted/40 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-data ${
                        currency.position === "prefix" ? "pl-8 pr-3" : "pl-3 pr-16"
                      }`}
                    />
                  </div>
                  {state.monthlyRent === 0 && (
                    <p className="text-[11px] text-muted mt-1.5">
                      Leave blank to use our estimate of {formatCurrency(estimatedMonthlyRent, currency)}/month based on market data.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <StatCard
                    value={`${capRate.toFixed(1)}%`}
                    label="Cap rate"
                    valueClassName={capRate >= 8 ? "text-success" : capRate >= 5 ? "text-warning" : "text-danger"}
                  />
                  <StatCard
                    value={`${cashOnCash.toFixed(1)}%`}
                    label="Cash-on-cash"
                    valueClassName={cashOnCash >= 12 ? "text-success" : cashOnCash >= 6 ? "text-warning" : "text-danger"}
                  />
                  <StatCard
                    value={formatCurrencyCompact(monthlyCashFlow, currency)}
                    label="Monthly cash flow"
                    valueClassName={monthlyCashFlow >= 0 ? "text-success" : "text-danger"}
                  />
                  <StatCard
                    value={annualCashFlow > 0 && equity > 0 ? `${(equity / annualCashFlow).toFixed(1)} yr` : "N/A"}
                    label="Break-even"
                  />
                </div>

                <ExpandableDetail label="How did we calculate this?">
                  <div className="space-y-1.5">
                    <p><strong>Cap rate</strong> = Annual rent / Total project cost</p>
                    <p>{formatCurrency(annualRent, currency)} / {formatCurrency(costs.total, currency)} = {capRate.toFixed(1)}%</p>
                    <p className="mt-2"><strong>Net operating income</strong> = Annual rent x 70% (30% estimated for vacancy, repairs, insurance, taxes)</p>
                    <p>{formatCurrency(annualRent, currency)} x 0.70 = {formatCurrency(noi, currency)}</p>
                    <p className="mt-2"><strong>Cash flow</strong> = NOI - Annual debt service</p>
                    <p>{formatCurrency(noi, currency)} - {formatCurrency(annualDebtService, currency)} = {formatCurrency(annualCashFlow, currency)}/year ({formatCurrency(monthlyCashFlow, currency)}/month)</p>
                    <p className="mt-2"><strong>Cash-on-cash return</strong> = Annual cash flow / Your cash invested (down payment)</p>
                    <p>{formatCurrency(annualCashFlow, currency)} / {formatCurrency(equity, currency)} = {cashOnCash.toFixed(1)}%</p>
                  </div>
                </ExpandableDetail>
              </div>
            </Card>
          )}

          {state.goal === "occupy" && (
            <Card>
              <div className="space-y-3">
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted">Your total cost to build</span>
                  <span className="font-data font-medium text-earth">{formatCurrency(costs.total, currency)}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted">Estimated price for a comparable existing home</span>
                  <span className="font-data font-medium text-earth">{formatCurrency(costs.total * 1.2, currency)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between text-[13px]">
                  <span className="font-semibold text-earth">Estimated savings by building</span>
                  <span className="font-data font-bold text-success">{formatCurrency(costs.total * 0.2, currency)}</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed mt-2">
                  Building your own home typically saves 15 to 25% compared to buying a comparable existing home. This savings comes primarily from eliminating the general contractor markup and real estate agent commissions. You also get a home built exactly to your specifications with new materials and modern building codes.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Step 8: The verdict
  // -------------------------------------------------------------------------
  function renderVerdict() {
    const scoreColor = verdict.verdictLevel === "strong" ? "text-success" : verdict.verdictLevel === "decent" ? "text-warning" : "text-danger";
    const scoreBg = verdict.verdictLevel === "strong" ? "bg-success/10" : verdict.verdictLevel === "decent" ? "bg-warning/10" : "bg-danger/10";
    const scoreBorder = verdict.verdictLevel === "strong" ? "border-success/30" : verdict.verdictLevel === "decent" ? "border-warning/30" : "border-danger/30";

    // Invert score for RiskIndicator (it expects high = risky)
    const riskScore = 100 - verdict.score;

    return (
      <div className="animate-fade-in">
        <StepHeader
          step={7}
          heading="Should you do this deal?"
          content="Based on your inputs and market data, here is our assessment. This analysis considers profit potential, cost efficiency, financing risk, and market conditions."
        />

        {/* Deal score */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`text-center py-8 rounded-xl border ${scoreBg} ${scoreBorder}`}>
            <div className={`font-data text-6xl font-bold ${scoreColor}`}>
              {verdict.score}
            </div>
            <div className="text-[11px] text-muted uppercase tracking-[0.15em] mt-1">out of 100</div>
            <div className={`text-[14px] font-semibold mt-3 ${scoreColor}`}>
              {verdict.verdictLevel === "strong" ? "Strong deal" : verdict.verdictLevel === "decent" ? "Decent deal" : "Risky deal"}
            </div>
          </div>
          <RiskIndicator score={riskScore} label="Risk Assessment" />
        </div>

        <p className="text-[13px] text-slate leading-relaxed mt-4 mb-6">{verdict.verdict}</p>

        {/* Factor breakdown */}
        <SectionLabel>Factor breakdown</SectionLabel>
        <Card>
          <div className="space-y-3">
            {verdict.factors.map((factor, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      factor.positive ? "bg-success/15 text-success" : "bg-danger/10 text-danger"
                    }`}>
                      {factor.positive ? <Check size={11} /> : <AlertTriangle size={11} />}
                    </div>
                    <span className="text-[12px] text-slate">{factor.label}</span>
                  </div>
                  <span className="text-[12px] font-data font-medium text-earth">
                    {factor.points}/{factor.maxPoints}
                  </span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed ml-7 mt-0.5">{factor.explanation}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk factors */}
        {verdict.risks.length > 0 && (
          <div className="mt-6">
            <SectionLabel>Risk factors</SectionLabel>
            <Card>
              <div className="space-y-3">
                {verdict.risks.map((risk, i) => (
                  <div key={i} className="flex gap-2.5">
                    <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
                    <p className="text-[12px] text-slate leading-relaxed">{risk}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Deal summary stats */}
        <div className="mt-6">
          <SectionLabel>Deal summary</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard value={formatCurrencyCompact(costs.land, currency)} label="Land cost" />
            <StatCard value={formatCurrencyCompact(costs.total, currency)} label="Total project cost" />
            {state.goal === "sell" && (
              <>
                <StatCard
                  value={formatCurrencyCompact(state.targetSalePrice > 0 ? state.targetSalePrice : getEstimatedSaleValue(state), currency)}
                  label="Sale price"
                />
                <StatCard
                  value={`${((((state.targetSalePrice > 0 ? state.targetSalePrice : getEstimatedSaleValue(state)) - costs.total) / costs.total) * 100).toFixed(1)}%`}
                  label="Profit margin"
                  valueClassName={
                    ((state.targetSalePrice > 0 ? state.targetSalePrice : getEstimatedSaleValue(state)) - costs.total) / costs.total >= 0.15
                      ? "text-success"
                      : "text-danger"
                  }
                />
              </>
            )}
            {state.goal === "rent" && (
              <>
                <StatCard
                  value={formatCurrencyCompact((state.monthlyRent > 0 ? state.monthlyRent : getEstimatedMonthlyRent(state)) * 12, currency)}
                  label="Annual rent"
                />
                <StatCard
                  value={`${(((state.monthlyRent > 0 ? state.monthlyRent : getEstimatedMonthlyRent(state)) * 12 / costs.total) * 100).toFixed(1)}%`}
                  label="Cap rate"
                  valueClassName={
                    (state.monthlyRent > 0 ? state.monthlyRent : getEstimatedMonthlyRent(state)) * 12 / costs.total >= 0.08
                      ? "text-success"
                      : "text-warning"
                  }
                />
              </>
            )}
            {state.goal === "occupy" && (
              <>
                <StatCard value={formatCurrencyCompact(costs.total * 1.2, currency)} label="Comparable value" />
                <StatCard value={formatCurrencyCompact(costs.total * 0.2, currency)} label="Estimated savings" valueClassName="text-success" />
              </>
            )}
          </div>
        </div>

        {/* Recommended next steps */}
        {verdict.nextSteps.length > 0 && (
          <div className="mt-6">
            <SectionLabel>Recommended next steps</SectionLabel>
            <Card>
              <ol className="space-y-2.5">
                {verdict.nextSteps.map((step, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-surface-alt flex items-center justify-center text-[10px] font-data font-semibold text-muted shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-[12px] text-slate leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleCreateProject}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-earth text-warm text-[13px] font-medium hover:bg-earth-light transition-colors"
          >
            <PlusCircle size={16} />
            Create this project in Keystone
          </button>
          <p className="text-[10px] text-muted text-center">
            Pre-fills the project wizard with your deal data so you can start planning immediately.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={handleSaveAnalysis}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface text-earth text-[12px] font-medium hover:bg-surface-alt transition-colors"
            >
              <Save size={14} />
              Save this analysis
            </button>
            <button
              onClick={handleStartOver}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface text-earth text-[12px] font-medium hover:bg-surface-alt transition-colors"
            >
              <RotateCcw size={14} />
              Start over
            </button>
            <button
              onClick={() => router.push("/ai-advisor")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface text-earth text-[12px] font-medium hover:bg-surface-alt transition-colors"
            >
              <MessageSquare size={14} />
              Ask the AI advisor
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Step renderers
  // -------------------------------------------------------------------------
  const stepRenderers = [
    renderGoal,
    renderMarket,
    renderPropertyType,
    renderSize,
    renderLand,
    renderFinancing,
    renderNumbers,
    renderVerdict,
  ];

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto py-6 animate-fade-in">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-1 mb-8 overflow-x-auto px-2">
        {STEP_TITLES.map((title, i) => {
          const Icon = STEP_ICONS[i];
          return (
            <div key={i} className="flex items-center gap-1">
              <button
                onClick={() => {
                  // Allow going back to completed steps
                  if (i < step) setStep(i);
                }}
                disabled={i > step}
                className="flex flex-col items-center"
                title={title}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    i === step
                      ? "bg-earth text-warm"
                      : i < step
                      ? "bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600"
                      : "bg-surface-alt text-muted"
                  }`}
                >
                  {i < step ? (
                    <Check size={12} />
                  ) : (
                    <Icon size={13} />
                  )}
                </div>
                <span className="text-[8px] text-muted mt-1 hidden lg:block whitespace-nowrap">{title}</span>
              </button>
              {i < STEP_COUNT - 1 && (
                <div className={`w-4 h-[2px] ${i < step ? "bg-emerald-500" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div key={step}>
        {stepRenderers[step]()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/40">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 px-5 py-2.5 text-[13px] border border-border-dark rounded-lg bg-surface text-earth hover:bg-surface-alt transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        ) : (
          <div />
        )}

        <span className="text-[11px] font-data text-muted">
          {step + 1} of {STEP_COUNT}
        </span>

        {step < STEP_COUNT - 1 && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className="flex items-center gap-1.5 px-5 py-2.5 text-[13px] rounded-lg bg-earth text-warm hover:bg-earth-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight size={14} />
          </button>
        )}
        {step === STEP_COUNT - 1 && <div />}
      </div>
    </div>
  );
}
