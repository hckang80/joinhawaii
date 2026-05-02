import type { ReservationResponse } from '@/types';
import { Box, Flex, Heading, Section, Text } from '@radix-ui/themes';
import styles from './preview-table.module.css';

type ReservationConfirmationPreviewProps = {
  data: ReservationResponse;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
}

export function ReservationConfirmationPreview({ data }: ReservationConfirmationPreviewProps) {
  const flights = data.products?.flights ?? [];
  const hotels = data.products?.hotels ?? [];
  const tours = data.products?.tours ?? [];
  const rentalCars = data.products?.rental_cars ?? [];
  const insurances = data.products?.insurances ?? [];

  return (
    <Box>
      <Flex justify='center'>
        <Heading as='h2' mb='3' size='7'>
          예약확인서
        </Heading>
      </Flex>

      <Section size='1'>
        <Heading as='h3' mb='2'>
          기본정보
        </Heading>
        <table className={styles.table}>
          <tbody>
            <tr>
              <th className={styles.th}>발행일</th>
              <td className={styles.td}>
                {data.created_at ? new Date(data.created_at).toLocaleDateString() : '-'}
              </td>
              <th className={styles.th}>담당자</th>
              <td className={styles.td}>{data.author || '-'}</td>
            </tr>
            <tr>
              <th className={styles.th}>업체구분</th>
              <td className={styles.td}>{data.booking_platform || '-'}</td>
              <th className={styles.th}>여행종류</th>
              <td className={styles.td}>{data.trip_type || '-'}</td>
            </tr>
            <tr>
              <th className={styles.th}>구분</th>
              <td className={styles.td}>{data.travel_category || '-'}</td>
              <th className={styles.th}>예약구분</th>
              <td className={styles.td}>{data.reservation_id || '-'}</td>
            </tr>
            <tr>
              <th className={styles.th}>여행일정</th>
              <td colSpan={3} className={styles.td}>
                {data.start_date || '-'} ~ {data.end_date || '-'}
                {data.nights ? ` (${data.nights}박` : ''}
                {data.days ? ` ${data.days}일)` : data.nights ? ')' : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section size='1'>
        <Heading as='h3' mb='2'>
          고객정보
        </Heading>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>이름</th>
              <th className={styles.th}>영문</th>
              <th className={styles.th}>연락처</th>
              <th className={styles.th}>이메일</th>
            </tr>
          </thead>
          <tbody>
            {data.clients?.map((client, idx) => (
              <tr key={idx}>
                <td className={styles.td}>{client.korean_name}</td>
                <td className={styles.td}>{client.english_name}</td>
                <td className={styles.td}>{client.phone_number}</td>
                <td className={styles.td}>{client.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {flights.length > 0 && (
        <Section size='1'>
          <Heading as='h3' mb='2'>
            항공정보
          </Heading>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>항공편</th>
                <th className={styles.th}>출발시간</th>
                <th className={styles.th}>출발지</th>
                <th className={styles.th}>도착시간</th>
                <th className={styles.th}>도착지</th>
                <th className={styles.th}>비고</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((flight, idx) => (
                <tr key={flight.id ?? idx}>
                  <td className={styles.td}>{flight.flight_number || '-'}</td>
                  <td className={styles.td}>{formatDateTime(flight.departure_datetime)}</td>
                  <td className={styles.td}>{flight.departure_city || '-'}</td>
                  <td className={styles.td}>{formatDateTime(flight.arrival_datetime)}</td>
                  <td className={styles.td}>{flight.arrival_city || '-'}</td>
                  <td className={styles.td}>{flight.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {hotels.length > 0 && (
        <Section size='1'>
          <Heading as='h3' mb='2'>
            호텔
          </Heading>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>지역</th>
                <th className={styles.th}>체크인</th>
                <th className={styles.th}>체크아웃</th>
                <th className={styles.th}>숙박일</th>
                <th className={styles.th}>호텔명</th>
                <th className={styles.th}>객실타입</th>
                <th className={styles.th}>조식</th>
                <th className={styles.th}>리조트피</th>
                <th className={styles.th}>비고</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((hotel, idx) => (
                <tr key={hotel.id ?? idx}>
                  <td className={styles.td}>{hotel.region || '-'}</td>
                  <td className={styles.td}>{formatDate(hotel.check_in_date)}</td>
                  <td className={styles.td}>{formatDate(hotel.check_out_date)}</td>
                  <td className={styles.td}>{hotel.nights ?? '-'}박</td>
                  <td className={styles.td}>{hotel.hotel_name || '-'}</td>
                  <td className={styles.td}>
                    {[hotel.room_type, hotel.bed_type].filter(Boolean).join(' / ') || '-'}
                  </td>
                  <td className={styles.td}>{hotel.is_breakfast_included ? '포함' : '미포함'}</td>
                  <td className={styles.td}>
                    {hotel.resort_fee_type === 'INCLUSION'
                      ? '포함'
                      : hotel.resort_fee_type === 'EXCLUSION'
                        ? '불포함'
                        : hotel.resort_fee_type === 'NO RESORT FEE'
                          ? '없음'
                          : '-'}
                  </td>
                  <td className={styles.td}>{hotel.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {tours.length > 0 && (
        <Section size='1'>
          <Heading as='h3' mb='2'>
            선택관광
          </Heading>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>지역</th>
                <th className={styles.th}>시작일시</th>
                <th className={styles.th}>종료일시</th>
                <th className={styles.th}>상품명</th>
                <th className={styles.th}>비고</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour, idx) => (
                <tr key={tour.id ?? idx}>
                  <td className={styles.td}>{tour.region || '-'}</td>
                  <td className={styles.td}>{formatDateTime(tour.start_date)}</td>
                  <td className={styles.td}>{formatDateTime(tour.end_date)}</td>
                  <td className={styles.td}>{tour.name || '-'}</td>
                  <td className={styles.td}>{tour.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {rentalCars.length > 0 && (
        <Section size='1'>
          <Heading as='h3' mb='2'>
            렌터카
          </Heading>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>지역</th>
                <th className={styles.th}>픽업일시</th>
                <th className={styles.th}>픽업장소</th>
                <th className={styles.th}>반납일시</th>
                <th className={styles.th}>반납장소</th>
                <th className={styles.th}>차종</th>
                <th className={styles.th}>대여일</th>
                <th className={styles.th}>비고</th>
              </tr>
            </thead>
            <tbody>
              {rentalCars.map((car, idx) => (
                <tr key={car.id ?? idx}>
                  <td className={styles.td}>{car.region || '-'}</td>
                  <td className={styles.td}>{formatDateTime(car.pickup_date)}</td>
                  <td className={styles.td}>{car.pickup_location || '-'}</td>
                  <td className={styles.td}>{formatDateTime(car.return_date)}</td>
                  <td className={styles.td}>{car.return_location || '-'}</td>
                  <td className={styles.td}>{car.model || '-'}</td>
                  <td className={styles.td}>{car.rental_days ?? '-'}일</td>
                  <td className={styles.td}>{car.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {insurances.length > 0 && (
        <Section size='1'>
          <Heading as='h3' mb='2'>
            보험
          </Heading>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>보험사</th>
                <th className={styles.th}>시작일</th>
                <th className={styles.th}>종료일</th>
                <th className={styles.th}>여행일수</th>
                <th className={styles.th}>비고</th>
              </tr>
            </thead>
            <tbody>
              {insurances.map((insurance, idx) => (
                <tr key={insurance.id ?? idx}>
                  <td className={styles.td}>{insurance.company || '-'}</td>
                  <td className={styles.td}>{formatDate(insurance.start_date)}</td>
                  <td className={styles.td}>{formatDate(insurance.end_date)}</td>
                  <td className={styles.td}>{insurance.days ?? '-'}일</td>
                  <td className={styles.td}>{insurance.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      <Flex justify='center'>
        <Text color='gray'>본 예약확인서는 여행상품 예약을 증명하는 용도로만 사용됩니다.</Text>
      </Flex>
    </Box>
  );
}
