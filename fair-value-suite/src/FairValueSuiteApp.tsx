import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  PieChart,
  TrendingUp,
  TrendingDown,
  Layers,
  BarChart3,
  Award,
  Activity,
  DollarSign,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  Table as TableIcon,
  LayoutGrid,
  Check,
  Sliders,
  X,
} from 'lucide-react';
import { SuiteState, createDefaultSuiteState } from './engine/defaults';
import {
  computeDcf10,
  computeEvEbitda,
  computeFcfMultiple,
  computeMultipleModels,
  computePeSheet,
  computePeterLynch,
  computeStockValuation,
} from './engine/models';
import {
  Dcf10View,
  DividendsView,
  EvEbitdaView,
  FcfMultipleView,
  MultipleModelsView,
  OverviewView,
  PeView,
  PeterLynchView,
  RandomMultipleView,
  StockValuationView,
} from './components/SheetViews';
import { fmtNum, fmtPct, YellowNumberInput, YellowTextInput } from './components/SpreadsheetWidgets';
import { INITIAL_SHEETS_DATA, SheetData } from './engine/googleSheetsData';
import { evaluateWorkbook } from './engine/formulaEngine';
import { DEFAULT_SYK_PRICE_HISTORY } from './engine/priceHistoryData';
import { GoogleSheetGrid } from './components/GoogleSheetGrid';

export type SheetTabId =
  | 'stockValuation'
  | 'dcf10'
  | 'fcfMultiple'
  | 'evEbitda'
  | 'pe'
  | 'dividends'
  | 'peterLynch'
  | 'multipleModels'
  | 'randomMultiple'
  | 'overview';

const STORAGE_KEY_SUITE = 'aed_fair_value_suite_state_2026_v3';
const STORAGE_KEY_GS = 'fair_value_google_sheets_2026_v2';

export interface FairValueSuiteProps {
  initialTab?: SheetTabId;
  embedded?: boolean;
  selectedTicker?: string;
  onSaveFairValue?: (ticker: string, fairValue: number, priceOfCalc: number) => void;
  onClose?: () => void;
}

const TABS: {
  id: SheetTabId;
  title: string;
  shortTitle: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'overview',
    title: 'Overview & 10Y Price',
    shortTitle: 'Overview',
    subtitle: 'Пазарен профил и 10-годишна графика на цената',
    icon: Activity,
  },
  {
    id: 'dcf10',
    title: 'DCF 10 Years',
    shortTitle: 'DCF 10Y',
    subtitle: 'Дисконтирани свободни парични потоци (10 г.)',
    icon: Calculator,
  },
  {
    id: 'fcfMultiple',
    title: 'FCF Multiple',
    shortTitle: 'FCF Multiple',
    subtitle: 'Оценка чрез множител на свободния паричен поток',
    icon: DollarSign,
  },
  {
    id: 'evEbitda',
    title: 'EV / EBITDA',
    shortTitle: 'EV/EBITDA',
    subtitle: 'Оценка чрез множител EV към EBITDA',
    icon: BarChart3,
  },
  {
    id: 'pe',
    title: 'P/E Multiple',
    shortTitle: 'P/E Model',
    subtitle: 'Оценка чрез EPS и терминален P/E множител',
    icon: TrendingUp,
  },
  {
    id: 'peterLynch',
    title: 'Peter Lynch',
    shortTitle: 'Peter Lynch',
    subtitle: 'Формула на Питър Линч (Growth × EPS × PEG)',
    icon: Award,
  },
  {
    id: 'multipleModels',
    title: 'Peers Multiples',
    shortTitle: 'Peers P/E',
    subtitle: 'Сравнителна оценка спрямо конкуренти в сектора',
    icon: Layers,
  },
  {
    id: 'dividends',
    title: 'Dividends Model',
    shortTitle: 'Dividends',
    subtitle: 'Дисконтирани дивиденти и дивидент мултипъл',
    icon: Sparkles,
  },
  {
    id: 'randomMultiple',
    title: 'Random Multiple',
    shortTitle: 'Random Multiple',
    subtitle: 'Универсален модел с избран мултипъл (P/S, P/FCF)',
    icon: Sliders,
  },
  {
    id: 'stockValuation',
    title: 'Stock Valuation (Табло)',
    shortTitle: 'Stock Valuation',
    subtitle: 'Комбинирана оценка + 47 фундаментални показателя',
    icon: PieChart,
  },
];

