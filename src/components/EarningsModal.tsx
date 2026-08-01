import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Stock } from '../types';
import { X, ExternalLink, TrendingUp, Calendar } from 'lucide-react';
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

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md font-sans text-stone-100"
    >
      <div className="w-full max-w-[1000px] bg-[#131722] border border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header (TradingView Style) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2e39] bg-[#131722] shrink-0">
          <div className="flex items-center gap-3">
            {/* Pentagon/Hexagon E Badge */}
            <div className="w-9 h-9 rounded-xl bg-[#0d9488]/20 border border-[#14b8a6]/60 text-[#14b8a6] font-extrabold text-base flex items-center justify-center shadow-inner">
              E
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                {stock.companyName}
                <span className="text-xs font-black bg-[#14b8a6]/15 text-[#14b8a6] border border-[#14b8a6]/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {stock.ticker}
                </span>
              </h2>
              <div className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                <Calendar size={12} className="text-[#14b8a6]" />
                <span>Официални финансови отчети и приходи (TradingView Live Earnings &amp; Revenue)</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#2a2e39] rounded-full transition-colors text-stone-400 hover:text-white cursor-pointer"
            title="Затвори"
          >
            <X size={22} />
          </button>
        </div>

        {/* Live Official TradingView Fundamental Data & Earnings Widget */}
        <div className="flex-1 w-full bg-black relative">
          <FundamentalData 
            symbol={tvSymbol}
            colorTheme="dark"
            height="100%"
            width="100%"
            displayMode="regular"
          />
        </div>

        {/* Footer Link */}
        <div className="p-3.5 border-t border-[#2a2e39] bg-[#131722] shrink-0 flex justify-between items-center text-xs">
          <a
            href={`https://www.tradingview.com/symbols/${tvSymbol.replace(':', '-')}/financials-overview/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#14b8a6] hover:text-[#2dd4bf] transition-colors font-bold no-underline"
          >
            <ExternalLink size={14} />
            Виж пълния отчет за приходите в TradingView
          </a>
          <span className="text-[11px] text-stone-400 font-medium">
            Живи данни директно от TradingView Financials
          </span>
        </div>

      </div>
    </div>,
    document.body
  );
}
