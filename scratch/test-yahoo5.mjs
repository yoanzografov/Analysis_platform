import yahooFinance from 'yahoo-finance2';
yahooFinance.quote(['QCOM', 'INVALID123_XYZ']).then(res => {
  console.log("Result:", res.length);
}).catch(err => {
  console.error("Error:", err.message);
});
