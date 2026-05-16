import { reservationQueryOptions } from '@/lib/queries';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import VoucherHotelClientContainer from './__client.container';

type VoucherHotelPageProps = {
  searchParams: Promise<{
    reservation_id?: string;
    hotel_id?: string;
  }>;
};

export default async function VoucherHotelPage({ searchParams }: VoucherHotelPageProps) {
  const params = await searchParams;
  const reservationId = params.reservation_id || '';
  const queryClient = new QueryClient();

  if (reservationId) {
    await queryClient.prefetchQuery(reservationQueryOptions(reservationId));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VoucherHotelClientContainer reservationId={reservationId} hotelId={params.hotel_id} />
    </HydrationBoundary>
  );
}
