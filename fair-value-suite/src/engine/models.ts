import { Num, average, div, isNum, median, signal, sum, upside, v } from './num';
import { HistoryInput, HistoryResult, computeHistory } from './history';
import { RoiInput, RoiResult, computeRoi } from './roi';

export type ScenarioKey = 'optimistic' | 'average' | 'worst';
export const SCENARIO_KEYS: ScenarioKey[] = ['optimistic', 'average', 'worst'];
export const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  optimistic: 'Optimistic Scenario',
  average: 'Average Scenario',
  worst: 'Worst Scenario',
};

export interface ScenarioParams {
  discountRate: Num; // B5 / B12 / B19
  growth1to5: Num; // B6 / B13 / B20
  growth5to10: Num; // B7 / B14 / B21
  terminalParam: Num; // B8 / B15 / B22 (Perpetual Growth or Multiple)
  marginOfSafety: Num; // B9 / B16 / B23
  baseMetric?: Num; // D5 / D12 / D19 when editable per-scenario (DCF, EV/EBITDA)
}

export interface ScenarioRowResult {
  years: number[]; // 11 years: startYear .. startYear+10 (cols D..N)
  projected: number[]; // Row 5/12/19 cols D..N (11 values)
  terminalBase: number; // Col O row 5/12/19 (=N5)
  terminalFuture: Num; // Col O row 6/13/20
  discounted: number[]; // Row 7/14/21 cols E..N (10 values) or cols D..N (11 values for backwards discount)
  terminalPV: Num; // Col O row 7/14/21
  sumPV: Num; // E9 / E16 / E23
  intrinsicValue: Num; // H9 / H16 / H23
}

export interface WeightedRow {
  key: ScenarioKey;
  label: string;
  weight: Num;
  intrinsicValue: Num;
  weightedValue: number;
}

export interface WeightedTableResult {
  rows: WeightedRow[];
  totalWeight: number;
  averageIntrinsicValue: number;
  buySell: 'BUY' | 'SELL';
  underOverValued: Num;
}

/**
 * Helper to project 11 years (cols D..N, indices 0..10).
 * Notice in Excel:
 * - Optimistic (row 5) and Worst (row 19): E..I (indices 1..5, 5 steps) use growth1to5; J..N (indices 6..10, 5 steps) use growth5to10.
 * - Average (row 12) in DCF, PE, EV/EBITDA, Random Multiple: E..H (indices 1..4, 4 steps) use growth1to5; I..N (indices 5..10, 6 steps) use growth5to10!
 * - Average (row 12) in FCF Multiple and Dividends: E..I (indices 1..5, 5 steps) use growth1to5; J..N (indices 6..10, 5 steps) use growth5to10.
 */
function project11Years(
  base: Num,
  g1: Num,
  g2: Num,
  splitAfterIndex: 4 | 5
): number[] {
  const arr: number[] = [v(base)];
  for (let i = 1; i <= 10; i++) {
    const rate = i <= splitAfterIndex ? v(g1) : v(g2);
    arr.push(arr[i - 1] * (1 + rate));
  }
  return arr;
}

// ============================================================================
// 1. OVERVIEW SHEET
// ============================================================================
export interface PriceBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OverviewState {
  symbol: string; // B5
  exchange: string; // B6
  dataDate: string; // G6
  companyName: string; // B8
  return3Y: Num; // C11
  return5Y: Num; // E11
  return10Y: Num; // G11
  currentPrice: Num; // B14
  change: Num; // C14
  changePct: Num; // D14
  low52: Num; // E14
  high52: Num; // F14
  marketCap: Num; // B18 (in thousands)
  shares: Num; // C18 (in thousands)
  peRatio: Num; // D18
  eps: Num; // E18
  beta: Num; // F18
  dividendYield: string; // G18
  roi1: RoiInput; // J14:J16
  roi2: RoiInput; // J24:J26
  priceHistory: PriceBar[];
}

export interface OverviewResult {
  fullSymbol: string; // B23 = IF(ISBLANK(B6),"",B6&":")&B5
  averagePrice: Num; // G14 = AVERAGEIF(F35:F5007,"<>0")
  roi1: RoiResult;
  roi2: RoiResult;
}

export function computeOverview(state: OverviewState): OverviewResult {
  const fullSymbol = state.exchange.trim()
    ? `${state.exchange.trim()}:${state.symbol.trim()}`
    : state.symbol.trim();
  const nonZeroCloses = state.priceHistory
    .map((p) => p.close)
    .filter((c) => isNum(c) && c !== 0);
  const averagePrice = average(nonZeroCloses);
  return {
    fullSymbol,
    averagePrice,
    roi1: computeRoi(state.roi1),
    roi2: computeRoi(state.roi2),
  };
}

