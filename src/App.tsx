import { useState, useEffect, useRef } from 'react';
import { Stock, MarketIndex, PriceAlert, NotificationLog, TableFilter, PortfolioPosition, PortfolioTransaction, PortfolioDividendRecord } from './types';
import { RAW_SPREADSHEET_CSV, parseCSVData } from './data/initialStocks';
import IndicesStrip from './components/IndicesStrip';
import { getSectorForStock, formatDividend } from './utils/sectorHelper';
import CsvUploader from './components/CsvUploader';
import BentoCharts from './components/BentoCharts';
import PriceAlertPlanner from './components/PriceAlertPlanner';
import PortfolioTracker from './components/PortfolioTracker';
import MarketSummaryWidgets from './components/MarketSummaryWidgets';
import StockTable from './components/StockTable';
import CompanyNewsContainer from './components/CompanyNewsContainer';
import ThemeToggle from './components/ThemeToggle';
import { db, auth } from './lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { AuthModal } from './components/AuthModal';
import { EconomicCalendar } from 'react-ts-tradingview-widgets';
import RoiCalculatorModal from './components/RoiCalculatorModal';
import InvestmentCalculatorModal from './components/InvestmentCalculatorModal';
import { 
  Table,
  Save,
  Building2, 
  Download, 
  Bell, 
  Briefcase,
  Play, 
  Calendar,
  Square, 
  RefreshCw,
  Settings2,
  ChevronDown,
  ArchiveRestore,
  Trash2,
  Layers,
  Info,
  FileSpreadsheet,
  X,
  ExternalLink,
  Cloud,
  Lock,
  LogOut,
  User as UserIcon,
  HelpCircle,
  Calculator,
  TrendingUp,
  TrendingDown,
  Database
} from 'lucide-react';

