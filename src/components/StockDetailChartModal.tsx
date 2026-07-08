import React, { useEffect } from 'react';
import { Stock } from '../types';
import { X, ExternalLink } from 'lucide-react';
import { formatDividend } from '../utils/sectorHelper';
import { SymbolOverview } from 'react-ts-tradingview-widgets';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props { stock: Stock; onClose: () => void; }

// TradingView system green/red
const TV_GREEN = '#26a69a';
const TV_RED   = '#ef5350';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMC(v: number | string | null | undefined): string {
  if (v == null) return '—';
  if (typeof v === 'string') return v;
  if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T';
  if (v >= 1e9)  return (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6)  return (v / 1e6).toFixed(1) + 'M';
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

  // Exchange / currency
  let exch = 'NASDAQ', ccy = 'USD';
  if (stock.ticker.startsWith('EPA:'))      { exch = 'Euronext Paris'; ccy = 'EUR'; }
  else if (stock.ticker.startsWith('ETR:')){ exch = 'XETRA';          ccy = 'EUR'; }
  else if (stock.ticker.startsWith('STO:')){ exch = 'Stockholm';      ccy = 'SEK'; }
  else if (stock.ticker.startsWith('SWX:')){ exch = 'SIX';            ccy = 'CHF'; }
  else if (stock.ticker.includes('BTC') || stock.ticker.includes('-USD')) { exch = 'Crypto'; }
  else if (stock.ticker.startsWith('^'))   { exch = 'Index'; ccy = 'pts'; }

  const cs = ccy === 'EUR' ? '€' : ccy === 'SEK' ? 'kr ' : ccy === 'CHF' ? 'CHF ' : ccy === 'pts' ? '' : '$';
  const fp = (v: number) => {
    const s = v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (ccy === 'SEK' || ccy === 'CHF') ? `${s} ${cs.trim()}` : `${cs}${s}`;
  };
  const fc = (v: number | string | null | undefined) => v == null ? '—' : typeof v === 'string' ? v : fp(v);
  const sym = stock.ticker.includes(':') ? stock.ticker.split(':').pop()! : stock.ticker;

  const isUp   = (stock.dailyChangePct ?? 0) >= 0;
  const accent = isUp ? TV_GREEN : TV_RED;

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
  else if (!stock.ticker.includes(':')) tvSymbol = `NASDAQ:${sym}`;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
        padding: 8, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 1000, height: '100%', maxHeight: 760, display: 'flex', flexDirection: 'column',
        background: '#1e222d', borderRadius: 16, overflow: 'hidden', border: '1px solid #2a2e39',
        boxShadow: '0 60px 140px rgba(0,0,0,1)', position: 'relative'
      }}>
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 50, width: 32, height: 32, borderRadius: '50%',
            background: '#2a2e39', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#d1d4dc', transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#363a45'}
          onMouseLeave={e => e.currentTarget.style.background = '#2a2e39'}
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* HEADER */}
        <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#d1d4dc', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {sym}
            </div>
            <div style={{ fontSize: 16, color: '#787b86', marginTop: 2, fontWeight: 500 }}>
              {stock.companyName}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(209,212,220,0.5)', marginTop: 4 }}>
              {exch} · {ccy}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#d1d4dc', letterSpacing: '-0.02em', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
              {fp(stock.currentPrice)}
            </div>
            <div style={{ fontSize: 18, color: accent, fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, fontVariantNumeric: 'tabular-nums' }}>
              {isUp ? '+' : ''}{(stock.dailyChangePct ?? 0).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* CHART (TradingView SymbolOverview Widget) */}
        <div style={{ flex: 1, position: 'relative', margin: '0 8px', minHeight: 0 }}>
          <SymbolOverview
            symbols={[[stock.companyName, tvSymbol]]}
            colorTheme="dark"
            autosize
            chartType="area"
            downColor={TV_RED}
            borderDownColor={TV_RED}
            upColor={TV_GREEN}
            borderUpColor={TV_GREEN}
            lineColor={accent}
            topColor={`${accent}40`}
            bottomColor={`${accent}00`}
            fontFamily="Arial, sans-serif"
            gridLineColor="rgba(255, 255, 255, 0.05)"
            isTransparent
            showFloatingTooltip
            dateFormat="yyyy-MM-dd"
            // @ts-ignore: TradingView widget supports dateRange, but react wrapper typing misses it
            dateRange="12M"
          />
        </div>

        {/* STATS GRID */}
        <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px 24px', borderTop: '1px solid #2a2e39' }}>
          {[
            { l: 'Open',          v: '—' },
            { l: 'High',          v: fc(stock.high52) },
            { l: 'Low',           v: fc(stock.low52) },
            { l: 'Vol',           v: (stock as any).volume ? fmtVol((stock as any).volume) : '—' },
            { l: 'P/E Ratio',     v: stock.peRatio ? stock.peRatio.toFixed(2) : '—' },
            { l: 'Mkt Cap',       v: fmtMC(stock.marketCap) },
            { l: '52W High',      v: fc(stock.high52) },
            { l: '52W Low',       v: fc(stock.low52) },
            { l: 'Avg Vol',       v: (stock as any).avgVolume ? fmtVol((stock as any).avgVolume) : '—' },
            { l: 'Yield',         v: formatDividend(stock.dividend, stock.currentPrice) },
            { l: 'Beta',          v: (stock as any).beta ? (stock as any).beta.toFixed(2) : '—' },
            { l: 'EPS',           v: stock.eps ? stock.eps.toFixed(2) : '—' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#787b86', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#d1d4dc', fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, padding: '12px 20px', borderTop: '1px solid #2a2e39' }}>
          <a
            href={`https://finance.yahoo.com/quote/${encodeURIComponent(sym)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#787b86', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#d1d4dc'}
            onMouseLeave={e => e.currentTarget.style.color = '#787b86'}
          >
            <ExternalLink size={12} />
            See More Data from Yahoo Finance
          </a>
        </div>
      </div>
    </div>
  );
}
