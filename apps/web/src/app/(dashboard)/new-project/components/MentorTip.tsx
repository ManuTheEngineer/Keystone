"use client";

import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";

interface MentorTipProps {
  children: ReactNode;
}

export function MentorTip({ children }: MentorTipProps) {
  return (
    <div className="flex gap-3 bg-warm/50 border border-sand/40 rounded-xl p-4 mt-4">
      <BookOpen size={18} className="text-clay shrink-0 mt-0.5" />
      <div className="text-[12px] text-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
}
