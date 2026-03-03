import { reservationQueryOptions } from '@/lib/queries';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import ProgressClientContainer from './__client.container';

export default async function ProgressPage({
  searchParams
}: {
  searchParams: Promise<{ reservation_id?: string }>;
}) {
  const reservation_id = (await searchParams).reservation_id || '';
  const queryClient = new QueryClient();

  if (reservation_id) {
    await queryClient.prefetchQuery(reservationQueryOptions(reservation_id));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProgressClientContainer reservation_id={reservation_id} />
    </HydrationBoundary>
  );
}
