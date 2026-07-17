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

function IndicatorItem({ name, url, value, onChange }: { name: string; url: string; value: string; onChange: (v: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value);

  const handleSubmit = () => {
    setIsEditing(false);
    onChange(localVal);
  };

  return (
    <div className="flex items-center justify-between p-1.5 rounded-lg border border-border/40 bg-bg hover:bg-card-hover hover:border-indigo-500/30 transition-colors group">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 truncate cursor-pointer text-[10px] font-semibold text-ink group-hover:text-indigo-500 pr-1"
      >
        {name}
      </a>
      {isEditing ? (
        <input
          autoFocus
          className="w-10 text-right bg-transparent border-b border-indigo-500 text-[10px] font-mono font-bold text-ink outline-none"
          value={localVal}
          onChange={e => setLocalVal(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
      ) : (
        <span 
          onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
          className="cursor-pointer px-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[10px] font-mono font-bold text-indigo-500/80 group-hover:text-indigo-500 shrink-0 transition-colors"
          title="Кликни за редакция"
        >
          {value || '--'}
        </span>
      )}
    </div>
  );
}

export default function MarketSummaryWidgets({ stocks, activeFilter, onSetActiveFilter }: Props) {
  const [fngData, setFngData] = useState<CnnData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  
  const [fomcTimeLeft, setFomcTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  const [macroValues, setMacroValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem('macro_indicator_values');
    if (saved) {
      try {
        setMacroValues(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleMacroUpdate = (name: string, value: string) => {
    const newValues = { ...macroValues, [name]: value };
    setMacroValues(newValues);
    localStorage.setItem('macro_indicator_values', JSON.stringify(newValues));
  };

  useEffect(() => {
    const FOMC_MEETINGS = [
      new Date('2026-07-29T18:00:00Z'),
      new Date('2026-09-16T18:00:00Z'),
      new Date('2026-11-04T19:00:00Z'),
      new Date('2026-12-16T19:00:00Z'),
      new Date('2027-01-27T19:00:00Z'),
      new Date('2027-03-17T18:00:00Z'),
      new Date('2027-05-05T18:00:00Z')
    ];

    const updateTimer = () => {
      const now = new Date();
      const target = FOMC_MEETINGS.find(date => date > now) || FOMC_MEETINGS[0];
      const diff = target.getTime() - now.getTime();
      
      if (diff > 0) {
        setFomcTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60)
        });
      }
    };

    updateTimer();
    const iv = setInterval(updateTimer, 1000);
    return () => clearInterval(iv);
  }, []);

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
        setSecondsLeft(60);
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
    
    const fetchInterval = setInterval(() => {
      fetchFng();
    }, 60 * 1000);

    const timerInterval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(timerInterval);
    };
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

  {/* 3. Mixed Links Container */}
  <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col transition-all duration-200 h-[305px] hover:shadow-md relative group md:col-span-1">
    
    <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-mini-scroll pr-1">
      
      {/* Section 1: Полезни връзки */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-border/50 pb-1.5 shrink-0">
          <h3 className="text-sm uppercase font-extrabold text-ink font-mono tracking-tight">
            Полезни връзки
          </h3>
        </div>
        
        {/* Link 1: Fear & Greed Index */}
        <a 
          href="https://edition.cnn.com/markets/fear-and-greed" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50 hover:bg-card-hover hover:border-border transition-all group cursor-pointer"
        >
          <img 
            src="https://www.google.com/s2/favicons?domain=cnn.com&sz=32" 
            alt="CNN" 
            className="w-5 h-5 rounded-md bg-white/10 p-0.5"
          />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs font-bold text-ink group-hover:text-indigo-500 transition-colors truncate">
              Fear & Greed Index
            </span>
            <span className="text-[10px] text-ink-faint font-mono truncate">
              cnn.com
            </span>
          </div>
          <div className="shrink-0 text-ink-faint group-hover:text-indigo-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </div>
        </a>

        {/* Link 2: CME FedWatch Tool & FOMC Countdown */}
        <a 
          href="https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col p-2.5 rounded-xl border border-border/50 hover:bg-card-hover hover:border-border transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center gap-3 w-full">
            <img 
              src="https://www.google.com/s2/favicons?domain=cmegroup.com&sz=32" 
              alt="CME" 
              className="w-5 h-5 rounded-md bg-white/90 p-0.5"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-bold text-ink group-hover:text-indigo-500 transition-colors truncate">
                CME FedWatch Tool
              </span>
              <span className="text-[10px] text-ink-faint font-mono truncate">
                cmegroup.com
              </span>
            </div>
            <div className="shrink-0 text-ink-faint group-hover:text-indigo-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </div>
          </div>
          
          {/* FOMC Countdown Strip */}
          <div className="mt-3 pt-2 border-t border-border/30 flex flex-col gap-1">
            <span className="text-[9px] text-ink-faint font-sans uppercase font-bold tracking-wider">
              The next FOMC meeting is in:
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs font-extrabold text-ink">
              {fomcTimeLeft ? (
                <>
                  <div className="bg-bg border border-border px-1.5 py-0.5 rounded shadow-sm">{String(fomcTimeLeft.d).padStart(2, '0')}d</div>:
                  <div className="bg-bg border border-border px-1.5 py-0.5 rounded shadow-sm">{String(fomcTimeLeft.h).padStart(2, '0')}h</div>:
                  <div className="bg-bg border border-border px-1.5 py-0.5 rounded shadow-sm">{String(fomcTimeLeft.m).padStart(2, '0')}m</div>:
                  <div className="bg-bg border border-border px-1.5 py-0.5 rounded shadow-sm text-indigo-500">{String(fomcTimeLeft.s).padStart(2, '0')}s</div>
                </>
              ) : (
                <span className="animate-pulse text-ink-faint">Зареждане...</span>
              )}
            </div>
          </div>
        </a>

        {/* Link 3: Angelov Dimitar Community */}
        <a 
          href="https://angelovdimitar.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50 hover:bg-card-hover hover:border-border transition-all group cursor-pointer"
        >
          <img 
            src="https://www.google.com/s2/favicons?domain=angelovdimitar.com&sz=32" 
            alt="Angelov Dimitar" 
            className="w-5 h-5 rounded-md bg-white/10 p-0.5"
          />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs font-bold text-ink group-hover:text-indigo-500 transition-colors truncate">
              Angelov Dimitar Community
            </span>
            <span className="text-[10px] text-ink-faint font-mono truncate">
              angelovdimitar.com
            </span>
          </div>
          <div className="shrink-0 text-ink-faint group-hover:text-indigo-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </div>
        </a>
      </div>

      {/* Thin Divider Line */}
      <div className="h-px w-full bg-border/80 my-2 shrink-0" />

      {/* Section 2: Какво движи пазара? */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-border/50 pb-1.5 shrink-0">
          <h3 className="text-sm uppercase font-extrabold text-ink font-mono tracking-tight">
            Какво движи пазара?
          </h3>
        </div>
        
        {/* Indicators List */}
        <div className="flex flex-col gap-3 pb-2 mt-1">
          {[
            {
              category: "Инфлация",
              items: [
                { name: "CPI (Inflation)", url: "https://tradingeconomics.com/united-states/inflation-cpi" },
                { name: "Core CPI", url: "https://tradingeconomics.com/united-states/core-inflation-rate" },
                { name: "PCE", url: "https://tradingeconomics.com/united-states/personal-consumption-expenditures-price-index" },
                { name: "Core PCE", url: "https://tradingeconomics.com/united-states/core-pce-price-index-yoy" },
              ]
            },
            {
              category: "Централна Банка",
              items: [
                { name: "Fed Funds Rate", url: "https://tradingeconomics.com/united-states/interest-rate" },
              ]
            },
            {
              category: "Пазар на труда",
              items: [
                { name: "Non-Farm Payrolls", url: "https://tradingeconomics.com/united-states/non-farm-payrolls" },
                { name: "Unemployment Rate", url: "https://tradingeconomics.com/united-states/unemployment-rate" },
              ]
            },
            {
              category: "Икономика",
              items: [
                { name: "GDP Growth Rate", url: "https://tradingeconomics.com/united-states/gdp-growth-rate" },
                { name: "Retail Sales", url: "https://tradingeconomics.com/united-states/retail-sales" },
                { name: "Consumer Confidence", url: "https://tradingeconomics.com/united-states/consumer-confidence" },
              ]
            },
            {
              category: "Други",
              items: [
                { name: "Housing Starts", url: "https://tradingeconomics.com/united-states/housing-starts" },
                { name: "Earnings Calendar", url: "https://www.investing.com/earnings-calendar/" },
                { name: "Crude Oil", url: "https://tradingeconomics.com/commodity/crude-oil" },
                { name: "VIX Volatility", url: "https://tradingeconomics.com/vix:ind" },
              ]
            }
          ].map((group) => (
            <div key={group.category} className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-bold text-ink-faint tracking-wider pl-0.5">
                {group.category}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {group.items.map((item) => (
                  <IndicatorItem
                    key={item.name}
                    name={item.name}
                    url={item.url}
                    value={macroValues[item.name] || ''}
                    onChange={(val) => handleMacroUpdate(item.name, val)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  </div>
 </div>
 );
}
