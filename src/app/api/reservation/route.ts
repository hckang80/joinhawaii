import { getAdditionalOptions } from '@/http';
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
    const { clients, ...rest }: ReservationRequest = await request.json();
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

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        ...rest,
        reservation_id: reservationId
      })
      .select()
      .maybeSingle();

    const clientsPayload = clients.map(client => ({ ...client, reservation_id: reservationId }));

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert(clientsPayload)
      .select();

    if (error) {
      console.error('예약 생성 실패:', error);
      throw error;
    }

    if (clientError) {
      console.error('Clients 생성 실패:', error);
      throw clientError;
    }

    return NextResponse.json({
      message: `[${data.reservation_id}] 예약이 등록되었습니다`,
      success: true,
      data: {
        ...data,
        clients: clientData
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

      const { flights, hotels, tours, rental_cars, insurances, ...rest } = reservation;

      const addKoreanWonFields = async (products: ProductValues[]) => {
        return Promise.all(
          products.map(async product => {
            const options = await getAdditionalOptions({
              pid: Number(product.id),
              type: product.type
            });

            const optionsWithKrw = options.map(opt => ({
              ...opt,
              total_amount_krw: Math.round(opt.total_amount * opt.exchange_rate),
              total_cost_krw: Math.round(opt.total_cost * opt.exchange_rate)
            }));

            const optionsTotals = optionsWithKrw.reduce(
              (acc, o) => {
                acc.total_amount_krw += o.total_amount_krw;
                acc.total_cost_krw += o.total_cost_krw;
                return acc;
              },
              { total_amount_krw: 0, total_cost_krw: 0 }
            );

            return {
              ...product,
              additional_options: optionsWithKrw,
              total_amount_krw:
                Math.round(product.total_amount * product.exchange_rate) +
                optionsTotals.total_amount_krw,
              total_cost_krw:
                Math.round(product.total_cost * product.exchange_rate) +
                optionsTotals.total_cost_krw
            };
          })
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
            total_cost_krw: acc.total_cost_krw + product.total_cost_krw
          }),
          { total_amount_krw: 0, total_cost_krw: 0 }
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

      const total_cost_krw =
        flightTotals.total_cost_krw +
        hotelTotals.total_cost_krw +
        tourTotals.total_cost_krw +
        carTotals.total_cost_krw +
        insuranceTotals.total_cost_krw;

      const sumProductsOriginal = (products: ProductValues[]) =>
        products.reduce((acc, product) => acc + product.total_amount, 0);

      const productsOriginalTotal =
        sumProductsOriginal(flightsWithKrw) +
        sumProductsOriginal(hotelsWithKrw) +
        sumProductsOriginal(toursWithKrw) +
        sumProductsOriginal(carsWithKrw) +
        sumProductsOriginal(insurancesWithKrw);

      const sumOptionsOriginal = (products: ProductValues[]) =>
        products.reduce((acc, product) => {
          const opts = product.additional_options;
          return acc + opts.reduce((s, opt) => s + opt.total_amount, 0);
        }, 0);

      const additionalOptionsTotalOriginal =
        sumOptionsOriginal(flightsWithKrw) +
        sumOptionsOriginal(hotelsWithKrw) +
        sumOptionsOriginal(toursWithKrw) +
        sumOptionsOriginal(carsWithKrw) +
        sumOptionsOriginal(insurancesWithKrw);

      const totalAmountOriginal = productsOriginalTotal + additionalOptionsTotalOriginal;

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
          total_amount: totalAmountOriginal,
          total_amount_krw,
          total_cost_krw
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

        const total_cost_krw = Math.round(
          allProducts.reduce((sum, product) => sum + product.total_cost * product.exchange_rate, 0)
        );

        return {
          ...rest,
          products: { flights, hotels, tours, rental_cars, insurances },
          total_amount_krw,
          total_cost_krw
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

    const markRefunded = <T extends { status?: string }>(items?: T[]) =>
      items?.map(item =>
        item.status === 'Refunded' ? { ...item, payment_status: 'Refunded' } : item
      );

    await updateReservationProducts(supabase, reservation_id, {
      clients,
      flights: markRefunded(flights),
      hotels: markRefunded(hotels),
      tours: markRefunded(tours),
      rental_cars: markRefunded(rental_cars),
      insurances: markRefunded(insurances)
    });

    const { data: totals } = await supabase.rpc('calculate_reservation_total', {
      p_reservation_id: reservation_id
    });

    const { data: updatedReservation, error } = await supabase
      .from('reservations')
      .update({
        ...updates,
        ...totals
      })
      .eq('reservation_id', reservation_id)
      .select()
      .single();

    if (error) throw error;
    if (!updatedReservation) throw new Error('예약 정보를 찾을 수 없습니다.');

    return NextResponse.json({
      message: `[${reservation_id}] 예약 내용이 변경되었습니다`,
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
