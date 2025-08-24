import type { ReservationResponse } from '@/types';

export const fetchSettlement = async (id?: string): Promise<ReservationResponse[]> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const url = id ? `${baseUrl}/api/settlement?reservationId=${id}` : `${baseUrl}/api/settlement`;

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
