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
 <div className="bg-card rounded-2xl border border-border p-4 mt-5">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h3 className="text-xs uppercase font-extrabold text-ink font-mono tracking-tight">
 Планиране на персонализирани известия за цена
 </h3>
 <p className="text-sm text-ink-faint mt-0.5">
 Конфигурирайте известия, които ще изскочат на екрана веднага щом пазарната цена пресече таргета.
 </p>
 </div>

 <form onSubmit={handleCreateAlert} className="flex flex-wrap items-end gap-2.5 bg-bg/40 p-2 rounded-2xl border border-border w-full md:w-auto">
 <div className="flex-1 min-w-[100px]">
 <label className="block text-sm text-ink-faint font-mono uppercase mb-0.5">ТИКЕР</label>
 <input
 type="text"
 placeholder="AAPL, TSLA..."
 value={newTicker}
 onChange={e => setNewTicker(e.target.value)}
 className="w-full bg-card rounded-2xl border border-border px-2 py-1 text-xs text-ink uppercase font-bold focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-sm text-ink-faint font-mono uppercase mb-0.5">СИГНАЛ ПРИ</label>
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
 <label className="block text-sm text-ink-faint font-mono uppercase mb-0.5">ТАРГЕТ ЦЕНА ($)</label>
 <input
 type="number"
 step="0.01"
 placeholder="400.00"
 value={targetVal}
 onChange={e => setTargetVal(e.target.value)}
 className="w-full bg-card rounded-2xl border border-border px-2 py-1 text-xs text-ink font-mono focus:outline-none"
 />
 </div>

 <button
 type="submit"
 className="bg-bg hover:bg-white/20 text-ink font-extrabold text-xs px-4 h-[26px] border border-border rounded-2xl flex items-center gap-1 transition-all uppercase"
 >
 <PlusCircle className="w-3.5 h-3.5" />
 Добави
 </button>
 </form>
 </div>

 {formError && (
 <p className="text-sm text-red-700 font-mono mt-2 font-bold">{formError}</p>
 )}

 {/* Existing Alerts Strip */}
 {alerts.length > 0 && (
 <div className="mt-3.5 border-t border-border/20 pt-3">
 <h4 className="text-xs font-extrabold text-ink mb-2 font-mono flex items-center gap-1.5 uppercase">
 <BellRing className="w-3.5 h-3.5 text-blue-800" />
 АКТИВНИ ТРИГЕРИ ({alerts.length}):
 </h4>
 <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
 {alerts.map(alert => (
 <div
 key={alert.id}
 className="bg-card rounded-2xl border border-border rounded-none px-2 py-0.5 text-xs flex items-center gap-2 font-mono text-ink"
 >
 <span className="font-extrabold text-blue-800">{alert.ticker}</span>
 <span className="text-sm text-ink/60">
 {alert.criteria === 'ABOVE' ? 'над ▲' : 'под ▼'}
 </span>
 <span className="font-bold underline">${alert.targetPrice}</span>
 <button
 onClick={() => onDeleteAlert(alert.id)}
 className="text-ink-faint hover:text-red-700 ml-1.5 transition-colors cursor-pointer"
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
