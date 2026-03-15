import type { CurrencyConversionInput, CurrencyConversionResult } from "../types";

/** Default exchange rates (approximate). Supply a live rate via input for accuracy. */
export const DEFAULT_EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { XOF: 615, GHS: 15.5, USD: 1 },
  XOF: { USD: 1 / 615, GHS: 15.5 / 615, XOF: 1 },
  GHS: { USD: 1 / 15.5, XOF: 615 / 15.5, GHS: 1 },
};

/**
 * Convert between currencies using a supplied exchange rate.
 */
export function convertCurrency(input: CurrencyConversionInput): CurrencyConversionResult {
  const { amount, fromCurrency, toCurrency, exchangeRate } = input;

  const convertedAmount = round2(amount * exchangeRate);

  const formula = [
    `${amount.toFixed(2)} ${fromCurrency} * ${exchangeRate} = ${convertedAmount.toFixed(2)} ${toCurrency}`,
    `Exchange rate: 1 ${fromCurrency} = ${exchangeRate} ${toCurrency}`,
  ].join("\n");

  return {
    convertedAmount,
    exchangeRate,
    fromCurrency,
    toCurrency,
    formula,
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
