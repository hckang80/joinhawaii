import { createClient } from '@/lib/supabase/server';
import type { Database, UpdateProductStatusParams } from '@/types';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const params: UpdateProductStatusParams = await request.json();
    const supabase = await createClient<Database>();

    const { data, error } = await supabase.rpc('update_product_status', {
      payload: params
    });

    if (error) throw error;

    return NextResponse.json({
      ...data,
      message: '상품 상태가 업데이트되었습니다.'
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
