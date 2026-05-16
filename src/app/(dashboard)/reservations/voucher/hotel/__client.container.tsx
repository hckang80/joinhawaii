'use client';

import { reservationQueryOptions } from '@/lib/queries';
import type { Hotel, ReservationResponse } from '@/types';
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
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import styles from './voucher.module.css';

type VoucherHotelClientContainerProps = {
  reservationId: string;
  hotelId?: string;
  index?: string;
};

type VoucherFormState = {
  guestName: string;
  hotelName: string;
  roomCategory: string;
  bedType: string;
  stayPeriod: string;
  nightsText: string;
  breakfastText: string;
  resortFeeText: string;
  confirmationNumber: string;
  deliveryNotes: string;
  guideNotes: string;
  cancellationPolicy: string;
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

function buildStayPeriod(hotel: Hotel | undefined) {
  if (!hotel) return '-';
  const checkIn = hotel.check_in_date || '-';
  const checkOut = hotel.check_out_date || '-';
  return `${checkIn} ~ ${checkOut}`;
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

  const [form, setForm] = useState<VoucherFormState>(() => ({
    guestName: data?.main_client_name || '',
    hotelName: selectedHotel?.hotel_name || '',
    roomCategory: selectedHotel?.room_type || '',
    bedType: selectedHotel?.bed_type || '',
    stayPeriod: buildStayPeriod(selectedHotel),
    nightsText: selectedHotel?.nights ? `${selectedHotel.nights}박` : '-',
    breakfastText: selectedHotel?.is_breakfast_included ? '포함' : '미포함',
    resortFeeText:
      selectedHotel?.resort_fee_type === 'INCLUSION'
        ? '포함'
        : selectedHotel?.resort_fee_type === 'EXCLUSION'
          ? '불포함'
          : selectedHotel?.resort_fee_type === 'NO RESORT FEE'
            ? '없음'
            : '-',
    confirmationNumber: '',
    deliveryNotes: selectedHotel?.notes || '',
    guideNotes: selectedHotel?.remarks || '',
    cancellationPolicy: selectedHotel?.rule || ''
  }));

  useEffect(() => {
    setForm({
      guestName: data?.main_client_name || '',
      hotelName: selectedHotel?.hotel_name || '',
      roomCategory: selectedHotel?.room_type || '',
      bedType: selectedHotel?.bed_type || '',
      stayPeriod: buildStayPeriod(selectedHotel),
      nightsText: selectedHotel?.nights ? `${selectedHotel.nights}박` : '-',
      breakfastText: selectedHotel?.is_breakfast_included ? '포함' : '미포함',
      resortFeeText:
        selectedHotel?.resort_fee_type === 'INCLUSION'
          ? '포함'
          : selectedHotel?.resort_fee_type === 'EXCLUSION'
            ? '불포함'
            : selectedHotel?.resort_fee_type === 'NO RESORT FEE'
              ? '없음'
              : '-',
      confirmationNumber: '',
      deliveryNotes: selectedHotel?.notes || '',
      guideNotes: selectedHotel?.remarks || '',
      cancellationPolicy: selectedHotel?.rule || ''
    });
  }, [data?.main_client_name, selectedHotel]);

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
            <label>
              <Text as='div' size='2' mb='1'>
                투숙객명
              </Text>
              <TextField.Root
                value={form.guestName}
                onChange={e => setForm(prev => ({ ...prev, guestName: e.target.value }))}
              />
            </label>
            <label>
              <Text as='div' size='2' mb='1'>
                호텔명
              </Text>
              <TextField.Root
                value={form.hotelName}
                onChange={e => setForm(prev => ({ ...prev, hotelName: e.target.value }))}
              />
            </label>
            <label>
              <Text as='div' size='2' mb='1'>
                room category
              </Text>
              <TextField.Root
                value={form.roomCategory}
                onChange={e => setForm(prev => ({ ...prev, roomCategory: e.target.value }))}
              />
            </label>
            <label>
              <Text as='div' size='2' mb='1'>
                bed type
              </Text>
              <TextField.Root
                value={form.bedType}
                onChange={e => setForm(prev => ({ ...prev, bedType: e.target.value }))}
              />
            </label>
            <label>
              <Text as='div' size='2' mb='1'>
                투숙기간
              </Text>
              <TextField.Root
                value={form.stayPeriod}
                onChange={e => setForm(prev => ({ ...prev, stayPeriod: e.target.value }))}
              />
            </label>
            <label>
              <Text as='div' size='2' mb='1'>
                night
              </Text>
              <TextField.Root
                value={form.nightsText}
                onChange={e => setForm(prev => ({ ...prev, nightsText: e.target.value }))}
              />
            </label>
            <label>
              <Text as='div' size='2' mb='1'>
                breakfast
              </Text>
              <TextField.Root
                value={form.breakfastText}
                onChange={e => setForm(prev => ({ ...prev, breakfastText: e.target.value }))}
              />
            </label>
            <label>
              <Text as='div' size='2' mb='1'>
                resort fee
              </Text>
              <TextField.Root
                value={form.resortFeeText}
                onChange={e => setForm(prev => ({ ...prev, resortFeeText: e.target.value }))}
              />
            </label>
            <label>
              <Text as='div' size='2' mb='1'>
                confirmation number
              </Text>
              <TextField.Root
                value={form.confirmationNumber}
                onChange={e => setForm(prev => ({ ...prev, confirmationNumber: e.target.value }))}
              />
            </label>
            <label>
              <Text as='div' size='2' mb='1'>
                전달사항
              </Text>
              <TextArea
                value={form.deliveryNotes}
                onChange={e => setForm(prev => ({ ...prev, deliveryNotes: e.target.value }))}
              />
            </label>
            <label>
              <Text as='div' size='2' mb='1'>
                안내사항
              </Text>
              <TextArea
                value={form.guideNotes}
                onChange={e => setForm(prev => ({ ...prev, guideNotes: e.target.value }))}
              />
            </label>
            <label>
              <Text as='div' size='2' mb='1'>
                취소규정
              </Text>
              <TextArea
                value={form.cancellationPolicy}
                onChange={e => setForm(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
              />
            </label>
          </Flex>
        </Card>

        <Card className='voucher-preview-card'>
          <Section size='1'>
            <Heading as='h3' size='4' mb='3'>
              HOTEL VOUCHER
            </Heading>
            <Flex direction='column' gap='2'>
              <Text>예약번호: {data?.reservation_id || '-'}</Text>
              <Text>투숙객명: {form.guestName || '-'}</Text>
              <table className={styles['info-table']}>
                <tbody>
                  <tr>
                    <th className={styles['info-th']}>hotel</th>
                    <td className={styles['info-td']} colSpan={3}>
                      {form.hotelName || '-'}
                    </td>
                  </tr>
                  <tr>
                    <th className={styles['info-th']}>period</th>
                    <td className={styles['info-td']}>{form.stayPeriod || '-'}</td>
                    <th className={styles['info-th']}>night</th>
                    <td className={styles['info-td']}>{form.nightsText || '-'}</td>
                  </tr>
                  <tr>
                    <th className={styles['info-th']}>room category</th>
                    <td className={styles['info-td']} colSpan={3}>
                      {form.roomCategory || '-'}
                    </td>
                  </tr>
                  <tr>
                    <th className={styles['info-th']}>bed type</th>
                    <td className={styles['info-td']} colSpan={3}>
                      {form.bedType || '-'}
                    </td>
                  </tr>
                  <tr>
                    <th className={styles['info-th']}>breakfast</th>
                    <td className={styles['info-td']}>{form.breakfastText || '-'}</td>
                    <th className={styles['info-th']}>resort fee</th>
                    <td className={styles['info-td']}>{form.resortFeeText || '-'}</td>
                  </tr>
                  <tr>
                    <th className={styles['info-th']}>confirmation number</th>
                    <td className={styles['info-td']} colSpan={3}>
                      {form.confirmationNumber || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
              <Separator size='4' />
              <Text weight='bold'>✅ 전달사항</Text>
              <Text>{form.deliveryNotes || '-'}</Text>
              <Text weight='bold'>✅ 안내사항</Text>
              <Text>{form.guideNotes || '-'}</Text>
              <Text weight='bold' color='red'>
                ✅ 취소규정
              </Text>
              <Text color='red'>{form.cancellationPolicy || '-'}</Text>
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
