"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import { useAuth } from "@/components/auth/AuthProvider";
import { sendAIMessage, type AIMessage } from "@/lib/services/ai-service";
import { subscribeToProject, type ProjectData } from "@/lib/services/project-service";
import {
  getMarketData,
  getPhaseDefinition,
  getCostBenchmarks,
  formatCurrencyCompact,
  PHASE_ORDER,
} from "@keystone/market-data";
import type { Market, ProjectPhase } from "@keystone/market-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Send, Loader2, AlertTriangle, Zap } from "lucide-react";
import { VoiceNote } from "@/components/ui/VoiceNote";

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
  return text.split("\n").map((line, i) => {
    if (line.trim() === "") return <p key={i} className="h-2" />;

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
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<Mode>("general");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ---------- subscriptions ---------- */

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToProject(user.uid, projectId, setProject);
    return unsub;
  }, [user, projectId]);

  useEffect(() => {
    setTopbar("AI assistant", project ? `Context: ${project.name}` : "AI assistant", "info");
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
    };
  }, [project, market]);

  /* ---------- send handler ---------- */

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    setError(null);
    const newMessages: AIMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setSending(true);

    try {
      const result = await sendAIMessage(newMessages, projectContext, mode);
      setMessages([...newMessages, { role: "assistant", content: result.message }]);
    } catch (err: any) {
      const errMsg: string = err?.message ?? "";

      if (errMsg === "AI_NOT_CONFIGURED") {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "The AI assistant is not yet configured. To enable it, add your CLAUDE_API_KEY as an environment variable in your Vercel project settings and redeploy.\n\nIn the meantime, you can find construction guidance in the Learn section.",
          },
        ]);
      } else if (errMsg.startsWith("RATE_LIMITED:")) {
        const parts = errMsg.split(":");
        const used = parts[1];
        const limit = parts[2];
        setError(`You've used ${used} of ${limit} daily queries. Upgrade your plan for more.`);
        // Remove the pending user message since it wasn't processed
        setMessages(messages);
      } else if (errMsg === "Not authenticated") {
        setError("You must be signed in to use the AI assistant.");
        setMessages(messages);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "Unable to reach the AI service. Please check your connection and try again.",
          },
        ]);
      }
    } finally {
      setSending(false);
    }
  }, [input, sending, messages, projectContext, mode]);

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
        title="AI Assistant"
        projectName={project?.name}
        projectId={projectId}
        subtitle="Ask anything about your project"
      />

      {/* Mode selector */}
      <div className="flex gap-1.5 pb-3 mb-1 overflow-x-auto">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`px-3 py-1 text-[11px] rounded-full whitespace-nowrap transition-all duration-150 ${
              mode === m.key
                ? "bg-earth text-warm font-medium"
                : "bg-surface border border-border text-muted hover:border-emerald-400 hover:text-emerald-700"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

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
              {msg.role === "assistant" && (
                <div className="mt-2 pt-2 border-t border-border text-[10px] text-muted/60 italic">
                  This is educational guidance. Consult a licensed professional for your specific situation.
                </div>
              )}
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

      {/* Input */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
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
