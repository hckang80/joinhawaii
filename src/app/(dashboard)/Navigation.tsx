import { NotebookPen, Sigma } from 'lucide-react';
import Link from 'next/link';
import styles from './navigation.module.css';

export default function Navigation() {
  return (
    <nav className={styles.nav}>
      <ul className={styles.ul}>
        <li className={styles.li}>
          <Link className={styles.link} href='/reservations'>
            <NotebookPen /> 예약관리
          </Link>
        </li>
        <li className={styles.li}>
          <Link className={styles.link} href='/settlement'>
            <Sigma /> 정산관리
          </Link>
        </li>
      </ul>
    </nav>
  );
}
