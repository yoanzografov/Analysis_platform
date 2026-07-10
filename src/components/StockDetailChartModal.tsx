import React, { useEffect, useState } from 'react';
import { Stock } from '../types';
import { X, ExternalLink } from 'lucide-react';
import { formatDividend } from '../utils/sectorHelper';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';

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
  const fp = (v: number) => {
    const s = v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (ccy === 'SEK' || ccy === 'CHF') ? `${s} ${cs.trim()}` : `${cs}${s}`;
  };
  const fc = (v: number | string | null | undefined) => v == null ? '—' : typeof v === 'string' ? v : fp(v);
  const sym = stock.ticker.includes(':') ? stock.ticker.split(':').pop()! : stock.ticker;

  const isUp = (stock.dailyChangePct ?? 0) >= 0;
  const accent = isUp ? NEON_GREEN : NEON_RED;

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // Map to TradingView Symbol
  let tvSymbol = stock.ticker;
  if (stock.ticker.startsWith('EPA:')) tvSymbol = `EURONEXT:${sym}`;
  else if (stock.ticker.startsWith('ETR:')) tvSymbol = `XETR:${sym}`;
  else if (stock.ticker.startsWith('STO:')) tvSymbol = `OMXSTO:${sym}`;
  else if (stock.ticker.startsWith('SWX:')) tvSymbol = `SIX:${sym}`;
  else if (stock.ticker === '^GSPC') tvSymbol = 'SP:SPX';
  else if (stock.ticker === '^NDX') tvSymbol = 'NASDAQ:NDX';
  else if (!stock.ticker.includes(':')) tvSymbol = sym;


  return (
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
        <div className="p-6 pb-4 flex justify-between items-start">
          <div>
            <div className="text-3xl font-bold text-ink tracking-tight leading-tight">
              {sym}
            </div>
            <div className="text-base text-ink-muted mt-0.5 font-medium">
              {stock.companyName}
            </div>
            <div className="text-[13px] text-ink-faint mt-1">
              {exch} · {ccy}
            </div>
          </div>
          <div className="text-right pr-12 sm:pr-14">
            <div className="text-3xl font-bold text-ink tracking-tight leading-tight tabular-nums">
              {fp(stock.currentPrice)}
            </div>
            <div 
              className="text-lg font-semibold mt-0.5 flex items-center justify-end gap-1.5 tabular-nums"
              style={{ color: accent }}
            >
              {isUp ? '+' : ''}{(stock.dailyChangePct ?? 0).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* CHART (TradingView AdvancedRealTimeChart Widget) */}
        <div className="flex-1 relative mx-2 min-h-0">
          <AdvancedRealTimeChart
            symbol={tvSymbol}
            theme={isDark ? "dark" : "light"}
            autosize
            style="3" // Area chart
            hide_side_toolbar
            hide_legend
            allow_symbol_change={false}
            save_image={false}
            withdateranges
            range="12M"
          />
        </div>

        {/* STATS GRID */}
        <div className="p-4 sm:p-6 grid grid-cols-4 gap-4 sm:gap-6 border-t border-border">
          {[
            { l: 'Open', v: '—' },
            { l: 'High', v: fc(stock.high52) },
            { l: 'Low', v: fc(stock.low52) },
            { l: 'Vol', v: (stock as any).volume ? fmtVol((stock as any).volume) : '—' },
            { l: 'P/E Ratio', v: stock.peRatio ? stock.peRatio.toFixed(2) : '—' },
            { l: 'Mkt Cap', v: fmtMC(stock.marketCap) },
            { l: '52W High', v: fc(stock.high52) },
            { l: '52W Low', v: fc(stock.low52) },
            { l: 'Avg Vol', v: (stock as any).avgVolume ? fmtVol((stock as any).avgVolume) : '—' },
            { l: 'Yield', v: formatDividend(stock.dividend, stock.currentPrice) },
            { l: 'Beta', v: (stock as any).beta ? (stock as any).beta.toFixed(2) : '—' },
            { l: 'EPS', v: stock.eps ? stock.eps.toFixed(2) : '—' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <div className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">{s.l}</div>
              <div className="text-sm font-medium text-ink tabular-nums">{s.v}</div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="flex justify-center items-center gap-1 py-3 px-5 border-t border-border">
          <a
            href={`https://finance.yahoo.com/quote/${encodeURIComponent(sym)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-ink-faint hover:text-ink transition-colors no-underline"
          >
            <ExternalLink size={12} />
            See More Data from Yahoo Finance
          </a>
        </div>
      </div>
    </div>
  );
}
