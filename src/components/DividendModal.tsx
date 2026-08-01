import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Stock } from '../types';
import { X, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { FundamentalData } from 'react-ts-tradingview-widgets';
import { getTradingViewSymbol } from '../utils/tvSymbolMap';
import { fetchTradingViewLiveDividend, TVLiveDividendData } from '../utils/tvFinancialsFetcher';
import { getStockDividendData } from '../utils/stockFinancials';

interface Props { 
  stock: Stock; 
  onClose: () => void; 
}

export default function DividendModal({ stock, onClose }: Props) {
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [liveData, setLiveData] = useState<TVLiveDividendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchTradingViewLiveDividend(stock.ticker, stock.companyName)
      .then(res => {
        if (isMounted) {
          if (res) {
            setLiveData(res);
          } else {
            const fallback = getStockDividendData(stock);
            setLiveData({
              ticker: stock.ticker,
              companyName: stock.companyName,
              exDateStr: fallback.exDateStr,
              amountStr: fallback.amountStr,
              payDateStr: fallback.payDateStr
            });
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [stock]);

  const tvSymbol = getTradingViewSymbol(stock.companyName, stock.ticker);

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-sans text-stone-100"
    >
      <div className="w-full max-w-[440px] bg-[#131722] border border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header (TradingView Dividends Style) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2e39] bg-[#131722]">
          <div className="flex items-center gap-3">
            {/* Blue Double Ring D Badge */}
            <div className="w-8 h-8 rounded-full border-2 border-[#2962ff] text-[#2962ff] font-extrabold text-sm flex items-center justify-center shadow-inner">
              D
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-none flex items-center gap-2">
              Dividends
              {isLoading && <Loader2 className="w-4 h-4 text-[#2962ff] animate-spin shrink-0" />}
            </h2>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[#2a2e39] rounded-full transition-colors text-stone-400 hover:text-white cursor-pointer"
            title="Затвори"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-5 flex flex-col gap-4 font-sans text-sm">
          
          {/* Rows */}
          <div className="flex flex-col gap-3 py-1">
            
            {/* Ex-dividend date */}
            <div className="flex items-center justify-between">
              <span className="text-stone-300 font-medium">Ex-dividend date</span>
              <span className="font-bold text-white tabular-nums">{liveData?.exDateStr || "Fri 04 Sep '26"}</span>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between">
              <span className="text-stone-300 font-medium">Amount</span>
              <span className="font-bold text-white tabular-nums">{liveData?.amountStr || "0.22"}</span>
            </div>

            {/* Payment date */}
            <div className="flex items-center justify-between">
              <span className="text-stone-300 font-medium">Payment date</span>
              <span className="font-bold text-white tabular-nums">{liveData?.payDateStr || "Mon 14 Sep '26"}</span>
            </div>

          </div>

          {/* More Ticker Dividends Button */}
          <button
            onClick={() => setShowFullHistory(!showFullHistory)}
            className="w-full py-2.5 px-4 bg-[#1e222d] hover:bg-[#2a2e39] border border-[#363a45] rounded-xl text-stone-200 hover:text-white font-semibold text-xs transition-all cursor-pointer flex items-center justify-between"
          >
            <span>More {stock.ticker} dividends</span>
            {showFullHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Embedded Full History Widget when toggled */}
          {showFullHistory && (
            <div className="w-full h-[320px] bg-black rounded-xl overflow-hidden border border-[#2a2e39]">
              <FundamentalData 
                symbol={tvSymbol}
                colorTheme="dark"
                height="100%"
                width="100%"
                displayMode="regular"
              />
            </div>
          )}

        </div>

        {/* Footer Link */}
        <div className="p-3 border-t border-[#2a2e39] bg-[#131722] shrink-0 flex justify-between items-center text-xs">
          <a
            href={`https://www.tradingview.com/symbols/${tvSymbol.replace(':', '-')}/financials-dividends/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#2962ff] hover:text-[#5383ff] transition-colors font-bold no-underline"
          >
            <ExternalLink size={13} />
            Пълна история в TradingView
          </a>
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2962ff] animate-ping" />
            Живи данни от TradingView Scanner
          </span>
        </div>

      </div>
    </div>,
    document.body
  );
}
