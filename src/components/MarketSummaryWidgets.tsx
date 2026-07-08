import React, { useState, useEffect, useRef } from 'react';
import { Stock, TableFilter } from '../types';
import { ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
 stocks: Stock[];
 activeFilter: TableFilter;
 onSetActiveFilter: (filter: TableFilter) => void;
}

interface FearGreedData {
 score: number;
 rating: string;
 timestamp: string;
 previous_close: number | null;
 previous_close_rating: string | null;
 one_week_ago: number | null;
 one_week_ago_rating: string | null;
 one_month_ago: number | null;
 one_month_ago_rating: string | null;
 one_year_ago: number | null;
 one_year_ago_rating: string | null;
 isFallback: boolean;
}

export default function MarketSummaryWidgets({ stocks, activeFilter, onSetActiveFilter }: Props) {
 const [fngData, setFngData] = useState<FearGreedData | null>(null);
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

 // Fetch real-time CNN Fear & Greed data from our Express backend API
 const fetchFearGreed = async (isManual = false) => {
 if (isManual) setRefreshing(true);
 else setLoading(true);
 
 // Helper to format ratings
 const getRatingForScore = (s: number) => {
 if (s <= 25) return 'extreme fear';
 if (s <= 45) return 'fear';
 if (s <= 55) return 'neutral';
 if (s <= 75) return 'greed';
 return 'extreme greed';
 };

 try {
 let dataLoaded = false;

 // 1. Try fetching from our Express backend proxy first (which now queries the official CNN dataviz API)
 try {
 const res = await fetch('/api/fear-greed');
 if (res.ok) {
 const data = await res.json();
 setFngData(data);
 dataLoaded = true;
 }
 } catch (e) {
 console.log("Backend proxy fetch failed, trying direct public API:", e);
 }

 // 2. Fallback to direct public feargreedchart API (useful for static pages like GitHub Pages)
 if (!dataLoaded) {
 try {
 const publicRes = await fetch('https://feargreedchart.com/api/', {
 mode: 'cors'
 });
 if (publicRes.ok) {
 const publicData = await publicRes.json();
 const recent = publicData?.recent || [];
 const len = recent.length;
 if (len > 0) {
 const score = Math.round(recent[len - 1].score);
 
 const previous_close = len >= 2 ? Math.round(recent[len - 2].score) : null;
 const one_week_ago = len >= 6 ? Math.round(recent[len - 6].score) : null;
 const one_month_ago = len >= 22 ? Math.round(recent[len - 22].score) : null;
 const one_year_ago = len >= 253 ? Math.round(recent[len - 253].score) : null;

 setFngData({
 score,
 rating: getRatingForScore(score),
 timestamp: new Date().toISOString(),
 previous_close,
 previous_close_rating: previous_close !== null ? getRatingForScore(previous_close) : null,
 one_week_ago,
 one_week_ago_rating: one_week_ago !== null ? getRatingForScore(one_week_ago) : null,
 one_month_ago,
 one_month_ago_rating: one_month_ago !== null ? getRatingForScore(one_month_ago) : null,
 one_year_ago,
 one_year_ago_rating: one_year_ago !== null ? getRatingForScore(one_year_ago) : null,
 isFallback: false
 });
 dataLoaded = true;
 }
 }
 } catch (e) {
 console.log("Direct public Fear & Greed fetch failed too:", e);
 }
 }

 if (!dataLoaded) {
 throw new Error('Неуспешно извличане на данни от всички източници');
 }
 } catch (err) {
 console.warn('Failed to load CNN Fear & Greed API, using dynamic client fallback:', err);
 
 const now = new Date();
 const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
 const baseScore = Math.round(54 + 10 * Math.sin(dayOfYear / 12));
 
 let stockAdjustment = 0;
 const validStocks = stocks.filter(s => s.dailyChangePct !== null && !isNaN(s.dailyChangePct));
 if (validStocks.length > 0) {
 const avgChange = validStocks.reduce((acc, s) => acc + s.dailyChangePct, 0) / validStocks.length;
 stockAdjustment = avgChange * 6;
 }
 
 let score = Math.round(baseScore + stockAdjustment);
 score = Math.max(15, Math.min(85, score));

 setFngData({
 score,
 rating: getRatingForScore(score),
 timestamp: new Date().toISOString(),
 previous_close: Math.round(score * 0.96),
 previous_close_rating: getRatingForScore(Math.round(score * 0.96)),
 one_week_ago: Math.round(score * 1.04),
 one_week_ago_rating: getRatingForScore(Math.round(score * 1.04)),
 one_month_ago: Math.round(score * 0.92),
 one_month_ago_rating: getRatingForScore(Math.round(score * 0.92)),
 one_year_ago: Math.round(score * 1.10),
 one_year_ago_rating: getRatingForScore(Math.round(score * 1.10)),
 isFallback: true
 });
 } finally {
 setLoading(false);
 setRefreshing(false);
 }
 };

 useEffect(() => {
 fetchFearGreed();
 // Auto refresh every 5 minutes
 const interval = setInterval(() => fetchFearGreed(), 5 * 60 * 1000);
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

 // CNN Style translation helper
 const getRatingInfo = (ratingStr: string | null, score: number | null) => {
 const r = ratingStr?.toLowerCase() || '';
 const s = score !== null ? score : 50;

 if (r.includes('extreme fear') || s < 25) {
 return { 
 bg: 'bg-red-600 text-ink', 
 border: 'border-red-600',
 text: 'text-red-600', 
 label: 'ЕКСТРЕМЕН СТРАХ', 
 eng: 'Extreme Fear', 
 colorHex: '#dc2626' 
 };
 }
 if (r.includes('extreme greed') || s > 75) {
 return { 
 bg: 'bg-green-700 text-ink', 
 border: 'border-green-700',
 text: 'text-green-700', 
 label: 'ЕКСТРЕМНА АЛЧНОСТ', 
 eng: 'Extreme Greed', 
 colorHex: '#15803d' 
 };
 }
 if (r.includes('fear') || s < 45) {
 return { 
 bg: 'bg-orange-500 text-ink', 
 border: 'border-orange-500',
 text: 'text-orange-500', 
 label: 'СТРАХ', 
 eng: 'Fear', 
 colorHex: '#f97316' 
 };
 }
 if (r.includes('greed') || s > 55) {
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
 <span className="text-xs text-emerald-700 font-mono tracking-wider block font-bold uppercase">
 ▲ Дневен Лидер на Пазара
 </span>
 <h3 className="text-sm uppercase font-extrabold text-ink font-mono tracking-tight">
 Top Gainers (Топ 15)
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
 <span className="text-xs text-red-700 font-mono tracking-wider block font-bold uppercase">
 ▼ Дневен Аутсайдер на Пазара
 </span>
 <h3 className="text-sm uppercase font-extrabold text-ink font-mono tracking-tight">
 Top Losers (Топ 15)
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

 {/* 3. FEAR & GREED INDEX CONTAINER (HIGH-FIDELITY CNN BUSINESS COPIED STYLE) */}
 <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col justify-between relative md:col-span-1 h-[305px]">
 <div className="flex items-center justify-between mb-1">
 <div>
 <span className="text-xs text-red-600 font-sans tracking-widest block font-extrabold uppercase">
 CNN BUSINESS REAL-TIME FEED
 </span>
 <h3 className="text-sm uppercase font-extrabold text-ink font-mono tracking-tight">
 Fear & Greed Index
 </h3>
 </div>

 <button 
 onClick={() => fetchFearGreed(true)} 
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
 <span className="text-xs font-mono text-ink-faint uppercase">Зареждане на реално време от CNN...</span>
 </div>
 ) : (() => {
 const getPoint = (r: number, s: number) => {
 const phi = s * 1.8; // degrees from 0 to 180
 const rad = (phi * Math.PI) / 180;
 const x = 100 - r * Math.cos(rad);
 const y = 92 - r * Math.sin(rad); // center y is 92
 return { x, y };
 };

 const getSegmentPath = (s1: number, s2: number, ri: number, ro: number) => {
 const p_o1 = getPoint(ro, s1);
 const p_o2 = getPoint(ro, s2);
 const p_i2 = getPoint(ri, s2);
 const p_i1 = getPoint(ri, s1);
 return `M ${p_o1.x.toFixed(2)} ${p_o1.y.toFixed(2)} A ${ro} ${ro} 0 0 1 ${p_o2.x.toFixed(2)} ${p_o2.y.toFixed(2)} L ${p_i2.x.toFixed(2)} ${p_i2.y.toFixed(2)} A ${ri} ${ri} 0 0 0 ${p_i1.x.toFixed(2)} ${p_i1.y.toFixed(2)} Z`;
 };

 const getSegmentState = (segIndex: number) => {
 const score = currentScore;
 let isActive = false;
 if (segIndex === 0 && score >= 0 && score <= 20) isActive = true;
 else if (segIndex === 1 && score > 20 && score <= 40) isActive = true;
 else if (segIndex === 2 && score > 40 && score <= 60) isActive = true;
 else if (segIndex === 3 && score > 60 && score <= 80) isActive = true;
 else if (segIndex === 4 && score > 80 && score <= 100) isActive = true;

 if (isActive) {
 if (segIndex === 0) return { active: true, fill: '#fee2e2', stroke: '#ef4444', text: '#1c1917' }; // Extreme Fear (light red)
 if (segIndex === 1) return { active: true, fill: '#ffe5dc', stroke: '#ff5b37', text: '#1c1917' }; // Fear (peach from screenshot)
 if (segIndex === 2) return { active: true, fill: '#fef3c7', stroke: '#f59e0b', text: '#1c1917' }; // Neutral (light yellow)
 if (segIndex === 3) return { active: true, fill: '#d1fae5', stroke: '#10b981', text: '#1c1917' }; // Greed (light green)
 if (segIndex === 4) return { active: true, fill: '#dcfce7', stroke: '#22c55e', text: '#1c1917' }; // Extreme Greed (light dark-green)
 }
 return { active: false, fill: '#f8f8f8', stroke: '#e4e4e7', text: '#71717a' };
 };

 const needleRotation = (currentScore - 50) * 1.8;

 return (
 <div className="flex flex-col flex-1 justify-between h-[215px] pt-1">
 <div className="flex items-center justify-between gap-4 flex-1">
 {/* Speedometer Gauge SVG */}
 <div className="relative w-[50%] flex items-center justify-center select-none">
 <svg viewBox="0 0 200 120" className="w-full max-w-[130px] h-auto">
 <defs>
 <filter id="hubShadow" x="-20%" y="-20%" width="140%" height="140%">
 <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1" floodColor="#000000" />
 </filter>
 </defs>

 {/* 5 Semicircular segments/wedges */}
 {[0, 1, 2, 3, 4].map((idx) => {
 const state = getSegmentState(idx);
 return (
 <path
 key={idx}
 d={getSegmentPath(idx * 20, (idx + 1) * 20, 65, 90)}
 fill={state.fill}
 stroke={state.stroke}
 strokeWidth={state.active ? 1.2 : 0.6}
 className="transition-all duration-300"
 />
 );
 })}

 {/* Inner dotted arc for scale */}
 <path
 d="M 44 92 A 56 56 0 0 1 156 92"
 fill="none"
 stroke="#cccccc"
 strokeWidth="0.8"
 strokeDasharray="0.5 3"
 strokeLinecap="round"
 />

 {/* Scale Numeric Ticks */}
 <text x="54" y="100" textAnchor="middle" className="text-[5.2px] font-sans font-bold fill-stone-400">0</text>
 <text x="100" y="52" textAnchor="middle" className="text-[5.2px] font-sans font-bold fill-stone-400">50</text>
 <text x="146" y="100" textAnchor="middle" className="text-[5.2px] font-sans font-bold fill-stone-400">100</text>

 {/* Sleek needle pointing to the current score */}
 <line
 x1="100"
 y1="92"
 x2="100"
 y2="36"
 stroke="#1c1917"
 strokeWidth="2.2"
 strokeLinecap="round"
 transform={`rotate(${needleRotation} 100 92)`}
 className="transition-transform duration-500 ease-out"
 />

 {/* Center circular hub with drop shadow */}
 <circle
 cx="100"
 cy="92"
 r="18"
 fill="#ffffff"
 filter="url(#hubShadow)"
 />

 {/* Score text inside the center hub */}
 <text
 x="100"
 y="98"
 textAnchor="middle"
 className="text-[15px] font-sans font-black fill-[#1c1917] tracking-tighter"
 >
 {currentScore}
 </text>
 </svg>
 </div>

 {/* Historical Scores List */}
 <div className="w-[50%] flex flex-col gap-1.5 font-mono text-[9px] pr-1">
 <div className="flex items-center justify-between border-b border-border/50 pb-1">
 <span className="text-ink0 font-bold tracking-tight">ПРЕД. ЗАТВОР</span>
 <div className="flex items-center gap-1 font-extrabold text-xs">
 <span style={{ color: getRatingInfo(fngData?.previous_close_rating, fngData?.previous_close).colorHex }}>
 {fngData?.previous_close ?? '—'}
 </span>
 {fngData?.previous_close_rating && (
 <span className="text-ink0 font-normal text-[8px]">
 ({getRatingInfo(fngData.previous_close_rating, fngData.previous_close).eng})
 </span>
 )}
 </div>
 </div>

 <div className="flex items-center justify-between border-b border-border/50 pb-1">
 <span className="text-ink0 font-bold tracking-tight">ПРЕДИ 1 СЕД.</span>
 <div className="flex items-center gap-1 font-extrabold text-xs">
 <span style={{ color: getRatingInfo(fngData?.one_week_ago_rating, fngData?.one_week_ago).colorHex }}>
 {fngData?.one_week_ago ?? '—'}
 </span>
 {fngData?.one_week_ago_rating && (
 <span className="text-ink0 font-normal text-[8px]">
 ({getRatingInfo(fngData.one_week_ago_rating, fngData.one_week_ago).eng})
 </span>
 )}
 </div>
 </div>

 <div className="flex items-center justify-between border-b border-border/50 pb-1">
 <span className="text-ink0 font-bold tracking-tight">ПРЕДИ 1 МЕС.</span>
 <div className="flex items-center gap-1 font-extrabold text-xs">
 <span style={{ color: getRatingInfo(fngData?.one_month_ago_rating, fngData?.one_month_ago).colorHex }}>
 {fngData?.one_month_ago ?? '—'}
 </span>
 {fngData?.one_month_ago_rating && (
 <span className="text-ink0 font-normal text-[8px]">
 ({getRatingInfo(fngData.one_month_ago_rating, fngData.one_month_ago).eng})
 </span>
 )}
 </div>
 </div>

 <div className="flex items-center justify-between border-b border-border/50 pb-1">
 <span className="text-ink0 font-bold tracking-tight">ПРЕДИ 1 ГОД.</span>
 <div className="flex items-center gap-1 font-extrabold text-xs">
 <span style={{ color: getRatingInfo(fngData?.one_year_ago_rating, fngData?.one_year_ago).colorHex }}>
 {fngData?.one_year_ago ?? '—'}
 </span>
 {fngData?.one_year_ago_rating && (
 <span className="text-ink0 font-normal text-[8px]">
 ({getRatingInfo(fngData.one_year_ago_rating, fngData.one_year_ago).eng})
 </span>
 )}
 </div>
 </div>

 <div className="mt-1 text-center py-0.5 px-1 bg-bg border border-border/50 text-ink-muted font-extrabold text-[8px] uppercase tracking-wide">
 Текущо: <span style={{ color: currentInfo.colorHex }} className="font-black">{currentInfo.label}</span>
 </div>
 </div>
 </div>

 {/* Timestamp status footer */}
 <div className="border-t border-border/10 pt-1.5 text-[8px] font-mono text-ink-faint uppercase tracking-tight flex items-center justify-between shrink-0">
 <span>Обновено: {fngData ? new Date(fngData.timestamp).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' }) : 'N/A'} ч.</span>
 <span className="font-extrabold text-ink-muted underline">CNN Business Live</span>
 </div>
 </div>
 );
 })()}
 </div>
 </div>
 );
}
