/**
 * High-fidelity sector mapping of common tickers to sectors in Bulgarian
 */
export function getSectorForStock(ticker: string, customSector?: string, companyName?: string): string {
  // If the user entered a custom sector, keep it!
  if (
    customSector &&
    customSector.trim() !== '' &&
    customSector.trim() !== 'Линк' &&
    !customSector.trim().startsWith('http')
  ) {
    return customSector.trim();
  }

  const t = ticker.toUpperCase().trim();
  
  const sectorMap: Record<string, string> = {
    // Technology / Софтуер / Хардуер
    'AAPL': 'Технологии',
    'MSFT': 'Технологии',
    'GOOGL': 'Технологии',
    'GOOG': 'Технологии',
    'META': 'Технологии',
    'NVDA': 'Технологии',
    'ACIW': 'Технологии',
    'ACN': 'Технологии',
    'ADBE': 'Технологии',
    'ADI': 'Технологии',
    'AMAT': 'Технологии',
    'AMD': 'Технологии',
    'ANET': 'Технологии',
    'APH': 'Технологии',
    'ASML': 'Технологии',
    'AVGO': 'Технологии',
    'CRM': 'Технологии',
    'CRWD': 'Технологии',
    'CSCO': 'Технологии',
    'INTC': 'Технологии',
    'NOW': 'Технологии',
    'ORCL': 'Технологии',
    'QCOM': 'Технологии',
    'TXN': 'Технологии',
    'IBM': 'Технологии',
    'PANW': 'Технологии',
    'SNOW': 'Технологии',
    'DDOG': 'Технологии',
    'PLTR': 'Технологии',
    'FTNT': 'Технологии',
    'MCHP': 'Технологии',
    'MU': 'Технологии',
    'MRVL': 'Технологии',
    'SWKS': 'Технологии',
    'QRVO': 'Технологии',
    'STX': 'Технологии',
    'WDC': 'Технологии',
    'TEAM': 'Технологии',
    'OKTA': 'Технологии',
    'SPLK': 'Технологии',
    'TSMC': 'Технологии',
    'LRCX': 'Технологии',
    'KLAC': 'Технологии',
    'SNPS': 'Технологии',
    'CDNS': 'Технологии',
    'WDAY': 'Технологии',
    'ROP': 'Технологии',
    'ADSK': 'Технологии',
    'DD': 'Технологии',
    'STG': 'Технологии',

    // Healthcare / Здравеопазване / Фармация
    'ABBV': 'Здравеопазване',
    'ABT': 'Здравеопазване',
    'AMGN': 'Здравеопазване',
    'AZN': 'Здравеопазване',
    'BMY': 'Здравеопазване',
    'CPRX': 'Здравеопазване',
    'JNJ': 'Здравеопазване',
    'LLY': 'Здравеопазване',
    'UNH': 'Здравеопазване',
    'PFE': 'Здравеопазване',
    'MRK': 'Здравеопазване',
    'TMO': 'Здравеопазване',
    'DHR': 'Здравеопазване',
    'SYK': 'Здравеопазване',
    'ISRG': 'Здравеопазване',
    'REGN': 'Здравеопазване',
    'VRTX': 'Здравеопазване',
    'HCA': 'Здравеопазване',
    'GILD': 'Здравеопазване',
    'CNC': 'Здравеопазване',
    'MCK': 'Здравеопазване',
    'COR': 'Здравеопазване',
    'CAH': 'Здравеопазване',
    'HUM': 'Здравеопазване',
    'CI': 'Здравеопазване',
    'ELV': 'Здравеопазване',
    'CVS': 'Здравеопазване',
    'BSX': 'Здравеопазване',
    'BDX': 'Здравеопазване',
    'MDT': 'Здравеопазване',
    'EW': 'Здравеопазване',
    'ZTS': 'Здравеопазване',
    'ALGN': 'Здравеопазване',
    'IDXX': 'Здравеопазване',
    'IQV': 'Здравеопазване',
    'MTD': 'Здравеопазване',
    'BAX': 'Здравеопазване',
    'VTRS': 'Здравеопазване',
    'BNTX': 'Здравеопазване',
    'MRNA': 'Здравеопазване',

    // Consumer Discretionary / Потребителски стоки / Търговия
    'ABNB': 'Потребителски стоки',
    'AMZN': 'Потребителски стоки',
    'BBY': 'Потребителски стоки',
    'BKNG': 'Потребителски стоки',
    'BRBY': 'Потребителски стоки',
    'CMG': 'Потребителски стоки',
    'CROX': 'Потребителски стоки',
    'HD': 'Потребителски стоки',
    'LOW': 'Потребителски стоки',
    'NKE': 'Потребителски стоки',
    'MCD': 'Потребителски стоки',
    'SBUX': 'Потребителски стоки',
    'TJX': 'Потребителски стоки',
    'TGT': 'Потребителски стоки',
    'DG': 'Потребителски стоки',
    'TSLA': 'Потребителски стоки',
    'F': 'Потребителски стоки',
    'GM': 'Потребителски стоки',
    'MAR': 'Потребителски стоки',
    'HLT': 'Потребителски стоки',
    'RCL': 'Потребителски стоки',
    'CCL': 'Потребителски стоки',
    'NCLH': 'Потребителски стоки',
    'EXPE': 'Потребителски стоки',
    'EBAY': 'Потребителски стоки',
    'ETSY': 'Потребителски стоки',
    'DASH': 'Потребителски стоки',
    'WMT': 'Потребителски стоки',
    'YUM': 'Потребителски стоки',
    'DPZ': 'Потребителски стоки',
    'NVR': 'Потребителски стоки',
    'LEN': 'Потребителски стоки',
    'DHI': 'Потребителски стоки',
    'PHM': 'Потребителски стоки',
    'GRUB': 'Потребителски стоки',

    // Consumer Staples / Основни потребителски стоки
    'ADM': 'Основни стоки',
    'BTI': 'Основни стоки',
    'CALM': 'Основни стоки',
    'CHD': 'Основни стоки',
    'CL': 'Основни стоки',
    'COST': 'Основни стоки',
    'KO': 'Основни стоки',
    'PEP': 'Основни стоки',
    'PG': 'Основни стоки',
    'MO': 'Основни стоки',
    'PM': 'Основни стоки',
    'MDLZ': 'Основни стоки',
    'EL': 'Основни стоки',
    'CLX': 'Основни стоки',
    'KHC': 'Основни стоки',
    'GIS': 'Основни стоки',
    'HSY': 'Основни стоки',
    'KR': 'Основни стоки',
    'SYY': 'Основни стоки',
    'STZ': 'Основни стоки',
    'MKC': 'Основни стоки',
    'K': 'Основни стоки',
    'HRL': 'Основни стоки',
    'TSN': 'Основни стоки',

    // Industrials / Индустриални стоки и услуги / Отбрана
    'CAT': 'Индустрия',
    'GE': 'Индустрия',
    'HON': 'Индустрия',
    'LMT': 'Индустрия',
    'BA': 'Индустрия',
    'UNP': 'Индустрия',
    'UPS': 'Индустрия',
    'FDX': 'Индустрия',
    'DE': 'Индустрия',
    'RTX': 'Индустрия',
    'NOC': 'Индустрия',
    'GD': 'Индустрия',
    'LHX': 'Индустрия',
    'PWR': 'Индустрия',
    'ETN': 'Индустрия',
    'ITW': 'Индустрия',
    'CSX': 'Индустрия',
    'NSC': 'Индустрия',
    'GWW': 'Индустрия',
    'FAST': 'Индустрия',
    'CINT': 'Индустрия',
    'MMM': 'Индустрия',
    'ADP': 'Индустрия',
    'EMR': 'Индустрия',
    'WM': 'Индустрия',
    'RSG': 'Индустрия',
    'VFC': 'Индустрия',

    // Financials / Финанси
    'JPM': 'Финанси',
    'BAC': 'Финанси',
    'MS': 'Финанси',
    'GS': 'Финанси',
    'WFC': 'Финанси',
    'C': 'Финанси',
    'V': 'Финанси',
    'MA': 'Финанси',
    'AXP': 'Финанси',
    'DFS': 'Финанси',
    'PYPL': 'Финанси',
    'COF': 'Финанси',
    'BLK': 'Финанси',
    'SCHW': 'Финанси',
    'CME': 'Финанси',
    'ICE': 'Финанси',
    'SPGI': 'Финанси',
    'MCO': 'Финанси',
    'MMC': 'Финанси',
    'AON': 'Финанси',
    'CB': 'Финанси',
    'MET': 'Финанси',
    'PRU': 'Финанси',
    'ALL': 'Финанси',
    'PGR': 'Финанси',
    'TRV': 'Финанси',
    'AIG': 'Финанси',
    'TROW': 'Финанси',
    'FITB': 'Финанси',
    'KEY': 'Финанси',
    'HBAN': 'Финанси',
    'USB': 'Финанси',
    'PNC': 'Финанси',

    // Utilities / Комунални услуги / Водоснабдяване / Електричество
    'AWK': 'Комунални услуги',
    'CEG': 'Енергетика',
    'SO': 'Комунални услуги',
    'DUK': 'Комунални услуги',
    'NEE': 'Комунални услуги',
    'D': 'Комунални услуги',
    'AEP': 'Комунални услуги',
    'PEG': 'Комунални услуги',
    'EXC': 'Комунални услуги',
    'PCG': 'Комунални услуги',
    'SRE': 'Комунални услуги',
    'ED': 'Комунални услуги',
    'WEC': 'Комунални услуги',
    'EIX': 'Комунални услуги',

    // Energy / Енергетика / Нефт и газ
    'XOM': 'Енергетика',
    'CVX': 'Енергетика',
    'COP': 'Енергетика',
    'SLB': 'Енергетика',
    'HAL': 'Енергетика',
    'BKR': 'Енергетика',
    'MPC': 'Енергетика',
    'PSX': 'Енергетика',
    'VLO': 'Енергетика',
    'OXY': 'Енергетика',
    'EOG': 'Енергетика',
    'PXD': 'Енергетика',
    'HES': 'Енергетика',
    'KMI': 'Енергетика',
    'WMB': 'Енергетика',

    // Materials / Суровини / Материали
    'ALB': 'Суровини',
    'FCX': 'Суровини',
    'NEM': 'Суровини',
    'APD': 'Суровини',
    'LIN': 'Суровини',
    'ECL': 'Суровини',
    'SHW': 'Суровини',
    'PPG': 'Суровини',
    'CTVA': 'Суровини',
    'MOS': 'Суровини',
    'CF': 'Суровини',
    'NUE': 'Суровини',
    'STLD': 'Суровини',
    'MLM': 'Суровини',
    'VMC': 'Суровини',
    'DOW': 'Суровини',
    'FMC': 'Суровини',

    // Communication Services / Комуникации / Медии / Развлечения
    'CHTR': 'Комуникации',
    'CMCSA': 'Комуникации',
    'NFLX': 'Комуникации',
    'DIS': 'Комуникации',
    'T': 'Комуникации',
    'VZ': 'Комуникации',
    'TMUS': 'Комуникации',
    'ROKU': 'Комуникации',
    'SPOT': 'Комуникации',
    'EA': 'Комуникации',
    'TTWO': 'Комуникации',
    'ATVI': 'Комуникации',
    'PARA': 'Комуникации',
    'FOXA': 'Комуникации',
    'FOX': 'Комуникации',
    'IPG': 'Комуникации',
    'OMC': 'Комуникации',
    'WBD': 'Комуникации',

    // Real Estate / Недвижими имоти
    'AMT': 'Недвижими имоти',
    'CCI': 'Недвижими имоти',
    'PLD': 'Недвижими имоти',
    'EQIX': 'Недвижими имоти',
    'PSA': 'Недвижими имоти',
    'SPG': 'Недвижими имоти',
    'O': 'Недвижими имоти',
    'DLR': 'Недвижими имоти',
    'WELL': 'Недвижими имоти',
    'AVB': 'Недвижими имоти',
    'EQR': 'Недвижими имоти',
    'VHQ': 'Недвижими имоти',
  };

  if (sectorMap[t]) {
    return sectorMap[t];
  }

  // Smart fallback based on keyword guesses if ticker not matched
  const nameUpper = (companyName || '').toUpperCase();
  if (
    nameUpper.includes('PHARM') ||
    nameUpper.includes('BIOTECH') ||
    nameUpper.includes('MEDIC') ||
    nameUpper.includes('HEALTH') ||
    nameUpper.includes('THERAPEUT')
  ) {
    return 'Здравеопазване';
  }
  if (
    nameUpper.includes('TECH') ||
    nameUpper.includes('SOFTWARE') ||
    nameUpper.includes('MICRO') ||
    nameUpper.includes('SYSTEM') ||
    nameUpper.includes('SEMICONDUCTOR') ||
    nameUpper.includes('COMPUT')
  ) {
    return 'Технологии';
  }
  if (
    nameUpper.includes('BANK') ||
    nameUpper.includes('FINANC') ||
    nameUpper.includes('INSUR') ||
    nameUpper.includes('MUTUAL') ||
    nameUpper.includes('CAPITAL') ||
    nameUpper.includes('INVEST')
  ) {
    return 'Финанси';
  }
  if (
    nameUpper.includes('ENERGY') ||
    nameUpper.includes('OIL') ||
    nameUpper.includes('GAS') ||
    nameUpper.includes('PETROLEUM')
  ) {
    return 'Енергетика';
  }
  if (
    nameUpper.includes('POWER') ||
    nameUpper.includes('WATER') ||
    nameUpper.includes('ELECTRI') ||
    nameUpper.includes('UTILITY')
  ) {
    return 'Комунални услуги';
  }
  if (
    nameUpper.includes('FOOD') ||
    nameUpper.includes('BEVERAGE') ||
    nameUpper.includes('SUPERMARKET') ||
    nameUpper.includes('TOBACCO')
  ) {
    return 'Основни стоки';
  }
  if (
    nameUpper.includes('RETAIL') ||
    nameUpper.includes('STORE') ||
    nameUpper.includes('MOTOR') ||
    nameUpper.includes('AUTO') ||
    nameUpper.includes('HOTEL') ||
    nameUpper.includes('ENTERTAIN')
  ) {
    return 'Потребителски стоки';
  }
  if (
    nameUpper.includes('INDUSTRI') ||
    nameUpper.includes('AIR') ||
    nameUpper.includes('RAIL') ||
    nameUpper.includes('SHIP') ||
    nameUpper.includes('AERO') ||
    nameUpper.includes('DEFENS')
  ) {
    return 'Индустрия';
  }
  if (
    nameUpper.includes('COMMUNICAT') ||
    nameUpper.includes('TELECOM') ||
    nameUpper.includes('MEDIA') ||
    nameUpper.includes('NETFLIX') ||
    nameUpper.includes('DISNEY')
  ) {
    return 'Комуникации';
  }
  if (
    nameUpper.includes('PROPERT') ||
    nameUpper.includes('REALTY') ||
    nameUpper.includes('ESTATE') ||
    nameUpper.includes('REIT')
  ) {
    return 'Недвижими имоти';
  }

  return 'Други';
}

