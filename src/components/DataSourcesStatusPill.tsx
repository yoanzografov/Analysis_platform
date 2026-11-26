import React, { useEffect, useRef, useState } from 'react';
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

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

export default function DataSourcesStatusPill() {
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
    overall === 'ok'
      ? 'bg-emerald-400'
      : overall === 'degraded'
        ? 'bg-amber-400'
        : 'bg-rose-400';

  const pillBorder =
    overall === 'ok'
      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
      : overall === 'degraded'
        ? 'border-amber-500/35 bg-amber-500/15 text-amber-300'
        : 'border-rose-500/35 bg-rose-500/15 text-rose-300';

  const labelText = !data
    ? 'Проверка...'
    : overall === 'ok'
      ? `Източници: ${data.okCount}/${data.totalCount}`
      : overall === 'degraded'
        ? `Частично: ${data.okCount}/${data.totalCount}`
        : `Проблем: ${data.okCount}/${data.totalCount}`;

  return (
    <div ref={containerRef} className="relative shrink-0 lg:w-full">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`px-3.5 py-2 rounded-xl text-[11px] font-bold font-mono transition-all cursor-pointer flex items-center justify-between gap-2 border shrink-0 lg:w-full ${pillBorder}`}
        title="Статус на външните източници на данни (Yahoo, justETF, TradingView, SEC)"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full ${dotColor} ${loading ? 'animate-pulse' : ''} shrink-0`} />
          <span className="truncate">{labelText}</span>
        </span>
        <Activity className="w-3.5 h-3.5 shrink-0 opacity-80" />
      </button>

      {open && (
        <div className="fixed lg:absolute left-4 right-4 lg:left-full lg:right-auto lg:bottom-0 lg:ml-2 top-auto bottom-16 z-50 lg:w-80 rounded-2xl border border-border bg-card shadow-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
            <div>
              <div className="text-xs font-black text-ink uppercase tracking-wider">
                Статус на данните
              </div>
              {data?.checkedAt && (
                <div className="text-[10px] text-ink-faint font-mono">
                  Последна проверка:{' '}
                  {new Date(data.checkedAt).toLocaleTimeString('bg-BG', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </div>
              )}
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

          <div className="space-y-2 max-h-72 overflow-y-auto">
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
                  className="rounded-xl border border-border/60 bg-bg/50 px-2.5 py-2 space-y-0.5"
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
