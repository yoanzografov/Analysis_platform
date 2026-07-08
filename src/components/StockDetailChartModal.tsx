import React, { useState, useEffect } from 'react';
import { Stock } from '../types';
import { X, ExternalLink } from 'lucide-react';
import { formatDividend } from '../utils/sectorHelper';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
  ReferenceArea
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props { stock: Stock; onClose: () => void; }

interface ChartPoint { 
  time: number; 
  value: number; 
  volume: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const RANGES = ['1D','1W','1M','3M','6M','YTD','1Y','2Y','5Y','10Y','MAX'] as const;
type Range = typeof RANGES[number];

const RANGE_CFG: Record<Range, { apiRange: string; points: number; ms: number; label: string }> = {
  '1D':  { apiRange: '1d',  points: 78,  ms: 5*60_000,       label: 'Today' },
  '1W':  { apiRange: '7d',  points: 100, ms: 15*60_000,      label: 'Past Week' },
  '1M':  { apiRange: '1mo', points: 22,  ms: 86_400_000,     label: 'Past Month' },
  '3M':  { apiRange: '3mo', points: 66,  ms: 86_400_000,     label: 'Past 3 Months' },
  '6M':  { apiRange: '6mo', points: 126, ms: 86_400_000,     label: 'Past 6 Months' },
  'YTD': { apiRange: 'ytd', points: 180, ms: 86_400_000,     label: 'Year to Date' },
  '1Y':  { apiRange: '1y',  points: 52,  ms: 7*86_400_000,   label: 'Past Year' },
  '2Y':  { apiRange: '2y',  points: 104, ms: 7*86_400_000,   label: 'Past 2 Years' },
  '5Y':  { apiRange: '5y',  points: 260, ms: 7*86_400_000,   label: 'Past 5 Years' },
  '10Y': { apiRange: '10y', points: 120, ms: 30*86_400_000,  label: 'Past 10 Years' },
  'MAX': { apiRange: 'max', points: 200, ms: 30*86_400_000,  label: 'All Time' },
};

// Apple system green/red
const APPLE_GREEN = '#30d158';
const APPLE_RED   = '#ff3b30';
const VOL_GRAY    = 'rgba(255,255,255,0.12)';

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

function fmtDate(ts: number, range: Range): string {
  const d = new Date(ts * 1000);
  if (range === '1D')
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (range === '1W')
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  if (range === '1M' || range === '3M' || range === '6M')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Simulated data fallback
function simulate(
  ticker: string, range: Range, price: number, chg: number, lo52?: number, hi52?: number
): ChartPoint[] {
  const { points, ms } = RANGE_CFG[range];
  const now = Date.now();
  let s = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0) ^ (range.charCodeAt(0) * 31);
  const rng = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
  const dir = chg !== 0 ? Math.sign(chg) : (s % 3) - 1;
  const raw: number[] = [];

  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const v = price * (1
      + Math.sin(t * 2 * Math.PI + s % 5) * 0.10
      + Math.cos(t * 8 * Math.PI + s % 3) * 0.05
      + Math.sin(t * 22 * Math.PI + s % 7) * 0.02
      + t * dir * 0.10
      + (rng() - 0.5) * 0.022
    );
    raw.push(v);
  }

  const scale = price / (raw[raw.length - 1] || price);
  const data: ChartPoint[] = [];
  const baseV = price * 4e6;

  for (let i = 0; i < points; i++) {
    let v = raw[i] * scale;
    if (lo52 && v < lo52) v = lo52 + rng() * lo52 * 0.01;
    if (hi52 && v > hi52) v = hi52 - rng() * hi52 * 0.01;
    if (v < 0.01) v = 0.01;
    const ts = Math.floor((now - (points - 1 - i) * ms) / 1000);
    data.push({ time: ts, value: +v.toFixed(2), volume: baseV * (0.3 + rng() * 1.4) });
  }
  data[data.length - 1].value = price;
  return data;
}

