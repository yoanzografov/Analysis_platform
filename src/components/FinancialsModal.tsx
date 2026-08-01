import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Stock } from '../types';
import { X, ExternalLink } from 'lucide-react';
import { FundamentalData } from 'react-ts-tradingview-widgets';
import { getTradingViewSymbol } from '../utils/tvSymbolMap';

interface Props { 
  stock: Stock; 
  onClose: () => void; 
}

export default function FinancialsModal({ stock, onClose }: Props) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const tvSymbol = getTradingViewSymbol(stock.companyName, stock.ticker);

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-bg/90 backdrop-blur-md font-sans"
    >
      <div className="w-full max-w-[1000px] bg-bg border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-ink mb-1 flex items-center gap-2">
              {stock.companyName}
              <span className="text-xs font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                {stock.ticker}
              </span>
            </h2>
            <div className="text-sm text-ink-faint">
              TradingView Financial Statements & Fundamental Data ($)
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-ink-faint hover:text-ink cursor-pointer"
            title="Затвори"
          >
            <X size={24} />
          </button>
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
            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors no-underline font-bold"
          >
            <ExternalLink size={12} />
            Отвори пълните финансови отчети в TradingView
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
