"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useTopbar } from "../layout";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  X,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Clock,
  FileText,
  ArrowRight,
  Target,
  BarChart3,
  MapPin,
  Ruler,
  Stamp,
  Users,
  Hammer,
  ShieldCheck,
  KeyRound,
  ChevronDown,
} from "lucide-react";
import {
  getMarketData,
  PHASE_ORDER,
  PHASE_NAMES,
} from "@keystone/market-data";
import type { ProjectPhase, EducationModule, PhaseDefinition, CostBenchmark } from "@keystone/market-data";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "keystone-learn-progress";

const PHASE_ICONS: Record<ProjectPhase, typeof Target> = {
  DEFINE: Target,
  FINANCE: BarChart3,
  LAND: MapPin,
  DESIGN: Ruler,
  APPROVE: Stamp,
  ASSEMBLE: Users,
  BUILD: Hammer,
  VERIFY: ShieldCheck,
  OPERATE: KeyRound,
};

const PHASE_DESCRIPTIONS: Record<ProjectPhase, string> = {
  DEFINE: "Set goals and research",
  FINANCE: "Secure funding",
  LAND: "Find and acquire property",
  DESIGN: "Create construction plans",
  APPROVE: "Obtain permits",
  ASSEMBLE: "Hire your team",
  BUILD: "Physical construction",
  VERIFY: "Final inspections",
  OPERATE: "Move in or manage",
};

const PHASE_COST_PCT: Record<ProjectPhase, string> = {
  DEFINE: "0 - 1%",
  FINANCE: "1 - 3%",
  LAND: "15 - 30%",
  DESIGN: "3 - 8%",
  APPROVE: "1 - 3%",
  ASSEMBLE: "1 - 2%",
  BUILD: "50 - 70%",
  VERIFY: "1 - 2%",
  OPERATE: "2 - 5%",
};

// ─── LocalStorage helpers ─────────────────────────────────────────────────────

function getReadPhases(): Set<ProjectPhase> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored) as ProjectPhase[]);
  } catch {
    // ignore
  }
  return new Set();
}

