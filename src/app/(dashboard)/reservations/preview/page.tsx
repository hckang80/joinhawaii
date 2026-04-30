import { reservationQueryOptions } from '@/lib/queries';
import { verifyReservationToken } from '@/lib/supabase/reservation-jwt';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import ReservationPreviewClient from './__client.container';

export default async function ReservationsPreviewPage({
  searchParams
}: {
  searchParams: Promise<{ reservation_id?: string; token?: string }>;
}) {
  const params = await searchParams;
  const reservation_id = params.reservation_id || '';
  const token = params.token;
  const queryClient = new QueryClient();

  // 토큰이 있는 경우 반드시 검증 통과해야 접근 허용
  if (token) {
    const allow = reservation_id ? await verifyReservationToken(token, reservation_id) : false;
    if (!allow) {
      notFound();
    }
  }

  if (reservation_id) {
    await queryClient.prefetchQuery(reservationQueryOptions(reservation_id));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReservationPreviewClient reservation_id={reservation_id} />
    </HydrationBoundary>
  );
}