// ============================================================================
// 2. DCF 10 YEARS SHEET
// ============================================================================
export interface Dcf10State {
  company: string; // B1
  marketPrice: Num; // E1
  dataDate: string; // L1
  sharesOutstanding: Num; // B2
  startYear: number; // D4 (2026)
  scenarios: Record<ScenarioKey, ScenarioParams>;
  weights: Record<ScenarioKey, Num>; // E26:E28
  marketCapDcf: Num; // E34
  mcWeights: Record<ScenarioKey, Num>; // E37:E39
  billionsInput: Num; // N26
  trillionsInput: Num; // N31
  roi1: RoiInput; // R5:R7
  roi2: RoiInput; // R15:R17
  fcfHistory: HistoryInput; // T6:AD7
  revenueHistory: HistoryInput; // T16:AD17
}

export interface Dcf10Result {
  scenarios: Record<ScenarioKey, ScenarioRowResult>;
  perShareTable: WeightedTableResult;
  marketCapTable: WeightedTableResult;
  billionsToThousands: number; // O26 = N26*1000000
  trillionsToThousands: number; // O31 = N31*1000000000
  roi1: RoiResult;
  roi2: RoiResult;
  fcfHistory: HistoryResult;
  revenueHistory: HistoryResult;
}

export function computeDcf10(state: Dcf10State): Dcf10Result {
  const scenarios = {} as Record<ScenarioKey, ScenarioRowResult>;

  SCENARIO_KEYS.forEach((key) => {
    const sc = state.scenarios[key];
    // 1:1 Excel: Average row 12 splits after H12 (index 4), Optimistic/Worst split after I5/I19 (index 5)
    const splitAfter: 4 | 5 = key === 'average' ? 4 : 5;
    const projected = project11Years(sc.baseMetric, sc.growth1to5, sc.growth5to10, splitAfter);
    const years = Array.from({ length: 11 }, (_, i) => state.startYear + i);
    const terminalBase = projected[10]; // O5 = N5
    const r = v(sc.discountRate);
    const gPerp = v(sc.terminalParam);
    const terminalFuture = div(terminalBase * (1 + gPerp), r - gPerp); // O6 = O5*(1+B8)/(B5-B8)

    const discounted: number[] = [];
    for (let t = 1; t <= 10; t++) {
      discounted.push(projected[t] / Math.pow(1 + r, t));
    }
    const terminalPV =
      terminalFuture === null ? null : terminalFuture / Math.pow(1 + r, 10);
    const sumPV =
      terminalPV === null ? null : sum(discounted) + terminalPV; // E9 = SUM(E7:O7)
    const shares = v(state.sharesOutstanding);
    const intrinsicValue =
      sumPV === null || shares === 0
        ? null
        : (sumPV / shares) * (1 - v(sc.marginOfSafety)); // H9 = (E9/B2)*(1-B9)

    scenarios[key] = {
      years,
      projected,
      terminalBase,
      terminalFuture,
      discounted,
      terminalPV,
      sumPV,
      intrinsicValue,
    };
  });

  // Table 1: Per-Share Intrinsic Value (rows 25-30)
  const perShareRows: WeightedRow[] = SCENARIO_KEYS.map((key) => {
    const w = state.weights[key];
    const iv = scenarios[key].intrinsicValue;
    return {
      key,
      label: key === 'optimistic' ? 'Optimistic' : key === 'average' ? 'Average' : 'Worst',
      weight: w,
      intrinsicValue: iv,
      weightedValue: v(iv) * v(w),
    };
  });
  const avgIV = sum(perShareRows.map((r) => r.weightedValue)); // H26 = sum(G26:G28)
  const perShareTable: WeightedTableResult = {
    rows: perShareRows,
    totalWeight: sum(perShareRows.map((r) => r.weight)),
    averageIntrinsicValue: avgIV,
    buySell: signal(avgIV, state.marketPrice), // K26 = if(H26>E1,"BUY","SELL")
    underOverValued: upside(avgIV, state.marketPrice), // H30 = H26/E1-1
  };

  // Table 2: Market Cap DCF (rows 36-41)
  const mcRows: WeightedRow[] = SCENARIO_KEYS.map((key) => {
    const w = state.mcWeights[key];
    const iv = scenarios[key].sumPV; // F37=E9, F38=E16, F39=E23
    return {
      key,
      label: key === 'optimistic' ? 'Optimistic' : key === 'average' ? 'Average' : 'Worst',
      weight: w,
      intrinsicValue: iv,
      weightedValue: v(iv) * v(w),
    };
  });
  // H37 = sum(G37:G39)*(1-B23)
  const avgMcIV =
    sum(mcRows.map((r) => r.weightedValue)) *
    (1 - v(state.scenarios.worst.marginOfSafety));
  const marketCapTable: WeightedTableResult = {
    rows: mcRows,
    totalWeight: sum(mcRows.map((r) => r.weight)),
    averageIntrinsicValue: avgMcIV,
    buySell: signal(avgMcIV, state.marketCapDcf), // K37 = if(H37>E34,"BUY","SELL")
    underOverValued: upside(avgMcIV, state.marketCapDcf), // H41 = H37/E34-1
  };

  return {
    scenarios,
    perShareTable,
    marketCapTable,
    billionsToThousands: v(state.billionsInput) * 1_000_000,
    trillionsToThousands: v(state.trillionsInput) * 1_000_000_000,
    roi1: computeRoi(state.roi1),
    roi2: computeRoi(state.roi2),
    fcfHistory: computeHistory(state.fcfHistory),
    revenueHistory: computeHistory(state.revenueHistory),
  };
}

