import type { AllProducts, ReservationResponse } from '@/types';

export const fetchSettlement = async <T = ReservationResponse[]>(id?: string): Promise<T> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const url = id
      ? `${baseUrl}/api/reservation?reservationId=${id}`
      : `${baseUrl}/api/reservation`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || '예약 조회 실패');
    }

    return result.data;
  } catch (error) {
    console.error('예약 조회 중 에러 발생:', error);
    const result = id ? {} : [];
    return result as T;
  }
};

export const fetchProducts = async (): Promise<AllProducts[]> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const url = `${baseUrl}/api/product`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || '예약 조회 실패');
    }

    return result.data;
  } catch (error) {
    console.error('예약 조회 중 에러 발생:', error);
    return [];
  }
};
