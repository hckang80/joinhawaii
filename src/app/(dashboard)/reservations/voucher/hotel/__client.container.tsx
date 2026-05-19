'use client';

import { Tiptap } from '@/components';
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
  TextField
} from '@radix-ui/themes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Mic } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import styles from '../voucher.module.css';

type VoucherProductClientContainerProps = {
  reservationId: string;
  productId?: string;
};

type VoucherFormState = {
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  confirmationNumber: string;
  deliveryNotes: string;
  guideNotes: string;
  cancellationPolicy: string;
  selectedClients: string[];
};

function getSelectedProduct(data: ReservationResponse | undefined, productId?: string) {
  const selectedProducts = data?.products?.hotels ?? [];

  if (productId) {
    const byId = selectedProducts.find(({ id }) => String(id) === productId);
    if (byId) return byId;
  }

  return selectedProducts[0];
}

function renderProductNameContent(selectedProduct: ReturnType<typeof getSelectedProduct>) {
  const englishLabel =
    HOTELS[selectedProduct?.region]?.find(({ label }) => label === selectedProduct?.hotel_name)
      ?.en_label || '-';

  return (
    <>
      {selectedProduct?.hotel_name || '-'}
      <Text as='p'>{englishLabel}</Text>
    </>
  );
}

function getPreferredHotelDate(
  selectedProduct: ReturnType<typeof getSelectedProduct>,
  key: 'start_date' | 'end_date',
  fallback: string | null | undefined
) {
  const preferredDate = (
    selectedProduct as { start_date?: string | null; end_date?: string | null } & NonNullable<
      ReturnType<typeof getSelectedProduct>
    >
  )?.[key];

  return preferredDate || fallback || '';
}

function getPreferredHotelNights(selectedProduct: ReturnType<typeof getSelectedProduct>) {
  const preferredNights = (
    selectedProduct as { real_nights?: number | null } & NonNullable<
      ReturnType<typeof getSelectedProduct>
    >
  )?.real_nights;

  if (typeof preferredNights === 'number' && preferredNights > 0) {
    return preferredNights;
  }

  return selectedProduct?.nights ?? 1;
}

const HOTEL_GUIDE_NOTES_HTML = HOTEL_GUIDE_NOTES.split('\n')
  .map(line => `<p>${line}</p>`)
  .join('');

function hasRenderableTiptapContent(content: string | null | undefined) {
  if (!content) return false;

  const normalized = content.replace(/\u200B/g, '').trim();
  if (!normalized) return false;

  const withoutEmptyParagraph = normalized
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
    .trim();

  if (/<img\b/i.test(withoutEmptyParagraph)) {
    return true;
  }

  const plainText = withoutEmptyParagraph
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, '')
    .trim();

  return plainText.length > 0;
}

function getDefaultDeliveryNotes(deliveryNotes: string | null | undefined) {
  return hasRenderableTiptapContent(deliveryNotes) ? (deliveryNotes ?? '') : '';
}

function getDefaultGuideNotes(guideNotes: string | null | undefined) {
  return hasRenderableTiptapContent(guideNotes) ? (guideNotes ?? '') : HOTEL_GUIDE_NOTES_HTML;
}

