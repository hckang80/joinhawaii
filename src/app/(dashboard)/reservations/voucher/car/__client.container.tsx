'use client';

import { Tiptap } from '@/components';
import { CAR_DELIVERY_NOTES, CAR_GUIDE_NOTES } from '@/constants';
import { updateReservation } from '@/http';
import { reservationQueryOptions } from '@/lib/queries';
import type { ReservationFormData, ReservationResponse } from '@/types';
import { toReadableDate } from '@/utils';
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  RadioGroup,
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
import { ContactInfoCards } from '../ContactInfoCards';
import {
  getSelectedProductById,
  hasRenderableTiptapContent,
  type VoucherProductClientContainerProps,
  type VoucherSharedFormState
} from '../shared';
import styles from '../voucher.module.css';

type VoucherFormState = Omit<VoucherSharedFormState, 'selected_clients'> & {
  issue_date: string;
  company: 'HERTZ' | 'DOLLAR';
  included_items: string;
  optional_items: string;
};

type SelectedCarProduct = NonNullable<ReservationResponse['products']['rental_cars'][number]> & {
  start_date?: string | null;
  end_date?: string | null;
  real_nights?: number;
};

const CAR_GUIDE_NOTES_HTML = CAR_GUIDE_NOTES.split('\n')
  .map(line => `<p>${line}</p>`)
  .join('');

function getDefaultDeliveryNotes(deliveryNotes: string | null | undefined) {
  if (hasRenderableTiptapContent(deliveryNotes)) {
    return deliveryNotes ?? '';
  }
  return CAR_DELIVERY_NOTES.split('\n')
    .map(line => `<p>${line}</p>`)
    .join('');
}

function getDefaultGuideNotes(guideNotes: string | null | undefined) {
  return hasRenderableTiptapContent(guideNotes) ? (guideNotes ?? '') : CAR_GUIDE_NOTES_HTML;
}

export default function VoucherCarClientContainer({
  reservationId,
  productId
}: VoucherProductClientContainerProps) {
  const { data, isLoading, isError, error } = useQuery({
    ...reservationQueryOptions(reservationId),
    enabled: !!reservationId
  });

  const selectedProduct = useMemo(
    () => getSelectedProductById(data?.products?.rental_cars ?? [], productId),
    [data, productId]
  );

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

  const selectedCarProduct = selectedProduct as SelectedCarProduct;

  return (
    <VoucherCarForm
      reservationId={reservationId}
      selectedProduct={selectedCarProduct}
      clients={data?.clients ?? []}
    />
  );
}

type VoucherCarFormProps = {
  reservationId: string;
  selectedProduct: SelectedCarProduct;
  clients: ReservationResponse['clients'];
};

function VoucherCarForm({ reservationId, selectedProduct }: VoucherCarFormProps) {
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
    const { confirmation_number, delivery_notes, guide_notes, company } =
      selectedProduct as SelectedCarProduct & { company?: 'HERTZ' | 'DOLLAR' };
    return {
      issue_date: '',
      confirmation_number,
      delivery_notes: getDefaultDeliveryNotes(delivery_notes),
      guide_notes: getDefaultGuideNotes(guide_notes),
      company: company ?? 'HERTZ',
      included_items: '',
      optional_items: ''
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

  const selectedCompany = watch('company');

  useEffect(() => {
    reset(defaultFormValues);
  }, [defaultFormValues, reset]);

  const onSubmit: SubmitHandler<VoucherFormState> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');

    const { issue_date, included_items, optional_items, ...carData } = formData;

    const submitData = {
      reservation_id: reservationId,
      rental_cars: [
        {
          id: selectedProduct.id,
          ...carData,
          remarks: included_items,
          options: optional_items,
          issue_date: issue_date || null
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
          className={`${styles['main-title']} ${styles['main-title-car']}`}
        >
          rent a car confirmation
        </Heading>

        <Heading as='h3' size='5' mb='4' className='uppercase'>
          {`${selectedCompany} rent a car`}
        </Heading>
        <table className={styles['info-table']}>
          <tbody>
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
            <tr>
              <th className={styles['info-th']}>name</th>
              <td className={styles['info-td']} colSpan={3}>
                {selectedProduct.driver}
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>vehicle type</th>
              <td className={styles['info-td']} colSpan={3}>
                {selectedProduct.model}
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>company</th>
              <td className={styles['info-td']} colSpan={3}>
                <Box className='print:hidden'>
                  <Controller
                    name='company'
                    control={control}
                    render={({ field }) => (
                      <RadioGroup.Root value={field.value} onValueChange={field.onChange}>
                        <Flex gap='5' align='center'>
                          <Flex asChild align='center' gap='1'>
                            <label>
                              <RadioGroup.Item value='HERTZ' />
                              <Text>HERTZ</Text>
                            </label>
                          </Flex>
                          <Flex asChild align='center' gap='1'>
                            <label>
                              <RadioGroup.Item value='DOLLAR' />
                              <Text>DOLLAR</Text>
                            </label>
                          </Flex>
                        </Flex>
                      </RadioGroup.Root>
                    )}
                  />
                </Box>
                <Text className='print:only'>{watch('company')}</Text>
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>포함사항</th>
              <td className={styles['info-td']} colSpan={3}>
                <Box className='print:hidden'>
                  <Controller
                    name='included_items'
                    control={control}
                    render={({ field }) => (
                      <TextField.Root {...field} type='text' placeholder='포함사항을 입력하세요.' />
                    )}
                  />
                </Box>
                <Text className='print:only'>{watch('included_items') || '-'}</Text>
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>선택사항</th>
              <td className={styles['info-td']} colSpan={3}>
                <Box className='print:hidden'>
                  <Controller
                    name='optional_items'
                    control={control}
                    render={({ field }) => (
                      <TextField.Root {...field} type='text' placeholder='선택사항을 입력하세요.' />
                    )}
                  />
                </Box>
                <Text className='print:only'>{watch('optional_items') || '-'}</Text>
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>pick up information</th>
              <td className={styles['info-td']} colSpan={3}>
                {[
                  selectedProduct.pickup_location,
                  selectedProduct.pickup_date
                    ? toReadableDate(selectedProduct.pickup_date, true)
                    : ''
                ]
                  .filter(Boolean)
                  .join(' / ')}
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>drop off information</th>
              <td className={styles['info-td']} colSpan={3}>
                {[
                  selectedProduct.return_location,
                  selectedProduct.return_date
                    ? toReadableDate(selectedProduct.return_date, true)
                    : ''
                ]
                  .filter(Boolean)
                  .join(' / ')}
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>number of days</th>
              <td className={styles['info-td']} colSpan={3}>
                {selectedProduct.rental_days}
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>issue date</th>
              <td className={styles['info-td']} colSpan={3}>
                <Box className='print:hidden'>
                  <Controller
                    name='issue_date'
                    control={control}
                    render={({ field }) => <TextField.Root {...field} type='date' />}
                  />
                </Box>
                <Text className='print:only'>{watch('issue_date') || '-'}</Text>
              </td>
            </tr>
          </tbody>
        </table>

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

        <ContactInfoCards />

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
