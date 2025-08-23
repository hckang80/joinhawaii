import { Button, Flex } from '@radix-ui/themes';
import { User } from '@supabase/supabase-js';

export default function Header({ user }: { user: User }) {
  return (
    <header>
      <Flex justify='end' gap='2' p='4'>
        {user.email}
        <Button variant='ghost' size='3'>
          logout
        </Button>
      </Flex>
    </header>
  );
}
