'use client';
import { reservationQueryOptions } from '@/lib/queries';
import { Box, Button, Flex } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { ReservationConfirmationPreview } from './ReservationConfirmationPreview';

export default function ReservationPreviewClient({ reservation_id }: { reservation_id: string }) {
  const { data } = useQuery({
    ...reservationQueryOptions(reservation_id!),
    enabled: !!reservation_id
  });

  if (!data) notFound();

  return (
    <Box>
      <ReservationConfirmationPreview data={data} />
      <Flex justify='center' mt='4'>
        <Button size='4' onClick={() => window.print()}>
          인쇄 / PDF 저장
        </Button>
      </Flex>
    </Box>
  );
}
