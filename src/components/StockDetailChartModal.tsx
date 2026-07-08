import React, { useState, useEffect, useRef } from 'react';
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
  HistogramSeries,
} from 'lightweight-charts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props { stock: Stock; onClose: () => void; }
interface PricePoint { time: number; value: number; }
interface VolPoint   { time: number; value: number; color: string; }

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
const APPLE_GREEN = '#34c759';
const APPLE_RED   = '#ff3b30';
const VOL_GRAY    = 'rgba(255,255,255,0.13)';

// ─── Simulation ───────────────────────────────────────────────────────────────

function simulate(
  ticker: string, range: Range, price: number,
  chg: number, lo52: number | null, hi52: number | null
): { prices: PricePoint[]; vols: VolPoint[] } {
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
  const prices: PricePoint[] = [];
  const vols:   VolPoint[]   = [];
  const baseV = price * 4e6;

  for (let i = 0; i < points; i++) {
    let v = raw[i] * scale;
    if (lo52 && v < lo52) v = lo52 + rng() * lo52 * 0.01;
    if (hi52 && v > hi52) v = hi52 - rng() * hi52 * 0.01;
    if (v < 0.01) v = 0.01;
    const ts = Math.floor((now - (points - 1 - i) * ms) / 1000);
    prices.push({ time: ts, value: +v.toFixed(2) });
    vols.push({ time: ts, value: baseV * (0.3 + rng() * 1.4), color: VOL_GRAY });
  }
  prices[prices.length - 1].value = price;
  return { prices, vols };
}

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
  const [range, setRange]           = useState<Range>('5Y');
  const [prices, setPrices]         = useState<PricePoint[]>([]);
  const [vols, setVols]             = useState<VolPoint[]>([]);
  const [loading, setLoading]       = useState(true);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const [hoverTime, setHoverTime]   = useState<string | null>(null);

  // Derived
  const openP    = prices.length > 0 ? prices[0].value : stock.currentPrice;
  const closeP   = prices.length > 0 ? prices[prices.length - 1].value : stock.currentPrice;
  const pDiff    = closeP - openP;
  const pPct     = openP > 0 ? (pDiff / openP) * 100 : 0;
  const isUp     = pDiff >= 0;
  const accent   = isUp ? APPLE_GREEN : APPLE_RED;

  // Display (updates on hover)
  const dPrice = hoverPrice ?? stock.currentPrice;
  const dDiff  = dPrice - openP;
  const dPct   = openP > 0 ? (dDiff / openP) * 100 : 0;
  const dUp    = dDiff >= 0;
  const dCol   = dUp ? APPLE_GREEN : APPLE_RED;

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // Load data
  useEffect(() => {
    let dead = false;
    setLoading(true); setHoverPrice(null); setHoverTime(null);

    (async () => {
      try {
        const c = RANGE_CFG[range];
        const url = `/api/stock-history?ticker=${encodeURIComponent(stock.ticker)}&range=${c.apiRange}&currentPrice=${stock.currentPrice}&dailyChange=${stock.dailyChangePct ?? 0}&low52=${stock.low52 ?? ''}&high52=${stock.high52 ?? ''}`;
        const res = await fetch(url);
        if (!res.ok) throw 0;
        const j: { timestamps: number[]; prices: number[] } = await res.json();
        if (dead) return;
        const ps = j.timestamps.map((t, i) => ({ time: t, value: j.prices[i] }));
        const vs = ps.map((p, i) => ({
          time: p.time,
          value: stock.currentPrice * 4e6 * (0.3 + Math.random() * 1.4),
          color: VOL_GRAY,
        }));
        setPrices(ps); setVols(vs);
      } catch {
        if (dead) return;
        const d = simulate(stock.ticker, range, stock.currentPrice, stock.dailyChangePct ?? 0, stock.low52, stock.high52);
        setPrices(d.prices); setVols(d.vols);
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => { dead = true; };
  }, [stock.ticker, range, stock.currentPrice]);

  // Chart refs
  const ctrRef    = useRef<HTMLDivElement>(null);
  const chartRef  = useRef<IChartApi | null>(null);
  const areaRef   = useRef<any>(null);
  const volRef    = useRef<any>(null);

  // Create chart ONCE
  useEffect(() => {
    if (!ctrRef.current) return;

    const chart = createChart(ctrRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: 'rgba(255,255,255,0.35)',
        fontSize: 10,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
      },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          width: 1,
          color: 'rgba(255,255,255,0.30)',
          style: LineStyle.Solid,
          labelVisible: false,
        },
        horzLine: { visible: false, labelVisible: false },
      },
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: { top: 0.06, bottom: 0.18 },
        entireTextOnly: true,
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

    // Area series (price line + gradient)
    const area = chart.addSeries(AreaSeries, {
      lineColor: APPLE_GREEN,
      topColor: 'rgba(52, 199, 89, 0.28)',
      bottomColor: 'rgba(52, 199, 89, 0.0)',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4.5,
      crosshairMarkerBorderColor: '#ffffff',
      crosshairMarkerBorderWidth: 2,
      crosshairMarkerBackgroundColor: APPLE_GREEN,
      priceLineVisible: false,
      lastValueVisible: false,
    } as any);

    // Histogram series (volume bars)
    const vol = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
      lastValueVisible: false,
      priceLineVisible: false,
    } as any);

    chart.priceScale('vol').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
      borderVisible: false,
      visible: false,
    });

    chartRef.current = chart;
    areaRef.current  = area;
    volRef.current   = vol;

    // Resize
    const ro = new ResizeObserver(() => {
      if (ctrRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: ctrRef.current.clientWidth,
          height: ctrRef.current.clientHeight,
        });
      }
    });
    ro.observe(ctrRef.current);

    return () => { ro.disconnect(); chart.remove(); chartRef.current = null; areaRef.current = null; volRef.current = null; };
  }, []);

  // Update area colors when trend changes
  useEffect(() => {
    if (!areaRef.current) return;
    areaRef.current.applyOptions({
      lineColor: accent,
      topColor: accent === APPLE_GREEN ? 'rgba(52,199,89,0.28)' : 'rgba(255,59,48,0.28)',
      bottomColor: accent === APPLE_GREEN ? 'rgba(52,199,89,0.0)' : 'rgba(255,59,48,0.0)',
      crosshairMarkerBackgroundColor: accent,
    });
  }, [accent]);

  // Feed data
  useEffect(() => {
    if (!areaRef.current || !volRef.current || !chartRef.current || prices.length === 0) return;
    areaRef.current.setData(prices as any[]);
    volRef.current.setData(vols as any[]);
    chartRef.current.timeScale().fitContent();
  }, [prices, vols]);

  // Crosshair
  useEffect(() => {
    if (!chartRef.current) return;
    const handler = (param: any) => {
      if (!param?.time || !areaRef.current) {
        setHoverPrice(null); setHoverTime(null); return;
      }
      const p = param.seriesData?.get(areaRef.current)?.value as number | undefined;
      if (p == null) return;
      setHoverPrice(p);
      setHoverTime(fmtDate(param.time as number, range));
    };
    chartRef.current.subscribeCrosshairMove(handler);
    return () => { chartRef.current?.unsubscribeCrosshairMove(handler); };
  }, [prices, range]);

  // Stats data
  const mOpen = stock.currentPrice / (1 + (stock.dailyChangePct ?? 0) / 100);
  const mHigh = Math.max(stock.currentPrice, mOpen) * 1.008;
  const mLow  = Math.min(stock.currentPrice, mOpen) * 0.992;
  const beta  = ((sym.charCodeAt(0) % 4) * 0.22 + 0.78).toFixed(2);
  const vol   = ((sym.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 5) + 1) * 8.42e6;
  const avgV  = vol * 1.15;

  const stats: [string, string][] = [
    ['Open',    fc(mOpen)],
    ['High',    fc(mHigh)],
    ['Low',     fc(mLow)],
    ['Vol',     fmtVol(vol)],
    ['P/E',     stock.peRatio ? stock.peRatio.toFixed(1) : '—'],
    ['Mkt Cap', fmtMC(stock.marketCap)],
    ['52W H',   fc(stock.high52 ?? mHigh * 1.12)],
    ['52W L',   fc(stock.low52 ?? mLow * 0.88)],
    ['Avg Vol', fmtVol(avgV)],
    ['Yield',   formatDividend(stock.dividend, stock.currentPrice)],
    ['Beta',    beta],
    ['EPS',     stock.eps != null ? fc(stock.eps) : '—'],
  ];

  // ─── Apple Stocks font family constant ──
  const ff = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif';

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
        padding: 8,
        fontFamily: ff,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 880,
        height: '100%', maxHeight: 720,
        display: 'flex', flexDirection: 'column',
        background: '#000',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 60px 140px rgba(0,0,0,1)',
      }}>

        {/* ═══════════ HEADER ═══════════ */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '16px 20px 8px',
          flexShrink: 0,
        }}>
          {/* Left: ticker + name */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>
                {sym}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 1, fontWeight: 400 }}>
              {stock.companyName}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>
              {exch} · {ccy}
            </div>
          </div>

          {/* Right: price + change + close */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 28, fontWeight: 700, color: '#fff',
                letterSpacing: -1.2, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
              }}>
                {fp(dPrice)}
              </div>
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                <span style={{
                  fontSize: 14, fontWeight: 600, color: dCol,
                  letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums',
                }}>
                  {dUp ? '+' : ''}{dPct.toFixed(2)}%
                </span>
                <span style={{
                  fontSize: 13, fontWeight: 500, color: dCol,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  ({dUp ? '+' : ''}{fp(Math.abs(dDiff))})
                </span>
              </div>
              <div style={{
                fontSize: 11, color: 'rgba(255,255,255,0.25)',
                marginTop: 3, textAlign: 'right',
              }}>
                {hoverTime ?? RANGE_CFG[range].label}
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.10)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.55)', flexShrink: 0,
                marginTop: 2,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ═══════════ CHART ═══════════ */}
        <div style={{ flex: '1 1 0', minHeight: 0, position: 'relative' }}>
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#000',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                border: `2px solid ${accent}`, borderTopColor: 'transparent',
                animation: 'apSpin .65s linear infinite',
              }} />
            </div>
          )}
          <div ref={ctrRef} style={{ width: '100%', height: '100%' }} />
        </div>

        {/* ═══════════ PERIOD PILLS ═══════════ */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 2,
          padding: '6px 12px 8px',
          flexShrink: 0,
        }}>
          {RANGES.map(r => {
            const active = range === r;
            return (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 16,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  letterSpacing: -0.1,
                  fontFamily: ff,
                  // Apple pill: active = subtle gray bg, white text. Inactive = transparent, dim text.
                  color: active ? '#fff' : 'rgba(255,255,255,0.35)',
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  transition: 'all .12s ease',
                  outline: 'none',
                }}
              >
                {r}
              </button>
            );
          })}
        </div>

        {/* ═══════════ SEPARATOR ═══════════ */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

        {/* ═══════════ STATS GRID ═══════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          flexShrink: 0,
          padding: '2px 0',
        }}>
          {stats.map(([key, val], i) => (
            <div key={key} style={{
              padding: '9px 16px',
              borderBottom: i < 8 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              borderRight: (i % 4 !== 3) ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div style={{
                fontSize: 10, color: 'rgba(255,255,255,0.30)',
                marginBottom: 2, textTransform: 'uppercase',
                letterSpacing: 0.5, fontWeight: 600,
              }}>
                {key}
              </div>
              <div style={{
                fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
                fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2,
              }}>
                {val}
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════ FOOTER ═══════════ */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4,
          padding: '8px 20px 12px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0,
        }}>
          <a
            href={`https://finance.yahoo.com/quote/${encodeURIComponent(sym)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: 'rgba(255,255,255,0.22)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.50)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}
          >
            <ExternalLink size={10} />
            See More Data from Yahoo Finance
          </a>
        </div>

      </div>

      <style>{`@keyframes apSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
