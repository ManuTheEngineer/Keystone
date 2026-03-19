"use client";

import { useState, useEffect, useRef } from "react";
import {
  Target, MapPin, Home, DollarSign, TrendingUp, Check, CheckCircle2,
  Camera, Users, FileText, Shield, Clock, BarChart3, ArrowRight, Play, Pause,
} from "lucide-react";

// ============================================================================
// Scene definitions
// ============================================================================

interface Scene {
  id: string;
  phase: string;
  title: string;
  description: string;
}

const SCENES: Scene[] = [
  { id: "analyze", phase: "Analyze", title: "Evaluate your deal", description: "Run the numbers before you commit. Get a deal score, cost breakdown, and risk analysis for any market." },
  { id: "plan", phase: "Plan", title: "Set up your project", description: "Define your vision, set a budget, and get a structured plan with tasks, milestones, and timelines." },
  { id: "build", phase: "Build", title: "Manage construction", description: "Assign tasks to contractors, track progress with photos, and approve work as it gets done." },
  { id: "track", phase: "Track", title: "Control your budget", description: "Monitor spending against estimates, get alerts on overruns, and keep every dollar accounted for." },
  { id: "complete", phase: "Complete", title: "Move in with confidence", description: "Final inspections, punch list resolution, and a complete record of your entire build." },
];

const SCENE_DURATION = 4000; // ms per scene

// ============================================================================
// Animated mockup screens
// ============================================================================

