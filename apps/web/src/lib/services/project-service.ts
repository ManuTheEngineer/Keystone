import {
  ref,
  push,
  set,
  get,
  update,
  remove,
  onValue,
  type Unsubscribe,
} from "firebase/database";
import { db } from "@/lib/firebase";

export type Market = "USA" | "TOGO" | "GHANA" | "BENIN";
export type BuildPurpose = "OCCUPY" | "RENT" | "SELL";
export type PropertyType = "SFH" | "DUPLEX" | "TRIPLEX" | "FOURPLEX" | "APARTMENT";
export type ProjectPhase = "DEFINE" | "FINANCE" | "LAND" | "DESIGN" | "APPROVE" | "ASSEMBLE" | "BUILD" | "VERIFY" | "OPERATE";
export type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export interface ProjectData {
  id?: string;
  userId: string;
  name: string;
  market: Market;
  purpose: BuildPurpose;
  propertyType: PropertyType;
  sizeRange: string;
  city?: string;
  region?: string;
  financingType?: string;
  landCost?: number;
  dealScore?: number;
  currentPhase: number;
  completedPhases: number;
  phaseName: string;
  progress: number;
  status: ProjectStatus;
  totalBudget: number;
  totalSpent: number;
  currency: string;
  currentWeek: number;
  totalWeeks: number;
  openItems: number;
  subPhase: string;
  details: string;
  bedrooms?: number;
  bathrooms?: number;
  stories?: number;
  features?: string[] | null;
  downPaymentPct?: number;
  loanRate?: number;
  timelineMonths?: number;
  targetSalePrice?: number;
  monthlyRent?: number;
  analysisId?: string; // Link back to the Deal Analyzer analysis
  isDemo?: boolean;
  priority?: number; // 1, 2, 3 (1 = highest)
  pinned?: boolean;
  lastActivityAt?: string;
  contactCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItemData {
  id?: string;
  projectId: string;
  category: string;
  estimated: number;
  actual: number;
  status: "on-track" | "over" | "under" | "not-started";
}

export interface ContactData {
  id?: string;
  projectId: string;
  name: string;
  initials: string;
  role: string;
  rating: number;
  phone?: string;
  email?: string;
  whatsapp?: string;
}

export interface DailyLogData {
  id?: string;
  projectId: string;
  date: string;
  day: number;
  weather: string;
  crew: number;
  content: string;
  createdAt: string;
}

export interface DocumentData {
  id?: string;
  projectId: string;
  name: string;
  phase: string;
  date: string;
  fileUrl?: string;
  type: string;
  templateId?: string;
  generatedAt?: string;
}

export interface PhotoData {
  id?: string;
  projectId: string;
  fileUrl: string;
  thumbnailUrl?: string;
  phase: string;
  caption?: string;
  date: string;
  latitude?: number;
  longitude?: number;
}

export interface CompletionPhoto {
  url: string;
  caption?: string;
  latitude?: number;
  longitude?: number;
  timestamp?: string;
}

export interface TaskComment {
  id: string;
  authorName: string;
  authorRole: "owner" | "contractor";
  content: string;
  photoUrl?: string;
  createdAt: string;
  pinned?: boolean;
}

export interface TaskData {
  id?: string;
  projectId: string;
  label: string;
  description?: string;
  phase?: number; // 0=Define, 1=Finance, 2=Land, 3=Design, 4=Approve, 5=Assemble, 6=Build, 7=Verify, 8=Operate
  status: "upcoming" | "in-progress" | "done" | "pending-review" | "rejected" | "cancelled";
  done: boolean;
  order: number;
  priority?: "normal" | "urgent" | "critical";

  // Assignment
  assignedTo?: string;        // contactId
  assignedName?: string;      // denormalized contractor name
  trade?: string;             // electrician, mason, plumber, etc.

  // Requirements (set by owner)
  requiresPhoto?: boolean;
  requiresApproval?: boolean;
  minimumPhotos?: number;

  // Financials
  price?: number;
  currency?: string;
  paymentStatus?: "unpaid" | "authorized" | "released" | "confirmed";

  // Scheduling
  dueDate?: string;
  startDate?: string;
  dependsOn?: string[];       // task IDs that must complete first

  // Origin
  sourceType?: "custom" | "milestone";
  sourceMilestone?: string;
  milestoneIndex?: number;

  // Completion (filled by contractor)
  completedBy?: string;
  completedAt?: string;
  completionPhotos?: CompletionPhoto[];
  completionNote?: string;
  timeSpent?: number;

  // Review (filled by owner)
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  rejectionReason?: string;
  rejectionCount?: number;

  // Comments
  comments?: TaskComment[];
}

// --- Project CRUD ---

export async function createProject(data: Omit<ProjectData, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const projectsRef = ref(db, `users/${data.userId}/projects`);
  const newRef = push(projectsRef);
  const now = new Date().toISOString();
  await set(newRef, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return newRef.key!;
}

export async function getProject(userId: string, projectId: string): Promise<ProjectData | null> {
  const snapshot = await get(ref(db, `users/${userId}/projects/${projectId}`));
  if (snapshot.exists()) {
    return { id: projectId, ...snapshot.val() } as ProjectData;
  }
  return null;
}

export async function getUserProjects(userId: string): Promise<ProjectData[]> {
  const snapshot = await get(ref(db, `users/${userId}/projects`));
  if (!snapshot.exists()) return [];

  const projects: ProjectData[] = [];
  snapshot.forEach((child) => {
    projects.push({ id: child.key!, ...child.val() });
  });
  return projects;
}

export function subscribeToProject(
  userId: string,
  projectId: string,
  callback: (project: ProjectData | null) => void
): Unsubscribe {
  const projectRef = ref(db, `users/${userId}/projects/${projectId}`);
  return onValue(projectRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: projectId, ...snapshot.val() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Subscription error (project):", error);
  });
}

export function subscribeToUserProjects(
  userId: string,
  callback: (projects: ProjectData[]) => void
): Unsubscribe {
  const projectsRef = ref(db, `users/${userId}/projects`);
  return onValue(projectsRef, (snapshot) => {
    const projects: ProjectData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        projects.push({ id: child.key!, ...child.val() });
      });
    }
    callback(projects);
  }, (error) => {
    console.error("Subscription error (user projects):", error);
  });
}

export async function updateProject(
  userId: string,
  projectId: string,
  data: Partial<ProjectData>
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}`), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}`));
}

export async function updateProjectPriority(userId: string, projectId: string, priority: number | null): Promise<void> {
  if (priority === null) {
    await update(ref(db, `users/${userId}/projects/${projectId}`), {
      priority: null,
      pinned: false,
    });
  } else {
    await update(ref(db, `users/${userId}/projects/${projectId}`), {
      priority,
      pinned: priority === 1,
    });
  }
}

// --- Budget Items ---

export async function addBudgetItem(userId: string, data: Omit<BudgetItemData, "id">): Promise<string> {
  const itemRef = push(ref(db, `users/${userId}/projects/${data.projectId}/budgetItems`));
  await set(itemRef, data);
  return itemRef.key!;
}

