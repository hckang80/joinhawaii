'use client';

import { ProductOptionBadge } from '@/components';
import {
  PRODUCT_COLOR,
  PRODUCT_LABEL,
  PRODUCT_STATUS_COLOR,
  ProductStatus,
  QUERY_KEYS
} from '@/constants';
import { updateProductStatus } from '@/http';
import { productsQueryOptions } from '@/lib/queries';
import type { UpdateProductStatusParams } from '@/types';
import { handleApiError, handleApiSuccess, isDev, statusLabel, toReadableDate } from '@/utils';
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
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ReservationsClientContainer() {
  const queryClient = useQueryClient();

  const pathname = usePathname();

  const { data } = useSuspenseQuery(productsQueryOptions);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProductStatusParams) => {
      return updateProductStatus(data);
    },
    onMutate: async newData => {
      const previousProducts = queryClient.getQueryData(QUERY_KEYS.products.all);

      queryClient.setQueryData(QUERY_KEYS.products.all, (old: typeof data) => {
        return old.map(item => {
          if (item.id === newData.product_id && item.type === newData.product_type) {
            return {
              ...item,
              status: newData.status
            };
          }
          return item;
        });
      });

      return { previousProducts };
    },
    onSuccess: handleApiSuccess,
    onError: (error, _newData, context) => {
      queryClient.setQueryData(QUERY_KEYS.products.all, context?.previousProducts);
      handleApiError(error);
    }
  });

  return (
    <div>
      <Heading as='h2' mb='4' size='7'>
        예약관리
      </Heading>

      <Flex mb='4' justify='end'>
        <Button asChild color='ruby'>
          <Link href={`/reservations/form?from=${pathname}`}>예약등록</Link>
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

      {isDev() && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
