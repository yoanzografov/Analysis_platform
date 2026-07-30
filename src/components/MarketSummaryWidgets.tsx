import React, { useState, useEffect } from 'react';
import { Stock, TableFilter } from '../types';
import { ArrowUpRight, ArrowDownRight, Info, Clock, ExternalLink, HelpCircle, X, Flame, AlertCircle } from 'lucide-react';
import { EconomicCalendar } from 'react-ts-tradingview-widgets';

interface Props {
  stocks: Stock[];
  activeFilter: TableFilter;
  onSetActiveFilter: (filter: TableFilter) => void;
}

interface CnnData {
  fear_and_greed: {
    score: number;
    rating: string;
    timestamp: string;
  };
  market_volatility_vix: {
    rating: string;
    data: { x: number; y: number; rating: string }[];
  };
  market_volatility_vix_50: {
    data: { x: number; y: number; rating: string }[];
  };
}

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
    title: '1. Лихвени проценти (FOMC Rate)',
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
    title: '2. Заетост & Безработица (NFP)',
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
    title: '3. Потребителска Инфлация (CPI)',
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
    title: '4. Инфлация на едро (PPI)',
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
    title: '5. Брутен Вътрешен Продукт (БВП)',
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
    title: '6. Продажби на дребно (Retail)',
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
    title: '7. Потребителско доверие (CCI)',
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
    title: '8. Пазар на имоти (Permits)',
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
    title: '9. Индекс на страха (VIX Index)',
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
    title: '10. Корпоративни печалби (Earnings)',
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