/**
 * Seed initial tasks for a new project based on wizard/analyzer data.
 *
 * Tasks that have data from the wizard are set to "pending-review" with
 * auto-generated evidence so the user can verify, edit, and approve them.
 * Tasks without data are "upcoming" (next steps).
 *
 * Nothing is auto-closed. The user must approve every task.
 */
export async function seedInitialTasks(
  userId: string,
  projectId: string,
  projectData: {
    market: Market;
    purpose: string;
    propertyType: string;
    city?: string;
    financingType?: string;
    totalBudget: number;
    bedrooms?: number;
    bathrooms?: number;
    features?: string[] | null;
    fromAnalyzer?: boolean;
  },
): Promise<void> {
  const isUSA = projectData.market === "USA";
  const now = new Date().toISOString();
  const src = projectData.fromAnalyzer ? "Deal Analyzer" : "Project Wizard";

  // Helper: create a task that needs user review (has evidence from wizard)
  function reviewTask(label: string, order: number, phase: number, evidence: string, milestoneName?: string, milestoneIndex?: number): Omit<TaskData, "id"> {
    return {
      projectId, label, order, phase, sourceType: "milestone",
      sourceMilestone: milestoneName,
      milestoneIndex,
      status: "pending-review", done: false,
      completionNote: evidence, completedAt: now, completedBy: src,
      requiresApproval: true,
    };
  }

  // Helper: create an upcoming task
  function task(label: string, order: number, phase: number, milestoneName?: string, milestoneIndex?: number): Omit<TaskData, "id"> {
    return { projectId, label, order, phase, sourceType: "milestone", sourceMilestone: milestoneName, milestoneIndex, status: "upcoming", done: false };
  }

  // Get milestone definitions for proper task→milestone mapping
  const { getPhaseDefinition, PHASE_ORDER } = await import("@keystone/market-data");
  function ms(phase: number, index: number): { name: string; index: number } {
    const phaseKey = PHASE_ORDER[phase];
    const def = phaseKey ? getPhaseDefinition(projectData.market, phaseKey) : null;
    const milestone = def?.milestones[index];
    return { name: milestone?.name ?? "", index };
  }

  const allTasks: Omit<TaskData, "id">[] = [];

  // ── Phase 0: Define ──
  // Milestone 0: "Goals and purpose defined"
  allTasks.push(reviewTask("Define building goal", 1, 0,
    `Goal set to: ${projectData.purpose}. Review and confirm this matches your intent.`,
    ms(0, 0).name, 0));
  allTasks.push(reviewTask("Select target market", 2, 0,
    `Market: ${projectData.market}. ${isUSA ? "Wood-frame construction, institutional lending." : "Reinforced concrete, cash/phased funding."}`,
    ms(0, 0).name, 0));
  // Milestone 1: "Preliminary budget range set"
  if (projectData.totalBudget > 0) {
    allTasks.push(reviewTask("Review initial budget", 3, 0,
      `Estimated total: ${projectData.totalBudget.toLocaleString()} ${isUSA ? "USD" : "CFA"}. Budget line items auto-generated. Review each category in the Budget tab.`,
      ms(0, 1).name, 1));
  } else {
    allTasks.push(task("Set initial budget", 3, 0, ms(0, 1).name, 1));
  }
  if (projectData.financingType) {
    allTasks.push(reviewTask("Confirm financing strategy", 4, 0,
      `Financing: ${projectData.financingType}. Verify this is the right approach for your situation.`,
      ms(0, 1).name, 1));
  } else {
    allTasks.push(task("Determine financing strategy", 4, 0, ms(0, 1).name, 1));
  }
  // Milestone 2: "Market and location research complete"
  if (projectData.city) {
    allTasks.push(reviewTask("Set build location", 5, 0,
      `Location: ${projectData.city}. Verify this is the correct city/region for cost estimates.`,
      ms(0, 2).name, 2));
  } else {
    allTasks.push(task("Set build location", 5, 0, ms(0, 2).name, 2));
  }
  allTasks.push(reviewTask("Choose property type and size", 6, 0,
    `Type: ${projectData.propertyType}${projectData.bedrooms ? `, ${projectData.bedrooms} bed / ${projectData.bathrooms} bath` : ""}. Confirm these specifications.`,
    ms(0, 2).name, 2));

  // ── Phase 1: Finance ──
  if (isUSA) {
    allTasks.push(task("Check credit score and review DTI ratio", 10, 1, ms(1, 0).name, 0));
    allTasks.push(task("Get construction loan pre-approval", 11, 1, ms(1, 0).name, 0));
    allTasks.push(task("Compare lender terms (at least 3 quotes)", 12, 1, ms(1, 1).name, 1));
    allTasks.push(task("Gather financial documents (tax returns, pay stubs, bank statements)", 13, 1, ms(1, 1).name, 1));
  } else {
    allTasks.push(task("Create savings plan and timeline", 10, 1, ms(1, 0).name, 0));
    allTasks.push(task("Set up dedicated construction savings account", 11, 1, ms(1, 0).name, 0));
    allTasks.push(task("Plan phased funding schedule", 12, 1, ms(1, 1).name, 1));
  }

  // ── Phase 2: Land ──
  allTasks.push(task(isUSA ? "Research zoning and buildability" : "Verify land title status", 20, 2, ms(2, 0).name, 0));
  allTasks.push(task(isUSA ? "Get property survey completed" : "Obtain titre foncier or land deed", 21, 2, ms(2, 1).name, 1));
  allTasks.push(task("Confirm utilities access (water, electric, sewer)", 22, 2, ms(2, 2).name, 2));
  allTasks.push(task(isUSA ? "Review HOA restrictions and covenants" : "Verify plot boundaries with neighbors", 23, 2, ms(2, 2).name, 2));

  // ── Phase 3: Design ──
  allTasks.push(task("Hire architect or select house plans", 30, 3, ms(3, 0).name, 0));
  allTasks.push(task("Finalize floor plan and elevations", 31, 3, ms(3, 0).name, 0));
  allTasks.push(task("Select exterior materials and finishes", 32, 3, ms(3, 1).name, 1));
  allTasks.push(task("Complete structural engineering", 33, 3, ms(3, 1).name, 1));
  allTasks.push(task(isUSA ? "Energy code compliance review" : "Review plans with local engineer", 34, 3, ms(3, 2).name, 2));

  // ── Phase 4: Approve ──
  allTasks.push(task(isUSA ? "Submit plans to building department" : "Submit plans to local authority", 40, 4, ms(4, 0).name, 0));
  allTasks.push(task(isUSA ? "Obtain building permit" : "Obtain construction permit", 41, 4, ms(4, 0).name, 0));
  allTasks.push(task(isUSA ? "Get required variances if needed" : "Get environmental clearance if needed", 42, 4, ms(4, 1).name, 1));
  allTasks.push(task("Finalize construction timeline", 43, 4, ms(4, 1).name, 1));

  // ── Phase 5: Assemble ──
  allTasks.push(task("Hire general contractor or construction manager", 50, 5, ms(5, 0).name, 0));
  allTasks.push(task("Negotiate and sign construction contract", 51, 5, ms(5, 0).name, 0));
  allTasks.push(task("Verify contractor insurance and licensing", 52, 5, ms(5, 1).name, 1));
  allTasks.push(task("Establish payment schedule and draw process", 53, 5, ms(5, 1).name, 1));
  allTasks.push(task(isUSA ? "Set up builder's risk insurance" : "Set up site security", 54, 5, ms(5, 2).name, 2));

  // ── Phase 6: Build ──
  allTasks.push(task("Site preparation and grading", 60, 6, ms(6, 0).name, 0));
  allTasks.push(task(isUSA ? "Foundation pour and inspection" : "Foundation (semelle and soubassement)", 61, 6, ms(6, 0).name, 0));
  allTasks.push(task(isUSA ? "Framing and structural inspection" : "Wall construction (block/poteau-poutre)", 62, 6, ms(6, 1).name, 1));
  allTasks.push(task(isUSA ? "Rough plumbing, electrical, HVAC" : "Plumbing and electrical rough-in", 63, 6, ms(6, 1).name, 1));
  allTasks.push(task(isUSA ? "Insulation and drywall" : "Plastering (enduit) and rendering", 64, 6, ms(6, 2).name, 2));
  allTasks.push(task("Roofing complete", 65, 6, ms(6, 2).name, 2));
  allTasks.push(task(isUSA ? "Interior finishes (flooring, paint, cabinets)" : "Flooring (carrelage), painting, fixtures", 66, 6, ms(6, 3).name, 3));
  allTasks.push(task(isUSA ? "Exterior finishes (siding, landscaping)" : "Exterior finishes and perimeter wall", 67, 6, ms(6, 3).name, 3));

  // ── Phase 7: Verify ──
  allTasks.push(task(isUSA ? "Schedule final building inspection" : "Arrange final walkthrough", 70, 7, ms(7, 0).name, 0));
  allTasks.push(task("Complete punch list items", 71, 7, ms(7, 0).name, 0));
  allTasks.push(task(isUSA ? "Obtain Certificate of Occupancy" : "Obtain completion certificate", 72, 7, ms(7, 1).name, 1));
  allTasks.push(task("Final contractor payment release", 73, 7, ms(7, 1).name, 1));

  // ── Phase 8: Operate ──
  allTasks.push(task(isUSA ? "Set up homeowner's insurance" : "Set up property insurance", 80, 8, ms(8, 0).name, 0));
  allTasks.push(task("Archive all project documents", 81, 8, ms(8, 0).name, 0));
  allTasks.push(task("Record warranty information for all systems", 82, 8, ms(8, 1).name, 1));
  if (projectData.purpose === "RENT") {
    allTasks.push(task("List property for rental", 83, 8, ms(8, 1).name, 1));
    allTasks.push(task("Screen and select tenants", 84, 8, ms(8, 1).name, 1));
  } else if (projectData.purpose === "SELL") {
    allTasks.push(task("Stage property for sale", 83, 8, ms(8, 1).name, 1));
    allTasks.push(task("List with agent or FSBO", 84, 8, ms(8, 1).name, 1));
  } else {
    allTasks.push(task("Schedule move-in", 83, 8, ms(8, 1).name, 1));
    allTasks.push(task("Set up maintenance schedule", 84, 8, ms(8, 1).name, 1));
  }
  const pendingCount = allTasks.filter((t) => t.status === "pending-review").length;

  const tasksRef = ref(db, `users/${userId}/projects/${projectId}/tasks`);
  const taskUpdates: Record<string, Omit<TaskData, "id">> = {};
  for (const task of allTasks) {
    const key = push(tasksRef).key!;
    taskUpdates[key] = task;
  }
  await update(tasksRef, taskUpdates);

  // Set openItems to the pending-review count so user sees the notification
  await update(ref(db, `users/${userId}/projects/${projectId}`), {
    progress: 0, // nothing approved yet
    openItems: pendingCount,
    updatedAt: now,
  });
}

