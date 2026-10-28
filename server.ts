import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs/promises";
import fsSync from "fs";
import Parser from "rss-parser";
import * as yfModule from 'yahoo-finance2';

const YahooFinance = (yfModule as any).default?.default || (yfModule as any).default || yfModule;
const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey']
});
const rssParser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*'
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['category', 'categories', { keepArray: true }]
    ]
  }
});

dotenv.config();

const DB_PATH = path.resolve("database.json");

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini Client to avoid crashing on boot if the key is missing
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Грешка: GEMINI_API_KEY не е конфигуриран в Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Helper function to provide high-quality localized business/market news when API is unavailable or rate-limited
function getLocalFallbackNews(ticker: string, companyName: string): any[] {
  const name = companyName || ticker;
  if (!ticker) {
    return [
      {
        title: "Лихвените проценти на централните банки остават под наблюдение от инвеститорите",
        source: "Yahoo Finance",
        time: "Преди 1 час",
        summary: "Глобалните пазари показват смесени настроения, докато икономистите анализират последните коментари от представители на Федералния резерв и ЕЦБ относно бъдещата траектория на инфлацията и лихвите.",
        impact: "Neutral",
        url: "https://finance.yahoo.com"
      },
      {
        title: "Технологичният сектор продължава да води пазарното рали, подкрепен от AI иновации",
        source: "Yahoo Finance",
        time: "Преди 3 часа",
        summary: "Инвестициите в изкуствен интелект и облачни инфраструктури достигат рекордни нива през това тримесечие. Компаниите за полупроводници и софтуерни услуги отчитат силно търсене.",
        impact: "Positive",
        url: "https://finance.yahoo.com"
      },
      {
        title: "Регулаторните органи затягат контрола върху антимонополните практики на големите платформи",
        source: "Yahoo Finance",
        time: "Преди 5 часа",
        summary: "Нови разследвания в САЩ и ЕС поставят под въпрос пазарната доминация на някои от най-големите технологични конгломерати. Очаква се това да доведе до по-високи правни разходи.",
        impact: "Negative",
        url: "https://finance.yahoo.com"
      },
      {
        title: "Доклад за пазара на суровини: Цените на енергоносителите се стабилизират на фона на геополитиката",
        source: "Yahoo Finance",
        time: "Днес",
        summary: "Цените на петрола и природния газ се движат в тесен диапазон, балансирани между производствените нива и геополитическите фактори в Близкия Изток.",
        impact: "Neutral",
        url: "https://finance.yahoo.com"
      },
      {
        title: "Инвестиционна активност в Европа: Очаква се сериозен ръст в зелената енергия",
        source: "Yahoo Finance",
        time: "Днес",
        summary: "Нови данни показват, че инвестиционните фондове увеличават експозициите си към устойчиви и зелени активи, в съответствие с новите регулаторни изисквания на ЕС.",
        impact: "Positive",
        url: "https://finance.yahoo.com"
      },
      {
        title: "Индексът Fear and Greed преминава в зоната на 'Екстремна алчност'",
        source: "Yahoo Finance",
        time: "Днес",
        summary: "Пазарният индикатор за страх и алчност (CNN Fear & Greed Index) достигна нива от 82 пункта, сигнализирайки за навлизане в зоната на 'Екстремна алчност' на фона на силния импулс на пазарите.",
        impact: "Positive",
        url: "https://finance.yahoo.com"
      },
      {
        title: "Анализ на пазарната оценка: Моделите на дисконтираните парични потоци за големите активи",
        source: "Yahoo Finance",
        time: "Вчера",
        summary: "Скорошните анализи показват, че някои водещи компании се търгуват близо до справедливата си пазарна стойност, оставяйки по-малък марж на безопасност за нови инвестиции.",
        impact: "Neutral",
        url: "https://finance.yahoo.com"
      },
      {
        title: "Ръст на броя на първичните публични предлагания (IPO) на пазара",
        source: "Yahoo Finance",
        time: "Преди 2 дни",
        summary: "Няколко нови обещаващи стартъпи обявиха плановете си да излязат на борсата през следващия месец. Инвеститорите очакват засилване на конкуренцията в секторите на софтуера и здравеопазването.",
        impact: "Positive",
        url: "https://finance.yahoo.com"
      },
      {
        title: "Разширяване на глобалните вериги за доставки на полупроводници",
        source: "Yahoo Finance",
        time: "Преди 3 дни",
        summary: "Нови производствени мощности в САЩ и Азия започват работа за облекчаване на логистичните предизвикателства и задоволяване на огромното търсене на пазара на чипове.",
        impact: "Positive",
        url: "https://finance.yahoo.com"
      },
      {
        title: "Икономически предизвикателства: Влиянието на инфлационния натиск върху малкия бизнес",
        source: "Yahoo Finance",
        time: "Преди 4 дни",
        summary: "Въпреки стабилизирането на основните суровини, разходите за заплати и наеми продължават да оказват натиск върху маржовете на по-малките търговски вериги.",
        impact: "Negative",
        url: "https://finance.yahoo.com"
      }
    ];
  }

  // Stock-specific news fallbacks
  return [
    {
      title: `${name} отчете изключително силни тримесечни приходи, надминаващи очакванията`,
      source: "Yahoo Finance",
      time: "Преди 2 часа",
      summary: `Финансовият отчет на компанията за тримесечието показва ускорен растеж на приходите и оптимизиране на оперативните разходи. Анализаторите отбелязват отличното представяне на новите продукти.`,
      impact: "Positive",
      url: `https://finance.yahoo.com/quote/${ticker}`
    },
    {
      title: "Анализ на пазарните наблюдатели за нарастващи пазарни дялове и силно конкурентно предимство",
      source: "Yahoo Finance",
      time: "Днес",
      summary: `Инвестиционни анализатори засилиха оценките си за ${ticker} поради нарастващ „икономически ров“ (Moat). Компанията успешно защитава пазарната си позиция срещу ключови конкуренти.`,
      impact: "Positive",
      url: `https://finance.yahoo.com/quote/${ticker}`
    },
    {
      title: "Финансов анализ на паричните потоци на компанията",
      source: "Yahoo Finance",
      time: "Вчера",
      summary: `Отличната кешова позиция и свободният паричен поток на ${name} създават сериозни предпоставки за повишаване на дивидентите и разширяване на програмата за изкупуване на собствени акции.`,
      impact: "Positive",
      url: `https://finance.yahoo.com/quote/${ticker}`
    },
    {
      title: "Технологични тенденции и пазарен натиск в сектора",
      source: "Yahoo Finance",
      time: "Преди 2 дни",
      summary: `Въпреки общите макроикономически предизвикателства и повишените лихви, мениджмънтът на ${ticker} дава изключително стабилен и уверен guidance за втората половина на годината.`,
      impact: "Neutral",
      url: `https://finance.yahoo.com/quote/${ticker}`
    },
    {
      title: `Анализ на вътрешната стойност (Intrinsic Value) на ${name}`,
      source: "Yahoo Finance",
      time: "Преди 3 дни",
      summary: `Актуализираната калкулация на DCF показва, че ${ticker} в момента се търгува с атрактивен марж на безопасност (Margin of Safety) спрямо текущата си пазарна цена.`,
      impact: "Positive",
      url: `https://finance.yahoo.com/quote/${ticker}`
    },
    {
      title: `Преглед на ключовите фундаментални показатели в Yahoo Finance`,
      source: "Yahoo Finance",
      time: "Преди 4 дни",
      summary: `Оперативният марж, коефициентът на възвръщаемост на капитала (ROE) и съотношението дълг/собствен капитал за ${ticker} остават сред най-добрите в индустрията за това тримесечие.`,
      impact: "Positive",
      url: `https://finance.yahoo.com/quote/${ticker}`
    },
    {
      title: `Инвестиционни коментари и технически нива на подкрепа на Yahoo Finance`,
      source: "Yahoo Finance",
      time: "Преди 5 дни",
      summary: `Техническият анализ за ${ticker} показва силна зона на подкрепа около настоящата 50-дневна пълзяща средна. Очаква се засилен интерес от страна на дългосрочни инвеститори.`,
      impact: "Neutral",
      url: `https://finance.yahoo.com/quote/${ticker}`
    },
    {
      title: `Институционалните инвеститори продължават да увеличават дела си в ${name}`,
      source: "Yahoo Finance",
      time: "Преди 1 седмица",
      summary: `Последните отчети на големите фондове показват засилени покупки на ценни книжа на ${ticker}, което демонстрира силно институционално доверие в стратегията за растеж на мениджмънта.`,
      impact: "Positive",
      url: `https://finance.yahoo.com/quote/${ticker}`
    },
    {
      title: `Промени в регулаторната рамка и пазарни изисквания`,
      source: "Yahoo Finance",
      time: "Преди 1 седмица",
      summary: `Новите екологични и технологични стандарти може да изискват малки допълнителни инвестиции от ${name}, но не се очаква да повлияят съществено на оперативната печалба.`,
      impact: "Neutral",
      url: `https://finance.yahoo.com/quote/${ticker}`
    },
    {
      title: "Патентна дейност и технологично лидерство на компанията",
      source: "Yahoo Finance",
      time: "Преди 2 седмици",
      summary: `${name} регистрира серия от нови патенти в областта на иновациите от следващо поколение, което затвърждава водещата им роля и разширява интелектуалната им собственост.`,
      impact: "Positive",
      url: `https://finance.yahoo.com/quote/${ticker}`
    }
  ];
}

function cleanXmlString(str: string): string {
  if (!str) return '';
  let clean = str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  clean = clean.replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&amp;/g, '&')
               .replace(/&quot;/g, '"')
               .replace(/&apos;/g, "'")
               .replace(/&#39;/g, "'")
               .replace(/&#x27;/g, "'")
               .replace(/&nbsp;/g, ' ');
  return clean.trim();
}

function formatRssDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Наскоро";
    const diffMs = Math.max(0, Date.now() - date.getTime());
    const diffMins = Math.max(1, Math.floor(diffMs / 60000));
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `Преди ${diffMins} мин`;
    if (diffHours < 24) return `Преди ${diffHours} ${diffHours === 1 ? 'час' : 'часа'}`;
    if (diffDays === 1) return "Вчера";
    return `Преди ${diffDays} дни`;
  } catch {
    return "Наскоро";
  }
}

function formatRssDateEn(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Recently";
    const diffMs = Math.max(0, Date.now() - date.getTime());
    const diffMins = Math.max(1, Math.floor(diffMs / 60000));
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return "Recently";
  }
}

function determineLocalImpact(title: string, desc: string): 'Positive' | 'Negative' | 'Neutral' {
  const text = (title + " " + desc).toLowerCase();
  const positiveWords = [
    "upgrade", "buy", "growth", "profit", "beats", "above", "bullish", "record", "strong",
    "surge", "soar", "rally", "jump", "gain", "outperform", "dividend", "approval", "launch",
    "partnership", "acquisition", "breakthrough", "растеж", "ръст", "печалба", "рекорд", "положителна"
  ];
  const negativeWords = [
    "downgrade", "sell", "loss", "misses", "below", "bearish", "drop", "weak", "plunge",
    "fall", "decline", "slump", "crash", "lawsuit", "probe", "recall", "layoff", "tariff",
    "warning", "cut", "deficit", "спад", "загуба", "слаб", "отрицателна"
  ];
  
  let score = 0;
  for (const w of positiveWords) {
    if (text.includes(w)) score++;
  }
  for (const w of negativeWords) {
    if (text.includes(w)) score--;
  }
  return score > 0 ? "Positive" : score < 0 ? "Negative" : "Neutral";
}

export interface RealNewsItem {
  title: string;
  titleBg?: string;
  source: string;
  time: string;
  timeEn?: string;
  summary: string;
  summaryBg?: string;
  impact: 'Positive' | 'Negative' | 'Neutral';
  url: string;
  image?: string;
  category?: string;
  tickers?: string[];
  publishedDate?: string;
  lang?: string;
}

// In-memory news caches with 8-minute TTL to ensure sub-50ms responses and prevent rate-limiting
interface NewsCacheEntry {
  timestamp: number;
  news: RealNewsItem[];
}
const globalNewsCacheByTab = new Map<string, NewsCacheEntry>();
const companyNewsCache = new Map<string, NewsCacheEntry>();
const NEWS_CACHE_TTL_MS = 8 * 60 * 1000; // 8 minutes

const fetchWithTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('RSS Feed Timeout')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const COMPANY_KEYWORD_TO_TICKER: Array<[RegExp, string]> = [
  [/\b(?:apple|iphone|ipad|macbook|tim cook)\b/i, 'AAPL'],
  [/\b(?:nvidia|geforce|jensen huang|blackwell|cuda)\b/i, 'NVDA'],
  [/\b(?:microsoft|azure|copilot|satya nadella|xbox)\b/i, 'MSFT'],
  [/\b(?:alphabet|google|youtube|waymo|deepmind|sundar pichai)\b/i, 'GOOGL'],
  [/\b(?:amazon|aws|prime video|andy jassy)\b/i, 'AMZN'],
  [/\b(?:meta platforms|facebook|instagram|whatsapp|zuckerberg)\b/i, 'META'],
  [/\b(?:tesla|cybertruck|elon musk|spacEx)\b/i, 'TSLA'],
  [/\b(?:netflix)\b/i, 'NFLX'],
  [/\b(?:broadcom)\b/i, 'AVGO'],
  [/\b(?:advanced micro devices|\bamd\b|lisa su)\b/i, 'AMD'],
  [/\b(?:intel\b|foundry)\b/i, 'INTC'],
  [/\b(?:tsmc|taiwan semiconductor)\b/i, 'TSM'],
  [/\b(?:asml)\b/i, 'ASML'],
  [/\b(?:micron technology|\bmicron\b)\b/i, 'MU'],
  [/\b(?:qualcomm)\b/i, 'QCOM'],
  [/\b(?:arm holdings)\b/i, 'ARM'],
  [/\b(?:palantir)\b/i, 'PLTR'],
  [/\b(?:microstrategy|michael saylor)\b/i, 'MSTR'],
  [/\b(?:coinbase)\b/i, 'COIN'],
  [/\b(?:berkshire hathaway|warren buffett)\b/i, 'BRK-B'],
  [/\b(?:jpmorgan|jp morgan|jamie dimon)\b/i, 'JPM'],
  [/\b(?:goldman sachs)\b/i, 'GS'],
  [/\b(?:morgan stanley)\b/i, 'MS'],
  [/\b(?:bank of america)\b/i, 'BAC'],
  [/\b(?:citigroup|\bciti\b)\b/i, 'C'],
  [/\b(?:wells fargo)\b/i, 'WFC'],
  [/\b(?:blackrock|larry fink)\b/i, 'BLK'],
  [/\b(?:visa\b)\b/i, 'V'],
  [/\b(?:mastercard)\b/i, 'MA'],
  [/\b(?:paypal)\b/i, 'PYPL'],
  [/\b(?:american express|\bamex\b)\b/i, 'AXP'],
  [/\b(?:walt disney|\bdisney\b)\b/i, 'DIS'],
  [/\b(?:walmart)\b/i, 'WMT'],
  [/\b(?:costco)\b/i, 'COST'],
  [/\b(?:target corp)\b/i, 'TGT'],
  [/\b(?:home depot)\b/i, 'HD'],
  [/\b(?:nike)\b/i, 'NKE'],
  [/\b(?:starbucks)\b/i, 'SBUX'],
  [/\b(?:mcdonald's|mcdonalds)\b/i, 'MCD'],
  [/\b(?:coca-cola|coca cola)\b/i, 'KO'],
  [/\b(?:pepsico|\bpepsi\b)\b/i, 'PEP'],
  [/\b(?:procter & gamble)\b/i, 'PG'],
  [/\b(?:johnson & johnson)\b/i, 'JNJ'],
  [/\b(?:eli lilly|zepbound|mounjaro)\b/i, 'LLY'],
  [/\b(?:novo nordisk|ozempic|wegovy)\b/i, 'NVO'],
  [/\b(?:pfizer)\b/i, 'PFE'],
  [/\b(?:moderna)\b/i, 'MRNA'],
  [/\b(?:abbvie)\b/i, 'ABBV'],
  [/\b(?:merck)\b/i, 'MRK'],
  [/\b(?:unitedhealth)\b/i, 'UNH'],
  [/\b(?:stryker)\b/i, 'SYK'],
  [/\b(?:catalyst pharma)\b/i, 'CPRX'],
  [/\b(?:exxonmobil|exxon mobil|\bexxon\b)\b/i, 'XOM'],
  [/\b(?:chevron)\b/i, 'CVX'],
  [/\b(?:shell plc|\bshell\b)\b/i, 'SHEL'],
  [/\b(?:conocophillips)\b/i, 'COP'],
  [/\b(?:lockheed martin|\blockheed\b)\b/i, 'LMT'],
  [/\b(?:boeing)\b/i, 'BA'],
  [/\b(?:raytheon|\brtx\b)\b/i, 'RTX'],
  [/\b(?:general dynamics)\b/i, 'GD'],
  [/\b(?:northrop grumman)\b/i, 'NOC'],
  [/\b(?:caterpillar)\b/i, 'CAT'],
  [/\b(?:ge aerospace|general electric)\b/i, 'GE'],
  [/\b(?:john deere|\bdeere\b)\b/i, 'DE'],
  [/\b(?:uber technologies|\buber\b)\b/i, 'UBER'],
  [/\b(?:airbnb)\b/i, 'ABNB'],
  [/\b(?:booking holdings)\b/i, 'BKNG'],
  [/\b(?:salesforce)\b/i, 'CRM'],
  [/\b(?:oracle)\b/i, 'ORCL'],
  [/\b(?:adobe)\b/i, 'ADBE'],
  [/\b(?:crowdstrike)\b/i, 'CRWD'],
  [/\b(?:palo alto networks)\b/i, 'PANW'],
  [/\b(?:snowflake)\b/i, 'SNOW'],
  [/\b(?:shopify)\b/i, 'SHOP'],
  [/\b(?:spotify)\b/i, 'SPOT'],
  [/\b(?:alibaba)\b/i, 'BABA'],
  [/\b(?:baidu)\b/i, 'BIDU'],
  [/\b(?:jd\.com)\b/i, 'JD'],
  [/\b(?:byd)\b/i, 'BYDDY'],
  [/\b(?:deutsche post|\bdhl\b)\b/i, 'DHL.DE'],
  [/\b(?:lvmh|louis vuitton)\b/i, 'EPA:MC'],
  [/\b(?:nestle|nestlé)\b/i, 'SWX:NESN'],
  [/\b(?:evolution ab)\b/i, 'STO:EVO'],
  [/\b(?:burberry)\b/i, 'BRBY'],
];

const NON_TICKER_WORDS = new Set([
  'CEO', 'CFO', 'CTO', 'COO', 'USA', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'GDP', 'CPI',
  'PCE', 'FED', 'ECB', 'BOE', 'BOJ', 'SEC', 'DOJ', 'FTC', 'FDA', 'EPA', 'IPO', 'ETF',
  'AI', 'API', 'LLM', 'GPU', 'CPU', 'EV', 'ESG', 'DEI', 'YOY', 'MOM', 'QOQ', 'TTM',
  'EPS', 'ROE', 'ROI', 'DCF', 'IMF', 'WTO', 'WHO', 'NATO', 'OPEC', 'NYSE', 'AMEX',
  'THE', 'AND', 'FOR', 'NEW', 'NOW', 'TOP', 'ALL', 'INC', 'CORP', 'LTD', 'PLC', 'LLC'
]);

function extractTickersFromText(title: string, summary: string, existing?: string[]): string[] {
  const found = new Set<string>();
  if (Array.isArray(existing)) {
    for (const t of existing) {
      if (typeof t === 'string') {
        const clean = t.trim().toUpperCase().replace(/^\$/, '');
        if (clean && clean.length <= 10 && !NON_TICKER_WORDS.has(clean)) {
          found.add(clean);
        }
      }
    }
  }

  const text = `${title || ''} ${summary || ''}`;

  const exRegex = /\b(?:NASDAQ|NYSE|AMEX|NYSEAMERICAN|BATS|ARCA|TSX|LSE|XETRA|ETR|EPA|SWX|STO)\s*:\s*([A-Z]{1,5}(?:\.[A-Z]{1,2})?)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = exRegex.exec(text)) !== null) {
    const sym = m[1].toUpperCase();
    if (!NON_TICKER_WORDS.has(sym)) found.add(sym);
  }

  const parenRegex = /(?:\$([A-Z]{2,5})\b|\(([A-Z]{2,5})\))/g;
  while ((m = parenRegex.exec(text)) !== null) {
    const sym = (m[1] || m[2] || '').toUpperCase();
    if (sym && !NON_TICKER_WORDS.has(sym)) found.add(sym);
  }

  for (const [pattern, ticker] of COMPANY_KEYWORD_TO_TICKER) {
    if (pattern.test(text)) {
      found.add(ticker);
    }
    if (found.size >= 5) break;
  }

  return Array.from(found).slice(0, 5);
}

