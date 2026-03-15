"use client";

import { useEffect } from "react";
import { useTopbar } from "../../../layout";
import { ROBINSON_DOCUMENTS } from "@/lib/data/mock-projects";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FileText } from "lucide-react";

const variantStyles = {
  info: { bg: "bg-info-bg", text: "text-info" },
  success: { bg: "bg-success-bg", text: "text-success" },
  warning: { bg: "bg-warning-bg", text: "text-warning" },
  danger: { bg: "bg-danger-bg", text: "text-danger" },
};

export default function DocumentsPage() {
  const { setTopbar } = useTopbar();

  useEffect(() => {
    setTopbar("Documents", "18 files", "info");
  }, [setTopbar]);

  return (
    <>
      <SectionLabel>All project documents</SectionLabel>
      <div className="space-y-0">
        {ROBINSON_DOCUMENTS.map((doc, i) => {
          const style = variantStyles[doc.variant];
          return (
            <div
              key={i}
              className={`flex items-center gap-3 py-2.5 cursor-pointer ${
                i < ROBINSON_DOCUMENTS.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-earth truncate">{doc.name}</div>
                <div className="text-[10px] text-muted">
                  {doc.phase} / {doc.date}
                </div>
              </div>
              <span className="text-[10px] text-info cursor-pointer hover:underline shrink-0">View</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
