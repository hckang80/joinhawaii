import { Buffer } from 'buffer';
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

    // Puppeteer로 예약확인서 페이지를 PDF로 렌더링
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${process.env.NEXT_PUBLIC_BASE_URL}/reservations/preview?id=${reservationId}`, {
      waitUntil: 'networkidle0'
    });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // Nodemailer로 메일 발송
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
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