// ============================================================================
// 3. FCF MULTIPLE & 6. DIVIDENDS SHEETS (Same structure)
// ============================================================================
export interface FcfMultipleState {
  company: string; // B1
  marketCap: Num; // E1 (in FCF Multiple) or Market Price E1 (in Dividends)
  dataDate: string; // L1
  baseValue: Num; // B2 (Free Cash Flow or Dividend per share)
  startYear: number; // D4 (2026)
  scenarios: Record<ScenarioKey, ScenarioParams>;
  weights: Record<ScenarioKey, Num>; // E26:E28
  perShareWeights: Record<ScenarioKey, Num>; // E35:E37 (FCF Multiple second table)
  sharesOutstanding: Num; // E41
  marketPrice: Num; // E42
  billionsInput: Num; // N26
  trillionsInput: Num; // N31
  roi1: RoiInput; // R5:R7
  roi2: RoiInput; // R15:R17
  fcfHistory: HistoryInput; // T6:AD7
}

export interface FcfMultipleResult {
  scenarios: Record<ScenarioKey, ScenarioRowResult>;
  primaryTable: WeightedTableResult; // rows 25-30
  perShareTable: WeightedTableResult; // rows 34-39
  billionsToThousands: number;
  trillionsToThousands: number;
  roi1: RoiResult;
  roi2: RoiResult;
  fcfHistory: HistoryResult;
}

export function computeFcfMultiple(state: FcfMultipleState): FcfMultipleResult {
  const scenarios = {} as Record<ScenarioKey, ScenarioRowResult>;
  const rOpt = v(state.scenarios.optimistic.discountRate);

  SCENARIO_KEYS.forEach((key) => {
    const sc = state.scenarios[key];
    // In FCF Multiple & Dividends, all 3 scenarios split after index 5 (E..I vs J..N)
    const projected = project11Years(state.baseValue, sc.growth1to5, sc.growth5to10, 5);
    const years = Array.from({ length: 11 }, (_, i) => state.startYear + i);
    const terminalBase = projected[10]; // O5 = N5
    const mult = v(sc.terminalParam);
    const terminalFuture = terminalBase * mult; // O6 = N5*B8

    const r = v(sc.discountRate);
    const discounted: number[] = [];
    for (let t = 1; t <= 10; t++) {
      discounted.push(projected[t] / Math.pow(1 + r, t));
    }
    // 1:1 Excel formula in O21 (Worst scenario): =O20/(1+$B$5)^10 (uses B5 optimistic discount rate!)
    const termDiscountRate = key === 'worst' ? rOpt : r;
    const terminalPV = terminalFuture / Math.pow(1 + termDiscountRate, 10);
    const sumPV = sum(discounted) + terminalPV; // E9 = SUM(E7:O7)
    const intrinsicValue = sumPV * (1 - v(sc.marginOfSafety)); // H9 = E9*(1-B9)

    scenarios[key] = {
      years,
      projected,
      terminalBase,
      terminalFuture,
      discounted,
      terminalPV,
      sumPV,
      intrinsicValue,
    };
  });

  // Table 1 (rows 25-30)
  const primaryRows: WeightedRow[] = SCENARIO_KEYS.map((key) => {
    const w = state.weights[key];
    const iv = scenarios[key].intrinsicValue;
    return {
      key,
      label: key === 'optimistic' ? 'Optimistic' : key === 'average' ? 'Average' : 'Worst',
      weight: w,
      intrinsicValue: iv,
      weightedValue: v(iv) * v(w),
    };
  });
  const avgPrimary = sum(primaryRows.map((r) => r.weightedValue));
  const primaryTable: WeightedTableResult = {
    rows: primaryRows,
    totalWeight: sum(primaryRows.map((r) => r.weight)),
    averageIntrinsicValue: avgPrimary,
    buySell: signal(avgPrimary, state.marketCap), // K26 = if(H26>E1,"BUY","SELL")
    underOverValued: upside(avgPrimary, state.marketCap), // H30 = H26/E1-1
  };

  // Table 2: Per-share table in FCF Multiple (rows 34-39)
  const shares = v(state.sharesOutstanding);
  const perShareRows: WeightedRow[] = SCENARIO_KEYS.map((key) => {
    const w = state.perShareWeights[key];
    const iv = shares === 0 ? null : v(scenarios[key].intrinsicValue) / shares; // F35 = H9/E41
    return {
      key,
      label: key === 'optimistic' ? 'Optimistic' : key === 'average' ? 'Average' : 'Worst',
      weight: w,
      intrinsicValue: iv,
      weightedValue: v(iv) * v(w),
    };
  });
  const avgPerShare = sum(perShareRows.map((r) => r.weightedValue)); // H35 = sum(G35:G37)
  const perShareTable: WeightedTableResult = {
    rows: perShareRows,
    totalWeight: sum(perShareRows.map((r) => r.weight)),
    averageIntrinsicValue: avgPerShare,
    buySell: signal(avgPerShare, state.marketPrice),
    underOverValued: upside(avgPerShare, state.marketPrice), // H39 = H35/E42-1
  };

  return {
    scenarios,
    primaryTable,
    perShareTable,
    billionsToThousands: v(state.billionsInput) * 1_000_000,
    trillionsToThousands: v(state.trillionsInput) * 1_000_000_000,
    roi1: computeRoi(state.roi1),
    roi2: computeRoi(state.roi2),
    fcfHistory: computeHistory(state.fcfHistory),
  };
}

