"use client";

import { useState, useEffect, useCallback } from "react";
import { Lightbulb, X, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import type { ProjectData } from "@/lib/services/project-service";

// --- Types ---

interface MentorMessage {
  id: string;
  title: string;
  guidance: string;
  whyItMatters: string;
  nextStepLabel?: string;
  nextStepHref?: string;
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

function getCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COLLAPSED_KEY) === "true";
}

function setCollapsedState(value: boolean) {
  localStorage.setItem(COLLAPSED_KEY, String(value));
}

function getDismissedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function dismissId(id: string) {
  const current = getDismissedIds();
  if (!current.includes(id)) {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...current, id]));
  }
}

// --- Guidance engine ---

function getMentorGuidance(
  page: string,
  project?: ProjectData,
  budgetItems?: AIMentorProps["budgetItems"],
  contacts?: AIMentorProps["contacts"],
): MentorMessage | null {
  const hasProjects = !!project;
  const currentPhase = project?.currentPhase ?? 0;
  const totalBudget = project?.totalBudget ?? 0;
  const totalSpent = project?.totalSpent ?? 0;
  const isOverBudget = totalBudget > 0 && totalSpent > totalBudget;
  const contactCount = contacts?.length ?? 0;
  const pid = project?.id ?? "new";

  // Dashboard with no projects
  if (page === "dashboard" && !hasProjects) {
    return {
      id: "dashboard-no-projects",
      title: "Welcome to Keystone",
      guidance:
        "Every successful development starts with a clear vision. Before you pick up a hammer, you need to answer three questions: What am I building? Who am I building it for? And does the math work? Let me help you figure that out.",
      whyItMatters:
        "Most first-time builders jump straight into construction without a plan. That is how budgets explode and timelines collapse. The define phase exists to prevent that.",
      nextStepLabel: "Start your first project",
      nextStepHref: "/new-project",
    };
  }

  // Dashboard with projects
  if (page === "dashboard" && hasProjects) {
    return {
      id: "dashboard-has-projects",
      title: "Portfolio check-in",
      guidance:
        "A good developer reviews their portfolio weekly. Check your budget variance, timeline adherence, and open items. The projects that fail are the ones nobody is watching.",
      whyItMatters:
        "Consistent oversight catches small problems before they become expensive ones. A 5% cost overrun caught early is manageable. Caught late, it can sink a project.",
      nextStepLabel: "Review your project",
      nextStepHref: `/project/${pid}/overview`,
    };
  }

  // New project wizard
  if (page === "new-project") {
    return {
      id: "new-project-wizard",
      title: "Choosing your path",
      guidance:
        "Build-to-rent generates passive income but requires more capital upfront. Build-to-sell is faster cash but riskier in a slow market. Build-to-occupy saves money long-term but ties up your capital. Think about your 5-year plan.",
      whyItMatters:
        "Your build purpose determines your financing structure, design decisions, material quality, and exit strategy. Getting this wrong means rebuilding your entire plan later.",
    };
  }

  // New project (includes deal analysis)
  if (page === "new-project") {
    return {
      id: "new-project-guide",
      title: "Analyzing deals",
      guidance:
        "Run every potential deal through the numbers before you commit any money. The best developers pass on more deals than they take. Discipline in deal selection is what separates profitable builders from broke ones.",
      whyItMatters:
        "A bad deal with great execution is still a bad deal. No amount of construction skill can fix a project where the numbers never worked from the start.",
    };
  }

  // Overview page - early phases
  if (page === "overview" && currentPhase <= 1) {
    return {
      id: "overview-early-phase",
      title: "Foundation of success",
      guidance:
        "The define and finance phase is where 90% of failed projects go wrong. Take your time here. A bad deal with great execution is still a bad deal. Run the numbers twice.",
      whyItMatters:
        "Rushing past planning to get to construction feels productive but costs more in the long run. Every dollar spent on planning saves ten dollars during construction.",
      nextStepLabel: "Check your budget",
      nextStepHref: `/project/${pid}/budget`,
    };
  }

  // Overview page - build phase
  if (page === "overview" && currentPhase === 6) {
    return {
      id: "overview-build-phase",
      title: "Construction oversight",
      guidance:
        "During construction, your job is oversight, not labor. Visit the site weekly. Compare progress to the schedule. Question every change order. Document everything with photos.",
      whyItMatters:
        "Contractors respect owners who show up, ask good questions, and keep records. Absent owners get lower priority and less attention to quality.",
      nextStepLabel: "Log today's progress",
      nextStepHref: `/project/${pid}/daily-log`,
    };
  }

  // Overview page - generic
  if (page === "overview") {
    return {
      id: `overview-phase-${currentPhase}`,
      title: "Stay on track",
      guidance:
        "Review your milestones for this phase and make sure nothing is falling behind. The best time to address a delay is the day you notice it, not the day it becomes a crisis.",
      whyItMatters:
        "Small delays compound. A one-week slip in three different trades creates a three-week project delay. Active management keeps the dominos from falling.",
      nextStepLabel: "View schedule",
      nextStepHref: `/project/${pid}/schedule`,
    };
  }

  // Budget page - no items
  if (page === "budget" && (!budgetItems || budgetItems.length === 0)) {
    return {
      id: "budget-empty",
      title: "Building your budget",
      guidance:
        "A budget is not a wish list. It is a contract with yourself about what this project will cost. Start with market benchmarks, then get actual bids. The gap between estimated and actual costs is where your profit lives or dies.",
      whyItMatters:
        "Projects without detailed budgets consistently overrun by 20-40%. A line-item budget forces you to think through every cost before you spend a dollar.",
    };
  }

  // Budget page - over budget
  if (page === "budget" && isOverBudget) {
    return {
      id: "budget-over",
      title: "Budget warning",
      guidance:
        "You are trending over budget. Every dollar over reduces your profit margin. Before spending more, ask: Is this a must-have or a nice-to-have? Can I negotiate a better price? Is there a cheaper alternative that meets the same specification?",
      whyItMatters:
        "Cost overruns eat directly into your equity. On a project with a 15% target margin, a 10% cost overrun wipes out two-thirds of your profit.",
      nextStepLabel: "Review line items",
      nextStepHref: `/project/${pid}/budget`,
    };
  }

  // Budget page - general
  if (page === "budget") {
    return {
      id: "budget-general",
      title: "Budget discipline",
      guidance:
        "Compare every actual cost to your estimate. When a line item comes in higher than expected, find a savings somewhere else to compensate. Your total budget is the number that matters, not any single line.",
      whyItMatters:
        "Professional developers track cost variance weekly. If you are not measuring it, you cannot manage it. Small overruns in many categories add up fast.",
    };
  }

  // Financials page
  if (page === "financials") {
    return {
      id: "financials-guide",
      title: "Know your numbers",
      guidance:
        "Real estate development is a numbers game. Know your total cost basis (land + construction + soft costs + carrying costs), your expected value at completion, and your target profit margin (15-25% for new developers, 10-15% for experienced ones).",
      whyItMatters:
        "Lenders, partners, and buyers all evaluate your project by these numbers. If you cannot state your cost basis and projected return clearly, nobody will take your project seriously.",
      nextStepLabel: "View financials",
      nextStepHref: `/project/${pid}/financials`,
    };
  }

  // Team page
  if (page === "team") {
    return {
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
    };
  }

  // Schedule page
  if (page === "schedule") {
    return {
      id: "schedule-guide",
      title: "Time is money",
      guidance:
        "Time is money in development. Every week of delay costs you carrying costs (loan interest, property taxes, insurance). Build your schedule with buffer time, then hold your team accountable to it.",
      whyItMatters:
        "On a $300,000 construction loan at 8% interest, every month of delay costs roughly $2,000 in interest alone. Add insurance, taxes, and opportunity cost, and delays get expensive fast.",
      nextStepLabel: "View schedule",
      nextStepHref: `/project/${pid}/schedule`,
    };
  }

  // Documents page
  if (page === "documents") {
    return {
      id: "documents-guide",
      title: "Paper trail protects you",
      guidance:
        "Never start work without a signed contract. Never pay without a lien waiver. Never close without title insurance. These three rules will save you from the most common legal problems in construction.",
      whyItMatters:
        "Construction disputes are common. Without documentation, you have no legal standing. A signed contract is your only enforceable agreement. Verbal promises mean nothing in court.",
    };
  }

  // Photos page
  if (page === "photos") {
    return {
      id: "photos-guide",
      title: "Document everything",
      guidance:
        "Photos are your evidence trail. They prove work was done, support draw requests to lenders, and protect you in disputes. Take photos BEFORE every concrete pour (you will never see that rebar again once it is covered).",
      whyItMatters:
        "Lenders require photo evidence for construction draw releases. Inspectors reference photos for code compliance. And if a contractor disputes scope of work, timestamped photos are your best defense.",
    };
  }

  // Daily log
  if (page === "daily-log") {
    return {
      id: "daily-log-guide",
      title: "Your legal record",
      guidance:
        "Treat your daily log like a legal document. If it is not written down, it did not happen. Note weather, crew size, work performed, and any issues. This log is your defense if a contractor claims they worked days they did not.",
      whyItMatters:
        "In construction disputes, the party with better records wins. Daily logs have been used in court to prove delays, resolve payment disputes, and establish timelines of events.",
    };
  }

  // Inspections page
  if (page === "inspections") {
    return {
      id: "inspections-guide",
      title: "Pass the first time",
      guidance:
        "Failed inspections cost time and money. Before calling for an inspection, do a pre-inspection walkthrough yourself using the checklist. Fix obvious issues before the inspector arrives.",
      whyItMatters:
        "A failed inspection typically adds 3-7 days to your schedule while you fix the issue and reschedule. Multiply that by several failed inspections and you have lost a month.",
    };
  }

  // Punch list
  if (page === "punch-list") {
    return {
      id: "punch-list-guide",
      title: "Last chance to get it right",
      guidance:
        "The punch list is your last chance to get things right before you accept the building. Be thorough. Walk every room. Test every outlet, faucet, and door. Mark everything, no matter how small. It is much harder to get contractors back after final payment.",
      whyItMatters:
        "Once you make final payment, your leverage disappears. Contractors have little motivation to return for punch list items after they have been paid in full. Hold 5-10% retainage until the punch list is complete.",
    };
  }

  // Monitor page
  if (page === "monitor") {
    return {
      id: "monitor-guide",
      title: "Trust but verify",
      guidance:
        "Remote oversight requires trust but verify. Set clear milestones, require photo evidence before releasing payments, and have an independent person verify quality. The moment you stop watching is the moment quality drops.",
      whyItMatters:
        "For diaspora builders especially, remote monitoring is the difference between a successful project and one where your money disappears. Structured verification protects your investment.",
    };
  }

  // AI Assistant page
  if (page === "ai-assistant") {
    return {
      id: "ai-assistant-guide",
      title: "Ask me anything",
      guidance:
        "I can help you think through any challenge in your project. Ask me about cost optimization, contractor negotiation, financing strategies, market analysis, or construction sequencing. The best developers never stop learning.",
      whyItMatters:
        "Construction knowledge compounds. Every question you ask and every concept you learn makes you a better owner-builder. The developers who succeed are the ones who treat every project as a learning opportunity.",
    };
  }

  // Learn page
  if (page === "learn") {
    return {
      id: "learn-guide",
      title: "Knowledge is leverage",
      guidance:
        "The more you know about construction, the better decisions you make and the harder it is for anyone to take advantage of you. Study each phase before you enter it. Understand the terminology, the process, and the common pitfalls.",
      whyItMatters:
        "Contractors, lenders, and inspectors all respect an owner who speaks their language. Education is the cheapest investment with the highest return in construction.",
    };
  }

  // Settings page
  if (page === "settings") {
    return {
      id: "settings-guide",
      title: "Keep your profile current",
      guidance:
        "Make sure your contact information and preferences are up to date. Your timezone and currency settings affect how data is displayed across your projects.",
      whyItMatters:
        "Accurate settings ensure your reports, notifications, and financial displays are correct. Small configuration errors can lead to confusion when reviewing project data.",
    };
  }

  // Vault
  if (page === "vault") {
    return {
      id: "vault-guide",
      title: "Organize your files",
      guidance:
        "Store all project documents in one place. Contracts, permits, insurance certificates, lien waivers, and inspection reports should all be accessible when you need them. A disorganized file system costs you time at the worst moments.",
      whyItMatters:
        "When a lender asks for your insurance certificate or an inspector wants to see your permit, you need to produce it immediately. Searching through email chains and text messages is not a system.",
    };
  }

  return null;
}

