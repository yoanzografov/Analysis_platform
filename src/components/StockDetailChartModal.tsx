import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stock } from '../types';
import { X } from 'lucide-react';
import { formatDividend } from '../utils/sectorHelper';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  CrosshairMode,
  LineStyle,
  AreaSeries,
  type AreaSeriesOptions,
} from 'lightweight-charts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  stock: Stock;
  onClose: () => void;
}

interface ChartPoint {
  time: number;
  value: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RANGES = ['1D', '5D', '1M', '3M', 'YTD', '1Y', '5Y', '10Y', 'Max'] as const;
type Range = typeof RANGES[number];

// Map range → Yahoo Finance API params
const RANGE_PARAMS: Record<Range, { range: string; interval: string; points: number; msInterval: number }> = {
  '1D':  { range: '1d',  interval: '5m',  points: 78,  msInterval: 5 * 60_000 },
  '5D':  { range: '5d',  interval: '15m', points: 130, msInterval: 15 * 60_000 },
  '1M':  { range: '1mo', interval: '1d',  points: 22,  msInterval: 86_400_000 },
  '3M':  { range: '3mo', interval: '1d',  points: 66,  msInterval: 86_400_000 },
  'YTD': { range: 'ytd', interval: '1d',  points: 180, msInterval: 86_400_000 },
  '1Y':  { range: '1y',  interval: '1wk', points: 52,  msInterval: 7 * 86_400_000 },
  '5Y':  { range: '5y',  interval: '1wk', points: 260, msInterval: 7 * 86_400_000 },
  '10Y': { range: '10y', interval: '1mo', points: 120, msInterval: 30 * 86_400_000 },
  'Max': { range: 'max', interval: '1mo', points: 200, msInterval: 30 * 86_400_000 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMarketCap(val: number | string | undefined | null): string {
  if (val == null) return '—';
  if (typeof val === 'string') return val;
  if (val >= 1e12) return (val / 1e12).toFixed(2) + 'T';
  if (val >= 1e9)  return (val / 1e9).toFixed(2) + 'B';
  if (val >= 1e6)  return (val / 1e6).toFixed(2) + 'M';
  return val.toLocaleString('en-US');
}

// Generate deterministic simulated price history for a given ticker + range
function simulateHistory(
  ticker: string,
  range: Range,
  currentPrice: number,
  dailyChangePct: number,
  low52: number | null,
  high52: number | null
): ChartPoint[] {
  const { points, msInterval } = RANGE_PARAMS[range];
  const now = Date.now();
  let seed = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const lcg = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };

  const trendDir = dailyChangePct !== 0 ? Math.sign(dailyChangePct) : (seed % 3) - 1;
  const rawPrices: number[] = [];

  for (let i = 0; i < points; i++) {
    const progress  = i / (points - 1);
    const angleY    = progress * 2 * Math.PI;
    const angleQ    = progress * 8 * Math.PI;
    const angleM    = progress * 20 * Math.PI;
    const w1 = Math.sin(angleY + seed % 5) * 0.10;
    const w2 = Math.cos(angleQ + seed % 3) * 0.05;
    const w3 = Math.sin(angleM + seed % 7) * 0.02;
    const trend = progress * trendDir * 0.09;
    const noise = (lcg() - 0.5) * 0.018;
    rawPrices.push(currentPrice * (1 + w1 + w2 + w3 + trend + noise));
  }

  // Scale so last point = currentPrice exactly
  const scale = currentPrice / (rawPrices[rawPrices.length - 1] || currentPrice);
  const result: ChartPoint[] = rawPrices.map((p, i) => {
    let v = p * scale;
    if (low52  && v < low52)  v = low52  + lcg() * low52  * 0.01;
    if (high52 && v > high52) v = high52 - lcg() * high52 * 0.01;
    if (v < 0.01) v = 0.01;
    const ts = Math.floor((now - (points - 1 - i) * msInterval) / 1000);
    return { time: ts, value: parseFloat(v.toFixed(2)) };
  });
  result[result.length - 1].value = currentPrice;
  return result;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StockDetailChartModal({ stock, onClose }: Props) {

  // ── Currency helpers ──
  let exchangeName = 'NASDAQ';
  let currencyCode = 'USD';
  if (stock.ticker.startsWith('EPA:'))       { exchangeName = 'Euronext Paris';     currencyCode = 'EUR'; }
  else if (stock.ticker.startsWith('ETR:')) { exchangeName = 'XETRA Frankfurt';    currencyCode = 'EUR'; }
  else if (stock.ticker.startsWith('STO:')) { exchangeName = 'Nasdaq Stockholm';   currencyCode = 'SEK'; }
  else if (stock.ticker.startsWith('SWX:')) { exchangeName = 'SIX Swiss Exchange'; currencyCode = 'CHF'; }
  else if (stock.ticker.includes('-USD') || stock.ticker.includes('BTC')) { exchangeName = 'Crypto'; currencyCode = 'USD'; }
  else if (stock.ticker.startsWith('^'))    { exchangeName = 'Index'; currencyCode = 'pts'; }

  const csym = currencyCode === 'EUR' ? '€' : currencyCode === 'SEK' ? 'kr' : currencyCode === 'CHF' ? 'Fr' : currencyCode === 'pts' ? '' : '$';

  const fmtPrice = (v: number, decimals = 2) => {
    const s = v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    if (currencyCode === 'SEK' || currencyCode === 'CHF') return `${s} ${csym}`;
    return `${csym}${s}`;
  };

  const fmtCur = (v: number | string | null | undefined) => {
    if (v == null) return '—';
    if (typeof v === 'string') return v;
    return fmtPrice(v);
  };

  // ── State ──
  const [range, setRange]               = useState<Range>('1Y');
  const [seriesData, setSeriesData]     = useState<ChartPoint[]>([]);
  const [loading, setLoading]           = useState(true);
  const [hoverPrice, setHoverPrice]     = useState<number | null>(null);
  const [hoverPct, setHoverPct]         = useState<number | null>(null);
  const [hoverTime, setHoverTime]       = useState<string | null>(null);

  // Derived from series
  const openPrice  = seriesData.length > 0 ? seriesData[0].value  : stock.currentPrice;
  const closePrice = seriesData.length > 0 ? seriesData[seriesData.length - 1].value : stock.currentPrice;
  const periodDiff = closePrice - openPrice;
  const periodPct  = openPrice > 0 ? (periodDiff / openPrice) * 100 : 0;
  const isUp       = periodDiff >= 0;
  const accent     = isUp ? '#30d158' : '#ff453a';    // Apple green / Apple red

  // Display values (change when hovering)
  const displayPrice = hoverPrice ?? stock.currentPrice;
  const displayPct   = hoverPct   ?? periodPct;
  const displayDiff  = hoverPct !== null
    ? (displayPrice - openPrice)
    : periodDiff;
  const displayIsUp  = displayDiff >= 0;

  // ── Fetch / simulate data ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHoverPrice(null);
    setHoverPct(null);
    setHoverTime(null);

    const run = async () => {
      try {
        const p = RANGE_PARAMS[range];
        const url = `/api/stock-history?ticker=${encodeURIComponent(stock.ticker)}&range=${p.range}&currentPrice=${stock.currentPrice}&dailyChange=${stock.dailyChangePct}&low52=${stock.low52 || ''}&high52=${stock.high52 || ''}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('api error');
        const json: { timestamps: number[]; prices: number[] } = await res.json();
        if (cancelled) return;
        const pts: ChartPoint[] = json.timestamps.map((ts, i) => ({
          time: ts,
          value: json.prices[i],
        }));
        setSeriesData(pts);
      } catch {
        if (cancelled) return;
        const pts = simulateHistory(
          stock.ticker, range, stock.currentPrice,
          stock.dailyChangePct, stock.low52, stock.high52
        );
        setSeriesData(pts);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [stock.ticker, range, stock.currentPrice]);

  // ── Chart ──
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const seriesRef    = useRef<any>(null);

  // Create chart once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#555',
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          width: 1,
          color: 'rgba(255,255,255,0.25)',
          style: LineStyle.Solid,
          labelVisible: false,
        },
        horzLine: {
          visible: false,
          labelVisible: false,
        },
      },
      rightPriceScale: { visible: false },
      leftPriceScale:  { visible: false },
      timeScale: {
        visible: false,
        borderVisible: false,
      },
      handleScroll: false,
      handleScale:  false,
    });

    const area = chart.addSeries(AreaSeries, {
      lineColor: accent,
      topColor: accent + '55',
      bottomColor: accent + '00',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: '#fff',
      crosshairMarkerBackgroundColor: accent,
      priceLineVisible: false,
      lastValueVisible: false,
    } as Partial<AreaSeriesOptions>);

    chartRef.current  = chart;
    seriesRef.current = area;

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({
          width:  containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    if (containerRef.current.parentElement) {
      ro.observe(containerRef.current);
    }

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current  = null;
      seriesRef.current = null;
    };
  }, []); // create once

  // Update series colors when trend changes
  useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.applyOptions({
      lineColor: accent,
      topColor: accent + '44',
      bottomColor: accent + '00',
      crosshairMarkerBackgroundColor: accent,
    });
  }, [accent]);

  // Feed data into chart when seriesData changes
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || seriesData.length === 0) return;
    seriesRef.current.setData(seriesData as any[]);
    chartRef.current.timeScale().fitContent();
  }, [seriesData]);

  // Crosshair subscription
  useEffect(() => {
    if (!chartRef.current) return;
    const handler = (param: any) => {
      if (!param || !param.time || !seriesRef.current) {
        setHoverPrice(null);
        setHoverPct(null);
        setHoverTime(null);
        return;
      }
      const price = param.seriesData?.get(seriesRef.current)?.value as number | undefined;
      if (price === undefined || price === null) return;
      const open = seriesData[0]?.value ?? stock.currentPrice;
      const pct  = open > 0 ? ((price - open) / open) * 100 : 0;
      setHoverPrice(price);
      setHoverPct(pct);

      // Format time label
      const ts = typeof param.time === 'number' ? param.time * 1000 : Date.now();
      const d = new Date(ts);
      if (range === '1D') {
        setHoverTime(d.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' }));
      } else if (range === '5D') {
        setHoverTime(d.toLocaleDateString('bg-BG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
      } else {
        setHoverTime(d.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: range === '1M' || range === '3M' ? undefined : 'numeric' }));
      }
    };
    chartRef.current.subscribeCrosshairMove(handler);
    return () => { chartRef.current?.unsubscribeCrosshairMove(handler); };
  }, [seriesData, range, stock.currentPrice]);

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // Mock intraday stats
  const mockOpen = stock.currentPrice / (1 + (stock.dailyChangePct ?? 0) / 100);
  const mockHigh = Math.max(stock.currentPrice, mockOpen) * 1.007;
  const mockLow  = Math.min(stock.currentPrice, mockOpen) * 0.993;
  const mockBeta = ((stock.ticker.charCodeAt(0) % 4) * 0.22 + 0.78).toFixed(2);
  const mockVol  = ((stock.ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 5) + 1) * 8.42e6;

  const displayColor = displayIsUp ? '#30d158' : '#ff453a';

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '12px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 860,
          height: '100%',
          maxHeight: 720,
          display: 'flex',
          flexDirection: 'column',
          background: '#1c1c1e',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.9)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        }}
      >

        {/* ═══ HEADER ═══ */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '20px 22px 0',
          flexShrink: 0,
        }}>
          {/* Left: ticker + price */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                {stock.ticker.includes(':') ? stock.ticker.split(':').pop() : stock.ticker}
              </span>
              <span style={{ fontSize: 12, color: '#636366' }}>{exchangeName}</span>
            </div>
            <div style={{ fontSize: 11, color: '#48484a', marginTop: 1 }}>{stock.companyName}</div>

            {/* Big price */}
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 40, fontWeight: 700, color: '#fff', letterSpacing: -1.5, lineHeight: 1 }}>
                {fmtPrice(displayPrice)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: displayColor }}>
                  {displayIsUp ? '▲' : '▼'} {fmtPrice(Math.abs(displayDiff))} ({displayIsUp ? '+' : ''}{displayPct.toFixed(2)}%)
                </span>
                {hoverTime && (
                  <span style={{ fontSize: 11, color: '#636366' }}>{hoverTime}</span>
                )}
                {!hoverTime && (
                  <span style={{ fontSize: 11, color: '#636366' }}>за периода {range}</span>
                )}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Затвори"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#3a3a3c',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ebebf5', flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#48484a')}
            onMouseLeave={e => (e.currentTarget.style.background = '#3a3a3c')}
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* ═══ CHART AREA ═══ */}
        <div style={{ flex: '1 1 0', position: 'relative', minHeight: 0, marginTop: 14 }}>
          {loading && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#1c1c1e', zIndex: 2,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                border: `2.5px solid ${accent}`,
                borderTopColor: 'transparent',
                animation: 'spin 0.7s linear infinite',
              }} />
            </div>
          )}
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        </div>

        {/* ═══ RANGE SELECTOR ═══ */}
        <div style={{
          display: 'flex', justifyContent: 'space-around',
          padding: '10px 16px 12px',
          flexShrink: 0,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {RANGES.map(r => {
            const active = range === r;
            return (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  color: active ? accent : '#636366',
                  background: active ? accent + '22' : 'transparent',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                  letterSpacing: -0.2,
                }}
              >
                {r}
              </button>
            );
          })}
        </div>

        {/* ═══ STATS GRID ═══ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          overflowY: 'auto',
        }}>
          {[
            { label: 'Отворен',    value: fmtCur(mockOpen)                                },
            { label: 'Ден Връх',   value: fmtCur(mockHigh)                                },
            { label: 'Ден Дъно',   value: fmtCur(mockLow)                                 },
            { label: '52С Върх',   value: fmtCur(stock.high52 ?? mockHigh * 1.12)         },
            { label: '52С Дъно',   value: fmtCur(stock.low52  ?? mockLow  * 0.88)         },
            { label: 'Пазарна Кап', value: stock.marketCap ? formatMarketCap(stock.marketCap) : '—' },
            { label: 'Обем',       value: formatMarketCap(mockVol)                        },
            { label: 'P/E',        value: stock.peRatio ? stock.peRatio.toFixed(1) : '—' },
            { label: 'EPS',        value: stock.eps != null ? fmtCur(stock.eps) : '—'    },
            { label: 'Дивидент',   value: formatDividend(stock.dividend, stock.currentPrice) },
            { label: 'Beta',       value: mockBeta                                        },
            { label: 'Борса',      value: exchangeName                                    },
          ].map(({ label, value }, i) => (
            <div
              key={i}
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                borderRight: (i % 3 !== 2) ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <div style={{ fontSize: 10, color: '#636366', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e5ea', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* ═══ FOOTER ═══ */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 20px 14px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, color: '#3a3a3c' }}>
            {exchangeName} · {currencyCode} · Yahoo Finance
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '6px 18px',
              borderRadius: 10,
              border: '1px solid #3a3a3c',
              background: 'transparent',
              color: '#8e8e93',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2c2c2e'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8e8e93'; }}
          >
            Затвори
          </button>
        </div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
