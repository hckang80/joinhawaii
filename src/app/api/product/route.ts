import { createClient } from '@/lib/supabase/server';
import type { AdditionalOptions, Database, ProductWithReservation, TablesRow } from '@/types';
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

    const hotelRows = hotels.data ?? [];
    const tourRows = tours.data ?? [];
    const rentalRows = rental_cars.data ?? [];
    const insuranceRows = insurances.data ?? [];

    const allPids = [
      ...hotelRows.map(r => r.id),
      ...tourRows.map(r => r.id),
      ...rentalRows.map(r => r.id),
      ...insuranceRows.map(r => r.id)
    ].filter((v, i, a) => v != null && a.indexOf(v) === i);

    const optionsData =
      allPids.length > 0
        ? ((
            await supabase.from('options').select<string, AdditionalOptions>('*').in('pid', allPids)
          ).data ?? [])
        : [];

    const optionsByKey = new Map<string, AdditionalOptions[]>();
    optionsData.forEach(opt => {
      const key = `${opt.type}_${String(opt.pid)}`;
      const arr = optionsByKey.get(key) ?? [];
      arr.push(opt);
      optionsByKey.set(key, arr);
    });

    const allProducts = [
      ...(hotels.data?.map(
        ({ reservations: { main_client_name, booking_platform }, ...hotel }) => ({
          ...hotel,
          event_date: hotel.check_in_date,
          main_client_name,
          booking_platform,
          product_name: `${hotel.region} / ${hotel.hotel_name} / ${hotel.room_type}`,
          type: 'hotel' as const,
          additional_options: optionsByKey.get(`insurance_${String(hotel.id)}`) ?? [],
          total_amount:
            hotel.total_amount +
            (optionsByKey.get(`insurance_${String(hotel.id)}`) ?? []).reduce(
              (acc, optionProduct) => acc + optionProduct.total_amount,
              0
            ),
          total_cost:
            hotel.total_cost +
            (optionsByKey.get(`insurance_${String(hotel.id)}`) ?? []).reduce(
              (acc, optionProduct) => acc + optionProduct.total_cost,
              0
            ),
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
        additional_options: optionsByKey.get(`insurance_${String(tour.id)}`) ?? [],
        total_amount:
          tour.total_amount +
          (optionsByKey.get(`insurance_${String(tour.id)}`) ?? []).reduce(
            (acc, optionProduct) => acc + optionProduct.total_amount,
            0
          ),
        total_cost:
          tour.total_cost +
          (optionsByKey.get(`insurance_${String(tour.id)}`) ?? []).reduce(
            (acc, optionProduct) => acc + optionProduct.total_cost,
            0
          ),
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
          additional_options: optionsByKey.get(`insurance_${String(rentalCar.id)}`) ?? [],
          total_amount:
            rentalCar.total_amount +
            (optionsByKey.get(`insurance_${String(rentalCar.id)}`) ?? []).reduce(
              (acc, optionProduct) => acc + optionProduct.total_amount,
              0
            ),
          total_cost:
            rentalCar.total_cost +
            (optionsByKey.get(`insurance_${String(rentalCar.id)}`) ?? []).reduce(
              (acc, optionProduct) => acc + optionProduct.total_cost,
              0
            ),
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
          additional_options: optionsByKey.get(`insurance_${String(insurance.id)}`) ?? [],
          total_amount:
            insurance.total_amount +
            (optionsByKey.get(`insurance_${String(insurance.id)}`) ?? []).reduce(
              (acc, optionProduct) => acc + optionProduct.total_amount,
              0
            ),
          total_cost:
            insurance.total_cost +
            (optionsByKey.get(`insurance_${String(insurance.id)}`) ?? []).reduce(
              (acc, optionProduct) => acc + optionProduct.total_cost,
              0
            ),
          cost_amount_krw:
            insurance.total_cost * insurance.exchange_rate +
            (optionsByKey.get(`insurance_${String(insurance.id)}`) ?? []).reduce(
              (acc, optionProduct) => acc + optionProduct.total_cost * optionProduct.exchange_rate,
              0
            ),
          total_amount_krw:
            Number(insurance.total_amount ?? 0) * Number(insurance.exchange_rate ?? 0) +
            (optionsByKey.get(`insurance_${String(insurance.id)}`) ?? []).reduce(
              (acc, optionProduct) =>
                acc + optionProduct.total_amount * optionProduct.exchange_rate,
              0
            )
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
