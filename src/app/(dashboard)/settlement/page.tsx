import { productsQueryOptions } from '@/lib/queries';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import SettlementClientContainer from './__client.container';

export default async function SettlementPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(productsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettlementClientContainer />
    </HydrationBoundary>
  );
}
