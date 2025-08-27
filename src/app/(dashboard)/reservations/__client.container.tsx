'use client';

import { fetchProducts, updateProductStatus } from '@/http';
import { ProductStatus, UpdateProductStatusParams } from '@/types';
import { handleApiError, handleApiSuccess, isDev, statusLabel, toReadableDate } from '@/utils';
import { Button, Flex, Heading, Select, Link as StyledLink, Table } from '@radix-ui/themes';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';

export default function ReservationsClientContainer() {
  const { data, refetch } = useSuspenseQuery({
    queryKey: ['product', 'list'],
    queryFn: async () => fetchProducts()
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProductStatusParams) => {
      return updateProductStatus(data);
    },
    onSuccess: (data: unknown) => {
      handleApiSuccess(data);
      refetch();
    },
    onError: handleApiError
  });

  const handleUpdateStatus = (data: UpdateProductStatusParams) => {
    updateMutation.mutateAsync(data);
  };

  return (
    <div>
      <Heading as='h2' mb='4' size='7'>
        예약관리
      </Heading>

      <Flex mb='4' justify='end'>
        <Button asChild color='ruby'>
          <Link href='/reservations/form'>예약등록</Link>
        </Button>
      </Flex>

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
            <Table.Row key={item.id + item.type}>
              <Table.Cell>{item.reservation_id}</Table.Cell>
              <Table.Cell>{item.type}</Table.Cell>
              <Table.Cell>{item.main_client_name}</Table.Cell>
              <Table.Cell>
                <StyledLink
                  href={`/reservations/form?reservation_id=${item.reservation_id}#${item.type}`}
                  underline='always'
                  weight='medium'
                >
                  {item.product_name}
                </StyledLink>
              </Table.Cell>
              <Table.Cell>{toReadableDate(new Date(item.event_date))}</Table.Cell>
              <Table.Cell>{toReadableDate(new Date(item.created_at))}</Table.Cell>
              <Table.Cell>
                <Flex direction='column' width='120px'>
                  <Select.Root
                    value={item.status}
                    size='3'
                    onValueChange={(value: ProductStatus) =>
                      handleUpdateStatus({
                        reservation_id: item.reservation_id,
                        product_type: item.type,
                        product_id: item.id,
                        status: value
                      })
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      {Object.entries(ProductStatus).map(([key, label]) => (
                        <Select.Item key={key} value={key}>
                          {label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Table.Cell>
              <Table.Cell>
                {typeof item.balance === 'number' && statusLabel(item.balance)}
              </Table.Cell>
              <Table.Cell>{item.booking_platform}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {isDev() && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
