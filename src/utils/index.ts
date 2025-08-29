import type { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

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

export const handleApiSuccess = (data: unknown) => {
  const message =
    typeof data === 'object' && !!data && 'message' in data && typeof data.message === 'string'
      ? data.message
      : '요청에 성공했습니다.';
  toast(message, { type: 'success' });
};

export const handleApiError = (error: Error) => {
  console.error(error);
};

export const isPostgrestError = (error: unknown): error is PostgrestError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'details' in error &&
    'hint' in error &&
    'message' in error
  );
};
