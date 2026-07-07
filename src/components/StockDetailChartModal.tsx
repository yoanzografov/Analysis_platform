import React, { useState, useEffect, useRef } from 'react';
import { Stock } from '../types';
import { X } from 'lucide-react';
import { formatDividend } from '../utils/sectorHelper';

interface Props {
  stock: Stock;
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMarketCap(val: number | string | undefined | null): string {
  if (val === undefined || val === null) return '—';
  if (typeof val === 'string') return val;
  if (val >= 1e12) return (val / 1e12).toFixed(2) + 'T';
  if (val >= 1e9)  return (val / 1e9).toFixed(2) + 'B';
  if (val >= 1e6)  return (val / 1e6).toFixed(2) + 'M';
  return val.toLocaleString('en-US');
}

// Map our range buttons → TradingView range + interval params
const RANGE_MAP: Record<string, { tvRange: string; tvInterval: string }> = {
  '1D':  { tvRange: '1D',   tvInterval: '5'  },
  '5D':  { tvRange: '5D',   tvInterval: '15' },
  '1M':  { tvRange: '1M',   tvInterval: 'D'  },
  '3M':  { tvRange: '3M',   tvInterval: 'D'  },
  'YTD': { tvRange: 'YTD',  tvInterval: 'D'  },
  '1Y':  { tvRange: '12M',  tvInterval: 'W'  },
  '3Y':  { tvRange: '36M',  tvInterval: 'W'  },
  '5Y':  { tvRange: '60M',  tvInterval: 'W'  },
  'Max': { tvRange: 'ALL',  tvInterval: 'M'  },
};

const RANGES = Object.keys(RANGE_MAP);

// Map our internal ticker format → TradingView exchange:symbol format
function toTVSymbol(ticker: string): string {
  if (ticker.startsWith('EPA:'))  return 'EURONEXT:' + ticker.slice(4);
  if (ticker.startsWith('ETR:'))  return 'XETR:'     + ticker.slice(4);
  if (ticker.startsWith('STO:'))  return 'OMX:'      + ticker.slice(4);
  if (ticker.startsWith('SWX:'))  return 'SIX:'      + ticker.slice(4);
  if (ticker === '^GSPC')         return 'SP:SPX';
  if (ticker === '^DJI')          return 'DJ:DJI';
  if (ticker === '^IXIC')         return 'NASDAQ:IXIC';
  if (ticker === '^VIX')          return 'CBOE:VIX';
  if (ticker === '^N225')         return 'INDEX:NKY';
  if (ticker === '^FTSE')         return 'INDEX:UKX';
  if (ticker.includes('BTC-USD')) return 'BITSTAMP:BTCUSD';
  if (ticker.includes('ETH-USD')) return 'BITSTAMP:ETHUSD';
  // Suffix-based fallback (e.g. AMS:, BRU:, etc.)
  if (ticker.includes(':')) {
    const [exch, sym] = ticker.split(':');
    return `${exch}:${sym}`;
  }
  return ticker;
}

// ─── TradingView widget sub-component ────────────────────────────────────────

interface TVChartProps {
  symbol: string;
  tvRange: string;
  tvInterval: string;
  accentColor: string;
}

function TVChart({ symbol, tvRange, tvInterval, accentColor }: TVChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = '';

    const widgetId = `tv_${symbol.replace(/[^a-z0-9]/gi, '_')}_${tvRange}_${Date.now()}`;
    const widgetDiv = document.createElement('div');
    widgetDiv.id = widgetId;
    el.appendChild(widgetDiv);

    function buildWidget() {
      const w = window as any;
      if (!w.TradingView) return;
      new w.TradingView.widget({
        autosize: true,
        symbol,
        interval: tvInterval,
        range: tvRange,
        timezone: 'Europe/Sofia',
        theme: 'dark',
        style: '1',
        locale: 'en',
        backgroundColor: '#111113',
        gridColor: 'rgba(255,255,255,0.04)',
        toolbar_bg: '#111113',
        hide_top_toolbar: false,
        hide_legend: true,
        hide_side_toolbar: true,
        allow_symbol_change: false,
        save_image: false,
        container_id: widgetId,
      });
    }

    const w = window as any;
    if (w.TradingView) {
      buildWidget();
    } else {
      const existing = document.getElementById('tv-script');
      if (!existing) {
        const s = document.createElement('script');
        s.id = 'tv-script';
        s.src = 'https://s3.tradingview.com/tv.js';
        s.async = true;
        s.onload = buildWidget;
        document.head.appendChild(s);
      } else {
        // Script already loading — poll briefly
        let attempts = 0;
        const poll = setInterval(() => {
          if ((window as any).TradingView) { clearInterval(poll); buildWidget(); }
          if (++attempts > 40) clearInterval(poll);
        }, 150);
      }
    }

    return () => { if (el) el.innerHTML = ''; };
  }, [symbol, tvRange, tvInterval]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: 360, background: '#111113' }}
    />
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function StockDetailChartModal({ stock, onClose }: Props) {

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // ── Currency / exchange ──
  let exchangeName = 'NASDAQ';
  let currencyCode = 'USD';
  if (stock.ticker.startsWith('EPA:'))      { exchangeName = 'Euronext Paris';     currencyCode = 'EUR'; }
  else if (stock.ticker.startsWith('ETR:')){ exchangeName = 'XETRA Frankfurt';    currencyCode = 'EUR'; }
  else if (stock.ticker.startsWith('STO:')){ exchangeName = 'Nasdaq Stockholm';   currencyCode = 'SEK'; }
  else if (stock.ticker.startsWith('SWX:')){ exchangeName = 'SIX Swiss Exchange'; currencyCode = 'CHF'; }
  else if (stock.ticker.includes('-USD') || stock.ticker.includes('BTC')) { exchangeName = 'Crypto'; currencyCode = 'USD'; }
  else if (stock.ticker.startsWith('^'))   { exchangeName = 'Index'; currencyCode = 'Points'; }

  const currencySymbol = currencyCode === 'EUR' ? '€' : currencyCode === 'SEK' ? 'kr' : currencyCode === 'CHF' ? 'CHF' : currencyCode === 'Points' ? '' : '$';

  const fmtPrice = (v: number) => {
    const s = v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (currencyCode === 'SEK' || currencyCode === 'CHF') return `${s} ${currencySymbol}`;
    return `${currencySymbol}${s}`;
  };

  const fmtCur = (v: number | string | undefined | null) => {
    if (v == null) return '—';
    if (typeof v === 'string') return v;
    return fmtPrice(v);
  };

  // ── State ──
  const [range, setRange] = useState('1Y');

  const { tvRange, tvInterval } = RANGE_MAP[range] ?? RANGE_MAP['1Y'];
  const tvSymbol = toTVSymbol(stock.ticker);

  // Derived numbers
  const dailyChange = stock.dailyChangePct ?? 0;
  const openPrice   = stock.currentPrice / (1 + dailyChange / 100);
  const dailyDiff   = stock.currentPrice - openPrice;
  const isUp        = dailyDiff >= 0;
  const accentColor = isUp ? '#34d399' : '#f87171';

  // Mock stats (intraday)
  const mockOpen = openPrice;
  const mockHigh = Math.max(stock.currentPrice, openPrice) * 1.007;
  const mockLow  = Math.min(stock.currentPrice, openPrice) * 0.993;
  const mockBeta = ((stock.ticker.charCodeAt(0) % 4) * 0.22 + 0.78).toFixed(2);
  const mockVol  = ((stock.ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 5) + 1) * 8.42e6;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(14px)' }}
    >
      <div
        className="relative w-full flex flex-col"
        style={{
          maxWidth: 720,
          height: '100dvh',
          maxHeight: '96vh',
          background: '#111113',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.07)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
          overflow: 'hidden',
        }}
      >

        {/* ── Sticky header ── */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-2"
          style={{ flexShrink: 0 }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
                {stock.ticker.includes(':') ? stock.ticker.split(':')[1] : stock.ticker}
              </span>
              <span style={{ fontSize: 12, color: '#666', fontWeight: 500, marginTop: 4 }}>
                {exchangeName}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 1 }}>{stock.companyName}</div>
          </div>

          <button
            onClick={onClose}
            aria-label="Затвори"
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.10)',
              border: 'none', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ccc', transition: 'background .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Price display ── */}
        <div className="px-5 pb-2" style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 38, fontWeight: 700, color: '#fff', letterSpacing: -1, lineHeight: 1.1 }}>
            {fmtPrice(stock.currentPrice)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span style={{ fontSize: 13, fontWeight: 600, color: accentColor }}>
              {isUp ? '▲' : '▼'} {fmtPrice(Math.abs(dailyDiff))} ({isUp ? '+' : ''}{dailyChange.toFixed(2)}%)
            </span>
            <span style={{ fontSize: 11, color: '#555' }}>Дневна промяна</span>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>

          {/* TradingView Chart */}
          <TVChart
            symbol={tvSymbol}
            tvRange={tvRange}
            tvInterval={tvInterval}
            accentColor={accentColor}
          />

          {/* ── Range selector ── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 12px 10px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: '#0e0e10',
              flexShrink: 0,
            }}
          >
            {RANGES.map(r => {
              const active = range === r;
              return (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  style={{
                    padding: '5px 9px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: active ? 700 : 500,
                    color: active ? accentColor : '#555',
                    background: active ? `${accentColor}1A` : 'transparent',
                    transition: 'all .15s',
                    fontFamily: 'inherit',
                    letterSpacing: -0.1,
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>

          {/* ── Stats grid ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
            }}
          >
            {[
              { label: 'Отворен (Open)',  value: fmtCur(mockOpen) },
              { label: 'Текуща Цена',     value: fmtCur(stock.currentPrice) },
              { label: 'Ден Върх',        value: fmtCur(mockHigh) },
              { label: 'Ден Дъно',        value: fmtCur(mockLow) },
              { label: '52С Върх',        value: fmtCur(stock.high52 ?? mockHigh * 1.1) },
              { label: '52С Дъно',        value: fmtCur(stock.low52 ?? mockLow * 0.9) },
              { label: 'Пазарна Кап.',    value: stock.marketCap ? formatMarketCap(stock.marketCap) : '—' },
              { label: 'Обем',            value: formatMarketCap(mockVol) },
              { label: 'P/E Коеф.',       value: stock.peRatio ? stock.peRatio.toFixed(2) : '—' },
              { label: 'EPS',             value: stock.eps != null ? fmtCur(stock.eps) : '—' },
              { label: 'Дивидент',        value: formatDividend(stock.dividend, stock.currentPrice) },
              { label: 'Beta',            value: mockBeta },
            ].map(({ label, value }, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '11px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <span style={{ fontSize: 12, color: '#555' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#ddd', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span style={{ fontSize: 10, color: '#444' }}>
              {exchangeName} · {currencyCode} · Данни от TradingView
            </span>
            <button
              onClick={onClose}
              style={{
                padding: '7px 20px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(255,255,255,0.06)',
                color: '#aaa',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 600,
                transition: 'background .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.11)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              Затвори
            </button>
          </div>

        </div>{/* end scrollable body */}
      </div>
    </div>
  );
}