/** Wizard cost breakdown passed from the project creation flow. */
export interface WizardCostBreakdown {
  land?: number;
  construction?: number;
  softCosts?: number;
  financingCosts?: number;
  contingency?: number;
}

/**
 * Auto-generate budget line items for a new project based on its specs.
 * When a wizard cost breakdown is provided, uses those exact figures to set
 * category estimates. Otherwise falls back to generic percentage splits.
 */
export async function generateBudgetFromSpecs(
  userId: string,
  projectId: string,
  totalBudget: number,
  market: Market,
  features?: string[],
  costBreakdown?: WizardCostBreakdown,
): Promise<void> {
  const isUSA = market === "USA";

  // Construction sub-category percentages (relative to construction cost)
  const constructionCategories: { category: string; pct: number }[] = isUSA ? [
    { category: "Site Preparation", pct: 5 },
    { category: "Foundation", pct: 11 },
    { category: "Framing / Structure", pct: 17 },
    { category: "Roofing", pct: 7 },
    { category: "Exterior (Siding, Windows, Doors)", pct: 9 },
    { category: "Plumbing", pct: 9 },
    { category: "Electrical", pct: 8 },
    { category: "HVAC", pct: 6 },
    { category: "Insulation / Drywall", pct: 7 },
    { category: "Interior Finishes (Flooring, Paint, Trim)", pct: 12 },
    { category: "Kitchen / Cabinets", pct: 9 },
  ] : [
    { category: "Site Preparation / Clearing", pct: 5 },
    { category: "Foundation (Semelle + Soubassement)", pct: 14 },
    { category: "Walls (Block / Poteau-Poutre)", pct: 21 },
    { category: "Roofing (Charpente + Tole)", pct: 10 },
    { category: "Plumbing", pct: 8 },
    { category: "Electrical", pct: 7 },
    { category: "Plastering / Enduit", pct: 6 },
    { category: "Flooring / Carrelage", pct: 7 },
    { category: "Doors / Windows (Menuiserie)", pct: 8 },
    { category: "Painting", pct: 5 },
    { category: "Kitchen / Bathroom Fixtures", pct: 6 },
    { category: "Perimeter Wall / Cloture", pct: 3 },
  ];

  // Add feature-specific line items
  const featureItems: { category: string; amount: number }[] = [];
  if (features && features.length > 0) {
    const featureCosts: Record<string, { label: string; usd: number; cfa: number }> = {
      "garage-single": { label: "Garage (Single)", usd: 15000, cfa: 2500000 },
      "garage-double": { label: "Garage (Double)", usd: 28000, cfa: 4500000 },
      "pool": { label: "Swimming Pool", usd: 40000, cfa: 12000000 },
      "solar": { label: "Solar Panels", usd: 18000, cfa: 5000000 },
      "fence": { label: isUSA ? "Fencing" : "Perimeter Wall", usd: 6000, cfa: 2000000 },
      "basement": { label: "Basement", usd: 35000, cfa: 0 },
      "guest-house": { label: "Guest House", usd: 0, cfa: 15000000 },
      "water-tank": { label: "Water Tank / Reservoir", usd: 0, cfa: 2500000 },
      "generator-house": { label: "Generator House", usd: 0, cfa: 1500000 },
    };
    for (const fid of features) {
      const fc = featureCosts[fid];
      if (fc) {
        const amt = isUSA ? fc.usd : fc.cfa;
        if (amt > 0) featureItems.push({ category: fc.label, amount: amt });
      }
    }
  }

  const featureTotal = featureItems.reduce((s, f) => s + f.amount, 0);

  const budgetRef = ref(db, `users/${userId}/projects/${projectId}/budgetItems`);
  const items: Record<string, Omit<BudgetItemData, "id">> = {};

  // --- When wizard cost breakdown is available, use exact figures ---
  if (costBreakdown && (costBreakdown.construction || costBreakdown.land)) {
    const constructionBase = costBreakdown.construction ?? 0;

    // Land acquisition (if > 0)
    if (costBreakdown.land && costBreakdown.land > 0) {
      const key = push(budgetRef).key!;
      items[key] = {
        projectId,
        category: "Land Acquisition",
        estimated: Math.round(costBreakdown.land),
        actual: 0,
        status: "not-started",
      };
    }

    // Construction sub-categories scaled from the wizard's construction figure
    const constructionForSubs = Math.max(0, constructionBase - featureTotal);
    for (const cat of constructionCategories) {
      const key = push(budgetRef).key!;
      items[key] = {
        projectId,
        category: cat.category,
        estimated: Math.round(constructionForSubs * cat.pct / 100),
        actual: 0,
        status: "not-started",
      };
    }

    // Soft costs (permits, design, architecture)
    if (costBreakdown.softCosts && costBreakdown.softCosts > 0) {
      const key = push(budgetRef).key!;
      items[key] = {
        projectId,
        category: isUSA ? "Permits / Design / Architecture" : "Permits / Design",
        estimated: Math.round(costBreakdown.softCosts),
        actual: 0,
        status: "not-started",
      };
    }

    // Financing costs (only if applicable)
    if (costBreakdown.financingCosts && costBreakdown.financingCosts > 0) {
      const key = push(budgetRef).key!;
      items[key] = {
        projectId,
        category: "Financing Costs",
        estimated: Math.round(costBreakdown.financingCosts),
        actual: 0,
        status: "not-started",
      };
    }

    // Contingency
    if (costBreakdown.contingency && costBreakdown.contingency > 0) {
      const key = push(budgetRef).key!;
      items[key] = {
        projectId,
        category: "Contingency",
        estimated: Math.round(costBreakdown.contingency),
        actual: 0,
        status: "not-started",
      };
    }
  } else {
    // --- Fallback: generic percentage splits from totalBudget ---
    const fallbackCategories: { category: string; pct: number }[] = isUSA ? [
      { category: "Site Preparation", pct: 5 },
      { category: "Foundation", pct: 10 },
      { category: "Framing / Structure", pct: 15 },
      { category: "Roofing", pct: 6 },
      { category: "Exterior (Siding, Windows, Doors)", pct: 8 },
      { category: "Plumbing", pct: 8 },
      { category: "Electrical", pct: 7 },
      { category: "HVAC", pct: 5 },
      { category: "Insulation / Drywall", pct: 6 },
      { category: "Interior Finishes (Flooring, Paint, Trim)", pct: 10 },
      { category: "Kitchen / Cabinets", pct: 6 },
      { category: "Permits / Design / Architecture", pct: 7 },
      { category: "Contingency", pct: 7 },
    ] : [
      { category: "Site Preparation / Clearing", pct: 4 },
      { category: "Foundation (Semelle + Soubassement)", pct: 12 },
      { category: "Walls (Block / Poteau-Poutre)", pct: 18 },
      { category: "Roofing (Charpente + Tole)", pct: 8 },
      { category: "Plumbing", pct: 7 },
      { category: "Electrical", pct: 6 },
      { category: "Plastering / Enduit", pct: 5 },
      { category: "Flooring / Carrelage", pct: 6 },
      { category: "Doors / Windows (Menuiserie)", pct: 7 },
      { category: "Painting", pct: 4 },
      { category: "Kitchen / Bathroom Fixtures", pct: 5 },
      { category: "Perimeter Wall / Cloture", pct: 6 },
      { category: "Permits / Design", pct: 5 },
      { category: "Contingency", pct: 7 },
    ];

    const baseBudget = Math.max(0, totalBudget - featureTotal);
    for (const cat of fallbackCategories) {
      const key = push(budgetRef).key!;
      items[key] = {
        projectId,
        category: cat.category,
        estimated: Math.round(baseBudget * cat.pct / 100),
        actual: 0,
        status: "not-started",
      };
    }
  }

  // Feature add-ons (always appended)
  for (const feat of featureItems) {
    const key = push(budgetRef).key!;
    items[key] = {
      projectId,
      category: feat.category,
      estimated: feat.amount,
      actual: 0,
      status: "not-started",
    };
  }

  await update(budgetRef, items);
}

