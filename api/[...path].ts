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

// Known plain European/International ticker to Yahoo Finance symbol mapping
const PLAIN_EUROPEAN_MAP: Record<string, string> = {
  "XNAS": "XNAS.DE",
  "XNAS.DE": "XNAS.DE",
  "VHYL": "VHYL.AS",
  "VHYL.DE": "VHYL.AS",
  "VGWD": "VGWD.DE",
  "VGWD.DE": "VGWD.DE",
  "JGPI": "JGPI.DE",
  "JGPI.DE": "JGPI.DE",
  "SXR8": "SXR8.DE",
  "SXR8.DE": "SXR8.DE",
  "EUNL": "EUNL.DE",
  "VWCE": "VWCE.DE",
  "QDVE": "QDVE.DE",
  "IS3N": "IS3N.DE",
  "CSPX": "CSPX.L",
  "CSSPX": "CSSPX.MI",
  "VUSA": "VUSA.DE",
  "MEUD": "MEUD.PA",
  "4GLD": "4GLD.DE",
  "IWDA": "IWDA.AS",
  "EMIM": "EMIM.L",
  "INRG": "INRG.L",
  "RBOT": "RBOT.L",
  "IUIT": "IUIT.L",
  "SX8P": "SX8P.DE"
};

function toYahooSymbol(ticker: string): string {
  const upper = ticker.trim().toUpperCase();
  if (PLAIN_EUROPEAN_MAP[upper]) {
    return PLAIN_EUROPEAN_MAP[upper];
  }
  if (!upper.includes(":")) return upper;
  const colonIdx = upper.indexOf(":");
  const prefix = upper.slice(0, colonIdx);
  let raw = upper.slice(colonIdx + 1);
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
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketPreviousClose,fiftyTwoWeekLow,fiftyTwoWeekHigh,trailingPE,forwardPE,epsTrailingTwelveMonths,epsForward,marketCap,dividendRate,trailingAnnualDividendRate,dividendYield,trailingAnnualDividendYield,longName,shortName,sector,industry,earningsTimestamp,currency`;
  const res = await fetch(url, { headers: YAHOO_HEADERS });
  if (!res.ok) throw new Error(`Yahoo v7 HTTP ${res.status}`);
  const json = await res.json();
  return json?.quoteResponse?.result ?? [];
}

// Yahoo Finance v8 chart API fallback for a single symbol
async function fetchYahooV8Single(symbol: string): Promise<any | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
  const res = await fetch(url, { headers: YAHOO_HEADERS });
  if (!res.ok) return null;
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta) return null;

  const price = meta.regularMarketPrice;
  const prevClose = meta.previousClose ?? meta.chartPreviousClose;
  const changeVal = (price != null && prevClose != null) ? price - prevClose : 0;
  const changePct = (price != null && prevClose != null && prevClose > 0) ? ((price - prevClose) / prevClose) * 100 : 0;

  return {
    symbol,
    regularMarketPrice: price,
    regularMarketPreviousClose: prevClose,
    regularMarketChange: changeVal,
    regularMarketChangePercent: changePct,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
    longName: meta.longName ?? meta.shortName,
    currency: meta.currency,
  };
}

function buildResult(q: any) {
  const price = q.regularMarketPrice ?? q.bid;
  if (price == null) return null;

  const prevClose = q.regularMarketPreviousClose;
  let changePct = q.regularMarketChangePercent;
  let changeVal = q.regularMarketChange;
  if (changePct == null && prevClose && price) {
    changePct = ((price - prevClose) / prevClose) * 100;
  }
  if (changeVal == null && prevClose && price) {
    changeVal = price - prevClose;
  }

  const pe = q.trailingPE ?? q.forwardPE;
  const eps = q.epsTrailingTwelveMonths ?? q.epsForward;

  return {
    currentPrice: parseFloat(price.toFixed(2)),
    dailyChangePct: parseFloat((changePct ?? 0).toFixed(2)),
    changeVal: changeVal != null ? parseFloat(changeVal.toFixed(2)) : 0,
    companyName: q.longName || q.shortName || undefined,
    currency: q.currency || undefined,
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
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");

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
      if (built) {
        results[orig] = built;
        const baseSym = orig.split('.')[0].split(':')[1] || orig.split('.')[0];
        results[baseSym] = built;
        results[`${baseSym}.DE`] = built;
        results[`${baseSym}.AS`] = built;
      }
    }

    // --- Step 2: v8 fallback for any still-missing tickers (like SXR8.DE, VHYL, XNAS) ---
    const missing = tickers.filter(t => !results[t] || !results[t].currentPrice);
    if (missing.length > 0) {
      await Promise.allSettled(missing.map(async (t) => {
        const baseSym = t.split('.')[0].split(':')[1] || t.split('.')[0];
        const candidates = [
          originalToYahoo[t],
          t,
          `${baseSym}.DE`,
          `${baseSym}.AS`,
          `${baseSym}.L`,
          t === 'VHYL' || t === 'VHYL.DE' ? 'VGWD.DE' : null
        ].filter((c): c is string => Boolean(c));

        const uniqueCandidates = [...new Set(candidates)];
        const fetchCandidate = async (candidate: string) => {
          const q = await fetchYahooV8Single(candidate);
          if (q && q.regularMarketPrice != null) {
            const built = buildResult({ ...q, symbol: candidate });
            if (built) return { built, candidate };
          }
          throw new Error("Invalid candidate");
        };

        try {
          const success = await Promise.any(uniqueCandidates.map(c => fetchCandidate(c)));
          if (success) {
            const { built } = success;
            results[t] = built;
            results[baseSym] = built;
            results[`${baseSym}.DE`] = built;
            results[`${baseSym}.AS`] = built;
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
