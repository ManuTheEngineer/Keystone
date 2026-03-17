import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import {
  getMarketData,
  type CurrencyConfig,
  type Market,
} from "@keystone/market-data";
import type {
  ProjectData,
  BudgetItemData,
  ContactData,
  DailyLogData,
  TaskData,
  PhotoData,
  InspectionResultData,
  PunchListItemData,
  MaterialData,
  DocumentData,
  VaultFileData,
} from "./project-service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FullProjectExportData {
  project: ProjectData;
  currency: CurrencyConfig;
  marketName: string;
  constructionMethod: string;

  // All data
  budgetItems: BudgetItemData[];
  contacts: ContactData[];
  dailyLogs: DailyLogData[];
  tasks: TaskData[];
  photos: PhotoData[];
  inspectionResults: InspectionResultData[];
  punchListItems: PunchListItemData[];
  materials: MaterialData[];
  documents: DocumentData[];
  vaultFiles: VaultFileData[];

  // Computed
  financingSummary: {
    type: string;
    landCost: number;
    dealScore: number | null;
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    burnRate: number;
    projectedFinalCost: number;
  };
  phaseTimeline: {
    phase: number;
    name: string;
    status: "completed" | "in-progress" | "upcoming";
    tasksTotal: number;
    tasksDone: number;
  }[];
  riskAssessment: {
    level: "critical" | "warning" | "info";
    title: string;
    detail: string;
  }[];

  // AI summary (filled later, starts empty)
  aiSummary: string;

  // Branding
  orgLogo: string | null;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PHASE_NAMES = [
  "Define",
  "Finance",
  "Land",
  "Design",
  "Approve",
  "Assemble",
  "Build",
  "Verify",
  "Operate",
];