// ============================================================================
// 4. EV/EBITDA SHEET
// ============================================================================
export interface EvEbitdaState {
  company: string; // B1
  marketPrice: Num; // E1 ("Marcet Price")
  dataDate: string; // L1
  sharesOutstanding: Num; // B2
  startYear: number; // D4 (2026)
  scenarios: Record<ScenarioKey, ScenarioParams>;
  weights: Record<ScenarioKey, Num>; // E26:E28
  marketCapDcf: Num; // E34
  roi1: RoiInput; // R5:R7
  roi2: RoiInput; // R15:R17
  ebitdaHistory: HistoryInput; // T6:AD7
}

export interface EvEbitdaResult {
  scenarios: Record<ScenarioKey, ScenarioRowResult>;
  perShareTable: WeightedTableResult;
  marketCapTable: WeightedTableResult;
  roi1: RoiResult;
  roi2: RoiResult;
  ebitdaHistory: HistoryResult;
}

export function computeEvEbitda(state: EvEbitdaState): EvEbitdaResult {
  const scenarios = {} as Record<ScenarioKey, ScenarioRowResult>;
  const mosOpt = v(state.scenarios.optimistic.marginOfSafety);

  SCENARIO_KEYS.forEach((key) => {
    const sc = state.scenarios[key];
    // 1:1 Excel: Average row 12 splits after H12 (index 4), Optimistic/Worst split after I5/I19 (index 5)
    const splitAfter: 4 | 5 = key === 'average' ? 4 : 5;
    const projected = project11Years(sc.baseMetric, sc.growth1to5, sc.growth5to10, splitAfter);
    const years = Array.from({ length: 11 }, (_, i) => state.startYear + i);
    const terminalBase = projected[10]; // O5 = N5
    const mult = v(sc.terminalParam);
    const terminalFuture = terminalBase * mult; // O6 = O5*B8

    const r = v(sc.discountRate);
    const discounted: number[] = [];
    for (let t = 1; t <= 10; t++) {
      discounted.push(projected[t] / Math.pow(1 + r, t));
    }
    const terminalPV = terminalFuture / Math.pow(1 + r, 10); // O7 = O6/(1+$B$5)^10
    // In EV/EBITDA: E9 = O7, E16 = O14, E23 = O21 (only terminalPV, not SUM!)
    const sumPV = terminalPV;
    const shares = v(state.sharesOutstanding);
    // 1:1 Excel: H9 = (E9/B2)*(1-B9), H16 = (E16/B2)*(1-B9) [uses B9!], H23 = (E23/B2)*(1-B23)
    const mos = key === 'worst' ? v(sc.marginOfSafety) : mosOpt;
    const intrinsicValue =
      shares === 0 ? null : (sumPV / shares) * (1 - mos);

    scenarios[key] = {
      years,
      projected,
      terminalBase,
      terminalFuture,
      discounted,
      terminalPV,
      sumPV,
      intrinsicValue,
    };
  });

  // Per-share table (rows 25-30)
  const perShareRows: WeightedRow[] = SCENARIO_KEYS.map((key) => {
    const w = state.weights[key];
    const iv = scenarios[key].intrinsicValue;
    return {
      key,
      label: key === 'optimistic' ? 'Optimistic' : key === 'average' ? 'Average' : 'Worst',
      weight: w,
      intrinsicValue: iv,
      weightedValue: v(iv) * v(w),
    };
  });
  const avgIV = sum(perShareRows.map((r) => r.weightedValue));
  const perShareTable: WeightedTableResult = {
    rows: perShareRows,
    totalWeight: sum(perShareRows.map((r) => r.weight)),
    averageIntrinsicValue: avgIV,
    buySell: signal(avgIV, state.marketPrice), // K26 = if(H26>E1,"BUY","SELL")
    underOverValued: upside(avgIV, state.marketPrice), // H30 = H26/E1-1
  };

  // Market Cap DCF table (rows 36-41, weights E37:E39 mirror E26:E28)
  const mcRows: WeightedRow[] = SCENARIO_KEYS.map((key) => {
    const w = state.weights[key];
    const iv = scenarios[key].sumPV; // F37=E9, F38=E16, F39=E23
    return {
      key,
      label: key === 'optimistic' ? 'Optimistic' : key === 'average' ? 'Average' : 'Worst',
      weight: w,
      intrinsicValue: iv,
      weightedValue: v(iv) * v(w),
    };
  });
  // H37 = sum(G37:G39)*(1-B23)
  const avgMcIV =
    sum(mcRows.map((r) => r.weightedValue)) *
    (1 - v(state.scenarios.worst.marginOfSafety));
  const marketCapTable: WeightedTableResult = {
    rows: mcRows,
    totalWeight: sum(mcRows.map((r) => r.weight)),
    averageIntrinsicValue: avgMcIV,
    // 1:1 Excel: K37 = if(H37>E10,"BUY","SELL") where E10 is empty (0), so H37>0 => "BUY"
    buySell: signal(avgMcIV, 0),
    underOverValued: upside(avgMcIV, state.marketCapDcf), // H41 = H37/E34-1
  };

  return {
    scenarios,
    perShareTable,
    marketCapTable,
    roi1: computeRoi(state.roi1),
    roi2: computeRoi(state.roi2),
    ebitdaHistory: computeHistory(state.ebitdaHistory),
  };
}

