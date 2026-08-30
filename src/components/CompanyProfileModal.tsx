import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Stock } from '../types';
import { X, ExternalLink, Globe, Building2, MapPin, Phone, Calendar, Users, Briefcase, TrendingUp, ChevronRight } from 'lucide-react';
import { getTradingViewSymbol } from '../utils/tvSymbolMap';
import { getCompanyProfileData } from '../utils/tvCompanyProfiles';

interface Props {
  stock: Stock;
  onClose: () => void;
}

// Detailed company info lookup (CEO, employees, founded, address, website, phone)
const COMPANY_DETAILS: Record<string, {
  ceo?: string;
  employees?: string;
  founded?: string;
  country?: string;
  address?: string;
  phone?: string;
  website?: string;
  industry?: string;
  sector?: string;
}> = {
  AAPL: { ceo: 'Timothy Cook', employees: '166,000', founded: '1976', country: 'United States', address: 'One Apple Park Way, Cupertino, CA 95014', phone: '(408) 996-1010', website: 'https://www.apple.com', industry: 'Consumer Electronics', sector: 'Technology' },
  MSFT: { ceo: 'Satya Nadella', employees: '228,000', founded: '1975', country: 'United States', address: 'One Microsoft Way, Redmond, WA 98052', phone: '(425) 882-8080', website: 'https://www.microsoft.com', industry: 'Packaged Software', sector: 'Technology' },
  NVDA: { ceo: 'Jensen Huang', employees: '36,000', founded: '1993', country: 'United States', address: '2788 San Tomas Expressway, Santa Clara, CA 95051', phone: '(408) 486-2000', website: 'https://www.nvidia.com', industry: 'Semiconductors', sector: 'Technology' },
  AMZN: { ceo: 'Andy Jassy', employees: '1,540,000', founded: '1994', country: 'United States', address: '410 Terry Avenue North, Seattle, WA 98109', phone: '(206) 266-1000', website: 'https://www.amazon.com', industry: 'Internet Retail', sector: 'Consumer Discretionary' },
  GOOGL: { ceo: 'Sundar Pichai', employees: '181,000', founded: '1998', country: 'United States', address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043', phone: '(650) 253-0000', website: 'https://www.alphabet.com', industry: 'Internet Services', sector: 'Technology' },
  META: { ceo: 'Mark Zuckerberg', employees: '72,400', founded: '2004', country: 'United States', address: '1 Meta Way, Menlo Park, CA 94025', phone: '(650) 543-4800', website: 'https://www.meta.com', industry: 'Internet Software', sector: 'Technology' },
  TSLA: { ceo: 'Elon Musk', employees: '140,000', founded: '2003', country: 'United States', address: '13101 Tesla Road, Austin, TX 78725', phone: '(512) 516-8177', website: 'https://www.tesla.com', industry: 'Auto Manufacturers', sector: 'Consumer Discretionary' },
  NFLX: { ceo: 'Ted Sarandos', employees: '13,000', founded: '1997', country: 'United States', address: '121 Albright Way, Los Gatos, CA 95032', phone: '(408) 540-3700', website: 'https://www.netflix.com', industry: 'Entertainment', sector: 'Communication Services' },
  DIS: { ceo: 'Bob Iger', employees: '220,000', founded: '1923', country: 'United States', address: '500 S Buena Vista Street, Burbank, CA 91521', phone: '(818) 560-1000', website: 'https://www.thewaltdisneycompany.com', industry: 'Entertainment', sector: 'Communication Services' },
  COST: { ceo: 'Ron Vachris', employees: '316,000', founded: '1976', country: 'United States', address: '999 Lake Drive, Issaquah, WA 98027', phone: '(425) 313-8100', website: 'https://www.costco.com', industry: 'Wholesale Retail', sector: 'Consumer Staples' },
  SBUX: { ceo: 'Brian Niccol', employees: '381,000', founded: '1971', country: 'United States', address: '2401 Utah Ave South, Seattle, WA 98134', phone: '(206) 447-1575', website: 'https://www.starbucks.com', industry: 'Restaurants', sector: 'Consumer Discretionary' },
  MCD: { ceo: 'Chris Kempczinski', employees: '150,000', founded: '1940', country: 'United States', address: '110 N Carpenter Street, Chicago, IL 60607', phone: '(630) 623-3000', website: 'https://www.mcdonalds.com', industry: 'Restaurants', sector: 'Consumer Discretionary' },
  JNJ: { ceo: 'Joaquin Duato', employees: '131,900', founded: '1886', country: 'United States', address: 'One Johnson & Johnson Plaza, New Brunswick, NJ 08933', phone: '(732) 524-0400', website: 'https://www.jnj.com', industry: 'Pharmaceuticals', sector: 'Healthcare' },
  V: { ceo: 'Ryan McInerney', employees: '26,500', founded: '1958', country: 'United States', address: '900 Metro Center Blvd, Foster City, CA 94404', phone: '(650) 432-3200', website: 'https://www.visa.com', industry: 'Financial Services', sector: 'Financials' },
  MA: { ceo: 'Michael Miebach', employees: '33,000', founded: '1966', country: 'United States', address: '2000 Purchase Street, Purchase, NY 10577', phone: '(914) 249-2000', website: 'https://www.mastercard.com', industry: 'Financial Services', sector: 'Financials' },
  PYPL: { ceo: 'Alex Chriss', employees: '27,200', founded: '1998', country: 'United States', address: '2211 North First Street, San Jose, CA 95131', phone: '(408) 967-1000', website: 'https://www.paypal.com', industry: 'Fintech', sector: 'Financials' },
  UBER: { ceo: 'Dara Khosrowshahi', employees: '32,200', founded: '2009', country: 'United States', address: '1515 3rd Street, San Francisco, CA 94158', phone: '(415) 612-8582', website: 'https://www.uber.com', industry: 'Transportation', sector: 'Technology' },
  LULU: { ceo: 'Calvin McDonald', employees: '38,000', founded: '1998', country: 'Canada', address: '1818 Cornwall Avenue, Vancouver, BC V6J 1C7', phone: '(604) 732-6124', website: 'https://www.lululemon.com', industry: 'Apparel', sector: 'Consumer Discretionary' },
  KO: { ceo: 'James Quincey', employees: '83,000', founded: '1892', country: 'United States', address: 'One Coca-Cola Plaza, Atlanta, GA 30313', phone: '(404) 676-2121', website: 'https://www.coca-colacompany.com', industry: 'Beverages', sector: 'Consumer Staples' },
  PEP: { ceo: 'Ramon Laguarta', employees: '318,000', founded: '1965', country: 'United States', address: '700 Anderson Hill Road, Purchase, NY 10577', phone: '(914) 253-2000', website: 'https://www.pepsico.com', industry: 'Beverages', sector: 'Consumer Staples' },
  AVGO: { ceo: 'Hock Tan', employees: '40,000', founded: '2005', country: 'United States', address: '1320 Ridder Park Drive, San Jose, CA 95131', phone: '(408) 433-8000', website: 'https://www.broadcom.com', industry: 'Semiconductors', sector: 'Technology' },
  CRM: { ceo: 'Marc Benioff', employees: '79,390', founded: '1999', country: 'United States', address: '415 Mission St, San Francisco, CA 94105', phone: '(415) 901-7000', website: 'https://www.salesforce.com', industry: 'Enterprise Software', sector: 'Technology' },
  ADBE: { ceo: 'Shantanu Narayen', employees: '29,945', founded: '1982', country: 'United States', address: '345 Park Avenue, San Jose, CA 95110', phone: '(408) 536-6000', website: 'https://www.adobe.com', industry: 'Packaged Software', sector: 'Technology' },
  CSCO: { ceo: 'Chuck Robbins', employees: '84,900', founded: '1984', country: 'United States', address: '170 West Tasman Drive, San Jose, CA 95134', phone: '(408) 526-4000', website: 'https://www.cisco.com', industry: 'Computer Networking', sector: 'Technology' },
  INTC: { ceo: 'Pat Gelsinger', employees: '124,800', founded: '1968', country: 'United States', address: '2200 Mission College Blvd, Santa Clara, CA 95054', phone: '(408) 765-8080', website: 'https://www.intel.com', industry: 'Semiconductors', sector: 'Technology' },
  AMD: { ceo: 'Lisa Su', employees: '26,000', founded: '1969', country: 'United States', address: '2485 Augustine Drive, Santa Clara, CA 95054', phone: '(408) 749-4000', website: 'https://www.amd.com', industry: 'Semiconductors', sector: 'Technology' },
  QCOM: { ceo: 'Cristiano Amon', employees: '50,000', founded: '1985', country: 'United States', address: '5775 Morehouse Drive, San Diego, CA 92121', phone: '(858) 587-1121', website: 'https://www.qualcomm.com', industry: 'Semiconductors', sector: 'Technology' },
  IBM: { ceo: 'Arvind Krishna', employees: '288,000', founded: '1911', country: 'United States', address: '1 New Orchard Road, Armonk, NY 10504', phone: '(914) 499-1900', website: 'https://www.ibm.com', industry: 'IT Services', sector: 'Technology' },
  ORCL: { ceo: 'Safra Catz', employees: '159,000', founded: '1977', country: 'United States', address: '2300 Oracle Way, Austin, TX 78741', phone: '(512) 906-6000', website: 'https://www.oracle.com', industry: 'Enterprise Software', sector: 'Technology' },
  SAP: { ceo: 'Christian Klein', employees: '107,000', founded: '1972', country: 'Germany', address: 'Dietmar-Hopp-Allee 16, Walldorf 69190', phone: '+49-6227-74-74474', website: 'https://www.sap.com', industry: 'Enterprise Software', sector: 'Technology' },
  ASML: { ceo: 'Christophe Fouquet', employees: '42,000', founded: '1984', country: 'Netherlands', address: 'De Run 6501, Veldhoven 5504DR', phone: '+31-40-268-3000', website: 'https://www.asml.com', industry: 'Semiconductor Equipment', sector: 'Technology' },
  TSM: { ceo: 'C.C. Wei', employees: '73,000', founded: '1987', country: 'Taiwan', address: 'No. 8, Li-Hsin Road 6, Hsinchu 300096', phone: '+886-3-568-2121', website: 'https://www.tsmc.com', industry: 'Semiconductors', sector: 'Technology' },
};

export default function CompanyProfileModal({ stock, onClose }: Props) {
  const profile = getCompanyProfileData(stock);
  const tvSymbol = getTradingViewSymbol(stock.companyName, stock.ticker);
  const cleanTicker = stock.ticker.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  const details = COMPANY_DETAILS[cleanTicker] || {};

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', fn);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const formatCap = (cap: number | null) => {
    if (!cap) return 'N/A';
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    return `$${(cap / 1e6).toFixed(2)}M`;
  };

  const officialDesc = profile.description;
  // Split description into paragraphs (by '. ' sentences)
  const sentences = officialDesc.split('. ').filter(s => s.trim().length > 20);
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    const add = current ? current + '. ' + s : s;
    if (add.length > 220 && current) {
      chunks.push(current.endsWith('.') ? current : current + '.');
      current = s;
    } else {
      current = add;
    }
  }
  if (current) chunks.push(current.endsWith('.') ? current : current + '.');

  const websiteDisplay = details.website
    ? details.website.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : null;

  const sector = details.sector || profile.sector || 'Technology';
  const industry = details.industry || profile.industry || 'Software & Services';

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-start justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div
        className="relative w-full max-w-5xl bg-[#131722] border border-[#2a2e39] rounded-none sm:rounded-2xl shadow-2xl my-0 sm:my-4 flex flex-col text-stone-200"
        style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}
      >
        {/* ── Top Header Bar ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2e39]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0 uppercase tracking-tight">
              {stock.ticker.slice(0, 3)}
            </div>
            <div>
              <div className="text-lg font-bold text-white leading-tight">{stock.companyName}</div>
              <div className="text-xs text-stone-400 mt-0.5">{tvSymbol} &middot; {details.country || 'United States'} &middot; {sector}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white hover:bg-[#2a2e39] rounded-full p-1.5 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* ── Main Content: Left (description) + Right (info card) ── */}
        <div className="flex flex-col lg:flex-row gap-0">

          {/* LEFT COLUMN — Company Description */}
          <div className="flex-1 px-5 pt-6 pb-5 lg:pr-6 border-b lg:border-b-0 lg:border-r border-[#2a2e39]">
            <h1 className="text-xl font-bold text-white mb-4">Company Description</h1>

            {/* Description paragraphs — pure DOM text for browser auto-translate */}
            <div className="flex flex-col gap-3 text-sm text-stone-300 leading-relaxed">
              {chunks.length > 0 ? (
                chunks.map((para, i) => (
                  <p key={i}>{para}</p>
                ))
              ) : (
                <p>{officialDesc}</p>
              )}
            </div>

            {/* Key metrics row */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Market Cap', value: formatCap(stock.marketCap), color: 'text-white' },
                { label: 'Current Price', value: `$${stock.currentPrice.toFixed(2)}`, color: 'text-emerald-400' },
                { label: 'EPS (TTM)', value: stock.eps ? `$${stock.eps.toFixed(2)}` : 'N/A', color: 'text-white' },
                { label: 'Dividend Yield', value: stock.dividend || 'N/A', color: 'text-indigo-300' },
              ].map(m => (
                <div key={m.label} className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-3">
                  <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1">{m.label}</div>
                  <div className={`text-base font-extrabold font-mono ${m.color}`}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN — Company Info Card (mimics StockAnalysis sidebar) */}
          <div className="w-full lg:w-[320px] shrink-0 px-5 pt-6 pb-5 flex flex-col gap-5">

            {/* Company Summary Card */}
            <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2a2e39] text-center">
                <div className="text-base font-bold text-white">{stock.companyName}</div>
                <div className="text-xs text-stone-400 mt-0.5 font-mono">{stock.ticker}</div>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { icon: <Globe size={13} />, label: 'Country', value: details.country || 'United States' },
                    { icon: <Calendar size={13} />, label: 'Founded', value: details.founded || 'N/A' },
                    { icon: <Briefcase size={13} />, label: 'Industry', value: industry },
                    { icon: <TrendingUp size={13} />, label: 'Sector', value: sector },
                    { icon: <Users size={13} />, label: 'Employees', value: details.employees ? Number(details.employees.replace(/,/g, '')).toLocaleString() : 'N/A' },
                    { icon: <Building2 size={13} />, label: 'CEO', value: details.ceo || 'N/A' },
                  ].map(row => (
                    <tr key={row.label} className="border-b border-[#2a2e39] last:border-0 hover:bg-indigo-500/10 transition-all cursor-pointer group">
                      <td className="px-4 py-2.5 text-stone-400 font-semibold flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        <span className="text-stone-500">{row.icon}</span>
                        {row.label}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-stone-200">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Contact Details Card */}
            <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2a2e39]">
                <div className="text-xs font-black uppercase text-stone-400 tracking-wider">Contact Details</div>
              </div>
              <div className="px-4 py-3 flex flex-col gap-3">
                {details.address && (
                  <div className="flex gap-2 text-xs text-stone-300">
                    <MapPin size={13} className="text-stone-500 mt-0.5 shrink-0" />
                    <span>{details.address}</span>
                  </div>
                )}
                {details.phone && (
                  <div className="flex gap-2 text-xs text-stone-300">
                    <Phone size={13} className="text-stone-500 shrink-0" />
                    <span>{details.phone}</span>
                  </div>
                )}
                {details.website && (
                  <div className="flex gap-2 text-xs">
                    <Globe size={13} className="text-stone-500 shrink-0 mt-0.5" />
                    <a
                      href={details.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 font-semibold no-underline hover:underline"
                    >
                      {websiteDisplay}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Details Card */}
            <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2a2e39]">
                <div className="text-xs font-black uppercase text-stone-400 tracking-wider">Stock Details</div>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { label: 'Ticker Symbol', value: stock.ticker },
                    { label: 'Exchange', value: tvSymbol.split(':')[0] || 'NASDAQ' },
                    { label: 'Market Cap', value: formatCap(stock.marketCap) },
                    { label: '52-Week High', value: stock.high52 ? `$${stock.high52.toFixed(2)}` : 'N/A' },
                    { label: '52-Week Low', value: stock.low52 ? `$${stock.low52.toFixed(2)}` : 'N/A' },
                  ].map(row => (
                    <tr key={row.label} className="border-b border-[#2a2e39] last:border-0 hover:bg-indigo-500/10 transition-all cursor-pointer group">
                      <td className="px-4 py-2 text-stone-400 font-semibold text-xs flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        <span>{row.label}</span>
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-stone-200 text-xs font-mono">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 border-t border-[#2a2e39] flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <a
              href={`https://stockanalysis.com/stocks/${stock.ticker.toLowerCase()}/company/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold no-underline"
            >
              <ExternalLink size={12} />
              StockAnalysis
            </a>
            <span>·</span>
            <a
              href={`https://finance.yahoo.com/quote/${stock.ticker}/profile/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-300 font-semibold no-underline"
            >
              Yahoo Finance
            </a>
            <span>·</span>
            <a
              href={`https://www.tradingview.com/symbols/${tvSymbol.replace(':', '-')}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-300 font-semibold no-underline"
            >
              TradingView
            </a>
          </div>
          <span>Data sourced from Wikipedia &amp; public financial registries</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
