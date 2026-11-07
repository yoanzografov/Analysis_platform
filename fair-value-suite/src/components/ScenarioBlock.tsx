import React, { useState } from 'react';
import {
  BarChart3,
  Table as TableIcon,
  TrendingUp,
  Layers,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import {
  SCENARIO_KEYS,
  SCENARIO_LABELS,
  ScenarioKey,
  ScenarioParams,
  ScenarioRowResult,
} from '../engine/models';
import { isNum, v } from '../engine/num';
import { SHEET_COMMENTS } from '../engine/commentsData';
import {
  InfoBadge,
  YellowNumberInput,
  YellowPercentInput,
  fmtCompact,
  fmtNum,
  fmtPct,
} from './SpreadsheetWidgets';

interface ScenarioBlocksProps {
  sheetId?: string; // 'dcf10' | 'fcfMultiple' | 'evEbitda' | 'pe' | 'dividends' | 'randomMultiple'
  mode: 'cashflow' | 'backwardsMultiple';
  terminalLabel: string; // e.g. 'Perpetual Growth', 'FCF Multiple', 'EBITDA Multiple', 'P/E Multiple', 'Dividend multiple', 'Price to FCF'
  terminalIsPercent?: boolean; // true only for DCF 10 years ('Perpetual Growth')
  editableBasePerScenario?: boolean; // true for DCF 10 years and EV/EBITDA where D5/D12/D19 is a yellow cell
  baseMetricLabel?: string;
  scenariosInput: Record<ScenarioKey, ScenarioParams>;
  scenariosResult: Record<ScenarioKey, ScenarioRowResult>;
  onChangeScenario: (key: ScenarioKey, next: ScenarioParams) => void;
  decimals?: number;
  isCurrency?: boolean;
}

const SCENARIO_THEME: Record<
  ScenarioKey,
  {
    titleBg: string;
    subtitleBg: string;
    border: string;
    headerBg: string;
    badge: string;
    accentText: string;
    barColor: string;
    sliderAccent: string;
  }
> = {
  optimistic: {
    titleBg: 'Optimistic (Оптимистичен)',
    subtitleBg: 'Висок растеж / силен мултипъл',
    border: 'border-emerald-500/30 hover:border-emerald-500/50',
    headerBg: 'bg-emerald-950/35 border-b border-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    accentText: 'text-emerald-400',
    barColor: 'from-emerald-600 to-emerald-400',
    sliderAccent: 'accent-emerald-500',
  },
  average: {
    titleBg: 'Average (Базов / Реалистичен)',
    subtitleBg: 'Умерен растеж / историческа норма',
    border: 'border-sky-500/30 hover:border-sky-500/50',
    headerBg: 'bg-sky-950/35 border-b border-sky-500/20',
    badge: 'bg-sky-500/20 text-sky-300 border border-sky-500/40',
    accentText: 'text-sky-400',
    barColor: 'from-sky-600 to-sky-400',
    sliderAccent: 'accent-sky-500',
  },
  worst: {
    titleBg: 'Worst (Консервативен / Песимистичен)',
    subtitleBg: 'Забавен растеж / защитен сценарий',
    border: 'border-amber-500/30 hover:border-amber-500/50',
    headerBg: 'bg-amber-950/30 border-b border-amber-500/20',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    accentText: 'text-amber-400',
    barColor: 'from-amber-600 to-amber-400',
    sliderAccent: 'accent-amber-500',
  },
};

export const ScenarioBlocks: React.FC<ScenarioBlocksProps> = ({
  sheetId = 'dcf10',
  mode,
  terminalLabel,
  terminalIsPercent = false,
  editableBasePerScenario = false,
  baseMetricLabel = 'Базова стойност (2026)',
  scenariosInput,
  scenariosResult,
  onChangeScenario,
  decimals = 2,
  isCurrency = true,
}) => {
  const [bottomView, setBottomView] = useState<'both' | 'chart' | 'table'>('both');
  const comments = SHEET_COMMENTS[sheetId] ?? {};
  const prefix = isCurrency ? '$' : '';

  // Compute max projected value across all 3 scenarios for the visual trajectory chart
  const allProjected = SCENARIO_KEYS.flatMap((k) => scenariosResult[k].projected);
  const maxProj = Math.max(...allProjected.map((x) => Math.abs(x)), 1);
  const years = scenariosResult.optimistic.years;

  return (
    <div className="space-y-5">
      {/* 1. THREE SIDE-BY-SIDE INTERACTIVE SCENARIO CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {SCENARIO_KEYS.map((key) => {
          const inp = scenariosInput[key];
          const res = scenariosResult[key];
          const theme = SCENARIO_THEME[key];
          const update = (patch: Partial<ScenarioParams>) =>
            onChangeScenario(key, { ...inp, ...patch });

          // Cell refs for Bulgarian comments in SHEET_COMMENTS
          const rowOffset = key === 'optimistic' ? 5 : key === 'average' ? 12 : 19;
          const discountComment =
            comments[`B${rowOffset}`] ||
            comments['B5'] ||
            SHEET_COMMENTS.pe?.B5;
          const growth1Comment =
            comments[`B${rowOffset + 1}`] ||
            comments['B6'] ||
            'Очакван средногодишен темп на растеж през първите 5 години.';
          const growth2Comment =
            comments[`B${rowOffset + 2}`] ||
            comments['B7'] ||
            'Очакван средногодишен темп на растеж от 5-тата до 10-тата година.';
          const terminalComment =
            comments[`B${rowOffset + 3}`] ||
            comments[`A${rowOffset + 3}`] ||
            comments['B8'] ||
            comments['A8'];
          const baseComment =
            comments[`D${rowOffset}`] || comments['D5'] || comments['B2'];

          return (
            <div
              key={key}
              className={`bg-stone-900/95 border ${theme.border} rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all`}
            >
              {/* Card Header with Intrinsic Value Hero */}
              <div className={`p-4 ${theme.headerBg}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${theme.badge}`}
                    >
                      <Sliders className="w-3 h-3" />
                      {theme.titleBg}
                    </span>
                    <p className="text-[11px] text-stone-400 mt-1">
                      {theme.subtitleBg}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                      Intrinsic Value
                    </div>
                    <div className={`text-2xl font-black ${theme.accentText}`}>
                      {prefix}
                      {fmtNum(res.intrinsicValue, decimals)}
                    </div>
                  </div>
                </div>

                {/* Mini KPI Row inside Scenario Header */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-stone-800/80 text-[11px]">
                  <div className="bg-stone-950/60 rounded-lg px-2.5 py-1.5 border border-stone-800/70">
                    <span className="text-stone-400 block">
                      {mode === 'cashflow' ? 'Сума PV (Днес):' : 'Дисконтирана ст-ст:'}
                    </span>
                    <span className="font-bold text-stone-200">
                      {fmtCompact(res.sumPV)}
                    </span>
                  </div>
                  <div className="bg-stone-950/60 rounded-lg px-2.5 py-1.5 border border-stone-800/70">
                    <span className="text-stone-400 block">
                      Терминална ст-ст (Год. 10):
                    </span>
                    <span className="font-bold text-stone-200">
                      {fmtCompact(res.terminalFuture)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Sliders + Yellow Inputs */}
              <div className="p-4 space-y-3.5 text-xs flex-1">
                {/* Base Metric per Scenario (only for DCF 10Y & EV/EBITDA where D5/D12/D19 is editable) */}
                {editableBasePerScenario && (
                  <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-stone-300 flex items-center">
                        {baseMetricLabel}
                        <InfoBadge
                          title={baseMetricLabel}
                          textBg={baseComment}
                        />
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        D{rowOffset}
                      </span>
                    </div>
                    <YellowNumberInput
                      value={inp.baseMetric ?? null}
                      onChange={(baseMetric) => update({ baseMetric })}
                      className="w-full"
                    />
                  </div>
                )}

                {/* 1. Discount Rate */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-stone-300 flex items-center">
                      Discount Rate (Дисконтов %)
                      <InfoBadge
                        title="Discount Rate (Required Return)"
                        textBg={discountComment}
                      />
                    </span>
                    <YellowPercentInput
                      value={inp.discountRate}
                      onChange={(discountRate) => update({ discountRate })}
                      className="w-24"
                    />
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={25}
                    step={0.5}
                    value={Number((v(inp.discountRate) * 100).toFixed(2))}
                    onChange={(e) =>
                      update({ discountRate: parseFloat(e.target.value) / 100 })
                    }
                    className={`w-full h-1.5 bg-stone-800 rounded-lg cursor-pointer ${theme.sliderAccent}`}
                  />
                </div>

                {/* 2. Growth next 5 years */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-stone-300 flex items-center">
                      Growth 1–5 Years (Ръст 1–5 г.)
                      <InfoBadge
                        title="Growth next 5 years"
                        textBg={growth1Comment}
                      />
                    </span>
                    <YellowPercentInput
                      value={inp.growth1to5}
                      onChange={(growth1to5) => update({ growth1to5 })}
                      className="w-24"
                    />
                  </div>
                  <input
                    type="range"
                    min={-10}
                    max={40}
                    step={0.5}
                    value={Number((v(inp.growth1to5) * 100).toFixed(2))}
                    onChange={(e) =>
                      update({ growth1to5: parseFloat(e.target.value) / 100 })
                    }
                    className={`w-full h-1.5 bg-stone-800 rounded-lg cursor-pointer ${theme.sliderAccent}`}
                  />
                </div>

                {/* 3. Growth 5-10 years */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-stone-300 flex items-center">
                      Growth 5–10 Years (Ръст 5–10 г.)
                      <InfoBadge
                        title="Growth 5-10 years"
                        textBg={growth2Comment}
                      />
                    </span>
                    <YellowPercentInput
                      value={inp.growth5to10}
                      onChange={(growth5to10) => update({ growth5to10 })}
                      className="w-24"
                    />
                  </div>
                  <input
                    type="range"
                    min={-10}
                    max={35}
                    step={0.5}
                    value={Number((v(inp.growth5to10) * 100).toFixed(2))}
                    onChange={(e) =>
                      update({ growth5to10: parseFloat(e.target.value) / 100 })
                    }
                    className={`w-full h-1.5 bg-stone-800 rounded-lg cursor-pointer ${theme.sliderAccent}`}
                  />
                </div>

                {/* 4. Terminal Parameter (Perpetual Growth or Multiple) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-stone-300 flex items-center">
                      {terminalLabel}
                      <InfoBadge
                        title={terminalLabel}
                        textBg={terminalComment}
                      />
                    </span>
                    {terminalIsPercent ? (
                      <YellowPercentInput
                        value={inp.terminalParam}
                        onChange={(terminalParam) => update({ terminalParam })}
                        className="w-24"
                      />
                    ) : (
                      <YellowNumberInput
                        value={inp.terminalParam}
                        onChange={(terminalParam) => update({ terminalParam })}
                        suffix="x"
                        className="w-24"
                      />
                    )}
                  </div>
                  {terminalIsPercent ? (
                    <input
                      type="range"
                      min={0}
                      max={8}
                      step={0.25}
                      value={Number((v(inp.terminalParam) * 100).toFixed(2))}
                      onChange={(e) =>
                        update({
                          terminalParam: parseFloat(e.target.value) / 100,
                        })
                      }
                      className={`w-full h-1.5 bg-stone-800 rounded-lg cursor-pointer ${theme.sliderAccent}`}
                    />
                  ) : (
                    <input
                      type="range"
                      min={1}
                      max={50}
                      step={0.5}
                      value={v(inp.terminalParam)}
                      onChange={(e) =>
                        update({ terminalParam: parseFloat(e.target.value) })
                      }
                      className={`w-full h-1.5 bg-stone-800 rounded-lg cursor-pointer ${theme.sliderAccent}`}
                    />
                  )}
                </div>

                {/* 5. Margin of Safety */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-stone-300 flex items-center">
                      Margin of Safety (Марж на сигурност)
                      <InfoBadge
                        title="Margin of Safety"
                        textBg="Отстъпка за сигурност (обикновено 10% – 25%), която намалява изчислената справедлива стойност като буфер срещу непредвидени рискове."
                      />
                    </span>
                    <YellowPercentInput
                      value={inp.marginOfSafety}
                      onChange={(marginOfSafety) => update({ marginOfSafety })}
                      className="w-24"
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={Number((v(inp.marginOfSafety) * 100).toFixed(2))}
                    onChange={(e) =>
                      update({
                        marginOfSafety: parseFloat(e.target.value) / 100,
                      })
                    }
                    className={`w-full h-1.5 bg-stone-800 rounded-lg cursor-pointer ${theme.sliderAccent}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. 10-YEAR TRAJECTORY CHART & FULL PROJECTION TABLE (2026 - 2036) */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-stone-950/90 border-b border-stone-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                10-Годишна Прогноза и Дисконтирани Парични Потоци ({years[0]}–{years[years.length - 1]})
              </h3>
              <p className="text-[11px] text-stone-400">
                Сравнение на траекториите за Optimistic, Average и Worst сценарии (1:1 с таблицата)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setBottomView('both')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                bottomView === 'both'
                  ? 'bg-blue-600 text-white'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Графика + Таблица
            </button>
            <button
              type="button"
              onClick={() => setBottomView('chart')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                bottomView === 'chart'
                  ? 'bg-blue-600 text-white'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Само Графика
            </button>
            <button
              type="button"
              onClick={() => setBottomView('table')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                bottomView === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Само Таблица
            </button>
          </div>
        </div>

        {/* Visual Multi-Scenario Trajectory Bar Chart */}
        {(bottomView === 'both' || bottomView === 'chart') && (
          <div className="p-4 bg-stone-950/50 border-b border-stone-800/80">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-3 px-2">
              <span>Прогнозиран растеж по години ({years[0]} – {years[10]})</span>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 inline-block" />
                  Optimistic
                </span>
                <span className="inline-flex items-center gap-1.5 text-sky-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-xs bg-sky-400 inline-block" />
                  Average
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 inline-block" />
                  Worst
                </span>
              </div>
            </div>

            <div className="grid grid-cols-11 gap-2 items-end h-44 pt-4 px-2">
              {years.map((yr, idx) => {
                const optVal = scenariosResult.optimistic.projected[idx];
                const avgVal = scenariosResult.average.projected[idx];
                const wstVal = scenariosResult.worst.projected[idx];

                const optH = Math.max(6, Math.round((Math.abs(optVal) / maxProj) * 100));
                const avgH = Math.max(6, Math.round((Math.abs(avgVal) / maxProj) * 100));
                const wstH = Math.max(6, Math.round((Math.abs(wstVal) / maxProj) * 100));

                return (
                  <div
                    key={yr}
                    className="flex flex-col items-center justify-end h-full group"
                  >
                    <div className="text-[10px] font-bold text-emerald-300 mb-1 opacity-85 group-hover:opacity-100">
                      {fmtCompact(optVal)}
                    </div>
                    <div className="w-full flex-1 flex items-end justify-center gap-1">
                      <div
                        className="w-2.5 sm:w-3 rounded-t bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-300"
                        style={{ height: `${optH}%` }}
                        title={`${yr} Optimistic: ${fmtNum(optVal, decimals)}`}
                      />
                      <div
                        className="w-2.5 sm:w-3 rounded-t bg-gradient-to-t from-sky-600 to-sky-400 transition-all duration-300"
                        style={{ height: `${avgH}%` }}
                        title={`${yr} Average: ${fmtNum(avgVal, decimals)}`}
                      />
                      <div
                        className="w-2.5 sm:w-3 rounded-t bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-300"
                        style={{ height: `${wstH}%` }}
                        title={`${yr} Worst: ${fmtNum(wstVal, decimals)}`}
                      />
                    </div>
                    <div className="text-[10px] font-bold text-stone-300 mt-1.5">
                      {yr}
                    </div>
                    <div className="text-[9px] text-stone-500">Y{idx}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full 1:1 Year-by-Year Projection & Discounted Cash Flow Table */}
        {(bottomView === 'both' || bottomView === 'table') && (
          <div className="overflow-x-auto p-3 space-y-3">
            {SCENARIO_KEYS.map((key) => {
              const res = scenariosResult[key];
              const theme = SCENARIO_THEME[key];
              return (
                <div
                  key={key}
                  className="bg-stone-950/70 border border-stone-800/90 rounded-xl overflow-hidden"
                >
                  <div className="px-3.5 py-2 bg-stone-950 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className={`font-extrabold ${theme.accentText}`}>
                      {SCENARIO_LABELS[key]} — Детайлна таблица по години
                    </span>
                    <div className="flex items-center gap-4">
                      {mode === 'cashflow' && (
                        <span className="text-stone-400">
                          Sum of PV:{' '}
                          <strong className="text-white">
                            {fmtNum(res.sumPV, decimals)}
                          </strong>
                        </span>
                      )}
                      <span className="text-stone-400">
                        INTRINSIC VALUE:{' '}
                        <strong className={`text-sm font-black ${theme.accentText}`}>
                          {prefix}
                          {fmtNum(res.intrinsicValue, decimals)}
                        </strong>
                      </span>
                    </div>
                  </div>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-900/70 text-stone-400 border-b border-stone-800">
                        <th className="px-3 py-1.5 text-left font-bold min-w-[160px]">
                          Ред / Година
                        </th>
                        {res.years.map((yr) => (
                          <th
                            key={yr}
                            className="px-2.5 py-1.5 text-right font-bold text-stone-300"
                          >
                            {yr}
                          </th>
                        ))}
                        {mode === 'cashflow' && (
                          <th className="px-3 py-1.5 text-right font-bold text-amber-300 bg-stone-900">
                            Terminal Value
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Projected Row */}
                      <tr className="border-b border-stone-800/70">
                        <td className="px-3 py-1.5 font-semibold text-stone-300">
                          Прогнозен поток (Projected)
                        </td>
                        {res.projected.map((val, idx) => (
                          <td
                            key={idx}
                            className="px-2.5 py-1.5 text-right font-semibold text-stone-200 whitespace-nowrap"
                          >
                            {fmtNum(val, decimals)}
                          </td>
                        ))}
                        {mode === 'cashflow' && (
                          <td
                            className="px-3 py-1.5 text-right font-bold text-amber-200 bg-stone-900/50 whitespace-nowrap"
                            title="Бъдеща терминална стойност в Година 10"
                          >
                            {fmtNum(res.terminalFuture, decimals)}
                          </td>
                        )}
                      </tr>

                      {/* Discounted Row */}
                      <tr className="bg-stone-900/30">
                        <td className="px-3 py-1.5 font-semibold text-stone-400">
                          {mode === 'cashflow'
                            ? 'Дисконтиран поток (PV)'
                            : 'Дисконтирана цена (Назад от Год. 10)'}
                        </td>
                        {mode === 'cashflow' ? (
                          <>
                            <td className="px-2.5 py-1.5 text-right text-stone-600">
                              —
                            </td>
                            {res.discounted.map((d, idx) => (
                              <td
                                key={idx}
                                className="px-2.5 py-1.5 text-right text-stone-400 whitespace-nowrap"
                              >
                                {fmtNum(d, decimals)}
                              </td>
                            ))}
                            <td
                              className="px-3 py-1.5 text-right font-extrabold text-emerald-300 bg-stone-900/70 whitespace-nowrap"
                              title="Дисконтирана терминална стойност към днес"
                            >
                              {fmtNum(res.terminalPV, decimals)}
                            </td>
                          </>
                        ) : (
                          <>
                            {res.discounted.map((d, idx) => (
                              <td
                                key={idx}
                                className={`px-2.5 py-1.5 text-right whitespace-nowrap ${
                                  idx === 0 || idx === 10
                                    ? 'font-extrabold text-amber-300 bg-amber-500/10'
                                    : 'text-stone-400'
                                }`}
                              >
                                {fmtNum(d, decimals)}
                              </td>
                            ))}
                          </>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
