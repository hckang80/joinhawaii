import { Flex } from '@radix-ui/themes';
import Image from 'next/image';
import styles from './layout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex className={styles.root}>
      <aside className={styles.aside}>
        <h1 className={styles.logo}>
          <Image src='/vercel.svg' width='12' height='12' alt='my service name'></Image>
        </h1>
      </aside>
      <main className={styles.main}>{children}</main>
    </Flex>
  );
}
