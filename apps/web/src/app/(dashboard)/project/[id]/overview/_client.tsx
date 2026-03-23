// TODO: Many hardcoded strings need t() wrapping
"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
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
  updateProject,
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
import { uploadProjectPhoto } from "@/lib/services/photo-upload-service";
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
  Paperclip,
  Loader2,
  CheckCircle,
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

const PHASE_NAMES_EN = ["Define", "Finance", "Land", "Design", "Approve", "Assemble", "Build", "Verify", "Operate"];
const PHASE_NAMES_FR = ["Definir", "Financer", "Terrain", "Concevoir", "Approuver", "Assembler", "Construire", "Verifier", "Exploiter"];

function getPhaseName(phaseIndex: number): string {
  return PHASE_NAMES_EN[phaseIndex] ?? "Define";
}

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
  const [completionPhotos, setCompletionPhotos] = useState<{ url: string; caption?: string }[]>([]);
  const [completionCost, setCompletionCost] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
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

  // Photo attachment handler for task completion
  const handleCompletionPhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !project) return;
    setPhotoUploading(true);
    try {
      const photo = await uploadProjectPhoto(
        user.uid,
        projectId,
        file,
        String(project.currentPhase ?? "BUILD"),
        `Task completion photo`
      );
      setCompletionPhotos((prev) => [...prev, { url: photo.fileUrl }]);
    } catch {
      showToast("Photo upload failed", "error");
    } finally {
      setPhotoUploading(false);
      // Reset file input so the same file can be selected again
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }, [user, project, projectId, showToast]);

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
  const isWelcome = searchParams.get("welcome") === "1";
  const [showWelcome, setShowWelcome] = useState(false);
  const welcomeShownRef = useRef(false);

  // Show welcome banner once when arriving from wizard
  useEffect(() => {
    if (isWelcome && !welcomeShownRef.current && project) {
      welcomeShownRef.current = true;
      setShowWelcome(true);
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [isWelcome, project]);
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

  // AI insights — must be before early return to preserve hook order
  const topInsights = useMemo(() => {
    if (!project) return [];
    try {
      // Use computed progress (from tasks) not stale project.progress (from Firebase)
      const realProgress = tasks.length > 0 ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) : 0;
      const projectWithRealProgress = { ...project, progress: realProgress };
      return generateOverviewInsights(projectWithRealProgress, budgetItems, tasks, dailyLogs, contacts).slice(0, 3);
    } catch { return []; }
  }, [project, budgetItems, tasks, dailyLogs, contacts]);

  // Milestone groups — must be before early return to preserve hook order
  const milestoneGroups = useMemo(() => {
    if (!project) return [];
    const phase = project.currentPhase;
    const currentPhaseKey = PHASE_ORDER[phase] ?? "DEFINE";
    const market = project.market as Market;
    const pDef = getPhaseDefinition(market, currentPhaseKey);
    const ms = pDef?.milestones ?? [];
    const phaseTasks = tasks.filter((t) => t.phase === phase || t.phase == null);
    const hasIdx = phaseTasks.some((t) => t.milestoneIndex != null);
    const sorted = [...phaseTasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const groups: { msIdx: number; milestone: typeof ms[0]; tasks: typeof phaseTasks }[] = [];
    if (ms.length > 0) {
      if (hasIdx) {
        for (let mi = 0; mi < ms.length; mi++) {
          const msTasks = sorted.filter((t) => t.milestoneIndex === mi);
          const ungrouped = mi === ms.length - 1 ? sorted.filter((t) => t.milestoneIndex == null) : [];
          groups.push({ msIdx: mi, milestone: ms[mi], tasks: [...msTasks, ...ungrouped] });
        }
      } else {
        const perMs = Math.max(1, Math.ceil(sorted.length / ms.length));
        for (let mi = 0; mi < ms.length; mi++) {
          groups.push({ msIdx: mi, milestone: ms[mi], tasks: sorted.slice(mi * perMs, (mi + 1) * perMs) });
        }
      }
    }
    return groups;
  }, [project, tasks]);

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
      showToast("Failed to delete project", "error");
      setDeletingProject(false);
    }
  }


  // =========================================================================
  // Computed values for KPI strip
  // =========================================================================
  const openPunch = punchListItems.filter((p) => p.status !== "resolved").length;

  // Recent activity feed — unified from logs, photos, change orders
  const recentActivity = [
    ...dailyLogs.slice(0, 3).map((l) => ({
      type: "log" as const,
      text: `Day ${l.day}${l.weather ? ` — ${l.weather}` : ""}${l.crew ? `, Crew ${l.crew}` : ""}`,
      date: l.createdAt || l.date,
    })),
    ...photos.slice(0, 2).map((p) => ({
      type: "photo" as const,
      text: `Photo${p.phase ? `: ${p.phase}` : ""}${p.caption ? ` — ${p.caption}` : ""}`,
      date: p.date || "",
    })),
    ...changeOrders.slice(0, 2).map((co) => ({
      type: "change" as const,
      text: `CO: ${co.description}`,
      date: co.createdAt || "",
    })),
    ...punchListItems.filter((p) => p.status !== "resolved").slice(0, 2).map((p) => ({
      type: "punch" as const,
      text: `Punch: ${p.description}`,
      date: p.createdAt || "",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  // Milestones for current phase
  const milestones = phaseDef?.milestones ?? [];

  return (
    <>
      {/* ================================================================= */}
      {/*  KPI STRIP — dense, no cards, monospace data                      */}
      {/* ================================================================= */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={phase >= 6 ? "warning" : "info"} className="rounded text-[10px]">
            Phase {phase}
          </Badge>
          <span className="text-[13px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>
            {PHASE_NAMES_EN[phase]}
          </span>
          <MarketBadge market={market} />
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowExportModal(true)} className="p-1.5 rounded text-muted hover:text-earth hover:bg-warm transition-colors" title="Export"><Download size={14} /></button>
          <button onClick={() => setShowPresentationModal(true)} className="p-1.5 rounded text-muted hover:text-earth hover:bg-warm transition-colors" title="Presentations"><Briefcase size={14} /></button>
        </div>
      </div>

      {/* KPI row — clickable deep links */}
      <div className="flex items-stretch gap-px mb-4 bg-border/30 rounded-lg overflow-hidden">
        {[
          { label: "Overall", value: `${computedProgress}%`, sub: `${currentPhaseDone.length}/${currentPhaseTasks.length} phase · ${completedTasks.length}/${tasks.length} total`, href: undefined as string | undefined },
          { label: "Budget", value: fmtCompact(project.totalBudget), sub: `${budgetUtilization}% spent`, href: `/project/${projectId}/budget` },
          { label: "Spent", value: fmtCompact(project.totalSpent), sub: fmtCompact(project.totalBudget - project.totalSpent) + " left", href: `/project/${projectId}/budget` },
          { label: "Timeline", value: `Wk ${project.currentWeek}`, sub: `of est. ${project.totalWeeks} wks`, href: `/project/${projectId}/schedule` },
          { label: "Team", value: String(contacts.length), sub: "contacts", href: `/project/${projectId}/team` },
          { label: "Tasks left", value: String(activeTasks.length), sub: "incomplete", href: undefined as string | undefined },
        ].map((kpi) => {
          const inner = (
            <>
              <p className="text-[15px] font-bold font-data text-earth leading-tight truncate">{kpi.value}</p>
              <p className="text-[8px] text-muted uppercase tracking-wider leading-tight">{kpi.label}</p>
              <p className="text-[9px] font-data text-muted/60 leading-tight truncate">{kpi.sub}</p>
            </>
          );
          return kpi.href ? (
            <Link key={kpi.label} href={kpi.href} className="flex-1 bg-surface px-3 py-2 text-center min-w-0 hover:bg-warm/30 transition-colors">
              {inner}
            </Link>
          ) : (
            <div key={kpi.label} className="flex-1 bg-surface px-3 py-2 text-center min-w-0">
              {inner}
            </div>
          );
        })}
      </div>

      {/* Progress bar — full width, thin */}
      <div className="h-1 bg-warm rounded-full overflow-hidden mb-5">
        <div className="h-full bg-success rounded-full transition-all duration-500" style={{ width: `${computedProgress}%` }} />
      </div>

      {/* ================================================================= */}
      {/*  WELCOME BANNER — shown once after project creation               */}
      {/* ================================================================= */}
      {showWelcome && (
        <div className="mb-4 p-4 rounded-lg bg-success/5 border border-success/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[14px] font-semibold text-earth mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                Your project is ready
              </p>
              <p className="text-[11px] text-muted leading-relaxed mb-2">
                Start by reviewing the items below. Each one confirms a decision you made during setup.
                Once all tasks are complete, you can advance to the next phase.
              </p>
              <div className="flex items-center gap-3 text-[10px]">
                <Link href={`/project/${projectId}/budget`} className="text-clay hover:underline">Review budget</Link>
                <span className="text-muted/30">|</span>
                <Link href={`/project/${projectId}/schedule`} className="text-clay hover:underline">View timeline</Link>
                <span className="text-muted/30">|</span>
                <Link href={`/project/${projectId}/documents`} className="text-clay hover:underline">Check documents</Link>
              </div>
            </div>
            <button onClick={() => setShowWelcome(false)} className="text-muted hover:text-earth p-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/*  REVIEW BANNER — only when items exist                            */}
      {/* ================================================================= */}
      {pendingReviewTasks.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 mb-4 rounded-lg bg-warning/8 border border-warning/20" id="pending-review">
          <div className="flex items-center gap-2">
            <AlertTriangle size={13} className="text-warning shrink-0" />
            <span className="text-[12px] text-earth font-medium">{pendingReviewTasks.length} item{pendingReviewTasks.length !== 1 ? "s" : ""} need your review</span>
          </div>
          <div className="flex items-center gap-1">
            {pendingReviewTasks.slice(0, 3).map((task) => (
              <button
                key={task.id}
                onClick={() => {
                  setCompletingTaskId(task.id!);
                  setCompletionNote("");
                  setCompletionPhotos([]);
                  setCompletionCost("");
                  setTimeout(() => {
                    const el = document.getElementById(`task-${task.id}`);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 100);
                }}
                className="text-[10px] px-2 py-0.5 rounded bg-warning/10 text-warning hover:bg-warning/20 transition-colors truncate max-w-[120px]"
              >
                {task.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/*  TWO-PANEL LAYOUT                                                 */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

        {/* ─── LEFT PANEL: Milestone Workflow ─── */}
        <div>
          {/* Phase label + progress */}
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <h3 className="text-[15px] font-semibold text-earth tracking-[-0.01em]" style={{ fontFamily: "var(--font-heading)" }}>
                {getPhaseName(phase)}
              </h3>
              <span className="text-[11px] font-data text-muted/50">
                {currentPhaseDone.length}/{currentPhaseTasks.length}
              </span>
            </div>
            <div className="w-20 h-[3px] bg-sand/40 rounded-full overflow-hidden">
              <div className="h-full bg-earth/60 rounded-full transition-all duration-700" style={{ width: `${currentPhaseProgress}%` }} />
            </div>
          </div>

          {/* Milestone groups */}
          {milestoneGroups.length > 0 ? (
            <div className="mb-4">
              {(() => {
                const withTasks = milestoneGroups.filter(g => g.tasks.length > 0);
                const emptyMs = milestoneGroups.filter(g => g.tasks.length === 0);

                return (
                  <>
                    {withTasks.map(({ msIdx, milestone, tasks: groupTasks }) => {
                      const allDone = groupTasks.every((t) => t.done);
                      const doneCount = groupTasks.filter((t) => t.done).length;

                      return (
                        <div key={msIdx} className="mb-3">
                          {/* Milestone label */}
                          <div className="flex items-center gap-1.5 mb-0.5 px-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${allDone ? "bg-success" : doneCount > 0 ? "bg-clay" : "bg-sand"}`} />
                            <span className={`text-[10px] font-medium tracking-wide ${allDone ? "text-success/60" : "text-earth/40"}`}>
                              {milestone.name}
                            </span>
                          </div>

                          {/* Tasks */}
                          {groupTasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((task) => {
                            const isOpen = completingTaskId === task.id;
                            const isDone = task.done;
                            const isPending = task.status === "pending-review";

                            return (
                              <div key={task.id} id={`task-${task.id}`}>
                                <button
                                  onClick={() => {
                                    setCompletingTaskId(isOpen ? null : task.id!);
                                    // Pre-fill with existing evidence for review tasks
                                    if (isPending && task.completionNote) {
                                      setCompletionNote(task.completionNote);
                                    } else if (!isOpen) {
                                      setCompletionNote("");
                                    }
                                    if (!isOpen) { setCompletionPhotos([]); setCompletionCost(""); }
                                  }}
                                  className={`w-full flex items-center gap-2.5 px-1 py-[5px] text-left group rounded transition-colors ${isOpen ? "bg-warm/20" : "hover:bg-warm/8"}`}
                                >
                                  <div className={`w-[14px] h-[14px] rounded-[3px] border-[1.5px] shrink-0 flex items-center justify-center transition-colors ${
                                    isDone ? "bg-success/20 border-success/40" : isPending ? "border-warning/40" : "border-sand group-hover:border-clay/40"
                                  }`}>
                                    {isDone && <Check size={9} className="text-success" />}
                                  </div>
                                  <span className={`text-[12px] flex-1 min-w-0 truncate ${isDone ? "text-muted line-through" : "text-earth"}`}>{task.label}</span>
                                  {isDone && task.completedAt && (
                                    <span className="text-[9px] font-data text-muted/40 shrink-0">
                                      {new Date(task.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </span>
                                  )}
                                  {isPending && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-warning/8 text-warning font-medium shrink-0">Review</span>}
                                  {!isDone && !isPending && <ChevronDown size={10} className={`text-muted/20 shrink-0 transition-all opacity-0 group-hover:opacity-100 ${isOpen ? "rotate-180" : ""}`} />}
                                </button>

                            {/* Reopen/edit panel for done tasks */}
                            {isOpen && isDone && (() => {
                              // Pre-load previous evidence into edit state on first open
                              if (completionNote === "" && task.completionNote) {
                                setTimeout(() => setCompletionNote(task.completionNote || ""), 0);
                              }
                              if (completionPhotos.length === 0 && task.completionPhotos?.length) {
                                setTimeout(() => setCompletionPhotos(task.completionPhotos!.map((p: any) => ({ url: p.url || p }))), 0);
                              }
                              return (
                                <div className="px-3 pb-2 pt-1">
                                  <p className="text-[9px] text-muted mb-1.5">
                                    Completed {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ""}
                                    {" "} — edit evidence below or reopen to redo
                                  </p>
                                  <textarea
                                    value={completionNote}
                                    onChange={(e) => setCompletionNote(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-border/40 rounded text-earth placeholder:text-muted/40 focus:outline-none focus:border-clay/30 resize-none"
                                    rows={2}
                                  />
                                  {/* Show existing photos with remove buttons */}
                                  {completionPhotos.length > 0 && (
                                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                      {completionPhotos.map((p, pi) => (
                                        <div key={pi} className="relative w-10 h-10 rounded overflow-hidden border border-border/30">
                                          <Image src={p.url} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                          <button
                                            onClick={() => setCompletionPhotos((prev) => prev.filter((_, j) => j !== pi))}
                                            className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full flex items-center justify-center"
                                          >
                                            <X size={8} className="text-white" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between mt-2">
                                    <button onClick={() => { setCompletingTaskId(null); setCompletionNote(""); setCompletionPhotos([]); setCompletionCost(""); }}
                                      className="text-[9px] text-muted hover:text-earth">Close</button>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={async () => {
                                          if (!user || !task.id) return;
                                          try {
                                            // Update evidence without reopening
                                            const taskUpdate: Record<string, unknown> = {
                                              completionNote: completionNote.trim(),
                                            };
                                            if (completionPhotos.length > 0) {
                                              taskUpdate.completionPhotos = completionPhotos.map((p) => ({ url: p.url, timestamp: new Date().toISOString() }));
                                            } else {
                                              taskUpdate.completionPhotos = null;
                                            }
                                            await updateTask(user.uid, projectId, task.id, taskUpdate);
                                            setCompletingTaskId(null);
                                            setCompletionNote("");
                                            setCompletionPhotos([]);
                                            showToast("Evidence updated", "success");
                                          } catch { showToast("Failed to update", "error"); }
                                        }}
                                        className="px-2.5 py-1 text-[10px] font-medium rounded bg-earth text-warm hover:bg-earth/90 transition-colors"
                                      >
                                        Save changes
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (!user || !task.id) return;
                                          try {
                                            await updateTask(user.uid, projectId, task.id, {
                                              done: false, status: "in-progress",
                                              completedAt: null, completedBy: null,
                                            } as any);
                                            // Keep the note and photos so user can edit
                                            showToast("Task reopened — edit and re-complete when ready", "success");
                                          } catch { showToast("Failed to reopen", "error"); }
                                        }}
                                        className="px-2.5 py-1 text-[10px] font-medium rounded border border-warning/30 text-warning hover:bg-warning/5 transition-colors"
                                      >
                                        Reopen task
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Completion form — inline */}
                            {isOpen && !isDone && (
                              <div className="px-3 pb-2 pt-1">
                                <textarea
                                  value={completionNote}
                                  onChange={(e) => setCompletionNote(e.target.value)}
                                  placeholder="Describe what was done..."
                                  className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-border/40 rounded text-earth placeholder:text-muted/40 focus:outline-none focus:border-clay/30 resize-none"
                                  rows={2}
                                />

                                {/* Photo thumbnails */}
                                {completionPhotos.length > 0 && (
                                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                    {completionPhotos.map((p, i) => (
                                      <div key={i} className="relative group/thumb">
                                        <Image src={p.url} alt={`Completion photo ${i + 1}`} width={40} height={40} className="w-10 h-10 rounded object-cover border border-border/30" unoptimized />
                                        <button
                                          type="button"
                                          onClick={() => setCompletionPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                                          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-danger text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                                        >
                                          <X size={8} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Optional cost tracking */}
                                <div className="flex items-center gap-2 mt-1.5">
                                  <label className="text-[9px] text-muted shrink-0">Cost (optional)</label>
                                  <input
                                    type="number"
                                    value={completionCost}
                                    onChange={(e) => setCompletionCost(e.target.value)}
                                    placeholder="0.00"
                                    className="w-24 px-2 py-1 text-[10px] border border-border/40 rounded bg-white font-data text-earth focus:outline-none focus:border-clay/30"
                                  />
                                  <span className="text-[8px] text-muted/40">{marketData.currency.code}</span>
                                </div>

                                <div className="flex items-center justify-between mt-1.5">
                                  <div className="flex items-center gap-1">
                                    <Link href={`/project/${projectId}/documents`} className="text-[9px] text-clay hover:underline">Attach doc</Link>
                                    <span className="text-muted/30">|</span>
                                    <input
                                      ref={photoInputRef}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={handleCompletionPhotoUpload}
                                    />
                                    <button
                                      type="button"
                                      disabled={photoUploading}
                                      onClick={() => photoInputRef.current?.click()}
                                      className="inline-flex items-center gap-0.5 text-[9px] text-clay hover:underline disabled:opacity-50"
                                    >
                                      {photoUploading ? <Loader2 size={8} className="animate-spin" /> : <Paperclip size={8} />}
                                      {photoUploading ? "Uploading..." : "Attach photo"}
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button onClick={() => { setCompletingTaskId(null); setCompletionNote(""); setCompletionPhotos([]); setCompletionCost(""); }} className="text-[9px] text-muted hover:text-earth">Cancel</button>
                                    <button
                                      disabled={completionLoading || !completionNote.trim()}
                                      onClick={async () => {
                                        if (!user || !task.id) return;
                                        setCompletionLoading(true);
                                        try {
                                          const taskUpdate: Record<string, unknown> = {
                                            done: true, status: "done",
                                            completedAt: new Date().toISOString(),
                                            completedBy: user.uid,
                                            completionNote: completionNote.trim(),
                                          };
                                          if (completionPhotos.length > 0) {
                                            taskUpdate.completionPhotos = completionPhotos.map((p) => ({ url: p.url, timestamp: new Date().toISOString() }));
                                          }
                                          const costAmount = Number(completionCost) || 0;
                                          if (costAmount > 0) {
                                            taskUpdate.cost = costAmount;
                                          }
                                          await updateTask(user.uid, projectId, task.id, taskUpdate);
                                          await approveTask(user.uid, projectId, task.id, completionNote.trim());
                                          // Update project totalSpent if cost was entered
                                          if (costAmount > 0) {
                                            try {
                                              await updateProject(user.uid, projectId, {
                                                totalSpent: (project.totalSpent || 0) + costAmount,
                                              });
                                            } catch { /* non-blocking */ }
                                          }
                                          const nextTask = currentPhaseTasks
                                            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                            .find((t) => !t.done && t.status !== "pending-review" && t.id !== task.id);
                                          setCompletingTaskId(nextTask?.id ?? null);
                                          setCompletionNote("");
                                          setCompletionPhotos([]);
                                          setCompletionCost("");
                                          showToast(costAmount > 0 ? `Task completed — ${marketData.currency.symbol}${costAmount.toLocaleString()} logged` : "Task completed", "success");
                                        } catch { showToast("Failed to complete task", "error"); }
                                        finally { setCompletionLoading(false); }
                                      }}
                                      className="px-3 py-1 text-[10px] font-medium rounded bg-success text-white hover:bg-success/90 disabled:opacity-40 transition-colors"
                                    >
                                      {completionLoading ? "..." : "Complete"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                        </div>
                      );
                    })}

                    {/* Empty milestones — compact list */}
                    {emptyMs.length > 0 && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 mt-1 border-t border-border/15 px-1">
                        {emptyMs.map(({ msIdx, milestone }) => (
                          <span key={msIdx} className="text-[10px] text-muted/40 flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-sand/50" />
                            {milestone.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="text-[11px] text-muted py-4 text-center">No tasks for this phase yet.</div>
          )}

          {/* Phase Gate */}
          {user && project && (
            <PhaseAdvancement project={project} userId={user.uid} tasks={tasks} onAdvance={() => showToast("Phase advanced", "success")} />
          )}
        </div>

        {/* ─── RIGHT PANEL: Activity + Alerts ─── */}
        <div className="space-y-4">

          {/* Spend vs Progress (Build phase) */}
          {phase >= 6 && project.totalBudget > 0 && (
            <div className="bg-surface border border-border/40 rounded-lg p-3">
              <p className="text-[9px] font-semibold text-muted uppercase tracking-wider mb-2">Spend vs Progress</p>
              <SpendVelocityChart
                planned={generatePlannedSpend(project.totalBudget, project.totalWeeks)}
                actual={generateActualSpend(project.totalSpent, project.currentWeek)}
                currency={marketData.currency}
              />
            </div>
          )}

          {/* Budget snapshot (non-Build phases) */}
          {phase < 6 && project.totalBudget > 0 && (
            <div className="bg-surface border border-border/40 rounded-lg p-3">
              <p className="text-[9px] font-semibold text-muted uppercase tracking-wider mb-2">Budget</p>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-muted">Spent</span>
                <span className="font-data text-earth">{fmtCompact(project.totalSpent)} / {fmtCompact(project.totalBudget)}</span>
              </div>
              <div className="h-1.5 bg-warm rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${budgetUtilization > 90 ? "bg-danger" : budgetUtilization > 70 ? "bg-warning" : "bg-success"}`} style={{ width: `${budgetUtilization}%` }} />
              </div>
              {(project.dealScore ?? 0) > 0 && (
                <div className="flex items-center justify-between mt-2 text-[10px]">
                  <span className="text-muted">Deal Score</span>
                  <span className={`font-data font-semibold ${(project.dealScore ?? 0) >= 65 ? "text-success" : (project.dealScore ?? 0) >= 50 ? "text-warning" : "text-danger"}`}>{project.dealScore}</span>
                </div>
              )}
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-surface border border-border/40 rounded-lg p-3">
            <p className="text-[9px] font-semibold text-muted uppercase tracking-wider mb-2">Recent Activity</p>
            {recentActivity.length > 0 ? (
              <div className="space-y-0">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 py-1.5 border-b border-border/15 last:border-b-0">
                    <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${
                      item.type === "log" ? "bg-info" : item.type === "photo" ? "bg-emerald-500" : item.type === "punch" ? "bg-danger" : "bg-warning"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-earth truncate">{item.text}</p>
                      {item.date && (
                        <p className="text-[8px] text-muted/50 font-data">
                          {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted py-2">No recent activity</p>
            )}
          </div>

          {/* Alerts */}
          {topInsights.length > 0 && (
            <div className="bg-surface border border-border/40 rounded-lg p-3">
              <p className="text-[9px] font-semibold text-muted uppercase tracking-wider mb-2">Insights</p>
              <div className="space-y-1.5">
                {topInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[10px]">
                    <AlertTriangle size={10} className="text-warning shrink-0 mt-0.5" />
                    <span className="text-earth">{insight.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "Budget", href: `/project/${projectId}/budget`, icon: <DollarSign size={12} /> },
              { label: "Schedule", href: `/project/${projectId}/schedule`, icon: <CalendarCheck size={12} /> },
              { label: "Team", href: `/project/${projectId}/team`, icon: <Users size={12} /> },
              { label: "Financials", href: `/project/${projectId}/financials`, icon: <TrendingUp size={12} /> },
              { label: "Documents", href: `/project/${projectId}/documents`, icon: <FileText size={12} /> },
              { label: "Photos", href: `/project/${projectId}/photos`, icon: <Camera size={12} /> },
              { label: "Daily Log", href: `/project/${projectId}/daily-log`, icon: <ClipboardList size={12} /> },
              { label: "Inspections", href: `/project/${projectId}/inspections`, icon: <CheckCircle size={12} /> },
            ].map((link) => (
              <Link key={link.label} href={link.href}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-border/30 text-[10px] text-muted hover:text-earth hover:bg-warm/20 transition-colors">
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/*  MODALS                                                           */}
      {/* ================================================================= */}

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
