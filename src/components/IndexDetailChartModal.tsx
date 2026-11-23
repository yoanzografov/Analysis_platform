import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MarketIndex } from '../types';
import { X } from 'lucide-react';
import GoogleFinanceChart from './GoogleFinanceChart';

interface Props {
  index: MarketIndex;
  onClose: () => void;
}

const NEON_GREEN = '#10b981';
const NEON_RED = '#f43f5e';

export default function IndexDetailChartModal({ index, onClose }: Props) {
  const isUp = (index.changePct ?? 0) >= 0;
  const accent = isUp ? NEON_GREEN : NEON_RED;

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const isVix =
    index.ticker?.toUpperCase() === '^VIX' ||
    index.name.toUpperCase().includes('VIX') ||
    index.name.toUpperCase().includes('VOLATILITY');

  const vixRegime =
    index.value < 15
      ? { label: 'Нисък риск (Спокоен пазар)', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' }
      : index.value < 22
        ? { label: 'Нормална волатилност', color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' }
        : index.value < 30
          ? { label: 'Повишен страх', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' }
          : { label: 'Висока паника на пазара', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' };

  const chartCurrency =
    index.category === 'Commodities' || index.category === 'Crypto' ? 'USD' : '';

  return createPortal(
    <div
      className="fixed inset-0 bg-bg/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-6 font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[1000px] flex flex-col bg-card/95 backdrop-blur-xl rounded-2xl overflow-hidden border border-border shadow-2xl relative">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-border flex items-center justify-center text-ink hover:bg-border-hover transition-colors cursor-pointer border-none outline-none"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        <div className="p-4 sm:p-6 pb-2 flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-border/50">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-ink tracking-tight leading-tight uppercase">
              {index.name}
            </div>
            <div className="text-xs text-ink-faint mt-1 flex flex-wrap items-center gap-2">
              <span>{index.category || 'Index Markets'}{index.ticker ? ` · ${index.ticker}` : ''}</span>
              {isVix && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${vixRegime.color}`}>
                  {vixRegime.label}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end w-full sm:w-auto pr-8 sm:pr-12">
            <div className="text-xl sm:text-2xl font-bold text-ink tracking-tight leading-tight tabular-nums">
              {index.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div
              className="text-xs sm:text-base font-semibold mt-0.5 flex items-center justify-end gap-1.5 tabular-nums"
              style={{ color: accent }}
            >
              {isUp ? '+' : ''}{(index.changePct ?? 0).toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-5">
          <GoogleFinanceChart
            ticker={index.ticker || index.name}
            companyName={index.name}
            currentPrice={index.value}
            currency={chartCurrency}
            initialTimeframe="1D"
            height={360}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
