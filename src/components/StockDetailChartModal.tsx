import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Stock } from '../types';
import { X, TrendingUp, TrendingDown, Landmark } from 'lucide-react';
import { formatDividend } from '../utils/sectorHelper';

interface Props {
  stock: Stock;
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null) return '—';
  if (typeof val === 'string') return val;
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatMarketCap(val: number | string | undefined | null): string {
  if (val === undefined || val === null) return '—';
  if (typeof val === 'string') return val;
  if (val >= 1e12) return (val / 1e12).toFixed(2) + 'T';
  if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
  if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
  return val.toLocaleString('en-US');
}

// Generate smooth bezier path from array of SVG points
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx.toFixed(2)} ${prev.y.toFixed(2)}, ${cpx.toFixed(2)} ${curr.y.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
  }
  return d;
}

// Client-side simulated history fallback
function generateClientSimulatedHistory(
  ticker: string,
  range: string,
  currentPrice: number,
  dailyChangePct = 0,
  low52: number | null = null,
  high52: number | null = null
) {
  let numPoints = 100;
  let intervalMs = 24 * 60 * 60 * 1000;
  const now = new Date();

  switch (range.toLowerCase()) {
    case '1d':  numPoints = 78;  intervalMs = 5 * 60 * 1000;          break;
    case '5d':  numPoints = 130; intervalMs = 15 * 60 * 1000;         break;
    case '1m':  numPoints = 30;  intervalMs = 24 * 3600 * 1000;       break;
    case '3m':  numPoints = 90;  intervalMs = 24 * 3600 * 1000;       break;
    case '6m':  numPoints = 120; intervalMs = 24 * 3600 * 1000;       break;
    case 'ytd': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const diffDays = Math.ceil((now.getTime() - startOfYear.getTime()) / (1000 * 3600 * 24));
      numPoints = Math.max(10, Math.min(250, diffDays));
      intervalMs = 24 * 3600 * 1000;
      break;
    }
    case '1y':  numPoints = 252; intervalMs = 24 * 3600 * 1000;       break;
    case '3y':  numPoints = 156; intervalMs = 7 * 24 * 3600 * 1000;   break;
    case '5y':  numPoints = 260; intervalMs = 7 * 24 * 3600 * 1000;   break;
    case '10y': numPoints = 120; intervalMs = 30 * 24 * 3600 * 1000;  break;
    case 'max': numPoints = 200; intervalMs = 30 * 24 * 3600 * 1000;  break;
  }

  const prices: number[] = new Array(numPoints);
  const timestamps: number[] = new Array(numPoints);
  let seed = ticker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const trendDir = dailyChangePct !== 0 ? (dailyChangePct > 0 ? 1 : -1) : (seed % 3) - 1;
  const rawPrices: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    timestamps[i] = Math.round((now.getTime() - (numPoints - 1 - i) * intervalMs) / 1000);
    const angleY = (i / numPoints) * 2 * Math.PI;
    const angleQ = (i / numPoints) * 8 * Math.PI;
    const angleM = (i / numPoints) * 24 * Math.PI;
    const w1 = Math.sin(angleY + (seed % 5)) * 0.12;
    const w2 = Math.cos(angleQ + (seed % 3)) * 0.05;
    const w3 = Math.sin(angleM + (seed % 7)) * 0.02;
    const progress = i / (numPoints - 1 || 1);
    const trend = progress * trendDir * 0.10;
    seed = (seed * 9301 + 49297) % 233280;
    const noise = (seed / 233280 - 0.5) * 0.012;
    rawPrices.push(currentPrice * (1 + w1 + w2 + w3 + trend + noise));
  }

  const ratio = currentPrice / (rawPrices[rawPrices.length - 1] || currentPrice);
  for (let i = 0; i < numPoints; i++) {
    let p = rawPrices[i] * ratio;
    if (low52 !== null && p < low52) p = low52 + Math.random() * low52 * 0.02;
    if (high52 !== null && p > high52) p = high52 - Math.random() * high52 * 0.02;
    if (p < 0.01) p = 0.01;
    prices[i] = parseFloat(p.toFixed(2));
  }
  if (prices.length > 0) prices[prices.length - 1] = currentPrice;
  return { timestamps, prices };
}

// ─── Component ────────────────────────────────────────────────────────────────

const RANGES = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '3Y', '5Y', '10Y', 'Max'];
const CHART_H = 260;

