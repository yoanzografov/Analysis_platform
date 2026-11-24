import React, { useEffect, useMemo, useState } from 'react';
import { X, ExternalLink, BarChart3, Globe, Layers, PieChart, ArrowUpRight, Loader2 } from 'lucide-react';

export interface JustEtfSummary {
  ticker: string;
  name: string;
  isin: string;
  category: string;
  expenseRatio: string;
  price: number | null;
  changePct: number | null;
  currency: string;
  fundSize?: string | null;
  distributionPolicy?: string | null;
  replication?: string | null;
  domicile?: string | null;
  justEtfUrl?: string | null;
}

interface JustEtfDetailData {
  isin: string;
  justEtfName?: string;
  ter?: string;
  fundSize?: string;
  distributionPolicy?: string;
  replication?: string;
  domicile?: string;
  fundCurrency?: string;
  inceptionDate?: string;
  holdingsCount?: string;
  indexName?: string;
  fundProvider?: string;
  top10Weight?: string;
  topHoldings: Array<{ name: string; weight: string }>;
  countries: Array<{ name: string; weight: string }>;
  sectors: Array<{ name: string; weight: string }>;
  justEtfUrl?: string;
  latestQuoteEur?: number | null;
  latestQuoteDate?: string | null;
  dtdPct?: number | null;
  totalPerformancePct?: number | null;
  series: Array<{ date: string; value: number }>;
}

interface Props {
  etf: JustEtfSummary;
  onClose: () => void;
  onOpenDeepAnalysis: () => void;
}

