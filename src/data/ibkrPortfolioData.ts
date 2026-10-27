import { PortfolioPosition, PortfolioTransaction, PortfolioDividendRecord } from '../types';

export const IBKR_BASE_CURRENCY: 'EUR' | 'USD' = 'EUR';
export const IBKR_CASH_BALANCE_EUR = 5146.12;
export const IBKR_CASH_BALANCE_USD = 5750.36;

export const IBKR_POSITIONS: PortfolioPosition[] = [
  // European ETFs (EUR)
  {
    id: 'ibkr-pos-jgpi',
    ticker: 'JGPI',
    companyName: 'JPMorgan Global Equity Premium Income Active UCITS ETF',
    shares: 123.7231,
    buyPrice: 23.4694,
    currency: 'EUR',
    fee: 1.27,
    buyDate: '2026-04-13',
    fairPrice: 25.50,
    annualDivPerShare: 1.85,
    notes: 'Interactive Brokers (IE0003UVYC20, IBIS2)'
  },
  {
    id: 'ibkr-pos-sxr8',
    ticker: 'SXR8',
    companyName: 'iShares Core S&P 500 UCITS ETF',
    shares: 14.5317,
    buyPrice: 569.7091,
    currency: 'EUR',
    fee: 12.50,
    buyDate: '2026-01-15',
    fairPrice: 780.00,
    notes: 'Interactive Brokers (IE00B5BMR087, IBIS2)'
  },
  {
    id: 'ibkr-pos-vhyl',
    ticker: 'VHYL',
    companyName: 'Vanguard FTSE All-World High Dividend Yield UCITS ETF',
    shares: 54.6286,
    buyPrice: 59.9024,
    currency: 'EUR',
    fee: 0,
    buyDate: '2025-12-18',
    fairPrice: 88.00,
    annualDivPerShare: 2.80,
    notes: 'Interactive Brokers (IE00B8GKDB10, AEB)'
  },
  {
    id: 'ibkr-pos-xnas',
    ticker: 'XNAS',
    companyName: 'Xtrackers Nasdaq 100 UCITS ETF 1C',
    shares: 66.8462,
    buyPrice: 47.8346,
    currency: 'EUR',
    fee: 15.02,
    buyDate: '2026-01-06',
    fairPrice: 66.00,
    notes: 'Interactive Brokers (IE00BMFKG444, IBIS2)'
  },

  // US Stocks (USD)
  {
    id: 'ibkr-pos-aapl',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    shares: 5.0,
    buyPrice: 192.1390,
    currency: 'USD',
    fee: 0,
    buyDate: '2025-10-15',
    fairPrice: 350.00,
    annualDivPerShare: 1.08,
    notes: 'Interactive Brokers (US0378331005)'
  },
  {
    id: 'ibkr-pos-brkb',
    ticker: 'BRK.B',
    companyName: 'Berkshire Hathaway Inc. Class B',
    shares: 3.1726,
    buyPrice: 473.4282,
    currency: 'USD',
    fee: 0,
    buyDate: '2025-11-20',
    fairPrice: 580.00,
    notes: 'Interactive Brokers (US0846707026)'
  },
  {
    id: 'ibkr-pos-fisv',
    ticker: 'FISV',
    companyName: 'Fiserv Inc.',
    shares: 15.4365,
    buyPrice: 65.0085,
    currency: 'USD',
    fee: 0,
    buyDate: '2025-09-10',
    fairPrice: 75.00,
    notes: 'Interactive Brokers (US3377381088)'
  },
  {
    id: 'ibkr-pos-goog',
    ticker: 'GOOG',
    companyName: 'Alphabet Inc. Class C',
    shares: 10.0,
    buyPrice: 168.6204,
    currency: 'USD',
    fee: 0,
    buyDate: '2025-08-14',
    fairPrice: 340.00,
    annualDivPerShare: 0.88,
    notes: 'Interactive Brokers (US02079K1079)'
  },
  {
    id: 'ibkr-pos-meta',
    ticker: 'META',
    companyName: 'Meta Platforms Inc.',
    shares: 1.6545,
    buyPrice: 604.8212,
    currency: 'USD',
    fee: 0.35,
    buyDate: '2026-03-31',
    fairPrice: 720.00,
    annualDivPerShare: 2.10,
    notes: 'Interactive Brokers (US30303M1027)'
  },
  {
    id: 'ibkr-pos-msft',
    ticker: 'MSFT',
    companyName: 'Microsoft Corp.',
    shares: 2.7849,
    buyPrice: 388.4046,
    currency: 'USD',
    fee: 0.35,
    buyDate: '2026-02-24',
    fairPrice: 550.00,
    annualDivPerShare: 3.64,
    notes: 'Interactive Brokers (US5949181045)'
  },
  {
    id: 'ibkr-pos-o',
    ticker: 'O',
    companyName: 'Realty Income Corp.',
    shares: 80.0,
    buyPrice: 56.0783,
    currency: 'USD',
    fee: 0,
    buyDate: '2025-07-15',
    fairPrice: 68.00,
    annualDivPerShare: 3.25,
    notes: 'Interactive Brokers (US7561091049)'
  },
  {
    id: 'ibkr-pos-pfe',
    ticker: 'PFE',
    companyName: 'Pfizer Inc.',
    shares: 45.6702,
    buyPrice: 29.2046,
    currency: 'USD',
    fee: 0,
    buyDate: '2025-10-01',
    fairPrice: 36.00,
    annualDivPerShare: 1.72,
    notes: 'Interactive Brokers (US7170811035)'
  },
  {
    id: 'ibkr-pos-pg',
    ticker: 'PG',
    companyName: 'Procter & Gamble Co.',
    shares: 12.2480,
    buyPrice: 152.0986,
    currency: 'USD',
    fee: 0,
    buyDate: '2025-09-15',
    fairPrice: 175.00,
    annualDivPerShare: 4.35,
    notes: 'Interactive Brokers (US7427181091)'
  },
  {
    id: 'ibkr-pos-v',
    ticker: 'V',
    companyName: 'Visa Inc. Class A',
    shares: 4.0835,
    buyPrice: 271.5797,
    currency: 'USD',
    fee: 0,
    buyDate: '2025-11-10',
    fairPrice: 420.00,
    annualDivPerShare: 2.68,
    notes: 'Interactive Brokers (US92826C8394)'
  }
];

