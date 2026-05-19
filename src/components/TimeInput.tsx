'use client';

import { extractTime, updateTimeInISO } from '@/utils';
import { Flex, TextField } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

interface TimeInputProps<TFieldValues extends FieldValues = FieldValues> {
  name?: FieldPath<TFieldValues>;
  control?: Control<TFieldValues>;
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
    return <TimeInputFields isoValue={value} handleChange={onValueChange} />;
  }

  return (
    <Controller
      name={name as FieldPath<TFieldValues>}
      control={control as Control<TFieldValues>}
      render={({ field }) => (
        <TimeInputFields
          isoValue={field.value as string | null | undefined}
          handleChange={field.onChange}
        />
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

  const parseSegment = (raw: string, max: number): number | undefined => {
    if (!/^\d{1,2}$/.test(raw)) return;

    const nextValue = Number(raw);
    if (Number.isNaN(nextValue) || nextValue < 0 || nextValue > max) return;

    return nextValue;
  };

  const applyHours = (raw: string) => {
    if (raw === '') {
      setHoursInput('');
      return;
    }

    const parsedHours = parseSegment(raw, 23);
    if (parsedHours === undefined) return;

    setHoursInput(raw);

    const currentMinutes = Number(minutesInput);
    const safeMinutes = Number.isNaN(currentMinutes) ? parsedTime.minutes : currentMinutes;
    handleChange(updateTimeInISO(isoValue, parsedHours, safeMinutes));
  };

  const applyMinutes = (raw: string) => {
    if (raw === '') {
      setMinutesInput('');
      return;
    }

    const parsedMinutes = parseSegment(raw, 59);
    if (parsedMinutes === undefined) return;

    setMinutesInput(raw);

    const currentHours = Number(hoursInput);
    const safeHours = Number.isNaN(currentHours) ? parsedTime.hours : currentHours;
    handleChange(updateTimeInISO(isoValue, safeHours, parsedMinutes));
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
