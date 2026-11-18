// Central Multi-Currency & Real-Time FX Conversion Engine for RayVes Capital Platform
// Supports: Native/AUTO (US in USD, European in EUR, Chinese in CNY, British in GBP),
// as well as global conversion into EUR (€), USD ($), CNY (¥), or GBP (£).

export type DisplayCurrency = 'AUTO' | 'EUR' | 'USD' | 'CNY' | 'GBP';

export interface FxRates {
  EUR_USD: number; // 1 EUR = X USD (e.g. 1.08)
  USD_CNY: number; // 1 USD = X CNY (e.g. 7.24)
  GBP_USD: number; // 1 GBP = X USD (e.g. 1.27)
  USD_HKD: number; // 1 USD = X HKD (e.g. 7.78)
  USD_JPY: number; // 1 USD = X JPY (e.g. 154.5)
}

export const DEFAULT_FX_RATES: FxRates = {
  EUR_USD: 1.08,
  USD_CNY: 7.24,
  GBP_USD: 1.27,
  USD_HKD: 7.78,
  USD_JPY: 154.5,
};

let cachedLiveFxRates: FxRates = { ...DEFAULT_FX_RATES };

/**
 * Fetch live FX rates from the API endpoint
 */
export async function fetchLiveFxRates(): Promise<FxRates> {
  try {
    const res = await fetch('/api/stock-quotes?symbols=EURUSD=X,USDCNY=X,GBPUSD=X,USDHKD=X,USDJPY=X');
    if (!res.ok) return cachedLiveFxRates;
    const data = await res.json();
    const q = data?.quotes || {};

    const eurUsd = q['EURUSD=X']?.currentPrice;
    const usdCny = q['USDCNY=X']?.currentPrice;
    const gbpUsd = q['GBPUSD=X']?.currentPrice;
    const usdHkd = q['USDHKD=X']?.currentPrice;
    const usdJpy = q['USDJPY=X']?.currentPrice;

    cachedLiveFxRates = {
      EUR_USD: typeof eurUsd === 'number' && eurUsd > 0.5 ? eurUsd : cachedLiveFxRates.EUR_USD,
      USD_CNY: typeof usdCny === 'number' && usdCny > 4.0 ? usdCny : cachedLiveFxRates.USD_CNY,
      GBP_USD: typeof gbpUsd === 'number' && gbpUsd > 0.7 ? gbpUsd : cachedLiveFxRates.GBP_USD,
      USD_HKD: typeof usdHkd === 'number' && usdHkd > 5.0 ? usdHkd : cachedLiveFxRates.USD_HKD,
      USD_JPY: typeof usdJpy === 'number' && usdJpy > 80.0 ? usdJpy : cachedLiveFxRates.USD_JPY,
    };
  } catch (e) {
    console.warn('Using fallback FX rates:', e);
  }
  return cachedLiveFxRates;
}

export function getCachedFxRates(): FxRates {
  return cachedLiveFxRates;
}

/**
 * Accurately identify native/trading currency of a stock
 * American: USD ($)
 * European: EUR (€)
 * Chinese (mainland/HK): CNY (¥) or HKD
 * British: GBP (£)
 * Japanese: JPY (¥)
 */
export function getStockNativeCurrency(stock?: { ticker?: string; currency?: string; companyName?: string } | null): string {
  if (!stock) return 'USD';
  
  // 1. Explicit currency from data / Yahoo / TradingView
  if (stock.currency) {
    const c = stock.currency.trim().toUpperCase();
    if (c === 'EUR') return 'EUR';
    if (c === 'USD') return 'USD';
    if (c === 'CNY' || c === 'RMB') return 'CNY';
    if (c === 'GBP' || c === 'GBX' || c === 'GBPENCE') return 'GBP';
    if (c === 'HKD') return 'HKD';
    if (c === 'JPY') return 'JPY';
    if (c === 'CHF') return 'CHF';
  }

  const ticker = (stock.ticker || '').trim().toUpperCase();

  // 2. Chinese Mainland Exchanges (.SS Shanghai, .SZ Shenzhen, or 6-digit A-share tickers)
  if (
    ticker.endsWith('.SS') || ticker.endsWith('.SZ') ||
    ticker.startsWith('SHA:') || ticker.startsWith('SHE:') ||
    /^(00|30|60|68)\d{4}(\.(SZ|SS))?$/.test(ticker)
  ) {
    return 'CNY';
  }

  // 3. Hong Kong Exchange (.HK)
  if (ticker.endsWith('.HK') || ticker.startsWith('HKG:') || /^\d{4,5}\.HK$/.test(ticker)) {
    return 'HKD';
  }

  // 4. European exchanges (Germany, France, Netherlands, Spain, Italy, Austria, Belgium, Finland, Portugal, Bulgaria)
  if (
    ticker.endsWith('.DE') || ticker.endsWith('.F') || ticker.endsWith('.PA') || 
    ticker.endsWith('.AS') || ticker.endsWith('.MC') || ticker.endsWith('.MI') || 
    ticker.endsWith('.VI') || ticker.endsWith('.BR') || ticker.endsWith('.HE') || 
    ticker.endsWith('.LS') || ticker.endsWith('.SO') || ticker.endsWith('.ST') ||
    ticker.endsWith('.CO') || ticker.startsWith('ETR:') || ticker.startsWith('EPA:') ||
    ticker.startsWith('AMS:') || ticker.startsWith('BME:') || ticker.startsWith('BIT:')
  ) {
    return 'EUR';
  }

  // 5. UK exchanges (London)
  if (ticker.endsWith('.L') || ticker.endsWith('.LON') || ticker.startsWith('LON:')) {
    return 'GBP';
  }

  // 6. Japan exchange (Tokyo)
  if (ticker.endsWith('.T') || ticker.startsWith('TYO:')) {
    return 'JPY';
  }

  // 7. Check by company name for prominent Chinese or European stocks if ticker is plain
  const name = (stock.companyName || '').toLowerCase();
  if (name.includes('kweichow moutai') || name.includes('byd co') || name.includes('contemporary amperex') || name.includes('ping an')) {
    return 'CNY';
  }
  if (name.includes('tencent') || name.includes('alibaba') && ticker.includes('9988')) {
    return 'HKD';
  }

  return 'USD';
}

