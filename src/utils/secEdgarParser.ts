import { YahooTsRecord } from './yahooStatementsParser.js';

const SEC_HEADERS = {
  'User-Agent': 'RayVesCapital/1.0 (info@rayves.com)',
  'Accept': 'application/json',
};

let tickerToCikMap: Map<string, string> | null = null;
let tickerMapLoadedAt = 0;
const secFactsCache = new Map<string, { records: YahooTsRecord[]; ts: number }>();

async function getCikForTicker(rawTicker: string): Promise<string | null> {
  const clean = rawTicker.trim().toUpperCase();
  const candidates = Array.from(new Set([
    clean,
    clean.replace(/\./g, '-'),
    clean.replace(/-/g, '.'),
  ]));

  // Refresh SEC ticker map at most once per 24 hours
  if (!tickerToCikMap || (Date.now() - tickerMapLoadedAt > 24 * 60 * 60 * 1000)) {
    try {
      const res = await fetch('https://www.sec.gov/files/company_tickers.json', {
        headers: SEC_HEADERS,
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const json = (await res.json()) as Record<string, { cik_str: number; ticker: string; title: string }>;
        const map = new Map<string, string>();
        for (const k of Object.keys(json)) {
          const entry = json[k];
          if (entry?.ticker && entry?.cik_str != null) {
            const padded = String(entry.cik_str).padStart(10, '0');
            map.set(entry.ticker.toUpperCase(), padded);
          }
        }
        tickerToCikMap = map;
        tickerMapLoadedAt = Date.now();
      }
    } catch {
      // Ignore network error, return null if map not available
    }
  }

  if (!tickerToCikMap) return null;
  for (const c of candidates) {
    const found = tickerToCikMap.get(c);
    if (found) return found;
  }
  return null;
}

interface SecFactItem {
  start?: string;
  end?: string;
  val?: number;
  form?: string;
  fp?: string;
  filed?: string;
  frame?: string;
}

function daysBetween(startStr: string, endStr: string): number {
  const s = new Date(startStr).getTime();
  const e = new Date(endStr).getTime();
  if (isNaN(s) || isNaN(e)) return 0;
  return (e - s) / (1000 * 60 * 60 * 24);
}

/**
 * Extracts annual 10-K values keyed by fiscal end year (e.g. "2021") from a list of candidate US-GAAP tags.
 * Prefers the most recently filed 10-K value for each fiscal year-end.
 */
function extractAnnualMap(
  usGaap: Record<string, any>,
  tags: string[],
  isInstant: boolean,
  unit: 'USD' | 'USD/shares' | 'shares' = 'USD'
): Record<string, { val: number; end: string }> {
  const byYear: Record<string, { val: number; end: string; filed: string; priority: number }> = {};

  for (let p = 0; p < tags.length; p++) {
    const tag = tags[p];
    const tagObj = usGaap[tag];
    const items: SecFactItem[] = tagObj?.units?.[unit] || [];
    if (!Array.isArray(items) || items.length === 0) continue;

    for (const item of items) {
      if (item.form !== '10-K' || typeof item.val !== 'number' || !item.end) continue;
      if (!isInstant) {
        if (!item.start) continue;
        const d = daysBetween(item.start, item.end);
        // Must be a full annual period (~340 to 385 days)
        if (d < 340 || d > 385) continue;
      }

      const yr = item.end.slice(0, 4);
      const filed = item.filed || '';
      const existing = byYear[yr];
      // Higher-priority tag wins for any year it covers; lower-priority tags backfill missing years
      if (!existing || (existing.priority === p && filed > existing.filed)) {
        byYear[yr] = { val: item.val, end: item.end, filed, priority: p };
      }
    }
  }

  const out: Record<string, { val: number; end: string }> = {};
  for (const [yr, data] of Object.entries(byYear)) {
    out[yr] = { val: data.val, end: data.end };
  }
  return out;
}

export async function fetchSecAnnualRecords(rawTicker: string): Promise<YahooTsRecord[]> {
  const clean = rawTicker.trim().toUpperCase();
  const cached = secFactsCache.get(clean);
  if (cached && (Date.now() - cached.ts < 30 * 60 * 1000)) {
    return cached.records;
  }

  try {
    const cik = await getCikForTicker(clean);
    if (!cik) return [];

    const res = await fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`, {
      headers: SEC_HEADERS,
      signal: AbortSignal.timeout(4500),
    });
    if (!res.ok) return [];

    const facts = await res.json();
    const usGaap = facts?.facts?.['us-gaap'] || {};
    if (!usGaap || Object.keys(usGaap).length === 0) return [];

    const revMap = extractAnnualMap(usGaap, [
      'RevenueFromContractWithCustomerExcludingAssessedTax',
      'Revenues',
      'SalesRevenueNet',
      'RevenueFromContractWithCustomerIncludingAssessedTax',
      'SalesRevenueGoodsNet',
      'SalesRevenueServicesNet',
    ], false);

    const corMap = extractAnnualMap(usGaap, [
      'CostOfGoodsAndServicesSold',
      'CostOfRevenue',
      'CostOfGoodsSold',
      'CostOfServices',
    ], false);

    const gpMap = extractAnnualMap(usGaap, ['GrossProfit'], false);
    const rndMap = extractAnnualMap(usGaap, ['ResearchAndDevelopmentExpense'], false);
    const sgaMap = extractAnnualMap(usGaap, ['SellingGeneralAndAdministrativeExpense'], false);
    const ebitMap = extractAnnualMap(usGaap, ['OperatingIncomeLoss'], false);
    const intMap = extractAnnualMap(usGaap, ['InterestExpense', 'InterestExpenseDebt'], false);
    const ebtMap = extractAnnualMap(usGaap, [
      'IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest',
      'IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments',
    ], false);
    const taxMap = extractAnnualMap(usGaap, ['IncomeTaxExpenseBenefit'], false);
    const niMap = extractAnnualMap(usGaap, ['NetIncomeLoss', 'ProfitLoss'], false);
    const epsMap = extractAnnualMap(usGaap, ['EarningsPerShareDiluted'], false, 'USD/shares');
    const sharesMap = extractAnnualMap(usGaap, [
      'WeightedAverageNumberOfDilutedSharesOutstanding',
      'WeightedAverageNumberOfSharesOutstandingBasic',
    ], false, 'shares');

    // Balance Sheet (Instant)
    const cashMap = extractAnnualMap(usGaap, ['CashAndCashEquivalentsAtCarryingValue'], true);
    const stInvMap = extractAnnualMap(usGaap, ['MarketableSecuritiesCurrent', 'ShortTermInvestments', 'AvailableForSaleSecuritiesCurrent'], true);
    const arMap = extractAnnualMap(usGaap, ['AccountsReceivableNetCurrent', 'ReceivablesNetCurrent'], true);
    const invMap = extractAnnualMap(usGaap, ['InventoryNet'], true);
    const currAssetsMap = extractAnnualMap(usGaap, ['AssetsCurrent'], true);
    const ppeMap = extractAnnualMap(usGaap, ['PropertyPlantAndEquipmentNet'], true);
    const gwMap = extractAnnualMap(usGaap, ['Goodwill'], true);
    const assetsMap = extractAnnualMap(usGaap, ['Assets'], true);
    const apMap = extractAnnualMap(usGaap, ['AccountsPayableCurrent'], true);
    const stDebtMap = extractAnnualMap(usGaap, ['ShortTermBorrowings', 'LongTermDebtCurrent', 'DebtCurrent'], true);
    const currLiabMap = extractAnnualMap(usGaap, ['LiabilitiesCurrent'], true);
    const ltDebtMap = extractAnnualMap(usGaap, ['LongTermDebtNoncurrent', 'LongTermDebt', 'LongTermDebtAndCapitalLeaseObligations'], true);
    const liabMap = extractAnnualMap(usGaap, ['Liabilities'], true);
    const retainedMap = extractAnnualMap(usGaap, ['RetainedEarningsAccumulatedDeficit'], true);
    const equityMap = extractAnnualMap(usGaap, ['StockholdersEquity'], true);

    // Cash Flow (Flow)
    const daMap = extractAnnualMap(usGaap, [
      'DepreciationDepletionAndAmortization',
      'DepreciationAndAmortization',
      'Depreciation',
      'DepreciationAmortizationAndAccretionNet',
    ], false);
    const sbcMap = extractAnnualMap(usGaap, [
      'ShareBasedCompensation',
      'AllocatedShareBasedCompensationExpense',
      'AdjustmentsToAdditionalPaidInCapitalSharebasedCompensationRequisiteServicePeriodRecognitionValue',
    ], false);
    const wcMap = extractAnnualMap(usGaap, [
      'IncreaseDecreaseInOperatingCapital',
      'IncreaseDecreaseInOperatingAssetsAndLiabilities',
    ], false);
    const ocfMap = extractAnnualMap(usGaap, ['NetCashProvidedByUsedInOperatingActivities'], false);
    const capexMap = extractAnnualMap(usGaap, [
      'PaymentsToAcquirePropertyPlantAndEquipment',
      'PaymentsToAcquireProductiveAssets',
      'PaymentsForCapitalImprovements',
      'PaymentsToAcquireOtherPropertyPlantAndEquipment',
      'PaymentsToAcquireMachineryAndEquipment',
    ], false);
    const divMap = extractAnnualMap(usGaap, ['PaymentsOfDividendsCommonStock', 'PaymentsOfDividends'], false);
    const buybackMap = extractAnnualMap(usGaap, ['PaymentsForRepurchaseOfCommonStock'], false);
    const icfMap = extractAnnualMap(usGaap, ['NetCashProvidedByUsedInInvestingActivities'], false);
    const cffMap = extractAnnualMap(usGaap, ['NetCashProvidedByUsedInFinancingActivities'], false);
    const netCashChangeMap = extractAnnualMap(usGaap, [
      'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalentsPeriodIncreaseDecreaseIncludingExchangeRateEffect',
      'CashAndCashEquivalentsPeriodIncreaseDecrease',
      'CashPeriodIncreaseDecrease',
    ], false);

    // Collect all fiscal years present in Income/CF/BS
    const allYears = Array.from(new Set([
      ...Object.keys(revMap),
      ...Object.keys(niMap),
      ...Object.keys(ocfMap),
      ...Object.keys(assetsMap),
    ]))
      .filter(y => Number(y) >= 2016)
      .sort((a, b) => Number(b) - Number(a))
      .slice(0, 12);

    const records: YahooTsRecord[] = [];
    for (const yr of allYears) {
      const endDate = revMap[yr]?.end || niMap[yr]?.end || ocfMap[yr]?.end || assetsMap[yr]?.end;
      if (!endDate) continue;

      const rev = revMap[yr]?.val ?? null;
      const cor = corMap[yr]?.val ?? null;
      const gp = gpMap[yr]?.val ?? (rev !== null && cor !== null ? rev - cor : null);
      const rnd = rndMap[yr]?.val ?? null;
      const sga = sgaMap[yr]?.val ?? null;
      const opExp = rnd !== null && sga !== null ? rnd + sga : null;
      const ebit = ebitMap[yr]?.val ?? null;
      const da = daMap[yr]?.val ?? null;
      const ebitda = ebit !== null && da !== null ? ebit + da : null;

      const cash = cashMap[yr]?.val ?? null;
      const stInv = stInvMap[yr]?.val ?? null;
      const totalCash = cash !== null && stInv !== null ? cash + stInv : cash;
      const stDebt = stDebtMap[yr]?.val ?? null;
      const ltDebt = ltDebtMap[yr]?.val ?? null;
      const totalDebt = stDebt !== null && ltDebt !== null ? stDebt + ltDebt : (ltDebt ?? stDebt);

      const ocf = ocfMap[yr]?.val ?? null;
      const capexRaw = capexMap[yr]?.val ?? null;
      const capex = capexRaw !== null ? -Math.abs(capexRaw) : null;
      const fcf = ocf !== null && capex !== null ? ocf + capex : null;
      const wcRaw = wcMap[yr]?.val ?? null;
      const changeInWc = wcRaw !== null ? -wcRaw : null;
      const icf = icfMap[yr]?.val ?? null;
      const cff = cffMap[yr]?.val ?? null;
      const netCashChange = netCashChangeMap[yr]?.val ?? (
        ocf !== null && icf !== null && cff !== null ? ocf + icf + cff : null
      );

      const divRaw = divMap[yr]?.val ?? null;
      const buybackRaw = buybackMap[yr]?.val ?? null;

      records.push({
        date: `${endDate}T00:00:00.000Z`,
        totalRevenue: rev,
        costOfRevenue: cor,
        grossProfit: gp,
        researchAndDevelopment: rnd,
        sellingGeneralAndAdministration: sga,
        operatingExpense: opExp,
        operatingIncome: ebit,
        interestExpense: intMap[yr]?.val ?? null,
        pretaxIncome: ebtMap[yr]?.val ?? null,
        taxProvision: taxMap[yr]?.val ?? null,
        netIncome: niMap[yr]?.val ?? null,
        dilutedEPS: epsMap[yr]?.val ?? null,
        dilutedAverageShares: sharesMap[yr]?.val ?? null,
        EBITDA: ebitda,
        cashAndCashEquivalents: cash,
        otherShortTermInvestments: stInv,
        cashCashEquivalentsAndShortTermInvestments: totalCash,
        accountsReceivable: arMap[yr]?.val ?? null,
        inventory: invMap[yr]?.val ?? null,
        currentAssets: currAssetsMap[yr]?.val ?? null,
        netPPE: ppeMap[yr]?.val ?? null,
        goodwillAndOtherIntangibleAssets: gwMap[yr]?.val ?? null,
        totalAssets: assetsMap[yr]?.val ?? null,
        accountsPayable: apMap[yr]?.val ?? null,
        currentDebt: stDebt,
        currentLiabilities: currLiabMap[yr]?.val ?? null,
        longTermDebt: ltDebt,
        totalDebt,
        totalLiabilitiesNetMinorityInterest: liabMap[yr]?.val ?? null,
        retainedEarnings: retainedMap[yr]?.val ?? null,
        stockholdersEquity: equityMap[yr]?.val ?? null,
        depreciationAndAmortization: da,
        stockBasedCompensation: sbcMap[yr]?.val ?? null,
        changeInWorkingCapital: changeInWc,
        operatingCashFlow: ocf,
        capitalExpenditure: capex,
        freeCashFlow: fcf,
        cashDividendsPaid: divRaw !== null ? -Math.abs(divRaw) : null,
        repurchaseOfCapitalStock: buybackRaw !== null ? -Math.abs(buybackRaw) : null,
        investingCashFlow: icf,
        financingCashFlow: cff,
        changesInCash: netCashChange,
      });
    }

    secFactsCache.set(clean, { records, ts: Date.now() });
    return records;
  } catch {
    return [];
  }
}
