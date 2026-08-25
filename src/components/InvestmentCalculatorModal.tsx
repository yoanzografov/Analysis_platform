import { useState } from 'react';
import { Calculator, X, TrendingUp, DollarSign, Calendar, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  baseCurrency?: 'USD' | 'EUR';
}

export default function InvestmentCalculatorModal({ isOpen, onClose, baseCurrency = 'USD' }: Props) {
  const [initialAmount, setInitialAmount] = useState('5000');
  const [monthlyContribution, setMonthlyContribution] = useState('300');
  const [annualReturnPct, setAnnualReturnPct] = useState('9');
  const [years, setYears] = useState('10');

  if (!isOpen) return null;

  const symbol = baseCurrency === 'EUR' ? '€' : '$';

  const initVal = parseFloat(initialAmount) || 0;
  const monthVal = parseFloat(monthlyContribution) || 0;
  const rateVal = (parseFloat(annualReturnPct) || 0) / 100;
  const yearsVal = parseInt(years) || 1;

  // Monthly compound interest calculation
  const months = yearsVal * 12;
  const monthlyRate = rateVal / 12;

  let totalBalance = initVal;
  let totalInvested = initVal;

  for (let i = 0; i < months; i++) {
    totalBalance = (totalBalance + monthVal) * (1 + monthlyRate);
    totalInvested += monthVal;
  }

  const totalInterestEarned = Math.max(0, totalBalance - totalInvested);
  const profitPct = totalInvested > 0 ? (totalInterestEarned / totalInvested) * 100 : 0;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-md font-sans"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-ink tracking-wide">
                Инвестиционен Калкулатор
              </h3>
              <p className="text-[11px] text-ink-faint">
                Прогнозиране на сложна лихва и растеж на портфолиото
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-faint hover:text-ink hover:bg-card-hover transition-all cursor-pointer"
            title="Затвори"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div>
            <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
              НАЧАЛНА ИНВЕСТИЦИЯ ({symbol})
            </label>
            <input
              type="number"
              value={initialAmount}
              onChange={e => setInitialAmount(e.target.value)}
              placeholder="5000"
              className="w-full bg-bg text-ink font-bold border border-border px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
              МЕСЕЧНА ВНОСКА ({symbol})
            </label>
            <input
              type="number"
              value={monthlyContribution}
              onChange={e => setMonthlyContribution(e.target.value)}
              placeholder="300"
              className="w-full bg-bg text-ink font-bold border border-border px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
              ГОДИШНА ДОХОДНОСТ (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={annualReturnPct}
              onChange={e => setAnnualReturnPct(e.target.value)}
              placeholder="9"
              className="w-full bg-bg text-ink font-bold border border-border px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono text-sm text-emerald-400"
            />
          </div>

          <div>
            <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
              ПЕРИОД (ГОДИНИ)
            </label>
            <input
              type="number"
              value={years}
              onChange={e => setYears(e.target.value)}
              placeholder="10"
              className="w-full bg-bg text-ink font-bold border border-border px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-sm"
            />
          </div>
        </div>

        {/* Results Summary Cards */}
        <div className="bg-bg/60 p-4 rounded-2xl border border-border/60 space-y-3">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-[11px] font-extrabold text-ink-faint uppercase flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ПРОГНОЗНА КРАЙНА СУМА
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              +{profitPct.toFixed(1)}% Печалба
            </span>
          </div>

          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            {symbol}{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/30">
            <div>
              <span className="text-[10px] text-ink-faint font-bold uppercase block">ВАШИ ВЛОЖЕНИ ПАРИ:</span>
              <span className="font-extrabold text-ink font-mono">
                {symbol}{totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-ink-faint font-bold uppercase block">СЛОЖНА ЛИХВА (ПЕЧАЛБА):</span>
              <span className="font-extrabold text-emerald-400 font-mono">
                +{symbol}{totalInterestEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
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
