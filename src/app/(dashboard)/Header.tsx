'use client';

import { createClient } from '@/utils/supabase/client';
import { Button, Flex } from '@radix-ui/themes';
import { User } from '@supabase/supabase-js';

export default function Header({ user }: { user: User }) {
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    } else {
      console.info('You have been logged out.');
    }
  };

  return (
    <header>
      <Flex justify='end' gap='2' p='4'>
        {user.email}
        <Button variant='ghost' size='3' onClick={handleLogout}>
          logout
        </Button>
      </Flex>
    </header>
  );
}
