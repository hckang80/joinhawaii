import type { AdditionalOptions, ReservationResponse } from '@/types';
import { toReadableAmount } from '@/utils';
import { Blockquote, Box, Flex, Grid, Heading, Section, Text } from '@radix-ui/themes';
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

function formatClientName(client: { korean_name: string; is_main_client: boolean }) {
  const { korean_name: name, is_main_client } = client;
  const label = is_main_client ? '(대표)' : '';
  return label ? `${name}${label}` : name;
}

function formatHotelStaySummary(hotels: ReservationResponse['products']['hotels'] = []) {
  const nightsByRegion = hotels.reduce<Record<string, number>>((acc, hotel) => {
    if (hotel.status === 'Refunded') return acc;

    const region = hotel.region?.trim() || '-';
    const nights = Number(hotel.nights ?? 0);

    acc[region] = (acc[region] ?? 0) + (Number.isFinite(nights) ? nights : 0);

    return acc;
  }, {});

  const summary = Object.entries(nightsByRegion)
    .filter(([, nights]) => nights > 0)
    .map(([region, nights]) => `${region} ${nights}박`)
    .join(' / ');

  return summary || '-';
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
          {`예약확인서 (${data.booking_platform})`}
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
            <col width='100px' />
            <col width='150px' />
            <col width='100px' />
            <col />
            <col width='100px' />
            <col width='300px' />
          </colgroup>
          <tbody>
            <tr>
              <th className={styles.th}>발행일</th>
              <td className={styles.td}>
                {data.created_at ? new Date(data.created_at).toLocaleDateString() : '-'}
              </td>
              <th className={styles.th}>담당자</th>
              <td className={styles.td}>
                {data.author || '-'} / {'02-402-1040'}
              </td>
              <th className={styles.th}>email</th>
              <td className={styles.td}>
                <a href='mailto:joinhawaii@joinhawaii.com'>joinhawaii@joinhawaii.com</a>
              </td>
            </tr>
            <tr>
              <th className={styles.th}>예약번호</th>
              <td className={styles.td}>{data.reservation_id || '-'}</td>
              <th className={styles.th}>여행종류</th>
              <td className={styles.td}>
                {[data.trip_type, `${data.clients?.length ?? 0}명`].filter(Boolean).join(' / ')}
              </td>
              <th className={styles.th}>여행일정</th>
              <td className={styles.td}>
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
          고객정보
        </Heading>
        <table className={styles.table}>
          <colgroup>
            <col width='140px' />
            <col width='200px' />
            <col width='60px' />
            <col width='180px' />
            <col width='160px' />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th className={styles.th}>이름</th>
              <th className={styles.th}>영문</th>
              <th className={styles.th}>성별</th>
              <th className={styles.th}>주민번호</th>
              <th className={styles.th}>연락처</th>
              <th className={styles.th}>이메일</th>
            </tr>
          </thead>
          <tbody>
            {data.clients?.map((client, idx) => (
              <tr key={idx}>
                <td className={styles.td}>{formatClientName(client)}</td>
                <td className={styles.td}>{client.english_name}</td>
                <td className={styles.td}>{client.gender}</td>
                <td className={styles.td}>{client.resident_id}</td>
                <td className={styles.td}>{client.phone_number}</td>
                <td className={styles.td}>{client.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section size='1'>
        <Heading as='h3' mb='2'>
          결제사항
        </Heading>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>예약금</th>
              <th className={styles.th}>입금액</th>
              <th className={styles.th}>잔금</th>
              <th className={styles.th}>총액(원화)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.td}>
                <Text weight='bold' size='4' color='red'>
                  {toReadableAmount(Number(data?.reservation_fee), 'ko-KR', 'KRW')}
                </Text>
              </td>
              <td className={styles.td}>{toReadableAmount(Number(data?.deposit ?? 0))}</td>
              <td className={styles.td}>
                {toReadableAmount(Number(data?.total_amount ?? 0) - (Number(data?.deposit) || 0))}
              </td>
              <td className={styles.td}>
                {toReadableAmount(Number(data?.total_amount ?? 0))}
                {`(${toReadableAmount(Number(data?.total_amount_krw ?? 0), 'ko-KR', 'KRW')})`}
              </td>
            </tr>
            <tr>
              <td className={styles.td} colSpan={4}>
                {data.clients?.length}인기준(상세내역은 하단참조) {formatHotelStaySummary(hotels)}
              </td>
            </tr>
            <tr>
              <td className={styles.td} colSpan={4}>
                신한은행 110-341-818 061 예금주 :조인하와이 김홍석
                <br />
                환율은 예약금 / 잔금 지불시점의 매입환율 기준입니다.
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {flights.length > 0 && (
        <Section size='1'>
          <Heading as='h3' mb='2'>
            항공
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
                {(flight.remarks || flight.rule) && (
                  <tr>
                    <td className={styles.td} colSpan={5}>
                      <Grid columns='1' gap='1'>
                        {flight.remarks && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              비고:
                            </Text>
                            <Text size='2' color='blue'>
                              {flight.remarks}
                            </Text>
                          </Flex>
                        )}
                        {flight.rule && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              규정:
                            </Text>
                            <Text size='2' color='red'>
                              {flight.rule}
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
                {(hotel.remarks || hotel.rule) && (
                  <tr>
                    <td className={styles.td} colSpan={7}>
                      <Grid columns='1' gap='1'>
                        {hotel.remarks && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              비고:
                            </Text>
                            <Text size='2' color='blue'>
                              {hotel.remarks}
                            </Text>
                          </Flex>
                        )}
                        {hotel.rule && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              규정:
                            </Text>
                            <Text size='2' color='red'>
                              {hotel.rule}
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
                {(tour.remarks || tour.rule) && (
                  <tr>
                    <td className={styles.td} colSpan={4}>
                      <Grid columns='1' gap='1'>
                        {tour.remarks && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              비고:
                            </Text>
                            <Text size='2' color='blue'>
                              {tour.remarks}
                            </Text>
                          </Flex>
                        )}
                        {tour.rule && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              규정:
                            </Text>
                            <Text size='2' color='red'>
                              {tour.rule}
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
                {(car.remarks || car.rule) && (
                  <tr>
                    <td className={styles.td} colSpan={8}>
                      <Grid columns='1' gap='1'>
                        {car.remarks && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              비고:
                            </Text>
                            <Text size='2' color='blue'>
                              {car.remarks}
                            </Text>
                          </Flex>
                        )}
                        {car.rule && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              규정:
                            </Text>
                            <Text size='2' color='red'>
                              {car.rule}
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
                {(insurance.remarks || insurance.rule) && (
                  <tr>
                    <td className={styles.td} colSpan={4}>
                      <Grid columns='1' gap='1'>
                        {insurance.remarks && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              비고:
                            </Text>
                            <Text size='2' color='blue'>
                              {insurance.remarks}
                            </Text>
                          </Flex>
                        )}
                        {insurance.rule && (
                          <Flex gap='2' align='center' wrap='nowrap'>
                            <Text size='2' weight='bold'>
                              규정:
                            </Text>
                            <Text size='2' color='red'>
                              {insurance.rule}
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

      <Blockquote>
        <Text as='p' weight='bold' size='2'>
          홈페이지 : www.joinhawaii.co.kr
        </Text>
        <Text as='p' weight='bold' size='2'>
          네이버 스마트 스토어 : https://smartstore.naver.com/joinhawaii
        </Text>
        <Text as='p' weight='bold' size='2'>
          네이버까페 착한하와이 : http://cafe.naver.com/goodhawaii
        </Text>
        <Text as='p' weight='bold' size='2'>
          카카오톡 ID : joinhawaii
        </Text>
        <br />
        <Text as='p' weight='bold'>
          <Text>조인하와이 하와이 (OPEN AM10:00~PM6:00)</Text>{' '}
          <Text color='red'>12월25일, 1월1일 휴무</Text>
        </Text>
        <Text as='p'>* 현지명 : JOINHAWAIIUSA T. 1 808 772 2691</Text>
        <Text as='p'>* 한국 연락사무소 연락처 T. 02 402 1040, 02 392 1044 F. 0303 0950 1044</Text>
      </Blockquote>
    </Box>
  );
}
