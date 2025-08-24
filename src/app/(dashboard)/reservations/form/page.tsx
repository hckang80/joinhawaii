import { fetchSettlement } from '@/http';
import type { ReservationResponse } from '@/types';
import ReservationsFormClientContainer from './__client.container';

export default async function ReservationsFormPage({
  searchParams
}: {
  searchParams: { reservation_id?: string };
}) {
  const reservation_id = searchParams.reservation_id;

  if (reservation_id) {
    const data = await fetchSettlement<ReservationResponse>(reservation_id);
    console.log({ data });
  }

  return <ReservationsFormClientContainer />;
}
