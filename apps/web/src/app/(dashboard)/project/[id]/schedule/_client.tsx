"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import {
  subscribeToProject,
  subscribeToAllMilestoneProgress,
  subscribeToAllMilestoneDates,
  toggleMilestoneProgress,
  setMilestoneDate,
  type ProjectData,
} from "@/lib/services/project-service";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { PhaseEducationCard } from "@/components/ui/PhaseEducationCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { MilestoneTimeline } from "@/components/charts";
import {
  getMarketData,
  getPhaseDefinition,
  getEducationForPhase,
  PHASE_ORDER,
  PHASE_NAMES,
} from "@keystone/market-data";
import type { Market, ProjectPhase, PhaseDefinition } from "@keystone/market-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/hooks/use-translation";
import {
  Check,
  Circle,
  ChevronRight,
  Shield,
  DollarSign,
  Clock,
  ArrowRight,
  Calendar,
} from "lucide-react";

// French names for Togo/Benin phases
const PHASE_NAMES_FR: Record<ProjectPhase, string> = {
  DEFINE: "Definir",
  FINANCE: "Financer",
  LAND: "Terrain",
  DESIGN: "Concevoir",
  APPROVE: "Approuver",
  ASSEMBLE: "Assembler",
  BUILD: "Construire",
  VERIFY: "Verifier",
  OPERATE: "Exploiter",
};

function isWestAfrican(market: Market): boolean {
  return market === "TOGO" || market === "GHANA" || market === "BENIN";
}