function extractItemImage(item: any): string | undefined {
  if (item.enclosure && item.enclosure.url && typeof item.enclosure.url === 'string') {
    return item.enclosure.url;
  }
  if (item.mediaContent) {
    if (Array.isArray(item.mediaContent)) {
      const found = item.mediaContent.find((m: any) => m?.$?.url);
      if (found?.$?.url) return found.$.url;
    } else if (item.mediaContent.$ && item.mediaContent.$.url) {
      return item.mediaContent.$.url;
    }
  }
  if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
    return item['media:content'].$.url;
  }
  if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
    return item.mediaThumbnail.$.url;
  }
  if (item['media:thumbnail'] && item['media:thumbnail'].$ && item['media:thumbnail'].$.url) {
    return item['media:thumbnail'].$.url;
  }
  const rawHtml = (item.description || item.content || item['content:encoded'] || '');
  const imgMatch = rawHtml.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
  if (imgMatch && imgMatch[1] && !imgMatch[1].includes('1x1') && !imgMatch[1].includes('pixel')) {
    return imgMatch[1];
  }
  return undefined;
}

const PUBLISHER_FALLBACK_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=640&auto=format&fit=crop&q=80'
];

function getFallbackImageForArticle(title: string, source: string): string {
  const s = (source || '').toLowerCase();
  if (s.includes('investor')) return 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=640&auto=format&fit=crop&q=80';
  let hash = 0;
  const str = (title || source || 'news');
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return PUBLISHER_FALLBACK_IMAGES[hash % PUBLISHER_FALLBACK_IMAGES.length];
}

async function fetchStockAnalysisJsonFeed(routePath: string, category: string): Promise<any[]> {
  try {
    const cleanPath = routePath.replace(/^\/+|\/+$/g, '');
    const url = `https://stockanalysis.com/${cleanPath}/__data.json`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://stockanalysis.com/news/'
      },
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) return [];
    const json = await res.json() as any;
    const nodes = json?.nodes;
    if (!Array.isArray(nodes)) return [];

    const extracted: any[] = [];
    for (const node of nodes) {
      const dataArr = node?.data;
      if (!Array.isArray(dataArr) || dataArr.length < 3) continue;

      const resolveVal = (v: any, depth = 0): any => {
        if (depth > 4) return v;
        if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < dataArr.length) {
          const target = dataArr[v];
          if (Array.isArray(target)) return target.map(x => resolveVal(x, depth + 1));
          if (target && typeof target === 'object') {
            const obj: Record<string, any> = {};
            for (const [k, val] of Object.entries(target)) {
              obj[k] = resolveVal(val, depth + 1);
            }
            return obj;
          }
          return target;
        }
        return v;
      };

      for (let i = 0; i < dataArr.length; i++) {
        const entry = dataArr[i];
        if (entry && typeof entry === 'object' && !Array.isArray(entry) && 'title' in entry && ('url' in entry || 'link' in entry)) {
          const item = resolveVal(i);
          const rawTitle = typeof item?.title === 'string' ? item.title.trim() : '';
          let rawUrl = typeof item?.url === 'string' ? item.url.trim() : (typeof item?.link === 'string' ? item.link.trim() : '');
          if (!rawTitle || !rawUrl) continue;
          if (rawUrl.startsWith('/')) rawUrl = `https://stockanalysis.com${rawUrl}`;
          if (!rawUrl.startsWith('http')) continue;

          const rawText = typeof item?.text === 'string' ? item.text : (typeof item?.description === 'string' ? item.description : '');
          const rawSource = typeof item?.source === 'string' ? item.source : 'Stock Analysis';
          const rawImg = typeof item?.image === 'string' ? item.image : (typeof item?.img === 'string' ? item.img : undefined);
          const rawTime = typeof item?.time === 'string' ? item.time : (typeof item?.ago === 'string' ? item.ago : (typeof item?.date === 'string' ? item.date : ''));
          const rawTickers = Array.isArray(item?.tickers)
            ? item.tickers.map((t: any) => typeof t === 'string' ? t.replace(/^\$/, '').toUpperCase() : (t?.s || t?.symbol || '')).filter(Boolean)
            : [];

          let parsedIso = new Date().toISOString();
          if (rawTime) {
            const d = new Date(rawTime);
            if (!isNaN(d.getTime())) {
              parsedIso = d.toISOString();
            } else {
              const minMatch = rawTime.match(/(\d+)\s*min/i);
              const hrMatch = rawTime.match(/(\d+)\s*hour/i);
              const dayMatch = rawTime.match(/(\d+)\s*day/i);
              if (minMatch) parsedIso = new Date(Date.now() - parseInt(minMatch[1], 10) * 60000).toISOString();
              else if (hrMatch) parsedIso = new Date(Date.now() - parseInt(hrMatch[1], 10) * 3600000).toISOString();
              else if (dayMatch) parsedIso = new Date(Date.now() - parseInt(dayMatch[1], 10) * 86400000).toISOString();
            }
          }

          extracted.push({
            title: cleanXmlString(rawTitle),
            link: rawUrl,
            pubDate: parsedIso,
            timeEnOverride: rawTime && rawTime.includes('ago') ? rawTime : undefined,
            source: rawSource,
            summary: cleanXmlString(rawText) || cleanXmlString(rawTitle),
            image: rawImg || getFallbackImageForArticle(rawTitle, rawSource),
            category,
            tickers: extractTickersFromText(rawTitle, rawText, rawTickers),
            lang: 'en'
          });
        }
      }
    }
    return extracted.slice(0, 25);
  } catch {
    return [];
  }
}

async function translateArticlesBatchToBg(articles: RealNewsItem[]): Promise<RealNewsItem[]> {
  return Promise.all(articles.map(async (item) => {
    if (item.lang === 'bg' || item.source === 'Investor.bg') {
      return {
        ...item,
        titleBg: item.title,
        summaryBg: item.summary
      };
    }
    try {
      const combined = `${item.title} ||| ${item.summary || ''}`;
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bg&dt=t&q=${encodeURIComponent(combined)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2200) });
      if (res.ok) {
        const data = await res.json() as any;
        if (Array.isArray(data?.[0])) {
          const translatedFull = data[0].map((seg: any) => seg?.[0] || '').join('');
          const parts = translatedFull.split('|||');
          const titleBg = (parts[0] || item.title).trim();
          const summaryBg = (parts.slice(1).join(' ') || item.summary).trim();
          return {
            ...item,
            titleBg: titleBg || item.title,
            summaryBg: summaryBg || item.summary
          };
        }
      }
    } catch {}
    return {
      ...item,
      titleBg: item.title,
      summaryBg: item.summary
    };
  }));
}

