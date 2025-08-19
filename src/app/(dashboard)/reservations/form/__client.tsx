'use client';

import {
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  RadioCards,
  TextArea,
  TextField
} from '@radix-ui/themes';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import styles from './page.module.css';

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

export const GENDER_TYPE = ['MR', 'MS'] as const;

const defaultClientValues = {
  koreanName: '',
  englishName: '',
  gender: '',
  residentId: '',
  phoneNumber: '',
  email: '',
  notes: ''
};

export default function ReservationsFormClient() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, isDirty },
    getValues,
    setValue,
    control
  } = useForm<FormData>({
    defaultValues: {
      clients: [
        {
          koreanName: '홍길동',
          englishName: 'Gildong Hong',
          gender: '',
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

  const addClient = () => {
    setValue('clients', [...getValues('clients'), defaultClientValues]);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card asChild size='3'>
        <section>
          <Heading as='h2' mb='5'>
            고객정보
          </Heading>

          <div>
            {getValues('clients').map((client, i) => {
              return (
                <Grid key={client.residentId} columns='100px 1fr' gap='3' className={styles.client}>
                  <span>이름</span>
                  <TextField.Root
                    size='3'
                    {...register(`clients.${i}.koreanName`, { required: true })}
                  />

                  <span>이름(영문)</span>
                  <TextField.Root
                    size='3'
                    {...register(`clients.${i}.englishName`, { required: true })}
                  />

                  <span>성별</span>
                  <Controller
                    name={`clients.${i}.gender`}
                    control={control}
                    render={({ field }) => (
                      <RadioCards.Root
                        size='1'
                        value={field.value}
                        onValueChange={value => {
                          field.onChange(value);
                        }}
                        name={field.name}
                        columns='repeat(auto-fit, minmax(100px, auto))'
                      >
                        {GENDER_TYPE.map(value => (
                          <RadioCards.Item value={value} key={value}>
                            {value}
                          </RadioCards.Item>
                        ))}
                      </RadioCards.Root>
                    )}
                  ></Controller>

                  <span>주민번호</span>
                  <TextField.Root
                    size='3'
                    {...register(`clients.${i}.residentId`, { required: true })}
                  />

                  <span>연락처</span>
                  <TextField.Root
                    size='3'
                    {...register(`clients.${i}.phoneNumber`, { required: true })}
                  />

                  <span>이메일</span>
                  <TextField.Root
                    size='3'
                    {...register(`clients.${i}.email`, { required: true })}
                  />

                  <span>비고</span>
                  <TextArea {...register(`clients.${i}.notes`)} />
                </Grid>
              );
            })}
          </div>

          <Flex justify='end' mt='4'>
            <Button type='button' variant='surface' onClick={addClient}>
              인원추가
            </Button>
          </Flex>
        </section>
      </Card>

      <Flex justify='end' mt='4'>
        <Button size='3'>확인</Button>
      </Flex>

      <pre>{JSON.stringify(watch(), null, 2)}</pre>
    </form>
  );
}
