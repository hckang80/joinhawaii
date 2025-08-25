import { NotebookPen, Sigma } from 'lucide-react';
import Link from 'next/link';
import styles from './navigation.module.css';

export default function Navigation() {
  return (
    <nav className={styles.nav}>
      <ul className={styles.ul}>
        <li className={styles.li}>
          <Link href='/reservations' title='예약관리'>
            <NotebookPen />
          </Link>
        </li>
        <li className={styles.li}>
          <Link href='/settlement' title='정산관리'>
            <Sigma />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
