"use client";

import { useEffect, useState } from "react";
import type { CurrencyConfig } from "@keystone/market-data";
import { formatCurrencyCompact } from "@keystone/market-data";

interface CostDeltaProps {
  amount: number;
  currency: CurrencyConfig;
  variant: "card" | "preview";
}

export function CostDelta({ amount, currency, variant }: CostDeltaProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (variant !== "preview") return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [amount, variant]);

  if (Math.abs(amount) < 100) return null;

  const isPositive = amount > 0;
  const colorClasses = isPositive
    ? "bg-amber-50 text-amber-600"
    : "bg-emerald-50 text-emerald-600";

  const formatted = `${isPositive ? "+" : ""}${formatCurrencyCompact(amount, currency)}`;

  if (variant === "preview") {
    return (
      <span
        className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-data font-medium transition-opacity duration-500 ${colorClasses} ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {formatted}
      </span>
    );
  }

  return (
    <span
      className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-data font-medium ${colorClasses}`}
    >
      {formatted}
    </span>
  );
}
