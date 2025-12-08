'use client';

import {
  extractDateString,
  extractTime,
  generateHourOptions,
  generateMinuteOptions,
  updateDateInISO,
  updateTimeInISO
} from '@/utils';
import { Flex, Select, TextField } from '@radix-ui/themes';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

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
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field }) => {
        const dateString = extractDateString(field.value);
        const { hours, minutes } = extractTime(field.value);

        return (
          <Flex gap='2'>
            <TextField.Root
              {...field}
              type='date'
              value={dateString}
              onChange={e => field.onChange(updateDateInISO(field.value, e.target.value))}
            />
            <Flex gap='1' align='center'>
              <Select.Root
                value={String(hours)}
                onValueChange={value =>
                  field.onChange(updateTimeInISO(field.value, Number(value), minutes))
                }
              >
                <Select.Trigger placeholder='시' style={{ width: '60px' }}>
                  {String(hours).padStart(2, '0')}
                </Select.Trigger>
                <Select.Content>
                  {generateHourOptions().map(hour => (
                    <Select.Item key={hour} value={String(hour)}>
                      {String(hour).padStart(2, '0')}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              시
              <Select.Root
                value={String(minutes)}
                onValueChange={value =>
                  field.onChange(updateTimeInISO(field.value, hours, Number(value)))
                }
              >
                <Select.Trigger placeholder='분' style={{ width: '60px' }}>
                  {String(minutes).padStart(2, '0')}
                </Select.Trigger>
                <Select.Content>
                  {generateMinuteOptions().map(min => (
                    <Select.Item key={min} value={String(min)}>
                      {String(min).padStart(2, '0')}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              분
            </Flex>
          </Flex>
        );
      }}
    />
  );
}
