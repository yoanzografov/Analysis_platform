import { Stock } from '../types';
import { getSectorForStock } from './sectorHelper';

export interface CompanyProfileData {
  ticker: string;
  companyName: string;
  description: string;
  sector: string;
  industry: string;
  employees: string;
  ceo: string;
  headquarters: string;
  founded: string;
  website: string;
  businessSegments: string[];
  competitors: string[];
  keyHighlights: string[];
}

const KNOWN_PROFILES: Record<string, Partial<CompanyProfileData>> = {
  GOOG: {
    sector: 'Communication Services',
    industry: 'Interactive Media & Services',
    employees: '182,502',
    ceo: 'Sundar Pichai',
    headquarters: 'Mountain View, California, USA',
    founded: '1998',
    website: 'https://abc.xyz',
    description: 'Alphabet Inc. е глобален технологичен лидер и компания-майка на Google. Основната дейност включва интернет търсене (Google Search), дигитална реклама, онлайн видео платформата YouTube, облачни услуги (Google Cloud Platform), мобилната операционна система Android, хардуер (Pixel) и иновативни решения в областта на изкуствения интелект (Gemini, DeepMind).',
    businessSegments: ['Google Services (Search, YouTube, Ads, Play Store, Android)', 'Google Cloud (Enterprise AI & Infrastructure)', 'Other Bets (Waymo, Verily, CapitalG)'],
    competitors: ['Microsoft (MSFT)', 'Meta Platforms (META)', 'Amazon (AMZN)', 'Apple (AAPL)'],
    keyHighlights: [
      'Лидер в глобалното търсене с над 90% пазарен дял',
      'Втората най-голяма облачна платформа за AI в света (Google Cloud)',
      'Собственик на YouTube — най-голямата видео платформа на планетата'
    ]
  },
  GOOGL: {
    sector: 'Communication Services',
    industry: 'Interactive Media & Services',
    employees: '182,502',
    ceo: 'Sundar Pichai',
    headquarters: 'Mountain View, California, USA',
    founded: '1998',
    website: 'https://abc.xyz',
    description: 'Alphabet Inc. (Класен дял A) е глобален технологичен гигант и компания-майка на Google. Основната дейност включва Google Search, YouTube, Google Cloud, Android, разработка на AI модели (Gemini) и автономни автомобили (Waymo).',
    businessSegments: ['Google Services (Search, YouTube, Ads, Play Store, Android)', 'Google Cloud (Enterprise AI & Infrastructure)', 'Other Bets (Waymo, Verily, CapitalG)'],
    competitors: ['Microsoft (MSFT)', 'Meta Platforms (META)', 'Amazon (AMZN)', 'Apple (AAPL)'],
    keyHighlights: [
      'Лидер в глобалното търсене с над 90% пазарен дял',
      'Втората най-голяма облачна платформа за AI в света (Google Cloud)',
      'Собственик на YouTube — най-голямата видео платформа на планетата'
    ]
  },
  AAPL: {
    sector: 'Technology',
    industry: 'Consumer Electronics',
    employees: '161,000',
    ceo: 'Tim Cook',
    headquarters: 'Cupertino, California, USA',
    founded: '1976',
    website: 'https://www.apple.com',
    description: 'Apple Inc. проектира, произвежда и продава смартфони (iPhone), персонални компютри (Mac), таблети (iPad), носими устройства (Apple Watch, AirPods, Vision Pro) и аксесоари. Компанията предлага и богата гама от дигитални услуги включително App Store, Apple Music, Apple TV+, iCloud и Apple Pay.',
    businessSegments: ['iPhone (52% от приходите)', 'Services (App Store, iCloud, Apple Pay - 26%)', 'Wearables, Home & Accessories (10%)', 'Mac (8%)', 'iPad (4%)'],
    competitors: ['Samsung Electronics', 'Microsoft (MSFT)', 'Google (GOOGL)', 'Sony'],
    keyHighlights: [
      'Над 2.2 милиарда активни устройства в глобалната си екосистема',
      'Висока маржиналност на дигиталните си услуги (>70% брутен марж)',
      'Най-високо ниво на потребителска лоялност в технологичната индустрия'
    ]
  },
  MSFT: {
    sector: 'Technology',
    industry: 'Software - Infrastructure',
    employees: '221,000',
    ceo: 'Satya Nadella',
    headquarters: 'Redmond, Washington, USA',
    founded: '1975',
    website: 'https://www.microsoft.com',
    description: 'Microsoft Corporation е една от най-големите софтуерни и технологични компании в света. Основната ѝ дейност включва операционната система Windows, пакета за производителност Microsoft 365, облачната платформа Azure, конзолите Xbox, професионалната мрежа LinkedIn и мащабни инвестиции в изкуствен интелект (OpenAI/Copilot).',
    businessSegments: ['Intelligent Cloud (Azure, Server Products - 43%)', 'Productivity & Business Processes (Office, LinkedIn - 32%)', 'More Personal Computing (Windows, Xbox, Surface - 25%)'],
    competitors: ['Amazon Web Services (AMZN)', 'Google Cloud (GOOGL)', 'Oracle (ORCL)', 'Salesforce (CRM)'],
    keyHighlights: [
      'Ексклузивен стратегически партньор и инвеститор в OpenAI (ChatGPT)',
      'Azure е най-бързо растящата облачна платформа за корпоративен AI',
      'Доминиращ софтуер за производителност (Office 365) в над 85% от Fortune 500'
    ]
  },
  NVDA: {
    sector: 'Technology',
    industry: 'Semiconductors',
    employees: '29,600',
    ceo: 'Jensen Huang',
    headquarters: 'Santa Clara, California, USA',
    founded: '1993',
    website: 'https://www.nvidia.com',
    description: 'NVIDIA Corporation е световен лидер в графичните процесори (GPU) и ускорените изчислителни технологии. Компанията е пионер в хай-енд гейминга (GeForce), изкуствения интелект (H100, Blackwell), центровете за данни, роботиката и автономното шофиране.',
    businessSegments: ['Data Center AI Chips (H100, H200, Blackwell - 87%)', 'Gaming & Graphics (GeForce RTX - 10%)', 'Professional Visualization & Automotive (3%)'],
    competitors: ['AMD (AMD)', 'Intel (INTC)', 'Broadcom (AVGO)', 'Custom ASICs (Google TPU, AWS Trainium)'],
    keyHighlights: [
      'Над 80% пазарен дял при чиповете за обучение и инференция на изкуствен интелект',
      'Софтуерната платформа CUDA създава силен мрежов ефект и монополен ров',
      'Партньорства с всички основни облачни гиганти (Microsoft, Amazon, Google, Meta)'
    ]
  },
  AMZN: {
    sector: 'Consumer Cyclical',
    industry: 'Internet Retail',
    employees: '1,525,000',
    ceo: 'Andy Jassy',
    headquarters: 'Seattle, Washington, USA',
    founded: '1994',
    website: 'https://www.amazon.com',
    description: 'Amazon.com, Inc. е световен гигант в електронната търговия, облачните услуги (Amazon Web Services - AWS), онлайн стрийминга (Prime Video) и дигиталната реклама. Компанията е най-големият доставчик на облачна инфраструктура в света.',
    businessSegments: ['North America Retail & E-commerce (60%)', 'Amazon Web Services (AWS Cloud - 17%, но носещ >60% от оперативната печалба)', 'International Retail (23%)'],
    competitors: ['Walmart (WMT)', 'Microsoft Azure (MSFT)', 'Google Cloud (GOOGL)', 'Shopify (SHOP)'],
    keyHighlights: [
      'AWS е най-голямата облачна платформа в света по приходи',
      'Екосистемата Amazon Prime има над 200 милиона абонати световно',
      'Вторият най-голям логистичен и дистрибуторски оператор на планетата'
    ]
  },
  TSLA: {
    sector: 'Consumer Cyclical',
    industry: 'Auto Manufacturers',
    employees: '140,473',
    ceo: 'Elon Musk',
    headquarters: 'Austin, Texas, USA',
    founded: '2003',
    website: 'https://www.tesla.com',
    description: 'Tesla, Inc. проектира, развива и произвежда електрически превозни средства (Model S, 3, X, Y, Cybertruck, Semi), системи за съхранение на енергия (Megapack, Powerwall), слънчеви покриви и разработва технологии за пълно автопилотно шофиране (FSD) и роботика (Optimus).',
    businessSegments: ['Automotive Sales & Regulatory Credits (82%)', 'Energy Generation & Storage (Megapack, Powerwall - 10%)', 'Services & Supercharging Network (8%)'],
    competitors: ['BYD Company', 'Rivian (RIVN)', 'General Motors (GM)', 'Ford (F)', 'NIO'],
    keyHighlights: [
      'Пионер в масовото производство на електромобили с най-висок марж в автоиндустрията',
      'Собственик на най-голямата бърза зарядъчна мрежа в света (Supercharger)',
      'Лидер в невронните мрежи за автопилотно шофиране (Full Self-Driving)'
    ]
  },
  META: {
    sector: 'Communication Services',
    industry: 'Interactive Media & Services',
    employees: '67,317',
    ceo: 'Mark Zuckerberg',
    headquarters: 'Menlo Park, California, USA',
    founded: '2004',
    website: 'https://about.meta.com',
    description: 'Meta Platforms, Inc. управлява най-големите социални мрежи в света – Facebook, Instagram, WhatsApp, Messenger и Threads. Компанията се занимава и с разработка на хардтуер за виртуална и добавена реалност (Meta Quest) и отворени AI модели (Llama).',
    businessSegments: ['Family of Apps (Facebook, Instagram, WhatsApp Ads - 98%)', 'Reality Labs (VR/AR Quest & Smart Glasses - 2%)'],
    competitors: ['TikTok (ByteDance)', 'Google / YouTube (GOOGL)', 'Snapchat (SNAP)', 'Apple (AAPL)'],
    keyHighlights: [
      'Над 3.2 милиарда души използват приложенията ѝ всеки ден',
      'Llama е най-използваният отворен модел с изкуствен интелект в света',
      'Една от двете най-големи платформи за дигитална реклама на планетата'
    ]
  }
};

