import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Download, RefreshCw } from 'lucide-react';

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

const TIMEFRAMES = [
  { id: '1D', label: '1D' },
  { id: '5D', label: '5D' },
  { id: '1M', label: '1M' },
  { id: 'YTD', label: 'YTD' },
  { id: '3M', label: '3M' },
  { id: '6M', label: '6M' },
  { id: '1Y', label: '1Y' },
  { id: '5Y', label: '5Y' },
  { id: 'Max', label: 'Max' },
] as const;

type TimeframeId = typeof TIMEFRAMES[number]['id'];

export default function GoogleFinanceChart({
  ticker,
  companyName,
  currentPrice,
  currency = 'USD',
  initialTimeframe = '1D',
  height = 250,
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
  const [dimensions, setDimensions] = useState({ width: 500, height });

  // Clean ticker (preserve exchange suffixes & convert EXCHANGE:TICKER prefixes for Yahoo Finance)
  const cleanTicker = useMemo(() => {
    if (!ticker) return '';
    const upper = ticker.trim().toUpperCase();
    if (upper.includes(':')) {
      const [prefix, rawSym] = upper.split(':');
      const sym = (rawSym || '').trim();
      if (prefix === 'ETR' && (sym === 'DHL' || sym === 'DPW')) return 'DPW.DE';
      const prefixToSuffix: Record<string, string> = {
        ETR: '.DE', XETRA: '.DE', FRA: '.F', EPA: '.PA', PAR: '.PA',
        AMS: '.AS', BIT: '.MI', MIL: '.MI', BME: '.MC', EBR: '.BR',
        VIE: '.VI', LIS: '.LS', HEL: '.HE', LON: '.L', LSE: '.L',
        SWX: '.SW', SIX: '.SW', STO: '.ST', BUL: '.SO', BSE: '.SO',
        SOF: '.SO', TYO: '.T', TSE: '.T', HKG: '.HK', KRX: '.KS',
        KOSDAQ: '.KQ', ASX: '.AX', TSX: '.TO', SGX: '.SI',
      };
      if (prefixToSuffix[prefix]) {
        return sym.includes('.') ? sym : `${sym}${prefixToSuffix[prefix]}`;
      }
      return sym.replace(/\./g, '-');
    }
    if (upper === 'VU') return 'VU.PA';
    if (/\.[A-Z]{2,4}$/.test(upper) || /\.(L|F|T|V)$/.test(upper)) {
      return upper;
    }
    return upper.replace(/\./g, '-');
  }, [ticker]);

  // Responsive width observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setDimensions({
            width: Math.floor(entry.contentRect.width),
            height: height || 250,
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
    setChartPoints([]);
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
              timeframe === '1D'
                ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                : timeframe === '5D'
                ? d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' })
                : timeframe === '1Y' || timeframe === '5Y' || timeframe === 'Max'
                ? d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const fullDate =
              timeframe === '1D' || timeframe === '5D'
                ? d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
                : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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

  // Dimensions & Margins (Y-axis on RIGHT matching the screenshot)
  const margin = { top: 18, right: 54, bottom: 22, left: 6 };
  const plotWidth = Math.max(10, dimensions.width - margin.left - margin.right);
  const plotHeight = Math.max(10, dimensions.height - margin.top - margin.bottom);

  // Price Bounds
  const { minPrice, maxPrice, priceStep } = useMemo(() => {
    if (!chartPoints.length) return { minPrice: 0, maxPrice: 100, priceStep: 20 };
    let min = Math.min(...chartPoints.map((p) => p.price));
    let max = Math.max(...chartPoints.map((p) => p.price));
    if (min === max) {
      min = min * 0.98;
      max = max * 1.02;
    }
    const pad = (max - min) * 0.08;
    min = Math.max(0, min - pad);
    max = max + pad;
    const step = (max - min) / 5;
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
  const strokeColor = isPositive ? '#10b981' : '#ef4444'; // Emerald / Rose
  const activePrice = currentPrice || (chartPoints.length ? chartPoints[chartPoints.length - 1].price : 0);
  const activePoint = hoverIndex !== null && chartPoints[hoverIndex] ? chartPoints[hoverIndex] : null;

  // Y-axis grid ticks (5-6 ticks)
  const yTicks = [0, 1, 2, 3, 4, 5].map((i) => minPrice + i * priceStep);

  // X-axis sample dates (every ~80-100px)
  const xTickIndices = useMemo(() => {
    if (chartPoints.length <= 3) return chartPoints.map((_, i) => i);
    const count = Math.max(2, Math.min(5, Math.floor(plotWidth / 85)));
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
      className={`w-full flex flex-col justify-between select-none relative font-sans ${className}`}
    >
      {/* ─── Top Header: Timeframe Pills & Download (StockAnalysis 1:1) ─── */}
      <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-border/70">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => setTimeframe(tf.id)}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                timeframe === tf.id
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold shadow-2xs'
                  : 'text-ink-muted hover:text-ink hover:bg-card-hover'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Subtle Range / Performance Display */}
          {selectedRangeData ? (
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold">
              <span className={`px-1.5 py-0.5 rounded ${selectedRangeData.isPositive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                {selectedRangeData.isPositive ? '+' : ''}{selectedRangeData.pct.toFixed(2)}%
              </span>
              <button
                type="button"
                onClick={() => {
                  setDragStartIndex(null);
                  setDragEndIndex(null);
                }}
                className="text-[10px] text-ink-muted hover:text-ink cursor-pointer ml-0.5"
                title="Изчисти"
              >
                ✕
              </button>
            </span>
          ) : (
            <span className={`text-[11px] font-mono font-bold ${overallReturn.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {overallReturn.isPositive ? '+' : ''}{overallReturn.pct.toFixed(2)}%
            </span>
          )}

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="p-1 rounded text-ink-faint hover:text-ink hover:bg-card-hover transition-colors cursor-pointer"
            title="Свали историческите данни като CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── SVG Interactive Canvas (Exact Height, Right Y-Axis, Clean Lines) ─── */}
      <div className="relative w-full" style={{ height: dimensions.height }}>
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-2 text-xs font-semibold text-ink-faint bg-card/60 backdrop-blur-2xs rounded-lg">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Зареждане на графика...</span>
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
            {/* Subtle Gradient Fade */}
            <linearGradient id="saGradReal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.22} />
              <stop offset="80%" stopColor={strokeColor} stopOpacity={0.03} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Thin Horizontal Grid Lines (StockAnalysis Style) */}
          {yTicks.map((tickVal, idx) => {
            const y = getY(tickVal);
            return (
              <g key={idx}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + plotWidth}
                  y2={y}
                  stroke="currentColor"
                  className="text-border/60"
                  strokeDasharray="2 2"
                />
                {/* Y-axis label on RIGHT (StockAnalysis Style) */}
                <text
                  x={margin.left + plotWidth + 6}
                  y={y + 3.5}
                  fill="currentColor"
                  className="text-ink-faint"
                  fontSize={10.5}
                  fontWeight={500}
                  fontFamily="monospace"
                >
                  {tickVal.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Thin Bottom Baseline separating plot from X-axis dates */}
          <line
            x1={margin.left}
            y1={margin.top + plotHeight}
            x2={margin.left + plotWidth}
            y2={margin.top + plotHeight}
            stroke="currentColor"
            className="text-border/80"
          />

          {/* Dashed baseline reference line at active price */}
          {activePrice > 0 && (
            <g>
              <line
                x1={margin.left}
                y1={getY(activePrice)}
                x2={margin.left + plotWidth}
                y2={getY(activePrice)}
                stroke={strokeColor}
                strokeDasharray="2 2"
                strokeOpacity={0.8}
              />
              {/* Green Price Badge on Right Y-axis (StockAnalysis 1:1) */}
              <g transform={`translate(${margin.left + plotWidth + 4}, ${getY(activePrice) - 9})`}>
                <rect width={50} height={18} rx={3} fill={strokeColor} />
                <text
                  x={25}
                  y={12.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={10}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {activePrice.toFixed(2)}
                </text>
              </g>
            </g>
          )}

          {/* Area fill */}
          {areaD && <path d={areaD} fill="url(#saGradReal)" />}

          {/* Real Price Movement Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth={1.8}
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
                fill={selectedRangeData.isPositive ? '#10b981' : '#ef4444'}
                fillOpacity={0.16}
              />
              {/* Left Vertical Line */}
              <line
                x1={getX(selectedRangeData.startIdx)}
                y1={margin.top}
                x2={getX(selectedRangeData.startIdx)}
                y2={margin.top + plotHeight}
                stroke={selectedRangeData.isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={1.5}
                strokeDasharray="2 2"
              />
              {/* Right Vertical Line */}
              <line
                x1={getX(selectedRangeData.endIdx)}
                y1={margin.top}
                x2={getX(selectedRangeData.endIdx)}
                y2={margin.top + plotHeight}
                stroke={selectedRangeData.isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={1.5}
                strokeDasharray="2 2"
              />
              {/* Dot at Start Price */}
              <circle
                cx={getX(selectedRangeData.startIdx)}
                cy={getY(selectedRangeData.startPt.price)}
                r={4}
                fill="#ffffff"
                stroke={selectedRangeData.isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={2}
              />
              {/* Dot at End Price */}
              <circle
                cx={getX(selectedRangeData.endIdx)}
                cy={getY(selectedRangeData.endPt.price)}
                r={4}
                fill="#ffffff"
                stroke={selectedRangeData.isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={2}
              />
            </g>
          )}

          {/* ─── Hover Single Point Cursor Indicator (StockAnalysis 1:1) ─── */}
          {!selectedRangeData && activePoint && hoverIndex !== null && (
            <g>
              {/* Dotted Vertical Guide Line */}
              <line
                x1={getX(hoverIndex)}
                y1={margin.top}
                x2={getX(hoverIndex)}
                y2={margin.top + plotHeight}
                stroke="currentColor"
                className="text-ink-muted/60"
                strokeDasharray="2 2"
              />

              {/* Dot on the Line */}
              <circle
                cx={getX(hoverIndex)}
                cy={getY(activePoint.price)}
                r={4}
                fill="#ffffff"
                stroke={strokeColor}
                strokeWidth={2}
              />

              {/* Tooltip Card: e.g. "Nov 13, 2026, 2:19 PM EST" */}
              {(() => {
                const xPos = getX(hoverIndex);
                const isRightSide = xPos > dimensions.width - 150;
                const cardX = isRightSide ? xPos - 145 : xPos + 10;
                const cardY = margin.top - 5;

                return (
                  <g transform={`translate(${cardX}, ${cardY})`}>
                    <rect
                      width={140}
                      height={24}
                      rx={4}
                      fill="#1f2937"
                      stroke="rgba(255, 255, 255, 0.15)"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))"
                    />
                    <text x={70} y={16} textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight={600} fontFamily="sans-serif">
                      {activePoint.fullDate}
                    </text>
                  </g>
                );
              })()}
            </g>
          )}

          {/* Bottom X-axis Dates/Times */}
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
                fill="currentColor"
                className="text-ink-faint"
                fontSize={10.5}
                fontWeight={500}
              >
                {pt.date}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
