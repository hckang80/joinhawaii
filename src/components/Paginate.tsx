'use client';

import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import { PER_PAGE } from '../constants';

type PaginateProps = {
  total: number;
  pageSize?: number;
  current?: number;
  onChange?: (page: number) => void;
};

export function Paginate({ total, pageSize = +PER_PAGE, current = 1, onChange }: PaginateProps) {
  return (
    <Pagination
      total={total}
      pageSize={pageSize}
      current={current}
      onChange={onChange}
      showLessItems
    />
  );
}
