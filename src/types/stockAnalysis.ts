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
  periodEndDates?: Record<string, string>;
  rows: FinancialStatementRow[];
}

export interface StockAnalysisData {
  ticker: string;
  companyName: string;
  currency: string;
  currencySymbol?: string;
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
    trailingIncomeStatement?: FinancialStatementTable;
    trailingCashFlow?: FinancialStatementTable;
    trailingRatios?: FinancialStatementTable;
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
    recommendationMean?: number | null;
    numberOfAnalysts: number;
    upsidePercent: number | null;
    ratings: {
      strongBuy: number;
      buy: number;
      hold: number;
      underperform: number;
      sell: number;
      strongSell?: number;
    };
    revenueEstimates?: Array<{
      period: string;
      year: string;
      avg: number | null;
      low: number | null;
      high: number | null;
      growth: number | null;
      numberOfAnalysts: number;
    }>;
    epsEstimates?: Array<{
      period: string;
      year: string;
      avg: number | null;
      low: number | null;
      high: number | null;
      growth: number | null;
      forwardPE?: number | null;
      numberOfAnalysts: number;
    }>;
    recentRatings?: Array<{
      date: string;
      firm: string;
      toGrade: string;
      fromGrade?: string;
      action: string;
      currentPriceTarget?: number | null;
      priorPriceTarget?: number | null;
    }>;
  };
  statistics: {
    peRatio: number | null;
    forwardPE: number | null;
    pegRatio: number | null;
    priceToSales: number | null;
    priceToBook: number | null;
    priceToFcf?: number | null;
    enterpriseValue?: number | null;
    evToRevenue?: number | null;
    evToEbitda: number | null;
    evToFcf?: number | null;
    returnOnEquity: number | null;
    returnOnAssets: number | null;
    returnOnCapital?: number | null; // ROIC
    grossMargin?: number | null;
    profitMargin: number | null;
    operatingMargin: number | null;
    fcfMargin?: number | null;
    currentRatio: number | null;
    quickRatio: number | null;
    debtToEquity: number | null;
    debtToEbitda?: number | null;
    interestCoverage?: number | null;
    totalCash?: number | null;
    totalDebt?: number | null;
    netCashDebt?: number | null;
    sharesOutstanding?: number | null;
    floatShares?: number | null;
    sharesShort?: number | null;
    shortPercentOfFloat?: number | null;
    shortRatio?: number | null;
    insiderOwnership?: number | null;
    institutionalOwnership?: number | null;
    beta?: number | null;
    week52Low?: number | null;
    week52High?: number | null;
    week52Change?: number | null;
    movingAvg50?: number | null;
    movingAvg200?: number | null;
    avgVolume10D?: number | null;
    avgVolume3M?: number | null;
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
    payoutFrequency?: string;
    dividendGrowth1Y?: number | null;
    growthYears?: number;
    buybackYield?: number | null;
    shareholderYield?: number | null;
    narrative?: string;
    payouts: Array<{
      date: string;
      rawDate?: string;
      amount: string;
      cashAmount?: number;
      recordDate?: string;
      payDate?: string;
      type: string;
    }>;
    annualHistory?: Array<{
      year: string;
      amount: number;
      growth?: number | null;
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
    address?: string;
    phone?: string;
    stockType?: string;
    fiscalYear?: string;
    cik?: string;
    cusip?: string;
    isin?: string;
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
