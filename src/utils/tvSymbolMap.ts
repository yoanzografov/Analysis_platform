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

  // Handle Indexes, Commodities, Crypto, Currencies (use 100% free TVC / OANDA un-restricted symbols for widgets)
  const map: Record<string, string> = {
    // US Markets
    '^GSPC': 'OANDA:SPX500USD',
    '^NDX': 'OANDA:NAS100USD',
    '^IXIC': 'OANDA:NAS100USD',
    '^DJI': 'OANDA:US30USD',
    '^VIX': 'TVC:VIX',

    // European Markets
    '^FTSE': 'OANDA:UK100GBP',
    '^FCHI': 'OANDA:FR40EUR',
    '^GDAXI': 'OANDA:DE30EUR',
    '^N100': 'OANDA:EU50EUR',
    '^STOXX50E': 'OANDA:EU50EUR', 

    // Asian Markets
    '000001.SS': 'TVC:SHCOMP',
    '^N225': 'OANDA:JP225USD',
    '^HSI': 'OANDA:HK33HKD',
    '^AXJO': 'OANDA:AU200AUD',
    '^KS11': 'TVC:KOSPI',

    // Commodities (Free TVC spot symbols)
    'CL=F': 'TVC:USOIL',
    'BZ=F': 'TVC:UKOIL',
    'GC=F': 'TVC:GOLD',
    'SI=F': 'TVC:SILVER',
    'HG=F': 'TVC:COPPER',
    'NG=F': 'TVC:NATURALGAS',
    'PL=F': 'TVC:PLATINUM',

    // Currencies
    'EURUSD=X': 'OANDA:EURUSD',
    'JPY=X': 'OANDA:USDJPY',
    'GBP=X': 'OANDA:GBPUSD',
    'GBPUSD=X': 'OANDA:GBPUSD',
    'USDCHF=X': 'OANDA:USDCHF',
    'USDCAD=X': 'OANDA:USDCAD',
    'AUDUSD=X': 'OANDA:AUDUSD',
    'USDAUD=X': 'OANDA:USDAUD',
    'USDMXN=X': 'OANDA:USDMXN',
    'USDHKD=X': 'OANDA:USDHKD',
    'DX-Y.NYB': 'TVC:DXY',

    // Crypto
    'BTC-USD': 'COINBASE:BTCUSD',
    'ETH-USD': 'COINBASE:ETHUSD',
    'SOL-USD': 'COINBASE:SOLUSD',
    'BNB-USD': 'BINANCE:BNBUSD',
    'XRP-USD': 'COINBASE:XRPUSD',
    'ADA-USD': 'COINBASE:ADAUSD',
    'DOGE-USD': 'COINBASE:DOGEUSD',

    // Bonds
    '^TNX': 'TVC:US10Y',
    '^IRX': 'TVC:US02Y',
    '^TYX': 'TVC:US30Y',
    // Popular European ETFs & Stocks
    'XNAS': 'XETR:XNAS',
    'XNAS.DE': 'XETR:XNAS',
    'VHYL': 'AMS:VHYL',
    'VHYL.AS': 'AMS:VHYL',
    'VHYL.DE': 'XETR:VGWD',
    'VGWD': 'XETR:VGWD',
    'VGWD.DE': 'XETR:VGWD',
    'JGPI': 'XETR:JGPI',
    'JGPI.DE': 'XETR:JGPI',
    'SXR8': 'XETR:SXR8',
    'SXR8.DE': 'XETR:SXR8',
    'EUNL': 'XETR:EUNL',
    'EUNL.DE': 'XETR:EUNL',
    'VWCE': 'XETR:VWCE',
    'VWCE.DE': 'XETR:VWCE',
    'QDVE': 'XETR:QDVE',
    'QDVE.DE': 'XETR:QDVE',
    'IS3N': 'XETR:IS3N',
    'IS3N.DE': 'XETR:IS3N',
    'CSPX': 'LSE:CSPX',
    'CSPX.L': 'LSE:CSPX',
    'VUSA': 'XETR:VUSA',
    'VUSA.DE': 'XETR:VUSA',
    'MEUD': 'EURONEXT:MEUD',
    'MEUD.PA': 'EURONEXT:MEUD',
    '4GLD': 'XETR:4GLD',
    '4GLD.DE': 'XETR:4GLD',
  };

  if (ticker && map[ticker]) return map[ticker];

  const lookupKey = name || ticker || '';
  if (lookupKey.includes('S&P 500')) return 'OANDA:SPX500USD';
  if (lookupKey.includes('Dow Jones')) return 'OANDA:US30USD';
  if (lookupKey.includes('Nasdaq')) return 'OANDA:NAS100USD';
  if (lookupKey.includes('DAX')) return 'OANDA:DE30EUR';
  if (lookupKey.includes('Nikkei')) return 'OANDA:JP225USD';
  if (lookupKey.includes('FTSE')) return 'OANDA:UK100GBP';
  if (lookupKey.includes('VIX')) return 'TVC:VIX';
  if (lookupKey.includes('Euro STOXX') || lookupKey.includes('Euronext')) return 'OANDA:EU50EUR';
  if (lookupKey.includes('Hang Seng')) return 'OANDA:HK33HKD';
  if (lookupKey.includes('ASX')) return 'OANDA:AU200AUD';
  if (lookupKey.includes('KOSPI')) return 'TVC:KOSPI';
  if (lookupKey.includes('SSE')) return 'TVC:SHCOMP';
  if (lookupKey.includes('CAC')) return 'OANDA:FR40EUR';
  
  if (lookupKey.includes('Gold')) return 'TVC:GOLD';
  if (lookupKey.includes('Silver')) return 'TVC:SILVER';
  if (lookupKey.includes('Crude Oil') || lookupKey.includes('WTI')) return 'TVC:USOIL';
  if (lookupKey.includes('Brent')) return 'TVC:UKOIL';
  if (lookupKey.includes('Copper')) return 'TVC:COPPER';
  if (lookupKey.includes('Natural Gas')) return 'TVC:NATURALGAS';
  if (lookupKey.includes('Platinum')) return 'TVC:PLATINUM';
  
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
