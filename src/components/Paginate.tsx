'use client';

import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import { PER_PAGE } from '../constants';

type PaginateProps = {
  total: number;
  pageSize?: number;
  // current page (1-based)
  current?: number;
  // called with new page (1-based)
  onChange?: (page: number) => void;
  className?: string;
};

export function Paginate({
  total,
  pageSize = +PER_PAGE,
  current = 1,
  onChange,
  className
}: PaginateProps) {
  return (
    <div className={className}>
      <Pagination
        total={total}
        pageSize={pageSize}
        current={current}
        onChange={onChange}
        showLessItems
      />
    </div>
  );
}
