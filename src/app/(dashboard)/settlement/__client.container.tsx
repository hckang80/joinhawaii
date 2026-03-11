'use client';

import { Paginate, ProductOptionBadge, SearchForm } from '@/components';
import { PAYMENT_STATUS_COLOR, PaymentStatus } from '@/constants';
import { usePageNavigation } from '@/hooks';
import { productsQueryOptions } from '@/lib/queries';
import { AllProducts } from '@/types';
import { isDev, toReadableAmount, toReadableDate } from '@/utils';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Link as StyledLink,
  Table,
  Text
} from '@radix-ui/themes';
import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function SettlementClientContainer() {
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
      format: ({ reservation_id }: AllProducts) => reservation_id
    },
    {
      key: 'created_at',
      header: '날짜',
      format: ({ created_at }: AllProducts) =>
        created_at ? toReadableDate(new Date(created_at)) : '-'
    },
    {
      key: 'booking_platform',
      header: '예약회사',
      format: ({ booking_platform }: AllProducts) => booking_platform
    },
    {
      key: 'main_client_name',
      header: '고객명',
      format: ({ main_client_name }: AllProducts) => main_client_name
    },
    {
      key: 'product_name',
      header: '상품명',
      format: ({ product_name }: AllProducts) => product_name
    },
    {
      key: 'payment_status',
      header: '결제상태',
      format: ({ payment_status }: AllProducts) => PaymentStatus[payment_status]
    },
    {
      key: 'total_cost',
      header: '원가',
      format: ({ total_cost }: AllProducts) => toReadableAmount(total_cost)
    },
    {
      key: 'total_amount',
      header: '판매가',
      format: ({ total_amount }: AllProducts) => toReadableAmount(total_amount)
    },
    {
      key: 'payment_status',
      header: '한불',
      format: (_: AllProducts) => '-'
    },
    {
      key: 'payment_status',
      header: '수익',
      format: ({ total_amount, total_cost }: AllProducts) =>
        toReadableAmount(total_amount - total_cost)
    }
  ];

  return (
    <div>
      <Heading as='h2' mb='4' size='7'>
        정산관리
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
                  <Box mt='1'>
                    <ProductOptionBadge items={item.additional_options} />
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  <Badge size='3' color={PAYMENT_STATUS_COLOR[item.payment_status]} variant='soft'>
                    {PaymentStatus[item.payment_status]}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Grid>
                    <span>{toReadableAmount(item.total_cost)}</span>
                    <span>{toReadableAmount(item.total_cost_krw, 'ko-KR', 'KRW')}</span>
                  </Grid>
                </Table.Cell>
                <Table.Cell>
                  <Grid>
                    <span>{toReadableAmount(item.total_amount)}</span>
                    <span>{toReadableAmount(item.total_amount_krw, 'ko-KR', 'KRW')}</span>
                  </Grid>
                </Table.Cell>
                <Table.Cell>-</Table.Cell>
                <Table.Cell>
                  <Grid>
                    <span>{toReadableAmount(item.total_amount - item.total_cost)}</span>
                    <span>
                      {toReadableAmount(
                        item.total_amount_krw - item.total_cost_krw,
                        'ko-KR',
                        'KRW'
                      )}
                    </span>
                  </Grid>
                </Table.Cell>
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
