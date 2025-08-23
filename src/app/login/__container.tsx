'use client';

import { useAuth } from '@/hooks';
import { Button, Card, Grid, Text } from '@radix-ui/themes';
import styles from './page.module.css';

export default function LoginContainer() {
  const { user, login, logout } = useAuth();

  const handleGoogleLogin = () => {
    login();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Grid align='center' className={styles.root} p='5'>
      <Card size='3'>
        <Text as='div' size='6' weight='bold' mb='2'>
          Login
        </Text>
        <Text as='div' color='gray' size='2'>
          This demo uses Google for authentication.
        </Text>

        <Grid gap='2'>
          <Button
            onClick={handleGoogleLogin}
            mt='5'
            color='tomato'
            size='3'
            className={styles.button}
          >
            Google
          </Button>

          {!!user && (
            <Button onClick={handleLogout} size='3' variant='outline' className={styles.button}>
              Logout
            </Button>
          )}
        </Grid>
      </Card>
    </Grid>
  );
}
