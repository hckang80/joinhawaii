'use client';

import {
  defaultAdditionalOptionValues,
  defaultCarValues,
  defaultClientValues,
  defaultFlightValues,
  defaultHotelValues,
  defaultInsuranceValues,
  defaultTourValues,
  GENDER_TYPE,
  PRODUCT_STATUS_COLOR,
  ProductStatus,
  REGIONS
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
  formatKoreanCurrency,
  handleApiError,
  handleApiSuccess,
  isDev,
  parseKoreanCurrency,
  toReadableAmount
} from '@/utils';
import { observable } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  Flex,
  Grid,
  Heading,
  Radio,
  Section,
  Select,
  Table,
  Text,
  TextField
} from '@radix-ui/themes';
import { useMutation, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  Binoculars,
  BookText,
  Car,
  Hotel,
  Minus,
  Plane,
  Plus,
  Save,
  UserMinus,
  UserPlus
} from 'lucide-react';
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
import styles from './page.module.css';

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
    const [adultCapacity, childrenCapacity, adultPrice, childrenPrice, adultCost, childrenCost] =
      watchedValues;
    const total = adultCapacity * adultPrice + childrenCapacity * childrenPrice;
    const totalCost = adultCapacity * adultCost + childrenCapacity * childrenCost;
    setValue(`flights.${index}.total_amount`, total, { shouldValidate: true });
    setValue(`flights.${index}.total_cost`, totalCost, { shouldValidate: true });
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
    const [
      adultParticipant,
      childrenParticipant,
      adultPrice,
      childrenPrice,
      adultCost,
      childrenCost
    ] = watchedValues;
    const total = adultParticipant * adultPrice + childrenParticipant * childrenPrice;
    const totalCost = adultParticipant * adultCost + childrenParticipant * childrenCost;
    setValue(`tours.${index}.total_amount`, total, { shouldValidate: true });
    setValue(`tours.${index}.total_cost`, totalCost, { shouldValidate: true });
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
      tripDurationDays,
      adultParticipant,
      childrenParticipant,
      adultPrice,
      childrenPrice,
      adultCost,
      childrenCost
    ] = watchedValues;
    const total =
      tripDurationDays * (adultParticipant * adultPrice + childrenParticipant * childrenPrice);
    const totalCost =
      tripDurationDays * (adultParticipant * adultCost + childrenParticipant * childrenCost);
    setValue(`insurances.${index}.total_amount`, total, { shouldValidate: true });
    setValue(`insurances.${index}.total_cost`, totalCost, { shouldValidate: true });
  }, [watchedValues, setValue, index]);

  return null;
}

