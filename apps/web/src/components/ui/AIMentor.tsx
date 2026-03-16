"use client";

import { useState, useEffect, useCallback } from "react";
import { Lightbulb, X, ChevronDown, ChevronUp, ArrowRight, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import type { ProjectData } from "@/lib/services/project-service";

// --- Types ---

interface MentorMessage {
  id: string;
  title: string;
  guidance: string;
  whyItMatters: string;
  nextStepLabel?: string;
  nextStepHref?: string;
  isMilestone?: boolean;
}

interface AIMentorProps {
  page: string;
  project?: ProjectData;
  budgetItems?: { category: string; estimated: number; actual: number; status: string }[];
  contacts?: { name: string; role: string }[];
  phase?: number;
  market?: string;
}

// --- Storage helpers ---

const COLLAPSED_KEY = "keystone-mentor-collapsed";
const DISMISSED_KEY = "keystone-mentor-dismissed";
const MILESTONES_SEEN_KEY = "keystone-mentor-milestones-seen";

function getCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COLLAPSED_KEY) === "true";
}

function setCollapsedState(value: boolean) {
  localStorage.setItem(COLLAPSED_KEY, String(value));
}

// Snooze-based dismissal: store timestamps instead of bare IDs
interface DismissedEntry {
  id: string;
  dismissedAt: number;
}

const SNOOZE_DURATION = 86400000; // 24 hours in milliseconds

function getDismissedEntries(): DismissedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Migration: handle old format (string[]) gracefully
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
      // Old format — treat them all as expired so they come back
      return [];
    }
    return parsed as DismissedEntry[];
  } catch {
    return [];
  }
}

function getActiveDismissedIds(): string[] {
  const entries = getDismissedEntries();
  const now = Date.now();
  return entries
    .filter((entry) => now - entry.dismissedAt < SNOOZE_DURATION)
    .map((entry) => entry.id);
}

function dismissId(id: string) {
  const entries = getDismissedEntries();
  const now = Date.now();
  // Remove expired entries and any existing entry for this id
  const cleaned = entries.filter(
    (entry) => entry.id !== id && now - entry.dismissedAt < SNOOZE_DURATION
  );
  cleaned.push({ id, dismissedAt: now });
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(cleaned));
}

