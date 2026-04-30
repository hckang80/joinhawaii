import { createReservationToken } from '@/lib/supabase/reservation-jwt';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  try {
    // 로그인 세션 기반 인증 체크
    const supabase = await createClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ message: '인증이 필요합니다.' }), { status: 401 });
    }

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
      pdfBuffer = Buffer.from(await page.pdf({ format: 'A4', printBackground: true }));
    } catch (err) {
      console.error('[puppeteer] PDF 생성 중 에러:', err);
      await page.screenshot({ path: 'puppeteer_error.png' });
      await browser.close();
      return new Response(JSON.stringify({ message: 'PDF 생성 실패', error: String(err) }), {
        status: 500
      });
    }
    await browser.close();

    // pdfBuffer는 try 블록 내에서 항상 할당되며, 실패 시 위에서 early return 처리됨
    if (!pdfBuffer) {
      return new Response(JSON.stringify({ message: 'PDF 생성 실패' }), { status: 500 });
    }

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
        minVersion: 'TLSv1.2'
      }
    });

    // 메일 발송
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: '예약확인서',
      text: '첨부파일로 예약확인서를 확인해 주세요.',
      attachments: [
        {
          filename: 'reservation.pdf',
          content: pdfBuffer
        }
      ]
    };
    const info = await transporter.sendMail(mailOptions);

    console.log({ info });

    return new Response(JSON.stringify({ message: '메일이 성공적으로 발송되었습니다.' }), {
      status: 200
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: '메일 발송 중 오류가 발생했습니다.', error: String(error) }),
      { status: 500 }
    );
  }
}
