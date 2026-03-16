import type {
  ProjectData,
  BudgetItemData,
  TaskData,
  DailyLogData,
  ContactData,
} from "./services/project-service";

export interface Insight {
  type: "tip" | "warning" | "risk" | "recommendation" | "milestone";
  title: string;
  content: string;
  priority: number; // 1-10, higher = more important
  action?: { label: string; href?: string };
}

// ---------------------------------------------------------------------------
// Overview insights
// ---------------------------------------------------------------------------

export function generateOverviewInsights(
  project: ProjectData,
  budget: BudgetItemData[],
  tasks: TaskData[],
  logs: DailyLogData[],
  contacts: ContactData[]
): Insight[] {
  const insights: Insight[] = [];
  const projectId = project.id ?? "";

  // 1. Budget burn rate
  if (project.totalBudget > 0 && project.totalWeeks > 0) {
    const spendPct = project.totalSpent / project.totalBudget;
    const timePct = project.currentWeek / project.totalWeeks;
    if (spendPct > timePct + 0.15) {
      const spendDisplay = Math.round(spendPct * 100);
      const progressDisplay = project.progress;
      insights.push({
        type: "risk",
        title: "Spend rate outpacing progress",
        content: `You have used ${spendDisplay}% of your budget but completed only ${progressDisplay}% of the project. Review upcoming costs and consider value engineering to bring spending back in line.`,
        priority: 9,
        action: { label: "Review budget", href: `/project/${projectId}/budget` },
      });
    }
  }

  // 2. No recent activity
  if (logs.length > 0) {
    const latestDate = new Date(logs[0].createdAt);
    const daysSince = Math.floor(
      (Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince > 3) {
      insights.push({
        type: "warning",
        title: `No site activity logged in ${daysSince} days`,
        content:
          "If construction is paused, update your project status. If work is ongoing, daily logs help track progress and protect you in disputes.",
        priority: 7,
        action: {
          label: "Add daily log",
          href: `/project/${projectId}/daily-log`,
        },
      });
    }
  } else if (project.currentPhase >= 6) {
    insights.push({
      type: "warning",
      title: "No daily logs recorded",
      content:
        "During active construction, daily logs create a written record of progress, weather, and crew activity. They are valuable for draw requests and dispute resolution.",
      priority: 7,
      action: {
        label: "Add daily log",
        href: `/project/${projectId}/daily-log`,
      },
    });
  }

  // 3. Milestone approaching
  if (project.progress > 0 && project.progress < 100) {
    const milestones = [
      { pct: 25, name: "Foundation Complete", action: "Prepare for the framing phase and schedule a foundation inspection." },
      { pct: 50, name: "Rough-In Complete", action: "Schedule mechanical inspections before closing walls." },
      { pct: 75, name: "Interior Finishes", action: "Review finish selections and confirm material lead times." },
      { pct: 90, name: "Substantial Completion", action: "Begin your punch list walkthrough and schedule final inspections." },
    ];
    for (const ms of milestones) {
      if (project.progress >= ms.pct - 5 && project.progress < ms.pct + 5) {
        insights.push({
          type: "milestone",
          title: `Approaching: ${ms.name}`,
          content: ms.action,
          priority: 6,
        });
        break;
      }
    }
  }

  // 4. Missing trades for current phase
  if (project.currentPhase >= 5 && contacts.length < 3) {
    const missing = 3 - contacts.length;
    insights.push({
      type: "recommendation",
      title: `${missing} more team member${missing > 1 ? "s" : ""} recommended`,
      content:
        "Active construction typically requires at least 3 trades on your team. Adding contacts now helps you plan scheduling and avoid delays.",
      priority: 5,
      action: { label: "Add team member", href: `/project/${projectId}/team` },
    });
  }

  // 5. Good progress
  if (
    project.totalBudget > 0 &&
    project.totalWeeks > 0 &&
    project.totalSpent <= project.totalBudget * 0.85 &&
    project.progress > 0
  ) {
    const spendPct = Math.round(
      (project.totalSpent / project.totalBudget) * 100
    );
    const timePct = Math.round(
      (project.currentWeek / project.totalWeeks) * 100
    );
    if (spendPct <= timePct + 5 && spendPct >= timePct - 15) {
      insights.push({
        type: "tip",
        title: "Project tracking well",
        content: `You are ${project.progress}% through the build with ${spendPct}% of budget used. Keep maintaining daily logs for your records.`,
        priority: 2,
      });
    }
  }

  // 6. Contingency check
  if (budget.length > 0) {
    const hasContingency = budget.some(
      (b) => b.category.toLowerCase().includes("contingency")
    );
    if (!hasContingency) {
      insights.push({
        type: "warning",
        title: "No contingency reserve in budget",
        content:
          "Most construction projects encounter unexpected costs. A 10-15% contingency is recommended to avoid project delays when surprises arise.",
        priority: 8,
        action: { label: "Add to budget", href: `/project/${projectId}/budget` },
      });
    }
  }

  // 7. Photo documentation gap
  if (project.currentPhase >= 6 && project.progress > 10) {
    // We do not have photos in this function signature, but we can check logs
    const recentLogsWithPhotos = logs.filter(
      (l) => l.content.toLowerCase().includes("photo")
    );
    if (recentLogsWithPhotos.length === 0 && logs.length > 0) {
      insights.push({
        type: "recommendation",
        title: "Upload progress photos",
        content:
          "Timestamped photos serve as evidence for draw requests, milestone verification, and dispute resolution. Consider uploading photos regularly.",
        priority: 4,
        action: {
          label: "Upload photos",
          href: `/project/${projectId}/photos`,
        },
      });
    }
  }

  return insights;
}

// ---------------------------------------------------------------------------
// Budget insights
// ---------------------------------------------------------------------------

export function generateBudgetInsights(
  project: ProjectData,
  items: BudgetItemData[]
): Insight[] {
  const insights: Insight[] = [];
  const projectId = project.id ?? "";

  if (items.length === 0) return insights;

  // 1. Over-budget categories
  for (const item of items) {
    if (item.actual > 0 && item.estimated > 0 && item.actual > item.estimated) {
      const overPct = Math.round(
        ((item.actual - item.estimated) / item.estimated) * 100
      );
      const overAmt = item.actual - item.estimated;
      insights.push({
        type: "risk",
        title: `${item.category} is ${overPct}% over estimate`,
        content: `Total overrun: $${overAmt.toLocaleString()}. Consider reviewing the scope or negotiating with your contractor to contain further increases.`,
        priority: 8,
      });
    }
  }

  // 2. Under-budget opportunity
  for (const item of items) {
    if (
      item.actual > 0 &&
      item.estimated > 0 &&
      item.actual < item.estimated * 0.8
    ) {
      const underPct = Math.round(
        ((item.estimated - item.actual) / item.estimated) * 100
      );
      const savings = item.estimated - item.actual;
      insights.push({
        type: "tip",
        title: `${item.category} tracking ${underPct}% under estimate`,
        content: `Potential savings of $${savings.toLocaleString()} so far. This surplus can offset overruns in other categories.`,
        priority: 3,
      });
    }
  }

  // 3. Spending pattern
  const notStarted = items.filter((i) => i.actual === 0);
  if (notStarted.length > 3) {
    insights.push({
      type: "recommendation",
      title: `${notStarted.length} categories with no spending yet`,
      content:
        "As these phases begin, monitor initial costs closely against estimates. Early cost tracking helps catch overruns before they escalate.",
      priority: 4,
    });
  }

  // 4. No contingency
  const hasContingency = items.some(
    (b) => b.category.toLowerCase().includes("contingency")
  );
  if (!hasContingency && items.length >= 3) {
    insights.push({
      type: "warning",
      title: "Add a contingency line item",
      content:
        "Industry standard is 10-15% of total budget reserved for unexpected costs. Without contingency, any overrun directly impacts your project scope.",
      priority: 7,
    });
  }

  // 5. Overall budget health
  if (project.totalBudget > 0) {
    const utilization = project.totalSpent / project.totalBudget;
    if (utilization > 0.9 && project.progress < 85) {
      insights.push({
        type: "risk",
        title: "Budget nearly exhausted",
        content: `${Math.round(utilization * 100)}% of budget spent with ${100 - project.progress}% of work remaining. Immediate review recommended.`,
        priority: 10,
        action: { label: "Review details", href: `/project/${projectId}/budget` },
      });
    }
  }

  return insights;
}

// ---------------------------------------------------------------------------
// Schedule insights
// ---------------------------------------------------------------------------

export function generateScheduleInsights(project: ProjectData): Insight[] {
  const insights: Insight[] = [];

  if (project.totalWeeks <= 0 || project.currentWeek <= 0) return insights;

  // 1. Timeline projection
  if (project.progress > 5) {
    const weeksPerPct = project.currentWeek / project.progress;
    const projectedTotal = Math.round(weeksPerPct * 100);
    if (projectedTotal > project.totalWeeks * 1.1) {
      insights.push({
        type: "recommendation",
        title: "Timeline may extend",
        content: `At your current pace, the project may complete around week ${projectedTotal} (${projectedTotal - project.currentWeek} weeks from now). Your original estimate was ${project.totalWeeks} weeks.`,
        priority: 6,
      });
    } else if (projectedTotal < project.totalWeeks * 0.9) {
      insights.push({
        type: "tip",
        title: "Ahead of schedule",
        content: `At your current pace, the project may finish around week ${projectedTotal}, ahead of the ${project.totalWeeks}-week estimate.`,
        priority: 3,
      });
    }
  }

  // 2. Phase duration warning
  const phaseDurations: Record<number, { name: string; maxWeeks: number }> = {
    0: { name: "Define", maxWeeks: 4 },
    1: { name: "Finance", maxWeeks: 8 },
    2: { name: "Land", maxWeeks: 12 },
    3: { name: "Design", maxWeeks: 10 },
    4: { name: "Approve", maxWeeks: 8 },
    5: { name: "Assemble", maxWeeks: 6 },
    6: { name: "Build", maxWeeks: 30 },
    7: { name: "Verify", maxWeeks: 4 },
    8: { name: "Operate", maxWeeks: 999 },
  };

  const current = phaseDurations[project.currentPhase];
  if (current && project.currentWeek > current.maxWeeks) {
    insights.push({
      type: "warning",
      title: `Extended time in ${current.name} phase`,
      content: `You have been in this phase for ${project.currentWeek} weeks. Projects in your market typically complete this phase within ${current.maxWeeks} weeks. Review any blockers.`,
      priority: 5,
    });
  }

  return insights;
}

// ---------------------------------------------------------------------------
// Team insights
// ---------------------------------------------------------------------------

export function generateTeamInsights(
  project: ProjectData,
  contacts: ContactData[],
  market: string
): Insight[] {
  const insights: Insight[] = [];
  const projectId = project.id ?? "";

  // 1. Missing critical trades for construction phase
  if (project.currentPhase >= 5) {
    const criticalTrades = ["Electrician", "Plumber", "HVAC"];
    const contactRoles = contacts.map((c) => c.role.toLowerCase());
    const missing = criticalTrades.filter(
      (trade) =>
        !contactRoles.some((r) => r.includes(trade.toLowerCase()))
    );
    if (missing.length > 0) {
      insights.push({
        type: "warning",
        title: `Missing critical trade${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`,
        content:
          "These trades are essential for the construction phase. Hiring early gives you leverage to negotiate rates and schedule preferred start dates.",
        priority: 8,
        action: { label: "Add team member", href: `/project/${projectId}/team` },
      });
    }
  }

  // 2. Unrated contractors
  const unrated = contacts.filter((c) => !c.rating || c.rating === 0);
  if (unrated.length > 0 && contacts.length >= 3) {
    insights.push({
      type: "tip",
      title: "Rate your contractors",
      content: `${unrated.length} contractor${unrated.length > 1 ? "s have" : " has"} no rating yet. Rating contractors as work progresses helps you make better decisions for future phases and helps other owner-builders.`,
      priority: 2,
    });
  }

  // 3. Small team size
  if (contacts.length < 2 && project.currentPhase >= 4) {
    insights.push({
      type: "recommendation",
      title: "Build your team early",
      content:
        "Starting contractor outreach before the build phase helps you compare bids, check references, and avoid scheduling bottlenecks.",
      priority: 6,
      action: { label: "Add team member", href: `/project/${projectId}/team` },
    });
  }

  // 4. West Africa specific: WhatsApp reminder
  if (
    (market === "TOGO" || market === "GHANA" || market === "BENIN") &&
    contacts.length > 0
  ) {
    const withoutWhatsApp = contacts.filter((c) => !c.whatsapp && !c.phone);
    if (withoutWhatsApp.length > 0) {
      insights.push({
        type: "tip",
        title: "Add phone or WhatsApp numbers",
        content: `${withoutWhatsApp.length} contact${withoutWhatsApp.length > 1 ? "s" : ""} missing phone info. In West African markets, WhatsApp is the primary coordination channel with contractors.`,
        priority: 4,
      });
    }
  }

  return insights;
}
