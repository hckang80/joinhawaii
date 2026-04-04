'use client';

import { Flex, Select, TextField } from '@radix-ui/themes';
import { type RefObject, useRef } from 'react';
import type { ControllerRenderProps, FieldPath, FieldValues } from 'react-hook-form';
import { CUSTOM_LABEL, GroupSelectOption } from '../constants';

export function GroupSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  field,
  list,
  includeAllOption,
  customValueRef: externalCustomValueRef
}: {
  field: ControllerRenderProps<TFieldValues, TName>;
  list: Record<string, GroupSelectOption[]>;
  includeAllOption?: boolean;
  customValueRef?: RefObject<string>;
}) {
  const internalCustomValueRef = useRef('');
  const customValueRef = externalCustomValueRef ?? internalCustomValueRef;

  const isCustom =
    field.value !== '전체' &&
    (field.value === CUSTOM_LABEL ||
      !Object.values(list)
        .flat()
        .some(opt => opt.value === field.value));

  const handleSelectChange = (value: string) => {
    if (value === CUSTOM_LABEL) {
      field.onChange(customValueRef.current || '');
    } else {
      if (isCustom && field.value && field.value !== CUSTOM_LABEL) {
        customValueRef.current = field.value;
      }
      field.onChange(value);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    customValueRef.current = e.target.value;
    field.onChange(e.target.value);
  };

  return (
    <Flex gap='2' align='center' wrap='wrap'>
      <Select.Root
        value={isCustom ? CUSTOM_LABEL : field.value}
        onValueChange={handleSelectChange}
        name={field.name}
      >
        <Select.Trigger placeholder='선택' className='w-full'>
          {isCustom ? CUSTOM_LABEL : field.value}
        </Select.Trigger>
        <Select.Content>
          {includeAllOption && <Select.Item value='전체'>전체</Select.Item>}
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
          value={field.value === CUSTOM_LABEL ? customValueRef.current : field.value}
          onChange={handleCustomInputChange}
        />
      )}
    </Flex>
  );
}
