import React, { useState } from 'react';
import { Stock, PortfolioPosition } from '../types';
import { 
  Briefcase, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Calendar,
  Check,
  XCircle,
  Coins
} from 'lucide-react';

interface Props {
  stocks: Stock[];
  positions: PortfolioPosition[];
  onAddPosition: (pos: Omit<PortfolioPosition, 'id'>) => void;
  onUpdatePosition: (id: string, pos: Omit<PortfolioPosition, 'id'>) => void;
  onDeletePosition: (id: string) => void;
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

export default function PortfolioTracker({ 
  stocks, 
  positions, 
  onAddPosition, 
  onUpdatePosition, 
  onDeletePosition 
}: Props) {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Auto-fill buy price when ticker is selected/typed
  const handleTickerChange = (newTick: string) => {
    setTicker(newTick);
    const upper = newTick.trim().toUpperCase();
    const found = stocks.find(s => s.ticker === upper);
    if (found && !buyPrice) {
      const price = found.currentPrice || found.priceOfCalc || 0;
      if (price > 0) {
        setBuyPrice(price.toFixed(2));
      }
    }
  };

  const handleStartEdit = (pos: PortfolioPosition) => {
    setEditingId(pos.id);
    setTicker(pos.ticker);
    setShares(pos.shares.toString());
    setBuyPrice(pos.buyPrice.toString());
    setBuyDate(pos.buyDate || new Date().toISOString().split('T')[0]);
    setNotes(pos.notes || '');
    setFormError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTicker('');
    setShares('');
    setBuyPrice('');
    setNotes('');
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!ticker.trim()) {
      setFormError('Моля въведете тикер на акция');
      return;
    }

    const sharesNum = parseFloat(shares);
    if (isNaN(sharesNum) || sharesNum <= 0) {
      setFormError('Моля въведете валиден брой акции');
      return;
    }

    const priceNum = parseFloat(buyPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Моля въведете валидна покупна цена');
      return;
    }

    const payload = {
      ticker: ticker.trim().toUpperCase(),
      shares: sharesNum,
      buyPrice: priceNum,
      buyDate: buyDate || new Date().toISOString().split('T')[0],
      notes: notes.trim()
    };

    if (editingId) {
      onUpdatePosition(editingId, payload);
      setEditingId(null);
    } else {
      onAddPosition(payload);
    }

    setTicker('');
    setShares('');
    setBuyPrice('');
    setNotes('');
  };

  // Calculations for Portfolio Summary Dashboard
  let totalInvested = 0;
  let totalMarketValue = 0;
  let totalAnnualDividend = 0;

  const enrichedPositions = positions.map(pos => {
    const matchingStock = stocks.find(s => s.ticker === pos.ticker);
    const curPrice = matchingStock?.currentPrice || matchingStock?.priceOfCalc || pos.buyPrice;
    
    const costBasis = pos.shares * pos.buyPrice;
    const currentVal = pos.shares * curPrice;
    const pnlVal = currentVal - costBasis;
    const pnlPct = costBasis > 0 ? (pnlVal / costBasis) * 100 : 0;

    totalInvested += costBasis;
    totalMarketValue += currentVal;

    // Parse dividend if available (e.g. "3.50$" or "2.5%")
    if (matchingStock?.dividend) {
      const divMatch = matchingStock.dividend.match(/([\d.]+)/);
      if (divMatch) {
        const divVal = parseFloat(divMatch[1]);
        if (!isNaN(divVal) && divVal > 0) {
          totalAnnualDividend += pos.shares * divVal;
        }
      }
    }

    return {
      ...pos,
      matchingStock,
      curPrice,
      costBasis,
      currentVal,
      pnlVal,
      pnlPct
    };
  });

