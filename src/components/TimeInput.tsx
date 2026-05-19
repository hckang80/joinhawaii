'use client';

import { extractTime, updateTimeInISO } from '@/utils';
import { Flex, TextField } from '@radix-ui/themes';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

interface TimeInputProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  value?: string | null;
  onValueChange?: (value: string) => void;
}

export function TimeInput<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  value,
  onValueChange
}: TimeInputProps<TFieldValues>) {
  const renderFields = (
    isoValue: string | null | undefined,
    handleChange: (value: string) => void
  ) => {
    const { hours, minutes } = extractTime(isoValue);

    return (
      <Flex gap='1' align='center'>
        <TextField.Root
          size='1'
          type='number'
          min={0}
          max={23}
          value={hours}
          onChange={e => handleChange(updateTimeInISO(isoValue, Number(e.target.value), minutes))}
          style={{ width: 40 }}
          inputMode='numeric'
        />
        :
        <TextField.Root
          size='1'
          type='number'
          min={0}
          max={59}
          value={minutes}
          onChange={e => handleChange(updateTimeInISO(isoValue, hours, Number(e.target.value)))}
          style={{ width: 40 }}
          inputMode='numeric'
        />
      </Flex>
    );
  };

  if (onValueChange) {
    return renderFields(value, onValueChange);
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => renderFields(field.value, field.onChange)}
    />
  );
}
