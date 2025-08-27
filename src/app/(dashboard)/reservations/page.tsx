import { fetchProducts } from '@/http';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../constants';
import ReservationsClientContainer from './__client.container';

export default async function ReservationsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.products.all,
    queryFn: fetchProducts
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReservationsClientContainer />
    </HydrationBoundary>
  );
}