// ============================================================================
// 5. P/E & 9. RANDOM MULTIPLE SHEETS (Backwards-discounted exit multiple)
// ============================================================================
export interface PeSheetState {
  company: string; // B1
  marketPrice: Num; // E1 (Market Price in PE, Market Cap in Random Multiple)
  dataDate: string; // L1
  baseValue: Num; // B2 (EPS TTM in PE, Revenue in Random Multiple)
  startYear: number; // D4 (2026)
  scenarios: Record<ScenarioKey, ScenarioParams>;
  weights: Record<ScenarioKey, Num>; // E26:E28
  roi1: RoiInput; // Q5:Q7
  roi2: RoiInput; // Q15:Q17
  peHistory: HistoryInput; // S6:AC7 (used in PE sheet)
  verticalHistory: { year: number; value: Num }[]; // U5:U15 (11 rows, used in Random Multiple)
}

export interface VerticalHistoryRow {
  label: string;
  year: number;
  value: Num;
  yoyLabel: string;
  yoy: Num;
}

export interface PeSheetResult {
  scenarios: Record<ScenarioKey, ScenarioRowResult>;
  summaryTable: WeightedTableResult;
  roi1: RoiResult;
  roi2: RoiResult;
  peHistory: HistoryResult;
  verticalRows: VerticalHistoryRow[];
  verticalAverage: Num;
  verticalAverageGrowth: Num;
}

