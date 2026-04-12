'use client';
import { reservationQueryOptions } from '@/lib/queries';
import { Box, Button, Flex, Text, TextField } from '@radix-ui/themes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import { ReservationConfirmationPreview } from './ReservationConfirmationPreview';

export default function ReservationPreviewClient({ reservation_id }: { reservation_id: string }) {
  console.log({ reservation_id });
  const { data } = useQuery({
    ...reservationQueryOptions(reservation_id!),
    enabled: !!reservation_id
  });
  console.log({ reservation_id, data });

  if (!data) notFound();

  // 메일 전송 상태 관리
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const sendMailMutation = useMutation({
    mutationFn: async (toEmail: string) => {
      setEmailSent('loading');
      setErrorMsg('');
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
    onError: (err: any) => {
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
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!email) return;
            sendMailMutation.mutate(email);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <TextField.Root
            type='email'
            placeholder='이메일 입력'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={sendMailMutation.isLoading}
            style={{ width: 220 }}
          />
          <Button
            type='submit'
            size='4'
            color='indigo'
            disabled={!email || sendMailMutation.isLoading}
            style={{ minWidth: 100 }}
          >
            {sendMailMutation.isLoading ? '전송 중...' : '메일 보내기'}
          </Button>
        </form>
      </Flex>
      <Flex justify='center' mt='2' className='print:hidden'>
        {emailSent === 'success' && <Text color='green'>메일이 성공적으로 발송되었습니다.</Text>}
        {emailSent === 'error' && <Text color='red'>{errorMsg}</Text>}
      </Flex>
    </Box>
  );
}
