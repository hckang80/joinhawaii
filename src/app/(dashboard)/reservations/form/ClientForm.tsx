import {
  BOOKING_PLATFORM_OPTIONS,
  defaultClientValues,
  GENDER_TYPE,
  PRODUCT_STATUS_COLOR,
  ProductStatus,
  TRAVEL_CATEGORIES,
  TRIP_TYPES
} from '@/constants';
import type { ProductFormType, ReservationFormData, ReservationResponse } from '@/types';
import { isDev, toReadableDate } from '@/utils';
import { observable } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import {
  Button,
  Card,
  Flex,
  Heading,
  Radio,
  Section,
  Select,
  Table,
  Text,
  TextField
} from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
import { PlusCircle, Save, UserMinus, UserPlus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import React, { useMemo } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { GroupSelect } from '../../../../components';

const status$ = observable({
  reservationIndex: 0
});

export default function ClientForm({
  data,
  mutation
}: {
  data?: ReservationResponse;
  mutation: ReturnType<
    typeof useMutation<{ data: ReservationResponse }, Error, ReservationFormData, unknown>
  >;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservation_id = searchParams.get('reservation_id')!;
  const isModify = !!reservation_id;

  const {
    created_at,
    total_cost_krw,
    total_amount_krw,
    total_amount,
    deposit,
    id,
    products,
    ...updateData
  } = data || {};

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
    defaultValues: useMemo(() => {
      return {
        ...updateData,
        clients: data?.clients || [defaultClientValues]
      };
    }, [data, updateData])
  });

  const clients = useWatch({ control, name: 'clients' }) ?? [defaultClientValues];
  const reservationIndex = use$(status$.reservationIndex);
  const mainClientName = clients[reservationIndex]?.korean_name ?? '';

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');
    mutation.mutate(
      {
        ...formData,
        main_client_name: mainClientName
      },
      {
        onSuccess: ({ data }) => {
          reset(formData);
          if (data.reservation_id) redirectModifyForm(data.reservation_id);
        }
      }
    );
  };

  const addClient = () => {
    setValue('clients', [...clients, defaultClientValues]);
  };

  const removeItem = (target: ProductFormType) => {
    const items = getValues(target);
    setValue(target, items.slice(0, -1));
  };

  const handleChangeReservation = (event: React.ChangeEvent<HTMLInputElement>) => {
    const idx = +event.target.value;
    status$.reservationIndex.set(() => idx);
    setValue('main_client_name', clients[idx]?.korean_name ?? '', {
      shouldDirty: true,
      shouldTouch: true
    });
  };

  const isRemoveClientDisabled = clients.length <= (data?.clients.length || 1);

  const redirectModifyForm = async (reservationId: string) => {
    if (isModify) return;
    router.replace(`/reservations/form?reservation_id=${encodeURIComponent(reservationId)}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card size='3'>
        <Flex direction='column' gap='6'>
          <Section p='0'>
            <Heading as='h3' mb='4'>
              기본정보
            </Heading>

            <Table.Root layout='fixed'>
              <colgroup>
                <col style={{ width: '100px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '140px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '180px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '340px' }} />
              </colgroup>
              <Table.Body>
                <Table.Row>
                  <Table.RowHeaderCell>
                    <Text weight='bold'>발행일</Text>
                  </Table.RowHeaderCell>
                  <Table.Cell>
                    {data?.created_at ? toReadableDate(data?.created_at) : '-'}
                  </Table.Cell>
                  <Table.RowHeaderCell>
                    <Text weight='bold'>담당자</Text>
                  </Table.RowHeaderCell>
                  <Table.Cell>{data?.author || '-'}</Table.Cell>
                  <Table.RowHeaderCell>
                    <Text weight='bold'>카카오톡</Text>
                  </Table.RowHeaderCell>
                  <Table.Cell>-</Table.Cell>
                  <Table.RowHeaderCell>
                    <Text weight='bold'>업체구분</Text>
                  </Table.RowHeaderCell>
                  <Table.Cell>
                    <Controller
                      name='booking_platform'
                      control={control}
                      render={({ field }) => {
                        return <GroupSelect field={field} list={BOOKING_PLATFORM_OPTIONS} />;
                      }}
                    />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.RowHeaderCell>
                    <Text weight='bold'>여행종류</Text>
                  </Table.RowHeaderCell>
                  <Table.Cell>
                    <Controller
                      name='trip_type'
                      control={control}
                      render={({ field }) => (
                        <Select.Root
                          value={field.value || ''}
                          onValueChange={field.onChange}
                          name={field.name}
                        >
                          <Select.Trigger placeholder='선택' />
                          <Select.Content>
                            {TRIP_TYPES.map(type => (
                              <Select.Item key={type} value={type}>
                                {type}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      )}
                    />
                  </Table.Cell>
                  <Table.RowHeaderCell>
                    <Text weight='bold'>구분</Text>
                  </Table.RowHeaderCell>
                  <Table.Cell>
                    <Controller
                      name='travel_category'
                      control={control}
                      render={({ field }) => (
                        <Select.Root
                          value={field.value || ''}
                          onValueChange={field.onChange}
                          name={field.name}
                        >
                          <Select.Trigger placeholder='선택' />
                          <Select.Content>
                            {TRAVEL_CATEGORIES.map(category => (
                              <Select.Item key={category} value={category}>
                                {category}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      )}
                    />
                  </Table.Cell>
                  <Table.RowHeaderCell>
                    <Text weight='bold'>예약구분</Text>
                  </Table.RowHeaderCell>
                  <Table.Cell>{reservation_id || '-'}</Table.Cell>
                  <Table.RowHeaderCell>
                    <Text weight='bold'>여행일정</Text>
                  </Table.RowHeaderCell>
                  <Table.Cell>
                    <Flex gap='2' align='center' wrap='wrap'>
                      <TextField.Root type='date' {...register('start_date')} />
                      <Text size='1'>~</Text>
                      <Controller
                        name='end_date'
                        control={control}
                        render={({ field }) => {
                          const checkInDate = watch('start_date');
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
                      <Flex display='inline-flex' gap='2' align='center'>
                        <TextField.Root
                          style={{ width: '40px' }}
                          type='number'
                          min={0}
                          {...register('nights', { valueAsNumber: true })}
                        />
                        <Text>박</Text>
                        <TextField.Root
                          style={{ width: '40px' }}
                          type='number'
                          min={0}
                          {...register('days', { valueAsNumber: true })}
                        />
                        <Text>일</Text>
                      </Flex>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Root>
          </Section>

          <Section p='0'>
            <Heading as='h3' mb='4'>
              고객정보
            </Heading>

            <Table.Root size='1' layout='fixed'>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell width='60px' align='center'>
                    예약자
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='80px'>이름</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='160px'>영문</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='80px'>성별</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='150px'>주민번호</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='140px'>연락처</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='180px'>이메일</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='90px'>진행상태</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='200px'>메모</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {clients.map((client, i) => (
                  <Table.Row key={i}>
                    <Table.Cell align='center'>
                      <label>
                        <Radio
                          name='reservation'
                          value={'' + i}
                          defaultChecked={
                            data?.main_client_name
                              ? data?.main_client_name === client.korean_name
                              : i === reservationIndex
                          }
                          onChange={handleChangeReservation}
                        />
                      </label>
                    </Table.Cell>
                    <Table.Cell>
                      <Controller
                        name={`clients.${i}.korean_name`}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField.Root
                            size='1'
                            ref={field.ref}
                            value={field.value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              field.onChange(e.target.value.trim());
                              if (i === reservationIndex) {
                                setValue('main_client_name', e.target.value);
                              }
                            }}
                            placeholder='홍길동'
                          />
                        )}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Controller
                        name={`clients.${i}.english_name`}
                        control={control}
                        render={({ field }) => (
                          <TextField.Root
                            size='1'
                            ref={field.ref}
                            value={field.value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const newValue = e.target.value.toUpperCase().trim();
                              field.onChange(newValue);
                            }}
                            placeholder='HONG GILDONG'
                          />
                        )}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Controller
                        name={`clients.${i}.gender`}
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
                            <Select.Trigger placeholder='성별 선택'>{field.value}</Select.Trigger>
                            <Select.Content>
                              {GENDER_TYPE.map(value => (
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
                      <Controller
                        name={`clients.${i}.resident_id`}
                        control={control}
                        render={({ field }) => (
                          <TextField.Root
                            size='1'
                            ref={field.ref}
                            value={field.value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              field.onChange(e.target.value.trim());
                            }}
                          />
                        )}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Controller
                        name={`clients.${i}.phone_number`}
                        control={control}
                        render={({ field }) => (
                          <TextField.Root
                            size='1'
                            ref={field.ref}
                            value={field.value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              field.onChange(e.target.value.trim());
                            }}
                          />
                        )}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <TextField.Root
                        size='1'
                        {...register(`clients.${i}.email`, {
                          setValueAs: value => (typeof value === 'string' ? value.trim() : value)
                        })}
                        placeholder='joinhawaii@gmail.com'
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Controller
                        name={`clients.${i}.status`}
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
                              {Object.entries(ProductStatus)
                                .filter(([key]) => ['InProgress', 'Cancelled'].includes(key))
                                .map(([key, label]) => (
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
                      <TextField.Root
                        size='1'
                        {...register(`clients.${i}.notes`, {
                          setValueAs: value => (typeof value === 'string' ? value.trim() : value)
                        })}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>

            <Flex justify='end' mt='4' gap='1'>
              <Button
                title='인원 삭제'
                type='button'
                color='ruby'
                variant='soft'
                onClick={() => removeItem('clients')}
                disabled={isRemoveClientDisabled}
              >
                <UserMinus />
              </Button>
              <Button title='인원 추가' type='button' color='ruby' onClick={addClient}>
                <UserPlus />
              </Button>
            </Flex>
          </Section>
        </Flex>
      </Card>

      <Flex justify='end' mt='4' gap='1'>
        {isModify && (
          <Button
            type='button'
            size='3'
            onClick={() => {
              window.open(
                `/progress?reservation_id=${encodeURIComponent(reservation_id)}`,
                '_blank',
                'width=800,height=600,resizable=yes,scrollbars=yes'
              );
            }}
          >
            진행사항
          </Button>
        )}
        <Button disabled={mutation.isPending} variant='outline' size='3'>
          {isModify ? (
            <>
              <Save /> 변경사항 저장
            </>
          ) : (
            <>
              <PlusCircle /> 신규예약 생성
            </>
          )}
        </Button>
      </Flex>

      {isDev() && (
        <div>
          합계(달러) : {data?.total_amount}
          <br />
          예약자: {watch('main_client_name')}
        </div>
      )}
      {isDev() && <pre>{JSON.stringify(watch('clients'), null, 2)}</pre>}
    </form>
  );
}
