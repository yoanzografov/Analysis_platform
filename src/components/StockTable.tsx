import React, { useState, useEffect } from 'react';
import { Stock, TableFilter, PriceAlert } from '../types';
import { Search, Sparkles, TrendingUp, TrendingDown, Edit3, Check, X, ExternalLink, Plus, Newspaper, Trash2, Calculator, Save, Bell, CheckSquare } from 'lucide-react';
import StockDetailChartModal from './StockDetailChartModal';
import DividendModal from './DividendModal';
import EarningsModal from './EarningsModal';
import FinancialsModal from './FinancialsModal';
import CompanyProfileModal from './CompanyProfileModal';
import PriceAlertPlanner from './PriceAlertPlanner';
import StockChecklistModal from './StockChecklistModal';
import { getSectorForStock, formatDividend } from '../utils/sectorHelper';

interface Props {
 stocks: Stock[];
 alerts?: PriceAlert[];
 onAddAlert?: (ticker: string, criteria: 'ABOVE' | 'BELOW', target: number) => void;
 onUpdateAlert?: (id: string, ticker: string, criteria: 'ABOVE' | 'BELOW', target: number) => void;
 onDeleteAlert?: (id: string) => void;
 onUpdateStock: (oldTicker: string, updatedStock: Stock) => void;
 onDeleteStock: (ticker: string) => void;
 onSelectStockForAi: (stock: Stock) => void;
 onAddStock: (stock: Stock) => void;
 activeFilter: TableFilter;
 onSetActiveFilter: (filter: TableFilter) => void;
 buyThreshold: number;
 sellThreshold: number;
}

type SortField = 'ticker' | 'dailyChangePct' | 'currentPrice' | 'fairPrice' | 'difference' | 'marketCap';
type SortOrder = 'asc' | 'desc';

// Helper to render a miniature beautiful sparkline for the '365 Chart' column
function StockSparkline({ changePct, ticker }: { changePct: number; ticker: string }) {
 const isUp = changePct >= 0;
 
 // Clean deterministic seed from ticker name
 let seed = ticker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
 
 const steps = 12;
 const prices: number[] = new Array(steps + 1);
 
 // Starting price is arbitrary, say 100
 let currentVal = 100;
 prices[0] = currentVal;
 
 // Run a deterministic random walk to generate 12 historical points
 for (let i = 1; i <= steps; i++) {
 // Deterministic pseudo-random number generator (LCG)
 seed = (seed * 9301 + 49297) % 233280;
 const rnd = (seed / 233280) - 0.5; // range -0.5 to 0.5
 
 // Trend towards changePct at the end
 const trend = (changePct / 100) / steps;
 currentVal = currentVal * (1 + rnd * 0.04 + trend);
 prices[i] = currentVal;
 }
 
 // Scale the prices to fit in the sparkline box (width: 50, height: 16)
 const minPrice = Math.min(...prices);
 const maxPrice = Math.max(...prices);
 const range = maxPrice - minPrice || 1;
 
 // Leave 1.5px padding at the top and bottom to avoid clipping
 const height = 16;
 const padding = 1.5;
 const scaleHeight = height - padding * 2;
 
 const points = prices.map((price, i) => {
 const x = (i / steps) * 46 + 2; // leave 2px padding on left/right
 const y = height - padding - ((price - minPrice) / range) * scaleHeight;
 return `${x.toFixed(1)},${y.toFixed(1)}`;
 });

 return (
 <svg className="w-14 h-4 min-w-[56px] shrink-0 overflow-visible inline-block opacity-85 hover:opacity-100 transition-opacity" viewBox="0 0 50 16">
 <polyline
 fill="none"
 stroke={isUp ? "#15803d" : "#b91c1c"}
 strokeWidth="1.5"
 strokeLinecap="round"
 strokeLinejoin="round"
 points={points.join(' ')}
 />
 </svg>
 );
}

// Helpers to parse and format dates between YYYY-MM-DD (RFC3339/ISO for calendar widgets) and Bulgarian spreadsheet standard DD.MM.YYYY г.
function toIsoDate(dateStr: string): string {
 if (!dateStr) return '';
 // Try matching DD.MM.YYYY
 const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
 if (match) {
 return `${match[3]}-${match[2]}-${match[1]}`;
 }
 // If already standard ISO YYYY-MM-DD
 const isoMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
 if (isoMatch) return dateStr;
 
 // Try falling back to a JS Date parsing
 try {
 const d = new Date(dateStr);
 if (!isNaN(d.getTime())) {
 return d.toISOString().split('T')[0];
 }
 } catch (e) {}
 
 return '';
}

function fromIsoDate(isoStr: string): string {
  if (!isoStr) return '';
  const parts = isoStr.replace(' г.', '').trim().split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return isoStr;
}

export function formatDateDDMMYYYY(dateStr?: string | number | null): string {
  if (!dateStr) return '-';
  if (typeof dateStr === 'number') {
    const d = new Date(dateStr > 1e11 ? dateStr : dateStr * 1000);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    }
  }
  const str = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
  }
  const match = str.match(/(\d{1,2})[\.\/-](\d{1,2})[\.\/-](\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${day}.${month}.${year}`;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}.${month}.${year}`;
  }
  return str;
}

const StockLogo = ({ ticker }: { ticker: string }) => {
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-ink-muted border border-white/20 shrink-0">
        {ticker.charAt(0)}
      </div>
    );
  }
  
  return (
    <img 
      src={`https://financialmodelingprep.com/image-stock/${ticker}.png`} 
      alt={ticker}
      onError={() => setError(true)}
      className="w-6 h-6 rounded-full bg-white/10 shrink-0 object-contain"
    />
  );
};

