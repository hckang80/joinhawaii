'use client';

import { createReservation, updateReservation } from '@/http';
import { reservationQueryOptions } from '@/lib/queries';
import type { AdditionalOptions, ProductType, ReservationFormData } from '@/types';
import {
  formatKoreanCurrency,
  handleApiError,
  handleApiSuccess,
  parseKoreanCurrency,
  toReadableAmount
} from '@/utils';
import { observable } from '@legendapp/state';
import { Box, Button, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import AdditionalOptionsEditor from './AdditionalOptionsEditor';
import ClientForm from './ClientForm';
import FlightForm from './Flight';
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
    register,
    handleSubmit,
    watch,
    formState: { isDirty, dirtyFields },
    getValues,
    setValue,
    control
  } = useForm<ReservationFormData>({
    defaultValues: {
      deposit: data?.deposit || 0,
      ...(isModify && {
        reservation_id: data?.reservation_id
      })
      // clients: data?.clients || [defaultClientValues],
      // flights: data?.products.flights.length
      //   ? data.products.flights.map(flight => ({
      //       ...flight,
      //       arrival_datetime: new Date(flight.arrival_datetime).toISOString().slice(0, 16),
      //       departure_datetime: new Date(flight.departure_datetime).toISOString().slice(0, 16)
      //     }))
      //   : [],
      // hotels: data?.products.hotels.length ? data.products.hotels : [],
      // tours: data?.products.tours.length
      //   ? data.products.tours.map(tour => ({
      //       ...tour,
      //       start_date: new Date(tour.start_date).toISOString().slice(0, 16),
      //       end_date: new Date(tour.end_date).toISOString().slice(0, 16)
      //     }))
      //   : [],
      // rental_cars: data?.products.rental_cars.length ? data.products.rental_cars : [],
      // insurances: data?.products.insurances?.length ? data.products.insurances : []
    }
  });

  const mutation = useMutation({
    mutationFn: (formData: ReservationFormData) => {
      return isModify ? updateReservation(formData) : createReservation(formData);
    },
    onSuccess: (result: unknown) => {
      handleApiSuccess(result);
    },
    onError: handleApiError
  });

  // const onSubmit: SubmitHandler<ReservationFormData> = formData => {
  //   if (!isDirty) return toast.info('변경된 내용이 없습니다.');
  //   mutation.mutate(formData);
  // };

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

          <Box position='sticky' bottom='5' className={styles['exchange-rate-card']}>
            <Flex direction='column' align='end' gap='2'>
              <Flex align='center' gap='1'>
                <Text as='label' weight='medium'>
                  예약금{' '}
                </Text>
                ₩
                <Controller
                  name='deposit'
                  control={control}
                  render={({ field }) => (
                    <TextField.Root
                      size='3'
                      type='text'
                      value={formatKoreanCurrency(field.value)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const numericValue = parseKoreanCurrency(e.target.value);
                        field.onChange(numericValue);
                      }}
                      placeholder='0'
                    />
                  )}
                />
              </Flex>
              <div>
                <Text as='label' weight='medium'>
                  잔금{' '}
                </Text>
                {toReadableAmount(
                  Number(data?.total_amount_krw) - watch('deposit') || 0,
                  'ko-KR',
                  'KRW'
                )}
              </div>
              <div>
                <Text as='label' weight='medium'>
                  총액{' '}
                </Text>
                {toReadableAmount(Number(data?.total_amount_krw) || 0, 'ko-KR', 'KRW')}
              </div>
            </Flex>
            <Text as='p' align='right' mt='2' weight='bold' color='ruby'>
              환율이 입력된 상품만 총액에 반영됩니다.
            </Text>
            <Flex justify='end' align='center' gap='2' mt='2'>
              <Button disabled={mutation.isPending} size='3'>
                <Save />
                변경사항 저장
              </Button>
            </Flex>
          </Box>
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
