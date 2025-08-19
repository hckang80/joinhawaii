'use client';

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
import { PlusIcon } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import styles from './page.module.css';

type Client = typeof defaultClientValues;

type Flight = typeof defaultFlightValues;

type Hotel = typeof defaultHotelValues;

interface FormData {
  clients: Client[];
  flight: {
    international: Flight;
    domestic: Flight[];
  };
  hotels: Hotel[];
}

const GENDER_TYPE = ['MR', 'MS'] as const;

const defaultClientValues = {
  korean_name: '',
  english_name: '',
  gender: '',
  resident_id: '',
  phone_number: '',
  email: '',
  notes: ''
};

const defaultFlightValues = {
  flight_number: '',
  departure_datetime: '',
  departure_city: '',
  arrival_datetime: '',
  arrival_city: '',
  capacity: {
    adult: 1,
    children: 0
  },
  price: {
    adult: 0,
    children: 0,
    deposit: 0,
    balance: 0,
    total: 0
  }
};

const defaultHotelValues = {
  region: '',
  check_in_date: '',
  check_out_date: '',
  name: '',
  room_type: '',
  is_breakfast_included: false,
  is_resort_fee: false,
  nights: 1,
  price: {
    nightly: 0,
    deposit: 0,
    balance: 0,
    total: 0
  }
};

const status$ = observable({
  reservationIndex: 0
});

