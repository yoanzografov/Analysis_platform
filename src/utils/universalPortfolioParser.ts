import { PortfolioPosition, PortfolioTransaction, PortfolioDividendRecord } from '../types';

export interface ParsedBrokerData {
  broker: 'Interactive Brokers' | 'Trading 212' | 'Revolut' | 'Generic CSV' | 'Неразпознат формат';
  positions: PortfolioPosition[];
  transactions: PortfolioTransaction[];
  dividends: PortfolioDividendRecord[];
  cashBalance?: number;
  baseCurrency?: 'EUR' | 'USD';
  summary: {
    totalPositions: number;
    totalTransactions: number;
    totalDividends: number;
    currencies: string[];
    sampleTickers: string[];
  };
}

function cleanCsvTokens(line: string): string[] {
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
  return cells;
}

function cleanNum(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[$€£,\s]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function normalizeTicker(rawTicker: string): string {
  let sym = (rawTicker || '').trim().toUpperCase();
  // Remove T212 suffixes like _US_EQ, _EQ, _DE_EQ
  sym = sym.replace(/_(EQ|US_EQ|DE_EQ|UK_EQ)$/i, '');
  if (sym === 'BRK B' || sym === 'BRK-B') return 'BRK.B';
  if (sym === 'BF B' || sym === 'BF-B') return 'BF.B';
  return sym;
}

/**
 * Universal Broker & Spreadsheet CSV Parser
 */
export function parseBrokerCsv(csvContent: string): ParsedBrokerData {
  const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return {
      broker: 'Неразпознат формат',
      positions: [],
      transactions: [],
      dividends: [],
      summary: { totalPositions: 0, totalTransactions: 0, totalDividends: 0, currencies: [], sampleTickers: [] }
    };
  }

  // 1. Detect Interactive Brokers
  const isIbkr = lines.some(l => 
    l.includes('Interactive Brokers') || 
    l.startsWith('Open Positions,Header') || 
    l.startsWith('Trades,Header') || 
    l.startsWith('Dividends,Header')
  );

  if (isIbkr) {
    return parseIbkr(lines);
  }

  // 2. Detect Trading 212
  const headerLower = lines[0].toLowerCase();
  const isT212 = headerLower.includes('action') && headerLower.includes('isin') && (headerLower.includes('ticker') || headerLower.includes('no. of shares'));
  if (isT212) {
    return parseTrading212(lines);
  }

  // 3. Detect Revolut
  const isRevolut = headerLower.includes('date') && headerLower.includes('ticker') && headerLower.includes('type') && headerLower.includes('quantity');
  if (isRevolut) {
    return parseRevolut(lines);
  }

  // 4. Fallback Generic CSV / Excel export
  return parseGenericCsv(lines);
}