export const IBKR_TRANSACTIONS: PortfolioTransaction[] = [
  // Closed / Realized Sales from 2026
  {
    id: 'ibkr-tx-adbe-sell',
    date: '2026-07-22',
    ticker: 'ADBE',
    type: 'Продажба',
    shares: 5.5188,
    buyPrice: 335.21,
    sellPrice: 222.02,
    currency: 'USD',
    pnlVal: -625.07,
    pnlPct: -33.77
  },
  {
    id: 'ibkr-tx-crm-sell',
    date: '2026-09-17',
    ticker: 'CRM',
    type: 'Продажба',
    shares: 5.4205,
    buyPrice: 240.02,
    sellPrice: 243.27,
    currency: 'USD',
    pnlVal: 17.61,
    pnlPct: 1.35
  },
  {
    id: 'ibkr-tx-ftnt-sell',
    date: '2026-09-01',
    ticker: 'FTNT',
    type: 'Продажба',
    shares: 5.9992,
    buyPrice: 73.80,
    sellPrice: 162.29,
    currency: 'USD',
    pnlVal: 530.48,
    pnlPct: 119.89
  },
  {
    id: 'ibkr-tx-oscr-sell',
    date: '2026-05-06',
    ticker: 'OSCR',
    type: 'Продажба',
    shares: 13.5135,
    buyPrice: 14.83,
    sellPrice: 19.12,
    currency: 'USD',
    pnlVal: 57.64,
    pnlPct: 28.93
  },
  {
    id: 'ibkr-tx-pep-sell',
    date: '2026-02-04',
    ticker: 'PEP',
    type: 'Продажба',
    shares: 28.0,
    buyPrice: 156.13,
    sellPrice: 166.13,
    currency: 'USD',
    pnlVal: 279.74,
    pnlPct: 6.40
  },

  // 2026 Purchases
  {
    id: 'ibkr-tx-adbe-buy',
    date: '2026-01-15',
    ticker: 'ADBE',
    type: 'Покупка',
    shares: 0.9844,
    buyPrice: 304.74,
    currency: 'USD'
  },
  {
    id: 'ibkr-tx-meta-buy',
    date: '2026-03-31',
    ticker: 'META',
    type: 'Покупка',
    shares: 0.3496,
    buyPrice: 572.03,
    currency: 'USD'
  },
  {
    id: 'ibkr-tx-msft-buy',
    date: '2026-02-24',
    ticker: 'MSFT',
    type: 'Покупка',
    shares: 0.7739,
    buyPrice: 387.64,
    currency: 'USD'
  },
  {
    id: 'ibkr-tx-jgpi-buy',
    date: '2026-04-13',
    ticker: 'JGPI',
    type: 'Покупка',
    shares: 20.0,
    buyPrice: 22.75,
    currency: 'EUR'
  }
];

