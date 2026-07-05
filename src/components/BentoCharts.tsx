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
    { name: 'КУПУВАЙ (BUY)', value: signalBuyCount, color: '#0d7a3f' },
    { name: 'ПРОДАВАЙ (SELL)', value: signalSellCount, color: '#c5221f' },
    { name: 'ИЗЧАКАЙ (HOLD)', value: signalHoldCount, color: '#b06000' },
  ].filter(d => d.value > 0);

  // 3. Count BUY / SELL column values strictly
  const bsBuyCount = stocks.filter(s => s.buySell === 'BUY').length;
  const bsSellCount = stocks.filter(s => s.buySell === 'SELL').length;
  const bsOthersCount = stocks.filter(s => s.buySell === 'ДРУГИ').length;

  const buySellData = [
    { name: 'BUY (КУПУВАЙ)', value: bsBuyCount, color: '#0d7a3f' },
    { name: 'SELL (ПРОДАВАЙ)', value: bsSellCount, color: '#c5221f' },
    { name: 'ДРУГИ (OTHER)', value: bsOthersCount, color: '#7c7c7c' },
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-5">
      {/* 1. Best Deals Bar Chart */}
      <div className="bg-white rounded-none border border-[#141414] p-4 lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] text-[#141414]/60 font-serif italic uppercase tracking-wider block">
              Deal Finder
            </span>
            <h3 className="text-xs uppercase font-extrabold text-[#141414] font-mono tracking-tight">
              Най-подценени акции (% Разлика спрямо Справедлива цена)
            </h3>
          </div>
          <div className="p-1 px-1.5 bg-[#D9D8D5] border border-[#141414] rounded-none">
            <Percent className="w-3.5 h-3.5 text-[#141414]" />
          </div>
        </div>

        <div className="h-48 mt-2">
          {undervaluedStocks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#141414]/70 font-mono text-xs">
              Няма намерени подценени акции (Fair Price &gt; Current Price)
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={undervaluedStocks} margin={{ top: 10, right: 10, left: -30, bottom: 5 }}>
                <XAxis
                  dataKey="ticker"
                  stroke="#141414"
                  fontSize={10}
                  tickLine={true}
                  fontFamily="monospace"
                />
                <YAxis
                  stroke="#141414"
                  fontSize={10}
                  tickLine={true}
                  axisLine={true}
                  fontFamily="monospace"
                  unit="%"
                />
                <Tooltip
                  cursor={{ fill: 'rgba(20, 20, 20, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#141414] rounded-none px-3 py-2 text-xs font-mono text-[#141414]">
                          <p className="font-extrabold mb-1 tracking-wider">{data.ticker}</p>
                          <p className="text-emerald-800">Справедлива: ${data.fairPrice}</p>
                          <p className="text-gray-600">Текуща цена: ${data.currentPrice}</p>
                          <p className="text-[#0d7a3f] font-extrabold mt-1">Подценена с +{data.difference}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="difference" fill="#141414" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Signals Pie Chart */}
      <div className="bg-white rounded-none border border-[#141414] p-4 flex flex-col justify-between lg:col-span-1">
        <div>
          <span className="text-[10px] text-[#141414]/60 font-serif italic uppercase tracking-wider block">
            Signal Weight Allocation
          </span>
          <h3 className="text-xs uppercase font-extrabold text-[#141414] font-mono tracking-tight mb-2">
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
            <span className="text-xl font-extrabold text-[#141414]">{stocks.length}</span>
            <span className="text-[9px] text-[#141414]/60 tracking-wider">АКЦИИ ОБЩО</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 mt-1 font-mono">
          <button
            onClick={() => handleFilterToggle('signal', 'buy')}
            className={`rounded-none py-1.5 px-0.5 border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
              activeFilter.type === 'signal' && activeFilter.value === 'buy'
                ? 'bg-emerald-50 border-emerald-800 ring-2 ring-emerald-800'
                : 'bg-white border-[#141414]/30 hover:bg-emerald-50/40 hover:border-emerald-650'
            }`}
            title="Филтрирай компании по Сигнал КУПУВАЙ"
          >
            <div className="text-[8px] text-gray-500 uppercase font-bold tracking-tight">КУПУВАЙ</div>
            <div className="text-xs font-extrabold text-emerald-800">{signalBuyCount}</div>
          </button>
          <button
            onClick={() => handleFilterToggle('signal', 'sell')}
            className={`rounded-none py-1.5 px-0.5 border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
              activeFilter.type === 'signal' && activeFilter.value === 'sell'
                ? 'bg-red-50 border-red-800 ring-2 ring-red-800'
                : 'bg-white border-[#141414]/30 hover:bg-red-50/40 hover:border-red-650'
            }`}
            title="Филтрирай компании по Сигнал ПРОДАВАЙ"
          >
            <div className="text-[8px] text-gray-500 uppercase font-bold tracking-tight">ПРОДАВАЙ</div>
            <div className="text-xs font-extrabold text-red-800">{signalSellCount}</div>
          </button>
          <button
            onClick={() => handleFilterToggle('signal', 'hold')}
            className={`rounded-none py-1.5 px-0.5 border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
              activeFilter.type === 'signal' && activeFilter.value === 'hold'
                ? 'bg-amber-50 border-amber-800 ring-2 ring-amber-800'
                : 'bg-white border-[#141414]/30 hover:bg-amber-50/40 hover:border-amber-650'
            }`}
            title="Филтрирай компании по Сигнал ИЗЧАКАЙ"
          >
            <div className="text-[8px] text-gray-500 uppercase font-bold tracking-tight">ИЗЧАКАЙ</div>
            <div className="text-xs font-extrabold text-amber-800">{signalHoldCount}</div>
          </button>
        </div>
      </div>

      {/* 3. BUY / SELL Ratio Pie Chart */}
      <div className="bg-white rounded-none border border-[#141414] p-4 flex flex-col justify-between lg:col-span-1">
        <div>
          <span className="text-[10px] text-[#141414]/60 font-serif italic uppercase tracking-wider block">
            BUY / SELL Weight Allocation
          </span>
          <h3 className="text-xs uppercase font-extrabold text-[#141414] font-mono tracking-tight mb-2">
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
            <span className="text-xl font-extrabold text-[#141414]">{stocks.length}</span>
            <span className="text-[9px] text-[#141414]/60 tracking-wider">АКЦИИ ОБЩО</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 mt-1 font-mono">
          <button
            onClick={() => handleFilterToggle('buySell', 'BUY')}
            className={`rounded-none py-1.5 px-0.5 border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
              activeFilter.type === 'buySell' && activeFilter.value === 'BUY'
                ? 'bg-emerald-50 border-emerald-800 ring-2 ring-emerald-800'
                : 'bg-white border-[#141414]/30 hover:bg-emerald-50/40 hover:border-emerald-650'
            }`}
            title="Филтрирай компании по BUY"
          >
            <div className="text-[8px] text-gray-500 uppercase font-bold tracking-tight">BUY</div>
            <div className="text-xs font-extrabold text-emerald-800">{bsBuyCount}</div>
          </button>
          <button
            onClick={() => handleFilterToggle('buySell', 'SELL')}
            className={`rounded-none py-1.5 px-0.5 border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
              activeFilter.type === 'buySell' && activeFilter.value === 'SELL'
                ? 'bg-red-50 border-red-800 ring-2 ring-red-800'
                : 'bg-white border-[#141414]/30 hover:bg-red-50/40 hover:border-red-650'
            }`}
            title="Филтрирай компании по SELL"
          >
            <div className="text-[8px] text-gray-500 uppercase font-bold tracking-tight">SELL</div>
            <div className="text-xs font-extrabold text-red-800">{bsSellCount}</div>
          </button>
          <button
            onClick={() => handleFilterToggle('buySell', 'ДРУГИ')}
            className={`rounded-none py-1.5 px-0.5 border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
              activeFilter.type === 'buySell' && activeFilter.value === 'ДРУГИ'
                ? 'bg-gray-100 border-gray-600 ring-2 ring-gray-600'
                : 'bg-white border-[#141414]/30 hover:bg-gray-50/40 hover:border-gray-600'
            }`}
            title="Филтрирай компании по ДРУГИ"
          >
            <div className="text-[8px] text-gray-500 uppercase font-bold tracking-tight">ДРУГИ</div>
            <div className="text-xs font-extrabold text-gray-700">{bsOthersCount}</div>
          </button>
        </div>
      </div>

    </div>
  );
}
