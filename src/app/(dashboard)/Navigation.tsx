'use client';

import { Link as StyledLink } from '@radix-ui/themes';
import { NotebookPen, Sigma } from 'lucide-react';
import { usePathname } from 'next/navigation';
import styles from './navigation.module.css';

export default function Navigation() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className={styles.nav}>
      <ul className={styles.ul}>
        <li className={styles.li}>
          <StyledLink
            className={styles.link}
            href='/reservations'
            color='gray'
            highContrast
            weight={isActive('/reservations') ? 'bold' : 'regular'}
          >
            <NotebookPen /> 예약관리
          </StyledLink>
        </li>
        <li className={styles.li}>
          <StyledLink
            className={styles.link}
            href='/settlement'
            color='gray'
            highContrast
            weight={isActive('/settlement') ? 'bold' : 'regular'}
          >
            <Sigma /> 정산관리
          </StyledLink>
        </li>
      </ul>
    </nav>
  );
}
