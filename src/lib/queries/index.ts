import { PER_PAGE, QUERY_KEYS } from '@/constants';
import { fetchProducts, fetchSettlement } from '@/http';
import { queryOptions } from '@tanstack/react-query';
import { ReservationResponse } from '../../types';

export const productsQueryOptions = (
  page = '1',
  perPage = PER_PAGE,
  searchParams?: URLSearchParams
) =>
  queryOptions({
    queryKey: [QUERY_KEYS.products.all, { page, perPage, search: searchParams?.toString() }],
    queryFn: () => fetchProducts(page, perPage, searchParams),
    staleTime: 5 * 60 * 1000
  });

export const reservationQueryOptions = (reservationId: string) =>
  queryOptions({
    queryKey: QUERY_KEYS.products.detail(reservationId),
    queryFn: () => fetchSettlement<ReservationResponse>(reservationId),
    staleTime: 5 * 60 * 1000
  });