export function computePeSheet(
  state: PeSheetState,
  applyWorstMos: boolean
): PeSheetResult {
  const scenarios = {} as Record<ScenarioKey, ScenarioRowResult>;

  SCENARIO_KEYS.forEach((key) => {
    const sc = state.scenarios[key];
    // 1:1 Excel: Average row 12 splits after H12 (index 4), Optimistic/Worst split after I5/I19 (index 5)
    const splitAfter: 4 | 5 = key === 'average' ? 4 : 5;
    const projected = project11Years(state.baseValue, sc.growth1to5, sc.growth5to10, splitAfter);
    const years = Array.from({ length: 11 }, (_, i) => state.startYear + i);
    const mult = v(sc.terminalParam);
    const r = v(sc.discountRate);

    // Row 7/14/21: N7 = N5 * B8, and backwards D7..M7: col[k] = col[k+1] / (1 + r)
    const discounted = new Array<number>(11).fill(0);
    discounted[10] = projected[10] * mult;
    for (let i = 9; i >= 0; i--) {
      discounted[i] = discounted[i + 1] / (1 + r);
    }

    const d7 = discounted[0];
    // 1:1 Excel: In PE sheet, H23 = D21 (no margin of safety!). In Random Multiple, H23 = D21*(1-B23).
    const intrinsicValue =
      key === 'worst' && !applyWorstMos
        ? d7
        : d7 * (1 - v(sc.marginOfSafety));

    scenarios[key] = {
      years,
      projected,
      terminalBase: projected[10],
      terminalFuture: discounted[10],
      discounted,
      terminalPV: d7,
      sumPV: d7,
      intrinsicValue,
    };
  });

  const rows: WeightedRow[] = SCENARIO_KEYS.map((key) => {
    const w = state.weights[key];
    const iv = scenarios[key].intrinsicValue;
    return {
      key,
      label: key === 'optimistic' ? 'Optimistic' : key === 'average' ? 'Average' : 'Worst',
      weight: w,
      intrinsicValue: iv,
      weightedValue: v(iv) * v(w),
    };
  });
  const avgIV = sum(rows.map((r) => r.weightedValue));
  const summaryTable: WeightedTableResult = {
    rows,
    totalWeight: sum(rows.map((r) => r.weight)),
    averageIntrinsicValue: avgIV,
    buySell: signal(avgIV, state.marketPrice), // K26 = if(H26>E1,"BUY","SELL")
    underOverValued: upside(avgIV, state.marketPrice), // H30 = H26/E1-1
  };

  // Vertical history (Random Multiple right-hand table, U5:U15)
  const verticalRows: VerticalHistoryRow[] = state.verticalHistory.map((item, idx) => {
    const next = state.verticalHistory[idx + 1];
    let yoy: Num = null;
    if (idx < 10 && next && isNum(item.value) && isNum(next.value) && next.value !== 0) {
      yoy = (item.value - next.value) / Math.abs(next.value); // (U5-U6)/ABS(U6)
    }
    const yearNum = 10 - idx;
    return {
      label: idx <= 10 ? (yearNum >= 0 ? `Year ${yearNum}` : '') : '',
      year: item.year,
      value: item.value,
      yoyLabel: idx < 10 ? `Y${9 - idx} to Y${10 - idx}` : '',
      yoy,
    };
  });

  return {
    scenarios,
    summaryTable,
    roi1: computeRoi(state.roi1),
    roi2: computeRoi(state.roi2),
    peHistory: computeHistory(state.peHistory),
    verticalRows,
    verticalAverage: average(state.verticalHistory.slice(0, 11).map((x) => x.value)),
    verticalAverageGrowth: average(verticalRows.slice(0, 10).map((x) => x.yoy)),
  };
}

// ============================================================================
// 7. PETER LYNCH FAIR VALUE SHEET
// ============================================================================
export interface PeterLynchState {
  ticker: string; // C6
  dataDate: string; // I6
  years5: number[]; // C9:H9 (6 years: 2020..2025)
  netIncome5: Num[]; // C10:H10 (6 values)
  growthRateInput: Num; // C14 (in percent, e.g. 16.04)
  epsTtm: Num; // D14
  peg: Num; // E14
  stockPrice: Num; // G14
  netIncome10: HistoryInput; // K6:U7 + V7 average override if needed
}

export interface PeterLynchResult {
  avg5YNetIncome: Num; // I10 = AVERAGE(D10:H10) (last 5 of the 6 columns!)
  yoy5: Num[]; // D11:H11 (5 YoY values)
  avg5YGrowth: Num; // I11 = AVERAGE(C11:H11)
  fairPrice: number; // F14 = C14 * D14 * E14
  difference: Num; // H14 = F14 / G14 - 1
  buySell: 'BUY' | 'SELL'; // I13 = if(F14>G14,"BUY","SELL")
  netIncome10: HistoryResult;
}

