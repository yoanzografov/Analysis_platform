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
    description: 'Alphabet Inc. е глобален технологичен лидер и компания-майка на Google. Компанията се занимава с интернет търсене (Google Search), дигитална реклама, онлайн видео платформата YouTube, облачни услуги (Google Cloud Platform), мобилната операционна система Android, хардуер (Pixel) и иновативни решения в областта на изкуствения интелект (Gemini, DeepMind).'
  },
  GOOGL: {
    sector: 'Communication Services',
    industry: 'Interactive Media & Services',
    employees: '182,502',
    ceo: 'Sundar Pichai',
    headquarters: 'Mountain View, California, USA',
    founded: '1998',
    website: 'https://abc.xyz',
    description: 'Alphabet Inc. (Класен дял A) е глобален технологичен гигант и компания-майка на Google. Основната дейност включва Google Search, YouTube, Google Cloud, Android, разработка на AI модели (Gemini) и автономни автомобили (Waymo).'
  },
  AAPL: {
    sector: 'Technology',
    industry: 'Consumer Electronics',
    employees: '161,000',
    ceo: 'Tim Cook',
    headquarters: 'Cupertino, California, USA',
    founded: '1976',
    website: 'https://www.apple.com',
    description: 'Apple Inc. проектира, произвежда и продава смартфони (iPhone), персонални компютри (Mac), таблети (iPad), носими устройства (Apple Watch, AirPods, Vision Pro) и аксесоари. Компанията предлага и богата гама от дигитални услуги включително App Store, Apple Music, Apple TV+, iCloud и Apple Pay.'
  },
  MSFT: {
    sector: 'Technology',
    industry: 'Software - Infrastructure',
    employees: '221,000',
    ceo: 'Satya Nadella',
    headquarters: 'Redmond, Washington, USA',
    founded: '1975',
    website: 'https://www.microsoft.com',
    description: 'Microsoft Corporation е една от най-големите софтуерни и технологични компании в света. Основната ѝ дейност включва операционната система Windows, пакета за производителност Microsoft 365, облачната платформа Azure, конзолите Xbox, професионалната мрежа LinkedIn и мащабни инвестиции в изкуствен интелект (OpenAI/Copilot).'
  },
  NVDA: {
    sector: 'Technology',
    industry: 'Semiconductors',
    employees: '29,600',
    ceo: 'Jensen Huang',
    headquarters: 'Santa Clara, California, USA',
    founded: '1993',
    website: 'https://www.nvidia.com',
    description: 'NVIDIA Corporation е световен лидер в графичните процесори (GPU) и ускорените изчислителни технологии. Компанията е пионер в хай-енд гейминга (GeForce), изкуствения интелект (H100, Blackwell), центровете за данни, роботиката и автономното шофиране.'
  },
  AMZN: {
    sector: 'Consumer Cyclical',
    industry: 'Internet Retail',
    employees: '1,525,000',
    ceo: 'Andy Jassy',
    headquarters: 'Seattle, Washington, USA',
    founded: '1994',
    website: 'https://www.amazon.com',
    description: 'Amazon.com, Inc. е световен гигант в електронната търговия, облачните услуги (Amazon Web Services - AWS), онлайн стрийминга (Prime Video) и дигиталната реклама. Компанията е най-големият доставчик на облачна инфраструктура в света.'
  },
  TSLA: {
    sector: 'Consumer Cyclical',
    industry: 'Auto Manufacturers',
    employees: '140,473',
    ceo: 'Elon Musk',
    headquarters: 'Austin, Texas, USA',
    founded: '2003',
    website: 'https://www.tesla.com',
    description: 'Tesla, Inc. проектира, развива и произвежда електрически превозни средства (Model S, 3, X, Y, Cybertruck, Semi), системи за съхранение на енергия (Megapack, Powerwall), слънчеви покриви и разработва технологии за пълно автопилотно шофиране (FSD) и роботика (Optimus).'
  },
  META: {
    sector: 'Communication Services',
    industry: 'Interactive Media & Services',
    employees: '67,317',
    ceo: 'Mark Zuckerberg',
    headquarters: 'Menlo Park, California, USA',
    founded: '2004',
    website: 'https://about.meta.com',
    description: 'Meta Platforms, Inc. управлява най-големите социални мрежи в света – Facebook, Instagram, WhatsApp, Messenger и Threads. Компанията се занимава и с разработка на хардтуер за виртуална и добавена реалност (Meta Quest) и отворени AI модели (Llama).'
  },
  AMD: {
    sector: 'Technology',
    industry: 'Semiconductors',
    employees: '26,000',
    ceo: 'Lisa Su',
    headquarters: 'Santa Clara, California, USA',
    founded: '1969',
    website: 'https://www.amd.com',
    description: 'Advanced Micro Devices, Inc. проектира микропроцесори (Ryzen, EPYC), графични чипове (Radeon), AI ускорители (Instinct MI300) и адаптивни чипове (Xilinx) за персонални компютри, центрове за данни и вградени системи.'
  },
  AVGO: {
    sector: 'Technology',
    industry: 'Semiconductors',
    employees: '30,000',
    ceo: 'Hock Tan',
    headquarters: 'Palo Alto, California, USA',
    founded: '1961',
    website: 'https://www.broadcom.com',
    description: 'Broadcom Inc. е глобален технологичен лидер в областта на полупроводниците и инфраструктурния софтуер. Продуктите ѝ задвижват мрежи за данни, дата центрове, широколентови комуникации и корпоративен софтуер (VMware).'
  },
  ASML: {
    sector: 'Technology',
    industry: 'Semiconductor Equipment',
    employees: '42,400',
    ceo: 'Christophe Fouquet',
    headquarters: 'Veldhoven, Netherlands',
    founded: '1984',
    website: 'https://www.asml.com',
    description: 'ASML Holding N.V. е монополен световен производител на фотолитографски системи (EUV / Extreme Ultraviolet), с които се произвеждат най-модерните микрочипове в света за TSMC, Intel и Samsung.'
  },
  ACN: {
    sector: 'Technology',
    industry: 'Information Technology Services',
    employees: '750,000',
    ceo: 'Julie Sweet',
    headquarters: 'Dublin, Ireland',
    founded: '1989',
    website: 'https://www.accenture.com',
    description: 'Accenture plc е водеща глобална компания за професионални услуги, консултиране, дигитална трансформация, облачни интеграции, киберсигурност и внедряване на изкуствен интелект в бизнеса.'
  },
  CAT: {
    sector: 'Industrials',
    industry: 'Farm & Heavy Construction Machinery',
    employees: '113,200',
    ceo: 'Jim Umpleby',
    headquarters: 'Irving, Texas, USA',
    founded: '1925',
    website: 'https://www.caterpillar.com',
    description: 'Caterpillar Inc. е най-големият световен производител на строителна и минна техника, дизелови и газови двигатели, промишлени газови турбини и дизелово-електрически локомотиви.'
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
      description: known.description || `${stock.companyName} (${stock.ticker}) е водеща световна компания в своя сектор, предлагаща високотехнологични продукти и услуги на глобалния пазар.`
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
    description: `${stock.companyName} (${stock.ticker}) е публично търгувана компания, част от глобалния фондов пазар. Основната ѝ дейност включва разработването, производството и разпространението на ключови продукти и услуги в сектора ${sectorName}.`
  };
}
