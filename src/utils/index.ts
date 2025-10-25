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
  exchange_rate = 0,
  days = 1
}) {
  const total_amount =
    adult_count * adult_price + children_count * children_price + kids_count * kids_price * days;

  const total_cost =
    adult_count * adult_cost + children_count * children_cost + kids_count * kids_cost * days;

  const total_amount_krw = Math.round(total_amount * exchange_rate) || 0;
  const cost_amount_krw = Math.round(total_cost * exchange_rate) || 0;

  return {
    total_amount,
    total_cost,
    total_amount_krw,
    cost_amount_krw
  };
}

/**
 * Format a Korean resident ID string by:
 * - removing all non-digit characters,
 * - limiting to a maximum of 13 digits (6 + 7),
 * - inserting a hyphen after the first 6 digits if more than 6 digits exist.
 *
 * Examples:
 *   formatResidentId('9001011234567') => '900101-1234567'
 *   formatResidentId('900101') => '900101'
 *   formatResidentId('900101-1234567') => '900101-1234567'
 *
 * @param {string} input - Raw input string (may contain digits and non-digits).
 * @returns {string} Formatted resident id (e.g. 'YYMMDD-XXXXXXX') or partial digits while typing.
 */
export function formatResidentId(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 6)}-${digits.slice(6)}`;
}
