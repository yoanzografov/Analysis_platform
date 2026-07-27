const { default: YahooFinance } = require('yahoo-finance2');
const yahooFinance = new YahooFinance();

yahooFinance.quote(['QCOM']).then(res => {
  console.log("Result:", res[0].regularMarketPrice);
}).catch(err => {
  console.error("Error:", err);
});
