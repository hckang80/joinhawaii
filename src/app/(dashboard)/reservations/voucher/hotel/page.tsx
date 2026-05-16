import { Box, Card, Heading, Section, Text } from '@radix-ui/themes';

type VoucherHotelPageProps = {
  searchParams: Promise<{
    reservation_id?: string;
    hotel_id?: string;
    index?: string;
  }>;
};

export default async function VoucherHotelPage({ searchParams }: VoucherHotelPageProps) {
  const params = await searchParams;

  return (
    <Box width='1000px' mx='auto'>
      <Card asChild size='3'>
        <Section>
          <Heading as='h2' size='6' mb='2'>
            호텔 바우처 발급
          </Heading>
          <Text as='p' color='gray'>
            라우팅 연결 완료. 다음 단계에서 바우처 입력 폼/미리보기/인쇄를 추가합니다.
          </Text>
          <Text as='p' mt='3'>
            reservation_id: {params.reservation_id || '-'}
          </Text>
          <Text as='p'>hotel_id: {params.hotel_id || '-'}</Text>
          <Text as='p'>index: {params.index || '-'}</Text>
        </Section>
      </Card>
    </Box>
  );
}
