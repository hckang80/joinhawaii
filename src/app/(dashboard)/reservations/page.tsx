import type { ReservationResponse } from '@/types';
import ReservationsClientContainer from './__client.container';

const fetchReservation = async (id?: string): Promise<ReservationResponse[]> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const url = id ? `${baseUrl}/api/reservation?reservationId=${id}` : `${baseUrl}/api/reservation`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

export default async function ReservationsPage() {
  const data = await fetchReservation();
  console.log({ data });

  return <ReservationsClientContainer data={data} />;
}
