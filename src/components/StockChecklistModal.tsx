import React, { useState, useEffect, useMemo } from 'react';
import { Stock } from '../types';
import { X, ExternalLink, Info, Lock, CheckSquare, Square, RefreshCw, CheckCircle2, PlusCircle, Check } from 'lucide-react';
import { getSectorForStock } from '../utils/sectorHelper';

interface StockChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock?: Stock | null;
  stocks?: Stock[];
  onSaveToTable?: (stockData: Partial<Stock>) => void;
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

// Fallback stock database for major tickers to guarantee instant auto-fill
const POPULAR_STOCKS_DB: Record<string, {
  companyName: string;
  industry: string;
  sector: string;
  price: number;
  low52: number;
  high52: number;
  marketCap: number; // in $
  pe: number;
  shares?: number;
  revenue?: number;
  netIncome?: number;
  fcf?: number;
}> = {
  AAPL: { companyName: 'Apple Inc.', industry: 'Consumer Electronics', sector: 'Technology', price: 224.23, low52: 164.08, high52: 237.23, marketCap: 3420000000000, pe: 34.5, shares: 15200000000, revenue: 385600000000, netIncome: 100300000000, fcf: 108800000000 },
  NVDA: { companyName: 'NVIDIA Corporation', industry: 'Semiconductors', sector: 'Technology', price: 128.50, low52: 45.90, high52: 140.76, marketCap: 3150000000000, pe: 58.2, shares: 24500000000, revenue: 96300000000, netIncome: 53000000000, fcf: 48000000000 },
  TSLA: { companyName: 'Tesla, Inc.', industry: 'Automotive', sector: 'Consumer Cyclical', price: 215.40, low52: 138.80, high52: 271.00, marketCap: 686000000000, pe: 62.4, shares: 3190000000, revenue: 96700000000, netIncome: 14900000000, fcf: 4400000000 },
  MSFT: { companyName: 'Microsoft Corporation', industry: 'Software - Infrastructure', sector: 'Technology', price: 412.30, low52: 309.45, high52: 468.35, marketCap: 3060000000000, pe: 35.8, shares: 7430000000, revenue: 245100000000, netIncome: 88100000000, fcf: 74100000000 },
  AMZN: { companyName: 'Amazon.com, Inc.', industry: 'Internet Retail', sector: 'Consumer Cyclical', price: 175.60, low52: 118.35, high52: 201.20, marketCap: 1830000000000, pe: 41.2, shares: 10400000000, revenue: 574800000000, netIncome: 30400000000, fcf: 36800000000 },
  GOOGL: { companyName: 'Alphabet Inc.', industry: 'Internet Content & Information', sector: 'Communication Services', price: 165.20, low52: 120.21, high52: 191.75, marketCap: 2040000000000, pe: 24.1, shares: 12300000000, revenue: 307400000000, netIncome: 73700000000, fcf: 69500000000 },
  META: { companyName: 'Meta Platforms, Inc.', industry: 'Internet Content & Information', sector: 'Communication Services', price: 510.10, low52: 279.40, high52: 542.80, marketCap: 1290000000000, pe: 26.3, shares: 2530000000, revenue: 134900000000, netIncome: 39100000000, fcf: 43000000000 },
  NFLX: { companyName: 'Netflix, Inc.', industry: 'Entertainment', sector: 'Communication Services', price: 680.50, low52: 385.00, high52: 700.00, marketCap: 29200000000, pe: 42.1, shares: 429000000, revenue: 33700000000, netIncome: 5400000000, fcf: 6900000000 },
  AMD: { companyName: 'Advanced Micro Devices, Inc.', industry: 'Semiconductors', sector: 'Technology', price: 148.20, low52: 93.12, high52: 227.30, marketCap: 240000000000, pe: 110.5, shares: 1620000000, revenue: 22600000000, netIncome: 854000000, fcf: 1100000000 },
  PLTR: { companyName: 'Palantir Technologies Inc.', industry: 'Software - Application', sector: 'Technology', price: 31.80, low52: 14.48, high52: 33.20, marketCap: 71000000000, pe: 85.0, shares: 2230000000, revenue: 2230000000, netIncome: 210000000, fcf: 730000000 },
  DIS: { companyName: 'The Walt Disney Company', industry: 'Entertainment', sector: 'Communication Services', price: 95.40, low52: 78.73, high52: 123.74, marketCap: 173000000000, pe: 38.5, shares: 1810000000, revenue: 88900000000, netIncome: 3000000000, fcf: 4900000000 }
};

