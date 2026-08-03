import React, { useState, useEffect } from 'react';
import { Stock, TableFilter } from '../types';
import { ArrowUpRight, ArrowDownRight, Info, Clock, ExternalLink, HelpCircle, X, Flame, AlertCircle } from 'lucide-react';
import { EconomicCalendar } from 'react-ts-tradingview-widgets';
import CmeFedWatchModal, { getNextFomcMeeting } from './CmeFedWatchModal';

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
    title: '1. CPI (Consumer Price Index)',
    englishTitle: 'Consumer Price Index (CPI Inflation)',
    schedule: 'Всеки месец между 12-то и 14-то число (15:30 ч. БГ време)',
    nextDateDesc: 'Следващ доклад за инфлацията (CPI)',
    impact: 'CRITICAL',
    shortSummary: 'Измерва средната промяна в цените на стоки и услуги, които потребителите купуват – храна, дрехи, транспорт, жилища, енергия и др.',
    description: 'Измерва средната промяна в цените на стоки и услуги, които потребителите купуват – храна, дрехи, транспорт, жилища, енергия и др. Главният показател за потребителската инфлация.',
    whyItMovesMarket: 'Ако CPI е по-висок от очакваното → инвеститорите се притесняват, че ФЕД ще задържи или ще вдигне лихвите → акциите падат. Ако CPI е по-нисък от очакваното → надежда за намаление на лихвите → пазарът скача.',
    marketReaction: 'CPI над очакванията → спад на акциите и скок на щатския долар. CPI под очакванията → силно пазарно рали.',
    tradingViewSymbol: 'FRED:CPIAUCSL',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-CPIAUCSL/',
    source: 'US Bureau of Labor Statistics (BLS)'
  },
  {
    id: 2,
    title: '2. Core CPI (Основен CPI)',
    englishTitle: 'Core Consumer Price Index',
    schedule: 'Всеки месец (заедно с CPI)',
    nextDateDesc: 'Следващ доклад за базовата инфлация',
    impact: 'CRITICAL',
    shortSummary: 'Същото като CPI, но изключва храни и енергия, защото са твърде волатилни и изкривяват общата картина.',
    description: 'Същото като CPI, но изключва храни и енергия, защото те са твърде волатилни (цените им се променят бързо и понякога изкривяват общата картина). ФЕД следи Core CPI като по-надежден показател за трайната тенденция на инфлацията.',
    whyItMovesMarket: 'Ако Core CPI остава висок → сигнал, че инфлацията е "вградена" в икономиката → ФЕД ще държи лихвите по-дълго високи.',
    marketReaction: 'Core CPI над очакванията → спад в акциите, особено в технологичния сектор.',
    tradingViewSymbol: 'FRED:CPILFESL',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-CPILFESL/',
    source: 'US Bureau of Labor Statistics (BLS)'
  },
  {
    id: 3,
    title: '3. PCE (Лични разходи)',
    englishTitle: 'Personal Consumption Expenditures (PCE)',
    schedule: 'Всеки месец около 28-мо число (15:30 ч. БГ време)',
    nextDateDesc: 'Следващ доклад за личните потребителски разходи',
    impact: 'CRITICAL',
    shortSummary: 'Алтернативна мярка за инфлацията, която се базира на реалните разходи на потребителите.',
    description: 'Алтернативна мярка за инфлацията, базирана на реалните разходи. CPI гледа фиксирана кошница от стоки и услуги. PCE взема предвид, че хората променят поведението си, когато цените се покачват (например купуват пилешко вместо говеждо). Затова PCE обикновено показва по-ниска инфлация от CPI.',
    whyItMovesMarket: 'PCE под очакванията = пазарен оптимизъм, защото ФЕД може да намали лихвите. PCE над очакванията = притеснение, че инфлацията остава висока.',
    marketReaction: 'PCE под очакванията → рали на борсата. PCE над очакванията → притеснение и корекция.',
    tradingViewSymbol: 'FRED:PCE',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-PCE/',
    source: 'US Bureau of Economic Analysis (BEA)'
  },
  {
    id: 4,
    title: '4. Core PCE (Основен PCE)',
    englishTitle: 'Core PCE Price Index',
    schedule: 'Всеки месец (заедно с PCE)',
    nextDateDesc: 'Любимият индикатор на ФЕД (Цел: 2%)',
    impact: 'CRITICAL',
    shortSummary: 'Любимият индикатор на ФЕД за измерване на трайната инфлация (без храни и енергия). Търсят го да е 2%.',
    description: 'Същото като PCE, но без храни и енергия, както при Core CPI. Това е любимият индикатор на ФЕД за измерване на трайната инфлация. Търсят го да е 2%. Core PCE отразява по-добре устойчивата тенденция в цените на услуги и заплати. Инвеститорите я приемат като „финален сигнал“ какво ще направи централната банка.',
    whyItMovesMarket: 'ФЕД често споменава точно тази метрика в своите речи. Инвеститорите я приемат като „финален сигнал“ за лихвената политика.',
    marketReaction: 'Ако Core PCE е близо до 2% → bullish сигнал за акциите. Ако Core PCE се задържа над 3% → bearish сигнал.',
    tradingViewSymbol: 'FRED:PCEPILFE',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-PCEPILFE/',
    source: 'US Bureau of Economic Analysis (BEA)'
  },
  {
    id: 5,
    title: '5. Лихви на ФЕД (Fed Funds Rate)',
    englishTitle: 'Federal Funds Rate & Dual Mandate',
    schedule: 'На всеки 6 седмици (Сряда 21:00 ч. БГ време / 8 пъти годишно)',
    nextDateDesc: 'Следващо заседание на ФЕД (FOMC)',
    impact: 'CRITICAL',
    shortSummary: 'Основната лихва, по която банките си отпускат пари. ФЕД има двойна цел: 1. Ценова стабилност (2%), 2. Пълна заетост.',
    description: 'Основната лихва, по която банките си отпускат пари помежду си. Двойна цел на ФЕД („dual mandate“): 1. Ценова стабилност → инфлацията около 2%. 2. Пълна заетост → ниска безработица. Лихвите са основният инструмент: ако икономиката прегрява → повишават лихвите; ако се охлажда → понижават лихвите.',
    whyItMovesMarket: 'По-високи лихви = по-скъп кредит, по-ниска потребителска активност и корпоративни печалби. Ниски лихви = евтини пари и растящи акции.',
    marketReaction: 'Nasdaq и технологичните компании са най-чувствителни на промени в лихвите.',
    tradingViewSymbol: 'FRED:FEDFUNDS',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-FEDFUNDS/',
    source: 'Federal Reserve (Федерален резерв на САЩ)'
  },
  {
    id: 6,
    title: '6. Данни за заетостта (NFP & Unemployment)',
    englishTitle: 'Employment Situation Summary',
    schedule: 'Всеки първи петък от месеца (15:30 ч. БГ време)',
    nextDateDesc: 'Следващ месечен доклад за пазара на труда',
    impact: 'CRITICAL',
    shortSummary: 'Месечен доклад за новите работни места и безработицата в САЩ.',
    description: 'Месечен доклад за новите работни места и безработицата в САЩ. Силният пазар на труда = икономиката е стабилна, но и риск от инфлационен натиск → страх от повишение на лихвите.',
    whyItMovesMarket: '„Добра новина“ може да е „лоша новина“: ако работните места растат твърде бързо, пазарът пада от страх за нови повишения на лихвите.',
    marketReaction: 'Прекалено силна заетост → страх от лихвени повишения. Умерен ръст → стабилност.',
    tradingViewSymbol: 'FRED:PAYEMS',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-PAYEMS/',
    source: 'US Bureau of Labor Statistics (BLS)'
  },
  {
    id: 7,
    title: '7. Non-Farm Payrolls (NFP)',
    englishTitle: 'Non-Farm Payrolls (NFP)',
    schedule: 'Всеки първи петък от месеца (15:30 ч. БГ време)',
    nextDateDesc: 'Нови работни места извън селското стопанство',
    impact: 'HIGH',
    shortSummary: 'Измерва новите работни места в частния сектор и индустрията — сърцето на икономиката.',
    description: 'Измерва колко нови работни места са създадени в икономиката на САЩ през изминалия месец, без да включва: фермерите, държавните служители, домашните помощници и служителите в НПО. Показва реалната заетост в частния сектор и индустрията — сърцето на икономиката.',
    whyItMovesMarket: 'Реалната заетост извън селското стопанство е основният двигател за потребителските разходи в САЩ.',
    marketReaction: 'NFP над очакванията → скок на долара и притеснение за задържане на високи лихви.',
    tradingViewSymbol: 'FRED:PAYEMS',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-PAYEMS/',
    source: 'US Bureau of Labor Statistics (BLS)'
  },
  {
    id: 8,
    title: '8. Unemployment Rate (Безработица)',
    englishTitle: 'Unemployment Rate (U-3)',
    schedule: 'Всеки първи петък от месеца (15:30 ч. БГ време)',
    nextDateDesc: 'Процент на безработицата в САЩ',
    impact: 'HIGH',
    shortSummary: 'Процентът от работната сила, които нямат работа, но активно я търсят.',
    description: 'Измерва процента от активната работна сила, които са без работа, но активно търсят такава. Един от основните стълбове в двойния мандат на ФЕД за пълна заетост.',
    whyItMovesMarket: 'Силният пазар на труда и ниската безработица са знак за здрава икономика, но ако безработицата е твърде ниска (<3.5%), води до бърз ръст на заплатите и инфлация.',
    marketReaction: 'Безработица над очакванията → риск от забавяне, но и натиск върху ФЕД за намаляване на лихвите.',
    tradingViewSymbol: 'FRED:UNRATE',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-UNRATE/',
    source: 'US Bureau of Labor Statistics (BLS)'
  },
  {
    id: 9,
    title: '9. Данни за БВП (GDP Growth Rate)',
    englishTitle: 'Gross Domestic Product (GDP)',
    schedule: 'Тримесечно (в края на всеки месец 15:30 ч. БГ време)',
    nextDateDesc: 'Следващ доклад за растежа на БВП',
    impact: 'HIGH',
    shortSummary: 'Брутният вътрешен продукт измерва общата стойност на всички стоки и услуги. Всичко създадено, продадено и потребено.',
    description: 'Брутният вътрешен продукт (Gross Domestic Product, GDP) измерва общата стойност на всички стоки и услуги, произведени в една икономика за даден период. БВП = всичко, което се създава, продава и потребява в рамките на страната. Измерва икономическия растеж.',
    whyItMovesMarket: 'Бърз растеж = по-добри печалби за компаниите → пазарът расте. Но прекалено бърз растеж може да означава прегряване и бъдещо повишение на лихвите.',
    marketReaction: 'Златната среда: Умерен растеж без висока инфлация е най-благоприятен за пазара.',
    tradingViewSymbol: 'FRED:GDP',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-GDP/',
    source: 'US Bureau of Economic Analysis (BEA)'
  },
  {
    id: 10,
    title: '10. Retail Sales (Продажби на дребно)',
    englishTitle: 'Retail Sales',
    schedule: 'Всеки месец около 15-то число (15:30 ч. БГ време)',
    nextDateDesc: 'Следващ доклад за продажбите на дребно',
    impact: 'HIGH',
    shortSummary: 'Потреблението = 70% от БВП на САЩ. Ранен индикатор в реално време за джоба на потребителя.',
    description: 'Retail Sales измерва общия обем на продажбите в търговията на дребно в САЩ за даден месец – от големи търговски вериги до бензиностанции, ресторанти и онлайн магазини. Потреблението = 70% от БВП на САЩ. Ранен индикатор за джоба на потребителя, който предхожда данните за БВП.',
    whyItMovesMarket: 'Ако продажбите растат силно → повече търсене → натиск върху цените → риск от ново покачване на лихвите. Ако се забавят → сигнал за охлаждане → ФЕД може да облекчи политиката.',
    marketReaction: 'Ръст на продажбите → по-високи печалби за потребителските компании, но и риск за инфлация.',
    tradingViewSymbol: 'FRED:RSAFS',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-RSAFS/',
    source: 'US Census Bureau'
  },
  {
    id: 11,
    title: '11. Consumer Confidence (Потребителско доверие)',
    englishTitle: 'Consumer Confidence Index (CCI)',
    schedule: 'Последен вторник от месеца (17:00 ч. БГ време)',
    nextDateDesc: 'Индекс на потребителското доверие (CCI)',
    impact: 'MEDIUM',
    shortSummary: 'Измерва колко уверени са потребителите относно икономиката, личните си финанси и следващите 6 месеца.',
    description: 'Consumer Confidence Index (CCI) измерва колко уверени и оптимистично настроени са потребителите относно: настоящото състояние на икономиката, личните им финанси и перспективите за следващите 6 месеца.',
    whyItMovesMarket: 'Оптимистичните потребители харчат повече пари и вземат кредити. Песимизмът предвещава забавяне.',
    marketReaction: 'Висок CCI → позитивно за търговците на дребно и автопроизводителите.',
    tradingViewSymbol: 'FRED:UMCSENT',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-UMCSENT/',
    source: 'The Conference Board / University of Michigan'
  },
  {
    id: 12,
    title: '12. Пазар на имоти (Housing Starts & Permits)',
    englishTitle: 'Housing Starts, Building Permits, Mortgage Rates',
    schedule: 'Всеки месец между 16-то и 19-то число',
    nextDateDesc: 'Строителни разрешителни и ипотечни лихви',
    impact: 'MEDIUM',
    shortSummary: 'Показатели за активността в жилищното строителство. Водещ индикатор — забавянето му сигнализира спад.',
    description: 'Показатели за активността в жилищното строителство (Housing Starts, Building Permits, Mortgage Rates). Имотният сектор е водещ икономически индикатор – забавянето му често сигнализира икономически спад.',
    whyItMovesMarket: 'Строителството завлича банкови кредити, ипотеки, мебели и уреди. Спадът в имотите изпреварва общите икономически спадове.',
    marketReaction: 'Силно строителство → подкрепа за строителните компании и банките.',
    tradingViewSymbol: 'FRED:PERMIT',
    tradingViewUrl: 'https://www.tradingview.com/symbols/FRED-PERMIT/',
    source: 'US Census Bureau / HUD'
  }
];