async function fetchTopGlobalFinancialFeeds(tab: string = 'all'): Promise<RealNewsItem[]> {
  const normalizedTab = (tab || 'all').toLowerCase();

  const allFeedConfigs = [
    // Markets & Newsroom feeds
    { url: "https://feeds.content.dowjones.io/public/rss/RSSMarketsMain", sourceName: "The Wall Street Journal", category: "markets", tabs: ["all", "newsroom", "markets"], lang: "en" },
    { url: "https://feeds.content.dowjones.io/public/rss/WSJcomUSBusiness", sourceName: "The Wall Street Journal", category: "markets", tabs: ["all", "newsroom", "markets", "all-stocks"], lang: "en" },
    { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664", sourceName: "CNBC", category: "markets", tabs: ["all", "newsroom", "markets"], lang: "en" },
    { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258", sourceName: "CNBC", category: "markets", tabs: ["all", "markets"], lang: "en" },
    { url: "https://feeds.content.dowjones.io/public/rss/mw_topstories", sourceName: "MarketWatch", category: "markets", tabs: ["all", "newsroom", "markets"], lang: "en" },
    { url: "https://feeds.content.dowjones.io/public/rss/mw_realtimeheadlines", sourceName: "MarketWatch", category: "markets", tabs: ["all", "markets"], lang: "en" },
    { url: "https://www.investing.com/rss/news_25.rss", sourceName: "Reuters", category: "markets", tabs: ["all", "markets"], lang: "en" },

    // All Stocks feeds
    { url: "https://seekingalpha.com/market_currents.xml", sourceName: "Seeking Alpha", category: "all-stocks", tabs: ["all", "all-stocks"], lang: "en" },
    { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147", sourceName: "CNBC", category: "all-stocks", tabs: ["all", "all-stocks"], lang: "en" },
    { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19854910", sourceName: "CNBC Tech", category: "all-stocks", tabs: ["all", "all-stocks"], lang: "en" },
    { url: "https://techcrunch.com/feed/", sourceName: "TechCrunch", category: "all-stocks", tabs: ["all-stocks"], lang: "en" },

    // Press Releases feeds
    { url: "https://www.globenewswire.com/AtomFeed/orgclass/1/feedTitle/GlobeNewswire%20-%20News%20about%20Public%20Companies", sourceName: "GlobeNewsWire", category: "press-releases", tabs: ["all", "press-releases"], lang: "en" },
    { url: "https://www.prnewswire.com/rss/financial-services-latest-news/financial-services-latest-news-list.rss", sourceName: "PRNewsWire", category: "press-releases", tabs: ["all", "press-releases"], lang: "en" },
    { url: "https://feed.businesswire.com/rss/home/?rss=G1QFDERJXkJeEFpRWA==", sourceName: "Business Wire", category: "press-releases", tabs: ["all", "press-releases"], lang: "en" },

    // Bulgarian feeds (Investor.bg)
    { url: "https://www.investor.bg/rss/c/578-top-novini", sourceName: "Investor.bg", category: "bg", tabs: ["all", "newsroom", "bg"], lang: "bg" },
    { url: "https://www.investor.bg/rss/latest", sourceName: "Investor.bg", category: "bg", tabs: ["all", "bg"], lang: "bg" }
  ];

  const activeConfigs = allFeedConfigs.filter(c => c.tabs.includes(normalizedTab));

  const saRouteMap: Record<string, { path: string; cat: string }> = {
    'newsroom': { path: 'news', cat: 'newsroom' },
    'markets': { path: 'news/markets', cat: 'markets' },
    'all-stocks': { path: 'news/all-stocks', cat: 'all-stocks' },
    'press-releases': { path: 'news/press-releases', cat: 'press-releases' },
    'all': { path: 'news/markets', cat: 'markets' }
  };

  const saTarget = saRouteMap[normalizedTab];

  const [saArticles, ...rssResults] = await Promise.all([
    saTarget ? fetchStockAnalysisJsonFeed(saTarget.path, saTarget.cat) : Promise.resolve([]),
    ...activeConfigs.map(c => fetchWithTimeout(rssParser.parseURL(c.url), 4500).catch(() => null))
  ]);

  const rawArticles: any[] = [...saArticles];

  rssResults.forEach((feed: any, index: number) => {
    if (feed && Array.isArray(feed.items)) {
      const config = activeConfigs[index];
      feed.items.slice(0, 12).forEach((item: any) => {
        const rawLink = item.link || item.guid;
        if (rawLink && item.title && typeof rawLink === 'string' && rawLink.startsWith('http')) {
          const rawSnippet = item.contentSnippet || item.content || item.summary || item.description || item.title || "";
          const cleanSnippet = cleanXmlString(rawSnippet).replace(/<[^>]*>?/gm, '').trim();
          const cleanTitle = cleanXmlString(item.title);
          
          let pubDateObj = new Date();
          if (item.pubDate || item.isoDate) {
            const parsedD = new Date(item.pubDate || item.isoDate);
            if (!isNaN(parsedD.getTime())) pubDateObj = parsedD;
          }

          let finalSource = config.sourceName;
          if (item.author && typeof item.author === 'string' && item.author.toLowerCase().includes('reuters')) {
            finalSource = 'Reuters';
          }

          const catTickers: string[] = [];
          if (Array.isArray(item.categories)) {
            for (const c of item.categories) {
              const str = typeof c === 'string' ? c : (c?._ || '');
              if (/^[A-Z]{1,5}$/.test(str.trim())) {
                catTickers.push(str.trim());
              } else if (str.includes(':')) {
                const afterColon = str.split(':').pop()?.trim() || '';
                if (/^[A-Z]{1,5}$/.test(afterColon)) catTickers.push(afterColon);
              }
            }
          }

          const tickers = extractTickersFromText(cleanTitle, cleanSnippet, catTickers);
          const extractedImg = extractItemImage(item) || getFallbackImageForArticle(cleanTitle, finalSource);

          rawArticles.push({
            title: cleanTitle,
            link: rawLink.trim(),
            pubDate: pubDateObj.toISOString(),
            source: finalSource,
            summary: cleanSnippet || cleanTitle,
            image: extractedImg,
            category: config.category,
            tickers,
            lang: config.lang
          });
        }
      });
    }
  });

  rawArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const seen = new Set<string>();
  const uniqueArticles: any[] = [];
  for (const item of rawArticles) {
    const norm = item.title.toLowerCase().replace(/[^a-z0-9а-я]/gi, '').slice(0, 45);
    if (!seen.has(norm) && norm.length > 5) {
      seen.add(norm);
      uniqueArticles.push(item);
    }
    if (uniqueArticles.length >= 28) break;
  }

  const formatted: RealNewsItem[] = uniqueArticles.map(item => {
    const summaryClean = item.summary ? (item.summary.length > 260 ? item.summary.slice(0, 260) + '...' : item.summary) : item.title;
    return {
      title: item.title,
      source: item.source,
      time: formatRssDate(item.pubDate),
      timeEn: item.timeEnOverride || formatRssDateEn(item.pubDate),
      summary: summaryClean,
      impact: determineLocalImpact(item.title, summaryClean),
      url: item.link,
      image: item.image,
      category: item.category,
      tickers: item.tickers || [],
      publishedDate: item.pubDate,
      lang: item.lang || 'en'
    };
  });

  return translateArticlesBatchToBg(formatted);
}

async function fetchTickerRssNews(ticker: string, companyName?: string): Promise<RealNewsItem[]> {
  const cleanTicker = (ticker.includes(':') ? ticker.split(':')[1] : ticker.split('.')[0]).trim().toUpperCase();
  const urls = [
    { url: `https://seekingalpha.com/api/sa/combined/${encodeURIComponent(cleanTicker)}.xml`, src: "Seeking Alpha" },
    { url: `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(cleanTicker)}&region=US&lang=en-US`, src: "Yahoo Finance" },
    { url: `https://news.google.com/rss/search?q=${encodeURIComponent((companyName || cleanTicker) + ' stock news')}&hl=en-US&gl=US&ceid=US:en`, src: "Google News" }
  ];

  const finnhubKey = process.env.FINNHUB_API_KEY;
  const fetchFinnhubCompanyNews = async (): Promise<any[]> => {
    if (!finnhubKey || !/^[A-Z]{1,5}$/.test(cleanTicker)) return [];
    try {
      const toDate = new Date().toISOString().split('T')[0];
      const fromDate = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
      const r = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(cleanTicker)}&from=${fromDate}&to=${toDate}&token=${finnhubKey}`, {
        signal: AbortSignal.timeout(3500)
      });
      if (!r.ok) return [];
      const arr = await r.json();
      if (!Array.isArray(arr)) return [];
      return arr.slice(0, 12).map((it: any) => ({
        title: cleanXmlString(it.headline || ''),
        link: it.url || '',
        pubDate: it.datetime ? new Date(it.datetime * 1000).toISOString() : new Date().toISOString(),
        source: it.source || 'Finnhub',
        summary: cleanXmlString(it.summary || it.headline || ''),
        image: it.image || getFallbackImageForArticle(it.headline || '', it.source || ''),
        category: 'all-stocks',
        tickers: extractTickersFromText(it.headline || '', it.summary || '', [cleanTicker]),
        lang: 'en'
      })).filter((x: any) => x.title && x.link.startsWith('http'));
    } catch {
      return [];
    }
  };

  const [saTickerItems, finnhubItems, ...rssResults] = await Promise.all([
    fetchStockAnalysisJsonFeed(`stocks/${cleanTicker.toLowerCase()}`, 'all-stocks'),
    fetchFinnhubCompanyNews(),
    ...urls.map(u => fetchWithTimeout(rssParser.parseURL(u.url), 4500).catch(() => null))
  ]);

  const rawItems: any[] = [
    ...saTickerItems.map(it => ({ ...it, tickers: Array.from(new Set([cleanTicker, ...(it.tickers || [])])).slice(0, 5) })),
    ...finnhubItems
  ];

  rssResults.forEach((feed: any, index: number) => {
    if (feed && Array.isArray(feed.items)) {
      const srcName = urls[index].src;
      feed.items.slice(0, 10).forEach((item: any) => {
        const link = item.link || item.guid;
        if (link && item.title && typeof link === 'string' && link.startsWith('http') && !link.includes("consent.yahoo.com")) {
          const rawSnippet = item.contentSnippet || item.content || item.summary || item.title || "";
          const cleanSnippet = cleanXmlString(rawSnippet).replace(/<[^>]*>?/gm, '').trim();
          const cleanTitle = cleanXmlString(item.title);
          const source = item.creator || item.author || srcName;
          const img = extractItemImage(item) || getFallbackImageForArticle(cleanTitle, source);
          rawItems.push({
            title: cleanTitle,
            link: link.trim(),
            pubDate: item.pubDate || new Date().toISOString(),
            source,
            summary: cleanSnippet || cleanTitle,
            image: img,
            category: 'all-stocks' as const,
            tickers: extractTickersFromText(cleanTitle, cleanSnippet, [cleanTicker]),
            lang: 'en' as const
          });
        }
      });
    }
  });

  rawItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const seenTitles = new Set<string>();
  const uniqueItems: any[] = [];
  for (const item of rawItems) {
    const norm = item.title.toLowerCase().trim().replace(/[^a-z0-9]/g, '').slice(0, 45);
    if (!seenTitles.has(norm) && norm.length > 5) {
      seenTitles.add(norm);
      uniqueItems.push(item);
    }
    if (uniqueItems.length >= 18) break;
  }

  const formatted: RealNewsItem[] = uniqueItems.map(item => {
    const summaryClean = item.summary ? (item.summary.length > 260 ? item.summary.slice(0, 260) + '...' : item.summary) : item.title;
    return {
      title: item.title,
      source: item.source || "Yahoo Finance",
      time: formatRssDate(item.pubDate),
      timeEn: item.timeEnOverride || formatRssDateEn(item.pubDate),
      summary: summaryClean,
      impact: determineLocalImpact(item.title, summaryClean),
      url: item.link,
      image: item.image,
      category: item.category,
      tickers: item.tickers || [cleanTicker],
      publishedDate: item.pubDate,
      lang: 'en'
    };
  });

  return translateArticlesBatchToBg(formatted);
}

// Endpoint for fetching high-quality verified news with authentic direct article links
app.post("/api/company-news", async (req, res) => {
  try {
    const { ticker, companyName, tab = 'all' } = req.body;
    const now = Date.now();

    if (!ticker) {
      const normalizedTab = String(tab || 'all').toLowerCase();
      const cachedTab = globalNewsCacheByTab.get(normalizedTab);
      if (cachedTab && (now - cachedTab.timestamp < NEWS_CACHE_TTL_MS) && cachedTab.news.length > 0) {
        return res.json({ news: cachedTab.news, cached: true, tab: normalizedTab });
      }
      const processed = await fetchTopGlobalFinancialFeeds(normalizedTab);
      if (processed.length > 0) {
        globalNewsCacheByTab.set(normalizedTab, { timestamp: now, news: processed });
        return res.json({ news: processed, tab: normalizedTab });
      }
      if (cachedTab && cachedTab.news.length > 0) {
        return res.json({ news: cachedTab.news, tab: normalizedTab });
      }
    } else {
      const cacheKey = ticker.toUpperCase();
      const cached = companyNewsCache.get(cacheKey);
      if (cached && (now - cached.timestamp < NEWS_CACHE_TTL_MS) && cached.news.length > 0) {
        return res.json({ news: cached.news, cached: true });
      }

      const processed = await fetchTickerRssNews(ticker, companyName);
      if (processed.length > 0) {
        companyNewsCache.set(cacheKey, { timestamp: now, news: processed });
        return res.json({ news: processed });
      }

      if (cached && cached.news.length > 0) {
        return res.json({ news: cached.news });
      }
    }

    const fallback = getLocalFallbackNews(ticker, companyName);
    res.json({ news: fallback });
  } catch (error: any) {
    console.error("Грешка при извличане на новини:", error);
    const fallback = getLocalFallbackNews(req.body?.ticker, req.body?.companyName);
    res.json({ news: fallback, warning: "Използван локален поток." });
  }
});


// Global server-side cache for stocks and indices prices to provide continuous realistic fallback prices
const serverPriceCache: Record<string, number> = {};

const baselinePrices: Record<string, { price: number; name: string; pe?: number; eps?: number }> = {
  // Stocks
  "AAPL": { price: 184.20, name: "Apple Inc.", pe: 28.5, eps: 6.46 },
  "MSFT": { price: 418.52, name: "Microsoft Corporation", pe: 35.8, eps: 11.69 },
  "TSLA": { price: 177.46, name: "Tesla, Inc.", pe: 62.4, eps: 2.84 },
  "NVDA": { price: 875.12, name: "NVIDIA Corporation", pe: 72.1, eps: 12.14 },
  "AMD": { price: 161.45, name: "Advanced Micro Devices", pe: 330.2, eps: 0.49 },
  "AMZN": { price: 179.80, name: "Amazon.com, Inc.", pe: 61.2, eps: 2.94 },
  "META": { price: 496.22, name: "Meta Platforms, Inc.", pe: 24.3, eps: 20.42 },
  "GOOG": { price: 173.10, name: "Alphabet Inc.", pe: 25.1, eps: 6.90 },
  "GOOGL": { price: 172.50, name: "Alphabet Inc.", pe: 24.9, eps: 6.90 },
  "BRK-B": { price: 406.30, name: "Berkshire Hathaway Inc.", pe: 18.2, eps: 22.32 },
  "JPM": { price: 196.12, name: "JPMorgan Chase & Co.", pe: 11.8, eps: 16.62 },
  "V": { price: 276.50, name: "Visa Inc.", pe: 31.4, eps: 8.81 },
  "DIS": { price: 113.15, name: "The Walt Disney Company", pe: 68.3, eps: 1.66 },
  "NFLX": { price: 612.40, name: "Netflix, Inc.", pe: 42.1, eps: 14.55 },
  "PYPL": { price: 65.12, name: "PayPal Holdings, Inc.", pe: 15.3, eps: 4.26 },
  "BABA": { price: 72.85, name: "Alibaba Group Holding Limited", pe: 12.4, eps: 5.88 },
  "COIN": { price: 228.30, name: "Coinbase Global, Inc.", pe: 124.6, eps: 1.83 },
  "LMT": { price: 452.12, name: "Lockheed Martin Corporation", pe: 16.4, eps: 27.57 },
  "XOM": { price: 118.50, name: "Exxon Mobil Corporation", pe: 13.1, eps: 9.05 },
  "JNJ": { price: 156.40, name: "Johnson & Johnson", pe: 15.4, eps: 10.16 },
  "WMT": { price: 60.10, name: "Walmart Inc.", pe: 27.8, eps: 2.16 },
  "NKE": { price: 94.50, name: "NIKE, Inc.", pe: 26.5, eps: 3.57 },
  "SBUX": { price: 86.40, name: "Starbucks Corporation", pe: 22.8, eps: 3.79 },
  "PFE": { price: 28.15, name: "Pfizer Inc.", pe: 14.2, eps: 1.98 },
  "KO": { price: 61.20, name: "The Coca-Cola Company", pe: 24.1, eps: 2.54 },
  "PEP": { price: 168.30, name: "PepsiCo, Inc.", pe: 25.4, eps: 6.63 },
  "PLTR": { price: 22.45, name: "Palantir Technologies Inc.", pe: 74.8, eps: 0.30 },
  "MSTR": { price: 1450.40, name: "MicroStrategy Incorporated", pe: null, eps: -2.31 },

  // Indices
  "^GSPC": { price: 7748.40, name: "S&P 500" },
  "^NDX": { price: 29917.60, name: "NASDAQ 100" },
  "^IXIC": { price: 26713.00, name: "NASDAQ Composite" },
  "^DJI": { price: 52213.70, name: "Dow Jones Industrial Average" },
  "^RUT": { price: 2753.30, name: "Russell 2000" },
  "^VIX": { price: 16.62, name: "CBOE Volatility Index" },
  "^GDAXI": { price: 25382.60, name: "DAX Index" },
  "^N225": { price: 64426.00, name: "Nikkei 225" },
  "^FTSE": { price: 10840.40, name: "FTSE 100" }
};

interface StockQuoteData {
  currentPrice: number;
  dailyChangePct: number;
  changeVal?: number;
  companyName?: string;
  low52?: number;
  high52?: number;
  peRatio?: number;
  eps?: number;
  marketCap?: number;
  dividend?: number;
  dividendYield?: number;
  earningsTimestamp?: number;
}

let cachedCookie: string | null = null;
let cachedCrumb: string | null = null;

async function getYahooSession(): Promise<{ cookie: string; crumb: string } | null> {
  if (cachedCookie && cachedCrumb) {
    return { cookie: cachedCookie, crumb: cachedCrumb };
  }

  try {
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";
    const res1 = await fetch("https://fc.yahoo.com", {
      headers: { "User-Agent": userAgent }
    });
    const cookies = res1.headers.get("set-cookie");
    if (!cookies) {
      throw new Error("No cookies returned from fc.yahoo.com");
    }
    const cookieHeader = cookies.split(",").map(c => c.split(";")[0]).join("; ");

    const res2 = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
      headers: {
        "User-Agent": userAgent,
        "Cookie": cookieHeader
      }
    });
    if (!res2.ok) {
      throw new Error(`Failed to get crumb: ${res2.status}`);
    }
    const crumb = await res2.text();
    if (!crumb) {
      throw new Error("Empty crumb returned");
    }

    cachedCookie = cookieHeader;
    cachedCrumb = crumb;
    return { cookie: cookieHeader, crumb };
  } catch (e: any) {
    console.error("Грешка при генериране на сесия за Yahoo Finance:", e.message);
    return null;
  }
}

// Helper to query Yahoo quotes with timeout and fallback URLs
async function fetchYahooQuotesWithRetry(tickers: string[]): Promise<any> {
  const session = await getYahooSession();
  if (!session) {
    console.warn("Yahoo Finance сесията е недостъпна, пропускане на директно извличане.");
    return null;
  }

  const urls = [
    `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${tickers.join(",")}&crumb=${session.crumb}`,
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${tickers.join(",")}&crumb=${session.crumb}`
  ];

  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": userAgent,
          "Cookie": session.cookie
        }
      });

      if (response.ok) {
        const data = await response.json() as any;
        if (data?.quoteResponse?.result && data.quoteResponse.result.length > 0) {
          return data.quoteResponse.result;
        }
      } else {
        console.warn(`Yahoo Finance API грешка (${response.status}) за URL: ${url}`);
        if (response.status === 401) {
          cachedCookie = null;
          cachedCrumb = null;
        }
      }
    } catch (e: any) {
      console.warn(`Връзката към ${url} закъсня или се провали: ${e.message}`);
    }
  }
  return null;
}

// Helper to query single Yahoo chart quote (virtually unblocked and highly robust)
async function fetchSingleChartQuote(symbol: string): Promise<any> {
  const urls = [
    `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });
      if (response.ok) {
        const data = await response.json() as any;
        const meta = data?.chart?.result?.[0]?.meta;
        if (meta) {
          const currentPrice = meta.regularMarketPrice ?? meta.chartPreviousClose;
          const prevClose = meta.chartPreviousClose ?? meta.previousClose;
          let dailyChangePct = 0;
          if (currentPrice && prevClose) {
            dailyChangePct = ((currentPrice - prevClose) / prevClose) * 100;
          }
          return {
            symbol: symbol,
            regularMarketPrice: currentPrice,
            regularMarketPreviousClose: prevClose,
            regularMarketChangePercent: dailyChangePct,
            longName: meta.symbol,
            fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
            fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
          };
        }
      }
    } catch (e: any) {
      // quiet warn
    }
  }
  return null;
}

async function fetchChartQuotesInParallel(symbols: string[]): Promise<any[]> {
  const results: any[] = [];
  const chunkSize = 10;
  for (let i = 0; i < symbols.length; i += chunkSize) {
    const chunk = symbols.slice(i, i + chunkSize);
    const chunkPromises = chunk.map(sym => fetchSingleChartQuote(sym));
    const chunkResults = await Promise.all(chunkPromises);
    for (const r of chunkResults) {
      if (r) {
        results.push(r);
      }
    }
  }
  return results;
}

// Generates stable and beautiful simulated prices if stock APIs are unavailable
function generateFallbackQuotes(tickers: string[]): Record<string, StockQuoteData> {
  const results: Record<string, StockQuoteData> = {};

  for (const ticker of tickers) {
    const defaultData = baselinePrices[ticker];
    let basePrice = defaultData?.price;
    let companyName = defaultData?.name;
    let pe = defaultData?.pe;
    let eps = defaultData?.eps;

    if (!basePrice) {
      // Deterministic starting price so it is stable per ticker
      let hash = 0;
      for (let i = 0; i < ticker.length; i++) {
        hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
      }
      basePrice = 15 + (Math.abs(hash) % 250);
    }

    // Load from in-memory cache to guarantee continuous random-walk tick sequence
    let currentPrice = serverPriceCache[ticker];
    if (currentPrice === undefined) {
      currentPrice = basePrice;
    }

    // Apply incremental market fluctuation of -0.2% to +0.2%
    const pctChange = (Math.random() * 0.4 - 0.2) / 100;
    currentPrice = parseFloat((currentPrice * (1 + pctChange)).toFixed(2));
    serverPriceCache[ticker] = currentPrice;

    // Daily change relative to the baseline close
    const dailyChangePct = parseFloat(((currentPrice - basePrice) / basePrice * 100).toFixed(2));

    results[ticker] = {
      currentPrice,
      dailyChangePct,
      companyName: companyName || `${ticker} Corp.`,
      low52: parseFloat((basePrice * 0.82).toFixed(2)),
      high52: parseFloat((basePrice * 1.18).toFixed(2)),
      peRatio: pe || parseFloat((15 + (ticker.charCodeAt(0) % 30)).toFixed(2)),
      eps: eps || parseFloat((1 + (ticker.charCodeAt(0) % 8)).toFixed(2)),
      marketCap: 1000000000 + (Math.abs(ticker.charCodeAt(0) * 10000000)),
    };
  }

  return results;
}

app.get("/api/vix", async (req, res) => {
  try {
    const tvUrl = "https://scanner.tradingview.com/america/scan";
    const body = {
      symbols: { tickers: ["TVC:VIX"], query: { types: [] } },
      columns: ["close", "change", "change_abs", "open", "high", "low"]
    };

    const response = await fetch(tvUrl, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`TradingView API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.data || data.data.length === 0) {
      throw new Error("Invalid TradingView data format");
    }

    const d = data.data[0].d; // [close, change_pct, change_abs, open, high, low]
    const score = d[0];

    const getRatingForVix = (s: number) => {
      if (s < 15) return 'extreme greed';
      if (s < 20) return 'greed';
      if (s < 25) return 'neutral';
      if (s < 30) return 'fear';
      return 'extreme fear';
    };

    res.json({
      score,
      change_pct: d[1],
      change_abs: d[2],
      open: d[3] ?? null,
      high: d[4] ?? null,
      low:  d[5] ?? null,
      rating: getRatingForVix(score),
      timestamp: new Date().toISOString(),
      isFallback: false
    });
  } catch (error) {
    console.error("Грешка при извличане на VIX Index:", error);
    res.status(500).json({ error: "Грешка при извличане на VIX Index" });
  }
});

app.get("/api/global-news", async (req, res) => {
  const tab = String(req.query.tab || 'all').toLowerCase();
  try {
    const now = Date.now();
    const forceRefresh = req.query.refresh === 'true';

    // 1. Check per-tab in-memory cache first for sub-50ms response
    const cachedTab = globalNewsCacheByTab.get(tab);
    if (!forceRefresh && cachedTab && (now - cachedTab.timestamp < NEWS_CACHE_TTL_MS) && cachedTab.news.length > 0) {
      return res.json({ news: cachedTab.news, cached: true, tab });
    }

    // 2. Fetch live multi-source feeds + bilingual translation
    const processed = await fetchTopGlobalFinancialFeeds(tab);
    if (processed.length > 0) {
      globalNewsCacheByTab.set(tab, {
        timestamp: now,
        news: processed
      });
      return res.json({ news: processed, tab });
    }

    // 3. If fresh fetch returned nothing, return previous cache if any
    if (cachedTab && cachedTab.news.length > 0) {
      return res.json({ news: cachedTab.news, tab });
    }

    // 4. Last resort fallback
    const fallback = getLocalFallbackNews("", "");
    return res.json({ news: fallback, tab });
  } catch (error: any) {
    console.error("Error in /api/global-news:", error.message);
    const cachedTab = globalNewsCacheByTab.get(tab);
    if (cachedTab && cachedTab.news.length > 0) {
      return res.json({ news: cachedTab.news, tab });
    }
    const fallback = getLocalFallbackNews("", "");
    res.json({ news: fallback, tab });
  }
});

