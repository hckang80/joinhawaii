import { Loader } from '@/components';
import { productsQueryOptions } from '@/lib/queries';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';
import SettlementClientContainer from './__client.container';

export default async function SettlementPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(productsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loader />}>
        <SettlementClientContainer />
      </Suspense>
    </HydrationBoundary>
  );
}
