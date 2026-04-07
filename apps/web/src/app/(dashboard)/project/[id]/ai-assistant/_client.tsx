"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import { useAuth } from "@/components/auth/AuthProvider";
import { sendAIMessage, type AIMessage, type AIUsage } from "@/lib/services/ai-service";
import {
  subscribeToProject,
  subscribeToConversation,
  subscribeToBudgetItems,
  subscribeToContacts,
  subscribeToTasks,
  subscribeToDailyLogs,
  subscribeToPhotos,
  subscribeToPunchListItems,
  saveConversation,
  clearConversation,
  type ProjectData,
  type BudgetItemData,
  type ContactData,
  type TaskData,
  type DailyLogData,
  type PhotoData,
  type PunchListItemData,
} from "@/lib/services/project-service";
import { safeUnsubscribeAll } from "@/lib/utils/safe-cleanup";
import {
  getMarketData,
  getPhaseDefinition,
  getCostBenchmarks,
  formatCurrencyCompact,
  PHASE_ORDER,
} from "@keystone/market-data";
import type { Market, ProjectPhase } from "@keystone/market-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/hooks/use-translation";
import { Send, Loader2, AlertTriangle, Zap, Trash2, RotateCcw } from "lucide-react";
import { VoiceNote } from "@/components/ui/VoiceNote";
import { incrementAiQueryCount } from "@/lib/hooks/use-ai-quota";

/* ------------------------------------------------------------------ */
/*  Mode definitions                                                   */
/* ------------------------------------------------------------------ */

type Mode = "general" | "budget" | "schedule" | "risk" | "contract";

const MODES: { key: Mode; label: string; description: string }[] = [
  { key: "general", label: "General", description: "Ask anything about your project, construction methods, costs, regulations, or get help drafting messages." },
  { key: "budget", label: "Budget", description: "Analyze spending, find cost savings, compare against benchmarks, and forecast remaining costs." },
  { key: "schedule", label: "Schedule", description: "Evaluate timeline progress, identify critical path items, and plan around delays." },
  { key: "risk", label: "Risk", description: "Identify project risks, evaluate contingency adequacy, and get mitigation strategies." },
  { key: "contract", label: "Contract", description: "Review contractor agreements, check for missing clauses, and evaluate payment schedules." },
];

/* ------------------------------------------------------------------ */
/*  Suggestions per mode + market                                      */
/* ------------------------------------------------------------------ */

const SUGGESTIONS: Record<Mode, { usa: string[]; wa: string[] }> = {
  general: {
    usa: [
      "How is my budget tracking?",
      "What should I check before rough-in inspection?",
      "Draft a message to my contractor about a delay",
    ],
    wa: [
      "What should I check before the rebar pour?",
      "How does the titre foncier process work?",
      "What's a fair daily rate for a macon in Lome?",
    ],
  },
  budget: {
    usa: ["Analyze my spending rate", "Where can I cut costs?", "Am I on budget?"],
    wa: ["Analyze my spending rate", "Where can I cut costs?", "Am I on budget?"],
  },
  schedule: {
    usa: ["Am I on schedule?", "What's the critical path?", "How will rain affect my timeline?"],
    wa: ["Am I on schedule?", "What's the critical path?", "How will rain affect my timeline?"],
  },
  risk: {
    usa: ["What are my top project risks?", "Is my contingency adequate?", "What should I watch out for?"],
    wa: ["What are my top project risks?", "Is my contingency adequate?", "What should I watch out for?"],
  },
  contract: {
    usa: ["Review my contractor agreement", "What clauses am I missing?", "Is my payment schedule fair?"],
    wa: ["Review my contractor agreement", "What clauses am I missing?", "Is my payment schedule fair?"],
  },
};

/* ------------------------------------------------------------------ */
/*  Simple inline markdown renderer                                    */
/* ------------------------------------------------------------------ */

