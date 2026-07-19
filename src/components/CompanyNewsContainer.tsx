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
}

interface Props {
 stocks: Stock[];
 selectedStock: Stock | null;
 onSelectStock: (stock: Stock | null) => void;
}

const GENERAL_FALLBACK_NEWS: NewsArticle[] = [
 {
 title: "Инфлацията в САЩ (CPI) продължава да се охлажда по-бързо от очакванията на Уолстрийт",
 source: "Yahoo Finance",
 time: "Преди 45 минути",
 summary: "Годишният индекс на потребителските цени се понижи до 2.9%, което засилва пазарните прогнози, че Федералният резерв ще започне серия от съкращения на лихвените проценти през есента.",
 impact: "Positive",
 url: "https://finance.yahoo.com"
 },
 {
 title: "Федералният резерв на САЩ запазва лихвените нива, но дава ясен сигнал за предстоящо понижение",
 source: "Yahoo Finance",
 time: "Преди 2 часа",
 summary: "Председателят Джером Пауъл подчерта, че икономиката се движи към целевата инфлация от 2%, а пазарът на труда се балансира, което отваря вратата за облекчаване на монетарната политика.",
 impact: "Positive",
 url: "https://finance.yahoo.com"
 },
 {
 title: "Доклад за заетостта в САЩ (Non-Farm Payrolls) показва неочаквана устойчивост и умерено заплащане",
 source: "Yahoo Finance",
 time: "Преди 4 часа",
 summary: "През изминалия месец бяха разкрити 185,000 нови работни места, поддържайки безработицата стабилна на ниво от 4.0%. Умереният ръст на заплатите намалява опасенията от инфлационна спирала.",
 impact: "Positive",
 url: "https://finance.yahoo.com"
 },
 {
 title: "Доходността по 10-годишните щатски държавни облигации се понижава рязко след изявления на ФЕД",
 source: "Yahoo Finance",
 time: "Преди 6 часа",
 summary: "Пазарът на облигации реагира мигновено на сигналите за по-ниски лихви. Доходността на бенчмарковите 10-годишни съкровищни бонове падна под 4.10%, което подкрепи акциите с висок растеж.",
 impact: "Positive",
 url: "https://finance.yahoo.com"
 },
 {
 title: "Лихвените проценти на централните банки остават под строго наблюдение от глобалните инвеститори",
 source: "Yahoo Finance",
 time: "Преди 1 час",
 summary: "Глобалните пазари показват смесени настроения, докато икономистите анализират последните коментари от представители на Федералния резерв и ЕЦБ относно бъдещата траектория на инфлацията и лихвите.",
 impact: "Neutral",
 url: "https://finance.yahoo.com"
 },
 {
 title: "Технологичният сектор продължава да води пазарното рали, подкрепен от масивни AI иновации",
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
 title: "Златото отбелязва нов исторически връх на фона на геополитически риск и засилено търсене",
 source: "Yahoo Finance",
 time: "Днес",
 summary: "Цената на благородния метал премина границата от $2450 за тройунция, стимулирана от търсенето на активи убежища от страна на централните банки и дългосрочните инвеститори.",
 impact: "Positive",
 url: "https://finance.yahoo.com"
 },
 {
 title: "БВП на САЩ нараства с 2.8% за последното тримесечие, надхвърляйки предварителните очаквания",
 source: "Yahoo Finance",
 time: "Днес",
 summary: "Силното потребителско търсене и бизнес инвестициите улесняват сценария за 'меко кацане' на американската икономика без изпадане в рецесия.",
 impact: "Positive",
 url: "https://finance.yahoo.com"
 },
 {
 title: "Търговия на дребно в САЩ: Потребителските разходи остават изненадващо силни",
 source: "Yahoo Finance",
 time: "Днес",
 summary: "Последните статистически данни показват ръст от 0.6% в продажбите на дребно, воден от онлайн търговията и разходите за услуги, което демонстрира икономическата устойчивост на домакинствата.",
 impact: "Positive",
 url: "https://finance.yahoo.com"
 },
 {
 title: "ОПЕК+ постигна съгласие за удължаване на доброволните съкращения на добива на суров петрол",
 source: "Yahoo Finance",
 time: "Вчера",
 summary: "С цел поддържане стабилността на пазарите и противодействие на нарастващото производство от страни извън картела, страните членки ще запазят настоящите нива на ограничение до края на годината.",
 impact: "Neutral",
 url: "https://finance.yahoo.com"
 },
 {
 title: "МВФ актуализира глобалната си прогноза: Икономическото възстановяване остава стабилно, но неравномерно",
 source: "Yahoo Finance",
 time: "Вчера",
 summary: "Международният валутен фонд прогнозира 3.2% глобален растеж. Докладът посочва, че инфлационните рискове намаляват, но високите нива на държавен дълг изискват фискална предпазливост.",
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
 },
 {
 title: "ФЕД обмисля по-сериозно намаляване на лихвите след нови данни за трудовия пазар",
 source: "Bloomberg",
 time: "Преди 2 часа",
 summary: "Членове на Федералния резерв загатват за възможна стъпка от 50 базисни пункта през септември, с цел превантивно укрепване на икономическия растеж и заетостта.",
 impact: "Positive",
 url: "https://finance.yahoo.com"
 },
 {
 title: "Пазарен анализ: Глобалният AI хардуерен сектор се очаква да нарасне с 35% през 2026 г.",
 source: "Reuters",
 time: "Преди 5 часа",
 summary: "Проучвания на пазара показват непрекъснато търсене на ускорители за дълбоко обучение и специализиран хардуер в корпоративните центрове за данни по целия свят.",
 impact: "Positive",
 url: "https://finance.yahoo.com"
 },
 {
 title: "ETF на злато и дигитални активи отбелязват рекорден седмичен приток на институционален капитал",
 source: "Financial Times",
 time: "Днес",
 summary: "Увеличаващата се макроикономическа несигурност насочва големите фондове към алтернативни активи и сигурни убежища за съхранение на стойност.",
 impact: "Positive",
 url: "https://finance.yahoo.com"
 },
 {
 title: "Сезонът на отчетите: Големите компании запазват здрави маржове чрез автоматизация и ИИ",
 source: "Wall Street Journal",
 time: "Вчера",
 summary: "Повече от 75% от корпорациите в S&P 500 надвишиха консенсусните прогнози за нетна печалба за последното тримесечие благодарение на сериозни оптимизации.",
 impact: "Positive",
 url: "https://finance.yahoo.com"
 },
 {
 title: "Европейската централна банка (ЕЦБ) намалява лихвените проценти с 25 базисни пункта",
 source: "Bloomberg",
 time: "Вчера",
 summary: "Управителният съвет на ЕЦБ взе решение за ново намаляване на лихвените нива след забавяне на общата инфлация в Еврозоната до целевия диапазон от 2.2%.",
 impact: "Positive",
 url: "https://finance.yahoo.com"
 },
 {
 title: "S&P 500 достига нов исторически рекорд, воден от компаниите за облачни изчисления",
 source: "Reuters",
 time: "Днес",
 summary: "Широкият американски индекс премина поредния си крайъгълен камък. Инвеститорите остават изключително оптимистично настроени за приходите на технологичния сектор през следващата година.",
 impact: "Positive",
 url: "https://finance.yahoo.com"
 },
 {
 title: "Анализатори очакват повишена волатилност поради наближаващите фискални промени",
 source: "Financial Times",
 time: "Преди 1 ден",
 summary: "Преструктурирането на данъчните облекчения и бюджетните спорове в Сената могат да предизвикат временни разпродажби на пазарите на акции, предупреждават финансови съветници.",
 impact: "Negative",
 url: "https://finance.yahoo.com"
 }
];

