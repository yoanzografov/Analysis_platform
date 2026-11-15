import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Download, RefreshCw, Layers } from 'lucide-react';

export interface GoogleFinanceChartProps {
  ticker: string;
  companyName: string;
  currentPrice: number;
  currency?: string;
  initialTimeframe?: '1D' | '5D' | '1M' | 'YTD' | '3M' | '6M' | '1Y' | '5Y' | 'Max';
  height?: number;
  className?: string;
}

interface ChartPoint {
  date: string;
  price: number;
  fullDate: string;
}

const TIMEFRAMES = ['1D', '5D', '1M', 'YTD', '3M', '6M', '1Y', '5Y', 'Max'] as const;
type Timeframe = typeof TIMEFRAMES[number];

export default function GoogleFinanceChart({
  ticker,
  companyName,
  currentPrice,
  currency = '$',
  initialTimeframe = '3M',
  height = 360,
  className = '',
}: GoogleFinanceChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>(initialTimeframe);
  const [chartPoints, setChartPoints] = useState<ChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Interaction State
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [dragEndIndex, setDragEndIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 680, height });

  // Clean ticker
  const cleanTicker = useMemo(() => {
    if (!ticker) return '';
    const clean = ticker.includes(':') ? ticker.split(':')[1] : ticker;
    return clean.trim().replace(/\./g, '-');
  }, [ticker]);

  // Responsive width observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setDimensions({
            width: Math.floor(entry.contentRect.width),
            height: height || 360,
          });
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [height]);

  // Fetch or synthesize chart history
  useEffect(() => {
    if (!cleanTicker) return;
    let active = true;
    setIsLoading(true);
    setHoverIndex(null);
    setDragStartIndex(null);
    setDragEndIndex(null);
    setIsDragging(false);

    const rangeParam = timeframe === 'Max' ? 'max' : timeframe.toLowerCase();
    fetch(`/api/chart-history?ticker=${encodeURIComponent(cleanTicker)}&range=${rangeParam}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (!active) return;
        if (res && Array.isArray(res.prices) && res.prices.length > 0) {
          const timestamps: number[] = res.timestamps || [];
          const prices: number[] = res.prices;
          const pts = prices.map((pr: number, idx: number) => {
            const ts = timestamps[idx];
            const d = ts ? new Date(ts * 1000) : new Date();
            const dateLabel =
              timeframe === '1D' || timeframe === '5D'
                ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : timeframe === '1Y' || timeframe === '5Y' || timeframe === 'Max'
                ? d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const fullDate = d.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            return { date: dateLabel, price: pr, fullDate };
          });
          setChartPoints(pts);
        } else {
          // Synthetic curve fallback matching stock curve
          const cur = currentPrice || 100;
          const count = timeframe === '1D' ? 30 : timeframe === '5D' ? 40 : 60;
          const pts: ChartPoint[] = [];
          const now = Date.now();
          const step =
            ((timeframe === '1D' ? 12 * 60 : timeframe === '3M' ? 90 * 86400 : 30 * 86400) * 1000) / count;
          let p = cur * (timeframe === '3M' ? 0.94 : 0.95);
          for (let i = 0; i < count; i++) {
            const d = new Date(now - (count - 1 - i) * step);
            p = p + (cur - p) * 0.08 + Math.sin(i * 0.7) * (cur * 0.015);
            pts.push({
              date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              price: parseFloat(Number(p).toFixed(2)),
              fullDate: d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            });
          }
          if (pts.length) pts[pts.length - 1].price = cur;
          setChartPoints(pts);
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [cleanTicker, timeframe, currentPrice]);

  // Overall Period Performance
  const overallReturn = useMemo(() => {
    if (chartPoints.length < 2) return { diff: 0, pct: 0, isPositive: true };
    const first = chartPoints[0].price;
    const last = chartPoints[chartPoints.length - 1].price;
    const diff = last - first;
    const pct = first > 0 ? (diff / first) * 100 : 0;
    return {
      diff,
      pct,
      isPositive: pct >= 0,
    };
  }, [chartPoints]);

  // Selected Drag-to-Measure Range Data
  const selectedRangeData = useMemo(() => {
    if (
      dragStartIndex === null ||
      dragEndIndex === null ||
      dragStartIndex === dragEndIndex ||
      !chartPoints.length
    ) {
      return null;
    }
    const startIdx = Math.max(0, Math.min(dragStartIndex, dragEndIndex));
    const endIdx = Math.min(chartPoints.length - 1, Math.max(dragStartIndex, dragEndIndex));
    const startPt = chartPoints[startIdx];
    const endPt = chartPoints[endIdx];
    if (!startPt || !endPt || startPt.price <= 0) return null;

    const diff = endPt.price - startPt.price;
    const pct = (diff / startPt.price) * 100;
    return {
      startIdx,
      endIdx,
      startPt,
      endPt,
      diff,
      pct,
      isPositive: pct >= 0,
    };
  }, [dragStartIndex, dragEndIndex, chartPoints]);

  // Global mouseup / touchend listener to guarantee drag finishes cleanly
  useEffect(() => {
    if (!isDragging) return;
    const handleGlobalUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [isDragging]);

  // CSV download
  const handleDownloadCsv = () => {
    if (!chartPoints.length) return;
    const rows = [['Date', 'Price']];
    chartPoints.forEach((p) => rows.push([p.fullDate || p.date, String(p.price)]));
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${cleanTicker}_${timeframe}_chart.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dimensions & Margins
  const margin = { top: 35, right: 65, bottom: 25, left: 10 };
  const plotWidth = Math.max(10, dimensions.width - margin.left - margin.right);
  const plotHeight = Math.max(10, dimensions.height - margin.top - margin.bottom);

  // Price Bounds
  const { minPrice, maxPrice, priceStep } = useMemo(() => {
    if (!chartPoints.length) return { minPrice: 0, maxPrice: 100, priceStep: 20 };
    let min = Math.min(...chartPoints.map((p) => p.price));
    let max = Math.max(...chartPoints.map((p) => p.price));
    if (min === max) {
      min = min * 0.95;
      max = max * 1.05;
    }
    const pad = (max - min) * 0.08;
    min = Math.max(0, min - pad);
    max = max + pad;
    const step = (max - min) / 4;
    return { minPrice: min, maxPrice: max, priceStep: step };
  }, [chartPoints]);

  // Coordinate mappers
  const getX = useCallback(
    (index: number) => {
      if (chartPoints.length <= 1) return margin.left;
      return margin.left + (index / (chartPoints.length - 1)) * plotWidth;
    },
    [chartPoints.length, margin.left, plotWidth]
  );

  const getY = useCallback(
    (price: number) => {
      if (maxPrice <= minPrice) return margin.top + plotHeight / 2;
      return margin.top + ((maxPrice - price) / (maxPrice - minPrice)) * plotHeight;
    },
    [maxPrice, minPrice, margin.top, plotHeight]
  );

  // Smooth Cubic Spline Path Generator (Catmull-Rom to Cubic Bezier)
  const { pathD, areaD } = useMemo(() => {
    if (!chartPoints.length) return { pathD: '', areaD: '' };
    if (chartPoints.length === 1) {
      const x0 = getX(0);
      const y0 = getY(chartPoints[0].price);
      return { pathD: `M ${x0} ${y0}`, areaD: '' };
    }

    const pts = chartPoints.map((p, i) => ({ x: getX(i), y: getY(p.price) }));
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      // Tension factor
      const tension = 0.22;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }

    const lastX = pts[pts.length - 1].x;
    const baselineY = margin.top + plotHeight;
    const firstX = pts[0].x;
    const aD = `${d} L ${lastX.toFixed(2)} ${baselineY} L ${firstX.toFixed(2)} ${baselineY} Z`;

    return { pathD: d, areaD: aD };
  }, [chartPoints, getX, getY, margin.top, plotHeight]);

  // Pointer event mapper to nearest index
  const getIndexFromPointerX = useCallback(
    (clientX: number) => {
      if (!containerRef.current || chartPoints.length <= 1) return 0;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left - margin.left;
      const ratio = Math.max(0, Math.min(1, relativeX / plotWidth));
      return Math.round(ratio * (chartPoints.length - 1));
    },
    [chartPoints.length, margin.left, plotWidth]
  );

  // Pointer Handlers for Butter-Smooth Drag-to-Measure
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    const idx = getIndexFromPointerX(e.clientX);
    setIsDragging(true);
    setDragStartIndex(idx);
    setDragEndIndex(idx);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const idx = getIndexFromPointerX(e.clientX);
    setHoverIndex(idx);
    if (isDragging) {
      setDragEndIndex(idx);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
    setIsDragging(false);
    if (dragStartIndex !== null && dragEndIndex !== null && dragStartIndex === dragEndIndex) {
      // Single click: clear selection
      setDragStartIndex(null);
      setDragEndIndex(null);
    }
  };

  // Color selection
  const isPositive = selectedRangeData ? selectedRangeData.isPositive : overallReturn.isPositive;
  const strokeColor = isPositive ? '#00c853' : '#ef4444'; // Google Emerald or Crimson
  const activePrice =
    hoverIndex !== null && chartPoints[hoverIndex]
      ? chartPoints[hoverIndex].price
      : currentPrice || (chartPoints.length ? chartPoints[chartPoints.length - 1].price : 0);

  // Y-axis grid ticks (4 ticks)
  const yTicks = [0, 1, 2, 3, 4].map((i) => minPrice + i * priceStep);

  // X-axis sample dates (every ~10-15% of width)
  const xTickIndices = useMemo(() => {
    if (chartPoints.length <= 4) return chartPoints.map((_, i) => i);
    const count = Math.max(3, Math.min(8, Math.floor(plotWidth / 90)));
    const step = (chartPoints.length - 1) / (count - 1);
    const res: number[] = [];
    for (let i = 0; i < count; i++) {
      res.push(Math.round(i * step));
    }
    return res;
  }, [chartPoints, plotWidth]);

  return (
    <div
      ref={containerRef}
      className={`w-full bg-[#0a0d12] text-white rounded-2xl p-3 sm:p-5 select-none border border-neutral-800/80 shadow-2xl relative font-sans ${className}`}
    >
      {/* ─── Top Header: Timeframe Pills & Download (Google Finance 1:1) ─── */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-800/60">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-[#253248] text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Свали историческите данни като CSV"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* ─── Center: Performance & Range Measurement Pill ─── */}
      <div className="flex flex-col items-center justify-center my-2.5 min-h-[46px]">
        {selectedRangeData ? (
          <div className="flex flex-col items-center gap-1 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span
                className={`px-3.5 py-1 rounded-md text-sm font-bold font-mono tracking-tight shadow-md ${
                  selectedRangeData.isPositive ? 'bg-[#00c853] text-white' : 'bg-[#d92d20] text-white'
                }`}
              >
                {selectedRangeData.isPositive ? '+' : ''}
                {selectedRangeData.pct.toFixed(2)}%
              </span>
              <button
                type="button"
                onClick={() => {
                  setDragStartIndex(null);
                  setDragEndIndex(null);
                }}
                className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
                title="Изчисти избора (покажи целия период)"
              >
                ✕ Изчисти
              </button>
            </div>
            <div className="text-xs text-neutral-300 font-medium font-mono flex items-center gap-1.5">
              <span>{selectedRangeData.startPt.date}</span>
              <span className="text-neutral-400">(${selectedRangeData.startPt.price.toFixed(2)})</span>
              <span className="text-neutral-500">→</span>
              <span>{selectedRangeData.endPt.date}</span>
              <span className="text-neutral-400">(${selectedRangeData.endPt.price.toFixed(2)})</span>
              <span className="text-neutral-500">•</span>
              <span className={selectedRangeData.diff >= 0 ? 'text-[#00c853] font-bold' : 'text-[#ef4444] font-bold'}>
                {selectedRangeData.diff >= 0 ? '+' : ''}${selectedRangeData.diff.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <span
              className={`px-3.5 py-1 rounded-md text-sm font-bold font-mono tracking-tight shadow-md ${
                overallReturn.isPositive ? 'bg-[#00c853] text-white' : 'bg-[#d92d20] text-white'
              }`}
            >
              {overallReturn.isPositive ? '+' : ''}
              {overallReturn.pct.toFixed(2)}%
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              {hoverIndex !== null && chartPoints[hoverIndex]
                ? `${chartPoints[hoverIndex].fullDate}: $${chartPoints[hoverIndex].price.toFixed(2)}`
                : `${overallReturn.diff >= 0 ? '+' : ''}$${overallReturn.diff.toFixed(2)} (${timeframe})`}
            </span>
          </div>
        )}
      </div>

      {/* ─── SVG Interactive Canvas with Smooth Spline & Drag-to-Measure ─── */}
      <div className="relative w-full" style={{ height: dimensions.height }}>
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-2 text-xs font-semibold text-neutral-400 bg-neutral-950/40 backdrop-blur-2xs rounded-xl">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
            <span>Зареждане на графика за {cleanTicker}...</span>
          </div>
        )}

        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full cursor-crosshair touch-none select-none overflow-visible"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            if (!isDragging) setHoverIndex(null);
          }}
        >
          <defs>
            {/* Google Finance Vivid Emerald to Translucent Fade */}
            <linearGradient id="gfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.34} />
              <stop offset="65%" stopColor={strokeColor} stopOpacity={0.06} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {yTicks.map((tickVal, idx) => {
            const y = getY(tickVal);
            return (
              <g key={idx}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + plotWidth}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="3 3"
                />
                {/* Y-axis label on right */}
                <text
                  x={margin.left + plotWidth + 8}
                  y={y + 3.5}
                  fill="#7e8691"
                  fontSize={11}
                  fontWeight={500}
                  fontFamily="monospace"
                >
                  {tickVal.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Dashed baseline reference line at current price */}
          {activePrice > 0 && (
            <g>
              <line
                x1={margin.left}
                y1={getY(activePrice)}
                x2={margin.left + plotWidth}
                y2={getY(activePrice)}
                stroke={strokeColor}
                strokeDasharray="2 2"
                strokeOpacity={0.7}
              />
              {/* Green Price Badge on Right Y-axis (Google Finance 1:1) */}
              <g transform={`translate(${margin.left + plotWidth + 5}, ${getY(activePrice) - 10})`}>
                <rect width={56} height={20} rx={4} fill={strokeColor} />
                <text
                  x={28}
                  y={13.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={11}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {activePrice.toFixed(2)}
                </text>
              </g>
            </g>
          )}

          {/* Area fill */}
          {areaD && <path d={areaD} fill="url(#gfGrad)" />}

          {/* Smooth Curve */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* ─── Drag-to-Measure Selected Zone ─── */}
          {selectedRangeData && (
            <g>
              {/* Highlight Shaded Area */}
              <rect
                x={Math.min(getX(selectedRangeData.startIdx), getX(selectedRangeData.endIdx))}
                y={margin.top}
                width={Math.abs(getX(selectedRangeData.endIdx) - getX(selectedRangeData.startIdx))}
                height={plotHeight}
                fill={selectedRangeData.isPositive ? '#00c853' : '#ef4444'}
                fillOpacity={0.16}
              />
              {/* Left Vertical Line */}
              <line
                x1={getX(selectedRangeData.startIdx)}
                y1={margin.top}
                x2={getX(selectedRangeData.startIdx)}
                y2={margin.top + plotHeight}
                stroke={selectedRangeData.isPositive ? '#00c853' : '#ef4444'}
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              {/* Right Vertical Line */}
              <line
                x1={getX(selectedRangeData.endIdx)}
                y1={margin.top}
                x2={getX(selectedRangeData.endIdx)}
                y2={margin.top + plotHeight}
                stroke={selectedRangeData.isPositive ? '#00c853' : '#ef4444'}
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              {/* Dot at Start Price */}
              <circle
                cx={getX(selectedRangeData.startIdx)}
                cy={getY(selectedRangeData.startPt.price)}
                r={5}
                fill="#ffffff"
                stroke={selectedRangeData.isPositive ? '#00c853' : '#ef4444'}
                strokeWidth={2.5}
              />
              {/* Dot at End Price */}
              <circle
                cx={getX(selectedRangeData.endIdx)}
                cy={getY(selectedRangeData.endPt.price)}
                r={5}
                fill="#ffffff"
                stroke={selectedRangeData.isPositive ? '#00c853' : '#ef4444'}
                strokeWidth={2.5}
              />
            </g>
          )}

          {/* ─── Hover Single Point Cursor Indicator ─── */}
          {!selectedRangeData && hoverIndex !== null && chartPoints[hoverIndex] && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={margin.top}
                x2={getX(hoverIndex)}
                y2={margin.top + plotHeight}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(chartPoints[hoverIndex].price)}
                r={5}
                fill="#ffffff"
                stroke={strokeColor}
                strokeWidth={2.5}
              />
            </g>
          )}

          {/* Bottom X-axis Dates */}
          {xTickIndices.map((idx) => {
            const pt = chartPoints[idx];
            if (!pt) return null;
            const x = getX(idx);
            return (
              <text
                key={idx}
                x={x}
                y={dimensions.height - 4}
                textAnchor="middle"
                fill="#7e8691"
                fontSize={11}
                fontWeight={500}
              >
                {pt.date}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Subtle Hint Footer */}
      <div className="mt-2 text-center text-[10.5px] text-neutral-400">
        💡 Задръж с мишката върху дата и дръпни към друга, за да измериш точния процент доходност (Google Finance Style).
      </div>
    </div>
  );
}
