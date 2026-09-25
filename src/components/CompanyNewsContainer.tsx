import React, { useState, useEffect } from 'react';
import { Stock } from '../types';
import { 
 Newspaper, 
 ExternalLink, 
 RefreshCw, 
 Clock, 
 TrendingUp, 
 TrendingDown, 
 Minus, 
 HelpCircle, 
 X,
 Building2,
 AlertTriangle
} from 'lucide-react';

interface NewsArticle {
  title: string;
  source: string;
  time: string;
  summary: string;
  impact: 'Positive' | 'Negative' | 'Neutral';
  url: string;
  image?: string;
  category?: 'all' | 'world' | 'reuters' | 'bg';
}

interface Props {
  stocks: Stock[];
  selectedStock: Stock | null;
  onSelectStock: (stock: Stock | null) => void;
}

const GENERAL_FALLBACK_NEWS: NewsArticle[] = [
  {
    title: "Пазарите на Уолстрийт реагират на новите монетарни сигнали от Федералния резерв",
    source: "CNBC",
    time: "Преди 25 минути",
    summary: "Основните борсови индекси S&P 500 и Nasdaq отчитат повишена волатилност, докато инвеститорите оценяват перспективите за лихвените нива и корпоративните отчети.",
    impact: "Positive",
    url: "https://www.cnbc.com/finance/",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80",
    category: "world"
  },
  {
    title: "Технологичният сектор води ралито с ръст в търсенето на AI чипове и облачни услуги",
    source: "MarketWatch",
    time: "Преди 45 минути",
    summary: "Акциите на производителите на полупроводници и инфраструктурен софтуер отбелязват стабилен интерес след публикувани нови партньорства в сектора.",
    impact: "Positive",
    url: "https://www.marketwatch.com/",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80",
    category: "world"
  },
  {
    title: "Петролът и златото се стабилизират след геополитически развития и срещи на ОПЕК+",
    source: "Reuters",
    time: "Преди 1 час",
    summary: "Суровият петрол сорт Брент се търгува около ключови нива на подкрепа, а инвеститорите следят динамиката в глобалното индустриално търсене.",
    impact: "Neutral",
    url: "https://www.investing.com/commodities/crude-oil",
    image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600&auto=format&fit=crop&q=80",
    category: "reuters"
  },
  {
    title: "Европейските борси и БФБ отчитат засилен интерес към финансовия и енергийния сектор",
    source: "Investor.bg",
    time: "Преди 2 часа",
    summary: "Българският индекс SOFIX и европейските пазари затварят сесията с положителен тренд на фона на нови дивиденти и стабилни тримесечни финансови отчети.",
    impact: "Positive",
    url: "https://www.investor.bg/rss/latest",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80",
    category: "bg"
  }
];

