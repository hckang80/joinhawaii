import { createClient } from '@/lib/supabase/server';
import type { Database, ProductWithReservation, TablesRow } from '@/types';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient<Database>();

    const [hotels, tours, rental_cars, insurances] = await Promise.all([
      supabase.from('hotels').select<string, ProductWithReservation<TablesRow<'hotels'>>>(`
          *,
          reservations!hotels_reservation_id_fkey (
            main_client_name,
            booking_platform
          )
        `),
      supabase.from('tours').select<string, ProductWithReservation<TablesRow<'tours'>>>(`
          *,
          reservations!tours_reservation_id_fkey (
            main_client_name,
            booking_platform
          )
        `),
      supabase.from('rental_cars').select<
        string,
        ProductWithReservation<TablesRow<'rental_cars'>>
      >(`
          *,
          reservations!rental_cars_reservation_id_fkey (
            main_client_name,
            booking_platform
          )
        `),
      supabase.from('insurances').select<string, ProductWithReservation<TablesRow<'insurances'>>>(`
          *,
          reservations!insurances_reservation_id_fkey (
            main_client_name,
            booking_platform
          )
        `)
    ]);

    const allProducts = [
      ...(hotels.data?.map(
        ({ reservations: { main_client_name, booking_platform }, ...hotel }) => ({
          ...hotel,
          event_date: hotel.check_in_date,
          main_client_name,
          booking_platform,
          product_name: `${hotel.region} / ${hotel.hotel_name} / ${hotel.room_type}`,
          type: 'hotel' as const,
          cost_amount_krw: hotel.total_cost * hotel.exchange_rate,
          total_amount_krw: hotel.total_amount * hotel.exchange_rate
        })
      ) ?? []),
      ...(tours.data?.map(({ reservations: { main_client_name, booking_platform }, ...tour }) => ({
        ...tour,
        event_date: tour.start_date,
        main_client_name,
        booking_platform,
        product_name: `${tour.region} / ${tour.name}`,
        type: 'tour' as const,
        cost_amount_krw: tour.total_cost * tour.exchange_rate,
        total_amount_krw: tour.total_amount * tour.exchange_rate
      })) ?? []),
      ...(rental_cars.data?.map(
        ({ reservations: { main_client_name, booking_platform }, ...rentalCar }) => ({
          ...rentalCar,
          event_date: rentalCar.pickup_date,
          main_client_name,
          booking_platform,
          product_name: `${rentalCar.region} / ${rentalCar.model}`,
          type: 'rental_car' as const,
          cost_amount_krw: rentalCar.total_cost * rentalCar.exchange_rate,
          total_amount_krw: rentalCar.total_amount * rentalCar.exchange_rate
        })
      ) ?? []),
      ...(insurances.data?.map(
        ({ reservations: { main_client_name, booking_platform }, ...insurance }) => ({
          ...insurance,
          event_date: insurance.start_date,
          main_client_name,
          booking_platform,
          product_name: `${insurance.company}`,
          type: 'insurance' as const,
          cost_amount_krw: insurance.total_cost * insurance.exchange_rate,
          total_amount_krw: insurance.total_amount * insurance.exchange_rate
        })
      ) ?? [])
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