function getMilestonesSeen(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MILESTONES_SEEN_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function markMilestoneSeen(id: string) {
  const seen = getMilestonesSeen();
  if (!seen.includes(id)) {
    localStorage.setItem(MILESTONES_SEEN_KEY, JSON.stringify([...seen, id]));
  }
}

// --- Guidance engine ---

function getMentorGuidance(
  page: string,
  project?: ProjectData,
  budgetItems?: AIMentorProps["budgetItems"],
  contacts?: AIMentorProps["contacts"],
): MentorMessage[] {
  const hasProjects = !!project;
  const currentPhase = project?.currentPhase ?? 0;
  const totalBudget = project?.totalBudget ?? 0;
  const totalSpent = project?.totalSpent ?? 0;
  const isOverBudget = totalBudget > 0 && totalSpent > totalBudget;
  const contactCount = contacts?.length ?? 0;
  const pid = project?.id ?? "new";
  const progress = project?.progress ?? 0;
  const market = project?.market;
  const isWestAfrica = market === "TOGO" || market === "GHANA" || market === "BENIN";

  const tips: MentorMessage[] = [];

  // --- Milestone / congratulatory messages (checked first) ---
  const milestonesSeen = getMilestonesSeen();

  if (progress >= 100) {
    const mId = `milestone-100-${pid}`;
    if (!milestonesSeen.includes(mId)) {
      tips.push({
        id: mId,
        title: "Project complete",
        guidance:
          "Congratulations! Your project is complete. You have successfully navigated every phase from initial concept through final delivery. Take a moment to appreciate what you have accomplished -- not many people see a construction project through to the end.",
        whyItMatters:
          "Completing a construction project is a significant achievement. The knowledge and experience you have gained will serve you in every future project.",
        isMilestone: true,
      });
    }
  } else if (progress >= 75 && progress < 80) {
    const mId = `milestone-75-${pid}`;
    if (!milestonesSeen.includes(mId)) {
      tips.push({
        id: mId,
        title: "75% milestone reached",
        guidance:
          "Almost there! 75% of your build is done. The finish line is in sight. Stay disciplined with your budget and schedule through these final phases -- this is when fatigue sets in and costly shortcuts happen.",
        whyItMatters:
          "The last quarter of a project is where quality and budget discipline are most critical. Maintaining focus now protects everything you have built so far.",
        isMilestone: true,
      });
    }
  } else if (progress >= 50 && progress < 55) {
    const mId = `milestone-50-${pid}`;
    if (!milestonesSeen.includes(mId)) {
      tips.push({
        id: mId,
        title: "Halfway milestone",
        guidance:
          "Halfway milestone! Your build is 50% complete. This is a great time to do a full budget review and compare your actual costs to your original estimates. Adjust your remaining budget based on what you have learned.",
        whyItMatters:
          "The midpoint is your best opportunity to course-correct. You have enough data to see real trends but enough runway to make meaningful adjustments.",
        isMilestone: true,
      });
    }
  } else if (progress >= 25 && progress < 30) {
    const mId = `milestone-25-${pid}`;
    if (!milestonesSeen.includes(mId)) {
      tips.push({
        id: mId,
        title: "Quarter-way milestone",
        guidance:
          "Quarter of the way there! Your project is 25% complete. You have made it through the most uncertain phase of planning and early execution. The decisions you make from here build on a solid foundation.",
        whyItMatters:
          "Reaching 25% completion means your project has survived the highest-risk period. Most failed projects never make it this far. Your planning is paying off.",
        isMilestone: true,
      });
    }
  }

  // --- Page-specific tips (multiple per context) ---

  // Dashboard with no projects
  if (page === "dashboard" && !hasProjects) {
    tips.push({
      id: "dashboard-no-projects",
      title: "Welcome to Keystone",
      guidance:
        "Every successful development starts with a clear vision. Before you pick up a hammer, you need to answer three questions: What am I building? Who am I building it for? And does the math work? Let me help you figure that out.",
      whyItMatters:
        "Most first-time builders jump straight into construction without a plan. That is how budgets explode and timelines collapse. The define phase exists to prevent that.",
      nextStepLabel: "Start your first project",
      nextStepHref: "/new-project",
    });
    tips.push({
      id: "dashboard-no-projects-2",
      title: "Learn before you build",
      guidance:
        "Take some time to explore the learning modules before starting your first project. Understanding the 8 phases of construction development will give you a roadmap for everything ahead.",
      whyItMatters:
        "Educated owner-builders make better decisions, negotiate stronger contracts, and avoid the most common pitfalls. The learning investment pays for itself many times over.",
      nextStepLabel: "Explore learning modules",
      nextStepHref: "/learn",
    });
    return tips;
  }

  // Dashboard with projects
  if (page === "dashboard" && hasProjects) {
    tips.push({
      id: "dashboard-has-projects",
      title: "Portfolio check-in",
      guidance:
        "A good developer reviews their portfolio weekly. Check your budget variance, timeline adherence, and open items. The projects that fail are the ones nobody is watching.",
      whyItMatters:
        "Consistent oversight catches small problems before they become expensive ones. A 5% cost overrun caught early is manageable. Caught late, it can sink a project.",
      nextStepLabel: "Review your project",
      nextStepHref: `/project/${pid}/overview`,
    });
    tips.push({
      id: "dashboard-has-projects-2",
      title: "Update your daily log",
      guidance:
        "If any work happened on site today, log it now while the details are fresh. Note weather conditions, crew activity, deliveries, and any issues. Tomorrow you will not remember the details.",
      whyItMatters:
        "Daily logs are your legal record of what happened on site. They are invaluable for resolving disputes, tracking progress, and justifying payment draws.",
      nextStepLabel: "Open daily log",
      nextStepHref: `/project/${pid}/daily-log`,
    });
    return tips;
  }

  // New project wizard
  if (page === "new-project") {
    tips.push({
      id: "new-project-wizard",
      title: "Evaluating your deal",
      guidance:
        "Run every potential deal through the numbers before you commit any money. The best developers pass on more deals than they take. Build-to-rent generates passive income. Build-to-sell is faster cash but riskier. Build-to-occupy saves money long-term. Think about your 5-year plan.",
      whyItMatters:
        "A bad deal with great execution is still a bad deal. Your build purpose determines your financing, design, and exit strategy. Getting this wrong means rebuilding your entire plan later.",
    });
    tips.push({
      id: "new-project-wizard-2",
      title: "Choose your market carefully",
      guidance:
        "Construction practices, costs, and regulations differ dramatically between markets. A project in the United States follows a completely different path than one in West Africa. Make sure you select the right market so Keystone can tailor its guidance to your situation.",
      whyItMatters:
        "Market-specific guidance covers everything from material costs and construction methods to legal requirements and financing options. The wrong market setting means irrelevant advice at every step.",
    });
    return tips;
  }

  // Overview page - early phases
  if (page === "overview" && currentPhase <= 1) {
    tips.push({
      id: "overview-early-phase",
      title: "Foundation of success",
      guidance:
        "The define and finance phase is where 90% of failed projects go wrong. Take your time here. A bad deal with great execution is still a bad deal. Run the numbers twice.",
      whyItMatters:
        "Rushing past planning to get to construction feels productive but costs more in the long run. Every dollar spent on planning saves ten dollars during construction.",
      nextStepLabel: "Check your budget",
      nextStepHref: `/project/${pid}/budget`,
    });
    tips.push({
      id: "overview-early-phase-2",
      title: "Define your exit strategy",
      guidance:
        "Before you spend any money, decide how this project ends. Are you living in it, renting it, or selling it? Each path has different design requirements, financing options, and budget priorities.",
      whyItMatters:
        "A home designed for personal occupancy has different priorities than a rental property. Making this decision early prevents expensive redesigns and wasted effort later.",
    });
    return tips;
  }

  // Overview page - build phase
  if (page === "overview" && currentPhase === 6) {
    tips.push({
      id: "overview-build-phase",
      title: "Construction oversight",
      guidance:
        "During construction, your job is oversight, not labor. Visit the site weekly. Compare progress to the schedule. Question every change order. Document everything with photos.",
      whyItMatters:
        "Contractors respect owners who show up, ask good questions, and keep records. Absent owners get lower priority and less attention to quality.",
      nextStepLabel: "Log today's progress",
      nextStepHref: `/project/${pid}/daily-log`,
    });
    tips.push({
      id: "overview-build-phase-2",
      title: "Watch for scope creep",
      guidance:
        "Change orders are the silent budget killer. Every time someone says 'while we are at it,' that is money leaving your pocket. Evaluate every change against your original scope and budget before approving it.",
      whyItMatters:
        "The average construction project experiences 10-15% in change orders. Disciplined owners keep this under 5% by questioning every addition and requiring written cost estimates before approving.",
    });
    return tips;
  }

  // Overview page - generic
  if (page === "overview") {
    tips.push({
      id: `overview-phase-${currentPhase}`,
      title: "Stay on track",
      guidance:
        "Review your milestones for this phase and make sure nothing is falling behind. The best time to address a delay is the day you notice it, not the day it becomes a crisis.",
      whyItMatters:
        "Small delays compound. A one-week slip in three different trades creates a three-week project delay. Active management keeps the dominos from falling.",
      nextStepLabel: "View schedule",
      nextStepHref: `/project/${pid}/schedule`,
    });
    return tips;
  }

  // Budget page - no items
  if (page === "budget" && (!budgetItems || budgetItems.length === 0)) {
    tips.push({
      id: "budget-empty",
      title: "Building your budget",
      guidance:
        "A budget is not a wish list. It is a contract with yourself about what this project will cost. Start with market benchmarks, then get actual bids. The gap between estimated and actual costs is where your profit lives or dies.",
      whyItMatters:
        "Projects without detailed budgets consistently overrun by 20-40%. A line-item budget forces you to think through every cost before you spend a dollar.",
    });
    tips.push({
      id: "budget-empty-2",
      title: "Do not forget soft costs",
      guidance:
        "Most first-time builders only budget for materials and labor. But soft costs -- permits, architectural plans, surveys, insurance, loan fees, and inspections -- typically add 15-25% to your total project cost.",
      whyItMatters:
        "Soft cost surprises are the number one reason first-time builders go over budget. Including them from the start gives you a realistic picture of your true project cost.",
    });
    if (isWestAfrica) {
      tips.push({
        id: "budget-empty-wa",
        title: "Negotiate material prices",
        guidance:
          "In West Africa, always negotiate material prices -- cement and rebar costs vary 15-30% between suppliers. Visit multiple depots, ask about bulk discounts, and time your purchases to avoid seasonal price spikes during the rainy season.",
        whyItMatters:
          "Material costs make up the largest portion of a West African construction budget. Saving even 10% on cement and rebar across a full build can free up significant funds for finishing and fixtures.",
      });
    }
    return tips;
  }

  // Budget page - over budget
  if (page === "budget" && isOverBudget) {
    tips.push({
      id: "budget-over",
      title: "Budget warning",
      guidance:
        "You are trending over budget. Every dollar over reduces your profit margin. Before spending more, ask: Is this a must-have or a nice-to-have? Can I negotiate a better price? Is there a cheaper alternative that meets the same specification?",
      whyItMatters:
        "Cost overruns eat directly into your equity. On a project with a 15% target margin, a 10% cost overrun wipes out two-thirds of your profit.",
      nextStepLabel: "Review line items",
      nextStepHref: `/project/${pid}/budget`,
    });
    tips.push({
      id: "budget-over-2",
      title: "Find compensating savings",
      guidance:
        "When one category goes over, look for savings in upcoming categories to compensate. Can you use a less expensive finish material? Can you reduce scope on non-essential features? Protect your total budget by trading between line items.",
      whyItMatters:
        "Professional developers manage to their total budget, not individual line items. Flexibility between categories is how experienced builders absorb unexpected costs without blowing the overall project.",
    });
    if (isWestAfrica) {
      tips.push({
        id: "budget-over-wa",
        title: "Negotiate material prices",
        guidance:
          "In West Africa, always negotiate material prices -- cement and rebar costs vary 15-30% between suppliers. Visit multiple depots, ask about bulk discounts, and time your purchases to avoid seasonal price spikes during the rainy season.",
        whyItMatters:
          "Material costs make up the largest portion of a West African construction budget. Saving even 10% on cement and rebar across a full build can free up significant funds for finishing and fixtures.",
      });
    }
    return tips;
  }

  // Budget page - general
  if (page === "budget") {
    tips.push({
      id: "budget-general",
      title: "Budget discipline",
      guidance:
        "Compare every actual cost to your estimate. When a line item comes in higher than expected, find a savings somewhere else to compensate. Your total budget is the number that matters, not any single line.",
      whyItMatters:
        "Professional developers track cost variance weekly. If you are not measuring it, you cannot manage it. Small overruns in many categories add up fast.",
    });
    if (isWestAfrica) {
      tips.push({
        id: "budget-general-wa",
        title: "Negotiate material prices",
        guidance:
          "In West Africa, always negotiate material prices -- cement and rebar costs vary 15-30% between suppliers. Visit multiple depots, ask about bulk discounts, and time your purchases to avoid seasonal price spikes during the rainy season.",
        whyItMatters:
          "Material costs make up the largest portion of a West African construction budget. Saving even 10% on cement and rebar across a full build can free up significant funds for finishing and fixtures.",
      });
    }
    return tips;
  }

  // Financials page
  if (page === "financials") {
    tips.push({
      id: "financials-guide",
      title: "Know your numbers",
      guidance:
        "Real estate development is a numbers game. Know your total cost basis (land + construction + soft costs + carrying costs), your expected value at completion, and your target profit margin (15-25% for new developers, 10-15% for experienced ones).",
      whyItMatters:
        "Lenders, partners, and buyers all evaluate your project by these numbers. If you cannot state your cost basis and projected return clearly, nobody will take your project seriously.",
      nextStepLabel: "View financials",
      nextStepHref: `/project/${pid}/financials`,
    });
    tips.push({
      id: "financials-guide-2",
      title: "Track your carrying costs",
      guidance:
        "Every day your project is under construction, you are paying carrying costs -- interest, insurance, taxes, and utilities. These invisible costs erode your margin. The faster you complete, the more profit you keep.",
      whyItMatters:
        "On a typical project, carrying costs run 1-2% of the project value per month. A three-month delay on a $300,000 project can cost $9,000 to $18,000 in carrying costs alone.",
    });
    return tips;
  }

  // Team page
  if (page === "team") {
    tips.push({
      id: contactCount < 3 ? "team-few-contacts" : "team-general",
      title: contactCount < 3 ? "Build your team" : "Team management",
      guidance:
        contactCount < 3
          ? "Your contractor team will make or break this project. Get at least three bids for every major trade. Check references. Visit their active job sites. The cheapest bid is almost never the best value."
          : "Keep communication clear and documented. Set expectations in writing. When issues arise, address them directly and immediately. Good contractors respect owners who communicate well.",
      whyItMatters:
        contactCount < 3
          ? "Hiring the wrong contractor is the single most expensive mistake in construction. A bad hire can cost you months of delays and thousands in rework."
          : "Professional relationships built on clear communication and mutual respect produce better work. Contractors give their best effort to owners they want to work with again.",
    });
    tips.push({
      id: "team-verify",
      title: "Verify credentials",
      guidance:
        "Before signing any contract, verify your contractor's license, insurance, and bonding. Ask for at least three references from completed projects similar to yours, and actually call them. A legitimate contractor will have no problem providing this.",
      whyItMatters:
        "Unlicensed or uninsured contractors expose you to significant financial and legal risk. If a worker is injured on your property and the contractor has no insurance, you could be personally liable.",
    });
    if (isWestAfrica) {
      tips.push({
        id: "team-wa",
        title: "Hiring a chef de chantier",
        guidance:
          "Ask for references from at least 3 completed projects before hiring a chef de chantier. Visit those completed buildings in person if possible. Look for quality of finish, structural soundness, and talk to the owners about their experience.",
        whyItMatters:
          "In West Africa, your site foreman (chef de chantier) is the single most important hire. A good one manages labor, materials, and quality daily. A bad one wastes your money and delivers poor work.",
      });
    }
    return tips;
  }

  // Schedule page
  if (page === "schedule") {
    tips.push({
      id: "schedule-guide",
      title: "Time is money",
      guidance:
        "Time is money in development. Every week of delay costs you carrying costs (loan interest, property taxes, insurance). Build your schedule with buffer time, then hold your team accountable to it.",
      whyItMatters:
        "On a $300,000 construction loan at 8% interest, every month of delay costs roughly $2,000 in interest alone. Add insurance, taxes, and opportunity cost, and delays get expensive fast.",
      nextStepLabel: "View schedule",
      nextStepHref: `/project/${pid}/schedule`,
    });
    tips.push({
      id: "schedule-guide-2",
      title: "Sequence matters",
      guidance:
        "Construction tasks have dependencies -- you cannot frame before the foundation cures, and you cannot drywall before rough-in inspections pass. Understanding the critical path helps you identify which delays actually push back your completion date.",
      whyItMatters:
        "Not all delays are equal. A delay on a critical-path task pushes back the entire project. A delay on a non-critical task may have no impact at all. Knowing the difference helps you prioritize.",
    });
    return tips;
  }

  // Documents page
  if (page === "documents") {
    tips.push({
      id: "documents-guide",
      title: "Paper trail protects you",
      guidance:
        "Never start work without a signed contract. Never pay without a lien waiver. Never close without title insurance. These three rules will save you from the most common legal problems in construction.",
      whyItMatters:
        "Construction disputes are common. Without documentation, you have no legal standing. A signed contract is your only enforceable agreement. Verbal promises mean nothing in court.",
    });
    tips.push({
      id: "documents-guide-2",
      title: "Keep originals safe",
      guidance:
        "Upload copies of all critical documents here, but also keep physical originals in a secure location. Permits, title documents, and signed contracts may be needed in their original form for legal or regulatory purposes.",
      whyItMatters:
        "Some jurisdictions require original signed documents for legal proceedings. Digital copies are excellent backups but may not replace the originals in all situations.",
    });
    return tips;
  }

  // Photos page
  if (page === "photos") {
    tips.push({
      id: "photos-guide",
      title: "Document everything",
      guidance:
        "Photos are your evidence trail. They prove work was done, support draw requests to lenders, and protect you in disputes. Take photos BEFORE every concrete pour (you will never see that rebar again once it is covered).",
      whyItMatters:
        "Lenders require photo evidence for construction draw releases. Inspectors reference photos for code compliance. And if a contractor disputes scope of work, timestamped photos are your best defense.",
    });
    tips.push({
      id: "photos-guide-2",
      title: "Organize by phase and trade",
      guidance:
        "Tag every photo with the phase and trade it relates to. When you need to find proof of rebar placement from three months ago, you will be grateful you organized as you went rather than dumping everything into one folder.",
      whyItMatters:
        "Unorganized photos are nearly useless in disputes or inspections. A well-tagged photo library lets you instantly pull evidence for any specific trade, date, or milestone.",
    });
    if (isWestAfrica) {
      tips.push({
        id: "photos-wa",
        title: "Require timestamped photos",
        guidance:
          "For diaspora builds, require your foreman to send timestamped photos at every pour and rebar placement. Insist on photos that show the full scope of work with recognizable landmarks or reference objects for scale.",
        whyItMatters:
          "When you cannot be on site personally, photos are your primary verification tool. Timestamped and geotagged photos provide tamper-resistant proof that work was completed as claimed.",
      });
    }
    return tips;
  }

  // Daily log
  if (page === "daily-log") {
    tips.push({
      id: "daily-log-guide",
      title: "Your legal record",
      guidance:
        "Treat your daily log like a legal document. If it is not written down, it did not happen. Note weather, crew size, work performed, and any issues. This log is your defense if a contractor claims they worked days they did not.",
      whyItMatters:
        "In construction disputes, the party with better records wins. Daily logs have been used in court to prove delays, resolve payment disputes, and establish timelines of events.",
    });
    tips.push({
      id: "daily-log-guide-2",
      title: "Log delays and causes",
      guidance:
        "When work stops or slows down, document the reason immediately. Weather, material shortages, subcontractor no-shows, and inspection failures all cause delays. Recording the cause protects you from being blamed for timeline overruns.",
      whyItMatters:
        "If a contractor claims a delay was your fault, your daily log is the evidence that proves otherwise. Detailed delay records are critical for enforcing liquidated damages clauses.",
    });
    return tips;
  }

  // Inspections page
  if (page === "inspections") {
    tips.push({
      id: "inspections-guide",
      title: "Pass the first time",
      guidance:
        "Failed inspections cost time and money. Before calling for an inspection, do a pre-inspection walkthrough yourself using the checklist. Fix obvious issues before the inspector arrives.",
      whyItMatters:
        "A failed inspection typically adds 3-7 days to your schedule while you fix the issue and reschedule. Multiply that by several failed inspections and you have lost a month.",
    });
    tips.push({
      id: "inspections-guide-2",
      title: "Build inspector relationships",
      guidance:
        "Be professional and courteous with inspectors. Have the site clean and the work area accessible. Have your permit posted visibly. A good relationship with your local inspector makes the entire process smoother.",
      whyItMatters:
        "Inspectors have discretion in how strictly they enforce certain provisions. A cooperative, professional owner-builder gets the benefit of the doubt. An adversarial one does not.",
    });
    return tips;
  }

  // Punch list
  if (page === "punch-list") {
    tips.push({
      id: "punch-list-guide",
      title: "Last chance to get it right",
      guidance:
        "The punch list is your last chance to get things right before you accept the building. Be thorough. Walk every room. Test every outlet, faucet, and door. Mark everything, no matter how small. It is much harder to get contractors back after final payment.",
      whyItMatters:
        "Once you make final payment, your leverage disappears. Contractors have little motivation to return for punch list items after they have been paid in full. Hold 5-10% retainage until the punch list is complete.",
    });
    tips.push({
      id: "punch-list-guide-2",
      title: "Bring a second pair of eyes",
      guidance:
        "Walk the punch list with someone who has not been staring at the project for months. Fresh eyes catch things you have become blind to. A friend, family member, or hired inspector can spot defects you have unconsciously accepted.",
      whyItMatters:
        "Familiarity breeds tolerance. After months of construction, you may have normalized crooked trim, uneven paint, or misaligned fixtures. An outside perspective restores your quality standard.",
    });
    return tips;
  }

  // Monitor page
  if (page === "monitor") {
    tips.push({
      id: "monitor-guide",
      title: "Trust but verify",
      guidance:
        "Remote oversight requires trust but verify. Set clear milestones, require photo evidence before releasing payments, and have an independent person verify quality. The moment you stop watching is the moment quality drops.",
      whyItMatters:
        "For diaspora builders especially, remote monitoring is the difference between a successful project and one where your money disappears. Structured verification protects your investment.",
    });
    tips.push({
      id: "monitor-guide-2",
      title: "Set payment milestones",
      guidance:
        "Never pay ahead of completed work. Structure your payments around verified milestones -- foundation complete, walls up, roof on, rough-in done. Each payment should be triggered by photographic proof and ideally a third-party verification.",
      whyItMatters:
        "Advance payments remove contractor motivation to complete work on time and to standard. Milestone-based payments keep your contractor accountable and protect your cash flow.",
    });
    return tips;
  }

  // AI Assistant page
  if (page === "ai-assistant") {
    tips.push({
      id: "ai-assistant-guide",
      title: "Ask me anything",
      guidance:
        "I can help you think through any challenge in your project. Ask me about cost optimization, contractor negotiation, financing strategies, market analysis, or construction sequencing. The best developers never stop learning.",
      whyItMatters:
        "Construction knowledge compounds. Every question you ask and every concept you learn makes you a better owner-builder. The developers who succeed are the ones who treat every project as a learning opportunity.",
    });
    return tips;
  }

  // Learn page
  if (page === "learn") {
    tips.push({
      id: "learn-guide",
      title: "Knowledge is leverage",
      guidance:
        "The more you know about construction, the better decisions you make and the harder it is for anyone to take advantage of you. Study each phase before you enter it. Understand the terminology, the process, and the common pitfalls.",
      whyItMatters:
        "Contractors, lenders, and inspectors all respect an owner who speaks their language. Education is the cheapest investment with the highest return in construction.",
    });
    tips.push({
      id: "learn-guide-2",
      title: "Focus on your current phase",
      guidance:
        "While it is good to understand the full construction lifecycle, prioritize learning about the phase you are currently in or about to enter. Deep knowledge of your immediate next steps is more valuable than surface knowledge of everything.",
      whyItMatters:
        "Targeted learning leads to better decision-making. Understanding the nuances of your current phase helps you ask better questions, evaluate bids more effectively, and catch problems earlier.",
    });
    return tips;
  }

  // Settings page
  if (page === "settings") {
    tips.push({
      id: "settings-guide",
      title: "Keep your profile current",
      guidance:
        "Make sure your contact information and preferences are up to date. Your timezone and currency settings affect how data is displayed across your projects.",
      whyItMatters:
        "Accurate settings ensure your reports, notifications, and financial displays are correct. Small configuration errors can lead to confusion when reviewing project data.",
    });
    return tips;
  }

  // Vault
  if (page === "vault") {
    tips.push({
      id: "vault-guide",
      title: "Organize your files",
      guidance:
        "Store all project documents in one place. Contracts, permits, insurance certificates, lien waivers, and inspection reports should all be accessible when you need them. A disorganized file system costs you time at the worst moments.",
      whyItMatters:
        "When a lender asks for your insurance certificate or an inspector wants to see your permit, you need to produce it immediately. Searching through email chains and text messages is not a system.",
    });
    tips.push({
      id: "vault-guide-2",
      title: "Version your contracts",
      guidance:
        "When contracts are amended or change orders are signed, upload the new version immediately. Keep all versions so you have a complete history of what was agreed and when.",
      whyItMatters:
        "Contract disputes often hinge on which version of an agreement was in effect at a given time. A complete document history with timestamps is your proof.",
    });
    return tips;
  }

  return tips;
}

// --- Component ---

export function AIMentor({ page, project, budgetItems, contacts }: AIMentorProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [showWhy, setShowWhy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    setCollapsed(getCollapsed());
    setDismissedIds(getActiveDismissedIds());
  }, []);

  const handleCollapse = useCallback((value: boolean) => {
    setCollapsed(value);
    setCollapsedState(value);
  }, []);

  const allTips = getMentorGuidance(page, project, budgetItems, contacts);

  // Filter out snoozed tips
  const tips = allTips.filter((tip) => !dismissedIds.includes(tip.id));

  const currentTip = tips.length > 0 ? tips[Math.min(tipIndex, tips.length - 1)] : null;

  // Reset tip index and "why" section when page/guidance changes
  useEffect(() => {
    setTipIndex(0);
    setShowWhy(false);
  }, [page]);

  // Reset showWhy when tip changes
  useEffect(() => {
    setShowWhy(false);
  }, [tipIndex]);

  if (!mounted) return null;

  function handleDismiss() {
    if (!currentTip) return;
    // If it's a milestone, mark it as permanently seen
    if (currentTip.isMilestone) {
      markMilestoneSeen(currentTip.id);
    }
    // Snooze the tip (comes back after 24 hours, unless it's a milestone)
    dismissId(currentTip.id);
    setDismissedIds((prev) => [...prev, currentTip.id]);
    // Move to next tip if available, or stay in bounds
    if (tipIndex >= tips.length - 1) {
      setTipIndex(Math.max(0, tipIndex - 1));
    }
  }

  function handleNextTip() {
    setTipIndex((prev) => Math.min(prev + 1, tips.length - 1));
  }

  function handlePrevTip() {
    setTipIndex((prev) => Math.max(prev - 1, 0));
  }

  // Collapsed state: small floating circle
  if (collapsed || !currentTip) {
    return (
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => {
            handleCollapse(false);
          }}
          className="w-11 h-11 rounded-full bg-earth text-warm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
          title="Keystone Mentor"
        >
          <Lightbulb size={18} />
        </button>
      </div>
    );
  }

  const safeTipIndex = Math.min(tipIndex, tips.length - 1);

  // Expanded state: floating card
  return (
    <div className="fixed bottom-5 right-5 z-40 w-80 animate-fade-in">
      <div className="bg-surface border border-border/60 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-earth text-warm border-l-4 border-l-clay">
          <div className="flex items-center gap-2">
            {currentTip.isMilestone ? <Trophy size={15} /> : <Lightbulb size={15} />}
            <span className="text-[13px] font-semibold tracking-tight">Keystone Mentor</span>
          </div>
          <div className="flex items-center gap-1">
            {tips.length > 1 && (
              <span className="text-[10px] text-warm/60 mr-1">
                {safeTipIndex + 1} of {tips.length}
              </span>
            )}
            <button
              onClick={() => handleCollapse(true)}
              className="p-0.5 rounded hover:bg-warm/10 transition-colors"
              title="Minimize mentor"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-3 animate-fade-in" key={currentTip.id}>
          <p className="text-[11px] font-semibold text-clay uppercase tracking-[0.1em] mb-1.5 flex items-center gap-1.5">
            {currentTip.isMilestone && <Trophy size={12} className="text-clay" />}
            {currentTip.title}
          </p>
          <p className="text-[12px] text-foreground leading-relaxed">
            {currentTip.guidance}
          </p>

          {/* Why this matters - expandable */}
          <button
            onClick={() => setShowWhy(!showWhy)}
            className="flex items-center gap-1 mt-3 text-[11px] font-medium text-clay/70 hover:text-clay transition-colors"
          >
            {showWhy ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Why this matters
          </button>
          {showWhy && (
            <div className="mt-2 pt-2 border-t border-border animate-fade-in">
              <p className="text-[11px] text-muted leading-relaxed">
                {currentTip.whyItMatters}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-alt/30">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDismiss}
              className="text-[11px] text-muted hover:text-foreground transition-colors"
            >
              Dismiss
            </button>
            {tips.length > 1 && (
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  onClick={handlePrevTip}
                  disabled={safeTipIndex === 0}
                  className="p-0.5 rounded hover:bg-border/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Previous tip"
                >
                  <ChevronLeft size={13} className="text-muted" />
                </button>
                <button
                  onClick={handleNextTip}
                  disabled={safeTipIndex === tips.length - 1}
                  className="p-0.5 rounded hover:bg-border/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next tip"
                >
                  <ChevronRight size={13} className="text-muted" />
                </button>
              </div>
            )}
          </div>
          {currentTip.nextStepHref && (
            <a
              href={currentTip.nextStepHref}
              className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {currentTip.nextStepLabel ?? "Next step"}
              <ArrowRight size={11} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
