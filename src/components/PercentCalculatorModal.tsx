import React, { useState } from 'react';
import { Percent, X, ExternalLink, RefreshCw, Calculator, ArrowUpDown, TrendingUp, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialV1?: number;
  initialV2?: number;
}

type SubSection = 'all' | 'pctdifference' | 'general' | 'pctcommon' | 'pctincrease';

export default function PercentCalculatorModal({ isOpen, onClose, initialV1, initialV2 }: Props) {
  const [activeSection, setActiveSection] = useState<SubSection>('pctdifference');

  // ==========================================
  // Section 1: General 3-way Percentage Calculator
  // [ cpar1 ] % of [ cpar2 ] = [ cpar3 ]
  // ==========================================
  const [cpar1, setCpar1] = useState<string>('20');
  const [cpar2, setCpar2] = useState<string>('150');
  const [cpar3, setCpar3] = useState<string>('');
  const [calc1Result, setCalc1Result] = useState<string | null>(null);

  const handleCalc1 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const p = parseFloat(cpar1);
    const total = parseFloat(cpar2);
    const res = parseFloat(cpar3);

    // Count how many are provided
    const hasP = !isNaN(p);
    const hasTotal = !isNaN(total);
    const hasRes = !isNaN(res);

    if (hasP && hasTotal) {
      const computed = (p / 100) * total;
      setCpar3(formatNum(computed));
      setCalc1Result(`${p}% of ${total} = ${formatNum(computed)}`);
    } else if (hasP && hasRes) {
      if (p !== 0) {
        const computed = res / (p / 100);
        setCpar2(formatNum(computed));
        setCalc1Result(`${res} is ${p}% of ${formatNum(computed)}`);
      }
    } else if (hasTotal && hasRes) {
      if (total !== 0) {
        const computed = (res / total) * 100;
        setCpar1(formatNum(computed));
        setCalc1Result(`${res} is ${formatNum(computed)}% of ${total}`);
      }
    }
  };

  const handleClearCalc1 = () => {
    setCpar1('');
    setCpar2('');
    setCpar3('');
    setCalc1Result(null);
  };

  // ==========================================
  // Section 2: Percentage Calculator in Common Phrases
  // Phrase 21: what is [ c21par1 ] % of [ c21par2 ] ?
  // Phrase 22: [ c22par1 ] is what % of [ c22par2 ] ?
  // Phrase 23: [ c23par1 ] is [ c23par2 ] % of what ?
  // ==========================================
  const [c21par1, setC21par1] = useState<string>('15');
  const [c21par2, setC21par2] = useState<string>('200');
  const [res21, setRes21] = useState<string | null>('30');

  const [c22par1, setC22par1] = useState<string>('30');
  const [c22par2, setC22par2] = useState<string>('120');
  const [res22, setRes22] = useState<string | null>('25%');

  const [c23par1, setC23par1] = useState<string>('25');
  const [c23par2, setC23par2] = useState<string>('10');
  const [res23, setRes23] = useState<string | null>('250');

  const handleCalc21 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const p = parseFloat(c21par1);
    const total = parseFloat(c21par2);
    if (!isNaN(p) && !isNaN(total)) {
      setRes21(formatNum((p / 100) * total));
    }
  };

  const handleCalc22 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const part = parseFloat(c22par1);
    const total = parseFloat(c22par2);
    if (!isNaN(part) && !isNaN(total) && total !== 0) {
      setRes22(`${formatNum((part / total) * 100)}%`);
    }
  };

  const handleCalc23 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const part = parseFloat(c23par1);
    const p = parseFloat(c23par2);
    if (!isNaN(part) && !isNaN(p) && p !== 0) {
      setRes23(formatNum(part / (p / 100)));
    }
  };

  // ==========================================
  // Section 3: Percentage Difference Calculator (#pctdifference)
  // Value 1: [ c3par1 ] (e.g. 185)
  // Value 2: [ c3par2 ] (e.g. 137)
  // ==========================================
  const [c3par1, setC3par1] = useState<string>(initialV1 !== undefined ? String(initialV1) : '185');
  const [c3par2, setC3par2] = useState<string>(initialV2 !== undefined ? String(initialV2) : '137');
  const [diffCalculated, setDiffCalculated] = useState<boolean>(true);

  const numV1 = parseFloat(c3par1);
  const numV2 = parseFloat(c3par2);
  const isValidDiff = !isNaN(numV1) && !isNaN(numV2);

  const absDiff = Math.abs(numV1 - numV2);
  const sumDiff = numV1 + numV2;
  const avgDiff = sumDiff / 2;
  const pctDiffDec = avgDiff !== 0 ? absDiff / Math.abs(avgDiff) : 0;
  const pctDiffVal = pctDiffDec * 100;

  const isDecrease = numV2 < numV1;
  const isIncrease = numV2 > numV1;
  const pctChangeDec = numV1 !== 0 ? absDiff / Math.abs(numV1) : 0;
  const pctChangeVal = pctChangeDec * 100;

  const handleCalcDiff = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDiffCalculated(true);
  };

  const handleClearDiff = () => {
    setC3par1('');
    setC3par2('');
    setDiffCalculated(false);
  };

  const handleResetDiff = () => {
    setC3par1('185');
    setC3par2('137');
    setDiffCalculated(true);
  };

  // ==========================================
  // Section 4: Percentage Change Calculator (#pctincrease)
  // [ c2par1 ] [ Increase / Decrease ] [ c2par2 ] % = [ c2par3 ]
  // ==========================================
  const [c2par1, setC2par1] = useState<string>('100');
  const [c2type, setC2type] = useState<'increase' | 'decrease'>('increase');
  const [c2par2, setC2par2] = useState<string>('15');
  const [c2par3, setC2par3] = useState<string>('');
  const [changeResultMsg, setChangeResultMsg] = useState<string | null>(null);

  const handleCalcChange = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const base = parseFloat(c2par1);
    const pct = parseFloat(c2par2);
    const target = parseFloat(c2par3);

    const hasBase = !isNaN(base);
    const hasPct = !isNaN(pct);
    const hasTarget = !isNaN(target);

    if (hasBase && hasPct) {
      const mult = c2type === 'increase' ? (1 + pct / 100) : (1 - pct / 100);
      const res = base * mult;
      setC2par3(formatNum(res));
      setChangeResultMsg(`${base} ${c2type === 'increase' ? 'increased by' : 'decreased by'} ${pct}% = ${formatNum(res)}`);
    } else if (hasBase && hasTarget) {
      if (base !== 0) {
        const computedPct = Math.abs((target - base) / base) * 100;
        setC2par2(formatNum(computedPct));
        setC2type(target >= base ? 'increase' : 'decrease');
        setChangeResultMsg(`${base} to ${target} is a ${formatNum(computedPct)}% ${target >= base ? 'increase' : 'decrease'}`);
      }
    } else if (hasPct && hasTarget) {
      const div = c2type === 'increase' ? (1 + pct / 100) : (1 - pct / 100);
      if (div !== 0) {
        const computedBase = target / div;
        setC2par1(formatNum(computedBase));
        setChangeResultMsg(`${formatNum(computedBase)} ${c2type === 'increase' ? 'increased by' : 'decreased by'} ${pct}% = ${target}`);
      }
    }
  };

  const handleClearChange = () => {
    setC2par1('');
    setC2par2('');
    setC2par3('');
    setChangeResultMsg(null);
  };

  function formatNum(val: number, maxDecimals: number = 12): string {
    if (isNaN(val)) return '0';
    const s = val.toFixed(maxDecimals);
    return s.replace(/\.?0+$/, '');
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="bg-bg border border-border rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border/80 flex items-center justify-between bg-card/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight font-sans">
                Percentage Calculator
              </h2>
              <p className="text-[11px] text-ink-muted">
                Complete calculator.net replica with all 4 tools
              </p>
            </div>
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

        {/* Section Navigation Tabs (Matching Calculator.net anchors) */}
        <div className="px-4 py-2 border-b border-border/60 bg-card/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSection('pctdifference')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeSection === 'pctdifference'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-card border border-border/50'
            }`}
          >
            Percentage Difference (#pctdifference)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('general')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeSection === 'general'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-card border border-border/50'
            }`}
          >
            3-Way Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('pctcommon')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeSection === 'pctcommon'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-card border border-border/50'
            }`}
          >
            Common Phrases
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('pctincrease')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeSection === 'pctincrease'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-card border border-border/50'
            }`}
          >
            Percentage Change (+/-)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeSection === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-card border border-border/50'
            }`}
          >
            All Calculators (Full View)
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-ink">

          {/* ============================================================== */}
          {/* SECTION 3: Percentage Difference Calculator (#pctdifference)    */}
          {/* ============================================================== */}
          {(activeSection === 'pctdifference' || activeSection === 'all') && (
            <div className="space-y-4">
              <div className="border-b border-border/60 pb-1">
                <h3 className="text-base font-bold text-ink flex items-center justify-between">
                  <span>Percentage Difference Calculator</span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">#pctdifference</span>
                </h3>
              </div>

              {/* Form Table */}
              <form onSubmit={handleCalcDiff} className="p-4 rounded-xl bg-card border border-border/80 space-y-3.5">
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-medium text-ink sm:w-24">Value 1</label>
                    <input
                      type="text"
                      value={c3par1}
                      onChange={(e) => { setC3par1(e.target.value); setDiffCalculated(true); }}
                      placeholder="185"
                      className="flex-1 px-3 py-2 rounded-lg bg-bg border border-border font-mono text-sm text-ink focus:outline-none focus:border-emerald-500 shadow-inner"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-medium text-ink sm:w-24">Value 2</label>
                    <input
                      type="text"
                      value={c3par2}
                      onChange={(e) => { setC3par2(e.target.value); setDiffCalculated(true); }}
                      placeholder="137"
                      className="flex-1 px-3 py-2 rounded-lg bg-bg border border-border font-mono text-sm text-ink focus:outline-none focus:border-emerald-500 shadow-inner"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-xs cursor-pointer"
                  >
                    Calculate
                  </button>
                  <button
                    type="button"
                    onClick={handleClearDiff}
                    className="px-5 py-2 rounded-lg bg-card hover:bg-card-hover border border-border text-ink font-semibold text-xs uppercase tracking-wide transition-all cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleResetDiff}
                    className="px-3 py-1.5 rounded-lg text-ink-muted hover:text-ink text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>185 vs 137</span>
                  </button>
                </div>
              </form>

              {/* Exact Calculator.net Results for #pctdifference */}
              {diffCalculated && isValidDiff && (
                <div className="space-y-4 pt-1">
                  {/* Result Banner */}
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-lg sm:text-xl">
                    Result: {formatNum(pctDiffVal)}
                  </div>

                  {/* Statement 1 */}
                  <div className="space-y-2">
                    <p className="text-base text-ink">
                      Difference of <b>{c3par1}</b> and <b>{c3par2}</b> are{' '}
                      <span className="text-emerald-500 dark:text-emerald-400 font-bold">
                        {formatNum(pctDiffVal)}%
                      </span>
                    </p>

                    <div className="p-3 rounded-xl bg-card border border-border text-xs sm:text-sm font-sans space-y-2">
                      <div className="font-bold text-ink-muted">Steps:</div>
                      <div className="overflow-x-auto font-mono text-xs sm:text-sm py-1 space-y-2 text-ink-muted">
                        <div className="flex items-center gap-2">
                          <span>Difference of {c3par1} and {c3par2} =</span>
                          <div className="inline-flex flex-col items-center leading-none text-ink">
                            <span className="border-b border-ink/40 pb-1 px-2">|{c3par1} - {c3par2}|</span>
                            <span className="pt-1 text-[11px]">({c3par1} + {c3par2}) / 2</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pl-4">
                          <span>=</span>
                          <div className="inline-flex flex-col items-center leading-none text-ink">
                            <span className="border-b border-ink/40 pb-1 px-2">{absDiff}</span>
                            <span className="pt-1">{avgDiff}</span>
                          </div>
                        </div>

                        <div className="pl-4 text-ink">
                          = {formatNum(pctDiffDec)}
                        </div>

                        <div className="pl-4 font-bold text-emerald-500 dark:text-emerald-400">
                          = {formatNum(pctDiffVal)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statement 2 */}
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <p className="text-base text-ink">
                      <b>{c3par2}</b> is a{' '}
                      <span className="text-emerald-500 dark:text-emerald-400 font-bold">
                        {formatNum(pctChangeVal)}%
                      </span>{' '}
                      {isDecrease ? 'decrease' : isIncrease ? 'increase' : 'change'} of <b>{c3par1}</b>.
                    </p>

                    <div className="p-3 rounded-xl bg-card border border-border text-xs sm:text-sm font-sans space-y-2">
                      <div className="font-bold text-ink-muted">Steps:</div>
                      <div className="overflow-x-auto font-mono text-xs sm:text-sm py-1 space-y-2 text-ink-muted">
                        <div className="flex items-center gap-2">
                          <span>Percentage of {isDecrease ? 'decrease' : isIncrease ? 'increase' : 'change'} =</span>
                          <div className="inline-flex flex-col items-center leading-none text-ink">
                            <span className="border-b border-ink/40 pb-1 px-2">|{c3par1} - {c3par2}|</span>
                            <span className="pt-1">{c3par1}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pl-4">
                          <span>=</span>
                          <div className="inline-flex flex-col items-center leading-none text-ink">
                            <span className="border-b border-ink/40 pb-1 px-2">{absDiff}</span>
                            <span className="pt-1">{c3par1}</span>
                          </div>
                        </div>

                        <div className="pl-4 text-ink">
                          = {formatNum(pctChangeDec)}
                        </div>

                        <div className="pl-4 font-bold text-emerald-500 dark:text-emerald-400">
                          = {formatNum(pctChangeVal)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 1: 3-way General Percentage Calculator (calform)        */}
          {/* ============================================================== */}
          {(activeSection === 'general' || activeSection === 'all') && (
            <div className="space-y-3 pt-3 border-t border-border/60">
              <div>
                <h3 className="text-base font-bold text-ink">Percentage Calculator</h3>
                <p className="text-xs text-ink-muted">
                  Please provide any two values below and click the "Calculate" button to get the third value.
                </p>
              </div>

              <form onSubmit={handleCalc1} className="p-4 rounded-xl bg-card border border-border/80 space-y-3">
                <div className="flex items-center justify-center gap-2 flex-wrap text-sm font-medium">
                  <input
                    type="text"
                    value={cpar1}
                    onChange={(e) => setCpar1(e.target.value)}
                    placeholder="20"
                    className="w-24 px-3 py-2 rounded-lg bg-bg border border-border text-center font-mono text-sm text-ink focus:outline-none focus:border-emerald-500"
                  />
                  <span>% of</span>
                  <input
                    type="text"
                    value={cpar2}
                    onChange={(e) => setCpar2(e.target.value)}
                    placeholder="150"
                    className="w-28 px-3 py-2 rounded-lg bg-bg border border-border text-center font-mono text-sm text-ink focus:outline-none focus:border-emerald-500"
                  />
                  <span>=</span>
                  <input
                    type="text"
                    value={cpar3}
                    onChange={(e) => setCpar3(e.target.value)}
                    placeholder=""
                    className="w-28 px-3 py-2 rounded-lg bg-bg border border-border text-center font-mono text-sm text-ink font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-xs cursor-pointer"
                  >
                    Calculate
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCalc1}
                    className="px-5 py-2 rounded-lg bg-card hover:bg-card-hover border border-border text-ink font-semibold text-xs uppercase tracking-wide transition-all cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                {calc1Result && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-xs text-center font-bold">
                    Result: {calc1Result}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 2: Percentage Calculator in Common Phrases (pctcommon) */}
          {/* ============================================================== */}
          {(activeSection === 'pctcommon' || activeSection === 'all') && (
            <div className="space-y-3 pt-3 border-t border-border/60">
              <div>
                <h3 className="text-base font-bold text-ink">Percentage Calculator in Common Phrases</h3>
              </div>

              {/* Phrase 1 */}
              <form onSubmit={handleCalc21} className="p-3.5 rounded-xl bg-card border border-border/80 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <span>what is</span>
                  <input
                    type="text"
                    value={c21par1}
                    onChange={(e) => setC21par1(e.target.value)}
                    className="w-20 px-2.5 py-1.5 rounded-lg bg-bg border border-border text-center font-mono text-ink text-sm"
                  />
                  <span>% of</span>
                  <input
                    type="text"
                    value={c21par2}
                    onChange={(e) => setC21par2(e.target.value)}
                    className="w-24 px-2.5 py-1.5 rounded-lg bg-bg border border-border text-center font-mono text-ink text-sm"
                  />
                  {res21 && (
                    <span className="font-mono font-bold text-emerald-400 pl-2">
                      = {res21}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide transition-all cursor-pointer ml-auto"
                >
                  Calculate
                </button>
              </form>

              {/* Phrase 2 */}
              <form onSubmit={handleCalc22} className="p-3.5 rounded-xl bg-card border border-border/80 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <input
                    type="text"
                    value={c22par1}
                    onChange={(e) => setC22par1(e.target.value)}
                    className="w-20 px-2.5 py-1.5 rounded-lg bg-bg border border-border text-center font-mono text-ink text-sm"
                  />
                  <span>is what % of</span>
                  <input
                    type="text"
                    value={c22par2}
                    onChange={(e) => setC22par2(e.target.value)}
                    className="w-24 px-2.5 py-1.5 rounded-lg bg-bg border border-border text-center font-mono text-ink text-sm"
                  />
                  {res22 && (
                    <span className="font-mono font-bold text-emerald-400 pl-2">
                      = {res22}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide transition-all cursor-pointer ml-auto"
                >
                  Calculate
                </button>
              </form>

              {/* Phrase 3 */}
              <form onSubmit={handleCalc23} className="p-3.5 rounded-xl bg-card border border-border/80 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <input
                    type="text"
                    value={c23par1}
                    onChange={(e) => setC23par1(e.target.value)}
                    className="w-20 px-2.5 py-1.5 rounded-lg bg-bg border border-border text-center font-mono text-ink text-sm"
                  />
                  <span>is</span>
                  <input
                    type="text"
                    value={c23par2}
                    onChange={(e) => setC23par2(e.target.value)}
                    className="w-20 px-2.5 py-1.5 rounded-lg bg-bg border border-border text-center font-mono text-ink text-sm"
                  />
                  <span>% of what</span>
                  {res23 && (
                    <span className="font-mono font-bold text-emerald-400 pl-2">
                      = {res23}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide transition-all cursor-pointer ml-auto"
                >
                  Calculate
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 4: Percentage Change Calculator (#pctincrease)         */}
          {/* ============================================================== */}
          {(activeSection === 'pctincrease' || activeSection === 'all') && (
            <div className="space-y-3 pt-3 border-t border-border/60">
              <div>
                <h3 className="text-base font-bold text-ink">Percentage Change Calculator</h3>
                <p className="text-xs text-ink-muted">
                  Please provide any two values below and click the "Calculate" button to get the third value.
                </p>
              </div>

              <form onSubmit={handleCalcChange} className="p-4 rounded-xl bg-card border border-border/80 space-y-3">
                <div className="flex items-center justify-center gap-2 flex-wrap text-sm font-medium">
                  <input
                    type="text"
                    value={c2par1}
                    onChange={(e) => setC2par1(e.target.value)}
                    placeholder="100"
                    className="w-24 px-3 py-2 rounded-lg bg-bg border border-border text-center font-mono text-sm text-ink focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={c2type}
                    onChange={(e) => setC2type(e.target.value as 'increase' | 'decrease')}
                    className="px-2.5 py-2 rounded-lg bg-bg border border-border text-sm font-bold text-ink focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="increase">Increase</option>
                    <option value="decrease">Decrease</option>
                  </select>
                  <input
                    type="text"
                    value={c2par2}
                    onChange={(e) => setC2par2(e.target.value)}
                    placeholder="15"
                    className="w-24 px-3 py-2 rounded-lg bg-bg border border-border text-center font-mono text-sm text-ink focus:outline-none focus:border-emerald-500"
                  />
                  <span>% =</span>
                  <input
                    type="text"
                    value={c2par3}
                    onChange={(e) => setC2par3(e.target.value)}
                    placeholder=""
                    className="w-24 px-3 py-2 rounded-lg bg-bg border border-border text-center font-mono text-sm text-ink font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-xs cursor-pointer"
                  >
                    Calculate
                  </button>
                  <button
                    type="button"
                    onClick={handleClearChange}
                    className="px-5 py-2 rounded-lg bg-card hover:bg-card-hover border border-border text-ink font-semibold text-xs uppercase tracking-wide transition-all cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                {changeResultMsg && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-xs text-center font-bold">
                    Result: {changeResultMsg}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 5: Reference Formulas (calculator.net guide)           */}
          {/* ============================================================== */}
          {(activeSection === 'all' || activeSection === 'pctdifference') && (
            <div className="pt-4 border-t border-border/60 text-xs text-ink-muted space-y-3 font-sans">
              <div className="font-bold text-ink uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Percentage Difference Formula:</span>
              </div>
              <p className="leading-relaxed">
                Percentage difference is usually calculated when you want to know the difference in percentage between two numbers. For this calculator, the order of the numbers does not matter as we take the absolute value:
              </p>
              <div className="p-2.5 rounded-lg bg-card border border-border/70 font-mono text-[11px] text-ink text-center">
                Percentage Difference = (|V₁ - V₂| / ((V₁ + V₂) / 2)) × 100%
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/80 bg-card/50 flex items-center justify-between text-xs text-ink-faint">
          <span>calculator.net / percent-calculator</span>
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