interface TimeLeft {
  d: number;
  h: number;
  m: number;
  s: number;
}

function getNextIndicatorDate(id: number, now: Date = new Date()): Date {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  switch (id) {
    case 1: // CPI
    case 2: // Core CPI
    {
      let date = new Date(Date.UTC(currentYear, currentMonth, 12, 12, 30, 0));
      if (date.getTime() <= now.getTime()) {
        date = new Date(Date.UTC(currentYear, currentMonth + 1, 12, 12, 30, 0));
      }
      return date;
    }
    case 3: // PCE
    case 4: // Core PCE
    {
      let date = new Date(Date.UTC(currentYear, currentMonth, 28, 12, 30, 0));
      if (date.getTime() <= now.getTime()) {
        date = new Date(Date.UTC(currentYear, currentMonth + 1, 28, 12, 30, 0));
      }
      return date;
    }
    case 5: // FOMC Fed Rates
    {
      return getNextFomcMeeting(now).date;
    }
    case 6: // Employment Situation
    case 7: // NFP
    case 8: // Unemployment Rate
    {
      const getFirstFriday = (y: number, m: number) => {
        let d = new Date(Date.UTC(y, m, 1, 12, 30, 0));
        while (d.getUTCDay() !== 5) {
          d.setUTCDate(d.getUTCDate() + 1);
        }
        return d;
      };
      let date = getFirstFriday(currentYear, currentMonth);
      if (date.getTime() <= now.getTime()) {
        date = getFirstFriday(currentYear, currentMonth + 1);
      }
      return date;
    }
    case 9: // GDP Growth Rate
    {
      const gdpMonths = [0, 3, 6, 9];
      for (const m of gdpMonths) {
        const date = new Date(Date.UTC(currentYear, m, 27, 12, 30, 0));
        if (date.getTime() > now.getTime()) return date;
      }
      return new Date(Date.UTC(currentYear + 1, 0, 27, 12, 30, 0));
    }
    case 10: // Retail Sales
    {
      let date = new Date(Date.UTC(currentYear, currentMonth, 14, 12, 30, 0));
      if (date.getTime() <= now.getTime()) {
        date = new Date(Date.UTC(currentYear, currentMonth + 1, 14, 12, 30, 0));
      }
      return date;
    }
    case 11: // Consumer Confidence (CCI)
    {
      const getLastTuesday = (y: number, m: number) => {
        let d = new Date(Date.UTC(y, m + 1, 0, 14, 0, 0));
        while (d.getUTCDay() !== 2) {
          d.setUTCDate(d.getUTCDate() - 1);
        }
        return d;
      };
      let date = getLastTuesday(currentYear, currentMonth);
      if (date.getTime() <= now.getTime()) {
        date = getLastTuesday(currentYear, currentMonth + 1);
      }
      return date;
    }
    case 12: // Housing Starts & Permits
    {
      let date = new Date(Date.UTC(currentYear, currentMonth, 18, 12, 30, 0));
      if (date.getTime() <= now.getTime()) {
        date = new Date(Date.UTC(currentYear, currentMonth + 1, 18, 12, 30, 0));
      }
      return date;
    }
    default:
      return new Date(now.getTime() + 30 * 24 * 3600 * 1000);
  }
}

