import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Layers,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  Activity,
  Award,
  DollarSign,
  PieChart,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  Dcf10State,
  EvEbitdaState,
  FcfMultipleState,
  MultipleModelsState,
  OverviewState,
  PeSheetState,
  PeterLynchState,
  StockValuationState,
  computeDcf10,
  computeEvEbitda,
  computeFcfMultiple,
  computeMultipleModels,
  computeOverview,
  computePeSheet,
  computePeterLynch,
  computeStockValuation,
} from '../engine/models';
import { Num, isNum, v } from '../engine/num';
import { SHEET_COMMENTS } from '../engine/commentsData';
import { ScenarioBlocks } from './ScenarioBlock';
import {
  HeroValuationCard,
  History10YTable,
  InfoBadge,
  RoiCalculatorCard,
  SheetTopBanner,
  UnitConverterCard,
  WeightedSummaryTable,
  YellowNumberInput,
  YellowPercentInput,
  YellowTextInput,
  fmtCompact,
  fmtNum,
  fmtPct,
} from './SpreadsheetWidgets';

// ============================================================================
// 1. OVERVIEW VIEW (Executive Stock Snapshot + 10Y Interactive Area Chart)
// ============================================================================
export const OverviewView: React.FC<{
  state: OverviewState;
  onChange: (next: OverviewState) => void;
  onReset: () => void;
}> = ({ state, onChange, onReset }) => {
  const res = computeOverview(state);
  const [timeframe, setTimeframe] = useState<'1Y' | '3Y' | '5Y' | '10Y'>('10Y');
  const [showOhlcvTable, setShowOhlcvTable] = useState(false);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('');
  const pageSize = 40;

  // Slice price history for chart based on timeframe
  const chartBars = useMemo(() => {
    const total = state.priceHistory.length;
    if (total === 0) return [];
    const count =
      timeframe === '1Y'
        ? 252
        : timeframe === '3Y'
        ? 756
        : timeframe === '5Y'
        ? 1260
        : total;
    return state.priceHistory.slice(Math.max(0, total - count));
  }, [state.priceHistory, timeframe]);

  // Build SVG path for the interactive area chart
  const svgChart = useMemo(() => {
    if (chartBars.length < 2) return null;
    const step = Math.max(1, Math.floor(chartBars.length / 260));
    const sampled = chartBars.filter((_, idx) => idx % step === 0 || idx === chartBars.length - 1);
    const closes = sampled.map((b) => b.close);
    const minP = Math.min(...closes);
    const maxP = Math.max(...closes);
    const span = Math.max(maxP - minP, 1);
    const w = 900;
    const h = 230;
    const padY = 18;

    const pts = sampled.map((b, i) => {
      const x = (i / (sampled.length - 1)) * w;
      const y = h - padY - ((b.close - minP) / span) * (h - padY * 2);
      return { x, y, date: b.date, close: b.close };
    });

    const linePath = pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');
    const areaPath = `${linePath} L${w},${h} L0,${h} Z`;

    const avgP = v(res.averagePrice);
    const avgY =
      avgP >= minP && avgP <= maxP
        ? h - padY - ((avgP - minP) / span) * (h - padY * 2)
        : null;

    const firstClose = sampled[0].close;
    const lastClose = sampled[sampled.length - 1].close;
    const periodReturn = firstClose > 0 ? (lastClose - firstClose) / firstClose : 0;

    return {
      w,
      h,
      minP,
      maxP,
      linePath,
      areaPath,
      avgY,
      startDate: sampled[0].date,
      endDate: sampled[sampled.length - 1].date,
      periodReturn,
    };
  }, [chartBars, res.averagePrice]);

  // 52-week range position
  const low52 = v(state.low52);
  const high52 = v(state.high52);
  const curP = v(state.currentPrice);
  const pos52Pct =
    high52 > low52
      ? Math.min(100, Math.max(0, ((curP - low52) / (high52 - low52)) * 100))
      : 50;

  const filteredBars = filter.trim()
    ? state.priceHistory.filter((b) => b.date.includes(filter.trim()))
    : state.priceHistory;
  const totalPages = Math.max(1, Math.ceil(filteredBars.length / pageSize));
  const pageBars = filteredBars.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="space-y-5">
      {/* Executive Header Card */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/25 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-base shadow-lg">
              {state.symbol || 'SYK'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <YellowTextInput
                  value={state.companyName}
                  onChange={(companyName) => onChange({ ...state, companyName })}
                  className="w-56 text-sm"
                />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-stone-800 text-stone-300 border border-stone-700">
                  {res.fullSymbol}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                <span className="flex items-center gap-1.5">
                  Тикър (B5):
                  <YellowTextInput
                    value={state.symbol}
                    onChange={(symbol) => onChange({ ...state, symbol })}
                    className="w-20"
                  />
                </span>
                <span className="flex items-center gap-1.5">
                  Борса (B6):
                  <YellowTextInput
                    value={state.exchange}
                    onChange={(exchange) => onChange({ ...state, exchange })}
                    placeholder="NYSE / NASDAQ"
                    className="w-28"
                  />
                </span>
                <span className="flex items-center gap-1.5">
                  Дата:
                  <YellowTextInput
                    value={state.dataDate}
                    onChange={(dataDate) => onChange({ ...state, dataDate })}
                    className="w-28"
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Right Live Price & 52W Bar */}
          <div className="flex flex-wrap items-center gap-5">
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-stone-400 font-bold">
                Текуща Пазарна Цена
              </div>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-3xl font-black text-white">
                  ${fmtNum(state.currentPrice, 2)}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                    v(state.change) >= 0
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {v(state.change) >= 0 ? '+' : ''}
                  {fmtNum(state.change, 2)} ({fmtPct(state.changePct, 2)})
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onReset}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-bold text-stone-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Нулирай (SYK)</span>
            </button>
          </div>
        </div>

        {/* Fundamental KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 text-xs">
          <div className="bg-stone-950/80 border border-stone-800/90 rounded-xl p-3">
            <span className="text-stone-400 font-semibold block mb-1">
              Current Price ($)
            </span>
            <YellowNumberInput
              value={state.currentPrice}
              onChange={(currentPrice) => onChange({ ...state, currentPrice })}
              prefix="$"
              className="w-full"
            />
          </div>
          <div className="bg-stone-950/80 border border-stone-800/90 rounded-xl p-3">
            <span className="text-stone-400 font-semibold block mb-1">
              Market Cap (в хил. K)
            </span>
            <YellowNumberInput
              value={state.marketCap}
              onChange={(marketCap) => onChange({ ...state, marketCap })}
              className="w-full"
            />
          </div>
          <div className="bg-stone-950/80 border border-stone-800/90 rounded-xl p-3">
            <span className="text-stone-400 font-semibold block mb-1">
              Shares (в хил. K)
            </span>
            <YellowNumberInput
              value={state.shares}
              onChange={(shares) => onChange({ ...state, shares })}
              className="w-full"
            />
          </div>
          <div className="bg-stone-950/80 border border-stone-800/90 rounded-xl p-3">
            <span className="text-stone-400 font-semibold block mb-1">
              P/E Ratio
            </span>
            <YellowNumberInput
              value={state.peRatio}
              onChange={(peRatio) => onChange({ ...state, peRatio })}
              suffix="x"
              className="w-full"
            />
          </div>
          <div className="bg-stone-950/80 border border-stone-800/90 rounded-xl p-3">
            <span className="text-stone-400 font-semibold block mb-1">
              EPS (Печалба/акция)
            </span>
            <YellowNumberInput
              value={state.eps}
              onChange={(eps) => onChange({ ...state, eps })}
              prefix="$"
              className="w-full"
            />
          </div>
          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3">
            <span className="text-emerald-300 font-bold block mb-1">
              10Y Average Price
            </span>
            <div className="text-lg font-black text-emerald-400 text-right">
              ${fmtNum(res.averagePrice, 2)}
            </div>
          </div>
        </div>

        {/* Second Row: 52W Low/High Range Bar + Beta, Div Yield, 3Y/5Y/10Y Returns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3 pt-3 border-t border-stone-800/70 items-center text-xs">
          <div className="lg:col-span-5 bg-stone-950/70 border border-stone-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-stone-400 font-semibold">
                52-Седмичен Диапазон (Low / High)
              </span>
              <span className="text-stone-300 font-bold">
                ${fmtNum(state.low52, 2)} — ${fmtNum(state.high52, 2)}
              </span>
            </div>
            <div className="relative h-2.5 bg-stone-800 rounded-full overflow-hidden mb-2">
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                style={{ width: `${pos52Pct}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] text-stone-400">52W Low:</span>
                <YellowNumberInput
                  value={state.low52}
                  onChange={(low52) => onChange({ ...state, low52 })}
                  className="w-24"
                />
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] text-stone-400">52W High:</span>
                <YellowNumberInput
                  value={state.high52}
                  onChange={(high52) => onChange({ ...state, high52 })}
                  className="w-24"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-2.5">
              <span className="text-[11px] text-stone-400 block mb-1">Beta</span>
              <YellowNumberInput
                value={state.beta}
                onChange={(beta) => onChange({ ...state, beta })}
                className="w-full"
              />
            </div>
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-2.5">
              <span className="text-[11px] text-stone-400 block mb-1">Div Yield</span>
              <YellowTextInput
                value={state.dividendYield}
                onChange={(dividendYield) => onChange({ ...state, dividendYield })}
                align="right"
                className="w-full"
              />
            </div>
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-2.5">
              <span className="text-[11px] text-stone-400 block mb-1">3Y Return</span>
              <YellowPercentInput
                value={state.return3Y}
                onChange={(return3Y) => onChange({ ...state, return3Y })}
                className="w-full"
              />
            </div>
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-2.5">
              <span className="text-[11px] text-stone-400 block mb-1">5Y Return</span>
              <YellowPercentInput
                value={state.return5Y}
                onChange={(return5Y) => onChange({ ...state, return5Y })}
                className="w-full"
              />
            </div>
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-2.5">
              <span className="text-[11px] text-stone-400 block mb-1">10Y Return</span>
              <YellowPercentInput
                value={state.return10Y}
                onChange={(return10Y) => onChange({ ...state, return10Y })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 10Y Price Chart + ROI Calculators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: 10-Year Interactive Area Chart */}
        <div className="lg:col-span-8 bg-stone-900/95 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Историческо Движение на Цената ({state.symbol})
                </h3>
                <p className="text-[11px] text-stone-400">
                  {chartBars.length.toLocaleString('en-US')} борсови сесии • Средна цена за 10 г.:{' '}
                  <strong className="text-emerald-400">${fmtNum(res.averagePrice, 2)}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-800 rounded-xl p-1">
              {(['1Y', '3Y', '5Y', '10Y'] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    timeframe === tf
                      ? 'bg-emerald-600 text-white'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {svgChart && (
            <div className="my-4">
              <div className="flex items-center justify-between text-xs text-stone-400 mb-2 px-1">
                <span>
                  Период: <strong className="text-stone-200">{svgChart.startDate}</strong> →{' '}
                  <strong className="text-stone-200">{svgChart.endDate}</strong>
                </span>
                <div className="flex items-center gap-4">
                  <span>
                    Min: <strong className="text-rose-400">${svgChart.minP.toFixed(2)}</strong>
                  </span>
                  <span>
                    Max: <strong className="text-emerald-400">${svgChart.maxP.toFixed(2)}</strong>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      svgChart.periodReturn >= 0
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    Доходност за периода: {fmtPct(svgChart.periodReturn, 2)}
                  </span>
                </div>
              </div>

              <div className="bg-stone-950/90 border border-stone-800/80 rounded-xl p-3">
                <svg
                  viewBox={`0 0 ${svgChart.w} ${svgChart.h}`}
                  className="w-full h-56 overflow-visible"
                >
                  <defs>
                    <linearGradient id="overviewPriceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {svgChart.avgY !== null && (
                    <g>
                      <line
                        x1={0}
                        y1={svgChart.avgY}
                        x2={svgChart.w}
                        y2={svgChart.avgY}
                        stroke="#f59e0b"
                        strokeDasharray="6 4"
                        strokeWidth="1.5"
                      />
                      <text
                        x={12}
                        y={svgChart.avgY - 6}
                        fill="#fbbf24"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        10Y Средна цена: ${fmtNum(res.averagePrice, 2)}
                      </text>
                    </g>
                  )}
                  <path d={svgChart.areaPath} fill="url(#overviewPriceGrad)" />
                  <path
                    d={svgChart.linePath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.2"
                  />
                </svg>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-xs">
            <span className="text-stone-400">
              Общо {state.priceHistory.length.toLocaleString('en-US')} дневни OHLCV записа в модела
            </span>
            <button
              type="button"
              onClick={() => setShowOhlcvTable((p) => !p)}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold cursor-pointer"
            >
              {showOhlcvTable ? 'Скрий дневната таблица' : 'Покажи дневните цени (OHLCV)'}
            </button>
          </div>
        </div>

        {/* Right 4 Cols: 2 ROI Calculators */}
        <div className="lg:col-span-4 space-y-4">
          <RoiCalculatorCard
            title="ROI Калкулатор #1 (10Y Return)"
            input={state.roi1}
            result={res.roi1}
            onChange={(roi1) => onChange({ ...state, roi1 })}
          />
          <RoiCalculatorCard
            title="ROI Калкулатор #2 (Сравнителен)"
            input={state.roi2}
            result={res.roi2}
            onChange={(roi2) => onChange({ ...state, roi2 })}
          />
        </div>
      </div>

      {/* Optional Expandable Daily OHLCV Table */}
      {showOhlcvTable && (
        <div className="bg-stone-900/95 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-stone-950 px-4 py-3 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-extrabold text-white">
              Дневна История на Цените ({filteredBars.length.toLocaleString('en-US')} дни)
            </span>
            <div className="flex items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Филтър по дата (напр. 2024)..."
                  className="bg-stone-900 border border-stone-700 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-2.5 py-1 rounded bg-stone-800 disabled:opacity-40 text-stone-200 cursor-pointer"
              >
                Предишна
              </button>
              <span className="text-stone-400">
                Стр. {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-2.5 py-1 rounded bg-stone-800 disabled:opacity-40 text-stone-200 cursor-pointer"
              >
                Следваща
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-stone-950/90 text-stone-400 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-right">Open</th>
                  <th className="px-3 py-2 text-right">High</th>
                  <th className="px-3 py-2 text-right">Low</th>
                  <th className="px-3 py-2 text-right">Close</th>
                  <th className="px-3 py-2 text-right">Volume</th>
                </tr>
              </thead>
              <tbody>
                {pageBars.map((b, i) => (
                  <tr key={i} className="border-b border-stone-800/60 hover:bg-stone-800/40">
                    <td className="px-3 py-1.5 font-mono text-stone-300">{b.date}</td>
                    <td className="px-3 py-1.5 text-right text-stone-300">{fmtNum(b.open, 2)}</td>
                    <td className="px-3 py-1.5 text-right text-emerald-400">{fmtNum(b.high, 2)}</td>
                    <td className="px-3 py-1.5 text-right text-rose-400">{fmtNum(b.low, 2)}</td>
                    <td className="px-3 py-1.5 text-right font-bold text-white">{fmtNum(b.close, 2)}</td>
                    <td className="px-3 py-1.5 text-right text-stone-400">{fmtNum(b.volume, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. DCF 10 YEARS VIEW
// ============================================================================
export const Dcf10View: React.FC<{
  state: Dcf10State;
  onChange: (next: Dcf10State) => void;
  onReset: () => void;
}> = ({ state, onChange, onReset }) => {
  const res = computeDcf10(state);
  const comments = SHEET_COMMENTS.dcf10 ?? {};

  const applyBaseMetricToAll = (val: number) => {
    const rounded = Math.round(val);
    onChange({
      ...state,
      scenarios: {
        optimistic: { ...state.scenarios.optimistic, baseMetric: rounded },
        average: { ...state.scenarios.average, baseMetric: rounded },
        worst: { ...state.scenarios.worst, baseMetric: rounded },
      },
    });
  };

  const applyCagrToScenarios = (cagr: number) => {
    const baseG = Number(cagr.toFixed(4));
    onChange({
      ...state,
      scenarios: {
        optimistic: {
          ...state.scenarios.optimistic,
          growth1to5: baseG,
          growth5to10: Number((baseG * 0.85).toFixed(4)),
        },
        average: {
          ...state.scenarios.average,
          growth1to5: Number((baseG * 0.7).toFixed(4)),
          growth5to10: Number((baseG * 0.6).toFixed(4)),
        },
        worst: {
          ...state.scenarios.worst,
          growth1to5: Number((baseG * 0.4).toFixed(4)),
          growth5to10: Number((baseG * 0.35).toFixed(4)),
        },
      },
    });
  };

  return (
    <div className="space-y-5">
      <SheetTopBanner
        modelTitle="DCF 10 Years — Дисконтирани Свободни Парични Потоци"
        modelSubtitle="3-сценариен 10-годишен DCF модел с терминален растеж завинаги (Perpetual Growth) + оценка по Market Cap"
        companyValue={state.company}
        onCompanyChange={(company) => onChange({ ...state, company })}
        priceLabel="Текуща пазарна цена (E1)"
        priceValue={state.marketPrice}
        onPriceChange={(marketPrice) => onChange({ ...state, marketPrice })}
        extraLeftLabel="Брой акции в обръщение (B2, в хил.)"
        extraLeftValue={state.sharesOutstanding}
        onExtraLeftChange={(sharesOutstanding) =>
          onChange({ ...state, sharesOutstanding })
        }
        dataDate={state.dataDate}
        onDateChange={(dataDate) => onChange({ ...state, dataDate })}
        onResetSheet={onReset}
      />

      {/* Primary Hero Valuation Card (Per-Share Fair Value) */}
      <HeroValuationCard
        title="Справедлива Цена на Акция (DCF 10Y Fair Value)"
        subtitle="Претеглена стойност от 3-те сценария"
        table={res.perShareTable}
        marketBenchmark={state.marketPrice}
        marketBenchmarkLabel="Пазарна цена"
        onWeightChange={(key, w) =>
          onChange({ ...state, weights: { ...state.weights, [key]: w } })
        }
        isCurrency={true}
        decimals={2}
      />

      {/* 3 Interactive Scenario Cards + 10Y Projection Chart & Table */}
      <ScenarioBlocks
        sheetId="dcf10"
        mode="cashflow"
        terminalLabel="Perpetual Growth (Вечен ръст)"
        terminalIsPercent={true}
        editableBasePerScenario={true}
        baseMetricLabel="Базов Free Cash Flow (2026)"
        scenariosInput={state.scenarios}
        scenariosResult={res.scenarios}
        onChangeScenario={(key, next) =>
          onChange({
            ...state,
            scenarios: { ...state.scenarios, [key]: next },
          })
        }
        decimals={2}
        isCurrency={true}
      />

      {/* Secondary Market Cap DCF Valuation + Unit Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8">
          <WeightedSummaryTable
            title="Market Cap DCF — Оценка на Пазарната Капитализация (в хил.)"
            table={res.marketCapTable}
            onWeightChange={(key, w) =>
              onChange({
                ...state,
                mcWeights: { ...state.mcWeights, [key]: w },
              })
            }
            decimals={2}
            extraHeader={
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-400 flex items-center">
                  Market Cap DCF (E34):
                  <InfoBadge
                    title="Market Cap DCF"
                    textBg={comments.D33}
                    align="right"
                  />
                </span>
                <YellowNumberInput
                  value={state.marketCapDcf}
                  onChange={(marketCapDcf) =>
                    onChange({ ...state, marketCapDcf })
                  }
                  className="w-40"
                />
              </div>
            }
          />
        </div>
        <div className="lg:col-span-4">
          <UnitConverterCard
            billions={state.billionsInput}
            onBillionsChange={(billionsInput) =>
              onChange({ ...state, billionsInput })
            }
            billionsOut={res.billionsToThousands}
            trillions={state.trillionsInput}
            onTrillionsChange={(trillionsInput) =>
              onChange({ ...state, trillionsInput })
            }
            trillionsOut={res.trillionsToThousands}
          />
        </div>
      </div>

      {/* 10-Year Historical FCF & Revenue Analyzers with Bar Charts */}
      <History10YTable
        title="10 Years Free Cash Flow (FCF) — Исторически Анализатор"
        input={state.fcfHistory}
        result={res.fcfHistory}
        onChange={(fcfHistory) => onChange({ ...state, fcfHistory })}
        decimals={0}
        onApplyAverage={applyBaseMetricToAll}
        onApplyCagr={applyCagrToScenarios}
      />

      <History10YTable
        title="10 Years REVENUE — Исторически Ръст на Приходите"
        input={state.revenueHistory}
        result={res.revenueHistory}
        onChange={(revenueHistory) => onChange({ ...state, revenueHistory })}
        decimals={0}
        onApplyCagr={applyCagrToScenarios}
      />
    </div>
  );
};

// ============================================================================
// 3. FCF MULTIPLE VIEW
// ============================================================================
export const FcfMultipleView: React.FC<{
  state: FcfMultipleState;
  onChange: (next: FcfMultipleState) => void;
  onReset: () => void;
}> = ({ state, onChange, onReset }) => {
  const res = computeFcfMultiple(state);
  const comments = SHEET_COMMENTS.fcfMultiple ?? {};

  return (
    <div className="space-y-5">
      <SheetTopBanner
        modelTitle="FCF Multiple — Оценка чрез Множител на Свободния Паричен Поток"
        modelSubtitle="10-годишен DCF модел с изходен FCF Multiple (Price / FCF) на 10-тата година"
        companyValue={state.company}
        onCompanyChange={(company) => onChange({ ...state, company })}
        priceLabel="Текущ Market Cap (E1, в хил.)"
        priceValue={state.marketCap}
        onPriceChange={(marketCap) => onChange({ ...state, marketCap })}
        extraLeftLabel="Free Cash Flow (B2, в хил.)"
        extraLeftValue={state.baseValue}
        onExtraLeftChange={(baseValue) => onChange({ ...state, baseValue })}
        extraLeftComment={comments.B2}
        dataDate={state.dataDate}
        onDateChange={(dataDate) => onChange({ ...state, dataDate })}
        onResetSheet={onReset}
      />

      {/* Per-Share Hero Valuation Card */}
      <HeroValuationCard
        title="Справедлива Цена на Акция (FCF Multiple Per-Share)"
        subtitle="Изчислена спрямо броя акции и пазарната цена"
        table={res.perShareTable}
        marketBenchmark={state.marketPrice}
        marketBenchmarkLabel="Пазарна цена (E42)"
        onWeightChange={(key, w) =>
          onChange({
            ...state,
            perShareWeights: { ...state.perShareWeights, [key]: w },
          })
        }
        isCurrency={true}
        decimals={2}
      />

      {/* Per-share inputs bar */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-semibold">
              Брой акции в обръщение (E41, в хил.):
            </span>
            <YellowNumberInput
              value={state.sharesOutstanding}
              onChange={(sharesOutstanding) =>
                onChange({ ...state, sharesOutstanding })
              }
              className="w-36"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-semibold">
              Пазарна цена на акция (E42):
            </span>
            <YellowNumberInput
              value={state.marketPrice}
              onChange={(marketPrice) => onChange({ ...state, marketPrice })}
              prefix="$"
              className="w-32"
            />
          </div>
        </div>
        <span className="text-[11px] text-stone-400">
          Справедлива пазарна капитализация (Market Cap IV):{' '}
          <strong className="text-emerald-400">
            {fmtNum(res.primaryTable.averageIntrinsicValue, 0)} K
          </strong>
        </span>
      </div>

      {/* 3 Scenario Cards + 10Y Projection Chart & Table */}
      <ScenarioBlocks
        sheetId="fcfMultiple"
        mode="cashflow"
        terminalLabel="FCF Multiple (Множител P/FCF)"
        terminalIsPercent={false}
        editableBasePerScenario={false}
        scenariosInput={state.scenarios}
        scenariosResult={res.scenarios}
        onChangeScenario={(key, next) =>
          onChange({
            ...state,
            scenarios: { ...state.scenarios, [key]: next },
          })
        }
        decimals={2}
        isCurrency={false}
      />

      {/* Market Cap Table + Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8">
          <WeightedSummaryTable
            title="Оценка на цялата компания (Market Cap Intrinsic Value vs Текущ Market Cap)"
            table={res.primaryTable}
            onWeightChange={(key, w) =>
              onChange({ ...state, weights: { ...state.weights, [key]: w } })
            }
            decimals={2}
          />
        </div>
        <div className="lg:col-span-4">
          <UnitConverterCard
            billions={state.billionsInput}
            onBillionsChange={(billionsInput) =>
              onChange({ ...state, billionsInput })
            }
            billionsOut={res.billionsToThousands}
            trillions={state.trillionsInput}
            onTrillionsChange={(trillionsInput) =>
              onChange({ ...state, trillionsInput })
            }
            trillionsOut={res.trillionsToThousands}
          />
        </div>
      </div>

      <History10YTable
        title="10 Years Free Cash Flow (FCF) — Исторически Анализатор"
        input={state.fcfHistory}
        result={res.fcfHistory}
        onChange={(fcfHistory) => onChange({ ...state, fcfHistory })}
        decimals={0}
        onApplyAverage={(avg) =>
          onChange({ ...state, baseValue: Math.round(avg) })
        }
      />
    </div>
  );
};

// ============================================================================
// 4. EV/EBITDA VIEW
// ============================================================================
export const EvEbitdaView: React.FC<{
  state: EvEbitdaState;
  onChange: (next: EvEbitdaState) => void;
  onReset: () => void;
}> = ({ state, onChange, onReset }) => {
  const res = computeEvEbitda(state);

  const applyBaseEbitda = (val: number) => {
    const rounded = Math.round(val);
    onChange({
      ...state,
      scenarios: {
        optimistic: { ...state.scenarios.optimistic, baseMetric: rounded },
        average: { ...state.scenarios.average, baseMetric: rounded },
        worst: { ...state.scenarios.worst, baseMetric: rounded },
      },
    });
  };

  return (
    <div className="space-y-5">
      <SheetTopBanner
        modelTitle="EV / EBITDA Модел — Оценка чрез Предприятие към EBITDA"
        modelSubtitle="10-годишна проекция на EBITDA и оценка чрез изходен EV/EBITDA мултипъл"
        companyValue={state.company}
        onCompanyChange={(company) => onChange({ ...state, company })}
        priceLabel="Текуща пазарна цена (E1)"
        priceValue={state.marketPrice}
        onPriceChange={(marketPrice) => onChange({ ...state, marketPrice })}
        extraLeftLabel="Брой акции в обръщение (B2, в хил.)"
        extraLeftValue={state.sharesOutstanding}
        onExtraLeftChange={(sharesOutstanding) =>
          onChange({ ...state, sharesOutstanding })
        }
        dataDate={state.dataDate}
        onDateChange={(dataDate) => onChange({ ...state, dataDate })}
        onResetSheet={onReset}
      />

      <HeroValuationCard
        title="Справедлива Цена на Акция (EV/EBITDA Fair Value)"
        subtitle="Претеглена стойност от 3-те сценария"
        table={res.perShareTable}
        marketBenchmark={state.marketPrice}
        marketBenchmarkLabel="Пазарна цена"
        onWeightChange={(key, w) =>
          onChange({ ...state, weights: { ...state.weights, [key]: w } })
        }
        isCurrency={true}
        decimals={2}
      />

      <ScenarioBlocks
        sheetId="evEbitda"
        mode="cashflow"
        terminalLabel="EBITDA Multiple (EV/EBITDA)"
        terminalIsPercent={false}
        editableBasePerScenario={true}
        baseMetricLabel="Базова EBITDA (2026)"
        scenariosInput={state.scenarios}
        scenariosResult={res.scenarios}
        onChangeScenario={(key, next) =>
          onChange({
            ...state,
            scenarios: { ...state.scenarios, [key]: next },
          })
        }
        decimals={2}
        isCurrency={true}
      />

      <WeightedSummaryTable
        title="Market Cap EV/EBITDA Оценка (в хил.)"
        table={res.marketCapTable}
        decimals={2}
        extraHeader={
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-400">Market Cap DCF (E34):</span>
            <YellowNumberInput
              value={state.marketCapDcf}
              onChange={(marketCapDcf) =>
                onChange({ ...state, marketCapDcf })
              }
              className="w-40"
            />
          </div>
        }
      />

      <History10YTable
        title="10 Years EBITDA — Исторически Анализатор"
        input={state.ebitdaHistory}
        result={res.ebitdaHistory}
        onChange={(ebitdaHistory) => onChange({ ...state, ebitdaHistory })}
        decimals={0}
        onApplyAverage={applyBaseEbitda}
      />
    </div>
  );
};

// ============================================================================
// 5. P/E MODEL VIEW
// ============================================================================
export const PeView: React.FC<{
  state: PeSheetState;
  onChange: (next: PeSheetState) => void;
  onReset: () => void;
}> = ({ state, onChange, onReset }) => {
  const res = computePeSheet(state, false);
  const comments = SHEET_COMMENTS.pe ?? {};

  return (
    <div className="space-y-5">
      <SheetTopBanner
        modelTitle="P/E Multiple Модел — Оценка чрез Печалба на Акция (EPS) и P/E Множител"
        modelSubtitle="10-годишна проекция на EPS и обратно дисконтиране от терминалния P/E Multiple"
        companyValue={state.company}
        onCompanyChange={(company) => onChange({ ...state, company })}
        priceLabel="Текуща пазарна цена (E1)"
        priceValue={state.marketPrice}
        onPriceChange={(marketPrice) => onChange({ ...state, marketPrice })}
        extraLeftLabel="EPS TTM (Печалба на акция B2)"
        extraLeftValue={state.baseValue}
        onExtraLeftChange={(baseValue) => onChange({ ...state, baseValue })}
        extraLeftComment={comments.D5}
        dataDate={state.dataDate}
        onDateChange={(dataDate) => onChange({ ...state, dataDate })}
        onResetSheet={onReset}
      />

      <HeroValuationCard
        title="Справедлива Цена на Акция (P/E Multiple Fair Value)"
        subtitle="Обратно дисконтирана от 10-тата година"
        table={res.summaryTable}
        marketBenchmark={state.marketPrice}
        marketBenchmarkLabel="Пазарна цена (E1)"
        onWeightChange={(key, w) =>
          onChange({ ...state, weights: { ...state.weights, [key]: w } })
        }
        isCurrency={true}
        decimals={2}
      />

      <ScenarioBlocks
        sheetId="pe"
        mode="backwardsMultiple"
        terminalLabel="P/E Multiple (Година 10)"
        terminalIsPercent={false}
        editableBasePerScenario={false}
        scenariosInput={state.scenarios}
        scenariosResult={res.scenarios}
        onChangeScenario={(key, next) =>
          onChange({
            ...state,
            scenarios: { ...state.scenarios, [key]: next },
          })
        }
        decimals={2}
        isCurrency={true}
      />

      <History10YTable
        title="10 Years P/E Ratio / EPS — Исторически Анализатор"
        input={state.peHistory}
        result={res.peHistory}
        onChange={(peHistory) => onChange({ ...state, peHistory })}
        decimals={2}
        onApplyAverage={(avg) =>
          onChange({ ...state, baseValue: Number(avg.toFixed(2)) })
        }
      />
    </div>
  );
};

// ============================================================================
// 6. DIVIDENDS VIEW
// ============================================================================
export const DividendsView: React.FC<{
  state: FcfMultipleState;
  onChange: (next: FcfMultipleState) => void;
  onReset: () => void;
}> = ({ state, onChange, onReset }) => {
  const res = computeFcfMultiple(state);

  return (
    <div className="space-y-5">
      <SheetTopBanner
        modelTitle="Dividend Discount & Multiple Модел — Оценка на Дивидентни Акции"
        modelSubtitle="10-годишна проекция на дивидента за 1 дял + терминален Dividend Multiple"
        companyValue={state.company}
        onCompanyChange={(company) => onChange({ ...state, company })}
        priceLabel="Текуща пазарна цена (E1)"
        priceValue={state.marketCap}
        onPriceChange={(marketCap) => onChange({ ...state, marketCap })}
        extraLeftLabel="Дивидент за 1 акция (B2)"
        extraLeftValue={state.baseValue}
        onExtraLeftChange={(baseValue) => onChange({ ...state, baseValue })}
        dataDate={state.dataDate}
        onDateChange={(dataDate) => onChange({ ...state, dataDate })}
        onResetSheet={onReset}
      />

      <HeroValuationCard
        title="Справедлива Цена по Дивидентен Модел"
        subtitle="Дисконтирани бъдещи дивиденти + терминален дивидент мултипъл"
        table={res.primaryTable}
        marketBenchmark={state.marketCap}
        marketBenchmarkLabel="Пазарна цена (E1)"
        onWeightChange={(key, w) =>
          onChange({ ...state, weights: { ...state.weights, [key]: w } })
        }
        isCurrency={true}
        decimals={2}
      />

      <ScenarioBlocks
        sheetId="dividends"
        mode="cashflow"
        terminalLabel="Dividend Multiple (Цена / Дивидент)"
        terminalIsPercent={false}
        editableBasePerScenario={false}
        scenariosInput={state.scenarios}
        scenariosResult={res.scenarios}
        onChangeScenario={(key, next) =>
          onChange({
            ...state,
            scenarios: { ...state.scenarios, [key]: next },
          })
        }
        decimals={2}
        isCurrency={true}
      />

      <History10YTable
        title="10-Годишна История на Дивиденти / FCF"
        input={state.fcfHistory}
        result={res.fcfHistory}
        onChange={(fcfHistory) => onChange({ ...state, fcfHistory })}
        decimals={2}
      />
    </div>
  );
};

// ============================================================================
// 7. PETER LYNCH FAIR VALUE VIEW
// ============================================================================
export const PeterLynchView: React.FC<{
  state: PeterLynchState;
  onChange: (next: PeterLynchState) => void;
  onReset: () => void;
}> = ({ state, onChange, onReset }) => {
  const res = computePeterLynch(state);
  const isBuy = res.buySell === 'BUY';
  const diffPct = (res.difference ?? 0) * 100;

  const updateYear5 = (idx: number, yr: Num) => {
    const next = [...state.years5];
    next[idx] = yr ?? 2020 + idx;
    onChange({ ...state, years5: next });
  };

  const updateNetIncome5 = (idx: number, val: Num) => {
    const next = [...state.netIncome5];
    next[idx] = val;
    onChange({ ...state, netIncome5: next });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              Peter Lynch Fair Value — Оценка по Формулата на Питър Линч
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PEG × Growth × EPS
              </span>
            </h2>
            <p className="text-xs text-stone-400">
              Справедлива цена = Среден годишен ръст на нетната печалба (%) × EPS (TTM) × PEG Ratio
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-semibold">Тикър:</span>
            <YellowTextInput
              value={state.ticker}
              onChange={(ticker) => onChange({ ...state, ticker })}
              className="w-24"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-semibold">Дата:</span>
            <YellowTextInput
              value={state.dataDate}
              onChange={(dataDate) => onChange({ ...state, dataDate })}
              className="w-28"
            />
          </div>
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Нулирай (SYK)</span>
          </button>
        </div>
      </div>

      {/* Hero Peter Lynch Valuation Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 5 Cols: Interactive Formula Inputs */}
        <div className="lg:col-span-5 bg-stone-900/95 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Параметри на Питър Линч
            </h3>
            {isNum(res.avg5YGrowth) && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...state,
                    growthRateInput: Number((res.avg5YGrowth! * 100).toFixed(2)),
                  })
                }
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Ползвай 5Y ръст ({fmtPct(res.avg5YGrowth, 2)})</span>
              </button>
            )}
          </div>

          {/* Growth Rate Input */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-stone-300">
                1. Очакван Ръст (Growth Rate C14, като число за %)
              </span>
              <YellowNumberInput
                value={state.growthRateInput}
                onChange={(growthRateInput) =>
                  onChange({ ...state, growthRateInput })
                }
                suffix="%"
                className="w-28"
              />
            </div>
            <input
              type="range"
              min={1}
              max={45}
              step={0.25}
              value={v(state.growthRateInput)}
              onChange={(e) =>
                onChange({
                  ...state,
                  growthRateInput: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-stone-800 rounded-lg accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* EPS TTM */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-stone-300">
                2. Печалба на Акция — EPS (TTM) (D14)
              </span>
              <YellowNumberInput
                value={state.epsTtm}
                onChange={(epsTtm) => onChange({ ...state, epsTtm })}
                prefix="$"
                className="w-28"
              />
            </div>
          </div>

          {/* PEG Ratio */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-stone-300">
                3. Целеви PEG Коефициент (E14, еталон = 1.0)
              </span>
              <YellowNumberInput
                value={state.peg}
                onChange={(peg) => onChange({ ...state, peg })}
                suffix="x"
                className="w-28"
              />
            </div>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.05}
              value={v(state.peg)}
              onChange={(e) =>
                onChange({ ...state, peg: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-stone-800 rounded-lg accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Current Stock Price */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-stone-300">
                4. Текуща Пазарна Цена (Stock Price G14)
              </span>
              <YellowNumberInput
                value={state.stockPrice}
                onChange={(stockPrice) => onChange({ ...state, stockPrice })}
                prefix="$"
                className="w-28"
              />
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Peter Lynch Result Hero + 5Y Net Income Table */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-stone-900/95 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Peter Lynch Fair Price (F14 = Growth × EPS × PEG)
              </span>
              <div className="mt-1.5 flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl font-black text-white">
                  ${fmtNum(res.fairPrice, 2)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                    isBuy
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {isBuy ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {diffPct >= 0 ? `+${diffPct.toFixed(2)}%` : `${diffPct.toFixed(2)}%`}
                </span>
              </div>
              <div className="text-xs text-stone-400 mt-2 font-mono">
                {fmtNum(state.growthRateInput, 2)} × ${fmtNum(state.epsTtm, 2)} ×{' '}
                {fmtNum(state.peg, 2)} ={' '}
                <strong className="text-indigo-300">
                  ${fmtNum(res.fairPrice, 3)}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[11px] uppercase text-stone-400 font-semibold">
                  Текуща цена
                </div>
                <div className="text-xl font-extrabold text-stone-200">
                  ${fmtNum(state.stockPrice, 2)}
                </div>
              </div>
              <div
                className={`px-5 py-2.5 rounded-xl font-black text-base tracking-widest border ${
                  isBuy
                    ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300'
                    : 'bg-rose-600/25 border-rose-500 text-rose-300'
                }`}
              >
                {res.buySell}
              </div>
            </div>
          </div>

          {/* 5-Year Historical Net Income Analyzer (2020 - 2025) */}
          <div className="bg-stone-900/95 border border-stone-800 rounded-2xl overflow-hidden shadow-xl flex-1">
            <div className="bg-stone-950 px-4 py-2.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-extrabold text-white">
                5-Годишен Ръст на Нетната Печалба (Net Income 2020–2025)
              </span>
              <div className="flex items-center gap-3">
                <span className="text-stone-400">
                  5Y Средна печалба:{' '}
                  <strong className="text-white">
                    {fmtNum(res.avg5YNetIncome, 0)}
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                  5Y Среден ръст: {fmtPct(res.avg5YGrowth, 2)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto p-3">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-950/70 text-stone-400 border-b border-stone-800">
                    <th className="p-2 text-left">Показател</th>
                    {state.years5.map((yr, i) => (
                      <th key={i} className="p-1.5 text-center min-w-[96px]">
                        <YellowNumberInput
                          value={yr}
                          onChange={(v) => updateYear5(i, v)}
                          align="center"
                          className="w-full"
                        />
                      </th>
                    ))}
                    <th className="p-2 text-right text-amber-300">Average</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-stone-800/80">
                    <td className="p-2 font-bold text-stone-300">Net Income</td>
                    {state.netIncome5.map((val, i) => (
                      <td key={i} className="p-1.5">
                        <YellowNumberInput
                          value={val}
                          onChange={(v) => updateNetIncome5(i, v)}
                          className="w-full"
                        />
                      </td>
                    ))}
                    <td className="p-2 text-right font-black text-white">
                      {fmtNum(res.avg5YNetIncome, 0)}
                    </td>
                  </tr>
                  <tr className="bg-stone-950/40">
                    <td className="p-2 font-semibold text-stone-400">YoY Growth %</td>
                    <td className="p-2 text-center text-stone-600">—</td>
                    {res.yoy5.map((g, i) => (
                      <td
                        key={i}
                        className={`p-2 text-right font-bold ${
                          (g ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {fmtPct(g, 2)}
                      </td>
                    ))}
                    <td className="p-2 text-right font-black text-emerald-400">
                      {fmtPct(res.avg5YGrowth, 2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 10 Years Net Income History */}
      <History10YTable
        title="10 Years Net Income — Десетилетна История на Нетната Печалба"
        input={state.netIncome10}
        result={res.netIncome10}
        onChange={(netIncome10) => onChange({ ...state, netIncome10 })}
        decimals={0}
      />
    </div>
  );
};

// ============================================================================
// 8. MULTIPLE MODELS (PEER COMPARISON) VIEW
// ============================================================================
export const MultipleModelsView: React.FC<{
  state: MultipleModelsState;
  onChange: (next: MultipleModelsState) => void;
  onReset: () => void;
}> = ({ state, onChange, onReset }) => {
  const res = computeMultipleModels(state);
  const isBuy = res.buySell === 'BUY';
  const diffPct = (res.upsidePct ?? 0) * 100;

  const updatePeer = (
    idx: number,
    patch: Partial<MultipleModelsState['peers'][number]>
  ) => {
    const next = state.peers.map((p, i) => (i === idx ? { ...p, ...patch } : p));
    onChange({ ...state, peers: next });
  };

  const addPeer = () => {
    onChange({
      ...state,
      peers: [
        ...state.peers,
        { ticker: 'NEW', company: 'New Peer Corp', stockPrice: 100, eps: 4 },
      ],
    });
  };

  const removePeer = (idx: number) => {
    if (state.peers.length <= 1) return;
    onChange({
      ...state,
      peers: state.peers.filter((_, i) => i !== idx),
    });
  };

  const maxPe = Math.max(
    ...res.peerMultiples.map((x) => v(x)),
    v(res.averagePe),
    1
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              Multiple Models — Сравнителна Оценка спрямо Конкуренти (Peers P/E)
            </h2>
            <p className="text-xs text-stone-400">
              Изчислява справедливата цена на целевата компания чрез средния P/E мултипъл на конкурентите в сектора
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-bold text-stone-200 flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Нулирай (SYK & Peers)</span>
        </button>
      </div>

      {/* Hero Target Valuation Card */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-2xl p-5 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        <div className="lg:col-span-6 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Справедлива Цена спрямо Секторния P/E ({state.targetTicker})
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-black text-white">
              ${fmtNum(res.impliedStockPrice, 2)}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                isBuy
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-950 text-rose-300 border border-rose-500/40'
              }`}
            >
              {isBuy ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {diffPct >= 0 ? `+${diffPct.toFixed(2)}%` : `${diffPct.toFixed(2)}%`}
            </span>
            <span
              className={`px-3.5 py-1 rounded-xl text-xs font-black tracking-wider border ${
                isBuy
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500 text-rose-300'
              }`}
            >
              {res.buySell}
            </span>
          </div>
          <p className="text-xs text-stone-400 font-mono">
            Average Peers P/E ({fmtNum(res.averagePe, 2)}x) × Target EPS ($
            {fmtNum(state.targetEps, 2)}) ={' '}
            <strong className="text-emerald-400">
              ${fmtNum(res.impliedStockPrice, 2)}
            </strong>
          </p>
        </div>

        {/* Target Company Inputs */}
        <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-stone-950/80 border border-stone-800 rounded-xl p-3.5">
          <div>
            <span className="text-[11px] text-stone-400 block mb-1">Target Ticker</span>
            <YellowTextInput
              value={state.targetTicker}
              onChange={(targetTicker) => onChange({ ...state, targetTicker })}
              className="w-full"
            />
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block mb-1">Компания</span>
            <YellowTextInput
              value={state.targetCompany}
              onChange={(targetCompany) => onChange({ ...state, targetCompany })}
              className="w-full"
            />
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block mb-1">Текуща цена</span>
            <YellowNumberInput
              value={state.targetCurrentPrice}
              onChange={(targetCurrentPrice) =>
                onChange({ ...state, targetCurrentPrice })
              }
              prefix="$"
              className="w-full"
            />
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block mb-1">Target EPS</span>
            <YellowNumberInput
              value={state.targetEps}
              onChange={(targetEps) => onChange({ ...state, targetEps })}
              prefix="$"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Peers Table + Visual P/E Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-stone-900/95 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-stone-950 px-4 py-3 border-b border-stone-800 flex items-center justify-between">
            <span className="text-xs font-extrabold text-white">
              Конкурентни Компании в Сектора (Peer Group)
            </span>
            <button
              type="button"
              onClick={addPeer}
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добави конкурент</span>
            </button>
          </div>
          <div className="overflow-x-auto p-3">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-stone-950/70 text-stone-400 border-b border-stone-800">
                  <th className="p-2 text-left">Ticker</th>
                  <th className="p-2 text-left">Company</th>
                  <th className="p-2 text-right">Stock Price</th>
                  <th className="p-2 text-right">EPS</th>
                  <th className="p-2 text-right text-amber-300">P/E (Price/EPS)</th>
                  <th className="p-2 text-center w-10" />
                </tr>
              </thead>
              <tbody>
                {state.peers.map((p, idx) => (
                  <tr key={idx} className="border-b border-stone-800/70">
                    <td className="p-1.5 w-24">
                      <YellowTextInput
                        value={p.ticker}
                        onChange={(ticker) => updatePeer(idx, { ticker })}
                        className="w-full"
                      />
                    </td>
                    <td className="p-1.5">
                      <YellowTextInput
                        value={p.company}
                        onChange={(company) => updatePeer(idx, { company })}
                        className="w-full"
                      />
                    </td>
                    <td className="p-1.5 w-32">
                      <YellowNumberInput
                        value={p.stockPrice}
                        onChange={(stockPrice) => updatePeer(idx, { stockPrice })}
                        prefix="$"
                        className="w-full"
                      />
                    </td>
                    <td className="p-1.5 w-28">
                      <YellowNumberInput
                        value={p.eps}
                        onChange={(eps) => updatePeer(idx, { eps })}
                        prefix="$"
                        className="w-full"
                      />
                    </td>
                    <td className="p-2 text-right font-extrabold text-amber-300 text-sm">
                      {fmtNum(res.peerMultiples[idx], 2)}x
                    </td>
                    <td className="p-1.5 text-center">
                      {state.peers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePeer(idx)}
                          className="p-1 rounded hover:bg-rose-500/20 text-stone-500 hover:text-rose-400 cursor-pointer"
                          title="Премахни конкурент"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-stone-950/80 border-t border-stone-800 font-bold">
                  <td colSpan={4} className="p-2.5 text-right text-stone-300">
                    Среден P/E на конкурентите (Average P/E):
                  </td>
                  <td className="p-2.5 text-right text-emerald-400 text-sm font-black">
                    {fmtNum(res.averagePe, 2)}x
                  </td>
                  <td />
                </tr>
                <tr className="bg-stone-950/50 font-bold">
                  <td colSpan={4} className="p-2.5 text-right text-stone-400">
                    Медианен P/E на конкурентите (Median P/E):
                  </td>
                  <td className="p-2.5 text-right text-sky-400 text-sm font-black">
                    {fmtNum(res.medianPe, 2)}x
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Right 5 Cols: Visual Peer P/E Bar Comparison */}
        <div className="lg:col-span-5 bg-stone-900/95 border border-stone-800 rounded-2xl p-4 shadow-xl space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-300 border-b border-stone-800 pb-2">
            Визуално Сравнение на P/E Множителите
          </h3>
          <div className="space-y-3 pt-1">
            {state.peers.map((p, idx) => {
              const pe = v(res.peerMultiples[idx]);
              const wPct = Math.min(100, Math.max(6, (pe / maxPe) * 100));
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      {p.ticker}{' '}
                      <span className="text-stone-400 font-normal">
                        ({p.company})
                      </span>
                    </span>
                    <span className="font-extrabold text-amber-300">
                      {fmtNum(pe, 2)}x
                    </span>
                  </div>
                  <div className="h-2.5 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-amber-400 rounded-full"
                      style={{ width: `${wPct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="pt-2 border-t border-stone-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Среден P/E (Average)</span>
                <span>{fmtNum(res.averagePe, 2)}x</span>
              </div>
              <div className="flex items-center justify-between text-sky-400 font-bold">
                <span>Медианен P/E (Median)</span>
                <span>{fmtNum(res.medianPe, 2)}x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 9. RANDOM MULTIPLE VIEW
// ============================================================================
export const RandomMultipleView: React.FC<{
  state: PeSheetState;
  onChange: (next: PeSheetState) => void;
  onReset: () => void;
}> = ({ state, onChange, onReset }) => {
  const res = computePeSheet(state, true);

  const updateVerticalRow = (idx: number, val: Num) => {
    const next = state.verticalHistory.map((item, i) =>
      i === idx ? { ...item, value: val } : item
    );
    onChange({ ...state, verticalHistory: next });
  };

  return (
    <div className="space-y-5">
      <SheetTopBanner
        modelTitle="Random Multiple — Универсален Модел с Избран Множител (P/S, P/FCF, EV/Sales)"
        modelSubtitle="Проекция на базова метрика (Revenue / FCF) и обратно дисконтиране от избран мултипъл на 10-тата година"
        companyValue={state.company}
        onCompanyChange={(company) => onChange({ ...state, company })}
        priceLabel="Market Cap / Цена за сравнение (E1)"
        priceValue={state.marketPrice}
        onPriceChange={(marketPrice) => onChange({ ...state, marketPrice })}
        extraLeftLabel="Базова метрика — Revenue / FCF (B2)"
        extraLeftValue={state.baseValue}
        onExtraLeftChange={(baseValue) => onChange({ ...state, baseValue })}
        dataDate={state.dataDate}
        onDateChange={(dataDate) => onChange({ ...state, dataDate })}
        onResetSheet={onReset}
      />

      <HeroValuationCard
        title="Справедлива Стойност по Избран Множител (Random Multiple)"
        subtitle="Обратно дисконтирана от Година 10 с Margin of Safety"
        table={res.summaryTable}
        marketBenchmark={state.marketPrice}
        marketBenchmarkLabel="Текущ Market Cap (E1)"
        onWeightChange={(key, w) =>
          onChange({ ...state, weights: { ...state.weights, [key]: w } })
        }
        isCurrency={false}
        decimals={2}
      />

      <ScenarioBlocks
        sheetId="randomMultiple"
        mode="backwardsMultiple"
        terminalLabel="Price to FCF / Избран Множител"
        terminalIsPercent={false}
        editableBasePerScenario={false}
        scenariosInput={state.scenarios}
        scenariosResult={res.scenarios}
        onChangeScenario={(key, next) =>
          onChange({
            ...state,
            scenarios: { ...state.scenarios, [key]: next },
          })
        }
        decimals={2}
        isCurrency={false}
      />

      {/* Vertical 10Y Historical Table */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-stone-950 px-4 py-3 border-b border-stone-800 flex items-center justify-between text-xs">
          <span className="font-extrabold text-white">
            10-Годишна Вертикална История на Метриката (2024 → 2013)
          </span>
          <div className="flex items-center gap-3">
            <span className="text-stone-400">
              Average:{' '}
              <strong className="text-white">
                {fmtNum(res.verticalAverage, 2)}
              </strong>
            </span>
            <span className="text-emerald-400 font-bold">
              Avg Growth: {fmtPct(res.verticalAverageGrowth, 2)}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto p-3">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-stone-950/70 text-stone-400 border-b border-stone-800">
                <th className="p-2 text-left">Период</th>
                <th className="p-2 text-center">Година</th>
                <th className="p-2 text-right">Стойност (Жълто поле)</th>
                <th className="p-2 text-left pl-4">Интервал</th>
                <th className="p-2 text-right">Годишен ръст (%)</th>
              </tr>
            </thead>
            <tbody>
              {res.verticalRows.map((row, idx) => (
                <tr key={idx} className="border-b border-stone-800/70">
                  <td className="p-1.5 font-semibold text-stone-400">
                    {row.label}
                  </td>
                  <td className="p-1.5 text-center font-bold text-stone-200">
                    {row.year}
                  </td>
                  <td className="p-1.5 w-36">
                    <YellowNumberInput
                      value={row.value}
                      onChange={(val) => updateVerticalRow(idx, val)}
                      className="w-full"
                    />
                  </td>
                  <td className="p-1.5 pl-4 text-stone-400">{row.yoyLabel}</td>
                  <td
                    className={`p-1.5 text-right font-bold ${
                      row.yoy === null
                        ? 'text-stone-600'
                        : row.yoy >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {row.yoy === null ? '—' : fmtPct(row.yoy, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 10. STOCK VALUATION (MASTER DASHBOARD & FUNDAMENTAL RATIOS) VIEW
// ============================================================================
export const StockValuationView: React.FC<{
  state: StockValuationState;
  linkedModels: {
    dcf: Num;
    fcfMultiple: Num;
    evEbitda: Num;
    pe: Num;
    dividend: Num;
    peterLynch?: Num;
    peersMultiple?: Num;
  };
  onChange: (next: StockValuationState) => void;
  onReset: () => void;
  onNavigateTab?: (tabId: any) => void;
}> = ({ state, linkedModels, onChange, onReset, onNavigateTab }) => {
  const res = computeStockValuation(state, linkedModels);
  const comments = SHEET_COMMENTS.stockValuation ?? {};
  const isBuy = res.buySell === 'BUY';
  const diffPct = (res.underOverValued ?? 0) * 100;

  const modelRows: {
    key: keyof StockValuationState['modelWeights'];
    label: string;
    tabId: string;
    value: Num;
    weight: Num;
    weighted: number;
  }[] = [
    {
      key: 'dcf',
      label: 'DCF 10 Years Model',
      tabId: 'dcf10',
      value: res.modelValues.dcf,
      weight: state.modelWeights.dcf,
      weighted: res.weightedProducts.dcf,
    },
    {
      key: 'fcfMultiple',
      label: 'FCF Multiple Model',
      tabId: 'fcfMultiple',
      value: res.modelValues.fcfMultiple,
      weight: state.modelWeights.fcfMultiple,
      weighted: res.weightedProducts.fcfMultiple,
    },
    {
      key: 'evEbitda',
      label: 'EV / EBITDA Model',
      tabId: 'evEbitda',
      value: res.modelValues.evEbitda,
      weight: state.modelWeights.evEbitda,
      weighted: res.weightedProducts.evEbitda,
    },
    {
      key: 'pe',
      label: 'P/E Multiple Model',
      tabId: 'pe',
      value: res.modelValues.pe,
      weight: state.modelWeights.pe,
      weighted: res.weightedProducts.pe,
    },
    {
      key: 'dividend',
      label: 'Dividend Discount Model',
      tabId: 'dividends',
      value: res.modelValues.dividend,
      weight: state.modelWeights.dividend,
      weighted: res.weightedProducts.dividend,
    },
    {
      key: 'multiple',
      label: 'Peers / Custom Multiple',
      tabId: 'multipleModels',
      value: res.modelValues.multiple,
      weight: state.modelWeights.multiple,
      weighted: res.weightedProducts.multiple,
    },
  ];

  const maxModelVal = Math.max(
    ...modelRows.map((m) => v(m.value)),
    v(state.currentPrice),
    v(res.averageFairValue),
    1
  ) * 1.15;

  return (
    <div className="space-y-6">
      {/* 1. MASTER HERO COMPOSITE VALUATION & FOOTBALL FIELD CARD */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-2xl p-5 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/30 to-emerald-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Master Stock Valuation & Фундаментален Анализ
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {state.ticker} • {state.sector}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Комбинирана справедлива стойност от всички модели + 47 фундаментални показателя с обяснения на български
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                onChange({ ...state, useLinkedModels: !state.useLinkedModels })
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                state.useLinkedModels
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              }`}
            >
              {state.useLinkedModels
                ? '🔗 Автоматично свързани с другите табове'
                : '✍️ Ръчен режим на моделите'}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-bold text-stone-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Нулирай (SYK)</span>
            </button>
          </div>
        </div>

        {/* Composite Fair Value Hero + Football Field Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Left 5 Cols: Big Composite Fair Value */}
          <div className="lg:col-span-5 bg-stone-950/90 border border-stone-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Среднопретеглена Справедлива Цена (B54)
                </span>
                <div className="mt-2 flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl font-black text-white">
                    ${fmtNum(res.averageFairValue, 2)}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                      isBuy
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {isBuy ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {diffPct >= 0 ? `+${diffPct.toFixed(2)}%` : `${diffPct.toFixed(2)}%`}
                  </span>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-xl font-black text-sm tracking-widest border ${
                  isBuy
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500 text-rose-300'
                }`}
              >
                {res.buySell}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-800 text-xs">
              <div>
                <span className="text-stone-400 block mb-1">
                  Текуща пазарна цена (B7):
                </span>
                <YellowNumberInput
                  value={state.currentPrice}
                  onChange={(currentPrice) =>
                    onChange({ ...state, currentPrice })
                  }
                  prefix="$"
                  className="w-full"
                />
              </div>
              <div>
                <span className="text-stone-400 block mb-1">
                  Общо тегло на моделите:
                </span>
                <div
                  className={`px-3 py-1.5 rounded-lg font-extrabold text-right border ${
                    Math.abs(res.totalWeight - 1) > 0.001
                      ? 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                      : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {fmtPct(res.totalWeight, 0)}
                </div>
              </div>
            </div>

            {/* Visual Football Field Comparison Bars */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Сравнение на Моделите спрямо Пазарната Цена (${fmtNum(state.currentPrice, 2)})
              </div>
              {modelRows.map((m) => {
                const val = v(m.value);
                const wPct = Math.min(100, Math.max(3, (val / maxModelVal) * 100));
                const mpPct = Math.min(
                  100,
                  Math.max(3, (v(state.currentPrice) / maxModelVal) * 100)
                );
                return (
                  <div key={m.key} className="space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-300 font-semibold">{m.label}</span>
                      <span className="font-bold text-white">
                        ${fmtNum(m.value, 2)}{' '}
                        <span className="text-stone-500 font-normal">
                          (тегло {fmtPct(m.weight, 0)})
                        </span>
                      </span>
                    </div>
                    <div className="relative h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          val >= v(state.currentPrice)
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                            : 'bg-gradient-to-r from-blue-600 to-amber-400'
                        }`}
                        style={{ width: `${wPct}%` }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-400"
                        style={{ left: `${mpPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 7 Cols: Interactive Model Weights & Values Matrix */}
          <div className="lg:col-span-7 bg-stone-950/80 border border-stone-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between text-xs">
              <span className="font-extrabold text-white">
                Матрица на Оценъчните Модели и Техните Тегла (Редове 48–60)
              </span>
              <span className="text-[11px] text-stone-400">
                Кликнете върху модел за директен преход
              </span>
            </div>
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-stone-400 border-b border-stone-800">
                    <th className="p-2 text-left">Модел за оценка</th>
                    <th className="p-2 text-right">Изчислена Цена ($)</th>
                    <th className="p-2 text-right">Тегло (Weight %)</th>
                    <th className="p-2 text-right">Принос (Цена × Тегло)</th>
                  </tr>
                </thead>
                <tbody>
                  {modelRows.map((m) => (
                    <tr key={m.key} className="border-b border-stone-800/70 hover:bg-stone-900/50">
                      <td className="p-2 font-bold text-stone-200">
                        {onNavigateTab ? (
                          <button
                            type="button"
                            onClick={() => onNavigateTab(m.tabId)}
                            className="hover:text-amber-300 underline decoration-stone-700 hover:decoration-amber-400 cursor-pointer text-left"
                          >
                            {m.label} ↗
                          </button>
                        ) : (
                          m.label
                        )}
                      </td>
                      <td className="p-1.5 text-right w-36">
                        {!state.useLinkedModels || m.key === 'multiple' ? (
                          <YellowNumberInput
                            value={state.manualModels[m.key]}
                            onChange={(val) =>
                              onChange({
                                ...state,
                                manualModels: {
                                  ...state.manualModels,
                                  [m.key]: val,
                                },
                              })
                            }
                            prefix="$"
                            className="w-full"
                          />
                        ) : (
                          <span className="font-extrabold text-emerald-300 px-2">
                            ${fmtNum(m.value, 2)}
                          </span>
                        )}
                      </td>
                      <td className="p-1.5 text-right w-32">
                        <YellowPercentInput
                          value={m.weight}
                          onChange={(val) =>
                            onChange({
                              ...state,
                              modelWeights: {
                                ...state.modelWeights,
                                [m.key]: val,
                              },
                            })
                          }
                          className="w-full"
                        />
                      </td>
                      <td className="p-2 text-right font-bold text-white">
                        ${fmtNum(m.weighted, 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-stone-950 font-black text-sm">
                    <td className="p-2.5 text-stone-300">
                      AVERAGE FAIR VALUE (B54 / B60)
                    </td>
                    <td />
                    <td
                      className={`p-2.5 text-right ${
                        Math.abs(res.totalWeight - 1) > 0.001
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {fmtPct(res.totalWeight, 0)}
                    </td>
                    <td className="p-2.5 text-right text-amber-300 text-base">
                      ${fmtNum(res.averageFairValue, 2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FIVE CATEGORIZED FUNDAMENTAL HEALTH CARDS WITH ALL 24 BULGARIAN TOOLTIPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card A: Company Profile & Valuation Multiples */}
        <div className="bg-stone-900/95 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-stone-950 px-4 py-3 border-b border-stone-800 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
              1. Профил, Оценка и Доходност (Valuation & Yields)
            </span>
            <span className="text-[11px] text-stone-400">Кликнете ⓘ за ноу-хау</span>
          </div>
          <div className="p-4 space-y-2.5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2 border-b border-stone-800">
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">Company (B1)</span>
                <YellowTextInput
                  value={state.company}
                  onChange={(company) => onChange({ ...state, company })}
                  className="w-full"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">Ticker (B2)</span>
                <YellowTextInput
                  value={state.ticker}
                  onChange={(ticker) => onChange({ ...state, ticker })}
                  className="w-full"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">Industry (B3)</span>
                <YellowTextInput
                  value={state.industry}
                  onChange={(industry) => onChange({ ...state, industry })}
                  className="w-full"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">Sector (B4)</span>
                <YellowTextInput
                  value={state.sector}
                  onChange={(sector) => onChange({ ...state, sector })}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-medium">
                Market Cap (B9)
              </span>
              <YellowNumberInput
                value={state.marketCap}
                onChange={(marketCap) => onChange({ ...state, marketCap })}
                className="w-44"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-medium flex items-center">
                PE Ratio (B10)
                <InfoBadge title="PE Ratio" textBg={comments.A10} />
              </span>
              <div className="flex items-center gap-2">
                <YellowTextInput
                  value={state.peComment}
                  onChange={(peComment) => onChange({ ...state, peComment })}
                  className="w-24"
                />
                <YellowNumberInput
                  value={state.peRatio}
                  onChange={(peRatio) => onChange({ ...state, peRatio })}
                  className="w-28"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-medium">
                Price to FCF (B11)
              </span>
              <YellowNumberInput
                value={state.priceToFcf}
                onChange={(priceToFcf) => onChange({ ...state, priceToFcf })}
                className="w-44"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800/70">
              <span className="text-stone-300 font-semibold flex items-center">
                Earnings Yield (EY = EPS / Price) (B43)
                <InfoBadge
                  title="Earnings Yield (EY)"
                  textBg={comments.A43}
                  formula="=B24 / B7"
                />
              </span>
              <span className="font-extrabold text-emerald-400 text-sm">
                {fmtPct(res.earningsYield, 2)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-semibold flex items-center">
                Free Cash Flow Yield (FCF / Market Cap) (B42)
                <InfoBadge
                  title="Free Cash Flow Yield"
                  textBg={comments.A42}
                  formula="=1 * (B38 / B9)"
                />
              </span>
              <span className="font-extrabold text-emerald-400 text-sm">
                {fmtPct(res.freeCashFlowYield, 2)}
              </span>
            </div>
          </div>
        </div>

        {/* Card B: Profitability, Moat & Returns (ROE, ROA, ROIC) */}
        <div className="bg-stone-900/95 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-stone-950 px-4 py-3 border-b border-stone-800 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
              2. Рентабилност и Конкурентно Предимство (Moat: ROE, ROA, ROIC)
            </span>
            {v(state.roic) >= 0.15 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ✓ ROIC &gt; 15% (Силен Moat)
              </span>
            )}
          </div>
          <div className="p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-medium flex items-center">
                ROE — Return on Equity (Търсим &gt; 15%) (B28)
                <InfoBadge title="ROE (Return on Equity)" textBg={comments.A28} />
              </span>
              <YellowPercentInput
                value={state.roe}
                onChange={(roe) => onChange({ ...state, roe })}
                className="w-36"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-medium flex items-center">
                ROA — Return on Assets (Търсим &gt; 5%) (B29)
                <InfoBadge title="ROA (Return on Assets)" textBg={comments.A29} />
              </span>
              <YellowPercentInput
                value={state.roa}
                onChange={(roa) => onChange({ ...state, roa })}
                className="w-36"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-medium flex items-center">
                ROIC — Return on Invested Capital (Търсим &gt; 15%) (B30)
                <InfoBadge title="ROIC" textBg={comments.A30} />
              </span>
              <YellowPercentInput
                value={state.roic}
                onChange={(roic) => onChange({ ...state, roic })}
                className="w-36"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-medium flex items-center">
                Gross Profit Margin (Над 40%) (B21)
                <InfoBadge
                  title="Gross Profit Margin"
                  textBg={comments.A21}
                />
              </span>
              <YellowPercentInput
                value={state.grossProfitMargin}
                onChange={(grossProfitMargin) =>
                  onChange({ ...state, grossProfitMargin })
                }
                className="w-36"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-medium flex items-center">
                Net Profit Margin (Над 20%) (B27)
                <InfoBadge title="Net Profit Margin" textBg={comments.A27} />
              </span>
              <YellowPercentInput
                value={state.netProfitMargin}
                onChange={(netProfitMargin) =>
                  onChange({ ...state, netProfitMargin })
                }
                className="w-36"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-stone-800/70">
              <div className="flex items-center justify-between gap-1">
                <span className="text-stone-400 flex items-center">
                  R&D Ratio (&lt;30%)
                  <InfoBadge title="R&D Ratio" textBg={comments.A22} />
                </span>
                <YellowPercentInput
                  value={state.rdRatio}
                  onChange={(rdRatio) => onChange({ ...state, rdRatio })}
                  className="w-24"
                />
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-stone-400 flex items-center">
                  SG&A Ratio (&lt;30%)
                  <InfoBadge title="SG&A Ratio" textBg={comments.A23} />
                </span>
                <YellowPercentInput
                  value={state.sgaRatio}
                  onChange={(sgaRatio) => onChange({ ...state, sgaRatio })}
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card C: Revenue, Earnings & Cash Flow Power */}
        <div className="bg-stone-900/95 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-stone-950 px-4 py-3 border-b border-stone-800">
            <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400">
              3. Приходи, Печалба и Парични Потоци (Revenue, EPS & Cash Flow)
            </span>
          </div>
          <div className="p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-medium flex items-center">
                Shares Outstanding (Намаляващи) (B18)
                <InfoBadge title="Shares Outstanding" textBg={comments.A18} />
              </span>
              <YellowNumberInput
                value={state.sharesOutstanding}
                onChange={(sharesOutstanding) =>
                  onChange({ ...state, sharesOutstanding })
                }
                className="w-40"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-medium flex items-center">
                Revenue (Приходи B19)
                <InfoBadge title="Revenue" textBg={comments.A19} />
              </span>
              <YellowNumberInput
                value={state.revenue}
                onChange={(revenue) => onChange({ ...state, revenue })}
                className="w-40"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-medium flex items-center">
                EPS (B24) & Net Income (B26)
                <InfoBadge title="EPS & Net Income" textBg={comments.A24} />
              </span>
              <div className="flex items-center gap-2">
                <YellowNumberInput
                  value={state.eps}
                  onChange={(eps) => onChange({ ...state, eps })}
                  prefix="$"
                  className="w-24"
                />
                <YellowNumberInput
                  value={state.netIncome}
                  onChange={(netIncome) => onChange({ ...state, netIncome })}
                  className="w-36"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-medium flex items-center">
                Cash Flow from Operations (CFFO B36)
                <InfoBadge
                  title="Cash Flow from Operations"
                  textBg={comments.A36}
                />
              </span>
              <YellowNumberInput
                value={state.cashFlowFromOperations}
                onChange={(cashFlowFromOperations) =>
                  onChange({ ...state, cashFlowFromOperations })
                }
                className="w-40"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-medium flex items-center">
                Free Cash Flow (FCF B38)
                <InfoBadge title="Free Cash Flow" textBg={comments.A38} />
              </span>
              <YellowNumberInput
                value={state.freeCashFlow}
                onChange={(freeCashFlow) =>
                  onChange({ ...state, freeCashFlow })
                }
                className="w-40"
              />
            </div>

            {/* Auto-calculated Cash Flow Ratios (Rows 40, 41, 44) */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-800/80 text-center">
              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-2">
                <span className="text-[10px] text-stone-400 flex items-center justify-center">
                  CF Margin (B40)
                  <InfoBadge title="Cash Flow Margin" textBg={comments.A40} />
                </span>
                <span className="text-xs font-extrabold text-white block mt-0.5">
                  {fmtPct(res.cashFlowMargin, 2)}
                </span>
              </div>
              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-2">
                <span className="text-[10px] text-stone-400 flex items-center justify-center">
                  FCF Margin (B41)
                  <InfoBadge
                    title="Free Cash Flow Margin"
                    textBg={comments.A41}
                  />
                </span>
                <span className="text-xs font-extrabold text-emerald-400 block mt-0.5">
                  {fmtPct(res.freeCashFlowMargin, 2)}
                </span>
              </div>
              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-2">
                <span className="text-[10px] text-stone-400 flex items-center justify-center">
                  FCF / Net Inc (B44)
                  <InfoBadge title="FCF to Net Income" textBg={comments.A44} />
                </span>
                <span className="text-xs font-extrabold text-amber-300 block mt-0.5">
                  {fmtNum(res.fcfToNetIncome, 2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card D: Balance Sheet, Debt, Liquidity & Dividends */}
        <div className="bg-stone-900/95 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-stone-950 px-4 py-3 border-b border-stone-800 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400">
              4. Ликвидност, Дълг и Дивиденти (Balance Sheet & Dividends)
            </span>
          </div>
          <div className="p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-medium flex items-center">
                Current Ratio (Над 1.0 е ОК) (B31)
                <InfoBadge title="Current Ratio" textBg={comments.A31} />
              </span>
              <YellowNumberInput
                value={state.currentRatio}
                onChange={(currentRatio) =>
                  onChange({ ...state, currentRatio })
                }
                className="w-36"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-300 font-medium flex items-center">
                Long-Term Debt (&lt; 3× FCF) (B32)
                <InfoBadge title="Long-Term Debt" textBg={comments.A32} />
              </span>
              <YellowNumberInput
                value={state.longTermDebt}
                onChange={(longTermDebt) =>
                  onChange({ ...state, longTermDebt })
                }
                className="w-36"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between gap-1">
                <span className="text-stone-400 flex items-center">
                  LT Debt/Eq (&lt;0.5)
                  <InfoBadge
                    title="LT Debt to Equity"
                    textBg={comments.A34}
                  />
                </span>
                <YellowNumberInput
                  value={state.longTermDebtToEquity}
                  onChange={(longTermDebtToEquity) =>
                    onChange({ ...state, longTermDebtToEquity })
                  }
                  className="w-24"
                />
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-stone-400 flex items-center">
                  Debt/Equity (&lt;2)
                  <InfoBadge title="Debt to Equity" textBg={comments.A35} />
                </span>
                <YellowNumberInput
                  value={state.debtToEquity}
                  onChange={(debtToEquity) =>
                    onChange({ ...state, debtToEquity })
                  }
                  className="w-24"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-800/70">
              <div>
                <span className="text-[11px] text-stone-400 flex items-center mb-1">
                  Div Yield (B12)
                  <InfoBadge title="Dividend Yield" textBg={comments.A12} />
                </span>
                <YellowTextInput
                  value={state.dividendYield}
                  onChange={(dividendYield) =>
                    onChange({ ...state, dividendYield })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 flex items-center mb-1">
                  Payout (&lt;60%)
                  <InfoBadge
                    title="Dividend Payout Ratio"
                    textBg={comments.A13}
                  />
                </span>
                <YellowTextInput
                  value={state.dividendPayoutRatio}
                  onChange={(dividendPayoutRatio) =>
                    onChange({ ...state, dividendPayoutRatio })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 flex items-center mb-1">
                  Cash Payout
                  <InfoBadge
                    title="Cash Dividend Payout Ratio"
                    textBg={comments.A14}
                  />
                </span>
                <YellowTextInput
                  value={state.cashDividendPayoutRatio}
                  onChange={(cashDividendPayoutRatio) =>
                    onChange({ ...state, cashDividendPayoutRatio })
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-800/70">
              <div>
                <span className="text-[11px] text-stone-400 flex items-center mb-1">
                  CF Coverage
                  <InfoBadge
                    title="Cash Flow Coverage Ratio"
                    textBg={comments.A45}
                  />
                </span>
                <YellowNumberInput
                  value={state.cashFlowCoverageRatio}
                  onChange={(cashFlowCoverageRatio) =>
                    onChange({ ...state, cashFlowCoverageRatio })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 flex items-center mb-1">
                  Op CF Ratio
                  <InfoBadge
                    title="Operating Cash Flow Ratio"
                    textBg={comments.A46}
                  />
                </span>
                <YellowNumberInput
                  value={state.operatingCashFlowRatio}
                  onChange={(operatingCashFlowRatio) =>
                    onChange({ ...state, operatingCashFlowRatio })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 flex items-center mb-1">
                  Cash ROA
                  <InfoBadge title="Cash ROA" textBg={comments.A47} />
                </span>
                <YellowNumberInput
                  value={state.cashRoa}
                  onChange={(cashRoa) => onChange({ ...state, cashRoa })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROI Calculators Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <RoiCalculatorCard
          title="ROI Калкулатор #1 (5-Годишен Ръст)"
          input={state.roi1}
          result={res.roi1}
          onChange={(roi1) => onChange({ ...state, roi1 })}
        />
        <RoiCalculatorCard
          title="ROI Калкулатор #2 (10-Годишен Ръст)"
          input={state.roi2}
          result={res.roi2}
          onChange={(roi2) => onChange({ ...state, roi2 })}
        />
      </div>
    </div>
  );
};
