'use client';

import type { AllProducts } from '@/types';
import { isDev, statusLabel, toReadableAmount, toReadableDate } from '@/utils';
import { Heading, Link as StyledLink, Table } from '@radix-ui/themes';
import { usePathname } from 'next/navigation';

export default function SettlementClientContainer({ data }: { data: AllProducts[] }) {
  const pathname = usePathname();

  return (
    <div>
      <Heading as='h2' mb='4' size='7'>
        정산관리
      </Heading>

      <Table.Root variant='surface' size='3'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell width='180px'>예약번호</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width='120px'>날짜</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width='120px'>예약회사</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width='100px'>고객명</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width='300px'>상품명</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width='100px'>결제상태</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width='120px'>원가</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width='120px'>판매가</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width='120px'>환불</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width='120px'>수익</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map(item => (
            <Table.Row key={item.id + item.type}>
              <Table.Cell>{item.reservation_id}</Table.Cell>
              <Table.Cell>{toReadableDate(new Date(item.created_at))}</Table.Cell>
              <Table.Cell>{item.booking_platform}</Table.Cell>
              <Table.Cell>{item.main_client_name}</Table.Cell>
              <Table.Cell>
                <StyledLink
                  href={`/reservations/form?reservation_id=${item.reservation_id}&from=${pathname}#${item.type}`}
                  underline='always'
                  weight='medium'
                >
                  {item.product_name}
                </StyledLink>
              </Table.Cell>
              <Table.Cell>
                {typeof item.balance === 'number' && statusLabel(item.balance)}
              </Table.Cell>
              <Table.Cell>{toReadableAmount(item.total_cost)}</Table.Cell>
              <Table.Cell>{toReadableAmount(item.total_amount)}</Table.Cell>
              <Table.Cell>-</Table.Cell>
              <Table.Cell>{toReadableAmount(item.total_amount - item.total_cost)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {isDev() && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
