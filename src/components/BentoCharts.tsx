import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Stock, TableFilter } from '../types';
import { Percent, TrendingUp } from 'lucide-react';

interface Props {
 stocks: Stock[];
 activeFilter: TableFilter;
 onSetActiveFilter: (filter: TableFilter) => void;
}

export default function BentoCharts({ stocks, activeFilter, onSetActiveFilter }: Props) {
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

 // 3. Count BUY / SELL column values strictly
 const bsBuyCount = stocks.filter(s => s.buySell === 'BUY').length;
 const bsSellCount = stocks.filter(s => s.buySell === 'SELL').length;
 const bsOthersCount = stocks.filter(s => s.buySell === 'ДРУГИ').length;

 const buySellData = [
 { name: 'BUY (КУПУВАЙ)', value: bsBuyCount, color: 'var(--color-chart-buy)' },
 { name: 'SELL (ПРОДАВАЙ)', value: bsSellCount, color: 'var(--color-chart-sell)' },
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
  {/* 1. BUY / SELL Ratio Pie Chart */}
  <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col justify-between lg:col-span-1">

 <div>
 <span className="text-xs text-ink/60 font-serif italic uppercase tracking-wider block">
 BUY / SELL Weight Allocation
 </span>
 <h3 className="text-xs uppercase font-extrabold text-ink font-mono tracking-tight mb-2">
 Съотношение BUY / SELL
 </h3>
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
 <span className="text-[9px] text-ink/60 tracking-wider">АКЦИИ ОБЩО</span>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-1 mt-1 font-mono">
        <button
          onClick={() => handleFilterToggle('buySell', 'BUY')}
          className={`rounded-xl py-1.5 px-0.5 border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
            activeFilter.type === 'buySell' && activeFilter.value === 'BUY'
              ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/50'
              : 'bg-bg border-border/30 hover:bg-emerald-500/10 hover:border-emerald-500/50'
          }`}
 title="Филтрирай компании по BUY"
 >
 <div className="text-[8px] text-ink-faint uppercase font-bold tracking-tight">BUY</div>
 <div className="text-xs font-extrabold text-[#10b981]">{bsBuyCount}</div>
 </button>
        <button
          onClick={() => handleFilterToggle('buySell', 'SELL')}
          className={`rounded-xl py-1.5 px-0.5 border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
            activeFilter.type === 'buySell' && activeFilter.value === 'SELL'
              ? 'bg-rose-500/20 border-rose-500 ring-2 ring-rose-500/50'
              : 'bg-bg border-border/30 hover:bg-rose-500/10 hover:border-rose-500/50'
          }`}
 title="Филтрирай компании по SELL"
 >
 <div className="text-[8px] text-ink-faint uppercase font-bold tracking-tight">SELL</div>
 <div className="text-xs font-extrabold text-[#f43f5e]">{bsSellCount}</div>
 </button>
        <button
          onClick={() => handleFilterToggle('buySell', 'ДРУГИ')}
          className={`rounded-xl py-1.5 px-0.5 border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
            activeFilter.type === 'buySell' && activeFilter.value === 'ДРУГИ'
              ? 'bg-slate-500/20 border-slate-500 ring-2 ring-slate-500/50'
              : 'bg-bg border-border/30 hover:bg-slate-500/10 hover:border-slate-500/50'
          }`}
 title="Филтрирай компании по ДРУГИ"
 >
 <div className="text-[8px] text-ink-faint uppercase font-bold tracking-tight">ДРУГИ</div>
 <div className="text-xs font-extrabold text-ink-muted">{bsOthersCount}</div>
 </button>
 </div>
   </div>

  {/* 2. Best Deals Bar Chart */}
  <div className="bg-bg rounded-2xl border border-border p-4 lg:col-span-1">

 <div className="flex items-center justify-between mb-3">
 <div>
 <span className="text-xs text-ink/60 font-serif italic uppercase tracking-wider block">
 Deal Finder
 </span>
 <h3 className="text-xs uppercase font-extrabold text-ink font-mono tracking-tight">
 Най-подценени акции (% Разлика спрямо Справедлива цена)
 </h3>
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

 <div>
 <span className="text-xs text-ink/60 font-serif italic uppercase tracking-wider block">
 Signal Weight Allocation
 </span>
 <h3 className="text-xs uppercase font-extrabold text-ink font-mono tracking-tight mb-2">
 Съотношение Купувай / Продавай / Изчакай
 </h3>
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
 <span className="text-[9px] text-ink/60 tracking-wider">АКЦИИ ОБЩО</span>
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
 <div className="text-[8px] text-ink-faint uppercase font-bold tracking-tight">КУПУВАЙ</div>
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
 <div className="text-[8px] text-ink-faint uppercase font-bold tracking-tight">ПРОДАВАЙ</div>
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
 <div className="text-[8px] text-ink-faint uppercase font-bold tracking-tight">ИЗЧАКАЙ</div>
 <div className="text-xs font-extrabold text-amber-800">{signalHoldCount}</div>
 </button>
 </div>
   </div>
  </div>
  );
}