function cloneInitialSheets(): SheetData[] {
  return JSON.parse(JSON.stringify(INITIAL_SHEETS_DATA));
}

export const FairValueSuiteApp: React.FC<FairValueSuiteProps> = ({
  initialTab = 'dcf10',
  embedded = false,
  onSaveFairValue,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<SheetTabId>(initialTab);
  const [viewMode, setViewMode] = useState<'app' | 'spreadsheet'>('app');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showQuickSync, setShowQuickSync] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Main Structured Investor State (1:1 verified with all 10 Excel sheets)
  const [state, setState] = useState<SuiteState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUITE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.dcf10 && parsed.stockValuation) {
          return {
            ...createDefaultSuiteState(),
            ...parsed,
            overview: {
              ...createDefaultSuiteState().overview,
              ...(parsed.overview || {}),
              priceHistory: DEFAULT_SYK_PRICE_HISTORY,
            },
          };
        }
      }
    } catch {
      // ignore storage errors
    }
    return createDefaultSuiteState();
  });

  // Quick-Sync Drawer Form State (for applying a new company across all 10 tabs at once)
  const [quickTicker, setQuickTicker] = useState(state.overview.symbol);
  const [quickName, setQuickName] = useState(state.overview.companyName);
  const [quickPrice, setQuickPrice] = useState<number | null>(state.dcf10.marketPrice);
  const [quickShares, setQuickShares] = useState<number | null>(state.dcf10.sharesOutstanding);
  const [quickEps, setQuickEps] = useState<number | null>(state.pe.baseValue);
  const [quickFcf, setQuickFcf] = useState<number | null>(state.fcfMultiple.baseValue);
  const [quickEbitda, setQuickEbitda] = useState<number | null>(
    state.evEbitda.scenarios.optimistic.baseMetric ?? 6082000
  );

  // Secondary Raw Spreadsheet State (in case user switches to 'spreadsheet' mode)
  const [sheets, setSheets] = useState<SheetData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === INITIAL_SHEETS_DATA.length) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return cloneInitialSheets();
  });

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    try {
      const toSave = {
        ...state,
        overview: { ...state.overview, priceHistory: [] },
      };
      localStorage.setItem(STORAGE_KEY_SUITE, JSON.stringify(toSave));
    } catch {
      // ignore quota
    }
  }, [state]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Real-time live results across all models for the Top Scoreboard Strip
  const liveSummary = useMemo(() => {
    const dcf = computeDcf10(state.dcf10);
    const fcf = computeFcfMultiple(state.fcfMultiple);
    const ev = computeEvEbitda(state.evEbitda);
    const pe = computePeSheet(state.pe, false);
    const div = computeFcfMultiple(state.dividends);
    const lynch = computePeterLynch(state.peterLynch);
    const peers = computeMultipleModels(state.multipleModels);

    const linked = {
      dcf: dcf.perShareTable.averageIntrinsicValue,
      fcfMultiple: fcf.perShareTable.averageIntrinsicValue,
      evEbitda: ev.perShareTable.averageIntrinsicValue,
      pe: pe.summaryTable.averageIntrinsicValue,
      dividend: div.primaryTable.averageIntrinsicValue,
      peterLynch: lynch.fairPrice,
      peersMultiple: peers.impliedStockPrice,
    };

    const master = computeStockValuation(state.stockValuation, linked);

    return {
      dcf,
      fcf,
      ev,
      pe,
      div,
      lynch,
      peers,
      linked,
      master,
    };
  }, [state]);

  // Apply Quick Company Sync across all 10 sheets
  const handleApplyQuickCompany = () => {
    const p = quickPrice ?? 100;
    const sh = quickShares ?? 100000;
    const eps = quickEps ?? 5;
    const fcf = quickFcf ?? 1000000;
    const ebitda = quickEbitda ?? 1500000;
    const mcap = p * sh;

    setState((prev) => ({
      ...prev,
      overview: {
        ...prev.overview,
        symbol: quickTicker,
        companyName: quickName,
        currentPrice: p,
        shares: sh,
        marketCap: mcap,
        eps,
        peRatio: eps > 0 ? Number((p / eps).toFixed(2)) : prev.overview.peRatio,
      },
      stockValuation: {
        ...prev.stockValuation,
        company: quickName,
        ticker: quickTicker,
        currentPrice: p,
        marketCap: mcap,
        sharesOutstanding: sh,
        eps,
        peRatio: eps > 0 ? Number((p / eps).toFixed(2)) : prev.stockValuation.peRatio,
        freeCashFlow: fcf * 1000,
      },
      dcf10: {
        ...prev.dcf10,
        company: quickTicker,
        marketPrice: p,
        sharesOutstanding: sh,
        marketCapDcf: mcap,
        scenarios: {
          optimistic: { ...prev.dcf10.scenarios.optimistic, baseMetric: fcf },
          average: { ...prev.dcf10.scenarios.average, baseMetric: fcf },
          worst: { ...prev.dcf10.scenarios.worst, baseMetric: fcf },
        },
      },
      fcfMultiple: {
        ...prev.fcfMultiple,
        company: quickTicker,
        marketCap: mcap,
        baseValue: fcf,
        sharesOutstanding: sh,
        marketPrice: p,
      },
      evEbitda: {
        ...prev.evEbitda,
        company: quickTicker,
        marketPrice: p,
        sharesOutstanding: sh,
        marketCapDcf: mcap,
        scenarios: {
          optimistic: { ...prev.evEbitda.scenarios.optimistic, baseMetric: ebitda },
          average: { ...prev.evEbitda.scenarios.average, baseMetric: ebitda },
          worst: { ...prev.evEbitda.scenarios.worst, baseMetric: ebitda },
        },
      },
      pe: {
        ...prev.pe,
        company: quickTicker,
        marketPrice: p,
        baseValue: eps,
      },
      dividends: {
        ...prev.dividends,
        company: quickTicker,
        marketCap: p,
        sharesOutstanding: sh,
        marketPrice: p,
      },
      peterLynch: {
        ...prev.peterLynch,
        ticker: quickTicker,
        epsTtm: eps,
        stockPrice: p,
      },
      multipleModels: {
        ...prev.multipleModels,
        targetTicker: quickTicker,
        targetCompany: quickName,
        targetCurrentPrice: p,
        targetEps: eps,
      },
      randomMultiple: {
        ...prev.randomMultiple,
        company: quickTicker,
        marketPrice: mcap,
      },
    }));

    setShowQuickSync(false);
    setSyncToast(
      `✓ Данните за ${quickTicker} (${quickName}) бяха синхронизирани във всички 10 модела!`
    );
    setTimeout(() => setSyncToast(null), 4000);
  };

  const resetAllToDefault = () => {
    const def = createDefaultSuiteState();
    setState(def);
    setSheets(cloneInitialSheets());
    setQuickTicker(def.overview.symbol);
    setQuickName(def.overview.companyName);
    setQuickPrice(def.dcf10.marketPrice);
    setQuickShares(def.dcf10.sharesOutstanding);
    setQuickEps(def.pe.baseValue);
    setQuickFcf(def.fcfMultiple.baseValue);
    setQuickEbitda(def.evEbitda.scenarios.optimistic.baseMetric ?? 6082000);
    setSyncToast('✓ Върнати са оригиналните SYK (Stryker Corp) стойности във всички модели.');
    setTimeout(() => setSyncToast(null), 3500);
  };

  const resetSingleSheet = (tabId: SheetTabId) => {
    const def = createDefaultSuiteState();
    setState((prev) => ({
      ...prev,
      [tabId]: def[tabId],
    }));
  };

  // Evaluated workbook only when in raw Google Sheets mode
  const evaluatedWorkbook = useMemo(
    () =>
      viewMode === 'spreadsheet'
        ? evaluateWorkbook(sheets, DEFAULT_SYK_PRICE_HISTORY)
        : {},
    [sheets, viewMode]
  );

  const currentRawSheet = useMemo(
    () => sheets.find((s) => s.id === activeTab) ?? sheets[0],
    [sheets, activeTab]
  );

  const handleUpdateRawCell = (
    ref: string,
    newVal: string | number,
    isFormula = false
  ) => {
    setSheets((prev) =>
      prev.map((sh) => {
        if (sh.id !== currentRawSheet.id) return sh;
        const existing = sh.cells[ref] ?? {};
        const updatedCell = { ...existing };
        if (isFormula) {
          updatedCell.f = String(newVal);
        } else {
          delete updatedCell.f;
          updatedCell.v = newVal;
        }
        return {
          ...sh,
          cells: {
            ...sh.cells,
            [ref]: updatedCell,
          },
        };
      })
    );
  };

  const scoreboardCards: {
    id: SheetTabId;
    label: string;
    fv: number;
    upsidePct: number | null;
    signal: 'BUY' | 'SELL';
    highlight?: boolean;
  }[] = [
    {
      id: 'stockValuation',
      label: 'Composite Fair Value',
      fv: liveSummary.master.averageFairValue,
      upsidePct: liveSummary.master.underOverValued,
      signal: liveSummary.master.buySell,
      highlight: true,
    },
    {
      id: 'dcf10',
      label: 'DCF 10 Years',
      fv: liveSummary.dcf.perShareTable.averageIntrinsicValue,
      upsidePct: liveSummary.dcf.perShareTable.underOverValued,
      signal: liveSummary.dcf.perShareTable.buySell,
    },
    {
      id: 'fcfMultiple',
      label: 'FCF Multiple',
      fv: liveSummary.fcf.perShareTable.averageIntrinsicValue,
      upsidePct: liveSummary.fcf.perShareTable.underOverValued,
      signal: liveSummary.fcf.perShareTable.buySell,
    },
    {
      id: 'evEbitda',
      label: 'EV / EBITDA',
      fv: liveSummary.ev.perShareTable.averageIntrinsicValue,
      upsidePct: liveSummary.ev.perShareTable.underOverValued,
      signal: liveSummary.ev.perShareTable.buySell,
    },
    {
      id: 'pe',
      label: 'P/E Model',
      fv: liveSummary.pe.summaryTable.averageIntrinsicValue,
      upsidePct: liveSummary.pe.summaryTable.underOverValued,
      signal: liveSummary.pe.summaryTable.buySell,
    },
    {
      id: 'peterLynch',
      label: 'Peter Lynch',
      fv: liveSummary.lynch.fairPrice,
      upsidePct: liveSummary.lynch.difference,
      signal: liveSummary.lynch.buySell,
    },
    {
      id: 'multipleModels',
      label: 'Peers P/E',
      fv: liveSummary.peers.impliedStockPrice,
      upsidePct: liveSummary.peers.upsidePct,
      signal: liveSummary.peers.buySell,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. EXECUTIVE TOP HEADER BAR */}
      <header className="bg-stone-950/95 backdrop-blur-md border-b border-stone-800/90 px-4 sm:px-6 py-3 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Active Company Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/25 via-blue-600/20 to-emerald-500/25 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/5">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 font-black text-[11px] tracking-wider">
                  АЕД
                </span>
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  Fair Value Valuation Suite
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-900 border border-stone-700 text-emerald-400">
                  {state.overview.symbol} • ${fmtNum(state.overview.currentPrice, 2)}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Инвестиционна платформа за фундаментален анализ и определяне на справедлива цена по 10 модела
              </p>
            </div>
          </div>

          {/* Right Controls: Quick Company Sync, View Switcher, Fullscreen, Reset */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Company Sync Button */}
            <button
              type="button"
              onClick={() => setShowQuickSync((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                showQuickSync
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/35'
              }`}
              title="Въведи нова компания и синхронизирай основните ѝ данни във всички 10 модела едновременно"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Нова компания (Синхронизирай)</span>
            </button>

            {/* View Switcher: Investor App vs Raw Google Sheet */}
            <div className="flex items-center bg-stone-900 border border-stone-800 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('app')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'app'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Приложение</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('spreadsheet')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'spreadsheet'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="Превключи към класически табличен изглед (Google Sheets клетки)"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Таблица</span>
              </button>
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-bold text-stone-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              title="Цял екран"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline">
                {isFullscreen ? 'Изход' : 'Цял екран'}
              </span>
            </button>

            <button
              type="button"
              onClick={resetAllToDefault}
              className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-bold text-stone-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              title="Върни оригиналните данни за SYK (Stryker Corp) във всички 10 модела"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">SYK Еталон</span>
            </button>

            {embedded && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* QUICK COMPANY SYNC DRAWER */}
        {showQuickSync && (
          <div className="max-w-[1600px] mx-auto mt-3 pt-3 border-t border-stone-800 animate-in fade-in">
            <div className="bg-stone-900/95 border border-amber-500/40 rounded-2xl p-4 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-white">
                    Бърза Синхронизация на Компания във Всички 10 Модела
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickSync(false)}
                  className="text-stone-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕ Затвори
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
                <div>
                  <span className="text-[11px] text-stone-400 block mb-1">Тикър (Symbol)</span>
                  <YellowTextInput
                    value={quickTicker}
                    onChange={setQuickTicker}
                    className="w-full"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block mb-1">Име на компания</span>
                  <YellowTextInput
                    value={quickName}
                    onChange={setQuickName}
                    className="w-full"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block mb-1">Текуща цена ($)</span>
                  <YellowNumberInput
                    value={quickPrice}
                    onChange={setQuickPrice}
                    prefix="$"
                    className="w-full"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block mb-1">Акции (Shares в хил. K)</span>
                  <YellowNumberInput
                    value={quickShares}
                    onChange={setQuickShares}
                    className="w-full"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block mb-1">EPS (TTM $)</span>
                  <YellowNumberInput
                    value={quickEps}
                    onChange={setQuickEps}
                    prefix="$"
                    className="w-full"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block mb-1">Free Cash Flow (в хил. K)</span>
                  <YellowNumberInput
                    value={quickFcf}
                    onChange={setQuickFcf}
                    className="w-full"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block mb-1">EBITDA (в хил. K)</span>
                  <YellowNumberInput
                    value={quickEbitda}
                    onChange={setQuickEbitda}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-stone-400">
                  💡 След синхронизацията можете да променяте всяко жълто поле поотделно във всеки модел.
                </span>
                <button
                  type="button"
                  onClick={handleApplyQuickCompany}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  ⚡ Приложи във всички 10 модела
                </button>
              </div>
            </div>
          </div>
        )}

        {syncToast && (
          <div className="max-w-[1600px] mx-auto mt-2 px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{syncToast}</span>
          </div>
        )}
      </header>

      {/* 2. LIVE VALUATION SCOREBOARD STRIP ("Football Field" Bar across all models) */}
      {viewMode === 'app' && (
        <div className="bg-stone-900/70 border-b border-stone-800/80 px-4 sm:px-6 py-2.5">
          <div className="max-w-[1600px] mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {scoreboardCards.map((card) => {
              const isSelected = activeTab === card.id;
              const isBuy = card.signal === 'BUY';
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setActiveTab(card.id)}
                  className={`text-left rounded-xl p-2.5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 border-amber-500/60 ring-1 ring-amber-500/40 shadow-md'
                      : card.highlight
                      ? 'bg-stone-900/90 border-blue-500/30 hover:border-blue-500/50'
                      : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider truncate ${
                        card.highlight ? 'text-amber-300' : 'text-stone-400'
                      }`}
                    >
                      {card.label}
                    </span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                        isBuy
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {card.signal}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1 mt-1">
                    <span className="text-sm sm:text-base font-black text-white">
                      ${fmtNum(card.fv, 2)}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        (card.upsidePct ?? 0) >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {fmtPct(card.upsidePct, 1)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MODULE NAVIGATION BAR (10 Tabs) */}
      <div className="bg-stone-950 border-b border-stone-800 px-4 sm:px-6 py-2 sticky top-[61px] z-30">
        <div className="max-w-[1600px] mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                  active
                    ? 'bg-gradient-to-r from-blue-600/25 to-emerald-600/20 text-white border-blue-500/50 shadow-md'
                    : 'bg-stone-900/60 text-stone-400 border-stone-800/80 hover:bg-stone-900 hover:text-stone-200'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    active ? 'text-amber-400' : 'text-stone-500'
                  }`}
                />
                <span>{t.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA */}
      {viewMode === 'spreadsheet' ? (
        <div className="flex-1 bg-[#f8f9fa] text-slate-900 overflow-auto">
          <GoogleSheetGrid
            sheet={currentRawSheet}
            evaluated={evaluatedWorkbook[currentRawSheet.id] ?? {}}
            onUpdateCell={handleUpdateRawCell}
            priceHistory={DEFAULT_SYK_PRICE_HISTORY}
          />
        </div>
      ) : (
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
          {activeTab === 'stockValuation' && (
            <StockValuationView
              state={state.stockValuation}
              linkedModels={liveSummary.linked}
              onChange={(stockValuation) =>
                setState((prev) => ({ ...prev, stockValuation }))
              }
              onReset={() => resetSingleSheet('stockValuation')}
              onNavigateTab={(tabId) => setActiveTab(tabId)}
            />
          )}

          {activeTab === 'dcf10' && (
            <Dcf10View
              state={state.dcf10}
              onChange={(dcf10) => setState((prev) => ({ ...prev, dcf10 }))}
              onReset={() => resetSingleSheet('dcf10')}
            />
          )}

          {activeTab === 'fcfMultiple' && (
            <FcfMultipleView
              state={state.fcfMultiple}
              onChange={(fcfMultiple) =>
                setState((prev) => ({ ...prev, fcfMultiple }))
              }
              onReset={() => resetSingleSheet('fcfMultiple')}
            />
          )}

          {activeTab === 'evEbitda' && (
            <EvEbitdaView
              state={state.evEbitda}
              onChange={(evEbitda) =>
                setState((prev) => ({ ...prev, evEbitda }))
              }
              onReset={() => resetSingleSheet('evEbitda')}
            />
          )}

          {activeTab === 'pe' && (
            <PeView
              state={state.pe}
              onChange={(pe) => setState((prev) => ({ ...prev, pe }))}
              onReset={() => resetSingleSheet('pe')}
            />
          )}

          {activeTab === 'dividends' && (
            <DividendsView
              state={state.dividends}
              onChange={(dividends) =>
                setState((prev) => ({ ...prev, dividends }))
              }
              onReset={() => resetSingleSheet('dividends')}
            />
          )}

          {activeTab === 'peterLynch' && (
            <PeterLynchView
              state={state.peterLynch}
              onChange={(peterLynch) =>
                setState((prev) => ({ ...prev, peterLynch }))
              }
              onReset={() => resetSingleSheet('peterLynch')}
            />
          )}

          {activeTab === 'multipleModels' && (
            <MultipleModelsView
              state={state.multipleModels}
              onChange={(multipleModels) =>
                setState((prev) => ({ ...prev, multipleModels }))
              }
              onReset={() => resetSingleSheet('multipleModels')}
            />
          )}

          {activeTab === 'randomMultiple' && (
            <RandomMultipleView
              state={state.randomMultiple}
              onChange={(randomMultiple) =>
                setState((prev) => ({ ...prev, randomMultiple }))
              }
              onReset={() => resetSingleSheet('randomMultiple')}
            />
          )}

          {activeTab === 'overview' && (
            <OverviewView
              state={state.overview}
              onChange={(overview) =>
                setState((prev) => ({ ...prev, overview }))
              }
              onReset={() => resetSingleSheet('overview')}
            />
          )}
        </main>
      )}
    </div>
  );
};

export default FairValueSuiteApp;
