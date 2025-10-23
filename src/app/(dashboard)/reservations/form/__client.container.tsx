'use client';

import {
  defaultCarValues,
  defaultClientValues,
  defaultFlightValues,
  defaultHotelValues,
  defaultInsuranceValues,
  defaultTourValues
} from '@/constants';
import { createReservation, updateReservation } from '@/http';
import { reservationQueryOptions } from '@/lib/queries';
import type {
  AdditionalOptions,
  ProductFormType,
  ProductType,
  ReservationFormData,
  ReservationItem
} from '@/types';
import {
  calculateTotalAmount,
  formatKoreanCurrency,
  handleApiError,
  handleApiSuccess,
  parseKoreanCurrency,
  toReadableAmount
} from '@/utils';
import { observable } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import { Box, Button, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect } from 'react';
import {
  type Control,
  Controller,
  type SubmitHandler,
  useForm,
  type UseFormSetValue,
  useWatch
} from 'react-hook-form';
import { toast } from 'react-toastify';
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

function FlightTotalCalculator({
  index,
  setValue,
  control
}: {
  index: number;
  setValue: UseFormSetValue<ReservationFormData>;
  control: Control<ReservationFormData, unknown, ReservationFormData>;
}) {
  const watchedValues = useWatch({
    control,
    name: [
      `flights.${index}.adult_count`,
      `flights.${index}.children_count`,
      `flights.${index}.adult_price`,
      `flights.${index}.children_price`,
      `flights.${index}.adult_cost`,
      `flights.${index}.children_cost`
    ]
  });

  useEffect(() => {
    const [adult_count, children_count, adult_price, children_price, adult_cost, children_cost] =
      watchedValues;
    const { total_amount, total_cost } = calculateTotalAmount({
      adult_count,
      children_count,
      adult_price,
      children_price,
      adult_cost,
      children_cost
    });
    setValue(`flights.${index}.total_amount`, total_amount, { shouldValidate: true });
    setValue(`flights.${index}.total_cost`, total_cost, { shouldValidate: true });
  }, [watchedValues, setValue, index]);

  return null;
}

function HotelTotalCalculator({
  index,
  setValue,
  control
}: {
  index: number;
  setValue: UseFormSetValue<ReservationFormData>;
  control: Control<ReservationFormData, unknown, ReservationFormData>;
}) {
  const watchedValues = useWatch({
    control,
    name: [`hotels.${index}.nightly_rate`, `hotels.${index}.nights`, `hotels.${index}.cost`]
  });

  useEffect(() => {
    const [nightly, nights, cost] = watchedValues;
    const total = nightly * nights;
    const totalCost = cost * nights;
    setValue(`hotels.${index}.total_amount`, total, { shouldValidate: true });
    setValue(`hotels.${index}.total_cost`, totalCost, { shouldValidate: true });
  }, [watchedValues, setValue, index]);

  return null;
}

function TourTotalCalculator({
  index,
  setValue,
  control
}: {
  index: number;
  setValue: UseFormSetValue<ReservationFormData>;
  control: Control<ReservationFormData, unknown, ReservationFormData>;
}) {
  const watchedValues = useWatch({
    control,
    name: [
      `tours.${index}.adult_count`,
      `tours.${index}.children_count`,
      `tours.${index}.adult_price`,
      `tours.${index}.children_price`,
      `tours.${index}.adult_cost`,
      `tours.${index}.children_cost`
    ]
  });

  useEffect(() => {
    const [adult_count, children_count, adult_price, children_price, adult_cost, children_cost] =
      watchedValues;
    const { total_amount, total_cost } = calculateTotalAmount({
      adult_count,
      children_count,
      adult_price,
      children_price,
      adult_cost,
      children_cost
    });
    setValue(`tours.${index}.total_amount`, total_amount, { shouldValidate: true });
    setValue(`tours.${index}.total_cost`, total_cost, { shouldValidate: true });
  }, [watchedValues, setValue, index]);

  return null;
}

function CarTotalCalculator({
  index,
  setValue,
  control
}: {
  index: number;
  setValue: UseFormSetValue<ReservationFormData>;
  control: Control<ReservationFormData, unknown, ReservationFormData>;
}) {
  const watchedValues = useWatch({
    control,
    name: [
      `rental_cars.${index}.daily_rate`,
      `rental_cars.${index}.rental_days`,
      `rental_cars.${index}.cost`
    ]
  });

  useEffect(() => {
    const [nightly, rentalDays, cost] = watchedValues;
    const total = nightly * rentalDays;
    const totalCost = cost * rentalDays;
    setValue(`rental_cars.${index}.total_amount`, total, { shouldValidate: true });
    setValue(`rental_cars.${index}.total_cost`, totalCost, { shouldValidate: true });
  }, [watchedValues, setValue, index]);

  return null;
}

