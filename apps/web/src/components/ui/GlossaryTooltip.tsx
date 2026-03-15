"use client";

import { useState, useRef, useEffect } from "react";
import type { Market } from "@keystone/market-data";
import { getGlossaryTerm } from "@keystone/market-data";

interface GlossaryTooltipProps {
  term: string;
  market: Market;
  children?: React.ReactNode;
}

export function GlossaryTooltip({ term, market, children }: GlossaryTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const glossary = getGlossaryTerm(market, term);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!glossary) {
    return <span>{children ?? term}</span>;
  }

  return (
    <span ref={ref} className="relative inline">
      <span
        className="border-b border-dashed border-sand cursor-help text-earth"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((prev) => !prev)}
      >
        {children ?? term}
      </span>
      {open && (
        <div
          ref={tooltipRef}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2.5 rounded-[var(--radius)] bg-earth text-warm text-[11px] leading-relaxed shadow-[var(--shadow-lg)]"
        >
          <p className="font-semibold text-sand mb-1">{glossary.term}</p>
          <p>{glossary.definition}</p>
          {glossary.localTerms && Object.keys(glossary.localTerms).length > 0 && (
            <p className="mt-1 text-sand/60 text-[10px]">
              {Object.entries(glossary.localTerms).map(([lang, val]) => (
                <span key={lang}>{lang}: {val}</span>
              ))}
            </p>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-earth" />
        </div>
      )}
    </span>
  );
}