// Custom Recharts Tooltip
const CustomTooltip = ({ active, payload, range }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(28,28,30,0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '6px 10px',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        pointerEvents: 'none'
      }}>
        <div style={{ fontWeight: 600 }}>{payload[0].value.toFixed(2)}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)' }}>{fmtDate(payload[0].payload.time, range)}</div>
      </div>
    );
  }
  return null;
};

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

  // State
  const [range, setRange]           = useState<Range>('1Y');
  const [data, setData]             = useState<ChartPoint[]>([]);
  const [loading, setLoading]       = useState(true);
  
  const [hoverState, setHoverState] = useState<{price: number | null, time: number | null}>({ price: null, time: null });
  const [dragState, setDragState]   = useState<{ start: ChartPoint | null, end: ChartPoint | null, isDragging: boolean }>({ start: null, end: null, isDragging: false });

  // Derived Baseline
  const openP    = data.length > 0 ? data[0].value : stock.currentPrice;
  const closeP   = data.length > 0 ? data[data.length - 1].value : stock.currentPrice;
  const pDiff    = closeP - openP;
  const pPct     = openP > 0 ? (pDiff / openP) * 100 : 0;
  const isUp     = pDiff >= 0;
  
  // Is an active measurement drawn?
  const isMeasuring = dragState.start && dragState.end && dragState.start.time !== dragState.end.time;

  // Display calculations
  let dPrice = hoverState.price ?? stock.currentPrice;
  let dDiff  = dPrice - openP;
  let dPct   = openP > 0 ? (dDiff / openP) * 100 : 0;

  if (isMeasuring && dragState.start && dragState.end) {
    // When measuring, we show the difference between the END point and the START point of the drag
    const v1 = dragState.start.value;
    const v2 = dragState.end.value;
    dPrice = v2;
    dDiff  = v2 - v1;
    dPct   = v1 > 0 ? (dDiff / v1) * 100 : 0;
  }

  const dUp    = dDiff >= 0;
  const dCol   = dUp ? APPLE_GREEN : APPLE_RED;
  const accent = isMeasuring ? dCol : (isUp ? APPLE_GREEN : APPLE_RED); // Chart color matches measure mode!

  const timeLabel = isMeasuring 
    ? `${fmtDate(Math.min(dragState.start!.time, dragState.end!.time), range)} – ${fmtDate(Math.max(dragState.start!.time, dragState.end!.time), range)}`
    : (hoverState.time ? fmtDate(hoverState.time, range) : RANGE_CFG[range].label);

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // Load data
  useEffect(() => {
    let dead = false;
    setLoading(true); setHoverState({ price: null, time: null }); setDragState({ start: null, end: null, isDragging: false });

    (async () => {
      try {
        const c = RANGE_CFG[range];
        const url = `/api/stock-history?ticker=${encodeURIComponent(stock.ticker)}&range=${c.apiRange}&currentPrice=${stock.currentPrice}&dailyChange=${stock.dailyChangePct ?? 0}&low52=${stock.low52 ?? ''}&high52=${stock.high52 ?? ''}`;
        const res = await fetch(url);
        if (!res.ok) throw 0;
        const j: { timestamps: number[]; prices: number[] } = await res.json();
        if (dead) return;
        const points = j.timestamps.map((t, i) => ({ 
          time: t, 
          value: j.prices[i],
          volume: stock.currentPrice * 4e6 * (0.3 + Math.random() * 1.4) 
        }));
        setData(points);
      } catch {
        if (dead) return;
        const d = simulate(stock.ticker, range, stock.currentPrice, stock.dailyChangePct ?? 0, stock.low52, stock.high52);
        setData(d);
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => { dead = true; };
  }, [stock.ticker, range, stock.currentPrice]);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
        padding: 8, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        userSelect: dragState.isDragging ? 'none' : 'auto'
      }}
    >
      <div style={{
        width: '100%', maxWidth: 1000, height: '100%', maxHeight: 760, display: 'flex', flexDirection: 'column',
        background: '#000', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 60px 140px rgba(0,0,0,1)', position: 'relative'
      }}>
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 50, width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'rgba(255,255,255,0.9)', transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* HEADER */}
        <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {sym}
            </div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: 500 }}>
              {stock.companyName}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
              {exch} · {ccy}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
              {fp(dPrice)}
            </div>
            <div style={{ fontSize: 18, color: dCol, fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, fontVariantNumeric: 'tabular-nums' }}>
              {dUp ? '+' : ''}{dDiff.toFixed(2)} ({dUp ? '+' : ''}{dPct.toFixed(2)}%)
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              {timeLabel}
            </div>
          </div>
        </div>

        {/* TIME TABS */}
        <div style={{ display: 'flex', gap: 4, padding: '0 20px 12px' }}>
          {RANGES.map(r => {
            const active = r === range;
            return (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
                onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
              >
                {r}
              </button>
            );
          })}
        </div>

        {/* CHART (Recharts) */}
        <div 
          style={{ flex: 1, position: 'relative', margin: '0 8px', minHeight: 0, cursor: dragState.isDragging ? 'ew-resize' : 'crosshair' }}
          onMouseUp={() => { if (dragState.isDragging) setDragState({ ...dragState, isDragging: false }); }}
          onMouseLeave={() => { if (dragState.isDragging) setDragState({ ...dragState, isDragging: false }); }}
        >
          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: accent, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {!loading && data.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={data} 
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                onMouseDown={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    setDragState({ start: e.activePayload[0].payload, end: e.activePayload[0].payload, isDragging: true });
                  } else {
                    setDragState({ start: null, end: null, isDragging: false });
                  }
                }}
                onMouseMove={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    setHoverState({ price: e.activePayload[0].payload.value, time: e.activePayload[0].payload.time });
                    if (dragState.isDragging && dragState.start) {
                      setDragState({ ...dragState, end: e.activePayload[0].payload });
                    }
                  } else {
                    setHoverState({ price: null, time: null });
                  }
                }}
                onMouseUp={() => setDragState({ ...dragState, isDragging: false })}
                onMouseLeave={() => setHoverState({ price: null, time: null })}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                
                {/* Price YAxis */}
                <YAxis 
                  domain={['auto', 'auto']} 
                  orientation="right"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickFormatter={(val) => val.toFixed(1)}
                  yAxisId="price"
                />
                
                {/* Volume YAxis */}
                <YAxis 
                  domain={[0, 'auto']} 
                  hide 
                  yAxisId="volume"
                />
                
                <Tooltip 
                  content={<CustomTooltip range={range} />}
                  cursor={!isMeasuring ? { stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' } : false}
                  isAnimationActive={false}
                  position={{ y: 0 }}
                />

                {isMeasuring && dragState.start && dragState.end && (
                  <ReferenceArea 
                    x1={dragState.start.time} 
                    x2={dragState.end.time} 
                    yAxisId="price" 
                    fillOpacity={0.15}
                    {...{ fill: '#ffffff' } as any}
                  />
                )}
                
                <Bar 
                  dataKey="volume" 
                  fill={VOL_GRAY} 
                  yAxisId="volume"
                  isAnimationActive={false}
                />
                
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={accent} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  yAxisId="price"
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* STATS GRID */}
        <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { l: 'Open',          v: fc(openP) },
            { l: 'High',          v: fc(Math.max(...(data.length ? data.map(d => d.value) : [stock.currentPrice]))) },
            { l: 'Low',           v: fc(Math.min(...(data.length ? data.map(d => d.value) : [stock.currentPrice]))) },
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
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <a
            href={`https://finance.yahoo.com/quote/${encodeURIComponent(sym)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.50)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
          >
            <ExternalLink size={12} />
            See More Data from Yahoo Finance
          </a>
        </div>
      </div>
    </div>
  );
}