export const EXACT_SHEET_ROWS: SheetRowDefinition[] = [
  // SECTION 1: CORE VALUATION (ROWS 1 - 47)
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
  { rowNum: 15, label: 'Dividend Growth Rate (5 yrs / 10 yrs)', defaultVal: '', cellType: 'yellow-input', note: 'Разделено на 2 полета: 5 години (ляво) и 10 години (дясно)' },
  { rowNum: 16, label: '5 yrs Annualized ROI', defaultVal: '', cellType: 'default', formulaStr: '=Overview!J19', note: 'Годишна възвръщаемост 5г.' },
  { rowNum: 17, label: '10 yrs Annualized ROI', defaultVal: '', cellType: 'default', formulaStr: '=Overview!J29', note: 'Годишна възвръщаемост 10г.' },
  { rowNum: 18, label: 'Shares Outstanding', defaultVal: '', cellType: 'yellow-input', formulaStr: '=GOOGLEFINANCE(B2, "shares")', note: 'Брой акции в обращение' },
  { rowNum: 19, label: 'Revenue', defaultVal: '', cellType: 'yellow-input', note: 'Годишни брутни приходи ($)' },
  { rowNum: 20, label: 'Revenue avg increase (3 yrs / 5 yrs)', defaultVal: '', cellType: 'yellow-input', note: 'Разделено на 2 полета: 3 години (ляво) и 5 години (дясно)' },
  { rowNum: 21, label: 'Gross Profit Margin', defaultVal: '', cellType: 'yellow-input', formulaStr: '=(Gross Profit / Total Revenue) x 100 (%)', flagRules: { green: '40%+', yellow: '30% - 40%', red: '< 30%' }, note: 'Gross Profit Margin = (Gross Profit / Total Revenue) x 100 (%)\nПоказва ни какъв процент от оборота представлява брутната печалба. Колкото повече, толкова по-добре (🟢 40%+ | 🟡 30%-40% | 🔴 < 30%).' },
  { rowNum: 22, label: 'Research & Development (R&D Ratio)', defaultVal: '', cellType: 'yellow-input', formulaStr: '=R&D Expenses / Revenue * 100', flagRules: { green: '< 30%', yellow: '30% - 40%', red: '> 40%' }, note: 'R&D ratio = R&D Expenses / Revenue х 100 (под 30%)\nПоказва ни какъв процент от оборота е разходът за проучване и развитие. Колкото по-малко, толкова по-добре (🟢 < 30% | 🟡 30%-40% | 🔴 > 40%).' },
  { rowNum: 23, label: 'Selling, General & Admin (SG&A Ratio)', defaultVal: '', cellType: 'yellow-input', formulaStr: '=SG&A Expenses / Revenue * 100', flagRules: { green: '< 30%', yellow: '30% - 40%', red: '> 40%' }, note: 'SG&A ratio = SG&A Expenses / Revenue х 100 (под 30%)\nАдминистративни и оперативни разходи. Колкото по-малко, толкова по-добре (🟢 < 30% | 🟡 30%-40% | 🔴 > 40%).' },
  { rowNum: 24, label: 'EPS - Earnings Per Share', defaultVal: '', cellType: 'green-formula', formulaStr: '=Net Income / Shares Outstanding', note: 'Печалба на акция ($) - Заключена (автоматично изчислена)' },
  { rowNum: 25, label: 'EPS Growth (5 yrs / 10 yrs)', defaultVal: '', cellType: 'yellow-input', note: 'Разделено на 2 полета: 5 години (ляво) и 10 години (дясно)' },
  { rowNum: 26, label: 'Net Income', defaultVal: '', cellType: 'yellow-input', note: 'Нетна печалба ($)' },
  { rowNum: 27, label: 'Net Profit Margin', defaultVal: '', cellType: 'green-formula', formulaStr: '=(Net Income / Revenue) x 100', flagRules: { green: '17%+', yellow: '5% - 17%', red: '< 5%' }, note: 'Чист марж - Заключена (автоматично изчислена)' },
  { rowNum: 28, label: 'Return on Equity (ROE)', defaultVal: '', cellType: 'yellow-input', flagRules: { green: '15%+', yellow: '5% - 15%', red: '< 5%' }, note: 'ROE (> 15%)' },
  { rowNum: 29, label: 'Return on Assets (ROA)', defaultVal: '', cellType: 'yellow-input', flagRules: { green: '5%+', yellow: '2% - 5%', red: '< 2%' }, note: 'ROA (> 5%)' },
  { rowNum: 30, label: 'Return on Capital (ROIC)', defaultVal: '', cellType: 'yellow-input', flagRules: { green: '15%+', yellow: '5% - 15%', red: '< 5%' }, note: 'ROIC (> 15% е силен Moat)' },
  { rowNum: 31, label: 'Current Ratio', defaultVal: '', cellType: 'yellow-input', flagRules: { green: '1.0+', yellow: '0.8 - 1.0', red: '< 0.8' }, note: 'Текуща ликвидност (> 1.0)' },
  { rowNum: 32, label: 'Long - Term Debt', defaultVal: '', cellType: 'yellow-input', note: 'Дългосрочен дълг ($)' },
  { rowNum: 33, label: 'Avg Debt Increase 10 yrs', defaultVal: '', cellType: 'default', note: 'Средно увеличение на дълга' },
  { rowNum: 34, label: 'Long-term Debt to Equity Ratio', defaultVal: '', cellType: 'default', note: 'Дългосрочен дълг / капитал' },
  { rowNum: 35, label: 'Debt / Equity', defaultVal: '', cellType: 'yellow-input', flagRules: { green: '< 1.0', yellow: '1.0 - 2.0', red: '> 2.0' }, note: 'Задължения / капитал' },
  { rowNum: 36, label: 'Cash Flow from Operations', defaultVal: '', cellType: 'yellow-input', note: 'Оперативен кеш поток (CFFO)' },
  { rowNum: 37, label: 'CFFO 5-10 Years increase', defaultVal: '', cellType: 'default', note: 'Ръст на CFFO' },
  { rowNum: 38, label: 'Free Cash Flow', defaultVal: '', cellType: 'yellow-input', note: 'Свободен паричен поток (FCF)' },
  { rowNum: 39, label: 'FCF 5 - 10 years avg increase', defaultVal: '', cellType: 'green-formula', note: 'Ръст на FCF' },
  { rowNum: 40, label: 'Cash Flow Margin', defaultVal: '', cellType: 'green-formula', formulaStr: '=B36/B19', flagRules: { green: '15%+', yellow: '10% - 15%', red: '< 10%' }, note: 'Cash Flow Margin = CFFO / Revenue x 100 - Заключена (автоматично изчислена)' },
  { rowNum: 41, label: 'Free Cash Flow Margin', defaultVal: '', cellType: 'green-formula', formulaStr: '=(B38/B19)', flagRules: { green: '15%+', yellow: '10% - 15%', red: '< 10%' }, note: 'Free Cash Flow Margin = FCF / Revenue x 100 - Заключена (автоматично изчислена)' },
  { rowNum: 42, label: 'Free Cash Flow Yield', defaultVal: '', cellType: 'green-formula', formulaStr: '=1*(B38/B9)', flagRules: { green: '5%+', yellow: '3% - 5%', red: '< 3%' }, note: 'FCF Yield = FCF / Market Cap x 100 - Заключена (автоматично изчислена)' },
  { rowNum: 43, label: 'Earnings Yield', defaultVal: '', cellType: 'green-formula', formulaStr: '=B24/B7', flagRules: { green: '7%+', yellow: '4% - 7%', red: '< 4%' }, note: 'Earnings Yield = EPS / Price x 100 - Заключена (автоматично изчислена)' },
  { rowNum: 44, label: 'Free Cash Flow  / Net Income', defaultVal: '', cellType: 'green-formula', formulaStr: '=B38/B26', flagRules: { green: '100%+', yellow: '70% - 100%', red: '< 70%' }, note: 'FCF / Net Income (>100% е отлично) - Заключена (автоматично изчислена)' },
  { rowNum: 45, label: 'Cash Flow Coverage Ratio', defaultVal: '', cellType: 'yellow-input', flagRules: { green: '> 1.0', yellow: '0.5 - 1.0', red: '< 0.5' }, note: 'CFFO / Long-Term Debt' },
  { rowNum: 46, label: 'Operating Cash Flow Ratio', defaultVal: '', cellType: 'default', note: 'CFFO / Current Liabilities' },
  { rowNum: 47, label: 'Cash ROA', defaultVal: '', cellType: 'yellow-input', note: 'Възвръщаемост на активите на база кеш' }
];

