import React, { useState, useEffect, useMemo } from 'react';
import { Stock } from '../types';
import { X, ExternalLink, Info, Lock, CheckSquare, Square, RefreshCw, CheckCircle2, PlusCircle, Check, ChevronRight } from 'lucide-react';
import { getSectorForStock } from '../utils/sectorHelper';

interface StockChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock?: Stock | null;
  stocks?: Stock[];
  onSaveToTable?: (stockData: Partial<Stock>) => void;
}

export interface SheetRowDefinition {
  rowNum: number;
  label: string;
  link?: string;
  defaultVal: string;
  cellType: 'yellow-input' | 'green-formula' | 'ref-error' | 'flag-green' | 'flag-yellow' | 'flag-red' | 'default';
  formulaStr?: string;
  note?: string;
  flagRules?: { green: string; yellow: string; red: string };
}

// Fallback stock database for major tickers to guarantee instant auto-fill
const POPULAR_STOCKS_DB: Record<string, {
  companyName: string;
  industry: string;
  sector: string;
  price: number;
  low52: number;
  high52: number;
  marketCap: number; // in $
  pe: number;
  shares?: number;
  revenue?: number;
  netIncome?: number;
  fcf?: number;
}> = {
  AAPL: { companyName: 'Apple Inc.', industry: 'Consumer Electronics', sector: 'Technology', price: 224.23, low52: 164.08, high52: 237.23, marketCap: 3420000000000, pe: 34.5, shares: 15200000000, revenue: 385600000000, netIncome: 100300000000, fcf: 108800000000 },
  NVDA: { companyName: 'NVIDIA Corporation', industry: 'Semiconductors', sector: 'Technology', price: 128.50, low52: 45.90, high52: 140.76, marketCap: 3150000000000, pe: 58.2, shares: 24500000000, revenue: 96300000000, netIncome: 53000000000, fcf: 48000000000 },
  TSLA: { companyName: 'Tesla, Inc.', industry: 'Automotive', sector: 'Consumer Cyclical', price: 215.40, low52: 138.80, high52: 271.00, marketCap: 686000000000, pe: 62.4, shares: 3190000000, revenue: 96700000000, netIncome: 14900000000, fcf: 4400000000 },
  MSFT: { companyName: 'Microsoft Corporation', industry: 'Software - Infrastructure', sector: 'Technology', price: 412.30, low52: 309.45, high52: 468.35, marketCap: 3060000000000, pe: 35.8, shares: 7430000000, revenue: 245100000000, netIncome: 88100000000, fcf: 74100000000 },
  AMZN: { companyName: 'Amazon.com, Inc.', industry: 'Internet Retail', sector: 'Consumer Cyclical', price: 175.60, low52: 118.35, high52: 201.20, marketCap: 1830000000000, pe: 41.2, shares: 10400000000, revenue: 574800000000, netIncome: 30400000000, fcf: 36800000000 },
  GOOGL: { companyName: 'Alphabet Inc.', industry: 'Internet Content & Information', sector: 'Communication Services', price: 165.20, low52: 120.21, high52: 191.75, marketCap: 2040000000000, pe: 24.1, shares: 12300000000, revenue: 307400000000, netIncome: 73700000000, fcf: 69500000000 },
  META: { companyName: 'Meta Platforms, Inc.', industry: 'Internet Content & Information', sector: 'Communication Services', price: 510.10, low52: 279.40, high52: 542.80, marketCap: 1290000000000, pe: 26.3, shares: 2530000000, revenue: 134900000000, netIncome: 39100000000, fcf: 43000000000 },
  NFLX: { companyName: 'Netflix, Inc.', industry: 'Entertainment', sector: 'Communication Services', price: 680.50, low52: 385.00, high52: 700.00, marketCap: 29200000000, pe: 42.1, shares: 429000000, revenue: 33700000000, netIncome: 5400000000, fcf: 6900000000 },
  AMD: { companyName: 'Advanced Micro Devices, Inc.', industry: 'Semiconductors', sector: 'Technology', price: 148.20, low52: 93.12, high52: 227.30, marketCap: 240000000000, pe: 110.5, shares: 1620000000, revenue: 22600000000, netIncome: 854000000, fcf: 1100000000 },
  PLTR: { companyName: 'Palantir Technologies Inc.', industry: 'Software - Application', sector: 'Technology', price: 31.80, low52: 14.48, high52: 33.20, marketCap: 71000000000, pe: 85.0, shares: 2230000000, revenue: 2230000000, netIncome: 210000000, fcf: 730000000 },
  DIS: { companyName: 'The Walt Disney Company', industry: 'Entertainment', sector: 'Communication Services', price: 95.40, low52: 78.73, high52: 123.74, marketCap: 173000000000, pe: 38.5, shares: 1810000000, revenue: 88900000000, netIncome: 3000000000, fcf: 4900000000 }
};

