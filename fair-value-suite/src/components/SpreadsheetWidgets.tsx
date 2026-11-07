import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Calculator,
  BarChart3,
  Table as TableIcon,
  Sparkles,
  ArrowRight,
  Layers,
  ShieldCheck,
  Percent,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { Num, isNum, v } from '../engine/num';
import { RoiInput, RoiResult } from '../engine/roi';
import { HistoryInput, HistoryResult } from '../engine/history';
import { WeightedTableResult, ScenarioKey } from '../engine/models';

export function fmtNum(val: Num | undefined, decimals = 2): string {
  if (!isNum(val)) return '—';
  return val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtCompact(val: Num | undefined): string {
  if (!isNum(val)) return '—';
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function fmtPct(val: Num | undefined, decimals = 2): string {
  if (!isNum(val)) return '—';
  return `${(val * 100).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

// ============================================================================
// INFO BADGE (1:1 with DcfInfoBadge in main platform + Bulgarian Sheet Comments)
// ============================================================================
export const InfoBadge: React.FC<{
  title: string;
  textBg?: string;
  formula?: string;
  align?: 'left' | 'right' | 'center';
}> = ({ title, textBg, formula, align = 'left' }) => {
  const [open, setOpen] = useState(false);
  const badgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (badgeRef.current && !badgeRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  if (!textBg && !formula) return null;

  const posClass =
    align === 'right'
      ? 'right-0'
      : align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'left-0';

  return (
    <span
      ref={badgeRef}
      className="relative inline-flex items-center ml-1.5 align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-label={`Информация за ${title}`}
        className="w-4 h-4 rounded-full bg-stone-800/90 hover:bg-amber-500/25 border border-stone-700 hover:border-amber-400/60 text-amber-400/90 hover:text-amber-300 inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
      >
        <svg className="h-[9px] w-[9px]" viewBox="0 0 4 16" fill="currentColor" aria-hidden="true">
          <path d="M0 6h4v10h-4v-10zm2-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
        </svg>
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-full mb-2 ${posClass} z-[300] w-72 sm:w-80 rounded-xl bg-stone-900/98 backdrop-blur-md border border-stone-700/90 shadow-2xl p-3.5 text-left font-normal normal-case tracking-normal pointer-events-auto`}
        >
          <div className="text-[11px] font-bold text-white border-b border-stone-800 pb-1.5 mb-2 flex items-center justify-between gap-2">
            <span className="truncate">{title}</span>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
              АЕД Ноу-хау
            </span>
          </div>
          {textBg && (
            <div className="text-[11px] leading-relaxed text-stone-200 whitespace-pre-line max-h-60 overflow-y-auto pr-1">
              {textBg}
            </div>
          )}
          {formula && (
            <div className="mt-2 pt-1.5 border-t border-stone-800 text-[10px] font-mono text-emerald-400">
              Формула: {formula}
            </div>
          )}
        </div>
      )}
    </span>
  );
};

// ============================================================================
// YELLOW MANUAL INPUTS (Styled for Dark Investor Fintech UI)
// ============================================================================
interface YellowNumberInputProps {
  value: Num;
  onChange: (val: Num) => void;
  step?: string | number;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right' | 'center';
  suffix?: string;
  prefix?: string;
  title?: string;
}

export const YellowNumberInput: React.FC<YellowNumberInputProps> = ({
  value,
  onChange,
  step = 'any',
  placeholder = '0',
  className = '',
  align = 'right',
  suffix,
  prefix,
  title,
}) => {
  const [raw, setRaw] = useState<string>(isNum(value) ? String(value) : '');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setRaw(isNum(value) ? String(value) : '');
    }
  }, [value, focused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const str = e.target.value;
    setRaw(str);
    const cleaned = str.replace(/,/g, '').trim();
    if (cleaned === '' || cleaned === '-') {
      onChange(null);
      return;
    }
    const parsed = Number(cleaned);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <div
      title={title || 'Жълто поле за ръчно въвеждане'}
      className={`inline-flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/40 focus-within:border-amber-400 focus-within:bg-amber-500/20 focus-within:ring-2 focus-within:ring-amber-500/25 rounded-lg px-2.5 py-1.5 transition-all ${className}`}
    >
      {prefix && (
        <span className="text-xs font-bold text-amber-400/80 select-none">
          {prefix}
        </span>
      )}
      <input
        type="number"
        step={step}
        value={raw}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={handleChange}
        className={`w-full bg-transparent text-xs font-bold text-amber-100 placeholder-stone-600 focus:outline-none ${
          align === 'right'
            ? 'text-right'
            : align === 'center'
            ? 'text-center'
            : 'text-left'
        }`}
      />
      {suffix && (
        <span className="text-xs font-bold text-amber-400/80 select-none">
          {suffix}
        </span>
      )}
    </div>
  );
};