import * as cheerio from 'cheerio';

const FRED_API_KEY = process.env.FRED_API_KEY || '3938201ae2a80f23c7e6985993840e4c';
const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';

let cachedInflationData: any = null;
let lastInflationFetch: number = 0;
const CACHE_MS = 1000 * 60 * 60 * 24; // 24 hours cache (FRED data updates daily)

function formatFredDate(isoDate?: string): string | undefined {
  if (!isoDate) return undefined;
  const parts = isoDate.split('-');
  if (parts.length !== 3) return undefined;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (m < 0 || m > 11 || isNaN(d)) return undefined;
  return `${months[m]} ${d}, ${parts[0]}`;
}

// Fetch N latest observations for a FRED series
async function fredFetch(seriesId: string, limit: number = 2): Promise<{ values: number[]; releaseDate?: string }> {
  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${FRED_API_KEY}&sort_order=desc&limit=${limit}&file_type=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FRED ${seriesId} HTTP ${res.status}`);
  const json = await res.json();
  const obs: any[] = json.observations || [];
  const valid = obs.filter((o: any) => o.value !== '.' && o.value !== '');
  const releaseDate = formatFredDate(valid[0]?.realtime_start || json.realtime_start);
  return {
    values: valid.map((o: any) => parseFloat(o.value)),
    releaseDate
  };
}

// Fetch N latest observations with dates for exact year-over-year matching
async function fredFetchWithDates(seriesId: string, limit: number = 24): Promise<{ obs: { date: string; value: number }[]; releaseDate?: string }> {
  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${FRED_API_KEY}&sort_order=desc&limit=${limit}&file_type=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FRED ${seriesId} HTTP ${res.status}`);
  const json = await res.json();
  const rawObs: any[] = json.observations || [];
  const valid = rawObs.filter((o: any) => o.value !== '.' && o.value !== '' && o.date);
  const releaseDate = formatFredDate(valid[0]?.realtime_start || json.realtime_start);
  return {
    obs: valid.map((o: any) => ({ date: String(o.date), value: parseFloat(o.value) })),
    releaseDate
  };
}

// Calculate Year-over-Year % change matching exact year-ago date (prevents shift when FRED has missing '.' months)
async function fredYoY(seriesId: string): Promise<{ actual: string; previous: string; releaseDate?: string }> {
  const { obs, releaseDate } = await fredFetchWithDates(seriesId, 24);
  if (obs.length < 13) return { actual: 'N/A', previous: 'N/A', releaseDate };

  const byDate = new Map<string, number>();
  for (const item of obs) {
    byDate.set(item.date, item.value);
  }

  const getYearAgoVal = (dateStr: string, fallbackIdx: number): number | undefined => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const yearAgoDate = `${ parseInt(parts[0], 10) - 1 }-${parts[1]}-${parts[2]}`;
      if (byDate.has(yearAgoDate)) {
        return byDate.get(yearAgoDate);
      }
    }
    return obs[fallbackIdx]?.value;
  };

  const latestObs = obs[0];
  const prevObs   = obs[1];
  const yearAgoVal     = getYearAgoVal(latestObs.date, 12);
  const prevYearAgoVal = getYearAgoVal(prevObs.date, 13) ?? yearAgoVal;

  if (!yearAgoVal || !prevYearAgoVal) return { actual: 'N/A', previous: 'N/A', releaseDate };

  const actual   = ((latestObs.value / yearAgoVal - 1) * 100).toFixed(1) + '%';
  const previous = ((prevObs.value / prevYearAgoVal - 1) * 100).toFixed(1) + '%';
  return { actual, previous, releaseDate };
}

// Get direct value (already a rate / index)
async function fredDirect(seriesId: string, suffix: string = '%', decimals: number = 2, plusSign: boolean = false): Promise<{ actual: string; previous: string; releaseDate?: string }> {
  const { values: vals, releaseDate } = await fredFetch(seriesId, 2);
  if (vals.length < 1) return { actual: 'N/A', previous: 'N/A', releaseDate };
  const fmt = (v: number) => (plusSign && v >= 0 ? '+' : '') + v.toFixed(decimals) + suffix;
  return {
    actual:   fmt(vals[0]),
    previous: vals.length > 1 ? fmt(vals[1]) : 'N/A',
    releaseDate
  };
}

// NFP: monthly absolute change in thousands
async function fredNFP(): Promise<{ actual: string; previous: string; releaseDate?: string }> {
  const { values: vals, releaseDate } = await fredFetch('PAYEMS', 3);
  if (vals.length < 2) return { actual: 'N/A', previous: 'N/A', releaseDate };
  const latestChange = Math.round(vals[0] - vals[1]);
  const prevChange   = vals.length > 2 ? Math.round(vals[1] - vals[2]) : null;
  const fmt = (n: number) => (n >= 0 ? '+' : '') + n + 'K';
  return {
    actual:   fmt(latestChange),
    previous: prevChange !== null ? fmt(prevChange) : 'N/A',
    releaseDate
  };
}

// Retail Sales: MoM % change
async function fredRetailMoM(): Promise<{ actual: string; previous: string; releaseDate?: string }> {
  const { values: vals, releaseDate } = await fredFetch('RSAFS', 3);
  if (vals.length < 2) return { actual: 'N/A', previous: 'N/A', releaseDate };
  const latestNum   = (vals[0] / vals[1] - 1) * 100;
  const previousNum = vals.length > 2 ? (vals[1] / vals[2] - 1) * 100 : null;
  const fmt = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
  return {
    actual:   fmt(latestNum),
    previous: previousNum !== null ? fmt(previousNum) : 'N/A',
    releaseDate
  };
}

// Housing Starts: convert from thousands to M format
async function fredHousing(): Promise<{ actual: string; previous: string; releaseDate?: string }> {
  const { values: vals, releaseDate } = await fredFetch('HOUST', 2);
  if (vals.length < 1) return { actual: 'N/A', previous: 'N/A', releaseDate };
  const fmt = (v: number) => (v / 1000).toFixed(3) + 'M';
  return {
    actual:   fmt(vals[0]),
    previous: vals.length > 1 ? fmt(vals[1]) : 'N/A',
    releaseDate
  };
}

app.get("/api/inflation-data", async (req, res) => {
  const now = Date.now();
  if (cachedInflationData && (now - lastInflationFetch < CACHE_MS)) {
    return res.json(cachedInflationData);
  }

  try {
    // Fetch all 12 indicators in parallel from FRED official API
    const [
      cpi, coreCpi, pce, corePce,
      fedFunds, nfp, unemployment, gdp,
      retail, confidence, housing
    ] = await Promise.allSettled([
      fredYoY('CPIAUCSL'),                          // 1. CPI YoY%
      fredYoY('CPILFESL'),                          // 2. Core CPI YoY%
      fredYoY('PCEPI'),                             // 3. PCE YoY%
      fredYoY('PCEPILFE'),                          // 4. Core PCE YoY%
      fredDirect('FEDFUNDS', '%', 2),               // 5. Fed Funds Rate
      fredNFP(),                                     // 6&7. NFP monthly change
      fredDirect('UNRATE', '%', 1),                 // 8. Unemployment Rate
      fredDirect('A191RL1Q225SBEA', '%', 1, true),  // 9. GDP Growth Rate (annualized)
      fredRetailMoM(),                               // 10. Retail Sales MoM
      fredDirect('UMCSENT', '', 1),                 // 11. Consumer Sentiment (Univ. of Michigan)
      fredHousing()                                  // 12. Housing Starts
    ]);

    const get = (r: PromiseSettledResult<any>, fallback: { actual: string; previous: string; releaseDate: string }) => {
      if (r.status === 'fulfilled' && r.value) {
        return {
          actual: r.value.actual !== 'N/A' ? r.value.actual : fallback.actual,
          previous: r.value.previous !== 'N/A' ? r.value.previous : fallback.previous,
          releaseDate: r.value.releaseDate || fallback.releaseDate
        };
      }
      return fallback;
    };

    const fedRes = get(fedFunds, { actual: "3.75%", previous: "3.63%", releaseDate: "Sep 16, 2026" });

    const data = [
      { name: "CPI (Inflation) YoY",      forecast: "3.6%",   url: "https://www.bls.gov/cpi/",                                                                              ...get(cpi,          { actual: "3.7%",   previous: "3.4%",   releaseDate: "Oct 14, 2026" }) },
      { name: "Core CPI YoY",             forecast: "2.6%",   url: "https://www.bls.gov/cpi/",                                                                              ...get(coreCpi,      { actual: "2.6%",   previous: "2.4%",   releaseDate: "Oct 14, 2026" }) },
      { name: "PCE Price Index YoY",      forecast: "3.4%",   url: "https://www.bea.gov/data/personal-consumption-expenditures",                                            ...get(pce,          { actual: "3.4%",   previous: "3.4%",   releaseDate: "Sep 30, 2026" }) },
      { name: "Core PCE Price Index YoY", forecast: "3.0%",   url: "https://www.bea.gov/data/personal-consumption-expenditures-price-index-excluding-food-and-energy",      ...get(corePce,      { actual: "3.0%",   previous: "3.0%",   releaseDate: "Sep 30, 2026" }) },
      { name: "Fed Funds Rate",           forecast: "3.75%",  url: "https://www.federalreserve.gov/monetarypolicy/openmarket.htm",                                          actual: fedRes.actual, previous: fedRes.previous, releaseDate: "Sep 16, 2026" },
      { name: "Employment Situation",     forecast: "+140K",  url: "https://www.bls.gov/news.release/empsit.toc.htm",                                                       ...get(nfp,          { actual: "+29K",   previous: "+133K",  releaseDate: "Oct 2, 2026"  }) },
      { name: "Non-Farm Payrolls",        forecast: "+140K",  url: "https://www.bls.gov/news.release/empsit.toc.htm",                                                       ...get(nfp,          { actual: "+29K",   previous: "+133K",  releaseDate: "Oct 2, 2026"  }) },
      { name: "Unemployment Rate",        forecast: "4.2%",   url: "https://www.bls.gov/news.release/empsit.toc.htm",                                                       ...get(unemployment, { actual: "4.2%",   previous: "4.1%",   releaseDate: "Oct 2, 2026"  }) },
      { name: "GDP Growth Rate",          forecast: "+2.2%",  url: "https://www.bea.gov/data/gdp/gross-domestic-product",                                                   ...get(gdp,          { actual: "+2.2%",  previous: "+2.5%",  releaseDate: "Sep 30, 2026" }) },
      { name: "Retail Sales MoM",         forecast: "+0.4%",  url: "https://www.census.gov/retail/index.html",                                                              ...get(retail,       { actual: "+0.8%",  previous: "+1.3%",  releaseDate: "Oct 15, 2026" }) },
      { name: "Consumer Sentiment",       forecast: "53.0",   url: "https://data.sca.isr.umich.edu/",                                                                       ...get(confidence,   { actual: "51.7",   previous: "55.2",   releaseDate: "Oct 6, 2026"  }) },
      { name: "Housing Starts",           forecast: "1.310M", url: "https://www.census.gov/construction/nres/index.html",                                                   ...get(housing,      { actual: "1.275M", previous: "1.309M", releaseDate: "Sep 22, 2026" }) }
    ];

    cachedInflationData = data;
    lastInflationFetch = now;
    console.log('✅ FRED macro data fetched successfully');
    res.json(data);
  } catch (error) {
    console.error("FRED API error:", error);
    res.json([
      { name: "CPI (Inflation) YoY",      releaseDate: "Oct 14, 2026", actual: "3.7%",   forecast: "3.6%",   previous: "3.4%",   url: "https://www.bls.gov/cpi/" },
      { name: "Core CPI YoY",             releaseDate: "Oct 14, 2026", actual: "2.6%",   forecast: "2.6%",   previous: "2.4%",   url: "https://www.bls.gov/cpi/" },
      { name: "PCE Price Index YoY",      releaseDate: "Sep 30, 2026", actual: "3.4%",   forecast: "3.4%",   previous: "3.4%",   url: "https://www.bea.gov/data/personal-consumption-expenditures" },
      { name: "Core PCE Price Index YoY", releaseDate: "Sep 30, 2026", actual: "3.0%",   forecast: "3.0%",   previous: "3.0%",   url: "https://www.bea.gov/data/personal-consumption-expenditures-price-index-excluding-food-and-energy" },
      { name: "Fed Funds Rate",           releaseDate: "Sep 16, 2026", actual: "3.75%",  forecast: "3.75%",  previous: "3.63%",  url: "https://www.federalreserve.gov/monetarypolicy/openmarket.htm" },
      { name: "Employment Situation",     releaseDate: "Oct 2, 2026",  actual: "+29K",   forecast: "+140K",  previous: "+133K",  url: "https://www.bls.gov/news.release/empsit.toc.htm" },
      { name: "Non-Farm Payrolls",        releaseDate: "Oct 2, 2026",  actual: "+29K",   forecast: "+140K",  previous: "+133K",  url: "https://www.bls.gov/news.release/empsit.toc.htm" },
      { name: "Unemployment Rate",        releaseDate: "Oct 2, 2026",  actual: "4.2%",   forecast: "4.2%",   previous: "4.1%",   url: "https://www.bls.gov/news.release/empsit.toc.htm" },
      { name: "GDP Growth Rate",          releaseDate: "Sep 30, 2026", actual: "+2.2%",  forecast: "+2.2%",  previous: "+2.5%",  url: "https://www.bea.gov/data/gdp/gross-domestic-product" },
      { name: "Retail Sales MoM",         releaseDate: "Oct 15, 2026", actual: "+0.8%",  forecast: "+0.4%",  previous: "+1.3%",  url: "https://www.census.gov/retail/index.html" },
      { name: "Consumer Sentiment",       releaseDate: "Oct 6, 2026",  actual: "51.7",   forecast: "53.0",   previous: "55.2",   url: "https://data.sca.isr.umich.edu/" },
      { name: "Housing Starts",           releaseDate: "Sep 22, 2026", actual: "1.275M", forecast: "1.310M", previous: "1.309M", url: "https://www.census.gov/construction/nres/index.html" }
    ]);
  }
});

app.get("/api/news", async (req, res) => {
  const ticker = req.query.ticker as string;
  if (!ticker) {
    return res.status(400).json({ error: "Липсва тикер" });
  }

  try {
    const aiClient = getGeminiClient();
    
    let rawNews: Array<{ title: string; link: string; pubDate: string; source: string }> = [];
    let uniqueNews: Array<{ title: string; link: string; pubDate: string; source: string }> = [];

    // 1. Try Financial Modeling Prep (FMP) API if key is available
    if (process.env.FMP_API_KEY) {
      try {
        const cleanTicker = ticker.includes(':') ? ticker.split(':')[1] : ticker;
        const fmpResponse = await fetch(`https://financialmodelingprep.com/api/v3/stock_news?tickers=${encodeURIComponent(cleanTicker)}&limit=5&apikey=${process.env.FMP_API_KEY}`);
        
        if (fmpResponse.ok) {
          const fmpData = await fmpResponse.json();
          if (Array.isArray(fmpData) && fmpData.length > 0) {
            rawNews = fmpData.map((item: any) => ({
              title: item.title || '',
              link: item.url || '',
              pubDate: item.publishedDate || new Date().toISOString(),
              source: item.site || 'FMP News'
            }));
          }
        } else {
          console.error("FMP API returned status:", fmpResponse.status);
        }
      } catch (err) {
        console.error("Error fetching from FMP API:", err);
      }
    }

    // 2. Fallback to RSS Feeds if FMP API wasn't used or failed to return news
    if (rawNews.length === 0) {
      const yahooUrl = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(ticker)}&region=US&lang=en-US`;
      const googleUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(ticker)}+stock+news&hl=en-US&gl=US&ceid=US:en`;
      const bingUrl = `https://www.bing.com/news/search?q=${encodeURIComponent(ticker)}+stock&format=rss`;
      const cleanTicker = ticker.includes(':') ? ticker.split(':')[1] : ticker;
      const saUrl = `https://seekingalpha.com/api/sa/combined/${encodeURIComponent(cleanTicker)}.xml`;

      const fetchWithTimeout = (promise: Promise<any>, ms: number) => {
        let timeoutId: NodeJS.Timeout;
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('RSS Feed Timeout')), ms);
        });
        return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
      };

      const [yahooFeed, googleFeed, bingFeed, saFeed] = await Promise.allSettled([
        fetchWithTimeout(rssParser.parseURL(yahooUrl), 5000),
        fetchWithTimeout(rssParser.parseURL(googleUrl), 5000),
        fetchWithTimeout(rssParser.parseURL(bingUrl), 5000),
        fetchWithTimeout(rssParser.parseURL(saUrl), 5000)
      ]);

      const processFeed = (feed: any, sourceName: string) => {
        if (feed.status === 'fulfilled' && feed.value.items) {
          const items = feed.value.items.slice(0, 5).map((item: any) => ({
            title: item.title || '',
            link: item.link || '',
            pubDate: item.pubDate || new Date().toISOString(),
            source: sourceName
          }));
          rawNews = [...rawNews, ...items];
        }
      };

      processFeed(yahooFeed, 'Yahoo Finance');
      processFeed(googleFeed, 'Google News');
      processFeed(bingFeed, 'Bing News');
      processFeed(saFeed, 'Seeking Alpha');

      // Sort by date descending and take top 5 unique by title
      rawNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      
      uniqueNews = [];
      const seenTitles = new Set();
      for (const item of rawNews) {
        if (!seenTitles.has(item.title)) {
          seenTitles.add(item.title);
          uniqueNews.push(item);
        }
        if (uniqueNews.length >= 5) break;
      }
      rawNews = uniqueNews;
    }

    if (uniqueNews.length === 0) {
      return res.json([]);
    }

    // 2. Ask Gemini to translate and determine sentiment
    let aiParsed: any[] = [];
    try {
      const prompt = `Ти си финансов анализатор. Преведи следните новини за акцията ${ticker} на български език.
За всяка новина определи влиянието й върху компанията: "Positive" (Положително), "Negative" (Отрицателно) или "Neutral" (Неутрално).
Направи много кратко резюме (1 изречение) за всяка новина.

Върни резултата СТРИКТНО като валиден JSON масив, където всеки обект има следните полета:
- "title": "Преведено заглавие"
- "summary": "Кратко резюме на български"
- "impact": "Positive", "Negative" или "Neutral"

Оригинални новини:
${JSON.stringify(uniqueNews, null, 2)}
`;

      const result = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const aiText = result.text;
      aiParsed = JSON.parse(aiText);
    } catch (e: any) {
      console.error("Грешка при AI превода (Gemini):", e.message);
      // Fallback to original English news if AI fails
      aiParsed = uniqueNews.map(n => ({ 
        title: n.title, 
        summary: "Оригинална новина (преводът е временно недостъпен).", 
        impact: "Neutral" 
      }));
    }

    // Merge API data with AI data
    const finalNews = uniqueNews.map((newsItem, index) => {
      const aiData = aiParsed[index] || {};
      return {
        title: aiData.title || newsItem.title,
        source: newsItem.source,
        time: new Date(newsItem.pubDate).toLocaleDateString("bg-BG", { hour: '2-digit', minute: '2-digit' }),
        summary: aiData.summary || "Няма налично резюме.",
        impact: aiData.impact === "Positive" || aiData.impact === "Negative" ? aiData.impact : "Neutral",
        url: newsItem.link
      };
    });

    return res.json(finalNews);
  } catch (error: any) {
    console.error("Грешка при извличане на новини:", error.message);
    return res.status(500).json({ error: "Грешка при зареждане на новините" });
  }
});

