"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { formatCurrency } from "@keystone/market-data";
import { useCurrency, useDetailedCosts } from "../store";
import { LivePreview } from "./LivePreview";

export function MobilePreviewBar() {
  const [open, setOpen] = useState(false);
  const currency = useCurrency();
  const costs = useDetailedCosts();

  return (
    <>
      {/* ── Fixed bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border bg-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted">Running total</p>
            <p className="font-data text-[18px] font-bold text-earth leading-tight">
              {formatCurrency(costs.grandTotal, currency)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-earth hover:bg-warm transition-colors"
          >
            Specs
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Drawer overlay ── */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-earth/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-cream rounded-t-2xl max-h-[80vh] overflow-y-auto">
            {/* Sticky header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-cream px-4 py-3 rounded-t-2xl">
              <p className="text-[14px] font-semibold text-earth">Build Specs</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[13px] font-medium text-clay hover:text-earth transition-colors"
              >
                Done
              </button>
            </div>

            {/* Content */}
            <LivePreview />
          </div>
        </div>
      )}
    </>
  );
}
