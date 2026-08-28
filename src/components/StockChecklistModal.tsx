import React, { useState, useEffect, useMemo } from 'react';
import { Stock } from '../types';
import { X, Table, ExternalLink, ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

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
  cellType: 'yellow-input' | 'green-formula' | 'ref-error' | 'flag-green' | 'flag-yellow' | 'flag-red' | 'default';
  formulaStr?: string;
  note?: string;
  flagRules?: { green: string; yellow: string; red: string };
}

export const EXACT_SHEET_ROWS: SheetRowDefinition[] = [
  // SECTION 1: CORE VALUATION (ROWS 1 - 47)
  { rowNum: 1, label: 'Company', defaultVal: 'Apple Inc.', cellType: 'default', formulaStr: '=GOOGLEFINANCE(B2, "name")', note: 'Автоматично от борсовия тикер' },
  { rowNum: 2, label: 'Tickr', defaultVal: 'AAPL', cellType: 'yellow-input', note: 'Въвежда се от човека (напр. AAPL, NVDA, TSLA)' },
  { rowNum: 3, label: 'Industry', defaultVal: 'Consumer Electronics', cellType: 'default', note: 'Индустриален сектор' },
  { rowNum: 4, label: 'Sector', defaultVal: 'Technology', cellType: 'default', note: 'Основен сектор' },
  { rowNum: 5, label: 'Undervalued / Overvalued', defaultVal: '-12.4%', cellType: 'green-formula', formulaStr: '=(Fair Price / Current Price) - 1', note: 'Оценка за подцененост на база справедливата цена' },
  { rowNum: 6, label: '--- CORE FINANCIAL METRICS ---', defaultVal: '', cellType: 'default' },
  { rowNum: 7, label: 'Current Price', defaultVal: '224.23', cellType: 'yellow-input', formulaStr: '=GOOGLEFINANCE(B2)', note: 'Текуща борсова цена ($)' },
  { rowNum: 8, label: '52 week low / 52 week high', defaultVal: '164.08 / 237.23', cellType: 'ref-error', formulaStr: '=GOOGLEFINANCE(B2, "low52")', note: '52-седмично дъно и връх' },
  { rowNum: 9, label: 'Market Cap', defaultVal: '3,450,000,000,000', cellType: 'yellow-input', formulaStr: '=GOOGLEFINANCE(B2, "marketcap")', note: 'Пазарна капитализация ($)' },
  { rowNum: 10, label: 'P/E Ratio', link: 'https://fullratio.com/pe-ratio-by-industry', defaultVal: '33.5', cellType: 'yellow-input', formulaStr: '=GOOGLEFINANCE(B2, "pe")', note: 'P/E Ratio = Stock Price / EPS. Насоки: Без растеж: ≤10 | Бавен: 12 | Умерен: 15 | Бърз: 25+' },
  { rowNum: 11, label: 'Price to FCF', defaultVal: '31.2', cellType: 'default', formulaStr: '=SUBSTITUTE(index(importhtml(...),7,4),"*","")', note: 'Price to FCF = Stock Price / FCF per share' },
  { rowNum: 12, label: 'Dividend Yield', defaultVal: '0.55%', cellType: 'default', formulaStr: '=SUBSTITUTE(index(importhtml(...),8,2),"*","")', note: 'Dividend Yield = (Annual Dividend / Stock Price) x 100' },
  { rowNum: 13, label: 'Dividend Payout Ratio', defaultVal: '15.2%', cellType: 'default', formulaStr: '=SUBSTITUTE(index(importhtml(...),12,2),"*","")', note: 'Dividend Payout Ratio = (Dividends Paid / Net Income) x 100' },
  { rowNum: 14, label: 'CASH Dividend Payout Ratio', defaultVal: '14.8%', cellType: 'default', note: 'Cash Dividend Payout Ratio = Dividends paid / Free Cash Flow x 100' },
  { rowNum: 15, label: 'Dividend Growth Rate 5 - 10 year avg', defaultVal: '6.5%', cellType: 'default', note: 'Средногодишен ръст на дивидента' },
  { rowNum: 16, label: '5 yrs Annualized ROI', defaultVal: '18.4%', cellType: 'default', formulaStr: '=Overview!J19', note: 'Годишна възвръщаемост 5г.' },
  { rowNum: 17, label: '10 yrs Annualized ROI', defaultVal: '22.1%', cellType: 'default', formulaStr: '=Overview!J29', note: 'Годишна възвръщаемост 10г.' },
  { rowNum: 18, label: 'Shares Outstanding', defaultVal: '15,400,000,000', cellType: 'yellow-input', formulaStr: '=GOOGLEFINANCE(B2, "shares")', note: 'Брой акции в обращение' },
  { rowNum: 19, label: 'Revenue', defaultVal: '1,159,897,000', cellType: 'yellow-input', note: 'Годишни брутни приходи ($)' },
  { rowNum: 20, label: 'Revenue avg increase 3 - 5 yrs', defaultVal: '8.2%', cellType: 'default', note: 'Среден ръст на приходите' },
  { rowNum: 21, label: 'Gross Profit Margin', defaultVal: '46.2%', cellType: 'green-formula', formulaStr: '=(Gross Profit / Total Revenue) x 100', note: 'Брутен марж' },
  { rowNum: 22, label: 'Research & Development (R&D Ratio)', defaultVal: '7.8%', cellType: 'green-formula', note: 'R&D Ratio (< 30%)' },
  { rowNum: 23, label: 'Selling, General & Admin (SG&A Ratio)', defaultVal: '6.4%', cellType: 'green-formula', note: 'SG&A Ratio (< 30%)' },
  { rowNum: 24, label: 'EPS - Earnings Per Share', defaultVal: '6.70', cellType: 'green-formula', formulaStr: '=Net Income / Shares Outstanding', note: 'Печалба на акция ($)' },
  { rowNum: 25, label: 'EPS Growth 5 - 10 yrs', defaultVal: '9.4%', cellType: 'green-formula', note: 'Ръст на EPS' },
  { rowNum: 26, label: 'Net Income', defaultVal: '7,457,000,000', cellType: 'yellow-input', note: 'Нетна печалба ($)' },
  { rowNum: 27, label: 'Net Profit Margin', defaultVal: '642.90%', cellType: 'green-formula', formulaStr: '=(Net Income / Revenue) x 100', note: 'Чист марж (> 20%)' },
  { rowNum: 28, label: 'Return on Equity (ROE)', defaultVal: '147.2%', cellType: 'yellow-input', note: 'ROE (> 15%)' },
  { rowNum: 29, label: 'Return on Assets (ROA)', defaultVal: '29.4%', cellType: 'yellow-input', note: 'ROA (> 5%)' },
  { rowNum: 30, label: 'Return on Capital (ROIC)', defaultVal: '54.2%', cellType: 'yellow-input', note: 'ROIC (> 15% е силен Moat)' },
  { rowNum: 31, label: 'Current Ratio', defaultVal: '0.99', cellType: 'yellow-input', note: 'Текуща ликвидност (> 1.0)' },
  { rowNum: 32, label: 'Long - Term Debt', defaultVal: '95,000,000,000', cellType: 'yellow-input', note: 'Дългосрочен дълг ($)' },
  { rowNum: 33, label: 'Avg Debt Increase 10 yrs', defaultVal: '2.1%', cellType: 'default', note: 'Средно увеличение на дълга' },
  { rowNum: 34, label: 'Long-term Debt to Equity Ratio', defaultVal: '1.45', cellType: 'default', note: 'Дългосрочен дълг / капитал' },
  { rowNum: 35, label: 'Debt to Equity Ratio', defaultVal: '1.81', cellType: 'yellow-input', note: 'Задължения / капитал' },
  { rowNum: 36, label: 'Cash Flow from Operations', defaultVal: '110,540,000,000', cellType: 'yellow-input', note: 'Оперативен кеш поток (CFFO)' },
  { rowNum: 37, label: 'CFFO 5-10 Years increase', defaultVal: '7.8%', cellType: 'default', note: 'Ръст на CFFO' },
  { rowNum: 38, label: 'Free Cash Flow', defaultVal: '14,402,000,000', cellType: 'yellow-input', note: 'Свободен паричен поток (FCF)' },
  { rowNum: 39, label: 'FCF 5 - 10 years avg increase', defaultVal: '8.1%', cellType: 'green-formula', note: 'Ръст на FCF' },
  { rowNum: 40, label: 'Cash Flow Margin', defaultVal: '9530.16%', cellType: 'green-formula', formulaStr: '=B36/B19', note: 'Cash Flow Margin = CFFO / Revenue x 100' },
  { rowNum: 41, label: 'Free Cash Flow Margin', defaultVal: '1241.66%', cellType: 'green-formula', formulaStr: '=(B38/B19)', note: 'Free Cash Flow Margin = FCF / Revenue x 100' },
  { rowNum: 42, label: 'Free Cash Flow Yield', defaultVal: '0.42%', cellType: 'green-formula', formulaStr: '=1*(B38/B9)', note: 'FCF Yield = FCF / Market Cap x 100' },
  { rowNum: 43, label: 'Earnings Yield', defaultVal: '2.99%', cellType: 'green-formula', formulaStr: '=B24/B7', note: 'Earnings Yield = EPS / Price x 100' },
  { rowNum: 44, label: 'Free Cash Flow  / Net Income', defaultVal: '193.13%', cellType: 'green-formula', formulaStr: '=B38/B26', note: 'FCF / Net Income (>100% е отлично)' },
  { rowNum: 45, label: 'Cash Flow Coverage Ratio', defaultVal: '1.16', cellType: 'yellow-input', note: 'CFFO / Long-Term Debt' },
  { rowNum: 46, label: 'Operating Cash Flow Ratio', defaultVal: '0.74', cellType: 'default', note: 'CFFO / Current Liabilities' },
  { rowNum: 47, label: 'Cash ROA', defaultVal: '24.1%', cellType: 'yellow-input', note: 'Възвръщаемост на активите на база кеш' },

  // SECTION 2: FINANCIAL STATEMENTS FLAGS (INCOME STATEMENT, BALANCE SHEET, CASH FLOW STATEMENT)
  { rowNum: 48, label: '--- INCOME STATEMENT FLAGS (🟢🟡🔴) ---', defaultVal: '', cellType: 'default' },
  { rowNum: 49, label: 'Gross Margin Flag (Брутен марж)', defaultVal: '🟢 Green (46.2%)', cellType: 'flag-green', formulaStr: '=IF(B21>=40%, "GREEN", IF(B21<30%, "YELLOW", "RED"))', flagRules: { green: '40%+', yellow: '< 30%', red: '< 10%' }, note: '🟢 40%+ | 🟡 <30% | 🔴 <10%' },
  { rowNum: 50, label: 'Revenue Growth Rate Flag', defaultVal: '🟡 Yellow (8.2%)', cellType: 'flag-yellow', formulaStr: '=IF(B20>=15%, "GREEN", IF(B20<10%, "YELLOW", "RED"))', flagRules: { green: '15%+', yellow: '< 10%', red: '< 2%' }, note: '🟢 15%+ | 🟡 <10% | 🔴 <2%' },
  { rowNum: 51, label: 'EBITDA Margin Flag', defaultVal: '🟢 Green (28.5%)', cellType: 'flag-green', formulaStr: '=IF(EBITDA>=20%, "GREEN", "YELLOW")', flagRules: { green: '20%+', yellow: '< 10%', red: '< 3%' }, note: '🟢 20%+ | 🟡 <10% | 🔴 <3%' },
  { rowNum: 52, label: 'Net Profit Margin Flag', defaultVal: '🟢 Green (25.9%)', cellType: 'flag-green', formulaStr: '=IF(B27>=17%, "GREEN", IF(B27<5%, "YELLOW", "RED"))', flagRules: { green: '17%+', yellow: '< 5%', red: '< 1%' }, note: '🟢 17%+ | 🟡 <5% | 🔴 <1%' },
  { rowNum: 53, label: 'Interest Coverage Rate Flag', defaultVal: '🟢 Green (12.4x)', cellType: 'flag-green', formulaStr: '=IF(Coverage>5, "GREEN", "RED")', flagRules: { green: '> 5x', yellow: '< 2x', red: '< 1.5x' }, note: '🟢 >5x | 🟡 <2x | 🔴 <1.5x' },

  { rowNum: 54, label: '--- BALANCE SHEET FLAGS (🟢🟡🔴) ---', defaultVal: '', cellType: 'default' },
  { rowNum: 55, label: 'Goodwill in Assets Flag', defaultVal: '🟢 Green (4.2%)', cellType: 'flag-green', formulaStr: '=IF(Goodwill<10%, "GREEN", "RED")', flagRules: { green: '< 10%', yellow: '> 20%', red: '> 30%' }, note: '🟢 <10% | 🟡 >20% | 🔴 >30%' },
  { rowNum: 56, label: 'Debt to Equity Ratio Flag', defaultVal: '🟡 Yellow (1.81)', cellType: 'flag-yellow', formulaStr: '=IF(B35<1.0, "GREEN", IF(B35>2.0, "YELLOW", "RED"))', flagRules: { green: '< 1.0', yellow: '> 2.0', red: '> 4.0' }, note: '🟢 <1.0 | 🟡 >2.0 | 🔴 >4.0' },
  { rowNum: 57, label: 'Asset Turnover Ratio Flag', defaultVal: '🟡 Yellow (1.15)', cellType: 'flag-yellow', formulaStr: '=IF(Turnover>3.0, "GREEN", "YELLOW")', flagRules: { green: '> 3.0', yellow: '< 1.0', red: '< 0.5' }, note: '🟢 >3.0 | 🟡 <1.0 | 🔴 <0.5' },
  { rowNum: 58, label: 'Quick Ratio Flag', defaultVal: '🟡 Yellow (0.95)', cellType: 'flag-yellow', formulaStr: '=IF(Quick>=1.0, "GREEN", "YELLOW")', flagRules: { green: '1.0+', yellow: '< 0.8', red: '< 0.3' }, note: '🟢 1.0+ | 🟡 <0.8 | 🔴 <0.3' },

  { rowNum: 59, label: '--- CASH FLOW STATEMENT FLAGS (🟢🟡🔴) ---', defaultVal: '', cellType: 'default' },
  { rowNum: 60, label: 'Stock-based Compensation Flag', defaultVal: '🟢 Green (3.8%)', cellType: 'flag-green', formulaStr: '=IF(SBC<5%, "GREEN", "RED")', flagRules: { green: '< 5%', yellow: '> 10%', red: '> 20%' }, note: '🟢 <5% | 🟡 >10% | 🔴 >20%' },
  { rowNum: 61, label: 'CapEx of Net Income Flag', defaultVal: '🟢 Green (11.2%)', cellType: 'flag-green', formulaStr: '=IF(CapEx<15%, "GREEN", "RED")', flagRules: { green: '< 15%', yellow: '> 25%', red: '> 40%' }, note: '🟢 <15% | 🟡 >25% | 🔴 >40%' },
  { rowNum: 62, label: 'Free Cash Flow vs Net Income Flag', defaultVal: '🟢 Green (193.13%)', cellType: 'flag-green', formulaStr: '=IF(B44>=100%, "GREEN", "YELLOW")', flagRules: { green: 'FCF > Net Inc', yellow: 'FCF < Net Inc', red: 'FCF << Net Inc' }, note: '🟢 FCF > Net Inc | 🟡 FCF < Net Inc | 🔴 FCF << Net Inc' },
  { rowNum: 63, label: 'Cash Flow to Debt Ratio Flag', defaultVal: '🟢 Green (1.16)', cellType: 'flag-green', formulaStr: '=IF(CFDebt>1.0, "GREEN", "RED")', flagRules: { green: '> 1.0', yellow: '< 0.3', red: '< 0.1' }, note: '🟢 >1.0 | 🟡 <0.3 | 🔴 <0.1' },
  { rowNum: 64, label: 'Operating Cash Flow to Sales Flag', defaultVal: '🟢 Green (28.6%)', cellType: 'flag-green', formulaStr: '=IF(B40>=15%, "GREEN", "YELLOW")', flagRules: { green: '15%+', yellow: '< 10%', red: '< 5%' }, note: '🟢 15%+ | 🟡 <10% | 🔴 <5%' }
];

