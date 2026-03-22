"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
// EmptyState removed — using subtle inline text instead
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTopbar } from "../../../layout";
import {
  subscribeToProject,
  subscribeToInspectionResults,
  addInspectionResult,
  updateInspectionResult,
  type ProjectData,
  type InspectionResultData,
} from "@/lib/services/project-service";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/hooks/use-translation";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
// AlertBanner removed — education blocks removed
import { InspectionChecklist } from "@/components/ui/InspectionChecklist";
import {
  getInspectionsForPhase,
  getMarketData,
  PHASE_ORDER,
  PHASE_NAMES,
} from "@keystone/market-data";
import type { Market, ProjectPhase, InspectionRequirement } from "@keystone/market-data";

export function InspectionsClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const { t } = useTranslation();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [results, setResults] = useState<InspectionResultData[]>([]);
  const { showToast } = useToast();
  const [expandedUpcoming, setExpandedUpcoming] = useState<string | null>(null);
  const [expandedCompleted, setExpandedCompleted] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribeToProject(user.uid, projectId, setProject);
    const unsub2 = subscribeToInspectionResults(user.uid, projectId, setResults);
    return () => {
      unsub1();
      unsub2();
    };
  }, [user, projectId]);

  const market = (project?.market ?? "USA") as Market;
  const currentPhaseIndex = project?.currentPhase ?? 0;
  const currentPhaseKey = PHASE_ORDER[currentPhaseIndex] ?? "DEFINE";

  // Group inspections by phase category: completed, current, upcoming
  const { completedPhases, currentPhaseInspections, upcomingPhases } = useMemo(() => {
    const completed: { phase: ProjectPhase; inspections: InspectionRequirement[] }[] = [];
    const upcoming: { phase: ProjectPhase; inspections: InspectionRequirement[] }[] = [];
    let current: InspectionRequirement[] = [];

    for (let i = 0; i < PHASE_ORDER.length; i++) {
      const phase = PHASE_ORDER[i];
      const inspections = getInspectionsForPhase(market, phase);
      if (inspections.length === 0) continue;

      if (i < currentPhaseIndex) {
        completed.push({ phase, inspections });
      } else if (i === currentPhaseIndex) {
        current = inspections;
      } else {
        upcoming.push({ phase, inspections });
      }
    }

    return {
      completedPhases: completed,
      currentPhaseInspections: current,
      upcomingPhases: upcoming,
    };
  }, [market, currentPhaseIndex]);

  // Build completedItems map from Firebase results for current phase
  const completedItems = useMemo(() => {
    const map: Record<string, boolean[]> = {};
    for (const result of results) {
      if (result.inspectionId && result.completedItems) {
        map[result.inspectionId] = result.completedItems;
      }
    }
    return map;
  }, [results]);

  // Count stats
  const totalCurrentItems = currentPhaseInspections.reduce(
    (sum, insp) => sum + insp.checklistItems.length,
    0
  );
  const completedCurrentItems = currentPhaseInspections.reduce((sum, insp) => {
    const items = completedItems[insp.id] ?? [];
    return sum + items.filter(Boolean).length;
  }, 0);
  const passedCount = currentPhaseInspections.filter((insp) => {
    const items = completedItems[insp.id] ?? [];
    return items.length === insp.checklistItems.length && items.every(Boolean);
  }).length;

  useEffect(() => {
    setTopbar(
      project?.name || t("project.inspections"),
      `${t("project.inspections")} — ${currentPhaseInspections.length > 0
        ? `${passedCount}/${currentPhaseInspections.length} passed`
        : "No inspections"}`,
      passedCount === currentPhaseInspections.length && currentPhaseInspections.length > 0
        ? "success"
        : "info"
    );
  }, [setTopbar, passedCount, currentPhaseInspections]);

  async function handleToggle(inspectionId: string, itemIndex: number) {
    const inspection = currentPhaseInspections.find((i) => i.id === inspectionId);
    if (!inspection || !user) return;

    const existing = results.find((r) => r.inspectionId === inspectionId);
    const currentItems = existing?.completedItems
      ? [...existing.completedItems]
      : new Array(inspection.checklistItems.length).fill(false);

    // Ensure array is correct length
    while (currentItems.length < inspection.checklistItems.length) {
      currentItems.push(false);
    }

    currentItems[itemIndex] = !currentItems[itemIndex];
    const allPassed =
      currentItems.length === inspection.checklistItems.length && currentItems.every(Boolean);

    // Optimistic update — immediately reflect in UI
    setResults((prev) => {
      if (existing?.id) {
        return prev.map((r) =>
          r.id === existing.id
            ? { ...r, completedItems: currentItems, passed: allPassed }
            : r
        );
      }
      // Add new optimistic result
      return [...prev, {
        id: `temp-${inspectionId}`,
        projectId,
        inspectionId,
        phase: currentPhaseKey,
        completedItems: currentItems,
        passed: allPassed,
        updatedAt: new Date().toISOString(),
      }];
    });

    try {
      if (existing?.id && !existing.id.startsWith("temp-")) {
        await updateInspectionResult(user.uid, projectId, existing.id, {
          completedItems: currentItems,
          passed: allPassed,
          completedAt: allPassed ? new Date().toISOString() : undefined,
        });
      } else {
        await addInspectionResult(user.uid, {
          projectId,
          inspectionId,
          phase: currentPhaseKey,
          completedItems: currentItems,
          passed: allPassed,
          completedAt: allPassed ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch {
      showToast("Failed to save inspection result", "error");
      // Revert optimistic update — Firebase subscription will restore correct state
    }
  }

  const pendingCount = currentPhaseInspections.length - passedCount;

  return (
    <>
      <PageHeader
        title={t("project.inspections")}
        projectName={project?.name}
        projectId={projectId}
      />

      {/* Summary stat bar */}
      <div className="flex items-center gap-4 mb-4 px-3 py-2.5 rounded-[var(--radius)] bg-warm border border-sand/30">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-earth font-data font-medium">{passedCount}</span>
          <span className="text-muted">passed</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-earth font-data font-medium">{pendingCount}</span>
          <span className="text-muted">pending</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-muted" />
          <span className="text-earth font-data font-medium">{currentPhaseInspections.length}</span>
          <span className="text-muted">total</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="px-2.5 py-1.5 rounded-[var(--radius)] border border-border bg-surface">
          <p className="text-[9px] text-muted uppercase tracking-wide">This phase</p>
          <p className="text-[13px] font-semibold text-earth font-data">{currentPhaseInspections.length}</p>
        </div>
        <div className="px-2.5 py-1.5 rounded-[var(--radius)] border border-border bg-surface">
          <p className="text-[9px] text-muted uppercase tracking-wide">Items done</p>
          <p className="text-[13px] font-semibold text-earth font-data">{completedCurrentItems}/{totalCurrentItems}</p>
        </div>
        <div className="px-2.5 py-1.5 rounded-[var(--radius)] border border-border bg-surface">
          <p className="text-[9px] text-muted uppercase tracking-wide">Passed</p>
          <p className="text-[13px] font-semibold text-success font-data">{passedCount}/{currentPhaseInspections.length}</p>
        </div>
      </div>

      {/* Current phase inspections — only show if there are inspections */}
      {currentPhaseInspections.length > 0 && (
        <>
          <SectionLabel>
            Current phase: {PHASE_NAMES[currentPhaseKey]} inspections
          </SectionLabel>
          <div className="mb-5">
            <InspectionChecklist
              inspections={currentPhaseInspections}
              completedItems={completedItems}
              onToggle={handleToggle}
            />
          </div>
        </>
      )}

      {currentPhaseInspections.length === 0 && (
        <p className="text-[11px] text-muted mb-4">No inspections for this phase.</p>
      )}

      {/* Completed phases */}
      {completedPhases.length > 0 && (
        <>
          <SectionLabel>Completed phases</SectionLabel>
          <div className="space-y-2 mb-5">
            {completedPhases.map(({ phase, inspections }) => {
              const isExpanded = expandedCompleted === phase;
              const phaseResults = results.filter((r) => r.phase === phase);
              const phasePassed = phaseResults.filter((r) => r.passed).length;

              return (
                <Card key={phase} padding="sm">
                  <button
                    onClick={() => setExpandedCompleted(isExpanded ? null : phase)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown size={14} className="text-muted" />
                      ) : (
                        <ChevronRight size={14} className="text-muted" />
                      )}
                      <span className="text-[12px] font-medium text-earth">
                        {PHASE_NAMES[phase]}
                      </span>
                      <Badge variant="success">
                        {phasePassed}/{inspections.length} passed
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted font-data">
                      {inspections.length} inspection{inspections.length !== 1 ? "s" : ""}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-border">
                      {inspections.map((insp) => {
                        const result = phaseResults.find((r) => r.inspectionId === insp.id);
                        return (
                          <div
                            key={insp.id}
                            className="flex items-center justify-between py-1.5 text-[11px]"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-muted">{insp.name}</span>
                              <Badge variant={insp.formal ? "info" : "emerald"}>
                                {insp.formal ? "Formal" : "Informal"}
                              </Badge>
                            </div>
                            <Badge variant={result?.passed ? "success" : "warning"}>
                              {result?.passed ? "Passed" : "Incomplete"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Upcoming phases */}
      {upcomingPhases.length > 0 && (
        <>
          <SectionLabel>Upcoming phases</SectionLabel>
          <div className="space-y-2 mb-5">
            {upcomingPhases.map(({ phase, inspections }) => {
              const isExpanded = expandedUpcoming === phase;

              return (
                <Card key={phase} padding="sm" className="opacity-60">
                  <button
                    onClick={() => setExpandedUpcoming(isExpanded ? null : phase)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown size={14} className="text-muted" />
                      ) : (
                        <ChevronRight size={14} className="text-muted" />
                      )}
                      <span className="text-[12px] font-medium text-earth">
                        {PHASE_NAMES[phase]}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted font-data">
                      {inspections.length} inspection{inspections.length !== 1 ? "s" : ""}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-border">
                      {inspections.map((insp) => (
                        <div
                          key={insp.id}
                          className="flex items-center justify-between py-1.5 text-[11px]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted">{insp.name}</span>
                            <Badge variant={insp.formal ? "info" : "emerald"}>
                              {insp.formal ? "Formal" : "Informal"}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-muted">Upcoming</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}

    </>
  );
}
