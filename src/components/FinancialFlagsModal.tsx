import React, { useState, useEffect, useMemo } from 'react';
import { Stock } from '../types';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  FileText,
  Search
} from 'lucide-react';

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
  description: string;
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
    description: 'Показва ценова сила и конкурентно предимство (Moat) при производство и продажби.',
    greenThreshold: '40%+',
    yellowThreshold: '< 30%',
    redThreshold: '< 10%'
  },
  {
    id: 'rev_growth',
    statement: 'Income Statement',
    metric: 'Revenue Growth Rate (Ръст на приходите)',
    description: 'Годишен темп на нарастване на общите приходи от продажби.',
    greenThreshold: '15%+',
    yellowThreshold: '< 10%',
    redThreshold: '< 2%'
  },
  {
    id: 'cffo_vs_op',
    statement: 'Income Statement',
    metric: 'Cash From Operations vs Operating Profit',
    description: 'Качество на печалбата – дали паричният поток потвърждава счетоводната печалба.',
    greenThreshold: 'CFFO > Operating Profit',
    yellowThreshold: 'Net Profit < CFFO',
    redThreshold: 'Net Profit < CFFO (Траен спад)'
  },
  {
    id: 'ebitda_margin',
    statement: 'Income Statement',
    metric: 'EBITDA Margin',
    description: 'Оперативна рентабилност преди данъци, лихви и амортизации.',
    greenThreshold: '20%+',
    yellowThreshold: '< 10%',
    redThreshold: '< 3%'
  },
  {
    id: 'net_margin',
    statement: 'Income Statement',
    metric: 'Net Margin (Чист марж)',
    description: 'Чиста нетна печалба след всички разходи като процент от приходите.',
    greenThreshold: '17%+',
    yellowThreshold: '< 5%',
    redThreshold: '< 1%'
  },
  {
    id: 'direct_costs',
    statement: 'Income Statement',
    metric: 'Direct Costs Growth vs Sales',
    description: 'Оперативен ливъридж – разходите за единица продукция спрямо продажбите.',
    greenThreshold: 'Разходите растат по-бавно от продажбите',
    yellowThreshold: 'Разходите растат по-бързо от продажбите',
    redThreshold: 'Значително изпреварващ ръст на разходите'
  },
  {
    id: 'interest_coverage',
    statement: 'Income Statement',
    metric: 'Interest Coverage Rate (Покритие на лихвите)',
    description: 'Способност за безпроблемно изплащане на лихвите по заемите (EBIT / Лихви).',
    greenThreshold: '> 5x',
    yellowThreshold: '< 2x',
    redThreshold: '< 1.5x'
  },

  // BALANCE SHEET
  {
    id: 'goodwill',
    statement: 'Balance Sheet',
    metric: 'Goodwill in Assets (% репутация от активите)',
    description: 'Високият Goodwill крие риск от бъдещи обезценки (write-downs) при придобивания.',
    greenThreshold: '< 10%',
    yellowThreshold: '> 20%',
    redThreshold: '> 30%'
  },
  {
    id: 'debt_equity',
    statement: 'Balance Sheet',
    metric: 'Debt to Equity Ratio (Дълг към собствен капитал)',
    description: 'Финансов ливъридж и зависимост на дружеството от привлечен заемен капитал.',
    greenThreshold: '< 1.0',
    yellowThreshold: '> 2.0',
    redThreshold: '> 4.0'
  },
  {
    id: 'receivables',
    statement: 'Balance Sheet',
    metric: 'Receivables Growth vs Sales (Ръст на вземанията)',
    description: 'Ако вземанията изпреварват приходите, клиентите бавят плащания или качеството спада.',
    greenThreshold: 'Вземанията растат по-бавно от продажбите',
    yellowThreshold: 'Вземанията растат по-бързо от продажбите',
    redThreshold: 'Вземанията растат драстично по-бързо'
  },
  {
    id: 'inventories',
    statement: 'Balance Sheet',
    metric: 'Inventory Growth vs Profits (Ръст на запасите)',
    description: 'Залежаване на стоки в склад спрямо темпа на печалба (риск от брак/намаления).',
    greenThreshold: 'Запасите растат по-бавно от печалбата',
    yellowThreshold: 'Запасите растат по-бързо от печалбата',
    redThreshold: 'Свръхнатрупване на запаси'
  },
  {
    id: 'asset_turnover',
    statement: 'Balance Sheet',
    metric: 'Asset Turnover Ratio (Оборот на активите)',
    description: 'Ефективност на генериране на продажби от всеки долар активи (Sales / Total Assets).',
    greenThreshold: '> 3.0',
    yellowThreshold: '< 1.0',
    redThreshold: '< 0.5'
  },
  {
    id: 'current_assets_liab',
    statement: 'Balance Sheet',
    metric: 'Current Assets vs Current Liabilities',
    description: 'Краткосрочна платежоспособност и ликвиден буфер на дружеството.',
    greenThreshold: 'Текущите активи са 2x по-високи от пасивите',
    yellowThreshold: 'Текущите активи са по-ниски от пасивите',
    redThreshold: 'Текущите активи са критично по-ниски'
  },
  {
    id: 'quick_ratio',
    statement: 'Balance Sheet',
    metric: 'Quick Ratio (Бърза ликвидност - Acid Test)',
    description: 'Ликвидност без разчитане на продажбата на наличните складови запаси.',
    greenThreshold: '1.0+',
    yellowThreshold: '< 0.8',
    redThreshold: '< 0.3'
  },

  // CASH FLOW STATEMENT
  {
    id: 'sbc',
    statement: 'Cash Flow Statement',
    metric: 'Stock-based Compensation (% от Net Income)',
    description: 'Разреждане на акционерите чрез компенсации в акции към ръководството.',
    greenThreshold: '< 5%',
    yellowThreshold: '> 10%',
    redThreshold: '> 20%'
  },
  {
    id: 'capex_net_inc',
    statement: 'Cash Flow Statement',
    metric: 'CapEx of Net Income (Капиталови разходи от печалбата)',
    description: 'Капиталоемкост на бизнеса. Леките бизнеси инвестират малко CapEx за поддържане.',
    greenThreshold: '< 15%',
    yellowThreshold: '> 25%',
    redThreshold: '> 40%'
  },
  {
    id: 'ocf_vs_op_profit',
    statement: 'Cash Flow Statement',
    metric: 'Operating Cash Flow Growth vs Operating Profit',
    description: 'Дали бизнесът реално генерира нарастващ свободен кеш от оперативната си дейност.',
    greenThreshold: 'OCF расте по-бързо от оперативната печалба',
    yellowThreshold: 'Нисък или забавящ се OCF',
    redThreshold: 'Отрицателен оперативен кеш поток'
  },
  {
    id: 'fcf_increasing',
    statement: 'Cash Flow Statement',
    metric: 'Free Cash Flow Trend (Тенденция на FCF)',
    description: 'Основен двигател за дивиденти, обратно изкупуване и реинвестиране.',
    greenThreshold: 'Увеличава се с 10%+',
    yellowThreshold: 'Спадащ FCF',
    redThreshold: 'Спадащ FCF (Свиване / Отрицателен)'
  },
  {
    id: 'fcf_vs_net_inc',
    statement: 'Cash Flow Statement',
    metric: 'Free Cash Flow vs Net Income (FCF конверсия)',
    description: 'Качество на печалбата – FCF конверсия над 100% означава силен паричен поток.',
    greenThreshold: 'FCF по-висок от Net Income (> 100%)',
    yellowThreshold: 'FCF по-нисък от Net Income',
    redThreshold: 'FCF критично под Net Income'
  },
  {
    id: 'cf_to_debt',
    statement: 'Cash Flow Statement',
    metric: 'Cash Flow to Debt Ratio (Кеш поток към дълг)',
    description: 'Колко бързо оперативният кеш поток може да погаси пълния размер на дълга.',
    greenThreshold: '> 1.0',
    yellowThreshold: '< 0.3',
    redThreshold: '< 0.1'
  },
  {
    id: 'ocf_to_sales',
    statement: 'Cash Flow Statement',
    metric: 'Operating Cash Flow to Sales (OCF марж)',
    description: 'Каква част от всеки долар приходи се превръща директно в оперативен кеш.',
    greenThreshold: '15%+',
    yellowThreshold: '< 10%',
    redThreshold: '< 5%'
  }
];

