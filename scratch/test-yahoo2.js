import yahooFinance from 'yahoo-finance2';
yahooFinance.quote(['QCOM']).then(res => {
  console.log("Result:", res[0].regularMarketPrice);
}).catch(err => {
  console.error("Error:", err);
});
