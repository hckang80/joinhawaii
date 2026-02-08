'use client';

import { PRODUCT_OPTIONS } from '@/constants';
import { createReservation, updateReservation } from '@/http';
import { reservationQueryOptions } from '@/lib/queries';
import type {
  AdditionalOptions,
  ProductType,
  ReservationFormData,
  ReservationResponse
} from '@/types';
import { handleApiError, handleApiSuccess, toReadableAmount } from '@/utils';
import { observable } from '@legendapp/state';
import { Box, Button, Flex, Grid, Heading, Table, Text, TextField } from '@radix-ui/themes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import AdditionalOptionsEditor from './AdditionalOptionsEditor';
import ClientForm from './ClientForm';
import FlightForm from './FlightForm';
import HotelForm from './HotelForm';
import InsuranceForm from './InsuranceForm';
import styles from './page.module.css';
import RentalCarForm from './RentalCarForm';
import TourForm from './TourForm';

const status$ = observable({
  reservationIndex: 0,
  isAdditionalOptionsOpen: false,
  additionalOptionsContext: {} as Partial<{
    id: number;
    type: ProductType;
    title: string;
    data: AdditionalOptions[];
  }>
});

export default function ReservationsFormClientContainer({
  reservation_id
}: {
  reservation_id: string;
}) {
  const { data, refetch } = useQuery({
    ...reservationQueryOptions(reservation_id!),
    enabled: !!reservation_id
  });

  const isModify = !!reservation_id;

  const {
    handleSubmit,
    formState: { isDirty },
    control,
    reset
  } = useForm<ReservationFormData>({
    defaultValues: {
      deposit: data?.deposit || 0,
      ...(isModify && {
        reservation_id: data?.reservation_id
      })
    }
  });

  const depositValue = useWatch({
    control,
    name: 'deposit'
  });

  const mutation = useMutation({
    mutationFn: (formData: ReservationFormData) => {
      return isModify ? updateReservation(formData) : createReservation(formData);
    },
    onSuccess: (result: { data: ReservationResponse }) => {
      handleApiSuccess(result);
      refetch();
    },
    onError: handleApiError
  });

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');
    mutation.mutate(formData, {
      onSuccess: () => reset(formData)
    });
  };

  const handleAdditionalOptions = (context: {
    id: number;
    type: ProductType;
    title: string;
    data: AdditionalOptions[];
  }) => {
    status$.additionalOptionsContext.set(context);
    status$.isAdditionalOptionsOpen.set(true);
  };

  return (
    <div className={styles.root}>
      <Heading as='h2' mb='4' size='7'>
        예약관리
      </Heading>

      <Flex asChild direction='column' gap='5'>
        <div>
          <ClientForm data={data} mutation={mutation} />

          {data && <FlightForm data={data} mutation={mutation} />}

          {data && (
            <HotelForm
              data={data}
              mutation={mutation}
              handleAdditionalOptions={handleAdditionalOptions}
            />
          )}

          {data && (
            <TourForm
              data={data}
              mutation={mutation}
              handleAdditionalOptions={handleAdditionalOptions}
            />
          )}

          {data && (
            <RentalCarForm
              data={data}
              mutation={mutation}
              handleAdditionalOptions={handleAdditionalOptions}
            />
          )}

          {data && (
            <InsuranceForm
              data={data}
              mutation={mutation}
              handleAdditionalOptions={handleAdditionalOptions}
            />
          )}

          <Flex
            justify='end'
            gap='9'
            position='sticky'
            bottom='5'
            className={styles['exchange-rate-card']}
          >
            <Box>
              <Table.Root variant='surface'>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>상품 종류</Table.ColumnHeaderCell>
                    {PRODUCT_OPTIONS.map(product => (
                      <Table.ColumnHeaderCell key={product.value} align='right'>
                        {product.label}
                      </Table.ColumnHeaderCell>
                    ))}
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.ColumnHeaderCell align='right'>
                      <Text as='div' size='3'>
                        상품
                      </Text>
                      <Text as='div'>추가옵션</Text>
                    </Table.ColumnHeaderCell>
                    {PRODUCT_OPTIONS.map(product => (
                      <Table.Cell key={product.value} width='100px' align='right'>
                        <Grid>
                          <Text size='3'>
                            {product.value === 'flight'
                              ? toReadableAmount(
                                  data?.products[product.table].reduce(
                                    (prev, curr) =>
                                      prev +
                                      (curr.status !== 'Refunded' ? curr.total_amount_krw : 0),
                                    0
                                  ),
                                  'ko-KR',
                                  'KRW'
                                )
                              : toReadableAmount(
                                  data?.products[product.table].reduce(
                                    (prev, curr) =>
                                      prev + (curr.status !== 'Refunded' ? curr.total_amount : 0),
                                    0
                                  )
                                )}
                          </Text>
                          <Text>
                            {product.value === 'flight'
                              ? '-'
                              : toReadableAmount(
                                  data?.products[product.table].reduce(
                                    (prev, curr) =>
                                      prev +
                                      (curr.status !== 'Refunded'
                                        ? curr.additional_options?.reduce(
                                            (sum, opt) =>
                                              sum +
                                              (opt.status !== 'Refunded' ? opt.total_amount : 0),
                                            0
                                          )
                                        : 0),
                                    0
                                  )
                                )}
                          </Text>
                        </Grid>
                      </Table.Cell>
                    ))}
                  </Table.Row>
                </Table.Body>
              </Table.Root>
            </Box>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Flex direction='column' align='end' gap='2'>
                <Flex align='center' gap='1'>
                  <Text as='label' weight='medium'>
                    예약금{' '}
                  </Text>
                  $
                  <Controller
                    name='deposit'
                    control={control}
                    rules={{
                      required: true,
                      validate: value => {
                        const numValue = value ? Number(value) : 0;
                        return numValue <= Number(data?.total_amount);
                      }
                    }}
                    render={({ field }) => (
                      <TextField.Root
                        size='3'
                        type='number'
                        step='0.01'
                        max={Number(data?.total_amount)}
                        inputMode='decimal'
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? 0 : +value);
                        }}
                        placeholder='0'
                      />
                    )}
                  />
                  <Button disabled={mutation.isPending} size='3'>
                    저장
                  </Button>
                </Flex>
                <div>
                  <Text as='label' weight='medium'>
                    잔금{' '}
                  </Text>
                  {toReadableAmount(Number(data?.total_amount ?? 0) - (depositValue || 0))}
                </div>
                <div>
                  <Text as='label' weight='medium'>
                    총액{' '}
                  </Text>
                  {toReadableAmount(Number(data?.total_amount ?? 0))}
                </div>
                <div>
                  <Text as='label' weight='medium'>
                    한화{' '}
                  </Text>
                  {toReadableAmount(Number(data?.total_amount_krw ?? 0), 'ko-KR', 'KRW')}
                </div>
              </Flex>
              <Text as='p' align='right' mt='2' weight='bold' color='ruby'>
                환율이 입력된 상품만 한화에 반영됩니다.
              </Text>
            </form>
          </Flex>
        </div>
      </Flex>

      <AdditionalOptionsEditor
        isOpen={status$.isAdditionalOptionsOpen}
        context={status$.additionalOptionsContext}
        onRefetch={refetch}
      />
    </div>
  );
}
