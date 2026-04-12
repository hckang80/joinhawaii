import type { ReservationResponse } from '@/types';
import { Box, Flex, Heading, Section, Table, Text } from '@radix-ui/themes';

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
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <tbody>
            <tr>
              <th style={{ textAlign: 'left', padding: 4, border: '1px solid #ddd' }}>발행일</th>
              <td style={{ padding: 4, border: '1px solid #ddd' }}>
                {data.created_at ? new Date(data.created_at).toLocaleDateString() : '-'}
              </td>
              <th style={{ textAlign: 'left', padding: 4, border: '1px solid #ddd' }}>담당자</th>
              <td style={{ padding: 4, border: '1px solid #ddd' }}>{data.author || '-'}</td>
            </tr>
            <tr>
              <th style={{ textAlign: 'left', padding: 4, border: '1px solid #ddd' }}>업체구분</th>
              <td style={{ padding: 4, border: '1px solid #ddd' }}>
                {data.booking_platform || '-'}
              </td>
              <th style={{ textAlign: 'left', padding: 4, border: '1px solid #ddd' }}>여행종류</th>
              <td style={{ padding: 4, border: '1px solid #ddd' }}>{data.trip_type || '-'}</td>
            </tr>
            <tr>
              <th style={{ textAlign: 'left', padding: 4, border: '1px solid #ddd' }}>구분</th>
              <td style={{ padding: 4, border: '1px solid #ddd' }}>
                {data.travel_category || '-'}
              </td>
              <th style={{ textAlign: 'left', padding: 4, border: '1px solid #ddd' }}>예약구분</th>
              <td style={{ padding: 4, border: '1px solid #ddd' }}>{data.reservation_id || '-'}</td>
            </tr>
            <tr>
              <th style={{ textAlign: 'left', padding: 4, border: '1px solid #ddd' }}>여행일정</th>
              <td colSpan={3} style={{ padding: 4, border: '1px solid #ddd' }}>
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
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr>
              <th style={{ padding: 4, border: '1px solid #ddd' }}>이름</th>
              <th style={{ padding: 4, border: '1px solid #ddd' }}>영문</th>
              <th style={{ padding: 4, border: '1px solid #ddd' }}>연락처</th>
              <th style={{ padding: 4, border: '1px solid #ddd' }}>이메일</th>
            </tr>
          </thead>
          <tbody>
            {data.clients?.map((client, idx) => (
              <tr key={idx}>
                <td style={{ padding: 4, border: '1px solid #ddd' }}>{client.korean_name}</td>
                <td style={{ padding: 4, border: '1px solid #ddd' }}>{client.english_name}</td>
                <td style={{ padding: 4, border: '1px solid #ddd' }}>{client.phone_number}</td>
                <td style={{ padding: 4, border: '1px solid #ddd' }}>{client.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section size='1'>
        <Heading as='h3' mb='2'>
          기본정보
        </Heading>
        <Table.Root size='1' variant='surface'>
          <Table.Body>
            <Table.Row>
              <Table.RowHeaderCell>발행일</Table.RowHeaderCell>
              <Table.Cell>
                {data.created_at ? new Date(data.created_at).toLocaleDateString() : '-'}
              </Table.Cell>
              <Table.RowHeaderCell>담당자</Table.RowHeaderCell>
              <Table.Cell>{data.author || '-'}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeaderCell>업체구분</Table.RowHeaderCell>
              <Table.Cell>{data.booking_platform || '-'}</Table.Cell>
              <Table.RowHeaderCell>여행종류</Table.RowHeaderCell>
              <Table.Cell>{data.trip_type || '-'}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeaderCell>구분</Table.RowHeaderCell>
              <Table.Cell>{data.travel_category || '-'}</Table.Cell>
              <Table.RowHeaderCell>예약구분</Table.RowHeaderCell>
              <Table.Cell>{data.reservation_id || '-'}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeaderCell>여행일정</Table.RowHeaderCell>
              <Table.Cell colSpan={3}>
                {data.start_date || '-'} ~ {data.end_date || '-'}
                {data.nights ? ` (${data.nights}박` : ''}
                {data.days ? ` ${data.days}일)` : data.nights ? ')' : ''}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Section>

      <Section size='1'>
        <Heading as='h3' mb='2'>
          고객정보
        </Heading>
        <Table.Root size='1' variant='surface'>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>이름</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>영문</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>연락처</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>이메일</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.clients?.map((client, idx) => (
              <Table.Row key={idx}>
                <Table.Cell>{client.korean_name}</Table.Cell>
                <Table.Cell>{client.english_name}</Table.Cell>
                <Table.Cell>{client.phone_number}</Table.Cell>
                <Table.Cell>{client.email}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Section>

      {/* 기타 예약 정보, 호텔/상품 등은 필요시 추가 */}

      <Flex justify='center'>
        <Text color='gray'>본 예약확인서는 여행상품 예약을 증명하는 용도로만 사용됩니다.</Text>
      </Flex>
    </Box>
  );
}