/**
 * Returns symbol for currency
 */
export function getCurrencySymbol(curr: DisplayCurrency | string = 'EUR'): string {
  const c = curr.toUpperCase();
  if (c === 'EUR') return '€';
  if (c === 'USD') return '$';
  if (c === 'CNY' || c === 'RMB') return '¥';
  if (c === 'GBP' || c === 'GBX') return '£';
  if (c === 'HKD') return 'HK$';
  if (c === 'JPY') return '¥';
  if (c === 'CHF') return 'CHF';
  if (c === 'AUTO') return '🌐';
  return '$';
}

/**
 * Convert value from source currency to target display currency using live FX rates
 */
export function convertCurrency(
  val: number | null | undefined,
  fromCurr: string = 'USD',
  targetCurr: DisplayCurrency | string = 'EUR',
  ratesInput?: FxRates | number
): number {
  if (val === null || val === undefined || isNaN(val)) return 0;
  
  const from = fromCurr.toUpperCase();
  const target = targetCurr.toUpperCase();

  // If AUTO mode or identical currency, no conversion needed
  if (target === 'AUTO' || from === target) return val;

  const rates: FxRates = typeof ratesInput === 'number'
    ? { ...cachedLiveFxRates, EUR_USD: ratesInput > 0 ? ratesInput : cachedLiveFxRates.EUR_USD }
    : (ratesInput || cachedLiveFxRates);

  // 1. Convert source value to intermediate USD ($)
  let valInUsd = val;
  if (from === 'USD') {
    valInUsd = val;
  } else if (from === 'EUR') {
    valInUsd = val * rates.EUR_USD;
  } else if (from === 'GBP') {
    valInUsd = val * rates.GBP_USD;
  } else if (from === 'GBX' || from === 'GBPENCE') {
    valInUsd = (val / 100) * rates.GBP_USD;
  } else if (from === 'CNY' || from === 'RMB') {
    valInUsd = val / rates.USD_CNY;
  } else if (from === 'HKD') {
    valInUsd = val / rates.USD_HKD;
  } else if (from === 'JPY') {
    valInUsd = val / rates.USD_JPY;
  }

  // 2. Convert USD to target currency
  if (target === 'USD') {
    return valInUsd;
  }
  if (target === 'EUR') {
    return valInUsd / rates.EUR_USD;
  }
  if (target === 'CNY' || target === 'RMB') {
    return valInUsd * rates.USD_CNY;
  }
  if (target === 'GBP') {
    return valInUsd / rates.GBP_USD;
  }
  if (target === 'HKD') {
    return valInUsd * rates.USD_HKD;
  }
  if (target === 'JPY') {
    return valInUsd * rates.USD_JPY;
  }

  return valInUsd;
}

/**
 * Format currency amount with symbol and fixed decimals
 */
export function formatCurrencyAmount(
  val: number | null | undefined,
  curr: DisplayCurrency | string = 'EUR',
  decimals: number = 2
): string {
  if (val === null || val === undefined || isNaN(val)) return '-';
  const sym = getCurrencySymbol(curr);
  return `${sym}${Number(val).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

/**
 * Formats large market cap numbers (T, B, M) in the active currency
 */
export function formatCurrencyMarketCap(
  val: number | null | undefined,
  fromCurr: string = 'USD',
  targetCurr: DisplayCurrency | string = 'EUR',
  ratesInput?: FxRates | number
): string {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return '—';
  
  const effectiveTarget = targetCurr === 'AUTO' ? fromCurr : targetCurr;
  const converted = convertCurrency(val, fromCurr, effectiveTarget, ratesInput);
  const sym = getCurrencySymbol(effectiveTarget);

  if (converted >= 1e12) {
    return `${sym}${(converted / 1e12).toFixed(2)}T`;
  }
  if (converted >= 1e9) {
    return `${sym}${(converted / 1e9).toFixed(2)}B`;
  }
  if (converted >= 1e6) {
    return `${sym}${(converted / 1e6).toFixed(1)}M`;
  }
  return `${sym}${Math.round(converted).toLocaleString()}`;
}