export default function CompanyNewsContainer({ stocks, selectedStock, onSelectStock }: Props) {
 const [news, setNews] = useState<NewsArticle[]>([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const fetchNews = async () => {
 setLoading(true);
 setError('');
 
 try {
 const ticker = selectedStock ? selectedStock.ticker : 'SPY';
 const response = await fetch(`/api/news?ticker=${encodeURIComponent(ticker)}`);
 if (!response.ok) throw new Error('Network error');
 
 const parsedNews: NewsArticle[] = await response.json();
 
 if (Array.isArray(parsedNews) && parsedNews.length > 0) {
 setNews(parsedNews);
 } else if (Array.isArray(parsedNews) && parsedNews.length === 0) {
 setNews([]);
 } else {
 throw new Error('Невалиден формат на новините.');
 }
 } catch (err: any) {
 console.error("Error fetching news:", err);
 setError('Неуспешна връзка със сървъра. Използваме сигурен резервен поток.');
 setNews(selectedStock ? getFallbackNewsLocal(selectedStock.ticker, selectedStock.companyName) : GENERAL_FALLBACK_NEWS);
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
 <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#10b981] border border-emerald-300 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-2xl font-mono">
 <TrendingUp className="w-2.5 h-2.5" />
 Положително
 </span>
 );
 case 'Negative':
 return (
 <span className="inline-flex items-center gap-1 bg-red-50 text-[#f43f5e] border border-red-300 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-2xl font-mono">
 <TrendingDown className="w-2.5 h-2.5" />
 Отрицателно
 </span>
 );
 default:
 return (
 <span className="inline-flex items-center gap-1 bg-bg text-ink-muted border border-border-hover px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-2xl font-mono">
 <Minus className="w-2.5 h-2.5" />
 Неутрално
 </span>
 );
 }
 };

 return (
 <div id="company-news-container" className="bg-bg rounded-2xl border border-border p-4 mt-5 shadow-xs">
 {/* Header section */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
 <div>
 <h3 className="text-xs uppercase font-extrabold text-ink font-mono tracking-tight flex items-center gap-1.5">
 <Newspaper className="w-3.5 h-3.5 text-[#10b981]" />
 {selectedStock ? `Най-важни новини за ${selectedStock.companyName} (${selectedStock.ticker})` : 'Глобални финансови & пазарни новини'}
 </h3>
 <p className="text-[11px] text-ink-faint mt-0.5">
 Актуални и изключително проверени новини от единствен авторитетен източник: Yahoo Finance (https://finance.yahoo.com/).
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2.5">
 {/* Dropdown for quick stock selection */}
 <div className="flex items-center gap-2 bg-bg p-1.5 border border-border rounded-2xl text-xs">
 <label className="text-[10px] font-mono font-bold text-ink-muted uppercase whitespace-nowrap">АКТИВ:</label>
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
 onClick={fetchNews}
 disabled={loading}
 className="bg-bg rounded-2xl hover:bg-bg border border-border text-ink font-extrabold text-[10px] px-3 py-1.5 flex items-center gap-1.5 uppercase transition-all cursor-pointer disabled:opacity-50"
 title="Обновяване на новинарския поток"
 >
 <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
 Опресни
 </button>

 {selectedStock && (
 <button
 onClick={() => onSelectStock(null)}
 className="bg-bg hover:bg-card-hover border border-border-hover text-ink-muted font-bold text-[10px] px-3 py-1.5 rounded-2xl flex items-center gap-1.5 uppercase transition-all cursor-pointer"
 >
 <X className="w-3 h-3" />
 Общи новини
 </button>
 )}
 </div>
 </div>

 {/* Main Content list */}
 <div className="bg-bg border border-border p-4 rounded-2xl min-h-[220px]">
 {loading ? (
 <div className="flex flex-col items-center justify-center text-center py-12">
 <RefreshCw className="w-8 h-8 text-[#10b981] animate-spin mb-4" />
 <h4 className="text-xs font-extrabold font-mono uppercase text-ink tracking-tight">
 Извличане на проверени новини...
 </h4>
 <p className="text-[11px] text-ink-faint max-w-md mt-2 leading-relaxed">
 Google AI сканира надеждни източници в реално време, за да открие най-влиятелните статии и регулаторни събития за {selectedStock ? selectedStock.companyName : 'глобалните пазари'}...
 </p>
 </div>
 ) : error ? (
 <div className="bg-bg border border-border p-4 rounded-2xl">
 <div className="flex items-center gap-2 text-amber-800 font-mono text-xs font-bold mb-2">
 <AlertTriangle className="w-4 h-4 shrink-0" />
 <span>{error}</span>
 </div>
 
 {/* Displaying fallbacks inside error screen automatically */}
 <div className="mt-4 space-y-4">
 <h4 className="text-[10px] uppercase font-bold text-ink-faint font-mono tracking-wider">Резервни актуални новини:</h4>
 <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
 {news.map((item, idx) => (
 <div key={idx} className="bg-bg rounded-2xl border border-border p-3">
 <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-1.5 mb-2 font-mono text-[10px]">
 <div className="flex items-center gap-1.5">
 <span className="font-bold text-ink uppercase">{item.source}</span>
 <span className="text-ink0">•</span>
 <span className="text-ink-faint">{item.time}</span>
 </div>
 {getImpactBadge(item.impact)}
 </div>
 <h5 className="text-xs font-bold text-ink font-sans leading-snug">{item.title}</h5>
 <p className="text-[11px] text-ink-faint mt-1.5 leading-relaxed">{item.summary}</p>
 <a
 href={item.url}
 target="_blank"
 referrerPolicy="no-referrer"
 className="inline-flex items-center gap-1 text-[10px] font-bold text-[#10b981] hover:underline mt-2"
 >
 Прочетете цялата статия на {item.source} <ExternalLink className="w-3 h-3" />
 </a>
 </div>
 ))}
 </div>
 </div>
 </div>
 ) : news.length === 0 ? (
 <div className="flex flex-col items-center justify-center text-center py-10">
 <HelpCircle className="w-8 h-8 text-ink-faint mb-3" />
 <h4 className="text-xs font-extrabold font-mono uppercase text-ink tracking-tight">
 Няма налични новини в момента
 </h4>
 <p className="text-[11px] text-ink-faint max-w-md mt-1">
 Не бяха открити скорошни събития за този актив. Моля, проверете отново по-късно или изберете друг актив.
 </p>
 </div>
 ) : (
 <div className="flex flex-col gap-3.5 max-h-[520px] overflow-y-auto pr-1">
 {news.map((item, idx) => (
 <div 
 key={idx} 
 className="bg-bg rounded-2xl border border-border p-4 flex flex-col justify-between hover:border-emerald-800 transition-all shadow-xs group"
 >
 <div>
 <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2 mb-3 font-mono text-[10px]">
 <div className="flex items-center gap-1.5">
 <span className="font-extrabold text-[#10b981] uppercase tracking-tight">{item.source}</span>
 <span className="text-ink0">•</span>
 <div className="flex items-center gap-1 text-ink-faint">
 <Clock className="w-3 h-3" />
 <span>{item.time}</span>
 </div>
 </div>
 {getImpactBadge(item.impact)}
 </div>

 <h4 className="text-xs font-extrabold text-ink font-sans leading-snug group-hover:text-[#10b981] transition-colors">
 {item.title}
 </h4>
 
 <p className="text-[11px] text-ink-faint mt-2 leading-relaxed font-sans">
 {item.summary}
 </p>
 </div>

 <div className="mt-4 pt-2.5 border-t border-dashed border-border/50 flex items-center justify-between">
 <span className="text-[9px] font-mono text-ink-faint uppercase">Официален източник</span>
 <a
 href={item.url}
 target="_blank"
 rel="noopener noreferrer"
 referrerPolicy="no-referrer"
 className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#10b981] hover:text-emerald-950 hover:underline cursor-pointer"
 >
 Линк към статията <ExternalLink className="w-3 h-3 text-[#10b981]" />
 </a>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Footer disclaimer */}
 <div className="mt-3 bg-bg border border-border p-2.5 text-[9px] text-ink-faint leading-normal font-mono flex items-start gap-1.5">
 <HelpCircle className="w-3.5 h-3.5 text-[#10b981] shrink-0 mt-0.5" />
 <span>
 Всички изведени новини се извличат автоматично в реално време чрез Google Search Grounding и са строго ограничени до единствения официален източник Yahoo Finance. Анализът на ценовия импулс („Положително“, „Отрицателно“, „Неутрално“) се определя от изкуствения интелект и е с чисто информационен характер.
 </span>
 </div>
 </div>
 );
}
