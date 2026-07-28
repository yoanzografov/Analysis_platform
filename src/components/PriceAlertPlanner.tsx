import React, { useState } from 'react';
import { Stock, PriceAlert } from '../types';
import { BellRing, Ban, PlusCircle, CheckCircle, XCircle, Edit3 } from 'lucide-react';

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
    <div className="bg-card rounded-2xl border border-border p-4 mt-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums tracking-tight">
            Планиране на персонализирани известия за цена
          </h3>
          <p className="text-xs text-ink-faint mt-0.5">
            Конфигурирайте известия, които ще изскочат на екрана веднага щом пазарната цена пресече таргета.
          </p>
        </div>

        <form onSubmit={handleCreateOrUpdateAlert} className="flex flex-wrap items-end gap-2.5 bg-bg/40 p-2 rounded-2xl border border-border w-full md:w-auto">
          <div className="flex-1 min-w-[100px]">
            <label className="block text-xs text-ink-faint font-sans tabular-nums uppercase mb-0.5">ТИКЕР</label>
            <input
              type="text"
              placeholder="AAPL, TSLA..."
              value={newTicker}
              onChange={e => setNewTicker(e.target.value)}
              className="w-full bg-card rounded-2xl border border-border px-2 py-1 text-xs text-ink uppercase font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-ink-faint font-sans tabular-nums uppercase mb-0.5">СИГНАЛ ПРИ</label>
            <select
              value={criteria}
              onChange={e => setCriteria(e.target.value as any)}
              className="bg-card rounded-2xl border border-border px-2 py-1 text-xs text-ink font-extrabold focus:outline-none"
            >
              <option value="ABOVE">ЦЕНА НАД (▲)</option>
              <option value="BELOW">ЦЕНА ПОД (▼)</option>
            </select>
          </div>

          <div className="flex-1 min-w-[90px]">
            <label className="block text-xs text-ink-faint font-sans tabular-nums uppercase mb-0.5">ТАРГЕТ ЦЕНА ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="400.00"
              value={targetVal}
              onChange={e => setTargetVal(e.target.value)}
              className="w-full bg-card rounded-2xl border border-border px-2 py-1 text-xs text-ink font-sans tabular-nums focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              className={`font-extrabold text-xs px-4 h-[26px] border rounded-2xl flex items-center gap-1 transition-all uppercase cursor-pointer ${
                editingAlertId
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/50 shadow-md'
                  : 'bg-bg hover:bg-white/20 text-ink border-border'
              }`}
            >
              {editingAlertId ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Редактирай
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  Добави
                </>
              )}
            </button>
            {editingAlertId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-bg hover:bg-red-500/20 text-red-400 font-extrabold text-xs px-2.5 h-[26px] border border-red-500/30 rounded-2xl flex items-center gap-1 transition-all uppercase cursor-pointer"
                title="Откажи редакцията"
              >
                <XCircle className="w-3.5 h-3.5" />
                Отказ
              </button>
            )}
          </div>
        </form>
      </div>

      {formError && (
        <p className="text-xs text-red-700 font-sans tabular-nums mt-2 font-bold">{formError}</p>
      )}

      {/* Existing Alerts Strip */}
      {alerts.length > 0 && (
        <div className="mt-3.5 border-t border-border/20 pt-3">
          <h4 className="text-xs font-extrabold text-ink mb-2 font-sans tabular-nums flex items-center gap-1.5 uppercase">
            <BellRing className="w-3.5 h-3.5 text-blue-800" />
            АКТИВНИ ТРИГЕРИ ({alerts.length}):
            <span className="text-[10px] text-ink-faint font-normal normal-case ml-2">
              (кликнете върху тригер за редакция)
            </span>
          </h4>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {alerts.map(alert => {
              const isBeingEdited = editingAlertId === alert.id;
              return (
                <div
                  key={alert.id}
                  onClick={() => handleStartEdit(alert)}
                  className={`rounded-2xl border px-2.5 py-1 text-xs flex items-center gap-2 font-sans tabular-nums text-ink cursor-pointer transition-all group ${
                    isBeingEdited
                      ? 'border-indigo-500 bg-indigo-500/20 ring-2 ring-indigo-500/50 shadow-md font-bold'
                      : 'bg-card border-border hover:border-indigo-400/60 hover:bg-white/5'
                  }`}
                  title="Кликнете за редакция на тригера"
                >
                  <span className="font-extrabold text-blue-800 flex items-center gap-1">
                    {alert.ticker}
                    <Edit3 className="w-3 h-3 text-indigo-400" />
                  </span>
                  <span className="text-xs text-ink/60">
                    {alert.criteria === 'ABOVE' ? 'над ▲' : 'под ▼'}
                  </span>
                  <span className="font-bold underline">${alert.targetPrice}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (editingAlertId === alert.id) {
                        handleCancelEdit();
                      }
                      onDeleteAlert(alert.id);
                    }}
                    className="text-ink-faint hover:text-red-700 ml-1.5 transition-colors cursor-pointer p-0.5"
                    title="Изтрий известието"
                  >
                    <Ban className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
