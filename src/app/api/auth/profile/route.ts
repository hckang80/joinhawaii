import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('uid');

  if (!id) {
    return NextResponse.json({ authorized: false, reason: 'No uid provided' }, { status: 400 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !profile) {
    return NextResponse.json({ authorized: false, reason: 'No profile' }, { status: 403 });
  }

  return NextResponse.json({ authorized: true, profile });
}
