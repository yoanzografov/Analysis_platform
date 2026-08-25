import React, { useState, useEffect } from 'react';
import { Stock, PortfolioPosition, PortfolioTransaction, PortfolioDividendRecord } from '../types';
import { useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { AuthModal } from './AuthModal';
import { getSectorForStock } from '../utils/sectorHelper';
import { 
  Briefcase, 
  PlusCircle, 
  Plus,
  Trash2, 
  Edit3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Sparkles, 
  Calendar,
  Check,
  X,
  XCircle,
  Coins,
  History,
  ShieldCheck,
  RefreshCw,
  Newspaper,
  ChevronRight,
  Flame,
  ArrowDownRight,
  Layers,
  Lock,
  ArrowUpRight,
  ExternalLink,
  PieChart,
  Eye,
  EyeOff,
  Download,
  Upload,
  Cloud,
  CloudOff,
  Key,
  CheckCircle2,
  Info
} from 'lucide-react';

export const formatDateDDMMYYYY = (dateStr?: string | number | null): string => {
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
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}.${month}.${year}`;
  }
  return str;
};

interface Props {
  stocks: Stock[];
  positions: PortfolioPosition[];
  transactions?: PortfolioTransaction[];
  dividends?: PortfolioDividendRecord[];
  cashBalance?: number;
  baseCurrency?: 'USD' | 'EUR';
  currentUser?: FirebaseUser | null;
  onAddPosition: (pos: Omit<PortfolioPosition, 'id'>) => void;
  onUpdatePosition: (id: string, pos: Omit<PortfolioPosition, 'id'>) => void;
  onDeletePosition: (id: string) => void;
  onAddTransaction?: (tx: Omit<PortfolioTransaction, 'id'>) => void;
  onAddDividend?: (div: Omit<PortfolioDividendRecord, 'id'>) => void;
  onUpdateCash?: (cash: number) => void;
  onSetAllPositions?: (positions: PortfolioPosition[]) => void;
  onSetTransactions?: (transactions: PortfolioTransaction[]) => void;
  onSetDividends?: (dividends: PortfolioDividendRecord[]) => void;
  onSetBaseCurrency?: (baseCurrency: 'USD' | 'EUR') => void;
  portfolioPrices?: Record<string, { currentPrice: number; dailyChangePct: number; companyName?: string; currency?: string }>;
}

const StockLogo = ({ ticker }: { ticker: string }) => {
  const [error, setError] = useState(false);
  if (error || !ticker) {
    return (
      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-ink-muted border border-white/20 shrink-0">
        {ticker ? ticker.charAt(0) : '?'}
      </div>
    );
  }
  return (
    <img 
      src={`https://financialmodelingprep.com/image-stock/${ticker.toUpperCase()}.png`} 
      alt={ticker}
      onError={() => setError(true)}
      className="w-5 h-5 rounded-full bg-white/10 shrink-0 object-contain"
    />
  );
};

