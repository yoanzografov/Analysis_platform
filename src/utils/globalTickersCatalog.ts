export interface CatalogStockItem {
  ticker: string;
  companyName: string;
  sector: string;
  industry?: string;
  price?: number;
}

export const GLOBAL_TICKERS_CATALOG: CatalogStockItem[] = [
  // Mega-Cap Tech & AI
  { ticker: 'NVDA', companyName: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors' },
  { ticker: 'AAPL', companyName: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics' },
  { ticker: 'MSFT', companyName: 'Microsoft Corporation', sector: 'Technology', industry: 'Software - Infrastructure' },
  { ticker: 'GOOGL', companyName: 'Alphabet Inc. (Class A)', sector: 'Communication Services', industry: 'Internet Content' },
  { ticker: 'GOOG', companyName: 'Alphabet Inc. (Class C)', sector: 'Communication Services', industry: 'Internet Content' },
  { ticker: 'AMZN', companyName: 'Amazon.com, Inc.', sector: 'Consumer Cyclical', industry: 'Internet Retail' },
  { ticker: 'META', companyName: 'Meta Platforms, Inc.', sector: 'Communication Services', industry: 'Internet Content' },
  { ticker: 'TSLA', companyName: 'Tesla, Inc.', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers' },
  { ticker: 'AVGO', companyName: 'Broadcom Inc.', sector: 'Technology', industry: 'Semiconductors' },
  { ticker: 'TSM', companyName: 'Taiwan Semiconductor Manufacturing', sector: 'Technology', industry: 'Semiconductors' },
  { ticker: 'ASML', companyName: 'ASML Holding N.V.', sector: 'Technology', industry: 'Semiconductor Equipment' },
  { ticker: 'AMD', companyName: 'Advanced Micro Devices, Inc.', sector: 'Technology', industry: 'Semiconductors' },
  { ticker: 'QCOM', companyName: 'QUALCOMM Incorporated', sector: 'Technology', industry: 'Semiconductors' },
  { ticker: 'INTC', companyName: 'Intel Corporation', sector: 'Technology', industry: 'Semiconductors' },
  { ticker: 'ARM', companyName: 'Arm Holdings plc', sector: 'Technology', industry: 'Semiconductors' },
  { ticker: 'MU', companyName: 'Micron Technology, Inc.', sector: 'Technology', industry: 'Semiconductors' },
  { ticker: 'TXN', companyName: 'Texas Instruments Incorporated', sector: 'Technology', industry: 'Semiconductors' },
  { ticker: 'AMAT', companyName: 'Applied Materials, Inc.', sector: 'Technology', industry: 'Semiconductor Equipment' },
  { ticker: 'LRCX', companyName: 'Lam Research Corporation', sector: 'Technology', industry: 'Semiconductor Equipment' },
  { ticker: 'KLAC', companyName: 'KLA Corporation', sector: 'Technology', industry: 'Semiconductor Equipment' },
  { ticker: 'SMCI', companyName: 'Super Micro Computer, Inc.', sector: 'Technology', industry: 'Computer Hardware' },

  // Software & Cloud & Cybersecurity
  { ticker: 'PLTR', companyName: 'Palantir Technologies Inc.', sector: 'Technology', industry: 'Software - Infrastructure' },
  { ticker: 'CRM', companyName: 'Salesforce, Inc.', sector: 'Technology', industry: 'Software - Application' },
  { ticker: 'ORCL', companyName: 'Oracle Corporation', sector: 'Technology', industry: 'Software - Infrastructure' },
  { ticker: 'ADBE', companyName: 'Adobe Inc.', sector: 'Technology', industry: 'Software - Application' },
  { ticker: 'NOW', companyName: 'ServiceNow, Inc.', sector: 'Technology', industry: 'Software - Application' },
  { ticker: 'INTU', companyName: 'Intuit Inc.', sector: 'Technology', industry: 'Software - Application' },
  { ticker: 'IBM', companyName: 'International Business Machines', sector: 'Technology', industry: 'Information Technology Services' },
  { ticker: 'CRWD', companyName: 'CrowdStrike Holdings, Inc.', sector: 'Technology', industry: 'Software - Infrastructure' },
  { ticker: 'PANW', companyName: 'Palo Alto Networks, Inc.', sector: 'Technology', industry: 'Software - Infrastructure' },
  { ticker: 'SNOW', companyName: 'Snowflake Inc.', sector: 'Technology', industry: 'Software - Infrastructure' },
  { ticker: 'DDOG', companyName: 'Datadog, Inc.', sector: 'Technology', industry: 'Software - Application' },
  { ticker: 'NET', companyName: 'Cloudflare, Inc.', sector: 'Technology', industry: 'Software - Infrastructure' },
  { ticker: 'MDB', companyName: 'MongoDB, Inc.', sector: 'Technology', industry: 'Software - Infrastructure' },
  { ticker: 'SHOP', companyName: 'Shopify Inc.', sector: 'Technology', industry: 'Software - Application' },
  { ticker: 'SAP', companyName: 'SAP SE', sector: 'Technology', industry: 'Software - Application' },

  // Financials & Payments
  { ticker: 'BRK.B', companyName: 'Berkshire Hathaway Inc.', sector: 'Financial Services', industry: 'Insurance - Diversified' },
  { ticker: 'JPM', companyName: 'JPMorgan Chase & Co.', sector: 'Financial Services', industry: 'Banks - Diversified' },
  { ticker: 'V', companyName: 'Visa Inc.', sector: 'Financial Services', industry: 'Credit Services' },
  { ticker: 'MA', companyName: 'Mastercard Incorporated', sector: 'Financial Services', industry: 'Credit Services' },
  { ticker: 'BAC', companyName: 'Bank of America Corporation', sector: 'Financial Services', industry: 'Banks - Diversified' },
  { ticker: 'WFC', companyName: 'Wells Fargo & Company', sector: 'Financial Services', industry: 'Banks - Diversified' },
  { ticker: 'MS', companyName: 'Morgan Stanley', sector: 'Financial Services', industry: 'Capital Markets' },
  { ticker: 'GS', companyName: 'The Goldman Sachs Group', sector: 'Financial Services', industry: 'Capital Markets' },
  { ticker: 'BLK', companyName: 'BlackRock, Inc.', sector: 'Financial Services', industry: 'Asset Management' },
  { ticker: 'SPGI', companyName: 'S&P Global Inc.', sector: 'Financial Services', industry: 'Financial Data & Stock Exchanges' },
  { ticker: 'PYPL', companyName: 'PayPal Holdings, Inc.', sector: 'Financial Services', industry: 'Credit Services' },
  { ticker: 'COIN', companyName: 'Coinbase Global, Inc.', sector: 'Financial Services', industry: 'Financial Data & Stock Exchanges' },
  { ticker: 'SQ', companyName: 'Block, Inc.', sector: 'Financial Services', industry: 'Credit Services' },
  { ticker: 'HOOD', companyName: 'Robinhood Markets, Inc.', sector: 'Financial Services', industry: 'Capital Markets' },
  { ticker: 'SOFI', companyName: 'SoFi Technologies, Inc.', sector: 'Financial Services', industry: 'Credit Services' },

  // Healthcare & Pharma
  { ticker: 'LLY', companyName: 'Eli Lilly and Company', sector: 'Healthcare', industry: 'Drug Manufacturers' },
  { ticker: 'UNH', companyName: 'UnitedHealth Group Incorporated', sector: 'Healthcare', industry: 'Healthcare Plans' },
  { ticker: 'JNJ', companyName: 'Johnson & Johnson', sector: 'Healthcare', industry: 'Drug Manufacturers' },
  { ticker: 'ABBV', companyName: 'AbbVie Inc.', sector: 'Healthcare', industry: 'Drug Manufacturers' },
  { ticker: 'MRK', companyName: 'Merck & Co., Inc.', sector: 'Healthcare', industry: 'Drug Manufacturers' },
  { ticker: 'PFE', companyName: 'Pfizer Inc.', sector: 'Healthcare', industry: 'Drug Manufacturers' },
  { ticker: 'TMO', companyName: 'Thermo Fisher Scientific Inc.', sector: 'Healthcare', industry: 'Diagnostics & Research' },
  { ticker: 'ABT', companyName: 'Abbott Laboratories', sector: 'Healthcare', industry: 'Medical Devices' },
  { ticker: 'ISRG', companyName: 'Intuitive Surgical, Inc.', sector: 'Healthcare', industry: 'Medical Instruments' },
  { ticker: 'NVO', companyName: 'Novo Nordisk A/S', sector: 'Healthcare', industry: 'Biotechnology' },
  { ticker: 'AZN', companyName: 'AstraZeneca PLC', sector: 'Healthcare', industry: 'Drug Manufacturers' },
  { ticker: 'DHR', companyName: 'Danaher Corporation', sector: 'Healthcare', industry: 'Diagnostics & Research' },

  // Consumer & Retail
  { ticker: 'WMT', companyName: 'Walmart Inc.', sector: 'Consumer Defensive', industry: 'Discount Stores' },
  { ticker: 'COST', companyName: 'Costco Wholesale Corporation', sector: 'Consumer Defensive', industry: 'Discount Stores' },
  { ticker: 'PG', companyName: 'The Procter & Gamble Company', sector: 'Consumer Defensive', industry: 'Household Products' },
  { ticker: 'KO', companyName: 'The Coca-Cola Company', sector: 'Consumer Defensive', industry: 'Beverages - Non-Alcoholic' },
  { ticker: 'PEP', companyName: 'PepsiCo, Inc.', sector: 'Consumer Defensive', industry: 'Beverages - Non-Alcoholic' },
  { ticker: 'MCD', companyName: "McDonald's Corporation", sector: 'Consumer Cyclical', industry: 'Restaurants' },
  { ticker: 'SBUX', companyName: 'Starbucks Corporation', sector: 'Consumer Cyclical', industry: 'Restaurants' },
  { ticker: 'NKE', companyName: 'NIKE, Inc.', sector: 'Consumer Cyclical', industry: 'Footwear & Accessories' },
  { ticker: 'DIS', companyName: 'The Walt Disney Company', sector: 'Communication Services', industry: 'Entertainment' },
  { ticker: 'NFLX', companyName: 'Netflix, Inc.', sector: 'Communication Services', industry: 'Entertainment' },
  { ticker: 'SPOT', companyName: 'Spotify Technology S.A.', sector: 'Communication Services', industry: 'Internet Content' },
  { ticker: 'UBER', companyName: 'Uber Technologies, Inc.', sector: 'Technology', industry: 'Software - Application' },
  { ticker: 'ABNB', companyName: 'Airbnb, Inc.', sector: 'Consumer Cyclical', industry: 'Travel Services' },
  { ticker: 'BKNG', companyName: 'Booking Holdings Inc.', sector: 'Consumer Cyclical', industry: 'Travel Services' },
  { ticker: 'BABA', companyName: 'Alibaba Group Holding Limited', sector: 'Consumer Cyclical', industry: 'Internet Retail' },
  { ticker: 'PDD', companyName: 'PDD Holdings Inc. (Temu)', sector: 'Consumer Cyclical', industry: 'Internet Retail' },

  // Industrials & Aerospace
  { ticker: 'CAT', companyName: 'Caterpillar Inc.', sector: 'Industrials', industry: 'Farm & Heavy Construction' },
  { ticker: 'GE', companyName: 'GE Aerospace', sector: 'Industrials', industry: 'Aerospace & Defense' },
  { ticker: 'BA', companyName: 'The Boeing Company', sector: 'Industrials', industry: 'Aerospace & Defense' },
  { ticker: 'LMT', companyName: 'Lockheed Martin Corporation', sector: 'Industrials', industry: 'Aerospace & Defense' },
  { ticker: 'HON', companyName: 'Honeywell International Inc.', sector: 'Industrials', industry: 'Conglomerates' },
  { ticker: 'DE', companyName: 'Deere & Company', sector: 'Industrials', industry: 'Farm & Heavy Construction' },
  { ticker: 'UPS', companyName: 'United Parcel Service, Inc.', sector: 'Industrials', industry: 'Integrated Freight & Logistics' },
  { ticker: 'FDX', companyName: 'FedEx Corporation', sector: 'Industrials', industry: 'Integrated Freight & Logistics' },

  // Energy & Utilities
  { ticker: 'XOM', companyName: 'Exxon Mobil Corporation', sector: 'Energy', industry: 'Oil & Gas Integrated' },
  { ticker: 'CVX', companyName: 'Chevron Corporation', sector: 'Energy', industry: 'Oil & Gas Integrated' },
  { ticker: 'SHEL', companyName: 'Shell plc', sector: 'Energy', industry: 'Oil & Gas Integrated' },
  { ticker: 'BP', companyName: 'BP p.l.c.', sector: 'Energy', industry: 'Oil & Gas Integrated' },
  { ticker: 'NEE', companyName: 'NextEra Energy, Inc.', sector: 'Utilities', industry: 'Utilities - Regulated Electric' },

  // Telecom
  { ticker: 'T', companyName: 'AT&T Inc.', sector: 'Communication Services', industry: 'Telecom Services' },
  { ticker: 'VZ', companyName: 'Verizon Communications Inc.', sector: 'Communication Services', industry: 'Telecom Services' },
  { ticker: 'TMUS', companyName: 'T-Mobile US, Inc.', sector: 'Communication Services', industry: 'Telecom Services' },

  // Automotive & EV
  { ticker: 'F', companyName: 'Ford Motor Company', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers' },
  { ticker: 'GM', companyName: 'General Motors Company', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers' },
  { ticker: 'RIVN', companyName: 'Rivian Automotive, Inc.', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers' },
  { ticker: 'NIO', companyName: 'NIO Inc.', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers' },

  // Major Index ETFs
  { ticker: 'SPY', companyName: 'SPDR S&P 500 ETF Trust', sector: 'ETF', industry: 'US Large Cap' },
  { ticker: 'QQQ', companyName: 'Invesco QQQ Trust (Nasdaq 100)', sector: 'ETF', industry: 'US Tech Large Cap' },
  { ticker: 'VOO', companyName: 'Vanguard S&P 500 ETF', sector: 'ETF', industry: 'US Large Cap' },
  { ticker: 'VTI', companyName: 'Vanguard Total Stock Market ETF', sector: 'ETF', industry: 'US Total Market' },
  { ticker: 'IWM', companyName: 'iShares Russell 2000 ETF', sector: 'ETF', industry: 'US Small Cap' },
  { ticker: 'DIA', companyName: 'SPDR Dow Jones Industrial Average', sector: 'ETF', industry: 'US Mega Cap' },
  { ticker: 'SMH', companyName: 'VanEck Semiconductor ETF', sector: 'ETF', industry: 'Semiconductors' },
  { ticker: 'SCHD', companyName: 'Schwab U.S. Dividend Equity ETF', sector: 'ETF', industry: 'US Dividend' },
  { ticker: 'XLK', companyName: 'Technology Select Sector SPDR', sector: 'ETF', industry: 'Technology' },
  { ticker: 'XLE', companyName: 'Energy Select Sector SPDR Fund', sector: 'ETF', industry: 'Energy' },
  { ticker: 'XLF', companyName: 'Financial Select Sector SPDR Fund', sector: 'ETF', industry: 'Financials' },
  { ticker: 'GLD', companyName: 'SPDR Gold Shares', sector: 'Commodity', industry: 'Gold' }
];

export function searchGlobalTickers(
  query: string, 
  userStocks: { ticker: string; companyName: string }[] = []
): {
  userMatches: { ticker: string; companyName: string }[];
  globalMatches: CatalogStockItem[];
  exactFound: boolean;
} {
  const clean = query.trim().toUpperCase();
  if (!clean) {
    return {
      userMatches: userStocks.slice(0, 8),
      globalMatches: GLOBAL_TICKERS_CATALOG.slice(0, 12),
      exactFound: false
    };
  }

  // 1. User stocks match
  const userMatches = userStocks.filter(s => 
    s.ticker.toUpperCase().includes(clean) || 
    s.companyName.toUpperCase().includes(clean)
  );

  // 2. Global catalog match
  const globalMatches = GLOBAL_TICKERS_CATALOG.filter(s => 
    s.ticker.toUpperCase().includes(clean) || 
    s.companyName.toUpperCase().includes(clean)
  );

  const exactFound = userMatches.some(s => s.ticker.toUpperCase() === clean) || 
                     globalMatches.some(s => s.ticker.toUpperCase() === clean);

  return {
    userMatches: userMatches.slice(0, 6),
    globalMatches: globalMatches.slice(0, 10),
    exactFound
  };
}
