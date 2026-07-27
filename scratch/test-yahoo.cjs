const yahooFinance = require('yahoo-finance2').default;

yahooFinance.quote(['QCOM']).then(res => {
  console.log("Result:", res);
}).catch(err => {
  console.error("Error:", err);
});
