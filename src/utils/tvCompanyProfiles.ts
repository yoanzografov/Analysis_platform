import { Stock } from '../types';
import { getSectorForStock } from './sectorHelper';

export interface CompanyProfileData {
  ticker: string;
  companyName: string;
  description: string;
  overviewParagraphs: string[];
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
    description: 'Alphabet Inc. е глобален технологичен лидер и компания-майка на Google.',
    overviewParagraphs: [
      '🏢 Alphabet Inc. е една от най-влиятелните технологични компании в света. Основният ѝ бизнес модел се основава на организирането на световната информация и правенето ѝ достъпна и полезна. Компанията генерира над 75% от приходите си чрез дигитална реклама през своята водеща търсачка Google Search и видео платформата YouTube.',
      '📱 Продуктите на екосистемата включват операционната система Android (използвана от над 3 милиарда активни устройства), браузъра Google Chrome, услугите Gmail, Google Maps, Google Drive и хардуерната линия Pixel. Облачната ѝ платформа Google Cloud Platform (GCP) е вторият по големина облачен доставчик на инфраструктура за изкуствен интелект и анализи на данни.',
      '🚀 Стратегията за растеж е концентрирана върху генеративния изкуствен интелект с мултимодалните AI модели Gemini, лабораторията за изследвания Google DeepMind, собствените силициеви чипове TPU (Tensor Processing Units) и автономните таксита Waymo, които вече изпълняват стотици хиляди платени курса седмично.'
    ],
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
    description: 'Alphabet Inc. (Класен дял A) е глобален технологичен гигант и компания-майка на Google.',
    overviewParagraphs: [
      '🏢 Alphabet Inc. (Класен дял A) е една от най-влиятелните технологични компании в света. Основният ѝ бизнес модел се основава на организирането на световната информация и правенето ѝ достъпна и полезна. Компанията генерира над 75% от приходите си чрез дигитална реклама през своята водеща търсачка Google Search и видео платформата YouTube.',
      '📱 Продуктите на екосистемата включват операционната система Android (използвана от над 3 милиарда активни устройства), браузъра Google Chrome, услугите Gmail, Google Maps, Google Drive и хардуерната линия Pixel. Облачната ѝ платформа Google Cloud Platform (GCP) е вторият по големина облачен доставчик на инфраструктура за изкуствен интелект и анализи на данни.',
      '🚀 Стратегията за растеж е концентрирана върху генеративния изкуствен интелект с мултимодалните AI модели Gemini, лабораторията за изследвания Google DeepMind, собствените силициеви чипове TPU (Tensor Processing Units) и автономните таксита Waymo, които вече изпълняват стотици хиляди платени курса седмично.'
    ],
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
    description: 'Apple Inc. проектира, произвежда и продава смартфони (iPhone), компютри и дигитални услуги.',
    overviewParagraphs: [
      '🏢 Apple Inc. е световен пионер в премиум потребителската електроника и вертикално интегрирания софтуер. Бизнес моделът комбинира прецизен премиум хардуер с уникална затворена екосистема от софтуер и дигитални абонаментни услуги.',
      '📱 Продуктовата линия се оглавява от флагмана iPhone (носещ над половината от приходите), последван от персоналните компютри Mac с чиповете Apple Silicon, таблетите iPad, носима електроника (Apple Watch, AirPods) и революционния пространствен компютър Vision Pro. Сегментът Services включва App Store, Apple Pay, Apple Music, iCloud и Apple TV+.',
      '🚀 Бъдещото развитие залага на Apple Intelligence — вградена AI система, фокусирана върху поверителността, разширяване на абонаментните приходи с висока маржиналност (>70%) и навлизане в здравни технологии и биометричен мониторинг.'
    ],
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
    description: 'Microsoft Corporation е глобален софтуерен и облачен лидер с мащабни AI интеграции.',
    overviewParagraphs: [
      '🏢 Microsoft Corporation е най-големият доставчик на софтуер за производителност и облачни решения за бизнеса. Бизнес моделът е фокусиран върху B2B абонаменти с висока предвидимост и повтарящи се приходи.',
      '📱 Продуктовото портфолио включва облачната платформа Azure, операционната система Windows, пакета Microsoft 365 (Word, Excel, Teams), корпоративните ERP/CRM бази данни Dynamics 365, мрежата LinkedIn, гейминг дивизията Xbox (аквизитора на Activision Blizzard) и хардуера Surface.',
      '🚀 Основен драйвер за растеж е лидерството в изкуствения интелект чрез близо 13 милиарда долара инвестиции в OpenAI. AI асистентът Microsoft Copilot се внедрява във всички корпоративни продукти, а Azure бързо печели дял при внедряването на облачни AI суперкомпютри.'
    ],
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
    description: 'NVIDIA Corporation е световен лидер в графичните процесори и AI чиповете.',
    overviewParagraphs: [
      '🏢 NVIDIA Corporation е глобалният двигател на революцията в изкуствения интелект. Фирмата се трансформира от производител на графични чипове за гейминг в пълноценна платформа за ускорени изчисления и AI суперкомпютри.',
      '📱 Бизнесът се движи от Data Center дивизията с флагманските AI ускорители H100, H200 и архитектурата от следващо поколение Blackwell. Софтуерната екосистема CUDA, архитектурата NVLink и супербързите мрежови суичове Mellanox създават неизбиваем технологичен ров.',
      '🚀 Бъдещият растеж разчита на физически изкуствен интелект (роботика и Omniverse), автономно шофиране (NVIDIA DRIVE) и разширяване на AI инфраструктурата във всички държави и световни хиперскалиращи облаци.'
    ],
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
    description: 'Amazon.com, Inc. е световен гигант в e-commerce, облачните услуги AWS и дигиталната реклама.',
    overviewParagraphs: [
      '🏢 Amazon.com, Inc. е най-голямата платформа за електронна търговия и пионер в облачните изчисления в световен мащаб.',
      '📱 Търговският бизнес комбинира директни продажби, маркетплейс за трети търговци и Prime абонаментната програма с над 200 милиона членове. Облачното ѝ подразделение Amazon Web Services (AWS) генерира над 60% от оперативната печалба на цялата корпорация.',
      '🚀 Растежът се подкрепя от бързо растящия бизнес с дигитална реклама, автоматизацията на хамбарите с роботика, изграждането на собствни AI чипове (Trainium/Inferentia) и логистичната мрежа от ново поколение.'
    ],
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
    description: 'Tesla, Inc. е лидер в електрическите превозни средства, съхранението на енергия и AI роботиката.',
    overviewParagraphs: [
      '🏢 Tesla, Inc. не е просто автомобилостроител, а вертикално интегрирана компания за чиста енергия, изкуствен интелект и роботика.',
      '📱 Автомобилното портфолио включва масовите електромобили Model 3 и Model Y, премиум моделите S и X, Cybertruck и комерсиалния камион Semi. Енергийната дивизия произвежда мащабни батерии Megapack за електропреносни мрежи и домашни системи Powerwall.',
      '🚀 Основната дългосрочна визия е доминиране на автономията чрез Full Self-Driving (FSD) и пускането на мрежа от Robotaxi, суперкомпютрите Dojo за обучение на невронни мрежи и хуманоидния робот Optimus.'
    ],
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
    description: 'Meta Platforms, Inc. управлява най-големите социални мрежи в света и AI модела Llama.',
    overviewParagraphs: [
      '🏢 Meta Platforms, Inc. притежава и управлява най-влиятелната социална екосистема в света с над 3.2 милиарда дневно активни потребители.',
      '📱 Основният източник на приходи са таргетираните дигитални реклами във Facebook, Instagram, WhatsApp, Messenger и Threads. Подразделението Reality Labs разработва хардтуер за виртуална реалност Quest и интелигентните очила Ray-Ban Meta.',
      '🚀 Стратегията за растеж стъпва върху AIRecommendation алгоритмите за краткото видео Reels, изграждането на водещия отворен AI модел Llama и развитието на бизнес монетизацията във WhatsApp.'
    ],
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
      overviewParagraphs: known.overviewParagraphs || [
        `🏢 ${stock.companyName} (${stock.ticker}) е една от ключовите компании на глобалния фондов пазар. Основният ѝ бизнес модел е ориентиран към предоставяне на иновативни решения в своя сектор.`,
        `📱 Компанията разполага с богат портфейл от продукти и услуги, обслужващи милиони индивидуални и корпоративни клиенти по целия свят.`,
        `🚀 Стратегическият ѝ растеж разчита на непрекъснати инвестиции в развойна дейност, дигитализация и разширяване на пазарния дял.`
      ],
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
    overviewParagraphs: [
      `🏢 ${stock.companyName} (${stock.ticker}) е утвърдена публично търгувана компания с ключово място в сектора ${sectorName}.`,
      `📱 Продуктовото ѝ портфолио включва висококачествени стоки и специализирани услуги за глобалните потребители.`,
      `🚀 Бизнес стратегията на компанията е насочена към финансова стабилност, разширяване на оперативните маржини и внедряване на нови технологии.`
    ],
    businessSegments: [`Основни продукти в сектор ${sectorName}`, 'Услуги и решения за корпоративни клиенти', 'Международна дистрибуция'],
    competitors: ['Конкурент A', 'Конкурент B', 'Глобален лидер C'],
    keyHighlights: [
      `Лидиращ играч в сектор ${sectorName}`,
      'Устойчив бизнес модел с висока клиентска задръжка',
      'Глобално присъствие на развитите пазари'
    ]
  };
}
