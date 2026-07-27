import yahooFinance from 'yahoo-finance2';
(async () => {
  try {
    const res = await yahooFinance.quote(['QCOM']);
    console.log("QCOM price:", res[0]?.regularMarketPrice);
  } catch (err) {
    console.error("Error fetching QCOM:", err);
  }
})();
