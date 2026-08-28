import React, { useState, useEffect } from 'react';
import { Stock } from '../types';
import { X, Table, ExternalLink, Sparkles } from 'lucide-react';

interface StockChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock?: Stock | null;
  stocks?: Stock[];
}

export interface SheetRowDefinition {
  rowNum: number;
  label: string;
  link?: string;
  defaultVal: string;
  cellType: 'yellow-input' | 'green-formula' | 'ref-error' | 'default';
  formulaStr?: string;
  note?: string;
}

export const EXACT_SHEET_ROWS: SheetRowDefinition[] = [
  { rowNum: 1, label: 'Company', defaultVal: '#REF!', cellType: 'ref-error', formulaStr: '=GOOGLEFINANCE(B2, "name")', note: 'Автоматично от борсовия тикер' },
  { rowNum: 2, label: 'Tickr', defaultVal: 'AAPL', cellType: 'yellow-input', note: 'Въвежда се от човека (напр. AAPL, NVDA, TSLA)' },
  { rowNum: 3, label: 'Industry', defaultVal: '#REF!', cellType: 'ref-error', note: 'Индустриален сектор' },
  { rowNum: 4, label: 'Sector', defaultVal: '#REF!', cellType: 'ref-error', note: 'Основен сектор' },
  { rowNum: 5, label: 'Undervalued / Overvalued', defaultVal: '#REF!', cellType: 'green-formula', formulaStr: '=(Fair Price / Current Price) - 1', note: 'Оценка за подцененост на база справедливата цена' },
  { rowNum: 6, label: '', defaultVal: '', cellType: 'default' },
  { rowNum: 7, label: 'Current Price', defaultVal: '#REF!', cellType: 'ref-error', formulaStr: '=GOOGLEFINANCE(B2)', note: 'Текуща борсова цена' },
  { rowNum: 8, label: '52 week low / 52 week high', defaultVal: '#REF! #REF!', cellType: 'ref-error', formulaStr: '=GOOGLEFINANCE(B2, "low52")', note: '52-седмично дъно и връх' },
  { rowNum: 9, label: 'Market Cap', defaultVal: '#REF!', cellType: 'ref-error', formulaStr: '=GOOGLEFINANCE(B2, "marketcap")', note: 'Пазарна капитализация' },
  { rowNum: 10, label: 'P/E Ratio', link: 'https://fullratio.com/pe-ratio-by-industry', defaultVal: '#REF!', cellType: 'yellow-input', formulaStr: '=GOOGLEFINANCE(B2, "pe")', note: 'P/E Ratio (Ниско). Насоки: Без растеж: ≤10 | Бавен: 12 | Умерен: 15 | Бърз: 25+' },
  { rowNum: 11, label: 'Price to FCF', defaultVal: '#REF!', cellType: 'ref-error', formulaStr: '=SUBSTITUTE(index(importhtml(...),7,4),"*","")', note: 'Price to FCF = Stock Price / FCF per share' },
  { rowNum: 12, label: 'Dividend Yield', defaultVal: '#REF! #REF!', cellType: 'ref-error', formulaStr: '=SUBSTITUTE(index(importhtml(...),8,2),"*","")', note: 'Dividend Yield = (Annual Dividend / Stock Price) x 100' },
  { rowNum: 13, label: 'Dividend Payout Ratio', defaultVal: '#REF!', cellType: 'ref-error', formulaStr: '=SUBSTITUTE(index(importhtml(...),12,2),"*","")', note: 'Dividend Payout Ratio = (Dividends Paid / Net Income) x 100' },
  { rowNum: 14, label: 'CASH Dividend Payout Ratio', defaultVal: 'N/A', cellType: 'default', note: 'Cash Dividend Payout Ratio = Dividends paid / Free Cash Flow x 100' },
  { rowNum: 15, label: 'Dividend Growth Rate 5 - 10 year avg', defaultVal: 'N/A N/A', cellType: 'default', note: 'Средногодишен ръст на дивидента' },
  { rowNum: 16, label: '5 yrs Annualized ROI', defaultVal: '#REF!', cellType: 'ref-error', formulaStr: '=Overview!J19', note: 'Годишна възвръщаемост 5г.' },
  { rowNum: 17, label: '10 yrs Annualized ROI', defaultVal: '#REF!', cellType: 'ref-error', formulaStr: '=Overview!J29', note: 'Годишна възвръщаемост 10г.' },
  { rowNum: 18, label: 'Shares Outstanding', defaultVal: '#REF!', cellType: 'ref-error', formulaStr: '=GOOGLEFINANCE(B2, "shares")', note: 'Брой акции в обращение' },
  { rowNum: 19, label: 'Revenue', defaultVal: '1,159,897,000 $', cellType: 'yellow-input', note: 'Годишни брутни приходи' },
  { rowNum: 20, label: 'Revenue avg increase 3 - 5 yrs', defaultVal: '', cellType: 'default', note: 'Среден ръст на приходите' },
  { rowNum: 21, label: 'Gross Profit Margin', defaultVal: '10.00%', cellType: 'green-formula', formulaStr: '=(Gross Profit / Total Revenue) x 100', note: 'Брутен марж' },
  { rowNum: 22, label: 'Research & Development (R&D Ratio)', defaultVal: '', cellType: 'green-formula', note: 'R&D Ratio (< 30%)' },
  { rowNum: 23, label: 'Selling, General & Admin (SG&A Ratio)', defaultVal: '', cellType: 'green-formula', note: 'SG&A Ratio (< 30%)' },
  { rowNum: 24, label: 'EPS - Earnings Per Share', defaultVal: '', cellType: 'yellow-input', formulaStr: '=Net Income / Shares Outstanding', note: 'Печалба на акция' },
  { rowNum: 25, label: 'EPS Growth 5 - 10 yrs', defaultVal: '', cellType: 'green-formula', note: 'Ръст на EPS' },
  { rowNum: 26, label: 'Net Income', defaultVal: '7,457,000,000 $', cellType: 'yellow-input', note: 'Нетна печалба' },
  { rowNum: 27, label: 'Net Profit Margin', defaultVal: '', cellType: 'yellow-input', formulaStr: '=(Net Income / Revenue) x 100', note: 'Чист марж (> 20%)' },
  { rowNum: 28, label: 'Return on Equity (ROE)', defaultVal: '-6.13%', cellType: 'yellow-input', note: 'ROE (> 15%)' },
  { rowNum: 29, label: 'Return on Assets (ROA)', defaultVal: '1.56%', cellType: 'yellow-input', note: 'ROA (> 5%)' },
  { rowNum: 30, label: 'Return on Capital (ROIC)', defaultVal: '38.43%', cellType: 'yellow-input', note: 'ROIC (> 15% е силен Moat)' },
  { rowNum: 31, label: 'Current Ratio', defaultVal: '0.76', cellType: 'yellow-input', note: 'Текуща ликвидност (> 1.0)' },
  { rowNum: 32, label: 'Long - Term Debt', defaultVal: '', cellType: 'default', note: 'Дългосрочен дълг' },
  { rowNum: 33, label: 'Avg Debt Increase 10 yrs', defaultVal: '', cellType: 'default', note: 'Средно увеличение на дълга' },
  { rowNum: 34, label: 'Long-term Debt to Equity Ratio', defaultVal: '', cellType: 'default', note: 'Дългосрочен дълг / капитал' },
  { rowNum: 35, label: 'Debt to Equity Ratio', defaultVal: '', cellType: 'yellow-input', note: 'Задължения / капитал' },
  { rowNum: 36, label: 'Cash Flow from Operations', defaultVal: '', cellType: 'default', note: 'Оперативен кеш поток (CFFO)' },
  { rowNum: 37, label: 'CFFO 5-10 Years increase', defaultVal: '', cellType: 'default', note: 'Ръст на CFFO' },
  { rowNum: 38, label: 'Free Cash Flow', defaultVal: '14,402,000,000 $', cellType: 'default', note: 'Свободен паричен поток (FCF)' },
  { rowNum: 39, label: 'FCF 5 - 10 years avg increase', defaultVal: '', cellType: 'green-formula', note: 'Ръст на FCF' },
  { rowNum: 40, label: 'Cash Flow Margin', defaultVal: '0.00%', cellType: 'green-formula', formulaStr: '=B36/B19', note: 'Cash Flow Margin = CFFO / Revenue x 100' },
  { rowNum: 41, label: 'Free Cash Flow Margin', defaultVal: '1241.66%', cellType: 'green-formula', formulaStr: '=(B38/B19)', note: 'Free Cash Flow Margin = FCF / Revenue x 100' },
  { rowNum: 42, label: 'Free Cash Flow Yield', defaultVal: '#REF!', cellType: 'green-formula', formulaStr: '=1*(B38/B9)', note: 'FCF Yield = FCF / Market Cap x 100' },
  { rowNum: 43, label: 'Earnings Yield', defaultVal: '#REF!', cellType: 'green-formula', formulaStr: '=B24/B7', note: 'Earnings Yield = EPS / Price x 100' },
  { rowNum: 44, label: 'Free Cash Flow  / Net Income', defaultVal: '193.13%', cellType: 'green-formula', formulaStr: '=B38/B26', note: 'FCF / Net Income (>100% е отлично)' },
  { rowNum: 45, label: 'Cash Flow Coverage Ratio', defaultVal: '', cellType: 'default', note: 'CFFO / Long-Term Debt' },
  { rowNum: 46, label: 'Operating Cash Flow Ratio', defaultVal: '', cellType: 'default', note: 'CFFO / Current Liabilities' },
  { rowNum: 47, label: 'Cash ROA', defaultVal: '', cellType: 'default', note: 'Възвръщаемост на активите на база кеш' }
];

