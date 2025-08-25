import type {
  Database,
  ProductWithReservation,
  ReservationRequest,
  ReservationRow,
  TablesRow
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
      p_main_client_name: body.main_client_name,
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

export async function GET() {
  try {
    const supabase = await createClient<Database>();

    const [flights, hotels, tours, rental_cars] = await Promise.all([
      supabase.from('flights').select<string, ProductWithReservation<TablesRow<'flights'>>>(`
          *,
          reservations!flights_reservation_id_fkey (
            main_client_name
          )
        `),
      supabase.from('hotels').select<string, ProductWithReservation<TablesRow<'hotels'>>>(`
          *,
          reservations!hotels_reservation_id_fkey (
            main_client_name
          )
        `),
      supabase.from('tours').select<string, ProductWithReservation<TablesRow<'tours'>>>(`
          *,
          reservations!tours_reservation_id_fkey (
            main_client_name
          )
        `),
      supabase.from('rental_cars').select<string, ProductWithReservation<TablesRow<'cars'>>>(`
          *,
          reservations!rental_cars_reservation_id_fkey (
            main_client_name
          )
        `)
    ]);

    const allProducts = [
      ...(flights.data?.map(({ reservations, ...flight }) => ({
        ...flight,
        event_date: flight.departure_datetime,
        main_client_name: reservations.main_client_name,
        product_name: `${flight.flight_number} / ${flight.departure_city}`,
        type: 'flight' as const
      })) ?? []),
      ...(hotels.data?.map(({ reservations, ...hotel }) => ({
        ...hotel,
        event_date: hotel.check_in_date,
        main_client_name: reservations.main_client_name,
        product_name: `${hotel.region} ${hotel.hotel_name} / ${hotel.room_type}`,
        type: 'hotel' as const
      })) ?? []),
      ...(tours.data?.map(({ reservations, ...tour }) => ({
        ...tour,
        event_date: tour.start_date,
        main_client_name: reservations.main_client_name,
        product_name: `${tour.region} / ${tour.name}`,
        type: 'tour' as const
      })) ?? []),
      ...(rental_cars.data?.map(({ reservations, ...rentalCar }) => ({
        ...rentalCar,
        event_date: rentalCar.pickup_date,
        main_client_name: reservations.main_client_name,
        product_name: `${rentalCar.region} / ${rentalCar.model}`,
        type: 'rental_car' as const
      })) ?? [])
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      data: allProducts
    });
  } catch (error) {
    console.error('상품 조회 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '상품 조회 실패'
      },
      { status: 500 }
    );
  }
}
