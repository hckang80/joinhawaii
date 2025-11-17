'use client';

type PaginateProps = {
  total: number;
};

export function Paginate({ total }: PaginateProps) {
  return <div>{total}</div>;
}
