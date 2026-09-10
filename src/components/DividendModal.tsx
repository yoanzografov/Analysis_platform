import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Stock } from '../types';
import { X, ExternalLink, ChevronDown, ChevronUp, RefreshCw, AlertCircle } from 'lucide-react';
import { FundamentalData } from 'react-ts-tradingview-widgets';
import { getTradingViewSymbol } from '../utils/tvSymbolMap';
import { fetchTradingViewLiveDividend, TVLiveDividendData } from '../utils/tvFinancialsFetcher';
import { getStockDividendData } from '../utils/stockFinancials';

interface Props { 
  stock: Stock; 
  onClose: () => void; 
  onUpdateStockDividend?: (ticker: string, divStr: string, yieldVal?: number) => void;
}

export default function DividendModal({ stock, onClose, onUpdateStockDividend }: Props) {
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [liveData, setLiveData] = useState<TVLiveDividendData>(() => getStockDividendData(stock));

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLiveData(getStockDividendData(stock));

    fetchTradingViewLiveDividend(stock.ticker, stock.companyName)
      .then(res => {
        if (isMounted) {
          setIsLoading(false);
          if (res) {
            setLiveData(res);
            if (onUpdateStockDividend && res.isDividendPayer && res.amountStr && res.amountStr !== 'Не изплаща') {
              const formatted = `${res.amountStr} (${res.yieldPctStr || '0%'})`;
              onUpdateStockDividend(stock.ticker, formatted, res.yieldPctNum);
            }
          }
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
      <div className="w-full max-w-[480px] bg-[#131722] border border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header (TradingView Dividends Style) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2e39] bg-[#131722]">
          <div className="flex items-center gap-3">
            {/* Blue Double Ring D Badge */}
            <div className="w-9 h-9 rounded-full border-2 border-[#2962ff] bg-[#2962ff]/10 text-[#2962ff] font-extrabold text-sm flex items-center justify-center shadow-inner">
              D
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight leading-none flex items-center gap-2">
                {stock.ticker} Dividends
              </h2>
              <span className="text-xs text-stone-400 font-medium">
                {stock.companyName}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isLoading && (
              <RefreshCw className="w-4 h-4 text-[#2962ff] animate-spin" />
            )}
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-[#2a2e39] rounded-full transition-colors text-stone-400 hover:text-white cursor-pointer"
              title="Затвори"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5 flex flex-col gap-4 font-sans text-sm overflow-y-auto">
          
          {/* Main Dividend Statistics Table */}
          {!liveData.isDividendPayer ? (
            <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white text-sm block">Не изплаща дивидент</span>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Компанията <span className="text-white font-semibold">{stock.companyName} ({stock.ticker})</span> към момента не разпределя паричен дивидент към своите акционери или е компания за растеж.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#2a2e39] border border-[#2a2e39] rounded-xl overflow-hidden bg-[#181c27]">
              
              {/* Ex-dividend date */}
              <div className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex flex-col">
                  <span className="text-stone-300 font-semibold text-xs">Ex-dividend date</span>
                  <span className="text-[11px] text-stone-500">Дата на отсичане</span>
                </div>
                <span className="font-bold text-white tabular-nums text-sm">
                  {liveData.exDateStr}
                </span>
              </div>

              {/* Amount (Per Share) */}
              <div className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex flex-col">
                  <span className="text-stone-300 font-semibold text-xs">Amount (Период)</span>
                  <span className="text-[11px] text-stone-500">Сума на акция</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-400 tabular-nums text-sm">
                    {liveData.amountStr}
                  </span>
                  {liveData.annualAmountStr && liveData.annualAmountStr !== '0.00' && (
                    <span className="block text-[10px] text-stone-400 font-mono">
                      Годишно: {liveData.annualAmountStr}
                    </span>
                  )}
                </div>
              </div>

              {/* Payment date */}
              <div className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex flex-col">
                  <span className="text-stone-300 font-semibold text-xs">Payment date</span>
                  <span className="text-[11px] text-stone-500">Дата на изплащане</span>
                </div>
                <span className="font-bold text-white tabular-nums text-sm">
                  {liveData.payDateStr}
                </span>
              </div>

              {/* Dividend Yield */}
              {liveData.yieldPctStr && liveData.yieldPctStr !== '—' && (
                <div className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-stone-300 font-semibold text-xs">Dividend Yield</span>
                    <span className="text-[11px] text-stone-500">Дивидентна доходност</span>
                  </div>
                  <span className="font-extrabold text-emerald-400 tabular-nums text-sm">
                    {liveData.yieldPctStr}
                  </span>
                </div>
              )}

              {/* Payout Ratio */}
              {liveData.payoutRatioStr && liveData.payoutRatioStr !== '—' && liveData.payoutRatioStr !== '0.00%' && (
                <div className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-stone-300 font-semibold text-xs">Payout Ratio</span>
                    <span className="text-[11px] text-stone-500">Дял от чистата печалба</span>
                  </div>
                  <span className="font-bold text-amber-400 tabular-nums text-sm">
                    {liveData.payoutRatioStr}
                  </span>
                </div>
              )}

              {/* Frequency */}
              {liveData.frequency && (
                <div className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-stone-300 font-semibold text-xs">Frequency</span>
                    <span className="text-[11px] text-stone-500">Честота на плащане</span>
                  </div>
                  <span className="font-medium text-stone-300 text-xs">
                    {liveData.frequency}
                  </span>
                </div>
              )}

            </div>
          )}

          {/* More Ticker Dividends Button */}
          <button
            onClick={() => setShowFullHistory(!showFullHistory)}
            className="w-full py-2.5 px-4 bg-[#1e222d] hover:bg-[#2a2e39] border border-[#363a45] rounded-xl text-stone-200 hover:text-white font-semibold text-xs transition-all cursor-pointer flex items-center justify-between shadow-sm"
          >
            <span>More {stock.ticker} dividends & history</span>
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
        <div className="p-3.5 border-t border-[#2a2e39] bg-[#131722] shrink-0 flex justify-between items-center text-xs">
          <a
            href={`https://www.tradingview.com/symbols/${tvSymbol.replace(':', '-')}/financials-dividends/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#2962ff] hover:text-[#5383ff] transition-colors font-bold no-underline"
          >
            <ExternalLink size={13} />
            Пълна история в TradingView
          </a>
          <span className="text-[11px] text-emerald-400/80 font-mono font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live TV Scanner
          </span>
        </div>

      </div>
    </div>,
    document.body
  );
}
