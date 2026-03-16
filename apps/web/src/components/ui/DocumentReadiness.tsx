"use client";

import Link from "next/link";
import { FileText, Upload, FileCheck, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { DocumentCompletenessResult } from "@/lib/document-intelligence";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DocumentReadinessProps {
  analysis: DocumentCompletenessResult;
  projectId: string;
  phaseName: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DocumentReadiness({ analysis, projectId, phaseName }: DocumentReadinessProps) {
  const { complete, missing, completenessPercent, recommendations } = analysis;
  const total = complete.length + missing.length;

  if (total === 0) return null;

  // Determine ring color
  const ringColor =
    completenessPercent >= 80
      ? "var(--color-success)"
      : completenessPercent >= 50
      ? "var(--color-warning)"
      : "var(--color-danger)";

  // SVG circle parameters
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completenessPercent / 100) * circumference;

  const missingRequired = missing.filter((m) => m.required);
  const missingOptional = missing.filter((m) => !m.required);

  return (
    <Card padding="md">
      <div className="flex items-start gap-4">
        {/* Circular progress */}
        <div className="relative shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80" className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="6"
            />
            {/* Progress ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-data text-[16px] font-semibold text-earth">
              {completenessPercent}%
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-[12px] font-semibold text-earth mb-0.5">
            Document Readiness
          </h4>
          <p className="text-[10px] text-muted mb-2">
            {phaseName} phase: {complete.length} of {total} documents accounted for
          </p>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {recommendations.slice(0, 2).map((rec, i) => (
                <p key={i} className="text-[11px] text-earth/80 leading-relaxed">
                  {rec}
                </p>
              ))}
            </div>
          )}

          {/* Missing required documents */}
          {missingRequired.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-semibold text-danger uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertTriangle size={10} />
                Required documents missing
              </p>
              <div className="space-y-1">
                {missingRequired.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileText size={11} className="text-danger shrink-0" />
                      <span className="text-earth truncate">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {doc.templateAvailable && (
                        <Link
                          href={`/project/${projectId}/documents`}
                          className="text-[10px] text-info hover:underline"
                        >
                          Generate
                        </Link>
                      )}
                      <Link
                        href={`/project/${projectId}/documents`}
                        className="inline-flex items-center gap-0.5 text-[10px] text-clay hover:underline"
                      >
                        <Upload size={9} />
                        Upload
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing optional documents */}
          {missingOptional.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                Optional documents
              </p>
              <div className="space-y-1">
                {missingOptional.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileText size={11} className="text-muted shrink-0" />
                      <span className="text-muted truncate">{doc.name}</span>
                    </div>
                    <Link
                      href={`/project/${projectId}/documents`}
                      className="inline-flex items-center gap-0.5 text-[10px] text-clay hover:underline shrink-0"
                    >
                      <Upload size={9} />
                      Upload
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete documents */}
          {complete.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-success uppercase tracking-wider mb-1 flex items-center gap-1">
                <FileCheck size={10} />
                Documents on file
              </p>
              <div className="space-y-0.5">
                {complete.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 text-[11px] text-success/70"
                  >
                    <div className="w-1 h-1 rounded-full bg-success shrink-0" />
                    <span className="truncate">{doc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
