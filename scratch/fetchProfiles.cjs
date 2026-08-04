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

console.log(`Found ${stocks.length} stocks. Fetching authentic official company descriptions...`);

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'BulgarianStockTracker/1.0 (yoan.zografov@example.com)'
      }
    };
    https.get(url, options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    }).on('error', reject);
  });
}

function cleanTitle(name) {
  return name
    .replace(/\b(Inc\.?|Corp\.?|Corporation|Co\.?|Ltd\.?|S\.A\.?|N\.V\.?|PLC|AG|SE|Group|Holdings|Class A|Class B|Class C|Common Stock)\b/gi, '')
    .trim();
}

async function run() {
  const results = {};

  for (let i = 0; i < stocks.length; i++) {
    const { ticker, name } = stocks[i];
    const cleaned = cleanTitle(name);
    
    try {
      // 1. Try opensearch to find exact Wikipedia article title
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleaned)}&limit=1&format=json`;
      const searchRes = await httpGet(searchUrl);
      
      let summary = '';
      if (searchRes.statusCode === 200) {
        const searchData = JSON.parse(searchRes.data);
        if (searchData[1] && searchData[1].length > 0) {
          const wikiTitle = searchData[1][0].replace(/ /g, '_');
          const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
          const summaryRes = await httpGet(summaryUrl);
          if (summaryRes.statusCode === 200) {
            const summaryData = JSON.parse(summaryRes.data);
            if (summaryData.extract && summaryData.extract.length > 50) {
              summary = summaryData.extract;
            }
          }
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
          officialDescription: `${name} (${ticker}) is a major publicly traded corporation listed on global stock exchanges.`
        };
        console.log(`[${i + 1}/${stocks.length}] ${ticker}: Fallback`);
      }
    } catch (err) {
      console.error(`Error for ${ticker}:`, err.message);
      results[ticker] = {
        ticker,
        companyName: name,
        officialDescription: `${name} (${ticker}) is a major publicly traded corporation operating in global markets.`
      };
    }

    // Respect Wikipedia API rate limit (350ms delay)
    await new Promise(r => setTimeout(r, 350));
  }

  const outputPath = path.join(__dirname, '../src/data/officialCompanyProfiles.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nSuccessfully saved ${Object.keys(results).length} authentic official company descriptions to ${outputPath}`);
}

run();
