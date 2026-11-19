import { Type } from '@google/genai';
import * as yfModule from 'yahoo-finance2';

const YahooFinance = (yfModule as any).default?.default || (yfModule as any).default || yfModule;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const FIRESTORE_PROJECT_ID = 'stocktracker-368a1';
const FIRESTORE_COLLECTION = 'terminal_cache';

// L1 In-Memory Cache
const l1Cache = new Map<string, { data: any; expiresAt: number }>();

// Twelve Data Sliding-Window Rate Limiter (max 8 requests / 60s)
const twelveDataTimestamps: number[] = [];
const TWELVE_DATA_MAX_PER_MIN = 8;

function canCallTwelveData(): boolean {
  const now = Date.now();
  while (twelveDataTimestamps.length > 0 && now - twelveDataTimestamps[0] >= 60_000) {
    twelveDataTimestamps.shift();
  }
  if (twelveDataTimestamps.length >= TWELVE_DATA_MAX_PER_MIN) {
    return false;
  }
  twelveDataTimestamps.push(now);
  return true;
}

function sanitizeDocId(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
}

async function readFirestoreCache(key: string): Promise<any | null> {
  try {
    const docId = sanitizeDocId(key);
    const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/${FIRESTORE_COLLECTION}/${docId}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return null;
    const json = await res.json();
    const fields = json?.fields;
    if (!fields?.payload?.stringValue || !fields?.expiresAt?.integerValue) return null;
    const expiresAt = Number(fields.expiresAt.integerValue);
    if (Date.now() > expiresAt) return null;
    return JSON.parse(fields.payload.stringValue);
  } catch {
    return null;
  }
}

