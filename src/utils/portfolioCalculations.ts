import { PortfolioPosition } from '../types';

/**
 * Consolidates portfolio positions by ticker (case-insensitive).
 * When multiple lots/rows of the same ticker exist, aggregates them into a single position:
 * - Sums the total number of shares
 * - Calculates weighted average buy price: sum(shares * buyPrice) / totalShares
 * - Sums paid fees
 * - Preserves the latest non-empty company metadata (companyName, fairPrice, dividends, targets, currency, notes)
 */
export function consolidatePositions(positions: PortfolioPosition[]): PortfolioPosition[] {
  if (!Array.isArray(positions) || positions.length <= 1) return positions || [];

  const map = new Map<string, PortfolioPosition>();
  let hasDuplicates = false;

  for (const pos of positions) {
    if (!pos || !pos.ticker) continue;
    const tickerKey = pos.ticker.trim().toUpperCase();

    if (map.has(tickerKey)) {
      hasDuplicates = true;
      const existing = map.get(tickerKey)!;
      const totalShares = (existing.shares || 0) + (pos.shares || 0);
      const totalCost = ((existing.shares || 0) * (existing.buyPrice || 0)) + ((pos.shares || 0) * (pos.buyPrice || 0));
      const weightedAvgBuyPrice = totalShares > 0 ? totalCost / totalShares : (existing.buyPrice || pos.buyPrice || 0);
      const totalFee = (existing.fee || 0) + (pos.fee || 0);

      let mergedNotes = existing.notes;
      if (pos.notes && pos.notes !== existing.notes) {
        mergedNotes = existing.notes ? `${existing.notes}; ${pos.notes}` : pos.notes;
      }

      map.set(tickerKey, {
        ...existing,
        shares: parseFloat(totalShares.toFixed(4)),
        buyPrice: parseFloat(weightedAvgBuyPrice.toFixed(4)),
        fee: parseFloat(totalFee.toFixed(2)),
        companyName: pos.companyName || existing.companyName,
        buyDate: pos.buyDate || existing.buyDate,
        fairPrice: pos.fairPrice !== undefined ? pos.fairPrice : existing.fairPrice,
        annualDivPerShare: pos.annualDivPerShare !== undefined ? pos.annualDivPerShare : existing.annualDivPerShare,
        buyTarget: pos.buyTarget !== undefined ? pos.buyTarget : existing.buyTarget,
        sellTarget: pos.sellTarget !== undefined ? pos.sellTarget : existing.sellTarget,
        currency: pos.currency || existing.currency,
        notes: mergedNotes
      });
    } else {
      map.set(tickerKey, { ...pos });
    }
  }

  return hasDuplicates ? Array.from(map.values()) : positions;
}
