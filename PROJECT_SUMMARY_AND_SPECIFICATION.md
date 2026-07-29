# 📊 Платформа за Проследяване на Инвестиции и Акции (Bulgarian Stock Tracking Platform)
> **Пълна спецификация и архивен бакъп за AI Агенти (AI Agent Specification & Context Prompt)**
> **Версия:** 2.0 (Юли 2026) | **Git Commit:** `aba79a6` / `a67c7b1` | **База данни:** Firebase Firestore

---

## 📌 1. ОБЗОР НА ПРОЕКТА (PROJECT OVERVIEW)

Това приложение е високопроизводителна уеб платформа за проследяване на фондови пазари, акции, индекси, суровини и криптовалути в реално време, създадена на български език. Платформата съчетава функционалност от тип интелигентен Excel/Google Spreadsheet с интерактивни графики от **TradingView**, изчисления на справедлива цена (Fair Price / intrinsic value), планиране на персонализирани ценови известия и интегриран изкуствен интелект (Gemini AI) за финансов анализ.

---

## 🛠️ 2. ТЕХНОЛОГИЧЕН СТЕК (TECHNOLOGY STACK)

* **Фронтенд рамка:** React 18, TypeScript, Vite
* **Стилизиране:** Tailwind CSS, Lucide React иконки, Ванла CSS адаптивен дизайн
* **Визуализация на графики:** TradingView Advanced Real-Time Chart Widget (`react-ts-tradingview-widgets`)
* **База данни & Облачен синхрон:** Firebase Firestore (`portfolio/default` документ)
* **Серверни функции & API хостинг:**
  * **Vercel Serverless Functions (`/api/[...path].ts`):** Yahoo Finance API v7 + v8 chart fallback + Finnhub real-time quote override
  * **Локален Node.js/Express сървър (`server.ts`):** Обезпечава локална среда на порт `3000` и Gemini AI интеграция
* **Интеграция на AI:** Google Gemini API (`@google/genai`)

---

## 🗄️ 3. СТРУКТУРИ НА ДАННИТЕ И ИНТЕРФЕЙСИ (DATA MODELS & SCHEMAS)

### 3.1. Акция (`Stock` - `src/types.ts`)
```typescript
export interface Stock {
  watch: string;             // Статус на наблюдение: 'Buy', 'Sell', 'Watch', 'Attn', 'Interesting', 'Not interesting'
  ticker: string;            // Пазарен тикер (напр. 'AAPL', 'MSFT', 'ETR:DHL')
  companyName?: string;       // Име на компанията
  priceOfCalc: number | null; // Цена на изчисление (Calculated Price / Valuation baseline)
  calcLink?: string;         // Външен линк към калкулация в Google Sheets
  fairPrice: number | null;  // Справедлива стойност (Fair Price)
  currentPrice: number;      // Текуща пазарна цена в реално време от Yahoo/Finnhub
  difference: number | null; // Процентно разминаване спрямо справедливата цена
  buySell: string;           // Автоматичен статус: 'UNDERVALUED', 'OVERVALUED', 'ДРУГИ'
  dailyChangePct: number;    // Дневна процентна промяна (напр. +1.50 или -0.80)
  low52: number | null;      // 52-седмично най-ниско ниво
  high52: number | null;     // 52-седмично най-високо ниво
  signal: string;            // Автоматичен сигнал от 52-W диапазона: 'Buy', 'Sell', 'Hold', '-'
  peRatio?: number | null;   // Съотношение P/E (Price to Earnings)
  eps?: number | null;       // Печалба на акция (EPS)
  marketCap?: number | null; // Пазарна капитализация
  dividend?: string | null;  // Годишен дивидент
  earningsTimestamp?: number;// Татировка на финансовия отчет
  notes?: string;            // Бележки на инвеститора
}
```

### 3.2. Пазарен индекс / Суровина (`MarketIndex` - `src/types.ts`)
```typescript
export interface MarketIndex {
  name: string;              // Име (напр. 'S&P 500', 'Gold Futures', 'Bitcoin USD')
  value: number;             // Текуща стойност (напр. 7353.94)
  changePct: number;         // Дневна промяна в проценти (напр. -1.01)
  changeVal: number;         // Дневна промяна в абсолютна стойност/долари (напр. -74.84)
  ticker?: string;           // Символ за котировки (напр. '^GSPC', 'GC=F', 'BTC-USD')
  category: string;          // Категория: 'US Markets', 'European Markets', 'Asian Markets', 'Commodities', 'Currencies & Crypto'
}
```

### 3.3. Ценово известие (`PriceAlert` - `src/types.ts`)
```typescript
export interface PriceAlert {
  id: string;                // Уникален ID на тригера
  ticker: string;            // Тикер на акцията
  criteria: 'ABOVE' | 'BELOW';// Условие: 'ABOVE' (над ▲) или 'BELOW' (под ▼)
  targetPrice: number;       // Целева таргет цена в $
  isActive: boolean;         // Активност
  createdAt: string;         // Дата на създаване
}
```

---

## 📐 4. КЛЮЧОВИ МОДУЛИ И АРХИТЕКТУРА (COMPONENT ARCHITECTURE)

