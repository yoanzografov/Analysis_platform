import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Stock } from '../types';
import { X, ExternalLink, Calendar, TrendingUp } from 'lucide-react';
import { FundamentalData } from 'react-ts-tradingview-widgets';
import { getTradingViewSymbol } from '../utils/tvSymbolMap';

interface Props { 
  stock: Stock; 
  onClose: () => void; 
}

export default function EarningsModal({ stock, onClose }: Props) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const tvSymbol = getTradingViewSymbol(stock.companyName, stock.ticker);

  // Format Earnings Date
  let earningsDateStr = 'Предстои актуализация на датата';
  let daysRemainingStr = '';
  
  if (stock.earningsTimestamp) {
    const dateObj = new Date(stock.earningsTimestamp * 1000);
    earningsDateStr = dateObj.toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const daysLeft = Math.ceil((stock.earningsTimestamp * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 0) {
      daysRemainingStr = `(след ${daysLeft} ${daysLeft === 1 ? 'ден' : 'дни'})`;
    } else if (daysLeft === 0) {
      daysRemainingStr = '(ДНЕС)';
    } else {
      daysRemainingStr = `(преди ${Math.abs(daysLeft)} дни)`;
    }
  }

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-bg/90 backdrop-blur-md font-sans"
    >
      <div className="w-full max-w-[1000px] bg-bg border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0 bg-bg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-black text-base flex items-center justify-center shadow-sm">
              E
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-ink flex items-center gap-2">
                {stock.companyName}
                <span className="text-xs font-black bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {stock.ticker}
                </span>
              </h2>
              <div className="text-xs text-ink-faint flex items-center gap-2 mt-0.5">
                <span>Финансови отчети и приходи (Earnings Report)</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-ink-faint hover:text-ink cursor-pointer"
            title="Затвори"
          >
            <X size={20} />
          </button>
        </div>

        {/* Highlight Banner: Earnings Date */}
        <div className="px-4 py-3 bg-blue-500/10 border-b border-blue-500/20 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-400">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Следващ финансов отчет (Earnings Date):</span>
            <span className="text-ink font-extrabold">{earningsDateStr} {daysRemainingStr}</span>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-ink-muted">
            {stock.eps !== null && (
              <span className="bg-bg px-2 py-1 rounded-md border border-border">
                EPS: <strong className="text-ink">{stock.eps}</strong>
              </span>
            )}
            {stock.peRatio !== null && (
              <span className="bg-bg px-2 py-1 rounded-md border border-border">
                P/E: <strong className="text-ink">{stock.peRatio}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Content (TradingView Fundamental Data Widget) */}
        <div className="flex-1 w-full bg-black relative">
          <FundamentalData 
            symbol={tvSymbol}
            colorTheme="dark"
            height="100%"
            width="100%"
            displayMode="regular"
          />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/50 bg-bg shrink-0 flex justify-between items-center">
          <a
            href={`https://www.tradingview.com/symbols/${tvSymbol.replace(':', '-')}/financials-overview/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-bold no-underline"
          >
            <ExternalLink size={14} />
            Виж пълния финансов отчет в TradingView
          </a>
          <span className="text-[10px] text-ink-faint">
            Данни от TradingView Financials
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