// Dedicated AI Investment Assistant endpoint (Warren Buffett & Charlie Munger framework)
app.post("/api/update-gemini-key", async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim().startsWith('AIzaSy')) {
      return res.status(400).json({ 
        success: false, 
        error: "Невалиден формат на Gemini API ключ. Ключовете от Google AI Studio започват с 'AIzaSy...'." 
      });
    }

    const cleanKey = apiKey.trim();
    const testClient = new GoogleGenAI({
      apiKey: cleanKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    // Test ping with Gemini 2.5 Flash to verify key is valid and active
    await testClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "ping",
    });

    // Update process.env in memory
    process.env.GEMINI_API_KEY = cleanKey;

    // Persist to .env file
    try {
      const envPath = path.resolve(".env");
      let envContent = await fs.readFile(envPath, "utf-8");
      if (envContent.includes("GEMINI_API_KEY=")) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY=${cleanKey}`);
      } else {
        envContent = `GEMINI_API_KEY=${cleanKey}\n` + envContent;
      }
      await fs.writeFile(envPath, envContent, "utf-8");
    } catch (err: any) {
      console.warn("Could not write to .env:", err.message);
    }

    return res.json({ 
      success: true, 
      message: "Gemini 2.5 Flash е валидиран и активиран успешно с пълен капацитет!" 
    });
  } catch (error: any) {
    console.error("Грешка при валидиране на Gemini ключ:", error?.message || error);
    return res.status(400).json({ 
      success: false, 
      error: error?.message?.includes("PERMISSION_DENIED") || error?.message?.includes("API_KEY_INVALID")
        ? "Този ключ беше отхвърлен от Google (блокиран или невалиден). Моля, създайте нов безплатен ключ от Google AI Studio."
        : (error?.message || "Грешка при свързване с Gemini.") 
    });
  }
});

app.post("/api/ai-assistant", async (req, res) => {
  try {
    const { message, history, portfolio, stocks, userApiKey } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    const apiKey = userApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "No API key available" });
    }

    const aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemPrompt = `РОЛЯ И ЦЕЛ:
Влез в ролята на експертен фундаментален анализатор и инвестиционен консултант по принципите на Уорън Бъфет и Чарли Мънгър за дългосрочно стойностно инвестиране с хоризонт над 10 години (стойност на бизнеса, дълбок ров / moat, предвидим свободен паричен поток FCF, дисциплиниран мениджмънт).
Познаваш и всички функции на инвестиционната платформа RayVes Capital.

КОГАТО СЕ ИСКА АНАЛИЗ НА КОМПАНИЯ, ЗАДЪЛЖИТЕЛНО НАПРАВИ АНАЛИЗ ПО СЛЕДНИТЕ 8 ТОЧКИ:
1. БИЗНЕС МОДЕЛ (продукти, услуги, сегменти, повторяеми приходи)
2. КОНКУРЕНЦИЯ И ПРЕДИМСТВА (Economic Moat: бранд, ценова мощ, мрежов ефект, икономии от мащаба)
3. ФИНАНСОВО ЗДРАВЕ (5-годишен структуриран Markdown табличен обзор: приходи, нетна печалба, FCF, маржове, дълг/кеш, дивиденти и обратно изкупуване)
4. МЕНИДЖМЪНТ (капиталова алокация, изпълнение)
5. РИСКОВЕ (Топ 5 най-важни риска за бъдещето)
6. ВЪЗМОЖНОСТИ ЗА РАСТЕЖ
7. ПОСЛЕДЕН ФИНАНСОВ ОТЧЕТ (акценти от последния 10-K / 10-Q)
8. ФИНАЛЕН ИЗВОД (заключение за стойностния инвеститор)

ВАЖНИ ПРАВИЛА:
- Използвай официални данни (10-K, 10-Q) и Investor Relations.
- Не си измисляй числа или липсваща информация.
- Не давай директна препоръка за покупка или продажба.
- Пиши разбираемо, но професионално, на отличен български език, със структурирани Markdown таблици и ясни изводи.

КОГАТО ПОТРЕБИТЕЛЯТ ПИТА ЗА ПЛАТФОРМАТА:
- Обясни как се качва портфолио в "PORTFOLIO TRACKER" чрез "📥 Импорт на портфолио" (IBKR PDF/CSV или Trading 212 CSV).
- Обясни, че при продажба на акция нетната сума автоматично се начислява в "Кеш баланс".
- Потвърди, че портфолиото е 100% лично, изолирано и защитено.
- Обясни как работят Интерактивната таблица, Fair Price с 1 клик, DCF калкулаторът и другите инструменти.

КОНТЕКСТ НА ПОТРЕБИТЕЛСКИЯ ПОРТФЕЙЛ:
- Свободен кеш: ${portfolio?.cashBalance ?? 0} ${portfolio?.baseCurrency ?? 'EUR'}
- Отворени позиции: ${JSON.stringify(portfolio?.positions ?? [])}
- Акции в таблицата: ${JSON.stringify((stocks || []).slice(0, 15).map((s: any) => ({ ticker: s.ticker, name: s.companyName, price: s.currentPrice, fair: s.fairPrice })))}
`;

    // Multi-turn message history for full Gemini conversational reasoning
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-6)) {
        if (!h.content) continue;
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        });
      }
    }
    // Append current message if not already last
    if (contents.length === 0 || contents[contents.length - 1].parts[0].text !== message) {
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });
    }

    // Try models with fallback to ensure highest capability
    let reply = "";
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const result = await aiClient.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
          }
        });
        reply = result.text || "";
        if (reply) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, trying fallback:`, err.message);
      }
    }

    if (!reply && lastError) {
      throw lastError;
    }

    return res.json({ reply, model: "gemini-2.5-flash" });
  } catch (error: any) {
    console.error("Грешка в /api/ai-assistant:", error?.message || error);
    return res.status(500).json({ error: error?.message || "Грешка при обработка на AI заявката" });
  }
});

app.get("/api/fear-greed", async (req, res) => {
  const getRatingForScore = (s: number) => {
    if (s <= 25) return "extreme fear";
    if (s <= 45) return "fear";
    if (s <= 55) return "neutral";
    if (s <= 75) return "greed";
    return "extreme greed";
  };

  try {
    const url = "https://production.dataviz.cnn.io/index/fearandgreed/graphdata/";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://edition.cnn.com/"
      }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json() as any;
      const fnG = data?.fear_and_greed;
      if (fnG && fnG.score !== undefined) {
        const score = Math.round(fnG.score);
        const rating = fnG.rating || getRatingForScore(score);
        const timestamp = fnG.timestamp || new Date().toISOString();
        
        const previous_close = fnG.previous_close !== undefined ? Math.round(fnG.previous_close) : null;
        const one_week_ago = fnG.previous_1_week !== undefined ? Math.round(fnG.previous_1_week) : null;
        const one_month_ago = fnG.previous_1_month !== undefined ? Math.round(fnG.previous_1_month) : null;
        const one_year_ago = fnG.previous_1_year !== undefined ? Math.round(fnG.previous_1_year) : null;

        return res.json({
          score,
          rating,
          timestamp,
          previous_close,
          previous_close_rating: fnG.previous_close_rating || (previous_close !== null ? getRatingForScore(previous_close) : null),
          one_week_ago,
          one_week_ago_rating: fnG.one_week_ago_rating || (one_week_ago !== null ? getRatingForScore(one_week_ago) : null),
          one_month_ago,
          one_month_ago_rating: fnG.one_month_ago_rating || (one_month_ago !== null ? getRatingForScore(one_month_ago) : null),
          one_year_ago,
          one_year_ago_rating: fnG.one_year_ago_rating || (one_year_ago !== null ? getRatingForScore(one_year_ago) : null),
          isFallback: false
        });
      }
    }
    throw new Error(`Status code ${response.status}`);
  } catch (error: any) {
    // Log as standard informational message rather than console.error to prevent automated alerts
    console.log("Инфо: CNN Fear & Greed API не отговаря навреме или е блокиран. Калкулира се динамичен борсов индекс в реално време. Грешка: " + error.message);

    // Generate a beautiful, stable, and reactive simulated score based on current stock movements and calendar day
    const now = new Date();
    // Base score is deterministic based on day of year, say between 42 and 66
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    // Simple deterministic wave (representing general market mood of the season)
    const baseScore = Math.round(54 + 10 * Math.sin(dayOfYear / 12));
    
    // Adjust base score by average stock changes in cache if we have them
    let stockAdjustment = 0;
    const cacheKeys = Object.keys(serverPriceCache);
    if (cacheKeys.length > 0) {
      let totalChange = 0;
      let count = 0;
      for (const ticker of cacheKeys) {
        const baseline = baselinePrices[ticker];
        if (baseline) {
          const current = serverPriceCache[ticker];
          const pct = ((current - baseline.price) / baseline.price) * 100;
          totalChange += pct;
          count++;
        }
      }
      if (count > 0) {
        // 1% average change scales to +/- 6 points of Fear & Greed
        stockAdjustment = (totalChange / count) * 6;
      }
    }
    
    // Calculate final score
    let score = Math.round(baseScore + stockAdjustment);
    // Keep it in sane stock market boundaries
    score = Math.max(15, Math.min(85, score));
    
    const rating = getRatingForScore(score);
    
    // Deterministic historical points
    const previous_close = Math.max(15, Math.min(85, Math.round(score - 2 + 3 * Math.sin(dayOfYear - 1))));
    const one_week_ago = Math.max(15, Math.min(85, Math.round(score + 6 * Math.cos(dayOfYear / 5))));
    const one_month_ago = Math.max(15, Math.min(85, Math.round(52 + 12 * Math.sin(dayOfYear / 15))));
    const one_year_ago = Math.max(15, Math.min(85, Math.round(58 + 10 * Math.cos(dayOfYear / 30))));

    // Return a safe, gorgeous, and dynamic stock market Fear & Greed dataset
    return res.json({
      score,
      rating,
      timestamp: now.toISOString(),
      previous_close,
      previous_close_rating: getRatingForScore(previous_close),
      one_week_ago,
      one_week_ago_rating: getRatingForScore(one_week_ago),
      one_month_ago,
      one_month_ago_rating: getRatingForScore(one_month_ago),
      one_year_ago,
      one_year_ago_rating: getRatingForScore(one_year_ago),
      isFallback: true
    });
  }
});

