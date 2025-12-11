'use client';

import { Box, Button, Flex, RadioGroup, Select, Table, Text, TextField } from '@radix-ui/themes';
import { Search } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

type SearchType = 'reception_date' | 'event_date';

interface SearchFormData {
  search_type: SearchType;
  start_date: string;
  end_date: string;
  company: string;
  product_type: string;
  product_name: string;
  client_name: string;
  status: string;
  payment_status: string;
}

export function SearchForm() {
  const { register, control, handleSubmit } = useForm<SearchFormData>({
    defaultValues: {
      search_type: 'reception_date',
      start_date: '',
      end_date: '',
      company: '',
      product_type: '',
      product_name: '',
      client_name: '',
      status: '',
      payment_status: ''
    }
  });

  const onSubmit = (data: SearchFormData) => {
    console.log('검색 데이터:', data);
  };

  return (
    <Box mb='4'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Table.Root variant='surface'>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <Text as='div' size='2' weight='medium' mb='2'>
                  조회구분
                </Text>
                <Controller
                  name='search_type'
                  control={control}
                  render={({ field }) => (
                    <RadioGroup.Root value={field.value} onValueChange={field.onChange}>
                      <Flex gap='2'>
                        <Text as='label' size='2'>
                          <RadioGroup.Item value='reception_date' /> 접수일
                        </Text>
                        <Text as='label' size='2'>
                          <RadioGroup.Item value='event_date' /> 행사일
                        </Text>
                      </Flex>
                    </RadioGroup.Root>
                  )}
                />
              </Table.Cell>

              <Table.Cell>
                <Text as='div' size='2' weight='medium' mb='2'>
                  조회일자
                </Text>
                <Flex gap='1' align='center'>
                  <TextField.Root type='date' size='2' {...register('start_date')} />
                  <Text size='1'>~</Text>
                  <TextField.Root type='date' size='2' {...register('end_date')} />
                </Flex>
              </Table.Cell>

              <Table.Cell>
                <Text as='div' size='2' weight='medium' mb='2'>
                  예약회사
                </Text>
                <Controller
                  name='company'
                  control={control}
                  render={({ field }) => (
                    <Select.Root value={field.value} onValueChange={field.onChange} size='2'>
                      <Select.Trigger placeholder='전체' className='w-full' />
                      <Select.Content>
                        <Select.Item value='전체'>전체</Select.Item>
                        <Select.Item value='company1'>회사1</Select.Item>
                        <Select.Item value='company2'>회사2</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  )}
                />
              </Table.Cell>

              <Table.Cell>
                <Text as='div' size='2' weight='medium' mb='2'>
                  상품구분
                </Text>
                <Controller
                  name='product_type'
                  control={control}
                  render={({ field }) => (
                    <Select.Root value={field.value} onValueChange={field.onChange} size='2'>
                      <Select.Trigger placeholder='전체' className='w-full' />
                      <Select.Content>
                        <Select.Item value='전체'>전체</Select.Item>
                        <Select.Item value='flight'>항공</Select.Item>
                        <Select.Item value='hotel'>호텔</Select.Item>
                        <Select.Item value='tour'>선택관광</Select.Item>
                        <Select.Item value='rental_car'>렌터카</Select.Item>
                        <Select.Item value='insurance'>보험</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  )}
                />
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell>
                <Text as='div' size='2' weight='medium' mb='2'>
                  상품명
                </Text>
                <TextField.Root size='2' {...register('product_name')} />
              </Table.Cell>

              <Table.Cell>
                <Text as='div' size='2' weight='medium' mb='2'>
                  고객명
                </Text>
                <TextField.Root size='2' {...register('client_name')} />
              </Table.Cell>

              <Table.Cell>
                <Text as='div' size='2' weight='medium' mb='2'>
                  진행상태
                </Text>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <Select.Root value={field.value} onValueChange={field.onChange} size='2'>
                      <Select.Trigger placeholder='전체' className='w-full' />
                      <Select.Content>
                        <Select.Item value='전체'>전체</Select.Item>
                        <Select.Item value='Pending'>예약요청</Select.Item>
                        <Select.Item value='InProgress'>예약진행</Select.Item>
                        <Select.Item value='Confirmed'>예약완료</Select.Item>
                        <Select.Item value='Cancelled'>취소완료</Select.Item>
                        <Select.Item value='Refunded'>환불완료</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  )}
                />
              </Table.Cell>

              <Table.Cell>
                <Text as='div' size='2' weight='medium' mb='2'>
                  결제상태
                </Text>
                <Controller
                  name='payment_status'
                  control={control}
                  render={({ field }) => (
                    <Select.Root value={field.value} onValueChange={field.onChange} size='2'>
                      <Select.Trigger placeholder='전체' className='w-full' />
                      <Select.Content>
                        <Select.Item value='전체'>전체</Select.Item>
                        <Select.Item value='Unpaid'>미납</Select.Item>
                        <Select.Item value='Deposit'>예약금</Select.Item>
                        <Select.Item value='Full'>완불</Select.Item>
                        <Select.Item value='Refunded'>환불</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  )}
                />
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>

        <Flex justify='end' mt='2'>
          <Button type='submit' size='3'>
            <Search size={16} />
            검색
          </Button>
        </Flex>
      </form>
    </Box>
  );
}