export function subscribeToBudgetItems(
  userId: string,
  projectId: string,
  callback: (items: BudgetItemData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/budgetItems`), (snapshot) => {
    const items: BudgetItemData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        items.push({ id: child.key!, ...child.val() });
      });
    }
    callback(items);
  }, (error) => {
    console.error("Subscription error (budget items):", error);
  });
}

export async function updateBudgetItem(
  userId: string,
  projectId: string,
  itemId: string,
  data: Partial<BudgetItemData>
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/budgetItems/${itemId}`), data);
}

// --- Contacts ---

export async function addContact(userId: string, data: Omit<ContactData, "id">): Promise<string> {
  const contactRef = push(ref(db, `users/${userId}/projects/${data.projectId}/contacts`));
  await set(contactRef, data);
  return contactRef.key!;
}

export function subscribeToContacts(
  userId: string,
  projectId: string,
  callback: (contacts: ContactData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/contacts`), (snapshot) => {
    const contacts: ContactData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        contacts.push({ id: child.key!, ...child.val() });
      });
    }
    callback(contacts);
  }, (error) => {
    console.error("Subscription error (contacts):", error);
  });
}

// --- Daily Logs ---

export async function addDailyLog(userId: string, data: Omit<DailyLogData, "id" | "createdAt">): Promise<string> {
  const logRef = push(ref(db, `users/${userId}/projects/${data.projectId}/dailyLogs`));
  await set(logRef, { ...data, createdAt: new Date().toISOString() });
  return logRef.key!;
}

export function subscribeToDailyLogs(
  userId: string,
  projectId: string,
  callback: (logs: DailyLogData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/dailyLogs`), (snapshot) => {
    const logs: DailyLogData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        logs.push({ id: child.key!, ...child.val() });
      });
    }
    callback(logs.reverse());
  }, (error) => {
    console.error("Subscription error (daily logs):", error);
  });
}

// --- Tasks ---

export async function addTask(userId: string, data: Omit<TaskData, "id">): Promise<string> {
  const taskRef = push(ref(db, `users/${userId}/projects/${data.projectId}/tasks`));
  await set(taskRef, data);
  return taskRef.key!;
}