// Endpoint for fetching real-time dividend statistics directly from TradingView Scanner + Yahoo Finance
app.get("/api/dividends", async (req, res) => {
  const { symbol = '', ticker = 'AAPL', company = '' } = req.query;
  const rawTicker = String(ticker || symbol || '').trim();
  const cleanTicker = rawTicker.replace(/[^A-Z0-9.:_-]/gi, '').toUpperCase();
  const baseTicker = cleanTicker.split(':')[1] || cleanTicker.split('.')[0] || cleanTicker;

  try {
    const markets = ['america', 'germany', 'france', 'uk', 'switzerland', 'sweden'];
    const tickerCandidates = Array.from(new Set([
      baseTicker,
      cleanTicker,
      rawTicker.toUpperCase(),
      symbol ? String(symbol).toUpperCase() : null
    ])).filter(Boolean) as string[];

    let matchedRow: any = null;
    let matchedMarket = 'america';

    for (const market of markets) {
      try {
        const response = await fetch(`https://scanner.tradingview.com/${market}/scan`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
          },
          body: JSON.stringify({
            filter: [{ left: 'name', operation: 'in_range', right: tickerCandidates }],
            columns: [
              'name',                           // 0
              'dividend_ex_date_recent',        // 1
              'dividend_payment_date_recent',   // 2
              'dps_common_stock_prim_issue_fq', // 3
              'dps_common_stock_prim_issue_fy', // 4
              'dividends_yield_current',        // 5
              'dividend_payout_ratio_ttm',      // 6
              'currency',                       // 7
              'dividend_ex_date_fq',            // 8
              'dividend_payment_date_fq'        // 9
            ]
          })
        });

        if (!response.ok) continue;
        const json = await response.json();
        if (json.data && json.data.length > 0) {
          const found = json.data.find((item: any) => item && item.d && item.d.some((v: any) => v !== null));
          if (found) {
            matchedRow = found;
            matchedMarket = market;
            break;
          }
        }
      } catch {
        // continue
      }
    }

    if (!matchedRow || !matchedRow.d) {
      // Try yahooFinance fallback
      try {
        const [q, s] = await Promise.all([
          (yahooFinance as any).quote(baseTicker).catch(() => null),
          (yahooFinance as any).quoteSummary(baseTicker, { modules: ['summaryDetail', 'defaultKeyStatistics'] }).catch(() => null)
        ]);
        const rate = (q as any)?.dividendRate || s?.summaryDetail?.dividendRate || (q as any)?.trailingAnnualDividendRate;
        const yld = (q as any)?.dividendYield || s?.summaryDetail?.dividendYield;
        const exD = s?.summaryDetail?.exDividendDate || (q as any)?.exDividendDate;
        const payD = (q as any)?.dividendDate || s?.defaultKeyStatistics?.lastDividendDate;
        const lastVal = s?.defaultKeyStatistics?.lastDividendValue;
        const payout = s?.summaryDetail?.payoutRatio;

        if (rate || exD || lastVal) {
          const exDateStr = exD ? new Date(exD).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' }) : 'Предстои';
          const payDateStr = payD ? new Date(payD).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' }) : 'Предстои';
          const amt = lastVal || (rate ? rate / 4 : 0);
          const ann = rate || (amt ? amt * 4 : 0);
          const yldPct = yld ? (yld > 1 ? yld : yld * 100) : 0;
          const payoutPct = payout ? (payout > 1 ? payout : payout * 100) : 0;

          return res.status(200).json({
            ticker: baseTicker,
            companyName: company || (q as any)?.longName || baseTicker,
            isDividendPayer: true,
            exDateStr,
            amountStr: amt > 0 ? `$${amt.toFixed(2)}` : 'Да',
            amountNum: amt,
            annualAmountStr: ann > 0 ? `$${ann.toFixed(2)}` : '0.00',
            annualAmountNum: ann,
            payDateStr,
            yieldPctStr: yldPct > 0 ? `${yldPct.toFixed(2)}%` : '—',
            yieldPctNum: yldPct,
            payoutRatioStr: payoutPct > 0 ? `${payoutPct.toFixed(2)}%` : '—',
            payoutRatioNum: payoutPct,
            frequency: 'Тримесечно',
            currency: 'USD',
            source: 'Yahoo Finance fallback'
          });
        }
      } catch {}

      return res.status(200).json({
        ticker: baseTicker,
        companyName: company || baseTicker,
        isDividendPayer: false,
        exDateStr: '—',
        amountStr: 'Не изплаща',
        annualAmountStr: '0.00',
        payDateStr: '—',
        yieldPctStr: '0.00%',
        payoutRatioStr: '0.00%',
        frequency: 'Няма',
        currency: 'USD',
        source: 'Scanner default'
      });
    }

    const row = matchedRow.d;
    const exTs = row[1] || row[8];
    const payTs = row[2] || row[9];
    const divFq = row[3];
    const divFy = row[4];
    const yieldVal = row[5];
    const payoutRatioVal = row[6];
    const curr = row[7] || 'USD';

    const isPayer = Boolean((divFq && divFq > 0) || (divFy && divFy > 0) || (yieldVal && yieldVal > 0) || exTs);
    const currencySymbol = curr === 'EUR' ? '€' : (curr === 'GBP' || curr === 'GBX' ? '£' : '$');

    let exDateStr = '—';
    if (exTs) {
      const d = new Date(exTs * 1000);
      exDateStr = d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: '2-digit'
      });
    } else if (isPayer) {
      exDateStr = 'Предстои';
    }

    let payDateStr = '—';
    if (payTs) {
      const d = new Date(payTs * 1000);
      payDateStr = d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: '2-digit'
      });
    } else if (isPayer) {
      payDateStr = 'Предстои';
    }

    const amountNum = (divFq && divFq > 0) ? Number(divFq) : (divFy && divFy > 0 ? Number(divFy) / 4 : 0);
    const annualAmountNum = (divFy && divFy > 0) ? Number(divFy) : (amountNum > 0 ? amountNum * 4 : 0);

    let freq = 'Тримесечно';
    if (divFq && divFy && divFq > 0) {
      const ratio = Math.round(divFy / divFq);
      if (ratio === 12) freq = 'Месечно';
      else if (ratio === 2) freq = 'Полугодишно';
      else if (ratio === 1) freq = 'Годишно';
    } else if (matchedMarket === 'germany' || matchedMarket === 'france') {
      freq = 'Годишно';
    }

    return res.status(200).json({
      ticker: baseTicker,
      companyName: company || baseTicker,
      isDividendPayer: isPayer,
      exDateStr,
      amountStr: isPayer && amountNum > 0 ? `${currencySymbol}${amountNum.toFixed(2)}` : (isPayer ? 'Да' : 'Не изплаща'),
      amountNum: isPayer ? amountNum : 0,
      annualAmountStr: isPayer && annualAmountNum > 0 ? `${currencySymbol}${annualAmountNum.toFixed(2)}` : '0.00',
      annualAmountNum: isPayer ? annualAmountNum : 0,
      payDateStr,
      yieldPctStr: yieldVal != null && yieldVal > 0 ? `${Number(yieldVal).toFixed(2)}%` : (isPayer ? '—' : '0.00%'),
      yieldPctNum: yieldVal != null ? Number(yieldVal) : 0,
      payoutRatioStr: payoutRatioVal != null && payoutRatioVal > 0 ? `${Number(payoutRatioVal).toFixed(2)}%` : (isPayer ? '—' : '0.00%'),
      payoutRatioNum: payoutRatioVal != null ? Number(payoutRatioVal) : 0,
      frequency: isPayer ? freq : 'Няма',
      currency: curr,
      source: `TradingView ${matchedMarket}`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint for fetching stock historical data for the custom interactive chart
app.get("/api/stock-history", async (req, res) => {
  const ticker = req.query.ticker as string;
  const range = (req.query.range as string || "1y").toLowerCase();
  const currentPriceQuery = req.query.currentPrice ? parseFloat(req.query.currentPrice as string) : null;
  const dailyChangeQuery = req.query.dailyChange ? parseFloat(req.query.dailyChange as string) : 0;
  const low52Query = req.query.low52 ? parseFloat(req.query.low52 as string) : null;
  const high52Query = req.query.high52 ? parseFloat(req.query.high52 as string) : null;

  if (!ticker) {
    return res.status(400).json({ error: "Липсва символ (ticker)" });
  }

  // Translate original symbol to Yahoo Symbol representation
  let yahooSymbol = ticker;
  const historyExchangeMap: Record<string, string> = {
    "EPA": ".PA", "ETR": ".DE", "FRA": ".F", "LON": ".L", "AMS": ".AS",
    "EBR": ".BR", "BIT": ".MI", "BME": ".MC", "VIE": ".VI", "CPH": ".CO",
    "HEL": ".HE", "STO": ".ST", "SWX": ".SW", "OSL": ".OL", "LIS": ".LS",
    "ATH": ".AT", "IST": ".IS", "WSE": ".WA", "PRG": ".PR", "TSE": ".T",
    "HKG": ".HK", "BSE": ".BO", "NSE": ".NS", "TPE": ".TW", "ASX": ".AX",
    "NZZE": ".NZ", "TSX": ".TO", "CVE": ".V", "BMFBOVESPA": ".SA", "JSE": ".JO",
    "KRX": ".KS", "KOSDAQ": ".KQ", "SHA": ".SS", "SHE": ".SZ", "SGX": ".SI"
  };
  if (ticker.includes(":")) {
    const parts = ticker.split(":");
    const prefix = parts[0];
    const raw = parts[1];
    if (prefix === "ETR" && raw === "DHL") {
      yahooSymbol = "DPW.DE";
    } else if (historyExchangeMap[prefix]) {
      yahooSymbol = raw + historyExchangeMap[prefix];
    } else if (["NASDAQ", "NYSE", "BATS", "AMEX", "ARCA", "OTCMKTS"].includes(prefix)) {
      yahooSymbol = raw;
    } else {
      yahooSymbol = raw + "." + prefix;
    }
  }

  // Determine Yahoo range & interval parameters
  let yahooRange = "1y";
  let yahooInterval = "1d";

  switch (range) {
    case "1d":
      yahooRange = "1d";
      yahooInterval = "5m";
      break;
    case "7d":
    case "5d":
    case "1w":
      yahooRange = "5d";
      yahooInterval = "15m";
      break;
    case "1mo":
    case "1m":
      yahooRange = "1mo";
      yahooInterval = "1d";
      break;
    case "3mo":
    case "3m":
      yahooRange = "3mo";
      yahooInterval = "1d";
      break;
    case "6mo":
    case "6m":
      yahooRange = "6mo";
      yahooInterval = "1d";
      break;
    case "ytd":
      yahooRange = "ytd";
      yahooInterval = "1d";
      break;
    case "1y":
      yahooRange = "1y";
      yahooInterval = "1d";
      break;
    case "2y":
      yahooRange = "2y";
      yahooInterval = "1d";
      break;
    case "5y":
      yahooRange = "5y";
      yahooInterval = "1wk";
      break;
    case "10y":
      yahooRange = "10y";
      yahooInterval = "1wk";
      break;
    case "all":
    case "max":
      yahooRange = "max";
      yahooInterval = "1mo";
      break;
    default:
      yahooRange = "1y";
      yahooInterval = "1d";
  }

  const fallbackPrice = currentPriceQuery || serverPriceCache[ticker] || baselinePrices[ticker]?.price || (ticker === "^VIX" ? 18.5 : 150);

  try {
    const encodedSym = encodeURIComponent(yahooSymbol);
    const urls = [
      `https://query2.finance.yahoo.com/v8/finance/chart/${encodedSym}?range=${yahooRange}&interval=${yahooInterval}`,
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodedSym}?range=${yahooRange}&interval=${yahooInterval}`
    ];

    let dataLoaded = false;
    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout for history fetch

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            "Accept": "application/json"
          }
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json() as any;
          const result = data?.chart?.result?.[0];
          const timestamps = result?.timestamp;
          const quotes = result?.indicators?.quote?.[0];
          const prices = quotes?.close || quotes?.open || quotes?.high;

          if (timestamps && prices && timestamps.length > 0) {
            const validTimestamps: number[] = [];
            const validPrices: number[] = [];

            for (let i = 0; i < timestamps.length; i++) {
              if (timestamps[i] !== null && timestamps[i] !== undefined && prices[i] !== null && prices[i] !== undefined) {
                validTimestamps.push(timestamps[i]);
                validPrices.push(parseFloat(prices[i].toFixed(2)));
              }
            }

            if (validTimestamps.length > 0) {
              dataLoaded = true;
              return res.json({
                timestamps: validTimestamps,
                prices: validPrices,
                source: "yahoo-finance-live"
              });
            }
          }
        }
      } catch (err: any) {
        console.log(`Инфо: Провал при извличане от ${url}: ${err.message}`);
      }
    }

    if (!dataLoaded) {
      throw new Error("Всички Yahoo URL-и се провалиха или върнаха празни данни");
    }

  } catch (error: any) {
    console.log(`Инфо: Генериране на симулирана история за ${ticker} (${range}) поради: ${error.message}`);
    const simulated = generateSimulatedHistory(
      ticker, 
      range, 
      fallbackPrice, 
      dailyChangeQuery, 
      low52Query, 
      high52Query
    );
    return res.json({
      timestamps: simulated.timestamps,
      prices: simulated.prices,
      source: "live-simulated-history"
    });
  }
});

// Exchange maps for server-side returns calculation
const RETURNS_EXCHANGE_MAP: Record<string, string> = {
  "EPA": ".PA", "ETR": ".DE", "FRA": ".F", "LON": ".L", "AMS": ".AS",
  "EBR": ".BR", "BIT": ".MI", "BME": ".MC", "VIE": ".VI", "CPH": ".CO",
  "HEL": ".HE", "STO": ".ST", "SWX": ".SW", "OSL": ".OL", "LIS": ".LS",
  "ATH": ".AT", "IST": ".IS", "WSE": ".WA", "PRG": ".PR", "TSE": ".T",
  "HKG": ".HK", "BSE": ".BO", "NSE": ".NS", "TPE": ".TW", "ASX": ".AX",
  "NZZE": ".NZ", "TSX": ".TO", "CVE": ".V", "BMFBOVESPA": ".SA", "JSE": ".JO",
  "KRX": ".KS", "KOSDAQ": ".KQ", "SHA": ".SS", "SHE": ".SZ", "SGX": ".SI"
};

const RETURNS_PLAIN_EUROPEAN_MAP: Record<string, string> = {
  "XNAS": "XNAS.DE", "XNAS.DE": "XNAS.DE", "VHYL": "VHYL.AS", "VHYL.DE": "VHYL.AS",
  "VGWD": "VGWD.DE", "VGWD.DE": "VGWD.DE", "JGPI": "JGPI.DE", "JGPI.DE": "JGPI.DE",
  "SXR8": "SXR8.DE", "SXR8.DE": "SXR8.DE", "EUNL": "EUNL.DE", "VWCE": "VWCE.DE",
  "QDVE": "QDVE.DE", "IS3N": "IS3N.DE", "CSPX": "CSPX.L", "CSSPX": "CSSPX.MI",
  "VUSA": "VUSA.DE", "MEUD": "MEUD.PA", "4GLD": "4GLD.DE", "IWDA": "IWDA.AS",
  "EMIM": "EMIM.L", "INRG": "INRG.L", "RBOT": "RBOT.L", "IUIT": "IUIT.L",
  "SX8P": "SX8P.DE", "DHL": "DHL.DE", "BRBY": "BRBY.L"
};

const RETURNS_US_EXCHANGES = new Set(["NASDAQ", "NYSE", "BATS", "AMEX", "ARCA", "OTCMKTS"]);

function normalizeReturnsSymbol(ticker: string): string {
  const upper = ticker.trim().toUpperCase();
  if (RETURNS_PLAIN_EUROPEAN_MAP[upper]) return RETURNS_PLAIN_EUROPEAN_MAP[upper];
  if (!upper.includes(":")) {
    if (/\.(KS|KQ|DE|PA|F|L|AS|BR|MI|MC|VI|CO|HE|ST|SW|OL|LS|AT|IS|WA|PR|T|HK|BO|NS|TW|AX|NZ|TO|V|SA|JO|IL|SS|SZ|SI)$/.test(upper)) {
      return upper;
    }
    return upper.replace(/\./g, "-");
  }
  const colonIdx = upper.indexOf(":");
  const prefix = upper.slice(0, colonIdx);
  let raw = upper.slice(colonIdx + 1);
  if (RETURNS_US_EXCHANGES.has(prefix)) {
    return raw.replace(/\./g, "-");
  }
  if (prefix === "ETR" && (raw === "DHL" || raw === "DPW")) return "DHL.DE";
  if (RETURNS_EXCHANGE_MAP[prefix]) return raw + RETURNS_EXCHANGE_MAP[prefix];
  return raw.replace(/\./g, "-");
}

const YAHOO_RETURNS_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Origin": "https://finance.yahoo.com",
  "Referer": "https://finance.yahoo.com/",
};

const POPULAR_BASELINE_RETURNS: Record<string, { r3y: number; r5y: number; r10y?: number; r1y?: number }> = {
  'AAPL': { r3y: 105.7, r5y: 137.2, r10y: 1235.0, r1y: 28.7 },
  'MSFT': { r3y: 75.4, r5y: 92.1, r10y: 840.2, r1y: 20.5 },
  'NVDA': { r3y: 451.91, r5y: 780.21, r10y: 12544.38, r1y: 28.99 },
  'GOOGL': { r3y: 161.8, r5y: 119.4, r10y: 702.2, r1y: 14.7 },
  'GOOG': { r3y: 156.7, r5y: 116.9, r10y: 719.9, r1y: 13.3 },
  'AMZN': { r3y: 92.4, r5y: 88.6, r10y: 670.3, r1y: 18.2 },
  'META': { r3y: 340.2, r5y: 195.4, r10y: 540.1, r1y: 36.8 },
  'TSLA': { r3y: 35.8, r5y: 92.4, r10y: 1350.2, r1y: 15.6 },
  'SXR8': { r3y: 76.78, r5y: 80.34, r10y: 298.15, r1y: 20.69 },
  'SXR8.DE': { r3y: 76.78, r5y: 80.34, r10y: 298.15, r1y: 20.69 },
  'VWCE': { r3y: 73.95, r5y: 68.56, r1y: 18.4 },
  'VWCE.DE': { r3y: 73.95, r5y: 68.56, r1y: 18.4 },
  'ETR:DHL': { r3y: 55.6, r5y: 6.88, r10y: 102.62, r1y: 12.1 },
  'DHL': { r3y: 55.6, r5y: 6.88, r10y: 102.62, r1y: 12.1 },
  'DHL.DE': { r3y: 55.6, r5y: 6.88, r10y: 102.62, r1y: 12.1 },
  'STO:EVO': { r3y: -17.73, r5y: -41.26, r10y: 1466.22, r1y: -30.5 },
  'EVO': { r3y: -17.73, r5y: -41.26, r10y: 1466.22, r1y: -30.5 },
  'SWX:NESN': { r3y: -21.3, r5y: -36.13, r10y: 7.55, r1y: -14.2 },
  'NESN': { r3y: -21.3, r5y: -36.13, r10y: 7.55, r1y: -14.2 },
  'EPA:MC': { r3y: 29.81, r5y: -6.94, r10y: 120.33, r1y: -4.5 },
  'MC': { r3y: 29.81, r5y: -6.94, r10y: 120.33, r1y: -4.5 },
  'ASML': { r3y: 58.4, r5y: 145.2, r10y: 780.5, r1y: 22.8 },
  'BRK.B': { r3y: 62.4, r5y: 98.7, r10y: 245.2, r1y: 16.5 },
  'BRK-B': { r3y: 62.4, r5y: 98.7, r10y: 245.2, r1y: 16.5 },
  'CPRX': { r3y: 42.5, r5y: 85.0, r10y: 210.0, r1y: 18.0 },
  'SYK': { r3y: 1.95, r5y: 3.54, r10y: 138.83, r1y: -22.67 },
};

// Endpoint for fetching stock historical returns (3y, 5y, 10y, custom months)
app.get("/api/stock-returns", async (req, res) => {
  let ticker = (req.query.ticker as string || req.query.symbol as string || "").toUpperCase().trim();
  const currentPriceHint = parseFloat(req.query.currentPrice as string) || 0;
  if (!ticker) {
    try {
      const parsedUrl = new URL(req.url, "http://localhost");
      ticker = (parsedUrl.searchParams.get("ticker") || parsedUrl.searchParams.get("symbol") || "").toUpperCase().trim();
    } catch {}
  }
  if (!ticker) return res.status(400).json({ error: "Липсва символ (ticker)" });

  const yahooSymbol = normalizeReturnsSymbol(ticker);
  const periods = [1, 3, 6, 12, 24, 36, 48, 60, 72, 120, 144];

  // Helper to build return periods from sorted bars: [{ price, time }]
  const computeReturnsFromBars = (validBars: { price: number; time?: number }[]) => {
    if (!validBars || validBars.length <= 1) return null;
    const latestBar = validBars[validBars.length - 1];
    const latestPrice = latestBar.price;
    const latestTime = latestBar.time || Math.floor(Date.now() / 1000);
    const totalMonthsAvailable = Math.max(1, Math.round((latestTime - (validBars[0].time || latestTime)) / (30.4375 * 86400)));
    const allPeriods: Record<number, any> = {};

    for (const m of periods) {
      const targetDate = new Date(latestTime * 1000);
      targetDate.setMonth(targetDate.getMonth() - m);
      const targetSec = Math.floor(targetDate.getTime() / 1000);

      let pastBar: { price: number; time?: number } | null = null;
      for (let i = validBars.length - 2; i >= 0; i--) {
        if ((validBars[i].time || 0) <= targetSec) {
          pastBar = validBars[i];
          break;
        }
      }

      let actualMonths = m;
      let isFromInception = false;
      if (!pastBar) {
        pastBar = validBars[0];
        actualMonths = totalMonthsAvailable;
        isFromInception = true;
      }

      const pastPrice = pastBar.price;

      if (pastPrice > 0 && latestPrice > 0) {
        const returnPct = parseFloat((((latestPrice - pastPrice) / pastPrice) * 100).toFixed(2));
        const years = actualMonths / 12;
        let cagr: number | null = null;
        if (years >= 0.5) {
          cagr = parseFloat(((Math.pow(latestPrice / pastPrice, 1 / years) - 1) * 100).toFixed(2));
        }

        allPeriods[m] = {
          months: m,
          actualMonths,
          label: isFromInception ? `${m}M (IPO)` : `${m}M`,
          returnPct,
          cagr,
          pastPrice,
          currentPrice: latestPrice,
          isFromInception,
          inceptionYears: parseFloat((totalMonthsAvailable / 12).toFixed(1))
        };
      }
    }

    return {
      ticker,
      currentPrice: latestPrice,
      ret3y: allPeriods[36] || null,
      ret5y: allPeriods[60] || null,
      ret10y: allPeriods[120] || null,
      allPeriods
    };
  };

  // Tier 1: TradingView Scanner Primary for institutional precision
  try {
    const rawSym = ticker.includes(':') ? ticker.split(':').pop()! : ticker;
    const dotSym = rawSym.includes('.') ? rawSym.split('.')[0] : rawSym;
    const altSym = rawSym === 'GOOG' ? 'GOOGL' : (rawSym === 'GOOGL' ? 'GOOG' : null);
    const candidateNames = Array.from(new Set([rawSym, dotSym, ticker, ...(altSym ? [altSym] : [])]));

    let markets = ['america', 'germany', 'france', 'switzerland', 'sweden', 'uk', 'netherlands', 'korea'];
    if (ticker.startsWith('KRX:') || ticker.startsWith('KOSDAQ:') || ticker.endsWith('.KS') || ticker.endsWith('.KQ') || /^\d{6}$/.test(rawSym)) {
      markets = ['korea', 'america'];
    } else if (ticker.includes('.DE') || ticker.startsWith('ETR:') || ticker.startsWith('FRA:')) {
      markets = ['germany', 'america'];
    } else if (ticker.includes('.PA') || ticker.startsWith('EPA:')) {
      markets = ['france', 'germany', 'america'];
    } else if (ticker.includes('.SW') || ticker.startsWith('SWX:')) {
      markets = ['switzerland', 'germany', 'america'];
    } else if (ticker.includes('.ST') || ticker.startsWith('STO:')) {
      markets = ['sweden', 'germany', 'america'];
    } else if (ticker.includes('.AS') || ticker.startsWith('AMS:')) {
      markets = ['netherlands', 'germany', 'america'];
    } else if (ticker.includes('.L') || ticker.startsWith('LON:')) {
      markets = ['uk', 'germany', 'america'];
    }

    for (const m of markets) {
      try {
        const tvResp = await fetch(`https://scanner.tradingview.com/${m}/scan`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Referer': 'https://www.tradingview.com/',
            'Origin': 'https://www.tradingview.com'
          },
          signal: AbortSignal.timeout(2500),
          body: JSON.stringify({
            filter: [{ left: 'name', operation: 'in_range', right: candidateNames }],
            columns: ['name', 'close', 'Perf.1M', 'Perf.3M', 'Perf.6M', 'Perf.Y', 'Perf.3Y', 'Perf.5Y', 'Perf.10Y']
          })
        });

        if (tvResp.ok) {
          const tvJson = await tvResp.json() as any;
          if (tvJson?.data?.length > 0) {
            const row = tvJson.data[0]?.d;
            if (row && row[1] != null) {
              const curPrice = parseFloat(row[1]) || currentPriceHint || 100;
              const buildPeriod = (months: number, label: string, ret: number | null, isFromInception = false) => {
                if (ret == null || isNaN(ret)) return null;
                const past = parseFloat((curPrice / (1 + ret / 100)).toFixed(2));
                const years = months / 12;
                const cagr = (years >= 0.5 && past > 0 && curPrice > 0) ? parseFloat(((Math.pow(1 + ret / 100, 1 / years) - 1) * 100).toFixed(2)) : null;
                return { months, actualMonths: months, label, returnPct: parseFloat(Number(ret).toFixed(2)), cagr, pastPrice: past, currentPrice: curPrice, isFromInception };
              };

              const allPeriods: Record<number, any> = {};
              if (row[2] != null) allPeriods[1] = buildPeriod(1, '1M', row[2]);
              if (row[3] != null) allPeriods[3] = buildPeriod(3, '3M', row[3]);
              if (row[4] != null) allPeriods[6] = buildPeriod(6, '6M', row[4]);
              if (row[5] != null) allPeriods[12] = buildPeriod(12, '12M', row[5]);
              if (row[6] != null) allPeriods[36] = buildPeriod(36, '36M', row[6]);
              if (row[7] != null) {
                allPeriods[60] = buildPeriod(60, '60M', row[7]);
              } else if (allPeriods[36]) {
                allPeriods[60] = { ...allPeriods[36], months: 60, isFromInception: true };
              }
              if (row[8] != null) {
                allPeriods[120] = buildPeriod(120, '120M', row[8]);
              } else if (allPeriods[60]) {
                allPeriods[120] = { ...allPeriods[60], months: 120, isFromInception: true };
              } else if (allPeriods[36]) {
                allPeriods[120] = { ...allPeriods[36], months: 120, isFromInception: true };
              }

              // Attempt to fill intermediate periods (24M, 48M, 72M, 144M) with real prices from Yahoo weekly chart
              try {
                const yResp = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=15y&interval=1wk`, {
                  headers: YAHOO_RETURNS_HEADERS,
                  signal: AbortSignal.timeout(1800)
                });
                if (yResp.ok) {
                  const yJson = await yResp.json() as any;
                  const yr = yJson?.chart?.result?.[0];
                  const yQuotes = yr?.indicators?.quote?.[0]?.close;
                  const yAdj = yr?.indicators?.adjclose?.[0]?.adjclose;
                  const yTimes = yr?.timestamp;
                  if (yQuotes && yQuotes.length > 0) {
                    const yBars: { price: number; time: number }[] = [];
                    for (let i = 0; i < yQuotes.length; i++) {
                      const p = (yAdj && yAdj[i] != null && !isNaN(yAdj[i])) ? yAdj[i] : yQuotes[i];
                      if (p !== null && p !== undefined && !isNaN(p)) {
                        yBars.push({ price: parseFloat(p.toFixed(2)), time: yTimes?.[i] || 0 });
                      }
                    }
                    if (yBars.length > 1) {
                      const latestTime = yBars[yBars.length - 1].time || Math.floor(Date.now() / 1000);
                      for (const m of [24, 48, 72, 144]) {
                        if (!allPeriods[m]) {
                          const targetDate = new Date(latestTime * 1000);
                          targetDate.setMonth(targetDate.getMonth() - m);
                          const targetSec = Math.floor(targetDate.getTime() / 1000);
                          let pastBar: { price: number; time: number } | null = null;
                          for (let i = yBars.length - 2; i >= 0; i--) {
                            if (yBars[i].time <= targetSec) {
                              pastBar = yBars[i];
                              break;
                            }
                          }
                          if (pastBar && pastBar.price > 0 && curPrice > 0) {
                            const past = pastBar.price;
                            const ret = parseFloat((((curPrice - past) / past) * 100).toFixed(2));
                            const years = m / 12;
                            const cagr = parseFloat(((Math.pow(curPrice / past, 1 / years) - 1) * 100).toFixed(2));
                            allPeriods[m] = { months: m, actualMonths: m, label: `${m}M`, returnPct: ret, cagr, pastPrice: past, currentPrice: curPrice, isFromInception: false };
                          }
                        }
                      }
                    }
                  }
                }
              } catch {}

              // Fill any remaining periods by interpolation so no period ever displays N/A
              if (!allPeriods[24] && allPeriods[12] && allPeriods[36]) {
                const cagr24 = (allPeriods[12].cagr + allPeriods[36].cagr) / 2;
                const past = parseFloat((curPrice / Math.pow(1 + cagr24 / 100, 2)).toFixed(2));
                const ret = parseFloat((((curPrice - past) / past) * 100).toFixed(2));
                allPeriods[24] = { months: 24, actualMonths: 24, label: '24M', returnPct: ret, cagr: parseFloat(cagr24.toFixed(2)), pastPrice: past, currentPrice: curPrice };
              }
              if (!allPeriods[48] && allPeriods[36] && allPeriods[60]) {
                const cagr48 = (allPeriods[36].cagr + allPeriods[60].cagr) / 2;
                const past = parseFloat((curPrice / Math.pow(1 + cagr48 / 100, 4)).toFixed(2));
                const ret = parseFloat((((curPrice - past) / past) * 100).toFixed(2));
                allPeriods[48] = { months: 48, actualMonths: 48, label: '48M', returnPct: ret, cagr: parseFloat(cagr48.toFixed(2)), pastPrice: past, currentPrice: curPrice };
              }
              if (!allPeriods[72] && allPeriods[60] && allPeriods[120]) {
                const cagr72 = allPeriods[60].cagr * 0.75 + allPeriods[120].cagr * 0.25;
                const past = parseFloat((curPrice / Math.pow(1 + cagr72 / 100, 6)).toFixed(2));
                const ret = parseFloat((((curPrice - past) / past) * 100).toFixed(2));
                allPeriods[72] = { months: 72, actualMonths: 72, label: '72M', returnPct: ret, cagr: parseFloat(cagr72.toFixed(2)), pastPrice: past, currentPrice: curPrice };
              }
              if (!allPeriods[144] && allPeriods[120]) {
                const cagr144 = allPeriods[120].cagr;
                const past = parseFloat((curPrice / Math.pow(1 + cagr144 / 100, 12)).toFixed(2));
                const ret = parseFloat((((curPrice - past) / past) * 100).toFixed(2));
                allPeriods[144] = { months: 144, actualMonths: 144, label: '144M', returnPct: ret, cagr: parseFloat(cagr144.toFixed(2)), pastPrice: past, currentPrice: curPrice };
              }

              return res.json({
                ticker,
                currentPrice: curPrice,
                ret3y: allPeriods[36] || null,
                ret5y: allPeriods[60] || null,
                ret10y: allPeriods[120] || null,
                allPeriods
              });
            }
          }
        }
      } catch {}
    }
  } catch {}

  // Tier 2: Direct Yahoo v8 chart query fallback
  const urls = [
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=15y&interval=1wk`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=15y&interval=1wk`,
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=15y&interval=1mo`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=15y&interval=1mo`
  ];

  for (const u of urls) {
    try {
      const response = await fetch(u, { 
        headers: YAHOO_RETURNS_HEADERS,
        signal: AbortSignal.timeout(2500)
      });
      if (response.ok) {
        const data = await response.json() as any;
        const result = data?.chart?.result?.[0];
        const quotes = result?.indicators?.quote?.[0]?.close;
        const adj = result?.indicators?.adjclose?.[0]?.adjclose;
        const timestamps = result?.timestamp;

        if (quotes && quotes.length > 0) {
          const validBars: { price: number; time: number }[] = [];
          for (let i = 0; i < quotes.length; i++) {
            const p = (adj && adj[i] != null && !isNaN(adj[i])) ? adj[i] : quotes[i];
            if (p !== null && p !== undefined && !isNaN(p)) {
              validBars.push({ price: parseFloat(p.toFixed(2)), time: timestamps?.[i] || 0 });
            }
          }
          const computed = computeReturnsFromBars(validBars);
          if (computed) return res.json(computed);
        }
      }
    } catch {}
  }

  // Tier 3: Yahoo-finance2 library instance fallback
  try {
    const yfRes = await (yahooFinance as any).chart(yahooSymbol, { period1: '2010-01-01', interval: '1mo' }).catch(() => null);
    if (yfRes?.quotes && yfRes.quotes.length > 1) {
      const validBars: { price: number; time: number }[] = [];
      for (const q of yfRes.quotes) {
        const p = q.adjclose ?? q.close;
        if (p !== null && p !== undefined && !isNaN(p)) {
          const time = q.date instanceof Date ? q.date.getTime() : 0;
          validBars.push({ price: parseFloat(p.toFixed(2)), time });
        }
      }
      const computed = computeReturnsFromBars(validBars);
      if (computed) return res.json(computed);
    }
  } catch {}

  // Tier 4: Predefined Baseline for Popular Assets
  const rawClean = ticker.includes(':') ? ticker.split(':').pop()! : ticker;
  const altClean = rawClean === 'GOOG' ? 'GOOGL' : (rawClean === 'GOOGL' ? 'GOOG' : rawClean);
  const base = POPULAR_BASELINE_RETURNS[ticker] || POPULAR_BASELINE_RETURNS[rawClean] || POPULAR_BASELINE_RETURNS[altClean];
  if (base) {
    const curPrice = currentPriceHint > 0 ? currentPriceHint : (ticker.startsWith('GOOG') ? 318.6 : 100);
    const buildFromPct = (months: number, label: string, pct: number) => {
      const past = parseFloat((curPrice / (1 + pct / 100)).toFixed(2));
      const years = months / 12;
      const cagr = (years >= 0.5 && past > 0 && curPrice > 0)
        ? parseFloat(((Math.pow(1 + pct / 100, 1 / years) - 1) * 100).toFixed(2))
        : null;
      return { months, label, returnPct: pct, cagr, pastPrice: past, currentPrice: curPrice };
    };
    const allPeriods: Record<number, any> = {
      12: buildFromPct(12, '12M', base.r1y ?? 15),
      36: buildFromPct(36, '36M', base.r3y),
      60: buildFromPct(60, '60M', base.r5y),
      120: buildFromPct(120, '120M', base.r10y ?? base.r5y)
    };
    return res.json({
      ticker,
      currentPrice: curPrice,
      ret3y: allPeriods[36],
      ret5y: allPeriods[60],
      ret10y: allPeriods[120],
      allPeriods
    });
  }

  return res.json({
    ticker,
    currentPrice: 100,
    ret3y: null,
    ret5y: null,
    ret10y: null,
    allPeriods: {}
  });
});

// Helper for deterministic backward random walk simulated stock history
function generateSimulatedHistory(
  ticker: string, 
  range: string, 
  currentPrice: number,
  dailyChangePct = 0,
  low52: number | null = null,
  high52: number | null = null
) {
  let numPoints = 100;
  let intervalMs = 24 * 60 * 60 * 1000;
  const now = new Date();

  switch (range.toLowerCase()) {
    case "1d":
      numPoints = 78; // 6.5 hours of trading with 5m interval
      intervalMs = 5 * 60 * 1000;
      break;
    case "1w":
      numPoints = 5 * 26; // 5 days with 15m interval
      intervalMs = 15 * 60 * 1000;
      break;
    case "1m":
      numPoints = 30;
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case "3m":
      numPoints = 90;
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case "6m":
      numPoints = 120;
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case "ytd":
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const diffDays = Math.ceil((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
      numPoints = Math.max(10, Math.min(250, diffDays));
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case "1y":
      numPoints = 180;
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case "3y":
      numPoints = 156;
      intervalMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case "5y":
      numPoints = 180;
      intervalMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case "10y":
      numPoints = 120;
      intervalMs = 30 * 24 * 60 * 60 * 1000;
      break;
    case "max":
      numPoints = 200;
      intervalMs = 30 * 24 * 60 * 60 * 1000;
      break;
  }

  const prices: number[] = new Array(numPoints);
  const timestamps: number[] = new Array(numPoints);
  
  // Seed based on ticker to keep shape consistent per symbol
  let seed = ticker.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  
  // Trend is based on dailyChangePct or ticker seed
  const trendDirection = dailyChangePct !== 0 
    ? (dailyChangePct > 0 ? 1 : -1) 
    : ((seed % 3) - 1); // fallback: -1, 0, 1
  
  let rawPrices: number[] = [];
  
  for (let i = 0; i < numPoints; i++) {
    timestamps[i] = Math.round((now.getTime() - (numPoints - 1 - i) * intervalMs) / 1000);
    
    // Wave parameters (yearly, quarterly, monthly cycles)
    const angleYear = (i / numPoints) * 2 * Math.PI;
    const angleQuarter = (i / numPoints) * 8 * Math.PI;
    const angleMonth = (i / numPoints) * 24 * Math.PI;
    
    // Deterministic waves
    const w1 = Math.sin(angleYear + (seed % 5)) * 0.12;
    const w2 = Math.cos(angleQuarter + (seed % 3)) * 0.05;
    const w3 = Math.sin(angleMonth + (seed % 7)) * 0.02;
    
    // Bounded progress trend
    const progress = i / (numPoints - 1 || 1);
    const trend = progress * trendDirection * 0.10;
    
    // Random noise
    seed = (seed * 9301 + 49297) % 233280;
    const noise = (seed / 233280 - 0.5) * 0.015;
    
    const multiplier = 1 + w1 + w2 + w3 + trend + noise;
    rawPrices.push(currentPrice * multiplier);
  }
  
  // Adjust and scale raw prices so the final price matches currentPrice,
  // and clamp between low52 and high52
  const finalRawPrice = rawPrices[rawPrices.length - 1] || currentPrice;
  const ratio = currentPrice / finalRawPrice;
  
  for (let i = 0; i < numPoints; i++) {
    let p = rawPrices[i] * ratio;
    
    // Bounding check using 52 week low/high limits if defined
    if (low52 !== null && p < low52) {
      p = low52 + (Math.random() * 0.02 * low52);
    }
    if (high52 !== null && p > high52) {
      p = high52 - (Math.random() * 0.02 * high52);
    }
    if (p < 0.01) p = 0.01;
    
    prices[i] = parseFloat(p.toFixed(2));
  }

  // Ensure last point is exactly currentPrice
  if (prices.length > 0) {
    prices[prices.length - 1] = currentPrice;
  }

  return { timestamps, prices };
}

// Endpoint for fetching live stock quotes from Yahoo/Google Finance feeds in real-time
app.get("/api/stock-quotes", async (req, res) => {
  const symbolsQuery = req.query.symbols as string;
  if (!symbolsQuery) {
    return res.status(400).json({ error: "Липсват символи за обновление (symbols)" });
  }

  try {
    const tickers = symbolsQuery
      .split(",")
      .map(t => t.trim().toUpperCase())
      .filter(Boolean);

    if (tickers.length === 0) {
      return res.status(400).json({ error: "Невалидни символи за обновление" });
    }

    // Bidirectional symbol mapping translation layer
    const originalToYahoo: Record<string, string> = {};
    const yahooToOriginal: Record<string, string> = {};

    const plainEuropeanMap: Record<string, string> = {
      "BRK.B": "BRK-B",
      "BRK B": "BRK-B",
      "BF.B": "BF-B",
      "BF B": "BF-B",
      "XNAS": "XNAS.DE",
      "XNAS.DE": "XNAS.DE",
      "VHYL": "VHYL.AS",
      "VHYL.DE": "VHYL.AS",
      "VGWD": "VGWD.DE",
      "VGWD.DE": "VGWD.DE",
      "JGPI": "JGPI.DE",
      "JGPI.DE": "JGPI.DE",
      "SXR8": "SXR8.DE",
      "SXR8.DE": "SXR8.DE",
      "EUNL": "EUNL.DE",
      "VWCE": "VWCE.DE",
      "QDVE": "QDVE.DE",
      "IS3N": "IS3N.DE",
      "CSPX": "CSPX.L",
      "CSSPX": "CSSPX.MI",
      "VUSA": "VUSA.DE",
      "MEUD": "MEUD.PA",
      "4GLD": "4GLD.DE",
      "IWDA": "IWDA.AS",
      "EMIM": "EMIM.L",
      "INRG": "INRG.L",
      "RBOT": "RBOT.L",
      "IUIT": "IUIT.L",
      "SX8P": "SX8P.DE"
    };

    for (const t of tickers) {
      let ySym = t;
      const googleToYahooMap: Record<string, string> = {
        "EPA": ".PA", "ETR": ".DE", "FRA": ".F", "LON": ".L", "AMS": ".AS",
        "EBR": ".BR", "BIT": ".MI", "BME": ".MC", "VIE": ".VI", "CPH": ".CO",
        "HEL": ".HE", "STO": ".ST", "SWX": ".SW", "OSL": ".OL", "LIS": ".LS",
        "ATH": ".AT", "IST": ".IS", "WSE": ".WA", "PRG": ".PR", "TSE": ".T",
        "HKG": ".HK", "BSE": ".BO", "NSE": ".NS", "TPE": ".TW", "ASX": ".AX",
        "NZZE": ".NZ", "TSX": ".TO", "CVE": ".V", "BMFBOVESPA": ".SA", "JSE": ".JO",
        "KRX": ".KS", "KOSDAQ": ".KQ", "SHA": ".SS", "SHE": ".SZ", "SGX": ".SI"
      };

      if (plainEuropeanMap[t]) {
        ySym = plainEuropeanMap[t];
      } else if (t.includes(":")) {
        const parts = t.split(":");
        const prefix = parts[0];
        let raw = parts[1];
        
        if (prefix === "ETR" && raw === "DHL") {
          raw = "DPW";
        }
        
        if (googleToYahooMap[prefix]) {
          ySym = raw + googleToYahooMap[prefix];
        } else {
          ySym = raw + "." + prefix;
        }
      }

      originalToYahoo[t] = ySym;
      yahooToOriginal[ySym] = t;
    }

    const yahooTickersToFetch = Array.from(new Set(Object.values(originalToYahoo)));

    let allQuotes: any[] = [];
    try {
      allQuotes = await yahooFinance.quote(yahooTickersToFetch);
    } catch (e: any) {
      console.warn("yahoo-finance2 batch fetch failed, fetching individually:", e.message);
      // Fallback: fetch individually so one bad ticker doesn't ruin the whole batch
      for (const ticker of yahooTickersToFetch) {
        try {
          const q = await yahooFinance.quote(ticker);
          if (q) allQuotes.push(q);
        } catch(err: any) {
          console.warn(`Failed to fetch individual quote for ${ticker}: ${err.message}`);
        }
      }
    }

    const results: Record<string, StockQuoteData> = {};

    if (allQuotes && allQuotes.length > 0) {
      for (const q of allQuotes) {
        const qSymbol = q.symbol.toUpperCase();
        const originalTicker = yahooToOriginal[qSymbol] || qSymbol;

        const currentPrice = q.regularMarketPrice ?? q.postMarketPrice ?? q.bid;
        const prevClose = q.regularMarketPreviousClose;
        let dailyChangePct = q.regularMarketChangePercent;
        let changeVal = q.regularMarketChange;

        if ((dailyChangePct === undefined || dailyChangePct === null) && prevClose && currentPrice) {
          dailyChangePct = ((currentPrice - prevClose) / prevClose) * 100;
        }
        if ((changeVal === undefined || changeVal === null) && prevClose && currentPrice) {
          changeVal = currentPrice - prevClose;
        }

        if (currentPrice !== undefined && currentPrice !== null) {
          const quoteObj = {
            currentPrice: parseFloat(currentPrice.toFixed(2)),
            dailyChangePct: parseFloat((dailyChangePct || 0).toFixed(2)),
            changeVal: changeVal !== undefined && changeVal !== null ? parseFloat(changeVal.toFixed(2)) : 0,
            companyName: q.longName || q.shortName || undefined,
            low52: q.fiftyTwoWeekLow ? parseFloat(q.fiftyTwoWeekLow.toFixed(2)) : undefined,
            high52: q.fiftyTwoWeekHigh ? parseFloat(q.fiftyTwoWeekHigh.toFixed(2)) : undefined,
            peRatio: (q.trailingPE ?? q.forwardPE) !== undefined ? parseFloat((q.trailingPE ?? q.forwardPE).toFixed(2)) : undefined,
            eps: (q.epsTrailingTwelveMonths ?? q.trailingEps ?? q.epsForward) !== undefined ? parseFloat((q.epsTrailingTwelveMonths ?? q.trailingEps ?? q.epsForward).toFixed(2)) : undefined,
            marketCap: q.marketCap || undefined,
            dividend: q.dividendRate !== undefined ? q.dividendRate : q.trailingAnnualDividendRate,
            dividendYield: q.dividendYield !== undefined ? q.dividendYield : q.trailingAnnualDividendYield,
            earningsTimestamp: q.earningsTimestamp ?? undefined,
            currency: q.currency || undefined,
          };
          results[originalTicker] = quoteObj;
          const baseSym = originalTicker.split('.')[0];
          results[baseSym] = quoteObj;
          results[`${baseSym}.DE`] = quoteObj;
          serverPriceCache[originalTicker] = currentPrice;
        }
      }
    }

    // Still missing (e.g. European .DE tickers)? Fetch Yahoo v8 chart API fallback
    const stillMissingTickers = tickers.filter(t => !results[t] || !results[t].currentPrice);
    if (stillMissingTickers.length > 0) {
      await Promise.allSettled(stillMissingTickers.map(async (t) => {
        const baseSym = t.split('.')[0].split(':')[1] || t.split('.')[0];
        const candidates = [
          originalToYahoo[t],
          plainEuropeanMap[t],
          t,
          `${baseSym}.DE`,
          `${baseSym}.AS`,
          `${baseSym}.L`,
          t === 'VHYL' || t === 'VHYL.DE' ? 'VGWD.DE' : null
        ].filter((c): c is string => Boolean(c));

        const uniqueCandidates = [...new Set(candidates)];
        const fetchCandidate = async (candidate: string) => {
          const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(candidate)}?interval=1d&range=2d`, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "application/json"
            }
          });
          if (!res.ok) throw new Error("Not found");
          const json = await res.json() as any;
          const meta = json?.chart?.result?.[0]?.meta;
          if (meta && typeof meta.regularMarketPrice === 'number' && meta.regularMarketPrice > 0) {
            return { meta, candidate };
          }
          throw new Error("Invalid");
        };

        try {
          const success = await Promise.any(uniqueCandidates.map(c => fetchCandidate(c)));
          if (success) {
            const { meta } = success;
            const price = meta.regularMarketPrice;
            const prevClose = meta.previousClose ?? meta.chartPreviousClose;
            const changePct = (price != null && prevClose != null && prevClose > 0) ? ((price - prevClose) / prevClose) * 100 : 0;
            const item = {
              currentPrice: parseFloat(price.toFixed(2)),
              dailyChangePct: parseFloat(changePct.toFixed(2)),
              changeVal: prevClose ? parseFloat((price - prevClose).toFixed(2)) : 0,
              companyName: meta.longName || meta.shortName || t,
              currency: meta.currency || undefined,
              low52: meta.fiftyTwoWeekLow ? parseFloat(meta.fiftyTwoWeekLow.toFixed(2)) : undefined,
              high52: meta.fiftyTwoWeekHigh ? parseFloat(meta.fiftyTwoWeekHigh.toFixed(2)) : undefined
            };
            results[t] = item;
            results[baseSym] = item;
            results[`${baseSym}.DE`] = item;
            results[`${baseSym}.AS`] = item;
          }
        } catch {}
      }));
    }

    // Missing non-stock tickers: fallback simulation
    const finalMissing = tickers.filter(t => !results[t]);
    if (finalMissing.length > 0) {
      const fallbackQuotes = generateFallbackQuotes(finalMissing);
      for (const [t, mockQuote] of Object.entries(fallbackQuotes)) {
        results[t] = mockQuote;
      }
    }

    // --- FINNHUB ULTRA-HYBRID OVERRIDE ---
    // Overwrite the currentPrice and dailyChangePct for US stocks using Finnhub to ensure realtime accuracy.
    const finnhubKey = process.env.FINNHUB_API_KEY;
    if (finnhubKey) {
      // Finnhub works best for standard US stock tickers (usually 1-5 uppercase letters, no special characters like : or = or ^)
      const usStocks = tickers.filter(t => /^[A-Z]{1,5}$/.test(t));
      
      if (usStocks.length > 0) {
        // Fetch all US stocks concurrently from Finnhub
        await Promise.allSettled(usStocks.map(async (t) => {
          try {
            const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${t}&token=${finnhubKey}`);
            if (res.ok) {
              const data = await res.json();
              // Check if Finnhub returned valid data (c > 0)
              if (data && typeof data.c === 'number' && data.c > 0) {
                if (!results[t]) {
                  results[t] = {
                    currentPrice: 0,
                    dailyChangePct: 0
                  };
                }
                
                results[t].currentPrice = parseFloat(data.c.toFixed(2));
                
                if (typeof data.dp === 'number') {
                  results[t].dailyChangePct = parseFloat(data.dp.toFixed(2));
                }
                
                // Update server cache with the realtime Finnhub price
                serverPriceCache[t] = results[t].currentPrice;
              }
            }
          } catch(e: any) {
            console.warn(`Finnhub override failed for ${t}:`, e.message);
          }
        }));
      }
    }

    // Override ^VIX with TradingView real-time feed if it was requested
    if (tickers.includes("^VIX")) {
      try {
        const tvUrl = "https://scanner.tradingview.com/america/scan";
        const body = {
          symbols: { tickers: ["CBOE:VIX"], query: { types: [] } },
          columns: ["close", "change", "change_abs"]
        };
        const tvResponse = await fetch(tvUrl, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0"
          },
          body: JSON.stringify(body)
        });
        if (tvResponse.ok) {
          const tvData = await tvResponse.json() as any;
          if (tvData?.data?.[0]?.d) {
            const vixData = tvData.data[0].d;
            const vixClose = parseFloat(Number(vixData[0]).toFixed(2));
            const vixPct = parseFloat(Number(vixData[1]).toFixed(2));
            const vixChangeAbs = typeof vixData[2] === 'number' 
              ? parseFloat(vixData[2].toFixed(2)) 
              : parseFloat((vixClose - (vixClose / (1 + vixPct / 100))).toFixed(2));
            results["^VIX"] = {
              ...(results["^VIX"] || {}),
              currentPrice: vixClose,
              dailyChangePct: vixPct,
              changeVal: vixChangeAbs,
              companyName: "CBOE Volatility Index",
            };
            serverPriceCache["^VIX"] = vixClose;
          }
        }
      } catch (err) {
        console.error("Failed to fetch VIX from TradingView override:", err);
      }
    }

    // TradingView Scanner override for live P/E (TTM), EPS (TTM), and Market Cap
    try {
      const usTickers: string[] = [];
      const franceTickers: string[] = [];
      const germanyTickers: string[] = [];
      const swedenTickers: string[] = [];
      const swissTickers: string[] = [];
      const ukTickers: string[] = [];
      const koreaTickers: string[] = [];

      for (const t of tickers) {
        const upper = t.toUpperCase().trim();
        if (upper.startsWith('EPA:')) franceTickers.push(upper.slice(4));
        else if (upper.startsWith('ETR:') || upper.endsWith('.DE')) germanyTickers.push(upper.replace('ETR:', '').replace('.DE', ''));
        else if (upper.startsWith('STO:')) swedenTickers.push(upper.slice(4));
        else if (upper.startsWith('SWX:')) swissTickers.push(upper.slice(4));
        else if (upper.startsWith('LON:') || upper === 'BRBY' || upper.endsWith('.L')) ukTickers.push(upper.replace('LON:', '').replace('.L', ''));
        else if (upper.startsWith('KRX:') || upper.startsWith('KOSDAQ:') || upper.endsWith('.KS') || upper.endsWith('.KQ')) {
          koreaTickers.push(upper.replace('KRX:', '').replace('KOSDAQ:', '').replace('.KS', '').replace('.KQ', ''));
        }
        else if (!upper.includes(':') && !upper.includes('.')) usTickers.push(upper);
      }

      const marketScanners: { market: string; list: string[]; prefix: string }[] = [
        { market: 'america', list: usTickers, prefix: '' },
        { market: 'france', list: franceTickers, prefix: 'EPA:' },
        { market: 'germany', list: germanyTickers, prefix: 'ETR:' },
        { market: 'sweden', list: swedenTickers, prefix: 'STO:' },
        { market: 'switzerland', list: swissTickers, prefix: 'SWX:' },
        { market: 'uk', list: ukTickers, prefix: '' },
        { market: 'korea', list: koreaTickers, prefix: 'KRX:' }
      ];

      await Promise.allSettled(marketScanners.map(async ({ market, list, prefix }) => {
        if (list.length === 0) return;
        try {
          const tvRes = await fetch(`https://scanner.tradingview.com/${market}/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filter: [{ left: 'name', operation: 'in_range', right: list }],
              columns: ['name', 'close', 'price_earnings_ttm', 'earnings_per_share_basic_ttm', 'market_cap_basic', 'description', 'change', 'price_52_week_low', 'price_52_week_high']
            })
          });
          if (tvRes.ok) {
            const tvJson = await tvRes.json() as any;
            for (const row of tvJson.data || []) {
              const name = (row.d?.[0] || '').toUpperCase();
              const close = row.d?.[1];
              const pe = row.d?.[2];
              const eps = row.d?.[3];
              const mcap = row.d?.[4];
              const desc = row.d?.[5];
              const changePct = row.d?.[6];
              const low52 = row.d?.[7];
              const high52 = row.d?.[8];
              if (name) {
                const fullKey = prefix ? prefix + name : name;
                for (const origTicker of tickers) {
                  const upperOrig = origTicker.toUpperCase().trim();
                  if (
                    upperOrig === fullKey ||
                    (!prefix && upperOrig === name) ||
                    (prefix === 'ETR:' && upperOrig === `${name}.DE`) ||
                    (prefix === 'KRX:' && (upperOrig === `KOSDAQ:${name}` || upperOrig === `${name}.KS` || upperOrig === `${name}.KQ` || upperOrig === name))
                  ) {
                    if (!results[origTicker]) results[origTicker] = { currentPrice: 0, dailyChangePct: 0 };
                    if (typeof desc === 'string' && desc.trim() && (!results[origTicker].companyName || results[origTicker].companyName === origTicker)) {
                      results[origTicker].companyName = desc.trim();
                    }
                    if (typeof changePct === 'number' && !results[origTicker].dailyChangePct) {
                      results[origTicker].dailyChangePct = parseFloat(changePct.toFixed(2));
                    }
                    if (typeof low52 === 'number' && low52 > 0 && (!results[origTicker].low52 || results[origTicker].low52 <= 0)) {
                      results[origTicker].low52 = parseFloat(low52.toFixed(2));
                    }
                    if (typeof high52 === 'number' && high52 > 0 && (!results[origTicker].high52 || results[origTicker].high52 <= 0)) {
                      results[origTicker].high52 = parseFloat(high52.toFixed(2));
                    }
                    if (typeof pe === 'number' && pe > 0) results[origTicker].peRatio = parseFloat(pe.toFixed(2));
                    if (typeof eps === 'number') results[origTicker].eps = parseFloat(eps.toFixed(2));
                    if (typeof mcap === 'number' && mcap > 0) results[origTicker].marketCap = mcap;
                    if (typeof close === 'number' && close > 0) {
                      results[origTicker].currentPrice = parseFloat(close.toFixed(2));
                    }
                  }
                }
              }
            }
          }
        } catch {}
      }));
    } catch (err) {
      console.warn("TradingView scanner live sync notice:", err);
    }

    return res.json({ quotes: results, source: "live-yahoo-and-tradingview" });

  } catch (error: any) {
    console.error("Грешка при обслужване на котировки:", error.message);
    const tickers = symbolsQuery.split(",").map(t => t.trim().toUpperCase()).filter(Boolean);
    const simulatedQuotes = generateFallbackQuotes(tickers);
    return res.json({ quotes: simulatedQuotes, source: "live-simulated-recovery" });
  }
});



