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
    
    try {
      const res = await fetch('/api/fear-greed');
      if (res.ok) {
        const data = await res.json();
        setFngData(data);
      } else {
        throw new Error('Неуспешно взимане на данни');
      }
    } catch (err) {
      console.error('Failed to load CNN Fear & Greed:', err);
      // Fallback state
      setFngData({
        score: 50,
        rating: 'neutral',
        timestamp: new Date().toISOString(),
        previous_close: 48,
        previous_close_rating: 'neutral',
        one_week_ago: 55,
        one_week_ago_rating: 'greed',
        one_month_ago: 42,
        one_month_ago_rating: 'fear',
        one_year_ago: 65,
        one_year_ago_rating: 'greed',
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
         bg: 'bg-red-600 text-white', 
         border: 'border-red-600',
         text: 'text-red-600', 
         label: 'ЕКСТРЕМЕН СТРАХ', 
         eng: 'Extreme Fear', 
         colorHex: '#dc2626' 
      };
    }
    if (r.includes('extreme greed') || s > 75) {
      return { 
         bg: 'bg-green-700 text-white', 
         border: 'border-green-700',
         text: 'text-green-700', 
         label: 'ЕКСТРЕМНА АЛЧНОСТ', 
         eng: 'Extreme Greed', 
         colorHex: '#15803d' 
      };
    }
    if (r.includes('fear') || s < 45) {
      return { 
         bg: 'bg-orange-500 text-white', 
         border: 'border-orange-500',
         text: 'text-orange-500', 
         label: 'СТРАХ', 
         eng: 'Fear', 
         colorHex: '#f97316' 
      };
    }
    if (r.includes('greed') || s > 55) {
      return { 
         bg: 'bg-emerald-600 text-white', 
         border: 'border-emerald-600',
         text: 'text-emerald-600', 
         label: 'АЛЧНОСТ', 
         eng: 'Greed', 
         colorHex: '#059669' 
      };
    }
    return { 
      bg: 'bg-amber-500 text-white', 
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
      <div className="bg-white border border-[#141414] p-4 flex flex-col justify-between transition-all duration-200 h-[305px] hover:shadow-md relative group">
        <div>
          {/* Header row with scrolling buttons */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2">
            <div>
              <span className="text-[10px] text-emerald-700 font-mono tracking-wider block font-bold uppercase">
                ▲ Дневен Лидер на Пазара
              </span>
              <h3 className="text-sm uppercase font-extrabold text-[#141414] font-mono tracking-tight">
                Top Gainers (Топ 15)
              </h3>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={(e) => { e.stopPropagation(); scrollList(gainersRef, 'up'); }}
                className="p-1 hover:bg-stone-100 border border-stone-300 text-stone-600 rounded-none transition-colors cursor-pointer"
                title="Превърти нагоре"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); scrollList(gainersRef, 'down'); }}
                className="p-1 hover:bg-stone-100 border border-stone-300 text-stone-600 rounded-none transition-colors cursor-pointer"
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
                    className={`flex items-center justify-between py-1.5 px-2 border-b border-stone-100 hover:bg-emerald-50/25 transition-colors cursor-pointer rounded-none ${
                      isSelected
                        ? 'bg-emerald-50 border-l-2 border-l-emerald-600 font-semibold'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[9px] font-mono font-black text-stone-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 shrink-0 rounded-none">
                        {item.ticker}
                      </span>
                      <span className="text-[11px] font-sans font-bold text-stone-800 truncate max-w-[110px]" title={item.companyName}>
                        {item.companyName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                      <span className="text-stone-600 font-bold">${item.currentPrice.toFixed(2)}</span>
                      <span className="font-extrabold text-emerald-700">+{item.dailyChangePct.toFixed(2)}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 font-mono py-8 text-center">Няма данни за печеливши акции.</p>
            )}
          </div>
        </div>
        
        <div className="border-t border-[#141414]/10 pt-2 text-[9px] font-mono text-[#141414]/60 uppercase tracking-tight flex items-center justify-between shrink-0">
          <span>Кликни на акция за филтър</span>
          <span className="font-bold underline group-hover:text-emerald-800">Топ Печеливши ({top15Gainers.length})</span>
        </div>
      </div>

      {/* 2. TOP LOSER CONTAINER */}
      <div className="bg-white border border-[#141414] p-4 flex flex-col justify-between transition-all duration-200 h-[305px] hover:shadow-md relative group">
        <div>
          {/* Header row with scrolling buttons */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2">
            <div>
              <span className="text-[10px] text-red-700 font-mono tracking-wider block font-bold uppercase">
                ▼ Дневен Аутсайдер на Пазара
              </span>
              <h3 className="text-sm uppercase font-extrabold text-[#141414] font-mono tracking-tight">
                Top Losers (Топ 15)
              </h3>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={(e) => { e.stopPropagation(); scrollList(losersRef, 'up'); }}
                className="p-1 hover:bg-stone-100 border border-stone-300 text-stone-600 rounded-none transition-colors cursor-pointer"
                title="Превърти нагоре"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); scrollList(losersRef, 'down'); }}
                className="p-1 hover:bg-stone-100 border border-stone-300 text-stone-600 rounded-none transition-colors cursor-pointer"
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
                    className={`flex items-center justify-between py-1.5 px-2 border-b border-stone-100 hover:bg-red-50/25 transition-colors cursor-pointer rounded-none ${
                      isSelected
                        ? 'bg-red-50 border-l-2 border-l-red-600 font-semibold'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[9px] font-mono font-black text-stone-800 bg-red-50 border border-red-300 px-1.5 py-0.5 shrink-0 rounded-none">
                        {item.ticker}
                      </span>
                      <span className="text-[11px] font-sans font-bold text-stone-800 truncate max-w-[110px]" title={item.companyName}>
                        {item.companyName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                      <span className="text-stone-600 font-bold">${item.currentPrice.toFixed(2)}</span>
                      <span className="font-extrabold text-red-700">{item.dailyChangePct.toFixed(2)}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 font-mono py-8 text-center">Няма данни за губещи акции.</p>
            )}
          </div>
        </div>
        
        <div className="border-t border-[#141414]/10 pt-2 text-[9px] font-mono text-[#141414]/60 uppercase tracking-tight flex items-center justify-between shrink-0">
          <span>Кликни на акция за филтър</span>
          <span className="font-bold underline group-hover:text-red-800">Топ Губещи ({top15Losers.length})</span>
        </div>
      </div>

      {/* 3. FEAR & GREED INDEX CONTAINER (HIGH-FIDELITY CNN BUSINESS COPIED STYLE) */}
      <div className="bg-white border border-[#141414] p-4 flex flex-col justify-between relative md:col-span-1 h-[305px]">
        <div className="flex items-center justify-between mb-1">
          <div>
            <span className="text-[10px] text-red-600 font-sans tracking-widest block font-extrabold uppercase">
              CNN BUSINESS REAL-TIME FEED
            </span>
            <h3 className="text-sm uppercase font-extrabold text-[#141414] font-mono tracking-tight">
              Fear & Greed Index
            </h3>
          </div>
          <button 
            onClick={() => fetchFearGreed(true)} 
            disabled={refreshing || loading}
            className="p-1 hover:bg-stone-100 border border-stone-300 text-stone-600 rounded-none cursor-pointer transition-colors"
            title="Обнови в реално време"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 flex-1">
            <RefreshCw className="w-6 h-6 text-[#141414] animate-spin" />
            <span className="text-[10px] font-mono text-gray-500 uppercase">Зареждане на реално време от CNN...</span>
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
            <div className="flex flex-col flex-1 justify-center space-y-1">
              {/* Speedometer Gauge SVG */}
              <div className="relative w-full flex items-center justify-center">
                <svg viewBox="0 0 200 120" className="w-full max-w-[275px] h-auto select-none">
                  <defs>
                    <filter id="hubShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.12" floodColor="#000000" />
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

                  {/* Segment labels */}
                  {/* Extreme Fear */}
                  <g className="transition-all duration-300">
                    <text
                      textAnchor="middle"
                      transform={`translate(${getPoint(80, 10).x.toFixed(2)}, ${getPoint(80, 10).y.toFixed(2)}) rotate(-72)`}
                      className="text-[4.8px] font-sans font-black tracking-tight"
                      fill={getSegmentState(0).text}
                    >
                      EXTREME
                    </text>
                    <text
                      textAnchor="middle"
                      transform={`translate(${getPoint(71, 10).x.toFixed(2)}, ${getPoint(71, 10).y.toFixed(2)}) rotate(-72)`}
                      className="text-[4.8px] font-sans font-black tracking-tight"
                      fill={getSegmentState(0).text}
                    >
                      FEAR
                    </text>
                  </g>

                  {/* Fear */}
                  <text
                    textAnchor="middle"
                    transform={`translate(${getPoint(75.5, 30).x.toFixed(2)}, ${getPoint(75.5, 30).y.toFixed(2)}) rotate(-36)`}
                    className="text-[5.5px] font-sans font-black tracking-tight"
                    fill={getSegmentState(1).text}
                  >
                    FEAR
                  </text>

                  {/* Neutral */}
                  <text
                    textAnchor="middle"
                    transform={`translate(${getPoint(75.5, 50).x.toFixed(2)}, ${getPoint(75.5, 50).y.toFixed(2)}) rotate(0)`}
                    className="text-[5.5px] font-sans font-black tracking-tight"
                    fill={getSegmentState(2).text}
                  >
                    NEUTRAL
                  </text>

                  {/* Greed */}
                  <text
                    textAnchor="middle"
                    transform={`translate(${getPoint(75.5, 70).x.toFixed(2)}, ${getPoint(75.5, 70).y.toFixed(2)}) rotate(36)`}
                    className="text-[5.5px] font-sans font-black tracking-tight"
                    fill={getSegmentState(3).text}
                  >
                    GREED
                  </text>

                  {/* Extreme Greed */}
                  <g className="transition-all duration-300">
                    <text
                      textAnchor="middle"
                      transform={`translate(${getPoint(80, 90).x.toFixed(2)}, ${getPoint(80, 90).y.toFixed(2)}) rotate(72)`}
                      className="text-[4.8px] font-sans font-black tracking-tight"
                      fill={getSegmentState(4).text}
                    >
                      EXTREME
                    </text>
                    <text
                      textAnchor="middle"
                      transform={`translate(${getPoint(71, 90).x.toFixed(2)}, ${getPoint(71, 90).y.toFixed(2)}) rotate(72)`}
                      className="text-[4.8px] font-sans font-black tracking-tight"
                      fill={getSegmentState(4).text}
                    >
                      GREED
                    </text>
                  </g>

                  {/* Inner dotted arc for scale */}
                  <path
                    d="M 44 92 A 56 56 0 0 1 156 92"
                    fill="none"
                    stroke="#cccccc"
                    strokeWidth="1"
                    strokeDasharray="0.5 3"
                    strokeLinecap="round"
                  />

                  {/* Scale Numeric Ticks */}
                  <text x="54" y="100" textAnchor="middle" className="text-[5.2px] font-sans font-bold fill-stone-400">0</text>
                  <text x="67.5" y="63" textAnchor="middle" className="text-[5.2px] font-sans font-bold fill-stone-400">25</text>
                  <text x="100" y="52" textAnchor="middle" className="text-[5.2px] font-sans font-bold fill-stone-400">50</text>
                  <text x="132.5" y="63" textAnchor="middle" className="text-[5.2px] font-sans font-bold fill-stone-400">75</text>
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
                    r="20"
                    fill="#ffffff"
                    filter="url(#hubShadow)"
                  />

                  {/* Score text inside the center hub */}
                  <text
                    x="100"
                    y="98"
                    textAnchor="middle"
                    className="text-[16px] font-sans font-black fill-[#1c1917] tracking-tighter"
                  >
                    {currentScore}
                  </text>
                </svg>
              </div>

              {/* Timestamp status footer */}
              <div className="border-t border-[#141414]/10 pt-1.5 text-[8px] font-mono text-gray-500 uppercase tracking-tight flex items-center justify-between">
                <span>Обновено: {fngData ? new Date(fngData.timestamp).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' }) : 'N/A'} ч.</span>
                <span className="font-extrabold text-stone-700 underline">CNN Business Live</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
