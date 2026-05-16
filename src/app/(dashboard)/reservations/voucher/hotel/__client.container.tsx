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

type VoucherHotelClientContainerProps = {
  reservationId: string;
  hotelId?: string;
  index?: string;
};

type VoucherFormState = {
  guestName: string;
  hotelName: string;
  roomType: string;
  stayPeriod: string;
  nightsText: string;
  voucherMemo: string;
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

  const selectedHotel = useMemo(() => getSelectedHotel(data, hotelId, index), [data, hotelId, index]);

  const [form, setForm] = useState<VoucherFormState>(() => ({
    guestName: data?.main_client_name || '',
    hotelName: selectedHotel?.hotel_name || '',
    roomType: [selectedHotel?.room_type, selectedHotel?.bed_type].filter(Boolean).join(' / '),
    stayPeriod: buildStayPeriod(selectedHotel),
    nightsText: selectedHotel?.nights ? `${selectedHotel.nights}박` : '-',
    voucherMemo: selectedHotel?.notes || ''
  }));

  useEffect(() => {
    setForm({
      guestName: data?.main_client_name || '',
      hotelName: selectedHotel?.hotel_name || '',
      roomType: [selectedHotel?.room_type, selectedHotel?.bed_type].filter(Boolean).join(' / '),
      stayPeriod: buildStayPeriod(selectedHotel),
      nightsText: selectedHotel?.nights ? `${selectedHotel.nights}박` : '-',
      voucherMemo: selectedHotel?.notes || ''
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
    <Box width='1100px' mx='auto'>
      <Flex justify='between' align='center' mb='4' className='print:hidden'>
        <Heading as='h2' size='6'>
          호텔 바우처 발급
        </Heading>
        <Button size='3' onClick={() => window.print()}>
          인쇄 / PDF 저장
        </Button>
      </Flex>

      <Grid columns={{ initial: '1', md: '2' }} gap='4'>
        <Card>
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
                객실정보
              </Text>
              <TextField.Root
                value={form.roomType}
                onChange={e => setForm(prev => ({ ...prev, roomType: e.target.value }))}
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
                숙박일수
              </Text>
              <TextField.Root
                value={form.nightsText}
                onChange={e => setForm(prev => ({ ...prev, nightsText: e.target.value }))}
              />
            </label>
            <label>
              <Text as='div' size='2' mb='1'>
                전달 메모
              </Text>
              <TextArea
                value={form.voucherMemo}
                onChange={e => setForm(prev => ({ ...prev, voucherMemo: e.target.value }))}
              />
            </label>
          </Flex>
        </Card>

        <Card>
          <Section size='1'>
            <Heading as='h3' size='4' mb='3'>
              바우처 미리보기
            </Heading>
            <Flex direction='column' gap='2'>
              <Text weight='bold' size='5'>
                HOTEL VOUCHER
              </Text>
              <Separator size='4' />
              <Text>예약번호: {data?.reservation_id || '-'}</Text>
              <Text>투숙객명: {form.guestName || '-'}</Text>
              <Text>호텔명: {form.hotelName || '-'}</Text>
              <Text>객실정보: {form.roomType || '-'}</Text>
              <Text>투숙기간: {form.stayPeriod || '-'}</Text>
              <Text>숙박일수: {form.nightsText || '-'}</Text>
              <Separator size='4' />
              <Text>메모</Text>
              <Text>{form.voucherMemo || '-'}</Text>
            </Flex>
          </Section>
        </Card>
      </Grid>
    </Box>
  );
}
