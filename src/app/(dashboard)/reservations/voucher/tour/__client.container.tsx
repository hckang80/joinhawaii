'use client';

import { TimeInput, Tiptap } from '@/components';
import { HOTEL_GUIDE_NOTES, TOURS_OPTIONS } from '@/constants';
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
  RadioGroup,
  Section,
  Text,
  TextArea,
  TextField
} from '@radix-ui/themes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Mic } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { toReadableDate } from '../../../../../utils';
import styles from '../voucher.module.css';

type VoucherProductClientContainerProps = {
  reservationId: string;
  productId?: string;
};

type VoucherFormState = {
  voucherNumber: string;
  confirmationNumber: string;
  pickupType: 'PICK UP' | 'CHECK IN';
  pickupLocation: string;
  liabilityWaiverUrl: string;
  deliveryNotes: string;
  guideNotes: string;
  cancellationPolicy: string;
  selectedClients: string[];
  locationTime: string;
};

const PICKUP_TYPE_MARKER_PATTERN = /^<!--pickup_type:(PICK UP|CHECK IN)-->/;
const LIABILITY_WAIVER_URL_MARKER_PATTERN = /<!--liability_waiver_url:([^>]*)-->/;
const LOCATION_TIME_MARKER_PATTERN = /<!--location_time:([^>]*)-->/;

function parsePickupLocation(raw: string | undefined) {
  const content = raw || '';
  const pickupTypeMatched = content.match(PICKUP_TYPE_MARKER_PATTERN);
  const pickupType = (pickupTypeMatched?.[1] as VoucherFormState['pickupType']) || 'PICK UP';

  const locationTimeMatched = content.match(LOCATION_TIME_MARKER_PATTERN);
  const locationTime = locationTimeMatched?.[1] ? decodeURIComponent(locationTimeMatched[1]) : '';

  const waiverUrlMatched = content.match(LIABILITY_WAIVER_URL_MARKER_PATTERN);
  const liabilityWaiverUrl = waiverUrlMatched?.[1] ? decodeURIComponent(waiverUrlMatched[1]) : '';

  const pickupLocation = content
    .replace(PICKUP_TYPE_MARKER_PATTERN, '')
    .replace(LOCATION_TIME_MARKER_PATTERN, '')
    .replace(LIABILITY_WAIVER_URL_MARKER_PATTERN, '');

  return { pickupType, locationTime, pickupLocation, liabilityWaiverUrl };
}

function buildPickupLocation(
  pickupType: VoucherFormState['pickupType'],
  locationTime: string,
  pickupLocation: string,
  liabilityWaiverUrl: string
) {
  const sanitizedLocation = (pickupLocation || '')
    .replace(PICKUP_TYPE_MARKER_PATTERN, '')
    .replace(LOCATION_TIME_MARKER_PATTERN, '')
    .replace(LIABILITY_WAIVER_URL_MARKER_PATTERN, '');
  const encodedLocationTime = encodeURIComponent(locationTime || '');
  const encodedLiabilityWaiverUrl = encodeURIComponent(liabilityWaiverUrl || '');
  return `<!--pickup_type:${pickupType}--><!--location_time:${encodedLocationTime}--><!--liability_waiver_url:${encodedLiabilityWaiverUrl}-->${sanitizedLocation}`;
}

function getSelectedProduct(data: ReservationResponse | undefined, productId?: string) {
  const selectedProducts = data?.products?.tours ?? [];

  if (productId) {
    const byId = selectedProducts.find(({ id }) => String(id) === productId);
    if (byId) return byId;
  }

  return selectedProducts[0];
}

const tourOptions = Object.values(TOURS_OPTIONS).flat();

function renderProductNameContent(selectedProduct: ReturnType<typeof getSelectedProduct>) {
  const englishLabel =
    tourOptions?.find(({ label }) => label === selectedProduct?.name)?.en_label || '-';

  return (
    <>
      {selectedProduct?.name || '-'}
      <Text as='p'>{englishLabel}</Text>
    </>
  );
}

