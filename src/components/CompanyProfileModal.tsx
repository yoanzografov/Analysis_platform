import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Stock } from '../types';
import { X, ExternalLink, Globe, Building2 } from 'lucide-react';
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

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md font-sans text-stone-100"
    >
      {/* Clean Modal Container matching StockAnalysis.com structure */}
      <div className="w-full max-w-[840px] bg-[#131722] border border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Clean Header */}
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
              <span className="text-xs text-stone-400 mt-1 block">Профил и Бизнес Дейност (StockAnalysis / TradingView)</span>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[#2a2e39] rounded-full transition-colors text-stone-400 hover:text-white cursor-pointer"
            title="Затвори"
          >
            <X size={22} />
          </button>
        </div>

        {/* Responsive Content Grid (Left Description + Right Fact Box) */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans text-sm">
          
          {/* Left Column: Company Description (StockAnalysis.com Main Article Style) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-white border-b border-[#2a2e39] pb-2 flex items-center gap-2">
              <Building2 size={18} className="text-indigo-400" />
              Описание на бизнес дейността
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

          {/* Right Column: Clean Fact Box (StockAnalysis.com Sidebar Style) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Key Facts Table Box */}
            <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 flex flex-col gap-3">
              <h4 className="text-xs font-extrabold text-stone-400 uppercase tracking-wider border-b border-[#2a2e39] pb-2">
                Ключови Данни за Компанията
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
                    <td className="py-2 text-stone-400 font-medium">Главeн Директор (CEO)</td>
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

            {/* Contact / Official Website Box */}
            {profile.website && (
              <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 flex flex-col gap-2.5">
                <h4 className="text-xs font-extrabold text-stone-400 uppercase tracking-wider border-b border-[#2a2e39] pb-2">
                  Контакти &amp; Уебсайт
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

        {/* Clean Footer */}
        <div className="px-6 py-3.5 border-t border-[#2a2e39] bg-[#131722] shrink-0 flex justify-between items-center text-xs">
          <a
            href={`https://www.tradingview.com/symbols/${tvSymbol.replace(':', '-')}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-bold no-underline"
          >
            <ExternalLink size={13} />
            Пълен профил в TradingView
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
