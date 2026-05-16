'use client';

import { updateReservation } from '@/http';
import { reservationQueryOptions } from '@/lib/queries';
import type { ReservationFormData, ReservationResponse } from '@/types';
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Section,
  Separator,
  Text,
  TextArea,
  TextField
} from '@radix-ui/themes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import styles from './voucher.module.css';

type VoucherHotelClientContainerProps = {
  reservationId: string;
  hotelId?: string;
  index?: string;
};

type VoucherFormState = {
  confirmationNumber: string;
  deliveryNotes: string;
  guideNotes: string;
  cancellationPolicy: string;
  selectedClients: string[];
};

function getSelectedHotel(data: ReservationResponse | undefined, hotelId?: string, index?: string) {
  const hotels = data?.products?.hotels ?? [];

  if (hotelId) {
    const byId = hotels.find(hotel => String(hotel.id) === hotelId);
    if (byId) return byId;
  }

  const idx = Number(index);
  if (Number.isInteger(idx) && idx >= 0 && idx < hotels.length) {
    return hotels[idx];
  }

  return hotels[0];
}

export default function VoucherHotelClientContainer({
  reservationId,
  hotelId,
  index
}: VoucherHotelClientContainerProps) {
  const { data, isLoading } = useQuery({
    ...reservationQueryOptions(reservationId),
    enabled: !!reservationId
  });

  const selectedHotel = useMemo(
    () => getSelectedHotel(data, hotelId, index),
    [data, hotelId, index]
  );

  const voucherMutation = useMutation({
    mutationFn: (payload: Partial<ReservationFormData>) => updateReservation(payload),
    onSuccess: () => {
      toast.success('바우처가 성공적으로 제출되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message || '바우처 제출에 실패했습니다.');
    }
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<VoucherFormState>({
    mode: 'onBlur',
    defaultValues: {
      confirmationNumber: '',
      deliveryNotes: selectedHotel?.notes || '',
      guideNotes: selectedHotel?.remarks || '',
      cancellationPolicy: selectedHotel?.rule || '',
      selectedClients: []
    }
  });

  useEffect(() => {
    reset({
      confirmationNumber: '',
      deliveryNotes: selectedHotel?.notes || '',
      guideNotes: selectedHotel?.remarks || '',
      cancellationPolicy: selectedHotel?.rule || '',
      selectedClients: []
    });
  }, [selectedHotel, reset]);

  const onSubmit: SubmitHandler<VoucherFormState> = formData => {
    if (!selectedHotel?.id) {
      return toast.warning('호텔 정보를 찾을 수 없습니다.');
    }

    const submitData = {
      reservation_id: reservationId,
      hotels: [
        {
          id: selectedHotel.id,
          confirmation_number: formData.confirmationNumber,
          delivery_notes: formData.deliveryNotes,
          selected_clients: formData.selectedClients
        }
      ]
    } as unknown as Partial<ReservationFormData>;

    voucherMutation.mutate(submitData);
  };

  if (!reservationId) {
    return (
      <Box width='1100px' mx='auto'>
        <Card>
          <Text>reservation_id가 없어 바우처 정보를 불러올 수 없습니다.</Text>
        </Card>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box width='1100px' mx='auto'>
        <Card>
          <Text>바우처 정보를 불러오는 중...</Text>
        </Card>
      </Box>
    );
  }

  return (
    <Box width='1100px' mx='auto' className='voucher-root'>
      <Flex justify='between' align='center' mb='4' className='print:hidden'>
        <Heading as='h2' size='6'>
          호텔 바우처 발급
        </Heading>
        <Flex gap='2'>
          <Button size='3' onClick={() => window.print()}>
            PDF 다운
          </Button>
        </Flex>
      </Flex>

      <Grid columns={{ initial: '1', md: '2' }} gap='4' className='voucher-layout'>
        <Card className='print:hidden'>
          <Heading as='h3' size='4' mb='3'>
            바우처 입력
          </Heading>
          <Flex direction='column' gap='3'>
            <table className={styles['info-table']}>
              <tbody>
                <tr>
                  <th className={styles['info-th']}>hotel</th>
                  <td className={styles['info-td']} colSpan={3}>
                    <TextField.Root value={selectedHotel?.hotel_name || ''} readOnly />
                  </td>
                </tr>
                <tr>
                  <th className={styles['info-th']}>period</th>
                  <td className={styles['info-td']}>
                    <TextField.Root
                      value={
                        selectedHotel?.check_in_date && selectedHotel?.check_out_date
                          ? `${selectedHotel.check_in_date} ~ ${selectedHotel.check_out_date}`
                          : '-'
                      }
                      readOnly
                    />
                  </td>
                  <th className={styles['info-th']}>night</th>
                  <td className={styles['info-td']}>
                    <TextField.Root
                      value={selectedHotel?.nights ? `${selectedHotel.nights}박` : '-'}
                      readOnly
                    />
                  </td>
                </tr>
                <tr>
                  <th className={styles['info-th']}>room category</th>
                  <td className={styles['info-td']} colSpan={3}>
                    <TextField.Root value={selectedHotel?.room_type || ''} readOnly />
                  </td>
                </tr>
                <tr>
                  <th className={styles['info-th']}>bed type</th>
                  <td className={styles['info-td']} colSpan={3}>
                    <TextField.Root value={selectedHotel?.bed_type || ''} readOnly />
                  </td>
                </tr>
                <tr>
                  <th className={styles['info-th']}>breakfast</th>
                  <td className={styles['info-td']}>
                    <TextField.Root
                      value={selectedHotel?.is_breakfast_included ? '포함' : '미포함'}
                      readOnly
                    />
                  </td>
                  <th className={styles['info-th']}>resort fee</th>
                  <td className={styles['info-td']}>
                    <TextField.Root
                      value={
                        selectedHotel?.resort_fee_type === 'INCLUSION'
                          ? '포함'
                          : selectedHotel?.resort_fee_type === 'EXCLUSION'
                            ? '불포함'
                            : selectedHotel?.resort_fee_type === 'NO RESORT FEE'
                              ? '없음'
                              : '-'
                      }
                      readOnly
                    />
                  </td>
                </tr>
                <tr>
                  <th className={styles['info-th']}>confirmation number</th>
                  <td className={styles['info-td']} colSpan={3}>
                    <Controller
                      name='confirmationNumber'
                      control={control}
                      render={({ field }) => <TextField.Root {...field} />}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <Separator size='4' />
            <div>
              <Text as='div' size='2' mb='2'>
                투숙객 선택
              </Text>
              <Flex direction='column' gap='2'>
                {data?.clients?.map(client => (
                  <label
                    key={client.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  >
                    <Controller
                      name='selectedClients'
                      control={control}
                      rules={{
                        validate: value => value.length > 0 || '투숙객을 선택해주세요.'
                      }}
                      render={({ field }) => {
                        const clientLabel =
                          `${client.korean_name || ''} ${client.gender || ''}`.trim();

                        return (
                          <input
                            type='checkbox'
                            checked={field.value.includes(clientLabel)}
                            onChange={e => {
                              if (e.target.checked) {
                                field.onChange([...field.value, clientLabel]);
                              } else {
                                field.onChange(field.value.filter(item => item !== clientLabel));
                              }
                            }}
                          />
                        );
                      }}
                    />
                    <Text size='2'>
                      {client.korean_name} ({client.gender})
                    </Text>
                  </label>
                ))}
              </Flex>
              {errors.selectedClients && (
                <Text size='1' color='red' mt='2'>
                  {errors.selectedClients.message}
                </Text>
              )}
            </div>
            <Separator size='4' />
            <label>
              <Text as='div' size='2' mb='1'>
                전달사항
              </Text>
              <Controller
                name='deliveryNotes'
                control={control}
                render={({ field }) => <TextArea {...field} />}
              />
            </label>
            <label>
              <Text as='div' size='2' mb='1'>
                안내사항
              </Text>
              <TextArea value={watch('guideNotes')} readOnly />
            </label>
            <label>
              <Text as='div' size='2' mb='1'>
                취소규정
              </Text>
              <TextArea value={watch('cancellationPolicy')} readOnly />
            </label>

            <Button
              onClick={handleSubmit(onSubmit)}
              mt='2'
              disabled={voucherMutation.isPending || !isValid}
            >
              {voucherMutation.isPending ? '제출 중...' : '바우처 발급'}
            </Button>
          </Flex>
        </Card>

        <Card className='voucher-preview-card'>
          <Section size='1'>
            <Heading as='h3' size='4' mb='3' className={styles['main-title']}>
              hotel confirmation
            </Heading>
            <Flex direction='column' gap='2'>
              <table className={styles['info-table']}>
                <tbody>
                  <tr>
                    <th className={styles['info-th']}>hotel</th>
                    <td className={styles['info-td']} colSpan={3}>
                      {selectedHotel?.hotel_name || '-'}
                    </td>
                  </tr>
                  <tr>
                    <th className={styles['info-th']}>period</th>
                    <td className={styles['info-td']}>
                      {selectedHotel?.check_in_date && selectedHotel?.check_out_date
                        ? `${selectedHotel.check_in_date} ~ ${selectedHotel.check_out_date}`
                        : '-'}
                    </td>
                    <th className={styles['info-th']}>night</th>
                    <td className={styles['info-td']}>
                      {selectedHotel?.nights ? `${selectedHotel.nights}박` : '-'}
                    </td>
                  </tr>
                  <tr>
                    <th className={styles['info-th']}>room category</th>
                    <td className={styles['info-td']} colSpan={3}>
                      {selectedHotel?.room_type || '-'}
                    </td>
                  </tr>
                  <tr>
                    <th className={styles['info-th']}>bed type</th>
                    <td className={styles['info-td']} colSpan={3}>
                      {selectedHotel?.bed_type || '-'}
                    </td>
                  </tr>
                  <tr>
                    <th className={styles['info-th']}>breakfast</th>
                    <td className={styles['info-td']}>
                      {selectedHotel?.is_breakfast_included ? '포함' : '미포함'}
                    </td>
                    <th className={styles['info-th']}>resort fee</th>
                    <td className={styles['info-td']}>
                      {selectedHotel?.resort_fee_type === 'INCLUSION'
                        ? '포함'
                        : selectedHotel?.resort_fee_type === 'EXCLUSION'
                          ? '불포함'
                          : selectedHotel?.resort_fee_type === 'NO RESORT FEE'
                            ? '없음'
                            : '-'}
                    </td>
                  </tr>
                  <tr>
                    <th className={styles['info-th']}>confirmation number</th>
                    <td className={styles['info-td']} colSpan={3}>
                      {watch('confirmationNumber') || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
              <Separator size='4' />
              <Text weight='bold'>✅ 전달사항</Text>
              <Text>{watch('deliveryNotes') || '-'}</Text>
              <Text weight='bold'>✅ 안내사항</Text>
              <Text>{watch('guideNotes') || '-'}</Text>
              <Text weight='bold' color='red'>
                ✅ 취소규정
              </Text>
              <Text color='red'>{watch('cancellationPolicy') || '-'}</Text>
              <Separator size='4' />
              <Text weight='bold'>조인하와이 현지 연락처</Text>
              <Text>T : (808) 772-2691</Text>
              <Text>카톡 : joinhawaiiusa</Text>
              <Text>시간 : 08AM ~ 17PM</Text>
              <Separator size='4' />
              <Text weight='bold'>조인하와이 한국 연락처</Text>
              <Text>T : 02-402-1040</Text>
              <Text>카톡 : 조인하와이(채널)</Text>
              <Text>시간 : 09AM ~ 18PM</Text>
            </Flex>
          </Section>
        </Card>
      </Grid>
    </Box>
  );
}
