'use client';

import { useAuth } from '@/hooks';
import { Button, Flex } from '@radix-ui/themes';
import { User } from '@supabase/auth-js';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const displayName = (user: User | null) => {
    return user ? user.identities?.[0]?.identity_data?.full_name || user.email : '';
  };

  return (
    <header>
      <Flex justify='end' gap='2' p='4'>
        {displayName(user)}
        <Button variant='ghost' size='3' onClick={handleLogout}>
          logout
        </Button>
      </Flex>
    </header>
  );
}
