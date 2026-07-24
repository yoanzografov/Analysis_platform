export function getTradingViewSymbol(name: string, ticker?: string): string {
  // First handle prefixes (used mostly for stocks)
  const gfToTvMap: Record<string, string> = {
    "EPA": "EURONEXT", "ETR": "XETR", "FRA": "FWB", "LON": "LSE", "AMS": "EURONEXT",
    "EBR": "EURONEXT", "BIT": "MIL", "BME": "BME", "VIE": "VIE", "CPH": "OMXCOP",
    "HEL": "OMXHEL", "STO": "OMXSTO", "SWX": "SIX", "OSL": "OSL", "LIS": "EURONEXT",
    "ATH": "ATHEX", "IST": "BIST", "WSE": "GPW", "PRG": "PVS", "TSE": "TSE",
    "HKG": "HKEX", "BSE": "BSE", "NSE": "NSE", "TPE": "TWSE", "ASX": "ASX",
    "NZZE": "NZX", "TSX": "TSX", "CVE": "TSXV", "JSE": "JSE"
  };

  if (ticker && ticker.includes(':')) {
    const parts = ticker.split(':');
    const prefix = parts[0];
    const rawSym = parts[1];
    if (gfToTvMap[prefix]) {
      return `${gfToTvMap[prefix]}:${rawSym}`;
    }
  }

  // Handle Indexes, Commodities, Crypto, Currencies
  const map: Record<string, string> = {
    '^GSPC': 'SP:SPX',
    '^NDX': 'NASDAQ:NDX',
    '^IXIC': 'NASDAQ:IXIC',
    '^DJI': 'CBOT:YM1!',
    '^VIX': 'CBOE:VIX',
    '^FTSE': 'TVC:UKX',
    '^FCHI': 'EURONEXT:PX1',
    '^GDAXI': 'XETR:DAX',
    '^N100': 'EURONEXT:N100',
    '^STOXX50E': 'TVC:SX5E', 
    '000001.SS': 'TVC:SHCOMP',
    '^N225': 'TSE:NI225',
    '^HSI': 'HSI:HSI',
    '^AXJO': 'ASX:XJO',
    '^KS11': 'KRX:KOSPI',
    'CL=F': 'NYMEX:CL1!',
    'BZ=F': 'TVC:UKOIL',
    'GC=F': 'COMEX:GC1!',
    'SI=F': 'COMEX:SI1!',
    'HG=F': 'COMEX:HG1!',
    'NG=F': 'NYMEX:NG1!',
    'PL=F': 'NYMEX:PL1!',
    'EURUSD=X': 'FX_IDC:EURUSD',
    'JPY=X': 'FX_IDC:USDJPY',
    'GBP=X': 'FX_IDC:USDGBP',
    'USDAUD=X': 'FX_IDC:USDAUD',
    'USDCAD=X': 'FX_IDC:USDCAD',
    'USDMXN=X': 'FX_IDC:USDMXN',
    'USDHKD=X': 'FX_IDC:USDHKD',
    'BTC-USD': 'COINBASE:BTCUSD',
  };

  if (ticker && map[ticker]) return map[ticker];

  const lookupKey = name || ticker || '';
  if (lookupKey.includes('S&P 500')) return 'SP:SPX';
  if (lookupKey.includes('Dow Jones')) return 'CBOT:YM1!';
  if (lookupKey.includes('Nasdaq')) return 'NASDAQ:NDX';
  if (lookupKey.includes('DAX')) return 'XETR:DAX';
  if (lookupKey.includes('Nikkei 225')) return 'TSE:NI225';
  if (lookupKey.includes('FTSE 100')) return 'TVC:UKX';
  if (lookupKey.includes('VIX')) return 'CBOE:VIX';
  if (lookupKey.includes('Euro STOXX 50')) return 'TVC:SX5E';
  
  // If the ticker has a prefix but wasn't caught, or doesn't have a prefix
  if (ticker && ticker.includes(':')) {
    const parts = ticker.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  
  // Clean up Yahoo symbol prefix if it wasn't caught by the map
  if (ticker && ticker.startsWith('^')) {
      return ticker.substring(1);
  }

  return ticker || name;
}
