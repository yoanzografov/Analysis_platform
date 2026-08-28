import React, { useState, useEffect } from 'react';
import { Stock } from '../types';
import { X, Sparkles, Table, Grid, ExternalLink, RefreshCw, Check } from 'lucide-react';

interface StockChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock?: Stock | null;
  stocks?: Stock[];
}

export interface SpreadsheetRow {
  rowNum: number;
  colA: string; // Label / Metric Name
  colB_default: string; // Default Value / Pre-filled value
  cellType: 'yellow-input' | 'green-formula' | 'red-accent' | 'default';
  formulaStr?: string;
  note?: string;
}

export const GOOGLE_SHEET_ROWS: SpreadsheetRow[] = [
  { rowNum: 1, colA: 'Company', colB_default: 'Apple Inc.', cellType: 'default', formulaStr: '=GOOGLEFINANCE(B2, "name")', note: 'Автоматично от борсовия тикер' },
  { rowNum: 2, colA: 'Tickr', colB_default: 'AAPL', cellType: 'yellow-input', note: 'Въвежда се от човека (напр. AAPL, NVDA, TSLA)' },
  { rowNum: 3, colA: 'Industry', colB_default: 'Consumer Electronics', cellType: 'default', note: 'Индустриален сектор на компанията' },
  { rowNum: 4, colA: 'Sector', colB_default: 'Technology', cellType: 'default', note: 'Основен сектор' },
  { rowNum: 5, colA: 'Undervalued / Overvalued', colB_default: '-12.4%', cellType: 'green-formula', formulaStr: '=(Fair Price / Current Price) - 1', note: 'Оценка за подцененост на база справедливата цена' },
  { rowNum: 6, colA: '', colB_default: '', cellType: 'default' },
  { rowNum: 7, colA: 'Current Price', colB_default: '224.23', cellType: 'default', formulaStr: '=GOOGLEFINANCE(B2)', note: 'Текуща борсова цена от GoogleFinance' },
  { rowNum: 8, colA: '52 week low / 52 week high', colB_default: '164.08 / 237.23', cellType: 'red-accent', formulaStr: '=GOOGLEFINANCE(B2, "low52")', note: '52-седмично дъно и връх' },
  { rowNum: 9, colA: 'Market Cap', colB_default: '3,450,000,000,000', cellType: 'default', formulaStr: '=GOOGLEFINANCE(B2, "marketcap")', note: 'Пазарна капитализация' },
  { rowNum: 10, colA: 'P/E Ratio', colB_default: '33.5', cellType: 'yellow-input', formulaStr: '=GOOGLEFINANCE(B2, "pe")', note: 'PE Ratio = Stock Price / Earnings Per Share\nНасоки: Без растеж: ≤10 | Бавен: 12 | Умерен: 15 | Бърз: 25+' },
  { rowNum: 11, colA: 'Price to FCF', colB_default: '31.2', cellType: 'default', formulaStr: '=SUBSTITUTE(index(importhtml("http://finviz.com..."),7,4),"*","")', note: 'Price to FCF = Stock Price / FCF per share\nПоказва по-истински данни за реалния кеш.' },
  { rowNum: 12, colA: 'Dividend Yield', colB_default: '0.55%', cellType: 'default', formulaStr: '=SUBSTITUTE(index(importhtml(...),8,2),"*","")', note: 'Dividend Yield = (Annual Dividend / Stock Price) x 100' },
  { rowNum: 13, colA: 'Dividend Payout Ratio', colB_default: '15.2%', cellType: 'default', formulaStr: '=SUBSTITUTE(index(importhtml(...),12,2),"*","")', note: 'Dividend Payout Ratio = (Dividends Paid / Net Income) x 100' },
  { rowNum: 14, colA: 'CASH Dividend Payout Ratio', colB_default: '14.8%', cellType: 'default', note: 'Cash Dividend Payout Ratio = Dividends paid / Free Cash Flow x 100' },
  { rowNum: 15, colA: 'Dividend Growth Rate 5 - 10 year avg', colB_default: '6.5%', cellType: 'default', note: 'Средногодишен ръст на дивидента за 5-10 години' },
  { rowNum: 16, colA: '5 yrs Annualized ROI', colB_default: '18.4%', cellType: 'default', note: '=Overview!J19' },
  { rowNum: 17, colA: '10 yrs Annualized ROI', colB_default: '22.1%', cellType: 'default', note: '=Overview!J29' },
  { rowNum: 18, colA: 'Shares Outstanding', colB_default: '15,400,000,000', cellType: 'default', formulaStr: '=GOOGLEFINANCE(B2, "shares")', note: 'Общ брой акции в обращение' },
  { rowNum: 19, colA: 'Revenue', colB_default: '385,600,000,000', cellType: 'yellow-input', note: 'Годишни брутни приходи на компанията (Revenue)' },
  { rowNum: 20, colA: 'Revenue avg increase 3 - 5 yrs', colB_default: '8.2%', cellType: 'red-accent', note: 'Средногодишен ръст на приходите за 3-5 години' },
  { rowNum: 21, colA: 'Gross Profit Margin', colB_default: '46.2%', cellType: 'red-accent', formulaStr: '=(Gross Profit / Revenue) * 100', note: 'Gross Profit Margin = (Gross Profit / Total Revenue) x 100 (%)' },
  { rowNum: 22, label: 'Research & Development (R&D Ratio)', colA: 'Research & Development (R&D Ratio)', colB_default: '7.8%', cellType: 'green-formula', note: 'R&D ratio = R&D Expenses / Revenue х 100 (под 30%)' },
  { rowNum: 23, colA: 'Selling, General & Admin (SG&A Ratio)', colB_default: '6.4%', cellType: 'green-formula', note: 'SGA ratio = SG&A Expenses / Revenue х 100 (под 30%)' },
  { rowNum: 24, colA: 'EPS - Earnings Per Share', colB_default: '6.70', cellType: 'yellow-input', formulaStr: '=Net Income / Shares Outstanding', note: 'EPS = Net Income / Shares Outstanding' },
  { rowNum: 25, colA: 'EPS Growth 5 - 10 yrs', colB_default: '9.4%', cellType: 'green-formula', note: 'Средногодишен ръст на EPS за 5-10 години' },
  { rowNum: 26, colA: 'Net Income', colB_default: '100,016,000,000', cellType: 'yellow-input', note: 'Net Income = Revenue - All Expenses' },
  { rowNum: 27, colA: 'Net Profit Margin', colB_default: '25.9%', cellType: 'yellow-input', formulaStr: '=(Net Income / Revenue) * 100', note: 'NET PROFIT MARGIN = NET INCOME / REVENUE x 100 (>20%)' },
  { rowNum: 28, colA: 'Return on Equity (ROE)', colB_default: '147.2%', cellType: 'yellow-input', note: 'ROE = (Net Income / Shareholders Equity) * 100% (>15%)' },
  { rowNum: 29, colA: 'Return on Assets (ROA)', colB_default: '29.4%', cellType: 'yellow-input', note: 'ROA = (Net Income / Total Assets) * 100% (>5%)' },
  { rowNum: 30, colA: 'Return on Capital (ROIC)', colB_default: '54.2%', cellType: 'yellow-input', note: 'ROIC = (EBIT / Invested Capital) * 100% (>15% е силен Moat)' },
  { rowNum: 31, colA: 'Current Ratio', colB_default: '0.99', cellType: 'yellow-input', note: 'CURRENT RATIO = CURRENT ASSETS / CURRENT LIABILITIES (>1.0)' },
  { rowNum: 32, colA: 'Long - Term Debt', colB_default: '95,000,000,000', cellType: 'default', note: 'Дългосрочни задължения' },
  { rowNum: 33, colA: 'Avg Debt Increase 10 yrs', colB_default: '2.1%', cellType: 'default', note: 'Среден ръст на дълга за 10г.' },
  { rowNum: 34, colA: 'Long-term Debt to Equity Ratio', colB_default: '1.45', cellType: 'default', note: 'Дългосрочен дълг спрямо собствения капитал' },
  { rowNum: 35, colA: 'Debt to Equity Ratio', colB_default: '1.81', cellType: 'yellow-input', note: 'Debt to Equity Ratio = Total Debt / Total Equity' },
  { rowNum: 36, colA: 'Cash Flow from Operations', colB_default: '110,540,000,000', cellType: 'default', note: 'Оперативен паричен поток (CFFO)' },
  { rowNum: 37, colA: 'CFFO 5-10 Years increase', colB_default: '7.8%', cellType: 'default', note: 'Ръст на оперативния кеш поток за 5-10 години' },
  { rowNum: 38, colA: 'Free Cash Flow', colB_default: '108,800,000,000', cellType: 'default', note: 'Свободен паричен поток (FCF)' },
  { rowNum: 39, colA: 'FCF 5 - 10 years avg increase', colB_default: '8.1%', cellType: 'green-formula', note: 'Ръст на свободния кеш поток за 5-10 години' },
  { rowNum: 40, colA: 'Cash Flow Margin', colB_default: '28.6%', cellType: 'green-formula', formulaStr: '=B36/B19', note: 'Cash Flow Margin Ratio = Operating Cash Flow / Revenue x 100 (%)' },
  { rowNum: 41, colA: 'Free Cash Flow Margin', colB_default: '28.2%', cellType: 'green-formula', formulaStr: '=(B38/B19)', note: 'Free Cash Flow Margin = Free Cash Flow / Revenue x 100 (%)' },
  { rowNum: 42, colA: 'Free Cash Flow Yield', colB_default: '3.15%', cellType: 'green-formula', formulaStr: '=1*(B38/B9)', note: 'Free Cash Flow Yield = Free Cash Flow / Market Cap x 100 (%)' },
  { rowNum: 43, colA: 'Earnings Yield', colB_default: '2.99%', cellType: 'green-formula', formulaStr: '=B24/B7', note: 'Earnings Yield = EPS / Price x 100 (%)' },
  { rowNum: 44, colA: 'Free Cash Flow  / Net Income', colB_default: '1.09x', cellType: 'green-formula', formulaStr: '=B38/B26', note: 'FCF / Net Income (>100% е отлично)' },
  { rowNum: 45, colA: 'Cash Flow Coverage Ratio', colB_default: '1.16', cellType: 'yellow-input', note: 'Operating Cash Flow / Long-Term Debt' },
  { rowNum: 46, colA: 'Operating Cash Flow Ratio', colB_default: '0.74', cellType: 'default', note: 'Operating Cash Flow / Current Liabilities' },
  { rowNum: 47, colA: 'Cash ROA', colB_default: '24.1%', cellType: 'yellow-input', note: 'Възвръщаемост на активите на база оперативен паричен поток' }
];

