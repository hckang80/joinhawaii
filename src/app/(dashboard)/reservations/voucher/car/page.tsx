import { reservationQueryOptions } from '@/lib/queries';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import VoucherCarClientContainer from './__client.container';

type VoucherProductPageProps = {
  searchParams: Promise<{
    reservation_id?: string;
    product_id?: string;
  }>;
};

export default async function VoucherHotelPage({ searchParams }: VoucherProductPageProps) {
  const params = await searchParams;
  const reservationId = params.reservation_id || '';
  const queryClient = new QueryClient();

  if (reservationId) {
    await queryClient.prefetchQuery(reservationQueryOptions(reservationId));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VoucherCarClientContainer reservationId={reservationId} productId={params.product_id} />
    </HydrationBoundary>
  );
}
