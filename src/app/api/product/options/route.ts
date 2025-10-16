import { createClient } from '@/lib/supabase/server';
import type { AdditionalOptions, Database } from '@/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body: AdditionalOptions[] = await request.json();
    const supabase = await createClient<Database>();

    const { data, error } = await supabase.from('options').insert(body).select();

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pid = searchParams.get('pid');
    const type = searchParams.get('type');

    const supabase = await createClient<Database>();
    const query = supabase
      .from('options')
      .select<string, AdditionalOptions>('*')
      .order('id', { ascending: true });

    if (pid) query.eq('pid', pid);
    if (type) query.eq('type', type);

    const { data, error } = await query;

    if (error) {
      console.error('추가 옵션 조회 실패:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('추가 옵션 조회 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '추가 옵션 조회 실패',
        details: error
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body: AdditionalOptions[] = await request.json();
    const supabase = await createClient<Database>();

    const toInsert = body.filter(item => !item.id);
    const toUpdate = body.filter(item => !!item.id);

    const { data: inserted = [], error: insertError } = toInsert.length
      ? await supabase.from('options').insert(toInsert).select()
      : { data: [], error: null };
    if (insertError) throw insertError;

    const updated = toUpdate.length
      ? (
          await Promise.all(
            toUpdate.map(item => supabase.from('options').update(item).eq('id', item.id).select())
          )
        ).flatMap(res => res.data ?? [])
      : [];

    return NextResponse.json({
      message: `추가 옵션이 처리되었습니다`,
      success: true,
      data: [...(inserted ?? []), ...updated]
    });
  } catch (error) {
    console.error('추가 옵션 등록/수정 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '추가 옵션 등록/수정 실패',
        details: error
      },
      { status: 500 }
    );
  }
}
