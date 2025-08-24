import type { Database, ReservationQueryResponse, ReservationResponse } from '@/types';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('reservationId');
    const supabase = await createClient<Database>();

    if (reservationId) {
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .select<string, ReservationQueryResponse>(
          `
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
        `
        )
        .eq('reservation_id', reservationId)
        .single();

      if (reservationError) {
        console.error('예약 조회 실패:', {
          에러: reservationError,
          예약번호: reservationId
        });
        throw reservationError;
      }

      if (!reservation) {
        return NextResponse.json({
          success: true,
          data: null
        });
      }

      const { flights, hotels, tours, rental_cars, ...rest } = reservation;

      return NextResponse.json({
        success: true,
        data: {
          ...rest,
          products: {
            flights,
            hotels,
            tours,
            rental_cars
          }
        }
      });
    }

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

export async function PATCH(request: Request) {
  try {
    const { reservation_id, ...updates } = await request.json();
    const supabase = await createClient<Database>();

    if (!reservation_id) {
      throw new Error('예약번호는 필수입니다.');
    }

    const { data, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('reservation_id', reservation_id)
      .select()
      .single();

    if (error) {
      console.error('예약 업데이트 실패:', {
        예약번호: reservation_id,
        에러: error
      });
      throw error;
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('예약 업데이트 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '예약 업데이트 실패',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