function AnalyzeScreen({ progress }: { progress: number }) {
  const score = Math.min(78, Math.round(progress * 78));
  const r = 32, stroke = 5, circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <div className="space-y-3">
      {/* Score */}
      <div className="flex items-center gap-4">
        <div className="relative" style={{ width: 80, height: 80 }}>
          <svg width={80} height={80} viewBox="0 0 80 80" className="-rotate-90">
            <circle cx={40} cy={40} r={r} fill="none" stroke="#F5E6D3" strokeWidth={stroke} />
            <circle cx={40} cy={40} r={r} fill="none" stroke="#2D6A4F" strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={`${dash} ${circ - dash}`} style={{ transition: "stroke-dasharray 0.8s ease-out" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[18px] font-bold font-data text-[#2C1810]">{score}</span>
            <span className="text-[7px] text-[#6A6A6A] uppercase">Score</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between text-[8px]">
            <span className="text-[#6A6A6A]">Total cost</span>
            <span className="font-data font-semibold text-[#2C1810]">${(Math.round(progress * 342)).toLocaleString()}K</span>
          </div>
          <div className="flex justify-between text-[8px]">
            <span className="text-[#6A6A6A]">Per sqft</span>
            <span className="font-data font-semibold text-[#2C1810]">${Math.round(progress * 190)}</span>
          </div>
          <div className="flex justify-between text-[8px]">
            <span className="text-[#6A6A6A]">Monthly</span>
            <span className="font-data font-semibold text-[#8B4513]">${(Math.round(progress * 2280)).toLocaleString()}</span>
          </div>
        </div>
      </div>
      {/* Cost bars */}
      <div className="space-y-1">
        {[
          { label: "Construction", pct: 62, color: "#2D6A4F" },
          { label: "Land", pct: 18, color: "#8B4513" },
          { label: "Soft costs", pct: 10, color: "#1B4965" },
          { label: "Contingency", pct: 10, color: "#D4A574" },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <span className="text-[7px] text-[#6A6A6A] w-16 text-right">{b.label}</span>
            <div className="flex-1 h-2 bg-[#F5E6D3] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${b.pct * progress}%`, backgroundColor: b.color, transition: "width 1s ease-out" }} />
            </div>
            <span className="text-[7px] font-data text-[#2C1810] w-6">{Math.round(b.pct * progress)}%</span>
          </div>
        ))}
      </div>
      {/* Risk flag */}
      <div className="flex items-start gap-1.5 px-2 py-1.5 bg-[#FFF3CD] rounded-lg" style={{ opacity: progress > 0.6 ? 1 : 0, transition: "opacity 0.5s" }}>
        <Shield size={10} className="text-[#BC6C25] mt-0.5 shrink-0" />
        <p className="text-[7px] text-[#8B4513] leading-relaxed">Down payment below 20%. PMI may be required.</p>
      </div>
    </div>
  );
}

function PlanScreen({ progress }: { progress: number }) {
  const tasks = [
    { label: "Define building goal", done: progress > 0.15 },
    { label: "Select target market", done: progress > 0.3 },
    { label: "Set build location", done: progress > 0.45 },
    { label: "Choose property type", done: progress > 0.6 },
    { label: "Review initial budget", done: progress > 0.75 },
    { label: "Confirm financing", done: progress > 0.9 },
  ];
  const doneCount = tasks.filter((t) => t.done).length;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold text-[#2C1810]">Phase 0: Define</span>
        <span className="text-[8px] font-data text-[#8B4513]">{doneCount}/{tasks.length}</span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 bg-[#F5E6D3] rounded-full overflow-hidden">
        <div className="h-full bg-[#2D6A4F] rounded-full" style={{ width: `${(doneCount / tasks.length) * 100}%`, transition: "width 0.5s ease-out" }} />
      </div>
      {/* Tasks */}
      <div className="space-y-1">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: t.done ? "#F0FDF4" : "#FDF8F0", transition: "background-color 0.3s" }}>
            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${t.done ? "bg-[#2D6A4F] border-[#2D6A4F]" : "border-[#D4A574]"}`}
              style={{ transition: "all 0.3s" }}>
              {t.done && <Check size={8} className="text-white" />}
            </div>
            <span className={`text-[8px] ${t.done ? "text-[#6A6A6A] line-through" : "text-[#2C1810] font-medium"}`} style={{ transition: "all 0.3s" }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuildScreen({ progress }: { progress: number }) {
  const tasks = [
    { label: "Foundation inspection", contractor: "ABC Builders", status: progress > 0.3 ? "done" : progress > 0.1 ? "review" : "active" },
    { label: "Framing complete", contractor: "Steel & Sons", status: progress > 0.7 ? "done" : progress > 0.5 ? "review" : progress > 0.3 ? "active" : "upcoming" },
    { label: "Rough plumbing", contractor: "AquaFlow", status: progress > 0.9 ? "review" : progress > 0.7 ? "active" : "upcoming" },
    { label: "Electrical rough-in", contractor: "VoltPro", status: "upcoming" },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold text-[#2C1810]">Phase 6: Build</span>
        <div className="flex items-center gap-1">
          <Camera size={9} className="text-[#8B4513]" />
          <span className="text-[7px] text-[#8B4513]">12 photos</span>
        </div>
      </div>
      <div className="space-y-1">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-2 rounded-lg border" style={{
            borderColor: t.status === "review" ? "#BC6C25" : t.status === "done" ? "#2D6A4F" : "#F5E6D3",
            backgroundColor: t.status === "done" ? "#F0FDF4" : t.status === "review" ? "#FFF8F0" : "#FFFFFF",
            opacity: t.status === "upcoming" ? 0.5 : 1,
            transition: "all 0.5s",
          }}>
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
              t.status === "done" ? "bg-[#2D6A4F]" : t.status === "review" ? "bg-[#BC6C25]" : t.status === "active" ? "bg-[#8B4513]/20" : "bg-[#F5E6D3]"
            }`} style={{ transition: "all 0.4s" }}>
              {t.status === "done" && <Check size={8} className="text-white" />}
              {t.status === "review" && <Clock size={7} className="text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] font-medium text-[#2C1810] truncate">{t.label}</p>
              <p className="text-[6px] text-[#6A6A6A]">{t.contractor}</p>
            </div>
            {t.status === "review" && <span className="text-[6px] px-1.5 py-0.5 rounded-full bg-[#BC6C25]/10 text-[#BC6C25] font-medium">Review</span>}
            {t.status === "done" && <span className="text-[6px] px-1.5 py-0.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] font-medium">Approved</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackScreen({ progress }: { progress: number }) {
  const spent = Math.round(progress * 186000);
  const budget = 342000;
  const pct = Math.round((spent / budget) * 100);
  const categories = [
    { label: "Foundation", est: 34200, actual: Math.round(progress * 32800) },
    { label: "Framing", est: 51300, actual: Math.round(progress * 49100) },
    { label: "Plumbing", est: 27360, actual: Math.round(Math.min(progress * 1.1, 1) * 29200) },
    { label: "Electrical", est: 23940, actual: Math.round(progress * 18200) },
  ];
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold text-[#2C1810]">Budget</span>
        <span className="text-[8px] font-data text-[#6A6A6A]">{pct}% spent</span>
      </div>
      <div className="h-2 bg-[#F5E6D3] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct > 85 ? "#9B2226" : pct > 70 ? "#BC6C25" : "#2D6A4F", transition: "all 0.8s" }} />
      </div>
      <div className="flex justify-between text-[7px]">
        <span className="text-[#6A6A6A]">Spent: <span className="font-data font-semibold text-[#2C1810]">${(spent).toLocaleString()}</span></span>
        <span className="text-[#6A6A6A]">Remaining: <span className="font-data font-semibold text-[#2D6A4F]">${(budget - spent).toLocaleString()}</span></span>
      </div>
      <div className="space-y-0.5">
        {categories.map((c) => {
          const over = c.actual > c.est;
          return (
            <div key={c.label} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#FDF8F0]">
              <span className="text-[7px] text-[#6A6A6A] w-14">{c.label}</span>
              <div className="flex-1 h-1.5 bg-[#F5E6D3] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, (c.actual / c.est) * 100)}%`, backgroundColor: over ? "#9B2226" : "#2D6A4F", transition: "width 0.6s" }} />
              </div>
              <span className={`text-[7px] font-data w-12 text-right ${over ? "text-[#9B2226] font-semibold" : "text-[#2C1810]"}`}>
                ${(c.actual / 1000).toFixed(1)}K
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompleteScreen({ progress }: { progress: number }) {
  const items = [
    { label: "Final walkthrough inspection", done: progress > 0.2 },
    { label: "Punch list items resolved (8/8)", done: progress > 0.4 },
    { label: "Certificate of occupancy", done: progress > 0.6 },
    { label: "Contractor final payments released", done: progress > 0.75 },
    { label: "Project documentation archived", done: progress > 0.9 },
  ];
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center">
          <CheckCircle2 size={16} className="text-[#2D6A4F]" style={{ opacity: progress > 0.95 ? 1 : 0.3, transition: "opacity 0.5s" }} />
        </div>
        <div>
          <p className="text-[9px] font-semibold text-[#2C1810]">Project completion</p>
          <p className="text-[7px] text-[#6A6A6A]">{Math.round(progress * 100)}% verified</p>
        </div>
      </div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: item.done ? "#F0FDF4" : "#FDF8F0", transition: "background-color 0.4s" }}>
            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${item.done ? "bg-[#2D6A4F]" : "bg-[#F5E6D3]"}`} style={{ transition: "all 0.3s" }}>
              {item.done && <Check size={7} className="text-white" />}
            </div>
            <span className={`text-[8px] ${item.done ? "text-[#6A6A6A]" : "text-[#2C1810]"}`}>{item.label}</span>
          </div>
        ))}
      </div>
      {progress > 0.95 && (
        <div className="text-center py-2" style={{ animation: "fade-in 0.5s ease-out" }}>
          <p className="text-[10px] font-semibold text-[#2D6A4F]" style={{ fontFamily: "var(--font-heading)" }}>From first idea to final key.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Construction Site SVG -- evolves through phases with animated people
// ============================================================================

function ConstructionSite({ scene, progress }: { scene: number; progress: number }) {
  // Colors
  const sky = "#E8F4FD";
  const ground = "#D4A574";
  const dirt = "#8B6F47";
  const concrete = "#B0B0B0";
  const wood = "#C4924A";
  const roof = "#6B4226";
  const glass = "#87CEEB";
  const wall = "#F5E6D3";

  // Construction progress based on scene
  // 0=analyze(empty lot), 1=plan(stakes), 2=build(walls up), 3=track(roof on), 4=complete(finished)
  const foundationH = scene >= 2 ? 12 : 0;
  const wallH = scene >= 2 ? Math.min(progress * 80, 80) : 0;
  const wallHFull = scene >= 3 ? 80 : wallH;
  const roofShow = scene >= 3 ? Math.min(progress * 1.5, 1) : 0;
  const roofFull = scene >= 4 ? 1 : roofShow;
  const windowShow = scene >= 3 ? Math.min((progress - 0.3) * 2, 1) : 0;
  const windowFull = scene >= 4 ? 1 : Math.max(0, windowShow);
  const paintShow = scene >= 4 ? progress : 0;
  const landscapeShow = scene >= 4 ? Math.max(0, (progress - 0.5) * 2) : 0;

  return (
    <div className="relative">
      <svg viewBox="0 0 300 320" width="300" height="320" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Sky */}
        <rect width="300" height="220" fill={sky} rx="16" />

        {/* Sun */}
        <circle cx="250" cy="45" r="22" fill="#F9D56E" opacity={0.9}>
          <animate attributeName="opacity" values="0.7;0.95;0.7" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* Clouds */}
        <g opacity="0.5">
          <ellipse cx="60" cy="40" rx="28" ry="10" fill="white" />
          <ellipse cx="75" cy="35" rx="20" ry="8" fill="white" />
          <ellipse cx="180" cy="55" rx="22" ry="8" fill="white">
            <animateTransform attributeName="transform" type="translate" values="0,0;15,0;0,0" dur="12s" repeatCount="indefinite" />
          </ellipse>
        </g>

        {/* Ground */}
        <rect x="0" y="200" width="300" height="120" fill={ground} rx="0" />
        <rect x="0" y="200" width="300" height="8" fill={dirt} opacity="0.3" />

        {/* === SCENE 0: Empty lot with survey stakes === */}
        {scene === 0 && (
          <g style={{ opacity: Math.min(progress * 3, 1), transition: "opacity 0.5s" }}>
            {/* Survey stakes */}
            {[80, 120, 160, 200].map((x) => (
              <g key={x}>
                <line x1={x} y1="195" x2={x} y2="210" stroke="#D4553A" strokeWidth="2" />
                <polygon points={`${x - 4},195 ${x + 4},195 ${x},188`} fill="#D4553A" />
              </g>
            ))}
            {/* Dotted outline */}
            <rect x="78" y="160" width="124" height="48" rx="2" fill="none" stroke="#8B4513" strokeWidth="1" strokeDasharray="4 3" opacity={0.6} />
            {/* "For Sale" sign */}
            <rect x="30" y="170" width="35" height="24" rx="2" fill="white" stroke="#8B4513" strokeWidth="1" />
            <line x1="47" y1="194" x2="47" y2="210" stroke="#8B4513" strokeWidth="2" />
            <text x="47" y="180" textAnchor="middle" fill="#8B4513" fontSize="5" fontWeight="bold">FOR</text>
            <text x="47" y="187" textAnchor="middle" fill="#8B4513" fontSize="5" fontWeight="bold">SALE</text>
          </g>
        )}

        {/* === SCENE 1: Planning stakes + blueprint === */}
        {scene === 1 && (
          <g>
            {/* Foundation outline */}
            <rect x="70" y="175" width="140" height="30" rx="2" fill="none" stroke="#1B4965" strokeWidth="1.5" strokeDasharray="6 3" opacity={Math.min(progress * 2, 0.8)} />
            {/* Blueprint on ground */}
            <g style={{ opacity: Math.min(progress * 2, 1), transition: "opacity 0.5s" }}>
              <rect x="85" y="158" width="50" height="35" rx="2" fill="white" stroke="#1B4965" strokeWidth="0.5" transform="rotate(-5, 110, 175)" />
              <line x1="92" y1="165" x2="128" y2="165" stroke="#1B4965" strokeWidth="0.5" transform="rotate(-5, 110, 175)" />
              <line x1="92" y1="170" x2="120" y2="170" stroke="#1B4965" strokeWidth="0.5" transform="rotate(-5, 110, 175)" />
              <rect x="95" y="174" width="20" height="12" rx="1" fill="none" stroke="#1B4965" strokeWidth="0.5" transform="rotate(-5, 110, 175)" />
            </g>
            {/* Measuring tape */}
            <line x1="70" y1="208" x2="210" y2="208" stroke="#D4553A" strokeWidth="1" opacity={Math.min(progress * 3, 0.7)} />
            <text x="140" y="218" textAnchor="middle" fill="#D4553A" fontSize="6" opacity={Math.min(progress * 3, 0.7)}>140 ft</text>
          </g>
        )}

        {/* === SCENE 2+: Foundation === */}
        {scene >= 2 && (
          <rect x="70" y={200 - foundationH} width="140" height={foundationH} fill={concrete} rx="1"
            style={{ transition: "height 0.5s, y 0.5s" }} />
        )}

        {/* === SCENE 2+: Walls going up === */}
        {scene >= 2 && (
          <g>
            {/* Left wall */}
            <rect x="70" y={188 - wallHFull} width="8" height={wallHFull} fill={wall} stroke="#D4A574" strokeWidth="0.5"
              style={{ transition: "height 0.8s, y 0.8s" }} />
            {/* Right wall */}
            <rect x="202" y={188 - wallHFull} width="8" height={wallHFull} fill={wall} stroke="#D4A574" strokeWidth="0.5"
              style={{ transition: "height 0.8s, y 0.8s" }} />
            {/* Back wall */}
            <rect x="70" y={188 - wallHFull} width="140" height="8" fill={wall} stroke="#D4A574" strokeWidth="0.5"
              style={{ transition: "y 0.8s" }} />
            {/* Front wall with door gap */}
            {wallHFull > 30 && (
              <>
                <rect x="70" y="188" width="50" height="8" fill={wall} stroke="#D4A574" strokeWidth="0.5" transform="translate(0, -30)" />
                <rect x="150" y="188" width="60" height="8" fill={wall} stroke="#D4A574" strokeWidth="0.5" transform="translate(0, -30)" />
              </>
            )}
          </g>
        )}

        {/* === SCENE 3+: Roof === */}
        {scene >= 3 && roofFull > 0 && (
          <g style={{ opacity: roofFull, transition: "opacity 0.6s" }}>
            <polygon points="60,108 140,70 220,108" fill={roof} />
            <polygon points="60,108 140,70 140,108" fill={roof} opacity="0.85" />
            {/* Chimney */}
            <rect x="170" y="72" width="10" height="20" fill={concrete} />
          </g>
        )}

        {/* === SCENE 3+: Windows === */}
        {windowFull > 0 && (
          <g style={{ opacity: windowFull, transition: "opacity 0.5s" }}>
            <rect x="88" y="125" width="20" height="22" rx="1" fill={glass} stroke="white" strokeWidth="1.5" />
            <line x1="98" y1="125" x2="98" y2="147" stroke="white" strokeWidth="1" />
            <line x1="88" y1="136" x2="108" y2="136" stroke="white" strokeWidth="1" />

            <rect x="170" y="125" width="20" height="22" rx="1" fill={glass} stroke="white" strokeWidth="1.5" />
            <line x1="180" y1="125" x2="180" y2="147" stroke="white" strokeWidth="1" />
            <line x1="170" y1="136" x2="190" y2="136" stroke="white" strokeWidth="1" />
          </g>
        )}

        {/* === SCENE 3+: Door === */}
        {wallHFull > 50 && (
          <rect x="128" y="155" width="22" height="33" rx="1" fill={scene >= 4 ? "#6B4226" : wood} stroke="#5A3A1A" strokeWidth="0.5"
            style={{ transition: "fill 0.5s" }}>
            {scene >= 4 && <animate attributeName="fill" values="#6B4226;#7B5236;#6B4226" dur="2s" repeatCount="1" />}
          </rect>
        )}
        {/* Door knob */}
        {wallHFull > 50 && <circle cx="145" cy="173" r="1.5" fill="#D4A574" />}

        {/* === SCENE 4: Paint + finishing === */}
        {paintShow > 0 && (
          <g style={{ opacity: paintShow, transition: "opacity 0.8s" }}>
            {/* Painted walls (overlay) */}
            <rect x="71" y="108" width="6" height="80" fill="#FDF8F0" opacity="0.5" />
            <rect x="203" y="108" width="6" height="80" fill="#FDF8F0" opacity="0.5" />
          </g>
        )}

        {/* === SCENE 4: Landscaping === */}
        {landscapeShow > 0 && (
          <g style={{ opacity: landscapeShow, transition: "opacity 0.6s" }}>
            {/* Path to door */}
            <rect x="132" y="200" width="14" height="20" rx="2" fill="#B0B0B0" opacity="0.6" />
            {/* Bushes */}
            <ellipse cx="80" cy="198" rx="12" ry="8" fill="#2D6A4F" />
            <ellipse cx="200" cy="198" rx="12" ry="8" fill="#2D6A4F" />
            <ellipse cx="95" cy="196" rx="8" ry="6" fill="#3A8B5F" />
            {/* Mailbox */}
            <rect x="45" y="190" width="8" height="14" rx="1" fill="#2C1810" />
            <line x1="49" y1="204" x2="49" y2="215" stroke="#2C1810" strokeWidth="2" />
            {/* Fence */}
            {[230, 240, 250, 260].map((x) => (
              <g key={x}>
                <line x1={x} y1="192" x2={x} y2="210" stroke="white" strokeWidth="1.5" />
                <polygon points={`${x - 2},192 ${x + 2},192 ${x},188`} fill="white" />
              </g>
            ))}
            <line x1="228" y1="198" x2="262" y2="198" stroke="white" strokeWidth="1" />
          </g>
        )}

        {/* ====== PEOPLE ====== */}

        {/* Owner -- appears in all scenes */}
        <Person x={scene === 0 ? 240 : scene === 1 ? 35 : scene === 2 ? 240 : scene === 3 ? 30 : 140}
          y={scene === 4 ? 192 : 195}
          shirt="#1B4965" pants="#2C1810" hair="#3A3A3A"
          label={scene <= 1 ? "You" : "Owner"}
          animate={scene === 4}
          flip={scene === 2 || scene === 4} />

        {/* Contractor -- appears in scenes 2-4 */}
        {scene >= 2 && (
          <Person x={scene === 2 ? 140 + Math.round(progress * 20) : scene === 3 ? 160 : 230}
            y={195}
            shirt="#BC6C25" pants="#3A3A3A" hair="#6B4226"
            hardhat
            label="Contractor"
            working={scene === 2 || scene === 3} />
        )}

        {/* Inspector -- appears in scenes 3-4 */}
        {scene >= 3 && scene <= 4 && (
          <Person x={scene === 3 ? 240 : 50}
            y={195}
            shirt="#2D6A4F" pants="#2C1810" hair="#3A3A3A"
            clipboard
            label={scene === 4 ? "Inspector" : "Inspector"}
            flip={scene === 4} />
        )}

        {/* Worker 2 -- scene 2 only */}
        {scene === 2 && progress > 0.3 && (
          <Person x={90} y={195}
            shirt="#D4553A" pants="#3A3A3A" hair="#2C1810"
            hardhat working
            label="" />
        )}

        {/* Phase label */}
        <rect x="10" y="226" width="280" height="24" rx="6" fill="#2C1810" opacity="0.9" />
        <text x="150" y="242" textAnchor="middle" fill="#D4A574" fontSize="9" fontWeight="600" style={{ fontFamily: "var(--font-heading)" }}>
          {scene === 0 ? "Analyzing the deal..." : scene === 1 ? "Planning the build..." : scene === 2 ? "Construction in progress..." : scene === 3 ? "Tracking and inspecting..." : "Project complete!"}
        </text>

        {/* Progress dots */}
        <g>
          {SCENES.map((_, i) => (
            <circle key={i} cx={120 + i * 16} cy="268" r={i === scene ? 4 : 2.5}
              fill={i <= scene ? "#8B4513" : "#D4A574"} style={{ transition: "all 0.3s" }} />
          ))}
        </g>

      </svg>
    </div>
  );
}

// Stick-figure person SVG component
function Person({ x, y, shirt, pants, hair, label, hardhat, clipboard, working, animate, flip }: {
  x: number; y: number; shirt: string; pants: string; hair: string;
  label?: string; hardhat?: boolean; clipboard?: boolean; working?: boolean; animate?: boolean; flip?: boolean;
}) {
  const tx = flip ? -1 : 1;
  return (
    <g transform={`translate(${x}, ${y})`} style={{ transition: "transform 0.8s ease-out" }}>
      {/* Label */}
      {label && (
        <text x={0} y={-32} textAnchor="middle" fill="#6A6A6A" fontSize="6" fontWeight="500">{label}</text>
      )}
      {/* Hard hat */}
      {hardhat && (
        <>
          <ellipse cx={0} cy={-26} rx={6} ry={2.5} fill="#F9D56E" />
          <rect x={-5} y={-29} width={10} height={4} rx={2} fill="#F9D56E" />
        </>
      )}
      {/* Head */}
      <circle cx={0} cy={-22} r={5} fill="#E8C4A0" />
      {/* Hair (if no hardhat) */}
      {!hardhat && <ellipse cx={0} cy={-26} rx={4} ry={2} fill={hair} />}
      {/* Body */}
      <rect x={-5} y={-16} width={10} height={14} rx={2} fill={shirt} />
      {/* Arms */}
      <line x1={-5} y1={-12} x2={-10 * tx} y2={working ? -5 : -2} stroke={shirt} strokeWidth={2.5} strokeLinecap="round">
        {working && <animateTransform attributeName="transform" type="rotate" values="0 -5 -12;-15 -5 -12;0 -5 -12" dur="1.2s" repeatCount="indefinite" />}
      </line>
      <line x1={5} y1={-12} x2={10 * tx} y2={working ? -5 : -2} stroke={shirt} strokeWidth={2.5} strokeLinecap="round">
        {working && <animateTransform attributeName="transform" type="rotate" values="0 5 -12;15 5 -12;0 5 -12" dur="1.2s" repeatCount="indefinite" begin="0.6s" />}
      </line>
      {/* Clipboard */}
      {clipboard && (
        <g transform={`translate(${8 * tx}, -8)`}>
          <rect x={-3} y={-4} width={6} height={8} rx={1} fill="white" stroke="#6A6A6A" strokeWidth={0.5} />
          <line x1={-1} y1={-1} x2={2} y2={-1} stroke="#6A6A6A" strokeWidth={0.5} />
          <line x1={-1} y1={1} x2={2} y2={1} stroke="#6A6A6A" strokeWidth={0.5} />
        </g>
      )}
      {/* Legs */}
      <line x1={-3} y1={-2} x2={-4} y2={8} stroke={pants} strokeWidth={2.5} strokeLinecap="round">
        {animate && <animateTransform attributeName="transform" type="rotate" values="0 -3 -2;5 -3 -2;0 -3 -2" dur="0.8s" repeatCount="3" />}
      </line>
      <line x1={3} y1={-2} x2={4} y2={8} stroke={pants} strokeWidth={2.5} strokeLinecap="round">
        {animate && <animateTransform attributeName="transform" type="rotate" values="0 3 -2;-5 3 -2;0 3 -2" dur="0.8s" repeatCount="3" begin="0.4s" />}
      </line>
      {/* Shoes */}
      <ellipse cx={-4} cy={9} rx={3} ry={1.5} fill="#2C1810" />
      <ellipse cx={4} cy={9} rx={3} ry={1.5} fill="#2C1810" />
    </g>
  );
}

// ============================================================================
// Main Product Demo Component
// ============================================================================

export function ProductDemo() {
  const [activeScene, setActiveScene] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance scenes
  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }

    // Progress ticker (60fps feel)
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(1, p + (1 / (SCENE_DURATION / 50))));
    }, 50);

    // Scene advance
    intervalRef.current = setInterval(() => {
      setActiveScene((s) => (s + 1) % SCENES.length);
      setProgress(0);
    }, SCENE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [playing]);

  const goToScene = (i: number) => {
    setActiveScene(i);
    setProgress(0);
  };

  const scene = SCENES[activeScene];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center">
        {/* Left: Phone mockup */}
        <div className="lg:w-[280px] shrink-0">
          <div className="relative mx-auto" style={{ width: 240 }}>
            {/* Phone frame */}
            <div className="rounded-[28px] border-[3px] border-[#2C1810] bg-[#FDF8F0] shadow-[0_20px_60px_rgba(44,24,16,0.15)] overflow-hidden">
              {/* Status bar */}
              <div className="flex items-center justify-between px-5 pt-2.5 pb-1.5">
                <span className="text-[8px] font-medium text-[#6A6A6A]">9:41</span>
                <div className="w-16 h-4 bg-[#2C1810] rounded-full" />
                <div className="flex gap-0.5">
                  <div className="w-3 h-2 bg-[#6A6A6A] rounded-sm" />
                </div>
              </div>
              {/* App header */}
              <div className="px-4 pt-1 pb-2 border-b border-[#F5E6D3]">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-[#2C1810] flex items-center justify-center">
                    <span className="text-[8px] text-[#D4A574] font-bold">K</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#2C1810]" style={{ fontFamily: "var(--font-heading)" }}>
                    {scene.phase}
                  </span>
                </div>
              </div>
              {/* Screen content */}
              <div className="px-4 py-3 min-h-[260px]">
                {activeScene === 0 && <AnalyzeScreen progress={progress} />}
                {activeScene === 1 && <PlanScreen progress={progress} />}
                {activeScene === 2 && <BuildScreen progress={progress} />}
                {activeScene === 3 && <TrackScreen progress={progress} />}
                {activeScene === 4 && <CompleteScreen progress={progress} />}
              </div>
              {/* Bottom bar */}
              <div className="flex justify-around py-2 border-t border-[#F5E6D3] bg-white/60">
                {[Target, Home, BarChart3, Users, FileText].map((Icon, i) => (
                  <Icon key={i} size={12} className={i === activeScene ? "text-[#8B4513]" : "text-[#D4A574]"} />
                ))}
              </div>
              {/* Home indicator */}
              <div className="flex justify-center pb-1.5">
                <div className="w-20 h-1 bg-[#2C1810] rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Construction site animation */}
        <div className="hidden lg:block lg:w-[300px] shrink-0">
          <ConstructionSite scene={activeScene} progress={progress} />
        </div>

        {/* Right: Scene info + controls */}
        <div className="flex-1 text-center lg:text-left">
          {/* Scene tabs */}
          <div className="flex justify-center lg:justify-start gap-1 mb-6">
            {SCENES.map((s, i) => (
              <button key={s.id} onClick={() => goToScene(i)}
                className="relative px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
                style={{
                  backgroundColor: i === activeScene ? "#2C1810" : "transparent",
                  color: i === activeScene ? "#F5E6D3" : "#6A6A6A",
                }}>
                {s.phase}
                {i === activeScene && (
                  <div className="absolute bottom-0 left-0 h-0.5 bg-[#D4A574] rounded-full" style={{ width: `${progress * 100}%`, transition: "width 50ms linear" }} />
                )}
              </button>
            ))}
            <button onClick={() => setPlaying(!playing)} className="ml-2 w-7 h-7 rounded-full bg-[#F5E6D3] flex items-center justify-center hover:bg-[#D4A574]/30 transition-colors">
              {playing ? <Pause size={11} className="text-[#2C1810]" /> : <Play size={11} className="text-[#2C1810] ml-0.5" />}
            </button>
          </div>

          {/* Active scene description */}
          <h3
            className="text-[24px] sm:text-[28px] text-earth leading-tight mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {scene.title}
          </h3>
          <p className="text-[15px] text-muted leading-relaxed mb-6 max-w-md mx-auto lg:mx-0">
            {scene.description}
          </p>

          {/* Scene-specific highlights */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
            {activeScene === 0 && ["Deal score", "Cost breakdown", "Risk flags", "Cross-market"].map((f) => <FeaturePill key={f}>{f}</FeaturePill>)}
            {activeScene === 1 && ["Auto-tasks", "Budget builder", "Phase tracking", "AI guidance"].map((f) => <FeaturePill key={f}>{f}</FeaturePill>)}
            {activeScene === 2 && ["Contractor portal", "Photo evidence", "Approve/reject", "GPS verified"].map((f) => <FeaturePill key={f}>{f}</FeaturePill>)}
            {activeScene === 3 && ["Live tracking", "Overrun alerts", "Category drill-down", "Export reports"].map((f) => <FeaturePill key={f}>{f}</FeaturePill>)}
            {activeScene === 4 && ["Final inspection", "Punch list", "Document archive", "Handover ready"].map((f) => <FeaturePill key={f}>{f}</FeaturePill>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturePill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-warm text-[11px] font-medium text-clay">
      <Check size={10} />
      {children}
    </span>
  );
}
