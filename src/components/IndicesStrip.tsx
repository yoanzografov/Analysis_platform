import { useEffect, useState, useRef } from 'react';
import { MarketIndex } from '../types';
import { Globe, ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface Props {
 indices: MarketIndex[];
 isSimulating: boolean;
 onNewUserClick?: () => void;
}

export default function IndicesStrip({ indices, isSimulating, onNewUserClick }: Props) {
 const [selectedCategory, setSelectedCategory] = useState<string>('US Markets');
 const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);
 const [flashStates, setFlashStates] = useState<Record<string, 'up' | 'down' | null>>({});

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
 'Currencies & Crypto'
 ];

 // Filter indices based on active category
 const filteredIndices = indices.filter(idx => idx.category === selectedCategory);

 // Pad to exactly 8 containers
 const displayItems = [...filteredIndices];
 const emptyCount = 8 - displayItems.length;
 const placeholders = Array.from({ length: Math.max(0, emptyCount) });

 const formatPrice = (val: number, name: string) => {
 // Currencies or specific items
 if (name.includes('/') || selectedCategory === 'Currencies & Crypto') {
 if (val < 5) return val.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
 return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
 }
 return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
 };

 return (
    <div className="w-full bg-bg rounded-2xl border border-border select-none mb-4 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center h-16 divide-x divide-border">
        
        {/* Category Dropdown Selector */}
        <div ref={dropdownRef} className="w-[230px] shrink-0 h-full px-4 flex flex-col justify-center relative z-20">
          <span className="text-xs text-ink/60 font-serif italic uppercase tracking-wider block mb-0.5 select-none">
            Index Markets
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full text-left font-mono font-bold text-xs uppercase tracking-tight hover:text-indigo-500 transition-colors focus:outline-none group cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-ink-muted group-hover:text-indigo-500" />
              <span className="text-sm font-sans font-extrabold text-ink leading-tight tracking-tight group-hover:text-indigo-500">
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
        <div className="flex-1 h-full overflow-x-auto custom-mini-scroll flex bg-bg">
          <div className="min-w-[800px] flex-1 grid grid-cols-8 divide-x divide-border h-full">
            
            {/* Real items */}
            {displayItems.map((item, idx) => {
              const flash = flashStates[item.name];
              const isPositive = item.changePct >= 0;

              return (
                <div
                  key={`${item.name}-${item.ticker || idx}`}
                  className={`h-full flex flex-col justify-center px-3.5 transition-all duration-300 ${
                    flash === 'up'
                      ? 'bg-emerald-500/10'
                      : flash === 'down'
                      ? 'bg-red-500/10'
                      : 'hover:bg-card-hover'
                  }`}
                >
                  <span className="text-[10px] font-sans font-bold text-indigo-500 tracking-tight truncate uppercase mb-0.5" title={item.name}>
                    {item.name}
                  </span>
                  <span className="text-[13px] font-sans font-black text-ink leading-tight tracking-tight">
                    {formatPrice(item.value, item.name)}
                  </span>
                  <div
                    className={`text-[10px] font-mono font-black leading-none mt-0.5 truncate ${
                      isPositive ? 'text-[#10b981]' : 'text-red-500'
                    }`}
                  >
                    {isPositive ? '+' : ''}{item.changeVal !== undefined ? item.changeVal.toFixed(2) : '0.00'} {isPositive ? '+' : ''}{item.changePct.toFixed(2)}%
                  </div>
                </div>
              );
            })}

            {/* Empty placeholder containers */}
            {placeholders.map((_, i) => (
              <div key={`placeholder-${i}`} className="h-full bg-transparent hover:bg-card-hover transition-colors" />
            ))}

          </div>
        </div>

        {/* Tools at the far right (Hidden on mobile) */}
        <div className="hidden md:flex px-4 shrink-0 h-full items-center gap-3 relative z-20 border-l border-border">
          {onNewUserClick && (
            <button
              onClick={onNewUserClick}
              className="text-[10px] font-mono font-bold text-red-500 hover:text-red-600 uppercase tracking-tight"
            >
              Нов потребител
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
