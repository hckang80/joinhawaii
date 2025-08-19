'use client';

import { Button, Flex, Grid, Heading, TextArea, TextField } from '@radix-ui/themes';
import { type SubmitHandler, useForm } from 'react-hook-form';

interface Client {
  koreanName: string;
  englishName: string;
  gender: string;
  residentId: string;
  phoneNumber: string;
  email: string;
  notes: string;
}

interface FormData {
  clients: Client[];
}

export default function ReservationsFormClient() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    control
  } = useForm<FormData>({
    defaultValues: {
      clients: [
        {
          koreanName: '홍길동',
          englishName: 'Gildong Hong',
          gender: 'male',
          residentId: '901231-1234567',
          phoneNumber: '010-1234-5678',
          email: 'hong.gildong@example.com',
          notes: '추가 사항: VIP 고객'
        }
      ]
    }
  });

  const onSubmit: SubmitHandler<FormData> = data => {
    console.log({ data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Heading as='h2' mb='4'>
          고객정보
        </Heading>

        <Grid columns='100px 1fr' gap='3'>
          <span>이름</span>
          <TextField.Root {...register('clients.0.koreanName', { required: true })} />

          <span>이름(영문)</span>
          <TextField.Root {...register('clients.0.englishName', { required: true })} />

          <span>성별</span>
          <TextField.Root />

          <span>주민번호</span>
          <TextField.Root {...register('clients.0.residentId', { required: true })} />

          <span>연락처</span>
          <TextField.Root {...register('clients.0.phoneNumber', { required: true })} />

          <span>이메일</span>
          <TextField.Root {...register('clients.0.email', { required: true })} />

          <span>비고</span>
          <TextArea {...register('clients.0.notes')} />
        </Grid>
      </div>

      <Flex justify='end' mt='4'>
        <Button size='3'>확인</Button>
      </Flex>
    </form>
  );
}