function AdditionalOptionsEditor() {
  const isOpen = use$(status$.isAdditionalOptionsOpen);
  const {
    id,
    type,
    title,
    data = [defaultAdditionalOptionValues]
  } = use$(status$.additionalOptionsContext);

  const {
    watch,
    control,
    getValues,
    register,
    formState: {}
  } = useForm<{ additionalOptions: AdditionalOptions[] }>({
    defaultValues: { additionalOptions: data }
  });

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => status$.isAdditionalOptionsOpen.set(open)}>
      <Dialog.Content maxWidth='1000px'>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description size='2' mb='4'>
          날짜 표시 영역
        </Dialog.Description>
        <pre>{JSON.stringify(watch('additionalOptions'), null, 2)}</pre>
        <Table.Root size='1'>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell width='70px'>환율 관리</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width='200px'>내용</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width='80px'>💰요금</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width='70px'>수량</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width='110px'>진행상태</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>비고</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {getValues('additionalOptions').map((item, i) => (
              <Table.Row key={i}>
                <Table.Cell>
                  <Text size='1' as='label'>
                    변경{' '}
                    <Controller
                      name={`additionalOptions.${i}.is_updated_exchange_rate`}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          size='3'
                          checked={field.value}
                          onCheckedChange={value => {
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                  </Text>
                  <Text as='div' size='1' mt='1' weight='bold'>
                    {item.exchange_rate}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <TextField.Root {...register(`additionalOptions.${i}.notes`)} />
                </Table.Cell>
                <Table.Cell>
                  <Grid gap='2'>
                    <Flex direction='column'>
                      <span>🧑성인</span>
                      <TextField.Root
                        type='number'
                        min='0'
                        {...register(`additionalOptions.${i}.adult_cost`, {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                    </Flex>
                    <Flex direction='column'>
                      <span>🧒소아</span>
                      <TextField.Root
                        type='number'
                        min='0'
                        {...register(`additionalOptions.${i}.children_cost`, {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                    </Flex>
                    <Flex direction='column'>
                      <span>👶유아</span>
                      <TextField.Root
                        type='number'
                        min='0'
                        readOnly
                        {...register(`additionalOptions.${i}.kids_cost`, {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                    </Flex>
                  </Grid>
                </Table.Cell>
                <Table.Cell>
                  <Grid gap='2'>
                    <Flex direction='column'>
                      <span>🧑성인</span>
                      <TextField.Root
                        type='number'
                        min='0'
                        {...register(`additionalOptions.${i}.adult_price`, {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                    </Flex>
                    <Flex direction='column'>
                      <span>🧒소아</span>
                      <TextField.Root
                        type='number'
                        min='0'
                        {...register(`additionalOptions.${i}.children_price`, {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                    </Flex>
                    <Flex direction='column'>
                      <span>👶유아</span>
                      <TextField.Root
                        type='number'
                        min='0'
                        readOnly
                        {...register(`additionalOptions.${i}.kids_price`, {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                    </Flex>
                  </Grid>
                </Table.Cell>
                <Table.Cell>
                  <Grid gap='2'>
                    <Flex direction='column'>
                      <span>🧑성인</span>
                      <TextField.Root
                        type='number'
                        min='0'
                        {...register(`additionalOptions.${i}.adult_count`, {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                    </Flex>
                    <Flex direction='column'>
                      <span>🧒소아</span>
                      <TextField.Root
                        type='number'
                        min='0'
                        {...register(`additionalOptions.${i}.children_count`, {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                    </Flex>
                    <Flex direction='column'>
                      <span>👶유아</span>
                      <TextField.Root
                        type='number'
                        min='0'
                        {...register(`additionalOptions.${i}.kids_count`, {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                    </Flex>
                  </Grid>
                </Table.Cell>
                <Table.Cell>
                  <Controller
                    name={`additionalOptions.${i}.status`}
                    control={control}
                    render={({ field }) => (
                      <Select.Root
                        value={field.value}
                        onValueChange={value => {
                          field.onChange(value);
                        }}
                        name={field.name}
                      >
                        <Select.Trigger color={PRODUCT_STATUS_COLOR[field.value]} variant='soft'>
                          {ProductStatus[field.value]}
                        </Select.Trigger>
                        <Select.Content>
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
                  <TextField.Root {...register(`additionalOptions.${i}.notes`)} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default function ReservationsFormClientContainer({
  reservation_id
}: {
  reservation_id: string;
}) {
  const { data } = useQuery({
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
      const payload = {
        ...formData,
        main_client_name: mainClientName
      };

      return isModify ? updateReservation(payload) : createReservation(payload);
    },
    onSuccess: (result: unknown) => {
      handleApiSuccess(result);

      const fromPath = searchParams.get('from');
      if (fromPath) router.push(fromPath);
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card
            asChild
            size='3'
            className={clsx(dirtyFields.booking_platform && styles['is-dirty'])}
          >
            <Section>
              <Heading as='h3' mb='4'>
                기본정보
              </Heading>

              <Grid align='center' columns='60px 1fr 70px 1fr' gap='3'>
                <Text weight='medium'>예약회사</Text>
                <Controller
                  name='booking_platform'
                  control={control}
                  render={({ field }) => (
                    <Select.Root
                      size='3'
                      value={field.value}
                      onValueChange={value => {
                        field.onChange(value);
                      }}
                      name={field.name}
                    >
                      <Select.Trigger placeholder='예약회사 선택'>{field.value}</Select.Trigger>
                      <Select.Content>
                        <Select.Item value='마이리얼트립'>마이리얼트립</Select.Item>
                        <Select.Item value='크리에이트립'>크리에이트립</Select.Item>
                        <Select.Item value='와그'>와그</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  )}
                />
              </Grid>
            </Section>
          </Card>

          <Card asChild size='3'>
            <Section>
              <Heading as='h3' mb='4'>
                고객정보
              </Heading>
              {isDev() && (
                <div>
                  합계(달러) : {data?.total_amount}
                  <br />
                  예약자: {watch('main_client_name')}
                </div>
              )}

              <Table.Root size='1'>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell width='60px' align='center'>
                      예약자
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>이름</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='160px'>영문</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>성별</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='150px'>주민번호</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='140px'>연락처</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='180px'>이메일</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>비고</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {getValues('clients').map((client, i) => (
                    <Table.Row key={i}>
                      <Table.Cell align='center'>
                        <label>
                          <Radio
                            size='3'
                            name='reservation'
                            value={'' + i}
                            defaultChecked={
                              getValues('main_client_name')
                                ? getValues('main_client_name') === client.korean_name
                                : i === reservationIndex
                            }
                            onChange={handleChangeReservation}
                          />
                        </label>
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`clients.${i}.korean_name`}
                          control={control}
                          render={({ field }) => (
                            <TextField.Root
                              value={field.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                field.onChange(e.target.value);
                                if (i === reservationIndex) {
                                  setValue('main_client_name', e.target.value);
                                }
                              }}
                              placeholder='홍길동'
                            />
                          )}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`clients.${i}.english_name`, { required: true })}
                          placeholder='HONG GILDONG'
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`clients.${i}.gender`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              value={field.value}
                              onValueChange={value => {
                                field.onChange(value);
                              }}
                              name={field.name}
                            >
                              <Select.Trigger placeholder='성별 선택'>{field.value}</Select.Trigger>
                              <Select.Content>
                                {GENDER_TYPE.map(value => (
                                  <Select.Item value={value} key={value}>
                                    {value}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          )}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`clients.${i}.resident_id`, { required: true })}
                          placeholder='000000-0000000'
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`clients.${i}.phone_number`, { required: true })}
                          placeholder='010-0000-0000'
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`clients.${i}.email`, { required: true })}
                          placeholder='joinhawaii@gmail.com'
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root {...register(`clients.${i}.notes`)} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              <Flex justify='end' mt='4' gap='1'>
                <Button
                  title='인원 삭제'
                  type='button'
                  color='ruby'
                  variant='soft'
                  onClick={() => removeItem('clients')}
                  disabled={isRemoveClientDisabled('clients')}
                >
                  <UserMinus />
                </Button>
                <Button title='인원 추가' type='button' color='ruby' onClick={addClient}>
                  <UserPlus />
                </Button>
              </Flex>
              {isDev() && (
                <pre>
                  {JSON.stringify(
                    { isDirty: isDirtyProductItem('clients'), ...watch('clients') },
                    null,
                    2
                  )}
                </pre>
              )}
            </Section>
          </Card>

          <Card asChild size='3'>
            <Section id='flight'>
              <Heading as='h3' mb='4'>
                항공정보
              </Heading>

              <Table.Root size='1'>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell width='80px'>티켓</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='100px'>항공편</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='240px'>출발시간</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='100px'>출발지</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='240px'>도착시간</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='100px'>도착지</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💰요금</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>🧑‍🤝‍🧑인원</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='110px'>진행상태</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>비고</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {getValues('flights').map((_flight, i) => (
                    <Table.Row key={i}>
                      <Table.Cell>{/* 개별진행, 그룹항공, 블럭항공, 인디비 */}</Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`flights.${i}.flight_number`, {
                            required: true
                          })}
                          placeholder='KE001'
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='datetime-local'
                          {...register(`flights.${i}.departure_datetime`, {
                            required: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          readOnly={!i}
                          {...register(`flights.${i}.departure_city`, {
                            required: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='datetime-local'
                          {...register(`flights.${i}.arrival_datetime`, {
                            required: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`flights.${i}.arrival_city`, {
                            required: true
                          })}
                          placeholder='호놀룰루'
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑성인</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`flights.${i}.adult_cost`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒소아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`flights.${i}.children_cost`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶유아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              readOnly
                              {...register(`flights.${i}.kids_cost`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑성인</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`flights.${i}.adult_price`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒소아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`flights.${i}.children_price`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶유아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              readOnly
                              {...register(`flights.${i}.kids_price`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑성인</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`flights.${i}.adult_count`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒소아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`flights.${i}.children_count`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶유아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`flights.${i}.kids_count`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`flights.${i}.status`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              value={field.value}
                              onValueChange={value => {
                                field.onChange(value);
                              }}
                              name={field.name}
                            >
                              <Select.Trigger
                                color={PRODUCT_STATUS_COLOR[field.value]}
                                variant='soft'
                              >
                                {ProductStatus[field.value]}
                              </Select.Trigger>
                              <Select.Content>
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
                        <TextField.Root {...register(`flights.${i}.notes`)} />
                      </Table.Cell>
                      <Table.Cell hidden>
                        <FlightTotalCalculator index={i} setValue={setValue} control={control} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              {!getValues('flights').length && (
                <Flex justify='center' py='5'>
                  예약 내역이 없습니다
                </Flex>
              )}

              <Flex justify='end' mt='4' gap='1'>
                <Button
                  type='button'
                  color='ruby'
                  variant='soft'
                  onClick={() => removeItem('flights')}
                  disabled={isRemoveProductDisabled('flights')}
                >
                  <Minus size='20' /> 삭제
                </Button>
                <Button type='button' color='ruby' onClick={addDomesticFlight}>
                  <Plane size='20' />
                  항공 추가
                </Button>
              </Flex>

              {isDev() && (
                <pre>
                  {JSON.stringify(
                    { isDirty: isDirtyProductItem('flights'), ...watch('flights') },
                    null,
                    2
                  )}
                </pre>
              )}
            </Section>
          </Card>

          <Card asChild size='3'>
            <Section id='hotel'>
              <Heading as='h3' mb='4'>
                호텔
              </Heading>

              <Table.Root size='1'>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell width='70px'>환율 관리</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='120px'>지역</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='170px'>날짜</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='60px'>숙박일</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='240px'>호텔</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='120px'>객실타입</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='60px'>조식</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>리조트피</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💰1박요금</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>수량</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='90px'>CF#/VC#</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='110px'>진행상태</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>추가옵션</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>비고</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {getValues('hotels').map((hotel, i) => (
                    <Table.Row key={i}>
                      <Table.Cell>
                        <Text size='1' as='label'>
                          변경{' '}
                          <Controller
                            name={`hotels.${i}.is_updated_exchange_rate`}
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                size='3'
                                checked={field.value}
                                onCheckedChange={value => {
                                  field.onChange(value);
                                }}
                              />
                            )}
                          />
                        </Text>
                        <Text as='div' size='1' mt='1' weight='bold'>
                          {hotel.exchange_rate}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`hotels.${i}.region`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              value={field.value}
                              onValueChange={value => {
                                field.onChange(value);
                              }}
                              name={field.name}
                            >
                              <Select.Trigger placeholder='지역 선택'>{field.value}</Select.Trigger>
                              <Select.Content>
                                {REGIONS.map(value => (
                                  <Select.Item value={value} key={value}>
                                    {value}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          )}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='date'
                          {...register(`hotels.${i}.check_in_date`, {
                            required: true
                          })}
                        />
                        ~
                        <TextField.Root
                          type='date'
                          {...register(`hotels.${i}.check_out_date`, {
                            required: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='number'
                          min='1'
                          {...register(`hotels.${i}.nights`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        {/* TODO: 드랍다운으로 변경 필요 */}
                        <TextField.Root
                          {...register(`hotels.${i}.hotel_name`, {
                            required: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`hotels.${i}.room_type`, {
                            required: true
                          })}
                        />
                        {/* TODO: 1BED, 2BED, 1BED/2BED, 2BED/3BED, 3BED, 4BED */}
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`hotels.${i}.is_breakfast_included`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              size='3'
                              checked={field.value}
                              onCheckedChange={value => {
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`hotels.${i}.is_resort_fee`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              size='3'
                              checked={field.value}
                              onCheckedChange={value => {
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='number'
                          min='0'
                          {...register(`hotels.${i}.cost`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='number'
                          min='0'
                          {...register(`hotels.${i}.nightly_rate`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>???</Table.Cell>
                      <Table.Cell>바우처 조회</Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`hotels.${i}.status`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              value={field.value}
                              onValueChange={value => {
                                field.onChange(value);
                              }}
                              name={field.name}
                            >
                              <Select.Trigger
                                color={PRODUCT_STATUS_COLOR[field.value]}
                                variant='soft'
                              >
                                {ProductStatus[field.value]}
                              </Select.Trigger>
                              <Select.Content>
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
                        <Button
                          disabled={!getValues(`hotels.${i}.id`)}
                          title='추가옵션'
                          type='button'
                          onClick={() =>
                            handleAdditionalOptions({
                              id: Number(getValues(`hotels.${i}.id`)),
                              type: 'hotel',
                              title: getValues(`hotels.${i}.hotel_name`),
                              data: getValues(`hotels.${i}.additional_options`)
                            })
                          }
                        >
                          <Plus size={16} />
                        </Button>
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root {...register(`hotels.${i}.notes`)} />
                      </Table.Cell>
                      <Table.Cell hidden>
                        <HotelTotalCalculator index={i} setValue={setValue} control={control} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              {!getValues('hotels').length && (
                <Flex justify='center' py='5'>
                  예약 내역이 없습니다
                </Flex>
              )}

              <Flex justify='end' mt='4' gap='1'>
                <Button
                  type='button'
                  color='ruby'
                  variant='soft'
                  onClick={() => removeItem('hotels')}
                  disabled={isRemoveProductDisabled('hotels')}
                >
                  <Minus size='20' /> 삭제
                </Button>
                <Button type='button' color='ruby' onClick={addHotel}>
                  <Hotel size='20' />
                  호텔 추가
                </Button>
              </Flex>

              {isDev() && (
                <pre>
                  {JSON.stringify(
                    { isDirty: isDirtyProductItem('hotels'), ...watch('hotels') },
                    null,
                    2
                  )}
                </pre>
              )}
            </Section>
          </Card>

          <Card asChild size='3'>
            <Section id='tour'>
              <Heading as='h3' mb='4'>
                선택관광
              </Heading>

              <Table.Root size='1'>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell width='70px'>환율 관리</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='120px'>지역</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='240px'>날짜</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='240px'>상품명</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💰요금</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>수량</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='110px'>진행상태</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>비고</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {getValues('tours').map((tour, i) => (
                    <Table.Row key={i}>
                      <Table.Cell>
                        <Text size='1' as='label'>
                          변경{' '}
                          <Controller
                            name={`tours.${i}.is_updated_exchange_rate`}
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                size='3'
                                checked={field.value}
                                onCheckedChange={value => {
                                  field.onChange(value);
                                }}
                              />
                            )}
                          />
                        </Text>
                        <Text as='div' size='1' mt='1' weight='bold'>
                          {tour.exchange_rate}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`tours.${i}.region`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              value={field.value}
                              onValueChange={value => {
                                field.onChange(value);
                              }}
                              name={field.name}
                            >
                              <Select.Trigger placeholder='지역 선택'>{field.value}</Select.Trigger>
                              <Select.Content>
                                {REGIONS.map(value => (
                                  <Select.Item value={value} key={value}>
                                    {value}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          )}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='datetime-local'
                          {...register(`tours.${i}.start_date`, {
                            required: true
                          })}
                        />
                        ~
                        <TextField.Root
                          type='datetime-local'
                          {...register(`tours.${i}.end_date`, {
                            required: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`tours.${i}.name`, {
                            required: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑성인</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`tours.${i}.adult_cost`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒소아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`tours.${i}.children_cost`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶유아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              readOnly
                              {...register(`tours.${i}.kids_cost`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑성인</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`tours.${i}.adult_price`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒소아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`tours.${i}.children_price`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶유아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              readOnly
                              {...register(`tours.${i}.kids_price`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑성인</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`tours.${i}.adult_count`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒소아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`tours.${i}.children_count`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶유아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`tours.${i}.kids_count`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`tours.${i}.status`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              value={field.value}
                              onValueChange={value => {
                                field.onChange(value);
                              }}
                              name={field.name}
                            >
                              <Select.Trigger
                                color={PRODUCT_STATUS_COLOR[field.value]}
                                variant='soft'
                              >
                                {ProductStatus[field.value]}
                              </Select.Trigger>
                              <Select.Content>
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
                        <TextField.Root {...register(`tours.${i}.notes`)} />
                      </Table.Cell>
                      <Table.Cell hidden>
                        <TourTotalCalculator index={i} setValue={setValue} control={control} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              {!getValues('tours').length && (
                <Flex justify='center' py='5'>
                  예약 내역이 없습니다
                </Flex>
              )}

              <Flex justify='end' mt='4' gap='1'>
                <Button
                  type='button'
                  color='ruby'
                  variant='soft'
                  onClick={() => removeItem('tours')}
                  disabled={isRemoveProductDisabled('tours')}
                >
                  <Minus size='20' /> 삭제
                </Button>
                <Button type='button' color='ruby' onClick={addTour}>
                  <Binoculars size='20' />
                  선택관광 추가
                </Button>
              </Flex>

              {isDev() && (
                <pre>
                  {JSON.stringify(
                    { isDirty: isDirtyProductItem('tours'), ...watch('tours') },
                    null,
                    2
                  )}
                </pre>
              )}
            </Section>
          </Card>

          <Card asChild size='3'>
            <Section id='rental_car'>
              <Heading as='h3' mb='4'>
                렌터카
              </Heading>

              <Table.Root size='1'>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell width='70px'>환율 관리</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='120px'>지역</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='240px'>날짜</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='120px'>픽업장소</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='160px'>차종</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='160px'>운전자</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='160px'>조건</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💰1일요금</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>대여일</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='110px'>진행상태</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>비고</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {getValues('rental_cars').map((car, i) => (
                    <Table.Row key={i}>
                      <Table.Cell>
                        <Text size='1' as='label'>
                          변경{' '}
                          <Controller
                            name={`rental_cars.${i}.is_updated_exchange_rate`}
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                size='3'
                                checked={field.value}
                                onCheckedChange={value => {
                                  field.onChange(value);
                                }}
                              />
                            )}
                          />
                        </Text>
                        <Text as='div' size='1' mt='1' weight='bold'>
                          {car.exchange_rate}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`rental_cars.${i}.region`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              value={field.value}
                              onValueChange={value => {
                                field.onChange(value);
                              }}
                              name={field.name}
                            >
                              <Select.Trigger placeholder='지역 선택'>{field.value}</Select.Trigger>
                              <Select.Content>
                                {REGIONS.map(value => (
                                  <Select.Item value={value} key={value}>
                                    {value}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          )}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='date'
                          {...register(`rental_cars.${i}.pickup_date`, {
                            required: true
                          })}
                        />
                        ~
                        <TextField.Root
                          type='date'
                          {...register(`rental_cars.${i}.return_date`, {
                            required: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`rental_cars.${i}.pickup_location`, {
                            required: true
                          })}
                        />
                        <br />
                        <TextField.Root
                          type='time'
                          {...register(`rental_cars.${i}.pickup_time`, {
                            required: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`rental_cars.${i}.model`, {
                            required: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`rental_cars.${i}.driver`, {
                            required: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`rental_cars.${i}.options`, {
                            required: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='number'
                          min='0'
                          {...register(`rental_cars.${i}.cost`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='number'
                          min='0'
                          {...register(`rental_cars.${i}.daily_rate`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='number'
                          min='1'
                          {...register(`rental_cars.${i}.rental_days`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`rental_cars.${i}.status`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              value={field.value}
                              onValueChange={value => {
                                field.onChange(value);
                              }}
                              name={field.name}
                            >
                              <Select.Trigger
                                color={PRODUCT_STATUS_COLOR[field.value]}
                                variant='soft'
                              >
                                {ProductStatus[field.value]}
                              </Select.Trigger>
                              <Select.Content>
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
                        <TextField.Root {...register(`rental_cars.${i}.notes`)} />
                      </Table.Cell>
                      <Table.Cell hidden>
                        <CarTotalCalculator index={i} setValue={setValue} control={control} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              {!getValues('rental_cars').length && (
                <Flex justify='center' py='5'>
                  예약 내역이 없습니다
                </Flex>
              )}

              <Flex justify='end' mt='4' gap='1'>
                <Button
                  type='button'
                  color='ruby'
                  variant='soft'
                  onClick={() => removeItem('rental_cars')}
                  disabled={isRemoveProductDisabled('rental_cars')}
                >
                  <Minus size='20' /> 삭제
                </Button>
                <Button type='button' color='ruby' onClick={addCar}>
                  <Car size='20' />
                  렌터카 추가
                </Button>
              </Flex>

              {isDev() && (
                <pre>
                  {JSON.stringify(
                    { isDirty: isDirtyProductItem('rental_cars'), ...watch('rental_cars') },
                    null,
                    2
                  )}
                </pre>
              )}
            </Section>
          </Card>

          <Card asChild size='3'>
            <Section id='insurance'>
              <Heading as='h3' mb='4'>
                보험사
              </Heading>

              <Table.Root size='1'>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell width='70px'>환율 관리</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='120px'>보험사</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='170px'>날짜</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>여행일수</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💰요금</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>수량</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='110px'>진행상태</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>비고</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {getValues('insurances').map((insurance, i) => (
                    <Table.Row key={i}>
                      <Table.Cell>
                        <Text size='1' as='label'>
                          변경{' '}
                          <Controller
                            name={`insurances.${i}.is_updated_exchange_rate`}
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                size='3'
                                checked={field.value}
                                onCheckedChange={value => {
                                  field.onChange(value);
                                }}
                              />
                            )}
                          />
                        </Text>
                        <Text as='div' size='1' mt='1' weight='bold'>
                          {insurance.exchange_rate}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`insurances.${i}.company`, {
                            required: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='date'
                          {...register(`insurances.${i}.start_date`, {
                            required: true
                          })}
                        />
                        ~
                        <TextField.Root
                          type='date'
                          {...register(`insurances.${i}.end_date`, {
                            required: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='number'
                          min='1'
                          {...register(`insurances.${i}.days`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑성인</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`insurances.${i}.adult_cost`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒소아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`insurances.${i}.children_cost`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶유아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              readOnly
                              {...register(`insurances.${i}.kids_cost`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑성인</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`insurances.${i}.adult_price`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒소아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`insurances.${i}.children_price`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶유아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              readOnly
                              {...register(`insurances.${i}.kids_price`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑성인</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`insurances.${i}.adult_count`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒소아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`insurances.${i}.children_count`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶유아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`insurances.${i}.kids_count`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`insurances.${i}.status`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              value={field.value}
                              onValueChange={value => {
                                field.onChange(value);
                              }}
                              name={field.name}
                            >
                              <Select.Trigger
                                color={PRODUCT_STATUS_COLOR[field.value]}
                                variant='soft'
                              >
                                {ProductStatus[field.value]}
                              </Select.Trigger>
                              <Select.Content>
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
                        <TextField.Root {...register(`insurances.${i}.notes`)} />
                      </Table.Cell>
                      <Table.Cell hidden>
                        <InsuranceTotalCalculator index={i} setValue={setValue} control={control} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              {!getValues('insurances').length && (
                <Flex justify='center' py='5'>
                  예약 내역이 없습니다
                </Flex>
              )}

              <Flex justify='end' mt='4' gap='1'>
                <Button
                  type='button'
                  color='ruby'
                  variant='soft'
                  onClick={() => removeItem('insurances')}
                  disabled={isRemoveProductDisabled('insurances')}
                >
                  <Minus size='20' /> 삭제
                </Button>
                <Button type='button' color='ruby' onClick={addInsurance}>
                  <BookText size='20' />
                  보험 추가
                </Button>
              </Flex>

              {isDev() && (
                <pre>
                  {JSON.stringify(
                    { isDirty: isDirtyProductItem('insurances'), ...watch('insurances') },
                    null,
                    2
                  )}
                </pre>
              )}
            </Section>
          </Card>

          <Box position='sticky' bottom='5' className={styles['exchange-rate-card']}>
            <Flex justify='end' align='center' gap='2'>
              <Text as='label' weight='medium'>
                총액
              </Text>
              {toReadableAmount(Number(data?.total_amount_krw) || 0, 'ko-KR', 'KRW')}
              <Text as='label' weight='medium'>
                예약금
              </Text>
              ₩
              <Controller
                name='deposit'
                control={control}
                render={({ field }) => (
                  <TextField.Root
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
              <Text as='label' weight='medium'>
                잔금
              </Text>
              {toReadableAmount(
                Number(data?.total_amount_krw) - watch('deposit') || 0,
                'ko-KR',
                'KRW'
              )}
            </Flex>
            <Text as='p' align='right' mt='2' weight='bold' color='ruby'>
              환율이 입력된 상품만 총액에 반영됩니다.
            </Text>
            <Flex justify='end' align='center' gap='2' mt='2'>
              <Text as='label' weight='medium'>
                환율
              </Text>
              {/* TODO: 정산되지 않은 항목이 입력된 경우에만 required 적용 필요 */}
              <Controller
                name='exchange_rate'
                control={control}
                render={({ field }) => (
                  <TextField.Root
                    type='number'
                    min='0'
                    size='3'
                    step='0.01'
                    value={field.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const { value } = e.target;
                      if (!value) return field.onChange(value);

                      const [integer, decimal] = value.split('.');
                      const formattedValue = decimal
                        ? `${integer.slice(0, 4)}.${decimal.slice(0, 2)}`
                        : integer.slice(0, 4);

                      field.onChange(+formattedValue);
                    }}
                  />
                )}
              />
              <Button disabled={mutation.isPending} size='3' color='ruby'>
                <Save />
                변경사항 저장
              </Button>
            </Flex>
            <Text as='p' align='right' mt='2' weight='bold' color='ruby'>
              환율 관리 → 변경을 체크한 상품만 환율이 적용됩니다.
            </Text>
          </Box>
        </form>
      </Flex>

      <AdditionalOptionsEditor />
    </div>
  );
}
