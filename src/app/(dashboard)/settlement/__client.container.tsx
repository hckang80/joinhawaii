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
      width: '180px',
      key: 'reservation_id',
      header: '예약번호',
      format: (item: AllProducts) => item.reservation_id
    },
    {
      width: '120px',
      key: 'created_at',
      header: '날짜',
      format: (item: AllProducts) =>
        item.created_at ? toReadableDate(new Date(item.created_at)) : '-'
    },
    {
      width: '120px',
      key: 'booking_platform',
      header: '예약회사',
      format: (item: AllProducts) => item.booking_platform
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
      key: 'total_cost',
      header: '원가',
      format: (item: AllProducts) => (
        <Grid>
          <span>{toReadableAmount(item.total_cost)}</span>
          <span>{toReadableAmount(item.total_cost_krw, 'ko-KR', 'KRW')}</span>
        </Grid>
      ),
      excelFormat: (item: AllProducts) =>
        `${toReadableAmount(item.total_cost)}\n${toReadableAmount(item.total_cost_krw, 'ko-KR', 'KRW')}`
    },
    {
      width: '120px',
      key: 'total_amount',
      header: '판매가',
      format: (item: AllProducts) => (
        <Grid>
          <span>{toReadableAmount(item.total_amount)}</span>
          <span>{toReadableAmount(item.total_amount_krw, 'ko-KR', 'KRW')}</span>
        </Grid>
      ),
      excelFormat: (item: AllProducts) =>
        `${toReadableAmount(item.total_amount)}\n${toReadableAmount(item.total_amount_krw, 'ko-KR', 'KRW')}`
    },
    {
      width: '120px',
      key: 'refund_status',
      header: '환불',
      format: (_: AllProducts) => '-'
    },
    {
      width: '120px',
      key: 'profit',
      header: '수익',
      format: (item: AllProducts) => (
        <Grid>
          <span>{toReadableAmount(item.total_amount - item.total_cost)}</span>
          <span>
            {toReadableAmount(item.total_amount_krw - item.total_cost_krw, 'ko-KR', 'KRW')}
          </span>
        </Grid>
      ),
      excelFormat: (item: AllProducts) =>
        `${toReadableAmount(item.total_amount - item.total_cost)}\n${toReadableAmount(item.total_amount_krw - item.total_cost_krw, 'ko-KR', 'KRW')}`
    }
  ];

  return (
    <div>
      <Heading as='h2' mb='4' size='7'>
        정산관리
      </Heading>
      <Box mb='6'>
        <SearchForm
          data={data}
          columnDefs={columnDefs}
          filename={`정산관리_${toReadableDate(new Date())}.xlsx`}
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
