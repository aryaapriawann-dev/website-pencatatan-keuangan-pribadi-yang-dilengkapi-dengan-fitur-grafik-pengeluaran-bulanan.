/**
 * Format number to Indonesian Rupiah (e.g. Rp 1.500.000)
 */
export function formatRupiah(amount: number, showSign: boolean = false): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(absAmount);

  if (showSign) {
    if (isNegative) return `-${formatted}`;
    if (amount > 0) return `+${formatted}`;
  }
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format compact Rupiah for chart axes and small badges (e.g. Rp 1,5 Jt or Rp 750 Rb)
 */
export function formatCompactRupiah(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1).replace('.0', '')} M`;
  }
  if (abs >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace('.0', '')} Jt`;
  }
  if (abs >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} Rb`;
  }
  return amount.toString();
}

/**
 * Format YYYY-MM-DD to Indonesian Date (e.g. 13 Oktober 2026)
 */
export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Format YYYY-MM-DD to short Indonesian Date (e.g. 13 Okt 2026)
 */
export function formatTanggalPendek(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

/**
 * Format Year-Month (e.g. "2026-10" -> "Oktober 2026")
 */
export function formatBulanTahun(yearMonth: string): string {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Format Year-Month short (e.g. "2026-10" -> "Okt 2026")
 */
export function formatBulanPendek(yearMonth: string): string {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return new Intl.DateTimeFormat('id-ID', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Get current Year-Month string (e.g. "2026-10")
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
