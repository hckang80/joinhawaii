'use client';

import {
  defaultCarValues,
  defaultClientValues,
  defaultFlightValues,
  defaultHotelValues,
  defaultTourValues
} from '@/constants';
import type { ReservationFormData, ReservationResponse } from '@/types';
import { observable } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import {
  Button,
  Card,
  Checkbox,
  Container,
  Flex,
  Grid,
  Heading,
  Radio,
  RadioCards,
  Text,
  TextArea,
  TextField
} from '@radix-ui/themes';
import { PlusIcon, UserMinus, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  type Control,
  Controller,
  type SubmitHandler,
  useForm,
  type UseFormSetValue,
  useWatch
} from 'react-hook-form';
import styles from './page.module.css';

const GENDER_TYPE = ['MR', 'MS'] as const;

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
      `flights.${index}.capacity.adult`,
      `flights.${index}.capacity.children`,
      `flights.${index}.price.adult`,
      `flights.${index}.price.children`,
      `flights.${index}.price.deposit`
    ]
  });

  useEffect(() => {
    const [adultCapacity, childrenCapacity, adultPrice, childrenPrice, depositPrice] =
      watchedValues;
    const total = adultCapacity * adultPrice + childrenCapacity * childrenPrice;
    setValue(`flights.${index}.price.total`, total, { shouldValidate: true });
    setValue(`flights.${index}.price.balance`, total - depositPrice, { shouldValidate: true });
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
      `hotels.${index}.price.nightly`,
      `hotels.${index}.nights`,
      `hotels.${index}.price.deposit`
    ]
  });

  useEffect(() => {
    const [nightly, nights, depositPrice] = watchedValues;
    const total = nightly * nights;
    setValue(`hotels.${index}.price.total`, total, { shouldValidate: true });
    setValue(`hotels.${index}.price.balance`, total - depositPrice, { shouldValidate: true });
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
      `tours.${index}.participant.adult`,
      `tours.${index}.participant.children`,
      `tours.${index}.price.adult`,
      `tours.${index}.price.children`,
      `tours.${index}.price.deposit`
    ]
  });

  useEffect(() => {
    const [adultParticipant, childrenParticipant, adultPrice, childrenPrice, depositPrice] =
      watchedValues;
    const total = adultParticipant * adultPrice + childrenParticipant * childrenPrice;
    setValue(`tours.${index}.price.total`, total, { shouldValidate: true });
    setValue(`tours.${index}.price.balance`, total - depositPrice, { shouldValidate: true });
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
      `cars.${index}.price.nightly`,
      `cars.${index}.rental_days`,
      `cars.${index}.price.deposit`
    ]
  });

  useEffect(() => {
    const [nightly, rentalDays, depositPrice] = watchedValues;
    const total = nightly * rentalDays;
    setValue(`cars.${index}.price.total`, total, { shouldValidate: true });
    setValue(`cars.${index}.price.balance`, total - depositPrice, { shouldValidate: true });
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
  } = useForm<ReservationFormData>({
    defaultValues: {
      ...(isModify && {
        reservation_id: data.reservation_id
      }),
      clients: data?.clients || [defaultClientValues],
      flights: [
        {
          ...defaultFlightValues,
          departure_city: '인천'
        }
      ],
      hotels: [defaultHotelValues],
      tours: [defaultTourValues],
      cars: [defaultCarValues]
    }
  });

  const isClientsDirty = !!dirtyFields.clients?.length;
  const isFlightsDirty = !!dirtyFields.flights?.length;
  const isHotelsDirty = !!dirtyFields.hotels?.length;
  const isToursDirty = !!dirtyFields.tours?.length;
  const isCarsDirty = !!dirtyFields.cars?.length;

  const reservationIndex = use$(status$.reservationIndex);
  const mainClientName = getValues('clients')[reservationIndex].korean_name;

  const onSubmit: SubmitHandler<ReservationFormData> = async data => {
    try {
      const response = await fetch('/api/reservation', {
        method: isModify ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          main_client_name: mainClientName
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // router.push('/reservations');

      console.log('예약이 완료되었습니다:', result.data.reservation_id);
    } catch (error) {
      console.error('예약 중 오류가 발생했습니다:', error);
    }
  };

  const removeItem = (key: keyof ReservationFormData) => {
    getValues(key).pop();
    setValue(key, getValues(key));
  };

  const addClient = () => {
    setValue('clients', [...getValues('clients'), defaultClientValues]);
  };

  const handleChangeReservation = (event: React.ChangeEvent<HTMLInputElement>) => {
    status$.reservationIndex.set(() => +event.target.value);
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
            <section>
              <Heading as='h3' mb='4'>
                고객정보
              </Heading>
              <div>
                {getValues('clients').map((_client, i) => {
                  return (
                    <div key={i} className={styles.client}>
                      <Flex asChild justify='end' align='center' gap='1' mb='2'>
                        <label>
                          예약자
                          <Radio
                            name='reservation'
                            value={'' + i}
                            defaultChecked={i === reservationIndex}
                            onChange={handleChangeReservation}
                          />
                        </label>
                      </Flex>
                      <Grid align='center' columns='60px 1fr 70px 1fr' gap='3'>
                        <Text weight='medium'>이름</Text>
                        <TextField.Root
                          size='3'
                          {...register(`clients.${i}.korean_name`, { required: true })}
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
                              columns='repeat(auto-fit, minmax(100px, auto))'
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

                        <Container gridColumn='1 / -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium' mb='2'>
                              비고
                            </Text>
                            <TextArea {...register(`clients.${i}.notes`)} />
                          </Grid>
                        </Container>
                      </Grid>
                    </div>
                  );
                })}
              </div>
              <Flex justify='end' mt='4' gap='1'>
                <Button title='인원 추가' type='button' color='red' onClick={addClient}>
                  <UserPlus />
                </Button>
                {getValues('clients').length > 1 && (
                  <Button
                    title='인원 추가'
                    type='button'
                    color='red'
                    variant='soft'
                    onClick={() => removeItem('clients')}
                  >
                    <UserMinus />
                  </Button>
                )}
              </Flex>
              <pre>{JSON.stringify({ isDirty: isClientsDirty, ...watch('clients') }, null, 2)}</pre>
            </section>
          </Card>

          <Card asChild size='3'>
            <section>
              <Heading as='h3' mb='4'>
                항공정보
              </Heading>

              <Flex direction='column' gap='5'>
                {getValues('flights').map((_flight, i) => (
                  <div key={i} className={styles.client}>
                    <FlightTotalCalculator index={i} setValue={setValue} control={control} />

                    <Grid align='center' columns='60px 1fr 60px 1fr' gap='3'>
                      <Container gridColumn='1 / -1'>
                        <Grid align='center' columns='60px 1fr' gap='3'>
                          <Text weight='medium'>항공편명</Text>
                          <TextField.Root
                            size='3'
                            {...register(`flights.${i}.flight_number`, { required: true })}
                          />
                        </Grid>
                      </Container>

                      <Text weight='medium'>출발 시간</Text>
                      <TextField.Root
                        size='3'
                        type='datetime-local'
                        {...register(`flights.${i}.departure_datetime`, { required: true })}
                      />

                      <Text weight='medium'>출발지</Text>
                      <TextField.Root
                        size='3'
                        readOnly={!i}
                        {...register(`flights.${i}.departure_city`, { required: true })}
                      />

                      <Text weight='medium'>도착 시간</Text>
                      <TextField.Root
                        size='3'
                        type='datetime-local'
                        {...register(`flights.${i}.arrival_datetime`, { required: true })}
                      />

                      <Text weight='medium'>도착지</Text>
                      <TextField.Root
                        size='3'
                        {...register(`flights.${i}.arrival_city`, { required: true })}
                      />

                      <Text weight='medium'>인원</Text>
                      <Grid align='center' columns='30px 100px 30px 100px' gap='3'>
                        <span>성인</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`flights.${i}.capacity.adult`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                        <span>소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`flights.${i}.capacity.children`, {
                            required: true,
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
                          {...register(`flights.${i}.price.adult`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                        <span>소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`flights.${i}.price.children`, {
                            required: true,
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
                              {...register(`flights.${i}.price.deposit`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                            <Text wrap='nowrap'>잔금</Text>
                            <TextField.Root
                              type='number'
                              size='3'
                              readOnly
                              {...register(`flights.${i}.price.balance`, {
                                valueAsNumber: true
                              })}
                            />
                            <Text wrap='nowrap'>합계</Text>
                            <TextField.Root
                              type='number'
                              size='3'
                              readOnly
                              {...register(`flights.${i}.price.total`, {
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
                <Button type='button' variant='surface' onClick={addDomesticFlight}>
                  <PlusIcon size='20' />
                  주내선 추가
                </Button>
              </Flex>

              <pre>{JSON.stringify({ isDirty: isFlightsDirty, ...watch('flights') }, null, 2)}</pre>
            </section>
          </Card>

          <Card asChild size='3'>
            <section>
              <Heading as='h3' mb='4'>
                호텔
              </Heading>

              <Flex asChild justify='end' align='center' gap='1' mb='2'>
                <label>
                  호텔 없음
                  <Checkbox
                    onCheckedChange={value => setValue('hotels', value ? [] : [defaultHotelValues])}
                  />
                </label>
              </Flex>

              <div>
                {getValues('hotels').map((_hotel, i) => {
                  return (
                    <div key={i} className={styles.client}>
                      <HotelTotalCalculator index={i} setValue={setValue} control={control} />

                      <Grid align='center' columns='60px 1fr 60px 1fr' gap='3'>
                        <Container gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>지역</Text>
                            <TextField.Root
                              size='3'
                              {...register(`hotels.${i}.region`, { required: true })}
                            />
                          </Grid>
                        </Container>

                        <Container gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>날짜</Text>
                            <Flex gap='2'>
                              <Container flexGrow='1'>
                                <TextField.Root
                                  type='date'
                                  size='3'
                                  {...register(`hotels.${i}.check_in_date`, { required: true })}
                                />
                              </Container>
                              <Container flexGrow='1'>
                                <TextField.Root
                                  type='date'
                                  size='3'
                                  {...register(`hotels.${i}.check_out_date`, { required: true })}
                                />
                              </Container>
                            </Flex>
                          </Grid>
                        </Container>

                        <Container gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>호텔명</Text>
                            <TextField.Root
                              size='3'
                              {...register(`hotels.${i}.hotel_name`, { required: true })}
                            />
                          </Grid>
                        </Container>

                        <Text weight='medium'>객실타입</Text>
                        <TextField.Root
                          size='3'
                          {...register(`hotels.${i}.room_type`, { required: true })}
                        />

                        <Text weight='medium'>숙박일</Text>
                        <TextField.Root
                          type='number'
                          min='1'
                          size='3'
                          {...register(`hotels.${i}.nights`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />

                        <Container gridColumn='1/ -1'>
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
                        </Container>

                        <Container gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>요금 상세</Text>
                            <Flex align='center' gap='3'>
                              <Text wrap='nowrap'>1박요금</Text>
                              <TextField.Root
                                type='number'
                                min='0'
                                size='3'
                                {...register(`hotels.${i}.price.nightly`, {
                                  required: true,
                                  valueAsNumber: true
                                })}
                              />
                              <Text wrap='nowrap'>예약금</Text>
                              <TextField.Root
                                type='number'
                                min='0'
                                size='3'
                                {...register(`hotels.${i}.price.deposit`, {
                                  required: true,
                                  valueAsNumber: true
                                })}
                              />
                              <Text wrap='nowrap'>잔금</Text>
                              <TextField.Root
                                type='number'
                                size='3'
                                readOnly
                                {...register(`hotels.${i}.price.balance`, {
                                  valueAsNumber: true
                                })}
                              />
                              <Text wrap='nowrap'>합계</Text>
                              <TextField.Root
                                type='number'
                                size='3'
                                readOnly
                                {...register(`hotels.${i}.price.total`, {
                                  valueAsNumber: true
                                })}
                              />
                            </Flex>
                          </Grid>
                        </Container>
                      </Grid>
                    </div>
                  );
                })}
              </div>

              {!!getValues('hotels').length && (
                <Flex justify='end' mt='4'>
                  <Button type='button' variant='surface' onClick={addHotel}>
                    <PlusIcon size='20' />
                    호텔 추가
                  </Button>
                </Flex>
              )}

              <pre>{JSON.stringify({ isDirty: isHotelsDirty, ...watch('hotels') }, null, 2)}</pre>
            </section>
          </Card>

          <Card asChild size='3'>
            <section>
              <Heading as='h3' mb='4'>
                선택관광
              </Heading>

              <Flex asChild justify='end' align='center' gap='1' mb='2'>
                <label>
                  선택관광 없음
                  <Checkbox
                    onCheckedChange={value => setValue('tours', value ? [] : [defaultTourValues])}
                  />
                </label>
              </Flex>

              <Flex direction='column' gap='5'>
                {getValues('tours').map((_tour, i) => (
                  <div key={i} className={styles.client}>
                    <TourTotalCalculator index={i} setValue={setValue} control={control} />

                    <Grid align='center' columns='60px 1fr 60px 1fr' gap='3'>
                      <Text weight='medium'>지역</Text>
                      <TextField.Root
                        size='3'
                        {...register(`tours.${i}.region`, { required: true })}
                      />

                      <Text weight='medium'>상품명</Text>
                      <TextField.Root
                        size='3'
                        {...register(`tours.${i}.name`, { required: true })}
                      />

                      <Text weight='medium'>출발 시간</Text>
                      <TextField.Root
                        size='3'
                        type='datetime-local'
                        {...register(`tours.${i}.start_date`, { required: true })}
                      />

                      <Text weight='medium'>도착 시간</Text>
                      <TextField.Root
                        size='3'
                        type='datetime-local'
                        {...register(`tours.${i}.end_date`, { required: true })}
                      />

                      <Text weight='medium'>인원</Text>
                      <Grid align='center' columns='30px 100px 30px 100px' gap='3'>
                        <span>성인</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`tours.${i}.participant.adult`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                        <span>소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`tours.${i}.participant.children`, {
                            required: true,
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
                          {...register(`tours.${i}.price.adult`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                        <span>소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          size='3'
                          {...register(`tours.${i}.price.children`, {
                            required: true,
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
                              {...register(`tours.${i}.price.deposit`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                            <Text wrap='nowrap'>잔금</Text>
                            <TextField.Root
                              type='number'
                              size='3'
                              readOnly
                              {...register(`tours.${i}.price.balance`, {
                                valueAsNumber: true
                              })}
                            />
                            <Text wrap='nowrap'>합계</Text>
                            <TextField.Root
                              type='number'
                              size='3'
                              readOnly
                              {...register(`tours.${i}.price.total`, {
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

              {!!getValues('tours').length && (
                <Flex justify='end' mt='4'>
                  <Button type='button' variant='surface' onClick={addTour}>
                    <PlusIcon size='20' />
                    선택관광 추가
                  </Button>
                </Flex>
              )}

              <pre>{JSON.stringify({ isDirty: isToursDirty, ...watch('tours') }, null, 2)}</pre>
            </section>
          </Card>

          <Card asChild size='3'>
            <section>
              <Heading as='h3' mb='4'>
                렌터카
              </Heading>

              <Flex asChild justify='end' align='center' gap='1' mb='2'>
                <label>
                  렌터카 없음
                  <Checkbox
                    onCheckedChange={value => setValue('cars', value ? [] : [defaultCarValues])}
                  />
                </label>
              </Flex>

              <div>
                {getValues('cars').map((_car, i) => {
                  return (
                    <div key={i} className={styles.client}>
                      <CarTotalCalculator index={i} setValue={setValue} control={control} />

                      <Grid align='center' columns='60px 1fr 60px 1fr' gap='3'>
                        <Container gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>지역</Text>
                            <TextField.Root
                              size='3'
                              {...register(`cars.${i}.region`, { required: true })}
                            />
                          </Grid>
                        </Container>

                        <Container gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>날짜</Text>
                            <Flex gap='2'>
                              <Container flexGrow='1'>
                                <TextField.Root
                                  type='date'
                                  size='3'
                                  {...register(`cars.${i}.pickup_date`, { required: true })}
                                />
                              </Container>
                              <Container flexGrow='1'>
                                <TextField.Root
                                  type='date'
                                  size='3'
                                  {...register(`cars.${i}.return_date`, { required: true })}
                                />
                              </Container>
                            </Flex>
                          </Grid>
                        </Container>

                        <Text weight='medium'>차종</Text>
                        <TextField.Root
                          size='3'
                          {...register(`cars.${i}.model`, { required: true })}
                        />

                        <Text weight='medium'>운전자</Text>
                        <TextField.Root
                          size='3'
                          {...register(`cars.${i}.driver`, { required: true })}
                        />

                        <Container gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>조건</Text>
                            <TextField.Root
                              size='3'
                              {...register(`cars.${i}.options`, { required: true })}
                            />
                          </Grid>
                        </Container>

                        <Text weight='medium'>픽업 장소</Text>
                        <TextField.Root
                          size='3'
                          {...register(`cars.${i}.pickup_location`, { required: true })}
                        />

                        <Text weight='medium'>픽업 시간</Text>
                        <TextField.Root
                          type='time'
                          size='3'
                          {...register(`cars.${i}.pickup_time`, { required: true })}
                        />

                        <Text weight='medium'>대여일</Text>
                        <TextField.Root
                          type='number'
                          min='1'
                          size='3'
                          {...register(`cars.${i}.rental_days`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />

                        <Container gridColumn='1/ -1'>
                          <Grid align='center' columns='60px 1fr' gap='3'>
                            <Text weight='medium'>요금 상세</Text>
                            <Flex align='center' gap='3'>
                              <Text wrap='nowrap'>1일요금</Text>
                              <TextField.Root
                                type='number'
                                min='0'
                                size='3'
                                {...register(`cars.${i}.price.nightly`, {
                                  required: true,
                                  valueAsNumber: true
                                })}
                              />
                              <Text wrap='nowrap'>예약금</Text>
                              <TextField.Root
                                type='number'
                                min='0'
                                size='3'
                                {...register(`cars.${i}.price.deposit`, {
                                  required: true,
                                  valueAsNumber: true
                                })}
                              />
                              <Text wrap='nowrap'>잔금</Text>
                              <TextField.Root
                                type='number'
                                size='3'
                                readOnly
                                {...register(`cars.${i}.price.balance`, {
                                  valueAsNumber: true
                                })}
                              />
                              <Text wrap='nowrap'>합계</Text>
                              <TextField.Root
                                type='number'
                                size='3'
                                readOnly
                                {...register(`cars.${i}.price.total`, {
                                  valueAsNumber: true
                                })}
                              />
                            </Flex>
                          </Grid>
                        </Container>
                      </Grid>
                    </div>
                  );
                })}
              </div>

              {!!getValues('cars').length && (
                <Flex justify='end' mt='4'>
                  <Button type='button' variant='surface' onClick={addCar}>
                    <PlusIcon size='20' />
                    렌터카 추가
                  </Button>
                </Flex>
              )}

              <pre>{JSON.stringify({ isDirty: isCarsDirty, ...watch('cars') }, null, 2)}</pre>
            </section>
          </Card>

          <Flex justify='end' mt='4'>
            <Button size='3'>확인</Button>
          </Flex>
        </form>
      </Flex>
    </div>
  );
}
