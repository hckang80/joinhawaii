import type {
  Database,
  ReservationQueryResponse,
  ReservationRequest,
  ReservationResponse,
  ReservationRow
} from '@/types';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body: ReservationRequest = await request.json();
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const supabase = await createClient<Database>();

    const { data: lastReservation } = await supabase
      .from('reservations')
      .select('reservation_id')
      .like('reservation_id', `${today}-%`)
      .order('reservation_id', { ascending: false })
      .limit(1)
      .single<Pick<ReservationRow, 'reservation_id'>>();

    const sequence = lastReservation?.reservation_id
      ? parseInt(lastReservation.reservation_id.match(/-JH(\d{3})$/)?.[1] ?? '0', 10) + 1
      : 1;

    const reservationId = `${today}-JH${String(sequence).padStart(3, '0')}`;

    const { data, error } = await supabase.rpc('create_reservation', {
      p_reservation_id: reservationId,
      p_clients: body.clients,
      p_flights: body.flights,
      p_main_client_name: body.mainClientName,
      p_hotels: body.hotels || [],
      p_tours: body.tours || [],
      p_cars: body.cars || []
    });

    if (error) {
      console.error('예약 생성 실패:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data
      }
    });
  } catch (error) {
    console.error('Reservation creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create reservation'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('reservationId');
    const supabase = await createClient<Database>();

    let query = supabase.from('reservations').select<string, ReservationQueryResponse>(`
      id,
      reservation_id,
      status,
      created_at,
      main_client_name,
      total_amount,
      clients!clients_reservation_id_fkey (
        id,
        korean_name,
        english_name,
        gender,
        resident_id,
        phone_number,
        email,
        notes
      ),
      flights!flights_reservation_id_fkey (*),
      hotels!hotels_reservation_id_fkey (*),
      tours!tours_reservation_id_fkey (*),
      rental_cars!rental_cars_reservation_id_fkey (*)
    `);

    if (reservationId) {
      query = query.eq('reservation_id', reservationId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('예약 조회 실패:', {
        에러: error,
        조회조건: { reservationId }
      });
      throw error;
    }

    if (!data) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const transformedData = data.map(reservation => {
      const { flights, hotels, tours, rental_cars, ...rest } = reservation;

      return {
        ...rest,
        products: {
          flights,
          hotels,
          tours,
          rental_cars
        }
      };
    }) as ReservationResponse[];

    return NextResponse.json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Reservation fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reservations'
      },
      { status: 500 }
    );
  }
}
