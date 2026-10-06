import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Stock } from '../types';
import { Calculator, X, Search, RotateCcw, TrendingUp, TrendingDown, Check, ExternalLink, Info, ShieldCheck, ArrowRight, Save, Layers, BarChart3, Table as TableIcon, RefreshCw } from 'lucide-react';

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
  // Selected Stock from Search (null = clean benchmark model like StockAnalysis defaults)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(initialStock);
  const [searchQuery, setSearchQuery] = useState(initialStock?.ticker || '');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Active view toggle between Chart + Sensitivity vs Trajectory Table
  const [viewMode, setViewMode] = useState<'chart_matrix' | 'trajectory'>('chart_matrix');

  // Input Assumptions (1:1 with StockAnalysis Fair Value Calculator defaults)
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
      return Math.min(25, Math.max(10, Math.round(initialStock.peRatio)));
    }
    return 18.0;
  });
  const [requiredReturn, setRequiredReturn] = useState<number>(10.0);
  const [marginOfSafety, setMarginOfSafety] = useState<number>(0.0); // StockAnalysis default is 0%

  // Recalculation & Pending Changes State (for the new "Преизчисли" button)
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcFeedback, setRecalcFeedback] = useState<string | null>(null);
  const [flashHeroHighlight, setFlashHeroHighlight] = useState(false);

  // Hover state for interactive SVG chart
  const [hoveredYearIndex, setHoveredYearIndex] = useState<number | null>(null);
  const [showChartInfo, setShowChartInfo] = useState(false);
  const chartSvgRef = useRef<SVGSVGElement>(null);

  // Feedback toast when saving
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Sync if initialStock changes from parent
  useEffect(() => {
    if (initialStock) {
      handleSelectStock(initialStock);
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
    // Terminal Exit P/E is typically 15-20x. If stock PE is reasonable use it, else default to 18-20
    if (stk.peRatio && stk.peRatio > 0) {
      setExitPe(Math.min(25, Math.max(12, Math.round(stk.peRatio))));
    } else {
      setExitPe(18.0);
    }
    setMarginOfSafety(0.0);
    setHasPendingChanges(false);
  };

  const handleClearStock = () => {
    setSelectedStock(null);
    setSearchQuery('');
    setPrice(100.0);
    setEps(5.0);
    setEpsGrowth(10.0);
    setTerminalEpsGrowth(4.0);
    setYears(10);
    setExitPe(18.0);
    setRequiredReturn(10.0);
    setMarginOfSafety(0.0);
    setHasPendingChanges(false);
  };

  const handleResetDefaults = () => {
    if (selectedStock) {
      handleSelectStock(selectedStock);
    } else {
      handleClearStock();
    }
  };

  // Helper to mark changes when any input field changes
  const markInputChange = () => {
    setHasPendingChanges(true);
    setRecalcFeedback(null);
  };

  // Mathematical Model (Earnings Multiple Method with smooth decay) - Exactly matching StockAnalysis
  const calculation = useMemo(() => {
    const safeYears = Math.max(1, Math.min(20, Math.round(years)));
    const safePrice = Math.max(0.01, price);
    const safeEps = Math.max(0.01, eps);
    const safeExitPe = Math.max(1, exitPe);
    const safeReqReturn = Math.max(0.1, requiredReturn);

    const yearData: Array<{
      year: number;
      label: string;
      growthRate: number;
      eps: number;
      futurePrice: number;
      discountedPrice: number;
    }> = [];

    // Year 0 (Current benchmark)
    yearData.push({
      year: 0,
      label: 'Current',
      growthRate: 0,
      eps: safeEps,
      futurePrice: safePrice,
      discountedPrice: safePrice
    });

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
        label: `Y${i}`,
        growthRate: g,
        eps: currentEps,
        futurePrice,
        discountedPrice
      });
    }

    const finalYearItem = yearData[safeYears];
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

    // Buy Zone and Bar Scaling (1:1 with StockAnalysis progress bar math)
    const isOvervalued = safePrice >= fairValue;
    const maxBarScale = isOvervalued ? (safePrice / 0.8) : (fairValue / 0.8);
    const buyZonePct = Math.min(100, Math.max(0, (fairValueWithSafety / maxBarScale) * 100));
    const fairValuePct = Math.min(100, Math.max(0, (fairValue / maxBarScale) * 100));
    const priceNeedlePct = isOvervalued ? 80 : Math.min(100, Math.max(0, (safePrice / maxBarScale) * 100));

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
      safePrice,
      isOvervalued,
      buyZonePct,
      fairValuePct,
      priceNeedlePct
    };
  }, [price, eps, epsGrowth, terminalEpsGrowth, years, exitPe, requiredReturn, marginOfSafety]);

  // Recalculate button handler
  const handleRecalculate = () => {
    setIsRecalculating(true);
    setHasPendingChanges(false);
    setFlashHeroHighlight(true);
    setRecalcFeedback(`Преизчислено: Fair Value $${calculation.fairValue.toFixed(2)}`);

    setTimeout(() => {
      setIsRecalculating(false);
    }, 350);

    setTimeout(() => {
      setFlashHeroHighlight(false);
    }, 1200);

    setTimeout(() => {
      setRecalcFeedback(null);
    }, 4500);
  };

  // 2D Sensitivity Matrix: 5 growth variations x 5 exit P/E variations (Step 2.5% for growth, Step 2.0 for PE)
  const sensitivityMatrix = useMemo(() => {
    const growthSteps = [
      epsGrowth - 5.0,
      epsGrowth - 2.5,
      epsGrowth,
      epsGrowth + 2.5,
      epsGrowth + 5.0
    ];
    const peSteps = [
      Math.max(2, exitPe - 4.0),
      Math.max(3, exitPe - 2.0),
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
    if (!ticker) {
      alert('Моля, потърсете и изберете акция за запазване в таблицата.');
      return;
    }
    if (onUpdateFairPrice) {
      onUpdateFairPrice(ticker, parseFloat(calculation.fairValue.toFixed(2)));
      setSavedSuccessMsg(`Справедливата цена от $${calculation.fairValue.toFixed(2)} беше записана за ${ticker}!`);
      setTimeout(() => setSavedSuccessMsg(null), 3500);
    }
  };

  // Helper to handle mouse move over SVG chart to track nearest year
  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartSvgRef.current) return;
    const rect = chartSvgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgWidth = rect.width;
    if (svgWidth <= 0) return;

    // Convert mouseX to plot coordinate fraction
    // Plot area starts at x=55 and ends at x=705 (viewBox 0 0 760 300)
    const plotLeft = (55 / 760) * svgWidth;
    const plotRight = (705 / 760) * svgWidth;
    const plotWidth = plotRight - plotLeft;

    if (mouseX < plotLeft - 20 || mouseX > plotRight + 20) {
      setHoveredYearIndex(null);
      return;
    }

    const ratio = Math.max(0, Math.min(1, (mouseX - plotLeft) / plotWidth));
    const totalPoints = calculation.yearData.length;
    const closestIdx = Math.round(ratio * (totalPoints - 1));
    setHoveredYearIndex(closestIdx);
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
                Оценка на справедливата стойност (Intrinsic Value) според бъдещите печалби и кратно P/E
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

        {/* Search Bar (Optional prefill from portfolio / table) */}
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
              placeholder="Search for a stock to pre-fill its numbers (optional) - напр. AAPL, MSFT, NVDA..."
              className="w-full bg-bg border border-border/70 rounded-2xl pl-10 pr-24 py-2.5 text-xs sm:text-sm text-ink placeholder-ink-faint/60 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            {selectedStock ? (
              <div className="absolute right-3 flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  {selectedStock.ticker} (${selectedStock.currentPrice?.toFixed(2)})
                </span>
                <button
                  type="button"
                  onClick={handleClearStock}
                  className="p-1 text-ink-faint hover:text-ink rounded-full hover:bg-card-hover transition-colors"
                  title="Изчисти и върни фабричните параметри ($100 / $5)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : searchQuery ? (
              <button
                type="button"
                onClick={handleClearStock}
                className="absolute right-3 p-1 text-ink-faint hover:text-ink rounded-full hover:bg-card-hover transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
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
                <span>Assumptions</span>
              </h3>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] text-ink-faint hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Върни фабрични стойности"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
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
                    min="0"
                    value={price}
                    onChange={e => {
                      setPrice(parseFloat(e.target.value) || 0);
                      markInputChange();
                    }}
                    className="w-full bg-card border border-border rounded-xl pl-7 pr-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPrice(prev => Math.max(1, prev - 1));
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => {
                    setPrice(prev => prev + 1);
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Input 2: Earnings Per Share (EPS) */}
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
                    onChange={e => {
                      setEps(parseFloat(e.target.value) || 0);
                      markInputChange();
                    }}
                    className="w-full bg-card border border-border rounded-xl pl-7 pr-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEps(prev => Math.max(0.1, parseFloat((prev - 0.5).toFixed(2))));
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => {
                    setEps(prev => parseFloat((prev + 0.5).toFixed(2)));
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Input 3: EPS Growth Rate */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase flex justify-between">
                <span>EPS Growth Rate</span>
                <span className="text-emerald-400 font-mono">{epsGrowth.toFixed(1)}%</span>
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="1"
                    min="-50"
                    max="100"
                    value={epsGrowth}
                    onChange={e => {
                      setEpsGrowth(parseFloat(e.target.value) || 0);
                      markInputChange();
                    }}
                    className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500 pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint font-bold">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEpsGrowth(prev => prev - 1);
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => {
                    setEpsGrowth(prev => prev + 1);
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Input 4: Terminal EPS Growth Rate */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase flex justify-between">
                <span>Terminal EPS Growth Rate</span>
                <span className="text-amber-400 font-mono">{terminalEpsGrowth.toFixed(1)}%</span>
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.5"
                    min="-50"
                    max="100"
                    value={terminalEpsGrowth}
                    onChange={e => {
                      setTerminalEpsGrowth(parseFloat(e.target.value) || 0);
                      markInputChange();
                    }}
                    className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500 pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint font-bold">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTerminalEpsGrowth(prev => parseFloat((prev - 0.5).toFixed(1)));
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => {
                    setTerminalEpsGrowth(prev => parseFloat((prev + 0.5).toFixed(1)));
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Input 5: Years */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase flex justify-between">
                <span>Years</span>
                <span className="text-indigo-400 font-mono">{years} г.</span>
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="20"
                    value={years}
                    onChange={e => {
                      setYears(parseInt(e.target.value) || 1);
                      markInputChange();
                    }}
                    className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setYears(prev => Math.max(1, prev - 1));
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => {
                    setYears(prev => Math.min(20, prev + 1));
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Input 6: Exit P/E Ratio */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase flex justify-between">
                <span>Exit P/E Ratio</span>
                <span className="text-indigo-400 font-mono">{exitPe.toFixed(1)}x</span>
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="200"
                    value={exitPe}
                    onChange={e => {
                      setExitPe(parseFloat(e.target.value) || 0);
                      markInputChange();
                    }}
                    className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500 pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint font-bold">x</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setExitPe(prev => Math.max(1, prev - 1));
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => {
                    setExitPe(prev => prev + 1);
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Input 7: Required Annual Return */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase flex justify-between">
                <span>Required Annual Return</span>
                <span className="text-indigo-400 font-mono">{requiredReturn.toFixed(1)}%</span>
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="50"
                    value={requiredReturn}
                    onChange={e => {
                      setRequiredReturn(parseFloat(e.target.value) || 0);
                      markInputChange();
                    }}
                    className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500 pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint font-bold">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRequiredReturn(prev => Math.max(1, parseFloat((prev - 0.5).toFixed(1))));
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => {
                    setRequiredReturn(prev => parseFloat((prev + 0.5).toFixed(1)));
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Input 8: Margin of Safety */}
            <div className="space-y-1 border-t border-border/40 pt-2.5">
              <label className="text-[11px] font-bold text-ink-muted uppercase flex justify-between">
                <span>Margin of Safety</span>
                <span className="text-emerald-400 font-mono">{marginOfSafety.toFixed(0)}%</span>
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="5"
                    min="0"
                    max="90"
                    value={marginOfSafety}
                    onChange={e => {
                      setMarginOfSafety(parseFloat(e.target.value) || 0);
                      markInputChange();
                    }}
                    className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-indigo-500 pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint font-bold">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMarginOfSafety(prev => Math.max(0, prev - 5));
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >−</button>
                <button
                  type="button"
                  onClick={() => {
                    setMarginOfSafety(prev => Math.min(90, prev + 5));
                    markInputChange();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-ink-muted hover:text-ink hover:bg-card-hover font-bold text-sm cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* ACTION BUTTONS: Recalculate + Save */}
            <div className="pt-3 space-y-2 border-t border-border/40">
              
              {/* 1. БУТОН ПРЕИЗЧИСЛИ (Recalculate Button) */}
              <button
                type="button"
                onClick={handleRecalculate}
                className={`w-full py-2.5 px-3 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] ${
                  hasPendingChanges
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/30 ring-2 ring-amber-400/80 animate-pulse'
                    : 'bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/40 hover:border-indigo-500'
                }`}
                title="Преизчисли всички резултати и графиката с новите входни данни"
              >
                <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
                <span>Преизчисли</span>
                {hasPendingChanges && (
                  <span className="px-1.5 py-0.5 text-[9px] bg-stone-950 text-amber-300 rounded font-black tracking-normal">
                    Нови данни
                  </span>
                )}
              </button>

              {recalcFeedback && (
                <div className="text-[11px] text-emerald-400 font-bold text-center py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 animate-in fade-in">
                  ✓ {recalcFeedback}
                </div>
              )}

              {/* 2. БУТОН ЗАПАЗИ ЗА КОМПАНИЯТА (Save Button) */}
              {onUpdateFairPrice && selectedStock && (
                <div>
                  <button
                    type="button"
                    onClick={handleSaveToTable}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    title={`Запази справедлива цена от $${calculation.fairValue.toFixed(2)} за ${selectedStock.ticker} в Интерактивната Таблица`}
                  >
                    <Save className="w-4 h-4" />
                    <span>Запази за {selectedStock.ticker} (${calculation.fairValue.toFixed(2)})</span>
                  </button>
                  {savedSuccessMsg && (
                    <p className="text-[11px] text-emerald-400 font-bold text-center mt-1.5 animate-in fade-in">
                      ✓ {savedSuccessMsg}
                    </p>
                  )}
                </div>
              )}

              {/* Ако няма избрана компания от търсенето */}
              {!selectedStock && (
                <p className="text-[10px] text-ink-faint text-center leading-tight pt-1">
                  💡 Изберете компания от търсачката по-горе, за да активирате бутона за запазване в таблицата.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Results, Hero Card & Interactive Visuals (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Top 4 Key Metric Cards (1:1 with StockAnalysis Tiles) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* Tile 1: EPS in Year N */}
              <div className="bg-bg/60 border border-border/60 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-xs font-medium text-ink-muted">
                  EPS in Year {years}
                </span>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="text-lg sm:text-xl font-bold font-mono text-ink">
                    ${calculation.finalEps.toFixed(2)}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    calculation.epsGrowthTotalPct >= 0
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                  }`}>
                    {calculation.epsGrowthTotalPct >= 0 ? '+' : ''}{calculation.epsGrowthTotalPct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Tile 2: Stock Price in Year N */}
              <div className="bg-bg/60 border border-border/60 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-xs font-medium text-ink-muted">
                  Stock Price in Year {years}
                </span>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="text-lg sm:text-xl font-bold font-mono text-ink">
                    ${calculation.finalStockPrice.toFixed(2)}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    calculation.stockPriceChangePct >= 0
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                  }`}>
                    {calculation.stockPriceChangePct >= 0 ? '+' : ''}{calculation.stockPriceChangePct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Tile 3: Projected Annual Return */}
              <div className="bg-bg/60 border border-border/60 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-xs font-medium text-ink-muted">
                  Annual Return
                </span>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="text-lg sm:text-xl font-bold font-mono text-ink">
                    {calculation.annualReturnPct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Tile 4: Current P/E Ratio */}
              <div className="bg-bg/60 border border-border/60 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-xs font-medium text-ink-muted">
                  Current P/E Ratio
                </span>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="text-lg sm:text-xl font-bold font-mono text-ink">
                    {calculation.currentPeRatio > 0 ? calculation.currentPeRatio.toFixed(2) : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Fair Value Hero Card with 1:1 StockAnalysis Buy Zone Needle & Scale */}
            <div className={`rounded-2xl border bg-card p-4 sm:p-5 shadow-sm space-y-4 transition-all duration-300 ${
              flashHeroHighlight
                ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-500/5'
                : 'border-border'
            }`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-ink-muted">
                    Fair Value (Earnings Multiple)
                  </div>
                  <div className="mt-1 flex flex-wrap items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-ink tracking-tight">
                      ${calculation.fairValue.toFixed(2)}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs sm:text-sm font-semibold ${
                      calculation.diffPct >= 0
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                    }`}>
                      {calculation.diffPct >= 0 ? '+' : ''}{calculation.diffPct.toFixed(1)}% {calculation.diffPct >= 0 ? 'upside' : 'downside'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-ink-faint">Current Price</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-ink">
                    ${calculation.safePrice.toFixed(2)}
                  </div>
                  {marginOfSafety > 0 && (
                    <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                      Buy Target: ≤ ${calculation.fairValueWithSafety.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Exact StockAnalysis Visual Scale Bar */}
              <div className="pt-2" aria-hidden="true">
                {/* Top Brackets */}
                <div className="relative h-6">
                  {/* Buy Zone Bracket */}
                  <div 
                    className="absolute bottom-0 flex flex-col justify-end transition-all duration-300"
                    style={{ left: '0%', width: `${calculation.buyZonePct}%` }}
                  >
                    <div className="mb-0.5 whitespace-nowrap text-center text-[10px] sm:text-[11px] font-medium leading-tight text-ink-muted">
                      Buy Zone {marginOfSafety > 0 ? `(≤$${calculation.fairValueWithSafety.toFixed(2)})` : ''}
                    </div>
                    <div className="mx-px h-1.5 border-x border-t border-border"></div>
                  </div>

                  {/* Overvalued Bracket */}
                  <div 
                    className="absolute bottom-0 flex flex-col justify-end transition-all duration-300"
                    style={{ left: `${calculation.fairValuePct}%`, width: `${Math.max(0, 100 - calculation.fairValuePct)}%` }}
                  >
                    <div className="mb-0.5 whitespace-nowrap text-center text-[10px] sm:text-[11px] font-medium leading-tight text-ink-muted">
                      Overvalued
                    </div>
                    <div className="mx-px h-1.5 border-x border-t border-border"></div>
                  </div>
                </div>

                {/* 3-Color Segmented Track */}
                <div className="relative mt-1 h-3 overflow-hidden rounded-full bg-border/40">
                  {/* Green Buy Zone */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-emerald-500/80 transition-all duration-300"
                    style={{ width: `${calculation.buyZonePct}%` }}
                  />
                  {/* Amber Margin of Safety buffer */}
                  {marginOfSafety > 0 && (
                    <div 
                      className="absolute inset-y-0 bg-amber-400/80 transition-all duration-300"
                      style={{ 
                        left: `${calculation.buyZonePct}%`, 
                        width: `${Math.max(0, calculation.fairValuePct - calculation.buyZonePct)}%` 
                      }}
                    />
                  )}
                  {/* Red Overvalued zone */}
                  <div 
                    className="absolute inset-y-0 right-0 bg-rose-500/70 transition-all duration-300"
                    style={{ left: `${calculation.fairValuePct}%` }}
                  />
                </div>

                {/* Bottom Needle with Up-Pointing Arrow */}
                <div className="relative mt-1 h-8">
                  <div 
                    className="absolute -translate-x-1/2 transition-all duration-300"
                    style={{ left: `${calculation.priceNeedlePct}%` }}
                  >
                    <div className="mx-auto h-0 w-0 border-x-[5px] border-b-[7px] border-x-transparent border-b-ink"></div>
                    <div className="whitespace-nowrap text-[11px] font-bold text-ink font-mono mt-0.5">
                      Price ${calculation.safePrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* View Mode Switcher: Chart + Matrix vs Trajectory Table */}
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('chart_matrix')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'chart_matrix'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-ink-faint hover:text-ink hover:bg-card-hover'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Графика & Сензитивност</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('trajectory')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'trajectory'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-ink-faint hover:text-ink hover:bg-card-hover'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Траектория по години</span>
                </button>
              </div>
            </div>

            {/* Content View 1: Projected EPS and Stock Price Chart + Sensitivity Matrix (1:1 with StockAnalysis) */}
            {viewMode === 'chart_matrix' && (
              <div className="space-y-5">
                
                {/* 1:1 StockAnalysis Projected EPS & Stock Price Chart */}
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 pb-3">
                    <div className="flex items-center gap-2 relative">
                      <h3 className="text-sm sm:text-base font-bold text-ink">
                        Projected EPS and stock price
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowChartInfo(!showChartInfo)}
                        className="text-ink-faint hover:text-ink p-1 rounded-full hover:bg-card-hover transition-colors"
                        title="Информация за графиката"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      {showChartInfo && (
                        <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-card border border-border rounded-xl shadow-2xl text-xs text-ink-muted z-50 animate-in fade-in">
                          Очакван темп на EPS (синя крива) и прогнозна цена на акцията (зелена крива) за всяка година според заложените темпове на растеж и изходно P/E.
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
                        <span className="text-ink font-mono text-[11px]">EPS ($)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                        <span className="text-ink font-mono text-[11px]">Stock Price ($)</span>
                      </div>
                    </div>
                  </div>

                  {/* High-Fidelity Dual-Axis Chart (Exact StockAnalysis Look & Feel) */}
                  <div className="w-full h-72 sm:h-80 relative select-none">
                    {(() => {
                      const pts = calculation.yearData;
                      const numPts = pts.length;

                      // Safe ranges for Y-axes
                      const epsValues = pts.map(p => p.eps);
                      const maxEpsRaw = Math.max(...epsValues);
                      const maxEps = maxEpsRaw > 0 ? maxEpsRaw * 1.15 : 10;
                      const minEps = 0;

                      const priceValues = pts.map(p => p.futurePrice);
                      const maxPriceRaw = Math.max(...priceValues);
                      const maxPrice = maxPriceRaw > 0 ? maxPriceRaw * 1.15 : 200;
                      const minPrice = 0;

                      // Coordinate transformations for SVG ViewBox (0 0 760 280)
                      // Left margin: 55, Right margin: 55, Top margin: 25, Bottom margin: 40
                      const padLeft = 55;
                      const padRight = 55;
                      const padTop = 25;
                      const padBottom = 40;
                      const plotWidth = 760 - padLeft - padRight; // 650
                      const plotHeight = 280 - padTop - padBottom; // 215

                      const getX = (idx: number) => padLeft + (idx / Math.max(1, numPts - 1)) * plotWidth;
                      const getY_Eps = (v: number) => padTop + plotHeight - ((v - minEps) / Math.max(0.001, maxEps - minEps)) * plotHeight;
                      const getY_Price = (v: number) => padTop + plotHeight - ((v - minPrice) / Math.max(0.001, maxPrice - minPrice)) * plotHeight;

                      // Generate smooth Catmull-Rom to Cubic Bezier paths
                      const buildSmoothPath = (getYFunc: (p: typeof pts[0]) => number) => {
                        const coords = pts.map((p, idx) => ({ x: getX(idx), y: getYFunc(p) }));
                        if (coords.length === 0) return '';
                        if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
                        
                        let path = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
                        for (let i = 0; i < coords.length - 1; i++) {
                          const p0 = coords[Math.max(0, i - 1)];
                          const p1 = coords[i];
                          const p2 = coords[i + 1];
                          const p3 = coords[Math.min(coords.length - 1, i + 2)];

                          const cp1x = p1.x + (p2.x - p0.x) / 6;
                          const cp1y = p1.y + (p2.y - p0.y) / 6;
                          const cp2x = p2.x - (p3.x - p1.x) / 6;
                          const cp2y = p2.y - (p3.y - p1.y) / 6;

                          path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
                        }
                        return path;
                      };

                      const epsCurvePath = buildSmoothPath(p => getY_Eps(p.eps));
                      const priceCurvePath = buildSmoothPath(p => getY_Price(p.futurePrice));

                      // Gradient area under EPS curve
                      const epsAreaPath = `${epsCurvePath} L ${getX(numPts - 1)} ${padTop + plotHeight} L ${getX(0)} ${padTop + plotHeight} Z`;

                      // 5 Y-ticks levels: 0%, 25%, 50%, 75%, 100%
                      const yTicks = [0, 0.25, 0.5, 0.75, 1.0];

                      return (
                        <svg
                          ref={chartSvgRef}
                          viewBox="0 0 760 280"
                          className="w-full h-full overflow-visible"
                          onMouseMove={handleChartMouseMove}
                          onMouseLeave={() => setHoveredYearIndex(null)}
                        >
                          <defs>
                            <linearGradient id="epsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Horizontal Grid lines and Dual Y-axis labels */}
                          {yTicks.map((ratio, idx) => {
                            const yPos = padTop + plotHeight * (1 - ratio);
                            const tickEpsVal = minEps + (maxEps - minEps) * ratio;
                            const tickPriceVal = minPrice + (maxPrice - minPrice) * ratio;

                            return (
                              <g key={idx}>
                                {/* Grid Line */}
                                <line
                                  x1={padLeft}
                                  y1={yPos}
                                  x2={padLeft + plotWidth}
                                  y2={yPos}
                                  stroke="currentColor"
                                  className="text-border/40"
                                  strokeDasharray="4 4"
                                />

                                {/* Left Y-Axis Label (EPS in Blue) */}
                                <text
                                  x={padLeft - 10}
                                  y={yPos + 4}
                                  textAnchor="end"
                                  className="text-[10px] font-mono font-bold fill-blue-500/90"
                                >
                                  ${tickEpsVal.toFixed(2)}
                                </text>

                                {/* Right Y-Axis Label (Price in Emerald) */}
                                <text
                                  x={padLeft + plotWidth + 10}
                                  y={yPos + 4}
                                  textAnchor="start"
                                  className="text-[10px] font-mono font-bold fill-emerald-500/90"
                                >
                                  ${Math.round(tickPriceVal)}
                                </text>
                              </g>
                            );
                          })}

                          {/* Area fill under EPS curve */}
                          <path
                            d={epsAreaPath}
                            fill="url(#epsAreaGradient)"
                          />

                          {/* Projected Stock Price Curve (Emerald) */}
                          <path
                            d={priceCurvePath}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* Projected EPS Curve (Blue) */}
                          <path
                            d={epsCurvePath}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* Vertical guide line on active hovered year */}
                          {hoveredYearIndex !== null && (
                            <line
                              x1={getX(hoveredYearIndex)}
                              y1={padTop}
                              x2={getX(hoveredYearIndex)}
                              y2={padTop + plotHeight}
                              stroke="#6366f1"
                              strokeWidth="1.5"
                              strokeDasharray="4 4"
                            />
                          )}

                          {/* Interactive data points and X-axis ticks */}
                          {pts.map((p, idx) => {
                            const cx = getX(idx);
                            const cyEps = getY_Eps(p.eps);
                            const cyPrice = getY_Price(p.futurePrice);
                            const isHovered = hoveredYearIndex === idx;

                            return (
                              <g key={p.year}>
                                {/* X-axis Year Label */}
                                <text
                                  x={cx}
                                  y={padTop + plotHeight + 22}
                                  textAnchor="middle"
                                  className={`text-[11px] font-mono transition-colors ${
                                    isHovered ? 'fill-indigo-400 font-black' : 'fill-current text-ink-muted font-bold'
                                  }`}
                                >
                                  {p.label}
                                </text>

                                {/* Price Point (Emerald) */}
                                <circle
                                  cx={cx}
                                  cy={cyPrice}
                                  r={isHovered ? "7" : "4.5"}
                                  fill="#10b981"
                                  stroke="#ffffff"
                                  strokeWidth="2"
                                  className="transition-all duration-150 cursor-pointer"
                                />

                                {/* EPS Point (Blue) */}
                                <circle
                                  cx={cx}
                                  cy={cyEps}
                                  r={isHovered ? "7" : "4.5"}
                                  fill="#3b82f6"
                                  stroke="#ffffff"
                                  strokeWidth="2"
                                  className="transition-all duration-150 cursor-pointer"
                                />
                              </g>
                            );
                          })}
                        </svg>
                      );
                    })()}

                    {/* Rich Interactive Floating Tooltip (StockAnalysis Style) */}
                    {hoveredYearIndex !== null && (() => {
                      const item = calculation.yearData[hoveredYearIndex];
                      if (!item) return null;
                      const epsGrowthVsStart = calculation.yearData[0].eps > 0
                        ? ((item.eps - calculation.yearData[0].eps) / calculation.yearData[0].eps) * 100
                        : 0;
                      const priceGrowthVsStart = calculation.safePrice > 0
                        ? ((item.futurePrice - calculation.safePrice) / calculation.safePrice) * 100
                        : 0;

                      return (
                        <div className="absolute top-2 right-4 bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-3 text-xs space-y-1.5 pointer-events-none animate-in fade-in duration-100 min-w-[200px] border-indigo-500/30">
                          <div className="font-black text-ink border-b border-border/40 pb-1 flex justify-between items-center">
                            <span>{item.year === 0 ? 'Текущо състояние' : `Година ${item.year} (${item.label})`}</span>
                            {item.year > 0 && (
                              <span className="text-[10px] text-emerald-400 font-mono">+{item.growthRate.toFixed(1)}% YoY</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-blue-400 font-mono">
                            <span className="font-semibold text-ink-muted">EPS:</span>
                            <span className="font-bold">${item.eps.toFixed(2)} ({epsGrowthVsStart >= 0 ? '+' : ''}{epsGrowthVsStart.toFixed(1)}%)</span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-400 font-mono">
                            <span className="font-semibold text-ink-muted">Stock Price:</span>
                            <span className="font-bold">${item.futurePrice.toFixed(2)} ({priceGrowthVsStart >= 0 ? '+' : ''}{priceGrowthVsStart.toFixed(1)}%)</span>
                          </div>
                          <div className="flex items-center justify-between text-ink-faint font-mono text-[11px] pt-0.5 border-t border-border/30">
                            <span>Дисконтирано днес:</span>
                            <span>${item.discountedPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* 2D Sensitivity Matrix: Fair Value by EPS growth and exit P/E (1:1 with StockAnalysis) */}
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-ink">
                      Fair value by EPS growth and exit P/E
                    </h3>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Зелените клетки са над текущата цена (${calculation.safePrice.toFixed(2)}), червените са под нея. Очертаната клетка отразява текущите ви параметри. Кликнете върху клетка за бърза промяна.
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full border-collapse text-center text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-bg/80 border-b border-border">
                          <th className="px-3 py-2 text-left text-xs font-medium text-ink-muted whitespace-nowrap">
                            EPS Growth ↓ / Exit P/E →
                          </th>
                          {sensitivityMatrix.peSteps.map(pe => (
                            <th key={pe} className="px-3 py-2 font-semibold text-ink whitespace-nowrap">
                              {pe.toFixed(1)}x
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {sensitivityMatrix.rows.map(row => (
                          <tr key={row.growth}>
                            <th className="bg-bg/80 px-3 py-2 text-left font-semibold text-ink whitespace-nowrap">
                              {row.growth.toFixed(1)}%
                            </th>
                            {row.cols.map(col => {
                              return (
                                <td
                                  key={col.pe}
                                  onClick={() => {
                                    setEpsGrowth(row.growth);
                                    setExitPe(col.pe);
                                    markInputChange();
                                  }}
                                  className={`px-3 py-2 font-mono tabular-nums transition-all cursor-pointer ${
                                    col.isBaseline
                                      ? 'ring-2 ring-inset ring-blue-500 font-bold z-10'
                                      : ''
                                  } ${
                                    col.isAbovePrice
                                      ? 'bg-emerald-100 text-emerald-950 dark:bg-emerald-900/60 dark:text-emerald-100 hover:bg-emerald-200 dark:hover:bg-emerald-800'
                                      : 'bg-rose-100 text-rose-950 dark:bg-rose-900/50 dark:text-rose-100 hover:bg-rose-200 dark:hover:bg-rose-800'
                                  }`}
                                  title={`Кликни за задаване: Growth ${row.growth.toFixed(1)}%, Exit P/E ${col.pe.toFixed(1)}x -> Fair Value $${col.fairValue.toFixed(2)}`}
                                >
                                  ${col.fairValue.toFixed(2)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Educational Explanation Box (1:1 with StockAnalysis Tutorial) */}
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2">
                  <h4 className="text-sm sm:text-base font-bold text-ink">
                    How the Earnings Multiple method works
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed text-ink-muted">
                    Earnings per share (EPS) нарастват за избрания брой години, като растежът постепенно се забавя всяка година от началния до крайния темп, след което се умножава по изходното P/E, за да се изчисли бъдещата цена на акцията. Тази бъдеща цена се дисконтира обратно до днес с вашата изискуема годишна доходност (Hurdle Rate), което показва максималната цена, която можете да платите днес, за да постигнете тази възвръщаемост.
                  </p>
                  <div className="mt-2 rounded-xl bg-bg border border-border/70 p-2.5 font-mono text-xs text-ink">
                    Fair Value = EPS in Year n × Exit P/E ÷ (1 + r)ⁿ
                  </div>
                </div>

              </div>
            )}

            {/* Content View 2: Growth Trajectory Year-by-Year Table */}
            {viewMode === 'trajectory' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                  <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
                    Траектория по години (1 до {years} г.)
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-bg text-ink-faint uppercase font-bold text-[10px] border-b border-border">
                        <tr>
                          <th className="py-2.5 px-3">Година</th>
                          <th className="py-2.5 px-3">Темп на растеж</th>
                          <th className="py-2.5 px-3">Прогнозен EPS</th>
                          <th className="py-2.5 px-3">Бъдеща цена ({exitPe.toFixed(1)}x)</th>
                          <th className="py-2.5 px-3 text-right">Дисконтирана стойност ({requiredReturn.toFixed(1)}%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 font-mono">
                        {calculation.yearData.filter(d => d.year > 0).map(row => (
                          <tr key={row.year} className="hover:bg-bg/50">
                            <td className="py-2 px-3 font-sans font-bold text-ink">Година {row.year}</td>
                            <td className="py-2 px-3 text-emerald-400">+{row.growthRate.toFixed(1)}%</td>
                            <td className="py-2 px-3 text-indigo-400 font-bold">${row.eps.toFixed(2)}</td>
                            <td className="py-2 px-3 text-ink">${row.futurePrice.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right text-ink-muted">${row.discountedPrice.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