async function writeFirestoreCache(key: string, data: any, ttlMs: number): Promise<void> {
  try {
    const docId = sanitizeDocId(key);
    const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/${FIRESTORE_COLLECTION}/${docId}`;
    const expiresAt = Date.now() + ttlMs;
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          payload: { stringValue: JSON.stringify(data) },
          expiresAt: { integerValue: String(expiresAt) },
          updatedAt: { stringValue: new Date().toISOString() },
        },
      }),
      signal: AbortSignal.timeout(2500),
    });
  } catch {
    // Non-blocking L2 cache write
  }
}

export async function getCachedOrFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
  useL2Firestore: boolean = false
): Promise<T> {
  const now = Date.now();
  const l1 = l1Cache.get(key);
  if (l1 && l1.expiresAt > now) {
    return l1.data as T;
  }

  if (useL2Firestore) {
    const l2 = await readFirestoreCache(key);
    if (l2 !== null) {
      l1Cache.set(key, { data: l2, expiresAt: now + Math.min(ttlMs, 5 * 60_000) });
      return l2 as T;
    }
  }

  const fresh = await fetcher();
  l1Cache.set(key, { data: fresh, expiresAt: now + ttlMs });
  if (useL2Firestore && fresh !== null && fresh !== undefined) {
    void writeFirestoreCache(key, fresh, ttlMs);
  }
  return fresh;
}

// Normalize user/EU symbols to Yahoo Finance symbols
function resolveAssetSymbol(rawSymbol: string, assetType: string): { yahooSym: string; tvSym: string; label: string } {
  const s = rawSymbol.trim().toUpperCase();
  const type = (assetType || 'stock').toLowerCase();

  if (type === 'commodity') {
    if (s.includes('GOLD') || s === 'XAU' || s === 'XAU/USD' || s === 'GC=F') return { yahooSym: 'GC=F', tvSym: 'XAUUSD', label: 'Gold (Злато)' };
    if (s.includes('SILVER') || s === 'XAG' || s === 'XAG/USD' || s === 'SI=F') return { yahooSym: 'SI=F', tvSym: 'XAGUSD', label: 'Silver (Сребро)' };
    if (s.includes('BRENT') || s === 'BZ=F') return { yahooSym: 'BZ=F', tvSym: 'BRENT', label: 'Brent Crude Oil' };
    if (s.includes('WTI') || s.includes('OIL') || s === 'CL=F') return { yahooSym: 'CL=F', tvSym: 'WTI', label: 'WTI Crude Oil' };
    if (s.includes('NATGAS') || s === 'NG=F') return { yahooSym: 'NG=F', tvSym: 'NATGAS', label: 'Natural Gas' };
  }

  if (type === 'forex') {
    const cleanFx = s.replace('/', '');
    return { yahooSym: cleanFx.endsWith('=X') ? cleanFx : `${cleanFx}=X`, tvSym: cleanFx, label: s };
  }

  if (type === 'crypto') {
    if (s.includes('-USD')) return { yahooSym: s, tvSym: s.replace('-', ''), label: s };
    return { yahooSym: `${s.replace('/USD', '').replace('USD', '')}-USD`, tvSym: `${s}USD`, label: s };
  }

  if (type === 'bond') {
    if (s === 'US10Y' || s === '10Y' || s === '^TNX') return { yahooSym: '^TNX', tvSym: 'US10Y', label: 'US 10Y Treasury Yield' };
    if (s === 'US30Y' || s === '30Y' || s === '^TYX') return { yahooSym: '^TYX', tvSym: 'US30Y', label: 'US 30Y Treasury Yield' };
    if (s === 'US5Y' || s === '5Y' || s === '^FVX') return { yahooSym: '^FVX', tvSym: 'US05Y', label: 'US 5Y Treasury Yield' };
  }

  // Handle Exchange:Ticker format like SXR8:XETR, ETR:SAP, EPA:MC
  if (s.includes(':')) {
    const [a, b] = s.split(':');
    const suffixByEx: Record<string, string> = {
      XETR: '.DE', ETR: '.DE', FRA: '.F', EPA: '.PA', AMS: '.AS', LON: '.L', BIT: '.MI', BME: '.MC', SWX: '.SW', BUL: '.SO',
    };
    if (suffixByEx[b]) return { yahooSym: `${a}${suffixByEx[b]}`, tvSym: `${b}:${a}`, label: s };
    if (suffixByEx[a]) return { yahooSym: `${b}${suffixByEx[a]}`, tvSym: `${a}:${b}`, label: s };
    return { yahooSym: b, tvSym: s, label: s };
  }

  if (s === 'BRK.B' || s === 'BF.B') {
    return { yahooSym: s.replace('.', '-'), tvSym: s, label: s };
  }

  return { yahooSym: s, tvSym: s, label: s };
}

async function fetchChartReturns(yahooSym: string): Promise<{ m1: number | null; m6: number | null; y1: number | null }> {
  try {
    const period1 = new Date(Date.now() - 375 * 86400_000).toISOString().split('T')[0];
    const chart: any = await yahooFinance.chart(yahooSym, { period1, interval: '1d' }).catch(() => null);
    const quotes: any[] = chart?.quotes || [];
    if (quotes.length < 2) return { m1: null, m6: null, y1: null };
    const latest = quotes[quotes.length - 1]?.close;
    if (!latest) return { m1: null, m6: null, y1: null };

    const pctFromDaysAgo = (tradingDays: number) => {
      const idx = Math.max(0, quotes.length - 1 - tradingDays);
      const prev = quotes[idx]?.close;
      return prev && prev > 0 ? parseFloat((((latest - prev) / prev) * 100).toFixed(2)) : null;
    };

    return {
      m1: pctFromDaysAgo(21),
      m6: pctFromDaysAgo(126),
      y1: pctFromDaysAgo(252),
    };
  } catch {
    return { m1: null, m6: null, y1: null };
  }
}

export async function toolGetAssetData(symbol: string, assetType: string = 'stock') {
  const { yahooSym, label } = resolveAssetSymbol(symbol, assetType);
  const cacheKey = `asset_${assetType}_${yahooSym}`;

  return getCachedOrFetch(cacheKey, 90_000, async () => {
    const tdKey = process.env.TWELVE_DATA_API_KEY;
    let tdPrice: number | null = null;
    let tdChangePct: number | null = null;

    // Optional Twelve Data quote guarded by 8 req/min queue
    if (tdKey && canCallTwelveData()) {
      try {
        const tdRes = await fetch(
          `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${tdKey}`,
          { signal: AbortSignal.timeout(2500) }
        );
        if (tdRes.ok && tdRes.status !== 429) {
          const tdJson = await tdRes.json();
          if (tdJson && !tdJson.code && tdJson.close) {
            tdPrice = parseFloat(tdJson.close);
            tdChangePct = tdJson.percent_change ? parseFloat(tdJson.percent_change) : null;
          }
        }
      } catch {}
    }

    const [quote, returns, summary] = await Promise.all([
      yahooFinance.quote(yahooSym).catch(() => null) as Promise<any>,
      fetchChartReturns(yahooSym),
      assetType === 'stock'
        ? (yahooFinance.quoteSummary(yahooSym, { modules: ['financialData', 'defaultKeyStatistics', 'summaryDetail'] }).catch(() => null) as Promise<any>)
        : Promise.resolve(null),
    ]);

    const currentPrice = tdPrice ?? quote?.regularMarketPrice ?? null;
    const dailyChangePct = tdChangePct ?? (quote?.regularMarketChangePercent != null ? parseFloat(quote.regularMarketChangePercent.toFixed(2)) : null);
    const fd = summary?.financialData || {};
    const ks = summary?.defaultKeyStatistics || {};
    const sd = summary?.summaryDetail || {};

    const mCap = quote?.marketCap ?? sd?.marketCap ?? null;
    const fcf = fd?.freeCashflow ?? null;
    const fcfYield = mCap && fcf ? parseFloat(((fcf / mCap) * 100).toFixed(2)) : null;

    return {
      symbol: symbol.toUpperCase(),
      resolvedSymbol: yahooSym,
      name: quote?.longName || quote?.shortName || label,
      assetType,
      currency: quote?.currency || (assetType === 'bond' && yahooSym.startsWith('^') ? '%' : 'USD'),
      price: currentPrice != null ? parseFloat(Number(currentPrice).toFixed(2)) : null,
      dailyChangePct,
      performance: {
        '1M_pct': returns.m1,
        '6M_pct': returns.m6,
        '1Y_pct': returns.y1,
      },
      fundamentals: assetType === 'stock' ? {
        marketCap: mCap,
        peRatio: quote?.trailingPE ?? sd?.trailingPE ?? null,
        forwardPE: quote?.forwardPE ?? ks?.forwardPE ?? null,
        evToEbitda: ks?.enterpriseToEbitda ?? null,
        roic_or_roe_pct: fd?.returnOnEquity != null ? parseFloat((fd.returnOnEquity * 100).toFixed(2)) : null,
        fcfYield_pct: fcfYield,
        debtToEquity: fd?.debtToEquity != null ? parseFloat((fd.debtToEquity / 100).toFixed(2)) : null,
        profitMargin_pct: fd?.profitMargins != null ? parseFloat((fd.profitMargins * 100).toFixed(2)) : null,
        dividendYield_pct: sd?.dividendYield != null ? parseFloat((sd.dividendYield * 100).toFixed(2)) : null,
      } : (assetType === 'bond' ? {
        yield_to_maturity_pct: currentPrice,
        note: yahooSym.startsWith('^') ? 'US Treasury Benchmark Yield (%)' : 'Bond ETF Yield / Price',
        dividendYield_pct: sd?.dividendYield != null ? parseFloat((sd.dividendYield * 100).toFixed(2)) : null,
      } : null),
      source: tdPrice ? 'TwelveData + Yahoo Finance' : 'Yahoo Finance',
      asOf: new Date().toISOString(),
    };
  }, false);
}

export async function toolCompareAssets(symbols: string[], timeframe: string = '1Y') {
  const list = (symbols || []).slice(0, 6);
  const inferType = (sym: string): string => {
    const u = sym.toUpperCase();
    if (['GOLD', 'XAU', 'XAU/USD', 'GC=F', 'SILVER', 'XAG', 'XAG/USD', 'SI=F', 'WTI', 'BRENT', 'CL=F', 'BZ=F'].some(k => u.includes(k))) return 'commodity';
    if (u.includes('BTC') || u.includes('ETH') || u.includes('SOL') || u.includes('-USD')) return 'crypto';
    if (u.includes('/') || u.endsWith('=X')) return 'forex';
    if (u === 'US10Y' || u === '^TNX' || u === 'US30Y') return 'bond';
    return 'stock';
  };

  const assets = await Promise.all(list.map(sym => toolGetAssetData(sym, inferType(sym))));
  const tfKey = timeframe.toUpperCase() === '1M' ? '1M_pct' : (timeframe.toUpperCase() === '6M' ? '6M_pct' : '1Y_pct');

  let spread: Record<string, any> | null = null;
  if (assets.length >= 2) {
    const a = assets[0];
    const b = assets[1];
    const perfA = a.performance?.[tfKey];
    const perfB = b.performance?.[tfKey];
    spread = {
      pair: `${a.symbol} vs ${b.symbol}`,
      timeframe,
      performanceSpread_pct: (perfA != null && perfB != null) ? parseFloat((perfA - perfB).toFixed(2)) : null,
      priceRatio: (a.price && b.price && b.price > 0) ? parseFloat((a.price / b.price).toFixed(4)) : null,
    };
  }

  return {
    timeframe,
    assets,
    relativeComparison: spread,
    asOf: new Date().toISOString(),
  };
}

export function toolCalculateLoanVsInvestment(
  loanAmount: number,
  interestRateApr: number,
  years: number,
  expectedInvestmentReturn: number
) {
  const P = Math.max(0, Number(loanAmount) || 0);
  const n = Math.max(1, Math.round((Number(years) || 1) * 12));
  const rMonth = (Number(interestRateApr) || 0) / 100 / 12;

  const monthlyPayment = rMonth > 0
    ? (P * rMonth * Math.pow(1 + rMonth, n)) / (Math.pow(1 + rMonth, n) - 1)
    : P / n;

  const totalLoanPaid = monthlyPayment * n;
  const totalInterestPaid = totalLoanPaid - P;

  const rInv = (Number(expectedInvestmentReturn) || 0) / 100;
  const yrs = Number(years) || 1;
  const investedFutureValue = P * Math.pow(1 + rInv, yrs);
  const investmentNetGain = investedFutureValue - P;

  // Opportunity cost / net wealth difference if investing vs paying cash / taking loan
  const netSpreadAdvantage = investmentNetGain - totalInterestPaid;

  return {
    inputs: {
      loanAmount: P,
      interestRateApr_pct: interestRateApr,
      years: yrs,
      expectedInvestmentReturn_pct: expectedInvestmentReturn,
    },
    loanMetrics: {
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalInterestPaid: parseFloat(totalInterestPaid.toFixed(2)),
      totalLoanCost: parseFloat(totalLoanPaid.toFixed(2)),
    },
    investmentAlternative: {
      futureValueIfInvested: parseFloat(investedFutureValue.toFixed(2)),
      netInvestmentProfit: parseFloat(investmentNetGain.toFixed(2)),
      netAdvantageInvestingVsInterest: parseFloat(netSpreadAdvantage.toFixed(2)),
    },
  };
}

export async function toolGetCompanyNews(symbol: string, daysBack: number = 7) {
  const clean = symbol.trim().toUpperCase().replace(/\./g, '-');
  const cacheKey = `company_news_${clean}_${daysBack}`;

  return getCachedOrFetch(cacheKey, 10 * 60_000, async () => {
    const finnhubKey = process.env.FINNHUB_API_KEY || 'd9jqo91r01qr77bnqkc0d9jqo91r01qr77bnqkcg';
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - Math.max(1, daysBack) * 86400_000).toISOString().split('T')[0];
    const items: Array<{ date: string; headline: string; summary: string; source: string; url: string }> = [];

    if (finnhubKey && !clean.includes('.')) {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(clean)}&from=${fromDate}&to=${toDate}&token=${finnhubKey}`,
          { signal: AbortSignal.timeout(3000) }
        );
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) {
            for (const n of json.slice(0, 12)) {
              if (!n.headline) continue;
              items.push({
                date: n.datetime ? new Date(n.datetime * 1000).toISOString().split('T')[0] : toDate,
                headline: n.headline,
                summary: (n.summary || '').slice(0, 260),
                source: n.source || 'Finnhub',
                url: n.url || '',
              });
            }
          }
        }
      } catch {}
    }

    if (items.length < 4) {
      try {
        const yfSearch: any = await yahooFinance.search(clean, { newsCount: 8 }).catch(() => null);
        for (const n of (yfSearch?.news || [])) {
          if (!n.title) continue;
          if (items.some(x => x.headline.toLowerCase() === n.title.toLowerCase())) continue;
          items.push({
            date: n.providerPublishTime ? new Date(n.providerPublishTime).toISOString().split('T')[0] : toDate,
            headline: n.title,
            summary: n.title,
            source: n.publisher || 'Yahoo Finance',
            url: n.link || '',
          });
        }
      } catch {}
    }

    return {
      symbol: clean,
      daysBack,
      count: Math.min(items.length, 8),
      news: items.slice(0, 8),
    };
  }, false);
}

