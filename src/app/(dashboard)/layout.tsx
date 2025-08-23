import { Container, Flex } from '@radix-ui/themes';
import Image from 'next/image';
import Header from './Header';
import styles from './layout.module.css';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex className={styles.root}>
      <aside className={styles.aside}>
        <h1 className={styles.logo}>
          <Image src='/vercel.svg' width='12' height='12' alt='my service name'></Image>
        </h1>
      </aside>
      <Container>
        <Header />

        <main className={styles.main}>{children}</main>
      </Container>
    </Flex>
  );
}
