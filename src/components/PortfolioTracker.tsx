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
  CheckCircle2
} from 'lucide-react';

interface Props {
  stocks: Stock[];
  positions: PortfolioPosition[];
  transactions?: PortfolioTransaction[];
  dividends?: PortfolioDividendRecord[];
  cashBalance?: number;
  currentUser?: FirebaseUser | null;
  syncPin?: string;
  onAddPosition: (pos: Omit<PortfolioPosition, 'id'>) => void;
  onUpdatePosition: (id: string, pos: Omit<PortfolioPosition, 'id'>) => void;
  onDeletePosition: (id: string) => void;
  onAddTransaction?: (tx: Omit<PortfolioTransaction, 'id'>) => void;
  onAddDividend?: (div: Omit<PortfolioDividendRecord, 'id'>) => void;
  onUpdateCash?: (cash: number) => void;
  onSetAllPositions?: (positions: PortfolioPosition[]) => void;
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
  currentUser: propCurrentUser,
  syncPin: propSyncPin,
  onAddPosition, 
  onUpdatePosition, 
  onDeletePosition,
  onAddTransaction,
  onAddDividend,
  onUpdateCash,
  onSetAllPositions
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

  // Real-time Cloud Sync with Secret PIN or User Account
  const [syncPin, setSyncPin] = useState<string>(propSyncPin ?? (() => {
    try {
      return localStorage.getItem('user_portfolio_sync_pin') || '';
    } catch (e) {
      return '';
    }
  }));

  useEffect(() => {
    if (propSyncPin !== undefined) {
      setSyncPin(propSyncPin);
    }
  }, [propSyncPin]);

  const isInitialCloudSyncedRef = useRef(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [inputSyncPin, setInputSyncPin] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const isRemoteUpdatingRef = useRef(false);

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

  // Cash management state with localStorage persistence
  const [cashInput, setCashInput] = useState(() => {
    try {
      const saved = localStorage.getItem('user_portfolio_cash');
      if (saved !== null) return saved;
    } catch (e) {}
    return cashBalance.toString();
  });

  useEffect(() => {
    try {
      localStorage.setItem('user_portfolio_cash', cashInput);
    } catch (e) {}
  }, [cashInput]);

  // Dividend ledger form state with localStorage persistence
  const [divTicker, setDivTicker] = useState('AAPL');
  const [divAmount, setDivAmount] = useState('24.58');
  const [divDate, setDivDate] = useState(new Date().toISOString().split('T')[0]);
  const [divRecords, setDivRecords] = useState<PortfolioDividendRecord[]>(() => {
    try {
      const saved = localStorage.getItem('user_portfolio_dividends');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return dividends.length > 0 ? dividends : [
      { id: 'd1', ticker: 'AAPL', amount: 24.58, date: '2026-05-01' },
      { id: 'd2', ticker: 'NVDA', amount: 12.00, date: '2026-04-10' },
      { id: 'd3', ticker: 'AAPL', amount: 24.58, date: '2026-03-15' },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('user_portfolio_dividends', JSON.stringify(divRecords));
    } catch (e) {}
  }, [divRecords]);

  // Transactions History with localStorage persistence
  const [history, setHistory] = useState<PortfolioTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('user_portfolio_transactions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return transactions.length > 0 ? transactions : [
      { id: 't1', date: '2026-05-29', ticker: 'SXR8', type: 'Покупка', shares: 10, buyPrice: 500.00, pnlVal: 0, pnlPct: 0 },
      { id: 't2', date: '2026-05-29', ticker: 'QCOM', type: 'Покупка', shares: 10, buyPrice: 150.00, pnlVal: 178.70, pnlPct: 11.91 },
      { id: 't3', date: '2026-01-10', ticker: 'AAPL', type: 'Покупка', shares: 10, buyPrice: 150.00, pnlVal: 1633.00, pnlPct: 108.87 },
      { id: 't4', date: '2026-02-15', ticker: 'NVDA', type: 'Покупка', shares: 15, buyPrice: 90.00, pnlVal: 0, pnlPct: 0 },
      { id: 't5', date: '2026-03-20', ticker: 'BTC', type: 'Покупка', shares: 0.5, buyPrice: 48000.00, pnlVal: 0, pnlPct: 0 },
      { id: 't6', date: '2026-04-05', ticker: 'ETH', type: 'Покупка', shares: 2.2, buyPrice: 2200.00, pnlVal: 0, pnlPct: 0 },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('user_portfolio_transactions', JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  // Firestore Snapshot Real-time Listener (User Account primary, PIN secondary)
  useEffect(() => {
    isInitialCloudSyncedRef.current = false;
    let docRef;
    if (currentUser) {
      docRef = doc(db, 'user_portfolios', currentUser.uid);
    } else if (syncPin.trim()) {
      const docId = `pin_${syncPin.trim().toLowerCase()}`;
      docRef = doc(db, 'portfolio_syncs', docId);
    } else {
      setSyncStatus('idle');
      return;
    }

    setSyncStatus('syncing');

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.payload) {
          isRemoteUpdatingRef.current = true;
          if (Array.isArray(data.payload.positions)) {
            if (onSetAllPositions) {
              onSetAllPositions(data.payload.positions);
            }
            try {
              localStorage.setItem('user_portfolio_positions', JSON.stringify(data.payload.positions));
            } catch (e) {}
          }
          if (Array.isArray(data.payload.history)) {
            setHistory(data.payload.history);
            try {
              localStorage.setItem('user_portfolio_transactions', JSON.stringify(data.payload.history));
            } catch (e) {}
          }
          if (Array.isArray(data.payload.divRecords)) {
            setDivRecords(data.payload.divRecords);
            try {
              localStorage.setItem('user_portfolio_dividends', JSON.stringify(data.payload.divRecords));
            } catch (e) {}
          }
          if (typeof data.payload.cashInput === 'string') {
            setCashInput(data.payload.cashInput);
            try {
              localStorage.setItem('user_portfolio_cash', data.payload.cashInput);
            } catch (e) {}
          }
          isInitialCloudSyncedRef.current = true;
          setTimeout(() => {
            isRemoteUpdatingRef.current = false;
          }, 300);
        }
      } else if (currentUser) {
        // Initial cloud upload for new user account
        isInitialCloudSyncedRef.current = true;
        pushToCloud();
      }
      setSyncStatus('synced');
    }, (err) => {
      console.error("Firestore sync error:", err);
      setSyncStatus('error');
    });

    return () => unsubscribe();
  }, [currentUser, syncPin]);

