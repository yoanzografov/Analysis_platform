import yahooFinance from 'yahoo-finance2';

yahooFinance.quote(['QCOM']).then(res => {
  console.log("Result:", res);
}).catch(err => {
  console.error("Error:", err);
});
