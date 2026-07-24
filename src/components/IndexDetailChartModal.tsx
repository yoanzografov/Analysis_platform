import React, { useEffect, useState } from 'react';
import { MarketIndex } from '../types';
import { X, ExternalLink } from 'lucide-react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';

interface Props { 
  index: MarketIndex; 
  onClose: () => void; 
}

const NEON_GREEN = '#10b981';
const NEON_RED = '#f43f5e';

export default function IndexDetailChartModal({ index, onClose }: Props) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const isUp = (index.changePct ?? 0) >= 0;
  const accent = isUp ? NEON_GREEN : NEON_RED;

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // Map common index names to TradingView symbols
  const getTvSymbol = (name: string, ticker?: string) => {
    if (ticker) return ticker;
    const map: Record<string, string> = {
      'S&P 500': 'SP:SPX',
      'Dow Jones': 'CBOT:YM1!',
      'Nasdaq': 'NASDAQ:NDX',
      'DAX': 'XETR:DAX',
      'Nikkei 225': 'TSE:NI225',
      'FTSE 100': 'TVC:UKX',
      'VIX': 'CBOE:VIX',
      'Gold': 'COMEX:GC1!',
      'Crude Oil': 'NYMEX:CL1!'
    };
    return map[name] || name;
  };

  const tvSymbol = getTvSymbol(index.name, index.ticker);

  const [activeRange, setActiveRange] = useState<string>("1Y");

  const RANGES = [
    { label: '1D', val: '1D', tvRange: '1D', interval: '5' },
    { label: '1W', val: '1W', tvRange: '5D', interval: '15' },
    { label: '1M', val: '1M', tvRange: '1M', interval: '60' },
    { label: '3M', val: '3M', tvRange: '3M', interval: '120' },
    { label: '6M', val: '6M', tvRange: '6M', interval: 'D' },
    { label: '1Y', val: '1Y', tvRange: '12M', interval: 'D' },
    { label: '5Y', val: '5Y', tvRange: '60M', interval: 'W' },
    { label: 'ALL', val: 'ALL', tvRange: 'ALL', interval: 'M' },
  ] as const;

  const currentConf = RANGES.find(r => r.val === activeRange)!;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-bg/90 backdrop-blur-md font-sans"
    >
      <div className="w-full max-w-[1000px] h-full max-h-[760px] flex flex-col bg-card/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-border shadow-2xl relative">
        
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-border flex items-center justify-center text-ink hover:bg-border-hover transition-colors cursor-pointer border-none outline-none"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        <div className="p-4 sm:p-6 pb-2 sm:pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-ink tracking-tight leading-tight uppercase">
              {index.name}
            </div>
            <div className="text-xs sm:text-xs text-ink-faint mt-1">
              Index Markets
            </div>
          </div>
          
          <div className="flex flex-col items-start sm:items-end w-full sm:w-auto pr-8 sm:pr-14">
            <div className="text-2xl sm:text-3xl font-bold text-ink tracking-tight leading-tight tabular-nums">
              {index.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div 
              className="text-xs sm:text-lg font-semibold mt-0.5 flex items-center justify-end gap-1.5 tabular-nums"
              style={{ color: accent }}
            >
              {isUp ? '+' : ''}{(index.changePct ?? 0).toFixed(2)}%
            </div>
            
            <div className="flex flex-wrap gap-1 mt-3 sm:mt-4 bg-border/40 p-1 rounded-lg">
              {RANGES.map(r => (
                <button
                  key={r.val}
                  onClick={() => setActiveRange(r.val)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    activeRange === r.val 
                      ? 'bg-bg text-ink shadow-sm' 
                      : 'text-ink-faint hover:text-ink hover:bg-border/60'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 relative mx-2 mb-4 min-h-0">
          <AdvancedRealTimeChart
            key={activeRange}
            symbol={tvSymbol}
            theme={isDark ? "dark" : "light"}
            autosize
            style="1"
            interval={currentConf.interval as any}
            timezone="exchange"
            hide_top_toolbar={false}
            hide_side_toolbar={false}
            hide_legend={false}
            allow_symbol_change={true}
            save_image={true}
            details={false}
            hotlist={false}
            calendar={false}
            withdateranges={false}
            range={currentConf.tvRange as any}
          />
        </div>

      </div>
    </div>
  );
}
