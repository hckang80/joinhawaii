import { fetchSettlement } from '@/http';
import type { ReservationResponse } from '@/types';
import ReservationsFormClientContainer from './__client.container';

export default async function ReservationsFormPage({
  searchParams
}: {
  searchParams: Promise<{ reservation_id?: string }>;
}) {
  const reservation_id = (await searchParams).reservation_id;
  let data: ReservationResponse | null = null;

  if (reservation_id) {
    data = await fetchSettlement<ReservationResponse>(reservation_id);
  }

  return <ReservationsFormClientContainer data={data} />;
}
