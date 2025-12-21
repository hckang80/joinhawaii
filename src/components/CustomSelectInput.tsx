// CustomSelectInput.tsx
import { Flex, Select, TextField } from '@radix-ui/themes';
import { CUSTOM_LABEL } from '../constants';

export function CustomSelectInput({
  value,
  options,
  customLabel = CUSTOM_LABEL,
  onChange,
  placeholder = '',
  inputPlaceholder = ''
}: {
  value: string;
  options: string[];
  customLabel?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  inputPlaceholder?: string;
}) {
  const isCustom = value === customLabel || !options.includes(value ?? '');
  return (
    <Flex direction='column' align='stretch' gap='1'>
      <Select.Root
        value={isCustom ? customLabel : (value ?? '')}
        onValueChange={val => {
          if (val === customLabel) onChange('');
          else onChange(val);
        }}
      >
        <Select.Trigger placeholder={placeholder}>{isCustom ? customLabel : value}</Select.Trigger>
        <Select.Content>
          {options.map(opt => (
            <Select.Item key={opt} value={opt}>
              {opt}
            </Select.Item>
          ))}
          <Select.Item value={customLabel}>{customLabel}</Select.Item>
        </Select.Content>
      </Select.Root>
      {isCustom && (
        <TextField.Root
          value={value === customLabel ? '' : value}
          placeholder={inputPlaceholder}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </Flex>
  );
}
