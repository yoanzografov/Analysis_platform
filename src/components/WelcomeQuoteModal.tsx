import React, { useState } from 'react';
import { Quote, Sparkles, X, Check, Globe } from 'lucide-react';

interface WelcomeQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeQuoteModal: React.FC<WelcomeQuoteModalProps> = ({ isOpen, onClose }) => {
  const [lang, setLang] = useState<'bg' | 'en'>('bg');
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideWelcomeQuote_v1', 'true');
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div 
        className="bg-[#181b24] border border-amber-500/30 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Subtle Radial Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between relative z-10 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400/90 tracking-widest block">
                {lang === 'bg' ? 'Мъдрост на Инвеститора' : 'Investor Wisdom'}
              </span>
              <h3 className="text-sm font-extrabold text-ink tracking-tight">
                {lang === 'bg' ? 'Философия на Стойностното Инвестиране' : 'Value Investing Philosophy'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-bg/80 border border-border/60 rounded-xl p-1 gap-1 text-xs">
              <button
                type="button"
                onClick={() => setLang('bg')}
                className={`px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  lang === 'bg'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                🇧🇬 BG
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  lang === 'en'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-full text-ink-faint hover:text-ink hover:bg-border/60 transition-all cursor-pointer ml-1"
              title={lang === 'bg' ? 'Затвори' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quote Card Area */}
        <div className="relative bg-[#1e222d] border border-border/60 rounded-2xl p-6 shadow-inner space-y-4">
          <Quote className="w-10 h-10 text-amber-500/25 absolute top-3 right-4 pointer-events-none" />
          
          <div className="relative z-10">
            {lang === 'bg' ? (
              <p className="text-sm md:text-base font-medium leading-relaxed text-stone-200 italic font-serif">
                „Преди много време Бен Греъм ме научи, че <span className="text-amber-300 font-bold not-italic font-sans underline decoration-amber-500/40 decoration-2 underline-offset-4">„Цената е това, което плащаш; стойността е това, което получаваш“</span>. Независимо дали говорим за чорапи или акции, обичам да купувам качествени стоки, когато са намалени.“
              </p>
            ) : (
              <p className="text-sm md:text-base font-medium leading-relaxed text-stone-200 italic font-serif">
                “Long ago, Ben Graham taught me that <span className="text-amber-300 font-bold not-italic font-sans underline decoration-amber-500/40 decoration-2 underline-offset-4">‘Price is what you pay; value is what you get.’</span> Whether we’re talking about socks or stocks, I like buying quality merchandise when it is marked down.”
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-border/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-black text-xs shadow-md border border-amber-300/40">
                WB
              </div>
              <div>
                <h4 className="font-extrabold text-ink text-xs">
                  {lang === 'bg' ? 'Уорън Е. Бъфет' : 'Warren E. Buffett'}
                </h4>
                <p className="text-[11px] text-ink-muted">
                  {lang === 'bg' ? 'Председател и СЕО на Berkshire Hathaway' : 'Chairman & CEO, Berkshire Hathaway'}
                </p>
              </div>
            </div>
            
            <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 font-bold shrink-0">
              {lang === 'bg' ? 'Писмо до акционерите, 2008 г.' : 'Shareholder Letter, 2008'}
            </span>
          </div>
        </div>

        {/* Footer Controls: Don't Show Again Checkbox + Enter Platform Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-ink-muted hover:text-ink transition-colors group">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="hidden"
            />
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
              dontShowAgain 
                ? 'bg-amber-500 border-amber-500 text-black' 
                : 'border-border/80 group-hover:border-amber-500/50'
            }`}>
              {dontShowAgain && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>
              {lang === 'bg' ? 'Не показвай при следващи влизания' : 'Don\'t show again on future visits'}
            </span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <span>{lang === 'bg' ? 'Влез в Платформата' : 'Enter Platform'}</span>
            <span>🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeQuoteModal;
