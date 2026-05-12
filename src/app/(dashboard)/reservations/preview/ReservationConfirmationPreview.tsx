import type { AdditionalOptions, ReservationResponse } from '@/types';
import { toReadableAmount } from '@/utils';
import { Box, Flex, Grid, Heading, Section, Text } from '@radix-ui/themes';
import styles from './preview-table.module.css';

type ReservationConfirmationPreviewProps = {
  data: ReservationResponse;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return '';
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

function formatAdditionalOptions(value: AdditionalOptions[] | null | undefined) {
  if (!value?.length) return '-';

  const labels = value.map(option => option.title.trim()).filter(Boolean);

  return labels.length ? labels.join(', ') : '-';
}

function formatClientTitle(data: ReservationResponse) {
  const clients = data.clients ?? [];
  const names = clients.map(client => client.korean_name?.trim()).filter(Boolean);

  if (!names.length) return '-';

  const mainClient = names.find(name => name === data.main_client_name?.trim()) ?? names[0];
  const orderedNames = [mainClient, ...names.filter(name => name !== mainClient)];

  if (orderedNames.length <= 2) {
    return `${orderedNames.join(', ')} 귀하`;
  }

  return `${orderedNames[0]} 외 ${orderedNames.length - 1}인 귀하`;
}

export function ReservationConfirmationPreview({ data }: ReservationConfirmationPreviewProps) {
  const flights = (data.products?.flights ?? []).filter(product => product.status !== 'Refunded');
  const hotels = (data.products?.hotels ?? []).filter(product => product.status !== 'Refunded');
  const tours = (data.products?.tours ?? []).filter(product => product.status !== 'Refunded');
  const rentalCars = (data.products?.rental_cars ?? []).filter(
    product => product.status !== 'Refunded'
  );
  const insurances = (data.products?.insurances ?? []).filter(
    product => product.status !== 'Refunded'
  );

  return (
    <Box>
      <Flex justify='center'>
        <Heading as='h2' mb='3' size='7'>
          조인하와이 예약확인서
        </Heading>
      </Flex>

      <Section size='1'>
        <Flex justify='end' mb='1'>
          <Text size='4' weight='bold'>
            {formatClientTitle(data)}
          </Text>
        </Flex>

        <table className={styles.table}>
          <colgroup>
            <col style={{ width: '100px' }} />
            <col />
            <col style={{ width: '100px' }} />
            <col />
            <col style={{ width: '100px' }} />
            <col />
            <col style={{ width: '100px' }} />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <th className={styles.th}>발행일</th>
              <td className={styles.td}>
                {data.created_at ? new Date(data.created_at).toLocaleDateString() : '-'}
              </td>
              <th className={styles.th}>담당자</th>
              <td className={styles.td} colSpan={2}>
                {data.author || '-'} / {'02-402-1040'}
              </td>
              <th className={styles.th}>email</th>
              <td className={styles.td} colSpan={2}>
                <a href='mailto:joinhawaii@joinhawaii.com'>joinhawaii@joinhawaii.com</a>
              </td>
            </tr>
            <tr>
              <th className={styles.th}>여행종류</th>
              <td className={styles.td} colSpan={4}>
                {[data.trip_type, `성인${data.clients?.length ?? 0}명`].filter(Boolean).join(' / ')}
              </td>
              <th className={styles.th}>여행일정</th>
              <td className={styles.td} colSpan={2}>
                {data.start_date ? formatDate(data.start_date) : '-'} ~{' '}
                {data.end_date ? formatDate(data.end_date) : '-'}
                {data.nights && data.days ? ` (${data.nights}박 ${data.days}일)` : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

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
            <colgroup>
              <col width='100px' />
              <col width='160px' />
              <col />
              <col width='160px' />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th className={styles.th}>항공편</th>
                <th className={styles.th}>출발시간</th>
                <th className={styles.th}>출발지</th>
                <th className={styles.th}>도착시간</th>
                <th className={styles.th}>도착지</th>
              </tr>
            </thead>
            {flights.map((flight, idx) => (
              <tbody key={flight.id ?? idx}>
                <tr>
                  <td className={styles.td}>{flight.flight_number || '-'}</td>
                  <td className={styles.td}>{formatDateTime(flight.departure_datetime)}</td>
                  <td className={styles.td}>{flight.departure_city || '-'}</td>
                  <td className={styles.td}>{formatDateTime(flight.arrival_datetime)}</td>
                  <td className={styles.td}>{flight.arrival_city || '-'}</td>
                </tr>
                {(flight.rule || flight.remarks) && (
                  <tr>
                    <td className={styles.td} colSpan={5}>
                      <Grid columns='1' gap='1'>
                        {flight.rule && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              비고:
                            </Text>
                            <Text size='2' color='blue'>
                              {flight.rule}
                            </Text>
                          </Flex>
                        )}
                        {flight.remarks && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              규정:
                            </Text>
                            <Text size='2' color='red'>
                              {flight.remarks}
                            </Text>
                          </Flex>
                        )}
                      </Grid>
                    </td>
                  </tr>
                )}
              </tbody>
            ))}
          </table>
        </Section>
      )}

      {hotels.length > 0 && (
        <Section size='1'>
          <Heading as='h3' mb='2'>
            호텔
          </Heading>
          <table className={styles.table}>
            <colgroup>
              <col width='80px' />
              <col width='200px' />
              <col width='60px' />
              <col />
              <col width='70px' />
              <col width='70px' />
              <col width='100px' />
            </colgroup>
            <thead>
              <tr>
                <th className={styles.th}>지역</th>
                <th className={styles.th}>날짜</th>
                <th className={styles.th}>숙박일</th>
                <th className={styles.th}>호텔</th>
                <th className={styles.th}>조식</th>
                <th className={styles.th}>리조트피</th>
                <th className={styles.th}>합계</th>
              </tr>
            </thead>
            {hotels.map((hotel, idx) => (
              <tbody key={hotel.id ?? idx}>
                <tr>
                  <td className={styles.td}>{hotel.region || '-'}</td>
                  <td className={styles.td}>
                    {[formatDate(hotel.check_in_date), formatDate(hotel.check_out_date)]
                      .filter(Boolean)
                      .join(' ~ ')}
                  </td>
                  <td className={styles.td}>{hotel.nights ?? '-'}박</td>
                  <td className={styles.td}>
                    {[
                      hotel.hotel_name,
                      [hotel.room_type, hotel.bed_type].filter(Boolean).join(' / ')
                    ]
                      .filter(Boolean)
                      .join(' > ')}
                    {hotel.additional_options.length > 0 && (
                      <Text as='div' size='1'>
                        {formatAdditionalOptions(hotel.additional_options)}
                      </Text>
                    )}
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
                  <td className={styles.td}>{toReadableAmount(hotel.total_amount)}</td>
                </tr>
                {(hotel.rule || hotel.remarks) && (
                  <tr>
                    <td className={styles.td} colSpan={7}>
                      <Grid columns='1' gap='1'>
                        {hotel.rule && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              비고:
                            </Text>
                            <Text size='2' color='blue'>
                              {hotel.rule}
                            </Text>
                          </Flex>
                        )}
                        {hotel.remarks && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              규정:
                            </Text>
                            <Text size='2' color='red'>
                              {hotel.remarks}
                            </Text>
                          </Flex>
                        )}
                      </Grid>
                    </td>
                  </tr>
                )}
              </tbody>
            ))}
          </table>
        </Section>
      )}

      {tours.length > 0 && (
        <Section size='1'>
          <Heading as='h3' mb='2'>
            선택관광
          </Heading>
          <table className={styles.table}>
            <colgroup>
              <col width='80px' />
              <col width='160px' />
              <col />
              <col width='100px' />
            </colgroup>
            <thead>
              <tr>
                <th className={styles.th}>지역</th>
                <th className={styles.th}>날짜</th>
                <th className={styles.th}>상품명</th>
                <th className={styles.th}>합계</th>
              </tr>
            </thead>
            {tours.map((tour, idx) => (
              <tbody key={tour.id ?? idx}>
                <tr>
                  <td className={styles.td}>{tour.region || '-'}</td>
                  <td className={styles.td}>
                    {[formatDateTime(tour.start_date), formatDateTime(tour.end_date)]
                      .filter(Boolean)
                      .join(' ~ ')}
                  </td>
                  <td className={styles.td}>
                    {tour.name || '-'}
                    {tour.additional_options.length > 0 && (
                      <Text as='div' size='1'>
                        {formatAdditionalOptions(tour.additional_options)}
                      </Text>
                    )}
                  </td>
                  <td className={styles.td}>{toReadableAmount(tour.total_amount)}</td>
                </tr>
                {(tour.rule || tour.remarks) && (
                  <tr>
                    <td className={styles.td} colSpan={4}>
                      <Grid columns='1' gap='1'>
                        {tour.rule && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              비고:
                            </Text>
                            <Text size='2' color='blue'>
                              {tour.rule}
                            </Text>
                          </Flex>
                        )}
                        {tour.remarks && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              규정:
                            </Text>
                            <Text size='2' color='red'>
                              {tour.remarks}
                            </Text>
                          </Flex>
                        )}
                      </Grid>
                    </td>
                  </tr>
                )}
              </tbody>
            ))}
          </table>
        </Section>
      )}

      {rentalCars.length > 0 && (
        <Section size='1'>
          <Heading as='h3' mb='2'>
            렌터카
          </Heading>
          <table className={styles.table}>
            <colgroup>
              <col width='80px' />
              <col width='240px' />
              <col width='240px' />
              <col />
              <col width='80px' />
              <col width='60px' />
              <col width='60px' />
              <col width='100px' />
            </colgroup>
            <thead>
              <tr>
                <th className={styles.th}>지역</th>
                <th className={styles.th}>픽업장소/시간</th>
                <th className={styles.th}>반납장소/시간</th>
                <th className={styles.th}>차종</th>
                <th className={styles.th}>운전자</th>
                <th className={styles.th}>조건</th>
                <th className={styles.th}>대여일</th>
                <th className={styles.th}>합계</th>
              </tr>
            </thead>
            {rentalCars.map((car, idx) => (
              <tbody key={car.id ?? idx}>
                <tr>
                  <td className={styles.td}>{car.region || '-'}</td>
                  <td className={styles.td} style={{ whiteSpace: 'pre-line' }}>
                    {[car.pickup_location, formatDateTime(car.pickup_date)]
                      .filter(Boolean)
                      .join('\n')}
                  </td>
                  <td className={styles.td} style={{ whiteSpace: 'pre-line' }}>
                    {[car.return_location, formatDateTime(car.return_date)]
                      .filter(Boolean)
                      .join('\n')}
                  </td>
                  <td className={styles.td}>
                    {car.model || '-'}
                    {car.additional_options.length > 0 && (
                      <Text as='div' size='1'>
                        {formatAdditionalOptions(car.additional_options)}
                      </Text>
                    )}
                  </td>
                  <td className={styles.td}>{car.driver || '-'}</td>
                  <td className={styles.td}>{car.options || '-'}</td>
                  <td className={styles.td}>{car.rental_days ?? '-'}일</td>
                  <td className={styles.td}>{toReadableAmount(car.total_amount)}</td>
                </tr>
                {(car.rule || car.remarks) && (
                  <tr>
                    <td className={styles.td} colSpan={8}>
                      <Grid columns='1' gap='1'>
                        {car.rule && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              비고:
                            </Text>
                            <Text size='2' color='blue'>
                              {car.rule}
                            </Text>
                          </Flex>
                        )}
                        {car.remarks && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              규정:
                            </Text>
                            <Text size='2' color='red'>
                              {car.remarks}
                            </Text>
                          </Flex>
                        )}
                      </Grid>
                    </td>
                  </tr>
                )}
              </tbody>
            ))}
          </table>
        </Section>
      )}

      {insurances.length > 0 && (
        <Section size='1'>
          <Heading as='h3' mb='2'>
            보험
          </Heading>
          <table className={styles.table}>
            <colgroup>
              <col width='100px' />
              <col width='200px' />
              <col />
              <col width='100px' />
            </colgroup>
            <thead>
              <tr>
                <th className={styles.th}>보험사</th>
                <th className={styles.th}>기간</th>
                <th className={styles.th}>추가옵션</th>
                <th className={styles.th}>합계</th>
              </tr>
            </thead>
            {insurances.map((insurance, idx) => (
              <tbody key={insurance.id ?? idx}>
                <tr>
                  <td className={styles.td}>{insurance.company || '-'}</td>
                  <td className={styles.td}>
                    {[formatDate(insurance.start_date), formatDate(insurance.end_date)]
                      .filter(Boolean)
                      .join(' ~ ')}
                  </td>
                  <td className={styles.td}>
                    {formatAdditionalOptions(insurance.additional_options)}
                  </td>
                  <td className={styles.td}>{toReadableAmount(insurance.total_amount)}</td>
                </tr>
                {(insurance.rule || insurance.remarks) && (
                  <tr>
                    <td className={styles.td} colSpan={4}>
                      <Grid columns='1' gap='1'>
                        {insurance.rule && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              비고:
                            </Text>
                            <Text size='2' color='blue'>
                              {insurance.rule}
                            </Text>
                          </Flex>
                        )}
                        {insurance.remarks && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              규정:
                            </Text>
                            <Text size='2' color='red'>
                              {insurance.remarks}
                            </Text>
                          </Flex>
                        )}
                      </Grid>
                    </td>
                  </tr>
                )}
              </tbody>
            ))}
          </table>
        </Section>
      )}

      <Flex justify='center'>
        <Text color='gray'>본 예약확인서는 여행상품 예약을 증명하는 용도로만 사용됩니다.</Text>
      </Flex>
    </Box>
  );
}
