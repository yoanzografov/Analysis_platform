import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Layers,
  Globe,
  PieChart,
  BarChart3,
  Coins,
  Loader2,
} from 'lucide-react';
import GoogleFinanceChart from './GoogleFinanceChart';

export interface EtfListing {
  ticker: string;
  exchange: string;
  currency: string;
}

export interface SelectedEtfInput {
  ticker: string;
  name: string;
  category: string;
  expenseRatio: string;
  isin?: string;
  price: number | null;
  changePct: number | null;
  currency: string;
  low52?: number | null;
  high52?: number | null;
  divYield?: number | null;
  fundSize?: string | null;
  distributionPolicy?: string | null;
  replication?: string | null;
  domicile?: string | null;
  justEtfUrl?: string | null;
  listings?: EtfListing[];
}

interface EtfProfileData {
  ticker: string;
  isin: string | null;
  name: string;
  exchange: string;
  currency: string;
  price: number | null;
  prevClose: number | null;
  changeAmt: number | null;
  changePct: number | null;
  open: number | null;
  dayLow: number | null;
  dayHigh: number | null;
  low52: number | null;
  high52: number | null;
  volume: number | null;
  avgVolume: number | null;
  divYield: number | null;
  divRate: number | null;
  ter: string;
  fundSize: string;
  distributionPolicy: string;
  replication: string;
  domicile: string;
  fundCurrency: string;
  inceptionDate: string;
  holdingsCount: string;
  indexName: string;
  fundProvider: string;
  top10Weight: string;
  topHoldings: Array<{ symbol?: string; name: string; weight: string }>;
  countries: Array<{ name: string; weight: string }>;
  sectors: Array<{ name: string; weight: string }>;
  justEtfUrl: string | null;
  totalPerformancePct: number | null;
  totalReturnSeries: Array<{ date: string; value: number }>;
  listings?: EtfListing[];
  justEtfAvailable?: boolean;
}

type ProfileTab = 'overview' | 'holdings' | 'performance' | 'dividends';

interface Props {
  etf: SelectedEtfInput;
  onBack: () => void;
}

