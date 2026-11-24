import React, { useEffect, useMemo, useState } from 'react';
import { PieChart, ArrowUpRight, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Stock } from '../types';
import StockAnalysisSearchCombobox from './StockAnalysisSearchCombobox';

interface EtfItem {
  ticker: string;
  name: string;
  category: string;
  expenseRatio: string;
  price: number | null;
  changePct: number | null;
  currency: string;
  low52: number | null;
  high52: number | null;
  divYield: number | null;
}

interface Props {
  onSelectEtf: (stock: Stock) => void;
}

const CATEGORIES = ['Всички', 'US Index', 'Tech & Growth', 'Dividend', 'Europe UCITS', 'Commodities & Bonds'];

export default function EtfExplorerView({ onSelectEtf }: Props) {
  const [etfs, setEtfs] = useState<EtfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Всички');

  const fetchEtfs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/etf-list');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.etfs)) setEtfs(json.etfs);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEtfs();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return etfs.filter(item => {
      const catOk = selectedCategory === 'Всички' || item.category === selectedCategory;
      const queryOk = !q || item.ticker.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
      return catOk && queryOk;
    });
  }, [etfs, query, selectedCategory]);

  const etfAsStocks = useMemo<Stock[]>(() => {
    return etfs.map(item => ({
      watch: '',
      ticker: item.ticker.toUpperCase(),
      companyName: item.name,
      date: '',
      priceOfCalc: null,
      dailyChangePct: item.changePct ?? 0,
      currentPrice: item.price ?? 0,
      fairPrice: null,
      difference: null,
      buySell: 'ДРУГИ',
      marketCap: 0,
      peRatio: null,
      eps: null,
      profileLink: '',
      dividend: item.divYield != null ? `${item.divYield}%` : '-',
      signal: 'Hold',
      low52: item.low52,
      high52: item.high52,
      sector: 'ETF',
      industry: item.category,
      dividendYield: item.divYield ?? undefined,
    }));
  }, [etfs]);

  const handleOpenEtf = (item: EtfItem) => {
    onSelectEtf({
      watch: '',
      ticker: item.ticker.toUpperCase(),
      companyName: item.name,
      date: '',
      priceOfCalc: null,
      dailyChangePct: item.changePct ?? 0,
      currentPrice: item.price ?? 0,
      fairPrice: null,
      difference: null,
      buySell: 'ДРУГИ',
      marketCap: 0,
      peRatio: null,
      eps: null,
      profileLink: '',
      dividend: item.divYield != null ? `${item.divYield}%` : '-',
      signal: 'Hold',
      low52: item.low52,
      high52: item.high52,
      sector: 'ETF',
      industry: item.category,
      dividendYield: item.divYield ?? undefined,
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Card (Centered Hero Style matching HOME & STOCKS) */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-indigo-950/15 px-4 py-2.5 sm:px-5 sm:py-3 min-h-[112px] flex flex-col justify-center shadow-xs space-y-2">
        <div className="max-w-5xl mx-auto w-full text-center space-y-2">
          <h2 className="text-base sm:text-lg font-black tracking-tight text-ink leading-tight">
            ETF Screener &amp; Explorer
          </h2>

          <div className="flex items-center justify-center gap-2 w-full max-w-2xl mx-auto">
            <div className="flex-1 text-left">
              <StockAnalysisSearchCombobox
                stocks={etfAsStocks}
                selectedStock={null}
                onSelectStock={onSelectEtf}
                onQueryChange={setQuery}
                size="hero"
                placeholder="Търсене на ETF по тикер или име (напр. SPY, QQQ, SXR8.DE)..."
              />
            </div>
            <button
              type="button"
              onClick={fetchEtfs}
              disabled={loading}
              className="p-2 rounded-2xl border border-border bg-bg hover:bg-card-hover text-ink-muted hover:text-ink cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
              title="Опресни ETF котировките"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                  : 'bg-bg/60 text-ink-muted hover:text-ink border-border/70 hover:bg-card-hover'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ETF Table */}
      <div className="rounded-2xl border border-border bg-card/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-card/80 text-[11px] font-black uppercase tracking-wider text-ink-muted">
                <th className="py-3 px-4">Ticker</th>
                <th className="py-3 px-4">Име на фонда</th>
                <th className="py-3 px-4">Категория</th>
                <th className="py-3 px-4 text-right">Цена</th>
                <th className="py-3 px-4 text-right">Дневна %</th>
                <th className="py-3 px-4 text-right">52W Диапазон</th>
                <th className="py-3 px-4 text-right">Div Yield</th>
                <th className="py-3 px-4 text-right">TER / Expense</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs">
              {loading && etfs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-ink-muted">
                    Зареждане на ETF данни от Yahoo Finance...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-ink-muted">
                    Няма намерени ETF фондове по зададените критерии.
                  </td>
                </tr>
              ) : (
                filtered.map(item => {
                  const sym = item.currency === 'EUR' ? '€' : item.currency === 'GBP' ? '£' : '$';
                  const isPos = (item.changePct ?? 0) >= 0;
                  return (
                    <tr
                      key={item.ticker}
                      onClick={() => handleOpenEtf(item)}
                      className="hover:bg-indigo-500/10 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-black text-indigo-400 font-mono whitespace-nowrap">
                        {item.ticker}
                      </td>
                      <td className="py-3 px-4 font-bold text-ink max-w-[260px] truncate">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-muted/50 border border-border/60 text-[10px] font-bold text-ink-muted">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-ink whitespace-nowrap">
                        {item.price != null ? `${sym}${item.price.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        {item.changePct != null ? (
                          <span className={`inline-flex items-center gap-0.5 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isPos ? '+' : ''}{item.changePct.toFixed(2)}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-ink-muted whitespace-nowrap">
                        {item.low52 != null && item.high52 != null
                          ? `${sym}${item.low52.toFixed(2)} – ${sym}${item.high52.toFixed(2)}`
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-ink-muted whitespace-nowrap">
                        {item.divYield != null ? `${item.divYield.toFixed(2)}%` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-ink-faint whitespace-nowrap">
                        {item.expenseRatio}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <ArrowUpRight className="w-4 h-4 text-ink-faint group-hover:text-indigo-400 inline-block transition-colors" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
