'use client';

import { useAuth } from '@/hooks';
import { observable } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import { Button, Card, Grid, Text } from '@radix-ui/themes';
import { Loader } from 'lucide-react';
import Image from 'next/image';
import styles from './page.module.css';

const status$ = observable({
  isLoggedIn: false
});

export default function LoginContainer() {
  const { user, login, logout } = useAuth();

  const handleGoogleLogin = () => {
    status$.isLoggedIn.set(() => true);
    login();
  };

  const handleLogout = () => {
    logout();
  };

  const isLoggedIn = use$(status$.isLoggedIn);

  return (
    <Grid align='center' className={styles.root} p='5'>
      <Card size='3'>
        <Text as='div' size='6' weight='bold' mb='2'>
          Login
        </Text>
        <Text as='div' color='gray' size='2'>
          구글 인증을 통해 관리자 로그인이 가능합니다.
        </Text>

        <Grid gap='2'>
          <Button
            disabled={isLoggedIn}
            onClick={handleGoogleLogin}
            mt='5'
            size='3'
            className={styles['google-button']}
          >
            {isLoggedIn ? (
              <Loader className='animate-spin' />
            ) : (
              <>
                <Image src='/images/google.svg' width='20' height='20' alt='' />
                Sign in with Google
              </>
            )}
          </Button>

          {!!user && (
            <Button onClick={handleLogout} size='3' variant='outline'>
              Logout
            </Button>
          )}
        </Grid>
      </Card>
    </Grid>
  );
}