function WeightList({
  title,
  icon,
  items,
  subtitle,
  barColor,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<{ symbol?: string; name: string; weight: string }>;
  subtitle?: string;
  barColor: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-ink">
          {icon}
          <span>{title}</span>
        </div>
        {subtitle && (
          <span className="text-[11px] font-mono font-bold text-indigo-400">{subtitle}</span>
        )}
      </div>
      {items.length === 0 ? (
        <div className="py-6 text-center text-xs text-ink-muted">Няма налични данни</div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const pct = parseFloat(item.weight.replace(/[^0-9.]/g, '')) || 0;
            const widthPct = Math.min(100, Math.max(2, pct));
            return (
              <div key={`${item.name}-${idx}`} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.symbol && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-mono text-[10px] font-black shrink-0">
                        {item.symbol}
                      </span>
                    )}
                    <span className="text-ink font-medium truncate" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-ink-muted shrink-0">{item.weight}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${widthPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function EtfProfileView({ etf, onBack }: Props) {
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [selectedTicker, setSelectedTicker] = useState(etf.ticker);
  const [profile, setProfile] = useState<EtfProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    setSelectedTicker(etf.ticker);
    setTab('overview');
  }, [etf.ticker, etf.isin]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const qs = new URLSearchParams({ ticker: selectedTicker });
    if (etf.isin) qs.set('isin', etf.isin);
    fetch(`/api/etf-profile?${qs.toString()}`)
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        if (active && json && !json.error) setProfile(json);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedTicker, etf.isin]);

  const activeListings = (profile?.listings && profile.listings.length > 0)
    ? profile.listings
    : (etf.listings || []);

  const currency = profile?.currency || etf.currency || 'USD';
  const sym = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  const price = profile?.price ?? etf.price;
  const changePct = profile?.changePct ?? etf.changePct;
  const changeAmt = profile?.changeAmt ?? null;
  const isPos = (changePct ?? 0) >= 0;
  const displayName = profile?.name || etf.name;
  const low52 = profile?.low52 ?? etf.low52 ?? null;
  const high52 = profile?.high52 ?? etf.high52 ?? null;
  const ter = profile?.ter || etf.expenseRatio || '—';
  const fundSize = profile?.fundSize || etf.fundSize || '—';
  const divYield = profile?.divYield ?? etf.divYield ?? null;
  const distPolicy = profile?.distributionPolicy || etf.distributionPolicy || '—';
  const replication = profile?.replication || etf.replication || '—';
  const domicile = profile?.domicile || etf.domicile || '—';
  const justEtfUrl = profile?.justEtfUrl || etf.justEtfUrl || null;

  const totalReturnChart = useMemo(() => {
    const pts = profile?.totalReturnSeries || [];
    if (pts.length < 2) return null;
    const width = 760;
    const height = 220;
    const padX = 12;
    const padY = 14;
    const vals = pts.map(p => p.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
    const coords = pts.map((p, i) => {
      const x = padX + (i / (pts.length - 1)) * (width - padX * 2);
      const y = padY + (1 - (p.value - min) / span) * (height - padY * 2);
      return { x, y, ...p };
    });
    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${height - padY} L ${coords[0].x.toFixed(1)} ${height - padY} Z`;
    return { width, height, min, max, coords, linePath, areaPath };
  }, [profile?.totalReturnSeries]);

  const activeReturnPt =
    totalReturnChart && hoverIdx != null && totalReturnChart.coords[hoverIdx]
      ? totalReturnChart.coords[hoverIdx]
      : totalReturnChart?.coords[totalReturnChart.coords.length - 1] || null;

  const rangePct =
    price != null && low52 != null && high52 != null && high52 > low52
      ? Math.max(0, Math.min(100, ((price - low52) / (high52 - low52)) * 100))
      : null;

  const keyInfoRows: Array<{ label: string; value: string }> = [
    { label: 'Активи (AUM)', value: fundSize },
    { label: 'Такса (TER / Expense)', value: ter },
    { label: 'Дивидентна доходност', value: divYield != null ? `${divYield.toFixed(2)}%` : '—' },
    { label: 'Политика на дивидент', value: distPolicy },
    { label: 'Репликация', value: replication },
    { label: 'Домицил', value: domicile },
    { label: 'Валута на фонда', value: profile?.fundCurrency || currency },
    { label: 'Дата на създаване', value: profile?.inceptionDate || '—' },
    { label: 'Брой позиции', value: profile?.holdingsCount || '—' },
    { label: 'Провайдър', value: profile?.fundProvider || '—' },
    { label: 'Индекс / Категория', value: profile?.indexName || etf.category },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Back + Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-card-hover text-xs font-bold text-ink cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Обратно към ETF Screener</span>
        </button>

        {justEtfUrl && (
          <a
            href={justEtfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-400 transition-colors"
          >
            <span>justETF Профил</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* StockAnalysis-style ETF Header Card */}
      <div className="rounded-2xl border border-border bg-card/80 p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-black font-mono">
                {selectedTicker}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border text-ink-muted text-[11px] font-bold">
                {profile?.exchange || etf.category}
              </span>
              {(profile?.isin || etf.isin) && (
                <span className="px-2 py-0.5 rounded-md bg-muted/40 border border-border text-ink-faint text-[11px] font-mono font-bold">
                  ISIN: {profile?.isin || etf.isin}
                </span>
              )}
              {loading && (
                <span className="inline-flex items-center gap-1 text-[11px] text-indigo-400 font-bold">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Зареждане...
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-ink leading-snug">
              {displayName}
            </h2>
            {activeListings.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint mr-1">
                  Борса / Тикер:
                </span>
                {activeListings.map(l => {
                  const isActive = l.ticker.toUpperCase() === selectedTicker.toUpperCase();
                  return (
                    <button
                      key={l.ticker}
                      type="button"
                      onClick={() => setSelectedTicker(l.ticker)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold cursor-pointer transition-colors border ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-bg/70 text-ink-muted hover:text-ink border-border/70 hover:bg-card-hover'
                      }`}
                    >
                      {l.exchange}: {l.ticker} ({l.currency})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col md:items-end shrink-0">
            <div className="text-2xl sm:text-3xl font-black font-mono text-ink">
              {price != null ? `${sym}${price.toFixed(2)}` : '—'}
            </div>
            {changePct != null && (
              <div
                className={`inline-flex items-center gap-1 text-xs sm:text-sm font-mono font-black ${
                  isPos ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {changeAmt != null ? `${changeAmt >= 0 ? '+' : ''}${changeAmt.toFixed(2)} ` : ''}
                  ({isPos ? '+' : ''}
                  {changePct.toFixed(2)}%)
                </span>
              </div>
            )}
            <div className="text-[11px] text-ink-faint mt-0.5">Валута: {currency}</div>
          </div>
        </div>

      {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-t border-border/60 pt-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview' as const, label: 'Overview (Преглед)' },
            { id: 'holdings' as const, label: `Holdings (${profile?.topHoldings?.length || 0})` },
            { id: 'performance' as const, label: 'Performance (Доходност)' },
            { id: 'dividends' as const, label: 'Dividends (Дивиденти)' },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors border ${
                tab === t.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                  : 'bg-bg/60 text-ink-muted hover:text-ink border-border/70 hover:bg-card-hover'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {!loading && (profile?.isin || etf.isin) && profile && profile.justEtfAvailable === false && (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 py-2 text-xs text-amber-300 font-medium">
          justETF временно не отговаря или е променил структурата си — показват се наличните данни и котировки от Yahoo Finance.
        </div>
      )}

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Interactive Chart + Quick Stats */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl border border-border bg-card/70 p-3 sm:p-4">
              <GoogleFinanceChart
                ticker={selectedTicker}
                companyName={displayName}
                currentPrice={price ?? 0}
                currency={currency}
                initialTimeframe="1Y"
                height={300}
              />
            </div>

            {/* 52W Range & Quick Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border bg-card/70 p-3">
                <div className="text-[10px] font-bold uppercase text-ink-faint">Активи (AUM)</div>
                <div className="text-sm font-black font-mono text-ink mt-1 truncate" title={fundSize}>
                  {fundSize}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card/70 p-3">
                <div className="text-[10px] font-bold uppercase text-ink-faint">TER / Expense Ratio</div>
                <div className="text-sm font-black font-mono text-indigo-400 mt-1">{ter}</div>
              </div>
              <div className="rounded-xl border border-border bg-card/70 p-3">
                <div className="text-[10px] font-bold uppercase text-ink-faint">Дивидент Yield</div>
                <div className="text-sm font-black font-mono text-emerald-400 mt-1">
                  {divYield != null ? `${divYield.toFixed(2)}%` : '—'}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card/70 p-3">
                <div className="text-[10px] font-bold uppercase text-ink-faint">Политика</div>
                <div className="text-sm font-black text-ink mt-1 truncate">{distPolicy}</div>
              </div>
            </div>

            {low52 != null && high52 != null && (
              <div className="rounded-2xl border border-border bg-card/70 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-ink-muted">52-седмичен диапазон</span>
                  <span className="font-mono font-bold text-ink">
                    {sym}
                    {low52.toFixed(2)} – {sym}
                    {high52.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-border/50 relative overflow-hidden">
                  {rangePct != null && (
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                      style={{ width: `${rangePct}%` }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Key Fund Info + Top 5 Holdings Preview */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-border bg-card/70 p-4 space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-ink border-b border-border/60 pb-2">
                Ключови данни за фонда
              </h3>
              <div className="divide-y divide-border/40">
                {keyInfoRows.map(r => (
                  <div key={r.label} className="py-2 flex items-center justify-between gap-2 text-xs">
                    <span className="text-ink-muted">{r.label}</span>
                    <span className="font-bold text-ink text-right truncate max-w-[180px]" title={r.value}>
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {profile?.topHoldings && profile.topHoldings.length > 0 && (
              <WeightList
                title="Топ 5 позиции"
                icon={<Layers className="w-3.5 h-3.5 text-indigo-400" />}
                items={profile.topHoldings.slice(0, 5)}
                subtitle={profile.top10Weight ? `Top 10: ${profile.top10Weight}` : undefined}
                barColor="bg-indigo-500"
              />
            )}
          </div>
        </div>
      )}

      {tab === 'holdings' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WeightList
            title="Топ 10 позиции"
            icon={<Layers className="w-4 h-4 text-indigo-400" />}
            items={profile?.topHoldings || []}
            subtitle={profile?.top10Weight ? `Общо: ${profile.top10Weight}` : undefined}
            barColor="bg-indigo-500"
          />
          <WeightList
            title="Сектори"
            icon={<PieChart className="w-4 h-4 text-amber-400" />}
            items={profile?.sectors || []}
            barColor="bg-amber-500"
          />
          <WeightList
            title="Държави"
            icon={<Globe className="w-4 h-4 text-emerald-400" />}
            items={profile?.countries || []}
            barColor="bg-emerald-500"
          />
        </div>
      )}

      {tab === 'performance' && (
        <div className="space-y-4">
          {totalReturnChart ? (
            <div className="rounded-2xl border border-border bg-card/70 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-ink">
                    justETF Историческа доходност с реинвестирани дивиденти (EUR)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  {activeReturnPt && (
                    <span className="text-ink-muted">
                      {activeReturnPt.date}: <strong className="text-ink">€{activeReturnPt.value.toFixed(2)}</strong>
                    </span>
                  )}
                  {profile?.totalPerformancePct != null && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-black">
                      Общо: {profile.totalPerformancePct >= 0 ? '+' : ''}
                      {profile.totalPerformancePct.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full overflow-hidden">
                <svg
                  viewBox={`0 0 ${totalReturnChart.width} ${totalReturnChart.height}`}
                  className="w-full h-52 sm:h-64 select-none"
                  onMouseLeave={() => setHoverIdx(null)}
                  onMouseMove={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const relX = ((e.clientX - rect.left) / rect.width) * totalReturnChart.width;
                    const idx = Math.round(
                      ((relX - 12) / (totalReturnChart.width - 24)) * (totalReturnChart.coords.length - 1)
                    );
                    setHoverIdx(Math.max(0, Math.min(totalReturnChart.coords.length - 1, idx)));
                  }}
                >
                  <defs>
                    <linearGradient id="etfPerfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <path d={totalReturnChart.areaPath} fill="url(#etfPerfGrad)" />
                  <path
                    d={totalReturnChart.linePath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                  {hoverIdx != null && totalReturnChart.coords[hoverIdx] && (
                    <g>
                      <line
                        x1={totalReturnChart.coords[hoverIdx].x}
                        y1={10}
                        x2={totalReturnChart.coords[hoverIdx].x}
                        y2={totalReturnChart.height - 10}
                        stroke="#6366f1"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={totalReturnChart.coords[hoverIdx].x}
                        cy={totalReturnChart.coords[hoverIdx].y}
                        r="4"
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    </g>
                  )}
                </svg>
                <div className="flex justify-between text-[10px] font-mono text-ink-faint px-1">
                  <span>{totalReturnChart.coords[0]?.date}</span>
                  <span>
                    Min: €{totalReturnChart.min.toFixed(2)} • Max: €{totalReturnChart.max.toFixed(2)}
                  </span>
                  <span>{totalReturnChart.coords[totalReturnChart.coords.length - 1]?.date}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card/70 p-4">
              <GoogleFinanceChart
                ticker={selectedTicker}
                companyName={displayName}
                currentPrice={price ?? 0}
                currency={currency}
                initialTimeframe="5Y"
                height={320}
              />
            </div>
          )}
        </div>
      )}

      {tab === 'dividends' && (
        <div className="rounded-2xl border border-border bg-card/70 p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-ink">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>Дивидентна информация</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-bg/50 p-3.5">
              <div className="text-[10px] font-bold uppercase text-ink-faint">Дивидентна доходност (TTM)</div>
              <div className="text-lg font-black font-mono text-emerald-400 mt-1">
                {divYield != null ? `${divYield.toFixed(2)}%` : '—'}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-bg/50 p-3.5">
              <div className="text-[10px] font-bold uppercase text-ink-faint">Годишен дивидент на дял</div>
              <div className="text-lg font-black font-mono text-ink mt-1">
                {profile?.divRate != null ? `${sym}${profile.divRate.toFixed(2)}` : '—'}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-bg/50 p-3.5">
              <div className="text-[10px] font-bold uppercase text-ink-faint">Политика</div>
              <div className="text-lg font-black text-ink mt-1">{distPolicy}</div>
            </div>
          </div>
          {distPolicy.toLowerCase().includes('accum') && (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              Този UCITS ETF е <strong>акумулиращ (Accumulating)</strong> — дивидентите от компаниите се реинвестират автоматично вътре във фонда без да се изплащат по сметката, което увеличава нетната стойност на дела.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