interface YellowPercentInputProps {
  /** Stored as decimal (e.g. 0.10 for 10%). Displayed and edited as percent (e.g. 10). */
  value: Num;
  onChange: (val: Num) => void;
  className?: string;
  title?: string;
}

export const YellowPercentInput: React.FC<YellowPercentInputProps> = ({
  value,
  onChange,
  className = '',
  title,
}) => {
  const pctVal = isNum(value) ? Number((value * 100).toFixed(4)) : null;
  return (
    <YellowNumberInput
      value={pctVal}
      onChange={(next) => onChange(next === null ? null : next / 100)}
      suffix="%"
      step="0.5"
      className={className}
      title={title}
    />
  );
};

interface YellowTextInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export const YellowTextInput: React.FC<YellowTextInputProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  align = 'left',
}) => (
  <div
    title="Жълто поле за ръчно въвеждане"
    className={`inline-flex items-center bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/40 focus-within:border-amber-400 focus-within:bg-amber-500/20 focus-within:ring-2 focus-within:ring-amber-500/25 rounded-lg px-2.5 py-1.5 transition-all ${className}`}
  >
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-transparent text-xs font-bold text-amber-100 placeholder-stone-600 focus:outline-none ${
        align === 'right'
          ? 'text-right'
          : align === 'center'
          ? 'text-center'
          : 'text-left'
      }`}
    />
  </div>
);

// ============================================================================
// SHEET TOP BANNER (Investor Header Bar for Individual Calculators)
// ============================================================================
export const SheetTopBanner: React.FC<{
  modelTitle?: string;
  modelSubtitle?: string;
  companyLabel?: string;
  companyValue: string;
  onCompanyChange: (v: string) => void;
  priceLabel: string;
  priceValue: Num;
  onPriceChange: (v: Num) => void;
  dataDate: string;
  onDateChange: (v: string) => void;
  extraLeftLabel?: string;
  extraLeftValue?: Num;
  onExtraLeftChange?: (v: Num) => void;
  extraLeftComment?: string;
  onResetSheet?: () => void;
}> = ({
  modelTitle,
  modelSubtitle,
  companyLabel = 'Тикър / Компания',
  companyValue,
  onCompanyChange,
  priceLabel,
  priceValue,
  onPriceChange,
  dataDate,
  onDateChange,
  extraLeftLabel,
  extraLeftValue,
  onExtraLeftChange,
  extraLeftComment,
  onResetSheet,
}) => (
  <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3.5">
    {modelTitle && (
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              {modelTitle}
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                1:1 Инвестиционен Модел
              </span>
            </h2>
            {modelSubtitle && (
              <p className="text-xs text-stone-400">{modelSubtitle}</p>
            )}
          </div>
        </div>
        {onResetSheet && (
          <button
            type="button"
            onClick={onResetSheet}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Нулирай (SYK еталон)</span>
          </button>
        )}
      </div>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
      <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-2.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
          {companyLabel}
        </label>
        <YellowTextInput
          value={companyValue}
          onChange={onCompanyChange}
          className="w-full"
        />
      </div>

      <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-2.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center justify-between mb-1">
          <span>{priceLabel}</span>
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
        </label>
        <YellowNumberInput
          value={priceValue}
          onChange={onPriceChange}
          prefix="$"
          className="w-full"
        />
      </div>

      {extraLeftLabel && onExtraLeftChange ? (
        <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-2.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center mb-1">
            <span>{extraLeftLabel}</span>
            {extraLeftComment && (
              <InfoBadge title={extraLeftLabel} textBg={extraLeftComment} />
            )}
          </label>
          <YellowNumberInput
            value={extraLeftValue ?? null}
            onChange={onExtraLeftChange}
            className="w-full"
          />
        </div>
      ) : (
        <div className="hidden lg:block" />
      )}

      <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-2.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center justify-between mb-1">
          <span>Дата на анализа</span>
          <Calendar className="w-3.5 h-3.5 text-stone-500" />
        </label>
        <YellowTextInput
          value={dataDate}
          onChange={onDateChange}
          className="w-full"
        />
      </div>
    </div>
  </div>
);

// ============================================================================
// HERO VALUATION CARD + VISUAL GAUGE + SCENARIO WEIGHTS (Like DcfCalculatorModal)
// ============================================================================
export const HeroValuationCard: React.FC<{
  title: string;
  subtitle?: string;
  table: WeightedTableResult;
  marketBenchmark: Num;
  marketBenchmarkLabel?: string;
  onWeightChange?: (key: ScenarioKey, weight: Num) => void;
  isCurrency?: boolean;
  decimals?: number;
}> = ({
  title,
  subtitle,
  table,
  marketBenchmark,
  marketBenchmarkLabel = 'Текуща пазарна цена',
  onWeightChange,
  isCurrency = true,
  decimals = 2,
}) => {
  const fv = table.averageIntrinsicValue;
  const mp = v(marketBenchmark);
  const diffPct = (table.underOverValued ?? 0) * 100;
  const isBuy = table.buySell === 'BUY';

  const optIv = v(table.rows.find((r) => r.key === 'optimistic')?.intrinsicValue);
  const avgIv = v(table.rows.find((r) => r.key === 'average')?.intrinsicValue);
  const wstIv = v(table.rows.find((r) => r.key === 'worst')?.intrinsicValue);

  const maxScale = Math.max(fv, mp, optIv, avgIv, wstIv, 1) * 1.2;
  const pctOf = (val: number) => Math.min(98, Math.max(2, (val / maxScale) * 100));

  const prefix = isCurrency ? '$' : '';

  return (
    <div className="bg-stone-900/95 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      {/* Left 7 Cols: Hero Fair Value & Visual Comparison Gauge */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <span>{title}</span>
              {subtitle && (
                <span className="text-[10px] font-normal text-stone-500">
                  ({subtitle})
                </span>
              )}
            </div>
            <div className="mt-1.5 flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {prefix}
                {fmtNum(fv, decimals)}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                  isBuy
                    ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-950/90 text-rose-300 border border-rose-500/40'
                }`}
              >
                {isBuy ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {diffPct >= 0 ? `+${diffPct.toFixed(2)}%` : `${diffPct.toFixed(2)}%`}{' '}
                {isBuy ? 'Подценена (Upside)' : 'Надценена (Downside)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                {marketBenchmarkLabel}
              </div>
              <div className="text-lg font-extrabold text-stone-200">
                {prefix}
                {fmtNum(marketBenchmark, decimals)}
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-xl font-black text-sm tracking-widest shadow-lg border ${
                isBuy
                  ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300 shadow-emerald-500/10'
                  : 'bg-rose-600/25 border-rose-500 text-rose-300 shadow-rose-500/10'
              }`}
            >
              {table.buySell}
            </div>
          </div>
        </div>

        {/* Visual Gauge Bar: Worst / Average / Weighted Fair Value / Optimistic vs Market Price */}
        <div className="bg-stone-950/90 border border-stone-800/90 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span>Диапазон на справедливата стойност по 3-те сценария</span>
            <span className="font-semibold text-stone-300">
              Worst: {prefix}
              {fmtNum(wstIv, decimals)} → Opt: {prefix}
              {fmtNum(optIv, decimals)}
            </span>
          </div>

          <div className="relative h-4 rounded-full bg-stone-800 overflow-hidden">
            {/* Fair Value Zone */}
            <div
              className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-300 ${
                isBuy
                  ? 'bg-gradient-to-r from-emerald-900/80 via-emerald-600/70 to-emerald-400/80'
                  : 'bg-gradient-to-r from-blue-900/70 via-blue-600/60 to-amber-500/70'
              }`}
              style={{ width: `${pctOf(fv)}%` }}
            />
            {/* Marker: Weighted Fair Value */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-emerald-300 shadow-[0_0_8px_#6ee7b7] z-10"
              style={{ left: `${pctOf(fv)}%` }}
              title={`Fair Value: ${prefix}${fmtNum(fv, decimals)}`}
            />
            {/* Marker: Market Price */}
            {mp > 0 && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-rose-400 shadow-[0_0_8px_#fb7185] z-20"
                style={{ left: `${pctOf(mp)}%` }}
                title={`${marketBenchmarkLabel}: ${prefix}${fmtNum(mp, decimals)}`}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                Fair Value: {prefix}
                {fmtNum(fv, decimals)}
              </span>
              {mp > 0 && (
                <span className="inline-flex items-center gap-1.5 text-rose-300 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                  Пазар: {prefix}
                  {fmtNum(mp, decimals)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-stone-400">
              <span>
                Worst: <strong className="text-amber-300">{prefix}{fmtNum(wstIv, decimals)}</strong>
              </span>
              <span>
                Avg: <strong className="text-sky-300">{prefix}{fmtNum(avgIv, decimals)}</strong>
              </span>
              <span>
                Opt: <strong className="text-emerald-300">{prefix}{fmtNum(optIv, decimals)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right 5 Cols: Interactive Scenario Weights Table */}
      <div className="lg:col-span-5 bg-stone-950/80 border border-stone-800 rounded-xl p-3.5">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Тегла на сценариите (Weights)
          </span>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded ${
              Math.abs(table.totalWeight - 1) > 0.001
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            Общо: {fmtPct(table.totalWeight, 0)}
          </span>
        </div>

        <div className="space-y-2">
          {table.rows.map((r) => {
            const badgeColor =
              r.key === 'optimistic'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                : r.key === 'average'
                ? 'text-sky-400 bg-sky-500/10 border-sky-500/30'
                : 'text-amber-400 bg-amber-500/10 border-amber-500/30';
            return (
              <div
                key={r.key}
                className="grid grid-cols-12 items-center gap-2 text-xs bg-stone-900/70 border border-stone-800/70 rounded-lg px-2.5 py-1.5"
              >
                <div className="col-span-4 flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badgeColor}`}
                  >
                    {r.label}
                  </span>
                </div>
                <div className="col-span-4">
                  {onWeightChange ? (
                    <YellowPercentInput
                      value={r.weight}
                      onChange={(w) => onWeightChange(r.key, w)}
                      className="w-full"
                    />
                  ) : (
                    <span className="font-bold text-stone-300 block text-right">
                      {fmtPct(r.weight, 0)}
                    </span>
                  )}
                </div>
                <div className="col-span-4 text-right">
                  <div className="font-bold text-white">
                    {prefix}
                    {fmtNum(r.intrinsicValue, decimals)}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Принос: {prefix}
                    {fmtNum(r.weightedValue, decimals)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ROI CALCULATOR CARD (Dark Fintech Widget)
// ============================================================================
export const RoiCalculatorCard: React.FC<{
  title?: string;
  input: RoiInput;
  result: RoiResult;
  onChange: (next: RoiInput) => void;
}> = ({ title = 'ROI Калкулатор (CAGR)', input, result, onChange }) => (
  <div className="bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-lg">
    <div className="bg-stone-950/90 border-b border-stone-800 px-3.5 py-2.5 text-xs font-bold text-stone-200 flex items-center justify-between">
      <span className="flex items-center gap-1.5">
        <Percent className="w-3.5 h-3.5 text-amber-400" />
        {title}
      </span>
      <InfoBadge
        title={title}
        textBg="Изчислява общата възвръщаемост (ROI) и средногодишния темп на растеж (Annualized ROI / CAGR) между начална и крайна стойност за избран брой години."
        formula="((1 + (Returned - Invested) / Invested) ^ (1 / Years)) - 1"
        align="right"
      />
    </div>
    <div className="p-3.5 space-y-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="text-stone-400 font-medium">Начална сума (Invested)</span>
        <YellowNumberInput
          value={input.invested}
          onChange={(invested) => onChange({ ...input, invested })}
          className="w-32"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-stone-400 font-medium">Крайна сума (Returned)</span>
        <YellowNumberInput
          value={input.returned}
          onChange={(returned) => onChange({ ...input, returned })}
          className="w-32"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-stone-400 font-medium">Период (Years)</span>
        <YellowNumberInput
          value={input.years}
          onChange={(years) => onChange({ ...input, years })}
          className="w-32"
        />
      </div>
      <div className="border-t border-stone-800 my-2 pt-2.5 grid grid-cols-3 gap-2 text-center">
        <div className="bg-stone-950/80 border border-stone-800/80 rounded-lg p-2">
          <div className="text-[10px] text-stone-500 uppercase font-semibold">Общ ROI</div>
          <div
            className={`text-xs font-extrabold mt-0.5 ${
              (result.roi ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {fmtPct(result.roi, 2)}
          </div>
        </div>
        <div className="bg-stone-950/80 border border-amber-500/30 rounded-lg p-2">
          <div className="text-[10px] text-amber-300 uppercase font-bold">Годишен (CAGR)</div>
          <div
            className={`text-xs font-black mt-0.5 ${
              (result.annualized ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {fmtPct(result.annualized, 2)}
          </div>
        </div>
        <div className="bg-stone-950/80 border border-stone-800/80 rounded-lg p-2">
          <div className="text-[10px] text-stone-500 uppercase font-semibold">Печалба (Gain)</div>
          <div className="text-xs font-extrabold text-stone-200 mt-0.5">
            {fmtCompact(result.gain)}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// 10-YEAR HISTORICAL ANALYZER + INTERACTIVE BAR CHART + 1-CLICK APPLY
// ============================================================================
export const History10YTable: React.FC<{
  title: string;
  input: HistoryInput;
  result: HistoryResult;
  onChange: (next: HistoryInput) => void;
  decimals?: number;
  onApplyAverage?: (avg: number) => void;
  onApplyCagr?: (cagr: number) => void;
}> = ({
  title,
  input,
  result,
  onChange,
  decimals = 0,
  onApplyAverage,
  onApplyCagr,
}) => {
  const [showTable, setShowTable] = useState(true);

  const updateValue = (idx: number, val: Num) => {
    const next = [...input.values];
    next[idx] = val;
    onChange({ ...input, values: next });
  };

  const numericVals = result.values.map((x) => (isNum(x) ? x : 0));
  const maxAbs = Math.max(...numericVals.map((x) => Math.abs(x)), 1);

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-stone-950/90 border-b border-stone-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight">
              {title}
            </h3>
            <p className="text-[11px] text-stone-400">
              10-годишна история, средна стойност и автоматичен CAGR анализатор
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick KPI Pills */}
          <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-xl px-3 py-1 text-xs">
            <span className="text-stone-400">Средно (10Y Avg):</span>
            <span className="font-extrabold text-white">
              {fmtNum(result.average, decimals)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-xl px-3 py-1 text-xs">
            <span className="text-stone-400">Среден годишен ръст:</span>
            <span
              className={`font-extrabold ${
                (result.averageGrowth ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {fmtPct(result.averageGrowth, 2)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1 text-xs">
            <span className="text-amber-300 font-semibold">CAGR:</span>
            <span
              className={`font-black ${
                (result.cagr ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {fmtPct(result.cagr, 2)}
            </span>
          </div>

          {onApplyAverage && isNum(result.average) && (
            <button
              type="button"
              onClick={() => onApplyAverage(result.average!)}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 cursor-pointer flex items-center gap-1 transition-colors"
              title="Постави 10-годишната средна стойност като базова метрика в модела"
            >
              <Sparkles className="w-3 h-3" />
              <span>Ползвай 10Y Avg като база</span>
            </button>
          )}

          {onApplyCagr && isNum(result.cagr) && (
            <button
              type="button"
              onClick={() => onApplyCagr(result.cagr!)}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 cursor-pointer flex items-center gap-1 transition-colors"
              title="Постави историческия CAGR в сценариите за растеж"
            >
              <Sparkles className="w-3 h-3" />
              <span>Приложи CAGR в сценариите</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowTable((prev) => !prev)}
            className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer flex items-center gap-1"
          >
            <TableIcon className="w-3 h-3" />
            <span>{showTable ? 'Скрий таблицата' : 'Редактирай години'}</span>
          </button>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="p-4 bg-stone-950/50 border-b border-stone-800/80">
        <div className="grid grid-cols-11 gap-2 items-end h-36 pt-5 px-2">
          {result.years.map((yr, i) => {
            const val = result.values[i];
            const num = isNum(val) ? val : 0;
            const hPct = Math.max(6, Math.round((Math.abs(num) / maxAbs) * 100));
            const g = result.growth[i];
            return (
              <div
                key={i}
                className="flex flex-col items-center justify-end h-full group relative"
              >
                <div className="text-[10px] font-bold text-stone-300 mb-1 truncate max-w-full">
                  {isNum(val) ? fmtCompact(val) : '—'}
                </div>
                <div className="w-full flex-1 flex items-end justify-center">
                  <div
                    className={`w-full max-w-[38px] rounded-t-lg transition-all duration-300 ${
                      num >= 0
                        ? 'bg-gradient-to-t from-blue-600/80 to-emerald-400/90 group-hover:from-blue-500 group-hover:to-emerald-300'
                        : 'bg-gradient-to-t from-rose-700 to-rose-400'
                    }`}
                    style={{ height: `${hPct}%` }}
                    title={`${yr}: ${fmtNum(val, decimals)} (${
                      i === 0 ? 'Базова година' : `YoY: ${fmtPct(g, 2)}`
                    })`}
                  />
                </div>
                <div className="text-[10px] font-bold text-stone-400 mt-1.5">
                  {yr}
                </div>
                <div
                  className={`text-[9px] font-semibold ${
                    g === null
                      ? 'text-stone-600'
                      : g >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {i === 0 ? 'Base' : fmtPct(g, 1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editable Yearly Inputs Table */}
      {showTable && (
        <div className="overflow-x-auto p-3 bg-stone-900/60">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-semibold text-stone-400">
              Ръчно въвеждане на исторически данни по години (жълти полета):
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-400">Начална година (Year 0):</span>
              <YellowNumberInput
                value={input.startYear}
                onChange={(y) => onChange({ ...input, startYear: y ?? 2016 })}
                className="w-24"
              />
            </div>
          </div>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-stone-950/80 text-stone-400 border-b border-stone-800">
                {result.years.map((yr, i) => (
                  <th key={i} className="px-2 py-1.5 text-center font-bold">
                    {yr}{' '}
                    <span className="text-[10px] font-normal text-stone-500 block">
                      Y{i}
                    </span>
                  </th>
                ))}
                <th className="px-3 py-1.5 text-right font-bold text-amber-300 bg-stone-950">
                  Average
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-800/80">
                {result.values.map((val, i) => (
                  <td key={i} className="p-1.5 min-w-[96px]">
                    <YellowNumberInput
                      value={val}
                      onChange={(v) => updateValue(i, v)}
                      className="w-full"
                    />
                  </td>
                ))}
                <td className="px-3 py-1.5 text-right font-black text-white bg-stone-950/60 whitespace-nowrap">
                  {fmtNum(result.average, decimals)}
                </td>
              </tr>
              <tr className="bg-stone-950/40">
                {result.growth.map((g, i) => (
                  <td
                    key={i}
                    className={`px-2 py-1.5 text-right font-bold whitespace-nowrap ${
                      g === null
                        ? 'text-stone-600'
                        : g >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {i === 0 ? '—' : fmtPct(g, 2)}
                  </td>
                ))}
                <td className="px-3 py-1.5 text-right font-black text-emerald-400 bg-stone-950/80 whitespace-nowrap">
                  {fmtPct(result.averageGrowth, 2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// WEIGHTED SUMMARY TABLE (Secondary / Market Cap DCF Table)
// ============================================================================
export const WeightedSummaryTable: React.FC<{
  title?: string;
  table: WeightedTableResult;
  onWeightChange?: (key: 'optimistic' | 'average' | 'worst', weight: Num) => void;
  decimals?: number;
  extraHeader?: React.ReactNode;
}> = ({
  title = 'Претеглена оценка по сценарии',
  table,
  onWeightChange,
  decimals = 2,
  extraHeader,
}) => (
  <div className="bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-lg">
    <div className="bg-stone-950/90 border-b border-stone-800 px-4 py-2.5 text-xs font-bold text-stone-200 flex flex-wrap items-center justify-between gap-2">
      <span className="flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        {title}
      </span>
      {extraHeader}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-stone-950/60 text-stone-400 border-b border-stone-800">
            <th className="px-3 py-2 text-left font-bold">Сценарий</th>
            <th className="px-3 py-2 text-right font-bold">Тегло</th>
            <th className="px-3 py-2 text-right font-bold">Intrinsic Value</th>
            <th className="px-3 py-2 text-right font-bold">IV × Weight</th>
            <th className="px-3 py-2 text-right font-bold">Средна Стойност</th>
            <th className="px-3 py-2 text-center font-bold">Сигнал</th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r, idx) => (
            <tr key={r.key} className="border-b border-stone-800/80">
              <td className="px-3 py-2 font-bold text-stone-200">{r.label}</td>
              <td className="px-3 py-1.5 text-right">
                {onWeightChange ? (
                  <YellowPercentInput
                    value={r.weight}
                    onChange={(w) => onWeightChange(r.key, w)}
                    className="w-24"
                  />
                ) : (
                  <span className="font-bold text-stone-300">
                    {fmtPct(r.weight, 0)}
                  </span>
                )}
              </td>
              <td className="px-3 py-2 text-right font-bold text-stone-100">
                {fmtNum(r.intrinsicValue, decimals)}
              </td>
              <td className="px-3 py-2 text-right text-stone-400">
                {fmtNum(r.weightedValue, decimals)}
              </td>
              {idx === 0 && (
                <td
                  rowSpan={3}
                  className="px-3 py-2 text-right font-black text-base text-white bg-emerald-950/25 border-l border-stone-800"
                >
                  {fmtNum(table.averageIntrinsicValue, decimals)}
                </td>
              )}
              {idx === 0 && (
                <td
                  rowSpan={3}
                  className="px-3 py-2 text-center border-l border-stone-800"
                >
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-xs font-black tracking-wider border ${
                      table.buySell === 'BUY'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {table.buySell}
                  </span>
                </td>
              )}
            </tr>
          ))}
          <tr className="bg-stone-950/80 font-bold">
            <td className="px-3 py-2 text-stone-400">Общо</td>
            <td
              className={`px-3 py-2 text-right ${
                Math.abs(table.totalWeight - 1) > 0.001
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}
            >
              {fmtPct(table.totalWeight, 0)}
            </td>
            <td colSpan={2} className="px-3 py-2 text-right text-stone-400">
              Подценена / Надценена:
            </td>
            <td
              colSpan={2}
              className={`px-3 py-2 text-right font-black text-sm ${
                (table.underOverValued ?? 0) >= 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {fmtPct(table.underOverValued, 2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// ============================================================================
// UNIT CONVERTER CARD (Billions / Trillions to Thousands K)
// ============================================================================
export const UnitConverterCard: React.FC<{
  billions: Num;
  onBillionsChange: (v: Num) => void;
  billionsOut: number;
  trillions: Num;
  onTrillionsChange: (v: Num) => void;
  trillionsOut: number;
}> = ({
  billions,
  onBillionsChange,
  billionsOut,
  trillions,
  onTrillionsChange,
  trillionsOut,
}) => (
  <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 shadow-lg text-xs space-y-3">
    <div className="font-bold text-stone-200 border-b border-stone-800 pb-2 flex items-center justify-between">
      <span className="flex items-center gap-1.5">
        <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
        Конвертор Млрд. / Трл. → Хиляди (K)
      </span>
      <span className="text-[10px] text-stone-500">За Yahoo Finance / Macrotrends</span>
    </div>
    <div className="grid grid-cols-2 gap-3 items-center">
      <div>
        <div className="text-[11px] text-stone-400 mb-1">Милиарди (Billions B)</div>
        <YellowNumberInput
          value={billions}
          onChange={onBillionsChange}
          className="w-full"
        />
      </div>
      <div>
        <div className="text-[11px] text-stone-400 mb-1">В хиляди (K)</div>
        <div className="px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 font-extrabold text-amber-300 text-right">
          {fmtNum(billionsOut, 0)}
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 items-center">
      <div>
        <div className="text-[11px] text-stone-400 mb-1">Трилиони (Trillions T)</div>
        <YellowNumberInput
          value={trillions}
          onChange={onTrillionsChange}
          className="w-full"
        />
      </div>
      <div>
        <div className="text-[11px] text-stone-400 mb-1">В хиляди (K)</div>
        <div className="px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 font-extrabold text-amber-300 text-right">
          {fmtNum(trillionsOut, 0)}
        </div>
      </div>
    </div>
  </div>
);
