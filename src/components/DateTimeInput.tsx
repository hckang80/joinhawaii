'use client';

import { extractDateString, getTimezoneOffsetString } from '@/utils';
import { Flex, TextField } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
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
  const { field } = useController({
    name,
    control,
    rules: { required }
  });

  const [dateValue, setDateValue] = useState(() =>
    extractDateString(field.value as string | null | undefined)
  );

  useEffect(() => {
    const nextDateString = extractDateString(field.value as string | null | undefined);
    setDateValue(nextDateString);
  }, [field.value, name]);

  return (
    <Flex gap='2'>
      <TextField.Root
        size='1'
        ref={required ? field.ref : undefined}
        type='date'
        name={field.name}
        onBlur={field.onBlur}
        value={dateValue || ''}
        onChange={e => {
          const value = e.target.value;
          setDateValue(value);

          if (value) {
            const date = new Date(value + 'T00:00:00');
            const tzString = getTimezoneOffsetString(date);
            const nextValue = `${value}T00:00:00${tzString}`;
            field.onChange(nextValue);
          } else {
            field.onChange(null);
          }
        }}
      />
      <TimeInput name={name} control={control} value={field.value} onValueChange={field.onChange} />
    </Flex>
  );
}
