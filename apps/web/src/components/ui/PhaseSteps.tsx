"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  FileUp,
  Info,
  MessageSquare,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PhaseStep {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
  actionType: "in-app" | "upload" | "both" | "confirm";
  inAppRoute?: string;
  requiredDocuments?: string[];
  estimatedTime?: string;
  order: number;
}

export interface PhaseStepCompletion {
  completedAt: string;
  documentIds?: string[];
  notes?: string;
}

interface PhaseStepsProps {
  steps: PhaseStep[];
  completedSteps: Record<string, PhaseStepCompletion>;
  onComplete: (stepId: string, data: { notes?: string; documentIds?: string[] }) => void;
  onUncomplete: (stepId: string) => void;
  projectId: string;
  userId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PhaseSteps({
  steps,
  completedSteps,
  onComplete,
  onUncomplete,
  projectId,
}: PhaseStepsProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({});
  const [confirmingStep, setConfirmingStep] = useState<string | null>(null);

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const completedCount = sortedSteps.filter((s) => completedSteps[s.id]).length;
  const totalCount = sortedSteps.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  function toggleExpand(stepId: string) {
    setExpandedStep((prev) => (prev === stepId ? null : stepId));
  }

  function handleComplete(stepId: string) {
    const notes = activeNotes[stepId]?.trim() || undefined;
    onComplete(stepId, { notes });
    setActiveNotes((prev) => {
      const next = { ...prev };
      delete next[stepId];
      return next;
    });
    setConfirmingStep(null);
  }

  function handleUncomplete(stepId: string) {
    onUncomplete(stepId);
  }

  function resolveRoute(step: PhaseStep): string {
    if (!step.inAppRoute) return "";
    // If the route starts with /, it is an absolute app route
    if (step.inAppRoute.startsWith("/")) return step.inAppRoute;
    // Otherwise it is relative to the project
    return `/project/${projectId}/${step.inAppRoute}`;
  }

  return (
    <div className="relative">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-earth">Phase Steps</h3>
          <span className="text-[10px] font-data text-muted">
            {completedCount} of {totalCount} complete
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-data font-medium text-earth">{progressPercent}%</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-border" />

        {/* Steps */}
        <div className="space-y-0">
          {sortedSteps.map((step, index) => {
            const completion = completedSteps[step.id];
            const isCompleted = !!completion;
            const isExpanded = expandedStep === step.id;
            const isFirst = index === 0;
            const isLast = index === sortedSteps.length - 1;
            const isNextActionable =
              !isCompleted &&
              sortedSteps
                .slice(0, index)
                .every((s) => !!completedSteps[s.id]);

            return (
              <div
                key={step.id}
                className={`relative pl-8 ${isFirst ? "pt-0" : "pt-0"} ${isLast ? "pb-0" : "pb-0"}`}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 top-3 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                    isCompleted
                      ? "bg-success border-success"
                      : isNextActionable
                      ? "bg-surface border-clay"
                      : "bg-surface border-border-dark"
                  }`}
                >
                  {isCompleted ? (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span className="text-[9px] font-data font-medium text-muted">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Step card */}
                <div
                  className={`border rounded-xl mb-2 transition-all ${
                    isCompleted
                      ? "border-success/30 bg-success/[0.03]"
                      : isNextActionable
                      ? "border-clay/40 bg-surface shadow-sm"
                      : "border-border bg-surface"
                  }`}
                >
                  {/* Step header */}
                  <button
                    onClick={() => toggleExpand(step.id)}
                    className="w-full flex items-start gap-2 p-3 text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-[12px] font-medium leading-tight ${
                            isCompleted
                              ? "text-success"
                              : isNextActionable
                              ? "text-earth"
                              : "text-muted"
                          }`}
                        >
                          {step.title}
                        </h4>
                        {step.estimatedTime && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] text-muted font-data bg-warm px-1.5 py-0.5 rounded-full">
                            <Clock size={8} />
                            {step.estimatedTime}
                          </span>
                        )}
                      </div>
                      {!isExpanded && !isCompleted && (
                        <p className="text-[11px] text-muted mt-0.5 line-clamp-1">
                          {step.description}
                        </p>
                      )}
                      {isCompleted && completion && (
                        <p className="text-[10px] text-success/70 mt-0.5">
                          Completed{" "}
                          {new Date(completion.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {completion.notes ? ` -- ${completion.notes}` : ""}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 mt-0.5 text-muted group-hover:text-earth transition-colors">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-border/50">
                      {/* Description */}
                      <p className="text-[11px] text-slate leading-relaxed mt-3">
                        {step.description}
                      </p>

                      {/* Why it matters */}
                      <div className="mt-3 bg-warm/60 border border-sand/30 rounded-lg p-2.5">
                        <div className="flex items-start gap-1.5">
                          <Info size={12} className="text-clay shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-semibold text-clay uppercase tracking-wider mb-1">
                              Why this matters
                            </p>
                            <p className="text-[11px] text-earth/80 leading-relaxed">
                              {step.whyItMatters}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Required documents */}
                      {step.requiredDocuments && step.requiredDocuments.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                            Documents needed
                          </p>
                          <ul className="space-y-1">
                            {step.requiredDocuments.map((doc, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-1.5 text-[11px] text-earth"
                              >
                                <div className="w-1 h-1 rounded-full bg-clay shrink-0" />
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action area */}
                      {!isCompleted && (
                        <div className="mt-3 space-y-2">
                          {/* Action buttons */}
                          <div className="flex flex-wrap gap-2">
                            {(step.actionType === "in-app" || step.actionType === "both") &&
                              step.inAppRoute && (
                                <Link
                                  href={resolveRoute(step)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg bg-earth text-warm hover:bg-earth/90 transition-colors"
                                >
                                  <ExternalLink size={12} />
                                  Do it in Keystone
                                </Link>
                              )}
                            {(step.actionType === "upload" || step.actionType === "both") && (
                              <Link
                                href={`/project/${projectId}/documents`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg border border-clay text-clay hover:bg-warm transition-colors"
                              >
                                <FileUp size={12} />
                                Upload proof
                              </Link>
                            )}
                            {step.actionType === "confirm" && confirmingStep !== step.id && (
                              <button
                                onClick={() => setConfirmingStep(step.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg bg-success text-white hover:bg-success/90 transition-colors"
                              >
                                <CheckCircle2 size={12} />
                                Mark as done
                              </button>
                            )}
                            {(step.actionType === "in-app" || step.actionType === "both") &&
                              confirmingStep !== step.id && (
                                <button
                                  onClick={() => setConfirmingStep(step.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg border border-success text-success hover:bg-success/5 transition-colors"
                                >
                                  <CheckCircle2 size={12} />
                                  Mark as done
                                </button>
                              )}
                            {step.actionType === "upload" && confirmingStep !== step.id && (
                              <button
                                onClick={() => setConfirmingStep(step.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg border border-success text-success hover:bg-success/5 transition-colors"
                              >
                                <CheckCircle2 size={12} />
                                Mark as done
                              </button>
                            )}
                          </div>

                          {/* Confirmation area with notes */}
                          {confirmingStep === step.id && (
                            <div className="bg-warm/40 border border-sand/30 rounded-lg p-2.5 space-y-2">
                              <div className="flex items-start gap-1.5">
                                <MessageSquare size={12} className="text-muted mt-0.5 shrink-0" />
                                <textarea
                                  value={activeNotes[step.id] || ""}
                                  onChange={(e) =>
                                    setActiveNotes((prev) => ({
                                      ...prev,
                                      [step.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Add optional notes about how you completed this step..."
                                  rows={2}
                                  className="flex-1 w-full px-2 py-1.5 text-[11px] border border-border rounded-lg bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-clay resize-none"
                                />
                              </div>
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() => setConfirmingStep(null)}
                                  className="px-3 py-1 text-[11px] text-muted hover:text-earth transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleComplete(step.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-lg bg-success text-white hover:bg-success/90 transition-colors"
                                >
                                  <CheckCircle2 size={11} />
                                  Confirm complete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Completed state with undo */}
                      {isCompleted && (
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[11px] text-success">
                            <CheckCircle2 size={14} />
                            <span className="font-medium">Step completed</span>
                          </div>
                          <button
                            onClick={() => handleUncomplete(step.id)}
                            className="text-[10px] text-muted hover:text-danger transition-colors"
                          >
                            Undo completion
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
