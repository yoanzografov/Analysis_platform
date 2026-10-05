import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Stock } from '../types';
import { Calculator, X, Search, RotateCcw, TrendingUp, TrendingDown, Check, ExternalLink, Info, ShieldCheck, ArrowRight, Save, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stocks?: Stock[];
  initialStock?: Stock | null;
  onUpdateFairPrice?: (ticker: string, fairPrice: number) => void;
  currentUser?: any;
}

export default function FairValueCalculatorModal({
  isOpen,
  onClose,
  stocks = [],
  initialStock = null,
  onUpdateFairPrice,
  currentUser
}: Props) {
  // Active Stock Search / Selected Ticker
  const [selectedStock, setSelectedStock] = useState<Stock | null>(initialStock);
  const [searchQuery, setSearchQuery] = useState(initialStock?.ticker || '');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Active Tab: 'sensitivity' (2D Heatmap) or 'trajectory' (Year-by-Year Growth Table)
  const [activeTab, setActiveTab] = useState<'sensitivity' | 'trajectory'>('sensitivity');

  // Input Assumptions (1:1 with StockAnalysis Fair Value Calculator)
  const [price, setPrice] = useState<number>(() => initialStock?.currentPrice || 100);
  const [eps, setEps] = useState<number>(() => {
    if (initialStock?.eps && initialStock.eps > 0) return initialStock.eps;
    if (initialStock?.currentPrice && initialStock?.peRatio && initialStock.peRatio > 0) {
      return parseFloat((initialStock.currentPrice / initialStock.peRatio).toFixed(2));
    }
    return 5.0;
  });
  const [epsGrowth, setEpsGrowth] = useState<number>(10.0);
  const [terminalEpsGrowth, setTerminalEpsGrowth] = useState<number>(4.0);
  const [years, setYears] = useState<number>(10);
  const [exitPe, setExitPe] = useState<number>(() => {
    if (initialStock?.peRatio && initialStock.peRatio > 0) {
      return Math.min(60, Math.max(5, parseFloat(initialStock.peRatio.toFixed(1))));
    }
    return 18.0;
  });
  const [requiredReturn, setRequiredReturn] = useState<number>(10.0);
  const [marginOfSafety, setMarginOfSafety] = useState<number>(15.0);

  // Feedback toast when saving
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Sync when initialStock changes
  useEffect(() => {
    if (initialStock) {
      setSelectedStock(initialStock);
      setSearchQuery(initialStock.ticker);
      if (initialStock.currentPrice > 0) setPrice(initialStock.currentPrice);
      if (initialStock.eps && initialStock.eps > 0) {
        setEps(initialStock.eps);
      } else if (initialStock.currentPrice > 0 && initialStock.peRatio && initialStock.peRatio > 0) {
        setEps(parseFloat((initialStock.currentPrice / initialStock.peRatio).toFixed(2)));
      }
      if (initialStock.peRatio && initialStock.peRatio > 0) {
        setExitPe(Math.min(60, Math.max(5, parseFloat(initialStock.peRatio.toFixed(1)))));
      }
    }
  }, [initialStock]);

  // Click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter available stocks for auto-complete search
  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return stocks.slice(0, 8);
    const q = searchQuery.trim().toUpperCase();
    return stocks
      .filter(s => s.ticker.toUpperCase().includes(q) || s.companyName.toUpperCase().includes(q))
      .slice(0, 10);
  }, [stocks, searchQuery]);

  const handleSelectStock = (stk: Stock) => {
    setSelectedStock(stk);
    setSearchQuery(stk.ticker);
    setIsSearchOpen(false);
    if (stk.currentPrice > 0) setPrice(stk.currentPrice);
    if (stk.eps && stk.eps > 0) {
      setEps(stk.eps);
    } else if (stk.currentPrice > 0 && stk.peRatio && stk.peRatio > 0) {
      setEps(parseFloat((stk.currentPrice / stk.peRatio).toFixed(2)));
    }
    if (stk.peRatio && stk.peRatio > 0) {
      setExitPe(Math.min(60, Math.max(5, parseFloat(stk.peRatio.toFixed(1)))));
    }
  };

  // If opened without an initialStock and no selection, pick AAPL or first available stock
  useEffect(() => {
    if (!initialStock && !selectedStock && stocks.length > 0) {
      const defaultStk = stocks.find(s => s.ticker === 'AAPL') || stocks[0];
      if (defaultStk) {
        handleSelectStock(defaultStk);
      }
    }
  }, [stocks, initialStock]);

  const handleResetDefaults = () => {
    setPrice(selectedStock?.currentPrice || 100);
    setEps(selectedStock?.eps || 5.0);
    setEpsGrowth(10.0);
    setTerminalEpsGrowth(4.0);
    setYears(10);
    setExitPe(selectedStock?.peRatio ? Math.min(60, Math.max(5, parseFloat(selectedStock.peRatio.toFixed(1)))) : 18.0);
    setRequiredReturn(10.0);
    setMarginOfSafety(15.0);
  };

  // Mathematical Model (Earnings Multiple Method with smooth decay)
  const calculation = useMemo(() => {
    const safeYears = Math.max(1, Math.min(25, Math.round(years)));
    const safePrice = Math.max(0.01, price);
    const safeEps = Math.max(0.01, eps);
    const safeExitPe = Math.max(1, exitPe);
    const safeReqReturn = Math.max(0.1, requiredReturn);

    const yearData: Array<{
      year: number;
      growthRate: number;
      eps: number;
      futurePrice: number;
      discountedPrice: number;
    }> = [];

    let currentEps = safeEps;
    for (let i = 1; i <= safeYears; i++) {
      // Linear decay from starting growth to terminal growth
      const g = safeYears > 1
        ? epsGrowth - ((i - 1) / (safeYears - 1)) * (epsGrowth - terminalEpsGrowth)
        : epsGrowth;
      const gDecimal = g / 100;
      currentEps = currentEps * (1 + gDecimal);
      const futurePrice = currentEps * safeExitPe;
      const discountFactor = Math.pow(1 + safeReqReturn / 100, i);
      const discountedPrice = futurePrice / discountFactor;

      yearData.push({
        year: i,
        growthRate: g,
        eps: currentEps,
        futurePrice,
        discountedPrice
      });
    }

    const finalYearItem = yearData[safeYears - 1] || { eps: currentEps, futurePrice: currentEps * safeExitPe };
    const finalEps = finalYearItem.eps;
    const epsGrowthTotalPct = safeEps > 0 ? ((finalEps - safeEps) / safeEps) * 100 : 0;
    const finalStockPrice = finalEps * safeExitPe;
    const stockPriceChangePct = safePrice > 0 ? ((finalStockPrice - safePrice) / safePrice) * 100 : 0;

    // Fair Value = (finalEps * safeExitPe) / (1 + r)^n
    const fairValue = finalStockPrice / Math.pow(1 + safeReqReturn / 100, safeYears);
    const fairValueWithSafety = fairValue * (1 - marginOfSafety / 100);

    // Projected Annual Return (CAGR) from current price:
    const annualReturnPct = (safePrice > 0 && finalStockPrice > 0)
      ? (Math.pow(finalStockPrice / safePrice, 1 / safeYears) - 1) * 100
      : 0;

    // Difference between Fair Value and Current Price
    const diffPct = safePrice > 0 ? ((fairValue - safePrice) / safePrice) * 100 : 0;
    const currentPeRatio = safeEps > 0 ? safePrice / safeEps : 0;

    return {
      yearData,
      finalEps,
      epsGrowthTotalPct,
      finalStockPrice,
      stockPriceChangePct,
      fairValue,
      fairValueWithSafety,
      annualReturnPct,
      diffPct,
      currentPeRatio,
      safePrice
    };
  }, [price, eps, epsGrowth, terminalEpsGrowth, years, exitPe, requiredReturn, marginOfSafety]);

  // 2D Sensitivity Matrix: 5 growth variations x 5 exit P/E variations
  const sensitivityMatrix = useMemo(() => {
    const growthSteps = [
      epsGrowth - 5.0,
      epsGrowth - 2.5,
      epsGrowth,
      epsGrowth + 2.5,
      epsGrowth + 5.0
    ];
    const peSteps = [
      Math.max(4, exitPe - 4.0),
      Math.max(5, exitPe - 2.0),
      exitPe,
      exitPe + 2.0,
      exitPe + 4.0
    ];

    const safeYears = Math.max(1, Math.round(years));
    const safeReqReturn = Math.max(0.1, requiredReturn);

    const rows = growthSteps.map(gStart => {
      const cols = peSteps.map(peExit => {
        let curE = Math.max(0.01, eps);
        for (let i = 1; i <= safeYears; i++) {
          const g = safeYears > 1
            ? gStart - ((i - 1) / (safeYears - 1)) * (gStart - terminalEpsGrowth)
            : gStart;
          curE = curE * (1 + g / 100);
        }
        const fPrice = curE * peExit;
        const fv = fPrice / Math.pow(1 + safeReqReturn / 100, safeYears);
        return {
          pe: peExit,
          fairValue: fv,
          isAbovePrice: fv >= calculation.safePrice,
          isBaseline: Math.abs(gStart - epsGrowth) < 0.01 && Math.abs(peExit - exitPe) < 0.01
        };
      });
      return {
        growth: gStart,
        cols
      };
    });

    return { growthSteps, peSteps, rows };
  }, [eps, epsGrowth, terminalEpsGrowth, years, exitPe, requiredReturn, calculation.safePrice]);

  const handleSaveToTable = () => {
    const ticker = selectedStock?.ticker || searchQuery.trim().toUpperCase();
    if (!ticker) return;
    if (onUpdateFairPrice) {
      onUpdateFairPrice(ticker, parseFloat(calculation.fairValue.toFixed(2)));
      setSavedSuccessMsg(`Справедливата цена от $${calculation.fairValue.toFixed(2)} беше записана за ${ticker}!`);
      setTimeout(() => setSavedSuccessMsg(null), 3500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="w-full max-w-6xl bg-card border border-border rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[96vh] overflow-y-auto">
        
        {/* Modal Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shrink-0">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase text-ink tracking-wide">
                  Fair Value Calculator
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Earnings Multiple Model
                </span>
              </div>
              <p className="text-xs text-ink-faint">
                Оценка на справедливата стойност (Intrinsic Value) на акция според очакваните бъдещи печалби и P/E
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                window.open(`${window.location.origin}${window.location.pathname}#fair-value`, '_blank');
              }}
              className="px-2.5 py-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Отвори в самостоятелен прозорец"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Нов прозорец</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-ink-faint hover:text-ink hover:bg-card-hover transition-all cursor-pointer"
              title="Затвори"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar to Auto-Fill Stock Numbers */}
        <div className="relative" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-ink-faint absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Търси компания или тикер (напр. AAPL, NVDA, MSFT) за автоматично зареждане..."
              className="w-full bg-bg border border-border/70 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-ink placeholder-ink-faint/60 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            {selectedStock && (
              <div className="absolute right-3 flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  {selectedStock.ticker} (${selectedStock.currentPrice?.toFixed(2)})
                </span>
              </div>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && filteredStocks.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-border/20 max-h-60 overflow-y-auto">
              {filteredStocks.map(stk => (
                <button
                  key={stk.ticker}
                  type="button"
                  onClick={() => handleSelectStock(stk)}
                  className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-indigo-500/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-indigo-400">{stk.ticker}</span>
                    <span className="text-xs text-ink-muted truncate max-w-[200px] sm:max-w-xs">{stk.companyName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-xs font-bold text-ink">${stk.currentPrice?.toFixed(2)}</span>
                    <span className="text-[10px] text-ink-faint">P/E: {stk.peRatio ? stk.peRatio.toFixed(1) : '-'}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT COLUMN: Assumptions Sidebar (4 cols on lg) */}
          <div className="lg:col-span-4 bg-bg/50 border border-border/60 rounded-3xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <h3 className="text-xs font-black uppercase text-ink tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Assumptions (Параметри)</span>
              </h3>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] text-ink-faint hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Върни стойности по подразбиране"
              >
                <RotateCcw className="w-3 h-3" />
                <span>По подразбиране</span>
              </button>
            </div>

            {/* Input 1: Current Stock Price */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase flex justify-between">
                <span>Current Stock Price</span>
                <span className="text-indigo-400 font-mono">${price.toFixed(2)}</span>
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint font-bold">$</span>
                  <input
                    type="number"
                    step="1"
                    min="0.01"
                    value={price}
                    onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-card border border-border rounded-xl pl-7 pr-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPrice(prev => Math.max(1, prev - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => setPrice(prev => prev + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Input 2: Earnings per Share (EPS) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase flex justify-between">
                <span>Earnings per Share (EPS)</span>
                <span className="text-indigo-400 font-mono">${eps.toFixed(2)}</span>
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint font-bold">$</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.01"
                    value={eps}
                    onChange={e => setEps(parseFloat(e.target.value) || 0)}
                    className="w-full bg-card border border-border rounded-xl pl-7 pr-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEps(prev => Math.max(0.1, parseFloat((prev - 0.5).toFixed(2))))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => setEps(prev => parseFloat((prev + 0.5).toFixed(2)))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Input 3: EPS Growth Rate */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase flex justify-between">
                <span>EPS Growth Rate (Начален)</span>
                <span className="text-emerald-400 font-mono">+{epsGrowth.toFixed(1)}%</span>
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="1"
                    value={epsGrowth}
                    onChange={e => setEpsGrowth(parseFloat(e.target.value) || 0)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500 pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint font-bold">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEpsGrowth(prev => prev - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => setEpsGrowth(prev => prev + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Input 4: Terminal EPS Growth Rate */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase flex justify-between">
                <span>Terminal EPS Growth (Краен)</span>
                <span className="text-amber-400 font-mono">+{terminalEpsGrowth.toFixed(1)}%</span>
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.5"
                    value={terminalEpsGrowth}
                    onChange={e => setTerminalEpsGrowth(parseFloat(e.target.value) || 0)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500 pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint font-bold">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTerminalEpsGrowth(prev => parseFloat((prev - 0.5).toFixed(1)))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => setTerminalEpsGrowth(prev => parseFloat((prev + 0.5).toFixed(1)))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Input 5: Years */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase flex justify-between">
                <span>Years (Години прогноза)</span>
                <span className="text-indigo-400 font-mono">{years} години</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="20"
                  step="1"
                  value={years}
                  onChange={e => setYears(Math.max(1, Math.min(20, parseInt(e.target.value) || 10)))}
                  className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setYears(prev => Math.max(1, prev - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => setYears(prev => Math.min(20, prev + 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Input 6: Exit P/E Ratio */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase flex justify-between">
                <span>Exit P/E Ratio (Кратен коефициент)</span>
                <span className="text-indigo-400 font-mono">{exitPe.toFixed(1)}x</span>
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={exitPe}
                    onChange={e => setExitPe(parseFloat(e.target.value) || 0)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500 pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint font-bold">x</span>
                </div>
                <button
                  type="button"
                  onClick={() => setExitPe(prev => Math.max(1, parseFloat((prev - 0.5).toFixed(1))))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => setExitPe(prev => parseFloat((prev + 0.5).toFixed(1)))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Input 7: Required Annual Return */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase flex justify-between">
                <span>Required Annual Return (Hurdle Rate)</span>
                <span className="text-indigo-400 font-mono">{requiredReturn.toFixed(1)}%</span>
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={requiredReturn}
                    onChange={e => setRequiredReturn(parseFloat(e.target.value) || 0)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500 pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint font-bold">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRequiredReturn(prev => Math.max(1, parseFloat((prev - 0.5).toFixed(1))))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => setRequiredReturn(prev => parseFloat((prev + 0.5).toFixed(1)))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Input 8: Margin of Safety */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase flex justify-between">
                <span>Margin of Safety (Марж на безопасност)</span>
                <span className="text-emerald-400 font-mono">{marginOfSafety.toFixed(0)}%</span>
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="5"
                    min="0"
                    max="50"
                    value={marginOfSafety}
                    onChange={e => setMarginOfSafety(parseFloat(e.target.value) || 0)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500 pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint font-bold">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMarginOfSafety(prev => Math.max(0, prev - 5))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => setMarginOfSafety(prev => Math.min(50, prev + 5))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Save to Table Button */}
            {onUpdateFairPrice && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveToTable}
                  className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                  <span>Запази като Fair Price (${calculation.fairValue.toFixed(2)})</span>
                </button>
                {savedSuccessMsg && (
                  <p className="text-[11px] text-emerald-400 font-bold text-center mt-1.5 animate-in fade-in">
                    ✓ {savedSuccessMsg}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Results, Hero Card & Interactive Tabs (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Top 4 Key Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* Tile 1: EPS in Year N */}
              <div className="bg-bg/60 border border-border/60 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-ink-faint leading-tight">
                  EPS в Година {years}
                </span>
                <div className="mt-1">
                  <span className="text-base sm:text-lg font-black font-mono text-ink">
                    ${calculation.finalEps.toFixed(2)}
                  </span>
                  <span className="block text-[10px] font-bold text-emerald-400 font-mono">
                    +{calculation.epsGrowthTotalPct.toFixed(1)}% ръст
                  </span>
                </div>
              </div>

              {/* Tile 2: Stock Price in Year N */}
              <div className="bg-bg/60 border border-border/60 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-ink-faint leading-tight">
                  Цена в Година {years}
                </span>
                <div className="mt-1">
                  <span className="text-base sm:text-lg font-black font-mono text-ink">
                    ${calculation.finalStockPrice.toFixed(2)}
                  </span>
                  <span className={`block text-[10px] font-bold font-mono ${calculation.stockPriceChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {calculation.stockPriceChangePct >= 0 ? '+' : ''}{calculation.stockPriceChangePct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Tile 3: Projected Annual Return */}
              <div className="bg-bg/60 border border-border/60 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-ink-faint leading-tight">
                  Годишна Доходност
                </span>
                <div className="mt-1">
                  <span className={`text-base sm:text-lg font-black font-mono ${calculation.annualReturnPct >= requiredReturn ? 'text-emerald-400' : calculation.annualReturnPct > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {calculation.annualReturnPct.toFixed(1)}%
                  </span>
                  <span className="block text-[10px] text-ink-faint">
                    CAGR при сегашна цена
                  </span>
                </div>
              </div>

              {/* Tile 4: Current P/E Ratio */}
              <div className="bg-bg/60 border border-border/60 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-ink-faint leading-tight">
                  Текущо P/E
                </span>
                <div className="mt-1">
                  <span className="text-base sm:text-lg font-black font-mono text-indigo-400">
                    {calculation.currentPeRatio > 0 ? calculation.currentPeRatio.toFixed(1) + 'x' : '-'}
                  </span>
                  <span className="block text-[10px] text-ink-faint">
                    Exit P/E: {exitPe.toFixed(1)}x
                  </span>
                </div>
              </div>
            </div>

            {/* Fair Value Hero Card */}
            <div className="bg-gradient-to-br from-indigo-950/40 via-card to-card border border-indigo-500/30 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider block mb-1">
                    Справедлива стойност (Earnings Multiple)
                  </span>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-ink tracking-tight">
                      ${calculation.fairValue.toFixed(2)}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-black uppercase rounded-lg border flex items-center gap-1 ${
                      calculation.diffPct >= 0
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {calculation.diffPct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{Math.abs(calculation.diffPct).toFixed(1)}% {calculation.diffPct >= 0 ? 'upside (подценена)' : 'downside (надценена)'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2">
                  <span className={`px-3 py-1.5 text-xs font-black uppercase rounded-xl border ${
                    calculation.diffPct >= 20
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                      : calculation.diffPct >= 0
                      ? 'bg-emerald-700/80 text-white border-emerald-600'
                      : calculation.diffPct >= -10
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-rose-700 text-white border-rose-600 shadow-md shadow-rose-500/20'
                  }`}>
                    {calculation.diffPct >= 20 ? '🔥 СИЛНО ПОДЦЕНЕНА' : calculation.diffPct >= 0 ? '🎯 ПОДЦЕНЕНА' : calculation.diffPct >= -10 ? '⚖️ СПРАВЕДЛИВО ОЦЕНЕНА' : '⚠️ НАДЦЕНЕНА'}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    Текуща цена: <strong className="text-ink font-mono">${price.toFixed(2)}</strong>
                  </span>
                </div>
              </div>

              {/* Visual Valuation Comparison Bar & Buy Zone */}
              <div className="bg-bg/60 border border-border/50 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Buy Zone (с {marginOfSafety.toFixed(0)}% марж на безопасност):</span>
                    <strong className="font-mono text-sm">${calculation.fairValueWithSafety.toFixed(2)}</strong>
                  </div>
                  <div className="text-ink-faint text-[11px]">
                    Справедлива цена: <span className="font-mono font-bold text-ink">${calculation.fairValue.toFixed(2)}</span>
                  </div>
                </div>

                {/* Progress bar visualizer */}
                <div className="h-3 w-full bg-border/40 rounded-full overflow-hidden relative">
                  {/* Buy Zone Green Segment */}
                  <div 
                    className="h-full bg-emerald-500/60 rounded-l-full"
                    style={{ width: `${Math.min(100, Math.max(10, (calculation.fairValueWithSafety / Math.max(price, calculation.fairValue * 1.3)) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-ink-faint">
                  <span>$0</span>
                  <span className="text-emerald-400 font-bold">Цел за покупка: &le; ${calculation.fairValueWithSafety.toFixed(2)}</span>
                  <span>Сегашна цена: ${price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Interactive Tabs Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('sensitivity')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${
                    activeTab === 'sensitivity'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-ink-faint hover:text-ink hover:bg-card-hover'
                  }`}
                >
                  2D Сензитивна Матрица (Heatmap)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('trajectory')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${
                    activeTab === 'trajectory'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-ink-faint hover:text-ink hover:bg-card-hover'
                  }`}
                >
                  Прогнозна Траектория (1 - {years} г.)
                </button>
              </div>
              <span className="text-[11px] text-ink-faint hidden sm:inline">
                {activeTab === 'sensitivity' ? 'Зелено = Подценена | Червено = Надценена' : 'Прогноза по години'}
              </span>
            </div>

            {/* TAB 1: 2D Sensitivity Matrix (Heatmap) */}
            {activeTab === 'sensitivity' && (
              <div className="bg-bg/40 border border-border/60 rounded-2xl p-3 sm:p-4 overflow-x-auto space-y-2">
                <div className="flex items-center justify-between text-xs text-ink-faint mb-1">
                  <span>EPS Growth &darr; / Exit P/E &rarr;</span>
                  <span className="text-[11px]">Кликнете върху клетка, за да приложите тези параметри</span>
                </div>

                <table className="w-full text-center border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border/60 text-ink-faint text-[11px]">
                      <th className="py-2 px-2 text-left font-sans font-bold uppercase">EPS Growth</th>
                      {sensitivityMatrix.peSteps.map(peVal => (
                        <th key={peVal} className={`py-2 px-2 font-bold ${Math.abs(peVal - exitPe) < 0.01 ? 'text-indigo-400 bg-indigo-500/10 rounded-t-lg' : ''}`}>
                          {peVal.toFixed(1)}x
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {sensitivityMatrix.rows.map((r, rIdx) => (
                      <tr key={rIdx}>
                        <td className={`py-2 px-2 text-left font-bold font-sans text-[11px] ${Math.abs(r.growth - epsGrowth) < 0.01 ? 'text-indigo-400 bg-indigo-500/10 rounded-l-lg' : 'text-ink-faint'}`}>
                          {r.growth.toFixed(1)}%
                        </td>
                        {r.cols.map((cell, cIdx) => (
                          <td key={cIdx} className="p-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEpsGrowth(parseFloat(r.growth.toFixed(1)));
                                setExitPe(parseFloat(cell.pe.toFixed(1)));
                              }}
                              className={`w-full py-2 px-1 rounded-lg text-center font-bold transition-all cursor-pointer ${
                                cell.isBaseline
                                  ? 'ring-2 ring-indigo-400 scale-[1.03] z-10 font-black shadow-lg shadow-indigo-500/20'
                                  : 'hover:scale-[1.02]'
                              } ${
                                cell.isAbovePrice
                                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                              }`}
                              title={`EPS Growth: ${r.growth.toFixed(1)}%, Exit P/E: ${cell.pe.toFixed(1)}x -> Fair Value: $${cell.fairValue.toFixed(2)}`}
                            >
                              ${cell.fairValue.toFixed(2)}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: Year-by-Year Growth Trajectory */}
            {activeTab === 'trajectory' && (
              <div className="bg-bg/40 border border-border/60 rounded-2xl p-3 sm:p-4 overflow-x-auto space-y-3">
                <table className="w-full text-right border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border/60 text-ink-faint text-[11px]">
                      <th className="py-2 px-2 text-left font-sans font-bold">Година</th>
                      <th className="py-2 px-2 font-sans font-bold">Темп ръст %</th>
                      <th className="py-2 px-2 font-sans font-bold">Прогнозен EPS</th>
                      <th className="py-2 px-2 font-sans font-bold">Бъдеща цена ({exitPe.toFixed(1)}x)</th>
                      <th className="py-2 px-2 font-sans font-bold">Дисконтирана ст-ст ({requiredReturn.toFixed(1)}%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {calculation.yearData.map(item => (
                      <tr key={item.year} className="hover:bg-card-hover/40 transition-colors">
                        <td className="py-2 px-2 text-left font-sans font-bold text-ink">
                          Година {item.year}
                        </td>
                        <td className="py-2 px-2 text-emerald-400 font-bold">
                          +{item.growthRate.toFixed(1)}%
                        </td>
                        <td className="py-2 px-2 text-ink font-bold">
                          ${item.eps.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-indigo-400 font-bold">
                          ${item.futurePrice.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-ink-muted">
                          ${item.discountedPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Educational / Mathematical Model Explanation */}
            <div className="bg-bg/40 border border-border/50 rounded-2xl p-3.5 space-y-1.5 text-xs text-ink-muted leading-relaxed">
              <div className="flex items-center gap-1.5 text-ink font-bold">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>Как работи моделът на Справедливата стойност (Earnings Multiple):</span>
              </div>
              <p className="text-[11px] text-ink-faint">
                Печалбата на акция (EPS) се увеличава за избрания брой години, като темпът постепенно се забавя от началния към терминалния ръст. След това се умножава по изходния P/E коефициент за определяне на бъдещата цена, която се дисконтира назад към днешна дата с твоята изисквана годишна доходност (Hurdle Rate).
              </p>
              <div className="p-2 rounded-xl bg-card border border-border/60 font-mono text-[11px] text-indigo-300 font-bold flex items-center justify-between">
                <span>Fair Value = EPS в Година {years} &times; Exit P/E &divide; (1 + r)<sup>{years}</sup></span>
                <span className="text-ink-faint text-[10px]">r = {requiredReturn}%</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
