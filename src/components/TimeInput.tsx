'use client';

import { extractTime, updateTimeInISO } from '@/utils';
import { Flex, TextField } from '@radix-ui/themes';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

interface TimeInputProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
}

export function TimeInput<TFieldValues extends FieldValues = FieldValues>({
  name,
  control
}: TimeInputProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const { hours, minutes } = extractTime(field.value);
        return (
          <Flex gap='1' align='center'>
            <TextField.Root
              type='number'
              min={0}
              max={23}
              value={hours || ''}
              onChange={e =>
                field.onChange(updateTimeInISO(field.value, Number(e.target.value), minutes))
              }
              style={{ width: 50 }}
              inputMode='numeric'
            />
            시
            <TextField.Root
              type='number'
              min={0}
              max={59}
              value={minutes || ''}
              onChange={e =>
                field.onChange(updateTimeInISO(field.value, hours, Number(e.target.value)))
              }
              style={{ width: 50 }}
              inputMode='numeric'
            />
            분
          </Flex>
        );
      }}
    />
  );
}
