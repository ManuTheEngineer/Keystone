"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import { subscribeToProject, type ProjectData } from "@/lib/services/project-service";
import { Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistantPage() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeToProject(projectId, setProject);
    return unsub;
  }, [projectId]);

  useEffect(() => {
    setTopbar("AI assistant", project ? `Context: ${project.name}` : "AI assistant", "info");
  }, [setTopbar, project]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setSending(true);

    try {
      const projectContext = project
        ? `Project: ${project.name}\nMarket: ${project.market}\nPhase: ${project.phaseName}\nBudget: ${project.totalBudget} ${project.currency}\nSpent: ${project.totalSpent} ${project.currency}\nProgress: ${project.progress}%\nWeek: ${project.currentWeek} of ${project.totalWeeks}\nSub-phase: ${project.subPhase}`
        : undefined;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          projectContext,
        }),
      });

      const data = await res.json();

      if (data.error && data.fallback) {
        // API key not configured, provide helpful fallback
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "The AI assistant is not yet configured. To enable it, add your ANTHROPIC_API_KEY to the environment variables.\n\nIn the meantime, you can find construction guidance in the Learn section.",
          },
        ]);
      } else if (data.message) {
        setMessages([...newMessages, { role: "assistant", content: data.message }]);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.error ?? "Something went wrong. Please try again." },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Unable to reach the AI service. Please check your connection and try again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[14px] text-earth font-medium mb-1">Keystone AI Assistant</p>
            <p className="text-[12px] text-muted mb-4">
              Ask about your project, construction methods, costs, regulations, or get help drafting messages.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "How is my budget tracking?",
                "What should I check before rough-in inspection?",
                "Draft a message to my contractor about a delay",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 text-[11px] border border-border rounded-full text-muted hover:border-emerald-400 hover:text-emerald-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="flex gap-2">
            <div
              className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-semibold ${
                msg.role === "user"
                  ? "bg-earth text-sand"
                  : "bg-surface-alt text-clay"
              }`}
            >
              {msg.role === "user" ? "U" : "K"}
            </div>
            <div
              className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-[12px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-earth text-warm"
                  : "bg-surface border border-border text-muted"
              }`}
            >
              {msg.content.split("\n").map((line, j) => (
                <p key={j} className={line === "" ? "h-2" : "mb-1"}>
                  {line}
                </p>
              ))}
              {msg.role === "assistant" && (
                <div className="mt-2 pt-2 border-t border-border text-[10px] text-muted/60 italic">
                  This is educational guidance. Consult a licensed professional for your specific situation.
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-semibold bg-surface-alt text-clay">
              K
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-surface border border-border">
              <Loader2 size={16} className="text-muted animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-border">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your project, costs, methods, regulations..."
          className="flex-1 px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
          disabled={sending}
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
