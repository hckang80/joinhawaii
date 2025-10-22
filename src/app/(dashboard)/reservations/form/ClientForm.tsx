import { defaultClientValues, GENDER_TYPE } from '@/constants';
import { createReservation, updateReservation } from '@/http';
import { reservationQueryOptions } from '@/lib/queries';
import type { ProductFormType, ReservationFormData, ReservationItem } from '@/types';
import { handleApiError, handleApiSuccess, isDev } from '@/utils';
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
import { useMutation, useQuery } from '@tanstack/react-query';
import { Save, UserMinus, UserPlus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import router from 'next/router';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const status$ = observable({
  reservationIndex: 0
});

export default function ClientForm() {
  const searchParams = useSearchParams();
  const reservation_id = searchParams.get('reservation_id')!;
  const isModify = !!reservation_id;

  const { data } = useQuery({
    ...reservationQueryOptions(reservation_id),
    enabled: !!reservation_id
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { isDirty, dirtyFields },
    getValues,
    setValue,
    control
  } = useForm<ReservationFormData>({
    defaultValues: {
      booking_platform: data?.booking_platform || '',
      main_client_name: data?.main_client_name || '',
      ...(isModify && {
        reservation_id: data?.reservation_id
      }),
      clients: data?.clients || [defaultClientValues]
    }
  });

  const reservationIndex = use$(status$.reservationIndex);
  const mainClientName = getValues('clients')[reservationIndex].korean_name;

  const mutation = useMutation({
    mutationFn: (formData: ReservationFormData) => {
      const payload = {
        ...formData,
        main_client_name: mainClientName
      };

      return isModify ? updateReservation(payload) : createReservation(payload);
    },
    onSuccess: (result: unknown) => {
      handleApiSuccess(result);

      const fromPath = searchParams.get('from');
      if (fromPath) router.push(fromPath);
    },
    onError: handleApiError
  });

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');
    mutation.mutate(formData);
  };

  const addClient = () => {
    setValue('clients', [...watch('clients'), defaultClientValues]);
  };

  const removeItem = (target: ProductFormType) => {
    const items = getValues(target);
    setValue(target, items.slice(0, -1));
  };

  const handleChangeReservation = (event: React.ChangeEvent<HTMLInputElement>) => {
    status$.reservationIndex.set(() => +event.target.value);
    setValue('main_client_name', getValues('clients')[+event.target.value].korean_name, {
      shouldDirty: true,
      shouldTouch: true
    });
  };

  const isRemoveClientDisabled = (target = 'clients' as const) => {
    const minLength = data?.[target]?.length || 1;
    return getValues(target).length <= minLength;
  };

  const isDirtyProductItem = (field: keyof ReservationItem) => !!dirtyFields[field]?.length;

  return (
    <Card asChild size='3'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction='column' gap='9'>
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
                    <Select.Trigger placeholder='예약회사 선택'>{field.value}</Select.Trigger>
                    <Select.Content>
                      <Select.Item value='마이리얼트립'>마이리얼트립</Select.Item>
                      <Select.Item value='크리에이트립'>크리에이트립</Select.Item>
                      <Select.Item value='와그'>와그</Select.Item>
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
            {isDev() && (
              <div>
                합계(달러) : {data?.total_amount}
                <br />
                예약자: {watch('main_client_name')}
              </div>
            )}

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
                  <Table.ColumnHeaderCell>비고</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {getValues('clients').map((client, i) => (
                  <Table.Row key={i}>
                    <Table.Cell align='center'>
                      <label>
                        <Radio
                          size='3'
                          name='reservation'
                          value={'' + i}
                          defaultChecked={
                            getValues('main_client_name')
                              ? getValues('main_client_name') === client.korean_name
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
                        render={({ field }) => (
                          <TextField.Root
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
                      <TextField.Root
                        {...register(`clients.${i}.resident_id`, { required: true })}
                        placeholder='000000-0000000'
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <TextField.Root
                        {...register(`clients.${i}.phone_number`, { required: true })}
                        placeholder='010-0000-0000'
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
              <Button disabled={mutation.isPending} variant='outline'>
                <Save />
                변경사항 저장
              </Button>
              <Button
                title='인원 삭제'
                type='button'
                color='ruby'
                variant='soft'
                onClick={() => removeItem('clients')}
                disabled={isRemoveClientDisabled('clients')}
              >
                <UserMinus />
              </Button>
              <Button title='인원 추가' type='button' color='ruby' onClick={addClient}>
                <UserPlus />
              </Button>
            </Flex>
            {isDev() && (
              <pre>
                {JSON.stringify(
                  { isDirty: isDirtyProductItem('clients'), ...watch('clients') },
                  null,
                  2
                )}
              </pre>
            )}
          </Section>
        </Flex>
      </form>
    </Card>
  );
}
