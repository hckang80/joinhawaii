'use client';

import { Tiptap } from '@/components';
import { updateReservation } from '@/http';
import type { ReservationFormData, ReservationResponse } from '@/types';
import { handleApiError, handleApiSuccess } from '@/utils';
import { Box, Button, Flex } from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export default function ProgressClientContainer() {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset
  } = useForm<{ reservation_id: string; content: string }>({
    defaultValues: { content: '' }
  });

  const mutation = useMutation({
    mutationFn: (formData: ReservationFormData) => {
      return updateReservation(formData);
    },
    onSuccess: (result: { data: ReservationResponse }) => {
      handleApiSuccess(result);
    },
    onError: handleApiError
  });

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');
    console.log({ formData });
    mutation.mutate(
      {
        reservation_id: 'some-reservation-id',
        ...formData
      },
      {
        onSuccess: () => reset(formData)
      }
    );
  };

  return (
    <Box p='4'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name='content'
          control={control}
          rules={{ required: '내용을 입력하세요.' }}
          render={({ field }) => (
            <Tiptap
              value={field.value}
              onChange={value => field.onChange(value)}
              placeholder='진행사항을 입력하세요.'
            />
          )}
        />
        {errors.content && (
          <div style={{ color: 'red', marginTop: 8 }}>{errors.content.message}</div>
        )}
        <Flex justify='end' mt='4'>
          <Button size='3' type='submit' loading={isSubmitting}>
            저장
          </Button>
        </Flex>
      </form>
    </Box>
  );
}
