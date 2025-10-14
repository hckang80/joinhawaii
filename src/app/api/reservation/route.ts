import { getReservation, updateReservationProducts } from '@/lib/supabase/queries/reservation';
import { RESERVATION_SELECT_QUERY } from '@/lib/supabase/schema';
import { createClient } from '@/lib/supabase/server';
import type {
  Database,
  ProductValues,
  ReservationQueryResponse,
  ReservationRequest,
  ReservationRow,
  ReservationUpdateRequest
} from '@/types';
import { isPostgrestError } from '@/utils';
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
      p_booking_platform: body.booking_platform,
      p_flights: body.flights || [],
      p_hotels: body.hotels || [],
      p_tours: body.tours || [],
      p_cars: body.rental_cars || [],
      p_insurances: body.insurances || []
    });

    if (error) {
      console.error('예약 생성 실패:', error);
      throw error;
    }

    return NextResponse.json({
      message: `[${data.reservation_id}] 예약이 등록되었습니다`,
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

      async function fetchOptions(pid: number, type: string) {
        const { data } = await supabase
          .from('options')
          .select('*')
          .eq('pid', pid)
          .eq('type', type)
          .order('id', { ascending: true });
        return data ?? [];
      }

      const { flights, hotels, tours, rental_cars, insurances, ...rest } = reservation;

      const addKoreanWonFields = async (products: ProductValues[]) => {
        return Promise.all(
          products.map(async product => ({
            ...product,
            additional_options: await fetchOptions(Number(product.id), product.type),
            total_amount_krw: Math.round(product.total_amount * product.exchange_rate),
            cost_amount_krw: Math.round(product.total_cost * product.exchange_rate)
          }))
        );
      };

      const [flightsWithKrw, hotelsWithKrw, toursWithKrw, carsWithKrw, insurancesWithKrw] =
        await Promise.all([
          addKoreanWonFields(flights.map(item => ({ ...item, type: 'flight' }))),
          addKoreanWonFields(hotels.map(item => ({ ...item, type: 'hotel' }))),
          addKoreanWonFields(tours.map(item => ({ ...item, type: 'tour' }))),
          addKoreanWonFields(rental_cars.map(item => ({ ...item, type: 'rental_car' }))),
          addKoreanWonFields(insurances.map(item => ({ ...item, type: 'insurance' })))
        ]);

      const calculateTotal = (products: ProductValues[]) => {
        return products.reduce(
          (acc, product) => ({
            total_amount_krw: acc.total_amount_krw + product.total_amount_krw,
            cost_amount_krw: acc.cost_amount_krw + product.cost_amount_krw
          }),
          { total_amount_krw: 0, cost_amount_krw: 0 }
        );
      };

      const flightTotals = calculateTotal(flightsWithKrw);
      const hotelTotals = calculateTotal(hotelsWithKrw);
      const tourTotals = calculateTotal(toursWithKrw);
      const carTotals = calculateTotal(carsWithKrw);
      const insuranceTotals = calculateTotal(insurancesWithKrw);

      const total_amount_krw =
        flightTotals.total_amount_krw +
        hotelTotals.total_amount_krw +
        tourTotals.total_amount_krw +
        carTotals.total_amount_krw +
        insuranceTotals.total_amount_krw;

      const cost_amount_krw =
        flightTotals.cost_amount_krw +
        hotelTotals.cost_amount_krw +
        tourTotals.cost_amount_krw +
        carTotals.cost_amount_krw +
        insuranceTotals.cost_amount_krw;

      return NextResponse.json({
        success: true,
        data: {
          ...rest,
          products: {
            flights: flightsWithKrw,
            hotels: hotelsWithKrw,
            tours: toursWithKrw,
            rental_cars: carsWithKrw,
            insurances: insurancesWithKrw
          },
          total_amount_krw,
          cost_amount_krw
        }
      });
    }

    const { data, error } = await supabase
      .from('reservations')
      .select<string, ReservationQueryResponse>(RESERVATION_SELECT_QUERY)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedData =
      data?.map(({ flights, hotels, tours, rental_cars, insurances, ...rest }) => {
        const allProducts = [
          ...flights,
          ...hotels,
          ...tours,
          ...rental_cars,
          ...(insurances || [])
        ];

        const total_amount_krw = Math.round(
          allProducts.reduce(
            (sum, product) => sum + product.total_amount * product.exchange_rate,
            0
          )
        );

        const cost_amount_krw = Math.round(
          allProducts.reduce((sum, product) => sum + product.total_cost * product.exchange_rate, 0)
        );

        return {
          ...rest,
          products: { flights, hotels, tours, rental_cars, insurances },
          total_amount_krw,
          cost_amount_krw
        };
      }) ?? [];

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
    const {
      reservation_id,
      exchange_rate,
      clients,
      flights,
      hotels,
      tours,
      rental_cars,
      insurances,
      ...updates
    } = (await request.json()) as ReservationUpdateRequest;

    if (!reservation_id) {
      throw new Error('예약번호는 필수입니다.');
    }

    const supabase = await createClient<Database>();

    await updateReservationProducts(supabase, reservation_id, {
      clients,
      flights,
      hotels,
      tours,
      rental_cars,
      insurances
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
      message: `[${updatedReservation.reservation_id}] 예약 내용이 변경되었습니다`,
      success: true,
      data: updatedReservation
    });
  } catch (error) {
    console.error('예약 업데이트 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: isPostgrestError(error) ? error.message : '예약 변경 중 오류가 발생했습니다.',
        details: error
      },
      { status: 500 }
    );
  }
}
