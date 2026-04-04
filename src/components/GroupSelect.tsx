'use client';

import { Flex, Select, TextField } from '@radix-ui/themes';
import { useRef } from 'react';
import type { ControllerRenderProps, FieldPath, FieldValues } from 'react-hook-form';
import { CUSTOM_LABEL } from '../constants';

export function GroupSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  field,
  list
}: {
  field: ControllerRenderProps<TFieldValues, TName>;
  list: Record<string, { value: string; label: string; en_label: string }[]>;
}) {
  const customHotelNameRef = useRef('');

  const isCustom =
    field.value === CUSTOM_LABEL ||
    !Object.values(list)
      .flat()
      .some(opt => opt.value === field.value);

  const handleSelectChange = (value: string) => {
    if (value === CUSTOM_LABEL) {
      field.onChange(customHotelNameRef.current || '');
    } else {
      if (isCustom && field.value && field.value !== CUSTOM_LABEL) {
        customHotelNameRef.current = field.value;
      }
      field.onChange(value);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    customHotelNameRef.current = e.target.value;
    field.onChange(e.target.value);
  };

  return (
    <Flex gap='2' align='center'>
      <Select.Root
        value={isCustom ? CUSTOM_LABEL : field.value}
        onValueChange={handleSelectChange}
        name={field.name}
      >
        <Select.Trigger placeholder='선택' style={{ width: '200px' }}>
          {isCustom ? CUSTOM_LABEL : field.value}
        </Select.Trigger>
        <Select.Content>
          {Object.entries(list).map(([groupLabel, options]) => (
            <div key={groupLabel}>
              <Select.Group key={groupLabel}>
                <Select.Label>{groupLabel}</Select.Label>
                {options
                  .toSorted((a, b) => a.label.localeCompare(b.label))
                  .map(({ value, label }) => (
                    <Select.Item key={value} value={value}>
                      {label}
                    </Select.Item>
                  ))}
              </Select.Group>
              <Select.Separator />
            </div>
          ))}
          <Select.Item value={CUSTOM_LABEL}>{CUSTOM_LABEL}</Select.Item>
        </Select.Content>
      </Select.Root>
      {isCustom && (
        <TextField.Root
          value={field.value === CUSTOM_LABEL ? customHotelNameRef.current : field.value}
          onChange={handleCustomInputChange}
        />
      )}
    </Flex>
  );
}
