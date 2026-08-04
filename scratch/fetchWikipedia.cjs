const https = require('https');
const fs = require('fs');
const path = require('path');

// Complete mapping of ticker -> exact Wikipedia article title for the company
const TICKER_TO_WIKI = {
  AAPL: 'Apple Inc.',
  ABBV: 'AbbVie',
  ABNB: 'Airbnb',
  ABT: 'Abbott Laboratories',
  ACIW: 'ACI Worldwide',
  ACN: 'Accenture',
  ADBE: 'Adobe Inc.',
  ADSK: 'Autodesk',
  AIG: 'American International Group',
  AKAM: 'Akamai Technologies',
  ALL: 'Allstate',
  AMGN: 'Amgen',
  AMZN: 'Amazon (company)',
  ANSS: 'ANSYS',
  AON: 'Aon (company)',
  ARGT: 'Global X MSCI Argentina ETF',
  ASML: 'ASML',
  ATVI: 'Activision Blizzard',
  AVGO: 'Broadcom Inc.',
  AXP: 'American Express',
  AZN: 'AstraZeneca',
  BBY: 'Best Buy',
  BKNG: 'Booking Holdings',
  BMY: 'Bristol Myers Squibb',
  BRBY: 'Burberry',
  BTI: 'British American Tobacco',
  CALM: 'Cal-Maine Foods',
  CAT: 'Caterpillar Inc.',
  CEG: 'Constellation Energy',
  CHD: 'Church & Dwight',
  CHTR: 'Charter Communications',
  CL: 'Colgate-Palmolive',
  CMCSA: 'Comcast',
  CMG: 'Chipotle Mexican Grill',
  COST: 'Costco',
  CPRX: 'Catalyst Pharmaceuticals',
  CRM: 'Salesforce',
  CROX: 'Crocs',
  CRWD: 'CrowdStrike',
  CSCO: 'Cisco',
  CSV: 'Carriage Services',
  CVS: 'CVS Health',
  CVX: 'Chevron Corporation',
  D: 'Dominion Energy',
  DECK: 'Deckers Outdoor',
  DELL: 'Dell Technologies',
  DEO: 'Diageo',
  DG: 'Dollar General',
  DHI: 'D.R. Horton',
  DIS: 'The Walt Disney Company',
  DKS: "Dick's Sporting Goods",
  DLTR: 'Dollar Tree',
  DOV: 'Dover Corporation',
  DOX: 'Amdocs',
  DPZ: "Domino's Pizza",
  DRI: 'Darden Restaurants',
  DUK: 'Duke Energy',
  DUOL: 'Duolingo',
  ECL: 'Ecolab',
  EL: 'The Estée Lauder Companies',
  ELF: 'e.l.f. Beauty',
  ENB: 'Enbridge',
  ENPH: 'Enphase Energy',
  ENVX: 'Enovix',
  EPAM: 'EPAM Systems',
  EXPE: 'Expedia Group',
  FAST: 'Fastenal',
  FDS: 'FactSet',
  FDX: 'FedEx',
  FISV: 'Fiserv',
  FLO: 'Flowers Foods',
  FMC: 'FMC Corporation',
  FTNT: 'Fortinet',
  GIS: 'General Mills',
  GOOGL: 'Alphabet Inc.',
  GPC: 'Genuine Parts Company',
  GPN: 'Global Payments',
  GRMN: 'Garmin',
  HALO: 'Halozyme Therapeutics',
  HD: 'The Home Depot',
  HEIA: 'HEICO',
  HIMS: 'Hims & Hers Health',
  HSY: 'The Hershey Company',
  HRB: 'H&R Block',
  IBM: 'IBM',
  INGR: 'Ingredion',
  INTC: 'Intel',
  INTU: 'Intuit',
  IONQ: 'IonQ',
  IREN: 'Iris Energy',
  ISRG: 'Intuitive Surgical',
  IT: 'Gartner',
  ITW: 'Illinois Tool Works',
  JNJ: 'Johnson & Johnson',
  KHC: 'Kraft Heinz',
  KO: 'The Coca-Cola Company',
  KR: 'Kroger',
  LAMR: 'Lamar Advertising',
  LEG: 'Leggett & Platt',
  LKQ: 'LKQ Corporation',
  LLY: 'Eli Lilly and Company',
  LNTH: 'Lantheus',
  LOGI: 'Logitech',
  LOW: "Lowe's",
  LRCX: 'Lam Research',
  LULU: 'Lululemon Athletica',
  LW: 'Lamb Weston',
  MA: 'Mastercard',
  MCD: "McDonald's",
  MDLZ: 'Mondelez International',
  MDT: 'Medtronic',
  MEDP: 'Medpace',
  MELI: 'MercadoLibre',
  META: 'Meta Platforms',
  MKC: 'McCormick & Company',
  MMM: '3M',
  MNST: 'Monster Beverage',
  MO: 'Altria',
  MRK: 'Merck & Co.',
  MSFT: 'Microsoft',
  MU: 'Micron Technology',
  NBIS: 'Nebius Group',
  NEE: 'NextEra Energy',
  NFLX: 'Netflix',
  NKE: 'Nike, Inc.',
  NOW: 'ServiceNow',
  NVDA: 'Nvidia',
  NVO: 'Novo Nordisk',
  NVR: 'NVR, Inc.',
  NXST: 'Nexstar Media Group',
  OKTA: 'Okta (company)',
  ON: 'Onsemi',
  ONON: 'On (company)',
  OPRA: 'Opera (web browser)',
  ORCL: 'Oracle Corporation',
  PANW: 'Palo Alto Networks',
  PAYC: 'Paycom',
  PEP: 'PepsiCo',
  PFE: 'Pfizer',
  PG: 'Procter & Gamble',
  PM: 'Philip Morris International',
  POOL: 'Pool Corporation',
  PYPL: 'PayPal',
  QBTS: 'D-Wave Quantum',
  QCOM: 'Qualcomm',
  QLYS: 'Qualys',
  RACE: 'Ferrari',
  RGTI: 'Rigetti Computing',
  SBUX: 'Starbucks',
  SCI: 'Service Corporation International',
  SEDG: 'SolarEdge Technologies',
  SFM: 'Sprouts Farmers Market',
  SIRI: 'Sirius XM',
  SMCI: 'Super Micro Computer',
  SNA: 'Snap-on',
  SOFI: 'SoFi',
  STMPA: 'STMicroelectronics',
  STZ: 'Constellation Brands',
  SYY: 'Sysco',
  TER: 'Teradyne',
  TGT: 'Target Corporation',
  TMO: 'Thermo Fisher Scientific',
  TSLA: 'Tesla, Inc.',
  TSM: 'TSMC',
  TXN: 'Texas Instruments',
  UBER: 'Uber',
  UL: 'Unilever',
  ULTA: 'Ulta Beauty',
  UNH: 'UnitedHealth Group',
  UPS: 'United Parcel Service',
  V: 'Visa Inc.',
  VC: 'Visteon',
  VST: 'Vistra Energy',
  VZ: 'Verizon',
  WBD: 'Warner Bros. Discovery',
  WHR: 'Whirlpool Corporation',
  WM: 'Waste Management, Inc.',
  WMT: 'Walmart',
  WSM: 'Williams-Sonoma',
  WSO: 'Watsco',
  XOM: 'ExxonMobil',
  ZETA: 'Zeta Global',
  ZTS: 'Zoetis',
};

