import React, { useState } from 'react';
import { Stock, PriceAlert } from '../types';
import { BellRing, Ban, PlusCircle } from 'lucide-react';

interface Props {
  stocks: Stock[];
  alerts: PriceAlert[];
  onAddAlert: (ticker: string, criteria: 'ABOVE' | 'BELOW', target: number) => void;
  onDeleteAlert: (id: string) => void;
}

export default function PriceAlertPlanner({ stocks, alerts, onAddAlert, onDeleteAlert }: Props) {
  const [newTicker, setNewTicker] = useState('');
  const [criteria, setCriteria] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetVal, setTargetVal] = useState('');
  const [formError, setFormError] = useState('');

  const handleCreateAlert = (e: React.FormEvent) => {
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

    onAddAlert(tick, criteria, priceNum);
    setNewTicker('');
    setTargetVal('');
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-none border border-white/10 p-4 mt-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-blue-700 font-serif italic uppercase tracking-wider block">
            Alert Engine
          </span>
          <h3 className="text-xs uppercase font-extrabold text-white font-mono tracking-tight">
            Планиране на персонализирани известия за цена
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Конфигурирайте известия, които ще изскочат на екрана веднага щом пазарната цена пресече таргета.
          </p>
        </div>

        <form onSubmit={handleCreateAlert} className="flex flex-wrap items-end gap-2.5 bg-transparent/40 p-2 border border-white/10 w-full md:w-auto">
          <div className="flex-1 min-w-[100px]">
            <label className="block text-[9px] text-slate-400 font-mono uppercase mb-0.5">ТИКЕР</label>
            <input
              type="text"
              placeholder="AAPL, TSLA..."
              value={newTicker}
              onChange={e => setNewTicker(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-none px-2 py-1 text-xs text-white uppercase font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 font-mono uppercase mb-0.5">СИГНАЛ ПРИ</label>
            <select
              value={criteria}
              onChange={e => setCriteria(e.target.value as any)}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-none px-2 py-1 text-xs text-white font-extrabold focus:outline-none"
            >
              <option value="ABOVE">ЦЕНА НАД (▲)</option>
              <option value="BELOW">ЦЕНА ПОД (▼)</option>
            </select>
          </div>

          <div className="flex-1 min-w-[90px]">
            <label className="block text-[9px] text-slate-400 font-mono uppercase mb-0.5">ТАРГЕТ ЦЕНА ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="400.00"
              value={targetVal}
              onChange={e => setTargetVal(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-none px-2 py-1 text-xs text-white font-mono focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="bg-transparent hover:bg-white/20 text-white font-extrabold text-[10px] px-4 h-[26px] border border-white/10 rounded-none flex items-center gap-1 transition-all uppercase"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Добави
          </button>
        </form>
      </div>

      {formError && (
        <p className="text-[11px] text-red-700 font-mono mt-2 font-bold">{formError}</p>
      )}

      {/* Existing Alerts Strip */}
      {alerts.length > 0 && (
        <div className="mt-3.5 border-t border-white/10/20 pt-3">
          <h4 className="text-[10px] font-extrabold text-white mb-2 font-mono flex items-center gap-1.5 uppercase">
            <BellRing className="w-3.5 h-3.5 text-blue-800" />
            АКТИВНИ ТРИГЕРИ ({alerts.length}):
          </h4>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-none px-2 py-0.5 text-xs flex items-center gap-2 font-mono text-white"
              >
                <span className="font-extrabold text-blue-800">{alert.ticker}</span>
                <span className="text-[9px] text-white/60">
                  {alert.criteria === 'ABOVE' ? 'над ▲' : 'под ▼'}
                </span>
                <span className="font-bold underline">${alert.targetPrice}</span>
                <button
                  onClick={() => onDeleteAlert(alert.id)}
                  className="text-slate-400 hover:text-red-700 ml-1.5 transition-colors cursor-pointer"
                  title="Изтрий известието"
                >
                  <Ban className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
