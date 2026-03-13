import { DateTimeInput, NoData, TimeInput } from '@/components';
import { defaultFlightValues, PRODUCT_STATUS_COLOR, ProductStatus } from '@/constants';
import type { ProductFormType, ReservationFormData, ReservationResponse } from '@/types';
import {
  calculateTotalAmount,
  extractDateString,
  isDev,
  isRefunded,
  toReadableAmount,
  updateDateInISO
} from '@/utils';
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Section,
  Select,
  Table,
  Text,
  TextArea,
  TextField
} from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { Minus, Plane, Save } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import {
  type Control,
  Controller,
  SubmitHandler,
  useForm,
  type UseFormSetValue,
  useWatch
} from 'react-hook-form';
import { toast } from 'react-toastify';

export default function FlightForm({
  data,
  mutation
}: {
  data: ReservationResponse;
  mutation: ReturnType<
    typeof useMutation<{ data: ReservationResponse }, Error, ReservationFormData>
  >;
}) {
  const searchParams = useSearchParams();
  const reservation_id = searchParams.get('reservation_id')!;

  const {
    register,
    handleSubmit,
    watch,
    formState: { isDirty },
    getValues,
    setValue,
    control,
    reset
  } = useForm<ReservationFormData>({
    defaultValues: useMemo(
      () => ({
        reservation_id,
        flights: data.products.flights
      }),
      [reservation_id, data.products.flights]
    )
  });

  useEffect(() => {
    reset({
      reservation_id,
      flights: data.products.flights
    });
  }, [data.products.flights, reservation_id, reset]);

  const flights = useWatch({ control, name: 'flights' }) ?? [defaultFlightValues];

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');
    mutation.mutate(formData, {
      onSuccess: result => {
        return reset({
          ...formData,
          flights: result.data.products.flights
        });
      }
    });
  };

  const addItem = () => {
    setValue('flights', [...flights, defaultFlightValues]);
  };

  const removeItem = (target: ProductFormType) => {
    const items = getValues(target);
    setValue(target, items.slice(0, -1));
  };

  const isRemoveDisabled = flights.length <= data.products.flights.length;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card asChild size='3'>
        <Section id='flight'>
          <Heading as='h3' mb='4'>
            항공정보
          </Heading>

          {!!flights.length && (
            <Table.Root size='1' layout='fixed'>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell width='100px'>항공편</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='300px'>출발시간</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='100px'>출발지</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='300px'>도착시간</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='100px'>도착지</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='80px'>💰요금</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='80px'>🧑‍🤝‍🧑인원</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='180px'>
                    합계(<Text color='blue'>원가</Text>/판매가)
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='90px'>진행상태</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='200px'>메모</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              {flights.map((flight, i) => (
                <Table.Body
                  key={i}
                  className={clsx(
                    isRefunded(flight.status, data.products.flights[i]?.status) && 'is-disabled'
                  )}
                >
                  <Table.Row>
                    <Table.Cell>
                      <TextField.Root
                        size='1'
                        {...register(`flights.${i}.flight_number`, {
                          required: true,
                          setValueAs: value => (typeof value === 'string' ? value.trim() : value)
                        })}
                        placeholder='KE001'
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <DateTimeInput name={`flights.${i}.departure_datetime`} control={control} />
                    </Table.Cell>
                    <Table.Cell>
                      <TextField.Root
                        size='1'
                        {...register(`flights.${i}.departure_city`, {
                          setValueAs: value => (typeof value === 'string' ? value.trim() : value)
                        })}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Controller
                        name={`flights.${i}.arrival_datetime`}
                        control={control}
                        render={({ field }) => {
                          const departureDate = watch(`flights.${i}.departure_datetime`);
                          const dateString = extractDateString(field.value);
                          const minDate = extractDateString(departureDate);

                          return (
                            <Flex gap='2'>
                              <TextField.Root
                                {...field}
                                size='1'
                                type='date'
                                min={minDate}
                                value={dateString}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (value) {
                                    field.onChange(updateDateInISO(field.value, value));
                                  } else {
                                    field.onChange(null);
                                  }
                                }}
                                onFocus={() => {
                                  if (!field.value && departureDate) {
                                    field.onChange(departureDate);
                                  }
                                }}
                              />
                              <TimeInput name={`flights.${i}.arrival_datetime`} control={control} />
                            </Flex>
                          );
                        }}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <TextField.Root
                        size='1'
                        {...register(`flights.${i}.arrival_city`, {
                          setValueAs: value => (typeof value === 'string' ? value.trim() : value)
                        })}
                        placeholder='호놀룰루'
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Grid gap='2'>
                        <Flex direction='column'>
                          <span>🧑 성인</span>
                          <TextField.Root
                            size='1'
                            type='number'
                            min='0'
                            color='blue'
                            variant='soft'
                            {...register(`flights.${i}.adult_cost`)}
                          />
                        </Flex>
                        <Flex direction='column'>
                          <span>🧒 소아</span>
                          <TextField.Root
                            size='1'
                            type='number'
                            min='0'
                            color='blue'
                            variant='soft'
                            {...register(`flights.${i}.children_cost`, {
                              valueAsNumber: true
                            })}
                          />
                        </Flex>
                        <Flex direction='column'>
                          <span>👶 유아</span>
                          <TextField.Root
                            size='1'
                            type='number'
                            min='0'
                            color='blue'
                            variant='soft'
                            readOnly
                            {...register(`flights.${i}.kids_cost`, {
                              valueAsNumber: true
                            })}
                          />
                        </Flex>
                      </Grid>
                    </Table.Cell>
                    <Table.Cell>
                      <Grid gap='2'>
                        <Flex direction='column'>
                          <span className='invisible'>🧑 성인</span>
                          <TextField.Root
                            size='1'
                            type='number'
                            min='0'
                            color='orange'
                            variant='soft'
                            {...register(`flights.${i}.adult_price`, {
                              valueAsNumber: true
                            })}
                          />
                        </Flex>
                        <Flex direction='column'>
                          <span className='invisible'>🧒 소아</span>
                          <TextField.Root
                            size='1'
                            type='number'
                            min='0'
                            color='orange'
                            variant='soft'
                            {...register(`flights.${i}.children_price`, {
                              valueAsNumber: true
                            })}
                          />
                        </Flex>
                        <Flex direction='column'>
                          <span className='invisible'>👶 유아</span>
                          <TextField.Root
                            size='1'
                            type='number'
                            min='0'
                            color='orange'
                            variant='soft'
                            readOnly
                            {...register(`flights.${i}.kids_price`, {
                              valueAsNumber: true
                            })}
                          />
                        </Flex>
                      </Grid>
                    </Table.Cell>
                    <Table.Cell>
                      <Grid gap='2'>
                        <Flex direction='column'>
                          <span className='invisible'>🧑 성인</span>
                          <TextField.Root
                            size='1'
                            type='number'
                            min='0'
                            {...register(`flights.${i}.adult_count`, {
                              valueAsNumber: true
                            })}
                          />
                        </Flex>
                        <Flex direction='column'>
                          <span className='invisible'>🧒 소아</span>
                          <TextField.Root
                            size='1'
                            type='number'
                            min='0'
                            {...register(`flights.${i}.children_count`, {
                              valueAsNumber: true
                            })}
                          />
                        </Flex>
                        <Flex direction='column'>
                          <span className='invisible'>👶 유아</span>
                          <TextField.Root
                            size='1'
                            type='number'
                            min='0'
                            {...register(`flights.${i}.kids_count`, {
                              valueAsNumber: true
                            })}
                          />
                        </Flex>
                      </Grid>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap='1' align='end'>
                        <Text color='blue' size='3'>
                          {toReadableAmount(getValues(`flights.${i}.total_cost`), 'ko-KR', 'KRW')}
                        </Text>
                        <span>/</span>
                        <Text weight='bold' size='3'>
                          {toReadableAmount(getValues(`flights.${i}.total_amount`), 'ko-KR', 'KRW')}
                        </Text>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      <Controller
                        name={`flights.${i}.status`}
                        control={control}
                        render={({ field }) => (
                          <Select.Root
                            size='1'
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
                      <TextArea
                        size='3'
                        resize='vertical'
                        {...register(`flights.${i}.notes`, {
                          setValueAs: value => (typeof value === 'string' ? value.trim() : value)
                        })}
                      />
                    </Table.Cell>
                    <Table.Cell hidden>
                      <FlightTotalCalculator index={i} setValue={setValue} control={control} />
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell colSpan={11}>
                      <Flex align='center' gap='2'>
                        <Text weight='bold'>비고</Text>
                        <Box flexGrow='1'>
                          <TextField.Root
                            size='1'
                            {...register(`flights.${i}.remarks`, {
                              setValueAs: value =>
                                typeof value === 'string' ? value.trim() : value
                            })}
                          />
                        </Box>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell colSpan={11}>
                      <Flex align='center' gap='2'>
                        <Text weight='bold'>규정</Text>
                        <Box flexGrow='1'>
                          <TextField.Root
                            size='1'
                            {...register(`flights.${i}.rule`, {
                              setValueAs: value =>
                                typeof value === 'string' ? value.trim() : value
                            })}
                          />
                        </Box>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              ))}
            </Table.Root>
          )}

          {!flights.length && <NoData />}

          <Flex justify='end' mt='4' gap='1'>
            <Button type='button' color='ruby' onClick={addItem}>
              <Plane size='20' />
              항공 추가
            </Button>
            <Button
              type='button'
              color='ruby'
              variant='soft'
              onClick={() => removeItem('flights')}
              disabled={isRemoveDisabled}
            >
              <Minus size='20' /> 삭제
            </Button>
            <Button disabled={mutation.isPending || !flights.length} variant='outline'>
              <Save /> 변경사항 저장
            </Button>
          </Flex>

          {isDev() && <pre>{JSON.stringify(watch('flights'), null, 2)}</pre>}
        </Section>
      </Card>
    </form>
  );
}

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
