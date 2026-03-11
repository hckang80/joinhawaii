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
      format: (item: AllProducts) => item.reservation_id
    },
    {
      width: '100px',
      key: 'type',
      header: '상품구분',
      format: (item: AllProducts) => (
        <Badge size='3' color={PRODUCT_COLOR[item.type]}>
          {PRODUCT_LABEL[item.type]}
        </Badge>
      ),
      excelFormat: (item: AllProducts) => PRODUCT_LABEL[item.type]
    },
    {
      width: '100px',
      key: 'main_client_name',
      header: '고객명',
      format: (item: AllProducts) => item.main_client_name
    },
    {
      width: '300px',
      key: 'product_name',
      header: '상품명',
      format: (item: AllProducts) => (
        <>
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
        </>
      ),
      excelFormat: (item: AllProducts) => {
        const options =
          item.additional_options.length > 0
            ? `\n${item.additional_options.map(({ title }) => title).join(', ')}`
            : '';
        return `${item.product_name}${options}`;
      }
    },
    {
      width: '120px',
      key: 'event_date',
      header: '행사일',
      format: (item: AllProducts) =>
        item.event_date ? toReadableDate(new Date(item.event_date)) : '-'
    },
    {
      width: '120px',
      key: 'created_at',
      header: '접수일',
      format: (item: AllProducts) =>
        item.created_at ? toReadableDate(new Date(item.created_at)) : '-'
    },
    {
      width: '140px',
      key: 'status',
      header: '진행상태',
      format: (item: AllProducts) => (
        <Badge size='3' color={PRODUCT_STATUS_COLOR[item.status]} variant='soft'>
          {ProductStatus[item.status]}
        </Badge>
      ),
      excelFormat: (item: AllProducts) => ProductStatus[item.status]
    },
    {
      width: '100px',
      key: 'payment_status',
      header: '결제상태',
      format: (item: AllProducts) => (
        <Badge size='3' color={PAYMENT_STATUS_COLOR[item.payment_status]} variant='soft'>
          {PaymentStatus[item.payment_status]}
        </Badge>
      ),
      excelFormat: (item: AllProducts) => PaymentStatus[item.payment_status]
    },
    {
      width: '120px',
      key: 'booking_platform',
      header: '예약회사',
      format: (item: AllProducts) => item.booking_platform
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
                {columnDefs.map(col => (
                  <Table.Cell key={col.key}>{col.format(item)}</Table.Cell>
                ))}
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
