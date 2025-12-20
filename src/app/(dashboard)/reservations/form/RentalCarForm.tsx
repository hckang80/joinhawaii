import {
  CAR_TYPES,
  defaultCarValues,
  PICKUP_LOCATIONS,
  PRODUCT_STATUS_COLOR,
  ProductStatus,
  REGIONS
} from '@/constants';
import type {
  AdditionalOptions,
  ProductFormType,
  ProductType,
  ReservationFormData,
  ReservationResponse
} from '@/types';
import { isDev, normalizeNumber } from '@/utils';
import { Button, Card, Flex, Heading, Section, Select, Table, TextField } from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
import { Car, Minus, Plus, Save } from 'lucide-react';
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

const CUSTOM_LABEL = '직접입력';

export default function RentalCarForm({
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
        rental_cars: data.products.rental_cars
      }),
      [reservation_id, data.products.rental_cars]
    )
  });

  const rentalCars = useWatch({ control, name: 'rental_cars' }) ?? [defaultCarValues];

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');

    const normalized: ReservationFormData = {
      ...formData,
      rental_cars: formData.rental_cars.map((car, idx) => ({
        ...car,
        pickup_location:
          car.pickup_location === CUSTOM_LABEL
            ? getCustomValues('pickup')[idx]
            : car.pickup_location,
        model: car.model === CUSTOM_LABEL ? getCustomValues('model')[idx] : car.model,
        exchange_rate: normalizeNumber(car.exchange_rate)
      }))
    };

    mutation.mutate(normalized, {
      onSuccess: () => reset(normalized)
    });
  };

  const addItem = () => {
    setValue('rental_cars', [...rentalCars, defaultCarValues]);
  };

  const removeItem = (target: ProductFormType) => {
    const items = getValues(target);
    setValue(target, items.slice(0, -1));
  };

  const isRemoveDisabled = rentalCars.length <= data.products.rental_cars.length;

  const { register: registerCustom, getValues: getCustomValues } = useForm<{
    pickup: Record<string, string>;
    model: Record<string, string>;
  }>({
    defaultValues: { pickup: {}, model: {} }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card asChild size='3'>
        <Section id='rental_car'>
          <Heading as='h3' mb='4'>
            렌터카
          </Heading>

          <Table.Root size='1'>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell width='90px'>환율</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='120px'>지역</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='280px'>픽업</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='280px'>리턴</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='210px'>차종</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='160px'>운전자</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='160px'>조건</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='80px'>💰1일요금</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='70px'>대여일</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='110px'>진행상태</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='70px'>추가옵션</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='200px'>비고</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rentalCars.map((_car, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Controller
                      name={`rental_cars.${i}.exchange_rate`}
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
                    <Flex gap='1' wrap='wrap'>
                      <TextField.Root
                        type='date'
                        {...register(`rental_cars.${i}.pickup_date`, {
                          required: true
                        })}
                      />
                      <TextField.Root
                        type='time'
                        {...register(`rental_cars.${i}.pickup_time`, { required: true })}
                      />
                      <Controller
                        name={`rental_cars.${i}.pickup_location`}
                        control={control}
                        render={({ field }) => {
                          const isCustom = field.value === CUSTOM_LABEL;
                          return (
                            <>
                              <Select.Root
                                {...field}
                                onValueChange={value => {
                                  field.onChange(value);
                                }}
                                name={field.name}
                              >
                                <Select.Trigger placeholder='픽업장소 선택'>
                                  {field.value}
                                </Select.Trigger>
                                <Select.Content>
                                  {PICKUP_LOCATIONS.toSorted((a, b) => a.localeCompare(b)).map(
                                    location => (
                                      <Select.Item key={location} value={location}>
                                        {location}
                                      </Select.Item>
                                    )
                                  )}
                                  <Select.Item value={CUSTOM_LABEL}>{CUSTOM_LABEL}</Select.Item>
                                </Select.Content>
                              </Select.Root>
                              {isCustom && <TextField.Root {...registerCustom(`pickup.${i}`)} />}
                            </>
                          );
                        }}
                      />
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Controller
                      name={`rental_cars.${i}.return_date`}
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => {
                        const checkInDate = watch(`rental_cars.${i}.pickup_date`);
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
                    <Controller
                      name={`rental_cars.${i}.model`}
                      control={control}
                      render={({ field }) => {
                        const isCustom = field.value === CUSTOM_LABEL;
                        return (
                          <Flex gap='1' wrap='wrap'>
                            <Select.Root
                              {...field}
                              onValueChange={value => {
                                field.onChange(value);
                              }}
                              name={field.name}
                            >
                              <Select.Trigger placeholder='차종 선택'>{field.value}</Select.Trigger>
                              <Select.Content>
                                {CAR_TYPES.toSorted((a, b) => a.localeCompare(b)).map(car => (
                                  <Select.Item key={car} value={car}>
                                    {car}
                                  </Select.Item>
                                ))}
                                <Select.Item value={CUSTOM_LABEL}>{CUSTOM_LABEL}</Select.Item>
                              </Select.Content>
                            </Select.Root>
                            {isCustom && <TextField.Root {...registerCustom(`model.${i}`)} />}
                          </Flex>
                        );
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextField.Root
                      {...register(`rental_cars.${i}.driver`, {
                        required: true
                      })}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextField.Root
                      {...register(`rental_cars.${i}.options`, {
                        required: true
                      })}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextField.Root
                      type='number'
                      min='0'
                      step='0.01'
                      {...register(`rental_cars.${i}.cost`, {
                        required: true,
                        valueAsNumber: true
                      })}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextField.Root
                      type='number'
                      min='0'
                      step='0.01'
                      {...register(`rental_cars.${i}.daily_rate`, {
                        required: true,
                        valueAsNumber: true
                      })}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextField.Root
                      type='number'
                      min='1'
                      {...register(`rental_cars.${i}.rental_days`, {
                        required: true,
                        valueAsNumber: true
                      })}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Controller
                      name={`rental_cars.${i}.status`}
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
                      disabled={!getValues(`rental_cars.${i}.id`)}
                      title='추가옵션'
                      type='button'
                      onClick={() =>
                        handleAdditionalOptions({
                          id: Number(getValues(`rental_cars.${i}.id`)),
                          type: 'rental_car',
                          title: getValues(`rental_cars.${i}.model`),
                          data: getValues(`rental_cars.${i}.additional_options`)
                        })
                      }
                    >
                      <Plus size={16} />
                    </Button>
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

          {!rentalCars.length && (
            <Flex justify='center' py='5'>
              예약 내역이 없습니다
            </Flex>
          )}

          <Flex justify='end' mt='4' gap='1'>
            <Button type='button' color='ruby' onClick={addItem}>
              <Car size='20' />
              렌터카 추가
            </Button>
            <Button
              type='button'
              color='ruby'
              variant='soft'
              onClick={() => removeItem('rental_cars')}
              disabled={isRemoveDisabled}
            >
              <Minus size='20' /> 삭제
            </Button>
            <Button disabled={mutation.isPending || !rentalCars.length} variant='outline'>
              <Save /> 변경사항 저장
            </Button>
          </Flex>

          {isDev() && <pre>{JSON.stringify(watch('rental_cars'), null, 2)}</pre>}
        </Section>
      </Card>
    </form>
  );
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
