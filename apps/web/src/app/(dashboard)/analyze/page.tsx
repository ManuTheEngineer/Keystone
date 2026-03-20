"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
import { createProject, generateBudgetFromSpecs, seedInitialTasks, type Market as ProjMarket, type BuildPurpose, type PropertyType as ProjPropType } from "@/lib/services/project-service";
import {
  calculateAnalysis,
  getCostBreakdown,
  reverseCalculate,
  getBuildingSize,
  type AnalysisInput,
  type AnalysisResults,
  type CostBreakdownItem,
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
} from "@keystone/market-data";
import type { Market as MarketType, CurrencyConfig, LocationData } from "@keystone/market-data";
import {
  Globe, MapPin, Home, Ruler, TrendingUp, AlertTriangle, AlertCircle,
  Info, ChevronRight, ChevronLeft, Calculator, ArrowRight, Save, FileDown,
  Share2, RotateCcw, DollarSign, Building2, Bed, Bath, Layers, Zap,
  Droplets, Sun, Trees, Car, Fence, Waves, ShieldCheck, Plus, FolderOpen,
  X, Check, Target, CreditCard, Clock, Thermometer,
} from "lucide-react";

// ============================================================================
// Types & Constants
// ============================================================================

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
  commercialPct: number;
}

const INITIAL: InputState = {
  goal: "", market: "", city: "", zipCode: "", propertyType: "SFH",
  sizeCategory: "standard", customSize: 0, bedrooms: 3, bathrooms: 2,
  stories: 1, features: [], landOption: "", landPrice: 0,
  titreFoncierStatus: "", financingType: "", downPaymentPct: 20,
  downPaymentAmount: 0, loanRate: 7.5, loanTerm: 30, monthlyIncome: 0,
  existingDebts: 0, creditScoreRange: "", timelineMonths: 12,
  targetSalePrice: 0, monthlyRent: 0, commercialPct: 30,
};

const STEPS = [
  { id: "goal", label: "Goal", icon: Target },
  { id: "location", label: "Location", icon: MapPin },
  { id: "property", label: "Property", icon: Home },
  { id: "land", label: "Land", icon: Ruler },
  { id: "finance", label: "Finance", icon: CreditCard },
  { id: "timeline", label: "Timeline", icon: Clock },
];

const US_FEATURES = [
  { id: "garage-single", label: "Garage", Icon: Car },
  { id: "garage-double", label: "2-car garage", Icon: Car },
  { id: "porch-patio", label: "Porch / Patio", Icon: Trees },
  { id: "pool", label: "Pool", Icon: Waves },
  { id: "fence", label: "Fencing", Icon: Fence },
  { id: "solar", label: "Solar", Icon: Sun },
  { id: "outdoor-kitchen", label: "Outdoor kitchen", Icon: Zap },
  { id: "basement", label: "Basement", Icon: Layers },
  { id: "sprinkler", label: "Sprinkler", Icon: Droplets },
];

const WA_FEATURES = [
  { id: "garage-single", label: "Garage", Icon: Car },
  { id: "garage-double", label: "2-car garage", Icon: Car },
  { id: "porch-patio", label: "Veranda", Icon: Trees },
  { id: "pool", label: "Pool", Icon: Waves },
  { id: "fence", label: "Wall", Icon: Fence },
  { id: "solar", label: "Solar", Icon: Sun },
  { id: "guest-house", label: "Guest house", Icon: Home },
  { id: "water-tank", label: "Water tank", Icon: Droplets },
  { id: "generator-house", label: "Generator", Icon: Zap },
  { id: "security-post", label: "Security", Icon: ShieldCheck },
];

const EXCHANGE_RATES: Record<string, number> = { TOGO: 615, GHANA: 15.5, BENIN: 615 };

type ResultTab = "summary" | "breakdown" | "location" | "scenarios";

// ============================================================================
// Helpers
// ============================================================================

function getCurr(market: MarketType | ""): CurrencyConfig {
  if (!market) return { code: "USD", symbol: "$", locale: "en-US", decimals: 0, groupSeparator: ",", position: "prefix" as const };
  return getMarketData(market).currency;
}

function fmt(n: number, c: CurrencyConfig) { return formatCurrency(n, c); }
function fmtC(n: number, c: CurrencyConfig) { return formatCurrencyCompact(n, c); }

function scoreGradient(s: number) {
  if (s >= 80) return "from-emerald-500 to-emerald-600";
  if (s >= 65) return "from-emerald-400 to-emerald-500";
  if (s >= 50) return "from-amber-400 to-amber-500";
  if (s >= 35) return "from-orange-400 to-orange-500";
  return "from-red-500 to-red-600";
}
function scoreText(s: number) {
  if (s >= 80) return "Strong Deal";
  if (s >= 65) return "Good Deal";
  if (s >= 50) return "Fair";
  if (s >= 35) return "Caution";
  return "High Risk";
}

// ============================================================================
// Reusable UI
// ============================================================================

function Pill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${active ? "bg-earth text-white shadow-sm" : "text-muted hover:text-earth hover:bg-warm/40"}`}>
      {children}
    </button>
  );
}

function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-left transition-all ${selected ? "border-clay bg-clay/5 shadow-sm" : "border-transparent bg-warm/20 hover:bg-warm/40"}`}>
      <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${selected ? "border-clay bg-clay" : "border-muted/30"}`}>
        {selected && <Check size={10} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </button>
  );
}

function NumField({ value, onChange, label, prefix, suffix, tooltip, ...rest }: {
  value: number; onChange: (v: number) => void; label: string; prefix?: string; suffix?: string; tooltip?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[11px] font-medium text-earth">{label}</span>
        {tooltip && <LearnTooltip term={label} explanation={tooltip}><span className="text-muted/40 hover:text-muted cursor-help"><Info size={10} /></span></LearnTooltip>}
      </div>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-muted">{prefix}</span>}
        <input type="number" value={value || ""} onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={`w-full px-3 py-2 bg-white/60 border border-border/60 rounded-lg text-[13px] text-earth font-data focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay/40 ${prefix ? "pl-7" : ""} ${suffix ? "pr-10" : ""}`} {...rest} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted">{suffix}</span>}
      </div>
    </div>
  );
}

function Stepper({ value, onChange, min, max, label }: { value: number; onChange: (v: number) => void; min: number; max: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-muted uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-0.5">
        <button onClick={() => onChange(Math.max(min, value - 1))} className="w-7 h-7 rounded-lg bg-warm/40 hover:bg-warm text-earth flex items-center justify-center text-[14px] font-medium transition-colors">-</button>
        <span className="w-8 text-center text-[16px] font-data font-bold text-earth">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} className="w-7 h-7 rounded-lg bg-warm/40 hover:bg-warm text-earth flex items-center justify-center text-[14px] font-medium transition-colors">+</button>
      </div>
    </div>
  );
}

// ============================================================================
// Collapsible Card
// ============================================================================

function CollapsibleCard({ title, icon: Icon, defaultOpen = true, children }: {
  title: string; icon: React.ElementType; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-warm/10 transition-colors">
        <div className="w-8 h-8 rounded-xl bg-warm/40 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-clay" />
        </div>
        <h3 className="text-[14px] font-semibold text-earth flex-1" style={{ fontFamily: "var(--font-heading)" }}>{title}</h3>
        <ChevronRight size={14} className={`text-muted transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 pt-0">{children}</div>}
    </div>
  );
}

