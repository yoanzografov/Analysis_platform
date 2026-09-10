export default async function handler(req: any, res: any) {
  const { symbol = '', ticker = 'AAPL', company = '' } = req.query;
  const rawTicker = String(ticker || symbol || '').trim();
  const cleanTicker = rawTicker.replace(/[^A-Z0-9.:_-]/gi, '').toUpperCase();
  const baseTicker = cleanTicker.split(':')[1] || cleanTicker.split('.')[0] || cleanTicker;

  try {
    const markets = [
      'america',
      'germany',
      'france',
      'uk',
      'switzerland',
      'sweden'
    ];

    // Build ticker candidates to search in scanners
    const tickerCandidates = Array.from(new Set([
      baseTicker,
      cleanTicker,
      rawTicker.toUpperCase(),
      symbol ? String(symbol).toUpperCase() : null
    ])).filter(Boolean) as string[];

    let matchedRow: any = null;
    let matchedMarket = 'america';

    for (const market of markets) {
      try {
        const response = await fetch(`https://scanner.tradingview.com/${market}/scan`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
          },
          body: JSON.stringify({
            filter: [{ left: 'name', operation: 'in_range', right: tickerCandidates }],
            columns: [
              'name',                           // 0
              'dividend_ex_date_recent',        // 1
              'dividend_payment_date_recent',   // 2
              'dps_common_stock_prim_issue_fq', // 3
              'dps_common_stock_prim_issue_fy', // 4
              'dividends_yield_current',        // 5
              'dividend_payout_ratio_ttm',      // 6
              'currency',                       // 7
              'dividend_ex_date_fq',            // 8
              'dividend_payment_date_fq'        // 9
            ]
          })
        });

        if (!response.ok) continue;
        const json = await response.json();
        if (json.data && json.data.length > 0) {
          const found = json.data.find((item: any) => item && item.d && item.d.some((v: any) => v !== null));
          if (found) {
            matchedRow = found;
            matchedMarket = market;
            break;
          }
        }
      } catch {
        // try next market
      }
    }

    if (!matchedRow || !matchedRow.d) {
      return res.status(200).json({
        ticker: baseTicker,
        companyName: company || baseTicker,
        isDividendPayer: false,
        exDateStr: '—',
        amountStr: 'Не изплаща',
        annualAmountStr: '0.00',
        payDateStr: '—',
        yieldPctStr: '0.00%',
        payoutRatioStr: '0.00%',
        frequency: 'Няма',
        currency: 'USD',
        source: 'Scanner default'
      });
    }

    const row = matchedRow.d;
    const exTs = row[1] || row[8];
    const payTs = row[2] || row[9];
    const divFq = row[3];
    const divFy = row[4];
    const yieldVal = row[5];
    const payoutRatioVal = row[6];
    const curr = row[7] || 'USD';

    const isPayer = Boolean((divFq && divFq > 0) || (divFy && divFy > 0) || (yieldVal && yieldVal > 0) || exTs);

    const currencySymbol = curr === 'EUR' ? '€' : (curr === 'GBP' || curr === 'GBX' ? '£' : '$');

    let exDateStr = '—';
    if (exTs) {
      const d = new Date(exTs * 1000);
      exDateStr = d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: '2-digit'
      });
    } else if (isPayer) {
      exDateStr = 'Предстои';
    }

    let payDateStr = '—';
    if (payTs) {
      const d = new Date(payTs * 1000);
      payDateStr = d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: '2-digit'
      });
    } else if (isPayer) {
      payDateStr = 'Предстои';
    }

    const amountNum = (divFq && divFq > 0) ? Number(divFq) : (divFy && divFy > 0 ? Number(divFy) / 4 : 0);
    const annualAmountNum = (divFy && divFy > 0) ? Number(divFy) : (amountNum > 0 ? amountNum * 4 : 0);

    let freq = 'Тримесечно';
    if (divFq && divFy && divFq > 0) {
      const ratio = Math.round(divFy / divFq);
      if (ratio === 12) freq = 'Месечно';
      else if (ratio === 2) freq = 'Полугодишно';
      else if (ratio === 1) freq = 'Годишно';
    } else if (matchedMarket === 'germany' || matchedMarket === 'france') {
      freq = 'Годишно';
    }

    return res.status(200).json({
      ticker: baseTicker,
      companyName: company || baseTicker,
      isDividendPayer: isPayer,
      exDateStr,
      amountStr: isPayer && amountNum > 0 ? `${currencySymbol}${amountNum.toFixed(2)}` : (isPayer ? 'Да' : 'Не изплаща'),
      amountNum: isPayer ? amountNum : 0,
      annualAmountStr: isPayer && annualAmountNum > 0 ? `${currencySymbol}${annualAmountNum.toFixed(2)}` : '0.00',
      annualAmountNum: isPayer ? annualAmountNum : 0,
      payDateStr,
      yieldPctStr: yieldVal != null && yieldVal > 0 ? `${Number(yieldVal).toFixed(2)}%` : (isPayer ? '—' : '0.00%'),
      yieldPctNum: yieldVal != null ? Number(yieldVal) : 0,
      payoutRatioStr: payoutRatioVal != null && payoutRatioVal > 0 ? `${Number(payoutRatioVal).toFixed(2)}%` : (isPayer ? '—' : '0.00%'),
      payoutRatioNum: payoutRatioVal != null ? Number(payoutRatioVal) : 0,
      frequency: isPayer ? freq : 'Няма',
      currency: curr,
      source: `TradingView ${matchedMarket}`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
