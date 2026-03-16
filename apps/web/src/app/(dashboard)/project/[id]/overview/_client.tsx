"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  updateTask,
  addTask,
  deleteTask,
  deleteProject,
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
} from "@/lib/services/project-service";
import { useAuth } from "@/components/auth/AuthProvider";
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
// Helpers to generate planned curves from budget / timeline data
// ---------------------------------------------------------------------------

function generatePlannedSpend(totalBudget: number, totalWeeks: number): { week: number; amount: number }[] {
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
  const { user } = useAuth();
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
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskLabel, setEditingTaskLabel] = useState("");
  const [showDeleteProject, setShowDeleteProject] = useState(false);
  const [deleteProjectName, setDeleteProjectName] = useState("");
  const [deletingProject, setDeletingProject] = useState(false);

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
    ];
    return () => unsubs.forEach((u) => u());
  }, [user, projectId]);

  useEffect(() => {
    if (project) {
      setTopbar(project.name, project.phaseName, project.currentPhase >= 5 ? "warning" : "info");
    }
  }, [project, setTopbar]);

  if (!project) {
    return <p className="text-muted text-sm">Loading project...</p>;
  }

  const market = project.market as Market;
  const marketData = getMarketData(market);
  const currentPhaseKey = PHASE_ORDER[project.currentPhase] ?? "DEFINE";
  const phaseDef = getPhaseDefinition(market, currentPhaseKey);
  const education = getEducationForPhase(market, currentPhaseKey);
  const phase = project.currentPhase;

  const activeTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);

  const fmtCompact = (amount: number) => formatCurrencyCompact(amount, marketData.currency);

  // Compute phase-specific data
  const budgetUtilization = project.totalBudget > 0
    ? Math.round((project.totalSpent / project.totalBudget) * 100)
    : 0;

  async function handleAddTask() {
    if (!newTaskLabel.trim() || !user) return;
    await addTask(user.uid, {
      projectId,
      label: newTaskLabel.trim(),
      status: "upcoming",
      done: false,
      order: tasks.length,
    });
    setNewTaskLabel("");
    setShowAddTask(false);
  }

  async function handleDeleteTask(taskId: string) {
    if (!user) return;
    await deleteTask(user.uid, projectId, taskId);
  }

  async function handleEditTaskSave(taskId: string) {
    if (!user || !editingTaskLabel.trim()) return;
    await updateTask(user.uid, projectId, taskId, { label: editingTaskLabel.trim() });
    setEditingTaskId(null);
    setEditingTaskLabel("");
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

      {/* Presentations button */}
      <div className="flex justify-end -mt-4 mb-4">
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

      {/* Phase advancement */}
      {user && project && (
        <PhaseAdvancement project={project} userId={user.uid} onAdvance={() => {}} />
      )}

      {/* Phase education - always shown */}
      {education && (
        <div className="mt-3 mb-4">
          <PhaseEducationCard module={education} />
        </div>
      )}

      {/* Actionable Phase Steps - shown for all phases */}
      {user && (() => {
        const steps = getPhaseSteps(market, phase);
        if (steps.length === 0) return null;
        return (
          <div className="mt-4 mb-4">
            <PhaseSteps
              steps={steps}
              completedSteps={phaseStepCompletions}
              onComplete={(stepId, data) => {
                completePhaseStep(user.uid, projectId, stepId, {
                  completedAt: new Date().toISOString(),
                  notes: data.notes,
                  documentIds: data.documentIds,
                });
              }}
              onUncomplete={(stepId) => {
                uncompletePhaseStep(user.uid, projectId, stepId);
              }}
              projectId={projectId}
              userId={user.uid}
            />
          </div>
        );
      })()}

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
          <div className="mb-4">
            <SectionLabel>Document Readiness</SectionLabel>
            <DocumentReadiness
              analysis={docAnalysis}
              projectId={projectId}
              phaseName={phaseNames[phase] ?? "Current"}
            />
          </div>
        );
      })()}

      {/* Process guide - shown for phases 0-4 */}
      {phase <= 4 && (
        <div className="mb-4">
          <ProcessGuide market={market} currentPhase={phase} />
        </div>
      )}

      {/* Stat cards - always shown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 mb-5 animate-stagger">
        <StatCard value={`${project.progress}%`} label="Progress" />
        <StatCard
          value={fmtCompact(project.totalSpent)}
          label={`Spent of ${fmtCompact(project.totalBudget)}`}
        />
        <StatCard value={`Wk ${project.currentWeek}`} label={`Of est. ${project.totalWeeks}`} />
        <StatCard value={String(project.openItems)} label="Open items" />
      </div>

      {/* AI Insights */}
      {(() => {
        const insights = generateOverviewInsights(project, budgetItems, tasks, dailyLogs, contacts);
        const topInsights = insights.sort((a, b) => b.priority - a.priority).slice(0, 3);
        if (topInsights.length === 0) return null;
        return (
          <div className="mb-5 space-y-2">
            <SectionLabel>AI Insights</SectionLabel>
            {topInsights.map((insight, i) => (
              <AIInsight key={i} type={insight.type} title={insight.title} content={insight.content} action={insight.action} />
            ))}
          </div>
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
            {/* Getting Started checklist */}
            <div>
              <SectionLabel>Getting Started</SectionLabel>
              <Card padding="sm">
                {[
                  { label: "Define your goals and building purpose", done: !!project.purpose },
                  { label: "Choose your target market (USA / West Africa)", done: !!project.market },
                  { label: "Set an initial budget range", done: project.totalBudget > 0 },
                  { label: "Research local construction costs", done: budgetItems.length > 0 },
                  { label: "Determine financing strategy", done: phase >= 1 },
                  { label: market === "USA" ? "Check loan pre-qualification" : "Plan savings schedule", done: false },
                ].map((item, i, arr) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 py-2 text-[12px] ${
                      i < arr.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border-[1.5px] shrink-0 flex items-center justify-center ${
                        item.done
                          ? "bg-success border-success"
                          : "border-border-dark"
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
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1 text-[11px] text-info hover:underline cursor-pointer"
              >
                <Plus size={12} /> Add task
              </button>
            </div>
            {showAddTask && (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newTaskLabel}
                  onChange={(e) => setNewTaskLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  placeholder="Task description"
                  className="flex-1 px-3 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskLabel.trim()}
                  className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowAddTask(false); setNewTaskLabel(""); }}
                  className="p-1 text-muted hover:text-earth transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="space-y-2">
              {activeTasks.slice(0, 4).map((task, i) => (
                <div key={task.id} className="flex items-center gap-2 text-[12px]">
                  <div
                    className="w-4 h-4 rounded border-[1.5px] border-border-dark shrink-0 cursor-pointer hover:border-emerald-500 transition-colors"
                    onClick={() => user && updateTask(user.uid, projectId, task.id!, { done: true, status: "done" })}
                  />
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
                      className="text-muted cursor-pointer hover:text-earth transition-colors"
                      onClick={() => { setEditingTaskId(task.id!); setEditingTaskLabel(task.label); }}
                      title="Click to edit"
                    >
                      {task.label}
                    </span>
                  )}
                  <Badge variant={task.status === "in-progress" ? "warning" : "info"}>
                    {task.status === "in-progress" ? "In progress" : "Upcoming"}
                  </Badge>
                  <button
                    onClick={() => handleDeleteTask(task.id!)}
                    className="p-0.5 text-muted hover:text-danger transition-colors shrink-0"
                    title="Delete task"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
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
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTaskLabel}
                  onChange={(e) => setNewTaskLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  placeholder="Task description"
                  className="flex-1 px-3 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskLabel.trim()}
                  className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowAddTask(false); setNewTaskLabel(""); }}
                  className="p-1 text-muted hover:text-earth transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </Card>
          )}

          {activeTasks.length > 0 && (
            <Card padding="sm" className="mb-4">
              {activeTasks.slice(0, 6).map((task, i) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2.5 py-1.5 text-[12px] ${
                    i < Math.min(activeTasks.length, 6) - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded border-[1.5px] border-border-dark shrink-0 cursor-pointer hover:border-emerald-500 transition-colors"
                    onClick={() => user && updateTask(user.uid, projectId, task.id!, { done: true, status: "done" })}
                  />
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
                      className="flex-1 text-muted cursor-pointer hover:text-earth transition-colors"
                      onClick={() => { setEditingTaskId(task.id!); setEditingTaskLabel(task.label); }}
                      title="Click to edit"
                    >
                      {task.label}
                    </span>
                  )}
                  <Badge variant={task.status === "in-progress" ? "warning" : "info"}>
                    {task.status === "in-progress" ? "In progress" : "Upcoming"}
                  </Badge>
                  <button
                    onClick={() => handleDeleteTask(task.id!)}
                    className="p-0.5 text-muted hover:text-danger transition-colors shrink-0"
                    title="Delete task"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <SectionLabel>Project Details</SectionLabel>
          <Card padding="sm">
            <DetailRow label="Market" value={<MarketBadge market={market} />} />
            <DetailRow label="Purpose" value={project.purpose} />
            <DetailRow label="Type" value={project.propertyType} />
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
          <SectionLabel>Completed Tasks</SectionLabel>
          <Card padding="sm">
            {completedTasks.length === 0 ? (
              <p className="text-[11px] text-muted py-2">None yet.</p>
            ) : (
              completedTasks.slice(0, 5).map((task, i) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 py-1.5 text-[11px] ${
                    i < Math.min(completedTasks.length, 5) - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded border-[1.5px] bg-success border-success shrink-0 flex items-center justify-center cursor-pointer"
                    onClick={() => user && updateTask(user.uid, projectId, task.id!, { done: false, status: "upcoming" })}
                  >
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="flex-1 text-muted line-through opacity-40">{task.label}</span>
                  <button
                    onClick={() => handleDeleteTask(task.id!)}
                    className="p-0.5 text-muted hover:text-danger transition-colors shrink-0"
                    title="Delete task"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>

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
