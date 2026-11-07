import { SheetData } from './googleSheetsData';
import { DEFAULT_SYK_PRICE_HISTORY } from './priceHistoryData';

export type CellValue = number | string | boolean | null;

export function colToIdx(colStr: string): number {
  let n = 0;
  for (let i = 0; i < colStr.length; i++) {
    n = n * 26 + (colStr.charCodeAt(i) - 64);
  }
  return n;
}

export function idxToCol(n: number): string {
  let s = '';
  let cur = n;
  while (cur > 0) {
    const r = (cur - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    cur = Math.floor((cur - 1) / 26);
  }
  return s;
}

function normalizeSheetName(raw: string): string {
  const s = raw.replace(/^'+|'+$/g, '').trim().toUpperCase();
  if (s === 'EV/EBITDA' || s === 'EVEBITDA') return 'EVEBITDA';
  if (s === 'P/E' || s === 'PE') return 'PE';
  return s;
}

function expandRange(rangeStr: string): string[] {
  const [start, end] = rangeStr.replace(/\$/g, '').split(':');
  const m1 = start.match(/^([A-Z]+)(\d+)$/);
  const m2 = end.match(/^([A-Z]+)(\d+)$/);
  if (!m1 || !m2) return [];
  const c1 = colToIdx(m1[1]);
  const r1 = parseInt(m1[2], 10);
  const c2 = colToIdx(m2[1]);
  const r2 = parseInt(m2[2], 10);
  const out: string[] = [];
  for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
    for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
      out.push(`${idxToCol(c)}${r}`);
    }
  }
  return out;
}

function toNum(v: CellValue): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') {
    const cleaned = v.replace(/[$,%\s]/g, '');
    if (cleaned === '') return 0;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function isErrorVal(v: CellValue): boolean {
  return typeof v === 'string' && (v.startsWith('#') || v === 'Err');
}

/**
 * Evaluates all formulas across the 10-sheet workbook and returns a map:
 * sheetId -> cellRef -> evaluated display value
 */
