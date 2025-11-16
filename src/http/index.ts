import type {
  AdditionalOptions,
  AllProducts,
  ApiResponse,
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

export const fetchProducts = async (
  page: string,
  perPage: string
): Promise<{
  data: AllProducts[];
  meta: { total: number; per_page: number };
}> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const url = new URL(`${baseUrl}/api/product`);
    url.searchParams.set('page', page);
    url.searchParams.set('per_page', perPage);

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

    return result;
  } catch (error) {
    console.error('예약 조회 중 에러 발생:', error);
    return {
      data: [],
      meta: { total: 0, per_page: 0 }
    };
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
  const payload = {
    ...data,
    ...(data.flights && {
      flights: data.flights.map(({ total_amount_krw, total_cost_krw, ...rest }) => rest)
    }),
    ...(data.hotels && {
      hotels: data.hotels.map(({ total_amount_krw, total_cost_krw, ...rest }) => rest)
    }),
    ...(data.tours && {
      tours: data.tours.map(({ total_amount_krw, total_cost_krw, ...rest }) => rest)
    }),
    ...(data.rental_cars && {
      rental_cars: data.rental_cars.map(({ total_amount_krw, total_cost_krw, ...rest }) => rest)
    }),
    ...(data.insurances && {
      insurances: data.insurances.map(({ total_amount_krw, total_cost_krw, ...rest }) => rest)
    })
  };

  const response = await fetch('/api/reservation', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = (await response.json()) as ApiResponse<ReservationResponse>;

  if (!response.ok || !result.success) {
    throw new Error(result.error);
  }

  return result;
};

export async function updateAdditionalOptions(data: AdditionalOptions[]) {
  const payload = data.map(({ total_amount_krw, total_cost_krw, ...rest }) => rest);

  const response = await fetch('/api/product/options', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('추가 상품 생성 중 오류가 발생했습니다.');
  }

  return response.json();
}

export async function getAdditionalOptions({ pid = 0, type = '' }): Promise<AdditionalOptions[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  let url = `${baseUrl}/api/product/options`;

  const params = new URLSearchParams();
  if (pid !== undefined) params.append('pid', String(pid));
  if (type) params.append('type', type);
  if (params.toString()) url += `?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('추가 옵션 조회 중 오류가 발생했습니다.');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || '추가 옵션 조회 실패');
  }

  return result.data;
}