export const IBKR_DIVIDENDS: PortfolioDividendRecord[] = [
  { id: 'ibkr-div-1', date: '2025-12-31', ticker: 'VHYL', amount: 25.13 },
  { id: 'ibkr-div-2', date: '2026-01-06', ticker: 'PEP', amount: 39.83 },
  { id: 'ibkr-div-3', date: '2026-01-08', ticker: 'CRM', amount: 2.25 },
  { id: 'ibkr-div-4', date: '2026-01-08', ticker: 'JGPI', amount: 16.33 },
  { id: 'ibkr-div-5', date: '2026-01-15', ticker: 'O', amount: 21.60 },
  { id: 'ibkr-div-6', date: '2026-02-06', ticker: 'JGPI', amount: 16.80 },
  { id: 'ibkr-div-7', date: '2026-02-12', ticker: 'AAPL', amount: 1.30 },
  { id: 'ibkr-div-8', date: '2026-02-13', ticker: 'O', amount: 21.60 },
  { id: 'ibkr-div-9', date: '2026-02-17', ticker: 'PG', amount: 12.94 },
  { id: 'ibkr-div-10', date: '2026-03-02', ticker: 'V', amount: 2.74 },
  { id: 'ibkr-div-11', date: '2026-03-06', ticker: 'JGPI', amount: 16.35 },
  { id: 'ibkr-div-12', date: '2026-03-06', ticker: 'PFE', amount: 19.64 },
  { id: 'ibkr-div-13', date: '2026-03-12', ticker: 'MSFT', amount: 1.83 },
  { id: 'ibkr-div-14', date: '2026-03-13', ticker: 'O', amount: 21.60 },
  { id: 'ibkr-div-15', date: '2026-03-16', ticker: 'GOOG', amount: 2.10 },
  { id: 'ibkr-div-16', date: '2026-03-26', ticker: 'META', amount: 0.69 },
  { id: 'ibkr-div-17', date: '2026-04-01', ticker: 'VHYL', amount: 23.43 },
  { id: 'ibkr-div-18', date: '2026-04-07', ticker: 'JGPI', amount: 14.09 },
  { id: 'ibkr-div-19', date: '2026-04-15', ticker: 'O', amount: 21.64 },
  { id: 'ibkr-div-20', date: '2026-04-23', ticker: 'CRM', amount: 2.39 },
  { id: 'ibkr-div-21', date: '2026-05-08', ticker: 'JGPI', amount: 19.96 },
  { id: 'ibkr-div-22', date: '2026-05-14', ticker: 'AAPL', amount: 1.35 },
  { id: 'ibkr-div-23', date: '2026-05-15', ticker: 'O', amount: 21.64 },
  { id: 'ibkr-div-24', date: '2026-05-15', ticker: 'PG', amount: 13.33 },
  { id: 'ibkr-div-25', date: '2026-06-01', ticker: 'V', amount: 2.74 },
  { id: 'ibkr-div-26', date: '2026-06-05', ticker: 'JGPI', amount: 40.14 },
  { id: 'ibkr-div-27', date: '2026-06-11', ticker: 'MSFT', amount: 2.53 },
  { id: 'ibkr-div-28', date: '2026-06-12', ticker: 'PFE', amount: 19.64 },
  { id: 'ibkr-div-29', date: '2026-06-15', ticker: 'GOOG', amount: 2.20 },
  { id: 'ibkr-div-30', date: '2026-06-15', ticker: 'O', amount: 21.64 },
  { id: 'ibkr-div-31', date: '2026-06-25', ticker: 'META', amount: 0.87 },
  { id: 'ibkr-div-32', date: '2026-07-01', ticker: 'VHYL', amount: 50.60 },
  { id: 'ibkr-div-33', date: '2026-07-02', ticker: 'CRM', amount: 2.39 },
  { id: 'ibkr-div-34', date: '2026-07-08', ticker: 'JGPI', amount: 23.09 },
  { id: 'ibkr-div-35', date: '2026-07-15', ticker: 'O', amount: 21.68 },
  { id: 'ibkr-div-36', date: '2026-08-07', ticker: 'JGPI', amount: 19.76 },
  { id: 'ibkr-div-37', date: '2026-08-13', ticker: 'AAPL', amount: 1.35 },
  { id: 'ibkr-div-38', date: '2026-08-14', ticker: 'O', amount: 21.68 },
  { id: 'ibkr-div-39', date: '2026-08-17', ticker: 'PG', amount: 13.33 },
  { id: 'ibkr-div-40', date: '2026-09-01', ticker: 'PFE', amount: 19.64 },
  { id: 'ibkr-div-41', date: '2026-09-01', ticker: 'V', amount: 2.74 },
  { id: 'ibkr-div-42', date: '2026-09-04', ticker: 'JGPI', amount: 23.62 },
  { id: 'ibkr-div-43', date: '2026-09-10', ticker: 'MSFT', amount: 2.53 },
  { id: 'ibkr-div-44', date: '2026-09-14', ticker: 'GOOG', amount: 2.20 },
  { id: 'ibkr-div-45', date: '2026-09-15', ticker: 'O', amount: 21.68 },
  { id: 'ibkr-div-46', date: '2026-09-28', ticker: 'META', amount: 0.87 },
  { id: 'ibkr-div-47', date: '2026-09-30', ticker: 'VHYL', amount: 28.36 },
  { id: 'ibkr-div-48', date: '2026-10-07', ticker: 'JGPI', amount: 17.99 },
  { id: 'ibkr-div-49', date: '2026-10-08', ticker: 'CRM', amount: 2.39 },
  { id: 'ibkr-div-50', date: '2026-10-15', ticker: 'O', amount: 21.72 },
  { id: 'ibkr-div-51', date: '2026-10-23', ticker: 'JGPI', amount: 14.76 }
];
