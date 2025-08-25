'use client';

import {
  defaultCarValues,
  defaultClientValues,
  defaultFlightValues,
  defaultHotelValues,
  defaultTourValues,
  GENDER_TYPE
} from '@/constants';
import type { ReservationFormData, ReservationRequest, ReservationResponse } from '@/types';
import { isDev } from '@/utils';
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
  Text,
  TextArea,
  TextField
} from '@radix-ui/themes';
import { Binoculars, Car, Hotel, Plane, Upload, UserPlus } from 'lucide-react';
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
  setValue: UseFormSetValue<ReservationRequest>;
  control: Control<ReservationRequest, unknown, ReservationRequest>;
}) {
  const watchedValues = useWatch({
    control,
    name: [
      `flights.${index}.adult_count`,
      `flights.${index}.children_count`,
      `flights.${index}.adult_price`,
      `flights.${index}.children_price`,
      `flights.${index}.deposit`
    ]
  });

  useEffect(() => {
    const [adultCapacity, childrenCapacity, adultPrice, childrenPrice, depositPrice] =
      watchedValues;
    const total = adultCapacity * adultPrice + childrenCapacity * childrenPrice;
    setValue(`flights.${index}.total_amount`, total, { shouldValidate: true });
    setValue(`flights.${index}.balance`, total - depositPrice, { shouldValidate: true });
  }, [watchedValues, setValue, index]);

  return null;
}

function HotelTotalCalculator({
  index,
  setValue,
  control
}: {
  index: number;
  setValue: UseFormSetValue<ReservationRequest>;
  control: Control<ReservationRequest, unknown, ReservationRequest>;
}) {
  const watchedValues = useWatch({
    control,
    name: [`hotels.${index}.nightly_rate`, `hotels.${index}.nights`, `hotels.${index}.deposit`]
  });

  useEffect(() => {
    const [nightly, nights, depositPrice] = watchedValues;
    const total = nightly * nights;
    setValue(`hotels.${index}.total_amount`, total, { shouldValidate: true });
    setValue(`hotels.${index}.balance`, total - depositPrice, { shouldValidate: true });
  }, [watchedValues, setValue, index]);

  return null;
}

function TourTotalCalculator({
  index,
  setValue,
  control
}: {
  index: number;
  setValue: UseFormSetValue<ReservationRequest>;
  control: Control<ReservationRequest, unknown, ReservationRequest>;
}) {
  const watchedValues = useWatch({
    control,
    name: [
      `tours.${index}.adult_count`,
      `tours.${index}.children_count`,
      `tours.${index}.adult_price`,
      `tours.${index}.children_price`,
      `tours.${index}.deposit`
    ]
  });

  useEffect(() => {
    const [adultParticipant, childrenParticipant, adultPrice, childrenPrice, depositPrice] =
      watchedValues;
    const total = adultParticipant * adultPrice + childrenParticipant * childrenPrice;
    setValue(`tours.${index}.total_amount`, total, { shouldValidate: true });
    setValue(`tours.${index}.balance`, total - depositPrice, { shouldValidate: true });
  }, [watchedValues, setValue, index]);

  return null;
}

