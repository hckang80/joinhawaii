'use client';

import { createReservation, updateReservation } from '@/http';
import { reservationQueryOptions } from '@/lib/queries';
import type {
  AdditionalOptions,
  ProductType,
  ReservationFormData,
  ReservationSuccessResponse
} from '@/types';
import { handleApiError, handleApiSuccess, toReadableAmount } from '@/utils';
import { observable } from '@legendapp/state';
import { Box, Button, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
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
    watch,
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

  const mutation = useMutation({
    mutationFn: (formData: ReservationFormData) => {
      return isModify ? updateReservation(formData) : createReservation(formData);
    },
    onSuccess: (result: { data: ReservationSuccessResponse }) => {
      handleApiSuccess(result);
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

          <Box position='sticky' bottom='5' className={styles['exchange-rate-card']}>
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
                        return value <= Number(data?.total_amount);
                      }
                    }}
                    render={({ field }) => (
                      <TextField.Root
                        size='3'
                        type='number'
                        step='0.01'
                        inputMode='decimal'
                        value={field.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          field.onChange(+e.target.value);
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
                  {toReadableAmount(Number(data?.total_amount) - watch('deposit') || 0)}
                </div>
                <div>
                  <Text as='label' weight='medium'>
                    총액{' '}
                  </Text>
                  {toReadableAmount(Number(data?.total_amount))}
                </div>
                <div>
                  <Text as='label' weight='medium'>
                    한화{' '}
                  </Text>
                  {toReadableAmount(Number(data?.total_amount_krw), 'ko-KR', 'KRW')}
                </div>
              </Flex>
              <Text as='p' align='right' mt='2' weight='bold' color='ruby'>
                환율이 입력된 상품만 총액에 반영됩니다.
              </Text>
            </form>
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
