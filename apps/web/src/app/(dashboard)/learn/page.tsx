"use client";

import { useEffect } from "react";
import { useTopbar } from "../layout";
import { LEARN_MODULES } from "@/lib/data/mock-projects";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { BookOpen } from "lucide-react";

export default function LearnPage() {
  const { setTopbar } = useTopbar();

  useEffect(() => {
    setTopbar("Learn", "Knowledge base", "success");
  }, [setTopbar]);

  return (
    <>
      <SectionLabel>Educational modules</SectionLabel>
      <div className="space-y-0">
        {LEARN_MODULES.map((mod, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 py-3 cursor-pointer ${
              i < LEARN_MODULES.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-surface-alt flex items-center justify-center shrink-0 text-muted">
              <BookOpen size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-earth truncate">{mod.title}</div>
              <div className="mt-0.5">
                <Badge variant={mod.variant}>{mod.category}</Badge>
              </div>
            </div>
            <span className="text-[10px] text-info cursor-pointer hover:underline shrink-0">
              Start lesson
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
