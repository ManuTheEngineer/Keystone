"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTopbar } from "../layout";
import { useAuth } from "@/components/auth/AuthProvider";
import { createProject, getUserProjects, generateBudgetFromSpecs, seedInitialTasks, type Market, type BuildPurpose, type PropertyType } from "@/lib/services/project-service";
import { getPlanLimits } from "@/lib/stripe-config";
import type { PlanTier } from "@/lib/stripe-config";
import {
  Home,
  Building2,
  TrendingUp,
  Info,
  MapPin,
  Landmark,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  BookOpen,
  Shield,
  Bed,
  Bath,
  Layers,
  Car,
  Trees,
  Waves,
  Fence,
  Sun,
  Zap,
  Droplets,
  ShieldCheck,
  Sparkles,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { LearnTooltip } from "@/components/ui/LearnTooltip";
import {
  getMarketData,
  getCostBenchmarks,
  formatCurrency,
  formatCurrencyCompact,
  PHASE_ORDER,
  getClosestLocation,
  getLocationSuggestions,
  getCostComparisonText,
  getClimateLabel,
  formatMonthList,
} from "@keystone/market-data";
import type { Market as MarketType, CurrencyConfig, LocationData } from "@keystone/market-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BuildGoal = "sell" | "rent" | "occupy" | "";
type SizeCategory = "compact" | "standard" | "large" | "estate" | "custom";
type LandOption = "known" | "estimate" | "";
type FinancingType = "construction_loan" | "cash" | "fha_203k" | "diaspora" | "tontine" | "phased_cash" | "";

interface WizardState {
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
}

interface ScoreFactor {
  label: string;
  points: number;
  maxPoints: number;
  positive: boolean;
  explanation: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_STATE: WizardState = {
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
};

const STEP_COUNT = 10;

const STEP_LABELS = [
  "Goal",
  "Market",
  "Location",
  "Type",
  "Size",
  "Land",
  "Financing",
  "Financials",
  "Score",
  "Name",
];

const US_FEATURES = [
  { id: "garage-single", label: "Single garage", Icon: Car },
  { id: "garage-double", label: "Double garage", Icon: Car },
  { id: "porch-patio", label: "Porch / Patio", Icon: Trees },
  { id: "pool", label: "Pool", Icon: Waves },
  { id: "fence", label: "Fencing", Icon: Fence },
  { id: "solar", label: "Solar panels", Icon: Sun },
  { id: "outdoor-kitchen", label: "Outdoor kitchen", Icon: Zap },
  { id: "basement", label: "Basement", Icon: Layers },
  { id: "sprinkler", label: "Sprinkler system", Icon: Droplets },
];

const WA_FEATURES = [
  { id: "garage-single", label: "Single garage", Icon: Car },
  { id: "garage-double", label: "Double garage", Icon: Car },
  { id: "porch-patio", label: "Veranda / Terrace", Icon: Trees },
  { id: "pool", label: "Pool", Icon: Waves },
  { id: "fence", label: "Perimeter wall", Icon: Fence },
  { id: "solar", label: "Solar panels", Icon: Sun },
  { id: "guest-house", label: "Guest house", Icon: Home },
  { id: "water-tank", label: "Water tank", Icon: Droplets },
  { id: "generator-house", label: "Generator house", Icon: Zap },
  { id: "security-post", label: "Security post", Icon: ShieldCheck },
];

const MARKET_MAP: Record<string, Market> = { USA: "USA", TOGO: "TOGO", GHANA: "GHANA", BENIN: "BENIN" };
const PURPOSE_MAP: Record<string, BuildPurpose> = { occupy: "OCCUPY", rent: "RENT", sell: "SELL" };

// ---------------------------------------------------------------------------
// Market / cost helpers
// ---------------------------------------------------------------------------

function getSizeUnit(market: MarketType | ""): "sqft" | "sqm" {
  return market === "USA" ? "sqft" : "sqm";
}

function getCurrencyForMarket(market: MarketType | ""): CurrencyConfig {
  if (!market) {
    return { code: "USD", symbol: "$", locale: "en-US", decimals: 2, groupSeparator: ",", position: "prefix" as const };
  }
  return getMarketData(market).currency;
}

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

function getBuildingSize(state: WizardState): number {
  if (state.sizeCategory === "custom") return state.customSize;
  if (!state.market) return 0;
  const unit = getSizeUnit(state.market);
  const presets = getSizePresets(unit);
  return presets[state.sizeCategory as keyof typeof presets]?.typical ?? 0;
}

function getMarketCostRange(market: MarketType): { low: number; mid: number; high: number } {
  const benchmarks = getCostBenchmarks(market);
  return {
    low: benchmarks.reduce((sum, b) => sum + b.lowRange, 0),
    mid: benchmarks.reduce((sum, b) => sum + b.midRange, 0),
    high: benchmarks.reduce((sum, b) => sum + b.highRange, 0),
  };
}

function getConstructionCost(state: WizardState, locationData?: LocationData | null): number {
  if (!state.market) return 0;
  const size = getBuildingSize(state);
  if (size <= 0) return 0;
  const costs = getMarketCostRange(state.market as MarketType);
  const baseCost = costs.mid * size;
  const costIndex = locationData?.costIndex ?? 1.0;
  return Math.round(baseCost * costIndex);
}

function getLandCost(state: WizardState, locationData?: LocationData | null): number {
  if (state.landOption === "known") return state.landPrice;
  // Use location-specific land mid-price if available
  if (locationData) {
    if (state.market === "USA" && locationData.landPricePerAcre) {
      return locationData.landPricePerAcre.mid;
    }
    if (locationData.landPricePerSqm) {
      // Estimate for a typical 500sqm residential plot in West Africa
      return locationData.landPricePerSqm.mid * 500;
    }
  }
  return Math.round(getConstructionCost(state, locationData) * 0.25);
}

function getSoftCosts(constructionCost: number): number {
  return Math.round(constructionCost * 0.15);
}

function getFinancingCosts(state: WizardState, landCost: number, constructionCost: number): number {
  if (state.financingType === "cash" || state.financingType === "phased_cash") return 0;
  const totalBasis = landCost + constructionCost;
  const loanPortion = totalBasis * (1 - state.downPaymentPct / 100);
  return Math.round(loanPortion * (state.loanRate / 100) * (state.timelineMonths / 12));
}

function getContingency(constructionCost: number): number {
  return Math.round(constructionCost * 0.15);
}

function getTotalProjectCost(state: WizardState, locationData?: LocationData | null) {
  const construction = getConstructionCost(state, locationData);
  const land = getLandCost(state, locationData);
  const soft = getSoftCosts(construction);
  const financing = getFinancingCosts(state, land, construction);
  const contingency = getContingency(construction);
  const total = land + construction + soft + financing + contingency;
  return { land, construction, soft, financing, contingency, total };
}

function getEstimatedSaleValue(state: WizardState, locationData?: LocationData | null): number {
  // If we have sale price data, use building size * sale price per unit
  if (locationData) {
    const size = getBuildingSize(state);
    if (state.market === "USA" && locationData.avgSalePricePerSqft && size > 0) {
      return Math.round(size * locationData.avgSalePricePerSqft);
    }
    if (locationData.avgSalePricePerSqm && size > 0) {
      return Math.round(size * locationData.avgSalePricePerSqm);
    }
  }
  const costs = getTotalProjectCost(state, locationData);
  return Math.round(costs.total * 1.20);
}

function getEstimatedMonthlyRent(state: WizardState, locationData?: LocationData | null): number {
  if (!state.market) return 0;
  const size = getBuildingSize(state);
  if (state.market === "USA") {
    const ratePerSqft = locationData?.avgRentPerSqft ?? 1.0;
    return Math.round(size * ratePerSqft);
  }
  const ratePerSqm = locationData?.avgRentPerSqm ?? 2000;
  return Math.round(size * ratePerSqm);
}

// ---------------------------------------------------------------------------
// Deal scoring
// ---------------------------------------------------------------------------

function calculateDealScore(state: WizardState, locData?: LocationData | null): { score: number; factors: ScoreFactor[]; risks: string[]; verdict: string; verdictLevel: "strong" | "decent" | "risky" } {
  const costs = getTotalProjectCost(state, locData);
  const factors: ScoreFactor[] = [];
  const risks: string[] = [];
  const currency = getCurrencyForMarket(state.market);

  // 1. Profit / cap rate / savings (25 points)
  if (state.goal === "sell") {
    const salePrice = state.targetSalePrice > 0 ? state.targetSalePrice : getEstimatedSaleValue(state, locData);
    const profit = salePrice - costs.total;
    const margin = costs.total > 0 ? (profit / costs.total) * 100 : 0;
    if (margin > 20) {
      factors.push({ label: "Profit margin above 20%", points: 25, maxPoints: 25, positive: true, explanation: `Estimated margin of ${margin.toFixed(1)}%. This provides a healthy buffer.` });
    } else if (margin > 15) {
      factors.push({ label: "Profit margin 15 to 20%", points: 18, maxPoints: 25, positive: true, explanation: `Margin of ${margin.toFixed(1)}% is solid but leaves limited room for surprises.` });
    } else if (margin > 10) {
      factors.push({ label: "Profit margin 10 to 15%", points: 8, maxPoints: 25, positive: false, explanation: `A ${margin.toFixed(1)}% margin is thin. Cost overruns could eliminate profit.` });
      risks.push("Thin profit margin leaves little room for cost overruns.");
    } else {
      factors.push({ label: "Profit margin below 10%", points: 0, maxPoints: 25, positive: false, explanation: `At ${margin.toFixed(1)}%, this deal barely breaks even.` });
      risks.push("Margin below 10% means even a small delay creates a loss.");
    }
  } else if (state.goal === "rent") {
    const monthlyRent = state.monthlyRent > 0 ? state.monthlyRent : getEstimatedMonthlyRent(state, locData);
    const annualRent = monthlyRent * 12;
    const capRate = costs.total > 0 ? (annualRent / costs.total) * 100 : 0;
    if (capRate > 8) {
      factors.push({ label: "Cap rate above 8%", points: 25, maxPoints: 25, positive: true, explanation: `A ${capRate.toFixed(1)}% cap rate is excellent.` });
    } else if (capRate > 5) {
      factors.push({ label: "Cap rate 5 to 8%", points: 15, maxPoints: 25, positive: true, explanation: `A ${capRate.toFixed(1)}% cap rate is reasonable.` });
    } else {
      factors.push({ label: "Cap rate below 5%", points: 0, maxPoints: 25, positive: false, explanation: `At ${capRate.toFixed(1)}%, rental income is low relative to cost.` });
      risks.push("Low cap rate means the property may not cash flow positively.");
    }
  } else {
    const savings = costs.total * 0.2;
    factors.push({ label: "Savings versus buying existing", points: 20, maxPoints: 25, positive: true, explanation: `Building could save approximately ${formatCurrencyCompact(savings, currency)} compared to buying existing.` });
  }

  // 2. Construction cost efficiency (15 points)
  if (state.market) {
    const costRange = getMarketCostRange(state.market as MarketType);
    const size = getBuildingSize(state);
    const actualPerUnit = size > 0 ? getConstructionCost(state, locData) / size : 0;
    if (actualPerUnit <= costRange.mid) {
      factors.push({ label: "Construction cost at or below average", points: 15, maxPoints: 15, positive: true, explanation: "Estimated cost is within the typical range for this market." });
    } else if (actualPerUnit <= costRange.high) {
      factors.push({ label: "Construction cost above average", points: 8, maxPoints: 15, positive: false, explanation: "Costs above the market midpoint. Consider value engineering." });
    } else {
      factors.push({ label: "Construction cost well above range", points: 0, maxPoints: 15, positive: false, explanation: "Costs exceed typical market rates. Get competitive bids." });
      risks.push("Construction costs above market averages reduce margin.");
    }
  }

  // 3. Land cost ratio (15 points)
  if (costs.land > 0 && costs.total > 0) {
    const landRatio = (costs.land / costs.total) * 100;
    if (landRatio <= 25) {
      factors.push({ label: "Land cost under 25% of total", points: 15, maxPoints: 15, positive: true, explanation: `Land is ${landRatio.toFixed(0)}% of total. Healthy ratio.` });
    } else if (landRatio <= 35) {
      factors.push({ label: "Land cost 25 to 35% of total", points: 10, maxPoints: 15, positive: true, explanation: `Land at ${landRatio.toFixed(0)}% is within range but higher side.` });
    } else {
      factors.push({ label: "Land cost above 35%", points: 0, maxPoints: 15, positive: false, explanation: `At ${landRatio.toFixed(0)}%, land eats into construction budget.` });
      risks.push("Land cost exceeds 35% of total project cost.");
    }
  }

  // 4. Timeline (15 points)
  if (state.timelineMonths <= 12) {
    factors.push({ label: "Timeline under 12 months", points: 15, maxPoints: 15, positive: true, explanation: "Shorter timeline reduces carrying costs." });
  } else if (state.timelineMonths <= 18) {
    factors.push({ label: "Timeline 12 to 18 months", points: 10, maxPoints: 15, positive: true, explanation: "Reasonable but adds to carrying costs." });
  } else {
    factors.push({ label: "Timeline over 18 months", points: 0, maxPoints: 15, positive: false, explanation: "Extended timelines significantly increase costs and risk." });
    risks.push("Build timeline over 18 months increases carrying costs.");
  }

  // 5. Financing (15 points)
  if (state.financingType === "cash" || state.financingType === "phased_cash") {
    factors.push({ label: "Cash financing", points: 15, maxPoints: 15, positive: true, explanation: "No interest costs. Full control." });
  } else if (state.downPaymentPct >= 20) {
    factors.push({ label: "Down payment 20%+", points: 12, maxPoints: 15, positive: true, explanation: "Good equity cushion and better loan terms." });
  } else if (state.downPaymentPct >= 10) {
    factors.push({ label: "Down payment 10 to 20%", points: 8, maxPoints: 15, positive: false, explanation: "Lower equity increases loan cost." });
  } else {
    factors.push({ label: "Down payment under 10%", points: 3, maxPoints: 15, positive: false, explanation: "Minimal equity buffer." });
    risks.push("Low down payment means minimal equity buffer.");
  }

  // 6. Market demand (15 points)
  factors.push({ label: "Market demand (estimated)", points: 12, maxPoints: 15, positive: true, explanation: "Based on current market conditions." });

  risks.push("Construction costs could exceed estimates by 10 to 20%. Your contingency budget is your safety net.");

  const score = factors.reduce((sum, f) => sum + f.points, 0);
  let verdict: string;
  let verdictLevel: "strong" | "decent" | "risky";

  if (score >= 70) {
    verdict = "Strong deal. The numbers support moving forward with planning.";
    verdictLevel = "strong";
  } else if (score >= 50) {
    verdict = "Decent deal with some risk factors. Review the areas that scored low.";
    verdictLevel = "decent";
  } else {
    verdict = "This deal carries significant risk. Consider adjusting your assumptions.";
    verdictLevel = "risky";
  }

  return { score, factors, risks, verdict, verdictLevel };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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

function MentorTip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-warm/50 border border-sand/40 rounded-xl p-4 mt-4">
      <BookOpen size={18} className="text-clay shrink-0 mt-0.5" />
      <p className="text-[12px] text-foreground leading-relaxed">{children}</p>
    </div>
  );
}

// Donut chart for cost breakdown
function CostDonut({ segments, size = 160 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;
  const r = size / 2 - 12;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dashLen = circumference * pct;
        const dashOffset = circumference * cumulative;
        cumulative += pct;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={20}
            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
            strokeDashoffset={-dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="transition-all duration-500"
          />
        );
      })}
      <text x="50%" y="50%" textAnchor="middle" dy="-4" className="fill-current text-earth text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
        Total
      </text>
      <text x="50%" y="50%" textAnchor="middle" dy="14" className="fill-current text-earth text-[14px] font-semibold" style={{ fontFamily: "var(--font-mono)" }}>
        100%
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function NewProjectPage() {
  const { setTopbar } = useTopbar();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(() => {
    // Pre-fill from Deal Analyzer URL params
    if (typeof window === "undefined") return INITIAL_STATE;
    const params = new URLSearchParams(window.location.search);
    if (params.get("from") === "analyzer") {
      return {
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
      };
    }
    return INITIAL_STATE;
  });
  const [creating, setCreating] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [planError, setPlanError] = useState("");

  // Fetch existing project count for plan limit enforcement
  useEffect(() => {
    if (!user) return;
    getUserProjects(user.uid).then((projects) => {
      // Demo/sample projects don't count toward plan limits
      const realProjects = projects.filter((p: any) => !p.isDemo);
      setProjectCount(realProjects.length);
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    setTopbar("New project", "Setup wizard", "info");
  }, [setTopbar]);

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((prev) => {
      const next = { ...prev, [key]: value };
      // Reset financing type when market changes (financing options differ by market)
      if (key === "market" && value !== prev.market) {
        next.financingType = "";
      }
      return next;
    });
  }

  const marketData = useMemo(() => {
    if (!state.market) return null;
    return getMarketData(state.market as MarketType);
  }, [state.market]);

  const currency = useMemo(() => getCurrencyForMarket(state.market), [state.market]);
  const sizeUnit = useMemo(() => getSizeUnit(state.market), [state.market]);

  const totalWeeksFromMarket = useMemo(() => {
    if (!marketData) return 0;
    return marketData.phases.reduce(
      (sum, p) => sum + Math.round((p.typicalDurationWeeks.min + p.typicalDurationWeeks.max) / 2),
      0
    );
  }, [marketData]);

  // Location intelligence — async API call with debounce, static fallback
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSource, setLocationSource] = useState<string>("");
  const locationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!state.market || !state.city || state.city.trim().length < 2) {
      setLocationData(null);
      setLocationLoading(false);
      return;
    }

    // Immediate static fallback while API loads
    const staticFallback = getClosestLocation(state.city, state.market);
    if (staticFallback) {
      setLocationData(staticFallback);
    }

    // Debounced API call (500ms)
    if (locationTimerRef.current) clearTimeout(locationTimerRef.current);
    setLocationLoading(true);
    locationTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/location-data?q=${encodeURIComponent(state.city.trim())}&market=${state.market}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setLocationData(json.data);
            setLocationSource(json.source ?? "unknown");
          } else if (!staticFallback) {
            // API returned null and no static match — show nothing
            setLocationData(null);
          }
        }
      } catch {
        // API failed — keep whatever we have (static or null)
      } finally {
        setLocationLoading(false);
      }
    }, 500);

    return () => {
      if (locationTimerRef.current) clearTimeout(locationTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.market, state.city]);

  const locationSuggestions = useMemo(() => {
    if (!state.market) return [];
    return getLocationSuggestions(state.market);
  }, [state.market]);

  const costs = useMemo(() => getTotalProjectCost(state, locationData), [state, locationData]);
  const dealResult = useMemo(() => calculateDealScore(state, locationData), [state, locationData]);

  // Revenue projections
  const revenueProjection = useMemo(() => {
    if (state.goal === "sell") {
      const salePrice = state.targetSalePrice > 0 ? state.targetSalePrice : getEstimatedSaleValue(state, locationData);
      const profit = salePrice - costs.total;
      return { label: "Projected sale price", value: salePrice, secondary: `Profit: ${formatCurrencyCompact(profit, currency)}` };
    } else if (state.goal === "rent") {
      const monthlyRent = state.monthlyRent > 0 ? state.monthlyRent : getEstimatedMonthlyRent(state, locationData);
      const annualRent = monthlyRent * 12;
      const capRate = costs.total > 0 ? (annualRent / costs.total) * 100 : 0;
      return { label: "Monthly rental income", value: monthlyRent, secondary: `Cap rate: ${capRate.toFixed(1)}%` };
    }
    return null;
  }, [state, costs, currency, locationData]);

  // Step validation
  function canProceed(): boolean {
    switch (step) {
      case 0: return state.goal !== "";
      case 1: return state.market !== "";
      case 2: return state.market === "USA" ? /^\d{5}(-\d{4})?$/.test(state.city.trim()) : state.city.trim().length > 0;
      case 3: return state.propertyType !== "";
      case 4: return state.sizeCategory === "custom" ? state.customSize > 0 : true;
      case 5: return state.landOption !== "";
      case 6: return state.financingType !== "";
      case 7: return true; // financials review
      case 8: return true; // score review
      case 9: return state.projectName.trim().length > 0;
      default: return false;
    }
  }

  async function handleCreate() {
    if (!user || creating) return;
    setPlanError("");

    // Check project limit (admin bypasses)
    if (profile?.role !== "admin") {
      const limits = getPlanLimits((profile?.plan as PlanTier) ?? "FOUNDATION");
      if (limits.projects !== Infinity && projectCount >= limits.projects) {
        setPlanError(
          `Your ${profile?.plan ?? "Foundation"} plan allows ${limits.projects} project${limits.projects === 1 ? "" : "s"}. Upgrade your plan to create more.`
        );
        return;
      }
    }

    setCreating(true);
    try {
      const market = state.market as Market;
      const purpose = PURPOSE_MAP[state.goal] ?? "OCCUPY";
      const propertyType = state.propertyType as PropertyType;
      const curr = currency.code;

      const sizeMap: Record<string, string> = { compact: "small", standard: "medium", large: "large", estate: "xlarge", custom: "custom" };

      const projectId = await createProject({
        userId: user.uid,
        name: state.projectName.trim(),
        market,
        purpose,
        propertyType,
        sizeRange: sizeMap[state.sizeCategory] ?? "medium",
        city: state.city.trim(),
        region: state.city.trim(),
        financingType: state.financingType,
        landCost: getLandCost(state, locationData),
        dealScore: dealResult.score,
        currentPhase: 0,
        completedPhases: 0,
        phaseName: "Phase 0: Define",
        progress: 0,
        status: "ACTIVE",
        totalBudget: costs.total,
        totalSpent: 0,
        currency: curr,
        currentWeek: 0,
        totalWeeks: totalWeeksFromMarket,
        openItems: 0,
        subPhase: "Getting started",
        details: `${propertyType} / ${market} / ${state.city.trim()}`,
        bedrooms: state.bedrooms,
        bathrooms: state.bathrooms,
        stories: state.stories,
        features: state.features.length > 0 ? state.features : undefined,
      });

      // Auto-generate budget + seed initial tasks in parallel
      await Promise.allSettled([
        generateBudgetFromSpecs(user.uid, projectId, costs.total, market, state.features),
        seedInitialTasks(user.uid, projectId, {
          market,
          purpose: purpose,
          propertyType: propertyType,
          city: state.city.trim(),
          financingType: state.financingType,
          totalBudget: costs.total,
          bedrooms: state.bedrooms,
          bathrooms: state.bathrooms,
          features: state.features,
          fromAnalyzer: state.fromAnalyzer,
        }),
      ]);

      router.push(`/project/${projectId}/overview`);
    } catch (err) {
      console.error("Failed to create project:", err);
      setCreating(false);
    }
  }

  function handleNext() {
    if (step < STEP_COUNT - 1) {
      setStep(step + 1);
    } else {
      handleCreate();
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
    else router.push("/dashboard");
  }

  // Donut chart segments
  const donutSegments = useMemo(() => [
    { label: "Land", value: costs.land, color: "#8B4513" },
    { label: "Construction", value: costs.construction, color: "#2C1810" },
    { label: "Soft costs", value: costs.soft, color: "#D4A574" },
    { label: "Financing", value: costs.financing, color: "#1B4965" },
    { label: "Contingency", value: costs.contingency, color: "#BC6C25" },
  ], [costs]);

  // ---------------------------------------------------------------------------
  // Step renderers
  // ---------------------------------------------------------------------------

  function renderStep() {
    switch (step) {
      case 0: return renderGoalStep();
      case 1: return renderMarketStep();
      case 2: return renderLocationStep();
      case 3: return renderPropertyStep();
      case 4: return renderSizeStep();
      case 5: return renderLandStep();
      case 6: return renderFinancingStep();
      case 7: return renderFinancialsStep();
      case 8: return renderScoreStep();
      case 9: return renderNameStep();
      default: return null;
    }
  }

  function renderGoalStep() {
    const options = [
      { id: "sell" as const, title: "Build to sell", description: "Construct a property to sell at a profit. Higher risk, higher potential returns. Best for experienced investors or those willing to learn the development process.", icon: <TrendingUp size={18} />, tooltip: "Spec building is higher risk since you fund the entire build and carry costs until the sale closes." },
      { id: "rent" as const, title: "Build to rent", description: "Build an investment property that generates ongoing rental income. Moderate risk, steady cash flow. Best for long-term wealth building and passive income seekers.", icon: <Building2 size={18} />, tooltip: "Rental properties require higher down payments (25%+) but generate recurring income. Lenders evaluate these differently." },
      { id: "occupy" as const, title: "Build to occupy", description: "Build a home for you and your family. Lower financial risk, personal fulfillment. Best for first-time builders who want exactly the home they envision.", icon: <Home size={18} />, tooltip: "Owner-occupied homes qualify for better interest rates, lower down payments, and property tax reductions." },
    ];

    return (
      <div className="animate-fade-in">
        <StepHeading title="What is your goal?" subtitle="This determines your financing options, tax treatment, and how we evaluate the deal." />
        <div className="space-y-3 text-left animate-stagger">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => update("goal", opt.id)}
              className={`w-full p-5 rounded-xl border text-left transition-all card-hover ${
                state.goal === opt.id
                  ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
                  : "border-border bg-surface hover:border-sand"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 ${state.goal === opt.id ? "text-emerald-600" : "text-muted"}`}>{opt.icon}</span>
                <div className="flex-1">
                  <h5 className="text-[14px] font-semibold text-earth">{opt.title}</h5>
                  <p className="text-[12px] text-muted mt-1 leading-relaxed">{opt.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <MentorTip>
          Your goal shapes everything. Building to sell requires tighter cost control for profit margins. Building to rent means optimizing for long-term cash flow. Building to occupy lets you prioritize what matters most to you.
        </MentorTip>

        {!state.fromAnalyzer && (
          <div className="mt-4 p-3 rounded-xl border border-clay/20 bg-clay/5 text-left">
            <Link href="/analyze" className="flex items-center gap-2 text-[12px] text-clay font-medium hover:underline">
              <Calculator size={14} />
              Want to analyze costs and risks first? Try the Deal Analyzer
              <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>
    );
  }

  function renderMarketStep() {
    const markets = [
      { id: "USA" as MarketType, title: "United States", desc: "Wood-frame construction, institutional lending, IRC building codes", snap: "Construction loans convert to mortgages. Licensed trades required." },
      { id: "TOGO" as MarketType, title: "Togo", desc: "Reinforced concrete block, CFA zone, titre foncier system", snap: "Self-funded in phases. Titre foncier process can take months." },
      { id: "GHANA" as MarketType, title: "Ghana", desc: "Concrete block, cedi currency, Lands Commission registration", snap: "More formalized permit process. Land registration through Lands Commission." },
      { id: "BENIN" as MarketType, title: "Benin", desc: "Concrete block, CFA zone, ANDF land registry", snap: "CFA currency zone shared with Togo. ANDF provides formal land ownership." },
    ];

    return (
      <div className="animate-fade-in">
        <StepHeading title="Where are you building?" subtitle="Sets your cost benchmarks, regulations, templates, and construction method." />
        <div className="space-y-3 text-left animate-stagger">
          {markets.map((m) => (
            <button
              key={m.id}
              onClick={() => update("market", m.id)}
              className={`w-full p-5 rounded-xl border text-left transition-all card-hover ${
                state.market === m.id
                  ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
                  : "border-border bg-surface hover:border-sand"
              }`}
            >
              <h5 className="text-[14px] font-semibold text-earth">{m.title}</h5>
              <p className="text-[11px] text-muted mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>

        {state.market && marketData && (
          <div className="mt-4 p-4 rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Info size={14} className="text-emerald-700 shrink-0" />
              <span className="text-[12px] font-semibold text-emerald-800">Market snapshot</span>
            </div>
            <div className="space-y-1 text-[11px] text-emerald-800">
              <div className="flex justify-between">
                <span className="text-muted">Construction method</span>
                <span className="font-medium">{marketData.phases[0]?.constructionMethod ?? "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Currency</span>
                <span className="font-medium">{marketData.currency.code} ({marketData.currency.symbol})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Typical timeline</span>
                <span className="font-medium">
                  {marketData.phases.reduce((s, p) => s + p.typicalDurationWeeks.min, 0)}
                  {" to "}
                  {marketData.phases.reduce((s, p) => s + p.typicalDurationWeeks.max, 0)}
                  {" weeks"}
                </span>
              </div>
            </div>
          </div>
        )}

        <MentorTip>
          Each market has fundamentally different construction methods, costs, and regulations. USA uses wood-frame construction with institutional lending. West Africa uses reinforced concrete with cash-based phased funding.
        </MentorTip>
      </div>
    );
  }

  function renderLocationStep() {
    const isUSA = state.market === "USA";
    const waPlaceholder = state.market === "TOGO"
      ? "Enter your city or quartier (e.g., Lome, Avepozo, Kpalime)"
      : state.market === "GHANA"
      ? "Enter your city or area (e.g., Accra, Tema, Kumasi)"
      : "Enter your city or area";

    // Filter suggestions based on current input (WA only)
    const filteredSuggestions = !isUSA && state.city.trim().length > 0
      ? locationSuggestions.filter((s) =>
          s.toLowerCase().includes(state.city.toLowerCase().trim())
        )
      : [];

    // Only show suggestions if the input does not exactly match a suggestion
    const showSuggestions = filteredSuggestions.length > 0 &&
      !filteredSuggestions.some((s) => s.toLowerCase() === state.city.toLowerCase().trim());

    return (
      <div className="animate-fade-in">
        <StepHeading title="What city or area?" subtitle="Location affects your costs, regulations, and market demand." />
        <div className="text-left">
          {isUSA ? (
            <>
              {/* USA: ZIP code field (required, drives API) */}
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-clay" />
                <label className="text-[13px] font-medium text-earth">ZIP code</label>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={state.city}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d-]/g, "").slice(0, 10);
                  update("city", val);
                }}
                placeholder="Enter 5-digit ZIP code (e.g., 95350)"
                className="w-full px-4 py-3 text-[14px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-data tracking-wider"
              />
              <p className="text-[10px] text-muted mt-1.5">
                ZIP code gives you the most accurate cost data for your area. We pull real data from Census, HUD, and BLS.
              </p>
            </>
          ) : (
            <>
              {/* West Africa: city name field */}
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-clay" />
                <label className="text-[13px] font-medium text-earth">City or region</label>
              </div>
              <input
                type="text"
                value={state.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder={waPlaceholder}
                className="w-full px-4 py-3 text-[14px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </>
          )}

          {/* Autocomplete suggestions (WA only) */}
          {showSuggestions && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {filteredSuggestions.slice(0, 8).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => update("city", suggestion)}
                  className="px-3 py-1.5 text-[11px] rounded-full border border-border bg-surface text-earth hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Location Intelligence Card */}
          {locationLoading && !locationData && (
            <div className="mt-4 p-3 rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 text-left animate-fade-in flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] text-emerald-700">Loading location data...</span>
            </div>
          )}

          {locationData && (() => {
            const inputCity = state.city.trim().toLowerCase().split(",")[0].trim();
            const isProxy = !inputCity.includes(locationData.city.toLowerCase()) && !locationData.city.toLowerCase().includes(inputCity);
            return (
            <div className="mt-4 p-4 rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 text-left animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <Info size={14} className="text-emerald-700 shrink-0" />
                <span className="text-[12px] font-semibold text-emerald-800">
                  {isProxy
                    ? `Regional estimate based on ${locationData.city}${locationData.state ? `, ${locationData.state}` : ""}`
                    : `Location intelligence: ${locationData.city}${locationData.state ? `, ${locationData.state}` : ""}`
                  }
                </span>
              </div>
              {isProxy && (
                <p className="text-[10px] text-emerald-700 mb-2">
                  We use the nearest major metro as a proxy. You can adjust all costs later.
                </p>
              )}
              {locationSource && (
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-[9px] text-emerald-600/50">
                    {locationSource === "api" ? "Live data (Census/HUD/BLS)" : locationSource === "cache" ? "Cached data" : locationSource === "curated+cpi" ? "Curated + CPI adjusted" : "Static estimates"}
                  </p>
                  {(locationSource === "cache" || locationSource === "static" || locationSource === "stale-cache") && (
                    <button
                      onClick={async () => {
                        setLocationLoading(true);
                        try {
                          const res = await fetch(`/api/location-data?q=${encodeURIComponent(state.city.trim())}&market=${state.market}&fresh=1`);
                          if (res.ok) {
                            const json = await res.json();
                            if (json.data) {
                              setLocationData(json.data);
                              setLocationSource(json.source ?? "unknown");
                            }
                          }
                        } catch {} finally { setLocationLoading(false); }
                      }}
                      className="text-[9px] text-emerald-600 hover:text-emerald-800 underline transition-colors"
                    >
                      Refresh
                    </button>
                  )}
                </div>
              )}
              <div className="space-y-2 text-[11px] text-emerald-800">
                <div className="flex justify-between">
                  <span className="text-muted">Cost index</span>
                  <span className="font-medium font-data">
                    {locationData.costIndex.toFixed(2)}x ({getCostComparisonText(locationData.costIndex)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Labor index</span>
                  <span className="font-medium font-data">
                    {locationData.laborIndex.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Typical lot prices</span>
                  <span className="font-medium font-data">
                    {state.market === "USA"
                      ? `$${(locationData.landPricePerAcre.low / 1000).toFixed(0)}K to $${(locationData.landPricePerAcre.high / 1000).toFixed(0)}K per acre`
                      : locationData.landPricePerSqm
                        ? `${locationData.landPricePerSqm.low.toLocaleString()} to ${locationData.landPricePerSqm.high.toLocaleString()} per sqm`
                        : "N/A"
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Property tax rate</span>
                  <span className="font-medium font-data">{locationData.propertyTaxRate}% annually</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Permit cost estimate</span>
                  <span className="font-medium font-data">
                    {state.market === "USA"
                      ? `$${locationData.permitCostEstimate.toLocaleString()}`
                      : `${locationData.permitCostEstimate.toLocaleString()} CFA`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Climate</span>
                  <span className="font-medium">{getClimateLabel(locationData.climate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Best building months</span>
                  <span className="font-medium">{formatMonthList(locationData.buildingSeasonMonths)}</span>
                </div>
                {locationData.avgRentPerSqft && (
                  <div className="flex justify-between">
                    <span className="text-muted">Avg rent</span>
                    <span className="font-medium font-data">${locationData.avgRentPerSqft.toFixed(2)}/sqft/mo</span>
                  </div>
                )}
                {locationData.avgRentPerSqm && !locationData.avgRentPerSqft && (
                  <div className="flex justify-between">
                    <span className="text-muted">Avg rent</span>
                    <span className="font-medium font-data">{locationData.avgRentPerSqm.toLocaleString()}/sqm/mo</span>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-200">
                <p className="text-[10px] text-emerald-700 leading-relaxed">{locationData.localNotes}</p>
              </div>
            </div>
            );
          })()}

          <MentorTip>
            {state.market === "USA"
              ? "Construction costs vary significantly by city. A project in San Francisco costs roughly 50% more than the same build in Houston. Location also determines which building codes and inspectors apply to your project."
              : "In Lome, construction costs vary significantly between central quartiers and peripheral areas like Avepozo or Baguida. Land near the coast tends to be more expensive."
            }
          </MentorTip>
        </div>
      </div>
    );
  }

  function renderPropertyStep() {
    const types: { id: PropertyType; title: string; desc: string; complexity: number; beginner: boolean }[] = [
      { id: "SFH", title: "Single-family home", desc: "One dwelling unit on one lot", complexity: 1, beginner: true },
      { id: "DUPLEX", title: "Duplex", desc: "Two dwelling units in one structure", complexity: 2, beginner: true },
      { id: "TRIPLEX", title: "Triplex", desc: "Three dwelling units", complexity: 3, beginner: false },
      { id: "FOURPLEX", title: "Fourplex", desc: "Four dwelling units", complexity: 3, beginner: false },
      { id: "APARTMENT", title: "Apartment building", desc: "Five or more units", complexity: 5, beginner: false },
    ];

    return (
      <div className="animate-fade-in">
        <StepHeading title="What type of property?" subtitle="Defines your floor plan options, structural requirements, and complexity." />
        <div className="space-y-3 text-left animate-stagger">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => update("propertyType", t.id)}
              className={`w-full p-4 rounded-xl border text-left transition-all card-hover ${
                state.propertyType === t.id
                  ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
                  : "border-border bg-surface hover:border-sand"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-[14px] font-semibold text-earth">{t.title}</h5>
                  <p className="text-[11px] text-muted mt-0.5">{t.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  {t.beginner && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      Beginner friendly
                    </span>
                  )}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div key={n} className={`w-1.5 h-3 rounded-sm ${n <= t.complexity ? "bg-clay" : "bg-border"}`} />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <MentorTip>
          Start simple. A single-family home is the most forgiving for first-time builders. Multi-unit properties multiply complexity. Every unit needs its own kitchen, bathroom, and utility connections.
        </MentorTip>
      </div>
    );
  }

  function renderSizeStep() {
    if (!state.market) return null;
    const presets = getSizePresets(sizeUnit);
    const presetEntries = Object.entries(presets) as [string, { min: number; max: number; typical: number; label: string }][];

    const constructionCostNow = getConstructionCost(state, locationData);

    return (
      <div className="animate-fade-in">
        <StepHeading title="How big?" subtitle="Size presets give you instant cost estimates. You can also enter a custom size." />
        <div className="space-y-3 text-left animate-stagger">
          {presetEntries.map(([key, preset]) => {
            const isSelected = state.sizeCategory === key;
            const tempState = { ...state, sizeCategory: key as SizeCategory };
            const estCost = getConstructionCost(tempState, locationData);
            return (
              <button
                key={key}
                onClick={() => { update("sizeCategory", key as SizeCategory); }}
                className={`w-full p-4 rounded-xl border text-left transition-all card-hover ${
                  isSelected
                    ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
                    : "border-border bg-surface hover:border-sand"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-[14px] font-semibold text-earth">{preset.label}</h5>
                    <p className="text-[11px] text-muted">Typical: {preset.typical.toLocaleString()} {sizeUnit}</p>
                  </div>
                  <span className="text-[13px] font-data font-medium text-clay">
                    {formatCurrencyCompact(estCost, currency)}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Custom size */}
          <button
            onClick={() => update("sizeCategory", "custom")}
            className={`w-full p-4 rounded-xl border text-left transition-all card-hover ${
              state.sizeCategory === "custom"
                ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
                : "border-border bg-surface hover:border-sand"
            }`}
          >
            <h5 className="text-[14px] font-semibold text-earth">Custom size</h5>
            <p className="text-[11px] text-muted">Enter your exact {sizeUnit === "sqft" ? "square footage" : "square meters"}</p>
          </button>

          {state.sizeCategory === "custom" && (
            <div className="mt-2">
              <input
                type="number"
                value={state.customSize || ""}
                onChange={(e) => update("customSize", Number(e.target.value))}
                placeholder={`Enter size in ${sizeUnit}`}
                className="w-full px-4 py-3 text-[14px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}

          {/* Beds, Baths, Stories */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-xl border border-border bg-surface text-center">
              <Bed size={16} className="mx-auto text-clay mb-1" />
              <p className="text-[10px] text-muted mb-1">Bedrooms</p>
              <div className="flex items-center justify-center gap-1.5">
                <button onClick={() => update("bedrooms", Math.max(1, state.bedrooms - 1))} className="w-7 h-7 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[13px]">-</button>
                <span className="w-6 text-center font-data text-[15px] font-semibold text-earth">{state.bedrooms}</span>
                <button onClick={() => update("bedrooms", Math.min(8, state.bedrooms + 1))} className="w-7 h-7 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[13px]">+</button>
              </div>
            </div>
            <div className="p-3 rounded-xl border border-border bg-surface text-center">
              <Bath size={16} className="mx-auto text-clay mb-1" />
              <p className="text-[10px] text-muted mb-1">Bathrooms</p>
              <div className="flex items-center justify-center gap-1.5">
                <button onClick={() => update("bathrooms", Math.max(1, state.bathrooms - 1))} className="w-7 h-7 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[13px]">-</button>
                <span className="w-6 text-center font-data text-[15px] font-semibold text-earth">{state.bathrooms}</span>
                <button onClick={() => update("bathrooms", Math.min(6, state.bathrooms + 1))} className="w-7 h-7 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[13px]">+</button>
              </div>
            </div>
            <div className="p-3 rounded-xl border border-border bg-surface text-center">
              <Layers size={16} className="mx-auto text-clay mb-1" />
              <p className="text-[10px] text-muted mb-1">Stories</p>
              <div className="flex items-center justify-center gap-1.5">
                <button onClick={() => update("stories", Math.max(1, state.stories - 1))} className="w-7 h-7 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[13px]">-</button>
                <span className="w-6 text-center font-data text-[15px] font-semibold text-earth">{state.stories}</span>
                <button onClick={() => update("stories", Math.min(3, state.stories + 1))} className="w-7 h-7 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[13px]">+</button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-4">
            <p className="text-[12px] font-semibold text-earth mb-2">Features & Extras</p>
            <div className="grid grid-cols-2 gap-1.5">
              {(state.market === "USA" ? US_FEATURES : WA_FEATURES).map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    const next = state.features.includes(f.id)
                      ? state.features.filter((x) => x !== f.id)
                      : [...state.features, f.id];
                    update("features", next);
                  }}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-[11px] transition-all ${
                    state.features.includes(f.id)
                      ? "border-emerald-500 bg-emerald-50/30 text-emerald-700"
                      : "border-border/50 text-muted hover:bg-warm/20"
                  }`}
                >
                  <f.Icon size={12} />
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {constructionCostNow > 0 && (
          <div className="mt-4 p-4 rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Info size={14} className="text-emerald-700 shrink-0" />
              <span className="text-[12px] font-semibold text-emerald-800">Estimated construction cost</span>
            </div>
            <span className="text-[16px] font-data font-semibold text-emerald-800">
              {formatCurrency(constructionCostNow, currency)}
            </span>
            <p className="text-[10px] text-emerald-600 mt-1">
              Based on market benchmarks for {getBuildingSize(state).toLocaleString()} {sizeUnit}{locationData ? `, adjusted for ${locationData.city} (${locationData.costIndex.toFixed(2)}x cost index)` : ""}. Actual costs vary by finishes and site conditions.
            </p>
            {getBuildingSize(state) > 0 && (
              <p className="text-[11px] text-muted mt-1">
                That is approximately {formatCurrencyCompact(constructionCostNow / getBuildingSize(state), currency)} per {sizeUnit === "sqm" ? "sqm" : "sqft"}.{" "}
                {locationData?.costIndex && locationData.costIndex > 1.1 ? "above average for the broader market" : locationData?.costIndex && locationData.costIndex < 0.9 ? "below average for the broader market" : "within the typical range"}
              </p>
            )}
          </div>
        )}

        <MentorTip>
          Bigger is not always better. Every extra square foot adds cost to build, heat, cool, and maintain. Choose the size that matches your budget and goals. You can always expand later.
        </MentorTip>
      </div>
    );
  }

  function renderLandStep() {
    const estimatedLand = getLandCost({ ...state, landOption: "estimate" }, locationData);

    return (
      <div className="animate-fade-in">
        <StepHeading title="What about land?" subtitle="Land is often the biggest variable. If you already own land, enter what you paid. Otherwise we will estimate." />
        <div className="space-y-3 text-left animate-stagger">
          <button
            onClick={() => update("landOption", "known")}
            className={`w-full p-5 rounded-xl border text-left transition-all card-hover ${
              state.landOption === "known"
                ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
                : "border-border bg-surface hover:border-sand"
            }`}
          >
            <div className="flex items-center gap-3">
              <Landmark size={18} className={state.landOption === "known" ? "text-emerald-600" : "text-muted"} />
              <div>
                <h5 className="text-[14px] font-semibold text-earth">I have land (or a price)</h5>
                <p className="text-[11px] text-muted">Enter the purchase price or appraised value</p>
              </div>
            </div>
          </button>

          {state.landOption === "known" && (
            <div className="pl-10">
              <label className="text-[12px] text-muted mb-1 block">Land price ({currency.code})</label>
              <input
                type="number"
                value={state.landPrice || ""}
                onChange={(e) => update("landPrice", Number(e.target.value))}
                placeholder="Enter land cost"
                className="w-full px-4 py-3 text-[14px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}

          <button
            onClick={() => update("landOption", "estimate")}
            className={`w-full p-5 rounded-xl border text-left transition-all card-hover ${
              state.landOption === "estimate"
                ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
                : "border-border bg-surface hover:border-sand"
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin size={18} className={state.landOption === "estimate" ? "text-emerald-600" : "text-muted"} />
              <div>
                <h5 className="text-[14px] font-semibold text-earth">I am still looking</h5>
                <p className="text-[11px] text-muted">
                  {locationData
                    ? `Based on typical lot prices in ${locationData.city}: ${formatCurrencyCompact(estimatedLand, currency)}`
                    : `We will estimate land at 25% of construction cost (${formatCurrencyCompact(estimatedLand, currency)})`
                  }
                </p>
              </div>
            </div>
          </button>
        </div>

        <MentorTip>
          {state.market === "USA"
            ? "Before buying land, verify zoning allows your intended use, check for easements, confirm utility connections are available, and get a soil test for foundation design."
            : "In West Africa, always verify land ownership through the formal title system (titre foncier in Togo, Lands Commission in Ghana, ANDF in Benin). Customary land claims can create disputes."
          }
        </MentorTip>
      </div>
    );
  }

  function renderFinancingStep() {
    const isUSA = state.market === "USA";
    const options: { id: FinancingType; title: string; desc: string; available: boolean }[] = isUSA
      ? [
          { id: "construction_loan", title: "Construction loan", desc: "Bank finances the build, converts to mortgage at completion. Requires 20%+ down, good credit.", available: true },
          { id: "fha_203k", title: "FHA 203(k) renovation loan", desc: "Government-backed loan for purchase and renovation. Lower down payment (3.5%).", available: true },
          { id: "cash", title: "Cash", desc: "Pay for everything out of pocket. No interest costs, full control, fastest closings.", available: true },
        ]
      : [
          { id: "phased_cash", title: "Phased cash (build as you go)", desc: "The most common approach in West Africa. Build each phase as funds become available.", available: true },
          { id: "diaspora", title: "Diaspora funding", desc: "Sending money from abroad to fund construction. Requires trusted local oversight.", available: true },
          { id: "tontine", title: "Tontine / savings group", desc: "Community rotating savings fund. Members take turns receiving the pot.", available: true },
          { id: "cash", title: "Full cash upfront", desc: "Pay the entire cost before construction begins.", available: true },
        ];

    return (
      <div className="animate-fade-in">
        <StepHeading title="How will you pay?" subtitle="Your financing method affects total cost, timeline, and risk." />
        <div className="space-y-3 text-left animate-stagger">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => update("financingType", opt.id)}
              className={`w-full p-4 rounded-xl border text-left transition-all card-hover ${
                state.financingType === opt.id
                  ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
                  : "border-border bg-surface hover:border-sand"
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard size={16} className={state.financingType === opt.id ? "text-emerald-600" : "text-muted"} />
                <div>
                  <h5 className="text-[14px] font-semibold text-earth">{opt.title}</h5>
                  <p className="text-[11px] text-muted mt-0.5">{opt.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Loan parameters for construction loan / FHA */}
        {(state.financingType === "construction_loan" || state.financingType === "fha_203k") && (
          <div className="mt-4 p-4 rounded-[var(--radius)] border border-border bg-surface text-left space-y-3">
            <h5 className="text-[13px] font-semibold text-earth">Loan parameters</h5>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted block mb-1">Down payment %</label>
                <input
                  type="number"
                  value={state.downPaymentPct}
                  onChange={(e) => update("downPaymentPct", Number(e.target.value))}
                  className="w-full px-3 py-2 text-[13px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted block mb-1">Interest rate %</label>
                <input
                  type="number"
                  step="0.1"
                  value={state.loanRate}
                  onChange={(e) => update("loanRate", Number(e.target.value))}
                  className="w-full px-3 py-2 text-[13px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted block mb-1">Build timeline (months)</label>
              <input
                type="number"
                value={state.timelineMonths}
                onChange={(e) => update("timelineMonths", Number(e.target.value))}
                className="w-full px-3 py-2 text-[13px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        <MentorTip>
          {isUSA
            ? "A construction loan typically requires 20-25% down and converts to a mortgage when building is complete. Your debt-to-income ratio (DTI), the percentage of your monthly income going to debt payments, must usually be below 43% to qualify."
            : "Phased cash funding means you build as money is available. This avoids interest costs but extends your timeline. Budget carefully. Running out of funds mid-construction is the most expensive mistake."
          }
        </MentorTip>
      </div>
    );
  }

  function renderFinancialsStep() {
    const locationLabel = locationData ? ` Adjusted for ${locationData.city} (${locationData.costIndex.toFixed(2)}x cost index).` : "";
    const landDetail = state.landOption === "known"
      ? "Your entered land price."
      : locationData
        ? `Based on typical lot prices in ${locationData.city}.`
        : "Estimated at 25% of construction cost.";

    const costRows = [
      { label: "Land", value: costs.land, pct: costs.total > 0 ? (costs.land / costs.total) * 100 : 0, color: "#8B4513", detail: landDetail },
      { label: "Construction", value: costs.construction, pct: costs.total > 0 ? (costs.construction / costs.total) * 100 : 0, color: "#2C1810", detail: `Based on ${getBuildingSize(state).toLocaleString()} ${sizeUnit} at market mid-range cost per ${sizeUnit}.${locationLabel}` },
      { label: "Soft costs (permits, design, fees)", value: costs.soft, pct: costs.total > 0 ? (costs.soft / costs.total) * 100 : 0, color: "#D4A574", detail: `Estimated at 15% of construction cost. Includes architectural design, permits, engineering, and inspections.${locationData ? ` Typical permit cost in ${locationData.city}: ${state.market === "USA" ? "$" : ""}${locationData.permitCostEstimate.toLocaleString()}${state.market !== "USA" ? " CFA" : ""}.` : ""}` },
      { label: "Financing costs", value: costs.financing, pct: costs.total > 0 ? (costs.financing / costs.total) * 100 : 0, color: "#1B4965", detail: state.financingType === "cash" || state.financingType === "phased_cash" ? "No financing costs with cash payment." : `Based on ${state.downPaymentPct}% down at ${state.loanRate}% over ${state.timelineMonths} months.` },
      { label: "Contingency (15%)", value: costs.contingency, pct: costs.total > 0 ? (costs.contingency / costs.total) * 100 : 0, color: "#BC6C25", detail: "A 15% contingency protects against cost overruns. This is the industry standard safety buffer." },
    ];

    return (
      <div className="animate-fade-in">
        <StepHeading title="Your project financials" subtitle="Full cost breakdown with revenue projections based on your goal." />

        <div className="text-left">
          {/* Donut chart */}
          <div className="mb-6">
            <CostDonut segments={donutSegments} />
            <div className="flex flex-wrap justify-center gap-3 mt-3">
              {donutSegments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="text-[10px] text-muted">{seg.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost rows */}
          <div className="space-y-2 mb-6">
            {costRows.map((row) => (
              <div key={row.label} className="p-3 rounded-lg border border-border/50 bg-surface">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                    <span className="text-[13px] text-earth">{row.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[13px] font-data font-semibold text-earth">{formatCurrency(row.value, currency)}</span>
                    <span className="text-[10px] text-muted ml-2">{row.pct.toFixed(0)}%</span>
                  </div>
                </div>
                {row.label === "Soft costs (permits, design, fees)" && (
                  <p className="text-[10px] text-muted mt-0.5">Architectural design, engineering, permits, survey, and professional inspections.</p>
                )}
                {row.label === "Contingency (15%)" && (
                  <p className="text-[10px] text-muted mt-0.5">A safety buffer for unexpected costs. Industry standard is 10-20%. Never build without one.</p>
                )}
                {row.label === "Financing costs" && row.value > 0 && (
                  <p className="text-[10px] text-muted mt-0.5">Interest and fees paid to your lender during construction. Cash buyers pay zero here.</p>
                )}
                <ExpandableDetail label="How we calculated this">
                  {row.detail}
                </ExpandableDetail>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="p-4 rounded-xl border-2 border-earth bg-warm/50">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold text-earth">Total project cost</span>
              <span className="text-[18px] font-data font-bold text-earth">{formatCurrency(costs.total, currency)}</span>
            </div>
          </div>

          {/* What this means summary */}
          {costs.total > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-warm/30 border border-sand/20">
              <p className="text-[12px] text-earth leading-relaxed">
                <span className="font-semibold">In plain terms:</span> You will need approximately {formatCurrencyCompact(costs.total, currency)} to complete this build.
                {costs.land > 0 && ` About ${Math.round((costs.land / costs.total) * 100)}% goes to land.`}
                {` Construction is the biggest cost at ${Math.round((costs.construction / costs.total) * 100)}%.`}
                {costs.financing > 0 && ` Financing adds ${Math.round((costs.financing / costs.total) * 100)}% to your total.`}
                {` Your ${Math.round((costs.contingency / costs.total) * 100)}% contingency of ${formatCurrencyCompact(costs.contingency, currency)} protects against surprises.`}
              </p>
            </div>
          )}

          <MentorTip>
            These estimates use conservative market averages. Actual costs depend on your specific site, materials chosen, and local labor rates. The 15% contingency is your safety buffer. Never skip it.
          </MentorTip>

          {/* Revenue projection */}
          {revenueProjection && (
            <div className="mt-4 p-4 rounded-xl border border-emerald-300 bg-emerald-50">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-emerald-800">{revenueProjection.label}</span>
                <span className="text-[16px] font-data font-bold text-emerald-800">
                  {formatCurrency(revenueProjection.value, currency)}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">{revenueProjection.secondary}</p>
            </div>
          )}

          {/* Override inputs for sale price or rent */}
          {state.goal === "sell" && (
            <div className="mt-3">
              <label className="text-[11px] text-muted block mb-1">Override target sale price ({currency.code})</label>
              <input
                type="number"
                value={state.targetSalePrice || ""}
                onChange={(e) => update("targetSalePrice", Number(e.target.value))}
                placeholder={`Default: ${formatCurrencyCompact(getEstimatedSaleValue(state, locationData), currency)}`}
                className="w-full px-3 py-2 text-[13px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
          {state.goal === "rent" && (
            <div className="mt-3">
              <label className="text-[11px] text-muted block mb-1">Override monthly rent ({currency.code})</label>
              <input
                type="number"
                value={state.monthlyRent || ""}
                onChange={(e) => update("monthlyRent", Number(e.target.value))}
                placeholder={`Default: ${formatCurrencyCompact(getEstimatedMonthlyRent(state, locationData), currency)}`}
                className="w-full px-3 py-2 text-[13px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderScoreStep() {
    const { score, factors, risks, verdict, verdictLevel } = dealResult;
    const scoreColor = verdictLevel === "strong" ? "text-emerald-600" : verdictLevel === "decent" ? "text-warning" : "text-danger";
    const scoreBg = verdictLevel === "strong" ? "bg-emerald-50 border-emerald-300" : verdictLevel === "decent" ? "bg-warning-bg border-warning" : "bg-danger-bg border-danger";

    return (
      <div className="animate-fade-in">
        <StepHeading title="Deal score" subtitle="We evaluated your project across six factors. Here is how it stacks up." />

        <div className="text-left">
          {/* Score circle */}
          <div className="flex flex-col items-center mb-6">
            <div className={`w-24 h-24 rounded-full border-4 ${scoreBg} flex items-center justify-center`}>
              <span className={`text-[32px] font-data font-bold ${scoreColor}`}>{score}</span>
            </div>
            <span className="text-[11px] text-muted mt-2">out of 100</span>
          </div>

          {/* Verdict */}
          <div className={`p-4 rounded-xl border ${scoreBg} mb-6`}>
            <div className="flex items-start gap-2">
              <Shield size={16} className={`${scoreColor} mt-0.5 shrink-0`} />
              <p className="text-[13px] text-earth leading-relaxed">{verdict}</p>
            </div>
          </div>

          {/* Factor breakdown */}
          <div className="space-y-2 mb-6">
            {factors.map((f, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 bg-surface">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {f.positive ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <AlertTriangle size={14} className="text-warning" />
                    )}
                    <span className="text-[12px] font-medium text-earth">{f.label}</span>
                  </div>
                  <span className="text-[11px] font-data text-muted">{f.points}/{f.maxPoints}</span>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${f.positive ? "bg-emerald-500" : "bg-warning"}`}
                    style={{ width: `${(f.points / f.maxPoints) * 100}%` }}
                  />
                </div>
                <ExpandableDetail label="Details">
                  {f.explanation}
                </ExpandableDetail>
              </div>
            ))}
          </div>

          {/* Risks */}
          {risks.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[12px] font-semibold text-earth mb-2">Risk factors</h4>
              <ul className="space-y-1.5">
                {risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-muted">
                    <AlertTriangle size={12} className="text-warning shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA based on score */}
          {score >= 50 ? (
            <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-center">
              <p className="text-[13px] text-emerald-800">This looks like a viable project. Let us set it up.</p>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-warning bg-warning-bg text-center">
              <p className="text-[13px] text-earth">The numbers need work. You can go back and adjust your assumptions, or continue anyway.</p>
            </div>
          )}

          <MentorTip>
            A score above 70 means the numbers are solid. Between 50-70, proceed with caution and review the weak areas. Below 50, consider adjusting your assumptions before committing real money.
          </MentorTip>
        </div>
      </div>
    );
  }

  function renderNameStep() {
    return (
      <div className="animate-fade-in">
        <StepHeading title="Name your project" subtitle="Give it a name you will recognize. You can change this later." />
        <div className="text-left">
          <input
            type="text"
            value={state.projectName}
            onChange={(e) => update("projectName", e.target.value)}
            placeholder="e.g. Robinson residence, Lome villa, Houston duplex"
            className="w-full px-4 py-3 text-[14px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <p className="text-[10px] text-muted mt-2">
            Tip: Use the property address, family name, or location for easy identification.
          </p>

          {/* Summary */}
          <div className="mt-6 p-4 rounded-xl border border-border bg-surface space-y-2">
            <h4 className="text-[13px] font-semibold text-earth mb-3">Project summary</h4>
            <SummaryRow label="Goal" value={state.goal === "sell" ? "Build to sell" : state.goal === "rent" ? "Build to rent" : "Build to occupy"} />
            <SummaryRow label="Market" value={state.market as string} />
            <SummaryRow label="Location" value={state.city} />
            <SummaryRow label="Property type" value={state.propertyType as string} />
            <SummaryRow label="Size" value={`${getBuildingSize(state).toLocaleString()} ${sizeUnit}`} />
            <SummaryRow label="Total budget" value={formatCurrency(costs.total, currency)} />
            <SummaryRow label="Financing" value={state.financingType.replace(/_/g, " ")} />
            <SummaryRow label="Deal score" value={`${dealResult.score}/100`} />
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-xl mx-auto py-8 animate-fade-in">
      {/* Step indicator */}
      <div className="flex gap-1 justify-center mb-8 flex-wrap">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <button
              onClick={() => { if (i < step) setStep(i); }}
              disabled={i > step}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-data font-medium transition-all ${
                i === step
                  ? "bg-earth text-warm"
                  : i < step
                  ? "bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600"
                  : "bg-surface-alt text-muted cursor-default"
              }`}
              title={label}
            >
              {i < step ? (
                <svg width="10" height="8" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                i + 1
              )}
            </button>
            {i < STEP_LABELS.length - 1 && (
              <div className={`w-4 h-[2px] ${i < step ? "bg-emerald-500" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step title label */}
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-clay/60 text-center mb-1">
        Step {step + 1} of {STEP_COUNT}
      </p>

      {/* Pre-filled from Deal Analyzer banner */}
      {state.fromAnalyzer && step < 8 && (
        <div className="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-xl border border-emerald-200 bg-emerald-50/50 text-left">
          <Sparkles size={14} className="text-emerald-600 shrink-0" />
          <p className="text-[12px] text-emerald-800">
            Pre-filled from your Deal Analyzer results. Review and adjust each step, then continue.
          </p>
        </div>
      )}

      {/* Step content */}
      <div className="text-center">
        {renderStep()}
      </div>

      {/* Plan limit error */}
      {planError && (
        <div className="flex items-start gap-2 p-3 rounded-[var(--radius)] bg-danger-bg border border-danger/20 mt-4">
          <AlertTriangle size={16} className="text-danger shrink-0 mt-0.5" />
          <p className="text-[12px] text-danger leading-relaxed">{planError}</p>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex justify-center gap-2 mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-2.5 text-[13px] border border-border-dark rounded-[var(--radius)] bg-surface text-earth hover:bg-surface-alt transition-colors"
        >
          {step === 0 ? "Cancel" : "Back"}
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed() || creating}
          className="px-6 py-2.5 text-[13px] rounded-[var(--radius)] btn-earth hover:bg-earth-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step === STEP_COUNT - 1 ? (creating ? "Creating..." : "Create project") : "Next"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-2xl text-earth mb-2">{title}</h3>
      <p className="text-[13px] text-muted">{subtitle}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[12px]">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-earth">{value}</span>
    </div>
  );
}