function saveReadPhases(set: Set<ProjectPhase>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function estimateReadingTime(module: EducationModule): number {
  let words = module.content.split(/\s+/).length;
  words += module.summary.split(/\s+/).length;
  for (const d of module.keyDecisions) words += d.split(/\s+/).length;
  for (const m of module.commonMistakes) words += m.split(/\s+/).length;
  for (const t of module.proTips) words += t.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function splitIntoParagraphs(content: string): string[] {
  return content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

// ─── SVG Phase Infographics ───────────────────────────────────────────────────

function PhaseInfographic({ phase }: { phase: ProjectPhase }) {
  const colors = {
    earth: "#2C1810",
    clay: "#8B4513",
    sand: "#D4A574",
    warm: "#F5E6D3",
    cream: "#FDF8F0",
  };

  switch (phase) {
    case "DEFINE":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-auto" aria-label="Define phase: planning and goal setting">
          <rect x="40" y="20" width="120" height="80" rx="8" fill={colors.warm} stroke={colors.sand} strokeWidth="2" />
          <circle cx="100" cy="55" r="20" fill="none" stroke={colors.clay} strokeWidth="2.5" />
          <circle cx="100" cy="55" r="4" fill={colors.clay} />
          <line x1="100" y1="35" x2="100" y2="42" stroke={colors.clay} strokeWidth="2" />
          <line x1="100" y1="68" x2="100" y2="75" stroke={colors.clay} strokeWidth="2" />
          <line x1="80" y1="55" x2="87" y2="55" stroke={colors.clay} strokeWidth="2" />
          <line x1="113" y1="55" x2="120" y2="55" stroke={colors.clay} strokeWidth="2" />
          <rect x="55" y="85" width="90" height="3" rx="1.5" fill={colors.sand} />
          <rect x="65" y="92" width="70" height="3" rx="1.5" fill={colors.sand} opacity="0.6" />
          <text x="100" y="125" textAnchor="middle" fontSize="11" fill={colors.earth} fontWeight="500">Goals + Research</text>
          <text x="100" y="140" textAnchor="middle" fontSize="9" fill={colors.clay}>Budget Range</text>
        </svg>
      );

    case "FINANCE":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-auto" aria-label="Finance phase: securing funding">
          <rect x="30" y="110" width="25" height="40" rx="3" fill={colors.sand} />
          <rect x="60" y="85" width="25" height="65" rx="3" fill={colors.clay} opacity="0.6" />
          <rect x="90" y="60" width="25" height="90" rx="3" fill={colors.clay} opacity="0.8" />
          <rect x="120" y="40" width="25" height="110" rx="3" fill={colors.clay} />
          <rect x="150" y="25" width="25" height="125" rx="3" fill={colors.earth} />
          <line x="20" y1="150" x2="185" y2="150" stroke={colors.sand} strokeWidth="1.5" />
          <line x1="42" y1="95" x2="162" y2="30" stroke={colors.clay} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
          <text x="100" y="15" textAnchor="middle" fontSize="10" fill={colors.earth} fontWeight="500">Qualification Thresholds</text>
          <text x="42" y="108" textAnchor="middle" fontSize="8" fill={colors.earth}>FHA</text>
          <text x="72" y="83" textAnchor="middle" fontSize="8" fill={colors.earth}>USDA</text>
          <text x="102" y="58" textAnchor="middle" fontSize="8" fill={colors.earth}>Conv</text>
          <text x="132" y="38" textAnchor="middle" fontSize="8" fill={colors.earth}>Jumbo</text>
          <text x="162" y="23" textAnchor="middle" fontSize="8" fill={colors.earth}>Cash</text>
        </svg>
      );

    case "LAND":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-auto" aria-label="Land phase: finding a buildable lot">
          <rect x="30" y="30" width="140" height="100" rx="4" fill={colors.warm} stroke={colors.sand} strokeWidth="1.5" />
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3, 4].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={35 + col * 27}
                y={35 + row * 23}
                width="22"
                height="18"
                rx="2"
                fill={row === 1 && col === 2 ? colors.clay : "none"}
                stroke={row === 1 && col === 2 ? colors.clay : colors.sand}
                strokeWidth={row === 1 && col === 2 ? "2" : "1"}
                opacity={row === 1 && col === 2 ? 1 : 0.5}
              />
            ))
          )}
          <text x="100" y="148" textAnchor="middle" fontSize="10" fill={colors.earth} fontWeight="500">Lot Selection + Survey</text>
        </svg>
      );

    case "DESIGN":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-auto" aria-label="Design phase: creating blueprints">
          <rect x="30" y="20" width="140" height="100" rx="4" fill={colors.warm} stroke={colors.sand} strokeWidth="1.5" />
          <rect x="45" y="35" width="50" height="35" fill="none" stroke={colors.clay} strokeWidth="1.5" />
          <rect x="100" y="35" width="55" height="35" fill="none" stroke={colors.clay} strokeWidth="1.5" />
          <rect x="45" y="75" width="80" height="30" fill="none" stroke={colors.clay} strokeWidth="1.5" />
          <rect x="130" y="75" width="25" height="30" fill="none" stroke={colors.sand} strokeWidth="1" />
          <line x1="45" y1="55" x2="95" y2="55" stroke={colors.sand} strokeWidth="0.75" strokeDasharray="3 2" />
          <rect x="60" y="90" width="8" height="15" fill="none" stroke={colors.sand} strokeWidth="1" />
          <text x="70" y="50" textAnchor="middle" fontSize="7" fill={colors.clay}>LIVING</text>
          <text x="127" y="50" textAnchor="middle" fontSize="7" fill={colors.clay}>KITCHEN</text>
          <text x="85" y="93" textAnchor="middle" fontSize="7" fill={colors.clay}>PRIMARY</text>
          <text x="100" y="140" textAnchor="middle" fontSize="10" fill={colors.earth} fontWeight="500">Floor Plans + Engineering</text>
        </svg>
      );

    case "APPROVE":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-auto" aria-label="Approve phase: obtaining permits">
          <rect x="50" y="20" width="100" height="110" rx="4" fill={colors.warm} stroke={colors.sand} strokeWidth="1.5" />
          <rect x="60" y="30" width="80" height="8" rx="2" fill={colors.sand} />
          <rect x="60" y="44" width="80" height="4" rx="1" fill={colors.sand} opacity="0.5" />
          <rect x="60" y="52" width="60" height="4" rx="1" fill={colors.sand} opacity="0.5" />
          <rect x="60" y="60" width="70" height="4" rx="1" fill={colors.sand} opacity="0.5" />
          <circle cx="100" cy="92" r="18" fill="none" stroke={colors.clay} strokeWidth="2.5" />
          <polyline points="92,92 98,98 110,86" fill="none" stroke={colors.clay} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="100" y="148" textAnchor="middle" fontSize="10" fill={colors.earth} fontWeight="500">Permits + Approvals</text>
        </svg>
      );

    case "ASSEMBLE":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-auto" aria-label="Assemble phase: hiring your team">
          {[0, 1, 2].map((i) => {
            const cx = 60 + i * 40;
            return (
              <g key={i}>
                <circle cx={cx} cy={50} r="14" fill={i === 1 ? colors.clay : colors.sand} />
                <circle cx={cx} cy={43} r="6" fill={colors.warm} />
                <rect x={cx - 10} y={58} width="20" height="20" rx="4" fill={i === 1 ? colors.clay : colors.sand} />
              </g>
            );
          })}
          <line x1="74" y1="60" x2="86" y2="60" stroke={colors.earth} strokeWidth="1.5" />
          <line x1="114" y1="60" x2="126" y2="60" stroke={colors.earth} strokeWidth="1.5" />
          <rect x="40" y="95" width="120" height="24" rx="6" fill={colors.warm} stroke={colors.sand} strokeWidth="1.5" />
          <text x="100" y="110" textAnchor="middle" fontSize="9" fill={colors.clay} fontWeight="500">CONTRACTS + INSURANCE</text>
          <text x="100" y="140" textAnchor="middle" fontSize="10" fill={colors.earth} fontWeight="500">Contractors + Scheduling</text>
        </svg>
      );

    case "BUILD":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-auto" aria-label="Build phase: physical construction">
          <line x1="100" y1="15" x2="100" y2="70" stroke={colors.clay} strokeWidth="3" />
          <line x1="95" y1="15" x2="130" y2="40" stroke={colors.clay} strokeWidth="2.5" />
          <line x1="120" y1="30" x2="120" y2="70" stroke={colors.sand} strokeWidth="1" strokeDasharray="3 3" />
          <rect x="50" y="70" width="100" height="60" rx="4" fill={colors.warm} stroke={colors.sand} strokeWidth="1.5" />
          <rect x="60" y="80" width="30" height="20" fill="none" stroke={colors.clay} strokeWidth="1.5" />
          <rect x="110" y="80" width="30" height="20" fill="none" stroke={colors.clay} strokeWidth="1.5" />
          <rect x="88" y="105" width="24" height="25" fill="none" stroke={colors.clay} strokeWidth="1.5" />
          <line x1="50" y1="70" x2="100" y2="55" stroke={colors.clay} strokeWidth="2" />
          <line x1="150" y1="70" x2="100" y2="55" stroke={colors.clay} strokeWidth="2" />
          <text x="100" y="155" textAnchor="middle" fontSize="10" fill={colors.earth} fontWeight="500">Foundation to Finishes</text>
        </svg>
      );

    case "VERIFY":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-auto" aria-label="Verify phase: inspections and sign-off">
          <rect x="50" y="15" width="100" height="115" rx="6" fill={colors.warm} stroke={colors.sand} strokeWidth="1.5" />
          {[0, 1, 2, 3, 4].map((i) => {
            const y = 32 + i * 20;
            const checked = i < 3;
            return (
              <g key={i}>
                <rect x="62" y={y} width="14" height="14" rx="3" fill={checked ? "#2D6A4F" : "none"} stroke={checked ? "#2D6A4F" : colors.sand} strokeWidth="1.5" />
                {checked && (
                  <polyline points={`${65},${y + 7} ${68},${y + 10} ${74},${y + 4}`} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                )}
                <rect x="84" y={y + 3} width={55 - i * 5} height="6" rx="2" fill={colors.sand} opacity={checked ? 1 : 0.4} />
              </g>
            );
          })}
          <text x="100" y="148" textAnchor="middle" fontSize="10" fill={colors.earth} fontWeight="500">Inspections + Close-out</text>
        </svg>
      );

    case "OPERATE":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-auto" aria-label="Operate phase: move in or manage">
          <rect x="55" y="50" width="90" height="70" rx="4" fill={colors.warm} stroke={colors.sand} strokeWidth="1.5" />
          <polygon points="100,20 45,55 155,55" fill={colors.clay} opacity="0.8" />
          <rect x="85" y="85" width="30" height="35" fill="none" stroke={colors.clay} strokeWidth="1.5" />
          <circle cx="108" cy="102" r="2.5" fill={colors.clay} />
          <rect x="65" y="60" width="18" height="18" fill="none" stroke={colors.sand} strokeWidth="1.5" />
          <line x1="65" y1="69" x2="83" y2="69" stroke={colors.sand} strokeWidth="0.75" />
          <line x1="74" y1="60" x2="74" y2="78" stroke={colors.sand} strokeWidth="0.75" />
          <rect x="117" y="60" width="18" height="18" fill="none" stroke={colors.sand} strokeWidth="1.5" />
          <line x1="117" y1="69" x2="135" y2="69" stroke={colors.sand} strokeWidth="0.75" />
          <line x1="126" y1="60" x2="126" y2="78" stroke={colors.sand} strokeWidth="0.75" />
          <text x="100" y="148" textAnchor="middle" fontSize="10" fill={colors.earth} fontWeight="500">Occupy, Rent, or Sell</text>
        </svg>
      );

    default:
      return null;
  }
}

