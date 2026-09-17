import { useState, useEffect, useMemo } from 'react';
import { Stock } from '../types';
import { POPULAR_STOCKS_DB } from './StockChecklistModal';
import { RAW_SPREADSHEET_CSV, parseCSVData } from '../data/initialStocks';
import officialProfiles from '../data/officialCompanyProfiles.json';
import { Calculator, X, RotateCcw, TrendingUp, Sparkles, Table } from 'lucide-react';

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
  const [showSpreadsheetView, setShowSpreadsheetView] = useState(true);

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

  // Donut chart shares
  const totalVal = costBasisOfSold + Math.max(0, profitOnSale);
  const investedSharePct = totalVal > 0 ? Math.min(100, Math.max(0, (costBasisOfSold / totalVal) * 100)) : 50;
  const profitSharePct = Math.max(0, 100 - investedSharePct);

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
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-ink tracking-wide">
                Stock Profit Calculator
              </h3>
              <p className="text-[11px] text-ink-faint">
                Калкулатор за печалба, доходност и освободен капитал от акции
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-faint hover:text-ink hover:bg-card-hover transition-all cursor-pointer"
            title="Затвори"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Grid: Inputs on Left, Results on Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Left Column: Form Controls */}
          <div className="bg-bg/40 p-4 rounded-2xl border border-border/60 space-y-3.5 text-xs">
            
            {/* Ticker & Quick Chips */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] text-ink-faint font-extrabold uppercase">
                  ТИКЕР (Ticker Symbol)
                </label>
                <span className="text-[9px] text-ink-faint font-bold uppercase">Търсене</span>
              </div>
              <input
                type="text"
                value={ticker}
                onChange={e => handleTickerChange(e.target.value)}
                placeholder="напр. FTNT"
                className="w-full bg-bg text-ink font-mono font-bold border border-border px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 text-sm uppercase"
              />

              {/* Quick Ticker Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1.5 text-[10px]">
                <span className="text-ink-faint text-[9px] font-bold uppercase shrink-0 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  Бърз избор:
                </span>
                {['FTNT', 'AAPL', 'NVDA', 'TSLA', 'MSFT'].map(quickTick => (
                  <button
                    key={quickTick}
                    type="button"
                    onClick={() => handleTickerChange(quickTick)}
                    className={`px-1.5 py-0.5 rounded-md border font-mono font-bold transition-all cursor-pointer ${
                      ticker === quickTick
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-card text-ink-muted border-border hover:text-ink hover:border-amber-500/30'
                    }`}
                  >
                    {quickTick}
                  </button>
                ))}
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
                ИМЕ НА КОМПАНИЯТА (Company Name)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Име на компания..."
                className="w-full bg-bg text-ink font-bold border border-border px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* Shares Held */}
            <div>
              <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
                БРОЙ ЗАКУПЕНИ АКЦИИ (Shares Held)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={shares}
                onChange={e => {
                  const val = e.target.value;
                  setShares(val);
                  if (sellShares === shares || !sellShares) {
                    setSellShares(val);
                  }
                }}
                placeholder="6.00"
                className="w-full bg-bg text-ink font-mono font-bold border border-border px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            {/* Avg Buy Price */}
            <div>
              <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
                СРЕДНА ПОКУПНА ЦЕНА (Avg. Buy Price)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-ink-faint">{symbol}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={avgPrice}
                  onChange={e => setAvgPrice(e.target.value)}
                  placeholder="73.80"
                  className="w-full bg-bg text-ink font-mono font-bold border border-border pl-7 pr-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            {/* Current / Exit Price */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] text-ink-faint font-extrabold uppercase">
                  ПРОДАЖНА / ТЕКУЩА ЦЕНА (Exit Price)
                </label>
                {marketPrice && (
                  <span className="text-[9px] text-ink-faint font-mono">
                    Пазарна: {symbol}{marketPrice}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-ink-faint">{symbol}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={currentPrice}
                  onChange={e => setCurrentPrice(e.target.value)}
                  placeholder="164.59"
                  className="w-full bg-bg text-ink font-mono font-bold border border-border pl-7 pr-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 text-sm text-emerald-400"
                />
              </div>
            </div>

            {/* Shares to Sell */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] text-ink-faint font-extrabold uppercase">
                  БРОЙ ЗА ПРОДАЖБА (Shares to Sell)
                </label>
                <button
                  type="button"
                  onClick={() => setSellShares(shares)}
                  className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold uppercase transition-colors cursor-pointer"
                >
                  Всички ({shares || 0})
                </button>
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={sellShares}
                onChange={e => setSellShares(e.target.value)}
                placeholder="6.00"
                className="w-full bg-bg text-ink font-mono font-bold border border-border px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetExample}
                className="px-3 py-2 rounded-xl bg-card hover:bg-card-hover border border-border text-ink-muted hover:text-ink font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
                title="Зареди образец с FTNT"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                FTNT Образец
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 rounded-xl bg-card hover:bg-card-hover border border-border text-ink-muted hover:text-ink font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                Изчисти
              </button>
            </div>
          </div>

          {/* Right Column: Results Box & Chart */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="bg-emerald-600/90 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Резултати (Results)
              </span>
              <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full">
                Profit Analysis
              </span>
            </div>

            {/* Table of Results */}
            <div className="bg-bg/60 rounded-2xl border border-border/60 divide-y divide-border/40 text-xs font-sans relative">
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="font-bold text-ink-faint">Вложена сума (Cost Basis):</span>
                <span className="font-mono font-extrabold text-ink">
                  {symbol}{costBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="font-bold text-ink-faint">Печалба на акция (Profit / Share):</span>
                <span className={`font-mono font-extrabold ${profitPerShare >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {profitPerShare >= 0 ? '+' : ''}{symbol}{profitPerShare.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="font-bold text-ink-faint">Печалба от продажбата (Profit):</span>
                <span className={`font-mono font-black ${profitOnSale >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {profitOnSale >= 0 ? '+' : ''}{symbol}{profitOnSale.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="font-bold text-ink-faint">Общ ROI (% Total Return):</span>
                <span className={`font-mono font-black ${totalReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {totalReturnPct >= 0 ? '▲ +' : '▼ '}{totalReturnPct.toFixed(2)}%
                </span>
              </div>

              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="font-bold text-ink-faint">Освободен капитал (Free Funds):</span>
                <span className="font-mono font-bold text-rose-400">
                  {symbol}{freeFundsCostBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="font-bold text-ink-faint">Общо получени пари (Proceeds):</span>
                <span className="font-mono font-extrabold text-ink">
                  {symbol}{totalCashProceeds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Donut Chart Visual Representation */}
            <div className="bg-bg/40 p-3 rounded-2xl border border-border/40 flex items-center justify-around gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    strokeDasharray={`${investedSharePct}, 100`}
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#84cc16"
                    strokeWidth="4"
                    strokeDasharray={`${profitSharePct}, 100`}
                    strokeDashoffset={`-${investedSharePct}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-ink font-mono">
                  {totalReturnPct.toFixed(0)}%
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-blue-500 inline-block" />
                  <span className="font-bold text-ink-faint text-[11px]">
                    Вложени (Cost Basis): {investedSharePct.toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-lime-500 inline-block" />
                  <span className="font-bold text-ink-faint text-[11px]">
                    Печалба (Profit): {profitSharePct.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Spreadsheet Detailed Position Table */}
        <div className="bg-bg/40 p-3.5 rounded-2xl border border-border/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-ink-faint tracking-wider flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5 text-indigo-400" />
              Табличен изглед на позицията (Spreadsheet View)
            </span>
            <button
              type="button"
              onClick={() => setShowSpreadsheetView(!showSpreadsheetView)}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              {showSpreadsheetView ? 'Скрий' : 'Покажи'}
            </button>
          </div>

          {showSpreadsheetView && (
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-center border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-bg text-ink-faint text-[10px] font-black uppercase tracking-tight border-b border-border/50">
                    <th className="py-2 px-2 border-r border-border/40">Shares</th>
                    <th className="py-2 px-2 border-r border-border/40">Cost Basis</th>
                    <th className="py-2 px-2 border-r border-border/40">Avg. Price</th>
                    <th className="py-2 px-2 border-r border-border/40">Curent Price</th>
                    <th className="py-2 px-2 border-r border-border/40">Profit / Share</th>
                    <th className="py-2 px-2">Rlzd P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  <tr className="bg-card">
                    <td className="p-2 border-r border-border/40 font-bold text-ink">{numShares.toFixed(2)}</td>
                    <td className="p-2 border-r border-border/40 font-bold text-ink">{symbol}{costBasis.toFixed(2)}</td>
                    <td className="p-2 border-r border-border/40 font-bold text-ink">{symbol}{numAvgPrice.toFixed(2)}</td>
                    <td className="p-2 border-r border-border/40 font-bold text-ink">{symbol}{numCurrentPrice.toFixed(2)}</td>
                    <td className={`p-2 border-r border-border/40 font-bold ${profitPerShare >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {profitPerShare >= 0 ? '+' : ''}{symbol}{profitPerShare.toFixed(2)}
                    </td>
                    <td className={`p-2 font-black ${rlzdPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {rlzdPnL >= 0 ? '+' : ''}{symbol}{rlzdPnL.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          Готово
        </button>

      </div>
    </div>
  );
}
