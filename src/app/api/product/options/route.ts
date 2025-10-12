import { createClient } from '@/lib/supabase/server';
import type { AdditionalOptions, Database } from '@/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body: AdditionalOptions = await request.json();
    const supabase = await createClient<Database>();

    const { data, error } = await supabase.from('options').insert([body]).select();

    if (error) {
      console.error('추가 옵션 등록 실패:', error);
      throw error;
    }

    return NextResponse.json({
      message: `추가 옵션이 등록되었습니다`,
      success: true,
      data
    });
  } catch (error) {
    console.error('추가 옵션 등록 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '추가 옵션 등록 실패',
        details: error
      },
      { status: 500 }
    );
  }
}
