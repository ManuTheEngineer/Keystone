"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { PhaseTracker } from "@/components/ui/PhaseTracker";
import { usePWA } from "@/lib/hooks/use-pwa";
import { WifiOff } from "lucide-react";

export default function Home() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { isOnline } = usePWA();

  return (
    <AppShell
      title="Dashboard"
      badge="2 projects"
      badgeVariant="success"
      activeSection={activeSection}
      onNavigate={setActiveSection}
      projectName="Robinson residence"
    >
      {/* Offline indicator */}
      {!isOnline && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-warning-bg text-warning text-[11px]">
          <WifiOff size={14} />
          You are offline. Changes will sync when connection is restored.
        </div>
      )}

      {/* Projects */}
      <SectionLabel>Your projects</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <ProjectCard
          name="Robinson residence"
          details="4 bed / 3 bath / 2,200 sf / Houston, TX"
          phase="Phase 6: Build"
          phaseVariant="warning"
          progress={62}
          budget="$385K"
          spent="$239K"
          duration="8.5 mo"
          progressColor="var(--color-success)"
        />
        <ProjectCard
          name="Lome rental duplex"
          details="2x 2-bed / 180 m2 / Adidogome, Lome, Togo"
          phase="Phase 2: Land"
          phaseVariant="info"
          progress={18}
          budget="CFA 42M"
          spent="CFA 7.5M"
          duration="7 mo"
          progressColor="var(--color-info)"
        />
      </div>

      {/* Recent Activity */}
      <SectionLabel>Recent activity</SectionLabel>
      <div className="space-y-1.5 mb-5">
        <AlertBanner variant="success">
          Framing inspection passed -- Robinson residence (2 hrs ago)
        </AlertBanner>
        <AlertBanner variant="warning">
          Interior finishes trending 8% over estimate -- review recommended
        </AlertBanner>
        <AlertBanner variant="info">
          Lome duplex: titre foncier verified at DCCFE. Proceed to offer.
        </AlertBanner>
      </div>

      {/* Phase tracker preview */}
      <SectionLabel>Robinson residence progress</SectionLabel>
      <div className="bg-surface border border-border rounded-[var(--radius)] p-4 mb-5">
        <PhaseTracker currentPhase={6} completedPhases={5} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <StatCard value="62%" label="Progress" />
          <StatCard value="$239K" label="Spent of $385K" />
          <StatCard value="Wk 24" label="Of est. 37" />
          <StatCard value="3" label="Open items" />
        </div>
      </div>

      {/* Emerald accent showcase */}
      <SectionLabel>Quick actions</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <QuickActionCard label="Log entry" description="Record today's progress" />
        <QuickActionCard label="Upload photos" description="Add site documentation" />
        <QuickActionCard label="Ask AI" description="Get project guidance" />
        <QuickActionCard label="View budget" description="Track spending" />
      </div>
    </AppShell>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2.5 text-[9px] font-medium uppercase tracking-[2px] text-muted">
      {children}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

interface ProjectCardProps {
  name: string;
  details: string;
  phase: string;
  phaseVariant: "success" | "warning" | "info" | "danger";
  progress: number;
  budget: string;
  spent: string;
  duration: string;
  progressColor: string;
}

function ProjectCard({
  name,
  details,
  phase,
  phaseVariant,
  progress,
  budget,
  spent,
  duration,
  progressColor,
}: ProjectCardProps) {
  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-4 cursor-pointer hover:shadow-[var(--shadow-md)] transition-shadow">
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-[14px] font-semibold text-earth">{name}</h4>
        <Badge variant={phaseVariant}>{phase}</Badge>
      </div>
      <p className="text-[11px] text-muted mb-3">{details}</p>
      <div className="mb-1.5">
        <div className="flex justify-between text-[9px] text-muted mb-1">
          <span>Overall progress</span>
          <span className="font-data">{progress}%</span>
        </div>
        <ProgressBar value={progress} color={progressColor} />
      </div>
      <div className="flex gap-3 mt-3 text-[9px] text-muted">
        <span>Budget: {budget}</span>
        <span>Spent: {spent}</span>
        <span>{duration}</span>
      </div>
    </div>
  );
}

function QuickActionCard({ label, description }: { label: string; description: string }) {
  return (
    <button className="bg-surface border border-border rounded-[var(--radius)] p-3 text-left hover:border-emerald-400 hover:shadow-[var(--shadow-sm)] transition-all group">
      <div className="text-[12px] font-medium text-earth group-hover:text-emerald-700 transition-colors">
        {label}
      </div>
      <div className="text-[9px] text-muted mt-0.5">{description}</div>
    </button>
  );
}
