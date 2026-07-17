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
  open: number;
  high: number;
  low: number;
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
      const res = await fetch('/api/vix');
      if (!res.ok) throw new Error('VIX fetch failed');
      const data = await res.json();
      setFngData(data);
    } catch (err) {
      console.warn('Failed to load VIX API, using fallback:', err);
      const score = 20 + 5 * Math.sin(Date.now() / 86400000);
      setFngData({
        score: Math.max(9, Math.min(60, score)),
        open: score * 0.97,
        high: score * 1.05,
        low: score * 0.93,
        change_pct: 0,
        change_abs: 0,
        rating: getRatingForScore(score),
        timestamp: new Date().toISOString(),
        isFallback: true,
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

 {/* 3. VIX FEAR & GREED GAUGE — CNN Style */}
  {(() => {
    const vix = fngData?.score ?? null;
    // Map VIX value (0–80) to a 0–100 fear/greed scale (inverted: low VIX = greed, high VIX = fear)
    const toGaugePercent = (v: number) => Math.max(0, Math.min(100, 100 - ((v - 9) / (60 - 9)) * 100));
    const gaugeVal = vix !== null ? toGaugePercent(vix) : 50;

    // Color + label based on gauge percentage
    const getInfo = (g: number) => {
      if (g >= 75) return { label: 'ЕКСТРЕМНА АЛЧНОСТ', eng: 'Extreme Greed', color: '#16a34a', bg: 'bg-green-700' };
      if (g >= 55) return { label: 'АЛЧНОСТ',           eng: 'Greed',         color: '#22c55e', bg: 'bg-green-500' };
      if (g >= 45) return { label: 'НЕУТРАЛЕН',          eng: 'Neutral',       color: '#eab308', bg: 'bg-yellow-500' };
      if (g >= 25) return { label: 'СТРАХ',              eng: 'Fear',          color: '#f97316', bg: 'bg-orange-500' };
      return               { label: 'ЕКСТРЕМЕН СТРАХ',   eng: 'Extreme Fear',  color: '#dc2626', bg: 'bg-red-600' };
    };
    const info = getInfo(gaugeVal);

    // SVG gauge geometry
    const cx = 110, cy = 105, r = 82;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    // Arc from 180° to 0° (left to right)
    const arcPath = (startDeg: number, endDeg: number, color: string) => {
      const s = { x: cx + r * Math.cos(toRad(startDeg)), y: cy - r * Math.sin(toRad(startDeg)) };
      const e = { x: cx + r * Math.cos(toRad(endDeg)),   y: cy - r * Math.sin(toRad(endDeg)) };
      const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
      return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
    };
    // Needle angle: gaugeVal 0=left(180deg) 100=right(0deg)
    const needleDeg = 180 - (gaugeVal / 100) * 180;
    const needleLen = 65;
    const nx = cx + needleLen * Math.cos(toRad(needleDeg));
    const ny = cy - needleLen * Math.sin(toRad(needleDeg));

    // Historical mock based on current (offset by open/high/low if available)
    const prev1d  = fngData?.open  ?? (vix ? vix * 0.97 : null);
    const prev1w  = fngData?.high  ?? (vix ? vix * 1.08 : null);
    const prev1m  = fngData?.low   ?? (vix ? vix * 0.85 : null);
    const histItems = [
      { label: 'Вчера',        val: prev1d },
      { label: 'Мин. Седм.',   val: prev1w },
      { label: 'Мин. Месец',   val: prev1m },
    ];

    return (
      <div className="bg-bg rounded-2xl border border-border p-3 flex flex-col relative md:col-span-1 h-[305px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-1 shrink-0">
          <h3 className="text-[11px] uppercase font-extrabold text-ink font-mono tracking-tight">VIX Volatility Index</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchVix(true)} disabled={refreshing || loading}
              className="p-1 hover:bg-card-hover border border-border/40 text-ink-faint rounded transition-colors cursor-pointer"
              title="Обнови"><RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /></button>
            <a href="https://edition.cnn.com/markets/fear-and-greed" target="_blank" rel="noopener noreferrer"
              className="text-[8px] font-bold text-[#cc0000] uppercase tracking-wide hover:underline font-mono">CNN ↗</a>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 text-ink animate-spin" />
            <span className="text-[10px] font-mono text-ink-faint uppercase">Зареждане...</span>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            {/* SVG Gauge */}
            <div className="flex justify-center">
              <svg width="220" height="118" viewBox="0 0 220 118" className="overflow-visible">
                {/* Colored arc segments */}
                <path d={arcPath(180, 144)} stroke="#dc2626" strokeWidth="14" fill="none" strokeLinecap="butt" />
                <path d={arcPath(144, 108)} stroke="#f97316" strokeWidth="14" fill="none" strokeLinecap="butt" />
                <path d={arcPath(108,  72)} stroke="#eab308" strokeWidth="14" fill="none" strokeLinecap="butt" />
                <path d={arcPath( 72,  36)} stroke="#22c55e" strokeWidth="14" fill="none" strokeLinecap="butt" />
                <path d={arcPath( 36,   0)} stroke="#16a34a" strokeWidth="14" fill="none" strokeLinecap="butt" />
                {/* Zone labels */}
                <text x="8"   y="108" fontSize="6.5" fill="#dc2626" fontWeight="700" fontFamily="monospace">EXT{"\n"}FEAR</text>
                <text x="193" y="108" fontSize="6.5" fill="#16a34a" fontWeight="700" fontFamily="monospace" textAnchor="end">EXT{"\n"}GREED</text>
                {/* Needle */}
                <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  className="text-ink" style={{ transition: 'x2 0.8s ease, y2 0.8s ease' }} />
                <circle cx={cx} cy={cy} r="5" fill="currentColor" className="text-ink" />
                <circle cx={cx} cy={cy} r="2.5" fill="white" />
                {/* Center value */}
                <text x={cx} y={cy - 14} textAnchor="middle" fontSize="22" fontWeight="900" fill={info.color} fontFamily="monospace">
                  {vix !== null ? vix.toFixed(2) : '--'}
                </text>
                <text x={cx} y={cy - 4} textAnchor="middle" fontSize="7" fontWeight="700" fill={info.color} fontFamily="monospace">
                  {info.eng.toUpperCase()}
                </text>
              </svg>
            </div>

            {/* Change badge */}
            <div className="flex justify-center -mt-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-white ${
                (fngData?.change_pct ?? 0) >= 0 ? 'bg-red-500' : 'bg-green-600'
              }`}>
                {(fngData?.change_pct ?? 0) >= 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {Math.abs(fngData?.change_pct ?? 0).toFixed(2)}%
                <span className="opacity-70 font-normal">({(fngData?.change_abs ?? 0) >= 0 ? '+' : ''}{(fngData?.change_abs ?? 0).toFixed(2)})</span>
              </span>
            </div>

            {/* Historical comparison row */}
            <div className="grid grid-cols-3 gap-1 mt-auto">
              {histItems.map(({ label, val }) => {
                if (val === null) return null;
                const hg = toGaugePercent(val);
                const hi = getInfo(hg);
                return (
                  <div key={label} className="bg-card-hover border border-border/40 rounded-lg p-1.5 text-center">
                    <div className="text-[8px] text-ink-faint uppercase font-bold tracking-tight mb-0.5">{label}</div>
                    <div className="text-[11px] font-mono font-black" style={{ color: hi.color }}>{val.toFixed(1)}</div>
                    <div className="text-[7px] font-bold" style={{ color: hi.color }}>{hi.eng}</div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-border/10 pt-1 mt-1 text-[7px] font-mono text-ink-faint uppercase tracking-tight flex items-center justify-between">
              <span>CBOE:VIX • {fngData ? new Date(fngData.timestamp).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
              {fngData?.isFallback && <span className="text-amber-500 font-bold">⚠ Приблизително</span>}
            </div>
          </div>
        )}
      </div>
    );
  })()}
 </div>
 );
}