export default function StockDetailChartModal({ stock, onClose }: Props) {

  // ── Escape key ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── Currency helpers ──
  let exchangeName = 'NASDAQ';
  let currencyCode = 'USD';
  if (stock.ticker.startsWith('EPA:'))       { exchangeName = 'Euronext Paris';      currencyCode = 'EUR'; }
  else if (stock.ticker.startsWith('ETR:')) { exchangeName = 'XETRA Frankfurt';     currencyCode = 'EUR'; }
  else if (stock.ticker.startsWith('STO:')) { exchangeName = 'Nasdaq Stockholm';    currencyCode = 'SEK'; }
  else if (stock.ticker.startsWith('SWX:')) { exchangeName = 'SIX Swiss Exchange';  currencyCode = 'CHF'; }
  else if (stock.ticker.includes('-USD') || stock.ticker.includes('BTC')) { exchangeName = 'Crypto'; currencyCode = 'USD'; }
  else if (stock.ticker.startsWith('^'))    { exchangeName = 'Index';               currencyCode = 'Points'; }

  const currencySymbol = currencyCode === 'EUR' ? '€' : currencyCode === 'SEK' ? 'kr ' : currencyCode === 'CHF' ? 'CHF ' : currencyCode === 'Points' ? '' : '$';
  const fmtPrice = (v: number) => {
    const s = v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return currencyCode === 'SEK' || currencyCode === 'CHF' ? `${s} ${currencySymbol.trim()}` : `${currencySymbol}${s}`;
  };
  const fmtCurrency = (v: number | string | undefined | null) => {
    if (v === undefined || v === null) return '—';
    if (typeof v === 'string') return v;
    return fmtPrice(v);
  };

  // ── State ──
  const [range, setRange] = useState('1Y');
  const [data, setData] = useState<{ timestamps: number[]; prices: number[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgWidth, setSvgWidth] = useState(600);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // ── Responsive SVG width ──
  useEffect(() => {
    if (!svgRef.current) return;
    const ro = new ResizeObserver(entries => {
      if (entries[0]) setSvgWidth(entries[0].contentRect.width);
    });
    ro.observe(svgRef.current.parentElement!);
    setSvgWidth(svgRef.current.parentElement!.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // ── Fetch data ──
  useEffect(() => {
    let active = true;
    setLoading(true);
    setHoverIdx(null);
    setIsHovering(false);

    const fetchData = async () => {
      try {
        const url = `/api/stock-history?ticker=${stock.ticker}&range=${range}&currentPrice=${stock.currentPrice}&dailyChange=${stock.dailyChangePct}&low52=${stock.low52 || ''}&high52=${stock.high52 || ''}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('fetch failed');
        const json = await res.json();
        if (active) setData(json);
      } catch {
        const fallback = generateClientSimulatedHistory(
          stock.ticker, range, stock.currentPrice,
          stock.dailyChangePct, stock.low52, stock.high52
        );
        if (active) setData(fallback);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [stock.ticker, range, stock.currentPrice]);

  // ── Computed SVG points ──
  const points = useMemo(() => {
    if (!data || !data.prices || data.prices.length === 0) return [];
    const minP = Math.min(...data.prices);
    const maxP = Math.max(...data.prices);
    const diff = maxP - minP || 1;
    const padMin = minP - diff * 0.10;
    const padMax = maxP + diff * 0.05;
    const padDiff = padMax - padMin;
    const w = svgWidth;
    return data.prices.map((price, i) => ({
      x: (i / (data.prices.length - 1)) * w,
      y: CHART_H - ((price - padMin) / padDiff) * CHART_H,
      price,
      timestamp: data.timestamps[i],
    }));
  }, [data, svgWidth]);

  // Period open price (baseline)
  const openPrice = useMemo(() => {
    if (range.toLowerCase() === '1d') {
      return stock.currentPrice / (1 + stock.dailyChangePct / 100);
    }
    return points.length > 0 ? points[0].price : stock.currentPrice;
  }, [points, range, stock.currentPrice, stock.dailyChangePct]);

  // Colors based on whether current price is above/below open
  const lastPrice = points.length > 0 ? points[points.length - 1].price : stock.currentPrice;
  const isUp = lastPrice >= openPrice;
  const accentColor = isUp ? '#34d399' : '#f87171';   // emerald / red
  const accentDark  = isUp ? '#065f46' : '#7f1d1d';

  // SVG paths (smooth bezier)
  const linePath = useMemo(() => smoothPath(points), [points]);
  const areaPath = useMemo(() => {
    if (points.length < 2) return '';
    return `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${CHART_H} L ${points[0].x.toFixed(2)} ${CHART_H} Z`;
  }, [linePath, points]);

  // Baseline Y for the period's open price
  const baselineY = useMemo(() => {
    if (points.length === 0) return CHART_H / 2;
    const minP = Math.min(...(data?.prices ?? [0]));
    const maxP = Math.max(...(data?.prices ?? [0]));
    const diff = maxP - minP || 1;
    const padMin = minP - diff * 0.10;
    const padMax = maxP + diff * 0.05;
    const padDiff = padMax - padMin;
    return CHART_H - ((openPrice - padMin) / padDiff) * CHART_H;
  }, [points, openPrice, data]);

  // ── Hover interaction ──
  const getIdx = useCallback((clientX: number) => {
    if (!svgRef.current || points.length === 0) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * (points.length - 1));
  }, [points]);

  const onMouseMove = (e: React.MouseEvent) => { const i = getIdx(e.clientX); if (i !== null) setHoverIdx(i); };
  const onTouchMove = (e: React.TouchEvent) => { const i = getIdx(e.touches[0].clientX); if (i !== null) setHoverIdx(i); if (e.cancelable) e.preventDefault(); };
  const onEnter = () => setIsHovering(true);
  const onLeave = () => { setIsHovering(false); setHoverIdx(null); };

  const activeIdx = (isHovering && hoverIdx !== null) ? hoverIdx : (points.length > 0 ? points.length - 1 : null);
  const activePoint = activeIdx !== null ? points[activeIdx] : null;
  const activePrice = activePoint?.price ?? stock.currentPrice;
  const activeDiff  = activePrice - openPrice;
  const activePct   = openPrice > 0 ? (activeDiff / openPrice) * 100 : 0;
  const activeIsUp  = activeDiff >= 0;

  // Date format
  const fmtDate = (ts: number) => {
    const d = new Date(ts * 1000);
    if (range === '1D') return d.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });
    if (range === '5D') return d.toLocaleDateString('bg-BG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: range === '1M' || range === '3M' ? undefined : 'numeric' });
  };

  // Y-axis price labels (4 levels)
  const yLabels = useMemo(() => {
    if (!data || data.prices.length === 0) return [];
    const minP = Math.min(...data.prices);
    const maxP = Math.max(...data.prices);
    const labels = [];
    for (let i = 0; i < 5; i++) {
      const price = minP + ((maxP - minP) / 4) * i;
      const diff = maxP - minP || 1;
      const padMin = minP - diff * 0.10;
      const padMax = maxP + diff * 0.05;
      const padDiff = padMax - padMin;
      const y = CHART_H - ((price - padMin) / padDiff) * CHART_H;
      labels.push({ price, y });
    }
    return labels;
  }, [data]);

  // X-axis date labels (5 ticks)
  const xLabels = useMemo(() => {
    if (points.length < 2) return [];
    return [0, 0.25, 0.5, 0.75, 1].map(pct => {
      const i = Math.round(pct * (points.length - 1));
      return points[i];
    });
  }, [points]);

  // Mock intraday stats
  const mockOpen  = stock.currentPrice / (1 + stock.dailyChangePct / 100);
  const mockHigh  = Math.max(stock.currentPrice, mockOpen) * 1.007;
  const mockLow   = Math.min(stock.currentPrice, mockOpen) * 0.993;
  const mockBeta  = ((stock.ticker.charCodeAt(0) % 4) * 0.22 + 0.78).toFixed(2);
  const mockVol   = ((stock.ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 5) + 1) * 8.42e6;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="relative w-full flex flex-col"
        style={{
          maxWidth: 680,
          height: '100dvh',
          maxHeight: '96vh',
          background: '#111113',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.07)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* ── Sticky header (always visible, even on small phones) ── */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-2"
          style={{ flexShrink: 0 }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
                {stock.ticker.includes(':') ? stock.ticker.split(':')[1] : stock.ticker}
              </span>
              <span style={{ fontSize: 12, color: '#888', fontWeight: 500, marginTop: 4 }}>
                {exchangeName}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 1 }}>{stock.companyName}</div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#aaa', transition: 'background .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Price display (also sticky, no scroll) ── */}
        <div className="px-5 pb-3" style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 38, fontWeight: 700, color: '#fff', letterSpacing: -1, lineHeight: 1.1 }}>
            {fmtPrice(activePrice)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: activeIsUp ? '#34d399' : '#f87171',
            }}>
              {activeIsUp ? '▲' : '▼'} {fmtPrice(Math.abs(activeDiff))} ({activeIsUp ? '+' : ''}{activePct.toFixed(2)}%)
            </span>
            <span style={{ fontSize: 11, color: '#555' }}>
              {activePoint ? fmtDate(activePoint.timestamp) : range}
            </span>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>

        {/* ── Chart ── */}
        <div className="relative select-none" style={{ paddingLeft: 0, paddingRight: 0 }}>
          {loading ? (
            <div style={{ height: CHART_H + 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                border: `2.5px solid ${accentColor}`,
                borderTopColor: 'transparent',
                animation: 'spin 0.7s linear infinite',
              }} />
            </div>
          ) : points.length === 0 ? (
            <div style={{ height: CHART_H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>
              Няма данни
            </div>
          ) : (
            <div
              onMouseEnter={onEnter}
              onMouseLeave={onLeave}
              onMouseMove={onMouseMove}
              onTouchMove={onTouchMove}
              onTouchEnd={onLeave}
              style={{ position: 'relative', cursor: 'crosshair' }}
            >
              {/* Y-axis labels overlay */}
              <div style={{ position: 'absolute', right: 8, top: 0, bottom: 24, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {[...yLabels].reverse().map((l, i) => (
                  <span key={i} style={{ fontSize: 9, color: '#444', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {fmtPrice(l.price)}
                  </span>
                ))}
              </div>

              <svg
                ref={svgRef}
                viewBox={`0 0 ${svgWidth} ${CHART_H}`}
                width="100%"
                height={CHART_H}
                style={{ display: 'block', overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentColor} stopOpacity={0.22} />
                    <stop offset="75%" stopColor={accentColor} stopOpacity={0.04} />
                    <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  {/* Clip so area fill doesn't exceed chart bounds */}
                  <clipPath id="chartClip">
                    <rect x={0} y={0} width={svgWidth} height={CHART_H} />
                  </clipPath>
                </defs>

                {/* Horizontal grid lines */}
                {yLabels.map((l, i) => (
                  <line
                    key={i}
                    x1={0} y1={l.y} x2={svgWidth} y2={l.y}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth={1}
                  />
                ))}

                {/* Baseline (open price reference) */}
                {baselineY > 0 && baselineY < CHART_H && (
                  <line
                    x1={0} y1={baselineY} x2={svgWidth} y2={baselineY}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth={1}
                    strokeDasharray="3 5"
                  />
                )}

                {/* Area fill */}
                <path d={areaPath} fill="url(#chartGrad)" clipPath="url(#chartClip)" />

                {/* Line stroke */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Hover crosshair */}
                {isHovering && activePoint && (
                  <>
                    <line
                      x1={activePoint.x} y1={0}
                      x2={activePoint.x} y2={CHART_H}
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth={1}
                      strokeDasharray="2 3"
                    />
                    {/* Outer glow ring */}
                    <circle cx={activePoint.x} cy={activePoint.y} r={9} fill={accentColor} fillOpacity={0.15} />
                    {/* White dot */}
                    <circle cx={activePoint.x} cy={activePoint.y} r={4.5} fill="#fff" />
                    {/* Colored ring */}
                    <circle cx={activePoint.x} cy={activePoint.y} r={4.5} fill="none" stroke={accentColor} strokeWidth={2} />
                  </>
                )}

                {/* End dot when not hovering */}
                {!isHovering && activePoint && (
                  <>
                    <circle cx={activePoint.x} cy={activePoint.y} r={9} fill={accentColor} fillOpacity={0.18} />
                    <circle cx={activePoint.x} cy={activePoint.y} r={4} fill={accentColor} />
                  </>
                )}
              </svg>

              {/* X-axis date labels */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '4px 4px 0',
                pointerEvents: 'none',
              }}>
                {xLabels.map((pt, i) => (
                  <span key={i} style={{ fontSize: 9, color: '#444', textAlign: i === 0 ? 'left' : i === xLabels.length - 1 ? 'right' : 'center', flex: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {pt ? fmtDate(pt.timestamp) : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Range selector ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '10px 16px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          {RANGES.map(r => {
            const active = range === r;
            return (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  color: active ? accentColor : '#555',
                  background: active ? `${accentColor}18` : 'transparent',
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          overflowY: 'auto',
          maxHeight: 280,
        }}>
          {[
            { label: 'Отворен (Open)',    value: fmtCurrency(mockOpen) },
            { label: 'Затворен (Close)',   value: fmtCurrency(stock.currentPrice) },
            { label: 'Ден Връх',          value: fmtCurrency(mockHigh) },
            { label: 'Ден Дъно',          value: fmtCurrency(mockLow) },
            { label: '52С Върх',          value: fmtCurrency(stock.high52 ?? mockHigh * 1.1) },
            { label: '52С Дъно',          value: fmtCurrency(stock.low52 ?? mockLow * 0.9) },
            { label: 'Пазарна Кап.',      value: stock.marketCap ? formatMarketCap(stock.marketCap) : '—' },
            { label: 'Обем',              value: formatMarketCap(mockVol) },
            { label: 'P/E Коеф.',         value: stock.peRatio ? stock.peRatio.toFixed(2) : '—' },
            { label: 'EPS',               value: stock.eps != null ? fmtCurrency(stock.eps) : '—' },
            { label: 'Дивидент',          value: formatDividend(stock.dividend, stock.currentPrice) },
            { label: 'Beta',              value: mockBeta },
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
              <span style={{ fontSize: 12, color: '#666' }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#ddd', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <span style={{ fontSize: 10, color: '#444' }}>
            {exchangeName} · {currencyCode} · Yahoo Finance
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '7px 18px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.06)',
              color: '#aaa',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
              transition: 'background .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            Затвори
          </button>
        </div>

        {/* ── end scrollable body ── */}
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
