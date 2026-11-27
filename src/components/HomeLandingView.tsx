import React, { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart2,
  Scale,
  Briefcase,
  Newspaper,
  Table,
  Target,
  ExternalLink,
  Flame
} from 'lucide-react';
import { Stock, MarketIndex } from '../types';
import StockAnalysisSearchCombobox from './StockAnalysisSearchCombobox';
import EtfProfileView, { SelectedEtfInput } from './EtfProfileView';

interface Props {
  stocks: Stock[];
  indices: MarketIndex[];
  onSelectStock: (stock: Stock) => void;
  onAddStockToTable?: (stock: Stock) => void;
  onSwitchTab: (tab: 'home' | 'table' | 'stocks' | 'etf' | 'alerts' | 'portfolio' | 'news' | 'other') => void;
  onOpenDcfModal: () => void;
}

interface BriefHeadline {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
}

interface Sp500Mover {
  ticker: string;
  companyName: string;
  price: number;
  changePct: number;
}

const KNOWN_ETF_ALIASES: Record<string, { ticker: string; isin?: string; currency: string; category: string }> = {
  SXR8: { ticker: 'SXR8.DE', isin: 'IE00B5BMR087', currency: 'EUR', category: 'Europe UCITS' },
  'SXR8.DE': { ticker: 'SXR8.DE', isin: 'IE00B5BMR087', currency: 'EUR', category: 'Europe UCITS' },
  CSPX: { ticker: 'CSPX.L', isin: 'IE00B5BMR087', currency: 'USD', category: 'Europe UCITS' },
  'CSPX.L': { ticker: 'CSPX.L', isin: 'IE00B5BMR087', currency: 'USD', category: 'Europe UCITS' },
  'CSP1.L': { ticker: 'CSP1.L', isin: 'IE00B5BMR087', currency: 'GBP', category: 'Europe UCITS' },
  'CSSPX.MI': { ticker: 'CSSPX.MI', isin: 'IE00B5BMR087', currency: 'EUR', category: 'Europe UCITS' },
  'CSSPX.SW': { ticker: 'CSSPX.SW', isin: 'IE00B5BMR087', currency: 'USD', category: 'Europe UCITS' },
  VUAA: { ticker: 'VUAA.DE', isin: 'IE00BFMXXD54', currency: 'EUR', category: 'Europe UCITS' },
  'VUAA.DE': { ticker: 'VUAA.DE', isin: 'IE00BFMXXD54', currency: 'EUR', category: 'Europe UCITS' },
  'VUAA.L': { ticker: 'VUAA.L', isin: 'IE00BFMXXD54', currency: 'USD', category: 'Europe UCITS' },
  VWCE: { ticker: 'VWCE.DE', isin: 'IE00BK5BQT80', currency: 'EUR', category: 'Europe UCITS' },
  'VWCE.DE': { ticker: 'VWCE.DE', isin: 'IE00BK5BQT80', currency: 'EUR', category: 'Europe UCITS' },
  VWRA: { ticker: 'VWRA.L', isin: 'IE00BK5BQT80', currency: 'USD', category: 'Europe UCITS' },
  'VWRA.L': { ticker: 'VWRA.L', isin: 'IE00BK5BQT80', currency: 'USD', category: 'Europe UCITS' },
  EUNL: { ticker: 'EUNL.DE', isin: 'IE00B4L5Y983', currency: 'EUR', category: 'Europe UCITS' },
  'EUNL.DE': { ticker: 'EUNL.DE', isin: 'IE00B4L5Y983', currency: 'EUR', category: 'Europe UCITS' },
  IWDA: { ticker: 'IWDA.AS', isin: 'IE00B4L5Y983', currency: 'EUR', category: 'Europe UCITS' },
  'IWDA.AS': { ticker: 'IWDA.AS', isin: 'IE00B4L5Y983', currency: 'EUR', category: 'Europe UCITS' },
  'SWDA.L': { ticker: 'SWDA.L', isin: 'IE00B4L5Y983', currency: 'GBP', category: 'Europe UCITS' },
  EQQQ: { ticker: 'EQQQ.DE', isin: 'IE0032077012', currency: 'EUR', category: 'Europe UCITS' },
  'EQQQ.DE': { ticker: 'EQQQ.DE', isin: 'IE0032077012', currency: 'EUR', category: 'Europe UCITS' },
  SXRV: { ticker: 'SXRV.DE', isin: 'IE00B53SZB19', currency: 'EUR', category: 'Europe UCITS' },
  'SXRV.DE': { ticker: 'SXRV.DE', isin: 'IE00B53SZB19', currency: 'EUR', category: 'Europe UCITS' },
  CNDX: { ticker: 'CNDX.L', isin: 'IE00B53SZB19', currency: 'USD', category: 'Europe UCITS' },
  'CNDX.L': { ticker: 'CNDX.L', isin: 'IE00B53SZB19', currency: 'USD', category: 'Europe UCITS' },
  EMIM: { ticker: 'EMIM.DE', isin: 'IE00BKM4GZ66', currency: 'EUR', category: 'Europe UCITS' },
  'EMIM.DE': { ticker: 'EMIM.DE', isin: 'IE00BKM4GZ66', currency: 'EUR', category: 'Europe UCITS' },
  EIMI: { ticker: 'EIMI.L', isin: 'IE00BKM4GZ66', currency: 'USD', category: 'Europe UCITS' },
  'EIMI.L': { ticker: 'EIMI.L', isin: 'IE00BKM4GZ66', currency: 'USD', category: 'Europe UCITS' },
  ZPRV: { ticker: 'ZPRV.DE', isin: 'IE00BSPLC413', currency: 'EUR', category: 'Europe UCITS' },
  'ZPRV.DE': { ticker: 'ZPRV.DE', isin: 'IE00BSPLC413', currency: 'EUR', category: 'Europe UCITS' },
  AGGH: { ticker: 'AGGH.DE', isin: 'IE00BDBRDM35', currency: 'EUR', category: 'Europe UCITS' },
  'AGGH.DE': { ticker: 'AGGH.DE', isin: 'IE00BDBRDM35', currency: 'EUR', category: 'Europe UCITS' },
  MEUD: { ticker: 'MEUD.PA', isin: 'LU0908500753', currency: 'EUR', category: 'Europe UCITS' },
  'MEUD.PA': { ticker: 'MEUD.PA', isin: 'LU0908500753', currency: 'EUR', category: 'Europe UCITS' },
  SPY: { ticker: 'SPY', currency: 'USD', category: 'US Index' },
  VOO: { ticker: 'VOO', currency: 'USD', category: 'US Index' },
  IVV: { ticker: 'IVV', currency: 'USD', category: 'US Index' },
  QQQ: { ticker: 'QQQ', currency: 'USD', category: 'Tech & Growth' },
  VTI: { ticker: 'VTI', currency: 'USD', category: 'US Index' },
  IWM: { ticker: 'IWM', currency: 'USD', category: 'US Index' },
  DIA: { ticker: 'DIA', currency: 'USD', category: 'US Index' },
  SMH: { ticker: 'SMH', currency: 'USD', category: 'Tech & Growth' },
  SOXX: { ticker: 'SOXX', currency: 'USD', category: 'Tech & Growth' },
  XLK: { ticker: 'XLK', currency: 'USD', category: 'Tech & Growth' },
  VGT: { ticker: 'VGT', currency: 'USD', category: 'Tech & Growth' },
  SCHD: { ticker: 'SCHD', currency: 'USD', category: 'Dividend' },
  JEPI: { ticker: 'JEPI', currency: 'USD', category: 'Dividend' },
  VYM: { ticker: 'VYM', currency: 'USD', category: 'Dividend' },
  GLD: { ticker: 'GLD', currency: 'USD', category: 'Commodities & Bonds' },
  SLV: { ticker: 'SLV', currency: 'USD', category: 'Commodities & Bonds' },
  TLT: { ticker: 'TLT', currency: 'USD', category: 'Commodities & Bonds' },
  SGOV: { ticker: 'SGOV', currency: 'USD', category: 'Commodities & Bonds' },
  VUSA: { ticker: 'VUSA.DE', currency: 'EUR', category: 'Europe UCITS' },
  'VUSA.DE': { ticker: 'VUSA.DE', currency: 'EUR', category: 'Europe UCITS' },
  'VUSA.L': { ticker: 'VUSA.L', currency: 'GBP', category: 'Europe UCITS' },
  'VUSA.AS': { ticker: 'VUSA.AS', currency: 'EUR', category: 'Europe UCITS' },
};

