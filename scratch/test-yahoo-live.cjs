const { default: YahooFinance } = require('yahoo-finance2');
const yahooFinance = new YahooFinance();

(async () => {
  try {
    const res = await yahooFinance.quote(['QCOM']);
    console.log("QCOM price:", res[0]?.regularMarketPrice);
  } catch (err) {
    console.error("Error fetching QCOM:", err);
  }
})();