export default function ReservationsFormClientContainer() {
  const reservationIndex = use$(status$.reservationIndex);

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, isDirty },
    getValues,
    setValue,
    control
  } = useForm<FormData>({
    defaultValues: {
      clients: [defaultClientValues],
      flight: {
        international: defaultFlightValues,
        domestic: []
      },
      hotels: [defaultHotelValues]
    }
  });

  const onSubmit: SubmitHandler<FormData> = data => {
    console.log({ data });
  };

  const addClient = () => {
    setValue('clients', [...getValues('clients'), defaultClientValues]);
  };

  const handleChangeReservation = (event: React.ChangeEvent<HTMLInputElement>) => {
    status$.reservationIndex.set(() => +event.target.value);
  };

  const addDomesticFlight = () => {
    setValue('flight.domestic', [...getValues('flight.domestic'), defaultFlightValues]);
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
                      <Grid align='center' columns='100px 1fr' gap='3'>
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

                        <Text weight='medium'>비고</Text>
                        <TextArea {...register(`clients.${i}.notes`)} />
                      </Grid>
                    </div>
                  );
                })}
              </div>

              <Flex justify='end' mt='4'>
                <Button type='button' variant='surface' onClick={addClient}>
                  <PlusIcon size='20' />
                  인원 추가
                </Button>
              </Flex>
            </section>
          </Card>

          <Card asChild size='3'>
            <section>
              <Heading as='h3' mb='4'>
                항공정보
              </Heading>

              <Flex direction='column' gap='5'>
                <section>
                  <Heading as='h4' mb='4' size='5'>
                    국제선
                  </Heading>
                  <Grid align='center' columns='100px 1fr' gap='3'>
                    <Text weight='medium'>항공편명</Text>
                    <TextField.Root
                      size='3'
                      {...register('flight.international.flight_number', { required: true })}
                    />
                    <Text weight='medium'>출발 시간</Text>
                    <TextField.Root
                      size='3'
                      type='datetime-local'
                      {...register('flight.international.departure_datetime', { required: true })}
                    ></TextField.Root>
                    <Text weight='medium'>출발지</Text>
                    <TextField.Root
                      size='3'
                      value='인천'
                      readOnly
                      {...register('flight.international.departure_city', { required: true })}
                    />
                    <Text weight='medium'>도착 시간</Text>
                    <TextField.Root
                      size='3'
                      type='datetime-local'
                      {...register('flight.international.arrival_datetime', { required: true })}
                    ></TextField.Root>
                    <Text weight='medium'>도착지</Text>
                    <TextField.Root
                      size='3'
                      {...register('flight.international.arrival_city', { required: true })}
                    />
                    <Text weight='medium'>인원</Text>
                    <Grid align='center' columns='30px 100px 30px 100px' gap='3'>
                      <span>성인</span>
                      <TextField.Root
                        type='number'
                        min='0'
                        size='3'
                        {...register('flight.international.capacity.adult', {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                      <span>소아</span>
                      <TextField.Root
                        type='number'
                        min='0'
                        size='3'
                        {...register('flight.international.capacity.children', {
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
                        {...register('flight.international.price.adult', {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                      <span>소아</span>
                      <TextField.Root
                        type='number'
                        min='0'
                        size='3'
                        {...register('flight.international.price.children', {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                    </Grid>

                    <Text weight='medium'>요금 상세</Text>
                    <Flex align='center' gap='3'>
                      <Text wrap='nowrap'>예약금</Text>
                      <TextField.Root
                        type='number'
                        min='0'
                        size='3'
                        {...register('flight.international.price.deposit', {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                      <Text wrap='nowrap'>잔금</Text>
                      <TextField.Root
                        type='number'
                        min='0'
                        size='3'
                        {...register('flight.international.price.balance', {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                      <Text wrap='nowrap'>합계</Text>
                      <TextField.Root
                        type='number'
                        min='0'
                        size='3'
                        {...register('flight.international.price.total', {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                    </Flex>
                  </Grid>
                </section>

                {!!getValues('flight.domestic').length && (
                  <section>
                    <Heading as='h4' mb='4' size='5'>
                      주내선
                    </Heading>
                    <div>
                      {getValues('flight.domestic').map((_flight, i) => {
                        return (
                          <div key={i} className={styles.client}>
                            <Grid align='center' columns='100px 1fr' gap='3'>
                              <Text weight='medium'>항공편명</Text>
                              <TextField.Root
                                size='3'
                                {...register(`flight.domestic.${i}.flight_number`, {
                                  required: true
                                })}
                              />
                              <Text weight='medium'>출발 시간</Text>
                              <TextField.Root
                                size='3'
                                type='datetime-local'
                                {...register(`flight.domestic.${i}.departure_datetime`, {
                                  required: true
                                })}
                              ></TextField.Root>
                              <Text weight='medium'>출발지</Text>
                              <TextField.Root
                                size='3'
                                {...register(`flight.domestic.${i}.departure_city`, {
                                  required: true
                                })}
                              />
                              <Text weight='medium'>도착 시간</Text>
                              <TextField.Root
                                size='3'
                                type='datetime-local'
                                {...register(`flight.domestic.${i}.arrival_datetime`, {
                                  required: true
                                })}
                              ></TextField.Root>
                              <Text weight='medium'>도착지</Text>
                              <TextField.Root
                                size='3'
                                {...register(`flight.domestic.${i}.arrival_city`, {
                                  required: true
                                })}
                              />

                              <Text weight='medium'>인원</Text>
                              <Grid align='center' columns='30px 100px 30px 100px' gap='3'>
                                <span>성인</span>
                                <TextField.Root
                                  type='number'
                                  min='0'
                                  size='3'
                                  {...register(`flight.domestic.${i}.capacity.adult`, {
                                    required: true,
                                    valueAsNumber: true
                                  })}
                                />
                                <span>소아</span>
                                <TextField.Root
                                  type='number'
                                  min='0'
                                  size='3'
                                  {...register(`flight.domestic.${i}.capacity.children`, {
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
                                  {...register(`flight.domestic.${i}.price.adult`, {
                                    required: true,
                                    valueAsNumber: true
                                  })}
                                />
                                <span>소아</span>
                                <TextField.Root
                                  type='number'
                                  min='0'
                                  size='3'
                                  {...register(`flight.domestic.${i}.price.children`, {
                                    required: true,
                                    valueAsNumber: true
                                  })}
                                />
                              </Grid>

                              <Text weight='medium'>요금 상세</Text>
                              <Flex align='center' gap='3'>
                                <Text wrap='nowrap'>예약금</Text>
                                <TextField.Root
                                  type='number'
                                  min='0'
                                  size='3'
                                  {...register(`flight.domestic.${i}.price.deposit`, {
                                    required: true,
                                    valueAsNumber: true
                                  })}
                                />
                                <Text wrap='nowrap'>잔금</Text>
                                <TextField.Root
                                  type='number'
                                  min='0'
                                  size='3'
                                  {...register(`flight.domestic.${i}.price.balance`, {
                                    required: true,
                                    valueAsNumber: true
                                  })}
                                />
                                <Text wrap='nowrap'>합계</Text>
                                <TextField.Root
                                  type='number'
                                  min='0'
                                  size='3'
                                  {...register(`flight.domestic.${i}.price.total`, {
                                    required: true,
                                    valueAsNumber: true
                                  })}
                                />
                              </Flex>
                            </Grid>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </Flex>

              <Flex justify='end' mt='4'>
                <Button type='button' variant='surface' onClick={addDomesticFlight}>
                  <PlusIcon size='20' />
                  주내선 추가
                </Button>
              </Flex>
            </section>
          </Card>

          <Card asChild size='3'>
            <section>
              <Heading as='h3' mb='4'>
                호텔
              </Heading>

              <div>
                {getValues('hotels').map((_hotel, i) => {
                  return (
                    <div key={i} className={styles.client}>
                      <Grid align='center' columns='100px 1fr' gap='3'>
                        <Text weight='medium'>지역</Text>
                        <TextField.Root
                          size='3'
                          {...register(`hotels.${i}.region`, { required: true })}
                        />

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

                        <Text weight='medium'>호텔명</Text>
                        <TextField.Root
                          size='3'
                          {...register(`hotels.${i}.name`, { required: true })}
                        />

                        <Text weight='medium'>객실타입</Text>
                        <TextField.Root
                          size='3'
                          {...register(`hotels.${i}.room_type`, { required: true })}
                        />

                        <Text weight='medium'>조식</Text>
                        <Checkbox {...register(`hotels.${i}.is_breakfast_included`)} />

                        <Text weight='medium'>리조트피</Text>
                        <Checkbox {...register(`hotels.${i}.is_resort_fee`)} />

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
                            min='0'
                            size='3'
                            {...register(`hotels.${i}.price.balance`, {
                              required: true,
                              valueAsNumber: true
                            })}
                          />
                          <Text wrap='nowrap'>합계</Text>
                          <TextField.Root
                            type='number'
                            min='0'
                            size='3'
                            {...register(`hotels.${i}.price.total`, {
                              required: true,
                              valueAsNumber: true
                            })}
                          />
                        </Flex>
                      </Grid>
                    </div>
                  );
                })}
              </div>

              <Flex justify='end' mt='4'>
                <Button type='button' variant='surface' onClick={addClient}>
                  <PlusIcon size='20' />
                  인원 추가
                </Button>
              </Flex>
            </section>
          </Card>

          <Flex justify='end' mt='4'>
            <Button size='3'>확인</Button>
          </Flex>

          <pre>{JSON.stringify(watch(), null, 2)}</pre>
        </form>
      </Flex>
    </div>
  );
}