// ─── Cost Donut Chart ─────────────────────────────────────────────────────────

function CostDonutChart({ benchmarks }: { benchmarks: CostBenchmark[] }) {
  const categories = useMemo(() => {
    const grouped: Record<string, number> = {};
    for (const b of benchmarks) {
      const cat = b.category;
      grouped[cat] = (grouped[cat] || 0) + b.midRange;
    }
    const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((s, [, v]) => s + v, 0);
    return entries.slice(0, 8).map(([name, value]) => ({
      name,
      value,
      pct: Math.round((value / total) * 100),
    }));
  }, [benchmarks]);

  const chartColors = [
    "#2C1810", "#8B4513", "#D4A574", "#2D6A4F",
    "#BC6C25", "#1B4965", "#6B4226", "#9B2226",
  ];

  const total = categories.reduce((s, c) => s + c.value, 0);
  let cumAngle = 0;

  return (
    <div className="p-5 rounded-xl bg-surface border border-border">
      <h4
        className="text-[14px] font-semibold text-earth mb-4"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Typical Cost Breakdown (per sq ft)
      </h4>
      <div className="flex items-start gap-6">
        <svg viewBox="0 0 120 120" className="w-32 h-32 shrink-0">
          {categories.map((cat, i) => {
            const angle = (cat.value / total) * 360;
            const startAngle = cumAngle;
            cumAngle += angle;
            const startRad = ((startAngle - 90) * Math.PI) / 180;
            const endRad = ((startAngle + angle - 90) * Math.PI) / 180;
            const largeArc = angle > 180 ? 1 : 0;
            const x1 = 60 + 50 * Math.cos(startRad);
            const y1 = 60 + 50 * Math.sin(startRad);
            const x2 = 60 + 50 * Math.cos(endRad);
            const y2 = 60 + 50 * Math.sin(endRad);
            return (
              <path
                key={i}
                d={`M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={chartColors[i % chartColors.length]}
                opacity="0.85"
              />
            );
          })}
          <circle cx="60" cy="60" r="28" fill="white" />
          <text x="60" y="58" textAnchor="middle" fontSize="10" fill="#2C1810" fontWeight="600">
            ${Math.round(total)}
          </text>
          <text x="60" y="70" textAnchor="middle" fontSize="7" fill="#6A6A6A">
            /sq ft mid
          </text>
        </svg>
        <div className="flex-1 space-y-1.5">
          {categories.map((cat, i) => (
            <div key={cat.name} className="flex items-center gap-2 text-[11px]">
              <div
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: chartColors[i % chartColors.length], opacity: 0.85 }}
              />
              <span className="text-slate truncate flex-1">{cat.name}</span>
              <span className="text-muted font-data shrink-0">{cat.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Phase Duration Timeline ──────────────────────────────────────────────────

function PhaseDurationChart({ phases }: { phases: PhaseDefinition[] }) {
  const maxWeeks = Math.max(...phases.map((p) => p.typicalDurationWeeks.max));

  return (
    <div className="p-5 rounded-xl bg-surface border border-border">
      <h4
        className="text-[14px] font-semibold text-earth mb-4"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Typical Phase Durations
      </h4>
      <div className="space-y-2.5">
        {phases.map((p) => {
          const minPct = (p.typicalDurationWeeks.min / maxWeeks) * 100;
          const maxPct = (p.typicalDurationWeeks.max / maxWeeks) * 100;
          return (
            <div key={p.phase} className="flex items-center gap-3">
              <span className="text-[11px] text-muted w-16 text-right shrink-0">
                {PHASE_NAMES[p.phase]}
              </span>
              <div className="flex-1 h-5 rounded bg-surface-alt relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded bg-sand opacity-40"
                  style={{ width: `${maxPct}%` }}
                />
                <div
                  className="absolute top-0 left-0 h-full rounded bg-clay opacity-70"
                  style={{ width: `${minPct}%` }}
                />
              </div>
              <span className="text-[10px] text-muted font-data w-20 shrink-0">
                {p.typicalDurationWeeks.min}-{p.typicalDurationWeeks.max} wks
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px] text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2.5 rounded bg-clay opacity-70" />
          <span>Minimum</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2.5 rounded bg-sand opacity-40" />
          <span>Maximum</span>
        </div>
      </div>
    </div>
  );
}

// ─── Construction Sequence Diagram ────────────────────────────────────────────

function ConstructionSequence() {
  const steps = [
    { label: "Site Work + Grading", sub: "Clear, grade, erosion control" },
    { label: "Foundation", sub: "Footings, walls/slab, cure" },
    { label: "Framing", sub: "Walls, floor joists, roof structure" },
    { label: "Dry-In", sub: "Roof, house wrap, windows" },
    { label: "Rough Plumbing", sub: "Supply and drain lines" },
    { label: "Rough Electrical", sub: "Wiring, panel, boxes" },
    { label: "Rough HVAC", sub: "Ductwork, refrigerant lines" },
    { label: "Insulation", sub: "Walls, ceiling, floor" },
    { label: "Drywall", sub: "Hang, tape, mud, finish" },
    { label: "Interior Finishes", sub: "Trim, cabinets, flooring, paint" },
    { label: "Fixtures + Appliances", sub: "Plumbing/electrical finish" },
    { label: "Final Grading + Landscape", sub: "Drainage, driveway, sod" },
  ];

  return (
    <div className="p-5 rounded-xl bg-surface border border-border">
      <h4
        className="text-[14px] font-semibold text-earth mb-4"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Construction Sequence
      </h4>
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-clay text-warm text-[10px] font-data font-semibold flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px h-6 bg-sand" />
              )}
            </div>
            <div className="pb-3">
              <p className="text-[12px] font-medium text-earth leading-tight">
                {step.label}
              </p>
              <p className="text-[10px] text-muted leading-tight mt-0.5">
                {step.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Phase Journey Map ────────────────────────────────────────────────────────

function PhaseJourneyMap({
  readPhases,
  activePhase,
  onSelectPhase,
}: {
  readPhases: Set<ProjectPhase>;
  activePhase: ProjectPhase;
  onSelectPhase: (phase: ProjectPhase) => void;
}) {
  return (
    <div className="mb-8">
      <div className="hidden md:block">
        <DesktopJourneyMap
          readPhases={readPhases}
          activePhase={activePhase}
          onSelectPhase={onSelectPhase}
        />
      </div>
      <div className="block md:hidden">
        <MobileJourneyMap
          readPhases={readPhases}
          activePhase={activePhase}
          onSelectPhase={onSelectPhase}
        />
      </div>
    </div>
  );
}

function DesktopJourneyMap({
  readPhases,
  activePhase,
  onSelectPhase,
}: {
  readPhases: Set<ProjectPhase>;
  activePhase: ProjectPhase;
  onSelectPhase: (phase: ProjectPhase) => void;
}) {
  // Layout: two rows with a connecting path
  // Row 1: DEFINE -> FINANCE -> LAND -> DESIGN -> APPROVE
  // Row 2: ASSEMBLE -> BUILD -> VERIFY -> OPERATE (reversed visually to create the snake path)
  const row1 = PHASE_ORDER.slice(0, 5);
  const row2 = PHASE_ORDER.slice(5);

  return (
    <div className="p-6 rounded-xl bg-surface border border-border">
      {/* Row 1 */}
      <div className="flex items-center justify-between mb-2">
        {row1.map((phase, i) => (
          <div key={phase} className="flex items-center">
            <PhaseNode
              phase={phase}
              isRead={readPhases.has(phase)}
              isActive={activePhase === phase}
              onClick={() => onSelectPhase(phase)}
            />
            {i < row1.length - 1 && (
              <div className="flex-1 min-w-8 h-px mx-2 border-t-2 border-dashed border-sand" />
            )}
          </div>
        ))}
      </div>

      {/* Connector from row 1 to row 2 */}
      <div className="flex justify-end pr-[42px] mb-2">
        <div className="w-px h-8 border-l-2 border-dashed border-sand" />
      </div>

      {/* Row 2 */}
      <div className="flex items-center gap-0 pl-[6%]">
        {row2.map((phase, i) => (
          <div key={phase} className="flex items-center">
            <PhaseNode
              phase={phase}
              isRead={readPhases.has(phase)}
              isActive={activePhase === phase}
              onClick={() => onSelectPhase(phase)}
            />
            {i < row2.length - 1 && (
              <div className="flex-1 min-w-8 h-px mx-2 border-t-2 border-dashed border-sand" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileJourneyMap({
  readPhases,
  activePhase,
  onSelectPhase,
}: {
  readPhases: Set<ProjectPhase>;
  activePhase: ProjectPhase;
  onSelectPhase: (phase: ProjectPhase) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to active phase on mount
  useEffect(() => {
    if (scrollRef.current) {
      const activeIndex = PHASE_ORDER.indexOf(activePhase);
      const scrollTarget = activeIndex * 96;
      scrollRef.current.scrollTo({ left: scrollTarget - 40, behavior: "smooth" });
    }
  }, [activePhase]);

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-2 overflow-x-auto pb-3 px-1 scrollbar-hide rounded-xl bg-surface border border-border p-4"
    >
      {PHASE_ORDER.map((phase, i) => (
        <div key={phase} className="flex items-center shrink-0">
          <PhaseNode
            phase={phase}
            isRead={readPhases.has(phase)}
            isActive={activePhase === phase}
            onClick={() => onSelectPhase(phase)}
          />
          {i < PHASE_ORDER.length - 1 && (
            <div className="w-6 h-px mx-1 border-t-2 border-dashed border-sand" />
          )}
        </div>
      ))}
    </div>
  );
}

function PhaseNode({
  phase,
  isRead,
  isActive,
  onClick,
}: {
  phase: ProjectPhase;
  isRead: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = PHASE_ICONS[phase];

  let circleClasses = "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ";
  let textClasses = "text-[9px] mt-1.5 text-center font-medium leading-tight ";

  if (isActive) {
    circleClasses += "bg-emerald-500 ring-4 ring-emerald-200 shadow-lg";
    textClasses += "text-emerald-700";
  } else if (isRead) {
    circleClasses += "bg-success text-white hover:ring-2 hover:ring-success/30";
    textClasses += "text-success";
  } else {
    circleClasses += "border-2 border-sand bg-surface text-muted hover:border-clay hover:text-clay";
    textClasses += "text-muted";
  }

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center w-[72px] group"
      title={`${PHASE_NAMES[phase]}: ${PHASE_DESCRIPTIONS[phase]}`}
    >
      <div className={circleClasses}>
        {isRead && !isActive ? (
          <CheckCircle size={18} className="text-white" />
        ) : (
          <Icon size={18} className={isActive ? "text-white" : ""} />
        )}
      </div>
      <span className={textClasses}>{PHASE_NAMES[phase]}</span>
    </button>
  );
}

// ─── Quick Stats Card ─────────────────────────────────────────────────────────

function QuickStatsCard({ phaseDef }: { phaseDef: PhaseDefinition }) {
  const stats = [
    {
      label: "Duration",
      value: `${phaseDef.typicalDurationWeeks.min}-${phaseDef.typicalDurationWeeks.max} weeks`,
      icon: Clock,
    },
    {
      label: "Milestones",
      value: `${phaseDef.milestones.length}`,
      icon: CheckCircle,
    },
    {
      label: "Documents",
      value: `${phaseDef.requiredDocuments.length}`,
      icon: FileText,
    },
    {
      label: "Cost Share",
      value: PHASE_COST_PCT[phaseDef.phase],
      icon: BarChart3,
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-surface border border-border">
      <h4
        className="text-[13px] font-semibold text-earth mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Phase at a Glance
      </h4>
      <div className="space-y-3">
        {stats.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-warm flex items-center justify-center shrink-0">
                <StatIcon size={14} className="text-clay" />
              </div>
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wide">{stat.label}</p>
                <p className="text-[13px] font-semibold text-earth font-data">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const { setTopbar } = useTopbar();
  const [activePhase, setActivePhase] = useState<ProjectPhase>("DEFINE");
  const [searchQuery, setSearchQuery] = useState("");
  const [readPhases, setReadPhases] = useState<Set<ProjectPhase>>(new Set());
  const [tabTransition, setTabTransition] = useState(false);
  const readTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const marketData = useMemo(() => getMarketData("USA"), []);

  useEffect(() => {
    setTopbar("Learn", "Knowledge base", "success");
  }, [setTopbar]);

  useEffect(() => {
    setReadPhases(getReadPhases());
  }, []);

  // Mark phase as read after 5 seconds
  useEffect(() => {
    if (readTimerRef.current) {
      clearTimeout(readTimerRef.current);
    }
    readTimerRef.current = setTimeout(() => {
      setReadPhases((prev) => {
        if (prev.has(activePhase)) return prev;
        const next = new Set(prev);
        next.add(activePhase);
        saveReadPhases(next);
        return next;
      });
    }, 5000);

    return () => {
      if (readTimerRef.current) {
        clearTimeout(readTimerRef.current);
      }
    };
  }, [activePhase]);

  const handleSelectPhase = useCallback((phase: ProjectPhase) => {
    setTabTransition(true);
    setActivePhase(phase);
    setSearchQuery("");
    setTimeout(() => setTabTransition(false), 50);
    // Scroll content area into view
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Current module data
  const currentModule = marketData.education[activePhase];
  const currentPhaseDef = marketData.phases.find((p) => p.phase === activePhase);
  const paragraphs = splitIntoParagraphs(currentModule.content);
  const readTime = estimateReadingTime(currentModule);

  // Search filter across all phases
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return PHASE_ORDER.filter((phase) => {
      const mod = marketData.education[phase];
      return (
        mod.title.toLowerCase().includes(q) ||
        mod.summary.toLowerCase().includes(q) ||
        mod.content.toLowerCase().includes(q) ||
        PHASE_NAMES[phase].toLowerCase().includes(q)
      );
    });
  }, [searchQuery, marketData]);

  const readCount = readPhases.size;
  const totalCount = PHASE_ORDER.length;
  const progressPct = Math.round((readCount / totalCount) * 100);

  return (
    <div className="page-container">
      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1
          className="text-[28px] text-earth leading-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Construction Knowledge Base
        </h1>
        <p className="text-[14px] text-muted mt-1.5 mb-5">
          Master every phase of building, from first idea to final key.
        </p>

        {/* Progress */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 max-w-sm">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[12px] text-foreground font-medium">
                You have completed {readCount} of {totalCount} phases
              </p>
              <span className="text-[11px] font-data text-muted">{progressPct}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-surface-alt overflow-hidden border border-border">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, #2D6A4F, #10B981)",
                }}
              />
            </div>
          </div>
          {readCount === totalCount && (
            <Badge variant="success">All phases complete</Badge>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted opacity-50"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all phases and topics..."
            className="input-base pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted opacity-50 hover:opacity-80 transition-opacity"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Results */}
        {searchResults !== null && (
          <div className="mt-4 p-4 rounded-xl bg-surface border border-border">
            {searchResults.length === 0 ? (
              <p className="text-[13px] text-muted">No phases match your search.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-[12px] text-muted mb-2">
                  Found in {searchResults.length} phase{searchResults.length !== 1 ? "s" : ""}:
                </p>
                {searchResults.map((phase) => (
                  <button
                    key={phase}
                    onClick={() => handleSelectPhase(phase)}
                    className="flex items-center gap-3 w-full text-left p-2.5 rounded-lg hover:bg-warm transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-warm flex items-center justify-center">
                      {(() => {
                        const Icon = PHASE_ICONS[phase];
                        return <Icon size={14} className="text-clay" />;
                      })()}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-earth">
                        {PHASE_NAMES[phase]}: {marketData.education[phase].title}
                      </p>
                      <p className="text-[11px] text-muted line-clamp-1">
                        {marketData.education[phase].summary}
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-muted ml-auto shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Phase Journey Map ───────────────────────────────────────────── */}
      <PhaseJourneyMap
        readPhases={readPhases}
        activePhase={activePhase}
        onSelectPhase={handleSelectPhase}
      />

      {/* ── Phase Tabs ──────────────────────────────────────────────────── */}
      <div className="mb-6 overflow-x-auto scrollbar-hide" ref={contentRef}>
        <div className="flex border-b border-border min-w-max">
          {PHASE_ORDER.map((phase) => {
            const isActive = phase === activePhase;
            return (
              <button
                key={phase}
                onClick={() => handleSelectPhase(phase)}
                className={`
                  relative px-4 py-3 text-[12px] font-medium transition-colors whitespace-nowrap
                  ${isActive
                    ? "text-emerald-700"
                    : "text-muted hover:text-foreground"
                  }
                `}
              >
                <span className="flex items-center gap-1.5">
                  {readPhases.has(phase) && (
                    <CheckCircle size={11} className="text-success" />
                  )}
                  {PHASE_NAMES[phase]}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Module Content ──────────────────────────────────────────────── */}
      <div
        className={`transition-opacity duration-300 ${
          tabTransition ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column: Content (60%) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Phase Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="emerald">
                  Phase {PHASE_ORDER.indexOf(activePhase) + 1} of {PHASE_ORDER.length}
                </Badge>
                <span className="text-[11px] text-muted flex items-center gap-1">
                  <Clock size={11} />
                  {readTime} min read
                </span>
              </div>
              <h2
                className="text-[22px] text-earth leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {currentModule.title}
              </h2>
              <p className="text-[13px] text-muted mt-2 leading-relaxed">
                {currentModule.summary}
              </p>
            </div>

            {/* Build phase special: Cost Donut Chart */}
            {activePhase === "BUILD" && (
              <CostDonutChart benchmarks={marketData.costBenchmarks} />
            )}

            {/* Main Content */}
            <div className="p-5 rounded-xl bg-warm/40 border border-sand/30">
              {paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-[13px] text-foreground mb-4 last:mb-0"
                  style={{ lineHeight: 1.8 }}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Key Decisions */}
            {currentModule.keyDecisions.length > 0 && (
              <div>
                <h3
                  className="text-[16px] text-earth mb-3 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <BookOpen size={16} className="text-clay" />
                  Key Decisions
                </h3>
                <div className="space-y-3 animate-stagger">
                  {currentModule.keyDecisions.map((decision, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3.5 rounded-xl bg-surface border border-border"
                    >
                      <div className="w-7 h-7 rounded-full bg-clay text-warm text-[12px] font-data font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-[13px] text-foreground leading-relaxed pt-0.5">
                        {decision}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Mistakes */}
            {currentModule.commonMistakes.length > 0 && (
              <div>
                <h3
                  className="text-[16px] text-earth mb-3 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <AlertTriangle size={16} className="text-warning" />
                  Common Mistakes
                </h3>
                <div className="space-y-2.5 animate-stagger">
                  {currentModule.commonMistakes.map((mistake, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border-l-4 border-l-warning bg-warning/5 border border-warning/10"
                    >
                      <p className="text-[13px] text-foreground leading-relaxed">
                        {mistake}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pro Tips */}
            {currentModule.proTips.length > 0 && (
              <div>
                <h3
                  className="text-[16px] text-earth mb-3 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <Lightbulb size={16} className="text-emerald-600" />
                  Pro Tips
                </h3>
                <div className="space-y-2.5 animate-stagger">
                  {currentModule.proTips.map((tip, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border-l-4 border-l-emerald-500 bg-emerald-50 border border-emerald-100"
                    >
                      <p className="text-[13px] text-foreground leading-relaxed">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Build phase special: Construction Sequence */}
            {activePhase === "BUILD" && <ConstructionSequence />}

            {/* Disclaimer */}
            <p className="text-[11px] text-muted italic py-2">
              This is educational guidance. Consult a licensed professional for your specific situation.
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2 pb-4 border-t border-border">
              {PHASE_ORDER.indexOf(activePhase) > 0 ? (
                <button
                  onClick={() =>
                    handleSelectPhase(
                      PHASE_ORDER[PHASE_ORDER.indexOf(activePhase) - 1]
                    )
                  }
                  className="text-[13px] text-clay font-medium hover:text-earth transition-colors flex items-center gap-1.5"
                >
                  <ChevronDown size={14} className="rotate-90" />
                  {PHASE_NAMES[PHASE_ORDER[PHASE_ORDER.indexOf(activePhase) - 1]]}
                </button>
              ) : (
                <div />
              )}
              {PHASE_ORDER.indexOf(activePhase) < PHASE_ORDER.length - 1 ? (
                <button
                  onClick={() =>
                    handleSelectPhase(
                      PHASE_ORDER[PHASE_ORDER.indexOf(activePhase) + 1]
                    )
                  }
                  className="text-[13px] text-clay font-medium hover:text-earth transition-colors flex items-center gap-1.5"
                >
                  {PHASE_NAMES[PHASE_ORDER[PHASE_ORDER.indexOf(activePhase) + 1]]}
                  <ChevronDown size={14} className="-rotate-90" />
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* Right Column: Sidebar (40%) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Phase Infographic */}
            <div className="p-4 rounded-xl bg-surface border border-border">
              <PhaseInfographic phase={activePhase} />
            </div>

            {/* Quick Stats */}
            {currentPhaseDef && <QuickStatsCard phaseDef={currentPhaseDef} />}

            {/* Required Documents */}
            {currentPhaseDef && currentPhaseDef.requiredDocuments.length > 0 && (
              <div className="p-4 rounded-xl bg-surface border border-border">
                <h4
                  className="text-[13px] font-semibold text-earth mb-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Key Documents
                </h4>
                <ul className="space-y-1.5">
                  {currentPhaseDef.requiredDocuments.slice(0, 6).map((doc, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[11px] text-foreground"
                    >
                      <FileText size={11} className="text-sand mt-0.5 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                  {currentPhaseDef.requiredDocuments.length > 6 && (
                    <li className="text-[10px] text-muted pl-5">
                      +{currentPhaseDef.requiredDocuments.length - 6} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Phase Duration Timeline (shown on DEFINE, the introductory phase) */}
            {activePhase === "DEFINE" && (
              <PhaseDurationChart phases={marketData.phases} />
            )}

            {/* Try It Now Link */}
            <a
              href={`/project/new`}
              className="block p-4 rounded-xl bg-clay text-warm hover:bg-earth transition-colors group"
            >
              <p className="text-[13px] font-semibold mb-1">
                Ready to start?
              </p>
              <p className="text-[11px] opacity-80">
                Create a project and begin the {PHASE_NAMES[activePhase]} phase.
              </p>
              <div className="flex items-center gap-1 mt-2 text-[11px] font-medium">
                <span>Get started</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="mt-10 p-4 rounded-xl bg-warm border border-sand/30 text-[11px] text-muted leading-relaxed text-center">
        All educational content is for general informational purposes only. Always consult licensed
        professionals for advice specific to your project, location, and circumstances.
      </div>
    </div>
  );
}
