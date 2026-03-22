"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus, Camera, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTopbar } from "../../../layout";
import {
  ref,
  push,
  set,
  onValue,
  type Unsubscribe,
} from "firebase/database";
import { db } from "@/lib/firebase";
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
import { Badge } from "@/components/ui/Badge";
import {
  getInspectionsForPhase,
  PHASE_ORDER,
  PHASE_NAMES,
} from "@keystone/market-data";
import type { Market, ProjectPhase, InspectionRequirement } from "@keystone/market-data";

// --- Types for local state ---

type InspectionStatus = "passed" | "failed" | "conditional" | "scheduled" | "pending";

interface RecordFormState {
  result: "passed" | "failed" | "conditional";
  inspectorName: string;
  date: string;
  notes: string;
}

interface CustomInspection {
  id: string;
  name: string;
  type: "formal" | "informal";
  phase: ProjectPhase;
}

// --- Helpers ---

function getStatusForInspection(
  inspection: InspectionRequirement,
  result: InspectionResultData | undefined
): InspectionStatus {
  if (!result) return "pending";
  if (result.passed) return "passed";
  if (result.notes?.startsWith("[CONDITIONAL]")) return "conditional";
  if (result.completedItems?.some(Boolean) && !result.passed) return "failed";
  if (result.completedAt) return result.passed ? "passed" : "failed";
  return "pending";
}

function statusDotColor(status: InspectionStatus): string {
  switch (status) {
    case "passed": return "bg-success";
    case "failed": return "bg-danger";
    case "conditional": return "bg-warning";
    case "scheduled": return "bg-yellow-400";
    case "pending": return "bg-gray-300";
  }
}

function statusLabel(status: InspectionStatus): string {
  switch (status) {
    case "passed": return "Passed";
    case "failed": return "Failed";
    case "conditional": return "Conditional";
    case "scheduled": return "Scheduled";
    case "pending": return "Not scheduled";
  }
}

const WA_MARKETS: Market[] = ["TOGO", "GHANA", "BENIN"];

// ============================================================
// Component
// ============================================================

