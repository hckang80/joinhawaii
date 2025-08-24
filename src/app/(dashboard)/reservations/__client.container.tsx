import type { AllProducts } from '@/types';
import { Heading, Table } from '@radix-ui/themes';
import { toReadableDate } from '../../../utils';

export default function ReservationsClientContainer({ data }: { data: AllProducts[] }) {
  return (
    <div>
      <Heading as='h2' mb='4' size='7'>
        예약관리
      </Heading>

      <Table.Root variant='surface' size='3'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>번호</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>상품구분</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>고객명</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>상품명</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>행사일</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>접수일</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>진행상태</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>결제상태</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>예약회사</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map(item => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.id}</Table.Cell>
              <Table.Cell>{item.type}</Table.Cell>
              <Table.Cell>{item.main_client_name}</Table.Cell>
              <Table.Cell>{item.product_name}</Table.Cell>
              <Table.Cell>{toReadableDate(new Date(item.event_date))}</Table.Cell>
              <Table.Cell>{toReadableDate(new Date(item.created_at))}</Table.Cell>
              <Table.Cell>-</Table.Cell>
              <Table.Cell>-</Table.Cell>
              <Table.Cell>-</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