export async function toolGetTodaysEarnings(dateStr?: string) {
  const targetDate = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
    ? dateStr
    : new Date().toISOString().split('T')[0];
  const cacheKey = `earnings_cal_${targetDate}`;

  return getCachedOrFetch(cacheKey, 60 * 60_000, async () => {
    const finnhubKey = process.env.FINNHUB_API_KEY || 'd9jqo91r01qr77bnqkc0d9jqo91r01qr77bnqkcg';
    const bmo: any[] = [];
    const amc: any[] = [];
    const other: any[] = [];

    if (finnhubKey) {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/calendar/earnings?from=${targetDate}&to=${targetDate}&token=${finnhubKey}`,
          { signal: AbortSignal.timeout(3500) }
        );
        if (res.ok) {
          const json = await res.json();
          const list: any[] = json?.earningsCalendar || [];
          for (const e of list.slice(0, 40)) {
            const epsEst = e.epsEstimate ?? null;
            const epsAct = e.epsActual ?? null;
            const surprisePct = (epsEst && epsAct !== null && epsEst !== 0)
              ? parseFloat((((epsAct - epsEst) / Math.abs(epsEst)) * 100).toFixed(2))
              : null;
            const status = surprisePct !== null ? (surprisePct >= 0 ? 'Beat' : 'Miss') : 'Pending';
            const row = {
              symbol: e.symbol,
              hour: e.hour || 'tbd',
              epsEstimate: epsEst,
              epsActual: epsAct,
              revenueEstimate: e.revenueEstimate ?? null,
              revenueActual: e.revenueActual ?? null,
              surprisePct,
              status,
            };
            if (e.hour === 'bmo') bmo.push(row);
            else if (e.hour === 'amc') amc.push(row);
            else other.push(row);
          }
        }
      } catch {}
    }

    return {
      date: targetDate,
      beforeMarketOpen_BMO: bmo.slice(0, 15),
      afterMarketClose_AMC: amc.slice(0, 15),
      other: other.slice(0, 10),
      source: 'Finnhub Earnings Calendar',
      asOf: new Date().toISOString(),
    };
  }, true);
}

export async function toolGetMarketBriefAndCalendar() {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `market_brief_cal_${today}`;

  return getCachedOrFetch(cacheKey, 15 * 60_000, async () => {
    const finnhubKey = process.env.FINNHUB_API_KEY || 'd9jqo91r01qr77bnqkc0d9jqo91r01qr77bnqkcg';
    const fredKey = process.env.FRED_API_KEY;

    const macroTickers = ['^GSPC', '^IXIC', '^NDX', '^DJI', '^VIX', 'BZ=F', 'CL=F', '^TNX', 'GC=F'];
    const [quotesRes, fred10Y, marketNewsRes, ipoRes] = await Promise.all([
      Promise.all(macroTickers.map(t => yahooFinance.quote(t).catch(() => null))) as Promise<any[]>,
      (async () => {
        if (!fredKey) return null;
        try {
          const r = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`, { signal: AbortSignal.timeout(2500) });
          const j = await r.json();
          return j?.observations?.[0]?.value ? parseFloat(j.observations[0].value) : null;
        } catch { return null; }
      })(),
      finnhubKey
        ? fetch(`https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`, { signal: AbortSignal.timeout(3000) }).then(r => r.ok ? r.json() : []).catch(() => [])
        : Promise.resolve([]),
      finnhubKey
        ? fetch(`https://finnhub.io/api/v1/calendar/ipo?from=${today}&to=${new Date(Date.now() + 7 * 86400_000).toISOString().split('T')[0]}&token=${finnhubKey}`, { signal: AbortSignal.timeout(3000) }).then(r => r.ok ? r.json() : {}).catch(() => ({}))
        : Promise.resolve({}),
    ]);

    const macro: Record<string, any> = {};
    macroTickers.forEach((sym, i) => {
      const q = quotesRes[i];
      if (q) {
        macro[sym] = {
          name: q.shortName || sym,
          price: q.regularMarketPrice != null ? parseFloat(Number(q.regularMarketPrice).toFixed(2)) : null,
          changePct: q.regularMarketChangePercent != null ? parseFloat(Number(q.regularMarketChangePercent).toFixed(2)) : null,
        };
      }
    });
    if (fred10Y !== null) {
      macro['FRED_US10Y'] = { name: 'US 10Y Treasury Yield (FRED)', price: fred10Y, changePct: null };
    }

    const topNews = Array.isArray(marketNewsRes)
      ? marketNewsRes.slice(0, 8).map((n: any) => ({
          headline: n.headline,
          source: n.source,
          url: n.url,
          date: n.datetime ? new Date(n.datetime * 1000).toISOString() : today,
        }))
      : [];

    const ipos = Array.isArray((ipoRes as any)?.ipoCalendar)
      ? (ipoRes as any).ipoCalendar.slice(0, 8).map((i: any) => ({
          symbol: i.symbol,
          name: i.name,
          date: i.date,
          exchange: i.exchange,
          price: i.price,
        }))
      : [];

    return {
      date: today,
      macro,
      topMarketNews: topNews,
      upcomingIPOs: ipos,
      source: 'Yahoo Finance + Finnhub' + (fred10Y !== null ? ' + FRED' : ''),
      asOf: new Date().toISOString(),
    };
  }, true);
}

