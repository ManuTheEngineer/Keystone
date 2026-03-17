"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  Users,
  TrendingUp,
  DollarSign,
  X,
  Loader2,
} from "lucide-react";
import type { PresentationData, PresentationType } from "@/lib/services/presentation-service";
import { openPresentation } from "@/lib/services/presentation-service";

interface PresentationModalProps {
  data: PresentationData;
  onClose: () => void;
}

interface PresentationOption {
  id: PresentationType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const OPTIONS: PresentationOption[] = [
  {
    id: "investor",
    title: "Investor Briefing",
    description:
      "Professional presentation for investors or lenders with financial projections and risk assessment.",
    icon: <Briefcase size={20} className="text-clay" />,
  },
  {
    id: "team",
    title: "Team Briefing",
    description:
      "Weekly team update with tasks, schedule, and coordination notes.",
    icon: <Users size={20} className="text-clay" />,
  },
  {
    id: "progress",
    title: "Progress Report",
    description:
      "Comprehensive progress report with photos, milestones, and budget tracking.",
    icon: <TrendingUp size={20} className="text-clay" />,
  },
  {
    id: "budget",
    title: "Budget Report",
    description:
      "Detailed budget analysis with category breakdown and recommendations.",
    icon: <DollarSign size={20} className="text-clay" />,
  },
];

export function PresentationModal({ data, onClose }: PresentationModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleGenerate(type: PresentationType) {
    setLoading(type);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      openPresentation(type, data);
    } finally {
      setTimeout(() => setLoading(null), 600);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-earth/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-surface rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2
              className="text-[20px] text-earth"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Generate Presentation
            </h2>
            <p className="text-[12px] text-muted mt-0.5">
              {data.project.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-earth hover:bg-warm transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Option cards in 2x2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OPTIONS.map((opt) => {
            const isLoading = loading === opt.id;
            return (
              <div
                key={opt.id}
                className="bg-surface border border-border rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
                onClick={() => !isLoading && handleGenerate(opt.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!isLoading) handleGenerate(opt.id);
                  }
                }}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center mb-3">
                  {opt.icon}
                </div>

                {/* Title */}
                <h3 className="text-[13px] font-semibold text-earth mb-1">
                  {opt.title}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-muted leading-relaxed mb-3">
                  {opt.description}
                </p>

                {/* Action button */}
                <button
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-[12px] font-medium rounded-lg bg-earth text-warm hover:bg-earth-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate PDF"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
