import { PER_PAGE, QUERY_KEYS } from '@/constants';
import { fetchProducts, fetchSettlement } from '@/http';
import { queryOptions } from '@tanstack/react-query';
import { ReservationResponse } from '../../types';

export const productsQueryOptions = (page = '1', perPage = PER_PAGE) =>
  queryOptions({
    queryKey: [QUERY_KEYS.products.all, { page, perPage }],
    queryFn: () => fetchProducts(page, perPage),
    staleTime: 5 * 60 * 1000
  });

export const reservationQueryOptions = (reservationId: string) =>
  queryOptions({
    queryKey: QUERY_KEYS.products.detail(reservationId),
    queryFn: () => fetchSettlement<ReservationResponse>(reservationId),
    staleTime: 5 * 60 * 1000
  });
