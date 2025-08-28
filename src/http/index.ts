import type {
  AllProducts,
  ReservationFormData,
  ReservationResponse,
  UpdateProductStatusParams
} from '@/types';

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

export const updateProductStatus = async (params: UpdateProductStatusParams) => {
  const response = await fetch('/api/product/status', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error('상품 상태 업데이트에 실패했습니다.');
  }

  return response.json();
};

export const createReservation = async (data: ReservationFormData) => {
  const response = await fetch('/api/reservation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('예약 등록 중 오류가 발생했습니다.');
  }

  return response.json();
};

export const updateReservation = async (data: ReservationFormData) => {
  const response = await fetch('/api/reservation', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('예약 변경 중 오류가 발생했습니다.');
  }

  return response.json();
};
