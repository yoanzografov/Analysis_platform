import { FinancialStatementRow, FinancialStatementTable } from '../types/stockAnalysis';

export interface YahooTsRecord {
  date: Date | string | number;
  [key: string]: any;
}

export interface ParsedStatementsBundle {
  incomeStatement: FinancialStatementTable;
  balanceSheet: FinancialStatementTable;
  cashFlow: FinancialStatementTable;
  ratios: FinancialStatementTable;
  kpis: FinancialStatementTable;
  quarterlyIncomeStatement: FinancialStatementTable;
  quarterlyBalanceSheet: FinancialStatementTable;
  quarterlyCashFlow: FinancialStatementTable;
  quarterlyRatios: FinancialStatementTable;
  trailingIncomeStatement: FinancialStatementTable;
  trailingCashFlow: FinancialStatementTable;
  trailingRatios: FinancialStatementTable;
  latestTtm: {
    revenue: number | null;
    grossProfit: number | null;
    operatingIncome: number | null;
    netIncome: number | null;
    operatingCashFlow: number | null;
    freeCashFlow: number | null;
    totalCash: number | null;
    totalDebt: number | null;
    totalAssets: number | null;
    stockholdersEquity: number | null;
    sharesDiluted: number | null;
    epsDiluted: number | null;
  };
}

function toDate(d: Date | string | number | undefined): Date | null {
  if (d === undefined || d === null) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  if (typeof d === 'number') {
    const ms = d < 1e12 ? d * 1000 : d;
    const dt = new Date(ms);
    return isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
}

function formatPeriodEnd(dt: Date): string {
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function getQuarterLabel(dt: Date): string {
  const month = dt.getUTCMonth() + 1;
  const year = dt.getUTCFullYear();
  const q = Math.ceil(month / 3);
  return `Q${q} ${year}`;
}

function num(rec: YahooTsRecord | undefined, ...keys: string[]): number | null {
  if (!rec) return null;
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === 'number' && !isNaN(v) && isFinite(v)) return v;
  }
  return null;
}

function sortDescByDate(records: YahooTsRecord[]): YahooTsRecord[] {
  return [...records]
    .filter(r => toDate(r.date) !== null)
    .sort((a, b) => (toDate(b.date)!.getTime() - toDate(a.date)!.getTime()));
}

function buildGrowthRow(
  periods: string[],
  parentValues: Record<string, number | null>,
  name: string,
  key: string
): FinancialStatementRow {
  const values: Record<string, number | null> = {};
  for (let i = 0; i < periods.length; i++) {
    const p = periods[i];
    const nextPeriod = periods[i + 1];
    const cur = parentValues[p];
    const prev = nextPeriod ? parentValues[nextPeriod] : null;
    if (cur !== null && prev !== null && prev !== 0) {
      values[p] = parseFloat((((cur - prev) / Math.abs(prev)) * 100).toFixed(1));
    } else {
      values[p] = null;
    }
  }
  return { name, key, indent: 1, format: 'percent', values };
}

function buildMarginRow(
  periods: string[],
  numerator: Record<string, number | null>,
  denominator: Record<string, number | null>,
  name: string,
  key: string
): FinancialStatementRow {
  const values: Record<string, number | null> = {};
  for (const p of periods) {
    const n = numerator[p];
    const d = denominator[p];
    if (n !== null && d !== null && d !== 0) {
      values[p] = parseFloat(((n / d) * 100).toFixed(1));
    } else {
      values[p] = null;
    }
  }
  return { name, key, indent: 1, format: 'percent', values };
}

function extractRow(
  periods: string[],
  byPeriod: Record<string, YahooTsRecord>,
  name: string,
  key: string,
  opts: { isBold?: boolean; indent?: number; format?: 'currency' | 'percent' | 'number' },
  extractor: (rec: YahooTsRecord | undefined) => number | null
): FinancialStatementRow {
  const values: Record<string, number | null> = {};
  for (const p of periods) {
    values[p] = extractor(byPeriod[p]);
  }
  return { name, key, ...opts, values };
}

