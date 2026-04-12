'use client';
import { reservationQueryOptions } from '@/lib/queries';
import { Box } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { ReservationConfirmationPreview } from './ReservationConfirmationPreview';

export default function ReservationPreviewClient({ reservation_id }: { reservation_id: string }) {
  const { data } = useQuery({
    ...reservationQueryOptions(reservation_id!),
    enabled: !!reservation_id
  });
  console.log({ reservation_id, data });

  if (!data) notFound();

  return (
    <Box>
      <ReservationConfirmationPreview data={data} />
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button onClick={() => window.print()} style={{ fontSize: 16, padding: '8px 24px' }}>
          인쇄 / PDF 저장
        </button>
      </div>
    </Box>
  );
}
