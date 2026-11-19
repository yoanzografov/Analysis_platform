// Централна база знания за платформата RayVes Capital / Analysis Platform
// Свързва се директно към system_instruction на Gemini AI анализатора

export const CUSTOM_FAQ_AND_RULES = `
### ПЕРСОНАЛНИ ПРАВИЛА, АКАУНТИ И ЧЕСТО ЗАДАВАНИ ВЪПРОСИ (CUSTOM_FAQ_AND_RULES):
1. **Семейни акаунти / Второ портфолио (напр. за съпруга/партньор):**
   - Всяко портфолио е лично и изолирано към съответния Firebase акаунт.
   - Вторият човек може да се регистрира безплатно с имейл или Google от бутона „Вход / Синхронизация“ горе вдясно.
   - За ползване на един и същ компютър без превключване може да се отвори друг браузър (Safari/Edge) или Incognito прозорец, или да се ползва „Архив / Резервно копие (JSON)“ в Portfolio Tracker.
2. **Импорт от брокери:**
   - В таб **PORTFOLIO TRACKER** бутонът „📥 Импорт на портфолио“ поддържа директно качване на отчети от **Interactive Brokers (IBKR PDF/CSV)** и **Trading 212 (CSV)**.
3. **Валути и превалутиране:**
   - В таблицата и в раздел **STOCKS -> Financials** клиентът може да превключва валутата между **Борсова (оригинална)** (САЩ в $, Европа в €, Китай в ¥, Великобритания в £) или да превалутира всичко в **EUR (€)**, **USD ($)**, **CNY (¥)** или **GBP (£)**.
4. **Контакти и поддръжка:**
   - Платформа: RayVes Capital (https://analysis-platform-pink.vercel.app).
`;

