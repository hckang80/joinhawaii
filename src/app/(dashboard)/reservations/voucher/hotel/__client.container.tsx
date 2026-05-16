'use client';

import { HOTEL_GUIDE_NOTES, HOTELS } from '@/constants';
import { updateReservation } from '@/http';
import { reservationQueryOptions } from '@/lib/queries';
import type { ReservationFormData, ReservationResponse } from '@/types';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Grid,
  Heading,
  Section,
  Text,
  TextArea,
  TextField
} from '@radix-ui/themes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Mic } from 'lucide-react';
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

function renderHotelNameContent(selectedHotel: ReturnType<typeof getSelectedHotel>) {
  const englishLabel =
    HOTELS[selectedHotel?.region]?.find(hotel => hotel.label === selectedHotel?.hotel_name)
      ?.en_label || '-';

  return (
    <>
      {selectedHotel?.hotel_name || '-'}
      <Text as='p'>{englishLabel}</Text>
    </>
  );
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
    formState: { errors }
  } = useForm<VoucherFormState>({
    mode: 'onBlur',
    defaultValues: {
      confirmationNumber: selectedHotel?.confirmation_number || '',
      deliveryNotes: selectedHotel?.delivery_notes || '',
      guideNotes: selectedHotel?.guide_notes || HOTEL_GUIDE_NOTES,
      cancellationPolicy: selectedHotel?.rule || '',
      selectedClients: selectedHotel?.selected_clients || []
    }
  });

  useEffect(() => {
    reset({
      confirmationNumber: selectedHotel?.confirmation_number || '',
      deliveryNotes: selectedHotel?.delivery_notes || '',
      guideNotes: selectedHotel?.guide_notes || HOTEL_GUIDE_NOTES,
      cancellationPolicy: selectedHotel?.rule || '',
      selectedClients: selectedHotel?.selected_clients || []
    });
  }, [selectedHotel, reset]);

  const onSubmit: SubmitHandler<VoucherFormState> = formData => {
    const submitData = {
      reservation_id: reservationId,
      hotels: [
        {
          id: selectedHotel.id,
          confirmation_number: formData.confirmationNumber,
          delivery_notes: formData.deliveryNotes,
          guide_notes: formData.guideNotes,
          selected_clients: formData.selectedClients
        }
      ]
    } as unknown as Partial<ReservationFormData>;

    voucherMutation.mutate(submitData);
  };

  if (!reservationId) {
    return (
      <Box width='1000px' mx='auto'>
        <Card>
          <Text>reservation_id가 없어 바우처 정보를 불러올 수 없습니다.</Text>
        </Card>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box width='1000px' mx='auto'>
        <Card>
          <Text>바우처 정보를 불러오는 중...</Text>
        </Card>
      </Box>
    );
  }

  return (
    <Box width='1000px' mx='auto' className='voucher-root'>
      <Flex justify='between' align='center' mb='4' className='print:hidden'>
        <Heading as='h2' size='6'>
          바우처 발급
        </Heading>
      </Flex>

      <Section py='0'>
        <Heading as='h2' size='7' mb='4' weight='bold' className={styles['main-title']}>
          hotel confirmation
        </Heading>
        <table className={styles['info-table']}>
          <tbody>
            <tr>
              <th className={styles['info-th']}>hotel</th>
              <td className={styles['info-td']} colSpan={3}>
                {renderHotelNameContent(selectedHotel)}
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
              <th className={styles['info-th']}>confirmation</th>
              <td className={styles['info-td']} colSpan={3}>
                <Flex direction='column' gap='1' className='print:hidden'>
                  <Controller
                    name='confirmationNumber'
                    control={control}
                    rules={{
                      required: '확인번호는 필수입니다.',
                      pattern: {
                        value: /^\d+$/,
                        message: '확인번호는 숫자만 입력 가능합니다.'
                      }
                    }}
                    render={({ field }) => (
                      <TextField.Root
                        {...field}
                        type='number'
                        min='0'
                        color={errors.confirmationNumber ? 'red' : undefined}
                      >
                        <TextField.Slot>#</TextField.Slot>
                      </TextField.Root>
                    )}
                  />
                  {errors.confirmationNumber && (
                    <Text color='red'>{errors.confirmationNumber.message}</Text>
                  )}
                </Flex>

                <Text className='print:only'>{`#${watch('confirmationNumber') || '-'}`}</Text>
              </td>
            </tr>
          </tbody>
        </table>

        <Section mt='4' py='0'>
          <Heading as='h3' mb='2' className={styles['sub-title']}>
            guest name
          </Heading>
          <Grid columns='2' className={`${styles['guest-grid']} print:hidden`}>
            <Controller
              name='selectedClients'
              control={control}
              rules={{
                validate: value => value.length > 0 || '인원을 선택해주세요.'
              }}
              render={({ field }) => {
                const orderedClientLabels = (data?.clients ?? []).map(client =>
                  `${client.english_name || ''} ${client.gender || ''}`.trim()
                );

                return (
                  <>
                    {data?.clients?.map(client => {
                      const clientLabel =
                        `${client.english_name || ''} ${client.gender || ''}`.trim();
                      const isChecked = field.value.includes(clientLabel);

                      return (
                        <Flex
                          key={client.id}
                          asChild
                          gap='4'
                          align='center'
                          className={styles['guest-row']}
                        >
                          <label>
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={checked => {
                                const nextSelectedClients = checked
                                  ? [...field.value, clientLabel]
                                  : field.value.filter(value => value !== clientLabel);

                                field.onChange(
                                  orderedClientLabels.filter(label =>
                                    nextSelectedClients.includes(label)
                                  )
                                );
                              }}
                            />
                            <Text>{client.english_name}</Text>
                            <Text>({client.gender})</Text>
                          </label>
                        </Flex>
                      );
                    })}
                  </>
                );
              }}
            />
          </Grid>
          {errors.selectedClients && (
            <Text color='red' as='p' mt='1'>
              {errors.selectedClients.message}
            </Text>
          )}

          <Grid columns='2' className={`${styles['guest-grid']} print:only`}>
            {watch('selectedClients').map((client, i) => {
              const parts = client.split(' ');
              const gender = parts[parts.length - 1];
              const name = parts.slice(0, -1).join(' ');
              return (
                <Flex key={i} gap='4' align='center' className={styles['guest-row']}>
                  <Text>{i + 1}</Text>
                  <Text>{name}</Text>
                  <Text>{gender}</Text>
                </Flex>
              );
            })}
          </Grid>
        </Section>

        <Box asChild mt='5'>
          <Card>
            <Flex gap='4'>
              <Flex asChild direction='column' align='center' flexShrink='0'>
                <Text size='4' weight='bold'>
                  <Mic />
                  전달
                </Text>
              </Flex>
              <Box flexGrow='1' className='print:hidden'>
                <Controller
                  name='deliveryNotes'
                  control={control}
                  render={({ field }) => <TextArea {...field} rows={5} resize='vertical' />}
                />
              </Box>
              <Text className='print:only' style={{ whiteSpace: 'pre-wrap' }}>
                {watch('deliveryNotes') || '-'}
              </Text>
            </Flex>
          </Card>
        </Box>

        <Box asChild mt='4'>
          <Card>
            <Flex gap='4'>
              <Flex asChild direction='column' align='center' flexShrink='0'>
                <Text size='4' weight='bold'>
                  <Mic />
                  알림
                </Text>
              </Flex>
              <Box flexGrow='1'>
                <Box className='print:hidden'>
                  <Controller
                    name='guideNotes'
                    control={control}
                    render={({ field }) => <TextArea {...field} rows={10} resize='vertical' />}
                  />
                </Box>
                <Text className='print:only' style={{ whiteSpace: 'pre-wrap' }}>
                  {watch('guideNotes') || '-'}
                </Text>
                <Text as='p' color='red' mt='8'>
                  [취소규정] {watch('cancellationPolicy') || '-'}
                </Text>
              </Box>
            </Flex>
          </Card>
        </Box>

        <Grid columns='2' gap='3' mt='5'>
          <Card>
            <Flex direction='column' gap='1'>
              <Text weight='bold'>조인하와이 현지 연락처</Text>
              <Text>T : (808) 772-2691</Text>
              <Text>카톡 : joinhawaiiusa</Text>
              <Text>시간 : 08AM ~ 17PM</Text>
            </Flex>
          </Card>
          <Card>
            <Flex direction='column' gap='1'>
              <Text weight='bold'>조인하와이 한국 연락처</Text>
              <Text>T : 02-402-1040</Text>
              <Text>카톡 : 조인하와이(채널)</Text>
              <Text>시간 : 09AM ~ 18PM</Text>
            </Flex>
          </Card>
        </Grid>

        <Flex justify='center' mt='6' gap='3' className='print:hidden'>
          <Button size='4' onClick={handleSubmit(onSubmit)} loading={voucherMutation.isPending}>
            바우처 저장
          </Button>
          <Button size='4' color='indigo' onClick={() => window.print()}>
            인쇄 / PDF 다운로드
          </Button>
        </Flex>
      </Section>
    </Box>
  );
}
