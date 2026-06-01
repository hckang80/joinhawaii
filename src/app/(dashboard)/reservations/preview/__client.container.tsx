'use client';
import { reservationQueryOptions } from '@/lib/queries';
import { Box, Button, Flex, Text } from '@radix-ui/themes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { notFound } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ReservationConfirmationPreview } from './ReservationConfirmationPreview';

function toPrintableFileNamePart(value: string | null | undefined, fallback: string) {
  const sanitized = (value ?? '')
    .trim()
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\.+$/g, '')
    .trim();

  return sanitized || fallback;
}

function toPrintableDate(value: string | null | undefined) {
  if (!value) return new Date().toISOString().slice(0, 10);

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function printWithDocumentTitle(fileName: string) {
  const previousTitle = document.title;
  let restored = false;

  const restoreTitle = () => {
    if (restored) return;
    restored = true;
    document.title = previousTitle;
    window.removeEventListener('afterprint', restoreTitle);
    window.removeEventListener('focus', handleWindowFocus);
  };

  const handleWindowFocus = () => {
    setTimeout(restoreTitle, 0);
  };

  document.title = fileName;
  window.addEventListener('afterprint', restoreTitle, { once: true });
  window.addEventListener('focus', handleWindowFocus, { once: true });
  window.print();
}

export default function ReservationPreviewClient({ reservation_id }: { reservation_id: string }) {
  const { data } = useQuery({
    ...reservationQueryOptions(reservation_id!),
    enabled: !!reservation_id
  });

  if (!data) notFound();

  // 메일 전송 상태 관리
  const [emailSent, setEmailSent] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const printFileName = useMemo(() => {
    const representativeName = toPrintableFileNamePart(
      data.main_client_name || data.clients?.[0]?.korean_name || data.clients?.[0]?.english_name,
      '고객'
    );
    const datePart = toPrintableDate(data.start_date ?? data.created_at);

    return `${datePart}_${representativeName}_예약확인서`;
  }, [data.clients, data.created_at, data.main_client_name, data.start_date]);

  const sendMailMutation = useMutation({
    mutationFn: async () => {
      setEmailSent('loading');
      setErrorMsg('');

      const toEmail = 'hckang80@gmail.com';
      const res = await fetch('/api/send-reservation-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: reservation_id, toEmail })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || '메일 전송 실패');
      }
      return res.json();
    },
    onSuccess: () => {
      setEmailSent('success');
    },
    onError: err => {
      setEmailSent('error');
      setErrorMsg(err?.message || '메일 전송 실패');
    },
    onSettled: () => {
      setTimeout(() => setEmailSent('idle'), 3000);
    }
  });

  return (
    <Box width='1000px' mx='auto'>
      <ReservationConfirmationPreview data={data} />
      <Flex justify='center' mt='6' gap='3' className='print:hidden'>
        <Button
          size='4'
          disabled
          style={{ minWidth: 140 }}
          onClick={() => sendMailMutation.mutate()}
        >
          {sendMailMutation.isPending ? '전송 중...' : '메일 보내기'}
        </Button>
        <Button size='4' onClick={() => printWithDocumentTitle(printFileName)} variant='soft'>
          <FileText />
          인쇄 / PDF 다운로드
        </Button>
      </Flex>
      <Flex justify='center' mt='2' className='print:hidden'>
        {emailSent === 'success' && <Text color='green'>메일이 성공적으로 발송되었습니다.</Text>}
        {emailSent === 'error' && <Text color='red'>{errorMsg}</Text>}
      </Flex>
    </Box>
  );
}
