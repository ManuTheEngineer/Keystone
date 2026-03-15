import type { CurrencyConfig } from "../types";

export const USD_CONFIG: CurrencyConfig = {
  code: "USD",
  symbol: "$",
  locale: "en-US",
  decimals: 2,
  groupSeparator: ",",
  position: "prefix",
};

export const XOF_CONFIG: CurrencyConfig = {
  code: "XOF",
  symbol: "FCFA",
  locale: "fr-TG",
  decimals: 0,
  groupSeparator: " ",
  position: "suffix",
};

export const GHS_CONFIG: CurrencyConfig = {
  code: "GHS",
  symbol: "GH\u20B5",
  locale: "en-GH",
  decimals: 2,
  groupSeparator: ",",
  position: "prefix",
};

export function formatCurrency(amount: number, config: CurrencyConfig): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  let formatted: string;
  if (config.decimals === 0) {
    formatted = Math.round(absAmount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, config.groupSeparator);
  } else {
    const parts = absAmount.toFixed(config.decimals).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.groupSeparator);
    formatted = parts.join(".");
  }

  if (config.position === "prefix") {
    return `${sign}${config.symbol}${formatted}`;
  }
  return `${sign}${formatted} ${config.symbol}`;
}

export function formatCurrencyCompact(amount: number, config: CurrencyConfig): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  let compact: string;
  if (absAmount >= 1_000_000_000) {
    compact = `${(absAmount / 1_000_000_000).toFixed(1)}B`;
  } else if (absAmount >= 1_000_000) {
    compact = `${(absAmount / 1_000_000).toFixed(1)}M`;
  } else if (absAmount >= 1_000) {
    compact = `${(absAmount / 1_000).toFixed(0)}K`;
  } else {
    return formatCurrency(amount, config);
  }

  if (config.position === "prefix") {
    return `${sign}${config.symbol}${compact}`;
  }
  return `${sign}${compact} ${config.symbol}`;
}
