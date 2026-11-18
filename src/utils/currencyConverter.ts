// Central Currency Conversion Engine for RayVes Capital Platform
// Supports EUR (€) and USD ($), with smart conversion from native currencies (EUR, USD, GBP)

export type DisplayCurrency = 'EUR' | 'USD';

/**
 * Identify native currency of a stock based on ticker suffix or stored currency attribute
 */
export function getStockNativeCurrency(stock?: { ticker?: string; currency?: string } | null): 'EUR' | 'USD' | 'GBP' {
  if (!stock) return 'USD';
  
  if (stock.currency) {
    const c = stock.currency.toUpperCase();
    if (c === 'EUR') return 'EUR';
    if (c === 'USD') return 'USD';
    if (c === 'GBP' || c === 'GBX' || c === 'GBp') return 'GBP';
  }

  const ticker = (stock.ticker || '').toUpperCase();
  // European exchanges: Germany, France, Netherlands, Spain, Italy, Austria, Belgium, Finland, Portugal, Bulgaria (EUR)
  if (
    ticker.endsWith('.DE') || ticker.endsWith('.F') || ticker.endsWith('.PA') || 
    ticker.endsWith('.AS') || ticker.endsWith('.MC') || ticker.endsWith('.MI') || 
    ticker.endsWith('.VI') || ticker.endsWith('.BR') || ticker.endsWith('.HE') || 
    ticker.endsWith('.LS') || ticker.endsWith('.SO') || ticker.endsWith('.ST') ||
    ticker.endsWith('.CO')
  ) {
    return 'EUR';
  }

  // UK exchanges: London (GBP)
  if (ticker.endsWith('.L') || ticker.endsWith('.LON')) {
    return 'GBP';
  }

  return 'USD';
}

/**
 * Returns symbol for currency
 */
export function getCurrencySymbol(curr: DisplayCurrency | string = 'EUR'): string {
  const c = curr.toUpperCase();
  if (c === 'EUR') return '€';
  if (c === 'GBP' || c === 'GBX') return '£';
  return '$';
}

/**
 * Convert value from source currency to target display currency
 */
export function convertCurrency(
  val: number | null | undefined,
  fromCurr: string = 'USD',
  targetCurr: DisplayCurrency = 'EUR',
  eurUsdRate: number = 1.08
): number {
  if (val === null || val === undefined || isNaN(val)) return 0;
  
  const from = fromCurr.toUpperCase();
  const target = targetCurr.toUpperCase();

  // If already identical
  if (from === target) return val;

  // Handle British pence (GBX / GBp)
  let baseVal = val;
  let normalizedFrom = from;
  if (from === 'GBX' || from === 'GBP') {
    normalizedFrom = 'GBP';
  }

  const safeEurUsd = eurUsdRate > 0 ? eurUsdRate : 1.08;
  const gbpUsdRate = 1.27; // 1 GBP ~ 1.27 USD

  if (normalizedFrom === 'USD' && target === 'EUR') {
    return baseVal / safeEurUsd;
  }
  if (normalizedFrom === 'EUR' && target === 'USD') {
    return baseVal * safeEurUsd;
  }
  if (normalizedFrom === 'GBP' && target === 'USD') {
    return baseVal * gbpUsdRate;
  }
  if (normalizedFrom === 'GBP' && target === 'EUR') {
    return (baseVal * gbpUsdRate) / safeEurUsd;
  }

  return baseVal;
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
  targetCurr: DisplayCurrency = 'EUR',
  eurUsdRate: number = 1.08
): string {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return '—';
  
  const converted = convertCurrency(val, fromCurr, targetCurr, eurUsdRate);
  const sym = getCurrencySymbol(targetCurr);

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