export function computePeterLynch(state: PeterLynchState): PeterLynchResult {
  // I10 = AVERAGE(D10:H10) -> indices 1..5
  const avg5YNetIncome = average(state.netIncome5.slice(1, 6));
  const yoy5: Num[] = [];
  for (let i = 1; i < 6; i++) {
    const prev = state.netIncome5[i - 1];
    const cur = state.netIncome5[i];
    if (!isNum(prev) || prev === 0 || !isNum(cur)) {
      yoy5.push(null);
    } else {
      yoy5.push((cur - prev) / Math.abs(prev));
    }
  }
  const avg5YGrowth = average(yoy5);
  const fairPrice = v(state.growthRateInput) * v(state.epsTtm) * v(state.peg);
  const difference = upside(fairPrice, state.stockPrice);
  const buySell = signal(fairPrice, state.stockPrice);

  return {
    avg5YNetIncome,
    yoy5,
    avg5YGrowth,
    fairPrice,
    difference,
    buySell,
    netIncome10: computeHistory(state.netIncome10),
  };
}

// ============================================================================
// 8. MULTIPLE MODELS (PEER COMPARISON) SHEET
// ============================================================================
export interface PeerCompany {
  ticker: string;
  company: string;
  stockPrice: Num;
  eps: Num;
}

export interface MultipleModelsState {
  peers: PeerCompany[]; // Rows 6..9 (4 peers by default, extensible)
  targetTicker: string; // D15
  targetCompany: string; // E15
  targetCurrentPrice: Num; // F15
  targetEps: Num; // G15
}

export interface MultipleModelsResult {
  peerMultiples: Num[]; // H6:H9 = F6/G6
  averagePe: Num; // H11 = average(H6:H9)
  medianPe: Num; // H12 = median(H6:H9)
  impliedStockPrice: number; // H15 = H11 * G15
  upsidePct: Num;
  buySell: 'BUY' | 'SELL';
}

export function computeMultipleModels(
  state: MultipleModelsState
): MultipleModelsResult {
  const peerMultiples = state.peers.map((p) => div(p.stockPrice, p.eps));
  const averagePe = average(peerMultiples);
  const medianPe = median(peerMultiples);
  const impliedStockPrice = v(averagePe) * v(state.targetEps);
  return {
    peerMultiples,
    averagePe,
    medianPe,
    impliedStockPrice,
    upsidePct: upside(impliedStockPrice, state.targetCurrentPrice),
    buySell: signal(impliedStockPrice, state.targetCurrentPrice),
  };
}

// ============================================================================
// 10. STOCK VALUATION (SUMMARY & FINANCIAL RATIOS) SHEET
// ============================================================================
export interface StockValuationState {
  company: string; // B1
  ticker: string; // B2
  dataDate: string; // F1
  industry: string; // B3
  sector: string; // B4
  currentPrice: Num; // B7
  low52: Num; // B8
  high52: Num; // C8
  marketCap: Num; // B9
  peRatio: Num; // B10
  peComment: string; // C10 ("Високо")
  priceToFcf: Num; // B11
  dividendYield: string; // B12
  dividendPayoutRatio: string; // B13
  cashDividendPayoutRatio: string; // B14
  dividendGrowth5to10: string; // B15
  roi5YAnnualized: Num; // B16 (=Overview!J19)
  roi10YAnnualized: Num; // B17 (=Overview!J29)
  sharesOutstanding: Num; // B18
  revenue: Num; // B19
  revenueAvgIncrease3to5: Num; // B20
  grossProfitMargin: Num; // B21
  rdRatio: Num; // B22
  sgaRatio: Num; // B23
  eps: Num; // B24
  epsGrowth5to10: Num; // B25
  netIncome: Num; // B26
  netProfitMargin: Num; // B27
  roe: Num; // B28
  roa: Num; // B29
  roic: Num; // B30
  currentRatio: Num; // B31
  longTermDebt: Num; // B32
  avgDebtIncrease10Y: Num; // B33
  longTermDebtToEquity: Num; // B34
  debtToEquity: Num; // B35
  cashFlowFromOperations: Num; // B36
  cffoIncrease5to10: Num; // B37
  freeCashFlow: Num; // B38
  fcfIncrease5to10: Num; // B39
  cashFlowCoverageRatio: Num; // B45
  operatingCashFlowRatio: Num; // B46
  cashRoa: Num; // B47
  // Model weights (D48:D53) & manual override for Multiple (B53)
  useLinkedModels: boolean;
  manualModels: {
    dcf: Num; // B48
    fcfMultiple: Num; // B49
    evEbitda: Num; // B50
    pe: Num; // B51
    dividend: Num; // B52
    multiple: Num; // B53
  };
  modelWeights: {
    dcf: Num; // D48 (0.3)
    fcfMultiple: Num; // D49 (0.3)
    evEbitda: Num; // D50 (0.2)
    pe: Num; // D51 (0.2)
    dividend: Num; // D52 (0)
    multiple: Num; // D53 (0)
  };
  roi1: RoiInput; // F6:F8
  roi2: RoiInput; // F16:F18
  roi3: RoiInput; // F491:F493
  roi4: RoiInput; // F499:F501
}

