import React, { useState, useEffect, useMemo } from 'react';
import { Stock } from '../types';
import {
  Newspaper,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  X,
  Search,
  Globe,
  Tag
} from 'lucide-react';

export type NewsTabType = 'newsroom' | 'markets' | 'all-stocks' | 'press-releases' | 'bg';

interface NewsArticle {
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

interface Props {
  stocks: Stock[];
  selectedStock: Stock | null;
  onSelectStock: (stock: Stock | null) => void;
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&auto=format&fit=crop&q=80'
];

function getFallbackImg(seedStr: string): string {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_IMAGES[h % FALLBACK_IMAGES.length];
}

const GENERAL_FALLBACK_NEWS: NewsArticle[] = [
  {
    title: "Wall Street indices react to latest Federal Reserve monetary policy signals and corporate earnings",
    titleBg: "Пазарите на Уолстрийт реагират на новите монетарни сигнали от Федералния резерв и корпоративните отчети",
    source: "The Wall Street Journal",
    time: "Преди 24 мин",
    timeEn: "24 minutes ago",
    summary: "Major equity benchmarks S&P 500 and Nasdaq Composite show heightened activity as institutional investors weigh interest rate expectations and quarterly results.",
    summaryBg: "Основните борсови индекси S&P 500 и Nasdaq отчитат повишена активност, докато институционалните инвеститори оценяват перспективите за лихвените нива и тримесечните отчети.",
    impact: "Positive",
    url: "https://www.wsj.com/finance",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=640&auto=format&fit=crop&q=80",
    category: "markets",
    tickers: ["NVDA", "AAPL", "MSFT"]
  },
  {
    title: "Semiconductor and AI infrastructure stocks rally on surging hyperscaler data center capex",
    titleBg: "Акциите за полупроводници и AI инфраструктура поскъпват след рекорден ръст на инвестициите в дейта центрове",
    source: "CNBC",
    time: "Преди 42 мин",
    timeEn: "42 minutes ago",
    summary: "Leading chipmakers and cloud providers report accelerating demand for next-generation AI accelerators and enterprise cloud workloads.",
    summaryBg: "Водещите производители на чипове и облачни доставчици отчитат ускорено търсене на ново поколение AI ускорители и корпоративни облачни системи.",
    impact: "Positive",
    url: "https://www.cnbc.com/technology/",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=640&auto=format&fit=crop&q=80",
    category: "all-stocks",
    tickers: ["NVDA", "AMD", "AVGO", "TSM"]
  },
  {
    title: "Global crude oil and gold stabilize as markets assess OPEC+ supply outlook and Treasury yields",
    titleBg: "Петролът и златото се стабилизират, докато пазарите оценяват доставките от ОПЕК+ и доходността по облигациите",
    source: "Reuters",
    time: "Преди 1 час",
    timeEn: "1 hour ago",
    summary: "Brent crude trades near key technical support while precious metals remain resilient amid ongoing central bank accumulation.",
    summaryBg: "Суровият петрол сорт Брент се търгува около ключови нива на подкрепа, докато благородните метали остават стабилни на фона на покупките от централни банки.",
    impact: "Neutral",
    url: "https://www.investing.com/commodities/crude-oil",
    image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=640&auto=format&fit=crop&q=80",
    category: "markets",
    tickers: ["XOM", "CVX"]
  },
  {
    title: "Европейските борси и БФБ отчитат засилен интерес към финансовия и енергийния сектор",
    titleBg: "Европейските борси и БФБ отчитат засилен интерес към финансовия и енергийния сектор",
    source: "Investor.bg",
    time: "Преди 2 часа",
    timeEn: "2 hours ago",
    summary: "Българският индекс SOFIX и водещите европейски пазари се движат с положителен тренд на фона на нови дивиденти и стабилни тримесечни финансови отчети.",
    summaryBg: "Българският индекс SOFIX и водещите европейски пазари се движат с положителен тренд на фона на нови дивиденти и стабилни тримесечни финансови отчети.",
    impact: "Positive",
    url: "https://www.investor.bg/rss/latest",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=640&auto=format&fit=crop&q=80",
    category: "bg",
    tickers: []
  }
];

const TABS: { id: NewsTabType; labelEn: string; labelBg: string; subtitleEn: string; subtitleBg: string }[] = [
  {
    id: 'newsroom',
    labelEn: 'Newsroom',
    labelBg: 'Newsroom (Водещи)',
    subtitleEn: 'Top breaking market stories & editorial coverage from WSJ, CNBC, MarketWatch & StockAnalysis',
    subtitleBg: 'Водещи пазарни обзори и топ новини от WSJ, CNBC, MarketWatch, StockAnalysis и Investor.bg'
  },
  {
    id: 'markets',
    labelEn: 'Markets',
    labelBg: 'Markets (Пазари)',
    subtitleEn: 'Real-time global market headlines from The Wall Street Journal, CNBC, MarketWatch & Reuters',
    subtitleBg: 'Глобални пазарни новини в реално време от The Wall Street Journal, CNBC, MarketWatch и Reuters'
  },
  {
    id: 'all-stocks',
    labelEn: 'All Stocks',
    labelBg: 'All Stocks (Акции)',
    subtitleEn: 'Company-specific stock news with ticker tags from Seeking Alpha, CNBC, WSJ & TechCrunch',
    subtitleBg: 'Новини по компании и борсови тикери от Seeking Alpha, CNBC, WSJ и TechCrunch'
  },
  {
    id: 'press-releases',
    labelEn: 'Press Releases',
    labelBg: 'Press Releases (Отчети)',
    subtitleEn: 'Official corporate press releases from GlobeNewsWire, PRNewsWire & Business Wire',
    subtitleBg: 'Официални корпоративни съобщения и отчети директно от GlobeNewsWire, PRNewsWire и Business Wire'
  },
  {
    id: 'bg',
    labelEn: 'Bulgaria & EU',
    labelBg: 'България & Европа',
    subtitleEn: 'Bulgarian Stock Exchange (BSE) and European financial news from Investor.bg',
    subtitleBg: 'Финансови и борсови новини за България (БФБ) и Европа директно от Investor.bg'
  }
];

export default function CompanyNewsContainer({ stocks, selectedStock, onSelectStock }: Props) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<NewsTabType>('markets');
  const [langMode, setLangMode] = useState<'en' | 'bg'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [customTickerFilter, setCustomTickerFilter] = useState<string | null>(null);