export default function StockTable({ stocks, alerts, onAddAlert, onUpdateAlert, onDeleteAlert, onUpdateStock, onDeleteStock, onSelectStockForAi, onAddStock, activeFilter, onSetActiveFilter, buyThreshold, sellThreshold }: Props) {
 // Search state
 const [search, setSearch] = useState('');

 // Sorting state
 const [sortField, setSortField] = useState<SortField | null>(null);
 const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

 // Add stock modal state
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isQuickAlertOpen, setIsQuickAlertOpen] = useState(false);
  const [alertModalTicker, setAlertModalTicker] = useState('AAPL');
  const [alertModalCriteria, setAlertModalCriteria] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [alertModalTargetPrice, setAlertModalTargetPrice] = useState('400.00');

  const [activeChartStock, setActiveChartStock] = useState<Stock | null>(null);
  const [dividendModalStock, setDividendModalStock] = useState<Stock | null>(null);
  const [earningsModalStock, setEarningsModalStock] = useState<Stock | null>(null);
  const [financialsModalStock, setFinancialsModalStock] = useState<Stock | null>(null);

 const [newTicker, setNewTicker] = useState('');
 const [newCompanyName, setNewCompanyName] = useState('');
 const [newDate, setNewDate] = useState('');
 const [newPriceOfCalc, setNewPriceOfCalc] = useState('');
 const [newFairPrice, setNewFairPrice] = useState('');
 const [newCalcLink, setNewCalcLink] = useState('');

 // Inline pricing edits state for all editable cells
 const [editingRow, setEditingRow] = useState<string | null>(null);
 const [selectedRow, setSelectedRow] = useState<string | null>(null);
 const [showConfirmFair, setShowConfirmFair] = useState<string | null>(null);
 const [editTicker, setEditTicker] = useState('');
 const [editWatch, setEditWatch] = useState('');
 const [editCompanyName, setEditCompanyName] = useState('');
 const [editDate, setEditDate] = useState('');
 const [editPriceOfCalc, setEditPriceOfCalc] = useState('');
 const [editCurrentPrice, setEditCurrentPrice] = useState('');
 const [editFair, setEditFair] = useState('');
 const [editProfileLink, setEditProfileLink] = useState('');
 const [editDividend, setEditDividend] = useState('');
 const [editSignal, setEditSignal] = useState('');
 const [editLow52, setEditLow52] = useState('');
 const [editHigh52, setEditHigh52] = useState('');
 const [editCalcLink, setEditCalcLink] = useState('');
 const [editAiAnalysis, setEditAiAnalysis] = useState('');

 // Pagination
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 15;

 const handleSort = (field: SortField) => {
 if (sortField === field) {
 if (sortOrder === 'desc') {
 setSortOrder('asc');
 } else {
 setSortField(null);
 }
 } else {
 setSortField(field);
 setSortOrder('desc');
 }
 };

 const startInlineEdit = (stock: Stock) => {
 setEditingRow(stock.ticker);
 setEditTicker(stock.ticker);
 setEditWatch(stock.watch || '');
 setEditCompanyName(stock.companyName);
 setEditDate(toIsoDate(stock.date || ''));
 setEditPriceOfCalc(stock.priceOfCalc !== null ? stock.priceOfCalc.toString() : '');
 setEditCurrentPrice(stock.currentPrice.toString());
 setEditFair(stock.fairPrice !== null ? stock.fairPrice.toString() : '');
 setEditProfileLink(getSectorForStock(stock.ticker, stock.profileLink, stock.companyName));
 setEditDividend(stock.dividend || '');
 setEditSignal(stock.signal || '');
 setEditLow52(stock.low52 !== null ? stock.low52.toString() : '');
 setEditHigh52(stock.high52 !== null ? stock.high52.toString() : '');
 setEditCalcLink(stock.calcLink || '');
 setEditAiAnalysis(stock.aiAnalysis || '');
 };

  useEffect(() => {
    if (!editingRow) return;
    const onGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSaveClick(editingRow);
      } else if (e.key === 'Escape') {
        cancelInlineEdit();
      }
    };
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  });

 const handleSaveClick = (ticker: string) => {
    const original = stocks.find(s => s.ticker === ticker);
    if (!original) return;

    executeSave(ticker, true);
  };

  const executeSave = (ticker: string, confirmUpdate: boolean, overrides?: Partial<Stock>) => {
  const original = stocks.find(s => s.ticker === ticker);
  if (!original) return;

  const parsedFair = editFair === '' ? null : parseFloat(editFair.replace(',', '.'));
  const parsedPriceOfCalc = editPriceOfCalc === '' ? null : parseFloat(editPriceOfCalc.replace(',', '.'));
 const parsedLow52 = editLow52 === '' ? null : parseFloat(editLow52.replace(',', '.'));
 const parsedHigh52 = editHigh52 === '' ? null : parseFloat(editHigh52.replace(',', '.'));
 const parsedCurrentPrice = editCurrentPrice === '' ? original.currentPrice : parseFloat(editCurrentPrice.replace(',', '.'));

 if (parsedFair !== null && isNaN(parsedFair)) {
 alert('Моля, въведете валидна справедлива цена.');
 return;
 }

 if (parsedPriceOfCalc !== null && isNaN(parsedPriceOfCalc)) {
 alert('Моля, въведете валидна цена на изчисление (Calculated Price).');
 return;
 }

 if (parsedLow52 !== null && isNaN(parsedLow52)) {
 alert('Моля, въведете валидна 52 Low стойност.');
 return;
 }

 if (parsedHigh52 !== null && isNaN(parsedHigh52)) {
 alert('Моля, въведете валидна 52 High стойност.');
 return;
 }

 if (isNaN(parsedCurrentPrice) || parsedCurrentPrice <= 0) {
 alert('Моля, въведете валидна текуща цена (по-голяма от 0).');
 return;
 }

 let finalFair = parsedFair;
 if (original.fairPrice !== parsedFair && !confirmUpdate) {
 finalFair = original.fairPrice;
 }

 // Recalculate based on spreadsheet logic:
 // Difference = (Fair Price - Current Price) / Current Price
 let difference: number | null = null;
 if (finalFair !== null && parsedCurrentPrice > 0) {
 difference = parseFloat((((finalFair - parsedCurrentPrice) / parsedCurrentPrice) * 100).toFixed(2));
 }

 let buySell = 'OVERVALUED';
 if (finalFair !== null && parsedCurrentPrice > 0) {
 const dev = ((parsedCurrentPrice - finalFair) / finalFair) * 100;
 if (dev < -buyThreshold) {
 buySell = 'UNDERVALUED';
 } else if (dev > sellThreshold) {
 buySell = 'OVERVALUED';
 } else {
 buySell = 'ДРУГИ';
 }
 }
 
  // Signal formula matching Google Sheets: =IF(P<=AW*1.05, "Buy", IF(P>=AO*0.95, "Sell", "Hold"))
  // P = currentPrice, AW = low52 (52-Week Low), AO = high52 (52-Week High)
  const autoSignalFromPrices = (cp: number, lo: number | null, hi: number | null): string => {
    if (!lo || !hi) return 'Hold';
    if (cp <= lo * 1.05) return 'Buy';
    if (cp >= hi * 0.95) return 'Sell';
    return 'Hold';
  };
  const computedSignal = autoSignalFromPrices(parsedCurrentPrice, parsedLow52, parsedHigh52);
  const finalSignal = computedSignal; // Always auto-calculated from 52W Low/High

 onUpdateStock(ticker, {
 ...original,
 ticker: editTicker.trim().toUpperCase() || original.ticker,
 watch: overrides?.watch !== undefined ? overrides.watch : editWatch,
 companyName: editCompanyName,
 date: fromIsoDate(editDate),
 priceOfCalc: parsedPriceOfCalc,
 currentPrice: parsedCurrentPrice,
 fairPrice: finalFair,
 difference,
 buySell,
 profileLink: editProfileLink,
 dividend: editDividend,
 signal: finalSignal,
 low52: parsedLow52,
 high52: parsedHigh52,
 calcLink: editCalcLink,
 aiAnalysis: editAiAnalysis
 });

 setEditingRow(null);
 setShowConfirmFair(null);
 };

 const cancelInlineEdit = () => {
 setEditingRow(null);
 setShowConfirmFair(null);
 };

 const handleAddNewStockSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 const tickerUpper = newTicker.trim().toUpperCase();
 if (!tickerUpper) {
 alert('Моля, въведете валиден тикер.');
 return;
 }

 if (stocks.some(s => s.ticker === tickerUpper)) {
 alert(`Акция с тикер ${tickerUpper} вече съществува в списъка!`);
 return;
 }

 const priceOfCalcNum = newPriceOfCalc === '' ? null : parseFloat(newPriceOfCalc);
 const fairPriceNum = newFairPrice === '' ? null : parseFloat(newFairPrice);

 if (priceOfCalcNum !== null && isNaN(priceOfCalcNum)) {
 alert('Моля, въведете валидна цена на изчисление.');
 return;
 }
 if (fairPriceNum !== null && isNaN(fairPriceNum)) {
 alert('Моля, въведете валидна справедлива цена.');
 return;
 }

 // Default current price to priceOfCalcNum or 100 if none given
 const initialPrice = priceOfCalcNum !== null ? priceOfCalcNum : 100.0;

 // Calculate difference
 let diffPercent: number | null = null;
 if (fairPriceNum !== null && initialPrice > 0) {
 diffPercent = parseFloat((((fairPriceNum - initialPrice) / initialPrice) * 100).toFixed(2));
 }

 let buySellValue = 'OVERVALUED';
 if (fairPriceNum !== null && initialPrice > 0) {
 const dev = ((initialPrice - fairPriceNum) / fairPriceNum) * 100;
 if (dev < -buyThreshold) {
 buySellValue = 'UNDERVALUED';
 } else if (dev > sellThreshold) {
 buySellValue = 'OVERVALUED';
 } else {
 buySellValue = 'ДРУГИ';
 }
 }
  // Signal formula matching Google Sheets: Buy if currentPrice <= low52*1.05, Sell if currentPrice >= high52*0.95
  const low52Default = priceOfCalcNum ? parseFloat((priceOfCalcNum * 0.78).toFixed(2)) : 80.0;
  const high52Default = priceOfCalcNum ? parseFloat((priceOfCalcNum * 1.25).toFixed(2)) : 125.0;
  let autoSignal = 'Hold';
  if (initialPrice <= low52Default * 1.05) autoSignal = 'Buy';
  else if (initialPrice >= high52Default * 0.95) autoSignal = 'Sell';

 const newStock: Stock = {
 watch: '',
 ticker: tickerUpper,
 companyName: newCompanyName.trim() || tickerUpper,
 date: fromIsoDate(newDate),
 priceOfCalc: priceOfCalcNum,
 dailyChangePct: 0.0,
 currentPrice: initialPrice,
 fairPrice: fairPriceNum,
 difference: diffPercent,
 buySell: buySellValue,
 marketCap: 2500000000, // typical Google Finance synced placeholder or simulation base values
 peRatio: 16.8,
 eps: 4.12,
 profileLink: `https://www.google.com/finance/quote/${tickerUpper}:NASDAQ`,
 dividend: '1.2% (0.50$)',
 signal: autoSignal,
 low52: priceOfCalcNum ? parseFloat((priceOfCalcNum * 0.78).toFixed(2)) : 80.0,
 high52: priceOfCalcNum ? parseFloat((priceOfCalcNum * 1.25).toFixed(2)) : 125.0,
 calcLink: newCalcLink,
 };

 onAddStock(newStock);
 setIsAddModalOpen(false);

 // Reset states
 setNewTicker('');
 setNewCompanyName('');
 setNewDate('');
 setNewPriceOfCalc('');
 setNewFairPrice('');
 setNewCalcLink('');
 };

 // Filter logic
 const filteredStocks = stocks.filter(stock => {
 const matchesSearch =
 stock.ticker.toLowerCase().includes(search.toLowerCase()) ||
 stock.companyName.toLowerCase().includes(search.toLowerCase());

 if (!matchesSearch) return false;

 if (activeFilter.type === 'all') return true;
 
 // Support filtering exactly by watch column values
 if (activeFilter.type === 'watch') {
   return stock.watch === activeFilter.value;
 }

 if (activeFilter.type === 'signal') {
 const sig = stock.signal?.trim().toLowerCase();
 if (activeFilter.value === 'buy') {
 return sig === 'buy';
 }
 if (activeFilter.value === 'sell') {
 return sig === 'sell';
 }
 if (activeFilter.value === 'hold') {
 return sig === 'hold' || sig === 'изчакай' || !sig || sig === '-';
 }
 }

 if (activeFilter.type === 'buySell') {
 return stock.buySell === activeFilter.value;
 }

 if (activeFilter.type === 'ticker') {
 return (stock.ticker || '').toLowerCase() === (activeFilter.value || '').toLowerCase();
 }

 return true;
 });

 // Sort logic
 const sortedStocks = !sortField
 ? [...filteredStocks]
 : [...filteredStocks].sort((a, b) => {
 let valA = a[sortField];
 let valB = b[sortField];

 if (valA === null) return sortOrder === 'asc' ? 1 : -1;
 if (valB === null) return sortOrder === 'asc' ? -1 : 1;

 if (typeof valA === 'string' && typeof valB === 'string') {
 return sortOrder === 'asc'
 ? valA.localeCompare(valB)
 : valB.localeCompare(valA);
 }

 return sortOrder === 'asc'
 ? (valA as number) - (valB as number)
 : (valB as number) - (valA as number);
 });

 // Direct non-paginated output to support continuous scrolling
 const pageStocks = sortedStocks;

 const formatLargeNum = (num: number | null) => {
 if (num === null) return '-';
 if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
 if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
 return num.toLocaleString();
 };

 return (
 <div className="w-full bg-bg rounded-2xl border border-border overflow-hidden shadow-xs">
 
 {/* Search & Filters */}
 <div className="p-3 bg-bg border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
 <div className="flex flex-wrap items-center gap-2">
 
 <div className="relative w-full md:w-64">
 <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-ink-faint" />
 <input
 type="text"
 placeholder="Търсене по тикер или име..."
 value={search}
 onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
 className="w-full bg-bg rounded-2xl border border-border pl-8 pr-3 py-1 text-xs text-ink focus:outline-none focus:border-border font-sans tabular-nums"
 />
 </div>

        <select
          value={`${activeFilter.type}|${activeFilter.value}`}
          onChange={(e) => {
            const [type, value] = e.target.value.split('|');
            onSetActiveFilter({ type: type as any, value });
            setCurrentPage(1);
          }}
          className="px-2.5 py-1 text-xs font-sans tabular-nums font-extrabold uppercase transition-all rounded-xl border border-border-hover bg-bg text-ink cursor-pointer focus:outline-none focus:border-indigo-500 h-[26px]"
        >
          <option value="all|all">Всички ({stocks.length})</option>
          <option value="watch|Buy">Buy ({stocks.filter(s => s.watch === 'Buy').length})</option>
          <option value="watch|Sell">Sell ({stocks.filter(s => s.watch === 'Sell').length})</option>
          <option value="watch|Watch">Watch ({stocks.filter(s => s.watch === 'Watch').length})</option>
          <option value="watch|Attn">Attn ({stocks.filter(s => s.watch === 'Attn' || s.watch === 'Atten').length})</option>
          <option value="watch|Interesting">Interesting ({stocks.filter(s => s.watch === 'Interesting').length})</option>
          <option value="watch|Not interesting">Not interesting ({stocks.filter(s => s.watch === 'Not interesting').length})</option>
        </select>

 <button
 onClick={() => {
 // Pre-fill today's ISO date
 const todayStr = new Date().toISOString().split('T')[0];
 setNewDate(todayStr);
 setNewTicker('');
 setNewCompanyName('');
 setNewPriceOfCalc('');
 setNewFairPrice('');
 setIsAddModalOpen(true);
 }}
 className="px-2.5 py-1 text-xs font-sans tabular-nums font-extrabold uppercase transition-all rounded-md border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0"
 title="Добави нова акция в таблицата"
 >
 <Plus className="w-3.5 h-3.5" />
 Добавяне
 </button>

   {/* Price Alert Button */}
   <button
     onClick={() => {
       setAlertModalTicker('AAPL');
       setAlertModalCriteria('ABOVE');
       setAlertModalTargetPrice('400.00');
       setIsQuickAlertOpen(true);
     }}
     className="px-2.5 py-1 text-xs font-sans tabular-nums font-extrabold uppercase transition-all rounded-md border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0"
     title="Планиране на персонализирани известия за цена"
   >
     <Bell className="w-3.5 h-3.5" />
     Известие
   </button>

         <button
           type="button"
           onClick={() => setIsChecklistOpen(true)}
           className="px-2.5 py-1 text-xs font-sans tabular-nums font-extrabold uppercase transition-all rounded-md border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0"
           title="Отвори Check List за анализ на акции"
         >
           <CheckSquare className="w-3.5 h-3.5" />
           Check List
         </button>

        <a
          href="https://docs.google.com/spreadsheets/d/17_6iFN5fMhaB0sWHDUkFmcSM5H8UYxovFN1GdZa020U/edit?gid=1200162805#gid=1200162805"
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 text-xs font-sans tabular-nums font-extrabold uppercase transition-all rounded-md border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0"
          title="Отвори калкулатора в Google Sheets"
        >
          <Calculator className="w-3.5 h-3.5" />
          Calculator
        </a>

 {/* Special badges when filtering by signals from the charts */}
 {activeFilter.type === 'signal' && activeFilter.value === 'buy' && (
 <span className="px-2.5 py-1 text-xs font-sans tabular-nums font-extrabold uppercase rounded-md border bg-[#10b981] text-ink border-[#10b981]/50 flex items-center gap-1 shrink-0">
 Активен Сигнал: КУПУВАЙ ({stocks.filter(s => s.signal?.trim().toLowerCase() === 'buy').length})
 <button onClick={() => { onSetActiveFilter({ type: 'all', value: 'all' }); setCurrentPage(1); }} className="hover:text-red-200 ml-1 font-bold cursor-pointer">×</button>
 </span>
 )}
 {activeFilter.type === 'signal' && activeFilter.value === 'sell' && (
 <span className="px-2.5 py-1 text-xs font-sans tabular-nums font-extrabold uppercase rounded-md border bg-[#f43f5e] text-ink border-[#f43f5e]/50 flex items-center gap-1 shrink-0">
 Активен Сигнал: ПРОДАВАЙ ({stocks.filter(s => s.signal?.trim().toLowerCase() === 'sell').length})
 <button onClick={() => { onSetActiveFilter({ type: 'all', value: 'all' }); setCurrentPage(1); }} className="hover:text-red-200 ml-1 font-bold cursor-pointer">×</button>
 </span>
 )}

 {activeFilter.type === 'ticker' && (
 <span className="px-2.5 py-1 text-xs font-sans tabular-nums font-extrabold uppercase rounded-md border bg-indigo-600 text-ink border-indigo-950 flex items-center gap-1 shrink-0">
 Активен актив: {activeFilter.value}
 <button onClick={() => { onSetActiveFilter({ type: 'all', value: 'all' }); setCurrentPage(1); }} className="hover:text-indigo-200 ml-1 font-bold cursor-pointer">×</button>
 </span>
 )}
 </div>
 </div>

  {/* Main Grid Responsive Table with exactly 21 columns and scrollbar view */}
  <div 
    className="w-full max-h-[65vh] md:max-h-[520px] overflow-auto border-b border-border/15 touch-pan-x touch-pan-y scroll-smooth"
    style={{ WebkitOverflowScrolling: 'touch' }}
  >
  <table className="w-full text-left border-collapse min-w-[2000px] table-auto">

 <thead className="sticky top-0 z-20 bg-bg rounded-2xl">
          <tr className="bg-bg rounded-2xl text-ink/90 border-b-2 border-border text-xs uppercase font-medium font-sans tabular-nums tracking-wider">
 <th className="py-3 px-4 whitespace-nowrap">Watch</th>
 <th className="py-3 px-4 cursor-pointer hover:bg-white/10/50 whitespace-nowrap" onClick={() => handleSort('ticker')}>
 Ticker{sortField === 'ticker' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
 </th>
 <th className="py-3 px-4 whitespace-nowrap">Company Name</th>
 <th className="py-3 px-4 text-center whitespace-nowrap">Statistics</th>
 <th className="py-3 px-4 text-center whitespace-nowrap">365 Chart</th>
 <th className="py-3 px-4 whitespace-nowrap">Date</th>
 <th className="py-3 px-4 text-right whitespace-nowrap">Price of Calc.</th>
 <th className="py-3 px-4 text-right cursor-pointer hover:bg-white/10/50 whitespace-nowrap" onClick={() => handleSort('dailyChangePct')}>
 Daily Change %{sortField === 'dailyChangePct' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
 </th>
 <th className="py-3 px-4 text-right cursor-pointer hover:bg-white/10/50 whitespace-nowrap" onClick={() => handleSort('currentPrice')}>
 Current Price{sortField === 'currentPrice' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
 </th>
 <th className="py-3 px-4 text-right cursor-pointer hover:bg-white/10/50 whitespace-nowrap" onClick={() => handleSort('fairPrice')}>
 Fair Price{sortField === 'fairPrice' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
 </th>
 <th className="py-3 px-4 text-right cursor-pointer hover:bg-white/10/50 whitespace-nowrap" onClick={() => handleSort('difference')}>
 Difference{sortField === 'difference' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
 </th>
 <th className="py-3 px-4 text-center whitespace-nowrap">Over/Under</th>
 <th className="py-3 px-4 text-right cursor-pointer hover:bg-white/10/50 whitespace-nowrap" onClick={() => handleSort('marketCap')}>
 Market Cap{sortField === 'marketCap' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
 </th>
 <th className="py-3 px-4 text-right whitespace-nowrap">P/E Ratio</th>
 <th className="py-3 px-4 text-right whitespace-nowrap">EPS</th>
 <th className="py-3 px-4 text-center whitespace-nowrap">Sector</th>
 <th className="py-3 px-4 whitespace-nowrap">Signal</th>
 <th className="py-3 px-4 text-right whitespace-nowrap">52 Low</th>
 <th className="py-3 px-4 text-right whitespace-nowrap">52 High</th>
 <th className="py-3 px-4 text-center whitespace-nowrap">AI Анализ</th>
 <th className="py-3 px-4 text-center whitespace-nowrap">Калк</th>
 <th className="py-3 px-4 text-center whitespace-nowrap">Важни Новини</th>
 </tr>
 </thead>

 <tbody className="divide-y divide-white/10 font-sans tabular-nums text-xs text-ink">
 {pageStocks.map(stock => {
 const isEditing = editingRow === stock.ticker;
 const isPositiveChange = stock.dailyChangePct >= 0;
 const isUndervalued = stock.difference !== null && stock.difference > 0;

 return (
 <tr
 key={stock.ticker}
 onClick={(e) => {
   // Avoid selecting row when clicking on buttons, links or selects inside the row
   if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'A' && (e.target as HTMLElement).tagName !== 'SELECT') {
     setSelectedRow(stock.ticker);
   }
 }}
 className={`transition-all duration-150 group cursor-pointer ${
    isEditing ? 'bg-bg' : ''
  } ${
    selectedRow === stock.ticker 
      ? 'bg-indigo-500/20 text-ink ring-2 ring-indigo-500/50 shadow-md font-bold' 
      : 'hover:bg-indigo-500/10'
  }`}
 onKeyDown={isEditing ? (e) => {
 if (e.key === 'Enter') {
 handleSaveClick(stock.ticker);
 } else if (e.key === 'Escape') {
 cancelInlineEdit();
 }
 } : undefined}
 >
 {/* 1. WATCH */}
 <td className="py-3 px-4 font-sans overflow-hidden text-ellipsis whitespace-nowrap">
 {isEditing ? (
 <select
 value={editWatch}
 onChange={e => {
    const newVal = e.target.value;
    setEditWatch(newVal);
    executeSave(stock.ticker, true, { watch: newVal });
  }}
 onKeyDown={(e) => {
    if (e.key === 'Enter') e.stopPropagation();
  }}
 className="bg-bg rounded-2xl text-xs text-ink border border-border p-0.5 rounded-md font-sans tabular-nums w-full"
 >
 <option value="">-</option>
 <option value="Buy">Buy</option>
 <option value="Sell">Sell</option>
 <option value="Watch">Watch</option>
 <option value="Attn">Attn</option>
 <option value="Interesting">Interesting</option>
 <option value="Not interesting">Not interesting</option>
 </select>
 ) : stock.watch === 'Attn' || stock.watch === 'Atten' ? (
 <span className="inline-block w-20 text-center bg-amber-500 text-white font-extrabold py-0.5 text-xs uppercase rounded-full shadow-sm">
 Attn
 </span>
 ) : stock.watch === 'Watch' ? (
 <span className="inline-block w-20 text-center bg-indigo-500 text-white font-extrabold py-0.5 text-xs uppercase rounded-full shadow-sm">
 Watch
 </span>
 ) : stock.watch === 'Sell' ? (
 <span className="inline-block w-20 text-center bg-[#f43f5e] text-white font-extrabold py-0.5 text-xs uppercase rounded-full shadow-sm">
 Sell
 </span>
 ) : stock.watch === 'Buy' ? (
 <span className="inline-block w-20 text-center bg-[#10b981] text-white font-extrabold py-0.5 text-xs uppercase rounded-full shadow-sm">
 Buy
 </span>
 ) : stock.watch === 'Interesting' ? (
 <span className="inline-block w-24 text-center bg-purple-500 text-white font-extrabold py-0.5 text-xs uppercase rounded-full shadow-sm">
 Interesting
 </span>
 ) : stock.watch === 'Not interesting' ? (
 <span className="inline-block w-24 text-center bg-white/10 text-ink-muted font-bold py-0.5 border border-border text-xs uppercase rounded-full">
 Not interesting
 </span>
 ) : (
 <span className="text-ink-faint">-</span>
 )}
 </td>

  {/* 2. TICKER */}
  <td className="py-3 px-4 text-ink overflow-hidden text-ellipsis">
    {isEditing ? (
      <input
        type="text"
        value={editTicker}
        onChange={e => setEditTicker(e.target.value)}
        className="w-16 bg-bg rounded-2xl text-left font-sans text-xs font-extrabold text-ink border border-border px-1 py-0.5 focus:outline-none"
      />
    ) : (
      <div className="flex flex-col gap-1 items-start">
        <span className="font-extrabold">{stock.ticker}</span>
      {stock.earningsTimestamp && (() => {
        const daysLeft = Math.ceil((stock.earningsTimestamp * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysLeft >= 0 && daysLeft <= 14) {
          return (
            <span className="animate-pulse bg-amber-500/10 text-amber-500 text-xs font-bold px-1.5 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1 shadow-sm shadow-amber-500/10" title="Наближаващ финансов отчет">
              ⚠️ {daysLeft === 0 ? 'ДНЕС' : `ОТЧЕТ: ${daysLeft} ДНИ`}
            </span>
          );
        }
        return null;
      })()}
    </div>
    )}
  </td>

  {/* 3. COMPANY NAME */}
  <td className="py-3 px-4 text-ink font-sans font-medium hover:text-ink transition-colors overflow-hidden text-ellipsis whitespace-nowrap min-w-[220px]">
  {isEditing ? (
  <div className="flex items-center gap-2">
    <StockLogo ticker={stock.ticker} />
    <input
    type="text"
    value={editCompanyName}
    onChange={e => setEditCompanyName(e.target.value)}
    className="w-full bg-bg rounded-2xl text-left font-sans text-xs text-ink border border-border px-1 py-0.5 rounded-md focus:outline-none"
    />
  </div>
  ) : (
  <div className="flex items-center justify-between gap-2 w-full">
    <div className="flex items-center gap-2 min-w-0">
      <StockLogo ticker={stock.ticker} />
      <span className="truncate">{stock.companyName}</span>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        startInlineEdit(stock);
      }}
      className="p-1 rounded-md text-indigo-400 opacity-70 group-hover:opacity-100 hover:text-indigo-300 hover:bg-indigo-500/20 transition-all cursor-pointer shrink-0"
      title="Редактирай ред"
    >
      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
    </button>
  </div>
  )}
  </td>

  {/* 4. STATISTICS */}
  <td className="py-3 px-4 text-ink whitespace-nowrap text-center">
    <div className="flex items-center justify-center gap-1.5">
      {stock.ticker && !stock.ticker.startsWith('^') && (
        <>
          {/* TradingView Financials Badge [$] */}
          <button
            onClick={() => setFinancialsModalStock(stock)}
            className="w-5 h-5 rounded-full bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white border border-amber-500/30 font-black text-[11px] leading-none transition-all flex items-center justify-center shadow-2xs cursor-pointer"
            title="TradingView Financial Statements & Statistics ($)"
          >
            $
          </button>

          {/* TradingView Earnings Badge [E] */}
          <button
            onClick={() => setEarningsModalStock(stock)}
            className="w-5 h-5 rounded-full bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/30 font-black text-[10px] leading-none transition-all flex items-center justify-center shadow-2xs cursor-pointer"
            title={`Earnings Date & Schedule: ${stock.earningsTimestamp ? new Date(stock.earningsTimestamp * 1000).toLocaleDateString('bg-BG') : 'Отвори TradingView отчети'}`}
          >
            E
          </button>

          {/* TradingView Dividend Badge [D] */}
          <button
            onClick={() => setDividendModalStock(stock)}
            className="w-5 h-5 rounded-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 font-black text-[10px] leading-none transition-all flex items-center justify-center shadow-2xs cursor-pointer"
            title={`Dividends & Payment History: ${stock.dividend || 'TradingView'}`}
          >
            D
          </button>


          {/* Quick Price Alert Badge [🔔] */}
          <button
            onClick={() => {
              setAlertModalTicker(stock.ticker);
              setAlertModalCriteria('ABOVE');
              const defaultVal = stock.currentPrice || stock.priceOfCalc || 400;
              setAlertModalTargetPrice(defaultVal.toFixed(2));
              setIsQuickAlertOpen(true);
            }}
            className="w-5 h-5 rounded-full bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/30 font-black text-[10px] leading-none transition-all flex items-center justify-center shadow-2xs cursor-pointer"
            title="Заложи персонализирано известие за цена за тази акция"
          >
            🔔
          </button>
        </>
      )}
    </div>
  </td>

 {/* 4. 365 CHART */}
 <td className="py-3 px-4 text-center">
 <button
 onClick={() => setActiveChartStock(stock)}
 className="inline-flex items-center justify-center p-1 rounded-md hover:bg-stone-100 border border-transparent hover:border-border transition-all cursor-pointer shrink-0 min-w-[64px]"
 title="Кликнете за детайлна интерактивна графика"
 >
 <StockSparkline changePct={stock.dailyChangePct} ticker={stock.ticker} />
 </button>
 </td>

 {/* 5. DATE */}
 <td className="py-3 px-4 text-ink-faint text-xs overflow-hidden text-ellipsis whitespace-nowrap">
 {isEditing ? (
 <input
 type="date"
 value={editDate}
 onChange={e => setEditDate(e.target.value)}
 className="w-full bg-bg rounded-2xl text-left font-sans tabular-nums text-xs text-ink border border-border px-1 py-0.5 rounded-md focus:outline-none cursor-pointer"
 />
 ) : (
 <span>{formatDateDDMMYYYY(stock.date)}</span>
 )}
 </td>

 {/* 6. PRICE OF CALC. */}
 <td className="py-3 px-4 text-right text-ink-faint">
 {isEditing ? (
 <input
 type="text"
 value={editPriceOfCalc}
 onChange={e => setEditPriceOfCalc(e.target.value)}
 className="w-full bg-bg rounded-2xl text-right font-sans tabular-nums text-xs text-ink border border-border p-0.5 rounded-md focus:outline-none"
 placeholder="-"
 />
 ) : (
 <span>{stock.priceOfCalc !== null ? `$${stock.priceOfCalc.toFixed(2)}` : '-'}</span>
 )}
 </td>

 {/* 7. DAILY CHANGE % */}
 <td className="py-3 px-4 text-right font-extrabold">
 <span
 className={`flex items-center justify-end gap-0.5 ${
 isPositiveChange ? 'text-[#10b981]' : 'text-[#f43f5e]'
 }`}
 >
 {isPositiveChange ? (
 <TrendingUp className="w-3 h-3 shrink-0" />
 ) : (
 <TrendingDown className="w-3 h-3 shrink-0" />
 )}
 <span>{stock.dailyChangePct ? `${isPositiveChange ? '+' : ''}${stock.dailyChangePct.toFixed(2)}%` : '0.00%'}</span>
 </span>
 </td>

 {/* 8. CURRENT PRICE */}
 <td className="py-3 px-4 text-right font-extrabold text-ink">
 {isEditing ? (
 <input
 type="text"
 value={editCurrentPrice}
 onChange={e => setEditCurrentPrice(e.target.value)}
 className="w-full bg-bg rounded-2xl text-right font-bold text-ink border border-border p-0.5 rounded-md font-sans tabular-nums text-xs focus:outline-none"
 />
 ) : (
 <span>${stock.currentPrice.toFixed(2)}</span>
 )}
 </td>

 {/* 9. FAIR PRICE */}
 <td className="py-3 px-4 text-right font-extrabold text-[#10b981] ">
 {isEditing ? (
 <input
 type="text"
 value={editFair}
 onChange={e => setEditFair(e.target.value)}
 className="w-full bg-bg rounded-2xl text-right font-bold text-ink border border-border p-0.5 rounded-md font-sans tabular-nums text-xs focus:outline-none"
 placeholder="-"
 />
 ) : (
 <span>{stock.fairPrice !== null ? `$${stock.fairPrice.toFixed(2)}` : 'N/A'}</span>
 )}
 </td>

 {/* 10. DIFFERENCE */}
 <td className={`py-3 px-4 text-right font-extrabold ${isUndervalued ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
 {stock.difference !== null ? (
 <span>{stock.difference > 0 ? '▲ +' : '▼ '}{stock.difference.toFixed(2)}%</span>
 ) : (
 <span className="text-ink0">#N/A</span>
 )}
 </td>

 {/* 11. BUY / SELL */}
 <td className="py-3 px-4 text-center">
 {stock.buySell === 'UNDERVALUED' ? (
  <span className="inline-block w-28 text-center bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 py-0.5 text-xs font-extrabold uppercase tracking-wide rounded-full">
  UNDERVALUED
  </span>
 ) : stock.buySell === 'OVERVALUED' ? (
  <span className="inline-block w-28 text-center bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20 py-0.5 text-xs font-extrabold uppercase tracking-wide rounded-full">
  OVERVALUED
  </span>
 ) : (
 <span className="bg-[#D9D8D5] text-ink border border-border/30 px-2.5 py-0.5 text-xs font-bold uppercase rounded-full">
 {stock.buySell}
 </span>
 )}
 </td>

 {/* 12. MARKET CAP [LOCKED] */}
 <td className="py-3 px-4 text-right text-ink-muted font-sans tabular-nums ">
 {formatLargeNum(stock.marketCap)}
 </td>

 {/* 13. P/E RATIO [LOCKED] */}
 <td className="py-3 px-4 text-right text-ink-muted font-sans tabular-nums ">
 {stock.peRatio ? stock.peRatio.toFixed(2) : '-'}
 </td>

 {/* 14. EPS [LOCKED] */}
 <td className="py-3 px-4 text-right text-ink font-bold ">
 {stock.eps ? `$${stock.eps.toFixed(2)}` : '-'}
 </td>

 {/* 15. SECTOR */}
 <td className="py-3 px-4 text-center whitespace-nowrap">
 {isEditing ? (
 <input
 type="text"
 value={editProfileLink}
 onChange={e => setEditProfileLink(e.target.value)}
 className="w-full bg-bg rounded-2xl text-left font-sans text-xs text-ink border border-border px-1 py-0.5 rounded-md focus:outline-none"
 placeholder="Сектор"
 />
 ) : (
 <span className="inline-block px-1.5 py-0.5 text-xs font-sans font-medium text-ink bg-border rounded-sm whitespace-nowrap">
 {getSectorForStock(stock.ticker, stock.profileLink, stock.companyName)}
 </span>
 )}
 </td>


 {/* 17. SIGNAL */}
 <td className="py-3 px-4 text-ink overflow-hidden text-ellipsis whitespace-nowrap">
 {isEditing ? (
 <input
 type="text"
 value={editSignal}
 onChange={e => setEditSignal(e.target.value)}
 className="w-full bg-bg rounded-2xl text-left font-sans tabular-nums text-xs text-ink border border-border px-1 py-0.5 rounded-md focus:outline-none"
 />
 ) : (
 <span className="truncate font-semibold text-xs uppercase">
    {stock.signal?.trim().toLowerCase() === 'buy' ? 'КУПУВАЙ' : 
     stock.signal?.trim().toLowerCase() === 'sell' ? 'ПРОДАВАЙ' : 
     stock.signal?.trim().toLowerCase() === 'hold' ? 'ИЗЧАКАЙ' : 
     (stock.signal || '-')}
  </span>
 )}
 </td>

 {/* 18. 52 LOW */}
 <td className="py-3 px-4 text-right text-gray-650">
 {isEditing ? (
 <input
 type="text"
 value={editLow52}
 onChange={e => setEditLow52(e.target.value)}
 className="w-full bg-bg rounded-2xl text-right font-sans tabular-nums text-xs text-ink border border-border p-0.5 rounded-md focus:outline-none"
 placeholder="-"
 />
 ) : (
 <span>{stock.low52 !== null ? `$${stock.low52.toFixed(2)}` : '-'}</span>
 )}
 </td>

 {/* 19. 52 HIGH */}
 <td className="py-3 px-4 text-right text-gray-650">
 {isEditing ? (
 <input
 type="text"
 value={editHigh52}
 onChange={e => setEditHigh52(e.target.value)}
 className="w-full bg-bg rounded-2xl text-right font-sans tabular-nums text-xs text-ink border border-border p-0.5 rounded-md focus:outline-none"
 placeholder="-"
 />
 ) : (
 <div className="flex items-center justify-end gap-1 group/cell">
 <span>{stock.high52 !== null ? `$${stock.high52.toFixed(2)}` : '-'}</span>
 <button
 onClick={() => startInlineEdit(stock)}
 className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover/cell:opacity-100 text-ink-faint hover:text-ink transition-opacity p-0.5 shrink-0"
 title="Редактирай 52W High"
 >
  <span />
 </button>
 </div>
 )}
 </td>

 {/* 20. AI ANALYSIS LINK */}
 <td className="py-3 px-4 text-center">
 {isEditing ? (
 <input
 type="text"
 placeholder="AI Линк..."
 value={editAiAnalysis}
 onChange={e => setEditAiAnalysis(e.target.value)}
 className="w-full bg-bg rounded-2xl text-xs text-ink border border-border p-1 focus:outline-none focus:border-indigo-500 font-sans tabular-nums"
 />
 ) : stock.aiAnalysis ? (
 <a
 href={stock.aiAnalysis}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center justify-center p-1.5 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
 title="Отвори AI Анализа"
 >
 <Sparkles className="w-3.5 h-3.5" />
 </a>
 ) : (
 <span className="text-ink-faint text-xs">-</span>
 )}
 </td>

 {/* 21. CALC LINK */}
 <td className="py-3 px-4 text-center">
 {isEditing ? (
 <input
 type="text"
 placeholder="Линк..."
 value={editCalcLink}
 onChange={e => setEditCalcLink(e.target.value)}
 className="w-full bg-bg rounded-2xl text-xs text-ink border border-border p-1 focus:outline-none focus:border-indigo-500 font-sans tabular-nums"
 />
 ) : stock.calcLink ? (
 <a
 href={stock.calcLink}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center justify-center p-1.5 rounded-full bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 transition-colors"
 title="Отвори калкулацията"
 >
 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
 </a>
 ) : (
 <span className="text-ink-faint text-xs">-</span>
 )}
 </td>

 {/* 22. AI ANALIS */}
 <td className="py-3 px-4 text-center">
 {isEditing ? (
  <div className="flex items-center justify-center gap-1 shrink-0">
 <button
 onClick={() => handleSaveClick(stock.ticker)}
 className="p-1 rounded-md bg-emerald-700 text-ink hover:bg-[#10b981] duration-100 border border-emerald-800 cursor-pointer"
 title="Запази"
 >
 <Check className="w-3 h-3" />
 </button>
 <button
 onClick={cancelInlineEdit}
 className="p-1 rounded-md bg-red-700 text-ink hover:bg-red-800 duration-100 border border-red-850 cursor-pointer"
 title="Отказ"
 >
 <X className="w-3 h-3" />
 </button>
 </div>
 ) : (
 <div className="flex items-center justify-center gap-1.5 shrink-0">
 <button
 onClick={() => onSelectStockForAi(stock)}
 className="inline-flex items-center gap-1 text-xs font-bold py-0.5 px-2.5 border border-border bg-bg hover:bg-[#10b981] hover:text-ink hover:border-emerald-900 text-ink transition-all rounded-md"
 title="Прочетете най-новите достоверни новини за компанията"
 >
 <Newspaper className="w-2.5 h-2.5 text-[#10b981] group-hover:text-ink" />
 <span>Новини</span>
 </button>
 <button
 onClick={() => onDeleteStock(stock.ticker)}
 className="p-1 rounded-md border border-transparent hover:border-[#f43f5e]/20 hover:bg-red-50 text-gray-550 hover:text-red-700 transition-all cursor-pointer"
 title="Изтриване на този ред"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 )}
 </td>

 </tr>
 );
 })}

 {pageStocks.length === 0 && (
 <tr>
 <td colSpan={22} className="py-12 text-center text-gray-650 font-sans text-xs">
 Няма намерени резултати за "{search}". Проверете вашето търсене.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {/* table status footer */}
 <div className="p-3 bg-bg border-t border-border flex flex-col sm:flex-row sm:items-center justify-between font-sans tabular-nums text-xs text-ink/90 gap-1.5">
 <span>
 Показване на всички <span className="font-extrabold underline">{sortedStocks.length}</span> намерени акции
 </span>
 <span className="text-xs text-ink-faint italic">
 Използвайте скрол лентата за нагоре и надолу, за да прегледате пълната таблица
 </span>
 </div>

 {/* Modern Retro Modal for adding a new Stock */}
 {isAddModalOpen && (
 <div className="fixed inset-0 bg-bg/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
 <div className="bg-bg border-2 border-border rounded-md shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] w-full max-w-md p-5 relative font-sans tabular-nums text-xs">
 
 {/* Header */}
 <div className="flex items-center justify-between border-b-2 border-border pb-2.5 mb-4">
 <h3 className="text-xs uppercase font-extrabold text-ink flex items-center gap-1.5">
 <Plus className="w-4 h-4 text-blue-800 animate-pulse" />
 <span>Добави нов актив</span>
 </h3>
 <button 
 onClick={() => setIsAddModalOpen(false)} 
 className="text-ink-faint hover:text-ink p-0.5 cursor-pointer"
 type="button"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <form onSubmit={handleAddNewStockSubmit} className="space-y-3.5">
 
 <div className="grid grid-cols-2 gap-3.5">
 {/* Ticker */}
 <div>
 <label className="block text-xs font-bold uppercase text-ink/90 mb-1">
 Тикер / Ticker *
 </label>
 <input
 type="text"
 required
 placeholder="напр. MSFT"
 value={newTicker}
 onChange={e => setNewTicker(e.target.value)}
 className="w-full bg-bg rounded-2xl border border-border font-bold uppercase p-2 focus:outline-none focus:border-blue-900"
 />
 </div>

 {/* Company Name */}
 <div>
 <label className="block text-xs font-bold uppercase text-ink/90 mb-1">
 Компания / Name
 </label>
 <input
 type="text"
 placeholder="напр. Microsoft"
 value={newCompanyName}
 onChange={e => setNewCompanyName(e.target.value)}
 className="w-full bg-bg rounded-2xl border border-border p-2 focus:outline-none focus:border-blue-900"
 />
 </div>
 </div>

 {/* DATE Calendar widget */}
 <div>
 <label className="block text-xs font-bold uppercase text-ink/90 mb-1">
 Дата / Date *
 </label>
 <input
 type="date"
 required
 value={newDate}
 onChange={e => setNewDate(e.target.value)}
 onClick={(e) => { try { (e.target as any).showPicker(); } catch (err) {} }}
 className="w-full bg-bg rounded-2xl border border-border p-2 focus:outline-none focus:border-blue-900 cursor-pointer"
 />
 </div>

 <div className="grid grid-cols-2 gap-3.5">
 {/* Price of Calc */}
 <div>
 <label className="block text-xs font-bold uppercase text-ink/90 mb-1">
 Цена на калкулация *
 </label>
 <input
 type="number"
 step="0.01"
 required
 placeholder="напр. 385.50"
 value={newPriceOfCalc}
 onChange={e => setNewPriceOfCalc(e.target.value)}
 className="w-full bg-bg rounded-2xl border border-border p-2 focus:outline-none focus:border-blue-900"
 />
 </div>

 {/* Fair Price */}
 <div>
 <label className="block text-xs font-bold uppercase text-ink/90 mb-1">
 Справедлива цена *
 </label>
 <input
 type="number"
 step="0.01"
 required
 placeholder="напр. 410.00"
 value={newFairPrice}
 onChange={e => setNewFairPrice(e.target.value)}
 className="w-full bg-bg rounded-2xl border border-border p-2 focus:outline-none focus:border-blue-900"
 />
 </div>
 </div>

 {/* Calc Link */}
 <div className="mt-3.5">
 <label className="block text-xs font-bold uppercase text-ink/90 mb-1">
 Линк към калкулация (Опционално)
 </label>
 <input
 type="url"
 placeholder="https://docs.google.com/spreadsheets/d/..."
 value={newCalcLink}
 onChange={e => setNewCalcLink(e.target.value)}
 className="w-full bg-bg rounded-2xl border border-border p-2 focus:outline-none focus:border-blue-900"
 />
 </div>

 <div className="text-xs text-ink-faint italic pt-1 text-right leading-tight">
 * Разликата, Сигналът и Over/Under се изчисляват автоматично на база цена и качество.
 </div>

 {/* Footer Buttons */}
 <div className="flex items-center justify-end gap-2 border-t border-border/15 pt-3.5 mt-4">
 <button
 type="button"
 onClick={() => setIsAddModalOpen(false)}
 className="px-3.5 py-2 font-bold uppercase bg-bg rounded-2xl hover:bg-white/10/50 border border-border rounded-md text-ink cursor-pointer"
 >
 Отказ
 </button>
 <button
 type="submit"
 className="px-4 py-2 font-extrabold uppercase bg-emerald-700 hover:bg-[#10b981] border border-[#10b981]/50 text-ink rounded-md shadow-sm cursor-pointer"
 >
 Запази & Добави
 </button>
 </div>

 </form>

 </div>
 </div>
 )}

 {/* Modern Interactive Detail Chart Modal */}
 {activeChartStock && (
 <StockDetailChartModal 
 stock={activeChartStock} 
 onClose={() => setActiveChartStock(null)} 
 />
 )}

 {/* Dividend Fundamental Data Modal */}
 {dividendModalStock && (
 <DividendModal 
 stock={dividendModalStock} 
 onClose={() => setDividendModalStock(null)} 
 />
 )}

 {/* Earnings Fundamental Data Modal */}
 {earningsModalStock && (
 <EarningsModal 
 stock={earningsModalStock} 
 onClose={() => setEarningsModalStock(null)} 
 />
 )}

 {/* Financials Statements Data Modal ($) */}
 {financialsModalStock && (
 <FinancialsModal 
 stock={financialsModalStock} 
 onClose={() => setFinancialsModalStock(null)} 
 />
 )}

 {/* Quick Price Alert Planner Modal */}
 {isQuickAlertOpen && (
 <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
 <div className="bg-bg border border-border rounded-2xl p-5 max-w-md w-full shadow-2xl relative">
 <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
 <h3 className="text-xs uppercase font-extrabold text-ink tracking-tight flex items-center gap-2">
 <Bell className="w-4 h-4 text-indigo-400" />
 Планиране на персонализирани известия за цена
 </h3>
 <button
 onClick={() => setIsQuickAlertOpen(false)}
 className="text-ink-faint hover:text-ink transition-colors p-1 cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <p className="text-xs text-ink-faint mb-4">
 Конфигурирайте известия при пресичане на таргета.
 </p>

 <form
 onSubmit={(e) => {
 e.preventDefault();
 if (!alertModalTicker.trim() || !alertModalTargetPrice) return;
 if (onAddAlert) {
 onAddAlert(alertModalTicker.trim().toUpperCase(), alertModalCriteria, Number(alertModalTargetPrice));
 }
 setIsQuickAlertOpen(false);
 }}
 className="space-y-4"
 >
 <div>
 <label className="block text-[10px] text-ink-faint font-bold uppercase mb-1">
 ТИКЕР
 </label>
 <input
 type="text"
 placeholder="AAPL..."
 value={alertModalTicker}
 onChange={e => setAlertModalTicker(e.target.value.toUpperCase())}
 className="w-full bg-card rounded-xl border border-border px-3 py-2 text-xs text-ink uppercase font-bold focus:outline-none focus:border-indigo-500 font-sans tabular-nums"
 required
 />
 </div>

 <div>
 <label className="block text-[10px] text-ink-faint font-bold uppercase mb-1">
 СИГНАЛ ПРИ
 </label>
 <select
 value={alertModalCriteria}
 onChange={e => setAlertModalCriteria(e.target.value as any)}
 className="w-full bg-card rounded-xl border border-border px-3 py-2 text-xs font-extrabold text-ink focus:outline-none focus:border-indigo-500"
 >
 <option value="ABOVE">ЦЕНА НАД (▲)</option>
 <option value="BELOW">ЦЕНА ПОД (▼)</option>
 </select>
 </div>

 <div>
 <label className="block text-[10px] text-ink-faint font-bold uppercase mb-1">
 ТАРГЕТ ЦЕНА ($)
 </label>
 <input
 type="number"
 step="0.01"
 placeholder="400.00"
 value={alertModalTargetPrice}
 onChange={e => setAlertModalTargetPrice(e.target.value)}
 className="w-full bg-card rounded-xl border border-border px-3 py-2 text-xs text-ink font-sans tabular-nums font-bold focus:outline-none focus:border-indigo-500"
 required
 />
 </div>

 <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
 <button
 type="button"
 onClick={() => setIsQuickAlertOpen(false)}
 className="px-3.5 py-1.5 rounded-xl border border-border text-xs font-bold uppercase text-ink-muted hover:bg-white/5 transition-all cursor-pointer"
 >
 Отказ
 </button>
 <button
 type="submit"
 className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase shadow-md transition-all cursor-pointer flex items-center gap-1.5"
 >
 <Plus className="w-4 h-4" />
 Добави известие
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 
 </div>
 );
}