export function subscribeToTasks(
  userId: string,
  projectId: string,
  callback: (tasks: TaskData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/tasks`), (snapshot) => {
    const tasks: TaskData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        tasks.push({ id: child.key!, ...child.val() });
      });
    }
    callback(tasks.sort((a, b) => a.order - b.order));
  }, (error) => {
    console.error("Subscription error (tasks):", error);
  });
}

export async function updateTask(
  userId: string,
  projectId: string,
  taskId: string,
  data: Partial<TaskData>
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/tasks/${taskId}`), data);
}

// --- Task Workflow (Contractor Portal) ---

/** Assign a task to a contractor contact */
export async function assignTask(
  userId: string,
  projectId: string,
  taskId: string,
  contact: { id: string; name: string; role: string }
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/tasks/${taskId}`), {
    assignedTo: contact.id,
    assignedName: contact.name,
    trade: contact.role,
  });
}

/** Contractor submits task completion (goes to pending-review or done) */
export async function submitTaskCompletion(
  userId: string,
  projectId: string,
  taskId: string,
  data: {
    completedBy: string;
    completionNote?: string;
    completionPhotos?: CompletionPhoto[];
    timeSpent?: number;
  },
  requiresApproval: boolean
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/tasks/${taskId}`), {
    ...data,
    completedAt: new Date().toISOString(),
    status: requiresApproval ? "pending-review" : "done",
    done: !requiresApproval,
  });
}

/** Owner approves a task in pending-review */
export async function approveTask(
  userId: string,
  projectId: string,
  taskId: string,
  reviewNote?: string
): Promise<void> {
  const now = new Date().toISOString();
  await update(ref(db, `users/${userId}/projects/${projectId}/tasks/${taskId}`), {
    status: "done",
    done: true,
    reviewedAt: now,
    reviewedBy: userId,
    reviewNote: reviewNote || "Approved",
  });

  // Recalculate progress from tasks
  try {
    const [tasksSnap, projectSnap] = await Promise.all([
      get(ref(db, `users/${userId}/projects/${projectId}/tasks`)),
      get(ref(db, `users/${userId}/projects/${projectId}`)),
    ]);

    if (tasksSnap.exists()) {
      let total = 0, done = 0, pending = 0;
      tasksSnap.forEach((child) => {
        total++;
        if (child.val().done) done++;
        if (child.val().status === "pending-review") pending++;
      });
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      const updates: Record<string, unknown> = { progress, openItems: pending, updatedAt: now };

      await update(ref(db, `users/${userId}/projects/${projectId}`), updates);
    }

    // Auto-check milestone when ALL tasks under it are complete
    if (tasksSnap.exists()) {
      const taskVal = (await get(ref(db, `users/${userId}/projects/${projectId}/tasks/${taskId}`))).val();
      if (taskVal?.milestoneIndex != null && taskVal?.phase != null) {
        const msIndex = taskVal.milestoneIndex;
        const phase = taskVal.phase;
        // Check if all tasks with same phase + milestoneIndex are done
        let allMsDone = true;
        tasksSnap.forEach((child) => {
          const t = child.val();
          if (t.phase === phase && t.milestoneIndex === msIndex && !t.done && t.status !== "cancelled") {
            allMsDone = false;
          }
        });
        if (allMsDone) {
          try {
            const { getPhaseDefinition, PHASE_ORDER } = await import("@keystone/market-data");
            const projVal = projectSnap.val();
            const phaseKey = PHASE_ORDER[phase];
            const phaseDef = phaseKey ? getPhaseDefinition(projVal.market, phaseKey) : null;
            if (phaseDef) {
              await toggleMilestoneProgress(userId, projectId, phaseKey!, msIndex, true, phaseDef.milestones.length);
            }
          } catch { /* non-blocking */ }
        }
      }
    }
  } catch {
    // Non-blocking: progress update is best-effort
  }
}

/** Owner rejects a task — goes back to in-progress */
export async function rejectTask(
  userId: string,
  projectId: string,
  taskId: string,
  rejectionReason: string,
  currentRejectionCount: number
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/tasks/${taskId}`), {
    status: "rejected",
    done: false,
    reviewedAt: new Date().toISOString(),
    reviewedBy: userId,
    rejectionReason,
    rejectionCount: currentRejectionCount + 1,
    completedAt: null,
    completionPhotos: null,
    completionNote: null,
  });
}

/** Add a comment to a task thread */
export async function addTaskComment(
  userId: string,
  projectId: string,
  taskId: string,
  comment: Omit<TaskComment, "id" | "createdAt">
): Promise<void> {
  const commentsRef = ref(db, `users/${userId}/projects/${projectId}/tasks/${taskId}/comments`);
  await push(commentsRef, {
    ...comment,
    createdAt: new Date().toISOString(),
  });
}

// --- Documents ---

export async function addDocument(userId: string, data: Omit<DocumentData, "id">): Promise<string> {
  const docRef = push(ref(db, `users/${userId}/projects/${data.projectId}/documents`));
  await set(docRef, data);
  return docRef.key!;
}

export function subscribeToDocuments(
  userId: string,
  projectId: string,
  callback: (docs: DocumentData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/documents`), (snapshot) => {
    const docs: DocumentData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        docs.push({ id: child.key!, ...child.val() });
      });
    }
    callback(docs);
  }, (error) => {
    console.error("Subscription error (documents):", error);
  });
}

// --- Generated Documents ---

export async function addGeneratedDocument(userId: string, data: {
  projectId: string;
  name: string;
  type: string;
  phase: string;
  templateId: string;
  generatedAt: string;
}): Promise<string> {
  const docRef = push(ref(db, `users/${userId}/projects/${data.projectId}/documents`));
  await set(docRef, {
    ...data,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  });
  return docRef.key!;
}

// --- Photos ---

export async function addPhoto(userId: string, data: Omit<PhotoData, "id">): Promise<string> {
  const photoRef = push(ref(db, `users/${userId}/projects/${data.projectId}/photos`));
  await set(photoRef, data);
  return photoRef.key!;
}

export function subscribeToPhotos(
  userId: string,
  projectId: string,
  callback: (photos: PhotoData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/photos`), (snapshot) => {
    const photos: PhotoData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        photos.push({ id: child.key!, ...child.val() });
      });
    }
    callback(photos);
  }, (error) => {
    console.error("Subscription error (photos):", error);
  });
}

// --- Inspection Results ---

export interface InspectionResultData {
  id?: string;
  projectId: string;
  inspectionId: string;
  phase: string;
  completedItems: boolean[];
  passed: boolean;
  notes?: string;
  photoIds?: string[];
  completedAt?: string;
  updatedAt: string;
}

export async function addInspectionResult(userId: string, data: Omit<InspectionResultData, "id">): Promise<string> {
  const resultRef = push(ref(db, `users/${userId}/projects/${data.projectId}/inspectionResults`));
  await set(resultRef, data);
  return resultRef.key!;
}

export function subscribeToInspectionResults(
  userId: string,
  projectId: string,
  callback: (results: InspectionResultData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/inspectionResults`), (snapshot) => {
    const results: InspectionResultData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        results.push({ id: child.key!, ...child.val() });
      });
    }
    callback(results);
  }, (error) => {
    console.error("Subscription error (inspection results):", error);
  });
}

