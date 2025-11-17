'use client';

import { Paginate, ProductOptionBadge } from '@/components';
import { PRODUCT_COLOR, PRODUCT_LABEL, PRODUCT_STATUS_COLOR, ProductStatus } from '@/constants';
import { productsQueryOptions } from '@/lib/queries';
import { isDev, statusLabel, toReadableDate } from '@/utils';
import {
  Badge,
  Button,
  Card,
  Flex,
  Heading,
  Link as StyledLink,
  Table,
  Text
} from '@radix-ui/themes';
import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ReservationsClientContainer() {
  const pathname = usePathname();

  const {
    data: { data, meta }
  } = useSuspenseQuery(productsQueryOptions);
  console.log({ data, meta });
  return (
    <div>
      <Heading as='h2' mb='4' size='7'>
        예약관리
      </Heading>

      <Flex mb='4' justify='end'>
        <Button asChild color='ruby'>
          <Link href={`/reservations/form?from=${pathname}`}>신규예약등록</Link>
        </Button>
      </Flex>

      {data.length === 0 ? (
        <Card size='5'>
          <Text as='p' align='center' weight='medium'>
            데이터가 없습니다.
          </Text>
        </Card>
      ) : (
        <Table.Root variant='surface' size='3'>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell width='180px'>예약번호</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width='100px'>상품구분</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width='100px'>고객명</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width='300px'>상품명</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width='120px'>행사일</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width='120px'>접수일</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width='140px'>진행상태</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width='100px'>결제상태</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width='120px'>예약회사</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.map(item => (
              <Table.Row key={item.id + item.type}>
                <Table.Cell>{item.reservation_id}</Table.Cell>
                <Table.Cell>
                  <Badge size='3' color={PRODUCT_COLOR[item.type]}>
                    {PRODUCT_LABEL[item.type]}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{item.main_client_name}</Table.Cell>
                <Table.Cell>
                  <StyledLink
                    href={`/reservations/form?reservation_id=${item.reservation_id}&from=${pathname}#${item.type}`}
                    underline='always'
                    weight='medium'
                  >
                    {item.product_name}
                  </StyledLink>
                  <ProductOptionBadge items={item.additional_options} />
                </Table.Cell>
                <Table.Cell>{toReadableDate(new Date(item.event_date))}</Table.Cell>
                <Table.Cell>{toReadableDate(new Date(item.created_at))}</Table.Cell>
                <Table.Cell>
                  <Badge size='3' color={PRODUCT_STATUS_COLOR[item.status]} variant='soft'>
                    {ProductStatus[item.status]}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {typeof item.balance === 'number' && statusLabel(item.balance)}
                </Table.Cell>
                <Table.Cell>{item.booking_platform}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      <Paginate total={10} />

      {isDev() && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
