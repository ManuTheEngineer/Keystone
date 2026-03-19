"use client";

import { useState, useEffect, useRef } from "react";
import {
  Target, MapPin, Home, DollarSign, TrendingUp, Check, CheckCircle2,
  Camera, Users, FileText, Shield, Clock, BarChart3, ArrowRight, Play, Pause,
} from "lucide-react";

// ============================================================================
// Scene config
// ============================================================================

interface Scene {
  id: string;
  phase: string;
  title: string;
  description: string;
  highlights: string[];
}

const SCENES: Scene[] = [
  { id: "analyze", phase: "Analyze", title: "Evaluate your deal", description: "Run the numbers before you commit. Get a deal score, cost breakdown, and risk analysis for any market.", highlights: ["Deal score", "Cost breakdown", "Risk flags", "Cross-market"] },
  { id: "plan", phase: "Plan", title: "Set up your project", description: "Define your vision, set a budget, and get a structured plan with tasks, milestones, and timelines.", highlights: ["Auto-tasks", "Budget builder", "Phase tracking", "AI guidance"] },
  { id: "build", phase: "Build", title: "Manage construction", description: "Assign tasks to contractors, track progress with photos, and approve work as it gets done.", highlights: ["Contractor portal", "Photo evidence", "Approve/reject", "GPS verified"] },
  { id: "track", phase: "Track", title: "Control your budget", description: "Monitor spending against estimates, get alerts on overruns, and keep every dollar accounted for.", highlights: ["Live tracking", "Overrun alerts", "Category drill-down", "Export reports"] },
  { id: "complete", phase: "Complete", title: "Move in with confidence", description: "Final inspections, punch list resolution, and a complete record of your entire build.", highlights: ["Final inspection", "Punch list", "Document archive", "Handover ready"] },
];

const SCENE_MS = 4500;

// ============================================================================
// Phone screen mockups -- richer detail
// ============================================================================