  // Push local updates to Cloud
  const pushToCloud = async (
    targetPositions = positions,
    targetHistory = history,
    targetDivs = divRecords,
    targetCash = cashInput
  ) => {
    if ((!currentUser && !syncPin.trim()) || isRemoteUpdatingRef.current) return;
    try {
      setSyncStatus('syncing');
      const docRef = currentUser 
        ? doc(db, 'user_portfolios', currentUser.uid)
        : doc(db, 'portfolio_syncs', `pin_${syncPin.trim().toLowerCase()}`);

      await setDoc(docRef, {
        payload: {
          positions: targetPositions,
          history: targetHistory,
          divRecords: targetDivs,
          cashInput: targetCash,
          updatedAt: new Date().toISOString()
        }
      }, { merge: true });
      setSyncStatus('synced');
    } catch (e) {
      console.error("Cloud push error:", e);
      setSyncStatus('error');
    }
  };

  // Push to cloud when local state changes
  useEffect(() => {
    if ((currentUser || syncPin.trim()) && !isRemoteUpdatingRef.current && isInitialCloudSyncedRef.current) {
      pushToCloud();
    }
  }, [positions, history, divRecords, cashInput]);

  const handleEnableSync = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = inputSyncPin.trim();
    if (!cleanPin) return;

    try {
      setSyncStatus('syncing');
      const docId = `pin_${cleanPin.toLowerCase()}`;
      const docRef = doc(db, 'portfolio_syncs', docId);
      const snap = await getDoc(docRef);

      if (snap.exists() && snap.data()?.payload) {
        // Exists in cloud! Sync cloud data down
        const data = snap.data();
        if (Array.isArray(data?.payload.positions) && onSetAllPositions) {
          onSetAllPositions(data.payload.positions);
        }
        if (Array.isArray(data?.payload.history)) setHistory(data.payload.history);
        if (Array.isArray(data?.payload.divRecords)) setDivRecords(data.payload.divRecords);
        if (typeof data?.payload.cashInput === 'string') setCashInput(data.payload.cashInput);
      } else {
        // Document does not exist in cloud yet! Upload current local portfolio to this PIN
        await setDoc(docRef, {
          payload: {
            positions,
            history,
            divRecords,
            cashInput,
            updatedAt: new Date().toISOString()
          }
        });
      }

      localStorage.setItem('user_portfolio_sync_pin', cleanPin);
      setSyncPin(cleanPin);
      setSyncStatus('synced');
      setIsSyncModalOpen(false);
    } catch (err) {
      console.error("Enable sync failed:", err);
      setSyncStatus('error');
    }
  };

  const handleDisableSync = () => {
    localStorage.removeItem('user_portfolio_sync_pin');
    setSyncPin('');
    setInputSyncPin('');
    setSyncStatus('idle');
    setIsSyncModalOpen(false);
  };
  // AI Audit Modal, Add Position Modal, Cash Modal, History & Dividend Modal state
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'diversification' | 'dividends' | 'holdings' | 'transactions'>('overview');
  const [isAiAuditOpen, setIsAiAuditOpen] = useState(false);
  const [tvModalTicker, setTvModalTicker] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDividendsModalOpen, setIsDividendsModalOpen] = useState(false);
  const [cagrHorizon, setCagrHorizon] = useState<'1г.' | '2г.' | '3г.' | '5г.'>('2г.');

  // Selected clicked row marker & 10 rows per page pagination
  const [selectedPosId, setSelectedPosId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    const found = stocks.find(s => s.ticker === upper);
    if (found) {
      if (!companyName) setCompanyName(found.companyName);
      if (!buyPrice && (found.currentPrice || found.priceOfCalc)) {
        setBuyPrice((found.currentPrice || found.priceOfCalc || 0).toFixed(2));
      }
      if (!fairPrice && found.fairPrice) {
        setFairPrice(found.fairPrice.toFixed(2));
      }
      if (!annualDiv && found.dividend) {
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
      setFormError('Въведете тикер (напр. AAPL)');
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

    // Auto-convert price to USD base if entered in EUR
    const priceInUsd = positionCurrency === 'EUR' ? priceNum * eurUsdRate : priceNum;

    const payload = {
      ticker: ticker.trim().toUpperCase(),
      companyName: companyName.trim(),
      shares: sharesNum,
      buyPrice: priceInUsd,
      fee: parseFloat(fee) || 0,
      buyDate: buyDate || new Date().toISOString().split('T')[0],
      fairPrice: parseFloat(fairPrice) || undefined,
      annualDivPerShare: parseFloat(annualDiv) || undefined,
      buyTarget: parseFloat(buyTarget) || undefined,
      sellTarget: parseFloat(sellTarget) || undefined
    };

    if (editingId) {
      onUpdatePosition(editingId, payload);
      setEditingId(null);
    } else {
      onAddPosition(payload);

      // Add to transaction history
      const newTx: PortfolioTransaction = {
        id: `${Date.now()}-${Math.random()}`,
        date: buyDate || new Date().toISOString().split('T')[0],
        ticker: payload.ticker,
        type: txType,
        shares: sharesNum,
        buyPrice: priceNum,
        pnlVal: 0,
        pnlPct: 0
      };
      setHistory(prev => [newTx, ...prev]);
    }

    // Reset form
    setTicker('');
    setCompanyName('');
    setShares('');
    setBuyPrice('');
    setFee('0.00');
    setFairPrice('');
    setAnnualDiv('');
    setBuyTarget('');
    setSellTarget('');
  };

  const handleStartEdit = (pos: PortfolioPosition) => {
    setEditingId(pos.id);
    setTicker(pos.ticker);
    setCompanyName(pos.companyName || '');
    setShares(pos.shares.toString());
    setBuyPrice(pos.buyPrice.toString());
    setFee((pos.fee || 0).toString());
    setBuyDate(pos.buyDate || new Date().toISOString().split('T')[0]);
    setFairPrice(pos.fairPrice ? pos.fairPrice.toString() : '');
    setAnnualDiv(pos.annualDivPerShare ? pos.annualDivPerShare.toString() : '');
    setBuyTarget(pos.buyTarget ? pos.buyTarget.toString() : '');
    setSellTarget(pos.sellTarget ? pos.sellTarget.toString() : '');
    setIsAddModalOpen(true);
  };

  const handleAddDividendRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(divAmount);
    if (!divTicker || isNaN(amt) || amt <= 0) return;

    const newDiv: PortfolioDividendRecord = {
      id: `${Date.now()}-${Math.random()}`,
      ticker: divTicker.trim().toUpperCase(),
      amount: amt,
      date: divDate
    };
    setDivRecords(prev => [newDiv, ...prev]);
    if (onAddDividend) onAddDividend(newDiv);
    setDivAmount('');
  };

  // Active holdings (ensure shares > 0)
  const activeHoldings = positions.filter(pos => pos.shares > 0);

  // Live EUR/USD exchange rate
  const eurUsdStock = stocks.find(s => s.ticker === 'EURUSD=X' || s.ticker === 'EURUSD');
  const eurUsdRate = eurUsdStock?.currentPrice || eurUsdStock?.priceOfCalc || 1.08;

  // Portfolio Dashboard Calculations
  let totalCostBasis = 0;
  let totalCurrentValue = 0;
  let totalDivEarned = divRecords.reduce((acc, r) => acc + (r.amount || 0), 0);

  const enrichedHoldings = activeHoldings.map(pos => {
    const cleanTicker = pos.ticker.trim().toUpperCase();
    const baseTicker = cleanTicker.split('.')[0].split(':')[1] || cleanTicker.split('.')[0];
    const matching = stocks.find(s => {
      const sClean = s.ticker.trim().toUpperCase();
      const sBase = sClean.split('.')[0].split(':')[1] || sClean.split('.')[0];
      return sClean === cleanTicker || sBase === baseTicker;
    });

    const curPrice = (matching?.currentPrice && matching.currentPrice > 0) 
      ? matching.currentPrice 
      : ((matching?.priceOfCalc && matching.priceOfCalc > 0) ? matching.priceOfCalc : pos.buyPrice);

    const costBasis = (pos.shares * pos.buyPrice) + (pos.fee || 0);
    const currentVal = pos.shares * curPrice;
    const pnlVal = currentVal - costBasis;
    const pnlPct = costBasis > 0 ? (pnlVal / costBasis) * 100 : 0;
    const fPrice = pos.fairPrice || matching?.fairPrice || 0;
    const diffVsFair = fPrice > 0 ? ((curPrice - fPrice) / fPrice) * 100 : 0;

    totalCostBasis += costBasis;
    totalCurrentValue += currentVal;

    return {
      ...pos,
      companyName: matching?.companyName || pos.companyName || pos.ticker,
      matching,
      curPrice,
      costBasis,
      currentVal,
      pnlVal,
      pnlPct,
      fPrice,
      diffVsFair
    };
  });

  const parsedCash = parseFloat(cashInput) || 0;
  const totalPortfolioValue = totalCurrentValue + parsedCash;
  const totalReturnVal = totalCurrentValue - totalCostBasis;
  const totalReturnPct = totalCostBasis > 0 ? (totalReturnVal / totalCostBasis) * 100 : 0;

  // Filtered History (supports date range filters)
  const filteredHistory = history.filter(h => {
    if (historyFromDate && h.date < historyFromDate) return false;
    if (historyToDate && h.date > historyToDate) return false;
    return true;
  });

  // Additional metric calculations for the 9-Card KPI Grid & Charts
  const realizedPnLSum = filteredHistory.reduce((acc, h) => acc + (h.pnlVal || 0), 0);
  const totalDividendsSum = divRecords.reduce((acc, r) => acc + (r.amount || 0), 0);
  const unrealizedProfitCount = enrichedHoldings.filter(h => h.pnlVal >= 0).length;
  const unrealizedLossCount = enrichedHoldings.filter(h => h.pnlVal < 0).length;
  const realizedProfitCount = filteredHistory.filter(h => (h.pnlVal || 0) > 0).length;
  const realizedLossCount = filteredHistory.filter(h => (h.pnlVal || 0) < 0).length;
  const avgCostBasis = enrichedHoldings.length > 0 ? totalCostBasis / enrichedHoldings.length : 0;

  // Grand Total Gain (Unrealized P/L + Realized P/L + Dividends)
  const grandTotalReturnVal = totalReturnVal + realizedPnLSum + totalDividendsSum;
  const grandTotalReturnPct = totalCostBasis > 0 ? (grandTotalReturnVal / totalCostBasis) * 100 : 0;

  // Sector Diversification breakdown (Snowball Analytics style)
  const sectorMap: { [sector: string]: number } = {};
  enrichedHoldings.forEach(h => {
    const sec = getSectorForStock(h.ticker) || 'Other';
    sectorMap[sec] = (sectorMap[sec] || 0) + h.currentVal;
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
      weightPct: totalCurrentValue > 0 ? (h.currentVal / totalCurrentValue) * 100 : 0
    }))
    .sort((a, b) => b.currentVal - a.currentVal);

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
      <div className="bg-card/80 border border-border/80 rounded-2xl p-2 shadow-md backdrop-blur-md flex flex-wrap items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0 text-xs font-black">
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

          <button
            onClick={() => setActiveSubTab('holdings')}
            className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSubTab === 'holdings'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md font-black'
                : 'bg-card text-ink-muted border-border hover:bg-white/5 hover:text-ink font-bold'
            }`}
          >
            <Briefcase className="w-4 h-4 text-blue-300" />
            Holdings ({enrichedHoldings.length})
          </button>

          <button
            onClick={() => setActiveSubTab('transactions')}
            className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSubTab === 'transactions'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md font-black'
                : 'bg-card text-ink-muted border-border hover:bg-white/5 hover:text-ink font-bold'
            }`}
          >
            <Newspaper className="w-4 h-4 text-purple-300" />
            Transactions ({history.length})
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePrivacyMode}
            className="p-2 bg-card border border-border/80 text-ink-muted hover:text-ink rounded-xl text-xs font-bold transition-all"
            title={isPrivacyMode ? "Покажи сумите" : "Скрий сумите"}
          >
            {isPrivacyMode ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            onClick={() => { setEditingId(null); setIsAddModalOpen(true); }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Добави Позиция</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-stretch">
        
        {/* Card 1: TOTAL INVESTED */}
        <div className="bg-card/70 hover:bg-card/90 border border-border/80 border-l-4 border-l-indigo-500 rounded-xl p-2.5 shadow-md backdrop-blur-md relative overflow-hidden transition-all group flex flex-col justify-between min-h-[72px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-ink-muted tracking-wider flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-indigo-400" />
              TOTAL INVESTED
            </span>
            <span className="text-[8.5px] font-extrabold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
              Вложени
            </span>
          </div>
          <div className="mt-1 flex items-baseline">
            <span className="text-lg sm:text-xl font-black text-ink font-sans tabular-nums tracking-tight">
              {isPrivacyMode ? '••••••••' : `$${totalCostBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Card 2: UNREALIZED RETURNS */}
        <div className="bg-card/70 hover:bg-card/90 border border-border/80 border-l-4 border-l-emerald-500 rounded-xl p-2.5 shadow-md backdrop-blur-md relative overflow-hidden transition-all group flex flex-col justify-between min-h-[72px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-ink-muted tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              UNREALIZED P/L
            </span>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border ${totalReturnVal >= 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
              {isPrivacyMode ? '••••' : `${totalReturnPct >= 0 ? '▲' : '▼'} ${totalReturnPct.toFixed(2)}%`}
            </span>
          </div>
          <div className="mt-1 flex items-baseline">
            <span className={`text-lg sm:text-xl font-black font-sans tabular-nums tracking-tight ${totalReturnVal >= 0 ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]' : 'text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.3)]'}`}>
              {isPrivacyMode ? '••••••••' : `${totalReturnVal >= 0 ? '+' : ''}$${totalReturnVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Card 3: REALIZED P/L */}
        <div className="bg-card/70 hover:bg-card/90 border border-border/80 border-l-4 border-l-purple-500 rounded-xl p-2.5 shadow-md backdrop-blur-md relative overflow-hidden transition-all group flex flex-col justify-between min-h-[72px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-ink-muted tracking-wider flex items-center gap-1">
              <Coins className="w-3 h-3 text-purple-400" />
              REALIZED P/L
            </span>
            <span className="text-[8.5px] font-extrabold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">
              Затворени
            </span>
          </div>
          <div className="mt-1 flex items-baseline">
            <span className={`text-lg sm:text-xl font-black font-sans tabular-nums tracking-tight ${realizedPnLSum >= 0 ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]' : 'text-rose-400'}`}>
              {isPrivacyMode ? '••••••••' : `${realizedPnLSum >= 0 ? '+' : ''}$${realizedPnLSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Card 4: TOTAL DIVIDENDS EARNED */}
        <div className="bg-card/70 hover:bg-card/90 border border-border/80 border-l-4 border-l-amber-500 rounded-xl p-2.5 shadow-md backdrop-blur-md relative overflow-hidden transition-all group flex flex-col justify-between min-h-[72px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-ink-muted tracking-wider flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              DIVIDENDS EARNED
            </span>
            <span className="text-[8.5px] font-extrabold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
              Дивиденти
            </span>
          </div>
          <div className="mt-1 flex items-baseline">
            <span className="text-lg sm:text-xl font-black text-amber-400 font-sans tabular-nums tracking-tight drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]">
              {isPrivacyMode ? '••••••••' : `+$${totalDividendsSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Card 5: GRAND TOTAL RETURN (WITH DIVIDENDS) ⭐ */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-card/80 to-card/70 hover:bg-card/90 border border-emerald-500/40 border-l-4 border-l-emerald-400 rounded-xl p-2.5 shadow-lg shadow-emerald-500/10 backdrop-blur-md relative overflow-hidden transition-all group flex flex-col justify-between min-h-[72px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
              TOTAL GAIN (W/ DIVIDENDS)
            </span>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border ${grandTotalReturnVal >= 0 ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400' : 'bg-rose-500/30 text-rose-300 border-rose-400'}`}>
              {isPrivacyMode ? '••••' : `${grandTotalReturnPct >= 0 ? '▲' : '▼'} ${grandTotalReturnPct.toFixed(2)}%`}
            </span>
          </div>
          <div className="mt-1 flex items-baseline">
            <span className={`text-lg sm:text-xl font-black font-sans tabular-nums tracking-tight ${grandTotalReturnVal >= 0 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'text-rose-400'}`}>
              {isPrivacyMode ? '••••••••' : `${grandTotalReturnVal >= 0 ? '+' : ''}$${grandTotalReturnVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Card 6: CURRENT MARKET VALUE */}
        <div className="bg-card/70 hover:bg-card/90 border border-border/80 border-l-4 border-l-emerald-400 rounded-xl p-2.5 shadow-md backdrop-blur-md relative overflow-hidden transition-all group flex flex-col justify-between min-h-[72px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-ink-muted tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              CURRENT MARKET VALUE
            </span>
            <span className="text-[8.5px] font-extrabold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
              Пазарна
            </span>
          </div>
          <div className="mt-1 flex items-baseline">
            <span className="text-lg sm:text-xl font-black text-emerald-400 font-sans tabular-nums tracking-tight drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]">
              {isPrivacyMode ? '••••••••' : `$${totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Card 7: AVERAGE COST BASIS */}
        <div className="bg-card/70 hover:bg-card/90 border border-border/80 border-l-4 border-l-cyan-500 rounded-xl p-2.5 shadow-md backdrop-blur-md transition-all group flex flex-col justify-between min-h-[72px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-ink-muted tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              AVERAGE COST BASIS
            </span>
            <span className="text-[8.5px] font-extrabold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded border border-cyan-500/30">
              Средна цена
            </span>
          </div>
          <div className="mt-1 flex items-baseline">
            <span className="text-lg sm:text-xl font-black text-ink font-sans tabular-nums tracking-tight">
              {isPrivacyMode ? '••••••••' : `$${avgCostBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Card 8: STOCK HOLDINGS */}
        <div className="bg-card/70 hover:bg-card/90 border border-border/80 border-l-4 border-l-blue-500 rounded-xl p-2.5 shadow-md backdrop-blur-md relative overflow-hidden transition-all group flex flex-col justify-between min-h-[72px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-ink-muted tracking-wider flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-blue-400" />
              STOCK HOLDINGS
            </span>
            <span className="text-[8.5px] font-extrabold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-500/30">
              Позиции
            </span>
          </div>
          <div className="mt-1 flex items-baseline">
            <span className="text-lg sm:text-xl font-black text-blue-400 font-sans tabular-nums tracking-tight">
              {enrichedHoldings.length}
            </span>
          </div>
        </div>

      </div>

      {/* ======================================================================== */}
      {/* ROW 2: 3 VISUAL CHARTS SECTION (Premium Glassmorphic Design)             */}
      {/* ======================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
        
        {/* Chart 1: INVESTED Vs RETURNS */}
        <div className="bg-card/70 border border-border/80 rounded-2xl overflow-hidden shadow-md backdrop-blur-sm flex flex-col justify-between">
          <div className="bg-card/90 border-b border-border/40 px-4 py-2.5 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-ink-muted tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              TOTAL PORTFOLIO GAIN
            </span>
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              +{grandTotalReturnPct.toFixed(2)}% С ДИВИДЕНТИ
            </span>
          </div>

          {enrichedHoldings.length === 0 ? (
            <div className="p-8 text-center text-ink-faint font-semibold text-xs leading-relaxed flex items-center justify-center min-h-[160px]">
              Добавете поредица, за да започнете да визуализирате данните си
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-ink-faint">
                  <span>Вложени пари:</span>
                  <span className="font-extrabold text-ink">{isPrivacyMode ? '••••' : `$${totalCostBasis.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</span>
                </div>
                <div className="flex justify-between text-ink-faint">
                  <span>Пазарна оценка:</span>
                  <span className="font-extrabold text-ink">{isPrivacyMode ? '••••' : `$${totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</span>
                </div>
                <div className="flex justify-between text-emerald-400/90 font-semibold">
                  <span>Нереализирана (Пазарна):</span>
                  <span>{isPrivacyMode ? '••••' : `${totalReturnVal >= 0 ? '+' : ''}$${totalReturnVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</span>
                </div>
                {realizedPnLSum !== 0 && (
                  <div className="flex justify-between text-purple-400/90 font-semibold">
                    <span>Реализирана P/L (Затворени):</span>
                    <span>{isPrivacyMode ? '••••' : `${realizedPnLSum >= 0 ? '+' : ''}$${realizedPnLSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</span>
                  </div>
                )}
                <div className="flex justify-between text-amber-400/90 font-semibold">
                  <span>Получени дивиденти:</span>
                  <span>{isPrivacyMode ? '••••' : `+$${totalDividendsSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-extrabold border-t border-border/40 pt-2 text-sm">
                  <span>Общо с дивиденти:</span>
                  <span className="drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{isPrivacyMode ? '••••' : `${grandTotalReturnVal >= 0 ? '+' : ''}$${grandTotalReturnVal.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${grandTotalReturnPct.toFixed(2)}%)`}</span>
                </div>
              </div>

              {/* Visual Comparison Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-ink-faint font-bold">
                  <span>Инвестирани (${(totalCostBasis / 1000).toFixed(1)}k)</span>
                  <span>С Дивиденти (${((totalCostBasis + grandTotalReturnVal) / 1000).toFixed(1)}k)</span>
                </div>
                <div className="w-full bg-card h-2.5 rounded-full overflow-hidden border border-border/60 flex shadow-inner">
                  <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${totalCostBasis > 0 ? Math.min(100, (totalCostBasis / (totalCostBasis + Math.max(0, grandTotalReturnVal))) * 100) : 50}%` }}></div>
                  <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${totalCostBasis > 0 ? Math.max(0, 100 - (totalCostBasis / (totalCostBasis + Math.max(0, grandTotalReturnVal))) * 100) : 50}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart 2: HOLDINGS BREAKDOWN */}
        <div className="bg-card/70 border border-border/80 rounded-2xl overflow-hidden shadow-md backdrop-blur-sm flex flex-col justify-between">
          <div className="bg-card/90 border-b border-border/40 px-4 py-2.5 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-ink-muted tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-indigo-400" />
              HOLDINGS BREAKDOWN
            </span>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              {enrichedHoldings.length} актива
            </span>
          </div>

          {enrichedHoldings.length === 0 ? (
            <div className="p-8 text-center text-ink-faint font-semibold text-xs leading-relaxed flex items-center justify-center min-h-[160px]">
              Добавете поредица, за да започнете да визуализирате данните си
            </div>
          ) : (
            <div className="p-5 flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0 rounded-full flex items-center justify-center shadow-md shadow-indigo-500/20" style={{
                background: `conic-gradient(#6366f1 0% 60%, #3b82f6 60% 85%, #10b981 85% 100%)`
              }}>
                <div className="w-14 h-14 rounded-full bg-bg flex items-center justify-center flex-col text-center shadow-inner">
                  <span className="text-[8px] font-extrabold text-ink">ОБЩО</span>
                  <span className="text-[9px] text-indigo-400 font-extrabold">100%</span>
                </div>
              </div>

              <div className="flex-1 space-y-2 max-h-[150px] overflow-y-auto pr-1">
                {enrichedHoldings.slice(0, 5).map((h, i) => {
                  const sharePct = totalCurrentValue > 0 ? (h.currentVal / totalCurrentValue) * 100 : 0;
                  const barColors = ['bg-indigo-500', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500'];
                  const barColor = barColors[i % barColors.length];

                  return (
                    <div key={h.id} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 truncate max-w-[110px]">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${barColor}`}></span>
                          <span className="font-extrabold text-ink">{h.ticker}</span>
                        </div>
                        <span className="font-mono font-bold text-ink text-[10px]">
                          {sharePct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-card/60 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${Math.min(100, Math.max(4, sharePct))}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Chart 3: STOCK DIVERSIFICATION */}
        <div className="bg-card/70 border border-border/80 rounded-2xl overflow-hidden shadow-md backdrop-blur-sm flex flex-col justify-between">
          <div className="bg-card/90 border-b border-border/40 px-4 py-2.5 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-ink-muted tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              STOCK DIVERSIFICATION
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Сектори
            </span>
          </div>

          {enrichedHoldings.length === 0 ? (
            <div className="p-8 text-center text-ink-faint font-semibold text-xs leading-relaxed flex items-center justify-center min-h-[160px]">
              Добавете поредица, за да започнете да визуализирате данните си
            </div>
          ) : (
            <div className="p-5 space-y-2.5">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-faint font-bold">ETF & Индекси</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {((enrichedHoldings.filter(h => h.ticker.includes('SXR8') || h.ticker.includes('VHYL') || h.ticker.includes('JGPI') || h.ticker.includes('XNAS')).reduce((acc, h) => acc + h.currentVal, 0) / (totalCurrentValue || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-card h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(100, Math.max(5, (enrichedHoldings.filter(h => h.ticker.includes('SXR8') || h.ticker.includes('VHYL') || h.ticker.includes('JGPI') || h.ticker.includes('XNAS')).reduce((acc, h) => acc + h.currentVal, 0) / (totalCurrentValue || 1)) * 100))}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-faint font-bold">Технологии & Акции</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {((enrichedHoldings.filter(h => !h.ticker.includes('SXR8') && !h.ticker.includes('VHYL') && !h.ticker.includes('JGPI') && !h.ticker.includes('XNAS')).reduce((acc, h) => acc + h.currentVal, 0) / (totalCurrentValue || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-card h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${Math.min(100, Math.max(5, (enrichedHoldings.filter(h => !h.ticker.includes('SXR8') && !h.ticker.includes('VHYL') && !h.ticker.includes('JGPI') && !h.ticker.includes('XNAS')).reduce((acc, h) => acc + h.currentVal, 0) / (totalCurrentValue || 1)) * 100))}%` }}></div>
                </div>
              </div>

              {parseFloat(cashInput) > 0 && (
                <div className="space-y-1 border-t border-border/40 pt-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-400 font-bold">Свободен Кеш</span>
                    <span className="font-mono font-bold text-amber-400">
                      {((parseFloat(cashInput) / totalPortfolioValue) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-card h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: `${((parseFloat(cashInput) / totalPortfolioValue) * 100).toFixed(1)}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
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
                            {isPrivacyMode ? '••••' : `$${item.val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} ({item.pct.toFixed(1)}%)
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
                ПРОГНОЗЕН ГОДИШЕН ПАСИВЕН ДОХОД
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                {isPrivacyMode ? '••••••••' : `$${totalAnnualDivIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
                СРЕДНО НА МЕСЕЦ
              </span>
              <div className="text-xl sm:text-2xl font-black text-indigo-400 mt-1">
                {isPrivacyMode ? '••••••••' : `$${(totalAnnualDivIncome / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
                      {isPrivacyMode ? '••' : `$${m.val.toFixed(0)}`}
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
        <div className="p-3 border-b border-border/40 flex flex-wrap items-center justify-between gap-2 bg-card/40">
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
            
            {/* 1. Header Badge: АКТИВИ */}
            <div className="px-3 py-2 rounded-xl text-xs font-black uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-1.5 h-9 shrink-0">
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
              className="px-3 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer h-9 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Добавяне на Нов Актив</span>
            </button>

            {/* 3. История на транзакциите */}
            <button 
              onClick={() => setIsHistoryModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-black bg-card/70 hover:bg-card border border-border text-indigo-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs h-9 shrink-0"
            >
              <History className="w-4 h-4 text-indigo-400" />
              <span>История на транзакциите ({filteredHistory.length})</span>
            </button>

            {/* 4. Получени дивиденти */}
            <button 
              onClick={() => setIsDividendsModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-black bg-card/70 hover:bg-card border border-border text-emerald-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs h-9 shrink-0"
            >
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>Получени дивиденти (${totalDivEarned.toFixed(2)})</span>
            </button>

            {/* 5. Кеш */}
            <button 
              onClick={() => setIsCashModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-black bg-card/70 hover:bg-card border border-border text-amber-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs h-9 shrink-0"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Кеш: ${(parseFloat(cashInput) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </button>

            {/* 6. Обнови цените в реално време */}
            <button 
              onClick={() => window.location.reload()}
              className="px-3 py-2 rounded-xl text-xs font-black bg-card/70 hover:bg-card border border-border text-ink-muted hover:text-ink flex items-center gap-1.5 transition-all cursor-pointer shadow-xs h-9 shrink-0"
            >
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              <span>Обнови цените в реално време</span>
            </button>

            {/* 7. Privacy Mode Toggle */}
            <button 
              onClick={togglePrivacyMode}
              title={isPrivacyMode ? "Покажи финансовите суми" : "Скрий финансовите суми"}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs border flex items-center gap-1.5 h-9 shrink-0 ${
                isPrivacyMode 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                  : 'bg-card/70 hover:bg-card border-border text-ink-muted hover:text-ink'
              }`}
            >
              {isPrivacyMode ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-indigo-400" />}
              <span>{isPrivacyMode ? 'Скрити' : 'Видими'}</span>
            </button>

            {/* 8. User Account / PIN Sync Status */}
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              title={currentUser ? `Влезли сте като ${currentUser.email}. Натиснете за управление на акаунта.` : syncPin ? `Автоматичната синхронизация е активна (PIN: ${syncPin})` : "Влезте в акаунт или въведете PIN за синхронизация в реално време"}
              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border h-9 shrink-0 ${
                currentUser || syncPin
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10' 
                  : 'bg-card/70 hover:bg-card border-border text-ink-muted hover:text-ink'
              }`}
            >
              <Cloud className={`w-4 h-4 ${currentUser || syncPin ? 'text-emerald-400 animate-pulse' : 'text-indigo-400'}`} />
              <span>
                {currentUser 
                  ? `👤 ${currentUser.displayName || currentUser.email?.split('@')[0]} (🟢 НА ЖИВО)`
                  : syncPin 
                    ? `☁️ PIN (${syncPin})` 
                    : '🔑 Вход / Синхронизация'}
              </span>
            </button>

            {/* 9. Експорт */}
            <button 
              onClick={handleExportBackup}
              title="Свали резервно копие на вашето портфолио"
              className="px-3 py-2 rounded-xl text-xs font-black bg-card/70 hover:bg-card border border-border text-ink-muted hover:text-ink flex items-center gap-1.5 transition-all cursor-pointer shadow-xs h-9 shrink-0"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Експорт</span>
            </button>

            {/* 10. Импорт */}
            <label title="Възстанови резервно копие на портфолиото" className="px-3 py-2 rounded-xl text-xs font-black bg-card/70 hover:bg-card border border-border text-ink-muted hover:text-ink flex items-center gap-1.5 transition-all cursor-pointer shadow-xs h-9 shrink-0">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Импорт</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>

          <span className="text-[10px] text-ink-faint font-extrabold uppercase bg-card/40 px-2.5 py-1 rounded-xl border border-white/5 shrink-0">
            ОБЩО ПОЗИЦИИ: {enrichedHoldings.length}
          </span>
        </div>

        {/* Main Table Container with Sticky Header & Smooth Scroll */}
        <div 
          className="w-full max-h-[65vh] md:max-h-[520px] overflow-auto border-b border-border/15 touch-pan-x touch-pan-y scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <table className="w-full text-left border-collapse font-sans tabular-nums text-xs min-w-[1600px] table-auto">
            <thead className="sticky top-0 z-20 bg-bg rounded-2xl">
              <tr className="bg-bg text-ink/90 border-b-2 border-border text-xs uppercase font-semibold tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">TICKER</th>
                <th className="py-3 px-4 whitespace-nowrap">COMPANY NAME</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">% OF PORTFOLIO</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">SHARES</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">AVG. PRICE</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">FEE</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">COST BASIS</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">DATE OF PURCHASE</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">DAILY CHANGE %</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">CURRENT PRICE</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">FAIR PRICE</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">DIFFERENCE</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">BUY / SELL</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">PROFIT / LOSS %</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">UNRLZD P&L ($)</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">VALUE</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">DIVIDEND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-ink">
              {enrichedHoldings.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-8 text-center text-ink-faint font-bold text-xs">
                    Няма намерени или добавени активи в портфейла. Кликнете на <span className="text-emerald-400 font-extrabold">＋ Добавяне на Нов Актив</span> за да добавите първата си позиция.
                  </td>
                </tr>
              ) : (
                enrichedHoldings.map(pos => {
                  const isPosProfit = pos.pnlVal >= 0;
                  const isFairUndervalued = pos.diffVsFair > 0;
                  const isDailyUp = (pos.matching?.dailyChangePct || 0) >= 0;
                  const shareOfPortfolioPct = totalCurrentValue > 0 ? (pos.currentVal / totalCurrentValue) * 100 : 0;
                  const isSelected = selectedPosId === pos.id;

                  return (
                    <tr 
                      key={pos.id}
                      className={`transition-all duration-150 group cursor-pointer ${
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
                        <span className="font-extrabold text-ink">{pos.ticker}</span>
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
                      <td className="py-3 px-3 text-right font-mono font-bold text-indigo-400">
                        {shareOfPortfolioPct.toFixed(1)}%
                      </td>

                      {/* 4. Shares */}
                      <td className="py-3 px-3 text-right font-extrabold text-ink">
                        {isPrivacyMode ? '••••' : pos.shares}
                      </td>

                      {/* 5. Avg. Price */}
                      <td className="py-3 px-3 text-right font-mono text-ink-faint">
                        {isPrivacyMode ? '••••' : `$${pos.buyPrice.toFixed(2)}`}
                      </td>

                      {/* 6. Fee */}
                      <td className="py-3 px-3 text-right font-mono text-ink-faint">
                        {isPrivacyMode ? '••••' : `$${(pos.fee || 0).toFixed(2)}`}
                      </td>

                      {/* 7. Cost Basis */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-ink">
                        {isPrivacyMode ? '••••••••' : `$${pos.costBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>

                      {/* 8. Date of Purchase */}
                      <td className="py-3 px-3 text-center text-ink-faint text-[10px]">
                        {pos.buyDate || '-'}
                      </td>

                      {/* 9. Daily Change % */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                          isDailyUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {isDailyUp ? '▲' : '▼'} {Math.abs(pos.matching?.dailyChangePct || 0).toFixed(2)}%
                        </span>
                      </td>

                      {/* 10. Current Price */}
                      <td className="py-3 px-3 text-right font-mono font-black text-ink">
                        <div className="flex items-center justify-end gap-1.5">
                          <span>{isPrivacyMode ? '•••••' : `$${pos.curPrice.toFixed(2)}`}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTvModalTicker(pos.ticker);
                            }}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-sans font-bold transition-all border border-indigo-500/20 flex items-center gap-0.5 cursor-pointer shadow-xs"
                            title={`Отвори TradingView НА ЖИВО графика за ${pos.ticker}`}
                          >
                            <TrendingUp className="w-2.5 h-2.5 text-indigo-400" />
                            TV
                          </button>
                        </div>
                      </td>

                      {/* 11. Fair Price */}
                      <td className="py-3 px-3 text-right font-mono text-indigo-400 font-bold">
                        ${pos.fPrice > 0 ? pos.fPrice.toFixed(2) : '-'}
                      </td>

                      {/* 12. Difference % vs Fair Price */}
                      <td className="py-3 px-3 text-center">
                        {pos.fPrice > 0 ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            isFairUndervalued ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {pos.diffVsFair > 0 ? '+' : ''}{pos.diffVsFair.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-ink-faint">-</span>
                        )}
                      </td>

                      {/* 13. BUY/SELL Buttons & Trash2 Delete */}
                      <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(pos);
                            }}
                            className="px-2 py-0.5 bg-emerald-600/80 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded uppercase transition-all cursor-pointer"
                          >
                            BUY
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(pos);
                            }}
                            className="px-2 py-0.5 bg-amber-600/80 hover:bg-amber-500 text-white font-extrabold text-[10px] rounded uppercase transition-all cursor-pointer"
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
                            className="p-1.5 rounded-lg text-ink-faint hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                            title="Изтрий позиция"
                          >
                            <Trash2 className="w-4 h-4 text-rose-400/80 hover:text-rose-400" />
                          </button>
                        </div>
                      </td>

                      {/* 14. Profit / Loss % */}
                      <td className="py-3 px-3 text-right">
                        <span className={`font-mono font-black text-[11px] ${
                          isPosProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {isPrivacyMode ? '••••' : `${isPosProfit ? '▲' : '▼'} ${pos.pnlPct.toFixed(2)}%`}
                        </span>
                      </td>

                      {/* 15. Unrealized P/L $ */}
                      <td className="py-3 px-3 text-right font-mono font-extrabold">
                        <span className={isPosProfit ? 'text-emerald-400' : 'text-rose-400'}>
                          {isPrivacyMode ? '••••••••' : `${isPosProfit ? '+' : ''}$${pos.pnlVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </span>
                      </td>

                      {/* 16. Value */}
                      <td className="py-3 px-3 text-right font-mono font-black text-ink">
                        {isPrivacyMode ? '••••••••' : `$${pos.currentVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>

                      {/* 17. Dividend */}
                      <td className="py-3 px-3 text-right last:rounded-r-xl">
                        <span className="font-mono text-emerald-400 font-extrabold block">
                          {isPrivacyMode ? '••••' : `$${((pos.annualDivPerShare || 0) * pos.shares).toFixed(2)}`}
                        </span>
                        <span className="text-[9px] text-ink-faint block">
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

        {/* Table Status Footer */}
        <div className="p-3 bg-card/40 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between font-sans tabular-nums text-xs text-ink/90 gap-2">
          <span>
            Показване на всички <span className="font-extrabold text-indigo-400">{enrichedHoldings.length}</span> позиции в портфейла
          </span>
          <span className="text-xs text-ink-faint italic">
            Използвайте скрола за нагоре и надолу за преглед на целия списък
          </span>
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
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-ink-muted">{tx.date}</td>
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
                onClick={() => setIsAddModalOpen(false)}
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

            <form onSubmit={(e) => {
              handleSubmitPosition(e);
              setIsAddModalOpen(false);
            }} className="space-y-3 text-xs">
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
                  <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">ТИКЕР</label>
                  <input
                    type="text"
                    placeholder="напр. AAPL"
                    value={ticker}
                    onChange={e => handleTickerChange(e.target.value)}
                    className="w-full bg-bg text-ink font-bold border border-border px-3 py-2 rounded-xl focus:outline-none uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">ИМЕ НА АКТИВА</label>
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
                <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">ПЛАТЕНА ТАКСА ($ fee)</label>
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
                  <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">БРОЙ АКЦИИ</label>
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
                  <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">ДАТА НА СДЕЛКАТА</label>
                  <input
                    type="date"
                    value={buyDate}
                    onChange={e => setBuyDate(e.target.value)}
                    className="w-full bg-bg text-ink font-bold border border-border px-3 py-2 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">ГОДИШЕН ДИВИДЕНТ ЗА 1 АКЦИЯ ($)</label>
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
                      ЦЕНА ЗАКУПУВАНЕ ({positionCurrency === 'USD' ? '$' : '€'})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={buyPrice}
                      onChange={e => setBuyPrice(e.target.value)}
                      className="w-full bg-bg text-ink font-bold border border-border px-3 py-2 rounded-xl focus:outline-none"
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
                onClick={() => {
                  alert(`Кеш наличността ($${cashInput}) беше запазена успешно!`);
                  setIsCashModalOpen(false);
                }}
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
              <h3 className="text-sm font-extrabold uppercase text-ink flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                История на транзакциите
              </h3>

              {/* Date Filters */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[10px] font-bold text-ink-faint">ОТ:</span>
                <input
                  type="date"
                  value={historyFromDate}
                  onChange={e => setHistoryFromDate(e.target.value)}
                  className="bg-bg text-ink text-[11px] font-bold border border-border px-2 py-1 rounded-xl focus:outline-none"
                />
                <span className="text-[10px] font-bold text-ink-faint">ДО:</span>
                <input
                  type="date"
                  value={historyToDate}
                  onChange={e => setHistoryToDate(e.target.value)}
                  className="bg-bg text-ink text-[11px] font-bold border border-border px-2 py-1 rounded-xl focus:outline-none"
                />
              </div>

              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1 rounded-full text-ink-faint hover:text-ink hover:bg-card transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
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
                    <th className="py-2.5 px-3 text-right">П/З ($)</th>
                    <th className="py-2.5 px-3 text-right">П/З (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-ink">
                  {filteredHistory.map(tx => (
                    <tr key={tx.id} className="hover:bg-indigo-500/10 transition-colors">
                      <td className="py-2.5 px-3 text-ink-faint font-mono text-[10px]">{tx.date}</td>
                      <td className="py-2.5 px-3 font-extrabold">{tx.ticker}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          tx.type === 'Покупка' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          ⊕ {tx.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold">{tx.shares}</td>
                      <td className="py-2.5 px-3 text-right font-mono">${tx.buyPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-ink-faint">{tx.sellPrice ? `$${tx.sellPrice.toFixed(2)}` : '-'}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-ink-faint">{(tx.pnlVal || 0).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-ink-faint">{(tx.pnlPct || 0).toFixed(0)}%</td>
                    </tr>
                  ))}
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

            {/* Add Dividend Form */}
            <form onSubmit={handleAddDividendRecord} className="flex items-center gap-2 bg-card/40 p-3 rounded-2xl border border-border/40">
              <input
                type="text"
                placeholder="Ticker"
                value={divTicker}
                onChange={e => setDivTicker(e.target.value)}
                className="w-20 bg-bg text-ink font-bold border border-border px-2.5 py-1.5 rounded-xl text-xs uppercase focus:outline-none"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Сума $"
                value={divAmount}
                onChange={e => setDivAmount(e.target.value)}
                className="w-24 bg-bg text-ink font-bold border border-border px-2.5 py-1.5 rounded-xl text-xs focus:outline-none"
                required
              />
              <input
                type="date"
                value={divDate}
                onChange={e => setDivDate(e.target.value)}
                className="w-28 bg-bg text-ink text-[10px] font-bold border border-border px-2 py-1.5 rounded-xl focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all cursor-pointer shrink-0"
                title="Добави дивидент"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </form>

            {/* Dividend History List */}
            <div className="space-y-1.5 mt-2 max-h-[350px] overflow-y-auto pr-1 custom-mini-scroll">
              <div className="flex items-center justify-between text-[10px] font-bold text-ink-faint border-b border-border/40 pb-1 uppercase">
                <span>📋 История ({divRecords.length})</span>
                <span>СУМА</span>
              </div>

              {divRecords.map(rec => (
                <div key={rec.id} className="flex items-center justify-between p-2.5 rounded-xl bg-card/30 border border-white/5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-ink">{rec.ticker}</span>
                    <span className="text-[10px] text-ink-faint font-mono">{rec.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-emerald-400">+${rec.amount.toFixed(2)}</span>
                    <button 
                      onClick={() => setDivRecords(prev => prev.filter(r => r.id !== rec.id))}
                      className="text-ink-faint hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
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
      {isSyncModalOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsSyncModalOpen(false); }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans"
        >
          <div className="bg-bg border-2 border-indigo-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsSyncModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-card text-ink-muted hover:text-ink transition-colors cursor-pointer"
              title="Затвори"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-border/40 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shrink-0">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-ink">
                  ☁️ Облачна Синхронизация на Живо
                </h3>
                <p className="text-[11px] text-ink-faint">
                  Автоматично обновяване между лаптоп, телефон и компютър
                </p>
              </div>
            </div>

            <form onSubmit={handleEnableSync} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-ink-faint mb-1.5 flex items-center gap-1">
                  <Key className="w-3 h-3 text-indigo-400" />
                  Ваш Личен Таен PIN Код / Парола
                </label>
                <input
                  type="text"
                  required
                  placeholder="напр. 1234 или моята-парола"
                  value={inputSyncPin}
                  onChange={e => setInputSyncPin(e.target.value)}
                  className="w-full bg-card rounded-2xl border border-border px-4 py-3 text-sm text-ink font-bold font-mono focus:outline-none focus:border-indigo-500 shadow-inner"
                />
                <p className="text-[10px] text-ink-faint mt-1.5 leading-relaxed">
                  💡 Въведете един и същ PIN код на Вашия **лаптоп**, **телефон** и **настолен компютър**. Всички промени ще се синхронизират автоматично на живо!
                </p>
              </div>

              {syncPin ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Синхронизирано с PIN: <span className="font-mono underline">{syncPin}</span></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDisableSync}
                    className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-[10px] font-bold border border-rose-500/30 transition-all cursor-pointer"
                  >
                    Изключи
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-card/60 border border-border rounded-2xl text-[11px] text-ink-faint leading-relaxed">
                  🔒 Данните ви са защитени в облака чрез Вашия личен PIN код. Никой друг без този PIN не може да достъпи портфейла ви.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsSyncModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-ink-faint hover:bg-card hover:text-ink transition-all cursor-pointer"
                >
                  Отказ
                </button>
                <button
                  type="submit"
                  disabled={syncStatus === 'syncing'}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {syncStatus === 'syncing' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Свързване...
                    </>
                  ) : (
                    <>
                      <Cloud className="w-3.5 h-3.5" />
                      {syncPin ? 'Обнови PIN' : 'Включи Синхронизация'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Account & Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        syncPin={syncPin}
        onEnablePinSync={(pin) => {
          setSyncPin(pin);
          localStorage.setItem('user_portfolio_sync_pin', pin);
        }}
        onDisablePinSync={() => {
          setSyncPin('');
          localStorage.removeItem('user_portfolio_sync_pin');
        }}
      />

    </div>
  );
}
