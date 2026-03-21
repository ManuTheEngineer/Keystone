import type { ProjectData, PunchListItemData, TaskData, DailyLogData } from "@/lib/services/project-service";

export interface AppNotification {
  id: string;
  type: "urgent" | "warning" | "reminder" | "info";
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  href?: string;
  createdAt: string;
  read: boolean;
}

const PHASE_NAMES: Record<number, string> = {
  0: "Define",
  1: "Finance",
  2: "Land",
  3: "Design",
  4: "Approve",
  5: "Assemble",
  6: "Build",
  7: "Verify",
  8: "Operate",
};

function daysSince(dateStr: string | undefined): number {
  if (!dateStr) return 999;
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

/**
 * Generate notifications from project data alone (no sub-collection queries).
 * This is the lightweight path used for all projects.
 */
export function generateProjectNotifications(
  projects: ProjectData[],
): AppNotification[] {
  const notifications: AppNotification[] = [];

  for (const project of projects) {
    if (project.status !== "ACTIVE") continue;
    const pid = project.id ?? "";
    const pName = project.name;
    // Use project's updatedAt as the base timestamp — reflects when data last changed
    const projectTimestamp = project.updatedAt || project.createdAt;

    // 1. Budget overrun (urgent): totalSpent > totalBudget * 0.95
    if (project.totalBudget > 0 && project.totalSpent > 0) {
      const budgetRatio = project.totalSpent / project.totalBudget;
      if (budgetRatio >= 0.95) {
        const pct = Math.round(budgetRatio * 100);
        const remainPct = Math.max(0, 100 - project.progress);
        notifications.push({
          id: `budget-overrun-${pid}`,
          type: "urgent",
          title: "Budget alert",
          message: `${pName} budget is ${pct}% spent with ${remainPct}% of work remaining. Review costs immediately.`,
          projectId: pid,
          projectName: pName,
          href: `/project/${pid}/budget`,
          createdAt: projectTimestamp,
          read: false,
        });
      }
    }

    // 2. Stale project (warning): no activity in 7+ days
    const staleThreshold = 7;
    const lastActivity = project.lastActivityAt ?? project.updatedAt;
    const staleDays = daysSince(lastActivity);
    if (staleDays >= staleThreshold) {
      notifications.push({
        id: `stale-${pid}`,
        type: "warning",
        title: "Project inactive",
        message: `No activity logged on ${pName} in ${staleDays} days. Update your daily log or pause the project.`,
        projectId: pid,
        projectName: pName,
        href: `/project/${pid}/daily-log`,
        createdAt: lastActivity || projectTimestamp,
        read: false,
      });
    }

    // 3. Phase completion approaching (info): progress > 90%
    if (project.progress >= 90 && project.progress < 100) {
      const nextPhase = project.currentPhase + 1;
      const nextPhaseName = PHASE_NAMES[nextPhase] ?? "next";
      notifications.push({
        id: `phase-complete-${pid}`,
        type: "info",
        title: "Phase nearly complete",
        message: `${pName} is ${project.progress}% through the ${PHASE_NAMES[project.currentPhase] ?? "current"} phase. Prepare for the ${nextPhaseName} phase.`,
        projectId: pid,
        projectName: pName,
        href: `/project/${pid}/overview`,
        createdAt: projectTimestamp,
        read: false,
      });
    }

    // 4. Missing team (warning): approaching Build but < 3 contacts
    if (project.currentPhase >= 4 && project.currentPhase <= 6) {
      const contactCount = project.contactCount ?? 0;
      if (contactCount < 3) {
        notifications.push({
          id: `missing-team-${pid}`,
          type: "warning",
          title: "Team incomplete",
          message: `${pName} has only ${contactCount} contractor${contactCount !== 1 ? "s" : ""}. You need more trades for the Build phase.`,
          projectId: pid,
          projectName: pName,
          href: `/project/${pid}/team`,
          createdAt: projectTimestamp,
          read: false,
        });
      }
    }

    // 5. Budget not set (reminder): past Define but no budget
    if (project.currentPhase > 0 && (!project.totalBudget || project.totalBudget === 0)) {
      notifications.push({
        id: `no-budget-${pid}`,
        type: "reminder",
        title: "Budget missing",
        message: `${pName} has no budget set. Add budget items to track costs.`,
        projectId: pid,
        projectName: pName,
        href: `/project/${pid}/budget`,
        createdAt: projectTimestamp,
        read: false,
      });
    }

    // 6. Schedule behind (warning): currentWeek > totalWeeks * (progress / 100) by significant margin
    if (project.totalWeeks > 0 && project.currentWeek > 0) {
      const expectedProgress = (project.currentWeek / project.totalWeeks) * 100;
      const behindBy = expectedProgress - project.progress;
      if (behindBy > 15) {
        const weeksBehind = Math.round((behindBy / 100) * project.totalWeeks);
        notifications.push({
          id: `behind-schedule-${pid}`,
          type: "warning",
          title: "Behind schedule",
          message: `${pName} is approximately ${weeksBehind} week${weeksBehind !== 1 ? "s" : ""} behind schedule based on current progress.`,
          projectId: pid,
          projectName: pName,
          href: `/project/${pid}/schedule`,
          createdAt: projectTimestamp,
          read: false,
        });
      }
    }

    // 7. Inspection approaching (reminder): Build phase and progress suggests inspection
    if (project.currentPhase === 6 && project.progress >= 40 && project.progress < 60) {
      notifications.push({
        id: `inspection-due-${pid}`,
        type: "reminder",
        title: "Inspection approaching",
        message: `${pName} is approaching rough-in inspection. Schedule with your building department.`,
        projectId: pid,
        projectName: pName,
        href: `/project/${pid}/inspections`,
        createdAt: projectTimestamp,
        read: false,
      });
    }

    // 8. AI anticipation (info): Build phase approaching insulation
    if (project.currentPhase === 6 && project.progress >= 55 && project.progress < 70) {
      notifications.push({
        id: `anticipate-${pid}`,
        type: "info",
        title: "Coming up next",
        message: `${pName} will need insulation inspection in approximately 2 weeks based on current progress.`,
        projectId: pid,
        projectName: pName,
        href: `/project/${pid}/inspections`,
        createdAt: projectTimestamp,
        read: false,
      });
    }
  }

  return notifications;
}

/**
 * Generate notifications from sub-collection data for priority projects.
 * This is the heavier path used only for the top 3 priority projects.
 */
export function generateDetailedNotifications(
  project: ProjectData,
  punchListItems: PunchListItemData[],
  tasks: TaskData[],
  dailyLogs: DailyLogData[],
): AppNotification[] {
  const notifications: AppNotification[] = [];
  const pid = project.id ?? "";
  const pName = project.name;
  const projectTimestamp = project.updatedAt || project.createdAt;

  // Critical punch list items
  const criticalPunch = punchListItems.filter(
    (item) => item.severity === "critical" && item.status !== "resolved"
  );
  if (criticalPunch.length > 0) {
    // Use the most recent critical punch item's creation time
    const latestPunchTime = criticalPunch
      .map((p) => p.createdAt)
      .filter(Boolean)
      .sort()
      .pop() || projectTimestamp;
    notifications.push({
      id: `critical-punch-${pid}`,
      type: "urgent",
      title: "Critical punch items",
      message: `${criticalPunch.length} critical punch list item${criticalPunch.length !== 1 ? "s" : ""} need attention on ${pName}.`,
      projectId: pid,
      projectName: pName,
      href: `/project/${pid}/punch-list`,
      createdAt: latestPunchTime,
      read: false,
    });
  }

  // Overdue tasks: in-progress tasks that have been open too long
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress" && !t.done);
  if (inProgressTasks.length > 3) {
    notifications.push({
      id: `overdue-tasks-${pid}`,
      type: "warning",
      title: "Many open tasks",
      message: `${pName} has ${inProgressTasks.length} tasks in progress. Consider completing some before starting new work.`,
      projectId: pid,
      projectName: pName,
      href: `/project/${pid}/overview`,
      createdAt: projectTimestamp,
      read: false,
    });
  }

  // No recent daily logs for active project
  if (dailyLogs.length > 0) {
    const mostRecent = dailyLogs[0];
    const mostRecentDate = mostRecent.createdAt || mostRecent.date;
    const logDays = daysSince(mostRecentDate);
    if (logDays >= 5 && logDays < 7) {
      notifications.push({
        id: `log-reminder-${pid}`,
        type: "reminder",
        title: "Log reminder",
        message: `Last daily log on ${pName} was ${logDays} days ago. Keep your records current.`,
        projectId: pid,
        projectName: pName,
        href: `/project/${pid}/daily-log`,
        createdAt: mostRecentDate || projectTimestamp,
        read: false,
      });
    }
  }

  return notifications;
}

/**
 * Sort notifications by urgency: urgent first, then warning, reminder, info.
 */
export function sortNotifications(notifications: AppNotification[]): AppNotification[] {
  const typeOrder: Record<string, number> = {
    urgent: 0,
    warning: 1,
    reminder: 2,
    info: 3,
  };
  return [...notifications].sort((a, b) => {
    const orderDiff = (typeOrder[a.type] ?? 4) - (typeOrder[b.type] ?? 4);
    if (orderDiff !== 0) return orderDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
