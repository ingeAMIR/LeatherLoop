import Link from 'next/link';
import styles from './MensajeConflicto.module.css';

interface MensajeConflictoProps {
  mensaje: string; // texto exacto del contrato (CA-2)
}

// Conflicto: el lote ya fue reservado por otro usuario (CA-2).
export function MensajeConflicto({ mensaje }: MensajeConflictoProps) {
  return (
    <div className={styles.contenedor} role="alert">
      <div className={styles.encabezado}>
        <span className={styles.icono} aria-hidden="true">
          !
        </span>
        <p className={styles.mensaje}>{mensaje}</p>
      </div>

      <Link href="/" className={styles.enlace}>
        Buscar lotes alternativos
      </Link>
    </div>
  );
}