/**
 * Formats a dividend value and its percentage dynamically.
 * e.g., converts "2.47" into "2.47 (2.64%)" based on currentPrice
 */
export function formatDividend(dividendStr: string | null | undefined, currentPrice: number): string {
  if (!dividendStr) return '-';
  
  const trimmed = dividendStr.trim();
  if (trimmed === '' || trimmed === '0' || trimmed === '0.00' || trimmed === '0.00%') return '-';
  
  // If it already has the percentage format e.g., "2.47 (2.64%)", return it with $ prefix if missing
  if (trimmed.includes('(') && trimmed.includes('%')) {
    if (!trimmed.startsWith('$')) {
      return `$${trimmed}`;
    }
    return trimmed;
  }
  
  // Extract the numeric absolute dividend value
  // e.g., "2.47$", "2.47", " 2.47 "
  const cleanNumeric = trimmed.replace(/[$\s]/g, '');
  const val = parseFloat(cleanNumeric);
  
  if (isNaN(val) || val <= 0) {
    if (!trimmed.startsWith('$')) {
      return `$${trimmed}`;
    }
    return trimmed; // fallback to original string if not a valid positive number
  }
  
  if (currentPrice > 0) {
    const yieldPct = (val / currentPrice) * 100;
    return `$${val.toFixed(2)} (${yieldPct.toFixed(2)}%)`;
  }
  
  return `$${val.toFixed(2)}`;
}
