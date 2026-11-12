/**
 * Utility functions for centralizing stock calculations:
 * 1. OVER / UNDER Weight Allocation (buySell status: UNDERVALUED, OVERVALUED, ДРУГИ)
 * 2. Signal Weight Allocation (signal: Buy, Sell, Hold, -)
 * 3. Difference % (Fair Price vs Current Price)
 */

export function calculateBuySellStatus(
  currentPrice: number | null | undefined,
  fairPrice: number | null | undefined,
  buyThreshold = 10,
  sellThreshold = 10
): 'UNDERVALUED' | 'OVERVALUED' | 'ДРУГИ' {
  if (
    fairPrice == null || typeof fairPrice !== 'number' || fairPrice <= 0 ||
    currentPrice == null || typeof currentPrice !== 'number' || currentPrice <= 0
  ) {
    return 'ДРУГИ';
  }

  // dev is % deviation of currentPrice relative to fairPrice
  // dev = ((currentPrice - fairPrice) / fairPrice) * 100
  // dev < -buyThreshold: current price is at least buyThreshold% BELOW fair price -> UNDERVALUED
  // dev > sellThreshold: current price is at least sellThreshold% ABOVE fair price -> OVERVALUED
  // otherwise in-between -> ДРУГИ
  const dev = ((currentPrice - fairPrice) / fairPrice) * 100;
  if (dev < -buyThreshold) {
    return 'UNDERVALUED';
  } else if (dev > sellThreshold) {
    return 'OVERVALUED';
  } else {
    return 'ДРУГИ';
  }
}

export function calculateSignalStatus(
  currentPrice: number | null | undefined,
  low52: number | null | undefined,
  high52: number | null | undefined,
  signalThreshold = 5
): 'Buy' | 'Sell' | 'Hold' | '-' {
  if (
    currentPrice == null || typeof currentPrice !== 'number' || currentPrice <= 0 ||
    low52 == null || typeof low52 !== 'number' || low52 <= 0 ||
    high52 == null || typeof high52 !== 'number' || high52 <= 0
  ) {
    return '-';
  }

  const buyLimit = low52 * (1 + signalThreshold / 100);
  const sellLimit = high52 * (1 - signalThreshold / 100);

  if (currentPrice <= buyLimit) {
    return 'Buy';
  } else if (currentPrice >= sellLimit) {
    return 'Sell';
  } else {
    return 'Hold';
  }
}

export function calculateDifference(
  currentPrice: number | null | undefined,
  fairPrice: number | null | undefined
): number | null {
  if (
    fairPrice == null || typeof fairPrice !== 'number' || fairPrice <= 0 ||
    currentPrice == null || typeof currentPrice !== 'number' || currentPrice <= 0
  ) {
    return null;
  }
  return parseFloat((((fairPrice - currentPrice) / currentPrice) * 100).toFixed(2));
}
