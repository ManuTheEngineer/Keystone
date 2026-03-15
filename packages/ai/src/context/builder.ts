import type { AIRequestContext } from "../types";

/**
 * Phase name-to-index mapping for the 9-phase Keystone framework.
 */
const PHASE_INDEX: Record<string, number> = {
  DEFINE: 0,
  FINANCE: 1,
  LAND: 2,
  DESIGN: 3,
  APPROVE: 4,
  ASSEMBLE: 5,
  BUILD: 6,
  VERIFY: 7,
  OPERATE: 8,
};

/**
 * Assembles the full project context string from all fields.
 * This context block is injected into every AI prompt to give
 * the model awareness of the user's specific project state.
 */
export function buildProjectContext(context: AIRequestContext): string {
  const phaseIndex = PHASE_INDEX[context.phase] ?? 0;
  const remaining = context.totalBudget - context.totalSpent;
  const budgetUtilization =
    context.totalBudget > 0
      ? ((context.totalSpent / context.totalBudget) * 100).toFixed(1)
      : "0.0";
  const weeksRemaining = context.totalWeeks - context.currentWeek;

  const lines: string[] = [
    "=== PROJECT CONTEXT ===",
    `Project: ${context.projectName}`,
    `Market: ${context.market}`,
    `Construction method: ${context.constructionMethod}`,
    `Property type: ${context.propertyType}`,
    `Purpose: ${context.purpose}`,
    `Phase: ${context.phaseName} (Phase ${phaseIndex + 1} of 9)`,
    `Progress: ${context.progress}%`,
    "",
    "--- Budget ---",
    `Total budget: ${context.totalBudget.toLocaleString()} ${context.currency}`,
    `Spent to date: ${context.totalSpent.toLocaleString()} ${context.currency}`,
    `Remaining: ${remaining.toLocaleString()} ${context.currency}`,
    `Budget utilization: ${budgetUtilization}%`,
    "",
    "--- Schedule ---",
    `Current week: ${context.currentWeek} of ${context.totalWeeks}`,
    `Weeks remaining: ${weeksRemaining}`,
  ];

  if (context.milestones && context.milestones.length > 0) {
    lines.push("");
    lines.push("--- Upcoming Milestones ---");
    for (const milestone of context.milestones) {
      lines.push(`- ${milestone}`);
    }
  }

  if (context.costSummary) {
    lines.push("");
    lines.push("--- Cost Summary ---");
    lines.push(context.costSummary);
  }

  if (context.recentActivity) {
    lines.push("");
    lines.push("--- Recent Activity ---");
    lines.push(context.recentActivity);
  }

  lines.push("=== END PROJECT CONTEXT ===");

  return lines.join("\n");
}
