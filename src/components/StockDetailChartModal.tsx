import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stock } from '../types';
import { X, ExternalLink } from 'lucide-react';
import { formatDividend } from '../utils/sectorHelper';
import {
  createChart,
  IChartApi,
  ColorType,
  CrosshairMode,
  LineStyle,
  AreaSeries,
  LineStyle as LS,
} from 'lightweight-charts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props { stock: Stock; onClose: () => void; }

interface PricePoint { time: number; value: number; }
interface VolPoint   { time: number; vol: number; isUp: boolean; }

// ─── Range config ─────────────────────────────────────────────────────────────

const RANGES = ['1D','1W','1M','3M','6M','YTD','1Y','2Y','5Y','10Y','ALL'] as const;
type Range = typeof RANGES[number];

const RANGE_CFG: Record<Range, { apiRange: string; apiInterval: string; points: number; msInterval: number; label: string }> = {
  '1D':  { apiRange:'1d',   apiInterval:'5m',   points:78,   msInterval:5*60_000,          label:'Today'          },
  '1W':  { apiRange:'7d',   apiInterval:'15m',  points:100,  msInterval:15*60_000,         label:'Past Week'      },
  '1M':  { apiRange:'1mo',  apiInterval:'1d',   points:22,   msInterval:86_400_000,        label:'Past Month'     },
  '3M':  { apiRange:'3mo',  apiInterval:'1d',   points:66,   msInterval:86_400_000,        label:'Past 3 Months'  },
  '6M':  { apiRange:'6mo',  apiInterval:'1d',   points:126,  msInterval:86_400_000,        label:'Past 6 Months'  },
  'YTD': { apiRange:'ytd',  apiInterval:'1d',   points:180,  msInterval:86_400_000,        label:'Year to Date'   },
  '1Y':  { apiRange:'1y',   apiInterval:'1wk',  points:52,   msInterval:7*86_400_000,      label:'Past Year'      },
  '2Y':  { apiRange:'2y',   apiInterval:'1wk',  points:104,  msInterval:7*86_400_000,      label:'Past 2 Years'   },
  '5Y':  { apiRange:'5y',   apiInterval:'1wk',  points:260,  msInterval:7*86_400_000,      label:'Past 5 Years'   },
  '10Y': { apiRange:'10y',  apiInterval:'1mo',  points:120,  msInterval:30*86_400_000,     label:'Past 10 Years'  },
  'ALL': { apiRange:'max',  apiInterval:'1mo',  points:200,  msInterval:30*86_400_000,     label:'All Time'       },
};

// ─── Data simulation ──────────────────────────────────────────────────────────

function simulateData(
  ticker: string, range: Range, currentPrice: number,
  dailyChangePct: number, low52: number|null, high52: number|null
): { prices: PricePoint[]; vols: VolPoint[] } {
  const cfg = RANGE_CFG[range];
  const { points, msInterval } = cfg;
  const now = Date.now();
  let seed = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0) ^ (range.charCodeAt(0) * 31);
  const lcg = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0xffffffff; };

  const trendDir = dailyChangePct !== 0 ? Math.sign(dailyChangePct) : (seed % 3) - 1;
  const rawPrices: number[] = [];

  for (let i = 0; i < points; i++) {
    const t   = i / (points - 1);
    const w1  = Math.sin(t * 2 * Math.PI + seed % 5) * 0.10;
    const w2  = Math.cos(t * 8 * Math.PI + seed % 3) * 0.05;
    const w3  = Math.sin(t * 22 * Math.PI + seed % 7) * 0.02;
    const tr  = t * trendDir * 0.10;
    const nz  = (lcg() - 0.5) * 0.022;
    rawPrices.push(currentPrice * (1 + w1 + w2 + w3 + tr + nz));
  }

  // Scale so last point == currentPrice
  const last = rawPrices[rawPrices.length - 1] || currentPrice;
  const scale = currentPrice / last;

  const prices: PricePoint[] = [];
  const vols:   VolPoint[]   = [];
  const baseVol = currentPrice * 5e6;

  for (let i = 0; i < points; i++) {
    let v = rawPrices[i] * scale;
    if (low52  && v < low52)  v = low52  + lcg() * low52  * 0.01;
    if (high52 && v > high52) v = high52 - lcg() * high52 * 0.01;
    if (v < 0.01) v = 0.01;
    const ts = Math.floor((now - (points - 1 - i) * msInterval) / 1000);
    prices.push({ time: ts, value: parseFloat(v.toFixed(2)) });
    const prevV = i > 0 ? prices[i - 1].value : v;
    vols.push({ time: ts, vol: baseVol * (0.4 + lcg() * 1.2), isUp: v >= prevV });
  }
  prices[prices.length - 1].value = currentPrice;
  return { prices, vols };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMktCap(v: number|string|null|undefined): string {
  if (v == null) return '—';
  if (typeof v === 'string') return v;
  if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T';
  if (v >= 1e9)  return (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6)  return (v / 1e6).toFixed(2) + 'M';
  return v.toLocaleString('en-US');
}

