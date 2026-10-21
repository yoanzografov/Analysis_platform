import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MarketIndex } from '../types';
import { X, ExternalLink, RefreshCw } from 'lucide-react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';
import { getTradingViewSymbol } from '../utils/tvSymbolMap';

interface Props { 
  index: MarketIndex; 
  onClose: () => void; 
}

const NEON_GREEN = '#10b981';
const NEON_RED = '#f43f5e';

interface ChartPoint {
  ts: number;
  label: string;
  fullDate: string;
  price: number;
}

export default function IndexDetailChartModal({ index, onClose }: Props) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const isUp = (index.changePct ?? 0) >= 0;
  const accent = isUp ? NEON_GREEN : NEON_RED;

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const tvSymbol = getTradingViewSymbol(index.name, index.ticker);

  // Detect if this index is CBOE Volatility Index (^VIX), which CBOE blocks in third-party TradingView iframes
  const isVix =
    index.ticker?.toUpperCase() === '^VIX' ||
    index.name.toUpperCase().includes('VIX') ||
    index.name.toUpperCase().includes('VOLATILITY');

  const [activeRange, setActiveRange] = useState<string>("1Y");
  const [vixPoints, setVixPoints] = useState<ChartPoint[]>([]);
  const [isLoadingVix, setIsLoadingVix] = useState<boolean>(false);

  const RANGES = [
    { label: '1D', val: '1D', tvRange: '1D', interval: '5' },
    { label: '1W', val: '1W', tvRange: '5D', interval: '15' },
    { label: '1M', val: '1M', tvRange: '1M', interval: '60' },
    { label: '3M', val: '3M', tvRange: '3M', interval: '120' },
    { label: '6M', val: '6M', tvRange: '6M', interval: 'D' },
    { label: '1Y', val: '1Y', tvRange: '12M', interval: 'D' },
    { label: '5Y', val: '5Y', tvRange: '60M', interval: 'W' },
    { label: 'ALL', val: 'ALL', tvRange: 'ALL', interval: 'M' },
  ] as const;

  const currentConf = RANGES.find(r => r.val === activeRange)!;

  useEffect(() => {
    if (!isVix) return;
    let cancelled = false;
    const fetchVixHistory = async () => {
      setIsLoadingVix(true);
      try {
        const rangeParam = activeRange === 'ALL' ? 'max' : activeRange.toLowerCase();
        const url = `/api/stock-history?ticker=${encodeURIComponent('^VIX')}&range=${rangeParam}&currentPrice=${index.value || 18.5}&dailyChange=${index.changePct || 0}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load VIX history');
        const data = await res.json();
        if (cancelled) return;
        const timestamps: number[] = data.timestamps || [];
        const prices: number[] = data.prices || [];
        const pts: ChartPoint[] = timestamps.map((ts, i) => {
          const d = new Date(ts * 1000);
          let label = '';
          if (activeRange === '1D') {
            label = d.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });
          } else if (activeRange === '1W' || activeRange === '1M') {
            label = d.toLocaleDateString('bg-BG', { day: '2-digit', month: 'short' });
          } else if (activeRange === '5Y' || activeRange === 'ALL') {
            label = d.toLocaleDateString('bg-BG', { month: 'short', year: 'numeric' });
          } else {
            label = d.toLocaleDateString('bg-BG', { day: '2-digit', month: 'short', year: '2-digit' });
          }
          const fullDate =
            activeRange === '1D' || activeRange === '1W'
              ? d.toLocaleString('bg-BG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : d.toLocaleDateString('bg-BG', { day: '2-digit', month: 'long', year: 'numeric' });
          return {
            ts,
            label,
            fullDate,
            price: Number(prices[i] ?? index.value)
          };
        });
        setVixPoints(pts);
      } catch (e) {
        console.warn('VIX history fetch error:', e);
      } finally {
        if (!cancelled) setIsLoadingVix(false);
      }
    };
    fetchVixHistory();
    return () => {
      cancelled = true;
    };
  }, [isVix, activeRange, index.value, index.changePct]);

  const vixStats = useMemo(() => {
    if (!vixPoints.length) {
      return { min: index.value * 0.8, max: index.value * 1.2, avg: index.value };
    }
    const vals = vixPoints.map(p => p.price);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { min, max, avg };
  }, [vixPoints, index.value]);

  const vixRegime = useMemo(() => {
    const v = index.value;
    if (v < 20) {
      return { label: '🟢 Ниска волатилност / Спокоен пазар (< 20)', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
    }
    if (v <= 30) {
      return { label: '🟡 Повишена несигурност (20 – 30)', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    }
    return { label: '🔴 Висок страх / Паника на пазара (> 30)', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
  }, [index.value]);

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-bg/90 backdrop-blur-md font-sans"
    >
      <div className="w-full max-w-[1000px] h-full max-h-[760px] flex flex-col bg-card/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-border shadow-2xl relative">
        
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-border flex items-center justify-center text-ink hover:bg-border-hover transition-colors cursor-pointer border-none outline-none"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        <div className="p-4 sm:p-6 pb-2 sm:pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-ink tracking-tight leading-tight uppercase">
              {index.name}
            </div>
            <div className="text-xs sm:text-xs text-ink-faint mt-1 flex flex-wrap items-center gap-2">
              <span>Index Markets {index.ticker ? `· ${index.ticker}` : ''}</span>
              {isVix && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${vixRegime.color}`}>
                  {vixRegime.label}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-start sm:items-end w-full sm:w-auto pr-8 sm:pr-14">
            <div className="text-2xl sm:text-3xl font-bold text-ink tracking-tight leading-tight tabular-nums">
              {index.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div 
              className="text-xs sm:text-lg font-semibold mt-0.5 flex items-center justify-end gap-1.5 tabular-nums"
              style={{ color: accent }}
            >
              {isUp ? '+' : ''}{(index.changePct ?? 0).toFixed(2)}%
            </div>
            
            <div className="flex flex-wrap gap-1 mt-3 sm:mt-4 bg-border/40 p-1 rounded-lg">
              {RANGES.map(r => (
                <button
                  key={r.val}
                  onClick={() => setActiveRange(r.val)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    activeRange === r.val 
                      ? 'bg-bg text-ink shadow-sm' 
                      : 'text-ink-faint hover:text-ink hover:bg-border/60'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 relative mx-2 mb-4 min-h-0 flex flex-col">
          {isVix ? (
            <div className="flex-1 flex flex-col bg-bg/60 border border-border/60 rounded-xl p-3 sm:p-4 min-h-0">
              {/* VIX Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-border/40 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-ink-faint mr-1.5">Мин ({activeRange}):</span>
                    <span className="font-mono font-bold text-emerald-400">{vixStats.min.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-ink-faint mr-1.5">Макс ({activeRange}):</span>
                    <span className="font-mono font-bold text-rose-400">{vixStats.max.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-ink-faint mr-1.5">Средно ({activeRange}):</span>
                    <span className="font-mono font-bold text-indigo-400">{vixStats.avg.toFixed(2)}</span>
                  </div>
                </div>
                <a
                  href="https://www.tradingview.com/symbols/TVC-VIX/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  title="Виж CBOE:VIX директно в TradingView"
                >
                  <span>CBOE:VIX в TradingView</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Interactive Native Chart */}
              <div className="flex-1 min-h-0 relative">
                {isLoadingVix ? (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 text-xs font-bold text-ink-muted">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Зареждане на CBOE Volatility Index (^VIX)...</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={vixPoints} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="vixAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={accent} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={accent} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                      <XAxis
                        dataKey="label"
                        stroke="var(--color-ink-faint)"
                        fontSize={11}
                        tickLine={false}
                        minTickGap={28}
                      />
                      <YAxis
                        stroke="var(--color-ink-faint)"
                        fontSize={11}
                        tickLine={false}
                        domain={[
                          (dataMin: number) => Math.max(0, Math.floor(Math.min(dataMin, 12) - 2)),
                          (dataMax: number) => Math.ceil(Math.max(dataMax, 32) + 2)
                        ]}
                        tickFormatter={(v) => Number(v).toFixed(1)}
                        width={44}
                      />
                      <ReferenceLine
                        y={20}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeOpacity={0.65}
                        label={{ value: '20 (Спокоен)', position: 'insideTopRight', fill: '#10b981', fontSize: 10 }}
                      />
                      <ReferenceLine
                        y={30}
                        stroke="#f43f5e"
                        strokeDasharray="4 4"
                        strokeOpacity={0.65}
                        label={{ value: '30 (Паника)', position: 'insideTopRight', fill: '#f43f5e', fontSize: 10 }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const pt = payload[0].payload as ChartPoint;
                          return (
                            <div className="bg-stone-950/95 border border-indigo-500/40 rounded-xl px-3 py-2 shadow-xl text-xs">
                              <div className="text-stone-400 font-medium mb-0.5">{pt.fullDate}</div>
                              <div className="font-mono font-black text-sm text-white">
                                VIX: <span style={{ color: accent }}>{pt.price.toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={accent}
                        strokeWidth={2.2}
                        fill="url(#vixAreaGrad)"
                        animationDuration={300}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          ) : (
            <AdvancedRealTimeChart
              key={activeRange}
              symbol={tvSymbol}
              theme={isDark ? "dark" : "light"}
              autosize
              style="1"
              interval={currentConf.interval as any}
              timezone="exchange"
              hide_top_toolbar={false}
              hide_side_toolbar={false}
              hide_legend={false}
              allow_symbol_change={true}
              save_image={true}
              details={false}
              hotlist={false}
              calendar={false}
              withdateranges={false}
              range={currentConf.tvRange as any}
            />
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