export async function updateInspectionResult(
  userId: string,
  projectId: string,
  resultId: string,
  data: Partial<InspectionResultData>
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/inspectionResults/${resultId}`), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

// --- Punch List Items ---

export interface PunchListItemData {
  id?: string;
  projectId: string;
  description: string;
  trade: string;
  severity: "critical" | "major" | "minor";
  status: "open" | "in-progress" | "resolved";
  notes?: string;
  photoIds?: string[];
  createdAt: string;
  resolvedAt?: string;
}

export async function addPunchListItem(userId: string, data: Omit<PunchListItemData, "id" | "createdAt">): Promise<string> {
  const itemRef = push(ref(db, `users/${userId}/projects/${data.projectId}/punchListItems`));
  await set(itemRef, { ...data, createdAt: new Date().toISOString() });
  return itemRef.key!;
}

export function subscribeToPunchListItems(
  userId: string,
  projectId: string,
  callback: (items: PunchListItemData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/punchListItems`), (snapshot) => {
    const items: PunchListItemData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        items.push({ id: child.key!, ...child.val() });
      });
    }
    callback(items);
  }, (error) => {
    console.error("Subscription error (punch list items):", error);
  });
}

export async function updatePunchListItem(
  userId: string,
  projectId: string,
  itemId: string,
  data: Partial<PunchListItemData>
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/punchListItems/${itemId}`), data);
}

// --- Materials ---

export interface MaterialData {
  id?: string;
  projectId: string;
  name: string;
  quantityOrdered: number;
  quantityDelivered: number;
  unitPrice: number;
  supplier?: string;
  status: "ordered" | "partial" | "delivered" | "verified";
  createdAt: string;
}

export async function addMaterial(userId: string, data: Omit<MaterialData, "id" | "createdAt">): Promise<string> {
  const materialRef = push(ref(db, `users/${userId}/projects/${data.projectId}/materials`));
  await set(materialRef, { ...data, createdAt: new Date().toISOString() });
  return materialRef.key!;
}

export function subscribeToMaterials(
  userId: string,
  projectId: string,
  callback: (materials: MaterialData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/materials`), (snapshot) => {
    const materials: MaterialData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        materials.push({ id: child.key!, ...child.val() });
      });
    }
    callback(materials);
  }, (error) => {
    console.error("Subscription error (materials):", error);
  });
}

export async function updateMaterial(
  userId: string,
  projectId: string,
  materialId: string,
  data: Partial<MaterialData>
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/materials/${materialId}`), data);
}

// --- Vault Files ---

export interface VaultFileData {
  id?: string;
  projectId: string;
  name: string;
  category: "architecture" | "legal" | "financial" | "photos" | "notes" | "reports" | "other";
  description?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export async function addVaultFile(userId: string, data: Omit<VaultFileData, "id">): Promise<string> {
  const fileRef = push(ref(db, `users/${userId}/projects/${data.projectId}/vault`));
  await set(fileRef, data);
  return fileRef.key!;
}

export function subscribeToVaultFiles(
  userId: string,
  projectId: string,
  callback: (files: VaultFileData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/vault`), (snapshot) => {
    const files: VaultFileData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        files.push({ id: child.key!, ...child.val() });
      });
    }
    // Sort newest first
    files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    callback(files);
  }, (error) => {
    console.error("Subscription error (vault files):", error);
  });
}

export async function deleteVaultFile(userId: string, projectId: string, fileId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/vault/${fileId}`));
}

// --- Delete Budget Item ---

export async function deleteBudgetItem(userId: string, projectId: string, itemId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/budgetItems/${itemId}`));
}

// --- Update Contact ---

export async function updateContact(userId: string, projectId: string, contactId: string, data: Partial<ContactData>): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/contacts/${contactId}`), data);
}

// --- Delete Contact ---

export async function deleteContact(userId: string, projectId: string, contactId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/contacts/${contactId}`));
}

// --- Delete Task ---

export async function deleteTask(userId: string, projectId: string, taskId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/tasks/${taskId}`));
}

// --- Update Daily Log ---

export async function updateDailyLog(userId: string, projectId: string, logId: string, data: Partial<DailyLogData>): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/dailyLogs/${logId}`), data);
}

// --- Delete Daily Log ---

export async function deleteDailyLog(userId: string, projectId: string, logId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/dailyLogs/${logId}`));
}

// --- Delete Photo ---

export async function deletePhoto(userId: string, projectId: string, photoId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/photos/${photoId}`));
}

// --- Delete Document ---

export async function deleteDocument(userId: string, projectId: string, docId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/documents/${docId}`));
}

// --- Milestone Progress ---

export async function getMilestoneProgress(userId: string, projectId: string, phase: string): Promise<boolean[]> {
  const snap = await get(ref(db, `users/${userId}/projects/${projectId}/milestoneProgress/${phase}`));
  return snap.exists() ? snap.val() : [];
}

export function subscribeToMilestoneProgress(
  userId: string,
  projectId: string,
  phase: string,
  callback: (progress: boolean[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/milestoneProgress/${phase}`), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : []);
  }, (error) => {
    console.error("Subscription error (milestone progress):", error);
  });
}

export function subscribeToAllMilestoneProgress(
  userId: string,
  projectId: string,
  callback: (progress: Record<string, boolean[]>) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/milestoneProgress`), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : {});
  }, (error) => {
    console.error("Subscription error (all milestone progress):", error);
  });
}

// NOTE: Potential race condition on concurrent milestone toggles.
// Risk is low for single-user projects. Consider Firebase transactions for multi-user.
export async function toggleMilestoneProgress(
  userId: string,
  projectId: string,
  phase: string,
  index: number,
  completed: boolean,
  totalMilestones: number
): Promise<void> {
  const progressRef = ref(db, `users/${userId}/projects/${projectId}/milestoneProgress/${phase}`);
  const snap = await get(progressRef);
  const current: boolean[] = snap.exists() ? snap.val() : new Array(totalMilestones).fill(false);
  current[index] = completed;
  await set(progressRef, current);
}

// --- Milestone Dates ---

export async function setMilestoneDate(
  userId: string,
  projectId: string,
  phase: string,
  milestoneIndex: number,
  date: string | null
): Promise<void> {
  const datesRef = ref(db, `users/${userId}/projects/${projectId}/milestoneDates/${phase}/${milestoneIndex}`);
  if (date === null) {
    await remove(datesRef);
  } else {
    await set(datesRef, date);
  }
}

/**
 * Sync task completion → milestone: when a task sourced from a milestone is completed,
 * find and check the corresponding milestone in the schedule.
 */
async function syncTaskToMilestone(userId: string, projectId: string, phaseIndex: number, milestoneName: string): Promise<void> {
  const { getPhaseDefinition, PHASE_ORDER } = await import("@keystone/market-data");
  const projSnap = await get(ref(db, `users/${userId}/projects/${projectId}`));
  if (!projSnap.exists()) return;
  const project = projSnap.val();
  const phaseKey = PHASE_ORDER[phaseIndex];
  if (!phaseKey) return;
  const phaseDef = getPhaseDefinition(project.market, phaseKey);
  if (!phaseDef) return;
  const milestoneIndex = phaseDef.milestones.findIndex(
    (m: any) => m.name.toLowerCase() === milestoneName.toLowerCase()
  );
  if (milestoneIndex === -1) return;
  await toggleMilestoneProgress(userId, projectId, phaseKey, milestoneIndex, true, phaseDef.milestones.length);
}

export function subscribeToAllMilestoneDates(
  userId: string,
  projectId: string,
  callback: (dates: Record<string, Record<number, string>>) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/milestoneDates`), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : {});
  }, (error) => {
    console.error("Subscription error (milestone dates):", error);
  });
}

