import type { AdditionalOptions } from '@/types';
import { calculateTotalAmount } from '@/utils';
import { useEffect } from 'react';
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';

export default function AdditionalOptionsTotals({
  index,
  control,
  setValue
}: {
  index: number;
  control: Control<{ additionalOptions: AdditionalOptions[] }>;
  setValue: UseFormSetValue<{ additionalOptions: AdditionalOptions[] }>;
}) {
  const watchedValues = useWatch({
    control,
    name: [
      `additionalOptions.${index}.adult_count`,
      `additionalOptions.${index}.children_count`,
      `additionalOptions.${index}.adult_price`,
      `additionalOptions.${index}.children_price`,
      `additionalOptions.${index}.adult_cost`,
      `additionalOptions.${index}.children_cost`,
      `additionalOptions.${index}.exchange_rate`
    ]
  });

  useEffect(() => {
    const [
      adult_count,
      children_count,
      adult_price,
      children_price,
      adult_cost,
      children_cost,
      exchange_rate
    ] = watchedValues;

    const { total_amount, total_cost, total_amount_krw, cost_amount_krw } = calculateTotalAmount({
      adult_count,
      children_count,
      adult_price,
      children_price,
      adult_cost,
      children_cost,
      exchange_rate
    });

    setValue(`additionalOptions.${index}.total_amount`, total_amount, { shouldValidate: true });
    setValue(`additionalOptions.${index}.total_cost`, total_cost, { shouldValidate: true });
    setValue(`additionalOptions.${index}.total_amount_krw`, total_amount_krw, {
      shouldValidate: true
    });
    setValue(`additionalOptions.${index}.cost_amount_krw`, cost_amount_krw, {
      shouldValidate: true
    });
  }, [watchedValues, setValue, index]);

  return null;
}
