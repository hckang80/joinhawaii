import { checkProfile } from '@/http';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { verifyReservationToken } from './reservation-jwt';

const publicPaths = ['/', '/login', '/error'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // 비로그인 사용자에 한해서만 JWT 토큰으로 미리보기 페이지 접근 허용
  const token = request.nextUrl.searchParams.get('token');
  if (!user && token && request.nextUrl.pathname.startsWith('/reservations/preview')) {
    const reservation_id = request.nextUrl.searchParams.get('reservation_id');
    if (reservation_id) {
      const valid = await verifyReservationToken(token, reservation_id);
      if (valid) {
        return supabaseResponse;
      }
    }
    // 토큰이 유효하지 않으면 인증 우회 불가(=로그인 필요)
  }

  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && !isPublicPath) {
    const {
      profile: { permissions }
    } = await checkProfile(user.id);
    const isManager = permissions.includes('manage');

    if (!isManager) {
      return new NextResponse('접근 권한이 없습니다. 관리자에게 문의해주세요.', { status: 404 });
    }
  }

  return supabaseResponse;
}
