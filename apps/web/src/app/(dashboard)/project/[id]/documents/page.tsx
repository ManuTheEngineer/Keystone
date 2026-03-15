"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import { subscribeToDocuments, type DocumentData } from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import { FileText } from "lucide-react";

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  CONTRACT: { bg: "bg-info-bg", text: "text-info" },
  LEGAL: { bg: "bg-success-bg", text: "text-success" },
  PLAN: { bg: "bg-warning-bg", text: "text-warning" },
  PERMIT: { bg: "bg-danger-bg", text: "text-danger" },
  INVOICE: { bg: "bg-success-bg", text: "text-success" },
  REPORT: { bg: "bg-warning-bg", text: "text-warning" },
  DEFAULT: { bg: "bg-info-bg", text: "text-info" },
};

export default function DocumentsPage() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const projectId = params.id as string;
  const [docs, setDocs] = useState<DocumentData[]>([]);

  useEffect(() => {
    const unsub = subscribeToDocuments(projectId, setDocs);
    return unsub;
  }, [projectId]);

  useEffect(() => {
    setTopbar("Documents", `${docs.length} files`, "info");
  }, [setTopbar, docs.length]);

  return (
    <>
      <SectionLabel>All project documents</SectionLabel>
      {docs.length === 0 ? (
        <Card padding="md" className="text-center">
          <p className="text-[12px] text-muted">No documents yet. Documents will appear as you progress through project phases.</p>
        </Card>
      ) : (
        <div className="space-y-0">
          {docs.map((doc, i) => {
            const style = TYPE_COLORS[doc.type] ?? TYPE_COLORS.DEFAULT;
            return (
              <div
                key={doc.id}
                className={`flex items-center gap-3 py-2.5 cursor-pointer ${i < docs.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-earth truncate">{doc.name}</div>
                  <div className="text-[10px] text-muted">{doc.phase} / {doc.date}</div>
                </div>
                <span className="text-[10px] text-info cursor-pointer hover:underline shrink-0">View</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