export default function App() {
 // Primary datasets
 const [stocks, setStocks] = useState<Stock[]>([]);
   const [searchQuery, setSearchQuery] = useState('');
   const [isSearching, setIsSearching] = useState(false);

 const [indices, setIndices] = useState<MarketIndex[]>([]);
 const [isLoaded, setIsLoaded] = useState(false);
 const [showNewUserModal, setShowNewUserModal] = useState(false);
 const [confirmRestore, setConfirmRestore] = useState(false);
 
 // Real-time Simulation & Tick Engine
 const [isSimulating, setIsSimulating] = useState(false);
 
 // Real-time Live Quotes Auto-Update Engine
 const [isFetchingLivePrices, setIsFetchingLivePrices] = useState(false);
 const [isAutoLiveRefresh, setIsAutoLiveRefresh] = useState(true);
 const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
 const [isUsefulLinksMenuOpen, setIsUsefulLinksMenuOpen] = useState(false);
 const [showEconomicCalendarModal, setShowEconomicCalendarModal] = useState(false);
 const [isCsvUploaderOpen, setIsCsvUploaderOpen] = useState(false);
 const [showRoiCalculatorModal, setShowRoiCalculatorModal] = useState(false);
 const [showInvestmentCalculatorModal, setShowInvestmentCalculatorModal] = useState(false);

  // User Auth & Cloud Sync State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setPositions([]);
        setTransactions([]);
        setDividends([]);
        setCashBalance(0);
        try {
          localStorage.removeItem('user_portfolio_positions');
          localStorage.removeItem('user_portfolio_transactions');
          localStorage.removeItem('user_portfolio_dividends');
          localStorage.removeItem('user_portfolio_cash');
        } catch (e) {}
      }
    });
    return () => unsub();
  }, []);

  // Price Alert targets & Portfolio Positions persisted to localStorage
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('user_portfolio_alerts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading alerts from localStorage', e);
    }
    return [];
  });

  const [positions, setPositions] = useState<PortfolioPosition[]>(() => {
    try {
      const saved = localStorage.getItem('user_portfolio_positions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading positions from localStorage', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('user_portfolio_positions', JSON.stringify(positions));
    } catch (e) {
      console.error('Error saving positions to localStorage', e);
    }
  }, [positions]);

  // Real-time Firestore Synced Portfolio State (across phone, laptop, desktop)
  const [transactions, setTransactions] = useState<PortfolioTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('user_portfolio_transactions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading transactions from localStorage', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('user_portfolio_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions to localStorage', e);
    }
  }, [transactions]);

  const [dividends, setDividends] = useState<PortfolioDividendRecord[]>(() => {
    try {
      const saved = localStorage.getItem('user_portfolio_dividends');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading dividends from localStorage', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('user_portfolio_dividends', JSON.stringify(dividends));
    } catch (e) {
      console.error('Error saving dividends to localStorage', e);
    }
  }, [dividends]);

  const [cashBalance, setCashBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('user_portfolio_cash');
      if (saved !== null) return parseFloat(saved) || 0;
    } catch (e) {}
    return 0;
  });

  useEffect(() => {
    try {
      localStorage.setItem('user_portfolio_cash', cashBalance.toString());
    } catch (e) {}
  }, [cashBalance]);

  const [baseCurrency, setBaseCurrency] = useState<'USD' | 'EUR'>(() => {
    try {
      const saved = localStorage.getItem('user_portfolio_base_currency');
      if (saved === 'EUR' || saved === 'USD') return saved;
    } catch (e) {}
    return 'USD';
  });

  useEffect(() => {
    try {
      localStorage.setItem('user_portfolio_base_currency', baseCurrency);
    } catch (e) {}
  }, [baseCurrency]);

  const [portfolioPrices, setPortfolioPrices] = useState<Record<string, { currentPrice: number; dailyChangePct: number; companyName?: string; currency?: string }>>(() => {
    try {
      const saved = localStorage.getItem('user_portfolio_prices');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('user_portfolio_prices', JSON.stringify(portfolioPrices));
    } catch (e) {}
  }, [portfolioPrices]);

  useEffect(() => {
    try {
      localStorage.setItem('user_portfolio_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.error('Error saving alerts to localStorage', e);
    }
  }, [alerts]);
 const [logs, setLogs] = useState<NotificationLog[]>([]);
 const [activeAlertToast, setActiveAlertToast] = useState<string | null>(null);

  const getInitialTab = (): 'table' | 'alerts' | 'portfolio' => {
    const hash = window.location.hash.toLowerCase().replace('#', '');
    if (hash === 'alerts' || hash === 'portfolio') return hash;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab')?.toLowerCase();
    if (tabParam === 'alerts' || tabParam === 'portfolio') return tabParam;
    return 'table';
  };

  // Filter state for the Stock Table, customizable by Bento charts
  const [activeFilter, setActiveFilter] = useState<TableFilter>({ type: 'all', value: 'all' });
  const [activeMainTab, setActiveMainTab] = useState<'table' | 'alerts' | 'portfolio'>(getInitialTab);

  const switchTab = (tab: 'table' | 'alerts' | 'portfolio') => {
    setActiveMainTab(tab);
    if (window.history.pushState) {
      window.history.pushState(null, '', `#${tab}`);
    } else {
      window.location.hash = `#${tab}`;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const tab = getInitialTab();
      setActiveMainTab(tab);
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

 // Selected Stock for deep AI Analyst drawer and News Container
 const [selectedStockForAi, setSelectedStockForAi] = useState<Stock | null>(null);

 // Sync activeFilter with selectedStockForAi so the news container updates
 useEffect(() => {
   if (activeFilter.type === 'ticker' && activeFilter.value) {
     const stock = stocks.find(s => s.ticker === activeFilter.value);
     if (stock) {
       setSelectedStockForAi(stock);
     }
   }
 }, [activeFilter, stocks]);

 // Prevent infinite save loops with Firebase
 const lastSavedRef = useRef('');

  const [buyThreshold, setBuyThreshold] = useState<number>(10);
  const [sellThreshold, setSellThreshold] = useState<number>(10);
  const [signalThreshold, setSignalThreshold] = useState<number>(5);
  
  const buyThresholdRef = useRef(10);
  const sellThresholdRef = useRef(10);
  const signalThresholdRef = useRef(5);
  useEffect(() => { 
    buyThresholdRef.current = buyThreshold;
    sellThresholdRef.current = sellThreshold; 
    signalThresholdRef.current = signalThreshold;
  }, [buyThreshold, sellThreshold, signalThreshold]);

  const handleUpdateSignalThreshold = (newVal: number) => {
    setSignalThreshold(newVal);
    setStocks(prev => prev.map(stock => {
      let newSignal = 'Hold';
      if (stock.currentPrice > 0 && typeof stock.low52 === 'number' && typeof stock.high52 === 'number') {
        const buyLimit = stock.low52 * (1 + newVal / 100);
        const sellLimit = stock.high52 * (1 - newVal / 100);
        if (stock.currentPrice <= buyLimit) newSignal = 'Buy';
        else if (stock.currentPrice >= sellLimit) newSignal = 'Sell';
      } else {
        newSignal = '-';
      }
      return { ...stock, signal: newSignal };
    }));
  };

  const handleUpdateThresholds = (newBuy: number, newSell: number) => {
    setBuyThreshold(newBuy);
    setSellThreshold(newSell);
    setStocks(prev => prev.map(s => {
      let bs = 'OVERVALUED';
      if (s.fairPrice !== null && s.currentPrice > 0) {
        const dev = ((s.currentPrice - s.fairPrice) / s.fairPrice) * 100;
        if (dev < -newBuy) bs = 'UNDERVALUED';
        else if (dev > newSell) bs = 'OVERVALUED';
        else bs = 'ДРУГИ';
      }
      return { ...s, buySell: bs };
    }));
  };

  // Yahoo Finance Ticker Mapping for European & Global ETFs/Stocks
  const TICKER_YAHOO_MAP: Record<string, string> = {
    'BRK.B': 'BRK-B',
    'BRK/B': 'BRK-B',
    'BRK B': 'BRK-B',
    'BRK.A': 'BRK-A',
    'BRK/A': 'BRK-A',
    'BRK A': 'BRK-A',
    'BF.B': 'BF-B',
    'BF.A': 'BF-A',
    'XNAS': 'XNAS.DE',
    'XNAS.DE': 'XNAS.DE',
    'VHYL': 'VHYL.AS',
    'VHYL.DE': 'VHYL.AS',
    'VGWD': 'VGWD.DE',
    'VGWD.DE': 'VGWD.DE',
    'JGPI': 'JGPI.DE',
    'JGPI.DE': 'JGPI.DE',
    'SXR8': 'SXR8.DE',
    'SXR8.DE': 'SXR8.DE',
    'EUNL': 'EUNL.DE',
    'VWCE': 'VWCE.DE',
    'QDVE': 'QDVE.DE',
    'IS3N': 'IS3N.DE',
    'CSPX': 'CSPX.L',
    'VUSA': 'VUSA.DE',
    'MEUD': 'MEUD.PA',
    '4GLD': '4GLD.DE'
  };

  // Live direct quotes sync from Yahoo Finance backend proxy
  const fetchRealStockPricesDirect = async (stocksList?: Stock[], positionsList?: PortfolioPosition[]) => {
    const targetList = stocksList || stocks;
    const targetPositions = positionsList || positions;
    const stockTickers = targetList ? targetList.map(s => s.ticker).filter(Boolean) : [];
    const portfolioTickers = targetPositions ? targetPositions.map(p => p.ticker).filter(Boolean) : [];
    const combinedTickers = Array.from(new Set([...stockTickers, ...portfolioTickers]));
    if (combinedTickers.length === 0 && (!indices || indices.length === 0)) return;

    setIsFetchingLivePrices(true);
    try {
      const mappedStockTickers = combinedTickers.map(t => TICKER_YAHOO_MAP[t.trim().toUpperCase()] || t);
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
      const allSymbols = Array.from(new Set([...combinedTickers, ...mappedStockTickers, ...indexTickers]));

      const response = await fetch(`/api/stock-quotes?symbols=${encodeURIComponent(allSymbols.join(','))}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Грешка при комуникация със сървъра за котировки');
      }

      const data = await response.json();
      if (data && data.quotes) {
        // Also update portfolioPrices for all fetched quotes
        const newPrices: Record<string, { currentPrice: number; dailyChangePct: number; companyName?: string }> = {};
        for (const [sym, quote] of Object.entries(data.quotes) as [string, any][]) {
          newPrices[sym.trim().toUpperCase()] = {
            currentPrice: quote.currentPrice,
            dailyChangePct: quote.dailyChangePct || 0,
            companyName: quote.companyName
          };
        }
        setPortfolioPrices(prev => ({ ...prev, ...newPrices }));

        setStocks(prevStocks => {
          return prevStocks.map(stock => {
            const sym = stock.ticker.trim().toUpperCase();
            const mappedSym = TICKER_YAHOO_MAP[sym] || sym;
            const baseSym = sym.split('.')[0].split(':')[1] || sym.split('.')[0];
            const quote = data.quotes[sym] || data.quotes[mappedSym] || (data.quotes[baseSym] && !data.quotes[baseSym]?.companyName?.includes('ETP') ? data.quotes[baseSym] : undefined);
            if (quote) {
              const nextPrice = quote.currentPrice;
              let difference = stock.difference;
              if (stock.fairPrice !== null && nextPrice > 0) {
                difference = parseFloat((((stock.fairPrice - nextPrice) / nextPrice) * 100).toFixed(2));
              }
              let buySell = 'OVERVALUED';
              if (stock.fairPrice !== null && nextPrice > 0) {
                const dev = ((nextPrice - stock.fairPrice) / stock.fairPrice) * 100;
                if (dev < -buyThresholdRef.current) {
                  buySell = 'UNDERVALUED';
                } else if (dev > sellThresholdRef.current) {
                  buySell = 'OVERVALUED';
                } else {
                  buySell = 'ДРУГИ';
                }
              }
              
              let signal = stock.signal || 'Hold';
              const l52 = quote ? (quote.low52 !== undefined ? quote.low52 : stock.low52) : stock.low52;
              const h52 = quote ? (quote.high52 !== undefined ? quote.high52 : stock.high52) : stock.high52;
              
              if (nextPrice > 0 && typeof l52 === 'number' && typeof h52 === 'number') {
                const buyLimit = l52 * (1 + signalThresholdRef.current / 100);
                const sellLimit = h52 * (1 - signalThresholdRef.current / 100);
                if (nextPrice <= buyLimit) signal = 'Buy';
                else if (nextPrice >= sellLimit) signal = 'Sell';
                else signal = 'Hold';
              } else {
                signal = '-';
              }

              const isEtpName = quote.companyName && (quote.companyName.includes('ETP') || quote.companyName.includes('Tracker') || quote.companyName.includes('Leverage Shares'));
              const finalCompanyName = (isEtpName && stock.companyName && !stock.companyName.includes('ETP'))
                ? stock.companyName
                : (quote.companyName || stock.companyName);

              return {
                ...stock,
                currentPrice: nextPrice,
                companyName: finalCompanyName,
                dailyChangePct: quote.dailyChangePct,
                low52: quote.low52 !== undefined ? quote.low52 : stock.low52,
                high52: quote.high52 !== undefined ? quote.high52 : stock.high52,
                peRatio: quote.peRatio !== undefined ? quote.peRatio : stock.peRatio,
                eps: quote.eps !== undefined ? quote.eps : stock.eps,
                marketCap: quote.marketCap !== undefined ? quote.marketCap : stock.marketCap,
                dividend: quote.dividend !== undefined 
                  ? quote.dividend.toString() 
                  : stock.dividend,
                difference,
                buySell,
                signal,
                earningsTimestamp: quote.earningsTimestamp !== undefined ? quote.earningsTimestamp : stock.earningsTimestamp
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
     
     let currentPrice = idx.value;
     let dailyChangePct = idx.changePct ?? 0;
     let changeVal = idx.changeVal ?? 0;

     if (quote) {
       if (typeof quote.currentPrice === 'number' && quote.currentPrice > 0) {
         currentPrice = quote.currentPrice;
       }
       if (typeof quote.dailyChangePct === 'number' && !isNaN(quote.dailyChangePct) && quote.dailyChangePct !== 0) {
         dailyChangePct = quote.dailyChangePct;
       }
       if (typeof quote.changeVal === 'number' && !isNaN(quote.changeVal) && quote.changeVal !== 0) {
         changeVal = quote.changeVal;
       }
     }

     if (changeVal === 0 && currentPrice > 0 && dailyChangePct !== 0) {
       const prevPrice = currentPrice / (1 + dailyChangePct / 100);
       changeVal = currentPrice - prevPrice;
     }

     return {
       ...idx,
       value: currentPrice,
       changePct: parseFloat((dailyChangePct || 0).toFixed(2)),
       changeVal: parseFloat((changeVal || 0).toFixed(2))
     };
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
      // Track whether the logged in user's document has completed its initial load from Firestore
    } finally {
      setIsFetchingLivePrices(false);
    }
  };

  const [isUserDocLoaded, setIsUserDocLoaded] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsUserDocLoaded(false);
      if (!user) {
        setPositions([]);
        setTransactions([]);
        setDividends([]);
        setCashBalance(0);
      }
    });
    return () => unsub();
  }, []);

  // Load and listen to Firebase Firestore (User-Scoped Privacy & Cloud Sync)
  useEffect(() => {
    // If not logged in, operate in Guest / Public mode with empty user portfolio
    if (!currentUser) {
      setIsUserDocLoaded(false);
      if (!isLoaded) {
        const { stocks: parsedStocks, indices: parsedIndices } = parseCSVData(RAW_SPREADSHEET_CSV);
        setStocks(parsedStocks);
        setIndices(parsedIndices);
        setPositions([]);
        setTransactions([]);
        setDividends([]);
        setCashBalance(0);
        setIsLoaded(true);
        setTimeout(() => {
          fetchRealStockPricesDirect(parsedStocks);
        }, 300);
      } else {
        setPositions([]);
        setTransactions([]);
        setDividends([]);
        setCashBalance(0);
      }
      return;
    }

    // When user IS logged in, target their private user document in Firestore: portfolio/user_{uid}
    const userDocId = `user_${currentUser.uid}`;
    const userDocRef = doc(db, "portfolio", userDocId);

    const unsub = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const incomingDataString = JSON.stringify(data);
        
        // Only update state if data is actually different from our last local save
        if (lastSavedRef.current !== incomingDataString) {
          let migratedStocks = data.stocks || [];
          if (data.stocks && Array.isArray(data.stocks)) {
            migratedStocks = data.stocks.map((s: any) => ({
              ...s,
              watch: s.watch === 'UNDERVALUED' ? 'Buy' : s.watch === 'OVERVALUED' ? 'Sell' : s.watch,
              signal: s.signal === 'UNDERVALUED' ? 'Buy' : s.signal === 'OVERVALUED' ? 'Sell' : s.signal,
              buySell: s.buySell === 'BUY' || s.buySell === 'Buy' ? 'UNDERVALUED' : s.buySell === 'SELL' || s.buySell === 'Sell' ? 'OVERVALUED' : s.buySell
            }));
            setStocks(migratedStocks);
          }
          if (data.indices) setIndices(data.indices);
          
          if (Array.isArray(data.alerts)) setAlerts(data.alerts);
          if (Array.isArray(data.positions)) setPositions(data.positions);
          if (Array.isArray(data.transactions)) setTransactions(data.transactions);
          if (Array.isArray(data.dividends)) setDividends(data.dividends);
          if (typeof data.cashBalance === 'number') setCashBalance(data.cashBalance);
          if (data.baseCurrency === 'USD' || data.baseCurrency === 'EUR') setBaseCurrency(data.baseCurrency);
          
          const currentBuyThreshold = data.settings?.buyThreshold ?? data.settings?.buySellThreshold ?? 10;
          const currentSellThreshold = data.settings?.sellThreshold ?? data.settings?.buySellThreshold ?? 10;
          if (data.settings?.buyThreshold !== undefined || data.settings?.buySellThreshold !== undefined) {
            setBuyThreshold(currentBuyThreshold);
          }
          if (data.settings?.sellThreshold !== undefined || data.settings?.buySellThreshold !== undefined) {
            setSellThreshold(currentSellThreshold);
          }

          const normalizedPayload = {
            stocks: migratedStocks,
            indices: data.indices || [],
            alerts: Array.isArray(data.alerts) ? data.alerts : [],
            positions: Array.isArray(data.positions) ? data.positions : [],
            transactions: Array.isArray(data.transactions) ? data.transactions : [],
            dividends: Array.isArray(data.dividends) ? data.dividends : [],
            cashBalance: typeof data.cashBalance === 'number' ? data.cashBalance : 0,
            baseCurrency: (data.baseCurrency === 'EUR' || data.baseCurrency === 'USD') ? data.baseCurrency : 'USD',
            settings: { buyThreshold: currentBuyThreshold, sellThreshold: currentSellThreshold }
          };
          lastSavedRef.current = JSON.stringify(normalizedPayload);
        }
        
        setIsUserDocLoaded(true);

        if (!isLoaded) {
          setIsLoaded(true);
          setLogs([
            { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), ticker: 'SYS', message: `Успешен вход като ${currentUser.email}! Личното ви портфолио е синхронизирано.`, type: 'info' },
          ]);
          setTimeout(() => {
            fetchRealStockPricesDirect(data.stocks || []);
          }, 300);
        }
      } else {
        // First time initialization for this user: Check legacy 'default' doc or local storage for migration
        let legacyPositions: PortfolioPosition[] = [];
        let legacyTransactions: PortfolioTransaction[] = [];
        let legacyDividends: PortfolioDividendRecord[] = [];
        let legacyCash = 0;
        let legacyBaseCurr: 'USD' | 'EUR' = 'USD';

        try {
          const defaultSnap = await getDoc(doc(db, "portfolio", "default"));
          if (defaultSnap.exists()) {
            const defData = defaultSnap.data();
            if (Array.isArray(defData.positions) && defData.positions.length > 0) legacyPositions = defData.positions;
            if (Array.isArray(defData.transactions) && defData.transactions.length > 0) legacyTransactions = defData.transactions;
            if (Array.isArray(defData.dividends) && defData.dividends.length > 0) legacyDividends = defData.dividends;
            if (typeof defData.cashBalance === 'number') legacyCash = defData.cashBalance;
            if (defData.baseCurrency === 'USD' || defData.baseCurrency === 'EUR') legacyBaseCurr = defData.baseCurrency;
          }
        } catch (e) {}

        // Fallback to local storage if Firestore default was empty
        if (legacyPositions.length === 0) {
          try {
            const localPosRaw = localStorage.getItem('user_portfolio_positions');
            if (localPosRaw) legacyPositions = JSON.parse(localPosRaw);
            const localTxRaw = localStorage.getItem('user_portfolio_transactions');
            if (localTxRaw) legacyTransactions = JSON.parse(localTxRaw);
            const localDivRaw = localStorage.getItem('user_portfolio_dividends');
            if (localDivRaw) legacyDividends = JSON.parse(localDivRaw);
            const localCashRaw = localStorage.getItem('user_portfolio_cash');
            if (localCashRaw !== null) legacyCash = parseFloat(localCashRaw) || 0;
          } catch (e) {}
        }

        const { stocks: parsedStocks, indices: parsedIndices } = parseCSVData(RAW_SPREADSHEET_CSV);
        const defaultAlerts = [
          { id: '1', ticker: 'AAPL', criteria: 'ABOVE', targetPrice: 300, isActive: true, createdAt: new Date().toISOString() },
          { id: '2', ticker: 'TSLA', criteria: 'BELOW', targetPrice: 380, isActive: true, createdAt: new Date().toISOString() },
          { id: '3', ticker: 'NVDA', criteria: 'ABOVE', targetPrice: 215, isActive: true, createdAt: new Date().toISOString() },
        ];
        
        setStocks(parsedStocks);
        setIndices(parsedIndices);
        // @ts-ignore
        setAlerts(defaultAlerts);
        setPositions(legacyPositions);
        setTransactions(legacyTransactions);
        setDividends(legacyDividends);
        setCashBalance(legacyCash);
        setBaseCurrency(legacyBaseCurr);
        setIsLoaded(true);
        setIsUserDocLoaded(true);
        
        const initialUserData = { 
          stocks: parsedStocks, 
          indices: parsedIndices, 
          alerts: defaultAlerts, 
          positions: legacyPositions, 
          transactions: legacyTransactions,
          dividends: legacyDividends,
          cashBalance: legacyCash,
          baseCurrency: legacyBaseCurr,
          settings: { buyThreshold: 10, sellThreshold: 10 } 
        };
        lastSavedRef.current = JSON.stringify(initialUserData);
        
        // Save to user private document in Firestore
        setDoc(userDocRef, JSON.parse(JSON.stringify(initialUserData)))
          .catch(err => console.error("Error setting user document data", err));

        // Clean up legacy 'default' document so unauthenticated guests can't view private portfolios
        setDoc(doc(db, "portfolio", "default"), {
          positions: [],
          transactions: [],
          dividends: [],
          cashBalance: 0,
          baseCurrency: 'USD'
        }, { merge: true }).catch(() => {});

        setTimeout(() => {
          fetchRealStockPricesDirect(parsedStocks);
        }, 300);
      }
    }, (error) => {
      console.error("Firebase User Snapshot Error:", error);
    });

    return () => unsub();
  }, [currentUser, isLoaded]);

  // Automatic Cloud Sync for Logged-In User
  useEffect(() => {
    if (!isLoaded || !currentUser || !isUserDocLoaded) return;
    
    const userDocId = `user_${currentUser.uid}`;
    const payload = { 
      stocks, 
      indices, 
      alerts, 
      positions, 
      transactions,
      dividends,
      cashBalance,
      baseCurrency,
      settings: { buyThreshold, sellThreshold } 
    };
    const currentDataString = JSON.stringify(payload);

    // Auto-save to cloud user document only if there's an actual change
    if (lastSavedRef.current !== currentDataString) {
      lastSavedRef.current = currentDataString;
      setDoc(doc(db, "portfolio", userDocId), JSON.parse(currentDataString), { merge: true })
        .catch(err => console.error("Firebase User Auto Save Error:", err));
    }
  }, [currentUser, isUserDocLoaded, stocks, indices, alerts, positions, transactions, dividends, cashBalance, baseCurrency, buyThreshold, sellThreshold, isLoaded]);

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

  // Automatic live update interval background runner (runs loop every 90s)
  useEffect(() => {
    if (!isAutoLiveRefresh) return;

    const interval = setInterval(() => {
      fetchRealStockPricesDirect();
    }, 90000);

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
  const handleUpdateStock = (oldTicker: string, updatedStock: Stock) => {
  setStocks(prev => prev.map(s => s.ticker === oldTicker ? updatedStock : s));
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

  const handleNewUser = () => {
    setStocks([]);
    setIndices([]);
    setAlerts([]);
    
    const newLog: NotificationLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      ticker: 'SYS',
      message: 'Всички данни бяха изтрити. Успешен старт за нов потребител.',
      type: 'info'
    };
    setLogs(prev => [newLog, ...prev]);
    setActiveAlertToast('Данните бяха изчистени успешно!');
    setTimeout(() => setActiveAlertToast(null), 4000);
    setShowNewUserModal(false);
  };

  const handleRestoreDefaults = () => {
    if (!confirmRestore) {
      setConfirmRestore(true);
      setTimeout(() => setConfirmRestore(false), 3000);
      return;
    }
    
    const { stocks: parsedStocks, indices: parsedIndices } = parseCSVData(RAW_SPREADSHEET_CSV);
    setStocks(parsedStocks);
    setIndices(parsedIndices);
    
    const newAlerts: PriceAlert[] = [
      { id: '1', ticker: 'AAPL', criteria: 'ABOVE', targetPrice: 300, isActive: true, createdAt: new Date().toISOString() },
      { id: '2', ticker: 'TSLA', criteria: 'BELOW', targetPrice: 380, isActive: true, createdAt: new Date().toISOString() },
      { id: '3', ticker: 'NVDA', criteria: 'ABOVE', targetPrice: 215, isActive: true, createdAt: new Date().toISOString() },
    ];
    setAlerts(newAlerts);

    const newLog: NotificationLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      ticker: 'SYS',
      message: 'Фабричните данни бяха възстановени успешно.',
      type: 'success'
    };
    setLogs(prev => [newLog, ...prev]);
    setActiveAlertToast('Фабричните данни бяха възстановени!');
    setTimeout(() => setActiveAlertToast(null), 4000);
    setConfirmRestore(false);
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

 let buySell = 'OVERVALUED';
 if (stock.fairPrice !== null && nextPrice > 0) {
 const dev = ((nextPrice - stock.fairPrice) / stock.fairPrice) * 100;
 if (dev < -buyThresholdRef.current) {
 buySell = 'UNDERVALUED';
 } else if (dev > sellThresholdRef.current) {
 buySell = 'OVERVALUED';
 } else {
 buySell = 'ДРУГИ';
 }
 }
 // Replace the hardcoded signal logic
        let signal = stock.signal || 'Hold';
        const l52 = stock.low52;
        const h52 = stock.high52;
        
        if (nextPrice > 0 && typeof l52 === 'number' && typeof h52 === 'number') {
          const buyLimit = l52 * (1 + signalThresholdRef.current / 100);
          const sellLimit = h52 * (1 - signalThresholdRef.current / 100);
          if (nextPrice <= buyLimit) signal = 'Buy';
          else if (nextPrice >= sellLimit) signal = 'Sell';
          else signal = 'Hold';
        } else {
          signal = '-';
        }

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
 const message = `Предупреждение за цена! Акцията ${stock.ticker} премина гранатата от $${alert.targetPrice} (Текуща: $${newPrice})`;

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

  // Add, Update, and Delete alert controllers
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
    setActiveAlertToast(`🔔 Сигналът за ${ticker} (${criteria === 'ABOVE' ? 'над' : 'под'} $${targetPrice}) беше добавен успешно!`);
    setActiveMainTab('alerts');
  };

  const handleUpdateAlert = (id: string, ticker: string, criteria: 'ABOVE' | 'BELOW', targetPrice: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, ticker, criteria, targetPrice } : a));

    const newLog: NotificationLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      ticker,
      message: `Редактиран сигнал за задействане при цена ${criteria === 'ABOVE' ? 'над' : 'под'} $${targetPrice}.`,
      type: 'info'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Position management controllers for Portfolio Tracker
  const handleAddPosition = (pos: Omit<PortfolioPosition, 'id'>) => {
    const newPos: PortfolioPosition = {
      ...pos,
      id: `${Date.now()}-${Math.random()}`
    };
    setPositions(prev => {
      const next = [newPos, ...prev];
      setTimeout(() => {
        fetchRealStockPricesDirect(stocks, next);
      }, 150);
      return next;
    });

    const newLog: NotificationLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      ticker: pos.ticker,
      message: `Добавена нова позиция в портфолиото: ${pos.shares} бр. @ $${pos.buyPrice}.`,
      type: 'success'
    };
    setLogs(prev => [newLog, ...prev]);
    setActiveAlertToast(`💼 Успешно добавена позиция за ${pos.ticker}!`);
  };

  const handleUpdatePosition = (id: string, updatedPos: Omit<PortfolioPosition, 'id'>) => {
    setPositions(prev => {
      const next = prev.map(p => p.id === id ? { ...updatedPos, id } : p);
      setTimeout(() => {
        fetchRealStockPricesDirect(stocks, next);
      }, 150);
      return next;
    });
    setActiveAlertToast(`💼 Обновена позиция за ${updatedPos.ticker}!`);
  };

  const handleDeletePosition = (id: string) => {
    setPositions(prev => {
      const next = prev.filter(p => p.id !== id);
      setTimeout(() => {
        fetchRealStockPricesDirect(stocks, next);
      }, 150);
      return next;
    });
    setActiveAlertToast(`💼 Позицията беше изтрита.`);
  };

 // Export updated stocks table database back as a clean structured CSV spreadsheet
 const exportCSVFile = () => {
 let csvContent = "Watch,Ticker,Company Name,365 Chart,Date,Price of Calc.,Daily Change %,Current Price,Fair Price,Difference,Over/Under,Market Cap,P/E Ratio,EPS,Sector,Dividend,Signal,52 Low,52 High,AI Analis\n";
 
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
  <div className="min-h-screen bg-bg text-ink flex flex-col pb-12 antialiased overflow-x-hidden w-full">

  {/* Main Container */}
  <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 flex-1 space-y-5">
 
  {/* New User Confirmation Modal */}
  {showNewUserModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg border border-red-500/50 rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <h2 className="text-lg font-sans tabular-nums font-extrabold text-red-500 uppercase tracking-tight mb-2">
          Изчистване на всички данни?
        </h2>
        <p className="text-xs font-sans text-ink-muted mb-6">
          Сигурни ли сте, че искате да изтриете всички ваши акции, графики и известия? Това ще нулира платформата за <strong>нов потребител</strong>. Действието е <strong>необратимо</strong>.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowNewUserModal(false)}
            className="px-4 py-2 text-xs font-sans tabular-nums font-extrabold text-ink-faint border border-border hover:bg-card-hover transition-colors uppercase"
          >
            Отказ
          </button>
          <button
            onClick={handleNewUser}
            className="px-4 py-2 text-xs font-sans tabular-nums font-extrabold text-white bg-red-600 hover:bg-red-700 border border-red-700 transition-colors uppercase shadow-lg shadow-red-900/20"
          >
            Изчисти данните
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Floating live alerts toast banner */}
  {activeAlertToast && (
    <div className="fixed top-16 right-4 z-[9999] bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 rounded-2xl shadow-2xl p-3.5 max-w-sm flex items-start justify-between gap-3 font-sans tabular-nums text-xs animate-bounce">
      <div className="flex items-start gap-2.5">
        <Bell className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <span className="font-extrabold text-emerald-300 block mb-0.5 uppercase tracking-wide">
            🚨 ИЗВЕСТИЕ ЗА ЦЕНА!
          </span>
          <p className="leading-snug">{activeAlertToast}</p>
        </div>
      </div>
      <button
        onClick={() => setActiveAlertToast(null)}
        className="text-emerald-400 hover:text-white transition-colors p-1 cursor-pointer"
        title="Затвори"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )}



  {/* Dashboard Header Bar */}
  <div className="flex flex-col items-start gap-4 border-b border-border pb-5 -mx-4 px-4 md:mx-0 md:px-0 relative z-[100] mb-4">
      <div className="flex items-center gap-2 max-w-full">
        <Building2 className="w-5 h-5 text-ink shrink-0" />
        <h1 className="text-lg sm:text-2xl font-extrabold text-ink font-sans tabular-nums tracking-tight uppercase leading-tight">
          ПЛАТФОРМА ЗА СЛЕДЕНЕ НА АКЦИИ
        </h1>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-start">

        {/* 1. Auto live updates toggler */}
        <button
          onClick={() => setIsAutoLiveRefresh(!isAutoLiveRefresh)}
          className={`h-9 px-3.5 rounded-xl border font-sans text-xs font-extrabold uppercase transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 shadow-xs select-none ${
            isAutoLiveRefresh 
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25' 
              : 'bg-card text-ink-faint border-border hover:bg-card-hover hover:text-ink'
          }`}
          title="Автоматично фоново синхронизиране на живите пазарни котировки"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            {isAutoLiveRefresh && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isAutoLiveRefresh ? 'bg-emerald-400' : 'bg-stone-500'}`}></span>
          </span>
          <span>Живи Данни: {isAutoLiveRefresh ? 'ВКЛ' : 'ИЗКЛ'}</span>
        </button>

        {/* 2. Quick real live market quotes sync */}
        <button
          onClick={triggerManualRefresh}
          disabled={isFetchingLivePrices}
          className={`h-9 px-3.5 rounded-xl border font-sans text-xs font-extrabold uppercase transition-all duration-150 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-xs select-none ${
            isFetchingLivePrices
              ? 'bg-card/50 text-ink-faint border-border/50 cursor-not-allowed'
              : 'bg-card text-ink-muted hover:text-ink border-border hover:bg-card-hover hover:border-indigo-500/30'
          }`}
          title="Ръчно незабавно изтегляне на актуални котировки от Yahoo Finance за всички активи"
        >
          <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isFetchingLivePrices ? 'animate-spin text-emerald-400' : 'text-indigo-400'}`} />
          <span>{isFetchingLivePrices ? 'Синхронизиране...' : 'Опресни пазар'}</span>
        </button>

        {/* 3. System Settings Dropdown */}
        <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsSettingsMenuOpen(false); }}>
          <button
            onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
            className={`h-9 px-3.5 rounded-xl border font-sans text-xs font-extrabold uppercase transition-all duration-150 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-xs select-none ${
              isSettingsMenuOpen
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-card text-ink-muted hover:text-ink border-border hover:bg-card-hover hover:border-indigo-500/30'
            }`}
            title="Системни настройки и данни"
          >
            <Settings2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Настройки</span>
            <ChevronDown className={`w-3 h-3 text-ink-faint transition-transform duration-200 shrink-0 ${isSettingsMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSettingsMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-56 bg-bg border border-border rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 origin-top-left animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => { exportCSVFile(); setIsSettingsMenuOpen(false); }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-ink hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Експорт CSV
              </button>
              <button
                onClick={() => { handleRestoreDefaults(); setIsSettingsMenuOpen(false); }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                title="Върнете началните фабрични данни"
              >
                <ArchiveRestore className="w-4 h-4 text-stone-500" />
                Фабрични данни
              </button>
              <div className="h-px bg-border/50 my-1 mx-1" />
              <button
                onClick={() => { setShowNewUserModal(true); setIsSettingsMenuOpen(false); }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#f43f5e] hover:bg-[#f43f5e]/10 rounded-lg transition-colors cursor-pointer"
                title="Изтрийте всичко и започнете начисто"
              >
                <Trash2 className="w-4 h-4" />
                Нов потребител (Изчисти)
              </button>
            </div>
          )}
        </div>

        {/* 4. Header button for Cloud Sync / Account Auth (Email Login) */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className={`h-9 px-3.5 rounded-xl border font-sans text-xs font-extrabold transition-all duration-150 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-xs select-none ${
            currentUser
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
              : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/25 uppercase'
          }`}
          title={currentUser ? `Влезли сте като ${currentUser.email}` : 'Вход / Синхронизация'}
        >
          <Cloud className={`w-3.5 h-3.5 shrink-0 ${currentUser ? 'text-emerald-400 animate-pulse' : 'text-indigo-400'}`} />
          <span>
            {currentUser 
              ? `👤 ${currentUser.displayName || currentUser.email?.split('@')[0]} (🟢 ON)`
              : '🔑 Вход / Синхронизация'}
          </span>
        </button>

        {/* 5. Header button for TradingView Economic Calendar Modal */}
        <button
          onClick={() => setShowEconomicCalendarModal(true)}
          className="h-9 px-3.5 rounded-xl border border-border bg-card text-ink-muted hover:text-ink hover:bg-card-hover hover:border-indigo-500/30 font-sans text-xs font-extrabold uppercase transition-all duration-150 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-xs select-none"
          title="Economic Calendar"
        >
          <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Calendar</span>
        </button>

        {/* 6. Useful Links Dropdown Button */}
        <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsUsefulLinksMenuOpen(false); }}>
          <button
            onClick={() => setIsUsefulLinksMenuOpen(!isUsefulLinksMenuOpen)}
            className={`h-9 px-3.5 rounded-xl border font-sans text-xs font-extrabold uppercase transition-all duration-150 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-xs select-none ${
              isUsefulLinksMenuOpen
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-card text-ink-muted hover:text-ink border-border hover:bg-card-hover hover:border-indigo-500/30'
            }`}
            title="Useful Links"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Useful Links</span>
            <ChevronDown className={`w-3 h-3 text-ink-faint transition-transform duration-200 shrink-0 ${isUsefulLinksMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isUsefulLinksMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-bg border border-border rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 origin-top-right animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 border-b border-border/40 text-[10px] uppercase font-bold text-ink-faint">
                🛠️ Калкулатори & Инструменти
              </div>

              <button
                onClick={() => { setShowRoiCalculatorModal(true); setIsUsefulLinksMenuOpen(false); }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-ink hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Return on Investment (ROI)</span>
              </button>

              <button
                onClick={() => { setShowInvestmentCalculatorModal(true); setIsUsefulLinksMenuOpen(false); }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-ink hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Сложна Лихва & Растеж</span>
              </button>
            </div>
          )}
        </div>

        {/* 7. Theme Toggle */}
        <ThemeToggle />

      </div>
 </div>

    {/* Dynamic indices banner strip (Index Markets / US Markets) */}
    <IndicesStrip 
     indices={indices} 
     isSimulating={isSimulating} 
    />

    {/* Main Section Tabs Switcher: Sleek Capsule Buttons directly under Index Markets / US Markets */}
    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full touch-pan-x scroll-smooth no-scrollbar mb-5 mt-2" id="stock-table-section">
      
      {/* Tab 1: INTERACTIVE TABLE */}
      <a
        href="#table"
        onClick={(e) => {
          e.preventDefault();
          switchTab('table');
        }}
        className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase font-sans tabular-nums transition-all cursor-pointer flex items-center gap-2 border shrink-0 ${
          activeMainTab === 'table'
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
            : 'bg-card/70 hover:bg-card text-ink-muted hover:text-ink border-border/80 font-bold'
        }`}
      >
        <Table className="w-4 h-4 shrink-0" />
        <span>INTERACTIVE TABLE</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
          activeMainTab === 'table' ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-400'
        }`}>
          {stocks.length}
        </span>
      </a>

      {/* Tab 2: PRICE ALERTS SCHEDULE */}
      <a
        href="#alerts"
        onClick={(e) => {
          e.preventDefault();
          switchTab('alerts');
        }}
        className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase font-sans tabular-nums transition-all cursor-pointer flex items-center gap-2 border shrink-0 ${
          activeMainTab === 'alerts'
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
            : 'bg-card/70 hover:bg-card text-ink-muted hover:text-ink border-border/80 font-bold'
        }`}
      >
        <Bell className="w-4 h-4 shrink-0" />
        <span>PRICE ALERTS SCHEDULE</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
          activeMainTab === 'alerts' ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-400'
        }`}>
          {alerts.length}
        </span>
      </a>

      {/* Tab 3: PORTFOLIO TRACKER */}
      <a
        href="#portfolio"
        onClick={(e) => {
          e.preventDefault();
          switchTab('portfolio');
        }}
        className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase font-sans tabular-nums transition-all cursor-pointer flex items-center gap-2 border shrink-0 ${
          activeMainTab === 'portfolio'
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
            : 'bg-card/70 hover:bg-card text-ink-muted hover:text-ink border-border/80 font-bold'
        }`}
      >
        <Briefcase className="w-4 h-4 shrink-0" />
        <span>PORTFOLIO TRACKER</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
          activeMainTab === 'portfolio' ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-400'
        }`}>
          {positions.length}
        </span>
      </a>
    </div>

      {/* Top Market Widgets: Top Gainer, Top Loser, Fear & Greed Index */}
      {activeMainTab === 'table' && (
        <>
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
            buyThreshold={buyThreshold}
            sellThreshold={sellThreshold}
            onUpdateThresholds={handleUpdateThresholds}
            signalThreshold={signalThreshold}
            onUpdateSignalThreshold={handleUpdateSignalThreshold}
          />
        </>
      )}

    {activeMainTab === 'table' ? (
      <>
        <StockTable 
          stocks={stocks} 
          alerts={alerts}
          onAddAlert={handleAddAlert}
          onUpdateAlert={handleUpdateAlert}
          onDeleteAlert={handleDeleteAlert}
          onUpdateStock={handleUpdateStock} 
          onDeleteStock={handleDeleteStock}
          onSelectStockForAi={setSelectedStockForAi} 
          activeFilter={activeFilter}
          onSetActiveFilter={setActiveFilter}
          buyThreshold={buyThreshold}
          sellThreshold={sellThreshold}
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
        
      </>
    ) : activeMainTab === 'alerts' ? (
      <PriceAlertPlanner
        stocks={stocks}
        alerts={alerts}
        onAddAlert={handleAddAlert}
        onUpdateAlert={handleUpdateAlert}
        onDeleteAlert={handleDeleteAlert}
      />
    ) : null}

    {/* PortfolioTracker is ALWAYS mounted so its real-time Firestore sync stays alive 24/7 */}
    <div className={activeMainTab === 'portfolio' ? 'block' : 'hidden'}>
      <PortfolioTracker
        stocks={stocks}
        positions={positions}
        transactions={transactions}
        dividends={dividends}
        cashBalance={cashBalance}
        baseCurrency={baseCurrency}
        currentUser={currentUser}
        onAddPosition={handleAddPosition}
        onUpdatePosition={handleUpdatePosition}
        onDeletePosition={handleDeletePosition}
        onSetAllPositions={(newPositions) => setPositions(newPositions)}
        onSetTransactions={(newTxList) => setTransactions(newTxList)}
        onSetDividends={(newDivList) => setDividends(newDivList)}
        onUpdateCash={(newCash) => setCashBalance(newCash)}
        onSetBaseCurrency={(newCurr) => setBaseCurrency(newCurr)}
        portfolioPrices={portfolioPrices}
      />
    </div>

    {/* Verified Business & Stock News Feed (Table tab only) */}
    {activeMainTab === 'table' && (
      <CompanyNewsContainer
        stocks={stocks}
        selectedStock={selectedStockForAi}
        onSelectStock={setSelectedStockForAi}
      />
    )}

    {/* Real-time Notification Logs monitor at the bottom of Table tab */}
    {activeMainTab === 'table' && (
      <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col justify-between shadow-xs mt-6">
        <div>
          <h3 className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-800" />
            Лог на известията & задействания
          </h3>
          <p className="text-xs text-ink-faint font-sans tabular-nums mt-0.5">
            Хроника на пазарните промени и филтри на заложени аларми.
          </p>
        </div>

        <div className="h-28 overflow-y-auto mt-3.5 space-y-1.5 pr-1 text-xs font-sans tabular-nums">
          {logs.map(log => (
            <div 
              key={log.id} 
              className={`p-1.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-1.5 ${
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
    )}

    {/* Sleek Collapsible CSV & Google Sheets Uploader Footer (Available across all 3 windows/tabs) */}
    <div className="mt-8 border-t border-border/40 pt-6 pb-8 flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => setIsCsvUploaderOpen(!isCsvUploaderOpen)}
        className="px-5 py-2.5 rounded-2xl bg-card hover:bg-card-hover border border-border/80 text-ink-muted hover:text-ink text-xs font-extrabold transition-all flex items-center gap-2.5 cursor-pointer shadow-xs"
      >
        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
        <span>📊 Синхронизиране с Google Sheets & CSV данни</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCsvUploaderOpen ? 'rotate-180 text-emerald-400' : ''}`} />
      </button>

      {isCsvUploaderOpen && (
        <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-200">
          <CsvUploader onDataLoaded={handleSheetSynced} />
        </div>
      )}
    </div>


  {/* TradingView Economic Calendar Modal Popup */}
  {showEconomicCalendarModal && (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) setShowEconomicCalendarModal(false); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-bg/80 backdrop-blur-md font-sans"
    >
      <div className="w-full max-w-4xl bg-card border-2 border-indigo-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative h-[80vh] flex flex-col">
        <button
          onClick={() => setShowEconomicCalendarModal(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-ink hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer"
          title="Затвори"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-ink leading-tight uppercase">
              Икономически Календар (TradingView)
            </h3>
            <span className="text-xs text-ink-faint">
              Предстоящи макроикономически доклади и събития за САЩ и Европа в реално време
            </span>
          </div>
        </div>

        <div className="flex-1 w-full rounded-2xl overflow-hidden border border-border/50 relative">
          <EconomicCalendar
            colorTheme="dark"
            width="100%"
            height="100%"
            locale="en"
            countryFilter="us,eu"
            importanceFilter="0,1"
          />
        </div>
      </div>
    </div>
  )}

  {/* Global Auth / Cloud Sync Modal */}
  <AuthModal
    isOpen={isAuthModalOpen}
    onClose={() => setIsAuthModalOpen(false)}
    currentUser={currentUser}
  />

  {/* ROI Calculator Modal */}
  <RoiCalculatorModal
    isOpen={showRoiCalculatorModal}
    onClose={() => setShowRoiCalculatorModal(false)}
    baseCurrency={baseCurrency}
  />

  {/* Investment Compound Growth Calculator Modal */}
  <InvestmentCalculatorModal
    isOpen={showInvestmentCalculatorModal}
    onClose={() => setShowInvestmentCalculatorModal(false)}
    baseCurrency={baseCurrency}
  />
 </main>


 </div>
 );
}