export const EXACT_SHEET_ROWS: SheetRowDefinition[] = [
  { rowNum: 1, label: "Company", defaultVal: "", cellType: "default" },
  { rowNum: 2, label: "Tickr", defaultVal: "", cellType: "yellow-input", formulaStr: "=Overview!B5" },
  { rowNum: 3, label: "Industry", defaultVal: "", cellType: "default" },
  { rowNum: 4, label: "Sector", defaultVal: "", cellType: "default" },
  { rowNum: 5, label: "Undervalued / Overvalued", defaultVal: "", cellType: "green-formula", formulaStr: "=#REF!/B7-1" },
  { rowNum: 6, label: "--- FINANCIAL METRICS ---", defaultVal: "", cellType: "default" },
  { rowNum: 7, label: "Current Price", defaultVal: "", cellType: "yellow-input" },
  { rowNum: 8, label: "52 week low / 52 week high", defaultVal: "", cellType: "ref-error" },
  { rowNum: 9, label: "Market Cap", defaultVal: "", cellType: "yellow-input" },
  { rowNum: 10, label: "P/E Ratio", defaultVal: "", cellType: "yellow-input", formulaStr: "PE Ratio = Stock Price / Earnings Per Share", flagRules: { green: "≤ 15", yellow: "15 - 25", red: "> 25" }, note: "PE Ratio = Stock Price / Earnings Per Share\n\nДРУГА ФОРМУЛА:\nPE Ratio = Market Cap / Net Income\n\nСъотношението цена към печалба (PE) е съотношението между цената на акциите на компанията и печалбата на акция. Той измерва цената на акцията спрямо нейните печалби.\n\nВъпреки това, ето обща насока за добри съотношения на PE въз основа на темпа на растеж:\nhttps://www.lynalden.com/pe-ratio/\n\nБез растеж: 10 или по-малко\nБавен растеж: 12\nУмерен растеж: 15\nБърз растеж: 25+\n\nВъпреки това, никога не трябва да инвестирате само въз основа на съотношението PE. \nНяма едно число, което да ви каже дали една инвестиция е добра идея." },
  { rowNum: 11, label: "Price to FCF", defaultVal: "", cellType: "default", note: "Price to FCF = Stock Price / FCF per share\nЗа разлика от P/E ratio-то, това съотношение ни показва по-истински данни за реалния кеш, с който дружеството разполага, а не с обявените печалби, които са манипулируеми до известна степен според GAAP. \n\nПо-ниската стойност от P/E ratio е по-добрата стойност." },
  { rowNum: 12, label: "Dividend Yield", defaultVal: "", cellType: "default", note: "Dividend yield = ($5 / $100) x 100 = 5%\n\nКогато цената падне с 50%, ето какво се случва, ако приемем, че\nкомпанията запази годишния дивидент от $5 непроменен:\n\nDividend yield = ($5 / $50) x 100 = 10%" },
  { rowNum: 13, label: "Dividend Payout Ratio", defaultVal: "", cellType: "default", formulaStr: "Dividend Payout Ratio = (Dividends Paid / Net Income) x 100", note: "Dividend Payout Ratio = (Dividends Paid / Net Income) x 100" },
  { rowNum: 14, label: "CASH Dividend Payout Ratio", defaultVal: "", cellType: "default", formulaStr: "Cash Dividend Payout Ratio = Dividends paid / Free Cash Flow x 100", note: "Cash Dividend Payout Ratio = Dividends paid / Free Cash Flow x 100\n\nПоказва ни по-истинското Payout Ratio и ни касае пряко като дивидентни инвеститори." },
  { rowNum: 15, label: "Dividend Growth Rate 5 - 10 year avg", defaultVal: "", cellType: "yellow-input" },
  { rowNum: 16, label: "5 yrs Annualized ROI", defaultVal: "", cellType: "default", formulaStr: "=Overview!J19" },
  { rowNum: 17, label: "10 yrs Annualized ROI", defaultVal: "", cellType: "default", formulaStr: "=Overview!J29" },
  { rowNum: 18, label: "Shares Outstanding", defaultVal: "", cellType: "yellow-input" },
  { rowNum: 19, label: "Revenue", defaultVal: "", cellType: "yellow-input" },
  { rowNum: 20, label: "Revenue avg increase 3 - 5 yrs", defaultVal: "", cellType: "yellow-input" },
  { rowNum: 21, label: "Gross Profit Margin", defaultVal: "", cellType: "yellow-input", flagRules: { green: "40%+", yellow: "30% - 40%", red: "< 30%" }, note: "Gross Profit Margin = (Gross Profit / Total Revenue) x 100 (%)\n\nПоказва ни какъв процент от оборота представлява брутната печалба. \n\nКолкото повече, толкова по-добре." },
  { rowNum: 22, label: "Research & Development (R&D Ratio)", defaultVal: "", cellType: "yellow-input", flagRules: { green: "< 30%", yellow: "30% - 40%", red: "> 40%" }, note: "Yoan Zografov:\nR&D ratio = R&D Expenses / Revenue х 100 (под 30%)\n\nПоказва ни какъв процент от оборота е разходът за проучване и развитие." },
  { rowNum: 23, label: "Selling, General & Admin (SG&A Ratio)", defaultVal: "", cellType: "yellow-input", flagRules: { green: "< 30%", yellow: "30% - 40%", red: "> 40%" }, note: "SGA ratio = SG&A Expenses / Revenue х 100 (под 30%)\nПоказва ни какъв процент от оборота е този разход.\nРазходи за Заплати, Маркетинг, Реклама" },
  { rowNum: 24, label: "EPS - Earnings Per Share", defaultVal: "", cellType: "green-formula", formulaStr: "Печалба на дял: EPS = Net Income/ Shares outstanding", note: "EPS - Earnings per share. \nПечалба на дял: EPS = Net Income/ Shares outstanding\n\nПечалбата на акция или EPS е просто изчисление, което показва колко печалба може да генерира една компания на акция от своите акци.\n\nДва основни фактора влияят на EPS: печалбата и броят на акциите.\n\nПечалби: EPS на компанията ще се увеличи с нарастването на приходите. Това може да се случи поради фактори като ръст на продажбите или намаляване на разходите. Ако печалбите намалеят, EPS също ще намалее.\nАкции: EPS на компанията ще се увеличи, когато общият брой на акциите в обращение намалява, като например в случай на обратно изкупуване на акции. Той ще намалее, когато броят на акциите се увеличи, например ако компанията издаде нови акции.\n\nАко една компания заеме повече дълг, EPS (знаменателят) намалява от по-високите разходи за лихви . Степента на въздействие върху цената на акциите до голяма степен зависи от това как се използва дългът.\n\nНапример повишеният риск и разходите за лихви могат да доведат до намаляване на съотношението цена/печалба, докато добре структурираната реинвестиция за растеж може да доведе до увеличаване на съотношението P/E и да компенсира недостатъците от използването на дълг.\n\nАко има две идентични компании, инвеститорите са по-склонни да оценят компанията с висок ливъридж при по-ниско съотношение P/E, предвид по-високите рискове, свързани с ливъриджа.\n\nhttps://www.wallstreetprep.com/knowledge/pe-ratio-price-to-earnings/" },
  { rowNum: 25, label: "EPS Growth 5 - 10 yrs", defaultVal: "", cellType: "yellow-input" },
  { rowNum: 26, label: "Net Income", defaultVal: "", cellType: "yellow-input", note: "Net Income = Revenue - All Expenses\nНетни приходи = Приходи - Всички разходи\n\nНетният доход е счетоводната печалба на компанията след изваждане на всички разходи и разходи от приходите. Нарича се още печалби." },
  { rowNum: 27, label: "Net Profit Margin", defaultVal: "", cellType: "green-formula", formulaStr: "NET PROFIT MARGIN = NET INCOME / REVENUE x 100", flagRules: { green: "20%+", yellow: "10% - 20%", red: "< 10%" }, note: `NET PROFIT MARGIN = NET INCOME / REVENUE x 100
Показва ни какъв процент от оборота представлява чистата печалба. Колкото повече, толкова по-добре.
За предпочитане е над 20%` },
  { rowNum: 28, label: "Return on Equity (ROE)", defaultVal: "", cellType: "yellow-input", formulaStr: "ROE = (Net Income / Average Shareholders' Equity) * 100%", flagRules: { green: "15%+", yellow: "5% - 15%", red: "< 5%" }, note: "ROE = (Net Income / Average Shareholders' Equity) * 100%\nПоказва ни как компанията използва капитала инвестиран от акционерите, как го оползотворява. Търсим стойности над 15%.\n\nИнвеститорите могат да анализират възвръщаемостта на собствения капитал, за да оценят способността на компанията да реализира печалба. Като цяло по-високата възвръщаемост на собствения капитал означава, че компанията е по-ефективна при генерирането на печалби.\n\nКазано с прости думи, ROE ви казва колко ефективно една компания използва своите нетни активи, за да генерира печалби. Високата възвръщаемост на собствения капитал означава, че една компания е добра в генерирането на печалби, които след това могат да бъдат използвани за увеличаване на приходите в бъдеще.\n\nhttps://stockanalysis.com/term/roe-return-on-equity/" },
  { rowNum: 29, label: "Return on Assets (ROA)", defaultVal: "", cellType: "yellow-input", formulaStr: "ROA = (Net Income / Average Total Assets) * 100%", flagRules: { green: "5%+", yellow: "2% - 5%", red: "< 2%" }, note: "ROA = (Net Income / Average Total Assets) * 100%\n\nПоказва ни как компанията използва активите си за генериране на печалби, как ги оползотворява. Търсим стойности над 5%." },
  { rowNum: 30, label: "Return on Capital (ROIC)", defaultVal: "", cellType: "yellow-input", formulaStr: "ROIC = (EBIT / Average Invested Capital) * 100%", flagRules: { green: "15%+", yellow: "5% - 15%", red: "< 5%" }, note: "ROIC = (EBIT / Average Invested Capital) * 100%\nВъзвръщаемостта на инвестирания капитал (ROIC) измерва доколко една компания е ефективна при инвестирането на своя капитал с цел увеличаване на печалбите. Изчислява се като EBIT (печалба преди лихви и данъци) се раздели на средния инвестиран капитал през предходната година.\n\nТърсим стойности над 15%\n\nROIC СТтойност - Интерпретация\n< 5% Слабо управление на капитала\n5% – 10% Приемливо, но посредствено\n> 10% Много добро – компанията създава стойност\n> 15% Отлично – вероятно има силно конкурентно предимство (moat)" },
  { rowNum: 31, label: "Current Ratio", defaultVal: "", cellType: "yellow-input", formulaStr: "CURRENT RATIO = CURRENT ASSETS / CURRENT LIABILITIES (над 1 е ок)", flagRules: { green: "1.5 - 3.0", yellow: "1.0 - 1.5", red: "< 1.0" }, note: "CURRENT RATIO = CURRENT ASSETS / CURRENT LIABILITIES (над 1 е ок)\nПоказва ни дали компанията може да погаси текущите си задължения с текущите си активи.\n\n================\nТекущият коефициент се използва за измерване на краткосрочната ликвидност на компанията. Ниско число може да показва, че дадена компания ще има проблеми с плащането на предстоящите си задължения.\n\nДоброто текущо съотношение е между 1,2 към 2 , което означава, че бизнесът има 2 пъти повече текущи активи, отколкото пасиви, за да покрие дълговете си. Текущо съотношение под 1 означава, че компанията няма достатъчно ликвидни активи, за да покрие своите краткосрочни задължения\n\nКакво е „добро“ Current Ratio?\n1.5 – 3.0: Това обикновено се счита за здравословен (добър) диапазон. Показва, че фирмата може да покрива задълженията си и има известен буфер.\n\nПод 1.0: Потенциален риск от ликвидни затруднения – фирмата няма достатъчно краткосрочни активи, за да плати краткосрочните си задължения.\n\nНад 3.0: Може да е знак, че капиталът не се използва ефективно – прекалено много пари са задържани в активи вместо да се инвестират.\n\nКонтекстът има значение:\nСектор: Търговски компании често имат по-нисък Current Ratio, докато производствени или технологични компании могат да поддържат по-висок.\n\nСезонност: Някои фирми имат сезонно колебание на оборотни активи и пасиви.\n\nИскаш ли да проверим какъв е текущият коефициент на определена компания?" },
  { rowNum: 32, label: "Long-Term Debt", defaultVal: "", cellType: "yellow-input" },
  { rowNum: 33, label: "Avg Debt Increase 10 yrs", defaultVal: "", cellType: "default" },
  { rowNum: 34, label: "Long-term Debt to Equity Ratio", defaultVal: "", cellType: "default" },
  { rowNum: 35, label: "Debt / Equity", defaultVal: "", cellType: "yellow-input", formulaStr: "Debt to Equity Ratio = Total Debt / Total Equity", flagRules: { green: "< 1.0", yellow: "1.0 - 2.0", red: "> 2.0" }, note: "Debt to Equity Ratio = Total Debt / Total Equity\n\nDebt / Equity Ratio = Total Debt / Shareholders' Equity\n\nПОД 2 Е ОК\n\nDebt to Equity Ratio: Съотношението дълг към собствен капитал изчислява тежестта на общия дълг и финансови пасиви спрямо собствения капитал или с други думи показва как компанията финансира бизнес операциите си - повече чрез дълг или акционерен капитал. Препоръчителни са стойности под 2.\n\nНякои инвеститори също обичат да сравняват съотношението D/E на компанията с общото \nD/E на S&P 500, което беше приблизително 1,58 в края на 202" },
  { rowNum: 36, label: "Cash Flow from Operations", defaultVal: "", cellType: "yellow-input" },
  { rowNum: 37, label: "CFFO 5-10 Years increase", defaultVal: "", cellType: "default" },
  { rowNum: 38, label: "Free Cash Flow", defaultVal: "", cellType: "yellow-input" },
  { rowNum: 39, label: "FCF 5 - 10 years avg increase", defaultVal: "", cellType: "yellow-input" },
  { rowNum: 40, label: "Cash Flow Margin", defaultVal: "", cellType: "green-formula", formulaStr: "=B36/B19", flagRules: { green: "15%+", yellow: "10% - 15%", red: "< 10%" }, note: "Cash Flow Margin Ratio = Cash Flow From Operations / Revenue x 100 (%)\nПоказва ни колко от всеки долар продажба се задържа като пари в брой (КЕШ). Колкото повече, толкова по-добре." },
  { rowNum: 41, label: "Free Cash Flow Margin", defaultVal: "", cellType: "green-formula", formulaStr: "=(B38/B19)", flagRules: { green: "15%+", yellow: "10% - 15%", red: "< 10%" }, note: "Free Cash Flow Margin = Free Cash Flow / Revenue x 100 (%)\n\nМаржът на свободния паричен поток (марж на FCF) е финансов показател, който показва колко ефективно една компания преобразува приходите си в свободен паричен поток, който представлява паричните средства, генерирани от компанията след покриване на оперативните разходи и капиталовите разходи. Той по същество измерва каква част от продажбите на компанията са налични като парични средства за дейности като изплащане на дълг, инвестиции или дивиденти. \n\nПо-високият марж на свободния финансов поток (FCF) показва, че компанията е по-ефективна в превръщането на продажбите в пари в брой, което може да бъде положителен знак за финансово здраве и оперативна ефективност. Марж на FCF от 10-15% често се счита за.\n\nВисокият марж на свободния финансов поток предполага ефективно управление на разходите и ефикасно използване на капитала." },
  { rowNum: 42, label: "Free Cash Flow Yield", defaultVal: "", cellType: "green-formula", formulaStr: "=1*(B38/B9)", flagRules: { green: "5%+", yellow: "3% - 5%", red: "< 3%" }, note: "Free Cash Flow Yield = Free Cash Flow / Market Cap x 100 (%)\n\nFree Cash Flow Yield (FCF Yield) е финансов показател, който показва колко свободен паричен поток (FCF) генерира една компания спрямо пазарната ѝ стойност. Това е мярка за доходността на инвестицията, базирана на реалния паричен поток, който остава на разположение за инвеститорите, след като всички оперативни и капиталови разходи са покрити.\n\nКакво ни казва този показател:\nВисок FCF Yield (напр. 8–10%+) → компанията генерира много свободен паричен поток спрямо текущата си пазарна оценка → потенциално подценена или много ефективна.\n\nНисък FCF Yield (напр. под 3%) → или е надценена, или не генерира достатъчно свободен паричен поток → възможен сигнал за рискове или слабости." },
  { rowNum: 43, label: "Earnings Yield", defaultVal: "", cellType: "green-formula", formulaStr: "=B24/B7", flagRules: { green: "7%+", yellow: "4% - 7%", red: "< 4%" }, note: "Earnings Yield = EPS / Price x 100 (%)\nEarnings Yield (EY) е финансов показател, който показва каква печалба на акция (EPS) се получава спрямо цената на акцията. Тоест, измерва колко „печалба“ получаваш за всеки вложен лев в акция.\n\nВисока стойност на EY → компанията генерира много печалба спрямо цената си → потенциално подценена.\nНиска стойност на EY → или е надценена, или има ниска печалба спрямо цената си.\nТова е обратното на P/E (Price-to-Earnings) ratio:\n\nEarnings Yield Интерпретация\n> 10% Много високо – потенциално подценена акция (или с временни проблеми)\n7–10% Добро ниво – може да бъде разумна стойностна инвестиция\n4–7% Нормално ниво за зрели компании със стабилни приходи\n< 4% Ниско – потенциално надценена акция или висок растеж, но с риск\n\nВажно:\nEarnings Yield сам по себе си НЕ е достатъчен.\n\nТрябва да го сравняваш с:\nЛихвения процент на безрисков актив – напр. доходността по 10-годишни държавни облигации.\nАко Earnings Yield е значително над тях (напр. 10% vs. 3%), това е добър знак.\n\n- Ръст на печалбите (EPS Growth) – висока печалба с бавен растеж ≠ добра инвестиция.\n\n- Качество на печалбата – дали е устойчива или манипулирана чрез счетоводни трикове.\n\n- Сравнение със сектора – EY от 5% може да е отлично за tech, но ниско за енергийна компания." },
  { rowNum: 44, label: "Free Cash Flow  / Net Income", defaultVal: "", cellType: "green-formula", formulaStr: "=B38/B26", flagRules: { green: "100%+", yellow: "70% - 100%", red: "< 70%" }, note: "Съотношението Свободен паричен поток към нетен доход (Free Cash Flow to Net Income ratio, FCF/NI) \nПоказва колко от отчетената печалба на една компания реално се превръща в „твърди“ пари, които остават след всички разходи и могат да се използват за: инвестиции, изплащане на дълг или дивиденти.\n\nПрагове:\nНад 100% → отлично, реалният кеш надвишава печалбата.\n\nОколо 100% → здравословно.\n\nПод 100% → внимателно, особено ако е трайно под 70%.\n\nОтрицателно → нетен доход положителен, но FCF отрицателен → червен флаг." },
  { rowNum: 45, label: "Cash Flow Coverage Ratio", defaultVal: "", cellType: "yellow-input", formulaStr: "Cash Flow Coverage Ratio = Operating Cash flow / Long-Term Debt", flagRules: { green: "> 1.0", yellow: "0.5 - 1.0", red: "< 0.5" }, note: "Cash Flow Coverage Ratio = Operating Cash flow / Long-Term Debt\n\nВисока стойност на това ratio показва, че компанията може да обслужва дълга си. Колкото по-високо CFCR над 1, толкова по-добре." },
  { rowNum: 46, label: "Operating Cash Flow Ratio", defaultVal: "", cellType: "default", formulaStr: "Operating Cash Flow Ratio = Operating Cash Flow / Current Liabilities", note: "Yoan Zografov:\n\nOperating Cash Flow Ratio = Operating Cash Flow / Current Liabilities\n\nТова е мярка за броя пъти, кога една компания може да изплати текущи задължения с паричните средства, генерирани за даден период." },
  { rowNum: 47, label: "Cash ROA", defaultVal: "", cellType: "yellow-input" },
  { rowNum: 48, label: "EBITDA Margin", defaultVal: "", cellType: "yellow-input", formulaStr: "EBITDA Margin = (EBITDA / Revenue) * 100", flagRules: { green: "20%+", yellow: "10% - 20%", red: "< 10%" }, note: "EBITDA Margin = (EBITDA / Revenue) * 100 (%)\n\nМаржът на EBITDA показва оперативната доходност на компанията преди начисляването на лихви, данъци, амортизация и обезценка. \n\nЗелен флаг: над 20%\nЖълт флаг: 10% - 20%\nЧервен флаг: под 10%" },
  { rowNum: 49, label: "Interest Coverage Rate", defaultVal: "", cellType: "yellow-input", formulaStr: "Interest Coverage = EBIT / Interest Expense", flagRules: { green: "> 5.0", yellow: "2.0 - 5.0", red: "< 2.0" }, note: "Interest Coverage Rate = EBIT / Interest Expense\n\nПокритието на лихвените разходи измерва колко пъти оперативната печалба (EBIT) може да покрие разходите за лихви по дълговете. Колкото по-високо число, толкова по-сигурна е компанията.\n\nЗелен флаг: над 5.0\nЖълт флаг: 2.0 - 5.0\nЧервен флаг: под 2.0 (риск от дефолт)" },
  { rowNum: 50, label: "Goodwill in Assets", defaultVal: "", cellType: "yellow-input", formulaStr: "Goodwill Ratio = (Goodwill / Total Assets) * 100", flagRules: { green: "< 10%", yellow: "10% - 20%", red: "> 20%" }, note: "Goodwill in Assets = (Goodwill / Total Assets) * 100 (%)\n\nПоказва каква част от активите на компанията се състоят от 'Goodwill' (репутация от премиум цени при придобивания). Прекалено висок Goodwill носи риск от бъдещи обезценки (impairments).\n\nЗелен флаг: под 10%\nЖълт флаг: 10% - 20%\nЧервен флаг: над 20%" },
  { rowNum: 51, label: "Asset Turnover Ratio", defaultVal: "", cellType: "yellow-input", formulaStr: "Asset Turnover = Revenue / Total Assets", flagRules: { green: "> 3.0", yellow: "1.0 - 3.0", red: "< 1.0" }, note: "Asset Turnover Ratio = Revenue / Total Assets\n\nКоефициентът на оборот на активите показва колко приходи генерира компанията за всеки $1 от активите си. Показва ефективността на управлението на активите.\n\nЗелен флаг: над 3.0\nЖълт флаг: 1.0 - 3.0\nЧервен флаг: под 1.0" },
  { rowNum: 52, label: "Quick Ratio", defaultVal: "", cellType: "yellow-input", formulaStr: "Quick Ratio = (Current Assets - Inventory) / Current Liabilities", flagRules: { green: "≥ 1.0", yellow: "0.8 - 1.0", red: "< 0.8" }, note: "Quick Ratio (Бърза ликвидност) = (Текущи активи - Запаси) / Текущи пасиви\n\nЗа разлика от Current Ratio, Quick Ratio изключва материалните запаси (които трудно се превръщат бързо в пари) и измерва най-бързата ликвидност на компанията.\n\nЗелен флаг: над 1.0\nЖълт флаг: 0.8 - 1.0\nЧервен флаг: под 0.8" },
  { rowNum: 53, label: "Stock-based Compensation (% of Net Income)", defaultVal: "", cellType: "yellow-input", formulaStr: "SBC Ratio = (Stock-Based Compensation / Net Income) * 100", flagRules: { green: "< 5%", yellow: "5% - 10%", red: "> 10%" }, note: "Stock-based Compensation as % of Net Income = (SBC / Net Income) * 100 (%)\n\nПоказва какъв процент от отчетената печалба се раздава като възнаграждения под формата на нови акции. Прекалено високото SBC разводнява акционерите и маскира реалните разходи.\n\nЗелен флаг: под 5%\nЖълт флаг: 5% - 10%\nЧервен флаг: над 10%" },
  { rowNum: 54, label: "CapEx (% of Net Income)", defaultVal: "", cellType: "yellow-input", formulaStr: "CapEx Ratio = (Capital Expenditures / Net Income) * 100", flagRules: { green: "< 15%", yellow: "15% - 25%", red: "> 25%" }, note: "CapEx as % of Net Income = (Capital Expenditures / Net Income) * 100 (%)\n\nИзмерва каква част от нетната печалба трябва да се реинвестира обратно в дълготрайни активи (оборудване, заводи, недвижими имоти), за да се поддържа бизнеса.\n\nЗелен флаг: под 15% (лек капитал, висок FCF)\nЖълт флаг: 15% - 25%\nЧервен флаг: над 25% (капиталоемък бизнес)" },
];


