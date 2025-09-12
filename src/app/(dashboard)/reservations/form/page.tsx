import { reservationQueryOptions } from '@/lib/queries';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import ReservationsFormClientContainer from './__client.container';

export default async function ReservationsFormPage({
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
      <ReservationsFormClientContainer reservation_id={reservation_id} />
    </HydrationBoundary>
  );
}