export default function MarketSummaryWidgets({ stocks, activeFilter, onSetActiveFilter }: Props) {
  const [fomcTimeLeft, setFomcTimeLeft] = useState<TimeLeft | null>(null);
  const [timersMap, setTimersMap] = useState<Record<number, TimeLeft>>({});
  const [selectedIndicator, setSelectedIndicator] = useState<MarketIndicator | null>(null);

  // FOMC Timer & All Indicators Timers Engine
  useEffect(() => {
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

    const updateTimers = () => {
      const now = new Date();
      
      // FOMC Main Timer
      const fomcTarget = TARGET_DATES[1];
      const fomcDiff = fomcTarget.getTime() - now.getTime();
      if (fomcDiff > 0) {
        setFomcTimeLeft({
          d: Math.floor(fomcDiff / (1000 * 60 * 60 * 24)),
          h: Math.floor((fomcDiff / (1000 * 60 * 60)) % 24),
          m: Math.floor((fomcDiff / 1000 / 60) % 60),
          s: Math.floor((fomcDiff / 1000) % 60)
        });
      }

      // All 10 Indicators Timers
      const newMap: Record<number, TimeLeft> = {};
      Object.entries(TARGET_DATES).forEach(([idStr, target]) => {
        const id = Number(idStr);
        let diff = target.getTime() - now.getTime();
        if (diff <= 0) diff = 30 * 24 * 3600 * 1000 + diff;
        newMap[id] = {
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60)
        };
      });
      setTimersMap(newMap);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute Top 15 Gainers and Losers
  const top15Gainers = [...stocks]
    .filter(s => typeof s.dailyChangePct === 'number' && !isNaN(s.dailyChangePct))
    .sort((a, b) => b.dailyChangePct - a.dailyChangePct)
    .slice(0, 15);

  const top15Losers = [...stocks]
    .filter(s => typeof s.dailyChangePct === 'number' && !isNaN(s.dailyChangePct))
    .sort((a, b) => a.dailyChangePct - b.dailyChangePct)
    .slice(0, 15);

  const getImpactBadge = (impact: MarketIndicator['impact']) => {
    switch (impact) {
      case 'CRITICAL':
        return (
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-0.5 shrink-0">
            <Flame className="w-2.5 h-2.5 text-rose-400" />
            Критично
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-0.5 shrink-0">
            <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
            Високо
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
            Средно
          </span>
        );
    }
  };

  const renderTimerBadge = (t: TimeLeft | undefined) => {
    if (!t) return <span className="text-[10px] text-ink-faint font-mono">--:--:--:--</span>;
    return (
      <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-indigo-400 bg-bg/80 px-2 py-0.5 rounded-lg border border-indigo-500/30 shrink-0">
        <span>{String(t.d).padStart(2, '0')}д</span>
        <span className="text-ink-faint">:</span>
        <span>{String(t.h).padStart(2, '0')}ч</span>
        <span className="text-ink-faint">:</span>
        <span>{String(t.m).padStart(2, '0')}м</span>
        <span className="text-ink-faint">:</span>
        <span className="text-rose-400 animate-pulse">{String(t.s).padStart(2, '0')}с</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 font-sans">
      
      {/* 1. Top 15 Gainers Container */}
      <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col justify-between transition-all duration-200 h-[410px] hover:shadow-md relative group md:col-span-1">
        <div className="flex items-center justify-between border-b border-border/50 pb-2.5 shrink-0">
          <div>
            <h3 className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums tracking-tight flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-emerald-700" />
              Топ 15 Печеливши (Реално време)
            </h3>
            <p className="text-xs text-ink-faint font-sans tabular-nums mt-0.5">
              Акции с най-голям дневен ръст от портфолиото.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto my-2 pr-1 custom-mini-scroll">
          <div className="space-y-1">
            {top15Gainers.length > 0 ? (
              top15Gainers.map((item, idx) => {
                const isSelected = activeFilter.type === 'ticker' && activeFilter.value === item.ticker;
                return (
                  <div
                    key={item.ticker}
                    onClick={() => {
                      if (isSelected) {
                        onSetActiveFilter({ type: 'all', value: '' });
                      } else {
                        onSetActiveFilter({ type: 'ticker', value: item.ticker });
                      }
                    }}
                    className={`flex items-center justify-between p-1.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 font-bold' 
                        : 'border-border/30 bg-card/40 hover:bg-card-hover hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <span className="text-[10px] text-ink-faint w-4 font-mono">{idx + 1}.</span>
                      <span className="font-bold text-ink text-xs uppercase">{item.ticker}</span>
                      <span className="text-xs font-sans font-bold text-ink truncate max-w-[110px]" title={item.companyName}>
                        {item.companyName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-sans tabular-nums text-xs shrink-0">
                      <span className="text-ink-faint font-bold">${item.currentPrice.toFixed(2)}</span>
                      <span className="font-extrabold text-emerald-700">+{item.dailyChangePct.toFixed(2)}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-ink-faint font-sans tabular-nums py-8 text-center">Няма данни за печеливши акции.</p>
            )}
          </div>
        </div>

        <div className="border-t border-border/10 pt-2 text-xs font-sans tabular-nums text-ink/60 uppercase tracking-tight flex items-center justify-between shrink-0">
          <span>Кликни на акция за филтър</span>
          <span className="font-bold underline group-hover:text-[#10b981]">Топ Печеливши ({top15Gainers.length})</span>
        </div>
      </div>

      {/* 2. Top 15 Losers Container */}
      <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col justify-between transition-all duration-200 h-[410px] hover:shadow-md relative group md:col-span-1">
        <div className="flex items-center justify-between border-b border-border/50 pb-2.5 shrink-0">
          <div>
            <h3 className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums tracking-tight flex items-center gap-1.5">
              <ArrowDownRight className="w-4 h-4 text-red-700" />
              Топ 15 Губещи (Реално време)
            </h3>
            <p className="text-xs text-ink-faint font-sans tabular-nums mt-0.5">
              Акции с най-голям дневен спад от портфолиото.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto my-2 pr-1 custom-mini-scroll">
          <div className="space-y-1">
            {top15Losers.length > 0 ? (
              top15Losers.map((item, idx) => {
                const isSelected = activeFilter.type === 'ticker' && activeFilter.value === item.ticker;
                return (
                  <div
                    key={item.ticker}
                    onClick={() => {
                      if (isSelected) {
                        onSetActiveFilter({ type: 'all', value: '' });
                      } else {
                        onSetActiveFilter({ type: 'ticker', value: item.ticker });
                      }
                    }}
                    className={`flex items-center justify-between p-1.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-red-500/10 border-red-500/40 text-red-950 font-bold' 
                        : 'border-border/30 bg-card/40 hover:bg-card-hover hover:border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <span className="text-[10px] text-ink-faint w-4 font-mono">{idx + 1}.</span>
                      <span className="font-bold text-ink text-xs uppercase">{item.ticker}</span>
                      <span className="text-xs font-sans font-bold text-ink truncate max-w-[110px]" title={item.companyName}>
                        {item.companyName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-sans tabular-nums text-xs shrink-0">
                      <span className="text-ink-faint font-bold">${item.currentPrice.toFixed(2)}</span>
                      <span className="font-extrabold text-red-700">{item.dailyChangePct.toFixed(2)}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-ink-faint font-sans tabular-nums py-8 text-center">Няма данни за губещи акции.</p>
            )}
          </div>
        </div>

        <div className="border-t border-border/10 pt-2 text-xs font-sans tabular-nums text-ink/60 uppercase tracking-tight flex items-center justify-between shrink-0">
          <span>Кликни на акция за филтър</span>
          <span className="font-bold underline group-hover:text-[#f43f5e]">Топ Губещи ({top15Losers.length})</span>
        </div>
      </div>

      {/* 3. Combined "Какво движи пазара & Полезни връзки" Container (Clear layout, no overlapping!) */}
      <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col transition-all duration-200 h-[410px] hover:shadow-md relative group md:col-span-1">
        
        <div className="flex flex-col h-full overflow-y-auto custom-mini-scroll pr-1 gap-2.5">
          
          <div className="flex items-center justify-between border-b border-border/50 pb-2 shrink-0 sticky top-0 bg-bg z-10">
            <h3 className="text-xs uppercase font-extrabold text-ink font-sans tracking-tight flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Какво движи пазара
            </h3>
          </div>

          {/* Useful Link 1: Fear & Greed Index */}
          <a 
            href="https://edition.cnn.com/markets/fear-and-greed" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/50 bg-card/30 hover:bg-card-hover hover:border-indigo-500/40 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <img 
                src="https://www.google.com/s2/favicons?domain=cnn.com&sz=32" 
                alt="CNN" 
                className="w-4 h-4 rounded shrink-0 bg-white/10 p-0.5"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold text-ink group-hover:text-indigo-400 transition-colors truncate">
                  Fear & Greed Index (Страх & Алчност)
                </span>
                <span className="text-[10px] text-ink-faint font-mono">cnn.com</span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-ink-faint group-hover:text-indigo-400 shrink-0" />
          </a>

          {/* Useful Link 2: CME FedWatch Tool with FOMC Countdown */}
          <a 
            href="https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col p-2.5 rounded-xl border border-border/50 bg-card/30 hover:bg-card-hover hover:border-indigo-500/40 transition-all group cursor-pointer relative"
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <img 
                  src="https://www.google.com/s2/favicons?domain=cmegroup.com&sz=32" 
                  alt="CME" 
                  className="w-4 h-4 rounded shrink-0 bg-white/90 p-0.5"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-extrabold text-ink group-hover:text-indigo-400 transition-colors truncate">
                    CME FedWatch Tool
                  </span>
                  <span className="text-[10px] text-ink-faint font-mono">cmegroup.com</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-ink-faint group-hover:text-indigo-400 shrink-0" />
            </div>
            
            {/* FOMC Countdown Strip */}
            <div className="mt-2 pt-2 border-t border-border/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-[10px] text-ink-faint font-semibold uppercase tracking-wider shrink-0">
                FOMC заседание:
              </span>
              <div className="shrink-0">{renderTimerBadge(fomcTimeLeft || undefined)}</div>
            </div>
          </a>

          {/* Section Divider */}
          <div className="pt-2 border-t border-border/30">
            <span className="text-[11px] font-extrabold uppercase text-indigo-400 tracking-wider block mb-1">
              📊 10-те Макроикономически Индикатора (TradingView):
            </span>
          </div>

          {/* Render All 10 Indicators formatted WITH ZERO OVERLAPPING */}
          {INDICATORS_DATA.map((ind) => (
            <a
              key={ind.id}
              href={ind.tradingViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col p-2.5 rounded-xl border border-border/50 bg-card/30 hover:bg-card-hover hover:border-indigo-500/40 transition-all group cursor-pointer relative"
            >
              {/* Line 1: Favicon + Title + Info Button + External Link */}
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <img 
                    src="https://www.google.com/s2/favicons?domain=tradingview.com&sz=32" 
                    alt="TradingView" 
                    className="w-4 h-4 rounded shrink-0 bg-white/90 p-0.5"
                  />
                  <span className="text-xs font-extrabold text-ink group-hover:text-indigo-400 transition-colors truncate" title={ind.title}>
                    {ind.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Info Button (i) */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedIndicator(ind);
                    }}
                    className="w-6 h-6 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white flex items-center justify-center transition-all border border-indigo-500/30 cursor-pointer"
                    title="Виж подробности"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  <ExternalLink className="w-3.5 h-3.5 text-ink-faint group-hover:text-indigo-400" />
                </div>
              </div>

              {/* Line 2: Subtitle / Source & Impact Badge */}
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-[10px] text-ink-faint font-mono">tradingview.com</span>
                {getImpactBadge(ind.impact)}
              </div>

              {/* Line 3: Countdown Timer Strip */}
              <div className="mt-2 pt-2 border-t border-border/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-[10px] text-ink-faint font-semibold uppercase tracking-wider shrink-0">
                  До доклада:
                </span>
                <div className="shrink-0">{renderTimerBadge(timersMap[ind.id])}</div>
              </div>
            </a>
          ))}

          {/* Useful Link: TradingView Heat Map */}
          <a 
            href="https://www.tradingview.com/heatmap/stock/#%7B%22dataSource%22%3A%22SPX500%22%2C%22blockColor%22%3A%22change%22%2C%22blockSize%22%3A%22market_cap_basic%22%2C%22grouping%22%3A%22sector%22%7D" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/50 bg-card/30 hover:bg-card-hover hover:border-indigo-500/40 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <img 
                src="https://www.google.com/s2/favicons?domain=tradingview.com&sz=32" 
                alt="TradingView" 
                className="w-4 h-4 rounded shrink-0 bg-white/90 p-0.5"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold text-ink group-hover:text-indigo-400 transition-colors truncate">
                  TradingView Heat Map (Секторна карта)
                </span>
                <span className="text-[10px] text-ink-faint font-mono">tradingview.com</span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-ink-faint group-hover:text-indigo-400 shrink-0" />
          </a>

          {/* Market Drivers Section: TradingView Economic Calendar Widget */}
          <div className="flex flex-col gap-2 pt-3 border-t border-border/30 mt-2">
            <span className="text-xs uppercase font-extrabold text-ink tracking-wider">
              Икономически Календар (TradingView Widget)
            </span>
            <div className="w-full h-72 rounded-xl overflow-hidden border border-border relative">
              <EconomicCalendar
                colorTheme="dark"
                width="100%"
                height="100%"
                locale="en"
                countryFilter="us,eu"
                importanceFilter="0,1"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Info Modal Popup for Indicator Info */}
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
              {renderTimerBadge(timersMap[selectedIndicator.id])}
            </div>

            <div className="space-y-3.5 mt-4 text-xs leading-relaxed">
              <div className="bg-bg/60 p-3 rounded-2xl border border-border/40">
                <span className="font-extrabold text-indigo-400 block uppercase mb-1">
                  📅 Кога и колко често излизат данните?
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
