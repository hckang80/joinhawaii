import { defaultClientValues, GENDER_TYPE, PRODUCT_STATUS_COLOR, ProductStatus } from '@/constants';
import type {
  ProductFormType,
  ReservationFormData,
  ReservationResponse,
  ReservationSuccessResponse
} from '@/types';
import { isDev } from '@/utils';
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
  TextField
} from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
import { Save, UserMinus, UserPlus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';

const status$ = observable({
  reservationIndex: 0
});

export default function ClientForm({
  data,
  mutation
}: {
  data: ReservationResponse;
  mutation: ReturnType<
    typeof useMutation<{ data: ReservationSuccessResponse }, Error, ReservationFormData, unknown>
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
    defaultValues: useMemo(() => {
      return {
        reservation_id,
        clients: data.clients
      };
    }, [reservation_id, data.clients])
  });

  const clients = useWatch({ control, name: 'clients' }) ?? [defaultClientValues];
  const reservationIndex = use$(status$.reservationIndex);
  const mainClientName = clients[reservationIndex]?.korean_name ?? '';

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');

    const normalized: ReservationFormData = {
      ...formData,
      main_client_name: mainClientName
    };

    mutation.mutate(normalized, {
      onSuccess: () => {
        reset(normalized);
      }
    });
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card size='3'>
        <Flex direction='column' gap='6'>
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
                  <Table.ColumnHeaderCell width='110px'>진행상태</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width='200px'>비고</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {clients.map((client, i) => (
                  <Table.Row key={i}>
                    <Table.Cell align='center'>
                      <label>
                        <Radio
                          size='3'
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
                            ref={field.ref}
                            value={field.value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              field.onChange(e.target.value);
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
                            ref={field.ref}
                            value={field.value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              field.onChange(e.target.value);
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
                            ref={field.ref}
                            value={field.value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              field.onChange(e.target.value);
                            }}
                          />
                        )}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <TextField.Root
                        {...register(`clients.${i}.email`)}
                        placeholder='joinhawaii@gmail.com'
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Controller
                        name={`clients.${i}.status`}
                        control={control}
                        render={({ field }) => (
                          <Select.Root
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
                      <TextField.Root {...register(`clients.${i}.notes`)} />
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
        <Button disabled={mutation.isPending || !clients.length} variant='outline'>
          <Save /> 변경사항 저장
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
