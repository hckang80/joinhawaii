import { Loader } from '@/components';
import { calendarQueryOptions } from '@/lib/queries';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';
import CalendarClientContainer from './__client.container';

export default async function CalendarPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(calendarQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loader />}>
        <CalendarClientContainer />
      </Suspense>
    </HydrationBoundary>
  );
}
