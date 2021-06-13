import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <nav className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">
          <a>
            <img src="/spacetraveling.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </nav>
  )
}
