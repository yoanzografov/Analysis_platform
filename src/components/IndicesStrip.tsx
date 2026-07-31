import { useEffect, useState, useRef } from 'react';
import { MarketIndex } from '../types';
import { Globe, ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import IndexDetailChartModal from './IndexDetailChartModal';

interface Props {
  indices: MarketIndex[];
  isSimulating?: boolean;
}

function IndexHoverChart({ changePct, name }: { changePct?: number; name: string }) {
  const safePct = typeof changePct === 'number' && !isNaN(changePct) ? changePct : 0;
  const isUp = safePct >= 0;
  let seed = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  
  const steps = 24;
  const prices: number[] = new Array(steps + 1);
  let currentVal = 100;
  prices[0] = currentVal;
  
  for (let i = 1; i <= steps; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const rnd = (seed / 233280) - 0.5;
    const trend = (safePct / 100) / steps;
    currentVal = currentVal * (1 + rnd * 0.04 + trend);
    prices[i] = currentVal;
  }
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;
  
  const width = 160;
  const height = 50;
  const padding = 2;
  const scaleHeight = height - padding * 2;
  
  const points = prices.map((price, i) => {
    const x = (i / steps) * (width - padding * 2) + padding;
    const y = height - padding - ((price - minPrice) / range) * scaleHeight;
    return `${x},${y}`;
  }).join(' ');
  
  const strokeColor = isUp ? '#10b981' : '#f43f5e';
  const fillColor = isUp ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-sans font-bold text-ink-muted">Дневно движение</span>
        <span className={`text-xs font-sans font-black tabular-nums ${isUp ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
          {isUp ? '+' : ''}{safePct.toFixed(2)}%
        </span>
      </div>
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon
          points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
          fill={fillColor}
        />
      </svg>
    </div>
  );
}

export default function IndicesStrip({ indices }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('US Markets');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [flashStates, setFlashStates] = useState<Record<string, 'up' | 'down' | null>>({});
  const [activeChartIndex, setActiveChartIndex] = useState<MarketIndex | null>(null);

 useEffect(() => {
 // Detect index differences to apply visual highlight flash effect
 const newFlashes: Record<string, 'up' | 'down' | null> = {};
 indices.forEach(idx => {
 const prev = localStorage.getItem(`prev_idx_${idx.name}`);
 const valStr = idx.value.toString();
 if (prev && prev !== valStr) {
 newFlashes[idx.name] = parseFloat(prev) < idx.value ? 'up' : 'down';
 }
 localStorage.setItem(`prev_idx_${idx.name}`, valStr);
 });

 if (Object.keys(newFlashes).length > 0) {
 setFlashStates(prev => ({ ...prev, ...newFlashes }));
 const timer = setTimeout(() => {
 setFlashStates({});
 }, 1000);
 return () => clearTimeout(timer);
 }
 }, [indices]);

 // Click outside to close dropdown
 useEffect(() => {
 const handleOutsideClick = (e: MouseEvent) => {
 if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
 setIsOpen(false);
 }
 };
 window.addEventListener('mousedown', handleOutsideClick);
 return () => window.removeEventListener('mousedown', handleOutsideClick);
 }, []);

  const CATEGORIES = [
    'US Markets',
    'European Markets',
    'Asian Markets',
    'Commodities',
    'Currencies (Само Валути)',
    'Crypto (Само Криптовалути)',
    'Bonds (Облигации)'
  ];

  const FALLBACK_CRYPTO: MarketIndex[] = [
    { name: 'Bitcoin (BTC)', value: 62919.60, changePct: -2.79, ticker: 'BTC-USD', changeVal: -1804.43, category: 'Crypto (Само Криптовалути)' },
    { name: 'Ethereum (ETH)', value: 3450.20, changePct: 1.85, ticker: 'ETH-USD', changeVal: 62.70, category: 'Crypto (Само Криптовалути)' },
    { name: 'Solana (SOL)', value: 152.40, changePct: 4.12, ticker: 'SOL-USD', changeVal: 6.02, category: 'Crypto (Само Криптовалути)' },
    { name: 'Binance Coin (BNB)', value: 575.80, changePct: 0.95, ticker: 'BNB-USD', changeVal: 5.40, category: 'Crypto (Само Криптовалути)' },
  ];

  const FALLBACK_CURRENCIES: MarketIndex[] = [
    { name: 'EUR/USD', value: 1.15, changePct: 0.06, ticker: 'EURUSD=X', changeVal: 0.00, category: 'Currencies (Само Валути)' },
    { name: 'USD/JPY', value: 157.99, changePct: -1.01, ticker: 'JPY=X', changeVal: -1.62, category: 'Currencies (Само Валути)' },
    { name: 'USD/GBP', value: 0.74, changePct: -0.17, ticker: 'GBP=X', changeVal: -0.00, category: 'Currencies (Само Валути)' },
    { name: 'USD/AUD', value: 1.42, changePct: -0.19, ticker: 'USDAUD=X', changeVal: -0.00, category: 'Currencies (Само Валути)' },
    { name: 'USD/CAD', value: 1.40, changePct: 0.05, ticker: 'USDCAD=X', changeVal: 0.00, category: 'Currencies (Само Валути)' },
    { name: 'USD/MXN', value: 17.31, changePct: -0.10, ticker: 'USDMXN=X', changeVal: -0.02, category: 'Currencies (Само Валути)' },
    { name: 'USD/HKD', value: 7.84, changePct: -0.01, ticker: 'USDHKD=X', changeVal: -0.00, category: 'Currencies (Само Валути)' },
  ];

  const FALLBACK_BONDS: MarketIndex[] = [
    { name: 'US 10Y Yield', value: 4.22, changePct: -0.85, ticker: '^TNX', changeVal: -0.036, category: 'Bonds (Облигации)' },
    { name: 'US 2Y Yield', value: 4.48, changePct: -0.62, ticker: '^IRX', changeVal: -0.028, category: 'Bonds (Облигации)' },
    { name: 'US 30Y Yield', value: 4.45, changePct: -0.71, ticker: '^TYX', changeVal: -0.032, category: 'Bonds (Облигации)' },
    { name: 'Germany 10Y Yield', value: 2.51, changePct: -0.40, ticker: 'TMBMKDE-10Y', changeVal: -0.01, category: 'Bonds (Облигации)' },
    { name: 'UK 10Y Yield', value: 4.16, changePct: -0.32, ticker: 'TMBMKGB-10Y', changeVal: -0.013, category: 'Bonds (Облигации)' },
  ];

  // Filter indices based on active category with smart fallback
  let filteredIndices = indices.filter(idx => {
    const cat = idx.category ? idx.category.toLowerCase() : '';
    const name = idx.name ? idx.name.toLowerCase() : '';
    const ticker = idx.ticker ? idx.ticker.toUpperCase() : '';

    if (selectedCategory.startsWith('Crypto')) {
      return (
        cat.includes('crypto') ||
        ticker.endsWith('-USD') ||
        ticker.includes('BTC') ||
        ticker.includes('ETH') ||
        ticker.includes('SOL') ||
        name.includes('bitcoin') ||
        name.includes('ethereum')
      );
    }
    if (selectedCategory.startsWith('Currencies')) {
      return (
        (cat.includes('currenc') || name.includes('/') || ticker.endsWith('=X') || ticker.includes('DX-Y')) &&
        !ticker.endsWith('-USD') &&
        !cat.includes('crypto')
      );
    }
    if (selectedCategory.startsWith('Bonds')) {
      return cat.includes('bond') || ticker.startsWith('^TNX') || ticker.startsWith('^IRX') || ticker.startsWith('^TYX') || name.includes('yield') || name.includes('bond');
    }
    return idx.category === selectedCategory;
  });

  if (filteredIndices.length === 0) {
    if (selectedCategory.startsWith('Crypto')) filteredIndices = FALLBACK_CRYPTO;
    else if (selectedCategory.startsWith('Currencies')) filteredIndices = FALLBACK_CURRENCIES;
    else if (selectedCategory.startsWith('Bonds')) filteredIndices = FALLBACK_BONDS;
  }

  // Pad to max 7 market index items + 1 Heat Map box on the right (Total = 8)
  const displayItems = [...filteredIndices].slice(0, 7);
  const emptyCount = 7 - displayItems.length;
  const placeholders = Array.from({ length: Math.max(0, emptyCount) });

  const formatPrice = (val: number, name: string) => {
    if (selectedCategory.startsWith('Bonds')) return `${val.toFixed(2)}%`;
    if (name.includes('/') || selectedCategory.startsWith('Currencies')) {
      if (val < 5) return val.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
      return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

 return (
    <div className="w-full relative z-50 mb-4 mt-5">
      <div className="w-full bg-bg rounded-2xl border border-border shadow-sm flex items-center h-16 divide-x divide-border">
          
        {/* Category selector */}
        <div ref={dropdownRef} className="w-[160px] md:w-[230px] shrink-0 h-full px-2 md:px-4 flex flex-col justify-center relative z-20 rounded-l-2xl">
          <span className="text-xs md:text-xs text-ink/60 font-serif italic uppercase tracking-wider block mb-0.5 truncate">
              Index Markets
            </span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between w-full text-left font-sans tabular-nums font-bold text-xs uppercase tracking-tight hover:text-indigo-500 transition-colors focus:outline-none group cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-ink-muted group-hover:text-indigo-500" />
                <span className="text-xs font-sans font-extrabold text-ink leading-tight tracking-tight group-hover:text-indigo-500">
                  {selectedCategory}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-ink-muted transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
            </button>

            {/* Floating Dropdown */}
            {isOpen && (
              <div className="absolute left-0 top-[100%] mt-2 w-full bg-card rounded-xl border border-border shadow-xl py-1.5 flex flex-col z-50">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-sans font-bold transition-all mx-1 w-[calc(100%-8px)] rounded-md ${
                      selectedCategory === cat
                        ? 'bg-indigo-500/10 text-indigo-500'
                        : 'text-ink-muted hover:bg-card-hover hover:text-ink'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Indices/Indicators Grid (8 columns) */}
          <div className="flex-1 h-full overflow-x-auto overflow-y-hidden custom-mini-scroll flex bg-bg rounded-r-2xl">
            <div className="min-w-[980px] flex-1 grid grid-cols-8 divide-x divide-border h-full">
            
            {/* Real items */}
            {displayItems.map((item, idx) => {
              const flash = flashStates[item.name];
              const safePct = typeof item.changePct === 'number' && !isNaN(item.changePct) ? item.changePct : 0;
              const safeVal = typeof item.changeVal === 'number' && !isNaN(item.changeVal) ? item.changeVal : 0;
              const isPositive = safePct >= 0;

              return (
                <div
                  key={`${item.name}-${item.ticker || idx}`}
                  onClick={() => setActiveChartIndex(item)}
                  className={`group relative h-full flex flex-col justify-center px-2.5 transition-all duration-300 cursor-pointer ${
                    flash === 'up'
                      ? 'bg-emerald-500/10'
                      : flash === 'down'
                      ? 'bg-red-500/10'
                      : 'hover:bg-card-hover'
                  }`}
                >
                  <span className="text-xs font-sans font-bold text-indigo-500 tracking-tight truncate uppercase mb-0.5" title={item.name}>
                    {item.name}
                  </span>
                  <span className="text-xs font-sans font-black text-ink leading-tight tracking-tight">
                    {formatPrice(item.value, item.name)}
                  </span>
                  <div
                    className={`flex items-center gap-1 text-[11px] font-sans tabular-nums font-black leading-none mt-1 whitespace-nowrap ${
                      isPositive ? 'text-[#10b981]' : 'text-red-500'
                    }`}
                  >
                    <span>
                      {isPositive ? '+' : ''}{safeVal.toFixed(2)} {isPositive ? '+' : ''}{safePct.toFixed(2)}%
                    </span>
                  </div>

                  {/* Hover Chart Popover */}
                  <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 hidden group-hover:block p-4 bg-bg border-2 border-border rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] z-[200] pointer-events-none origin-top animate-in fade-in zoom-in-95 duration-150">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-bg border-t-2 border-l-2 border-border rotate-45" />
                    <div className="relative z-10 bg-bg">
                      <IndexHoverChart changePct={safePct} name={item.name} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty placeholder containers */}
            {placeholders.map((_, i) => (
              <div key={`placeholder-${i}`} className="h-full bg-transparent hover:bg-card-hover transition-colors" />
            ))}

            {/* 8th Box (Far Right): TradingView Heat Map */}
            <a
              href="https://www.tradingview.com/heatmap/stock/#%7B%22dataSource%22%3A%22SPX500%22%2C%22blockColor%22%3A%22change%22%2C%22blockSize%22%3A%22market_cap_basic%22%2C%22grouping%22%3A%22sector%22%7D"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative h-full flex flex-col justify-center px-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all duration-200 cursor-pointer"
              title="Отвори TradingView Stock Heat Map (Секторна карта)"
            >
              <div className="flex items-center gap-2 mb-0.5 truncate">
                {/* Colorful Heatmap Grid Icon */}
                <div className="w-4 h-4 rounded bg-bg border border-border flex items-center justify-center shrink-0 p-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                  <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                    <div className="bg-emerald-500 rounded-[1px]" />
                    <div className="bg-rose-500 rounded-[1px]" />
                    <div className="bg-emerald-400 rounded-[1px]" />
                    <div className="bg-amber-500 rounded-[1px]" />
                  </div>
                </div>

                <span className="text-xs font-sans font-extrabold text-indigo-400 group-hover:text-indigo-300 tracking-tight truncate uppercase">
                  Heat Map ↗
                </span>
              </div>
              <span className="text-xs font-sans font-black text-ink leading-tight tracking-tight truncate">
                Heat Map
              </span>
              <span className="text-[10px] font-mono text-ink-faint leading-none mt-0.5">
                tradingview.com
              </span>
            </a>

          </div>
        </div>
      </div>
      
      {activeChartIndex && (
        <IndexDetailChartModal
          index={activeChartIndex}
          onClose={() => setActiveChartIndex(null)}
        />
      )}
    </div>
  );
}
