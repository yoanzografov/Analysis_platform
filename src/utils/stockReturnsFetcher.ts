export interface PeriodReturnInfo {
  months: number;
  label: string;
  returnPct: number;
  cagr: number | null; // Annualized Compound Growth Rate (for >= 12 months)
  pastPrice: number;
  currentPrice: number;
}

export interface StockReturnsResult {
  ticker: string;
  currentPrice: number;
  ret3y: PeriodReturnInfo | null;
  ret5y: PeriodReturnInfo | null;
  ret10y: PeriodReturnInfo | null;
  allPeriods: Record<number, PeriodReturnInfo>;
}

export const AVAILABLE_RETURN_MONTHS = [
  { months: 1, label: '1M (1 месец)' },
  { months: 3, label: '3M (3 месеца)' },
  { months: 6, label: '6M (6 месеца)' },
  { months: 12, label: '12M (1 година)' },
  { months: 24, label: '24M (2 години)' },
  { months: 36, label: '36M (3 години)' },
  { months: 48, label: '48M (4 години)' },
  { months: 60, label: '60M (5 години)' },
  { months: 72, label: '72M (6 години)' },
  { months: 120, label: '120M (10 години)' },
  { months: 144, label: '144M (12 години)' },
];

// In-memory cache to avoid duplicate requests during the session
const returnsCache: Record<string, { timestamp: number; data: StockReturnsResult }> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function fetchStockReturns(ticker: string, currentPriceHint?: number): Promise<StockReturnsResult | null> {
  const cleanTicker = ticker.toUpperCase().trim();
  if (!cleanTicker) return null;

  const cached = returnsCache[cleanTicker];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 1. Try local/vercel API route /api/stock-returns
  try {
    const res = await fetch(`/api/stock-returns?ticker=${encodeURIComponent(cleanTicker)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.allPeriods) {
        returnsCache[cleanTicker] = { timestamp: Date.now(), data };
        return data;
      }
    }
  } catch {
    // continue to fallback
  }

  // 2. Direct browser Yahoo Finance query2/query1 fallback
  try {
    const yahooSym = cleanTicker.includes(':') 
      ? cleanTicker.split(':')[1] + '.' + cleanTicker.split(':')[0] 
      : cleanTicker;

    const urls = [
      `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?range=15y&interval=1mo`,
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?range=15y&interval=1mo`,
    ];

    for (const url of urls) {
      try {
        const resp = await fetch(url, { headers: { Accept: 'application/json' } });
        if (resp.ok) {
          const json = await resp.json();
          const result = json?.chart?.result?.[0];
          const quotes = result?.indicators?.quote?.[0]?.close;
          const timestamps = result?.timestamp;

          if (quotes && quotes.length > 0) {
            const validBars: { price: number; time: number }[] = [];
            for (let i = 0; i < quotes.length; i++) {
              if (quotes[i] !== null && quotes[i] !== undefined && !isNaN(quotes[i])) {
                validBars.push({ price: parseFloat(quotes[i].toFixed(2)), time: timestamps?.[i] || 0 });
              }
            }

            if (validBars.length > 1) {
              const latestPrice = currentPriceHint && currentPriceHint > 0 
                ? currentPriceHint 
                : validBars[validBars.length - 1].price;

              const allPeriods: Record<number, PeriodReturnInfo> = {};

              for (const item of AVAILABLE_RETURN_MONTHS) {
                const m = item.months;
                const idx = validBars.length - 1 - m;
                const targetBar = idx >= 0 ? validBars[idx] : validBars[0];
                const pastPrice = targetBar.price;

                if (pastPrice > 0) {
                  const returnPct = parseFloat((((latestPrice - pastPrice) / pastPrice) * 100).toFixed(2));
                  const years = m / 12;
                  let cagr: number | null = null;
                  if (years >= 1 && latestPrice > 0) {
                    cagr = parseFloat(((Math.pow(latestPrice / pastPrice, 1 / years) - 1) * 100).toFixed(2));
                  }

                  allPeriods[m] = {
                    months: m,
                    label: item.label,
                    returnPct,
                    cagr,
                    pastPrice,
                    currentPrice: latestPrice
                  };
                }
              }

              const resObj: StockReturnsResult = {
                ticker: cleanTicker,
                currentPrice: latestPrice,
                ret3y: allPeriods[36] || null,
                ret5y: allPeriods[60] || null,
                ret10y: allPeriods[120] || null,
                allPeriods
              };

              returnsCache[cleanTicker] = { timestamp: Date.now(), data: resObj };
              return resObj;
            }
          }
        }
      } catch {
        // try next url
      }
    }
  } catch {
    // continue to TradingView scanner fallback
  }

  // 3. Fallback: TradingView scanner API (always works directly from client)
  try {
    const tvSym = cleanTicker.includes(':') ? cleanTicker.split(':').pop()! : cleanTicker;
    const tvMarkets = ['america', 'germany', 'france', 'uk', 'sweden', 'switzerland', 'crypto'];

    for (const market of tvMarkets) {
      try {
        const tvResp = await fetch(`https://scanner.tradingview.com/${market}/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filter: [{ left: 'name', operation: 'in_range', right: [tvSym, cleanTicker] }],
            columns: ['name', 'close', 'Perf.1M', 'Perf.3M', 'Perf.6M', 'Perf.Y', 'Perf.3Y', 'Perf.5Y', 'Perf.10Y']
          })
        });

        if (tvResp.ok) {
          const tvJson = await tvResp.json();
          if (tvJson?.data?.length > 0) {
            const row = tvJson.data[0]?.d;
            if (row && row[1] != null) {
              const curPrice = parseFloat(row[1]) || currentPriceHint || 100;
              const tv1m = row[2] != null ? parseFloat(Number(row[2]).toFixed(2)) : null;
              const tv3m = row[3] != null ? parseFloat(Number(row[3]).toFixed(2)) : null;
              const tv6m = row[4] != null ? parseFloat(Number(row[4]).toFixed(2)) : null;
              const tv1y = row[5] != null ? parseFloat(Number(row[5]).toFixed(2)) : null;
              const tv3y = row[6] != null ? parseFloat(Number(row[6]).toFixed(2)) : null;
              const tv5y = row[7] != null ? parseFloat(Number(row[7]).toFixed(2)) : null;
              const tv10y = row[8] != null ? parseFloat(Number(row[8]).toFixed(2)) : null;

              const buildPeriod = (months: number, label: string, ret: number | null): PeriodReturnInfo | null => {
                if (ret == null) return null;
                const past = parseFloat((curPrice / (1 + ret / 100)).toFixed(2));
                const years = months / 12;
                const cagr = years >= 1 ? parseFloat(((Math.pow(curPrice / past, 1 / years) - 1) * 100).toFixed(2)) : null;
                return {
                  months,
                  label,
                  returnPct: ret,
                  cagr,
                  pastPrice: past,
                  currentPrice: curPrice
                };
              };

              const allPeriods: Record<number, PeriodReturnInfo> = {};
              if (tv1m != null) allPeriods[1] = buildPeriod(1, '1M (1 месец)', tv1m)!;
              if (tv3m != null) allPeriods[3] = buildPeriod(3, '3M (3 месеца)', tv3m)!;
              if (tv6m != null) allPeriods[6] = buildPeriod(6, '6M (6 месеца)', tv6m)!;
              if (tv1y != null) allPeriods[12] = buildPeriod(12, '12M (1 година)', tv1y)!;
              if (tv3y != null) allPeriods[36] = buildPeriod(36, '36M (3 години)', tv3y)!;
              if (tv5y != null) allPeriods[60] = buildPeriod(60, '60M (5 години)', tv5y)!;
              if (tv10y != null) allPeriods[120] = buildPeriod(120, '120M (10 години)', tv10y)!;

              const resObj: StockReturnsResult = {
                ticker: cleanTicker,
                currentPrice: curPrice,
                ret3y: allPeriods[36] || null,
                ret5y: allPeriods[60] || null,
                ret10y: allPeriods[120] || null,
                allPeriods
              };

              returnsCache[cleanTicker] = { timestamp: Date.now(), data: resObj };
              return resObj;
            }
          }
        }
      } catch {
        // try next market
      }
    }
  } catch {
    // ignore
  }

  return null;
}
