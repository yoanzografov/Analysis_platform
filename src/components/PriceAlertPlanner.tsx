import React, { useState } from 'react';
import { Stock, PriceAlert } from '../types';
import { BellRing, Ban, PlusCircle, CheckCircle, XCircle, Edit3, Flame, AlertTriangle, Check, Calendar } from 'lucide-react';

interface Props {
  stocks: Stock[];
  alerts: PriceAlert[];
  onAddAlert: (ticker: string, criteria: 'ABOVE' | 'BELOW', target: number) => void;
  onUpdateAlert?: (id: string, ticker: string, criteria: 'ABOVE' | 'BELOW', target: number) => void;
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
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [newTicker, setNewTicker] = useState('');
  const [criteria, setCriteria] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetVal, setTargetVal] = useState('');
  const [formError, setFormError] = useState('');

  const handleStartEdit = (alert: PriceAlert) => {
    setEditingAlertId(alert.id);
    setNewTicker(alert.ticker);
    setCriteria(alert.criteria);
    setTargetVal(alert.targetPrice.toString());
    setFormError('');
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
                    onClick={() => handleStartEdit(alert)}
                    className={`rounded-xl border px-3 py-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-sans tabular-nums cursor-pointer transition-all group ${badgeStyle}`}
                    title="Кликнете за редакция на тригера"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StockLogo ticker={alert.ticker} />
                      <span className="font-extrabold text-ink min-w-[50px] flex items-center gap-1.5">
                        <span>{alert.ticker}</span>
                        {matchingStock?.companyName && (
                          <span className="text-[11px] font-medium text-ink-muted">
                            · {matchingStock.companyName}
                          </span>
                        )}
                        <Edit3 className="w-3 h-3 text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>

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
                        <span className="text-xs text-ink/70 flex items-center gap-1.5">
                          <span>{alert.criteria === 'ABOVE' ? 'над ▲' : 'под ▼'}</span>
                          <span className="font-bold underline text-ink">${alert.targetPrice}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/30 w-full sm:w-auto shrink-0">
                      {curPrice > 0 && (
                        <span className="h-6.5 px-2.5 rounded-lg border border-border/60 bg-bg/80 text-ink-muted font-mono font-bold text-[10px] inline-flex items-center justify-center gap-1 shrink-0 shadow-2xs">
                          (Текуща: ${curPrice.toFixed(2)})
                        </span>
                      )}

                      {matchingStock?.date && (
                        <span className="h-6.5 px-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono font-bold text-[10px] inline-flex items-center justify-center gap-1 shrink-0 shadow-2xs">
                          <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>Дата: {matchingStock.date}</span>
                        </span>
                      )}

                      {matchingStock?.fairPrice !== undefined && matchingStock?.fairPrice !== null && (
                        <span className="h-6.5 px-2.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-mono font-bold text-[10px] inline-flex items-center justify-center gap-1 shrink-0 shadow-2xs">
                          Fair Price: ${matchingStock.fairPrice.toFixed(2)}
                        </span>
                      )}

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
    </div>
  );
}
