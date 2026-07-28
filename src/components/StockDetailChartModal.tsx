import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Stock } from '../types';
import { X, ExternalLink } from 'lucide-react';
import { formatDividend } from '../utils/sectorHelper';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import { getTradingViewSymbol } from '../utils/tvSymbolMap';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props { stock: Stock; onClose: () => void; }

// Neon system green/red
const NEON_GREEN = '#10b981';
const NEON_RED = '#f43f5e';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMC(v: number | string | null | undefined): string {
  if (v == null) return '—';
  if (typeof v === 'string') return v;
  if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T';
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  return v.toLocaleString('en-US');
}

function fmtVol(v: number): string {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  return v.toFixed(0);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StockDetailChartModal({ stock, onClose }: Props) {
  const [isDark, setIsDark] = useState(true);

  // Check theme on mount and observe changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    
    // Create an observer to listen for class changes on HTML element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Exchange / currency
  let exch = 'NASDAQ', ccy = 'USD';
  if (stock.ticker.startsWith('EPA:')) { exch = 'Euronext Paris'; ccy = 'EUR'; }
  else if (stock.ticker.startsWith('ETR:')){ exch = 'XETRA'; ccy = 'EUR'; }
  else if (stock.ticker.startsWith('STO:')){ exch = 'Stockholm'; ccy = 'SEK'; }
  else if (stock.ticker.startsWith('SWX:')){ exch = 'SIX'; ccy = 'CHF'; }
  else if (stock.ticker.includes('BTC') || stock.ticker.includes('-USD')) { exch = 'Crypto'; }
  else if (stock.ticker.startsWith('^')) { exch = 'Index'; ccy = 'pts'; }

  const cs = ccy === 'EUR' ? '€' : ccy === 'SEK' ? 'kr ' : ccy === 'CHF' ? 'CHF ' : ccy === 'pts' ? '' : '$';
  
  const priceToDisplay = (typeof stock.currentPrice === 'number' && stock.currentPrice > 0)
    ? stock.currentPrice
    : (typeof stock.priceOfCalc === 'number' && stock.priceOfCalc > 0)
    ? stock.priceOfCalc
    : (typeof stock.fairPrice === 'number' && stock.fairPrice > 0)
    ? stock.fairPrice
    : null;

  const fp = (v: number | null | undefined) => {
    if (v == null || typeof v !== 'number' || isNaN(v) || v <= 0) return '—';
    const s = v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (ccy === 'SEK' || ccy === 'CHF') ? `${s} ${cs.trim()}` : `${cs}${s}`;
  };
  const fc = (v: number | string | null | undefined) => v == null ? '—' : typeof v === 'string' ? v : fp(typeof v === 'number' ? v : parseFloat(v));
  const sym = stock.ticker.includes(':') ? stock.ticker.split(':').pop()! : stock.ticker;

  const isUp = (stock.dailyChangePct ?? 0) >= 0;
  const accent = isUp ? NEON_GREEN : NEON_RED;

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const tvSymbol = getTradingViewSymbol(stock.companyName, stock.ticker);

  const [activeRange, setActiveRange] = useState<string>("1Y");

  const RANGES = [
    { label: '1D', val: '1D', tvRange: '1D', interval: '5' },
    { label: '1W', val: '1W', tvRange: '5D', interval: '15' },
    { label: '1M', val: '1M', tvRange: '1M', interval: '60' },
    { label: '3M', val: '3M', tvRange: '3M', interval: '120' },
    { label: '6M', val: '6M', tvRange: '6M', interval: 'D' },
    { label: '1Y', val: '1Y', tvRange: '12M', interval: 'D' },
    { label: '5Y', val: '5Y', tvRange: '60M', interval: 'W' },
    { label: 'ALL', val: 'ALL', tvRange: 'ALL', interval: 'M' },
  ] as const;

  const currentConf = RANGES.find(r => r.val === activeRange)!;

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-bg/90 backdrop-blur-md font-sans"
    >
      <div className="w-full max-w-[1000px] h-full max-h-[760px] flex flex-col bg-card/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-border shadow-2xl relative">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-border flex items-center justify-center text-ink hover:bg-border-hover transition-colors cursor-pointer border-none outline-none"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* HEADER */}
        <div className="p-4 sm:p-6 pb-2 sm:pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-ink tracking-tight leading-tight uppercase">
              {sym}
            </div>
            <div className="text-xs sm:text-xs text-ink-muted mt-0.5 font-medium">
              {stock.companyName}
            </div>
            <div className="text-xs sm:text-xs text-ink-faint mt-1">
              {exch} · {ccy}
            </div>
          </div>
          
          <div className="flex flex-col items-start sm:items-end w-full sm:w-auto pr-8 sm:pr-14">
            <div className="text-2xl sm:text-3xl font-bold text-ink tracking-tight leading-tight tabular-nums">
              {fp(priceToDisplay)}
            </div>
            <div 
              className="text-xs sm:text-lg font-semibold mt-0.5 flex items-center justify-end gap-1.5 tabular-nums"
              style={{ color: accent }}
            >
              {isUp ? '+' : ''}{(stock.dailyChangePct ?? 0).toFixed(2)}%
            </div>
            
            {/* TIME RANGE BUTTONS */}
            <div className="flex flex-wrap gap-1 mt-3 sm:mt-4 bg-border/40 p-1 rounded-lg">
              {RANGES.map(r => (
                <button
                  key={r.val}
                  onClick={() => setActiveRange(r.val)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    activeRange === r.val 
                      ? 'bg-bg text-ink shadow-sm' 
                      : 'text-ink-faint hover:text-ink hover:bg-border/60'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CHART (TradingView AdvancedRealTimeChart Widget) */}
        <div className="flex-1 relative mx-2 mb-4 min-h-0">
          <AdvancedRealTimeChart
            key={activeRange} // force re-render when changing ranges to avoid widget bug
            symbol={tvSymbol}
            theme={isDark ? "dark" : "light"}
            autosize
            style="1" // Candlestick chart
            interval={currentConf.interval as any}
            timezone="exchange"
            hide_top_toolbar={false}
            hide_side_toolbar={false}
            hide_legend={false}
            allow_symbol_change={true}
            save_image={true}
            details={false}
            hotlist={false}
            calendar={false}
            withdateranges={false} // Disable native date ranges since we have our custom buttons
            range={currentConf.tvRange as any}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
