'use client';

import { defaultAdditionalOptionValues, PRODUCT_STATUS_COLOR, ProductStatus } from '@/constants';
import { updateAdditionalOptions } from '@/http';
import type { AdditionalOptions, ProductType } from '@/types';
import { handleApiError, handleApiSuccess, isDev } from '@/utils';
import type { Observable, ObservableBoolean } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import { Button, Dialog, Flex, Grid, Select, Table, TextField } from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
import { Minus, Plus, Save } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import AdditionalOptionsTotals from './AdditionalOptionsTotals';

export default function AdditionalOptionsEditor({
  isOpen: isOpen$,
  context: context$,
  onRefetch
}: {
  isOpen: ObservableBoolean;
  context: Observable<
    Partial<{
      id: number;
      type: ProductType;
      title: string;
      data: AdditionalOptions[];
    }>
  >;
  onRefetch: () => Promise<unknown>;
}) {
  const params = useSearchParams();
  const isOpen = use$(isOpen$);

  const { id = 0, type = 'hotel', title, data } = use$(() => context$);

  const defaultValue = useMemo(
    () => ({
      ...defaultAdditionalOptionValues,
      pid: id,
      type
    }),
    [id, type]
  );

  const {
    watch,
    control,
    setValue,
    register,
    handleSubmit,
    formState: { isDirty },
    reset
  } = useForm<{ additionalOptions: AdditionalOptions[] }>({
    defaultValues: { additionalOptions: [defaultValue] }
  });

  const additionalOptions = useWatch({ control, name: 'additionalOptions' }) ?? [defaultValue];

  const mutation = useMutation({
    mutationFn: (formData: AdditionalOptions[]) => {
      return updateAdditionalOptions(formData);
    },
    onSuccess: (result: unknown, variables: AdditionalOptions[]) => {
      handleApiSuccess(result);
      reset({ additionalOptions: variables });
      onRefetch();
      isOpen$.set(false);
    },
    onError: handleApiError
  });

  const onSubmit: SubmitHandler<{ additionalOptions: AdditionalOptions[] }> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');

    const optionsWithReservationId = formData.additionalOptions.map(option => ({
      ...option,
      reservation_id: params.get('reservation_id') || ''
    }));

    mutation.mutate(optionsWithReservationId);
  };

  useEffect(() => {
    setValue('additionalOptions', data?.length ? data : [defaultValue]);
  }, [defaultValue, data, setValue]);

  const addAdditionalOption = () => {
    setValue('additionalOptions', [...watch('additionalOptions'), defaultValue]);
  };

  const removeItem = () => {
    setValue('additionalOptions', additionalOptions.slice(0, -1));
  };

  const isRemoveProductDisabled = () => {
    const minLength = 1;
    return additionalOptions.length <= minLength;
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => isOpen$.set(open)}>
      <Dialog.Content maxWidth='1000px'>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description size='2' mb='4'>
          옵션 구분을 위한 날짜 표시 영역
        </Dialog.Description>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Table.Root size='1'>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell width='90px'>환율</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='200px'>내용</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='80px'>💰요금</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='70px'>수량</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='110px'>진행상태</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='200px'>비고</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {additionalOptions.map((_item, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Controller
                      name={`additionalOptions.${i}.exchange_rate`}
                      control={control}
                      render={({ field }) => (
                        <TextField.Root
                          type='number'
                          min='0'
                          step='0.01'
                          value={field.value}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const { value } = e.target;
                            if (!value) return field.onChange(value);

                            const [integer, decimal] = value.split('.');
                            const formattedValue = decimal
                              ? `${integer.slice(0, 4)}.${decimal.slice(0, 2)}`
                              : integer.slice(0, 4);

                            field.onChange(+formattedValue);
                          }}
                        />
                      )}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextField.Root
                      {...register(`additionalOptions.${i}.title`, {
                        required: true
                      })}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Grid gap='2'>
                      <Flex direction='column'>
                        <span>🧑성인</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          step='0.01'
                          {...register(`additionalOptions.${i}.adult_cost`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Flex>
                      <Flex direction='column'>
                        <span>🧒소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          step='0.01'
                          {...register(`additionalOptions.${i}.children_cost`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Flex>
                      <Flex direction='column'>
                        <span>👶유아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          step='0.01'
                          readOnly
                          {...register(`additionalOptions.${i}.kids_cost`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Flex>
                    </Grid>
                  </Table.Cell>
                  <Table.Cell>
                    <Grid gap='2'>
                      <Flex direction='column'>
                        <span>🧑성인</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          step='0.01'
                          {...register(`additionalOptions.${i}.adult_price`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Flex>
                      <Flex direction='column'>
                        <span>🧒소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          step='0.01'
                          {...register(`additionalOptions.${i}.children_price`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Flex>
                      <Flex direction='column'>
                        <span>👶유아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          step='0.01'
                          readOnly
                          {...register(`additionalOptions.${i}.kids_price`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Flex>
                    </Grid>
                  </Table.Cell>
                  <Table.Cell>
                    <Grid gap='2'>
                      <Flex direction='column'>
                        <span>🧑성인</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          {...register(`additionalOptions.${i}.adult_count`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Flex>
                      <Flex direction='column'>
                        <span>🧒소아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          {...register(`additionalOptions.${i}.children_count`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Flex>
                      <Flex direction='column'>
                        <span>👶유아</span>
                        <TextField.Root
                          type='number'
                          min='0'
                          {...register(`additionalOptions.${i}.kids_count`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Flex>
                    </Grid>
                  </Table.Cell>
                  <Table.Cell>
                    <Controller
                      name={`additionalOptions.${i}.status`}
                      control={control}
                      render={({ field }) => (
                        <Select.Root
                          value={field.value}
                          onValueChange={value => {
                            field.onChange(value);
                          }}
                          name={field.name}
                        >
                          <Select.Trigger color={PRODUCT_STATUS_COLOR[field.value]} variant='soft'>
                            {ProductStatus[field.value]}
                          </Select.Trigger>
                          <Select.Content>
                            {Object.entries(ProductStatus).map(([key, label]) => (
                              <Select.Item key={key} value={key}>
                                {label}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      )}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextField.Root {...register(`additionalOptions.${i}.notes`)} />
                  </Table.Cell>
                  <Table.Cell hidden>
                    <AdditionalOptionsTotals index={i} setValue={setValue} control={control} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          <Flex justify='end' mt='4' gap='1'>
            <Button type='button' color='ruby' onClick={addAdditionalOption}>
              <Plus size='20' />
              상품 추가
            </Button>
            <Button
              type='button'
              color='ruby'
              variant='soft'
              onClick={() => removeItem()}
              disabled={isRemoveProductDisabled()}
            >
              <Minus size='20' /> 삭제
            </Button>
            <Button disabled={mutation.isPending} variant='outline'>
              <Save />
              변경사항 저장
            </Button>
          </Flex>
        </form>
        {isDev() && <pre>{JSON.stringify(watch('additionalOptions'), null, 2)}</pre>}
      </Dialog.Content>
    </Dialog.Root>
  );
}
