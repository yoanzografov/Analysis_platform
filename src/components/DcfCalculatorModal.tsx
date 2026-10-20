import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Stock } from '../types';
import { 
  Calculator, X, Search, RotateCcw, TrendingUp, TrendingDown, Check, 
  ExternalLink, Info, ShieldCheck, ArrowRight, Save, Layers, BarChart3, 
  Table as TableIcon, RefreshCw, AlertTriangle, HelpCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stocks?: Stock[];
  initialStock?: Stock | null;
  onUpdateFairPrice?: (ticker: string, fairPrice: number) => void;
  currentUser?: any;
  onSwitchToPeModel?: () => void;
}

interface InfoTooltipProps {
  title: string;
  textBg: string;
  textEn?: string;
  align?: 'left' | 'right' | 'center';
}

function DcfInfoBadge({ title, textBg, textEn, align = 'left' }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const badgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (badgeRef.current && !badgeRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const posClass =
    align === 'right'
      ? 'right-0'
      : align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'left-0';

  return (
    <span
      ref={badgeRef}
      className="relative inline-flex items-center ml-1 align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(prev => !prev);
        }}
        aria-label={`Информация за ${title}`}
        className="w-4 h-4 rounded-full bg-stone-800/90 hover:bg-blue-500/25 border border-stone-700 hover:border-blue-400/60 text-stone-400 hover:text-blue-300 inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
      >
        <svg className="h-[9px] w-[9px]" viewBox="0 0 4 16" fill="currentColor" aria-hidden="true">
          <path d="M0 6h4v10h-4v-10zm2-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
        </svg>
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-full mb-2 ${posClass} z-[300] w-64 sm:w-72 rounded-xl bg-stone-900/98 backdrop-blur-md border border-stone-700/90 shadow-2xl p-3 text-left font-normal normal-case tracking-normal animate-in fade-in zoom-in-95 duration-100 pointer-events-auto`}
        >
          <div className="text-[11px] font-bold text-white border-b border-stone-800 pb-1 mb-1.5 flex items-center justify-between gap-2">
            <span>{title}</span>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
              Info
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-stone-200">
            {textBg}
          </p>
          {textEn && (
            <p className="text-[10px] leading-relaxed text-stone-400 mt-1.5 pt-1.5 border-t border-stone-800/80 italic">
              {textEn}
            </p>
          )}
        </div>
      )}
    </span>
  );
}

export default function DcfCalculatorModal({
  isOpen,
  onClose,
  stocks = [],
  initialStock = null,
  onUpdateFairPrice,
  currentUser,
  onSwitchToPeModel
}: Props) {
  // Selected stock
  const [selectedStock, setSelectedStock] = useState<Stock | null>(initialStock);
  const [searchQuery, setSearchQuery] = useState(initialStock?.ticker || '');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Active view toggle between Chart + Sensitivity vs Trajectory Table
  const [activeTab, setActiveTab] = useState<'chart_matrix' | 'table'>('chart_matrix');

  // Input Assumptions (1:1 with StockAnalysis DCF Calculator defaults)
  // https://stockanalysis.com/tools/dcf-calculator/
  const [price, setPrice] = useState<number>(() => initialStock?.currentPrice || 100.0);
  const [fcfPerShare, setFcfPerShare] = useState<number>(() => {
    if (initialStock?.eps && initialStock.eps > 0) {
      return parseFloat((initialStock.eps * 0.95).toFixed(2));
    }
    return 5.5;
  });
  const [growthRate, setGrowthRate] = useState<number>(10.0); // Years 1-5
  const [growthRateLate, setGrowthRateLate] = useState<number>(5.0); // Years 6-10
  const [terminalGrowth, setTerminalGrowth] = useState<number>(2.5); // Terminal growth
  const [discountRate, setDiscountRate] = useState<number>(9.0); // Discount rate / WACC
  const [marginOfSafety, setMarginOfSafety] = useState<number>(0.0); // Margin of safety %

  // Changes state & feedback (matching FairValueCalculatorModal)
  const [hasChanged, setHasChanged] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcFeedback, setRecalcFeedback] = useState<string | null>(null);
  const [flashHeroHighlight, setFlashHeroHighlight] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [hoveredYearIndex, setHoveredYearIndex] = useState<number | null>(null);
  const chartSvgRef = useRef<SVGSVGElement>(null);

  const markInputChange = () => {
    setHasChanged(true);
    setHasPendingChanges(true);
    setRecalcFeedback(null);
  };

  // Sync if initialStock changes
  useEffect(() => {
    if (initialStock) {
      handleSelectStock(initialStock);
    }
  }, [initialStock]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setFcfPerShare(parseFloat((stk.eps * 0.95).toFixed(2)));
    } else if (stk.currentPrice > 0 && stk.peRatio && stk.peRatio > 0) {
      const impliedEps = stk.currentPrice / stk.peRatio;
      setFcfPerShare(parseFloat((impliedEps * 0.9).toFixed(2)));
    } else {
      setFcfPerShare(5.5);
    }
    setGrowthRate(10.0);
    setGrowthRateLate(5.0);
    setTerminalGrowth(2.5);
    setDiscountRate(9.0);
    setMarginOfSafety(0.0);
    setHasChanged(false);
    setHasPendingChanges(false);
    setRecalcFeedback(null);
  };

  const handleResetToBenchmark = () => {
    setSelectedStock(null);
    setSearchQuery('');
    setPrice(100.0);
    setFcfPerShare(5.5);
    setGrowthRate(10.0);
    setGrowthRateLate(5.0);
    setTerminalGrowth(2.5);
    setDiscountRate(9.0);
    setMarginOfSafety(0.0);
    setHasChanged(false);
    setHasPendingChanges(false);
    setRecalcFeedback(null);
  };

  // Math Calculations (1:1 with StockAnalysis DCF Calculator Model)
  const dcf = useMemo(() => {
    const safePrice = Math.max(0.01, price);
    const safeFcf = Math.max(0.01, fcfPerShare);
    const safeG1 = growthRate / 100;
    const safeG2 = growthRateLate / 100;
    const safeGTerm = terminalGrowth / 100;
    const safeR = Math.max(0.005, discountRate / 100);
    const safeMoS = Math.min(90, Math.max(0, marginOfSafety)) / 100;

    // Check validity: Discount rate must be strictly greater than terminal growth
    const isRateValid = safeR > safeGTerm;

    // 10-Year Projections
    const yearlyCashFlows: { year: number; projectedFcf: number; pv: number; growthRatePct: number }[] = [];
    let currentFcf = safeFcf;

    for (let yr = 1; yr <= 10; yr++) {
      const currentRate = yr <= 5 ? safeG1 : safeG2;
      currentFcf = currentFcf * (1 + currentRate);
      const discountFactor = Math.pow(1 + safeR, yr);
      const pv = currentFcf / discountFactor;
      yearlyCashFlows.push({
        year: yr,
        projectedFcf: parseFloat(currentFcf.toFixed(2)),
        pv: parseFloat(pv.toFixed(2)),
        growthRatePct: yr <= 5 ? growthRate : growthRateLate
      });
    }

    const fcfYear10 = yearlyCashFlows[9].projectedFcf;
    const valueYears1To10 = yearlyCashFlows.reduce((sum, item) => sum + item.pv, 0);

    // Terminal Value (Gordon Growth Model at Year 10)
    let terminalValueYear10 = 0;
    let terminalValueToday = 0;

    if (isRateValid) {
      terminalValueYear10 = (fcfYear10 * (1 + safeGTerm)) / (safeR - safeGTerm);
      terminalValueToday = terminalValueYear10 / Math.pow(1 + safeR, 10);
    }

    // Raw Fair Value before Margin of Safety
    const rawFairValue = valueYears1To10 + terminalValueToday;

    // Terminal Share of Value
    const terminalSharePct = rawFairValue > 0 ? (terminalValueToday / rawFairValue) * 100 : 0;

    // Fair Value after Margin of Safety
    const finalFairValue = rawFairValue * (1 - safeMoS);

    // Upside / Downside compared to current price
    const differencePct = safePrice > 0 ? ((finalFairValue - safePrice) / safePrice) * 100 : 0;
    const isUndervalued = finalFairValue >= safePrice;

    // Sensitivity Matrix Grid
    // 5 discount rates: r-2%, r-1%, r, r+1%, r+2%
    // 5 terminal growths: g-1.0%, g-0.5%, g, g+0.5%, g+1.0%
    const sensitivityDiscountRates = [
      Math.max(1, discountRate - 2),
      Math.max(1, discountRate - 1),
      discountRate,
      discountRate + 1,
      discountRate + 2
    ];

    const sensitivityTerminalRates = [
      terminalGrowth - 1.0,
      terminalGrowth - 0.5,
      terminalGrowth,
      terminalGrowth + 0.5,
      terminalGrowth + 1.0
    ];

    const sensitivityGrid = sensitivityDiscountRates.map(rRate => {
      const rDecimal = rRate / 100;
      // PV 1-10 for this discount rate
      let pv10 = 0;
      yearlyCashFlows.forEach((item, idx) => {
        pv10 += item.projectedFcf / Math.pow(1 + rDecimal, idx + 1);
      });

      const cols = sensitivityTerminalRates.map(gRate => {
        const gDecimal = gRate / 100;
        if (rDecimal <= gDecimal) {
          return { fairValue: 0, isValid: false, diffPct: 0 };
        }
        const tv10 = (fcfYear10 * (1 + gDecimal)) / (rDecimal - gDecimal);
        const tvToday = tv10 / Math.pow(1 + rDecimal, 10);
        const cellRawFv = pv10 + tvToday;
        const cellFv = cellRawFv * (1 - safeMoS);
        const cellDiff = safePrice > 0 ? ((cellFv - safePrice) / safePrice) * 100 : 0;
        return {
          fairValue: parseFloat(cellFv.toFixed(2)),
          isValid: true,
          diffPct: cellDiff,
          isAbovePrice: cellFv >= safePrice
        };
      });

      return {
        discountRatePct: rRate,
        cols
      };
    });

    return {
      safePrice,
      safeFcf,
      isRateValid,
      yearlyCashFlows,
      fcfYear10: parseFloat(fcfYear10.toFixed(2)),
      valueYears1To10: parseFloat(valueYears1To10.toFixed(2)),
      terminalValueToday: parseFloat(terminalValueToday.toFixed(2)),
      terminalSharePct: parseFloat(terminalSharePct.toFixed(1)),
      rawFairValue: parseFloat(rawFairValue.toFixed(2)),
      finalFairValue: parseFloat(finalFairValue.toFixed(2)),
      differencePct: parseFloat(differencePct.toFixed(1)),
      isUndervalued,
      sensitivityDiscountRates,
      sensitivityTerminalRates,
      sensitivityGrid
    };
  }, [price, fcfPerShare, growthRate, growthRateLate, terminalGrowth, discountRate, marginOfSafety]);

  // Helper to handle mouse move over SVG chart to track nearest year
  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartSvgRef.current) return;
    const rect = chartSvgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const padLeft = 60;
    const padRight = 30;
    const plotWidth = rect.width * ((760 - padLeft - padRight) / 760);
    const plotLeft = rect.width * (padLeft / 760);
    const relX = clientX - plotLeft;
    const numPts = dcf.yearlyCashFlows.length;
    if (relX >= 0 && relX <= plotWidth && numPts > 0) {
      const idx = Math.min(numPts - 1, Math.max(0, Math.floor((relX / plotWidth) * numPts)));
      setHoveredYearIndex(idx);
    } else {
      setHoveredYearIndex(null);
    }
  };

  // Stepper handlers
  const stepPrice = (delta: number) => {
    setPrice(prev => Math.max(0, parseFloat((prev + delta).toFixed(2))));
    markInputChange();
  };

  const stepFcf = (delta: number) => {
    setFcfPerShare(prev => Math.max(0.01, parseFloat((prev + delta).toFixed(2))));
    markInputChange();
  };

  const stepGrowth1 = (delta: number) => {
    setGrowthRate(prev => Math.min(100, Math.max(-50, parseFloat((prev + delta).toFixed(1)))));
    markInputChange();
  };

  const stepGrowth2 = (delta: number) => {
    setGrowthRateLate(prev => Math.min(100, Math.max(-50, parseFloat((prev + delta).toFixed(1)))));
    markInputChange();
  };

  const stepTerminal = (delta: number) => {
    setTerminalGrowth(prev => Math.min(10, Math.max(-5, parseFloat((prev + delta).toFixed(1)))));
    markInputChange();
  };

  const stepDiscount = (delta: number) => {
    setDiscountRate(prev => Math.min(50, Math.max(1, parseFloat((prev + delta).toFixed(1)))));
    markInputChange();
  };

  const stepMoS = (delta: number) => {
    setMarginOfSafety(prev => Math.min(90, Math.max(0, Math.round(prev + delta))));
    markInputChange();
  };

  // Recalculate button handler (matching Fair Value Calculator)
  const handleRecalculate = () => {
    setIsRecalculating(true);
    setHasPendingChanges(false);
    setFlashHeroHighlight(true);
    setRecalcFeedback(`Преизчислено: Fair Value $${dcf.finalFairValue.toFixed(2)}`);

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

  // Save to stock table handler
  const handleSaveToTable = () => {
    if (!selectedStock) return;
    if (onUpdateFairPrice) {
      onUpdateFairPrice(selectedStock.ticker, dcf.finalFairValue);
      setSavedSuccessMsg(`Справедливата цена на ${selectedStock.ticker} ($${dcf.finalFairValue.toFixed(2)}) беше запазена успешно!`);
      setTimeout(() => setSavedSuccessMsg(null), 3500);
    }
  };

  if (!isOpen) return null;

  // Max value for gauge bar scale
  const gaugeMax = Math.max(dcf.rawFairValue * 1.35, dcf.safePrice * 1.35, 150);
  const buyZoneWidth = Math.min(95, Math.max(5, (dcf.finalFairValue / gaugeMax) * 100));
  const rawFvWidth = Math.min(95, Math.max(buyZoneWidth, (dcf.rawFairValue / gaugeMax) * 100));
  const mosWidth = Math.max(0, rawFvWidth - buyZoneWidth);
  const needleLeft = Math.min(98, Math.max(2, (dcf.safePrice / gaugeMax) * 100));

  // Max FCF for chart bar height
  const maxChartFcf = Math.max(...dcf.yearlyCashFlows.map(y => y.projectedFcf), 1);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="relative w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] my-auto text-stone-100">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between gap-3 bg-stone-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  DCF Calculator
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    StockAnalysis 1:1 Model
                  </span>
                </h1>
              </div>
              <p className="text-xs text-stone-400">
                Оценка на акции чрез 10-годишен модел на дисконтираните свободни парични потоци (DCF)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model switcher tabs */}
            {onSwitchToPeModel && (
              <button
                onClick={onSwitchToPeModel}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-colors cursor-pointer"
                title="Отвори Fair Value Calculator (P/E Multiple)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>P/E Multiple Model</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                window.open(`${window.location.origin}${window.location.pathname}#dcf-calculator`, '_blank');
              }}
              className="px-2.5 py-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              title="Отвори в нов прозорец"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Нов прозорец</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="Затвори"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stock Search & Pre-fill Banner */}
        <div className="px-4 sm:px-5 py-3 border-b border-stone-800 bg-stone-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Търсене на акция от портфолиото за автоматично попълване..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={handleResetToBenchmark}
                  className="absolute right-2.5 text-stone-500 hover:text-stone-300 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {isSearchOpen && filteredStocks.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-stone-950 border border-stone-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                {filteredStocks.map(stk => (
                  <button
                    key={stk.ticker}
                    onClick={() => handleSelectStock(stk)}
                    className="w-full px-3 py-2 text-left hover:bg-stone-800/80 flex items-center justify-between text-xs transition-colors cursor-pointer border-b border-stone-900 last:border-0"
                  >
                    <div>
                      <span className="font-bold text-white mr-2">{stk.ticker}</span>
                      <span className="text-stone-400">{stk.companyName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-stone-200">${stk.currentPrice.toFixed(2)}</span>
                      {stk.eps && (
                        <span className="text-[10px] text-stone-500 block">EPS: ${stk.eps.toFixed(2)}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            {hasChanged && (
              <button
                onClick={handleResetToBenchmark}
                className="px-2.5 py-1.5 text-xs font-bold text-stone-400 hover:text-stone-200 bg-stone-800/50 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Върни началните стойности (1:1 с StockAnalysis)"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Нулирай</span>
              </button>
            )}

            {selectedStock && (
              <button
                onClick={handleSaveToTable}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title={`Запази Fair Value ($${dcf.finalFairValue.toFixed(2)}) за ${selectedStock.ticker} в таблицата`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Запази за {selectedStock.ticker}</span>
              </button>
            )}
          </div>
        </div>

        {/* Success toast message */}
        {savedSuccessMsg && (
          <div className="px-5 py-2 bg-emerald-950/80 border-b border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT COLUMN: Assumptions Card (1:1 with StockAnalysis layout) */}
          <div className="lg:col-span-4 bg-stone-950/70 border border-stone-800 rounded-xl p-4 sm:p-5 flex flex-col gap-4 self-start">
            <div className="flex items-center justify-between border-b border-stone-800/60 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-200">
                Assumptions
              </h2>
              <span className="text-[10px] text-stone-500">
                Параметри на модела
              </span>
            </div>

            {/* Current Stock Price */}
            <div>
              <label className="text-xs font-semibold text-stone-300 flex items-center justify-between mb-1">
                <span className="inline-flex items-center">
                  Current Stock Price
                  <DcfInfoBadge
                    title="Current Stock Price (Текуща цена)"
                    textBg="Пазарната цена на акцията, спрямо която се сравнява изчислената справедлива стойност (Fair Value). Започва с примерна стойност — потърсете компания горе за автоматично попълване."
                    textEn="The share price the fair value is compared against. Starts from an example value. Search for a stock above to pre-fill it."
                  />
                </span>
                <span className="text-[10px] text-stone-500">Текуща цена</span>
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-xs font-semibold text-stone-500">$</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={price}
                    onChange={(e) => {
                      setPrice(parseFloat(e.target.value) || 0);
                      markInputChange();
                    }}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => stepPrice(1)}
                    className="w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    onClick={() => stepPrice(-1)}
                    className="w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    −
                  </button>
                </div>
              </div>
            </div>

            {/* Free Cash Flow per Share */}
            <div>
              <label className="text-xs font-semibold text-stone-300 flex items-center justify-between mb-1">
                <span className="inline-flex items-center">
                  Free Cash Flow per Share
                  <DcfInfoBadge
                    title="Free Cash Flow per Share (FCF на акция)"
                    textBg="Свободният паричен поток за последните 12 месеца, разделен на броя акции в обращение. Започва с примерна стойност — потърсете компания горе за автоматично попълване."
                    textEn="Free cash flow over the last 12 months divided by shares outstanding. Starts from an example value. Search for a stock above to pre-fill it."
                  />
                </span>
                <span className="text-[10px] text-stone-500">FCF на акция</span>
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-xs font-semibold text-stone-500">$</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.01"
                    value={fcfPerShare}
                    onChange={(e) => {
                      setFcfPerShare(parseFloat(e.target.value) || 0);
                      markInputChange();
                    }}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => stepFcf(0.5)}
                    className="w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    onClick={() => stepFcf(-0.5)}
                    className="w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    −
                  </button>
                </div>
              </div>
            </div>

            {/* Growth Rate (Years 1–5) */}
            <div>
              <label className="text-xs font-semibold text-stone-300 flex items-center justify-between mb-1">
                <span className="inline-flex items-center">
                  Growth Rate (Years 1–5)
                  <DcfInfoBadge
                    title="Growth Rate (Years 1–5)"
                    textBg="Очакваният годишен темп на растеж на свободния паричен поток през първите 5 години. Започва с примерна стойност — потърсете компания горе за автоматично попълване."
                    textEn="Expected annual growth in free cash flow for the first five years. Starts from an example value. Search for a stock above to pre-fill it."
                  />
                </span>
                <span className="text-[10px] text-stone-500">Ръст год. 1–5</span>
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="1"
                    min="-50"
                    max="100"
                    value={growthRate}
                    onChange={(e) => {
                      setGrowthRate(parseFloat(e.target.value) || 0);
                      markInputChange();
                    }}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-3 pr-6 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-2.5 top-2 text-xs font-semibold text-stone-500">%</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => stepGrowth1(1)}
                    className="w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    onClick={() => stepGrowth1(-1)}
                    className="w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    −
                  </button>
                </div>
              </div>
            </div>

            {/* Growth Rate (Years 6–10) */}
            <div>
              <label className="text-xs font-semibold text-stone-300 flex items-center justify-between mb-1">
                <span className="inline-flex items-center">
                  Growth Rate (Years 6–10)
                  <DcfInfoBadge
                    title="Growth Rate (Years 6–10)"
                    textBg="Очакваният годишен темп на растеж за години 6 до 10 — обикновено по-нисък с узряването на бизнеса. По подразбиране започва на половината от ръста за години 1–5."
                    textEn="Expected annual growth for years six to ten, usually lower as the business matures. Starts at half of the years 1–5 growth rate."
                  />
                </span>
                <span className="text-[10px] text-stone-500">Ръст год. 6–10</span>
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="1"
                    min="-50"
                    max="100"
                    value={growthRateLate}
                    onChange={(e) => {
                      setGrowthRateLate(parseFloat(e.target.value) || 0);
                      markInputChange();
                    }}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-3 pr-6 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-2.5 top-2 text-xs font-semibold text-stone-500">%</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => stepGrowth2(1)}
                    className="w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    onClick={() => stepGrowth2(-1)}
                    className="w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    −
                  </button>
                </div>
              </div>
            </div>

            {/* Terminal Growth Rate */}
            <div>
              <label className="text-xs font-semibold text-stone-300 flex items-center justify-between mb-1">
                <span className="inline-flex items-center">
                  Terminal Growth Rate
                  <DcfInfoBadge
                    title="Terminal Growth Rate (Терминален ръст)"
                    textBg="Темпът на растеж, който се приема за постоянен завинаги след 10-ата година. Не трябва да надвишава дългосрочния икономически растеж (БВП), затова 2–3% е типична стойност."
                    textEn="Growth assumed forever after year ten. It should not exceed long-run economic growth, so 2–3% is typical."
                  />
                </span>
                <span className="text-[10px] text-stone-500">Терминален ръст</span>
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.5"
                    min="-5"
                    max="10"
                    value={terminalGrowth}
                    onChange={(e) => {
                      setTerminalGrowth(parseFloat(e.target.value) || 0);
                      markInputChange();
                    }}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-3 pr-6 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-2.5 top-2 text-xs font-semibold text-stone-500">%</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => stepTerminal(0.5)}
                    className="w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    onClick={() => stepTerminal(-0.5)}
                    className="w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    −
                  </button>
                </div>
              </div>
            </div>

            {/* Discount Rate */}
            <div>
              <label className="text-xs font-semibold text-stone-300 flex items-center justify-between mb-1">
                <span className="inline-flex items-center">
                  Discount Rate
                  <DcfInfoBadge
                    title="Discount Rate (Дисконтов % / WACC)"
                    textBg="Годишната възвръщаемост, която изисквате, или среднопретеглената цена на капитала на компанията (WACC). По-високият процент намалява справедливата стойност."
                    textEn="The annual return you require, or the company's weighted average cost of capital. Higher rates lower the fair value."
                  />
                </span>
                <span className="text-[10px] text-stone-500">Дисконтов % (WACC)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="50"
                    value={discountRate}
                    onChange={(e) => {
                      setDiscountRate(parseFloat(e.target.value) || 0);
                      markInputChange();
                    }}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-3 pr-6 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-2.5 top-2 text-xs font-semibold text-stone-500">%</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => stepDiscount(0.5)}
                    className="w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    onClick={() => stepDiscount(-0.5)}
                    className="w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    −
                  </button>
                </div>
              </div>
            </div>

            {/* Margin of Safety */}
            <div>
              <label className="text-xs font-semibold text-stone-300 flex items-center justify-between mb-1">
                <span className="inline-flex items-center">
                  Margin of Safety
                  <DcfInfoBadge
                    title="Margin of Safety (Марж на сигурност)"
                    textBg="Намалява справедливата стойност с този процент, за да добави буфер за сигурност при евентуални грешки в допусканията."
                    textEn="Reduce the fair value by this percentage to add room for errors in the assumptions."
                  />
                </span>
                <span className="text-[10px] text-stone-500">Марж на сигурност</span>
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="5"
                    min="0"
                    max="90"
                    value={marginOfSafety}
                    onChange={(e) => {
                      setMarginOfSafety(parseFloat(e.target.value) || 0);
                      markInputChange();
                    }}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-3 pr-6 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-2.5 top-2 text-xs font-semibold text-stone-500">%</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => stepMoS(5)}
                    className="w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    onClick={() => stepMoS(-5)}
                    className="w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    −
                  </button>
                </div>
              </div>
            </div>

            {!dcf.isRateValid && (
              <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Внимание:</strong> Discount Rate ({discountRate}%) трябва да е строго по-висок от Terminal Growth ({terminalGrowth}%).
                </span>
              </div>
            )}

            {/* ACTION BUTTONS: Recalculate + Save (Matching Fair Value Calculator) */}
            <div className="pt-3 space-y-2 border-t border-stone-800/80">
              {/* 1. БУТОН ПРЕИЗЧИСЛИ (Recalculate Button) */}
              <button
                type="button"
                onClick={handleRecalculate}
                className={`w-full py-2.5 px-3 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] ${
                  hasPendingChanges
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/30 ring-2 ring-amber-400/80 animate-pulse'
                    : 'bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/40 hover:border-blue-500'
                }`}
                title="Преизчисли всички резултати и дисконтираните парични потоци с новите входни данни"
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
                <div className="text-[11px] text-emerald-400 font-bold text-center py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 animate-in fade-in">
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
                    title={`Запази DCF Fair Value от $${dcf.finalFairValue.toFixed(2)} за ${selectedStock.ticker} в Интерактивната Таблица`}
                  >
                    <Save className="w-4 h-4" />
                    <span>Запази за {selectedStock.ticker} (${dcf.finalFairValue.toFixed(2)})</span>
                  </button>
                </div>
              )}

              {!selectedStock && (
                <p className="text-[10px] text-stone-500 text-center leading-tight pt-1">
                  💡 Изберете компания от търсачката по-горе, за да запазите оценката в таблицата.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Results, Hero Card, Chart & Sensitivity Matrix */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            
            {/* 4 Summary Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
                <span className="text-[10px] text-stone-400 font-medium inline-flex items-center">
                  Value of Years 1–10
                  <DcfInfoBadge
                    title="Value of Years 1–10"
                    textBg="Сумата от свободните парични потоци за следващите 10 години, всеки дисконтиран към днешна дата."
                    textEn="The sum of the next ten years of free cash flow, each discounted to today."
                  />
                </span>
                <span className="text-base sm:text-lg font-bold text-white block mt-0.5">${dcf.valueYears1To10.toFixed(2)}</span>
                <span className="text-[9px] text-stone-500 block">Сума от 10-те год.</span>
              </div>
              <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
                <span className="text-[10px] text-stone-400 font-medium inline-flex items-center">
                  Terminal Value (Today)
                  <DcfInfoBadge
                    title="Terminal Value (Today)"
                    textBg="Стойността на всички парични потоци след 10-ата година, дисконтирана към днешна дата."
                    textEn="The value of all cash flow after year ten, discounted to today."
                    align="center"
                  />
                </span>
                <span className="text-base sm:text-lg font-bold text-white block mt-0.5">${dcf.terminalValueToday.toFixed(2)}</span>
                <span className="text-[9px] text-stone-500 block">Стойност след год. 10</span>
              </div>
              <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
                <span className="text-[10px] text-stone-400 font-medium inline-flex items-center">
                  Terminal Share of Value
                  <DcfInfoBadge
                    title="Terminal Share of Value"
                    textBg="Каква част от справедливата стойност зависи от годините след 10-годишната прогноза. Над 75% означава, че резултатът разчита силно на терминалните допускания."
                    textEn="How much of the fair value depends on the years beyond the forecast. Above 75% means the result leans heavily on the terminal assumptions."
                    align="right"
                  />
                </span>
                <span className="text-base sm:text-lg font-bold text-white block mt-0.5">{dcf.terminalSharePct.toFixed(1)}%</span>
                <span className="text-[9px] text-stone-500 block">Дял от крайната цена</span>
              </div>
              <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
                <span className="text-[10px] text-stone-400 font-medium inline-flex items-center">
                  FCF per Share in Year 10
                  <DcfInfoBadge
                    title="FCF per Share in Year 10"
                    textBg="Прогнозираният свободен паричен поток на акция в 10-ата година след натрупване с двата темпа на растеж."
                    textEn="Projected free cash flow per share in year 10 after compounding at your two growth rates."
                    align="right"
                  />
                </span>
                <span className="text-base sm:text-lg font-bold text-white block mt-0.5">${dcf.fcfYear10.toFixed(2)}</span>
                <span className="text-[9px] text-stone-500 block">Паричен поток в год. 10</span>
              </div>
            </div>

            {/* HERO VALUATION CARD */}
            <div className={`bg-stone-950/80 border rounded-xl p-4 sm:p-5 flex flex-col gap-4 transition-all duration-300 ${
              flashHeroHighlight
                ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20 bg-blue-950/20'
                : 'border-stone-800'
            }`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-stone-400 font-medium">
                    {marginOfSafety > 0 ? `Fair Value With ${marginOfSafety}% Margin of Safety` : 'Fair Value (Discounted Cash Flow)'}
                  </div>
                  <div className="mt-1 flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">
                      ${dcf.finalFairValue.toFixed(2)}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                      dcf.isUndervalued
                        ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-950/90 text-rose-300 border border-rose-500/40'
                    }`}>
                      {dcf.isUndervalued ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {dcf.differencePct >= 0 ? `+${dcf.differencePct}%` : `${dcf.differencePct}%`}{' '}
                      {dcf.isUndervalued ? 'upside (подценена)' : 'downside (надценена)'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-400 block">Current Price</span>
                  <span className="text-base font-bold text-white">${dcf.safePrice.toFixed(2)}</span>
                  {marginOfSafety > 0 && (
                    <span className="text-[10px] text-amber-400 inline-flex items-center justify-end mt-0.5">
                      Fair Value (Без марж): ${dcf.rawFairValue.toFixed(2)}
                      <DcfInfoBadge
                        title="Fair Value (Без марж)"
                        textBg={`Справедливата стойност по DCF модела преди прилагането на вашия ${marginOfSafety}% марж на сигурност.`}
                        textEn={`The Discounted Cash Flow fair value before your ${marginOfSafety}% margin of safety is applied.`}
                        align="right"
                      />
                    </span>
                  )}
                </div>
              </div>

              {/* VISUAL NEEDLE GAUGE BAR (1:1 with StockAnalysis scale) */}
              <div className="pt-2">
                {/* Zones label row */}
                <div className="relative h-4 text-[10px] font-semibold text-stone-400">
                  <div
                    className="absolute text-center whitespace-nowrap text-emerald-400"
                    style={{ left: 0, width: `${buyZoneWidth}%` }}
                  >
                    Buy Zone
                  </div>
                  {marginOfSafety > 0 && (
                    <div
                      className="absolute text-center whitespace-nowrap text-amber-400"
                      style={{ left: `${buyZoneWidth}%`, width: `${mosWidth}%` }}
                    >
                      Margin of Safety
                    </div>
                  )}
                  <div
                    className="absolute text-center whitespace-nowrap text-rose-400"
                    style={{ left: `${rawFvWidth}%`, right: 0 }}
                  >
                    Overvalued
                  </div>
                </div>

                {/* Progress bar scale */}
                <div className="relative h-3 w-full bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                  {/* Buy Zone (Green) */}
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-500/80 transition-all duration-300"
                    style={{ width: `${buyZoneWidth}%` }}
                  />
                  {/* Margin of Safety (Amber) */}
                  {marginOfSafety > 0 && (
                    <div
                      className="absolute inset-y-0 bg-amber-400/80 transition-all duration-300"
                      style={{ left: `${buyZoneWidth}%`, width: `${mosWidth}%` }}
                    />
                  )}
                  {/* Overvalued Zone (Red) */}
                  <div
                    className="absolute inset-y-0 right-0 bg-rose-500/80 transition-all duration-300"
                    style={{ left: `${rawFvWidth}%` }}
                  />
                </div>

                {/* Needle indicator for Current Price */}
                <div className="relative h-6 mt-1">
                  <div
                    className="absolute -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                    style={{ left: `${needleLeft}%` }}
                  >
                    <div className="w-0 h-0 border-x-4 border-x-transparent border-b-[6px] border-b-white" />
                    <span className="text-[10px] font-bold text-white whitespace-nowrap">
                      ${dcf.safePrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TAB SELECTOR: Chart vs Trajectory Table */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('chart_matrix')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'chart_matrix'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-stone-800/60 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Графика & Чувствителност</span>
                </button>
                <button
                  onClick={() => setActiveTab('table')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'table'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-stone-800/60 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Таблица с парични потоци</span>
                </button>
              </div>

              <span className="text-[10px] text-stone-500 hidden sm:inline">
                Прогнози за 10 години
              </span>
            </div>

            {activeTab === 'chart_matrix' ? (
              <>
                {/* PROJECTED FREE CASH FLOW PER SHARE BAR CHART */}
                <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Projected free cash flow per share</span>
                        <DcfInfoBadge
                          title="Projected free cash flow per share"
                          textBg="• „Прогнозиран FCF“ увеличава свободния паричен поток на акция с вашите два темпа на растеж за 10 години. • „Дисконтиран FCF (Днес)“ е същият паричен поток след дисконтиране с дисконтовия процент — колко струва всяка година в днешни пари. • Справедливата стойност е сумата от дисконтираните стълбове плюс дисконтираната терминална стойност."
                          textEn={'"Projected FCF" grows free cash flow per share at your two growth rates for ten years. "Discounted to Today" is the same cash flow after discounting at the discount rate. The fair value is the sum of the discounted bars plus the discounted terminal value.'}
                        />
                        <span className="text-[10px] text-stone-400 font-normal">
                          (Прогнозирани парични потоци за 10 години)
                        </span>
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1.5 text-blue-400">
                        <span className="w-2.5 h-2.5 rounded-xs bg-blue-500" />
                        Прогнозиран FCF
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                        Дисконтиран FCF (Днес)
                      </span>
                    </div>
                  </div>

                  {/* High-Fidelity Interactive SVG Bar Chart (1:1 with StockAnalysis) */}
                  <div className="w-full h-72 sm:h-80 relative select-none">
                    {(() => {
                      const pts = dcf.yearlyCashFlows;
                      const numPts = pts.length;
                      const maxFcfRaw = Math.max(...pts.map(p => Math.max(p.projectedFcf, p.pv)), 1);
                      const maxY = maxFcfRaw * 1.18;

                      const padLeft = 60;
                      const padRight = 30;
                      const padTop = 25;
                      const padBottom = 45;
                      const plotWidth = 760 - padLeft - padRight; // 670
                      const plotHeight = 300 - padTop - padBottom; // 230

                      const getSlotX = (idx: number) => padLeft + (idx / numPts) * plotWidth;
                      const getSlotCenterX = (idx: number) => padLeft + ((idx + 0.5) / numPts) * plotWidth;
                      const slotWidth = plotWidth / numPts;
                      const barWidth = Math.min(22, Math.max(12, slotWidth * 0.36));
                      const barGap = 4;

                      const getY = (val: number) => padTop + plotHeight - (Math.max(0, val) / maxY) * plotHeight;

                      // 5 Y-ticks (0%, 25%, 50%, 75%, 100%)
                      const yTicks = [0, 0.25, 0.5, 0.75, 1.0];

                      return (
                        <svg
                          ref={chartSvgRef}
                          viewBox="0 0 760 300"
                          className="w-full h-full overflow-visible"
                          onMouseMove={handleChartMouseMove}
                          onMouseLeave={() => setHoveredYearIndex(null)}
                        >
                          {/* Horizontal grid lines & Y-axis labels */}
                          {yTicks.map((ratio, idx) => {
                            const yPos = padTop + plotHeight * (1 - ratio);
                            const tickVal = maxY * ratio;
                            return (
                              <g key={idx}>
                                <line
                                  x1={padLeft}
                                  y1={yPos}
                                  x2={padLeft + plotWidth}
                                  y2={yPos}
                                  stroke="currentColor"
                                  className="text-stone-800"
                                  strokeDasharray="4 4"
                                />
                                <text
                                  x={padLeft - 10}
                                  y={yPos + 4}
                                  textAnchor="end"
                                  className="text-[11px] font-mono font-medium fill-stone-400"
                                >
                                  ${tickVal.toFixed(2)}
                                </text>
                              </g>
                            );
                          })}

                          {/* Hover Background Column Band */}
                          {hoveredYearIndex !== null && (
                            <rect
                              x={getSlotX(hoveredYearIndex) + 2}
                              y={padTop}
                              width={slotWidth - 4}
                              height={plotHeight}
                              fill="rgba(59, 130, 246, 0.08)"
                              rx="6"
                            />
                          )}

                          {/* Dual Column Bars for each Year */}
                          {pts.map((p, idx) => {
                            const cx = getSlotCenterX(idx);
                            const isHovered = hoveredYearIndex === idx;

                            // Bar 1: Projected FCF (Blue)
                            const projBarX = cx - barWidth - barGap / 2;
                            const projBarY = getY(p.projectedFcf);
                            const projBarHeight = Math.max(3, (padTop + plotHeight) - projBarY);

                            // Bar 2: Discounted FCF / Present Value (Green)
                            const pvBarX = cx + barGap / 2;
                            const pvBarY = getY(p.pv);
                            const pvBarHeight = Math.max(3, (padTop + plotHeight) - pvBarY);

                            return (
                              <g key={p.year}>
                                {/* Projected FCF Bar */}
                                <rect
                                  x={projBarX}
                                  y={projBarY}
                                  width={barWidth}
                                  height={projBarHeight}
                                  rx="3"
                                  ry="3"
                                  fill={isHovered ? "#60a5fa" : "#3b82f6"}
                                  fillOpacity={isHovered ? 1.0 : 0.85}
                                  className="transition-colors duration-150 cursor-pointer"
                                />

                                {/* Discounted FCF Bar */}
                                <rect
                                  x={pvBarX}
                                  y={pvBarY}
                                  width={barWidth}
                                  height={pvBarHeight}
                                  rx="3"
                                  ry="3"
                                  fill={isHovered ? "#34d399" : "#10b981"}
                                  fillOpacity={isHovered ? 1.0 : 0.85}
                                  className="transition-colors duration-150 cursor-pointer"
                                />

                                {/* Projected FCF Value on top of bar on hover */}
                                {isHovered && (
                                  <text
                                    x={projBarX + barWidth / 2}
                                    y={projBarY - 6}
                                    textAnchor="middle"
                                    fill="#93c5fa"
                                    className="text-[10px] font-mono font-bold"
                                  >
                                    ${p.projectedFcf.toFixed(1)}
                                  </text>
                                )}

                                {/* Discounted FCF Value on top of bar on hover */}
                                {isHovered && (
                                  <text
                                    x={pvBarX + barWidth / 2}
                                    y={pvBarY - 6}
                                    textAnchor="middle"
                                    fill="#6ee7b7"
                                    className="text-[10px] font-mono font-bold"
                                  >
                                    ${p.pv.toFixed(1)}
                                  </text>
                                )}

                                {/* X-axis Label */}
                                <text
                                  x={cx}
                                  y={padTop + plotHeight + 24}
                                  textAnchor="middle"
                                  className={`text-[11px] font-mono transition-colors ${
                                    isHovered ? 'fill-blue-400 font-bold' : 'fill-stone-400 font-medium'
                                  }`}
                                >
                                  Y{p.year}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      );
                    })()}

                    {/* StockAnalysis Style Interactive Floating Tooltip */}
                    {hoveredYearIndex !== null && (() => {
                      const item = dcf.yearlyCashFlows[hoveredYearIndex];
                      if (!item) return null;
                      const discountFactorPct = item.projectedFcf > 0 ? (item.pv / item.projectedFcf) * 100 : 0;
                      const cumulativePv = dcf.yearlyCashFlows
                        .slice(0, hoveredYearIndex + 1)
                        .reduce((sum, c) => sum + c.pv, 0);

                      return (
                        <div className="absolute top-2 right-4 bg-stone-900/95 backdrop-blur-md border border-stone-700 shadow-2xl rounded-xl p-3 text-xs space-y-1.5 pointer-events-none min-w-[220px] animate-in fade-in duration-100 z-10 border-blue-500/40">
                          <div className="font-bold text-white border-b border-stone-800 pb-1.5 flex justify-between items-center">
                            <span>Година {item.year}</span>
                            <span className="text-[10px] text-blue-400 font-mono font-bold">
                              +{item.growthRatePct.toFixed(1)}% ръст
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-blue-400 font-mono">
                            <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block" />
                              Прогнозиран FCF:
                            </span>
                            <span className="font-bold text-white">${item.projectedFcf.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-400 font-mono">
                            <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                              Дисконтиран (Днес):
                            </span>
                            <span className="font-bold text-white">${item.pv.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-stone-400 font-mono text-[11px] pt-1 border-t border-stone-800/80">
                            <span>Дисконтов коефициент:</span>
                            <span className="text-stone-300 font-bold">{discountFactorPct.toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center justify-between text-stone-400 font-mono text-[11px]">
                            <span>Натрупване до Год. {item.year}:</span>
                            <span className="text-emerald-300 font-bold">${cumulativePv.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* SENSITIVITY MATRIX (1:1 with StockAnalysis Discount Rate vs Terminal Growth) */}
                <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 sm:p-5 flex flex-col gap-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      Fair value by discount rate and terminal growth
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Зелените клетки са над текущата цена (${dcf.safePrice.toFixed(2)}), червените – под нея. Очертаната клетка в центъра отговаря на текущите ви допускания.
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-stone-800">
                    <table className="w-full text-center text-xs border-collapse">
                      <thead>
                        <tr className="bg-stone-900 border-b border-stone-800 text-[11px] text-stone-400">
                          <th className="px-2.5 py-2 text-left font-semibold">
                            Discount Rate ↓ / Terminal Growth →
                          </th>
                          {dcf.sensitivityTerminalRates.map(gRate => (
                            <th key={gRate} className="px-2.5 py-2 font-bold text-stone-300 whitespace-nowrap">
                              {gRate.toFixed(1)}%
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dcf.sensitivityGrid.map((row, rIdx) => (
                          <tr key={row.discountRatePct} className="border-b border-stone-800/60 last:border-0">
                            <td className="px-2.5 py-2 text-left font-bold text-stone-300 bg-stone-900/40">
                              {row.discountRatePct.toFixed(1)}%
                            </td>
                            {row.cols.map((col, cIdx) => {
                              const isCenterCurrent = rIdx === 2 && cIdx === 2;

                              if (!col.isValid) {
                                return (
                                  <td key={cIdx} className="px-2.5 py-2 text-stone-600 font-mono text-[11px]">
                                    —
                                  </td>
                                );
                              }

                              return (
                                <td
                                  key={cIdx}
                                  onClick={() => {
                                    setDiscountRate(row.discountRatePct);
                                    setTerminalGrowth(dcf.sensitivityTerminalRates[cIdx]);
                                    setHasChanged(true);
                                  }}
                                  className={`px-2.5 py-2 font-mono text-[11px] transition-all cursor-pointer ${
                                    col.isAbovePrice
                                      ? 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60'
                                      : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60'
                                  } ${
                                    isCenterCurrent
                                      ? 'ring-2 ring-blue-500 font-extrabold bg-blue-950/60 text-white shadow-xs'
                                      : ''
                                  }`}
                                  title={`Кликни за да приложиш: Discount ${row.discountRatePct}%, Terminal ${dcf.sensitivityTerminalRates[cIdx]}%`}
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
              </>
            ) : (
              /* CASH FLOW TRAJECTORY TABLE */
              <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 sm:p-5 overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-900 border-b border-stone-800 text-[11px] text-stone-400">
                      <th className="px-3 py-2 font-semibold">Година</th>
                      <th className="px-3 py-2 font-semibold text-right">Темп на растеж</th>
                      <th className="px-3 py-2 font-semibold text-right">Прогнозиран FCF на акция</th>
                      <th className="px-3 py-2 font-semibold text-right">Дисконтов коефициент</th>
                      <th className="px-3 py-2 font-semibold text-right">Дисконтирана стойност (Днес)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dcf.yearlyCashFlows.map(item => {
                      const discountFactor = Math.pow(1 + discountRate / 100, item.year);
                      return (
                        <tr key={item.year} className="border-b border-stone-800/60 last:border-0 hover:bg-stone-900/30">
                          <td className="px-3 py-2 font-bold text-white">Година {item.year}</td>
                          <td className="px-3 py-2 text-right text-stone-400">+{item.growthRatePct}%</td>
                          <td className="px-3 py-2 text-right font-bold text-blue-400">${item.projectedFcf.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right text-stone-400">{discountFactor.toFixed(3)}x</td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-400">${item.pv.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-stone-900/80 font-bold border-t border-stone-700">
                      <td colSpan={4} className="px-3 py-2.5 text-stone-300">
                        Общо дисконтирани парични потоци за 10-те години:
                      </td>
                      <td className="px-3 py-2.5 text-right text-emerald-300 text-sm">
                        ${dcf.valueYears1To10.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-stone-900/80 font-bold border-t border-stone-800/60">
                      <td colSpan={4} className="px-3 py-2 text-stone-300">
                        Дисконтирана терминална стойност след 10-ата година:
                      </td>
                      <td className="px-3 py-2 text-right text-emerald-300 text-sm">
                        ${dcf.terminalValueToday.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-stone-950 font-extrabold border-t-2 border-stone-700 text-white">
                      <td colSpan={4} className="px-3 py-3">
                        {marginOfSafety > 0 ? `Fair Value с ${marginOfSafety}% марж на сигурност:` : 'Крайна справедлива стойност (Fair Value):'}
                      </td>
                      <td className="px-3 py-3 text-right text-base text-white">
                        ${dcf.finalFairValue.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* HOW THE DISCOUNTED CASH FLOW METHOD WORKS EXPLANATION */}
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 sm:p-5 text-xs text-stone-300 leading-relaxed flex flex-col gap-2.5">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                Как работи моделът на дисконтираните парични потоци (DCF):
              </h4>
              <p className="text-stone-400">
                Моделът прогнозира свободния паричен поток на акция (FCF per Share) за следващите 10 години, използвайки два периода на растеж (години 1–5 и години 6–10), след което приема, че паричният поток продължава да расте вечно с постоянен терминален темп. Всеки бъдещ паричен поток се дисконтира към днешна дата с изисквания дисконтов процент (WACC), а тяхната сума формира справедливата стойност на акцията.
              </p>
              <div className="bg-stone-900 border border-stone-800 rounded-lg p-2.5 font-mono text-[11px] text-blue-300">
                Fair Value = Σ [ FCFₜ / (1 + r)ᵗ ] + Terminal Value / (1 + r)¹⁰
              </div>
            </div>

          </div>
        </div>

        {/* Footer Bar */}
        <div className="p-3 sm:p-4 border-t border-stone-800 bg-stone-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Математически модел: 10-Year Discounted Cash Flow (Gordon Growth Model)</span>
          </div>

          <div className="flex items-center gap-3">
            {selectedStock && (
              <span className="text-stone-300 font-bold hidden sm:inline">
                {selectedStock.ticker}: ${dcf.finalFairValue.toFixed(2)}
              </span>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold transition-colors cursor-pointer"
            >
              Затвори
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
