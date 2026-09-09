import React, { useState, useRef, useEffect } from 'react';
import { Stock, PriceAlert } from '../types';
import { 
  BellRing, 
  Ban, 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Pencil,
  Flame, 
  AlertTriangle, 
  Check, 
  Calendar,
  X,
  TrendingUp,
  TrendingDown,
  Bell,
  CheckCircle2
} from 'lucide-react';

interface Props {
  stocks: Stock[];
  alerts: PriceAlert[];
  onAddAlert: (ticker: string, criteria: 'ABOVE' | 'BELOW', target: number) => void;
  onUpdateAlert?: (id: string, ticker: string, criteria: 'ABOVE' | 'BELOW', target: number, isActive?: boolean) => void;
  onDeleteAlert: (id: string) => void;
}

const StockLogo = ({ ticker }: { ticker: string }) => {
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-ink-muted border border-white/20 shrink-0">
        {ticker.charAt(0)}
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

export default function PriceAlertPlanner({ stocks, alerts, onAddAlert, onUpdateAlert, onDeleteAlert }: Props) {
  const targetInputRef = useRef<HTMLInputElement>(null);
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [newTicker, setNewTicker] = useState('');
  const [criteria, setCriteria] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetVal, setTargetVal] = useState('');
  const [formError, setFormError] = useState('');

  // Modal State for Alert Editing
  const [editingModalAlert, setEditingModalAlert] = useState<PriceAlert | null>(null);
  const [modalCriteria, setModalCriteria] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [modalTargetVal, setModalTargetVal] = useState('');
  const [modalIsActive, setModalIsActive] = useState(true);
  const [modalError, setModalError] = useState('');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingModalAlert) {
        handleCloseEditModal();
      }
    };
    if (editingModalAlert) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingModalAlert]);

  const handleOpenEditModal = (alert: PriceAlert) => {
    setEditingModalAlert(alert);
    setModalCriteria(alert.criteria);
    setModalTargetVal(alert.targetPrice.toString());
    setModalIsActive(alert.isActive !== false);
    setModalError('');
  };

  const handleCloseEditModal = () => {
    setEditingModalAlert(null);
    setModalError('');
  };

  const handleSaveModalEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModalAlert) return;

    const priceNum = parseFloat(modalTargetVal);
    if (isNaN(priceNum) || priceNum <= 0) {
      setModalError('Моля въведете валидна таргет цена (по-голяма от 0)');
      return;
    }

    if (onUpdateAlert) {
      onUpdateAlert(editingModalAlert.id, editingModalAlert.ticker, modalCriteria, priceNum, modalIsActive);
    } else {
      onDeleteAlert(editingModalAlert.id);
      onAddAlert(editingModalAlert.ticker, modalCriteria, priceNum);
    }

    handleCloseEditModal();
  };

  const handleStartEdit = (alert: PriceAlert) => {
    setEditingAlertId(alert.id);
    setNewTicker(alert.ticker);
    setCriteria(alert.criteria);
    setTargetVal(alert.targetPrice.toString());
    setFormError('');
    setTimeout(() => {
      targetInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      targetInputRef.current?.focus();
      targetInputRef.current?.select();
    }, 50);
  };

  const handleCancelEdit = () => {
    setEditingAlertId(null);
    setNewTicker('');
    setCriteria('ABOVE');
    setTargetVal('');
    setFormError('');
  };

  const handleCreateOrUpdateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newTicker) {
      setFormError('Въведете тикер (напр. AAPL)');
      return;
    }
    const tick = newTicker.trim().toUpperCase();
    const foundStock = stocks.find(s => s.ticker === tick);
    if (!foundStock) {
      setFormError(`Не намерихме акция с тикер ${tick}`);
      return;
    }

    const priceNum = parseFloat(targetVal);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Въведете валидна цена');
      return;
    }

    if (editingAlertId) {
      if (onUpdateAlert) {
        onUpdateAlert(editingAlertId, tick, criteria, priceNum);
      } else {
        onDeleteAlert(editingAlertId);
        onAddAlert(tick, criteria, priceNum);
      }
      setEditingAlertId(null);
    } else {
      onAddAlert(tick, criteria, priceNum);
    }

    setNewTicker('');
    setTargetVal('');
  };

  return (
    <div className="w-full bg-bg rounded-2xl border border-border overflow-hidden shadow-xs font-sans">
      {/* Top Form Toolbar — styled matching StockTable toolbar with mobile responsiveness */}
      <div className="p-3 bg-bg border-b border-border">
        <form onSubmit={handleCreateOrUpdateAlert} className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-2.5 w-full">
          <div className="col-span-1 sm:w-28">
            <label className="block text-[9px] text-ink-faint font-semibold uppercase mb-0.5">ТИКЕР</label>
            <input
              type="text"
              placeholder="AAPL..."
              value={newTicker}
              onChange={e => setNewTicker(e.target.value)}
              className="w-full bg-bg rounded-xl border border-border px-2 py-1 text-xs text-ink uppercase font-bold focus:outline-none focus:border-indigo-500 font-sans tabular-nums"
            />
          </div>

          <div className="col-span-1 sm:w-36">
            <label className="block text-[9px] text-ink-faint font-semibold uppercase mb-0.5">СИГНАЛ ПРИ</label>
            <select
              value={criteria}
              onChange={e => setCriteria(e.target.value as any)}
              className="w-full bg-bg rounded-xl border border-border px-2 py-1 text-xs text-ink font-extrabold focus:outline-none focus:border-indigo-500 h-[28px]"
            >
              <option value="ABOVE">ЦЕНА НАД (▲)</option>
              <option value="BELOW">ЦЕНА ПОД (▼)</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1 sm:w-32">
            <label className="block text-[9px] text-ink-faint font-semibold uppercase mb-0.5">ТАРГЕТ ЦЕНА ($)</label>
            <input
              ref={targetInputRef}
              type="number"
              step="0.01"
              placeholder="400.00"
              value={targetVal}
              onChange={e => setTargetVal(e.target.value)}
              className="w-full bg-bg rounded-xl border border-border px-2 py-1 text-xs text-ink font-sans tabular-nums focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="col-span-2 sm:col-span-1 flex flex-wrap items-center justify-end gap-1.5 sm:ml-auto w-full sm:w-auto">
            <button
              type="submit"
              className={`w-full sm:w-auto px-3.5 py-1 text-xs font-sans tabular-nums font-extrabold uppercase transition-all rounded-md border flex items-center justify-center gap-1 cursor-pointer shrink-0 h-[30px] ${
                editingAlertId
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50 shadow-md ring-1 ring-emerald-400/30'
                  : 'border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white'
              }`}
            >
              {editingAlertId ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Запази промяната
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  Запази сигнала
                </>
              )}
            </button>

            {editingAlertId && (
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
          <p className="text-[10px] text-red-500 font-bold w-full mt-1">{formError}</p>
        )}
      </div>

      {/* Content Section: Active Triggers List */}
      <div className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-1 mb-2.5">
          <h4 className="text-[10px] font-extrabold text-ink flex items-center gap-1.5 uppercase tracking-wide">
            <BellRing className="w-3.5 h-3.5 text-indigo-400" />
            АКТИВНИ ТРИГЕРИ ({alerts.length}):
          </h4>
          <span className="text-[9px] text-ink-faint font-normal normal-case">
            (кликнете за редакция, макс 10 реда)
          </span>
        </div>

        {/* Column Headers for Active Triggers */}
        {alerts.length > 0 && (
          <div className="hidden sm:flex items-center justify-between px-3 py-2 mb-1.5 text-[10px] font-black uppercase text-ink-faint tracking-wider bg-card/40 border border-border/40 rounded-xl select-none">
            <div className="flex items-center gap-3">
              <div className="w-44 sm:w-56 shrink-0">Компания / Тикер</div>
              <div className="w-36 shrink-0 text-left">Сигнал при / Таргет</div>
            </div>
            <div className="flex items-center justify-end gap-2 shrink-0">
              <div className="w-24 text-center shrink-0">Current Price</div>
              <div className="w-24 text-center shrink-0">Fair Price</div>
              <div className="w-16 text-center shrink-0 flex items-center justify-center gap-1">
                <Pencil className="w-3 h-3 text-indigo-400" />
                <span>Редакция</span>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-y-auto max-h-[340px] pr-1 custom-mini-scroll">
          {alerts.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {alerts.map(alert => {
                const isBeingEdited = editingAlertId === alert.id;
                const matchingStock = stocks.find(s => s.ticker === alert.ticker);
                const curPrice = matchingStock?.currentPrice || matchingStock?.priceOfCalc || 0;

                const isTriggeredAbove = alert.criteria === 'ABOVE' && curPrice > 0 && curPrice >= alert.targetPrice;
                const isTriggeredBelow = alert.criteria === 'BELOW' && curPrice > 0 && curPrice <= alert.targetPrice;
                const isTriggered = isTriggeredAbove || isTriggeredBelow;

                const distancePct = curPrice > 0 ? Math.abs(curPrice - alert.targetPrice) / alert.targetPrice : 1;
                const isNear = !isTriggered && curPrice > 0 && distancePct <= 0.03;

                let badgeStyle = 'bg-card/60 border-border hover:border-indigo-400/60 hover:bg-white/5';
                if (isBeingEdited) {
                  badgeStyle = 'border-indigo-500 bg-indigo-500/20 ring-2 ring-indigo-500/50 shadow-md font-bold';
                } else if (isTriggeredAbove) {
                  badgeStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/50 animate-pulse font-bold';
                } else if (isTriggeredBelow) {
                  badgeStyle = 'border-rose-500 bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/50 animate-pulse font-bold';
                } else if (isNear) {
                  badgeStyle = 'border-amber-500/70 bg-amber-500/10 text-amber-300 font-semibold';
                }

                return (
                  <div
                    key={alert.id}
                    onClick={() => handleOpenEditModal(alert)}
                    className={`rounded-xl border px-3 py-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-sans tabular-nums cursor-pointer transition-all group ${badgeStyle}`}
                    title="Кликнете за редакция на сигнала за известие"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Left: Ticker & Company Name with fixed width so target column aligns vertically */}
                      <div className="flex items-center gap-2 w-44 sm:w-56 shrink-0 truncate">
                        <StockLogo ticker={alert.ticker} />
                        <span className="font-extrabold text-ink flex items-center gap-1.5 truncate">
                          <span>{alert.ticker}</span>
                          {matchingStock?.companyName && (
                            <span className="text-[11px] font-medium text-ink-muted truncate">
                              · {matchingStock.companyName}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Middle: Target Condition with click to edit */}
                      <div className="w-36 shrink-0">
                        {isTriggered ? (
                          <span className="flex items-center gap-1 font-extrabold text-xs">
                            <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                            {isTriggeredAbove ? 'ЗАДЕЙСТВАН НАД ▲' : 'ЗАДЕЙСТВАН ПОД ▼'} (${curPrice.toFixed(2)})
                          </span>
                        ) : isNear ? (
                          <span className="flex items-center gap-1 font-bold text-xs text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            БЛИЗО ДО ТАРГЕТА (${curPrice.toFixed(2)})
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(alert);
                            }}
                            className="text-xs font-bold text-ink flex items-center gap-1.5 bg-bg/80 border border-border/70 hover:border-indigo-500/60 px-2.5 py-1 rounded-lg transition-colors cursor-pointer group/cond shadow-2xs"
                            title="Кликнете за промяна на сигнала за известие"
                          >
                            <span className={`font-black ${alert.criteria === 'ABOVE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {alert.criteria === 'ABOVE' ? 'над ▲' : 'под ▼'}
                            </span>
                            <span className="font-black text-ink font-mono">${alert.targetPrice.toFixed(2)}</span>
                            <Pencil className="w-3 h-3 text-indigo-400 opacity-70 group-hover/cond:opacity-100" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/30 w-full sm:w-auto shrink-0">
                      {/* Current Price Column */}
                      <div className="w-24 text-center shrink-0">
                        {curPrice > 0 ? (
                          <span className="h-6.5 px-2.5 w-full rounded-lg border border-border/60 bg-bg/80 text-ink font-mono font-extrabold text-xs inline-flex items-center justify-center shadow-2xs">
                            ${curPrice.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-ink-faint font-mono text-xs">—</span>
                        )}
                      </div>

                      {/* Fair Price Column */}
                      <div className="w-24 text-center shrink-0">
                        {matchingStock?.fairPrice !== undefined && matchingStock?.fairPrice !== null ? (
                          <span className="h-6.5 px-2.5 w-full rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-mono font-bold text-xs inline-flex items-center justify-center shadow-2xs">
                            ${matchingStock.fairPrice.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-ink-faint font-mono text-xs">—</span>
                        )}
                      </div>

                      {/* Actions: Pencil Edit & Delete */}
                      <div className="w-16 flex items-center justify-center gap-1.5 shrink-0">
                        {/* Pencil Edit Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(alert);
                          }}
                          className="h-6.5 w-6.5 rounded-lg border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500 text-indigo-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs group/btn"
                          title="Редактирай сигнала за известие (Молив)"
                        >
                          <Pencil className="w-3.5 h-3.5 text-indigo-400 group-hover/btn:text-white" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (editingAlertId === alert.id) {
                              handleCancelEdit();
                            }
                            onDeleteAlert(alert.id);
                          }}
                          className="h-6.5 w-6.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs"
                          title="Изтрий известието"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-xs text-ink-faint py-4">
              Няма активни известия за цена.
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Edit Price Alert Modal */}
      {editingModalAlert && (() => {
        const modalStock = stocks.find(s => s.ticker === editingModalAlert.ticker);
        const modalCurPrice = modalStock?.currentPrice || modalStock?.priceOfCalc || 0;

        return (
          <div 
            className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
            onClick={handleCloseEditModal}
          >
            <div 
              className="relative w-full max-w-lg bg-card text-ink border-2 border-indigo-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col gap-4 animate-in zoom-in-95 duration-150"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-ink flex items-center gap-2">
                      Редакция на сигнал за известие
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {editingModalAlert.ticker}
                      </span>
                    </h3>
                    <p className="text-xs text-ink-faint">
                      {modalStock?.companyName || 'Настройка на ценовия тригер'}
                      {modalCurPrice > 0 && ` • Текуща цена: $${modalCurPrice.toFixed(2)}`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="p-1.5 rounded-xl text-ink-faint hover:text-ink hover:bg-bg border border-transparent hover:border-border/60 transition-all cursor-pointer"
                  title="Затвори (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveModalEdit} className="space-y-4">
                {/* 1. Criteria Selector (Signal Direction) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-ink uppercase tracking-wider">
                    1. Сигнал за известие (Посока на задействане):
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* ABOVE Card */}
                    <button
                      type="button"
                      onClick={() => setModalCriteria('ABOVE')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
                        modalCriteria === 'ABOVE'
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-sm ring-1 ring-emerald-500/40'
                          : 'border-border/60 bg-bg/60 text-ink-muted hover:border-border hover:text-ink'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-xs uppercase">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>ЦЕНА НАД (▲)</span>
                      </div>
                      <span className="text-[11px] text-ink-faint leading-tight">
                        Известие при поскъпване над таргета
                      </span>
                    </button>

                    {/* BELOW Card */}
                    <button
                      type="button"
                      onClick={() => setModalCriteria('BELOW')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
                        modalCriteria === 'BELOW'
                          ? 'border-rose-500 bg-rose-500/15 text-rose-400 shadow-sm ring-1 ring-rose-500/40'
                          : 'border-border/60 bg-bg/60 text-ink-muted hover:border-border hover:text-ink'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-xs uppercase">
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                        <span>ЦЕНА ПОД (▼)</span>
                      </div>
                      <span className="text-[11px] text-ink-faint leading-tight">
                        Известие при спад под таргета
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. Target Price */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-ink uppercase tracking-wider">
                      2. Таргет цена ($):
                    </label>
                    {modalCurPrice > 0 && (
                      <span className="text-[11px] font-mono text-ink-muted">
                        Текуща: <strong className="text-emerald-400 font-bold">${modalCurPrice.toFixed(2)}</strong>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono font-bold text-ink-faint">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Въведете таргет цена..."
                      value={modalTargetVal}
                      onChange={e => setModalTargetVal(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-bg border-2 border-border/80 text-sm font-mono font-black text-ink focus:outline-none focus:border-indigo-500 transition-colors"
                      autoFocus
                    />
                  </div>

                  {/* Quick percentage adjustment buttons */}
                  {modalCurPrice > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-ink-faint font-semibold uppercase">Бърз избор:</span>
                      <button
                        type="button"
                        onClick={() => setModalTargetVal(modalCurPrice.toFixed(2))}
                        className="px-2 py-0.5 rounded-lg bg-bg border border-border/70 hover:border-indigo-500/50 text-[10px] font-mono text-ink-muted hover:text-ink cursor-pointer transition-colors"
                      >
                        Текуща
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalTargetVal((modalCurPrice * 1.05).toFixed(2))}
                        className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-400 hover:bg-emerald-500/20 cursor-pointer transition-colors"
                      >
                        +5%
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalTargetVal((modalCurPrice * 1.10).toFixed(2))}
                        className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-400 hover:bg-emerald-500/20 cursor-pointer transition-colors"
                      >
                        +10%
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalTargetVal((modalCurPrice * 0.95).toFixed(2))}
                        className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] font-mono font-bold text-rose-400 hover:bg-rose-500/20 cursor-pointer transition-colors"
                      >
                        -5%
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalTargetVal((modalCurPrice * 0.90).toFixed(2))}
                        className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] font-mono font-bold text-rose-400 hover:bg-rose-500/20 cursor-pointer transition-colors"
                      >
                        -10%
                      </button>
                      {modalStock?.fairPrice != null && (
                        <button
                          type="button"
                          onClick={() => setModalTargetVal(modalStock.fairPrice!.toFixed(2))}
                          className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono font-bold text-indigo-300 hover:bg-indigo-500/20 cursor-pointer transition-colors"
                        >
                          Fair Price (${modalStock.fairPrice.toFixed(2)})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Active Status Toggle */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-bg/70 border border-border/60">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${modalIsActive ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
                    <div>
                      <span className="text-xs font-black text-ink block">
                        Статус: {modalIsActive ? 'Активен сигнал (🟢 ВКЛ)' : 'Паузиран (⚪ ИЗКЛ)'}
                      </span>
                      <span className="text-[10px] text-ink-faint block">
                        {modalIsActive ? 'Системата ще изпрати известие при достигане на таргета' : 'Сигналът е временно деактивиран'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalIsActive(!modalIsActive)}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      modalIsActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-card text-ink-muted border border-border/60 hover:text-ink'
                    }`}
                  >
                    {modalIsActive ? 'ВКЛ' : 'ИЗКЛ'}
                  </button>
                </div>

                {modalError && (
                  <p className="text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                    {modalError}
                  </p>
                )}

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-ink-muted hover:text-ink hover:bg-bg border border-border/60 transition-colors cursor-pointer"
                  >
                    Отказ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Запази промените
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
