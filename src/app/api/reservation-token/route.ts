import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// 메모리 기반 임시 토큰 저장 (실제 서비스는 DB/Redis 등 사용 권장)
const tokenStore = new Map<string, { reservationId: string; expires: number }>();

// 토큰 발급 API
export async function POST(req: NextRequest) {
  const { reservationId } = await req.json();
  if (!reservationId) {
    return NextResponse.json({ message: 'Missing reservationId' }, { status: 400 });
  }
  const token = randomUUID();
  // 5분 유효
  tokenStore.set(token, { reservationId, expires: Date.now() + 5 * 60 * 1000 });
  return NextResponse.json({ token });
}

// 토큰 검증 함수 (서버 내부에서 import해서 사용)
export function verifyReservationToken(token: string, reservationId: string) {
  const entry = tokenStore.get(token);
  if (!entry) return false;
  if (entry.reservationId !== reservationId) return false;
  if (entry.expires < Date.now()) {
    tokenStore.delete(token);
    return false;
  }
  return true;
}
