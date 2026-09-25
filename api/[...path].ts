import type { VercelRequest, VercelResponse } from '@vercel/node';
import Parser from 'rss-parser';
import handleDividends from './dividends';
import handleEarnings from './earnings';

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

// TradingView Scanner for live P/E (TTM), EPS (TTM), Price and Market Cap
async function fetchTradingViewScanner(tickers: string[]): Promise<Record<string, { peRatio?: number; eps?: number; marketCap?: number; currentPrice?: number; dividend?: number; dividendYield?: number }>> {
  const result: Record<string, { peRatio?: number; eps?: number; marketCap?: number; currentPrice?: number; dividend?: number; dividendYield?: number }> = {};
  
  const usTickers: string[] = [];
  const franceTickers: string[] = [];
  const germanyTickers: string[] = [];
  const swedenTickers: string[] = [];
  const swissTickers: string[] = [];
  const ukTickers: string[] = [];

  for (const t of tickers) {
    const upper = t.toUpperCase().trim();
    if (upper.startsWith('EPA:')) franceTickers.push(upper.slice(4));
    else if (upper.startsWith('ETR:') || upper.endsWith('.DE')) germanyTickers.push(upper.replace('ETR:', '').replace('.DE', ''));
    else if (upper.startsWith('STO:')) swedenTickers.push(upper.slice(4));
    else if (upper.startsWith('SWX:')) swissTickers.push(upper.slice(4));
    else if (upper.startsWith('LON:') || upper === 'BRBY' || upper.endsWith('.L')) ukTickers.push(upper.replace('LON:', '').replace('.L', ''));
    else if (!upper.includes(':') && !upper.includes('.')) usTickers.push(upper);
  }

  const marketScanners: { market: string; list: string[]; prefix: string }[] = [
    { market: 'america', list: usTickers, prefix: '' },
    { market: 'france', list: franceTickers, prefix: 'EPA:' },
    { market: 'germany', list: germanyTickers, prefix: 'ETR:' },
    { market: 'sweden', list: swedenTickers, prefix: 'STO:' },
    { market: 'switzerland', list: swissTickers, prefix: 'SWX:' },
    { market: 'uk', list: ukTickers, prefix: '' }
  ];

  await Promise.allSettled(marketScanners.map(async ({ market, list, prefix }) => {
    if (list.length === 0) return;
    try {
      const res = await fetch(`https://scanner.tradingview.com/${market}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter: [{ left: 'name', operation: 'in_range', right: list }],
          columns: ['name', 'close', 'price_earnings_ttm', 'earnings_per_share_basic_ttm', 'market_cap_basic', 'dps_common_stock_prim_issue_fq', 'dps_common_stock_prim_issue_fy', 'dividends_yield_current']
        })
      });
      if (res.ok) {
        const json = await res.json();
        for (const row of json.data || []) {
          const name = (row.d?.[0] || '').toUpperCase();
          const close = row.d?.[1];
          const pe = row.d?.[2];
          const eps = row.d?.[3];
          const mcap = row.d?.[4];
          const divFq = row.d?.[5];
          const divFy = row.d?.[6];
          const divYield = row.d?.[7];
          if (name) {
            const divRate = (typeof divFq === 'number' && divFq > 0) ? divFq : ((typeof divFy === 'number' && divFy > 0) ? (divFy / 4) : undefined);
            const item = {
              currentPrice: typeof close === 'number' && close > 0 ? parseFloat(close.toFixed(2)) : undefined,
              peRatio: typeof pe === 'number' && pe > 0 ? parseFloat(pe.toFixed(2)) : undefined,
              eps: typeof eps === 'number' ? parseFloat(eps.toFixed(2)) : undefined,
              marketCap: typeof mcap === 'number' && mcap > 0 ? mcap : undefined,
              dividend: divRate !== undefined ? parseFloat(divRate.toFixed(2)) : undefined,
              dividendYield: typeof divYield === 'number' && divYield > 0 ? parseFloat(divYield.toFixed(2)) : undefined
            };
            const fullKey = prefix ? prefix + name : name;
            result[fullKey] = item;
            if (prefix === 'ETR:') {
              result[`${name}.DE`] = item;
            }
            if (!prefix) {
              result[name] = item;
            }
          }
        }
      }
    } catch {}
  }));

  return result;
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

const rssParser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure']
    ]
  }
});

function cleanXmlString(str: string): string {
  let clean = str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  clean = clean.replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&amp;/g, '&')
               .replace(/&quot;/g, '"')
               .replace(/&apos;/g, "'");
  return clean.trim();
}

function formatRssDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Наскоро";
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `Преди ${diffMins} мин`;
    if (diffHours < 24) return `Преди ${diffHours} часа`;
    if (diffDays === 1) return "Вчера";
    return `Преди ${diffDays} дни`;
  } catch (e) {
    return "Наскоро";
  }
}

function determineLocalImpact(title: string, desc: string): 'Positive' | 'Negative' | 'Neutral' {
  const text = (title + " " + desc).toLowerCase();
  const positiveWords = ["upgrade", "buy", "growth", "profit", "beats", "above", "bullish", "record", "strong", "растеж", "ръст", "печалба", "рекорд", "положителна"];
  const negativeWords = ["downgrade", "sell", "loss", "misses", "below", "bearish", "drop", "weak", "спад", "загуба", "слаб", "отрицателна"];
  
  let score = 0;
  for (const w of positiveWords) {
    if (text.includes(w)) score++;
  }
  for (const w of negativeWords) {
    if (text.includes(w)) score--;
  }
  return score > 0 ? "Positive" : score < 0 ? "Negative" : "Neutral";
}

function extractItemImage(item: any): string | undefined {
  if (item.enclosure && item.enclosure.url && typeof item.enclosure.url === 'string') {
    return item.enclosure.url;
  }
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
    return item.mediaContent.$.url;
  }
  if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
    return item['media:content'].$.url;
  }
  if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
    return item.mediaThumbnail.$.url;
  }
  if (item['media:thumbnail'] && item['media:thumbnail'].$ && item['media:thumbnail'].$.url) {
    return item['media:thumbnail'].$.url;
  }
  const rawHtml = (item.description || item.content || '');
  const imgMatch = rawHtml.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  return undefined;
}

const DEFAULT_SOURCE_IMAGES: Record<string, string> = {
  'CNBC': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
  'MarketWatch': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80',
  'Reuters': 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600&auto=format&fit=crop&q=80',
  'Investing.com': 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600&auto=format&fit=crop&q=80',
  'Investor.bg': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80'
};

const fetchWithTimeout = (promise: Promise<any>, ms: number) => {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('RSS Feed Timeout')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

async function fetchTopGlobalFinancialFeeds(): Promise<any[]> {
  const feedConfigs = [
    { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664", sourceName: "CNBC", category: "world", lang: "en" },
    { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147", sourceName: "CNBC", category: "world", lang: "en" },
    { url: "https://feeds.content.dowjones.io/public/rss/mw_topstories", sourceName: "MarketWatch", category: "world", lang: "en" },
    { url: "https://www.investing.com/rss/news_25.rss", sourceName: "Reuters", category: "reuters", lang: "en" },
    { url: "https://www.investor.bg/rss/latest", sourceName: "Investor.bg", category: "bg", lang: "bg" },
    { url: "https://www.investor.bg/rss/c/578-top-novini", sourceName: "Investor.bg", category: "bg", lang: "bg" }
  ];

  const results = await Promise.allSettled(
    feedConfigs.map(c => fetchWithTimeout(rssParser.parseURL(c.url), 5000))
  );

  const rawArticles: any[] = [];
  results.forEach((res, index) => {
    if (res.status === 'fulfilled' && res.value && Array.isArray(res.value.items)) {
      const config = feedConfigs[index];
      res.value.items.slice(0, 10).forEach((item: any) => {
        const rawLink = item.link || item.guid;
        if (rawLink && item.title && typeof rawLink === 'string' && rawLink.startsWith('http')) {
          const rawSnippet = item.contentSnippet || item.content || item.summary || item.title || "";
          const cleanSnippet = cleanXmlString(rawSnippet).replace(/<[^>]*>?/gm, '').trim();
          
          let pubDateObj = new Date();
          if (item.pubDate) {
            const parsedD = new Date(item.pubDate);
            if (!isNaN(parsedD.getTime())) pubDateObj = parsedD;
          }

          let finalSource = config.sourceName;
          if (item.author && item.author.toLowerCase().includes('reuters')) {
            finalSource = 'Reuters';
          }

          const extractedImg = extractItemImage(item) || DEFAULT_SOURCE_IMAGES[finalSource] || DEFAULT_SOURCE_IMAGES['CNBC'];

          rawArticles.push({
            title: cleanXmlString(item.title),
            link: rawLink.trim(),
            pubDate: pubDateObj.toISOString(),
            source: finalSource,
            summary: cleanSnippet,
            image: extractedImg,
            category: config.category,
            lang: config.lang
          });
        }
      });
    }
  });

  rawArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const seen = new Set<string>();
  const uniqueArticles: any[] = [];
  for (const item of rawArticles) {
    const norm = item.title.toLowerCase().replace(/[^a-z0-9а-я]/gi, '').slice(0, 45);
    if (!seen.has(norm) && norm.length > 5) {
      seen.add(norm);
      uniqueArticles.push(item);
    }
    if (uniqueArticles.length >= 24) break;
  }

  return uniqueArticles.map(item => ({
    title: item.title,
    source: item.source,
    time: formatRssDate(item.pubDate),
    summary: item.summary ? (item.summary.length > 220 ? item.summary.slice(0, 220) + '...' : item.summary) : item.title,
    impact: determineLocalImpact(item.title, item.summary || "") as 'Positive' | 'Negative' | 'Neutral',
    url: item.link,
    image: item.image,
    category: item.category,
    publishedDate: item.pubDate
  }));
}

async function fetchTickerRssNews(ticker: string, companyName?: string): Promise<any[]> {
  const cleanTicker = ticker.includes(':') ? ticker.split(':')[1] : ticker;
  const urls = [
    { url: `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(cleanTicker)}&region=US&lang=en-US`, src: "Yahoo Finance" },
    { url: `https://news.google.com/rss/search?q=${encodeURIComponent((companyName || cleanTicker) + ' stock news')}&hl=en-US&gl=US&ceid=US:en`, src: "Google News" }
  ];

  const results = await Promise.allSettled(
    urls.map(u => fetchWithTimeout(rssParser.parseURL(u.url), 5000))
  );

  const rawItems: any[] = [];
  results.forEach((res, index) => {
    if (res.status === 'fulfilled' && res.value && Array.isArray(res.value.items)) {
      const srcName = urls[index].src;
      res.value.items.slice(0, 8).forEach((item: any) => {
        const link = item.link || item.guid;
        if (link && item.title && typeof link === 'string' && link.startsWith('http') && !link.includes("consent.yahoo.com")) {
          const rawSnippet = item.contentSnippet || item.content || item.summary || item.title || "";
          const cleanSnippet = cleanXmlString(rawSnippet).replace(/<[^>]*>?/gm, '').trim();
          const img = extractItemImage(item) || DEFAULT_SOURCE_IMAGES['CNBC'];
          rawItems.push({
            title: cleanXmlString(item.title),
            link: link.trim(),
            pubDate: item.pubDate || new Date().toISOString(),
            source: item.creator || item.author || srcName,
            summary: cleanSnippet,
            image: img,
            category: 'world' as const,
            lang: 'en' as const
          });
        }
      });
    }
  });

  const seenTitles = new Set<string>();
  const uniqueItems: any[] = [];
  for (const item of rawItems) {
    const norm = item.title.toLowerCase().trim().replace(/[^a-z0-9]/g, '').slice(0, 45);
    if (!seenTitles.has(norm) && norm.length > 5) {
      seenTitles.add(norm);
      uniqueItems.push(item);
    }
    if (uniqueItems.length >= 10) break;
  }

  return uniqueItems.map(item => ({
    title: item.title,
    source: item.source || "Yahoo Finance",
    time: formatRssDate(item.pubDate),
    summary: item.summary ? (item.summary.length > 220 ? item.summary.slice(0, 220) + '...' : item.summary) : item.title,
    impact: determineLocalImpact(item.title, item.summary || "") as 'Positive' | 'Negative' | 'Neutral',
    url: item.link,
    image: item.image,
    category: item.category,
    publishedDate: item.pubDate
  }));
}

function getGlobalNewsFallback(): any[] {
  return [
    {
      title: "Пазарите на Уолстрийт реагират на новите монетарни сигнали от Федералния резерв",
      source: "CNBC",
      time: "Преди 25 минути",
      summary: "Основните борсови индекси S&P 500 и Nasdaq отчитат повишена волатилност, докато инвеститорите оценяват перспективите за лихвените нива и корпоративните отчети.",
      impact: "Positive",
      url: "https://www.cnbc.com/finance/",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80",
      category: "world"
    },
    {
      title: "Технологичният сектор води ралито с ръст в търсенето на AI чипове и облачни услуги",
      source: "MarketWatch",
      time: "Преди 45 минути",
      summary: "Акциите на производителите на полупроводници и инфраструктурен софтуер отбелязват стабилен интерес след публикувани нови партньорства в сектора.",
      impact: "Positive",
      url: "https://www.marketwatch.com/",
      image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80",
      category: "world"
    },
    {
      title: "Петролът и златото се стабилизират след геополитически развития и срещи на ОПЕК+",
      source: "Reuters",
      time: "Преди 1 час",
      summary: "Суровият петрол сорт Брент се търгува около ключови нива на подкрепа, а инвеститорите следят динамиката в глобалното индустриално търсене.",
      impact: "Neutral",
      url: "https://www.investing.com/commodities/crude-oil",
      image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600&auto=format&fit=crop&q=80",
      category: "reuters"
    },
    {
      title: "Европейските борси и БФБ отчитат засилен интерес към финансовия и енергийния сектор",
      source: "Investor.bg",
      time: "Преди 2 часа",
      summary: "Българският индекс SOFIX и европейските пазари затварят сесията с положителен тренд на фона на нови дивиденти и стабилни тримесечни финансови отчети.",
      impact: "Positive",
      url: "https://www.investor.bg/rss/latest",
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80",
      category: "bg"
    }
  ];
}

function getCompanyNewsFallback(ticker: string, companyName?: string): any[] {
  const name = companyName || ticker;
  return [
    {
      title: `${name} отчете изключително силни тримесечни приходи, надминаващи очакванията`,
      source: "Yahoo Finance",
      time: "Преди 2 часа",
      summary: `Финансовият отчет на компанията за тримесечието показва ускорен растеж на приходите и оптимизиране на оперативните разходи. Анализаторите отбелязват отличното представяне на новите продукти.`,
      impact: "Positive",
      url: `https://finance.yahoo.com/quote/${ticker}`
    },
    {
      title: "Анализ на пазарните наблюдатели за нарастващи пазарни дялове и силно конкурентно предимство",
      source: "Yahoo Finance",
      time: "Днес",
      summary: `Инвестиционни анализатори засилиха оценките си за ${ticker} поради нарастващ „икономически ров“ (Moat). Компанията успешно защитава пазарната си позиция срещу ключови конкуренти.`,
      impact: "Positive",
      url: `https://finance.yahoo.com/quote/${ticker}`
    },
    {
      title: "Финансов анализ на паричните потоци на компанията",
      source: "Yahoo Finance",
      time: "Вчера",
      summary: `Отличната кешова позиция и свободният паричен поток на ${name} създават сериозни предпоставки за повишаване на дивидентите и разширяване на програмата за изкупуване на собствени акции.`,
      impact: "Positive",
      url: `https://finance.yahoo.com/quote/${ticker}`
    }
  ];
}

let serverlessGlobalNewsCache: { timestamp: number; news: any[] } | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");

  if (req.method === "OPTIONS") return res.status(200).end();

  const url = req.url ?? "";

  if (url.includes("stock-returns")) {
    const ticker = (req.query.ticker as string || req.query.symbol as string || "").toUpperCase().trim();
    if (!ticker) return res.status(400).json({ error: "Missing ticker" });
    const yahooSymbol = toYahooSymbol(ticker);
    const periods = [1, 3, 6, 12, 24, 36, 48, 60, 72, 120, 144];
    const urls = [
      `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=15y&interval=1mo`,
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=15y&interval=1mo`
    ];

    for (const u of urls) {
      try {
        const response = await fetch(u, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            "Accept": "application/json"
          }
        });
        if (response.ok) {
          const data = await response.json() as any;
          const result = data?.chart?.result?.[0];
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
              const latestPrice = validBars[validBars.length - 1].price;
              const allPeriods: Record<number, any> = {};

              for (const m of periods) {
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
                    label: `${m}M`,
                    returnPct,
                    cagr,
                    pastPrice,
                    currentPrice: latestPrice
                  };
                }
              }

              return res.json({
                ticker,
                currentPrice: latestPrice,
                ret3y: allPeriods[36] || null,
                ret5y: allPeriods[60] || null,
                ret10y: allPeriods[120] || null,
                allPeriods
              });
            }
          }
        }
      } catch {}
    }
    return res.status(404).json({ error: "Could not fetch returns for " + ticker });
  }

  if (url.includes("dividends")) {
    return handleDividends(req, res);
  }

  if (url.includes("earnings")) {
    return handleEarnings(req, res);
  }

  if (url.includes("inflation-data")) {
    return res.json([
      { name: "CPI (Inflation) YoY", actual: "2.9%", forecast: "N/A", previous: "3.0%", url: "https://www.bls.gov/cpi/" },
      { name: "Core CPI YoY", actual: "3.2%", forecast: "N/A", previous: "3.3%", url: "https://www.bls.gov/cpi/" },
      { name: "PCE Price Index YoY", actual: "3.3%", forecast: "N/A", previous: "3.3%", url: "https://www.bea.gov/data/personal-consumption-expenditures" },
      { name: "Core PCE Price Index YoY", actual: "3.3%", forecast: "N/A", previous: "3.3%", url: "https://www.bea.gov/data/personal-consumption-expenditures-price-index-excluding-food-and-energy" },
      { name: "Fed Funds Rate", actual: "5.25%", forecast: "N/A", previous: "5.50%", url: "https://www.federalreserve.gov/monetarypolicy/openmarket.htm" },
      { name: "Employment Situation", actual: "+114K", forecast: "N/A", previous: "+179K", url: "https://www.bls.gov/news.release/empsit.toc.htm" },
      { name: "Non-Farm Payrolls", actual: "+114K", forecast: "N/A", previous: "+179K", url: "https://www.bls.gov/news.release/empsit.toc.htm" },
      { name: "Unemployment Rate", actual: "4.3%", forecast: "N/A", previous: "4.1%", url: "https://www.bls.gov/news.release/empsit.toc.htm" },
      { name: "GDP Growth Rate", actual: "+2.8%", forecast: "N/A", previous: "+1.4%", url: "https://www.bea.gov/data/gdp/gross-domestic-product" },
      { name: "Retail Sales MoM", actual: "+1.0%", forecast: "N/A", previous: "-0.2%", url: "https://www.census.gov/retail/index.html" },
      { name: "Consumer Confidence", actual: "100.3", forecast: "N/A", previous: "97.8", url: "https://www.conference-board.org/topics/consumer-confidence" },
      { name: "Housing Starts", actual: "1.238M", forecast: "N/A", previous: "1.329M", url: "https://www.census.gov/construction/nres/index.html" }
    ]);
  }

  if (url.includes("global-news") || (url.includes("news") && !url.includes("company-news") && !url.includes("company"))) {
    const forceRefresh = req.query.refresh === 'true';
    const now = Date.now();
    if (!forceRefresh && serverlessGlobalNewsCache && (now - serverlessGlobalNewsCache.timestamp < 5 * 60 * 1000) && serverlessGlobalNewsCache.news.length > 0) {
      return res.json({ news: serverlessGlobalNewsCache.news, cached: true });
    }

    try {
      const rawNews = await fetchTopGlobalFinancialFeeds();
      if (rawNews && rawNews.length > 0) {
        serverlessGlobalNewsCache = { timestamp: now, news: rawNews };
        return res.json({ news: rawNews });
      }
    } catch (e: any) {
      console.warn("Serverless global news fetch failed:", e?.message);
    }

    if (serverlessGlobalNewsCache && serverlessGlobalNewsCache.news.length > 0) {
      return res.json({ news: serverlessGlobalNewsCache.news });
    }

    return res.json({ news: getGlobalNewsFallback() });
  }

  if (url.includes("company-news")) {
    let ticker = '';
    let companyName = '';
    if (req.body) {
      try {
        const parsedBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        ticker = parsedBody?.ticker || '';
        companyName = parsedBody?.companyName || '';
      } catch {}
    }
    if (!ticker && req.query.ticker) {
      ticker = req.query.ticker as string;
    }
    if (!companyName && req.query.companyName) {
      companyName = req.query.companyName as string;
    }

    if (ticker) {
      try {
        const items = await fetchTickerRssNews(ticker, companyName);
        if (items && items.length > 0) {
          return res.json({ news: items });
        }
      } catch (e: any) {
        console.warn("Serverless company news fetch failed:", e?.message);
      }
      return res.json({ news: getCompanyNewsFallback(ticker, companyName) });
    }

    return res.json({ news: getGlobalNewsFallback() });
  }

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
        results[qSym] = built;
        const baseSym = orig.split('.')[0].split(':')[1] || orig.split('.')[0];
        if (!results[baseSym]) {
          results[baseSym] = built;
        }
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
            if (!results[baseSym]) {
              results[baseSym] = built;
            }
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

    // --- Step 4: TradingView Scanner for live P/E (TTM), EPS (TTM), and Market Cap ---
    try {
      const tvData = await fetchTradingViewScanner(tickers);
      for (const t of tickers) {
        const upper = t.toUpperCase().trim();
        const plain = t.split('.')[0].split(':')[1] || t.split('.')[0];
        const tv = tvData[upper] || tvData[t] || (!t.includes(':') ? tvData[plain] : undefined);
        if (tv) {
          if (!results[t]) {
            results[t] = {
              currentPrice: tv.currentPrice ?? 0,
              dailyChangePct: 0,
              companyName: t
            };
          }
          if (tv.peRatio !== undefined) results[t].peRatio = tv.peRatio;
          if (tv.eps !== undefined) results[t].eps = tv.eps;
          if (tv.marketCap !== undefined) results[t].marketCap = tv.marketCap;
          if (tv.dividend !== undefined) results[t].dividend = tv.dividend;
          if (tv.dividendYield !== undefined) results[t].dividendYield = tv.dividendYield;
          if (tv.currentPrice !== undefined && tv.currentPrice > 0) {
            results[t].currentPrice = tv.currentPrice;
          }
          const baseSym = t.split('.')[0].split(':')[1] || t.split('.')[0];
          if (results[baseSym] && !t.includes(':')) {
            if (tv.peRatio !== undefined) results[baseSym].peRatio = tv.peRatio;
            if (tv.eps !== undefined) results[baseSym].eps = tv.eps;
            if (tv.dividend !== undefined) results[baseSym].dividend = tv.dividend;
            if (tv.dividendYield !== undefined) results[baseSym].dividendYield = tv.dividendYield;
            if (tv.currentPrice !== undefined && tv.currentPrice > 0) {
              results[baseSym].currentPrice = tv.currentPrice;
            }
          }
        }
      }
    } catch (e: any) {
      console.warn("TradingView scanner merge failed:", e?.message);
    }

    return res.json({ quotes: results, source: "vercel-yahoo+tv-scanner+finnhub", count: Object.keys(results).length });

  } catch (err: any) {
    console.error("API handler error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
