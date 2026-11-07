import {
  Dcf10State,
  EvEbitdaState,
  FcfMultipleState,
  MultipleModelsState,
  OverviewState,
  PeSheetState,
  PeterLynchState,
  StockValuationState,
} from './models';
import { DEFAULT_SYK_PRICE_HISTORY } from './priceHistoryData';

export interface SuiteState {
  overview: OverviewState;
  dcf10: Dcf10State;
  fcfMultiple: FcfMultipleState;
  evEbitda: EvEbitdaState;
  pe: PeSheetState;
  dividends: FcfMultipleState;
  peterLynch: PeterLynchState;
  multipleModels: MultipleModelsState;
  randomMultiple: PeSheetState;
  stockValuation: StockValuationState;
}

export function createDefaultSuiteState(): SuiteState {
  return {
    // 1. Overview
    overview: {
      symbol: 'SYK',
      exchange: '',
      dataDate: '2026-10-01',
      companyName: 'Stryker Corp',
      return3Y: null,
      return5Y: null,
      return10Y: null,
      currentPrice: 301.85,
      change: -4.49,
      changePct: -0.0147,
      low52: 267,
      high52: 389.33,
      marketCap: 115819841.8,
      shares: 383573,
      peRatio: 31.29,
      eps: 9.65,
      beta: 0.77,
      dividendYield: '12.54%',
      roi1: { invested: 38, returned: 337, years: 10 },
      roi2: { invested: 32.31, returned: 23.34, years: 10 },
      priceHistory: DEFAULT_SYK_PRICE_HISTORY,
    },

    // 2. DCF 10 years
    dcf10: {
      company: 'SYK',
      marketPrice: 301.85,
      dataDate: '2026-10-01',
      sharesOutstanding: 383573,
      startYear: 2026,
      scenarios: {
        optimistic: {
          discountRate: 0.1,
          growth1to5: 0.1,
          growth5to10: 0.1,
          terminalParam: 0.03,
          marginOfSafety: 0.1,
          baseMetric: 4283000,
        },
        average: {
          discountRate: 0.1,
          growth1to5: 0.05,
          growth5to10: 0.05,
          terminalParam: 0.03,
          marginOfSafety: 0.1,
          baseMetric: 4283000,
        },
        worst: {
          discountRate: 0.1,
          growth1to5: 0.03,
          growth5to10: 0.03,
          terminalParam: 0.03,
          marginOfSafety: 0.1,
          baseMetric: 4283000,
        },
      },
      weights: { optimistic: 0.25, average: 0.5, worst: 0.25 },
      marketCapDcf: 104680936.125,
      mcWeights: { optimistic: 0.25, average: 0.5, worst: 0.25 },
      billionsInput: 0,
      trillionsInput: 1.68,
      roi1: { invested: 1425000, returned: 2790000, years: 5 },
      roi2: { invested: 1425000, returned: 4283000, years: 10 },
      fcfHistory: {
        startYear: 2016,
        values: [
          711000, 1425000, 961000, 2038000, 1542000, 2790000, 2738000, 2036000,
          3136000, 3487000, 4283000,
        ],
      },
      revenueHistory: {
        startYear: 2016,
        values: [
          9946000, 11325000, 12444000, 13601000, 14884000, 14351000, 17108000,
          18449000, 20498000, 22595000, 25116000,
        ],
      },
    },

    // 3. FCF Multiple
    fcfMultiple: {
      company: 'SYK',
      marketCap: 105647508.58,
      dataDate: '2026-10-01',
      baseValue: 4283000,
      startYear: 2026,
      scenarios: {
        optimistic: {
          discountRate: 0.1,
          growth1to5: 0.1,
          growth5to10: 0.1,
          terminalParam: 15,
          marginOfSafety: 0.1,
        },
        average: {
          discountRate: 0.1,
          growth1to5: 0.08,
          growth5to10: 0.08,
          terminalParam: 12,
          marginOfSafety: 0.1,
        },
        worst: {
          discountRate: 0.1,
          growth1to5: 0.03,
          growth5to10: 0.03,
          terminalParam: 5,
          marginOfSafety: 0.1,
        },
      },
      weights: { optimistic: 0.25, average: 0.5, worst: 0.25 },
      perShareWeights: { optimistic: 0.25, average: 0.5, worst: 0.25 },
      sharesOutstanding: 383573,
      marketPrice: 272.98,
      billionsInput: 0,
      trillionsInput: 0,
      roi1: { invested: 5618, returned: 71611, years: 5 },
      roi2: { invested: 23724, returned: 71611, years: 10 },
      fcfHistory: {
        startYear: 2016,
        values: [
          711000, 1425000, 961000, 2038000, 1542000, 2790000, 2738000, 2036000,
          3136000, 3487000, 4283000,
        ],
      },
    },

    // 4. EV/EBITDA
    evEbitda: {
      company: 'SYK',
      marketPrice: 273.11,
      dataDate: '2026-10-01',
      sharesOutstanding: 383573,
      startYear: 2026,
      scenarios: {
        optimistic: {
          discountRate: 0.1,
          growth1to5: 0.1,
          growth5to10: 0.1,
          terminalParam: 25,
          marginOfSafety: 0.1,
          baseMetric: 6082000,
        },
        average: {
          discountRate: 0.1,
          growth1to5: 0.05,
          growth5to10: 0.05,
          terminalParam: 20,
          marginOfSafety: 0.1,
          baseMetric: 6082000,
        },
        worst: {
          discountRate: 0.1,
          growth1to5: 0.03,
          growth5to10: 0.03,
          terminalParam: 15,
          marginOfSafety: 0.1,
          baseMetric: 6082000,
        },
      },
      weights: { optimistic: 0.25, average: 0.5, worst: 0.25 },
      marketCapDcf: 104680936.125,
      roi1: { invested: 2721000, returned: 3035000, years: 5 },
      roi2: { invested: 2721000, returned: 6082000, years: 10 },
      ebitdaHistory: {
        startYear: 2016,
        values: [
          2258000, 2721000, 2939000, 3260000, 3491000, 3035000, 3574000,
          3839000, 4916000, 4739000, 6082000,
        ],
      },
    },

    // 5. P/E
    pe: {
      company: 'SYK',
      marketPrice: 173.26,
      dataDate: '2026-10-01',
      baseValue: 9.65,
      startYear: 2026,
      scenarios: {
        optimistic: {
          discountRate: 0.1,
          growth1to5: 0.07,
          growth5to10: 0.07,
          terminalParam: 30,
          marginOfSafety: 0.1,
        },
        average: {
          discountRate: 0.1,
          growth1to5: 0.05,
          growth5to10: 0.05,
          terminalParam: 20,
          marginOfSafety: 0.1,
        },
        worst: {
          discountRate: 0.1,
          growth1to5: 0.03,
          growth5to10: 0.03,
          terminalParam: 10,
          marginOfSafety: 0.1,
        },
      },
      weights: { optimistic: 0.25, average: 0.5, worst: 0.25 },
      roi1: { invested: 4.4, returned: 4.26, years: 5 },
      roi2: { invested: 4.4, returned: 8.49, years: 10 },
      peHistory: {
        startYear: 2016,
        values: [3.82, 4.4, 2.73, 9.5, 5.57, 4.26, 5.29, 6.23, 8.34, 7.86, 8.49],
      },
      verticalHistory: [],
    },

    // 6. Dividends
    dividends: {
      company: 'SYK',
      marketCap: 0, // Market Price in Dividends sheet
      dataDate: '2026-10-01',
      baseValue: 0,
      startYear: 2026,
      scenarios: {
        optimistic: {
          discountRate: 0.1,
          growth1to5: 0,
          growth5to10: 0,
          terminalParam: 0,
          marginOfSafety: 0.1,
        },
        average: {
          discountRate: 0.1,
          growth1to5: 0,
          growth5to10: 0,
          terminalParam: 0,
          marginOfSafety: 0.1,
        },
        worst: {
          discountRate: 0.1,
          growth1to5: 0,
          growth5to10: 0,
          terminalParam: 0,
          marginOfSafety: 0.1,
        },
      },
      weights: { optimistic: 0.2, average: 0.6, worst: 0.2 },
      perShareWeights: { optimistic: 0.2, average: 0.6, worst: 0.2 },
      sharesOutstanding: 383573,
      marketPrice: 0,
      billionsInput: 0,
      trillionsInput: 0,
      roi1: { invested: 4.19, returned: 5.2, years: 5 },
      roi2: { invested: 2.95, returned: 5.2, years: 10 },
      fcfHistory: {
        startYear: 2016,
        values: [null, null, null, null, null, null, null, null, null, null, null],
      },
    },

    // 7. Peter Lynch Fair Value
    peterLynch: {
      ticker: 'SYK',
      dataDate: '2026-10-01',
      years5: [2020, 2021, 2022, 2023, 2024, 2025],
      netIncome5: [1599000, 1994000, 2358000, 3165000, 2993000, 3246000],
      growthRateInput: 16.04,
      epsTtm: 9.65,
      peg: 1,
      stockPrice: 301.85,
      netIncome10: {
        startYear: 2016,
        values: [
          3230000, 6686000, 6590000, 8486000, 10231000, 13230000, 12472000,
          11857000, 10901000, 12188000, 14859000,
        ],
      },
    },

    // 8. Multiple Models
    multipleModels: {
      peers: [
        {
          ticker: 'ABT',
          company: 'Abbott Laboratories',
          stockPrice: 103.19,
          eps: 2.7,
        },
        {
          ticker: 'MDT',
          company: 'Medtronic PLC',
          stockPrice: 94.31,
          eps: 4.06,
        },
        {
          ticker: 'BSX',
          company: 'Boston Scientific Corp',
          stockPrice: 45.01,
          eps: 2.47,
        },
        {
          ticker: 'EW',
          company: 'Edwards Lifesciences Corp',
          stockPrice: 90.63,
          eps: 1.73,
        },
      ],
      targetTicker: 'SYK',
      targetCompany: 'Stryker Corp',
      targetCurrentPrice: 302.33,
      targetEps: 9.65,
    },

    // 9. Random Multiple
    randomMultiple: {
      company: 'SYK',
      marketPrice: 2125683.722, // Market Cap in Random Multiple
      dataDate: '2026-10-01',
      baseValue: 1159897, // Revenue
      startYear: 2026,
      scenarios: {
        optimistic: {
          discountRate: 0.1,
          growth1to5: 0.07,
          growth5to10: 0.07,
          terminalParam: 14,
          marginOfSafety: 0.1,
        },
        average: {
          discountRate: 0.1,
          growth1to5: 0.05,
          growth5to10: 0.05,
          terminalParam: 7,
          marginOfSafety: 0.1,
        },
        worst: {
          discountRate: 0.1,
          growth1to5: 0.03,
          growth5to10: 0.03,
          terminalParam: 5,
          marginOfSafety: 0.1,
        },
      },
      weights: { optimistic: 0.1, average: 0.6, worst: 0.3 },
      roi1: { invested: 24040, returned: 26581, years: 5 },
      roi2: { invested: 25058, returned: 26113, years: 10 },
      peHistory: {
        startYear: 2016,
        values: [null, null, null, null, null, null, null, null, null, null, null],
      },
      verticalHistory: [
        { year: 2024, value: 26113 },
        { year: 2023, value: 24581 },
        { year: 2022, value: 27095 },
        { year: 2021, value: 26804 },
        { year: 2020, value: 24040 },
        { year: 2019, value: 25012 },
        { year: 2018, value: 26544 },
        { year: 2017, value: 24634 },
        { year: 2016, value: 24651 },
        { year: 2015, value: 23622 },
        { year: 2014, value: 25058 },
        { year: 2013, value: 20131 },
      ],
    },

    // 10. Stock Valuation
    stockValuation: {
      company: 'Stryker Corp',
      ticker: 'SYK',
      dataDate: '2026-10-01',
      industry: 'Medical Devices',
      sector: 'Healthcare',
      currentPrice: 301.85,
      low52: 267,
      high52: 389.33,
      marketCap: 115819841.8,
      peRatio: 31.29,
      peComment: 'Високо',
      priceToFcf: 27.04,
      dividendYield: '1.25%',
      dividendPayoutRatio: '33.16%',
      cashDividendPayoutRatio: 'N/A',
      dividendGrowth5to10: 'N/A',
      roi5YAnnualized: 0.2438976016,
      roi10YAnnualized: -0.03199769963,
      sharesOutstanding: 383573,
      revenue: 1159897000,
      revenueAvgIncrease3to5: null,
      grossProfitMargin: 0.1,
      rdRatio: null,
      sgaRatio: null,
      eps: 9.65,
      epsGrowth5to10: null,
      netIncome: 7457000000,
      netProfitMargin: null,
      roe: -0.0613,
      roa: 0.0156,
      roic: 0.3843,
      currentRatio: 0.76,
      longTermDebt: null,
      avgDebtIncrease10Y: null,
      longTermDebtToEquity: null,
      debtToEquity: null,
      cashFlowFromOperations: null,
      cffoIncrease5to10: null,
      freeCashFlow: 14402000000,
      fcfIncrease5to10: null,
      cashFlowCoverageRatio: null,
      operatingCashFlowRatio: null,
      cashRoa: null,
      useLinkedModels: true,
      manualModels: {
        dcf: 184.7431606,
        fcfMultiple: 182.8066045,
        evEbitda: 206.5393448,
        pe: 116.4444069,
        dividend: 0,
        multiple: 0,
      },
      modelWeights: {
        dcf: 0.3,
        fcfMultiple: 0.3,
        evEbitda: 0.2,
        pe: 0.2,
        dividend: 0,
        multiple: 0,
      },
      roi1: { invested: 81958, returned: 1159897, years: 5 },
      roi2: { invested: 987, returned: 5062, years: 10 },
      roi3: { invested: 10, returned: 20, years: 1 },
      roi4: { invested: 10, returned: 20, years: 10 },
    },
  };
}
