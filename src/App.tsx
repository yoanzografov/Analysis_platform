import { useState, useEffect, useRef } from 'react';
import { Stock, MarketIndex, PriceAlert, NotificationLog, TableFilter } from './types';
import { RAW_SPREADSHEET_CSV, parseCSVData } from './data/initialStocks';
import IndicesStrip from './components/IndicesStrip';
import { getSectorForStock, formatDividend } from './utils/sectorHelper';
import CsvUploader from './components/CsvUploader';
import BentoCharts from './components/BentoCharts';
import PriceAlertPlanner from './components/PriceAlertPlanner';
import MarketSummaryWidgets from './components/MarketSummaryWidgets';
import StockTable from './components/StockTable';
import CompanyNewsContainer from './components/CompanyNewsContainer';
import ThemeToggle from './components/ThemeToggle';
import { 
 Building2, 
 Download, 
 Bell, 
 Play, 
 Square, 
 RefreshCw
} from 'lucide-react';

const safeLocalStorage = {
 getItem: (key: string): string | null => {
 try {
 return localStorage.getItem(key);
 } catch (e) {
 console.warn('localStorage is not accessible:', e);
 return null;
 }
 },
 setItem: (key: string, value: string): void => {
 try {
 localStorage.setItem(key, value);
 } catch (e) {
 console.warn('localStorage is not writable:', e);
 }
 }
};