  const totalPnlVal = totalMarketValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnlVal / totalInvested) * 100 : 0;
  const isTotalProfit = totalPnlVal >= 0;

  return (
    <div className="space-y-4 font-sans">
      {/* Portfolio Summary Dashboard Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Value */}
        <div className="bg-bg rounded-2xl border border-border p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-ink-faint tracking-wider">
              Обща Стойност
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-ink font-sans tabular-nums">
              ${totalMarketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[10px] text-ink-faint mt-1">
            Текуща пазарна цена на портфейла
          </p>
        </div>

        {/* Card 2: Total Invested Cost */}
        <div className="bg-bg rounded-2xl border border-border p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-ink-faint tracking-wider">
              Инвестиран Капитал
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-ink font-sans tabular-nums">
              ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[10px] text-ink-faint mt-1">
            Общо вложени средства (Покупна цена)
          </p>
        </div>

        {/* Card 3: Total Profit/Loss */}
        <div className="bg-bg rounded-2xl border border-border p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-ink-faint tracking-wider">
              Нето Печалба / Загуба
            </span>
            <div className={`p-2 rounded-xl border ${
              isTotalProfit 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {isTotalProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-xl font-extrabold font-sans tabular-nums ${
              isTotalProfit ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {isTotalProfit ? '+' : ''}${totalPnlVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md border ${
              isTotalProfit 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {isTotalProfit ? '+' : ''}{totalPnlPct.toFixed(2)}%
            </span>
          </div>
          <p className="text-[10px] text-ink-faint mt-1">
            Общ възвращаемостен доход от инвестициите
          </p>
        </div>

        {/* Card 4: Est. Annual Dividend */}
        <div className="bg-bg rounded-2xl border border-border p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-ink-faint tracking-wider">
              Очакван Годишен Дивидент
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-purple-400 font-sans tabular-nums">
              ${totalAnnualDividend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[10px] text-ink-faint mt-1">
            Прогнозен пасивен приход за 12 месеца
          </p>
        </div>
      </div>

      {/* Main Container: Form + Positions Table */}
      <div className="w-full bg-bg rounded-2xl border border-border overflow-hidden shadow-xs">
        {/* Toolbar Form */}
        <div className="p-3 bg-bg border-b border-border">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-2.5 w-full">
            <div className="col-span-1 sm:w-32">
              <label className="block text-[9px] text-ink-faint font-semibold uppercase mb-0.5">ТИКЕР</label>
              <input
                type="text"
                placeholder="AAPL..."
                value={ticker}
                onChange={e => handleTickerChange(e.target.value)}
                className="w-full bg-bg rounded-xl border border-border px-2 py-1 text-xs text-ink uppercase font-bold focus:outline-none focus:border-indigo-500 font-sans tabular-nums"
                required
              />
            </div>

            <div className="col-span-1 sm:w-28">
              <label className="block text-[9px] text-ink-faint font-semibold uppercase mb-0.5">БРОЙ АКЦИИ</label>
              <input
                type="number"
                step="any"
                placeholder="10"
                value={shares}
                onChange={e => setShares(e.target.value)}
                className="w-full bg-bg rounded-xl border border-border px-2 py-1 text-xs text-ink font-bold focus:outline-none focus:border-indigo-500 font-sans tabular-nums"
                required
              />
            </div>

            <div className="col-span-1 sm:w-32">
              <label className="block text-[9px] text-ink-faint font-semibold uppercase mb-0.5">ПОКУПНА ЦЕНА ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="150.00"
                value={buyPrice}
                onChange={e => setBuyPrice(e.target.value)}
                className="w-full bg-bg rounded-xl border border-border px-2 py-1 text-xs text-ink font-bold focus:outline-none focus:border-indigo-500 font-sans tabular-nums"
                required
              />
            </div>

            <div className="col-span-1 sm:w-36">
              <label className="block text-[9px] text-ink-faint font-semibold uppercase mb-0.5">ДАТА НА ПОКУПКА</label>
              <input
                type="date"
                value={buyDate}
                onChange={e => setBuyDate(e.target.value)}
                className="w-full bg-bg rounded-xl border border-border px-2 py-1 text-xs text-ink font-bold focus:outline-none focus:border-indigo-500 font-sans tabular-nums h-[28px]"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-wrap items-center justify-end gap-1.5 sm:ml-auto w-full sm:w-auto">
              <button
                type="submit"
                className={`w-full sm:w-auto px-3.5 py-1 text-xs font-sans tabular-nums font-extrabold uppercase transition-all rounded-md border flex items-center justify-center gap-1 cursor-pointer shrink-0 h-[30px] ${
                  editingId
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50 shadow-md ring-1 ring-emerald-400/30'
                    : 'border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white'
                }`}
              >
                {editingId ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Запази промяната
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    Добави позиция
                  </>
                )}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full sm:w-auto px-2.5 py-1 text-xs font-sans tabular-nums font-extrabold uppercase transition-all rounded-md border border-red-500/40 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center gap-1 cursor-pointer shrink-0 h-[30px]"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Отказ
                </button>
              )}
            </div>
          </form>

          {formError && (
            <p className="text-[10px] text-red-500 font-bold w-full mt-1.5">{formError}</p>
          )}
        </div>

        {/* Positions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans tabular-nums text-xs">
            <thead>
              <tr className="border-b border-border bg-card/40 text-[10px] font-extrabold uppercase text-ink-faint tracking-wider">
                <th className="py-3 px-4">АКТИВ</th>
                <th className="py-3 px-4 text-right">БРОЙ</th>
                <th className="py-3 px-4 text-right">ПОКУПНА ЦЕНА</th>
                <th className="py-3 px-4 text-right">ИНВЕСТИРАНО</th>
                <th className="py-3 px-4 text-right">ТЕКУЩА ЦЕНА</th>
                <th className="py-3 px-4 text-right">ТЕКУЩА СТОЙНОСТ</th>
                <th className="py-3 px-4 text-right">ПЕЧАЛБА / ЗАГУБА</th>
                <th className="py-3 px-4 text-center">ДЕЙСТВИЯ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-ink">
              {enrichedPositions.length > 0 ? (
                enrichedPositions.map(pos => {
                  const isProfit = pos.pnlVal >= 0;
                  const isEditing = editingId === pos.id;

                  return (
                    <tr 
                      key={pos.id}
                      className={`transition-all duration-150 group cursor-pointer ${
                        isEditing 
                          ? 'bg-indigo-500/20 text-ink ring-2 ring-indigo-500/50 shadow-md font-bold' 
                          : 'hover:bg-indigo-500/10'
                      }`}
                      onClick={() => handleStartEdit(pos)}
                    >
                      {/* Active / Ticker */}
                      <td className="py-3 px-4 font-sans first:rounded-l-xl">
                        <div className="flex items-center gap-2">
                          <StockLogo ticker={pos.ticker} />
                          <div>
                            <div className="font-extrabold text-ink flex items-center gap-1.5">
                              <span>{pos.ticker}</span>
                              <Edit3 className="w-3 h-3 text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {pos.matchingStock?.companyName && (
                              <div className="text-[10px] text-ink-muted truncate max-w-[140px]">
                                {pos.matchingStock.companyName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Shares */}
                      <td className="py-3 px-4 text-right font-extrabold">
                        {pos.shares}
                      </td>

                      {/* Buy Price */}
                      <td className="py-3 px-4 text-right font-mono text-ink-faint">
                        ${pos.buyPrice.toFixed(2)}
                      </td>

                      {/* Cost Basis */}
                      <td className="py-3 px-4 text-right font-mono text-ink font-semibold">
                        ${pos.costBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Current Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-ink">
                        ${pos.curPrice.toFixed(2)}
                      </td>

                      {/* Current Market Value */}
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-ink">
                        ${pos.currentVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Profit/Loss */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-extrabold font-mono flex items-center gap-1 ${
                            isProfit ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isProfit ? '+' : ''}${pos.pnlVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            isProfit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {isProfit ? '+' : ''}{pos.pnlPct.toFixed(2)}%
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center last:rounded-r-xl">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (editingId === pos.id) {
                                handleCancelEdit();
                              }
                              onDeletePosition(pos.id);
                            }}
                            className="p-1 rounded-md text-ink-faint hover:text-red-500 transition-colors cursor-pointer"
                            title="Изтрий позицията"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-ink-faint text-xs">
                    Все още нямате въведени позиции в Portfolio Tracker. Въведете вашия първи актив от формата по-горе!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
