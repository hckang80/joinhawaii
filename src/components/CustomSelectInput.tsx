// CustomSelectInput.tsx

import { Flex, Select, TextField } from '@radix-ui/themes';
import type { RefCallBack } from 'react-hook-form';
import { CUSTOM_LABEL } from '../constants';

export type CustomSelectOption = { label: string; value: string };

type CustomSelectInputProps = {
  ref?: RefCallBack;
  value: string;
  options: readonly string[] | readonly CustomSelectOption[];
  customLabel?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  inputPlaceholder?: string;
};

export function CustomSelectInput({
  ref,
  value,
  options,
  customLabel = CUSTOM_LABEL,
  onChange,
  placeholder = '',
  inputPlaceholder = ''
}: CustomSelectInputProps) {
  // string[] 타입이면 {label, value}[]로 변환
  const normalizedOptions: CustomSelectOption[] =
    Array.isArray(options) && typeof options[0] === 'string'
      ? (options as string[]).map(opt => ({ label: opt, value: opt }))
      : (options as CustomSelectOption[]);

  const isCustom = value === customLabel || !normalizedOptions.some(opt => opt.value === value);

  return (
    <Flex direction='column' align='stretch' gap='1'>
      <Select.Root
        size='1'
        value={isCustom ? customLabel : (value ?? '')}
        onValueChange={val => {
          if (val === customLabel) onChange('');
          else onChange(val);
        }}
      >
        <Select.Trigger placeholder={placeholder}>
          {isCustom
            ? customLabel
            : (normalizedOptions.find(opt => opt.value === value)?.label ?? value)}
        </Select.Trigger>
        <Select.Content>
          {normalizedOptions
            .toSorted((a, b) => a.label.localeCompare(b.label))
            .map(opt => (
              <Select.Item key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Item>
            ))}
          <Select.Item value={customLabel}>{customLabel}</Select.Item>
        </Select.Content>
      </Select.Root>
      {isCustom && (
        <TextField.Root
          size='1'
          ref={ref}
          value={value === customLabel ? '' : value}
          placeholder={inputPlaceholder}
          onChange={e => onChange(e.target.value.trim())}
        />
      )}
    </Flex>
  );
}
