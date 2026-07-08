import React, { useEffect } from 'react';
import { Stock } from '../types';
import { X, ExternalLink } from 'lucide-react';
import { SymbolOverview } from 'react-ts-tradingview-widgets';

interface Props {
  stock: Stock;
  onClose: () => void;
}

export default function StockDetailChartModal({ stock, onClose }: Props) {
  // ── Escape key ──
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const sym = stock.ticker.includes(':') ? stock.ticker.split(':').pop()! : stock.ticker;
  let exch = 'NASDAQ';
  if (stock.ticker.startsWith('EPA:')) exch = 'EURONEXT';
  else if (stock.ticker.startsWith('ETR:')) exch = 'XETRA';
  else if (stock.ticker.startsWith('STO:')) exch = 'OMXSTO';
  else if (stock.ticker.startsWith('SWX:')) exch = 'SIX';
  else if (stock.ticker.includes('BTC') || stock.ticker.includes('-USD')) exch = 'CRYPTO';

  const fullSymbol = `${exch}:${sym}`;

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        padding: 8,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1000,
          height: '100%',
          maxHeight: 760,
          display: 'flex',
          flexDirection: 'column',
          background: '#000',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 60px 140px rgba(0,0,0,1)',
          position: 'relative',
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 50,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.9)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* TRADINGVIEW SYMBOL OVERVIEW WIDGET */}
        <div style={{ flex: 1, width: '100%', height: '100%', padding: '48px 16px 16px 16px' }}>
          <SymbolOverview
            colorTheme="dark"
            autosize
            symbols={[[stock.companyName, fullSymbol]]}
            chartType="area"
            downColor="#ff3b30"
            borderUpColor="#30d158"
            borderDownColor="#ff3b30"
            upColor="#30d158"
            lineWidth={2}
            scalePosition="right"
            scaleMode="Normal"
            fontFamily="-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif"
            fontSize="12"
            valuesTracking="1"
            changeMode="price-and-percent"
            chartOnly={false}
            dateRanges={[
              "1d|1",
              "1w|15",
              "1m|30",
              "3m|60",
              "6m|120",
              "ytd|1D",
              "12m|1D",
              "24m|1W",
              "60m|1W",
              "120m|1M",
              "all|1M"
            ]}
          />
        </div>

        {/* FOOTER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            padding: '12px 20px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            flexShrink: 0,
          }}
        >
          <a
            href={`https://finance.yahoo.com/quote/${encodeURIComponent(sym)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: 'rgba(255,255,255,0.25)',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.50)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
          >
            <ExternalLink size={12} />
            See More Data from Yahoo Finance
          </a>
        </div>
      </div>
    </div>
  );
}
