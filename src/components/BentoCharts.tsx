import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Stock, TableFilter } from '../types';
import { Percent, TrendingUp, Info, Settings2 } from 'lucide-react';

interface Props {
  stocks: Stock[];
  activeFilter: TableFilter;
  onSetActiveFilter: (filter: TableFilter) => void;
  buyThreshold: number;
  sellThreshold: number;
  onUpdateThresholds: (buy: number, sell: number) => void;
  signalThreshold: number;
  onUpdateSignalThreshold: (val: number) => void;
}

export default function BentoCharts({ stocks, activeFilter, onSetActiveFilter, buyThreshold, sellThreshold, onUpdateThresholds, signalThreshold, onUpdateSignalThreshold }: Props) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const [showSignalContextMenu, setShowSignalContextMenu] = useState(false);
  const signalContextMenuRef = useRef<HTMLDivElement>(null);

  const [localBuy, setLocalBuy] = useState(buyThreshold);
  const [localSell, setLocalSell] = useState(sellThreshold);
  const [localSignal, setLocalSignal] = useState(signalThreshold);

  useEffect(() => {
    setLocalBuy(buyThreshold);
    setLocalSell(sellThreshold);
  }, [buyThreshold, sellThreshold, showContextMenu]);

  useEffect(() => {
    setLocalSignal(signalThreshold);
  }, [signalThreshold, showSignalContextMenu]);

  // Close context menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setShowContextMenu(false);
      }
      if (signalContextMenuRef.current && !signalContextMenuRef.current.contains(e.target as Node)) {
        setShowSignalContextMenu(false);
      }
    };
    if (showContextMenu || showSignalContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContextMenu, showSignalContextMenu]);

 // 1. Calculate the values for "Best Deals"
 const undervaluedStocks = [...stocks]
 .filter(s => s.difference !== null && s.difference > 0 && s.fairPrice !== null)
 .sort((a, b) => (b.difference || 0) - (a.difference || 0))
 .slice(0, 6)
 .map(s => ({
 ticker: s.ticker,
 difference: s.difference,
 currentPrice: s.currentPrice,
 fairPrice: s.fairPrice,
 }));

 // 2. Count signals for allocation breakdown - SIGNAL column
 const signalBuyCount = stocks.filter(s => s.signal?.trim().toLowerCase() === 'buy').length;
 const signalSellCount = stocks.filter(s => s.signal?.trim().toLowerCase() === 'sell').length;
 const signalHoldCount = stocks.filter(s => {
 const val = s.signal?.trim().toLowerCase();
 return val === 'hold' || val === 'изчакай' || !val || val === '-';
 }).length;

 const signalData = [
  { name: 'КУПУВАЙ (BUY)', value: signalBuyCount, color: 'var(--color-chart-buy)' },
  { name: 'ПРОДАВАЙ (SELL)', value: signalSellCount, color: 'var(--color-chart-sell)' },
  { name: 'ИЗЧАКАЙ (HOLD)', value: signalHoldCount, color: 'var(--color-chart-hold)' },
 ].filter(d => d.value > 0);

 // 3. Count Over/Under column values strictly
 const bsBuyCount = stocks.filter(s => s.buySell === 'UNDERVALUED').length;
 const bsSellCount = stocks.filter(s => s.buySell === 'OVERVALUED').length;
 const bsOthersCount = stocks.filter(s => s.buySell === 'ДРУГИ').length;

 const buySellData = [
 { name: 'UNDERVALUED', value: bsBuyCount, color: 'var(--color-chart-buy)' },
 { name: 'OVERVALUED', value: bsSellCount, color: 'var(--color-chart-sell)' },
 { name: 'ДРУГИ (OTHER)', value: bsOthersCount, color: 'var(--color-chart-other)' },
 ];
 const buySellDataFiltered = buySellData.filter(d => d.value > 0);

 const handleFilterToggle = (type: TableFilter['type'], value: string) => {
 if (activeFilter.type === type && activeFilter.value === value) {
 onSetActiveFilter({ type: 'all', value: 'all' });
 } else {
 onSetActiveFilter({ type, value });
 setTimeout(() => {
 document.getElementById('stock-table-section')?.scrollIntoView({ behavior: 'smooth' });
 }, 80);
 }
 };



   return (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
  {/* 1. OVER / UNDER Ratio Pie Chart */}
  <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col justify-between lg:col-span-1">
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
 <div className="flex-1">
 <span className="text-xs text-ink/60 font-serif italic uppercase tracking-wider block">
 OVER / UNDER Weight Allocation
 </span>
 <div className="flex items-center gap-1.5">
 <h3 className="text-xs sm:text-xs uppercase font-extrabold text-ink font-mono tracking-tight mb-2">
 Съотношение OVER / UNDER
 </h3>
 <div className="group/info relative flex items-center -mt-2">
   <Info className="w-3.5 h-3.5 text-ink-faint hover:text-ink cursor-help transition-colors" />
   <div className="absolute top-full mt-2 left-0 hidden group-hover/info:block w-64 p-3 bg-gray-900 text-white text-sm leading-snug rounded-lg shadow-xl z-[200] pointer-events-none whitespace-normal normal-case font-sans border border-gray-700">
     <span className="font-bold block mb-1 uppercase tracking-wide text-xs">📈 OVER / UNDER Weight Allocation</span>
     Кръговата диаграма показва разпределението на всички акции по колоната <strong>Over/Under</strong>.<br/><br/>
     <span className="text-emerald-400 font-bold">UNDERVALUED</span> = Текущата цена е под Справедливата с повече от -{buyThreshold}%<br/>
     <span className="text-rose-400 font-bold">OVERVALUED</span> = Текущата цена е над Справедливата с повече от +{sellThreshold}%<br/>
     <span className="text-slate-400 font-bold">ДРУГИ</span> = В средата между двата прага<br/><br/>
     Натисни UNDERVALUED, OVERVALUED или ДРУГИ за да филтрираш таблицата.
   </div>
 </div>
 </div>
 </div>
 
 <div className="relative">
   <button 
     onClick={(e) => { e.stopPropagation(); setShowContextMenu(!showContextMenu); }}
     className="p-1.5 rounded-lg hover:bg-black/10 text-ink-muted hover:text-ink transition-colors"
     title="Настройки на праговете"
   >
     <Settings2 className="w-4 h-4" />
   </button>
   
   {showContextMenu && (
     <div 
       ref={contextMenuRef}
       onClick={(e) => e.stopPropagation()}
       className="absolute top-full right-0 mt-1 w-48 bg-bg border border-border rounded-xl shadow-2xl z-[200] p-3 cursor-default"
     >
       <div className="text-xs font-extrabold text-ink mb-2 border-b border-border/50 pb-1 uppercase tracking-tight text-left">
         Настройки на ДРУГИ
       </div>
       <div className="flex flex-col gap-2 font-mono text-xs text-left">
         <div className="flex items-center justify-between">
           <span className="text-red-500 font-bold">+ SELL %</span>
           <input 
             type="number" 
             value={localSell}
             onChange={e => {
               const val = Number(e.target.value);
               if (!isNaN(val)) setLocalSell(val);
             }}
             onKeyDown={e => {
               if (e.key === 'Enter') {
                 if (localSell >= 0 && localBuy >= 0) onUpdateThresholds(localBuy, localSell);
                 setShowContextMenu(false);
               } else if (e.key === 'Escape') {
                 setLocalSell(sellThreshold);
                 setLocalBuy(buyThreshold);
                 setShowContextMenu(false);
               }
             }}
             className="w-12 bg-black/20 border border-border rounded text-center focus:outline-none focus:border-indigo-500 p-0.5 text-ink"
           />
         </div>
         <div className="flex items-center justify-between">
           <span className="text-emerald-500 font-bold">- BUY %</span>
           <input 
             type="number" 
             value={localBuy}
             onChange={e => {
               const val = Number(e.target.value);
               if (!isNaN(val)) setLocalBuy(val);
             }}
             onKeyDown={e => {
               if (e.key === 'Enter') {
                 if (localSell >= 0 && localBuy >= 0) onUpdateThresholds(localBuy, localSell);
                 setShowContextMenu(false);
               } else if (e.key === 'Escape') {
                 setLocalSell(sellThreshold);
                 setLocalBuy(buyThreshold);
                 setShowContextMenu(false);
               }
             }}
             className="w-12 bg-black/20 border border-border rounded text-center focus:outline-none focus:border-indigo-500 p-0.5 text-ink"
           />
         </div>
       </div>
     </div>
   )}
 </div>
 </div>

 <div className="h-32 relative flex items-center justify-center my-1.5">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={buySellDataFiltered}
 cx="50%"
 cy="50%"
 innerRadius={42}
 outerRadius={56}
 paddingAngle={2}
 dataKey="value"
 >
 {buySellDataFiltered.map((entry, index) => (
 <Cell key={`cell-bs-${index}`} fill={entry.color} />
 ))}
 </Pie>
 </PieChart>
 </ResponsiveContainer>
 <div className="absolute flex flex-col items-center justify-center font-mono">
 <span className="text-xl font-extrabold text-ink">{stocks.length}</span>
 <span className="text-sm text-ink/60 tracking-wider">АКЦИИ ОБЩО</span>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-1 mt-1 font-mono">
        <button
          onClick={() => handleFilterToggle('buySell', 'UNDERVALUED')}
          className={`rounded-xl py-1.5 px-0.5 border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
            activeFilter.type === 'buySell' && activeFilter.value === 'UNDERVALUED'
              ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/50'
              : 'bg-bg border-border/30 hover:bg-emerald-500/10 hover:border-emerald-500/50'
          }`}
 title="Филтрирай компании по UNDERVALUED"
 >
 <div className="text-xs text-ink-faint uppercase font-bold tracking-tight">UNDERVALUED</div>
 <div className="text-xs font-extrabold text-[#10b981]">{bsBuyCount}</div>
 </button>
        <button
          onClick={() => handleFilterToggle('buySell', 'OVERVALUED')}
          className={`rounded-xl py-1.5 px-0.5 border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
            activeFilter.type === 'buySell' && activeFilter.value === 'OVERVALUED'
              ? 'bg-rose-500/20 border-rose-500 ring-2 ring-rose-500/50'
              : 'bg-bg border-border/30 hover:bg-rose-500/10 hover:border-rose-500/50'
          }`}
 title="Филтрирай компании по OVERVALUED"
 >
 <div className="text-xs text-ink-faint uppercase font-bold tracking-tight">OVERVALUED</div>
 <div className="text-xs font-extrabold text-[#f43f5e]">{bsSellCount}</div>
 </button>
        <button
          onClick={() => handleFilterToggle('buySell', 'ДРУГИ')}
          className={`rounded-xl py-1.5 px-0.5 border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center relative ${
            activeFilter.type === 'buySell' && activeFilter.value === 'ДРУГИ'
              ? 'bg-slate-500/20 border-slate-500 ring-2 ring-slate-500/50'
              : 'bg-bg border-border/30 hover:bg-slate-500/10 hover:border-slate-500/50'
          }`}
 title="Филтрирай компании по ДРУГИ"
 >
 <div className="text-xs text-ink-faint uppercase font-bold tracking-tight flex items-center justify-center gap-1 group/info relative">
 ДРУГИ
 <Info className="w-3 h-3 text-ink-faint hover:text-ink transition-colors" />
 <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-72 p-3 bg-bg border border-border rounded-xl shadow-xl text-xs text-ink text-left opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-[100] font-mono normal-case">
 <span className="font-extrabold block mb-1">Как се изчислява?</span>
 <span className="text-emerald-500 font-bold">UNDERVALUED:</span> Отклонение &lt; -{buyThreshold}%<br />
 <span className="text-red-500 font-bold">OVERVALUED:</span> Отклонение &gt; {sellThreshold}%<br />
 <span className="text-blue-500 font-bold">ДРУГИ:</span> Между -{buyThreshold}% и +{sellThreshold}%<br /><br />
 <span className="text-ink-muted block leading-tight">Отклонението е процентната разлика между Текущата и Справедливата цена. Можете да промените тези прагове от иконката за настройки в горния десен ъгъл.</span>
 </div>
 </div>
 <div className="text-xs font-extrabold text-ink-muted">{bsOthersCount}</div>
 </button>
 </div>
   </div>

  {/* 2. Best Deals Bar Chart */}
  <div className="bg-bg rounded-2xl border border-border p-4 lg:col-span-1">

 <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
 <div>
 <span className="text-xs text-ink/60 font-serif italic uppercase tracking-wider block">
 Deal Finder
 </span>
 <div className="flex items-center gap-1.5">
 <h3 className="text-xs uppercase font-extrabold text-ink font-mono tracking-tight">
 Най-подценени акции (% Разлика спрямо Справедлива цена)
 </h3>
 <div className="group/info relative flex items-center shrink-0">
   <Info className="w-3.5 h-3.5 text-ink-faint hover:text-ink cursor-help transition-colors" />
   <div className="absolute top-full mt-2 left-0 hidden group-hover/info:block w-64 p-3 bg-gray-900 text-white text-sm leading-snug rounded-lg shadow-xl z-[200] pointer-events-none whitespace-normal normal-case font-sans border border-gray-700">
     <span className="font-bold block mb-1 uppercase tracking-wide text-xs">🔍 Deal Finder</span>
     Показва топ 6 най-подценени акции от твоя портфейл.<br/><br/>
     Сортирани по <strong>% разлика</strong> между Справедливата и Текущата цена — колкото по-висок %, толкова по-голям потенциал за растеж.<br/><br/>
     <span className="text-emerald-400">Положителна стойност</span> = Акцията се търгува <strong>под</strong> справедливата си цена (добра сделка).
   </div>
 </div>
 </div>
 </div>
 <div className="p-1 px-1.5 bg-[#D9D8D5] border border-border rounded-none">
 <Percent className="w-3.5 h-3.5 text-ink" />
 </div>
 </div>

 <div className="h-48 mt-2">
 {undervaluedStocks.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-center text-ink/70 font-mono text-xs">
 Няма намерени подценени акции (Fair Price &gt; Current Price)
 </div>
 ) : (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={undervaluedStocks} margin={{ top: 10, right: 10, left: -30, bottom: 5 }}>
 <XAxis
 dataKey="ticker"
 stroke="var(--color-ink-muted)"
 fontSize={10}
 tickLine={true}
 fontFamily="monospace"
 />
 <YAxis
 stroke="var(--color-ink-muted)"
 fontSize={10}
 tickLine={true}
 axisLine={true}
 fontFamily="monospace"
 unit="%"
 />
 <Tooltip
 cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
 content={({ active, payload }) => {
 if (active && payload && payload.length) {
 const data = payload[0].payload;
 return (
 <div className="bg-bg border border-border px-3 py-2 text-xs font-mono text-ink shadow-md">
 <p className="font-extrabold mb-1 tracking-wider">{data.ticker}</p>
 <p className="text-[#10b981]">Справедлива: ${data.fairPrice}</p>
 <p className="text-ink-faint">Текуща цена: ${data.currentPrice}</p>
 <p className="text-[#0d7a3f] font-extrabold mt-1">Подценена с +{data.difference}%</p>
 </div>
 );
 }
 return null;
 }}
 />
 <Bar dataKey="difference" fill="var(--color-ink)" radius={0} />
 </BarChart>
 </ResponsiveContainer>
 )}
 </div>
   </div>

  {/* 3. Signals Pie Chart */}
  <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col justify-between lg:col-span-1">

 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
 <div className="flex-1">
 <span className="text-xs text-ink/60 font-serif italic uppercase tracking-wider block">
 Signal Weight Allocation
 </span>
 <div className="flex items-center gap-1.5">
 <h3 className="text-xs sm:text-xs uppercase font-extrabold text-ink font-mono tracking-tight mb-2">
 Съотношение Купувай / Продавай / Изчакай
 </h3>
  <div className="group/info relative flex items-center -mt-2">
    <Info className="w-3.5 h-3.5 text-ink-faint hover:text-ink cursor-help transition-colors" />
    <div className="absolute top-full mt-2 left-0 hidden group-hover/info:block w-72 p-3 bg-gray-900 text-white text-sm leading-snug rounded-lg shadow-xl z-[200] pointer-events-none whitespace-normal normal-case font-sans border border-gray-700">
      <span className="font-bold block mb-1 uppercase tracking-wide text-xs">📊 Signal Weight Allocation</span>
      Сигналът се изчислява автоматично спрямо <strong>52-Week Low</strong> и <strong>52-Week High</strong>:<br/><br/>
      <span className="text-yellow-300 font-mono text-xs block mb-2">IF(Цена ≤ 52W-Low × {1 + signalThreshold/100} → Buy<br/>IF(Цена ≥ 52W-High × {1 - signalThreshold/100} → Sell<br/>иначе → Hold)</span>
      <span className="text-emerald-400 font-bold">КУПУВАЙ</span> = Цената е до {signalThreshold}% над 52-Week Low (евтина!)<br/>
      <span className="text-amber-400 font-bold">ИЗЧАКАЙ</span> = Цената е между двата прага<br/>
      <span className="text-rose-400 font-bold">ПРОДАВАЙ</span> = Цената е до {signalThreshold}% под 52-Week High (скъпа!)<br/><br/>
      Сигналът се изчислява <strong>винаги автоматично</strong> — ръчна промяна не се запазва.<br/><br/>
      Натисни всеки сегмент за да филтрираш таблицата по сигнал.
    </div>
  </div>
 </div>
 </div>

 <div className="relative">
   <button 
     onClick={(e) => { e.stopPropagation(); setShowSignalContextMenu(!showSignalContextMenu); }}
     className="p-1.5 rounded-lg hover:bg-black/10 text-ink-muted hover:text-ink transition-colors"
     title="Настройки на праговете"
   >
     <Settings2 className="w-4 h-4" />
   </button>
   
   {showSignalContextMenu && (
     <div 
       ref={signalContextMenuRef}
       onClick={(e) => e.stopPropagation()}
       className="absolute top-full right-0 mt-1 w-48 bg-bg border border-border rounded-xl shadow-2xl z-[200] p-3 cursor-default"
     >
       <div className="text-xs font-extrabold text-ink mb-2 border-b border-border/50 pb-1 uppercase tracking-tight text-left">
         Настройки на СИГНАЛ
       </div>
       <div className="flex flex-col gap-2 font-mono text-xs text-left">
         <div className="flex items-center justify-between">
            <span className="text-indigo-500 font-bold">Отстояние %</span>
            <input 
              type="number" 
              value={localSignal}
              onChange={e => {
                const val = Number(e.target.value);
                if (!isNaN(val)) setLocalSignal(val);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (localSignal >= 0) onUpdateSignalThreshold(localSignal);
                  setShowSignalContextMenu(false);
                } else if (e.key === 'Escape') {
                  setLocalSignal(signalThreshold);
                  setShowSignalContextMenu(false);
                }
              }}
              className="w-12 bg-black/20 border border-border rounded text-center focus:outline-none focus:border-indigo-500 p-0.5 text-ink"
            />
         </div>
       </div>
     </div>
   )}
 </div>
 </div>

 <div className="h-32 relative flex items-center justify-center my-1.5">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={signalData}
 cx="50%"
 cy="50%"
 innerRadius={42}
 outerRadius={56}
 paddingAngle={2}
 dataKey="value"
 >
 {signalData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 </PieChart>
 </ResponsiveContainer>
 <div className="absolute flex flex-col items-center justify-center font-mono">
 <span className="text-xl font-extrabold text-ink">{stocks.length}</span>
 <span className="text-sm text-ink/60 tracking-wider">АКЦИИ ОБЩО</span>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-1 mt-1 font-mono">
        <button
          onClick={() => handleFilterToggle('signal', 'buy')}
          className={`rounded-xl py-1.5 px-0.5 border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
            activeFilter.type === 'signal' && activeFilter.value === 'buy'
              ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/50'
              : 'bg-bg border-border/30 hover:bg-emerald-500/10 hover:border-emerald-500/50'
          }`}
 title="Филтрирай компании по Сигнал КУПУВАЙ"
 >
 <div className="text-xs text-ink-faint uppercase font-bold tracking-tight">КУПУВАЙ</div>
 <div className="text-xs font-extrabold text-[#10b981]">{signalBuyCount}</div>
 </button>
        <button
          onClick={() => handleFilterToggle('signal', 'sell')}
          className={`rounded-xl py-1.5 px-0.5 border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
            activeFilter.type === 'signal' && activeFilter.value === 'sell'
              ? 'bg-rose-500/20 border-rose-500 ring-2 ring-rose-500/50'
              : 'bg-bg border-border/30 hover:bg-rose-500/10 hover:border-rose-500/50'
          }`}
 title="Филтрирай компании по Сигнал ПРОДАВАЙ"
 >
 <div className="text-xs text-ink-faint uppercase font-bold tracking-tight">ПРОДАВАЙ</div>
 <div className="text-xs font-extrabold text-[#f43f5e]">{signalSellCount}</div>
 </button>
        <button
          onClick={() => handleFilterToggle('signal', 'hold')}
          className={`rounded-xl py-1.5 px-0.5 border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
            activeFilter.type === 'signal' && activeFilter.value === 'hold'
              ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/50'
              : 'bg-bg border-border/30 hover:bg-amber-500/10 hover:border-amber-500/50'
          }`}
 title="Филтрирай компании по Сигнал ИЗЧАКАЙ"
 >
 <div className="text-xs text-ink-faint uppercase font-bold tracking-tight">ИЗЧАКАЙ</div>
 <div className="text-xs font-extrabold text-amber-800">{signalHoldCount}</div>
 </button>
 </div>
   </div>
  </div>
  );
}