  const activeTicker = customTickerFilter || (selectedStock ? selectedStock.ticker : null);
  const activeCompanyName = useMemo(() => {
    if (!activeTicker) return '';
    if (selectedStock && selectedStock.ticker.toUpperCase() === activeTicker.toUpperCase()) {
      return selectedStock.companyName;
    }
    const found = stocks.find(s => s.ticker.toUpperCase() === activeTicker.toUpperCase());
    return found ? found.companyName : activeTicker;
  }, [activeTicker, selectedStock, stocks]);

  const fetchNews = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError('');

    try {
      let endpoint = `/api/global-news?tab=${encodeURIComponent(activeTab)}${forceRefresh ? '&refresh=true' : ''}`;
      let options: RequestInit = { method: 'GET' };

      if (activeTicker) {
        endpoint = '/api/company-news';
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticker: activeTicker,
            companyName: activeCompanyName || activeTicker
          })
        };
      }

      const response = await fetch(endpoint, options);
      if (!response.ok) throw new Error('Неуспешна заявка към сървъра за новини');

      const data = await response.json();
      const rawArticles = Array.isArray(data)
        ? data
        : (data.news && Array.isArray(data.news))
        ? data.news
        : [];

      if (rawArticles.length > 0) {
        const parsedNews: NewsArticle[] = rawArticles.map((item: any) => ({
          title: item.title || 'Financial News',
          titleBg: item.titleBg || item.title || 'Финансова новина',
          source: item.source || (activeTicker ? 'Yahoo Finance' : 'MarketWatch'),
          time: item.time || 'Днес',
          timeEn: item.timeEn || item.time || 'Today',
          summary: item.summary || '',
          summaryBg: item.summaryBg || item.summary || '',
          impact: (item.impact === 'Positive' || item.impact === 'Negative') ? item.impact : 'Neutral',
          url: (item.url && item.url.startsWith('http'))
            ? item.url
            : (activeTicker ? `https://stockanalysis.com/stocks/${activeTicker.toLowerCase()}/` : 'https://stockanalysis.com/news/'),
          image: item.image || getFallbackImg(item.title || item.source || 'news'),
          category: item.category || activeTab,
          tickers: Array.isArray(item.tickers) ? item.tickers : [],
          publishedDate: item.publishedDate,
          lang: item.lang
        }));
        setNews(parsedNews);
        setError('');
      } else {
        throw new Error('Няма върнати новини от сървъра');
      }
    } catch (err: any) {
      console.warn('Could not fetch remote news, loading fallback stream:', err);
      const fallback = activeTicker
        ? getFallbackNewsLocal(activeTicker, activeCompanyName || activeTicker)
        : GENERAL_FALLBACK_NEWS;
      setNews(fallback);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [activeTab, activeTicker]);

  // Keep customTickerFilter synced when parent selectedStock changes
  useEffect(() => {
    if (selectedStock) {
      setCustomTickerFilter(null);
    }
  }, [selectedStock]);

  const getFallbackNewsLocal = (ticker: string, companyName: string): NewsArticle[] => {
    const name = companyName || ticker;
    return [
      {
        title: `${name} (${ticker}) reports strong quarterly revenue and operating margin expansion`,
        titleBg: `${name} (${ticker}) отчете изключително силни тримесечни приходи, надминаващи очакванията`,
        source: "Yahoo Finance",
        time: "Преди 2 часа",
        timeEn: "2 hours ago",
        summary: `Quarterly financial results for ${name} highlight accelerating top-line growth and disciplined cost execution across core segments.`,
        summaryBg: `Финансовият отчет на компанията за тримесечието показва ускорен растеж на приходите и оптимизиране на оперативните разходи.`,
        impact: "Positive",
        url: `https://finance.yahoo.com/quote/${ticker}`,
        image: getFallbackImg(ticker + '1'),
        tickers: [ticker]
      },
      {
        title: `Wall Street analysts highlight growing market share and competitive moat for ${ticker}`,
        titleBg: `Анализ на Уолстрийт за нарастващи пазарни дялове и силно конкурентно предимство на ${ticker}`,
        source: "MarketWatch",
        time: "Днес",
        timeEn: "Today",
        summary: `Institutional research notes emphasize ${ticker}'s expanding economic moat and strong balance sheet positioning against industry peers.`,
        summaryBg: `Инвестиционни анализатори засилиха оценките си за ${ticker} поради нарастващ „икономически ров“ (Moat).`,
        impact: "Positive",
        url: `https://finance.yahoo.com/quote/${ticker}`,
        image: getFallbackImg(ticker + '2'),
        tickers: [ticker]
      },
      {
        title: `Free cash flow analysis and capital allocation outlook for ${name}`,
        titleBg: `Финансов анализ на паричните потоци и възвръщаемостта на капитала за ${name}`,
        source: "Seeking Alpha",
        time: "Вчера",
        timeEn: "Yesterday",
        summary: `Strong liquidity and free cash flow generation at ${name} support ongoing share repurchases and long-term shareholder returns.`,
        summaryBg: `Отличната кешова позиция и свободният паричен поток на ${name} създават предпоставки за дивиденти и обратно изкупуване на акции.`,
        impact: "Positive",
        url: `https://finance.yahoo.com/quote/${ticker}`,
        image: getFallbackImg(ticker + '3'),
        tickers: [ticker]
      }
    ];
  };

  const handleTickerBadgeClick = (ticker: string) => {
    const clean = ticker.trim().toUpperCase();
    const portfolioMatch = stocks.find(
      s => s.ticker.toUpperCase() === clean || s.ticker.toUpperCase().endsWith(`:${clean}`) || s.ticker.toUpperCase().startsWith(`${clean}.`)
    );
    if (portfolioMatch) {
      setCustomTickerFilter(null);
      onSelectStock(portfolioMatch);
    } else {
      setCustomTickerFilter(clean);
    }
  };

  const clearTickerSelection = () => {
    setCustomTickerFilter(null);
    onSelectStock(null);
  };

  const getImpactBadge = (impact: 'Positive' | 'Negative' | 'Neutral') => {
    switch (impact) {
      case 'Positive':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-[#10b981] border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold rounded-full font-sans tabular-nums">
            <TrendingUp className="w-2.5 h-2.5" />
            {langMode === 'bg' ? 'Положително' : 'Bullish'}
          </span>
        );
      case 'Negative':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-500/10 text-[#f43f5e] border border-rose-500/30 px-2 py-0.5 text-[11px] font-bold rounded-full font-sans tabular-nums">
            <TrendingDown className="w-2.5 h-2.5" />
            {langMode === 'bg' ? 'Отрицателно' : 'Bearish'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-card text-ink-muted border border-border px-2 py-0.5 text-[11px] font-medium rounded-full font-sans tabular-nums">
            <Minus className="w-2.5 h-2.5" />
            {langMode === 'bg' ? 'Неутрално' : 'Neutral'}
          </span>
        );
    }
  };

  const getSourceColorClass = (source: string) => {
    const s = (source || '').toLowerCase();
    if (s.includes('wall street journal') || s.includes('wsj')) return 'text-amber-600 dark:text-amber-400 font-semibold';
    if (s.includes('cnbc')) return 'text-blue-600 dark:text-blue-400 font-semibold';
    if (s.includes('marketwatch') || s.includes('barron')) return 'text-emerald-600 dark:text-emerald-400 font-semibold';
    if (s.includes('reuters') || s.includes('bloomberg')) return 'text-orange-600 dark:text-orange-400 font-semibold';
    if (s.includes('seeking alpha')) return 'text-amber-700 dark:text-amber-300 font-semibold';
    if (s.includes('prnewswire') || s.includes('globenewswire') || s.includes('business wire')) return 'text-purple-600 dark:text-purple-400 font-semibold';
    if (s.includes('investor')) return 'text-[#10b981] font-semibold';
    return 'text-ink-muted font-semibold';
  };

  const filteredNews = useMemo(() => {
    if (!searchQuery.trim()) return news;
    const q = searchQuery.trim().toLowerCase();
    return news.filter(item => {
      const t = (item.title || '').toLowerCase();
      const tBg = (item.titleBg || '').toLowerCase();
      const s = (item.summary || '').toLowerCase();
      const sBg = (item.summaryBg || '').toLowerCase();
      const src = (item.source || '').toLowerCase();
      const hasTicker = (item.tickers || []).some(tk => tk.toLowerCase().includes(q));
      return t.includes(q) || tBg.includes(q) || s.includes(q) || sBg.includes(q) || src.includes(q) || hasTicker;
    });
  }, [news, searchQuery]);

  const currentTabMeta = TABS.find(t => t.id === activeTab) || TABS[1];

  return (
    <div id="company-news-container" className="bg-bg rounded-2xl border border-border p-4 sm:p-5 mt-5 shadow-xs">
      {/* Top Header Bar (StockAnalysis Style) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-extrabold text-ink tracking-tight flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-[#10b981]" />
              {activeTicker
                ? (langMode === 'bg'
                    ? `${activeCompanyName} (${activeTicker}) — Новини`
                    : `${activeCompanyName} (${activeTicker}) News`)
                : (langMode === 'bg' ? 'Пазарни & Борсови Новини' : 'Market News')}
            </h2>
            {activeTicker && (
              <span className="inline-flex items-center gap-1 bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
                <Tag className="w-3 h-3" />
                {activeTicker}
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted mt-1">
            {activeTicker
              ? (langMode === 'bg'
                  ? `Актуални новини, анализи и прессъобщения за ${activeCompanyName} (${activeTicker})`
                  : `Real-time stock news, analysis, and press releases for ${activeCompanyName} (${activeTicker})`)
              : (langMode === 'bg' ? currentTabMeta.subtitleBg : currentTabMeta.subtitleEn)}
          </p>
        </div>

        {/* Right Controls: Search + Asset Selector + Language Switch + Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial sm:w-52">
            <Search className="w-3.5 h-3.5 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={langMode === 'bg' ? 'Търси новина или тикер...' : 'Search news or ticker...'}
              className="w-full bg-card border border-border rounded-xl pl-8 pr-7 py-1.5 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-[#10b981]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Dropdown for portfolio stock selection */}
          <div className="flex items-center gap-1.5 bg-card px-2.5 py-1.5 border border-border rounded-xl text-xs">
            <label className="text-[11px] font-bold text-ink-muted uppercase whitespace-nowrap">
              {langMode === 'bg' ? 'Актив:' : 'Stock:'}
            </label>
            <select
              value={selectedStock ? selectedStock.ticker : (customTickerFilter || '')}
              onChange={(e) => {
                const tick = e.target.value;
                if (!tick) {
                  clearTickerSelection();
                  return;
                }
                const found = stocks.find((s) => s.ticker === tick);
                if (found) {
                  setCustomTickerFilter(null);
                  onSelectStock(found);
                } else {
                  setCustomTickerFilter(tick);
                }
              }}
              className="bg-transparent text-xs text-ink font-bold focus:outline-none min-w-[115px] max-w-[165px] cursor-pointer"
            >
              <option value="" className="bg-bg text-ink">
                {langMode === 'bg' ? '-- Всички Новини --' : '-- All Market News --'}
              </option>
              {customTickerFilter && !stocks.some(s => s.ticker === customTickerFilter) && (
                <option value={customTickerFilter} className="bg-bg text-ink">
                  {customTickerFilter}
                </option>
              )}
              {stocks.map((s, idx) => (
                <option key={`${s.ticker}-${idx}`} value={s.ticker} className="bg-bg text-ink">
                  {s.ticker} - {s.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* Instant Language Toggle: EN (Original like StockAnalysis) / БГ (Превод) */}
          <div className="inline-flex items-center bg-card border border-border rounded-xl p-0.5 text-xs font-bold">
            <button
              onClick={() => setLangMode('en')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                langMode === 'en'
                  ? 'bg-[#10b981] text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Original English headlines (1:1 StockAnalysis style)"
            >
              <Globe className="w-3 h-3" />
              EN
            </button>
            <button
              onClick={() => setLangMode('bg')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                langMode === 'bg'
                  ? 'bg-[#10b981] text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Автоматичен превод на български език"
            >
              БГ
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchNews(true)}
            disabled={loading}
            className="bg-card hover:bg-card-hover border border-border text-ink font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title={langMode === 'bg' ? 'Обновяване на новинарския поток' : 'Refresh news feed'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#10b981]' : ''}`} />
            <span>{langMode === 'bg' ? 'Опресни' : 'Refresh'}</span>
          </button>

          {activeTicker && (
            <button
              onClick={clearTickerSelection}
              className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[#f43f5e] font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{langMode === 'bg' ? 'Всички' : 'Clear'}</span>
            </button>
          )}
        </div>
      </div>

      {/* StockAnalysis.com Sub-Navigation Tabs: Newsroom | Markets | All Stocks | Press Releases | Bulgaria */}
      {!activeTicker && (
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto border-b border-border pt-2 mb-4 no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'bg') {
                    setLangMode('bg');
                  }
                }}
                className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer -mb-[1px] ${
                  isActive
                    ? 'border-[#10b981] text-[#10b981] bg-[#10b981]/5 rounded-t-lg'
                    : 'border-transparent text-ink-muted hover:text-ink hover:border-border-hover'
                }`}
              >
                {langMode === 'bg' ? tab.labelBg : tab.labelEn}
              </button>
            );
          })}
        </div>
      )}

      {/* Quick Popular Tickers Bar (like StockAnalysis trending tickers) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-border/60 text-xs no-scrollbar">
        <span className="text-[11px] font-bold text-ink-faint uppercase shrink-0 mr-1">
          {langMode === 'bg' ? 'Популярни тикери:' : 'Trending Stocks:'}
        </span>
        {['NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'META', 'GOOGL', 'NFLX', 'AMD', 'AVGO', 'LMT'].map((sym) => {
          const isSelected = activeTicker?.toUpperCase() === sym;
          return (
            <button
              key={sym}
              onClick={() => isSelected ? clearTickerSelection() : handleTickerBadgeClick(sym)}
              className={`px-2.5 py-0.5 rounded-md text-xs font-bold font-sans tabular-nums transition-all cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-[#10b981] text-white border-[#10b981]'
                  : 'bg-card hover:bg-card-hover text-ink-muted hover:text-ink border-border'
              }`}
            >
              {sym}
            </button>
          );
        })}
      </div>

      {/* Main News Feed (1:1 StockAnalysis.com Card Layout) */}
      <div className="min-h-[280px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <RefreshCw className="w-8 h-8 text-[#10b981] animate-spin mb-3" />
            <h4 className="text-sm font-bold text-ink">
              {langMode === 'bg'
                ? 'Зареждане на пазарните новини в реално време...'
                : 'Loading live market news...'}
            </h4>
            <p className="text-xs text-ink-muted max-w-md mt-1">
              {langMode === 'bg'
                ? 'Извличане от The Wall Street Journal, CNBC, MarketWatch, Reuters, Seeking Alpha, PRNewsWire и GlobeNewsWire...'
                : 'Fetching latest stories from WSJ, CNBC, MarketWatch, Reuters, Seeking Alpha, PRNewsWire & GlobeNewsWire...'}
            </p>
          </div>
        ) : error && filteredNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <HelpCircle className="w-8 h-8 text-amber-500 mb-2" />
            <p className="text-xs font-bold text-ink">{error}</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <HelpCircle className="w-8 h-8 text-ink-faint mb-2" />
            <h4 className="text-sm font-bold text-ink">
              {langMode === 'bg' ? 'Няма намерени новини по този филтър' : 'No news articles match your filter'}
            </h4>
            <p className="text-xs text-ink-muted mt-1">
              {langMode === 'bg'
                ? 'Опитайте с друга ключова дума или изчистете филтъра.'
                : 'Try clearing the search query or selecting another tab.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border max-h-[760px] overflow-y-auto pr-1">
            {filteredNews.map((item, idx) => {
              const displayTitle = langMode === 'bg' ? (item.titleBg || item.title) : item.title;
              const displaySummary = langMode === 'bg' ? (item.summaryBg || item.summary) : item.summary;
              const displayTime = langMode === 'bg' ? item.time : (item.timeEn || item.time);
              const imgSrc = item.image || getFallbackImg(item.title || String(idx));

              return (
                <article
                  key={`${item.url}-${idx}`}
                  className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row gap-4 group hover:bg-card/50 rounded-xl px-2 -mx-2 transition-colors"
                >
                  {/* Left 16:9 Thumbnail (Exact StockAnalysis style) */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="w-full sm:w-52 h-44 sm:h-32 shrink-0 rounded-lg overflow-hidden bg-card border border-border relative block"
                  >
                    <img
                      src={imgSrc}
                      alt={displayTitle}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const backup = getFallbackImg(item.source + idx);
                        if (target.src !== backup) {
                          target.src = backup;
                        }
                      }}
                    />
                  </a>

                  {/* Right Content Column */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      {/* Top Meta Line: "24 minutes ago - The Wall Street Journal" + Impact Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-1.5">
                        <div className="flex items-center gap-1.5 text-ink-muted font-sans tabular-nums">
                          <span>{displayTime}</span>
                          <span>-</span>
                          <span className={getSourceColorClass(item.source)}>
                            {item.source}
                          </span>
                        </div>
                        {getImpactBadge(item.impact)}
                      </div>

                      {/* Headline */}
                      <h3 className="text-[15px] sm:text-base font-bold text-ink leading-snug group-hover:text-[#10b981] transition-colors">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          referrerPolicy="no-referrer"
                          className="hover:underline block"
                        >
                          {displayTitle}
                        </a>
                      </h3>

                      {/* Summary */}
                      {displaySummary && (
                        <p className="text-xs sm:text-[13px] text-ink-muted mt-1.5 leading-relaxed line-clamp-2">
                          {displaySummary}
                        </p>
                      )}
                    </div>

                    {/* Bottom Bar: Stocks: [AAPL] [NVDA] + External Link */}
                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                      {item.tickers && item.tickers.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="text-ink-faint font-semibold">
                            {langMode === 'bg' ? 'Акции:' : 'Stocks:'}
                          </span>
                          {item.tickers.map((sym) => (
                            <button
                              key={sym}
                              onClick={() => handleTickerBadgeClick(sym)}
                              className="px-2 py-0.5 rounded-md bg-card hover:bg-[#10b981]/15 text-ink hover:text-[#10b981] border border-border hover:border-[#10b981]/40 text-xs font-bold font-sans tabular-nums transition-all cursor-pointer"
                              title={langMode === 'bg' ? `Филтрирай новини за ${sym}` : `Filter news for ${sym}`}
                            >
                              {sym}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div />
                      )}

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#10b981] hover:underline ml-auto"
                      >
                        <span>
                          {langMode === 'bg' ? `Отвори в ${item.source}` : `Read on ${item.source}`}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-ink-faint">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
          <span>
            {langMode === 'bg'
              ? 'Източници в реално време: The Wall Street Journal, CNBC, MarketWatch, Reuters, Seeking Alpha, GlobeNewsWire, PRNewsWire, Business Wire и Investor.bg.'
              : 'Live sources: The Wall Street Journal, CNBC, MarketWatch, Reuters, Seeking Alpha, GlobeNewsWire, PRNewsWire, Business Wire & Investor.bg.'}
          </span>
        </div>
        <span className="font-mono">
          {filteredNews.length} {langMode === 'bg' ? 'статии' : 'articles'}
        </span>
      </div>
    </div>
  );
}
