'use client';

import styles from './MensajeError.module.css';

interface MensajeErrorProps {
  mensaje: string;
  onReintentar?: () => void;
}

export function MensajeError({ mensaje, onReintentar }: MensajeErrorProps) {
  return (
    <div className={styles.contenedor} role="alert">
      <div className={styles.encabezado}>
        <span className={styles.icono} aria-hidden="true">
          !
        </span>
        <p className={styles.mensaje}>{mensaje}</p>
      </div>

      {onReintentar && (
        <button type="button" className={styles.boton} onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}