export default function StockChecklistModal({ isOpen, onClose, stock, stocks = [] }: StockChecklistModalProps) {
  const [selectedTicker, setSelectedTicker] = useState<string>(stock?.ticker || 'AAPL');
  const [activeCellRow, setActiveCellRow] = useState<number>(2); // Default selected cell B2
  
  // Interactive cell values state
  const [cellValues, setCellValues] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    GOOGLE_SHEET_ROWS.forEach(r => {
      init[r.rowNum] = r.colB_default;
    });
    return init;
  });

  useEffect(() => {
    if (stock) {
      setSelectedTicker(stock.ticker);
      setCellValues(prev => ({
        ...prev,
        1: stock.companyName || prev[1],
        2: stock.ticker,
        7: stock.currentPrice ? String(stock.currentPrice) : prev[7],
        10: stock.pe ? String(stock.pe) : prev[10],
        12: stock.dividendYield ? `${stock.dividendYield}%` : prev[12]
      }));
    }
  }, [stock]);

  const handleSelectTicker = (sym: string) => {
    setSelectedTicker(sym);
    const found = stocks.find(s => s.ticker === sym);
    if (found) {
      setCellValues(prev => ({
        ...prev,
        1: found.companyName || prev[1],
        2: found.ticker,
        7: found.currentPrice ? String(found.currentPrice) : prev[7],
        10: found.pe ? String(found.pe) : prev[10],
        12: found.dividendYield ? `${found.dividendYield}%` : prev[12]
      }));
    }
  };

  const handleCellChange = (rowNum: number, val: string) => {
    setCellValues(prev => ({ ...prev, [rowNum]: val }));
  };

  if (!isOpen) return null;

  // Active cell definition for Formula bar
  const activeRowDef = GOOGLE_SHEET_ROWS.find(r => r.rowNum === activeCellRow);
  const activeCellFormula = activeRowDef?.formulaStr || cellValues[activeCellRow] || '';

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
              <p className="text-[11px] text-white/80">Официална таблица за анализ на акции • Жълтите клетки са за попълване от човека</p>
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
            <span className="hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 rounded cursor-pointer">Инструменти</span>
            <span className="hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 rounded cursor-pointer font-bold text-[#0F9D58]">Справка</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Актив (Ticker):</label>
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
                <option value={selectedTicker}>{selectedTicker} - {cellValues[1]}</option>
              )}
            </select>
          </div>
        </div>

        {/* Google Sheets Formula Bar (fx) */}
        <div className="bg-white dark:bg-[#202124] border-b border-[#DADCE0] dark:border-[#3C4043] px-3 py-1.5 flex items-center gap-2 text-xs font-mono shrink-0">
          <div className="bg-[#F8F9FA] dark:bg-[#303134] px-2 py-0.5 rounded border border-[#DADCE0] dark:border-[#5F6368] font-bold text-slate-600 dark:text-slate-300 min-w-[45px] text-center">
            B{activeCellRow}
          </div>
          <div className="text-slate-400 dark:text-slate-500 font-bold italic font-serif px-1">fx</div>
          <div className="h-4 w-px bg-[#DADCE0] dark:bg-[#5F6368]" />
          <input
            type="text"
            value={activeCellFormula}
            onChange={e => handleCellChange(activeCellRow, e.target.value)}
            className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 font-mono text-xs outline-none"
            placeholder="Въведете стойност или формула..."
          />
        </div>

        {/* Google Sheets Main Grid Table */}
        <div className="flex-1 overflow-auto bg-[#FFFFFF] dark:bg-[#1E1E1E]">
          <table className="w-full border-collapse text-xs font-sans text-left table-fixed">
            <thead>
              {/* Column Letter Headers (A, B, C, D) */}
              <tr className="bg-[#F8F9FA] dark:bg-[#2D2E31] text-[#5F6368] dark:text-[#9AA0A6] font-mono text-[11px] font-bold border-b border-[#DADCE0] dark:border-[#3C4043]">
                <th className="w-12 py-1.5 text-center border-r border-[#DADCE0] dark:border-[#3C4043] bg-[#F1F3F4] dark:bg-[#303134]">#</th>
                <th className="w-[340px] px-3 py-1.5 border-r border-[#DADCE0] dark:border-[#3C4043] font-bold uppercase tracking-wider text-[#3C4043] dark:text-[#E8EAED]">A (Показател / Метрика)</th>
                <th className="w-[260px] px-3 py-1.5 border-r border-[#DADCE0] dark:border-[#3C4043] font-bold uppercase tracking-wider text-[#3C4043] dark:text-[#E8EAED]">B (Стойност / Данни)</th>
                <th className="px-3 py-1.5 font-bold uppercase tracking-wider text-[#3C4043] dark:text-[#E8EAED]">C (Формула & Бележка от Google Sheets)</th>
              </tr>
            </thead>
            <tbody>
              {GOOGLE_SHEET_ROWS.map((row) => {
                const isActive = activeCellRow === row.rowNum;
                const isBlankRow = !row.colA && !row.colB_default;

                if (isBlankRow) {
                  return (
                    <tr key={row.rowNum} className="h-6 bg-[#F8F9FA] dark:bg-[#202124]">
                      <td className="border-r border-b border-[#DADCE0] dark:border-[#3C4043] text-center font-mono text-[10px] text-[#5F6368]">{row.rowNum}</td>
                      <td className="border-r border-b border-[#DADCE0] dark:border-[#3C4043]" colSpan={3} />
                    </tr>
                  );
                }

                // Cell B background color per user's Google Sheet style:
                let cellBStyle = 'bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100';
                if (row.cellType === 'yellow-input') {
                  // User Input Cell marked in Yellow (#FFFFD966 / #FFFCD668)
                  cellBStyle = 'bg-[#FFFDE4] dark:bg-[#423D1C] text-[#854D0E] dark:text-[#FDE047] font-black border-2 border-[#EAB308] shadow-xs';
                } else if (row.cellType === 'green-formula') {
                  // Formula Cell marked in Green (#D9EAD3 / #00B050)
                  cellBStyle = 'bg-[#E6F4EA] dark:bg-[#133E2B] text-[#137333] dark:text-[#6EE7B7] font-black border border-[#34A853]/40';
                } else if (row.cellType === 'red-accent') {
                  // Red Cell (#FCE5CD / #FFE06666)
                  cellBStyle = 'bg-[#FCE8E6] dark:bg-[#4C1D1D] text-[#C5221F] dark:text-[#FCA5A5] font-bold border border-[#EA4335]/40';
                }

                return (
                  <tr
                    key={row.rowNum}
                    onClick={() => setActiveCellRow(row.rowNum)}
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

                    {/* Column A: Metric Name */}
                    <td className="px-3 py-1.5 font-semibold text-xs border-r border-[#DADCE0] dark:border-[#3C4043] truncate">
                      {row.colA}
                    </td>

                    {/* Column B: Editable / Displayed Value (Yellow/Green/Red) */}
                    <td className={`px-2 py-1 border-r border-[#DADCE0] dark:border-[#3C4043] font-mono text-xs relative ${
                      isActive ? 'outline-2 outline-[#1A73E8] z-10' : ''
                    }`}>
                      <input
                        type="text"
                        value={cellValues[row.rowNum] ?? row.colB_default}
                        onChange={e => handleCellChange(row.rowNum, e.target.value)}
                        onFocus={() => setActiveCellRow(row.rowNum)}
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
                          ℹ️ {row.note}
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
