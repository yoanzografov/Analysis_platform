import { createRequire } from 'module';
const require = createRequire(import.meta.url || 'file://');
const yfModule = require('yahoo-finance2');
const YahooFinance = yfModule.default || yfModule;
const yahooFinance = new YahooFinance();

(async () => {
  try {
    const res = await yahooFinance.quote(['QCOM']);
    console.log("QCOM:", res[0]?.regularMarketPrice);
  } catch(e) {
    console.error(e.message);
  }
})();
