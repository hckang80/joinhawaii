import { CONTACT_NUMBER, PAYMENT_STATUS_COLOR, PaymentStatus } from '@/constants';
import type { AdditionalOptions, ReservationResponse } from '@/types';
import { jobTitles, toReadableAmount } from '@/utils';
import { Badge, Blockquote, Box, Flex, Grid, Heading, Section, Text } from '@radix-ui/themes';
import type { ReactNode } from 'react';
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

function formatClientTitle(data: ReservationResponse): ReactNode {
  const clients = data.clients ?? [];
  const names = clients.map(client => client.korean_name?.trim()).filter(Boolean);

  if (!names.length) return '-';

  const mainClient = names.find(name => name === data.main_client_name?.trim()) ?? names[0];
  const orderedNames = [mainClient, ...names.filter(name => name !== mainClient)];

  if (orderedNames.length <= 2) {
    return (
      <>
        <Text as='span' size='4' weight='bold'>
          {orderedNames.join(', ')}
        </Text>
        <Text as='span'>님 귀하</Text>
      </>
    );
  }

  return (
    <>
      <Text as='span' size='4' weight='bold'>
        {`${orderedNames[0]}님`}
      </Text>
      <Text as='span'>{` 외 ${orderedNames.length - 1}인 귀하`}</Text>
    </>
  );
}