### 4.1. `src/App.tsx`
* **Централно състояние:** Управлява списъците с акции (`stocks`), индекси (`indices`), известия (`alerts`), дневник с нотификации (`logs`).
* **Firebase синхронизация:** Зарежда и слуша в реално време с `onSnapshot` от `portfolio/default`.
* **КРИТИЧНО ИЗИСКВАНЕ ЗА FIREBASE:** Преди повикване на `setDoc()`, payload-ът **ЗАДЪЛЖИТЕЛНО** се почиства от `undefined` стойности с:
  ```typescript
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, "portfolio", "default"), cleanPayload);
  ```
* **Плаващо известие (Toast Notification):** При пресичане на таргет цена от известие, изскача елегантен банер в горния десен ъгъл с мигаща камбанка и бутон `✕` за затваряне (премахнато е замразяващото `window.alert`).

---

### 4.2. `src/components/StockTable.tsx` (Интерактивна таблица с 21 колони)
* **Възстановена функционалност:** 100% идентична с работния стандарт от неделя 26.07.2026 (commit `33e3994`).
* **Редактиране в клетка (Inline Editing):** 
  * Двойно кликване върху клетка я превръща в поле за въвеждане.
  * Натискане на **`Enter`** запазва новата стойност и обновява Firebase.
  * Натискане на **`Esc`** отменя редакцията.
* **Търсене и Сортиране:** Поддържа търсене по тикер/име и сортиране по цена, процентна промяна, разлика и др.

---

### 4.3. `src/components/IndicesStrip.tsx` (Лента за пазарни индекси)
* **Подредба на визуализацията (Точен дизайн):**
  Всеки индекс в реално време показва:
  ```text
  [Име на Индекса]
  [Текуща Цена]
  [Разлика в стойност] [Процентна промяна %]
  ```
  *Пример:*
  ```text
  S&P 500
  7353.94
  -74.84 -1.01%
  ```
* **Неномерирана ширина:** Използва `min-w-[980px]` и `px-2.5` без съкращаване или изрязване на числата.

---

### 4.4. `src/components/PriceAlertPlanner.tsx` (Планиране на известия)
* **Разположение:** Разположен **под таблицата с акции**.
* **Жива индикация за активни тригери (Live Trigger Status Badges):**
  * **🟢 `ЗАДЕЙСТВАН НАД ▲ (Текуща $X >= $Y)`** / **🔴 `ЗАДЕЙСТВАН ПОД ▼`** (Анимиран мигащ бадж при пресечена цена)
  * **`⚠️ БЛИЗО ($X)`** (Предупреждение при близост до 3% от таргета)
  * **Стандартен бадж** (`над ▲ $Y` / `под ▼ $Y`)
* **Редакция при клик:** Кликването върху всеки активен тригер попълва формата горе, променя бутона на **"Редактирай"** и добавя бутон **"Отказ"**.

---

### 4.5. `src/utils/tvSymbolMap.ts` (TradingView Символен Мапинг)
* **Забранени символи:** Всички платени/ограничени COMEX/NYMEX фючърси (`GC1!`, `CL1!`, `SI1!`) са заменени с **безплатни неограничени TradingView TVC/OANDA символи**, за да не изскача прозорецът *"This symbol is only available on TradingView"*:
  * **Gold Futures:** `TVC:GOLD`
  * **Silver Futures:** `TVC:SILVER`
  * **Crude Oil:** `TVC:USOIL`
  * **Brent Crude:** `TVC:UKOIL`
  * **Copper:** `TVC:COPPER`
  * **Natural Gas:** `TVC:NATURALGAS`
  * **Platinum:** `TVC:PLATINUM`
  * **S&P 500:** `OANDA:SPX500USD`
  * **NASDAQ 100:** `OANDA:NAS100USD`
  * **Dow Jones:** `OANDA:US30USD`
  * **VIX:** `TVC:VIX`
  * **Bitcoin:** `COINBASE:BTCUSD`

---

## 🔒 5. СТРИКТНИ ПРАВИЛА ЗА БЪДЕЩИ AI АГЕНТИ (DEVELOPMENT RULES)

1. **БЕЗ `undefined` СТОЙНОСТИ КЪМ FIREBASE:** Никога не изпращайте обект съдържащ `undefined` към `setDoc()` или `updateDoc()`. Използвайте `JSON.parse(JSON.stringify(payload))`.
2. **ТАБЛИЦАТА ТРЯБВА ДА ЗАПАЗВА С `Enter` И ДА ОТМЕНЯ С `Esc`:** Логиката за редакция в `StockTable.tsx` е критична за потребителя и не трябва да се чупи.
3. **TRADINGVIEW СИМВОЛИ:** Всички нови графики трябва да преминават през `getTradingViewSymbol(name, ticker)` в `src/utils/tvSymbolMap.ts`. Никога не ползвайте фючърсни кодове от типа `GC1!`.
4. **ТРИГЕРИ В PRICE ALERT PLANNER:** Запазете функционалността за клик-за-редакция и живата индикация `🟢 ЗАДЕЙСТВАН` / `⚠️ БЛИЗО`.

---

## 💾 6. БАКЪП НА СЪСТОЯНИЕТО (CHECKPOINT BACKUP)

* **Git Репозитория:** `yoanzografov/Analysis_platform`
* **Клон:** `main`
* **Последен стабилен Commit:** `3f0aa28` / `aba79a6` / `0d8f950`
* **Всички промени са тествани и валидирани с:** `npx tsc --noEmit && npx vite build` (0 грешки).
