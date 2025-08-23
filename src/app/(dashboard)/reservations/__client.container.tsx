import type { ReservationResponse } from '@/types';
import { Heading } from '@radix-ui/themes';

export default function ReservationsClientContainer({ data }: { data: ReservationResponse[] }) {
  return (
    <div>
      <Heading as='h2' mb='4' size='7'>
        예약관리
      </Heading>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