export const TERMINAL_TOOL_DECLARATIONS = [
  {
    name: 'get_asset_data',
    description: 'Fetch real-time price, 1M/6M/1Y returns, and fundamental metrics for any stock, ETF (including European like SXR8:XETR, SAP.DE), forex, commodity (gold, silver, WTI, Brent), bond, or crypto.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        symbol: { type: Type.STRING, description: 'Ticker or commodity symbol, e.g. AAPL, SXR8:XETR, XAU/USD, WTI, US10Y, BTC-USD' },
        asset_type: { type: Type.STRING, description: 'Asset class: stock | forex | commodity | bond | crypto' },
      },
      required: ['symbol', 'asset_type'],
    },
  },
  {
    name: 'compare_assets',
    description: 'Compare 2 or more assets in parallel across price, performance over timeframe (1M, 6M, 1Y), relative spread/ratio, and fundamentals.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        symbols: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'List of 2+ symbols to compare, e.g. ["GOLD", "SPY"] or ["NVDA", "AMD"]',
        },
        timeframe: { type: Type.STRING, description: 'Comparison timeframe: 1M | 6M | 1Y' },
      },
      required: ['symbols', 'timeframe'],
    },
  },
  {
    name: 'calculate_loan_vs_investment',
    description: 'Calculate loan monthly payment, total interest, and opportunity cost / net advantage compared to investing the capital.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        loan_amount: { type: Type.NUMBER, description: 'Principal loan/investment amount' },
        interest_rate_apr: { type: Type.NUMBER, description: 'Annual loan interest rate in % (e.g. 3.5)' },
        years: { type: Type.NUMBER, description: 'Loan/investment horizon in years' },
        expected_investment_return: { type: Type.NUMBER, description: 'Expected annual investment return in % (e.g. 8.0)' },
      },
      required: ['loan_amount', 'interest_rate_apr', 'years', 'expected_investment_return'],
    },
  },
  {
    name: 'get_company_news',
    description: 'Fetch latest company news for a given stock ticker over the past N days.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        symbol: { type: Type.STRING, description: 'Company ticker symbol, e.g. NVDA, FISV, AAPL' },
        days_back: { type: Type.NUMBER, description: 'Number of days back to search (default 7)' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_todays_earnings',
    description: 'Fetch companies reporting earnings on a date (YYYY-MM-DD, defaults to today), grouped into BMO and AMC with EPS/Revenue estimates and actuals.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        date_str: { type: Type.STRING, description: 'Optional date YYYY-MM-DD (defaults to today)' },
      },
    },
  },
  {
    name: 'get_market_brief_and_calendar',
    description: 'Fetch live macro indicators (S&P 500, Nasdaq-100, Dow, VIX, Brent, WTI, US 10Y Treasury Yield), top market news, and upcoming IPOs.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
];

export async function executeTerminalTool(name: string, args: Record<string, any>): Promise<any> {
  switch (name) {
    case 'get_asset_data':
      return await toolGetAssetData(String(args.symbol || ''), String(args.asset_type || 'stock'));
    case 'compare_assets':
      return await toolCompareAssets(Array.isArray(args.symbols) ? args.symbols : [], String(args.timeframe || '1Y'));
    case 'calculate_loan_vs_investment':
      return toolCalculateLoanVsInvestment(
        Number(args.loan_amount || 0),
        Number(args.interest_rate_apr || 0),
        Number(args.years || 1),
        Number(args.expected_investment_return || 0)
      );
    case 'get_company_news':
      return await toolGetCompanyNews(String(args.symbol || ''), Number(args.days_back || 7));
    case 'get_todays_earnings':
      return await toolGetTodaysEarnings(args.date_str ? String(args.date_str) : undefined);
    case 'get_market_brief_and_calendar':
      return await toolGetMarketBriefAndCalendar();
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
