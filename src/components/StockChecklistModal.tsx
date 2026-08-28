import React, { useState, useEffect, useMemo } from 'react';
import { Stock } from '../types';
import { X, Table, ExternalLink, Info } from 'lucide-react';
import { getSectorForStock } from '../utils/sectorHelper';

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
  // SECTION 1: CORE VALUATION (ROWS 1 - 48)
  { rowNum: 1, label: 'Company', defaultVal: '', cellType: 'default', formulaStr: '=GOOGLEFINANCE(B2, "name")', note: 'Автоматично от борсовия тикер' },
  { rowNum: 2, label: 'Tickr', defaultVal: '', cellType: 'yellow-input', note: 'Въвежда се от човека (напр. AAPL, NVDA, TSLA)' },
  { rowNum: 3, label: 'Industry', defaultVal: '', cellType: 'default', note: 'Индустриален сектор' },
  { rowNum: 4, label: 'Sector', defaultVal: '', cellType: 'default', note: 'Основен сектор' },
  { rowNum: 5, label: 'Undervalued / Overvalued', defaultVal: '', cellType: 'green-formula', formulaStr: '=(Fair Price / Current Price) - 1', note: 'Оценка за подцененост на база справедливата цена' },
  { rowNum: 6, label: '--- FINANCIAL METRICS ---', defaultVal: '', cellType: 'default' },
  { rowNum: 7, label: 'Current Price', defaultVal: '', cellType: 'yellow-input', formulaStr: '=GOOGLEFINANCE(B2)', note: 'Текуща борсова цена ($)' },
  { rowNum: 8, label: '52 week low / 52 week high', defaultVal: '', cellType: 'ref-error', formulaStr: '=GOOGLEFINANCE(B2, "low52")', note: '52-седмично дъно и връх' },
  { rowNum: 9, label: 'Market Cap', defaultVal: '', cellType: 'yellow-input', formulaStr: '=GOOGLEFINANCE(B2, "marketcap")', note: 'Пазарна капитализация (в хиляди $)' },
  { rowNum: 10, label: 'P/E Ratio', link: 'https://fullratio.com/pe-ratio-by-industry', defaultVal: '', cellType: 'yellow-input', formulaStr: '=GOOGLEFINANCE(B2, "pe")', flagRules: { green: '≤ 15', yellow: '15 - 25', red: '> 25' }, note: 'P/E Ratio = Stock Price / EPS. Насоки: Без растеж: ≤10 | Бавен: 12 | Умерен: 15 | Бърз: 25+' },
  { rowNum: 11, label: 'Price to FCF', defaultVal: '', cellType: 'default', formulaStr: '=SUBSTITUTE(index(importhtml(...),7,4),"*","")', note: 'Price to FCF = Stock Price / FCF per share' },
  { rowNum: 12, label: 'Dividend Yield', defaultVal: '', cellType: 'default', formulaStr: '=SUBSTITUTE(index(importhtml(...),8,2),"*","")', note: 'Dividend Yield = (Annual Dividend / Stock Price) x 100' },
  { rowNum: 13, label: 'Dividend Payout Ratio', defaultVal: '', cellType: 'default', formulaStr: '=SUBSTITUTE(index(importhtml(...),12,2),"*","")', note: 'Dividend Payout Ratio = (Dividends Paid / Net Income) x 100' },
  { rowNum: 14, label: 'CASH Dividend Payout Ratio', defaultVal: '', cellType: 'default', note: 'Cash Dividend Payout Ratio = Dividends paid / Free Cash Flow x 100' },
  { rowNum: 15, label: 'Dividend Growth Rate 5 - 10 year avg', defaultVal: '', cellType: 'default', note: 'Средногодишен ръст на дивидента' },
  { rowNum: 16, label: '5 yrs Annualized ROI', defaultVal: '', cellType: 'default', formulaStr: '=Overview!J19', note: 'Годишна възвръщаемост 5г.' },
  { rowNum: 17, label: '10 yrs Annualized ROI', defaultVal: '', cellType: 'default', formulaStr: '=Overview!J29', note: 'Годишна възвръщаемост 10г.' },
  { rowNum: 18, label: 'Shares Outstanding', defaultVal: '', cellType: 'yellow-input', formulaStr: '=GOOGLEFINANCE(B2, "shares")', note: 'Брой акции в обращение' },
  { rowNum: 19, label: 'Revenue', defaultVal: '', cellType: 'yellow-input', note: 'Годишни брутни приходи ($)' },
  { rowNum: 20, label: 'Revenue avg increase 3 yrs', defaultVal: '', cellType: 'yellow-input', note: 'Среден ръст на приходите за 3 години' },
  { rowNum: 21, label: 'Revenue avg increase 5 yrs', defaultVal: '', cellType: 'yellow-input', note: 'Среден ръст на приходите за 5 години' },
  { rowNum: 22, label: 'Gross Profit Margin', defaultVal: '', cellType: 'green-formula', formulaStr: '=(Gross Profit / Total Revenue) x 100', flagRules: { green: '40%+', yellow: '30% - 40%', red: '< 30%' }, note: 'Брутен марж' },
  { rowNum: 23, label: 'Research & Development (R&D Ratio)', defaultVal: '', cellType: 'green-formula', flagRules: { green: '< 30%', yellow: '30% - 40%', red: '> 40%' }, note: 'R&D Ratio (< 30%)' },
  { rowNum: 24, label: 'Selling, General & Admin (SG&A Ratio)', defaultVal: '', cellType: 'green-formula', flagRules: { green: '< 30%', yellow: '30% - 40%', red: '> 40%' }, note: 'SG&A Ratio (< 30%)' },
  { rowNum: 25, label: 'EPS - Earnings Per Share', defaultVal: '', cellType: 'green-formula', formulaStr: '=Net Income / Shares Outstanding', note: 'Печалба на акция ($)' },
  { rowNum: 26, label: 'EPS Growth 5 - 10 yrs', defaultVal: '', cellType: 'green-formula', note: 'Ръст на EPS' },
  { rowNum: 27, label: 'Net Income', defaultVal: '', cellType: 'yellow-input', note: 'Нетна печалба ($)' },
  { rowNum: 28, label: 'Net Profit Margin', defaultVal: '', cellType: 'green-formula', formulaStr: '=(Net Income / Revenue) x 100', flagRules: { green: '17%+', yellow: '5% - 17%', red: '< 5%' }, note: 'Чист марж (> 20%)' },
  { rowNum: 29, label: 'Return on Equity (ROE)', defaultVal: '', cellType: 'yellow-input', flagRules: { green: '15%+', yellow: '5% - 15%', red: '< 5%' }, note: 'ROE (> 15%)' },
  { rowNum: 30, label: 'Return on Assets (ROA)', defaultVal: '', cellType: 'yellow-input', flagRules: { green: '5%+', yellow: '2% - 5%', red: '< 2%' }, note: 'ROA (> 5%)' },
  { rowNum: 31, label: 'Return on Capital (ROIC)', defaultVal: '', cellType: 'yellow-input', flagRules: { green: '15%+', yellow: '5% - 15%', red: '< 5%' }, note: 'ROIC (> 15% е силен Moat)' },
  { rowNum: 32, label: 'Current Ratio', defaultVal: '', cellType: 'yellow-input', flagRules: { green: '1.0+', yellow: '0.8 - 1.0', red: '< 0.8' }, note: 'Текуща ликвидност (> 1.0)' },
  { rowNum: 33, label: 'Long - Term Debt', defaultVal: '', cellType: 'yellow-input', note: 'Дългосрочен дълг ($)' },
  { rowNum: 34, label: 'Avg Debt Increase 10 yrs', defaultVal: '', cellType: 'default', note: 'Средно увеличение на дълга' },
  { rowNum: 35, label: 'Long-term Debt to Equity Ratio', defaultVal: '', cellType: 'default', note: 'Дългосрочен дълг / капитал' },
  { rowNum: 36, label: 'Debt to Equity Ratio', defaultVal: '', cellType: 'yellow-input', flagRules: { green: '< 1.0', yellow: '1.0 - 2.0', red: '> 2.0' }, note: 'Задължения / капитал' },
  { rowNum: 37, label: 'Cash Flow from Operations', defaultVal: '', cellType: 'yellow-input', note: 'Оперативен кеш поток (CFFO)' },
  { rowNum: 38, label: 'CFFO 5-10 Years increase', defaultVal: '', cellType: 'default', note: 'Ръст на CFFO' },
  { rowNum: 39, label: 'Free Cash Flow', defaultVal: '', cellType: 'yellow-input', note: 'Свободен паричен поток (FCF)' },
  { rowNum: 40, label: 'FCF 5 - 10 years avg increase', defaultVal: '', cellType: 'green-formula', note: 'Ръст на FCF' },
  { rowNum: 41, label: 'Cash Flow Margin', defaultVal: '', cellType: 'green-formula', formulaStr: '=B37/B19', flagRules: { green: '15%+', yellow: '10% - 15%', red: '< 10%' }, note: 'Cash Flow Margin = CFFO / Revenue x 100' },
  { rowNum: 42, label: 'Free Cash Flow Margin', defaultVal: '', cellType: 'green-formula', formulaStr: '=(B39/B19)', flagRules: { green: '15%+', yellow: '10% - 15%', red: '< 10%' }, note: 'Free Cash Flow Margin = FCF / Revenue x 100' },
  { rowNum: 43, label: 'Free Cash Flow Yield', defaultVal: '', cellType: 'green-formula', formulaStr: '=1*(B39/B9)', flagRules: { green: '5%+', yellow: '3% - 5%', red: '< 3%' }, note: 'FCF Yield = FCF / Market Cap x 100' },
  { rowNum: 44, label: 'Earnings Yield', defaultVal: '', cellType: 'green-formula', formulaStr: '=B25/B7', flagRules: { green: '7%+', yellow: '4% - 7%', red: '< 4%' }, note: 'Earnings Yield = EPS / Price x 100' },
  { rowNum: 45, label: 'Free Cash Flow  / Net Income', defaultVal: '', cellType: 'green-formula', formulaStr: '=B39/B27', flagRules: { green: '100%+', yellow: '70% - 100%', red: '< 70%' }, note: 'FCF / Net Income (>100% е отлично)' },
  { rowNum: 46, label: 'Cash Flow Coverage Ratio', defaultVal: '', cellType: 'yellow-input', flagRules: { green: '> 1.0', yellow: '0.5 - 1.0', red: '< 0.5' }, note: 'CFFO / Long-Term Debt' },
  { rowNum: 47, label: 'Operating Cash Flow Ratio', defaultVal: '', cellType: 'default', note: 'CFFO / Current Liabilities' },
  { rowNum: 48, label: 'Cash ROA', defaultVal: '', cellType: 'yellow-input', note: 'Възвръщаемост на активите на база кеш' },

  // SECTION 2: FINANCIAL STATEMENTS FLAGS
  { rowNum: 49, label: '--- INCOME STATEMENT FLAGS (🟢🟡🔴) ---', defaultVal: '', cellType: 'default' },
  { rowNum: 50, label: 'Gross Margin Flag (Брутен марж)', defaultVal: '', cellType: 'flag-green', formulaStr: '=IF(B22>=40%, "GREEN", IF(B22<30%, "YELLOW", "RED"))', flagRules: { green: '40%+', yellow: '< 30%', red: '< 10%' }, note: '🟢 40%+ | 🟡 <30% | 🔴 <10%' },
  { rowNum: 51, label: 'Revenue Growth Rate Flag (3г. / 5г.)', defaultVal: '', cellType: 'flag-yellow', formulaStr: '=IF(OR(B20>=15%, B21>=15%), "GREEN", "YELLOW")', flagRules: { green: '15%+', yellow: '< 10%', red: '< 2%' }, note: '🟢 15%+ | 🟡 <10% | 🔴 <2%' },
  { rowNum: 52, label: 'EBITDA Margin Flag', defaultVal: '', cellType: 'flag-green', formulaStr: '=IF(EBITDA>=20%, "GREEN", "YELLOW")', flagRules: { green: '20%+', yellow: '< 10%', red: '< 3%' }, note: '🟢 20%+ | 🟡 <10% | 🔴 <3%' },
  { rowNum: 53, label: 'Net Profit Margin Flag', defaultVal: '', cellType: 'flag-green', formulaStr: '=IF(B28>=17%, "GREEN", IF(B28<5%, "YELLOW", "RED"))', flagRules: { green: '17%+', yellow: '< 5%', red: '< 1%' }, note: '🟢 17%+ | 🟡 <5% | 🔴 <1%' },
  { rowNum: 54, label: 'Interest Coverage Rate Flag', defaultVal: '', cellType: 'flag-green', formulaStr: '=IF(Coverage>5, "GREEN", "RED")', flagRules: { green: '> 5x', yellow: '< 2x', red: '< 1.5x' }, note: '🟢 >5x | 🟡 <2x | 🔴 <1.5x' },

  { rowNum: 55, label: '--- BALANCE SHEET FLAGS (🟢🟡🔴) ---', defaultVal: '', cellType: 'default' },
  { rowNum: 56, label: 'Goodwill in Assets Flag', defaultVal: '', cellType: 'flag-green', formulaStr: '=IF(Goodwill<10%, "GREEN", "RED")', flagRules: { green: '< 10%', yellow: '> 20%', red: '> 30%' }, note: '🟢 <10% | 🟡 >20% | 🔴 >30%' },
  { rowNum: 57, label: 'Debt to Equity Ratio Flag', defaultVal: '', cellType: 'flag-yellow', formulaStr: '=IF(B36<1.0, "GREEN", IF(B36>2.0, "YELLOW", "RED"))', flagRules: { green: '< 1.0', yellow: '> 2.0', red: '> 4.0' }, note: '🟢 <1.0 | 🟡 >2.0 | 🔴 >4.0' },
  { rowNum: 58, label: 'Asset Turnover Ratio Flag', defaultVal: '', cellType: 'flag-yellow', formulaStr: '=IF(Turnover>3.0, "GREEN", "YELLOW")', flagRules: { green: '> 3.0', yellow: '< 1.0', red: '< 0.5' }, note: '🟢 >3.0 | 🟡 <1.0 | 🔴 <0.5' },
  { rowNum: 59, label: 'Quick Ratio Flag', defaultVal: '', cellType: 'flag-yellow', formulaStr: '=IF(Quick>=1.0, "GREEN", "YELLOW")', flagRules: { green: '1.0+', yellow: '< 0.8', red: '< 0.3' }, note: '🟢 1.0+ | 🟡 <0.8 | 🔴 <0.3' },

  { rowNum: 60, label: '--- CASH FLOW STATEMENT FLAGS (🟢🟡🔴) ---', defaultVal: '', cellType: 'default' },
  { rowNum: 61, label: 'Stock-based Compensation Flag', defaultVal: '', cellType: 'flag-green', formulaStr: '=IF(SBC<5%, "GREEN", "RED")', flagRules: { green: '< 5%', yellow: '> 10%', red: '> 20%' }, note: '🟢 <5% | 🟡 >10% | 🔴 >20%' },
  { rowNum: 62, label: 'CapEx of Net Income Flag', defaultVal: '', cellType: 'flag-green', formulaStr: '=IF(CapEx<15%, "GREEN", "RED")', flagRules: { green: '< 15%', yellow: '> 25%', red: '> 40%' }, note: '🟢 <15% | 🟡 >25% | 🔴 >40%' },
  { rowNum: 63, label: 'Free Cash Flow vs Net Income Flag', defaultVal: '', cellType: 'flag-green', formulaStr: '=IF(B45>=100%, "GREEN", "YELLOW")', flagRules: { green: 'FCF > Net Inc', yellow: 'FCF < Net Inc', red: 'FCF << Net Inc' }, note: '🟢 FCF > Net Inc | 🟡 FCF < Net Inc | 🔴 FCF << Net Inc' },
  { rowNum: 64, label: 'Cash Flow to Debt Ratio Flag', defaultVal: '', cellType: 'flag-green', formulaStr: '=IF(CFDebt>1.0, "GREEN", "RED")', flagRules: { green: '> 1.0', yellow: '< 0.3', red: '< 0.1' }, note: '🟢 >1.0 | 🟡 <0.3 | 🔴 <0.1' },
  { rowNum: 65, label: 'Operating Cash Flow to Sales Flag', defaultVal: '', cellType: 'flag-green', formulaStr: '=IF(B41>=15%, "GREEN", "YELLOW")', flagRules: { green: '15%+', yellow: '< 10%', red: '< 5%' }, note: '🟢 15%+ | 🟡 <10% | 🔴 <5%' }
];

