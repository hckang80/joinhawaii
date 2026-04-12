import { reservationQueryOptions } from '@/lib/queries';
import { verifyReservationToken } from '@/lib/supabase/reservation-jwt';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import ReservationPreviewClient from './__client.container';

export default async function ReservationsFormPage({
  searchParams
}: {
  searchParams: Promise<{ reservation_id?: string; token?: string }>;
}) {
  const params = await searchParams;
  const reservation_id = params.reservation_id || '';
  const token = params.token;
  const queryClient = new QueryClient();

  let allow = false;
  if (token && reservation_id) {
    allow = await verifyReservationToken(token, reservation_id);
  }

  if (reservation_id && (allow || !token)) {
    await queryClient.prefetchQuery(reservationQueryOptions(reservation_id));
  }

  // 토큰이 있는데 검증 실패 시 not found
  if (token && !allow) {
    return null;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReservationPreviewClient reservation_id={reservation_id} />
    </HydrationBoundary>
  );
}
