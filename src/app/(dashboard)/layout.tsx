import { Box, Flex } from '@radix-ui/themes';
import Image from 'next/image';
import Header from './Header';
import styles from './layout.module.css';
import Navigation from './Navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex className={styles.root}>
      <aside className={styles.aside}>
        <h1 className={styles.logo}>
          <Image src='/vercel.svg' width='12' height='12' alt='my service name'></Image>
        </h1>
        <Navigation />
      </aside>
      <Box flexGrow='1'>
        <Header />

        <main className={styles.main}>{children}</main>
      </Box>
    </Flex>
  );
}
