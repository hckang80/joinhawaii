'use client';

import {
  defaultCarValues,
  defaultClientValues,
  defaultFlightValues,
  defaultHotelValues,
  defaultTourValues,
  GENDER_TYPE,
  REGIONS
} from '@/constants';
import { createReservation, updateReservation } from '@/http';
import type { ReservationFormData, ReservationItem, ReservationResponse } from '@/types';
import { handleApiError, handleApiSuccess, isDev } from '@/utils';
import { observable } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import {
  Box,
  Button,
  Card,
  Checkbox,
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
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { Binoculars, BookText, Car, Hotel, Plane, Upload, UserPlus } from 'lucide-react';
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
  reservationIndex: 0
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

export default function ReservationsFormClientContainer({
  data
}: {
  data: ReservationResponse | null;
}) {
  const isModify = !!data;
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
      exchange_rate: 0,
      booking_platform: data?.booking_platform || '',
      main_client_name: data?.main_client_name || '',
      ...(isModify && {
        reservation_id: data.reservation_id
      }),
      clients: data?.clients || [defaultClientValues],
      flights: data?.products.flights.length
        ? data.products.flights.map(flight => ({
            ...flight,
            arrival_datetime: new Date(flight.arrival_datetime).toISOString().slice(0, 16),
            departure_datetime: new Date(flight.departure_datetime).toISOString().slice(0, 16)
          }))
        : [
            {
              ...defaultFlightValues,
              departure_city: '인천'
            }
          ],
      hotels: data?.products.hotels.length ? data.products.hotels : [defaultHotelValues],
      tours: data?.products.tours.length
        ? data.products.tours.map(tour => ({
            ...tour,
            start_date: new Date(tour.start_date).toISOString().slice(0, 16),
            end_date: new Date(tour.end_date).toISOString().slice(0, 16)
          }))
        : [defaultTourValues],
      rental_cars: data?.products.rental_cars.length
        ? data.products.rental_cars
        : [defaultCarValues]
    }
  });

  const isDirtyProductItem = (field: keyof ReservationItem) => !!dirtyFields[field]?.length;

  const reservationIndex = use$(status$.reservationIndex);
  const mainClientName = getValues('clients')[reservationIndex].korean_name;

  const mutation = useMutation({
    mutationFn: (formData: ReservationFormData) => {
      const payload = {
        ...formData,
        flights: isDirtyProductItem('flights') ? formData.flights : [],
        hotels: isDirtyProductItem('hotels') ? formData.hotels : [],
        tours: isDirtyProductItem('tours') ? formData.tours : [],
        rental_cars: isDirtyProductItem('rental_cars') ? formData.rental_cars : [],
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

  function hasUpdatedExchangeRate(watch: (field: string) => unknown[]) {
    const fields: Array<keyof ReservationItem> = ['flights', 'hotels', 'tours', 'rental_cars'];
    return fields.some(field =>
      (watch(field) as Array<{ is_updated_exchange_rate: boolean }>)?.some(
        item => item.is_updated_exchange_rate
      )
    );
  }

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
                      <Select.Trigger placeholder='예약회사 선택' />
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
                  {data?.total_amount}
                  <br />
                  {watch('main_client_name')}
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
                              getValues('main_client_name') === client.korean_name ||
                              i === reservationIndex
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
                              <Select.Trigger placeholder='성별 선택' />
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
                    <Table.ColumnHeaderCell width='170px'>출발시간</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='100px'>출발지</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='240px'>도착시간</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='100px'>도착지</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💸 원가</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💰 요금</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>🧑‍🤝‍🧑 인원</Table.ColumnHeaderCell>
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
                            required: isDirtyProductItem('flights') && true
                          })}
                          placeholder='KE001'
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='datetime-local'
                          {...register(`flights.${i}.departure_datetime`, {
                            required: isDirtyProductItem('flights') && true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          readOnly={!i}
                          {...register(`flights.${i}.departure_city`, {
                            required: isDirtyProductItem('flights') && true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='datetime-local'
                          {...register(`flights.${i}.arrival_datetime`, {
                            required: isDirtyProductItem('flights') && true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`flights.${i}.arrival_city`, {
                            required: isDirtyProductItem('flights') && true
                          })}
                          placeholder='호놀룰루'
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑 성인</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`flights.${i}.adult_cost`, {
                                required: isDirtyProductItem('flights') && true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒 소아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`flights.${i}.children_cost`, {
                                required: isDirtyProductItem('flights') && true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶 유아</span>
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑 성인</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`flights.${i}.adult_price`, {
                                required: isDirtyProductItem('flights') && true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒 소아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`flights.${i}.children_price`, {
                                required: isDirtyProductItem('flights') && true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶 유아</span>
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑 성인</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`flights.${i}.adult_count`, {
                                required: isDirtyProductItem('flights') && true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒 소아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`flights.${i}.children_count`, {
                                required: isDirtyProductItem('flights') && true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶 유아</span>
                          </Flex>
                        </Grid>
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

              <Flex justify='end' mt='4'>
                <Button type='button' color='ruby' onClick={addDomesticFlight}>
                  <Plane size='20' />
                  주내선 추가
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
                    <Table.ColumnHeaderCell width='50px'>환율 적용</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='120px'>지역</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='170px'>날짜</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='60px'>숙박일</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='240px'>호텔</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='120px'>객실타입</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='60px'>조식</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>리조트피</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💸 원가</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💰 1박 요금</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>수량</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='90px'>CF#/VC#</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>비고</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {getValues('hotels').map((_hotel, i) => (
                    <Table.Row key={i}>
                      <Table.Cell>
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
                              <Select.Trigger placeholder='지역 선택' />
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
                            required: isDirtyProductItem('hotels') && true
                          })}
                        />
                        ~
                        <TextField.Root
                          type='date'
                          {...register(`hotels.${i}.check_out_date`, {
                            required: isDirtyProductItem('hotels') && true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='number'
                          min='1'
                          {...register(`hotels.${i}.nights`, {
                            required: isDirtyProductItem('hotels') && true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        {/* TODO: 드랍다운으로 변경 필요 */}
                        <TextField.Root
                          {...register(`hotels.${i}.hotel_name`, {
                            required: isDirtyProductItem('hotels') && true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`hotels.${i}.room_type`, {
                            required: isDirtyProductItem('hotels') && true
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
                            required: isDirtyProductItem('hotels') && true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='number'
                          min='0'
                          {...register(`hotels.${i}.nightly_rate`, {
                            required: isDirtyProductItem('hotels') && true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>???</Table.Cell>
                      <Table.Cell>바우처 조회</Table.Cell>
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

              <Flex justify='end' mt='4'>
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
                    <Table.ColumnHeaderCell width='50px'>환율 적용</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='120px'>지역</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='240px'>날짜</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='240px'>상품명</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💸 원가</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💰 요금</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>수량</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>비고</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {getValues('tours').map((_tour, i) => (
                    <Table.Row key={i}>
                      <Table.Cell>
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
                              <Select.Trigger placeholder='지역 선택' />
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
                            required: isDirtyProductItem('tours') && true
                          })}
                        />
                        ~
                        <TextField.Root
                          type='datetime-local'
                          {...register(`tours.${i}.end_date`, {
                            required: isDirtyProductItem('tours') && true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`tours.${i}.name`, {
                            required: isDirtyProductItem('tours') && true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑 성인</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`tours.${i}.adult_cost`, {
                                required: isDirtyProductItem('tours') && true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒 소아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`tours.${i}.children_cost`, {
                                required: isDirtyProductItem('tours') && true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶 유아</span>
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑 성인</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`tours.${i}.adult_price`, {
                                required: isDirtyProductItem('tours') && true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒 소아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`tours.${i}.children_price`, {
                                required: isDirtyProductItem('tours') && true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶 유아</span>
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑 성인</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`tours.${i}.adult_count`, {
                                required: isDirtyProductItem('tours') && true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒 소아</span>
                            <TextField.Root
                              type='number'
                              min='0'
                              {...register(`tours.${i}.children_count`, {
                                required: isDirtyProductItem('tours') && true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶 유아</span>
                          </Flex>
                        </Grid>
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

              <Flex justify='end' mt='4'>
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
                    <Table.ColumnHeaderCell width='50px'>환율 적용</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='120px'>지역</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='240px'>날짜</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='120px'>픽업장소</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='160px'>차종</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='160px'>운전자</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='160px'>조건</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💸 원가</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💰 1일 요금</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>대여일</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>비고</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {getValues('rental_cars').map((_car, i) => (
                    <Table.Row key={i}>
                      <Table.Cell>
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
                              <Select.Trigger placeholder='지역 선택' />
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
                            required: isDirtyProductItem('rental_cars') && true
                          })}
                        />
                        ~
                        <TextField.Root
                          type='date'
                          {...register(`rental_cars.${i}.return_date`, {
                            required: isDirtyProductItem('rental_cars') && true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`rental_cars.${i}.pickup_location`, {
                            required: isDirtyProductItem('rental_cars') && true
                          })}
                        />
                        <br />
                        <TextField.Root
                          type='time'
                          {...register(`rental_cars.${i}.pickup_time`, {
                            required: isDirtyProductItem('rental_cars') && true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`rental_cars.${i}.model`, {
                            required: isDirtyProductItem('rental_cars') && true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`rental_cars.${i}.driver`, {
                            required: isDirtyProductItem('rental_cars') && true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`rental_cars.${i}.options`, {
                            required: isDirtyProductItem('rental_cars') && true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='number'
                          min='0'
                          {...register(`rental_cars.${i}.cost`, {
                            required: isDirtyProductItem('rental_cars') && true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='number'
                          min='0'
                          {...register(`rental_cars.${i}.daily_rate`, {
                            required: isDirtyProductItem('rental_cars') && true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type='number'
                          min='1'
                          {...register(`rental_cars.${i}.rental_days`, {
                            required: isDirtyProductItem('rental_cars') && true,
                            valueAsNumber: true
                          })}
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

              <Flex justify='end' mt='4'>
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
            <Section id='rental_car'>
              <Heading as='h3' mb='4'>
                보험사
              </Heading>

              <Table.Root size='1'>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell width='120px'>보험사</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='170px'>날짜</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>여행일수</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='300px'>내용</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💸 원가</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💰 요금</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>수량</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>비고</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell></Table.Cell>
                    <Table.Cell></Table.Cell>
                    <Table.Cell></Table.Cell>
                    <Table.Cell></Table.Cell>
                    <Table.Cell></Table.Cell>
                    <Table.Cell></Table.Cell>
                    <Table.Cell></Table.Cell>
                    <Table.Cell></Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Root>

              <Flex justify='end' mt='4'>
                <Button type='button' color='ruby'>
                  <BookText size='20' />
                  보험 추가
                </Button>
              </Flex>
            </Section>
          </Card>

          <Box position='sticky' bottom='5' className={styles['exchange-rate-card']}>
            <Flex justify='end' align='center' gap='2'>
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

              <Button
                disabled={mutation.isPending || !hasUpdatedExchangeRate(watch)}
                size='3'
                color='ruby'
              >
                <Upload />
                등록
              </Button>
            </Flex>
            <Text as='p' align='right' mt='2' weight='bold' color='ruby'>
              입력된 환율은 정산되지 않은 상품에만 적용됩니다.
            </Text>
          </Box>
        </form>
      </Flex>
    </div>
  );
}