export default function App() {
 // Primary datasets
 const [stocks, setStocks] = useState<Stock[]>([]);
 const [indices, setIndices] = useState<MarketIndex[]>([]);
 
 // Real-time Simulation & Tick Engine
 const [isSimulating, setIsSimulating] = useState(false);
 
 // Real-time Live Quotes Auto-Update Engine
 const [isFetchingLivePrices, setIsFetchingLivePrices] = useState(false);
 const [isAutoLiveRefresh, setIsAutoLiveRefresh] = useState(true);

 // Price Alert targets
 const [alerts, setAlerts] = useState<PriceAlert[]>([]);
 const [logs, setLogs] = useState<NotificationLog[]>([]);
 const [activeAlertToast, setActiveAlertToast] = useState<string | null>(null);

 // Filter state for the Stock Table, customizable by Bento charts
 const [activeFilter, setActiveFilter] = useState<TableFilter>({ type: 'all', value: 'all' });

 // Selected Stock for deep AI Analyst drawer
 const [selectedStockForAi, setSelectedStockForAi] = useState<Stock | null>(null);

 // Live direct quotes sync from Yahoo Finance backend proxy
 const fetchRealStockPricesDirect = async (stocksList?: Stock[]) => {
 const targetList = stocksList || stocks;
 if (!targetList || targetList.length === 0) return;

 setIsFetchingLivePrices(true);
 try {
 const stockTickers = targetList.map(s => s.ticker).filter(Boolean);
 const defaultIndexTickers = [
 '^GSPC', '^NDX', '^IXIC', '^DJI', '^VIX',
 '^FTSE', '^FCHI', '^GDAXI', '^N100', '^STOXX50E',
 '000001.SS', '^N225', '^HSI', '^AXJO', '^KS11',
 'CL=F', 'BZ=F', 'GC=F', 'SI=F', 'HG=F', 'NG=F', 'PL=F',
 'EURUSD=X', 'JPY=X', 'GBP=X', 'USDAUD=X', 'USDCAD=X', 'USDMXN=X', 'USDHKD=X', 'BTC-USD'
 ];
 const indexTickers = indices.length > 0
 ? (indices.map(idx => idx.ticker).filter(Boolean) as string[])
 : defaultIndexTickers;
 const allSymbols = Array.from(new Set([...stockTickers, ...indexTickers]));

 const response = await fetch(`/api/stock-quotes?symbols=${encodeURIComponent(allSymbols.join(','))}`);
 if (!response.ok) {
 throw new Error('Грешка при комуникация със сървъра за котировки');
 }

 const data = await response.json();
 if (data && data.quotes) {
 setStocks(prevStocks => {
 return prevStocks.map(stock => {
 const quote = data.quotes[stock.ticker.trim().toUpperCase()];
 if (quote) {
 const nextPrice = quote.currentPrice;
 let difference = stock.difference;
 if (stock.fairPrice !== null && nextPrice > 0) {
 difference = parseFloat((((stock.fairPrice - nextPrice) / nextPrice) * 100).toFixed(2));
 }
 let buySell = 'SELL';
 if (stock.fairPrice !== null && nextPrice > 0) {
 const dev = ((nextPrice - stock.fairPrice) / stock.fairPrice) * 100;
 if (dev < -10) {
 buySell = 'BUY';
 } else if (dev > 10) {
 buySell = 'SELL';
 } else {
 buySell = 'ДРУГИ';
 }
 }
 const signal = difference !== null ? (difference > 15 ? 'Buy' : difference < -15 ? 'Sell' : 'Hold') : 'Hold';



 return {
 ...stock,
 currentPrice: nextPrice,
 companyName: quote.companyName || stock.companyName,
 dailyChangePct: quote.dailyChangePct,
 low52: quote.low52 !== undefined ? quote.low52 : stock.low52,
 high52: quote.high52 !== undefined ? quote.high52 : stock.high52,
 peRatio: quote.peRatio !== undefined ? quote.peRatio : stock.peRatio,
 eps: quote.eps !== undefined ? quote.eps : stock.eps,
 marketCap: quote.marketCap !== undefined ? quote.marketCap : stock.marketCap,
 dividend: (quote.dividend !== undefined || quote.dividendYield !== undefined)
 ? (quote.dividend && quote.dividendYield 
 ? `${quote.dividend.toFixed(2)} (${quote.dividendYield.toFixed(2)}%)` 
 : (quote.dividend ? quote.dividend.toString() : (quote.dividendYield ? `(${quote.dividendYield.toFixed(2)}%)` : '-')))
 : stock.dividend,
 difference,
 buySell,
 signal
 };
 }
 return stock;
 });
 });

 // Set indexes to real financial values 
 setIndices(currentIndexs => {
 return currentIndexs.map(idx => {
 const relatedTicker = idx.ticker || '';
 const quote = relatedTicker ? data.quotes[relatedTicker.trim().toUpperCase()] : null;
 if (quote) {
 const currentPrice = quote.currentPrice;
 const dailyChangePct = quote.dailyChangePct;
 let changeVal = idx.changeVal ?? 0;
 if (currentPrice && dailyChangePct !== undefined && dailyChangePct !== null) {
 if (dailyChangePct === 0) {
 changeVal = 0;
 } else {
 const prevPrice = currentPrice / (1 + dailyChangePct / 100);
 changeVal = currentPrice - prevPrice;
 }
 }
 return {
 ...idx,
 value: currentPrice,
 changePct: dailyChangePct,
 changeVal: parseFloat(changeVal.toFixed(2))
 };
 }
 return idx;
 });
 });

 const newLog: NotificationLog = {
 id: `${Date.now()}-${Math.random()}`,
 timestamp: new Date().toLocaleTimeString(),
 ticker: 'YAHOO',
 message: `Пазарната таблица и индексите се опресниха с реални данни в реално време от Yahoo Finance!`,
 type: 'success'
 };
 setLogs(prev => [newLog, ...prev]);
 }
 } catch (err: any) {
 console.error(err);
 const newLog: NotificationLog = {
 id: `${Date.now()}-${Math.random()}`,
 timestamp: new Date().toLocaleTimeString(),
 ticker: 'ERR',
 message: `Интерпретаторът на Yahoo Finance е в почивка. Връзката ще бъде подновена автоматично след малко.`,
 type: 'info'
 };
 setLogs(prev => [newLog, ...prev]);
 } finally {
 setIsFetchingLivePrices(false);
 }
 };

 // Load default CSV data or localStorage on rise and trigger instantaneous live update
 useEffect(() => {
 const savedStocks = safeLocalStorage.getItem('bulgarian_stock_tracker_stocks');
 const savedIndices = safeLocalStorage.getItem('bulgarian_stock_tracker_indices');
 const savedAlerts = safeLocalStorage.getItem('bulgarian_stock_tracker_alerts');

 let initialStocks: Stock[] = [];
 let initialIndices: MarketIndex[] = [];
 let initialAlerts: PriceAlert[] = [];

 if (savedStocks) {
 try {
 initialStocks = JSON.parse(savedStocks);
 } catch (e) {
 console.error("Грешка при четене на stocks от localStorage", e);
 }
 }
 if (initialStocks.length === 0) {
 const { stocks: parsedStocks } = parseCSVData(RAW_SPREADSHEET_CSV);
 initialStocks = parsedStocks;
 }

 if (savedIndices) {
 try {
 initialIndices = JSON.parse(savedIndices);
 } catch (e) {
 console.error("Грешка при четене на indices от localStorage", e);
 }
 }
 if (initialIndices.length === 0) {
 const { indices: parsedIndices } = parseCSVData(RAW_SPREADSHEET_CSV);
 initialIndices = parsedIndices;
 }

 if (savedAlerts) {
 try {
 initialAlerts = JSON.parse(savedAlerts);
 } catch (e) {
 console.error("Грешка при четене на alerts от localStorage", e);
 }
 }
 if (initialAlerts.length === 0) {
 initialAlerts = [
 { id: '1', ticker: 'AAPL', criteria: 'ABOVE', targetPrice: 300, isActive: true, createdAt: new Date().toISOString() },
 { id: '2', ticker: 'TSLA', criteria: 'BELOW', targetPrice: 380, isActive: true, createdAt: new Date().toISOString() },
 { id: '3', ticker: 'NVDA', criteria: 'ABOVE', targetPrice: 215, isActive: true, createdAt: new Date().toISOString() },
 ];
 }

 setStocks(initialStocks);
 setIndices(initialIndices);
 setAlerts(initialAlerts);

 setLogs([
 { id: '1', timestamp: new Date().toLocaleTimeString(), ticker: 'SYS', message: 'Системата за следене на акции е стартирана успешно.', type: 'info' },
 ]);

 // Fast initial update with real financial values straight on app mount
 setTimeout(() => {
 fetchRealStockPricesDirect(initialStocks);
 }, 300);
 }, []);

 // Persistence save hooks
 useEffect(() => {
 if (stocks.length > 0) {
 safeLocalStorage.setItem('bulgarian_stock_tracker_stocks', JSON.stringify(stocks));
 }
 }, [stocks]);

 useEffect(() => {
 if (indices.length > 0) {
 safeLocalStorage.setItem('bulgarian_stock_tracker_indices', JSON.stringify(indices));
 }
 }, [indices]);

 useEffect(() => {
 safeLocalStorage.setItem('bulgarian_stock_tracker_alerts', JSON.stringify(alerts));
 }, [alerts]);

 // Smooth scroll to AI Analysis container when a stock is selected
 useEffect(() => {
 if (selectedStockForAi) {
 setTimeout(() => {
 const container = document.getElementById('ai-analysis-container');
 if (container) {
 container.scrollIntoView({ behavior: 'smooth', block: 'center' });
 }
 }, 100);
 }
 }, [selectedStockForAi]);

 // Stable stringified representation of stocks list to safely prevent redundant renders and infinite loops
 const tickersString = stocks.map(s => s.ticker).join(',');

 // Automatic live update interval background runner (runs loop every 45s)
 useEffect(() => {
 if (!isAutoLiveRefresh) return;

 const interval = setInterval(() => {
 fetchRealStockPricesDirect();
 }, 45000);

 return () => clearInterval(interval);
 }, [isAutoLiveRefresh, tickersString]);

 // CSV sync data updater callback
 const handleSheetSynced = (csvText: string) => {
 const { stocks: parsedStocks, indices: parsedIndices } = parseCSVData(csvText);
 if (parsedStocks.length > 0) {
 setStocks(parsedStocks);
 if (parsedIndices.length > 0) {
 setIndices(parsedIndices);
 }
 
 const newLog: NotificationLog = {
 id: `${Date.now()}-${Math.random()}`,
 timestamp: new Date().toLocaleTimeString(),
 ticker: 'SYNC',
 message: 'Google Sheet таблицата бе синхронизирана успешно в реално време.',
 type: 'success'
 };
 setLogs(prev => [newLog, ...prev]);

 // Immediately fetch real pricing of these newly imported items as well
 setTimeout(() => {
 fetchRealStockPricesDirect(parsedStocks);
 }, 200);

 // Simple visual notification
 setActiveAlertToast(`Успешно синхронизирахте ${parsedStocks.length} акции!`);
 setTimeout(() => setActiveAlertToast(null), 4000);
 }
 };

 // Live updater for a single stock from the table or simulation
 const handleUpdateStock = (updatedStock: Stock) => {
 setStocks(prev => prev.map(s => s.ticker === updatedStock.ticker ? updatedStock : s));
 };

 const handleDeleteStock = (ticker: string) => {
 const confirmDelete = window.confirm(`Сигурни ли сте, че искате да изтриете акцията ${ticker}?`);
 if (!confirmDelete) return;

 setStocks(prev => prev.filter(s => s.ticker !== ticker));

 const newLog = {
 id: `${Date.now()}-${Math.random()}`,
 timestamp: new Date().toLocaleTimeString(),
 ticker,
 message: `Изтрит актив: ${ticker}`,
 type: 'info' as const
 };
 setLogs(prev => [newLog, ...prev]);
 };

 // Force trigger live real-time price synchronization
 const triggerManualRefresh = () => {
 fetchRealStockPricesDirect();
 };

 // Live simulation tick engine loop
 useEffect(() => {
 if (!isSimulating) return;

 const interval = setInterval(() => {
 setStocks(currentStocks => {
 return currentStocks.map(stock => {
 // Slow tick: only update 4% of stocks per interval to keep dashboard realistic
 if (Math.random() > 0.94) {
 const pctChange = (Math.random() * 1.6 - 0.8) / 100; // -0.8% to +0.8%
 const originalPrice = stock.currentPrice;
 const nextPrice = parseFloat((originalPrice * (1 + pctChange)).toFixed(2));

 let difference = stock.difference;
 if (stock.fairPrice !== null && nextPrice > 0) {
 difference = parseFloat((((stock.fairPrice - nextPrice) / nextPrice) * 100).toFixed(2));
 }

 let buySell = 'SELL';
 if (stock.fairPrice !== null && nextPrice > 0) {
 const dev = ((nextPrice - stock.fairPrice) / stock.fairPrice) * 100;
 if (dev < -10) {
 buySell = 'BUY';
 } else if (dev > 10) {
 buySell = 'SELL';
 } else {
 buySell = 'ДРУГИ';
 }
 }
 const signal = difference !== null ? (difference > 15 ? 'Buy' : difference < -15 ? 'Sell' : 'Hold') : 'Hold';



 return {
 ...stock,
 currentPrice: nextPrice,
 difference,
 buySell,
 signal,
 dailyChangePct: parseFloat((stock.dailyChangePct + pctChange * 100).toFixed(2))
 };
 }
 return stock;
 });
 });

 // Indices ticks
 setIndices(currentIndexs => {
 return currentIndexs.map(idx => {
 if (Math.random() > 0.5) {
 const change = (Math.random() * 0.1 - 0.05);
 return {
 ...idx,
 value: parseFloat((idx.value * (1 + change / 100)).toFixed(2)),
 changePct: parseFloat((idx.changePct + change).toFixed(2)),
 };
 }
 return idx;
 });
 });

 }, 3000);

 return () => clearInterval(interval);
 }, [isSimulating, alerts]);

 // Alert threshold logic evaluator
 const prevPricesRef = useRef<Record<string, number>>({});

 useEffect(() => {
 // Initialize previous prices on first load if empty
 if (Object.keys(prevPricesRef.current).length === 0) {
 stocks.forEach(s => {
 prevPricesRef.current[s.ticker] = s.currentPrice;
 });
 return;
 }

 stocks.forEach(stock => {
 const oldPrice = prevPricesRef.current[stock.ticker];
 const newPrice = stock.currentPrice;

 if (oldPrice !== undefined && oldPrice !== newPrice) {
 const activeAlerts = alerts.filter(a => a.ticker === stock.ticker && a.isActive);
 activeAlerts.forEach(alert => {
 let triggered = false;
 if (alert.criteria === 'ABOVE' && oldPrice < alert.targetPrice && newPrice >= alert.targetPrice) {
 triggered = true;
 } else if (alert.criteria === 'BELOW' && oldPrice > alert.targetPrice && newPrice <= alert.targetPrice) {
 triggered = true;
 }

 if (triggered) {
 const message = `Предупреждение за цена! Акцията ${stock.ticker} премина границата от $${alert.targetPrice} (Текуща: $${newPrice})`;

 const newLog: NotificationLog = {
 id: `${Date.now()}-${Math.random()}`,
 timestamp: new Date().toLocaleTimeString(),
 ticker: stock.ticker,
 message,
 type: 'alert'
 };

 setLogs(prev => [newLog, ...prev]);
 setActiveAlertToast(message);
 
 // Native browser alert popup that halts browser thread and pops up on the screen
 window.alert(message);

 setTimeout(() => {
 setActiveAlertToast(null);
 }, 5000);

 // Deactivate alert rule to avoid multiple alerts
 setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isActive: false } : a));
 }
 });
 }
 prevPricesRef.current[stock.ticker] = newPrice;
 });
 }, [stocks, alerts]);

 // Add and Delete alert controllers
 const handleAddAlert = (ticker: string, criteria: 'ABOVE' | 'BELOW', targetPrice: number) => {
 const newAlert: PriceAlert = {
 id: `${Date.now()}-${Math.random()}`,
 ticker,
 criteria,
 targetPrice,
 isActive: true,
 createdAt: new Date().toISOString()
 };
 setAlerts(prev => [newAlert, ...prev]);

 const newLog: NotificationLog = {
 id: `${Date.now()}-${Math.random()}`,
 timestamp: new Date().toLocaleTimeString(),
 ticker,
 message: `Създаден нов сигнал за задействане при цена ${criteria === 'ABOVE' ? 'над' : 'под'} $${targetPrice}.`,
 type: 'info'
 };
 setLogs(prev => [newLog, ...prev]);
 };

 const handleDeleteAlert = (id: string) => {
 setAlerts(prev => prev.filter(a => a.id !== id));
 };

 // Export updated stocks table database back as a clean structured CSV spreadsheet
 const exportCSVFile = () => {
 let csvContent = "Watch,Ticker,Company Name,365 Chart,Date,Price of Calc.,Daily Change %,Current Price,Fair Price,Difference,BUY/SELL,Market Cap,P/E Ratio,EPS,Sector,Dividend,Signal,52 Low,52 High,AI Analis\n";
 
 stocks.forEach(s => {
 const changeStr = `${s.dailyChangePct >= 0 ? '▲ +' : '▼ '}${Math.abs(s.dailyChangePct).toFixed(2)}%`;
 const differenceStr = s.difference !== null ? `${s.difference.toFixed(2)}%` : '';
 const marketCapStr = s.marketCap || '';
 const peStr = s.peRatio || '';
 const epsStr = s.eps !== null ? `${s.eps.toFixed(2)}$` : '';
 const priceOfCalc = s.priceOfCalc !== null ? `${s.priceOfCalc.toFixed(2)}$` : '';
 const currentPrice = `${s.currentPrice.toFixed(2)}$`;
 const fairPrice = s.fairPrice !== null ? `${s.fairPrice.toFixed(2)}$` : '';
 
 const sector = getSectorForStock(s.ticker, s.profileLink, s.companyName);
 const formattedDiv = formatDividend(s.dividend, s.currentPrice);

 const line = `"${s.watch}","${s.ticker}","${s.companyName}","","${s.date}","${priceOfCalc}","${changeStr}","${currentPrice}","${fairPrice}","${differenceStr}","${s.buySell}","${marketCapStr}","${peStr}","${epsStr}","${sector}","${formattedDiv}","${s.signal}","${s.low52 || ''}$","${s.high52 || ''}$",""\n`;
 csvContent += line;
 });

 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement("a");
 link.setAttribute("href", url);
 link.setAttribute("download", `Platform_2026_Stocks_Export.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

 return (
 <div className="min-h-screen bg-bg text-ink flex flex-col pb-12 antialiased">
 {/* Dynamic indices banner strip */}
 <IndicesStrip indices={indices} isSimulating={isSimulating} />

 {/* Main Container */}
 <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 flex-1 space-y-5">
 
 {/* Floating live alerts toast banner */}
 {activeAlertToast && (
 <div className="fixed top-14 right-4 z-40 bg-amber-500/10 border border-amber-500/50 text-amber-400 rounded-none shadow-md p-3 max-w-sm flex items-start gap-2.5 font-mono text-xs">
 <Bell className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
 <div>
 <span className="font-extrabold underline block mb-0.5 uppercase tracking-wide">СИГНАЛ ЗА ЦЕНА</span>
 {activeAlertToast}
 </div>
 </div>
 )}

 {/* Dashboard Header Bar */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
 <div>
 <div className="flex items-center gap-2">
  <Building2 className="w-5 h-5 text-ink" />
  <h1 className="text-2xl font-bold font-extrabold text-ink font-mono tracking-tight uppercase">
    ПЛАТФОРМА 2026: СЛЕДЕНЕ НА АКЦИИ
  </h1>
  <div className="ml-4">
    <ThemeToggle />
  </div>
</div>
 </div>

 <div className="flex flex-wrap items-center gap-1.5">
 {/* Auto live updates toggler */}
 <button
 onClick={() => setIsAutoLiveRefresh(!isAutoLiveRefresh)}
 className={`text-xs font-mono font-extrabold px-3 py-1.5 rounded-none flex items-center gap-1.5 uppercase transition-all border cursor-pointer ${
 isAutoLiveRefresh 
 ? 'bg-[#10b981] text-ink border-[#10b981]/50 hover:bg-[#059669] font-extrabold' 
 : 'bg-bg rounded-2xl text-ink-faint border-gray-350 hover:bg-gray-50 hover:text-ink-muted'
 }`}
 title="Автоматично фоново синхронизиране на живите пазарни котировки на всеки 45 секунди"
 >
 <span className={`w-1.5 h-1.5 rounded-full ${isAutoLiveRefresh ? 'bg-green-400 animate-ping' : 'bg-gray-400'}`} />
 Живи Данни (Yahoo): {isAutoLiveRefresh ? 'ВКЛ' : 'ИЗКЛ'}
 </button>

 {/* Simulation Engine Activator */}
 <button
 onClick={() => {
 setIsSimulating(!isSimulating);
 if (!isSimulating) {
 setIsAutoLiveRefresh(false); // turn off live refresh if user manually wants simulation ticks
 }
 }}
 className={`text-xs font-mono font-extrabold px-3 py-1.5 rounded-none flex items-center gap-1.5 uppercase transition-all border cursor-pointer ${
 isSimulating 
 ? 'bg-red-700 text-ink border-red-850 hover:bg-red-800 font-extrabold' 
 : 'bg-bg rounded-2xl text-ink border-border hover:bg-white/10 hover:text-ink'
 }`}
 title="Ръчно генериране на случайни пазарни колебания за тестване на филтри и лимити"
 >
 {isSimulating ? (
 <>
 <Square className="w-3 h-3 fill-current" />
 СПРИ СИМУЛАТОР
 </>
 ) : (
 <>
 <Play className="w-3 h-3 fill-current" />
 СТАРТИРАЙ СИМУЛАТОР
 </>
 )}
 </button>

 {/* Quick real live market quotes sync */}
 <button
 onClick={triggerManualRefresh}
 disabled={isFetchingLivePrices}
 className={`text-xs font-mono font-extrabold px-3 py-1.5 rounded-none border flex items-center gap-1.5 uppercase transition-all cursor-pointer ${
 isFetchingLivePrices
 ? 'bg-stone-100 text-stone-500 border-stone-300 cursor-not-allowed'
 : 'bg-bg text-ink border-black hover:bg-white/20'
 }`}
 title="Ръчно незабавно изтегляне на актуални котировки от Yahoo Finance за всички активи"
 >
 <RefreshCw className={`w-3 h-3 ${isFetchingLivePrices ? 'animate-spin text-[#10b981]' : ''}`} />
 {isFetchingLivePrices ? 'Синхронизиране...' : 'Опресни пазар'}
 </button>

 {/* Export data back as sheet formatted CSV */}
 <button
 onClick={exportCSVFile}
 className="text-xs font-mono font-extrabold bg-bg rounded-2xl text-ink hover:bg-white/10 hover:text-ink border border-border px-3 py-1.5 rounded-none flex items-center gap-1.5 uppercase transition-all cursor-pointer"
 >
 <Download className="w-3 h-3" />
 Експорт CSV
 </button>
 </div>
 </div>

 {/* Top Market Widgets: Top Gainer, Top Loser, Fear & Greed Index */}
 <MarketSummaryWidgets 
 stocks={stocks}
 activeFilter={activeFilter}
 onSetActiveFilter={setActiveFilter}
 />

 {/* Bento Board: Analytics charts, Distribution */}
 <BentoCharts 
 stocks={stocks} 
 activeFilter={activeFilter}
 onSetActiveFilter={setActiveFilter}
 />

 {/* Main Grid stock table database */}
 <div className="space-y-2" id="stock-table-section">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xs uppercase font-extrabold text-ink font-mono tracking-tight">
 Интерактивна таблица за оценка
 </h2>
 <p className="text-sm text-ink-muted mt-0.5">
 Можете да щракнете върху всяка стойност в колона <span className="font-bold underline">"Текуща"</span> или <span className="font-bold text-[#10b981] underline">"Справедлива (Fair)"</span> за директно редактиране на показателите.
 </p>
 </div>
 <div className="text-right text-[9px] text-ink-faint font-mono hidden sm:block">
 Двоен клик или клик на химикал за бърза пазарна симулация
 </div>
 </div>
 
 <StockTable 
 stocks={stocks} 
 onUpdateStock={handleUpdateStock} 
 onDeleteStock={handleDeleteStock}
 onSelectStockForAi={setSelectedStockForAi} 
 activeFilter={activeFilter}
 onSetActiveFilter={setActiveFilter}
 onAddStock={(newStock) => {
 setStocks(prev => [...prev, newStock]);
 const newLog = {
 id: `${Date.now()}-${Math.random()}`,
 timestamp: new Date().toLocaleTimeString(),
 ticker: newStock.ticker,
 message: `Добавен нов актив: ${newStock.companyName || newStock.ticker} (${newStock.ticker})`,
 type: 'success' as const
 };
 setLogs(prev => [newLog, ...prev]);
 }}
 />
 </div>

 {/* Planning custom price alerts container (moved below table) */}
 <PriceAlertPlanner
 stocks={stocks}
 alerts={alerts}
 onAddAlert={handleAddAlert}
 onDeleteAlert={handleDeleteAlert}
 />

 {/* Verified Business & Stock News Feed */}
 <CompanyNewsContainer
 stocks={stocks}
 selectedStock={selectedStockForAi}
 onSelectStock={setSelectedStockForAi}
 />

 {/* Sync with files grid: CSV Uploader and Real-time Notification Logs monitor side by side (moved below the table) */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="lg:col-span-2">
 <CsvUploader onDataLoaded={handleSheetSynced} />
 </div>

 {/* Real-time alert feed logs */}
 <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col justify-between rounded-none shadow-xs">
 <div>
 <h3 className="text-xs uppercase font-extrabold text-ink font-mono flex items-center gap-1.5">
 <Bell className="w-3.5 h-3.5 text-amber-800" />
 Лог на известията & задействания
 </h3>
 <p className="text-xs text-ink-faint font-mono mt-0.5">
 Хроника на пазарните промени и филтри на заложени аларми.
 </p>
 </div>

 <div className="h-28 overflow-y-auto mt-3.5 space-y-1.5 pr-1 text-xs font-mono">
 {logs.map(log => (
 <div 
 key={log.id} 
 className={`p-1.5 rounded-none border text-xs leading-relaxed flex items-start gap-1.5 ${
 log.type === 'alert' 
 ? 'bg-amber-50 border-amber-600 text-amber-950 font-extrabold' 
 : log.type === 'success'
 ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-extrabold'
 : 'bg-bg/30 border-border/20 text-ink-muted'
 }`}
 >
 <span className="text-ink-faint block shrink-0">[{log.timestamp}]</span>
 <p>
 <span className="font-bold text-ink mr-1 uppercase">[{log.ticker}]</span>
 {log.message}
 </p>
 </div>
 ))}
 </div>
 </div>
 </div>

 </main>


 </div>
 );
}
