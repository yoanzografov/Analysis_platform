import { useState, useEffect } from 'react';
import { Stock } from '../types';
import { Calculator, X, Search, DollarSign, TrendingUp, Wallet, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stocks: Stock[];
  baseCurrency?: 'USD' | 'EUR';
}

export default function ProfitCalculatorModal({ isOpen, onClose, stocks, baseCurrency = 'USD' }: Props) {
  const [ticker, setTicker] = useState('FTNT');
  const [companyName, setCompanyName] = useState('Fortinet Inc');
  const [currentPrice, setCurrentPrice] = useState('164.59');
  const [shares, setShares] = useState('6.00');
  const [avgPrice, setAvgPrice] = useState('73.80');
  const [sellShares, setSellShares] = useState('6.00');

  if (!isOpen) return null;

  const symbol = baseCurrency === 'EUR' ? '€' : '$';

  // Auto lookup stock details when ticker changes
  const handleTickerChange = (newTicker: string) => {
    const clean = newTicker.trim().toUpperCase();
    setTicker(clean);

    if (!clean) {
      setCompanyName('');
      return;
    }

    const base = clean.split('.')[0].split(':')[1] || clean.split('.')[0];
    const match = stocks.find(s => {
      const sClean = s.ticker.trim().toUpperCase();
      const sBase = sClean.split('.')[0].split(':')[1] || sClean.split('.')[0];
      return sClean === clean || sBase === base;
    });

    if (match) {
      setCompanyName(match.companyName || clean);
      if (match.currentPrice && match.currentPrice > 0) {
        setCurrentPrice(match.currentPrice.toString());
      } else if (match.priceOfCalc && match.priceOfCalc > 0) {
        setCurrentPrice(match.priceOfCalc.toString());
      }
    }
  };

  const numShares = Math.max(0, parseFloat(shares) || 0);
  const numAvgPrice = Math.max(0, parseFloat(avgPrice) || 0);
  const numCurrentPrice = Math.max(0, parseFloat(currentPrice) || 0);
  const numSellShares = Math.max(0, parseFloat(sellShares) || 0);

  // Formulas matching the exact spreadsheet math:
  const costBasis = numShares * numAvgPrice;
  const profitPerShare = numCurrentPrice - numAvgPrice;
  const rlzdPnL = numSellShares * profitPerShare;
  const totalReturnPct = (numSellShares * numAvgPrice) > 0 ? (rlzdPnL / (numSellShares * numAvgPrice)) * 100 : 0;
  const freeFunds = numSellShares * numCurrentPrice; // Cash returned upon sale

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-bg/80 backdrop-blur-md font-sans">
      <div className="w-full max-w-3xl bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header Banner */}
        <div className="bg-[#0f2757] text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Calculator className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-black italic tracking-wider uppercase">
                Profit Calculator
              </h3>
              <p className="text-[11px] text-indigo-200">
                Попълват се само <span className="bg-amber-400 text-stone-900 font-extrabold px-1 rounded">жълтите полета</span> (Тикер, Брой акции, Покупна цена)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Затвори"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Row 1: Ticker & Company Name & Live Price */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
          {/* Yellow Input: Ticker */}
          <div className="md:col-span-3">
            <label className="block text-[9px] text-ink-faint font-extrabold uppercase mb-1">
              🟨 Ticker (Тикер)
            </label>
            <div className="relative">
              <input
                type="text"
                value={ticker}
                onChange={e => handleTickerChange(e.target.value)}
                placeholder="напр. FTNT"
                className="w-full bg-amber-300 dark:bg-amber-400 text-stone-950 font-mono font-black text-center py-2 px-3 rounded-xl border-2 border-amber-500 focus:outline-none uppercase text-sm shadow-xs"
              />
            </div>
          </div>

          {/* Light Blue Auto: Company Name */}
          <div className="md:col-span-6">
            <label className="block text-[9px] text-ink-faint font-extrabold uppercase mb-1">
              🟦 Име на компанията (Автоматично)
            </label>
            <div className="w-full bg-blue-500/10 border border-blue-500/30 text-ink font-bold px-3.5 py-2 rounded-xl text-xs truncate h-[38px] flex items-center">
              {companyName || 'Търсене на компания...'}
            </div>
          </div>

          {/* Dark Blue & Coral Red: Current Price */}
          <div className="md:col-span-3">
            <label className="block text-[9px] font-extrabold uppercase mb-1 text-rose-400">
               Current Price ({symbol})
            </label>
            <input
              type="number"
              step="any"
              value={currentPrice}
              onChange={e => setCurrentPrice(e.target.value)}
              placeholder="164.59"
              className="w-full bg-rose-500/20 text-rose-400 dark:text-rose-300 font-mono font-extrabold text-center py-2 px-3 rounded-xl border border-rose-500/40 focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Row 2: Table of Position Metrics */}
        <div className="overflow-x-auto rounded-2xl border border-border/60">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-[#0f2757] text-white text-[11px] font-extrabold italic uppercase">
                <th className="py-2.5 px-3 border-r border-indigo-900/40">Shares</th>
                <th className="py-2.5 px-3 border-r border-indigo-900/40">Cost Basis</th>
                <th className="py-2.5 px-3 border-r border-indigo-900/40">Avg. Price</th>
                <th className="py-2.5 px-3 border-r border-indigo-900/40">Current Price</th>
                <th className="py-2.5 px-3 border-r border-indigo-900/40">Profit per Share</th>
                <th className="py-2.5 px-3">Rlzd P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs font-mono">
              <tr>
                {/* 🟨 Shares Input */}
                <td className="p-2 border-r border-border/40 bg-amber-300/15">
                  <input
                    type="number"
                    step="any"
                    value={shares}
                    onChange={e => {
                      setShares(e.target.value);
                      setSellShares(e.target.value);
                    }}
                    className="w-full bg-amber-300 dark:bg-amber-400 text-stone-950 font-black text-center py-1.5 rounded-lg border border-amber-500 focus:outline-none"
                  />
                </td>

                {/* 🟦 Cost Basis (Calculated) */}
                <td className="p-2.5 border-r border-border/40 bg-blue-500/10 font-extrabold text-ink">
                  {symbol}{costBasis.toFixed(2)}
                </td>

                {/* 🟨 Avg. Price Input */}
                <td className="p-2 border-r border-border/40 bg-amber-300/15">
                  <input
                    type="number"
                    step="any"
                    value={avgPrice}
                    onChange={e => setAvgPrice(e.target.value)}
                    className="w-full bg-amber-300 dark:bg-amber-400 text-stone-950 font-black text-center py-1.5 rounded-lg border border-amber-500 focus:outline-none"
                  />
                </td>

                {/* 🟨 Current Price (Calculated / Editable) */}
                <td className="p-2 border-r border-border/40 bg-amber-300/15">
                  <input
                    type="number"
                    step="any"
                    value={currentPrice}
                    onChange={e => setCurrentPrice(e.target.value)}
                    className="w-full bg-amber-300 dark:bg-amber-400 text-stone-950 font-black text-center py-1.5 rounded-lg border border-amber-500 focus:outline-none"
                  />
                </td>

                {/* 🟦 Profit per Share (Calculated) */}
                <td className={`p-2.5 border-r border-border/40 bg-blue-500/10 font-black ${profitPerShare >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {profitPerShare >= 0 ? '+' : ''}{symbol}{profitPerShare.toFixed(2)}
                </td>

                {/* 🟦 Rlzd P&L (Calculated) */}
                <td className={`p-2.5 bg-blue-500/10 font-black ${rlzdPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {rlzdPnL >= 0 ? '+' : ''}{symbol}{rlzdPnL.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Row 3: Sell Simulation & Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Sell Input Box */}
          <div className="md:col-span-3 bg-bg/60 p-3 rounded-2xl border border-border/60 space-y-1">
            <div className="bg-[#0f2757] text-white text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-lg text-center">
              Sell (Брой за продажба)
            </div>
            <input
              type="number"
              step="any"
              value={sellShares}
              onChange={e => setSellShares(e.target.value)}
              className="w-full bg-amber-300 dark:bg-amber-400 text-stone-950 font-mono font-black text-center py-1.5 rounded-xl border border-amber-500 focus:outline-none text-sm"
            />
          </div>

          {/* Profit & % Return Box */}
          <div className="md:col-span-5 bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-2xl flex items-center justify-between text-emerald-400">
            <div>
              <span className="text-[10px] font-extrabold uppercase block text-emerald-400/80">PROFIT (Печалба):</span>
              <span className="text-xl font-black font-mono">
                {rlzdPnL >= 0 ? '+' : ''}{symbol}{rlzdPnL.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase block text-emerald-400/80">% TOTAL RETURN:</span>
              <span className="text-xl font-black font-mono">
                {totalReturnPct >= 0 ? '▲ ' : '▼ '}{totalReturnPct.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Free Funds Box */}
          <div className="md:col-span-4 bg-rose-500/15 border border-rose-500/30 p-3 rounded-2xl text-rose-400 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase block text-rose-400/80">FREE FUNDS (Освободени пари):</span>
              <span className="text-xl font-black font-mono">
                {symbol}{freeFunds.toFixed(2)}
              </span>
            </div>
            <Wallet className="w-6 h-6 text-rose-400/60" />
          </div>

        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          Готово
        </button>

      </div>
    </div>
  );
}
