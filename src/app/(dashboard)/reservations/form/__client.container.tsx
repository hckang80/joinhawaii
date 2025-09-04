'use client';

import {
  defaultCarValues,
  defaultClientValues,
  defaultFlightValues,
  defaultHotelValues,
  defaultTourValues,
  GENDER_TYPE
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
  Container,
  Flex,
  Grid,
  Heading,
  Radio,
  RadioCards,
  Section,
  Select,
  Text,
  TextArea,
  TextField
} from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { Binoculars, Car, Hotel, Plane, Upload, UserPlus } from 'lucide-react';
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
    name: [
      `hotels.${index}.nightly_rate`,
      `hotels.${index}.nights`,
      `hotels.${index}.cost`,
      `hotels.${index}.local_currency`,
      'exchange_rate'
    ]
  });

  useEffect(() => {
    const [nightly, nights, cost, localCurrency, exchangeRate] = watchedValues;
    const total = nightly * nights;
    const totalCost = cost * nights;
    setValue(`hotels.${index}.total_amount`, total, { shouldValidate: true });
    setValue(`hotels.${index}.total_cost`, totalCost, { shouldValidate: true });

    if (nightly && !localCurrency) {
      setValue(`hotels.${index}.exchange_rate`, exchangeRate, {
        shouldDirty: true,
        shouldTouch: true
      });
    }
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
      `tours.${index}.children_cost`,
      `tours.${index}.local_currency`,
      'exchange_rate'
    ]
  });

  useEffect(() => {
    const [
      adultParticipant,
      childrenParticipant,
      adultPrice,
      childrenPrice,
      adultCost,
      childrenCost,
      localCurrency,
      exchangeRate
    ] = watchedValues;
    const total = adultParticipant * adultPrice + childrenParticipant * childrenPrice;
    const totalCost = adultParticipant * adultCost + childrenParticipant * childrenCost;
    setValue(`tours.${index}.total_amount`, total, { shouldValidate: true });
    setValue(`tours.${index}.total_cost`, totalCost, { shouldValidate: true });

    if (adultPrice && !localCurrency) {
      setValue(`tours.${index}.exchange_rate`, exchangeRate, {
        shouldDirty: true,
        shouldTouch: true
      });
    }
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
      `rental_cars.${index}.cost`,
      `rental_cars.${index}.local_currency`,
      'exchange_rate'
    ]
  });

  useEffect(() => {
    const [nightly, rentalDays, cost, localCurrency, exchangeRate] = watchedValues;
    const total = nightly * rentalDays;
    const totalCost = cost * rentalDays;
    setValue(`rental_cars.${index}.total_amount`, total, { shouldValidate: true });
    setValue(`rental_cars.${index}.total_cost`, totalCost, { shouldValidate: true });

    if (nightly && !localCurrency) {
      setValue(`rental_cars.${index}.exchange_rate`, exchangeRate, {
        shouldDirty: true,
        shouldTouch: true
      });
    }
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
              <Flex direction='column' gap='5'>
                {getValues('clients').map((client, i) => {
                  return (
                    <div
                      key={i}
                      className={clsx(
                        dirtyFields.clients?.[i] && styles['is-dirty'],
                        styles['form-field-group']
                      )}
                    >
                      <Flex asChild justify='end' align='center' gap='1' mb='2'>
                        <label>
                          예약자
                          <Radio
                            name='reservation'
                            value={'' + i}
                            defaultChecked={
                              getValues('main_client_name') === client.korean_name ||
                              i === reservationIndex
                            }
                            onChange={handleChangeReservation}
                          />
                        </label>
                      </Flex>
                      <Grid align='center' columns='60px 1fr 70px 1fr' gap='3'>
                        <Text weight='medium'>이름</Text>
                        <Controller
                          name={`clients.${i}.korean_name`}
                          control={control}
                          render={({ field }) => (
                            <TextField.Root
                              size='3'
                              value={field.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                field.onChange(e.target.value);
                                if (i === reservationIndex) {
                                  setValue('main_client_name', e.target.value);
                                }
                              }}
                            />
                          )}
                        />

                        <Text weight='medium'>이름(영문)</Text>
                        <TextField.Root
                          size='3'
                          {...register(`clients.${i}.english_name`, { required: true })}
                        />

                        <Text weight='medium'>성별</Text>
                        <Controller
                          name={`clients.${i}.gender`}
                          control={control}
                          render={({ field }) => (
                            <RadioCards.Root
                              size='1'
                              value={field.value}
                              onValueChange={value => {
                                field.onChange(value);
                              }}
                              name={field.name}
                              columns='repeat(auto-fit, 80px)'
                            >
                              {GENDER_TYPE.map(value => (
                                <RadioCards.Item value={value} key={value}>
                                  {value}
                                </RadioCards.Item>
                              ))}
                            </RadioCards.Root>
                          )}
                        ></Controller>

                        <Text weight='medium'>주민번호</Text>
                        <TextField.Root
                          size='3'
                          {...register(`clients.${i}.resident_id`, { required: true })}
                        />

                        <Text weight='medium'>연락처</Text>
                        <TextField.Root
                          size='3'
                          {...register(`clients.${i}.phone_number`, { required: true })}
                        />

                        <Text weight='medium'>이메일</Text>
                        <TextField.Root
                          size='3'
                          {...register(`clients.${i}.email`, { required: true })}
                        />

                        <Box gridColumn='1 / -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium' mb='2'>
                              비고
                            </Text>
                            <TextArea {...register(`clients.${i}.notes`)} />
                          </Grid>
                        </Box>
                      </Grid>
                    </div>
                  );
                })}
              </Flex>
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

              <Flex direction='column' gap='5'>
                {getValues('flights').map((_flight, i) => (
                  <div
                    key={i}
                    className={clsx(
                      dirtyFields.flights?.[i] && styles['is-dirty'],
                      styles['form-field-group']
                    )}
                  >
                    <FlightTotalCalculator index={i} setValue={setValue} control={control} />

                    <Grid align='center' columns='60px 1fr 60px 1fr' gap='3'>
                      <Box gridColumn='1 / -1'>
                        <Grid align='center' columns='60px 1fr' gap='3'>
                          <Text weight='medium'>항공편명</Text>
                          <TextField.Root
                            size='3'
                            {...register(`flights.${i}.flight_number`, {
                              required: isDirtyProductItem('flights') && true
                            })}
                          />
                        </Grid>
                      </Box>

                      <Text weight='medium'>출발 시간</Text>
                      <TextField.Root
                        size='3'
                        type='datetime-local'
                        {...register(`flights.${i}.departure_datetime`, {
                          required: isDirtyProductItem('flights') && true
                        })}
                      />

                      <Text weight='medium'>출발지</Text>
                      <TextField.Root
                        size='3'
                        readOnly={!i}
                        {...register(`flights.${i}.departure_city`, {
                          required: isDirtyProductItem('flights') && true
                        })}
                      />

                      <Text weight='medium'>도착 시간</Text>
                      <TextField.Root
                        size='3'
                        type='datetime-local'
                        {...register(`flights.${i}.arrival_datetime`, {
                          required: isDirtyProductItem('flights') && true
                        })}
                      />

                      <Text weight='medium'>도착지</Text>
                      <TextField.Root
                        size='3'
                        {...register(`flights.${i}.arrival_city`, {
                          required: isDirtyProductItem('flights') && true
                        })}
                      />

                      <Text weight='medium'>원가</Text>
                      <Grid align='center' columns='30px 100px 30px 100px' gap='3'>
                        <span>성인</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`flights.${i}.adult_cost`, {
                            required: isDirtyProductItem('flights') && true,
                            valueAsNumber: true
                          })}
                        />
                        <span>소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`flights.${i}.children_cost`, {
                            required: isDirtyProductItem('flights') && true,
                            valueAsNumber: true
                          })}
                        />
                      </Grid>

                      <Text weight='medium'>인원</Text>
                      <Grid align='center' columns='30px 100px 30px 100px' gap='3'>
                        <span>성인</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`flights.${i}.adult_count`, {
                            required: isDirtyProductItem('flights') && true,
                            valueAsNumber: true
                          })}
                        />
                        <span>소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`flights.${i}.children_count`, {
                            required: isDirtyProductItem('flights') && true,
                            valueAsNumber: true
                          })}
                        />
                      </Grid>

                      <Text weight='medium'>요금</Text>
                      <Grid align='center' columns='30px 100px 30px 100px' gap='3'>
                        <span>성인</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`flights.${i}.adult_price`, {
                            required: isDirtyProductItem('flights') && true,
                            valueAsNumber: true
                          })}
                        />
                        <span>소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`flights.${i}.children_price`, {
                            required: isDirtyProductItem('flights') && true,
                            valueAsNumber: true
                          })}
                        />
                      </Grid>

                      <Box gridColumn='1 / -1'>
                        <Grid align='center' columns='60px 1fr' gap='3'>
                          <Text weight='medium' mb='2'>
                            비고
                          </Text>
                          <TextArea {...register(`flights.${i}.notes`)} />
                        </Grid>
                      </Box>
                    </Grid>
                  </div>
                ))}
              </Flex>

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

              <Flex direction='column' gap='5'>
                {getValues('hotels').map((_hotel, i) => {
                  return (
                    <div
                      key={i}
                      className={clsx(
                        dirtyFields.hotels?.[i] && styles['is-dirty'],
                        styles['form-field-group']
                      )}
                    >
                      <HotelTotalCalculator index={i} setValue={setValue} control={control} />

                      <Grid align='center' columns='60px 1fr 60px 1fr' gap='3'>
                        <Box gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>지역</Text>
                            <TextField.Root
                              size='3'
                              {...register(`hotels.${i}.region`, {
                                required: isDirtyProductItem('hotels') && true
                              })}
                            />
                          </Grid>
                        </Box>

                        <Box gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>날짜</Text>
                            <Flex gap='2'>
                              <Container flexGrow='1'>
                                <TextField.Root
                                  type='date'
                                  size='3'
                                  {...register(`hotels.${i}.check_in_date`, {
                                    required: isDirtyProductItem('hotels') && true
                                  })}
                                />
                              </Container>
                              <Container flexGrow='1'>
                                <TextField.Root
                                  type='date'
                                  size='3'
                                  {...register(`hotels.${i}.check_out_date`, {
                                    required: isDirtyProductItem('hotels') && true
                                  })}
                                />
                              </Container>
                            </Flex>
                          </Grid>
                        </Box>

                        <Box gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>호텔명</Text>
                            <TextField.Root
                              size='3'
                              {...register(`hotels.${i}.hotel_name`, {
                                required: isDirtyProductItem('hotels') && true
                              })}
                            />
                          </Grid>
                        </Box>

                        <Text weight='medium'>객실타입</Text>
                        <TextField.Root
                          size='3'
                          {...register(`hotels.${i}.room_type`, {
                            required: isDirtyProductItem('hotels') && true
                          })}
                        />

                        <Text weight='medium'>숙박일</Text>
                        <TextField.Root
                          type='number'
                          min='1'
                          size='3'
                          disabled={!!getValues(`hotels.${i}.local_currency`)}
                          {...register(`hotels.${i}.nights`, {
                            required: isDirtyProductItem('hotels') && true,
                            valueAsNumber: true
                          })}
                        />

                        <Box gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 20px 80px 60px 20px' gap='3'>
                            <Text weight='medium'>조식</Text>
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
                            <span></span>
                            <Text weight='medium'>리조트피</Text>
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
                          </Grid>
                        </Box>

                        <Box gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>요금 상세</Text>
                            <Flex align='center' gap='3'>
                              <Text wrap='nowrap'>원가</Text>
                              <TextField.Root
                                type='number'
                                min='0'
                                size='3'
                                {...register(`hotels.${i}.cost`, {
                                  required: isDirtyProductItem('hotels') && true,
                                  valueAsNumber: true
                                })}
                              />
                              <Text wrap='nowrap'>1박요금</Text>
                              <TextField.Root
                                type='number'
                                min='0'
                                size='3'
                                {...register(`hotels.${i}.nightly_rate`, {
                                  required: isDirtyProductItem('hotels') && true,
                                  valueAsNumber: true
                                })}
                              />
                            </Flex>
                          </Grid>
                        </Box>

                        <Box gridColumn='1 / -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium' mb='2'>
                              비고
                            </Text>
                            <TextArea {...register(`hotels.${i}.notes`)} />
                          </Grid>
                        </Box>
                      </Grid>
                    </div>
                  );
                })}
              </Flex>

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

              <Flex direction='column' gap='5'>
                {getValues('tours').map((_tour, i) => (
                  <div
                    key={i}
                    className={clsx(
                      dirtyFields.tours?.[i] && styles['is-dirty'],
                      styles['form-field-group']
                    )}
                  >
                    <TourTotalCalculator index={i} setValue={setValue} control={control} />

                    <Grid align='center' columns='60px 1fr 60px 1fr' gap='3'>
                      <Text weight='medium'>지역</Text>
                      <TextField.Root
                        size='3'
                        {...register(`tours.${i}.region`, {
                          required: isDirtyProductItem('tours') && true
                        })}
                      />

                      <Text weight='medium'>상품명</Text>
                      <TextField.Root
                        size='3'
                        {...register(`tours.${i}.name`, {
                          required: isDirtyProductItem('tours') && true
                        })}
                      />

                      <Text weight='medium'>출발 시간</Text>
                      <TextField.Root
                        size='3'
                        type='datetime-local'
                        {...register(`tours.${i}.start_date`, {
                          required: isDirtyProductItem('tours') && true
                        })}
                      />

                      <Text weight='medium'>도착 시간</Text>
                      <TextField.Root
                        size='3'
                        type='datetime-local'
                        {...register(`tours.${i}.end_date`, {
                          required: isDirtyProductItem('tours') && true
                        })}
                      />

                      <Text weight='medium'>원가</Text>
                      <Grid align='center' columns='30px 100px 30px 100px' gap='3'>
                        <span>성인</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`tours.${i}.adult_cost`, {
                            required: isDirtyProductItem('tours') && true,
                            valueAsNumber: true
                          })}
                        />
                        <span>소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`tours.${i}.children_cost`, {
                            required: isDirtyProductItem('tours') && true,
                            valueAsNumber: true
                          })}
                        />
                      </Grid>

                      <Text weight='medium'>인원</Text>
                      <Grid align='center' columns='30px 100px 30px 100px' gap='3'>
                        <span>성인</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          disabled={!!getValues(`tours.${i}.local_currency`)}
                          {...register(`tours.${i}.adult_count`, {
                            required: isDirtyProductItem('tours') && true,
                            valueAsNumber: true
                          })}
                        />
                        <span>소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          disabled={!!getValues(`tours.${i}.local_currency`)}
                          {...register(`tours.${i}.children_count`, {
                            required: isDirtyProductItem('tours') && true,
                            valueAsNumber: true
                          })}
                        />
                      </Grid>

                      <Text weight='medium'>요금</Text>
                      <Grid align='center' columns='30px 100px 30px 100px' gap='3'>
                        <span>성인</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`tours.${i}.adult_price`, {
                            required: isDirtyProductItem('tours') && true,
                            valueAsNumber: true
                          })}
                        />
                        <span>소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`tours.${i}.children_price`, {
                            required: isDirtyProductItem('tours') && true,
                            valueAsNumber: true
                          })}
                        />
                      </Grid>

                      <Box gridColumn='1 / -1'>
                        <Grid align='center' columns='60px 1fr' gap='3'>
                          <Text weight='medium' mb='2'>
                            비고
                          </Text>
                          <TextArea {...register(`tours.${i}.notes`)} />
                        </Grid>
                      </Box>
                    </Grid>
                  </div>
                ))}
              </Flex>

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

              <Flex direction='column' gap='5'>
                {getValues('rental_cars').map((_car, i) => {
                  return (
                    <div
                      key={i}
                      className={clsx(
                        dirtyFields.rental_cars?.[i] && styles['is-dirty'],
                        styles['form-field-group']
                      )}
                    >
                      <CarTotalCalculator index={i} setValue={setValue} control={control} />

                      <Grid align='center' columns='60px 1fr 60px 1fr' gap='3'>
                        <Box gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>지역</Text>
                            <TextField.Root
                              size='3'
                              {...register(`rental_cars.${i}.region`, {
                                required: isDirtyProductItem('rental_cars') && true
                              })}
                            />
                          </Grid>
                        </Box>

                        <Box gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>날짜</Text>
                            <Flex gap='2'>
                              <Container flexGrow='1'>
                                <TextField.Root
                                  type='date'
                                  size='3'
                                  {...register(`rental_cars.${i}.pickup_date`, {
                                    required: isDirtyProductItem('rental_cars') && true
                                  })}
                                />
                              </Container>
                              <Container flexGrow='1'>
                                <TextField.Root
                                  type='date'
                                  size='3'
                                  {...register(`rental_cars.${i}.return_date`, {
                                    required: isDirtyProductItem('rental_cars') && true
                                  })}
                                />
                              </Container>
                            </Flex>
                          </Grid>
                        </Box>

                        <Text weight='medium'>차종</Text>
                        <TextField.Root
                          size='3'
                          {...register(`rental_cars.${i}.model`, {
                            required: isDirtyProductItem('rental_cars') && true
                          })}
                        />

                        <Text weight='medium'>운전자</Text>
                        <TextField.Root
                          size='3'
                          {...register(`rental_cars.${i}.driver`, {
                            required: isDirtyProductItem('rental_cars') && true
                          })}
                        />

                        <Box gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>조건</Text>
                            <TextField.Root
                              size='3'
                              {...register(`rental_cars.${i}.options`, {
                                required: isDirtyProductItem('rental_cars') && true
                              })}
                            />
                          </Grid>
                        </Box>

                        <Text weight='medium'>픽업 장소</Text>
                        <TextField.Root
                          size='3'
                          {...register(`rental_cars.${i}.pickup_location`, {
                            required: isDirtyProductItem('rental_cars') && true
                          })}
                        />

                        <Text weight='medium'>픽업 시간</Text>
                        <TextField.Root
                          type='time'
                          size='3'
                          {...register(`rental_cars.${i}.pickup_time`, {
                            required: isDirtyProductItem('rental_cars') && true
                          })}
                        />

                        <Text weight='medium'>대여일</Text>
                        <TextField.Root
                          type='number'
                          min='1'
                          size='3'
                          disabled={!!getValues(`rental_cars.${i}.local_currency`)}
                          {...register(`rental_cars.${i}.rental_days`, {
                            required: isDirtyProductItem('rental_cars') && true,
                            valueAsNumber: true
                          })}
                        />

                        <Box gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>요금 상세</Text>
                            <Flex align='center' gap='3'>
                              <Text wrap='nowrap'>원가</Text>
                              <TextField.Root
                                type='number'
                                min='0'
                                size='3'
                                {...register(`rental_cars.${i}.cost`, {
                                  required: isDirtyProductItem('rental_cars') && true,
                                  valueAsNumber: true
                                })}
                              />
                              <Text wrap='nowrap'>1일요금</Text>
                              <TextField.Root
                                type='number'
                                min='0'
                                size='3'
                                {...register(`rental_cars.${i}.daily_rate`, {
                                  required: isDirtyProductItem('rental_cars') && true,
                                  valueAsNumber: true
                                })}
                              />
                            </Flex>
                          </Grid>
                        </Box>

                        <Box gridColumn='1 / -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium' mb='2'>
                              비고
                            </Text>
                            <TextArea {...register(`rental_cars.${i}.notes`)} />
                          </Grid>
                        </Box>
                      </Grid>
                    </div>
                  );
                })}
              </Flex>

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

              <Button disabled={mutation.isPending} size='3' color='ruby'>
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
