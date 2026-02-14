'use client';

import {
  BOOKING_PLATFORM_OPTIONS,
  CUSTOM_LABEL,
  PaymentStatus,
  PRODUCT_OPTIONS,
  ProductStatus
} from '@/constants';
import { Button, Flex, RadioGroup, Select, Table, Text, TextField } from '@radix-ui/themes';
import { Download, RefreshCcw, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type SearchType = 'reception_date' | 'event_date';

interface SearchFormData {
  search_type: SearchType;
  start_date: string;
  end_date: string;
  booking_platform: string;
  product_type: string;
  product_name: string;
  client_name: string;
  status: string;
  payment_status: string;
}

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty }
  } = useForm<SearchFormData>({
    defaultValues: {
      search_type: (searchParams.get('search_type') as SearchType) || 'reception_date',
      start_date: searchParams.get('start_date') || '',
      end_date: searchParams.get('end_date') || '',
      booking_platform: searchParams.get('booking_platform') || '전체',
      product_type: searchParams.get('product_type') || '전체',
      product_name: searchParams.get('product_name') || '',
      client_name: searchParams.get('client_name') || '',
      status: searchParams.get('status') || '전체',
      payment_status: searchParams.get('payment_status') || '전체'
    }
  });

  const handleReset = () => {
    reset();
    router.push('?');
  };

  const handleDownload = () => {
    toast.info('다운로드 기능 추가 예정');
  };

  const onSubmit = (data: SearchFormData) => {
    if (!isDirty) return;

    const params = new URLSearchParams(searchParams.toString());

    params.set('page', '1');

    Object.entries(data).forEach(([key, value]) => {
      if (value && value !== '전체') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`?${params.toString()}`);
  };

  const customBookingPlatformRef = useRef('');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Table.Root variant='surface'>
        <Table.Body>
          <Table.Row>
            <Table.Cell width='25%'>
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

            <Table.Cell width='25%'>
              <Text as='div' size='2' weight='medium' mb='2'>
                조회일자
              </Text>
              <Flex gap='1' align='center'>
                <TextField.Root type='date' size='2' {...register('start_date')} />
                <Text size='1'>~</Text>
                <Controller
                  name='end_date'
                  control={control}
                  render={({ field }) => {
                    const checkInDate = watch('start_date');
                    return (
                      <TextField.Root
                        type='date'
                        min={checkInDate || undefined}
                        value={field.value || ''}
                        onChange={field.onChange}
                        onFocus={() => {
                          if (!field.value && checkInDate) {
                            field.onChange(checkInDate);
                          }
                        }}
                      />
                    );
                  }}
                />
              </Flex>
            </Table.Cell>

            <Table.Cell width='25%'>
              <Text as='div' size='2' weight='medium' mb='2'>
                예약회사
              </Text>
              <Controller
                name='booking_platform'
                control={control}
                render={({ field }) => {
                  const isCustom =
                    field.value !== '전체' &&
                    (field.value === CUSTOM_LABEL ||
                      !Object.values(BOOKING_PLATFORM_OPTIONS)
                        .flat()
                        .some(opt => opt.value === field.value));

                  const handleSelectChange = (value: string) => {
                    if (value === CUSTOM_LABEL) {
                      field.onChange(customBookingPlatformRef.current || '');
                    } else {
                      if (isCustom && field.value && field.value !== CUSTOM_LABEL) {
                        customBookingPlatformRef.current = field.value;
                      }
                      field.onChange(value);
                    }
                  };

                  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    customBookingPlatformRef.current = e.target.value;
                    field.onChange(e.target.value);
                  };

                  return (
                    <Flex gap='2' wrap='wrap' align='center'>
                      <Select.Root
                        value={isCustom ? CUSTOM_LABEL : field.value}
                        onValueChange={handleSelectChange}
                        size='2'
                      >
                        <Select.Trigger placeholder='전체' className='w-full'>
                          {isCustom ? CUSTOM_LABEL : field.value}
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value='전체'>전체</Select.Item>
                          {Object.entries(BOOKING_PLATFORM_OPTIONS).map(([groupLabel, options]) => (
                            <div key={groupLabel}>
                              <Select.Group>
                                <Select.Label>{groupLabel}</Select.Label>
                                {options.map(({ value, label }) => (
                                  <Select.Item key={value} value={value}>
                                    {label}
                                  </Select.Item>
                                ))}
                              </Select.Group>
                              <Select.Separator />
                            </div>
                          ))}
                          <Select.Item value={CUSTOM_LABEL}>{CUSTOM_LABEL}</Select.Item>
                        </Select.Content>
                      </Select.Root>
                      {isCustom && (
                        <TextField.Root
                          value={
                            field.value === CUSTOM_LABEL
                              ? customBookingPlatformRef.current
                              : field.value
                          }
                          onChange={handleCustomInputChange}
                        />
                      )}
                    </Flex>
                  );
                }}
              />
            </Table.Cell>

            <Table.Cell width='25%'>
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
                      {PRODUCT_OPTIONS.map(({ value, label }) => (
                        <Select.Item key={value} value={value}>
                          {label}
                        </Select.Item>
                      ))}
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
                      {Object.entries(ProductStatus).map(([key, label]) => (
                        <Select.Item key={key} value={key}>
                          {label}
                        </Select.Item>
                      ))}
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
                      {Object.entries(PaymentStatus).map(([key, label]) => (
                        <Select.Item key={key} value={key}>
                          {label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>

      <Flex justify='end' mt='2' gap='2'>
        <Button type='submit'>
          <Search size={16} />
          검색
        </Button>
        <Button type='button' variant='soft' color='gray' onClick={handleReset}>
          <RefreshCcw size={16} />
          초기화
        </Button>
        <Button color='green' onClick={handleDownload}>
          <Download size={16} />
          다운로드
        </Button>
      </Flex>
    </form>
  );
}
