export interface Stock {
  watch: string; // '', 'Atten', 'Sell', 'Watch'
  ticker: string;
  companyName: string;
  date: string;
  priceOfCalc: number | null;
  dailyChangePct: number; // e.g., 0.70 means +0.70%
  currentPrice: number;
  fairPrice: number | null;
  difference: number | null; // e.g., -63.76 %
  buySell: 'BUY' | 'SELL' | '#N/A' | string;
  marketCap: number | null;
  peRatio: number | null;
  eps: number | null;
  profileLink: string;
  dividend: string;
  signal: string; // 'Hold', 'Buy', 'Sell', etc.
  low52: number | null;
  high52: number | null;
  aiAnalysis?: string;
  calcLink?: string; // Link to Google Sheets calculation
  earningsTimestamp?: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  changePct: number;
  ticker?: string;
  changeVal?: number;
  category?: string;
}

export interface PriceAlert {
  id: string;
  ticker: string;
  criteria: 'ABOVE' | 'BELOW';
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  ticker: string;
  message: string;
  type: 'alert' | 'info' | 'success';
}

export interface TableFilter {
  type: 'all' | 'signal' | 'buySell' | 'watch' | 'ticker';
  value: string;
}

