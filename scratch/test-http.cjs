const http = require('http');

http.get('http://localhost:3000/api/stock-quotes?symbols=QCOM', (resp) => {
  let data = '';
  resp.on('data', (chunk) => {
    data += chunk;
  });
  resp.on('end', () => {
    console.log("Server Response:");
    console.log(data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