// ------------------------------------------------------------------------------------------------
// 1. Interactive Brokers Parser
// ------------------------------------------------------------------------------------------------
function parseIbkr(lines: string[]): ParsedBrokerData {
  const positions: PortfolioPosition[] = [];
  const transactions: PortfolioTransaction[] = [];
  const dividends: PortfolioDividendRecord[] = [];
  let baseCurrency: 'EUR' | 'USD' = 'EUR';
  let cashBalanceEUR = 0;
  let cashBalanceUSD = 0;

  let currentSection = '';
  let sectionHeaders: string[] = [];

  for (const line of lines) {
    const cells = cleanCsvTokens(line);
    if (cells.length < 2) continue;

    if (cells[0].startsWith('Account Information')) {
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
      const row: Record<string, string> = {};
      sectionHeaders.forEach((h, idx) => { row[h] = rowData[idx] || ''; });

      // Open Positions
      if (currentSection === 'Open Positions') {
        const symbol = normalizeTicker(row['symbol']);
        const qty = cleanNum(row['quantity']);
        const costPrice = cleanNum(row['cost price']);
        const currency = (row['currency'] || 'USD').toUpperCase() as 'USD' | 'EUR' | 'GBP';
        const desc = row['description'] || symbol;

        if (symbol && qty > 0) {
          positions.push({
            id: `ibkr-pos-${symbol.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            ticker: symbol,
            companyName: desc,
            shares: qty,
            buyPrice: costPrice,
            currency: currency === 'EUR' ? 'EUR' : (currency === 'GBP' ? 'GBP' : 'USD'),
            buyDate: new Date().toISOString().split('T')[0],
            notes: 'Interactive Brokers'
          });
        }
      }

      // Trades
      if (currentSection === 'Trades') {
        const symbol = normalizeTicker(row['symbol']);
        const dateTime = row['date/time'] || row['date'] || '';
        const qty = cleanNum(row['quantity']);
        const price = cleanNum(row['t. price'] || row['price']);
        const pnl = cleanNum(row['realized p/l']);
        const currency = (row['currency'] || 'USD').toUpperCase() as 'USD' | 'EUR';

        if (symbol && !symbol.includes('.') && qty !== 0) {
          const dateOnly = dateTime.split(',')[0].trim() || new Date().toISOString().split('T')[0];
          const isSale = qty < 0;
          transactions.push({
            id: `ibkr-tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            date: dateOnly,
            ticker: symbol,
            type: isSale ? 'Продажба' : 'Покупка',
            shares: Math.abs(qty),
            buyPrice: price,
            sellPrice: isSale ? price : undefined,
            currency: currency === 'EUR' ? 'EUR' : 'USD',
            pnlVal: isSale && pnl !== 0 ? pnl : undefined
          });
        }
      }

      // Dividends
      if (currentSection === 'Dividends') {
        const date = row['date'] || '';
        const desc = row['description'] || '';
        const amount = cleanNum(row['amount']);
        const match = desc.match(/^([A-Z0-9\s]+)\(/i);
        const ticker = match ? normalizeTicker(match[1]) : '';

        if (ticker && amount > 0) {
          dividends.push({
            id: `ibkr-div-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            date: date || new Date().toISOString().split('T')[0],
            ticker,
            amount
          });
        }
      }

      // Cash
      if (currentSection === 'Cash Report') {
        const item = (row['currency summary'] || row['description'] || '').toLowerCase();
        const total = cleanNum(row['total']);
        if (item.includes('ending cash') && total > 0) {
          if (row['currency'] === 'EUR') cashBalanceEUR = total;
          if (row['currency'] === 'USD') cashBalanceUSD = total;
        }
      }
    }
  }

  const effectiveCash = baseCurrency === 'EUR' ? (cashBalanceEUR || cashBalanceUSD / 1.08) : (cashBalanceUSD || cashBalanceEUR * 1.08);

  return buildResult('Interactive Brokers', positions, transactions, dividends, effectiveCash, baseCurrency);
}

// ------------------------------------------------------------------------------------------------
// 2. Trading 212 Parser
// ------------------------------------------------------------------------------------------------
function parseTrading212(lines: string[]): ParsedBrokerData {
  const headers = cleanCsvTokens(lines[0]).map(h => h.trim().toLowerCase());
  const transactions: PortfolioTransaction[] = [];
  const dividends: PortfolioDividendRecord[] = [];

  // Group positions by ticker to aggregate remaining open holdings
  const holdingsMap = new Map<string, {
    shares: number;
    totalCost: number;
    currency: 'USD' | 'EUR' | 'GBP';
    name: string;
    lastDate: string;
  }>();

  for (let i = 1; i < lines.length; i++) {
    const cells = cleanCsvTokens(lines[i]);
    if (cells.length < 3) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = cells[idx] || ''; });

    const action = (row['action'] || '').toLowerCase();
    const ticker = normalizeTicker(row['ticker']);
    const name = row['name'] || ticker;
    const time = (row['time'] || '').split(' ')[0] || new Date().toISOString().split('T')[0];
    const shares = cleanNum(row['no. of shares']);
    const pricePerShare = cleanNum(row['price / share']);
    const total = cleanNum(row['total']);
    const rawCurrency = (row['currency (total)'] || row['currency (price / share)'] || 'EUR').toUpperCase();
    const currency: 'USD' | 'EUR' | 'GBP' = rawCurrency.includes('EUR') ? 'EUR' : (rawCurrency.includes('GBP') ? 'GBP' : 'USD');

    // 1. Dividends
    if (action.includes('dividend')) {
      const divAmount = cleanNum(row['total'] || row['net amount']);
      if (ticker && divAmount > 0) {
        dividends.push({
          id: `t212-div-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date: time,
          ticker,
          amount: divAmount
        });
      }
      continue;
    }

    // 2. Buy Trades
    if (action.includes('buy')) {
      if (ticker && shares > 0) {
        transactions.push({
          id: `t212-tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date: time,
          ticker,
          type: 'Покупка',
          shares,
          buyPrice: pricePerShare || (total / shares),
          currency
        });

        // Update aggregated holding
        const cur = holdingsMap.get(ticker) || { shares: 0, totalCost: 0, currency, name, lastDate: time };
        cur.shares += shares;
        cur.totalCost += (shares * (pricePerShare || (total / shares)));
        cur.lastDate = time;
        holdingsMap.set(ticker, cur);
      }
    }

    // 3. Sell Trades
    if (action.includes('sell')) {
      if (ticker && shares > 0) {
        const resultPnl = cleanNum(row['result']);
        transactions.push({
          id: `t212-tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date: time,
          ticker,
          type: 'Продажба',
          shares,
          buyPrice: pricePerShare,
          sellPrice: pricePerShare,
          currency,
          pnlVal: resultPnl !== 0 ? resultPnl : undefined
        });

        // Deduct from holding
        if (holdingsMap.has(ticker)) {
          const cur = holdingsMap.get(ticker)!;
          const avgBuyPrice = cur.shares > 0 ? (cur.totalCost / cur.shares) : pricePerShare;
          cur.shares = Math.max(0, cur.shares - shares);
          cur.totalCost = cur.shares * avgBuyPrice;
          if (cur.shares <= 0.00001) {
            holdingsMap.delete(ticker);
          }
        }
      }
    }
  }

  // Construct active positions from surviving holdings
  const positions: PortfolioPosition[] = [];
  holdingsMap.forEach((val, sym) => {
    if (val.shares > 0.0001) {
      const avgPrice = val.totalCost / val.shares;
      positions.push({
        id: `t212-pos-${sym.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ticker: sym,
        companyName: val.name,
        shares: parseFloat(val.shares.toFixed(4)),
        buyPrice: parseFloat(avgPrice.toFixed(4)),
        currency: val.currency,
        buyDate: val.lastDate,
        notes: 'Trading 212 Import'
      });
    }
  });

  return buildResult('Trading 212', positions, transactions, dividends, undefined, 'EUR');
}

// ------------------------------------------------------------------------------------------------
// 3. Revolut Parser
// ------------------------------------------------------------------------------------------------
function parseRevolut(lines: string[]): ParsedBrokerData {
  const headers = cleanCsvTokens(lines[0]).map(h => h.trim().toLowerCase());
  const transactions: PortfolioTransaction[] = [];
  const dividends: PortfolioDividendRecord[] = [];
  const holdingsMap = new Map<string, { shares: number; totalCost: number; currency: 'USD' | 'EUR'; lastDate: string }>();

  for (let i = 1; i < lines.length; i++) {
    const cells = cleanCsvTokens(lines[i]);
    if (cells.length < 3) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = cells[idx] || ''; });

    const type = (row['type'] || '').toUpperCase();
    const ticker = normalizeTicker(row['ticker']);
    const date = (row['date'] || '').split('T')[0] || new Date().toISOString().split('T')[0];
    const qty = cleanNum(row['quantity']);
    const price = cleanNum(row['price per share'] || row['price']);
    const totalAmount = cleanNum(row['total amount'] || row['amount']);
    const currency: 'USD' | 'EUR' = (row['currency'] || 'USD').toUpperCase().includes('EUR') ? 'EUR' : 'USD';

    if (type.includes('DIVIDEND')) {
      if (ticker && totalAmount > 0) {
        dividends.push({
          id: `rev-div-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date,
          ticker,
          amount: totalAmount
        });
      }
      continue;
    }

    if (type.includes('BUY')) {
      if (ticker && qty > 0) {
        transactions.push({
          id: `rev-tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date,
          ticker,
          type: 'Покупка',
          shares: qty,
          buyPrice: price || (totalAmount / qty),
          currency
        });

        const cur = holdingsMap.get(ticker) || { shares: 0, totalCost: 0, currency, lastDate: date };
        cur.shares += qty;
        cur.totalCost += (qty * (price || (totalAmount / qty)));
        cur.lastDate = date;
        holdingsMap.set(ticker, cur);
      }
    }

    if (type.includes('SELL')) {
      if (ticker && qty > 0) {
        transactions.push({
          id: `rev-tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date,
          ticker,
          type: 'Продажба',
          shares: qty,
          buyPrice: price,
          sellPrice: price,
          currency
        });

        if (holdingsMap.has(ticker)) {
          const cur = holdingsMap.get(ticker)!;
          const avgPrice = cur.shares > 0 ? (cur.totalCost / cur.shares) : price;
          cur.shares = Math.max(0, cur.shares - qty);
          cur.totalCost = cur.shares * avgPrice;
          if (cur.shares <= 0.00001) holdingsMap.delete(ticker);
        }
      }
    }
  }

  const positions: PortfolioPosition[] = [];
  holdingsMap.forEach((val, sym) => {
    if (val.shares > 0.0001) {
      positions.push({
        id: `rev-pos-${sym.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ticker: sym,
        shares: parseFloat(val.shares.toFixed(4)),
        buyPrice: parseFloat((val.totalCost / val.shares).toFixed(4)),
        currency: val.currency,
        buyDate: val.lastDate,
        notes: 'Revolut Import'
      });
    }
  });

  return buildResult('Revolut', positions, transactions, dividends, undefined, 'USD');
}

// ------------------------------------------------------------------------------------------------
// 4. Generic CSV Parser (Columns like Ticker, Shares, Price, Currency)
// ------------------------------------------------------------------------------------------------
function parseGenericCsv(lines: string[]): ParsedBrokerData {
  const headers = cleanCsvTokens(lines[0]).map(h => h.trim().toLowerCase());
  const positions: PortfolioPosition[] = [];

  const tickerIdx = headers.findIndex(h => h.includes('ticker') || h.includes('symbol') || h.includes('тикер') || h.includes('акция'));
  const sharesIdx = headers.findIndex(h => h.includes('share') || h.includes('qty') || h.includes('quantity') || h.includes('брой') || h.includes('дялове'));
  const priceIdx = headers.findIndex(h => h.includes('price') || h.includes('cost') || h.includes('цена') || h.includes('покупна'));
  const currencyIdx = headers.findIndex(h => h.includes('curr') || h.includes('валута'));
  const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('company') || h.includes('име'));

  if (tickerIdx === -1 || (sharesIdx === -1 && priceIdx === -1)) {
    return {
      broker: 'Неразпознат формат',
      positions: [],
      transactions: [],
      dividends: [],
      summary: { totalPositions: 0, totalTransactions: 0, totalDividends: 0, currencies: [], sampleTickers: [] }
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const cells = cleanCsvTokens(lines[i]);
    if (cells.length <= tickerIdx) continue;

    const rawTicker = cells[tickerIdx];
    const ticker = normalizeTicker(rawTicker);
    const shares = sharesIdx !== -1 ? cleanNum(cells[sharesIdx]) : 1;
    const buyPrice = priceIdx !== -1 ? cleanNum(cells[priceIdx]) : 100;
    const rawCurr = currencyIdx !== -1 ? (cells[currencyIdx] || '').toUpperCase() : 'USD';
    const currency: 'USD' | 'EUR' | 'GBP' = rawCurr.includes('EUR') ? 'EUR' : (rawCurr.includes('GBP') ? 'GBP' : 'USD');
    const companyName = nameIdx !== -1 ? cells[nameIdx] : ticker;

    if (ticker && ticker.length >= 1 && shares > 0) {
      positions.push({
        id: `csv-pos-${ticker.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ticker,
        companyName,
        shares,
        buyPrice,
        currency,
        buyDate: new Date().toISOString().split('T')[0],
        notes: 'CSV Импорт'
      });
    }
  }

  return buildResult('Generic CSV', positions, [], [], undefined, 'EUR');
}

function buildResult(
  broker: ParsedBrokerData['broker'],
  positions: PortfolioPosition[],
  transactions: PortfolioTransaction[],
  dividends: PortfolioDividendRecord[],
  cashBalance?: number,
  baseCurrency: 'EUR' | 'USD' = 'EUR'
): ParsedBrokerData {
  const currenciesSet = new Set<string>();
  positions.forEach(p => currenciesSet.add(p.currency || 'USD'));
  transactions.forEach(t => currenciesSet.add(t.currency || 'USD'));

  const sampleTickers = Array.from(new Set([
    ...positions.map(p => p.ticker),
    ...transactions.map(t => t.ticker),
    ...dividends.map(d => d.ticker)
  ])).slice(0, 8);

  return {
    broker,
    positions,
    transactions,
    dividends,
    cashBalance,
    baseCurrency,
    summary: {
      totalPositions: positions.length,
      totalTransactions: transactions.length,
      totalDividends: dividends.length,
      currencies: Array.from(currenciesSet),
      sampleTickers
    }
  };
}
