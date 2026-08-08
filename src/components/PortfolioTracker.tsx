import React, { useState } from 'react';
import { Stock, PortfolioPosition, PortfolioTransaction, PortfolioDividendRecord } from '../types';
import { 
  Briefcase, 
  PlusCircle, 
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
  ExternalLink
} from 'lucide-react';

interface Props {
  stocks: Stock[];
  positions: PortfolioPosition[];
  transactions?: PortfolioTransaction[];
  dividends?: PortfolioDividendRecord[];
  cashBalance?: number;
  onAddPosition: (pos: Omit<PortfolioPosition, 'id'>) => void;
  onUpdatePosition: (id: string, pos: Omit<PortfolioPosition, 'id'>) => void;
  onDeletePosition: (id: string) => void;
  onAddTransaction?: (tx: Omit<PortfolioTransaction, 'id'>) => void;
  onAddDividend?: (div: Omit<PortfolioDividendRecord, 'id'>) => void;
  onUpdateCash?: (cash: number) => void;
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
  onAddPosition, 
  onUpdatePosition, 
  onDeletePosition,
  onAddTransaction,
  onAddDividend,
  onUpdateCash
}: Props) {
  // Main form state
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

  // Cash management state
  const [cashInput, setCashInput] = useState(cashBalance.toString());

  // Dividend ledger form state
  const [divTicker, setDivTicker] = useState('AAPL');
  const [divAmount, setDivAmount] = useState('24.58');
  const [divDate, setDivDate] = useState(new Date().toISOString().split('T')[0]);
  const [divRecords, setDivRecords] = useState<PortfolioDividendRecord[]>(
    dividends.length > 0 ? dividends : [
      { id: 'd1', ticker: 'AAPL', amount: 24.58, date: '2026-05-01' },
      { id: 'd2', ticker: 'NVDA', amount: 12.00, date: '2026-04-10' },
      { id: 'd3', ticker: 'AAPL', amount: 24.58, date: '2026-03-15' },
    ]
  );

  // Transactions History
  const [history, setHistory] = useState<PortfolioTransaction[]>(
    transactions.length > 0 ? transactions : [
      { id: 't1', date: '2026-05-29', ticker: 'SXR8', type: 'Покупка', shares: 10, buyPrice: 500.00, pnlVal: 0, pnlPct: 0 },
      { id: 't2', date: '2026-05-29', ticker: 'QCOM', type: 'Покупка', shares: 10, buyPrice: 150.00, pnlVal: 178.70, pnlPct: 11.91 },
      { id: 't3', date: '2026-01-10', ticker: 'AAPL', type: 'Покупка', shares: 10, buyPrice: 150.00, pnlVal: 1633.00, pnlPct: 108.87 },
      { id: 't4', date: '2026-02-15', ticker: 'NVDA', type: 'Покупка', shares: 15, buyPrice: 90.00, pnlVal: 0, pnlPct: 0 },
      { id: 't5', date: '2026-03-20', ticker: 'BTC', type: 'Покупка', shares: 0.5, buyPrice: 48000.00, pnlVal: 0, pnlPct: 0 },
      { id: 't6', date: '2026-04-05', ticker: 'ETH', type: 'Покупка', shares: 2.2, buyPrice: 2200.00, pnlVal: 0, pnlPct: 0 },
    ]
  );

  // AI Audit Modal, Add Position Modal & Cash Modal state
  const [isAiAuditOpen, setIsAiAuditOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cagrHorizon, setCagrHorizon] = useState<'1г.' | '2г.' | '3г.' | '5г.'>('2г.');

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

    const payload = {
      ticker: ticker.trim().toUpperCase(),
      companyName: companyName.trim(),
      shares: sharesNum,
      buyPrice: priceNum,
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

  // Default demo positions if empty
  const activeHoldings = positions.length > 0 ? positions : [
    { id: '1', ticker: 'AAPL', companyName: 'Apple Inc.', shares: 10, buyPrice: 150.00, fee: 0, buyDate: '2026-01-10', fairPrice: 180, annualDivPerShare: 1.00 },
    { id: '2', ticker: 'QCOM', companyName: 'QUALCOMM Inc.', shares: 10, buyPrice: 150.00, fee: 0, buyDate: '2026-05-29', fairPrice: 180, annualDivPerShare: 3.40 }
  ];

  // Portfolio Dashboard Calculations
  let totalCostBasis = 0;
  let totalCurrentValue = 0;
  let totalDivEarned = divRecords.reduce((acc, r) => acc + r.amount, 0);

  const enrichedHoldings = activeHoldings.map(pos => {
    const matching = stocks.find(s => s.ticker === pos.ticker);
    const curPrice = matching?.currentPrice || matching?.priceOfCalc || pos.buyPrice;
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

  const totalPortfolioValue = totalCurrentValue + (parseFloat(cashInput) || 0);
  const totalReturnVal = totalCurrentValue - totalCostBasis;
  const totalReturnPct = totalCostBasis > 0 ? (totalReturnVal / totalCostBasis) * 100 : 0;
  const isOverallProfit = totalReturnVal >= 0;

  // Filtered History
  const filteredHistory = history.filter(h => {
    if (historyFromDate && h.date < historyFromDate) return false;
    if (historyToDate && h.date > historyToDate) return false;
    return true;
  });

  return (
    <div className="space-y-4 font-sans text-ink">
      
      {/* ======================================================================== */}
      {/* ROW 1: TOP DASHBOARD METRIC CARDS (Exact match to User Image 3 & 4)      */}
      {/* ======================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: СТОЙНОСТ */}
        <div className="bg-bg border border-border rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-ink-faint tracking-wider">
              СТОЙНОСТ
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-ink font-sans tabular-nums">
              ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[10px] text-ink-faint mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Вкл. ${parseFloat(cashInput) || 0}.00 свободен кеш
          </p>
        </div>

        {/* Card 2: ИНВЕСТИРАНА СУМА */}
        <div className="bg-bg border border-border rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-ink-faint tracking-wider">
              ИНВЕСТИРАНА СУМА
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-ink font-sans tabular-nums">
              ${totalCostBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[10px] text-ink-faint mt-1">
            Първоначално внесен портфейлен капитал
          </p>
        </div>

        {/* Card 3: ДОХОДНОСТ (с див.) */}
        <div className="bg-bg border border-border rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-ink-faint tracking-wider">
              ДОХОДНОСТ (с див.)
            </span>
            <div className={`p-2 rounded-xl border ${
              isOverallProfit 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {isOverallProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-xl font-extrabold font-sans tabular-nums ${
              isOverallProfit ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {isOverallProfit ? '+' : ''}${totalReturnVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md border ${
              isOverallProfit 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              ▲ {totalReturnPct.toFixed(2)}%
            </span>
          </div>
          <p className="text-[10px] text-ink-faint mt-1">
            Дневен дял: -0.12%
          </p>
        </div>

        {/* Card 4: РЕАЛИЗИРАНА П/З */}
        <div className="bg-bg border border-border rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-ink-faint tracking-wider">
              РЕАЛИЗИРАНА П/З
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-emerald-400 font-sans tabular-nums">
              +$0.00
            </span>
          </div>
          <p className="text-[10px] text-ink-faint mt-1">
            Прогн. див: ${totalDivEarned.toFixed(2)} / 12м
          </p>
        </div>

        {/* Card 5: CAGR ЛИХВА */}
        <div className="bg-bg border border-border rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-ink-faint tracking-wider">
              CAGR ЛИХВА
            </span>
            <select
              value={cagrHorizon}
              onChange={e => setCagrHorizon(e.target.value as any)}
              className="bg-bg text-xs font-bold text-ink border border-border px-1.5 py-0.5 rounded-lg focus:outline-none"
            >
              <option value="1г.">1г.</option>
              <option value="2г.">2г.</option>
              <option value="3г.">3г.</option>
              <option value="5г.">5г.</option>
            </select>
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-emerald-400 font-sans tabular-nums">
              +27.45% <span className="text-xs text-ink-faint font-normal">/ год.</span>
            </span>
          </div>
          <p className="text-[10px] text-ink-faint mt-1">
            Годишен хоризонт за {cagrHorizon}
          </p>
        </div>
      </div>

      {/* ======================================================================== */}
      {/* ROW 2: CHARTS & ANALYTICS WIDGETS (Exact match to User Image 3)          */}
      {/* ======================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        
        {/* Widget 1: Invest vs Return Bar Chart */}
        <div className="bg-bg border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
            <h4 className="text-xs font-extrabold text-ink flex items-center gap-1.5 uppercase">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Invest vs Return
            </h4>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              +${totalReturnVal.toFixed(0)} (▲ {totalReturnPct.toFixed(1)}%)
            </span>
          </div>

          <div className="space-y-2 text-xs mb-3">
            <div className="flex justify-between text-ink-faint">
              <span>Вложени:</span>
              <span className="font-extrabold text-ink">${totalCostBasis.toLocaleString('en-US')}</span>
            </div>
            <div className="flex justify-between text-ink-faint">
              <span>Пазарна Оценка:</span>
              <span className="font-extrabold text-ink">${totalCurrentValue.toLocaleString('en-US')}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Дивиденти:</span>
              <span>+${totalDivEarned.toFixed(0)}</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-1.5 font-extrabold text-ink">
              <span>Обща Стойност:</span>
              <span className="text-indigo-400">${(totalCurrentValue + totalDivEarned).toLocaleString('en-US')}</span>
            </div>
          </div>

          {/* Graphical Bar Comparison */}
          <div className="flex items-end justify-center gap-6 h-28 pt-2 bg-card/20 rounded-xl border border-border/40">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-ink-faint font-bold">${(totalCostBasis / 1000).toFixed(1)}k</span>
              <div className="w-8 bg-gray-600/60 rounded-t-md transition-all" style={{ height: '55%' }}></div>
              <span className="text-[9px] text-ink-faint uppercase font-bold">Вложени</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-emerald-400 font-bold">${((totalCurrentValue + totalDivEarned) / 1000).toFixed(1)}k</span>
              <div className="w-8 bg-emerald-500 rounded-t-md transition-all shadow-md shadow-emerald-500/20" style={{ height: '88%' }}></div>
              <span className="text-[9px] text-emerald-400 uppercase font-bold">Общо</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Разпределение на активите (Donut Chart) */}
        <div className="bg-bg border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
            <h4 className="text-xs font-extrabold text-ink flex items-center gap-1.5 uppercase">
              <Coins className="w-3.5 h-3.5 text-indigo-400" />
              Разпределение на активите
            </h4>
            <span className="text-[10px] text-ink-faint">Активи: {enrichedHoldings.length}</span>
          </div>

          <div className="flex items-center justify-center py-2">
            {/* Visual CSS Donut */}
            <div className="relative w-28 h-28 rounded-full border-8 border-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/10" style={{
              background: `conic-gradient(#6366f1 0% 65%, #3b82f6 65% 100%)`
            }}>
              <div className="w-20 h-20 rounded-full bg-bg flex items-center justify-center flex-col text-center">
                <span className="text-[10px] font-extrabold text-ink">PORTFOLIO</span>
                <span className="text-[9px] text-indigo-400 font-bold">100%</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            {enrichedHoldings.slice(0, 3).map((h, i) => {
              const sharePct = totalCurrentValue > 0 ? ((h.currentVal / totalCurrentValue) * 100).toFixed(1) : '0';
              const dotColor = i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-blue-500' : 'bg-purple-500';
              return (
                <div key={h.id} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                    <span className="font-extrabold text-ink">{h.ticker}</span>
                    <span className="text-ink-faint text-[10px] truncate max-w-[80px]">{h.companyName}</span>
                  </div>
                  <span className="font-bold text-ink">{sharePct}% <span className="text-ink-faint">(${Math.round(h.currentVal)})</span></span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Widget 3: Бенчмарк сравнение */}
        <div className="bg-bg border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2 border-b border-border/40 pb-2">
            <h4 className="text-xs font-extrabold text-ink flex items-center gap-1.5 uppercase">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Бенчмарк сравнение
            </h4>
            <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              ✨ Лидер днес: Nasdaq-100 (QQQ)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center my-2">
            <div className="bg-card/40 p-1.5 rounded-xl border border-border/40">
              <span className="text-[9px] text-ink-faint font-bold block">Моят Портфе...</span>
              <span className="text-xs font-black text-emerald-400">+62.42%</span>
              <span className="text-[8px] text-ink-faint block">Днес: -0.12%</span>
            </div>
            <div className="bg-card/40 p-1.5 rounded-xl border border-border/40">
              <span className="text-[9px] text-ink-faint font-bold block">S&P 500 (SPY)</span>
              <span className="text-xs font-black text-emerald-400">+0.61%</span>
              <span className="text-[8px] text-ink-faint block">Дневно движ...</span>
            </div>
            <div className="bg-card/40 p-1.5 rounded-xl border border-border/40">
              <span className="text-[9px] text-ink-faint font-bold block">Nasdaq-100 (QQQ)</span>
              <span className="text-xs font-black text-emerald-400">+1.17%</span>
              <span className="text-[8px] text-ink-faint block">Технологичен ...</span>
            </div>
          </div>

          <div className="bg-card/20 p-2 rounded-xl border border-border/40 space-y-1.5">
            <span className="text-[9px] text-ink-faint font-bold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              Кой води в състезанието днес? (Дневно движение)
            </span>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">Моят Портфейл</span>
                <div className="w-24 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[15%]"></div>
                </div>
                <span className="text-rose-400 font-bold text-[9px]">-0.12%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">S&P 500 (SPY)</span>
                <div className="w-24 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[60%]"></div>
                </div>
                <span className="text-emerald-400 font-bold text-[9px]">+0.61%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">Nasdaq-100 (QQQ)</span>
                <div className="w-24 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[85%]"></div>
                </div>
                <span className="text-emerald-400 font-bold text-[9px]">+1.17%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 4: AI Инвестиционен Одит (Gemini AI Audit) */}
        <div className="bg-bg border border-border rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
              <h4 className="text-xs font-extrabold text-ink flex items-center gap-1.5 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI Инвестиционен Одит
                <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-black px-1.5 py-0.2 rounded border border-indigo-500/30">GEMINI</span>
              </h4>
            </div>

            <p className="text-xs text-ink-faint text-center my-4">
              Готови ли сте за професионален AI одит и преглед на диверсификацията?
            </p>
          </div>

          <button
            onClick={() => setIsAiAuditOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Стартирай AI Инвестиционен Одит
          </button>
        </div>

      </div>

      {/* ======================================================================== */}
      {/* ROW 3: СНД: Списък с Активи (Main Portfolio Table - Image 2)              */}
      {/* ======================================================================== */}
      <div className="bg-bg border border-border rounded-2xl overflow-hidden shadow-xs">
        {/* Table Header Controls */}
        <div className="p-3 border-b border-border/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xs uppercase font-extrabold text-ink font-sans tracking-wide flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              СНД: Списък с Активи
            </h3>

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
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Добавяне на Нов Актив
            </button>

            <button 
              onClick={() => setIsCashModalOpen(true)}
              className="bg-card/60 hover:bg-card border border-border text-emerald-400 font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Coins className="w-4 h-4 text-emerald-400" />
              Кеш: ${(parseFloat(cashInput) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </button>

            <button 
              onClick={() => window.location.reload()}
              className="bg-card/60 hover:bg-card border border-border text-ink-muted hover:text-ink px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-indigo-400" />
              Обнови цените в реално време
            </button>

            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 hidden sm:inline-flex">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Пазарите са активни (НА ЖИВО през Yahoo Finance)
            </span>
          </div>

          <span className="text-[10px] text-ink-faint font-extrabold uppercase bg-card/40 px-2.5 py-1 rounded-xl border border-white/5">
            ОБЩО ПОЗИЦИИ: {enrichedHoldings.length}
          </span>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans tabular-nums text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-card/40 text-[9px] font-extrabold uppercase text-ink-faint tracking-wider">
                <th className="py-2.5 px-3">TICKER</th>
                <th className="py-2.5 px-3">COMPANY NAME</th>
                <th className="py-2.5 px-3 text-right">% OF PORTFOLIO</th>
                <th className="py-2.5 px-3 text-right">SHARES</th>
                <th className="py-2.5 px-3 text-right">AVG. PRICE</th>
                <th className="py-2.5 px-3 text-right">FEE</th>
                <th className="py-2.5 px-3 text-right">COST BASIS</th>
                <th className="py-2.5 px-3 text-center">DATE OF PURCHASE</th>
                <th className="py-2.5 px-3 text-center">DAILY CHANGE %</th>
                <th className="py-2.5 px-3 text-right">CURRENT PRICE</th>
                <th className="py-2.5 px-3 text-right">FAIR PRICE</th>
                <th className="py-2.5 px-3 text-center">DIFFERENCE</th>
                <th className="py-2.5 px-3 text-center">BUY / SELL</th>
                <th className="py-2.5 px-3 text-right">PROFIT / LOSS %</th>
                <th className="py-2.5 px-3 text-right">UNRLZD P&L ($)</th>
                <th className="py-2.5 px-3 text-right">VALUE</th>
                <th className="py-2.5 px-3 text-right">DIVIDEND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-ink">
              {enrichedHoldings.map(pos => {
                const isPosProfit = pos.pnlVal >= 0;
                const isFairUndervalued = pos.diffVsFair > 0;
                const isDailyUp = (pos.matching?.dailyChangePct || 0) >= 0;
                const shareOfPortfolioPct = totalCurrentValue > 0 ? (pos.currentVal / totalCurrentValue) * 100 : 0;

                return (
                  <tr 
                    key={pos.id}
                    className="hover:bg-indigo-500/10 transition-colors duration-150 group cursor-pointer"
                    onClick={() => handleStartEdit(pos)}
                  >
                    {/* 1. Ticker */}
                    <td className="py-3 px-3 first:rounded-l-xl">
                      <div className="flex items-center gap-2">
                        <StockLogo ticker={pos.ticker} />
                        <span className="font-extrabold text-ink">{pos.ticker}</span>
                      </div>
                    </td>

                    {/* 2. Company Name */}
                    <td className="py-3 px-3 text-ink-muted font-bold text-xs truncate max-w-[130px]">
                      {pos.companyName || pos.ticker}
                    </td>

                    {/* 3. % of Portfolio */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-indigo-400">
                      {shareOfPortfolioPct.toFixed(1)}%
                    </td>

                    {/* 4. Shares */}
                    <td className="py-3 px-3 text-right font-extrabold text-ink">
                      {pos.shares}
                    </td>

                    {/* 5. Avg. Price */}
                    <td className="py-3 px-3 text-right font-mono text-ink-faint">
                      ${pos.buyPrice.toFixed(2)}
                    </td>

                    {/* 6. Fee */}
                    <td className="py-3 px-3 text-right font-mono text-ink-faint">
                      ${(pos.fee || 0).toFixed(2)}
                    </td>

                    {/* 7. Cost Basis */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-ink">
                      ${pos.costBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                      ${pos.curPrice.toFixed(2)}
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

                    {/* 13. BUY/SELL Buttons */}
                    <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleStartEdit(pos)}
                          className="px-2 py-0.5 bg-emerald-600/80 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded uppercase transition-all"
                        >
                          BUY
                        </button>
                        <button
                          onClick={() => handleStartEdit(pos)}
                          className="px-2 py-0.5 bg-amber-600/80 hover:bg-amber-500 text-white font-extrabold text-[10px] rounded uppercase transition-all"
                        >
                          SELL
                        </button>
                        <button
                          onClick={() => onDeletePosition(pos.id)}
                          className="p-1 text-ink-faint hover:text-red-400 transition-colors"
                          title="Изтрий"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* 14. Profit / Loss % */}
                    <td className="py-3 px-3 text-right">
                      <span className={`font-mono font-black text-[11px] ${
                        isPosProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isPosProfit ? '▲' : '▼'} {pos.pnlPct.toFixed(2)}%
                      </span>
                    </td>

                    {/* 15. Unrlzd P&L $ */}
                    <td className="py-3 px-3 text-right font-mono font-extrabold">
                      <span className={isPosProfit ? 'text-emerald-400' : 'text-rose-400'}>
                        {isPosProfit ? '+' : ''}${pos.pnlVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* 16. Value */}
                    <td className="py-3 px-3 text-right font-mono font-black text-ink">
                      ${pos.currentVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* 17. Dividend */}
                    <td className="py-3 px-3 text-right last:rounded-r-xl">
                      <span className="font-mono text-emerald-400 font-extrabold block">
                        ${((pos.annualDivPerShare || 0) * pos.shares).toFixed(2)}
                      </span>
                      <span className="text-[9px] text-ink-faint block">
                        FY: {pos.matching?.dividend || '0.00%'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================================== */}
      {/* ROW 4: ИСТОРИЯ НА ТРАНЗАКЦИИТЕ & ПАЗАРНИ ТЕНДЕНЦИИ (Image 1)              */}
      {/* ======================================================================== */}
      {/* ROW 4: ТРАНЗАКЦИИ И УПРАВЛЕНИЕ НА КЕША                                   */}
      {/* ======================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Left Side: История на транзакциите (2 Cols) */}
        <div className="lg:col-span-2 bg-bg border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-border/40 pb-2">
            <h4 className="text-xs font-extrabold text-ink flex items-center gap-1.5 uppercase">
              <History className="w-4 h-4 text-indigo-400" />
              История на транзакциите
            </h4>

            {/* Date Filters */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-bold text-ink-faint">ОТ:</span>
              <input
                type="date"
                value={historyFromDate}
                onChange={e => setHistoryFromDate(e.target.value)}
                className="bg-bg text-ink text-[11px] font-bold border border-border px-2 py-0.5 rounded-lg focus:outline-none"
              />
              <span className="text-[10px] font-bold text-ink-faint">ДО:</span>
              <input
                type="date"
                value={historyToDate}
                onChange={e => setHistoryToDate(e.target.value)}
                className="bg-bg text-ink text-[11px] font-bold border border-border px-2 py-0.5 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans tabular-nums text-xs">
              <thead>
                <tr className="border-b border-border/40 text-[9px] font-extrabold uppercase text-ink-faint">
                  <th className="py-2 px-3">ДАТА</th>
                  <th className="py-2 px-3">ТИКЕР</th>
                  <th className="py-2 px-3 text-center">ТИП</th>
                  <th className="py-2 px-3 text-right">АКЦИИ</th>
                  <th className="py-2 px-3 text-right">ПОК. ЦЕНА</th>
                  <th className="py-2 px-3 text-right">ПРОД. ЦЕНА</th>
                  <th className="py-2 px-3 text-right">П/З ($)</th>
                  <th className="py-2 px-3 text-right">П/З (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-ink">
                {filteredHistory.map(tx => (
                  <tr key={tx.id} className="hover:bg-indigo-500/10 transition-colors">
                    <td className="py-2 px-3 text-ink-faint font-mono text-[10px]">{tx.date}</td>
                    <td className="py-2 px-3 font-extrabold">{tx.ticker}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        tx.type === 'Покупка' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        ⊕ {tx.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-extrabold">{tx.shares}</td>
                    <td className="py-2 px-3 text-right font-mono">${tx.buyPrice.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono text-ink-faint">{tx.sellPrice ? `$${tx.sellPrice.toFixed(2)}` : '-'}</td>
                    <td className="py-2 px-3 text-right font-mono text-ink-faint">{(tx.pnlVal || 0).toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono text-ink-faint">{(tx.pnlPct || 0).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Получени Дивиденти (Мини Леджър) (1 Col) */}
        <div className="bg-bg border border-border rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <h4 className="text-xs font-extrabold text-ink flex items-center gap-1.5 uppercase">
              <Coins className="w-4 h-4 text-emerald-400" />
              Получени Дивиденти (Мини Леджър)
            </h4>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Общо: ${totalDivEarned.toFixed(2)}
            </span>
          </div>

          {/* Add Dividend Form */}
          <form onSubmit={handleAddDividendRecord} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Ticker"
              value={divTicker}
              onChange={e => setDivTicker(e.target.value)}
              className="w-20 bg-bg text-ink font-bold border border-border px-2 py-1 rounded-xl text-xs uppercase focus:outline-none"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Сума $"
              value={divAmount}
              onChange={e => setDivAmount(e.target.value)}
              className="w-24 bg-bg text-ink font-bold border border-border px-2 py-1 rounded-xl text-xs focus:outline-none"
              required
            />
            <input
              type="date"
              value={divDate}
              onChange={e => setDivDate(e.target.value)}
              className="w-28 bg-bg text-ink text-[10px] font-bold border border-border px-1.5 py-1 rounded-xl focus:outline-none"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all cursor-pointer shrink-0"
              title="Добави дивидент"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </form>

          {/* Dividend History List */}
          <div className="space-y-1.5 mt-2 max-h-[300px] overflow-y-auto pr-1 custom-mini-scroll">
            <div className="flex items-center justify-between text-[10px] font-bold text-ink-faint border-b border-border/40 pb-1 uppercase">
              <span>📋 История ({divRecords.length})</span>
              <span>СУМА</span>
            </div>

            {divRecords.map(rec => (
              <div key={rec.id} className="flex items-center justify-between p-2 rounded-xl bg-card/30 border border-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-ink">{rec.ticker}</span>
                  <span className="text-[9px] text-ink-faint font-mono">{rec.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-emerald-400">+${rec.amount.toFixed(2)}</span>
                  <button 
                    onClick={() => setDivRecords(prev => prev.filter(r => r.id !== rec.id))}
                    className="text-ink-faint hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>



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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">СР. ЦЕНА ЗАКУПУВАНЕ ($)</label>
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
                  <label className="block text-[10px] text-ink-faint font-extrabold uppercase mb-1">ТЕКУЩА ПАЗАРНА ЦЕНА ($)</label>
                  <input
                    type="text"
                    placeholder="Автоматично"
                    readOnly
                    value={buyPrice ? `$${buyPrice}` : ''}
                    className="w-full bg-bg/50 text-ink-muted font-bold border border-border/50 px-3 py-2 rounded-xl focus:outline-none"
                  />
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

    </div>
  );
}