export interface StockValuationResult {
  cashFlowMargin: Num; // B40 = B36/B19
  freeCashFlowMargin: Num; // B41 = B38/B19
  freeCashFlowYield: Num; // B42 = 1*(B38/B9)
  earningsYield: Num; // B43 = B24/B7
  fcfToNetIncome: Num; // B44 = B38/B26
  modelValues: {
    dcf: Num;
    fcfMultiple: Num;
    evEbitda: Num;
    pe: Num;
    dividend: Num;
    multiple: Num;
  };
  weightedProducts: {
    dcf: number; // B55 = B48*D48
    fcfMultiple: number; // B56 = B49*D49
    evEbitda: number; // B57 = B50*D50
    pe: number; // B58 = B51*D51
    dividend: number; // (Note: in Excel B59 is B53*D53, skipping B52*D52!)
    multiple: number; // B59 = B53*D53
  };
  totalWeight: number; // D54 = sum(D48:D53)
  averageFairValue: number; // B54 = SUM(B55:C59) / B60 = SUM(B55:B59)
  underOverValued: Num; // B5 = B54/B7-1
  buySell: 'BUY' | 'SELL';
  roi1: RoiResult;
  roi2: RoiResult;
  roi3: RoiResult;
  roi4: RoiResult;
}

export function computeStockValuation(
  state: StockValuationState,
  linked?: {
    dcf?: Num;
    fcfMultiple?: Num;
    evEbitda?: Num;
    pe?: Num;
    dividend?: Num;
  }
): StockValuationResult {
  const cashFlowMargin = div(state.cashFlowFromOperations, state.revenue);
  const freeCashFlowMargin = div(state.freeCashFlow, state.revenue);
  const freeCashFlowYield = div(state.freeCashFlow, state.marketCap);
  const earningsYield = div(state.eps, state.currentPrice);
  const fcfToNetIncome = div(state.freeCashFlow, state.netIncome);

  const modelValues = {
    dcf: state.useLinkedModels && linked?.dcf !== undefined ? linked.dcf : state.manualModels.dcf,
    fcfMultiple:
      state.useLinkedModels && linked?.fcfMultiple !== undefined
        ? linked.fcfMultiple
        : state.manualModels.fcfMultiple,
    evEbitda:
      state.useLinkedModels && linked?.evEbitda !== undefined
        ? linked.evEbitda
        : state.manualModels.evEbitda,
    pe: state.useLinkedModels && linked?.pe !== undefined ? linked.pe : state.manualModels.pe,
    dividend:
      state.useLinkedModels && linked?.dividend !== undefined
        ? linked.dividend
        : state.manualModels.dividend,
    multiple: state.manualModels.multiple,
  };

  const weightedProducts = {
    dcf: v(modelValues.dcf) * v(state.modelWeights.dcf),
    fcfMultiple: v(modelValues.fcfMultiple) * v(state.modelWeights.fcfMultiple),
    evEbitda: v(modelValues.evEbitda) * v(state.modelWeights.evEbitda),
    pe: v(modelValues.pe) * v(state.modelWeights.pe),
    dividend: v(modelValues.dividend) * v(state.modelWeights.dividend),
    multiple: v(modelValues.multiple) * v(state.modelWeights.multiple),
  };

  // 1:1 Excel B54 = SUM(B55:B59) where B55..B58 are DCF, FCF, EV/EBITDA, PE and B59 is B53*D53 (Multiple)
  // Plus if user puts weight in D52 (Dividend), we include it if non-zero (in Excel D52=0 so it's identical).
  const averageFairValue =
    weightedProducts.dcf +
    weightedProducts.fcfMultiple +
    weightedProducts.evEbitda +
    weightedProducts.pe +
    weightedProducts.dividend +
    weightedProducts.multiple;

  const totalWeight =
    v(state.modelWeights.dcf) +
    v(state.modelWeights.fcfMultiple) +
    v(state.modelWeights.evEbitda) +
    v(state.modelWeights.pe) +
    v(state.modelWeights.dividend) +
    v(state.modelWeights.multiple);

  const underOverValued = upside(averageFairValue, state.currentPrice);

  return {
    cashFlowMargin,
    freeCashFlowMargin,
    freeCashFlowYield,
    earningsYield,
    fcfToNetIncome,
    modelValues,
    weightedProducts,
    totalWeight,
    averageFairValue,
    underOverValued,
    buySell: signal(averageFairValue, state.currentPrice),
    roi1: computeRoi(state.roi1),
    roi2: computeRoi(state.roi2),
    roi3: computeRoi(state.roi3),
    roi4: computeRoi(state.roi4),
  };
}
