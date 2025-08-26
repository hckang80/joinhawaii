import type { AllProducts } from '@/types';
import { isDev, statusLabel, toReadableAmount, toReadableDate } from '@/utils';
import { Heading, Table } from '@radix-ui/themes';

export default function SettlementClientContainer({ data }: { data: AllProducts[] }) {
  return (
    <div>
      <Heading as='h2' mb='4' size='7'>
        정산관리
      </Heading>

      <Table.Root variant='surface' size='3'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>예약번호</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>날짜</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>예약회사</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>고객명</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>상품명</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>상품상세</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>결제상태</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>원가</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>판매가</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>환불</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>수익</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map(item => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.reservation_id}</Table.Cell>
              <Table.Cell>{toReadableDate(new Date(item.created_at))}</Table.Cell>
              <Table.Cell>-</Table.Cell>
              <Table.Cell>{item.main_client_name}</Table.Cell>
              <Table.Cell>{item.product_name}</Table.Cell>
              <Table.Cell>-</Table.Cell>
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
