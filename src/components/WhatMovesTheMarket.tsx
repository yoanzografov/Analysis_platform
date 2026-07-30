import { useState, useEffect } from 'react';
import { Info, Calendar, Flame, AlertCircle, X, HelpCircle, Clock, ExternalLink } from 'lucide-react';

export interface MarketIndicator {
  id: number;
  title: string;
  englishTitle: string;
  schedule: string;
  nextDateDesc: string;
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  shortSummary: string;
  description: string;
  whyItMovesMarket: string;
  marketReaction: string;
  tradingViewSymbol: string;
  tradingViewUrl: string;
  source: string;
}

const INDICATORS_DATA: MarketIndicator[] = [
  {
    id: 1,
    title: '1. Лихвени проценти (FOMC / Federal Funds Rate)',
    englishTitle: 'Fed Interest Rate Decision',
    schedule: 'На всеки 6 седмици (Сряда 21:00 ч. БГ време / 8 пъти годишно)',
    nextDateDesc: 'Следващо решение: Заседание на ФЕД (FOMC)',
    impact: 'CRITICAL',
    shortSummary: 'Централните банки (Фед/ЕЦБ) определят цената на парите. Основен двигател за оценката на целия фондов пазар.',
    description: 'Лихвените проценти определят цената, на която банките и компаниите вземат заеми. Когато икономиката прегрява и инфлацията е висока → Фед повишава лихвите. Когато икономиката се охлажда → Фед понижава лихвите.',
    whyItMovesMarket: 'По-високите лихви оскъпяват кредитите, намаляват корпоративните печалби и правят облигациите по-атрактивни спрямо акциите.',
    marketReaction: 'Повишение на лихвите → Падане на акциите (особено технологични). Понижение на лихвите → Рали на борсите.',
    tradingViewSymbol: 'FRED:FEDFUNDS',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-FEDFUNDS/',
    source: 'Federal Reserve (Федерален резерв на САЩ)'
  },
  {
    id: 2,
    title: '2. Данни за заетостта (Non-Farm Payrolls - NFP & Безработица)',
    englishTitle: 'Non-Farm Payrolls & Unemployment Rate',
    schedule: 'Всеки първи петък от месеца (15:30 ч. БГ време)',
    nextDateDesc: 'Следващи данни: Доклад за заетостта в САЩ',
    impact: 'CRITICAL',
    shortSummary: 'Месечен доклад за новите работни места в САЩ и процента безработица. Сърцето на икономиката.',
    description: 'NFP измерва колко нови работни места са създадени в икономиката на САЩ през изминалия месец (без селското стопанство и държавните служители). Безработицата показва процента търсещи работа.',
    whyItMovesMarket: 'Силният пазар на труда означава стабилно потребление, но и риск от инфлационен натиск и последващо вдигане на лихвите.',
    marketReaction: '„Добрата новина може да е лоша новина“: Твърде много нови работни места плашат пазара от нови лихвени повишения.',
    tradingViewSymbol: 'FRED:PAYEMS',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-PAYEMS/',
    source: 'Bureau of Labor Statistics (BLS)'
  },
  {
    id: 3,
    title: '3. Потребителска Инфлация (CPI - Consumer Price Index)',
    englishTitle: 'Consumer Price Index (CPI Inflation)',
    schedule: 'Всеки месец между 12-то и 14-то число (15:30 ч. БГ време)',
    nextDateDesc: 'Следващи данни: Индекс на потребителските цени',
    impact: 'CRITICAL',
    shortSummary: 'Измерва промяната в цените на потребителските стоки и услуги. Главният показател за инфлация.',
    description: 'CPI проследява потребителската кошница (храна, горива, наеми, услуги). Главният индикатор, който Фед следи за определяне на лихвената си политика.',
    whyItMovesMarket: 'Високата инфлация намалява покупателната способност на хората и принуждава Фед да държи лихвите високи.',
    marketReaction: 'CPI над очакванията → Спад на акциите и скок на щатския долар. CPI под очакванията → Силно пазарно рали.',
    tradingViewSymbol: 'FRED:CPIAUCSL',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-CPIAUCSL/',
    source: 'US Bureau of Labor Statistics'
  },
  {
    id: 4,
    title: '4. Инфлация на производителите (PPI - Producer Price Index)',
    englishTitle: 'Producer Price Index (PPI)',
    schedule: 'Всеки месец (1 ден след доклада за CPI)',
    nextDateDesc: 'Следващи данни: Инфлация на цените на едро',
    impact: 'HIGH',
    shortSummary: 'Измерва промяната в цените на едро. Водещ ранен индикатор за бъдещата потребителска инфлация.',
    description: 'PPI измерва цените, които производителите и фабриките получават за своите стоки. Покачването на техните разходи преминава към крайните потребители с закъснение от 1-2 месеца.',
    whyItMovesMarket: 'Дава ранен сигнал за това накъде ще се движи инфлацията при следващите CPI доклади.',
    marketReaction: 'Висок PPI → Риск от бъдеща висока инфлация. Нисък PPI → Спокойствие за бизнеса.',
    tradingViewSymbol: 'FRED:PPIACO',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-PPIACO/',
    source: 'US Bureau of Labor Statistics'
  },
  {
    id: 5,
    title: '5. Брутен Вътрешен Продукт (GDP Growth Rate / БВП)',
    englishTitle: 'Gross Domestic Product (GDP)',
    schedule: 'Тримесечно (Advance, Second, Final - края на всеки месец)',
    nextDateDesc: 'Следващи данни: Тримесечен доклад за БВП',
    impact: 'HIGH',
    shortSummary: 'Измерва общия икономически растеж на страната. БВП = всичко произведено и продадено.',
    description: 'БВП е сумата от цялото производство, потребление и инвестиции в икономиката. Показна дали икономиката експандира или навлиза в рецесия (2 поредни тримесечия спад).',
    whyItMovesMarket: 'Умереният растеж е перфектен за акциите („Goldilocks economy“). Спадът сигнализира рецесия, а прекаленият растеж — прегряване.',
    marketReaction: 'Стабилен БВП (2% - 3%) → Силна подкрепа за индексите S&P 500 и Dow Jones.',
    tradingViewSymbol: 'FRED:GDP',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-GDP/',
    source: 'US Bureau of Economic Analysis (BEA)'
  },
  {
    id: 6,
    title: '6. Продажби на дребно (Retail Sales)',
    englishTitle: 'Retail Sales',
    schedule: 'Всеки месец около 15-то число (15:30 ч. БГ време)',
    nextDateDesc: 'Следващи данни: Месечни продажби на дребно',
    impact: 'HIGH',
    shortSummary: 'Потреблението е 70% от БВП на САЩ. Показва дали хората пазаруват или затягат коланите.',
    description: 'Retail Sales измерва общите продажби в магазини, бензиностанции, ресторанти и онлайн търговци (Amazon, Walmart, Target).',
    whyItMovesMarket: 'Изключително бърз реален индикатор за джоба на потребителя, излизащ преди тримесечните данни за БВП.',
    marketReaction: 'Ръст на продажбите → По-високи печалби за потребителските компании.',
    tradingViewSymbol: 'FRED:RSAFS',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-RSAFS/',
    source: 'US Census Bureau'
  },
  {
    id: 7,
    title: '7. Потребителско доверие (Consumer Confidence Index - CCI)',
    englishTitle: 'Consumer Confidence Index (CCI)',
    schedule: 'Последен вторник от месеца (17:00 ч. БГ време)',
    nextDateDesc: 'Следващи данни: Доклад за потребителското доверие',
    impact: 'MEDIUM',
    shortSummary: 'Показва колко уверени са хората за икономиката и личните си финанси за следващите 6 месеца.',
    description: 'Анкета сред хиляди домакинства относно настоящото им състояние, перспективите за работа и бъдещите им планове за пазаруване.',
    whyItMovesMarket: 'Оптимистичните потребители харчат повече пари и вземат кредити. Песимизмът предвещава забавяне.',
    marketReaction: 'Висок CCI index → Позитивно за търговията на дребно и автопроизводителите.',
    tradingViewSymbol: 'FRED:UMCSENT',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-UMCSENT/',
    source: 'The Conference Board / University of Michigan'
  },
  {
    id: 8,
    title: '8. Пазар на имоти (Housing Starts & Building Permits)',
    englishTitle: 'Housing Starts & Building Permits',
    schedule: 'Всеки месец между 16-то и 19-то число',
    nextDateDesc: 'Следващи данни: Строителни разрешителни и започнати жилища',
    impact: 'MEDIUM',
    shortSummary: 'Разрешителни за строеж и започнати жилища. Водещ икономически индикатор за циклите.',
    description: 'Показател за новозапочнатото строителство и издадените разрешителни за нови сгради. Строителството завлича банкови кредити, ипотеки, мебели и уреди.',
    whyItMovesMarket: 'Спадът в имотния сектор исторически изпреварва и сигнализира за наближаващи икономически спадове.',
    marketReaction: 'Силно строителство → Подкрепа за ипотечните кредитори и строителните компании.',
    tradingViewSymbol: 'FRED:PERMIT',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-PERMIT/',
    source: 'US Census Bureau / HUD'
  },
  {
    id: 9,
    title: '9. Индекс на страха (VIX - Volatility Index)',
    englishTitle: 'CBOE Volatility Index (VIX)',
    schedule: 'В реално време (Всеки търговски ден при затваряне)',
    nextDateDesc: 'Следващо затваряне на борсата (NYSE / Nasdaq 23:00 ч.)',
    impact: 'HIGH',
    shortSummary: 'Измерва очакваната волатилност за следващите 30 дни от опциите върху S&P 500.',
    description: 'Когато инвеститорите панически купуват застрахователни PUT опции, VIX скача. Наричан е "Индексът на страха".',
    whyItMovesMarket: 'VIX > 30 = Екстремен страх и паника на пазара. VIX < 15 = Спокойствие, самодоволство и алчност.',
    marketReaction: 'Скок на VIX → Обикновено съвпада с остри разпродажби на S&P 500 и Nasdaq.',
    tradingViewSymbol: 'CBOE:VIX',
    tradingViewUrl: 'https://www.tradingview.com/symbols/CBOE-VIX/',
    source: 'Chicago Board Options Exchange (CBOE)'
  },
  {
    id: 10,
    title: '10. Корпоративни печалби (Earnings Reports & Guidance)',
    englishTitle: 'Corporate Earnings Season',
    schedule: 'Всяко тримесечие (Пик на Earnings Season)',
    nextDateDesc: 'Следващ пиков ден за отчети на технологичните гиганти',
    impact: 'CRITICAL',
    shortSummary: 'Тримесечните отчети на технологичните гиганти (Apple, Nvidia, Microsoft) и техните бъдещи прогнози.',
    description: 'Финансовите резултати за приходи, печалба на акция (EPS) и най-важното — прогнозата на мениджмънта за следващите тримесечия (Guidance).',
    whyItMovesMarket: 'Цените на акциите в дългосрочен план следват реалните печалби. Слабо Guidance движи целия сектор надолу.',
    marketReaction: 'Отчет над очакванията + силен Guidance → Ръст от 5% до 15% за акцията за ден.',
    tradingViewSymbol: 'NASDAQ:AAPL',
    tradingViewUrl: 'https://www.tradingview.com/economic-calendar/',
    source: 'SEC Filings (10-Q / 10-K)'
  }
];

