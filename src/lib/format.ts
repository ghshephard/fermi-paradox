const SUPERSCRIPT: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

export function superscript(n: number): string {
  return String(n)
    .split('')
    .map((c) => SUPERSCRIPT[c] ?? c)
    .join('');
}

export function formatPow10(exponent: number): string {
  return `10${superscript(exponent)}`;
}

/** Formats 10^log10Value, staying readable for values far outside float range. */
export function formatFromLog10(log10Value: number): string {
  if (log10Value >= -2 && log10Value < 4) {
    return (10 ** log10Value).toLocaleString(undefined, { maximumSignificantDigits: 3 });
  }
  let exponent = Math.floor(log10Value);
  let mantissa = 10 ** (log10Value - exponent);
  if (mantissa >= 9.95) {
    mantissa = 1;
    exponent += 1;
  }
  const m = mantissa.toFixed(1);
  return m === '1.0' ? formatPow10(exponent) : `${m} × ${formatPow10(exponent)}`;
}

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '∞';
  if (n === 0) return '0';
  return formatFromLog10(Math.log10(n));
}

export function formatPercent(p: number): string {
  if (p >= 0.9995) return '>99.9%';
  if (p <= 0.0005) return '<0.1%';
  return `${(p * 100).toFixed(1)}%`;
}
