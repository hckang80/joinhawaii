'use client';

import { useAuth } from '@/hooks';
import { Button, Flex } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <header>
      <Flex justify='end' gap='2' p='4'>
        {user?.email}
        <Button variant='ghost' size='3' onClick={handleLogout}>
          logout
        </Button>
      </Flex>
    </header>
  );
}
