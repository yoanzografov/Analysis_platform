import { useEffect, useState, useRef } from 'react';
import { MarketIndex } from '../types';
import { Globe, ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
 indices: MarketIndex[];
 isSimulating: boolean;
}

export default function IndicesStrip({ indices, isSimulating }: Props) {
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
 <div className="w-full bg-card rounded-2xl border-b border-border select-none">
 <div className="max-w-7xl mx-auto flex items-center h-16 divide-x divide-white/10/10">
 
 {/* Category Dropdown Selector */}
 <div ref={dropdownRef} className="w-[230px] shrink-0 h-full px-4 flex flex-col justify-center relative z-20">
 <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#6366F1] mb-0.5 select-none">
 Index Markets
 </span>
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="flex items-center justify-between w-full text-left font-mono font-bold text-xs uppercase tracking-tight hover:text-[#6366F1] transition-colors focus:outline-none group cursor-pointer"
 >
 <div className="flex items-center gap-1.5">
 <Globe className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#6366F1]" />
 <span className="text-stone-800 font-sans font-extrabold text-[12px] leading-tight tracking-tight group-hover:text-[#6366F1]">
 {selectedCategory}
 </span>
 </div>
 <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#6366F1]' : ''}`} />
 </button>

 {/* Floating Dropdown */}
 {isOpen && (
 <div className="absolute left-0 top-[100%] mt-px w-full bg-card rounded-2xl border-x border-b border-border shadow-lg py-1 flex flex-col divide-y divide-stone-100">
 {CATEGORIES.map(cat => (
 <button
 key={cat}
 onClick={() => {
 setSelectedCategory(cat);
 setIsOpen(false);
 }}
 className={`w-full text-left px-4 py-2.5 text-xs font-sans font-bold transition-all ${
 selectedCategory === cat
 ? 'bg-stone-100 text-[#6366F1]'
 : 'text-stone-700 hover:bg-stone-50 hover:text-[#6366F1]'
 }`}
 >
 {cat}
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Real-time Indices/Indicators Grid (8 columns) */}
 <div className="flex-1 h-full overflow-x-auto custom-mini-scroll flex">
 <div className="min-w-[800px] flex-1 grid grid-cols-8 divide-x divide-white/10/10 h-full">
 
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
 : 'hover:bg-stone-50/50'
 }`}
 >
 <span className="text-[10px] font-sans font-bold text-[#6366F1] tracking-tight truncate uppercase mb-0.5" title={item.name}>
 {item.name}
 </span>
 <span className="text-[13px] font-sans font-black text-ink leading-tight tracking-tight">
 {formatPrice(item.value, item.name)}
 </span>
 <div
 className={`flex items-center gap-0.5 text-[10px] font-mono font-black leading-none mt-0.5 ${
 isPositive ? 'text-[#10b981]' : 'text-red-500'
 }`}
 >
 {isPositive ? (
 <ArrowUpRight className="w-3 h-3 shrink-0" />
 ) : (
 <ArrowDownRight className="w-3 h-3 shrink-0" />
 )}
 <span className="truncate">
 {isPositive ? '+' : ''}{item.changeVal !== undefined ? item.changeVal.toFixed(2) : '0.00'}
 &nbsp;
 {isPositive ? '+' : ''}{item.changePct.toFixed(2)}%
 </span>
 </div>
 </div>
 );
 })}

 {/* Empty placeholder containers */}
 {placeholders.map((_, i) => (
 <div key={`placeholder-${i}`} className="h-full bg-stone-50/10 hover:bg-stone-50/20 transition-colors" />
 ))}

 </div>
 </div>

 </div>
 </div>
 );
}