// --- Component ---

export function AIMentor({ page, project, budgetItems, contacts }: AIMentorProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [showWhy, setShowWhy] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCollapsed(getCollapsed());
    setDismissed(getDismissedIds());
  }, []);

  const handleCollapse = useCallback((value: boolean) => {
    setCollapsed(value);
    setCollapsedState(value);
  }, []);

  const guidance = getMentorGuidance(page, project, budgetItems, contacts);

  // Reset "why" section when guidance changes
  useEffect(() => {
    setShowWhy(false);
  }, [guidance?.id]);

  if (!mounted) return null;

  // If no guidance available or already dismissed, show collapsed state only
  const isDismissed = guidance ? dismissed.includes(guidance.id) : true;

  function handleDismiss() {
    if (!guidance) return;
    dismissId(guidance.id);
    setDismissed((prev) => [...prev, guidance.id]);
  }

  // Collapsed state: small floating circle
  if (collapsed || isDismissed || !guidance) {
    return (
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => {
            handleCollapse(false);
            // If dismissed, we just show the circle but it stays collapsed
          }}
          className="w-11 h-11 rounded-full bg-earth text-warm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
          title="Keystone Mentor"
        >
          <Lightbulb size={18} />
        </button>
      </div>
    );
  }

  // Expanded state: floating card
  return (
    <div className="fixed bottom-5 right-5 z-40 w-80 animate-fade-in">
      <div className="bg-surface border border-border/60 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-earth text-warm">
          <div className="flex items-center gap-2">
            <Lightbulb size={15} />
            <span className="text-[13px] font-semibold tracking-tight">Keystone Mentor</span>
          </div>
          <button
            onClick={() => handleCollapse(true)}
            className="p-0.5 rounded hover:bg-warm/10 transition-colors"
            title="Minimize mentor"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold text-clay uppercase tracking-[0.1em] mb-1.5">
            {guidance.title}
          </p>
          <p className="text-[12px] text-foreground leading-relaxed">
            {guidance.guidance}
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
                {guidance.whyItMatters}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-alt/30">
          <button
            onClick={handleDismiss}
            className="text-[11px] text-muted hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
          {guidance.nextStepHref && (
            <a
              href={guidance.nextStepHref}
              className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {guidance.nextStepLabel ?? "Next step"}
              <ArrowRight size={11} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
