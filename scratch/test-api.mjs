import fetch from 'node-fetch';

(async () => {
  const res = await fetch('http://localhost:3000/api/stock-quotes?symbols=QCOM,AAPL,MBG.DE');
  console.log(res.status);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
})();
