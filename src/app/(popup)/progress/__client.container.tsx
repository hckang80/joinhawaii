'use client';

import { Tiptap } from '@/components';
import { updateReservation } from '@/http';
import { reservationQueryOptions } from '@/lib/queries';
import type { ReservationFormData } from '@/types';
import { handleApiError } from '@/utils';
import { Box, Button, Flex } from '@radix-ui/themes';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export default function ProgressClientContainer({ reservation_id }: { reservation_id: string }) {
  const {
    data: { content }
  } = useSuspenseQuery({
    ...reservationQueryOptions(reservation_id!)
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting }
  } = useForm<{ reservation_id: string; content: string }>({
    defaultValues: { reservation_id, content }
  });

  const mutation = useMutation({
    mutationFn: (formData: Partial<ReservationFormData>) => {
      return updateReservation(formData);
    },
    onSuccess: () => {
      if (window.opener) {
        window.close();
        window.opener.focus();
      }
    },
    onError: handleApiError
  });

  const onSubmit: SubmitHandler<Partial<ReservationFormData>> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');
    mutation.mutate(formData);
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
