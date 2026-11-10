export interface FinancialStatementRow {
  name: string;
  key: string;
  isHeader?: boolean;
  isBold?: boolean;
  indent?: number; // 0 = main, 1 = sub, 2 = sub-sub
  format?: 'currency' | 'percent' | 'number';
  values: { [period: string]: number | null };
}

export interface FinancialStatementTable {
  periods: string[];
  rows: FinancialStatementRow[];
}

export interface StockAnalysisData {
  ticker: string;
  companyName: string;
  currency: string;
  overview: {
    currentPrice: number;
    dailyChangePct: number;
    dailyChangeAmount?: number | null;
    afterHoursPrice?: number | null;
    afterHoursChange?: number | null;
    afterHoursChangePct?: number | null;
    exchange?: string;
    open?: number | null;
    previousClose?: number | null;
    volume?: number | null;
    dayLow?: number | null;
    dayHigh?: number | null;
    sharesOut?: number | null;
    marketCap: number;
    marketCapGrowth?: number | null;
    revenueGrowth?: number | null;
    netIncomeGrowth?: number | null;
    epsGrowth?: number | null;
    peRatio: number | null;
    forwardPE: number | null;
    pegRatio: number | null;
    priceToSales: number | null;
    priceToBook: number | null;
    evToEbitda: number | null;
    beta: number | null;
    week52Low: number | null;
    week52High: number | null;
    dividendYield: number | null;
    dividendAmount?: number | null;
    exDividendDate?: string;
    nextEarningsDate: string;
    analystsRecommendation?: string;
    priceTarget?: number | null;
    priceTargetUpside?: number | null;
    sector: string;
    industry: string;
    description: string;
    website: string;
    employees: number | null;
    country: string;
  };
  financials: {
    revenue: number | null;
    grossProfit: number | null;
    operatingIncome: number | null;
    netIncome: number | null;
    operatingCashFlow: number | null;
    freeCashFlow: number | null;
    totalCash: number | null;
    totalDebt: number | null;
    grossMargin: number | null;
    operatingMargin: number | null;
    profitMargin: number | null;
    statementRows: Array<{
      metric: string;
      ttm: string;
      prevYear: string;
      prev2Year: string;
      prev3Year: string;
    }>;
    incomeStatement?: FinancialStatementTable;
    balanceSheet?: FinancialStatementTable;
    cashFlow?: FinancialStatementTable;
    ratios?: FinancialStatementTable;
    quarterlyIncomeStatement?: FinancialStatementTable;
    quarterlyBalanceSheet?: FinancialStatementTable;
    quarterlyCashFlow?: FinancialStatementTable;
    quarterlyRatios?: FinancialStatementTable;
    kpis?: FinancialStatementTable;
    quarterlyKpis?: FinancialStatementTable;
    segments?: Array<{
      name: string;
      revenue: number;
      pct: number;
      growthPct?: number;
    }>;
  };
  forecast: {
    targetLow: number | null;
    targetMean: number | null;
    targetHigh: number | null;
    targetMedian: number | null;
    currentPrice: number;
    recommendationKey: string;
    numberOfAnalysts: number;
    upsidePercent: number | null;
    ratings: {
      strongBuy: number;
      buy: number;
      hold: number;
      underperform: number;
      sell: number;
    };
  };
  statistics: {
    peRatio: number | null;
    forwardPE: number | null;
    pegRatio: number | null;
    priceToSales: number | null;
    priceToBook: number | null;
    evToEbitda: number | null;
    returnOnEquity: number | null;
    returnOnAssets: number | null;
    profitMargin: number | null;
    operatingMargin: number | null;
    currentRatio: number | null;
    quickRatio: number | null;
    debtToEquity: number | null;
  };
  metrics: {
    epsTrailing: number | null;
    epsForward: number | null;
    revenuePerShare: number | null;
    bookValuePerShare: number | null;
    cashPerShare: number | null;
    fcfPerShare: number | null;
  };
  dividends: {
    dividendYield: number | null;
    dividendRate: number | null;
    payoutRatio: number | null;
    fiveYearAvgYield: number | null;
    exDividendDate: string;
    dividendDate: string;
    frequency: string;
    payouts: Array<{
      date: string;
      amount: string;
      type: string;
    }>;
  };
  history: {
    month1Return: number | null;
    month3Return: number | null;
    month6Return: number | null;
    year1Return: number | null;
    yearToDateReturn: number | null;
    recentPrices: Array<{
      date: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      changePct: number;
    }>;
  };
  profile: {
    companyName: string;
    sector: string;
    industry: string;
    ceo: string;
    employees: number | null;
    city: string;
    state: string;
    country: string;
    website: string;
    description: string;
    officers: Array<{
      name: string;
      title: string;
      pay?: string;
    }>;
  };
}

export type StockAnalysisTabId = 
  | 'overview' 
  | 'financials' 
  | 'forecast' 
  | 'statistics' 
  | 'metrics' 
  | 'dividends' 
  | 'history' 
  | 'profile' 
  | 'chart';
