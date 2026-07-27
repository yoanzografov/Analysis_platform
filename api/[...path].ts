import type { VercelRequest, VercelResponse } from '@vercel/node';

// Google Finance exchange prefix → Yahoo Finance suffix
const EXCHANGE_MAP: Record<string, string> = {
  "EPA": ".PA", "ETR": ".DE", "FRA": ".F", "LON": ".L", "AMS": ".AS",
  "EBR": ".BR", "BIT": ".MI", "BME": ".MC", "VIE": ".VI", "CPH": ".CO",
  "HEL": ".HE", "STO": ".ST", "SWX": ".SW", "OSL": ".OL", "LIS": ".LS",
  "ATH": ".AT", "IST": ".IS", "WSE": ".WA", "PRG": ".PR", "TSE": ".T",
  "HKG": ".HK", "BSE": ".BO", "NSE": ".NS", "TPE": ".TW", "ASX": ".AX",
  "NZZE": ".NZ", "TSX": ".TO", "CVE": ".V", "BMFBOVESPA": ".SA", "JSE": ".JO"
};

function toYahooSymbol(ticker: string): string {
  if (!ticker.includes(":")) return ticker;
  const colonIdx = ticker.indexOf(":");
  const prefix = ticker.slice(0, colonIdx);
  let raw = ticker.slice(colonIdx + 1);
  // Known ticker remaps
  if (prefix === "ETR" && raw === "DHL") raw = "DPW";
  return EXCHANGE_MAP[prefix] ? raw + EXCHANGE_MAP[prefix] : raw + "." + prefix;
}

const YAHOO_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Origin": "https://finance.yahoo.com",
  "Referer": "https://finance.yahoo.com/",
};

// Yahoo Finance v7 quote API (no auth required)
async function fetchYahooV7(symbols: string[]): Promise<any[]> {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketPreviousClose,fiftyTwoWeekLow,fiftyTwoWeekHigh,trailingPE,forwardPE,epsTrailingTwelveMonths,epsForward,marketCap,dividendRate,trailingAnnualDividendRate,dividendYield,trailingAnnualDividendYield,longName,shortName,sector,industry,earningsTimestamp`;
  const res = await fetch(url, { headers: YAHOO_HEADERS });
  if (!res.ok) throw new Error(`Yahoo v7 HTTP ${res.status}`);
  const json = await res.json();
  return json?.quoteResponse?.result ?? [];
}

// Yahoo Finance v8 chart API fallback for a single symbol
async function fetchYahooV8Single(symbol: string): Promise<any | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const res = await fetch(url, { headers: YAHOO_HEADERS });
  if (!res.ok) return null;
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta) return null;
  return {
    symbol,
    regularMarketPrice: meta.regularMarketPrice,
    regularMarketPreviousClose: meta.previousClose ?? meta.chartPreviousClose,
    regularMarketChangePercent: meta.regularMarketPrice && meta.previousClose
      ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
      : 0,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
    longName: meta.longName ?? meta.shortName,
  };
}

function buildResult(q: any) {
  const price = q.regularMarketPrice ?? q.bid;
  if (price == null) return null;

  const prevClose = q.regularMarketPreviousClose;
  let changePct = q.regularMarketChangePercent;
  if (changePct == null && prevClose && price) {
    changePct = ((price - prevClose) / prevClose) * 100;
  }

  const pe = q.trailingPE ?? q.forwardPE;
  const eps = q.epsTrailingTwelveMonths ?? q.epsForward;

  return {
    currentPrice: parseFloat(price.toFixed(2)),
    dailyChangePct: parseFloat((changePct ?? 0).toFixed(2)),
    companyName: q.longName || q.shortName || undefined,
    low52: q.fiftyTwoWeekLow != null ? parseFloat(q.fiftyTwoWeekLow.toFixed(2)) : undefined,
    high52: q.fiftyTwoWeekHigh != null ? parseFloat(q.fiftyTwoWeekHigh.toFixed(2)) : undefined,
    peRatio: pe != null ? parseFloat(pe.toFixed(2)) : undefined,
    eps: eps != null ? parseFloat(eps.toFixed(2)) : undefined,
    marketCap: q.marketCap || undefined,
    sector: q.sector || q.industry || undefined,
    dividend: q.dividendRate ?? q.trailingAnnualDividendRate,
    dividendYield: q.dividendYield ?? q.trailingAnnualDividendYield,
    earningsTimestamp: q.earningsTimestamp ?? undefined,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "OPTIONS") return res.status(200).end();

  const url = req.url ?? "";
  if (!url.includes("stock-quotes")) {
    return res.status(404).json({ error: "Not found" });
  }

  const symbolsQuery = (req.query.symbols as string) || "";
  if (!symbolsQuery) return res.status(400).json({ error: "Missing symbols" });

  try {
    const tickers = symbolsQuery.split(",").map(t => t.trim().toUpperCase()).filter(Boolean);

    // Build bidirectional symbol map
    const originalToYahoo: Record<string, string> = {};
    const yahooToOriginal: Record<string, string> = {};
    for (const t of tickers) {
      const y = toYahooSymbol(t);
      originalToYahoo[t] = y;
      yahooToOriginal[y.toUpperCase()] = t;
    }
    const yahooTickers = [...new Set(Object.values(originalToYahoo))];

    // --- Step 1: Yahoo Finance v7 batch fetch ---
    let rawQuotes: any[] = [];
    try {
      rawQuotes = await fetchYahooV7(yahooTickers);
    } catch (e: any) {
      console.warn("Yahoo v7 batch failed:", e.message);
    }

    const results: Record<string, any> = {};

    for (const q of rawQuotes) {
      if (!q?.symbol) continue;
      const qSym = q.symbol.toUpperCase();
      const orig = yahooToOriginal[qSym] || qSym;
      const built = buildResult(q);
      if (built) results[orig] = built;
    }

    // --- Step 2: v8 fallback for any still-missing tickers ---
    const missing = tickers.filter(t => !results[t]);
    if (missing.length > 0) {
      await Promise.allSettled(missing.map(async (t) => {
        const ySym = originalToYahoo[t];
        try {
          const q = await fetchYahooV8Single(ySym);
          if (q) {
            const built = buildResult({ ...q, symbol: ySym });
            if (built) results[t] = built;
          }
        } catch {}
      }));
    }

    // --- Step 3: Finnhub real-time price override for plain US tickers ---
    const finnhubKey = process.env.FINNHUB_API_KEY;
    if (finnhubKey) {
      const usStocks = tickers.filter(t => /^[A-Z]{1,5}$/.test(t));
      await Promise.allSettled(usStocks.map(async (t) => {
        try {
          const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${t}&token=${finnhubKey}`);
          if (!r.ok) return;
          const data = await r.json();
          if (data && typeof data.c === "number" && data.c > 0) {
            if (!results[t]) results[t] = { currentPrice: 0, dailyChangePct: 0 };
            results[t].currentPrice = parseFloat(data.c.toFixed(2));
            if (typeof data.dp === "number") results[t].dailyChangePct = parseFloat(data.dp.toFixed(2));
          }
        } catch {}
      }));
    }

    return res.json({ quotes: results, source: "vercel-yahoo-v7+v8+finnhub", count: Object.keys(results).length });

  } catch (err: any) {
    console.error("API handler error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