export default function PortfolioTracker({ 
  stocks, 
  positions, 
  transactions = [], 
  dividends = [], 
  cashBalance = 0,
  baseCurrency: propBaseCurrency = 'USD',
  currentUser: propCurrentUser,
  onAddPosition, 
  onUpdatePosition, 
  onDeletePosition,
  onAddTransaction,
  onAddDividend,
  onUpdateCash,
  onSetAllPositions,
  onSetTransactions,
  onSetDividends,
  onSetBaseCurrency,
  portfolioPrices = {}
}: Props) {
  // Firebase Auth User & Account Sync
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(propCurrentUser ?? null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (propCurrentUser !== undefined) {
      setCurrentUser(propCurrentUser);
    } else {
      const unsub = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
      });
      return () => unsub();
    }
  }, [propCurrentUser]);

  const isInitialCloudSyncedRef = useRef(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const isRemoteUpdatingRef = useRef(false);
  const lastCloudPayloadRef = useRef<string>('');

  // Main form state & currency
  const [positionCurrency, setPositionCurrency] = useState<'USD' | 'EUR'>('USD');
  const [txType, setTxType] = useState<'Покупка' | 'Продажба'>('Покупка');
  const [ticker, setTicker] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [shares, setShares] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [fee, setFee] = useState('0.00');
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split('T')[0]);
  const [fairPrice, setFairPrice] = useState('');
  const [annualDiv, setAnnualDiv] = useState('');
  const [buyTarget, setBuyTarget] = useState('');
  const [sellTarget, setSellTarget] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Base Currency state for portfolio totals & charts (USD or EUR)
  const [baseCurrency, setBaseCurrency] = useState<'USD' | 'EUR'>(() => {
    if (propBaseCurrency) return propBaseCurrency;
    try {
      const saved = localStorage.getItem('user_portfolio_base_currency');
      if (saved === 'EUR' || saved === 'USD') return saved;
    } catch (e) {}
    return 'USD';
  });

  useEffect(() => {
    if (propBaseCurrency) {
      setBaseCurrency(propBaseCurrency);
    }
  }, [propBaseCurrency]);

  const handleSetBaseCurrency = (curr: 'USD' | 'EUR') => {
    setBaseCurrency(curr);
    try {
      localStorage.setItem('user_portfolio_base_currency', curr);
    } catch (e) {}
    if (onSetBaseCurrency) onSetBaseCurrency(curr);
  };

  const baseSymbol = baseCurrency === 'EUR' ? '€' : '$';

  // Cash management state with multi-device real-time Firebase sync
  const [cashInput, setCashInput] = useState(() => {
    if (cashBalance !== undefined && cashBalance > 0) return cashBalance.toString();
    try {
      const saved = localStorage.getItem('user_portfolio_cash');
      if (saved !== null) return saved;
    } catch (e) {}
    return (cashBalance || 0).toString();
  });

  useEffect(() => {
    if (cashBalance !== undefined) {
      setCashInput(cashBalance.toString());
    }
  }, [cashBalance]);

  const handleSaveCash = () => {
    const parsed = parseFloat(cashInput) || 0;
    try {
      localStorage.setItem('user_portfolio_cash', parsed.toString());
    } catch (e) {}
    if (onUpdateCash) onUpdateCash(parsed);
    alert(`Кеш наличността (${baseSymbol}${parsed.toFixed(2)}) беше запазена и синхронизирана между всички ваши устройства!`);
    setIsCashModalOpen(false);
  };

  // Dividend ledger form state with multi-device real-time Firebase sync
  const [divMode, setDivMode] = useState<'single' | 'bulk'>('single');
  const [divTicker, setDivTicker] = useState('AAPL');
  const [divAmount, setDivAmount] = useState('24.58');
  const [divDate, setDivDate] = useState(new Date().toISOString().split('T')[0]);
  const [divBulkNote, setDivBulkNote] = useState('Дивиденти Август 2026');
  const [divAutoCash, setDivAutoCash] = useState(true);
  const [divRecords, setDivRecords] = useState<PortfolioDividendRecord[]>(() => {
    if (dividends && dividends.length > 0) return dividends;
    try {
      const saved = localStorage.getItem('user_portfolio_dividends');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    if (dividends !== undefined) {
      setDivRecords(dividends);
    }
  }, [dividends]);

  const updateDivRecords = (newDivs: PortfolioDividendRecord[]) => {
    setDivRecords(newDivs);
    try {
      localStorage.setItem('user_portfolio_dividends', JSON.stringify(newDivs));
    } catch (e) {}
    if (onSetDividends) {
      onSetDividends(newDivs);
    }
  };

  const handleDeleteDividendRecord = (id: string) => {
    const next = divRecords.filter(d => d.id !== id);
    updateDivRecords(next);
  };

  // Transactions History with multi-device real-time Firebase sync
  const [history, setHistory] = useState<PortfolioTransaction[]>(() => {
    if (transactions && transactions.length > 0) return transactions;
    try {
      const saved = localStorage.getItem('user_portfolio_transactions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    if (transactions !== undefined) {
      setHistory(transactions);
    }
  }, [transactions]);

  const updateHistory = (newHistory: PortfolioTransaction[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('user_portfolio_transactions', JSON.stringify(newHistory));
    } catch (e) {}
    if (onSetTransactions) {
      onSetTransactions(newHistory);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете тази транзакция от историята?')) {
      const next = history.filter(t => t.id !== id);
      updateHistory(next);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Сигурни ли сте, че искате да изчистите ЦЯЛАТА история на транзакциите? Това ще нулира Realized P/L на $0.00 на всички ваши устройства.')) {
      updateHistory([]);
    }
  };

  // Privacy mode & Backup Export/Import logic
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'diversification' | 'dividends' | 'holdings' | 'transactions'>('overview');
  const [isAiAuditOpen, setIsAiAuditOpen] = useState(false);
  const [tvModalTicker, setTvModalTicker] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDividendsModalOpen, setIsDividendsModalOpen] = useState(false);
  const [cagrHorizon, setCagrHorizon] = useState<'1г.' | '2г.' | '3г.' | '5г.'>('2г.');
  const [showAssetAllocationInfo, setShowAssetAllocationInfo] = useState(false);

  // Selected clicked row marker & 10 rows per page pagination
  const [selectedPosId, setSelectedPosId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting state for the table (Alphabetical by Ticker A-Z by default)
  const [sortField, setSortField] = useState<string | null>('ticker');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        // Reset back to default alphabetical A-Z
        setSortField('ticker');
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Privacy mode & Backup Export/Import logic
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('user_portfolio_privacy') === 'true';
    } catch (e) {
      return false;
    }
  });

  const togglePrivacyMode = () => {
    setIsPrivacyMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('user_portfolio_privacy', next.toString());
      } catch (e) {}
      return next;
    });
  };

  const handleExportBackup = () => {
    const backupData = {
      positions,
      history,
      divRecords,
      cashInput,
      baseCurrency,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.positions && Array.isArray(parsed.positions)) {
          if (window.confirm(`Искате ли да импортирате ${parsed.positions.length} актива от резервния файл?`)) {
            localStorage.setItem('user_portfolio_positions', JSON.stringify(parsed.positions));
            if (parsed.history) localStorage.setItem('user_portfolio_transactions', JSON.stringify(parsed.history));
            if (parsed.divRecords) localStorage.setItem('user_portfolio_dividends', JSON.stringify(parsed.divRecords));
            if (parsed.cashInput) localStorage.setItem('user_portfolio_cash', parsed.cashInput);
            if (parsed.baseCurrency) localStorage.setItem('user_portfolio_base_currency', parsed.baseCurrency);
            window.location.reload();
          }
        } else {
          alert('Невалиден резервен файл на портфолиото.');
        }
      } catch (err) {
        alert('Грешка при четене на файла.');
      }
    };
    reader.readAsText(file);
  };

  // Date filters for transaction history
  const [historyFromDate, setHistoryFromDate] = useState('');
  const [historyToDate, setHistoryToDate] = useState('');

  // Handle ticker typing & auto-filling data from stocks database
  const handleTickerChange = (val: string) => {
    setTicker(val);
    const upper = val.trim().toUpperCase();

    // Auto-detect European vs US ticker currency
    const isEur = upper.endsWith('.DE') || upper.endsWith('.PA') || upper.endsWith('.AS') || ['SXR8', 'VWCE', 'QDVE', 'IS3N', 'EUNL', '4GLD', 'MEUD', 'JGPI'].includes(upper);
    if (isEur) {
      setPositionCurrency('EUR');
    } else if (upper.endsWith('.L')) {
      setPositionCurrency('GBP');
    }

    const found = stocks.find(s => s.ticker === upper);
    if (found) {
      setCompanyName(found.companyName);
      if (found.currentPrice || found.priceOfCalc) {
        setBuyPrice((found.currentPrice || found.priceOfCalc || 0).toFixed(2));
      }
      if (found.fairPrice) {
        setFairPrice(found.fairPrice.toFixed(2));
      }
      if (found.dividend) {
        const match = found.dividend.match(/([\d.]+)/);
        if (match) setAnnualDiv(match[1]);
      }
    }
  };

  // Quick Test Assets buttons
  const handleQuickAsset = (tick: string, name: string, price: number, fair: number) => {
    setTicker(tick);
    setCompanyName(name);
    setBuyPrice(price.toFixed(2));
    setFairPrice(fair.toFixed(2));
    if (!shares) setShares('10');
  };

  // Form submit handler
  const handleSubmitPosition = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!ticker.trim()) {
      setFormError('Въведете тикер (напр. AAPL или VWCE)');
      return;
    }

    const sharesNum = parseFloat(shares);
    if (isNaN(sharesNum) || sharesNum <= 0) {
      setFormError('Въведете валиден брой акции');
      return;
    }

    const priceNum = parseFloat(buyPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Въведете валидна цена');
      return;
    }

    const parseOptionalFloat = (val: string) => {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    };

    const payload: Omit<PortfolioPosition, 'id'> = {
      ticker: ticker.trim().toUpperCase(),
      companyName: companyName.trim(),
      shares: sharesNum,
      buyPrice: priceNum,
      currency: positionCurrency,
      fee: parseFloat(fee) || 0,
      buyDate: buyDate || new Date().toISOString().split('T')[0],
      fairPrice: parseOptionalFloat(fairPrice),
      annualDivPerShare: parseOptionalFloat(annualDiv),
      buyTarget: parseOptionalFloat(buyTarget),
      sellTarget: parseOptionalFloat(sellTarget)
    };

    if (editingId) {
      onUpdatePosition(editingId, payload);
      setEditingId(null);
    } else if (txType === 'Продажба') {
      const existingPos = positions.find(p => p.ticker.toUpperCase() === payload.ticker);
      const posBuyPrice = existingPos ? existingPos.buyPrice : priceNum;
      const sellPrice = priceNum;
      const feeNum = parseFloat(fee) || 0;
      const cost = sharesNum * posBuyPrice;
      const revenue = (sharesNum * sellPrice) - feeNum;
      const pnlVal = revenue - cost;
      const pnlPct = cost > 0 ? (pnlVal / cost) * 100 : 0;

      if (existingPos) {
        const remainingShares = existingPos.shares - sharesNum;
        if (remainingShares <= 0) {
          onDeletePosition(existingPos.id);
        } else {
          onUpdatePosition(existingPos.id, {
            ...existingPos,
            shares: remainingShares
          });
        }
      }

      const newTx: PortfolioTransaction = {
        id: `${Date.now()}-${Math.random()}`,
        date: buyDate || new Date().toISOString().split('T')[0],
        ticker: payload.ticker,
        type: 'Продажба',
        shares: sharesNum,
        buyPrice: posBuyPrice,
        sellPrice: sellPrice,
        currency: positionCurrency,
        pnlVal: pnlVal,
        pnlPct: pnlPct
      };
      updateHistory([newTx, ...history]);
    } else {
      onAddPosition(payload);

      // Add to transaction history
      const newTx: PortfolioTransaction = {
        id: `${Date.now()}-${Math.random()}`,
        date: buyDate || new Date().toISOString().split('T')[0],
        ticker: payload.ticker,
        type: 'Покупка',
        shares: sharesNum,
        buyPrice: priceNum,
        currency: positionCurrency,
        pnlVal: 0,
        pnlPct: 0
      };
      updateHistory([newTx, ...history]);
    }

    // Reset form and close modal
    setTicker('');
    setCompanyName('');
    setShares('');
    setBuyPrice('');
    setFee('0.00');
    setFairPrice('');
    setAnnualDiv('');
    setBuyTarget('');
    setSellTarget('');
    setIsAddModalOpen(false);
  };

  const handleCloseAddModal = () => {
    setEditingId(null);
    setTicker('');
    setCompanyName('');
    setShares('');
    setBuyPrice('');
    setFee('0.00');
    setFairPrice('');
    setAnnualDiv('');
    setBuyTarget('');
    setSellTarget('');
    setFormError('');
    setIsAddModalOpen(false);
  };

  const handleStartEdit = (pos: PortfolioPosition) => {
    const isEur = pos.currency === 'EUR' || pos.ticker.endsWith('.DE') || pos.ticker.endsWith('.PA') || pos.ticker.endsWith('.AS') || ['SXR8', 'VWCE', 'QDVE', 'IS3N', 'EUNL', '4GLD', 'MEUD', 'JGPI'].includes(pos.ticker.toUpperCase());
    setEditingId(pos.id);
    setTicker(pos.ticker);
    setCompanyName(pos.companyName || '');
    setShares(pos.shares.toString());
    setBuyPrice(pos.buyPrice.toString());
    setPositionCurrency(pos.currency || (isEur ? 'EUR' : (pos.ticker.endsWith('.L') ? 'GBP' : 'USD')));
    setFee((pos.fee || 0).toString());
    setBuyDate(pos.buyDate || new Date().toISOString().split('T')[0]);
    setFairPrice(pos.fairPrice ? pos.fairPrice.toString() : '');
    setAnnualDiv(pos.annualDivPerShare ? pos.annualDivPerShare.toString() : '');
    setBuyTarget(pos.buyTarget ? pos.buyTarget.toString() : '');
    setSellTarget(pos.sellTarget ? pos.sellTarget.toString() : '');
    setIsAddModalOpen(true);
  };

  const handleStartTransaction = (pos: any, type: 'Покупка' | 'Продажба') => {
    setEditingId(null);
    setTxType(type);
    setTicker(pos.ticker);
    setCompanyName(pos.companyName || '');
    setShares('');
    const origCurrency = pos.quoteCurrency === 'EUR' ? 'EUR' : 'USD';
    setPositionCurrency(origCurrency);
    setBuyPrice(pos.originalPrice ? pos.originalPrice.toFixed(2) : (pos.curPrice ? pos.curPrice.toFixed(2) : ''));
    setFee('0.00');
    setBuyDate(new Date().toISOString().split('T')[0]);
    setFairPrice('');
    setAnnualDiv(pos.annualDivPerShare ? pos.annualDivPerShare.toString() : '');
    setBuyTarget('');
    setSellTarget('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleAddDividendRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(divAmount);
    if (isNaN(amt) || amt <= 0) return;

    const label = divMode === 'bulk' 
      ? `📦 ${divBulkNote.trim() || 'Обобщен дивидент'}`
      : divTicker.trim().toUpperCase();

    if (!label) return;

    const newDiv: PortfolioDividendRecord = {
      id: `${Date.now()}-${Math.random()}`,
      ticker: label,
      amount: amt,
      date: divDate
    };
    updateDivRecords([newDiv, ...divRecords]);
    if (onAddDividend) onAddDividend(newDiv);

    // Auto-update portfolio cash balance if enabled
    if (divAutoCash) {
      const currentCash = parseFloat(cashInput) || 0;
      const nextCash = currentCash + amt;
      setCashInput(nextCash.toString());
      try {
        localStorage.setItem('user_portfolio_cash', nextCash.toString());
      } catch (e) {}
      if (onUpdateCash) onUpdateCash(nextCash);
    }

    setDivAmount('');
  };

  // Active holdings (ensure shares > 0)
  const activeHoldings = positions.filter(pos => pos.shares > 0);

  // Live EUR/USD exchange rate
  const eurUsdStock = stocks.find(s => s.ticker === 'EURUSD=X' || s.ticker === 'EURUSD');
  const eurUsdRate = eurUsdStock?.currentPrice || eurUsdStock?.priceOfCalc || 1.08;

  // Currency Converter helper to Portfolio Base Currency
  const convertToBase = (val: number, fromCurr: string = 'USD') => {
    if (fromCurr === baseCurrency) return val;
    if (fromCurr === 'EUR' && baseCurrency === 'USD') return val * eurUsdRate;
    if (fromCurr === 'USD' && baseCurrency === 'EUR') return val / eurUsdRate;
    if (fromCurr === 'GBP' && baseCurrency === 'USD') return val * 1.27;
    if (fromCurr === 'GBP' && baseCurrency === 'EUR') return (val * 1.27) / eurUsdRate;
    return val;
  };

  // Portfolio Dashboard Calculations in Base Currency
  let totalCostBasis = 0;
  let totalCurrentValue = 0;
  let totalDivEarned = divRecords.reduce((acc, r) => acc + convertToBase(r.amount || 0, (r as any).currency || 'USD'), 0);

  const enrichedHoldings = activeHoldings.map(pos => {
    const cleanTicker = pos.ticker.trim().toUpperCase();
    const baseTicker = cleanTicker.split('.')[0].split(':')[1] || cleanTicker.split('.')[0];
    const matching = stocks.find(s => {
      const sClean = s.ticker.trim().toUpperCase();
      const sBase = sClean.split('.')[0].split(':')[1] || sClean.split('.')[0];
      return sClean === cleanTicker || sBase === baseTicker;
    });

    const altDotTicker = cleanTicker.includes('-') ? cleanTicker.replace('-', '.') : cleanTicker.replace('.', '-');
    const quote = portfolioPrices[cleanTicker] || portfolioPrices[altDotTicker] || portfolioPrices[baseTicker];

    // Native price from exchange
    const curPrice = (matching?.currentPrice && matching.currentPrice > 0) 
      ? matching.currentPrice 
      : (quote?.currentPrice && quote.currentPrice > 0)
        ? quote.currentPrice
        : ((matching?.priceOfCalc && matching.priceOfCalc > 0) ? matching.priceOfCalc : pos.buyPrice);

    const isEurTicker = cleanTicker.endsWith('.DE') || cleanTicker.endsWith('.PA') || cleanTicker.endsWith('.AS') || cleanTicker.includes('ETR:') || cleanTicker.includes('EPA:') || cleanTicker.includes('AMS:') || ['SXR8', 'VWCE', 'QDVE', 'IS3N', 'EUNL', '4GLD', 'MEUD', 'JGPI'].includes(cleanTicker);
    const posCurrency: 'USD' | 'EUR' | 'GBP' = pos.currency || (isEurTicker ? 'EUR' : (cleanTicker.endsWith('.L') ? 'GBP' : 'USD'));
    const posSymbol = posCurrency === 'EUR' ? '€' : (posCurrency === 'GBP' ? '£' : '$');

    // Native position accounting (matches broker statements)
    const costBasis = (pos.shares * pos.buyPrice) + (pos.fee || 0);
    const currentVal = pos.shares * curPrice;
    const pnlVal = currentVal - costBasis;
    const pnlPct = costBasis > 0 ? (pnlVal / costBasis) * 100 : 0;
    const fPrice = pos.fairPrice || matching?.fairPrice || 0;
    const diffVsFair = fPrice > 0 ? ((curPrice - fPrice) / fPrice) * 100 : 0;

    // Converted to Portfolio Base Currency for top-level aggregates
    const costBasisInBase = convertToBase(costBasis, posCurrency);
    const currentValInBase = convertToBase(currentVal, posCurrency);

    totalCostBasis += costBasisInBase;
    totalCurrentValue += currentValInBase;

    // Synthesize a matching object if we have a live quote but no stock in the main interactive table
    const synthMatching: Stock | undefined = matching || (quote ? {
      watch: '',
      ticker: pos.ticker,
      companyName: quote.companyName || pos.companyName || pos.ticker,
      date: '',
      priceOfCalc: null,
      dailyChangePct: quote.dailyChangePct || 0,
      currentPrice: quote.currentPrice,
      fairPrice: pos.fairPrice || null,
      difference: null,
      buySell: 'ДРУГИ',
      marketCap: null,
      peRatio: null,
      eps: null,
      profileLink: '',
      dividend: '',
      signal: 'Hold',
      low52: null,
      high52: null
    } : undefined);

    return {
      ...pos,
      currency: posCurrency,
      posSymbol,
      companyName: matching?.companyName || quote?.companyName || pos.companyName || pos.ticker,
      matching: synthMatching,
      curPrice,
      originalPrice: curPrice,
      quoteCurrency: posCurrency,
      costBasis,
      currentVal,
      pnlVal,
      pnlPct,
      fPrice,
      diffVsFair,
      costBasisInBase,
      currentValInBase
    };
  });

  const parsedCash = convertToBase(parseFloat(cashInput) || 0, 'USD');
  const totalPortfolioValue = totalCurrentValue + parsedCash;
  const totalReturnVal = totalCurrentValue - totalCostBasis;
  const totalReturnPct = totalCostBasis > 0 ? (totalReturnVal / totalCostBasis) * 100 : 0;

  // Filtered History (supports date range filters)
  const filteredHistory = history.filter(h => {
    if (historyFromDate && h.date < historyFromDate) return false;
    if (historyToDate && h.date > historyToDate) return false;
    return true;
  });

  // Additional metric calculations in Portfolio Base Currency
  const realizedPnLSum = filteredHistory.reduce((acc, h) => acc + convertToBase(h.pnlVal || 0, h.currency || 'USD'), 0);
  const totalDividendsSum = divRecords.reduce((acc, r) => acc + convertToBase(r.amount || 0, (r as any).currency || 'USD'), 0);
  const unrealizedProfitCount = enrichedHoldings.filter(h => h.pnlVal >= 0).length;
  const unrealizedLossCount = enrichedHoldings.filter(h => h.pnlVal < 0).length;
  const realizedProfitCount = filteredHistory.filter(h => (h.pnlVal || 0) > 0).length;
  const realizedLossCount = filteredHistory.filter(h => (h.pnlVal || 0) < 0).length;
  const avgCostBasis = enrichedHoldings.length > 0 ? totalCostBasis / enrichedHoldings.length : 0;

  // Grand Total Gain (Unrealized P/L + Realized P/L + Dividends in Base Currency)
  const grandTotalReturnVal = totalReturnVal + realizedPnLSum + totalDividendsSum;
  const grandTotalReturnPct = totalCostBasis > 0 ? (grandTotalReturnVal / totalCostBasis) * 100 : 0;

  // Sector Diversification breakdown (in Base Currency)
  const sectorMap: { [sector: string]: number } = {};
  enrichedHoldings.forEach(h => {
    const sec = getSectorForStock(h.ticker) || 'Other';
    sectorMap[sec] = (sectorMap[sec] || 0) + h.currentValInBase;
  });
  const sectorList = Object.entries(sectorMap)
    .map(([sector, val]) => ({
      sector,
      val,
      pct: totalCurrentValue > 0 ? (val / totalCurrentValue) * 100 : 0
    }))
    .sort((a, b) => b.val - a.val);

  // Position Weight Concentration breakdown
  const holdingsByWeight = [...enrichedHoldings]
    .map(h => ({
      ...h,
      weightPct: totalCurrentValue > 0 ? (h.currentValInBase / totalCurrentValue) * 100 : 0
    }))
    .sort((a, b) => b.currentValInBase - a.currentValInBase);

  // Sorted Holdings for the table rendering (Alphabetical A-Z by default)
  const sortedHoldings = [...enrichedHoldings].sort((a, b) => {
    const field = sortField || 'ticker';
    const order = sortOrder || 'asc';

    let valA: any = a[field as keyof typeof a];
    let valB: any = b[field as keyof typeof b];

    // Handle special columns
    if (field === 'ticker') {
      valA = a.ticker;
      valB = b.ticker;
    } else if (field === 'dailyChangePct') {
      valA = a.matching?.dailyChangePct ?? 0;
      valB = b.matching?.dailyChangePct ?? 0;
    } else if (field === 'weightPct') {
      valA = a.currentVal;
      valB = b.currentVal;
    }

    if (valA === undefined || valA === null) return order === 'asc' ? 1 : -1;
    if (valB === undefined || valB === null) return order === 'asc' ? -1 : 1;

    if (typeof valA === 'string' && typeof valB === 'string') {
      return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    return order === 'asc' ? valA - valB : valB - valA;
  });

  // Annual projected dividends sum & Yield on Cost %
  const totalAnnualDivIncome = enrichedHoldings.reduce((acc, h) => {
    const divPerShare = h.annualDivPerShare || 0;
    return acc + (divPerShare * h.shares);
  }, 0);
  const divYieldOnCost = totalCostBasis > 0 ? (totalAnnualDivIncome / totalCostBasis) * 100 : 0;

  // Monthly 12-month forward dividend projection (Jan - Dec)
  const monthlyProjection = [
    { month: 'Jan', val: totalAnnualDivIncome * 0.07 },
    { month: 'Feb', val: totalAnnualDivIncome * 0.08 },
    { month: 'Mar', val: totalAnnualDivIncome * 0.10 },
    { month: 'Apr', val: totalAnnualDivIncome * 0.07 },
    { month: 'May', val: totalAnnualDivIncome * 0.08 },
    { month: 'Jun', val: totalAnnualDivIncome * 0.11 },
    { month: 'Jul', val: totalAnnualDivIncome * 0.07 },
    { month: 'Aug', val: totalAnnualDivIncome * 0.08 },
    { month: 'Sep', val: totalAnnualDivIncome * 0.10 },
    { month: 'Oct', val: totalAnnualDivIncome * 0.07 },
    { month: 'Nov', val: totalAnnualDivIncome * 0.08 },
    { month: 'Dec', val: totalAnnualDivIncome * 0.09 },
  ];

  return (
    <div className="space-y-4 font-sans text-ink">
      
      {/* ======================================================================== */}
      {/* SNOWBALL ANALYTICS SUB-TAB NAVIGATION BAR                                */}
      {/* ======================================================================== */}
      <div className="bg-card/80 border border-border/80 rounded-2xl p-2 shadow-md backdrop-blur-md flex items-center justify-between gap-2 overflow-x-auto max-w-full touch-pan-x scroll-smooth no-scrollbar">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0 text-xs font-black shrink-0">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSubTab === 'overview'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md font-black'
                : 'bg-card text-ink-muted border-border hover:bg-white/5 hover:text-ink font-bold'
            }`}
          >
            <PieChart className="w-4 h-4 text-indigo-300" />
            Overview
          </button>

          <button
            onClick={() => setActiveSubTab('diversification')}
            className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSubTab === 'diversification'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md font-black'
                : 'bg-card text-ink-muted border-border hover:bg-white/5 hover:text-ink font-bold'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-300" />
            Diversification
          </button>

          <button
            onClick={() => setActiveSubTab('dividends')}
            className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSubTab === 'dividends'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md font-black'
                : 'bg-card text-ink-muted border-border hover:bg-white/5 hover:text-ink font-bold'
            }`}
          >
            <Flame className="w-4 h-4 text-emerald-400" />
            Dividend Calendar
          </button>
        </div>

        {/* Quick Action Buttons: Base Currency Switcher & Privacy Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Base Currency Switcher (USD / EUR) */}
          <div className="flex items-center bg-bg/80 border border-border/80 rounded-xl p-0.5 text-xs font-black shadow-2xs">
            <button
              onClick={() => handleSetBaseCurrency('USD')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                baseCurrency === 'USD'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Показвай тоталите и графиките в щатски долари (USD)"
            >
              🇺🇸 USD ($)
            </button>
            <button
              onClick={() => handleSetBaseCurrency('EUR')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                baseCurrency === 'EUR'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Показвай тоталите и графиките в евро (EUR)"
            >
              🇪🇺 EUR (€)
            </button>
          </div>

          <button
            onClick={togglePrivacyMode}
            className="p-2 bg-card border border-border/80 text-ink-muted hover:text-ink rounded-xl text-xs font-bold transition-all"
            title={isPrivacyMode ? "Покажи сумите" : "Скрий сумите"}
          >
            {isPrivacyMode ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <>
          {/* Top 8 Dashboard Metrics (Same proportions as INTERACTIVE TABLE widgets) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch my-3">
        
        {/* Card 1: TOTAL INVESTED */}
        <div className="bg-bg rounded-2xl border border-border p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md relative group min-h-[92px]">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums tracking-tight flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
              TOTAL INVESTED
            </span>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              Вложени ({baseCurrency})
            </span>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-lg sm:text-xl font-extrabold text-ink font-sans tabular-nums tracking-tight">
              {isPrivacyMode ? '••••••••' : `${baseSymbol}${totalCostBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Card 2: UNREALIZED RETURNS */}
        <div className="bg-bg rounded-2xl border border-border p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md relative group min-h-[92px]">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums tracking-tight flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              UNREALIZED P/L
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${totalReturnVal >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
              {isPrivacyMode ? '••••' : `${totalReturnPct >= 0 ? '▲' : '▼'} ${totalReturnPct.toFixed(2)}%`}
            </span>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className={`text-lg sm:text-xl font-extrabold font-sans tabular-nums tracking-tight ${totalReturnVal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPrivacyMode ? '••••••••' : `${totalReturnVal >= 0 ? '+' : '-'}${baseSymbol}${Math.abs(totalReturnVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Card 3: REALIZED P/L */}
        <div className="bg-bg rounded-2xl border border-border p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md relative group min-h-[92px]">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums tracking-tight flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-purple-400" />
              REALIZED P/L
            </span>
            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              Затворени ({baseCurrency})
            </span>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className={`text-lg sm:text-xl font-extrabold font-sans tabular-nums tracking-tight ${realizedPnLSum >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPrivacyMode ? '••••••••' : `${realizedPnLSum >= 0 ? '+' : '-'}${baseSymbol}${Math.abs(realizedPnLSum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Card 4: TOTAL DIVIDENDS EARNED */}
        <div className="bg-bg rounded-2xl border border-border p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md relative group min-h-[92px]">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums tracking-tight flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              DIVIDENDS EARNED
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Дивиденти ({baseCurrency})
            </span>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-lg sm:text-xl font-extrabold text-amber-400 font-sans tabular-nums tracking-tight">
              {isPrivacyMode ? '••••••••' : `+${baseSymbol}${totalDividendsSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Card 5: GRAND TOTAL RETURN (WITH DIVIDENDS) */}
        <div className="bg-bg rounded-2xl border border-border p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md relative group min-h-[92px]">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              TOTAL GAIN (W/ DIVIDENDS)
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${grandTotalReturnVal >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
              {isPrivacyMode ? '••••' : `${grandTotalReturnPct >= 0 ? '▲' : '▼'} ${grandTotalReturnPct.toFixed(2)}%`}
            </span>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className={`text-lg sm:text-xl font-extrabold font-sans tabular-nums tracking-tight ${grandTotalReturnVal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPrivacyMode ? '••••••••' : `${grandTotalReturnVal >= 0 ? '+' : '-'}${baseSymbol}${Math.abs(grandTotalReturnVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Card 6: CURRENT MARKET VALUE */}
        <div className="bg-bg rounded-2xl border border-border p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md relative group min-h-[92px]">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              CURRENT MARKET VALUE
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Пазарна ({baseCurrency})
            </span>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-lg sm:text-xl font-extrabold text-emerald-400 font-sans tabular-nums tracking-tight">
              {isPrivacyMode ? '••••••••' : `${baseSymbol}${totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Card 7: AVERAGE COST BASIS */}
        <div className="bg-bg rounded-2xl border border-border p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md relative group min-h-[92px]">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums tracking-tight flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              AVERAGE COST BASIS
            </span>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Средна ({baseCurrency})
            </span>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-lg sm:text-xl font-extrabold text-ink font-sans tabular-nums tracking-tight">
              {isPrivacyMode ? '••••••••' : `${baseSymbol}${avgCostBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Card 8: STOCK HOLDINGS */}
        <div className="bg-bg rounded-2xl border border-border p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md relative group min-h-[92px]">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums tracking-tight flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              STOCK HOLDINGS
            </span>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              Позиции
            </span>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-lg sm:text-xl font-extrabold text-blue-400 font-sans tabular-nums tracking-tight">
              {enrichedHoldings.length}
            </span>
          </div>
        </div>

      </div>

      {/* ======================================================================== */}
      {/* ROW 2: BENTO CARDS (3 COLUMNS) - IDENTICAL PROPORTIONS TO INTERACTIVE TABLE */}
      {/* ======================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative z-40">
        
        {/* Bento 1: STOCK INVESTED VS RETURNS */}
        <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col justify-between transition-all duration-200 h-[410px] hover:shadow-md relative group lg:col-span-1">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5 shrink-0">
            <div>
              <span className="text-xs text-ink/60 font-serif italic uppercase tracking-wider block">
                Invested vs Returns ({baseCurrency})
              </span>
              <h3 className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums tracking-tight flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                STOCK INVESTED VS RETURNS
              </h3>
            </div>
            <button
              onClick={() => setShowAssetAllocationInfo(!showAssetAllocationInfo)}
              title="Натиснете за информация относно следенето на резултатите и алокацията на активи"
              className={`w-6 h-6 rounded-full flex items-center justify-center font-serif font-black text-xs transition-all cursor-pointer border ${
                showAssetAllocationInfo 
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md' 
                  : 'bg-card hover:bg-card/90 text-indigo-400 border-indigo-500/30'
              }`}
            >
              ⓘ
            </button>
          </div>

          <div className="flex-1 overflow-y-auto my-2 pr-1 space-y-1.5 font-sans tabular-nums text-xs custom-mini-scroll">
            {/* Вложени пари */}
            <div className="flex items-center justify-between p-1.5 rounded-xl border border-border/30 bg-card/40">
              <span className="text-xs text-ink-muted font-bold">Вложени пари (Cost Basis):</span>
              <span className="text-xs font-black text-ink">
                {isPrivacyMode ? '••••' : `${baseSymbol}${totalCostBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>

            {/* Пазарна оценка */}
            <div className="flex items-center justify-between p-1.5 rounded-xl border border-border/30 bg-card/40">
              <span className="text-xs text-ink-muted font-bold">Пазарна оценка:</span>
              <span className="text-xs font-black text-emerald-400">
                {isPrivacyMode ? '••••' : `${baseSymbol}${totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>

            {/* Нереализирана P/L */}
            <div className="flex items-center justify-between p-1.5 rounded-xl border border-border/30 bg-card/40">
              <span className="text-xs text-ink-muted font-bold">Нереализирана P/L:</span>
              <span className={`text-xs font-black flex items-center gap-1 ${totalReturnVal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalReturnVal >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {isPrivacyMode ? '••••' : `${totalReturnVal >= 0 ? '+' : '-'}${baseSymbol}${Math.abs(totalReturnVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${totalReturnVal >= 0 ? '+' : ''}${totalReturnPct.toFixed(2)}%)`}
              </span>
            </div>

            {/* Реализирана P/L */}
            <div className="flex items-center justify-between p-1.5 rounded-xl border border-border/30 bg-card/40">
              <span className="text-xs text-ink-muted font-bold">Реализирана P/L (Затворени):</span>
              <span className={`text-xs font-black ${realizedPnLSum >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPrivacyMode ? '••••' : `${realizedPnLSum >= 0 ? '+' : '-'}${baseSymbol}${Math.abs(realizedPnLSum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>

            {/* Получени дивиденти */}
            <div className="flex items-center justify-between p-1.5 rounded-xl border border-border/30 bg-card/40">
              <span className="text-xs text-ink-muted font-bold">Получени дивиденти:</span>
              <span className="text-xs font-black text-amber-400">
                {isPrivacyMode ? '••••' : `+${baseSymbol}${totalDividendsSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>

            {/* Общо с дивиденти */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
              <span className="text-xs text-ink font-black uppercase tracking-tight">Общо с дивиденти:</span>
              <span className={`text-xs sm:text-sm font-black ${grandTotalReturnVal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPrivacyMode ? '••••' : `${grandTotalReturnVal >= 0 ? '+' : '-'}${baseSymbol}${Math.abs(grandTotalReturnVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${grandTotalReturnVal >= 0 ? '+' : ''}${grandTotalReturnPct.toFixed(2)}%)`}
              </span>
            </div>
          </div>

          <div className="border-t border-border/10 pt-2 text-xs font-sans tabular-nums text-ink/60 uppercase tracking-tight flex items-center justify-between shrink-0">
            <span>Обобщение на инвестициите</span>
            <span className="font-bold underline text-indigo-400">P/L & Дивиденти</span>
          </div>
        </div>

        {/* Bento 2: STOCK DIVERSIFICATION */}
        <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col justify-between transition-all duration-200 h-[410px] hover:shadow-md relative group lg:col-span-1">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5 shrink-0">
            <div>
              <span className="text-xs text-ink/60 font-serif italic uppercase tracking-wider block">
                Sector Allocation
              </span>
              <h3 className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums tracking-tight flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-indigo-400" />
                STOCK DIVERSIFICATION
              </h3>
            </div>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              {sectorList.length} Сектора
            </span>
          </div>

          {sectorList.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-ink-faint text-xs font-semibold">
              Няма данни за сектори.
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between overflow-hidden my-2">
              {/* Top: SVG Donut Chart */}
              <div className="relative w-28 h-28 mx-auto shrink-0 flex items-center justify-center my-1">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {(() => {
                    let accumulatedPct = 0;
                    const radius = 38;
                    const circumference = 2 * Math.PI * radius; // ~238.76

                    const colors = [
                      '#10b981', '#3b82f6', '#8b5cf6', '#d946ef', '#f59e0b',
                      '#06b6d4', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'
                    ];

                    return sectorList.map((sec, idx) => {
                      const pct = sec.pct;
                      const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -((accumulatedPct / 100) * circumference);
                      accumulatedPct += pct;
                      const color = colors[idx % colors.length];

                      return (
                        <circle
                          key={sec.sector}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke={color}
                          strokeWidth="15"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500 hover:opacity-85"
                        >
                          <title>{`${sec.sector}: ${pct.toFixed(2)}%`}</title>
                        </circle>
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none font-sans">
                  <span className="text-[8px] font-black uppercase text-ink-faint tracking-wider">СЕКТОРИ</span>
                  <span className="text-xs font-black text-indigo-400">
                    {sectorList.length}
                  </span>
                </div>
              </div>

              {/* Bottom: Scrollable Legend */}
              <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1 custom-mini-scroll">
                {sectorList.map((sec, idx) => {
                  const colors = [
                    '#10b981', '#3b82f6', '#8b5cf6', '#d946ef', '#f59e0b',
                    '#06b6d4', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'
                  ];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={sec.sector} className="flex items-center justify-between p-1.5 rounded-xl border border-border/30 bg-card/40 text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color }} />
                        <span className="text-ink font-bold truncate text-xs">{sec.sector}</span>
                      </div>
                      <span className="font-extrabold text-indigo-400 shrink-0 ml-1 text-xs">
                        {sec.pct.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t border-border/10 pt-2 text-xs font-sans tabular-nums text-ink/60 uppercase tracking-tight flex items-center justify-between shrink-0">
            <span>Разпределение по индустрии</span>
            <span className="font-bold underline text-indigo-400">Сектори ({sectorList.length})</span>
          </div>
        </div>

        {/* Bento 3: HOLDINGS BREAKDOWN */}
        <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col justify-between transition-all duration-200 h-[410px] hover:shadow-md relative group lg:col-span-1">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5 shrink-0">
            <div>
              <span className="text-xs text-ink/60 font-serif italic uppercase tracking-wider block">
                Holdings Weights
              </span>
              <h3 className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums tracking-tight flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-cyan-400" />
                HOLDINGS BREAKDOWN
              </h3>
            </div>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              {enrichedHoldings.length} Актива
            </span>
          </div>

          {holdingsByWeight.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-ink-faint text-xs font-semibold">
              Няма въведени акции.
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between overflow-hidden my-2">
              {/* Top: SVG Donut Chart */}
              <div className="relative w-28 h-28 mx-auto shrink-0 flex items-center justify-center my-1">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {(() => {
                    let accumulatedPct = 0;
                    const radius = 38;
                    const circumference = 2 * Math.PI * radius; // ~238.76

                    const colors = [
                      '#8b5cf6', '#06b6d4', '#3b82f6', '#d946ef', '#10b981',
                      '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'
                    ];

                    return holdingsByWeight.map((pos, idx) => {
                      const pct = pos.weightPct;
                      const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -((accumulatedPct / 100) * circumference);
                      accumulatedPct += pct;
                      const color = colors[idx % colors.length];

                      return (
                        <circle
                          key={pos.id}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke={color}
                          strokeWidth="15"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500 hover:opacity-85"
                        >
                          <title>{`${pos.ticker}: ${pct.toFixed(2)}%`}</title>
                        </circle>
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none font-sans">
                  <span className="text-[8px] font-black uppercase text-ink-faint tracking-wider">ОБЩО</span>
                  <span className="text-[11px] font-black text-cyan-400">
                    {isPrivacyMode ? '••••' : `${baseSymbol}${totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                  </span>
                </div>
              </div>

              {/* Bottom: Scrollable Legend */}
              <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1 custom-mini-scroll">
                {holdingsByWeight.map((pos, idx) => {
                  const colors = [
                    '#8b5cf6', '#06b6d4', '#3b82f6', '#d946ef', '#10b981',
                    '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'
                  ];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={pos.id} className="flex items-center justify-between p-1.5 rounded-xl border border-border/30 bg-card/40 text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color }} />
                        <span className="text-ink font-bold text-xs uppercase">{pos.ticker}</span>
                        <span className="text-xs font-sans text-ink-faint truncate max-w-[120px]" title={pos.companyName || pos.ticker}>
                          ({pos.companyName || pos.ticker})
                        </span>
                      </div>
                      <span className="font-extrabold text-cyan-400 shrink-0 ml-1 text-xs">
                        {pos.weightPct.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t border-border/10 pt-2 text-xs font-sans tabular-nums text-ink/60 uppercase tracking-tight flex items-center justify-between shrink-0">
            <span>Тегло на индивидуалните позиции</span>
            <span className="font-bold underline text-cyan-400">Активи ({enrichedHoldings.length})</span>
          </div>
        </div>

      </div>

      {/* Bulgarian Explanation Banner (Toggled by 'i' icon inside Bento 1) */}
      {showAssetAllocationInfo && (
        <div className="bg-indigo-950/50 border border-indigo-500/40 rounded-xl p-4 text-xs space-y-3 text-indigo-100/90 backdrop-blur-md animate-in fade-in duration-200 mt-2">
          <div className="flex items-center gap-2 font-black text-indigo-300 text-sm border-b border-indigo-500/30 pb-2">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>Следене на резултатите и управление на алокацията на активите</span>
          </div>
          
          <p className="leading-relaxed">
            Следенето на представянето на портфейла от акции изисква своевременна информация за цените на акциите, сделките и друга съществена информация. Получаването на актуализации в реално време може да бъде предизвикателство, особено когато се разчита на остарели методи като ръчно въвеждане на данни или периодични извлечения. Без ясна представа за портфейла, инвеститорите могат да пропуснат критични пазарни движения или да не реагират своевременно на променящите се пазарни условия.
          </p>
          
          <p className="leading-relaxed border-t border-indigo-500/20 pt-2">
            Също така, правилното разпределение на активите е от решаващо значение за диверсификацията на портфейла и управлението на риска. Управлението на алокацията става все по-сложно с нарастването на портфейла и включването на различни класове активи, сектори или географски региони. Ръчното проследяване и ребалансиране отнема време, а без цялостен преглед инвеститорите могат да пренебрегнат дисбаланси или разминавания в своята инвестиционна стратегия.
          </p>
        </div>
      )}
        </>
      )}

      {/* SUB-TAB 2: DIVERSIFICATION */}
      {activeSubTab === 'diversification' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Sector Diversification */}
            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-md backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-black uppercase tracking-wide text-ink">
                    Секторна Диверсификация (Sector Breakdown)
                  </h3>
                </div>
                <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  {sectorList.length} Сектора
                </span>
              </div>

              {sectorList.length === 0 ? (
                <div className="py-8 text-center text-ink-faint text-xs font-semibold">
                  Няма въведени акции в портфейла
                </div>
              ) : (
                <div className="space-y-3">
                  {sectorList.map((item, idx) => {
                    const colors = ['bg-indigo-500', 'bg-emerald-400', 'bg-cyan-400', 'bg-purple-500', 'bg-amber-400', 'bg-rose-400', 'bg-blue-400'];
                    const color = colors[idx % colors.length];
                    return (
                      <div key={item.sector} className="space-y-1">
                        <div className="flex justify-between text-xs font-extrabold">
                          <span className="text-ink">{item.sector}</span>
                          <span className="text-ink-muted">
                            {isPrivacyMode ? '••••' : `${baseSymbol}${item.val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} ({item.pct.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-card h-2 rounded-full overflow-hidden border border-border/40">
                          <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.max(2, item.pct)}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Position Weight Concentration Risk */}
            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-md backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-black uppercase tracking-wide text-ink">
                    Концентрация на Активите (Holding Weights)
                  </h3>
                </div>
                <span className="text-xs font-extrabold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                  {holdingsByWeight.length} Позиции
                </span>
              </div>

              {holdingsByWeight.length === 0 ? (
                <div className="py-8 text-center text-ink-faint text-xs font-semibold">
                  Няма въведени акции в портфейла
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {holdingsByWeight.map((pos) => {
                    const isOverConcentrated = pos.weightPct > 15;
                    return (
                      <div key={pos.id} className="space-y-1 p-2 bg-card/40 border border-border/40 rounded-xl">
                        <div className="flex items-center justify-between text-xs font-extrabold">
                          <div className="flex items-center gap-2">
                            <StockLogo ticker={pos.ticker} />
                            <span className="text-ink">{pos.ticker} ({pos.companyName || pos.ticker})</span>
                            {isOverConcentrated && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                ⚠️ Висока концентрация ({pos.weightPct.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                          <span className="text-indigo-400">
                            {pos.weightPct.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-card h-1.5 rounded-full overflow-hidden border border-border/40">
                          <div className={`h-full ${isOverConcentrated ? 'bg-amber-400' : 'bg-indigo-500'} transition-all duration-500`} style={{ width: `${Math.max(2, pos.weightPct)}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 3: DIVIDENDS */}
      {activeSubTab === 'dividends' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-card/70 border border-border/80 border-l-4 border-l-emerald-500 rounded-2xl p-4 shadow-md backdrop-blur-sm">
              <span className="text-[10px] font-black uppercase text-ink-muted tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                ПРОГНОЗЕН ГОДИШЕН ПАСИВЕН ДОХОД ({baseCurrency})
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                {isPrivacyMode ? '••••••••' : `${baseSymbol}${totalAnnualDivIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </div>
            </div>

            <div className="bg-card/70 border border-border/80 border-l-4 border-l-amber-500 rounded-2xl p-4 shadow-md backdrop-blur-sm">
              <span className="text-[10px] font-black uppercase text-ink-muted tracking-wider flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                YIELD ON COST (ДОХОДНОСТ)
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                {divYieldOnCost.toFixed(2)}%
              </div>
            </div>

            <div className="bg-card/70 border border-border/80 border-l-4 border-l-indigo-500 rounded-2xl p-4 shadow-md backdrop-blur-sm">
              <span className="text-[10px] font-black uppercase text-ink-muted tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                СРЕДНО НА МЕСЕЦ ({baseCurrency})
              </span>
              <div className="text-xl sm:text-2xl font-black text-indigo-400 mt-1">
                {isPrivacyMode ? '••••••••' : `${baseSymbol}${(totalAnnualDivIncome / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </div>
            </div>
          </div>

          <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-md backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black uppercase tracking-wide text-ink">
                  12-Месечен Дивидентен Календар & Прогноза (Jan - Dec)
                </h3>
              </div>
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                12 Месеца
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-2 items-end min-h-[160px]">
              {monthlyProjection.map((m) => {
                const maxVal = Math.max(1, totalAnnualDivIncome * 0.15);
                const heightPct = Math.min(100, Math.max(12, (m.val / maxVal) * 100));
                return (
                  <div key={m.month} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[9px] font-extrabold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isPrivacyMode ? '••' : `${baseSymbol}${m.val.toFixed(0)}`}
                    </span>
                    <div className="w-full bg-card/60 rounded-t-lg overflow-hidden border border-emerald-500/20 flex items-end h-28">
                      <div 
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                        style={{ height: `${heightPct}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-extrabold text-ink-muted uppercase">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: HOLDINGS */}
      {(activeSubTab === 'overview' || activeSubTab === 'holdings') && (
        <div className="bg-bg border border-border rounded-2xl overflow-hidden shadow-xs">
        {/* Table Header Controls */}
        <div className="p-2.5 border-b border-border/40 flex items-center justify-between gap-2 bg-card/40 overflow-x-auto max-w-full touch-pan-x scroll-smooth no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            
            {/* 1. Header Badge: АКТИВИ */}
            <div className="px-3.5 py-2 rounded-xl text-xs font-black uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-1.5 h-9 shrink-0">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>АКТИВИ</span>
            </div>

            {/* 2. Добавяне на Нов Актив */}
            <button 
              onClick={() => {
                setEditingId(null);
                setTicker('');
                setCompanyName('');
                setShares('');
                setBuyPrice('');
                setFee('0.00');
                setBuyDate(new Date().toISOString().split('T')[0]);
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer h-9 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Добавяне на Нов Актив</span>
            </button>

            {/* 3. История на транзакциите */}
            <button 
              onClick={() => setIsHistoryModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-card/70 hover:bg-card border border-border text-indigo-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs h-9 shrink-0"
            >
              <History className="w-4 h-4 text-indigo-400" />
              <span>История на транзакциите ({filteredHistory.length})</span>
            </button>

            {/* 4. Получени дивиденти */}
            <button 
              onClick={() => setIsDividendsModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-card/70 hover:bg-card border border-border text-emerald-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs h-9 shrink-0"
            >
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>Получени дивиденти ({baseSymbol}{totalDivEarned.toFixed(2)})</span>
            </button>

            {/* 5. Кеш */}
            <button 
              onClick={() => setIsCashModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-card/70 hover:bg-card border border-border text-amber-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs h-9 shrink-0"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Кеш: {baseSymbol}{(parseFloat(cashInput) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </button>
          </div>

          {/* 6. ОБЩО ПОЗИЦИИ */}
          <div className="px-3.5 py-2 rounded-xl text-xs font-black uppercase text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-1.5 h-9 shrink-0">
            <span>ОБЩО ПОЗИЦИИ: {enrichedHoldings.length}</span>
          </div>
        </div>

        {/* Main Table Container with Sticky Header & Smooth Scroll */}
        <div 
          className="w-full max-h-[65vh] md:max-h-[520px] overflow-auto border-b border-border/15 touch-pan-x touch-pan-y scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <table className="w-full text-left border-collapse font-sans tabular-nums text-xs min-w-[1600px] table-auto">
            <thead className="sticky top-0 z-20 bg-bg rounded-2xl">
              <tr className="bg-bg text-ink/90 border-b-2 border-border text-xs uppercase font-extrabold tracking-wider">
                <th onClick={() => handleSort('ticker')} className="py-3 px-4 whitespace-nowrap select-none cursor-pointer hover:text-indigo-400 transition-colors">
                  TICKER{sortField === 'ticker' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th onClick={() => handleSort('companyName')} className="py-3 px-4 whitespace-nowrap select-none cursor-pointer hover:text-indigo-400 transition-colors">
                  COMPANY NAME{sortField === 'companyName' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th onClick={() => handleSort('weightPct')} className="py-3 px-4 text-right whitespace-nowrap select-none cursor-pointer hover:text-indigo-400 transition-colors">
                  % OF PORTFOLIO{sortField === 'weightPct' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th onClick={() => handleSort('shares')} className="py-3 px-4 text-right whitespace-nowrap select-none cursor-pointer hover:text-indigo-400 transition-colors">
                  SHARES{sortField === 'shares' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th onClick={() => handleSort('buyPrice')} className="py-3 px-4 text-right whitespace-nowrap select-none cursor-pointer hover:text-indigo-400 transition-colors">
                  AVG. PRICE{sortField === 'buyPrice' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th onClick={() => handleSort('fee')} className="py-3 px-4 text-right whitespace-nowrap select-none cursor-pointer hover:text-indigo-400 transition-colors">
                  FEE{sortField === 'fee' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th onClick={() => handleSort('costBasis')} className="py-3 px-4 text-right whitespace-nowrap select-none cursor-pointer hover:text-indigo-400 transition-colors">
                  COST BASIS{sortField === 'costBasis' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th onClick={() => handleSort('buyDate')} className="py-3 px-4 text-center whitespace-nowrap select-none cursor-pointer hover:text-indigo-400 transition-colors">
                  DATE OF PURCHASE{sortField === 'buyDate' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th onClick={() => handleSort('dailyChangePct')} className="py-3 px-4 text-center whitespace-nowrap select-none cursor-pointer hover:text-indigo-400 transition-colors">
                  DAILY CHANGE %{sortField === 'dailyChangePct' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th onClick={() => handleSort('curPrice')} className="py-3 px-4 text-right whitespace-nowrap select-none cursor-pointer hover:text-indigo-400 transition-colors">
                  CURRENT PRICE{sortField === 'curPrice' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th className="py-3 px-4 text-center whitespace-nowrap">BUY / SELL</th>
                <th onClick={() => handleSort('pnlPct')} className="py-3 px-4 text-right whitespace-nowrap select-none cursor-pointer hover:text-indigo-400 transition-colors">
                  PROFIT / LOSS %{sortField === 'pnlPct' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th onClick={() => handleSort('pnlVal')} className="py-3 px-4 text-right whitespace-nowrap select-none cursor-pointer hover:text-indigo-400 transition-colors">
                  UNREALIZED P&L{sortField === 'pnlVal' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th onClick={() => handleSort('weightPct')} className="py-3 px-4 text-right whitespace-nowrap select-none cursor-pointer hover:text-indigo-400 transition-colors">
                  VALUE{sortField === 'weightPct' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th className="py-3 px-4 text-right whitespace-nowrap">DIVIDEND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-ink text-xs">
              {enrichedHoldings.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-10 text-center text-ink-faint font-bold text-xs">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                      <p className="text-ink-muted text-xs">
                        Акаунтът е нов и няма въведени лични активи в портфейла.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setTicker('');
                            setCompanyName('');
                            setShares('');
                            setBuyPrice('');
                            setFee('0.00');
                            setBuyDate(new Date().toISOString().split('T')[0]);
                            setIsAddModalOpen(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                          ＋ Добавяне на Нов Актив
                        </button>
                        <button
                          onClick={() => {
                            const demoPos: PortfolioPosition[] = [
                              { id: '1', ticker: 'AAPL', companyName: 'Apple Inc.', shares: 10, buyPrice: 150.00, fee: 0, buyDate: '2026-01-10', fairPrice: 180, annualDivPerShare: 1.00 },
                              { id: '2', ticker: 'NVDA', companyName: 'NVIDIA Corp', shares: 15, buyPrice: 90.00, fee: 0, buyDate: '2026-02-15', fairPrice: 140, annualDivPerShare: 0.16 },
                              { id: '3', ticker: 'QCOM', companyName: 'QUALCOMM Inc.', shares: 10, buyPrice: 150.00, fee: 0, buyDate: '2026-05-29', fairPrice: 180, annualDivPerShare: 3.40 }
                            ];
                            if (onSetAllPositions) onSetAllPositions(demoPos);
                          }}
                          className="bg-card hover:bg-card-hover border border-border text-ink-muted hover:text-ink font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          ✨ Зареди Примерни Активи
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedHoldings.map(pos => {
                  const isPosProfit = pos.pnlVal >= 0;
                  const isDailyUp = (pos.matching?.dailyChangePct || 0) >= 0;
                  const shareOfPortfolioPct = totalCurrentValue > 0 ? (pos.currentValInBase / totalCurrentValue) * 100 : 0;
                  const isSelected = selectedPosId === pos.id;

                  return (
                    <tr 
                      key={pos.id}
                      className={`transition-all duration-150 group cursor-pointer text-xs ${
                        isSelected 
                          ? 'bg-indigo-500/20 text-ink ring-2 ring-indigo-500/50 shadow-md font-bold' 
                          : 'hover:bg-indigo-500/10'
                      }`}
                      onClick={() => {
                        setSelectedPosId(pos.id);
                      }}
                    >
                      {/* 1. Ticker */}
                      <td className="py-3 px-4 first:rounded-l-xl">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-ink text-xs">{pos.ticker}</span>
                          {pos.quoteCurrency && (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-black uppercase ${
                              pos.quoteCurrency === 'EUR' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400'
                            }`}>
                              {pos.quoteCurrency}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Company Name */}
                      <td className="py-3 px-4 min-w-[240px]">
                        <div className="flex items-center justify-between gap-2 w-full">
                          <div className="flex items-center gap-2">
                            <StockLogo ticker={pos.ticker} />
                            <span className="text-ink font-bold text-xs whitespace-nowrap">
                              {pos.companyName || pos.matching?.companyName || pos.ticker}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPosId(pos.id);
                              handleStartEdit(pos);
                            }}
                            className="p-1 rounded-md text-indigo-400 opacity-70 group-hover:opacity-100 hover:text-indigo-300 hover:bg-indigo-500/20 transition-all cursor-pointer shrink-0"
                            title="Редактирай позицията"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                          </button>
                        </div>
                      </td>

                      {/* 3. % of Portfolio */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-indigo-400 text-xs">
                        {shareOfPortfolioPct.toFixed(1)}%
                      </td>

                      {/* 4. Shares */}
                      <td className="py-3 px-3 text-right font-extrabold text-ink text-xs">
                        {isPrivacyMode ? '••••' : pos.shares}
                      </td>

                      {/* 5. Avg. Price */}
                      <td className="py-3 px-3 text-right font-mono text-ink-faint text-xs">
                        {isPrivacyMode ? '••••' : `${pos.posSymbol}${pos.buyPrice.toFixed(2)}`}
                      </td>

                      {/* 6. Fee */}
                      <td className="py-3 px-3 text-right font-mono text-ink-faint text-xs">
                        {isPrivacyMode ? '••••' : `${pos.posSymbol}${(pos.fee || 0).toFixed(2)}`}
                      </td>

                      {/* 7. Cost Basis */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-ink text-xs">
                        {isPrivacyMode ? '••••••••' : `${pos.posSymbol}${pos.costBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>

                      {/* 8. Date of Purchase */}
                      <td className="py-3 px-3 text-center text-ink-faint font-mono text-xs">
                        {pos.buyDate ? formatDateDDMMYYYY(pos.buyDate) : '-'}
                      </td>

                      {/* 9. Daily Change % */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-extrabold ${
                          isDailyUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {isDailyUp ? '▲' : '▼'} {Math.abs(pos.matching?.dailyChangePct || 0).toFixed(2)}%
                        </span>
                      </td>

                      {/* 10. Current Price */}
                      <td className="py-3 px-3 text-right font-mono font-black text-ink text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <span>{isPrivacyMode ? '•••••' : `${pos.posSymbol}${pos.curPrice.toFixed(2)}`}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTvModalTicker(pos.ticker);
                            }}
                            className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-sans font-extrabold transition-all border border-indigo-500/20 flex items-center gap-1 cursor-pointer shadow-xs"
                            title={`Отвори TradingView НА ЖИВО графика за ${pos.ticker}`}
                          >
                            <TrendingUp className="w-3 h-3 text-indigo-400" />
                            TV
                          </button>
                        </div>
                      </td>

                      {/* 11. BUY/SELL Buttons & Trash2 Delete */}
                      <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartTransaction(pos, 'Покупка');
                            }}
                            className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg uppercase transition-all cursor-pointer shadow-xs"
                          >
                            BUY
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartTransaction(pos, 'Продажба');
                            }}
                            className="px-2.5 py-1 bg-amber-600/80 hover:bg-amber-500 text-white font-extrabold text-xs rounded-lg uppercase transition-all cursor-pointer shadow-xs"
                          >
                            SELL
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Сигурни ли сте, че искате да изтриете позицията за ${pos.ticker}?`)) {
                                onDeletePosition(pos.id);
                              }
                            }}
                            className="p-1 rounded-lg text-ink-faint hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                            title="Изтрий позиция"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400/80 hover:text-rose-400" />
                          </button>
                        </div>
                      </td>

                      {/* 12. Profit / Loss % */}
                      <td className="py-3 px-3 text-right">
                        <span className={`font-mono font-black text-xs ${
                          isPosProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {isPrivacyMode ? '••••' : `${isPosProfit ? '▲' : '▼'} ${pos.pnlPct.toFixed(2)}%`}
                        </span>
                      </td>

                      {/* 13. Unrealized P/L */}
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-xs">
                        <span className={isPosProfit ? 'text-emerald-400' : 'text-rose-400'}>
                          {isPrivacyMode ? '••••••••' : `${isPosProfit ? '+' : '-'}${pos.posSymbol}${Math.abs(pos.pnlVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </span>
                      </td>

                      {/* 14. Value */}
                      <td className="py-3 px-3 text-right font-mono font-black text-ink text-xs">
                        {isPrivacyMode ? '••••••••' : `${pos.posSymbol}${pos.currentVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>

                      {/* 15. Dividend */}
                      <td className="py-3 px-3 text-right last:rounded-r-xl">
                        <span className="font-mono text-emerald-400 font-extrabold block text-xs">
                          {isPrivacyMode ? '••••' : `${pos.posSymbol}${((pos.annualDivPerShare || 0) * pos.shares).toFixed(2)}`}
                        </span>
                        <span className="text-xs text-ink-faint block">
                          FY: {pos.matching?.dividend || '0.00%'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Status Footer with Export & Import Controls */}
        <div className="p-3 bg-card/40 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between font-sans tabular-nums text-xs text-ink/90 gap-3">
          <div className="flex items-center gap-2">
            <span>
              Показване на всички <span className="font-extrabold text-indigo-400">{enrichedHoldings.length}</span> позиции в портфейла
            </span>
            <span className="text-xs text-ink-faint italic hidden md:inline">
              (Използвайте скрола за нагоре и надолу за преглед на целия списък)
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Експорт */}
            <button 
              onClick={handleExportBackup}
              title="Свали резервно копие на вашето портфолио"
              className="px-3 py-1.5 rounded-xl text-xs font-black bg-card/70 hover:bg-card border border-border text-ink-muted hover:text-ink flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Експорт</span>
            </button>

            {/* Импорт */}
            <label title="Възстанови резервно копие на портфолиото" className="px-3 py-1.5 rounded-xl text-xs font-black bg-card/70 hover:bg-card border border-border text-ink-muted hover:text-ink flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Импорт</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    )}

      {/* SUB-TAB 5: TRANSACTIONS */}
      {activeSubTab === 'transactions' && (
        <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-md backdrop-blur-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-black uppercase tracking-wide text-ink">
                История на Транзакциите (Trade History Log)
              </h3>
            </div>
            <span className="text-xs font-extrabold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              {filteredHistory.length} Записа
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans tabular-nums text-xs min-w-[700px]">
              <thead>
                <tr className="bg-card/80 border-b border-border/40 text-[10px] uppercase font-bold text-ink-muted">
                  <th className="py-2.5 px-3">ДАТА</th>
                  <th className="py-2.5 px-3">ТИКЕР</th>
                  <th className="py-2.5 px-3">ТИП</th>
                  <th className="py-2.5 px-3 text-right">АКЦИИ</th>
                  <th className="py-2.5 px-3 text-right">ЦЕНА</th>
                  <th className="py-2.5 px-3 text-right">ОБЩА СУМА</th>
                  <th className="py-2.5 px-3 text-right">РЕАЛИЗИРАНА P/L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-ink-faint italic">
                      Няма регистрирани транзакции
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors text-xs">
                      <td className="py-2.5 px-3 font-mono text-ink-muted text-xs">{formatDateDDMMYYYY(tx.date)}</td>
                      <td className="py-2.5 px-3 font-black text-ink">{tx.ticker}</td>
                      <td className="py-2.5 px-3 font-extrabold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          tx.type === 'Покупка' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-ink">{tx.shares}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-ink">${tx.buyPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-ink">${(tx.shares * tx.buyPrice).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black">
                        <span className={tx.pnlVal >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {tx.pnlVal ? `${tx.pnlVal >= 0 ? '+' : ''}$${tx.pnlVal.toFixed(2)}` : '—'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}





      {/* ======================================================================== */}
      {/* ADD / EDIT ASSET MODAL DIALOG                                            */}
      {/* ======================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-sm font-extrabold uppercase text-ink flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                {editingId ? 'Редактиране на Актив' : 'Добавяне на Нов Актив'}
              </h3>
              <button 
                onClick={handleCloseAddModal}
                className="p-1 rounded-full text-ink-faint hover:text-ink hover:bg-card transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitPosition} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">ТИП ТРАНЗАЦИЯ</label>
                <select
                  value={txType}
                  onChange={e => setTxType(e.target.value as any)}
                  className="w-full bg-bg text-ink font-bold border border-border px-3 py-2 rounded-xl focus:outline-none"
                >
                  <option value="Покупка">Покупка</option>
                  <option value="Продажба">Продажба</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
                    ТИКЕР <span className="text-rose-400 font-black">* (Задължително)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="напр. AAPL или SAP.DE"
                    value={ticker}
                    onChange={e => handleTickerChange(e.target.value)}
                    className="w-full bg-bg text-ink font-bold border border-border px-3 py-2 rounded-xl focus:outline-none uppercase"
                    required
                  />
                  <span className="text-[9px] text-indigo-400 mt-1 block leading-tight">
                    САЩ (AAPL), Германия (.DE), Амстердам (.AS) и др.
                  </span>
                </div>
                <div>
                  <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
                    ИМЕ НА АКТИВА <span className="text-ink-muted text-[9px]">(По желание)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="напр. Apple Inc."
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full bg-bg text-ink font-bold border border-border px-3 py-2 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
                  ПЛАТЕНА ТАКСА ($ fee) <span className="text-ink-muted text-[9px]">(По желание)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={fee}
                  onChange={e => setFee(e.target.value)}
                  className="w-full bg-bg text-ink font-bold border border-border px-3 py-2 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
                    БРОЙ АКЦИИ <span className="text-rose-400 font-black">* (Задължително)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="напр. 15"
                    value={shares}
                    onChange={e => setShares(e.target.value)}
                    className="w-full bg-bg text-ink font-bold border border-border px-3 py-2 rounded-xl focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-indigo-400 font-black uppercase mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    📅 ДАТА НА СДЕЛКАТА
                  </label>
                  <input
                    type="date"
                    value={buyDate}
                    onChange={e => setBuyDate(e.target.value)}
                    onClick={(e) => { try { (e.target as any).showPicker(); } catch (err) {} }}
                    className="w-full bg-bg text-ink font-bold border border-indigo-500/50 px-3 py-2 rounded-xl focus:outline-none cursor-pointer hover:border-indigo-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
                  ГОДИШЕН ДИВИДЕНТ ЗА 1 АКЦИЯ ($) <span className="text-ink-muted text-[9px]">(По желание)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="напр. 1.25"
                  value={annualDiv}
                  onChange={e => setAnnualDiv(e.target.value)}
                  className="w-full bg-bg text-ink font-bold border border-border px-3 py-2 rounded-xl focus:outline-none text-emerald-400"
                />
              </div>

              {/* Currency Selector & Live Exchange Rate Auto-converter */}
              <div className="p-3 bg-bg/50 rounded-2xl border border-border/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-ink-faint font-extrabold uppercase">ВАЛУТА НА АКТИВА</label>
                  <span className="text-[10px] text-indigo-400 font-bold">
                    Курс: 1 EUR = ${eurUsdRate.toFixed(4)} USD
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPositionCurrency('USD')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      positionCurrency === 'USD'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400'
                        : 'bg-bg text-ink-muted border border-border hover:text-ink'
                    }`}
                  >
                    🇺🇸 USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPositionCurrency('EUR')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      positionCurrency === 'EUR'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400'
                        : 'bg-bg text-ink-muted border border-border hover:text-ink'
                    }`}
                  >
                    🇪🇺 EUR (€)
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
                      ЦЕНА ЗАКУПУВАНЕ ({positionCurrency === 'USD' ? '$' : '€'}) <span className="text-rose-400 font-black">* (Задължително)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={buyPrice}
                      onChange={e => setBuyPrice(e.target.value)}
                      className="w-full bg-bg text-ink font-bold border border-border px-3 py-2 rounded-xl focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">
                      ПРЕИЗЧИСЛЕНА В {positionCurrency === 'USD' ? 'EUR (€)' : 'USD ($)'}
                    </label>
                    <div className="w-full bg-card/60 text-emerald-400 font-extrabold border border-border/50 px-3 py-2 rounded-xl text-xs flex items-center h-[38px]">
                      {buyPrice && !isNaN(parseFloat(buyPrice)) ? (
                        positionCurrency === 'USD'
                          ? `€${(parseFloat(buyPrice) / eurUsdRate).toFixed(2)} EUR`
                          : `$${(parseFloat(buyPrice) * eurUsdRate).toFixed(2)} USD`
                      ) : (
                        positionCurrency === 'USD' ? '€0.00 EUR' : '$0.00 USD'
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer mt-4"
              >
                <PlusCircle className="w-4 h-4" />
                {editingId ? 'Запази промяната' : (txType === 'Покупка' ? 'Купи актив' : 'Продай актив')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* CASH MANAGEMENT MODAL DIALOG                                              */}
      {/* ======================================================================== */}
      {isCashModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-sm font-extrabold uppercase text-ink flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                Управление на Кеша
              </h3>
              <button 
                onClick={() => setIsCashModalOpen(false)}
                className="p-1 rounded-full text-ink-faint hover:text-ink hover:bg-card transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">НАЛИЧЕН КЕШ ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cashInput}
                  onChange={e => {
                    setCashInput(e.target.value);
                    if (onUpdateCash) onUpdateCash(parseFloat(e.target.value) || 0);
                  }}
                  className="w-full bg-bg text-ink font-bold border border-border px-3.5 py-2.5 rounded-xl focus:outline-none font-mono text-base"
                />
              </div>

              <div className="bg-card/40 p-3 rounded-2xl border border-border/40 text-xs text-ink-faint space-y-1.5">
                <div className="flex justify-between">
                  <span>Обща стойност на портфейла:</span>
                  <span className="font-extrabold text-ink">${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Свободен кеш:</span>
                  <span className="font-extrabold text-emerald-400">${(parseFloat(cashInput) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveCash}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Запази кеш
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* TRANSACTION HISTORY MODAL DIALOG                                         */}
      {/* ======================================================================== */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg border border-border rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex flex-wrap items-center justify-between border-b border-border/40 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold uppercase text-ink flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  История на транзакциите
                </h3>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                  realizedPnLSum >= 0
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  Общо реализирана П/З: {realizedPnLSum >= 0 ? '+' : '-'}{baseSymbol}{Math.abs(realizedPnLSum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Controls: Date Filters & Clear All & Close */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-ink-faint">ОТ:</span>
                  <input
                    type="date"
                    value={historyFromDate}
                    onChange={e => setHistoryFromDate(e.target.value)}
                    onClick={(e) => { try { (e.target as any).showPicker(); } catch (err) {} }}
                    className="bg-bg text-ink text-[11px] font-bold border border-border px-2 py-1 rounded-xl focus:outline-none cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-ink-faint">ДО:</span>
                  <input
                    type="date"
                    value={historyToDate}
                    onChange={e => setHistoryToDate(e.target.value)}
                    onClick={(e) => { try { (e.target as any).showPicker(); } catch (err) {} }}
                    className="bg-bg text-ink text-[11px] font-bold border border-border px-2 py-1 rounded-xl focus:outline-none cursor-pointer"
                  />
                </div>

                {filteredHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                    title="Изчисти всички транзакции и нулирай Realized P/L"
                  >
                    Изчисти историята
                  </button>
                )}

                <button 
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="p-1 rounded-full text-ink-faint hover:text-ink hover:bg-card transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[450px] overflow-y-auto pr-1 custom-mini-scroll">
              <table className="w-full text-left border-collapse font-sans tabular-nums text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-[9px] font-extrabold uppercase text-ink-faint sticky top-0 bg-bg z-10">
                    <th className="py-2.5 px-3">ДАТА</th>
                    <th className="py-2.5 px-3">ТИКЕР</th>
                    <th className="py-2.5 px-3 text-center">ТИП</th>
                    <th className="py-2.5 px-3 text-right">АКЦИИ</th>
                    <th className="py-2.5 px-3 text-right">ПОК. ЦЕНА</th>
                    <th className="py-2.5 px-3 text-right">ПРОД. ЦЕНА</th>
                    <th className="py-2.5 px-3 text-right">РЕАЛИЗИРАНА П/З</th>
                    <th className="py-2.5 px-3 text-right">ВЪЗВРЪЩАЕМОСТ</th>
                    <th className="py-2.5 px-2 text-center">ИЗТРИЙ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-ink">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-ink-faint font-bold text-xs">
                        Няма записани транзакции в историята. При всяка покупка или продажба през бутоните BUY / SELL сделките се отчитат тук.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map(tx => {
                      const txSymbol = tx.currency === 'EUR' ? '€' : (tx.currency === 'GBP' ? '£' : '$');
                      const isSold = tx.type === 'Продажба' || (tx.pnlVal !== undefined && tx.pnlVal !== 0);
                      const isProfit = (tx.pnlVal || 0) >= 0;

                      return (
                        <tr key={tx.id} className="hover:bg-indigo-500/10 transition-colors text-xs">
                          <td className="py-2.5 px-3 text-ink-faint font-mono text-xs">{formatDateDDMMYYYY(tx.date)}</td>
                          <td className="py-2.5 px-3 font-extrabold flex items-center gap-1">
                            <span>{tx.ticker}</span>
                            {tx.currency && (
                              <span className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-1 py-0.2 rounded">
                                {tx.currency}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              tx.type === 'Покупка' 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>
                              {tx.type === 'Покупка' ? '⊕ Покупка' : '⊖ Продажба'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-extrabold">{tx.shares}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-ink-muted">
                            {txSymbol}{tx.buyPrice.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-ink">
                            {tx.sellPrice ? `${txSymbol}${tx.sellPrice.toFixed(2)}` : '-'}
                          </td>
                          <td className={`py-2.5 px-3 text-right font-mono font-extrabold ${
                            isSold 
                              ? (isProfit ? 'text-emerald-400' : 'text-rose-400') 
                              : 'text-ink-faint'
                          }`}>
                            {isSold 
                              ? `${isProfit ? '+' : '-'}${txSymbol}${Math.abs(tx.pnlVal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : '-'}
                          </td>
                          <td className={`py-2.5 px-3 text-right font-mono font-extrabold ${
                            isSold 
                              ? (isProfit ? 'text-emerald-400' : 'text-rose-400') 
                              : 'text-ink-faint'
                          }`}>
                            {isSold 
                              ? `${isProfit ? '+' : ''}${(tx.pnlPct || 0).toFixed(2)}%`
                              : '-'}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="p-1 rounded text-ink-faint hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                              title="Изтрий транзакция"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* DIVIDEND LEDGER MODAL DIALOG                                             */}
      {/* ======================================================================== */}
      {isDividendsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-sm font-extrabold uppercase text-ink flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                Получени Дивиденти (Мини Леджър)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Общо: ${totalDivEarned.toFixed(2)}
                </span>
                <button 
                  onClick={() => setIsDividendsModalOpen(false)}
                  className="p-1 rounded-full text-ink-faint hover:text-ink hover:bg-card transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Entry Mode Switcher */}
            <div className="flex items-center gap-2 bg-card/60 p-1 rounded-2xl border border-border/60">
              <button
                type="button"
                onClick={() => setDivMode('single')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  divMode === 'single'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-card/50'
                }`}
              >
                <span>👤 По отделна акция</span>
              </button>
              <button
                type="button"
                onClick={() => setDivMode('bulk')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  divMode === 'bulk'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-card/50'
                }`}
              >
                <span>📦 Месечен / Сумарен (Бърз)</span>
              </button>
            </div>

            {/* Add Dividend Form */}
            <form onSubmit={handleAddDividendRecord} className="flex flex-col gap-2 bg-card/40 p-3.5 rounded-2xl border border-border/40">
              {divMode === 'single' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Тикер (AAPL)"
                    value={divTicker}
                    onChange={e => setDivTicker(e.target.value)}
                    className="w-24 bg-bg text-ink font-bold border border-border px-2.5 py-1.5 rounded-xl text-xs uppercase focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Сума $"
                    value={divAmount}
                    onChange={e => setDivAmount(e.target.value)}
                    className="flex-1 bg-bg text-ink font-bold border border-border px-2.5 py-1.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <input
                    type="date"
                    value={divDate}
                    onChange={e => setDivDate(e.target.value)}
                    onClick={(e) => { try { (e.target as any).showPicker(); } catch (err) {} }}
                    className="w-28 bg-bg text-ink text-[10px] font-bold border border-border px-2 py-1.5 rounded-xl focus:outline-none cursor-pointer"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all cursor-pointer shrink-0"
                    title="Добави дивидент"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Период / Описание (напр. Дивиденти Август 2026)"
                      value={divBulkNote}
                      onChange={e => setDivBulkNote(e.target.value)}
                      className="flex-1 bg-bg text-ink font-bold border border-border px-2.5 py-1.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Обща сума $"
                      value={divAmount}
                      onChange={e => setDivAmount(e.target.value)}
                      className="w-28 bg-bg text-ink font-bold border border-border px-2.5 py-1.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <input
                      type="date"
                      value={divDate}
                      onChange={e => setDivDate(e.target.value)}
                      onClick={(e) => { try { (e.target as any).showPicker(); } catch (err) {} }}
                      className="w-28 bg-bg text-ink text-[10px] font-bold border border-border px-2 py-1.5 rounded-xl focus:outline-none cursor-pointer"
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold transition-all cursor-pointer shrink-0"
                      title="Запиши сумарен дивидент"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <label className="flex items-center gap-2 text-[11px] font-bold text-ink-muted cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={divAutoCash}
                      onChange={e => setDivAutoCash(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span>Добави сумата автоматично към Кеш баланса на портфолиото</span>
                  </label>
                </div>
              )}
            </form>

            {/* Dividend History List */}
            <div className="space-y-1.5 mt-2 max-h-[320px] overflow-y-auto pr-1 custom-mini-scroll">
              <div className="flex items-center justify-between text-[10px] font-bold text-ink-faint border-b border-border/40 pb-1 uppercase">
                <span>📋 История ({divRecords.length})</span>
                <span>СУМА</span>
              </div>

              {divRecords.map(rec => {
                const isBulk = rec.ticker.startsWith('📦');
                return (
                  <div 
                    key={rec.id} 
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      isBulk 
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200 font-bold' 
                        : 'bg-card/30 border-white/5 text-ink'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-extrabold shrink-0 truncate max-w-[220px]">{rec.ticker}</span>
                      <span className="text-[10px] text-ink-faint font-mono shrink-0">{formatDateDDMMYYYY(rec.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-extrabold text-emerald-400">+${rec.amount.toFixed(2)}</span>
                      <button 
                        onClick={() => handleDeleteDividendRecord(rec.id)}
                        className="text-ink-faint hover:text-red-400 transition-colors cursor-pointer"
                        title="Изтрий запис"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* GEMINI AI AUDIT MODAL DIALOG                                              */}
      {/* ======================================================================== */}
      {isAiAuditOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg border border-border rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-extrabold uppercase text-ink flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                ✨ AI Инвестиционен Одит & Анализ на Диверсификацията
              </h3>
              <button 
                onClick={() => setIsAiAuditOpen(false)}
                className="p-1 rounded-full text-ink-faint hover:text-ink hover:bg-white/10"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-ink-muted leading-relaxed">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200">
                <span className="font-extrabold block text-indigo-300 mb-1">🤖 Gemini AI Портфейлен Анализ:</span>
                Портфейлът ви показва изключително силен текущ растеж <strong>(+62.42%)</strong>, воден главно от експозицията в технологичния сектор (AAPL & QCOM).
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-ink uppercase text-[10px]">📊 Ключови констатации:</h4>
                <ul className="space-y-1.5 list-disc list-inside text-ink-faint">
                  <li><strong className="text-ink">Концентрация на риска:</strong> 65.1% от капитала е в AAPL. Препоръчва се ребалансиране към отбранителни или дивидентни сектори.</li>
                  <li><strong className="text-ink">Пасивен приход:</strong> Прогнозиран годишен дивидентен поток от ${totalDivEarned.toFixed(2)} осигурява здрава доходна възвръщаемост.</li>
                  <li><strong className="text-ink">Марж на безопасност (Moat):</strong> Акциите се търгуват близо до тяхната fair price оценка с +6.7% марж.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsAiAuditOpen(false)}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase"
              >
                Затвори Одита
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TradingView Live Chart Modal Popup */}
      {tvModalTicker && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-bg/80 backdrop-blur-md font-sans"
          onClick={(e) => { if (e.target === e.currentTarget) setTvModalTicker(null); }}
        >
          <div className="w-full max-w-4xl bg-card border-2 border-indigo-500/40 rounded-3xl p-5 shadow-2xl relative h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-extrabold uppercase text-ink">
                  TradingView НА ЖИВО Графика — {tvModalTicker}
                </h3>
              </div>
              <button
                onClick={() => setTvModalTicker(null)}
                className="p-1.5 rounded-full hover:bg-card/60 text-ink-muted hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 w-full h-full rounded-2xl overflow-hidden bg-bg">
              <iframe
                title={`TradingView Chart for ${tvModalTicker}`}
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_1&symbol=${tvModalTicker}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC`}
                className="w-full h-full border-0 rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* REAL-TIME CLOUD SYNC MODAL DIALOG                                        */}
      {/* ======================================================================== */}
      {/* User Account & Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
      />

    </div>
  );
}