export function buildStatementsFromYahoo(
  annualRaw: YahooTsRecord[],
  quarterlyRaw: YahooTsRecord[],
  trailingRaw: YahooTsRecord[],
  marketCtx: {
    currentPrice: number;
    marketCap: number;
    employees?: number | null;
  }
): ParsedStatementsBundle | null {
  const annualSorted = sortDescByDate(annualRaw).filter(
    r => num(r, 'totalRevenue', 'netIncome', 'totalAssets', 'operatingCashFlow') !== null
  );
  const quarterlySorted = sortDescByDate(quarterlyRaw).filter(
    r => num(r, 'totalRevenue', 'netIncome', 'totalAssets', 'operatingCashFlow') !== null
  );
  const trailingSorted = sortDescByDate(trailingRaw).filter(
    r => num(r, 'totalRevenue', 'netIncome', 'operatingCashFlow') !== null
  );

  if (annualSorted.length === 0 && quarterlySorted.length === 0) {
    return null;
  }

  // --- Map Annual + Latest TTM ---
  const annualPeriods: string[] = [];
  const annualEndDates: Record<string, string> = {};
  const annualByPeriod: Record<string, YahooTsRecord> = {};

  // Build or enrich TTM record using trailingSorted[0] and summing last 4 quarters for any missing flow fields
  let latestTtmRec: YahooTsRecord | undefined = trailingSorted[0] ? { ...trailingSorted[0] } : undefined;
  if (quarterlySorted.length >= 4) {
    const last4Q = quarterlySorted.slice(0, 4);
    const flowKeys = [
      'totalRevenue', 'operatingRevenue', 'costOfRevenue', 'reconciledCostOfRevenue',
      'grossProfit', 'researchAndDevelopment', 'sellingGeneralAndAdministration',
      'operatingExpense', 'operatingIncome', 'totalOperatingIncomeAsReported',
      'interestExpense', 'interestExpenseNonOperating', 'netInterestIncome',
      'pretaxIncome', 'taxProvision', 'netIncome', 'netIncomeCommonStockholders',
      'netIncomeContinuousOperations', 'depreciationAndAmortization',
      'depreciationAmortizationDepletion', 'reconciledDepreciation',
      'stockBasedCompensation', 'changeInWorkingCapital', 'operatingCashFlow',
      'cashFlowFromContinuingOperatingActivities', 'capitalExpenditure', 'purchaseOfPPE',
      'freeCashFlow', 'cashDividendsPaid', 'commonStockDividendPaid',
      'repurchaseOfCapitalStock', 'commonStockPayments', 'investingCashFlow',
      'cashFlowFromContinuingInvestingActivities', 'financingCashFlow',
      'cashFlowFromContinuingFinancingActivities', 'changesInCash', 'dilutedEPS', 'basicEPS'
    ];
    if (!latestTtmRec) {
      latestTtmRec = { date: last4Q[0].date };
    }
    for (const fk of flowKeys) {
      if (latestTtmRec[fk] === undefined || latestTtmRec[fk] === null) {
        const vals = last4Q.map(q => q[fk]).filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
        if (vals.length === 4) {
          latestTtmRec[fk] = vals.reduce((a, b) => a + b, 0);
        }
      }
    }
    // Share counts are point-in-time / latest-quarter averages
    for (const sk of ['dilutedAverageShares', 'basicAverageShares', 'ordinarySharesNumber', 'shareIssued']) {
      if (latestTtmRec[sk] === undefined || latestTtmRec[sk] === null) {
        const latestVal = last4Q.map(q => q[sk]).find((v): v is number => typeof v === 'number' && Number.isFinite(v));
        if (latestVal !== undefined) latestTtmRec[sk] = latestVal;
      }
    }
  }

  if (latestTtmRec && num(latestTtmRec, 'totalRevenue', 'operatingRevenue', 'netIncome', 'operatingCashFlow') !== null) {
    annualPeriods.push('TTM');
    const dt = toDate(latestTtmRec.date)!;
    annualEndDates['TTM'] = formatPeriodEnd(dt);
    annualByPeriod['TTM'] = latestTtmRec;
  }

  for (const rec of annualSorted) {
    if (annualPeriods.length >= 11) break;
    const dt = toDate(rec.date)!;
    const yr = String(dt.getUTCFullYear());
    if (!annualByPeriod[yr]) {
      annualPeriods.push(yr);
      annualEndDates[yr] = formatPeriodEnd(dt);
      annualByPeriod[yr] = rec;
    }
  }

  // --- Map Quarterly ---
  const quarterlyPeriods: string[] = [];
  const quarterlyEndDates: Record<string, string> = {};
  const quarterlyByPeriod: Record<string, YahooTsRecord> = {};

  for (const rec of quarterlySorted.slice(0, 12)) {
    const dt = toDate(rec.date)!;
    const lbl = getQuarterLabel(dt);
    if (!quarterlyByPeriod[lbl]) {
      quarterlyPeriods.push(lbl);
      quarterlyEndDates[lbl] = formatPeriodEnd(dt);
      quarterlyByPeriod[lbl] = rec;
    }
  }

  // Strict component-based calculation helpers (consistent across all statements & ratios)
  const calcRevenue = (r: YahooTsRecord | undefined) => num(r, 'totalRevenue', 'operatingRevenue');
  const calcCostOfRev = (r: YahooTsRecord | undefined) => num(r, 'costOfRevenue', 'reconciledCostOfRevenue');
  const calcGrossProfit = (r: YahooTsRecord | undefined) => {
    const rev = calcRevenue(r);
    const cor = calcCostOfRev(r);
    return (rev !== null && cor !== null) ? (rev - cor) : num(r, 'grossProfit');
  };
  const calcEbit = (r: YahooTsRecord | undefined) => num(r, 'operatingIncome', 'totalOperatingIncomeAsReported');
  const calcDa = (r: YahooTsRecord | undefined) => num(r, 'depreciationAndAmortization', 'depreciationAmortizationDepletion', 'reconciledDepreciation');
  const calcEbitda = (r: YahooTsRecord | undefined) => {
    const ebit = calcEbit(r);
    const da = calcDa(r);
    return (ebit !== null && da !== null) ? (ebit + da) : num(r, 'EBITDA', 'normalizedEBITDA');
  };
  const calcTotalDebt = (r: YahooTsRecord | undefined) => {
    const direct = num(r, 'totalDebt');
    if (direct !== null) return direct;
    const st = num(r, 'currentDebt', 'currentDebtAndCapitalLeaseObligation');
    const lt = num(r, 'longTermDebt', 'longTermDebtAndCapitalLeaseObligation');
    if (st !== null && lt !== null) return st + lt;
    return lt ?? st;
  };
  const calcOcf = (r: YahooTsRecord | undefined) => num(r, 'operatingCashFlow', 'cashFlowFromContinuingOperatingActivities');
  const calcCapex = (r: YahooTsRecord | undefined) => num(r, 'capitalExpenditure', 'purchaseOfPPE');
  const calcFcf = (r: YahooTsRecord | undefined) => {
    const ocf = calcOcf(r);
    const capex = calcCapex(r);
    return (ocf !== null && capex !== null) ? (ocf - Math.abs(capex)) : num(r, 'freeCashFlow');
  };

  // Helper to build Income Statement for given periods & map
  const makeIncome = (periods: string[], endDates: Record<string, string>, map: Record<string, YahooTsRecord>): FinancialStatementTable => {
    const revRow = extractRow(periods, map, 'Revenue', 'revenue', { isBold: true, format: 'currency' }, calcRevenue);
    const corRow = extractRow(periods, map, 'Cost of Revenue', 'cor', { indent: 1, format: 'currency' }, calcCostOfRev);
    const gpRow = extractRow(periods, map, 'Gross Profit', 'gross_profit', { isBold: true, format: 'currency' }, calcGrossProfit);
    const rndRow = extractRow(periods, map, 'Research & Development (R&D)', 'rnd', { indent: 1, format: 'currency' }, r => num(r, 'researchAndDevelopment'));
    const sgaRow = extractRow(periods, map, 'Selling, General & Admin (SG&A)', 'sga', { indent: 1, format: 'currency' }, r => num(r, 'sellingGeneralAndAdministration'));
    const opExpRow = extractRow(periods, map, 'Total Operating Expenses', 'total_op_exp', { isBold: true, format: 'currency' }, r => num(r, 'operatingExpense'));
    const ebitRow = extractRow(periods, map, 'Operating Income (EBIT)', 'ebit', { isBold: true, format: 'currency' }, calcEbit);
    const intRow = extractRow(periods, map, 'Interest Expense / (Income)', 'interest_exp', { indent: 1, format: 'currency' }, r => num(r, 'interestExpense', 'interestExpenseNonOperating', 'netInterestIncome'));
    const ebtRow = extractRow(periods, map, 'Pretax Income (EBT)', 'ebt', { isBold: true, format: 'currency' }, r => num(r, 'pretaxIncome'));
    const taxRow = extractRow(periods, map, 'Income Tax', 'income_tax', { indent: 1, format: 'currency' }, r => num(r, 'taxProvision'));
    const niRow = extractRow(periods, map, 'Net Income', 'net_income', { isBold: true, format: 'currency' }, r => num(r, 'netIncome', 'netIncomeCommonStockholders', 'netIncomeContinuousOperations'));
    const sharesRow = extractRow(periods, map, 'Shares Outstanding (Diluted)', 'shares_diluted', { indent: 1, format: 'number' }, r => num(r, 'dilutedAverageShares', 'basicAverageShares'));
    const epsRow = extractRow(periods, map, 'EPS (Diluted)', 'eps_diluted', { isBold: true, format: 'currency' }, r => num(r, 'dilutedEPS', 'basicEPS'));
    const ebitdaRow = extractRow(periods, map, 'EBITDA', 'ebitda', { isBold: true, format: 'currency' }, calcEbitda);

    const rows: FinancialStatementRow[] = [
      revRow,
      buildGrowthRow(periods, revRow.values, 'Revenue Growth (YoY)', 'revenue_growth'),
      corRow,
      gpRow,
      buildGrowthRow(periods, gpRow.values, 'Gross Profit Growth (YoY)', 'gross_profit_growth'),
      buildMarginRow(periods, gpRow.values, revRow.values, 'Gross Margin', 'gross_margin'),
      { name: 'Operating Expenses', key: 'op_exp_header', isHeader: true, values: {} },
      rndRow,
      sgaRow,
      opExpRow,
      ebitRow,
      buildGrowthRow(periods, ebitRow.values, 'Operating Income Growth (YoY)', 'ebit_growth'),
      buildMarginRow(periods, ebitRow.values, revRow.values, 'Operating Margin', 'oper_margin'),
      intRow,
      ebtRow,
      taxRow,
      niRow,
      buildGrowthRow(periods, niRow.values, 'Net Income Growth (YoY)', 'net_income_growth'),
      buildMarginRow(periods, niRow.values, revRow.values, 'Net Profit Margin', 'net_margin'),
      sharesRow,
      epsRow,
      buildGrowthRow(periods, epsRow.values, 'EPS Growth (YoY)', 'eps_growth'),
      ebitdaRow,
      buildMarginRow(periods, ebitdaRow.values, revRow.values, 'EBITDA Margin', 'ebitda_margin'),
    ];
    return { periods, periodEndDates: endDates, rows };
  };

  // Helper to build Balance Sheet
  const makeBalance = (periods: string[], endDates: Record<string, string>, map: Record<string, YahooTsRecord>): FinancialStatementTable => {
    const cashRow = extractRow(periods, map, 'Cash & Cash Equivalents', 'cash_equiv', { indent: 1, format: 'currency' }, r => num(r, 'cashAndCashEquivalents', 'cashEquivalents'));
    const stInvRow = extractRow(periods, map, 'Short-Term Investments', 'st_investments', { indent: 1, format: 'currency' }, r => num(r, 'otherShortTermInvestments'));
    const totalCashRow = extractRow(periods, map, 'Total Cash & Short-Term Investments', 'total_cash', { isBold: true, format: 'currency' }, r => num(r, 'cashCashEquivalentsAndShortTermInvestments', 'cashAndCashEquivalents', 'cashEquivalents'));
    const arRow = extractRow(periods, map, 'Accounts Receivable', 'accounts_receivable', { indent: 1, format: 'currency' }, r => num(r, 'accountsReceivable', 'receivables'));
    const invRow = extractRow(periods, map, 'Inventory', 'inventory', { indent: 1, format: 'currency' }, r => num(r, 'inventory'));
    const currAssetsRow = extractRow(periods, map, 'Total Current Assets', 'current_assets', { isBold: true, format: 'currency' }, r => num(r, 'currentAssets'));
    const ppeRow = extractRow(periods, map, 'Property, Plant & Equipment (Net)', 'net_ppe', { indent: 1, format: 'currency' }, r => num(r, 'netPPE'));
    const gwRow = extractRow(periods, map, 'Goodwill & Intangibles', 'goodwill_intangibles', { indent: 1, format: 'currency' }, r => num(r, 'goodwillAndOtherIntangibleAssets', 'goodwill'));
    const assetsRow = extractRow(periods, map, 'Total Assets', 'total_assets', { isBold: true, format: 'currency' }, r => num(r, 'totalAssets'));

    const apRow = extractRow(periods, map, 'Accounts Payable', 'accounts_payable', { indent: 1, format: 'currency' }, r => num(r, 'accountsPayable'));
    const stDebtRow = extractRow(periods, map, 'Short-Term / Current Debt', 'st_debt', { indent: 1, format: 'currency' }, r => num(r, 'currentDebt', 'currentDebtAndCapitalLeaseObligation'));
    const currLiabRow = extractRow(periods, map, 'Total Current Liabilities', 'current_liabilities', { isBold: true, format: 'currency' }, r => num(r, 'currentLiabilities'));
    const ltDebtRow = extractRow(periods, map, 'Long-Term Debt', 'lt_debt', { indent: 1, format: 'currency' }, r => num(r, 'longTermDebt', 'longTermDebtAndCapitalLeaseObligation'));
    const totalDebtRow = extractRow(periods, map, 'Total Debt', 'total_debt', { isBold: true, format: 'currency' }, calcTotalDebt);
    const totalLiabRow = extractRow(periods, map, 'Total Liabilities', 'total_liabilities', { isBold: true, format: 'currency' }, r => num(r, 'totalLiabilitiesNetMinorityInterest'));
    const retainedRow = extractRow(periods, map, 'Retained Earnings', 'retained_earnings', { indent: 1, format: 'currency' }, r => num(r, 'retainedEarnings'));
    const equityRow = extractRow(periods, map, 'Total Stockholders\' Equity', 'equity', { isBold: true, format: 'currency' }, r => num(r, 'stockholdersEquity', 'commonStockEquity'));

    const netCashRow: FinancialStatementRow = {
      name: 'Net Cash / (Debt)',
      key: 'net_cash',
      isBold: true,
      format: 'currency',
      values: Object.fromEntries(
        periods.map(p => {
          const c = totalCashRow.values[p];
          const d = totalDebtRow.values[p];
          return [p, c !== null && d !== null ? c - d : null];
        })
      ),
    };

    const bvpsRow: FinancialStatementRow = {
      name: 'Book Value Per Share',
      key: 'bv_per_share',
      indent: 1,
      format: 'currency',
      values: Object.fromEntries(
        periods.map(p => {
          const eq = equityRow.values[p];
          const sh = num(map[p], 'ordinarySharesNumber', 'shareIssued', 'dilutedAverageShares');
          return [p, eq !== null && sh !== null && sh > 0 ? parseFloat((eq / sh).toFixed(2)) : null];
        })
      ),
    };

    const rows: FinancialStatementRow[] = [
      { name: 'Assets', key: 'assets_header', isHeader: true, values: {} },
      cashRow,
      stInvRow,
      totalCashRow,
      arRow,
      invRow,
      currAssetsRow,
      ppeRow,
      gwRow,
      assetsRow,
      { name: 'Liabilities & Equity', key: 'liab_header', isHeader: true, values: {} },
      apRow,
      stDebtRow,
      currLiabRow,
      ltDebtRow,
      totalDebtRow,
      totalLiabRow,
      retainedRow,
      equityRow,
      netCashRow,
      bvpsRow,
    ];
    return { periods, periodEndDates: endDates, rows };
  };

  // Helper to build Cash Flow Statement
  const makeCashFlow = (periods: string[], endDates: Record<string, string>, map: Record<string, YahooTsRecord>): FinancialStatementTable => {
    const niRow = extractRow(periods, map, 'Net Income', 'net_income', { isBold: true, format: 'currency' }, r => num(r, 'netIncomeFromContinuingOperations', 'netIncome', 'netIncomeContinuousOperations'));
    const daRow = extractRow(periods, map, 'Depreciation & Amortization', 'da', { indent: 1, format: 'currency' }, calcDa);
    const sbcRow = extractRow(periods, map, 'Stock-Based Compensation', 'sbc', { indent: 1, format: 'currency' }, r => num(r, 'stockBasedCompensation'));
    const wcRow = extractRow(periods, map, 'Change in Working Capital', 'working_capital', { indent: 1, format: 'currency' }, r => num(r, 'changeInWorkingCapital'));
    const ocfRow = extractRow(periods, map, 'Operating Cash Flow (OCF)', 'ocf', { isBold: true, format: 'currency' }, calcOcf);
    const capexRow = extractRow(periods, map, 'Capital Expenditures (CapEx)', 'capex', { indent: 1, format: 'currency' }, calcCapex);
    const fcfRow = extractRow(periods, map, 'Free Cash Flow (FCF)', 'fcf', { isBold: true, format: 'currency' }, calcFcf);
    const revRow = extractRow(periods, map, 'Revenue', 'rev_ref', { format: 'currency' }, calcRevenue);
    const divRow = extractRow(periods, map, 'Dividends Paid', 'dividends_paid', { indent: 1, format: 'currency' }, r => num(r, 'cashDividendsPaid', 'commonStockDividendPaid'));
    const buybackRow = extractRow(periods, map, 'Share Repurchases (Buybacks)', 'share_repurchases', { indent: 1, format: 'currency' }, r => num(r, 'repurchaseOfCapitalStock', 'commonStockPayments'));
    const icfRow = extractRow(periods, map, 'Investing Cash Flow', 'icf', { isBold: true, format: 'currency' }, r => num(r, 'investingCashFlow', 'cashFlowFromContinuingInvestingActivities'));
    const fcfFinRow = extractRow(periods, map, 'Financing Cash Flow', 'cff', { isBold: true, format: 'currency' }, r => num(r, 'financingCashFlow', 'cashFlowFromContinuingFinancingActivities'));
    const netCashChangeRow = extractRow(periods, map, 'Net Change in Cash', 'net_cash_change', { isBold: true, format: 'currency' }, r => num(r, 'changesInCash'));

    const rows: FinancialStatementRow[] = [
      { name: 'Operating Activities', key: 'op_act_header', isHeader: true, values: {} },
      niRow,
      daRow,
      sbcRow,
      wcRow,
      ocfRow,
      buildGrowthRow(periods, ocfRow.values, 'Operating Cash Flow Growth', 'ocf_growth'),
      { name: 'Investing & Financing Activities', key: 'inv_fin_header', isHeader: true, values: {} },
      capexRow,
      fcfRow,
      buildGrowthRow(periods, fcfRow.values, 'Free Cash Flow Growth', 'fcf_growth'),
      buildMarginRow(periods, fcfRow.values, revRow.values, 'FCF Margin', 'fcf_margin'),
      icfRow,
      divRow,
      buybackRow,
      fcfFinRow,
      netCashChangeRow,
    ];
    return { periods, periodEndDates: endDates, rows };
  };

  // Helper to build Ratios from real statements
  const makeRatios = (periods: string[], endDates: Record<string, string>, map: Record<string, YahooTsRecord>): FinancialStatementTable => {
    const roeRow: FinancialStatementRow = {
      name: 'Return on Equity (ROE)',
      key: 'roe',
      format: 'percent',
      values: Object.fromEntries(periods.map(p => {
        const ni = num(map[p], 'netIncome', 'netIncomeCommonStockholders');
        const eq = num(map[p], 'stockholdersEquity', 'commonStockEquity');
        return [p, ni !== null && eq !== null && eq > 0 ? parseFloat(((ni / eq) * 100).toFixed(1)) : null];
      })),
    };

    const roaRow: FinancialStatementRow = {
      name: 'Return on Assets (ROA)',
      key: 'roa',
      format: 'percent',
      values: Object.fromEntries(periods.map(p => {
        const ni = num(map[p], 'netIncome', 'netIncomeCommonStockholders');
        const ta = num(map[p], 'totalAssets');
        return [p, ni !== null && ta !== null && ta > 0 ? parseFloat(((ni / ta) * 100).toFixed(1)) : null];
      })),
    };

    const debtEqRow: FinancialStatementRow = {
      name: 'Debt / Equity Ratio',
      key: 'debt_equity',
      format: 'number',
      values: Object.fromEntries(periods.map(p => {
        const d = calcTotalDebt(map[p]);
        const eq = num(map[p], 'stockholdersEquity', 'commonStockEquity');
        return [p, d !== null && eq !== null && eq > 0 ? parseFloat((d / eq).toFixed(2)) : null];
      })),
    };

    const currRatioRow: FinancialStatementRow = {
      name: 'Current Ratio',
      key: 'current_ratio',
      format: 'number',
      values: Object.fromEntries(periods.map(p => {
        const ca = num(map[p], 'currentAssets');
        const cl = num(map[p], 'currentLiabilities');
        return [p, ca !== null && cl !== null && cl > 0 ? parseFloat((ca / cl).toFixed(2)) : null];
      })),
    };

    const peRow: FinancialStatementRow = {
      name: 'P/E Ratio',
      key: 'pe',
      format: 'number',
      values: Object.fromEntries(periods.map(p => {
        const eps = num(map[p], 'dilutedEPS', 'basicEPS');
        return [p, p === 'TTM' && eps !== null && eps > 0 && marketCtx.currentPrice > 0 ? parseFloat((marketCtx.currentPrice / eps).toFixed(2)) : null];
      })),
    };

    const psRow: FinancialStatementRow = {
      name: 'P/S Ratio',
      key: 'ps',
      format: 'number',
      values: Object.fromEntries(periods.map(p => {
        const rev = num(map[p], 'totalRevenue');
        return [p, p === 'TTM' && rev !== null && rev > 0 && marketCtx.marketCap > 0 ? parseFloat((marketCtx.marketCap / rev).toFixed(2)) : null];
      })),
    };

    const pbRow: FinancialStatementRow = {
      name: 'P/B Ratio',
      key: 'pb',
      format: 'number',
      values: Object.fromEntries(periods.map(p => {
        const eq = num(map[p], 'stockholdersEquity', 'commonStockEquity');
        return [p, p === 'TTM' && eq !== null && eq > 0 && marketCtx.marketCap > 0 ? parseFloat((marketCtx.marketCap / eq).toFixed(2)) : null];
      })),
    };

    const pfcfRow: FinancialStatementRow = {
      name: 'P/FCF Ratio',
      key: 'pfcf',
      format: 'number',
      values: Object.fromEntries(periods.map(p => {
        const fcf = calcFcf(map[p]);
        return [p, p === 'TTM' && fcf !== null && fcf > 0 && marketCtx.marketCap > 0 ? parseFloat((marketCtx.marketCap / fcf).toFixed(2)) : null];
      })),
    };

    const revValues = Object.fromEntries(periods.map(p => [p, calcRevenue(map[p])]));
    const gpValues = Object.fromEntries(periods.map(p => [p, calcGrossProfit(map[p])]));
    const ebitValues = Object.fromEntries(periods.map(p => [p, calcEbit(map[p])]));
    const niValues = Object.fromEntries(periods.map(p => [p, num(map[p], 'netIncome', 'netIncomeCommonStockholders')]));
    const fcfValues = Object.fromEntries(periods.map(p => [p, calcFcf(map[p])]));

    const rows: FinancialStatementRow[] = [
      { name: 'Valuation Multiples (TTM)', key: 'val_header', isHeader: true, values: {} },
      peRow,
      psRow,
      pbRow,
      pfcfRow,
      { name: 'Profitability & Returns', key: 'prof_header', isHeader: true, values: {} },
      buildMarginRow(periods, gpValues, revValues, 'Gross Margin', 'gross_margin'),
      buildMarginRow(periods, ebitValues, revValues, 'Operating Margin', 'oper_margin'),
      buildMarginRow(periods, niValues, revValues, 'Net Profit Margin', 'net_margin'),
      buildMarginRow(periods, fcfValues, revValues, 'Free Cash Flow Margin', 'fcf_margin'),
      roeRow,
      roaRow,
      { name: 'Financial Health', key: 'health_header', isHeader: true, values: {} },
      debtEqRow,
      currRatioRow,
    ];

    return { periods, periodEndDates: endDates, rows };
  };

  // Helper to build KPIs from real statements
  const makeKpis = (periods: string[], endDates: Record<string, string>, map: Record<string, YahooTsRecord>): FinancialStatementTable => {
    const revPerShareRow: FinancialStatementRow = {
      name: 'Revenue Per Share',
      key: 'rev_per_share',
      format: 'currency',
      values: Object.fromEntries(periods.map(p => {
        const rev = calcRevenue(map[p]);
        const sh = num(map[p], 'dilutedAverageShares', 'basicAverageShares');
        return [p, rev !== null && sh !== null && sh > 0 ? parseFloat((rev / sh).toFixed(2)) : null];
      })),
    };

    const fcfPerShareRow: FinancialStatementRow = {
      name: 'Free Cash Flow Per Share',
      key: 'fcf_per_share',
      format: 'currency',
      values: Object.fromEntries(periods.map(p => {
        const fcf = calcFcf(map[p]);
        const sh = num(map[p], 'dilutedAverageShares', 'basicAverageShares');
        return [p, fcf !== null && sh !== null && sh > 0 ? parseFloat((fcf / sh).toFixed(2)) : null];
      })),
    };

    const capexRevRow: FinancialStatementRow = {
      name: 'CapEx % of Revenue',
      key: 'capex_pct_rev',
      format: 'percent',
      values: Object.fromEntries(periods.map(p => {
        const capex = calcCapex(map[p]);
        const rev = calcRevenue(map[p]);
        return [p, capex !== null && rev !== null && rev > 0 ? parseFloat(((Math.abs(capex) / rev) * 100).toFixed(1)) : null];
      })),
    };

    const rndRevRow: FinancialStatementRow = {
      name: 'R&D % of Revenue',
      key: 'rnd_pct_rev',
      format: 'percent',
      values: Object.fromEntries(periods.map(p => {
        const rnd = num(map[p], 'researchAndDevelopment');
        const rev = calcRevenue(map[p]);
        return [p, rnd !== null && rev !== null && rev > 0 ? parseFloat(((rnd / rev) * 100).toFixed(1)) : null];
      })),
    };

    const sbcRevRow: FinancialStatementRow = {
      name: 'SBC % of Revenue',
      key: 'sbc_pct_rev',
      format: 'percent',
      values: Object.fromEntries(periods.map(p => {
        const sbc = num(map[p], 'stockBasedCompensation');
        const rev = calcRevenue(map[p]);
        return [p, sbc !== null && rev !== null && rev > 0 ? parseFloat(((sbc / rev) * 100).toFixed(1)) : null];
      })),
    };

    const empCount = marketCtx.employees && marketCtx.employees > 0 ? marketCtx.employees : null;
    const revPerEmpRow: FinancialStatementRow = {
      name: 'Revenue Per Employee',
      key: 'rev_per_employee',
      format: 'currency',
      values: Object.fromEntries(periods.map(p => {
        const rev = calcRevenue(map[p]);
        return [p, rev !== null && empCount ? Math.round(rev / empCount) : null];
      })),
    };

    const rows: FinancialStatementRow[] = [
      { name: 'Per-Share Efficiency', key: 'per_share_header', isHeader: true, values: {} },
      revPerShareRow,
      fcfPerShareRow,
      { name: 'Capital & R&D Intensity', key: 'intensity_header', isHeader: true, values: {} },
      capexRevRow,
      rndRevRow,
      sbcRevRow,
      { name: 'Workforce Productivity', key: 'workforce_header', isHeader: true, values: {} },
      revPerEmpRow,
    ];

    return { periods, periodEndDates: endDates, rows };
  };

  // For Balance Sheet in annual view, Yahoo TTM doesn't have balance sheet items (balance sheet is a point-in-time snapshot).
  // So for Balance Sheet, if TTM record has no totalAssets, copy latest annual/quarterly snapshot into TTM column or omit TTM.
  const latestBsSnap = quarterlySorted.find(r => num(r, 'totalAssets') !== null) || annualSorted[0];
  const bsByPeriod: Record<string, YahooTsRecord> = { ...annualByPeriod };
  const bsEndDates: Record<string, string> = { ...annualEndDates };
  if (annualPeriods[0] === 'TTM' && latestBsSnap && num(bsByPeriod['TTM'], 'totalAssets') === null) {
    // Merge latest Balance Sheet snapshot into TTM while preserving non-null TTM flow metrics
    const mergedTtm: YahooTsRecord = { ...latestBsSnap };
    for (const [k, v] of Object.entries(annualByPeriod['TTM'] || {})) {
      if (v !== undefined && v !== null) mergedTtm[k] = v;
    }
    bsByPeriod['TTM'] = mergedTtm;
    bsEndDates['TTM'] = formatPeriodEnd(toDate(latestBsSnap.date)!);
  }

  const incomeStatement = makeIncome(annualPeriods, annualEndDates, annualByPeriod);
  const balanceSheet = makeBalance(annualPeriods, bsEndDates, bsByPeriod);
  const cashFlow = makeCashFlow(annualPeriods, annualEndDates, annualByPeriod);
  const ratios = makeRatios(annualPeriods, annualEndDates, bsByPeriod);
  const kpis = makeKpis(annualPeriods, annualEndDates, annualByPeriod);

  const quarterlyIncomeStatement = makeIncome(quarterlyPeriods, quarterlyEndDates, quarterlyByPeriod);
  const quarterlyBalanceSheet = makeBalance(quarterlyPeriods, quarterlyEndDates, quarterlyByPeriod);
  const quarterlyCashFlow = makeCashFlow(quarterlyPeriods, quarterlyEndDates, quarterlyByPeriod);
  const quarterlyRatios = makeRatios(quarterlyPeriods, quarterlyEndDates, quarterlyByPeriod);

  // --- Map Trailing (TTM rolling quarters) ---
  const trailingPeriods: string[] = [];
  const trailingEndDates: Record<string, string> = {};
  const trailingByPeriod: Record<string, YahooTsRecord> = {};
  for (const rec of trailingSorted.slice(0, 10)) {
    const dt = toDate(rec.date)!;
    const lbl = `TTM ${getQuarterLabel(dt)}`;
    if (!trailingByPeriod[lbl]) {
      trailingPeriods.push(lbl);
      trailingEndDates[lbl] = formatPeriodEnd(dt);
      trailingByPeriod[lbl] = rec;
    }
  }
  const trailingIncomeStatement = trailingPeriods.length > 0 ? makeIncome(trailingPeriods, trailingEndDates, trailingByPeriod) : incomeStatement;
  const trailingCashFlow = trailingPeriods.length > 0 ? makeCashFlow(trailingPeriods, trailingEndDates, trailingByPeriod) : cashFlow;
  const trailingRatios = trailingPeriods.length > 0 ? makeRatios(trailingPeriods, trailingEndDates, trailingByPeriod) : ratios;

  const refRec = latestTtmRec || annualSorted[0];
  const bsRef = latestBsSnap || annualSorted[0];

  return {
    incomeStatement,
    balanceSheet,
    cashFlow,
    ratios,
    kpis,
    quarterlyIncomeStatement,
    quarterlyBalanceSheet,
    quarterlyCashFlow,
    quarterlyRatios,
    trailingIncomeStatement,
    trailingCashFlow,
    trailingRatios,
    latestTtm: {
      revenue: calcRevenue(refRec),
      grossProfit: calcGrossProfit(refRec),
      operatingIncome: calcEbit(refRec),
      netIncome: num(refRec, 'netIncome', 'netIncomeCommonStockholders', 'netIncomeContinuousOperations'),
      operatingCashFlow: calcOcf(refRec),
      freeCashFlow: calcFcf(refRec),
      totalCash: num(bsRef, 'cashCashEquivalentsAndShortTermInvestments', 'cashAndCashEquivalents', 'cashEquivalents'),
      totalDebt: calcTotalDebt(bsRef),
      totalAssets: num(bsRef, 'totalAssets'),
      stockholdersEquity: num(bsRef, 'stockholdersEquity', 'commonStockEquity'),
      sharesDiluted: num(refRec, 'dilutedAverageShares', 'basicAverageShares'),
      epsDiluted: num(refRec, 'dilutedEPS', 'basicEPS'),
    },
  };
}
