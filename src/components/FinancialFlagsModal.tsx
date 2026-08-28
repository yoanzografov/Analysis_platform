import React, { useState } from 'react';
import { Stock } from '../types';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle, TrendingUp, DollarSign, PieChart, FileText } from 'lucide-react';

interface FinancialFlagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock?: Stock | null;
  stocks?: Stock[];
}

export interface FlagRule {
  id: string;
  statement: 'Income Statement' | 'Balance Sheet' | 'Cash Flow Statement';
  metric: string;
  greenThreshold: string;
  yellowThreshold: string;
  redThreshold: string;
  getValue?: (s: Stock) => number | string | null;
}

export const FINANCIAL_FLAGS_RULES: FlagRule[] = [
  // INCOME STATEMENT
  {
    id: 'gross_margin',
    statement: 'Income Statement',
    metric: 'Gross Margin (Брутен марж)',
    greenThreshold: '40%+',
    yellowThreshold: '< 30%',
    redThreshold: '< 10%',
    getValue: (s) => 46.2
  },
  {
    id: 'rev_growth',
    statement: 'Income Statement',
    metric: 'Revenue Growth Rate (Ръст на приходите)',
    greenThreshold: '15%+',
    yellowThreshold: '< 10%',
    redThreshold: '< 2%',
    getValue: (s) => 8.2
  },
  {
    id: 'cffo_vs_op',
    statement: 'Income Statement',
    metric: 'Cash From Operations vs Operating Profit',
    greenThreshold: 'CFFO > Operating Profit',
    yellowThreshold: 'Net Profit < CFFO',
    redThreshold: 'Net Profit < CFFO (Траен спад)',
    getValue: () => 'CFFO По-висок'
  },
  {
    id: 'ebitda_margin',
    statement: 'Income Statement',
    metric: 'EBITDA Margin',
    greenThreshold: '20%+',
    yellowThreshold: '< 10%',
    redThreshold: '< 3%',
    getValue: () => 28.5
  },
  {
    id: 'net_margin',
    statement: 'Income Statement',
    metric: 'Net Margin (Чист марж)',
    greenThreshold: '17%+',
    yellowThreshold: '< 5%',
    redThreshold: '< 1%',
    getValue: () => 25.9
  },
  {
    id: 'direct_costs',
    statement: 'Income Statement',
    metric: 'Direct Costs Growth vs Sales',
    greenThreshold: 'Разходите растат по-бавно от продажбите',
    yellowThreshold: 'Разходите растат по-бързо от продажбите',
    redThreshold: 'Значително изпреварващ ръст на разходите',
    getValue: () => 'По-бавен ръст'
  },
  {
    id: 'interest_coverage',
    statement: 'Income Statement',
    metric: 'Interest Coverage Rate (Покритие на лихвите)',
    greenThreshold: '> 5x',
    yellowThreshold: '< 2x',
    redThreshold: '< 1.5x',
    getValue: () => 12.4
  },

  // BALANCE SHEET
  {
    id: 'goodwill',
    statement: 'Balance Sheet',
    metric: 'Goodwill in Assets (% от активите)',
    greenThreshold: '< 10%',
    yellowThreshold: '> 20%',
    redThreshold: '> 30%',
    getValue: () => 4.2
  },
  {
    id: 'debt_equity',
    statement: 'Balance Sheet',
    metric: 'Debt to Equity Ratio (Задлъжнялост)',
    greenThreshold: '< 1.0',
    yellowThreshold: '> 2.0',
    redThreshold: '> 4.0',
    getValue: () => 1.81
  },
  {
    id: 'receivables',
    statement: 'Balance Sheet',
    metric: 'Receivables Growth vs Sales',
    greenThreshold: 'Вземанията растат по-бавно от продажбите',
    yellowThreshold: 'Вземанията растат по-бързо от продажбите',
    redThreshold: 'Вземанията растат драстично по-бързо',
    getValue: () => 'Контролиран ръст'
  },
  {
    id: 'inventories',
    statement: 'Balance Sheet',
    metric: 'Inventory Growth vs Profits',
    greenThreshold: 'Запасите растат по-бавно от печалбата',
    yellowThreshold: 'Запасите растат по-бързо от печалбата',
    redThreshold: 'Свръхнатрупване на запаси',
    getValue: () => 'По-бавен ръст'
  },
  {
    id: 'asset_turnover',
    statement: 'Balance Sheet',
    metric: 'Asset Turnover Ratio (Оборот на активите)',
    greenThreshold: '> 3.0',
    yellowThreshold: '< 1.0',
    redThreshold: '< 0.5',
    getValue: () => 1.15
  },
  {
    id: 'current_assets_liab',
    statement: 'Balance Sheet',
    metric: 'Current Assets vs Current Liabilities',
    greenThreshold: 'Текущите активи са 2x по-високи от пасивите',
    yellowThreshold: 'Текущите активи са по-ниски от пасивите',
    redThreshold: 'Текущите активи са критично по-ниски',
    getValue: () => 'Здравословно съотношение'
  },
  {
    id: 'quick_ratio',
    statement: 'Balance Sheet',
    metric: 'Quick Ratio (Бърза ликвидност)',
    greenThreshold: '1.0+',
    yellowThreshold: '< 0.8',
    redThreshold: '< 0.3',
    getValue: () => 0.95
  },

  // CASH FLOW STATEMENT
  {
    id: 'sbc',
    statement: 'Cash Flow Statement',
    metric: 'Stock-based Compensation (% от Net Income)',
    greenThreshold: '< 5%',
    yellowThreshold: '> 10%',
    redThreshold: '> 20%',
    getValue: () => 3.8
  },
  {
    id: 'capex_net_inc',
    statement: 'Cash Flow Statement',
    metric: 'CapEx of Net Income (% от нетната печалба)',
    greenThreshold: '< 15%',
    yellowThreshold: '> 25%',
    redThreshold: '> 40%',
    getValue: () => 11.2
  },
  {
    id: 'ocf_vs_op_profit',
    statement: 'Cash Flow Statement',
    metric: 'Operating Cash Flow Growth vs Operating Profit',
    greenThreshold: 'OCF расте по-бързо от оперативната печалба',
    yellowThreshold: 'Нисък или отрицателен OCF',
    redThreshold: 'Отрицателен оперативен кеш поток',
    getValue: () => 'Расте по-бързо'
  },
  {
    id: 'fcf_increasing',
    statement: 'Cash Flow Statement',
    metric: 'Free Cash Flow Trend',
    greenThreshold: 'Увеличава се с 10%+',
    yellowThreshold: 'Спадащ FCF',
    redThreshold: 'Спадащ FCF (Свиване)',
    getValue: () => '+12.4%'
  },
  {
    id: 'fcf_vs_net_inc',
    statement: 'Cash Flow Statement',
    metric: 'Free Cash Flow vs Net Income',
    greenThreshold: 'FCF по-висок от Net Income (> 100%)',
    yellowThreshold: 'FCF по-нисък от Net Income',
    redThreshold: 'FCF критично под Net Income',
    getValue: () => '193.13%'
  },
  {
    id: 'cf_to_debt',
    statement: 'Cash Flow Statement',
    metric: 'Cash Flow to Debt Ratio',
    greenThreshold: '> 1.0',
    yellowThreshold: '< 0.3',
    redThreshold: '< 0.1',
    getValue: () => 1.16
  },
  {
    id: 'ocf_to_sales',
    statement: 'Cash Flow Statement',
    metric: 'Operating Cash Flow to Sales',
    greenThreshold: '15%+',
    yellowThreshold: '< 10%',
    redThreshold: '< 5%',
    getValue: () => 28.6
  }
];

