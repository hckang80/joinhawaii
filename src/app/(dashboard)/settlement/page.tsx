import { Loader } from '@/components';
import { PER_PAGE } from '@/constants';
import { productsQueryOptions } from '@/lib/queries';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';
import SettlementClientContainer from './__client.container';

export default async function SettlementPage({
  searchParams
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  if (Array.isArray(params?.page) || Array.isArray(params?.per_page)) {
    throw new Error('Invalid query parameters');
  }

  const page = params?.page ?? '1';
  const perPage = params?.per_page ?? PER_PAGE;

  const urlSearchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value && !Array.isArray(value)) {
        urlSearchParams.set(key, value);
      }
    });
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(productsQueryOptions(page, perPage, urlSearchParams));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loader />}>
        <SettlementClientContainer />
      </Suspense>
    </HydrationBoundary>
  );
}
