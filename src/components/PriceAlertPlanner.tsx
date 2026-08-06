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
    <div className="bg-card rounded-2xl border border-border p-3 mt-5 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Side: Title and Form */}
        <div className="lg:col-span-5 flex flex-col justify-between min-h-[105px]">
          <div>
            <h3 className="text-xs uppercase font-extrabold text-ink tracking-tight flex items-center gap-1.5">
              Планиране на персонализирани известия за цена
            </h3>
            <p className="text-[10px] text-ink-faint mt-0.5">
              Конфигурирайте известия при пресичане на таргета.
            </p>
          </div>

          <form onSubmit={handleCreateOrUpdateAlert} className="flex flex-wrap items-end gap-2 bg-bg/40 p-1.5 rounded-xl border border-border mt-2">
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
                className={`font-extrabold text-[10px] px-3 h-[22px] border rounded-lg flex items-center gap-0.5 transition-all uppercase cursor-pointer ${
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
                  className="bg-bg hover:bg-red-500/20 text-red-400 font-extrabold text-[10px] px-2 h-[22px] border border-red-500/30 rounded-lg flex items-center gap-0.5 transition-all uppercase cursor-pointer"
                >
                  Отказ
                </button>
              )}
            </div>
          </form>
          {formError && (
            <p className="text-[10px] text-red-700 font-bold mt-1">{formError}</p>
          )}
        </div>

        {/* Right Side: Active Triggers / Alerts list */}
        <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-border/20 pt-2 lg:pt-0 lg:pl-4 flex flex-col min-h-[105px]">
          <h4 className="text-[10px] font-extrabold text-ink mb-2 flex items-center gap-1.5 uppercase shrink-0">
            <BellRing className="w-3.5 h-3.5 text-indigo-400" />
            АКТИВНИ ТРИГЕРИ ({alerts.length}):
            <span className="text-[9px] text-ink-faint font-normal normal-case ml-2">
              (кликнете за редакция)
            </span>
          </h4>

          <div className="flex-1 overflow-y-auto max-h-[80px] pr-1 custom-mini-scroll">
            {alerts.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 content-start">
                {alerts.map(alert => {
                  const isBeingEdited = editingAlertId === alert.id;
                  const matchingStock = stocks.find(s => s.ticker === alert.ticker);
                  const curPrice = matchingStock?.currentPrice || matchingStock?.priceOfCalc || 0;

                  const isTriggeredAbove = alert.criteria === 'ABOVE' && curPrice > 0 && curPrice >= alert.targetPrice;
                  const isTriggeredBelow = alert.criteria === 'BELOW' && curPrice > 0 && curPrice <= alert.targetPrice;
                  const isTriggered = isTriggeredAbove || isTriggeredBelow;

                  const distancePct = curPrice > 0 ? Math.abs(curPrice - alert.targetPrice) / alert.targetPrice : 1;
                  const isNear = !isTriggered && curPrice > 0 && distancePct <= 0.03;

                  let badgeStyle = 'bg-card border-border hover:border-indigo-400/60 hover:bg-white/5';
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
                      className={`rounded-xl border px-2.5 py-0.5 text-xs flex items-center gap-1.5 font-sans tabular-nums cursor-pointer transition-all group ${badgeStyle}`}
                      title="Кликнете за редакция на тригера"
                    >
                      <span className="font-extrabold text-indigo-400 flex items-center gap-1">
                        {alert.ticker}
                        <Edit3 className="w-3 h-3 text-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </span>

                      {isTriggered ? (
                        <span className="flex items-center gap-1 font-extrabold text-xs">
                          <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                          {isTriggeredAbove ? 'ЗАДЕЙСТВАН НАД ▲' : 'ЗАДЕЙСТВАН ПОД ▼'} (${curPrice.toFixed(2)})
                        </span>
                      ) : isNear ? (
                        <span className="flex items-center gap-1 font-bold text-xs text-amber-400">
                          <AlertTriangle className="w-3 h-3" />
                          БЛИЗО (${curPrice.toFixed(2)})
                        </span>
                      ) : (
                        <>
                          <span className="text-[11px] text-ink/60">
                            {alert.criteria === 'ABOVE' ? 'над ▲' : 'под ▼'}
                          </span>
                          <span className="font-bold underline">${alert.targetPrice}</span>
                        </>
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
                        className="text-ink-faint hover:text-red-700 ml-1 transition-colors cursor-pointer p-0.5"
                        title="Изтрий известието"
                      >
                        <Ban className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ink-faint py-4">
                Няма активни известия за цена.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
