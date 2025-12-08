'use client';

import { extractDateString, updateDateInISO } from '@/utils';
import { Flex, TextField } from '@radix-ui/themes';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { TimeInput } from './TimeInput';

interface DateTimeInputProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  required?: boolean;
}

export function DateTimeInput<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  required = false
}: DateTimeInputProps<TFieldValues>) {
  return (
    <Flex gap='2'>
      <Controller
        name={name}
        control={control}
        rules={{ required }}
        render={({ field }) => {
          const dateString = extractDateString(field.value);
          return (
            <TextField.Root
              type='date'
              value={dateString}
              onChange={e => {
                const value = e.target.value;
                field.onChange(value ? updateDateInISO(field.value, value) : null);
              }}
            />
          );
        }}
      />
      <TimeInput name={name} control={control} />
    </Flex>
  );
}
