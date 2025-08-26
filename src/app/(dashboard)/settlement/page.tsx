import { fetchProducts } from '@/http';
import SettlementClientContainer from './__client.container';

export default async function SettlementPage() {
  const data = await fetchProducts();

  return <SettlementClientContainer data={data} />;
}
