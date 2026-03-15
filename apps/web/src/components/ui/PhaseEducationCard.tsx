"use client";

import { useState } from "react";
import type { EducationModule } from "@keystone/market-data";
import { ChevronDown, ChevronUp, Lightbulb, AlertTriangle, Star } from "lucide-react";

interface PhaseEducationCardProps {
  module: EducationModule;
  defaultOpen?: boolean;
}

export function PhaseEducationCard({ module, defaultOpen = false }: PhaseEducationCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 overflow-hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-emerald-100/50 transition-colors"
      >
        <div>
          <p className="text-[13px] font-semibold text-emerald-900">{module.title}</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">{module.summary}</p>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-emerald-600 shrink-0 ml-2" />
        ) : (
          <ChevronDown size={16} className="text-emerald-600 shrink-0 ml-2" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-[12px] text-emerald-800 leading-relaxed">{module.content}</p>

          {module.keyDecisions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Lightbulb size={12} className="text-emerald-700" />
                <span className="text-[11px] font-semibold text-emerald-900">Key decisions</span>
              </div>
              <ul className="space-y-1">
                {module.keyDecisions.map((d, i) => (
                  <li key={i} className="text-[11px] text-emerald-700 pl-4 relative before:content-[''] before:absolute before:left-1.5 before:top-[7px] before:w-1 before:h-1 before:rounded-full before:bg-emerald-400">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {module.commonMistakes.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle size={12} className="text-warning" />
                <span className="text-[11px] font-semibold text-emerald-900">Common mistakes</span>
              </div>
              <ul className="space-y-1">
                {module.commonMistakes.map((m, i) => (
                  <li key={i} className="text-[11px] text-emerald-700 pl-4 relative before:content-[''] before:absolute before:left-1.5 before:top-[7px] before:w-1 before:h-1 before:rounded-full before:bg-warning">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {module.proTips.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Star size={12} className="text-emerald-700" />
                <span className="text-[11px] font-semibold text-emerald-900">Pro tips</span>
              </div>
              <ul className="space-y-1">
                {module.proTips.map((t, i) => (
                  <li key={i} className="text-[11px] text-emerald-700 pl-4 relative before:content-[''] before:absolute before:left-1.5 before:top-[7px] before:w-1 before:h-1 before:rounded-full before:bg-emerald-500">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {module.disclaimer && (
            <p className="text-[10px] text-emerald-600/70 italic border-t border-emerald-200 pt-2 mt-2">
              {module.disclaimer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
