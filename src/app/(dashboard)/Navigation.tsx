'use client';

import { Link as StyledLink } from '@radix-ui/themes';
import { CalendarRange, NotebookPen, Sigma } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createElement } from 'react';
import styles from './navigation.module.css';

export default function Navigation() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname.startsWith(path);
  const navigation = [
    {
      icon: CalendarRange,
      label: '일정확인',
      href: '/calendar'
    },
    {
      icon: NotebookPen,
      label: '예약관리',
      href: '/reservations'
    },
    {
      icon: Sigma,
      label: '정산관리',
      href: '/settlement'
    }
  ];

  return (
    <nav className={styles.nav}>
      <ul className={styles.ul}>
        {navigation.map(({ icon, label, href }) => (
          <li className={styles.li} key={href}>
            <StyledLink
              asChild
              className={styles.link}
              color='gray'
              highContrast
              weight={isActive(href) ? 'bold' : 'regular'}
            >
              <Link href={href}>
                {createElement(icon)} {label}
              </Link>
            </StyledLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
