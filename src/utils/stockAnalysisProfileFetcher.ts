import * as cheerio from 'cheerio';

export interface StockAnalysisCompanyProfile {
  description: string;
  address?: string;
  phone?: string;
  website?: string;
  tickerSymbol?: string;
  exchange?: string;
  stockType?: string;
  fiscalYear?: string;
  reportingCurrency?: string;
  cik?: string;
  cusip?: string;
  isin?: string;
  officers: Array<{ name: string; title: string; pay?: string }>;
}

const saProfileCache = new Map<string, { data: StockAnalysisCompanyProfile | null; ts: number }>();

export async function fetchStockAnalysisCompanyProfile(
  rawTicker: string,
  isEuropean: boolean = false
): Promise<StockAnalysisCompanyProfile | null> {
  const clean = rawTicker.trim().toLowerCase();
  if (!clean) return null;

  const cacheKey = `${clean}_${isEuropean ? 'eu' : 'us'}`;
  const cached = saProfileCache.get(cacheKey);
  if (cached && (Date.now() - cached.ts < 30 * 60 * 1000)) {
    return cached.data;
  }

  // StockAnalysis uses /stocks/{sym}/company/ for US stocks
  const url = isEuropean
    ? `https://stockanalysis.com/quote/${clean}/company/`
    : `https://stockanalysis.com/stocks/${encodeURIComponent(clean.replace('-', '.'))}/company/`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) {
      saProfileCache.set(cacheKey, { data: null, ts: Date.now() });
      return null;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const descParagraphs: string[] = [];
    const officers: Array<{ name: string; title: string }> = [];
    const detailsMap: Record<string, string> = {};
    let address = '';
    let website = '';

    $('h2').each((_, el) => {
      const heading = $(el).text().trim();

      if (heading === 'Company Description') {
        const container = $(el).next();
        container.find('p').each((__, p) => {
          const txt = $(p).text().trim();
          if (txt) descParagraphs.push(txt);
        });
        if (descParagraphs.length === 0) {
          $(el).parent().find('p').each((__, p) => {
            const txt = $(p).text().trim();
            if (txt) descParagraphs.push(txt);
          });
        }
      }

      if (heading === 'Key Executives') {
        const tbl = $(el).parent().find('table').first();
        tbl.find('tbody tr').each((__, tr) => {
          const tds = $(tr).find('td');
          if (tds.length >= 2) {
            const name = $(tds[0]).text().trim();
            const title = $(tds[1]).text().trim();
            if (name && title) officers.push({ name, title });
          }
        });
      }

      if (heading === 'Contact Details' || heading === 'Stock Details') {
        const box = $(el).parent();
        box.find('tr').each((__, tr) => {
          const tds = $(tr).find('td');
          if (tds.length >= 2) {
            const k = $(tds[0]).text().replace(':', '').trim();
            const v = $(tds[1]).text().trim();
            if (k && v) detailsMap[k] = v;
          }
        });
        // Contact Details sometimes uses div rows or address blocks
        if (heading === 'Contact Details') {
          const boxText = box.text();
          if (!detailsMap['Address']) {
            const addrEl = box.find('div').filter((__, d) => $(d).text().includes('Address:')).first();
            if (addrEl.length) {
              const rawAddr = addrEl.text().replace('Address:', '').replace(/\s+/g, ' ').trim();
              if (rawAddr) address = rawAddr;
            }
          }
          const siteLink = box.find('a[href^="http"]').first().attr('href');
          if (siteLink) website = siteLink;
        }
      }
    });

    const result: StockAnalysisCompanyProfile = {
      description: descParagraphs.join('\n\n'),
      address: detailsMap['Address'] || address || undefined,
      phone: detailsMap['Phone'] || undefined,
      website: website || (detailsMap['Website'] ? (detailsMap['Website'].startsWith('http') ? detailsMap['Website'] : `https://${detailsMap['Website']}`) : undefined),
      tickerSymbol: detailsMap['Ticker Symbol'] || undefined,
      exchange: detailsMap['Exchange'] || undefined,
      stockType: detailsMap['Stock Type'] || undefined,
      fiscalYear: detailsMap['Fiscal Year'] || undefined,
      reportingCurrency: detailsMap['Reporting Currency'] || undefined,
      cik: detailsMap['CIK Code'] || undefined,
      cusip: detailsMap['CUSIP Number'] || undefined,
      isin: detailsMap['ISIN Number'] || undefined,
      officers,
    };

    if (!result.description && result.officers.length === 0 && !result.cik) {
      saProfileCache.set(cacheKey, { data: null, ts: Date.now() });
      return null;
    }

    saProfileCache.set(cacheKey, { data: result, ts: Date.now() });
    return result;
  } catch {
    return null;
  }
}
