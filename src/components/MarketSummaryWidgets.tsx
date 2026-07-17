import React, { useState, useEffect, useRef } from 'react';
import { Stock, TableFilter } from '../types';
import { ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
 stocks: Stock[];
 activeFilter: TableFilter;
 onSetActiveFilter: (filter: TableFilter) => void;
}

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface CnnData {
  fear_and_greed: {
    score: number;
    rating: string;
    timestamp: string;
  };
  market_volatility_vix: {
    rating: string;
    data: { x: number; y: number; rating: string }[];
  };
  market_volatility_vix_50: {
    data: { x: number; y: number; rating: string }[];
  };
}

export default function MarketSummaryWidgets({ stocks, activeFilter, onSetActiveFilter }: Props) {
  const [fngData, setFngData] = useState<CnnData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const gainersRef = useRef<HTMLDivElement>(null);
  const losersRef = useRef<HTMLDivElement>(null);

  // Smooth scroll helper for lists
  const scrollList = (ref: React.RefObject<HTMLDivElement | null>, direction: 'up' | 'down') => {
    if (ref.current) {
      const scrollAmount = 100;
      ref.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Fetch real-time Fear & Greed data from our Express backend API
  const fetchFng = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/fng');
      if (res.ok) {
        const data = await res.json();
        console.log("FNG DATA API Response:", data); setFngData(data);
      } else {
        throw new Error('Failed to fetch Fear & Greed data');
      }
    } catch (err) {
      console.warn('Failed to load Fear & Greed API', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFng();
    // Auto refresh every 5 minutes
    const interval = setInterval(() => fetchFng(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

 // Filter valid stocks with valid changes
 const validGainers = stocks.filter(s => s.dailyChangePct !== null && !isNaN(s.dailyChangePct));

  // 1. Get Top 15 Gainers
  const top15Gainers = [...validGainers]
    .sort((a, b) => b.dailyChangePct - a.dailyChangePct)
    .slice(0, 15);

  // 2. Get Top 15 Losers
  const top15Losers = [...validGainers]
    .sort((a, b) => a.dailyChangePct - b.dailyChangePct)
    .slice(0, 15);

 const handleWidgetClick = (ticker: string) => {
 if (activeFilter.type === 'ticker' && activeFilter.value === ticker) {
 onSetActiveFilter({ type: 'all', value: 'all' });
 } else {
 onSetActiveFilter({ type: 'ticker', value: ticker });
 setTimeout(() => {
 document.getElementById('stock-table-section')?.scrollIntoView({ behavior: 'smooth' });
 }, 100);
 }
 };

  return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
 <style dangerouslySetInnerHTML={{__html: `
 .custom-mini-scroll::-webkit-scrollbar {
 width: 4px;
 }
 .custom-mini-scroll::-webkit-scrollbar-track {
 background: transparent;
 }
 .custom-mini-scroll::-webkit-scrollbar-thumb {
 background: rgba(0, 0, 0, 0.15);
 border-radius: 4px;
 }
 .custom-mini-scroll::-webkit-scrollbar-thumb:hover {
 background: rgba(0, 0, 0, 0.3);
 }
 `}} />

 {/* 1. TOP GAINER CONTAINER */}
 <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col justify-between transition-all duration-200 h-[305px] hover:shadow-md relative group">
 <div>
 {/* Header row with scrolling buttons */}
 <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
 <div>
 <h3 className="text-sm uppercase font-extrabold text-emerald-700 font-mono tracking-tight">
 Top Gainers
 </h3>
 </div>
 
 <div className="flex items-center gap-1.5 shrink-0">
 <button 
 onClick={(e) => { e.stopPropagation(); scrollList(gainersRef, 'up'); }}
 className="p-1 hover:bg-card-hover border border-border-hover text-ink-faint rounded-none transition-colors cursor-pointer"
 title="Превърти нагоре"
 >
 <ChevronUp className="w-3.5 h-3.5" />
 </button>
 <button 
 onClick={(e) => { e.stopPropagation(); scrollList(gainersRef, 'down'); }}
 className="p-1 hover:bg-card-hover border border-border-hover text-ink-faint rounded-none transition-colors cursor-pointer"
 title="Превърти надолу"
 >
 <ChevronDown className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 
 {/* List Container */}
 <div 
 ref={gainersRef}
 className="overflow-y-auto overflow-x-hidden custom-mini-scroll h-[180px] space-y-1.5 pr-1"
 >
 {top15Gainers.length > 0 ? (
 top15Gainers.map((item, idx) => {
 const isSelected = activeFilter.type === 'ticker' && activeFilter.value === item.ticker;
 return (
 <div 
 key={`${item.ticker}-${idx}`}
 onClick={() => handleWidgetClick(item.ticker)}
 className={`flex items-center justify-between py-1.5 px-2 border-b border-border/50 hover:bg-[#10b981]/5 transition-colors cursor-pointer rounded-none ${
 isSelected
 ? 'bg-[#10b981]/10 border-l-2 border-l-[#10b981] font-semibold'
 : ''
 }`}
 >
 <div className="flex items-center gap-2 min-w-0">
 <span className="text-[9px] font-mono font-black text-ink bg-[#10b981]/10 border border-[#10b981]/30 px-1.5 py-0.5 shrink-0 rounded-none">
 {item.ticker}
 </span>
 <span className="text-sm font-sans font-bold text-ink truncate max-w-[110px]" title={item.companyName}>
 {item.companyName}
 </span>
 </div>
 <div className="flex items-center gap-2 font-mono text-sm shrink-0">
 <span className="text-ink-faint font-bold">${item.currentPrice.toFixed(2)}</span>
 <span className="font-extrabold text-emerald-700">+{item.dailyChangePct.toFixed(2)}%</span>
 </div>
 </div>
 );
 })
 ) : (
 <p className="text-xs text-ink-faint font-mono py-8 text-center">Няма данни за печеливши акции.</p>
 )}
 </div>
 </div>
 
 <div className="border-t border-border/10 pt-2 text-[9px] font-mono text-ink/60 uppercase tracking-tight flex items-center justify-between shrink-0">
 <span>Кликни на акция за филтър</span>
 <span className="font-bold underline group-hover:text-[#10b981]">Топ Печеливши ({top15Gainers.length})</span>
 </div>
 </div>

 {/* 2. TOP LOSER CONTAINER */}
 <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col justify-between transition-all duration-200 h-[305px] hover:shadow-md relative group">
 <div>
 {/* Header row with scrolling buttons */}
 <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
 <div>
 <h3 className="text-sm uppercase font-extrabold text-red-700 font-mono tracking-tight">
 Top Losers
 </h3>
 </div>
 
 <div className="flex items-center gap-1.5 shrink-0">
 <button 
 onClick={(e) => { e.stopPropagation(); scrollList(losersRef, 'up'); }}
 className="p-1 hover:bg-card-hover border border-border-hover text-ink-faint rounded-none transition-colors cursor-pointer"
 title="Превърти нагоре"
 >
 <ChevronUp className="w-3.5 h-3.5" />
 </button>
 <button 
 onClick={(e) => { e.stopPropagation(); scrollList(losersRef, 'down'); }}
 className="p-1 hover:bg-card-hover border border-border-hover text-ink-faint rounded-none transition-colors cursor-pointer"
 title="Превърти надолу"
 >
 <ChevronDown className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 
 {/* List Container */}
 <div 
 ref={losersRef}
 className="overflow-y-auto overflow-x-hidden custom-mini-scroll h-[180px] space-y-1.5 pr-1"
 >
 {top15Losers.length > 0 ? (
 top15Losers.map((item, idx) => {
 const isSelected = activeFilter.type === 'ticker' && activeFilter.value === item.ticker;
 return (
 <div 
 key={`${item.ticker}-${idx}`}
 onClick={() => handleWidgetClick(item.ticker)}
 className={`flex items-center justify-between py-1.5 px-2 border-b border-border/50 hover:bg-[#f43f5e]/5 transition-colors cursor-pointer rounded-none ${
 isSelected
 ? 'bg-[#f43f5e]/10 border-l-2 border-l-[#f43f5e] font-semibold'
 : ''
 }`}
 >
 <div className="flex items-center gap-2 min-w-0">
 <span className="text-[9px] font-mono font-black text-ink bg-[#f43f5e]/10 border border-[#f43f5e]/30 px-1.5 py-0.5 shrink-0 rounded-none">
 {item.ticker}
 </span>
 <span className="text-sm font-sans font-bold text-ink truncate max-w-[110px]" title={item.companyName}>
 {item.companyName}
 </span>
 </div>
 <div className="flex items-center gap-2 font-mono text-sm shrink-0">
 <span className="text-ink-faint font-bold">${item.currentPrice.toFixed(2)}</span>
 <span className="font-extrabold text-red-700">{item.dailyChangePct.toFixed(2)}%</span>
 </div>
 </div>
 );
 })
 ) : (
 <p className="text-xs text-ink-faint font-mono py-8 text-center">Няма данни за губещи акции.</p>
 )}
 </div>
 </div>
 
 <div className="border-t border-border/10 pt-2 text-[9px] font-mono text-ink/60 uppercase tracking-tight flex items-center justify-between shrink-0">
 <span>Кликни на акция за филтър</span>
 <span className="font-bold underline group-hover:text-[#f43f5e]">Топ Губещи ({top15Losers.length})</span>
 </div>
 </div>

 {/* 3. FEAR & GREED VIX LINE CHART — CNN Style */}
  {(() => {
    let chartData: any[] = [];
    let currentRating = 'neutral';
    
    if (fngData?.market_volatility_vix?.data && fngData?.market_volatility_vix_50?.data) {
      currentRating = fngData.market_volatility_vix.rating;
      
      // Combine VIX and 50-day MA
      const vixData = fngData.market_volatility_vix.data;
      const maData = fngData.market_volatility_vix_50.data;
      
      // Create map for easy lookup
      const maMap = new Map();
      maData.forEach(d => maMap.set(d.x, d.y));
      
      chartData = vixData.map(d => ({
        date: d.x,
        vix: d.y,
        ma50: maMap.get(d.x) || null
      }));
    }

    const formatDate = (timestamp: number) => {
      const d = new Date(timestamp);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };
    
    const getRatingColor = (r: string) => {
      const lower = r.toLowerCase();
      if (lower.includes('extreme fear')) return '#dc2626'; // red
      if (lower.includes('fear')) return '#f97316'; // orange
      if (lower.includes('extreme greed')) return '#16a34a'; // dark green
      if (lower.includes('greed')) return '#22c55e'; // green
      return '#64748b'; // neutral/slate
    };
    
    const formatRatingText = (r: string) => {
      return r.toUpperCase();
    };

    return (
      <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col relative md:col-span-1 h-[305px] group hover:shadow-md transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 mb-1">
          <div className="flex flex-col">
            <h3 className="text-xs uppercase font-extrabold text-ink font-sans tracking-wide">
              MARKET VOLATILITY
            </h3>
            <span className="text-[10px] text-ink-faint font-bold font-sans mt-0.5">
              VIX and its 50-day moving average
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 mb-1">
              <button onClick={() => fetchFng(true)} disabled={refreshing || loading}
                className="p-1 hover:bg-card-hover border border-border/40 text-ink-faint rounded transition-colors cursor-pointer"
                title="Обнови">
                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <a href="https://edition.cnn.com/markets/fear-and-greed" target="_blank" rel="noopener noreferrer"
                className="text-[8px] font-bold text-[#cc0000] uppercase tracking-wide hover:underline font-mono">
                CNN ↗
              </a>
            </div>
            {fngData && (
              <div 
                className="text-[10px] font-black uppercase px-2 py-1 rounded border border-border/50"
                style={{ backgroundColor: `${getRatingColor(currentRating)}15`, color: getRatingColor(currentRating) }}
              >
                {formatRatingText(currentRating)}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        {fngData && !loading && (
          <div className="flex items-center gap-3 text-[10px] font-sans font-medium text-ink/80 mb-2 mt-1">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#005b9f' }}></span>
              VIX
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f97316' }}></span>
              50-day moving average
            </div>
          </div>
        )}

        {loading && !fngData ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 text-ink animate-spin" />
            <span className="text-[10px] font-mono text-ink-faint uppercase">Зареждане...</span>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 w-full mt-2">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #e2e8f0)" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(tick) => {
                      const d = new Date(tick);
                      return d.getMonth() === 0 || d.getMonth() === 6 ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : d.toLocaleDateString('en-US', { month: 'short' });
                    }}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    minTickGap={40}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(val) => val.toFixed(2)}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    formatter={(value: number, name: string) => [value.toFixed(2), name === 'vix' ? 'VIX' : '50-day MA']}
                  />
                  <Line 
                    type="linear" 
                    dataKey="vix" 
                    stroke="#005b9f" 
                    strokeWidth={1.5} 
                    dot={false} 
                    isAnimationActive={false}
                  />
                  <Line 
                    type="linear" 
                    dataKey="ma50" 
                    stroke="#f97316" 
                    strokeWidth={1.5} 
                    dot={false} 
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-ink-faint">Няма данни за графиката</div>
            )}
            
            {/* Footer */}
            <div className="border-t border-border/10 pt-1 mt-2 text-[8px] font-sans text-ink-faint">
              Last updated {fngData ? new Date(fngData.fear_and_greed.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} at {fngData ? new Date(fngData.fear_and_greed.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }) : ''}
            </div>
          </div>
        )}
      </div>
    );
  })()}
 </div>
 );
}