export const PLATFORM_KNOWLEDGE = `
### БАЗА ЗНАНИЯ ЗА ПЛАТФОРМАТА (ANALYSIS PLATFORM / RAYVES CAPITAL):

#### 1. ОСНОВНИ РАЗДЕЛИ И НАВИГАЦИЯ:
- **INTERACTIVE TABLE (#table):** Интерактивна таблица с 230+ световни и европейски акции.
  - *Колони:* Watch, Ticker, Company Name, Statistics, 365 Chart, Date, Price of Calc, Daily Change %, Current Price, Fair Price (редактируема с 1 клик), Difference % (подцененост/надцененост), Over/Under (UNDERVALUED / OVERVALUED), Market Cap, P/E Ratio, EPS, Sector, Signal (КУПУВАЙ / ПРОДАВАЙ / ИЗЧАКАЙ), 52W Low / High, бутони **[AI Анализ]**, **[Калк]** и **[📰 Новини]**.
  - *Уиджети над таблицата:* Топ 15 печеливши/губещи за деня, Fear & Greed Index, FOMC/Макро таймери, Morning Market Briefing (дневен пазарен обзор) и Bento графики (разпределение по сектори и сигнали).
- **STOCKS (#stocks) — 9-табов Дълбок Анализ (1:1 по модела на StockAnalysis):**
  1. *Overview:* Текуща цена, Market Cap, Revenue, Net Income, EPS, PE, Forward PE, Dividend, 52W Range, Price Target, интерактивна графика (Google Finance стил) и описание на компанията.
  2. *Financials:* Официални 10-годишни отчети (TTM + 10 фискални години от SEC EDGAR 10-K и Yahoo Finance) + Тримесечни (Quarterly) + TTM: **Financials Overview, Income Statement, Balance Sheet, Cash Flow, Ratios, KPIs**. Има селектор за валута (Борсова, EUR, USD, CNY, GBP) и мащаб (M / B / Full).
  3. *Forecast:* 12-месечен ценови коридор (Low / Avg / High), консенсус от Уолстрийт, прогнози за приходи и EPS, последни рейтинги на банки.
  4. *Statistics:* Пазарни мултипликатори, EV/EBITDA, EV/FCF, ROE, ROA, маржове, ликвидност, кеш и дълг.
  5. *Metrics:* Бизнес сегменти, пазарни платформи, география и оперативни метрики.
  6. *Dividends:* Дивидентна доходност, годишна история, Payout Ratio и дати (Ex-Dividend, Pay Date).
  7. *History:* Възвръщаемост (1M, 3M, 6M, 1Y, YTD) и исторически котировки.
  8. *Profile:* Company Description, Key Executives, Contact Details и Stock Details (Exchange, CIK, CUSIP, ISIN).
  9. *Chart:* Превключване между Google Finance стил (с плъзгане за % доходност) и TradingView Candlestick.
- **Watchlist (#alerts):** Ценови известия и списък за следене (ABOVE / BELOW целева цена), достъпни след вход в профил.
- **PORTFOLIO TRACKER (#portfolio):** Лично портфолио с реални котировки, средна цена, Unrealized/Realized P&L, дивиденти, кеш баланс, семейни/лични акаунти и импорт от IBKR / Trading 212.
- **NEWS (#news):** Структуриран хъб в 6 блока: Stock & Market News, Economic News, World News & Politics, Economic Events, Recent & Upcoming Earnings (BMO/AMC с Beat/Miss) и This Week's IPOs.

#### 2. КАЛКУЛАТОРИ И ИНСТРУМЕНТИ (В ЛЯВОТО МЕНЮ):
- **Fair Value Calculator:** Изчислява справедлива цена чрез комбинация от DCF, Graham, Lynch и P/E мултипликатори.
- **DCF Calculator:** Дисконтиран свободен паричен поток: $PV = \\sum \\frac{FCF_t}{(1 + WACC)^t} + \\frac{TerminalValue}{(1 + WACC)^n}$.
- **ROI Calculator & Investment Calculator:** Изчисляват сложна лихва, CAGR = $(End / Start)^{1/n} - 1$ и бъдеща стойност на инвестиции.
- **Stock Profit Calculator & Percentage Calculator:** Чиста печалба след такси/данъци и процентни промени.
- **Check-list (13-точков одит):** Инвестиционен чеклист по Бъфет/Феролди.

#### 3. КЛЮЧОВИ ФОРМУЛИ В ПЛАТФОРМАТА:
- **Margin of Safety:** $((FairPrice - CurrentPrice) / FairPrice) \\times 100\\%$. Зелено при $\\ge 20\\%$.
- **Benjamin Graham Number:** $\\sqrt{22.5 \\times EPS \\times BVPS}$.
- **Graham Formula (1974):** $V = \\frac{EPS \\times (8.5 + 2g) \\times 4.4}{Y}$.
- **Peter Lynch Fair Value & PEG:** $FairValue = EPS \\times g$; $PEG = (P/E) / g$ (подценена при $PEG < 1.0$).
- **ROIC:** $NOPAT / InvestedCapital$ (златен стандарт $> 12\\text{–}15\\%$).
- **Rule of 40 (за SaaS/Tech):** $RevenueGrowth\\% + FCFMargin\\% \\ge 40\\%$.
- **Yield on Cost (YOC):** $(AnnualDividend / AvgBuyPrice) \\times 100\\%$.

#### 4. КАК СЕ ВЪВЕЖДАТ ТИКЕРИ (ТЪРСЕНЕ И ДОБАВЯНЕ):
- **САЩ:** Директно тикер (напр. \`AAPL\`, \`NVDA\`, \`FISV\`, \`BRK.B\`).
- **Европа:** С борсов суфикс или префикс (напр. \`SAP.DE\` или \`ETR:SAP\` за Германия, \`MC.PA\` или \`EPA:MC\` за Франция, \`ASML.AS\` за Нидерландия, \`SXR8.DE\` / \`SXR8:XETR\` за ETF-и).
- **Великобритания:** \`.L\` (напр. \`SHEL.L\`).
- **Китай / Хонконг:** \`.SS\` (Шанхай), \`.SZ\` (Шънджън), \`.HK\` (Хонконг, напр. \`9988.HK\`).

${CUSTOM_FAQ_AND_RULES}
`;
