import { QUERY_KEYS } from '@/constants/query-keys';
import { fetchProducts } from '@/http';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import SettlementClientContainer from './__client.container';

export default async function SettlementPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.products.all,
    queryFn: fetchProducts
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettlementClientContainer />
    </HydrationBoundary>
  );
}
