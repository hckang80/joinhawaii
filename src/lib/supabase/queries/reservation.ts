import type { Database, ReservationQueryResponse, TablesRow } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { RESERVATION_SELECT_QUERY } from '../schema';

export const getReservation = async (supabase: SupabaseClient<Database>, reservationId: string) => {
  const { data, error } = await supabase
    .from('reservations')
    .select<string, ReservationQueryResponse>(RESERVATION_SELECT_QUERY)
    .eq('reservation_id', reservationId)
    .single();

  if (error) throw error;
  return data;
};

export const updateReservationProducts = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  exchange_rate: number,
  products: {
    clients?: Array<Partial<TablesRow<'clients'>>>;
    flights?: Array<Partial<TablesRow<'flights'>>>;
    hotels?: Array<Partial<TablesRow<'hotels'>>>;
    tours?: Array<Partial<TablesRow<'tours'>>>;
    rental_cars?: Array<Partial<TablesRow<'rental_cars'>>>;
  }
) => {
  const updates = [];

  if (exchange_rate) {
    updates.push(
      supabase.from('reservations').update({ exchange_rate }).eq('reservation_id', reservationId)
    );
  }

  if (products.clients?.length) {
    const existingClients = products.clients.filter(client => client.id);
    const newClients = products.clients.filter(client => !client.id);

    if (existingClients.length) {
      updates.push(
        supabase.from('clients').upsert(
          existingClients.map(client => ({
            ...client,
            reservation_id: reservationId
          }))
        )
      );
    }

    if (newClients.length) {
      updates.push(
        supabase.from('clients').insert(
          newClients.map(client => ({
            ...client,
            reservation_id: reservationId
          }))
        )
      );
    }
  }

  const { data: reservation } = await supabase
    .from('reservations')
    .select('id')
    .eq('reservation_id', reservationId)
    .single();

  if (!reservation) throw new Error('예약을 찾을 수 없습니다.');

  const productTables = {
    flights: 'flights',
    hotels: 'hotels',
    tours: 'tours',
    rental_cars: 'rental_cars'
  } as const;

  function makeProductPayload<T extends object>(
    items: Array<T & { is_updated_exchange_rate?: boolean }>,
    reservationId: string,
    exchange_rate: number
  ): Array<
    Omit<T, 'is_updated_exchange_rate'> & { reservation_id: string; exchange_rate?: number }
  > {
    return items.map(item => {
      const { is_updated_exchange_rate, ...rest } = item;
      return {
        ...rest,
        reservation_id: reservationId,
        ...(is_updated_exchange_rate && { exchange_rate })
      };
    });
  }

  Object.entries(productTables).forEach(([key, table]) => {
    const items = products[key as keyof typeof products] ?? [];

    if (!items.length) return;

    const existingItems = items.filter(item => item.id);
    const newItems = items.filter(item => !item.id);

    if (existingItems.length) {
      updates.push(
        supabase.from(table).upsert(makeProductPayload(existingItems, reservationId, exchange_rate))
      );
    }

    if (newItems.length) {
      updates.push(
        supabase.from(table).insert(makeProductPayload(newItems, reservationId, exchange_rate))
      );
    }
  });

  const results = await Promise.all(updates);
  const errors = results.map(r => r.error).filter(Boolean);

  if (errors.length) {
    throw errors[0];
  }
};
