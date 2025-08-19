'use client';

import { createClient } from '@/utils/supabase/client';
import { Button, Card, Grid, Text } from '@radix-ui/themes';
import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function LoginContainer() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`
      }
    });
    if (error) {
      console.error('Google OAuth login error:', error);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    } else {
      console.info('You have been logged out.');
    }
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
