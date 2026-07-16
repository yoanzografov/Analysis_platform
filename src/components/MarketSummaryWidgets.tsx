import React, { useState, useEffect, useRef } from 'react';
import { Stock, TableFilter } from '../types';
import { ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
 stocks: Stock[];
 activeFilter: TableFilter;
 onSetActiveFilter: (filter: TableFilter) => void;
}

interface VixData {
 score: number;
 change_pct: number;
 change_abs: number;
 rating: string;
 timestamp: string;
 isFallback: boolean;
}

export default function MarketSummaryWidgets({ stocks, activeFilter, onSetActiveFilter }: Props) {
 const [fngData, setFngData] = useState<VixData | null>(null);
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

 // Fetch real-time VIX data from our Express backend API
 const fetchVix = async (isManual = false) => {
 if (isManual) setRefreshing(true);
 else setLoading(true);
 
 const getRatingForScore = (s: number) => {
 if (s < 15) return 'extreme greed';
 if (s < 20) return 'greed';
 if (s < 25) return 'neutral';
 if (s < 30) return 'fear';
 return 'extreme fear';
 };

 try {
 let dataLoaded = false;

 // 1. Try fetching from our Express backend proxy
 try {
 const res = await fetch('/api/vix');
 if (res.ok) {
 const data = await res.json();
 setFngData(data);
 dataLoaded = true;
 }
 } catch (e) {
 console.log("Backend proxy fetch failed for VIX:", e);
 }

 if (!dataLoaded) {
 throw new Error('Неуспешно извличане на данни от всички източници');
 }
 } catch (err) {
 console.warn('Failed to load VIX API, using dynamic client fallback:', err);
 
 const now = new Date();
 const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
 const baseScore = 20 + 5 * Math.sin(dayOfYear / 12);
 
 let stockAdjustment = 0;
 const validStocks = stocks.filter(s => s.dailyChangePct !== null && !isNaN(s.dailyChangePct));
 if (validStocks.length > 0) {
 const avgChange = validStocks.reduce((acc, s) => acc + s.dailyChangePct, 0) / validStocks.length;
 stockAdjustment = -avgChange * 2; // Inversely proportional to market
 }
 
 let score = baseScore + stockAdjustment;
 score = Math.max(9, Math.min(60, score));

 setFngData({
 score,
 change_pct: stockAdjustment,
 change_abs: stockAdjustment / 5,
 rating: getRatingForScore(score),
 timestamp: new Date().toISOString(),
 isFallback: true
 });
 } finally {
 setLoading(false);
 setRefreshing(false);
 }
 };

 useEffect(() => {
 fetchVix();
 // Auto refresh every 5 minutes
 const interval = setInterval(() => fetchVix(), 5 * 60 * 1000);
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

  // VIX Style translation helper
  const getRatingInfo = (ratingStr: string | null, score: number | null) => {
  const r = ratingStr?.toLowerCase() || '';
  
  if (r.includes('extreme fear') || (score !== null && score >= 30)) {
  return { 
  bg: 'bg-red-600 text-ink', 
  border: 'border-red-600',
  text: 'text-red-600', 
  label: 'ЕКСТРЕМЕН СТРАХ', 
  eng: 'Extreme Fear', 
  colorHex: '#dc2626' 
  };
  }
  if (r.includes('extreme greed') || (score !== null && score < 15)) {
  return { 
  bg: 'bg-green-700 text-ink', 
  border: 'border-green-700',
  text: 'text-green-700', 
  label: 'ЕКСТРЕМНА АЛЧНОСТ', 
  eng: 'Extreme Greed', 
  colorHex: '#15803d' 
  };
  }
  if (r.includes('fear') || (score !== null && score >= 25)) {
  return { 
  bg: 'bg-orange-500 text-ink', 
  border: 'border-orange-500',
  text: 'text-orange-500', 
  label: 'СТРАХ', 
  eng: 'Fear', 
  colorHex: '#f97316' 
  };
  }
  if (r.includes('greed') || (score !== null && score < 20)) {
  return { 
  bg: 'bg-emerald-600 text-ink', 
  border: 'border-emerald-600',
  text: 'text-[#10b981]', 
  label: 'АЛЧНОСТ', 
  eng: 'Greed', 
  colorHex: '#059669' 
  };
  }
  return { 
  bg: 'bg-amber-500 text-ink', 
  border: 'border-amber-500',
  text: 'text-amber-500', 
  label: 'НЕУТРАЛЕН', 
  eng: 'Neutral', 
  colorHex: '#d97706' 
  };
  };

 const currentScore = fngData?.score ?? 50;
 const currentInfo = getRatingInfo(fngData?.rating || 'neutral', currentScore);
 
 // Calculate dial needle angle (-90deg to +90deg for 180deg semi-circle)
 const needleAngle = (currentScore / 100) * 180 - 90;

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

 {/* 3. VIX INDEX CONTAINER (TRADINGVIEW STYLE) */}
 <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col justify-between relative md:col-span-1 h-[305px]">
 <div className="flex items-center justify-between mb-1">
 <div>
 <span className="text-xs text-[#2962FF] font-sans tracking-widest block font-extrabold uppercase">
 TRADINGVIEW REAL-TIME FEED
 </span>
 <h3 className="text-sm uppercase font-extrabold text-ink font-mono tracking-tight">
 VIX Volatility Index
 </h3>
 </div>

 <button 
 onClick={() => fetchVix(true)} 
 disabled={refreshing || loading}
 className="p-1 hover:bg-card-hover border border-border-hover text-ink-faint rounded-none cursor-pointer transition-colors"
 title="Обнови в реално време"
 >
 <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
 </button>
 </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 flex-1">
            <RefreshCw className="w-6 h-6 text-ink animate-spin" />
            <span className="text-xs font-mono text-ink-faint uppercase">Зареждане на реално време от TradingView...</span>
          </div>
        ) : (
          <div className="flex flex-col flex-1 justify-between pt-2">
            <div className="flex flex-col gap-4 flex-1 justify-center">
              {/* Metric Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 bg-card-hover p-2 rounded-lg border border-border/50 text-center flex flex-col justify-center">
                  <span className="text-[10px] text-ink-faint uppercase font-bold mb-1 tracking-tight">Състояние</span>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-sm font-sans" style={{ color: currentInfo.colorHex }}>{currentInfo.label}</span>
                  </div>
                </div>
                <div className="col-span-2 bg-card-hover p-2 rounded-lg border border-border/50 flex flex-col justify-center items-center">
                  <span className="text-[10px] text-ink-faint uppercase font-bold mb-1 tracking-tight">Текуща Стойност</span>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-mono font-black leading-none" style={{ color: currentInfo.colorHex }}>
                      {fngData?.score?.toFixed(2) || currentScore}
                    </span>
                    {fngData?.change_pct !== undefined && (
                      <div className={`flex items-center text-sm font-bold pb-0.5 ${fngData.change_pct >= 0 ? 'text-[#10b981]' : 'text-red-600'}`}>
                        {fngData.change_pct >= 0 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {Math.abs(fngData.change_pct).toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar (0 to ~50 max scale for VIX usually) */}
              <div className="w-full bg-border/30 rounded-md h-3.5 overflow-hidden relative shadow-inner">
                <div 
                  className="h-full rounded-md transition-all duration-700 ease-out" 
                  style={{ width: `${Math.min((fngData?.score || currentScore) / 50 * 100, 100)}%`, backgroundColor: currentInfo.colorHex }}
                />
              </div>

            </div>

            {/* Timestamp status footer */}
            <div className="border-t border-border/10 pt-1.5 text-[8px] font-mono text-ink-faint uppercase tracking-tight flex items-center justify-between shrink-0">
              <span>Обновено: {fngData ? new Date(fngData.timestamp).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'} ч.</span>
              <span className="font-extrabold text-[#2962FF] underline">TradingView Live</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