export function InspectionsClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const { t } = useTranslation();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [results, setResults] = useState<InspectionResultData[]>([]);
  const { showToast } = useToast();

  // UI state
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhase | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [recordForm, setRecordForm] = useState<RecordFormState>({
    result: "passed",
    inspectorName: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customInspections, setCustomInspections] = useState<CustomInspection[]>([]);
  const [addForm, setAddForm] = useState({ name: "", type: "informal" as "formal" | "informal", phase: "" as ProjectPhase | "" });

  // --- Data subscriptions ---

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribeToProject(user.uid, projectId, setProject);
    const unsub2 = subscribeToInspectionResults(user.uid, projectId, setResults);
    // Subscribe to custom inspections from Firebase
    const customRef = ref(db, `users/${user.uid}/projects/${projectId}/customInspections`);
    const unsub3 = onValue(customRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setCustomInspections([]);
        return;
      }
      const items: CustomInspection[] = Object.entries(data).map(([key, val]: [string, any]) => ({
        id: val.id ?? key,
        name: val.name,
        type: val.type,
        phase: val.phase,
      }));
      setCustomInspections(items);
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [user, projectId]);

  const market = (project?.market ?? "USA") as Market;
  const isWA = WA_MARKETS.includes(market);
  const currentPhaseIndex = project?.currentPhase ?? 0;
  const currentPhaseKey = PHASE_ORDER[currentPhaseIndex] ?? "DEFINE";

  // Auto-select current phase on load
  useEffect(() => {
    if (selectedPhase === null) {
      setSelectedPhase(currentPhaseKey);
    }
  }, [currentPhaseKey, selectedPhase]);

  // --- Derived data ---

  // All inspections grouped by phase (including custom ones)
  const inspectionsByPhase = useMemo(() => {
    const map: Record<ProjectPhase, InspectionRequirement[]> = {} as Record<ProjectPhase, InspectionRequirement[]>;
    for (const phase of PHASE_ORDER) {
      const marketInspections = getInspectionsForPhase(market, phase);
      const customs = customInspections
        .filter((c) => c.phase === phase)
        .map((c): InspectionRequirement => ({
          id: c.id,
          name: c.name,
          phase: c.phase,
          description: "Custom inspection",
          inspector: c.type === "formal" ? "Licensed inspector" : "Self-verified",
          checklistItems: [],
          requiredBeforeNext: false,
          formal: c.type === "formal",
        }));
      const all = [...marketInspections, ...customs];
      if (all.length > 0) {
        map[phase] = all;
      }
    }
    return map;
  }, [market, customInspections]);

  // Phase pill counts
  const phaseCounts = useMemo(() => {
    const counts: Record<ProjectPhase, number> = {} as Record<ProjectPhase, number>;
    for (const phase of PHASE_ORDER) {
      counts[phase] = inspectionsByPhase[phase]?.length ?? 0;
    }
    return counts;
  }, [inspectionsByPhase]);

  // Inspections for selected phase
  const activeInspections = useMemo(() => {
    if (!selectedPhase) return [];
    return inspectionsByPhase[selectedPhase] ?? [];
  }, [selectedPhase, inspectionsByPhase]);

  // Result lookup
  const resultMap = useMemo(() => {
    const map: Record<string, InspectionResultData> = {};
    for (const r of results) {
      if (r.inspectionId) map[r.inspectionId] = r;
    }
    return map;
  }, [results]);

  // Global stats (all phases)
  const stats = useMemo(() => {
    let passed = 0;
    let failed = 0;
    let pending = 0;
    let total = 0;
    for (const phase of PHASE_ORDER) {
      const inspections = inspectionsByPhase[phase] ?? [];
      for (const insp of inspections) {
        total++;
        const status = getStatusForInspection(insp, resultMap[insp.id]);
        if (status === "passed") passed++;
        else if (status === "failed") failed++;
        else pending++;
      }
    }
    return { passed, failed, pending, total };
  }, [inspectionsByPhase, resultMap]);

  // --- Topbar ---

  useEffect(() => {
    setTopbar(
      project?.name || t("project.inspections"),
      `${t("project.inspections")} -- ${stats.passed}/${stats.total} passed`,
      stats.passed === stats.total && stats.total > 0 ? "success" : "info"
    );
  }, [setTopbar, stats, project?.name]);

  // --- Handlers ---

  const openRecordForm = useCallback((inspectionId: string) => {
    const existing = resultMap[inspectionId];
    setRecordForm({
      result: existing?.passed ? "passed" : existing?.notes?.startsWith("[CONDITIONAL]") ? "conditional" : "passed",
      inspectorName: "",
      date: new Date().toISOString().slice(0, 10),
      notes: existing?.notes?.replace("[CONDITIONAL] ", "") ?? "",
    });
    setRecordingId(inspectionId);
  }, [resultMap]);

  const closeRecordForm = useCallback(() => {
    setRecordingId(null);
  }, []);

  const saveResult = useCallback(async () => {
    if (!user || !recordingId) return;
    setSaving(true);

    const inspection = activeInspections.find((i) => i.id === recordingId);
    const existing = resultMap[recordingId];
    const isPassed = recordForm.result === "passed";
    const notesPrefix = recordForm.result === "conditional" ? "[CONDITIONAL] " : "";
    const notes = notesPrefix + recordForm.notes;
    const completedItems = inspection
      ? new Array(inspection.checklistItems.length).fill(isPassed)
      : [];

    try {
      if (existing?.id && !existing.id.startsWith("temp-")) {
        await updateInspectionResult(user.uid, projectId, existing.id, {
          completedItems,
          passed: isPassed,
          notes,
          completedAt: new Date().toISOString(),
        });
      } else {
        await addInspectionResult(user.uid, {
          projectId,
          inspectionId: recordingId,
          phase: selectedPhase ?? currentPhaseKey,
          completedItems,
          passed: isPassed,
          notes,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      showToast("Result saved", "success");
      setRecordingId(null);
    } catch {
      showToast("Failed to save result", "error");
    } finally {
      setSaving(false);
    }
  }, [user, recordingId, recordForm, activeInspections, resultMap, projectId, selectedPhase, currentPhaseKey, showToast]);

  const addCustomInspection = useCallback(async () => {
    if (!addForm.name.trim() || !addForm.phase || !user) return;
    const newInsp: CustomInspection = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: addForm.name.trim(),
      type: addForm.type,
      phase: addForm.phase as ProjectPhase,
    };
    try {
      const customRef = ref(db, `users/${user.uid}/projects/${projectId}/customInspections/${newInsp.id}`);
      await set(customRef, newInsp);
      setAddForm({ name: "", type: "informal", phase: "" });
      setShowAddForm(false);
      showToast("Inspection added", "success");
    } catch {
      showToast("Failed to save inspection", "error");
    }
  }, [addForm, showToast, user, projectId]);

  // ============================================================
  // Render
  // ============================================================

  return (
    <>
      <PageHeader
        title={t("project.inspections")}
        projectName={project?.name}
        projectId={projectId}
      />

      {/* Legend: Formal vs Informal */}
      <div className="flex items-center gap-4 mb-3 text-[9px] text-muted uppercase tracking-wide">
        <span>
          <span className="font-medium text-earth">Formal:</span> requires licensed inspector
        </span>
        <span>
          <span className="font-medium text-earth">Informal:</span> self-verified checkpoint
        </span>
        {isWA && (
          <span className="text-clay italic normal-case">
            Most inspections in {market === "TOGO" ? "Togo" : market === "GHANA" ? "Ghana" : "Benin"} are informal / self-verified
          </span>
        )}
      </div>

      {/* Top strip: stats */}
      <div className="flex items-center gap-5 mb-4 px-3 py-2 rounded-[var(--radius)] bg-warm border border-sand/30">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-success font-data font-semibold">{stats.passed}</span>
          <span className="text-muted">passed</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-danger" />
          <span className="text-danger font-data font-semibold">{stats.failed}</span>
          <span className="text-muted">failed</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          <span className="text-earth font-data font-semibold">{stats.pending}</span>
          <span className="text-muted">pending</span>
        </div>
        <div className="ml-auto text-[10px] text-muted font-data">
          {stats.total} total
        </div>
      </div>

      {/* Phase tabs: horizontal scrollable pills */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {PHASE_ORDER.map((phase) => {
          const count = phaseCounts[phase];
          const isActive = selectedPhase === phase;
          const isCurrent = phase === currentPhaseKey;
          return (
            <button
              key={phase}
              onClick={() => setSelectedPhase(phase)}
              className={`
                shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors
                ${isActive
                  ? "bg-earth text-white border-earth"
                  : count > 0
                    ? "bg-surface text-earth border-border hover:border-clay/40"
                    : "bg-surface text-muted border-border/50 opacity-50"
                }
              `}
            >
              {PHASE_NAMES[phase]}
              {count > 0 && (
                <span className={`text-[9px] font-data ${isActive ? "text-white/70" : "text-muted"}`}>
                  {count}
                </span>
              )}
              {isCurrent && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-clay" />
              )}
            </button>
          );
        })}
      </div>

      {/* Inspection list for selected phase */}
      {activeInspections.length === 0 && selectedPhase && (
        <p className="text-[11px] text-muted mb-4 py-3 text-center">
          No inspections for {PHASE_NAMES[selectedPhase]} phase.
        </p>
      )}

      {activeInspections.length > 0 && (
        <div className="border border-border/60 rounded-2xl overflow-hidden mb-4 bg-surface">
          {activeInspections.map((insp, idx) => {
            const result = resultMap[insp.id];
            const status = getStatusForInspection(insp, result);
            const isRecording = recordingId === insp.id;
            const isLast = idx === activeInspections.length - 1;

            return (
              <div key={insp.id}>
                {/* Row */}
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 ${
                    !isLast && !isRecording ? "border-b border-border/40" : ""
                  }`}
                >
                  {/* Status dot */}
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDotColor(status)}`} />

                  {/* Name */}
                  <span className="text-[11px] font-medium text-earth flex-1 min-w-0 truncate">
                    {insp.name}
                  </span>

                  {/* Type badge */}
                  <Badge variant={insp.formal ? "info" : "emerald"}>
                    {insp.formal ? "Formal" : "Informal"}
                  </Badge>

                  {/* Status label */}
                  <span className={`text-[10px] font-data shrink-0 ${
                    status === "passed" ? "text-success" :
                    status === "failed" ? "text-danger" :
                    status === "conditional" ? "text-warning" :
                    "text-muted"
                  }`}>
                    {statusLabel(status)}
                  </span>

                  {/* Record result button */}
                  <button
                    onClick={() => isRecording ? closeRecordForm() : openRecordForm(insp.id)}
                    className={`text-[9px] font-medium px-2 py-1 rounded border transition-colors shrink-0 ${
                      isRecording
                        ? "bg-earth text-white border-earth"
                        : "border-clay/30 text-clay hover:bg-clay/5"
                    }`}
                  >
                    {isRecording ? "Cancel" : status === "pending" ? "Record result" : "Update"}
                  </button>
                </div>

                {/* Inline record form */}
                {isRecording && (
                  <div className={`px-3 pb-3 pt-1 bg-warm/40 ${!isLast ? "border-b border-border/40" : ""}`}>
                    <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-2 items-start">
                      {/* Result radio group */}
                      <div>
                        <label className="text-[9px] text-muted uppercase tracking-wide block mb-1">Result</label>
                        <div className="flex gap-2">
                          {(["passed", "failed", "conditional"] as const).map((val) => (
                            <label
                              key={val}
                              className={`flex items-center gap-1 text-[10px] cursor-pointer px-2 py-1 rounded border transition-colors ${
                                recordForm.result === val
                                  ? val === "passed" ? "bg-success/10 border-success/30 text-success"
                                    : val === "failed" ? "bg-danger/10 border-danger/30 text-danger"
                                    : "bg-warning/10 border-warning/30 text-warning"
                                  : "border-border text-muted hover:border-clay/30"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`result-${insp.id}`}
                                value={val}
                                checked={recordForm.result === val}
                                onChange={() => setRecordForm((f) => ({ ...f, result: val }))}
                                className="sr-only"
                              />
                              {val === "passed" ? "Pass" : val === "failed" ? "Fail" : "Conditional"}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Inspector name */}
                      <div>
                        <label className="text-[9px] text-muted uppercase tracking-wide block mb-1">Inspector</label>
                        <input
                          type="text"
                          value={recordForm.inspectorName}
                          onChange={(e) => setRecordForm((f) => ({ ...f, inspectorName: e.target.value }))}
                          placeholder="Name"
                          className="w-full px-2 py-1 text-[10px] rounded border border-border bg-white text-earth placeholder:text-muted/50 focus:outline-none focus:border-clay/40"
                        />
                      </div>

                      {/* Date */}
                      <div>
                        <label className="text-[9px] text-muted uppercase tracking-wide block mb-1">Date</label>
                        <input
                          type="date"
                          value={recordForm.date}
                          onChange={(e) => setRecordForm((f) => ({ ...f, date: e.target.value }))}
                          className="w-full px-2 py-1 text-[10px] rounded border border-border bg-white text-earth focus:outline-none focus:border-clay/40"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-2">
                      <label className="text-[9px] text-muted uppercase tracking-wide block mb-1">Notes</label>
                      <textarea
                        value={recordForm.notes}
                        onChange={(e) => setRecordForm((f) => ({ ...f, notes: e.target.value }))}
                        rows={2}
                        placeholder="Inspection notes..."
                        className="w-full px-2 py-1 text-[10px] rounded border border-border bg-white text-earth placeholder:text-muted/50 focus:outline-none focus:border-clay/40 resize-none"
                      />
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={saveResult}
                        disabled={saving}
                        className="px-3 py-1 text-[10px] font-medium rounded bg-earth text-white hover:bg-earth/90 disabled:opacity-50 transition-colors"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        className="flex items-center gap-1 px-2 py-1 text-[10px] text-muted border border-border rounded hover:border-clay/30 transition-colors"
                        title="Attach photo"
                      >
                        <Camera size={11} />
                        <span>Photo</span>
                      </button>
                      <button
                        onClick={closeRecordForm}
                        className="ml-auto text-[10px] text-muted hover:text-earth transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add custom inspection */}
      {!showAddForm ? (
        <button
          onClick={() => {
            setAddForm({ name: "", type: isWA ? "informal" : "formal", phase: selectedPhase ?? currentPhaseKey });
            setShowAddForm(true);
          }}
          className="flex items-center gap-1.5 text-[10px] font-medium text-clay hover:text-earth transition-colors mb-6"
        >
          <Plus size={13} />
          Add inspection
        </button>
      ) : (
        <div className="border border-border/60 rounded-2xl bg-surface p-3 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-earth uppercase tracking-wide">New inspection</span>
            <button onClick={() => setShowAddForm(false)} className="text-muted hover:text-earth">
              <X size={13} />
            </button>
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
            {/* Name */}
            <div>
              <label className="text-[9px] text-muted uppercase tracking-wide block mb-1">Name</label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Concrete pour verification"
                className="w-full px-2 py-1 text-[10px] rounded border border-border bg-white text-earth placeholder:text-muted/50 focus:outline-none focus:border-clay/40"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-[9px] text-muted uppercase tracking-wide block mb-1">Type</label>
              <select
                value={addForm.type}
                onChange={(e) => setAddForm((f) => ({ ...f, type: e.target.value as "formal" | "informal" }))}
                className="px-2 py-1 text-[10px] rounded border border-border bg-white text-earth focus:outline-none focus:border-clay/40"
              >
                <option value="formal">Formal</option>
                <option value="informal">Informal</option>
              </select>
            </div>

            {/* Phase */}
            <div>
              <label className="text-[9px] text-muted uppercase tracking-wide block mb-1">Phase</label>
              <select
                value={addForm.phase}
                onChange={(e) => setAddForm((f) => ({ ...f, phase: e.target.value as ProjectPhase }))}
                className="px-2 py-1 text-[10px] rounded border border-border bg-white text-earth focus:outline-none focus:border-clay/40"
              >
                <option value="">Select...</option>
                {PHASE_ORDER.map((p) => (
                  <option key={p} value={p}>{PHASE_NAMES[p]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <button
              onClick={addCustomInspection}
              disabled={!addForm.name.trim() || !addForm.phase}
              className="px-3 py-1 text-[10px] font-medium rounded bg-earth text-white hover:bg-earth/90 disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </>
  );
}
