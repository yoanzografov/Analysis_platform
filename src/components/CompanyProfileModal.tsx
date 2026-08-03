import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Stock } from '../types';
import { X, ExternalLink, Building2, Users, UserCheck, MapPin, Globe, Briefcase, Award, PieChart, Users2, DollarSign, Target, Activity } from 'lucide-react';
import { SymbolInfo } from 'react-ts-tradingview-widgets';
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

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-sans text-stone-100"
    >
      <div className="w-full max-w-[680px] bg-[#131722] border border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header (TradingView Style) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2e39] bg-[#131722] shrink-0">
          <div className="flex items-center gap-3">
            {/* Circle Indigo i Badge */}
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/60 text-indigo-400 font-extrabold text-base flex items-center justify-center shadow-inner">
              i
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2 leading-none">
                {stock.companyName}
                <span className="text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full uppercase">
                  {stock.ticker}
                </span>
              </h2>
              <span className="text-xs text-stone-400 mt-1 block">Детайлен бизнес профил и пазарни метрики (TradingView Data)</span>
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
        <div className="p-5 overflow-y-auto flex flex-col gap-5 font-sans text-sm">
          
          {/* TradingView Live Symbol Info Strip */}
          <div className="w-full h-[65px] bg-black/60 rounded-xl overflow-hidden border border-[#2a2e39] shrink-0">
            <SymbolInfo 
              symbol={tvSymbol}
              colorTheme="dark"
              width="100%"
              height="100%"
              autosize={false}
            />
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#181c27] border border-[#2a2e39] p-3 rounded-xl">
            <div className="flex flex-col">
              <span className="text-[10px] text-stone-400 uppercase font-bold flex items-center gap-1">
                <DollarSign size={11} className="text-emerald-400" /> Пазарна Капитализация
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-white font-mono mt-0.5">
                {formatCap(stock.marketCap)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-stone-400 uppercase font-bold flex items-center gap-1">
                <Activity size={11} className="text-indigo-400" /> Текуща Цена
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-white font-mono mt-0.5">
                ${stock.currentPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-stone-400 uppercase font-bold flex items-center gap-1">
                <Target size={11} className="text-amber-400" /> Справедлива Цена
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-300 font-mono mt-0.5">
                {stock.fairPrice ? `$${stock.fairPrice.toFixed(2)}` : 'N/A'}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-stone-400 uppercase font-bold flex items-center gap-1">
                <Award size={11} className="text-blue-400" /> EPS (Печалба на акция)
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-white font-mono mt-0.5">
                {stock.eps ? stock.eps.toFixed(2) : 'N/A'}
              </span>
            </div>
          </div>

          {/* Business Summary Card */}
          <div className="flex flex-col gap-2 bg-gradient-to-r from-[#1e1e2e] to-[#252538] border border-[#3b3b54]/80 rounded-xl p-4 text-stone-200 shadow-sm">
            <span className="text-xs font-extrabold uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
              <Briefcase size={14} className="text-indigo-400" />
              С какво се занимава компанията?
            </span>
            <p className="text-xs sm:text-sm font-normal leading-relaxed text-stone-200">
              {profile.description}
            </p>
          </div>

          {/* Business Segments & Revenue Breakdown */}
          {profile.businessSegments && profile.businessSegments.length > 0 && (
            <div className="flex flex-col gap-2 bg-[#181c27] border border-[#2a2e39] p-3.5 rounded-xl">
              <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                <PieChart size={14} className="text-emerald-400" />
                Основни източници на приходи &amp; Дивизии
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.businessSegments.map((segment, idx) => (
                  <span 
                    key={idx}
                    className="text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg"
                  >
                    • {segment}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Highlights & Competitive Moat */}
          {profile.keyHighlights && profile.keyHighlights.length > 0 && (
            <div className="flex flex-col gap-2 bg-[#181c27] border border-[#2a2e39] p-3.5 rounded-xl">
              <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Award size={14} className="text-amber-400" />
                Ключови конкурентни предимства
              </span>
              <ul className="flex flex-col gap-1.5 mt-1 text-xs text-stone-300">
                {profile.keyHighlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">✓</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Details Grid (Sector, CEO, Employees, HQ) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Sector & Industry */}
            <div className="bg-[#1e222d] border border-[#2a2e39] p-3 rounded-xl flex flex-col gap-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase flex items-center gap-1">
                <Building2 size={12} className="text-indigo-400" /> Сектор &amp; Индустрия
              </span>
              <span className="text-xs font-bold text-white truncate">{profile.sector}</span>
              <span className="text-[11px] text-stone-400 truncate">{profile.industry}</span>
            </div>

            {/* CEO */}
            <div className="bg-[#1e222d] border border-[#2a2e39] p-3 rounded-xl flex flex-col gap-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase flex items-center gap-1">
                <UserCheck size={12} className="text-emerald-400" /> Изпълнителен директор (CEO)
              </span>
              <span className="text-xs font-bold text-white truncate">{profile.ceo}</span>
              <span className="text-[11px] text-stone-400">Основана: {profile.founded} г.</span>
            </div>

            {/* Employees */}
            <div className="bg-[#1e222d] border border-[#2a2e39] p-3 rounded-xl flex flex-col gap-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase flex items-center gap-1">
                <Users size={12} className="text-blue-400" /> Брой служители
              </span>
              <span className="text-xs font-bold text-white font-mono">{profile.employees}</span>
            </div>

            {/* Headquarters */}
            <div className="bg-[#1e222d] border border-[#2a2e39] p-3 rounded-xl flex flex-col gap-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase flex items-center gap-1">
                <MapPin size={12} className="text-rose-400" /> Седалище
              </span>
              <span className="text-xs font-bold text-white truncate">{profile.headquarters}</span>
            </div>

          </div>

          {/* Key Competitors */}
          {profile.competitors && profile.competitors.length > 0 && (
            <div className="flex flex-col gap-2 bg-[#181c27] border border-[#2a2e39] p-3.5 rounded-xl">
              <span className="text-xs font-extrabold uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                <Users2 size={14} className="text-rose-400" />
                Основни конкуренти в сектора
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.competitors.map((comp, idx) => (
                  <span 
                    key={idx}
                    className="text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-lg"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Official Website Button */}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-[#1e222d] hover:bg-[#2a2e39] border border-[#363a45] rounded-xl text-stone-200 hover:text-white font-semibold text-xs transition-all cursor-pointer flex items-center justify-between no-underline"
            >
              <span className="flex items-center gap-2">
                <Globe size={14} className="text-indigo-400" />
                Официален уебсайт на {stock.companyName}
              </span>
              <ExternalLink size={14} />
            </a>
          )}

        </div>

        {/* Footer Link */}
        <div className="p-3.5 border-t border-[#2a2e39] bg-[#131722] shrink-0 flex justify-between items-center text-xs">
          <a
            href={`https://www.tradingview.com/symbols/${tvSymbol.replace(':', '-')}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-bold no-underline"
          >
            <ExternalLink size={13} />
            Пълен профил и анализи в TradingView
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
