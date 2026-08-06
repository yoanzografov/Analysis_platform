import React, { useState } from 'react';
import { Stock, PriceAlert } from '../types';
import { BellRing, Ban, PlusCircle, CheckCircle, XCircle, Edit3, Flame, AlertTriangle } from 'lucide-react';

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
    <div className="bg-card rounded-2xl border border-border p-3.5 mt-5 font-sans">
      {/* Top Bar: Title & Inline Form on the same level */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/30">
        <div className="shrink-0">
          <h3 className="text-xs uppercase font-extrabold text-ink tracking-tight flex items-center gap-1.5">
            Планиране на персонализирани известия за цена
          </h3>
          <p className="text-[10px] text-ink-faint mt-0.5">
            Конфигурирайте известия при пресичане на таргета.
          </p>
        </div>

        <form onSubmit={handleCreateOrUpdateAlert} className="flex flex-wrap items-end gap-2 bg-bg/40 p-1.5 rounded-xl border border-border">
          <div className="w-20">
            <label className="block text-[9px] text-ink-faint font-semibold uppercase mb-0.5">ТИКЕР</label>
            <input
              type="text"
              placeholder="AAPL..."
              value={newTicker}
              onChange={e => setNewTicker(e.target.value)}
              className="w-full bg-card rounded-lg border border-border px-2 py-0.5 text-xs text-ink uppercase font-bold focus:outline-none"
            />
          </div>

          <div className="w-28">
            <label className="block text-[9px] text-ink-faint font-semibold uppercase mb-0.5">СИГНАЛ ПРИ</label>
            <select
              value={criteria}
              onChange={e => setCriteria(e.target.value as any)}
              className="w-full bg-card rounded-lg border border-border px-1 py-0.5 text-xs text-ink font-extrabold focus:outline-none"
            >
              <option value="ABOVE">ЦЕНА НАД (▲)</option>
              <option value="BELOW">ЦЕНА ПОД (▼)</option>
            </select>
          </div>

          <div className="w-24">
            <label className="block text-[9px] text-ink-faint font-semibold uppercase mb-0.5">ТАРГЕТ ЦЕНА ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="400.00"
              value={targetVal}
              onChange={e => setTargetVal(e.target.value)}
              className="w-full bg-card rounded-lg border border-border px-2 py-0.5 text-xs text-ink font-sans tabular-nums focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="submit"
              className={`font-extrabold text-[10px] px-3 h-[24px] border rounded-lg flex items-center gap-0.5 transition-all uppercase cursor-pointer ${
                editingAlertId
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/50 shadow-md'
                  : 'bg-indigo-500/10 hover:bg-indigo-500 border-indigo-500/40 text-indigo-400 hover:text-white'
              }`}
            >
              {editingAlertId ? 'Редактирай' : 'Добави'}
            </button>
            {editingAlertId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-bg hover:bg-red-500/20 text-red-400 font-extrabold text-[10px] px-2 h-[24px] border border-red-500/30 rounded-lg flex items-center gap-0.5 transition-all uppercase cursor-pointer"
              >
                Отказ
              </button>
            )}
          </div>
        </form>
      </div>

      {formError && (
        <p className="text-[10px] text-red-700 font-bold mt-1.5">{formError}</p>
      )}

      {/* Active Triggers Section — Listed vertically one under another (max 10 rows visible) */}
      <div className="mt-3">
        <h4 className="text-[10px] font-extrabold text-ink mb-2 flex items-center gap-1.5 uppercase shrink-0">
          <BellRing className="w-3.5 h-3.5 text-indigo-400" />
          АКТИВНИ ТРИГЕРИ ({alerts.length}):
          <span className="text-[9px] text-ink-faint font-normal normal-case ml-1">
            (кликнете за редакция, макс. 10 реда)
          </span>
        </h4>

        <div className="overflow-y-auto max-h-[300px] pr-1 custom-mini-scroll">
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
                    className={`rounded-xl border px-3 py-1.5 text-xs flex items-center justify-between gap-3 font-sans tabular-nums cursor-pointer transition-all group ${badgeStyle}`}
                    title="Кликнете за редакция на тригера"
                  >
                    <div className="flex items-center gap-2">
                      <StockLogo ticker={alert.ticker} />
                      <span className="font-black text-indigo-400 min-w-[50px] flex items-center gap-1">
                        {alert.ticker}
                        <Edit3 className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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

                    <div className="flex items-center gap-2">
                      {curPrice > 0 && (
                        <span className="text-[10px] text-ink-faint font-mono">
                          (Текуща: ${curPrice.toFixed(2)})
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
                        className="text-ink-faint hover:text-red-500 transition-colors cursor-pointer p-1"
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
            <div className="text-center text-xs text-ink-faint py-3">
              Няма активни известия за цена.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
