import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Building2, Globe, Plus, Sparkles, Check } from 'lucide-react';
import { Stock } from '../types';
import { GLOBAL_TICKERS_CATALOG, CatalogStockItem } from '../utils/globalTickersCatalog';

interface Props {
  stocks: Stock[];
  selectedStock: Stock | null;
  onSelectStock: (stock: Stock) => void;
  onAddStockToTable?: (stock: Stock) => void;
}

export default function StockAnalysisSearchCombobox({
  stocks,
  selectedStock,
  onSelectStock,
  onAddStockToTable
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanQuery = query.trim().toUpperCase();

  const isCurrentStockInTable = useMemo(() => {
    if (!selectedStock) return false;
    const curTicker = selectedStock.ticker.toUpperCase().trim();
    return stocks.some(s => s.ticker.toUpperCase().trim() === curTicker);
  }, [selectedStock, stocks]);

  // Filter user stocks
  const userMatches = useMemo(() => {
    if (!cleanQuery) return stocks.slice(0, 6);
    return stocks.filter(s =>
      s.ticker.toUpperCase().includes(cleanQuery) ||
      (s.companyName || '').toUpperCase().includes(cleanQuery)
    ).slice(0, 8);
  }, [stocks, cleanQuery]);

  // Filter global catalog
  const globalMatches = useMemo(() => {
    const userTickers = new Set(stocks.map(s => s.ticker.toUpperCase().trim()));
    const availableCatalog = GLOBAL_TICKERS_CATALOG.filter(c => !userTickers.has(c.ticker));
    if (!cleanQuery) return availableCatalog.slice(0, 8);
    return availableCatalog.filter(c =>
      c.ticker.toUpperCase().includes(cleanQuery) ||
      c.companyName.toUpperCase().includes(cleanQuery) ||
      (c.sector && c.sector.toUpperCase().includes(cleanQuery))
    ).slice(0, 10);
  }, [stocks, cleanQuery]);

  const exactUserMatch = useMemo(() => {
    if (!cleanQuery) return null;
    return stocks.find(s => s.ticker.toUpperCase().trim() === cleanQuery);
  }, [stocks, cleanQuery]);

  const exactGlobalMatch = useMemo(() => {
    if (!cleanQuery) return null;
    return GLOBAL_TICKERS_CATALOG.find(c => c.ticker === cleanQuery);
  }, [cleanQuery]);

  const handleSelectUserStock = (s: Stock) => {
    onSelectStock(s);
    setIsOpen(false);
    setQuery('');
  };

  const handleSelectCatalogItem = (item: CatalogStockItem) => {
    const synthesizedStock: Stock = {
      ticker: item.ticker,
      companyName: item.companyName,
      currentPrice: item.price || 100,
      fairPrice: null,
      difference: null,
      buySell: 'ДРУГИ',
      marketCap: 50000000000,
      peRatio: 25,
      eps: 4.0,
      profileLink: item.sector || 'General',
      dividend: '-',
      signal: 'Hold',
      low52: 80,
      high52: 120,
      date: new Date().toLocaleDateString('bg-BG'),
      priceOfCalc: item.price || 100,
      dailyChangePct: 0
    };
    onSelectStock(synthesizedStock);
    setIsOpen(false);
    setQuery('');
  };

  const handleSelectCustomTypedTicker = () => {
    if (!cleanQuery) return;
    const synthesizedStock: Stock = {
      ticker: cleanQuery,
      companyName: cleanQuery,
      currentPrice: 100,
      fairPrice: null,
      difference: null,
      buySell: 'ДРУГИ',
      marketCap: 25000000000,
      peRatio: 22,
      eps: 3.5,
      profileLink: 'General',
      dividend: '-',
      signal: 'Hold',
      low52: 80,
      high52: 120,
      date: new Date().toLocaleDateString('bg-BG'),
      priceOfCalc: 100,
      dailyChangePct: 0
    };
    onSelectStock(synthesizedStock);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 relative z-50" ref={containerRef}>
      {/* Add to Portfolio Button if this stock is viewed externally */}
      {!isCurrentStockInTable && selectedStock && onAddStockToTable && (
        <button
          type="button"
          onClick={() => onAddStockToTable(selectedStock)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-black transition-colors cursor-pointer shadow-xs"
          title={`Добави ${selectedStock.ticker} към твоята Интерактивна таблица`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Добави към таблицата</span>
        </button>
      )}

      {isCurrentStockInTable && (
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500/80 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Check className="w-3 h-3" /> В портфолиото
        </span>
      )}

      {/* Combobox Search Trigger / Input - Styled 1:1 like INTERACTIVE TABLE search bar */}
      <div className="relative w-full sm:w-64 md:w-72">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (exactUserMatch) {
                  handleSelectUserStock(exactUserMatch);
                } else if (exactGlobalMatch) {
                  handleSelectCatalogItem(exactGlobalMatch);
                } else if (userMatches.length > 0) {
                  handleSelectUserStock(userMatches[0]);
                } else if (globalMatches.length > 0) {
                  handleSelectCatalogItem(globalMatches[0]);
                } else if (cleanQuery) {
                  handleSelectCustomTypedTicker();
                }
              } else if (e.key === 'Escape') {
                setIsOpen(false);
              }
            }}
            placeholder="Търсене по тикер или име..."
            className="w-full bg-bg rounded-2xl border border-border pl-8 pr-8 py-1 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-border font-sans tabular-nums"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1.5 p-0.5 rounded hover:bg-card-hover text-ink-faint hover:text-ink transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : selectedStock ? (
            <span className="absolute right-2.5 top-1.5 text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-border/40 text-ink-faint pointer-events-none">
              {selectedStock.ticker}
            </span>
          ) : null}
        </div>

        {/* Dropdown Results Popover */}
        {isOpen && (
          <div className="absolute top-full mt-2 left-0 right-0 max-h-[380px] overflow-y-auto rounded-2xl bg-card/95 backdrop-blur-xl border border-border/90 shadow-2xl z-[999] p-2 space-y-2 animate-in fade-in zoom-in-95 duration-100">
            {/* Quick action to load typed ticker directly */}
            {cleanQuery && !exactUserMatch && !exactGlobalMatch && (
              <button
                type="button"
                onClick={handleSelectCustomTypedTicker}
                className="w-full p-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-left transition-colors flex items-center justify-between gap-2 group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-ink group-hover:text-indigo-400">
                      Зареди пълен анализ за "{cleanQuery}"
                    </div>
                    <div className="text-[10px] text-ink-faint">
                      Извличане на живи борсови данни и 10-годишни отчети от TradingView
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-400 shrink-0">
                  Enter ↵
                </span>
              </button>
            )}

            {/* Section 1: User's Table Stocks */}
            {userMatches.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-blue-400" />
                  <span>Вашите активи в платформата</span>
                </div>
                {userMatches.map((s) => {
                  const isSelected = selectedStock?.ticker.toUpperCase().trim() === s.ticker.toUpperCase().trim();
                  return (
                    <button
                      key={s.ticker}
                      type="button"
                      onClick={() => handleSelectUserStock(s)}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-left transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-500/15 text-indigo-400 font-black border border-indigo-500/30'
                          : 'hover:bg-card-hover text-ink'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-black text-xs text-ink min-w-[50px]">
                          {s.ticker}
                        </span>
                        <span className="text-xs font-medium text-ink-muted truncate">
                          {s.companyName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {s.currentPrice > 0 && (
                          <span className="font-mono text-xs text-ink font-bold">
                            ${s.currentPrice.toFixed(2)}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Section 2: Global S&P 500 & Global Catalog */}
            {globalMatches.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-border/60">
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span>Глобални пазари & S&P 500 (StockAnalysis)</span>
                </div>
                {globalMatches.map((item) => {
                  const isSelected = selectedStock?.ticker.toUpperCase().trim() === item.ticker;
                  return (
                    <button
                      key={item.ticker}
                      type="button"
                      onClick={() => handleSelectCatalogItem(item)}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-left transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-500/15 text-indigo-400 font-black border border-indigo-500/30'
                          : 'hover:bg-card-hover text-ink'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-black text-xs text-emerald-400 min-w-[50px]">
                          {item.ticker}
                        </span>
                        <span className="text-xs font-medium text-ink-muted truncate">
                          {item.companyName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.sector && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-border/50 text-ink-faint">
                            {item.sector}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* No matches fallback */}
            {userMatches.length === 0 && globalMatches.length === 0 && cleanQuery && (
              <div className="p-4 text-center space-y-2">
                <p className="text-xs text-ink-faint">
                  Няма локално намерено име за "{cleanQuery}".
                </p>
                <button
                  type="button"
                  onClick={handleSelectCustomTypedTicker}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-600 transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Търси "{cleanQuery}" в глобалните борси</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