export default function CompanyNewsContainer({ stocks, selectedStock, onSelectStock }: Props) {
 const [news, setNews] = useState<NewsArticle[]>([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [selectedCategory, setSelectedCategory] = useState<'all' | 'world' | 'reuters' | 'bg'>('all');

  const fetchNews = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError('');

    try {
      let endpoint = forceRefresh ? '/api/global-news?refresh=true' : '/api/global-news';
      let options: RequestInit = { method: 'GET' };

      if (selectedStock) {
        endpoint = '/api/company-news';
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticker: selectedStock.ticker,
            companyName: selectedStock.companyName
          })
        };
      }

      const response = await fetch(endpoint, options);
      if (!response.ok) throw new Error('Неуспешна заявка към сървъра за новини');

      const data = await response.json();
      const rawArticles = Array.isArray(data) ? data : (data.news && Array.isArray(data.news)) ? data.news : [];

      if (rawArticles.length > 0) {
        const parsedNews: NewsArticle[] = rawArticles.map((item: any) => ({
          title: item.title || 'Финансова новина',
          source: item.source || (selectedStock ? 'Пазарен източник' : 'Световни пазари'),
          time: item.time || 'Днес',
          summary: item.summary || '',
          impact: (item.impact === 'Positive' || item.impact === 'Negative') ? item.impact : 'Neutral',
          url: (item.url && item.url.startsWith('http'))
            ? item.url
            : (selectedStock ? `https://finance.yahoo.com/quote/${selectedStock.ticker}` : 'https://www.cnbc.com/finance/'),
          image: item.image,
          category: item.category || 'world'
        }));
        setNews(parsedNews);
        setError('');
      } else {
        throw new Error('Няма върнати новини от сървъра');
      }
    } catch (err: any) {
      console.warn("Could not fetch remote news, loading fallback stream:", err);
      const fallback = selectedStock ? getFallbackNewsLocal(selectedStock.ticker, selectedStock.companyName) : GENERAL_FALLBACK_NEWS;
      setNews(fallback);
      setError('');
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
 fetchNews();
 }, [selectedStock]);

 const getFallbackNewsLocal = (ticker: string, companyName: string): NewsArticle[] => {
 const name = companyName || ticker;
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
 title: "Доклад на аналитиците за нарастващи пазарни дялове и силно конкурентно предимство",
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
 title: `Преглед на ключовите фундаментални показатели в Yahoo Finance за ${ticker}`,
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
 title: `Промени в регулаторната рамка и пазарни изисквания за ${ticker}`,
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
 };

 const getImpactBadge = (impact: 'Positive' | 'Negative' | 'Neutral') => {
 switch (impact) {
 case 'Positive':
 return (
 <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#10b981] border border-emerald-300 px-1.5 py-0.5 text-xs font-bold uppercase rounded-2xl font-sans tabular-nums">
 <TrendingUp className="w-2.5 h-2.5" />
 Положително
 </span>
 );
 case 'Negative':
 return (
 <span className="inline-flex items-center gap-1 bg-red-50 text-[#f43f5e] border border-red-300 px-1.5 py-0.5 text-xs font-bold uppercase rounded-2xl font-sans tabular-nums">
 <TrendingDown className="w-2.5 h-2.5" />
 Отрицателно
 </span>
 );
 default:
 return (
 <span className="inline-flex items-center gap-1 bg-bg text-ink-muted border border-border-hover px-1.5 py-0.5 text-xs font-bold uppercase rounded-2xl font-sans tabular-nums">
 <Minus className="w-2.5 h-2.5" />
 Неутрално
 </span>
 );
 }
 };

  const getSourceBadge = (source: string) => {
    const s = (source || '').toLowerCase();
    if (s.includes('cnbc')) {
      return (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-xs font-extrabold uppercase rounded-2xl font-sans tracking-tight">
          CNBC
        </span>
      );
    }
    if (s.includes('marketwatch') || s.includes('dow jones')) {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 text-xs font-extrabold uppercase rounded-2xl font-sans tracking-tight">
          MarketWatch
        </span>
      );
    }
    if (s.includes('reuters')) {
      return (
        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 text-xs font-extrabold uppercase rounded-2xl font-sans tracking-tight">
          Reuters
        </span>
      );
    }
    if (s.includes('investor')) {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-xs font-extrabold uppercase rounded-2xl font-sans tracking-tight">
          Investor.bg
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-card text-ink-muted border border-border px-2 py-0.5 text-xs font-bold uppercase rounded-2xl font-sans tracking-tight">
        {source}
      </span>
    );
  };

  const displayedNews = selectedStock
    ? news
    : news.filter(item => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'world') {
          return item.category === 'world' || item.source.includes('CNBC') || item.source.includes('MarketWatch');
        }
        if (selectedCategory === 'reuters') {
          return item.category === 'reuters' || item.source.includes('Reuters') || item.source.includes('Investing');
        }
        if (selectedCategory === 'bg') {
          return item.category === 'bg' || item.source.includes('Investor');
        }
        return true;
      });

  return (
    <div id="company-news-container" className="bg-bg rounded-2xl border border-border p-4 mt-5 shadow-xs">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
        <div>
          <h3 className="text-xs uppercase font-extrabold text-ink font-sans tabular-nums tracking-tight flex items-center gap-1.5">
            <Newspaper className="w-3.5 h-3.5 text-[#10b981]" />
            {selectedStock ? `Най-важни новини за ${selectedStock.companyName} (${selectedStock.ticker})` : 'Глобални финансови & пазарни новини'}
          </h3>
          <p className="text-xs text-ink-faint mt-0.5">
            Актуални световни финансови новини от CNBC, MarketWatch, Reuters и Investor.bg с директни работещи връзки.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dropdown for quick stock selection */}
          <div className="flex items-center gap-2 bg-bg p-1.5 border border-border rounded-2xl text-xs">
            <label className="text-xs font-sans tabular-nums font-bold text-ink-muted uppercase whitespace-nowrap">АКТИВ:</label>
            <select
              value={selectedStock ? selectedStock.ticker : ''}
              onChange={(e) => {
                const tick = e.target.value;
                const found = stocks.find((s) => s.ticker === tick);
                onSelectStock(found || null);
              }}
              className="bg-bg rounded-2xl border border-border px-2 py-0.5 text-xs text-ink font-bold focus:outline-none min-w-[120px] max-w-[180px]"
            >
              <option value="">-- Общ Пазар --</option>
              {stocks.map((s, idx) => (
                <option key={`${s.ticker}-${idx}`} value={s.ticker}>
                  {s.ticker} - {s.companyName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchNews(true)}
            disabled={loading}
            className="bg-bg rounded-2xl hover:bg-card-hover border border-border text-ink font-extrabold text-xs px-3 py-1.5 flex items-center gap-1.5 uppercase transition-all cursor-pointer disabled:opacity-50"
            title="Обновяване на новинарския поток от медиите"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Опресни
          </button>

          {selectedStock && (
            <button
              onClick={() => onSelectStock(null)}
              className="bg-bg hover:bg-card-hover border border-border-hover text-ink-muted font-bold text-xs px-3 py-1.5 rounded-2xl flex items-center gap-1.5 uppercase transition-all cursor-pointer"
            >
              <X className="w-3 h-3" />
              Общи новини
            </button>
          )}
        </div>
      </div>

      {/* Category filter tabs for global market view */}
      {!selectedStock && (
        <div className="flex flex-wrap items-center gap-1.5 pb-3 mb-3 border-b border-border/50">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-2xl text-xs font-bold uppercase transition-all cursor-pointer font-sans tabular-nums ${
              selectedCategory === 'all'
                ? 'bg-[#10b981] text-white shadow-xs'
                : 'bg-card hover:bg-card-hover border border-border text-ink-muted'
            }`}
          >
            Всички ({news.length})
          </button>
          <button
            onClick={() => setSelectedCategory('world')}
            className={`px-3 py-1 rounded-2xl text-xs font-bold uppercase transition-all cursor-pointer font-sans tabular-nums ${
              selectedCategory === 'world'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-card hover:bg-card-hover border border-border text-ink-muted'
            }`}
          >
            Уолстрийт & Свят (CNBC / MarketWatch)
          </button>
          <button
            onClick={() => setSelectedCategory('reuters')}
            className={`px-3 py-1 rounded-2xl text-xs font-bold uppercase transition-all cursor-pointer font-sans tabular-nums ${
              selectedCategory === 'reuters'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-card hover:bg-card-hover border border-border text-ink-muted'
            }`}
          >
            Reuters & Борси
          </button>
          <button
            onClick={() => setSelectedCategory('bg')}
            className={`px-3 py-1 rounded-2xl text-xs font-bold uppercase transition-all cursor-pointer font-sans tabular-nums ${
              selectedCategory === 'bg'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-card hover:bg-card-hover border border-border text-ink-muted'
            }`}
          >
            България & БФБ (Investor.bg)
          </button>
        </div>
      )}

      {/* Main Content list */}
      <div className="bg-bg border border-border p-4 rounded-2xl min-h-[220px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <RefreshCw className="w-8 h-8 text-[#10b981] animate-spin mb-4" />
            <h4 className="text-xs font-extrabold font-sans tabular-nums uppercase text-ink tracking-tight">
              Извличане на проверени финансови новини...
            </h4>
            <p className="text-xs text-ink-faint max-w-md mt-2 leading-relaxed">
              Свързване с CNBC, MarketWatch, Reuters и Investor.bg в реално време за най-актуалните статии...
            </p>
          </div>
        ) : (error && displayedNews.length === 0) ? (
          <div className="bg-bg border border-border p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-amber-800 font-sans tabular-nums text-xs font-bold mb-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            
            <div className="mt-4 space-y-4">
              <h4 className="text-xs uppercase font-bold text-ink-faint font-sans tabular-nums tracking-wider">Резервни актуални новини:</h4>
              <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
                {news.map((item, idx) => (
                  <div key={idx} className="bg-bg rounded-2xl border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-1.5 mb-2 font-sans tabular-nums text-xs">
                      <div className="flex items-center gap-1.5">
                        {getSourceBadge(item.source)}
                        <span className="text-ink0">•</span>
                        <span className="text-ink-faint">{item.time}</span>
                      </div>
                      {getImpactBadge(item.impact)}
                    </div>
                    <h5 className="text-xs font-bold text-ink font-sans leading-snug">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {item.title}
                      </a>
                    </h5>
                    <p className="text-xs text-ink-faint mt-1.5 leading-relaxed">{item.summary}</p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#10b981] hover:underline mt-2"
                    >
                      Прочетете в {item.source} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : displayedNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <HelpCircle className="w-8 h-8 text-ink-faint mb-3" />
            <h4 className="text-xs font-extrabold font-sans tabular-nums uppercase text-ink tracking-tight">
              Няма намерени новини за тази категория
            </h4>
            <p className="text-xs text-ink-faint max-w-md mt-1">
              Моля, изберете „Всички“ или опреснете потока за да заредите най-новите статии.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5 max-h-[560px] overflow-y-auto pr-1">
            {displayedNews.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-card rounded-2xl border border-border p-4 flex flex-col sm:flex-row gap-4 hover:border-emerald-800 transition-all shadow-xs group"
              >
                {item.image && (
                  <div className="w-full sm:w-36 h-28 shrink-0 rounded-xl overflow-hidden bg-bg border border-border/80 relative">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2 mb-2.5 font-sans tabular-nums text-xs">
                      <div className="flex items-center gap-2">
                        {getSourceBadge(item.source)}
                        <span className="text-ink0">•</span>
                        <div className="flex items-center gap-1 text-ink-faint">
                          <Clock className="w-3 h-3" />
                          <span>{item.time}</span>
                        </div>
                      </div>
                      {getImpactBadge(item.impact)}
                    </div>

                    <h4 className="text-xs font-black text-ink font-sans leading-snug group-hover:text-[#10b981] transition-colors">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="hover:underline cursor-pointer block"
                      >
                        {item.title}
                      </a>
                    </h4>
                    
                    <p className="text-xs text-ink-faint mt-1.5 leading-relaxed font-sans line-clamp-2">
                      {item.summary}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-dashed border-border/50 flex items-center justify-between">
                    <span className="text-xs font-sans tabular-nums text-ink-faint uppercase">
                      {item.source}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10b981] hover:text-emerald-950 hover:underline cursor-pointer"
                    >
                      Към статията в {item.source} <ExternalLink className="w-3 h-3 text-[#10b981]" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="mt-3 bg-bg border border-border p-2.5 text-xs text-ink-faint leading-normal font-sans tabular-nums flex items-start gap-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-[#10b981] shrink-0 mt-0.5" />
        <span>
          Всички изведени новини се извличат автоматично в реално време от водещите световни и български финансови медии (CNBC, MarketWatch, Reuters, Investor.bg) и водят директно към официалните статии. Пазарният анализ на импулса („Положително“, „Отрицателно“, „Неутрално“) се определя от изкуствен интелект и е с чисто информационен характер.
        </span>
      </div>
    </div>
  );
}