function formatDateCompact(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// --- Shared Milestone List ---

interface MilestoneListCardProps {
  phaseDef: PhaseDefinition;
  phaseKey: string;
  isCompletedPhase: boolean;
  milestoneProgress: boolean[];
  milestoneDates: Record<number, string>;
  onToggleMilestone: (phaseKey: string, milestoneIndex: number, completed: boolean, total: number) => void;
  onDateChange: (phaseKey: string, milestoneIndex: number, date: string | null) => void;
  lastCompletedIndex?: number | null;
  isCurrent?: boolean;
}

function MilestoneListCard({
  phaseDef,
  phaseKey,
  isCompletedPhase,
  milestoneProgress,
  milestoneDates,
  onToggleMilestone,
  onDateChange,
  lastCompletedIndex,
  isCurrent,
}: MilestoneListCardProps) {
  const firstIncomplete = phaseDef.milestones.findIndex(
    (_, idx) => !(milestoneProgress[idx] ?? false)
  );

  return (
    <Card padding="sm">
      <div className="space-y-0">
        {phaseDef.milestones.map((m, i) => {
          const isComplete = isCompletedPhase || (milestoneProgress[i] ?? false);
          const isActive = isCurrent && i === firstIncomplete;
          const justCompleted = lastCompletedIndex === i;
          const dateValue = milestoneDates[i] ?? null;

          return (
            <div
              key={i}
              className={`flex items-center gap-2.5 py-2 px-2 text-[12px] transition-colors duration-500 ${
                i < phaseDef.milestones.length - 1 ? "border-b border-border" : ""
              } ${isActive ? "bg-emerald-50/50 rounded" : ""} ${justCompleted ? "bg-success/20 rounded" : ""}`}
            >
              <button
                onClick={() => {
                  if (!isCompletedPhase) {
                    onToggleMilestone(phaseKey, i, !isComplete, phaseDef.milestones.length);
                  }
                }}
                className={`shrink-0 ${isCompletedPhase ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}`}
                disabled={isCompletedPhase}
              >
                {isComplete ? (
                  <Check size={13} className="text-success" />
                ) : isActive ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                ) : (
                  <Circle size={13} className="text-muted/30" />
                )}
              </button>

              <span className={`flex-1 ${isComplete ? "text-muted line-through" : "text-foreground"}`}>
                {m.name}
              </span>

              <label className="shrink-0 relative group cursor-pointer">
                {dateValue ? (
                  <span className="text-[10px] font-data text-earth bg-surface-alt border border-border px-1.5 py-0.5 rounded">
                    {formatDateCompact(dateValue)}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted/50 flex items-center gap-0.5 hover:text-muted transition-colors">
                    <Calendar size={10} />
                    Set date
                  </span>
                )}
                <input
                  type="date"
                  value={dateValue ?? ""}
                  onChange={(e) => {
                    const val = e.target.value || null;
                    onDateChange(phaseKey, i, val);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>

              {m.requiresInspection && <Badge variant="warning">Inspection</Badge>}
              {m.requiresPayment && m.paymentPct != null && (
                <span className="text-[10px] font-data text-info bg-info-bg px-2 py-0.5 rounded-full">
                  {m.paymentPct}% draw
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// --- Phase Card ---

interface PhaseCardProps {
  phaseDef: PhaseDefinition;
  phaseKey: ProjectPhase;
  market: Market;
  index: number;
  currentPhaseIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  milestoneProgress: boolean[];
  onToggleMilestone: (milestoneIndex: number, completed: boolean) => void;
  milestoneDates: Record<number, string>;
  onDateChange: (milestoneIndex: number, date: string | null) => void;
}

function PhaseCard({
  phaseDef,
  phaseKey,
  market,
  index,
  currentPhaseIndex,
  isExpanded,
  onToggle,
  milestoneProgress,
  onToggleMilestone,
  milestoneDates,
  onDateChange,
}: PhaseCardProps) {
  const isCompleted = index < currentPhaseIndex;
  const isCurrent = index === currentPhaseIndex;
  const isUpcoming = index > currentPhaseIndex;

  const totalMilestones = phaseDef.milestones.length;
  const completedMilestones = isCompleted
    ? totalMilestones
    : milestoneProgress.filter(Boolean).length;
  const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [isExpanded]);

  return (
    <div
      ref={cardRef}
      onClick={onToggle}
      className={`
        shrink-0 rounded-[var(--radius)] border cursor-pointer transition-all duration-300
        ${isCompleted ? "bg-success/5 border-success/30" : ""}
        ${isCurrent ? "border-emerald-500 border-2 shadow-sm shadow-[0_0_15px_rgba(5,150,105,0.15)]" : ""}
        ${isUpcoming ? "bg-surface border-border opacity-60" : ""}
        ${!isCurrent && !isCompleted ? "border-border" : ""}
        ${isExpanded ? "w-[calc(100vw-3rem)] sm:w-[260px]" : "w-[110px] sm:w-[140px]"}
      `}
    >
      {/* Header */}
      <div className={`px-2 py-1.5 ${isExpanded ? "pb-1" : ""}`}>
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[8px] uppercase tracking-wider text-muted font-medium">
            Phase {index}
          </span>
          {isCompleted && <Check size={10} className="text-success" />}
          {isCurrent && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
          )}
        </div>

        <h3 className={`text-[11px] font-semibold leading-tight ${
          isCompleted ? "text-success" : isCurrent ? "text-emerald-700" : "text-foreground"
        }`}>
          {phaseDef.name}
        </h3>

        {isWestAfrican(market) && (
          <p className="text-[8px] text-muted italic">{PHASE_NAMES_FR[phaseKey]}</p>
        )}

        <p className="text-[9px] text-muted font-data mt-0.5">
          {phaseDef.typicalDurationWeeks.min}-{phaseDef.typicalDurationWeeks.max}w
        </p>

        {/* Progress bar */}
        <div className="mt-1">
          <div className="h-1 bg-surface-alt rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isCompleted ? "bg-success" : isCurrent ? "bg-emerald-500" : "bg-muted/20"
              }`}
              style={{ width: `${isCompleted ? 100 : progressPct}%` }}
            />
          </div>
          <p className="text-[8px] text-muted mt-0.5 font-data">
            {completedMilestones}/{totalMilestones}
          </p>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-2 pb-2 border-t border-border pt-1.5 space-y-1 animate-expand">
          {phaseDef.milestones.map((m, mi) => {
            const milestoneComplete = isCompleted || (milestoneProgress[mi] ?? false);
            const dateValue = milestoneDates[mi] ?? null;
            return (
              <div
                key={mi}
                className={`flex items-start gap-1.5 py-0.5 text-[10px] ${
                  mi < phaseDef.milestones.length - 1 ? "border-b border-border/50" : ""
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isCompleted) {
                      onToggleMilestone(mi, !milestoneComplete);
                    }
                  }}
                  className={`shrink-0 mt-0.5 ${isCompleted ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}`}
                  disabled={isCompleted}
                >
                  {milestoneComplete ? (
                    <Check size={10} className="text-success" />
                  ) : (
                    <Circle size={10} className="text-muted/40" />
                  )}
                </button>
                <span className={`flex-1 ${milestoneComplete ? "text-muted line-through" : "text-foreground"}`}>
                  {m.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {dateValue ? (
                    <span className="text-[8px] font-data text-muted">{formatDateCompact(dateValue)}</span>
                  ) : null}
                  {m.requiresInspection && (
                    <Shield size={9} className="text-warning" />
                  )}
                  {m.requiresPayment && m.paymentPct != null && (
                    <span className="text-[8px] font-data text-info flex items-center gap-0.5">
                      <DollarSign size={7} />
                      {m.paymentPct}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// === Main Schedule Client ===

export function ScheduleClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [allMilestoneProgress, setAllMilestoneProgress] = useState<Record<string, boolean[]>>({});
  const [allMilestoneDates, setAllMilestoneDates] = useState<Record<string, Record<number, string>>>({});
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [lastCompletedIndex, setLastCompletedIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsubs = [
      subscribeToProject(user.uid, projectId, setProject),
      subscribeToAllMilestoneProgress(user.uid, projectId, setAllMilestoneProgress),
      subscribeToAllMilestoneDates(user.uid, projectId, setAllMilestoneDates),
    ];
    return () => unsubs.forEach((u) => u());
  }, [user, projectId]);

  useEffect(() => {
    if (project) {
      setTopbar(project.name, `${t("project.schedule")} — Week ${project.currentWeek} of ${project.totalWeeks}`, "info");
    }
  }, [project, setTopbar]);

  const handleToggleMilestone = useCallback(
    async (phaseKey: string, milestoneIndex: number, completed: boolean, totalMilestones: number) => {
      if (!user) return;
      try {
        await toggleMilestoneProgress(user.uid, projectId, phaseKey, milestoneIndex, completed, totalMilestones);

        if (completed) {
          setLastCompletedIndex(milestoneIndex);
          setTimeout(() => setLastCompletedIndex(null), 1500);

          // Check if all milestones in this phase are now complete
          const currentProgress = allMilestoneProgress[phaseKey] ?? [];
          const updatedProgress = [...currentProgress];
          while (updatedProgress.length < totalMilestones) updatedProgress.push(false);
          updatedProgress[milestoneIndex] = true;
          const allDone = updatedProgress.length === totalMilestones && updatedProgress.every(Boolean);

          if (allDone) {
            const pDef = getPhaseDefinition(market, phaseKey as ProjectPhase);
            const phaseName = pDef?.name ?? phaseKey;
            setCompletionMessage(`All milestones complete for ${phaseName}. You can advance to the next phase from the Overview page.`);
            setTimeout(() => setCompletionMessage(null), 6000);
          }
        }
      } catch {
        showToast("Failed to update milestone", "error");
      }
    },
    [user, projectId, allMilestoneProgress, project, showToast]
  );

  const handleDateChange = useCallback(
    async (phaseKey: string, milestoneIndex: number, date: string | null) => {
      if (!user) return;
      try {
        await setMilestoneDate(user.uid, projectId, phaseKey, milestoneIndex, date);
      } catch {
        showToast("Failed to update milestone date", "error");
      }
    },
    [user, projectId, showToast]
  );

  if (!project) return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-sand border-t-clay animate-spin mb-3" />
      <p className="text-[12px] text-muted">Loading schedule...</p>
    </div>
  );

  const market = project.market as Market;
  const marketData = getMarketData(market);
  const phases = marketData.phases;
  const currentPhaseIndex = project.currentPhase;
  const currentPhaseKey = PHASE_ORDER[currentPhaseIndex] ?? "BUILD";

  // Auto-expand current phase on load
  const effectiveExpanded = expandedPhase ?? currentPhaseKey;

  // Total timeline
  const totalMinWeeks = phases.reduce((sum, p) => sum + p.typicalDurationWeeks.min, 0);
  const totalMaxWeeks = phases.reduce((sum, p) => sum + p.typicalDurationWeeks.max, 0);

  // Construction method label
  const constructionMethod = phases[0]?.constructionMethod ?? "Standard construction";

  // Milestone timeline data for expanded phase using real progress
  const expandedPhaseDef = getPhaseDefinition(market, effectiveExpanded as ProjectPhase);
  const expandedPhaseProgress = allMilestoneProgress[effectiveExpanded] ?? [];
  const expandedPhaseIndex = PHASE_ORDER.indexOf(effectiveExpanded as ProjectPhase);
  const isExpandedCompleted = expandedPhaseIndex < currentPhaseIndex;
  const isExpandedCurrent = effectiveExpanded === currentPhaseKey;

  const milestoneTimelineData = expandedPhaseDef
    ? expandedPhaseDef.milestones.map((m, i) => {
        const isComplete = isExpandedCompleted || (expandedPhaseProgress[i] ?? false);
        const firstIncomplete = isExpandedCompleted
          ? -1
          : expandedPhaseDef.milestones.findIndex(
              (_, idx) => !(expandedPhaseProgress[idx] ?? false)
            );
        return {
          name: m.name,
          status: (isComplete ? "completed" : i === firstIncomplete ? "current" : "upcoming") as "completed" | "current" | "upcoming",
          paymentPct: m.paymentPct,
        };
      })
    : [];

  const expandedEducation = !isExpandedCurrent
    ? getEducationForPhase(market, effectiveExpanded as ProjectPhase)
    : null;

  return (
    <div className="space-y-3">
      <PageHeader
        title={t("project.schedule")}
        projectName={project.name}
        projectId={projectId}
        subtitle="Construction timeline"
        action={{
          label: "Add to Calendar",
          onClick: () => {
            import("@/lib/services/calendar-service").then(({ generateICSCalendar, downloadICS }) => {
              // Collect all milestones with dates
              const events: { title: string; description: string; startDate: Date; allDay: boolean }[] = [];
              for (const [phaseKey, dates] of Object.entries(allMilestoneDates)) {
                const pDef = getPhaseDefinition(market, phaseKey as ProjectPhase);
                if (!pDef) continue;
                for (const [idxStr, dateStr] of Object.entries(dates as Record<string, string>)) {
                  const idx = Number(idxStr);
                  const milestone = pDef.milestones[idx];
                  if (milestone && dateStr) {
                    events.push({
                      title: `[${project.name}] ${milestone.name}`,
                      description: `Phase: ${pDef.name}. ${milestone.paymentPct ? `Payment: ${milestone.paymentPct}%` : ""}`,
                      startDate: new Date(dateStr),
                      allDay: true,
                    });
                  }
                }
              }
              if (events.length === 0) {
                showToast("No milestone dates set. Set dates on milestones first.", "info");
                return;
              }
              const ics = generateICSCalendar(events, `${project.name} - Construction Schedule`);
              downloadICS(ics, `${project.name}-schedule.ics`);
              showToast(`${events.length} milestone(s) exported to calendar.`, "success");
            });
          },
          icon: <Calendar size={16} />,
        }}
      />

      {/* KPI strip: market, method, timeline */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Badge variant={isWestAfrican(market) ? "warning" : "info"}>
            {market}
          </Badge>
          <span className="text-[10px] text-muted">{constructionMethod}</span>
        </div>
        <span className="text-[10px] font-data text-muted flex items-center gap-1">
          <Clock size={11} className="text-muted/60" />
          {totalMinWeeks}-{totalMaxWeeks} weeks total
        </span>
      </div>

      {/* Phase cards timeline -- horizontal scroll */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-sand/30 scroll-touch"
        >
          {phases.map((phaseDef, i) => {
            const phaseKey = PHASE_ORDER[i];
            const phaseProgress = allMilestoneProgress[phaseKey] ?? [];
            return (
              <PhaseCard
                key={phaseKey}
                phaseDef={phaseDef}
                phaseKey={phaseKey}
                market={market}
                index={i}
                currentPhaseIndex={currentPhaseIndex}
                isExpanded={effectiveExpanded === phaseKey}
                onToggle={() =>
                  setExpandedPhase(effectiveExpanded === phaseKey ? null : phaseKey)
                }
                milestoneProgress={phaseProgress}
                onToggleMilestone={(mi, completed) =>
                  handleToggleMilestone(phaseKey, mi, completed, phaseDef.milestones.length)
                }
                milestoneDates={allMilestoneDates[phaseKey] ?? {}}
                onDateChange={(mi, date) => handleDateChange(phaseKey, mi, date)}
              />
            );
          })}
        </div>

        {/* Scroll hint */}
        <div className="absolute right-0 top-0 bottom-1.5 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none flex items-center justify-end pr-0.5">
          <ArrowRight size={12} className="text-muted/40" />
        </div>
      </div>

      {/* Milestone detail for expanded phase (shared for current and non-current) */}
      {expandedPhaseDef && (
        <div className="space-y-3">
          <SectionLabel>
            Milestone detail: {expandedPhaseDef.name}
          </SectionLabel>

          <MilestoneTimeline milestones={milestoneTimelineData} />

          {/* Phase completion message */}
          {completionMessage && isExpandedCurrent && (
            <div className="p-3 rounded-[var(--radius)] bg-success/10 border border-success/30 text-[12px] text-success leading-relaxed animate-expand">
              {completionMessage}
            </div>
          )}

          <MilestoneListCard
            phaseDef={expandedPhaseDef}
            phaseKey={effectiveExpanded}
            isCompletedPhase={isExpandedCompleted}
            milestoneProgress={expandedPhaseProgress}
            milestoneDates={allMilestoneDates[effectiveExpanded] ?? {}}
            onToggleMilestone={handleToggleMilestone}
            onDateChange={handleDateChange}
            lastCompletedIndex={isExpandedCurrent ? lastCompletedIndex : undefined}
            isCurrent={isExpandedCurrent}
          />

          {/* Education card only for non-current expanded phase */}
          {expandedEducation && <PhaseEducationCard module={expandedEducation} />}
        </div>
      )}
    </div>
  );
}