export default function FinancialFlagsModal({ isOpen, onClose, stock, stocks = [] }: FinancialFlagsModalProps) {
  const [selectedTicker, setSelectedTicker] = useState<string>(stock?.ticker || 'AAPL');
  const [activeTab, setActiveTab] = useState<'GREEN' | 'YELLOW' | 'RED'>('GREEN');

  if (!isOpen) return null;

  const currentStock = stocks.find(s => s.ticker === selectedTicker) || stock || {
    ticker: selectedTicker,
    companyName: 'Apple Inc.',
    currentPrice: 224.23
  } as Stock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}>
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-bg border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-card/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-ink flex items-center gap-2">
                Financial Statements Flags Analysis
                <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20">
                  Green 🟢 | Yellow 🟡 | Red 🔴 Flags
                </span>
              </h2>
              <p className="text-xs text-ink-faint">Пълен одит на Income Statement, Balance Sheet & Cash Flow Statement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-faint hover:text-ink hover:bg-card-hover transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Tabs */}
        <div className="px-6 py-3 bg-bg/90 border-b border-border/40 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('GREEN')}
              className={`px-4 py-2 rounded-xl font-sans text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'GREEN'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                  : 'bg-card text-ink-muted hover:text-ink border border-border/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>GREEN FLAGS (Зелени сигнали 🟢)</span>
            </button>

            <button
              onClick={() => setActiveTab('YELLOW')}
              className={`px-4 py-2 rounded-xl font-sans text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'YELLOW'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs'
                  : 'bg-card text-ink-muted hover:text-ink border border-border/60'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>YELLOW FLAGS (Внимание 🟡)</span>
            </button>

            <button
              onClick={() => setActiveTab('RED')}
              className={`px-4 py-2 rounded-xl font-sans text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'RED'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs'
                  : 'bg-card text-ink-muted hover:text-ink border border-border/60'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>RED FLAGS (Червени флази 🔴)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-ink-faint uppercase">Актив:</label>
            <select
              value={selectedTicker}
              onChange={(e) => setSelectedTicker(e.target.value)}
              className="bg-card border border-border/60 text-ink text-xs font-mono font-bold rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500"
            >
              {stocks.length > 0 ? (
                stocks.map(s => (
                  <option key={s.ticker} value={s.ticker}>{s.ticker} - {s.companyName}</option>
                ))
              ) : (
                <option value={currentStock.ticker}>{currentStock.ticker} - {currentStock.companyName}</option>
              )}
            </select>
          </div>
        </div>

        {/* Content Table Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {['Income Statement', 'Balance Sheet', 'Cash Flow Statement'].map((stmt) => {
            const rules = FINANCIAL_FLAGS_RULES.filter(r => r.statement === stmt);

            let headerBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            if (activeTab === 'YELLOW') headerBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            if (activeTab === 'RED') headerBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

            return (
              <div key={stmt} className="space-y-3">
                <div className={`px-4 py-2 rounded-xl border font-extrabold text-xs tracking-wider uppercase flex items-center justify-between ${headerBg}`}>
                  <span>📊 {stmt}</span>
                  <span className="text-[10px] font-mono opacity-80">{rules.length} показателя</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rules.map((rule) => {
                    let thresholdText = rule.greenThreshold;
                    let badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
                    if (activeTab === 'YELLOW') {
                      thresholdText = rule.yellowThreshold;
                      badgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
                    } else if (activeTab === 'RED') {
                      thresholdText = rule.redThreshold;
                      badgeColor = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
                    }

                    return (
                      <div key={rule.id} className="p-3.5 rounded-xl bg-card/50 border border-border/40 flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <span className="font-extrabold text-ink text-xs block">{rule.metric}</span>
                          <span className="text-[11px] text-ink-faint block font-mono">
                            Критерий ({activeTab}): <strong className="text-ink">{thresholdText}</strong>
                          </span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold shrink-0 ${badgeColor}`}>
                          {thresholdText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border/60 bg-card/70 flex items-center justify-between shrink-0">
          <span className="text-xs text-ink-faint">
            Всички критерии за 🟢 Green, 🟡 Yellow и 🔴 Red Flags са базирани на финансовите модели на <strong>BojanFin</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Затвори
          </button>
        </div>

      </div>
    </div>
  );
}
