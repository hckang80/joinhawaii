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
import type { AllProducts } from '@/types';
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
      width: '180px',
      key: 'reservation_id',
      header: '예약번호',
      format: ({ reservation_id }: AllProducts) => reservation_id
    },
    {
      width: '100px',
      key: 'type',
      header: '상품구분',
      format: ({ type }: AllProducts) => PRODUCT_LABEL[type]
    },
    {
      width: '100px',
      key: 'main_client_name',
      header: '고객명',
      format: ({ main_client_name }: AllProducts) => main_client_name
    },
    {
      width: '300px',
      key: 'product_name',
      header: '상품명',
      format: ({ product_name }: AllProducts) => product_name
    },
    {
      width: '120px',
      key: 'event_date',
      header: '행사일',
      format: ({ event_date }: AllProducts) =>
        event_date ? toReadableDate(new Date(event_date)) : '-'
    },
    {
      width: '120px',
      key: 'created_at',
      header: '접수일',
      format: ({ created_at }: AllProducts) =>
        created_at ? toReadableDate(new Date(created_at)) : '-'
    },
    {
      width: '140px',
      key: 'status',
      header: '진행상태',
      format: ({ status }: AllProducts) => ProductStatus[status]
    },
    {
      width: '100px',
      key: 'payment_status',
      header: '결제상태',
      format: ({ payment_status }: AllProducts) => PaymentStatus[payment_status]
    },
    {
      width: '120px',
      key: 'booking_platform',
      header: '예약회사',
      format: ({ booking_platform }: AllProducts) => booking_platform
    }
  ];

  return (
    <div>
      <Heading as='h2' mb='4' size='7'>
        예약관리
      </Heading>
      <Box mb='6'>
        <SearchForm
          data={data}
          columnDefs={columnDefs}
          filename={`예약관리_${toReadableDate(new Date())}.xlsx`}
        />
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
              {columnDefs.map(col => (
                <Table.ColumnHeaderCell key={col.key} width={col.width}>
                  {col.header}
                </Table.ColumnHeaderCell>
              ))}
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
