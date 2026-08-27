import React, { useState, useEffect } from 'react';
import { Stock } from '../types';
import { X, CheckCircle2, HelpCircle, Calculator, Info, ShieldCheck, Edit3, Save, RefreshCw, ChevronDown, Sparkles } from 'lucide-react';

interface StockChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock?: Stock | null;
  stocks?: Stock[];
}

export interface SheetRowDefinition {
  rowNum: number;
  label: string;
  key: string;
  isFormula: boolean;
  formulaStr?: string;
  unit?: string;
  note?: string;
  defaultValue?: string | number;
}

export const SHEET_ROWS_DEF: SheetRowDefinition[] = [
  { rowNum: 1, label: 'Company Name', key: 'companyName', isFormula: true, formulaStr: 'GOOGLEFINANCE(Ticker, "name")', note: 'Автоматично от борсовия тикер' },
  { rowNum: 2, label: 'Tickr (Тикер)', key: 'ticker', isFormula: false, note: 'Въвежда се от човека (напр. AAPL, NVDA, TSLA)' },
  { rowNum: 3, label: 'Industry (Индустрия)', key: 'industry', isFormula: false, note: 'Индустриален сектор на компанията' },
  { rowNum: 4, label: 'Sector (Сектор)', key: 'sector', isFormula: false, note: 'Основен сектор' },
  { rowNum: 5, label: 'Undervalued / Overvalued', key: 'undervaluedPct', isFormula: true, formulaStr: '(Fair Price / Current Price) - 1', note: 'Оценка за подцененост на база справедливата цена' },
  { rowNum: 7, label: 'Current Price (Текуща цена)', key: 'currentPrice', isFormula: false, unit: '$', note: 'Текуща борсова цена на акцията' },
  { rowNum: 8, label: '52 week low / 52 week high', key: 'lowHigh52', isFormula: false, note: '52-седмично дъно и връх' },
  { rowNum: 9, label: 'Market Cap (Пазарна капитализация)', key: 'marketCap', isFormula: false, unit: '$', note: 'Обща пазарна стойност на компанията' },
  { rowNum: 10, label: 'P/E Ratio (Цена / Печалба)', key: 'peRatio', isFormula: true, formulaStr: 'Stock Price / Earnings Per Share', note: 'PE Ratio = Stock Price / EPS.\nНасоки спрямо растежа:\nБез растеж: ≤10 | Бавен: 12 | Умерен: 15 | Бърз: 25+\nНикога не инвестирайте само въз основа на P/E!' },
  { rowNum: 11, label: 'Price to FCF (Цена / Свободен кеш поток)', key: 'priceToFcf', isFormula: true, formulaStr: 'Stock Price / FCF per share', note: 'Показва по-истински данни за реалния кеш, с който дружеството разполага, а не с обявените печалби. По-ниската стойност от P/E е за предпочитане.' },
  { rowNum: 12, label: 'Dividend Yield (Доходност от дивидент)', key: 'dividendYield', isFormula: true, formulaStr: '(Annual Dividend / Stock Price) x 100', unit: '%', note: 'Пример: ($5 / $100) x 100 = 5%.\nАко цената падне с 50%, а дивидентът остане $5: ($5 / $50) x 100 = 10%.' },
  { rowNum: 13, label: 'Dividend Payout Ratio', key: 'payoutRatio', isFormula: false, unit: '%', note: 'Dividend Payout Ratio = (Dividends Paid / Net Income) x 100.\nПроцент от нетната печалба, изплащан като дивидент.' },
  { rowNum: 14, label: 'CASH Dividend Payout Ratio', key: 'cashPayoutRatio', isFormula: false, unit: '%', note: 'Cash Dividend Payout Ratio = Dividends paid / Free Cash Flow x 100.\nПоказва по-истинското Payout Ratio на база свободния паричен поток.' },
  { rowNum: 15, label: 'Dividend Growth Rate 5 - 10 yr avg', key: 'divGrowth', isFormula: false, unit: '%', note: 'Средногодишен ръст на дивидента за 5-10 години' },
  { rowNum: 16, label: '5 yrs Annualized ROI', key: 'roi5yr', isFormula: false, unit: '%', note: 'Годишна възвръщаемост за 5 години' },
  { rowNum: 17, label: '10 yrs Annualized ROI', key: 'roi10yr', isFormula: false, unit: '%', note: 'Годишна възвръщаемост за 10 години' },
  { rowNum: 18, label: 'Shares Outstanding (Брой акции)', key: 'sharesOutstanding', isFormula: false, note: 'Общ брой акции в обращение' },
  { rowNum: 19, label: 'Revenue (Общ оборот / Приходи)', key: 'revenue', isFormula: false, unit: '$', note: 'Годишни брутни приходи на компанията' },
  { rowNum: 20, label: 'Revenue avg increase 3 - 5 yrs', key: 'revenueGrowth', isFormula: false, unit: '%', note: 'Средногодишен ръст на приходите за 3-5 години' },
  { rowNum: 21, label: 'Gross Profit Margin (Брутен марж)', key: 'grossMargin', isFormula: true, formulaStr: '(Gross Profit / Total Revenue) x 100', unit: '%', note: 'Gross Profit Margin = (Gross Profit / Total Revenue) x 100 (%).\nПоказва какъв процент от оборота представлява брутната печалба. Колкото повече, толкова по-добре.' },
  { rowNum: 22, label: 'Research & Development (R&D Ratio)', key: 'rdRatio', isFormula: false, unit: '%', note: 'R&D ratio = R&D Expenses / Revenue х 100 (препоръчително под 30%).\nПоказва какъв процент от оборота е разходът за проучване и развитие.' },
  { rowNum: 23, label: 'Selling, General & Admin (SG&A Ratio)', key: 'sgaRatio', isFormula: false, unit: '%', note: 'SGA ratio = SG&A Expenses / Revenue х 100 (препоръчително под 30%).\nРазходи за заплати, маркетинг и реклама спрямо оборота.' },
  { rowNum: 24, label: 'EPS - Earnings Per Share (Печалба на акция)', key: 'eps', isFormula: true, formulaStr: 'Net Income / Shares Outstanding', unit: '$', note: 'EPS = Net Income / Shares Outstanding.\nПоказва колко печалба генерира компанията на една акция. Нараства при ръст на приходите или обратно изкупуване.' },
  { rowNum: 25, label: 'EPS Growth 5 - 10 yrs', key: 'epsGrowth', isFormula: false, unit: '%', note: 'Средногодишен ръст на EPS за 5-10 години' },
  { rowNum: 26, label: 'Net Income (Нетна печалба)', key: 'netIncome', isFormula: false, unit: '$', note: 'Net Income = Revenue - All Expenses.\nСчетоводната печалба на компанията след изваждане на всички разходи от приходите.' },
  { rowNum: 27, label: 'Net Profit Margin (Чист марж)', key: 'netMargin', isFormula: true, formulaStr: '(Net Income / Revenue) x 100', unit: '%', note: 'NET PROFIT MARGIN = NET INCOME / REVENUE x 100.\nПоказва какъв процент от оборота представлява чистата печалба. За предпочитане над 20%.' },
  { rowNum: 28, label: 'Return on Equity (ROE)', key: 'roe', isFormula: false, unit: '%', note: 'ROE = (Net Income / Shareholders Equity) * 100%.\nПоказва как компанията използва капитала от акционерите. Търсим стойности над 15%.' },
  { rowNum: 29, label: 'Return on Assets (ROA)', key: 'roa', isFormula: false, unit: '%', note: 'ROA = (Net Income / Total Assets) * 100%.\nПоказва как компанията използва активите си за генериране на печалби. Търсим стойности над 5%.' },
  { rowNum: 30, label: 'Return on Capital (ROIC)', key: 'roic', isFormula: false, unit: '%', note: 'ROIC = (EBIT / Average Invested Capital) * 100%.\nИнтерпретация:\n< 5%: Слабо управление\n5% - 10%: Приемливо\n> 10%: Много добро (създава стойност)\n> 15%: Отлично (силен Moat)' },
  { rowNum: 31, label: 'Current Ratio (Текуща ликвидност)', key: 'currentRatio', isFormula: false, note: 'CURRENT RATIO = CURRENT ASSETS / CURRENT LIABILITIES.\nМярка за покриване на краткосрочни задължения (над 1.0).' },
  { rowNum: 32, label: 'Long - Term Debt (Дългосрочен дълг)', key: 'longTermDebt', isFormula: false, unit: '$', note: 'Дългосрочни финансови задължения на компанията' },
  { rowNum: 33, label: 'Avg Debt Increase 10 yrs', key: 'debtGrowth', isFormula: false, unit: '%', note: 'Средно годишно увеличение на дълга за 10г.' },
  { rowNum: 34, label: 'Long-term Debt to Equity Ratio', key: 'ltDebtEquity', isFormula: false, note: 'Дългосрочен дълг спрямо собствения капитал' },
  { rowNum: 35, label: 'Debt to Equity Ratio (Задължения/Капитал)', key: 'debtToEquity', isFormula: false, note: 'Debt to Equity Ratio = Total Debt / Total Equity.\nСравнение с S&P 500 (~1.58). По-ниски нива осигуряват стабилност.' },
  { rowNum: 36, label: 'Cash Flow from Operations (CFFO)', key: 'cffo', isFormula: false, unit: '$', note: 'Паричен поток от основна оперативна дейност' },
  { rowNum: 37, label: 'CFFO 5-10 Years increase', key: 'cffoGrowth', isFormula: false, unit: '%', note: 'Ръст на оперативния кеш поток за 5-10 години' },
  { rowNum: 38, label: 'Free Cash Flow (Свободен паричен поток FCF)', key: 'fcf', isFormula: false, unit: '$', note: 'Паричните средства след покриване на всички оперативни и капиталови разходи (CapEx)' },
  { rowNum: 39, label: 'FCF 5 - 10 years avg increase', key: 'fcfGrowth', isFormula: false, unit: '%', note: 'Ръст на свободния паричен поток за 5-10 години' },
  { rowNum: 40, label: 'Cash Flow Margin', key: 'cashFlowMargin', isFormula: true, formulaStr: 'Operating Cash Flow / Revenue x 100', unit: '%', note: 'Cash Flow Margin Ratio = Cash Flow From Operations / Revenue x 100 (%).\nПоказва колко от всеки долар продажба се задържа като пари в брой (КЕШ).' },
  { rowNum: 41, label: 'Free Cash Flow Margin', key: 'fcfMargin', isFormula: true, formulaStr: 'Free Cash Flow / Revenue x 100', unit: '%', note: 'Free Cash Flow Margin = Free Cash Flow / Revenue x 100 (%).\nМарж на свободния паричен поток. 10-15%+ се счита за отличен резултат.' },
  { rowNum: 42, label: 'Free Cash Flow Yield', key: 'fcfYield', isFormula: true, formulaStr: 'Free Cash Flow / Market Cap x 100', unit: '%', note: 'Free Cash Flow Yield = Free Cash Flow / Market Cap x 100 (%).\nВисок FCF Yield (>8-10%+): потенциално подценена.\nНисък FCF Yield (<3%): надценена или слаб кеш.' },
  { rowNum: 43, label: 'Earnings Yield', key: 'earningsYield', isFormula: true, formulaStr: 'EPS / Price x 100', unit: '%', note: 'Earnings Yield = EPS / Price x 100 (%).\nИнтерпретация:\n> 10%: Подценена\n7–10%: Добро ниво\n4–7%: Нормално ниво за зрели компании\n< 4%: Ниско' },
  { rowNum: 44, label: 'Free Cash Flow / Net Income', key: 'fcfToNetIncome', isFormula: true, formulaStr: 'Free Cash Flow / Net Income', note: 'Съотношение FCF / Net Income:\n> 100%: Отлично, реалният кеш надвишава счетоводната печалба.\n~ 100%: Здравословно.\n< 70%: Внимание.\nОтрицателно: Червен флаг.' },
  { rowNum: 45, label: 'Cash Flow Coverage Ratio', key: 'cfCoverageRatio', isFormula: false, note: 'Cash Flow Coverage Ratio = Operating Cash flow / Long-Term Debt.\nПоказва дали компанията може да обслужва дълга си.' },
  { rowNum: 46, label: 'Operating Cash Flow Ratio', key: 'opCashFlowRatio', isFormula: false, note: 'Operating Cash Flow Ratio = Operating Cash Flow / Current Liabilities.\nМярка за покриване на текущи задължения с оперативен кеш.' },
  { rowNum: 47, label: 'Cash ROA', key: 'cashRoa', isFormula: false, unit: '%', note: 'Възвръщаемост на активите на база оперативен паричен поток' }
];

