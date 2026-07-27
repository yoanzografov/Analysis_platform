import yf from 'yahoo-finance2';
const yahooFinance = new (yf as any)();
(async () => {
  try {
    const res = await yahooFinance.quote(['QCOM']);
    console.log("QCOM:", res[0]?.regularMarketPrice);
  } catch(e) {
    console.error(e.message);
  }
})();