function renderMarkdown(text: string) {
  if (!text) return null;
  return text.split("\n").map((line, i) => {
    if (line.trim() === "") return <p key={i} className="h-2" />;

    // Headings: ### h3, ## h2, # h1
    const h3Match = line.match(/^###\s+(.*)$/);
    if (h3Match) return <p key={i} className="text-[12px] font-bold text-earth mt-2 mb-1">{renderInline(h3Match[1])}</p>;
    const h2Match = line.match(/^##\s+(.*)$/);
    if (h2Match) return <p key={i} className="text-[13px] font-bold text-earth mt-3 mb-1">{renderInline(h2Match[1])}</p>;
    const h1Match = line.match(/^#\s+(.*)$/);
    if (h1Match) return <p key={i} className="text-[14px] font-bold text-earth mt-3 mb-1.5">{renderInline(h1Match[1])}</p>;

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      return (
        <p key={i} className="mb-1 pl-3">
          <span className="font-semibold">{numMatch[1]}.</span> {renderInline(numMatch[2])}
        </p>
      );
    }

    // Bullet list
    if (line.trimStart().startsWith("- ") || line.trimStart().startsWith("* ")) {
      const content = line.replace(/^\s*[-*]\s+/, "");
      return (
        <p key={i} className="mb-1 pl-3 flex gap-1.5">
          <span className="shrink-0 mt-[2px]">&#8226;</span>
          <span>{renderInline(content)}</span>
        </p>
      );
    }

    return (
      <p key={i} className="mb-1">
        {renderInline(line)}
      </p>
    );
  });
}

function renderInline(text: string) {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function AIAssistantClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const { t } = useTranslation();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItemData[]>([]);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLogData[]>([]);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [punchListItems, setPunchListItems] = useState<PunchListItemData[]>([]);
  const [allMessages, setAllMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<Mode>("general");
  const [error, setError] = useState<string | null>(null);
  const [conversationRestored, setConversationRestored] = useState(false);
  const [conversationLoaded, setConversationLoaded] = useState(false);
  const [aiUsage, setAiUsage] = useState<AIUsage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter messages for current mode tab
  const messages = useMemo(() =>
    allMessages.filter((m: any) => !m.mode || m.mode === mode),
    [allMessages, mode]
  );

  /* ---------- subscriptions ---------- */

  useEffect(() => {
    if (!user) return;
    const unsubs = [
      subscribeToProject(user.uid, projectId, setProject),
      subscribeToBudgetItems(user.uid, projectId, setBudgetItems),
      subscribeToContacts(user.uid, projectId, setContacts),
      subscribeToTasks(user.uid, projectId, setTasks),
      subscribeToDailyLogs(user.uid, projectId, setDailyLogs),
      subscribeToPhotos(user.uid, projectId, setPhotos),
      subscribeToPunchListItems(user.uid, projectId, setPunchListItems),
      subscribeToConversation(user.uid, projectId, (saved) => {
        if (!conversationLoaded) {
          if (saved.length > 0) {
            setAllMessages(saved as AIMessage[]);
            setConversationRestored(true);
            setTimeout(() => setConversationRestored(false), 3000);
          }
          setConversationLoaded(true);
        }
      }),
    ];
    return () => safeUnsubscribeAll(unsubs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, projectId]);

  useEffect(() => {
    setTopbar(project?.name || t("project.aiAssistant"), `${t("project.aiAssistant")}${project ? ` — ${project.phaseName}` : ""}`, "info");
  }, [setTopbar, project]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);


  /* ---------- derived ---------- */

  const market = (project?.market ?? "USA") as Market;
  const isWAMarket = market === "TOGO" || market === "BENIN" || market === "GHANA";
  const suggestions = isWAMarket ? SUGGESTIONS[mode].wa : SUGGESTIONS[mode].usa;
  const modeInfo = MODES.find((m) => m.key === mode)!;

  /* ---------- build project context ---------- */

  const projectContext = useMemo(() => {
    if (!project) return {};

    const marketData = getMarketData(market);
    const currentPhaseKey: ProjectPhase = PHASE_ORDER[project.currentPhase ?? 0];
    const phaseDef = getPhaseDefinition(market, currentPhaseKey);
    const benchmarks = getCostBenchmarks(market);

    const topBenchmarks = [...benchmarks]
      .sort((a, b) => b.midRange - a.midRange)
      .slice(0, 5);
    const costSummary = topBenchmarks
      .map(
        (b) =>
          `${b.category}${b.subcategory ? ` / ${b.subcategory}` : ""}: ${formatCurrencyCompact(
            b.midRange,
            marketData.currency
          )}/${b.unit}`
      )
      .join("; ");

    // Budget breakdown
    const budgetSummary = budgetItems.length > 0
      ? budgetItems.map((b) => `${b.category}: estimated ${b.estimated}, actual ${b.actual} (${b.status})`).join("; ")
      : "No budget items yet";

    // Team summary
    const teamSummary = contacts.length > 0
      ? contacts.map((c) => `${c.name} (${c.role}${c.rate ? `, ${c.rate}/${c.rateUnit ?? "day"}` : ""}${c.rating ? `, ${c.rating}/5 stars` : ""})`).join("; ")
      : "No team contacts yet";

    // Task summary
    const completedTasks = tasks.filter((t) => t.done).length;
    const pendingTasks = tasks.filter((t) => !t.done && t.status !== "cancelled").length;
    const taskSummary = tasks.length > 0
      ? `${completedTasks} completed, ${pendingTasks} pending. Recent: ${tasks.filter((t) => !t.done).slice(0, 5).map((t) => t.label).join(", ")}`
      : "No tasks yet";

    // Recent daily logs
    const recentLogs = dailyLogs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map((l) => `${l.date}: crew ${l.crew ?? "?"}, ${l.content?.slice(0, 100)}`)
      .join(" | ");

    // Punch list summary
    const openPunchItems = punchListItems.filter((p) => p.status === "open").length;
    const punchSummary = punchListItems.length > 0
      ? `${punchListItems.length} total (${openPunchItems} open). Items: ${punchListItems.filter((p) => p.status === "open").slice(0, 5).map((p) => p.description).join(", ")}`
      : "No punch list items";

    return {
      projectName: project.name,
      market: project.market,
      phase: PHASE_ORDER[project.currentPhase ?? 0],
      phaseName: project.phaseName,
      propertyType: project.propertyType,
      purpose: project.purpose,
      totalBudget: project.totalBudget,
      totalSpent: project.totalSpent,
      currency: project.currency,
      currentWeek: project.currentWeek,
      totalWeeks: project.totalWeeks,
      progress: project.progress,
      constructionMethod: phaseDef?.constructionMethod ?? "",
      milestones: phaseDef?.milestones.map((m) => m.name) ?? [],
      costSummary,
      // Full project data for comprehensive AI guidance
      budgetSummary,
      budgetItemCount: budgetItems.length,
      teamSummary,
      teamCount: contacts.length,
      taskSummary,
      taskCount: tasks.length,
      completedTaskCount: completedTasks,
      recentDailyLogs: recentLogs || "No daily logs yet",
      dailyLogCount: dailyLogs.length,
      photoCount: photos.length,
      punchListSummary: punchSummary,
      punchListOpenCount: openPunchItems,
      buildSpecsSummary: project.specs?.structure ? (() => {
        const tc = (v: string) => v.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        const join = (entries: Record<string, string | undefined>) =>
          Object.values(entries).filter((v): v is string => !!v && v !== "" && v !== "none").map(tc).join(", ");

        const s = project.specs!.structure!;
        const i = project.specs!.interior ?? {};
        const st = project.specs!.site ?? {};
        const u = project.specs!.unitConfig ?? {};

        const structureLine = join({
          layout: s.layout, foundation: s.foundation, roof: s.roof,
          exterior: s.exterior, ceilingHeight: s.ceilingHeight ? `${s.ceilingHeight} ceilings` : undefined,
          windows: s.windows,
        });
        const interiorLine = join({
          kitchen: i.kitchenStyle ? `${i.kitchenStyle} kitchen` : undefined,
          finish: i.kitchenFinish ? `${i.kitchenFinish} finish` : undefined,
          bath: i.primaryBath, flooring: i.flooring, hvac: i.hvac,
          waterHeater: i.waterHeater,
          smart: i.smartHome && i.smartHome !== "none" ? `${i.smartHome} smart home` : undefined,
        });
        const siteLine = join({
          lotSize: st.lotSize, lotShape: st.lotShape ? `${st.lotShape} lot` : undefined,
          garage: st.garage, driveway: st.driveway, landscaping: st.landscaping,
          fencing: st.fencing, security: st.security,
        });
        const unitsLine = u.unitCount ? join({
          count: `${u.unitCount} units`, mix: u.unitMix,
          metering: u.metering ? `${u.metering} meters` : undefined,
          management: u.management,
        }) : "";

        return [
          structureLine && `Structure: ${structureLine}`,
          interiorLine && `Interior: ${interiorLine}`,
          siteLine && `Site: ${siteLine}`,
          unitsLine && `Units: ${unitsLine}`,
        ].filter(Boolean).join("\n- ");
      })() : undefined,
    };
  }, [project, market, budgetItems, contacts, tasks, dailyLogs, photos, punchListItems]);

  /* ---------- send handler ---------- */

  const persistMessages = useCallback(
    (msgs: AIMessage[]) => {
      if (user && msgs.length > 0) {
        saveConversation(user.uid, projectId, msgs).catch(() => {});
      }
    },
    [user, projectId]
  );

  const handleClearChat = useCallback(async () => {
    if (!user) return;
    // Keep messages from OTHER modes, remove current mode's messages
    setAllMessages((prev) => {
      const remaining = prev.filter((m: any) => m.mode && m.mode !== mode);
      saveConversation(user.uid, projectId, remaining).catch(() => {});
      return remaining;
    });
    setError(null);
  }, [user, projectId, mode]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    setError(null);
    const userMsg = { role: "user" as const, content: text, mode };
    const newAll = [...allMessages, userMsg];
    setAllMessages(newAll);
    setInput("");
    setSending(true);

    try {
      const result = await sendAIMessage(messages.concat(userMsg), projectContext, mode);
      if (result.usage) setAiUsage(result.usage);
      // Track query in localStorage for quota badge
      incrementAiQueryCount();
      const assistantMsg = { role: "assistant" as const, content: result.message, mode };
      const finalAll = [...newAll, assistantMsg];
      setAllMessages(finalAll);
      persistMessages(finalAll);
    } catch (err: unknown) {
      const errMsg: string = err instanceof Error ? err.message : "";

      if (errMsg === "AI_NOT_CONFIGURED") {
        const assistantMsg = {
          role: "assistant" as const, mode, isError: true,
          content: "The AI assistant is not yet configured. To enable it, add your CLAUDE_API_KEY as an environment variable in your Vercel project settings and redeploy.\n\nIn the meantime, you can find construction guidance in the Learn section.",
        };
        const finalAll = [...newAll, assistantMsg];
        setAllMessages(finalAll);
        persistMessages(finalAll);
      } else if (errMsg.startsWith("RATE_LIMITED:")) {
        const parts = errMsg.split(":");
        const used = Number(parts[1]) || 0;
        const limit = Number(parts[2]) || 0;
        setAiUsage({ used, limit, plan: "" });
        setError(`You've used ${used} of ${limit} daily queries. Upgrade your plan for more.`);
        setAllMessages(allMessages); // revert
      } else if (errMsg === "Not authenticated") {
        setError("You must be signed in to use the AI assistant.");
        setAllMessages(allMessages); // revert
      } else {
        const detail = errMsg || "Unknown error";
        const assistantMsg = {
          role: "assistant" as const, mode, isError: true,
          content: `Unable to reach the AI service: ${detail}\n\nPlease check your connection and try again. If this persists, verify the API configuration in your project settings.`,
        };
        const finalAll = [...newAll, assistantMsg];
        setAllMessages(finalAll);
        persistMessages(finalAll);
      }
    } finally {
      setSending(false);
    }
  }, [input, sending, allMessages, messages, projectContext, mode, persistMessages]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  /* ---------- render ---------- */

  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      <PageHeader
        title={t("project.aiAssistant")}
        projectName={project?.name}
        projectId={projectId}
        subtitle="Ask anything about your project"
      />

      {/* Mode selector */}
      <div className="flex gap-1.5 pb-3 mb-1 overflow-x-auto">
        {MODES.map((m) => {
          const count = allMessages.filter((msg: any) => msg.mode === m.key && !msg.isError).length;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`px-3 py-1 text-[11px] rounded-full whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                mode === m.key
                  ? "bg-earth text-warm font-medium"
                  : "bg-surface border border-border text-muted hover:border-emerald-400 hover:text-emerald-700"
              }`}
            >
              {m.label}
              {count > 0 && (
                <span className={`text-[9px] font-data min-w-[14px] h-[14px] rounded-full flex items-center justify-center ${
                  mode === m.key ? "bg-warm/30 text-warm" : "bg-surface-alt text-muted"
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conversation restored indicator */}
      {conversationRestored && (
        <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-emerald-50 border border-emerald-200">
          <RotateCcw size={14} className="text-emerald-600 shrink-0" />
          <span className="text-[11px] text-emerald-700">Conversation restored from previous session</span>
        </div>
      )}

      {/* Clear chat + Error banner row */}
      {messages.length > 0 && (
        <div className="flex justify-end mb-1">
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1 text-[10px] text-muted hover:text-danger transition-colors px-2 py-1 rounded"
          >
            <Trash2 size={11} />
            Clear chat
          </button>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-danger/10 border border-danger/20">
          <AlertTriangle size={14} className="text-danger shrink-0" />
          <span className="text-[11px] text-danger">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-[10px] text-danger/60 hover:text-danger"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[14px] text-earth font-medium mb-1">Keystone AI Assistant</p>
            <p className="text-[12px] text-muted mb-4">{modeInfo.description}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 text-[11px] border border-border rounded-full text-muted hover:border-emerald-400 hover:text-emerald-700 transition-all duration-150 card-hover"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-semibold bg-surface-alt text-clay">
                K
              </div>
            )}
            <div
              className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-[12px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-earth text-warm"
                  : "bg-surface border border-border text-muted"
              }`}
            >
              {renderMarkdown(msg.content)}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-semibold bg-earth text-sand">
                U
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex gap-2 animate-fade-in">
            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-semibold bg-surface-alt text-clay">
              K
            </div>
            <div className="flex gap-2 items-center px-4 py-3 rounded-xl bg-surface border border-border">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-clay animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-clay animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-clay animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-[11px] text-muted ml-1">Keystone is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* AI usage counter */}
      {aiUsage && (
        <div className="flex items-center gap-1.5 pt-2 pb-1">
          <Zap size={12} className={aiUsage.used >= aiUsage.limit ? "text-danger" : "text-muted"} />
          <span className={`text-[10px] font-data ${aiUsage.used >= aiUsage.limit ? "text-danger font-medium" : "text-muted"}`}>
            {aiUsage.used}/{aiUsage.limit} queries today
          </span>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 pt-3 border-t border-border relative z-50">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask about ${mode === "general" ? "your project" : mode}...`}
          className="flex-1 px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
          disabled={sending}
        />
        <VoiceNote
          onTranscript={(text) => setInput(text)}
          placeholder="Tap to ask by voice"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors flex items-center gap-1.5 disabled:opacity-40"
        >
          <Send size={14} />
          Send
        </button>
      </div>
    </div>
  );
}