export default function StockChecklistModal({ isOpen, onClose, stock, stocks = [] }: StockChecklistModalProps) {
  const [selectedTicker, setSelectedTicker] = useState<string>(stock?.ticker || '');
  const [activeRow, setActiveRow] = useState<number>(2);
  const [activeInfoModalRow, setActiveInfoModalRow] = useState<SheetRowDefinition | null>(null);

  const [userInputs, setUserInputs] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    EXACT_SHEET_ROWS.forEach(r => { init[r.rowNum] = ''; });
    return init;
  });

  const updateStockRowDetails = (sym: string) => {
    const cleanSym = sym.toUpperCase().trim();
    if (!cleanSym) return;

    const found = stocks.find(s => s.ticker.toUpperCase() === cleanSym);
    const sectorName = getSectorForStock(cleanSym, found?.sector, found?.companyName);
    const industryName = `${sectorName} Products & Services`;

    let marketCapInThousands = '';
    if (found?.marketCap) {
      const inThousands = Math.round(found.marketCap / 1000);
      marketCapInThousands = inThousands.toLocaleString('en-US');
    }

    let low52High52 = '';
    if (found?.low52 && found?.high52) {
      low52High52 = `${found.low52.toFixed(2)} / ${found.high52.toFixed(2)}`;
    }

    setUserInputs(prev => ({
      ...prev,
      1: found?.companyName || cleanSym,
      2: cleanSym,
      3: industryName,
      4: sectorName,
      7: found?.currentPrice ? found.currentPrice.toFixed(2) : prev[7],
      8: low52High52,
      9: marketCapInThousands,
      10: found?.peRatio ? found.peRatio.toFixed(1) : (found?.pe ? String(found.pe) : prev[10])
    }));
  };

  useEffect(() => {
    if (stock && stock.ticker) {
      setSelectedTicker(stock.ticker);
      updateStockRowDetails(stock.ticker);
    }
  }, [stock]);

  const handleSelectTicker = (sym: string) => {
    setSelectedTicker(sym);
    updateStockRowDetails(sym);
  };

  const handleInputChange = (rowNum: number, val: string) => {
    setUserInputs(prev => ({ ...prev, [rowNum]: val }));

    if (rowNum === 2 && val.trim().length >= 1) {
      const cleanSym = val.toUpperCase().trim();
      setSelectedTicker(cleanSym);
      updateStockRowDetails(cleanSym);
    }
  };

  const handleClearAll = () => {
    setSelectedTicker('');
    const cleared: Record<number, string> = {};
    EXACT_SHEET_ROWS.forEach(r => { cleared[r.rowNum] = ''; });
    setUserInputs(cleared);
  };

  const parseNum = (val: string | undefined): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9.-]/g, '');
    return parseFloat(clean) || 0;
  };

  // Dynamic Conditional Formatting Logic
  const getConditionalFormattingStyle = (rowNum: number, valStr: string): string => {
    if (!valStr || valStr.trim() === '') {
      return 'bg-[#F8F9FA] dark:bg-[#2D2E31] text-[#5F6368] dark:text-[#9AA0A6] border border-[#DADCE0] dark:border-[#5F6368]';
    }

    const val = parseNum(valStr);

    if (valStr.includes('🟢') || valStr.includes('GREEN')) {
      return 'bg-[#E6F4EA] dark:bg-[#133E2B] text-[#137333] dark:text-[#6EE7B7] font-black border-2 border-[#34A853]';
    }
    if (valStr.includes('🟡') || valStr.includes('YELLOW')) {
      return 'bg-[#FEF7E0] dark:bg-[#3C3214] text-[#B06000] dark:text-[#FDE047] font-black border-2 border-[#FBBC04]';
    }
    if (valStr.includes('🔴') || valStr.includes('RED')) {
      return 'bg-[#FCE8E6] dark:bg-[#4C1D1D] text-[#C5221F] dark:text-[#FCA5A5] font-black border-2 border-[#EA4335]';
    }

    if (rowNum === 10) {
      if (val > 0 && val <= 15) return 'bg-[#E6F4EA] dark:bg-[#133E2B] text-[#137333] dark:text-[#6EE7B7] font-black border-2 border-[#34A853]';
      if (val > 15 && val <= 25) return 'bg-[#FEF7E0] dark:bg-[#3C3214] text-[#B06000] dark:text-[#FDE047] font-black border-2 border-[#FBBC04]';
      if (val > 25) return 'bg-[#FCE8E6] dark:bg-[#4C1D1D] text-[#C5221F] dark:text-[#FCA5A5] font-black border-2 border-[#EA4335]';
    }
    if (rowNum === 22 || rowNum === 50) {
      if (val >= 40) return 'bg-[#E6F4EA] dark:bg-[#133E2B] text-[#137333] dark:text-[#6EE7B7] font-black border-2 border-[#34A853]';
      if (val >= 30) return 'bg-[#FEF7E0] dark:bg-[#3C3214] text-[#B06000] dark:text-[#FDE047] font-black border-2 border-[#FBBC04]';
      if (val < 30 && val > 0) return 'bg-[#FCE8E6] dark:bg-[#4C1D1D] text-[#C5221F] dark:text-[#FCA5A5] font-black border-2 border-[#EA4335]';
    }
    if (rowNum === 28 || rowNum === 53) {
      if (val >= 17) return 'bg-[#E6F4EA] dark:bg-[#133E2B] text-[#137333] dark:text-[#6EE7B7] font-black border-2 border-[#34A853]';
      if (val >= 5) return 'bg-[#FEF7E0] dark:bg-[#3C3214] text-[#B06000] dark:text-[#FDE047] font-black border-2 border-[#FBBC04]';
      if (val < 5 && val > 0) return 'bg-[#FCE8E6] dark:bg-[#4C1D1D] text-[#C5221F] dark:text-[#FCA5A5] font-black border-2 border-[#EA4335]';
    }
    if (rowNum === 29) {
      if (val >= 15) return 'bg-[#E6F4EA] dark:bg-[#133E2B] text-[#137333] dark:text-[#6EE7B7] font-black border-2 border-[#34A853]';
      if (val >= 5) return 'bg-[#FEF7E0] dark:bg-[#3C3214] text-[#B06000] dark:text-[#FDE047] font-black border-2 border-[#FBBC04]';
      if (val < 5 && val !== 0) return 'bg-[#FCE8E6] dark:bg-[#4C1D1D] text-[#C5221F] dark:text-[#FCA5A5] font-black border-2 border-[#EA4335]';
    }
    if (rowNum === 30) {
      if (val >= 5) return 'bg-[#E6F4EA] dark:bg-[#133E2B] text-[#137333] dark:text-[#6EE7B7] font-black border-2 border-[#34A853]';
      if (val >= 2) return 'bg-[#FEF7E0] dark:bg-[#3C3214] text-[#B06000] dark:text-[#FDE047] font-black border-2 border-[#FBBC04]';
      if (val < 2 && val !== 0) return 'bg-[#FCE8E6] dark:bg-[#4C1D1D] text-[#C5221F] dark:text-[#FCA5A5] font-black border-2 border-[#EA4335]';
    }
    if (rowNum === 31) {
      if (val >= 15) return 'bg-[#E6F4EA] dark:bg-[#133E2B] text-[#137333] dark:text-[#6EE7B7] font-black border-2 border-[#34A853]';
      if (val >= 5) return 'bg-[#FEF7E0] dark:bg-[#3C3214] text-[#B06000] dark:text-[#FDE047] font-black border-2 border-[#FBBC04]';
      if (val < 5 && val !== 0) return 'bg-[#FCE8E6] dark:bg-[#4C1D1D] text-[#C5221F] dark:text-[#FCA5A5] font-black border-2 border-[#EA4335]';
    }
    if (rowNum === 32 || rowNum === 59) {
      if (val >= 1.0) return 'bg-[#E6F4EA] dark:bg-[#133E2B] text-[#137333] dark:text-[#6EE7B7] font-black border-2 border-[#34A853]';
      if (val >= 0.8) return 'bg-[#FEF7E0] dark:bg-[#3C3214] text-[#B06000] dark:text-[#FDE047] font-black border-2 border-[#FBBC04]';
      if (val < 0.8 && val > 0) return 'bg-[#FCE8E6] dark:bg-[#4C1D1D] text-[#C5221F] dark:text-[#FCA5A5] font-black border-2 border-[#EA4335]';
    }
    if (rowNum === 36 || rowNum === 57) {
      if (val > 0 && val <= 1.0) return 'bg-[#E6F4EA] dark:bg-[#133E2B] text-[#137333] dark:text-[#6EE7B7] font-black border-2 border-[#34A853]';
      if (val > 1.0 && val <= 2.0) return 'bg-[#FEF7E0] dark:bg-[#3C3214] text-[#B06000] dark:text-[#FDE047] font-black border-2 border-[#FBBC04]';
      if (val > 2.0) return 'bg-[#FCE8E6] dark:bg-[#4C1D1D] text-[#C5221F] dark:text-[#FCA5A5] font-black border-2 border-[#EA4335]';
    }
    if (rowNum === 41 || rowNum === 65) {
      if (val >= 15) return 'bg-[#E6F4EA] dark:bg-[#133E2B] text-[#137333] dark:text-[#6EE7B7] font-black border-2 border-[#34A853]';
      if (val >= 10) return 'bg-[#FEF7E0] dark:bg-[#3C3214] text-[#B06000] dark:text-[#FDE047] font-black border-2 border-[#FBBC04]';
      if (val < 10 && val > 0) return 'bg-[#FCE8E6] dark:bg-[#4C1D1D] text-[#C5221F] dark:text-[#FCA5A5] font-black border-2 border-[#EA4335]';
    }

    return 'bg-white dark:bg-[#2A2B2E] text-slate-800 dark:text-slate-100 font-bold border border-[#DADCE0] dark:border-[#5F6368]';
  };

  // Live Auto-Calculated Formula Values
  const computedValues = useMemo(() => {
    const rev = parseNum(userInputs[19]);
    const netInc = parseNum(userInputs[27]);
    const fcf = parseNum(userInputs[39]);
    const cffo = parseNum(userInputs[37]);
    const price = parseNum(userInputs[7]);
    const mcap = parseNum(userInputs[9]);
    const shares = parseNum(userInputs[18]);
    const deRatio = parseNum(userInputs[36]);

    let epsCalc = parseNum(userInputs[25]);
    if (shares > 0 && netInc !== 0) {
      epsCalc = netInc / shares;
    }

    const calculated: Record<number, string> = {};

    if (shares > 0 && netInc !== 0) calculated[25] = epsCalc.toFixed(2);
    if (rev > 0 && netInc !== 0) calculated[28] = `${((netInc / rev) * 100).toFixed(2)}%`;
    if (rev > 0 && cffo > 0) calculated[41] = `${((cffo / rev) * 100).toFixed(2)}%`;
    if (rev > 0 && fcf > 0) calculated[42] = `${((fcf / rev) * 100).toFixed(2)}%`;
    if (mcap > 0 && fcf > 0) calculated[43] = `${((fcf / mcap) * 100).toFixed(2)}%`;
    if (price > 0 && epsCalc > 0) calculated[44] = `${((epsCalc / price) * 100).toFixed(2)}%`;
    if (netInc !== 0 && fcf > 0) calculated[45] = `${((fcf / netInc) * 100).toFixed(2)}%`;

    // Dynamic Financial Flags Rows (#50 to #65)
    const grossMarginVal = parseNum(userInputs[22]);
    if (userInputs[22] && userInputs[22].trim() !== '') {
      calculated[50] = grossMarginVal >= 40 ? `🟢 GREEN (${grossMarginVal}%)` : grossMarginVal >= 30 ? `🟡 YELLOW (${grossMarginVal}%)` : `🔴 RED (${grossMarginVal}%)`;
    }

    const revGrowthVal3 = parseNum(userInputs[20]);
    const revGrowthVal5 = parseNum(userInputs[21]);
    const activeRevGrowth = revGrowthVal3 || revGrowthVal5;
    if (activeRevGrowth > 0) {
      calculated[51] = activeRevGrowth >= 15 ? `🟢 GREEN (${activeRevGrowth}%)` : activeRevGrowth >= 10 ? `🟡 YELLOW (${activeRevGrowth}%)` : `🔴 RED (${activeRevGrowth}%)`;
    }

    const netMarginVal = parseNum(userInputs[28]);
    if (userInputs[28] && userInputs[28].trim() !== '') {
      calculated[53] = netMarginVal >= 17 ? `🟢 GREEN (${netMarginVal}%)` : netMarginVal >= 5 ? `🟡 YELLOW (${netMarginVal}%)` : `🔴 RED (${netMarginVal}%)`;
    }

    if (userInputs[36] && userInputs[36].trim() !== '') {
      calculated[57] = deRatio <= 1.0 ? `🟢 GREEN (${deRatio})` : deRatio <= 2.0 ? `🟡 YELLOW (${deRatio})` : `🔴 RED (${deRatio})`;
    }

    return calculated;
  }, [userInputs]);

  if (!isOpen) return null;

  const activeRowDef = EXACT_SHEET_ROWS.find(r => r.rowNum === activeRow);
  const activeUserVal = userInputs[activeRow];
  const activeCellVal = computedValues[activeRow] !== undefined 
    ? computedValues[activeRow] 
    : (activeUserVal !== undefined ? activeUserVal : (activeRowDef?.defaultVal || ''));
  const activeFormulaStr = activeRowDef?.formulaStr || activeCellVal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose}>
      <div className="relative w-full max-w-5xl h-[94vh] bg-[#FFFFFF] dark:bg-[#1E1E1E] border border-[#DADCE0] dark:border-[#3C4043] rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans select-none text-slate-800 dark:text-slate-100" onClick={e => e.stopPropagation()}>
        
        {/* Clean Header Bar */}
        <div className="bg-[#0F9D58] text-white px-4 py-2.5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg border border-white/30">
              <Table className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight">
                Stock Valuation Checklist
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-white/90 uppercase">Избор на Актив:</label>
              <select
                value={selectedTicker}
                onChange={e => handleSelectTicker(e.target.value)}
                className="bg-white/15 text-white font-mono font-bold text-xs rounded-lg px-2.5 py-1 outline-none border border-white/30 cursor-pointer"
              >
                <option value="" className="bg-[#1E1E1E] text-white">-- Изберете Актив --</option>
                {stocks.map(s => (
                  <option key={s.ticker} value={s.ticker} className="bg-[#1E1E1E] text-white">{s.ticker} - {s.companyName}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleClearAll}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-extrabold border border-white/30 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Изчисти всички данни"
            >
              🧹 Изчисти
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
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
              {/* Column Letter Headers (A, B, i) */}
              <tr className="bg-[#F8F9FA] dark:bg-[#2D2E31] text-[#5F6368] dark:text-[#9AA0A6] font-mono text-[11px] font-bold border-b border-[#DADCE0] dark:border-[#3C4043]">
                <th className="w-12 py-1.5 text-center border-r border-[#DADCE0] dark:border-[#3C4043] bg-[#F1F3F4] dark:bg-[#303134]">#</th>
                <th className="w-[50%] px-3 py-1.5 border-r border-[#DADCE0] dark:border-[#3C4043] font-bold uppercase tracking-wider text-[#3C4043] dark:text-[#E8EAED]">A (Показател)</th>
                <th className="w-[42%] px-3 py-1.5 border-r border-[#DADCE0] dark:border-[#3C4043] font-bold uppercase tracking-wider text-[#3C4043] dark:text-[#E8EAED]">B (Въведете стойност)</th>
                <th className="w-12 py-1.5 text-center font-bold uppercase tracking-wider text-[#3C4043] dark:text-[#E8EAED]">i</th>
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
                        {row.label.replace(/^---\s*/, '').replace(/\s*---$/, '')}
                      </td>
                    </tr>
                  );
                }

                // Value to display in Column B
                const rawUserVal = userInputs[row.rowNum];
                const displayVal = computedValues[row.rowNum] !== undefined 
                  ? computedValues[row.rowNum] 
                  : (rawUserVal !== undefined ? rawUserVal : '');

                // Dynamic Conditional Formatting Cell Style
                const dynamicCellStyle = getConditionalFormattingStyle(row.rowNum, displayVal);

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
                        <span>{row.label}</span>
                      )}
                    </td>

                    {/* Column B: Editable Value Box */}
                    <td className={`px-2 py-1 border-r border-[#DADCE0] dark:border-[#3C4043] font-mono text-xs relative ${
                      isActive ? 'outline-2 outline-[#1A73E8] z-10' : ''
                    }`}>
                      <input
                        type="text"
                        value={displayVal}
                        placeholder={row.rowNum === 2 ? "Въведете тикер (напр. AAPL)..." : "Попълнете стойност..."}
                        onChange={e => handleInputChange(row.rowNum, e.target.value)}
                        onFocus={() => setActiveRow(row.rowNum)}
                        className={`w-full px-2.5 py-1.5 rounded outline-none font-mono font-bold text-xs transition-all ${dynamicCellStyle}`}
                      />
                    </td>

                    {/* Column (i): Info Icon Button positioned on the FAR RIGHT */}
                    <td className="py-1.5 text-center border-r border-[#DADCE0] dark:border-[#3C4043]">
                      {(row.note || row.formulaStr || row.flagRules) ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveInfoModalRow(row);
                          }}
                          className="p-1 rounded-full text-indigo-400 hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="Информация, формула и граници за оцветяване"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="opacity-20 text-[10px]">-</span>
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
              <span>Stock Valuation & Dynamic Flags</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-slate-500 font-bold bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-300">
              ⚪ Сиво = Празна клетка
            </span>
            <span className="flex items-center gap-1 text-[#137333] dark:text-[#6EE7B7] font-bold bg-[#E6F4EA] dark:bg-[#133E2B] px-2 py-0.5 rounded border border-[#34A853]">
              🟢 Зелено = Перфектно
            </span>
            <span className="flex items-center gap-1 text-[#B06000] dark:text-[#FDE047] font-bold bg-[#FEF7E0] dark:bg-[#3C3214] px-2 py-0.5 rounded border border-[#FBBC04]">
              🟡 Жълто = Внимание
            </span>
            <span className="flex items-center gap-1 text-[#C5221F] dark:text-[#FCA5A5] font-bold bg-[#FCE8E6] dark:bg-[#4C1D1D] px-2 py-0.5 rounded border border-[#EA4335]">
              🔴 Червено = Висок риск
            </span>
          </div>
        </div>

      </div>

      {/* Info Popover Modal for (i) Button */}
      {activeInfoModalRow && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150" onClick={() => setActiveInfoModalRow(null)}>
          <div className="relative w-full max-w-md bg-bg border border-border/80 rounded-2xl shadow-2xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-ink">{activeInfoModalRow.label}</h3>
              </div>
              <button onClick={() => setActiveInfoModalRow(null)} className="p-1 text-ink-faint hover:text-ink cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formula */}
            {activeInfoModalRow.formulaStr && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-ink-faint tracking-wider">📐 Точна Формула в Google Sheet:</span>
                <div className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  {activeInfoModalRow.formulaStr}
                </div>
              </div>
            )}

            {/* Flag Rules */}
            {activeInfoModalRow.flagRules && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-ink-faint tracking-wider">🚦 Граници за условно оцветяване:</span>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs font-bold text-center">
                  <div className="bg-[#E6F4EA] text-[#137333] p-1.5 rounded border border-[#34A853]">
                    🟢 {activeInfoModalRow.flagRules.green}
                  </div>
                  <div className="bg-[#FEF7E0] text-[#B06000] p-1.5 rounded border border-[#FBBC04]">
                    🟡 {activeInfoModalRow.flagRules.yellow}
                  </div>
                  <div className="bg-[#FCE8E6] text-[#C5221F] p-1.5 rounded border border-[#EA4335]">
                    🔴 {activeInfoModalRow.flagRules.red}
                  </div>
                </div>
              </div>
            )}

            {/* Note */}
            {activeInfoModalRow.note && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-ink-faint tracking-wider">💡 Бележка & Разяснения:</span>
                <p className="text-xs text-ink-muted leading-relaxed bg-bg/50 p-2.5 rounded-lg border border-border/30 whitespace-pre-line">
                  {activeInfoModalRow.note}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveInfoModalRow(null)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Разбрах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
