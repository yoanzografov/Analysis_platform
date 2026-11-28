import React, { useEffect, useRef, useState } from 'react';
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw, ChevronDown } from 'lucide-react';

interface SourceStatusItem {
  id: string;
  name: string;
  role: string;
  status: 'ok' | 'degraded' | 'down';
  latencyMs: number;
  detail: string;
}

interface SourcesHealthResponse {
  overall: 'ok' | 'degraded' | 'down';
  okCount: number;
  totalCount: number;
  checkedAt?: string;
  sources: SourceStatusItem[];
}

interface Props {
  isAutoLiveRefresh: boolean;
  onToggleAutoLiveRefresh: () => void;
  isFetchingLivePrices: boolean;
  onManualRefresh: () => void;
}

export default function DataSourcesStatusPill({
  isAutoLiveRefresh,
  onToggleAutoLiveRefresh,
  isFetchingLivePrices,
  onManualRefresh,
}: Props) {
  const [data, setData] = useState<SourcesHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkHealth = async (force = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sources-health${force ? '?force=1' : ''}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      setData({
        overall: 'down',
        okCount: 0,
        totalCount: 5,
        checkedAt: new Date().toISOString(),
        sources: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const overall = data?.overall || 'ok';
  const dotColor =
    overall === 'down'
      ? 'bg-rose-400'
      : overall === 'degraded'
        ? 'bg-amber-400'
        : isAutoLiveRefresh
          ? 'bg-emerald-400'
          : 'bg-stone-500';

  const pillClasses =
    overall === 'down'
      ? 'bg-rose-500/15 text-rose-300 border-rose-500/35 hover:bg-rose-500/20'
      : overall === 'degraded'
        ? 'bg-amber-500/15 text-amber-300 border-amber-500/35 hover:bg-amber-500/20'
        : isAutoLiveRefresh
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
          : 'bg-transparent text-ink-faint border-border hover:bg-card-hover hover:text-ink';

  const countSuffix = data ? ` · ${data.okCount}/${data.totalCount}` : '';

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        className={`h-9 w-full px-3 rounded-xl border font-sans text-[11px] font-extrabold uppercase transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer whitespace-nowrap shadow-xs select-none ${pillClasses}`}
        title="Управление на живи данни, опресняване и статус на източниците"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            {(isAutoLiveRefresh || loading || isFetchingLivePrices) && overall !== 'down' && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
          </span>
          <span className="truncate">
            Живи Данни: {isAutoLiveRefresh ? 'ВКЛ' : 'ИЗКЛ'}
            <span className="font-mono opacity-85">{countSuffix}</span>
          </span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 lg:right-auto lg:w-80 mt-1.5 lg:mt-0 lg:bottom-full lg:mb-1.5 z-50 rounded-2xl border border-border bg-card shadow-2xl p-3.5 space-y-3">
          {/* Quick Controls: Auto Live Toggle & Manual Refresh */}
          <div className="space-y-2 border-b border-border/60 pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-ink">Автоматично опресняване</span>
              <button
                type="button"
                onClick={onToggleAutoLiveRefresh}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-black uppercase cursor-pointer transition-colors ${
                  isAutoLiveRefresh
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-bg text-ink-muted border-border hover:text-ink'
                }`}
              >
                {isAutoLiveRefresh ? 'ВКЛ' : 'ИЗКЛ'}
              </button>
            </div>

            <button
              type="button"
              onClick={onManualRefresh}
              disabled={isFetchingLivePrices}
              className="w-full h-8 px-3 rounded-xl border border-border bg-bg hover:bg-card-hover hover:border-indigo-500/30 text-xs font-bold text-ink inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLivePrices ? 'animate-spin text-emerald-400' : 'text-indigo-400'}`} />
              <span>{isFetchingLivePrices ? 'Опресняване...' : 'Опресни котировките'}</span>
            </button>
          </div>

          {/* Sources Health Section */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <div>
                <div className="text-[11px] font-black text-ink uppercase tracking-wider">
                  Източници ({data ? `${data.okCount}/${data.totalCount}` : '...'})
                </div>
                {data?.checkedAt && (
                  <div className="text-[10px] text-ink-faint font-mono">
                    {new Date(data.checkedAt).toLocaleTimeString('bg-BG', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => checkHealth(true)}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-bg hover:bg-card-hover text-[11px] font-bold text-ink cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Провери</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {(data?.sources || []).map(src => {
              const Icon =
                src.status === 'ok'
                  ? CheckCircle2
                  : src.status === 'degraded'
                    ? AlertTriangle
                    : XCircle;
              const statusColor =
                src.status === 'ok'
                  ? 'text-emerald-400'
                  : src.status === 'degraded'
                    ? 'text-amber-400'
                    : 'text-rose-400';
              const statusLabel =
                src.status === 'ok'
                  ? 'Live'
                  : src.status === 'degraded'
                    ? 'Бавен'
                    : 'Недостъпен';

              return (
                <div
                  key={src.id}
                  className="rounded-xl border border-border/60 bg-bg/50 px-2.5 py-1.5 space-y-0.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${statusColor}`} />
                      <span className="text-xs font-black text-ink truncate">{src.name}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold shrink-0 ${statusColor}`}>
                      {statusLabel} · {src.latencyMs}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[10px] text-ink-muted">
                    <span className="truncate">{src.role}</span>
                    <span className="font-mono text-ink-faint shrink-0">{src.detail}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