function formatDate(ts: number, range: Range): string {
  const d = new Date(ts * 1000);
  if (range === '1D') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (range === '1W') return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  if (range === '1M' || range === '3M' || range === '6M')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Volume Bars SVG ──────────────────────────────────────────────────────────

function VolumeBars({ vols, hoverIdx, accent }: {
  vols: VolPoint[]; hoverIdx: number | null; accent: string;
}) {
  const max = Math.max(...vols.map(v => v.vol), 1);
  const barW = 100 / vols.length;

  return (
    <svg width="100%" height="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
      {vols.map((v, i) => {
        const h = (v.vol / max) * 100;
        const isHovered = hoverIdx === i;
        const color = v.isUp ? '#00d084' : '#ff453a';
        return (
          <rect
            key={i}
            x={`${i * barW + barW * 0.1}%`}
            y={`${100 - h}%`}
            width={`${barW * 0.8}%`}
            height={`${h}%`}
            fill={isHovered ? color : color + '70'}
            style={{ transition: 'fill 0.1s' }}
          />
        );
      })}
    </svg>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function StockDetailChartModal({ stock, onClose }: Props) {

  // ── Exchange / currency ──
  let exchange = 'NASDAQ'; let ccy = 'USD';
  if (stock.ticker.startsWith('EPA:'))      { exchange = 'Euronext';  ccy = 'EUR'; }
  else if (stock.ticker.startsWith('ETR:')){ exchange = 'XETRA';     ccy = 'EUR'; }
  else if (stock.ticker.startsWith('STO:')){ exchange = 'Stockholm'; ccy = 'SEK'; }
  else if (stock.ticker.startsWith('SWX:')){ exchange = 'SIX';       ccy = 'CHF'; }
  else if (stock.ticker.includes('BTC') || stock.ticker.includes('-USD')) { exchange = 'Crypto'; ccy = 'USD'; }
  else if (stock.ticker.startsWith('^'))   { exchange = 'Index';     ccy = 'pts'; }

  const csym = ccy === 'EUR' ? '€' : ccy === 'SEK' ? 'kr' : ccy === 'CHF' ? 'Fr' : ccy === 'pts' ? '' : '$';
  const fmtP = (v: number) => {
    const s = v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (ccy === 'SEK' || ccy === 'CHF') ? `${s} ${csym}` : `${csym}${s}`;
  };
  const fmtC = (v: number|string|null|undefined) => v == null ? '—' : typeof v === 'string' ? v : fmtP(v);
  const fmtV = (v: number) => {
    if (v >= 1e9) return (v/1e9).toFixed(2)+'B';
    if (v >= 1e6) return (v/1e6).toFixed(2)+'M';
    if (v >= 1e3) return (v/1e3).toFixed(2)+'K';
    return v.toFixed(0);
  };

  const sym = stock.ticker.includes(':') ? stock.ticker.split(':').pop()! : stock.ticker;

  // ── State ──
  const [range, setRange]         = useState<Range>('1Y');
  const [prices, setPrices]       = useState<PricePoint[]>([]);
  const [vols, setVols]           = useState<VolPoint[]>([]);
  const [loading, setLoading]     = useState(true);
  const [hoverIdx, setHoverIdx]   = useState<number|null>(null);
  const [hoverPrice, setHoverPrice] = useState<number|null>(null);
  const [hoverTime, setHoverTime]   = useState<string|null>(null);

  // ── Derived ──
  const openP  = prices.length > 0 ? prices[0].value  : stock.currentPrice;
  const closeP = prices.length > 0 ? prices[prices.length - 1].value : stock.currentPrice;
  const periodPct = openP > 0 ? ((closeP - openP) / openP) * 100 : (stock.dailyChangePct ?? 0);
  const isUp = periodPct >= 0;
  const accent = isUp ? '#00d084' : '#ff453a';
  const accentDim = isUp ? '#00d08433' : '#ff453a33';

  const displayPrice = hoverPrice ?? stock.currentPrice;
  const displayPct   = hoverPrice != null ? ((displayPrice - openP) / openP) * 100 : periodPct;
  const displayDiff  = displayPrice - openP;
  const displayIsUp  = displayDiff >= 0;
  const displayColor = displayIsUp ? '#00d084' : '#ff453a';

  // ── Escape key ──
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // ── Data loading ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHoverIdx(null);
    setHoverPrice(null);
    setHoverTime(null);

    const load = async () => {
      try {
        const cfg = RANGE_CFG[range];
        const url = `/api/stock-history?ticker=${encodeURIComponent(stock.ticker)}&range=${cfg.apiRange}&currentPrice=${stock.currentPrice}&dailyChange=${stock.dailyChangePct ?? 0}&low52=${stock.low52 ?? ''}&high52=${stock.high52 ?? ''}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('api');
        const json: { timestamps: number[]; prices: number[] } = await res.json();
        if (cancelled) return;
        const ps: PricePoint[] = json.timestamps.map((ts, i) => ({ time: ts, value: json.prices[i] }));
        const vs: VolPoint[]   = ps.map((p, i) => ({
          time: p.time,
          vol:  (stock.currentPrice ?? 100) * 5e6 * (0.4 + Math.random() * 1.2),
          isUp: i === 0 || p.value >= ps[i - 1].value,
        }));
        setPrices(ps); setVols(vs);
      } catch {
        if (cancelled) return;
        const { prices: ps, vols: vs } = simulateData(
          stock.ticker, range, stock.currentPrice,
          stock.dailyChangePct ?? 0, stock.low52 ?? null, stock.high52 ?? null
        );
        setPrices(ps); setVols(vs);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [stock.ticker, range, stock.currentPrice]);

  // ── Chart ──
  const chartContainer = useRef<HTMLDivElement>(null);
  const chartRef       = useRef<IChartApi|null>(null);
  const seriesRef      = useRef<any>(null);

  // Create chart once
  useEffect(() => {
    if (!chartContainer.current) return;

    const chart = createChart(chartContainer.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#555',
        fontSize: 11,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          width: 1,
          color: 'rgba(255,255,255,0.20)',
          style: LineStyle.Solid,
          labelVisible: false,
        },
        horzLine: { visible: false, labelVisible: false },
      },
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: { top: 0.08, bottom: 0.05 },
        textColor: '#555',
      },
      leftPriceScale: { visible: false },
      timeScale: {
        visible: true,
        borderVisible: false,
        ticksVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: { mouseWheel: false, pressedMouseMove: false },
      handleScale: false,
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#00d084',
      topColor: '#00d08444',
      bottomColor: '#00d08400',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: '#fff',
      crosshairMarkerBorderWidth: 2,
      crosshairMarkerBackgroundColor: '#00d084',
      priceLineVisible: false,
      lastValueVisible: false,
    } as any);

    chartRef.current  = chart;
    seriesRef.current = areaSeries;

    const ro = new ResizeObserver(() => {
      if (chartContainer.current && chartRef.current) {
        chartRef.current.applyOptions({
          width:  chartContainer.current.clientWidth,
          height: chartContainer.current.clientHeight,
        });
      }
    });
    ro.observe(chartContainer.current);

    return () => { ro.disconnect(); chart.remove(); chartRef.current = null; seriesRef.current = null; };
  }, []);

  // Update colors when accent changes
  useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.applyOptions({
      lineColor: accent,
      topColor: accent + '40',
      bottomColor: accent + '00',
      crosshairMarkerBackgroundColor: accent,
    });
  }, [accent]);

  // Feed data
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || prices.length === 0) return;
    seriesRef.current.setData(prices as any[]);
    chartRef.current.timeScale().fitContent();
  }, [prices]);

  // Crosshair handler
  useEffect(() => {
    if (!chartRef.current) return;
    const handler = (param: any) => {
      if (!param?.time || !seriesRef.current) {
        setHoverPrice(null); setHoverTime(null); setHoverIdx(null);
        return;
      }
      const price = param.seriesData?.get(seriesRef.current)?.value as number|undefined;
      if (price == null) return;

      setHoverPrice(price);

      // Find closest index in prices by timestamp
      const ts = param.time as number;
      let best = 0; let bestDiff = Infinity;
      prices.forEach((p, i) => { const d = Math.abs(p.time - ts); if (d < bestDiff) { bestDiff = d; best = i; } });
      setHoverIdx(best);
      setHoverTime(formatDate(ts, range));
    };
    chartRef.current.subscribeCrosshairMove(handler);
    return () => { chartRef.current?.unsubscribeCrosshairMove(handler); };
  }, [prices, range]);

  // Mock stats
  const mockOpen = stock.currentPrice / (1 + (stock.dailyChangePct ?? 0) / 100);
  const mockHigh = Math.max(stock.currentPrice, mockOpen) * 1.008;
  const mockLow  = Math.min(stock.currentPrice, mockOpen) * 0.992;
  const mockBeta = ((sym.charCodeAt(0) % 4) * 0.22 + 0.78).toFixed(2);
  const mockVol  = ((sym.split('').reduce((a,c) => a + c.charCodeAt(0), 0) % 5) + 1) * 8.42e6;
  const mockAvgVol = mockVol * (1.1 + (sym.charCodeAt(1) % 3) * 0.3);

  const stats = [
    { key: 'Open',    val: fmtC(mockOpen) },
    { key: 'High',    val: fmtC(mockHigh) },
    { key: 'Low',     val: fmtC(mockLow)  },
    { key: 'Vol',     val: fmtV(mockVol)  },
    { key: 'P/E',     val: stock.peRatio ? stock.peRatio.toFixed(1) : '—' },
    { key: 'Mkt Cap', val: fmtMktCap(stock.marketCap) },
    { key: '52W H',   val: fmtC(stock.high52 ?? mockHigh * 1.12) },
    { key: '52W L',   val: fmtC(stock.low52  ?? mockLow  * 0.88) },
    { key: 'Avg Vol', val: fmtV(mockAvgVol) },
    { key: 'Yield',   val: formatDividend(stock.dividend, stock.currentPrice) },
    { key: 'Beta',    val: mockBeta },
    { key: 'EPS',     val: stock.eps != null ? fmtC(stock.eps) : '—' },
  ];

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        padding: '10px',
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%', maxWidth: 920,
        height: '100%', maxHeight: 740,
        display: 'flex', flexDirection: 'column',
        background: '#0d0d0d',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 50px 120px rgba(0,0,0,0.95)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
      }}>

        {/* ══ TOP HEADER ══ */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '18px 22px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          {/* Left */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#f5f5f7', letterSpacing: -0.8 }}>{sym}</span>
              <span style={{ fontSize: 13, color: '#3a3a3c', fontWeight: 500 }}>{exchange} · {ccy}</span>
            </div>
            <div style={{ fontSize: 12, color: '#3a3a3c', marginTop: 2 }}>{stock.companyName}</div>
          </div>

          {/* Right: price + change */}
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#f5f5f7', letterSpacing: -1, lineHeight: 1 }}>
                {fmtP(displayPrice)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: displayColor }}>
                  {displayIsUp ? '▲' : '▼'} {fmtP(Math.abs(displayDiff))} ({displayIsUp ? '+' : ''}{displayPct.toFixed(2)}%)
                </span>
              </div>
              <div style={{ fontSize: 10, color: '#3a3a3c', marginTop: 2, textAlign: 'right' }}>
                {hoverTime ?? RANGE_CFG[range].label}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(255,255,255,0.07)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#888', flexShrink: 0, transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ══ TIMEFRAME PILLS ══ */}
        <div style={{
          display: 'flex', gap: 2,
          padding: '8px 16px',
          flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          {RANGES.map(r => {
            const active = range === r;
            return (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  padding: '5px 11px',
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  color: active ? accent : '#444',
                  background: active ? accent + '1a' : 'transparent',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                  letterSpacing: -0.2,
                  outline: 'none',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#888'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#444'; }}
              >
                {r}
              </button>
            );
          })}
        </div>

        {/* ══ CHART + VOLUME ══ */}
        <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#0d0d0d',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                border: `2.5px solid ${accent}`,
                borderTopColor: 'transparent',
                animation: 'lwspin 0.7s linear infinite',
              }} />
            </div>
          )}

          {/* Price chart */}
          <div ref={chartContainer} style={{ flex: '1 1 0', minHeight: 0, width: '100%' }} />

          {/* Volume bars */}
          <div style={{
            height: 56,
            padding: '0 54px 0 0',  /* align with right-price-scale width */
            flexShrink: 0,
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}>
            <VolumeBars vols={vols} hoverIdx={hoverIdx} accent={accent} />
          </div>
        </div>

        {/* ══ STATS GRID ══ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          {stats.map(({ key, val }, i) => (
            <div
              key={key}
              style={{
                padding: '10px 16px',
                borderBottom: i < 8 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                borderRight: (i % 4 !== 3) ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <div style={{ fontSize: 10, color: '#555', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>{key}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#d1d1d6', fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* ══ FOOTER ══ */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5,
          padding: '9px 20px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}>
          <a
            href={`https://finance.yahoo.com/quote/${sym}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: '#3a3a3c',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#888')}
            onMouseLeave={e => (e.currentTarget.style.color = '#3a3a3c')}
          >
            <ExternalLink size={11} />
            See More Data from Yahoo Finance
          </a>
        </div>

      </div>

      <style>{`
        @keyframes lwspin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
