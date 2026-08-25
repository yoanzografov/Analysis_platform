import { useState } from 'react';
import { Stock } from '../types';
import { Calculator, X, Wallet, TrendingUp } from 'lucide-react';

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

  // Formulas matching exact spreadsheet math:
  const costBasis = numShares * numAvgPrice;
  const profitPerShare = numCurrentPrice - numAvgPrice;
  const rlzdPnL = numSellShares * profitPerShare;
  const totalReturnPct = (numSellShares * numAvgPrice) > 0 ? (rlzdPnL / (numSellShares * numAvgPrice)) * 100 : 0;
  const freeFunds = numSellShares * numCurrentPrice; // Cash returned upon sale

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-bg/80 backdrop-blur-md font-sans">
      <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Banner - Native Platform Style */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-ink tracking-wider">
                Profit Calculator
              </h3>
              <p className="text-[10px] text-ink-faint">
                Попълват се само <span className="text-amber-400 font-extrabold">жълтите полета</span> (Тикер, Брой акции, Покупна цена)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-faint hover:text-ink hover:bg-card-hover transition-all cursor-pointer"
            title="Затвори"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Row 1: Ticker & Company Name & Current Price */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          {/* Ticker Input (Yellow Theme) */}
          <div className="md:col-span-3">
            <label className="block text-[9px] text-amber-400 font-extrabold uppercase mb-1 flex items-center gap-1">
              <span>🟨 Ticker</span>
            </label>
            <input
              type="text"
              value={ticker}
              onChange={e => handleTickerChange(e.target.value)}
              placeholder="напр. FTNT"
              className="w-full bg-amber-500/20 text-amber-300 dark:text-amber-300 font-mono font-black text-center py-1.5 px-2.5 rounded-xl border border-amber-500/50 focus:outline-none focus:border-amber-400 uppercase text-xs shadow-xs"
            />
          </div>

          {/* Company Name (Auto Light Blue Theme) */}
          <div className="md:col-span-6">
            <label className="block text-[9px] text-indigo-400 font-extrabold uppercase mb-1">
              🟦 Име на компанията
            </label>
            <div className="w-full bg-indigo-500/10 border border-indigo-500/30 text-ink font-bold px-3 py-1.5 rounded-xl text-xs truncate h-[34px] flex items-center">
              {companyName || 'Търсене на компания...'}
            </div>
          </div>

          {/* Current Price (Coral/Red Theme) */}
          <div className="md:col-span-3">
            <label className="block text-[9px] text-rose-400 font-extrabold uppercase mb-1">
              Current Price ({symbol})
            </label>
            <input
              type="number"
              step="any"
              value={currentPrice}
              onChange={e => setCurrentPrice(e.target.value)}
              placeholder="164.59"
              className="w-full bg-rose-500/15 text-rose-400 dark:text-rose-300 font-mono font-extrabold text-center py-1.5 px-2.5 rounded-xl border border-rose-500/30 focus:outline-none text-xs"
            />
          </div>
        </div>

        {/* Row 2: Table of Position Metrics (Native Compact Styling) */}
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-bg/80 text-ink-faint text-[10px] font-black uppercase tracking-tight border-b border-border/50">
                <th className="py-2 px-2 border-r border-border/40">Shares</th>
                <th className="py-2 px-2 border-r border-border/40">Cost Basis</th>
                <th className="py-2 px-2 border-r border-border/40">Avg. Price</th>
                <th className="py-2 px-2 border-r border-border/40">Current Price</th>
                <th className="py-2 px-2 border-r border-border/40">Profit / Share</th>
                <th className="py-2 px-2">Rlzd P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs font-mono">
              <tr>
                {/* 🟨 Shares Input */}
                <td className="p-1.5 border-r border-border/40 bg-amber-500/10">
                  <input
                    type="number"
                    step="any"
                    value={shares}
                    onChange={e => {
                      setShares(e.target.value);
                      setSellShares(e.target.value);
                    }}
                    className="w-full bg-amber-500/20 text-amber-300 font-black text-center py-1 rounded-lg border border-amber-500/40 focus:outline-none text-xs"
                  />
                </td>

                {/* 🟦 Cost Basis (Calculated) */}
                <td className="p-2 border-r border-border/40 bg-indigo-500/5 font-extrabold text-ink text-xs">
                  {symbol}{costBasis.toFixed(2)}
                </td>

                {/* 🟨 Avg. Price Input */}
                <td className="p-1.5 border-r border-border/40 bg-amber-500/10">
                  <input
                    type="number"
                    step="any"
                    value={avgPrice}
                    onChange={e => setAvgPrice(e.target.value)}
                    className="w-full bg-amber-500/20 text-amber-300 font-black text-center py-1 rounded-lg border border-amber-500/40 focus:outline-none text-xs"
                  />
                </td>

                {/* 🟨 Current Price (Calculated / Editable) */}
                <td className="p-1.5 border-r border-border/40 bg-amber-500/10">
                  <input
                    type="number"
                    step="any"
                    value={currentPrice}
                    onChange={e => setCurrentPrice(e.target.value)}
                    className="w-full bg-amber-500/20 text-amber-300 font-black text-center py-1 rounded-lg border border-amber-500/40 focus:outline-none text-xs"
                  />
                </td>

                {/* 🟦 Profit per Share (Calculated) */}
                <td className={`p-2 border-r border-border/40 bg-indigo-500/5 font-black text-xs ${profitPerShare >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {profitPerShare >= 0 ? '+' : ''}{symbol}{profitPerShare.toFixed(2)}
                </td>

                {/* 🟦 Rlzd P&L (Calculated) */}
                <td className={`p-2 bg-indigo-500/5 font-black text-xs ${rlzdPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {rlzdPnL >= 0 ? '+' : ''}{symbol}{rlzdPnL.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Row 3: Sell Simulation & Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
          
          {/* Sell Input Box */}
          <div className="md:col-span-3 bg-bg/50 p-2.5 rounded-xl border border-border/50 space-y-1">
            <label className="block text-[9px] font-black uppercase text-amber-400 text-center">
              Sell (Брой за продажба)
            </label>
            <input
              type="number"
              step="any"
              value={sellShares}
              onChange={e => setSellShares(e.target.value)}
              className="w-full bg-amber-500/20 text-amber-300 font-mono font-black text-center py-1 rounded-lg border border-amber-500/40 focus:outline-none text-xs"
            />
          </div>

          {/* Profit & % Return Box */}
          <div className="md:col-span-5 bg-emerald-500/10 border border-emerald-500/25 p-2.5 rounded-xl flex items-center justify-between text-emerald-400">
            <div>
              <span className="text-[9px] font-extrabold uppercase block text-emerald-400/80">PROFIT (Печалба):</span>
              <span className="text-base sm:text-lg font-black font-mono">
                {rlzdPnL >= 0 ? '+' : ''}{symbol}{rlzdPnL.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-extrabold uppercase block text-emerald-400/80">% TOTAL RETURN:</span>
              <span className="text-base sm:text-lg font-black font-mono">
                {totalReturnPct >= 0 ? '▲ ' : '▼ '}{totalReturnPct.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Free Funds Box */}
          <div className="md:col-span-4 bg-rose-500/10 border border-rose-500/25 p-2.5 rounded-xl text-rose-400 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-extrabold uppercase block text-rose-400/80">FREE FUNDS (Освободени пари):</span>
              <span className="text-base sm:text-lg font-black font-mono">
                {symbol}{freeFunds.toFixed(2)}
              </span>
            </div>
            <Wallet className="w-5 h-5 text-rose-400/50" />
          </div>

        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer mt-2"
        >
          Готово
        </button>

      </div>
    </div>
  );
}
