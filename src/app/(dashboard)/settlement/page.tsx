import { fetchSettlement } from '@/http';
import SettlementClientContainer from './__client.container';

export default async function SettlementPage() {
  const data = await fetchSettlement();

  return <SettlementClientContainer data={data} />;
}
