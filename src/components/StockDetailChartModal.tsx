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

// Business-day format for TradingView: 'YYYY-MM-DD'
interface PricePoint  { time: string; value: number; }
interface VolumePoint { time: string; value: number; color: string; }

// ─── Range config ─────────────────────────────────────────────────────────────

const RANGES = ['1D','1W','1M','3M','6M','YTD','1Y','2Y','5Y','10Y','MAX'] as const;
type Range = typeof RANGES[number];

const RANGE_CFG: Record<Range, { apiRange: string; points: number; msGap: number; label: string }> = {
  '1D':  { apiRange: '1d',  points: 78,  msGap: 5 * 60_000,       label: 'Today' },
  '1W':  { apiRange: '7d',  points: 35,  msGap: 4 * 3_600_000,    label: 'Past Week' },
  '1M':  { apiRange: '1mo', points: 22,  msGap: 86_400_000,       label: 'Past Month' },
  '3M':  { apiRange: '3mo', points: 66,  msGap: 86_400_000,       label: 'Past 3 Months' },
  '6M':  { apiRange: '6mo', points: 126, msGap: 86_400_000,       label: 'Past 6 Months' },
  'YTD': { apiRange: 'ytd', points: 160, msGap: 86_400_000,       label: 'Year to Date' },
  '1Y':  { apiRange: '1y',  points: 252, msGap: 86_400_000,       label: 'Past Year' },
  '2Y':  { apiRange: '2y',  points: 104, msGap: 7 * 86_400_000,   label: 'Past 2 Years' },
  '5Y':  { apiRange: '5y',  points: 260, msGap: 7 * 86_400_000,   label: 'Past 5 Years' },
  '10Y': { apiRange: '10y', points: 120, msGap: 30 * 86_400_000,  label: 'Past 10 Years' },
  'MAX': { apiRange: 'max', points: 200, msGap: 30 * 86_400_000,  label: 'All Time' },
};

// Apple-native palette
const NEON_GREEN   = '#30d158';   // Apple system green
const APPLE_RED    = '#ff3b30';   // Apple system red
const VOL_GRAY     = 'rgba(255,255,255,0.12)';

// ─── Date helper: ms timestamp → 'YYYY-MM-DD' ────────────────────────────────

function toDateStr(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// ─── Simulated historical data ────────────────────────────────────────────────

function generateHistory(
  ticker: string, range: Range, currentPrice: number,
  chgPct: number, lo52: number | null, hi52: number | null,
): { prices: PricePoint[]; volumes: VolumePoint[] } {
  const { points, msGap } = RANGE_CFG[range];
  const now = Date.now();
  let seed = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0) ^ (range.charCodeAt(0) * 37);
  const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0xffffffff; };

  const dir = chgPct !== 0 ? Math.sign(chgPct) : (seed % 3) - 1;
  const raw: number[] = [];

  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    raw.push(currentPrice * (1
      + Math.sin(t * 2 * Math.PI + seed % 5) * 0.10
      + Math.cos(t * 8 * Math.PI + seed % 3) * 0.05
      + Math.sin(t * 22 * Math.PI + seed % 7) * 0.02
      + t * dir * 0.10
      + (rng() - 0.5) * 0.020
    ));
  }

  const scale = currentPrice / (raw[raw.length - 1] || currentPrice);
  const prices:  PricePoint[]  = [];
  const volumes: VolumePoint[] = [];
  const baseVol = currentPrice * 3.5e6;

  // De-duplicate dates: for intraday ranges we still emit unique 'YYYY-MM-DD' per point
  // by adding i-offset days to spread them across unique keys for the chart
  const useFakeDaySpread = (range === '1D' || range === '1W');

  for (let i = 0; i < points; i++) {
    let v = raw[i] * scale;
    if (lo52 && v < lo52) v = lo52 + rng() * lo52 * 0.01;
    if (hi52 && v > hi52) v = hi52 - rng() * hi52 * 0.01;
    if (v < 0.01) v = 0.01;

    let ts: number;
    if (useFakeDaySpread) {
      // Spread intraday across unique calendar days so LW Charts doesn't merge them
      ts = now - (points - 1 - i) * 86_400_000;
    } else {
      ts = now - (points - 1 - i) * msGap;
    }

    const dateStr = toDateStr(ts);
    prices.push({ time: dateStr, value: +v.toFixed(2) });
    volumes.push({ time: dateStr, value: baseVol * (0.25 + rng() * 1.5), color: VOL_GRAY });
  }
  prices[prices.length - 1].value = currentPrice;
  return { prices, volumes };
}

