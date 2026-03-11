'use client';

import { Paginate, ProductOptionBadge, SearchForm } from '@/components';
import {
  PAYMENT_STATUS_COLOR,
  PaymentStatus,
  PRODUCT_COLOR,
  PRODUCT_LABEL,
  PRODUCT_STATUS_COLOR,
  ProductStatus
} from '@/constants';
import { usePageNavigation } from '@/hooks';
import { productsQueryOptions } from '@/lib/queries';
import type { PaymentStatusKey, ProductStatusKey, ProductType } from '@/types';
import { isDev, toReadableDate } from '@/utils';
import {
  Badge,
  Box,
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
import { usePathname, useSearchParams } from 'next/navigation';

export default function ReservationsClientContainer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { handlePageChange, currentPage, perPage } = usePageNavigation();

  const {
    data: { data, meta }
  } = useSuspenseQuery(productsQueryOptions(currentPage, perPage, searchParams));

  const columnDefs = [
    {
      key: 'reservation_id',
      header: '예약번호',
      format: (v: unknown) => v
    },
    {
      key: 'type',
      header: '상품구분',
      format: (v: unknown) => PRODUCT_LABEL[v as ProductType]
    },
    {
      key: 'main_client_name',
      header: '고객명',
      format: (v: unknown) => v
    },
    {
      key: 'product_name',
      header: '상품명',
      format: (v: unknown) => v
    },
    {
      key: 'event_date',
      header: '행사일',
      format: (v: unknown) => (v ? toReadableDate(new Date(v as string)) : '-')
    },
    {
      key: 'created_at',
      header: '접수일',
      format: (v: unknown) => (v ? toReadableDate(new Date(v as string)) : '-')
    },
    {
      key: 'status',
      header: '진행상태',
      format: (v: unknown) => ProductStatus[v as ProductStatusKey]
    },
    {
      key: 'payment_status',
      header: '결제상태',
      format: (v: unknown) => PaymentStatus[v as PaymentStatusKey]
    },
    {
      key: 'booking_platform',
      header: '예약회사',
      format: (v: unknown) => v
    }
  ];

  return (
    <div>
      <Heading as='h2' mb='4' size='7'>
        예약관리
      </Heading>
      <Box mb='6'>
        <SearchForm data={data} columnDefs={columnDefs} />
      </Box>
      <Flex mb='4' justify='end'>
        <Button asChild color='ruby' size='3'>
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
                  <Box mt='1'>
                    <ProductOptionBadge items={item.additional_options} />
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  {item.event_date ? toReadableDate(new Date(item.event_date)) : '-'}
                </Table.Cell>
                <Table.Cell>{toReadableDate(new Date(item.created_at))}</Table.Cell>
                <Table.Cell>
                  <Badge size='3' color={PRODUCT_STATUS_COLOR[item.status]} variant='soft'>
                    {ProductStatus[item.status]}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge size='3' color={PAYMENT_STATUS_COLOR[item.payment_status]} variant='soft'>
                    {PaymentStatus[item.payment_status]}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{item.booking_platform}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      <Flex mt='5' justify='center'>
        <Paginate
          total={meta.total}
          current={+currentPage}
          pageSize={+perPage}
          onChange={handlePageChange}
        />
      </Flex>

      {isDev() && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
