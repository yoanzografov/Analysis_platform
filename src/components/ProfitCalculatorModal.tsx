import { useState, useEffect, useMemo } from 'react';
import { Stock } from '../types';
import { POPULAR_STOCKS_DB } from './StockChecklistModal';
import { RAW_SPREADSHEET_CSV, parseCSVData } from '../data/initialStocks';
import officialProfiles from '../data/officialCompanyProfiles.json';
import { Calculator, X, Wallet, RotateCcw, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stocks: Stock[];
  baseCurrency?: 'USD' | 'EUR';
  initialTicker?: string;
}

// Helper to safely parse strings with both comma and dot decimal separators
const parseSafeNum = (val: string | number | undefined): number => {
  if (val === undefined || val === null) return 0;
  const str = String(val).replace(/,/g, '.').replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
};

// Default spreadsheet demonstration values (matching user FTNT spreadsheet)
const DEFAULT_FTNT = {
  ticker: 'FTNT',
  companyName: 'Fortinet Inc',
  marketPrice: '151.99',
  shares: '6.00',
  avgPrice: '73.80',
  currentPrice: '164.59',
  sellShares: '6.00'
};

export default function ProfitCalculatorModal({
  isOpen,
  onClose,
  stocks,
  baseCurrency = 'USD',
  initialTicker
}: Props) {
  // Pre-parse the raw CSV dataset once for instant lookup fallback
  const fallbackStocks = useMemo(() => {
    try {
      return parseCSVData(RAW_SPREADSHEET_CSV).stocks;
    } catch {
      return [];
    }
  }, []);

  const [ticker, setTicker] = useState(DEFAULT_FTNT.ticker);
  const [companyName, setCompanyName] = useState(DEFAULT_FTNT.companyName);
  const [marketPrice, setMarketPrice] = useState(DEFAULT_FTNT.marketPrice);
  const [shares, setShares] = useState(DEFAULT_FTNT.shares);
  const [avgPrice, setAvgPrice] = useState(DEFAULT_FTNT.avgPrice);
  const [currentPrice, setCurrentPrice] = useState(DEFAULT_FTNT.currentPrice);
  const [sellShares, setSellShares] = useState(DEFAULT_FTNT.sellShares);

  const symbol = baseCurrency === 'EUR' ? '€' : '$';

  // Comprehensive Stock Lookup across all available data sources
  const performLookup = (rawTicker: string) => {
    const clean = rawTicker.trim().toUpperCase();
    if (!clean) return;

    const base = clean.split('.')[0].split(':')[1] || clean.split('.')[0];

    // 1. Search in current active stocks table
    let foundStock = stocks.find(s => {
      const sClean = s.ticker.trim().toUpperCase();
      const sBase = sClean.split('.')[0].split(':')[1] || sClean.split('.')[0];
      return sClean === clean || sBase === base;
    });

    // 2. Search in pre-parsed spreadsheet stocks
    if (!foundStock) {
      foundStock = fallbackStocks.find(s => {
        const sClean = s.ticker.trim().toUpperCase();
        const sBase = sClean.split('.')[0].split(':')[1] || sClean.split('.')[0];
        return sClean === clean || sBase === base;
      });
    }

    // 3. Search in POPULAR_STOCKS_DB
    const pop = (POPULAR_STOCKS_DB as Record<string, { companyName: string; price: number }>)[clean] || 
                (POPULAR_STOCKS_DB as Record<string, { companyName: string; price: number }>)[base];

    // 4. Search in officialCompanyProfiles
    const prof = (officialProfiles as Record<string, { wikiTitle?: string }>)[clean];

    if (foundStock) {
      setCompanyName(foundStock.companyName || prof?.wikiTitle || clean);
      const priceVal = foundStock.currentPrice || foundStock.priceOfCalc || 0;
      if (priceVal > 0) {
        setMarketPrice(priceVal.toFixed(2));
        setCurrentPrice(priceVal.toFixed(2));
      }
      if (foundStock.priceOfCalc && foundStock.priceOfCalc > 0) {
        setAvgPrice(foundStock.priceOfCalc.toFixed(2));
      }
    } else if (pop) {
      setCompanyName(pop.companyName);
      if (pop.price > 0) {
        setMarketPrice(pop.price.toFixed(2));
        setCurrentPrice(pop.price.toFixed(2));
      }
    } else if (prof?.wikiTitle) {
      setCompanyName(prof.wikiTitle);
    }
  };

  const handleTickerChange = (newTicker: string) => {
    const clean = newTicker.trim().toUpperCase();
    setTicker(clean);
    if (clean.length >= 1) {
      performLookup(clean);
    }
  };

  // Sync with initialTicker on open or change
  useEffect(() => {
    if (isOpen) {
      if (initialTicker && initialTicker.trim()) {
        const clean = initialTicker.trim().toUpperCase();
        setTicker(clean);
        performLookup(clean);
      } else {
        // Reset to FTNT defaults if opened without specific ticker
        setTicker(DEFAULT_FTNT.ticker);
        setCompanyName(DEFAULT_FTNT.companyName);
        setMarketPrice(DEFAULT_FTNT.marketPrice);
        setShares(DEFAULT_FTNT.shares);
        setAvgPrice(DEFAULT_FTNT.avgPrice);
        setCurrentPrice(DEFAULT_FTNT.currentPrice);
        setSellShares(DEFAULT_FTNT.sellShares);
      }
    }
  }, [isOpen, initialTicker]);

  if (!isOpen) return null;

  // Numerical calculations with exact spreadsheet formulas
  const numShares = Math.max(0, parseSafeNum(shares));
  const numAvgPrice = Math.max(0, parseSafeNum(avgPrice));
  const numCurrentPrice = Math.max(0, parseSafeNum(currentPrice));
  const numSellShares = Math.max(0, parseSafeNum(sellShares));

  // 1. Cost Basis: Total initial capital invested in position
  const costBasis = numShares * numAvgPrice;

  // 2. Profit per Share: Profit generated per individual share
  const profitPerShare = numCurrentPrice - numAvgPrice;

  // 3. Realized P&L: Total profit if selling all held shares
  const rlzdPnL = numShares * profitPerShare;

  // 4. Profit on sold shares
  const profitOnSale = numSellShares * profitPerShare;

  // 5. Total Return %: Profit / (Sold Shares * Avg Price) * 100
  const costBasisOfSold = numSellShares * numAvgPrice;
  const totalReturnPct = costBasisOfSold > 0 ? (profitOnSale / costBasisOfSold) * 100 : 0;

  // 6. Free Funds: Capital freed up from initial cost basis
  const freeFundsCostBasis = numSellShares * numAvgPrice;

  // 7. Total Cash Proceeds upon sale: Free Funds + Profit
  const totalCashProceeds = numSellShares * numCurrentPrice;

  const handleResetExample = () => {
    setTicker(DEFAULT_FTNT.ticker);
    setCompanyName(DEFAULT_FTNT.companyName);
    setMarketPrice(DEFAULT_FTNT.marketPrice);
    setShares(DEFAULT_FTNT.shares);
    setAvgPrice(DEFAULT_FTNT.avgPrice);
    setCurrentPrice(DEFAULT_FTNT.currentPrice);
    setSellShares(DEFAULT_FTNT.sellShares);
  };

  const handleClear = () => {
    setTicker('');
    setCompanyName('');
    setMarketPrice('0.00');
    setShares('');
    setAvgPrice('');
    setCurrentPrice('');
    setSellShares('');
  };

  return (
    <div 
      className="fixed inset-0 z-[1000000] flex items-center justify-center p-3 sm:p-4 bg-bg/80 backdrop-blur-md font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-ink"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Banner - Native Platform Style */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black uppercase text-ink tracking-wider flex items-center gap-2 whitespace-nowrap">
                Stock Profit Calculator
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-extrabold normal-case whitespace-nowrap">
                  Табличен калкулатор
                </span>
              </h3>
              <p className="text-[11px] text-ink-faint whitespace-nowrap truncate">
                Попълват се <span className="text-amber-400 font-extrabold">жълтите полета</span> (Тикер, Брой акции, Покупна цена, Цена на продажба)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetExample}
              className="px-2.5 py-1 text-[10px] font-bold text-ink-muted hover:text-ink bg-bg border border-border rounded-lg hover:bg-card-hover transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap"
              title="Зареди образец с FTNT"
            >
              <RotateCcw className="w-3 h-3" />
              <span>FTNT Образец</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 text-[10px] font-bold text-ink-muted hover:text-ink bg-bg border border-border rounded-lg hover:bg-card-hover transition-all cursor-pointer whitespace-nowrap"
              title="Изчисти полетата"
            >
              Изчисти
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-ink-faint hover:text-ink hover:bg-card-hover transition-all cursor-pointer ml-1"
              title="Затвори"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Ticker Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 text-[11px] whitespace-nowrap">
          <span className="text-ink-faint text-[10px] font-bold uppercase shrink-0 flex items-center gap-1 whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Бърз избор:
          </span>
          {['FTNT', 'AAPL', 'NVDA', 'TSLA', 'MSFT'].map(quickTick => (
            <button
              key={quickTick}
              type="button"
              onClick={() => handleTickerChange(quickTick)}
              className={`px-2.5 py-0.5 rounded-lg border font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                ticker === quickTick
                  ? 'bg-amber-500/25 text-amber-300 border-amber-500/50'
                  : 'bg-bg text-ink-muted border-border hover:text-ink hover:border-amber-500/30'
              }`}
            >
              {quickTick}
            </button>
          ))}
        </div>

        {/* Row 1: Ticker & Company Name & Live Current Market Price */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Ticker Input (Yellow Theme) */}
          <div className="md:col-span-3">
            <label className="block text-[10px] text-amber-400 font-extrabold uppercase mb-1 whitespace-nowrap">
              🟨 Ticker (Символ)
            </label>
            <input
              type="text"
              value={ticker}
              onChange={e => handleTickerChange(e.target.value)}
              placeholder="напр. FTNT"
              className="w-full bg-amber-500/20 text-amber-300 dark:text-amber-300 font-mono font-black text-center py-2 px-3 rounded-xl border-2 border-amber-500/50 focus:outline-none focus:border-amber-400 uppercase text-sm shadow-xs"
            />
          </div>

          {/* Company Name (Editable Light Blue Theme) */}
          <div className="md:col-span-6">
            <label className="block text-[10px] text-indigo-400 font-extrabold uppercase mb-1 whitespace-nowrap">
              🟦 Име на компанията
            </label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Име на компания..."
              className="w-full bg-indigo-500/10 border border-indigo-500/30 text-ink font-bold px-3 py-2 rounded-xl text-xs h-[38px] focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Current Market Price (Coral / Rose Red Theme) */}
          <div className="md:col-span-3">
            <label className="block text-[10px] text-rose-400 font-extrabold uppercase mb-1 whitespace-nowrap">
              🟥 Current Price ({symbol})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={marketPrice}
              onChange={e => {
                setMarketPrice(e.target.value);
                setCurrentPrice(e.target.value);
              }}
              placeholder="151.99"
              className="w-full bg-rose-500/15 text-rose-400 dark:text-rose-300 font-mono font-extrabold text-center py-2 px-3 rounded-xl border border-rose-500/30 focus:outline-none text-sm h-[38px]"
            />
          </div>
        </div>

        {/* Row 2: Table of Position Metrics (Spreadsheet Replica) */}
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-bg text-ink-faint text-[10px] font-black uppercase tracking-tight border-b border-border/50">
                <th className="py-2.5 px-3 border-r border-border/40 whitespace-nowrap">Shares</th>
                <th className="py-2.5 px-3 border-r border-border/40 whitespace-nowrap">Cost Basis</th>
                <th className="py-2.5 px-3 border-r border-border/40 whitespace-nowrap">Avg. Price</th>
                <th className="py-2.5 px-3 border-r border-border/40 whitespace-nowrap">Current Price</th>
                <th className="py-2.5 px-3 border-r border-border/40 whitespace-nowrap">Profit / Share</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Rlzd P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs font-mono">
              <tr>
                {/* 🟨 Shares Input */}
                <td className="p-2 border-r border-border/40 bg-amber-500/10 whitespace-nowrap">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={shares}
                    onChange={e => {
                      const val = e.target.value;
                      setShares(val);
                      // Auto synchronize sellShares if previously matching or empty
                      if (sellShares === shares || !sellShares) {
                        setSellShares(val);
                      }
                    }}
                    placeholder="6.00"
                    className="w-full bg-amber-500/20 text-amber-300 font-black text-center py-1.5 rounded-lg border border-amber-500/40 focus:outline-none text-xs"
                  />
                </td>

                {/* 🟦 Cost Basis (Calculated: Shares * Avg Price) */}
                <td className="p-2 border-r border-border/40 bg-indigo-500/5 font-extrabold text-ink text-xs whitespace-nowrap">
                  {symbol}{costBasis.toFixed(2)}
                </td>

                {/* 🟨 Avg. Price Input */}
                <td className="p-2 border-r border-border/40 bg-amber-500/10 whitespace-nowrap">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={avgPrice}
                    onChange={e => setAvgPrice(e.target.value)}
                    placeholder="73.80"
                    className="w-full bg-amber-500/20 text-amber-300 font-black text-center py-1.5 rounded-lg border border-amber-500/40 focus:outline-none text-xs"
                  />
                </td>

                {/* 🟨 Current / Exit Price (Editable) */}
                <td className="p-2 border-r border-border/40 bg-amber-500/10 whitespace-nowrap">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={currentPrice}
                    onChange={e => setCurrentPrice(e.target.value)}
                    placeholder="164.59"
                    className="w-full bg-amber-500/20 text-amber-300 font-black text-center py-1.5 rounded-lg border border-amber-500/40 focus:outline-none text-xs"
                  />
                </td>

                {/* 🟦 Profit per Share (Calculated: Current Price - Avg Price) */}
                <td className={`p-2 border-r border-border/40 bg-indigo-500/5 font-black text-xs whitespace-nowrap ${profitPerShare >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {profitPerShare >= 0 ? '+' : ''}{symbol}{profitPerShare.toFixed(2)}
                </td>

                {/* 🟦 Rlzd P&L (Calculated: Shares * Profit per Share) */}
                <td className={`p-2 bg-indigo-500/5 font-black text-xs whitespace-nowrap ${rlzdPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {rlzdPnL >= 0 ? '+' : ''}{symbol}{rlzdPnL.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Row 3: Sell Simulation & Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Sell Input Box */}
          <div className="md:col-span-3 bg-bg/50 p-2.5 rounded-2xl border border-border/50 space-y-1">
            <label className="block text-[10px] font-black uppercase text-amber-400 text-center whitespace-nowrap">
              🟨 Sell (Брой за продажба)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={sellShares}
              onChange={e => setSellShares(e.target.value)}
              placeholder="6.00"
              className="w-full bg-amber-500/20 text-amber-300 font-mono font-black text-center py-1.5 rounded-lg border border-amber-500/40 focus:outline-none text-xs"
            />
          </div>

          {/* Profit & % Return Box */}
          <div className="md:col-span-5 bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-emerald-400">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase text-emerald-400/80">PROFIT:</span>
              <span className="text-base sm:text-lg font-black font-mono">
                {profitOnSale >= 0 ? '+' : ''}{symbol}{profitOnSale.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase text-emerald-400/80">% RETURN:</span>
              <span className="text-base sm:text-lg font-black font-mono">
                {totalReturnPct >= 0 ? '▲ ' : '▼ '}{totalReturnPct.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Free Funds Box */}
          <div className="md:col-span-4 bg-rose-500/10 border border-rose-500/25 px-4 py-2.5 rounded-2xl text-rose-400 flex items-center justify-between gap-2">
            <div className="space-y-0.5 whitespace-nowrap">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase text-rose-400/80">FREE FUNDS:</span>
                <span className="text-base sm:text-lg font-black font-mono">
                  {symbol}{freeFundsCostBasis.toFixed(2)}
                </span>
              </div>
              <div className="text-[10px] text-rose-400/80 font-mono whitespace-nowrap">
                Постъпления: <span className="font-bold text-rose-300">{symbol}{totalCashProceeds.toFixed(2)}</span>
              </div>
            </div>
            <Wallet className="w-5 h-5 text-rose-400/50 shrink-0" />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer mt-2"
        >
          Готово
        </button>
      </div>
    </div>
  );
}
