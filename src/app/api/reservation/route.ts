import type { ReservationRequest } from '@/types';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body: ReservationRequest = await request.json();

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const supabase = await createClient();
    const { data: lastReservation } = await supabase
      .from('reservations')
      .select('reservation_id')
      .like('reservation_id', `${today}-%`)
      .order('reservation_id', { ascending: false })
      .limit(1);

    let sequence = 1;
    if (lastReservation?.[0]?.reservation_id) {
      sequence = parseInt(lastReservation[0].reservation_id.split('-JH')[1]) + 1;
    }
    const reservationId = `${today}-JH${String(sequence).padStart(3, '0')}`;

    const { data, error } = await supabase.rpc('create_reservation', {
      p_reservation_id: reservationId,
      p_clients: body.clients,
      p_flights: body.flights,
      p_main_client_name: body.mainClientName,
      p_hotels: body.hotels,
      p_tours: body.tours,
      p_cars: body.cars
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        reservationId,
        ...data
      }
    });
  } catch (error) {
    console.error('Reservation creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create reservation',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
