import type { VercelRequest, VercelResponse } from '@vercel/node';

// --- Symbol mapping (Google Finance format -> Yahoo Finance format) ---
const googleToYahooMap: Record<string, string> = {
  "EPA": ".PA", "ETR": ".DE", "FRA": ".F", "LON": ".L", "AMS": ".AS",
  "EBR": ".BR", "BIT": ".MI", "BME": ".MC", "VIE": ".VI", "CPH": ".CO",
  "HEL": ".HE", "STO": ".ST", "SWX": ".SW", "OSL": ".OL", "LIS": ".LS",
  "ATH": ".AT", "IST": ".IS", "WSE": ".WA", "PRG": ".PR", "TSE": ".T",
  "HKG": ".HK", "BSE": ".BO", "NSE": ".NS", "TPE": ".TW", "ASX": ".AX",
  "NZZE": ".NZ", "TSX": ".TO", "CVE": ".V", "BMFBOVESPA": ".SA", "JSE": ".JO"
};

function toYahooSymbol(t: string): string {
  if (!t.includes(":")) return t;
  const [prefix, raw] = t.split(":");
  const fixedRaw = (prefix === "ETR" && raw === "DHL") ? "DPW" : raw;
  return googleToYahooMap[prefix] ? fixedRaw + googleToYahooMap[prefix] : fixedRaw + "." + prefix;
}

async function fetchYahooQuotes(yahooTickers: string[]): Promise<any[]> {
  // Use Yahoo Finance v8 API (no API key needed, works for batch)
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(yahooTickers.join(","))}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketPreviousClose,fiftyTwoWeekLow,fiftyTwoWeekHigh,trailingPE,forwardPE,epsTrailingTwelveMonths,epsForward,marketCap,dividendRate,trailingAnnualDividendRate,dividendYield,trailingAnnualDividendYield,longName,shortName,earningsTimestamp`;
  
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
  };

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Yahoo v7 failed: ${res.status}`);
  const json = await res.json();
  return json?.quoteResponse?.result || [];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Only handle /api/stock-quotes
  const url = req.url || "";
  if (!url.includes("stock-quotes")) {
    return res.status(404).json({ error: "Not found" });
  }

  const symbolsQuery = (req.query.symbols as string) || "";
  if (!symbolsQuery) {
    return res.status(400).json({ error: "Missing symbols" });
  }

  try {
    const tickers = symbolsQuery.split(",").map(t => t.trim().toUpperCase()).filter(Boolean);

    // Build mapping
    const originalToYahoo: Record<string, string> = {};
    const yahooToOriginal: Record<string, string> = {};
    for (const t of tickers) {
      const y = toYahooSymbol(t);
      originalToYahoo[t] = y;
      yahooToOriginal[y] = t;
    }

    const yahooTickers = Array.from(new Set(Object.values(originalToYahoo)));

    // Fetch from Yahoo Finance
    let quotes: any[] = [];
    try {
      quotes = await fetchYahooQuotes(yahooTickers);
    } catch (e: any) {
      console.warn("Batch Yahoo failed, trying individually:", e.message);
      for (const yt of yahooTickers) {
        try {
          const single = await fetchYahooQuotes([yt]);
          quotes.push(...single);
        } catch {}
      }
    }

    const results: Record<string, any> = {};

    for (const q of quotes) {
      if (!q?.symbol) continue;
      const qSym = q.symbol.toUpperCase();
      const originalTicker = yahooToOriginal[qSym] || qSym;

      const currentPrice = q.regularMarketPrice ?? q.bid;
      if (currentPrice === undefined || currentPrice === null) continue;

      const prevClose = q.regularMarketPreviousClose;
      let dailyChangePct = q.regularMarketChangePercent;
      if (dailyChangePct === undefined && prevClose && currentPrice) {
        dailyChangePct = ((currentPrice - prevClose) / prevClose) * 100;
      }

      results[originalTicker] = {
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        dailyChangePct: parseFloat((dailyChangePct || 0).toFixed(2)),
        companyName: q.longName || q.shortName || undefined,
        low52: q.fiftyTwoWeekLow ? parseFloat(q.fiftyTwoWeekLow.toFixed(2)) : undefined,
        high52: q.fiftyTwoWeekHigh ? parseFloat(q.fiftyTwoWeekHigh.toFixed(2)) : undefined,
        peRatio: (q.trailingPE ?? q.forwardPE) != null ? parseFloat((q.trailingPE ?? q.forwardPE).toFixed(2)) : undefined,
        eps: (q.epsTrailingTwelveMonths ?? q.epsForward) != null ? parseFloat((q.epsTrailingTwelveMonths ?? q.epsForward).toFixed(2)) : undefined,
        marketCap: q.marketCap || undefined,
        dividend: q.dividendRate ?? q.trailingAnnualDividendRate,
        dividendYield: q.dividendYield ?? q.trailingAnnualDividendYield,
        earningsTimestamp: q.earningsTimestamp ?? undefined,
      };
    }

    // Finnhub override for US tickers (1-5 uppercase letters, no special chars)
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

    return res.json({ quotes: results, source: "vercel-serverless-yahoo" });

  } catch (err: any) {
    console.error("stock-quotes handler error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
