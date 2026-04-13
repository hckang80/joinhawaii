import { createReservationToken } from '@/lib/supabase/reservation-jwt';
import { Buffer } from 'buffer';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reservationId, toEmail } = body;
    if (!reservationId || !toEmail) {
      return new Response(JSON.stringify({ message: 'Missing reservationId or toEmail' }), {
        status: 400
      });
    }

    // 1. JWT 토큰 발급 (5분 유효)
    const token = await createReservationToken(reservationId);
    const previewUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reservations/preview?reservation_id=${reservationId}&token=${token}`;
    console.log('[메일전송] 발급 토큰:', token, '예약ID:', reservationId);
    console.log('[메일전송] 접근 URL:', previewUrl);

    // 2. puppeteer로 토큰 포함하여 예약확인서 페이지 접근
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    let pdfBuffer: Buffer | null = null;
    try {
      const response = await page.goto(previewUrl, { waitUntil: 'networkidle0', timeout: 20000 });
      if (!response || !response.ok()) {
        console.error('[puppeteer] 페이지 접근 실패:', response?.status(), response?.statusText());
        await page.screenshot({ path: 'puppeteer_error.png' });
        throw new Error('예약확인서 페이지 접근 실패');
      }
      pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    } catch (err) {
      console.error('[puppeteer] PDF 생성 중 에러:', err);
      await page.screenshot({ path: 'puppeteer_error.png' });
      await browser.close();
      return new Response(JSON.stringify({ message: 'PDF 생성 실패', error: String(err) }), {
        status: 500
      });
    }
    await browser.close();

    // Nodemailer로 메일 발송
    const transporter = nodemailer.createTransport({
      host: 'smtp.cafe24.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        minVersion: 'TLSv1',
        secureOptions: crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
        ciphers: 'DEFAULT@SECLEVEL=0',
        rejectUnauthorized: false
      },
      debug: true,
      logger: true
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: '예약확인서',
      text: '첨부파일로 예약확인서를 확인해 주세요.',
      attachments: [
        {
          filename: 'reservation.pdf',
          content: Buffer.from(pdfBuffer)
        }
      ]
    });

    return new Response(JSON.stringify({ message: '메일이 성공적으로 발송되었습니다.' }), {
      status: 200
    });
  } catch (err: any) {
    console.error('메일 전송 에러:', err);
    return new Response(
      JSON.stringify({ message: err?.message || '서버 에러', error: String(err) }),
      { status: 500 }
    );
  }
}
