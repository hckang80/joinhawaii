import { PaymentStatusKey, ProductStatusKey } from '@/types';
import type { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

export function toReadableDate(date: Date | string, includeTime = false) {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '-';

  return includeTime ? d.toLocaleString('ko-KR') : d.toLocaleDateString('ko-KR');
}

export function toReadableAmount(
  amount = 0,
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
  const total_cost_krw = Math.round(total_cost * exchange_rate) || 0;

  return {
    total_amount,
    total_cost,
    total_amount_krw,
    total_cost_krw
  };
}

/**
 * 주민등록번호 입력값을 포맷합니다.
 *
 * - 숫자 외 문자를 제거합니다.
 * - 최대 13자리(앞6자리-뒤7자리)까지만 허용합니다.
 * - 6자리 이후에 하이픈('-')을 자동으로 삽입합니다.
 *
 * 예시:
 *   formatResidentId('9001011234567') => '900101-1234567'
 *   formatResidentId('900101') => '900101'
 *   formatResidentId('900101-1234567') => '900101-1234567'
 *
 * @param {string} input - 사용자가 입력한 원시 문자열
 * @returns {string} 하이픈이 적용된 주민등록번호 또는 입력 중인 부분 문자열
 */
export function formatResidentId(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 6)}-${digits.slice(6)}`;
}

/**
 * 전화번호를 입력 형식(010-0000-0000)으로 자동 포맷합니다.
 *
 * - 숫자 외 문자를 제거하고 최대 11자리까지 허용합니다.
 * - 모바일(예: 010) 기준으로 3-4-4 포맷을 적용합니다.
 *
 * 예시:
 *   formatPhoneNumber('01012345678') => '010-1234-5678'
 *   formatPhoneNumber('010-1234-5678') => '010-1234-5678'
 *   formatPhoneNumber('01012') => '010-12'
 *
 * @param {string} input - 원시 입력 문자열
 * @returns {string} 포맷된 전화번호 문자열
 */
export function formatPhoneNumber(input: string) {
  const digits = (input ?? '').replace(/\D/g, '').slice(0, 11); // 최대 11자리
  if (!digits) return '';

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/**
 * 입력값을 숫자로 정규화합니다.
 *
 * - '' | undefined | null 은 0으로 처리합니다.
 * - 숫자로 변환 가능한 값은 Number로 변환하여 반환합니다.
 * - 변환 불가(무한대/NaN 등)는 0을 반환합니다.
 *
 * 예:
 *   normalizeNumber('12.34') => 12.34
 *   normalizeNumber('') => 0
 *
 * @param {unknown} v - 정규화할 값
 * @returns {number} 유효한 숫자 또는 0
 */
export function normalizeNumber(v: unknown) {
  if (v === '' || v === undefined || v === null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export const getPaymentStatus = ({
  status,
  paymentStatus
}: {
  status: ProductStatusKey;
  paymentStatus: PaymentStatusKey;
}) => {
  return status === 'Refunded' ? status : paymentStatus;
};
