'use client';

import type { AdditionalOptions } from '@/types';
import { Badge, Flex } from '@radix-ui/themes';

export function ProductOptionBadge({ items }: { items: AdditionalOptions[] }) {
  if (!items?.length) return null;

  return (
    <Flex gap='1' mt='2'>
      {items.map(({ id, title }) => {
        return (
          <Badge key={id} size='2' color='gray'>
            {title}
          </Badge>
        );
      })}
    </Flex>
  );
}
