import { Num, div, v } from './num';

/** The "ROI Calculator" block that appears on almost every sheet. */
export interface RoiInput {
  invested: Num; // Amount Invested
  returned: Num; // Amount Returned
  years: Num; // Years
}

export interface RoiResult {
  roi: Num; // =(Returned - Invested) / Invested
  annualized: Num; // =((1+(Returned-Invested)/Invested)^(1/Years)-1)
  gain: number; // =Returned - Invested
}

export function computeRoi(input: RoiInput): RoiResult {
  const roi = div(v(input.returned) - v(input.invested), input.invested);
  let annualized: Num = null;
  if (roi !== null && v(input.years) !== 0) {
    const a = Math.pow(1 + roi, 1 / v(input.years)) - 1;
    annualized = Number.isFinite(a) ? a : null;
  }
  return { roi, annualized, gain: v(input.returned) - v(input.invested) };
}
