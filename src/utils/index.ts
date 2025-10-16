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

export const formatKoreanCurrency = (value: number | string) => {
  const numValue = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) : value;
  return isNaN(numValue) ? '' : numValue.toLocaleString('ko-KR');
};

export const parseKoreanCurrency = (value: string) => {
  return parseInt(value.replace(/,/g, '')) || 0;
};

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
  toast(error.message, { type: 'error' });
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

export function calculateTotalAmount({
  adult_count = 0,
  children_count = 0,
  kids_count = 0,
  adult_price = 0,
  children_price = 0,
  kids_price = 0,
  adult_cost = 0,
  children_cost = 0,
  kids_cost = 0,
  exchange_rate = 0
}) {
  return {
    total_amount:
      adult_count * adult_price + children_count * children_price + kids_count * kids_price,
    total_cost: adult_count * adult_cost + children_count * children_cost + kids_count * kids_cost,
    total_amount_krw:
      Math.round(
        (adult_count * adult_price + children_count * children_price + kids_count * kids_price) *
          exchange_rate
      ) || 0,
    cost_amount_krw:
      Math.round(
        (adult_count * adult_cost + children_count * children_cost + kids_count * kids_cost) *
          exchange_rate
      ) || 0
  };
}
