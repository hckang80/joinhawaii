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
  check_in_date: string;
  check_out_date: string;
  real_nights: number;
  confirmation_number: string;
  delivery_notes: string;
  guide_notes: string;
  selected_clients: string[];
};

type SelectedHotelProduct = NonNullable<ReturnType<typeof getSelectedProduct>> & {
  start_date?: string | null;
  end_date?: string | null;
  real_nights: number;
};

function getSelectedProduct(data: ReservationResponse | undefined, productId?: string) {
  const selectedProducts = data?.products?.hotels ?? [];

  if (productId) {
    const byId = selectedProducts.find(({ id }) => String(id) === productId);
    if (byId) return byId;
  }

  return selectedProducts[0];
}

function renderProductNameContent(
  selectedProduct: NonNullable<ReturnType<typeof getSelectedProduct>>
) {
  const englishLabel =
    HOTELS[selectedProduct.region]?.find(({ label }) => label === selectedProduct.hotel_name)
      ?.en_label || '-';

  return (
    <>
      {selectedProduct.hotel_name || '-'}
      <Text as='p'>{englishLabel}</Text>
    </>
  );
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

  if (!selectedProduct) {
    return (
      <Box width='1000px' mx='auto'>
        <Card>
          <Text>선택된 호텔 정보를 찾을 수 없습니다.</Text>
        </Card>
      </Box>
    );
  }

  const selectedHotelProduct = selectedProduct as SelectedHotelProduct;

  return (
    <VoucherHotelForm
      reservationId={reservationId}
      selectedProduct={selectedHotelProduct}
      clients={data?.clients ?? []}
    />
  );
}

type VoucherHotelFormProps = {
  reservationId: string;
  selectedProduct: SelectedHotelProduct;
  clients: ReservationResponse['clients'];
};

function VoucherHotelForm({ reservationId, selectedProduct, clients }: VoucherHotelFormProps) {
  const voucherMutation = useMutation({
    mutationFn: (payload: Partial<ReservationFormData>) => updateReservation(payload),
    onSuccess: () => {
      toast.success('바우처가 성공적으로 제출되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message || '바우처 제출에 실패했습니다.');
    }
  });

  const defaultFormValues = useMemo<VoucherFormState>(() => {
    const {
      start_date,
      end_date,
      check_in_date,
      check_out_date,
      real_nights,
      confirmation_number,
      delivery_notes,
      guide_notes,
      selected_clients
    } = selectedProduct;

    return {
      check_in_date: start_date ?? check_in_date ?? '',
      check_out_date: end_date ?? check_out_date ?? '',
      real_nights,
      confirmation_number,
      delivery_notes: getDefaultDeliveryNotes(delivery_notes),
      guide_notes: getDefaultGuideNotes(guide_notes),
      selected_clients
    };
  }, [selectedProduct]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty }
  } = useForm<VoucherFormState>({
    mode: 'onBlur',
    defaultValues: defaultFormValues
  });

  useEffect(() => {
    reset(defaultFormValues);
  }, [defaultFormValues, reset]);

  const onSubmit: SubmitHandler<VoucherFormState> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');

    const { check_in_date, check_out_date, ...hotelData } = formData;

    const submitData = {
      reservation_id: reservationId,
      hotels: [
        {
          id: selectedProduct.id,
          ...hotelData,
          start_date: check_in_date || null,
          end_date: check_out_date || null
        }
      ]
    } as unknown as Partial<ReservationFormData>;

    voucherMutation.mutate(submitData);
  };

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
        <Heading
          as='h2'
          size='7'
          mb='4'
          weight='bold'
          className={`${styles['main-title']} ${styles['main-title-hotel']}`}
        >
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
                    name='check_in_date'
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
                    name='check_out_date'
                    control={control}
                    render={({ field }) => {
                      const checkInDate = watch('check_in_date');
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
                  {watch('check_in_date') && watch('check_out_date')
                    ? `${watch('check_in_date')} ~ ${watch('check_out_date')}`
                    : '-'}
                </Text>
              </td>
              <th className={styles['info-th']}>night</th>
              <td className={styles['info-td']}>
                <Box className='print:hidden'>
                  <Controller
                    name='real_nights'
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
                <Text className='print:only'>
                  {watch('real_nights') ? `${watch('real_nights')}박` : '-'}
                </Text>
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>room category</th>
              <td className={styles['info-td']} colSpan={3}>
                {selectedProduct.room_type || '-'}
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>bed type</th>
              <td className={styles['info-td']} colSpan={3}>
                {selectedProduct.bed_type || '-'}
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>breakfast</th>
              <td className={styles['info-td']}>
                {selectedProduct.is_breakfast_included ? 'INCLUSION' : 'EXCLUSION'}
              </td>
              <th className={styles['info-th']}>resort fee</th>
              <td className={styles['info-td']}>{selectedProduct.resort_fee_type || '-'}</td>
            </tr>
            <tr>
              <th className={styles['info-th']}>confirmation</th>
              <td className={styles['info-td']} colSpan={3}>
                <Flex direction='column' gap='1' className='print:hidden'>
                  <Controller
                    name='confirmation_number'
                    control={control}
                    rules={{
                      required: '확인번호는 필수입니다.'
                    }}
                    render={({ field }) => (
                      <TextField.Root
                        {...field}
                        type='text'
                        color={errors.confirmation_number ? 'red' : undefined}
                      >
                        <TextField.Slot>#</TextField.Slot>
                      </TextField.Root>
                    )}
                  />
                  {errors.confirmation_number && (
                    <Text color='red'>{errors.confirmation_number.message}</Text>
                  )}
                </Flex>

                <Text className='print:only'>{`#${watch('confirmation_number') || '-'}`}</Text>
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
              name='selected_clients'
              control={control}
              rules={{
                validate: value => value.length > 0 || '인원을 선택해주세요.'
              }}
              render={({ field }) => {
                const orderedClientLabels = clients.map(client =>
                  `${client.english_name || ''} ${client.gender || ''}`.trim()
                );

                return (
                  <>
                    {clients.map(client => {
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
          {errors.selected_clients && (
            <Text color='red' as='p' mt='1'>
              {errors.selected_clients.message}
            </Text>
          )}

          <Grid columns='2' className={`${styles['guest-grid']} print:only`}>
            {watch('selected_clients').map((client, i) => {
              const selectedClient = clients.find(foundClient => {
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
                  name='delivery_notes'
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
                {hasRenderableTiptapContent(watch('delivery_notes')) ? (
                  <div dangerouslySetInnerHTML={{ __html: watch('delivery_notes') }} />
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
                    name='guide_notes'
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
                  {hasRenderableTiptapContent(watch('guide_notes')) ? (
                    <div dangerouslySetInnerHTML={{ __html: watch('guide_notes') }} />
                  ) : (
                    <Text>-</Text>
                  )}
                </Box>
                <Text as='p' color='red' mt='8'>
                  [취소규정] {selectedProduct.rule || '-'}
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
