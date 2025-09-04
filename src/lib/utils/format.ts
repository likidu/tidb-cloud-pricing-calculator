export function formatCurrency(n: number, currency: string = 'USD', locale: string = 'en-US') {
  if (!Number.isFinite(n)) return '-'
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n)
}