// --- AI Conversations ---

export async function saveConversation(
  userId: string,
  projectId: string,
  messages: { role: string; content: string }[]
): Promise<void> {
  await set(ref(db, `users/${userId}/projects/${projectId}/conversations/active`), {
    messages,
    updatedAt: new Date().toISOString(),
  });
}

export function subscribeToConversation(
  userId: string,
  projectId: string,
  callback: (messages: { role: string; content: string }[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/conversations/active`), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val().messages ?? []);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Subscription error (conversation):", error);
  });
}

export async function clearConversation(
  userId: string,
  projectId: string
): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/conversations/active`));
}

// --- Delete Punch List Item ---

export async function deletePunchListItem(userId: string, projectId: string, itemId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/punchListItems/${itemId}`));
}

// --- Advance Project Phase ---

export async function advanceProjectPhase(userId: string, projectId: string, newPhase: number, phaseName: string): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}`), {
    currentPhase: newPhase,
    completedPhases: newPhase,
    phaseName: phaseName,
    updatedAt: new Date().toISOString(),
  });
}

// --- Phased Funding ---

export async function savePhasedFunding(userId: string, projectId: string, funding: Record<string, number>): Promise<void> {
  await set(ref(db, `users/${userId}/projects/${projectId}/phasedFunding`), funding);
}

export function subscribeToPhasedFunding(
  userId: string,
  projectId: string,
  callback: (funding: Record<string, number>) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/phasedFunding`), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : {});
  }, (error) => {
    console.error("Subscription error (phased funding):", error);
  });
}

// --- Seed demo data ---

export async function seedDemoProject(userId: string): Promise<string> {
  const projectId = await createProject({
    userId,
    name: "Robinson Residence",
    market: "USA",
    purpose: "OCCUPY",
    propertyType: "SFH",
    sizeRange: "medium",
    currentPhase: 6,
    completedPhases: 5,
    phaseName: "Phase 6: Build",
    progress: 62,
    status: "ACTIVE",
    totalBudget: 385000,
    totalSpent: 239000,
    currency: "USD",
    currentWeek: 24,
    totalWeeks: 46,
    openItems: 3,
    subPhase: "Mechanical rough-in",
    details: "4 bed / 3 bath / 2,200 sf / Houston, TX",
    isDemo: true,
  });

  // Seed budget items (10 categories)
  const budgetItems: Omit<BudgetItemData, "id">[] = [
    { projectId, category: "Site prep", estimated: 8500, actual: 8200, status: "on-track" },
    { projectId, category: "Foundation", estimated: 22000, actual: 21800, status: "on-track" },
    { projectId, category: "Framing", estimated: 48000, actual: 49200, status: "over" },
    { projectId, category: "Envelope", estimated: 52000, actual: 51500, status: "on-track" },
    { projectId, category: "Rough-in", estimated: 42000, actual: 38000, status: "under" },
    { projectId, category: "Insulation/drywall", estimated: 28000, actual: 0, status: "not-started" },
    { projectId, category: "Interior finishes", estimated: 118000, actual: 55000, status: "under" },
    { projectId, category: "Exterior", estimated: 24000, actual: 0, status: "not-started" },
    { projectId, category: "Permits/fees", estimated: 9500, actual: 9500, status: "on-track" },
    { projectId, category: "Contingency (15%)", estimated: 57750, actual: 5500, status: "under" },
  ];
  for (const item of budgetItems) {
    await addBudgetItem(userId, item);
  }

  // Seed contacts (6 trades)
  const contacts: Omit<ContactData, "id">[] = [
    { projectId, name: "Martinez Framing LLC", initials: "MF", role: "Framing", rating: 4.8, phone: "(713) 555-0142" },
    { projectId, name: "R. Williams Plumbing", initials: "RW", role: "Plumber", rating: 4.5, phone: "(713) 555-0198" },
    { projectId, name: "Delta Electric Co.", initials: "DE", role: "Electrician", rating: 4.7, phone: "(713) 555-0231" },
    { projectId, name: "AirComfort HVAC", initials: "AC", role: "HVAC", rating: 4.3, phone: "(713) 555-0317" },
    { projectId, name: "TexStar Concrete", initials: "TC", role: "Foundation", rating: 4.6, phone: "(713) 555-0405" },
    { projectId, name: "K. Brown Architecture", initials: "KB", role: "Architect", rating: 4.9, phone: "(713) 555-0178", email: "kbrown@kbarchitects.com" },
  ];
  for (const c of contacts) {
    await addContact(userId, c);
  }

  // Seed tasks (11 items: 5 done, 2 in-progress, 4 upcoming)
  const tasks: Omit<TaskData, "id">[] = [
    { projectId, label: "HVAC ductwork installation", status: "done", done: true, order: 0 },
    { projectId, label: "Plumbing supply lines (PEX)", status: "done", done: true, order: 1 },
    { projectId, label: "Plumbing drain/vent lines (PVC)", status: "done", done: true, order: 2 },
    { projectId, label: "Bathtub installation (3 units)", status: "done", done: true, order: 3 },
    { projectId, label: "Water heater placed in utility closet", status: "done", done: true, order: 4 },
    { projectId, label: "Electrical: run all branch circuits", status: "in-progress", done: false, order: 5 },
    { projectId, label: "Electrical: outlet and switch boxes", status: "in-progress", done: false, order: 6 },
    { projectId, label: "Schedule rough-in inspection", status: "upcoming", done: false, order: 7 },
    { projectId, label: "Pass mechanical rough-in inspection", status: "upcoming", done: false, order: 8 },
    { projectId, label: "Insulation: spray foam walls (R-21)", status: "upcoming", done: false, order: 9 },
    { projectId, label: "Insulation: blown attic (R-49)", status: "upcoming", done: false, order: 10 },
  ];
  for (const t of tasks) {
    await addTask(userId, t);
  }

  // Seed daily logs (3 recent days)
  const logs: Omit<DailyLogData, "id" | "createdAt">[] = [
    {
      projectId,
      date: "Mar 15, 2026",
      day: 142,
      weather: "Partly cloudy 72F",
      crew: 4,
      content: "Electrician (Delta Electric) continued rough-in on second floor. All bedroom circuits wired. Kitchen island conduit connected to panel. Need to schedule inspection for early next week. Plumber came back to fix a leaking PEX connection near master bath. Resolved same day, no charge under warranty.",
    },
    {
      projectId,
      date: "Mar 14, 2026",
      day: 141,
      weather: "Sunny 75F",
      crew: 6,
      content: "Electrician started rough-in. 200A panel mounted. First floor wiring 80% complete. Verified outlet box locations against electrical plan. Two missing in garage, corrected on site. 4 photos uploaded. Draw request #5 prepared for lender submission Monday.",
    },
    {
      projectId,
      date: "Mar 13, 2026",
      day: 140,
      weather: "Sunny 70F",
      crew: 3,
      content: "Plumbing rough-in completed. PEX supply lines pressure tested 80 PSI for 30 min with no drop. PVC drain slope verified with level. Water heater placed in utility closet. Bathtubs set in all 3 bathrooms. Ready for electrical rough-in.",
    },
  ];
  for (const l of logs) {
    await addDailyLog(userId, l);
  }

  // Seed documents (8 across multiple phases)
  const docs: Omit<DocumentData, "id">[] = [
    { projectId, name: "Construction loan agreement", phase: "Phase 1: Finance", date: "Mar 2", type: "CONTRACT" },
    { projectId, name: "Land purchase agreement", phase: "Phase 2: Land", date: "Feb 15", type: "LEGAL" },
    { projectId, name: "Building plans (full set)", phase: "Phase 3: Design", date: "Feb 28", type: "PLAN" },
    { projectId, name: "Building permit #BP-2026-4421", phase: "Phase 4: Approve", date: "Mar 8", type: "PERMIT" },
    { projectId, name: "Martinez Framing contract", phase: "Phase 5: Assemble", date: "Mar 10", type: "CONTRACT" },
    { projectId, name: "Draw request #4 (approved)", phase: "Phase 6: Build", date: "Mar 12", type: "INVOICE" },
    { projectId, name: "Framing inspection report", phase: "Phase 6: Build", date: "Mar 14", type: "REPORT" },
    { projectId, name: "Change order #2 windows", phase: "Phase 6: Build", date: "Mar 15", type: "CONTRACT" },
  ];
  for (const d of docs) {
    await addDocument(userId, d);
  }

  return projectId;
}

// --- Contractor Ratings ---

export interface ContractorRating {
  id?: string;
  projectId: string;
  contactId: string;
  contactName: string;
  taskId: string;
  taskLabel: string;
  overall: number;        // 1-5 stars
  quality?: number;       // 1-5
  timeliness?: number;    // 1-5
  communication?: number; // 1-5
  comment?: string;
  createdAt: string;
}

export async function addContractorRating(
  userId: string,
  data: Omit<ContractorRating, "id" | "createdAt">
): Promise<void> {
  const ratingsRef = ref(db, `users/${userId}/contractorRatings`);
  await push(ratingsRef, { ...data, createdAt: new Date().toISOString() });
}

export function subscribeToContractorRatings(
  userId: string,
  callback: (ratings: ContractorRating[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/contractorRatings`), (snapshot) => {
    const ratings: ContractorRating[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        ratings.push({ id: child.key!, ...child.val() });
      });
    }
    callback(ratings);
  }, (error) => {
    console.error("Subscription error (contractor ratings):", error);
  });
}

