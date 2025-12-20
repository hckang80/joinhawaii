import { defaultInsuranceValues, PRODUCT_STATUS_COLOR, ProductStatus } from '@/constants';
import type {
  AdditionalOptions,
  ProductFormType,
  ProductType,
  ReservationFormData,
  ReservationResponse
} from '@/types';
import { calculateTotalAmount, isDev, normalizeNumber } from '@/utils';
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
import { BookText, Minus, Plus, Save } from 'lucide-react';
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

export default function InsuranceForm({
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
        insurances: data.products.insurances
      }),
      [reservation_id, data.products.insurances]
    )
  });

  const insurances = useWatch({ control, name: 'insurances' }) ?? [defaultInsuranceValues];

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');

    const normalized: ReservationFormData = {
      ...formData,
      insurances: formData.insurances.map(insurance => ({
        ...insurance,
        exchange_rate: normalizeNumber(insurance.exchange_rate)
      }))
    };

    mutation.mutate(normalized, {
      onSuccess: () => reset(normalized)
    });
  };

  const addItem = () => {
    setValue('insurances', [...insurances, defaultInsuranceValues]);
  };

  const removeItem = (target: ProductFormType) => {
    const items = getValues(target);
    setValue(target, items.slice(0, -1));
  };

  const isRemoveDisabled = insurances.length <= data.products.insurances.length;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card asChild size='3'>
        <Section id='insurance'>
          <Heading as='h3' mb='4'>
            보험사
          </Heading>

          <Table.Root size='1'>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell width='90px'>환율</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='120px'>보험사</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='170px'>날짜</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='70px'>여행일수</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='80px'>💰요금</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='70px'>수량</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='110px'>진행상태</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='70px'>추가옵션</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='200px'>비고</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            {insurances.map((_insurance, i) => (
              <Table.Body key={i}>
                <Table.Row>
                  <Table.Cell>
                    <Controller
                      name={`insurances.${i}.exchange_rate`}
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
                    <Controller
                      name={`insurances.${i}.end_date`}
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => {
                        const checkInDate = watch(`insurances.${i}.start_date`);
                        return (
                          <TextField.Root
                            type='date'
                            min={checkInDate || undefined}
                            value={field.value || ''}
                            onChange={field.onChange}
                            onFocus={() => {
                              if (!field.value && checkInDate) {
                                field.onChange(checkInDate);
                              }
                            }}
                          />
                        );
                      }}
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
                          step='0.01'
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
                          step='0.01'
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
                          step='0.01'
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
                        <span className='invisible'>🧑성인</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          step='0.01'
                          {...register(`insurances.${i}.adult_price`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Flex>
                      <Flex direction='column'>
                        <span className='invisible'>🧒소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          step='0.01'
                          {...register(`insurances.${i}.children_price`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Flex>
                      <Flex direction='column'>
                        <span className='invisible'>👶유아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          step='0.01'
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
                        <span className='invisible'>🧑성인</span>
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
                        <span className='invisible'>🧒소아</span>
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
                        <span className='invisible'>👶유아</span>
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
                      disabled={!getValues(`insurances.${i}.id`)}
                      title='추가옵션'
                      type='button'
                      onClick={() =>
                        handleAdditionalOptions({
                          id: Number(getValues(`insurances.${i}.id`)),
                          type: 'insurance',
                          title: getValues(`insurances.${i}.company`),
                          data: getValues(`insurances.${i}.additional_options`)
                        })
                      }
                    >
                      <Plus size={16} />
                    </Button>
                  </Table.Cell>
                  <Table.Cell>
                    <TextArea {...register(`insurances.${i}.notes`)} />
                  </Table.Cell>
                  <Table.Cell hidden>
                    <InsuranceTotalCalculator index={i} setValue={setValue} control={control} />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell colSpan={10}>
                    <Flex align='center' gap='2'>
                      <Text weight='bold'>규정</Text>
                      <Box flexGrow='1'>
                        <TextField.Root {...register(`insurances.${i}.rule`)} />
                      </Box>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table.Root>

          {!insurances.length && (
            <Flex justify='center' py='5'>
              예약 내역이 없습니다
            </Flex>
          )}

          <Flex justify='end' mt='4' gap='1'>
            <Button type='button' color='ruby' onClick={addItem}>
              <BookText size='20' />
              보험 추가
            </Button>
            <Button
              type='button'
              color='ruby'
              variant='soft'
              onClick={() => removeItem('insurances')}
              disabled={isRemoveDisabled}
            >
              <Minus size='20' /> 삭제
            </Button>
            <Button disabled={mutation.isPending || !insurances.length} variant='outline'>
              <Save /> 변경사항 저장
            </Button>
          </Flex>

          {isDev() && <pre>{JSON.stringify(watch('insurances'), null, 2)}</pre>}
        </Section>
      </Card>
    </form>
  );
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
      days,
      adult_count,
      children_count,
      adult_price,
      children_price,
      adult_cost,
      children_cost
    ] = watchedValues;
    const { total_amount, total_cost } = calculateTotalAmount({
      days,
      adult_count,
      children_count,
      adult_price,
      children_price,
      adult_cost,
      children_cost
    });
    setValue(`insurances.${index}.total_amount`, total_amount, { shouldValidate: true });
    setValue(`insurances.${index}.total_cost`, total_cost, { shouldValidate: true });
  }, [watchedValues, setValue, index]);

  return null;
}