export default function HomeLandingView({
  stocks,
  indices,
  onSelectStock,
  onAddStockToTable,
  onSwitchTab,
  onOpenDcfModal,
}: Props) {
  const [headlines, setHeadlines] = useState<BriefHeadline[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [fairValueMode, setFairValueMode] = useState<'undervalued' | 'overvalued'>('undervalued');
  const [sp500Gainers, setSp500Gainers] = useState<Sp500Mover[]>([]);
  const [sp500Losers, setSp500Losers] = useState<Sp500Mover[]>([]);
  const [loadingSp500, setLoadingSp500] = useState(false);
  const [selectedHomeEtf, setSelectedHomeEtf] = useState<SelectedEtfInput | null>(null);

  useEffect(() => {
    let active = true;
    setLoadingSp500(true);
    fetch('/api/sp500-movers')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!active || !data) return;
        if (Array.isArray(data.gainers)) setSp500Gainers(data.gainers);
        if (Array.isArray(data.losers)) setSp500Losers(data.losers);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingSp500(false);
      });
    return () => {
      active = false;
    };
  }, []);

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

  const topGainers = useMemo<Sp500Mover[]>(() => {
    if (sp500Gainers.length > 0) return sp500Gainers;
    return [...stocks]
      .filter(s => typeof s.dailyChangePct === 'number' && Number.isFinite(s.dailyChangePct) && s.currentPrice > 0 && s.dailyChangePct >= 0)
      .sort((a, b) => b.dailyChangePct - a.dailyChangePct)
      .map(s => ({ ticker: s.ticker, companyName: s.companyName, price: s.currentPrice, changePct: s.dailyChangePct }));
  }, [sp500Gainers, stocks]);

  const topLosers = useMemo<Sp500Mover[]>(() => {
    if (sp500Losers.length > 0) return sp500Losers;
    return [...stocks]
      .filter(s => typeof s.dailyChangePct === 'number' && Number.isFinite(s.dailyChangePct) && s.currentPrice > 0 && s.dailyChangePct < 0)
      .sort((a, b) => a.dailyChangePct - b.dailyChangePct)
      .map(s => ({ ticker: s.ticker, companyName: s.companyName, price: s.currentPrice, changePct: s.dailyChangePct }));
  }, [sp500Losers, stocks]);

  const topUndervalued = useMemo(() => {
    return [...stocks]
      .filter(s => s.fairPrice && s.fairPrice > 0 && s.currentPrice > 0)
      .map(s => ({
        stock: s,
        upsidePct: ((s.fairPrice! - s.currentPrice) / s.currentPrice) * 100,
      }))
      .filter(x => Number.isFinite(x.upsidePct) && x.upsidePct > 0 && x.upsidePct < 400)
      .sort((a, b) => b.upsidePct - a.upsidePct);
  }, [stocks]);

  const topOvervalued = useMemo(() => {
    return [...stocks]
      .filter(s => s.fairPrice && s.fairPrice > 0 && s.currentPrice > 0)
      .map(s => ({
        stock: s,
        upsidePct: ((s.fairPrice! - s.currentPrice) / s.currentPrice) * 100,
      }))
      .filter(x => Number.isFinite(x.upsidePct) && x.upsidePct < 0 && x.upsidePct > -95)
      .sort((a, b) => a.upsidePct - b.upsidePct);
  }, [stocks]);

  const displayedFairValue = fairValueMode === 'undervalued' ? topUndervalued : topOvervalued;

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

  const handleHomeSelectStock = (st: Stock) => {
    const upper = st.ticker.toUpperCase().trim();
    const known = KNOWN_ETF_ALIASES[upper];
    const isEtf =
      Boolean(known) ||
      Boolean(st.sector && st.sector.toUpperCase().includes('ETF')) ||
      /\b(ETF|UCITS)\b/i.test(st.companyName || '');

    if (isEtf) {
      const resolvedTicker = known?.ticker || upper;
      const guessCurrency =
        known?.currency ||
        (resolvedTicker.endsWith('.DE') || resolvedTicker.endsWith('.PA') || resolvedTicker.endsWith('.MI') || resolvedTicker.endsWith('.AS')
          ? 'EUR'
          : resolvedTicker.endsWith('.L')
            ? 'GBP'
            : 'USD');
      setSelectedHomeEtf({
        ticker: resolvedTicker,
        name: st.companyName && st.companyName !== upper ? st.companyName : resolvedTicker,
        category: known?.category || st.sector || 'ETF',
        expenseRatio: '—',
        isin: known?.isin,
        price: st.currentPrice > 0 ? st.currentPrice : null,
        changePct: Number.isFinite(st.dailyChangePct) && st.dailyChangePct !== 0 ? st.dailyChangePct : null,
        currency: guessCurrency,
        low52: st.low52 ?? null,
        high52: st.high52 ?? null,
        divYield: st.dividendYield ?? null,
      });
      return;
    }

    onSelectStock(st);
  };

  if (selectedHomeEtf) {
    return (
      <EtfProfileView
        etf={selectedHomeEtf}
        onBack={() => setSelectedHomeEtf(null)}
      />
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. StockAnalysis.com-style Hero Search Section */}
      <section className="relative rounded-2xl border border-border bg-gradient-to-br from-card via-card to-indigo-950/15 px-4 py-2.5 sm:px-5 sm:py-3 min-h-[112px] flex flex-col justify-center shadow-xs overflow-visible">
        <div className="max-w-5xl mx-auto w-full text-center space-y-2">
          <h1 className="text-base sm:text-lg font-black tracking-tight text-ink leading-tight">
            Search for a stock to start your analysis
          </h1>

          {/* Centered Search Combobox */}
          <div className="w-full max-w-2xl mx-auto text-left">
            <StockAnalysisSearchCombobox
              stocks={stocks}
              selectedStock={null}
              onSelectStock={handleHomeSelectStock}
              onAddStockToTable={onAddStockToTable}
              size="hero"
            />
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
        {/* Top Gainers (All S&P 500) */}
        <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h2 className="text-sm font-black uppercase tracking-tight text-ink flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Top Gainers ({topGainers.length})</span>
            </h2>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
              S&amp;P 500
            </span>
          </div>
          <div className="divide-y divide-border/40 flex-1 max-h-[340px] overflow-y-auto pr-1">
            {loadingSp500 && topGainers.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink-muted">Зареждане на S&amp;P 500...</div>
            ) : (
              topGainers.map(m => (
                <button
                  key={m.ticker}
                  type="button"
                  onClick={() => handleOpenTicker(m.ticker)}
                  className="w-full py-2.5 px-1.5 flex items-center justify-between gap-2 hover:bg-card-hover/60 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-black text-ink">{m.ticker}</div>
                    <div className="text-[11px] text-ink-muted truncate max-w-[140px]">{m.companyName}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-ink">${m.price.toFixed(2)}</div>
                    <div className="text-[11px] font-mono font-bold text-emerald-400">
                      +{m.changePct.toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Top Losers (All S&P 500) */}
        <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h2 className="text-sm font-black uppercase tracking-tight text-ink flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>Top Losers ({topLosers.length})</span>
            </h2>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400">
              S&amp;P 500
            </span>
          </div>
          <div className="divide-y divide-border/40 flex-1 max-h-[340px] overflow-y-auto pr-1">
            {loadingSp500 && topLosers.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink-muted">Зареждане на S&amp;P 500...</div>
            ) : (
              topLosers.map(m => (
                <button
                  key={m.ticker}
                  type="button"
                  onClick={() => handleOpenTicker(m.ticker)}
                  className="w-full py-2.5 px-1.5 flex items-center justify-between gap-2 hover:bg-card-hover/60 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-black text-ink">{m.ticker}</div>
                    <div className="text-[11px] text-ink-muted truncate max-w-[140px]">{m.companyName}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-ink">${m.price.toFixed(2)}</div>
                    <div className="text-[11px] font-mono font-bold text-rose-400">
                      {m.changePct.toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Undervalued / Overvalued Fair Value Movers */}
        <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/60">
            <h2 className="text-sm font-black uppercase tracking-tight text-ink flex items-center gap-2 shrink-0">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Fair Value</span>
            </h2>
            <div className="flex items-center gap-1 bg-bg/70 border border-border/70 rounded-lg p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setFairValueMode('undervalued')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  fairValueMode === 'undervalued'
                    ? 'bg-emerald-500/20 text-emerald-400 font-black'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Подценени ({topUndervalued.length})
              </button>
              <button
                type="button"
                onClick={() => setFairValueMode('overvalued')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  fairValueMode === 'overvalued'
                    ? 'bg-rose-500/20 text-rose-400 font-black'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Надценени ({topOvervalued.length})
              </button>
            </div>
          </div>
          <div className="divide-y divide-border/40 flex-1 max-h-[340px] overflow-y-auto pr-1">
            {displayedFairValue.map(({ stock: s, upsidePct }) => {
              const isUnder = upsidePct >= 0;
              const dayPos = s.dailyChangePct >= 0;
              return (
                <button
                  key={s.ticker}
                  type="button"
                  onClick={() => onSelectStock(s)}
                  className="w-full py-2.5 px-1.5 flex items-center justify-between gap-2 hover:bg-card-hover/60 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-ink">{s.ticker}</span>
                      <span className={`text-[10px] font-mono font-semibold ${dayPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {dayPos ? '+' : ''}{s.dailyChangePct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-[11px] text-ink-muted truncate max-w-[140px]">{s.companyName}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-ink">
                      ${s.currentPrice.toFixed(2)} <span className="text-[10px] text-ink-faint font-normal">→ ${s.fairPrice?.toFixed(2)}</span>
                    </div>
                    <div className={`text-[11px] font-mono font-bold ${isUnder ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUnder ? '+' : ''}{upsidePct.toFixed(1)}% {isUnder ? 'подценена' : 'надценена'}
                    </div>
                  </div>
                </button>
              );
            })}
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
        </div>
      </section>
    </div>
  );
}
