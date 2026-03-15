"use client";

import type { InspectionRequirement } from "@keystone/market-data";
import { Badge } from "./Badge";

interface InspectionChecklistProps {
  inspections: InspectionRequirement[];
  completedItems: Record<string, boolean[]>;
  onToggle: (inspectionId: string, itemIndex: number) => void;
}

export function InspectionChecklist({ inspections, completedItems, onToggle }: InspectionChecklistProps) {
  if (inspections.length === 0) {
    return (
      <p className="text-[11px] text-muted py-2">No inspections required for this phase.</p>
    );
  }

  return (
    <div className="space-y-3">
      {inspections.map((inspection) => {
        const itemStates = completedItems[inspection.id] ?? [];
        const completedCount = itemStates.filter(Boolean).length;
        const totalItems = inspection.checklistItems.length;
        const allComplete = completedCount === totalItems && totalItems > 0;

        return (
          <div
            key={inspection.id}
            className={`border rounded-[var(--radius)] overflow-hidden ${
              allComplete ? "border-success bg-success-bg/30" : "border-border bg-surface"
            }`}
          >
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-earth">{inspection.name}</span>
                  <Badge variant={inspection.formal ? "info" : "emerald"}>
                    {inspection.formal ? "Formal" : "Informal"}
                  </Badge>
                  {allComplete && <Badge variant="success">Passed</Badge>}
                </div>
                <p className="text-[10px] text-muted mt-0.5">{inspection.inspector}</p>
              </div>
              <span className="text-[10px] font-data text-muted">
                {completedCount}/{totalItems}
              </span>
            </div>

            <div className="px-3 py-2">
              {inspection.checklistItems.map((item, i) => {
                const checked = itemStates[i] ?? false;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 py-1.5 text-[11px] ${
                      i < totalItems - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border-[1.5px] shrink-0 cursor-pointer transition-colors flex items-center justify-center ${
                        checked
                          ? "bg-success border-success"
                          : "border-border-dark hover:border-emerald-500"
                      }`}
                      onClick={() => onToggle(inspection.id, i)}
                    >
                      {checked && (
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className={checked ? "text-muted line-through opacity-40" : "text-muted"}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
