import React, { useState, useEffect } from 'react';
import { Sun, RefreshCw, ChevronDown, ChevronUp, Sparkles, Clock } from 'lucide-react';

interface Props {
  userName?: string;
  onSelectTicker?: (ticker: string) => void;
}

interface MorningBriefResponse {
  date: string;
  lang: 'bg' | 'en';
  greeting: string;
  macro: Record<string, { name: string; price: number | null; changePct: number | null }>;
  earningsCount: number;
  bmo: Array<{ symbol: string; epsEstimate: number | null; epsActual: number | null; status: string }>;
  amc: Array<{ symbol: string; epsEstimate: number | null; epsActual: number | null; status: string }>;
  markdown: string;
  source: string;
  generatedAt: string;
}

export default function MorningBriefingCard({ userName, onSelectTicker }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lang, setLang] = useState<'bg' | 'en'>('bg');
  const [brief, setBrief] = useState<MorningBriefResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadBrief = async (forceRefresh: boolean = false, targetLang: 'bg' | 'en' = lang) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ lang: targetLang });
      if (userName) params.set('name', userName);
      if (forceRefresh) params.set('refresh', '1');
      const res = await fetch(`/api/morning-brief?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBrief(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && (!brief || brief.lang !== lang)) {
      loadBrief(false, lang);
    }
  }, [isExpanded, lang]);

  return (
    <div className="rounded-2xl bg-card border border-border/80 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(prev => !prev)}
        className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 cursor-pointer hover:bg-card-hover/40 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Sun className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-black uppercase tracking-wider text-ink">
                Дневен Финансов Обзор (Morning Market Briefing)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-bold border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                7-Точков Институционален Бюлетин
              </span>
            </div>
            <p className="text-[11px] text-ink-faint truncate">
              S&P 500, Futures & VIX, Global Markets, Brent/WTI, US 10Y Yield и отчети BMO/AMC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          {isExpanded && (
            <>
              <div className="flex items-center bg-bg border border-border rounded-lg p-0.5 text-[10px] font-black">
                <button
                  type="button"
                  onClick={() => setLang('bg')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${lang === 'bg' ? 'bg-indigo-600 text-white' : 'text-ink-muted hover:text-ink'}`}
                >
                  BG
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${lang === 'en' ? 'bg-indigo-600 text-white' : 'text-ink-muted hover:text-ink'}`}
                >
                  EN
                </button>
              </div>
              <button
                type="button"
                onClick={() => loadBrief(true, lang)}
                disabled={loading}
                className="p-1.5 rounded-lg border border-border bg-bg hover:bg-card-hover text-ink-muted hover:text-ink transition-colors cursor-pointer"
                title="Опресни сутрешния обзор"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-1.5 rounded-lg border border-border bg-bg hover:bg-card-hover text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-4 border-t border-border/60 space-y-4">
          {loading && !brief ? (
            <div className="py-6 text-center text-xs text-ink-faint flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Генериране на дневния институционален бюлетин...</span>
            </div>
          ) : brief ? (
            <>
              {/* Macro Quick Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {['^GSPC', '^NDX', '^VIX', 'BZ=F', 'CL=F', '^TNX'].map(sym => {
                  const m = brief.macro?.[sym];
                  if (!m) return null;
                  const label = sym === '^GSPC' ? 'S&P 500' : sym === '^NDX' ? 'Nasdaq-100' : sym === '^VIX' ? 'VIX' : sym === 'BZ=F' ? 'Brent' : sym === 'CL=F' ? 'WTI' : 'US 10Y';
                  const pos = (m.changePct ?? 0) >= 0;
                  return (
                    <div key={sym} className="p-2 rounded-xl bg-bg/70 border border-border/60 text-xs">
                      <div className="text-[10px] font-bold text-ink-faint">{label}</div>
                      <div className="font-black text-ink font-mono">
                        {m.price != null ? m.price.toLocaleString() : '—'}{sym === '^TNX' ? '%' : ''}
                      </div>
                      {m.changePct != null && (
                        <div className={`text-[10px] font-bold font-mono ${pos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pos ? '+' : ''}{m.changePct.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Greeting & 7-point Markdown */}
              <div className="space-y-2">
                <div className="text-xs font-black text-indigo-400">{brief.greeting}</div>
                {brief.markdown ? (
                  <div className="text-xs text-ink-muted leading-relaxed whitespace-pre-wrap bg-bg/50 p-3.5 rounded-xl border border-border/50">
                    {brief.markdown}
                  </div>
                ) : (
                  <div className="text-xs text-ink-faint">Макро данните са заредени. Добавете Gemini API ключ за пълен AI синтез.</div>
                )}
              </div>

              {/* Today's Earnings Clickable Chips */}
              {(brief.bmo.length > 0 || brief.amc.length > 0) && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-ink-faint">Отчети днес:</span>
                  {brief.bmo.map(e => (
                    <button
                      key={`bmo-${e.symbol}`}
                      type="button"
                      onClick={() => onSelectTicker?.(e.symbol)}
                      className="px-2 py-0.5 rounded-md bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 text-[11px] font-mono font-bold cursor-pointer"
                    >
                      {e.symbol} (BMO)
                    </button>
                  ))}
                  {brief.amc.map(e => (
                    <button
                      key={`amc-${e.symbol}`}
                      type="button"
                      onClick={() => onSelectTicker?.(e.symbol)}
                      className="px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold cursor-pointer"
                    >
                      {e.symbol} (AMC)
                    </button>
                  ))}
                </div>
              )}

              {/* Source & Timestamp Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-ink-faint pt-2 border-t border-border/40">
                <span>Източник: {brief.source}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Обновено: {new Date(brief.generatedAt).toLocaleString('bg-BG')}
                </span>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
