import { defaultClientValues, GENDER_TYPE } from '@/constants';
import type {
  ProductFormType,
  ReservationFormData,
  ReservationResponse,
  ReservationSuccessResponse
} from '@/types';
import { formatPhoneNumber, formatResidentId, isDev } from '@/utils';
import { observable } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import {
  Button,
  Card,
  Flex,
  Grid,
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
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';

const status$ = observable({
  reservationIndex: 0
});

export default function ClientForm({
  data,
  mutation
}: {
  data?: ReservationResponse;
  mutation: ReturnType<
    typeof useMutation<{ data: ReservationSuccessResponse }, Error, ReservationFormData, unknown>
  >;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservation_id = searchParams.get('reservation_id')!;
  const isModify = !!reservation_id;

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
        reservation_id: data?.reservation_id,
        booking_platform: data?.booking_platform || '',
        main_client_name: data?.main_client_name || '',
        clients: data?.clients || [defaultClientValues]
      };
    }, [data])
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
          redirectModifyForm(data.reservation_id);
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

            <Grid align='center' columns='60px 1fr 70px 1fr' gap='3'>
              <Text weight='medium'>예약회사</Text>
              <Controller
                name='booking_platform'
                control={control}
                render={({ field }) => (
                  <Select.Root
                    size='3'
                    value={field.value}
                    onValueChange={value => {
                      field.onChange(value);
                    }}
                    name={field.name}
                  >
                    <Select.Trigger placeholder='예약회사 선택' style={{ width: '200px' }}>
                      {field.value}
                    </Select.Trigger>

                    <Select.Content>
                      <Select.Group>
                        <Select.Label>B2C</Select.Label>
                        <Select.Item value='홈피예약'>홈피예약</Select.Item>
                      </Select.Group>
                      <Select.Separator />
                      <Select.Group>
                        <Select.Label>B2B</Select.Label>
                        <Select.Item value='마이리얼트립'>마이리얼트립</Select.Item>
                        <Select.Item value='크리에이트립'>크리에이트립</Select.Item>
                        <Select.Item value='와그'>와그</Select.Item>
                      </Select.Group>
                      <Select.Separator />
                      <Select.Group>
                        <Select.Label>플랫폼</Select.Label>
                        <Select.Item value='네이버'>네이버</Select.Item>
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                )}
              />
            </Grid>
          </Section>

          <Section p='0'>
            <Heading as='h3' mb='4'>
              고객정보
            </Heading>

            <Table.Root size='1'>
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
                      <TextField.Root
                        {...register(`clients.${i}.english_name`, { required: true })}
                        placeholder='HONG GILDONG'
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
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField.Root
                            ref={field.ref}
                            value={field.value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const formatted = formatResidentId(e.target.value);
                              field.onChange(formatted);
                            }}
                            placeholder='000000-0000000'
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
                              const formatted = formatPhoneNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                            placeholder='010-0000-0000'
                          />
                        )}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <TextField.Root
                        {...register(`clients.${i}.email`, { required: true })}
                        placeholder='joinhawaii@gmail.com'
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