function formatClientName(client: { korean_name: string; is_main_client: boolean }) {
  const { korean_name: name, is_main_client } = client;
  const label = is_main_client ? '(대표)' : '';
  return label ? `${name}${label}` : name;
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
        <Flex justify='end' align='end' gap='1' mb='1'>
          {formatClientTitle(data)}
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
                {[data.author, jobTitles(data.author_email)].filter(Boolean).join(' ')} /{' '}
                {CONTACT_NUMBER}
              </td>
              <th className={styles.th}>이메일</th>
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
          고객 정보
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
              <th className={styles.th}>생년월일</th>
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
        <Flex asChild justify='between' align='center' gap='1' mb='2'>
          <header>
            <Heading as='h3'>결제 정보</Heading>
            <Badge size='3' color={PAYMENT_STATUS_COLOR[data.payment_status]} variant='soft'>
              {PaymentStatus[data.payment_status]}
            </Badge>
          </header>
        </Flex>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>예약금</th>
              <th className={styles.th}>입금액 &#36;</th>
              <th className={styles.th}>잔금 &#36;</th>
              <th className={styles.th}>총액 &#8361;</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.td} align='right'>
                <Text weight='bold' size='4' color='red'>
                  {toReadableAmount(Number(data?.reservation_fee), 'ko-KR', 'KRW')}
                </Text>
              </td>
              <td className={styles.td} align='right'>
                {toReadableAmount(Number(data?.deposit ?? 0))}
              </td>
              <td className={styles.td} align='right'>
                {toReadableAmount(Number(data?.total_amount ?? 0) - (Number(data?.deposit) || 0))}
              </td>
              <td className={styles.td} align='right'>
                {toReadableAmount(Number(data?.total_amount ?? 0))}
                {`(${toReadableAmount(Number(data?.total_amount_krw ?? 0), 'ko-KR', 'KRW')})`}
              </td>
            </tr>
          </tbody>
        </table>

        <Box mt='4'>
          <Blockquote>
            예약 확인서는 계약서를 대신합니다. 아래 정보를 꼭 확인하시기 바랍니다.
            <br />
            신한은행 110-341-818-061 예금주: 조인하와이 김홍석
            <br />
            환율은 각 결제시점의 매입환율 기준입니다.
          </Blockquote>
        </Box>
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
                <th className={styles.th}>편명</th>
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
              <col />
              <col width='120px' />
              <col width='120px' />
              <col width='120px' />
              <col width='120px' />
            </colgroup>
            <thead>
              <tr>
                <th className={styles.th}>지역</th>
                <th className={styles.th}>호텔명</th>
                <th className={styles.th}>객실타입</th>
                <th className={styles.th}>베드타입</th>
                <th className={styles.th}>리조트피</th>
                <th className={styles.th}>조식</th>
              </tr>
            </thead>
            {hotels.map((hotel, idx) => (
              <tbody key={hotel.id ?? idx}>
                <tr>
                  <td className={styles.td} rowSpan={2}>
                    {hotel.region || '-'}
                  </td>
                  <td className={styles.td}>
                    {hotel.hotel_name || '-'}
                    {hotel.additional_options.length > 0 && (
                      <Text as='div' size='1'>
                        {formatAdditionalOptions(hotel.additional_options)}
                      </Text>
                    )}
                  </td>
                  <td className={styles.td}>{hotel.room_type || '-'}</td>
                  <td className={styles.td}>{hotel.bed_type || '-'}</td>
                  <td className={styles.td}>
                    {hotel.resort_fee_type === 'INCLUSION'
                      ? '포함'
                      : hotel.resort_fee_type === 'EXCLUSION'
                        ? '불포함'
                        : hotel.resort_fee_type === 'NO RESORT FEE'
                          ? '없음'
                          : '-'}
                  </td>
                  <td className={styles.td}>{hotel.is_breakfast_included ? '포함' : '미포함'}</td>
                </tr>
                <tr>
                  <td colSpan={5}>
                    <Box m='-1px'>
                      <table className={styles.table}>
                        <colgroup>
                          <col />
                          <col width='120px' />
                          <col width='120px' />
                          <col width='240px' />
                        </colgroup>
                        <thead>
                          <tr>
                            <th className={styles.th}>숙박기간</th>
                            <th className={styles.th}>1박 요금</th>
                            <th className={styles.th}>숙박일</th>
                            <th className={styles.th}>계</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className={styles.td}>
                              {[formatDate(hotel.check_in_date), formatDate(hotel.check_out_date)]
                                .filter(Boolean)
                                .join(' ~ ')}
                            </td>
                            <td className={styles.td} align='right'>
                              {toReadableAmount(hotel.nightly_rate)}
                            </td>
                            <td className={styles.td}>{hotel.nights ?? '-'}박</td>
                            <td className={styles.td} align='right'>
                              {toReadableAmount(hotel.total_amount)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Box>
                  </td>
                </tr>
                {(hotel.remarks || hotel.rule) && (
                  <tr>
                    <td className={styles.td} colSpan={6}>
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
              <col />
            </colgroup>
            <thead>
              <tr>
                <th className={styles.th}>지역</th>
                <th className={styles.th}>상품명</th>
              </tr>
            </thead>
            {tours.map((tour, idx) => (
              <tbody key={tour.id ?? idx}>
                <tr>
                  <td className={styles.td} rowSpan={2}>
                    {tour.region || '-'}
                  </td>
                  <td className={styles.td}>
                    {tour.name || '-'}
                    {tour.additional_options.length > 0 && (
                      <Text as='div' size='1'>
                        {formatAdditionalOptions(tour.additional_options)}
                      </Text>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    <Box m='-1px'>
                      <table className={styles.table}>
                        <colgroup>
                          <col />
                          <col width='120px' />
                          <col width='120px' />
                          <col width='80px' />
                          <col width='80px' />
                          <col width='80px' />
                          <col width='120px' />
                        </colgroup>
                        <thead>
                          <tr>
                            <th className={styles.th}>행사일</th>
                            <th className={styles.th}>성인요금</th>
                            <th className={styles.th}>소아요금</th>
                            <th className={styles.th}>성인인원</th>
                            <th className={styles.th}>소아인원</th>
                            <th className={styles.th}>유아인원</th>
                            <th className={styles.th}>계</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className={styles.td}>
                              {[formatDateTime(tour.start_date), formatDateTime(tour.end_date)]
                                .filter(Boolean)
                                .join(' / ')}
                            </td>
                            <td className={styles.td} align='right'>
                              {toReadableAmount(tour.adult_price)}
                            </td>
                            <td className={styles.td} align='right'>
                              {toReadableAmount(tour.children_price)}
                            </td>
                            <td className={styles.td}>{tour.adult_count}</td>
                            <td className={styles.td}>{tour.children_count}</td>
                            <td className={styles.td}>{tour.kids_count}</td>
                            <td className={styles.td} align='right'>
                              {toReadableAmount(tour.total_amount)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Box>
                  </td>
                </tr>
                {(tour.remarks || tour.rule) && (
                  <tr>
                    <td className={styles.td} colSpan={2}>
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
              <col />
              <col width='240px' />
              <col width='180px' />
            </colgroup>
            <thead>
              <tr>
                <th className={styles.th}>지역</th>
                <th className={styles.th}>차종</th>
                <th className={styles.th}>조건</th>
                <th className={styles.th}>운전자</th>
              </tr>
            </thead>
            {rentalCars.map((car, idx) => (
              <tbody key={car.id ?? idx}>
                <tr>
                  <td className={styles.td} rowSpan={2}>
                    {car.region || '-'}
                  </td>
                  <td className={styles.td}>
                    {car.model || '-'}
                    {car.additional_options.length > 0 && (
                      <Text as='div' size='1'>
                        {formatAdditionalOptions(car.additional_options)}
                      </Text>
                    )}
                  </td>
                  <td className={styles.td}>{car.options || '-'}</td>
                  <td className={styles.td}>{car.driver || '-'}</td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    <Box m='-1px'>
                      <table className={styles.table}>
                        <colgroup>
                          <col />
                          <col />
                          <col width='120px' />
                          <col width='60px' />
                          <col width='120px' />
                        </colgroup>
                        <thead>
                          <tr>
                            <th className={styles.th}>인수 장소 / 시간</th>
                            <th className={styles.th}>반납 장소 / 시간</th>
                            <th className={styles.th}>1일 요금</th>
                            <th className={styles.th}>대여일</th>
                            <th className={styles.th}>계</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
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
                            <td className={styles.td} align='right'>
                              {toReadableAmount(car.daily_rate)}
                            </td>
                            <td className={styles.td}>{car.rental_days ?? '-'}일</td>
                            <td className={styles.td} align='right'>
                              {toReadableAmount(car.total_amount)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Box>
                  </td>
                </tr>
                {(car.remarks || car.rule) && (
                  <tr>
                    <td className={styles.td} colSpan={4}>
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
            여행자보험
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
