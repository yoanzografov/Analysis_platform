import * as yfModule from 'yahoo-finance2';
const YahooFinance = (yfModule as any).default?.default || (yfModule as any).default || yfModule;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

(async () => {
  try {
    const res = await yahooFinance.quote(['QCOM']);
    console.log("QCOM:", res[0]?.regularMarketPrice);
  } catch(e) {
    console.error(e.message);
  }
})();