function CarTotalCalculator({
  index,
  setValue,
  control
}: {
  index: number;
  setValue: UseFormSetValue<ReservationRequest>;
  control: Control<ReservationRequest, unknown, ReservationRequest>;
}) {
  const watchedValues = useWatch({
    control,
    name: [`cars.${index}.daily_rate`, `cars.${index}.rental_days`, `cars.${index}.deposit`]
  });

  useEffect(() => {
    const [nightly, rentalDays, depositPrice] = watchedValues;
    const total = nightly * rentalDays;
    setValue(`cars.${index}.total_amount`, total, { shouldValidate: true });
    setValue(`cars.${index}.balance`, total - depositPrice, { shouldValidate: true });
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

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, isDirty, dirtyFields },
    getValues,
    setValue,
    control
  } = useForm<ReservationRequest>({
    defaultValues: {
      main_client_name: data?.main_client_name || '',
      ...(isModify && {
        reservation_id: data.reservation_id
      }),
      clients: data?.clients || [defaultClientValues],
      flights: data?.products.flights.length
        ? data.products.flights
        : [
            {
              ...defaultFlightValues,
              departure_city: '인천'
            }
          ],
      hotels: data?.products.hotels.length ? data.products.hotels : [defaultHotelValues],
      tours: data?.products.tours.length ? data.products.tours : [defaultTourValues],
      cars: data?.products.rental_cars.length ? data.products.rental_cars : [defaultCarValues]
    }
  });

  const isDirtyField = (field: keyof ReservationFormData) => !!dirtyFields[field]?.length;

  const reservationIndex = use$(status$.reservationIndex);
  const mainClientName = getValues('clients')[reservationIndex].korean_name;

  const onSubmit: SubmitHandler<ReservationFormData> = async data => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');

    try {
      const response = await fetch('/api/reservation', {
        method: isModify ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          flights: isDirtyField('flights') ? data.flights : [],
          hotels: isDirtyField('hotels') ? data.hotels : [],
          tours: isDirtyField('tours') ? data.tours : [],
          cars: isDirtyField('cars') ? data.cars : [],
          main_client_name: mainClientName
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      router.push('/reservations');

      toast.success(`예약이 완료되었습니다: ${result.data.reservation_id}`);
    } catch (error) {
      console.error('예약 중 오류가 발생했습니다:', error);
      toast.error('예약 중 오류가 발생했습니다.');
    }
  };

  const addClient = () => {
    setValue('clients', [...getValues('clients'), defaultClientValues]);
  };

  const handleChangeReservation = (event: React.ChangeEvent<HTMLInputElement>) => {
    status$.reservationIndex.set(() => +event.target.value);
    setValue('main_client_name', getValues('clients')[+event.target.value].korean_name);
  };

  const addDomesticFlight = () => {
    setValue('flights', [...getValues('flights'), defaultFlightValues]);
  };

  const addHotel = () => {
    setValue('hotels', [...getValues('hotels'), defaultHotelValues]);
  };

  const addTour = () => {
    setValue('tours', [...getValues('tours'), defaultTourValues]);
  };

  const addCar = () => {
    setValue('cars', [...getValues('cars'), defaultCarValues]);
  };

  return (
    <div className={styles.root}>
      <Heading as='h2' mb='4' size='7'>
        예약관리
      </Heading>

      <Flex asChild direction='column' gap='5'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card asChild size='3'>
            <Section>
              <Heading as='h3' mb='4'>
                고객정보
              </Heading>
              {isDev() && JSON.stringify(watch('main_client_name'), null, 2)}
              <Flex direction='column' gap='5'>
                {getValues('clients').map((client, i) => {
                  return (
                    <div key={i} className={styles.client}>
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
                    { isDirty: isDirtyField('clients'), ...watch('clients') },
                    null,
                    2
                  )}
                </pre>
              )}
            </Section>
          </Card>

          <Card asChild size='3'>
            <Section>
              <Heading as='h3' mb='4'>
                항공정보
              </Heading>

              <Flex direction='column' gap='5'>
                {getValues('flights').map((_flight, i) => (
                  <div key={i} className={styles.client}>
                    <FlightTotalCalculator index={i} setValue={setValue} control={control} />

                    <Grid align='center' columns='60px 1fr 60px 1fr' gap='3'>
                      <Box gridColumn='1 / -1'>
                        <Grid align='center' columns='60px 1fr' gap='3'>
                          <Text weight='medium'>항공편명</Text>
                          <TextField.Root
                            size='3'
                            {...register(`flights.${i}.flight_number`, {
                              required: isDirtyField('flights') && true
                            })}
                          />
                        </Grid>
                      </Box>

                      <Text weight='medium'>출발 시간</Text>
                      <TextField.Root
                        size='3'
                        type='datetime-local'
                        {...register(`flights.${i}.departure_datetime`, {
                          required: isDirtyField('flights') && true
                        })}
                      />

                      <Text weight='medium'>출발지</Text>
                      <TextField.Root
                        size='3'
                        readOnly={!i}
                        {...register(`flights.${i}.departure_city`, {
                          required: isDirtyField('flights') && true
                        })}
                      />

                      <Text weight='medium'>도착 시간</Text>
                      <TextField.Root
                        size='3'
                        type='datetime-local'
                        {...register(`flights.${i}.arrival_datetime`, {
                          required: isDirtyField('flights') && true
                        })}
                      />

                      <Text weight='medium'>도착지</Text>
                      <TextField.Root
                        size='3'
                        {...register(`flights.${i}.arrival_city`, {
                          required: isDirtyField('flights') && true
                        })}
                      />

                      <Text weight='medium'>인원</Text>
                      <Grid align='center' columns='30px 100px 30px 100px' gap='3'>
                        <span>성인</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`flights.${i}.adult_count`, {
                            required: isDirtyField('flights') && true,
                            valueAsNumber: true
                          })}
                        />
                        <span>소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`flights.${i}.children_count`, {
                            required: isDirtyField('flights') && true,
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
                            required: isDirtyField('flights') && true,
                            valueAsNumber: true
                          })}
                        />
                        <span>소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`flights.${i}.children_price`, {
                            required: isDirtyField('flights') && true,
                            valueAsNumber: true
                          })}
                        />
                      </Grid>

                      <Container gridColumn='1 / -1'>
                        <Grid align='center' columns='60px 1fr' gap='3'>
                          <Text weight='medium'>요금 상세</Text>
                          <Flex align='center' gap='3'>
                            <Text wrap='nowrap'>예약금</Text>
                            <TextField.Root
                              type='number'
                              min='0'
                              size='3'
                              {...register(`flights.${i}.deposit`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                            <Text wrap='nowrap'>잔금</Text>
                            <TextField.Root
                              type='number'
                              size='3'
                              readOnly
                              {...register(`flights.${i}.balance`, {
                                valueAsNumber: true
                              })}
                            />
                            <Text wrap='nowrap'>합계</Text>
                            <TextField.Root
                              type='number'
                              size='3'
                              readOnly
                              {...register(`flights.${i}.total_amount`, {
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                        </Grid>
                      </Container>
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
                    { isDirty: isDirtyField('flights'), ...watch('flights') },
                    null,
                    2
                  )}
                </pre>
              )}
            </Section>
          </Card>

          <Card asChild size='3'>
            <Section>
              <Heading as='h3' mb='4'>
                호텔
              </Heading>

              <Flex direction='column' gap='5'>
                {getValues('hotels').map((_hotel, i) => {
                  return (
                    <div key={i} className={styles.client}>
                      <HotelTotalCalculator index={i} setValue={setValue} control={control} />

                      <Grid align='center' columns='60px 1fr 60px 1fr' gap='3'>
                        <Box gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>지역</Text>
                            <TextField.Root
                              size='3'
                              {...register(`hotels.${i}.region`, {
                                required: isDirtyField('hotels') && true
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
                                    required: isDirtyField('hotels') && true
                                  })}
                                />
                              </Container>
                              <Container flexGrow='1'>
                                <TextField.Root
                                  type='date'
                                  size='3'
                                  {...register(`hotels.${i}.check_out_date`, {
                                    required: isDirtyField('hotels') && true
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
                                required: isDirtyField('hotels') && true
                              })}
                            />
                          </Grid>
                        </Box>

                        <Text weight='medium'>객실타입</Text>
                        <TextField.Root
                          size='3'
                          {...register(`hotels.${i}.room_type`, {
                            required: isDirtyField('hotels') && true
                          })}
                        />

                        <Text weight='medium'>숙박일</Text>
                        <TextField.Root
                          type='number'
                          min='1'
                          size='3'
                          {...register(`hotels.${i}.nights`, {
                            required: isDirtyField('hotels') && true,
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
                              <Text wrap='nowrap'>1박요금</Text>
                              <TextField.Root
                                type='number'
                                min='0'
                                size='3'
                                {...register(`hotels.${i}.nightly_rate`, {
                                  required: isDirtyField('hotels') && true,
                                  valueAsNumber: true
                                })}
                              />
                              <Text wrap='nowrap'>예약금</Text>
                              <TextField.Root
                                type='number'
                                min='0'
                                size='3'
                                {...register(`hotels.${i}.deposit`, {
                                  required: isDirtyField('hotels') && true,
                                  valueAsNumber: true
                                })}
                              />
                              <Text wrap='nowrap'>잔금</Text>
                              <TextField.Root
                                type='number'
                                size='3'
                                readOnly
                                {...register(`hotels.${i}.balance`, {
                                  valueAsNumber: true
                                })}
                              />
                              <Text wrap='nowrap'>합계</Text>
                              <TextField.Root
                                type='number'
                                size='3'
                                readOnly
                                {...register(`hotels.${i}.total_amount`, {
                                  valueAsNumber: true
                                })}
                              />
                            </Flex>
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
                  {JSON.stringify({ isDirty: isDirtyField('hotels'), ...watch('hotels') }, null, 2)}
                </pre>
              )}
            </Section>
          </Card>

          <Card asChild size='3'>
            <Section>
              <Heading as='h3' mb='4'>
                선택관광
              </Heading>

              <Flex direction='column' gap='5'>
                {getValues('tours').map((_tour, i) => (
                  <div key={i} className={styles.client}>
                    <TourTotalCalculator index={i} setValue={setValue} control={control} />

                    <Grid align='center' columns='60px 1fr 60px 1fr' gap='3'>
                      <Text weight='medium'>지역</Text>
                      <TextField.Root
                        size='3'
                        {...register(`tours.${i}.region`, {
                          required: isDirtyField('tours') && true
                        })}
                      />

                      <Text weight='medium'>상품명</Text>
                      <TextField.Root
                        size='3'
                        {...register(`tours.${i}.name`, {
                          required: isDirtyField('tours') && true
                        })}
                      />

                      <Text weight='medium'>출발 시간</Text>
                      <TextField.Root
                        size='3'
                        type='datetime-local'
                        {...register(`tours.${i}.start_date`, {
                          required: isDirtyField('tours') && true
                        })}
                      />

                      <Text weight='medium'>도착 시간</Text>
                      <TextField.Root
                        size='3'
                        type='datetime-local'
                        {...register(`tours.${i}.end_date`, {
                          required: isDirtyField('tours') && true
                        })}
                      />

                      <Text weight='medium'>인원</Text>
                      <Grid align='center' columns='30px 100px 30px 100px' gap='3'>
                        <span>성인</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`tours.${i}.adult_count`, {
                            required: isDirtyField('tours') && true,
                            valueAsNumber: true
                          })}
                        />
                        <span>소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`tours.${i}.children_count`, {
                            required: isDirtyField('tours') && true,
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
                            required: isDirtyField('tours') && true,
                            valueAsNumber: true
                          })}
                        />
                        <span>소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`tours.${i}.children_price`, {
                            required: isDirtyField('tours') && true,
                            valueAsNumber: true
                          })}
                        />
                      </Grid>

                      <Box gridColumn='1 / -1'>
                        <Grid align='center' columns='60px 1fr' gap='3'>
                          <Text weight='medium'>요금 상세</Text>
                          <Flex align='center' gap='3'>
                            <Text wrap='nowrap'>예약금</Text>
                            <TextField.Root
                              type='number'
                              min='0'
                              size='3'
                              {...register(`tours.${i}.deposit`, {
                                required: isDirtyField('tours') && true,
                                valueAsNumber: true
                              })}
                            />
                            <Text wrap='nowrap'>잔금</Text>
                            <TextField.Root
                              type='number'
                              size='3'
                              readOnly
                              {...register(`tours.${i}.balance`, {
                                valueAsNumber: true
                              })}
                            />
                            <Text wrap='nowrap'>합계</Text>
                            <TextField.Root
                              type='number'
                              size='3'
                              readOnly
                              {...register(`tours.${i}.total_amount`, {
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
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
                  {JSON.stringify({ isDirty: isDirtyField('tours'), ...watch('tours') }, null, 2)}
                </pre>
              )}
            </Section>
          </Card>

          <Card asChild size='3'>
            <Section>
              <Heading as='h3' mb='4'>
                렌터카
              </Heading>

              <Flex direction='column' gap='5'>
                {getValues('cars').map((_car, i) => {
                  return (
                    <div key={i} className={styles.client}>
                      <CarTotalCalculator index={i} setValue={setValue} control={control} />

                      <Grid align='center' columns='60px 1fr 60px 1fr' gap='3'>
                        <Box gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>지역</Text>
                            <TextField.Root
                              size='3'
                              {...register(`cars.${i}.region`, {
                                required: isDirtyField('cars') && true
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
                                  {...register(`cars.${i}.pickup_date`, {
                                    required: isDirtyField('cars') && true
                                  })}
                                />
                              </Container>
                              <Container flexGrow='1'>
                                <TextField.Root
                                  type='date'
                                  size='3'
                                  {...register(`cars.${i}.return_date`, {
                                    required: isDirtyField('cars') && true
                                  })}
                                />
                              </Container>
                            </Flex>
                          </Grid>
                        </Box>

                        <Text weight='medium'>차종</Text>
                        <TextField.Root
                          size='3'
                          {...register(`cars.${i}.model`, {
                            required: isDirtyField('cars') && true
                          })}
                        />

                        <Text weight='medium'>운전자</Text>
                        <TextField.Root
                          size='3'
                          {...register(`cars.${i}.driver`, {
                            required: isDirtyField('cars') && true
                          })}
                        />

                        <Box gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>조건</Text>
                            <TextField.Root
                              size='3'
                              {...register(`cars.${i}.options`, {
                                required: isDirtyField('cars') && true
                              })}
                            />
                          </Grid>
                        </Box>

                        <Text weight='medium'>픽업 장소</Text>
                        <TextField.Root
                          size='3'
                          {...register(`cars.${i}.pickup_location`, {
                            required: isDirtyField('cars') && true
                          })}
                        />

                        <Text weight='medium'>픽업 시간</Text>
                        <TextField.Root
                          type='time'
                          size='3'
                          {...register(`cars.${i}.pickup_time`, {
                            required: isDirtyField('cars') && true
                          })}
                        />

                        <Text weight='medium'>대여일</Text>
                        <TextField.Root
                          type='number'
                          min='1'
                          size='3'
                          {...register(`cars.${i}.rental_days`, {
                            required: isDirtyField('cars') && true,
                            valueAsNumber: true
                          })}
                        />

                        <Box gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>요금 상세</Text>
                            <Flex align='center' gap='3'>
                              <Text wrap='nowrap'>1일요금</Text>
                              <TextField.Root
                                type='number'
                                min='0'
                                size='3'
                                {...register(`cars.${i}.daily_rate`, {
                                  required: isDirtyField('cars') && true,
                                  valueAsNumber: true
                                })}
                              />
                              <Text wrap='nowrap'>예약금</Text>
                              <TextField.Root
                                type='number'
                                min='0'
                                size='3'
                                {...register(`cars.${i}.deposit`, {
                                  required: isDirtyField('cars') && true,
                                  valueAsNumber: true
                                })}
                              />
                              <Text wrap='nowrap'>잔금</Text>
                              <TextField.Root
                                type='number'
                                size='3'
                                readOnly
                                {...register(`cars.${i}.balance`, {
                                  valueAsNumber: true
                                })}
                              />
                              <Text wrap='nowrap'>합계</Text>
                              <TextField.Root
                                type='number'
                                size='3'
                                readOnly
                                {...register(`cars.${i}.total_amount`, {
                                  valueAsNumber: true
                                })}
                              />
                            </Flex>
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
                  {JSON.stringify({ isDirty: isDirtyField('cars'), ...watch('cars') }, null, 2)}
                </pre>
              )}
            </Section>
          </Card>

          <Flex justify='end' position='sticky' bottom='5'>
            <Button size='3' color='ruby'>
              <Upload />
              등록
            </Button>
          </Flex>
        </form>
      </Flex>
    </div>
  );
}
