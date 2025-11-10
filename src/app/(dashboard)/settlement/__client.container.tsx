'use client';

import { ProductOptionBadge } from '@/components';
import { productsQueryOptions } from '@/lib/queries';
import { isDev, statusLabel, toReadableAmount, toReadableDate } from '@/utils';
import {
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
import { usePathname } from 'next/navigation';

export default function SettlementClientContainer() {
  const { data } = useSuspenseQuery(productsQueryOptions);

  const pathname = usePathname();

  return (
    <div>
      <Heading as='h2' mb='4' size='7'>
        정산관리
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
                  <ProductOptionBadge items={item.additional_options} />
                </Table.Cell>
                <Table.Cell>
                  {typeof item.balance === 'number' && statusLabel(item.balance)}
                </Table.Cell>
                <Table.Cell>
                  <Grid>
                    <span>{toReadableAmount(item.total_cost)}</span>
                    {/* <span>{toReadableAmount(item.total_cost_krw, 'ko-KR', 'KRW')}</span> */}
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
                    {/* <span>
                      {toReadableAmount(
                        item.total_amount_krw - item.total_cost_krw,
                        'ko-KR',
                        'KRW'
                      )}
                    </span> */}
                  </Grid>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      {isDev() && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
