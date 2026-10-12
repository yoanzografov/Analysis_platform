import React, { useState } from 'react';
import { Percent, X, ArrowUpDown, TrendingUp, TrendingDown, RefreshCw, ExternalLink, Check, Copy } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialV1?: number;
  initialV2?: number;
}

export default function PercentCalculatorModal({ isOpen, onClose, initialV1, initialV2 }: Props) {
  const [v1, setV1] = useState<string>(initialV1 !== undefined ? String(initialV1) : '185');
  const [v2, setV2] = useState<string>(initialV2 !== undefined ? String(initialV2) : '137');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

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

  const handleSwap = () => {
    setV1(v2);
    setV2(v1);
  };

  const handleClear = () => {
    setV1('');
    setV2('');
  };

  const handleReset = () => {
    setV1('185');
    setV2('137');
  };

  const copyResult = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="bg-bg border border-border rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/80 flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black uppercase text-ink tracking-tight font-sans">
                Percentage Difference Calculator
              </h2>
              <p className="text-xs text-ink-muted truncate font-sans">
                Compare two values and calculate percentage difference
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
              title="Open in new window"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-card-hover border border-border/60 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center justify-between font-sans">
                <span>Value 1 (V₁)</span>
              </label>
              <input
                type="number"
                step="any"
                value={v1}
                onChange={(e) => setV1(e.target.value)}
                placeholder="e.g. 185"
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-ink font-mono font-bold text-base focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center justify-between font-sans">
                <span>Value 2 (V₂)</span>
              </label>
              <input
                type="number"
                step="any"
                value={v2}
                onChange={(e) => setV2(e.target.value)}
                placeholder="e.g. 137"
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-ink font-mono font-bold text-base focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={handleSwap}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-card hover:bg-card-hover border border-border text-ink-muted hover:text-ink transition-colors cursor-pointer flex items-center gap-1.5"
              title="Swap V1 and V2"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Swap</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-card hover:bg-card-hover border border-border text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600/15 hover:bg-cyan-600/25 border border-cyan-500/30 text-cyan-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Primary Result: Percentage Difference */}
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs font-black uppercase text-cyan-400 font-sans tracking-wide">
              <span>Percentage Difference</span>
              <button
                type="button"
                onClick={() => copyResult(`${pctDiff.toFixed(2)}%`)}
                className="text-ink-faint hover:text-cyan-400 transition-colors p-1"
                title="Copy result"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-3xl font-black font-mono text-ink tracking-tight">
              {pctDiff.toFixed(2)}%
            </div>
            <div className="text-[11px] text-ink-muted font-mono pt-1">
              Difference = {pctDiff.toFixed(4)}%
            </div>
          </div>

          {/* Secondary Results: Change V1->V2 and V2->V1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
            <div className={`p-3.5 rounded-xl border ${
              pctChangeV1toV2 >= 0
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-rose-500/10 border-rose-500/30'
            }`}>
              <div className="text-[11px] font-bold uppercase text-ink-muted flex items-center justify-between">
                <span>V₁ → V₂ Change</span>
                <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                  pctChangeV1toV2 >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {pctChangeV1toV2 >= 0 ? 'Increase' : 'Decrease'}
                </span>
              </div>
              <div className={`text-xl font-black font-mono mt-1 ${pctChangeV1toV2 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {pctChangeV1toV2 >= 0 ? `+${pctChangeV1toV2.toFixed(2)}%` : `${pctChangeV1toV2.toFixed(2)}%`}
              </div>
              <p className="text-[11px] text-ink-muted mt-0.5">
                {numV1} to {numV2} is a {Math.abs(pctChangeV1toV2).toFixed(2)}% {pctChangeV1toV2 >= 0 ? 'increase' : 'decrease'}.
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${
              pctChangeV2toV1 >= 0
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-rose-500/10 border-rose-500/30'
            }`}>
              <div className="text-[11px] font-bold uppercase text-ink-muted flex items-center justify-between">
                <span>V₂ → V₁ Change</span>
                <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                  pctChangeV2toV1 >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {pctChangeV2toV1 >= 0 ? 'Increase' : 'Decrease'}
                </span>
              </div>
              <div className={`text-xl font-black font-mono mt-1 ${pctChangeV2toV1 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {pctChangeV2toV1 >= 0 ? `+${pctChangeV2toV1.toFixed(2)}%` : `${pctChangeV2toV1.toFixed(2)}%`}
              </div>
              <p className="text-[11px] text-ink-muted mt-0.5">
                {numV2} to {numV1} is a {Math.abs(pctChangeV2toV1).toFixed(2)}% {pctChangeV2toV1 >= 0 ? 'increase' : 'decrease'}.
              </p>
            </div>
          </div>

          {/* Quick Stats: Absolute Difference & Average */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-card border border-border/70 text-center font-sans text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-ink-muted block">Absolute Difference</span>
              <span className="text-base font-black font-mono text-ink mt-0.5 block">{absDiff.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-ink-muted block">Average</span>
              <span className="text-base font-black font-mono text-ink mt-0.5 block">{avg.toLocaleString()}</span>
            </div>
          </div>

          {/* Formula */}
          <div className="p-3.5 rounded-xl bg-card border border-border/70 font-mono text-xs space-y-1 text-ink-muted">
            <div className="text-[11px] font-sans font-bold uppercase text-ink">Formula</div>
            <div className="text-[11px]">
              Difference = |V₁ - V₂| / ((V₁ + V₂) / 2) × 100%
            </div>
            <div className="text-[11px] text-cyan-400 font-bold">
              = |{numV1} - {numV2}| / (({numV1} + {numV2}) / 2) × 100% = {pctDiff.toFixed(4)}%
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/80 bg-card/40 flex items-center justify-between text-xs font-sans">
          <span className="text-ink-faint">
            calculator.net format
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase shadow-sm transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
