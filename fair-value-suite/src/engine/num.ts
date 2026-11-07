/**
 * Numeric helpers that mimic spreadsheet semantics.
 *
 * `Num` is a cell value: a finite number, or `null` for an empty cell / error.
 * Functions return `null` wherever the spreadsheet would show `#DIV/0!` or an
 * empty string, so the UI can render "—".
 */
export type Num = number | null;

/** Treats empty cells as 0, the way arithmetic in Excel/Sheets does. */
export const v = (x: Num | undefined): number =>
  typeof x === 'number' && Number.isFinite(x) ? x : 0;

export const isNum = (x: unknown): x is number =>
  typeof x === 'number' && Number.isFinite(x);

/** a / b, returning null for division by zero (#DIV/0!). */
export const div = (a: Num | undefined, b: Num | undefined): Num => {
  const d = v(b);
  if (d === 0) return null;
  const r = v(a) / d;
  return Number.isFinite(r) ? r : null;
};

/** Spreadsheet AVERAGE: ignores empty cells, null when nothing to average. */
export const average = (xs: Num[]): Num => {
  const nums = xs.filter(isNum);
  if (nums.length === 0) return null;
  return nums.reduce((s, x) => s + x, 0) / nums.length;
};

/** Spreadsheet MEDIAN over numeric cells. */
export const median = (xs: Num[]): Num => {
  const nums = xs.filter(isNum).sort((a, b) => a - b);
  if (nums.length === 0) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

export const sum = (xs: Num[]): number => xs.reduce<number>((s, x) => s + v(x), 0);

/** Value / compare - 1 (e.g. "Under / Over Valued"). */
export const upside = (value: Num, compare: Num): Num => {
  const r = div(value, compare);
  return r === null ? null : r - 1;
};

/** `if(value > compare, "BUY", "SELL")` with empty cells treated as 0. */
export const signal = (value: Num, compare: Num): 'BUY' | 'SELL' =>
  v(value) > v(compare) ? 'BUY' : 'SELL';
