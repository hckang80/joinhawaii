'use client';

import { HOTEL_GUIDE_NOTES } from '@/constants';
import { updateReservation } from '@/http';
import { reservationQueryOptions } from '@/lib/queries';
import type { ReservationFormData, ReservationResponse } from '@/types';
import {
  Box,
  Button,
  Card,
  CheckboxGroup,
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
      guideNotes: HOTEL_GUIDE_NOTES,
      cancellationPolicy: selectedHotel?.rule || '',
      selectedClients: selectedHotel?.selected_clients || []
    }
  });

  useEffect(() => {
    reset({
      confirmationNumber: selectedHotel?.confirmation_number || '',
      deliveryNotes: selectedHotel?.delivery_notes || '',
      guideNotes: HOTEL_GUIDE_NOTES,
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
                    <Flex direction='column' gap='1'>
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
                          />
                        )}
                      />
                      {errors.confirmationNumber && (
                        <Text size='1' color='red'>
                          {errors.confirmationNumber.message}
                        </Text>
                      )}
                    </Flex>
                  </td>
                </tr>
              </tbody>
            </table>
            <Separator size='4' />
            <div>
              <Text as='div' size='2' mb='2'>
                투숙객 선택
              </Text>
              <Controller
                name='selectedClients'
                control={control}
                rules={{
                  validate: value => value.length > 0 || '투숙객을 선택해주세요.'
                }}
                render={({ field }) => {
                  const orderedClientLabels = (data?.clients ?? []).map(client =>
                    `${client.english_name || ''} ${client.gender || ''}`.trim()
                  );

                  return (
                    <>
                      <CheckboxGroup.Root
                        name='selectedClients'
                        value={field.value}
                        onValueChange={values => {
                          field.onChange(
                            orderedClientLabels.filter(label => values.includes(label))
                          );
                        }}
                      >
                        <Flex direction='column' gap='2'>
                          {data?.clients?.map(client => {
                            const clientLabel =
                              `${client.english_name || ''} ${client.gender || ''}`.trim();

                            return (
                              <CheckboxGroup.Item key={client.id} value={clientLabel}>
                                {client.english_name} ({client.gender})
                              </CheckboxGroup.Item>
                            );
                          })}
                        </Flex>
                      </CheckboxGroup.Root>
                      {errors.selectedClients && (
                        <Text size='1' color='red'>
                          {errors.selectedClients.message}
                        </Text>
                      )}
                    </>
                  );
                }}
              />
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
              <Controller
                name='guideNotes'
                control={control}
                render={({ field }) => <TextArea {...field} />}
              />
            </label>
            <label>
              <Text as='div' size='2' mb='1'>
                취소규정
              </Text>
              <TextArea value={watch('cancellationPolicy')} readOnly />
            </label>

            <Button onClick={handleSubmit(onSubmit)} mt='2' disabled={voucherMutation.isPending}>
              {voucherMutation.isPending ? '제출 중...' : '바우처 발급'}
            </Button>
          </Flex>
        </Card>

        <Section py='0' className='voucher-preview-card'>
          <Heading as='h2' size='7' mb='4' weight='medium' className={styles['main-title']}>
            hotel confirmation
          </Heading>

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

          <Section mt='4' py='0'>
            <Heading as='h3' mb='2' className={styles['sub-title']}>
              guest name
            </Heading>
            <Grid columns='2' className={styles['guest-grid']}>
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
                <Text style={{ whiteSpace: 'pre-wrap' }}>{watch('deliveryNotes') || '-'}</Text>
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
                <Box>
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{watch('guideNotes') || '-'}</Text>
                  <Text as='p' color='red' mt='9'>
                    [취소규정] {watch('cancellationPolicy') || '-'}
                  </Text>
                </Box>
              </Flex>
            </Card>
          </Box>

          <Grid columns={{ initial: '1', md: '2' }} gap='3' mt='5'>
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
        </Section>
      </Grid>
    </Box>
  );
}