const MARKET_DISPLAY_NAMES: Record<Market, string> = {
  USA: "United States",
  TOGO: "Togo",
  GHANA: "Ghana",
  BENIN: "Benin",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a Firebase snapshot object (keyed by push-id) into an array with `id` set. */
function snapshotToArray<T extends { id?: string }>(
  val: Record<string, Omit<T, "id">> | null | undefined
): T[] {
  if (!val || typeof val !== "object") return [];
  return Object.entries(val).map(
    ([key, data]) => ({ id: key, ...data } as unknown as T)
  );
}

// ---------------------------------------------------------------------------
// Main export function
// ---------------------------------------------------------------------------

export async function gatherFullProjectData(
  userId: string,
  projectId: string,
  project: ProjectData,
  _userPlan?: string,
  orgLogo?: string | null
): Promise<FullProjectExportData> {
  const basePath = `users/${userId}/projects/${projectId}`;

  // Fetch all collections in parallel
  const [
    budgetSnap,
    contactsSnap,
    logsSnap,
    tasksSnap,
    photosSnap,
    inspectionsSnap,
    punchSnap,
    materialsSnap,
    docsSnap,
    vaultSnap,
  ] = await Promise.all([
    get(ref(db, `${basePath}/budgetItems`)),
    get(ref(db, `${basePath}/contacts`)),
    get(ref(db, `${basePath}/dailyLogs`)),
    get(ref(db, `${basePath}/tasks`)),
    get(ref(db, `${basePath}/photos`)),
    get(ref(db, `${basePath}/inspectionResults`)),
    get(ref(db, `${basePath}/punchListItems`)),
    get(ref(db, `${basePath}/materials`)),
    get(ref(db, `${basePath}/documents`)),
    get(ref(db, `${basePath}/vault`)),
  ]);

  // Convert snapshots to typed arrays
  const budgetItems = snapshotToArray<BudgetItemData>(
    budgetSnap.exists() ? budgetSnap.val() : null
  );
  const contacts = snapshotToArray<ContactData>(
    contactsSnap.exists() ? contactsSnap.val() : null
  );
  const dailyLogs = snapshotToArray<DailyLogData>(
    logsSnap.exists() ? logsSnap.val() : null
  );
  const tasks = snapshotToArray<TaskData>(
    tasksSnap.exists() ? tasksSnap.val() : null
  );
  const photos = snapshotToArray<PhotoData>(
    photosSnap.exists() ? photosSnap.val() : null
  );
  const inspectionResults = snapshotToArray<InspectionResultData>(
    inspectionsSnap.exists() ? inspectionsSnap.val() : null
  );
  const punchListItems = snapshotToArray<PunchListItemData>(
    punchSnap.exists() ? punchSnap.val() : null
  );
  const materials = snapshotToArray<MaterialData>(
    materialsSnap.exists() ? materialsSnap.val() : null
  );
  const documents = snapshotToArray<DocumentData>(
    docsSnap.exists() ? docsSnap.val() : null
  );
  const vaultFiles = snapshotToArray<VaultFileData>(
    vaultSnap.exists() ? vaultSnap.val() : null
  );

  // --- Sort ---
  dailyLogs.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  tasks.sort((a, b) => a.order - b.order);
  photos.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const severityOrder: Record<string, number> = {
    critical: 0,
    major: 1,
    minor: 2,
  };
  punchListItems.sort(
    (a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3)
  );

  // --- Market data ---
  const marketConfig = getMarketData(project.market);
  const currency = marketConfig.currency;
  const marketName = MARKET_DISPLAY_NAMES[project.market] ?? project.market;

  // Derive construction method from the current phase definition (or default)
  const currentPhaseDef = marketConfig.phases.find(
    (_p, idx) => idx === project.currentPhase
  );
  const constructionMethod =
    currentPhaseDef?.constructionMethod ??
    (project.market === "USA" ? "Wood-frame" : "Reinforced concrete block");

  // --- Computed: financingSummary ---
  const totalEstimated = budgetItems.reduce((s, b) => s + b.estimated, 0);
  const totalActual = budgetItems.reduce((s, b) => s + b.actual, 0);
  const totalBudget = project.totalBudget || totalEstimated;
  const totalSpent = project.totalSpent || totalActual;
  const remaining = totalBudget - totalSpent;

  // Burn rate: spent per week (avoid division by zero)
  const weeksElapsed = project.currentWeek || 1;
  const burnRate = totalSpent / weeksElapsed;

  // Projected final cost: if we keep spending at the same rate for remaining weeks
  const remainingWeeks = Math.max(
    (project.totalWeeks || weeksElapsed) - weeksElapsed,
    0
  );
  const projectedFinalCost = totalSpent + burnRate * remainingWeeks;

  const financingSummary = {
    type: project.financingType ?? "Unknown",
    landCost: project.landCost ?? 0,
    dealScore: project.dealScore ?? null,
    totalBudget,
    totalSpent,
    remaining,
    burnRate: Math.round(burnRate),
    projectedFinalCost: Math.round(projectedFinalCost),
  };

  // --- Computed: phaseTimeline ---
  const phaseTimeline = PHASE_NAMES.map((name, idx) => {
    const phaseTasks = tasks; // tasks are project-wide, not per-phase in current schema
    let status: "completed" | "in-progress" | "upcoming";
    if (idx < project.currentPhase) {
      status = "completed";
    } else if (idx === project.currentPhase) {
      status = "in-progress";
    } else {
      status = "upcoming";
    }

    // Count tasks relevant to this phase (best effort: use all tasks for current phase)
    let tasksTotal = 0;
    let tasksDone = 0;
    if (idx === project.currentPhase) {
      tasksTotal = phaseTasks.length;
      tasksDone = phaseTasks.filter((t) => t.done).length;
    }

    return { phase: idx, name, status, tasksTotal, tasksDone };
  });

  // --- Computed: riskAssessment ---
  const riskAssessment: FullProjectExportData["riskAssessment"] = [];

  // Budget overage
  if (totalBudget > 0 && totalSpent > totalBudget) {
    const overPct = (((totalSpent - totalBudget) / totalBudget) * 100).toFixed(
      1
    );
    riskAssessment.push({
      level: "critical",
      title: "Budget exceeded",
      detail: `Spent exceeds budget by ${overPct}% ($${(totalSpent - totalBudget).toLocaleString()}).`,
    });
  } else if (totalBudget > 0 && totalSpent > totalBudget * 0.9) {
    const usedPct = ((totalSpent / totalBudget) * 100).toFixed(1);
    riskAssessment.push({
      level: "warning",
      title: "Budget nearly exhausted",
      detail: `${usedPct}% of budget consumed with project ongoing.`,
    });
  }

  // Projected overrun
  if (totalBudget > 0 && projectedFinalCost > totalBudget * 1.05) {
    const overPct = (
      ((projectedFinalCost - totalBudget) / totalBudget) *
      100
    ).toFixed(1);
    riskAssessment.push({
      level: "warning",
      title: "Projected cost overrun",
      detail: `At current burn rate, final cost is projected to exceed budget by ${overPct}%.`,
    });
  }

  // Open punch list items
  const openPunch = punchListItems.filter((p) => p.status !== "resolved");
  const criticalPunch = openPunch.filter((p) => p.severity === "critical");
  if (criticalPunch.length > 0) {
    riskAssessment.push({
      level: "critical",
      title: `${criticalPunch.length} critical punch list item${criticalPunch.length === 1 ? "" : "s"}`,
      detail: `Unresolved critical issues require immediate attention before project can advance.`,
    });
  } else if (openPunch.length > 5) {
    riskAssessment.push({
      level: "warning",
      title: `${openPunch.length} open punch list items`,
      detail: `A growing backlog of open items may delay completion.`,
    });
  }

  // Overdue tasks (tasks that are "upcoming" or "in-progress" when progress suggests they should be done)
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
  const upcomingTasks = tasks.filter((t) => t.status === "upcoming");
  if (project.progress > 80 && upcomingTasks.length > tasks.length * 0.4) {
    riskAssessment.push({
      level: "warning",
      title: "Many tasks still upcoming",
      detail: `Project is ${project.progress}% complete but ${upcomingTasks.length} of ${tasks.length} tasks have not started.`,
    });
  }

  // Burn rate warning
  if (
    burnRate > 0 &&
    remaining > 0 &&
    remainingWeeks > 0 &&
    burnRate * remainingWeeks > remaining * 1.2
  ) {
    riskAssessment.push({
      level: "info",
      title: "Spending pace elevated",
      detail: `Weekly burn rate of $${burnRate.toLocaleString()} may outpace remaining budget over ${remainingWeeks} weeks.`,
    });
  }

  // If no risks found, add an all-clear info item
  if (riskAssessment.length === 0) {
    riskAssessment.push({
      level: "info",
      title: "No significant risks detected",
      detail: "Budget, schedule, and punch list metrics are within normal ranges.",
    });
  }

  // --- Assemble final export ---
  return {
    project,
    currency,
    marketName,
    constructionMethod,

    budgetItems,
    contacts,
    dailyLogs,
    tasks,
    photos,
    inspectionResults,
    punchListItems,
    materials,
    documents,
    vaultFiles,

    financingSummary,
    phaseTimeline,
    riskAssessment,

    aiSummary: "",

    orgLogo: orgLogo ?? null,
    generatedAt: new Date().toISOString(),
  };
}