// ─── Utility formatters ───────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StockDetailChartModal({ stock, onClose }: Props) {

  // ── Exchange / currency ──
  let exch = 'NASDAQ', ccy = 'USD';
  if (stock.ticker.startsWith('EPA:'))       { exch = 'Euronext Paris'; ccy = 'EUR'; }
  else if (stock.ticker.startsWith('ETR:')) { exch = 'XETRA';          ccy = 'EUR'; }
  else if (stock.ticker.startsWith('STO:')) { exch = 'Stockholm';      ccy = 'SEK'; }
  else if (stock.ticker.startsWith('SWX:')) { exch = 'SIX';            ccy = 'CHF'; }
  else if (stock.ticker.includes('BTC') || stock.ticker.includes('-USD')) { exch = 'Crypto'; }
  else if (stock.ticker.startsWith('^'))    { exch = 'Index'; ccy = 'pts'; }

  const cs = ccy === 'EUR' ? '€' : ccy === 'SEK' ? 'kr ' : ccy === 'CHF' ? 'CHF ' : ccy === 'pts' ? '' : '$';
  const fp = (v: number) => {
    const s = v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (ccy === 'SEK' || ccy === 'CHF') ? `${s} ${cs.trim()}` : `${cs}${s}`;
  };
  const fc = (v: number | string | null | undefined) => v == null ? '—' : typeof v === 'string' ? v : fp(v);
  const sym = stock.ticker.includes(':') ? stock.ticker.split(':').pop()! : stock.ticker;

  // ── State ──
  const [range, setRange]           = useState<Range>('5Y');
  const [prices, setPrices]         = useState<PricePoint[]>([]);
  const [volumes, setVolumes]       = useState<VolumePoint[]>([]);
  const [loading, setLoading]       = useState(true);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const [hoverDate, setHoverDate]   = useState<string | null>(null);

  // ── Derived ──
  const openP    = prices.length > 0 ? prices[0].value : stock.currentPrice;
  const closeP   = prices.length > 0 ? prices[prices.length - 1].value : stock.currentPrice;
  const pDiff    = closeP - openP;
  const pPct     = openP > 0 ? (pDiff / openP) * 100 : 0;
  const isUp     = pDiff >= 0;
  const accent   = isUp ? NEON_GREEN : APPLE_RED;

  const dPrice   = hoverPrice ?? stock.currentPrice;
  const dDiff    = dPrice - openP;
  const dPct     = openP > 0 ? (dDiff / openP) * 100 : 0;
  const dUp      = dDiff >= 0;
  const dCol     = dUp ? NEON_GREEN : APPLE_RED;

  // ── Escape key ──
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // ── Load data ──
  useEffect(() => {
    let dead = false;
    setLoading(true); setHoverPrice(null); setHoverDate(null);

    (async () => {
      try {
        const c = RANGE_CFG[range];
        const url = `/api/stock-history?ticker=${encodeURIComponent(stock.ticker)}&range=${c.apiRange}&currentPrice=${stock.currentPrice}&dailyChange=${stock.dailyChangePct ?? 0}&low52=${stock.low52 ?? ''}&high52=${stock.high52 ?? ''}`;
        const res = await fetch(url);
        if (!res.ok) throw 0;
        const j: { timestamps: number[]; prices: number[] } = await res.json();
        if (dead) return;
        // Convert unix timestamps to 'YYYY-MM-DD' business day format
        const ps: PricePoint[]  = j.timestamps.map((t, i) => ({ time: toDateStr(t * 1000), value: j.prices[i] }));
        const vs: VolumePoint[] = ps.map(p => ({
          time: p.time,
          value: stock.currentPrice * 3.5e6 * (0.25 + Math.random() * 1.5),
          color: VOL_GRAY,
        }));
        setPrices(ps); setVolumes(vs);
      } catch {
        if (dead) return;
        const d = generateHistory(stock.ticker, range, stock.currentPrice, stock.dailyChangePct ?? 0, stock.low52, stock.high52);
        setPrices(d.prices); setVolumes(d.volumes);
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => { dead = true; };
  }, [stock.ticker, range, stock.currentPrice]);

  // ── Chart refs ──
  const ctrRef   = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const areaRef  = useRef<any>(null);
  const volRef   = useRef<any>(null);

  // ── Create chart ONCE on mount ──
  useEffect(() => {
    if (!ctrRef.current) return;

    const chart = createChart(ctrRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: 'rgba(255,255,255,0.30)',
        fontSize: 10,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
      },
      // Disable all grid lines for Apple-clean look
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          width: 1,
          color: 'rgba(255,255,255,0.28)',
          style: LineStyle.Solid,
          labelVisible: false,
        },
        horzLine: { visible: false, labelVisible: false },
      },
      // Right price scale (matching screenshot: 316, 269, 221, 174 etc.)
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.3 },
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

    // ── Area series: price line + gradient fill ──
    const area = chart.addSeries(AreaSeries, {
      lineColor: NEON_GREEN,
      topColor: 'rgba(48, 209, 88, 0.35)',     // Semi-transparent green top fill
      bottomColor: 'rgba(48, 209, 88, 0.0)',    // Fades to transparent at bottom
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: '#ffffff',
      crosshairMarkerBorderWidth: 2,
      crosshairMarkerBackgroundColor: NEON_GREEN,
      priceLineVisible: false,
      lastValueVisible: false,
    } as any);

    // ── Histogram series: volume bars overlaid at bottom ──
    const vol = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol_overlay',
      lastValueVisible: false,
      priceLineVisible: false,
    } as any);

    // Pin volume bars to the bottom 20% of the chart area
    chart.priceScale('vol_overlay').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
      borderVisible: false,
      visible: false,
    });

    chartRef.current = chart;
    areaRef.current  = area;
    volRef.current   = vol;

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (ctrRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width:  ctrRef.current.clientWidth,
          height: ctrRef.current.clientHeight,
        });
      }
    });
    ro.observe(ctrRef.current);

    // Full cleanup on unmount
    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      areaRef.current  = null;
      volRef.current   = null;
    };
  }, []);

  // ── Update area colors when trend direction changes ──
  useEffect(() => {
    if (!areaRef.current) return;
    const green = accent === NEON_GREEN;
    areaRef.current.applyOptions({
      lineColor: accent,
      topColor:  green ? 'rgba(48,209,88,0.35)' : 'rgba(255,59,48,0.30)',
      bottomColor: green ? 'rgba(48,209,88,0.0)' : 'rgba(255,59,48,0.0)',
      crosshairMarkerBackgroundColor: accent,
    });
  }, [accent]);

  // ── Feed data into chart ──
  useEffect(() => {
    if (!areaRef.current || !volRef.current || !chartRef.current || prices.length === 0) return;
    areaRef.current.setData(prices as any[]);
    volRef.current.setData(volumes as any[]);
    chartRef.current.timeScale().fitContent();
  }, [prices, volumes]);

  // ── Crosshair: real-time hover updates ──
  useEffect(() => {
    if (!chartRef.current) return;
    const handler = (param: any) => {
      if (!param?.time || !areaRef.current) {
        // Mouse left chart — revert to latest price
        setHoverPrice(null);
        setHoverDate(null);
        return;
      }
      const p = param.seriesData?.get(areaRef.current)?.value as number | undefined;
      if (p == null) return;
      setHoverPrice(p);

      // Format the hovered date nicely
      const t = param.time;
      if (typeof t === 'string') {
        const d = new Date(t + 'T00:00:00');
        if (range === '1D' || range === '1W') {
          setHoverDate(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
        } else if (range === '1M' || range === '3M' || range === '6M') {
          setHoverDate(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        } else {
          setHoverDate(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
        }
      } else if (typeof t === 'object' && t.year) {
        setHoverDate(`${t.month}/${t.day}/${t.year}`);
      }
    };
    chartRef.current.subscribeCrosshairMove(handler);
    return () => { chartRef.current?.unsubscribeCrosshairMove(handler); };
  }, [prices, range]);

  // ── Mock stats ──
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

  const ff = '-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Helvetica Neue",sans-serif';

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
        padding: 8, fontFamily: ff,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 900,
        height: '100%', maxHeight: 740,
        display: 'flex', flexDirection: 'column',
        background: '#000',
        borderRadius: 16, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 60px 140px rgba(0,0,0,1)',
      }}>

        {/* ════════════ HEADER ════════════ */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '18px 22px 10px', flexShrink: 0,
        }}>
          {/* Left */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: -0.6 }}>{sym}</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{stock.companyName}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 1 }}>{exch} · {ccy}</div>
          </div>

          {/* Right: price + change + close */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 30, fontWeight: 700, color: '#fff',
                letterSpacing: -1.2, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
              }}>
                {fp(dPrice)}
              </div>
              <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                <span style={{
                  fontSize: 14, fontWeight: 600, color: dCol,
                  fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2,
                }}>
                  {dUp ? '+' : ''}{dPct.toFixed(2)}%
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, color: dCol, fontVariantNumeric: 'tabular-nums' }}>
                  ({dUp ? '+' : ''}{fp(Math.abs(dDiff))})
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 3, textAlign: 'right' }}>
                {hoverDate ?? RANGE_CFG[range].label}
              </div>
            </div>

            <button
              onClick={onClose} aria-label="Close"
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.10)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.55)', flexShrink: 0, marginTop: 2,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ════════════ TIMEFRAME PILLS ════════════ */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 2,
          padding: '4px 14px 8px', flexShrink: 0,
        }}>
          {RANGES.map(r => {
            const active = range === r;
            return (
              <button
                key={r} onClick={() => setRange(r)}
                style={{
                  padding: '4px 10px', borderRadius: 16,
                  border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: active ? 700 : 500,
                  letterSpacing: -0.1, fontFamily: ff, outline: 'none',
                  color: active ? '#fff' : 'rgba(255,255,255,0.30)',
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  transition: 'all .12s ease',
                }}
              >
                {r}
              </button>
            );
          })}
        </div>

        {/* ════════════ CHART (price + volume overlay) ════════════ */}
        <div style={{ flex: '1 1 0', minHeight: 0, position: 'relative' }}>
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000',
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

        {/* ════════════ SEPARATOR ════════════ */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

        {/* ════════════ STATS GRID (4 columns) ════════════ */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          flexShrink: 0, padding: '2px 0',
        }}>
          {stats.map(([key, val], i) => (
            <div key={key} style={{
              padding: '9px 16px',
              borderBottom: i < 8 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              borderRight: (i % 4 !== 3) ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div style={{
                fontSize: 10, color: 'rgba(255,255,255,0.28)',
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

        {/* ════════════ FOOTER ════════════ */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4,
          padding: '8px 20px 12px',
          borderTop: '1px solid rgba(255,255,255,0.04)', flexShrink: 0,
        }}>
          <a
            href={`https://finance.yahoo.com/quote/${encodeURIComponent(sym)}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: 'rgba(255,255,255,0.20)', textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.50)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.20)')}
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
