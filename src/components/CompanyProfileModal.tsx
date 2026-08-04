import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Stock } from '../types';
import { X, ExternalLink, Globe, Building2, TrendingUp, DollarSign, Activity, Users, UserCheck, Calendar, MapPin, Award } from 'lucide-react';
import { getTradingViewSymbol } from '../utils/tvSymbolMap';
import { getCompanyProfileData } from '../utils/tvCompanyProfiles';

interface Props {
  stock: Stock;
  onClose: () => void;
}

export default function CompanyProfileModal({ stock, onClose }: Props) {
  const profile = getCompanyProfileData(stock);
  const tvSymbol = getTradingViewSymbol(stock.companyName, stock.ticker);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const formatCap = (cap: number | null) => {
    if (!cap) return 'N/A';
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  // Calculate 52-week position percentage if low52 and high52 are present
  const low52 = stock.low52 ?? (stock.currentPrice * 0.75);
  const high52 = stock.high52 ?? (stock.currentPrice * 1.25);
  const rangeDiff = high52 - low52 || 1;
  const rangePct = Math.min(100, Math.max(0, ((stock.currentPrice - low52) / rangeDiff) * 100));

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md font-sans text-stone-100"
    >
      {/* Exact TradingView Details Modal Layout */}
      <div className="w-full max-w-[880px] bg-[#131722] border border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150 text-stone-200">
        
        {/* TradingView Symbol Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2e39] bg-[#131722] shrink-0">
          <div className="flex items-center gap-3">
            {/* Ticker Icon Circle */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 border border-indigo-400/40 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-inner uppercase">
              {stock.ticker.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-none">
                  {stock.companyName}
                </h2>
                <span className="text-xs font-mono font-bold bg-[#1e222d] text-indigo-400 border border-[#363a45] px-2 py-0.5 rounded-md uppercase">
                  {tvSymbol}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-stone-400">
                <span className="bg-[#1a1e29] border border-[#2a2e39] px-2 py-0.5 rounded-md text-stone-300 font-medium">{profile.sector}</span>
                <span>•</span>
                <span className="text-stone-400">{profile.industry}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[#2a2e39] rounded-full transition-colors text-stone-400 hover:text-white cursor-pointer"
            title="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 font-sans">
          
          {/* TradingView Key Financial Details Cards Grid */}
          <div>
            <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider mb-3 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-indigo-400" />
              TradingView Key Details &amp; Metrics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Market Cap */}
              <div className="bg-[#1e222d] border border-[#2a2e39] p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-stone-400 uppercase">Market Cap</span>
                <span className="text-sm sm:text-base font-extrabold text-white font-mono mt-1">
                  {formatCap(stock.marketCap)}
                </span>
              </div>

              {/* Current Price */}
              <div className="bg-[#1e222d] border border-[#2a2e39] p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-stone-400 uppercase">Current Price</span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono mt-1">
                  ${stock.currentPrice.toFixed(2)}
                </span>
              </div>

              {/* EPS */}
              <div className="bg-[#1e222d] border border-[#2a2e39] p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-stone-400 uppercase">Basic EPS (TTM)</span>
                <span className="text-sm sm:text-base font-extrabold text-white font-mono mt-1">
                  {stock.eps ? `$${stock.eps.toFixed(2)}` : 'N/A'}
                </span>
              </div>

              {/* Dividend Yield */}
              <div className="bg-[#1e222d] border border-[#2a2e39] p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-stone-400 uppercase">Dividend Yield</span>
                <span className="text-sm sm:text-base font-extrabold text-indigo-300 font-mono mt-1">
                  {stock.dividend || 'N/A'}
                </span>
              </div>

            </div>

            {/* 52-Week Range Bar (TradingView Details Style) */}
            <div className="bg-[#1e222d] border border-[#2a2e39] p-3.5 rounded-xl mt-3 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400 font-semibold uppercase text-[10px]">52-Week Range</span>
                <span className="text-stone-300 font-mono font-bold">
                  ${low52.toFixed(2)} — ${high52.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-[#131722] h-2 rounded-full overflow-hidden border border-[#2a2e39] relative">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${rangePct}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 2-Column Section: About Company (Left) + Detailed Info Table (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: TradingView About Section (Native DOM HTML for 1-click Browser Auto-Translation) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <h3 className="text-sm font-extrabold text-white border-b border-[#2a2e39] pb-2 flex items-center gap-2">
                <Building2 size={16} className="text-indigo-400" />
                About {stock.companyName}
              </h3>

              <div className="flex flex-col gap-3 text-stone-300 leading-relaxed text-xs sm:text-sm">
                {profile.overviewParagraphs && profile.overviewParagraphs.length > 0 ? (
                  profile.overviewParagraphs.map((para, idx) => (
                    <p key={idx} className="text-stone-300 leading-relaxed">
                      {para}
                    </p>
                  ))
                ) : (
                  <p className="text-stone-300 leading-relaxed">
                    {profile.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: TradingView Details Info Table */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 flex flex-col gap-3">
                <h4 className="text-xs font-black text-stone-400 uppercase tracking-wider border-b border-[#2a2e39] pb-2">
                  Company Information
                </h4>

                <table className="w-full text-xs">
                  <tbody className="divide-y divide-[#2a2e39]">
                    <tr>
                      <td className="py-2.5 text-stone-400 font-medium">Sector</td>
                      <td className="py-2.5 text-right font-bold text-white">{profile.sector}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-stone-400 font-medium">Industry</td>
                      <td className="py-2.5 text-right font-bold text-stone-200">{profile.industry}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-stone-400 font-medium">CEO</td>
                      <td className="py-2.5 text-right font-bold text-emerald-400">{profile.ceo}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-stone-400 font-medium">Employees</td>
                      <td className="py-2.5 text-right font-mono font-bold text-white">{profile.employees}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-stone-400 font-medium">Founded</td>
                      <td className="py-2.5 text-right font-bold text-stone-300">{profile.founded}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-stone-400 font-medium">Headquarters</td>
                      <td className="py-2.5 text-right font-bold text-stone-300">{profile.headquarters}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Official Website */}
              {profile.website && (
                <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 flex flex-col gap-2">
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-wider border-b border-[#2a2e39] pb-2">
                    Official Website
                  </h4>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors no-underline pt-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <Globe size={14} />
                      {profile.website.replace(/^https?:\/\//, '')}
                    </span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Clean Footer Link */}
        <div className="px-6 py-3.5 border-t border-[#2a2e39] bg-[#131722] shrink-0 flex justify-between items-center text-xs">
          <a
            href={`https://www.tradingview.com/symbols/${tvSymbol.replace(':', '-')}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-bold no-underline"
          >
            <ExternalLink size={13} />
            Open Details on TradingView.com
          </a>
          <span className="text-[11px] text-stone-400">
            {stock.companyName} ({stock.ticker})
          </span>
        </div>

      </div>
    </div>,
    document.body
  );
}