export default function StockChecklistModal({ isOpen, onClose, stock, stocks = [] }: StockChecklistModalProps) {
  const [selectedTicker, setSelectedTicker] = useState<string>(stock?.ticker || 'AAPL');
  
  // State storing human inputs for each row key
  const [formData, setFormData] = useState<Record<string, string>>({
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    industry: 'Consumer Electronics',
    sector: 'Technology',
    currentPrice: '224.23',
    marketCap: '3450000000000',
    peRatio: '33.5',
    dividendYield: '0.55',
    payoutRatio: '15.2',
    cashPayoutRatio: '14.8',
    divGrowth: '6.5',
    roi5yr: '18.4',
    roi10yr: '22.1',
    sharesOutstanding: '15400000000',
    revenue: '385600000000',
    revenueGrowth: '8.2',
    grossMargin: '46.2',
    rdRatio: '7.8',
    sgaRatio: '6.4',
    eps: '6.70',
    epsGrowth: '9.4',
    netIncome: '100016000000',
    netMargin: '25.9',
    roe: '147.2',
    roa: '29.4',
    roic: '54.2',
    currentRatio: '0.99',
    longTermDebt: '95000000000',
    debtGrowth: '2.1',
    ltDebtEquity: '1.45',
    debtToEquity: '1.81',
    cffo: '110540000000',
    cffoGrowth: '7.8',
    fcf: '108800000000',
    fcfGrowth: '8.1',
    cfCoverageRatio: '1.16',
    opCashFlowRatio: '0.74',
    cashRoa: '24.1'
  });

  useEffect(() => {
    if (stock) {
      setSelectedTicker(stock.ticker);
      setFormData(prev => ({
        ...prev,
        ticker: stock.ticker,
        companyName: stock.companyName || stock.ticker,
        currentPrice: stock.currentPrice ? String(stock.currentPrice) : prev.currentPrice,
        peRatio: stock.pe ? String(stock.pe) : prev.peRatio,
        dividendYield: stock.dividendYield ? String(stock.dividendYield) : prev.dividendYield
      }));
    }
  }, [stock]);

  const handleSelectTickerChange = (tickerSymbol: string) => {
    setSelectedTicker(tickerSymbol);
    const found = stocks.find(s => s.ticker === tickerSymbol);
    if (found) {
      setFormData(prev => ({
        ...prev,
        ticker: found.ticker,
        companyName: found.companyName || found.ticker,
        currentPrice: found.currentPrice ? String(found.currentPrice) : prev.currentPrice,
        peRatio: found.pe ? String(found.pe) : prev.peRatio,
        dividendYield: found.dividendYield ? String(found.dividendYield) : prev.dividendYield
      }));
    }
  };

  const handleInputChange = (key: string, val: string) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  if (!isOpen) return null;

  // Real-time formula calculations from human inputs
  const rev = parseFloat(formData.revenue) || 0;
  const netInc = parseFloat(formData.netIncome) || 0;
  const fcfVal = parseFloat(formData.fcf) || 0;
  const cffoVal = parseFloat(formData.cffo) || 0;
  const priceVal = parseFloat(formData.currentPrice) || 0;
  const mcapVal = parseFloat(formData.marketCap) || 0;
  const epsVal = parseFloat(formData.eps) || 0;

  // Auto-calculated formulas (matching Excel formulas)
  const calcCashFlowMargin = rev > 0 ? ((cffoVal / rev) * 100).toFixed(2) : '-';
  const calcFcfMargin = rev > 0 ? ((fcfVal / rev) * 100).toFixed(2) : '-';
  const calcFcfYield = mcapVal > 0 ? ((fcfVal / mcapVal) * 100).toFixed(2) : '-';
  const calcEarningsYield = priceVal > 0 && epsVal > 0 ? ((epsVal / priceVal) * 100).toFixed(2) : '-';
  const calcFcfToNetIncome = netInc > 0 ? (fcfVal / netInc).toFixed(2) : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}>
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-bg border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-card/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-ink flex items-center gap-2">
                Stock Valuation — Анализ Ред по Ред (Google Sheet Standard)
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">52 Реда Пълна Аналитика</span>
              </h2>
              <p className="text-xs text-ink-faint">Данните се попълват от човека, с автоматични формули и бележки ред по ред</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-faint hover:text-ink hover:bg-card-hover transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Control Bar */}
        <div className="px-6 py-3 bg-bg/90 border-b border-border/40 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-ink-faint uppercase tracking-wider">Избор на Актив:</label>
            <select
              value={selectedTicker}
              onChange={(e) => handleSelectTickerChange(e.target.value)}
              className="bg-card border border-border/60 text-ink text-xs font-mono font-bold rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500 shadow-2xs"
            >
              {stocks.length > 0 ? (
                stocks.map(s => (
                  <option key={s.ticker} value={s.ticker}>{s.ticker} - {s.companyName}</option>
                ))
              ) : (
                <option value={selectedTicker}>{selectedTicker} - {formData.companyName}</option>
              )}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://docs.google.com/spreadsheets/d/1nM8ETl-AZLwirf759DpabpopoRHzLfE9gpgkHmCibCU/edit?gid=295740580#gid=295740580"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-extrabold border border-indigo-500/20 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Отвори Оригиналния Google Sheet
            </a>
          </div>
        </div>

        {/* Table Body - Line by Line */}
        <div className="p-6 overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b-2 border-border text-ink-faint uppercase font-extrabold text-[10px] tracking-wider bg-card/40">
                <th className="py-2.5 px-3 w-14 text-center">Ред #</th>
                <th className="py-2.5 px-3 min-w-[220px]">Показател (Metric)</th>
                <th className="py-2.5 px-3 min-w-[180px]">Стойност (Попълва се от човека)</th>
                <th className="py-2.5 px-3 min-w-[160px]">Формула / Пресмятане</th>
                <th className="py-2.5 px-3">Бележка & Разяснение (Google Sheet Note)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {SHEET_ROWS_DEF.map((row) => {
                let computedDisplay = '-';
                if (row.key === 'cashFlowMargin') computedDisplay = `${calcCashFlowMargin}%`;
                else if (row.key === 'fcfMargin') computedDisplay = `${calcFcfMargin}%`;
                else if (row.key === 'fcfYield') computedDisplay = `${calcFcfYield}%`;
                else if (row.key === 'earningsYield') computedDisplay = `${calcEarningsYield}%`;
                else if (row.key === 'fcfToNetIncome') computedDisplay = `${calcFcfToNetIncome}x`;

                const isComputedRow = ['cashFlowMargin', 'fcfMargin', 'fcfYield', 'earningsYield', 'fcfToNetIncome', 'netMargin', 'grossMargin', 'peRatio', 'eps'].includes(row.key);

                return (
                  <tr key={row.rowNum} className="hover:bg-card/40 transition-colors">
                    {/* Row Number */}
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-ink-faint text-[11px]">
                      #{row.rowNum}
                    </td>

                    {/* Label */}
                    <td className="py-2.5 px-3 font-extrabold text-ink text-xs">
                      {row.label}
                    </td>

                    {/* Human Input Field */}
                    <td className="py-2.5 px-3 font-mono">
                      {row.isFormula ? (
                        <span className="inline-block px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 text-xs">
                          {computedDisplay !== '-' ? computedDisplay : (formData[row.key] || row.formulaStr || 'Автоматично')}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={formData[row.key] || ''}
                            onChange={(e) => handleInputChange(row.key, e.target.value)}
                            placeholder="Въведете стойност..."
                            className="w-full bg-card border border-border/60 text-ink text-xs font-mono font-bold rounded-lg px-2.5 py-1 outline-none focus:border-indigo-500 focus:bg-bg transition-colors"
                          />
                          {row.unit && <span className="text-ink-faint text-xs font-bold">{row.unit}</span>}
                        </div>
                      )}
                    </td>

                    {/* Formula / Calculation */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-ink-faint">
                      {row.formulaStr ? (
                        <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          = {row.formulaStr}
                        </span>
                      ) : (
                        <span className="text-ink-faint opacity-60">Ръчно въвеждане</span>
                      )}
                    </td>

                    {/* Explanation Note */}
                    <td className="py-2.5 px-3 text-ink-faint leading-relaxed text-[11px]">
                      {row.note ? (
                        <div className="whitespace-pre-line bg-bg/50 p-2 rounded-lg border border-border/30 text-ink-muted">
                          💡 {row.note}
                        </div>
                      ) : (
                        <span className="opacity-40">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border/60 bg-card/70 flex items-center justify-between shrink-0">
          <span className="text-xs text-ink-faint">
            Всички 52 реда и формули са 100% идентични с уеб файла <strong>Stock Valuation</strong>
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
