'use client';

import { extractTime, updateTimeInISO } from '@/utils';
import { Flex, TextField } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
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
  if (onValueChange) {
    return <TimeInputFields isoValue={value} handleChange={onValueChange!} />;
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TimeInputFields isoValue={field.value} handleChange={field.onChange} />
      )}
    />
  );
}

function TimeInputFields({
  isoValue,
  handleChange
}: {
  isoValue: string | null | undefined;
  handleChange: (value: string) => void;
}) {
  const parsedTime = extractTime(isoValue);
  const [hoursInput, setHoursInput] = useState(String(parsedTime.hours));
  const [minutesInput, setMinutesInput] = useState(String(parsedTime.minutes));

  useEffect(() => {
    const next = extractTime(isoValue);
    setHoursInput(String(next.hours));
    setMinutesInput(String(next.minutes));
  }, [isoValue]);

  const applyHours = (raw: string) => {
    if (!/^\d{0,2}$/.test(raw)) return;
    setHoursInput(raw);

    if (raw === '') return;

    const nextHours = Number(raw);
    if (Number.isNaN(nextHours) || nextHours < 0 || nextHours > 23) return;

    const currentMinutes = Number(minutesInput);
    const safeMinutes = Number.isNaN(currentMinutes) ? parsedTime.minutes : currentMinutes;
    handleChange(updateTimeInISO(isoValue, nextHours, safeMinutes));
  };

  const applyMinutes = (raw: string) => {
    if (!/^\d{0,2}$/.test(raw)) return;
    setMinutesInput(raw);

    if (raw === '') return;

    const nextMinutes = Number(raw);
    if (Number.isNaN(nextMinutes) || nextMinutes < 0 || nextMinutes > 59) return;

    const currentHours = Number(hoursInput);
    const safeHours = Number.isNaN(currentHours) ? parsedTime.hours : currentHours;
    handleChange(updateTimeInISO(isoValue, safeHours, nextMinutes));
  };

  return (
    <Flex gap='1' align='center'>
      <TextField.Root
        size='1'
        type='text'
        value={hoursInput}
        onChange={e => applyHours(e.target.value)}
        onBlur={() => {
          if (hoursInput === '') {
            setHoursInput(String(parsedTime.hours));
          }
        }}
        style={{ width: 40 }}
        inputMode='numeric'
      />
      :
      <TextField.Root
        size='1'
        type='text'
        value={minutesInput}
        onChange={e => applyMinutes(e.target.value)}
        onBlur={() => {
          if (minutesInput === '') {
            setMinutesInput(String(parsedTime.minutes));
          }
        }}
        style={{ width: 40 }}
        inputMode='numeric'
      />
    </Flex>
  );
}
