import { defaultHotelValues, PRODUCT_STATUS_COLOR, ProductStatus, REGIONS } from '@/constants';
import type {
  AdditionalOptions,
  ProductFormType,
  ProductType,
  ReservationFormData,
  ReservationResponse
} from '@/types';
import { isDev } from '@/utils';
import {
  Button,
  Card,
  Checkbox,
  Flex,
  Heading,
  Section,
  Select,
  Table,
  TextField
} from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
import { Hotel, Minus, Plus, Save } from 'lucide-react';
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

export default function HotelForm({
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
        hotels: data.products.hotels
      }),
      [reservation_id, data.products.hotels]
    )
  });

  const hotels = useWatch({ control, name: 'hotels' }) ?? [defaultHotelValues];

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');
    mutation.mutate(formData, {
      onSuccess: () => reset(formData)
    });
  };

  const addItem = () => {
    setValue('hotels', [...hotels, defaultHotelValues]);
  };

  const removeItem = (target: ProductFormType) => {
    const items = getValues(target);
    setValue(target, items.slice(0, -1));
  };

  const isRemoveDisabled = hotels.length <= (data.products.hotels.length || 1);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card asChild size='3'>
        <Section id='hotel'>
          <Heading as='h3' mb='4'>
            호텔
          </Heading>

          <Table.Root size='1'>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell width='90px'>환율</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='120px'>지역</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='170px'>날짜</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='60px'>숙박일</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='240px'>호텔</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='120px'>객실타입</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='60px'>조식</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='70px'>리조트피</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='80px'>💰1박요금</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='70px'>수량</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='90px'>CF#/VC#</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='110px'>진행상태</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='70px'>추가옵션</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>비고</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {hotels.map((_hotel, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Controller
                      name={`hotels.${i}.exchange_rate`}
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
                      name={`hotels.${i}.region`}
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
                      type='date'
                      {...register(`hotels.${i}.check_in_date`, {
                        required: true
                      })}
                    />
                    ~
                    <TextField.Root
                      type='date'
                      {...register(`hotels.${i}.check_out_date`, {
                        required: true
                      })}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextField.Root
                      type='number'
                      min='1'
                      {...register(`hotels.${i}.nights`, {
                        required: true,
                        valueAsNumber: true
                      })}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    {/* TODO: 드랍다운으로 변경 필요 */}
                    <TextField.Root
                      {...register(`hotels.${i}.hotel_name`, {
                        required: true
                      })}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextField.Root
                      {...register(`hotels.${i}.room_type`, {
                        required: true
                      })}
                    />
                    {/* TODO: 1BED, 2BED, 1BED/2BED, 2BED/3BED, 3BED, 4BED */}
                  </Table.Cell>
                  <Table.Cell>
                    <Controller
                      name={`hotels.${i}.is_breakfast_included`}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          size='3'
                          checked={field.value}
                          onCheckedChange={value => {
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Controller
                      name={`hotels.${i}.is_resort_fee`}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          size='3'
                          checked={field.value}
                          onCheckedChange={value => {
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextField.Root
                      type='number'
                      min='0'
                      {...register(`hotels.${i}.cost`, {
                        required: true,
                        valueAsNumber: true
                      })}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextField.Root
                      type='number'
                      min='0'
                      {...register(`hotels.${i}.nightly_rate`, {
                        required: true,
                        valueAsNumber: true
                      })}
                    />
                  </Table.Cell>
                  <Table.Cell>???</Table.Cell>
                  <Table.Cell>바우처 조회</Table.Cell>
                  <Table.Cell>
                    <Controller
                      name={`hotels.${i}.status`}
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
                      disabled={!getValues(`hotels.${i}.id`)}
                      title='추가옵션'
                      type='button'
                      onClick={() =>
                        handleAdditionalOptions({
                          id: Number(getValues(`hotels.${i}.id`)),
                          type: 'hotel',
                          title: getValues(`hotels.${i}.hotel_name`),
                          data: getValues(`hotels.${i}.additional_options`)
                        })
                      }
                    >
                      <Plus size={16} />
                    </Button>
                  </Table.Cell>
                  <Table.Cell>
                    <TextField.Root {...register(`hotels.${i}.notes`)} />
                  </Table.Cell>
                  <Table.Cell hidden>
                    <HotelTotalCalculator index={i} setValue={setValue} control={control} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {!hotels.length && (
            <Flex justify='center' py='5'>
              예약 내역이 없습니다
            </Flex>
          )}

          <Flex justify='end' mt='4' gap='1'>
            <Button type='button' color='ruby' onClick={addItem}>
              <Hotel size='20' />
              호텔 추가
            </Button>
            <Button
              type='button'
              color='ruby'
              variant='soft'
              onClick={() => removeItem('hotels')}
              disabled={isRemoveDisabled}
            >
              <Minus size='20' /> 삭제
            </Button>
            <Button disabled={mutation.isPending || !hotels.length} variant='outline'>
              <Save /> 변경사항 저장
            </Button>
          </Flex>

          {isDev() && <pre>{JSON.stringify(watch('hotels'), null, 2)}</pre>}
        </Section>
      </Card>
    </form>
  );
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
    name: [`hotels.${index}.nightly_rate`, `hotels.${index}.nights`, `hotels.${index}.cost`]
  });

  useEffect(() => {
    const [nightly, nights, cost] = watchedValues;
    const total = nightly * nights;
    const totalCost = cost * nights;
    setValue(`hotels.${index}.total_amount`, total, { shouldValidate: true });
    setValue(`hotels.${index}.total_cost`, totalCost, { shouldValidate: true });
  }, [watchedValues, setValue, index]);

  return null;
}
