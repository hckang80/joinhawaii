import { fetchProducts } from '@/http';
import ReservationsClientContainer from './__client.container';

export default async function ReservationsPage() {
  const data = await fetchProducts();

  return <ReservationsClientContainer data={data} />;
}
