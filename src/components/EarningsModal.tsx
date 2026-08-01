import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Stock } from '../types';
import { X, ExternalLink, HelpCircle, Sparkles, Moon, Sun, ChevronDown, ChevronUp } from 'lucide-react';
import { FundamentalData } from 'react-ts-tradingview-widgets';
import { getTradingViewSymbol } from '../utils/tvSymbolMap';
import { getStockEarningsData } from '../utils/stockFinancials';

interface Props { 
  stock: Stock; 
  onClose: () => void; 
}

export default function EarningsModal({ stock, onClose }: Props) {
  const [showFullWidget, setShowFullWidget] = useState(false);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const tvSymbol = getTradingViewSymbol(stock.companyName, stock.ticker);
  const data = getStockEarningsData(stock);

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-sans text-stone-100"
    >
      <div className="w-full max-w-[500px] bg-[#131722] border border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header (TradingView Style) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2e39] bg-[#131722] shrink-0">
          <div className="flex items-center gap-3">
            {/* Hexagon E Badge */}
            <div className="w-8 h-8 rounded-lg bg-[#0d9488]/20 border border-[#14b8a6]/60 text-[#14b8a6] font-extrabold text-sm flex items-center justify-center shadow-inner">
              E
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight leading-none">
                Earnings &amp; Revenue
              </h2>
              <button 
                className="text-stone-400 hover:text-stone-200 transition-colors"
                title="Отчети за приходи и печалба (TradingView)"
              >
                <HelpCircle size={16} />
              </button>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[#2a2e39] rounded-full transition-colors text-stone-400 hover:text-white cursor-pointer"
            title="Затвори"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4 font-sans text-sm">
          
          {/* AI Summary Banner (Purple Card) */}
          <div className="bg-gradient-to-r from-[#201838] to-[#2d1b4d] border border-[#4c3a75]/80 rounded-xl p-4 flex gap-3 text-stone-200 shadow-md">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm font-medium leading-relaxed text-stone-200">
              {data.aiSummary}
            </div>
          </div>

          {/* Date & Period Ending Section */}
          <div className="flex flex-col gap-2 py-1 border-b border-[#2a2e39]/60 pb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-400 font-medium">Date</span>
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span>{data.dateStr}</span>
                {data.isAfterMarket ? (
                  <Moon className="w-3.5 h-3.5 text-blue-400 fill-blue-400/30" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-400 font-medium">Period Ending</span>
              <span className="font-bold text-white">{data.periodEndingStr}</span>
            </div>
          </div>

          {/* EARNINGS Section */}
          <div className="flex flex-col gap-2 border-b border-[#2a2e39]/60 pb-3">
            <div className="text-[11px] font-extrabold tracking-wider text-stone-400 uppercase">
              EARNINGS
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-300">Standardized</span>
              <span className="font-semibold text-stone-100 tabular-nums">{data.standardizedEps}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-300">Reported</span>
              <span className="font-semibold text-stone-100 tabular-nums">{data.reportedEps}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-300">Estimate</span>
              <span className="font-semibold text-stone-100 tabular-nums">{data.estimateEps}</span>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span className={`font-bold ${parseFloat(data.surpriseEps) >= 0 ? 'text-[#10b981]' : 'text-rose-400'}`}>Surprise</span>
              <span className={`font-bold tabular-nums ${parseFloat(data.surpriseEps) >= 0 ? 'text-[#10b981]' : 'text-rose-400'}`}>
                {parseFloat(data.surpriseEps) >= 0 ? `+${data.surpriseEps}` : data.surpriseEps} ({data.surpriseEpsPct}%)
              </span>
            </div>
          </div>

          {/* REVENUE Section */}
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-extrabold tracking-wider text-stone-400 uppercase">
              REVENUE
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-300">Reported</span>
              <span className="font-semibold text-stone-100 tabular-nums">{data.reportedRev}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-300">Estimate</span>
              <span className="font-semibold text-stone-100 tabular-nums">{data.estimateRev}</span>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span className={`font-bold ${parseFloat(data.surpriseRev) >= 0 ? 'text-[#10b981]' : 'text-rose-400'}`}>Surprise</span>
              <span className={`font-bold tabular-nums ${parseFloat(data.surpriseRev) >= 0 ? 'text-[#10b981]' : 'text-rose-400'}`}>
                {parseFloat(data.surpriseRev) >= 0 ? `+${data.surpriseRev}` : data.surpriseRev} ({data.surpriseRevPct}%)
              </span>
            </div>
          </div>

          {/* More Earnings Button */}
          <button
            onClick={() => setShowFullWidget(!showFullWidget)}
            className="w-full py-2.5 px-4 bg-[#1e222d] hover:bg-[#2a2e39] border border-[#363a45] rounded-xl text-stone-200 hover:text-white font-semibold text-xs transition-all cursor-pointer flex items-center justify-between mt-1"
          >
            <span>More {stock.ticker} financials</span>
            {showFullWidget ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Embedded Widget when toggled */}
          {showFullWidget && (
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
            href={`https://www.tradingview.com/symbols/${tvSymbol.replace(':', '-')}/financials-overview/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#14b8a6] hover:text-[#2dd4bf] transition-colors font-bold no-underline"
          >
            <ExternalLink size={13} />
            Пълен отчет в TradingView
          </a>
          <span className="text-[11px] text-stone-400 font-medium">
            {stock.companyName} ({stock.ticker})
          </span>
        </div>

      </div>
    </div>,
    document.body
  );
}