export default function MarketSummaryWidgets({ stocks, activeFilter, onSetActiveFilter }: Props) {
  const [fomcTimeLeft, setFomcTimeLeft] = useState<TimeLeft | null>(null);
  const [nextFomcLabel, setNextFomcLabel] = useState<string>('');
  const [showCmeModal, setShowCmeModal] = useState<boolean>(false);
  const [timersMap, setTimersMap] = useState<Record<number, TimeLeft>>({});
  const [selectedIndicator, setSelectedIndicator] = useState<MarketIndicator | null>(null);

  // FOMC Timer & All Indicators Timers Engine
  useEffect(() => {
    const updateTimers = () => {
      const now = new Date();
      
      // Dynamic FOMC Meeting Timer Calculation
      const nextFomc = getNextFomcMeeting(now);
      setNextFomcLabel(nextFomc.label);

      const fomcDiff = nextFomc.date.getTime() - now.getTime();
      if (fomcDiff > 0) {
        setFomcTimeLeft({
          d: Math.floor(fomcDiff / (1000 * 60 * 60 * 24)),
          h: Math.floor((fomcDiff / (1000 * 60 * 60)) % 24),
          m: Math.floor((fomcDiff / 1000 / 60) % 60),
          s: Math.floor((fomcDiff / 1000) % 60)
        });
      }

      // Dynamic calculation for all 12 Macroeconomic Indicators
      const newMap: Record<number, TimeLeft> = {};
      INDICATORS_DATA.forEach((ind) => {
        const target = getNextIndicatorDate(ind.id, now);
        const diff = Math.max(0, target.getTime() - now.getTime());
        newMap[ind.id] = {
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

          {/* Useful Link 2: CME FedWatch Tool with Dynamic FOMC Countdown */}
          <div 
            onClick={() => setShowCmeModal(true)}
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

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Info Button (i) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCmeModal(true);
                  }}
                  className="p-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-all"
                  title="Подробен график на срещите на FOMC и вероятности"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                <a
                  href="https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded-lg hover:bg-white/10 text-ink-faint hover:text-indigo-400 transition-all"
                  title="Отвори сайта на CME Group"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            
            {/* FOMC Countdown Strip */}
            <div className="mt-2 pt-2 border-t border-border/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-[10px] text-ink-faint font-semibold uppercase tracking-wider shrink-0" title={nextFomcLabel}>
                FOMC ({nextFomcLabel}):
              </span>
              <div className="shrink-0">{renderTimerBadge(fomcTimeLeft || undefined)}</div>
            </div>
          </div>

          {/* Section Divider */}
          <div className="pt-2 border-t border-border/30">
            <span className="text-[11px] font-extrabold uppercase text-white tracking-wider block mb-1">
              Макроикономически Индикатори
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

      {/* CME FedWatch Modal with Full Schedule of Meetings (срещите след доста дни) */}
      {showCmeModal && (
        <CmeFedWatchModal onClose={() => setShowCmeModal(false)} />
      )}
    </div>
  );
}
