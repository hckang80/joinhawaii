export function toReadableDate(date: Date, includeTime = false) {
  const rule = includeTime ? 'toLocaleString' : 'toLocaleDateString';

  return date[rule]('ko-KR');
}

export function toReadableAmount(
  amount: number,
  locales: Intl.LocalesArgument = 'en-US',
  currency: string = 'USD'
) {
  return amount.toLocaleString(locales, { style: 'currency', currency });
}

export function isDev() {
  return process.env.NODE_ENV === 'development';
}

export const statusLabel = (balance: number) => {
  if (balance === 0) return '완불';
  if (balance > 0) return '예약금';
  return '-';
};