export default function StockChecklistModal({ isOpen, onClose, stock, stocks = [] }: StockChecklistModalProps) {
  const [selectedTicker, setSelectedTicker] = useState<string>(stock?.ticker || 'AAPL');
  const [activeRow, setActiveRow] = useState<number>(2);

  const [formData, setFormData] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    EXACT_SHEET_ROWS.forEach(r => { init[r.rowNum] = r.defaultVal; });
    return init;
  });

  useEffect(() => {
    if (stock) {
      setSelectedTicker(stock.ticker);
      setFormData(prev => ({
        ...prev,
        1: stock.companyName || stock.ticker,
        2: stock.ticker,
        7: stock.currentPrice ? `$${stock.currentPrice}` : prev[7],
        10: stock.pe ? String(stock.pe) : prev[10]
      }));
    }
  }, [stock]);

  const handleSelectTicker = (sym: string) => {
    setSelectedTicker(sym);
    const found = stocks.find(s => s.ticker === sym);
    if (found) {
      setFormData(prev => ({
        ...prev,
        1: found.companyName || found.ticker,
        2: found.ticker,
        7: found.currentPrice ? `$${found.currentPrice}` : prev[7],
        10: found.pe ? String(found.pe) : prev[10]
      }));
    }
  };

  const handleValueChange = (rowNum: number, val: string) => {
    setFormData(prev => {
      const next = { ...prev, [rowNum]: val };
      
      // Auto-calculate exact formulas when Revenue, Net Income, or FCF changes:
      const revRaw = (next[19] || '').replace(/[^0-9.]/g, '');
      const netIncRaw = (next[26] || '').replace(/[^0-9.-]/g, '');
      const fcfRaw = (next[38] || '').replace(/[^0-9.]/g, '');

      const rev = parseFloat(revRaw) || 0;
      const netInc = parseFloat(netIncRaw) || 0;
      const fcf = parseFloat(fcfRaw) || 0;

      if (rev > 0 && fcf > 0) {
        next[41] = `${((fcf / rev) * 100).toFixed(2)}%`;
      }
      if (netInc !== 0 && fcf > 0) {
        next[44] = `${((fcf / netInc) * 100).toFixed(2)}%`;
      }
      return next;
    });
  };

  if (!isOpen) return null;

  const activeRowDef = EXACT_SHEET_ROWS.find(r => r.rowNum === activeRow);
  const activeFormulaStr = activeRowDef?.formulaStr || formData[activeRow] || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose}>
      <div className="relative w-full max-w-6xl h-[94vh] bg-[#FFFFFF] dark:bg-[#1E1E1E] border border-[#DADCE0] dark:border-[#3C4043] rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans select-none text-slate-800 dark:text-slate-100" onClick={e => e.stopPropagation()}>
        
        {/* Google Sheets Header Bar */}
        <div className="bg-[#0F9D58] text-white px-4 py-2.5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg border border-white/30">
              <Table className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight">Stock Valuation.xlsx</span>
                <span className="text-[10px] bg-white/20 text-white font-mono px-2 py-0.5 rounded border border-white/30 font-bold uppercase">Google Sheets Format</span>
              </div>
              <p className="text-[11px] text-white/80">Официална таблица за анализ • Жълтите клетки са за попълване от човека</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://docs.google.com/spreadsheets/d/1nM8ETl-AZLwirf759DpabpopoRHzLfE9gpgkHmCibCU/edit?gid=295740580#gid=295740580"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-extrabold border border-white/30 flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Отвори в Google Drive
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Google Sheets Menu Bar & Ticker Selector */}
        <div className="bg-[#F8F9FA] dark:bg-[#202124] border-b border-[#DADCE0] dark:border-[#3C4043] px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 text-[#3C4043] dark:text-[#E8EAED] font-medium">
            <span className="hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 rounded cursor-pointer">Файл</span>
            <span className="hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 rounded cursor-pointer">Редактиране</span>
            <span className="hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 rounded cursor-pointer">Изглед</span>
            <span className="hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 rounded cursor-pointer">Форматиране</span>
            <span className="hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 rounded cursor-pointer">Данни</span>
            <span className="hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 rounded cursor-pointer font-bold text-[#0F9D58]">Справка</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Избор на Актив:</label>
            <select
              value={selectedTicker}
              onChange={e => handleSelectTicker(e.target.value)}
              className="bg-white dark:bg-[#303134] border border-[#DADCE0] dark:border-[#5F6368] text-slate-900 dark:text-slate-100 font-mono font-bold text-xs rounded px-2.5 py-1 outline-none focus:border-[#1A73E8]"
            >
              {stocks.length > 0 ? (
                stocks.map(s => (
                  <option key={s.ticker} value={s.ticker}>{s.ticker} - {s.companyName}</option>
                ))
              ) : (
                <option value={selectedTicker}>{selectedTicker} - {formData[1]}</option>
              )}
            </select>
          </div>
        </div>

        {/* Google Sheets Formula Bar (fx) */}
        <div className="bg-white dark:bg-[#202124] border-b border-[#DADCE0] dark:border-[#3C4043] px-3 py-1.5 flex items-center gap-2 text-xs font-mono shrink-0">
          <div className="bg-[#F8F9FA] dark:bg-[#303134] px-2 py-0.5 rounded border border-[#DADCE0] dark:border-[#5F6368] font-bold text-slate-600 dark:text-slate-300 min-w-[45px] text-center">
            B{activeRow}
          </div>
          <div className="text-slate-400 dark:text-slate-500 font-bold italic font-serif px-1">fx</div>
          <div className="h-4 w-px bg-[#DADCE0] dark:bg-[#5F6368]" />
          <input
            type="text"
            value={activeFormulaStr}
            onChange={e => handleValueChange(activeRow, e.target.value)}
            className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 font-mono text-xs outline-none"
            placeholder="Формула или стойност..."
          />
        </div>

        {/* Google Sheets Main Grid Table */}
        <div className="flex-1 overflow-auto bg-[#FFFFFF] dark:bg-[#1E1E1E]">
          <table className="w-full border-collapse text-xs font-sans text-left table-fixed">
            <thead>
              {/* Column Letter Headers (A, B, C) */}
              <tr className="bg-[#F8F9FA] dark:bg-[#2D2E31] text-[#5F6368] dark:text-[#9AA0A6] font-mono text-[11px] font-bold border-b border-[#DADCE0] dark:border-[#3C4043]">
                <th className="w-12 py-1.5 text-center border-r border-[#DADCE0] dark:border-[#3C4043] bg-[#F1F3F4] dark:bg-[#303134]">#</th>
                <th className="w-[340px] px-3 py-1.5 border-r border-[#DADCE0] dark:border-[#3C4043] font-bold uppercase tracking-wider text-[#3C4043] dark:text-[#E8EAED]">A (Показател)</th>
                <th className="w-[260px] px-3 py-1.5 border-r border-[#DADCE0] dark:border-[#3C4043] font-bold uppercase tracking-wider text-[#3C4043] dark:text-[#E8EAED]">B (Стойност / Google Sheet)</th>
                <th className="px-3 py-1.5 font-bold uppercase tracking-wider text-[#3C4043] dark:text-[#E8EAED]">C (Формула & Бележки)</th>
              </tr>
            </thead>
            <tbody>
              {EXACT_SHEET_ROWS.map((row) => {
                const isActive = activeRow === row.rowNum;
                const isBlankRow = !row.label && !row.defaultVal;

                if (isBlankRow) {
                  return (
                    <tr key={row.rowNum} className="h-6 bg-[#F8F9FA] dark:bg-[#202124]">
                      <td className="border-r border-b border-[#DADCE0] dark:border-[#3C4043] text-center font-mono text-[10px] text-[#5F6368]">{row.rowNum}</td>
                      <td className="border-r border-b border-[#DADCE0] dark:border-[#3C4043]" colSpan={3} />
                    </tr>
                  );
                }

                // Cell B background color per exact Google Sheets style:
                let cellBStyle = 'bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100';
                if (row.cellType === 'yellow-input') {
                  // User Input Cell marked in Yellow (#FFFDE4 / #FFFCD668)
                  cellBStyle = 'bg-[#FFFDE4] dark:bg-[#423D1C] text-[#854D0E] dark:text-[#FDE047] font-black border-2 border-[#EAB308] shadow-xs';
                } else if (row.cellType === 'green-formula') {
                  // Formula Cell marked in Green (#E6F4EA / #00B050)
                  cellBStyle = 'bg-[#E6F4EA] dark:bg-[#133E2B] text-[#137333] dark:text-[#6EE7B7] font-black border border-[#34A853]/40';
                } else if (row.cellType === 'ref-error') {
                  // Ref Error / Quote Placeholder
                  cellBStyle = 'bg-[#F8F9FA] dark:bg-[#2A2B2E] text-rose-500 font-mono font-bold';
                }

                return (
                  <tr
                    key={row.rowNum}
                    onClick={() => setActiveRow(row.rowNum)}
                    className={`border-b border-[#DADCE0] dark:border-[#3C4043] transition-colors cursor-pointer ${
                      isActive ? 'bg-[#E8F0FE] dark:bg-[#172B4D]' : 'hover:bg-[#F1F3F4] dark:hover:bg-[#252629]'
                    }`}
                  >
                    {/* Row Header Number */}
                    <td className={`py-1.5 text-center font-mono text-[11px] font-bold border-r border-[#DADCE0] dark:border-[#3C4043] ${
                      isActive ? 'bg-[#D2E3FC] dark:bg-[#1E3A8A] text-[#1A73E8] dark:text-blue-300' : 'bg-[#F8F9FA] dark:bg-[#2D2E31] text-[#5F6368] dark:text-[#9AA0A6]'
                    }`}>
                      {row.rowNum}
                    </td>

                    {/* Column A: Metric Name (with optional link) */}
                    <td className="px-3 py-1.5 font-semibold text-xs border-r border-[#DADCE0] dark:border-[#3C4043] truncate">
                      {row.link ? (
                        <a
                          href={row.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1A73E8] hover:underline font-bold flex items-center gap-1"
                        >
                          {row.label}
                          <ExternalLink className="w-3 h-3 text-[#1A73E8]" />
                        </a>
                      ) : (
                        row.label
                      )}
                    </td>

                    {/* Column B: Editable / Displayed Value */}
                    <td className={`px-2 py-1 border-r border-[#DADCE0] dark:border-[#3C4043] font-mono text-xs relative ${
                      isActive ? 'outline-2 outline-[#1A73E8] z-10' : ''
                    }`}>
                      <input
                        type="text"
                        value={formData[row.rowNum] ?? row.defaultVal}
                        onChange={e => handleValueChange(row.rowNum, e.target.value)}
                        onFocus={() => setActiveRow(row.rowNum)}
                        className={`w-full px-2 py-1 rounded outline-none font-mono font-bold text-xs transition-all ${cellBStyle}`}
                      />
                    </td>

                    {/* Column C: Formula & Google Sheets Note */}
                    <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400 text-xs">
                      {row.formulaStr && (
                        <span className="font-mono text-[11px] font-bold text-[#137333] dark:text-[#6EE7B7] bg-[#E6F4EA] dark:bg-[#133E2B] px-2 py-0.5 rounded border border-[#34A853]/30 mr-2 inline-block">
                          {row.formulaStr}
                        </span>
                      )}
                      {row.note && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          💡 {row.note}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Google Sheets Bottom Sheet Tabs Bar */}
        <div className="bg-[#F8F9FA] dark:bg-[#202124] border-t border-[#DADCE0] dark:border-[#3C4043] px-4 py-2 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1">
            <div className="bg-white dark:bg-[#303134] text-[#0F9D58] dark:text-[#6EE7B7] font-extrabold px-3 py-1 rounded-t border-t-2 border-[#0F9D58] border-x border-[#DADCE0] dark:border-[#5F6368] flex items-center gap-1.5 shadow-2xs">
              <Table className="w-3.5 h-3.5" />
              <span>Stock Valuation</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-[#854D0E] dark:text-[#FDE047] font-bold">
              <span className="w-3 h-3 rounded bg-[#FFFDE4] border border-[#EAB308] inline-block" />
              Жълти клетки = Попълване от човека
            </span>
            <span className="flex items-center gap-1 text-[#137333] dark:text-[#6EE7B7] font-bold">
              <span className="w-3 h-3 rounded bg-[#E6F4EA] border border-[#34A853] inline-block" />
              Зелени клетки = Точни Формули
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
