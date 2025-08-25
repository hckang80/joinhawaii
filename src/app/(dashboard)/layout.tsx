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
          <Image src='/images/logo.png' width='90' height='40' alt='조인하와이'></Image>
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
