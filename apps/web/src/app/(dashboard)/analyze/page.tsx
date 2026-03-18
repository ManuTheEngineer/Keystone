"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTopbar } from "../layout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTranslation } from "@/lib/hooks/use-translation";
import { useToast } from "@/components/ui/Toast";
import { LearnTooltip } from "@/components/ui/LearnTooltip";
import {
  saveAnalysis,
  getUserAnalyses,
  deleteAnalysis,
  type SavedAnalysis,
} from "@/lib/services/analysis-service";
import { exportAnalysisPDF } from "@/lib/services/export-service";
import {
  calculateAnalysis,
  getCostBreakdown,
  reverseCalculate,
  getBuildingSize,
  type AnalysisInput,
  type AnalysisResults,
  type CostBreakdownItem,
  type RiskFlag,
} from "@/lib/services/deal-analyzer-engine";
import {
  getMarketData,
  formatCurrency,
  formatCurrencyCompact,
  getLocationSuggestions,
  getClosestLocation,
  getCostComparisonText,
  getClimateLabel,
  formatMonthList,
  getCostBenchmarks,
} from "@keystone/market-data";
import type { Market as MarketType, CurrencyConfig, LocationData } from "@keystone/market-data";
import {
  Globe,
  MapPin,
  Home,
  Ruler,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Calculator,
  ArrowRight,
  Save,
  FileDown,
  Share2,
  RotateCcw,
  DollarSign,
  Building2,
  Bed,
  Bath,
  Layers,
  Zap,
  Droplets,
  Sun,
  Trees,
  Car,
  Fence,
  Waves,
  ShieldCheck,
  Plus,
  FolderOpen,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "analyze" | "reverse";

interface InputState {
  goal: "occupy" | "rent" | "sell" | "mixed-use" | "";
  market: MarketType | "";
  city: string;
  zipCode: string;
  propertyType: string;
  sizeCategory: string;
  customSize: number;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  features: string[];
  landOption: string;
  landPrice: number;
  titreFoncierStatus: string;
  financingType: string;
  downPaymentPct: number;
  downPaymentAmount: number;
  loanRate: number;
  loanTerm: number;
  monthlyIncome: number;
  existingDebts: number;
  creditScoreRange: string;
  timelineMonths: number;
  targetSalePrice: number;
  monthlyRent: number;
}

const INITIAL_INPUT: InputState = {
  goal: "",
  market: "",
  city: "",
  zipCode: "",
  propertyType: "SFH",
  sizeCategory: "standard",
  customSize: 0,
  bedrooms: 3,
  bathrooms: 2,
  stories: 1,
  features: [],
  landOption: "",
  landPrice: 0,
  titreFoncierStatus: "",
  financingType: "",
  downPaymentPct: 20,
  downPaymentAmount: 0,
  loanRate: 7.5,
  loanTerm: 30,
  monthlyIncome: 0,
  existingDebts: 0,
  creditScoreRange: "",
  timelineMonths: 12,
  targetSalePrice: 0,
  monthlyRent: 0,
};

// ---------------------------------------------------------------------------
// Feature definitions
// ---------------------------------------------------------------------------

const US_FEATURES = [
  { id: "garage-single", label: "Single garage", Icon: Car },
  { id: "garage-double", label: "Double garage", Icon: Car },
  { id: "garage-carport", label: "Carport", Icon: Car },
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
  { id: "garage-carport", label: "Carport", Icon: Car },
  { id: "porch-patio", label: "Veranda / Terrace", Icon: Trees },
  { id: "pool", label: "Pool", Icon: Waves },
  { id: "fence", label: "Perimeter wall", Icon: Fence },
  { id: "solar", label: "Solar panels", Icon: Sun },
  { id: "guest-house", label: "Guest house", Icon: Home },
  { id: "water-tank", label: "Water tank", Icon: Droplets },
  { id: "generator-house", label: "Generator house", Icon: Zap },
  { id: "security-post", label: "Security post", Icon: ShieldCheck },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCurrency(market: MarketType | ""): CurrencyConfig {
  if (!market) return { code: "USD", symbol: "$", locale: "en-US", decimals: 0, groupSeparator: ",", position: "prefix" as const };
  return getMarketData(market).currency;
}

function fmt(amount: number, currency: CurrencyConfig): string {
  return formatCurrency(amount, currency);
}

function fmtCompact(amount: number, currency: CurrencyConfig): string {
  return formatCurrencyCompact(amount, currency);
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 65) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-warning";
  if (score >= 35) return "text-orange-600 dark:text-orange-400";
  return "text-danger";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-success";
  if (score >= 65) return "bg-emerald-500";
  if (score >= 50) return "bg-warning";
  if (score >= 35) return "bg-orange-500";
  return "bg-danger";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 65) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 35) return "Caution";
  return "High Risk";
}

function riskIcon(level: string) {
  if (level === "critical") return <AlertCircle size={14} className="text-danger shrink-0" />;
  if (level === "warning") return <AlertTriangle size={14} className="text-warning shrink-0" />;
  return <Info size={14} className="text-blue-500 shrink-0" />;
}

// ---------------------------------------------------------------------------
// Section wrapper component
// ---------------------------------------------------------------------------

