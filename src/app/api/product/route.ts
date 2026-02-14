import { PER_PAGE } from '@/constants';
import { createClient } from '@/lib/supabase/server';
import type { AdditionalOptions, Database } from '@/types';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient<Database>();

    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get('page') || '1');
    const perPage = Number.parseInt(url.searchParams.get('per_page') || PER_PAGE);

    const searchType = url.searchParams.get('search_type') || 'reception_date';
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const bookingPlatform = url.searchParams.get('booking_platform');
    const productType = url.searchParams.get('product_type');
    const productName = url.searchParams.get('product_name');
    const clientName = url.searchParams.get('client_name');
    const status = url.searchParams.get('status');
    const paymentStatus = url.searchParams.get('payment_status');

    const [hotels, tours, rental_cars, insurances, reservations] = await Promise.all([
      supabase.from('hotels').select(`
          *,
          reservations!hotels_reservation_id_fkey (
            main_client_name,
            booking_platform
          )
        `),
      supabase.from('tours').select(`
          *,
          reservations!tours_reservation_id_fkey (
            main_client_name,
            booking_platform
          )
        `),
      supabase.from('rental_cars').select(`
          *,
          reservations!rental_cars_reservation_id_fkey (
            main_client_name,
            booking_platform
          )
        `),
      supabase.from('insurances').select(`
          *,
          reservations!insurances_reservation_id_fkey (
            main_client_name,
            booking_platform
          )
        `),
      supabase.from('reservations').select('id, deposit, total_amount')
    ]);

    const hotelRows = hotels.data ?? [];
    const tourRows = tours.data ?? [];
    const rentalRows = rental_cars.data ?? [];
    const insuranceRows = insurances.data ?? [];
    const reservationRows = reservations.data ?? [];

    const reservationMap = new Map();
    reservationRows.forEach(r => {
      reservationMap.set(r.id, { deposit: r.deposit, total_amount: r.total_amount });
    });

    const allPids = [
      ...hotelRows.map(r => r.id),
      ...tourRows.map(r => r.id),
      ...rentalRows.map(r => r.id),
      ...insuranceRows.map(r => r.id)
    ].filter((v, i, a) => v != null && a.indexOf(v) === i);

    const optionsData =
      allPids.length > 0
        ? ((await supabase.from('options').select('*').in('pid', allPids)).data ?? [])
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
          product_name: [hotel.region, hotel.hotel_name, hotel.room_type, hotel.bed_type].join(
            ' / '
          ),
          type: 'hotel' as const,
          additional_options: optionsByKey.get(`hotel_${String(hotel.id)}`) ?? [],
          total_amount:
            hotel.total_amount +
            (optionsByKey.get(`hotel_${String(hotel.id)}`) ?? []).reduce(
              (acc, optionProduct) => acc + optionProduct.total_amount,
              0
            ),
          total_cost:
            hotel.total_cost +
            (optionsByKey.get(`hotel_${String(hotel.id)}`) ?? []).reduce(
              (acc, optionProduct) => acc + optionProduct.total_cost,
              0
            ),
          total_cost_krw:
            hotel.total_cost * hotel.exchange_rate +
            (optionsByKey.get(`hotel_${String(hotel.id)}`) ?? []).reduce(
              (acc, optionProduct) => acc + optionProduct.total_cost * optionProduct.exchange_rate,
              0
            ),
          total_amount_krw:
            Number(hotel.total_amount ?? 0) * Number(hotel.exchange_rate ?? 0) +
            (optionsByKey.get(`hotel_${String(hotel.id)}`) ?? []).reduce(
              (acc, optionProduct) =>
                acc + optionProduct.total_amount * optionProduct.exchange_rate,
              0
            )
        })
      ) ?? []),
      ...(tours.data?.map(({ reservations: { main_client_name, booking_platform }, ...tour }) => ({
        ...tour,
        event_date: tour.start_date,
        main_client_name,
        booking_platform,
        product_name: `${tour.region} / ${tour.name}`,
        type: 'tour' as const,
        additional_options: optionsByKey.get(`tour_${String(tour.id)}`) ?? [],
        total_amount:
          tour.total_amount +
          (optionsByKey.get(`tour_${String(tour.id)}`) ?? []).reduce(
            (acc, optionProduct) => acc + optionProduct.total_amount,
            0
          ),
        total_cost:
          tour.total_cost +
          (optionsByKey.get(`tour_${String(tour.id)}`) ?? []).reduce(
            (acc, optionProduct) => acc + optionProduct.total_cost,
            0
          ),
        total_cost_krw:
          tour.total_cost * tour.exchange_rate +
          (optionsByKey.get(`tour_${String(tour.id)}`) ?? []).reduce(
            (acc, optionProduct) => acc + optionProduct.total_cost * optionProduct.exchange_rate,
            0
          ),
        total_amount_krw:
          Number(tour.total_amount ?? 0) * Number(tour.exchange_rate ?? 0) +
          (optionsByKey.get(`tour_${String(tour.id)}`) ?? []).reduce(
            (acc, optionProduct) => acc + optionProduct.total_amount * optionProduct.exchange_rate,
            0
          )
      })) ?? []),
      ...(rental_cars.data?.map(
        ({ reservations: { main_client_name, booking_platform }, ...rentalCar }) => ({
          ...rentalCar,
          event_date: rentalCar.pickup_date,
          main_client_name,
          booking_platform,
          product_name: `${rentalCar.region} / ${rentalCar.model}`,
          type: 'rental_car' as const,
          additional_options: optionsByKey.get(`rental_car_${String(rentalCar.id)}`) ?? [],
          total_amount:
            rentalCar.total_amount +
            (optionsByKey.get(`rental_car_${String(rentalCar.id)}`) ?? []).reduce(
              (acc, optionProduct) => acc + optionProduct.total_amount,
              0
            ),
          total_cost:
            rentalCar.total_cost +
            (optionsByKey.get(`rental_car_${String(rentalCar.id)}`) ?? []).reduce(
              (acc, optionProduct) => acc + optionProduct.total_cost,
              0
            ),
          total_cost_krw:
            rentalCar.total_cost * rentalCar.exchange_rate +
            (optionsByKey.get(`rental_car_${String(rentalCar.id)}`) ?? []).reduce(
              (acc, optionProduct) => acc + optionProduct.total_cost * optionProduct.exchange_rate,
              0
            ),
          total_amount_krw:
            Number(rentalCar.total_amount ?? 0) * Number(rentalCar.exchange_rate ?? 0) +
            (optionsByKey.get(`rental_car_${String(rentalCar.id)}`) ?? []).reduce(
              (acc, optionProduct) =>
                acc + optionProduct.total_amount * optionProduct.exchange_rate,
              0
            )
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
          total_cost_krw:
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
    ];

    // Apply filters
    let filteredProducts = allProducts;

    // Date range filter (빈 문자열 무시)
    const hasStartDate = !!startDate && startDate !== '';
    const hasEndDate = !!endDate && endDate !== '';
    if (hasStartDate || hasEndDate) {
      filteredProducts = filteredProducts.filter(product => {
        const targetDate =
          searchType === 'reception_date' ? product.created_at : product.event_date;

        if (!targetDate) return false;

        const dateStr = targetDate.split('T')[0];

        if (hasStartDate && hasEndDate) {
          return dateStr >= startDate && dateStr <= endDate;
        } else if (hasStartDate) {
          return dateStr >= startDate;
        } else if (hasEndDate) {
          return dateStr <= endDate;
        }

        return true;
      });
    }

    // Booking platform filter
    if (bookingPlatform) {
      filteredProducts = filteredProducts.filter(
        product => product.booking_platform === bookingPlatform
      );
    }

    // Product type filter
    if (productType) {
      filteredProducts = filteredProducts.filter(product => product.type === productType);
    }

    // Product name filter (partial match)
    if (productName) {
      const searchTerm = productName.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm)
      );
    }

    // Client name filter (partial match)
    if (clientName) {
      const searchTerm = clientName.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.main_client_name.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (status) {
      filteredProducts = filteredProducts.filter(product => product.status === status);
    }

    // Payment status filter
    if (paymentStatus) {
      filteredProducts = filteredProducts.filter(
        product => product.payment_status === paymentStatus
      );
    }

    // Sort by created_at descending
    filteredProducts.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const total = filteredProducts.length;
    const start = (page - 1) * perPage;
    const paginated = filteredProducts.slice(start, start + perPage);
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const paginatedWithPaymentStatus = paginated.map(product => {
      const reservationId = product.reservation_id;
      const reservation = reservationMap.get(reservationId);
      if (
        reservation &&
        reservation.deposit != null &&
        reservation.total_amount != null &&
        Number(reservation.deposit) === Number(reservation.total_amount)
      ) {
        return { ...product, payment_status: 'Full' };
      }
      return product;
    });

    return NextResponse.json({
      success: true,
      data: paginatedWithPaymentStatus,
      meta: {
        total,
        page,
        per_page: perPage,
        total_pages: totalPages
      }
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
