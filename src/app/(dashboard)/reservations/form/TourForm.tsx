import { defaultTourValues, PRODUCT_STATUS_COLOR, ProductStatus, REGIONS } from '@/constants';
import type {
  AdditionalOptions,
  ProductFormType,
  ProductType,
  ReservationFormData,
  ReservationResponse
} from '@/types';
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
import { Binoculars, Minus, Plus, Save } from 'lucide-react';
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

export default function TourForm({
  data,
  mutation,
  handleAdditionalOptions
}: {
  data: ReservationResponse;
  mutation: ReturnType<typeof useMutation<unknown, Error, ReservationFormData, unknown>>;
  handleAdditionalOptions: (context: {
    id: number;
    type: ProductType;
    title: string;
    data: AdditionalOptions[];
  }) => void;
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
        tours: data.products.tours
      }),
      [reservation_id, data.products.tours]
    )
  });

  const tours = useWatch({ control, name: 'tours' }) ?? [defaultTourValues];

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');
    mutation.mutate(formData, {
      onSuccess: () => reset(formData)
    });
  };

  const addItem = () => {
    setValue('tours', [...tours, defaultTourValues]);
  };

  const removeItem = (target: ProductFormType) => {
    const items = getValues(target);
    setValue(target, items.slice(0, -1));
  };

  const isRemoveDisabled = tours.length <= data.products.tours.length;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card asChild size='3'>
        <Section id='tour'>
          <Heading as='h3' mb='4'>
            선택관광
          </Heading>

          <Table.Root size='1'>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell width='90px'>환율</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='120px'>지역</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='240px'>날짜</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='240px'>상품명</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='80px'>💰요금</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='70px'>수량</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='110px'>진행상태</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='70px'>추가옵션</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>비고</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tours.map((_tour, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Controller
                      name={`tours.${i}.exchange_rate`}
                      control={control}
                      render={({ field }) => (
                        <TextField.Root
                          type='number'
                          min='0'
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
                    <Button
                      disabled={!getValues(`tours.${i}.id`)}
                      title='추가옵션'
                      type='button'
                      onClick={() =>
                        handleAdditionalOptions({
                          id: Number(getValues(`tours.${i}.id`)),
                          type: 'tour',
                          title: getValues(`tours.${i}.name`),
                          data: getValues(`tours.${i}.additional_options`)
                        })
                      }
                    >
                      <Plus size={16} />
                    </Button>
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

          {!tours.length && (
            <Flex justify='center' py='5'>
              예약 내역이 없습니다
            </Flex>
          )}

          <Flex justify='end' mt='4' gap='1'>
            <Button type='button' color='ruby' onClick={addItem}>
              <Binoculars size='20' />
              선택관광 추가
            </Button>
            <Button
              type='button'
              color='ruby'
              variant='soft'
              onClick={() => removeItem('tours')}
              disabled={isRemoveDisabled}
            >
              <Minus size='20' /> 삭제
            </Button>
            <Button disabled={mutation.isPending || !tours.length} variant='outline'>
              <Save /> 변경사항 저장
            </Button>
          </Flex>

          {isDev() && <pre>{isDev() && <pre>{JSON.stringify(watch('tours'), null, 2)}</pre>}</pre>}
        </Section>
      </Card>
    </form>
  );
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