function Section({ title, subtitle, children, defaultOpen = true }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-warm/30 hover:bg-warm/50 transition-colors text-left"
      >
        <div>
          <h3 className="text-[13px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>{title}</h3>
          {subtitle && <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>}
        </div>
        {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Input field components
// ---------------------------------------------------------------------------

function Label({ children, tooltip }: { children: React.ReactNode; tooltip?: string }) {
  return (
    <label className="flex items-center gap-1.5 text-[12px] font-medium text-earth mb-1">
      {children}
      {tooltip && (
        <LearnTooltip term={String(children)} explanation={tooltip}>
          <span className="inline-flex text-muted/50 hover:text-muted cursor-help"><Info size={12} /></span>
        </LearnTooltip>
      )}
    </label>
  );
}

function Select({ value, onChange, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-[13px] text-earth focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay transition-colors"
      {...props}
    >
      {children}
    </select>
  );
}

function NumberInput({ value, onChange, prefix, suffix, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-muted">{prefix}</span>}
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={`w-full px-3 py-2 bg-surface border border-border rounded-lg text-[13px] text-earth font-data focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay transition-colors ${prefix ? "pl-7" : ""} ${suffix ? "pr-12" : ""}`}
        {...props}
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted">{suffix}</span>}
    </div>
  );
}

function OptionGrid({ options, value, onChange, columns = 2 }: {
  options: { id: string; label: string; Icon?: React.ComponentType<{ size: number }> }[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}) {
  return (
    <div className={`grid gap-2 ${columns === 3 ? "grid-cols-3" : columns === 4 ? "grid-cols-4" : "grid-cols-2"}`}>
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[12px] font-medium transition-all ${
            value === opt.id
              ? "border-clay bg-clay/10 text-clay ring-1 ring-clay/20"
              : "border-border text-earth hover:bg-warm/30"
          }`}
        >
          {opt.Icon && <opt.Icon size={14} />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function FeatureToggle({ features, selected, onChange, market }: {
  features: typeof US_FEATURES;
  selected: string[];
  onChange: (features: string[]) => void;
  market: string;
}) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((f) => f !== id) : [...selected, id]);
  };
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {features.map((f) => (
        <button
          key={f.id}
          onClick={() => toggle(f.id)}
          className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-[11px] transition-all ${
            selected.includes(f.id)
              ? "border-clay bg-clay/10 text-clay"
              : "border-border/50 text-muted hover:bg-warm/20"
          }`}
        >
          <f.Icon size={12} />
          {f.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Donut chart component (SVG)
// ---------------------------------------------------------------------------

function DonutChart({ items, currency }: { items: CostBreakdownItem[]; currency: CurrencyConfig }) {
  const total = items.reduce((s, i) => s + i.amount, 0);
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 60;
  const stroke = 20;

  let offset = 0;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {items.map((item, i) => {
          const pct = item.amount / total;
          const dashLength = circumference * pct;
          const dashOffset = -offset;
          offset += dashLength;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={stroke}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              className="transition-all duration-500"
            />
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-earth text-[11px] font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Total
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-earth text-[13px] font-bold font-data">
          {fmtCompact(total, currency)}
        </text>
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-muted">{item.category}</span>
            <span className="text-[10px] font-data text-earth ml-auto">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Deal Score Gauge
// ---------------------------------------------------------------------------

function ScoreGauge({ score }: { score: number }) {
  const angle = (score / 100) * 180; // 0-180 degree arc
  const radius = 70;
  const cx = 85;
  const cy = 80;

  // Arc path for background
  const describeArc = (startAngle: number, endAngle: number) => {
    const start = {
      x: cx + radius * Math.cos(Math.PI * (1 + startAngle / 180)),
      y: cy + radius * Math.sin(Math.PI * (1 + startAngle / 180)),
    };
    const end = {
      x: cx + radius * Math.cos(Math.PI * (1 + endAngle / 180)),
      y: cy + radius * Math.sin(Math.PI * (1 + endAngle / 180)),
    };
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={170} height={100} viewBox="0 0 170 100">
        {/* Background arc */}
        <path d={describeArc(0, 180)} fill="none" stroke="currentColor" strokeWidth={12} className="text-border" strokeLinecap="round" />
        {/* Score arc */}
        {score > 0 && (
          <path d={describeArc(0, angle)} fill="none" stroke="currentColor" strokeWidth={12}
            className={scoreColor(score)} strokeLinecap="round"
            style={{ transition: "all 0.6s ease-out" }}
          />
        )}
        {/* Score text */}
        <text x={cx} y={cy - 8} textAnchor="middle" className="fill-earth text-[28px] font-bold font-data">
          {score}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" className={`text-[12px] font-semibold ${scoreColor(score)}`}>
          {scoreLabel(score)}
        </text>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function AnalyzePage() {
  const router = useRouter();
  const { setTopbar } = useTopbar();
  const { user, profile } = useAuth();
  const { t: tr } = useTranslation();
  const [tab, setTab] = useState<Tab>("analyze");
  const [input, setInput] = useState<InputState>(() => {
    // Check for shared link params first
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("goal") && p.get("market")) {
        return {
          ...INITIAL_INPUT,
          goal: (p.get("goal") || "") as InputState["goal"],
          market: (p.get("market") || "") as MarketType | "",
          city: p.get("city") || "",
          zipCode: p.get("zip") || "",
          propertyType: p.get("type") || "SFH",
          sizeCategory: p.get("size") || "standard",
          bedrooms: Number(p.get("beds")) || 3,
          bathrooms: Number(p.get("baths")) || 2,
          stories: Number(p.get("stories")) || 1,
          features: p.get("feat") ? p.get("feat")!.split(",") : [],
          landOption: p.get("land") || "",
          financingType: p.get("fin") || "",
          downPaymentPct: Number(p.get("dp")) || 20,
          loanRate: Number(p.get("rate")) || 7.5,
          timelineMonths: Number(p.get("months")) || 12,
          monthlyRent: Number(p.get("rent")) || 0,
          targetSalePrice: Number(p.get("sale")) || 0,
        };
      }
    }
    // Pre-fill market from user profile
    const market = (profile?.market as MarketType) || "";
    return { ...INITIAL_INPUT, market };
  });
  const [reverseBudget, setReverseBudget] = useState(0);
  const [showAllSections, setShowAllSections] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  const { showToast } = useToast();

  // Set topbar
  useEffect(() => {
    setTopbar("Deal Analyzer", undefined, undefined);
  }, [setTopbar]);

  // Load saved analyses
  useEffect(() => {
    if (!user?.uid) return;
    getUserAnalyses(user.uid).then(setSavedAnalyses).catch(() => {});
  }, [user?.uid]);

  // Derived values
  const isUSA = input.market === "USA";
  const isWA = input.market && input.market !== "USA";
  const currency = getCurrency(input.market);
  const sizeUnit = isUSA ? "sqft" : (input.market ? "sqm" : "sqft");
  const features = isUSA ? US_FEATURES : WA_FEATURES;

  // Location suggestions
  const locationSuggestions = useMemo(() => {
    if (!input.market || !input.city || input.city.length < 2) return [];
    const allLocations = getLocationSuggestions(input.market);
    const query = input.city.toLowerCase();
    return allLocations
      .filter((name) => name.toLowerCase().includes(query))
      .slice(0, 5)
      .map((name) => ({ city: name, region: "" }));
  }, [input.market, input.city]);

  // Analysis results (real-time)
  const results = useMemo<AnalysisResults | null>(() => {
    if (!input.goal || !input.market) return null;
    try {
      return calculateAnalysis({
        ...input,
        market: input.market,
      });
    } catch {
      return null;
    }
  }, [input]);

  // Cost breakdown for chart
  const costBreakdown = useMemo(() => {
    if (!results) return [];
    return getCostBreakdown(results);
  }, [results]);

  // Reverse calculator
  const reverseResult = useMemo(() => {
    if (tab !== "reverse" || !reverseBudget || !input.market) return null;
    return reverseCalculate(reverseBudget, input.market, input.city, input.goal);
  }, [tab, reverseBudget, input.market, input.city, input.goal]);

  // Input setter helper
  const set = useCallback(<K extends keyof InputState>(key: K, value: InputState[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Build size display
  const buildSize = useMemo(() => {
    if (!input.market) return 0;
    return getBuildingSize(input as any);
  }, [input]);

  // Location data for intelligence cards
  const locationData = useMemo<LocationData | null>(() => {
    if (!input.market || !input.city || input.city.length < 2) return null;
    return getClosestLocation(input.city, input.market);
  }, [input.market, input.city]);

  // Cross-market comparison
  const crossMarketData = useMemo(() => {
    if (!results || !input.market) return null;
    const markets: MarketType[] = ["USA", "TOGO", "GHANA", "BENIN"];
    const others = markets.filter((m) => m !== input.market);
    return others.map((m) => {
      try {
        const otherResults = calculateAnalysis({ ...input, market: m } as any);
        const mData = getMarketData(m);
        return {
          market: m,
          currency: mData.currency,
          totalCost: otherResults.totalCost,
          costPerUnit: otherResults.costPerUnit,
          dealScore: otherResults.dealScore,
        };
      } catch {
        return null;
      }
    }).filter(Boolean) as { market: string; currency: CurrencyConfig; totalCost: number; costPerUnit: number; dealScore: number }[];
  }, [results, input]);

  // Sensitivity analysis: vary key inputs +/- 10-20%
  const sensitivityData = useMemo(() => {
    if (!results || !input.market) return null;
    const scenarios: { label: string; totalCost: number; dealScore: number; delta: number }[] = [];
    const baseTotal = results.totalCost;

    // Higher construction costs (+15%)
    const higherCostInput = { ...input, sizeCategory: "custom", customSize: Math.round(buildSize * 1.15) } as any;
    try {
      const r = calculateAnalysis(higherCostInput);
      scenarios.push({ label: "Costs +15%", totalCost: r.totalCost, dealScore: r.dealScore, delta: r.totalCost - baseTotal });
    } catch {}

    // Lower construction costs (-15%)
    const lowerCostInput = { ...input, sizeCategory: "custom", customSize: Math.round(buildSize * 0.85) } as any;
    try {
      const r = calculateAnalysis(lowerCostInput);
      scenarios.push({ label: "Costs -15%", totalCost: r.totalCost, dealScore: r.dealScore, delta: r.totalCost - baseTotal });
    } catch {}

    // Higher interest rate (+2%)
    if (input.financingType === "construction_loan" || input.financingType === "fha_203k") {
      try {
        const r = calculateAnalysis({ ...input, loanRate: input.loanRate + 2 } as any);
        scenarios.push({ label: "Rate +2%", totalCost: r.totalCost, dealScore: r.dealScore, delta: r.totalCost - baseTotal });
      } catch {}
    }

    // Longer timeline (+6 months)
    try {
      const r = calculateAnalysis({ ...input, timelineMonths: input.timelineMonths + 6 } as any);
      scenarios.push({ label: "+6 months", totalCost: r.totalCost, dealScore: r.dealScore, delta: r.totalCost - baseTotal });
    } catch {}

    return scenarios;
  }, [results, input, buildSize]);

  // Dual currency conversion rate
  const dualCurrency = useMemo(() => {
    if (!input.market || input.market === "USA") return null;
    // Show USD equivalent for WA markets
    const usdCurrency: CurrencyConfig = { code: "USD", symbol: "$", locale: "en-US", decimals: 0, groupSeparator: ",", position: "prefix" as const };
    const rates: Record<string, number> = { TOGO: 610, GHANA: 14.5, BENIN: 610 }; // CFA/GHS per USD
    const rate = rates[input.market];
    if (!rate || !results) return null;
    return { usdCurrency, rate, usdTotal: Math.round(results.totalCost / rate) };
  }, [input.market, results]);

  // Whether enough inputs exist to show results
  const hasResults = results !== null && input.goal && input.market;

  // Save handler
  const handleSave = useCallback(async () => {
    if (!user?.uid || !results || !saveName.trim()) return;
    setSaving(true);
    try {
      await saveAnalysis(user.uid, saveName.trim(), input as unknown as AnalysisInput, results);
      const updated = await getUserAnalyses(user.uid);
      setSavedAnalyses(updated);
      setShowSaveDialog(false);
      setSaveName("");
      showToast("Analysis saved", "success");
    } catch (err) {
      showToast("Failed to save analysis", "error");
    } finally {
      setSaving(false);
    }
  }, [user?.uid, results, saveName, input, showToast]);

  // Load handler
  const handleLoad = useCallback((analysis: SavedAnalysis) => {
    setInput({
      goal: analysis.input.goal || "",
      market: (analysis.input.market as MarketType) || "",
      city: analysis.input.city || "",
      zipCode: analysis.input.zipCode || "",
      propertyType: analysis.input.propertyType || "SFH",
      sizeCategory: analysis.input.sizeCategory || "standard",
      customSize: analysis.input.customSize || 0,
      bedrooms: analysis.input.bedrooms || 3,
      bathrooms: analysis.input.bathrooms || 2,
      stories: analysis.input.stories || 1,
      features: analysis.input.features || [],
      landOption: analysis.input.landOption || "",
      landPrice: analysis.input.landPrice || 0,
      titreFoncierStatus: analysis.input.titreFoncierStatus || "",
      financingType: analysis.input.financingType || "",
      downPaymentPct: analysis.input.downPaymentPct || 20,
      downPaymentAmount: analysis.input.downPaymentAmount || 0,
      loanRate: analysis.input.loanRate || 7.5,
      loanTerm: analysis.input.loanTerm || 30,
      monthlyIncome: analysis.input.monthlyIncome || 0,
      existingDebts: analysis.input.existingDebts || 0,
      creditScoreRange: analysis.input.creditScoreRange || "",
      timelineMonths: analysis.input.timelineMonths || 12,
      targetSalePrice: analysis.input.targetSalePrice || 0,
      monthlyRent: analysis.input.monthlyRent || 0,
    });
    setTab("analyze");
    setShowSavedList(false);
    showToast(`Loaded "${analysis.name}"`, "success");
  }, [showToast]);

  // Delete handler
  const handleDelete = useCallback(async (analysisId: string) => {
    if (!user?.uid) return;
    try {
      await deleteAnalysis(user.uid, analysisId);
      setSavedAnalyses((prev) => prev.filter((a) => a.id !== analysisId));
      showToast("Analysis deleted", "success");
    } catch {
      showToast("Failed to delete", "error");
    }
  }, [user?.uid, showToast]);

  return (
    <div className="min-h-full">
      {/* Tab switcher */}
      <div className="flex gap-1 mb-5 p-1 bg-warm/30 rounded-xl w-fit">
        <button
          onClick={() => setTab("analyze")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
            tab === "analyze" ? "bg-surface shadow-sm text-earth" : "text-muted hover:text-earth"
          }`}
        >
          <Calculator size={15} />
          Analyze a Deal
        </button>
        <button
          onClick={() => setTab("reverse")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
            tab === "reverse" ? "bg-surface shadow-sm text-earth" : "text-muted hover:text-earth"
          }`}
        >
          <RotateCcw size={15} />
          What Can I Afford?
        </button>
        {savedAnalyses.length > 0 && (
          <button
            onClick={() => setShowSavedList(!showSavedList)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-muted hover:text-earth transition-all ml-auto"
          >
            <FolderOpen size={15} />
            My Analyses ({savedAnalyses.length})
          </button>
        )}
      </div>

      {/* Saved Analyses List */}
      {showSavedList && savedAnalyses.length > 0 && (
        <div className="mb-5 bg-surface border border-border rounded-xl p-4">
          <h4 className="text-[13px] font-semibold text-earth mb-3" style={{ fontFamily: "var(--font-heading)" }}>Saved Analyses</h4>
          <div className="space-y-2">
            {savedAnalyses.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-warm/20 rounded-lg hover:bg-warm/30 transition-colors">
                <button onClick={() => handleLoad(a)} className="flex-1 text-left">
                  <p className="text-[13px] font-medium text-earth">{a.name}</p>
                  <p className="text-[11px] text-muted">
                    {a.input.market} / {a.input.city || "No location"} / Score: {a.results?.dealScore ?? "N/A"}
                    <span className="mx-1.5">-</span>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-1.5 text-muted hover:text-danger transition-colors shrink-0"
                  aria-label="Delete analysis"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "analyze" ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── LEFT PANEL: Inputs ─── */}
          <div className="lg:w-[440px] shrink-0 space-y-3">

            {/* Section A: Goal */}
            <Section title="Your Goal" subtitle="What do you want to do with this property?">
              <OptionGrid
                options={[
                  { id: "occupy", label: "Live in it", Icon: Home },
                  { id: "rent", label: "Rent it out", Icon: DollarSign },
                  { id: "sell", label: "Sell for profit", Icon: TrendingUp },
                  { id: "mixed-use", label: "Mixed use", Icon: Building2 },
                ]}
                value={input.goal}
                onChange={(v) => set("goal", v as InputState["goal"])}
              />
              {(input.goal === "rent") && (
                <div className="mt-2">
                  <Label tooltip="Expected monthly rental income after the property is built and occupied">Monthly rent</Label>
                  <NumberInput value={input.monthlyRent} onChange={(v) => set("monthlyRent", v)} prefix={currency.symbol} />
                </div>
              )}
              {(input.goal === "sell") && (
                <div className="mt-2">
                  <Label tooltip="The price you expect to sell the completed property for">Target sale price</Label>
                  <NumberInput value={input.targetSalePrice} onChange={(v) => set("targetSalePrice", v)} prefix={currency.symbol} />
                </div>
              )}
            </Section>

            {/* Section B: Market & Location */}
            <Section title="Market & Location" subtitle="Where are you building?">
              <Label>Market</Label>
              <OptionGrid
                options={[
                  { id: "USA", label: "United States" },
                  { id: "TOGO", label: "Togo" },
                  { id: "GHANA", label: "Ghana" },
                  { id: "BENIN", label: "Benin" },
                ]}
                value={input.market}
                onChange={(v) => set("market", v as MarketType)}
                columns={4}
              />
              {input.market && (
                <div className="mt-2 relative">
                  <Label tooltip="The city or area where you plan to build. This affects cost estimates.">City / Region</Label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      value={input.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder={isUSA ? "e.g. Houston, TX" : `e.g. ${input.market === "TOGO" ? "Lome" : input.market === "GHANA" ? "Accra" : "Cotonou"}`}
                      className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-[13px] text-earth focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay"
                    />
                  </div>
                  {locationSuggestions.length > 0 && (
                    <div className="absolute z-30 left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                      {locationSuggestions.map((loc) => (
                        <button
                          key={loc.city}
                          onClick={() => { set("city", loc.city); }}
                          className="w-full text-left px-3 py-2 text-[12px] text-earth hover:bg-warm/30 transition-colors border-b border-border/30 last:border-b-0"
                        >
                          <span className="font-medium">{loc.city}</span>
                          {loc.region && <span className="text-muted ml-1">({loc.region})</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  {isUSA && (
                    <div className="mt-2">
                      <Label>ZIP code (optional, more accurate)</Label>
                      <input
                        type="text"
                        value={input.zipCode}
                        onChange={(e) => set("zipCode", e.target.value)}
                        placeholder="e.g. 77001"
                        maxLength={5}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-[13px] text-earth font-data focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay"
                      />
                    </div>
                  )}
                </div>
              )}
            </Section>

            {/* Section C: Property */}
            <Section title="Property Details" subtitle="What kind of home are you building?">
              <Label>Property type</Label>
              <OptionGrid
                options={[
                  { id: "SFH", label: "Single family" },
                  { id: "DUPLEX", label: "Duplex" },
                  { id: "TRIPLEX", label: "Triplex" },
                  { id: "FOURPLEX", label: "Fourplex" },
                ]}
                value={input.propertyType}
                onChange={(v) => set("propertyType", v)}
              />

              <div className="mt-2">
                <Label tooltip={`Approximate size of the home in ${sizeUnit}. This is the primary driver of construction cost.`}>
                  Size ({sizeUnit})
                </Label>
                <OptionGrid
                  options={[
                    { id: "compact", label: isUSA ? "Compact (1,200)" : "Compact (80)" },
                    { id: "standard", label: isUSA ? "Standard (1,800)" : "Standard (130)" },
                    { id: "large", label: isUSA ? "Large (2,800)" : "Large (200)" },
                    { id: "estate", label: isUSA ? "Estate (4,000)" : "Estate (300)" },
                    { id: "custom", label: "Custom" },
                  ]}
                  value={input.sizeCategory}
                  onChange={(v) => set("sizeCategory", v)}
                  columns={3}
                />
                {input.sizeCategory === "custom" && (
                  <div className="mt-2">
                    <NumberInput value={input.customSize} onChange={(v) => set("customSize", v)} suffix={sizeUnit} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                <div>
                  <Label>Bedrooms</Label>
                  <div className="flex items-center gap-1">
                    <button onClick={() => set("bedrooms", Math.max(1, input.bedrooms - 1))} className="w-8 h-8 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[14px]">-</button>
                    <span className="w-8 text-center font-data text-[14px] text-earth">{input.bedrooms}</span>
                    <button onClick={() => set("bedrooms", Math.min(8, input.bedrooms + 1))} className="w-8 h-8 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[14px]">+</button>
                  </div>
                </div>
                <div>
                  <Label>Bathrooms</Label>
                  <div className="flex items-center gap-1">
                    <button onClick={() => set("bathrooms", Math.max(1, input.bathrooms - 1))} className="w-8 h-8 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[14px]">-</button>
                    <span className="w-8 text-center font-data text-[14px] text-earth">{input.bathrooms}</span>
                    <button onClick={() => set("bathrooms", Math.min(6, input.bathrooms + 1))} className="w-8 h-8 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[14px]">+</button>
                  </div>
                </div>
                <div>
                  <Label>Stories</Label>
                  <div className="flex items-center gap-1">
                    <button onClick={() => set("stories", Math.max(1, input.stories - 1))} className="w-8 h-8 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[14px]">-</button>
                    <span className="w-8 text-center font-data text-[14px] text-earth">{input.stories}</span>
                    <button onClick={() => set("stories", Math.min(3, input.stories + 1))} className="w-8 h-8 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[14px]">+</button>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <Label>Features & Extras</Label>
                <FeatureToggle
                  features={features}
                  selected={input.features}
                  onChange={(f) => set("features", f)}
                  market={input.market}
                />
              </div>
            </Section>

            {/* Section D: Land */}
            <Section title="Land" subtitle="Do you already have land?" defaultOpen={false}>
              <OptionGrid
                options={[
                  { id: "already-own", label: "Already own" },
                  { id: "inherited", label: "Inherited / Family" },
                  { id: "buying", label: "Buying / Known price" },
                  { id: "estimate", label: "Estimate for me" },
                ]}
                value={input.landOption}
                onChange={(v) => set("landOption", v)}
              />
              {(input.landOption === "buying") && (
                <div className="mt-2">
                  <Label>Land price</Label>
                  <NumberInput value={input.landPrice} onChange={(v) => set("landPrice", v)} prefix={currency.symbol} />
                </div>
              )}
              {isWA && (
                <div className="mt-2">
                  <Label tooltip="The titre foncier (land title) is a government-issued certificate proving legal ownership. Building without one is extremely risky.">
                    Land title status
                  </Label>
                  <Select value={input.titreFoncierStatus} onChange={(e) => set("titreFoncierStatus", e.target.value)}>
                    <option value="">Select status</option>
                    <option value="secured">Titre foncier secured</option>
                    <option value="in-progress">In progress</option>
                    <option value="not-started">Not started</option>
                    <option value="customary">Customary / communal land</option>
                  </Select>
                </div>
              )}
            </Section>

            {/* Section E: Financing */}
            <Section title="Financing" subtitle="How are you funding the build?" defaultOpen={false}>
              <Label>Financing method</Label>
              <OptionGrid
                options={isUSA ? [
                  { id: "cash", label: "Cash" },
                  { id: "construction_loan", label: "Construction loan" },
                  { id: "fha_203k", label: "FHA 203(k)" },
                ] : [
                  { id: "cash", label: "Cash" },
                  { id: "phased_cash", label: "Phased (as-available)" },
                  { id: "diaspora", label: "Diaspora savings" },
                  { id: "tontine", label: "Tontine / Group" },
                ]}
                value={input.financingType}
                onChange={(v) => set("financingType", v)}
              />

              {(input.financingType === "construction_loan" || input.financingType === "fha_203k") && (
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label tooltip="Percentage of total cost you will pay upfront. Higher down payment = lower monthly cost and better loan terms.">Down payment %</Label>
                      <NumberInput value={input.downPaymentPct} onChange={(v) => set("downPaymentPct", v)} suffix="%" />
                    </div>
                    <div>
                      <Label tooltip="Annual interest rate on the construction loan">Interest rate</Label>
                      <NumberInput value={input.loanRate} onChange={(v) => set("loanRate", v)} suffix="%" step={0.1} />
                    </div>
                  </div>
                  <div>
                    <Label>Loan term (years)</Label>
                    <Select value={input.loanTerm} onChange={(e) => set("loanTerm", Number(e.target.value))}>
                      <option value={15}>15 years</option>
                      <option value={20}>20 years</option>
                      <option value={30}>30 years</option>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label tooltip="Your total gross monthly income before taxes. Used to calculate debt-to-income ratio.">Monthly income</Label>
                      <NumberInput value={input.monthlyIncome} onChange={(v) => set("monthlyIncome", v)} prefix={currency.symbol} />
                    </div>
                    <div>
                      <Label tooltip="Total of all other monthly debt payments (car, student loans, credit cards)">Existing monthly debts</Label>
                      <NumberInput value={input.existingDebts} onChange={(v) => set("existingDebts", v)} prefix={currency.symbol} />
                    </div>
                  </div>
                </div>
              )}
            </Section>

            {/* Section F: Timeline */}
            <Section title="Timeline" subtitle="How long will this build take?" defaultOpen={false}>
              <Label tooltip="Estimated months from breaking ground to move-in. Affects financing costs and planning.">Construction timeline</Label>
              <Select value={input.timelineMonths} onChange={(e) => set("timelineMonths", Number(e.target.value))}>
                <option value={6}>6 months (aggressive)</option>
                <option value={9}>9 months (fast)</option>
                <option value={12}>12 months (standard)</option>
                <option value={18}>18 months (relaxed)</option>
                <option value={24}>24 months (phased)</option>
                <option value={36}>36+ months (multi-phase)</option>
              </Select>
            </Section>

            {/* Reset */}
            <button
              onClick={() => setInput({ ...INITIAL_INPUT, market: input.market })}
              className="flex items-center gap-2 text-[12px] text-muted hover:text-earth transition-colors"
            >
              <RotateCcw size={12} />
              Reset all inputs
            </button>
          </div>

          {/* ─── RIGHT PANEL: Results ─── */}
          <div className="flex-1 min-w-0">
            {hasResults ? (
              <div className="space-y-4 lg:sticky lg:top-4">
                {/* Deal Score Card */}
                <div className="bg-surface border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-[15px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>
                        Deal Score
                      </h3>
                      <p className="text-[12px] text-muted mt-0.5">{results!.dealScoreSummary}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[11px] font-bold text-white ${scoreBg(results!.dealScore)}`}>
                      {scoreLabel(results!.dealScore)}
                    </div>
                  </div>
                  <ScoreGauge score={results!.dealScore} />
                </div>

                {/* Cost Breakdown */}
                <div className="bg-surface border border-border rounded-xl p-5">
                  <h3 className="text-[15px] font-semibold text-earth mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                    Cost Breakdown
                  </h3>
                  <DonutChart items={costBreakdown} currency={currency} />
                </div>

                {/* Financial Summary */}
                <div className="bg-surface border border-border rounded-xl p-5">
                  <h3 className="text-[15px] font-semibold text-earth mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                    Financial Summary
                  </h3>
                  <div className="space-y-2">
                    <SummaryRow label="Total project cost" value={fmt(results!.totalCost, currency)} bold />
                    <SummaryRow label="Construction" value={fmt(results!.constructionCost, currency)} />
                    <SummaryRow label="Land" value={fmt(results!.landCost, currency)} />
                    <SummaryRow label="Soft costs (permits, design)" value={fmt(results!.softCosts, currency)} />
                    <SummaryRow label="Contingency" value={fmt(results!.contingency, currency)} />
                    {results!.financingCosts > 0 && (
                      <SummaryRow label="Financing costs" value={fmt(results!.financingCosts, currency)} />
                    )}
                    <div className="border-t border-border my-2" />
                    <SummaryRow
                      label={`Cost per ${sizeUnit}`}
                      value={fmt(results!.costPerUnit, currency)}
                      sub={`${buildSize.toLocaleString()} ${sizeUnit}`}
                    />
                    {results!.monthlyCost > 0 && (
                      <SummaryRow label="Monthly payment" value={fmt(results!.monthlyCost, currency)} highlight />
                    )}
                    {results!.dtiRatio !== null && (
                      <SummaryRow
                        label="Debt-to-income ratio"
                        value={`${results!.dtiRatio}%`}
                        warning={results!.dtiRatio > 43}
                      />
                    )}
                    <SummaryRow label="Loan-to-value ratio" value={`${results!.ltvRatio}%`} />
                    {results!.roi !== 0 && (
                      <SummaryRow
                        label={input.goal === "rent" ? "Annual rental yield" : "Expected ROI"}
                        value={`${results!.roi}%`}
                        positive={results!.roi > 0}
                      />
                    )}
                  </div>
                </div>

                {/* Risk Flags */}
                {results!.riskFlags.length > 0 && (
                  <div className="bg-surface border border-border rounded-xl p-5">
                    <h3 className="text-[15px] font-semibold text-earth mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                      Risk Analysis
                    </h3>
                    <div className="space-y-2">
                      {results!.riskFlags.map((flag, i) => (
                        <div key={i} className={`flex gap-2.5 p-3 rounded-lg border ${
                          flag.level === "critical" ? "border-danger/30 bg-danger/5" :
                          flag.level === "warning" ? "border-warning/30 bg-warning/5" :
                          "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                        }`}>
                          {riskIcon(flag.level)}
                          <div>
                            <p className="text-[12px] font-medium text-earth">{flag.title}</p>
                            <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{flag.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dual Currency Display */}
                {dualCurrency && (
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe size={14} className="text-clay" />
                      <h4 className="text-[13px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>
                        Dual Currency
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-warm/20 rounded-lg">
                        <p className="text-[10px] text-muted uppercase tracking-wide">{currency.code}</p>
                        <p className="text-[16px] font-bold text-earth font-data">{fmtCompact(results!.totalCost, currency)}</p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-[10px] text-muted uppercase tracking-wide">USD equivalent</p>
                        <p className="text-[16px] font-bold text-earth font-data">{fmtCompact(dualCurrency.usdTotal, dualCurrency.usdCurrency)}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted/60 mt-2">Rate: 1 USD = {dualCurrency.rate.toLocaleString()} {currency.code}</p>
                  </div>
                )}

                {/* Location Intelligence */}
                {locationData && (
                  <div className="bg-surface border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={14} className="text-clay" />
                      <h3 className="text-[15px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>
                        Location Intelligence
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <LocationCard label="Cost Index" value={`${locationData.costIndex.toFixed(2)}x`} sub={getCostComparisonText(locationData.costIndex)} positive={locationData.costIndex < 1.0} />
                      <LocationCard label="Labor Index" value={`${locationData.laborIndex.toFixed(2)}x`} sub={locationData.laborIndex < 1 ? "Below average labor costs" : "Above average labor costs"} positive={locationData.laborIndex < 1.0} />
                      <LocationCard label="Climate" value={getClimateLabel(locationData.climate)} sub={`Building season: ${formatMonthList(locationData.buildingSeasonMonths)}`} />
                      <LocationCard label="Property Tax" value={`${locationData.propertyTaxRate}%`} sub="Annual rate" />
                      {locationData.avgRentPerSqft && (
                        <LocationCard label="Avg Rent" value={`$${locationData.avgRentPerSqft.toFixed(2)}/sqft`} sub="Market rental rate" />
                      )}
                      {locationData.avgRentPerSqm && (
                        <LocationCard label="Avg Rent" value={`${locationData.avgRentPerSqm.toLocaleString()} CFA/sqm`} sub="Market rental rate" />
                      )}
                      {locationData.permitCostEstimate > 0 && (
                        <LocationCard label="Permit Cost" value={fmt(locationData.permitCostEstimate, currency)} sub="Estimated permits & fees" />
                      )}
                    </div>
                    {locationData.localNotes && (
                      <p className="text-[11px] text-muted mt-3 leading-relaxed italic">{locationData.localNotes}</p>
                    )}
                  </div>
                )}

                {/* Cross-Market Comparison */}
                {crossMarketData && crossMarketData.length > 0 && (
                  <div className="bg-surface border border-border rounded-xl p-5">
                    <h3 className="text-[15px] font-semibold text-earth mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                      Cross-Market Comparison
                    </h3>
                    <p className="text-[11px] text-muted mb-3">Same property specs in different markets</p>
                    <div className="space-y-2">
                      {/* Current market */}
                      <div className="flex items-center justify-between p-2.5 bg-clay/10 rounded-lg border border-clay/20">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-clay" />
                          <span className="text-[12px] font-semibold text-earth">{input.market}</span>
                          <span className="text-[10px] text-muted">(current)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[13px] font-data font-medium text-earth">{fmtCompact(results!.totalCost, currency)}</span>
                          <span className={`ml-2 text-[11px] font-data ${scoreColor(results!.dealScore)}`}>Score: {results!.dealScore}</span>
                        </div>
                      </div>
                      {/* Other markets */}
                      {crossMarketData.map((cm) => {
                        const diff = cm.totalCost - results!.totalCost;
                        const pctDiff = results!.totalCost > 0 ? Math.round((diff / results!.totalCost) * 100) : 0;
                        return (
                          <div key={cm.market} className="flex items-center justify-between p-2.5 bg-warm/10 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-muted/30" />
                              <span className="text-[12px] font-medium text-earth">{cm.market}</span>
                            </div>
                            <div className="text-right flex items-center gap-2">
                              <span className="text-[12px] font-data text-muted">{fmtCompact(cm.totalCost, cm.currency)}</span>
                              <span className={`text-[11px] font-data font-medium ${pctDiff > 0 ? "text-danger" : pctDiff < 0 ? "text-success" : "text-muted"}`}>
                                {pctDiff > 0 ? "+" : ""}{pctDiff}%
                              </span>
                              <span className={`text-[10px] font-data ${scoreColor(cm.dealScore)}`}>{cm.dealScore}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sensitivity Analysis */}
                {sensitivityData && sensitivityData.length > 0 && (
                  <div className="bg-surface border border-border rounded-xl p-5">
                    <h3 className="text-[15px] font-semibold text-earth mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                      Sensitivity Analysis
                    </h3>
                    <p className="text-[11px] text-muted mb-3">How your deal changes under different scenarios</p>
                    <div className="space-y-2">
                      {/* Baseline */}
                      <div className="flex items-center justify-between p-2.5 bg-warm/20 rounded-lg text-[12px]">
                        <span className="font-medium text-earth">Baseline</span>
                        <div className="flex items-center gap-3">
                          <span className="font-data text-earth">{fmtCompact(results!.totalCost, currency)}</span>
                          <span className={`font-data font-medium ${scoreColor(results!.dealScore)}`}>Score: {results!.dealScore}</span>
                        </div>
                      </div>
                      {sensitivityData.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 text-[12px]">
                          <span className="text-muted">{s.label}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-data text-earth">{fmtCompact(s.totalCost, currency)}</span>
                            <span className={`font-data text-[11px] ${s.delta > 0 ? "text-danger" : "text-success"}`}>
                              {s.delta > 0 ? "+" : ""}{fmtCompact(s.delta, currency)}
                            </span>
                            <span className={`font-data font-medium ${scoreColor(s.dealScore)}`}>{s.dealScore}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-clay text-white rounded-lg text-[13px] font-medium hover:bg-clay/90 transition-colors"
                  >
                    <Save size={14} />
                    Save Analysis
                  </button>
                  <button
                    onClick={() => {
                      // Navigate to new-project with pre-filled data
                      const params = new URLSearchParams({
                        from: "analyzer",
                        goal: input.goal,
                        market: input.market,
                        city: input.city,
                        type: input.propertyType,
                        size: input.sizeCategory,
                        beds: String(input.bedrooms),
                        baths: String(input.bathrooms),
                        stories: String(input.stories),
                        financing: input.financingType,
                      });
                      if (input.features.length > 0) params.set("feat", input.features.join(","));
                      if (input.landOption) params.set("land", input.landOption);
                      if (input.landPrice) params.set("landprice", String(input.landPrice));
                      if (input.monthlyRent) params.set("rent", String(input.monthlyRent));
                      if (input.targetSalePrice) params.set("sale", String(input.targetSalePrice));
                      if (input.downPaymentPct !== 20) params.set("dp", String(input.downPaymentPct));
                      if (input.loanRate !== 7.5) params.set("rate", String(input.loanRate));
                      if (input.timelineMonths !== 12) params.set("months", String(input.timelineMonths));
                      router.push(`/new-project?${params.toString()}`);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-earth text-white rounded-lg text-[13px] font-medium hover:bg-earth/90 transition-colors"
                  >
                    <Plus size={14} />
                    Create Project
                  </button>
                  <button
                    onClick={() => {
                      if (!results) return;
                      exportAnalysisPDF({
                        name: `${input.city || input.market} ${input.propertyType} Analysis`,
                        input: {
                          goal: input.goal,
                          market: input.market,
                          city: input.city,
                          propertyType: input.propertyType,
                          sizeCategory: input.sizeCategory,
                          bedrooms: input.bedrooms,
                          bathrooms: input.bathrooms,
                          stories: input.stories,
                          features: input.features,
                          landOption: input.landOption,
                          financingType: input.financingType,
                          timelineMonths: input.timelineMonths,
                        },
                        results: {
                          dealScore: results.dealScore,
                          dealScoreSummary: results.dealScoreSummary,
                          totalCost: results.totalCost,
                          constructionCost: results.constructionCost,
                          landCost: results.landCost,
                          softCosts: results.softCosts,
                          financingCosts: results.financingCosts,
                          contingency: results.contingency,
                          monthlyCost: results.monthlyCost,
                          roi: results.roi,
                          dtiRatio: results.dtiRatio,
                          ltvRatio: results.ltvRatio,
                          costPerUnit: results.costPerUnit,
                          riskFlags: results.riskFlags,
                        },
                        currency: { code: currency.code, symbol: currency.symbol },
                        sizeUnit,
                        buildSize,
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-[13px] font-medium text-earth hover:bg-warm/30 transition-colors"
                  >
                    <FileDown size={14} />
                    Export PDF
                  </button>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams({
                        goal: input.goal,
                        market: input.market,
                        city: input.city,
                        type: input.propertyType,
                        size: input.sizeCategory,
                        beds: String(input.bedrooms),
                        baths: String(input.bathrooms),
                        stories: String(input.stories),
                        land: input.landOption,
                        fin: input.financingType,
                        dp: String(input.downPaymentPct),
                        rate: String(input.loanRate),
                        months: String(input.timelineMonths),
                      });
                      if (input.features.length > 0) params.set("feat", input.features.join(","));
                      if (input.monthlyRent) params.set("rent", String(input.monthlyRent));
                      if (input.targetSalePrice) params.set("sale", String(input.targetSalePrice));
                      if (input.zipCode) params.set("zip", input.zipCode);
                      const url = `${window.location.origin}/analyze?${params.toString()}`;
                      navigator.clipboard.writeText(url).then(() => {
                        showToast("Link copied to clipboard", "success");
                      }).catch(() => {
                        showToast("Could not copy link", "error");
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-[13px] font-medium text-earth hover:bg-warm/30 transition-colors"
                  >
                    <Share2 size={14} />
                    Copy Link
                  </button>
                </div>

                {/* Disclaimer */}
                <p className="text-[10px] text-muted/60 leading-relaxed">
                  These estimates are for educational guidance only. Actual costs vary significantly by location, materials, labor availability, and market conditions. Consult licensed professionals before making financial commitments.
                </p>
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-warm/50 flex items-center justify-center mb-4">
                  <Calculator size={28} className="text-clay" />
                </div>
                <h3 className="text-[16px] font-semibold text-earth mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Start your analysis
                </h3>
                <p className="text-[13px] text-muted max-w-xs leading-relaxed">
                  Select your goal and market to begin. Results update in real-time as you fill in details.
                </p>
                <div className="flex items-center gap-2 mt-4 text-[12px] text-clay font-medium">
                  <ArrowRight size={14} />
                  Begin with "Your Goal" on the left
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ─── REVERSE CALCULATOR TAB ─── */
        <div className="max-w-xl mx-auto space-y-5">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-[16px] font-semibold text-earth mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              What Can I Afford?
            </h3>
            <p className="text-[12px] text-muted mb-4">
              Enter your total budget and we will estimate the largest home you can build.
            </p>

            <div className="space-y-3">
              <div>
                <Label>Market</Label>
                <OptionGrid
                  options={[
                    { id: "USA", label: "United States" },
                    { id: "TOGO", label: "Togo" },
                    { id: "GHANA", label: "Ghana" },
                    { id: "BENIN", label: "Benin" },
                  ]}
                  value={input.market}
                  onChange={(v) => set("market", v as MarketType)}
                  columns={4}
                />
              </div>

              {input.market && (
                <>
                  <div>
                    <Label>City / Region</Label>
                    <input
                      type="text"
                      value={input.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder={isUSA ? "e.g. Houston, TX" : "e.g. Lome"}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-[13px] text-earth focus:outline-none focus:ring-2 focus:ring-clay/30"
                    />
                  </div>
                  <div>
                    <Label tooltip="Your total available budget including land, construction, permits, and contingency">Total budget</Label>
                    <NumberInput value={reverseBudget} onChange={setReverseBudget} prefix={currency.symbol} />
                  </div>
                </>
              )}
            </div>
          </div>

          {reverseResult && reverseBudget > 0 && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-[16px] font-semibold text-earth mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                You Can Build
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <StatCard label="Max size" value={`${reverseResult.maxSize.toLocaleString()} ${sizeUnit}`} Icon={Ruler} />
                <StatCard label="Bedrooms" value={String(reverseResult.bedrooms)} Icon={Bed} />
                <StatCard label="Bathrooms" value={String(reverseResult.bathrooms)} Icon={Bath} />
                <StatCard label="Stories" value={String(reverseResult.stories)} Icon={Layers} />
              </div>
              <p className="text-[13px] text-earth leading-relaxed">{reverseResult.description}</p>
              <p className="text-[10px] text-muted/60 mt-3">
                Assumes standard finishes, includes land (25%), permits (15%), and contingency.
              </p>

              <button
                onClick={() => {
                  setInput({
                    ...input,
                    bedrooms: reverseResult.bedrooms,
                    bathrooms: reverseResult.bathrooms,
                    stories: reverseResult.stories,
                    sizeCategory: "custom",
                    customSize: reverseResult.maxSize,
                  });
                  setTab("analyze");
                }}
                className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-clay text-white rounded-lg text-[13px] font-medium hover:bg-clay/90 transition-colors"
              >
                <ArrowRight size={14} />
                Analyze this as a deal
              </button>
            </div>
          )}
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-sm p-5 mx-4">
            <h4 className="text-[15px] font-semibold text-earth mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              Save Analysis
            </h4>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. Houston 3-bed rental"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-[13px] text-earth focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay mb-4"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && saveName.trim()) handleSave(); }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowSaveDialog(false); setSaveName(""); }}
                className="px-4 py-2 text-[13px] text-muted hover:text-earth transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!saveName.trim() || saving}
                className="px-4 py-2 bg-clay text-white rounded-lg text-[13px] font-medium hover:bg-clay/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary Row component
// ---------------------------------------------------------------------------

function SummaryRow({ label, value, bold, sub, highlight, warning, positive }: {
  label: string;
  value: string;
  bold?: boolean;
  sub?: string;
  highlight?: boolean;
  warning?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className={`text-[12px] ${bold ? "font-semibold text-earth" : "text-muted"}`}>{label}</span>
        {sub && <span className="text-[10px] text-muted/60 ml-1">({sub})</span>}
      </div>
      <span className={`text-[13px] font-data font-medium ${
        bold ? "text-earth text-[14px]" :
        highlight ? "text-clay" :
        warning ? "text-danger" :
        positive ? "text-success" :
        "text-earth"
      }`}>
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card for reverse calculator
// ---------------------------------------------------------------------------

function LocationCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="p-2.5 bg-warm/15 rounded-lg">
      <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
      <p className={`text-[14px] font-bold font-data ${positive === true ? "text-success" : positive === false ? "text-warning" : "text-earth"}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted mt-0.5 leading-snug">{sub}</p>}
    </div>
  );
}

function StatCard({ label, value, Icon }: { label: string; value: string; Icon: React.ComponentType<{ size: number }> }) {
  return (
    <div className="bg-warm/20 rounded-xl p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-clay/10 flex items-center justify-center">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
        <p className="text-[16px] font-bold text-earth font-data">{value}</p>
      </div>
    </div>
  );
}
