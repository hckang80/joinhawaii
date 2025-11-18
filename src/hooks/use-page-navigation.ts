'use client';

import { PER_PAGE } from '@/constants';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback } from 'react';

type Options = {
  queryParamName?: string;
  perPageQueryName?: string;
};

export function usePageNavigation({
  queryParamName = 'page',
  perPageQueryName = 'per_page'
}: Options = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = searchParams?.get(queryParamName) ?? '1';
  const perPage = searchParams?.get(perPageQueryName) ?? PER_PAGE;

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(
        Array.from((searchParams ?? new URLSearchParams()).entries())
      );
      params.set(queryParamName, String(newPage));
      if (!params.get(perPageQueryName)) params.set(perPageQueryName, String(perPage));
      router.push(`${pathname}?${params.toString()}`);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [router, pathname, searchParams, queryParamName, perPageQueryName, perPage]
  );

  return { handlePageChange, currentPage, perPage };
}