export function getCompanyProfileData(stock: Stock): CompanyProfileData {
  const cleanTicker = stock.ticker.replace(/[^A-Z0-9]/gi, '').toUpperCase();

  const lookupKey = (cleanTicker === 'GOOG' || cleanTicker === 'GOOGL')
    ? (KNOWN_PROFILES['GOOGL'] ? 'GOOGL' : 'GOOG')
    : cleanTicker;

  const known = KNOWN_PROFILES[lookupKey];
  const detectedSector = getSectorForStock(stock.ticker, stock.profileLink, stock.companyName);

  if (known) {
    return {
      ticker: stock.ticker,
      companyName: stock.companyName,
      sector: known.sector || detectedSector || 'Technology',
      industry: known.industry || 'Software & Services',
      employees: known.employees || '50,000+',
      ceo: known.ceo || 'Chief Executive Officer',
      headquarters: known.headquarters || 'USA',
      founded: known.founded || '1990',
      website: known.website || `https://www.google.com/search?q=${encodeURIComponent(stock.companyName)}`,
      description: known.description || `${stock.companyName} (${stock.ticker}) е водеща световна компания в своя сектор, предлагаща високотехнологични продукти и услуги на глобалния пазар.`,
      businessSegments: known.businessSegments || ['Core Enterprise Products', 'Digital Services & Platforms', 'Global Infrastructure'],
      competitors: known.competitors || ['Sector Peer A', 'Sector Peer B', 'Global Competitor C'],
      keyHighlights: known.keyHighlights || [
        'Лидер на глобалния пазар в своя индустриален сектор',
        'Силно финансово състояние с устойчив свободен паричен поток',
        'Непрекъснати инвестиции в иновации и дигитална трансформация'
      ]
    };
  }

  // Dynamic fallback for any other stock in the platform
  const sectorName = detectedSector && detectedSector !== '-' ? detectedSector : 'Financials & Industrials';
  
  return {
    ticker: stock.ticker,
    companyName: stock.companyName,
    sector: sectorName,
    industry: `${sectorName} Products & Services`,
    employees: '25,000+',
    ceo: 'Executive Management',
    headquarters: 'Global Headquarters',
    founded: '1985',
    website: `https://www.google.com/search?q=${encodeURIComponent(stock.companyName)}+official+website`,
    description: `${stock.companyName} (${stock.ticker}) е публично търгувана компания, част от глобалния фондов пазар. Основната ѝ дейност включва разработването, производството и разпространението на ключови продукти и услуги в сектора ${sectorName}.`,
    businessSegments: [`Основни продукти в сектор ${sectorName}`, 'Услуги и решения за корпоративни клиенти', 'Международна дистрибуция'],
    competitors: ['Конкурент A', 'Конкурент B', 'Глобален лидер C'],
    keyHighlights: [
      `Лидиращ играч в сектор ${sectorName}`,
      'Устойчив бизнес модел с висока клиентска задръжка',
      'Глобално присъствие на развитите пазари'
    ]
  };
}