function AllocationList({
  title,
  icon,
  items,
  subtitle,
  barColor,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<{ name: string; weight: string }>;
  subtitle?: string;
  barColor: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg/50 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-black text-ink uppercase tracking-wider">
          {icon}
          <span>{title}</span>
        </div>
        {subtitle && (
          <span className="text-[11px] font-bold text-indigo-400 font-mono">{subtitle}</span>
        )}
      </div>
      {items.length === 0 ? (
        <div className="text-xs text-ink-muted py-4 text-center">Няма налични данни</div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => {
            const pct = parseFloat(item.weight.replace(/[^0-9.]/g, '')) || 0;
            const widthPct = Math.min(100, Math.max(2, pct));
            return (
              <div key={`${item.name}-${idx}`} className="space-y-1">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="text-ink font-medium truncate" title={item.name}>
                    {item.name}
                  </span>
                  <span className="font-mono font-bold text-ink-muted shrink-0">{item.weight}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function JustEtfDetailModal({ etf, onClose, onOpenDeepAnalysis }: Props) {
  const [detail, setDetail] = useState<JustEtfDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`/api/etf-justetf-detail?isin=${encodeURIComponent(etf.isin)}`)
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (active) setDetail(json);
      })
      .catch(err => {
        if (active) setError(err?.message || 'Грешка при зареждане от justETF');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [etf.isin]);

  const chartGeometry = useMemo(() => {
    const pts = detail?.series || [];
    if (pts.length < 2) return null;
    const width = 760;
    const height = 210;
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
  }, [detail]);

  const activePoint =
    chartGeometry && hoverIdx != null && chartGeometry.coords[hoverIdx]
      ? chartGeometry.coords[hoverIdx]
      : chartGeometry?.coords[chartGeometry.coords.length - 1] || null;

  const displayTer = detail?.ter || etf.expenseRatio || '—';
  const displaySize = detail?.fundSize || etf.fundSize || '—';
  const displayDist = detail?.distributionPolicy || etf.distributionPolicy || '—';
  const displayRepl = detail?.replication || etf.replication || '—';
  const displayDomicile = detail?.domicile || etf.domicile || '—';
  const justEtfLink = detail?.justEtfUrl || etf.justEtfUrl || `https://www.justetf.com/en/etf-profile.html?isin=${etf.isin}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl p-4 sm:p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-black font-mono">
                {etf.ticker}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border text-ink-muted text-[11px] font-mono font-bold">
                ISIN: {etf.isin}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                justETF Live
              </span>
            </div>
            <h3 className="text-base sm:text-xl font-black text-ink leading-snug">
              {detail?.justEtfName || etf.name}
            </h3>
            {detail?.indexName && (
              <p className="text-xs text-ink-muted">
                Индекс: <span className="text-ink font-semibold">{detail.indexName}</span>
                {detail.fundProvider ? ` • ${detail.fundProvider}` : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenDeepAnalysis}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              <span>9-табов анализ</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <a
              href={justEtfLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-bg hover:bg-card-hover text-xs font-bold text-ink transition-colors"
            >
              <span>justETF</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl border border-border bg-bg hover:bg-card-hover text-ink-muted hover:text-ink cursor-pointer"
              aria-label="Затвори"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Key Facts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[
            { label: 'TER (Такса)', value: displayTer },
            { label: 'Размер (AUM)', value: displaySize },
            { label: 'Дивиденти', value: displayDist },
            { label: 'Репликация', value: displayRepl },
            { label: 'Домицил', value: displayDomicile },
            { label: 'Валута фонд', value: detail?.fundCurrency || etf.currency || '—' },
            { label: 'Позиции', value: detail?.holdingsCount || '—' },
            { label: 'Създаден', value: detail?.inceptionDate || '—' },
          ].map(fact => (
            <div key={fact.label} className="rounded-xl border border-border bg-bg/50 px-3 py-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">{fact.label}</div>
              <div className="text-xs font-black text-ink mt-0.5 truncate" title={fact.value}>
                {fact.value}
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-ink-muted text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <span>Зареждане на графика и портфейл от justETF...</span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
            Неуспешно зареждане на детайлите от justETF ({error}). Можете да отворите директно в{' '}
            <a href={justEtfLink} target="_blank" rel="noopener noreferrer" className="underline font-bold">
              justETF.com
            </a>
            .
          </div>
        ) : (
          <>
            {/* Performance Chart with Dividends */}
            <div className="rounded-xl border border-border bg-bg/50 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-ink">
                    Историческа доходност с дивиденти (EUR)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  {activePoint && (
                    <span className="text-ink-muted">
                      {activePoint.date}: <strong className="text-ink">€{activePoint.value.toFixed(2)}</strong>
                    </span>
                  )}
                  {detail?.totalPerformancePct != null && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-black">
                      Обща доходност: {detail.totalPerformancePct >= 0 ? '+' : ''}
                      {detail.totalPerformancePct.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {chartGeometry ? (
                <div className="w-full overflow-hidden">
                  <svg
                    viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
                    className="w-full h-44 sm:h-52 select-none"
                    onMouseLeave={() => setHoverIdx(null)}
                    onMouseMove={e => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const relX = ((e.clientX - rect.left) / rect.width) * chartGeometry.width;
                      const idx = Math.round(
                        ((relX - 12) / (chartGeometry.width - 24)) * (chartGeometry.coords.length - 1)
                      );
                      setHoverIdx(Math.max(0, Math.min(chartGeometry.coords.length - 1, idx)));
                    }}
                  >
                    <defs>
                      <linearGradient id="justetfAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path d={chartGeometry.areaPath} fill="url(#justetfAreaGrad)" />
                    <path
                      d={chartGeometry.linePath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />
                    {hoverIdx != null && chartGeometry.coords[hoverIdx] && (
                      <g>
                        <line
                          x1={chartGeometry.coords[hoverIdx].x}
                          y1={10}
                          x2={chartGeometry.coords[hoverIdx].x}
                          y2={chartGeometry.height - 10}
                          stroke="#6366f1"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                        <circle
                          cx={chartGeometry.coords[hoverIdx].x}
                          cy={chartGeometry.coords[hoverIdx].y}
                          r="4"
                          fill="#10b981"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      </g>
                    )}
                  </svg>
                  <div className="flex justify-between text-[10px] font-mono text-ink-faint px-1">
                    <span>{chartGeometry.coords[0]?.date}</span>
                    <span>
                      Min: €{chartGeometry.min.toFixed(2)} • Max: €{chartGeometry.max.toFixed(2)}
                    </span>
                    <span>{chartGeometry.coords[chartGeometry.coords.length - 1]?.date}</span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-ink-muted">Няма налична ценова серия.</div>
              )}
            </div>

            {/* Holdings, Countries, Sectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <AllocationList
                title="Топ 10 позиции"
                icon={<Layers className="w-3.5 h-3.5 text-indigo-400" />}
                items={detail?.topHoldings || []}
                subtitle={detail?.top10Weight ? `Общо: ${detail.top10Weight}` : undefined}
                barColor="bg-indigo-500"
              />
              <AllocationList
                title="Държави"
                icon={<Globe className="w-3.5 h-3.5 text-emerald-400" />}
                items={detail?.countries || []}
                barColor="bg-emerald-500"
              />
              <AllocationList
                title="Сектори"
                icon={<PieChart className="w-3.5 h-3.5 text-amber-400" />}
                items={detail?.sectors || []}
                barColor="bg-amber-500"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