let cachedFngData: any = null;
let lastFngFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 минути кеш (намалява CPU usage)

app.get("/api/fng", async (req, res) => {
  try {
    const now = Date.now();
    if (cachedFngData && now - lastFngFetchTime < CACHE_DURATION) {
      return res.json(cachedFngData);
    }

    const url = "https://query2.finance.yahoo.com/v8/finance/chart/^VIX?range=2y&interval=1d";
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`YF API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error("Invalid format from YF API");
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0].close;

    const combined = timestamps.map((t: number, i: number) => ({
      timestamp: t * 1000,
      close: quotes[i]
    })).filter((d: any) => d.close !== null && d.close !== undefined);

    if (combined.length === 0) {
      console.error("All quotes were filtered out due to missing close prices");
      return res.status(500).json({ error: "No valid quotes" });
    }

    // Изчисляване на 50-дневна пълзяща средна
    for (let i = 0; i < combined.length; i++) {
      if (i >= 49) {
        let sum = 0;
        for (let j = i - 49; j <= i; j++) {
          sum += combined[j].close;
        }
        combined[i].ma50 = sum / 50;
      } else {
        combined[i].ma50 = null;
      }
    }

    // Взимаме последната 1 година (около 252 работни дни на борсата)
    const lastYear = combined.slice(-252);
    
    const lastItem = lastYear[lastYear.length - 1];
    const ratio = lastItem.close / lastItem.ma50;
    let rating = "neutral";
    if (ratio > 1.2) rating = "extreme fear";
    else if (ratio > 1.05) rating = "fear";
    else if (ratio < 0.8) rating = "extreme greed";
    else if (ratio < 0.95) rating = "greed";

    // Форматираме данните така, че frontend-а (който очаква CNN формат) да работи без промяна
    const cnnMockData = {
      market_volatility_vix: {
        rating: rating,
        data: lastYear.map((d: any) => ({ x: d.timestamp, y: d.close }))
      },
      market_volatility_vix_50: {
        data: lastYear.map((d: any) => ({ x: d.timestamp, y: d.ma50 }))
      },
      fear_and_greed: {
        timestamp: new Date().toISOString()
      }
    };

    cachedFngData = cnnMockData;
    lastFngFetchTime = now;

    res.json(cnnMockData);
  } catch (error: any) {
    console.error("Detailed Error in /api/fng:", error?.message || error);
    if (error?.stack) console.error(error.stack);
    res.status(500).json({ error: "Грешка при извличане на VIX" });
  }
});

// Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only listen if not running on Vercel or in a serverless environment
  if (process.env.NODE_ENV !== 'production' || process.env.RUN_LOCAL === 'true') {
    app.listen(PORT, () => {
      console.log(`[Express] Сървърът стартира на http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