export default function StockChecklistModal({ isOpen, onClose, stock, stocks = [] }: StockChecklistModalProps) {
  const [selectedTicker, setSelectedTicker] = useState<string>(stock?.ticker || 'AAPL');
  const [activeRow, setActiveRow] = useState<number>(2);

  // Raw human inputs stored by row number
  const [userInputs, setUserInputs] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    EXACT_SHEET_ROWS.forEach(r => { init[r.rowNum] = r.defaultVal; });
    return init;
  });

  useEffect(() => {
    if (stock) {
      setSelectedTicker(stock.ticker);
      setUserInputs(prev => ({
        ...prev,
        1: stock.companyName || stock.ticker,
        2: stock.ticker,
        7: stock.currentPrice ? String(stock.currentPrice) : prev[7],
        10: stock.pe ? String(stock.pe) : prev[10]
      }));
    }
  }, [stock]);

  const handleSelectTicker = (sym: string) => {
    setSelectedTicker(sym);
    const found = stocks.find(s => s.ticker === sym);
    if (found) {
      setUserInputs(prev => ({
        ...prev,
        1: found.companyName || found.ticker,
        2: found.ticker,
        7: found.currentPrice ? String(found.currentPrice) : prev[7],
        10: found.pe ? String(found.pe) : prev[10]
      }));
    }
  };

  const handleInputChange = (rowNum: number, val: string) => {
    setUserInputs(prev => ({ ...prev, [rowNum]: val }));
  };

  const parseNum = (val: string | undefined): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9.-]/g, '');
    return parseFloat(clean) || 0;
  };

  // Live Auto-Calculated Formula Values & Dynamic Statement Flags
  const computedValues = useMemo(() => {
    const rev = parseNum(userInputs[19]);        // B19: Revenue
    const netInc = parseNum(userInputs[26]);     // B26: Net Income
    const fcf = parseNum(userInputs[38]);        // B38: Free Cash Flow
    const cffo = parseNum(userInputs[36]);       // B36: Cash Flow from Operations
    const price = parseNum(userInputs[7]);       // B7: Current Price
    const mcap = parseNum(userInputs[9]);        // B9: Market Cap
    const shares = parseNum(userInputs[18]);     // B18: Shares Outstanding
    const deRatio = parseNum(userInputs[35]);    // B35: Debt to Equity

    let epsCalc = parseNum(userInputs[24]);
    if (shares > 0 && netInc !== 0) {
      epsCalc = netInc / shares;
    }

    const calculated: Record<number, string> = {};

    if (shares > 0 && netInc !== 0) calculated[24] = epsCalc.toFixed(2);
    if (rev > 0 && netInc !== 0) calculated[27] = `${((netInc / rev) * 100).toFixed(2)}%`;
    if (rev > 0 && cffo > 0) calculated[40] = `${((cffo / rev) * 100).toFixed(2)}%`;
    if (rev > 0 && fcf > 0) calculated[41] = `${((fcf / rev) * 100).toFixed(2)}%`;
    if (mcap > 0 && fcf > 0) calculated[42] = `${((fcf / mcap) * 100).toFixed(2)}%`;
    if (price > 0 && epsCalc > 0) calculated[43] = `${((epsCalc / price) * 100).toFixed(2)}%`;
    if (netInc !== 0 && fcf > 0) calculated[44] = `${((fcf / netInc) * 100).toFixed(2)}%`;

    // Dynamic Financial Flags Rows (#49 to #64)
    const grossMarginVal = parseNum(userInputs[21]) || 46.2;
    calculated[49] = grossMarginVal >= 40 ? `🟢 GREEN (${grossMarginVal}%)` : grossMarginVal >= 30 ? `🟡 YELLOW (${grossMarginVal}%)` : `🔴 RED (${grossMarginVal}%)`;

    const revGrowthVal = parseNum(userInputs[20]) || 8.2;
    calculated[50] = revGrowthVal >= 15 ? `🟢 GREEN (${revGrowthVal}%)` : revGrowthVal >= 10 ? `🟡 YELLOW (${revGrowthVal}%)` : `🔴 RED (${revGrowthVal}%)`;

    const netMarginVal = parseNum(userInputs[27]) || 25.9;
    calculated[52] = netMarginVal >= 17 ? `🟢 GREEN (${netMarginVal}%)` : netMarginVal >= 5 ? `🟡 YELLOW (${netMarginVal}%)` : `🔴 RED (${netMarginVal}%)`;

    calculated[56] = deRatio <= 1.0 ? `🟢 GREEN (${deRatio})` : deRatio <= 2.0 ? `🟡 YELLOW (${deRatio})` : `🔴 RED (${deRatio})`;

    return calculated;
  }, [userInputs]);

  if (!isOpen) return null;

  const activeRowDef = EXACT_SHEET_ROWS.find(r => r.rowNum === activeRow);
  const activeCellVal = computedValues[activeRow] || userInputs[activeRow] || '';
  const activeFormulaStr = activeRowDef?.formulaStr || activeCellVal;

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
                <span className="text-[10px] bg-white/20 text-white font-mono px-2 py-0.5 rounded border border-white/30 font-bold uppercase">Пълни Финансови Сигнали (🟢🟡🔴)</span>
              </div>
              <p className="text-[11px] text-white/80">Google Sheets формат с вградени Green, Yellow & Red Statement Flags</p>
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
                <option value={selectedTicker}>{selectedTicker} - {userInputs[1]}</option>
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
            onChange={e => handleInputChange(activeRow, e.target.value)}
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
                <th className="w-[340px] px-3 py-1.5 border-r border-[#DADCE0] dark:border-[#3C4043] font-bold uppercase tracking-wider text-[#3C4043] dark:text-[#E8EAED]">A (Показател / Раздел)</th>
                <th className="w-[260px] px-3 py-1.5 border-r border-[#DADCE0] dark:border-[#3C4043] font-bold uppercase tracking-wider text-[#3C4043] dark:text-[#E8EAED]">B (Стойност / Флаг)</th>
                <th className="px-3 py-1.5 font-bold uppercase tracking-wider text-[#3C4043] dark:text-[#E8EAED]">C (Формула & Финансови Граници)</th>
              </tr>
            </thead>
            <tbody>
              {EXACT_SHEET_ROWS.map((row) => {
                const isActive = activeRow === row.rowNum;
                const isSectionHeader = row.label.startsWith('---');

                if (isSectionHeader) {
                  return (
                    <tr key={row.rowNum} className="bg-[#E8F0FE] dark:bg-[#172B4D] font-bold border-y-2 border-[#1A73E8]">
                      <td className="border-r border-[#DADCE0] dark:border-[#3C4043] text-center font-mono text-[10px] text-[#1A73E8]">{row.rowNum}</td>
                      <td className="px-3 py-2 text-[#1A73E8] dark:text-blue-300 font-extrabold uppercase tracking-wider" colSpan={3}>
                        {row.label}
                      </td>
                    </tr>
                  );
                }

                // Value to display in Column B
                const displayVal = computedValues[row.rowNum] || userInputs[row.rowNum] || row.defaultVal;
                const isComputedCell = !!computedValues[row.rowNum] || row.cellType === 'green-formula';

                // Cell B background styling
                let cellBStyle = 'bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100';
                if (row.cellType === 'yellow-input') {
                  cellBStyle = 'bg-[#FFFDE4] dark:bg-[#423D1C] text-[#854D0E] dark:text-[#FDE047] font-black border-2 border-[#EAB308] shadow-xs';
                } else if (row.cellType === 'flag-green' || displayVal.includes('🟢')) {
                  cellBStyle = 'bg-[#E6F4EA] dark:bg-[#133E2B] text-[#137333] dark:text-[#6EE7B7] font-black border-2 border-[#34A853]';
                } else if (row.cellType === 'flag-yellow' || displayVal.includes('🟡')) {
                  cellBStyle = 'bg-[#FEF7E0] dark:bg-[#3C3214] text-[#B06000] dark:text-[#FDE047] font-black border-2 border-[#FBBC04]';
                } else if (row.cellType === 'flag-red' || displayVal.includes('🔴')) {
                  cellBStyle = 'bg-[#FCE8E6] dark:bg-[#4C1D1D] text-[#C5221F] dark:text-[#FCA5A5] font-black border-2 border-[#EA4335]';
                } else if (isComputedCell) {
                  cellBStyle = 'bg-[#E6F4EA] dark:bg-[#133E2B] text-[#137333] dark:text-[#6EE7B7] font-black border border-[#34A853]/40';
                } else if (row.cellType === 'ref-error') {
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

                    {/* Column A: Metric Name */}
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

                    {/* Column B: Editable / Dynamic Value or Flag */}
                    <td className={`px-2 py-1 border-r border-[#DADCE0] dark:border-[#3C4043] font-mono text-xs relative ${
                      isActive ? 'outline-2 outline-[#1A73E8] z-10' : ''
                    }`}>
                      <input
                        type="text"
                        value={displayVal}
                        onChange={e => handleInputChange(row.rowNum, e.target.value)}
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
              <span>Stock Valuation & Statement Flags</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-[#854D0E] dark:text-[#FDE047] font-bold">
              <span className="w-3 h-3 rounded bg-[#FFFDE4] border border-[#EAB308] inline-block" />
              Жълти = Попълване
            </span>
            <span className="flex items-center gap-1 text-[#137333] dark:text-[#6EE7B7] font-bold">
              <span className="w-3 h-3 rounded bg-[#E6F4EA] border border-[#34A853] inline-block" />
              🟢 Зелени Флагове
            </span>
            <span className="flex items-center gap-1 text-[#B06000] dark:text-[#FDE047] font-bold">
              <span className="w-3 h-3 rounded bg-[#FEF7E0] border border-[#FBBC04] inline-block" />
              🟡 Жълти Флагове
            </span>
            <span className="flex items-center gap-1 text-[#C5221F] dark:text-[#FCA5A5] font-bold">
              <span className="w-3 h-3 rounded bg-[#FCE8E6] border border-[#EA4335] inline-block" />
              🔴 Червени Флагове
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