function InsuranceTotalCalculator({
  index,
  setValue,
  control
}: {
  index: number;
  setValue: UseFormSetValue<ReservationFormData>;
  control: Control<ReservationFormData, unknown, ReservationFormData>;
}) {
  const watchedValues = useWatch({
    control,
    name: [
      `insurances.${index}.days`,
      `insurances.${index}.adult_count`,
      `insurances.${index}.children_count`,
      `insurances.${index}.adult_price`,
      `insurances.${index}.children_price`,
      `insurances.${index}.adult_cost`,
      `insurances.${index}.children_cost`
    ]
  });

  useEffect(() => {
    const [
      days,
      adult_count,
      children_count,
      adult_price,
      children_price,
      adult_cost,
      children_cost
    ] = watchedValues;
    const { total_amount, total_cost } = calculateTotalAmount({
      days,
      adult_count,
      children_count,
      adult_price,
      children_price,
      adult_cost,
      children_cost
    });
    setValue(`insurances.${index}.total_amount`, total_amount, { shouldValidate: true });
    setValue(`insurances.${index}.total_cost`, total_cost, { shouldValidate: true });
  }, [watchedValues, setValue, index]);

  return null;
}

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
  const router = useRouter();
  const searchParams = useSearchParams();

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
      exchange_rate: 0,
      booking_platform: data?.booking_platform || '',
      main_client_name: data?.main_client_name || '',
      ...(isModify && {
        reservation_id: data?.reservation_id
      }),
      clients: data?.clients || [defaultClientValues],
      flights: data?.products.flights.length
        ? data.products.flights.map(flight => ({
            ...flight,
            arrival_datetime: new Date(flight.arrival_datetime).toISOString().slice(0, 16),
            departure_datetime: new Date(flight.departure_datetime).toISOString().slice(0, 16)
          }))
        : [],
      hotels: data?.products.hotels.length ? data.products.hotels : [],
      tours: data?.products.tours.length
        ? data.products.tours.map(tour => ({
            ...tour,
            start_date: new Date(tour.start_date).toISOString().slice(0, 16),
            end_date: new Date(tour.end_date).toISOString().slice(0, 16)
          }))
        : [],
      rental_cars: data?.products.rental_cars.length ? data.products.rental_cars : [],
      insurances: data?.products.insurances?.length ? data.products.insurances : []
    }
  });

  const isDirtyProductItem = (field: keyof ReservationItem) => !!dirtyFields[field]?.length;

  const reservationIndex = use$(status$.reservationIndex);
  const mainClientName = getValues('clients')[reservationIndex].korean_name;

  const mutation = useMutation({
    mutationFn: (formData: ReservationFormData) => {
      return isModify ? updateReservation(formData) : createReservation(formData);
    },
    onSuccess: (result: unknown) => {
      handleApiSuccess(result);
    },
    onError: handleApiError
  });

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');
    mutation.mutate(formData);
  };

  const isRemoveClientDisabled = (target = 'clients' as const) => {
    const minLength = data?.[target]?.length || 1;
    return getValues(target).length <= minLength;
  };

  const isRemoveProductDisabled = (target: `${ProductType}s`) => {
    const minLength = data?.products[target]?.length || 0;
    return getValues(target).length <= minLength;
  };

  const removeItem = (target: ProductFormType) => {
    const items = getValues(target);
    setValue(target, items.slice(0, -1));
  };

  const addClient = () => {
    setValue('clients', [...watch('clients'), defaultClientValues]);
  };

  const handleChangeReservation = (event: React.ChangeEvent<HTMLInputElement>) => {
    status$.reservationIndex.set(() => +event.target.value);
    setValue('main_client_name', getValues('clients')[+event.target.value].korean_name, {
      shouldDirty: true,
      shouldTouch: true
    });
  };

  const addDomesticFlight = () => {
    setValue('flights', [...watch('flights'), defaultFlightValues]);
  };

  const addHotel = () => {
    setValue('hotels', [...watch('hotels'), defaultHotelValues]);
  };

  const addTour = () => {
    setValue('tours', [...watch('tours'), defaultTourValues]);
  };

  const addCar = () => {
    setValue('rental_cars', [...watch('rental_cars'), defaultCarValues]);
  };

  const addInsurance = () => {
    setValue('insurances', [...watch('insurances'), defaultInsuranceValues]);
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
