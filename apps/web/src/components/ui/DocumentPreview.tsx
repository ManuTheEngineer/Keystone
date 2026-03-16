"use client";

import { useRef, useCallback } from "react";
import { X, Printer, Save } from "lucide-react";

interface DocumentPreviewProps {
  html: string;
  title: string;
  type: string;
  onClose: () => void;
  onSave: () => void;
}

export function DocumentPreview({
  html,
  title,
  type,
  onClose,
  onSave,
}: DocumentPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, []);

  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [html]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal container */}
      <div className="relative z-10 flex flex-col w-full max-w-[900px] h-[92vh] mx-4 bg-surface border border-border rounded-[var(--radius)] shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-cream shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-[12px] font-medium text-earth truncate">
              {title}
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-info-bg text-info font-medium shrink-0">
              {type}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium border border-border rounded-[var(--radius)] bg-surface text-earth hover:bg-warm transition-colors"
            >
              <Printer size={12} />
              Print / Save as PDF
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors"
            >
              <Save size={12} />
              Save to project
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-[var(--radius)] text-muted hover:text-earth hover:bg-warm transition-colors"
              aria-label="Close preview"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Document preview area */}
        <div className="flex-1 overflow-auto bg-[#e8e8e8] dark:bg-[#1a1a1a] p-6 flex justify-center">
          <div
            className="w-full max-w-[8.5in] bg-white shadow-lg rounded-sm"
            style={{ minHeight: "11in" }}
          >
            <iframe
              ref={iframeRef}
              title="Document Preview"
              className="w-full h-full border-0"
              style={{ minHeight: "11in" }}
              onLoad={handleIframeLoad}
              srcDoc={html}
              sandbox="allow-same-origin allow-modals"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