// --- Change Orders ---

export interface ChangeOrder {
  id?: string;
  projectId: string;
  taskId?: string;
  description: string;
  reason: string;
  priceImpact: number;    // positive = additional cost, negative = credit
  scheduleImpact: number; // additional days
  initiatedBy: "owner" | "contractor";
  initiatorName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  resolvedAt?: string;
  resolvedNote?: string;
}

export async function createChangeOrder(
  userId: string,
  data: Omit<ChangeOrder, "id" | "createdAt">
): Promise<string> {
  const coRef = push(ref(db, `users/${userId}/projects/${data.projectId}/changeOrders`));
  await set(coRef, { ...data, createdAt: new Date().toISOString() });
  return coRef.key!;
}

export async function resolveChangeOrder(
  userId: string,
  projectId: string,
  changeOrderId: string,
  status: "approved" | "rejected",
  note?: string
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/changeOrders/${changeOrderId}`), {
    status,
    resolvedAt: new Date().toISOString(),
    resolvedNote: note || null,
  });
}

export function subscribeToChangeOrders(
  userId: string,
  projectId: string,
  callback: (orders: ChangeOrder[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/changeOrders`), (snapshot) => {
    const orders: ChangeOrder[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        orders.push({ id: child.key!, ...child.val() });
      });
    }
    callback(orders);
  }, (error) => {
    console.error("Subscription error (change orders):", error);
  });
}

// --- Phase Step Completions ---

export interface StepDecision {
  question: string;
  answer: string;
  reasoning?: string;
  decidedAt: string;
  tags?: string[];
}

export interface PhaseStepCompletion {
  completedAt: string;
  documentIds?: string[];
  notes?: string;
  decisions?: StepDecision[];
}

export async function completePhaseStep(
  userId: string,
  projectId: string,
  stepId: string,
  data: PhaseStepCompletion
): Promise<void> {
  await set(ref(db, `users/${userId}/projects/${projectId}/phaseSteps/${stepId}`), data);
}

export async function uncompletePhaseStep(
  userId: string,
  projectId: string,
  stepId: string
): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/phaseSteps/${stepId}`));
}

export function subscribeToPhaseSteps(
  userId: string,
  projectId: string,
  callback: (steps: Record<string, PhaseStepCompletion>) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/phaseSteps`), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : {});
  }, (error) => {
    console.error("Subscription error (phase steps):", error);
  });
}

export async function addStepDecision(
  userId: string,
  projectId: string,
  stepId: string,
  decision: StepDecision
): Promise<void> {
  const stepRef = ref(db, `users/${userId}/projects/${projectId}/phaseSteps/${stepId}`);
  const snapshot = await get(stepRef);
  const existing = snapshot.exists() ? snapshot.val() : {};
  const decisions = existing.decisions || [];
  decisions.push(decision);
  await update(stepRef, { decisions });
}

export async function removeStepDecision(
  userId: string,
  projectId: string,
  stepId: string,
  decisionIndex: number
): Promise<void> {
  const stepRef = ref(db, `users/${userId}/projects/${projectId}/phaseSteps/${stepId}`);
  const snapshot = await get(stepRef);
  if (!snapshot.exists()) return;
  const existing = snapshot.val();
  const decisions: StepDecision[] = existing.decisions || [];
  decisions.splice(decisionIndex, 1);
  await update(stepRef, { decisions });
}

export async function updateStepDecision(
  userId: string,
  projectId: string,
  stepId: string,
  decisionIndex: number,
  decision: StepDecision
): Promise<void> {
  const stepRef = ref(db, `users/${userId}/projects/${projectId}/phaseSteps/${stepId}`);
  const snapshot = await get(stepRef);
  if (!snapshot.exists()) return;
  const existing = snapshot.val();
  const decisions: StepDecision[] = existing.decisions || [];
  decisions[decisionIndex] = decision;
  await update(stepRef, { decisions });
}