export default function VoucherHotelClientContainer({
  reservationId,
  productId
}: VoucherProductClientContainerProps) {
  const { data, isLoading, isError, error } = useQuery({
    ...reservationQueryOptions(reservationId),
    enabled: !!reservationId
  });

  const selectedProduct = useMemo(() => getSelectedProduct(data, productId), [data, productId]);

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
    formState: { errors, isDirty }
  } = useForm<VoucherFormState>({
    mode: 'onBlur',
    defaultValues: {
      checkInDate: getPreferredHotelDate(
        selectedProduct,
        'start_date',
        selectedProduct?.check_in_date
      ),
      checkOutDate: getPreferredHotelDate(
        selectedProduct,
        'end_date',
        selectedProduct?.check_out_date
      ),
      nights: getPreferredHotelNights(selectedProduct),
      confirmationNumber: selectedProduct?.confirmation_number || '',
      deliveryNotes: getDefaultDeliveryNotes(selectedProduct?.delivery_notes),
      guideNotes: getDefaultGuideNotes(selectedProduct?.guide_notes),
      cancellationPolicy: selectedProduct?.rule || '',
      selectedClients: selectedProduct?.selected_clients || []
    }
  });

  useEffect(() => {
    reset({
      checkInDate: getPreferredHotelDate(
        selectedProduct,
        'start_date',
        selectedProduct?.check_in_date
      ),
      checkOutDate: getPreferredHotelDate(
        selectedProduct,
        'end_date',
        selectedProduct?.check_out_date
      ),
      nights: getPreferredHotelNights(selectedProduct),
      confirmationNumber: selectedProduct?.confirmation_number || '',
      deliveryNotes: getDefaultDeliveryNotes(selectedProduct?.delivery_notes),
      guideNotes: getDefaultGuideNotes(selectedProduct?.guide_notes),
      cancellationPolicy: selectedProduct?.rule || '',
      selectedClients: selectedProduct?.selected_clients || []
    });
  }, [selectedProduct, reset]);

  const onSubmit: SubmitHandler<VoucherFormState> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');

    const submitData = {
      reservation_id: reservationId,
      hotels: [
        {
          id: selectedProduct.id,
          start_date: formData.checkInDate || null,
          end_date: formData.checkOutDate || null,
          real_nights: formData.nights,
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

  if (isError) {
    return (
      <Box width='1000px' mx='auto'>
        <Card>
          <Text color='red'>
            {error instanceof Error
              ? error.message
              : '바우처 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'}
          </Text>
        </Card>
      </Box>
    );
  }

  return (
    <Box width='1000px' mx='auto' className='voucher-root'>
      <div className='print-watermark' aria-hidden>
        <Image
          src='/images/logo.png'
          alt=''
          width={320}
          height={120}
          className='print-watermark-image'
          priority
        />
      </div>

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
                {renderProductNameContent(selectedProduct)}
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>period</th>
              <td className={styles['info-td']}>
                <Flex gap='2' align='center' className='print:hidden'>
                  <Controller
                    name='checkInDate'
                    control={control}
                    render={({ field }) => (
                      <TextField.Root
                        type='date'
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Text>~</Text>
                  <Controller
                    name='checkOutDate'
                    control={control}
                    render={({ field }) => {
                      const checkInDate = watch('checkInDate');
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
                </Flex>
                <Text className='print:only'>
                  {watch('checkInDate') && watch('checkOutDate')
                    ? `${watch('checkInDate')} ~ ${watch('checkOutDate')}`
                    : '-'}
                </Text>
              </td>
              <th className={styles['info-th']}>night</th>
              <td className={styles['info-td']}>
                <Box className='print:hidden'>
                  <Controller
                    name='nights'
                    control={control}
                    rules={{ min: 1 }}
                    render={({ field }) => (
                      <TextField.Root
                        type='number'
                        min='1'
                        value={field.value || ''}
                        onChange={event => field.onChange(Number(event.target.value))}
                      />
                    )}
                  />
                </Box>
                <Text className='print:only'>{watch('nights') ? `${watch('nights')}박` : '-'}</Text>
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>room category</th>
              <td className={styles['info-td']} colSpan={3}>
                {selectedProduct?.room_type || '-'}
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>bed type</th>
              <td className={styles['info-td']} colSpan={3}>
                {selectedProduct?.bed_type || '-'}
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>breakfast</th>
              <td className={styles['info-td']}>
                {selectedProduct?.is_breakfast_included ? 'INCLUSION' : 'EXCLUSION'}
              </td>
              <th className={styles['info-th']}>resort fee</th>
              <td className={styles['info-td']}>{selectedProduct?.resort_fee_type || '-'}</td>
            </tr>
            <tr>
              <th className={styles['info-th']}>confirmation</th>
              <td className={styles['info-td']} colSpan={3}>
                <Flex direction='column' gap='1' className='print:hidden'>
                  <Controller
                    name='confirmationNumber'
                    control={control}
                    rules={{
                      required: '확인번호는 필수입니다.'
                    }}
                    render={({ field }) => (
                      <TextField.Root
                        {...field}
                        type='text'
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
                            {['MSTR', 'MISS'].includes(client.gender) && (
                              <Text>{`(${client.resident_id})`}</Text>
                            )}
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
              const selectedClient = (data?.clients ?? []).find(foundClient => {
                const label =
                  `${foundClient.english_name || ''} ${foundClient.gender || ''}`.trim();
                return label === client;
              });
              const parts = client.split(' ');
              const gender = parts[parts.length - 1];
              const name = parts.slice(0, -1).join(' ');
              return (
                <Flex key={i} gap='4' align='center' className={styles['guest-row']}>
                  <Text>{i + 1}</Text>
                  <Text>{name}</Text>
                  <Text>{gender}</Text>
                  {['MSTR', 'MISS'].includes(gender) && selectedClient?.resident_id && (
                    <Text>{`(${selectedClient.resident_id})`}</Text>
                  )}
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
                  render={({ field }) => (
                    <Tiptap
                      value={field.value}
                      onChange={field.onChange}
                      height='min-h-[160px]'
                      placeholder='전달 사항을 입력하세요.'
                    />
                  )}
                />
              </Box>
              <Box className='print:only'>
                {hasRenderableTiptapContent(watch('deliveryNotes')) ? (
                  <div dangerouslySetInnerHTML={{ __html: watch('deliveryNotes') }} />
                ) : (
                  <Text>-</Text>
                )}
              </Box>
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
                    render={({ field }) => (
                      <Tiptap
                        value={field.value}
                        onChange={field.onChange}
                        height='min-h-[240px]'
                        placeholder='알림 내용을 입력하세요.'
                      />
                    )}
                  />
                </Box>
                <Box className='print:only'>
                  {hasRenderableTiptapContent(watch('guideNotes')) ? (
                    <div dangerouslySetInnerHTML={{ __html: watch('guideNotes') }} />
                  ) : (
                    <Text>-</Text>
                  )}
                </Box>
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
          <Button size='4' color='gray' onClick={() => window.print()}>
            인쇄 / PDF 다운로드
          </Button>
        </Flex>
      </Section>
    </Box>
  );
}
