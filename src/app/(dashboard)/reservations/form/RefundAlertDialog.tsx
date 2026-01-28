import { AlertDialog, Button, Flex } from '@radix-ui/themes';

interface RefundAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  onConfirm: () => void;
  children?: React.ReactNode;
}

export default function RefundAlertDialog({
  open,
  onOpenChange,
  title,
  description = '지불된 추가 옵션이 존재합니다. 추가 옵션이 먼저 환불완료로 변경되야합니다.',
  onConfirm,
  children
}: RefundAlertDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content maxWidth='450px'>
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description size='2'>{description}</AlertDialog.Description>
        {children}
        <Flex gap='1' mt='4' justify='end'>
          <AlertDialog.Cancel>
            <Button variant='soft' color='gray'>
              취소
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button onClick={onConfirm}>확인</Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
