const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const newInitBlock = `
  // Load default CSV data or localStorage or Server data on rise and trigger instantaneous live update
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/portfolio');
        if (res.ok) {
          const serverData = await res.json();
          if (serverData && (serverData.stocks || serverData.indices || serverData.alerts)) {
            if (serverData.stocks) setStocks(serverData.stocks);
            if (serverData.indices) setIndices(serverData.indices);
            if (serverData.alerts) setAlerts(serverData.alerts);
            setIsLoaded(true);
            setLogs([
              { id: '1', timestamp: new Date().toLocaleTimeString(), ticker: 'SYS', message: 'Системата за следене на акции е стартирана успешно (от сървъра).', type: 'info' },
            ]);
            setTimeout(() => {
              fetchRealStockPricesDirect(serverData.stocks || []);
            }, 300);
            return;
          }
        }
      } catch (err) {
        console.error("Грешка при зареждане от сървъра:", err);
      }

      const savedStocks = safeLocalStorage.getItem('bulgarian_stock_tracker_stocks');
      const savedIndices = safeLocalStorage.getItem('bulgarian_stock_tracker_indices');
      const savedAlerts = safeLocalStorage.getItem('bulgarian_stock_tracker_alerts');

      let initialStocks = [];
      let initialIndices = [];
      let initialAlerts = [];

      if (savedStocks) {
        try { initialStocks = JSON.parse(savedStocks); } catch (e) { }
      }
      if (savedStocks === null) {
        const { stocks: parsedStocks } = parseCSVData(RAW_SPREADSHEET_CSV);
        initialStocks = parsedStocks;
      }

      if (savedIndices) {
        try { initialIndices = JSON.parse(savedIndices); } catch (e) { }
      }
      if (savedIndices === null) {
        const { indices: parsedIndices } = parseCSVData(RAW_SPREADSHEET_CSV);
        initialIndices = parsedIndices;
      }

      if (savedAlerts) {
        try { initialAlerts = JSON.parse(savedAlerts); } catch (e) { }
      }
      if (savedAlerts === null) {
        initialAlerts = [
          { id: '1', ticker: 'AAPL', criteria: 'ABOVE', targetPrice: 300, isActive: true, createdAt: new Date().toISOString() },
          { id: '2', ticker: 'TSLA', criteria: 'BELOW', targetPrice: 380, isActive: true, createdAt: new Date().toISOString() },
          { id: '3', ticker: 'NVDA', criteria: 'ABOVE', targetPrice: 215, isActive: true, createdAt: new Date().toISOString() },
        ];
      }

      setStocks(initialStocks);
      setIndices(initialIndices);
      setAlerts(initialAlerts);
      setIsLoaded(true);

      setLogs([
        { id: '1', timestamp: new Date().toLocaleTimeString(), ticker: 'SYS', message: 'Системата за следене на акции е стартирана успешно.', type: 'info' },
      ]);

      setTimeout(() => {
        fetchRealStockPricesDirect(initialStocks);
      }, 300);
    };

    loadData();
  }, []);
`;

const newSaveBlock = `
  // Persistence save hooks
  useEffect(() => {
    if (isLoaded) {
      safeLocalStorage.setItem('bulgarian_stock_tracker_stocks', JSON.stringify(stocks));
      safeLocalStorage.setItem('bulgarian_stock_tracker_indices', JSON.stringify(indices));
      safeLocalStorage.setItem('bulgarian_stock_tracker_alerts', JSON.stringify(alerts));

      fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stocks, indices, alerts })
      }).catch(err => console.error(err));
    }
  }, [stocks, indices, alerts, isLoaded]);
`;

// Extract using regex
const initRegex = /\/\/ Load default CSV data[\s\S]*?\}, \[\]\);/m;
const saveRegex = /\/\/ Persistence save hooks[\s\S]*?\}, \[alerts, isLoaded\]\);/m;

content = content.replace(initRegex, newInitBlock.trim());
content = content.replace(saveRegex, newSaveBlock.trim());

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('Patched App.tsx successfully.');
