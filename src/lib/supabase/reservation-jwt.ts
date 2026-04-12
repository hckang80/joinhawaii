import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.RESERVATION_JWT_SECRET || 'dev-secret';

export async function createReservationToken(reservationId: string) {
  const exp = Math.floor(Date.now() / 1000) + 5 * 60; // 5분 만료
  return await new SignJWT({ reservationId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(exp)
    .sign(new TextEncoder().encode(JWT_SECRET));
}

export async function verifyReservationToken(token: string, reservationId: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return payload.reservationId === reservationId;
  } catch {
    return false;
  }
}
