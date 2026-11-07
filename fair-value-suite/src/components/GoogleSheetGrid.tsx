import React, { useState, useMemo } from 'react';
import { SheetCell, SheetData, SheetMerge } from '../engine/googleSheetsData';
import { CellValue, idxToCol } from '../engine/formulaEngine';
import { PriceBar } from '../engine/models';

function isDarkHex(hex?: string): boolean {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum < 125;
}

function isYellowHex(hex?: string): boolean {
  if (!hex) return false;
  const u = hex.toUpperCase();
  return (
    u === '#FFD966' ||
    u === '#FDD868' ||
    u === '#F1C232' ||
    u === '#FDE49A' ||
    u === '#FCD668'
  );
}

export function formatCellDisplay(val: CellValue, cell?: SheetCell, ref?: string): string {
  if (val === null || val === undefined || val === '') return '';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'string') return val;
  if (!Number.isFinite(val)) return '—';

  const fmt = cell?.fmt;
  const rMatch = ref?.match(/^([A-Z]+)(\d+)$/);
  const col = rMatch ? rMatch[1] : '';
  const row = rMatch ? parseInt(rMatch[2], 10) : 0;

  // Year headers (e.g. 2016..2036 in row 4, 6, 9, 11, 16, 18)
  if (Number.isInteger(val) && val >= 1990 && val <= 2050 && (row === 4 || row === 6 || row === 9 || row === 11 || row === 16 || row === 18 || col === 'T')) {
    return String(val);
  }

  if (fmt === 'percent') {
    return `${(val * 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`;
  }
  if (fmt === 'currency2') {
    return `$${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  if (fmt === 'currency0') {
    return `$${val.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }
  if (fmt === 'integer') {
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  if (fmt === 'number2') {
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Heuristic for unformatted percent cells in Google Sheets (e.g. Discount Rate 0.1, Growth 0.05, ROI, YoY, Under/Over Valued)
  if (
    (col === 'B' && [5, 6, 7, 9, 12, 13, 14, 16, 19, 20, 21, 23, 28, 29, 30].includes(row)) ||
    ((col === 'E') && [26, 27, 28, 29, 35, 36, 37, 38, 39, 40].includes(row)) ||
    ((col === 'H') && [30, 39, 41].includes(row)) ||
    ((col === 'R' || col === 'Q' || col === 'F' || col === 'J') && [9, 10, 18, 19, 20, 21, 28, 29].includes(row) && Math.abs(val) < 25) ||
    (row === 8 && col >= 'T') ||
    (row === 18 && col >= 'U') ||
    (col === 'V' && [10, 11, 20, 21].includes(row)) ||
    (col === 'U' && [10, 11].includes(row))
  ) {
    // Exclude Multiple rows (row 8/15/22 when value > 1)
    if (!([8, 15, 22].includes(row) && col === 'B' && Math.abs(val) >= 1)) {
      return `${(val * 100).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}%`;
    }
  }

  if (Math.abs(val) >= 1000) {
    return val.toLocaleString('en-US', {
      minimumFractionDigits: Number.isInteger(val) ? 0 : 2,
      maximumFractionDigits: 2,
    });
  }

  return val.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(val) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

const MiniBarChart: React.FC<{
  title: string;
  labels: string[];
  values: number[];
}> = ({ title, labels, values }) => {
  const maxVal = Math.max(1, ...values.map((v) => Math.abs(v)));
  return (
    <div className="bg-white border border-slate-300 rounded shadow-xs p-3 flex flex-col justify-between h-[240px]">
      <div className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-1.5">
        {title}
      </div>
      <div className="flex-1 flex items-end gap-2 pt-4 pb-1 px-2">
        {labels.map((lbl, idx) => {
          const v = values[idx] ?? 0;
          const hPct = Math.max(3, Math.round((Math.abs(v) / maxVal) * 100));
          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-end h-full group relative"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10">
                {lbl}: {v.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </div>
              <div
                style={{ height: `${hPct}%` }}
                className="w-full max-w-[32px] bg-[#4285F4] hover:bg-[#1a73e8] rounded-t transition-all"
              />
              <div className="text-[10px] text-slate-600 mt-1 font-medium">
                {lbl}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OverviewPriceLineChart: React.FC<{ bars: PriceBar[] }> = ({ bars }) => {
  if (bars.length === 0) return null;
  const w = 640;
  const h = 190;
  const closes = bars.map((b) => b.close);
  const minP = Math.min(...closes);
  const maxP = Math.max(...closes);
  const span = Math.max(1, maxP - minP);
  const step = Math.max(1, Math.floor(bars.length / 250));
  const sampled = bars.filter((_, idx) => idx % step === 0 || idx === bars.length - 1);

  const pts = sampled
    .map((b, i) => {
      const x = (i / Math.max(1, sampled.length - 1)) * (w - 20) + 10;
      const y = h - 20 - ((b.close - minP) / span) * (h - 35);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="bg-white border border-slate-300 rounded shadow-xs p-3">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
        <span>Stocks Chart — Date vs Close (10 Years, {bars.length} days)</span>
        <span className="text-slate-500">
          Min: ${minP.toFixed(2)} • Max: ${maxP.toFixed(2)}
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[180px]">
        <polyline
          fill="none"
          stroke="#4285F4"
          strokeWidth="2"
          points={pts}
        />
      </svg>
    </div>
  );
};

export interface GoogleSheetGridProps {
  sheet: SheetData;
  evaluated: Record<string, CellValue>;
  onUpdateCell: (ref: string, newVal: string | number, isFormula?: boolean) => void;
  priceHistory: PriceBar[];
}

export const GoogleSheetGrid: React.FC<GoogleSheetGridProps> = ({
  sheet,
  evaluated,
  onUpdateCell,
  priceHistory,
}) => {
  const [selectedRef, setSelectedRef] = useState<string>('B5');
  const [editingRef, setEditingRef] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<string>('');
  const [hoveredComment, setHoveredComment] = useState<{
    ref: string;
    text: string;
  } | null>(null);
  const [ovPage, setOvPage] = useState(0);
  const ovPageSize = 60;

  // Build merge lookup: top-left -> { rowSpan, colSpan }, covered -> true
  const { mergeTopLeft, mergeCovered } = useMemo(() => {
    const topLeft = new Map<string, { rowSpan: number; colSpan: number; merge: SheetMerge }>();
    const covered = new Set<string>();
    for (const m of sheet.merges) {
      const tlRef = `${idxToCol(m.c1)}${m.r1}`;
      topLeft.set(tlRef, {
        rowSpan: m.r2 - m.r1 + 1,
        colSpan: m.c2 - m.c1 + 1,
        merge: m,
      });
      for (let r = m.r1; r <= m.r2; r++) {
        for (let c = m.c1; c <= m.c2; c++) {
          if (r === m.r1 && c === m.c1) continue;
          covered.add(`${idxToCol(c)}${r}`);
        }
      }
    }
    return { mergeTopLeft: topLeft, mergeCovered: covered };
  }, [sheet.merges]);

  const selectedCell = sheet.cells[selectedRef];
  const selectedEval = evaluated[selectedRef];

  const startEditing = (ref: string) => {
    const c = sheet.cells[ref];
    const ev = evaluated[ref];
    setSelectedRef(ref);
    setEditingRef(ref);
    if (c?.f) {
      setEditDraft(`=${c.f}`);
    } else if (c?.v !== undefined) {
      // If it's a percent cell, let user edit raw number or percent
      setEditDraft(String(c.v));
    } else if (ev !== null && ev !== undefined) {
      setEditDraft(String(ev));
    } else {
      setEditDraft('');
    }
  };

  const commitEdit = (ref: string, draft: string) => {
    setEditingRef(null);
    const trimmed = draft.trim();
    if (trimmed.startsWith('=')) {
      onUpdateCell(ref, trimmed.slice(1), true);
      return;
    }
    if (trimmed === '') {
      onUpdateCell(ref, '', false);
      return;
    }
    // Check if user typed a percentage like "10%"
    if (trimmed.endsWith('%')) {
      const num = Number(trimmed.slice(0, -1).replace(/,/g, ''));
      if (!Number.isNaN(num)) {
        onUpdateCell(ref, num / 100, false);
        return;
      }
    }
    const cleaned = trimmed.replace(/,/g, '');
    const parsed = Number(cleaned);
    if (!Number.isNaN(parsed)) {
      onUpdateCell(ref, parsed, false);
    } else {
      onUpdateCell(ref, trimmed, false);
    }
  };

  // Extract chart series for sheets that have charts in the uploaded Excel files
  const embeddedCharts = useMemo(() => {
    const getSeries = (rowYr: number, rowVal: number, cStart: number, cEnd: number) => {
      const labels: string[] = [];
      const values: number[] = [];
      for (let c = cStart; c <= cEnd; c++) {
        const yrRef = `${idxToCol(c)}${rowYr}`;
        const valRef = `${idxToCol(c)}${rowVal}`;
        labels.push(String(evaluated[yrRef] ?? ''));
        const v = evaluated[valRef];
        values.push(typeof v === 'number' && Number.isFinite(v) ? v : 0);
      }
      return { labels, values };
    };

    if (sheet.id === 'dcf10') {
      return [
        { title: '10 Years FCF', ...getSeries(6, 7, 20, 30) },
        { title: '10 Years Revenue', ...getSeries(16, 17, 20, 30) },
      ];
    }
    if (sheet.id === 'fcfMultiple') {
      return [{ title: '10 Years FCF', ...getSeries(6, 7, 20, 30) }];
    }
    if (sheet.id === 'evEbitda') {
      return [{ title: '10 Years EV/EBITDA', ...getSeries(6, 7, 20, 30) }];
    }
    if (sheet.id === 'pe') {
      return [{ title: '10 Years P/E', ...getSeries(6, 7, 19, 29) }];
    }
    if (sheet.id === 'peterLynch') {
      return [{ title: '10 Years Net Income', ...getSeries(6, 7, 11, 21) }];
    }
    return [];
  }, [sheet.id, evaluated]);

  const cols = Array.from({ length: sheet.maxCol }, (_, i) => i + 1);
  const rows = Array.from({ length: sheet.maxRow }, (_, i) => i + 1);

  return (
    <div className="flex flex-col bg-white text-slate-900 select-none">
      {/* Google Sheets Formula Bar (fx) */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8f9fa] border-b border-[#dadce0] text-xs sticky top-0 z-20">
        <div className="w-20 px-2 py-1 bg-white border border-[#dadce0] rounded font-mono font-bold text-center text-slate-800">
          {selectedRef}
        </div>
        <div className="text-slate-400 font-serif italic font-bold px-1.5 text-sm">
          fx
        </div>
        <input
          type="text"
          value={
            editingRef === selectedRef
              ? editDraft
              : selectedCell?.f
              ? `=${selectedCell.f}`
              : selectedCell?.gf
              ? `=${selectedCell.gf}`
              : selectedCell?.v !== undefined
              ? String(selectedCell.v)
              : selectedEval !== null && selectedEval !== undefined
              ? String(selectedEval)
              : ''
          }
          onFocus={() => {
            if (editingRef !== selectedRef) startEditing(selectedRef);
          }}
          onChange={(e) => {
            if (editingRef !== selectedRef) setEditingRef(selectedRef);
            setEditDraft(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commitEdit(selectedRef, editDraft);
            } else if (e.key === 'Escape') {
              setEditingRef(null);
            }
          }}
          onBlur={() => {
            if (editingRef === selectedRef) {
              commitEdit(selectedRef, editDraft);
            }
          }}
          placeholder="Изберете клетка за редакция или преглед на формула..."
          className="flex-1 bg-white border border-[#dadce0] rounded px-2.5 py-1 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
        />
        {selectedCell?.cm && (
          <div className="hidden md:flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-900 px-2.5 py-1 rounded text-[11px] max-w-xl truncate">
            <span className="font-bold">💬 Бележка ({selectedRef}):</span>
            <span className="truncate">{selectedCell.cm}</span>
          </div>
        )}
      </div>

      {/* Active Comment Banner when hovered or selected */}
      {(hoveredComment || (selectedCell?.cm && { ref: selectedRef, text: selectedCell.cm })) && (
        <div className="bg-[#fff8e1] border-b border-amber-300 px-4 py-2 text-xs text-slate-800 flex items-start gap-2">
          <span className="font-black text-amber-700 whitespace-nowrap">
            📌 Коментар в клетка {(hoveredComment ?? { ref: selectedRef }).ref}:
          </span>
          <div className="whitespace-pre-line leading-relaxed">
            {(hoveredComment ?? { text: selectedCell?.cm ?? '' }).text}
          </div>
        </div>
      )}

      {/* Main Google Sheets Grid */}
      <div className="overflow-x-auto flex-1 bg-[#f8f9fa]">
        <table className="border-collapse bg-white text-[12px] leading-tight">
          <thead>
            <tr>
              <th className="w-10 min-w-[40px] bg-[#f8f9fa] border border-[#dadce0] text-[11px] font-semibold text-slate-500 py-1 text-center sticky left-0 z-10">
                
              </th>
              {cols.map((c) => {
                const colLetter = idxToCol(c);
                const w = sheet.colWidths[c] ?? 95;
                return (
                  <th
                    key={c}
                    style={{ width: w, minWidth: w }}
                    className="bg-[#f8f9fa] border border-[#dadce0] text-[11px] font-semibold text-slate-600 py-1 text-center select-none"
                  >
                    {colLetter}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r} className="h-[24px]">
                {/* Row Number Header */}
                <td className="bg-[#f8f9fa] border border-[#dadce0] text-[11px] font-semibold text-slate-500 text-center px-1.5 sticky left-0 z-10 select-none">
                  {r}
                </td>

                {cols.map((c) => {
                  const ref = `${idxToCol(c)}${r}`;
                  if (mergeCovered.has(ref)) return null;

                  const span = mergeTopLeft.get(ref);
                  const cell = sheet.cells[ref];
                  const val = evaluated[ref];
                  const isSelected = selectedRef === ref;
                  const isEditing = editingRef === ref;

                  const bg = cell?.bg;
                  const darkBg = isDarkHex(bg);
                  const fg =
                    cell?.fg ??
                    (darkBg ? '#FFFFFF' : '#000000');
                  const isYellow = isYellowHex(bg);

                  // Determine text alignment
                  let textAlign: 'left' | 'center' | 'right' = 'left';
                  if (cell?.al === 'center') textAlign = 'center';
                  else if (cell?.al === 'right') textAlign = 'right';
                  else if (typeof val === 'number') textAlign = 'right';

                  const displayStr = formatCellDisplay(val, cell, ref);

                  return (
                    <td
                      key={ref}
                      rowSpan={span?.rowSpan}
                      colSpan={span?.colSpan}
                      onClick={() => {
                        setSelectedRef(ref);
                        if (isYellow && editingRef !== ref) {
                          startEditing(ref);
                        }
                      }}
                      onDoubleClick={() => startEditing(ref)}
                      onMouseEnter={() => {
                        if (cell?.cm) {
                          setHoveredComment({ ref, text: cell.cm });
                        }
                      }}
                      onMouseLeave={() => {
                        if (hoveredComment?.ref === ref) {
                          setHoveredComment(null);
                        }
                      }}
                      style={{
                        backgroundColor: bg ?? '#FFFFFF',
                        color: fg,
                        fontWeight: cell?.b ? 700 : 400,
                        fontStyle: cell?.i ? 'italic' : 'normal',
                        textAlign,
                      }}
                      title={
                        cell?.cm
                          ? `💬 ${cell.cm}`
                          : cell?.f
                          ? `${ref}: =${cell.f}`
                          : ref
                      }
                      className={`relative px-1.5 py-0.5 whitespace-nowrap border border-[#e0e0e0] transition-shadow ${
                        isSelected
                          ? 'outline-2 outline-[#1a73e8] -outline-offset-2 z-10'
                          : ''
                      } ${isYellow ? 'cursor-text' : 'cursor-cell'}`}
                    >
                      {/* Google Sheets Orange Comment Triangle */}
                      {cell?.cm && (
                        <span
                          className="absolute top-0 right-0 w-0 h-0 border-t-[7px] border-t-[#ff6d00] border-l-[7px] border-l-transparent pointer-events-none"
                        />
                      )}

                      {isEditing ? (
                        <input
                          type="text"
                          autoFocus
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              commitEdit(ref, editDraft);
                            } else if (e.key === 'Escape') {
                              setEditingRef(null);
                            }
                          }}
                          onBlur={() => commitEdit(ref, editDraft)}
                          className="w-full h-full bg-white text-slate-900 font-mono text-xs px-1 focus:outline-none"
                        />
                      ) : (
                        <span>{displayStr}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Embedded Google Sheets Charts */}
        {embeddedCharts.length > 0 && (
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-[1400px]">
            {embeddedCharts.map((ch, idx) => (
              <MiniBarChart
                key={idx}
                title={ch.title}
                labels={ch.labels}
                values={ch.values}
              />
            ))}
          </div>
        )}

        {/* Overview Sheet: Embedded 10Y Price Chart + Rows 35..2546 */}
        {sheet.id === 'overview' && (
          <div className="p-4 space-y-4 max-w-[1100px]">
            <OverviewPriceLineChart bars={priceHistory} />

            <div className="bg-white border border-[#dadce0] rounded shadow-xs overflow-hidden">
              <div className="bg-[#002060] text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between">
                <span>
                  Rows 35–{34 + priceHistory.length}: GOOGLEFINANCE 10-Year Daily OHLCV ({priceHistory.length} rows)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOvPage((p) => Math.max(0, p - 1))}
                    disabled={ovPage === 0}
                    className="px-2 py-0.5 bg-white/15 rounded disabled:opacity-40 cursor-pointer"
                  >
                    ◀
                  </button>
                  <span>
                    Rows {35 + ovPage * ovPageSize}–
                    {Math.min(34 + priceHistory.length, 34 + (ovPage + 1) * ovPageSize)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setOvPage((p) =>
                        Math.min(
                          Math.ceil(priceHistory.length / ovPageSize) - 1,
                          p + 1
                        )
                      )
                    }
                    disabled={
                      (ovPage + 1) * ovPageSize >= priceHistory.length
                    }
                    className="px-2 py-0.5 bg-white/15 rounded disabled:opacity-40 cursor-pointer"
                  >
                    ▶
                  </button>
                </div>
              </div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#002060] text-white">
                    <th className="border border-[#dadce0] px-2 py-1 text-center w-12">Row</th>
                    <th className="border border-[#dadce0] px-3 py-1 text-center">B: Date</th>
                    <th className="border border-[#dadce0] px-3 py-1 text-right">C: Open</th>
                    <th className="border border-[#dadce0] px-3 py-1 text-right">D: High</th>
                    <th className="border border-[#dadce0] px-3 py-1 text-right">E: Low</th>
                    <th className="border border-[#dadce0] px-3 py-1 text-right">F: Close</th>
                    <th className="border border-[#dadce0] px-3 py-1 text-right">G: Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistory
                    .slice(ovPage * ovPageSize, (ovPage + 1) * ovPageSize)
                    .map((b, i) => {
                      const rowNum = 35 + ovPage * ovPageSize + i;
                      return (
                        <tr key={rowNum} className="hover:bg-blue-50/40">
                          <td className="bg-[#f8f9fa] border border-[#dadce0] text-center text-slate-500 font-semibold py-0.5">
                            {rowNum}
                          </td>
                          <td className="border border-[#e0e0e0] px-3 py-0.5 text-center font-mono">
                            {b.date}
                          </td>
                          <td className="border border-[#e0e0e0] px-3 py-0.5 text-right">
                            {b.open.toFixed(2)}
                          </td>
                          <td className="border border-[#e0e0e0] px-3 py-0.5 text-right">
                            {b.high.toFixed(2)}
                          </td>
                          <td className="border border-[#e0e0e0] px-3 py-0.5 text-right">
                            {b.low.toFixed(2)}
                          </td>
                          <td className="border border-[#e0e0e0] px-3 py-0.5 text-right font-bold">
                            {b.close.toFixed(2)}
                          </td>
                          <td className="border border-[#e0e0e0] px-3 py-0.5 text-right text-slate-600">
                            {b.volume.toLocaleString('en-US')}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
