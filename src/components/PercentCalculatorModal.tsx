import React, { useState } from 'react';
import { Percent, X, ExternalLink, RefreshCw, ChevronDown } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialV1?: number;
  initialV2?: number;
}

type CalcTab = 'pctdifference' | 'pctincrease' | 'pctcommon';

export default function PercentCalculatorModal({ isOpen, onClose, initialV1, initialV2 }: Props) {
  const [activeTab, setActiveTab] = useState<CalcTab>('pctdifference');
  const [showDiffSteps, setShowDiffSteps] = useState<boolean>(false);
  const [showChangeSteps, setShowChangeSteps] = useState<boolean>(false);
  const [showCommonSteps, setShowCommonSteps] = useState<boolean>(false);

  function formatNum(val: number, maxDecimals: number = 12): string {
    if (isNaN(val)) return '0';
    const s = val.toFixed(maxDecimals);
    return s.replace(/\.?0+$/, '');
  }

  // ==============================================================
  // 1. Percentage Difference Calculator (#pctdifference)
  // ==============================================================
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
    setShowDiffSteps(false);
  };

  const handleResetDiff = () => {
    setC3par1('185');
    setC3par2('137');
    setDiffCalculated(true);
  };

  // ==============================================================
  // 2. Percentage Change Calculator (#pctincrease)
  // [ c2par1 ] [ Increase / Decrease ] [ c2par2 ] % = [ c2par3 ]
  // ==============================================================
  const [c2par1, setC2par1] = useState<string>('100');
  const [c2type, setC2type] = useState<'increase' | 'decrease'>('increase');
  const [c2par2, setC2par2] = useState<string>('15');
  const [c2par3, setC2par3] = useState<string>('');
  const [changeCalculated, setChangeCalculated] = useState<boolean>(true);
  const [changeResult, setChangeResult] = useState<{
    resultBanner: string;
    statementMain: string;
    highlightVal: string;
    statementSuffix: string;
    stepsLines: string[];
  } | null>({
    resultBanner: '115',
    statementMain: '100 increase 15% = ',
    highlightVal: '115',
    statementSuffix: '',
    stepsLines: [
      '100 increase 15% =',
      '100 × (1 + 15%) = 100 × (1 + 0.15) = 115'
    ]
  });

  const handleCalcChange = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const base = parseFloat(c2par1);
    const pct = parseFloat(c2par2);
    const target = parseFloat(c2par3);

    const hasBase = c2par1.trim() !== '' && !isNaN(base);
    const hasPct = c2par2.trim() !== '' && !isNaN(pct);
    const hasTarget = c2par3.trim() !== '' && !isNaN(target);

    if (hasBase && hasPct) {
      const dec = pct / 100;
      const mult = c2type === 'increase' ? (1 + dec) : (1 - dec);
      const res = base * mult;
      const formattedRes = formatNum(res);
      const sign = c2type === 'increase' ? '+' : '-';
      setC2par3(formattedRes);
      setChangeCalculated(true);
      setChangeResult({
        resultBanner: formattedRes,
        statementMain: `${formatNum(base)} ${c2type} ${formatNum(pct)}% = `,
        highlightVal: formattedRes,
        statementSuffix: '',
        stepsLines: [
          `${formatNum(base)} ${c2type} ${formatNum(pct)}% =`,
          `${formatNum(base)} × (1 ${sign} ${formatNum(pct)}%) = ${formatNum(base)} × (1 ${sign} ${formatNum(dec)}) = ${formattedRes}`
        ]
      });
    } else if (hasBase && hasTarget) {
      if (base !== 0) {
        const diff = Math.abs(target - base);
        const dec = diff / Math.abs(base);
        const computedPct = dec * 100;
        const dir: 'increase' | 'decrease' = target >= base ? 'increase' : 'decrease';
        const formattedPct = formatNum(computedPct);
        setC2type(dir);
        setC2par2(formattedPct);
        setChangeCalculated(true);
        setChangeResult({
          resultBanner: `${formattedPct}%`,
          statementMain: `${formatNum(base)} ${dir} `,
          highlightVal: `${formattedPct}%`,
          statementSuffix: ` = ${formatNum(target)}`,
          stepsLines: [
            `Percentage of ${dir} = |${formatNum(base)} - ${formatNum(target)}| / ${formatNum(base)}`,
            `= ${formatNum(diff)} / ${formatNum(base)} = ${formatNum(dec)} = ${formattedPct}%`
          ]
        });
      }
    } else if (hasPct && hasTarget) {
      const dec = pct / 100;
      const div = c2type === 'increase' ? (1 + dec) : (1 - dec);
      const sign = c2type === 'increase' ? '+' : '-';
      if (div !== 0) {
        const computedBase = target / div;
        const formattedBase = formatNum(computedBase);
        setC2par1(formattedBase);
        setChangeCalculated(true);
        setChangeResult({
          resultBanner: formattedBase,
          statementMain: '',
          highlightVal: formattedBase,
          statementSuffix: ` ${c2type} ${formatNum(pct)}% = ${formatNum(target)}`,
          stepsLines: [
            `Initial value = ${formatNum(target)} / (1 ${sign} ${formatNum(pct)}%)`,
            `= ${formatNum(target)} / (1 ${sign} ${formatNum(dec)}) = ${formattedBase}`
          ]
        });
      }
    }
  };

  const handleClearChange = () => {
    setC2par1('');
    setC2par2('');
    setC2par3('');
    setChangeCalculated(false);
    setChangeResult(null);
    setShowChangeSteps(false);
  };

  // ==============================================================
  // 3. Percentage Calculator in Common Phrases (#pctcommon)
  // Phrase 1: what is [ c21par1 ] % of [ c21par2 ] ?
  // Phrase 2: [ c22par1 ] is what % of [ c22par2 ] ?
  // Phrase 3: [ c23par1 ] is [ c23par2 ] % of what ?
  // ==============================================================
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

  const handleClearCommon = () => {
    setC21par1('');
    setC21par2('');
    setRes21(null);
    setC22par1('');
    setC22par2('');
    setRes22(null);
    setC23par1('');
    setC23par2('');
    setRes23(null);
    setShowCommonSteps(false);
  };

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

        {/* 3 Separate Menu Tabs */}
        <div className="px-4 py-2.5 border-b border-border/60 bg-card/30 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('pctdifference')}
            className={`px-3 py-2 rounded-xl transition-all cursor-pointer text-center truncate ${
              activeTab === 'pctdifference'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink bg-card hover:bg-card-hover border border-border/60'
            }`}
          >
            Percentage Difference Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pctincrease')}
            className={`px-3 py-2 rounded-xl transition-all cursor-pointer text-center truncate ${
              activeTab === 'pctincrease'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink bg-card hover:bg-card-hover border border-border/60'
            }`}
          >
            Percentage Change Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pctcommon')}
            className={`px-3 py-2 rounded-xl transition-all cursor-pointer text-center truncate ${
              activeTab === 'pctcommon'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink bg-card hover:bg-card-hover border border-border/60'
            }`}
          >
            Percentage Calculator in Common Phrases
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-sm text-ink">

          {/* ============================================================== */}
          {/* MENU 1: Percentage Difference Calculator                        */}
          {/* ============================================================== */}
          {activeTab === 'pctdifference' && (
            <div className="space-y-4">
              <div className="border-b border-border/60 pb-1.5">
                <h3 className="text-base font-bold text-ink">
                  Percentage Difference Calculator
                </h3>
              </div>

              {/* Input Form */}
              <form onSubmit={handleCalcDiff} className="p-4 rounded-xl bg-card border border-border/80 space-y-3.5">
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-semibold text-ink sm:w-24">Value 1</label>
                    <input
                      type="text"
                      value={c3par1}
                      onChange={(e) => { setC3par1(e.target.value); setDiffCalculated(true); }}
                      placeholder="185"
                      className="flex-1 px-3.5 py-2 rounded-lg bg-bg border border-border font-mono text-sm text-ink focus:outline-none focus:border-emerald-500 shadow-inner"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-semibold text-ink sm:w-24">Value 2</label>
                    <input
                      type="text"
                      value={c3par2}
                      onChange={(e) => { setC3par2(e.target.value); setDiffCalculated(true); }}
                      placeholder="137"
                      className="flex-1 px-3.5 py-2 rounded-lg bg-bg border border-border font-mono text-sm text-ink focus:outline-none focus:border-emerald-500 shadow-inner"
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
                    <span>Reset</span>
                  </button>
                </div>
              </form>

              {/* Results for Percentage Difference */}
              {diffCalculated && isValidDiff && (
                <div className="space-y-3 pt-1">
                  {/* Green Result Header */}
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-lg sm:text-xl">
                    Result: {formatNum(pctDiffVal)}%
                  </div>

                  {/* Clean Summary Statements */}
                  <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-2">
                    <p className="text-base text-ink">
                      Difference of <b>{c3par1}</b> and <b>{c3par2}</b> are{' '}
                      <span className="text-emerald-500 dark:text-emerald-400 font-bold">
                        {formatNum(pctDiffVal)}%
                      </span>
                    </p>
                    <p className="text-base text-ink pt-1.5 border-t border-border/50">
                      <b>{c3par2}</b> is a{' '}
                      <span className="text-emerald-500 dark:text-emerald-400 font-bold">
                        {formatNum(pctChangeVal)}%
                      </span>{' '}
                      {isDecrease ? 'decrease' : isIncrease ? 'increase' : 'change'} of <b>{c3par1}</b>.
                    </p>
                  </div>

                  {/* Collapsible Dropdown for Steps & Formulas at the bottom */}
                  <div className="border border-border/80 rounded-xl overflow-hidden bg-card/50">
                    <button
                      type="button"
                      onClick={() => setShowDiffSteps(!showDiffSteps)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-ink-muted hover:text-ink hover:bg-card-hover transition-colors cursor-pointer select-none"
                    >
                      <span>Show Steps &amp; Formulas</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDiffSteps ? 'rotate-180 text-emerald-400' : ''}`} />
                    </button>

                    {showDiffSteps && (
                      <div className="p-4 border-t border-border/60 space-y-4 bg-card text-xs sm:text-sm animate-in fade-in duration-150">
                        {/* Step 1 */}
                        <div className="space-y-1.5">
                          <div className="font-bold text-ink-muted">1. Percentage Difference Steps:</div>
                          <div className="overflow-x-auto font-mono text-xs py-1 space-y-2 text-ink-muted">
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
                            <div className="pl-4 text-ink">= {formatNum(pctDiffDec)}</div>
                            <div className="pl-4 font-bold text-emerald-500 dark:text-emerald-400">
                              = {formatNum(pctDiffVal)}%
                            </div>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="space-y-1.5 pt-3 border-t border-border/50">
                          <div className="font-bold text-ink-muted">
                            2. Percentage {isDecrease ? 'Decrease' : isIncrease ? 'Increase' : 'Change'} Steps:
                          </div>
                          <div className="overflow-x-auto font-mono text-xs py-1 space-y-2 text-ink-muted">
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
                            <div className="pl-4 text-ink">= {formatNum(pctChangeDec)}</div>
                            <div className="pl-4 font-bold text-emerald-500 dark:text-emerald-400">
                              = {formatNum(pctChangeVal)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* MENU 2: Percentage Change Calculator                            */}
          {/* ============================================================== */}
          {activeTab === 'pctincrease' && (
            <div className="space-y-4">
              <div className="border-b border-border/60 pb-1.5">
                <h3 className="text-base font-bold text-ink">
                  Percentage Change Calculator
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Please provide any two values below and click the "Calculate" button to get the third value.
                </p>
              </div>

              <form onSubmit={handleCalcChange} className="p-4 rounded-xl bg-card border border-border/80 space-y-4">
                <div className="flex items-center justify-center gap-2 flex-wrap text-sm font-medium">
                  <input
                    type="text"
                    value={c2par1}
                    onChange={(e) => setC2par1(e.target.value)}
                    placeholder="100"
                    className="w-24 px-3 py-2 rounded-lg bg-bg border border-border text-center font-mono text-sm text-ink focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                  <select
                    value={c2type}
                    onChange={(e) => setC2type(e.target.value as 'increase' | 'decrease')}
                    className="px-3 py-2 rounded-lg bg-bg border border-border text-sm font-bold text-ink focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="increase">Increase</option>
                    <option value="decrease">Decrease</option>
                  </select>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={c2par2}
                      onChange={(e) => setC2par2(e.target.value)}
                      placeholder="15"
                      className="w-24 px-3 py-2 rounded-lg bg-bg border border-border text-center font-mono text-sm text-ink focus:outline-none focus:border-emerald-500 shadow-inner"
                    />
                    <span className="font-bold">%</span>
                  </div>
                  <span className="font-bold">=</span>
                  <input
                    type="text"
                    value={c2par3}
                    onChange={(e) => setC2par3(e.target.value)}
                    placeholder="Result"
                    className="w-28 px-3 py-2 rounded-lg bg-bg border border-border text-center font-mono text-sm text-ink font-bold focus:outline-none focus:border-emerald-500 shadow-inner"
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
              </form>

              {/* Results for Percentage Change */}
              {changeCalculated && changeResult && (
                <div className="space-y-3 pt-1">
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-lg sm:text-xl">
                    Result: {changeResult.resultBanner}
                  </div>

                  <div className="p-3.5 rounded-xl bg-card border border-border/80">
                    <p className="text-base text-ink">
                      {changeResult.statementMain}
                      <span className="text-emerald-500 dark:text-emerald-400 font-bold">
                        {changeResult.highlightVal}
                      </span>
                      {changeResult.statementSuffix}
                    </p>
                  </div>

                  {/* Collapsible Dropdown for Steps & Formulas at the bottom */}
                  <div className="border border-border/80 rounded-xl overflow-hidden bg-card/50">
                    <button
                      type="button"
                      onClick={() => setShowChangeSteps(!showChangeSteps)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-ink-muted hover:text-ink hover:bg-card-hover transition-colors cursor-pointer select-none"
                    >
                      <span>Show Steps &amp; Formula</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showChangeSteps ? 'rotate-180 text-emerald-400' : ''}`} />
                    </button>

                    {showChangeSteps && (
                      <div className="p-4 border-t border-border/60 space-y-1.5 bg-card animate-in fade-in duration-150">
                        <div className="font-bold text-ink-muted text-xs">Steps:</div>
                        <div className="font-mono text-xs sm:text-sm space-y-1 text-ink">
                          {changeResult.stepsLines.map((line, idx) => (
                            <div key={idx}>{line}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* MENU 3: Percentage Calculator in Common Phrases                 */}
          {/* ============================================================== */}
          {activeTab === 'pctcommon' && (
            <div className="space-y-4">
              <div className="border-b border-border/60 pb-1.5 flex items-center justify-between">
                <h3 className="text-base font-bold text-ink">
                  Percentage Calculator in Common Phrases
                </h3>
                <button
                  type="button"
                  onClick={handleClearCommon}
                  className="px-3 py-1 rounded-lg bg-card hover:bg-card-hover border border-border text-ink-muted hover:text-ink font-semibold text-xs transition-all cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {/* Phrase 1: what is [P] % of [Y] */}
              <form onSubmit={handleCalc21} className="p-4 rounded-xl bg-card border border-border/80 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap text-sm font-medium">
                    <span>what is</span>
                    <input
                      type="text"
                      value={c21par1}
                      onChange={(e) => setC21par1(e.target.value)}
                      placeholder="15"
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-bg border border-border text-center font-mono text-ink text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <span>% of</span>
                    <input
                      type="text"
                      value={c21par2}
                      onChange={(e) => setC21par2(e.target.value)}
                      placeholder="200"
                      className="w-24 px-2.5 py-1.5 rounded-lg bg-bg border border-border text-center font-mono text-ink text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide transition-all cursor-pointer ml-auto"
                  >
                    Calculate
                  </button>
                </div>
                {res21 !== null && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-sm">
                    Result: {res21}
                  </div>
                )}
              </form>

              {/* Phrase 2: [X] is what % of [Y] */}
              <form onSubmit={handleCalc22} className="p-4 rounded-xl bg-card border border-border/80 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap text-sm font-medium">
                    <input
                      type="text"
                      value={c22par1}
                      onChange={(e) => setC22par1(e.target.value)}
                      placeholder="30"
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-bg border border-border text-center font-mono text-ink text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <span>is what % of</span>
                    <input
                      type="text"
                      value={c22par2}
                      onChange={(e) => setC22par2(e.target.value)}
                      placeholder="120"
                      className="w-24 px-2.5 py-1.5 rounded-lg bg-bg border border-border text-center font-mono text-ink text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide transition-all cursor-pointer ml-auto"
                  >
                    Calculate
                  </button>
                </div>
                {res22 !== null && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-sm">
                    Result: {res22}
                  </div>
                )}
              </form>

              {/* Phrase 3: [X] is [P] % of what */}
              <form onSubmit={handleCalc23} className="p-4 rounded-xl bg-card border border-border/80 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap text-sm font-medium">
                    <input
                      type="text"
                      value={c23par1}
                      onChange={(e) => setC23par1(e.target.value)}
                      placeholder="25"
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-bg border border-border text-center font-mono text-ink text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <span>is</span>
                    <input
                      type="text"
                      value={c23par2}
                      onChange={(e) => setC23par2(e.target.value)}
                      placeholder="10"
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-bg border border-border text-center font-mono text-ink text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <span>% of what</span>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide transition-all cursor-pointer ml-auto"
                  >
                    Calculate
                  </button>
                </div>
                {res23 !== null && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-sm">
                    Result: {res23}
                  </div>
                )}
              </form>

              {/* Collapsible Dropdown for Steps & Formulas at the bottom */}
              <div className="border border-border/80 rounded-xl overflow-hidden bg-card/50">
                <button
                  type="button"
                  onClick={() => setShowCommonSteps(!showCommonSteps)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-ink-muted hover:text-ink hover:bg-card-hover transition-colors cursor-pointer select-none"
                >
                  <span>Show Steps &amp; Formulas</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showCommonSteps ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>

                {showCommonSteps && (
                  <div className="p-4 border-t border-border/60 space-y-3 bg-card font-mono text-xs text-ink animate-in fade-in duration-150">
                    <div>
                      <div className="font-sans font-bold text-ink-muted mb-0.5">1. What is P% of Y:</div>
                      <div>Result = (P / 100) × Y</div>
                      {res21 !== null && (
                        <div className="text-emerald-400 font-bold">
                          = ({c21par1} / 100) × {c21par2} = {res21}
                        </div>
                      )}
                    </div>
                    <div className="pt-2 border-t border-border/50">
                      <div className="font-sans font-bold text-ink-muted mb-0.5">2. X is what % of Y:</div>
                      <div>Result = (X / Y) × 100%</div>
                      {res22 !== null && (
                        <div className="text-emerald-400 font-bold">
                          = ({c22par1} / {c22par2}) × 100% = {res22}
                        </div>
                      )}
                    </div>
                    <div className="pt-2 border-t border-border/50">
                      <div className="font-sans font-bold text-ink-muted mb-0.5">3. X is P% of what:</div>
                      <div>Result = X / (P / 100)</div>
                      {res23 !== null && (
                        <div className="text-emerald-400 font-bold">
                          = {c23par1} / ({c23par2} / 100) = {res23}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/80 bg-card/50 flex items-center justify-between text-xs text-ink-faint">
          <span>Percentage Calculator</span>
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