function getWikipediaExtract(title) {
  return new Promise((resolve) => {
    const encodedTitle = encodeURIComponent(title);
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`;
    
    const req = https.get(url, {
      headers: {
        'User-Agent': 'BulgarianStockPlatform/1.0 (educational project)',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.extract && json.extract.length > 50) {
            // Take just the first 2 sentences for a clean description
            const sentences = json.extract.split('. ');
            const desc = sentences.slice(0, 3).join('. ').trim();
            const finalDesc = desc.endsWith('.') ? desc : desc + '.';
            resolve({ success: true, description: finalDesc, fullExtract: json.extract });
          } else {
            resolve({ success: false, description: null });
          }
        } catch (e) {
          resolve({ success: false, description: null });
        }
      });
    });
    req.on('error', () => resolve({ success: false, description: null }));
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const outputPath = path.join(__dirname, '../src/data/officialCompanyProfiles.json');
  let existingData = {};
  if (fs.existsSync(outputPath)) {
    existingData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  }

  const tickers = Object.keys(TICKER_TO_WIKI);
  const results = { ...existingData };
  let count = 0;

  for (const ticker of tickers) {
    count++;
    const wikiTitle = TICKER_TO_WIKI[ticker];
    process.stdout.write(`[${count}/${tickers.length}] ${ticker} (${wikiTitle})... `);
    
    const result = await getWikipediaExtract(wikiTitle);
    
    if (result.success) {
      results[ticker] = {
        ticker,
        wikiTitle,
        officialDescription: result.description
      };
      console.log(`OK (${result.description.length} chars)`);
    } else {
      console.log(`FAILED - keeping existing`);
    }
    
    await sleep(300); // be polite to Wikipedia
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nSaved ${Object.keys(results).length} profiles to ${outputPath}`);
}

main().catch(console.error);
