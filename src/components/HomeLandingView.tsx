import React, { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart2,
  Scale,
  Briefcase,
  Sparkles,
  Newspaper,
  Table,
  Target,
  ExternalLink,
  Flame
} from 'lucide-react';
import { Stock, MarketIndex } from '../types';
import StockAnalysisSearchCombobox from './StockAnalysisSearchCombobox';

interface Props {
  stocks: Stock[];
  indices: MarketIndex[];
  onSelectStock: (stock: Stock) => void;
  onAddStockToTable?: (stock: Stock) => void;
  onSwitchTab: (tab: 'home' | 'table' | 'stocks' | 'alerts' | 'portfolio' | 'news' | 'other') => void;
  onOpenDcfModal: () => void;
  onOpenAiAssistant: () => void;
}

interface BriefHeadline {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
}

const TRENDING_TICKERS = ['NVDA', 'AAPL', 'MSFT', 'GOOG', 'AMZN', 'META', 'TSLA', 'AMAT', 'ASML', 'AVGO'];

export default function HomeLandingView({
  stocks,
  indices,
  onSelectStock,
  onAddStockToTable,
  onSwitchTab,
  onOpenDcfModal,
  onOpenAiAssistant,
}: Props) {
  const [headlines, setHeadlines] = useState<BriefHeadline[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadingNews(true);
    fetch('/api/global-news?tab=stocks')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!active || !data) return;
        const rawNews = Array.isArray(data)
          ? data
          : (Array.isArray(data.news) ? data.news : []);
        const mapped: BriefHeadline[] = rawNews.slice(0, 6).map((item: any) => ({
          title: item.titleBg || item.title || 'Financial News',
          url: (item.url && String(item.url).startsWith('http')) ? item.url : 'https://stockanalysis.com/news/',
          source: item.source || 'Market News',
          publishedAt: item.time || item.timeEn || '',
        }));
        setHeadlines(mapped);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingNews(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const topGainers = useMemo(() => {
    return [...stocks]
      .filter(s => typeof s.dailyChangePct === 'number' && Number.isFinite(s.dailyChangePct) && s.currentPrice > 0)
      .sort((a, b) => b.dailyChangePct - a.dailyChangePct)
      .slice(0, 6);
  }, [stocks]);

  const topLosers = useMemo(() => {
    return [...stocks]
      .filter(s => typeof s.dailyChangePct === 'number' && Number.isFinite(s.dailyChangePct) && s.currentPrice > 0)
      .sort((a, b) => a.dailyChangePct - b.dailyChangePct)
      .slice(0, 6);
  }, [stocks]);

  const topUndervalued = useMemo(() => {
    return [...stocks]
      .filter(s => s.fairPrice && s.fairPrice > 0 && s.currentPrice > 0)
      .map(s => ({
        stock: s,
        upsidePct: ((s.fairPrice! - s.currentPrice) / s.currentPrice) * 100,
      }))
      .filter(x => Number.isFinite(x.upsidePct) && x.upsidePct > 0 && x.upsidePct < 400)
      .sort((a, b) => b.upsidePct - a.upsidePct)
      .slice(0, 6);
  }, [stocks]);

  const handleOpenTicker = (ticker: string) => {
    const clean = ticker.toUpperCase();
    const found = stocks.find(s => s.ticker.toUpperCase() === clean);
    if (found) {
      onSelectStock(found);
      return;
    }
    onSelectStock({
      watch: '',
      ticker: clean,
      companyName: clean,
      date: '',
      priceOfCalc: null,
      dailyChangePct: 0,
      currentPrice: 0,
      fairPrice: null,
      difference: null,
      buySell: 'ДРУГИ',
      marketCap: 0,
      peRatio: null,
      eps: null,
      profileLink: '',
      dividend: '-',
      signal: 'Hold',
      low52: null,
      high52: null,
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. StockAnalysis.com-style Hero Search Section */}
      <section className="relative rounded-2xl border border-border bg-gradient-to-br from-card via-card to-indigo-950/15 p-4 sm:p-6 shadow-xs overflow-visible">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
            <BarChart2 className="w-3 h-3" />
            <span>Institutional Stock Research Terminal</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink leading-tight">
            Search for a stock to start your analysis
          </h1>
          <p className="text-xs text-ink-muted max-w-lg mx-auto leading-snug">
            Accurate financial data on {stocks.length}+ tracked companies and global tickers — 10-year statements, DCF fair value, analyst forecasts, and live market movers.
          </p>

          {/* Centered Search Combobox */}
          <div className="max-w-lg mx-auto text-left pt-0.5">
            <StockAnalysisSearchCombobox
              stocks={stocks}
              selectedStock={null}
              onSelectStock={onSelectStock}
              onAddStockToTable={onAddStockToTable}
            />
          </div>

          {/* Trending Tickers Strip */}
          <div className="flex items-center justify-center flex-wrap gap-1 pt-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ink-faint mr-1">
              <Flame className="w-3 h-3 text-amber-400" />
              Trending:
            </span>
            {TRENDING_TICKERS.map(sym => {
              const match = stocks.find(s => s.ticker.toUpperCase() === sym);
              const pct = match?.dailyChangePct;
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleOpenTicker(sym)}
                  className="px-2 py-0.5 rounded-md bg-card/80 hover:bg-card-hover border border-border/80 hover:border-indigo-500/40 text-[11px] font-bold text-ink transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                >
                  <span>{sym}</span>
                  {typeof pct === 'number' && Number.isFinite(pct) && pct !== 0 && (
                    <span className={`text-[10px] font-mono ${pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Major Market Indices Snapshot */}
      {indices.length > 0 && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {indices.slice(0, 4).map(idx => {
            const isPos = idx.changePct >= 0;
            const changeVal = idx.changeVal ?? (idx.value * (idx.changePct / 100));
            return (
              <div
                key={idx.ticker || idx.name}
                className="rounded-2xl border border-border bg-card/60 hover:bg-card p-4 transition-colors shadow-2xs flex flex-col justify-between gap-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-ink truncate">{idx.name}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                    isPos ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {isPos ? '+' : ''}{idx.changePct.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-lg font-black font-mono text-ink tabular-nums">
                    {idx.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`text-[11px] font-mono font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPos ? '+' : ''}{changeVal.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* 3. Market Movers & Fair Value Leaders (3-Column StockAnalysis Grid) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Gainers */}
        <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h2 className="text-sm font-black uppercase tracking-tight text-ink flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Top Gainers</span>
            </h2>
            <button
              type="button"
              onClick={() => onSwitchTab('table')}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>All Stocks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border/40 flex-1">
            {topGainers.map(s => (
              <button
                key={s.ticker}
                type="button"
                onClick={() => onSelectStock(s)}
                className="w-full py-2.5 px-1.5 flex items-center justify-between gap-2 hover:bg-card-hover/60 rounded-lg transition-colors text-left cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-black text-ink">{s.ticker}</div>
                  <div className="text-[11px] text-ink-muted truncate max-w-[140px]">{s.companyName}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-ink">${s.currentPrice.toFixed(2)}</div>
                  <div className="text-[11px] font-mono font-bold text-emerald-400">
                    +{s.dailyChangePct.toFixed(2)}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h2 className="text-sm font-black uppercase tracking-tight text-ink flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>Top Losers</span>
            </h2>
            <button
              type="button"
              onClick={() => onSwitchTab('table')}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>All Stocks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border/40 flex-1">
            {topLosers.map(s => (
              <button
                key={s.ticker}
                type="button"
                onClick={() => onSelectStock(s)}
                className="w-full py-2.5 px-1.5 flex items-center justify-between gap-2 hover:bg-card-hover/60 rounded-lg transition-colors text-left cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-black text-ink">{s.ticker}</div>
                  <div className="text-[11px] text-ink-muted truncate max-w-[140px]">{s.companyName}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-ink">${s.currentPrice.toFixed(2)}</div>
                  <div className="text-[11px] font-mono font-bold text-rose-400">
                    {s.dailyChangePct.toFixed(2)}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Undervalued / Fair Value Upside */}
        <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h2 className="text-sm font-black uppercase tracking-tight text-ink flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Fair Value Upside</span>
            </h2>
            <button
              type="button"
              onClick={() => onSwitchTab('table')}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Screener</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border/40 flex-1">
            {topUndervalued.map(({ stock: s, upsidePct }) => (
              <button
                key={s.ticker}
                type="button"
                onClick={() => onSelectStock(s)}
                className="w-full py-2.5 px-1.5 flex items-center justify-between gap-2 hover:bg-card-hover/60 rounded-lg transition-colors text-left cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-black text-ink">{s.ticker}</div>
                  <div className="text-[11px] text-ink-muted truncate max-w-[140px]">{s.companyName}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-ink">
                    Fair ${s.fairPrice?.toFixed(2)}
                  </div>
                  <div className="text-[11px] font-mono font-bold text-indigo-400">
                    +{upsidePct.toFixed(1)}% upside
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Latest Market News & Platform Quick Tools */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Latest News */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card/60 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h2 className="text-sm font-black uppercase tracking-tight text-ink flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-sky-400" />
              <span>Latest Market News</span>
            </h2>
            <button
              type="button"
              onClick={() => onSwitchTab('news')}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Morning Brief & News</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {loadingNews ? (
            <div className="py-8 text-center text-xs text-ink-muted">Зареждане на пазарни новини...</div>
          ) : headlines.length > 0 ? (
            <div className="divide-y divide-border/40 mt-1">
              {headlines.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 flex items-start justify-between gap-3 hover:bg-card-hover/50 px-2 rounded-lg transition-colors group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="text-xs font-bold text-ink group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {item.title}
                    </div>
                    <div className="text-[10px] font-semibold text-ink-faint uppercase">
                      {item.source}{item.publishedAt ? ` • ${item.publishedAt}` : ''}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-ink-faint group-hover:text-indigo-400 shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <p className="text-xs text-ink-muted">Отворете таб NEWS за пълния дневен обзор и корпоративни новини.</p>
              <button
                type="button"
                onClick={() => onSwitchTab('news')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Отвори News
              </button>
            </div>
          )}
        </div>

        {/* Platform Research Tools */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => onSwitchTab('table')}
            className="p-4 rounded-2xl border border-border bg-card/60 hover:bg-card hover:border-indigo-500/40 transition-all text-left cursor-pointer group flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 shrink-0">
                <Table className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black uppercase text-ink">Interactive Stock Screener</div>
                <div className="text-[11px] text-ink-muted truncate">Филтрирай {stocks.length}+ акции по P/E, Fair Value и сигнали</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-faint group-hover:text-indigo-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={onOpenDcfModal}
            className="p-4 rounded-2xl border border-border bg-card/60 hover:bg-card hover:border-blue-500/40 transition-all text-left cursor-pointer group flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black uppercase text-ink">DCF & Fair Value Calculators</div>
                <div className="text-[11px] text-ink-muted truncate">Изчисли вътрешна стойност, P/E оценка и чеклист</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-faint group-hover:text-blue-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => onSwitchTab('portfolio')}
            className="p-4 rounded-2xl border border-border bg-card/60 hover:bg-card hover:border-emerald-500/40 transition-all text-left cursor-pointer group flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black uppercase text-ink">Portfolio & Dividend Tracker</div>
                <div className="text-[11px] text-ink-muted truncate">Следи позиции, доходност и получени дивиденти</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-faint group-hover:text-emerald-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-indigo-950/50 via-card to-amber-950/30 hover:border-amber-400/60 transition-all text-left cursor-pointer group flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black uppercase text-amber-300">AI Финансов Терминал</div>
                <div className="text-[11px] text-ink-muted truncate">Анализ на активи, сравнения, отчети и макро данни</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400/70 group-hover:text-amber-300 shrink-0" />
          </button>
        </div>
      </section>
    </div>
  );
}
