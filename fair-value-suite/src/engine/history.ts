import { Num, average, isNum } from './num';

/**
 * The "10 Years …" history tables (11 yearly values, Year 0 … Year 10).
 */
export interface HistoryInput {
  startYear: number;
  values: Num[]; // 11 values, oldest first
}

export interface HistoryResult {
  years: number[];
  values: Num[];
  /** YoY growth: =IF(OR(prev="", prev=0, cur=""), "", (cur-prev)/ABS(prev)). Index 0 is always null. */
  growth: Num[];
  /** =AVERAGE(values) */
  average: Num;
  /** =IFERROR(AVERAGE(growth), 0) — shown as "Annual Growth Rate". */
  averageGrowth: number;
  /**
   * CAGR — the Sheets LET formula: keep only positive numbers, then
   * (last / first) ^ (1 / (n - 1)) - 1; empty when fewer than 2 values.
   */
  cagr: Num;
}

export const HISTORY_LENGTH = 11;

export function computeHistory(input: HistoryInput): HistoryResult {
  const values = Array.from({ length: HISTORY_LENGTH }, (_, i) => input.values[i] ?? null);
  const years = values.map((_, i) => input.startYear + i);

  const growth: Num[] = values.map((cur, i) => {
    if (i === 0) return null;
    const prev = values[i - 1];
    if (!isNum(prev) || prev === 0 || !isNum(cur)) return null;
    return (cur - prev) / Math.abs(prev);
  });

  const positives = values.filter((x): x is number => isNum(x) && x > 0);
  let cagr: Num = null;
  if (positives.length > 1) {
    const r = Math.pow(positives[positives.length - 1] / positives[0], 1 / (positives.length - 1)) - 1;
    cagr = Number.isFinite(r) ? r : null;
  }

  return {
    years,
    values,
    growth,
    average: average(values),
    averageGrowth: average(growth) ?? 0,
    cagr,
  };
}

export const emptyHistory = (startYear = 2016): HistoryInput => ({
  startYear,
  values: Array(HISTORY_LENGTH).fill(null),
});
