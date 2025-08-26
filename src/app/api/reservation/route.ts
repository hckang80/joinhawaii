import { getReservation, updateReservationProducts } from '@/lib/supabase/queries/reservation';
import { RESERVATION_SELECT_QUERY } from '@/lib/supabase/schema';
import { createClient } from '@/lib/supabase/server';
import type {
  Database,
  ReservationQueryResponse,
  ReservationRequest,
  ReservationRow,
  ReservationUpdateRequest
} from '@/types';
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
      p_main_client_name: body.main_client_name,
      p_flights: body.flights || [],
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
    console.error('예약 생성 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '예약 생성 실패',
        details: error
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

    if (reservationId) {
      const reservation = await getReservation(supabase, reservationId);

      if (!reservation) {
        return NextResponse.json({ success: true, data: null });
      }

      const { flights, hotels, tours, rental_cars, ...rest } = reservation;
      return NextResponse.json({
        success: true,
        data: {
          ...rest,
          products: { flights, hotels, tours, rental_cars }
        }
      });
    }

    const { data, error } = await supabase
      .from('reservations')
      .select<string, ReservationQueryResponse>(RESERVATION_SELECT_QUERY)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedData =
      data?.map(({ flights, hotels, tours, rental_cars, ...rest }) => ({
        ...rest,
        products: { flights, hotels, tours, rental_cars }
      })) ?? [];

    return NextResponse.json({ success: true, data: transformedData });
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

export async function PATCH(request: Request) {
  try {
    const { reservation_id, clients, flights, hotels, tours, cars, ...updates } =
      (await request.json()) as ReservationUpdateRequest;

    if (!reservation_id) {
      throw new Error('예약번호는 필수입니다.');
    }

    const supabase = await createClient<Database>();

    await updateReservationProducts(supabase, reservation_id, {
      clients,
      flights,
      hotels,
      tours,
      cars
    });

    const { data: totalAmounts } = await supabase.rpc('calculate_reservation_total', {
      p_reservation_id: reservation_id
    });

    const { data: updatedReservation, error } = await supabase
      .from('reservations')
      .update({
        ...updates,
        total_amount: totalAmounts.total_amount
      })
      .eq('reservation_id', reservation_id)
      .select()
      .single();

    if (error) throw error;
    if (!updatedReservation) throw new Error('예약 정보를 찾을 수 없습니다.');

    return NextResponse.json({
      success: true,
      data: updatedReservation
    });
  } catch (error) {
    console.error('예약 업데이트 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '예약 업데이트 실패',
        details: error
      },
      { status: 500 }
    );
  }
}
