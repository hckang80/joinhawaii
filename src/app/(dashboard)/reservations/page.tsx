import { productsQueryOptions } from '@/lib/queries';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import ReservationsClientContainer from './__client.container';

export default async function ReservationsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(productsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReservationsClientContainer />
    </HydrationBoundary>
  );
}
