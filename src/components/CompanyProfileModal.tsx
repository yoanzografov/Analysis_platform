import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Stock } from '../types';
import { X, ExternalLink, Globe, Building2, Radio } from 'lucide-react';
import { getTradingViewSymbol } from '../utils/tvSymbolMap';
import { getCompanyProfileData } from '../utils/tvCompanyProfiles';

interface Props {
  stock: Stock;
  onClose: () => void;
}

// Live TradingView Symbol Profile Widget Component
function TradingViewSymbolProfileWidget({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    containerRef.current.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: '100%',
      height: 440,
      colorTheme: 'dark',
      isTransparent: true,
      symbol: symbol,
      locale: 'en'
    });

    script.onload = () => setLoaded(true);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [symbol]);

  return (
    <div className="w-full relative min-h-[380px] bg-[#1a1e29]/50 rounded-xl p-2 border border-[#2a2e39] overflow-hidden">
      <div className="tradingview-widget-container" ref={containerRef}></div>
    </div>
  );
}

export default function CompanyProfileModal({ stock, onClose }: Props) {
  const profile = getCompanyProfileData(stock);
  const tvSymbol = getTradingViewSymbol(stock.companyName, stock.ticker);
  const [activeTab, setActiveTab] = useState<'tv_live' | 'bg_overview'>('tv_live');

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md font-sans text-stone-100"
    >
      {/* Clean Modal Container matching StockAnalysis & TradingView structure */}
      <div className="w-full max-w-[860px] bg-[#131722] border border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2e39] bg-[#131722] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 font-extrabold text-base flex items-center justify-center shrink-0">
              i
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2 leading-none">
                {stock.companyName}
                <span className="text-xs font-mono font-bold bg-[#1e222d] text-indigo-300 border border-[#363a45] px-2 py-0.5 rounded-md uppercase">
                  {tvSymbol}
                </span>
              </h2>
              <span className="text-xs text-stone-400 mt-1 block flex items-center gap-1.5">
                <Radio size={12} className="text-emerald-400 animate-pulse" />
                Официални данни в реално време от TradingView (Live Profile)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Selector: Live TradingView vs Bulgarian Overview */}
            <div className="hidden sm:flex bg-[#1e222d] p-1 rounded-lg border border-[#2a2e39] text-xs">
              <button
                onClick={() => setActiveTab('tv_live')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${activeTab === 'tv_live' ? 'bg-indigo-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'}`}
              >
                TradingView Live
              </button>
              <button
                onClick={() => setActiveTab('bg_overview')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${activeTab === 'bg_overview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'}`}
              >
                Български Преглед
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-[#2a2e39] rounded-full transition-colors text-stone-400 hover:text-white cursor-pointer"
              title="Затвори"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex sm:hidden bg-[#1e222d] p-1 border-b border-[#2a2e39] text-xs justify-center gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('tv_live')}
            className={`flex-1 py-1.5 rounded-md font-bold text-center transition-all cursor-pointer ${activeTab === 'tv_live' ? 'bg-indigo-600 text-white' : 'text-stone-400'}`}
          >
            TradingView Live
          </button>
          <button
            onClick={() => setActiveTab('bg_overview')}
            className={`flex-1 py-1.5 rounded-md font-bold text-center transition-all cursor-pointer ${activeTab === 'bg_overview' ? 'bg-indigo-600 text-white' : 'text-stone-400'}`}
          >
            Български Преглед
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto font-sans text-sm">
          {activeTab === 'tv_live' ? (
            /* Tab 1: Live Official TradingView Profile Widget */
            <div className="flex flex-col gap-4">
              <TradingViewSymbolProfileWidget symbol={tvSymbol} />
            </div>
          ) : (
            /* Tab 2: Clean 2-Column StockAnalysis Bulgarian Profile */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Description */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <h3 className="text-base font-extrabold text-white border-b border-[#2a2e39] pb-2 flex items-center gap-2">
                  <Building2 size={18} className="text-indigo-400" />
                  Бизнес описание на компанията
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

              {/* Right Column: Key Facts Table */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 flex flex-col gap-3">
                  <h4 className="text-xs font-extrabold text-stone-400 uppercase tracking-wider border-b border-[#2a2e39] pb-2">
                    Ключови Данни
                  </h4>

                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-[#2a2e39]">
                      <tr>
                        <td className="py-2 text-stone-400 font-medium">Сектор</td>
                        <td className="py-2 text-right font-bold text-white">{profile.sector}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-stone-400 font-medium">Индустрия</td>
                        <td className="py-2 text-right font-bold text-stone-200">{profile.industry}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-stone-400 font-medium">CEO</td>
                        <td className="py-2 text-right font-bold text-emerald-400">{profile.ceo}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-stone-400 font-medium">Служители</td>
                        <td className="py-2 text-right font-mono font-bold text-white">{profile.employees}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-stone-400 font-medium">Основана</td>
                        <td className="py-2 text-right font-bold text-stone-300">{profile.founded} г.</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-stone-400 font-medium">Седалище</td>
                        <td className="py-2 text-right font-bold text-stone-300">{profile.headquarters}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {profile.website && (
                  <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 flex flex-col gap-2">
                    <h4 className="text-xs font-extrabold text-stone-400 uppercase tracking-wider border-b border-[#2a2e39] pb-2">
                      Уебсайт
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
          )}
        </div>

        {/* Footer Link */}
        <div className="px-6 py-3.5 border-t border-[#2a2e39] bg-[#131722] shrink-0 flex justify-between items-center text-xs">
          <a
            href={`https://www.tradingview.com/symbols/${tvSymbol.replace(':', '-')}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-bold no-underline"
          >
            <ExternalLink size={13} />
            Отвори пълния профил в TradingView.com
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
