'use client';
import { reservationQueryOptions } from '@/lib/queries';
import { Box, Button, Flex, Text } from '@radix-ui/themes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import { ReservationConfirmationPreview } from './ReservationConfirmationPreview';

export default function ReservationPreviewClient({ reservation_id }: { reservation_id: string }) {
  const { data } = useQuery({
    ...reservationQueryOptions(reservation_id!),
    enabled: !!reservation_id
  });

  if (!data) notFound();

  // 메일 전송 상태 관리
  const [emailSent, setEmailSent] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

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
    onError: (err) => {
      setEmailSent('error');
      setErrorMsg(err?.message || '메일 전송 실패');
    },
    onSettled: () => {
      setTimeout(() => setEmailSent('idle'), 3000);
    }
  });

  return (
    <Box width='700px' mx='auto'>
      <ReservationConfirmationPreview data={data} />
      <Flex justify='center' mt='4' gap='3' className='print:hidden'>
        <Button size='4' onClick={() => window.print()}>
          인쇄 / PDF 저장
        </Button>
        <Button
          size='4'
          color='indigo'
          disabled={sendMailMutation.isPending}
          style={{ minWidth: 140 }}
          onClick={() => sendMailMutation.mutate()}
        >
          {sendMailMutation.isPending ? '전송 중...' : '메일 보내기'}
        </Button>
      </Flex>
      <Flex justify='center' mt='2' className='print:hidden'>
        {emailSent === 'success' && <Text color='green'>메일이 성공적으로 발송되었습니다.</Text>}
        {emailSent === 'error' && <Text color='red'>{errorMsg}</Text>}
      </Flex>
    </Box>
  );
}
