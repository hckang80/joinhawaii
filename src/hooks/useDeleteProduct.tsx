/* eslint-disable @typescript-eslint/no-explicit-any */
import { QUERY_KEYS } from '@/constants';
import { deleteProduct } from '@/http';
import type { ReservationFormData } from '@/types';
import { AlertDialog, Button, Flex } from '@radix-ui/themes';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { toast } from 'react-toastify';

type Table = 'flights' | 'hotels' | 'tours' | 'rental_cars' | 'insurances';

export default function useDeleteProduct(opts: {
  table: Table;
  reservationId: string;
  getValues: UseFormGetValues<ReservationFormData>;
  setValue: UseFormSetValue<ReservationFormData>;
}) {
  const { table, reservationId, getValues, setValue } = opts;
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [pendingLabel, setPendingLabel] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const getItemLabel = (item: any): string => {
    const date = (d: string | null | undefined) => d?.slice(0, 10) ?? '';
    switch (table) {
      case 'flights':
        return [item.flight_number, date(item.departure_datetime)].filter(Boolean).join(' / ');
      case 'hotels':
        return [item.hotel_name, date(item.check_in_date)].filter(Boolean).join(' / ');
      case 'tours':
        return [item.name, date(item.start_date)].filter(Boolean).join(' / ');
      case 'rental_cars':
        return [item.model, date(item.pickup_date)].filter(Boolean).join(' / ');
      case 'insurances':
        return [item.company, date(item.start_date)].filter(Boolean).join(' / ');
    }
  };

  const openDeleteDialog = (index: number) => {
    const items = (getValues(table as any) as any[]) || [];
    setPendingLabel(getItemLabel(items[index]));
    setPendingIndex(index);
    setIsOpen(true);
  };

  const handleDelete = async (index?: number) => {
    const idx = typeof index === 'number' ? index : pendingIndex;
    if (idx === null || typeof idx !== 'number') {
      setIsOpen(false);
      setPendingIndex(null);
      return;
    }

    const items = (getValues(table as any) as any[]) || [];
    const item = items[idx];
    const id = item?.id;

    if (typeof id === 'number') {
      try {
        await deleteProduct({ table, id });
        toast.success('항목이 삭제되었습니다.');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.detail(reservationId) });
      } catch (error) {
        console.error('삭제 실패:', error);
        toast.error('삭제에 실패했습니다.');
        return;
      }
    }

    setValue(
      table as any,
      items.filter((_, i) => i !== idx)
    );
    setPendingIndex(null);
    setIsOpen(false);
  };

  const DeleteDialog = (
    <AlertDialog.Root
      open={isOpen}
      onOpenChange={(v: boolean) => {
        setIsOpen(v);
        if (!v) setPendingIndex(null);
      }}
    >
      <AlertDialog.Content maxWidth='450px'>
        <AlertDialog.Title>삭제 확인</AlertDialog.Title>
        <AlertDialog.Description size='2'>
          <strong>{pendingLabel}</strong>을(를) 삭제하시겠습니까? 삭제한 항목은 복구할 수 없습니다.
        </AlertDialog.Description>
        <Flex gap='1' mt='4' justify='end'>
          <AlertDialog.Cancel>
            <Button variant='soft' color='gray'>
              취소
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button color='ruby' onClick={() => handleDelete()}>
              삭제
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );

  return { openDeleteDialog, DeleteDialog } as const;
}
