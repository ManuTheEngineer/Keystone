/**
 * Format a number as a percentage string.
 * @example formatPercent(12.456, 1) => "12.5%"
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number of months into a human-readable duration.
 * Uses "X years Y months" for durations >= 24 months, otherwise "X months".
 * @example formatMonths(27) => "2 years 3 months"
 * @example formatMonths(14) => "14 months"
 * @example formatMonths(1) => "1 month"
 */
export function formatMonths(months: number): string {
  if (!isFinite(months) || months < 0) {
    return "N/A";
  }

  const rounded = Math.round(months);

  if (rounded === 0) {
    return "0 months";
  }

  if (rounded < 24) {
    return rounded === 1 ? "1 month" : `${rounded} months`;
  }

  const years = Math.floor(rounded / 12);
  const remaining = rounded % 12;

  const yearStr = years === 1 ? "1 year" : `${years} years`;

  if (remaining === 0) {
    return yearStr;
  }

  const monthStr = remaining === 1 ? "1 month" : `${remaining} months`;
  return `${yearStr} ${monthStr}`;
}
