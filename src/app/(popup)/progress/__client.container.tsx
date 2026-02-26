'use client';

import { Tiptap } from '@/components';
import { Box, Button, Flex } from '@radix-ui/themes';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function ProgressClientContainer() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<{ title: string; content: string }>({
    defaultValues: { title: '', content: '' }
  });

  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (data: { content: string }) => {
    setSubmitted(true);
    // TODO: 서버 전송 등 추가 작업
    setTimeout(() => setSubmitted(false), 2000);
    reset(data); // 필요시 초기화
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
        {submitted && <div style={{ color: 'green', marginTop: 8 }}>저장되었습니다.</div>}
      </form>
    </Box>
  );
}
