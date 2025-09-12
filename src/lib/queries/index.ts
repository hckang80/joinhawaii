import { QUERY_KEYS } from '@/constants';
import { fetchProducts } from '@/http';
import { queryOptions } from '@tanstack/react-query';

export const productsQueryOptions = queryOptions({
  queryKey: QUERY_KEYS.products.all,
  queryFn: fetchProducts,
  staleTime: 5 * 60 * 1000
});