export default function FinancialFlagsModal({ isOpen, onClose, stock, stocks = [] }: FinancialFlagsModalProps) {
  const [selectedTicker, setSelectedTicker] = useState<string>(stock?.ticker || 'AAPL');
  const [statementFilter, setStatementFilter] = useState<'ALL' | 'Income Statement' | 'Balance Sheet' | 'Cash Flow Statement'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync selectedTicker when stock prop changes or modal opens
  useEffect(() => {
    if (stock?.ticker) {
      setSelectedTicker(stock.ticker.toUpperCase().trim());
    } else if (stocks.length > 0 && (!selectedTicker || selectedTicker === 'AAPL')) {
      setSelectedTicker(stocks[0].ticker);
    }
  }, [stock, isOpen]);

  // Handle ESC key and prevent body scroll when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const currentStock = useMemo(() => {
    return stocks.find(s => s.ticker === selectedTicker) || stock || ({
      ticker: selectedTicker,
      companyName: 'Apple Inc.',
      currentPrice: 224.23,
      peRatio: 33.5,
      fairPrice: 240,
      buySell: 'UNDERVALUED'
    } as Stock);
  }, [stocks, selectedTicker, stock]);

  const filteredRules = useMemo(() => {
    return FINANCIAL_FLAGS_RULES.filter(rule => {
      const matchesStatement = statementFilter === 'ALL' || rule.statement === statementFilter;
      const matchesSearch = !searchQuery.trim() || 
        rule.metric.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.statement.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatement && matchesSearch;
    });
  }, [statementFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl max-h-[92vh] bg-card text-ink border-2 border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-border/80 bg-card/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-ink tracking-tight">
                  Financial Statements Flags Matrix
                </h2>
                <span className="text-[11px] font-mono font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  🟢 Зелен | 🟡 Внимание | 🔴 Риск
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                Пълен одит на финансовите отчети по критериите на BojanFin (21 ключови правила)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stock selector & quick badge */}
            <div className="flex items-center gap-2 bg-bg/80 border border-border/70 rounded-2xl px-3 py-1.5 shadow-2xs">
              <span className="text-[11px] font-extrabold text-ink-faint uppercase tracking-wider">Компания:</span>
              <select
                value={selectedTicker}
                onChange={(e) => setSelectedTicker(e.target.value)}
                className="bg-transparent text-ink text-xs font-mono font-black outline-none cursor-pointer max-w-[160px] sm:max-w-[200px] truncate"
              >
                {stocks.length > 0 ? (
                  stocks.map(s => (
                    <option key={s.ticker} value={s.ticker} className="bg-card text-ink">
                      {s.ticker} — {s.companyName}
                    </option>
                  ))
                ) : (
                  <option value={currentStock.ticker} className="bg-card text-ink">
                    {currentStock.ticker} — {currentStock.companyName}
                  </option>
                )}
              </select>

              {currentStock.currentPrice != null && (
                <span className="hidden sm:inline-block text-[11px] font-mono font-extrabold text-emerald-400 pl-1 border-l border-border/60">
                  ${currentStock.currentPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-ink-faint hover:text-ink hover:bg-bg border border-transparent hover:border-border/60 transition-all cursor-pointer"
              title="Затвори (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="px-6 py-3 bg-bg/80 border-b border-border/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Statement Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatementFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-sans text-xs font-black transition-all cursor-pointer ${
                statementFilter === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-card text-ink-muted hover:text-ink border border-border/60 hover:bg-card-hover'
              }`}
            >
              📊 Всички отчети (21)
            </button>

            <button
              onClick={() => setStatementFilter('Income Statement')}
              className={`px-3 py-1.5 rounded-xl font-sans text-xs font-black transition-all cursor-pointer ${
                statementFilter === 'Income Statement'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-card text-ink-muted hover:text-ink border border-border/60 hover:bg-card-hover'
              }`}
            >
              📈 Income Statement (7)
            </button>

            <button
              onClick={() => setStatementFilter('Balance Sheet')}
              className={`px-3 py-1.5 rounded-xl font-sans text-xs font-black transition-all cursor-pointer ${
                statementFilter === 'Balance Sheet'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-card text-ink-muted hover:text-ink border border-border/60 hover:bg-card-hover'
              }`}
            >
              📑 Balance Sheet (7)
            </button>

            <button
              onClick={() => setStatementFilter('Cash Flow Statement')}
              className={`px-3 py-1.5 rounded-xl font-sans text-xs font-black transition-all cursor-pointer ${
                statementFilter === 'Cash Flow Statement'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-card text-ink-muted hover:text-ink border border-border/60 hover:bg-card-hover'
              }`}
            >
              💰 Cash Flow (7)
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              placeholder="Търси показател (Margin, Debt, FCF...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-card border border-border/60 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Legend Banner */}
        <div className="px-6 py-2.5 bg-card/60 border-b border-border/40 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span><strong>🟢 Green Flag:</strong> Здравословно / Отлично конкурентно предимство</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span><strong>🟡 Yellow Flag:</strong> Внимание / Нужен е по-детайлен анализ</span>
          </div>
          <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span><strong>🔴 Red Flag:</strong> Червен сигнал / Потенциален структурен риск</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          {filteredRules.length === 0 ? (
            <div className="py-16 text-center text-ink-muted">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-bold">Няма намерени финансови правила за това търсене.</p>
              <button 
                onClick={() => { setSearchQuery(''); setStatementFilter('ALL'); }}
                className="mt-3 px-4 py-1.5 bg-card hover:bg-card-hover border border-border/60 text-xs font-bold rounded-xl cursor-pointer"
              >
                Изчисти филтрите
              </button>
            </div>
          ) : (
            // Group rules by statement if viewing ALL, otherwise single list
            (['Income Statement', 'Balance Sheet', 'Cash Flow Statement'] as const)
              .filter(stmt => statementFilter === 'ALL' || statementFilter === stmt)
              .map(stmt => {
                const rulesInStatement = filteredRules.filter(r => r.statement === stmt);
                if (rulesInStatement.length === 0) return null;

                const icon = stmt === 'Income Statement' 
                  ? <TrendingUp className="w-4 h-4 text-indigo-400" />
                  : stmt === 'Balance Sheet'
                  ? <PieChart className="w-4 h-4 text-cyan-400" />
                  : <DollarSign className="w-4 h-4 text-emerald-400" />;

                return (
                  <div key={stmt} className="space-y-3">
                    {/* Section Header */}
                    <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-card border border-border/80 shadow-2xs">
                      <div className="flex items-center gap-2 font-black text-xs text-ink uppercase tracking-wider">
                        {icon}
                        <span>{stmt}</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-ink-faint">
                        {rulesInStatement.length} {rulesInStatement.length === 1 ? 'показател' : 'показателя'}
                      </span>
                    </div>

                    {/* Matrix View */}
                    <div className="overflow-hidden border border-border/70 rounded-2xl bg-card/40 shadow-xs">
                      {/* Desktop Table View */}
                      <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-border/70 bg-bg/80 text-[11px] font-black uppercase text-ink-muted tracking-wider">
                              <th className="py-3 px-4 w-[38%]">Показател & Описание</th>
                              <th className="py-3 px-4 w-[20%] text-emerald-400">🟢 Green Flag (Зелен)</th>
                              <th className="py-3 px-4 w-[21%] text-amber-400">🟡 Yellow Flag (Внимание)</th>
                              <th className="py-3 px-4 w-[21%] text-rose-400">🔴 Red Flag (Риск)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40 text-xs">
                            {rulesInStatement.map((rule) => (
                              <tr key={rule.id} className="hover:bg-bg/60 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="font-extrabold text-ink text-xs mb-0.5">
                                    {rule.metric}
                                  </div>
                                  <div className="text-[11px] text-ink-muted leading-relaxed">
                                    {rule.description}
                                  </div>
                                </td>
                                
                                {/* Green Flag */}
                                <td className="py-3 px-4 align-middle">
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-mono font-extrabold text-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>{rule.greenThreshold}</span>
                                  </div>
                                </td>

                                {/* Yellow Flag */}
                                <td className="py-3 px-4 align-middle">
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25 font-mono font-extrabold text-xs">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{rule.yellowThreshold}</span>
                                  </div>
                                </td>

                                {/* Red Flag */}
                                <td className="py-3 px-4 align-middle">
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/25 font-mono font-extrabold text-xs">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{rule.redThreshold}</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile / Tablet Responsive Cards */}
                      <div className="block lg:hidden divide-y divide-border/40">
                        {rulesInStatement.map((rule) => (
                          <div key={rule.id} className="p-4 space-y-3">
                            <div>
                              <div className="font-black text-ink text-sm mb-1">
                                {rule.metric}
                              </div>
                              <p className="text-xs text-ink-muted leading-relaxed">
                                {rule.description}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                              {/* Green */}
                              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col justify-between gap-1">
                                <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Green Flag
                                </span>
                                <span className="text-xs font-mono font-extrabold text-emerald-300">
                                  {rule.greenThreshold}
                                </span>
                              </div>

                              {/* Yellow */}
                              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col justify-between gap-1">
                                <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Yellow Flag
                                </span>
                                <span className="text-xs font-mono font-extrabold text-amber-300">
                                  {rule.yellowThreshold}
                                </span>
                              </div>

                              {/* Red */}
                              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex flex-col justify-between gap-1">
                                <span className="text-[10px] font-black uppercase text-rose-400 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Red Flag
                                </span>
                                <span className="text-xs font-mono font-extrabold text-rose-300">
                                  {rule.redThreshold}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-border/80 bg-card/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Всички критерии за 🟢 Green, 🟡 Yellow и 🔴 Red Flags са базирани на фундаменталния анализ на <strong>BojanFin</strong>.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Затвори
          </button>
        </div>

      </div>
    </div>
  );
}