export default function StockChecklistModal({ isOpen, onClose, stock, stocks = [], onSaveToTable }: StockChecklistModalProps) {
  const [selectedTicker, setSelectedTicker] = useState<string>(stock?.ticker || '');
  const [activeInfoModalRow, setActiveInfoModalRow] = useState<SheetRowDefinition | null>(null);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  
  // Interactive Checklist State: Track checked rows
  const [checkedRows, setCheckedRows] = useState<Record<number, boolean>>({});

  const [userInputs, setUserInputs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    EXACT_SHEET_ROWS.forEach(r => { init[String(r.rowNum)] = ''; });
    init['15_10'] = '';
    init['20_5'] = '';
    init['25_10'] = '';
    return init;
  });

  const parseNum = (val: string | undefined): number => {
    if (!val) return 0;
    const upper = val.trim().toUpperCase();
    let multiplier = 1;
    if (upper.endsWith('T')) multiplier = 1e12;
    else if (upper.endsWith('B')) multiplier = 1e9;
    else if (upper.endsWith('M')) multiplier = 1e6;
    else if (upper.endsWith('K')) multiplier = 1e3;
    
    const clean = val.replace(/[^0-9.-]/g, '');
    const base = parseFloat(clean) || 0;
    return base * multiplier;
  };

  const formatLargeNum = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num) || num === 0) return '';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return num.toLocaleString('en-US');
  };

  const updateStockRowDetails = (sym: string) => {
    const cleanSym = sym.toUpperCase().trim();
    if (!cleanSym) return;

    // Search directly in main INTERACTIVE TABLE stocks array first, fallback to passed stock prop or popular DB
    const found = stocks.find(s => s.ticker.toUpperCase() === cleanSym) || (stock?.ticker?.toUpperCase() === cleanSym ? stock : undefined);
    const dbStock = POPULAR_STOCKS_DB[cleanSym];

    const compName = found?.companyName || dbStock?.companyName || `${cleanSym} Corp.`;
    const sectorName = getSectorForStock(cleanSym, found?.sector || dbStock?.sector, compName);
    const indName = found?.industry || dbStock?.industry || `${sectorName} Products & Services`;
    
    // 1. Current Price (Direct from INTERACTIVE TABLE, stock prop, or DB)
    const currentPrice = found?.currentPrice || (stock?.ticker?.toUpperCase() === cleanSym ? stock?.currentPrice : 0) || dbStock?.price || 0;
    
    // 2. 52-week Low / High (Direct from INTERACTIVE TABLE, stock prop, or DB)
    const low52Val = found?.low52 || (stock?.ticker?.toUpperCase() === cleanSym ? stock?.low52 : 0) || dbStock?.low52 || (currentPrice ? currentPrice * 0.75 : 0);
    const high52Val = found?.high52 || (stock?.ticker?.toUpperCase() === cleanSym ? stock?.high52 : 0) || dbStock?.high52 || (currentPrice ? currentPrice * 1.35 : 0);
    let low52High52 = '';
    if (low52Val > 0 && high52Val > 0) {
      low52High52 = `${low52Val.toFixed(2)} / ${high52Val.toFixed(2)}`;
    }

    // 3. Market Cap (Direct from INTERACTIVE TABLE format)
    const mcapRaw = found?.marketCap || (stock?.ticker?.toUpperCase() === cleanSym ? stock?.marketCap : 0) || dbStock?.marketCap || 0;
    const mcapDisplay = mcapRaw > 0 ? formatLargeNum(mcapRaw) : '';

    // 4. P/E Ratio & EPS (Direct from INTERACTIVE TABLE)
    let peVal = (found?.peRatio !== undefined && found?.peRatio !== null && found.peRatio > 0) 
      ? found.peRatio 
      : ((stock?.ticker?.toUpperCase() === cleanSym && stock?.peRatio) ? stock.peRatio : (dbStock?.pe || 0));
    const epsVal = (found?.eps !== undefined && found?.eps !== null && found.eps > 0) 
      ? found.eps 
      : ((stock?.ticker?.toUpperCase() === cleanSym && stock?.eps) ? stock.eps : 0);

    if (peVal === 0 && currentPrice > 0 && epsVal > 0) {
      peVal = currentPrice / epsVal;
    }
    const peDisplay = peVal > 0 ? peVal.toFixed(2) : '';

    // 5. Shares Outstanding (Calculated from INTERACTIVE TABLE Market Cap / Price)
    let sharesRaw = dbStock?.shares || 0;
    if (!sharesRaw && mcapRaw > 0 && currentPrice > 0) {
      sharesRaw = mcapRaw / currentPrice;
    }
    const sharesDisplay = sharesRaw > 0 ? formatLargeNum(sharesRaw) : '';

    // 6. Financials
    const revRaw = dbStock?.revenue || 0;
    const netIncRaw = dbStock?.netIncome || 0;
    const fcfRaw = dbStock?.fcf || 0;

    setUserInputs(prev => ({
      ...prev,
      '1': compName,
      '2': cleanSym,
      '3': indName,
      '4': sectorName,
      '7': currentPrice > 0 ? currentPrice.toFixed(2) : (prev['7'] || ''),
      '8': low52High52 || (prev['8'] || ''),
      '9': mcapDisplay || (prev['9'] || ''),
      '10': peDisplay || (prev['10'] || ''),
      '12': found?.dividend ? String(found.dividend) : (prev['12'] || ''),
      '18': prev['18'] || '',
      '19': prev['19'] || '',
      '24': epsVal > 0 ? epsVal.toFixed(2) : (prev['24'] || ''),
      '26': prev['26'] || '',
      '38': prev['38'] || '',
      '39': prev['39'] || '',
    }));

    // Auto check filled rows for selected ticker
    const initialChecked: Record<number, boolean> = {};
    [1, 2, 3, 4, 7, 8, 9, 10].forEach(r => { initialChecked[r] = true; });
    if (epsVal > 0) initialChecked[24] = true;
    setCheckedRows(prev => ({ ...prev, ...initialChecked }));
  };

  useEffect(() => {
    if (isOpen) {
      const activeSym = stock?.ticker || selectedTicker;
      if (activeSym) {
        const clean = activeSym.toUpperCase().trim();
        setSelectedTicker(clean);
        updateStockRowDetails(clean);
      }
    }
  }, [isOpen, stock, stocks]);

  const handleSelectTicker = (sym: string) => {
    setSelectedTicker(sym);
    updateStockRowDetails(sym);
  };

  const handleInputChange = (key: string | number, val: string) => {
    const strKey = String(key);
    setUserInputs(prev => ({ ...prev, [strKey]: val }));

    const numKey = typeof key === 'number' ? key : parseInt(key, 10);
    if (!isNaN(numKey) && val.trim() !== '') {
      setCheckedRows(prev => ({ ...prev, [numKey]: true }));
    }

    if (strKey === '2' && val.trim().length >= 1) {
      const cleanSym = val.toUpperCase().trim();
      setSelectedTicker(cleanSym);
      updateStockRowDetails(cleanSym);
    }
  };

  const handleToggleCheck = (rowNum: number) => {
    setCheckedRows(prev => ({ ...prev, [rowNum]: !prev[rowNum] }));
  };

  const handleClearAll = () => {
    setSelectedTicker('');
    const cleared: Record<string, string> = {};
    EXACT_SHEET_ROWS.forEach(r => { cleared[String(r.rowNum)] = ''; });
    cleared['15_10'] = '';
    cleared['20_5'] = '';
    cleared['25_10'] = '';
    cleared['39_10'] = '';
    setUserInputs(cleared);
    setCheckedRows({});
  };

  const handleAutoCheckGreen = () => {
    const newChecked = { ...checkedRows };
    EXACT_SHEET_ROWS.forEach(row => {
      const displayVal = computedValues[String(row.rowNum)] || userInputs[String(row.rowNum)];
      if (displayVal && (displayVal.includes('🟢') || displayVal.includes('GREEN'))) {
        newChecked[row.rowNum] = true;
      }
    });
    setCheckedRows(newChecked);
  };

  // Save / Sync audited company data to main Interactive Table
  const handleSaveToMainTable = () => {
    const cleanSym = (selectedTicker || userInputs['2'] || '').toUpperCase().trim();
    if (!cleanSym) {
      alert('Моля, изберете или въведете тикер на компания първо!');
      return;
    }

    const compName = userInputs['1'] || `${cleanSym} Corp.`;
    const sectorName = userInputs['4'] || 'Technology';
    const price = parseNum(userInputs['7']);
    const pe = parseNum(userInputs['10']);
    const divYield = parseNum(userInputs['12']);
    const mcap = parseNum(userInputs['9']);

    if (onSaveToTable) {
      onSaveToTable({
        ticker: cleanSym,
        companyName: compName,
        sector: sectorName,
        currentPrice: price > 0 ? price : 100,
        peRatio: pe > 0 ? pe : 15,
        dividendYield: divYield > 0 ? divYield : 0,
        marketCap: mcap > 0 ? mcap : 1000000000
      });
    }

    setSavedSuccessMsg(`Акцията ${cleanSym} е пресметната и запазена в Интерактивната Таблица!`);
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  // Dynamic Computed Formulas
  const computedValues = useMemo(() => {
    const rev = parseNum(userInputs['19']);
    const netInc = parseNum(userInputs['26']);
    const fcf = parseNum(userInputs['38']);
    const cffo = parseNum(userInputs['36']);
    const price = parseNum(userInputs['7']);
    const mcap = parseNum(userInputs['9']);
    const shares = parseNum(userInputs['18']);
    const deRatio = parseNum(userInputs['35']);

    let epsCalc = parseNum(userInputs['24']);
    if (shares > 0 && netInc !== 0) {
      epsCalc = netInc / shares;
    }

    const calculated: Record<string, string> = {};

    if (shares > 0 && netInc !== 0) calculated['24'] = epsCalc.toFixed(2);
    if (rev > 0 && netInc !== 0) calculated['27'] = `${((netInc / rev) * 100).toFixed(2)}%`;
    if (rev > 0 && cffo > 0) calculated['40'] = `${((cffo / rev) * 100).toFixed(2)}%`;
    if (rev > 0 && fcf > 0) calculated['41'] = `${((fcf / rev) * 100).toFixed(2)}%`;
    if (mcap > 0 && fcf > 0) calculated['42'] = `${((fcf / mcap) * 100).toFixed(2)}%`;
    if (price > 0 && epsCalc > 0) calculated['43'] = `${((epsCalc / price) * 100).toFixed(2)}%`;
    if (netInc !== 0 && fcf > 0) calculated['44'] = `${((fcf / netInc) * 100).toFixed(2)}%`;

    // Dynamic Flags Rows (#49 to #64)
    const grossMarginVal = parseNum(userInputs['21']);
    if (userInputs['21'] && userInputs['21'].trim() !== '') {
      calculated['49'] = grossMarginVal >= 40 ? `🟢 GREEN (${grossMarginVal}%)` : grossMarginVal >= 30 ? `🟡 YELLOW (${grossMarginVal}%)` : `🔴 RED (${grossMarginVal}%)`;
    }

    const revGrowthVal3 = parseNum(userInputs['20']);
    const revGrowthVal5 = parseNum(userInputs['20_5']);
    const activeRevGrowth = revGrowthVal3 || revGrowthVal5;
    if (activeRevGrowth > 0) {
      calculated['50'] = activeRevGrowth >= 15 ? `🟢 GREEN (${activeRevGrowth}%)` : activeRevGrowth >= 10 ? `🟡 YELLOW (${activeRevGrowth}%)` : `🔴 RED (${activeRevGrowth}%)`;
    }

    const netMarginVal = parseNum(userInputs['27']);
    if (userInputs['27'] && userInputs['27'].trim() !== '') {
      calculated['52'] = netMarginVal >= 17 ? `🟢 GREEN (${netMarginVal}%)` : netMarginVal >= 5 ? `🟡 YELLOW (${netMarginVal}%)` : `🔴 RED (${netMarginVal}%)`;
    }

    if (userInputs['35'] && userInputs['35'].trim() !== '') {
      calculated['56'] = deRatio <= 1.0 ? `🟢 GREEN (${deRatio})` : deRatio <= 2.0 ? `🟡 YELLOW (${deRatio})` : `🔴 RED (${deRatio})`;
    }

    return calculated;
  }, [userInputs]);

  const getMetricFlagType = (rowNum: number, valStr: string): 'green' | 'yellow' | 'red' | null => {
    if (!valStr || valStr.trim() === '') return null;
    const numVal = parseNum(valStr);
    if (isNaN(numVal)) return null;

    switch (rowNum) {
      case 10: // P/E Ratio
        if (numVal <= 15) return 'green';
        if (numVal <= 25) return 'yellow';
        return 'red';
      case 21: // Gross Profit Margin
        if (numVal >= 40) return 'green';
        if (numVal >= 30) return 'yellow';
        return 'red';
      case 22: // R&D Ratio
      case 23: // SG&A Ratio
        if (numVal <= 30) return 'green';
        if (numVal <= 40) return 'yellow';
        return 'red';
      case 27: // Net Profit Margin
        if (numVal >= 20) return 'green';
        if (numVal >= 10) return 'yellow';
        return 'red';
      case 28: // ROE
      case 30: // ROIC
        if (numVal >= 15) return 'green';
        if (numVal >= 5) return 'yellow';
        return 'red';
      case 29: // ROA
        if (numVal >= 5) return 'green';
        if (numVal >= 2) return 'yellow';
        return 'red';
      case 31: // Current Ratio
        if (numVal >= 1.5 && numVal <= 3.0) return 'green';
        if (numVal >= 1.0) return 'yellow';
        return 'red';
      case 35: // Debt / Equity
        if (numVal <= 1.0) return 'green';
        if (numVal <= 2.0) return 'yellow';
        return 'red';
      case 42: // FCF Yield
        if (numVal >= 5) return 'green';
        if (numVal >= 3) return 'yellow';
        return 'red';
      case 43: // Earnings Yield
        if (numVal >= 7) return 'green';
        if (numVal >= 4) return 'yellow';
        return 'red';
      case 44: // FCF / Net Income
        if (numVal >= 100) return 'green';
        if (numVal >= 70) return 'yellow';
        return 'red';
      case 45: // Cash Flow Coverage Ratio
        if (numVal >= 1.0) return 'green';
        if (numVal >= 0.5) return 'yellow';
        return 'red';
      case 48: // EBITDA Margin
        if (numVal >= 20) return 'green';
        if (numVal >= 10) return 'yellow';
        return 'red';
      case 49: // Interest Coverage Rate
        if (numVal >= 5) return 'green';
        if (numVal >= 2) return 'yellow';
        return 'red';
      case 50: // Goodwill in Assets
        if (numVal <= 10) return 'green';
        if (numVal <= 20) return 'yellow';
        return 'red';
      case 51: // Asset Turnover Ratio
        if (numVal >= 3.0) return 'green';
        if (numVal >= 1.0) return 'yellow';
        return 'red';
      case 52: // Quick Ratio
        if (numVal >= 1.0) return 'green';
        if (numVal >= 0.8) return 'yellow';
        return 'red';
      case 53: // Stock-based Compensation as % of Net Income
        if (numVal <= 5) return 'green';
        if (numVal <= 10) return 'yellow';
        return 'red';
      case 54: // CapEx as % of Net Income
        if (numVal <= 15) return 'green';
        if (numVal <= 25) return 'yellow';
        return 'red';
      default:
        return null;
    }
  };

  // Live Score Calculator
  const flagsSummary = useMemo(() => {
    let green = 0, yellow = 0, red = 0;
    EXACT_SHEET_ROWS.forEach(row => {
      const displayVal = computedValues[String(row.rowNum)] !== undefined 
        ? computedValues[String(row.rowNum)] 
        : (userInputs[String(row.rowNum)] || '');
      const flag = getMetricFlagType(row.rowNum, displayVal);
      if (flag === 'green') green++;
      else if (flag === 'yellow') yellow++;
      else if (flag === 'red') red++;
    });
    return { green, yellow, red };
  }, [userInputs, computedValues]);

  // Total checked progress calculation
  const totalAudited = useMemo(() => {
    return Object.values(checkedRows).filter(Boolean).length;
  }, [checkedRows]);

  const totalCheckableRows = useMemo(() => {
    return EXACT_SHEET_ROWS.filter(r => !r.label.startsWith('---')).length;
  }, []);

  const progressPercent = Math.round((totalAudited / totalCheckableRows) * 100);

  if (!isOpen) return null;

  // Helper to render dynamic status badge (Green, Yellow, Red Signals)
  const renderStatusBadge = (rowNum: number, valStr: string) => {
    const flagType = getMetricFlagType(rowNum, valStr);
    if (!flagType) return null;

    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 border flex items-center gap-1 ${
        flagType === 'green' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
        flagType === 'yellow' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
        'bg-rose-500/15 text-rose-400 border-rose-500/30'
      }`}>
        {flagType === 'green' ? '🟢 Зелен' : flagType === 'yellow' ? '🟡 Жълт' : '🔴 Червен'}
      </span>
    );
  };

  // Helper to render interactive checklist table row
  const renderRowItem = (rowNum: number) => {
    const row = EXACT_SHEET_ROWS.find(r => r.rowNum === rowNum);
    if (!row) return null;

    const isSelected = selectedRow === rowNum;
    const isChecked = !!checkedRows[rowNum];
    const rawUserVal = userInputs[String(rowNum)];
    const displayVal = computedValues[String(rowNum)] !== undefined 
      ? computedValues[String(rowNum)] 
      : (rawUserVal !== undefined ? rawUserVal : '');

    const isReadOnlyCell = row.cellType === 'green-formula' || row.cellType.startsWith('flag-') || [24, 27, 40, 41, 42, 43, 44].includes(row.rowNum);

    return (
      <tr
        key={rowNum}
        onClick={(e) => {
          if (
            (e.target as HTMLElement).tagName !== 'BUTTON' && 
            (e.target as HTMLElement).tagName !== 'A' && 
            (e.target as HTMLElement).tagName !== 'INPUT'
          ) {
            setSelectedRow(rowNum);
          }
        }}
        className={`transition-all duration-150 group cursor-pointer border-b border-border/40 ${
          isSelected 
            ? 'bg-indigo-500/20 text-ink ring-2 ring-indigo-500/50 shadow-md font-bold' 
            : (isChecked ? 'bg-emerald-500/5 dark:bg-emerald-950/20' : 'hover:bg-indigo-500/10')
        }`}
      >
        {/* Row Number */}
        <td className="py-2.5 px-3 text-center w-12 font-mono text-xs font-bold border-r border-border/40">
          <span className={isSelected ? "text-indigo-400 font-extrabold" : "text-ink-faint"}>
            {row.rowNum}
          </span>
        </td>

        {/* Checkbox Cell */}
        <td className="py-2.5 px-3 text-center w-10 border-r border-border/40">
          <button
            type="button"
            onClick={() => handleToggleCheck(rowNum)}
            className="p-1 text-ink-muted hover:text-emerald-400 cursor-pointer transition-transform active:scale-90"
            title={isChecked ? "Маркиран като прегледан" : "Маркирай като прегледан"}
          >
            {isChecked ? (
              <CheckSquare className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
            ) : (
              <Square className="w-4 h-4 text-ink-faint hover:text-ink" />
            )}
          </button>
        </td>

        {/* Metric Label & Dynamic Signal Badge */}
        <td className="py-2.5 px-4 border-r border-border/40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${isChecked ? 'text-emerald-400' : 'text-ink'}`}>
                {row.label}
              </span>
              {isReadOnlyCell && (
                <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" title="Автоматично изчислено" />
              )}
            </div>
            {renderStatusBadge(rowNum, displayVal)}
          </div>
        </td>

        {/* Value Box / Split Inputs */}
        <td className="py-2 px-4 border-r border-border/40">
          {rowNum === 15 ? (
            <div className="flex items-center gap-2 justify-end">
              <div className="flex items-center gap-1 bg-bg border border-border rounded-lg px-2.5 py-1.5 h-8">
                <span className="text-xs text-ink-faint font-bold">5y:</span>
                <input
                  type="text"
                  value={userInputs['15'] || ''}
                  onChange={e => handleInputChange('15', e.target.value)}
                  placeholder="..."
                  className="w-16 bg-transparent text-xs font-mono font-bold outline-none text-ink text-right"
                />
              </div>
              <div className="flex items-center gap-1 bg-bg border border-border rounded-lg px-2.5 py-1.5 h-8">
                <span className="text-xs text-ink-faint font-bold">10y:</span>
                <input
                  type="text"
                  value={userInputs['15_10'] || ''}
                  onChange={e => handleInputChange('15_10', e.target.value)}
                  placeholder="..."
                  className="w-16 bg-transparent text-xs font-mono font-bold outline-none text-ink text-right"
                />
              </div>
            </div>
          ) : rowNum === 20 ? (
            <div className="flex items-center gap-2 justify-end">
              <div className="flex items-center gap-1 bg-bg border border-border rounded-lg px-2.5 py-1.5 h-8">
                <span className="text-xs text-ink-faint font-bold">3y:</span>
                <input
                  type="text"
                  value={userInputs['20'] || ''}
                  onChange={e => handleInputChange('20', e.target.value)}
                  placeholder="..."
                  className="w-16 bg-transparent text-xs font-mono font-bold outline-none text-ink text-right"
                />
              </div>
              <div className="flex items-center gap-1 bg-bg border border-border rounded-lg px-2.5 py-1.5 h-8">
                <span className="text-xs text-ink-faint font-bold">5y:</span>
                <input
                  type="text"
                  value={userInputs['20_5'] || ''}
                  onChange={e => handleInputChange('20_5', e.target.value)}
                  placeholder="..."
                  className="w-16 bg-transparent text-xs font-mono font-bold outline-none text-ink text-right"
                />
              </div>
            </div>
          ) : (rowNum === 25 || rowNum === 39) ? (
            <div className="flex items-center gap-2 justify-end">
              <div className="flex items-center gap-1 bg-bg border border-border rounded-lg px-2.5 py-1.5 h-8">
                <span className="text-xs text-ink-faint font-bold">5y:</span>
                <input
                  type="text"
                  value={userInputs[String(rowNum)] || ''}
                  onChange={e => handleInputChange(rowNum, e.target.value)}
                  placeholder="..."
                  className="w-16 bg-transparent text-xs font-mono font-bold outline-none text-ink text-right"
                />
              </div>
              <div className="flex items-center gap-1 bg-bg border border-border rounded-lg px-2.5 py-1.5 h-8">
                <span className="text-xs text-ink-faint font-bold">10y:</span>
                <input
                  type="text"
                  value={userInputs[`${rowNum}_10`] || ''}
                  onChange={e => handleInputChange(`${rowNum}_10`, e.target.value)}
                  placeholder="..."
                  className="w-16 bg-transparent text-xs font-mono font-bold outline-none text-ink text-right"
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <input
                type="text"
                value={displayVal}
                readOnly={isReadOnlyCell}
                disabled={isReadOnlyCell}
                placeholder={isReadOnlyCell ? "🔒 Изчислено" : "Попълнете..."}
                onChange={e => handleInputChange(rowNum, e.target.value)}
                className={`w-48 h-8 px-3 py-1.5 rounded-lg border font-mono font-bold text-xs outline-none text-right transition-all ${
                  isReadOnlyCell
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 cursor-not-allowed'
                    : 'bg-bg border-border focus:border-indigo-500 text-ink'
                }`}
              />
            </div>
          )}
        </td>

        {/* Info Formula Button Cell */}
        <td className="py-2 px-2 text-center w-10">
          {(row.note || row.formulaStr || row.flagRules) ? (
            <button
              type="button"
              onClick={() => setActiveInfoModalRow(row)}
              className="p-0.5 rounded-md hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer inline-flex items-center justify-center"
              title="Формула & правила за оцветяване"
            >
              <Info className="w-3 h-3" />
            </button>
          ) : (
            <span className="opacity-20 text-[10px]">-</span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="fixed inset-0 z-[999999] w-screen h-screen bg-bg flex flex-col font-sans text-ink overflow-hidden animate-in fade-in duration-150" onClick={e => e.stopPropagation()}>
      
      {/* Clean App Header Bar */}
      <div className="bg-bg-card border-b border-border px-6 py-3 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-base text-ink tracking-tight flex items-center gap-2">
              Stock Valuation Checklist Table
            </h2>
            <p className="text-xs text-ink-muted">Инструмент за финансова оценка на отделни компании преди добавяне към Платформата</p>
          </div>
        </div>

        {/* Top Controls & Live Signals Counter Badge */}
        <div className="flex items-center gap-3">
          {/* Live Signals Counter Badge in Top Right */}
          <div className="flex items-center gap-2 bg-bg px-3 py-1.5 rounded-xl border border-border/80 shadow-xs" title="Брой червени, жълти и зелени сигнали за компанията">
            <span className="text-[11px] font-black text-ink-muted uppercase tracking-wider">Сигнали:</span>
            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
              🟢 {flagsSummary.green}
            </span>
            <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
              🟡 {flagsSummary.yellow}
            </span>
            <span className="text-xs font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 flex items-center gap-1">
              🔴 {flagsSummary.red}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-bg px-3 py-1.5 rounded-xl border border-border">
            <label className="text-xs font-bold text-ink-faint uppercase">Актив:</label>
            <select
              value={selectedTicker}
              onChange={e => handleSelectTicker(e.target.value)}
              className="bg-transparent text-ink font-mono font-bold text-xs outline-none cursor-pointer"
            >
              <option value="" className="bg-bg-card text-ink">-- Изберете Актив --</option>
              {stocks.map(s => (
                <option key={s.ticker} value={s.ticker} className="bg-bg-card text-ink">{s.ticker} - {s.companyName}</option>
              ))}
              {Object.keys(POPULAR_STOCKS_DB).map(tk => (
                !stocks.some(s => s.ticker.toUpperCase() === tk) && (
                  <option key={tk} value={tk} className="bg-bg-card text-ink">{tk} - {POPULAR_STOCKS_DB[tk].companyName}</option>
                )
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveToMainTable}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            title="Запази пресметнатата акция в Интерактивната Таблица на платформата"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            ➕ Добави към Таблицата
          </button>

          <button
            onClick={() => {
              window.open(window.location.origin + window.location.pathname + '#checklist', '_blank');
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-xs border border-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Отвори в нов прозорец"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            🗔 Нов прозорец
          </button>

          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Изчисти данните"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Изчисти
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-border transition-colors text-ink-muted hover:text-ink cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {savedSuccessMsg && (
        <div className="bg-emerald-500 text-white px-6 py-2 flex items-center justify-between text-xs font-bold shadow-md animate-in slide-in-from-top duration-200">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            {savedSuccessMsg}
          </span>
          <button onClick={() => setSavedSuccessMsg(null)} className="opacity-80 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Progress & Quick Actions Bar */}
      <div className="bg-bg-card/60 border-b border-border/80 px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shrink-0">
        
        {/* Audit Checklist Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-ink">Анализ на Компанията</span>
          {selectedTicker && (
            <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {selectedTicker.toUpperCase()}
            </span>
          )}
          {selectedRow && (
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center gap-1 animate-in fade-in duration-150">
              📍 Селектиран ред #{selectedRow}: {EXACT_SHEET_ROWS.find(r => r.rowNum === selectedRow)?.label}
            </span>
          )}
        </div>

        {/* Live Audit Checklist Progress & Signals Summary */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 bg-bg px-2.5 py-1 rounded-lg border border-border text-xs font-mono" title="Реално време сигнали за избраната компания">
            <span className="text-emerald-400 font-extrabold flex items-center gap-1">🟢 {flagsSummary.green}</span>
            <span className="text-amber-400 font-extrabold flex items-center gap-1">🟡 {flagsSummary.yellow}</span>
            <span className="text-rose-400 font-extrabold flex items-center gap-1">🔴 {flagsSummary.red}</span>
          </div>

          <button
            onClick={handleAutoCheckGreen}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/20 flex items-center gap-1 transition-all cursor-pointer"
            title="Автоматично отметни всички зелени показатели"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Отметни зелени
          </button>

          <div className="flex items-center gap-2 bg-bg px-3 py-1 rounded-lg border border-border">
            <span className="text-xs font-bold text-ink-muted">Прогрес:</span>
            <div className="w-24 bg-border/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono font-bold text-xs text-emerald-400">{progressPercent}%</span>
            <span className="text-[11px] text-ink-faint">({totalAudited}/{totalCheckableRows})</span>
          </div>

          <div className="flex items-center gap-2 font-mono font-bold text-xs">
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">🟢 {flagsSummary.green}</span>
            <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">🟡 {flagsSummary.yellow}</span>
            <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">🔴 {flagsSummary.red}</span>
          </div>
        </div>
      </div>

      {/* Main Checklist Table */}
      <div className="flex-1 overflow-auto p-6 bg-bg">
        <div className="max-w-6xl mx-auto bg-bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-border/40 text-ink-muted text-xs font-bold uppercase tracking-wider border-b border-border">
                <th className="py-3 px-3 text-center w-12 border-r border-border/40">#</th>
                <th className="py-3 px-3 text-center w-10 border-r border-border/40">✓</th>
                <th className="py-3 px-4 border-r border-border/40">Показател (Financial Metric)</th>
                <th className="py-3 px-4 text-right border-r border-border/40">Стойност (Value / Input)</th>
                <th className="py-3 px-2 text-center w-12">Инфо</th>
              </tr>
            </thead>
            <tbody>
              {/* SECTION 1 */}
              <tr className="bg-indigo-500/10 border-y border-indigo-500/20">
                <td colSpan={5} className="py-2 px-4 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                  🏢 1. ИНФОРМАЦИЯ ЗА КОМПАНИЯТА (COMPANY OVERVIEW)
                </td>
              </tr>
              {[1, 2, 3, 4, 7, 8, 9].map(r => renderRowItem(r))}

              {/* SECTION 2 */}
              <tr className="bg-indigo-500/10 border-y border-indigo-500/20">
                <td colSpan={5} className="py-2 px-4 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                  📊 2. ФИНАНСОВИ КОЕФИЦИЕНТИ & ОЦЕНКА (VALUATION METRICS)
                </td>
              </tr>
              {[10, 11, 12, 13, 14, 15, 16, 17, 18].map(r => renderRowItem(r))}

              {/* SECTION 3 */}
              <tr className="bg-indigo-500/10 border-y border-indigo-500/20">
                <td colSpan={5} className="py-2 px-4 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                  📈 3. ПРИХОДИ, МАРЖОВЕ & ПЕЧАЛБА (INCOME STATEMENT & MARGINS)
                </td>
              </tr>
              {[19, 20, 21, 22, 23, 24, 25, 26, 27].map(r => renderRowItem(r))}

              {/* SECTION 4 */}
              <tr className="bg-indigo-500/10 border-y border-indigo-500/20">
                <td colSpan={5} className="py-2 px-4 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                  ⚖️ 4. БАЛАНСОВ ОТЧЕТ & ЗАДЪЛЖЕНИЯ (BALANCE SHEET & SOLVENCY)
                </td>
              </tr>
              {[28, 29, 30, 31, 32, 33, 34, 35].map(r => renderRowItem(r))}

              {/* SECTION 5 */}
              <tr className="bg-indigo-500/10 border-y border-indigo-500/20">
                <td colSpan={5} className="py-2 px-4 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                  💵 5. ПАРИЧНИ ПОТОЦИ (CASH FLOW ANALYSIS)
                </td>
              </tr>
              {[36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47].map(r => renderRowItem(r))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Popover Modal for (i) Button */}
      {activeInfoModalRow && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150" onClick={() => setActiveInfoModalRow(null)}>
          <div className="relative w-full max-w-md bg-bg-card border border-border/80 rounded-2xl shadow-2xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-ink">{activeInfoModalRow.label}</h3>
              </div>
              <button onClick={() => setActiveInfoModalRow(null)} className="p-1 text-ink-faint hover:text-ink cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formula */}
            {activeInfoModalRow.formulaStr && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-ink-faint tracking-wider">📐 Точна Формула:</span>
                <div className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  {activeInfoModalRow.formulaStr}
                </div>
              </div>
            )}

            {/* Flag Rules */}
            {activeInfoModalRow.flagRules && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-ink-faint tracking-wider">🚦 Граници за оцветяване:</span>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs font-bold text-center">
                  <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl border border-emerald-500/20">
                    🟢 {activeInfoModalRow.flagRules.green}
                  </div>
                  <div className="bg-amber-500/10 text-amber-400 p-2 rounded-xl border border-amber-500/20">
                    🟡 {activeInfoModalRow.flagRules.yellow}
                  </div>
                  <div className="bg-rose-500/10 text-rose-400 p-2 rounded-xl border border-rose-500/20">
                    🔴 {activeInfoModalRow.flagRules.red}
                  </div>
                </div>
              </div>
            )}

            {/* Note */}
            {activeInfoModalRow.note && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-ink-faint tracking-wider">💡 Бележка & Разяснения:</span>
                <p className="text-xs text-ink-muted leading-relaxed bg-bg/50 p-3 rounded-xl border border-border/30 whitespace-pre-line">
                  {activeInfoModalRow.note}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveInfoModalRow(null)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Разбрах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
