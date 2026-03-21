// TODO: Many hardcoded strings need t() wrapping
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTopbar } from "../../../layout";
import {
  subscribeToProject,
  subscribeToTasks,
  subscribeToBudgetItems,
  subscribeToContacts,
  subscribeToDailyLogs,
  subscribeToPhotos,
  subscribeToPunchListItems,
  subscribeToDocuments,
  subscribeToInspectionResults,
  subscribeToMaterials,
  subscribeToAllMilestoneProgress,
  subscribeToPhaseSteps,
  subscribeToVaultFiles,
  completePhaseStep,
  uncompletePhaseStep,
  addStepDecision,
  removeStepDecision,
  updateStepDecision,
  updateTask,
  addTask,
  deleteTask,
  deleteProject,
  approveTask,
  rejectTask,
  addContractorRating,
  createChangeOrder,
  resolveChangeOrder,
  subscribeToChangeOrders,
  type ProjectData,
  type TaskData,
  type BudgetItemData,
  type ContactData,
  type DailyLogData,
  type PhotoData,
  type PunchListItemData,
  type DocumentData,
  type InspectionResultData,
  type MaterialData,
  type VaultFileData,
  type PhaseStepCompletion,
  type StepDecision,
  type ChangeOrder,
} from "@/lib/services/project-service";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { useTranslation } from "@/lib/hooks/use-translation";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatCard } from "@/components/ui/StatCard";
import { PhaseTracker } from "@/components/ui/PhaseTracker";
import { Badge } from "@/components/ui/Badge";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MarketBadge } from "@/components/ui/MarketBadge";
import { PhaseEducationCard } from "@/components/ui/PhaseEducationCard";
import {
  BudgetDonutChart,
  SpendVelocityChart,
  ProgressSCurve,
  CategoryBreakdownChart,
  MilestoneTimeline,
  PunchListDonut,
  DailyPulseBar,
} from "@/components/charts";
import {
  getMarketData,
  getPhaseDefinition,
  getEducationForPhase,
  getTradesForPhase,
  getTemplatesForPhase,
  formatCurrencyCompact,
  PHASE_ORDER,
  getClosestLocation,
  getCostComparisonText,
  getClimateLabel,
  formatMonthList,
} from "@keystone/market-data";
import type { Market, ProjectPhase } from "@keystone/market-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { AIInsight } from "@/components/ui/AIInsight";
import { generateOverviewInsights } from "@/lib/insights";
import {
  Camera,
  ClipboardList,
  DollarSign,
  FileText,
  CalendarCheck,
  Users,
  ShieldCheck,
  Home,
  TrendingUp,
  Download,
  Briefcase,
  Plus,
  X,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Share2,
  Check,
  XCircle,
  Clock,
  Package,
  Lock,
  ListChecks,
  Star,
  FilePlus,
  ArrowDown,
  ClipboardCheck,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { ExportModal } from "@/components/ui/ExportModal";
import { PresentationModal } from "@/components/ui/PresentationModal";
import type { PresentationData } from "@/lib/services/presentation-service";
import { PhaseAdvancement } from "@/components/ui/PhaseAdvancement";
import { ProcessGuide } from "@/components/ui/ProcessGuide";
import { PhaseSteps } from "@/components/ui/PhaseSteps";
import { DocumentReadiness } from "@/components/ui/DocumentReadiness";
import { getPhaseSteps } from "@/lib/phase-steps";
import { analyzeDocumentCompleteness } from "@/lib/document-intelligence";
import { LearnTooltip } from "@/components/ui/LearnTooltip";
import { getNextActions, type NextAction } from "@/lib/next-actions";
import type { ExportData } from "@/lib/services/export-service";

// ---------------------------------------------------------------------------
// Collapsible section component
// ---------------------------------------------------------------------------

function CollapsibleSection({ title, defaultOpen = false, children, count }: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-2">
        <SectionLabel>{title}{count != null ? ` (${count})` : ""}</SectionLabel>
        <ChevronDown size={16} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="animate-expand">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers to generate planned curves from budget / timeline data
// ---------------------------------------------------------------------------

function generatePlannedSpend(totalBudget: number, totalWeeks: number): { week: number; amount: number }[] {
  if (totalWeeks <= 0) return [{ week: 0, amount: 0 }];
  const points: { week: number; amount: number }[] = [];
  for (let w = 0; w <= totalWeeks; w += Math.max(1, Math.floor(totalWeeks / 12))) {
    const t = w / totalWeeks;
    // S-curve distribution: slow start, fast middle, slow end
    const pct = 1 / (1 + Math.exp(-10 * (t - 0.5)));
    points.push({ week: w, amount: Math.round(totalBudget * pct) });
  }
  if (points[points.length - 1]?.week !== totalWeeks) {
    points.push({ week: totalWeeks, amount: totalBudget });
  }
  return points;
}

function generateActualSpend(totalSpent: number, currentWeek: number): { week: number; amount: number }[] {
  if (currentWeek <= 0) return [{ week: 0, amount: 0 }];
  const points: { week: number; amount: number }[] = [];
  const steps = Math.min(currentWeek, 12);
  for (let i = 0; i <= steps; i++) {
    const w = Math.round((i / steps) * currentWeek);
    const t = w / currentWeek;
    const pct = 1 / (1 + Math.exp(-8 * (t - 0.45)));
    points.push({ week: w, amount: Math.round(totalSpent * pct) });
  }
  return points;
}

function generatePlannedProgress(totalWeeks: number): { week: number; pct: number }[] {
  if (totalWeeks <= 0) return [{ week: 0, pct: 0 }];
  const points: { week: number; pct: number }[] = [];
  for (let w = 0; w <= totalWeeks; w += Math.max(1, Math.floor(totalWeeks / 12))) {
    const t = w / totalWeeks;
    const pct = 1 / (1 + Math.exp(-10 * (t - 0.5)));
    points.push({ week: w, pct: Math.round(pct * 100) });
  }
  if (points[points.length - 1]?.week !== totalWeeks) {
    points.push({ week: totalWeeks, pct: 100 });
  }
  return points;
}

function generateActualProgress(progress: number, currentWeek: number): { week: number; pct: number }[] {
  if (currentWeek <= 0) return [{ week: 0, pct: 0 }];
  const points: { week: number; pct: number }[] = [];
  const steps = Math.min(currentWeek, 12);
  for (let i = 0; i <= steps; i++) {
    const w = Math.round((i / steps) * currentWeek);
    const t = w / currentWeek;
    const pct = 1 / (1 + Math.exp(-8 * (t - 0.45)));
    points.push({ week: w, pct: Math.round(pct * progress) });
  }
  return points;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function OverviewClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItemData[]>([]);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLogData[]>([]);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [punchListItems, setPunchListItems] = useState<PunchListItemData[]>([]);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [inspectionResults, setInspectionResults] = useState<InspectionResultData[]>([]);
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [allMilestoneProgress, setAllMilestoneProgress] = useState<Record<string, boolean[]>>({});
  const [phaseStepCompletions, setPhaseStepCompletions] = useState<Record<string, PhaseStepCompletion>>({});
  const [vaultFiles, setVaultFiles] = useState<VaultFileData[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPresentationModal, setShowPresentationModal] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<"normal" | "urgent" | "critical">("normal");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [requirePhoto, setRequirePhoto] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [taskPrice, setTaskPrice] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskLabel, setEditingTaskLabel] = useState("");
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [completionNote, setCompletionNote] = useState("");
  const [completionLoading, setCompletionLoading] = useState(false);
  const [showDeleteProject, setShowDeleteProject] = useState(false);
  const [deleteProjectName, setDeleteProjectName] = useState("");
  const [deletingProject, setDeletingProject] = useState(false);
  const [rejectingTaskId, setRejectingTaskId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewLoading, setReviewLoading] = useState<string | null>(null);
  const [taskDependsOn, setTaskDependsOn] = useState<string[]>([]);
  const [showMilestoneDropdown, setShowMilestoneDropdown] = useState(false);

  // Contractor rating state
  const [ratingTaskId, setRatingTaskId] = useState<string | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // Change order state
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [showAddChangeOrder, setShowAddChangeOrder] = useState(false);
  const [coDescription, setCoDescription] = useState("");
  const [coReason, setCoReason] = useState("");
  const [coPriceImpact, setCoPriceImpact] = useState("");
  const [coScheduleImpact, setCoScheduleImpact] = useState("");
  const [coSubmitting, setCoSubmitting] = useState(false);
  const [coResolvingId, setCoResolvingId] = useState<string | null>(null);
  const [coResolveNote, setCoResolveNote] = useState("");
  const searchParams = useSearchParams();
  const highlightTaskId = searchParams.get("task");
  const scrolledToTaskRef = useRef(false);

  // Scroll to a specific task when linked from dashboard
  useEffect(() => {
    if (!highlightTaskId || tasks.length === 0 || scrolledToTaskRef.current) return;
    const el = document.getElementById(`task-${highlightTaskId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-clay/40");
      scrolledToTaskRef.current = true;
      setTimeout(() => el.classList.remove("ring-2", "ring-clay/40"), 3000);
    }
  }, [highlightTaskId, tasks]);

  useEffect(() => {
    if (!user) return;
    const unsubs = [
      subscribeToProject(user.uid, projectId, setProject),
      subscribeToTasks(user.uid, projectId, setTasks),
      subscribeToBudgetItems(user.uid, projectId, setBudgetItems),
      subscribeToContacts(user.uid, projectId, setContacts),
      subscribeToDailyLogs(user.uid, projectId, setDailyLogs),
      subscribeToPhotos(user.uid, projectId, setPhotos),
      subscribeToPunchListItems(user.uid, projectId, setPunchListItems),
      subscribeToDocuments(user.uid, projectId, setDocuments),
      subscribeToInspectionResults(user.uid, projectId, setInspectionResults),
      subscribeToMaterials(user.uid, projectId, setMaterials),
      subscribeToAllMilestoneProgress(user.uid, projectId, setAllMilestoneProgress),
      subscribeToPhaseSteps(user.uid, projectId, setPhaseStepCompletions),
      subscribeToVaultFiles(user.uid, projectId, setVaultFiles),
      subscribeToChangeOrders(user.uid, projectId, setChangeOrders),
    ];
    return () => unsubs.forEach((u) => u());
  }, [user, projectId]);

  useEffect(() => {
    if (project) {
      setTopbar(project.name, `${t("project.overview")} — ${project.phaseName}`, project.currentPhase >= 5 ? "warning" : "info");
    }
  }, [project, setTopbar, t]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-clay border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[12px] text-muted">Loading...</p>
      </div>
    );
  }

  const market = project.market as Market;
  const marketData = getMarketData(market);
  const currentPhaseKey = PHASE_ORDER[project.currentPhase] ?? "DEFINE";
  const phaseDef = getPhaseDefinition(market, currentPhaseKey);
  const education = getEducationForPhase(market, currentPhaseKey);
  const phase = project.currentPhase;

  const activeTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);
  const pendingReviewTasks = tasks.filter((t) => t.status === "pending-review");

  // Phase-filtered tasks for current phase
  const currentPhaseTasks = tasks.filter((t) => t.phase === phase || t.phase == null);
  const currentPhaseActive = currentPhaseTasks.filter((t) => !t.done && t.status !== "pending-review");
  const currentPhaseDone = currentPhaseTasks.filter((t) => t.done);
  const currentPhasePending = currentPhaseTasks.filter((t) => t.status === "pending-review");
  const currentPhaseProgress = currentPhaseTasks.length > 0
    ? Math.round((currentPhaseDone.length / currentPhaseTasks.length) * 100) : 0;

  // Compute real progress from tasks + phases (instead of using hardcoded project.progress)
  const computedProgress = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : project.progress;

  const fmtCompact = (amount: number) => formatCurrencyCompact(amount, marketData.currency);

  // Compute phase-specific data
  const budgetUtilization = project.totalBudget > 0
    ? Math.round((project.totalSpent / project.totalBudget) * 100)
    : 0;

  function isTaskBlocked(task: TaskData, allTasks: TaskData[]): { blocked: boolean; blockedBy: string[] } {
    if (!task.dependsOn || task.dependsOn.length === 0) return { blocked: false, blockedBy: [] };
    const incomplete = task.dependsOn
      .map(depId => allTasks.find(t => t.id === depId))
      .filter(t => t && !t.done);
    return {
      blocked: incomplete.length > 0,
      blockedBy: incomplete.map(t => t!.label),
    };
  }

  function resetTaskForm() {
    setNewTaskLabel("");
    setTaskDescription("");
    setTaskPriority("normal");
    setSelectedContactId("");
    setRequirePhoto(false);
    setRequireApproval(false);
    setTaskPrice("");
    setTaskDueDate("");
    setTaskDependsOn([]);
    setShowAddTask(false);
  }

  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  async function handleAddTask() {
    if (!newTaskLabel.trim() || !user) return;
    try {
      await addTask(user.uid, {
        projectId,
        label: newTaskLabel.trim(),
        description: taskDescription || undefined,
        status: "upcoming",
        done: false,
        order: tasks.length,
        priority: taskPriority,
        assignedTo: selectedContact?.id || undefined,
        assignedName: selectedContact?.name || undefined,
        trade: selectedContact?.role || undefined,
        requiresPhoto: requirePhoto,
        requiresApproval: requireApproval,
        price: taskPrice ? Number(taskPrice) : undefined,
        currency: marketData?.currency?.code || "USD",
        dueDate: taskDueDate || undefined,
        sourceType: "custom",
        dependsOn: taskDependsOn.length > 0 ? taskDependsOn : undefined,
      });
      resetTaskForm();
      showToast("Task added.", "success");
    } catch {
      showToast("Failed to add task.", "error");
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!user) return;
    try {
      await deleteTask(user.uid, projectId, taskId);
      showToast("Task deleted.", "success");
    } catch {
      showToast("Failed to delete task.", "error");
    }
  }

  async function handleEditTaskSave(taskId: string) {
    if (!user || !editingTaskLabel.trim()) return;
    try {
      await updateTask(user.uid, projectId, taskId, { label: editingTaskLabel.trim() });
      setEditingTaskId(null);
      setEditingTaskLabel("");
      showToast("Task updated.", "success");
    } catch {
      showToast("Failed to update task.", "error");
    }
  }

  async function handleBulkCreateFromMilestones(selectedMilestones: { name: string; order: number }[]) {
    if (!user || selectedMilestones.length === 0) return;
    try {
      const sorted = [...selectedMilestones].sort((a, b) => a.order - b.order);
      const createdTaskIds: string[] = [];
      for (let i = 0; i < sorted.length; i++) {
        const ms = sorted[i];
        const taskId = await addTask(user.uid, {
          projectId,
          label: ms.name,
          status: "upcoming",
          done: false,
          order: tasks.length + i,
          sourceType: "milestone",
          sourceMilestone: ms.name,
          requiresApproval: true,
          dependsOn: createdTaskIds.length > 0 ? [createdTaskIds[createdTaskIds.length - 1]] : undefined,
          currency: marketData?.currency?.code || "USD",
        });
        createdTaskIds.push(taskId);
      }
      setShowMilestoneDropdown(false);
      showToast(`${sorted.length} milestone task${sorted.length !== 1 ? "s" : ""} created.`, "success");
    } catch {
      showToast("Failed to create milestone tasks.", "error");
    }
  }

  async function handleDeleteProject() {
    if (!user || !project || deleteProjectName !== project.name) return;
    setDeletingProject(true);
    try {
      await deleteProject(user.uid, projectId);
      router.push("/dashboard");
    } catch {
      setDeletingProject(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Overview"
        projectName={project.name}
        projectId={projectId}
        subtitle={phaseDef ? phaseDef.name : currentPhaseKey}
        action={{
          label: "Export",
          onClick: () => setShowExportModal(true),
          icon: <Download size={16} />,
        }}
      />

      {/* Action buttons row */}
      <div className="flex justify-end gap-2 -mt-4 mb-4">
        {profile && ["BUILDER", "DEVELOPER", "ENTERPRISE"].includes(profile.plan) && (
          <button
            onClick={() => {
              const shareUrl = `${window.location.origin}/project/${projectId}/overview`;
              navigator.clipboard.writeText(shareUrl);
              alert("Project link copied to clipboard. Share it with family or advisors to let them view your progress.");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg border border-border text-earth hover:bg-warm transition-colors"
          >
            <Share2 size={14} />
            Share
          </button>
        )}
        <button
          onClick={() => setShowPresentationModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg border border-border text-earth hover:bg-warm transition-colors"
        >
          <Briefcase size={14} />
          Presentations
        </button>
      </div>

      {/* Phase tracker - always shown */}
      <PhaseTracker currentPhase={project.currentPhase} completedPhases={project.completedPhases} />

      {/* Phase education - compact tip, not the full 9-phase list */}
      {education && phaseDef && (
        <div className="mt-2 mb-3 px-4 py-3 bg-warm/30 border border-border/40 rounded-xl">
          <p className="text-[11px] text-muted leading-relaxed">
            <span className="font-semibold text-earth">{phaseDef.name}:</span> {education.summary}
            {phaseDef.typicalDurationWeeks && (
              <span className="text-clay font-data"> ({phaseDef.typicalDurationWeeks.min}-{phaseDef.typicalDurationWeeks.max} weeks typical)</span>
            )}
          </p>
        </div>
      )}

      {/* Document Readiness - shown for all phases */}
      {(() => {
        const docAnalysis = analyzeDocumentCompleteness(
          phase,
          market,
          documents,
          vaultFiles
        );
        if (docAnalysis.complete.length + docAnalysis.missing.length === 0) return null;
        const phaseNames = ["Define", "Finance", "Land", "Design", "Approve", "Assemble", "Build", "Verify", "Operate"];
        return (
          <CollapsibleSection title="Documents Needed" count={docAnalysis.missing.length}>
            <DocumentReadiness
              analysis={docAnalysis}
              projectId={projectId}
              phaseName={phaseNames[phase] ?? "Current"}
            />
          </CollapsibleSection>
        );
      })()}

      {/* Phase tracker already shows the 9 phases visually above */}

      {/* Stat cards - always shown, collapsible for early phases */}
      <CollapsibleSection title="Your Progress" defaultOpen={phase >= 6}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1 mb-3 animate-stagger">
          <StatCard value={`${computedProgress}%`} label={tasks.length > 0 ? `${completedTasks.length}/${tasks.length} tasks` : "Progress"} />
          <StatCard
            value={fmtCompact(project.totalSpent)}
            label={`Spent of ${fmtCompact(project.totalBudget)}`}
          />
          <StatCard value={`Wk ${project.currentWeek}`} label={`Of est. ${project.totalWeeks}`} />
          <StatCard value={String(project.openItems)} label="Open items" />
        </div>
      </CollapsibleSection>

      {/* Setup Review Banner -- shown when wizard/analyzer generated tasks need approval */}
      {pendingReviewTasks.filter((t) => t.completedBy === "Deal Analyzer" || t.completedBy === "Project Wizard").length > 0 && (
        <div className="mb-5 p-4 bg-clay/5 border border-clay/20 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-clay/10 flex items-center justify-center shrink-0 mt-0.5">
              <ClipboardCheck size={18} className="text-clay" />
            </div>
            <div className="flex-1">
              <h4 className="text-[13px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>
                Review your project setup
              </h4>
              <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                {pendingReviewTasks.filter((t) => t.completedBy === "Deal Analyzer" || t.completedBy === "Project Wizard").length} tasks were pre-filled from your {pendingReviewTasks.some((t) => t.completedBy === "Deal Analyzer") ? "deal analysis" : "project setup"}. Review the evidence below, edit if needed, then approve or reject each one.
              </p>
              <a href="#pending-review" className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-clay hover:underline">
                <ArrowDown size={12} />
                Go to review queue
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Deal Analysis Snapshot */}
      {project.dealScore != null && project.dealScore > 0 && (
        <div className="mb-5 p-4 bg-surface border border-border rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[13px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>
              Original Deal Analysis
            </h4>
            <Link
              href="/analyze"
              className="text-[11px] text-clay hover:underline"
            >
              Re-analyze
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wide">Deal Score</p>
              <p className={`text-[18px] font-bold font-data ${
                project.dealScore >= 65 ? "text-success" : project.dealScore >= 50 ? "text-warning" : "text-danger"
              }`}>{project.dealScore}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wide">Budget Variance</p>
              <p className={`text-[18px] font-bold font-data ${
                project.totalSpent <= project.totalBudget ? "text-success" : "text-danger"
              }`}>
                {project.totalBudget > 0
                  ? `${project.totalSpent <= project.totalBudget ? "" : "+"}${Math.round(((project.totalSpent - project.totalBudget) / project.totalBudget) * 100)}%`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wide">Remaining</p>
              <p className="text-[18px] font-bold font-data text-earth">
                {fmtCompact(Math.max(0, project.totalBudget - project.totalSpent))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Review Queue */}
      {pendingReviewTasks.length > 0 && (
        <div className="mb-5" id="pending-review">
          <div className="flex items-center gap-2 mb-3">
            <SectionLabel>Pending Review</SectionLabel>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-warning/15 text-warning text-[11px] font-data font-semibold">
              {pendingReviewTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {pendingReviewTasks.map((task) => (
              <Card key={task.id} id={`task-${task.id}`} padding="sm" className="border-l-3 border-l-warning">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium text-earth">{task.label}</span>
                      {task.trade && (
                        <Badge variant="info">{task.trade}</Badge>
                      )}
                    </div>
                    {task.assignedName && (
                      <p className="text-xs text-muted mb-1">
                        Submitted by {task.assignedName}
                      </p>
                    )}
                    {task.completionNote && (
                      <p className="text-xs text-slate bg-warm/50 rounded px-2 py-1.5 mb-2">
                        {task.completionNote}
                      </p>
                    )}
                    {task.completionPhotos && task.completionPhotos.length > 0 && (
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {task.completionPhotos.map((photo, idx) => (
                          <a
                            key={idx}
                            href={photo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-14 h-14 rounded overflow-hidden border border-border hover:border-clay transition-colors"
                          >
                            <img
                              src={photo.url}
                              alt={photo.caption || `Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-muted">
                      {task.completedAt && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(task.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                      {task.price != null && (
                        <span className="font-data font-medium text-earth">
                          {project.currency === "XOF"
                            ? `${task.price.toLocaleString()} FCFA`
                            : `$${task.price.toLocaleString()}`}
                        </span>
                      )}
                      {(task.rejectionCount ?? 0) > 0 && (
                        <span className="text-danger font-medium">
                          Rejected {task.rejectionCount}x previously
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                {rejectingTaskId === task.id ? (
                  <div className="mt-3 pt-3 border-t border-border">
                    <label className="block text-xs font-medium text-earth mb-1">
                      Rejection reason (minimum 10 characters)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain what needs to be corrected..."
                      className="w-full rounded border border-border bg-white px-3 py-2 text-sm text-slate placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-clay/30 resize-none"
                      rows={3}
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        disabled={rejectionReason.trim().length < 10 || reviewLoading === task.id}
                        onClick={async () => {
                          if (!user || !task.id) return;
                          setReviewLoading(task.id);
                          try {
                            await rejectTask(
                              user.uid,
                              projectId,
                              task.id,
                              rejectionReason.trim(),
                              task.rejectionCount ?? 0
                            );
                            showToast("Task rejected and sent back to contractor", "success");
                            setRejectingTaskId(null);
                            setRejectionReason("");
                          } catch {
                            showToast("Failed to reject task", "error");
                          } finally {
                            setReviewLoading(null);
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded border border-danger text-danger hover:bg-danger/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {reviewLoading === task.id ? "Rejecting..." : "Confirm Reject"}
                      </button>
                      <button
                        onClick={() => {
                          setRejectingTaskId(null);
                          setRejectionReason("");
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded text-muted hover:text-earth transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <button
                      disabled={reviewLoading === task.id}
                      onClick={async () => {
                        if (!user || !task.id) return;
                        setReviewLoading(task.id);
                        try {
                          await approveTask(user.uid, projectId, task.id);
                          if (task.price) {
                            await updateTask(user.uid, projectId, task.id, { paymentStatus: "authorized" });
                            showToast(`Task approved. Payment of ${task.currency ?? "$"}${task.price.toLocaleString()} authorized.`, "success");
                          } else {
                            showToast("Task approved.", "success");
                          }
                          // Prompt rating if task was assigned to a contractor
                          if (task.assignedTo) {
                            setRatingTaskId(task.id);
                            setRatingStars(5);
                            setRatingComment("");
                          }
                        } catch {
                          showToast("Failed to approve task", "error");
                        } finally {
                          setReviewLoading(null);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-success text-white hover:bg-success/90 disabled:opacity-40 transition-colors"
                    >
                      <Check size={14} />
                      {reviewLoading === task.id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      disabled={reviewLoading === task.id}
                      onClick={() => {
                        setRejectingTaskId(task.id!);
                        setRejectionReason("");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-danger text-danger hover:bg-danger/10 disabled:opacity-40 transition-colors"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Payments Due — tasks approved with price, awaiting payment release */}
      {(() => {
        const paymentsDue = tasks.filter((t) => t.done && t.price && t.paymentStatus === "authorized");
        if (paymentsDue.length === 0) return null;
        const totalDue = paymentsDue.reduce((s, t) => s + (t.price ?? 0), 0);
        const cur = marketData?.currency;
        return (
          <div className="mb-4">
            <SectionLabel>
              Payments Due ({paymentsDue.length})
            </SectionLabel>
            <Card padding="sm">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[12px] text-muted">Total due</span>
                <span className="text-[14px] font-bold text-earth font-data">
                  {cur ? formatCurrencyCompact(totalDue, cur) : `$${totalDue.toLocaleString()}`}
                </span>
              </div>
              <div className="space-y-2">
                {paymentsDue.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2.5 border border-border rounded-lg">
                    <div>
                      <p className="text-[12px] font-medium text-earth">{task.label}</p>
                      <p className="text-[10px] text-muted">{task.assignedName} · {task.trade}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-data font-semibold text-earth">
                        {cur ? formatCurrencyCompact(task.price ?? 0, cur) : `$${(task.price ?? 0).toLocaleString()}`}
                      </span>
                      <button
                        onClick={async () => {
                          if (!user || !task.id) return;
                          await updateTask(user.uid, projectId, task.id, { paymentStatus: "released" });
                          showToast(`Payment released for ${task.label}.`, "success");
                        }}
                        className="px-2.5 py-1 text-[10px] font-medium bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
                      >
                        Release
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
      })()}

      {/* Change Orders */}
      {(changeOrders.length > 0 || showAddChangeOrder) && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <SectionLabel>Change Orders</SectionLabel>
              {changeOrders.filter((co) => co.status === "pending").length > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-warning/15 text-warning text-[11px] font-data font-semibold">
                  {changeOrders.filter((co) => co.status === "pending").length}
                </span>
              )}
            </div>
            {!showAddChangeOrder && (
              <button
                onClick={() => setShowAddChangeOrder(true)}
                className="flex items-center gap-1 text-[11px] text-info hover:underline cursor-pointer"
              >
                <FilePlus size={12} /> New
              </button>
            )}
          </div>

          {/* Add change order form */}
          {showAddChangeOrder && (
            <Card padding="sm" className="mb-3">
              <h4 className="text-[12px] font-semibold text-earth mb-2">New Change Order</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  value={coDescription}
                  onChange={(e) => setCoDescription(e.target.value)}
                  placeholder="Description of the change"
                  className="w-full px-3 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <textarea
                  value={coReason}
                  onChange={(e) => setCoReason(e.target.value)}
                  placeholder="Reason for the change"
                  rows={2}
                  className="w-full px-3 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 resize-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-muted mb-0.5">
                      Price impact ({marketData?.currency?.symbol || "$"})
                    </label>
                    <input
                      type="number"
                      value={coPriceImpact}
                      onChange={(e) => setCoPriceImpact(e.target.value)}
                      placeholder="0 (+ or -)"
                      step="any"
                      className="w-full px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted mb-0.5">Schedule impact (days)</label>
                    <input
                      type="number"
                      value={coScheduleImpact}
                      onChange={(e) => setCoScheduleImpact(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    disabled={!coDescription.trim() || !coReason.trim() || coSubmitting}
                    onClick={async () => {
                      if (!user) return;
                      setCoSubmitting(true);
                      try {
                        await createChangeOrder(user.uid, {
                          projectId,
                          description: coDescription.trim(),
                          reason: coReason.trim(),
                          priceImpact: Number(coPriceImpact) || 0,
                          scheduleImpact: Number(coScheduleImpact) || 0,
                          initiatedBy: "owner",
                          initiatorName: profile?.name || user.email || "Owner",
                          status: "pending",
                        });
                        showToast("Change order created.", "success");
                        setCoDescription("");
                        setCoReason("");
                        setCoPriceImpact("");
                        setCoScheduleImpact("");
                        setShowAddChangeOrder(false);
                      } catch {
                        showToast("Failed to create change order.", "error");
                      } finally {
                        setCoSubmitting(false);
                      }
                    }}
                    className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
                  >
                    {coSubmitting ? "Creating..." : "Create"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddChangeOrder(false);
                      setCoDescription("");
                      setCoReason("");
                      setCoPriceImpact("");
                      setCoScheduleImpact("");
                    }}
                    className="p-1 text-muted hover:text-earth transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Change order list */}
          <div className="space-y-2">
            {changeOrders.map((co) => (
              <Card
                key={co.id}
                padding="sm"
                className={`border-l-3 ${
                  co.status === "pending"
                    ? "border-l-warning"
                    : co.status === "approved"
                    ? "border-l-success"
                    : "border-l-danger"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] font-medium text-earth">{co.description}</span>
                      <Badge
                        variant={
                          co.status === "pending" ? "warning" : co.status === "approved" ? "success" : "danger"
                        }
                      >
                        {co.status.charAt(0).toUpperCase() + co.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">{co.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted mt-1">
                  <span className="font-data">
                    {co.priceImpact >= 0 ? "+" : ""}
                    {marketData?.currency?.symbol || "$"}{Math.abs(co.priceImpact).toLocaleString()}
                  </span>
                  {co.scheduleImpact > 0 && (
                    <span className="font-data">+{co.scheduleImpact} day{co.scheduleImpact !== 1 ? "s" : ""}</span>
                  )}
                  <span>By {co.initiatorName}</span>
                  <span>
                    {new Date(co.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                {co.resolvedNote && (
                  <p className="text-[11px] text-slate bg-warm/50 rounded px-2 py-1 mt-1.5">{co.resolvedNote}</p>
                )}
                {co.status === "pending" && (
                  <>
                    {coResolvingId === co.id ? (
                      <div className="mt-2 pt-2 border-t border-border">
                        <textarea
                          value={coResolveNote}
                          onChange={(e) => setCoResolveNote(e.target.value)}
                          placeholder="Optional note..."
                          rows={2}
                          className="w-full px-3 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 resize-none mb-2"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              if (!user || !co.id) return;
                              try {
                                await resolveChangeOrder(user.uid, projectId, co.id, "approved", coResolveNote.trim() || undefined);
                                showToast("Change order approved.", "success");
                              } catch {
                                showToast("Failed to approve change order.", "error");
                              } finally {
                                setCoResolvingId(null);
                                setCoResolveNote("");
                              }
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-success text-white hover:bg-success/90 transition-colors"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            onClick={async () => {
                              if (!user || !co.id) return;
                              try {
                                await resolveChangeOrder(user.uid, projectId, co.id, "rejected", coResolveNote.trim() || undefined);
                                showToast("Change order rejected.", "success");
                              } catch {
                                showToast("Failed to reject change order.", "error");
                              } finally {
                                setCoResolvingId(null);
                                setCoResolveNote("");
                              }
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border border-danger text-danger hover:bg-danger/10 transition-colors"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                          <button
                            onClick={() => { setCoResolvingId(null); setCoResolveNote(""); }}
                            className="px-3 py-1.5 text-xs text-muted hover:text-earth transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                        <button
                          onClick={() => { setCoResolvingId(co.id!); setCoResolveNote(""); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-success text-white hover:bg-success/90 transition-colors"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => { setCoResolvingId(co.id!); setCoResolveNote(""); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border border-danger text-danger hover:bg-danger/10 transition-colors"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Materials Summary */}
      {materials.length > 0 && (
        <div className="mb-4">
          <SectionLabel>Materials Summary</SectionLabel>
          <Card padding="sm">
            {(() => {
              const byStatus = {
                ordered: materials.filter((m) => m.status === "ordered"),
                partial: materials.filter((m) => m.status === "partial"),
                delivered: materials.filter((m) => m.status === "delivered"),
                verified: materials.filter((m) => m.status === "verified"),
              };
              const totalCost = materials.reduce((s, m) => s + m.quantityOrdered * m.unitPrice, 0);
              const cur = marketData?.currency;
              return (
                <>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Package size={14} className="text-clay" />
                    <span className="text-[12px] font-medium text-earth">{materials.length} materials tracked</span>
                    <span className="ml-auto text-[12px] font-data font-semibold text-earth">
                      {cur ? formatCurrencyCompact(totalCost, cur) : `$${totalCost.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-warning-bg/50">
                      <div className="text-[14px] font-data font-semibold text-warning">{byStatus.ordered.length}</div>
                      <div className="text-[9px] text-muted uppercase tracking-wider">Ordered</div>
                    </div>
                    <div className="p-2 rounded-lg bg-info-bg/50">
                      <div className="text-[14px] font-data font-semibold text-info">{byStatus.partial.length}</div>
                      <div className="text-[9px] text-muted uppercase tracking-wider">Partial</div>
                    </div>
                    <div className="p-2 rounded-lg bg-success-bg/50">
                      <div className="text-[14px] font-data font-semibold text-success">{byStatus.delivered.length}</div>
                      <div className="text-[9px] text-muted uppercase tracking-wider">Delivered</div>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50">
                      <div className="text-[14px] font-data font-semibold text-emerald-700">{byStatus.verified.length}</div>
                      <div className="text-[9px] text-muted uppercase tracking-wider">Verified</div>
                    </div>
                  </div>
                  {/* Show materials with pending delivery */}
                  {(byStatus.ordered.length > 0 || byStatus.partial.length > 0) && (
                    <div className="mt-3 space-y-1.5">
                      {[...byStatus.ordered, ...byStatus.partial].slice(0, 5).map((mat) => (
                        <div key={mat.id} className="flex items-center justify-between px-2 py-1.5 border border-border rounded-lg text-[11px]">
                          <div>
                            <span className="font-medium text-earth">{mat.name}</span>
                            {mat.supplier && <span className="text-muted ml-1.5">({mat.supplier})</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-data text-muted">{mat.quantityDelivered}/{mat.quantityOrdered}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                              mat.status === "ordered"
                                ? "bg-warning-bg text-warning"
                                : "bg-info-bg text-info"
                            }`}>
                              {mat.status === "ordered" ? "Ordered" : "Partial"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </Card>
        </div>
      )}

      {/* Location Context Card */}
      {(() => {
        if (!project.city) return null;
        const locData = getClosestLocation(project.city, project.market);
        if (!locData) return null;
        return (
          <Card padding="sm" className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-clay/60">Location context</span>
              <span className="text-[10px] text-muted font-data">
                {locData.city}{locData.state ? `, ${locData.state}` : ""}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-3">
              <div>
                <div className="font-data text-[14px] font-medium text-earth">{locData.costIndex.toFixed(2)}x</div>
                <div className="text-[9px] text-muted uppercase tracking-wider">Cost index</div>
                <div className="text-[10px] text-muted mt-0.5">{getCostComparisonText(locData.costIndex)}</div>
              </div>
              <div>
                <div className="font-data text-[14px] font-medium text-earth">{locData.propertyTaxRate}%</div>
                <div className="text-[9px] text-muted uppercase tracking-wider">Property tax</div>
              </div>
              <div>
                <div className="font-data text-[14px] font-medium text-earth">{getClimateLabel(locData.climate)}</div>
                <div className="text-[9px] text-muted uppercase tracking-wider">Climate</div>
              </div>
              <div>
                <div className="font-data text-[13px] font-medium text-earth">{formatMonthList(locData.buildingSeasonMonths)}</div>
                <div className="text-[9px] text-muted uppercase tracking-wider">Build season</div>
              </div>
            </div>
            <p className="text-[10px] text-muted leading-relaxed border-t border-border pt-2">{locData.localNotes}</p>
          </Card>
        );
      })()}

      {/* AI Insights */}
      {(() => {
        const insights = generateOverviewInsights(project, budgetItems, tasks, dailyLogs, contacts);
        const topInsights = insights.sort((a, b) => b.priority - a.priority).slice(0, 3);
        if (topInsights.length === 0) return null;
        return (
          <CollapsibleSection title="AI Insights" count={topInsights.length}>
            <div className="space-y-2">
              {topInsights.map((insight, i) => (
                <AIInsight key={i} type={insight.type} title={insight.title} content={insight.content} action={insight.action} />
              ))}
            </div>
          </CollapsibleSection>
        );
      })()}

      {/* What should I do next? */}
      {(() => {
        const nextActions = getNextActions(
          project,
          budgetItems,
          contacts,
          tasks,
          documents,
          dailyLogs,
          photos,
          punchListItems,
          projectId
        );
        if (nextActions.length === 0) return null;
        return (
          <div className="mb-5">
            <SectionLabel>What should I do next?</SectionLabel>
            <div className="space-y-2">
              {nextActions.slice(0, 4).map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="flex items-start gap-3 p-3 border border-border rounded-[var(--radius)] bg-surface hover:bg-warm transition-colors group card-hover"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      action.priority === "high"
                        ? "bg-danger"
                        : action.priority === "medium"
                        ? "bg-warning"
                        : "bg-info"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-earth">{action.title}</p>
                    <p className="text-[11px] text-muted leading-relaxed mt-0.5">{action.description}</p>
                  </div>
                  <ArrowRight size={14} className="text-muted shrink-0 mt-1 group-hover:text-earth transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ----------------------------------------------------------------- */}
      {/* PHASE 0-1: Define / Finance — Planning workspace                  */}
      {/* ----------------------------------------------------------------- */}
      {phase <= 1 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            {/* Current Phase Task Workflow */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <SectionLabel>
                  {["Define", "Finance", "Land", "Design", "Approve", "Assemble", "Build", "Verify", "Operate"][phase] || "Define"}
                </SectionLabel>
                <span className="text-[10px] font-data text-muted">
                  {currentPhaseDone.length}/{currentPhaseTasks.length} complete
                </span>
              </div>

              {/* Phase progress bar */}
              <div className="h-1.5 bg-warm rounded-full overflow-hidden mb-3">
                <div className="h-full bg-success rounded-full" style={{ width: `${currentPhaseProgress}%`, transition: "width 0.5s" }} />
              </div>

              {currentPhaseTasks.length === 0 ? (
                <Card padding="sm">
                  <p className="text-[12px] text-muted py-3 text-center">No tasks for this phase.</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {/* Each task is a full interactive card */}
                  {currentPhaseTasks
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((task, idx) => {
                      const isOpen = completingTaskId === task.id;
                      const isPending = task.status === "pending-review";
                      const isDone = task.done;
                      const stepNum = idx + 1;

                      return (
                        <div key={task.id} className={`rounded-xl border transition-all ${
                          isDone ? "border-success/20 bg-success/3" :
                          isPending ? "border-warning/30 bg-warning/3" :
                          isOpen ? "border-clay/30 bg-surface shadow-sm" :
                          "border-border/50 bg-surface hover:border-border"
                        }`}>
                          {/* Task header -- always visible */}
                          <button
                            onClick={() => {
                              if (isDone) return;
                              if (isPending) {
                                // Scroll to pending review queue
                                document.getElementById("pending-review")?.scrollIntoView({ behavior: "smooth" });
                                return;
                              }
                              setCompletingTaskId(isOpen ? null : task.id!);
                              setCompletionNote("");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left"
                            disabled={isDone}
                          >
                            {/* Step number / status icon */}
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold font-data ${
                              isDone ? "bg-success text-white" :
                              isPending ? "bg-warning text-white" :
                              isOpen ? "bg-clay text-white" :
                              "bg-warm text-clay"
                            }`}>
                              {isDone ? <Check size={14} /> : isPending ? <Clock size={13} /> : stepNum}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`text-[13px] font-medium ${isDone ? "text-muted line-through" : "text-earth"}`}>
                                {task.label}
                              </p>
                              {isDone && task.completionNote && task.completionNote !== "Completed" && (
                                <p className="text-[10px] text-success/70 mt-0.5 truncate">{task.completionNote}</p>
                              )}
                              {isDone && task.completedAt && (
                                <p className="text-[9px] text-muted/40 mt-0.5">
                                  Completed {new Date(task.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </p>
                              )}
                            </div>

                            {/* Status indicator */}
                            {isPending && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-warning/10 text-warning font-semibold shrink-0">
                                Needs review
                              </span>
                            )}
                            {!isDone && !isPending && (
                              <ChevronRight size={14} className={`text-muted/30 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                            )}
                          </button>

                          {/* Expanded completion form */}
                          {isOpen && !isDone && !isPending && (
                            <div className="px-4 pb-4 pt-0">
                              <div className="border-t border-border/30 pt-3 space-y-3">
                                {/* 1. Closing rationale */}
                                <div>
                                  <p className="text-[11px] font-semibold text-earth mb-1.5">Closing rationale</p>
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {["Verified and confirmed", "Researched and decided", "Document uploaded", "Meeting completed", "Reviewed and approved"].map((q) => (
                                      <button key={q} onClick={() => setCompletionNote((prev) => prev ? `${prev}. ${q}` : q)}
                                        className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-warm/50 text-muted hover:text-earth hover:bg-warm border border-transparent transition-all">
                                        + {q}
                                      </button>
                                    ))}
                                  </div>
                                  <textarea
                                    value={completionNote}
                                    onChange={(e) => setCompletionNote(e.target.value)}
                                    placeholder="Describe what was done, key decisions made, and any reference numbers..."
                                    className="w-full px-3 py-2.5 text-[12px] bg-white border border-border/50 rounded-lg text-earth placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-clay/15 focus:border-clay/30 resize-none"
                                    rows={2}
                                  />
                                </div>

                                {/* 2. Attach artifacts -- links to other pages */}
                                <div>
                                  <p className="text-[11px] font-semibold text-earth mb-1.5">Attach supporting evidence</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <Link
                                      href={`/project/${projectId}/documents`}
                                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-warm/20 hover:bg-warm/40 transition-colors text-[10px] text-earth font-medium"
                                    >
                                      <FileText size={13} className="text-clay shrink-0" />
                                      Upload document
                                    </Link>
                                    <Link
                                      href={`/project/${projectId}/photos`}
                                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-warm/20 hover:bg-warm/40 transition-colors text-[10px] text-earth font-medium"
                                    >
                                      <Camera size={13} className="text-clay shrink-0" />
                                      Upload photos
                                    </Link>
                                  </div>
                                  <p className="text-[9px] text-muted mt-1">Upload files in Documents or Photos, then describe them in the rationale above.</p>
                                </div>

                                {/* 3. Actions */}
                                <div className="flex items-center justify-between pt-1">
                                  <button
                                    onClick={() => { setCompletingTaskId(null); setCompletionNote(""); }}
                                    className="text-[11px] text-muted hover:text-earth transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    disabled={completionLoading || !completionNote.trim()}
                                    onClick={async () => {
                                      if (!user || !task.id) return;
                                      setCompletionLoading(true);
                                      try {
                                        await updateTask(user.uid, projectId, task.id, {
                                          done: true, status: "done",
                                          completedAt: new Date().toISOString(),
                                          completedBy: user.uid,
                                          completionNote: completionNote.trim(),
                                        });
                                        await approveTask(user.uid, projectId, task.id, completionNote.trim());
                                        const nextTask = currentPhaseTasks
                                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                          .find((t) => !t.done && t.status !== "pending-review" && t.id !== task.id);
                                        setCompletingTaskId(nextTask?.id ?? null);
                                        setCompletionNote("");
                                        showToast("Task completed", "success");
                                      } catch {
                                        showToast("Failed to complete task", "error");
                                      } finally {
                                        setCompletionLoading(false);
                                      }
                                    }}
                                    className="flex items-center gap-1.5 px-5 py-2 text-[12px] font-semibold rounded-lg bg-success text-white hover:bg-success/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                                  >
                                    <Check size={13} />
                                    {completionLoading ? "Saving..." : "Complete & Next"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* Phase complete -- show what's next */}
                  {currentPhaseProgress === 100 && currentPhaseTasks.length > 0 && (
                    <div className="rounded-xl border border-success/20 bg-success/3 overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
                          <CheckCircle2 size={20} className="text-success" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-success" style={{ fontFamily: "var(--font-heading)" }}>
                            {["Define", "Finance", "Land", "Design", "Approve", "Assemble", "Build", "Verify", "Operate"][phase]} phase complete!
                          </p>
                          <p className="text-[11px] text-muted mt-0.5">
                            {phase < 8
                              ? `All ${currentPhaseTasks.length} tasks done. Advancing to ${["Finance", "Land", "Design", "Approve", "Assemble", "Build", "Verify", "Operate", "Done"][phase]}.`
                              : "Congratulations! Your project is complete."}
                          </p>
                        </div>
                      </div>
                      {phase < 8 && (
                        <div className="px-4 py-3 border-t border-success/10 bg-success/5">
                          <p className="text-[10px] font-semibold text-earth mb-2">Recommended before moving on:</p>
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/project/${projectId}/documents`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border/50 text-[10px] font-medium text-earth hover:bg-warm/30 transition-colors">
                              <FileText size={11} className="text-clay" /> Review documents
                            </Link>
                            <Link href={`/project/${projectId}/budget`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border/50 text-[10px] font-medium text-earth hover:bg-warm/30 transition-colors">
                              <DollarSign size={11} className="text-clay" /> Check budget
                            </Link>
                            <Link href={`/project/${projectId}/photos`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border/50 text-[10px] font-medium text-earth hover:bg-warm/30 transition-colors">
                              <Camera size={11} className="text-clay" /> Add progress photos
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Budget estimate preview */}
            <div>
              <SectionLabel>Budget Preview</SectionLabel>
              <BudgetDonutChart
                items={budgetItems.map((b) => ({
                  category: b.category,
                  amount: b.estimated,
                }))}
                total={project.totalBudget}
                currency={marketData.currency}
              />
            </div>
          </div>

          {/* Financing hint */}
          <Card padding="md" className="mb-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-[var(--radius)] bg-warm flex items-center justify-center shrink-0">
                <DollarSign size={18} className="text-clay" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-earth mb-0.5">
                  {market === "USA" ? "Loan Qualification Quick-Check" : "Savings Tracker"}
                </p>
                <p className="text-[11px] text-muted leading-relaxed">
                  {market === "USA" ? (
                    <>
                      Most construction loans require 20-25% down and a{" "}
                      <LearnTooltip
                        term="DTI (Debt-to-Income Ratio)"
                        explanation="Your total monthly debts divided by your gross monthly income. Lenders typically require this to be below 43% for construction loans."
                        whyItMatters="If your DTI is too high, you will not qualify for a construction loan. Paying down existing debts before applying can improve your ratio."
                      >
                        <span className="underline decoration-dotted cursor-help">debt-to-income ratio</span>
                      </LearnTooltip>{" "}
                      below 43%. Set your budget and financing details to see estimated qualification.
                    </>
                  ) : (
                    "Building in phases with cash is the most common approach. Track your savings milestones and plan each construction phase around your funding availability."
                  )}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* PHASE 2-4: Land / Design / Approve — Document-heavy planning      */}
      {/* ----------------------------------------------------------------- */}
      {phase >= 2 && phase <= 4 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            {/* Document checklist */}
            <div>
              <SectionLabel>Documents Needed</SectionLabel>
              <Card padding="sm">
                {(() => {
                  const templates = getTemplatesForPhase(market, currentPhaseKey);
                  const docItems = templates.length > 0
                    ? templates.map((t) => ({ label: t.name, required: t.required }))
                    : [
                        { label: "Site survey / plat", required: true },
                        { label: "Architectural plans", required: phase >= 3 },
                        { label: "Building permit application", required: phase >= 4 },
                        { label: "Contractor bids", required: phase >= 4 },
                      ];
                  return docItems.map((doc, i, arr) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2.5 py-2 text-[12px] ${
                        i < arr.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <FileText size={14} className="text-muted shrink-0" />
                      <span className="flex-1 text-earth">{doc.label}</span>
                      {doc.required && (
                        <Badge variant="info">Required</Badge>
                      )}
                    </div>
                  ));
                })()}
              </Card>
            </div>

            {/* Budget breakdown chart */}
            <div>
              <SectionLabel>Budget Breakdown</SectionLabel>
              <CategoryBreakdownChart
                items={budgetItems.map((b) => ({
                  category: b.category,
                  estimated: b.estimated,
                  actual: b.actual,
                }))}
                currency={marketData.currency}
              />
            </div>
          </div>

          {/* Timeline preview */}
          <Card padding="md" className="mb-5">
            <h4 className="text-[12px] font-semibold text-earth mb-2">Timeline Preview</h4>
            <div className="flex items-center gap-2 text-[11px] text-muted mb-2">
              <CalendarCheck size={14} className="text-clay" />
              <span>
                Estimated {project.totalWeeks} weeks total
                {phaseDef ? ` -- current phase: ${phaseDef.typicalDurationWeeks.min}-${phaseDef.typicalDurationWeeks.max} weeks typical` : ""}
              </span>
            </div>
            <ProgressBar
              value={project.totalWeeks > 0 ? Math.round((project.currentWeek / project.totalWeeks) * 100) : 0}
              color="var(--color-info)"
            />
            <div className="flex justify-between text-[9px] text-muted mt-1 font-data">
              <span>Week {project.currentWeek}</span>
              <span>Week {project.totalWeeks}</span>
            </div>
          </Card>

          {/* Next steps */}
          <Card padding="md" className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[12px] font-semibold text-earth">Next Steps</h4>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowMilestoneDropdown(!showMilestoneDropdown)}
                    className="flex items-center gap-1 text-[11px] text-clay hover:underline cursor-pointer"
                  >
                    <ListChecks size={12} /> From milestones
                  </button>
                  {showMilestoneDropdown && (
                    <MilestoneDropdown
                      milestones={phaseDef?.milestones ?? []}
                      existingTasks={tasks}
                      onClose={() => setShowMilestoneDropdown(false)}
                      onCreate={handleBulkCreateFromMilestones}
                    />
                  )}
                </div>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="flex items-center gap-1 text-[11px] text-info hover:underline cursor-pointer"
                >
                  <Plus size={12} /> Add task
                </button>
              </div>
            </div>
            {showAddTask && (
              <div className="mb-3 space-y-2 border border-border rounded-[var(--radius)] p-3 bg-surface">
                <input
                  type="text"
                  value={newTaskLabel}
                  onChange={(e) => setNewTaskLabel(e.target.value)}
                  placeholder="Task name"
                  className="w-full px-3 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Detailed instructions for the contractor"
                  rows={2}
                  className="w-full px-3 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 resize-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-muted mb-0.5">Assign to</label>
                    <select
                      value={selectedContactId}
                      onChange={(e) => setSelectedContactId(e.target.value)}
                      className="w-full px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Unassigned</option>
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}{c.role ? ` (${c.role})` : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted mb-0.5">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as "normal" | "urgent" | "critical")}
                      className="w-full px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth focus:outline-none focus:border-emerald-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted mb-0.5">Price ({marketData?.currency?.symbol || "$"})</label>
                    <input
                      type="number"
                      value={taskPrice}
                      onChange={(e) => setTaskPrice(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="any"
                      className="w-full px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted mb-0.5">Due date</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-[11px] text-earth cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requirePhoto}
                      onChange={(e) => setRequirePhoto(e.target.checked)}
                      className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                    />
                    Require photo proof
                  </label>
                  <label className="flex items-center gap-2 text-[11px] text-earth cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireApproval}
                      onChange={(e) => setRequireApproval(e.target.checked)}
                      className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                    />
                    Require my approval
                  </label>
                </div>
                {tasks.filter(t => !t.done && t.id).length > 0 && (
                  <div>
                    <label className="block text-[10px] text-muted mb-0.5">Depends on (prerequisites)</label>
                    <div className="max-h-[100px] overflow-y-auto border border-border rounded-[var(--radius)] bg-white p-1.5 space-y-1">
                      {tasks.filter(t => !t.done && t.id).map(t => (
                        <label key={t.id} className="flex items-center gap-2 text-[11px] text-earth cursor-pointer hover:bg-warm/30 rounded px-1 py-0.5">
                          <input
                            type="checkbox"
                            checked={taskDependsOn.includes(t.id!)}
                            onChange={(e) => {
                              if (e.target.checked) setTaskDependsOn(prev => [...prev, t.id!]);
                              else setTaskDependsOn(prev => prev.filter(id => id !== t.id!));
                            }}
                            className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                          />
                          {t.label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleAddTask}
                    disabled={!newTaskLabel.trim()}
                    className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
                  >
                    Add
                  </button>
                  <button
                    onClick={resetTaskForm}
                    className="p-1 text-muted hover:text-earth transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {activeTasks.slice(0, 4).map((task, i) => {
                const blockInfo = isTaskBlocked(task, tasks);
                return (
                <div key={task.id} className="space-y-0.5">
                  <div className="flex items-center gap-2 text-[12px]">
                    {blockInfo.blocked ? (
                      <Lock size={14} className="text-muted/50 shrink-0" />
                    ) : (
                      <div
                        className="w-4 h-4 rounded border-[1.5px] border-border-dark shrink-0 cursor-pointer hover:border-emerald-500 transition-colors"
                        onClick={() => setCompletingTaskId(completingTaskId === task.id ? null : task.id!)}
                      />
                    )}
                    {editingTaskId === task.id ? (
                      <input
                        type="text"
                        value={editingTaskLabel}
                        onChange={(e) => setEditingTaskLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditTaskSave(task.id!);
                          if (e.key === "Escape") { setEditingTaskId(null); setEditingTaskLabel(""); }
                        }}
                        onBlur={() => handleEditTaskSave(task.id!)}
                        className="flex-1 px-2 py-0.5 text-[12px] border border-border rounded bg-surface text-earth focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`cursor-pointer hover:text-earth transition-colors ${blockInfo.blocked ? "text-muted/50" : "text-muted"}`}
                        onClick={() => { setEditingTaskId(task.id!); setEditingTaskLabel(task.label); }}
                        title="Click to edit"
                      >
                        {task.label}
                      </span>
                    )}
                    {blockInfo.blocked ? (
                      <Badge variant="default">Blocked</Badge>
                    ) : (
                      <Badge variant={task.status === "in-progress" ? "warning" : "info"}>
                        {task.status === "in-progress" ? "In progress" : "Upcoming"}
                      </Badge>
                    )}
                    <button
                      onClick={() => handleDeleteTask(task.id!)}
                      className="p-0.5 text-muted hover:text-danger transition-colors shrink-0"
                      title="Delete task"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  {blockInfo.blocked && (
                    <p className="text-[10px] text-muted/60 pl-6">Blocked by: {blockInfo.blockedBy.join(", ")}</p>
                  )}
                  {/* Completion panel -- add evidence before marking done */}
                  {completingTaskId === task.id && !blockInfo.blocked && (
                    <div className="ml-6 mt-2 p-3.5 bg-surface rounded-xl border border-success/20 shadow-sm">
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                          <Check size={11} className="text-success" />
                        </div>
                        <p className="text-[11px] font-semibold text-earth">Complete: {task.label}</p>
                      </div>
                      {/* Quick options */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {["Verified and confirmed", "Researched and decided", "Document obtained", "Meeting completed", "Reviewed and approved"].map((q) => (
                          <button key={q} onClick={() => setCompletionNote(q)}
                            className={`px-2 py-1 rounded-md text-[9px] font-medium transition-all ${completionNote === q ? "bg-success/10 text-success border border-success/30" : "bg-warm/40 text-muted hover:text-earth border border-transparent"}`}>
                            {q}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={completionNote}
                        onChange={(e) => setCompletionNote(e.target.value)}
                        placeholder="Add details: what was done, key decisions, documents referenced..."
                        className="w-full px-3 py-2 text-[11px] bg-white border border-border/50 rounded-lg text-earth placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-success/20 focus:border-success/40 resize-none"
                        rows={2}
                      />
                      <div className="flex items-center justify-between mt-2.5">
                        <button
                          onClick={() => { setCompletingTaskId(null); setCompletionNote(""); }}
                          className="px-3 py-1.5 text-[11px] text-muted hover:text-earth transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={completionLoading || !completionNote.trim()}
                          onClick={async () => {
                            if (!user || !task.id) return;
                            setCompletionLoading(true);
                            try {
                              await updateTask(user.uid, projectId, task.id, {
                                done: true, status: "done",
                                completedAt: new Date().toISOString(),
                                completedBy: user.uid,
                                completionNote: completionNote.trim(),
                              });
                              await approveTask(user.uid, projectId, task.id, completionNote.trim());
                              setCompletingTaskId(null);
                              setCompletionNote("");
                              showToast("Task completed", "success");
                            } catch {
                              showToast("Failed to complete task", "error");
                            } finally {
                              setCompletionLoading(false);
                            }
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold rounded-lg bg-success text-white hover:bg-success/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                          <Check size={12} />
                          {completionLoading ? "Saving..." : "Mark Complete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
              {activeTasks.length === 0 && !showAddTask && (
                <p className="text-[11px] text-muted">No active tasks. Add tasks to plan your next steps.</p>
              )}
            </div>
          </Card>
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* PHASE 5: Assemble — Team building                                 */}
      {/* ----------------------------------------------------------------- */}
      {phase === 5 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            {/* Team roster */}
            <div>
              <SectionLabel>Team Roster</SectionLabel>
              <Card padding="sm">
                {(() => {
                  const neededTrades = getTradesForPhase(market, "BUILD");
                  const hiredNames = contacts.map((c) => c.role.toLowerCase());
                  return (
                    <>
                      <div className="flex items-center justify-between text-[11px] text-muted mb-2 pb-2 border-b border-border">
                        <span>{contacts.length} hired</span>
                        <span>{neededTrades.length} trades needed for Build phase</span>
                      </div>
                      {neededTrades.slice(0, 8).map((trade, i, arr) => {
                        const hired = hiredNames.some(
                          (h) => h.includes(trade.name.toLowerCase().split(" ")[0])
                        );
                        return (
                          <div
                            key={trade.id}
                            className={`flex items-center justify-between py-1.5 text-[12px] ${
                              i < arr.length - 1 ? "border-b border-border" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Users size={12} className="text-muted" />
                              <span className="text-earth">{trade.name}</span>
                            </div>
                            <Badge variant={hired ? "success" : "warning"}>
                              {hired ? "Hired" : "Needed"}
                            </Badge>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </Card>
            </div>

            {/* Contract status + Budget finalization */}
            <div className="space-y-3">
              <div>
                <SectionLabel>Contract Status</SectionLabel>
                <Card padding="md">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <p className="font-data text-lg font-medium text-earth">{contacts.length}</p>
                      <p className="text-[9px] text-muted uppercase tracking-wider">Contractors</p>
                    </div>
                    <div>
                      <p className="font-data text-lg font-medium text-earth">{budgetItems.length}</p>
                      <p className="text-[9px] text-muted uppercase tracking-wider">Budget Lines</p>
                    </div>
                  </div>
                </Card>
              </div>
              <div>
                <SectionLabel>Budget Finalization</SectionLabel>
                <Card padding="md">
                  <p className="text-[12px] text-earth font-medium mb-1">Review your budget before breaking ground</p>
                  <p className="text-[11px] text-muted leading-relaxed mb-3">
                    Ensure all estimates are confirmed with contractor bids. Add contingency (recommended 15%) for unexpected costs.
                  </p>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted">Budget utilization</span>
                    <span className="font-data text-earth">{budgetUtilization}%</span>
                  </div>
                  <ProgressBar
                    value={budgetUtilization}
                    color={budgetUtilization > 95 ? "var(--color-danger)" : budgetUtilization > 80 ? "var(--color-warning)" : "var(--color-success)"}
                  />
                </Card>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* PHASE 6: Build — Construction command center                      */}
      {/* ----------------------------------------------------------------- */}
      {phase === 6 && (
        <>
          {/* Daily Pulse Bar */}
          <div className="mb-4">
            <DailyPulseBar
              weather={dailyLogs[0]?.weather ?? ""}
              crewSize={dailyLogs[0]?.crew ?? 0}
              activeTrades={contacts.slice(0, 3).map((c) => c.role.split(" ")[0])}
              lastLogHoursAgo={
                dailyLogs[0]?.createdAt
                  ? Math.max(0, (Date.now() - new Date(dailyLogs[0].createdAt).getTime()) / 3600000)
                  : -1
              }
            />
          </div>

          {/* Spend Velocity + Progress S-Curve */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <SpendVelocityChart
              planned={generatePlannedSpend(project.totalBudget, project.totalWeeks)}
              actual={generateActualSpend(project.totalSpent, project.currentWeek)}
              currency={marketData.currency}
            />
            <ProgressSCurve
              planned={generatePlannedProgress(project.totalWeeks)}
              actual={generateActualProgress(project.progress, project.currentWeek)}
              currentWeek={project.currentWeek}
            />
          </div>

          {/* Active tasks */}
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Active Tasks</SectionLabel>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted font-data">{activeTasks.length} open</span>
              <div className="relative">
                <button
                  onClick={() => setShowMilestoneDropdown(!showMilestoneDropdown)}
                  className="flex items-center gap-1 text-[11px] text-clay hover:underline cursor-pointer"
                >
                  <ListChecks size={12} /> From milestones
                </button>
                {showMilestoneDropdown && (
                  <MilestoneDropdown
                    milestones={phaseDef?.milestones ?? []}
                    existingTasks={tasks}
                    onClose={() => setShowMilestoneDropdown(false)}
                    onCreate={handleBulkCreateFromMilestones}
                  />
                )}
              </div>
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1 text-[11px] text-info hover:underline cursor-pointer"
              >
                <Plus size={12} /> Add task
              </button>
            </div>
          </div>

          {/* Inline add task */}
          {showAddTask && (
            <Card padding="sm" className="mb-2">
              <div className="space-y-2">
                <input
                  type="text"
                  value={newTaskLabel}
                  onChange={(e) => setNewTaskLabel(e.target.value)}
                  placeholder="Task name"
                  className="w-full px-3 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Detailed instructions for the contractor"
                  rows={2}
                  className="w-full px-3 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 resize-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-muted mb-0.5">Assign to</label>
                    <select
                      value={selectedContactId}
                      onChange={(e) => setSelectedContactId(e.target.value)}
                      className="w-full px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Unassigned</option>
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}{c.role ? ` (${c.role})` : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted mb-0.5">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as "normal" | "urgent" | "critical")}
                      className="w-full px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth focus:outline-none focus:border-emerald-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted mb-0.5">Price ({marketData?.currency?.symbol || "$"})</label>
                    <input
                      type="number"
                      value={taskPrice}
                      onChange={(e) => setTaskPrice(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="any"
                      className="w-full px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted mb-0.5">Due date</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-[11px] text-earth cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requirePhoto}
                      onChange={(e) => setRequirePhoto(e.target.checked)}
                      className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                    />
                    Require photo proof
                  </label>
                  <label className="flex items-center gap-2 text-[11px] text-earth cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireApproval}
                      onChange={(e) => setRequireApproval(e.target.checked)}
                      className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                    />
                    Require my approval
                  </label>
                </div>
                {tasks.filter(t => !t.done && t.id).length > 0 && (
                  <div>
                    <label className="block text-[10px] text-muted mb-0.5">Depends on (prerequisites)</label>
                    <div className="max-h-[100px] overflow-y-auto border border-border rounded-[var(--radius)] bg-white p-1.5 space-y-1">
                      {tasks.filter(t => !t.done && t.id).map(t => (
                        <label key={t.id} className="flex items-center gap-2 text-[11px] text-earth cursor-pointer hover:bg-warm/30 rounded px-1 py-0.5">
                          <input
                            type="checkbox"
                            checked={taskDependsOn.includes(t.id!)}
                            onChange={(e) => {
                              if (e.target.checked) setTaskDependsOn(prev => [...prev, t.id!]);
                              else setTaskDependsOn(prev => prev.filter(id => id !== t.id!));
                            }}
                            className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                          />
                          {t.label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleAddTask}
                    disabled={!newTaskLabel.trim()}
                    className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
                  >
                    Add
                  </button>
                  <button
                    onClick={resetTaskForm}
                    className="p-1 text-muted hover:text-earth transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {activeTasks.length > 0 && (
            <Card padding="sm" className="mb-4">
              {activeTasks.slice(0, 6).map((task, i) => {
                const blockInfo = isTaskBlocked(task, tasks);
                return (
                <div
                  key={task.id}
                  className={`py-1.5 text-[12px] ${
                    i < Math.min(activeTasks.length, 6) - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {blockInfo.blocked ? (
                      <Lock size={14} className="text-muted/50 shrink-0" />
                    ) : (
                      <div
                        className="w-4 h-4 rounded border-[1.5px] border-border-dark shrink-0 cursor-pointer hover:border-emerald-500 transition-colors"
                        onClick={() => setCompletingTaskId(completingTaskId === task.id ? null : task.id!)}
                      />
                    )}
                    {editingTaskId === task.id ? (
                      <input
                        type="text"
                        value={editingTaskLabel}
                        onChange={(e) => setEditingTaskLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditTaskSave(task.id!);
                          if (e.key === "Escape") { setEditingTaskId(null); setEditingTaskLabel(""); }
                        }}
                        onBlur={() => handleEditTaskSave(task.id!)}
                        className="flex-1 px-2 py-0.5 text-[12px] border border-border rounded bg-surface text-earth focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`flex-1 cursor-pointer hover:text-earth transition-colors ${blockInfo.blocked ? "text-muted/50" : "text-muted"}`}
                        onClick={() => { setEditingTaskId(task.id!); setEditingTaskLabel(task.label); }}
                        title="Click to edit"
                      >
                        {task.label}
                      </span>
                    )}
                    {blockInfo.blocked ? (
                      <Badge variant="default">Blocked</Badge>
                    ) : (
                      <Badge variant={task.status === "in-progress" ? "warning" : "info"}>
                        {task.status === "in-progress" ? "In progress" : "Upcoming"}
                      </Badge>
                    )}
                    <button
                      onClick={() => handleDeleteTask(task.id!)}
                      className="p-0.5 text-muted hover:text-danger transition-colors shrink-0"
                      title="Delete task"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  {blockInfo.blocked && (
                    <p className="text-[10px] text-muted/60 pl-6 mt-0.5">Blocked by: {blockInfo.blockedBy.join(", ")}</p>
                  )}
                  {/* Completion panel */}
                  {completingTaskId === task.id && !blockInfo.blocked && (
                    <div className="ml-6 mt-1.5 p-3 bg-warm/30 rounded-lg border border-border/40">
                      <p className="text-[10px] font-medium text-earth mb-1.5">How did you complete this?</p>
                      <textarea
                        value={completionNote}
                        onChange={(e) => setCompletionNote(e.target.value)}
                        placeholder="Describe what was done, decisions made, or relevant details..."
                        className="w-full px-2.5 py-2 text-[11px] bg-white/80 border border-border/50 rounded-lg text-earth placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-clay/30 resize-none"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          disabled={completionLoading}
                          onClick={async () => {
                            if (!user || !task.id) return;
                            setCompletionLoading(true);
                            try {
                              await updateTask(user.uid, projectId, task.id, {
                                done: true, status: "done",
                                completedAt: new Date().toISOString(),
                                completedBy: user.uid,
                                completionNote: completionNote.trim() || "Completed",
                              });
                              await approveTask(user.uid, projectId, task.id, completionNote.trim() || "Completed");
                              setCompletingTaskId(null);
                              setCompletionNote("");
                              showToast("Task completed", "success");
                            } catch {
                              showToast("Failed to complete task", "error");
                            } finally {
                              setCompletionLoading(false);
                            }
                          }}
                          className="px-3 py-1.5 text-[11px] font-medium rounded-lg bg-success text-white hover:bg-success/90 disabled:opacity-50 transition-colors"
                        >
                          {completionLoading ? "Saving..." : "Mark Complete"}
                        </button>
                        <button
                          onClick={() => { setCompletingTaskId(null); setCompletionNote(""); }}
                          className="px-3 py-1.5 text-[11px] text-muted hover:text-earth transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </Card>
          )}

          {/* Risk alerts + Milestone timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <SectionLabel>Risk Alerts</SectionLabel>
              <div className="space-y-1.5">
                {project.totalSpent > project.totalBudget * 0.9 && (
                  <AlertBanner variant="danger">
                    Budget {Math.round((project.totalSpent / project.totalBudget) * 100)}% spent with {100 - project.progress}% of work remaining
                  </AlertBanner>
                )}
                {project.totalSpent > project.totalBudget * 0.75 && project.progress < 50 && (
                  <AlertBanner variant="danger">
                    Spend rate exceeds progress rate -- review scope and costs
                  </AlertBanner>
                )}
                {activeTasks.length > 5 && (
                  <AlertBanner variant="warning">
                    {activeTasks.length} open tasks -- consider prioritizing critical path items
                  </AlertBanner>
                )}
                {dailyLogs.length > 0 && dailyLogs[0].crew === 0 && (
                  <AlertBanner variant="warning">
                    No crew reported on latest log -- verify site activity
                  </AlertBanner>
                )}
                {activeTasks.length <= 5 && project.progress < 100 && project.totalSpent <= project.totalBudget * 0.9 && (
                  <AlertBanner variant="info">
                    Project on track -- {activeTasks.length} active tasks in current sub-phase
                  </AlertBanner>
                )}
              </div>
            </div>
            <div>
              <SectionLabel>Milestones</SectionLabel>
              {phaseDef ? (
                <MilestoneTimeline
                  milestones={phaseDef.milestones.map((m, i) => {
                    const phaseProgress = allMilestoneProgress[currentPhaseKey] ?? [];
                    const isComplete = phaseProgress[i] ?? false;
                    const firstIncomplete = phaseDef.milestones.findIndex(
                      (_, idx) => !(phaseProgress[idx] ?? false)
                    );
                    return {
                      name: m.name,
                      status: isComplete
                        ? "completed" as const
                        : i === firstIncomplete
                        ? "current" as const
                        : "upcoming" as const,
                      paymentPct: m.paymentPct,
                    };
                  })}
                />
              ) : (
                <Card padding="sm">
                  <p className="text-[11px] text-muted py-2">No milestone data available for this market.</p>
                </Card>
              )}
            </div>
          </div>

          {/* Recent photos strip */}
          {photos.length > 0 && (
            <div className="mb-4">
              <SectionLabel>Recent Photos</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {photos.slice(0, 4).map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square bg-warm border border-border rounded-[var(--radius)] overflow-hidden relative"
                  >
                    {photo.fileUrl ? (
                      <img
                        src={photo.fileUrl}
                        alt={photo.caption || "Site photo"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera size={20} className="text-muted" />
                      </div>
                    )}
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-earth/70 px-1.5 py-1">
                        <p className="text-[9px] text-warm truncate">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick action buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            <Link
              href={`/project/${projectId}/daily-log`}
              className="flex flex-col items-center gap-1.5 py-3 bg-surface border border-border rounded-[var(--radius)] hover:bg-warm transition-colors"
            >
              <ClipboardList size={18} className="text-clay" />
              <span className="text-[10px] text-earth font-medium">Add daily log</span>
            </Link>
            <Link
              href={`/project/${projectId}/photos`}
              className="flex flex-col items-center gap-1.5 py-3 bg-surface border border-border rounded-[var(--radius)] hover:bg-warm transition-colors"
            >
              <Camera size={18} className="text-clay" />
              <span className="text-[10px] text-earth font-medium">Upload photo</span>
            </Link>
            <Link
              href={`/project/${projectId}/budget`}
              className="flex flex-col items-center gap-1.5 py-3 bg-surface border border-border rounded-[var(--radius)] hover:bg-warm transition-colors"
            >
              <DollarSign size={18} className="text-clay" />
              <span className="text-[10px] text-earth font-medium">Record expense</span>
            </Link>
            <button
              onClick={() => setShowAddChangeOrder(true)}
              className="flex flex-col items-center gap-1.5 py-3 bg-surface border border-border rounded-[var(--radius)] hover:bg-warm transition-colors"
            >
              <FilePlus size={18} className="text-clay" />
              <span className="text-[10px] text-earth font-medium">Change order</span>
            </button>
          </div>
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* PHASE 7: Verify — Punch list and inspections                     */}
      {/* ----------------------------------------------------------------- */}
      {phase === 7 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            {/* Punch list donut */}
            <div>
              <SectionLabel>Punch List Status</SectionLabel>
              <PunchListDonut
                open={punchListItems.filter((p) => p.status === "open").length}
                inProgress={punchListItems.filter((p) => p.status === "in-progress").length}
                resolved={punchListItems.filter((p) => p.status === "resolved").length}
              />
            </div>

            {/* Inspection summary + Final payment tracker */}
            <div className="space-y-3">
              <div>
                <SectionLabel>Inspection Summary</SectionLabel>
                <Card padding="md">
                  <div className="space-y-2">
                    {[
                      { label: "Final building inspection", status: project.progress >= 95 ? "Scheduled" : "Pending" },
                      { label: "Final mechanical inspection", status: project.progress >= 90 ? "Passed" : "Pending" },
                      { label: "Certificate of Occupancy", status: project.progress >= 98 ? "Applied" : "Pending" },
                    ].map((insp, i, arr) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between py-1.5 text-[12px] ${
                          i < arr.length - 1 ? "border-b border-border" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className="text-muted" />
                          <span className="text-earth">{insp.label}</span>
                        </div>
                        <Badge variant={insp.status === "Passed" ? "success" : insp.status === "Scheduled" ? "warning" : "info"}>
                          {insp.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              <div>
                <SectionLabel>Final Payment Tracker</SectionLabel>
                <Card padding="md">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted">Payments released</span>
                    <span className="font-data text-earth">{budgetUtilization}%</span>
                  </div>
                  <ProgressBar
                    value={budgetUtilization}
                    color={budgetUtilization > 95 ? "var(--color-success)" : "var(--color-warning)"}
                  />
                  <div className="grid grid-cols-2 gap-3 mt-3 text-center">
                    <div>
                      <p className="font-data text-sm font-medium text-earth">{fmtCompact(project.totalSpent)}</p>
                      <p className="text-[9px] text-muted uppercase">Released</p>
                    </div>
                    <div>
                      <p className="font-data text-sm font-medium text-earth">{fmtCompact(project.totalBudget - project.totalSpent)}</p>
                      <p className="text-[9px] text-muted uppercase">Retained</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* PHASE 8: Operate — Post-construction management                  */}
      {/* ----------------------------------------------------------------- */}
      {phase === 8 && (
        <>
          {/* Purpose-specific cards */}
          {project.purpose === "RENT" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
              <div>
                <SectionLabel>Rental Income</SectionLabel>
                <Card padding="md">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-[var(--radius)] bg-warm flex items-center justify-center shrink-0">
                      <TrendingUp size={18} className="text-clay" />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-earth mb-0.5">Track Rental Income</p>
                      <p className="text-[11px] text-muted leading-relaxed">
                        Set up your rental units, track monthly income, expenses, and occupancy rates.
                        Your total construction cost was {fmtCompact(project.totalSpent)}.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
              <div>
                <SectionLabel>Occupancy</SectionLabel>
                <Card padding="md" className="text-center">
                  <p className="font-data text-2xl font-medium text-earth">--</p>
                  <p className="text-[9px] text-muted uppercase tracking-wider mt-1">Occupancy Rate</p>
                  <p className="text-[11px] text-muted mt-2">Set up units to begin tracking.</p>
                </Card>
              </div>
            </div>
          )}

          {project.purpose === "SELL" && (
            <div className="mb-5">
              <SectionLabel>Market Readiness</SectionLabel>
              <Card padding="sm">
                {[
                  { label: "Final inspection passed", done: true },
                  { label: "Certificate of Occupancy obtained", done: false },
                  { label: "Professional photography complete", done: false },
                  { label: "Property listing prepared", done: false },
                  { label: "Staging complete", done: false },
                ].map((item, i, arr) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 py-2 text-[12px] ${
                      i < arr.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border-[1.5px] shrink-0 flex items-center justify-center ${
                        item.done ? "bg-success border-success" : "border-border-dark"
                      }`}
                    >
                      {item.done && (
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className={`flex-1 ${item.done ? "text-muted line-through opacity-50" : "text-earth"}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {project.purpose === "OCCUPY" && (
            <Card padding="md" className="mb-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[var(--radius)] bg-warm flex items-center justify-center shrink-0">
                  <Home size={18} className="text-clay" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-earth mb-0.5">Welcome Home</p>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Your construction project is complete. Track warranty items, schedule maintenance,
                    and keep records of your home in one place.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Warranty + Maintenance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            <div>
              <SectionLabel>Warranty Reminders</SectionLabel>
              <Card padding="sm">
                {[
                  { label: "General contractor warranty (1 year)", expires: "Mar 2027" },
                  { label: "Roof warranty (20 years)", expires: "Mar 2046" },
                  { label: "HVAC equipment warranty (10 years)", expires: "Mar 2036" },
                  { label: "Appliance warranties (varies)", expires: "Check manuals" },
                ].map((w, i, arr) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-2 text-[12px] ${
                      i < arr.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <span className="text-earth">{w.label}</span>
                    <span className="text-[10px] font-data text-muted">{w.expires}</span>
                  </div>
                ))}
              </Card>
            </div>
            <div>
              <SectionLabel>Maintenance Schedule</SectionLabel>
              <Card padding="sm">
                {[
                  { task: "HVAC filter replacement", frequency: "Every 3 months" },
                  { task: "Gutter cleaning", frequency: "Twice yearly" },
                  { task: "Water heater flush", frequency: "Annually" },
                  { task: "Roof inspection", frequency: "Annually" },
                  { task: "Pest inspection", frequency: "Annually" },
                ].map((m, i, arr) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-2 text-[12px] ${
                      i < arr.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <span className="text-earth">{m.task}</span>
                    <span className="text-[10px] text-muted">{m.frequency}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Common bottom section: Project details + Completed tasks          */}
      {/* Shown for all phases                                             */}
      {/* ----------------------------------------------------------------- */}
      <CollapsibleSection title="Project Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Card padding="sm">
            <DetailRow label="Market" value={<MarketBadge market={market} />} />
            <DetailRow label="Purpose" value={project.purpose} />
            <DetailRow label="Type" value={project.propertyType === "SFH" ? "Single-family home" : project.propertyType ? project.propertyType.charAt(0) + project.propertyType.slice(1).toLowerCase() : ""} />
            {phaseDef && (
              <DetailRow label="Method" value={phaseDef.constructionMethod} />
            )}
            <DetailRow label="Details" value={project.details} last />
          </Card>
          <div className="mt-2">
            <button
              onClick={() => setShowDeleteProject(true)}
              className="text-[11px] text-danger hover:underline cursor-pointer"
            >
              Delete project
            </button>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-clay/60 mb-2">
            Completed Tasks {completedTasks.length > 0 && <span className="text-success font-data">({completedTasks.length})</span>}
          </p>
          <Card padding="sm">
            {completedTasks.length === 0 ? (
              <p className="text-[11px] text-muted py-2">None yet. Complete tasks above to track your progress.</p>
            ) : (
              completedTasks.slice(0, 8).map((task, i) => (
                <div
                  key={task.id}
                  className={`py-2 ${i < Math.min(completedTasks.length, 8) - 1 ? "border-b border-border/40" : ""}`}
                >
                  <div className="flex items-center gap-2 text-[11px]">
                    <div className="w-4 h-4 rounded border-[1.5px] bg-success border-success shrink-0 flex items-center justify-center">
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="flex-1 text-muted">{task.label}</span>
                    {task.completedAt && (
                      <span className="text-[9px] text-muted/50 font-data shrink-0">
                        {new Date(task.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                  {task.completionNote && task.completionNote !== "Completed" && (
                    <p className="ml-6 mt-1 text-[10px] text-muted/70 leading-relaxed bg-success/5 px-2 py-1 rounded">
                      {task.completionNote}
                    </p>
                  )}
                </div>
              ))
            )}
            {completedTasks.length > 8 && (
              <p className="text-[10px] text-muted text-center pt-1">+{completedTasks.length - 8} more completed</p>
            )}
          </Card>
        </div>
      </div>
      </CollapsibleSection>

      {/* Contractor Rating Prompt */}
      {ratingTaskId && (() => {
        const ratedTask = tasks.find((t) => t.id === ratingTaskId);
        if (!ratedTask) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-earth/50 backdrop-blur-sm" onClick={() => setRatingTaskId(null)} />
            <div className="relative bg-surface border border-border rounded-xl shadow-lg max-w-sm w-full p-5">
              <h3 className="text-[14px] font-semibold text-earth mb-1">Rate contractor</h3>
              <p className="text-[12px] text-muted mb-3">
                How did <strong className="text-earth">{ratedTask.assignedName}</strong> perform on <strong className="text-earth">{ratedTask.label}</strong>?
              </p>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingStars(star)}
                    className="p-0.5 transition-colors"
                    title={`${star} star${star !== 1 ? "s" : ""}`}
                  >
                    <Star
                      size={24}
                      className={star <= ratingStars ? "text-warning fill-warning" : "text-border"}
                    />
                  </button>
                ))}
                <span className="ml-2 text-[12px] font-data text-earth">{ratingStars}/5</span>
              </div>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Optional comment..."
                rows={2}
                className="w-full px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-white text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 resize-none mb-3"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => {
                    setRatingTaskId(null);
                    setRatingStars(5);
                    setRatingComment("");
                  }}
                  className="px-3 py-1.5 text-[12px] text-muted hover:text-earth transition-colors"
                >
                  Skip
                </button>
                <button
                  disabled={ratingSubmitting}
                  onClick={async () => {
                    if (!user || !ratedTask.assignedTo) return;
                    setRatingSubmitting(true);
                    try {
                      await addContractorRating(user.uid, {
                        projectId,
                        contactId: ratedTask.assignedTo,
                        contactName: ratedTask.assignedName || "Unknown",
                        taskId: ratedTask.id!,
                        taskLabel: ratedTask.label,
                        overall: ratingStars,
                        comment: ratingComment.trim() || undefined,
                      });
                      showToast("Rating submitted.", "success");
                    } catch {
                      showToast("Failed to submit rating.", "error");
                    } finally {
                      setRatingSubmitting(false);
                      setRatingTaskId(null);
                      setRatingStars(5);
                      setRatingComment("");
                    }
                  }}
                  className="px-4 py-1.5 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
                >
                  {ratingSubmitting ? "Submitting..." : "Submit rating"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          project={project}
          data={{
            budgetItems,
            contacts,
            dailyLogs,
            documents,
            photos,
            tasks,
            inspectionResults,
            punchListItems,
            materials,
          }}
          onClose={() => setShowExportModal(false)}
          userPlan={profile?.plan}
          userRole={profile?.role}
          orgLogo={profile?.orgLogo}
        />
      )}

      {/* Presentation Modal */}
      {showPresentationModal && (
        <PresentationModal
          data={{
            project,
            budgetItems,
            contacts,
            dailyLogs,
            tasks,
            photos,
            punchListItems,
            currency: marketData.currency,
            marketName: project.market,
            constructionMethod: marketData.phases[0]?.constructionMethod ?? "Standard construction",
          }}
          onClose={() => setShowPresentationModal(false)}
        />
      )}

      {/* Delete Project Modal */}
      {showDeleteProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-earth/50 backdrop-blur-sm" onClick={() => setShowDeleteProject(false)} />
          <div className="relative bg-surface border border-border rounded-xl shadow-lg max-w-md w-full p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-danger" />
              <h3 className="text-[14px] font-semibold text-earth">Delete project</h3>
            </div>
            <p className="text-[12px] text-muted mb-3 leading-relaxed">
              This will permanently delete <strong className="text-earth">{project.name}</strong> and all its data. This action cannot be undone. Type the project name to confirm.
            </p>
            <input
              type="text"
              value={deleteProjectName}
              onChange={(e) => setDeleteProjectName(e.target.value)}
              placeholder={project.name}
              className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-danger w-full mb-3"
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => { setShowDeleteProject(false); setDeleteProjectName(""); }}
                className="px-4 py-2 text-[12px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={deleteProjectName !== project.name || deletingProject}
                className="px-4 py-2 text-[12px] bg-danger text-white rounded-[var(--radius)] hover:bg-danger/90 transition-colors disabled:opacity-40"
              >
                {deletingProject ? "Deleting..." : "Delete project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DetailRow({ label, value, last }: { label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1.5 text-[11px] ${last ? "" : "border-b border-border"}`}>
      <span className="text-muted">{label}</span>
      <span className="text-earth font-medium">{typeof value === "string" ? value : value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MilestoneDropdown — bulk create tasks from phase milestones
// ---------------------------------------------------------------------------

function MilestoneDropdown({
  milestones,
  existingTasks,
  onClose,
  onCreate,
}: {
  milestones: { name: string; order: number }[];
  existingTasks: { label: string }[];
  onClose: () => void;
  onCreate: (selected: { name: string; order: number }[]) => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Filter out milestones that already exist as tasks
  const existingLabels = new Set(existingTasks.map(t => t.label.toLowerCase()));
  const available = milestones.filter(m => !existingLabels.has(m.name.toLowerCase()));

  if (available.length === 0) {
    return (
      <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-white border border-border rounded-[var(--radius)] shadow-lg p-3">
        <p className="text-[11px] text-muted mb-2">All milestones for this phase have already been added as tasks.</p>
        <button onClick={onClose} className="text-[11px] text-info hover:underline">Close</button>
      </div>
    );
  }

  function toggleAll() {
    if (selected.size === available.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(available.map((_, i) => i)));
    }
  }

  return (
    <div className="absolute right-0 top-full mt-1 z-50 w-72 bg-white border border-border rounded-[var(--radius)] shadow-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-earth">Create tasks from milestones</span>
        <button onClick={onClose} className="p-0.5 text-muted hover:text-earth">
          <X size={12} />
        </button>
      </div>
      <p className="text-[10px] text-muted mb-2">
        Selected milestones become tasks with auto-suggested sequential dependencies.
      </p>
      <button onClick={toggleAll} className="text-[10px] text-info hover:underline mb-1.5">
        {selected.size === available.length ? "Deselect all" : "Select all"}
      </button>
      <div className="max-h-[180px] overflow-y-auto space-y-1 mb-2">
        {available.map((ms, i) => (
          <label key={ms.order} className="flex items-center gap-2 text-[11px] text-earth cursor-pointer hover:bg-warm/30 rounded px-1 py-0.5">
            <input
              type="checkbox"
              checked={selected.has(i)}
              onChange={(e) => {
                const next = new Set(selected);
                if (e.target.checked) next.add(i);
                else next.delete(i);
                setSelected(next);
              }}
              className="rounded border-border text-emerald-600 focus:ring-emerald-500"
            />
            <span className="flex-1">{ms.name}</span>
            <span className="text-[9px] text-muted">#{ms.order + 1}</span>
          </label>
        ))}
      </div>
      <button
        onClick={() => {
          const items = available.filter((_, i) => selected.has(i));
          onCreate(items);
        }}
        disabled={selected.size === 0}
        className="w-full py-1.5 text-[11px] font-medium bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
      >
        Create {selected.size} task{selected.size !== 1 ? "s" : ""}
      </button>
    </div>
  );
}
