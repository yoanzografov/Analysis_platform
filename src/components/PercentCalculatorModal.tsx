import React, { useState } from 'react';
import { X, ExternalLink, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialV1?: number;
  initialV2?: number;
}

export default function PercentCalculatorModal({ isOpen, onClose, initialV1, initialV2 }: Props) {
  const [v1, setV1] = useState<string>(initialV1 !== undefined ? String(initialV1) : '185');
  const [v2, setV2] = useState<string>(initialV2 !== undefined ? String(initialV2) : '137');
  const [hasCalculated, setHasCalculated] = useState<boolean>(true);

  if (!isOpen) return null;

  const numV1 = parseFloat(v1);
  const numV2 = parseFloat(v2);
  const isValid = !isNaN(numV1) && !isNaN(numV2);

  // Calculations
  const diff = Math.abs(numV1 - numV2);
  const sum = numV1 + numV2;
  const avg = sum / 2;

  // Percentage difference: |V1 - V2| / ((V1 + V2)/2) * 100
  const pctDiffDec = avg !== 0 ? diff / Math.abs(avg) : 0;
  const pctDiff = pctDiffDec * 100;

  // Percentage change from V1 to V2: |V1 - V2| / V1 * 100
  const isDecrease = numV2 < numV1;
  const isIncrease = numV2 > numV1;
  const pctChangeDec = numV1 !== 0 ? diff / Math.abs(numV1) : 0;
  const pctChange = pctChangeDec * 100;

  const formatDec = (val: number, maxDecimals: number = 12) => {
    if (isNaN(val)) return '0';
    const s = val.toFixed(maxDecimals);
    return s.replace(/\.?0+$/, '');
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setHasCalculated(true);
  };

  const handleClear = () => {
    setV1('');
    setV2('');
    setHasCalculated(false);
  };

  const handleReset = () => {
    setV1('185');
    setV2('137');
    setHasCalculated(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="bg-bg border border-border rounded-2xl max-w-xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border/80 flex items-center justify-between bg-card/60">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight font-sans">
              Percentage Difference Calculator
            </h2>
            <p className="text-xs text-ink-muted">
              Calculator.net algorithm & format
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                window.open(`${window.location.origin}${window.location.pathname}#percent-calculator`, '_blank');
              }}
              className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-card-hover border border-border/60 transition-colors cursor-pointer"
              title="Open in new window"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-card-hover border border-border/60 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Calculator Input Form */}
          <form onSubmit={handleCalculate} className="p-4 sm:p-5 rounded-xl bg-card border border-border/80 shadow-xs space-y-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-semibold text-ink sm:w-28">
                  Value 1
                </label>
                <input
                  type="text"
                  value={v1}
                  onChange={(e) => { setV1(e.target.value); setHasCalculated(true); }}
                  placeholder="185"
                  className="flex-1 px-3.5 py-2 rounded-lg bg-bg border border-border text-ink font-mono text-sm focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-semibold text-ink sm:w-28">
                  Value 2
                </label>
                <input
                  type="text"
                  value={v2}
                  onChange={(e) => { setV2(e.target.value); setHasCalculated(true); }}
                  placeholder="137"
                  className="flex-1 px-3.5 py-2 rounded-lg bg-bg border border-border text-ink font-mono text-sm focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-sm cursor-pointer"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-5 py-2 rounded-lg bg-card hover:bg-card-hover border border-border text-ink font-semibold text-sm transition-all cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-lg text-ink-muted hover:text-ink text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset to 185 and 137"
              >
                <RefreshCw className="w-3 h-3" />
                <span>185 vs 137</span>
              </button>
            </div>
          </form>

          {/* Results Display (Calculator.net exact structure) */}
          {hasCalculated && isValid && (
            <div className="space-y-4 pt-2">
              {/* Green Result Banner */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-lg sm:text-xl flex items-center justify-between">
                <span>Result: {formatDec(pctDiff)}%</span>
              </div>

              {/* Part 1: Difference statement */}
              <div className="space-y-2">
                <p className="text-base sm:text-lg text-ink">
                  Difference of <b>{v1}</b> and <b>{v2}</b> is{' '}
                  <span className="text-emerald-500 dark:text-emerald-400 font-bold">
                    {formatDec(pctDiff)}%
                  </span>
                </p>

                {/* Steps table for percentage difference */}
                <div className="p-3.5 rounded-xl bg-card border border-border text-xs sm:text-sm font-sans space-y-2 text-ink">
                  <div className="font-bold text-ink-muted">Steps:</div>
                  <div className="overflow-x-auto font-mono text-xs sm:text-sm py-1 space-y-2 text-ink-muted">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0">Difference of {v1} and {v2} =</span>
                      <div className="inline-flex flex-col items-center leading-none text-ink">
                        <span className="border-b border-ink/40 pb-1 px-2">|{v1} - {v2}|</span>
                        <span className="pt-1 text-[11px]">({v1} + {v2}) / 2</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-4">
                      <span>=</span>
                      <div className="inline-flex flex-col items-center leading-none text-ink">
                        <span className="border-b border-ink/40 pb-1 px-2">{diff}</span>
                        <span className="pt-1">{avg}</span>
                      </div>
                    </div>

                    <div className="pl-4 text-ink">
                      = {formatDec(pctDiffDec)}
                    </div>

                    <div className="pl-4 font-bold text-emerald-500 dark:text-emerald-400">
                      = {formatDec(pctDiff)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Part 2: Increase / Decrease statement */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <p className="text-base sm:text-lg text-ink">
                  <b>{v2}</b> is a{' '}
                  <span className="text-emerald-500 dark:text-emerald-400 font-bold">
                    {formatDec(pctChange)}%
                  </span>{' '}
                  {isDecrease ? 'decrease' : isIncrease ? 'increase' : 'change'} of <b>{v1}</b>.
                </p>

                {/* Steps table for percentage change */}
                <div className="p-3.5 rounded-xl bg-card border border-border text-xs sm:text-sm font-sans space-y-2 text-ink">
                  <div className="font-bold text-ink-muted">
                    Steps:
                  </div>
                  <div className="overflow-x-auto font-mono text-xs sm:text-sm py-1 space-y-2 text-ink-muted">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0">
                        Percentage of {isDecrease ? 'decrease' : isIncrease ? 'increase' : 'change'} =
                      </span>
                      <div className="inline-flex flex-col items-center leading-none text-ink">
                        <span className="border-b border-ink/40 pb-1 px-2">|{v1} - {v2}|</span>
                        <span className="pt-1">{v1}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-4">
                      <span>=</span>
                      <div className="inline-flex flex-col items-center leading-none text-ink">
                        <span className="border-b border-ink/40 pb-1 px-2">{diff}</span>
                        <span className="pt-1">{v1}</span>
                      </div>
                    </div>

                    <div className="pl-4 text-ink">
                      = {formatDec(pctChangeDec)}
                    </div>

                    <div className="pl-4 font-bold text-emerald-500 dark:text-emerald-400">
                      = {formatDec(pctChange)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasCalculated && !isValid && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
              Please enter valid numerical values for Value 1 and Value 2.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/80 bg-card/40 flex items-center justify-between text-xs text-ink-faint">
          <span>calculator.net / percent-calculator #pctdifference</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-card hover:bg-card-hover border border-border text-ink font-semibold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