export function evaluateWorkbook(
  sheets: SheetData[],
  priceHistory = DEFAULT_SYK_PRICE_HISTORY
): Record<string, Record<string, CellValue>> {
  const sheetByNormTitle = new Map<string, SheetData>();
  const sheetById = new Map<string, SheetData>();
  for (const sh of sheets) {
    sheetByNormTitle.set(normalizeSheetName(sh.title), sh);
    sheetById.set(sh.id, sh);
  }

  const cache: Record<string, Record<string, CellValue>> = {};
  const visiting = new Set<string>();

  for (const sh of sheets) {
    cache[sh.id] = {};
  }

  function evalCell(sh: SheetData, ref: string): CellValue {
    const cleanRef = ref.replace(/\$/g, '').toUpperCase();
    if (cleanRef in cache[sh.id]) {
      return cache[sh.id][cleanRef];
    }

    const key = `${sh.id}!${cleanRef}`;
    if (visiting.has(key)) {
      return 0;
    }
    visiting.add(key);

    const cell = sh.cells[cleanRef];
    let result: CellValue = null;

    // Special handling for Overview 3Y / 5Y / 10Y return cells (C11, E11, G11)
    if (sh.id === 'overview' && (cleanRef === 'C11' || cleanRef === 'E11' || cleanRef === 'G11')) {
      if (cell && cell.v !== undefined && cell.v !== '#REF!' && cell.v !== '') {
        result = cell.v;
      } else if (priceHistory.length > 0) {
        const curPrice = toNum(evalCell(sh, 'B14'));
        const daysBack = cleanRef === 'C11' ? 252 * 3 : cleanRef === 'E11' ? 252 * 5 : priceHistory.length - 1;
        const idx = Math.max(0, priceHistory.length - 1 - daysBack);
        const oldClose = priceHistory[idx]?.close ?? 0;
        result = oldClose > 0 && curPrice > 0 ? curPrice / oldClose - 1 : null;
      }
    } else if (!cell) {
      result = null;
    } else if (cell.f) {
      result = evalFormula(sh, cell.f);
    } else if (cell.v !== undefined) {
      result = cell.v;
    }

    visiting.delete(key);
    cache[sh.id][cleanRef] = result;
    return result;
  }

  function resolveRangeValues(sh: SheetData, rawRange: string): CellValue[] {
    let targetSheet = sh;
    let rangePart = rawRange.trim();
    if (rangePart.includes('!')) {
      const [shPart, rPart] = rangePart.split('!');
      const found = sheetByNormTitle.get(normalizeSheetName(shPart));
      if (found) targetSheet = found;
      rangePart = rPart;
    }
    const cleanRange = rangePart.replace(/\$/g, '').toUpperCase();
    // Special case: Overview!F35:F5007 (10Y daily closes)
    if (targetSheet.id === 'overview' && cleanRange.startsWith('F35:F')) {
      return priceHistory.map((p) => p.close);
    }
    const refs = expandRange(cleanRange);
    return refs.map((r) => evalCell(targetSheet, r));
  }

  function resolveSingleRef(sh: SheetData, rawRef: string): CellValue {
    let targetSheet = sh;
    let refPart = rawRef.trim();
    if (refPart.includes('!')) {
      const [shPart, rPart] = refPart.split('!');
      const found = sheetByNormTitle.get(normalizeSheetName(shPart));
      if (!found) return '#REF!';
      targetSheet = found;
      refPart = rPart;
    }
    return evalCell(targetSheet, refPart.replace(/\$/g, '').toUpperCase());
  }

  // Split top-level comma arguments
  function splitArgs(str: string): string[] {
    const res: string[] = [];
    let depth = 0;
    let inStr = false;
    let cur = '';
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === '"') {
        inStr = !inStr;
        cur += ch;
      } else if (!inStr) {
        if (ch === '(') {
          depth++;
          cur += ch;
        } else if (ch === ')') {
          depth--;
          cur += ch;
        } else if (ch === ',' && depth === 0) {
          res.push(cur.trim());
          cur = '';
        } else {
          cur += ch;
        }
      } else {
        cur += ch;
      }
    }
    if (cur.trim() !== '') res.push(cur.trim());
    return res;
  }

  function stripOuterParens(s: string): string {
    let cur = s.trim();
    while (cur.startsWith('(') && cur.endsWith(')')) {
      let depth = 0;
      let inStr = false;
      let wrapsAll = true;
      for (let i = 0; i < cur.length; i++) {
        const ch = cur[i];
        if (ch === '"') inStr = !inStr;
        else if (!inStr) {
          if (ch === '(') depth++;
          else if (ch === ')') {
            depth--;
            if (depth === 0 && i < cur.length - 1) {
              wrapsAll = false;
              break;
            }
          }
        }
      }
      if (wrapsAll) cur = cur.slice(1, -1).trim();
      else break;
    }
    return cur;
  }

  function findTopLevelOp(expr: string, ops: string[]): { idx: number; op: string } | null {
    let depth = 0;
    let inStr = false;
    // Scan right-to-left for left-associative binary ops (+, -, *, /, &, comparisons)
    for (let i = expr.length - 1; i >= 0; i--) {
      const ch = expr[i];
      if (ch === '"') inStr = !inStr;
      else if (!inStr) {
        if (ch === ')') depth++;
        else if (ch === '(') depth--;
        else if (depth === 0) {
          for (const op of ops) {
            if (expr.slice(i - op.length + 1, i + 1) === op) {
              const startIdx = i - op.length + 1;
              // For + or -, make sure it's binary (not unary or scientific notation 1E-5)
              if ((op === '+' || op === '-') && startIdx === 0) continue;
              if (op === '+' || op === '-') {
                const prev = expr.slice(0, startIdx).trimEnd();
                if (!prev) continue;
                const prevCh = prev[prev.length - 1];
                if ('+-*/^&=<>('.includes(prevCh)) continue;
              }
              if ((op === '<' || op === '>') && expr[i + 1] === '=') continue;
              if (op === '>' && startIdx > 0 && expr[startIdx - 1] === '<') continue;
              return { idx: startIdx, op };
            }
          }
        }
      }
    }
    return null;
  }

  function evalFormula(sh: SheetData, rawExpr: string): CellValue {
    const expr = stripOuterParens(rawExpr.trim());
    if (expr === '') return '';

    // String literal
    if (expr.startsWith('"') && expr.endsWith('"') && !expr.slice(1, -1).includes('"')) {
      return expr.slice(1, -1);
    }

    // Number literal
    if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(expr)) {
      return Number(expr);
    }

    // 1. Comparison operators (=, <>, >=, <=, >, <)
    const cmp = findTopLevelOp(expr, ['<>', '>=', '<=', '=', '>', '<']);
    if (cmp) {
      const left = evalFormula(sh, expr.slice(0, cmp.idx));
      const right = evalFormula(sh, expr.slice(cmp.idx + cmp.op.length));
      if (isErrorVal(left)) return left;
      if (isErrorVal(right)) return right;
      const lStr = left === null ? '' : String(left);
      const rStr = right === null ? '' : String(right);
      if (cmp.op === '=') {
        if (typeof left === 'string' || typeof right === 'string') {
          if ((left === null || left === '') && (right === null || right === '')) return true;
          return lStr.toUpperCase() === rStr.toUpperCase();
        }
        return toNum(left) === toNum(right);
      }
      if (cmp.op === '<>') {
        if (typeof left === 'string' || typeof right === 'string') {
          if ((left === null || left === '') && (right === null || right === '')) return false;
          return lStr.toUpperCase() !== rStr.toUpperCase();
        }
        return toNum(left) !== toNum(right);
      }
      const ln = toNum(left);
      const rn = toNum(right);
      if (cmp.op === '>') return ln > rn;
      if (cmp.op === '<') return ln < rn;
      if (cmp.op === '>=') return ln >= rn;
      if (cmp.op === '<=') return ln <= rn;
    }

    // 2. String concatenation (&)
    const amp = findTopLevelOp(expr, ['&']);
    if (amp) {
      const left = evalFormula(sh, expr.slice(0, amp.idx));
      const right = evalFormula(sh, expr.slice(amp.idx + 1));
      return `${left ?? ''}${right ?? ''}`;
    }

    // 3. Addition / Subtraction (+, -)
    const addSub = findTopLevelOp(expr, ['+', '-']);
    if (addSub) {
      const left = evalFormula(sh, expr.slice(0, addSub.idx));
      const right = evalFormula(sh, expr.slice(addSub.idx + 1));
      if (isErrorVal(left)) return left;
      if (isErrorVal(right)) return right;
      return addSub.op === '+' ? toNum(left) + toNum(right) : toNum(left) - toNum(right);
    }

    // 4. Multiplication / Division (*, /)
    const mulDiv = findTopLevelOp(expr, ['*', '/']);
    if (mulDiv) {
      const left = evalFormula(sh, expr.slice(0, mulDiv.idx));
      const right = evalFormula(sh, expr.slice(mulDiv.idx + 1));
      if (isErrorVal(left)) return left;
      if (isErrorVal(right)) return right;
      if (mulDiv.op === '*') return toNum(left) * toNum(right);
      const denom = toNum(right);
      if (denom === 0) return '#DIV/0!';
      return toNum(left) / denom;
    }

    // 5. Exponentiation (^)
    const powOp = findTopLevelOp(expr, ['^']);
    if (powOp) {
      const left = evalFormula(sh, expr.slice(0, powOp.idx));
      const right = evalFormula(sh, expr.slice(powOp.idx + 1));
      if (isErrorVal(left)) return left;
      if (isErrorVal(right)) return right;
      const r = Math.pow(toNum(left), toNum(right));
      return Number.isFinite(r) ? r : '#DIV/0!';
    }

    // 6. Unary minus
    if (expr.startsWith('-')) {
      const inner = evalFormula(sh, expr.slice(1));
      if (isErrorVal(inner)) return inner;
      return -toNum(inner);
    }

    // 7. Function call: FUNC(...)
    const fnMatch = expr.match(/^([A-Za-z0-9_]+)\(([\s\S]*)\)$/);
    if (fnMatch) {
      const fnName = fnMatch[1].toUpperCase();
      const args = splitArgs(fnMatch[2]);

      if (fnName === 'IFERROR') {
        const val = evalFormula(sh, args[0] ?? '');
        if (isErrorVal(val) || val === null) {
          return evalFormula(sh, args[1] ?? '');
        }
        return val;
      }

      if (fnName === 'IF') {
        const cond = evalFormula(sh, args[0] ?? '');
        if (isErrorVal(cond)) return cond;
        const truthy = typeof cond === 'boolean' ? cond : toNum(cond) !== 0;
        return truthy
          ? evalFormula(sh, args[1] ?? '')
          : args[2] !== undefined
          ? evalFormula(sh, args[2])
          : false;
      }

      if (fnName === 'OR') {
        for (const a of args) {
          const v = evalFormula(sh, a);
          if (typeof v === 'boolean' ? v : toNum(v) !== 0) return true;
        }
        return false;
      }

      if (fnName === 'ISBLANK') {
        const v = evalFormula(sh, args[0] ?? '');
        return v === null || v === '';
      }

      if (fnName === 'ABS') {
        const v = evalFormula(sh, args[0] ?? '');
        if (isErrorVal(v)) return v;
        return Math.abs(toNum(v));
      }

      if (fnName === 'MID') {
        const s = String(evalFormula(sh, args[0] ?? '') ?? '');
        const start = Math.max(1, Math.floor(toNum(evalFormula(sh, args[1] ?? '1'))));
        const len = Math.max(0, Math.floor(toNum(evalFormula(sh, args[2] ?? '0'))));
        return s.slice(start - 1, start - 1 + len);
      }

      // Collect values across range or scalar args
      const collectValues = (): CellValue[] => {
        const vals: CellValue[] = [];
        for (const a of args) {
          if (a.includes(':')) {
            vals.push(...resolveRangeValues(sh, a));
          } else {
            vals.push(evalFormula(sh, a));
          }
        }
        return vals;
      };

      if (fnName === 'SUM') {
        const vals = collectValues();
        for (const v of vals) {
          if (isErrorVal(v)) return v;
        }
        return vals.reduce<number>((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);
      }

      if (fnName === 'AVERAGE') {
        const vals = collectValues();
        const nums: number[] = [];
        for (const v of vals) {
          if (isErrorVal(v)) return v;
          if (typeof v === 'number' && Number.isFinite(v)) nums.push(v);
        }
        if (nums.length === 0) return '#DIV/0!';
        return nums.reduce((a, b) => a + b, 0) / nums.length;
      }

      if (fnName === 'AVERAGEIF') {
        const rangeVals = resolveRangeValues(sh, args[0] ?? '');
        const nums = rangeVals.filter(
          (v): v is number => typeof v === 'number' && Number.isFinite(v) && v !== 0
        );
        if (nums.length === 0) return '#DIV/0!';
        return nums.reduce((a, b) => a + b, 0) / nums.length;
      }

      if (fnName === 'MEDIAN') {
        const vals = collectValues();
        const nums = vals
          .filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
          .sort((a, b) => a - b);
        if (nums.length === 0) return '#DIV/0!';
        const mid = Math.floor(nums.length / 2);
        return nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
      }

      if (fnName === 'CAGR') {
        const vals = resolveRangeValues(sh, args[0] ?? '');
        const pos = vals.filter(
          (v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0
        );
        if (pos.length <= 1) return '#N/A';
        return Math.pow(pos[pos.length - 1] / pos[0], 1 / (pos.length - 1)) - 1;
      }
    }

    // 8. Cell reference (possibly with sheet prefix, e.g. 'DCF 10 years'!H26 or B5)
    if (/^(?:'[^']+'!|[A-Za-z0-9_ ]+!)?\$?[A-Z]{1,2}\$?\d+$/.test(expr)) {
      return resolveSingleRef(sh, expr);
    }

    return expr;
  }

  // Evaluate all cells in all sheets
  for (const sh of sheets) {
    for (const ref of Object.keys(sh.cells)) {
      evalCell(sh, ref);
    }
  }

  return cache;
}