// ============================================================================
// Horizontal Bar Chart (replaces Donut)
// ============================================================================

function HorizontalBars({ items, currency }: { items: CostBreakdownItem[]; currency: CurrencyConfig }) {
  const total = items.reduce((s, i) => s + i.amount, 0);
  if (total === 0) return null;
  const maxPct = Math.max(...items.map((i) => i.amount / total));

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        const pct = item.amount / total;
        const barW = maxPct > 0 ? (pct / maxPct) * 100 : 0;
        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[12px] text-earth">{item.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-data text-muted tabular-nums">{item.percentage}%</span>
                <span className="text-[12px] font-data font-medium text-earth tabular-nums w-24 text-right">{fmt(item.amount, currency)}</span>
              </div>
            </div>
            <div className="h-2 bg-warm/30 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${barW}%`, backgroundColor: item.color }} />
            </div>
          </div>
        );
      })}
      <div className="flex justify-between pt-2 border-t border-border/40">
        <span className="text-[13px] font-semibold text-earth">Total</span>
        <span className="text-[13px] font-data font-bold text-earth">{fmt(total, currency)}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Score Ring (larger, 150px)
// ============================================================================

function ScoreRing({ score }: { score: number }) {
  const r = 56, stroke = 10, size = 150, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dashLen = circ * (score / 100);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-border/30" />
        <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dashLen} ${circ - dashLen}`}
          className={`transition-all duration-1000 ease-out ${score >= 65 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-500" : score >= 35 ? "stroke-orange-500" : "stroke-red-500"}`} />
      </svg>
      <div className="text-center z-10">
        <div className="text-[36px] font-bold font-data text-earth leading-none">{score}</div>
        <div className="text-[10px] font-semibold text-muted uppercase tracking-wider mt-1">{scoreText(score)}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function AnalyzePage() {
  const router = useRouter();
  const { setTopbar } = useTopbar();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<"analyze" | "reverse">("analyze");
  const [step, setStep] = useState(0);
  const [resultTab, setResultTab] = useState<ResultTab>("summary");
  const [input, setInput] = useState<InputState>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("goal") && p.get("market")) {
        return {
          ...INITIAL,
          goal: (p.get("goal") || "") as InputState["goal"],
          market: (p.get("market") || "") as MarketType | "",
          city: p.get("city") || "", zipCode: p.get("zip") || "",
          propertyType: p.get("type") || "SFH",
          sizeCategory: p.get("size") || "standard",
          bedrooms: Number(p.get("beds")) || 3, bathrooms: Number(p.get("baths")) || 2,
          stories: Number(p.get("stories")) || 1,
          features: p.get("feat") ? p.get("feat")!.split(",").filter(Boolean) : [],
          landOption: p.get("land") || "", financingType: p.get("fin") || "",
          downPaymentPct: Number(p.get("dp")) || 20, loanRate: Number(p.get("rate")) || 7.5,
          timelineMonths: Number(p.get("months")) || 12,
          monthlyRent: Number(p.get("rent")) || 0, targetSalePrice: Number(p.get("sale")) || 0,
          loanTerm: Number(p.get("term")) || 30, monthlyIncome: Number(p.get("income")) || 0,
          existingDebts: Number(p.get("debts")) || 0, titreFoncierStatus: p.get("titre") || "",
          commercialPct: Number(p.get("commpct")) || 30,
        };
      }
    }
    return { ...INITIAL, market: (profile?.market as MarketType) || "" };
  });
  const [reverseBudget, setReverseBudget] = useState(0);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => { setTopbar("Deal Analyzer", undefined, undefined); }, [setTopbar]);
  useEffect(() => {
    if (!user?.uid) return;
    getUserAnalyses(user.uid).then(setSavedAnalyses).catch(() => {});
  }, [user?.uid]);

  // ZIP auto-fill
  useEffect(() => {
    if (!input.zipCode || input.zipCode.length !== 5 || input.market !== "USA") return;
    const t = setTimeout(async () => {
      setZipLoading(true);
      try {
        const res = await fetch(`/api/location-data?q=${encodeURIComponent(input.zipCode)}&market=USA`);
        if (res.ok) {
          const j = await res.json();
          if (j.data?.city) setInput((p) => ({ ...p, city: `${j.data.city}${j.data.state ? `, ${j.data.state}` : ""}` }));
        }
      } catch {} finally { setZipLoading(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [input.zipCode, input.market]);

  // Derived
  const isUSA = input.market === "USA";
  const isWA = !!input.market && input.market !== "USA";
  const currency = getCurr(input.market);
  const sizeUnit = isUSA ? "sqft" : (input.market ? "sqm" : "sqft");
  const featureList = isUSA ? US_FEATURES : WA_FEATURES;

  const suggestions = useMemo(() => {
    if (!input.market || !input.city || input.city.length < 2) return [];
    return getLocationSuggestions(input.market).filter((n) => n.toLowerCase().includes(input.city.toLowerCase())).slice(0, 5);
  }, [input.market, input.city]);

  const results = useMemo<AnalysisResults | null>(() => {
    if (!input.goal || !input.market) return null;
    try { return calculateAnalysis({ ...input, market: input.market }); } catch { return null; }
  }, [input]);

  const breakdown = useMemo(() => results ? getCostBreakdown(results) : [], [results]);

  const reverseResult = useMemo(() => {
    if (mode !== "reverse" || !reverseBudget || !input.market) return null;
    return reverseCalculate(reverseBudget, input.market, input.city, input.goal);
  }, [mode, reverseBudget, input.market, input.city, input.goal]);

  const locationData = useMemo<LocationData | null>(() => {
    if (!input.market || !input.city || input.city.length < 2) return null;
    return getClosestLocation(input.city, input.market);
  }, [input.market, input.city]);

  const set = useCallback(<K extends keyof InputState>(k: K, v: InputState[K]) => {
    setInput((p) => {
      const n = { ...p, [k]: v };
      if (k === "market" && v !== p.market) { n.features = []; n.financingType = ""; n.titreFoncierStatus = ""; }
      return n;
    });
  }, []);

  const buildSize = useMemo(() => input.market ? getBuildingSize(input as any) : 0, [input]);

  // Sensitivity
  const scenarios = useMemo(() => {
    if (!results || !input.market) return [];
    const base = results.totalCost;
    const s: { label: string; cost: number; score: number; delta: number }[] = [];
    s.push({ label: "Cost overrun +15%", cost: base + Math.round(results.constructionCost * 0.15), score: Math.max(0, results.dealScore - 8), delta: Math.round(results.constructionCost * 0.15) });
    s.push({ label: "Under budget -10%", cost: base - Math.round(results.constructionCost * 0.10), score: Math.min(100, results.dealScore + 5), delta: -Math.round(results.constructionCost * 0.10) });
    if (input.financingType === "construction_loan" || input.financingType === "fha_203k") {
      try { const r = calculateAnalysis({ ...input, loanRate: input.loanRate + 2 } as any); s.push({ label: "Rate +2%", cost: r.totalCost, score: r.dealScore, delta: r.totalCost - base }); } catch {}
    }
    try { const r = calculateAnalysis({ ...input, timelineMonths: input.timelineMonths + 6 } as any); s.push({ label: "+6 months", cost: r.totalCost, score: r.dealScore, delta: r.totalCost - base }); } catch {}
    return s;
  }, [results, input]);

  // Cross market
  const crossMarket = useMemo(() => {
    if (!results || !input.market) return [];
    const toUSD = (a: number, m: string) => { const r = EXCHANGE_RATES[m]; return r ? Math.round(a / r) : a; };
    return (["USA", "TOGO", "GHANA", "BENIN"] as MarketType[]).map((m) => {
      try {
        const r = m === input.market ? results : calculateAnalysis({ ...input, market: m } as any);
        return { market: m, usd: m === "USA" ? r.totalCost : toUSD(r.totalCost, m), score: r.dealScore, current: m === input.market };
      } catch { return null; }
    }).filter(Boolean) as { market: string; usd: number; score: number; current: boolean }[];
  }, [results, input]);

  // Dual currency
  const dualUSD = useMemo(() => {
    if (!input.market || input.market === "USA" || !results) return null;
    const rate = EXCHANGE_RATES[input.market];
    return rate ? Math.round(results.totalCost / rate) : null;
  }, [input.market, results]);

  // Save
  const handleSave = useCallback(async () => {
    if (!user?.uid || !results || !saveName.trim()) return;
    setSaving(true);
    try {
      await saveAnalysis(user.uid, saveName.trim(), input as unknown as AnalysisInput, results);
      const updated = await getUserAnalyses(user.uid);
      setSavedAnalyses(updated);
      setShowSave(false); setSaveName("");
      showToast("Analysis saved", "success");
    } catch { showToast("Failed to save", "error"); }
    finally { setSaving(false); }
  }, [user?.uid, results, saveName, input, showToast]);

  const handleDelete = useCallback(async (id: string) => {
    if (!user?.uid) return;
    try { await deleteAnalysis(user.uid, id); setSavedAnalyses((p) => p.filter((a) => a.id !== id)); showToast("Deleted", "success"); }
    catch { showToast("Failed", "error"); }
  }, [user?.uid, showToast]);

  const handleLoad = useCallback((a: SavedAnalysis) => {
    setInput({
      goal: a.input.goal || "", market: (a.input.market as MarketType) || "", city: a.input.city || "",
      zipCode: a.input.zipCode || "", propertyType: a.input.propertyType || "SFH",
      sizeCategory: a.input.sizeCategory || "standard", customSize: a.input.customSize || 0,
      bedrooms: a.input.bedrooms || 3, bathrooms: a.input.bathrooms || 2, stories: a.input.stories || 1,
      features: a.input.features || [], landOption: a.input.landOption || "", landPrice: a.input.landPrice || 0,
      titreFoncierStatus: a.input.titreFoncierStatus || "", financingType: a.input.financingType || "",
      downPaymentPct: a.input.downPaymentPct || 20, downPaymentAmount: a.input.downPaymentAmount || 0,
      loanRate: a.input.loanRate || 7.5, loanTerm: a.input.loanTerm || 30,
      monthlyIncome: a.input.monthlyIncome || 0, existingDebts: a.input.existingDebts || 0,
      creditScoreRange: a.input.creditScoreRange || "", timelineMonths: a.input.timelineMonths || 12,
      targetSalePrice: a.input.targetSalePrice || 0, monthlyRent: a.input.monthlyRent || 0,
      commercialPct: a.input.commercialPct || 30,
    });
    setMode("analyze"); setShowSaved(false);
    showToast(`Loaded "${a.name}"`, "success");
  }, [showToast]);

  // Create project directly from analyzer
  const handleCreateProject = useCallback(async () => {
    if (!user?.uid || !results || !createName.trim() || !input.market) return;
    setCreating(true);
    try {
      const market = input.market as ProjMarket;
      const purposeMap: Record<string, BuildPurpose> = { occupy: "OCCUPY", rent: "RENT", sell: "SELL", "mixed-use": "RENT" };
      const purpose = purposeMap[input.goal] ?? "OCCUPY";
      const propType = (input.propertyType || "SFH") as ProjPropType;
      const totalBudget = results.totalCost;

      const projectId = await createProject({
        userId: user.uid, name: createName.trim(), market, purpose, propertyType: propType,
        sizeRange: input.sizeCategory, city: input.city.trim(), region: input.city.trim(),
        financingType: input.financingType, landCost: results.landCost,
        dealScore: results.dealScore, currentPhase: 0, completedPhases: 0,
        phaseName: "Phase 0: Define", progress: 0, status: "ACTIVE",
        totalBudget, totalSpent: 0, currency: currency.code,
        currentWeek: 0, totalWeeks: Math.round(input.timelineMonths * 4.33),
        openItems: 0, subPhase: "Getting started",
        details: `${propType} / ${market} / ${input.city.trim()}`,
        bedrooms: input.bedrooms, bathrooms: input.bathrooms, stories: input.stories,
        features: input.features.length > 0 ? input.features : null,
      });

      // Budget + tasks in parallel
      await Promise.allSettled([
        generateBudgetFromSpecs(user.uid, projectId, totalBudget, market, input.features),
        seedInitialTasks(user.uid, projectId, {
          market, purpose, propertyType: propType, city: input.city.trim(),
          financingType: input.financingType, totalBudget,
          bedrooms: input.bedrooms, bathrooms: input.bathrooms, features: input.features,
        }),
      ]);

      showToast("Project created", "success");
      router.push(`/project/${projectId}/overview`);
    } catch (err) {
      console.error("Failed to create project:", err);
      showToast("Failed to create project", "error");
      setCreating(false);
    }
  }, [user?.uid, results, createName, input, currency, router, showToast]);

  const hasResults = !!results && !!input.goal && !!input.market;

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="min-h-full pb-28">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 bg-warm/30 p-1 rounded-xl">
          <Pill active={mode === "analyze"} onClick={() => setMode("analyze")}>Analyze</Pill>
          <Pill active={mode === "reverse"} onClick={() => setMode("reverse")}>What Can I Afford?</Pill>
        </div>
        <div className="flex items-center gap-3">
          {savedAnalyses.length > 0 && (
            <button onClick={() => setShowSaved(!showSaved)} className="flex items-center gap-1.5 text-[12px] text-muted hover:text-earth transition-colors">
              <FolderOpen size={14} />
              Saved ({savedAnalyses.length})
            </button>
          )}
        </div>
      </div>

      {/* ── Saved analyses dropdown ── */}
      {showSaved && savedAnalyses.length > 0 && (
        <div className="mb-5 bg-surface border border-border rounded-xl overflow-hidden">
          {savedAnalyses.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-border/40 last:border-b-0 hover:bg-warm/20 transition-colors">
              <button onClick={() => handleLoad(a)} className="flex-1 text-left min-w-0">
                <p className="text-[12px] font-medium text-earth truncate">{a.name}</p>
                <p className="text-[10px] text-muted">{a.input?.market} / {a.input?.city || "N/A"} / Score: {a.results?.dealScore ?? "-"}</p>
              </button>
              <button onClick={() => handleDelete(a.id)} className="p-1 text-muted/40 hover:text-danger transition-colors"><X size={12} /></button>
            </div>
          ))}
        </div>
      )}

      {mode === "analyze" ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ════════════════════════════════════════════════════════════════
             LEFT: All inputs as collapsible cards (single scrollable form)
             ════════════════════════════════════════════════════════════════ */}
          <div className="lg:w-[440px] shrink-0 space-y-4">

            {/* Timeline pills row */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { m: 6, label: "6 mo" },
                { m: 9, label: "9 mo" },
                { m: 12, label: "12 mo" },
                { m: 18, label: "18 mo" },
                { m: 24, label: "24 mo" },
                { m: 36, label: "36+ mo" },
              ].map((t) => (
                <button key={t.m} onClick={() => set("timelineMonths", t.m)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${input.timelineMonths === t.m ? "bg-clay/10 text-clay border border-clay/30" : "text-muted hover:bg-warm/30 border border-transparent"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Card 1: Property ── */}
            <CollapsibleCard title="Property" icon={Home} defaultOpen={true}>
              <div className="space-y-4">
                {/* Goal */}
                <div>
                  <span className="text-[11px] font-medium text-earth mb-1.5 block">Goal</span>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { id: "occupy" as const, label: "Build to live in" },
                      { id: "rent" as const, label: "Build to rent" },
                      { id: "sell" as const, label: "Build to sell" },
                      { id: "mixed-use" as const, label: "Mixed use" },
                    ]).map((g) => (
                      <Choice key={g.id} selected={input.goal === g.id} onClick={() => set("goal", g.id)}>
                        <p className="text-[12px] font-medium text-earth">{g.label}</p>
                      </Choice>
                    ))}
                  </div>
                  {(input.goal === "rent" || input.goal === "mixed-use") && (
                    <div className="mt-2">
                      <NumField label="Expected monthly rent" value={input.monthlyRent} onChange={(v) => set("monthlyRent", v)} prefix={currency.symbol} min={0} />
                    </div>
                  )}
                  {(input.goal === "sell" || input.goal === "mixed-use") && (
                    <div className="mt-2">
                      <NumField label="Target sale price" value={input.targetSalePrice} onChange={(v) => set("targetSalePrice", v)} prefix={currency.symbol} min={0} />
                    </div>
                  )}
                  {input.goal === "mixed-use" && (
                    <div className="mt-2">
                      <NumField label="Commercial %" value={input.commercialPct} onChange={(v) => set("commercialPct", Math.max(0, Math.min(80, v)))} suffix="%" min={0} max={80} tooltip="Percentage of building used for commercial" />
                    </div>
                  )}
                </div>

                {/* Market */}
                <div>
                  <span className="text-[11px] font-medium text-earth mb-1.5 block">Market</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["USA", "TOGO", "GHANA", "BENIN"] as MarketType[]).map((m) => (
                      <button key={m} onClick={() => set("market", m)}
                        className={`py-2.5 rounded-xl text-center transition-all text-[11px] font-medium ${input.market === m ? "bg-clay/10 text-clay border border-clay/30" : "bg-warm/20 text-muted hover:bg-warm/40 border border-transparent"}`}>
                        {m === "USA" ? "USA" : m.charAt(0) + m.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                {input.market && (
                  <div>
                    <div className="relative">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[11px] font-medium text-earth">City / Region</span>
                      </div>
                      <div className="relative">
                        <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40" />
                        <input type="text" value={input.city}
                          onChange={(e) => { set("city", e.target.value); setShowSuggestions(true); }}
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          placeholder={isUSA ? "e.g. Houston, TX" : "e.g. Lome"}
                          className="w-full pl-9 pr-3 py-2 bg-white/60 border border-border/60 rounded-lg text-[13px] text-earth focus:outline-none focus:ring-2 focus:ring-clay/20" />
                      </div>
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-30 left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                          {suggestions.map((city) => (
                            <button key={city} onMouseDown={(e) => e.preventDefault()}
                              onClick={() => { set("city", city); setShowSuggestions(false); }}
                              className="w-full text-left px-3 py-2 text-[12px] text-earth hover:bg-warm/30 border-b border-border/20 last:border-b-0">
                              {city}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {isUSA && (
                      <div className="mt-2">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-[11px] font-medium text-earth">ZIP code</span>
                          {zipLoading && <span className="text-[9px] text-clay animate-pulse">Looking up...</span>}
                        </div>
                        <input type="text" value={input.zipCode} inputMode="numeric" maxLength={5}
                          onChange={(e) => set("zipCode", e.target.value.replace(/\D/g, "").slice(0, 5))}
                          placeholder="e.g. 77001"
                          className="w-full px-3 py-2 bg-white/60 border border-border/60 rounded-lg text-[13px] text-earth font-data focus:outline-none focus:ring-2 focus:ring-clay/20" />
                        {input.zipCode.length === 5 && input.city && !zipLoading && (
                          <p className="text-[10px] text-success mt-1 flex items-center gap-1"><Check size={10} /> {input.city}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Property Type */}
                <div>
                  <span className="text-[11px] font-medium text-earth mb-1.5 block">Type</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["SFH", "DUPLEX", "TRIPLEX", "FOURPLEX"].map((t) => (
                      <button key={t} onClick={() => set("propertyType", t)}
                        className={`py-2 rounded-lg text-[11px] font-medium text-center transition-all ${input.propertyType === t ? "bg-clay/10 text-clay border border-clay/30" : "bg-warm/20 text-muted hover:bg-warm/40 border border-transparent"}`}>
                        {t === "SFH" ? "Single" : t.charAt(0) + t.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <span className="text-[11px] font-medium text-earth mb-1.5 block">Size</span>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { id: "compact", label: isUSA ? "1,200" : "80" },
                      { id: "standard", label: isUSA ? "1,800" : "130" },
                      { id: "large", label: isUSA ? "2,800" : "200" },
                      { id: "estate", label: isUSA ? "4,000" : "300" },
                      { id: "custom", label: "Custom" },
                    ].map((s) => (
                      <button key={s.id} onClick={() => set("sizeCategory", s.id)}
                        className={`px-1.5 py-2 rounded-lg text-[10px] font-medium text-center transition-all ${input.sizeCategory === s.id ? "bg-clay/10 text-clay border border-clay/30" : "bg-warm/20 text-muted hover:bg-warm/40 border border-transparent"}`}>
                        {s.label}{s.id !== "custom" ? ` ${sizeUnit}` : ""}
                      </button>
                    ))}
                  </div>
                  {input.sizeCategory === "custom" && (
                    <div className="mt-2">
                      <NumField label={`Custom size (${sizeUnit})`} value={input.customSize} onChange={(v) => set("customSize", v)} suffix={sizeUnit} min={100} max={50000} />
                    </div>
                  )}
                </div>

                {/* Beds / Baths / Stories */}
                <div className="flex justify-around pt-1">
                  <Stepper value={input.bedrooms} onChange={(v) => set("bedrooms", v)} min={1} max={8} label="Beds" />
                  <Stepper value={input.bathrooms} onChange={(v) => set("bathrooms", v)} min={1} max={6} label="Baths" />
                  <Stepper value={input.stories} onChange={(v) => set("stories", v)} min={1} max={3} label="Stories" />
                </div>
              </div>
            </CollapsibleCard>

            {/* ── Card 2: Land & Features ── */}
            <CollapsibleCard title="Land & Features" icon={Ruler} defaultOpen={true}>
              <div className="space-y-4">
                {/* Land option */}
                <div>
                  <span className="text-[11px] font-medium text-earth mb-1.5 block">Land situation</span>
                  <div className="space-y-1.5">
                    {[
                      { id: "already-own", label: "Already own land", desc: "No land cost" },
                      { id: "inherited", label: "Inherited / Family", desc: "No land cost" },
                      { id: "buying", label: "Buying (known price)", desc: "Enter price" },
                      { id: "estimate", label: "Estimate for me", desc: "Based on area" },
                    ].map((o) => (
                      <Choice key={o.id} selected={input.landOption === o.id} onClick={() => set("landOption", o.id)}>
                        <p className="text-[12px] font-medium text-earth">{o.label}</p>
                        <p className="text-[10px] text-muted">{o.desc}</p>
                      </Choice>
                    ))}
                  </div>
                  {input.landOption === "buying" && (
                    <div className="mt-2">
                      <NumField label="Land price" value={input.landPrice} onChange={(v) => set("landPrice", Math.max(0, v))} prefix={currency.symbol} min={0} />
                    </div>
                  )}
                  {isWA && (
                    <div className="mt-2">
                      <span className="text-[11px] font-medium text-earth mb-1 block">Land title status</span>
                      <select value={input.titreFoncierStatus} onChange={(e) => set("titreFoncierStatus", e.target.value)}
                        className="w-full px-3 py-2 bg-white/60 border border-border/60 rounded-lg text-[12px] text-earth focus:outline-none focus:ring-2 focus:ring-clay/20">
                        <option value="">Select status</option>
                        <option value="secured">Titre foncier secured</option>
                        <option value="in-progress">In progress</option>
                        <option value="not-started">Not started</option>
                        <option value="customary">Customary / communal</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div>
                  <span className="text-[11px] font-medium text-earth mb-1.5 block">Features</span>
                  <div className="flex flex-wrap gap-1.5">
                    {featureList.map((f) => {
                      const on = input.features.includes(f.id);
                      return (
                        <button key={f.id} onClick={() => set("features", on ? input.features.filter((x) => x !== f.id) : [...input.features, f.id])}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-medium transition-all ${on ? "bg-clay/10 text-clay border border-clay/30" : "bg-warm/15 text-muted hover:bg-warm/30 border border-transparent"}`}>
                          <f.Icon size={10} /> {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CollapsibleCard>

            {/* ── Card 3: Financing ── */}
            <CollapsibleCard title="Financing" icon={CreditCard} defaultOpen={true}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {(isUSA
                    ? [{ id: "cash", label: "Cash" }, { id: "construction_loan", label: "Construction loan" }, { id: "fha_203k", label: "FHA 203(k)" }]
                    : [{ id: "cash", label: "Cash" }, { id: "phased_cash", label: "Phased" }, { id: "diaspora", label: "Diaspora" }, { id: "tontine", label: "Tontine" }]
                  ).map((f) => (
                    <Choice key={f.id} selected={input.financingType === f.id} onClick={() => set("financingType", f.id)}>
                      <p className="text-[12px] font-medium text-earth">{f.label}</p>
                    </Choice>
                  ))}
                </div>
                {input.financingType === "phased_cash" && <p className="text-[10px] text-muted leading-relaxed">Build in stages as cash becomes available. Timeline is typically 2-3x longer.</p>}
                {input.financingType === "diaspora" && <p className="text-[10px] text-muted leading-relaxed">Fund from abroad via remittances. Requires a trusted on-site representative.</p>}
                {input.financingType === "tontine" && <p className="text-[10px] text-muted leading-relaxed">Pool savings with a group. Members take turns receiving the lump sum.</p>}
                {(input.financingType === "construction_loan" || input.financingType === "fha_203k") && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <NumField label="Down payment" value={input.downPaymentPct} onChange={(v) => set("downPaymentPct", Math.max(0, Math.min(100, v)))} suffix="%" min={0} max={100} tooltip="Percentage you pay upfront" />
                      <NumField label="Interest rate" value={input.loanRate} onChange={(v) => set("loanRate", Math.max(0, Math.min(25, v)))} suffix="%" step={0.1} min={0} max={25} tooltip="Annual rate. US avg 7-8%" />
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-earth mb-1 block">Loan term</span>
                      <div className="flex gap-1.5">
                        {[15, 20, 25, 30].map((y) => (
                          <button key={y} onClick={() => set("loanTerm", y)}
                            className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${input.loanTerm === y ? "bg-clay/10 text-clay border border-clay/30" : "bg-warm/20 text-muted border border-transparent"}`}>
                            {y}yr
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <NumField label="Monthly income" value={input.monthlyIncome} onChange={(v) => set("monthlyIncome", v)} prefix={currency.symbol} min={0} tooltip="Gross monthly income for DTI calculation" />
                      <NumField label="Existing debts" value={input.existingDebts} onChange={(v) => set("existingDebts", v)} prefix={currency.symbol} min={0} tooltip="Total monthly debt payments" />
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          </div>

          {/* ════════════════════════════════════════════════════════════════
             RIGHT: Sticky results panel (single scroll, no tabs)
             ════════════════════════════════════════════════════════════════ */}
          <div className="flex-1 min-w-0">
            {hasResults ? (
              <div className="lg:sticky lg:top-4 space-y-5">

                {/* ── Score Ring hero ── */}
                <div className="bg-surface border border-border rounded-2xl p-6">
                  <div className="flex flex-col items-center mb-5">
                    <ScoreRing score={results!.dealScore} />
                    <p className="text-[12px] text-muted mt-3 text-center max-w-[320px] leading-relaxed">{results!.dealScoreSummary}</p>
                  </div>

                  {/* ── Key metrics grid (4 cards) ── */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-warm/20 rounded-xl px-4 py-3">
                      <p className="text-[9px] text-muted uppercase tracking-wider mb-0.5">Total Cost</p>
                      <p className="text-[18px] font-bold font-data text-earth leading-tight">{fmtC(results!.totalCost, currency)}</p>
                      {dualUSD && <p className="text-[10px] text-muted font-data mt-0.5">~${dualUSD.toLocaleString()} USD</p>}
                    </div>
                    <div className="bg-warm/20 rounded-xl px-4 py-3">
                      <p className="text-[9px] text-muted uppercase tracking-wider mb-0.5">Per {sizeUnit}</p>
                      <p className="text-[18px] font-bold font-data text-earth leading-tight">{fmt(results!.costPerUnit, currency)}</p>
                      <p className="text-[10px] text-muted font-data mt-0.5">{buildSize.toLocaleString()} {sizeUnit}</p>
                    </div>
                    {results!.monthlyCost > 0 && (
                      <div className="bg-warm/20 rounded-xl px-4 py-3">
                        <p className="text-[9px] text-muted uppercase tracking-wider mb-0.5">Monthly</p>
                        <p className="text-[18px] font-bold font-data text-clay leading-tight">{fmt(results!.monthlyCost, currency)}</p>
                      </div>
                    )}
                    {results!.roi !== 0 && (
                      <div className="bg-warm/20 rounded-xl px-4 py-3">
                        <p className="text-[9px] text-muted uppercase tracking-wider mb-0.5">{input.goal === "rent" ? "Yield" : "ROI"}</p>
                        <p className={`text-[18px] font-bold font-data leading-tight ${results!.roi > 0 ? "text-success" : "text-danger"}`}>{results!.roi}%</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Cost Breakdown (horizontal bars) ── */}
                {breakdown.length > 0 && (
                  <div className="bg-surface border border-border rounded-2xl p-5">
                    <h4 className="text-[13px] font-semibold text-earth mb-4" style={{ fontFamily: "var(--font-heading)" }}>Cost Breakdown</h4>
                    <HorizontalBars items={breakdown} currency={currency} />
                  </div>
                )}

                {/* ── Cost summary lines ── */}
                <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                  <h4 className="text-[13px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>Summary</h4>
                  <div className="space-y-1.5">
                    {[
                      { l: "Construction", v: results!.constructionCost },
                      { l: "Land", v: results!.landCost },
                      { l: "Soft costs", v: results!.softCosts },
                      { l: "Contingency", v: results!.contingency },
                      ...(results!.financingCosts > 0 ? [{ l: "Financing", v: results!.financingCosts }] : []),
                    ].map((r) => (
                      <div key={r.l} className="flex justify-between text-[12px]">
                        <span className="text-muted">{r.l}</span>
                        <span className="font-data text-earth">{fmt(r.v, currency)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-[13px] font-semibold pt-1.5 border-t border-border/60">
                      <span className="text-earth">Total</span>
                      <span className="font-data text-earth">{fmt(results!.totalCost, currency)}</span>
                    </div>
                  </div>

                  {/* DTI / LTV */}
                  {(results!.dtiRatio !== null || results!.ltvRatio > 0) && (
                    <div className="flex gap-3">
                      {results!.dtiRatio !== null && (
                        <div className={`flex-1 px-3 py-2 rounded-lg ${results!.dtiRatio > 43 ? "bg-danger/5 border border-danger/20" : "bg-warm/20"}`}>
                          <p className="text-[9px] text-muted uppercase">DTI Ratio</p>
                          <p className={`text-[14px] font-bold font-data ${results!.dtiRatio > 43 ? "text-danger" : "text-earth"}`}>{results!.dtiRatio}%</p>
                        </div>
                      )}
                      <div className="flex-1 px-3 py-2 rounded-lg bg-warm/20">
                        <p className="text-[9px] text-muted uppercase">LTV Ratio</p>
                        <p className="text-[14px] font-bold font-data text-earth">{results!.ltvRatio}%</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Risk flags ── */}
                {results!.riskFlags.length > 0 && (
                  <div className="bg-surface border border-border rounded-2xl p-5 space-y-2.5">
                    <h4 className="text-[13px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>Risk Flags</h4>
                    {results!.riskFlags.map((f, i) => (
                      <div key={i} className={`flex gap-2.5 p-3 rounded-xl text-[11px] ${f.level === "critical" ? "bg-danger/5 border border-danger/20" : f.level === "warning" ? "bg-warning/5 border border-warning/20" : "bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800"}`}>
                        {f.level === "critical" ? <AlertCircle size={14} className="text-danger shrink-0 mt-0.5" /> : f.level === "warning" ? <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" /> : <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />}
                        <div><p className="font-medium text-earth">{f.title}</p><p className="text-muted mt-0.5 leading-relaxed">{f.detail}</p></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Location Intelligence ── */}
                {locationData && (
                  <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                    <h4 className="text-[13px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>Location Intelligence</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-warm/15 rounded-xl">
                        <p className="text-[9px] text-muted uppercase tracking-wider">Cost Index</p>
                        <p className={`text-[16px] font-bold font-data ${locationData.costIndex < 1 ? "text-success" : locationData.costIndex > 1.1 ? "text-warning" : "text-earth"}`}>{locationData.costIndex.toFixed(2)}x</p>
                        <p className="text-[9px] text-muted">{getCostComparisonText(locationData.costIndex)}</p>
                      </div>
                      <div className="p-3 bg-warm/15 rounded-xl">
                        <p className="text-[9px] text-muted uppercase tracking-wider">Climate</p>
                        <p className="text-[13px] font-semibold text-earth">{getClimateLabel(locationData.climate)}</p>
                        <p className="text-[9px] text-muted">Build: {formatMonthList(locationData.buildingSeasonMonths)}</p>
                      </div>
                      <div className="p-3 bg-warm/15 rounded-xl">
                        <p className="text-[9px] text-muted uppercase tracking-wider">Property Tax</p>
                        <p className="text-[16px] font-bold font-data text-earth">{locationData.propertyTaxRate}%</p>
                      </div>
                      <div className="p-3 bg-warm/15 rounded-xl">
                        <p className="text-[9px] text-muted uppercase tracking-wider">Permits</p>
                        <p className="text-[14px] font-bold font-data text-earth">{fmt(locationData.permitCostEstimate, currency)}</p>
                      </div>
                    </div>
                    {locationData.localNotes && <p className="text-[11px] text-muted italic leading-relaxed">{locationData.localNotes}</p>}

                    {/* Cross market */}
                    {crossMarket.length > 1 && (
                      <div>
                        <p className="text-[11px] font-semibold text-earth uppercase tracking-wider mb-2">Cross-Market (USD)</p>
                        <div className="space-y-1">
                          {crossMarket.map((c) => (
                            <div key={c.market} className={`flex items-center justify-between px-3 py-2 rounded-lg ${c.current ? "bg-clay/8 border border-clay/15" : "bg-warm/10"}`}>
                              <span className={`text-[12px] ${c.current ? "font-semibold text-earth" : "text-muted"}`}>{c.market} {c.current && "(you)"}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-[12px] font-data font-medium text-earth">${c.usd.toLocaleString()}</span>
                                <span className={`text-[10px] font-data font-semibold w-6 text-right ${c.score >= 65 ? "text-success" : c.score >= 50 ? "text-warning" : "text-danger"}`}>{c.score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Sensitivity table ── */}
                {scenarios.length > 0 && (
                  <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
                    <h4 className="text-[13px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>Sensitivity</h4>
                    <p className="text-[11px] text-muted">How your deal changes under different conditions</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-3 py-2 bg-warm/20 rounded-lg">
                        <span className="text-[12px] font-medium text-earth">Baseline</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] font-data font-medium text-earth">{fmtC(results!.totalCost, currency)}</span>
                          <span className={`text-[11px] font-data font-semibold ${results!.dealScore >= 65 ? "text-success" : "text-warning"}`}>{results!.dealScore}</span>
                        </div>
                      </div>
                      {scenarios.map((s, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/40">
                          <span className="text-[11px] text-muted">{s.label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-data text-earth">{fmtC(s.cost, currency)}</span>
                            <span className={`text-[10px] font-data ${s.delta > 0 ? "text-danger" : "text-success"}`}>{s.delta > 0 ? "+" : ""}{fmtC(s.delta, currency)}</span>
                            <span className={`text-[10px] font-data font-semibold w-5 text-right ${s.score >= 65 ? "text-success" : s.score >= 50 ? "text-warning" : "text-danger"}`}>{s.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <p className="text-[9px] text-muted/50 leading-relaxed px-1">
                  Estimates are for educational guidance only. Actual costs vary by location, materials, and market conditions. Consult licensed professionals before committing.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center lg:sticky lg:top-4">
                <div className="w-16 h-16 rounded-2xl bg-warm/40 flex items-center justify-center mb-4">
                  <Calculator size={28} className="text-clay" />
                </div>
                <h3 className="text-[16px] font-semibold text-earth mb-1" style={{ fontFamily: "var(--font-heading)" }}>Start your analysis</h3>
                <p className="text-[12px] text-muted max-w-[260px]">Select a goal and market to begin. Results update live as you fill in details.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ════════════════════════════════════════════════════════════════
           REVERSE CALCULATOR -- full-width centered layout
           ════════════════════════════════════════════════════════════════ */
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center mb-2">
            <h2 className="text-[22px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>What Can I Afford?</h2>
            <p className="text-[13px] text-muted mt-1">Enter your total budget and we will estimate the largest home you can build.</p>
          </div>

          {/* Market selector as flag-style cards */}
          <div className="grid grid-cols-4 gap-3">
            {(["USA", "TOGO", "GHANA", "BENIN"] as MarketType[]).map((m) => {
              const labels: Record<string, { name: string; flag: string }> = {
                USA: { name: "United States", flag: "US" },
                TOGO: { name: "Togo", flag: "TG" },
                GHANA: { name: "Ghana", flag: "GH" },
                BENIN: { name: "Benin", flag: "BJ" },
              };
              const info = labels[m];
              return (
                <button key={m} onClick={() => set("market", m)}
                  className={`flex flex-col items-center gap-2 py-5 rounded-2xl border-2 transition-all ${input.market === m ? "border-clay bg-clay/5 shadow-sm" : "border-transparent bg-warm/20 hover:bg-warm/40"}`}>
                  <div className="w-10 h-10 rounded-full bg-warm/40 flex items-center justify-center">
                    <Globe size={18} className={input.market === m ? "text-clay" : "text-muted"} />
                  </div>
                  <span className={`text-[13px] font-medium ${input.market === m ? "text-earth" : "text-muted"}`}>{info.name}</span>
                </button>
              );
            })}
          </div>

          {input.market && (
            <div className="space-y-4">
              {/* City */}
              <div>
                <div className="flex items-center gap-1 mb-1"><span className="text-[11px] font-medium text-earth">City / Region</span></div>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40" />
                  <input type="text" value={input.city} onChange={(e) => set("city", e.target.value)} placeholder={isUSA ? "e.g. Houston, TX" : "e.g. Lome"}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/60 border border-border/60 rounded-lg text-[13px] text-earth focus:outline-none focus:ring-2 focus:ring-clay/20" />
                </div>
              </div>

              {/* Budget -- large, prominent number */}
              <div className="bg-surface border border-border rounded-2xl p-6 text-center">
                <p className="text-[11px] text-muted uppercase tracking-wider mb-2">Your total budget</p>
                <div className="relative max-w-xs mx-auto">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-muted font-data">{currency.symbol}</span>
                  <input type="number" value={reverseBudget || ""} onChange={(e) => setReverseBudget(Number(e.target.value) || 0)}
                    placeholder="0"
                    min={0}
                    className="w-full pl-10 pr-4 py-4 bg-warm/10 border border-border/40 rounded-xl text-[28px] font-bold font-data text-earth text-center focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay/40" />
                </div>
                <p className="text-[10px] text-muted mt-2">Includes land, construction, permits, and contingency</p>
              </div>
            </div>
          )}

          {/* Budget too low */}
          {reverseResult && reverseBudget > 0 && reverseResult.maxSize <= 0 && (
            <div className="bg-surface border border-danger/30 rounded-2xl p-5 flex items-start gap-3">
              <AlertTriangle size={18} className="text-danger shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-earth">Budget too low</p>
                <p className="text-[11px] text-muted mt-1">Minimum for this market: <span className="font-data font-semibold">{currency.symbol}{reverseResult.minBudget.toLocaleString()}</span></p>
              </div>
            </div>
          )}

          {/* Results as "house card" */}
          {reverseResult && reverseBudget > 0 && reverseResult.maxSize > 0 && (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              {/* Card header with visual gradient */}
              <div className="bg-gradient-to-br from-warm to-warm/40 px-6 py-8 text-center">
                <p className="text-[10px] text-clay uppercase tracking-widest font-semibold mb-2">You can build</p>
                <p className="text-[32px] font-bold font-data text-earth leading-none">{reverseResult.maxSize.toLocaleString()} <span className="text-[16px] font-medium text-muted">{sizeUnit}</span></p>
              </div>
              {/* Property listing stats */}
              <div className="grid grid-cols-4 border-t border-border/40">
                {[
                  { label: "Beds", value: String(reverseResult.bedrooms), Icon: Bed },
                  { label: "Baths", value: String(reverseResult.bathrooms), Icon: Bath },
                  { label: "Stories", value: String(reverseResult.stories), Icon: Layers },
                  { label: "Size", value: `${reverseResult.maxSize.toLocaleString()}`, Icon: Ruler },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1.5 py-4 border-r border-border/20 last:border-r-0">
                    <s.Icon size={16} className="text-clay" />
                    <span className="text-[16px] font-bold font-data text-earth">{s.value}</span>
                    <span className="text-[9px] text-muted uppercase tracking-wider">{s.label}</span>
                  </div>
                ))}
              </div>
              {/* Description and CTA */}
              <div className="px-6 py-5 border-t border-border/40">
                <p className="text-[12px] text-earth leading-relaxed mb-4">{reverseResult.description}</p>
                <button onClick={() => {
                  setInput((p) => ({ ...p, bedrooms: reverseResult.bedrooms, bathrooms: reverseResult.bathrooms, stories: reverseResult.stories, sizeCategory: "custom", customSize: reverseResult.maxSize }));
                  setMode("analyze");
                }} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-earth text-white rounded-xl text-[13px] font-medium hover:bg-earth/90 transition-colors">
                  <ArrowRight size={15} /> Analyze this as a deal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
         FLOATING ACTION BAR
         ══════════════════════════════════════════════════════════════════ */}
      {hasResults && mode === "analyze" && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-3 bg-earth/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10">
          <button onClick={() => setShowSave(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium text-white/90 hover:bg-white/10 transition-colors">
            <Save size={14} /> Save
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium bg-white text-earth hover:bg-white/90 transition-colors">
            <Plus size={14} /> Create Project
          </button>
          <button onClick={() => {
            if (!results) return;
            exportAnalysisPDF({
              name: `${input.city || input.market} ${input.propertyType}`,
              input: { goal: input.goal, market: input.market, city: input.city, propertyType: input.propertyType, sizeCategory: input.sizeCategory, bedrooms: input.bedrooms, bathrooms: input.bathrooms, stories: input.stories, features: input.features, landOption: input.landOption, financingType: input.financingType, timelineMonths: input.timelineMonths },
              results: { dealScore: results.dealScore, dealScoreSummary: results.dealScoreSummary, totalCost: results.totalCost, constructionCost: results.constructionCost, landCost: results.landCost, softCosts: results.softCosts, financingCosts: results.financingCosts, contingency: results.contingency, monthlyCost: results.monthlyCost, roi: results.roi, dtiRatio: results.dtiRatio, ltvRatio: results.ltvRatio, costPerUnit: results.costPerUnit, riskFlags: results.riskFlags },
              currency: { code: currency.code, symbol: currency.symbol }, sizeUnit, buildSize,
            });
          }} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium text-white/90 hover:bg-white/10 transition-colors">
            <FileDown size={14} /> PDF
          </button>
          <button onClick={() => {
            const params = new URLSearchParams({ goal: input.goal, market: input.market, city: input.city, type: input.propertyType, size: input.sizeCategory, beds: String(input.bedrooms), baths: String(input.bathrooms), stories: String(input.stories), land: input.landOption, fin: input.financingType, dp: String(input.downPaymentPct), rate: String(input.loanRate), months: String(input.timelineMonths) });
            if (input.features.length > 0) params.set("feat", input.features.join(","));
            if (input.monthlyRent) params.set("rent", String(input.monthlyRent));
            if (input.targetSalePrice) params.set("sale", String(input.targetSalePrice));
            if (input.zipCode) params.set("zip", input.zipCode);
            navigator.clipboard.writeText(`${window.location.origin}/analyze?${params.toString()}`).then(() => showToast("Link copied", "success")).catch(() => showToast("Could not copy", "error"));
          }} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium text-white/90 hover:bg-white/10 transition-colors">
            <Share2 size={14} /> Share
          </button>
        </div>
      )}

      {/* Save dialog */}
      {showSave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowSave(false); setSaveName(""); }}>
          <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-sm p-5 mx-4" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-[15px] font-semibold text-earth mb-3" style={{ fontFamily: "var(--font-heading)" }}>Save Analysis</h4>
            <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="e.g. Houston 3-bed rental" autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && saveName.trim()) handleSave(); }}
              className="w-full px-3 py-2 bg-white/60 border border-border/60 rounded-lg text-[13px] text-earth focus:outline-none focus:ring-2 focus:ring-clay/20 mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowSave(false); setSaveName(""); }} className="px-4 py-2 text-[12px] text-muted hover:text-earth transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={!saveName.trim() || saving}
                className="px-4 py-2 bg-clay text-white rounded-lg text-[12px] font-medium hover:bg-clay/90 disabled:opacity-50 transition-colors">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowCreate(false); setCreateName(""); }}>
          <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-sm p-5 mx-4" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-[15px] font-semibold text-earth mb-1" style={{ fontFamily: "var(--font-heading)" }}>Create Project</h4>
            <p className="text-[11px] text-muted mb-3">Your analysis data will be used to set up the project with budget, tasks, and financing already configured.</p>
            <input type="text" value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Name your project (e.g. Robinson Residence)" autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && createName.trim()) handleCreateProject(); }}
              className="w-full px-3 py-2.5 bg-white/60 border border-border/60 rounded-lg text-[13px] text-earth focus:outline-none focus:ring-2 focus:ring-clay/20 mb-4" />
            {results && (
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-warm/20 rounded-lg py-2">
                  <p className="text-[9px] text-muted uppercase">Score</p>
                  <p className={`text-[14px] font-bold font-data ${results.dealScore >= 65 ? "text-success" : "text-warning"}`}>{results.dealScore}</p>
                </div>
                <div className="bg-warm/20 rounded-lg py-2">
                  <p className="text-[9px] text-muted uppercase">Budget</p>
                  <p className="text-[14px] font-bold font-data text-earth">{fmtC(results.totalCost, currency)}</p>
                </div>
                <div className="bg-warm/20 rounded-lg py-2">
                  <p className="text-[9px] text-muted uppercase">Size</p>
                  <p className="text-[14px] font-bold font-data text-earth">{buildSize.toLocaleString()}</p>
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowCreate(false); setCreateName(""); }} className="px-4 py-2 text-[12px] text-muted hover:text-earth transition-colors">Cancel</button>
              <button onClick={handleCreateProject} disabled={!createName.trim() || creating}
                className="px-4 py-2.5 bg-earth text-white rounded-lg text-[12px] font-medium hover:bg-earth/90 disabled:opacity-50 transition-colors">
                {creating ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
