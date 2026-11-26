export default async function handler(req: any, res: any) {
  const { symbol = 'NASDAQ:GOOGL', ticker = 'GOOG' } = req.query;
  const cleanTicker = String(ticker || 'GOOG').replace(/[^A-Z0-9.-]/gi, '').toUpperCase();

  try {
    const candidates = Array.from(new Set([
      symbol,
      `NASDAQ:${cleanTicker}`,
      `NYSE:${cleanTicker}`,
      `AMEX:${cleanTicker}`
    ]));

    const [yfSummary, tvRes] = await Promise.all([
      (async () => {
        try {
          const yfMod: any = await import('yahoo-finance2');
          const YF = yfMod.default;
          const yf = typeof YF === 'function' ? new YF({ suppressNotices: ['yahooSurvey'] }) : YF;
          return await yf.quoteSummary(cleanTicker, {
            modules: ['earningsHistory', 'earningsTrend', 'calendarEvents'],
          });
        } catch {
          return null;
        }
      })(),
      fetch('https://scanner.tradingview.com/america/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        },
        body: JSON.stringify({
          symbols: { tickers: candidates },
          columns: [
            'name',                                   // 0
            'earnings_per_share_fq',                  // 1
            'earnings_per_share_forecast_next_fq',    // 2
            'earnings_per_share_surprise_fq',         // 3
            'earnings_per_share_surprise_percent_fq', // 4
            'revenue_fq',                             // 5
            'revenue_forecast_next_fq',               // 6
            'revenue_surprise_fq',                    // 7
            'revenue_surprise_percent_fq',            // 8
            'earnings_release_date',                  // 9
            'earnings_release_next_date'              // 10
          ],
        }),
      }).catch(() => null),
    ]);

    const tvData = tvRes && tvRes.ok ? await tvRes.json().catch(() => null) : null;
    const matchedItem = tvData?.data?.find((item: any) => item && item.d && item.d.some((v: any) => v !== null));
    const row = matchedItem?.d || [];

    const historyArr: any[] = Array.isArray(yfSummary?.earningsHistory?.history)
      ? yfSummary.earningsHistory.history
      : [];
    const latestHist = historyArr.length > 0 ? historyArr[historyArr.length - 1] : null;

    if (!latestHist && !matchedItem) {
      return res.status(404).json({ error: 'Ticker data not found' });
    }

    const reportedEpsVal =
      typeof latestHist?.epsActual === 'number'
        ? latestHist.epsActual
        : typeof row[1] === 'number'
          ? row[1]
          : null;

    // IMPORTANT: Never compare reported FQ EPS against next_fq forecast.
    // Use Yahoo Finance earningsHistory.epsEstimate for the SAME reported quarter,
    // or back-calculate from TradingView's actual surprise if present.
    const estimateEpsVal =
      typeof latestHist?.epsEstimate === 'number'
        ? latestHist.epsEstimate
        : typeof row[1] === 'number' && typeof row[3] === 'number'
          ? row[1] - row[3]
          : null;

    const surpriseEpsVal =
      typeof latestHist?.epsDifference === 'number'
        ? latestHist.epsDifference
        : typeof row[3] === 'number'
          ? row[3]
          : reportedEpsVal !== null && estimateEpsVal !== null
            ? reportedEpsVal - estimateEpsVal
            : null;

    const surpriseEpsPctVal =
      typeof latestHist?.surprisePercent === 'number'
        ? latestHist.surprisePercent * 100
        : typeof row[4] === 'number'
          ? row[4]
          : surpriseEpsVal !== null && estimateEpsVal !== null && estimateEpsVal !== 0
            ? (surpriseEpsVal / Math.abs(estimateEpsVal)) * 100
            : null;

    const reportedRevVal = typeof row[5] === 'number' ? row[5] : null;
    const surpriseRevVal = typeof row[7] === 'number' ? row[7] : null;
    const estimateRevVal =
      reportedRevVal !== null && surpriseRevVal !== null ? reportedRevVal - surpriseRevVal : null;
    const surpriseRevPctVal =
      typeof row[8] === 'number'
        ? row[8]
        : surpriseRevVal !== null && estimateRevVal !== null && estimateRevVal !== 0
          ? (surpriseRevVal / Math.abs(estimateRevVal)) * 100
          : null;

    const releaseTimestamp = row[9] || row[10];
    let dateStr = '—';
    let periodEndingStr = '—';

    if (releaseTimestamp) {
      const d = new Date(releaseTimestamp * 1000);
      dateStr = d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: '2-digit',
      });
    }
    if (latestHist?.quarter) {
      const qd = new Date(latestHist.quarter);
      if (!isNaN(qd.getTime())) {
        periodEndingStr = qd.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
      }
    } else if (releaseTimestamp) {
      const periodD = new Date(releaseTimestamp * 1000);
      periodD.setMonth(periodD.getMonth() - 1);
      periodEndingStr = periodD.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
    }

    const reportedEpsStr = reportedEpsVal !== null ? reportedEpsVal.toFixed(2) : '—';
    const standardizedEpsStr = reportedEpsVal !== null ? reportedEpsVal.toFixed(2) : '—';
    const estimateEpsStr = estimateEpsVal !== null ? estimateEpsVal.toFixed(2) : '—';
    const surpriseEpsStr = surpriseEpsVal !== null ? surpriseEpsVal.toFixed(2) : '—';
    const surpriseEpsPctStr = surpriseEpsPctVal !== null ? surpriseEpsPctVal.toFixed(2) : '0.00';

    const formatRevBillion = (num: number | null | undefined): string => {
      if (num === null || num === undefined) return '—';
      const absVal = Math.abs(num);
      if (absVal >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
      if (absVal >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
      return `${num.toFixed(1)}`;
    };

    const reportedRevStr = formatRevBillion(reportedRevVal);
    const estimateRevStr = formatRevBillion(estimateRevVal);
    const surpriseRevStr = formatRevBillion(surpriseRevVal);
    const surpriseRevPctStr = surpriseRevPctVal !== null ? surpriseRevPctVal.toFixed(2) : '0.00';

    const epsBeatText =
      surpriseEpsPctVal !== null
        ? `EPS ${reportedEpsStr} (${surpriseEpsPctVal >= 0 ? 'Beat' : 'Miss'} ${surpriseEpsPctVal >= 0 ? '+' : ''}${surpriseEpsPctStr}% vs est. ${estimateEpsStr})`
        : `EPS ${reportedEpsStr}`;

    const aiSummaryText = `${cleanTicker} (${periodEndingStr}): ${epsBeatText}${reportedRevVal !== null ? `, Приходи: ${reportedRevStr}` : ''}.`;

    return res.status(200).json({
      ticker: cleanTicker,
      dateStr,
      periodEndingStr,
      isAfterMarket: true,
      standardizedEps: standardizedEpsStr,
      reportedEps: reportedEpsStr,
      estimateEps: estimateEpsStr,
      surpriseEps: surpriseEpsStr,
      surpriseEpsPct: surpriseEpsPctStr,
      reportedRev: reportedRevStr,
      estimateRev: estimateRevStr,
      surpriseRev: surpriseRevStr,
      surpriseRevPct: surpriseRevPctStr,
      aiSummary: aiSummaryText,
    });
  } catch (error: any) {
    console.error('Earnings API error:', error);
    return res.status(500).json({ error: error?.message || 'Internal Server Error' });
  }
}
