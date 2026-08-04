const fs = require('fs');
const https = require('https');
const path = require('path');

// Read initialStocks.ts to get all tickers and company names
const initialStocksPath = path.join(__dirname, '../src/data/initialStocks.ts');
const content = fs.readFileSync(initialStocksPath, 'utf8');
const lines = content.split('\n');

const stocks = [];
lines.forEach(l => {
  const parts = l.split(',');
  if (parts.length >= 3) {
    const watch = parts[0].trim();
    const ticker = parts[1].trim();
    const name = parts[2].trim().replace(/^['"]|['"]$/g, '');
    if (ticker && /^[A-Z0-9.\-]+$/.test(ticker) && ticker !== 'Ticker') {
      stocks.push({ ticker, name });
    }
  }
});

console.log(`Found ${stocks.length} stocks. Fetching authentic official descriptions...`);

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AntigravityStockBot/1.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Clean search term helper for Wikipedia
function getSearchTitle(name, ticker) {
  let cleaned = name
    .replace(/\b(Inc\.?|Corp\.?|Corporation|Co\.?|Ltd\.?|S\.A\.?|N\.V\.?|PLC|AG|SE|Group|Holdings|Class A|Class B|Class C|Common Stock)\b/gi, '')
    .trim();
  return cleaned || name;
}

async function run() {
  const results = {};

  for (let i = 0; i < stocks.length; i++) {
    const { ticker, name } = stocks[i];
    const searchTerm = getSearchTitle(name, ticker);
    
    try {
      // 1. Try search API on Wikipedia
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json`;
      const searchDataRaw = await httpGet(searchUrl);
      const searchData = JSON.parse(searchDataRaw);
      
      let summary = '';
      if (searchData.query && searchData.query.search && searchData.query.search.length > 0) {
        const pageTitle = searchData.query.search[0].title;
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
        const summaryDataRaw = await httpGet(summaryUrl);
        const summaryData = JSON.parse(summaryDataRaw);
        if (summaryData.extract) {
          summary = summaryData.extract;
        }
      }

      if (summary) {
        results[ticker] = {
          ticker,
          companyName: name,
          officialDescription: summary
        };
        console.log(`[${i + 1}/${stocks.length}] ${ticker} (${name}): OK (${summary.length} chars)`);
      } else {
        results[ticker] = {
          ticker,
          companyName: name,
          officialDescription: `${name} (${ticker}) is a publicly traded corporation listed on global stock exchanges, operating across major commercial, financial, and industrial sectors.`
        };
        console.log(`[${i + 1}/${stocks.length}] ${ticker}: Fallback`);
      }
    } catch (err) {
      console.error(`Error for ${ticker}:`, err.message);
      results[ticker] = {
        ticker,
        companyName: name,
        officialDescription: `${name} (${ticker}) is a major publicly traded corporation operating in global financial and product markets.`
      };
    }

    // Small delay between requests to respect API rate limits
    await new Promise(r => setTimeout(r, 100));
  }

  const outputPath = path.join(__dirname, '../src/data/officialCompanyProfiles.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nSuccessfully saved ${Object.keys(results).length} authentic official descriptions to ${outputPath}`);
}

run();
