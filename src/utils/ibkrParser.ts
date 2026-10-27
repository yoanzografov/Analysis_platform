import { PortfolioPosition, PortfolioTransaction, PortfolioDividendRecord } from '../types';

export interface IbkrParsedResult {
  positions: PortfolioPosition[];
  transactions: PortfolioTransaction[];
  dividends: PortfolioDividendRecord[];
  cashBalanceEUR?: number;
  cashBalanceUSD?: number;
  baseCurrency?: 'EUR' | 'USD';
  rawMatchesCount: number;
}

/**
 * Universal parser for Interactive Brokers exports:
 * 1. Activity Statement CSV (containing 'Open Positions', 'Trades', 'Dividends')
 * 2. Portfolio / Open Positions CSV
 */
export function parseIbkrCsv(csvText: string): IbkrParsedResult {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const positions: PortfolioPosition[] = [];
  const transactions: PortfolioTransaction[] = [];
  const dividends: PortfolioDividendRecord[] = [];
  let cashBalanceEUR: number | undefined;
  let cashBalanceUSD: number | undefined;
  let baseCurrency: 'EUR' | 'USD' = 'EUR';

  let currentSection = '';
  let sectionHeaders: string[] = [];

  for (const line of lines) {
    // Standard CSV tokens extractor
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    cells.push(cur.trim());

    if (cells.length < 2) continue;

    // Detect IBKR section header or metadata
    const sectionKey = cells[0].toLowerCase();

    if (cells[0] === 'Account Information' || cells[0].startsWith('Account Information')) {
      const field = cells[1] || '';
      const val = cells[2] || '';
      if (field.includes('Base Currency') && (val === 'USD' || val === 'EUR')) {
        baseCurrency = val;
      }
    }

    if (cells[1] === 'Header') {
      currentSection = cells[0];
      sectionHeaders = cells.slice(2).map(h => h.trim().toLowerCase());
      continue;
    }

    if (cells[1] === 'Data') {
      const rowData = cells.slice(2);
      const rowMap: Record<string, string> = {};
      sectionHeaders.forEach((h, idx) => {
        rowMap[h] = rowData[idx] || '';
      });

      // 1. Open Positions
      if (currentSection === 'Open Positions') {
        const symbol = (rowMap['symbol'] || '').toUpperCase();
        const assetCategory = (rowMap['asset category'] || '').toLowerCase();
        const currency = (rowMap['currency'] || 'USD').toUpperCase() as 'USD' | 'EUR' | 'GBP';
        const qty = parseFloat(rowMap['quantity']?.replace(/,/g, '') || '0');
        const costPrice = parseFloat(rowMap['cost price']?.replace(/,/g, '') || '0');
        const desc = rowMap['description'] || symbol;

        if (symbol && qty > 0 && !isNaN(qty) && !isNaN(costPrice)) {
          // Normalize Berkshire
          const normalizedTicker = (symbol === 'BRK B' || symbol === 'BRK-B') ? 'BRK.B' : symbol;
          positions.push({
            id: `ibkr-pos-${normalizedTicker.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            ticker: normalizedTicker,
            companyName: desc,
            shares: qty,
            buyPrice: costPrice,
            currency: currency === 'EUR' ? 'EUR' : (currency === 'GBP' ? 'GBP' : 'USD'),
            buyDate: new Date().toISOString().split('T')[0],
            notes: 'Interactive Brokers Import'
          });
        }
      }

      // 2. Trades (Purchases and Sales)
      if (currentSection === 'Trades') {
        const symbol = (rowMap['symbol'] || '').toUpperCase();
        const dateTime = rowMap['date/time'] || rowMap['date'] || '';
        const qty = parseFloat(rowMap['quantity']?.replace(/,/g, '') || '0');
        const price = parseFloat(rowMap['t. price'] || rowMap['price'] || '0');
        const realPnl = parseFloat(rowMap['realized p/l']?.replace(/,/g, '') || '0');
        const currency = (rowMap['currency'] || 'USD').toUpperCase() as 'USD' | 'EUR';

        if (symbol && !symbol.includes('.') && qty !== 0 && !isNaN(qty)) {
          const dateOnly = dateTime.split(',')[0].trim() || new Date().toISOString().split('T')[0];
          const isSale = qty < 0;
          const normalizedTicker = (symbol === 'BRK B' || symbol === 'BRK-B') ? 'BRK.B' : symbol;
          
          transactions.push({
            id: `ibkr-tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            date: dateOnly,
            ticker: normalizedTicker,
            type: isSale ? 'Продажба' : 'Покупка',
            shares: Math.abs(qty),
            buyPrice: isSale ? price : price,
            sellPrice: isSale ? price : undefined,
            currency: currency === 'EUR' ? 'EUR' : 'USD',
            pnlVal: isSale && !isNaN(realPnl) ? realPnl : undefined
          });
        }
      }

      // 3. Dividends
      if (currentSection === 'Dividends') {
        const date = rowMap['date'] || '';
        const desc = rowMap['description'] || '';
        const amount = parseFloat(rowMap['amount']?.replace(/,/g, '') || '0');

        // Extract ticker from "AAPL(US0378331005)..."
        const match = desc.match(/^([A-Z0-9\s]+)\(/i);
        const ticker = match ? match[1].trim().toUpperCase() : '';
        const normalizedTicker = (ticker === 'BRK B' || ticker === 'BRK-B') ? 'BRK.B' : ticker;

        if (normalizedTicker && amount > 0) {
          dividends.push({
            id: `ibkr-div-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            date: date || new Date().toISOString().split('T')[0],
            ticker: normalizedTicker,
            amount: amount
          });
        }
      }

      // 4. Cash Balances
      if (currentSection === 'Cash Report') {
        const item = (rowMap['currency summary'] || rowMap['description'] || '').toLowerCase();
        const total = parseFloat(rowMap['total']?.replace(/,/g, '') || '0');
        if (item.includes('ending cash') && !isNaN(total)) {
          if (rowMap['currency'] === 'EUR') cashBalanceEUR = total;
          if (rowMap['currency'] === 'USD') cashBalanceUSD = total;
        }
      }
    }
  }

  return {
    positions,
    transactions,
    dividends,
    cashBalanceEUR,
    cashBalanceUSD,
    baseCurrency,
    rawMatchesCount: positions.length + transactions.length + dividends.length
  };
}
