import { Button } from '@radix-ui/themes';
import { Trash2 } from 'lucide-react';

export function ProductDeleteButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      type='button'
      size='1'
      color='ruby'
      variant='soft'
      style={{ minWidth: '2.5rem', padding: '0.4rem' }}
      onClick={onClick}
    >
      <Trash2 size='16' />
    </Button>
  );
}

export default ProductDeleteButton;
