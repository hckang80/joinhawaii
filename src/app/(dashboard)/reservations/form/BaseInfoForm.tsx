import { BOOKING_PLATFORM_OPTIONS, CUSTOM_LABEL, defaultClientValues } from '@/constants';
import type { ReservationFormData, ReservationResponse, ReservationSuccessResponse } from '@/types';
import { toReadableDate } from '@/utils';
import { observable } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import { Button, Card, Flex, Heading, Section, Select, Table, TextField } from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
import { PlusCircle, Save } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useRef } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';

const status$ = observable({
  reservationIndex: 0
});

export default function BaseInfoForm({
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
    handleSubmit,
    formState: { isDirty },
    control,
    reset
  } = useForm<ReservationFormData>({
    defaultValues: useMemo(() => {
      return {
        reservation_id: data?.reservation_id,
        booking_platform: data?.booking_platform || '',
        main_client_name: data?.main_client_name || ''
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

  const redirectModifyForm = async (reservationId: string) => {
    if (isModify) return;
    router.replace(`/reservations/form?reservation_id=${encodeURIComponent(reservationId)}`);
  };

  const customBookingPlatformRef = useRef('');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card size='3'>
        <Section p='0'>
          <Heading as='h3' mb='4'>
            기본정보
          </Heading>

          <Table.Root>
            <colgroup>
              <col style={{ width: '100px' }} />
              <col style={{ width: '400px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '400px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '400px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '400px' }} />
            </colgroup>
            <Table.Body>
              <Table.Row>
                <Table.RowHeaderCell>발행일</Table.RowHeaderCell>
                <Table.Cell>{data?.created_at ? toReadableDate(data?.created_at) : '-'}</Table.Cell>
                <Table.RowHeaderCell>담당자</Table.RowHeaderCell>
                <Table.Cell>-</Table.Cell>
                <Table.RowHeaderCell>카카오톡</Table.RowHeaderCell>
                <Table.Cell>-</Table.Cell>
                <Table.RowHeaderCell>업체구분</Table.RowHeaderCell>
                <Table.Cell>
                  <Controller
                    name='booking_platform'
                    control={control}
                    render={({ field }) => {
                      const isCustom =
                        field.value === CUSTOM_LABEL ||
                        !Object.values(BOOKING_PLATFORM_OPTIONS)
                          .flat()
                          .some(opt => opt.value === field.value);

                      const handleSelectChange = (value: string) => {
                        if (value === CUSTOM_LABEL) {
                          // 직접입력 선택 시 이전 custom 값 복원
                          field.onChange(customBookingPlatformRef.current || '');
                        } else {
                          // 직접입력 해제 시 현재 입력값 저장
                          if (isCustom && field.value && field.value !== CUSTOM_LABEL) {
                            customBookingPlatformRef.current = field.value;
                          }
                          field.onChange(value);
                        }
                      };

                      const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                        customBookingPlatformRef.current = e.target.value;
                        field.onChange(e.target.value);
                      };

                      return (
                        <Flex gap='2' align='center'>
                          <Select.Root
                            size='3'
                            value={isCustom ? CUSTOM_LABEL : field.value}
                            onValueChange={handleSelectChange}
                            name={field.name}
                          >
                            <Select.Trigger placeholder='예약회사 선택' style={{ width: '200px' }}>
                              {isCustom ? CUSTOM_LABEL : field.value}
                            </Select.Trigger>
                            <Select.Content>
                              {Object.entries(BOOKING_PLATFORM_OPTIONS).map(
                                ([groupLabel, options]) => (
                                  <div key={groupLabel}>
                                    <Select.Group key={groupLabel}>
                                      <Select.Label>{groupLabel}</Select.Label>
                                      {options.map(({ value, label }) => (
                                        <Select.Item key={value} value={value}>
                                          {label}
                                        </Select.Item>
                                      ))}
                                    </Select.Group>
                                    <Select.Separator />
                                  </div>
                                )
                              )}
                              <Select.Item value={CUSTOM_LABEL}>{CUSTOM_LABEL}</Select.Item>
                            </Select.Content>
                          </Select.Root>
                          {isCustom && (
                            <TextField.Root
                              size='3'
                              value={
                                field.value === CUSTOM_LABEL
                                  ? customBookingPlatformRef.current
                                  : field.value
                              }
                              onChange={handleCustomInputChange}
                            />
                          )}
                        </Flex>
                      );
                    }}
                  />
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.RowHeaderCell>여행종류</Table.RowHeaderCell>
                <Table.Cell>-</Table.Cell>
                <Table.RowHeaderCell>구분</Table.RowHeaderCell>
                <Table.Cell>-</Table.Cell>
                <Table.RowHeaderCell>예약구분</Table.RowHeaderCell>
                <Table.Cell>{reservation_id || '-'}</Table.Cell>
                <Table.RowHeaderCell>여행일정</Table.RowHeaderCell>
                <Table.Cell>-</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Section>
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
    </form>
  );
}
