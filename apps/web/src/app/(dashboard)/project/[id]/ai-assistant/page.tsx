"use client";

import { useState, useEffect, useRef } from "react";
import { useTopbar } from "../../../layout";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  title?: string;
  disclaimer?: string;
  actions?: string[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: "user",
    content: "My electrician says he needs 3 more days than estimated. Should I be concerned? How does this affect the schedule?",
  },
  {
    role: "assistant",
    title: "Schedule impact analysis",
    content:
      "Based on your current schedule, the electrical rough-in is on the critical path. A 3-day extension pushes your mechanical rough-in inspection from March 22 to March 25, which in turn delays insulation start by the same amount.\n\nImpact: 3 days added to overall timeline (37 to 37.4 weeks). This is within acceptable range and does not trigger any downstream contractor conflicts based on your current schedule.\n\nRecommended actions:\n1. Confirm the 3-day extension in writing\n2. Notify insulation contractor of revised start\n3. Reschedule inspection for March 25\n4. Verify no additional cost will be incurred",
    disclaimer: "Project-specific guidance based on your schedule data. For electrical code questions, consult a licensed electrician.",
  },
  {
    role: "user",
    content: "Can you draft a message to the insulation contractor about the delay?",
  },
  {
    role: "assistant",
    title: "Draft message",
    content:
      'Hi,\n\nQuick update on the Robinson residence project. Our electrical rough-in is running 3 days past the original estimate. This pushes the mechanical inspection to March 25, which means your insulation start will shift from March 26 to March 29.\n\nPlease confirm this revised date works for your schedule. All other scope and terms remain unchanged.\n\nThanks,\nAyo',
    actions: ["Copy text", "Send via WhatsApp", "Send via email"],
  },
];

export default function AIAssistantPage() {
  const { setTopbar } = useTopbar();
  const [messages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTopbar("AI assistant", "Context: Robinson residence", "info");
  }, [setTopbar]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className="flex gap-2">
            <div
              className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-semibold ${
                msg.role === "user"
                  ? "bg-earth text-sand"
                  : "bg-surface-alt text-clay"
              }`}
            >
              {msg.role === "user" ? "AK" : "K"}
            </div>
            <div
              className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-[12px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-earth text-warm"
                  : "bg-surface border border-border text-muted"
              }`}
            >
              {msg.title && (
                <div className="font-semibold text-earth mb-1.5">{msg.title}</div>
              )}
              {msg.content.split("\n").map((line, j) => (
                <p key={j} className={line === "" ? "h-2" : "mb-1"}>
                  {line}
                </p>
              ))}
              {msg.disclaimer && (
                <div className="mt-2 pt-2 border-t border-border text-[10px] text-muted/60 italic">
                  {msg.disclaimer}
                </div>
              )}
              {msg.actions && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.actions.map((action) => (
                    <button
                      key={action}
                      className="px-2.5 py-1 text-[10px] border border-border rounded-md bg-surface text-earth hover:bg-surface-alt transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-border">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your project, costs, methods, regulations..."
          className="flex-1 px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
        />
        <button className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors flex items-center gap-1.5">
          <Send size={14} />
          Send
        </button>
      </div>
    </div>
  );
}
