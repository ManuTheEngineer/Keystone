"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";

interface LearnTooltipProps {
  term: string;
  explanation: string;
  whyItMatters?: string;
  children: React.ReactNode;
}

export function LearnTooltip({ term, explanation, whyItMatters, children }: LearnTooltipProps) {
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setAbove(spaceBelow < 200);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-flex items-center gap-1" ref={triggerRef}>
      {children}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-muted hover:text-clay transition-colors shrink-0"
        aria-label={`Learn about ${term}`}
      >
        <HelpCircle size={13} />
      </button>
      {open && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 left-0 max-w-xs w-72 p-4 bg-white rounded-xl shadow-lg border border-border ${
            above ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <p className="text-[13px] font-semibold text-earth mb-1">{term}</p>
          <p className="text-[12px] text-muted leading-relaxed">{explanation}</p>
          {whyItMatters && (
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-[12px] text-clay leading-relaxed">
                <span className="font-medium">Why this matters:</span> {whyItMatters}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
