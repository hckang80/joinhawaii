'use client';

import { observable } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import {
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Radio,
  RadioCards,
  TextArea,
  TextField
} from '@radix-ui/themes';
import { PlusIcon } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import styles from './page.module.css';

type Client = typeof defaultClientValues;

type Flight = typeof defaultFlightValues;

interface FormData {
  clients: Client[];
  flight: {
    international: Flight;
    domestic: Flight[];
  };
}

const GENDER_TYPE = ['MR', 'MS'] as const;

const defaultClientValues = {
  koreanName: '',
  englishName: '',
  gender: '',
  residentId: '',
  phoneNumber: '',
  email: '',
  notes: ''
};

const defaultFlightValues = {
  flightNumber: '',
  departureDatetime: '',
  departureCity: '',
  arrivalDatetime: '',
  arrivalCity: '',
  capacity: {
    adult: 1,
    children: 0
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
      }
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
                        <span>이름</span>
                        <TextField.Root
                          size='3'
                          {...register(`clients.${i}.koreanName`, { required: true })}
                        />

                        <span>이름(영문)</span>
                        <TextField.Root
                          size='3'
                          {...register(`clients.${i}.englishName`, { required: true })}
                        />

                        <span>성별</span>
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

                        <span>주민번호</span>
                        <TextField.Root
                          size='3'
                          {...register(`clients.${i}.residentId`, { required: true })}
                        />

                        <span>연락처</span>
                        <TextField.Root
                          size='3'
                          {...register(`clients.${i}.phoneNumber`, { required: true })}
                        />

                        <span>이메일</span>
                        <TextField.Root
                          size='3'
                          {...register(`clients.${i}.email`, { required: true })}
                        />

                        <span>비고</span>
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
                    <span>항공편명</span>
                    <TextField.Root
                      size='3'
                      {...register('flight.international.flightNumber', { required: true })}
                    />
                    <span>출발 시간</span>
                    <TextField.Root
                      size='3'
                      type='datetime-local'
                      {...register('flight.international.departureDatetime', { required: true })}
                    ></TextField.Root>
                    <span>출발지</span>
                    <TextField.Root
                      size='3'
                      value='인천'
                      readOnly
                      {...register('flight.international.departureCity', { required: true })}
                    />
                    <span>도착 시간</span>
                    <TextField.Root
                      size='3'
                      type='datetime-local'
                      {...register('flight.international.arrivalDatetime', { required: true })}
                    ></TextField.Root>
                    <span>도착지</span>
                    <TextField.Root
                      size='3'
                      {...register('flight.international.arrivalCity', { required: true })}
                    />
                    <span>인원</span>
                    <Grid align='center' columns='30px 100px 30px 100px' gap='3'>
                      <span>성인</span>
                      <TextField.Root
                        type='number'
                        size='3'
                        {...register('flight.international.capacity.adult', {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                      <span>소아</span>
                      <TextField.Root
                        type='number'
                        size='3'
                        {...register('flight.international.capacity.children', {
                          required: true,
                          valueAsNumber: true
                        })}
                      />
                    </Grid>
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
                              <span>항공편명</span>
                              <TextField.Root
                                size='3'
                                {...register(`flight.domestic.${i}.flightNumber`, {
                                  required: true
                                })}
                              />
                              <span>출발 시간</span>
                              <TextField.Root
                                size='3'
                                type='datetime-local'
                                {...register(`flight.domestic.${i}.departureDatetime`, {
                                  required: true
                                })}
                              ></TextField.Root>
                              <span>출발지</span>
                              <TextField.Root
                                size='3'
                                {...register(`flight.domestic.${i}.departureCity`, {
                                  required: true
                                })}
                              />
                              <span>도착 시간</span>
                              <TextField.Root
                                size='3'
                                type='datetime-local'
                                {...register(`flight.domestic.${i}.arrivalDatetime`, {
                                  required: true
                                })}
                              ></TextField.Root>
                              <span>도착지</span>
                              <TextField.Root
                                size='3'
                                {...register(`flight.domestic.${i}.arrivalCity`, {
                                  required: true
                                })}
                              />
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

          <Flex justify='end' mt='4'>
            <Button size='3'>확인</Button>
          </Flex>

          <pre>{JSON.stringify(watch(), null, 2)}</pre>
        </form>
      </Flex>
    </div>
  );
}
