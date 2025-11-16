'use client';

import { PER_PAGE } from '@/constants';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import ReactPaginate from 'react-paginate';
import styles from './paginate.module.css';

type PageChangeEvent = { selected: number };

type PaginateProps = {
  total: number;
  itemsPerPage?: number;
  initialPage?: number; // zero-based
  onPageChange?: (pageIndex: number) => void; // zero-based page index
  breakLabel?: React.ReactNode;
  previousLabel?: React.ReactNode;
  nextLabel?: React.ReactNode;
  pageRangeDisplayed?: number;
  // query param name to use for page (1-based in URL). defaults to 'page'
  queryParamName?: string;
};

export function Paginate({
  total,
  itemsPerPage = +PER_PAGE,
  initialPage = 0,
  onPageChange,
  breakLabel = '...',
  previousLabel = '<',
  nextLabel = '>',
  pageRangeDisplayed = 5,
  queryParamName = 'page'
}: PaginateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // page in URL is 1-based; fallback to initialPage + 1
  const pageFromQuery =
    Number(searchParams?.get(queryParamName) ?? String(initialPage + 1)) || initialPage + 1;
  const currentPage = Math.max(0, pageFromQuery - 1);

  const pageCount = Math.max(1, Math.ceil(total / itemsPerPage));

  const handlePageClick = ({ selected }: PageChangeEvent) => {
    // update URL query param (1-based)
    const newPage = selected + 1;
    const params = new URLSearchParams(
      Array.from((searchParams ?? new URLSearchParams()).entries())
    );
    params.set(queryParamName, String(newPage));
    // preserve pathname and push new url
    router.push(`${pathname}?${params.toString()}`);
    onPageChange?.(selected);
  };

  return (
    <ReactPaginate
      breakLabel={breakLabel}
      nextLabel={nextLabel}
      onPageChange={handlePageClick}
      pageRangeDisplayed={pageRangeDisplayed}
      pageCount={pageCount}
      previousLabel={previousLabel}
      forcePage={currentPage}
      pageClassName={styles['paginate-page']}
      activeClassName={styles['paginate-page--active']}
      disabledClassName={styles['paginate-disabled']}
      containerClassName={styles.paginate}
      renderOnZeroPageCount={null as unknown as () => null}
    />
  );
}
