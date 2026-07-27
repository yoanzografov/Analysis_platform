// scratch/test-esbuild3.ts
var yfModule = require("yahoo-finance2");
var YahooFinance = yfModule.default || yfModule;
var yahooFinance = new YahooFinance();
(async () => {
  try {
    const res = await yahooFinance.quote(["QCOM"]);
    console.log("QCOM:", res[0]?.regularMarketPrice);
  } catch (e) {
    console.error(e.message);
  }
})();
