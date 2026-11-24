import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, X, RefreshCw, Filter, Clock, Flame, Search } from 'lucide-react';

interface CalendarEvent {
  title: string;
  country: string;
  date: string;
  impact: 'High' | 'Medium' | 'Low' | 'Holiday' | string;
  actual: string;
  forecast: string;
  previous: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type DateTab = 'yesterday' | 'today' | 'tomorrow' | 'this_week' | 'next_week';
type ImpactFilter = 'all' | 'High' | 'Medium' | 'Low';

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  CHF: '🇨🇭',
  CNY: '🇨🇳',
  CAD: '🇨🇦',
  AUD: '🇦🇺',
  NZD: '🇳🇿',
};

const POPULAR_CURRENCIES = ['ALL', 'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CNY', 'CAD', 'AUD'];

function parseNumericVal(s: string): number | null {
  if (!s) return null;
  const cleaned = s.replace(/[^0-9.-]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function getLocalDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function EconomicCalendarModal({ isOpen, onClose }: Props) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateTab, setDateTab] = useState<DateTab>('today');
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/economic-calendar');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.events)) setEvents(json.events);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && events.length === 0) {
      fetchCalendar();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const todayKey = getLocalDayKey(now);
    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const yesterdayKey = getLocalDayKey(yest);
    const tom = new Date(now);
    tom.setDate(tom.getDate() + 1);
    const tomorrowKey = getLocalDayKey(tom);

    // Start/End of current week (Mon-Sun)
    const dayOfWeek = (now.getDay() + 6) % 7; // Mon=0..Sun=6
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const nextWeekEnd = new Date(weekEnd);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

    const q = searchQuery.trim().toLowerCase();

    return events.filter(ev => {
      const dt = new Date(ev.date);
      if (isNaN(dt.getTime())) return false;
      const evKey = getLocalDayKey(dt);

      if (dateTab === 'today' && evKey !== todayKey) return false;
      if (dateTab === 'yesterday' && evKey !== yesterdayKey) return false;
      if (dateTab === 'tomorrow' && evKey !== tomorrowKey) return false;
      if (dateTab === 'this_week' && (dt < weekStart || dt >= weekEnd)) return false;
      if (dateTab === 'next_week' && (dt < weekEnd || dt >= nextWeekEnd)) return false;

      if (impactFilter !== 'all' && ev.impact !== impactFilter) return false;
      if (currencyFilter !== 'ALL' && ev.country !== currencyFilter) return false;
      if (q && !ev.title.toLowerCase().includes(q) && !ev.country.toLowerCase().includes(q)) return false;

      return true;
    });
  }, [events, dateTab, impactFilter, currencyFilter, searchQuery]);

  // Group events by local day header (Investing.com style)
  const groupedDays = useMemo(() => {
    const groups: { dayKey: string; dayLabel: string; items: CalendarEvent[] }[] = [];
    const byKey = new Map<string, CalendarEvent[]>();

    for (const ev of filteredEvents) {
      const dt = new Date(ev.date);
      const k = getLocalDayKey(dt);
      if (!byKey.has(k)) byKey.set(k, []);
      byKey.get(k)!.push(ev);
    }

    for (const [k, items] of byKey.entries()) {
      const dt = new Date(items[0].date);
      const dayLabel = dt.toLocaleDateString('bg-BG', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      groups.push({ dayKey: k, dayLabel, items });
    }
    return groups;
  }, [filteredEvents]);

  if (!isOpen) return null;

  const renderImpactBulls = (impact: string) => {
    const count = impact === 'High' ? 3 : impact === 'Medium' ? 2 : impact === 'Low' ? 1 : 0;
    const activeColor =
      impact === 'High'
        ? 'text-rose-500 fill-rose-500'
        : impact === 'Medium'
          ? 'text-amber-400 fill-amber-400'
          : 'text-sky-400 fill-sky-400';

    if (impact === 'Holiday') {
      return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted/60 text-ink-faint">Holiday</span>;
    }

    return (
      <div className="inline-flex items-center gap-0.5" title={`Въздействие: ${impact}`}>
        {[1, 2, 3].map(n => (
          <Flame
            key={n}
            className={`w-3.5 h-3.5 ${n <= count ? activeColor : 'text-border/70'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-bg/85 backdrop-blur-md font-sans"
    >
      <div className="w-full max-w-5xl bg-card border border-border rounded-2xl shadow-2xl relative h-[88vh] flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between gap-3 shrink-0 bg-card/90">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-ink leading-tight uppercase tracking-tight truncate">
                Economic Calendar <span className="text-amber-400 font-mono text-xs ml-1">Investing Style</span>
              </h3>
              <div className="text-[11px] text-ink-faint flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Локално време ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                </span>
                <span>•</span>
                <span>{filteredEvents.length} събития</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchCalendar}
              disabled={loading}
              className="p-2 rounded-xl bg-bg border border-border text-ink-muted hover:text-ink hover:bg-card-hover transition-colors cursor-pointer disabled:opacity-50"
              title="Опресни календара"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-bg border border-border text-ink-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Затвори"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Investing.com Style Filter Toolbar */}
        <div className="px-4 sm:px-6 py-3 border-b border-border/70 bg-bg/40 flex flex-col gap-2.5 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Date Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-card border border-border rounded-xl p-1">
              {[
                { id: 'yesterday', label: 'Вчера' },
                { id: 'today', label: 'Днес' },
                { id: 'tomorrow', label: 'Утре' },
                { id: 'this_week', label: 'Тази седмица' },
                { id: 'next_week', label: 'Следваща седмица' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDateTab(t.id as DateTab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    dateTab === t.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-card-hover'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-ink-faint absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Търси събитие (CPI, Fed, GDP)..."
                className="w-full bg-card border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Impact + Currency Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase text-ink-faint inline-flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> Важност:
              </span>
              {[
                { id: 'all', label: 'Всички' },
                { id: 'High', label: 'Висока (3)' },
                { id: 'Medium', label: 'Средна (2)' },
                { id: 'Low', label: 'Ниска (1)' },
              ].map(imp => (
                <button
                  key={imp.id}
                  type="button"
                  onClick={() => setImpactFilter(imp.id as ImpactFilter)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                    impactFilter === imp.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-card text-ink-muted hover:text-ink border-border/70'
                  }`}
                >
                  {imp.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {POPULAR_CURRENCIES.map(cur => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setCurrencyFilter(cur)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold border whitespace-nowrap transition-colors cursor-pointer ${
                    currencyFilter === cur
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-card text-ink-muted hover:text-ink border-border/70'
                  }`}
                >
                  {cur === 'ALL' ? 'Всички валути' : `${CURRENCY_FLAGS[cur] || ''} ${cur}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Investing.com Style Event Table */}
        <div className="flex-1 overflow-y-auto">
          {loading && events.length === 0 ? (
            <div className="py-16 text-center text-xs text-ink-muted">
              Зареждане на икономическия календар...
            </div>
          ) : groupedDays.length === 0 ? (
            <div className="py-16 text-center text-xs text-ink-muted">
              Няма икономически събития за избрания период и филтри.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-card border-b border-border text-[10.5px] font-black uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="py-2.5 px-4 w-20">Час</th>
                  <th className="py-2.5 px-3 w-20">Вал.</th>
                  <th className="py-2.5 px-3 w-24 text-center">Важност</th>
                  <th className="py-2.5 px-4">Събитие</th>
                  <th className="py-2.5 px-3 text-right w-24">Актуално</th>
                  <th className="py-2.5 px-3 text-right w-24">Прогноза</th>
                  <th className="py-2.5 px-4 text-right w-24">Предишно</th>
                </tr>
              </thead>
              <tbody>
                {groupedDays.map(group => (
                  <React.Fragment key={group.dayKey}>
                    <tr className="bg-muted/40 border-y border-border/70">
                      <td colSpan={7} className="py-2 px-4 text-[11px] font-black uppercase tracking-wide text-indigo-400">
                        {group.dayLabel}
                      </td>
                    </tr>
                    {group.items.map((ev, idx) => {
                      const dt = new Date(ev.date);
                      const timeStr = dt.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });
                      const actNum = parseNumericVal(ev.actual);
                      const fcstNum = parseNumericVal(ev.forecast);
                      let actualClass = 'text-ink font-bold';
                      if (actNum !== null && fcstNum !== null) {
                        if (actNum > fcstNum) actualClass = 'text-emerald-400 font-black';
                        else if (actNum < fcstNum) actualClass = 'text-rose-400 font-black';
                      }

                      return (
                        <tr
                          key={`${group.dayKey}-${idx}`}
                          className="border-b border-border/40 hover:bg-indigo-500/10 transition-colors"
                        >
                          <td className="py-2.5 px-4 font-mono text-ink-muted whitespace-nowrap">
                            {timeStr}
                          </td>
                          <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                            <span className="mr-1">{CURRENCY_FLAGS[ev.country] || '🌐'}</span>
                            <span className="text-ink">{ev.country}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {renderImpactBulls(ev.impact)}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-ink">
                            {ev.title}
                          </td>
                          <td className={`py-2.5 px-3 text-right font-mono whitespace-nowrap ${actualClass}`}>
                            {ev.actual || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-ink-muted whitespace-nowrap">
                            {ev.forecast || '—'}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-ink-faint whitespace-nowrap">
                            {ev.previous || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