export default function VoucherTourClientContainer({
  reservationId,
  productId
}: VoucherProductClientContainerProps) {
  const { data, isLoading, isError, error } = useQuery({
    ...reservationQueryOptions(reservationId),
    enabled: !!reservationId
  });

  const selectedProduct = useMemo(() => getSelectedProduct(data, productId), [data, productId]);
  const parsedPickupLocation = useMemo(
    () => parsePickupLocation(selectedProduct?.pickup_location),
    [selectedProduct?.pickup_location]
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
    formState: { errors, isDirty }
  } = useForm<VoucherFormState>({
    mode: 'onBlur',
    defaultValues: {
      voucherNumber: selectedProduct?.voucher_number || '',
      confirmationNumber: selectedProduct?.confirmation_number || '',
      pickupType: parsedPickupLocation.pickupType,
      locationTime: parsedPickupLocation.locationTime,
      pickupLocation: parsedPickupLocation.pickupLocation,
      liabilityWaiverUrl: parsedPickupLocation.liabilityWaiverUrl,
      deliveryNotes: selectedProduct?.delivery_notes || '',
      guideNotes: selectedProduct?.guide_notes || HOTEL_GUIDE_NOTES,
      cancellationPolicy: selectedProduct?.rule || '',
      selectedClients: selectedProduct?.selected_clients || []
    }
  });
  const selectedPickupType = watch('pickupType');

  useEffect(() => {
    reset({
      voucherNumber: selectedProduct?.voucher_number || '',
      confirmationNumber: selectedProduct?.confirmation_number || '',
      pickupType: parsedPickupLocation.pickupType,
      locationTime: parsedPickupLocation.locationTime,
      pickupLocation: parsedPickupLocation.pickupLocation,
      liabilityWaiverUrl: parsedPickupLocation.liabilityWaiverUrl,
      deliveryNotes: selectedProduct?.delivery_notes || '',
      guideNotes: selectedProduct?.guide_notes || HOTEL_GUIDE_NOTES,
      cancellationPolicy: selectedProduct?.rule || '',
      selectedClients: selectedProduct?.selected_clients || []
    });
  }, [parsedPickupLocation, selectedProduct, reset]);

  const onSubmit: SubmitHandler<VoucherFormState> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');

    const submitData = {
      reservation_id: reservationId,
      tours: [
        {
          id: selectedProduct.id,
          voucher_number: formData.voucherNumber,
          confirmation_number: formData.confirmationNumber,
          pickup_location: buildPickupLocation(
            formData.pickupType,
            formData.locationTime,
            formData.pickupLocation,
            formData.liabilityWaiverUrl
          ),
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
          tour confirmation
        </Heading>
        <table className={styles['info-table']}>
          <tbody>
            <tr>
              <th className={styles['info-th']}>activity</th>
              <td className={styles['info-td']} colSpan={3}>
                {renderProductNameContent(selectedProduct)}
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>voucher</th>
              <td className={styles['info-td']}>
                <Flex direction='column' gap='1' className='print:hidden'>
                  <Controller
                    name='voucherNumber'
                    control={control}
                    render={({ field }) => (
                      <TextField.Root {...field} type='text' color={errors.voucherNumber ? 'red' : undefined}>
                        <TextField.Slot>#</TextField.Slot>
                      </TextField.Root>
                    )}
                  />
                  {errors.voucherNumber && <Text color='red'>{errors.voucherNumber.message}</Text>}
                </Flex>

                <Text className='print:only'>{`#${watch('voucherNumber') || '-'}`}</Text>
              </td>
              <th className={styles['info-th']}>confirmation</th>
              <td className={styles['info-td']}>
                <Flex direction='column' gap='1' className='print:hidden'>
                  <Controller
                    name='confirmationNumber'
                    control={control}
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
            <tr>
              <th className={styles['info-th']}>date/time</th>
              <td className={styles['info-td']} colSpan={3}>
                {selectedProduct?.start_date && selectedProduct?.end_date
                  ? `${toReadableDate(selectedProduct.start_date, true)} ~ ${toReadableDate(selectedProduct.end_date, true)}`
                  : '-'}
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>location type</th>
              <td className={styles['info-td']} colSpan={3}>
                <Box className='print:hidden'>
                  <Controller
                    name='pickupType'
                    control={control}
                    render={({ field }) => (
                      <RadioGroup.Root value={field.value} onValueChange={field.onChange}>
                        <Flex gap='5' align='center'>
                          <Flex asChild align='center' gap='1'>
                            <label>
                              <RadioGroup.Item value='PICK UP' />
                              <Text>PICK UP</Text>
                            </label>
                          </Flex>
                          <Flex asChild align='center' gap='1'>
                            <label>
                              <RadioGroup.Item value='CHECK IN' />
                              <Text>CHECK IN</Text>
                            </label>
                          </Flex>
                        </Flex>
                      </RadioGroup.Root>
                    )}
                  />
                </Box>
                <Text className='print:only'>{watch('pickupType')}</Text>
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>{`${selectedPickupType} time`}</th>
              <td className={styles['info-td']} colSpan={3}>
                <Box className='print:hidden'>
                  <TimeInput name='locationTime' control={control} />
                </Box>
                <Text className='print:only'>{watch('locationTime') || '-'}</Text>
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>{`${selectedPickupType} location`}</th>
              <td className={styles['info-td']} colSpan={3}>
                <Box className='print:hidden'>
                  <Controller
                    name='pickupLocation'
                    control={control}
                    render={({ field }) => (
                      <Tiptap
                        value={field.value}
                        onChange={field.onChange}
                        enableImage
                        height='min-h-[220px]'
                        placeholder='위치 안내를 입력하세요. 텍스트와 이미지 첨부가 가능합니다.'
                      />
                    )}
                  />
                </Box>
                <Box
                  className='print:only'
                  style={{ wordBreak: 'break-word' }}
                  dangerouslySetInnerHTML={{ __html: watch('pickupLocation') || '-' }}
                />
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>liability waiver</th>
              <td className={styles['info-td']} colSpan={3}>
                <Box className='print:hidden'>
                  <Controller
                    name='liabilityWaiverUrl'
                    control={control}
                    rules={{
                      required: '면책동의서 URL은 필수입니다.',
                      pattern: {
                        value: /^https?:\/\/\S+$/i,
                        message: '올바른 URL 형식을 입력해주세요.'
                      }
                    }}
                    render={({ field }) => (
                      <TextField.Root
                        {...field}
                        type='url'
                        placeholder='https://example.com/waiver'
                        color={errors.liabilityWaiverUrl ? 'red' : undefined}
                      />
                    )}
                  />
                  {errors.liabilityWaiverUrl && (
                    <Text color='red' mt='1'>
                      {errors.liabilityWaiverUrl.message}
                    </Text>
                  )}
                </Box>
                <Text className='print:only' style={{ wordBreak: 'break-all' }}>
                  {watch('liabilityWaiverUrl') || '-'}
                </Text>
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
          <Button size='4' color='gray' onClick={() => window.print()}>
            인쇄 / PDF 다운로드
          </Button>
        </Flex>
      </Section>
    </Box>
  );
}
