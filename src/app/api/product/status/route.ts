import { ProductStatus } from '@/constants';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      reservationId,
      productType,
      productId,
      status
    }: {
      reservationId: string;
      productType: 'flight' | 'hotel' | 'tour' | 'rental_car';
      productId: number;
      status: ProductStatus;
    } = body;

    const supabase = await createClient<Database>();

    const { data, error } = await supabase.rpc('update_product_status', {
      p_reservation_id: reservationId,
      p_product_type: productType,
      p_product_id: productId,
      p_status: status
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('상품 상태 업데이트 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '상품 상태 업데이트 실패',
        details: error
      },
      { status: 500 }
    );
  }
}
