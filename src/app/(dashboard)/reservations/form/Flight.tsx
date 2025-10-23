import { defaultFlightValues, PRODUCT_STATUS_COLOR, ProductStatus } from '@/constants';
import type { ProductFormType, ReservationFormData, ReservationResponse } from '@/types';
import { calculateTotalAmount, isDev } from '@/utils';
import {
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Section,
  Select,
  Table,
  TextField
} from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
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
  mutation: ReturnType<typeof useMutation<unknown, Error, ReservationFormData, unknown>>;
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

  const flights = useWatch({ control, name: 'flights' }) ?? [defaultFlightValues];

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');
    mutation.mutate(formData, {
      onSuccess: () => reset(formData)
    });
  };

  const addItem = () => {
    setValue('flights', [...flights, defaultFlightValues]);
  };

  const removeItem = (target: ProductFormType) => {
    const items = getValues(target);
    setValue(target, items.slice(0, -1));
  };

  const isRemoveDisabled = flights.length <= (data.products.flights.length || 1);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
              {flights.map((_flight, i) => (
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
                    <TextField.Root {...register(`flights.${i}.notes`)} />
                  </Table.Cell>
                  <Table.Cell hidden>
                    <FlightTotalCalculator index={i} setValue={setValue} control={control} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {!flights.length && (
            <Flex justify='center' py='5'>
              예약 내역이 없습니다
            </Flex>
          )}

          <Flex justify='end' mt='4' gap='1'>
            <Button disabled={mutation.isPending} variant='outline'>
              <Save /> 변경사항 저장
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
            <Button type='button' color='ruby' onClick={addItem}>
              <Plane size='20' />
              항공 추가
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