function AnalyzeScreen({ p }: { p: number }) {
  const score = Math.min(78, Math.round(p * 78));
  const r = 30, circ = 2 * Math.PI * r, dash = circ * (score / 100);
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0" style={{ width: 72, height: 72 }}>
          <svg width={72} height={72} viewBox="0 0 72 72" className="-rotate-90">
            <circle cx={36} cy={36} r={r} fill="none" stroke="#F5E6D3" strokeWidth={5} />
            <circle cx={36} cy={36} r={r} fill="none" stroke="#2D6A4F" strokeWidth={5} strokeLinecap="round"
              strokeDasharray={`${dash} ${circ - dash}`} style={{ transition: "stroke-dasharray 0.6s ease-out" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[16px] font-bold font-data text-[#2C1810] leading-none">{score}</span>
            <span className="text-[6px] text-[#6A6A6A] uppercase font-medium mt-0.5">{score >= 65 ? "Good" : "Fair"}</span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          {[
            { l: "Total cost", v: `$${Math.round(p * 342)}K` },
            { l: "Per sqft", v: `$${Math.round(p * 190)}` },
            { l: "Monthly", v: `$${Math.round(p * 2280).toLocaleString()}`, accent: true },
            { l: "ROI", v: `${(p * 7.2).toFixed(1)}%`, green: true },
          ].map((r) => (
            <div key={r.l} className="flex justify-between">
              <span className="text-[7px] text-[#6A6A6A]">{r.l}</span>
              <span className={`text-[7px] font-data font-semibold ${r.accent ? "text-[#8B4513]" : r.green ? "text-[#2D6A4F]" : "text-[#2C1810]"}`}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Donut chart mini */}
      <div className="flex items-center gap-2">
        <svg width={44} height={44} viewBox="0 0 44 44" className="-rotate-90">
          {[
            { pct: 0.55, color: "#2D6A4F" },
            { pct: 0.20, color: "#8B4513" },
            { pct: 0.12, color: "#1B4965" },
            { pct: 0.13, color: "#D4A574" },
          ].reduce<{ el: React.ReactNode[]; off: number }>((acc, seg, i) => {
            const c = 2 * Math.PI * 16;
            const d = c * seg.pct * p;
            acc.el.push(<circle key={i} cx={22} cy={22} r={16} fill="none" stroke={seg.color} strokeWidth={5}
              strokeDasharray={`${d} ${c - d}`} strokeDashoffset={-acc.off} style={{ transition: "all 0.8s" }} />);
            acc.off += d;
            return acc;
          }, { el: [], off: 0 }).el}
        </svg>
        <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
          {[
            { l: "Construction", c: "#2D6A4F", v: "55%" },
            { l: "Land", c: "#8B4513", v: "20%" },
            { l: "Soft costs", c: "#1B4965", v: "12%" },
            { l: "Contingency", c: "#D4A574", v: "13%" },
          ].map((i) => (
            <div key={i.l} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ backgroundColor: i.c }} />
              <span className="text-[6px] text-[#6A6A6A]">{i.l}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Risk flag */}
      <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-md" style={{ backgroundColor: "#FFF8F0", borderLeft: "2px solid #BC6C25", opacity: p > 0.5 ? 1 : 0, transition: "opacity 0.4s" }}>
        <Shield size={8} className="text-[#BC6C25] mt-0.5 shrink-0" />
        <p className="text-[6px] text-[#8B4513] leading-relaxed">Down payment below 20%. Consider PMI costs.</p>
      </div>
    </div>
  );
}

function PlanScreen({ p }: { p: number }) {
  const tasks = [
    { label: "Define building goal", done: p > 0.12 },
    { label: "Select target market (USA)", done: p > 0.25 },
    { label: "Set location (Houston, TX)", done: p > 0.4 },
    { label: "Choose property type (SFH)", done: p > 0.55 },
    { label: "Review initial budget", done: p > 0.7 },
    { label: "Confirm financing strategy", done: p > 0.85 },
  ];
  const done = tasks.filter((t) => t.done).length;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[8px] font-semibold text-[#2C1810]">Phase 0: Define</span>
        <span className="text-[7px] font-data text-[#2D6A4F] font-semibold">{done}/{tasks.length}</span>
      </div>
      <div className="h-1.5 bg-[#F5E6D3] rounded-full overflow-hidden">
        <div className="h-full bg-[#2D6A4F] rounded-full" style={{ width: `${(done / tasks.length) * 100}%`, transition: "width 0.4s" }} />
      </div>
      <div className="space-y-0.5">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md" style={{ backgroundColor: t.done ? "#F0FDF4" : "#FDFAF5", transition: "background 0.3s" }}>
            <div className={`w-3.5 h-3.5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${t.done ? "bg-[#2D6A4F] border-[#2D6A4F]" : "border-[#D4A574]"}`} style={{ transition: "all 0.3s" }}>
              {t.done && <Check size={7} className="text-white" />}
            </div>
            <span className={`text-[7px] flex-1 ${t.done ? "text-[#6A6A6A] line-through" : "text-[#2C1810] font-medium"}`}>{t.label}</span>
            {t.done && <span className="text-[5px] text-[#2D6A4F] font-medium">Review</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function BuildScreen({ p }: { p: number }) {
  const tasks = [
    { label: "Foundation pour", who: "ABC Builders", s: p > 0.2 ? "done" : p > 0.05 ? "review" : "active", photos: 4 },
    { label: "Framing walls", who: "Steel & Sons", s: p > 0.6 ? "done" : p > 0.4 ? "review" : p > 0.2 ? "active" : "wait", photos: 7 },
    { label: "Rough plumbing", who: "AquaFlow LLC", s: p > 0.85 ? "review" : p > 0.6 ? "active" : "wait", photos: 3 },
    { label: "Electrical rough-in", who: "VoltPro Electric", s: p > 0.85 ? "active" : "wait", photos: 0 },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-semibold text-[#2C1810]">Phase 6: Build</span>
        <div className="flex items-center gap-1 text-[6px] text-[#8B4513]">
          <Camera size={8} /> {tasks.reduce((s, t) => s + (t.s !== "wait" ? t.photos : 0), 0)} photos
        </div>
      </div>
      <div className="space-y-1">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md border" style={{
            borderColor: t.s === "review" ? "#BC6C25" : t.s === "done" ? "#2D6A4F" : t.s === "active" ? "#D4A574" : "#F5E6D3",
            backgroundColor: t.s === "done" ? "#F0FDF4" : t.s === "review" ? "#FFF8F0" : "#FFFFFF",
            opacity: t.s === "wait" ? 0.4 : 1, transition: "all 0.5s",
          }}>
            <div className={`w-3 h-3 rounded-full flex items-center justify-center shrink-0 ${
              t.s === "done" ? "bg-[#2D6A4F]" : t.s === "review" ? "bg-[#BC6C25]" : t.s === "active" ? "bg-[#8B4513]/20" : "bg-[#F5E6D3]"
            }`} style={{ transition: "all 0.3s" }}>
              {t.s === "done" && <Check size={7} className="text-white" />}
              {t.s === "review" && <Clock size={6} className="text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[7px] font-medium text-[#2C1810] truncate">{t.label}</p>
              <p className="text-[5.5px] text-[#6A6A6A]">{t.who}</p>
            </div>
            {t.s === "review" && <span className="text-[5px] px-1 py-0.5 rounded bg-[#BC6C25]/10 text-[#BC6C25] font-semibold">Pending</span>}
            {t.s === "done" && <span className="text-[5px] px-1 py-0.5 rounded bg-[#2D6A4F]/10 text-[#2D6A4F] font-semibold">Approved</span>}
            {t.s === "active" && <span className="text-[5px] px-1 py-0.5 rounded bg-[#8B4513]/10 text-[#8B4513] font-semibold">In progress</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackScreen({ p }: { p: number }) {
  const spent = Math.round(p * 186000);
  const budget = 342000;
  const pct = Math.round((spent / budget) * 100);
  const cats = [
    { l: "Foundation", est: 34200, act: Math.round(p * 32800), c: "#2D6A4F" },
    { l: "Framing", est: 51300, act: Math.round(p * 49100), c: "#8B4513" },
    { l: "Plumbing", est: 27360, act: Math.round(Math.min(p * 1.12, 1) * 29200), c: "#1B4965" },
    { l: "Electrical", est: 23940, act: Math.round(p * 18200), c: "#D4A574" },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-semibold text-[#2C1810]">Budget</span>
        <span className="text-[7px] font-data font-semibold" style={{ color: pct > 80 ? "#9B2226" : "#2C1810" }}>{pct}% used</span>
      </div>
      <div className="h-2 bg-[#F5E6D3] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct > 85 ? "#9B2226" : pct > 70 ? "#BC6C25" : "#2D6A4F", transition: "all 0.6s" }} />
      </div>
      <div className="flex justify-between text-[6px] text-[#6A6A6A]">
        <span>Spent: <b className="text-[#2C1810] font-data">${(spent / 1000).toFixed(0)}K</b></span>
        <span>Left: <b className="text-[#2D6A4F] font-data">${((budget - spent) / 1000).toFixed(0)}K</b></span>
      </div>
      <div className="space-y-0.5">
        {cats.map((c) => {
          const over = c.act > c.est;
          const w = Math.min(100, (c.act / c.est) * 100);
          return (
            <div key={c.l} className="flex items-center gap-1.5 px-1.5 py-1 rounded-md bg-[#FDFAF5]">
              <span className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ backgroundColor: c.c }} />
              <span className="text-[6px] text-[#6A6A6A] w-12">{c.l}</span>
              <div className="flex-1 h-1.5 bg-[#F5E6D3] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${w}%`, backgroundColor: over ? "#9B2226" : c.c, transition: "width 0.5s" }} />
              </div>
              <span className={`text-[6px] font-data w-8 text-right ${over ? "text-[#9B2226] font-bold" : "text-[#2C1810]"}`}>
                ${(c.act / 1000).toFixed(1)}K
              </span>
              {over && <span className="text-[5px] text-[#9B2226]">!</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompleteScreen({ p }: { p: number }) {
  const items = [
    { l: "Final walkthrough inspection", d: p > 0.15 },
    { l: "Punch list resolved (8/8)", d: p > 0.35 },
    { l: "Certificate of occupancy", d: p > 0.55 },
    { l: "Final payments released", d: p > 0.7 },
    { l: "Documents archived", d: p > 0.85 },
  ];
  const allDone = items.every((i) => i.d);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${allDone ? "bg-[#2D6A4F]" : "bg-[#F5E6D3]"}`} style={{ transition: "all 0.5s" }}>
          <CheckCircle2 size={14} className={allDone ? "text-white" : "text-[#D4A574]"} />
        </div>
        <div>
          <p className="text-[8px] font-semibold text-[#2C1810]">{allDone ? "Project complete!" : "Completing..."}</p>
          <p className="text-[6px] text-[#6A6A6A]">{items.filter((i) => i.d).length}/{items.length} verified</p>
        </div>
      </div>
      <div className="space-y-0.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md" style={{ backgroundColor: item.d ? "#F0FDF4" : "#FDFAF5", transition: "background 0.3s" }}>
            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${item.d ? "bg-[#2D6A4F]" : "bg-[#F5E6D3]"}`} style={{ transition: "all 0.3s" }}>
              {item.d && <Check size={7} className="text-white" />}
            </div>
            <span className={`text-[7px] ${item.d ? "text-[#6A6A6A]" : "text-[#2C1810]"}`}>{item.l}</span>
          </div>
        ))}
      </div>
      {allDone && (
        <div className="text-center pt-1" style={{ animation: "fadeUp 0.5s ease-out" }}>
          <p className="text-[9px] font-semibold text-[#2D6A4F]" style={{ fontFamily: "var(--font-heading)" }}>From first idea to final key.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Construction Site SVG
// ============================================================================

function ConstructionSite({ scene, p }: { scene: number; p: number }) {
  const wallH = scene >= 2 ? (scene >= 3 ? 75 : Math.round(p * 75)) : 0;
  const roofOp = scene >= 3 ? (scene >= 4 ? 1 : p) : 0;
  const winOp = scene >= 3 ? (scene >= 4 ? 1 : Math.max(0, (p - 0.3) * 1.5)) : 0;
  const finishOp = scene >= 4 ? p : 0;
  const landscapeOp = scene >= 4 ? Math.max(0, (p - 0.4) * 1.7) : 0;

  return (
    <svg viewBox="0 0 320 220" className="w-full" fill="none">
      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D6ECFA" />
          <stop offset="100%" stopColor="#EEF6FD" />
        </linearGradient>
      </defs>
      <rect width="320" height="150" fill="url(#sky)" />

      {/* Sun */}
      <circle cx="270" cy="32" r="18" fill="#F9D56E" opacity="0.85">
        <animate attributeName="r" values="17;19;17" dur="4s" repeatCount="indefinite" />
      </circle>
      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1={270 + Math.cos(a * Math.PI / 180) * 22} y1={32 + Math.sin(a * Math.PI / 180) * 22}
          x2={270 + Math.cos(a * Math.PI / 180) * 28} y2={32 + Math.sin(a * Math.PI / 180) * 28}
          stroke="#F9D56E" strokeWidth="1" opacity="0.4" strokeLinecap="round">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" begin={`${a / 360}s`} />
        </line>
      ))}

      {/* Clouds */}
      <g opacity="0.6">
        <ellipse cx="55" cy="30" rx="24" ry="8" fill="white" />
        <ellipse cx="68" cy="26" rx="16" ry="7" fill="white" />
      </g>
      <g opacity="0.4">
        <ellipse cx="170" cy="42" rx="18" ry="6" fill="white">
          <animateTransform attributeName="transform" type="translate" values="0,0;20,0;0,0" dur="18s" repeatCount="indefinite" />
        </ellipse>
      </g>

      {/* Ground */}
      <rect x="0" y="140" width="320" height="80" fill="#C4924A" />
      <rect x="0" y="140" width="320" height="4" fill="#8B6F47" opacity="0.4" />
      {/* Dirt texture */}
      {[30, 80, 140, 200, 260].map((x) => (
        <circle key={x} cx={x} cy={155 + (x % 3) * 5} r="1" fill="#8B6F47" opacity="0.2" />
      ))}

      {/* === EMPTY LOT (scene 0) === */}
      {scene === 0 && (
        <g style={{ opacity: Math.min(p * 2.5, 1) }}>
          {[85, 125, 165, 205].map((x) => (
            <g key={x}>
              <line x1={x} y1="135" x2={x} y2="150" stroke="#D4553A" strokeWidth="1.5" />
              <polygon points={`${x - 3},135 ${x + 3},135 ${x},129`} fill="#D4553A" />
            </g>
          ))}
          <rect x="83" y="115" width="124" height="28" rx="2" fill="none" stroke="#8B4513" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.5" />
          {/* Sign */}
          <rect x="25" y="118" width="30" height="18" rx="2" fill="white" stroke="#8B4513" strokeWidth="0.8" />
          <line x1="40" y1="136" x2="40" y2="152" stroke="#8B4513" strokeWidth="1.5" />
          <text x="40" y="127" textAnchor="middle" fill="#8B4513" fontSize="4.5" fontWeight="700">LOT</text>
          <text x="40" y="133" textAnchor="middle" fill="#8B4513" fontSize="3.5">FOR SALE</text>
          {/* Grass patches */}
          {[50, 110, 230, 270].map((x) => (
            <g key={x}>
              <line x1={x} y1="140" x2={x - 2} y2="133" stroke="#6B8F5E" strokeWidth="0.8" />
              <line x1={x} y1="140" x2={x} y2="132" stroke="#7BA36E" strokeWidth="0.8" />
              <line x1={x} y1="140" x2={x + 2} y2="134" stroke="#6B8F5E" strokeWidth="0.8" />
            </g>
          ))}
        </g>
      )}

      {/* === PLANNING (scene 1) === */}
      {scene === 1 && (
        <g>
          <rect x="75" y="125" width="140" height="18" rx="1" fill="none" stroke="#1B4965" strokeWidth="1" strokeDasharray="4 2" style={{ opacity: Math.min(p * 2, 0.7) }} />
          {/* Blueprint */}
          <g style={{ opacity: Math.min(p * 2, 1) }}>
            <rect x="90" y="105" width="42" height="28" rx="2" fill="white" stroke="#1B4965" strokeWidth="0.5" transform="rotate(-3, 111, 119)" />
            <line x1="96" y1="112" x2="126" y2="112" stroke="#1B4965" strokeWidth="0.4" transform="rotate(-3, 111, 119)" />
            <line x1="96" y1="116" x2="118" y2="116" stroke="#1B4965" strokeWidth="0.4" transform="rotate(-3, 111, 119)" />
            <rect x="98" y="119" width="16" height="10" rx="0.5" fill="none" stroke="#1B4965" strokeWidth="0.4" transform="rotate(-3, 111, 119)" />
          </g>
          {/* Tape measure */}
          <line x1="75" y1="148" x2="215" y2="148" stroke="#D4553A" strokeWidth="0.8" style={{ opacity: Math.min(p * 2.5, 0.6) }} />
          <text x="145" y="155" textAnchor="middle" fill="#D4553A" fontSize="5" style={{ opacity: Math.min(p * 2.5, 0.6) }}>140 ft</text>
        </g>
      )}

      {/* === FOUNDATION (scene 2+) === */}
      {scene >= 2 && <rect x="75" y="130" width="140" height="10" fill="#B0B0B0" rx="1" />}

      {/* === WALLS (scene 2+) === */}
      {scene >= 2 && (
        <g>
          <rect x="75" y={130 - wallH} width="7" height={wallH} fill="#F5E6D3" stroke="#D4A574" strokeWidth="0.4" style={{ transition: "all 0.6s" }} />
          <rect x="208" y={130 - wallH} width="7" height={wallH} fill="#F5E6D3" stroke="#D4A574" strokeWidth="0.4" style={{ transition: "all 0.6s" }} />
          {wallH > 20 && <rect x="75" y={130 - wallH} width="140" height="7" fill="#F5E6D3" stroke="#D4A574" strokeWidth="0.4" style={{ transition: "all 0.4s" }} />}
          {/* Interior wall */}
          {wallH > 40 && <rect x="145" y={130 - wallH + 7} width="4" height={wallH - 7} fill="#E8D5C0" style={{ transition: "all 0.5s" }} />}
        </g>
      )}

      {/* === ROOF (scene 3+) === */}
      {roofOp > 0 && (
        <g style={{ opacity: roofOp, transition: "opacity 0.5s" }}>
          <polygon points="65,55 145,20 225,55" fill="#6B4226" />
          <polygon points="65,55 145,20 145,55" fill="#5A3518" opacity="0.4" />
          <rect x="180" y="22" width="8" height="16" fill="#B0B0B0" rx="1" />
          {/* Shingles texture */}
          {[75, 95, 115, 135, 155, 175, 195].map((x) => (
            <line key={x} x1={x} y1={55 - (Math.abs(145 - x) / 80) * 35} x2={x + 10} y2={55 - (Math.abs(145 - (x + 10)) / 80) * 35}
              stroke="#5A3518" strokeWidth="0.3" opacity="0.3" />
          ))}
        </g>
      )}

      {/* === WINDOWS (scene 3+) === */}
      {winOp > 0 && (
        <g style={{ opacity: winOp, transition: "opacity 0.4s" }}>
          <rect x="92" y="72" width="16" height="18" rx="1" fill="#87CEEB" stroke="white" strokeWidth="1" />
          <line x1="100" y1="72" x2="100" y2="90" stroke="white" strokeWidth="0.6" />
          <line x1="92" y1="81" x2="108" y2="81" stroke="white" strokeWidth="0.6" />
          <rect x="180" y="72" width="16" height="18" rx="1" fill="#87CEEB" stroke="white" strokeWidth="1" />
          <line x1="188" y1="72" x2="188" y2="90" stroke="white" strokeWidth="0.6" />
          <line x1="180" y1="81" x2="196" y2="81" stroke="white" strokeWidth="0.6" />
        </g>
      )}

      {/* === DOOR (scene 2+ when walls high enough) === */}
      {wallH > 35 && (
        <g>
          <rect x="130" y="100" width="18" height="30" rx="1" fill={scene >= 4 ? "#6B4226" : "#C4924A"} stroke="#5A3518" strokeWidth="0.4" />
          <circle cx="144" cy="116" r="1.2" fill="#D4A574" />
        </g>
      )}

      {/* === FINISHING (scene 4) === */}
      {finishOp > 0 && (
        <g style={{ opacity: finishOp, transition: "opacity 0.6s" }}>
          {/* Path */}
          <rect x="133" y="130" width="12" height="14" rx="1" fill="#B0B0B0" opacity="0.5" />
        </g>
      )}

      {/* === LANDSCAPING (scene 4) === */}
      {landscapeOp > 0 && (
        <g style={{ opacity: landscapeOp, transition: "opacity 0.5s" }}>
          <ellipse cx="82" cy="133" rx="10" ry="7" fill="#2D6A4F" />
          <ellipse cx="92" cy="131" rx="7" ry="5" fill="#3A8B5F" />
          <ellipse cx="208" cy="133" rx="10" ry="7" fill="#2D6A4F" />
          <ellipse cx="198" cy="131" rx="6" ry="5" fill="#3A8B5F" />
          {/* Flowers */}
          {[86, 204].map((x) => (
            <g key={x}>
              <circle cx={x} cy={127} r="1.5" fill="#E8527A" />
              <circle cx={x + 4} cy={128} r="1.5" fill="#F9D56E" />
            </g>
          ))}
          {/* Mailbox */}
          <rect x="40" y="128" width="7" height="10" rx="1" fill="#2C1810" />
          <line x1="43.5" y1="138" x2="43.5" y2="150" stroke="#2C1810" strokeWidth="1.5" />
          {/* Fence */}
          {[240, 250, 260, 270].map((x) => (
            <g key={x}>
              <line x1={x} y1="130" x2={x} y2="148" stroke="white" strokeWidth="1.2" />
              <polygon points={`${x - 2},130 ${x + 2},130 ${x},126`} fill="white" />
            </g>
          ))}
          <line x1="238" y1="136" x2="272" y2="136" stroke="white" strokeWidth="0.8" />
        </g>
      )}

      {/* === PEOPLE === */}
      <Stick x={scene === 0 ? 260 : scene === 1 ? 30 : scene === 2 ? 260 : scene === 3 ? 25 : 145}
        y={scene === 4 ? 132 : 135} color="#1B4965" label={scene <= 1 ? "You" : ""} walking={scene === 4 && p > 0.8} />
      {scene >= 2 && <Stick x={scene === 2 ? 145 : scene === 3 ? 170 : 240} y={135} color="#BC6C25" hat working={scene <= 3} />}
      {scene >= 3 && <Stick x={scene === 3 ? 250 : 45} y={135} color="#2D6A4F" clip />}
      {scene === 2 && p > 0.25 && <Stick x={95} y={135} color="#D4553A" hat working />}

      {/* Phase label */}
      <rect x="15" y="162" width="290" height="20" rx="6" fill="#2C1810" opacity="0.92" />
      <text x="160" y="175" textAnchor="middle" fill="#D4A574" fontSize="8" fontWeight="600" style={{ fontFamily: "var(--font-heading)" }}>
        {["Analyzing the deal...", "Planning the build...", "Construction in progress...", "Tracking and inspecting...", "Project complete!"][scene]}
      </text>

      {/* Progress dots */}
      {SCENES.map((_, i) => (
        <circle key={i} cx={132 + i * 14} cy="192" r={i === scene ? 3.5 : 2}
          fill={i <= scene ? "#8B4513" : "#D4A574"} style={{ transition: "all 0.3s" }} />
      ))}
    </svg>
  );
}

// Minimal stick figure
function Stick({ x, y, color, hat, clip, working, walking, label }: {
  x: number; y: number; color: string; hat?: boolean; clip?: boolean; working?: boolean; walking?: boolean; label?: string;
}) {
  return (
    <g transform={`translate(${x},${y})`} style={{ transition: "transform 0.7s ease-out" }}>
      {label && <text x={0} y={-24} textAnchor="middle" fill="#6A6A6A" fontSize="5">{label}</text>}
      {hat && <><ellipse cx={0} cy={-19} rx={5} ry={2} fill="#F9D56E" /><rect x={-4} y={-22} width={8} height={3.5} rx={1.5} fill="#F9D56E" /></>}
      <circle cx={0} cy={-16} r={4} fill="#E8C4A0" />
      {!hat && <ellipse cx={0} cy={-19} rx={3} ry={1.5} fill={color} opacity="0.7" />}
      <rect x={-4} y={-11} width={8} height={11} rx={1.5} fill={color} />
      {/* Arms */}
      <line x1={-4} y1={-7} x2={-8} y2={working ? -2 : 0} stroke={color} strokeWidth={2} strokeLinecap="round">
        {working && <animateTransform attributeName="transform" type="rotate" values="0 -4 -7;-20 -4 -7;0 -4 -7" dur="1s" repeatCount="indefinite" />}
      </line>
      <line x1={4} y1={-7} x2={8} y2={working ? -2 : 0} stroke={color} strokeWidth={2} strokeLinecap="round">
        {working && <animateTransform attributeName="transform" type="rotate" values="0 4 -7;20 4 -7;0 4 -7" dur="1s" repeatCount="indefinite" begin="0.5s" />}
      </line>
      {clip && <><rect x={6} y={-8} width={5} height={6} rx={0.5} fill="white" stroke="#999" strokeWidth={0.4} /><line x1={7.5} y1={-6} x2={10} y2={-6} stroke="#999" strokeWidth={0.3} /></>}
      {/* Legs */}
      <line x1={-2} y1={0} x2={-3} y2={7} stroke="#2C1810" strokeWidth={2} strokeLinecap="round">
        {walking && <animateTransform attributeName="transform" type="rotate" values="0 -2 0;8 -2 0;0 -2 0" dur="0.6s" repeatCount="indefinite" />}
      </line>
      <line x1={2} y1={0} x2={3} y2={7} stroke="#2C1810" strokeWidth={2} strokeLinecap="round">
        {walking && <animateTransform attributeName="transform" type="rotate" values="0 2 0;-8 2 0;0 2 0" dur="0.6s" repeatCount="indefinite" begin="0.3s" />}
      </line>
    </g>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProductDemo() {
  const [scene, setScene] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const tick = setInterval(() => setProgress((p) => Math.min(1, p + 1 / (SCENE_MS / 50))), 50);
    const advance = setInterval(() => { setScene((s) => (s + 1) % SCENES.length); setProgress(0); }, SCENE_MS);
    return () => { clearInterval(tick); clearInterval(advance); };
  }, [playing]);

  const go = (i: number) => { setScene(i); setProgress(0); };
  const s = SCENES[scene];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Scene tabs + play/pause */}
      <div className="flex items-center justify-center gap-1 mb-8">
        {SCENES.map((sc, i) => (
          <button key={sc.id} onClick={() => go(i)}
            className={`relative px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${i === scene ? "bg-earth text-white" : "text-muted hover:text-earth hover:bg-warm/40"}`}>
            {sc.phase}
            {i === scene && <span className="absolute bottom-0 left-0 h-[2px] bg-sand rounded-full" style={{ width: `${progress * 100}%`, transition: "width 50ms linear" }} />}
          </button>
        ))}
        <button onClick={() => setPlaying(!playing)} className="ml-2 w-7 h-7 rounded-full bg-warm flex items-center justify-center hover:bg-sand/40 transition-colors">
          {playing ? <Pause size={11} className="text-earth" /> : <Play size={11} className="text-earth ml-0.5" />}
        </button>
      </div>

      {/* Title + description centered above visuals */}
      <div className="text-center mb-8">
        <h3 className="text-[24px] sm:text-[28px] text-earth leading-tight mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          {s.title}
        </h3>
        <p className="text-[14px] text-muted leading-relaxed max-w-lg mx-auto">
          {s.description}
        </p>
      </div>

      {/* Phone + Construction site side by side, centered */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
        {/* Phone mockup */}
        <div style={{ width: 210 }} className="shrink-0">
          <div className="rounded-[22px] border-[2.5px] border-earth bg-[#FDF8F0] shadow-[0_12px_40px_rgba(44,24,16,0.1)] overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-2 pb-1">
              <span className="text-[7px] font-medium text-muted">9:41</span>
              <div className="w-14 h-3.5 bg-earth rounded-full" />
              <div className="w-3 h-2 bg-muted/40 rounded-sm" />
            </div>
            <div className="px-3 pt-0.5 pb-1.5 border-b border-sand/30">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-earth flex items-center justify-center">
                  <span className="text-[6px] text-sand font-bold">K</span>
                </div>
                <span className="text-[9px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>{s.phase}</span>
              </div>
            </div>
            <div className="px-3 py-2.5 min-h-[210px]">
              {scene === 0 && <AnalyzeScreen p={progress} />}
              {scene === 1 && <PlanScreen p={progress} />}
              {scene === 2 && <BuildScreen p={progress} />}
              {scene === 3 && <TrackScreen p={progress} />}
              {scene === 4 && <CompleteScreen p={progress} />}
            </div>
            <div className="flex justify-around py-1.5 border-t border-sand/20 bg-white/50">
              {[Target, Home, BarChart3, Users, FileText].map((Icon, i) => (
                <Icon key={i} size={11} className={i === scene ? "text-clay" : "text-sand"} />
              ))}
            </div>
            <div className="flex justify-center pb-1"><div className="w-16 h-0.5 bg-earth rounded-full" /></div>
          </div>
        </div>

        {/* Construction site */}
        <div className="w-full sm:w-auto" style={{ maxWidth: 380 }}>
          <ConstructionSite scene={scene} p={progress} />
        </div>
      </div>

      {/* Feature pills centered below */}
      <div className="flex flex-wrap justify-center gap-2">
        {s.highlights.map((h) => (
          <span key={h} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-warm text-[11px] font-medium text-clay">
            <Check size={10} /> {h}
          </span>
        ))}
      </div>
    </div>
  );
}
