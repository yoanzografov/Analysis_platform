import { useState } from 'react';
import { Calculator, X, Calendar, Play, RotateCcw, TrendingUp } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  baseCurrency?: 'USD' | 'EUR';
}

export default function RoiCalculatorModal({ isOpen, onClose, baseCurrency = 'USD' }: Props) {
  const [amountInvested, setAmountInvested] = useState('118.19');
  const [amountReturned, setAmountReturned] = useState('346.18');
  const [timeMode, setTimeMode] = useState<'dates' | 'length'>('dates');
  const [fromDate, setFromDate] = useState('2021-08-25');
  const [toDate, setToDate] = useState('2026-08-25');
  const [lengthYears, setLengthYears] = useState('5');

  if (!isOpen) return null;

  const symbol = baseCurrency === 'EUR' ? '€' : '$';

  const invested = Math.max(0, parseFloat(amountInvested) || 0);
  const returned = Math.max(0, parseFloat(amountReturned) || 0);
  const gain = returned - invested;
  const roiPct = invested > 0 ? (gain / invested) * 100 : 0;

  // Calculate duration in years
  let years = 1;
  if (timeMode === 'dates') {
    if (fromDate && toDate) {
      const d1 = new Date(fromDate).getTime();
      const d2 = new Date(toDate).getTime();
      const diffDays = Math.max(1, (d2 - d1) / (1000 * 3600 * 24));
      years = diffDays / 365.25;
    }
  } else {
    years = Math.max(0.01, parseFloat(lengthYears) || 1);
  }

  // Annualized ROI = ((Returned / Invested) ^ (1 / Years) - 1) * 100
  let annualizedRoiPct = 0;
  if (invested > 0 && returned > 0 && years > 0) {
    annualizedRoiPct = (Math.pow(returned / invested, 1 / years) - 1) * 100;
  }

  // Donut chart percentages
  const totalVal = Math.max(returned, invested);
  const investedSharePct = totalVal > 0 ? Math.min(100, Math.max(0, (invested / totalVal) * 100)) : 50;
  const profitSharePct = Math.max(0, 100 - investedSharePct);

  const handleClear = () => {
    setAmountInvested('');
    setAmountReturned('');
    setFromDate('');
    setToDate('');
    setLengthYears('1');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-bg/80 backdrop-blur-md font-sans">
      <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-ink tracking-wide">
                Return on Investment (ROI) Calculator
              </h3>
              <p className="text-[11px] text-ink-faint">
                Калкулатор за обща и годишна възвръщаемост на инвестицията
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

        {/* Main Grid: Inputs on Left, Results on Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Left Column: Form Controls */}
          <div className="bg-bg/40 p-4 rounded-2xl border border-border/60 space-y-3.5 text-xs">
            <div>
              <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
                ВЛОЖЕНА СУМА (Amount Invested)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-ink-faint">{symbol}</span>
                <input
                  type="number"
                  step="any"
                  value={amountInvested}
                  onChange={e => setAmountInvested(e.target.value)}
                  placeholder="118.19"
                  className="w-full bg-bg text-ink font-mono font-bold border border-border pl-7 pr-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
                КРАЙНА СУМА / ПОЛУЧЕНИ ПАРИ (Amount Returned)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-ink-faint">{symbol}</span>
                <input
                  type="number"
                  step="any"
                  value={amountReturned}
                  onChange={e => setAmountReturned(e.target.value)}
                  placeholder="346.18"
                  className="w-full bg-bg text-ink font-mono font-bold border border-border pl-7 pr-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 text-sm text-emerald-400"
                />
              </div>
            </div>

            {/* Time Mode Radio Options */}
            <div>
              <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1.5">
                ВРЕМЕТРАЕНЕ НА ИНВЕСТИЦИЯТА:
              </label>
              <div className="flex items-center gap-4 text-ink font-extrabold text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="timeMode"
                    checked={timeMode === 'dates'}
                    onChange={() => setTimeMode('dates')}
                    className="accent-indigo-500"
                  />
                  <span>Чрез Дати</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="timeMode"
                    checked={timeMode === 'length'}
                    onChange={() => setTimeMode('length')}
                    className="accent-indigo-500"
                  />
                  <span>Чрез Години</span>
                </label>
              </div>
            </div>

            {/* Dynamic Time Inputs */}
            {timeMode === 'dates' ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[9px] text-ink-faint font-bold uppercase mb-1">ОТ ДАТА</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    onClick={(e) => { try { (e.target as any).showPicker(); } catch (err) {} }}
                    className="w-full bg-bg text-ink font-mono font-bold border border-border px-2.5 py-1.5 rounded-xl focus:outline-none cursor-pointer text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-ink-faint font-bold uppercase mb-1">ДО ДАТА</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    onClick={(e) => { try { (e.target as any).showPicker(); } catch (err) {} }}
                    className="w-full bg-bg text-ink font-mono font-bold border border-border px-2.5 py-1.5 rounded-xl focus:outline-none cursor-pointer text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="pt-1">
                <label className="block text-[9px] text-ink-faint font-bold uppercase mb-1">ПРОДЪЛЖИТЕЛНОСТ (ГОДИНИ)</label>
                <input
                  type="number"
                  step="0.1"
                  value={lengthYears}
                  onChange={e => setLengthYears(e.target.value)}
                  placeholder="5"
                  className="w-full bg-bg text-ink font-mono font-bold border border-border px-3 py-2 rounded-xl focus:outline-none text-xs"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-border text-ink-muted font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Изчисти
              </button>
            </div>
          </div>

          {/* Right Column: Results Box & Chart */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="bg-emerald-600/90 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Резултати (Results)
              </span>
              <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full">
                ROI Analysis
              </span>
            </div>

            {/* Table of Results */}
            <div className="bg-bg/60 rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/40 text-xs font-sans">
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="font-bold text-ink-faint">Печалба (Investment Gain):</span>
                <span className={`font-mono font-extrabold ${gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {gain >= 0 ? '+' : ''}{symbol}{gain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="font-bold text-ink-faint">Общ ROI (Total ROI %):</span>
                <span className={`font-mono font-black ${roiPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {roiPct >= 0 ? '+' : ''}{roiPct.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="font-bold text-ink-faint">Годишен ROI (Annualized ROI %):</span>
                <span className={`font-mono font-black ${annualizedRoiPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {annualizedRoiPct >= 0 ? '+' : ''}{annualizedRoiPct.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="font-bold text-ink-faint">Времетраене (Investment Length):</span>
                <span className="font-mono font-bold text-ink">
                  {years.toFixed(3)} години
                </span>
              </div>
            </div>

            {/* Donut Chart Visual Representation */}
            <div className="bg-bg/40 p-3 rounded-2xl border border-border/40 flex items-center justify-around gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    strokeDasharray={`${investedSharePct}, 100`}
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#84cc16"
                    strokeWidth="4"
                    strokeDasharray={`${profitSharePct}, 100`}
                    strokeDashoffset={`-${investedSharePct}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-ink font-mono">
                  {roiPct.toFixed(0)}%
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-blue-500 inline-block" />
                  <span className="font-bold text-ink-faint text-[11px]">Вложени (Invested): {investedSharePct.toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-lime-500 inline-block" />
                  <span className="font-bold text-ink-faint text-[11px]">Печалба (Profit): {profitSharePct.toFixed(0)}%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          Готово
        </button>

      </div>
    </div>
  );
}
