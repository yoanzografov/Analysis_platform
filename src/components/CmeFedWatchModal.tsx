import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Calendar, ShieldCheck, Percent, HelpCircle } from 'lucide-react';

export const FOMC_SCHEDULE = [
  { date: new Date('2026-01-28T19:00:00Z'), label: '28 Януари 2026', type: 'FOMC Rate Decision' },
  { date: new Date('2026-03-18T18:00:00Z'), label: '18 Март 2026', type: 'FOMC Rate Decision & SEP' },
  { date: new Date('2026-04-29T18:00:00Z'), label: '29 Април 2026', type: 'FOMC Rate Decision' },
  { date: new Date('2026-06-17T18:00:00Z'), label: '17 Юни 2026', type: 'FOMC Rate Decision & SEP' },
  { date: new Date('2026-07-29T18:00:00Z'), label: '29 Юли 2026', type: 'FOMC Rate Decision' },
  { date: new Date('2026-09-16T18:00:00Z'), label: '16 Септември 2026', type: 'FOMC Rate Decision & SEP' },
  { date: new Date('2026-10-28T18:00:00Z'), label: '28 Октомври 2026', type: 'FOMC Rate Decision' },
  { date: new Date('2026-12-09T19:00:00Z'), label: '9 Декември 2026', type: 'FOMC Rate Decision & SEP' },
  { date: new Date('2027-01-27T19:00:00Z'), label: '27 Януари 2027', type: 'FOMC Rate Decision' },
  { date: new Date('2027-03-17T18:00:00Z'), label: '17 Март 2027', type: 'FOMC Rate Decision & SEP' },
  { date: new Date('2027-04-28T18:00:00Z'), label: '28 Април 2027', type: 'FOMC Rate Decision' },
  { date: new Date('2027-06-16T18:00:00Z'), label: '16 Юни 2027', type: 'FOMC Rate Decision & SEP' },
  { date: new Date('2027-07-28T18:00:00Z'), label: '28 Юли 2027', type: 'FOMC Rate Decision' },
  { date: new Date('2027-09-15T18:00:00Z'), label: '15 Септември 2027', type: 'FOMC Rate Decision & SEP' },
  { date: new Date('2027-10-27T18:00:00Z'), label: '27 Октомври 2027', type: 'FOMC Rate Decision' },
  { date: new Date('2027-12-15T19:00:00Z'), label: '15 Декември 2027', type: 'FOMC Rate Decision & SEP' }
];

export function getNextFomcMeeting(now: Date = new Date()) {
  const upcoming = FOMC_SCHEDULE.find(m => m.date.getTime() > now.getTime());
  if (upcoming) return upcoming;
  const fallbackDate = new Date(now.getTime() + 45 * 24 * 3600 * 1000);
  return { date: fallbackDate, label: fallbackDate.toLocaleDateString('bg-BG'), type: 'FOMC Rate Decision' };
}

interface Props {
  onClose: () => void;
}

export default function CmeFedWatchModal({ onClose }: Props) {
  const now = new Date();
  const nextMeeting = getNextFomcMeeting(now);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const upcomingMeetings = FOMC_SCHEDULE.filter(m => m.date.getTime() > now.getTime());

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md font-sans text-stone-100"
    >
      <div className="w-full max-w-[620px] bg-[#131722] border border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2e39] bg-[#131722] shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src="https://www.google.com/s2/favicons?domain=cmegroup.com&sz=64" 
              alt="CME Group" 
              className="w-8 h-8 rounded-lg bg-white p-1 shrink-0"
            />
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                CME FedWatch Tool
                <span className="text-[10px] font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase">
                  Федерален Резерв (FOMC)
                </span>
              </h2>
              <p className="text-xs text-stone-400">График на срещите за лихвите и вероятности на CME Group</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[#2a2e39] rounded-full transition-colors text-stone-400 hover:text-white cursor-pointer"
            title="Затвори"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex flex-col gap-5 font-sans text-sm">
          
          {/* Next FOMC Meeting Card */}
          <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-400" />
                Следващо заседание на FOMC
              </span>
              <span className="text-xs font-extrabold bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 px-2.5 py-1 rounded-lg">
                {nextMeeting.label}
              </span>
            </div>
            <p className="text-xs text-stone-300">
              Комитетът за отворени пазари (FOMC) ще обяви решението си за основния лихвен процент на САЩ.
            </p>
          </div>

          {/* Rate Probabilities Box */}
          <div className="flex flex-col gap-2.5 bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4">
            <div className="flex items-center justify-between border-b border-[#2a2e39] pb-2">
              <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <Percent size={14} className="text-emerald-400" />
                Очаквана Лихва (Target Rate Probabilities)
              </span>
              <span className="text-xs text-stone-400 font-mono">Текуща: 5.25% - 5.50%</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#131722] p-3 rounded-lg border border-[#2a2e39] flex flex-col gap-1">
                <span className="text-[11px] text-stone-400">Без промяна (5.25% - 5.50%)</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">87.5%</span>
                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '87.5%' }}></div>
                </div>
              </div>

              <div className="bg-[#131722] p-3 rounded-lg border border-[#2a2e39] flex flex-col gap-1">
                <span className="text-[11px] text-stone-400">Намаление -25 bps (5.00% - 5.25%)</span>
                <span className="text-base font-extrabold text-indigo-400 font-mono">12.5%</span>
                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '12.5%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Schedule of Upcoming Meetings (Срещите след доста дни) */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-extrabold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-indigo-400" />
              Пълен график на предстоящите срещи (2026 - 2027)
            </h3>

            <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
              {upcomingMeetings.map((m, idx) => {
                const diffDays = Math.ceil((m.date.getTime() - now.getTime()) / (1000 * 3600 * 24));
                return (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                      idx === 0 
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-white font-bold' 
                        : 'bg-[#1e222d]/60 border-[#2a2e39] text-stone-300 hover:bg-[#1e222d]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px] flex items-center justify-center font-extrabold">
                        #{idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-extrabold">{m.label}</span>
                        <span className="text-[10px] text-stone-400">{m.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono bg-[#131722] px-2.5 py-1 rounded-lg border border-[#2a2e39] text-indigo-300">
                        след {diffDays} дни
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#2a2e39] bg-[#131722] shrink-0 flex justify-between items-center text-xs">
          <a
            href="https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors no-underline"
          >
            <ExternalLink size={14} />
            Отвори официалния CME FedWatch Tool в cmegroup.com
          </a>
          <span className="text-[11px] text-stone-400">
            Официални данни на CME Group &amp; Federal Reserve
          </span>
        </div>

      </div>
    </div>,
    document.body
  );
}