interface TimeLeft {
  d: number;
  h: number;
  m: number;
  s: number;
}

export default function WhatMovesTheMarket() {
  const [selectedIndicator, setSelectedIndicator] = useState<MarketIndicator | null>(null);
  const [timersMap, setTimersMap] = useState<Record<number, TimeLeft>>({});

  useEffect(() => {
    // Exact release target dates for all 10 economic indicators
    const TARGET_DATES: Record<number, Date> = {
      1: new Date('2026-09-16T18:00:00Z'), // FOMC Rate Decision
      2: new Date('2026-08-07T12:30:00Z'), // NFP Employment Report
      3: new Date('2026-08-12T12:30:00Z'), // CPI Inflation
      4: new Date('2026-08-13T12:30:00Z'), // PPI Inflation
      5: new Date('2026-08-27T12:30:00Z'), // GDP Growth Rate
      6: new Date('2026-08-14T12:30:00Z'), // Retail Sales
      7: new Date('2026-08-25T14:00:00Z'), // Consumer Confidence (CCI)
      8: new Date('2026-08-18T12:30:00Z'), // Housing Starts & Permits
      9: new Date('2026-07-31T20:00:00Z'), // VIX Market Close
      10: new Date('2026-08-04T20:00:00Z'), // Big Tech Earnings Peak
    };

    const updateAllTimers = () => {
      const now = new Date();
      const newMap: Record<number, TimeLeft> = {};

      Object.entries(TARGET_DATES).forEach(([idStr, target]) => {
        const id = Number(idStr);
        let diff = target.getTime() - now.getTime();
        
        // If passed, add 30 days rolling target
        if (diff <= 0) {
          diff = 30 * 24 * 3600 * 1000 + diff;
        }

        newMap[id] = {
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60)
        };
      });

      setTimersMap(newMap);
    };

    updateAllTimers();
    const interval = setInterval(updateAllTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  const getImpactBadge = (impact: MarketIndicator['impact']) => {
    switch (impact) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1 shrink-0">
            <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
            Критично (🔴🔴🔴)
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1 shrink-0">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            Високо (🔴🔴)
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/40 shrink-0">
            Средно (🟡)
          </span>
        );
    }
  };

  const renderTimerBadge = (id: number) => {
    const t = timersMap[id];
    if (!t) return <span className="text-[10px] text-ink-faint">Зареждане...</span>;

    return (
      <div className="flex items-center gap-1 font-sans tabular-nums text-xs font-black text-indigo-400">
        <div className="bg-bg/90 border border-indigo-500/30 px-1 py-0.5 rounded shadow-2xs">
          {String(t.d).padStart(2, '0')}д
        </div>
        :
        <div className="bg-bg/90 border border-indigo-500/30 px-1 py-0.5 rounded shadow-2xs">
          {String(t.h).padStart(2, '0')}ч
        </div>
        :
        <div className="bg-bg/90 border border-indigo-500/30 px-1 py-0.5 rounded shadow-2xs">
          {String(t.m).padStart(2, '0')}м
        </div>
        :
        <div className="bg-bg/90 border border-indigo-500/30 px-1 py-0.5 rounded shadow-2xs">
          {String(t.s).padStart(2, '0')}с
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 mt-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/40 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-indigo-500 rounded-full" />
            <h2 className="text-base sm:text-lg font-black text-ink uppercase tracking-tight">
              КАКВО ДВИЖИ ПАЗАРА
            </h2>
          </div>
          <p className="text-xs text-ink-faint mt-1">
            Икономически календар и 10-те основни макроикономически индикатора с директни линкове към TradingView.
          </p>
        </div>

        {/* Featured Live FOMC Countdown Badge in Header */}
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-2 rounded-2xl shrink-0 self-start md:self-auto">
          <Clock className="w-4 h-4 text-indigo-400 animate-spin-slow shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              Следващо решение за лихвите (FOMC Rate Decision):
            </span>
            {renderTimerBadge(1)}
          </div>
        </div>
      </div>

      {/* Grid of 10 Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {INDICATORS_DATA.map((ind) => (
          <div
            key={ind.id}
            className={`bg-bg/40 hover:bg-bg/80 border rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 group relative ${
              ind.id === 1 ? 'border-indigo-500/60 bg-indigo-500/5' : 'border-border/60 hover:border-indigo-500/50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wide">
                  {ind.englishTitle}
                </span>
                {getImpactBadge(ind.impact)}
              </div>

              <h3 className="text-xs font-extrabold text-ink leading-snug mb-1.5 group-hover:text-indigo-400 transition-colors">
                {ind.title}
              </h3>

              <div className="text-[11px] text-ink-muted leading-relaxed line-clamp-3 mb-2">
                {ind.shortSummary}
              </div>

              {/* Dedicated Countdown Timer for EVERY SINGLE Indicator Card */}
              <div className="my-2 p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col gap-1">
                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                  Оставащо време до доклада:
                </span>
                {renderTimerBadge(ind.id)}
              </div>
            </div>

            <div>
              <div className="pt-2.5 border-t border-border/20 flex items-center justify-between gap-1.5 text-[10px] font-sans tabular-nums">
                <span className="text-ink-faint flex items-center gap-1 font-semibold truncate">
                  <Calendar className="w-3 h-3 text-indigo-400 shrink-0" />
                  {ind.schedule.split('(')[0]}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Direct TradingView Link Button */}
                  <a
                    href={ind.tradingViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-all border border-indigo-500/30 cursor-pointer"
                    title={`Отвори ${ind.englishTitle} в TradingView`}
                  >
                    <span>TradingView</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {/* Info Icon (i) button */}
                  <button
                    onClick={() => setSelectedIndicator(ind)}
                    className="w-7 h-7 rounded-xl bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-indigo-500/30"
                    title="Виж пълна информация за индикатора"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Modal Popup for Indicator Info */}
      {selectedIndicator && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedIndicator(null); }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-bg/80 backdrop-blur-md font-sans"
        >
          <div className="w-full max-w-2xl bg-card border-2 border-indigo-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedIndicator(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-ink hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer"
              title="Затвори"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide block">
                  {selectedIndicator.englishTitle}
                </span>
                <h3 className="text-base sm:text-lg font-black text-ink leading-tight">
                  {selectedIndicator.title}
                </h3>
              </div>
            </div>

            {/* Live countdown timer inside Modal */}
            <div className="my-3 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                Таймер до публикуването на данните:
              </span>
              {renderTimerBadge(selectedIndicator.id)}
            </div>

            <div className="space-y-3.5 mt-4 text-xs leading-relaxed">
              <div className="bg-bg/60 p-3 rounded-2xl border border-border/40">
                <span className="font-extrabold text-indigo-400 block uppercase mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Кога и как често излизат данните?
                </span>
                <p className="text-ink font-semibold">{selectedIndicator.schedule}</p>
                <p className="text-ink-faint mt-1 text-[11px]">{selectedIndicator.nextDateDesc}</p>
              </div>

              <div className="bg-bg/60 p-3 rounded-2xl border border-border/40">
                <span className="font-extrabold text-ink block uppercase mb-1">
                  💡 Какво представлява този индикатор?
                </span>
                <p className="text-ink-muted">{selectedIndicator.description}</p>
              </div>

              <div className="bg-bg/60 p-3 rounded-2xl border border-border/40">
                <span className="font-extrabold text-amber-400 block uppercase mb-1">
                  🚀 Защо движи пазара?
                </span>
                <p className="text-ink-muted">{selectedIndicator.whyItMovesMarket}</p>
              </div>

              <div className="bg-bg/60 p-3 rounded-2xl border border-border/40">
                <span className="font-extrabold text-emerald-400 block uppercase mb-1">
                  📈 Как реагират акциите при новите данни?
                </span>
                <p className="text-ink-muted">{selectedIndicator.marketReaction}</p>
              </div>

              {/* Bottom Action Footer with Direct TradingView Button */}
              <div className="pt-3 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-ink-faint">
                  Източник: <strong className="text-ink">{selectedIndicator.source}</strong>
                </div>

                <a
                  href={selectedIndicator.tradingViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <span>Отвори {selectedIndicator.englishTitle} в TradingView</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
