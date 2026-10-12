import React, { useState } from 'react';
import { Percent, X, ArrowUpDown, TrendingUp, TrendingDown, RefreshCw, ExternalLink, Calculator, HelpCircle, Check, Copy } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialV1?: number;
  initialV2?: number;
}

type CalcTab = 'difference' | 'common' | 'change';

export default function PercentCalculatorModal({ isOpen, onClose, initialV1, initialV2 }: Props) {
  const [activeTab, setActiveTab] = useState<CalcTab>('difference');

  // Tab 1: Percentage Difference & Change (calculator.net #pctdifference style)
  const [v1, setV1] = useState<string>(initialV1 !== undefined ? String(initialV1) : '185');
  const [v2, setV2] = useState<string>(initialV2 !== undefined ? String(initialV2) : '137');

  // Tab 2: Common Phrases
  // Phrase 1: What is P% of X?
  const [c1Pct, setC1Pct] = useState<string>('20');
  const [c1Total, setC1Total] = useState<string>('150');

  // Phrase 2: X is what % of Y?
  const [c2Part, setC2Part] = useState<string>('30');
  const [c2Total, setC2Total] = useState<string>('120');

  // Phrase 3: X is P% of what?
  const [c3Part, setC3Part] = useState<string>('25');
  const [c3Pct, setC3Pct] = useState<string>('10');

  // Tab 3: Increase / Decrease +/- %
  const [basePrice, setBasePrice] = useState<string>('100');
  const [adjustPct, setAdjustPct] = useState<string>('15');

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Numerical parsers
  const numV1 = parseFloat(v1) || 0;
  const numV2 = parseFloat(v2) || 0;

  // Percentage Difference: |V1 - V2| / ((V1 + V2) / 2) * 100
  const avg = (numV1 + numV2) / 2;
  const absDiff = Math.abs(numV1 - numV2);
  const pctDiff = avg !== 0 ? (absDiff / Math.abs(avg)) * 100 : 0;

  // Percentage Change from V1 to V2: ((V2 - V1) / |V1|) * 100
  const pctChangeV1toV2 = numV1 !== 0 ? ((numV2 - numV1) / Math.abs(numV1)) * 100 : 0;
  // Percentage Change from V2 to V1: ((V1 - V2) / |V2|) * 100
  const pctChangeV2toV1 = numV2 !== 0 ? ((numV1 - numV2) / Math.abs(numV2)) * 100 : 0;

  // Swap V1 and V2
  const handleSwap = () => {
    setV1(v2);
    setV2(v1);
  };

  const handleClearTab1 = () => {
    setV1('');
    setV2('');
  };

  const handleResetTab1 = () => {
    setV1('185');
    setV2('137');
  };

  const copyResult = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Tab 2 calculations
  const numC1Pct = parseFloat(c1Pct) || 0;
  const numC1Total = parseFloat(c1Total) || 0;
  const resC1 = (numC1Pct / 100) * numC1Total;

  const numC2Part = parseFloat(c2Part) || 0;
  const numC2Total = parseFloat(c2Total) || 0;
  const resC2 = numC2Total !== 0 ? (numC2Part / numC2Total) * 100 : 0;

  const numC3Part = parseFloat(c3Part) || 0;
  const numC3Pct = parseFloat(c3Pct) || 0;
  const resC3 = numC3Pct !== 0 ? numC3Part / (numC3Pct / 100) : 0;

  // Tab 3 calculations
  const numBasePrice = parseFloat(basePrice) || 0;
  const numAdjustPct = parseFloat(adjustPct) || 0;
  const valIncreased = numBasePrice * (1 + numAdjustPct / 100);
  const valDecreased = numBasePrice * (1 - numAdjustPct / 100);
  const deltaAmount = (numBasePrice * numAdjustPct) / 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-bg border border-border rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-border/80 flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-sm">
              <Percent className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black uppercase text-ink tracking-tight font-sans">
                  Percentage Calculator
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono font-bold">
                  % Разлика & Промяна
                </span>
              </div>
              <p className="text-xs text-ink-muted truncate font-sans">
                Сравнение между две стойности, % разлика, % ръст/спад и финансови изчисления
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                window.open(`${window.location.origin}${window.location.pathname}#percent-calculator`, '_blank');
              }}
              className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-card-hover border border-border/60 transition-colors cursor-pointer"
              title="Отвори в нов прозорец"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-card-hover border border-border/60 transition-colors cursor-pointer"
              title="Затвори"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 sm:px-6 pt-3 pb-1 border-b border-border/60 bg-card/25 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('difference')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase font-sans transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'difference'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-ink-muted hover:text-ink hover:bg-card border border-border/60'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>% Разлика & Промяна</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('change')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase font-sans transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'change'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-ink-muted hover:text-ink hover:bg-card border border-border/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Увеличение / Намаление (+ / - %)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('common')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase font-sans transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'common'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-ink-muted hover:text-ink hover:bg-card border border-border/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Основни Проценти</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: Percentage Difference & Change */}
          {activeTab === 'difference' && (
            <div className="space-y-5">
              {/* Preset buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-ink-faint uppercase font-sans">
                  Примери:
                </span>
                <button
                  type="button"
                  onClick={() => { setV1('185'); setV2('137'); }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-card border border-border hover:border-cyan-500/40 text-ink-muted hover:text-ink transition-colors cursor-pointer"
                >
                  185 vs 137
                </button>
                <button
                  type="button"
                  onClick={() => { setV1('100'); setV2('150'); }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-card border border-border hover:border-cyan-500/40 text-ink-muted hover:text-ink transition-colors cursor-pointer"
                >
                  100 vs 150 (+50%)
                </button>
                <button
                  type="button"
                  onClick={() => { setV1('200'); setV2('160'); }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-card border border-border hover:border-cyan-500/40 text-ink-muted hover:text-ink transition-colors cursor-pointer"
                >
                  200 vs 160 (-20%)
                </button>
              </div>

              {/* Input values */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wide text-ink flex items-center justify-between font-sans">
                    <span>Стойност 1 (V₁)</span>
                    <span className="text-[10px] text-ink-faint font-normal font-mono">Начална стойност</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={v1}
                      onChange={(e) => setV1(e.target.value)}
                      placeholder="напр. 185"
                      className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-ink font-mono font-bold text-base focus:outline-none focus:border-cyan-500 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wide text-ink flex items-center justify-between font-sans">
                    <span>Стойност 2 (V₂)</span>
                    <span className="text-[10px] text-ink-faint font-normal font-mono">Крайна стойност</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={v2}
                      onChange={(e) => setV2(e.target.value)}
                      placeholder="напр. 137"
                      className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-ink font-mono font-bold text-base focus:outline-none focus:border-cyan-500 shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Swap, Reset, Clear */}
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-card hover:bg-card-hover border border-border text-ink-muted hover:text-ink transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Размени стойностите V1 и V2"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Размени V₁ ⇄ V₂</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearTab1}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-card hover:bg-card-hover border border-border text-ink-muted hover:text-ink transition-colors cursor-pointer"
                >
                  Изчисти
                </button>
                <button
                  type="button"
                  onClick={handleResetTab1}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-cyan-600/15 hover:bg-cyan-600/25 border border-cyan-500/30 text-cyan-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Фабрични (185 vs 137)</span>
                </button>
              </div>

              {/* Key Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Percentage Difference */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/5 border border-cyan-500/30 space-y-1 relative group">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-cyan-400 font-sans tracking-wide">
                    <span>Процентна Разлика</span>
                    <button
                      type="button"
                      onClick={() => copyResult(`${pctDiff.toFixed(2)}%`)}
                      className="text-ink-faint hover:text-cyan-400 transition-colors p-1"
                      title="Копирай"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-ink tracking-tight">
                    {pctDiff.toFixed(2)}%
                  </div>
                  <p className="text-[11px] text-ink-muted font-sans leading-snug">
                    Относителна разлика между двете числа спрямо средната им стойност.
                  </p>
                </div>

                {/* 2. Percentage Change (V1 -> V2) */}
                <div className={`p-4 rounded-2xl border space-y-1 ${
                  pctChangeV1toV2 >= 0
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  <div className="flex items-center justify-between text-xs font-black uppercase font-sans tracking-wide">
                    <span className="flex items-center gap-1.5">
                      {pctChangeV1toV2 >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>Промяна от V₁ към V₂</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 font-bold uppercase">
                      {pctChangeV1toV2 >= 0 ? 'Ръст' : 'Спад'}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-ink">
                    {pctChangeV1toV2 >= 0 ? `+${pctChangeV1toV2.toFixed(2)}%` : `${pctChangeV1toV2.toFixed(2)}%`}
                  </div>
                  <p className="text-[11px] text-ink-muted font-sans leading-snug">
                    От {numV1} към {numV2}: {pctChangeV1toV2 >= 0 ? 'увеличение' : 'намаление'} с {Math.abs(pctChangeV1toV2).toFixed(2)}%.
                  </p>
                </div>
              </div>

              {/* Secondary Details Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-center font-sans">
                <div>
                  <div className="text-[10px] text-ink-faint uppercase font-bold">Промяна V₂ → V₁</div>
                  <div className={`text-sm sm:text-base font-black font-mono mt-0.5 ${pctChangeV2toV1 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {pctChangeV2toV1 >= 0 ? `+${pctChangeV2toV1.toFixed(2)}%` : `${pctChangeV2toV1.toFixed(2)}%`}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-faint uppercase font-bold">Абсолютна Разлика</div>
                  <div className="text-sm sm:text-base font-black font-mono text-ink mt-0.5">
                    {absDiff.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-faint uppercase font-bold">Средна Стойност</div>
                  <div className="text-sm sm:text-base font-black font-mono text-ink mt-0.5">
                    {avg.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-faint uppercase font-bold">Съотношение V₁ / V₂</div>
                  <div className="text-sm sm:text-base font-black font-mono text-cyan-400 mt-0.5">
                    {numV2 !== 0 ? (numV1 / numV2).toFixed(4) : '—'}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Calculation Formula Breakdown (matching calculator.net) */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2 text-xs font-sans">
                <div className="flex items-center gap-2 font-black uppercase text-ink tracking-wide">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Формула & Стъпки за изчисление</span>
                </div>
                <div className="space-y-2 font-mono text-[11px] bg-bg/80 p-3 rounded-xl border border-border/50 text-ink-muted">
                  <div>
                    <span className="text-cyan-400 font-bold">1. Процентна разлика (Percentage Difference):</span>
                    <br />
                    Formula: |V₁ - V₂| / ((V₁ + V₂) / 2) × 100%
                    <br />
                    = |{numV1} - {numV2}| / (({numV1} + {numV2}) / 2) × 100%
                    <br />
                    = {absDiff.toFixed(2)} / {avg.toFixed(2)} × 100% = <strong className="text-cyan-400">{pctDiff.toFixed(4)}%</strong>
                  </div>

                  <div className="pt-2 border-t border-border/40">
                    <span className="text-indigo-400 font-bold">2. Процентна промяна от {numV1} към {numV2}:</span>
                    <br />
                    Formula: (V₂ - V₁) / |V₁| × 100%
                    <br />
                    = ({numV2} - {numV1}) / {numV1} × 100% = <strong className={pctChangeV1toV2 >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{pctChangeV1toV2.toFixed(4)}%</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Increase / Decrease (+ / - %) */}
          {activeTab === 'change' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 space-y-3 font-sans">
                <div className="text-xs font-black uppercase text-ink">
                  Увеличаване или Намаляване на Базова Цена / Стойност
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1">Базова Стойност / Цена ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-bg border border-border text-ink font-mono font-bold text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1">Процент за корекция (%)</label>
                    <input
                      type="number"
                      step="any"
                      value={adjustPct}
                      onChange={(e) => setAdjustPct(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-bg border border-border text-ink font-mono font-bold text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Results Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                {/* Increase */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>След увеличение (+{numAdjustPct}%)</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-ink">
                    ${valIncreased.toFixed(2)}
                  </div>
                  <p className="text-xs text-ink-muted">
                    Печалба: <strong className="text-emerald-400 font-mono">+${deltaAmount.toFixed(2)}</strong> ({numBasePrice} + {deltaAmount.toFixed(2)})
                  </p>
                </div>

                {/* Decrease */}
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-rose-400">
                    <TrendingDown className="w-4 h-4" />
                    <span>След намаление (-{numAdjustPct}%)</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-ink">
                    ${valDecreased.toFixed(2)}
                  </div>
                  <p className="text-xs text-ink-muted">
                    Спад: <strong className="text-rose-400 font-mono">-${deltaAmount.toFixed(2)}</strong> ({numBasePrice} - {deltaAmount.toFixed(2)})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Common Percentage Phrases */}
          {activeTab === 'common' && (
            <div className="space-y-4 font-sans text-xs">
              {/* Phrase 1: What is P% of Total? */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
                <div className="text-xs font-black uppercase text-ink">
                  1. Какво е X% от Y?
                </div>
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <span>Какво е</span>
                  <input
                    type="number"
                    step="any"
                    value={c1Pct}
                    onChange={(e) => setC1Pct(e.target.value)}
                    className="w-20 px-2.5 py-1.5 rounded-lg bg-bg border border-border font-mono font-bold text-ink"
                  />
                  <span>% от</span>
                  <input
                    type="number"
                    step="any"
                    value={c1Total}
                    onChange={(e) => setC1Total(e.target.value)}
                    className="w-24 px-2.5 py-1.5 rounded-lg bg-bg border border-border font-mono font-bold text-ink"
                  />
                  <span>=</span>
                  <span className="font-mono font-black text-cyan-400 text-lg">
                    {resC1.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Phrase 2: Part is what % of Total? */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
                <div className="text-xs font-black uppercase text-ink">
                  2. Числото X е какъв процент от Y?
                </div>
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <input
                    type="number"
                    step="any"
                    value={c2Part}
                    onChange={(e) => setC2Part(e.target.value)}
                    className="w-24 px-2.5 py-1.5 rounded-lg bg-bg border border-border font-mono font-bold text-ink"
                  />
                  <span>е</span>
                  <span className="font-mono font-black text-emerald-400 text-lg">
                    {resC2.toFixed(2)}%
                  </span>
                  <span>от числото</span>
                  <input
                    type="number"
                    step="any"
                    value={c2Total}
                    onChange={(e) => setC2Total(e.target.value)}
                    className="w-24 px-2.5 py-1.5 rounded-lg bg-bg border border-border font-mono font-bold text-ink"
                  />
                </div>
              </div>

              {/* Phrase 3: Part is P% of what? */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
                <div className="text-xs font-black uppercase text-ink">
                  3. Числото X е P% от кое число?
                </div>
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <input
                    type="number"
                    step="any"
                    value={c3Part}
                    onChange={(e) => setC3Part(e.target.value)}
                    className="w-24 px-2.5 py-1.5 rounded-lg bg-bg border border-border font-mono font-bold text-ink"
                  />
                  <span>е</span>
                  <input
                    type="number"
                    step="any"
                    value={c3Pct}
                    onChange={(e) => setC3Pct(e.target.value)}
                    className="w-20 px-2.5 py-1.5 rounded-lg bg-bg border border-border font-mono font-bold text-ink"
                  />
                  <span>% от цялото:</span>
                  <span className="font-mono font-black text-indigo-400 text-lg">
                    {resC3.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-border/80 bg-card/40 flex items-center justify-between text-xs font-sans">
          <span className="text-ink-faint hidden sm:inline">
            Стандартен калкулатор за проценти • Calculator.net алгоритъм
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase shadow-sm transition-all cursor-pointer ml-auto"
          >
            Затвори
          </button>
        </div>
      </div>
    </div>
  );
}