export default function StockChecklistModal({ isOpen, onClose, stock, stocks = [], onSaveToTable }: StockChecklistModalProps) {
  const [selectedTicker, setSelectedTicker] = useState<string>(stock?.ticker || '');
  const [activeInfoModalRow, setActiveInfoModalRow] = useState<SheetRowDefinition | null>(null);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  
  // Interactive Checklist State: Track checked rows
  const [checkedRows, setCheckedRows] = useState<Record<number, boolean>>({});

  const [userInputs, setUserInputs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    EXACT_SHEET_ROWS.forEach(r => { init[String(r.rowNum)] = ''; });
    init['15_10'] = '';
    init['20_5'] = '';
    init['25_10'] = '';
    return init;
  });

  const updateStockRowDetails = (sym: string) => {
    const cleanSym = sym.toUpperCase().trim();
    if (!cleanSym) return;

    const found = stocks.find(s => s.ticker.toUpperCase() === cleanSym);
    const dbStock = POPULAR_STOCKS_DB[cleanSym];

    const compName = found?.companyName || dbStock?.companyName || `${cleanSym} Corp.`;
    const sectorName = getSectorForStock(cleanSym, found?.sector || dbStock?.sector, compName);
    const indName = found?.industry || dbStock?.industry || `${sectorName} Products & Services`;
    const currentPrice = found?.currentPrice || dbStock?.price || 0;
    const low52Val = found?.low52 || dbStock?.low52 || (currentPrice ? currentPrice * 0.75 : 0);
    const high52Val = found?.high52 || dbStock?.high52 || (currentPrice ? currentPrice * 1.35 : 0);
    const mcapRaw = found?.marketCap || dbStock?.marketCap || 0;
    const peVal = found?.peRatio || found?.pe || dbStock?.pe || 0;

    let marketCapInThousands = '';
    if (mcapRaw > 0) {
      const inThousands = Math.round(mcapRaw / 1000);
      marketCapInThousands = inThousands.toLocaleString('en-US');
    }

    let low52High52 = '';
    if (low52Val > 0 && high52Val > 0) {
      low52High52 = `${low52Val.toFixed(2)} / ${high52Val.toFixed(2)}`;
    }

    setUserInputs(prev => ({
      ...prev,
      '1': compName,
      '2': cleanSym,
      '3': indName,
      '4': sectorName,
      '7': currentPrice > 0 ? currentPrice.toFixed(2) : prev['7'],
      '8': low52High52 || prev['8'],
      '9': marketCapInThousands || prev['9'],
      '10': peVal > 0 ? peVal.toFixed(1) : prev['10'],
      '18': dbStock?.shares ? (dbStock.shares / 1000).toLocaleString('en-US') : prev['18'],
      '19': dbStock?.revenue ? (dbStock.revenue / 1000).toLocaleString('en-US') : prev['19'],
      '26': dbStock?.netIncome ? (dbStock.netIncome / 1000).toLocaleString('en-US') : prev['26'],
      '38': dbStock?.fcf ? (dbStock.fcf / 1000).toLocaleString('en-US') : prev['38'],
    }));

    // Auto check non-empty rows for selected ticker
    const initialChecked: Record<number, boolean> = {};
    [1, 2, 3, 4, 7, 8, 9, 10].forEach(r => { initialChecked[r] = true; });
    setCheckedRows(prev => ({ ...prev, ...initialChecked }));
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

  const handleInputChange = (key: string | number, val: string) => {
    const strKey = String(key);
    setUserInputs(prev => ({ ...prev, [strKey]: val }));

    const numKey = typeof key === 'number' ? key : parseInt(key, 10);
    if (!isNaN(numKey) && val.trim() !== '') {
      setCheckedRows(prev => ({ ...prev, [numKey]: true }));
    }

    if (strKey === '2' && val.trim().length >= 1) {
      const cleanSym = val.toUpperCase().trim();
      setSelectedTicker(cleanSym);
      updateStockRowDetails(cleanSym);
    }
  };

  const handleToggleCheck = (rowNum: number) => {
    setCheckedRows(prev => ({ ...prev, [rowNum]: !prev[rowNum] }));
  };

  const handleClearAll = () => {
    setSelectedTicker('');
    const cleared: Record<string, string> = {};
    EXACT_SHEET_ROWS.forEach(r => { cleared[String(r.rowNum)] = ''; });
    cleared['15_10'] = '';
    cleared['20_5'] = '';
    cleared['25_10'] = '';
    setUserInputs(cleared);
    setCheckedRows({});
  };

  const handleAutoCheckGreen = () => {
    const newChecked = { ...checkedRows };
    EXACT_SHEET_ROWS.forEach(row => {
      const displayVal = computedValues[String(row.rowNum)] || userInputs[String(row.rowNum)];
      if (displayVal && (displayVal.includes('🟢') || displayVal.includes('GREEN'))) {
        newChecked[row.rowNum] = true;
      }
    });
    setCheckedRows(newChecked);
  };

  const parseNum = (val: string | undefined): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9.-]/g, '');
    return parseFloat(clean) || 0;
  };

  // Save / Sync audited company data to main Interactive Table
  const handleSaveToMainTable = () => {
    const cleanSym = (selectedTicker || userInputs['2'] || '').toUpperCase().trim();
    if (!cleanSym) {
      alert('Моля, изберете или въведете тикер на компания първо!');
      return;
    }

    const compName = userInputs['1'] || `${cleanSym} Corp.`;
    const sectorName = userInputs['4'] || 'Technology';
    const price = parseNum(userInputs['7']);
    const pe = parseNum(userInputs['10']);
    const divYield = parseNum(userInputs['12']);
    const mcapInK = parseNum(userInputs['9']);

    if (onSaveToTable) {
      onSaveToTable({
        ticker: cleanSym,
        companyName: compName,
        sector: sectorName,
        currentPrice: price > 0 ? price : 100,
        peRatio: pe > 0 ? pe : 15,
        dividendYield: divYield > 0 ? divYield : 0,
        marketCap: mcapInK > 0 ? mcapInK * 1000 : 1000000000
      });
    }

    setSavedSuccessMsg(`Акцията ${cleanSym} е пресметната и запазена в Интерактивната Таблица!`);
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  // Dynamic Computed Formulas
  const computedValues = useMemo(() => {
    const rev = parseNum(userInputs['19']);
    const netInc = parseNum(userInputs['26']);
    const fcf = parseNum(userInputs['38']);
    const cffo = parseNum(userInputs['36']);
    const price = parseNum(userInputs['7']);
    const mcap = parseNum(userInputs['9']);
    const shares = parseNum(userInputs['18']);
    const deRatio = parseNum(userInputs['35']);

    let epsCalc = parseNum(userInputs['24']);
    if (shares > 0 && netInc !== 0) {
      epsCalc = netInc / shares;
    }

    const calculated: Record<string, string> = {};

    if (shares > 0 && netInc !== 0) calculated['24'] = epsCalc.toFixed(2);
    if (rev > 0 && netInc !== 0) calculated['27'] = `${((netInc / rev) * 100).toFixed(2)}%`;
    if (rev > 0 && cffo > 0) calculated['40'] = `${((cffo / rev) * 100).toFixed(2)}%`;
    if (rev > 0 && fcf > 0) calculated['41'] = `${((fcf / rev) * 100).toFixed(2)}%`;
    if (mcap > 0 && fcf > 0) calculated['42'] = `${((fcf / mcap) * 100).toFixed(2)}%`;
    if (price > 0 && epsCalc > 0) calculated['43'] = `${((epsCalc / price) * 100).toFixed(2)}%`;
    if (netInc !== 0 && fcf > 0) calculated['44'] = `${((fcf / netInc) * 100).toFixed(2)}%`;

    // Dynamic Flags Rows (#49 to #64)
    const grossMarginVal = parseNum(userInputs['21']);
    if (userInputs['21'] && userInputs['21'].trim() !== '') {
      calculated['49'] = grossMarginVal >= 40 ? `🟢 GREEN (${grossMarginVal}%)` : grossMarginVal >= 30 ? `🟡 YELLOW (${grossMarginVal}%)` : `🔴 RED (${grossMarginVal}%)`;
    }

    const revGrowthVal3 = parseNum(userInputs['20']);
    const revGrowthVal5 = parseNum(userInputs['20_5']);
    const activeRevGrowth = revGrowthVal3 || revGrowthVal5;
    if (activeRevGrowth > 0) {
      calculated['50'] = activeRevGrowth >= 15 ? `🟢 GREEN (${activeRevGrowth}%)` : activeRevGrowth >= 10 ? `🟡 YELLOW (${activeRevGrowth}%)` : `🔴 RED (${activeRevGrowth}%)`;
    }

    const netMarginVal = parseNum(userInputs['27']);
    if (userInputs['27'] && userInputs['27'].trim() !== '') {
      calculated['52'] = netMarginVal >= 17 ? `🟢 GREEN (${netMarginVal}%)` : netMarginVal >= 5 ? `🟡 YELLOW (${netMarginVal}%)` : `🔴 RED (${netMarginVal}%)`;
    }

    if (userInputs['35'] && userInputs['35'].trim() !== '') {
      calculated['56'] = deRatio <= 1.0 ? `🟢 GREEN (${deRatio})` : deRatio <= 2.0 ? `🟡 YELLOW (${deRatio})` : `🔴 RED (${deRatio})`;
    }

    return calculated;
  }, [userInputs]);

  // Live Score Calculator
  const flagsSummary = useMemo(() => {
    let green = 0, yellow = 0, red = 0;
    Object.values(computedValues).forEach(val => {
      if (val.includes('🟢') || val.includes('GREEN')) green++;
      else if (val.includes('🟡') || val.includes('YELLOW')) yellow++;
      else if (val.includes('🔴') || val.includes('RED')) red++;
    });
    return { green, yellow, red };
  }, [computedValues]);

  // Total checked progress calculation
  const totalAudited = useMemo(() => {
    return Object.values(checkedRows).filter(Boolean).length;
  }, [checkedRows]);

  const totalCheckableRows = useMemo(() => {
    return EXACT_SHEET_ROWS.filter(r => !r.label.startsWith('---')).length;
  }, []);

  const progressPercent = Math.round((totalAudited / totalCheckableRows) * 100);

  if (!isOpen) return null;

  // Helper to render interactive checklist table row
  const renderRowItem = (rowNum: number) => {
    const row = EXACT_SHEET_ROWS.find(r => r.rowNum === rowNum);
    if (!row) return null;

    const isChecked = !!checkedRows[rowNum];
    const rawUserVal = userInputs[String(rowNum)];
    const displayVal = computedValues[String(rowNum)] !== undefined 
      ? computedValues[String(rowNum)] 
      : (rawUserVal !== undefined ? rawUserVal : '');

    const isReadOnlyCell = row.cellType === 'green-formula' || row.cellType.startsWith('flag-') || [24, 27, 40, 41, 42, 43, 44].includes(row.rowNum);

    return (
      <tr
        key={rowNum}
        className={`border-b border-border/40 transition-colors ${
          isChecked ? 'bg-emerald-500/5 dark:bg-emerald-950/20' : 'hover:bg-border/20'
        }`}
      >
        {/* Row Number */}
        <td className="py-2.5 px-3 text-center w-12 font-mono text-xs font-bold text-ink-faint border-r border-border/40">
          {row.rowNum}
        </td>

        {/* Checkbox Cell */}
        <td className="py-2.5 px-3 text-center w-10 border-r border-border/40">
          <button
            type="button"
            onClick={() => handleToggleCheck(rowNum)}
            className="p-1 text-ink-muted hover:text-emerald-400 cursor-pointer transition-transform active:scale-90"
            title={isChecked ? "Маркиран като прегледан" : "Маркирай като прегледан"}
          >
            {isChecked ? (
              <CheckSquare className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
            ) : (
              <Square className="w-4 h-4 text-ink-faint hover:text-ink" />
            )}
          </button>
        </td>

        {/* Metric Label */}
        <td className="py-2.5 px-4 border-r border-border/40">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${isChecked ? 'text-emerald-400' : 'text-ink'}`}>
              {row.label}
            </span>
            {isReadOnlyCell && (
              <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" title="Автоматично изчислено" />
            )}
          </div>
        </td>

        {/* Value Box / Split Inputs */}
        <td className="py-2 px-4 border-r border-border/40">
          {rowNum === 15 ? (
            <div className="flex items-center gap-2 justify-end">
              <div className="flex items-center gap-1 bg-bg border border-border rounded-lg px-2.5 py-1.5 h-8">
                <span className="text-xs text-ink-faint font-bold">5y:</span>
                <input
                  type="text"
                  value={userInputs['15'] || ''}
                  onChange={e => handleInputChange('15', e.target.value)}
                  placeholder="..."
                  className="w-16 bg-transparent text-xs font-mono font-bold outline-none text-ink text-right"
                />
              </div>
              <div className="flex items-center gap-1 bg-bg border border-border rounded-lg px-2.5 py-1.5 h-8">
                <span className="text-xs text-ink-faint font-bold">10y:</span>
                <input
                  type="text"
                  value={userInputs['15_10'] || ''}
                  onChange={e => handleInputChange('15_10', e.target.value)}
                  placeholder="..."
                  className="w-16 bg-transparent text-xs font-mono font-bold outline-none text-ink text-right"
                />
              </div>
            </div>
          ) : rowNum === 20 ? (
            <div className="flex items-center gap-2 justify-end">
              <div className="flex items-center gap-1 bg-bg border border-border rounded-lg px-2.5 py-1.5 h-8">
                <span className="text-xs text-ink-faint font-bold">3y:</span>
                <input
                  type="text"
                  value={userInputs['20'] || ''}
                  onChange={e => handleInputChange('20', e.target.value)}
                  placeholder="..."
                  className="w-16 bg-transparent text-xs font-mono font-bold outline-none text-ink text-right"
                />
              </div>
              <div className="flex items-center gap-1 bg-bg border border-border rounded-lg px-2.5 py-1.5 h-8">
                <span className="text-xs text-ink-faint font-bold">5y:</span>
                <input
                  type="text"
                  value={userInputs['20_5'] || ''}
                  onChange={e => handleInputChange('20_5', e.target.value)}
                  placeholder="..."
                  className="w-16 bg-transparent text-xs font-mono font-bold outline-none text-ink text-right"
                />
              </div>
            </div>
          ) : rowNum === 25 ? (
            <div className="flex items-center gap-2 justify-end">
              <div className="flex items-center gap-1 bg-bg border border-border rounded-lg px-2.5 py-1.5 h-8">
                <span className="text-xs text-ink-faint font-bold">5y:</span>
                <input
                  type="text"
                  value={userInputs['25'] || ''}
                  onChange={e => handleInputChange('25', e.target.value)}
                  placeholder="..."
                  className="w-16 bg-transparent text-xs font-mono font-bold outline-none text-ink text-right"
                />
              </div>
              <div className="flex items-center gap-1 bg-bg border border-border rounded-lg px-2.5 py-1.5 h-8">
                <span className="text-xs text-ink-faint font-bold">10y:</span>
                <input
                  type="text"
                  value={userInputs['25_10'] || ''}
                  onChange={e => handleInputChange('25_10', e.target.value)}
                  placeholder="..."
                  className="w-16 bg-transparent text-xs font-mono font-bold outline-none text-ink text-right"
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <input
                type="text"
                value={displayVal}
                readOnly={isReadOnlyCell}
                disabled={isReadOnlyCell}
                placeholder={isReadOnlyCell ? "🔒 Изчислено" : "Попълнете..."}
                onChange={e => handleInputChange(rowNum, e.target.value)}
                className={`w-48 h-8 px-3 py-1.5 rounded-lg border font-mono font-bold text-xs outline-none text-right transition-all ${
                  isReadOnlyCell
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 cursor-not-allowed'
                    : 'bg-bg border-border focus:border-indigo-500 text-ink'
                }`}
              />
            </div>
          )}
        </td>

        {/* Info Formula Button Cell */}
        <td className="py-2 px-2 text-center w-10">
          {(row.note || row.formulaStr || row.flagRules) ? (
            <button
              type="button"
              onClick={() => setActiveInfoModalRow(row)}
              className="p-0.5 rounded-md hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer inline-flex items-center justify-center"
              title="Формула & правила за оцветяване"
            >
              <Info className="w-3 h-3" />
            </button>
          ) : (
            <span className="opacity-20 text-[10px]">-</span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="fixed inset-0 z-[999999] w-screen h-screen bg-bg flex flex-col font-sans text-ink overflow-hidden animate-in fade-in duration-150" onClick={e => e.stopPropagation()}>
      
      {/* Clean App Header Bar */}
      <div className="bg-bg-card border-b border-border px-6 py-3 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-base text-ink tracking-tight flex items-center gap-2">
              Stock Valuation Checklist Table
            </h2>
            <p className="text-xs text-ink-muted">Инструмент за финансова оценка на отделни компании преди добавяне към Платформата</p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-bg px-3 py-1.5 rounded-xl border border-border">
            <label className="text-xs font-bold text-ink-faint uppercase">Актив:</label>
            <select
              value={selectedTicker}
              onChange={e => handleSelectTicker(e.target.value)}
              className="bg-transparent text-ink font-mono font-bold text-xs outline-none cursor-pointer"
            >
              <option value="" className="bg-bg-card text-ink">-- Изберете Актив --</option>
              {stocks.map(s => (
                <option key={s.ticker} value={s.ticker} className="bg-bg-card text-ink">{s.ticker} - {s.companyName}</option>
              ))}
              {Object.keys(POPULAR_STOCKS_DB).map(tk => (
                !stocks.some(s => s.ticker.toUpperCase() === tk) && (
                  <option key={tk} value={tk} className="bg-bg-card text-ink">{tk} - {POPULAR_STOCKS_DB[tk].companyName}</option>
                )
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveToMainTable}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            title="Запази пресметнатата акция в Интерактивната Таблица на платформата"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            ➕ Добави към Таблицата
          </button>

          <button
            onClick={() => {
              window.open(window.location.origin + window.location.pathname + '#checklist', '_blank');
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-xs border border-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Отвори в нов прозорец"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            🗔 Нов прозорец
          </button>

          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Изчисти данните"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Изчисти
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-border transition-colors text-ink-muted hover:text-ink cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {savedSuccessMsg && (
        <div className="bg-emerald-500 text-white px-6 py-2 flex items-center justify-between text-xs font-bold shadow-md animate-in slide-in-from-top duration-200">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            {savedSuccessMsg}
          </span>
          <button onClick={() => setSavedSuccessMsg(null)} className="opacity-80 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Progress & Quick Actions Bar */}
      <div className="bg-bg-card/60 border-b border-border/80 px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shrink-0">
        
        {/* Audit Checklist Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-ink">Анализ на Компанията</span>
          {selectedTicker && (
            <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {selectedTicker.toUpperCase()}
            </span>
          )}
        </div>

        {/* Live Audit Checklist Progress */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={handleAutoCheckGreen}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/20 flex items-center gap-1 transition-all cursor-pointer"
            title="Автоматично отметни всички зелени показатели"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Отметни зелени
          </button>

          <div className="flex items-center gap-2 bg-bg px-3 py-1 rounded-lg border border-border">
            <span className="text-xs font-bold text-ink-muted">Прогрес:</span>
            <div className="w-24 bg-border/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono font-bold text-xs text-emerald-400">{progressPercent}%</span>
            <span className="text-[11px] text-ink-faint">({totalAudited}/{totalCheckableRows})</span>
          </div>

          <div className="flex items-center gap-2 font-mono font-bold text-xs">
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">🟢 {flagsSummary.green}</span>
            <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">🟡 {flagsSummary.yellow}</span>
            <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">🔴 {flagsSummary.red}</span>
          </div>
        </div>
      </div>

      {/* Main Checklist Table */}
      <div className="flex-1 overflow-auto p-6 bg-bg">
        <div className="max-w-6xl mx-auto bg-bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-border/40 text-ink-muted text-xs font-bold uppercase tracking-wider border-b border-border">
                <th className="py-3 px-3 text-center w-12 border-r border-border/40">#</th>
                <th className="py-3 px-3 text-center w-10 border-r border-border/40">✓</th>
                <th className="py-3 px-4 border-r border-border/40">Показател (Financial Metric)</th>
                <th className="py-3 px-4 text-right border-r border-border/40">Стойност (Value / Input)</th>
                <th className="py-3 px-2 text-center w-12">Инфо</th>
              </tr>
            </thead>
            <tbody>
              {/* SECTION 1 */}
              <tr className="bg-indigo-500/10 border-y border-indigo-500/20">
                <td colSpan={5} className="py-2 px-4 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                  🏢 1. ИНФОРМАЦИЯ ЗА КОМПАНИЯТА (COMPANY OVERVIEW)
                </td>
              </tr>
              {[1, 2, 3, 4, 7, 8, 9].map(r => renderRowItem(r))}

              {/* SECTION 2 */}
              <tr className="bg-indigo-500/10 border-y border-indigo-500/20">
                <td colSpan={5} className="py-2 px-4 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                  📊 2. ФИНАНСОВИ КОЕФИЦИЕНТИ & ОЦЕНКА (VALUATION METRICS)
                </td>
              </tr>
              {[10, 11, 12, 13, 14, 15, 16, 17, 18].map(r => renderRowItem(r))}

              {/* SECTION 3 */}
              <tr className="bg-indigo-500/10 border-y border-indigo-500/20">
                <td colSpan={5} className="py-2 px-4 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                  📈 3. ПРИХОДИ, МАРЖОВЕ & ПЕЧАЛБА (INCOME STATEMENT & MARGINS)
                </td>
              </tr>
              {[19, 20, 21, 22, 23, 24, 25, 26, 27].map(r => renderRowItem(r))}

              {/* SECTION 4 */}
              <tr className="bg-indigo-500/10 border-y border-indigo-500/20">
                <td colSpan={5} className="py-2 px-4 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                  ⚖️ 4. БАЛАНСОВ ОТЧЕТ & ЗАДЪЛЖЕНИЯ (BALANCE SHEET & SOLVENCY)
                </td>
              </tr>
              {[28, 29, 30, 31, 32, 33, 34, 35].map(r => renderRowItem(r))}

              {/* SECTION 5 */}
              <tr className="bg-indigo-500/10 border-y border-indigo-500/20">
                <td colSpan={5} className="py-2 px-4 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                  💵 5. ПАРИЧНИ ПОТОЦИ (CASH FLOW ANALYSIS)
                </td>
              </tr>
              {[36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47].map(r => renderRowItem(r))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Popover Modal for (i) Button */}
      {activeInfoModalRow && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150" onClick={() => setActiveInfoModalRow(null)}>
          <div className="relative w-full max-w-md bg-bg-card border border-border/80 rounded-2xl shadow-2xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
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
                <span className="text-[10px] uppercase font-bold text-ink-faint tracking-wider">📐 Точна Формула:</span>
                <div className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  {activeInfoModalRow.formulaStr}
                </div>
              </div>
            )}

            {/* Flag Rules */}
            {activeInfoModalRow.flagRules && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-ink-faint tracking-wider">🚦 Граници за оцветяване:</span>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs font-bold text-center">
                  <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl border border-emerald-500/20">
                    🟢 {activeInfoModalRow.flagRules.green}
                  </div>
                  <div className="bg-amber-500/10 text-amber-400 p-2 rounded-xl border border-amber-500/20">
                    🟡 {activeInfoModalRow.flagRules.yellow}
                  </div>
                  <div className="bg-rose-500/10 text-rose-400 p-2 rounded-xl border border-rose-500/20">
                    🔴 {activeInfoModalRow.flagRules.red}
                  </div>
                </div>
              </div>
            )}

            {/* Note */}
            {activeInfoModalRow.note && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-ink-faint tracking-wider">💡 Бележка & Разяснения:</span>
                <p className="text-xs text-ink-muted leading-relaxed bg-bg/50 p-3 rounded-xl border border-border/30 whitespace-pre-line">
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
