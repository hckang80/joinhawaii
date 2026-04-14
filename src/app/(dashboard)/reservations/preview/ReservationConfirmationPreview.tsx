import type { ReservationResponse } from '@/types';
import { Box, Flex, Heading, Section, Text } from '@radix-ui/themes';
import styles from './preview-table.module.css';

type ReservationConfirmationPreviewProps = {
  data: ReservationResponse;
};

export function ReservationConfirmationPreview({ data }: ReservationConfirmationPreviewProps) {
  console.log({ data });
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

      {/* 기타 예약 정보, 호텔/상품 등은 필요시 추가 */}

      <Flex justify='center'>
        <Text color='gray'>본 예약확인서는 여행상품 예약을 증명하는 용도로만 사용됩니다.</Text>
      </Flex>
    </Box>
  );
}
