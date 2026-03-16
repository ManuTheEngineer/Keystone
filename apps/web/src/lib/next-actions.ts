interface ProjectData {
  currentPhase: number;
  totalBudget: number;
  totalSpent: number;
  purpose: string;
  market: string;
  [key: string]: any;
}

interface BudgetItemData {
  category: string;
  estimated: number;
  actual: number;
  [key: string]: any;
}

interface ContactData {
  name: string;
  role: string;
  [key: string]: any;
}

interface TaskData {
  label: string;
  done: boolean;
  [key: string]: any;
}

interface DocumentData {
  type?: string;
  [key: string]: any;
}

interface DailyLogData {
  date: string;
  [key: string]: any;
}

interface PhotoData {
  createdAt?: string;
  [key: string]: any;
}

interface PunchListItemData {
  status: string;
  [key: string]: any;
}

export interface NextAction {
  title: string;
  description: string;
  href: string;
  priority: "high" | "medium" | "low";
}

export function getNextActions(
  project: ProjectData,
  budgetItems: BudgetItemData[],
  contacts: ContactData[],
  tasks: TaskData[],
  documents: DocumentData[],
  dailyLogs: DailyLogData[],
  photos: PhotoData[],
  punchListItems: PunchListItemData[],
  projectId: string
): NextAction[] {
  const actions: NextAction[] = [];
  const phase = project.currentPhase;
  const isUSA = project.market === "USA";

  // Phase 0: Define
  if (phase === 0) {
    if (project.totalBudget === 0) {
      actions.push({
        title: "Set your budget",
        description: "Establish a realistic total budget for your project. You can start with market benchmarks and adjust from there.",
        href: `/project/${projectId}/budget`,
        priority: "high",
      });
    }
    if (budgetItems.length === 0) {
      actions.push({
        title: "Research your market",
        description: "Load market cost benchmarks to understand typical construction costs in your area and start building your budget.",
        href: `/project/${projectId}/budget`,
        priority: "medium",
      });
    }
    if (tasks.filter((t) => !t.done).length === 0) {
      actions.push({
        title: "Create your first tasks",
        description: "Add tasks to track your progress. Start with research tasks like visiting potential building sites or interviewing architects.",
        href: `/project/${projectId}/overview`,
        priority: "low",
      });
    }
  }

  // Phase 1: Finance
  if (phase === 1) {
    if (isUSA) {
      actions.push({
        title: "Run the loan calculator",
        description: "Estimate monthly payments, down payment requirements, and debt-to-income ratio for different loan types.",
        href: `/project/${projectId}/budget`,
        priority: "high",
      });
    } else {
      actions.push({
        title: "Set up a savings plan",
        description: "Plan your phase-by-phase savings targets. West African construction is typically funded in cash stages.",
        href: `/project/${projectId}/budget`,
        priority: "high",
      });
    }
    if (project.totalBudget === 0) {
      actions.push({
        title: "Finalize your budget estimate",
        description: "Lock in a target budget before moving to the land acquisition phase.",
        href: `/project/${projectId}/budget`,
        priority: "high",
      });
    }
  }

  // Phase 2: Land
  if (phase === 2) {
    if (documents.length === 0) {
      actions.push({
        title: "Upload land documents",
        description: isUSA
          ? "Upload your lot survey, deed, title report, and any HOA documents."
          : "Upload your titre foncier, boundary survey, and any customary ownership records.",
        href: `/project/${projectId}/documents`,
        priority: "high",
      });
    }
    actions.push({
      title: "Document your lot",
      description: "Take photos of the building site from multiple angles. These become your before-construction baseline.",
      href: `/project/${projectId}/photos`,
      priority: "medium",
    });
  }

  // Phase 3: Design
  if (phase === 3) {
    const hasPlanDoc = documents.some(
      (d) => d.type?.toLowerCase() === "plan" || d.type?.toLowerCase() === "PLAN"
    );
    if (!hasPlanDoc) {
      actions.push({
        title: "Add architectural plans",
        description: "Upload your floor plans, elevations, and structural drawings. These are required before applying for permits.",
        href: `/project/${projectId}/documents`,
        priority: "high",
      });
    }
    if (contacts.length === 0) {
      actions.push({
        title: "Add your architect to your team",
        description: "Track your architect's contact info, contract details, and communication history.",
        href: `/project/${projectId}/team`,
        priority: "medium",
      });
    }
  }

  // Phase 4: Approve
  if (phase === 4) {
    actions.push({
      title: isUSA ? "Apply for a building permit" : "Submit for permis de construire",
      description: isUSA
        ? "Submit your approved plans to the local building department. Track the permit application status."
        : "Submit your plans to the local mairie for approval. Track the application status.",
      href: `/project/${projectId}/documents`,
      priority: "high",
    });
  }

  // Phase 5: Assemble
  if (phase === 5) {
    if (contacts.length < 3) {
      actions.push({
        title: "Add contractors to your team",
        description: isUSA
          ? "You need a general contractor and key trades (plumber, electrician, HVAC). Add them to track bids and contracts."
          : "You need a chef de chantier and key macons. Add them to track agreements and payment schedules.",
        href: `/project/${projectId}/team`,
        priority: "high",
      });
    }
    actions.push({
      title: "Review your contracts",
      description: "Make sure all contractor agreements include scope of work, payment schedule, timeline, and warranty terms.",
      href: `/project/${projectId}/documents`,
      priority: "medium",
    });
  }

  // Phase 6: Build
  if (phase === 6) {
    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const hasLogToday = dailyLogs.some((log) => log.date === today);
    if (!hasLogToday) {
      actions.push({
        title: "Write today's daily log",
        description: "Record weather, crew size, and work completed. Daily logs are your primary record of construction progress.",
        href: `/project/${projectId}/daily-log`,
        priority: "high",
      });
    }

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const hasRecentPhotos = photos.some((p) => {
      if (!p.createdAt) return false;
      return new Date(p.createdAt).getTime() > oneWeekAgo;
    });
    if (!hasRecentPhotos) {
      actions.push({
        title: "Upload progress photos",
        description: "Timestamped photos verify construction progress. Take photos of completed work for each trade and milestone.",
        href: `/project/${projectId}/photos`,
        priority: "medium",
      });
    }

    actions.push({
      title: "Review budget status",
      description: "Check your actual spending against estimates. Update any budget items with new receipts or invoices.",
      href: `/project/${projectId}/budget`,
      priority: "low",
    });
  }

  // Phase 7: Verify
  if (phase === 7) {
    const openItems = punchListItems.filter((p) => p.status === "open" || p.status === "in-progress");
    if (openItems.length > 0) {
      actions.push({
        title: "Complete punch list items",
        description: `You have ${openItems.length} open punch list item${openItems.length === 1 ? "" : "s"}. These must be resolved before final sign-off.`,
        href: `/project/${projectId}/punch-list`,
        priority: "high",
      });
    }
    actions.push({
      title: "Schedule final inspections",
      description: isUSA
        ? "Schedule your final building, mechanical, and electrical inspections with the building department."
        : "Arrange a final walkthrough with your chef de chantier to verify all work meets specifications.",
      href: `/project/${projectId}/inspections`,
      priority: "medium",
    });
  }

  // Phase 8: Operate
  if (phase === 8) {
    if (project.purpose === "RENT") {
      actions.push({
        title: "Set up rental tracking",
        description: "Configure your rental units, set rent amounts, and begin tracking income against your construction investment.",
        href: `/project/${projectId}/overview`,
        priority: "high",
      });
    }
    if (project.purpose === "SELL") {
      actions.push({
        title: "Prepare your listing",
        description: "Gather professional photos, create a property description, and calculate your target sale price based on total construction cost.",
        href: `/project/${projectId}/overview`,
        priority: "high",
      });
    }
    if (project.purpose === "OCCUPY") {
      actions.push({
        title: "Set up warranty tracking",
        description: "Record warranty start dates and terms for your roof, HVAC, appliances, and general contractor workmanship.",
        href: `/project/${projectId}/overview`,
        priority: "medium",
      });
    }
  }

  return actions;
}
