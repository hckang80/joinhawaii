import type { Database, ReservationQueryResponse, ReservationUpdateRequest } from '@/types';
import { getReservation, updateReservationProducts } from '@/utils/supabase/queries/reservation';
import { RESERVATION_SELECT_QUERY } from '@/utils/supabase/schema';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

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

    const { data: updatedReservation, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('reservation_id', reservation_id)
      .select()
      .single();

    if (error) throw error;
    if (!updatedReservation) throw new Error('예약 정보를 찾을 수 없습니다.');

    await updateReservationProducts(supabase, reservation_id, {
      clients,
      flights,
      hotels,
      tours,
      cars
    });

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
