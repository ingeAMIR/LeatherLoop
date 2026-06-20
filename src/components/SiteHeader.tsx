import Link from 'next/link';
import Image from 'next/image';
import styles from './SiteHeader.module.css';

/** Encabezado global: el logo va siempre arriba a la izquierda y enlaza al catálogo. */
export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.marca} aria-label="LeatherLoop — ir al inicio">
        <Image
          src="/LeatherLoop.jpeg"
          alt="LeatherLoop"
          width={70}
          height={64}
          priority
          className={styles.logo}
        />
      </Link>
    </header>
  );
}
