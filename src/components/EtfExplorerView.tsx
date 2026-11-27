import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown, RefreshCw, Layers } from 'lucide-react';
import { Stock } from '../types';
import StockAnalysisSearchCombobox from './StockAnalysisSearchCombobox';
import EtfProfileView, { EtfListing } from './EtfProfileView';

interface EtfItem {
  ticker: string;
  name: string;
  category: string;
  expenseRatio: string;
  isin?: string;
  price: number | null;
  changePct: number | null;
  currency: string;
  low52: number | null;
  high52: number | null;
  divYield: number | null;
  fundSize?: string | null;
  distributionPolicy?: string | null;
  replication?: string | null;
  domicile?: string | null;
  justEtfUrl?: string | null;
  listings?: EtfListing[];
}

interface RemoteEtfHit {
  ticker: string;
  name: string;
  exchange: string;
  isin?: string;
}

interface Props {
  onSelectEtf: (stock: Stock) => void;
}

const CATEGORIES = ['Всички', 'US Index', 'Tech & Growth', 'Dividend', 'Europe UCITS', 'Commodities & Bonds'];

export default function EtfExplorerView({ onSelectEtf: _onSelectEtf }: Props) {
  const [etfs, setEtfs] = useState<EtfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Всички');
  const [activeEtf, setActiveEtf] = useState<EtfItem | null>(null);
  const [remoteHits, setRemoteHits] = useState<RemoteEtfHit[]>([]);

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

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setRemoteHits([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      fetch(`/api/etf-search?q=${encodeURIComponent(q)}`)
        .then(r => (r.ok ? r.json() : null))
        .then(json => {
          if (!cancelled && Array.isArray(json?.results)) {
            setRemoteHits(json.results);
          }
        })
        .catch(() => {});
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return etfs.filter(item => {
      const catOk = selectedCategory === 'Всички' || item.category === selectedCategory;
      const queryOk =
        !q ||
        item.ticker.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.isin && item.isin.toLowerCase().includes(q)) ||
        (item.listings && item.listings.some(l => l.ticker.toLowerCase().includes(q)));
      return catOk && queryOk;
    });
  }, [etfs, query, selectedCategory]);

  const etfAsStocks = useMemo<Stock[]>(() => {
    const list: Stock[] = [];
    const seen = new Set<string>();
    const pushStock = (ticker: string, companyName: string, item?: EtfItem) => {
      const upper = ticker.toUpperCase();
      if (seen.has(upper)) return;
      seen.add(upper);
      list.push({
        watch: '',
        ticker: upper,
        companyName,
        date: '',
        priceOfCalc: null,
        dailyChangePct: item?.changePct ?? 0,
        currentPrice: item?.price ?? 0,
        fairPrice: null,
        difference: null,
        buySell: 'ДРУГИ',
        marketCap: 0,
        peRatio: null,
        eps: null,
        profileLink: '',
        dividend: item?.divYield != null ? `${item.divYield}%` : '-',
        signal: 'Hold',
        low52: item?.low52 ?? null,
        high52: item?.high52 ?? null,
        sector: 'ETF',
        industry: item?.category || 'ETF',
        dividendYield: item?.divYield ?? undefined,
      });
    };

    for (const item of etfs) {
      pushStock(item.ticker, item.name, item);
      if (item.listings) {
        for (const l of item.listings) {
          pushStock(l.ticker, `${item.name} (${l.exchange} · ${l.currency})`, item);
        }
      }
    }
    for (const hit of remoteHits) {
      pushStock(hit.ticker, `${hit.name}${hit.exchange ? ` (${hit.exchange})` : ''}`);
    }
    return list;
  }, [etfs, remoteHits]);

  const handleOpenEtf = (item: EtfItem) => {
    setActiveEtf(item);
  };

  const handleSearchSelect = (stock: Stock) => {
    const upper = stock.ticker.toUpperCase();
    const found = etfs.find(
      e =>
        e.ticker.toUpperCase() === upper ||
        (e.listings && e.listings.some(l => l.ticker.toUpperCase() === upper))
    );
    if (found) {
      const matchedListing = found.listings?.find(l => l.ticker.toUpperCase() === upper);
      setActiveEtf({
        ...found,
        ticker: upper,
        currency: matchedListing?.currency || found.currency,
      });
      return;
    }
    const remote = remoteHits.find(h => h.ticker.toUpperCase() === upper);
    setActiveEtf({
      ticker: upper,
      name: remote?.name || stock.companyName || upper,
      category: remote?.exchange || stock.industry || 'ETF',
      expenseRatio: '—',
      isin: remote?.isin,
      price: stock.currentPrice || null,
      changePct: stock.dailyChangePct ?? null,
      currency: upper.endsWith('.DE') || upper.endsWith('.PA') || upper.endsWith('.MI') || upper.endsWith('.AS') ? 'EUR' : upper.endsWith('.L') ? 'GBP' : 'USD',
      low52: stock.low52 ?? null,
      high52: stock.high52 ?? null,
      divYield: stock.dividendYield ?? null,
    });
  };

  if (activeEtf) {
    return (
      <EtfProfileView
        etf={activeEtf}
        onBack={() => setActiveEtf(null)}
      />
    );
  }

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
                onSelectStock={handleSearchSelect}
                onQueryChange={setQuery}
                size="hero"
                hideGlobalStocks
                placeholder="Търсене на ETF по тикер, борса или ISIN (напр. SXR8.DE, CSPX.L, VWRA.L, IE00B5BMR087)..."
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
                <th className="py-3 px-4">Ticker / ISIN</th>
                <th className="py-3 px-4">Име на фонда</th>
                <th className="py-3 px-4">Категория / Детайли</th>
                <th className="py-3 px-4 text-right">Размер (AUM)</th>
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
                  <td colSpan={10} className="py-10 text-center text-ink-muted">
                    Зареждане на ETF данни от Yahoo Finance и justETF...
                  </td>
                </tr>
              ) : filtered.length === 0 && remoteHits.length > 0 ? (
                remoteHits.map(hit => {
                  const guessCcy =
                    hit.ticker.endsWith('.DE') || hit.ticker.endsWith('.PA') || hit.ticker.endsWith('.MI') || hit.ticker.endsWith('.AS')
                      ? 'EUR'
                      : hit.ticker.endsWith('.L')
                        ? 'GBP'
                        : 'USD';
                  return (
                    <tr
                      key={hit.ticker}
                      onClick={() =>
                        handleOpenEtf({
                          ticker: hit.ticker,
                          name: hit.name,
                          category: hit.exchange || 'ETF',
                          expenseRatio: '—',
                          isin: hit.isin,
                          price: null,
                          changePct: null,
                          currency: guessCcy,
                          low52: null,
                          high52: null,
                          divYield: null,
                        })
                      }
                      className="hover:bg-indigo-500/10 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-black text-indigo-400 font-mono">{hit.ticker}</div>
                        {hit.isin && <div className="text-[10px] font-mono text-ink-faint">{hit.isin}</div>}
                      </td>
                      <td className="py-3 px-4 font-bold text-ink max-w-[260px] truncate" title={hit.name}>
                        {hit.name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-bold text-indigo-300">
                          {hit.exchange || 'Yahoo Finance'}
                        </span>
                      </td>
                      <td colSpan={6} className="py-3 px-4 text-right text-[11px] text-ink-muted">
                        Кликни за пълен преглед и графика →
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <ArrowUpRight className="w-4 h-4 text-ink-faint group-hover:text-indigo-400 inline-block transition-colors" />
                      </td>
                    </tr>
                  );
                })
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-ink-muted">
                    Няма намерени ETF фондове по зададените критерии.
                  </td>
                </tr>
              ) : (
                filtered.map(item => {
                  const sym = item.currency === 'EUR' ? '€' : item.currency === 'GBP' ? '£' : '$';
                  const isPos = (item.changePct ?? 0) >= 0;
                  const distShort = item.distributionPolicy
                    ? item.distributionPolicy.startsWith('Acc')
                      ? 'Acc'
                      : item.distributionPolicy.startsWith('Dist')
                        ? 'Dist'
                        : item.distributionPolicy
                    : null;
                  const extraListings = (item.listings || []).filter(
                    l => l.ticker.toUpperCase() !== item.ticker.toUpperCase()
                  );
                  return (
                    <tr
                      key={item.ticker}
                      onClick={() => handleOpenEtf(item)}
                      className="hover:bg-indigo-500/10 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-black text-indigo-400 font-mono">{item.ticker}</div>
                        {item.isin && (
                          <div className="text-[10px] font-mono text-ink-faint">{item.isin}</div>
                        )}
                        {extraListings.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {extraListings.map(l => (
                              <button
                                key={l.ticker}
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleOpenEtf({
                                    ...item,
                                    ticker: l.ticker,
                                    currency: l.currency,
                                  });
                                }}
                                className="px-1.5 py-0.5 rounded bg-bg/80 hover:bg-indigo-500/20 border border-border/70 hover:border-indigo-500/40 text-[9px] font-mono font-bold text-ink-muted hover:text-indigo-300 cursor-pointer transition-colors"
                                title={`Отвори на борса ${l.exchange} (${l.currency})`}
                              >
                                {l.exchange}:{l.ticker}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-ink max-w-[260px] truncate" title={item.name}>
                        {item.name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-muted/50 border border-border/60 text-[10px] font-bold text-ink-muted">
                            {item.category}
                          </span>
                          {distShort && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-400">
                              {distShort}
                            </span>
                          )}
                          {item.replication && (
                            <span className="px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/25 text-[10px] font-bold text-sky-400">
                              {item.replication}
                            </span>
                          )}
                          {item.domicile && (
                            <span className="px-1.5 py-0.5 rounded bg-bg border border-border text-[10px] font-bold text-ink-faint">
                              {item.domicile}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-ink-muted whitespace-nowrap">
                        {item.fundSize || '—'}
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
                        {item.isin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 group-hover:bg-indigo-500/25">
                            <Layers className="w-3 h-3" />
                            justETF
                          </span>
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-ink-faint group-hover:text-indigo-400 inline-block transition-colors" />
                        )}
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
