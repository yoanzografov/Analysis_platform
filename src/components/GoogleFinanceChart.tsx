import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Download, RefreshCw } from 'lucide-react';

export interface GoogleFinanceChartProps {
  ticker: string;
  companyName: string;
  currentPrice: number;
  currency?: string;
  initialTimeframe?: '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'Max';
  height?: number;
  className?: string;
}

interface ChartPoint {
  date: string;
  price: number;
  fullDate: string;
}

const TIMEFRAMES = [
  { id: '1D', label: '1 д.' },
  { id: '5D', label: '5 д.' },
  { id: '1M', label: '1 м.' },
  { id: '6M', label: '6 м.' },
  { id: 'YTD', label: 'ОНГД' },
  { id: '1Y', label: '1 г.' },
  { id: '5Y', label: '5 г.' },
  { id: 'Max', label: 'Макс' },
] as const;

type TimeframeId = typeof TIMEFRAMES[number]['id'];

export default function GoogleFinanceChart({
  ticker,
  companyName,
  currentPrice,
  currency = 'USD',
  initialTimeframe = '1Y',
  height = 360,
  className = '',
}: GoogleFinanceChartProps) {
  const [timeframe, setTimeframe] = useState<TimeframeId>(initialTimeframe);
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

  // Fetch real historical data from /api/stock-history
  useEffect(() => {
    if (!cleanTicker) return;
    let active = true;
    setIsLoading(true);
    setHoverIndex(null);
    setDragStartIndex(null);
    setDragEndIndex(null);
    setIsDragging(false);

    const rangeParam = timeframe === 'Max' ? 'max' : timeframe.toLowerCase();
    const queryPrice = currentPrice ? `&currentPrice=${encodeURIComponent(String(currentPrice))}` : '';

    fetch(`/api/stock-history?ticker=${encodeURIComponent(cleanTicker)}&range=${rangeParam}${queryPrice}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (!active) return;
        if (res && Array.isArray(res.prices) && res.prices.length > 0) {
          const timestamps: number[] = res.timestamps || [];
          const prices: number[] = res.prices;
          const pts: ChartPoint[] = [];

          for (let idx = 0; idx < prices.length; idx++) {
            const pr = prices[idx];
            if (pr == null || isNaN(pr)) continue;
            const ts = timestamps[idx];
            const d = ts ? new Date(ts * 1000) : new Date();

            const dateLabel =
              timeframe === '1D' || timeframe === '5D'
                ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : timeframe === '1Y' || timeframe === '5Y' || timeframe === 'Max'
                ? d.toLocaleDateString('bg-BG', { month: 'short', year: '2-digit' })
                : d.toLocaleDateString('bg-BG', { month: 'short', day: 'numeric' });

            const fullDate = d.toLocaleDateString('bg-BG', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }) + ' г.';

            pts.push({ date: dateLabel, price: pr, fullDate });
          }

          if (pts.length > 0) {
            setChartPoints(pts);
          }
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

  // Dimensions & Margins (Y-axis on left like Google Finance)
  const margin = { top: 40, right: 25, bottom: 25, left: 45 };
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

  // Real Market Price Path (crisp lines connecting real quotes)
  const { pathD, areaD } = useMemo(() => {
    if (!chartPoints.length) return { pathD: '', areaD: '' };
    if (chartPoints.length === 1) {
      const x0 = getX(0);
      const y0 = getY(chartPoints[0].price);
      return { pathD: `M ${x0} ${y0}`, areaD: '' };
    }

    const pts = chartPoints.map((p, i) => ({ x: getX(i), y: getY(p.price) }));
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;

    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)}`;
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
      // Single click: clear range selection
      setDragStartIndex(null);
      setDragEndIndex(null);
    }
  };

  // Color selection
  const isPositive = selectedRangeData ? selectedRangeData.isPositive : overallReturn.isPositive;
  const strokeColor = isPositive ? '#34a853' : '#ea4335'; // Google Green (#34a853) / Google Red (#ea4335)
  const activePoint = hoverIndex !== null && chartPoints[hoverIndex] ? chartPoints[hoverIndex] : null;

  // Y-axis grid ticks (4 ticks)
  const yTicks = [0, 1, 2, 3, 4].map((i) => minPrice + i * priceStep);

  // X-axis sample dates (every ~12-15% of width)
  const xTickIndices = useMemo(() => {
    if (chartPoints.length <= 4) return chartPoints.map((_, i) => i);
    const count = Math.max(3, Math.min(7, Math.floor(plotWidth / 100)));
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
      className={`w-full bg-[#171a21] text-white rounded-2xl p-3 sm:p-5 select-none border border-[#2b313d] shadow-2xl relative font-sans ${className}`}
    >
      {/* ─── Top Header: Timeframe Bar with Dividers (Exact Google Finance 1:1) ─── */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#2b313d]">
        <div className="flex items-center gap-1 sm:gap-2.5 overflow-x-auto scrollbar-none text-xs sm:text-[13px]">
          {TIMEFRAMES.map((tf, i) => (
            <React.Fragment key={tf.id}>
              <button
                type="button"
                onClick={() => setTimeframe(tf.id)}
                className={`px-1.5 py-1 transition-all cursor-pointer whitespace-nowrap font-medium ${
                  timeframe === tf.id
                    ? 'text-white font-bold border-b-2 border-sky-400'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
              {i < TIMEFRAMES.length - 1 && (
                <span className="text-neutral-700 select-none">|</span>
              )}
            </React.Fragment>
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
      <div className="flex flex-col items-center justify-center my-2.5 min-h-[44px]">
        {selectedRangeData ? (
          <div className="flex flex-col items-center gap-1 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span
                className={`px-3.5 py-1 rounded-md text-sm font-bold font-mono tracking-tight shadow-md ${
                  selectedRangeData.isPositive ? 'bg-[#34a853] text-white' : 'bg-[#ea4335] text-white'
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
              <span className={selectedRangeData.diff >= 0 ? 'text-[#34a853] font-bold' : 'text-[#ea4335] font-bold'}>
                {selectedRangeData.diff >= 0 ? '+' : ''}${selectedRangeData.diff.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <span
              className={`px-3.5 py-1 rounded-md text-sm font-bold font-mono tracking-tight shadow-md ${
                overallReturn.isPositive ? 'bg-[#34a853] text-white' : 'bg-[#ea4335] text-white'
              }`}
            >
              {overallReturn.isPositive ? '+' : ''}
              {overallReturn.pct.toFixed(2)}%
            </span>
            <span className="text-xs text-neutral-400 font-medium font-mono">
              {overallReturn.diff >= 0 ? '+' : ''}${overallReturn.diff.toFixed(2)} ({timeframe})
            </span>
          </div>
        )}
      </div>

      {/* ─── SVG Interactive Canvas with Google Finance Price Curve & Drag-to-Measure ─── */}
      <div className="relative w-full" style={{ height: dimensions.height }}>
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-2 text-xs font-semibold text-neutral-400 bg-neutral-950/40 backdrop-blur-2xs rounded-xl">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
            <span>Зареждане на реална борсова история за {cleanTicker}...</span>
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
            <linearGradient id="gfGradReal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.28} />
              <stop offset="70%" stopColor={strokeColor} stopOpacity={0.04} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines with labels on LEFT (Google Finance 1:1) */}
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
                />
                {/* Y-axis label on left */}
                <text
                  x={margin.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#7e8691"
                  fontSize={11}
                  fontWeight={500}
                  fontFamily="monospace"
                >
                  {Math.round(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {areaD && <path d={areaD} fill="url(#gfGradReal)" />}

          {/* Real Price Movement Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth={2.2}
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
                fill={selectedRangeData.isPositive ? '#34a853' : '#ea4335'}
                fillOpacity={0.16}
              />
              {/* Left Vertical Line */}
              <line
                x1={getX(selectedRangeData.startIdx)}
                y1={margin.top}
                x2={getX(selectedRangeData.startIdx)}
                y2={margin.top + plotHeight}
                stroke={selectedRangeData.isPositive ? '#34a853' : '#ea4335'}
                strokeWidth={1.5}
                strokeDasharray="2 2"
              />
              {/* Right Vertical Line */}
              <line
                x1={getX(selectedRangeData.endIdx)}
                y1={margin.top}
                x2={getX(selectedRangeData.endIdx)}
                y2={margin.top + plotHeight}
                stroke={selectedRangeData.isPositive ? '#34a853' : '#ea4335'}
                strokeWidth={1.5}
                strokeDasharray="2 2"
              />
              {/* Dot at Start Price */}
              <circle
                cx={getX(selectedRangeData.startIdx)}
                cy={getY(selectedRangeData.startPt.price)}
                r={4.5}
                fill="#ffffff"
                stroke={selectedRangeData.isPositive ? '#34a853' : '#ea4335'}
                strokeWidth={2.5}
              />
              {/* Dot at End Price */}
              <circle
                cx={getX(selectedRangeData.endIdx)}
                cy={getY(selectedRangeData.endPt.price)}
                r={4.5}
                fill="#ffffff"
                stroke={selectedRangeData.isPositive ? '#34a853' : '#ea4335'}
                strokeWidth={2.5}
              />
            </g>
          )}

          {/* ─── Hover Single Point Cursor Indicator (Google Finance 1:1) ─── */}
          {!selectedRangeData && activePoint && hoverIndex !== null && (
            <g>
              {/* Dotted Vertical Guide Line */}
              <line
                x1={getX(hoverIndex)}
                y1={margin.top}
                x2={getX(hoverIndex)}
                y2={margin.top + plotHeight}
                stroke="rgba(255, 255, 255, 0.45)"
                strokeDasharray="2 2"
              />

              {/* Glowing Dot on the Line */}
              <circle
                cx={getX(hoverIndex)}
                cy={getY(activePoint.price)}
                r={5}
                fill="#93e6a8"
                stroke="#171a21"
                strokeWidth={2}
              />

              {/* Tooltip Card: e.g. "248,04 USD  23.01.2026 г." */}
              {(() => {
                const xPos = getX(hoverIndex);
                const isRightSide = xPos > dimensions.width - 180;
                const cardX = isRightSide ? xPos - 195 : xPos + 10;
                const cardY = margin.top + 5;
                const priceFormatted = activePoint.price.toLocaleString('bg-BG', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });

                return (
                  <g transform={`translate(${cardX}, ${cardY})`}>
                    <rect
                      width={185}
                      height={32}
                      rx={6}
                      fill="#1e222b"
                      stroke="rgba(255, 255, 255, 0.15)"
                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                    />
                    <text x={10} y={20} fill="#ffffff" fontSize={12} fontWeight="bold" fontFamily="monospace">
                      {priceFormatted} {currency}
                    </text>
                    <text x={115} y={20} fill="#9ca3af" fontSize={11} fontWeight={500}>
                      {activePoint.fullDate}
                    </text>
                  </g>
                );
              })()}
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
